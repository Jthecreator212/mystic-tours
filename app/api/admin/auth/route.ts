import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL!,
  password: process.env.ADMIN_PASSWORD_HASH!,
  accessKey: process.env.ADMIN_ACCESS_KEY!
};

export async function POST(request: NextRequest) {
  try {
    const { email, password, accessKey } = await request.json();

    // TACTICAL: Triple verification
    if (accessKey !== ADMIN_CREDENTIALS.accessKey ||
        email !== ADMIN_CREDENTIALS.email ||
        !await bcrypt.compare(password, ADMIN_CREDENTIALS.password)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 401 });
    }

    const token = sign(
      { email, loginTime: Date.now() },
      process.env.ADMIN_SESSION_SECRET!,
      { expiresIn: '8h' } // Tactical: 8-hour sessions
    );

    const response = NextResponse.json({ success: true });
    response.cookies.set('mt-admin-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 // 8 hours
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('mt-admin-session');
  return response;
} 
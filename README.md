# Mystic Tours - Jamaica Tour Booking Platform

A modern, responsive tour booking website built with Next.js 15, React 19, TypeScript, and Supabase.

## Features

- **Tour Booking System** - Complete booking flow with instant Telegram notifications.
- **Telegram Integration** - Free, real-time notifications sent to your private agent group.
- **Content Management** - Tours, gallery, team members, testimonials.
- **Responsive Design** - Mobile-first approach with vintage Jamaican aesthetic.
- **Real-time Data** - Live data from Supabase database.

## Telegram Booking Integration

The platform includes a **free and direct Telegram integration** that automatically sends booking notifications to your agent group when customers make bookings.

### How it Works

1.  **Customer fills out booking form** on any tour page.
2.  **Booking is saved** to the database.
3.  **Telegram message is instantly sent** to your private agent group via your custom bot.
4.  **Agent calls customer** to confirm and discuss payment.

### Quick Setup

1.  **Create a Telegram Bot** - Follow the simple guide in `docs/TELEGRAM_SETUP.md`.
2.  **Add your credentials** - Update the `.env.local` file with your Bot Token and Chat ID.
3.  **Test the flow** - Make a test booking and see the notification arrive instantly.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom vintage theme
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Notifications**: Telegram Bot API
- **UI Components**: Radix UI, Lucide React icons
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm package manager
- Supabase account
- Telegram account

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd mystic-tours
    ```

2.  **Install dependencies**
    ```bash
    pnpm install
    ```

3.  **Set up environment variables**
    Create a `.env.local` file by copying `.env.example` or creating it from scratch. Add your Supabase and Telegram credentials:
    ```bash
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

    # Telegram Bot for Booking Notifications
    TELEGRAM_BOT_TOKEN=your_bot_token_here
    TELEGRAM_CHAT_ID=your_group_chat_id_here
    ```

4.  **Run the development server**
    ```bash
    pnpm dev
    ```

5.  **Open your browser**
    Navigate to [http://localhost:3000](http://localhost:3000)

## Database Setup

The project includes SQL scripts to set up the database schema:

```bash
# Run the database setup script
psql -h your-supabase-host -U postgres -d postgres -f scripts/create-tables.sql
```

## Project Structure

```
mystic-tours/
├── app/                    # Next.js app directory
│   ├── actions/           # Server actions (booking, etc.)
│   ├── tours/             # Tour pages
│   └── ...
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...
├── lib/                  # Utility functions
├── docs/                 # Documentation (see TELEGRAM_SETUP.md)
├── scripts/              # Database and utility scripts
└── public/               # Static assets
```

## Key Features

### Tour Booking System
- **Real-time availability** - Check tour dates and capacity
- **Customer information** - Collect name, email, phone, special requests
- **Automatic calculations** - Total amount based on guests and tour price
- **Telegram notifications** - Instant alerts to your agent group

### Content Management
- **Tours** - Full tour details with images, itineraries, highlights
- **Gallery** - Photo galleries organized by categories
- **Team** - Staff profiles and bios
- **Testimonials** - Customer reviews and ratings

## Telegram Message Format

When a booking is made, the system sends a formatted message to your group:

```
*🚨 NEW TOUR BOOKING REQUEST 🚨*

*Tour:* Blue Mountains Adventure
*Customer:* John Doe
*Phone:* `+1 (555) 123-4567`
*Email:* john@example.com
*Date:* December 25, 2024
*Guests:* 2
*Total Amount:* $200.00
*Booking ID:* `abc123-def456`

*Special Requests:*
Vegetarian meal preference

Please call the customer to confirm booking and discuss payment options.

*Action Required:* 📞 Call `+1 (555) 123-4567`
```

## Deployment

### Vercel (Recommended)

1.  **Connect your repository** to Vercel.
2.  **Add environment variables** in the Vercel project settings.
3.  **Deploy** - Vercel will automatically build and deploy your site.

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1.  Fork the repository.
2.  Create a feature branch.
3.  Make your changes.
4.  Test thoroughly.
5.  Submit a pull request.

## License

This project is licensed under the MIT License.

## Support

For support with the Telegram integration or any other features, please refer to:
- `docs/TELEGRAM_SETUP.md` - Detailed Telegram setup guide.
- `docs/DATABASE_SCHEMA.md` - Database documentation.
- The Issues section for bug reports and feature requests. 
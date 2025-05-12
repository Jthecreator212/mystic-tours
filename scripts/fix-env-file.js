const fs = require('fs');
const path = require('path');

// Path to the .env.local file
const envFilePath = path.join(__dirname, '..', 'app', '.env.local');

try {
  // Read the current content of the file
  const currentContent = fs.readFileSync(envFilePath, 'utf8');
  
  // Check for duplicate NEXT_PUBLIC_SUPABASE_ANON_KEY
  const lines = currentContent.split('\n');
  const uniqueLines = [];
  const seenKeys = new Set();
  
  // Filter out duplicate keys and fix the NEXT_PUBLIC_SITE_URL
  let siteUrlAdded = false;
  
  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) continue;
    
    // Extract the key from the line
    const keyMatch = line.match(/^([^=]+)=/);
    if (!keyMatch) {
      uniqueLines.push(line);
      continue;
    }
    
    const key = keyMatch[1];
    
    // Check if this is the problematic line with NEXT_PUBLIC_SITE_URL appended
    if (line.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY') && line.includes('NEXT_PUBLIC_SITE_URL')) {
      // Split the line into two separate lines
      const parts = line.split('NEXT_PUBLIC_SITE_URL=');
      if (parts.length === 2) {
        // Only add the ANON_KEY if we haven't seen it before
        if (!seenKeys.has('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
          uniqueLines.push(parts[0]);
          seenKeys.add('NEXT_PUBLIC_SUPABASE_ANON_KEY');
        }
        
        // Add the SITE_URL
        uniqueLines.push(`NEXT_PUBLIC_SITE_URL=${parts[1]}`);
        siteUrlAdded = true;
      }
    } else {
      // For normal lines, only add if we haven't seen the key before
      if (!seenKeys.has(key)) {
        uniqueLines.push(line);
        seenKeys.add(key);
      }
    }
  }
  
  // Add NEXT_PUBLIC_SITE_URL if it wasn't added yet
  if (!siteUrlAdded && !seenKeys.has('NEXT_PUBLIC_SITE_URL')) {
    uniqueLines.push('NEXT_PUBLIC_SITE_URL=http://localhost:3000');
  }
  
  // Join the lines back together
  const newContent = uniqueLines.join('\n') + '\n';
  
  // Write the fixed content back to the file
  fs.writeFileSync(envFilePath, newContent);
  
  console.log('✅ .env.local file has been fixed successfully!');
  console.log('Removed duplicate keys and added NEXT_PUBLIC_SITE_URL correctly.');
  
} catch (error) {
  console.error('❌ Error fixing .env.local file:', error.message);
}

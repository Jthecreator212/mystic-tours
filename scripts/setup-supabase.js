const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Create a bin directory if it doesn't exist
const binDir = path.join(__dirname, '..', 'bin');
if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}

// Path to save the Supabase CLI executable
const supabaseBinPath = path.join(binDir, 'supabase.exe');

console.log('Downloading Supabase CLI...');

// Download the Supabase CLI for Windows
const downloadUrl = 'https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.exe';
const file = fs.createWriteStream(supabaseBinPath);

https.get(downloadUrl, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Failed to download Supabase CLI: ${response.statusCode} ${response.statusMessage}`);
    fs.unlinkSync(supabaseBinPath);
    process.exit(1);
  }

  response.pipe(file);

  file.on('finish', () => {
    file.close();
    console.log('Download completed.');
    
    // Make the file executable
    fs.chmodSync(supabaseBinPath, '755');
    console.log('Supabase CLI is now executable.');
    
    // Test the CLI
    try {
      console.log('Testing Supabase CLI...');
      const output = execSync(`${supabaseBinPath} --version`, { encoding: 'utf8' });
      console.log(`Supabase CLI version: ${output.trim()}`);
      console.log('Supabase CLI is ready to use!');
      console.log(`You can use it with: node bin/supabase.exe [command]`);
    } catch (error) {
      console.error('Error testing Supabase CLI:', error.message);
    }
  });
}).on('error', (err) => {
  fs.unlinkSync(supabaseBinPath);
  console.error(`Error downloading Supabase CLI: ${err.message}`);
  process.exit(1);
});

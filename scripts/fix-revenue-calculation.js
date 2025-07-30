const fs = require('fs');
const path = require('path');

console.log('💰 Fixing Revenue Calculation in Stats API...\n');

const statsFilePath = 'app/api/admin/stats/route.ts';

if (!fs.existsSync(statsFilePath)) {
  console.log(`❌ File not found: ${statsFilePath}`);
  process.exit(1);
}

// Read the current file
let content = fs.readFileSync(statsFilePath, 'utf8');

// Check if revenue calculation is already fixed
if (content.includes('totalRevenue: tourRevenue + airportRevenue')) {
  console.log('✅ Revenue calculation is already fixed!');
  process.exit(0);
}

// Replace the old stats calculation with the new one
const oldStatsCalculation = `    const stats = {
      totalBookings: allBookings.length,
      totalTourBookings: tourBookings?.length || 0,
      totalPickups: airportBookings?.length || 0,
      totalTours: tours?.length || 0,
      totalDrivers: drivers?.length || 0,
      totalImages: images?.length || 0,
      totalRevenue: 0, // TODO: Add revenue calculation from bookings
      completedBookings: allBookings.filter(b => b.status === 'completed').length,
      pendingBookings: allBookings.filter(b => b.status === 'pending').length,
      cancelledBookings: allBookings.filter(b => b.status === 'cancelled').length,
    };`;

const newStatsCalculation = `    // Calculate revenue from tour bookings (total_amount field)
    const tourRevenue = tourBookings?.reduce((sum, booking) => {
      return sum + (booking.total_amount || 0);
    }, 0) || 0;

    // Calculate revenue from airport pickup bookings (total_price field)
    const airportRevenue = airportBookings?.reduce((sum, booking) => {
      return sum + (booking.total_price || 0);
    }, 0) || 0;

    const stats = {
      totalBookings: allBookings.length,
      totalTourBookings: tourBookings?.length || 0,
      totalPickups: airportBookings?.length || 0,
      totalTours: tours?.length || 0,
      totalDrivers: drivers?.length || 0,
      totalImages: images?.length || 0,
      totalRevenue: tourRevenue + airportRevenue,
      completedBookings: allBookings.filter(b => b.status === 'completed').length,
      pendingBookings: allBookings.filter(b => b.status === 'pending').length,
      cancelledBookings: allBookings.filter(b => b.status === 'cancelled').length,
    };`;

// Replace the old calculation with the new one
if (content.includes('totalRevenue: 0')) {
  content = content.replace(oldStatsCalculation, newStatsCalculation);
  
  // Write the updated content back to the file
  fs.writeFileSync(statsFilePath, content, 'utf8');
  
  console.log('✅ Revenue calculation fixed successfully!');
  console.log('💰 Now calculating actual revenue from:');
  console.log('   - Tour bookings (total_amount field)');
  console.log('   - Airport pickup bookings (total_price field)');
  console.log('\n🔄 Refresh your dashboard to see the updated revenue!');
} else {
  console.log('❌ Could not find the old revenue calculation to replace');
  console.log('Please check the file manually');
} 
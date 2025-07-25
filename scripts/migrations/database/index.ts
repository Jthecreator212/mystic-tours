// Database migration scripts
// These are SQL files that need to be executed directly
// Use them with: psql -f scripts/migrations/database/[filename].sql

export const DATABASE_MIGRATIONS = {
  createTables: './create-tables.sql',
  insertToursData: './insert-tours-data.sql',
  populateToursData: './populate-tours-data.sql',
  fixDatabaseSchema: './fix-database-schema.sql',
  ensureCorrectSchema: './ensure-correct-schema.sql',
  checkAndFixAll: './check-and-fix-all.sql',
  createContentTable: './create-content-table.sql',
  createTeamTable: './create-team-table.sql',
  createBookingSpecialRequestsTable: './create-booking-special-requests-table.sql',
  addNotesToAirportPickupBookings: './add-notes-to-airport-pickup-bookings.sql',
} as const; 
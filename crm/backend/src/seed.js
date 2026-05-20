const Company  = require('./models/Company');
const Contact  = require('./models/Contact');
const Deal     = require('./models/Deal');
const Activity = require('./models/Activity');

/**
 * Seeding disabled permanently (no dummy data)
 */
async function seedIfEmpty() {
  return; // ❌ disabled to prevent dummy data insertion
}

/**
 * Seed function disabled (kept for safety but never used)
 */
async function seed() {
  return; // ❌ disabled
}

/**
 * Direct execution block disabled (prevents manual reset seeding)
 */
if (require.main === module) {
  console.log('Seed script disabled ❌ - no data will be inserted');
  process.exit(0);
}

module.exports = { seedIfEmpty };
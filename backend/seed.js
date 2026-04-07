/**
 * Run this ONCE to create the admin user:
 *   node seed.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Lead = require('./models/Lead');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Create admin user
  const existing = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@crm.com' });
  if (!existing) {
    await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@crm.com',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    });
    console.log('✅ Admin user created: admin@crm.com / admin123');
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // Create sample leads
  const count = await Lead.countDocuments();
  if (count === 0) {
    await Lead.insertMany([
      { name: 'Alice Johnson', email: 'alice@techcorp.com', phone: '+1 555 0101', company: 'TechCorp', source: 'Website', status: 'new', message: 'Interested in your enterprise plan.' },
      { name: 'Bob Martinez', email: 'bob@designstudio.io', company: 'Design Studio', source: 'Referral', status: 'contacted', message: 'Looking for a CRM solution for his team.' },
      { name: 'Carol White', email: 'carol@startup.co', phone: '+1 555 0303', source: 'Social Media', status: 'converted', message: 'Ready to sign up for the pro plan.' },
      { name: 'David Kim', email: 'david@agency.com', company: 'Digital Agency', source: 'Cold Call', status: 'lost', message: 'Went with a competitor.' },
      { name: 'Eva Chen', email: 'eva@freelance.dev', source: 'Email', status: 'new', message: 'Asked about freelancer pricing.' },
    ]);
    console.log('✅ Sample leads created');
  } else {
    console.log('ℹ️  Leads already exist, skipping sample data');
  }

  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

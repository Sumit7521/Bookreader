require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  const reviews = await db.collection('reviews').find({ isPublic: true }).toArray();
  console.log("Total public reviews:", reviews.length);

  process.exit(0);
}
run();

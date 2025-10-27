import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config(); // load .env

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

// define a simple schema
const testSchema = new mongoose.Schema({
  name: String,
  createdAt: { type: Date, default: Date.now },
});

const TestModel = mongoose.model('TestConnection', testSchema);

async function main() {
  try {
    console.log(`🔌 Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri);

    const doc = await TestModel.create({ name: 'Connection OK' });
    console.log('✅ Inserted test document:', doc);

    await mongoose.disconnect();
    console.log('🔒 Connection closed');
  } catch (err) {
    console.error('🔥 Error connecting or inserting:', err);
    process.exit(1);
  }
}

main();

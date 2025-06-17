import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { getGlobals } from 'common-es';
import path from 'path';

const { __dirname } = getGlobals(import.meta.url);
dotenv.config({ path: path.join(__dirname, '../.env') });

(async () => {
  try {
    const mongoUri = process.env.DB_URL;
    if (!mongoUri) {
      throw new Error('DB_URL is not defined in the environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
})();

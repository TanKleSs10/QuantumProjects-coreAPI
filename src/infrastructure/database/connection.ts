import mongoose from 'mongoose';

/**
 * Initializes the MongoDB connection using environment configuration.
 * Call this during application bootstrap.
 */
export const connectDatabase = async (): Promise<typeof mongoose> => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is not defined');
  }

  // TODO: Extend options as needed (e.g., auth, pooling, etc.).
  return mongoose.connect(uri);
};

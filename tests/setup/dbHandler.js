/**
 * dbHandler.js
 * MongoDB Memory Server helpers for integration tests.
 * Provides connect / close / clear utilities so tests
 * never touch the real production/staging database.
 */
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

/**
 * Start an in-memory MongoDB instance and connect Mongoose to it.
 */
export const connect = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  
  // Set connection timeouts to prevent hanging
  mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
  });
};

/**
 * Drop every collection — call between test suites for isolation.
 */
export const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    try {
      await collections[key].deleteMany({});
    } catch (err) {
      console.warn(`Failed to clear collection ${key}:`, err.message);
    }
  }
};

/**
 * Close the connection and stop the in-memory server.
 * Ensures all pending operations complete before closing.
 */
export const closeDatabase = async () => {
  try {
    // Wait for pending operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Close all connections gracefully
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    
    // Stop the in-memory server
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (err) {
    console.warn('Error closing database:', err.message);
    // Force close even if there are errors
    if (mongoServer) {
      await mongoServer.stop().catch(() => {});
    }
  }
};

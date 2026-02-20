import { MongoClient } from 'mongodb';

const mongoClient = new MongoClient(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@127.0.0.1:27017/${process.env.MONGO_DB}?authSource=admin`);

try {
  await mongoClient.connect();
} catch (error) {
  console.error('Failed to connect to mongodb:', error.message);
  console.error('(is mongodb running?)');
  process.exit(1);
}

export const db = mongoClient.db(process.env.MONGO_DB);
export const users = db.collection(process.env.MONGO_COLLECTION);

// enforce unique usernames 
await users.createIndex({ username: 1 }, { unique: true });

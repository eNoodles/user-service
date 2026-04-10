import { MongoClient } from 'mongodb';

const mongoAddress = process.env.MONGO_HOST; 
const mongoPort = process.env.MONGO_PORT; 
const mongoUser = process.env.MONGO_USER; 
const mongoPassword = process.env.MONGO_PASS; 
const dbName = process.env.MONGO_DB; 

const connectionString = 
`mongodb://${mongoUser}:${mongoPassword}@${mongoAddress}:${mongoPort}/${dbName}?authSource=admin`;

const mongoClient = new MongoClient(connectionString);

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

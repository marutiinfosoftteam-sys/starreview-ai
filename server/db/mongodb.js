// MongoDB Database Client & Architecture for StarReview AI
// Implements connection pooling, tenant isolation, and collections

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
let client = null;
let clientPromise = null;
let dbInstance = null;

export const isMongoConfigured = Boolean(uri && uri.startsWith('mongodb'));

/**
 * Get shared MongoDB connection with pooling
 */
export async function getDb() {
  if (!isMongoConfigured) {
    return null;
  }

  if (dbInstance) {
    return dbInstance;
  }

  try {
    if (!clientPromise) {
      client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000
      });
      clientPromise = client.connect();
    }
    const connectedClient = await clientPromise;
    const dbName = process.env.MONGODB_DB_NAME || 'starreview_ai';
    dbInstance = connectedClient.db(dbName);

    // Initialize indexes in background
    initIndexes(dbInstance).catch(err => {
      console.warn('[MongoDB] Index initialization warning:', err.message);
    });

    console.log(`[MongoDB] Connected successfully to database: ${dbName}`);
    return dbInstance;
  } catch (err) {
    console.error('[MongoDB] Connection error:', err.message);
    dbInstance = null;
    clientPromise = null;
    return null;
  }
}

/**
 * Initialize Collections & Indexes for Tenant Isolation & Fast Lookups
 */
async function initIndexes(db) {
  try {
    // 1. Users collection
    await db.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true });
    await db.collection('users').createIndex({ firebaseUid: 1 }, { unique: true, sparse: true });

    // 2. Businesses collection (tenant-scoped)
    await db.collection('businesses').createIndex({ userId: 1 });
    await db.collection('businesses').createIndex({ slug: 1 }, { unique: true });

    // 3. Feedback / Negative Reviews (tenant-scoped)
    await db.collection('feedback').createIndex({ businessId: 1 });
    await db.collection('feedback').createIndex({ createdAt: -1 });

    // 4. Payments & Transactions (tenant-scoped)
    await db.collection('payments').createIndex({ userId: 1 });
    await db.collection('payments').createIndex({ orderId: 1 }, { sparse: true });

    // 5. Audit & Security logs
    await db.collection('audit_logs').createIndex({ userId: 1, timestamp: -1 });

    // 6. Agency Applications
    await db.collection('agency_applications').createIndex({ email: 1 });
    await db.collection('agency_applications').createIndex({ createdAt: -1 });
  } catch (e) {
    // Index may already exist
  }
}

/**
 * Tenant-Isolated Query Helpers
 */
export async function getTenantBusiness(db, userId) {
  if (!db || !userId) return null;
  return db.collection('businesses').findOne({ userId });
}

export async function saveTenantBusiness(db, userId, businessData) {
  if (!db || !userId) return null;
  const now = new Date().toISOString();
  return db.collection('businesses').findOneAndUpdate(
    { userId },
    {
      $set: { ...businessData, userId, updatedAt: now },
      $setOnInsert: { createdAt: now }
    },
    { upsert: true, returnDocument: 'after' }
  );
}

export async function getTenantFeedback(db, businessId, limit = 50) {
  if (!db || !businessId) return [];
  return db.collection('feedback')
    .find({ businessId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function logAuditEvent(db, { userId, action, ip, details }) {
  if (!db) return;
  try {
    await db.collection('audit_logs').insertOne({
      userId: userId || 'anonymous',
      action,
      ip: ip || 'unknown',
      details: details || {},
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[Audit Log] Failed to record:', err.message);
  }
}

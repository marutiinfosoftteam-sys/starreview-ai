// Local SQLite storage, used when MONGODB_URI is not set.
// Uses Node's built-in node:sqlite (Node 22.13+), so there is no native package to install.
// Each store collection (users, businesses, feedback, ...) is its own table; rows keep the
// record as JSON so the rest of the server works with plain objects. Writes run in one
// transaction, so a crash never leaves half-written data.
import fs from 'node:fs';
import path from 'node:path';

const COLLECTIONS = ['users', 'businesses', 'feedback', 'inquiries', 'events', 'payments', 'authCodes', 'reviews'];
const tableName = c => 'store_' + c.replace(/[^A-Za-z0-9_]/g, '_');

let db = null;
let unavailable = false;

export async function openSqlite(file) {
  if (db || unavailable) return db;
  try {
    // Silence only the "SQLite is experimental" notice, keep every other warning
    const origEmit = process.emitWarning;
    process.emitWarning = (w, ...rest) => (String(w).includes('SQLite') ? undefined : origEmit.call(process, w, ...rest));
    const { DatabaseSync } = await import('node:sqlite');
    process.emitWarning = origEmit;

    fs.mkdirSync(path.dirname(file), { recursive: true });
    db = new DatabaseSync(file);
    db.exec('PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL; PRAGMA foreign_keys = ON;');
    for (const c of COLLECTIONS) {
      const extra = c === 'users' ? ', email TEXT UNIQUE' : '';
      db.exec(`CREATE TABLE IF NOT EXISTS ${tableName(c)} (seq INTEGER PRIMARY KEY, id TEXT${extra}, data TEXT NOT NULL)`);
    }
    db.exec('CREATE TABLE IF NOT EXISTS store_extra (key TEXT PRIMARY KEY, data TEXT NOT NULL)');
    return db;
  } catch (err) {
    unavailable = true;
    console.warn('[sqlite] not available, falling back to the JSON file store:', err.message);
    return null;
  }
}

export function sqliteIsEmpty() {
  return !db.prepare(`SELECT 1 FROM ${tableName('users')} LIMIT 1`).get();
}

export function sqliteRead() {
  const out = {};
  for (const c of COLLECTIONS) {
    out[c] = db.prepare(`SELECT data FROM ${tableName(c)} ORDER BY seq`).all().map(r => JSON.parse(r.data));
  }
  for (const r of db.prepare('SELECT key, data FROM store_extra').all()) out[r.key] = JSON.parse(r.data);
  return out;
}

export function sqliteWrite(store) {
  db.exec('BEGIN IMMEDIATE');
  try {
    for (const c of COLLECTIONS) {
      const t = tableName(c);
      db.exec(`DELETE FROM ${t}`);
      const rows = Array.isArray(store[c]) ? store[c] : [];
      const ins = c === 'users'
        ? db.prepare(`INSERT INTO ${t} (seq, id, email, data) VALUES (?, ?, ?, ?)`)
        : db.prepare(`INSERT INTO ${t} (seq, id, data) VALUES (?, ?, ?)`);
      rows.forEach((row, i) => {
        const id = row && row.id != null ? String(row.id) : null;
        if (c === 'users') ins.run(i + 1, id, row?.email ? String(row.email).toLowerCase() : null, JSON.stringify(row));
        else ins.run(i + 1, id, JSON.stringify(row));
      });
    }
    db.exec('DELETE FROM store_extra');
    const insExtra = db.prepare('INSERT INTO store_extra (key, data) VALUES (?, ?)');
    for (const [k, v] of Object.entries(store)) {
      if (!COLLECTIONS.includes(k) && k !== '_id') insExtra.run(k, JSON.stringify(v));
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

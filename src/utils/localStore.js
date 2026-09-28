import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

// Ensure data directory exists on disk
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('⚠️ [LocalStore] Could not create local data directory:', err.message);
}

/**
 * Load persisted Map store from disk
 * @param {string} filename 
 * @returns {Map}
 */
export function loadStore(filename) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      return new Map(Object.entries(parsed));
    }
  } catch (err) {
    console.warn(`⚠️ [LocalStore] Failed reading ${filename}:`, err.message);
  }
  return new Map();
}

/**
 * Save Map store to disk asynchronously
 * @param {string} filename 
 * @param {Map} map 
 */
export function saveStore(filename, map) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const obj = Object.fromEntries(map);
    fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.warn(`⚠️ [LocalStore] Failed saving ${filename}:`, err.message);
  }
}

export default { loadStore, saveStore };

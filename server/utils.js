import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

export function readJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function writeJSON(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Pick only allowed keys from an object — prevents prototype pollution
 * and mass-assignment of unexpected fields.
 */
export function pick(source, allowedKeys) {
  const result = Object.create(null);
  for (const key of allowedKeys) {
    if (source[key] !== undefined) result[key] = source[key];
  }
  return result;
}

const HTML_TAG_RE = /<[^>]*>/g;

/**
 * Strip HTML tags from a string value. Applied recursively to object
 * values so stored user input cannot contain executable markup.
 */
export function sanitize(value) {
  if (typeof value === 'string') return value.replace(HTML_TAG_RE, '');
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
      out[k] = sanitize(v);
    }
    return out;
  }
  return value;
}

export function isActive(item) {
  if (!item.aktiv) return false;
  if (item.gueltigBis) {
    const now = new Date().toISOString().split('T')[0];
    if (item.gueltigBis < now) return false;
  }
  return true;
}

export function createJsonRouter(filename) {
  return {
    read() { return readJSON(filename); },
    write(data) { writeJSON(filename, data); },
    findById(data, id) { return data.findIndex(i => i.id === id); },
  };
}

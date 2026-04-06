import { openDB } from 'idb';

const DATABASE_NAME = 'medcs-offline-db';
const DATABASE_VERSION = 1;

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('profile')) {
      db.createObjectStore('profile');
    }
    if (!db.objectStoreNames.contains('matches')) {
      db.createObjectStore('matches');
    }
    if (!db.objectStoreNames.contains('schemes')) {
      db.createObjectStore('schemes', { keyPath: 'id' });
    }
  },
});

export const storage = {
  async saveProfile(profile) {
    const db = await dbPromise;
    return db.put('profile', profile, 'current');
  },

  async getProfile() {
    const db = await dbPromise;
    return db.get('profile', 'current');
  },

  async saveMatches(matches) {
    const db = await dbPromise;
    return db.put('matches', matches, 'last');
  },

  async getMatches() {
    const db = await dbPromise;
    return db.get('matches', 'last');
  },

  async saveSchemeDetails(scheme) {
    const db = await dbPromise;
    return db.put('schemes', scheme);
  },

  async getSchemeDetails(id) {
    const db = await dbPromise;
    return db.get('schemes', id);
  }
};

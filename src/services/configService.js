/**
 * Config Service
 *
 * Loads the config document with the resolution order from the Phase 1 design:
 * fetched (freshest) → last-good localStorage copy → bundled snapshot. The
 * bundled snapshot always exists, so the form renders immediately and works
 * fully offline; a fresher fetch upgrades it at mount.
 */

import defaultConfig from '../config/defaultConfig.json';
import { getApiBaseUrl } from '../utils/envConfig.js';
import { CONFIG_LOCALSTORAGE_KEY } from '../constants/ui';

export const bundledConfig = defaultConfig;

/**
 * Shape check for every array the adapter maps over — a partial document
 * (truncated cache write, wrong endpoint) must be rejected here, not crash
 * adaptConfig at boot.
 */
export const isValidConfigDoc = (doc) =>
  Boolean(
    doc &&
    Number.isInteger(doc.version) &&
    Array.isArray(doc.behaviors) &&
    Array.isArray(doc.behaviorGroups) &&
    Array.isArray(doc.aviaries) &&
    Array.isArray(doc.objects) &&
    Array.isArray(doc.objectInteractionTypes) &&
    Array.isArray(doc.animals) &&
    Array.isArray(doc.animalInteractionTypes)
  );

/** Last-good fetched config from localStorage, or null */
export const loadCachedConfig = () => {
  try {
    const raw = localStorage.getItem(CONFIG_LOCALSTORAGE_KEY);
    if (!raw) return null;
    const doc = JSON.parse(raw);
    return isValidConfigDoc(doc) ? doc : null;
  } catch {
    return null;
  }
};

/** Best locally-available config: the newer of cache and bundled snapshot */
export const getInitialConfig = () => {
  const cached = loadCachedConfig();
  return cached && cached.version > bundledConfig.version
    ? cached
    : bundledConfig;
};

/**
 * Fetch the latest published config from the API and cache it.
 * Resolves to null on any failure — callers keep whatever they have.
 */
export const fetchLatestConfig = async () => {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) return null;

  try {
    const response = await fetch(`${apiBaseUrl}/api/config`);
    if (!response.ok) return null;

    const doc = await response.json();
    if (!isValidConfigDoc(doc)) return null;

    try {
      localStorage.setItem(CONFIG_LOCALSTORAGE_KEY, JSON.stringify(doc));
    } catch {
      // Cache write failure is fine — the fetched doc is still usable
    }
    return doc;
  } catch {
    return null;
  }
};

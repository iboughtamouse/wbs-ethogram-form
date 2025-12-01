// Valid perch numbers from the diagrams
export const VALID_PERCHES = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
  'BB1',
  'BB2',
  'F1',
  'F2',
  'G',
  'W',
];

import { TIME_SLOT_STEP_SECONDS } from './ui';

// Generate time slots for one hour (0:00 to 0:55) using configured step
const STEP_MINUTES = TIME_SLOT_STEP_SECONDS / 60;
export const TIME_SLOTS = Array.from(
  { length: Math.floor(60 / STEP_MINUTES) },
  (_, i) => {
    const minutes = i * STEP_MINUTES;
    return `0:${minutes.toString().padStart(2, '0')}`;
  }
);

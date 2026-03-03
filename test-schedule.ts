/**
 * Manual test for schedule generator.
 * Run: npx tsx test-schedule.ts
 * Requires: OPENAI_API_KEY in .env.local (real key, not placeholder).
 */
/* eslint-disable no-console */
import { config } from 'dotenv';

import { generateSchedule } from './lib/ai/schedule-generator';

config({ path: '.env.local' });

generateSchedule('I want to do app dev, school, and poker')
  .then((schedule) => {
    console.log(JSON.stringify(schedule, null, 2));
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });

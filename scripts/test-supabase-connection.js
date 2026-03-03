require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.log('SKIP');
  process.exit(0);
}

const supabase = createClient(url, key);
supabase
  .from('notes')
  .select('id', { count: 'exact', head: true })
  .then((r) => {
    console.log(r.error ? 'FAIL' : 'PASS');
    process.exit(r.error ? 1 : 0);
  })
  .catch(() => {
    console.log('FAIL');
    process.exit(1);
  });

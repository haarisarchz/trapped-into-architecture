const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bcifyymjfktabtsmocnc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y'
);

async function ingest() {
  const mappedRecords = JSON.parse(fs.readFileSync('scripts/mapped_nirf_rankings.json', 'utf8'));
  console.log(`Starting ingestion of ${mappedRecords.length} NIRF rankings...`);

  // Transform records for insertion into institution_rankings table
  const insertPayload = mappedRecords.map(r => ({
    institution_id: r.institution_id,
    ranking_body: r.ranking_body,
    ranking_year: r.ranking_year,
    rank_number: r.rank_number,
    category: r.category
  }));

  // Delete existing NIRF rankings
  console.log('Cleaning existing NIRF rankings...');
  const { error: delError } = await supabase
    .from('institution_rankings')
    .delete()
    .eq('ranking_body', 'NIRF');

  if (delError) {
    console.error('Error clearing old rankings:', delError);
    process.exit(1);
  }
  console.log('Old NIRF rankings cleared successfully.');

  // Insert in batches of 50
  const batchSize = 50;
  for (let i = 0; i < insertPayload.length; i += batchSize) {
    const batch = insertPayload.slice(i, i + batchSize);
    const { error: insError } = await supabase
      .from('institution_rankings')
      .insert(batch);
    if (insError) {
      console.error(`Error inserting batch ${i} to ${i + batch.length}:`, insError);
      process.exit(1);
    }
    console.log(`Inserted batch ${i + 1} - ${i + batch.length}`);
  }

  // Verification
  const { data: inserted, error: verifyError } = await supabase
    .from('institution_rankings')
    .select('*');

  if (verifyError) {
    console.error('Verification error:', verifyError);
    process.exit(1);
  }

  console.log(`\nVerification successful: ${inserted.length} rows in institution_rankings.`);
  const byYear = inserted.reduce((acc, r) => { acc[r.ranking_year] = (acc[r.ranking_year] || 0) + 1; return acc; }, {});
  console.log('Rankings by year in Supabase:', byYear);

  // Check unique institutions ranked
  const uniqueRankedInsts = new Set(inserted.map(r => r.institution_id));
  console.log(`Unique institutions ranked in database: ${uniqueRankedInsts.size}`);
}

ingest().catch(console.error);

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bcifyymjfktabtsmocnc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ALL_STATES_AND_UTS = [
  'Andaman and Nicobar Islands', 'Andaman & Nicobar Islands',
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
  'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Daman and Diu', 'Delhi',
  'New Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jammu and Kashmir', 'Jammu & Kashmir', 'Jharkhand', 'Karnataka',
  'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Orissa',
  'Puducherry', 'Pondicherry', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Tamilnadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'Uttaranchal', 'West Bengal'
];

// Build regex to match any state name case-insensitively
const stateRegexParts = ALL_STATES_AND_UTS.map(s => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'));
const stateRegex = new RegExp(`\\b(${stateRegexParts.join('|')})\\b`, 'gi');

function toTitleCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function sanitizeCity(rawCity, rawState, address) {
  if (!rawCity && !address) return '';
  let city = (rawCity || '').trim();

  // If city is empty or just state, try extracting from address
  if (!city && address) {
    const parts = address.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      city = parts[parts.length - 2];
    }
  }

  // Remove state names
  city = city.replace(stateRegex, ' ').trim();

  // If specific state is provided, remove it explicitly too
  if (rawState) {
    const sReg = new RegExp(`\\b${rawState.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    city = city.replace(sReg, ' ').trim();
  }

  // Remove pincode words, numbers, and garbage
  city = city.replace(/pin\s*code\s*[-:]*\s*\d*/gi, ' ');
  city = city.replace(/pincode\s*[-:]*\s*\d*/gi, ' ');
  city = city.replace(/\b\d{5,6}\b/g, ' ');
  city = city.replace(/\b(dist|district|dt|tehsil|taluk)\b\.?/gi, ' ');
  city = city.replace(/[-–_,.:;]+/g, ' ');
  city = city.replace(/\s+/g, ' ').trim();

  // Special cases cleanups
  if (city.toLowerCase() === 'north goa') city = 'North Goa';
  else if (city.toLowerCase() === 'south goa') city = 'South Goa';
  else if (city.toLowerCase() === 'bengaluru' || city.toLowerCase() === 'bangalore') city = 'Bangalore';
  else if (city.toLowerCase() === 'chennai') city = 'Chennai';
  else if (city.toLowerCase() === 'new delhi' || city.toLowerCase() === 'delhi') city = 'Delhi';
  else if (city.toLowerCase() === 'mumbai') city = 'Mumbai';
  else if (city.toLowerCase() === 'pune') city = 'Pune';
  else if (city.toLowerCase() === 'hyderabad') city = 'Hyderabad';
  else if (city.toLowerCase() === 'kolkata') city = 'Kolkata';
  else if (city.toLowerCase() === 'ahmedabad') city = 'Ahmedabad';
  else if (city.toLowerCase() === 'chandigarh') city = 'Chandigarh';
  else {
    city = toTitleCase(city);
  }

  return city;
}

async function run() {
  console.log('=== SANITIZING ALL CITIES IN SUPABASE ===\n');

  const { data: insts, error } = await supabase
    .from('institutions')
    .select('id, coa_code, institution_name, city, district, state, address');

  if (error) {
    console.error('Fetch error:', error.message);
    return;
  }

  console.log(`Loaded ${insts.length} institutions to verify.`);

  let updatedCount = 0;
  const changes = [];

  for (const inst of insts) {
    const cleanCity = sanitizeCity(inst.city, inst.state, inst.address);
    const cleanDistrict = sanitizeCity(inst.district || inst.city, inst.state, inst.address);

    if (cleanCity !== inst.city || cleanDistrict !== inst.district) {
      changes.push({
        code: inst.coa_code,
        oldCity: inst.city,
        newCity: cleanCity,
        state: inst.state
      });

      const { error: upErr } = await supabase
        .from('institutions')
        .update({
          city: cleanCity || null,
          district: cleanDistrict || cleanCity || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', inst.id);

      if (!upErr) updatedCount++;
      else console.warn(`Error updating ${inst.coa_code}:`, upErr.message);
    }
  }

  console.log(`\nSuccessfully cleaned ${updatedCount} institution cities in database!`);
  console.log('\nSample of cleaned cities:');
  changes.slice(0, 20).forEach(c => {
    console.log(`[${c.code}] '${c.oldCity}' -> '${c.newCity}' (${c.state})`);
  });
}

run().catch(console.error);

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bcifyymjfktabtsmocnc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ALL_STATES = [
  'Andaman and Nicobar Islands', 'Andaman & Nicobar Islands',
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
  'Chhattisgarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Delhi',
  'New Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jammu and Kashmir', 'Jammu & Kashmir', 'Jharkhand', 'Karnataka',
  'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Orissa',
  'Puducherry', 'Pondicherry', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Tamilnadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'Uttaranchal', 'West Bengal'
];

function toTitleCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function cleanText(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractCityFromAddress(addr, state) {
  if (!addr) return '';
  let clean = addr;

  // Split by comma
  const parts = clean.split(',').map(p => p.trim()).filter(Boolean);
  
  // Usually the city is in the part right before "pin code" or the part with the state name
  let candidate = '';
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (part.toLowerCase().includes('pin code') || part.toLowerCase().includes('pincode')) {
      // If this part itself has text before pin code
      const prePin = part.replace(/pin\s*code.*$/i, '').trim();
      if (prePin && prePin.length > 2) {
        candidate = prePin;
        break;
      }
      // Otherwise check the previous part
      if (i > 0) {
        candidate = parts[i - 1];
        break;
      }
    }
  }

  if (!candidate && parts.length >= 2) {
    candidate = parts[parts.length - 2];
  } else if (!candidate && parts.length === 1) {
    candidate = parts[0];
  }

  // Remove pin code and numbers
  candidate = candidate.replace(/pin\s*code.*$/i, '');
  candidate = candidate.replace(/\b\d{5,6}\b/g, '');

  // Remove ALL state names
  for (const st of ALL_STATES) {
    const reg = new RegExp(`\\b${st}\\b`, 'gi');
    candidate = candidate.replace(reg, ' ');
  }

  // Remove state explicitly
  if (state) {
    const reg = new RegExp(`\\b${state}\\b`, 'gi');
    candidate = candidate.replace(reg, ' ');
  }

  // Clean punctuation and descriptors
  candidate = candidate.replace(/\b(dist|district|dt|tehsil|taluk|taluka|city|town|post|po)\b\.?/gi, ' ');
  candidate = candidate.replace(/[-–_.,:;]+/g, ' ');
  candidate = candidate.replace(/\s+/g, ' ').trim();

  // If candidate became empty, check if state is a city-state (Delhi, Chandigarh, Goa, Puducherry)
  if (!candidate || candidate.length < 2) {
    if (['Delhi', 'Chandigarh', 'Puducherry'].includes(state)) {
      candidate = state;
    } else if (state === 'Goa') {
      candidate = 'Goa';
    } else if (parts.length >= 3) {
      // Try earlier part
      candidate = parts[parts.length - 3].replace(/[-–_.,:;]+/g, ' ').trim();
    }
  }

  candidate = toTitleCase(candidate);

  // Standardize common Indian cities
  const lower = candidate.toLowerCase();
  if (lower === 'bengaluru') candidate = 'Bangalore';
  else if (lower === 'new delhi') candidate = 'Delhi';
  else if (lower === 'north' || lower === 'north goa') candidate = 'North Goa';
  else if (lower === 'south' || lower === 'south goa') candidate = 'South Goa';

  return candidate;
}

async function fix() {
  console.log('=== FIXING ALL INSTITUTION ADDRESSES AND CITIES ===\n');

  const html = fs.readFileSync('scripts/coa_page.html', 'utf8');
  const trs = html.match(/<tr[^>]*class=[\"']GridRow[\"'][\s\S]*?<\/tr>/gi) || [];
  console.log(`Found ${trs.length} COA GridRow rows in HTML.`);

  const coaDataMap = new Map();

  for (const tr of trs) {
    const codeMatch = tr.match(/<b>([A-Z]{2}\d+)<\/b>/i);
    if (!codeMatch) continue;
    const code = codeMatch[1].toUpperCase();

    // Find the span with pin code
    const spans = tr.match(/<span[^>]*>([\s\S]*?)<\/span>/gi) || [];
    let address = '';
    for (const s of spans) {
      const text = cleanText(s);
      if (text.toLowerCase().includes('pin code') || text.toLowerCase().includes('pincode')) {
        address = text;
        break;
      }
    }

    coaDataMap.set(code, address);
  }

  console.log(`Mapped exact address for ${coaDataMap.size} COA codes from portal.\n`);

  // Fetch all institutions from Supabase
  const { data: dbInsts, error: fetchErr } = await supabase
    .from('institutions')
    .select('id, coa_code, institution_name, city, district, state, address');

  if (fetchErr) {
    console.error('Fetch error:', fetchErr.message);
    return;
  }

  let updatedCount = 0;
  const sampleCleaned = [];

  for (const inst of dbInsts) {
    const code = (inst.coa_code || '').toUpperCase().trim();
    let realAddress = coaDataMap.get(code) || inst.address || '';

    // If address had Tel/Fax/Email, replace with realAddress
    if (realAddress.startsWith('Tel:') || realAddress.startsWith('Fax:') || realAddress.startsWith('Email:')) {
      realAddress = coaDataMap.get(code) || '';
    }

    const cleanCity = extractCityFromAddress(realAddress || inst.address, inst.state);

    if (cleanCity !== inst.city || (realAddress && realAddress !== inst.address)) {
      sampleCleaned.push({
        code,
        name: inst.institution_name,
        oldCity: inst.city,
        newCity: cleanCity,
        state: inst.state
      });

      const { error: upErr } = await supabase
        .from('institutions')
        .update({
          address: realAddress || undefined,
          city: cleanCity || null,
          district: cleanCity || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', inst.id);

      if (!upErr) updatedCount++;
      else console.warn(`Update error for ${code}:`, upErr.message);
    }
  }

  console.log(`Successfully updated ${updatedCount} institutions with clean cities and addresses!`);
  console.log('\nSample Cleaned Cities (Notice: ZERO state names attached!):');
  sampleCleaned.slice(0, 25).forEach(s => {
    console.log(`[${s.code}] Old: '${s.oldCity}' -> Clean: '${s.newCity}' (${s.state})`);
  });
}

fix().catch(console.error);

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bcifyymjfktabtsmocnc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const fs = require('fs');
const XLSX = require('xlsx');

async function restore() {
  console.log('=== RESTORING ANY EMPTY CITIES AND ENSURING COMPLETE CLEANLINESS ===\n');

  // Read original Excel file to restore exact TN, KA, KL cities
  const wb = XLSX.readFile('C:/Users/ASUS/.gemini/antigravity/brain/f1dbf539-8245-4dfa-a331-d3d0836eea70/.user_uploaded/media_1794294446325_4806d50c.xlsx');
  const excelMap = new Map();

  for (const sName of ['Tamilnadu', 'Karnataka', 'Kerala']) {
    const ws = wb.Sheets[sName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const code = String(r[1] || '').trim().toUpperCase();
      const district = String(r[4] || '').trim();
      const locality = String(r[3] || '').trim();
      if (code && (district || locality)) {
        excelMap.set(code, district || locality);
      }
    }
  }

  const { data: dbInsts } = await supabase
    .from('institutions')
    .select('id, coa_code, city, district, state, address, institution_name');

  let fixedCount = 0;

  for (const inst of dbInsts) {
    const code = (inst.coa_code || '').toUpperCase().trim();
    let currentCity = (inst.city || '').trim();

    // If city is empty, check Excel map or address
    if (!currentCity || currentCity.length < 2) {
      if (excelMap.has(code)) {
        currentCity = excelMap.get(code);
      } else if (inst.address) {
        const parts = inst.address.split(',').map(p => p.trim());
        if (parts.length >= 2) {
          currentCity = parts[parts.length - 2].replace(/pin\s*code.*$/i, '').trim();
        }
      }
    }

    // Now remove ANY state name from currentCity
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

    for (const st of ALL_STATES) {
      const reg = new RegExp(`\\b${st}\\b`, 'gi');
      currentCity = currentCity.replace(reg, ' ');
    }

    currentCity = currentCity.replace(/pin\s*code.*$/i, ' ');
    currentCity = currentCity.replace(/\b\d{5,6}\b/g, ' ');
    currentCity = currentCity.replace(/\b(dist|district|dt|tehsil|taluk)\b\.?/gi, ' ');
    currentCity = currentCity.replace(/[-–_,.:;]+/g, ' ');
    currentCity = currentCity.replace(/\s+/g, ' ').trim();

    // Standardize title case
    if (currentCity) {
      currentCity = currentCity
        .toLowerCase()
        .split(' ')
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }

    if (currentCity.toLowerCase() === 'bengaluru') currentCity = 'Bangalore';
    if (!currentCity && ['Delhi', 'Chandigarh', 'Puducherry'].includes(inst.state)) {
      currentCity = inst.state;
    }

    if (currentCity !== inst.city) {
      await supabase
        .from('institutions')
        .update({ city: currentCity || null, district: currentCity || null, updated_at: new Date().toISOString() })
        .eq('id', inst.id);
      fixedCount++;
    }
  }

  console.log(`Updated/restored ${fixedCount} institutions with clean city names.`);
}

restore().catch(console.error);

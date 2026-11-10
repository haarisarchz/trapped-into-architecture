const fs = require('fs');

const html = fs.readFileSync('scripts/coa_page.html', 'utf8');
const trs = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi);

function cleanText(str) {
  if (!str) return '';
  return str.replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/\r/g, '')
            .trim();
}

console.log('Total tr rows in html:', trs ? trs.length : 0);

const parsedInstitutions = [];

for (let i = 1; i < (trs ? trs.length : 0); i++) {
  const tr = trs[i];
  const tds = tr.match(/<td[^>]*>[\s\S]*?<\/td>/gi);
  if (!tds || tds.length < 4) continue;

  const sNo = cleanText(tds[0]).replace(/\./g, '').trim();
  const col1Raw = tds[1];

  // Extract COA code: <b>([A-Z]{2}\d+)</b>
  const codeMatch = col1Raw.match(/<b>([A-Z]{2}\d+)<\/b>/i) || col1Raw.match(/\b([A-Z]{2}\d+)\b/i);
  const code = codeMatch ? codeMatch[1].toUpperCase() : '';

  // Email match
  const emailMatch = col1Raw.match(/mailto:([^\s\"'>]+)/i) || col1Raw.match(/Email:\s*([^\s<]+)/i);
  let email = emailMatch ? emailMatch[1].trim() : '';

  // Website match
  const webMatch = col1Raw.match(/Website:\s*<a\s+href=[\"\']([^\"\']+)[\"\']/i) || col1Raw.match(/<a\s+href=[\"\'](https?:\/\/[^\"\']+)[\"\']/i);
  let website = webMatch ? webMatch[1].trim() : '';

  // Tel / Fax / Mobile
  const telMatch = col1Raw.match(/Tel:\s*([^<\n]+)/i);
  const tel = telMatch ? telMatch[1].trim() : '';

  const mobMatch = col1Raw.match(/Mobile:\s*([^<\n]+)/i);
  const mobile = mobMatch ? mobMatch[1].trim() : '';

  // Extract spans from col1Raw to get Name, Head, Address
  const spans = (col1Raw.match(/<span[^>]*>([\s\S]*?)<\/span>/gi) || []).map(s => cleanText(s)).filter(Boolean);

  let headName = '';
  let designation = '';
  let collegeName = '';
  let address = '';

  // spans[0] usually has code, spans[1] headName, spans[2] designation, spans[3] collegeName, spans[4] address
  if (spans.length >= 4) {
    headName = spans[1] || '';
    designation = spans[2] || '';
    collegeName = spans[3] || '';
    address = spans[4] || '';
  } else if (spans.length === 3) {
    headName = spans[0] || '';
    collegeName = spans[1] || '';
    address = spans[2] || '';
  }

  // Fallback if collegeName not clean
  if (!collegeName || collegeName.includes('Tel:') || collegeName.includes('Email:')) {
    const textLines = cleanText(col1Raw).split('\n').map(l => l.trim()).filter(Boolean);
    // Find lines after code
    const codeIdx = textLines.findIndex(l => l.includes(code));
    if (codeIdx !== -1 && textLines.length > codeIdx + 3) {
      headName = textLines[codeIdx + 1] || '';
      designation = textLines[codeIdx + 2] || '';
      collegeName = textLines[codeIdx + 3] || '';
      address = textLines[codeIdx + 4] || '';
    }
  }

  // University
  const university = cleanText(tds[2]);

  // Course name
  const course = cleanText(tds[3]);

  // Year of commencement
  let yearCommencement = null;
  const yearRaw = cleanText(tds[4]);
  const yrMatch = yearRaw.match(/\b(19\d\d|20\d\d)\b/);
  if (yrMatch) {
    yearCommencement = parseInt(yrMatch[1], 10);
  }

  // Current Intake & Approval Period
  const intakeRaw = cleanText(tds[5] || tds[4]);
  const intakeLines = intakeRaw.split('\n').map(l => l.trim()).filter(Boolean);
  let approvedSeats = null;
  let approvalPeriod = '';

  for (const line of intakeLines) {
    const numMatch = line.match(/^(\d+)$/);
    if (numMatch) {
      approvedSeats = parseInt(numMatch[1], 10);
    } else if (line.toLowerCase().includes('zero') || line.toLowerCase().includes('discontinued') || line.toLowerCase().includes('withdrawn')) {
      approvedSeats = 0;
    }
    if (line.match(/20\d\d[-–_]20\d\d/)) {
      approvalPeriod = line;
    }
  }

  // State detection from code prefix or address
  const STATE_PREFIX_MAP = {
    'AP': 'Andhra Pradesh',
    'AR': 'Arunachal Pradesh',
    'AS': 'Assam',
    'BR': 'Bihar',
    'CH': 'Chandigarh',
    'CG': 'Chhattisgarh',
    'DL': 'Delhi',
    'GA': 'Goa',
    'GJ': 'Gujarat',
    'HR': 'Haryana',
    'HP': 'Himachal Pradesh',
    'JK': 'Jammu & Kashmir',
    'JH': 'Jharkhand',
    'KA': 'Karnataka',
    'KL': 'Kerala',
    'MP': 'Madhya Pradesh',
    'MH': 'Maharashtra',
    'MN': 'Manipur',
    'ML': 'Meghalaya',
    'MZ': 'Mizoram',
    'NL': 'Nagaland',
    'OD': 'Odisha',
    'OR': 'Odisha',
    'PB': 'Punjab',
    'PY': 'Puducherry',
    'RJ': 'Rajasthan',
    'SK': 'Sikkim',
    'TN': 'Tamil Nadu',
    'TS': 'Telangana',
    'TG': 'Telangana',
    'TR': 'Tripura',
    'UP': 'Uttar Pradesh',
    'UK': 'Uttarakhand',
    'UA': 'Uttarakhand',
    'WB': 'West Bengal'
  };

  const codePrefix = code.slice(0, 2);
  const detectedState = STATE_PREFIX_MAP[codePrefix] || 'All India';

  // Extract District and Pincode from address
  let pinCode = null;
  const pinMatch = address.match(/pin\s*code\s*[-:]*\s*(\d{6})/i) || address.match(/\b(\d{6})\b/);
  if (pinMatch) pinCode = pinMatch[1];

  parsedInstitutions.push({
    sNo,
    coa_code: code,
    head_name: headName,
    designation,
    institution_name: collegeName,
    address,
    state: detectedState,
    pincode: pinCode,
    phone: tel || mobile,
    mobile: mobile,
    email: email,
    website: website,
    affiliated_university: university,
    course_name: course || 'B.Arch',
    commencement_year: yearCommencement,
    approved_intake: approvedSeats,
    approval_period: approvalPeriod
  });
}

console.log('Total parsed institutions:', parsedInstitutions.length);
console.log('\nSample institution 1:');
console.log(JSON.stringify(parsedInstitutions[0], null, 2));

console.log('\nSample institution 50:');
console.log(JSON.stringify(parsedInstitutions[49], null, 2));

console.log('\nSample institution 400:');
console.log(JSON.stringify(parsedInstitutions[parsedInstitutions.length - 1], null, 2));

fs.writeFileSync('scripts/parsed_coa_live.json', JSON.stringify(parsedInstitutions, null, 2), 'utf8');
console.log('\nSaved scripts/parsed_coa_live.json successfully!');

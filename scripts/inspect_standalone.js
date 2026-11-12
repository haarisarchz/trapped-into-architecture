const fs = require('fs');

function inspectStandaloneInstitutions() {
  const h1 = fs.readFileSync('scripts/diploma_2025_26.html', 'utf8');
  const h3 = fs.readFileSync('scripts/diploma_2024_25.html', 'utf8');

  const allHtml = h1 + '\n' + h3;
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let match;

  const institutionsByCode = new Map();

  while ((match = trRegex.exec(allHtml)) !== null) {
    const tds = [...match[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m =>
      m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    );
    if (tds.length >= 6) {
      const rawInfo = tds[1];
      const codeMatch = rawInfo.match(/^([A-Z]{2}D\d{2})\b/);
      if (!codeMatch) continue;
      const code = codeMatch[1].toUpperCase();

      if (institutionsByCode.has(code)) continue;

      const university = tds[2] || null;
      const commencement = tds[4] ? parseInt(tds[4], 10) : null;

      // Extract details
      const emailM = rawInfo.match(/Email:\s*([^\s,;]+@[^\s,;]+)/i);
      const email = emailM ? emailM[1].trim() : null;

      const mobileM = rawInfo.match(/Mobile:\s*([0-9\s,\/-]+?)(?=\s*Website:|$)/i);
      const mobile = mobileM ? mobileM[1].trim() : null;

      const telM = rawInfo.match(/Tel:\s*([0-9\s,\/-]+?)(?=\s*Fax:|\s*Email:|$)/i);
      const tel = telM ? telM[1].trim() : null;

      const webM = rawInfo.match(/Website:\s*(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*)/i);
      const website = webM ? webM[1].trim() : null;

      const pinM = rawInfo.match(/Pin\s*code\s*[-:]?\s*(\d{6})/i);
      const pincode = pinM ? pinM[1] : null;

      // Title & Name & Address
      // rawInfo example: "APD01 Head Of Department Andhra Polytechnic Yanam Road, Jagannaickpur Road , Kakinada,Pin code-533002 ,ANDHRA PRADESH Tel: - Fax: Email: principal_apt@yahoo.co.in Mobile: 9912342010 Website:"
      let clean = rawInfo.replace(/^([A-Z]{2}D\d{2})\s+/, '');
      let headTitle = 'The Principal';
      const titleM = clean.match(/^(Head Of Department|Principal|Director|Dean)\s+/i);
      if (titleM) {
        headTitle = titleM[1];
        clean = clean.substring(titleM[0].length);
      }

      const telIdx = clean.search(/\s+(Tel:|Email:|Mobile:|Fax:)/i);
      if (telIdx !== -1) {
        clean = clean.substring(0, telIdx).trim();
      }

      // Extract state: usually at the very end e.g. ",ANDHRA PRADESH"
      let state = 'India';
      const stateMatch = clean.match(/,\s*([A-Za-z\s]+)$/);
      if (stateMatch) {
        state = stateMatch[1].trim();
        clean = clean.substring(0, stateMatch.index).trim();
      }

      // Pincode extraction from clean if present
      clean = clean.replace(/,?\s*Pin\s*code\s*[-:]?\s*\d{6}/i, '').trim();

      // clean is now "Andhra Polytechnic Yanam Road, Jagannaickpur Road , Kakinada"
      const parts = clean.split(/,\s*/);
      const instName = parts[0].trim();
      let city = parts.length > 1 ? parts[parts.length - 1].trim() : null;
      let address = clean + (pincode ? ` - ${pincode}` : '') + (state ? `, ${state}` : '');

      institutionsByCode.set(code, {
        coa_code: code,
        institution_name: instName,
        head_of_institution: headTitle,
        affiliated_university: university,
        establishment_year: commencement,
        city: city || state,
        state: state,
        country: 'India',
        address: address,
        official_email: email,
        official_phone: mobile || tel,
        website: website,
        institution_type: 'Polytechnic / Diploma Institution'
      });
    }
  }

  console.log(`Extracted metadata for ${institutionsByCode.size} standalone institutions.`);
  const sample = Array.from(institutionsByCode.values()).slice(0, 5);
  console.log('Sample standalone institutions:');
  console.log(sample);
}

inspectStandaloneInstitutions();

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bcifyymjfktabtsmocnc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWZ5eW1qZmt0YWJ0c21vY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzU2MDYsImV4cCI6MjA5NDcxMTYwNn0.FNk_rSL4FDQL0puOyc_0-xGXgEmqieZ-cmc6yYLNa2Y'
);

// High-precision coordinates for all primary Indian architecture education cities and hubs
const KNOWN_COORDINATES = {
  // Metros & Major Architecture Hubs
  'new delhi': [28.6139, 77.2090],
  'delhi': [28.6139, 77.2090],
  'bengaluru': [12.9716, 77.5946],
  'bangalore': [12.9716, 77.5946],
  'bangalore north': [13.0358, 77.5970],
  'bangalore south': [12.9141, 77.5841],
  'chennai': [13.0827, 80.2707],
  'mumbai': [19.0760, 72.8777],
  'navi mumbai': [19.0330, 73.0297],
  'pune': [18.5204, 73.8567],
  'ahmedabad': [23.0225, 72.5714],
  'gandhinagar': [23.2156, 72.6369],
  'hyderabad': [17.3850, 78.4867],
  'secunderabad': [17.4399, 78.4983],
  'kolkata': [22.5726, 88.3639],
  'howrah': [22.5958, 88.2636],
  'jaipur': [26.9124, 75.7873],
  'lucknow': [26.8467, 80.9462],
  'kanpur': [26.4499, 80.3319],
  'bhopal': [23.2599, 77.4126],
  'indore': [22.7196, 75.8577],
  'chandigarh': [30.7333, 76.7794],
  'mohali': [30.7046, 76.7179],
  'patiala': [30.3398, 76.3869],
  'ludhiana': [30.9010, 75.8573],
  'amritsar': [31.6340, 74.8723],
  'jalandhar': [31.3260, 75.5762],
  'roorkee': [29.8543, 77.8880],
  'dehradun': [30.3165, 78.0322],
  'varanasi': [25.3176, 82.9739],
  'aligarh': [27.8974, 78.0880],
  'agra': [27.1767, 78.0081],
  'meerut': [28.9845, 77.7064],
  'noida': [28.5355, 77.3910],
  'greater noida': [28.4744, 77.5040],
  'ghaziabad': [28.6692, 77.4538],
  'gurgaon': [28.4595, 77.0266],
  'gurugram': [28.4595, 77.0266],
  'sonipat': [28.9931, 77.0151],
  'rohtak': [28.8955, 76.6066],
  'faridabad': [28.4089, 77.3178],
  'patna': [25.5941, 85.1376],
  'ranchi': [23.3441, 85.3096],
  'raipur': [21.2514, 81.6296],
  'bhubaneswar': [20.2961, 85.8245],
  'cuttack': [20.4625, 85.8828],
  'rourkela': [22.2604, 84.8536],
  'thiruvananthapuram': [8.5241, 76.9366],
  'trivandrum': [8.5241, 76.9366],
  'kochi': [9.9312, 76.2673],
  'ernakulam': [9.9816, 76.2999],
  'kozhikode': [11.2588, 75.7804],
  'calicut': [11.2588, 75.7804],
  'kollam': [8.8932, 76.6141],
  'thrissur': [10.5276, 76.2144],
  'kottayam': [9.5916, 76.5222],
  'palakkad': [10.7867, 76.6548],
  'kannur': [11.8745, 75.3704],
  'malappuram': [11.0510, 76.0711],
  'coimbatore': [11.0168, 76.9558],
  'madurai': [9.9252, 78.1198],
  'tiruchirappalli': [10.7905, 78.7047],
  'trichy': [10.7905, 78.7047],
  'salem': [11.6643, 78.1460],
  'thanjavur': [10.7870, 79.1378],
  'tirunelveli': [8.7139, 77.7567],
  'vellore': [12.9165, 79.1325],
  'chengalpet': [12.6939, 79.9757],
  'kanchipuram': [12.8342, 79.7036],
  'hosur': [12.7409, 77.8253],
  'dindigul': [10.3673, 77.9803],
  'erode': [11.3410, 77.7172],
  'namakkal': [11.2189, 78.1674],
  'karur': [10.9601, 78.0766],
  'nagapattinam': [10.7672, 79.8449],
  'kanyakumari': [8.0883, 77.5385],
  'manipal': [13.3525, 74.7928],
  'udupi': [13.3409, 74.7421],
  'mangaluru': [12.9141, 74.8560],
  'mangalore': [12.9141, 74.8560],
  'mysuru': [12.2958, 76.6394],
  'mysore': [12.2958, 76.6394],
  'belagavi': [15.8497, 74.4977],
  'belgaum': [15.8497, 74.4977],
  'hubballi': [15.3647, 75.1240],
  'dharwad': [15.4589, 75.0078],
  'kalaburagi': [17.3297, 76.8343],
  'gulbarga': [17.3297, 76.8343],
  'ballari': [15.1394, 76.9214],
  'bellary': [15.1394, 76.9214],
  'tumakuru': [13.3392, 77.1017],
  'tumkur': [13.3392, 77.1017],
  'davangere': [14.4644, 75.9218],
  'shivamogga': [13.9299, 75.5681],
  'shimoga': [13.9299, 75.5681],
  'bagalkot': [16.1691, 75.6615],
  'vijayapura': [16.8302, 75.7100],
  'bijapur': [16.8302, 75.7100],
  'bidar': [17.9104, 77.5199],
  'gadag': [15.4299, 75.6318],
  'hassan': [13.0033, 76.1004],
  'vadodara': [22.3072, 73.1812],
  'surat': [21.1702, 72.8311],
  'rajkot': [22.3039, 70.8022],
  'anand': [22.5645, 72.9289],
  'vallabh vidyanagar': [22.5539, 72.9238],
  'himatnagar': [23.5977, 72.9698],
  'valsad': [20.5992, 72.9342],
  'patan': [23.8493, 72.1266],
  'mahesana': [23.5880, 72.3693],
  'mehsana': [23.5880, 72.3693],
  'bardoli': [21.1189, 73.1114],
  'nagpur': [21.1458, 79.0882],
  'nashik': [19.9975, 73.7898],
  'aurangabad': [19.8762, 75.3433],
  'chhatrapati sambhajinagar': [19.8762, 75.3433],
  'kolhapur': [16.7050, 74.2433],
  'solapur': [17.6599, 75.9064],
  'amravati': [20.9374, 77.7796],
  'nanded': [19.1383, 77.3210],
  'sangli': [16.8524, 74.5815],
  'jalgaon': [21.0077, 75.5626],
  'akola': [20.7002, 77.0082],
  'latur': [18.4088, 76.5604],
  'dhule': [20.9042, 74.7749],
  'ahmednagar': [19.0948, 74.7480],
  'chandrapur': [19.9615, 79.2961],
  'parbhani': [19.2644, 76.7767],
  'satara': [17.6805, 73.9997],
  'ratnagiri': [16.9902, 73.3120],
  'sindhudurg': [16.1217, 73.7042],
  'raigad': [18.5158, 73.1822],
  'alibag': [18.6414, 72.8722],
  'panvel': [18.9894, 73.1175],
  'thane': [19.2183, 72.9781],
  'palghar': [19.6967, 72.7699],
  'vasai': [19.3919, 72.8397],
  'virar': [19.4564, 72.8099],
  'wardha': [20.7453, 78.6022],
  'yavatmal': [20.3888, 78.1204],
  'bhandara': [21.1714, 79.6548],
  'gondia': [21.4602, 80.1961],
  'buldhana': [20.5293, 76.1843],
  'washim': [20.1098, 77.1352],
  'beed': [18.9891, 75.7601],
  'osmanabad': [18.1861, 76.0419],
  'dharashiv': [18.1861, 76.0419],
  'hingoli': [19.7180, 77.1485],
  'gadchiroli': [20.1809, 80.0033],
  'jalna': [19.8410, 75.8864],
  'vijayawada': [16.5062, 80.6480],
  'visakhapatnam': [17.6868, 83.2185],
  'guntur': [16.3067, 80.4365],
  'tirupati': [13.6288, 79.4192],
  'kakinada': [16.9891, 82.2475],
  'rajahmundry': [17.0005, 81.8040],
  'nellore': [14.4426, 79.9865],
  'kurnool': [15.8281, 78.0373],
  'kadapa': [14.4673, 78.8242],
  'anantapur': [14.6819, 77.6006],
  'vizianagaram': [18.1133, 83.3977],
  'eluru': [16.7107, 81.0952],
  'srikakulam': [18.2949, 83.8938],
  'ongole': [15.5057, 80.0499],
  'chittoor': [13.2172, 79.1003],
  'warangal': [17.9689, 79.5941],
  'karimnagar': [18.4386, 79.1288],
  'nizamabad': [18.6725, 78.0941],
  'khammam': [17.2473, 80.1514],
  'rangareddy': [17.4334, 78.4116],
  'medak': [18.0475, 78.2612],
  'sangareddy': [17.6190, 78.0814],
  'mahbubnagar': [16.7488, 77.9864],
  'nalgonda': [17.0575, 79.2684],
  'siddipet': [18.1018, 78.8520],
  'guwahati': [26.1445, 91.7362],
  'silchar': [24.8333, 92.7789],
  'dibrugarh': [27.4728, 94.9120],
  'jorhat': [26.7509, 94.2037],
  'tezpur': [26.6528, 92.7926],
  'shillong': [25.5788, 91.8933],
  'aizawl': [23.7271, 92.7176],
  'imphal': [24.8170, 93.9368],
  'kohima': [25.6751, 94.1086],
  'dimapur': [25.9096, 93.7266],
  'gangtok': [27.3389, 88.6065],
  'itangar': [27.0844, 93.6053],
  'agartala': [23.8315, 91.2868],
  'srinagar': [34.0837, 74.7973],
  'jammu': [32.7266, 74.8570],
  'reasi': [33.0827, 74.8329],
  'katra': [32.9917, 74.9317],
  'baramulla': [34.2017, 74.3436],
  'baramula': [34.2017, 74.3436],
  'pulwama': [32.8788, 74.8988],
  'shimla': [31.1048, 77.1734],
  'hamirpur': [31.6862, 76.5213],
  'dharamshala': [32.2190, 76.3234],
  'solan': [30.9084, 77.0999],
  'mandi': [31.5892, 76.9182],
  'kullu': [31.9579, 77.1095],
  'panaji': [15.4909, 73.8278],
  'goa': [15.2993, 74.1240],
  'margao': [15.2832, 73.9862],
  'puducherry': [11.9416, 79.8083],
  'pondicherry': [11.9416, 79.8083],
  'port blair': [11.6234, 92.7265]
};

// Fallback State Centroids if city is unknown
const STATE_CENTROIDS = {
  'tamil nadu': [11.1271, 78.6569],
  'maharashtra': [19.7515, 75.7139],
  'karnataka': [15.3173, 75.7139],
  'kerala': [10.8505, 76.2711],
  'gujarat': [22.2587, 71.1924],
  'uttar pradesh': [26.8467, 80.9462],
  'haryana': [29.0588, 76.0856],
  'punjab': [31.1471, 75.3412],
  'rajasthan': [27.0238, 74.2179],
  'madhya pradesh': [22.9734, 78.6569],
  'telangana': [18.1124, 79.0193],
  'andhra pradesh': [15.9129, 79.7400],
  'west bengal': [22.9868, 87.8550],
  'odisha': [20.9517, 85.0985],
  'bihar': [25.0961, 85.3131],
  'jharkhand': [23.6102, 85.2799],
  'chhattisgarh': [21.2787, 81.8661],
  'uttarakhand': [30.0668, 79.0193],
  'himachal pradesh': [31.1048, 77.1734],
  'jammu & kashmir': [33.7782, 76.5762],
  'jammu and kashmir': [33.7782, 76.5762],
  'goa': [15.2993, 74.1240],
  'delhi': [28.7041, 77.1025],
  'chandigarh': [30.7333, 76.7794],
  'assam': [26.2006, 92.9376],
  'puducherry': [11.9416, 79.8083]
};

async function generate() {
  console.log('Fetching all institutions from Supabase...');
  let allInst = [];
  let from = 0;
  while (true) {
    const { data } = await supabase.from('institutions').select('id, coa_code, institution_name, city, district, state, address, slug').range(from, from + 999);
    allInst = allInst.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }
  console.log(`Fetched ${allInst.length} institutions.`);

  const clean = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

  // Deterministic coordinate assignment with subtle spread for same-city institutions
  const cityCounts = {};
  const geoRecords = [];

  for (const inst of allInst) {
    const cClean = clean(inst.city);
    const dClean = clean(inst.district);
    const sClean = clean(inst.state);

    let baseCoord = KNOWN_COORDINATES[cClean] || KNOWN_COORDINATES[dClean];

    // Fuzzy city check in known coordinates
    if (!baseCoord) {
      for (const [key, val] of Object.entries(KNOWN_COORDINATES)) {
        if (cClean.includes(key) || key.includes(cClean) || (dClean && dClean.includes(key))) {
          baseCoord = val;
          break;
        }
      }
    }

    // Fallback to State Centroid
    if (!baseCoord) {
      baseCoord = STATE_CENTROIDS[sClean] || [20.5937, 78.9629]; // India center
    }

    // Apply deterministic micro-jitter (so multiple colleges in the same city form a nice tight visible cluster rather than exact point overlap)
    const cityKey = `${baseCoord[0].toFixed(3)}_${baseCoord[1].toFixed(3)}`;
    cityCounts[cityKey] = (cityCounts[cityKey] || 0) + 1;
    const idx = cityCounts[cityKey];

    let lat = baseCoord[0];
    let lng = baseCoord[1];

    if (idx > 1) {
      // Golden angle spiral spread (radius ~0.5km to 3km)
      const angle = (idx - 1) * 2.39996; // Golden angle
      const radius = 0.004 * Math.sqrt(idx - 1); // ~400m * sqrt(N)
      lat += radius * Math.cos(angle);
      lng += radius * Math.sin(angle) * 1.05; // adjust for latitude
    }

    geoRecords.push({
      id: inst.id,
      coa_code: inst.coa_code,
      institution_name: inst.institution_name,
      slug: inst.slug,
      city: inst.city || inst.district || inst.state,
      state: inst.state,
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6))
    });
  }

  fs.writeFileSync('scripts/institutions_geodata.json', JSON.stringify(geoRecords, null, 2));
  console.log(`Successfully generated geodata for ${geoRecords.length} institutions!`);
  console.log(`Saved to scripts/institutions_geodata.json`);
}

generate().catch(console.error);

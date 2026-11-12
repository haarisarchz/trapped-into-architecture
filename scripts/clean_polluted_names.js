const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)/)[1];
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=([^\r\n]+)/)[1];
const supabase = createClient(url, key);

const cleanups = [
  {
    code: 'MH121',
    name: 'Department of Architecture, NICMAR University',
    city: 'Pune'
  },
  {
    code: 'HR32',
    name: 'St. Andrews College of Architecture & Planning',
    city: 'Gurugram'
  },
  {
    code: 'AS03',
    name: 'HAM-AK College of Architecture, Planning and Design',
    city: 'Nagaon'
  },
  {
    code: 'HR33',
    name: 'CCLS College of Architecture & Design',
    city: 'Rohtak'
  },
  {
    code: 'MH123',
    name: 'School of Architecture & Planning, Atharva University',
    city: 'Mumbai'
  },
  {
    code: 'HR34',
    name: 'Department of Architecture, National Institute of Technology Kurukshetra',
    city: 'Kurukshetra'
  },
  {
    code: 'MH124',
    name: 'Hafeez Contractor School of Architecture, Dr. Vishwanath Karad MIT World Peace University',
    city: 'Pune'
  },
  {
    code: 'TN104',
    name: 'Department of Architecture, Kingston Engineering College',
    city: 'Vellore'
  },
  {
    code: 'TS19',
    name: 'Amity School of Architecture & Planning, Amity University',
    city: 'Hyderabad'
  },
  {
    code: 'UKD01',
    name: 'Government Girls Polytechnic, Dehradun',
    city: 'Dehradun'
  },
  {
    code: 'UKD02',
    name: 'B. S. Negi Mahila Pravidhik Prashikshan Sansthan',
    city: 'Dehradun'
  },
  {
    code: 'UPD01',
    name: 'Government Polytechnic, Ghaziabad',
    city: 'Ghaziabad'
  },
  {
    code: 'GJD06',
    name: 'Bhulabhai Vanmalibhai Patel Institute of Technology (Diploma Studies)',
    city: 'Bardoli'
  },
  {
    code: 'UPD09',
    name: 'Maharana Pratap Polytechnic, Gorakhpur',
    city: 'Gorakhpur'
  },
  {
    code: 'PJD01',
    name: 'Thapar Polytechnic College',
    city: 'Patiala'
  },
  {
    code: 'PJD05',
    name: 'Mai Bhago Government Polytechnic College for Girls',
    city: 'Amritsar'
  }
];

async function run() {
  for (const c of cleanups) {
    const { error } = await supabase
      .from('institutions')
      .update({ institution_name: c.name, city: c.city })
      .eq('coa_code', c.code);
    if (error) {
      console.error('Error on', c.code, error.message);
    } else {
      console.log('Cleaned', c.code, '->', c.name, '(' + c.city + ')');
    }
  }
}
run();

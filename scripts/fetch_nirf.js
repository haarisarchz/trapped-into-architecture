const fs = require('fs');

const urls = [
  { year: 2025, url: 'https://www.nirfindia.org/Rankings/2025/ArchitectureRanking.html' },
  { year: 2024, url: 'https://www.nirfindia.org/Rankings/2024/ArchitectureRanking.html' },
  { year: 2023, url: 'https://www.nirfindia.org/Rankings/2023/ArchitectureRanking.html' },
  { year: 2022, url: 'https://www.nirfindia.org/Rankings/2022/ArchitectureRanking.html' },
  { year: 2021, url: 'https://www.nirfindia.org/Rankings/2021/ArchitectureRanking.html' },
  { year: 2020, url: 'https://www.nirfindia.org/Rankings/2020/ArchitectureRanking.html' },
  { year: 2019, url: 'https://www.nirfindia.org/Rankings/2019/ArchitectureRanking.html' },
  { year: 2018, url: 'https://www.nirfindia.org/Rankings/2018/ArchitectureRanking.html' },
];

async function fetchAll() {
  for (const item of urls) {
    try {
      console.log(`Fetching ${item.year}: ${item.url}...`);
      const resp = await fetch(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      console.log(`Status ${item.year}: ${resp.status}`);
      if (resp.ok) {
        const text = await resp.text();
        fs.writeFileSync(`scripts/nirf_${item.year}.html`, text);
        console.log(`Saved scripts/nirf_${item.year}.html (${text.length} bytes)`);
      }
    } catch (e) {
      console.error(`Error fetching ${item.year}:`, e.message);
    }
  }
}

fetchAll();

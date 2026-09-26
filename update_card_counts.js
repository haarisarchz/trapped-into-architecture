const fs = require('fs');

function updatePage(filename) {
  let content = fs.readFileSync(filename, 'utf8');
  
  // 1. Update mapping
  const mapRegex = /source: job\.source,\s*image: job\.image,/;
  const mapReplace = `source: job.source,
          image: job.image,
          save_count: job.save_count || 0,
          share_count: job.share_count || 0,`;
  if (content.match(mapRegex)) {
    content = content.replace(mapRegex, mapReplace);
  }

  // 2. Update JobCard props
  const propRegex = /source=\{job\.source\}\s*image=\{job\.image\}/;
  const propReplace = `source={job.source}
      image={job.image}
      save_count={job.save_count}
      share_count={job.share_count}`;
  if (content.match(propRegex)) {
    content = content.replace(propRegex, propReplace);
  }

  fs.writeFileSync(filename, content);
}

updatePage('app/jobs/page.tsx');
updatePage('app/internships/page.tsx');
console.log("Success mapping counts");
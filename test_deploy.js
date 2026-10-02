async function checkSite() {
  const res = await fetch('https://www.trappedintoarchitecture.com/admin/add-job');
  const text = await res.text();
  console.log('HTML length:', text.length);
  
  const jsUrls = [...text.matchAll(/src="(\/_next\/static\/chunks\/[^"]+\.js)"/g)].map(m => m[1]);
  console.log('Found JS files:', jsUrls.length);
  
  let found = false;
  for (const url of jsUrls) {
    const chunkRes = await fetch('https://www.trappedintoarchitecture.com' + url);
    const chunkText = await chunkRes.text();
    if (chunkText.includes('DEBUG: image URL')) {
      console.log('Found alert in:', url);
      found = true;
    }
  }
  if (!found) {
     console.log('My code is NOT deployed on the main page loads. Checking app bundles...');
     const appBundleUrls = [...text.matchAll(/"(\/_next\/static\/chunks\/app\/[^"]+\.js)"/g)].map(m => m[1]);
     console.log("App bundles:", appBundleUrls.length);
     for (const url of appBundleUrls) {
       const chunkRes = await fetch('https://www.trappedintoarchitecture.com' + url);
       const chunkText = await chunkRes.text();
       if (chunkText.includes('DEBUG: image URL')) {
         console.log('Found alert in app bundle:', url);
         found = true;
       }
     }
  }
  if (!found) console.log('My code is definitively NOT deployed.');
}
checkSite();

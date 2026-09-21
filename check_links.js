fetch('https://trappedintoarchitecture.com/companies').then(r => r.text()).then(html => {
  const matches = html.match(/href="\/companies\/[^"]+"/g);
  if (matches) {
    console.log([...new Set(matches)]);
  } else {
    console.log("No links found");
  }
});

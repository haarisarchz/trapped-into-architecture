const fs = require('fs');
const acorn = require('acorn');
const jsx = require('acorn-jsx');
const Parser = acorn.Parser.extend(jsx());
try {
  let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');
  Parser.parse(c, { sourceType: 'module', ecmaVersion: 2020 });
  console.log('Passed!');
} catch(e) {
  console.error(e);
}
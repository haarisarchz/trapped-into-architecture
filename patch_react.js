const fs = require('fs');
let content = fs.readFileSync('app/internships/page.tsx', 'utf8');

content = content.replace('import { useState, useEffect } from "react";', 'import { useState, useEffect, useMemo } from "react";');
content = content.replace(/React\.useMemo/g, 'useMemo');
content = content.replace(/React\.useState/g, 'useState');
content = content.replace(/React\.useEffect/g, 'useEffect');

fs.writeFileSync('app/internships/page.tsx', content);
console.log("Patched React references");

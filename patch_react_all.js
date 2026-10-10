const fs = require('fs');

function fixReact(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('import { useState, useEffect }')) {
    content = content.replace('import { useState, useEffect } from "react";', 'import { useState, useEffect, useMemo } from "react";');
  } else if (content.includes('import { useState, useEffect, Suspense }')) {
    content = content.replace('import { useState, useEffect, Suspense } from "react";', 'import { useState, useEffect, Suspense, useMemo } from "react";');
  }
  
  content = content.replace(/React\.useMemo/g, 'useMemo');
  content = content.replace(/React\.useState/g, 'useState');
  content = content.replace(/React\.useEffect/g, 'useEffect');
  
  fs.writeFileSync(file, content);
}

fixReact('app/jobs/page.tsx');
fixReact('app/companies/page.tsx');
console.log("Fixed all React references.");

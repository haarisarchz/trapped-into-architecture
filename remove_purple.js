const fs = require("fs");
const path = require("path");

const dir = "e:\\Projects\\My Product\\HAARIS SIR WEBSITE\\app";

function replaceColors(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  // replacements
  content = content.replace(/purple-600/g, "black");
  content = content.replace(/purple-700/g, "gray-900");
  content = content.replace(/purple-500/g, "gray-600");
  content = content.replace(/purple-100/g, "gray-200");
  content = content.replace(/text-purple-600/g, "text-black");
  content = content.replace(/bg-purple-600/g, "bg-black");
  fs.writeFileSync(filePath, content, "utf-8");
}

function walk(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith(".tsx")) {
      replaceColors(fullPath);
    }
  }
}

walk(dir);
console.log("Colors replaced in app/");

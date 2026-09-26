const fs = require('fs');
let content = fs.readFileSync('components/home/InteractiveHome.tsx', 'utf8');

// Section spacing reduction
content = content.replace(/py-16 md:py-24/g, 'py-10 md:py-16');
content = content.replace(/py-16/g, 'py-10');
content = content.replace(/py-12/g, 'py-8');
content = content.replace(/mb-10/g, 'mb-6');
content = content.replace(/mb-8/g, 'mb-5');

// Portfolio Builder color change
const portfolioRegex = /<section className="py-10 px-6 lg:px-12 bg-blue-900 text-white w-full">([\s\S]*?)<h2 className="text-3xl font-bold mb-4">Portfolio Builder<\/h2>([\s\S]*?)<p className="text-blue-200 mb-5 text-lg">Build your architecture portfolio in seconds\.<\/p>([\s\S]*?)<a href="https:\/\/thecosmofolio\.com\/" target="_blank" rel="noopener noreferrer" className="bg-white\s*text-blue-900 font-bold py-4 px-10 rounded-full hover:bg-gray-100 transition shadow-lg inline-block">/s;

const portfolioReplace = `<section className="py-10 px-6 lg:px-12 bg-gray-50 text-black w-full border-t border-gray-100">$1<h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-gray-900 tracking-tight">Portfolio Builder</h2>$2<p className="text-gray-600 mb-6 text-lg max-w-2xl text-center">Build your architecture portfolio in seconds.</p>$3<a href="https://thecosmofolio.com/" target="_blank" rel="noopener noreferrer" className="bg-black text-white font-bold py-3.5 px-8 rounded-full hover:bg-gray-800 transition shadow inline-block border border-black">`;

if (content.match(portfolioRegex)) {
  content = content.replace(portfolioRegex, portfolioReplace);
  fs.writeFileSync('components/home/InteractiveHome.tsx', content);
  console.log("Success updating InteractiveHome UI");
} else {
  console.log("Regex not found in InteractiveHome");
}
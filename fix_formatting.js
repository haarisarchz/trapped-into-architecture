const fs = require('fs');
let code = fs.readFileSync('components/home/InteractiveHome.tsx', 'utf8');

const oldServices = /\{\/\* 5\. ARCHITECTURE SERVICES \& ALERTS \*\/\}[\s\S]*?\{\/\* 6\. CONNECT WITH US \*\/\}/;
const newServices = `{/* 5. ARCHITECTURE SERVICES */}
      <section className="py-16 px-6 lg:px-12 bg-gray-900 text-white w-full">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Architecture Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/contact?service=software-tutor" className="bg-gray-800 hover:bg-gray-700 p-6 rounded-2xl transition border border-gray-700 hover:border-gray-600 flex flex-col justify-center">
              <h3 className="font-semibold text-lg mb-2">Hire a Software Tutor</h3>
              <p className="text-gray-400 text-sm">Master BIM, CAD, and rendering tools with expert tutors.</p>
            </Link>
            <Link href="/contact?service=architect" className="bg-gray-800 hover:bg-gray-700 p-6 rounded-2xl transition border border-gray-700 hover:border-gray-600 flex flex-col justify-center">
              <h3 className="font-semibold text-lg mb-2">Hire an Architect</h3>
              <p className="text-gray-400 text-sm">Find the perfect architect for your next project.</p>
            </Link>
            <Link href="/contact?service=portfolio-critique" className="bg-gray-800 hover:bg-gray-700 p-6 rounded-2xl transition border border-gray-700 hover:border-gray-600 flex flex-col justify-center">
              <h3 className="font-semibold text-lg mb-2">Portfolio Critique</h3>
              <p className="text-gray-400 text-sm">Get expert feedback on your architecture portfolio.</p>
            </Link>
            <a href="https://thecosmofolio.com/" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-gray-700 p-6 rounded-2xl transition border border-gray-700 hover:border-gray-600 flex flex-col justify-center">
              <h3 className="font-semibold text-lg mb-2">Portfolio Builder</h3>
              <p className="text-gray-400 text-sm">Build your architecture portfolio in seconds.</p>
            </a>
          </div>
        </div>
      </section>

      {/* 6. CONNECT WITH US */}`;

code = code.replace(oldServices, newServices);

let pageCode = fs.readFileSync('app/page.tsx', 'utf8');
if (!pageCode.includes('revalidate = 0')) {
  pageCode = pageCode.replace('export default async function Home() {', 'export const revalidate = 0;\n\nexport default async function Home() {');
  fs.writeFileSync('app/page.tsx', pageCode);
}

// Fix lucide icons in Connect with Us
// Need to add them to import if missing. They might not exist in the import.
if (!code.includes('Instagram')) {
    code = code.replace('import { Search, MapPin, Building2, ArrowRight, MessageCircle, Globe, Mail, Smartphone, Send } from "lucide-react";', 'import { Search, MapPin, Building2, ArrowRight, MessageCircle, Globe, Mail, Smartphone, Send, Instagram, Facebook, Twitter } from "lucide-react";');
    code = code.replace('import { Search, MapPin, Building2, ArrowRight, MessageCircle, Globe } from "lucide-react";', 'import { Search, MapPin, Building2, ArrowRight, MessageCircle, Globe, Instagram, Facebook, Twitter, Send } from "lucide-react";');
}
code = code.replace(/<Globe size=\{20\} \/> Instagram Page/g, '<Instagram size={20} /> Instagram Page');
code = code.replace(/<Globe size=\{20\} \/> Facebook Page/g, '<Facebook size={20} /> Facebook Page');
code = code.replace(/<Globe size=\{20\} \/> X Page/g, '<Twitter size={20} /> X Page');

fs.writeFileSync('components/home/InteractiveHome.tsx', code);

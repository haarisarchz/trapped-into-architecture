const fs = require('fs');
let code = fs.readFileSync('components/home/InteractiveHome.tsx', 'utf8');

const additionalLinks = `
            {siteSettings?.whatsapp && (
              <a href={siteSettings.whatsapp.startsWith('http') ? siteSettings.whatsapp : 'https://wa.me/' + siteSettings.whatsapp.replace(/[^0-9]/g, '')} target="_blank" rel="noopener noreferrer" className="flex flex-col sm:flex-row items-center gap-3 bg-white hover:bg-green-50 border border-gray-200 px-6 py-4 rounded-2xl transition group w-full sm:w-auto min-w-[200px]">
                <div className="bg-green-100 p-2 rounded-full text-green-600 group-hover:bg-green-600 group-hover:text-white transition"><MessageCircle size={20} /></div>
                <span className="font-bold text-gray-800 text-sm">Direct WhatsApp</span>
              </a>
            )}
            {siteSettings?.email && (
              <a href={'mailto:' + siteSettings.email} target="_blank" rel="noopener noreferrer" className="flex flex-col sm:flex-row items-center gap-3 bg-white hover:bg-red-50 border border-gray-200 px-6 py-4 rounded-2xl transition group w-full sm:w-auto min-w-[200px]">
                <div className="bg-red-100 p-2 rounded-full text-red-600 group-hover:bg-red-600 group-hover:text-white transition"><Mail size={20} /></div>
                <span className="font-bold text-gray-800 text-sm">Email Us</span>
              </a>
            )}
            {siteSettings?.website_url && (
              <a href={siteSettings.website_url} target="_blank" rel="noopener noreferrer" className="flex flex-col sm:flex-row items-center gap-3 bg-white hover:bg-purple-50 border border-gray-200 px-6 py-4 rounded-2xl transition group w-full sm:w-auto min-w-[200px]">
                <div className="bg-purple-100 p-2 rounded-full text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition"><Globe size={20} /></div>
                <span className="font-bold text-gray-800 text-sm">Website</span>
              </a>
            )}`;

code = code.replace('{siteSettings?.whatsapp_channel_url && (', additionalLinks + '\n            {siteSettings?.whatsapp_channel_url && (');
fs.writeFileSync('components/home/InteractiveHome.tsx', code);

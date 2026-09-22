const fs = require('fs');
let code = fs.readFileSync('components/home/InteractiveHome.tsx', 'utf8');

// 1. Social Links - Replace 6. CONNECT WITH US
const oldSocial = code.substring(code.indexOf('{/* 6. CONNECT WITH US */}'), code.indexOf('</main>'));
const newSocial = `{/* 6. CONNECT WITH US */}
      <section className="py-16 px-6 lg:px-12 bg-white text-center w-full border-t border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Connect With Us</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {siteSettings?.whatsapp_channel_url ? (
            <a href={siteSettings.whatsapp_channel_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-green-600 font-medium">
              <MessageCircle size={20} /> WhatsApp
            </a>
          ) : (
            <Link href="/unavailable?service=WhatsApp" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-green-600 font-medium">
              <MessageCircle size={20} /> WhatsApp
            </Link>
          )}

          {siteSettings?.instagram ? (
            <a href={siteSettings.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-pink-600 font-medium">
              <InstagramIcon size={20} /> Instagram
            </a>
          ) : (
            <Link href="/unavailable?service=Instagram" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-pink-600 font-medium">
              <InstagramIcon size={20} /> Instagram
            </Link>
          )}

          {siteSettings?.facebook ? (
            <a href={siteSettings.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-blue-800 font-medium">
              <FacebookIcon size={20} /> Facebook
            </a>
          ) : (
            <Link href="/unavailable?service=Facebook" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-blue-800 font-medium">
              <FacebookIcon size={20} /> Facebook
            </Link>
          )}

          {siteSettings?.twitter ? (
            <a href={siteSettings.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-blue-400 font-medium">
              <TwitterIcon size={20} /> X
            </a>
          ) : (
            <Link href="/unavailable?service=X" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-blue-400 font-medium">
              <TwitterIcon size={20} /> X
            </Link>
          )}

          {siteSettings?.telegram_channel_url ? (
            <a href={siteSettings.telegram_channel_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-blue-500 font-medium">
              <Send size={20} /> Telegram
            </a>
          ) : (
            <Link href="/unavailable?service=Telegram" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-blue-500 font-medium">
              <Send size={20} /> Telegram
            </Link>
          )}
        </div>
      </section>
`;
code = code.replace(oldSocial, newSocial + '\n        </main>\n  );\n}\n');

// 2. Portfolio Builder and Architecture Services
const oldServices = code.substring(code.indexOf('{/* 5. ARCHITECTURE SERVICES */}'), code.indexOf('{/* 6. CONNECT WITH US */}'));
const newServices = `{/* 5. ARCHITECTURE SERVICES */}
      <section className="py-16 px-6 lg:px-12 bg-gray-900 text-white w-full">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Architecture Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/contact?service=software-tutor" className="bg-gray-800 hover:bg-gray-700 p-6 rounded-2xl transition border border-gray-700 hover:border-gray-600 flex flex-col justify-center text-center">
              <h3 className="font-semibold text-lg mb-2">Hire a Software Tutor</h3>
              <p className="text-gray-400 text-sm">Master BIM, CAD, and rendering tools with expert tutors.</p>
            </Link>
            <Link href="/contact?service=architect" className="bg-gray-800 hover:bg-gray-700 p-6 rounded-2xl transition border border-gray-700 hover:border-gray-600 flex flex-col justify-center text-center">
              <h3 className="font-semibold text-lg mb-2">Hire an Architect</h3>
              <p className="text-gray-400 text-sm">Find the perfect architect for your next project.</p>
            </Link>
            <Link href="/contact?service=portfolio-critique" className="bg-gray-800 hover:bg-gray-700 p-6 rounded-2xl transition border border-gray-700 hover:border-gray-600 flex flex-col justify-center text-center">
              <h3 className="font-semibold text-lg mb-2">Portfolio Critique</h3>
              <p className="text-gray-400 text-sm">Get expert feedback on your architecture portfolio.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* 5.5 PORTFOLIO BUILDER */}
      <section className="py-16 px-6 lg:px-12 bg-blue-900 text-white w-full">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4">Portfolio Builder</h2>
          <p className="text-blue-200 mb-8 text-lg">Build your architecture portfolio in seconds.</p>
          <a href="https://thecosmofolio.com/" target="_blank" rel="noopener noreferrer" className="bg-white text-blue-900 font-bold py-4 px-10 rounded-full hover:bg-gray-100 transition shadow-lg inline-block">
            Build Your Portfolio
          </a>
        </div>
      </section>

      `;
code = code.replace(oldServices, newServices);

fs.writeFileSync('components/home/InteractiveHome.tsx', code);

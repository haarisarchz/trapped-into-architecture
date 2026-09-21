const fs = require('fs');
let code = fs.readFileSync('components/home/InteractiveHome.tsx', 'utf8');

const newConnectSection = `{/* 6. CONNECT WITH US */}
      <section className="py-16 px-6 lg:px-12 bg-white text-center w-full border-t border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Connect With Us</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {siteSettings?.whatsapp_channel_url && (
            <a href={siteSettings.whatsapp_channel_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-green-600 font-medium">
              <MessageCircle size={20} /> WhatsApp Channel
            </a>
          )}
          {siteSettings?.telegram_channel_url && (
            <a href={siteSettings.telegram_channel_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-blue-500 font-medium">
              <Globe size={20} /> Telegram Channel
            </a>
          )}
          {siteSettings?.instagram && (
            <a href={siteSettings.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-pink-600 font-medium">
              <Globe size={20} /> Instagram Page
            </a>
          )}
          {siteSettings?.facebook && (
            <a href={siteSettings.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-blue-800 font-medium">
              <Globe size={20} /> Facebook Page
            </a>
          )}
          {siteSettings?.twitter && (
            <a href={siteSettings.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-6 py-3 rounded-full transition text-gray-700 hover:text-blue-400 font-medium">
              <Globe size={20} /> X Page
            </a>
          )}
          
          {/* Fallback if no settings */}
          {!siteSettings?.whatsapp_channel_url && !siteSettings?.telegram_channel_url && !siteSettings?.instagram && !siteSettings?.facebook && !siteSettings?.twitter && (
            <p className="text-gray-500">Social channels will appear here once configured in the Admin Dashboard.</p>
          )}
        </div>
      </section>

    </main>
  );
}`;

code = code.replace(/\{\/\* 6\. CONNECT WITH US \*\/\}[\s\S]*?<\/main>[\s\S]*?\);/, newConnectSection);
fs.writeFileSync('components/home/InteractiveHome.tsx', code);

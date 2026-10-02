const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// 1. Add state variables
file = file.replace(
  'const [uploadMode, setUploadMode] = useState<"text" | "image" | "url">("image");',
  `const [uploadMode, setUploadMode] = useState<"text" | "image" | "url">("image");
  const [showAiSettings, setShowAiSettings] = useState(false);
  const [personalGeminiKey, setPersonalGeminiKey] = useState("");
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPersonalGeminiKey(localStorage.getItem("admin_gemini_key") || "");
    }
  }, []);`
);

// 2. Add headers to fetch
file = file.replace(
  `const response = await fetch("/api/extract-job", {
        method: "POST",
        body: formData,
      });`,
  `const userGeminiKey = localStorage.getItem("admin_gemini_key");
      const headers = userGeminiKey ? { "x-user-gemini-key": userGeminiKey } : {};
      const response = await fetch("/api/extract-job", {
        method: "POST",
        headers: headers,
        body: formData,
      });`
);

// 3. Add UI button for config
file = file.replace(
  '<h2 className="text-2xl font-black mt-4 tracking-tight">Smart Job</h2>',
  `<div className="flex items-center justify-between mt-4">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Smart Job</h2>
                  </div>
                  <button 
                    onClick={() => setShowAiSettings(true)}
                    className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    ⚙️ API Config
                  </button>
                </div>`
);

// 4. Append modal
const modal = `
                {showAiSettings && (
                  <div className="absolute inset-0 bg-white z-30 p-8 flex flex-col">
                    <button onClick={() => setShowAiSettings(false)} className="absolute right-5 top-5 text-gray-400 hover:text-black">✖</button>
                    <h3 className="text-xl font-bold mb-2 text-black">Gemini API Settings</h3>
                    <p className="text-xs text-gray-500 mb-6">Enter your personal Google Gemini API Key to bypass the shared Free Tier limits.</p>
                    
                    <label className="text-sm font-semibold mb-2 block text-black">Your API Key</label>
                    <input 
                      type="password"
                      value={personalGeminiKey}
                      onChange={(e) => setPersonalGeminiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-black outline-none mb-4 transition-colors text-black"
                    />
                    
                    <div className="text-xs text-gray-400 mb-6">
                      <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Get an API key from Google AI Studio</a>
                      <p className="mt-2">This key is securely stored only in your browser (localStorage) and never saved to our database.</p>
                    </div>
                    
                    <div className="mt-auto flex gap-3">
                      <button 
                        onClick={() => setShowAiSettings(false)}
                        className="flex-1 border border-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-50 text-black"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => {
                          localStorage.setItem("admin_gemini_key", personalGeminiKey);
                          setShowAiSettings(false);
                          alert("API Key saved locally!");
                        }}
                        className="flex-1 bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-900 shadow-lg"
                      >
                        Save Key
                      </button>
                    </div>
                  </div>
                )}
`;

// Insert modal right before the end of the smart upload section
file = file.replace('Extract Details"\n                    )}\n                  </button>\n                </div>', 'Extract Details"\n                    )}\n                  </button>\n                </div>' + modal);

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log('UI Patch successful.');

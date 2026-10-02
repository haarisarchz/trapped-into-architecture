const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// 1. Add state variables
const stateHook = 'const [uploadMode, setUploadMode] = useState<"text" | "image" | "url">("image");';
const newStateHooks = `const [uploadMode, setUploadMode] = useState<"text" | "image" | "url">("image");
  const [showAiSettings, setShowAiSettings] = useState(false);
  const [personalGeminiKey, setPersonalGeminiKey] = useState("");
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPersonalGeminiKey(localStorage.getItem("admin_gemini_key") || "");
    }
  }, []);`;
file = file.replace(stateHook, newStateHooks);

// 2. Add headers to fetch
const fetchCall = `const response = await fetch("/api/extract-job", {
          method: "POST",
          body: formData,
        });`;
const newFetchCall = `const userGeminiKey = localStorage.getItem("admin_gemini_key");
        const headers = userGeminiKey ? { "x-user-gemini-key": userGeminiKey } : {};
        const response = await fetch("/api/extract-job", {
          method: "POST",
          headers: headers,
          body: formData,
        });`;
file = file.replace(fetchCall, newFetchCall);

// 3. Add UI button for config
const headerSection = `<h2 className="text-2xl font-black mt-4 tracking-tight">Smart Job</h2>
                <p className="text-black text-xs mb-6 uppercase tracking-widest font-bold">Extraction Mode</p>`;
const newHeaderSection = `<div className="flex items-center justify-between mt-4">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Smart Job</h2>
                    <p className="text-black text-xs mb-6 uppercase tracking-widest font-bold mt-1">Extraction Mode</p>
                  </div>
                  <button 
                    onClick={() => setShowAiSettings(true)}
                    className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg font-bold text-gray-600 hover:bg-gray-200 transition-colors mb-5"
                  >
                    API Config
                  </button>
                </div>`;
file = file.replace(headerSection, newHeaderSection);

// 4. Add the actual modal UI inside the Smart Job modal wrapper
const extractButton = `{loadingAI === "loading" ? (
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "✨ Extract Details"
                    )}
                  </button>
                </div>`;
const modalUI = `{loadingAI === "loading" ? (
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "✨ Extract Details"
                    )}
                  </button>
                </div>
                
                {showAiSettings && (
                  <div className="absolute inset-0 bg-white z-30 p-8 flex flex-col">
                    <button onClick={() => setShowAiSettings(false)} className="absolute right-5 top-5 text-gray-400 hover:text-black">✖</button>
                    <h3 className="text-xl font-bold mb-2">Gemini API Settings</h3>
                    <p className="text-xs text-gray-500 mb-6">Enter your personal Google Gemini API Key to bypass the shared Free Tier limits.</p>
                    
                    <label className="text-sm font-semibold mb-2 block">Your API Key</label>
                    <input 
                      type="password"
                      value={personalGeminiKey}
                      onChange={(e) => setPersonalGeminiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-black outline-none mb-4 transition-colors"
                    />
                    
                    <div className="text-xs text-gray-400 mb-6">
                      <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Get an API key from Google AI Studio</a>
                      <p className="mt-2">This key is securely stored only in your browser (localStorage) and never saved to our database.</p>
                    </div>
                    
                    <div className="mt-auto flex gap-3">
                      <button 
                        onClick={() => setShowAiSettings(false)}
                        className="flex-1 border border-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-50"
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
                )}`;
// Wait, the string to replace might use different quotes or spacing. Let's use a regex or string fallback if it fails.
if(file.includes(extractButton)) {
    file = file.replace(extractButton, modalUI);
} else {
    console.error("Could not find the extract button to insert the settings modal.");
    // Fallback: append before the closing div of the right pane
    const rightPaneClosing = `</div>
            </div>
          </div>
        </div>
      )}`;
    file = file.replace(rightPaneClosing, modalUI.substring(modalUI.indexOf("{showAiSettings")) + "\n" + rightPaneClosing);
}

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log('Successfully updated add-job UI.');

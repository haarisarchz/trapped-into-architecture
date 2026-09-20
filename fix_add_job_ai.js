const fs = require('fs');
let code = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// 1. Add missing states
if (!code.includes('aiExtractedData')) {
  code = code.replace(
    'const [loadingAI, setLoadingAI] = useState(false);',
    'const [loadingAI, setLoadingAI] = useState(false);\nconst [aiExtractedData, setAiExtractedData] = useState<any>(null);\nconst [showAIPreview, setShowAIPreview] = useState(false);'
  );
}

// 2. Implement handleSmartExtraction
const extractFuncSearch = `const handleSmartExtraction = async () => {

};`;

const extractFuncReplace = `const handleSmartExtraction = async () => {
  if (uploadMode === 'text' && !smartText.trim()) {
    alert("Please enter text to extract");
    return;
  }
  if (uploadMode === 'image' && !smartImage) {
    alert("Please upload an image to extract");
    return;
  }

  setLoadingAI(true);
  try {
    const formData = new FormData();
    formData.append("mode", uploadMode);
    if (uploadMode === 'text') {
      formData.append("text", smartText);
    } else {
      formData.append("image", smartImage as Blob);
    }

    const res = await fetch("/api/extract-job", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to extract data");
    }

    setAiExtractedData(data);
    setShowAIPreview(true);
  } catch (err: any) {
    alert(err.message);
  } finally {
    setLoadingAI(false);
  }
};`;

code = code.replace(extractFuncSearch, extractFuncReplace);

// 3. Add AI Preview UI and inject it. 
// We will replace the bottom of the showSmartUpload popup.
// Right now, it has a button: `<button onClick={handleSmartExtraction} className="w-full bg-black text-white rounded-full py-4 ...">`
const buttonSearch = `<button
                        onClick={handleSmartExtraction}
                        className="w-full bg-black text-white rounded-full py-4 font-bold text-lg hover:bg-gray-800 transition shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
                        disabled={loadingAI}
                      >
                        {loadingAI ? "Extracting..." : \`Extract \${uploadMode === 'image' ? 'Image' : 'Text'}\`}
                      </button>`;

const buttonReplace = `<button
                        onClick={handleSmartExtraction}
                        className="w-full bg-black text-white rounded-full py-4 font-bold text-lg hover:bg-gray-800 transition shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
                        disabled={loadingAI}
                      >
                        {loadingAI ? "Extracting..." : \`Extract \${uploadMode === 'image' ? 'Image' : 'Text'}\`}
                      </button>

                      {showAIPreview && aiExtractedData && (
                        <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4">
                          <div className="bg-white max-w-lg w-full rounded-3xl p-8 overflow-y-auto max-h-[90vh]">
                            <h3 className="text-2xl font-bold mb-4">Extracted Details</h3>
                            <div className="space-y-3 mb-6 text-sm">
                              <p><strong>Position:</strong> {aiExtractedData.position}</p>
                              <p><strong>Company:</strong> {aiExtractedData.company}</p>
                              <p><strong>Experience:</strong> {aiExtractedData.experience}</p>
                              <p><strong>Location:</strong> {aiExtractedData.city}, {aiExtractedData.state}</p>
                              <p><strong>Type:</strong> {aiExtractedData.employmentType} / {aiExtractedData.workplaceType}</p>
                            </div>
                            <div className="flex gap-4">
                              <button
                                onClick={() => {
                                  setShowAIPreview(false);
                                }}
                                className="flex-1 py-3 font-semibold border rounded-xl hover:bg-gray-50"
                              >
                                Edit / Cancel
                              </button>
                              <button
                                onClick={() => {
                                  if (aiExtractedData.position) setJobPosition(aiExtractedData.position);
                                  if (aiExtractedData.company) setFirmName(aiExtractedData.company);
                                  if (aiExtractedData.experience) setExperience(aiExtractedData.experience);
                                  if (aiExtractedData.city) setCity(aiExtractedData.city);
                                  if (aiExtractedData.state) setState(aiExtractedData.state);
                                  if (aiExtractedData.description) setJobDescription(aiExtractedData.description);
                                  if (aiExtractedData.employmentType) setEmploymentType(aiExtractedData.employmentType);
                                  if (aiExtractedData.workplaceType) setWorkplaceType(aiExtractedData.workplaceType);
                                  if (aiExtractedData.applicationEmail) setApplicationEmail(aiExtractedData.applicationEmail);
                                  if (aiExtractedData.deadline) setLastDateToApply(aiExtractedData.deadline);
                                  
                                  setShowAIPreview(false);
                                  setShowSmartUpload(false);
                                }}
                                className="flex-1 py-3 font-semibold bg-black text-white rounded-xl hover:bg-gray-800"
                              >
                                Confirm
                              </button>
                            </div>
                          </div>
                        </div>
                      )}`;

code = code.replace(buttonSearch, buttonReplace);

fs.writeFileSync('app/admin/add-job/page.tsx', code);
console.log('Fixed Add Job AI Integration');

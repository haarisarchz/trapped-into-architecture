const fs = require('fs');
let code = fs.readFileSync('app/admin/jobs/edit/[id]/page.tsx', 'utf8');

// We need to fetch social logs on load
if (!code.includes('socialLogs')) {
  // Add state
  code = code.replace(
    'const [uploadingImage, setUploadingImage] = useState(false);',
    'const [uploadingImage, setUploadingImage] = useState(false);\nconst [socialLogs, setSocialLogs] = useState<any[]>([]);\nconst [isRetrying, setIsRetrying] = useState<string | null>(null);'
  );

  // Fetch logic inside existing useEffect or data fetcher
  const fetchPattern = 'setJobData(data);';
  if (code.includes(fetchPattern)) {
    const fetchSocial = `
      setJobData(data);
      // Fetch social logs
      const { data: sLogs } = await supabase.from('social_publishing_logs').select('*').eq('job_id', id);
      if (sLogs) setSocialLogs(sLogs);
    `;
    code = code.replace(fetchPattern, fetchSocial);
  }

  // Retry logic
  const retryFunc = `
  const handleRetrySocial = async (platform: string) => {
    setIsRetrying(platform);
    try {
      const res = await fetch("/api/publish/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: params.id, retry_platform: platform })
      });
      if (res.ok) {
        alert("Retry initiated successfully.");
        // Re-fetch logs
        const { data: sLogs } = await supabase.from('social_publishing_logs').select('*').eq('job_id', params.id);
        if (sLogs) setSocialLogs(sLogs);
      } else {
        const errData = await res.json();
        alert("Retry failed: " + errData.error);
      }
    } catch (err) {
      alert("Error: " + err);
    }
    setIsRetrying(null);
  };
  `;

  // Insert before the component return
  const returnIdx = code.indexOf('return (');
  if (returnIdx !== -1) {
    code = code.slice(0, returnIdx) + retryFunc + '\n  ' + code.slice(returnIdx);
  }

  // UI
  const socialUI = `
    {/* SOCIAL PUBLISHING STATUS */}
    <div className="mb-10 p-6 border border-gray-200 rounded-2xl bg-white shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Social Publishing Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["whatsapp", "telegram", "facebook", "instagram", "x", "linkedin"].map(platform => {
          const log = socialLogs.find(l => l.platform === platform);
          const status = log ? log.status : "pending";
          const isFailed = status === "failed" || status === "not_configured";
          
          return (
            <div key={platform} className="flex items-center justify-between p-4 border rounded-xl bg-gray-50">
              <div className="flex flex-col">
                <span className="font-bold capitalize">{platform}</span>
                <span className={\`text-sm \${status === 'published' ? 'text-green-600' : isFailed ? 'text-red-500' : 'text-gray-500'}\`}>
                  {status.replace('_', ' ').toUpperCase()}
                  {log?.error_message && <span className="block text-xs mt-1 max-w-xs truncate" title={log.error_message}>{log.error_message}</span>}
                </span>
              </div>
              <div>
                {isFailed && (
                  <button 
                    type="button"
                    onClick={() => handleRetrySocial(platform)}
                    disabled={isRetrying === platform}
                    className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50"
                  >
                    {isRetrying === platform ? "Retrying..." : "Retry"}
                  </button>
                )}
                {status === "published" && log?.external_post_url && (
                  <a href={log.external_post_url} target="_blank" rel="noreferrer" className="text-blue-500 text-sm hover:underline">
                    View Post
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  `;

  // Insert above `<div className="mb-10">` -> usually Basic Details
  const formStart = '<div className="grid grid-cols-1 md:grid-cols-3 gap-4">';
  if (code.includes(formStart)) {
    code = code.replace(formStart, socialUI + '\n' + formStart);
  }

  fs.writeFileSync('app/admin/jobs/edit/[id]/page.tsx', code);
  console.log('Fixed edit job page social UI');
}

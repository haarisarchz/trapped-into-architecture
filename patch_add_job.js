const fs = require('fs');
let file = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

// 1. Change the button action inside the schedule modal
file = file.replace(
  'onClick={() => setShowSchedule(true)}\n            className="px-6 py-3 bg-black text-white rounded-xl"\n          >\n            Schedule\n          </button>',
  'onClick={handleSchedule}\n            disabled={actionLoading !== null}\n            className="px-6 py-3 bg-black text-white rounded-xl"\n          >\n            {actionLoading === "scheduled" ? "Scheduling..." : "Schedule"}\n          </button>'
);

// 2. Change isPublishing to actionLoading
file = file.replace(
  'const [isPublishing, setIsPublishing] = useState(false);',
  'const [actionLoading, setActionLoading] = useState<string | null>(null);'
);

// Replace setIsPublishing usages
file = file.replace(/setIsPublishing\(true\);/g, 'setActionLoading(status);');
file = file.replace(/setIsPublishing\(false\);/g, 'setActionLoading(null);');

// Replace button states
file = file.replace(
  'disabled={isPublishing || uploadingImage} onClick={handleSaveDraft}',
  'disabled={actionLoading !== null || uploadingImage} onClick={handleSaveDraft}'
);
file = file.replace(
  '>\n      Save Draft\n    </button>',
  '>\n      {actionLoading === "draft" ? "Saving..." : "Save Draft"}\n    </button>'
);

file = file.replace(
  'disabled={isPublishing || uploadingImage} onClick={() => setShowSchedule(true)}',
  'disabled={actionLoading !== null || uploadingImage} onClick={() => setShowSchedule(true)}'
);

file = file.replace(
  'disabled={isPublishing}\n      onClick={() => handlePublishJob("published")}',
  'disabled={actionLoading !== null}\n      onClick={() => handlePublishJob("published")}'
);

file = file.replace(
  '{isPublishing ? "Publishing..." : (selectedCompanyId && isCompanyProfileDirty ? "Update & Save" : "Publish Job")}',
  '{actionLoading === "published" ? "Publishing..." : (selectedCompanyId && isCompanyProfileDirty ? "Update & Save" : "Publish Job")}'
);

// 3. Fix the company visibility issue: set is_active on new company creation
// Find the insert block for new company
file = file.replace(
  '{ ...companyPayload, slug: companySlug, created_by: authorId }',
  '{ ...companyPayload, slug: companySlug, created_by: authorId, is_active: status === "published" }'
);

fs.writeFileSync('app/admin/add-job/page.tsx', file);
console.log("Patched page.tsx");

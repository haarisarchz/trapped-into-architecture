const fs = require('fs');
let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

const oldDelete = `  /* DELETE JOB */
  const deleteJob = async (job: any) => {
    const confirmDelete = confirm("Delete this job?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("jobs").delete().eq("id", job.id);
    if (error) {
      console.log(error);
    } else {
      fetchJobs();
    }
  };`;

const newDelete = `  /* DELETE JOB MODAL LOGIC */
  const deleteJob = (job: any) => {
    setJobToDelete(job);
  };

  const executeDelete = async (mode: "single" | "all") => {
    if (!jobToDelete) return;
    
    if (mode === "single") {
      await supabase.from("jobs").delete().eq("id", jobToDelete.id);
    } else {
      let query = supabase.from("jobs").delete()
        .eq("firm_name", jobToDelete.firm_name)
        .eq("status", jobToDelete.status);
      
      if (jobToDelete.posted_date) query = query.eq("posted_date", jobToDelete.posted_date);
      if (jobToDelete.image) query = query.eq("image", jobToDelete.image);
      
      await query;
    }
    
    setJobToDelete(null);
    fetchJobs();
  };`;

if (content.includes(oldDelete)) {
  content = content.replace(oldDelete, newDelete);
  
  // Now add the modal at the end of the return statement.
  // We look for </main> ending tag.
  const modalHTML = `
      {jobToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Delete Job</h2>
            <p className="mb-6 text-gray-600 text-sm">Do you want to delete just this position, or all positions created together in this form?</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => {
                if (window.confirm("Confirm delete ONE job?")) {
                  executeDelete("single");
                }
              }} className="px-5 py-3.5 bg-red-50 text-red-700 font-bold rounded-xl hover:bg-red-100 transition border border-red-100">
                Delete One Job
              </button>
              
              <button onClick={() => {
                if (window.confirm("Are you sure you want to delete ALL jobs in this form?")) {
                  executeDelete("all");
                }
              }} className="px-5 py-3.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-md">
                Delete All Jobs in Form
              </button>

              <button onClick={() => setJobToDelete(null)} className="px-5 py-3.5 border rounded-xl hover:bg-gray-50 mt-2 font-semibold transition text-gray-700">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>`;
  
  content = content.replace('</main>', modalHTML);
  fs.writeFileSync('app/admin/jobs/page.tsx', content);
  console.log("Success replacing delete job");
} else {
  console.log("deleteJob not found");
}

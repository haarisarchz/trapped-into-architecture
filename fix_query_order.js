const fs = require('fs');
let file = fs.readFileSync('app/jobs/[id]/page.tsx', 'utf8');

const badLogic = `  const { data: company } = await supabase
    .from("companies")
    .select("slug, phone, email, website")
    .eq("firm_name", job?.firm_name || "")
    .maybeSingle();

  if (!job || error) {`;

const goodLogic = `  if (!job || error) {
    return (
      <main className="p-10">
        <h1 className="text-5xl font-bold">Job Not Found</h1>
      </main>
    );
  }

  const { data: company } = await supabase
    .from("companies")
    .select("slug, phone, email, website")
    .eq("firm_name", job.firm_name || "")
    .maybeSingle();`;

file = file.replace(badLogic, goodLogic);

// But wait, I need to make sure I don't duplicate the if (!job || error) block!
// The original code already has it below maybeSingle.
// I'll just remove the old if (!job || error) block completely since I moved it up.

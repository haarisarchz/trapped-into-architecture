const fs = require('fs');
let content = fs.readFileSync('app/admin/add-job/page.tsx', 'utf8');

const regex = /<input type="text" value=\{\(pos\.skills \|\| \[\]\)\.join\(\", \"\)\} onChange=\{\(e\) => \{\s*const vals = e\.target\.value\.split\(\",\"\)\.map\(v=>v\.trim\(\)\)\.filter\(Boolean\);\s*updatePosition\(index, "skills", vals\);\s*\}\} className="w-full border rounded-xl px-3 py-2\.5 text-sm bg-white text-black" placeholder="e\.g\. AutoCAD, Revit \(comma separated\)" \/>/s;

const replacement = `<Autocomplete
  value={pos.skill_input || ""}
  onChange={(val) => {
    if (val.endsWith(",")) {
      const newSkill = val.slice(0, -1).trim();
      const currentSkills = pos.skills || [];
      if (newSkill && !currentSkills.includes(newSkill)) {
        updatePosition(index, "skills", [...currentSkills, newSkill]);
      }
      updatePosition(index, "skill_input", "");
    } else {
      updatePosition(index, "skill_input", val);
    }
  }}
  onSelect={(val) => {
    const newSkill = val.trim();
    const currentSkills = pos.skills || [];
    if (newSkill && !currentSkills.includes(newSkill)) {
      updatePosition(index, "skills", [...currentSkills, newSkill]);
    }
    updatePosition(index, "skill_input", "");
  }}
  fetchSuggestions={async (q) => {
    const { data } = await supabase.from("jobs").select("skills_required").limit(100);
    if (!data) return [];
    const all = new Set();
    data.forEach(job => {
      if (Array.isArray(job.skills_required)) {
        job.skills_required.forEach((s) => {
          if (s.toLowerCase().includes(q.toLowerCase())) all.add(s);
        });
      } else if (typeof job.skills_required === "string" && job.skills_required.toLowerCase().includes(q.toLowerCase())) {
        all.add(job.skills_required);
      }
    });
    return Array.from(all).slice(0, 10);
  }}
  placeholder="Type skill and press comma or select"
  className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white text-black"
/>
<div className="flex flex-wrap gap-2 mt-3">
  {(pos.skills || []).map((skill: string) => (
    <div key={skill} className="bg-black text-white px-3 py-1 text-sm rounded-full flex items-center gap-2">
      <span>{skill}</span>
      <button type="button" onClick={() => {
        updatePosition(index, "skills", (pos.skills || []).filter((s: string) => s !== skill));
      }} className="hover:text-red-400 transition">
        &times;
      </button>
    </div>
  ))}
</div>`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('app/admin/add-job/page.tsx', content);
  console.log("Success replacing skills UI for individual positions");
} else {
  console.log("Regex not found");
}

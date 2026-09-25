const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

const qualRegex = /{\/\* QUALIFICATION \*\/} <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> <div> <label className="block mb-2 font-medium"> Qualifications <\/label> <input type="text" placeholder="B\.Arch" value={qualifications} onChange={\(e\) => setQualifications\(e\.target\.value\)} className="w-full border rounded-2xl px-4 py-3" \/> <\/div> <\/div>/;

const qualReplacement = '{/* QUALIFICATION */} <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> <div> <label className="block mb-2 font-medium"> Qualifications </label>' + 
'<Autocomplete value={qualifications as string} onChange={(val) => setQualifications(val as any)} fetchSuggestions={async (q) => { const { data } = await supabase.from("jobs").select("qualifications").ilike("qualifications", "%" + q + "%").limit(20); return Array.from(new Set(data?.map(d => d.qualifications).filter(Boolean))) || []; }} className="w-full border rounded-2xl px-4 py-3 bg-white text-black" placeholder="e.g. B.Arch" />' + 
'</div> </div>';

c = c.replace(qualRegex, qualReplacement);

const skillRegex = /<input\s*type="text"\s*value={skillInput}\s*onChange={\(e\) => {[\s\S]*?}}[\s\S]*?className="w-full border rounded-2xl px-4 py-3"\s*\/>/;

const skillReplacement = '<Autocomplete ' +
'value={skillInput} ' +
'onChange={(val) => { ' +
'  if (val.endsWith(",")) { ' +
'    const newSkill = val.slice(0, -1).trim(); ' +
'    if (newSkill && !skills.includes(newSkill)) { setSkills([...skills, newSkill]); } ' +
'    setSkillInput(""); ' +
'  } else { ' +
'    setSkillInput(val); ' +
'  } ' +
'}} ' +
'onSelect={(val) => { ' +
'  const newSkill = val.trim(); ' +
'  if (newSkill && !skills.includes(newSkill)) { setSkills([...skills, newSkill]); } ' +
'  setSkillInput(""); ' +
'}} ' +
'fetchSuggestions={async (q) => { ' +
'  const { data } = await supabase.from("jobs").select("skills_required").limit(100); ' +
'  if (!data) return []; ' +
'  const all = new Set(); ' +
'  data.forEach(job => { ' +
'    if (Array.isArray(job.skills_required)) { ' +
'      job.skills_required.forEach((s) => { ' +
'        if (s.toLowerCase().includes(q.toLowerCase())) all.add(s); ' +
'      }); ' +
'    } else if (typeof job.skills_required === "string" && job.skills_required.toLowerCase().includes(q.toLowerCase())) { ' +
'      all.add(job.skills_required); ' +
'    } ' +
'  }); ' +
'  return Array.from(all).slice(0, 10) as string[]; ' +
'}} ' +
'placeholder="Type skill and press comma or select" ' +
'className="w-full border rounded-2xl px-4 py-3 bg-white text-black" ' +
'/>';

c = c.replace(skillRegex, skillReplacement);

fs.writeFileSync('app/admin/add-job/page.tsx', c);
console.log('Done');
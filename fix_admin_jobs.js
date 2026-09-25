const fs = require('fs');
let code = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

// ── Replace state declarations + fetchJobs ──────────────────────────────────

const oldBlock = `  const [jobs, setJobs] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  useEffect(() => { setCurrentUser(JSON.parse(localStorage.getItem(\"currentUser\") || \"null\")); }, []);`;

const newBlock = `  const [jobs, setJobs] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loggedProfile, setLoggedProfile] = useState<any>(null);
  useEffect(() => { setCurrentUser(JSON.parse(localStorage.getItem(\"currentUser\") || \"null\")); }, []);`;

code = code.replace(oldBlock, newBlock);

// ── Replace the fetchJobs function body (the part that uses user?.id wrongly) ──

// Fix the profiles select to include role
code = code.replace(
  `const { data: profilesData } = await supabase.from(\"profiles\").select(\"id, display_name, full_name, username\");`,
  `const { data: profilesData } = await supabase.from(\"profiles\").select(\"id, display_name, full_name, username, role\");`
);

// Replace the block that reads user from localStorage and does wrong id comparison
const oldFetchBlock = `const fetchJobs = async () => {
    const user = JSON.parse(
      localStorage.getItem(\"currentUser\") || \"null\"
    );

    let query = supabase
      .from(\"jobs\")
      .select(\"*\");

    if (statusFilter && ![\"active\", \"expired\"].includes(statusFilter)) {
      query = query.eq(\"status\", statusFilter);
    }

    const { data, error } = await query.order(\"id\", {
      ascending: false,
    });

    if (error) {
      console.log(error);
      return;
    }

    let filteredJobs = data || [];

    // Manually fetch profiles to avoid Supabase relation crashes if foreign key is missing
    const { data: profilesData } = await supabase.from(\"profiles\").select(\"id, display_name, full_name, username, role\");
    const profilesMap: Record<string, any> = {};
    if (profilesData) {
      profilesData.forEach(p => profilesMap[p.id] = p);
    }

    // Enforce role locally to prevent schema crash if migration hasn't run
    const roleStr = (user?.role || \"\").toLowerCase().replace(/[\\s_]+/g, \"\");
    if (roleStr !== \"ceo\") {
      filteredJobs = filteredJobs.filter((job: any) => !job.author_id || job.author_id === user?.id);
    }
    
    // Attach profiles safely
    filteredJobs = filteredJobs.map((job: any) => ({
      ...job,
      profiles: job.author_id ? profilesMap[job.author_id] : null
    }));`;

const newFetchBlock = `const fetchJobs = async () => {
    const stored = JSON.parse(
      localStorage.getItem(\"currentUser\") || \"null\"
    );

    // Look up caller's real DB profile (localStorage has no 'id' field)
    let callerProfile: any = null;
    const lookupVal = stored?.username || stored?.email;
    const lookupField = stored?.username ? \"username\" : \"email\";
    if (lookupVal) {
      const { data: cp } = await supabase
        .from(\"profiles\")
        .select(\"id, username, display_name, full_name, role\")
        .eq(lookupField, lookupVal)
        .single();
      callerProfile = cp;
    }
    setLoggedProfile(callerProfile);

    let query = supabase
      .from(\"jobs\")
      .select(\"*\");

    if (statusFilter && ![\"active\", \"expired\"].includes(statusFilter)) {
      query = query.eq(\"status\", statusFilter);
    }

    const { data, error } = await query.order(\"id\", {
      ascending: false,
    });

    if (error) {
      console.log(error);
      return;
    }

    let filteredJobs = data || [];

    // Fetch profiles with role field (needed for privacy display)
    const { data: profilesData } = await supabase.from(\"profiles\").select(\"id, display_name, full_name, username, role\");
    const profilesMap: Record<string, any> = {};
    if (profilesData) {
      profilesData.forEach(p => profilesMap[p.id] = p);
    }

    // Role-based filtering: non-CEO only sees own jobs + legacy jobs with no author_id
    const roleStr = (callerProfile?.role || stored?.role || \"\").toLowerCase().replace(/[\\s_]+/g, \"\");
    if (roleStr !== \"ceo\") {
      filteredJobs = filteredJobs.filter((job: any) =>
        !job.author_id || job.author_id === callerProfile?.id
      );
    }
    
    // Attach profiles for Posted By display
    filteredJobs = filteredJobs.map((job: any) => ({
      ...job,
      profiles: job.author_id ? profilesMap[job.author_id] : null
    }));`;

code = code.replace(oldFetchBlock, newFetchBlock);

// ── Fix Posted By cell to respect privacy rules ──────────────────────────────
const oldPostedBy = `                      {/* POSTED BY */}

                      <td className=\"px-6 py-5\">
                        {job.profiles?.display_name || job.profiles?.full_name || job.profiles?.username || \"Admin\"}
                      </td>`;

const newPostedBy = `                      {/* POSTED BY */}

                      <td className="px-6 py-5">
                        {(() => {
                          if (!job.profiles) return <span className="text-gray-400">—</span>;
                          const myRole = (loggedProfile?.role || \"\").toLowerCase().replace(/[\\s_]+/g, \"\");
                          if (myRole === \"ceo\") {
                            return job.profiles.display_name || job.profiles.full_name || job.profiles.username || \"Admin\";
                          }
                          // Same admin: show own name
                          if (callerProfile?.id === job.author_id) {
                            return job.profiles.display_name || job.profiles.full_name || job.profiles.username || \"Admin\";
                          }
                          // Another admin's job: show role label
                          const pRole = (job.profiles.role || \"\").toLowerCase().replace(/[\\s_]+/g, \"\");
                          if (pRole === \"ceo\") return \"CEO\";
                          if (pRole === \"superadmin\") return \"Super Admin\";
                          return \"Admin\";
                        })()}
                      </td>`;

code = code.replace(oldPostedBy, newPostedBy);

// Replace callerProfile reference in IIFE (use loggedProfile state)
code = code.replace(
  'if (callerProfile?.id === job.author_id) {',
  'if (loggedProfile?.id === job.author_id) {'
);

fs.writeFileSync('app/admin/jobs/page.tsx', code);
console.log('Fixed Admin Jobs Posted By and Posted On');

// Verify
const result = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');
const hasLookup = result.includes('Look up caller');
const hasPrivacy = result.includes('myRole === \"ceo\"');
const hasLoggedProfile = result.includes('loggedProfile');
console.log('Has username lookup:', hasLookup);
console.log('Has privacy logic:', hasPrivacy);
console.log('Has loggedProfile state:', hasLoggedProfile);

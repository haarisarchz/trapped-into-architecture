const fs = require('fs');
let content = fs.readFileSync('app/admin/jobs/page.tsx', 'utf8');

const replacement = `  const [jobs, setJobs] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loggedProfile, setLoggedProfile] = useState<any>(null);
  
  const [sortField, setSortField] = useState<string>("posted_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => { setCurrentUser(JSON.parse(localStorage.getItem("currentUser") || "null")); }, []);

  useEffect(() => {
    fetchJobs();
  }, [statusFilter, typeFilter]); 

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getSortedJobs = (jobsList: any[]) => {
    return [...jobsList].sort((a, b) => {
      let valA, valB;
      switch (sortField) {
        case "position":
          valA = a.position || "";
          valB = b.position || "";
          break;
        case "firm_name":
          valA = a.firm_name || "";
          valB = b.firm_name || "";
          break;
        case "city":
          valA = a.city || "";
          valB = b.city || "";
          break;
        case "posted_by":
          valA = a.profiles?.display_name || a.profiles?.full_name || a.profiles?.username || "Unknown";
          valB = b.profiles?.display_name || b.profiles?.full_name || b.profiles?.username || "Unknown";
          break;
        case "posted_date":
          valA = a.posted_date ? new Date(a.posted_date).getTime() : 0;
          valB = b.posted_date ? new Date(b.posted_date).getTime() : 0;
          break;
        case "status":
          valA = a.status || "";
          valB = b.status || "";
          break;
        default:
          valA = 0;
          valB = 0;
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  /* FETCH JOBS */

const fetchJobs = async () => {
    const stored = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );

    let callerProfile: any = null;
    const lookupVal = stored?.username || stored?.email;
    const lookupField = stored?.username ? "username" : "email";
    if (lookupVal) {
      const { data: cp } = await supabase
        .from("profiles")
        .select("id, username, display_name, full_name, role")
        .eq(lookupField, lookupVal)
        .single();
      callerProfile = cp;
    }
    setLoggedProfile(callerProfile);

    let query = supabase.from("jobs").select("*");
    if (statusFilter && !["active", "expired"].includes(statusFilter)) {
      query = query.eq("status", statusFilter);
    }
    const { data, error } = await query.order("id", { ascending: false });
    if (error) console.log(error);
    let filteredJobs = data || [];
    const { data: profilesData } = await supabase.from("profiles").select("id, display_name, full_name, username, role");
    const profilesMap: any = {};
    if (profilesData) {
      profilesData.forEach(p => profilesMap[p.id] = p);
    }
    const roleStr = (callerProfile?.role || stored?.role || "").toLowerCase().replace(/[\\s_]+/g, "");
    filteredJobs = filteredJobs.map((job) => ({
      ...job,
      profiles: job.author_id ? profilesMap[job.author_id] : null
    }));
    if (statusFilter === "active") {
      const today = new Date();
      filteredJobs = filteredJobs.filter(
        (job) => !job.post_expiry_date || new Date(job.post_expiry_date) >= today
      );
    }
    if (statusFilter === "expired") {
      const today = new Date();
      filteredJobs = filteredJobs.filter(
        (job) => job.post_expiry_date && new Date(job.post_expiry_date) < today
      );
    }

    // Group by batch
    const grouped = [];
    const map = new Map();
    for (const job of filteredJobs) {
      const key = \`\${job.author_id}_\${job.firm_name}_\${job.posted_date}_\${job.status}_\${job.image}\`;
      if (!map.has(key)) {
        map.set(key, { ...job, grouped_positions: [job] });
        grouped.push(map.get(key));
      } else {
        map.get(key).grouped_positions.push(job);
        const count = map.get(key).grouped_positions.length;
        map.get(key).position = \`Multiple Positions (\${count})\`;
      }
    }

    setJobs(grouped);
  };
  /* DELETE JOB */

  const deleteJob = async (job: any) => {
    const confirmDelete = confirm("Delete this job batch?");
    if (!confirmDelete) return;

    const idsToDelete = job.grouped_positions ? job.grouped_positions.map((p: any) => p.id) : [job.id];
    const { error } = await supabase.from("jobs").delete().in("id", idsToDelete);
    if (error) {
      console.log(error);
    } else {
      fetchJobs();
    }
  };`;

const targetStart = "const [jobs, setJobs] = useState<any[]>([]);";
const targetEnd = "fetchJobs();\n\n    }\n\n  };";

const startIndex = content.indexOf(targetStart);
const endIndex = content.indexOf(targetEnd) + targetEnd.length;

if (startIndex !== -1 && endIndex > startIndex) {
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync('app/admin/jobs/page.tsx', content);
  console.log("Success");
} else {
  console.log("Not found");
}

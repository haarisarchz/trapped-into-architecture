const fs = require('fs');
let content = fs.readFileSync('app/profile/[username]/page.tsx', 'utf8');

// Find where to hook in the fetch for saved_jobs
// Basically inside loadProfile() after we set user.
const regex = /setUser\(formattedUser\);\s*setEditedUser\(formattedUser\);\s*setBio\(profile\.bio \|\| ""\);\s*\};\s*loadProfile\(\);/s;

const replacement = `setUser(formattedUser);
    setEditedUser(formattedUser);
    setBio(profile.bio || "");

    // Fetch saved jobs from DB
    const { data: savedEntries } = await supabase
      .from("saved_jobs")
      .select("job_id")
      .eq("user_id", profile.id);
      
    if (savedEntries && savedEntries.length > 0) {
      const ids = savedEntries.map(e => e.job_id);
      fetchSavedJobs(ids);
    }
  };

  loadProfile();`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('app/profile/[username]/page.tsx', content);
  console.log("Success replacing profile fetch logic");
} else {
  console.log("Regex not found in profile page");
}
const fs = require('fs');
let file = fs.readFileSync('app/api/publish/social/route.ts', 'utf8');

// 1. Fix existingLog select error handling
const selectCodeOld = `      const { data: existingLog } = await supabase
        .from("social_publishing_logs")
        .select("*")
        .eq("job_id", triggerJob.id)
        .eq("platform", platform)
        .maybeSingle();`;

const selectCodeNew = `      let existingLog = null;
      try {
        const { data, error } = await supabase
          .from("social_publishing_logs")
          .select("*")
          .eq("job_id", triggerJob.id)
          .eq("platform", platform)
          .maybeSingle();
        if (error && error.code !== "PGRST205") console.warn(error);
        if (data) existingLog = data;
      } catch (err) {}`;
file = file.replace(selectCodeOld, selectCodeNew);

// 2. Fix upsert error handling
const upsertCodeOld = `      const { data: logRecord, error: upsertError } = await supabase.from("social_publishing_logs").upsert({
          id: existingLog?.id || undefined,
          job_id: triggerJob.id,
          platform,
          status: "publishing",
          attempt_count: (existingLog?.attempt_count || 0) + 1,
          updated_at: new Date().toISOString(),
      }, { onConflict: "job_id, platform" }).select().single();
      
      if (upsertError) throw upsertError;`;

const upsertCodeNew = `      try {
        const { error: upsertError } = await supabase.from("social_publishing_logs").upsert({
            id: existingLog?.id || undefined,
            job_id: triggerJob.id,
            platform,
            status: "publishing",
            attempt_count: (existingLog?.attempt_count || 0) + 1,
            updated_at: new Date().toISOString(),
        }, { onConflict: "job_id, platform" });
        if (upsertError && upsertError.code !== "PGRST205") console.warn(upsertError);
      } catch(err) {}`;
file = file.replace(upsertCodeOld, upsertCodeNew);

// 3. Fix final update
const updateCodeOld = `      await supabase.from("social_publishing_logs").update({
        status: success ? "published" : "failed",
        error_message: success ? null : errorMsg,
        updated_at: new Date().toISOString(),
      }).eq("job_id", triggerJob.id).eq("platform", platform);`;
      
const updateCodeNew = `      try {
        await supabase.from("social_publishing_logs").update({
          status: success ? "published" : "failed",
          error_message: success ? null : errorMsg,
          updated_at: new Date().toISOString(),
        }).eq("job_id", triggerJob.id).eq("platform", platform);
      } catch(err) {}`;
file = file.replace(updateCodeOld, updateCodeNew);

// 4. Fix sibling upsert
const siblingUpsertOld = `        await supabase.from("social_publishing_logs").upsert(siblingLogs, { onConflict: "job_id, platform" });`;
const siblingUpsertNew = `        try { await supabase.from("social_publishing_logs").upsert(siblingLogs, { onConflict: "job_id, platform" }); } catch(err) {}`;
file = file.replace(siblingUpsertOld, siblingUpsertNew);

fs.writeFileSync('app/api/publish/social/route.ts', file);
console.log("Patched social publishing logs ignoring missing table.");

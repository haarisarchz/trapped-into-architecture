import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateInstitutionSlug, normalizeInstitutionName } from "@/utils/institutionUrl";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      documentTitle = "COA Approved Institutions Import",
      sourceName = "Council of Architecture",
      academicYear = "2024-2025",
      fileType = "EXCEL",
      records = [],
    } = body;

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: "No records to import" }, { status: 400 });
    }

    // 1. Create source_documents entry
    const { data: docData, error: docError } = await supabase
      .from("source_documents")
      .insert({
        document_title: documentTitle,
        source_name: sourceName,
        academic_year: academicYear,
        file_type: fileType,
        total_records_extracted: records.length,
        processing_status: "Reviewing",
      })
      .select("id")
      .single();

    if (docError) {
      console.warn("source_documents insert warning:", docError.message);
    }

    const sourceDocId = docData?.id || null;

    let importedInstitutionsCount = 0;
    let importedIntakesCount = 0;
    let importedRanksCount = 0;

    // 2. Process each institution record
    for (const item of records) {
      const coaCode = item.coa_code ? String(item.coa_code).toUpperCase().trim() : null;
      const name = String(item.institution_name || "").trim();
      const normName = normalizeInstitutionName(name);

      if (!name) continue;

      let institutionId: string | null = null;

      // Find existing institution by COA code or normalized name
      if (coaCode) {
        const { data: existingByCode } = await supabase
          .from("institutions")
          .select("id")
          .eq("coa_code", coaCode)
          .maybeSingle();

        if (existingByCode) {
          institutionId = existingByCode.id;
        }
      }

      if (!institutionId && normName) {
        const { data: existingByName } = await supabase
          .from("institutions")
          .select("id")
          .eq("normalized_name", normName)
          .maybeSingle();

        if (existingByName) {
          institutionId = existingByName.id;
        }
      }

      // If not exists, insert new institution
      if (!institutionId) {
        let baseSlug = generateInstitutionSlug(name, item.city || item.district || undefined);

        // Ensure unique slug
        const { data: slugMatch } = await supabase
          .from("institutions")
          .select("id")
          .eq("slug", baseSlug)
          .maybeSingle();

        if (slugMatch) {
          baseSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        const { data: newInst, error: newInstError } = await supabase
          .from("institutions")
          .insert({
            coa_code: coaCode,
            institution_name: name,
            normalized_name: normName,
            slug: baseSlug,
            locality: item.locality || null,
            district: item.district || null,
            city: item.city || item.district || null,
            state: item.state || "Tamil Nadu",
            affiliated_university: item.affiliated_university || null,
            establishment_year: item.establishment_year || null,
            is_active: true,
            is_verified: true,
          })
          .select("id")
          .single();

        if (newInstError) {
          console.error("Error creating institution:", name, newInstError.message);
          continue;
        }

        institutionId = newInst.id;
        importedInstitutionsCount++;
      } else {
        // Update basic details if newly provided
        await supabase
          .from("institutions")
          .update({
            locality: item.locality || undefined,
            district: item.district || undefined,
            city: item.city || item.district || undefined,
            affiliated_university: item.affiliated_university || undefined,
            establishment_year: item.establishment_year || undefined,
            updated_at: new Date().toISOString(),
          })
          .eq("id", institutionId);
      }

      // 3. Insert annual records
      // Multi-year intakes support (e.g. from Tamil Nadu Excel sheet: 2020-2021, 2021-2022, etc.)
      const yearlyList = Array.isArray(item.yearly_intakes) && item.yearly_intakes.length > 0
        ? item.yearly_intakes
        : [{ year: item.academic_year || academicYear, intake: item.approved_intake || 0 }];

      for (const y of yearlyList) {
        const yIntake = typeof y.intake === "number" ? y.intake : parseInt(String(y.intake || "0"), 10) || 0;
        const status = yIntake > 0 ? "Approved" : "Zero Intake / Withdrawn";

        const { error: intakeErr } = await supabase
          .from("institution_annual_records")
          .upsert(
            {
              institution_id: institutionId,
              academic_year: y.year,
              course_name: "B.Arch",
              approved_intake: yIntake,
              approval_status: status,
              source_document_id: sourceDocId,
              reviewed_at: new Date().toISOString(),
            },
            { onConflict: "institution_id,academic_year,course_name" }
          );

        if (!intakeErr) importedIntakesCount++;
      }

      // 4. Insert NIRF rankings if present
      if (Array.isArray(item.rankings) && item.rankings.length > 0) {
        for (const rk of item.rankings) {
          const rankNum = typeof rk.rank === "number" ? rk.rank : parseInt(String(rk.rank || "0"), 10);
          if (rankNum > 0) {
            const { error: rkErr } = await supabase
              .from("institution_rankings")
              .upsert(
                {
                  institution_id: institutionId,
                  ranking_body: "NIRF",
                  ranking_year: rk.year,
                  rank_number: rankNum,
                  category: "Architecture",
                },
                { onConflict: "institution_id,ranking_body,ranking_year,category" }
              );
            if (!rkErr) importedRanksCount++;
          }
        }
      }
    }

    // 5. Update source document status
    if (sourceDocId) {
      await supabase
        .from("source_documents")
        .update({
          total_records_imported: importedInstitutionsCount,
          processing_status: "Processed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", sourceDocId);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed: ${importedInstitutionsCount} institutions created/updated, ${importedIntakesCount} annual intake records, ${importedRanksCount} NIRF rankings.`,
      institutionsImported: importedInstitutionsCount,
      intakesImported: importedIntakesCount,
      ranksImported: importedRanksCount,
      sourceDocId,
    });
  } catch (error: any) {
    console.error("Import processing error:", error);
    return NextResponse.json({ error: error?.message || "Import execution failed" }, { status: 500 });
  }
}

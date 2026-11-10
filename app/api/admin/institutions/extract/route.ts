import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import { GoogleGenAI } from "@google/genai";
import { generateInstitutionSlug, normalizeInstitutionName } from "@/utils/institutionUrl";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const genAI = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const mode = (formData.get("mode") as string) || "excel"; // "excel" | "paste" | "pdf"
    const targetState = (formData.get("state") as string) || "Tamil Nadu";
    const defaultAcademicYear = (formData.get("academic_year") as string) || "2024-2025";
    const rawPastedText = formData.get("pasted_text") as string | null;
    const file = formData.get("file") as File | null;

    let extractedRows: any[] = [];

    // --- MODE 1: EXCEL / CSV EXTRACTION ---
    if (mode === "excel") {
      if (!file) {
        return NextResponse.json({ error: "No Excel/CSV file provided" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const workbook = XLSX.read(buffer, { type: "buffer" });
      
      // Determine which sheet to read: match target state tab, or first sheet
      let targetSheetName = workbook.SheetNames[0];
      const matchStateSheet = workbook.SheetNames.find(
        (s) => s.toLowerCase().replace(/\s+/g, "") === targetState.toLowerCase().replace(/\s+/g, "")
      );
      if (matchStateSheet) {
        targetSheetName = matchStateSheet;
      }

      const worksheet = workbook.Sheets[targetSheetName];
      const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!rawData || rawData.length === 0) {
        return NextResponse.json({ error: "Excel sheet is empty" }, { status: 400 });
      }

      // Find header row (usually row 0 or 1 containing "college code" or "college name" or "s no")
      let headerRowIndex = 0;
      for (let i = 0; i < Math.min(5, rawData.length); i++) {
        const rowStr = (rawData[i] || []).map((c) => String(c).toLowerCase()).join(" ");
        if (rowStr.includes("college") || rowStr.includes("code") || rowStr.includes("intake") || rowStr.includes("affiliation")) {
          headerRowIndex = i;
          break;
        }
      }

      const headers = (rawData[headerRowIndex] || []).map((h) => String(h || "").trim());

      // Helper to find column indices
      const findColIdx = (keywords: string[]) => {
        return headers.findIndex((h) =>
          keywords.some((kw) => h.toLowerCase().includes(kw.toLowerCase()))
        );
      };

      const codeIdx = findColIdx(["college code", "coa code", "code", "inst code"]);
      const nameIdx = findColIdx(["college name", "institution name", "name of institution", "name"]);
      const localityIdx = findColIdx(["locality", "area", "address"]);
      const districtIdx = findColIdx(["district", "city"]);
      const affiliationIdx = findColIdx(["affiliation", "affiliated to", "university"]);
      const establishedIdx = findColIdx(["course started", "established", "year started", "estd"]);

      // Detect year intake columns (e.g., "2020-2021", "2021-2022", "2024-2025")
      const intakeCols: { year: string; idx: number }[] = [];
      headers.forEach((h, idx) => {
        const clean = h.replace(/\s+/g, "");
        if (/20\d\d[-–_]20\d\d/i.test(clean) || /20\d\d[-–_]\d\d/i.test(clean)) {
          intakeCols.push({ year: h.trim(), idx });
        }
      });

      // Detect NIRF rank columns (e.g. "2019", "2020", "2021", "2022", "2023", "2024" after intake)
      const nirfCols: { year: number; idx: number }[] = [];
      headers.forEach((h, idx) => {
        const yr = parseInt(h.trim(), 10);
        if (yr >= 2015 && yr <= 2030 && !intakeCols.some((ic) => ic.idx === idx)) {
          nirfCols.push({ year: yr, idx });
        }
      });

      // Parse data rows
      for (let r = headerRowIndex + 1; r < rawData.length; r++) {
        const row = rawData[r];
        if (!row || row.length === 0) continue;

        const name = nameIdx !== -1 && row[nameIdx] ? String(row[nameIdx]).trim() : "";
        const code = codeIdx !== -1 && row[codeIdx] ? String(row[codeIdx]).trim().toUpperCase() : "";

        // Skip blank rows
        if (!name && !code) continue;

        const locality = localityIdx !== -1 && row[localityIdx] ? String(row[localityIdx]).trim() : "";
        const district = districtIdx !== -1 && row[districtIdx] ? String(row[districtIdx]).trim() : "";
        const affiliation = affiliationIdx !== -1 && row[affiliationIdx] ? String(row[affiliationIdx]).trim() : "";
        const estdRaw = establishedIdx !== -1 ? parseInt(String(row[establishedIdx]), 10) : NaN;
        const estd = !isNaN(estdRaw) && estdRaw > 1900 && estdRaw < 2050 ? estdRaw : null;

        // Build yearly intake map
        const yearlyIntakes: { year: string; intake: number }[] = [];
        intakeCols.forEach((ic) => {
          const val = parseInt(String(row[ic.idx] ?? "").replace(/[^\d]/g, ""), 10);
          if (!isNaN(val)) {
            yearlyIntakes.push({ year: ic.year, intake: val });
          }
        });

        // If no multi-year columns detected, fallback to single intake if present
        let primaryIntake = 0;
        if (yearlyIntakes.length > 0) {
          primaryIntake = yearlyIntakes[yearlyIntakes.length - 1].intake; // Latest in sheet
        }

        // Build NIRF rankings map
        const yearlyRanks: { year: number; rank: number }[] = [];
        nirfCols.forEach((nc) => {
          const val = parseInt(String(row[nc.idx] ?? "").replace(/[^\d]/g, ""), 10);
          if (!isNaN(val) && val > 0) {
            yearlyRanks.push({ year: nc.year, rank: val });
          }
        });

        extractedRows.push({
          coa_code: code || null,
          institution_name: name,
          locality: locality || null,
          district: district || null,
          city: district || null,
          state: targetState,
          affiliated_university: affiliation || null,
          establishment_year: estd,
          approved_intake: primaryIntake,
          academic_year: yearlyIntakes.length > 0 ? yearlyIntakes[yearlyIntakes.length - 1].year : defaultAcademicYear,
          yearly_intakes: yearlyIntakes,
          rankings: yearlyRanks,
          approval_status: primaryIntake > 0 ? "Approved" : "Zero Intake / Withdrawn",
        });
      }
    }

    // --- MODE 2: COPY-PASTED TEXT OR PDF PARSING WITH GEMINI ---
    else if (mode === "paste" || mode === "pdf") {
      let promptText = "";

      if (mode === "paste") {
        if (!rawPastedText || !rawPastedText.trim()) {
          return NextResponse.json({ error: "No pasted text provided" }, { status: 400 });
        }
        promptText = `You are an expert data parsing assistant specializing in Council of Architecture (COA) institution lists.
Extract all architecture colleges from the text below and return ONLY a strict JSON array of objects.
Do NOT wrap the output in markdown code blocks like \`\`\`json. Return pure JSON.

Target State: ${targetState}
Default Academic Year: ${defaultAcademicYear}

Each object MUST contain:
- coa_code: string (e.g. "TN01", "KA05", or null if not mentioned)
- institution_name: string (full college name)
- locality: string or null (e.g. "Guindy", "Royapettah")
- district: string or null (e.g. "Chennai", "Coimbatore")
- city: string or null
- state: string (default "${targetState}")
- affiliated_university: string or null (e.g. "Anna University")
- establishment_year: integer or null (e.g. 1957, 1995)
- approved_intake: integer (number of seats, e.g. 40, 80, 120, default 0 if withdrawn)
- academic_year: string (e.g. "${defaultAcademicYear}")
- approval_status: string ("Approved", "Zero Intake / Withdrawn", etc.)

Input text:
${rawPastedText}`;
      } else if (mode === "pdf") {
        if (!file) {
          return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
        }
        // Note: For large multi-page PDFs, we convert buffer to base64 for Gemini multimodal input
        const bytes = await file.arrayBuffer();
        const base64Data = Buffer.from(bytes).toString("base64");

        const response = await genAI.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: "application/pdf",
                    data: base64Data,
                  },
                },
                {
                  text: `Analyze this Council of Architecture (COA) document and extract all architecture institutions listed.
Return ONLY a strict JSON array of objects. Do NOT include markdown code fences like \`\`\`json.
Each object must contain:
- coa_code: string (e.g. "TN01", "MH10", etc.)
- institution_name: string (official college name)
- locality: string or null
- district: string or null
- city: string or null
- state: string
- affiliated_university: string or null
- establishment_year: integer or null
- approved_intake: integer (approved seat count for B.Arch)
- academic_year: string (reporting academic year, e.g. "${defaultAcademicYear}")
- approval_status: string ("Approved", "Under Review", or "Zero Intake")`,
                },
              ],
            },
          ],
        });

        const reply = response.text || "[]";
        const cleanJson = reply.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
        try {
          extractedRows = JSON.parse(cleanJson);
        } catch (e: any) {
          return NextResponse.json({ error: "Failed to parse AI output: " + e.message, raw: reply }, { status: 500 });
        }
      }

      if (mode === "paste") {
        const response = await genAI.models.generateContent({
          model: "gemini-2.5-flash",
          contents: promptText,
        });

        const reply = response.text || "[]";
        const cleanJson = reply.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
        try {
          extractedRows = JSON.parse(cleanJson);
        } catch (e: any) {
          return NextResponse.json({ error: "Failed to parse AI output: " + e.message, raw: reply }, { status: 500 });
        }
      }
    }

    if (!Array.isArray(extractedRows) || extractedRows.length === 0) {
      return NextResponse.json({ error: "No records could be extracted" }, { status: 400 });
    }

    // --- RECONCILIATION & DIFFING WITH EXISTING DATABASE RECORDS ---
    // Fetch all existing institutions to compute Categories A, B, C, D
    const { data: existingInstitutions } = await supabase
      .from("institutions")
      .select("id, coa_code, institution_name, normalized_name, city, district, state");

    const { data: existingRecords } = await supabase
      .from("institution_annual_records")
      .select("institution_id, academic_year, course_name, approved_intake, approval_status");

    const existingMapByCode = new Map<string, any>();
    const existingMapByName = new Map<string, any>();

    (existingInstitutions || []).forEach((inst) => {
      if (inst.coa_code) {
        existingMapByCode.set(inst.coa_code.toUpperCase().trim(), inst);
      }
      if (inst.normalized_name) {
        existingMapByName.set(inst.normalized_name, inst);
      }
    });

    const existingRecordsMap = new Map<string, any>();
    (existingRecords || []).forEach((r) => {
      const key = `${r.institution_id}_${r.academic_year}_${r.course_name || "B.Arch"}`;
      existingRecordsMap.set(key, r);
    });

    let countA = 0; // New
    let countB = 0; // Changed
    let countC = 0; // Unchanged
    let countD = 0; // Warnings

    const analyzedRows = extractedRows.map((row, index) => {
      const normName = normalizeInstitutionName(row.institution_name);
      const code = row.coa_code ? String(row.coa_code).toUpperCase().trim() : null;

      // 1. Check for duplicate / existing match
      let matchedInst: any = null;
      let matchType: "code" | "fuzzy" | null = null;

      if (code && existingMapByCode.has(code)) {
        matchedInst = existingMapByCode.get(code);
        matchType = "code";
      } else if (normName && existingMapByName.has(normName)) {
        matchedInst = existingMapByName.get(normName);
        matchType = "fuzzy";
      }

      // Check warnings
      const warnings: string[] = [];
      if (!code) warnings.push("Missing COA institution code");
      if (!row.district && !row.city) warnings.push("Missing district/city");
      if (typeof row.approved_intake !== "number" || row.approved_intake <= 0) {
        warnings.push("Intake is 0 or unassigned");
      }

      let category: "A" | "B" | "C" | "D" = "A";
      let diffDetails: any = null;

      if (warnings.length > 0) {
        category = "D";
        countD++;
      } else if (!matchedInst) {
        category = "A";
        countA++;
      } else {
        // Matched existing institution: check annual intake record
        const recordKey = `${matchedInst.id}_${row.academic_year}_B.Arch`;
        const existingRec = existingRecordsMap.get(recordKey);

        if (!existingRec) {
          // New year record for existing institution
          category = "B";
          countB++;
          diffDetails = {
            type: "NEW_YEAR_INTAKE",
            message: `Adding new academic year (${row.academic_year}) with ${row.approved_intake} seats`,
            oldValue: null,
            newValue: row.approved_intake,
          };
        } else if (existingRec.approved_intake !== row.approved_intake) {
          // Changed intake for same year
          category = "B";
          countB++;
          diffDetails = {
            type: "INTAKE_CHANGED",
            message: `Intake updated from ${existingRec.approved_intake} to ${row.approved_intake} seats`,
            oldValue: existingRec.approved_intake,
            newValue: row.approved_intake,
          };
        } else {
          // Identical
          category = "C";
          countC++;
        }
      }

      return {
        id: `extracted_${index}`,
        coa_code: code,
        institution_name: row.institution_name,
        normalized_name: normName,
        locality: row.locality || null,
        district: row.district || null,
        city: row.city || row.district || null,
        state: row.state || targetState,
        affiliated_university: row.affiliated_university || null,
        establishment_year: row.establishment_year || null,
        approved_intake: row.approved_intake || 0,
        academic_year: row.academic_year || defaultAcademicYear,
        approval_status: row.approval_status || "Approved",
        yearly_intakes: row.yearly_intakes || [],
        rankings: row.rankings || [],
        category,
        diffDetails,
        warnings,
        matchedInstitution: matchedInst ? { id: matchedInst.id, name: matchedInst.institution_name, code: matchedInst.coa_code } : null,
      };
    });

    return NextResponse.json({
      success: true,
      totalExtracted: analyzedRows.length,
      categoryCounts: {
        A: countA,
        B: countB,
        C: countC,
        D: countD,
      },
      rows: analyzedRows,
    });
  } catch (error: any) {
    console.error("Extraction error:", error);
    return NextResponse.json({ error: error?.message || "Failed to extract records" }, { status: 500 });
  }
}

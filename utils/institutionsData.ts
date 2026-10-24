// Standard School Boards for High School
export const SCHOOL_BOARDS = [
  "CBSE (Central Board of Secondary Education)",
  "ICSE / ISC (Council for the Indian School Certificate Examinations)",
  "State Board",
  "IB (International Baccalaureate)",
  "Cambridge International / IGCSE",
  "NIOS (National Institute of Open Schooling)",
  "Other National / International Board",
];

// Organization Types for Experience
export const ORGANIZATION_TYPES = [
  "Architecture Firm",
  "Interior Design Studio",
  "Academic Institution / College",
  "Real Estate / Builder / Developer",
  "Urban Planning / Government Authority",
  "Landscape Architecture Practice",
  "BIM / AEC Consultancy",
  "Heritage & Conservation Studio",
  "Freelance / Independent Practice",
  "Other",
];

// Curated Top Architecture Universities & Affiliations
export const POPULAR_UNIVERSITIES = [
  // India
  "School of Planning and Architecture (SPA), New Delhi",
  "School of Planning and Architecture (SPA), Bhopal",
  "School of Planning and Architecture (SPA), Vijayawada",
  "CEPT University, Ahmedabad",
  "Sir J.J. College of Architecture (Mumbai University)",
  "Indian Institute of Technology (IIT) Roorkee",
  "Indian Institute of Technology (IIT) Kharagpur",
  "National Institute of Technology (NIT) Tiruchirappalli",
  "National Institute of Technology (NIT) Calicut",
  "Visvesvaraya Technological University (VTU), Belagavi",
  "Anna University, Chennai",
  "University of Mumbai",
  "Jawaharlal Nehru Architecture and Fine Arts University (JNAFAU), Hyderabad",
  "Jamia Millia Islamia, New Delhi",
  "Aligarh Muslim University (AMU)",
  "Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow",
  "Guru Gobind Singh Indraprastha University (GGSIPU), Delhi",
  "Manipal Academy of Higher Education (MAHE), Manipal",
  "Kalyan University / Jadavpur University, Kolkata",
  "Savitribai Phule Pune University (SPPU), Pune",

  // International
  "Architectural Association (AA) School of Architecture, London",
  "The Bartlett School of Architecture (UCL), London",
  "Massachusetts Institute of Technology (MIT), USA",
  "Harvard University Graduate School of Design (GSD), USA",
  "Delft University of Technology (TU Delft), Netherlands",
  "ETH Zurich (Swiss Federal Institute of Technology), Switzerland",
  "Politecnico di Milano, Italy",
  "National University of Singapore (NUS), Singapore",
  "Columbia University (GSAPP), USA",
  "University of California, Berkeley (UC Berkeley), USA",
  "University of Melbourne, Australia",
  "University of Sydney, Australia",
  "University of Toronto, Canada",
];

/**
 * Filter universities based on search query
 */
export function searchUniversities(query: string, maxResults = 10): string[] {
  if (!query || query.trim().length === 0) {
    return POPULAR_UNIVERSITIES.slice(0, maxResults);
  }
  const clean = query.toLowerCase().trim();
  const matched = POPULAR_UNIVERSITIES.filter((item) =>
    item.toLowerCase().includes(clean)
  );
  return matched.slice(0, maxResults);
}

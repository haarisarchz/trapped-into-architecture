export const generateCompanySlug = (name: string) => {
  if (!name) return "company";
  return name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
};

export const generateJobUrl = (job: any) => {
  if (!job || !job.id) return '#';
  const slugify = (text: string) => (text || '').toLowerCase().trim().replace(/[\s\W-]+/g, '-') || 'job';
  return `/jobs/${slugify(job.firm_name)}-${slugify(job.position)}-${job.id}`;
};

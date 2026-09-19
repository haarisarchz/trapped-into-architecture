export const generateJobUrl = (job) => {
  if (!job || !job.id) return '#';
  const slugify = (text) => (text || '').toLowerCase().trim().replace(/[\s\W-]+/g, '-') || 'job';
  return `/jobs/${slugify(job.firm_name)}-${slugify(job.position)}-${job.id}`;
};

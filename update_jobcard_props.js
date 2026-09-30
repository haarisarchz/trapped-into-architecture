const fs = require('fs');
let content = fs.readFileSync('components/Jobcard.tsx', 'utf8');

// Add to JobCardProps
content = content.replace(
  'type JobCardProps = {\\n  id: string;',
  'type JobCardProps = {\\n  id: string;\\n  employment_type?: string;'
);

// Add to destructuring
content = content.replace(
  '  firm_name, organization_type,\\n  area,',
  '  firm_name, organization_type,\\n  area,\\n  employment_type,'
);

// Update experience rendering condition
// The render block is usually:
// {experience && ( ... )}
// Let's replace it with:
// {experience && employment_type !== "Internship" && ( ... )}

// Let's look for how experience is rendered in the component. 
// Typically: {experience && ( ... formatExperience ...
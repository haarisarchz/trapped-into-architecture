const fs = require('fs');
let content = fs.readFileSync('components/Jobcard.tsx', 'utf8');

// The employment_type is not passed to JobCard? Let's check JobCardProps
// Oh, actually employment_type might not be in JobCardProps.
// Let's modify JobCardProps to include employment_type.
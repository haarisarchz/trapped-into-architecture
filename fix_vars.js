const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

c = c.replace(/const \\\[image, setImage\\\] = useState\\(""\);/, "const [lastDateToApply, setLastDateToApply] = useState('');\\nconst [postExpiryDate, setPostExpiryDate] = useState('');\\nconst [apply_link, setapply_link] = useState('');\\nconst [application_email, setapplication_email] = useState('');\\nconst [source, setSource] = useState('');\\nconst [image, setImage] = useState('');");

fs.writeFileSync('app/admin/add-job/page.tsx', c);

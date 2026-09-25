const fs = require('fs');
let c = fs.readFileSync('app/admin/add-job/page.tsx', 'utf-8');

c = c.replace('const [image, setImage] = useState("");', "const [lastDateToApply, setLastDateToApply] = useState('');\\n  const [postExpiryDate, setPostExpiryDate] = useState('');\\n  const [apply_link, setapply_link] = useState('');\\n  const [application_email, setapplication_email] = useState('');\\n  const [source, setSource] = useState('');\\n  const [image, setImage] = useState('');");

fs.writeFileSync('app/admin/add-job/page.tsx', c);

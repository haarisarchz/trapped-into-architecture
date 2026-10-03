const job = {
    application_email: 'axisandgridassociates@gmail.com',
    apply_link: ''
};

let appType = '';
let email = '';
let link = '';

if (job.application_email && job.application_email.trim() !== "") {
    appType = "email";
    email = job.application_email;
    link = job.apply_link || "";
} else if (job.apply_link && job.apply_link.trim() !== "") {
    appType = "apply";
    link = job.apply_link;
    email = "";
} else {
    appType = "apply";
    link = "";
    email = "";
}

console.log("Result:", { appType, email, link });

const fs = require('fs');

function updateAlerts(file) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/alert\("Please login first to favorite companies"\)/g, 'alert("Please register or log in first to favorite companies.")');
    fs.writeFileSync(file, content);
}

updateAlerts('components/FavoriteCompanyButton.tsx');
updateAlerts('components/CompanyActions.tsx');
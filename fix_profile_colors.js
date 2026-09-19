const fs = require('fs');

const profilePath = 'app/profile/[username]/page.tsx';
let profileCode = fs.readFileSync(profilePath, 'utf8');

profileCode = profileCode.replace(
  '<p className="text-xl text-gray-500 mt-2">\\n\\n    @{user.username}',
  '<p className="text-xl text-red-400 mt-2 font-medium">\\n\\n    @{user.username}'
);

profileCode = profileCode.replace(
  '<h1 className="text-4xl font-bold">',
  '<h1 className="text-4xl font-bold text-black">'
);

fs.writeFileSync(profilePath, profileCode);
console.log('✅ Updated Profile text colors');

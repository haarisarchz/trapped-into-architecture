const fs = require('fs');

let code = fs.readFileSync('app/profile/[username]/page.tsx', 'utf8');

if (!code.includes('useSearchParams')) {
  code = code.replace(
    'useParams\n} from "next/navigation";', 
    'useParams,\n  useSearchParams\n} from "next/navigation";'
  );
}

const hookSearch = `const params = useParams();`;
const hookReplace = `const params = useParams();\nconst searchParams = useSearchParams();`;
if (!code.includes('const searchParams = useSearchParams();')) {
  code = code.replace(hookSearch, hookReplace);
}

const effectSearch = `useEffect(() => {

  const loadProfile = async () => {`;
const effectReplace = `useEffect(() => {
  const tab = searchParams.get('tab');
  if (tab === 'saved-jobs' || tab === 'saved') {
    setActiveTab('saved');
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 500);
  }
  const highlight = searchParams.get('highlight');
  if (highlight === 'displayName') {
    setIsEditing(true);
    setTimeout(() => {
      const el = document.getElementById('displayNameInput');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
    }, 500);
  }
}, [searchParams]);

useEffect(() => {

  const loadProfile = async () => {`;
if (!code.includes("searchParams.get('highlight')")) {
  code = code.replace(effectSearch, effectReplace);
}

// Find Display Name input and add id="displayNameInput" and conditional animation
const inputSearch = `<input
                type="text"
                value={editedUser.displayName || ""}
                onChange={(e) =>
                  setEditedUser({
                    ...editedUser,
                    displayName: e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-3"
              />`;

const highlightCondition = `searchParams.get('highlight') === 'displayName' && !editedUser.displayName`;

const inputReplace = `<div className="relative">
              <input
                id="displayNameInput"
                type="text"
                value={editedUser.displayName || ""}
                onChange={(e) =>
                  setEditedUser({
                    ...editedUser,
                    displayName: e.target.value,
                  })
                }
                className={\`w-full border rounded-xl px-4 py-3 \${${highlightCondition} ? 'ring-4 ring-red-500 animate-pulse border-red-500' : ''}\`}
              />
              {${highlightCondition} && (
                <div className="absolute -top-8 left-0 text-red-600 font-bold text-sm animate-bounce">
                  ↓ Please set your display name here
                </div>
              )}
              </div>`;

if (!code.includes('id="displayNameInput"')) {
  code = code.replace(inputSearch, inputReplace);
}

fs.writeFileSync('app/profile/[username]/page.tsx', code);
console.log('Fixed profile page highlighting and tab');

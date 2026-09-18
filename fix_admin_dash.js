const fs = require("fs");
let code = fs.readFileSync("app/admin/page.tsx", "utf8");

// Insert analytics link in the sidebar menu
const analyticsLink = `            <button
              onClick={() =>
                router.push("/admin/analytics")
              }
              className="w-full text-left px-5 py-4 rounded-2xl hover:bg-gray-800 transition"
            >
              Analytics
            </button>`;

code = code.replace(
  `            <button
              onClick={() =>
                router.push("/admin/add-job")
              }
              className="w-full text-left px-5 py-4 rounded-2xl hover:bg-gray-800 transition"
            >
              Add New Job
            </button>`,
  `            <button
              onClick={() =>
                router.push("/admin/add-job")
              }
              className="w-full text-left px-5 py-4 rounded-2xl hover:bg-gray-800 transition"
            >
              Add New Job
            </button>
${analyticsLink}`
);

fs.writeFileSync("app/admin/page.tsx", code);


const fs = require('fs');
let file = fs.readFileSync('app/api/publish/social/route.ts', 'utf8');

const oldIgLogic = `          case "instagram": {
            const igAccountId = process.env.INSTAGRAM_ACCOUNT_ID;
            const token = process.env.FACEBOOK_ACCESS_TOKEN;
            if (!igAccountId || !token) throw new Error("Missing Instagram credentials.");
            if (!triggerJob.image) throw new Error("Instagram requires an image URL.");
            
            const createContainer = await fetch(\`https://graph.facebook.com/v19.0/\${igAccountId}/media\`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image_url: triggerJob.image, caption: postText, access_token: token })
            });
            if (!createContainer.ok) throw new Error(await createContainer.text());
            const { id: containerId } = await createContainer.json();
            
            const publishMedia = await fetch(\`https://graph.facebook.com/v19.0/\${igAccountId}/media_publish\`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ creation_id: containerId, access_token: token })
            });
            if (!publishMedia.ok) throw new Error(await publishMedia.text());
            success = true;
            break;
          }`;

const newIgLogic = `          case "instagram": {
            const igAccountId = process.env.INSTAGRAM_ACCOUNT_ID;
            const token = process.env.FACEBOOK_ACCESS_TOKEN;
            if (!igAccountId || !token) throw new Error("Missing Instagram credentials.");
            if (!triggerJob.image) throw new Error("Instagram requires an image URL.");
            
            const payload: any = {
              image_url: triggerJob.image,
              caption: postText,
              access_token: token
            };

            // Extract instagram username to tag in the image
            let igHandle = "";
            if (companyData && companyData.instagram) {
              igHandle = companyData.instagram.trim().split("?")[0].replace(/^@/, '');
              if (igHandle.includes("/")) {
                const parts = igHandle.split("/").filter(Boolean);
                igHandle = parts[parts.length - 1];
              }
            }

            if (igHandle) {
              payload.user_tags = JSON.stringify([{ username: igHandle, x: 0.5, y: 0.5 }]);
            }

            let createContainer = await fetch(\`https://graph.facebook.com/v19.0/\${igAccountId}/media\`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });

            // If tagging the user fails (e.g. invalid username or private account), retry without the tag
            if (!createContainer.ok && igHandle) {
              delete payload.user_tags;
              createContainer = await fetch(\`https://graph.facebook.com/v19.0/\${igAccountId}/media\`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
              });
            }

            if (!createContainer.ok) throw new Error(await createContainer.text());
            const { id: containerId } = await createContainer.json();
            
            const publishMedia = await fetch(\`https://graph.facebook.com/v19.0/\${igAccountId}/media_publish\`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ creation_id: containerId, access_token: token })
            });
            if (!publishMedia.ok) throw new Error(await publishMedia.text());
            success = true;
            break;
          }`;

file = file.replace(oldIgLogic, newIgLogic);
fs.writeFileSync('app/api/publish/social/route.ts', file);
console.log("Patched Instagram Tagging Logic");

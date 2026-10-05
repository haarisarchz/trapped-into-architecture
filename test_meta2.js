const pageId = process.env.FACEBOOK_PAGE_ID;
const token = process.env.FACEBOOK_ACCESS_TOKEN;
const igAccountId = process.env.INSTAGRAM_ACCOUNT_ID;

console.log("Has FB Page ID:", !!pageId);
console.log("Has FB Token:", !!token);
console.log("Has IG ID:", !!igAccountId);

async function checkMetaTokens() {
    // Check FB Page Token validity
    const debugTokenUrl = `https://graph.facebook.com/v19.0/debug_token?input_token=${token}&access_token=${token}`;
    try {
        const res = await fetch(debugTokenUrl);
        const data = await res.json();
        console.log("Token validity:", data?.data?.is_valid ? "Valid" : "Invalid");
        if (data.error) {
           console.log("Token Error:", data.error.message);
        } else if (data.data && data.data.error) {
           console.log("Token inner Error:", data.data.error.message);
        }
    } catch (err) {
        console.log("Error checking token:", err.message);
    }
}
checkMetaTokens();

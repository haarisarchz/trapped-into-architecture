const token = process.env.FACEBOOK_ACCESS_TOKEN;
async function test() {
    const res = await fetch(`https://graph.facebook.com/v19.0/search?type=place&q=Chennai&access_token=${token}`);
    console.log(await res.text());
}
test();

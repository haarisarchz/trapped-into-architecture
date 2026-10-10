async function run() {
  const res = await fetch("https://www.trappedintoarchitecture.com/api/publish/test-facebook");
  console.log(await res.json());
}
run();

const jobId = "be004c9f-37e1-4995-9bdd-6cab4f3aac64"; // Blend Designs
async function test() {
    const res = await fetch("http://localhost:3000/api/publish/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}
test();

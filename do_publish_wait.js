const jobIds = [
  "053bb760-8c54-497e-8388-6fae51060a61", // SAPA
  "eefabaae-f2c7-4b8e-8bd4-31ef8dec7804", // ISVA
  "78949f09-b68f-47ee-86c3-3725464e3c86", // MR.CURVES
  "f95a7b4e-b51e-4fb6-9d15-d88b28b12926", // LINEAR
  "75263b1a-ae1d-4db7-a5ac-9dbc59aea2c0", // D2A
  "697926dd-ad6e-46d6-bade-02006d72b7ee", // YELLOW
  "a57b234f-be2a-47bd-a292-476a62eb9ffa", // 360LIFE
  "e7e98bcb-4a1c-422f-b449-0a70258cc6dc"  // Aurae
];

async function publish() {
  console.log("Waiting 60 seconds for Vercel to finish deploying the new token...");
  await new Promise(r => setTimeout(r, 60000));
  
  for (const id of jobIds) {
    console.log(`Publishing batch for ${id}...`);
    try {
      const res = await fetch("https://www.trappedintoarchitecture.com/api/publish/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: id })
      });
      const data = await res.json();
      console.log(`Result for ${id}:`, JSON.stringify(data));
    } catch(e) {
      console.log(`Error for ${id}:`, e.message);
    }
    await new Promise(r => setTimeout(r, 12000));
  }
}
publish();

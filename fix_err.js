const fs = require('fs');
let code = fs.readFileSync('app/api/extract-job/route.ts', 'utf8');

const errorBlock = `  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    
    let userMessage = "Failed to extract job details";
    
    // Check if the error message is a JSON string from Google API
    try {
      if (error.message && error.message.includes('{')) {
        const parsed = JSON.parse(error.message);
        if (parsed.error && parsed.error.status === 'UNAVAILABLE') {
          userMessage = "AI extraction temporarily failed. Please try again.";
        } else if (parsed.error && parsed.error.message) {
          userMessage = "AI extraction temporarily failed. Please try again.";
        }
      } else if (error.message) {
        if (error.message.includes('fetch')) {
           userMessage = error.message;
        } else {
           userMessage = "AI extraction temporarily failed. Please try again.";
        }
      }
    } catch(e) {
      userMessage = error.message || "Failed to extract job details";
    }

    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    );
  }
}`;

code = code.replace(/\} catch \(error: any\) \{[\s\S]*?\}\s*\}/, errorBlock);
fs.writeFileSync('app/api/extract-job/route.ts', code);

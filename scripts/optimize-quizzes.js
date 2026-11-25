const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function run() {
  const dir = path.join(__dirname, '..', 'public', 'quizzes');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));

  let totalBefore = 0;
  let totalAfter = 0;
  let optimizedCount = 0;

  console.log(`Found ${files.length} images to optimize in ${dir}...`);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const inputBuffer = fs.readFileSync(fullPath);
    const beforeSize = inputBuffer.length;
    totalBefore += beforeSize;

    try {
      // Resize to max 960x720, maintain aspect ratio, compress with progressive MozJPEG Q76
      const optimizedBuffer = await sharp(inputBuffer)
        .resize({
          width: 960,
          height: 720,
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 76,
          progressive: true,
          mozjpeg: true
        })
        .toBuffer();

      // Only overwrite if it actually saved space
      if (optimizedBuffer.length < beforeSize) {
        fs.writeFileSync(fullPath, optimizedBuffer);
        totalAfter += optimizedBuffer.length;
        optimizedCount++;
        const savedPercent = Math.round(((beforeSize - optimizedBuffer.length) / beforeSize) * 100);
        console.log(`✓ ${file}: ${Math.round(beforeSize / 1024)} KB -> ${Math.round(optimizedBuffer.length / 1024)} KB (-${savedPercent}%)`);
      } else {
        totalAfter += beforeSize;
        console.log(`= ${file}: Already optimal (${Math.round(beforeSize / 1024)} KB)`);
      }
    } catch (err) {
      console.error(`✗ Error processing ${file}:`, err.message);
      totalAfter += beforeSize;
    }
  }

  console.log('\n--- Optimization Complete ---');
  console.log(`Optimized ${optimizedCount} of ${files.length} images.`);
  console.log(`Total Before: ${(totalBefore / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total After: ${(totalAfter / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total Savings: ${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1)}%`);
}

run().catch(console.error);

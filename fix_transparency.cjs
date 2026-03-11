const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = './public/assets';

async function fixTransparency() {
    const files = fs.readdirSync(assetsDir).filter(f => f.startsWith('npc_') && f.endsWith('.png'));
    console.log(`Checking transparency for ${files.length} sprites...`);

    for (const file of files) {
        const filePath = path.join(assetsDir, file);
        const tempPath = filePath + '.fixed.png';
        
        try {
            // This method attempts to remove a white background (#FFFFFF) 
            // by using the image as a mask for itself after thresholding
            
            const original = sharp(filePath);
            const { width, height } = await original.metadata();

            // 1. Create a mask: black where it's white, white where it's not
            // We use threshold to isolate non-white areas.
            const mask = await sharp(filePath)
                .threshold(250, { grayscale: true }) // Pixels > 250 (near white) become 255
                .negate() // Invert: White becomes black, rest becomes white
                .blur(0.5) // Slight feathering
                .toBuffer();

            // 2. Apply it as alpha
            await sharp(filePath)
                .joinChannel(mask)
                .png()
                .toFile(tempPath);

            fs.unlinkSync(filePath);
            fs.renameSync(tempPath, filePath);
            console.log(`  FIXED: ${file}`);
        } catch (err) {
            console.error(`  ERR on ${file}:`, err);
        }
    }
}

fixTransparency();

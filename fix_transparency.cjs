const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = './public/assets';
const avatarsDir = './public/avatars';

async function fixTransparency() {
    const assetFiles = fs.readdirSync(assetsDir).filter(f => f.startsWith('npc_') && f.endsWith('.png'));
    const avatarFiles = fs.readdirSync(avatarsDir).filter(f => f.startsWith('avatar_') && f.endsWith('.png'));
    
    const allFiles = [
        ...assetFiles.map(f => path.join(assetsDir, f)),
        ...avatarFiles.map(f => path.join(avatarsDir, f))
    ];

    console.log(`Checking transparency for ${allFiles.length} sprites...`);

    for (const filePath of allFiles) {
        const tempPath = filePath + '.fixed.png';
        
        try {
            // This method attempts to remove a white background (#FFFFFF) 
            // by using the image as a mask for itself after thresholding
            
            const original = sharp(filePath);
            const { width, height } = await original.metadata();

            // 1. Create a mask: black where it's near-white or near-grey-checkerboard, white where it's not
            // We use a stricter threshold (190) to kill the grey checkerboard (cca 204)
            const mask = await sharp(filePath)
                .threshold(190, { grayscale: true }) 
                .negate() 
                .blur(0.5) 
                .toBuffer();

            // 2. Apply it as alpha and also increase contrast/saturation to make it pop
            await sharp(filePath)
                .joinChannel(mask)
                .modulate({ brightness: 1.05, saturation: 1.15 })
                .sharpen()
                .png()
                .toFile(tempPath);

            fs.unlinkSync(filePath);
            fs.renameSync(tempPath, filePath);
            console.log(`  FIXED: ${path.basename(filePath)}`);
        } catch (err) {
            console.error(`  ERR on ${path.basename(filePath)}:`, err);
        }
    }
}

fixTransparency();

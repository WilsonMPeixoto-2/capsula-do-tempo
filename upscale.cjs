const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = './public/assets';

async function upscaleAll() {
      const files = fs.readdirSync(assetsDir).filter(f => /\.(jpg|png|jpeg)$/i.test(f) && !/_\d{13}\./.test(f));
      console.log(`Upscaling 16:9 with Blur Background Method...`);

      for (const file of files) {
            const filePath = path.join(assetsDir, file);
            const meta = await sharp(filePath).metadata();
            const isSprite = file.startsWith('npc_');

            // If already 4K, skip
            if (meta.width >= 3000 || meta.height >= 2048 && isSprite) { console.log(`  SKIP ${file}`); continue; }

            const tempPath = filePath + '.tmp';

            try {
                  if (isSprite) {
                        // For sprites, standard Lancaster upscale to 2048h, keeping transparency
                        await sharp(filePath)
                              .resize({ height: 2048, kernel: sharp.kernel.lanczos3 })
                              .sharpen({ sigma: 1.2, m1: 1.5, m2: 0.7 })
                              .png({ quality: 95 })
                              .toFile(tempPath);
                  } else {
                        // For backgrounds/CGs (3840x2160)

                        // 1. Create a blurred, dark background from the 1:1 image stretched to 16:9
                        const bgBuffer = await sharp(filePath)
                              .resize(3840, 2160, { fit: 'cover', kernel: sharp.kernel.lanczos3 })
                              .blur(60)
                              .modulate({ brightness: 0.4, saturation: 0.8 })
                              .toBuffer();

                        // 2. Create the sharp, highly detailed foreground (2160x2160)
                        const fgBuffer = await sharp(filePath)
                              .resize(2160, 2160, { fit: 'contain', kernel: sharp.kernel.lanczos3, background: { r: 0, g: 0, b: 0, alpha: 0 } })
                              .sharpen({ sigma: 1.2, m1: 1.5, m2: 0.7 })
                              .modulate({ saturation: 1.15 })
                              .toBuffer();

                        // 3. Composite them
                        await sharp(bgBuffer)
                              .composite([{ input: fgBuffer, gravity: 'center' }])
                              .jpeg({ quality: 97, mozjpeg: true, chromaSubsampling: '4:4:4' })
                              .toFile(tempPath);
                  }

                  fs.unlinkSync(filePath);
                  fs.renameSync(tempPath, filePath);
                  console.log(`  COMPLETED: ${file}`);
            } catch (err) {
                  console.error(`  ERR on ${file}:`, err);
                  if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
            }
      }
}

upscaleAll();

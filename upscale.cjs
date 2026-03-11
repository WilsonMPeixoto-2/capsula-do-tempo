const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = './public/assets';

async function upscaleAll() {
      const files = fs.readdirSync(assetsDir).filter(f => /\.(jpg|jpeg)$/i.test(f));
      console.log(`Converting and Sharpening JPGs to High-Res PNGs...`);

      for (const file of files) {
            const filePath = path.join(assetsDir, file);
            const isSprite = file.startsWith('npc_');
            const pngPath = filePath.replace(/\.(jpg|jpeg)$/i, '.png');

            try {
                  if (pngPath === filePath) continue; // Safety

                  if (isSprite) {
                        await sharp(filePath)
                              .resize({ height: 2048, kernel: sharp.kernel.lanczos3 })
                              .sharpen({ sigma: 1.0, m1: 1.0 })
                              .png({ quality: 100 })
                              .toFile(pngPath);
                  } else {
                        // For backgrounds/CGs (3840x2160) - PNG 4K
                        await sharp(filePath)
                              .resize(3840, 2160, { fit: 'cover', kernel: sharp.kernel.lanczos3 })
                              .modulate({ brightness: 1.05, saturation: 1.1 })
                              .sharpen({ sigma: 0.8, m1: 0.5 })
                              .png({ compressionLevel: 9, quality: 100 })
                              .toFile(pngPath);
                  }

                  fs.unlinkSync(filePath);
                  console.log(`  CONVERTED: ${file} -> PNG`);
            } catch (err) {
                  console.error(`  ERR on ${file}:`, err);
            }
      }
}

upscaleAll();

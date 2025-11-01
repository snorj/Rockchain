import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FRAME_COUNT = 8;
const FRAME_SIZE = 32; // 32x32 pixels per frame

// Ores we need for the game
const REQUIRED_ORES = ['coal', 'iron', 'diamond'];

async function createMiningAnimation(oreName) {
  const inputPath = join(__dirname, '../public/assets/sprites/ores', `${oreName}.png`);
  const outputPath = join(__dirname, '../public/assets/sprites/ores', `${oreName}-sheet.png`);

  try {
    // Load the original ore image
    const originalImage = sharp(inputPath);
    const metadata = await originalImage.metadata();

    // Resize to 32x32 if needed
    const resizedImage = await originalImage
      .resize(FRAME_SIZE, FRAME_SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    // Create frames with different states to simulate mining
    const frames = [];
    
    for (let i = 0; i < FRAME_COUNT; i++) {
      const progress = i / (FRAME_COUNT - 1); // 0 to 1
      
      // As mining progresses, we'll:
      // - Keep the ore mostly the same for first half
      // - Add slight brightness variation
      // - Reduce brightness in the last frames to simulate breaking
      
      let brightness = 1;
      
      if (progress < 0.6) {
        // First 60%: slight pulsing effect
        brightness = 1 + Math.sin(progress * Math.PI * 4) * 0.15;
      } else {
        // Last 40%: dimming effect
        const breakProgress = (progress - 0.6) / 0.4;
        brightness = 1 - breakProgress * 0.6;
      }
      
      // Create frame - all frames are exactly 32x32
      const frame = await sharp(resizedImage)
        .modulate({ brightness })
        .toBuffer();
      
      frames.push(frame);
    }

    // Combine frames horizontally into a sprite sheet
    const spriteSheet = await sharp({
      create: {
        width: FRAME_SIZE * FRAME_COUNT,
        height: FRAME_SIZE,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    });

    const compositeOperations = frames.map((frame, index) => ({
      input: frame,
      left: index * FRAME_SIZE,
      top: 0
    }));

    await spriteSheet
      .composite(compositeOperations)
      .png()
      .toFile(outputPath);

    console.log(`✅ Created sprite sheet: ${oreName}-sheet.png (${FRAME_COUNT} frames)`);
  } catch (error) {
    console.error(`❌ Error creating sprite sheet for ${oreName}:`, error.message);
  }
}

async function main() {
  console.log('🎨 Creating sprite sheets for mining animations...\n');

  for (const ore of REQUIRED_ORES) {
    await createMiningAnimation(ore);
  }

  console.log('\n✨ All sprite sheets created successfully!');
}

main();


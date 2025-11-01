import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FRAME_SIZE = 32;
const FRAME_COUNT = 8;
const ORES = ['coal', 'iron', 'diamond'];

async function splitSpriteSheet(oreName) {
  const inputPath = join(__dirname, '../public/assets/sprites/ores', `${oreName}-sheet.png`);
  
  console.log(`🔪 Splitting ${oreName}-sheet.png into ${FRAME_COUNT} frames...`);
  
  try {
    for (let i = 0; i < FRAME_COUNT; i++) {
      const outputPath = join(__dirname, '../public/assets/sprites/ores', `${oreName}_${i}.png`);
      
      await sharp(inputPath)
        .extract({
          left: i * FRAME_SIZE,
          top: 0,
          width: FRAME_SIZE,
          height: FRAME_SIZE
        })
        .toFile(outputPath);
      
      console.log(`  ✓ Created ${oreName}_${i}.png`);
    }
  } catch (error) {
    console.error(`  ✗ Error splitting ${oreName}:`, error.message);
  }
}

async function main() {
  console.log('🎨 Splitting sprite sheets into individual frames...\n');
  
  for (const ore of ORES) {
    await splitSpriteSheet(ore);
    console.log('');
  }
  
  console.log('✨ All frames created successfully!');
  console.log('\nCreated files:');
  console.log('  coal_0.png through coal_7.png');
  console.log('  iron_0.png through iron_7.png');
  console.log('  diamond_0.png through diamond_7.png');
}

main();


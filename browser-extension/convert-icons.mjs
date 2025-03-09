import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

// Sizes required for Chrome extension
const sizes = [16, 48, 128];

// Ensure icons directory exists
const iconsDir = path.join('src', 'icons');
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

// Convert SVG to PNG for each size
async function convertIcons() {
  console.log('Converting SVG to PNG icons...');
  
  const svgPath = path.join(iconsDir, 'icon.svg');
  
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon${size}.png`);
    
    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Created ${outputPath}`);
    } catch (error) {
      console.error(`❌ Failed to convert icon to ${size}x${size}:`, error);
    }
  }
  
  console.log('Icon conversion complete!');
}

convertIcons().catch(error => {
  console.error('❌ Icon conversion failed:', error);
  process.exit(1);
}); 
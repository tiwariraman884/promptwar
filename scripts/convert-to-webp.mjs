import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const IMAGES = [
  {
    input: 'public/logo.png',
    output: 'public/logo.webp',
    targetSizeKb: 30,
    options: { quality: 85, lossless: true, resize: { width: 128, height: 128 } }
  },
  {
    input: 'public/images/community-hero-bg.png',
    output: 'public/images/community-hero-bg.webp',
    targetSizeKb: 150,
    options: { quality: 75 }
  },
  {
    input: 'public/images/dashboard-hero-bg.png',
    output: 'public/images/dashboard-hero-bg.webp',
    targetSizeKb: 150,
    options: { quality: 75 }
  },
  {
    input: 'public/images/eco-feature.png',
    output: 'public/images/eco-feature.webp',
    targetSizeKb: 150,
    options: { quality: 75 }
  },
  {
    input: 'public/images/eco-hero-bg.png',
    output: 'public/images/eco-hero-bg.webp',
    targetSizeKb: 150,
    options: { quality: 75 }
  },
  {
    input: 'public/images/offsets-nature.png',
    output: 'public/images/offsets-nature.webp',
    targetSizeKb: 150,
    options: { quality: 75 }
  },
  {
    input: 'public/images/tips-hero-bg.png',
    output: 'public/images/tips-hero-bg.webp',
    targetSizeKb: 150,
    options: { quality: 75 }
  }
];

async function convertImage(img) {
  const inputPath = path.resolve(img.input);
  const outputPath = path.resolve(img.output);
  
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${img.input}`);
    return;
  }
  
  let quality = img.options.quality || 75;
  const isLossless = !!img.options.lossless;
  
  while (quality >= 20) {
    console.log(`Converting ${img.input} with quality=${quality}, lossless=${isLossless}...`);
    
    let sharpInstance = sharp(inputPath);
    if (img.options.resize) {
      sharpInstance = sharpInstance.resize(img.options.resize.width, img.options.resize.height);
    }
    
    sharpInstance = sharpInstance.webp({
      quality,
      lossless: isLossless
    });
    
    const tempPath = outputPath + '.temp';
    await sharpInstance.toFile(tempPath);
    
    const stats = fs.statSync(tempPath);
    const sizeKb = stats.size / 1024;
    console.log(`Resulting size: ${sizeKb.toFixed(2)} KB (Target: ${img.targetSizeKb} KB)`);
    
    if (sizeKb <= img.targetSizeKb || isLossless) {
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      fs.renameSync(tempPath, outputPath);
      console.log(`Successfully optimized and saved to ${img.output} (${sizeKb.toFixed(2)} KB at quality ${quality})`);
      return;
    }
    
    // If lossy and size target exceeded, reduce quality and retry
    fs.unlinkSync(tempPath);
    quality -= 5;
  }
  
  // If we couldn't meet target size with quality >= 20, just use the quality 20 one
  console.warn(`Could not reach target size of ${img.targetSizeKb} KB for ${img.input}. Saving with quality 20.`);
  let finalInstance = sharp(inputPath);
  if (img.options.resize) {
    finalInstance = finalInstance.resize(img.options.resize.width, img.options.resize.height);
  }
  finalInstance = finalInstance.webp({
    quality: 20,
    lossless: isLossless
  });
  await finalInstance.toFile(outputPath);
}

async function main() {
  for (const img of IMAGES) {
    try {
      await convertImage(img);
    } catch (err) {
      console.error(`Error converting ${img.input}:`, err);
    }
  }
}

main();

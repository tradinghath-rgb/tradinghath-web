const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

// Cloudflare R2 Credentials
const ACCOUNT_ID = 'fff2beff759aa7416543b9eb23f5a834';
const ACCESS_KEY_ID = '393cddfb4ae5bc1efe4b1e51852a943a';
const SECRET_ACCESS_KEY = '61c0f84d84e009010bd4cfdd9100915c66f9874d3c1d86d3066a66ec432ebb2f';
const BUCKET_NAME = 'tradinghath-media';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY
  }
});

async function uploadFolder(localDir, s3Prefix, allowedExtensions = ['.mp4']) {
  const files = fs.readdirSync(localDir);
  for (const file of files) {
    const fullPath = path.join(localDir, file);
    const stat = fs.statSync(fullPath);
    const ext = path.extname(file).toLowerCase();
    if (stat.isFile() && allowedExtensions.includes(ext)) {
      const s3Key = `${s3Prefix}/${file}`;
      console.log(`Uploading: ${s3Key} (${(stat.size / 1024 / 1024).toFixed(2)} MB)...`);
      const fileStream = fs.createReadStream(fullPath);
      const contentType = ext === '.mp4' ? 'video/mp4' : (ext === '.png' ? 'image/png' : 'image/jpeg');
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fileStream,
        ContentType: contentType
      });
      try {
        await s3.send(command);
        console.log(`Uploaded successfully: ${s3Key}`);
      } catch (err) {
        console.error(`Error uploading ${s3Key}:`, err);
      }
    }
  }
}

async function main() {
  console.log('--- Starting Cloudflare R2 Media Sync ---');
  const projectRoot = path.resolve(__dirname, '..');
  const chartsDir = path.join(projectRoot, 'public', 'charts');
  const teluguDir = path.join(projectRoot, 'public', 'videos', 'telugu');
  const englishDir = path.join(projectRoot, 'public', 'videos', 'english');

  if (fs.existsSync(chartsDir)) {
    console.log('\n--- Uploading Charts to Cloudflare R2 ---');
    await uploadFolder(chartsDir, 'charts', ['.jpg', '.jpeg', '.png', '.webp']);
  }

  if (fs.existsSync(teluguDir)) {
    console.log('\n--- Uploading Telugu Videos ---');
    await uploadFolder(teluguDir, 'videos/telugu', ['.mp4']);
  }

  if (fs.existsSync(englishDir)) {
    console.log('\n--- Uploading English Videos ---');
    await uploadFolder(englishDir, 'videos/english', ['.mp4']);
  } else {
    console.warn('English dir not found!');
  }

  console.log('\n--- Upload Process Finished ---');
}

main().catch(console.error);

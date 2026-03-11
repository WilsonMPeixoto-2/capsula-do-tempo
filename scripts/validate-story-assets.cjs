const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const storyPath = path.join(rootDir, 'src', 'data', 'storyData.json');
const publicDir = path.join(rootDir, 'public');
const voiceDir = path.join(publicDir, 'assets', 'audio', 'voice');

const story = JSON.parse(fs.readFileSync(storyPath, 'utf8'));
const assetRefs = [];
const spokenScenes = [];

for (const [sceneId, scene] of Object.entries(story)) {
  for (const field of ['bgImage', 'bgMusic', 'npcSprite', 'eventCG']) {
    if (scene[field]) {
      assetRefs.push({ sceneId, field, ref: scene[field] });
    }
  }

  if (scene.text) {
    spokenScenes.push(sceneId);
  }
}

const missingRefs = assetRefs.filter(({ ref }) => {
  const targetPath = path.join(publicDir, ref.replace(/^\//, '').replace(/\//g, path.sep));
  return !fs.existsSync(targetPath);
});

const missingVoice = spokenScenes.filter((sceneId) => {
  return !fs.existsSync(path.join(voiceDir, `${sceneId}.mp3`));
});

if (missingRefs.length === 0 && missingVoice.length === 0) {
  console.log('Story asset validation passed.');
  process.exit(0);
}

if (missingRefs.length > 0) {
  console.error('Missing story asset references:');
  missingRefs.forEach(({ sceneId, field, ref }) => {
    console.error(`- ${sceneId} :: ${field} -> ${ref}`);
  });
}

if (missingVoice.length > 0) {
  console.error('Missing voice tracks:');
  missingVoice.forEach((sceneId) => {
    console.error(`- ${sceneId}`);
  });
}

process.exit(1);

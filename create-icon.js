const fs = require('fs');
const path = require('path');

// Base64 encoded 1x1 transparent PNG
const transparentPNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

// Create models directory if it doesn't exist
fs.mkdirSync(path.join(__dirname, 'models'), { recursive: true });

// Create icon files
fs.writeFileSync(path.join(__dirname, 'models/icon.png'), transparentPNG);
fs.writeFileSync(path.join(__dirname, 'models/icon@2x.png'), transparentPNG);
fs.writeFileSync(path.join(__dirname, 'models/icon@3x.png'), transparentPNG);

console.log('Created placeholder icons');
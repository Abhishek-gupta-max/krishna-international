'use strict';

const fs = require('fs/promises');

/**
 * Validate an uploaded file by its leading "magic bytes", so a renamed executable
 * cannot pass as a CV or image just because of its extension or Content-Type header.
 */
const SIGNATURES = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  doc: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], // OLE2 compound file
  docx: [0x50, 0x4b, 0x03, 0x04], // ZIP container (OOXML)
  jpg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  webp: [0x52, 0x49, 0x46, 0x46], // RIFF....WEBP
};

function detectFromBuffer(buf) {
  for (const [type, sig] of Object.entries(SIGNATURES)) {
    if (buf.length >= sig.length && sig.every((byte, i) => buf[i] === byte)) {
      if (type === 'webp' && buf.subarray(8, 12).toString('ascii') !== 'WEBP') continue;
      return type;
    }
  }
  return null;
}

async function detectFileType(filePath) {
  const handle = await fs.open(filePath, 'r');
  try {
    const buf = Buffer.alloc(16);
    await handle.read(buf, 0, 16, 0);
    return detectFromBuffer(buf);
  } finally {
    await handle.close();
  }
}

module.exports = { detectFileType, detectFromBuffer };

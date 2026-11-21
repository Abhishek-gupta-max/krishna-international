'use strict';

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const { detectFileType } = require('../utils/fileSignature');

const CV_DIR = path.join(env.uploads.root, 'cvs');
const GALLERY_DIR = path.join(env.uploads.root, 'gallery');
[CV_DIR, GALLERY_DIR].forEach((d) => fs.mkdirSync(d, { recursive: true }));

const RULES = {
  cv: {
    dir: CV_DIR,
    maxBytes: env.uploads.maxCvBytes,
    extensions: { '.pdf': 'pdf', '.doc': 'doc', '.docx': 'docx' },
    mimes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/octet-stream',
    ],
    label: 'CV must be a PDF, DOC or DOCX file',
  },
  image: {
    dir: GALLERY_DIR,
    maxBytes: env.uploads.maxImageBytes,
    extensions: { '.jpg': 'jpg', '.jpeg': 'jpg', '.png': 'png', '.webp': 'webp' },
    mimes: ['image/jpeg', 'image/png', 'image/webp'],
    label: 'Image must be a JPG, PNG or WEBP file',
  },
};

function buildUploader(kind) {
  const rule = RULES[kind];
  const storage = multer.diskStorage({
    destination: rule.dir,
    // Random server-side name: the original filename never touches the filesystem.
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${crypto.randomBytes(12).toString('hex')}${ext}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: rule.maxBytes, files: 1, fields: 30 },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!rule.extensions[ext] || !rule.mimes.includes(file.mimetype)) {
        return cb(ApiError.unprocessable(rule.label, [{ field: file.fieldname, message: rule.label }]));
      }
      cb(null, true);
    },
  });
}

/**
 * Accept a single file in `field`, then confirm its real type from the file header.
 * Files that fail any check are deleted immediately.
 */
function single(kind, field, { required = false } = {}) {
  const rule = RULES[kind];
  const mw = buildUploader(kind).single(field);

  return (req, res, next) => {
    mw(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          const msg =
            err.code === 'LIMIT_FILE_SIZE'
              ? `File is too large. Maximum size is ${Math.round(rule.maxBytes / 1024 / 1024)} MB.`
              : 'File upload failed.';
          return next(ApiError.unprocessable(msg, [{ field, message: msg }]));
        }
        return next(err);
      }
      if (!req.file) {
        return required ? next(ApiError.unprocessable('Please attach a file.', [{ field, message: 'File is required' }])) : next();
      }
      try {
        const detected = await detectFileType(req.file.path);
        const expected = rule.extensions[path.extname(req.file.originalname).toLowerCase()];
        if (detected !== expected) {
          await fsp.unlink(req.file.path).catch(() => {});
          return next(ApiError.unprocessable(rule.label, [{ field, message: 'File content does not match its type.' }]));
        }
        next();
      } catch (e) {
        next(e);
      }
    });
  };
}

/** Remove an uploaded file when a later step fails. */
async function discard(file) {
  if (file?.path) await fsp.unlink(file.path).catch(() => {});
}

module.exports = { single, discard, CV_DIR, GALLERY_DIR };

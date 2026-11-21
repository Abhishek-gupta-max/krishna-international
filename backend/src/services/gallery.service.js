'use strict';

const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const ApiError = require('../utils/ApiError');
const galleryRepository = require('../repositories/gallery.repository');
const { GALLERY_DIR } = require('../middlewares/upload');
const { mapGalleryItem } = require('../models');

/**
 * Re-encode the upload as WebP (max 1800px) plus a 640px thumbnail.
 * Re-encoding also strips EXIF metadata (including GPS location) from photos.
 */
async function processImage(file) {
  const name = `${Date.now()}-${crypto.randomBytes(10).toString('hex')}.webp`;
  const full = path.join(GALLERY_DIR, name);
  const thumb = path.join(GALLERY_DIR, `thumb-${name}`);
  try {
    const info = await sharp(file.path)
      .rotate()
      .resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(full);
    await sharp(file.path).rotate().resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true }).webp({ quality: 72 }).toFile(thumb);
    return { imagePath: name, width: info.width, height: info.height };
  } catch {
    await Promise.all([fsp.unlink(full).catch(() => {}), fsp.unlink(thumb).catch(() => {})]);
    throw ApiError.unprocessable('The image could not be processed. Please upload a valid JPG, PNG or WEBP photo.');
  } finally {
    await fsp.unlink(file.path).catch(() => {});
  }
}

async function listPublic(category) {
  const rows = await galleryRepository.listPublic(category);
  return rows.map((r) => mapGalleryItem(r));
}

async function listAdmin() {
  const rows = await galleryRepository.listAdmin();
  return rows.map((r) => mapGalleryItem(r, { admin: true }));
}

async function get(id) {
  const row = await galleryRepository.findById(id);
  if (!row) throw ApiError.notFound('Gallery item not found.');
  return mapGalleryItem(row, { admin: true });
}

async function create(data, file, adminId) {
  if (!file) throw ApiError.unprocessable('Please choose an image to upload.', [{ field: 'image', message: 'Image is required' }]);
  const image = await processImage(file);
  const id = await galleryRepository.create({ ...data, ...image }, adminId);
  return get(id);
}

async function update(id, data) {
  await get(id);
  await galleryRepository.update(id, data);
  return get(id);
}

async function remove(id) {
  const row = await galleryRepository.findById(id);
  if (!row) throw ApiError.notFound('Gallery item not found.');
  await galleryRepository.softDelete(id);
  // Image files are removed so they are no longer publicly reachable.
  const name = path.basename(row.image_path);
  await Promise.all([
    fsp.unlink(path.join(GALLERY_DIR, name)).catch(() => {}),
    fsp.unlink(path.join(GALLERY_DIR, `thumb-${name}`)).catch(() => {}),
  ]);
  return { id, title: row.title };
}

module.exports = { listPublic, listAdmin, get, create, update, remove };

'use strict';

const galleryService = require('../services/gallery.service');
const audit = require('../services/audit.service');
const { ok, created } = require('../utils/response');

async function listPublic(req, res) {
  ok(res, await galleryService.listPublic(req.query.category));
}

async function listAdmin(req, res) {
  ok(res, await galleryService.listAdmin());
}

async function create(req, res) {
  const item = await galleryService.create(req.body, req.file, req.admin.id);
  await audit.record(req, 'create', 'gallery', item.id, { title: item.title });
  created(res, item, 'Image uploaded');
}

async function update(req, res) {
  const item = await galleryService.update(req.params.id, req.body);
  await audit.record(req, 'update', 'gallery', item.id, { title: item.title });
  ok(res, item, 'Image updated');
}

async function remove(req, res) {
  const item = await galleryService.remove(req.params.id);
  await audit.record(req, 'delete', 'gallery', item.id, { title: item.title });
  ok(res, null, 'Image deleted');
}

module.exports = { listPublic, listAdmin, create, update, remove };

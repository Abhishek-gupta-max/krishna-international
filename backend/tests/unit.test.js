'use strict';

process.env.NODE_ENV = 'test';

const request = require('supertest');
const v = require('../src/validators');
const { detectFromBuffer } = require('../src/utils/fileSignature');
const { slugify, likeTerm } = require('../src/utils/helpers');
const app = require('../src/app');

describe('validators', () => {
  test('contact enquiry requires name, email, subject and message', () => {
    const { error } = v.contactEnquiry.validate({ email: 'bad' }, { abortEarly: false });
    const fields = error.details.map((d) => d.path[0]);
    expect(fields).toEqual(expect.arrayContaining(['name', 'email', 'subject', 'message']));
  });

  test('candidate application coerces multipart strings', () => {
    const { value, error } = v.candidateApplication.validate({
      fullName: 'Ram Kumar',
      mobile: '+91 98765 43210',
      email: 'RAM@Example.com ',
      qualification: 'ITI Electrician',
      experienceYears: '3.5',
      preferredCountry: 'UAE',
      preferredCategory: 'Electrician',
      consent: 'true',
      jobId: '',
    });
    expect(error).toBeUndefined();
    expect(value.experienceYears).toBe(3.5);
    expect(value.email).toBe('ram@example.com');
    expect(value.jobId).toBeNull();
  });

  test('candidate application requires consent', () => {
    const { error } = v.candidateApplication.validate({ consent: 'false' }, { abortEarly: false });
    expect(error.details.some((d) => d.path[0] === 'consent')).toBe(true);
  });

  test('new password must differ and contain letters and digits', () => {
    expect(v.changePassword.validate({ currentPassword: 'abc', newPassword: 'onlyletters' }).error).toBeDefined();
    expect(v.changePassword.validate({ currentPassword: 'abc', newPassword: 'Secure12345' }).error).toBeUndefined();
  });

  test('settings keys are restricted to snake_case', () => {
    expect(v.settingsUpdate.validate({ settings: { 'bad key;': 'x' } }).error).toBeDefined();
    expect(v.settingsUpdate.validate({ settings: { hero_title: 'x' } }).error).toBeUndefined();
  });
});

describe('file signature detection', () => {
  test('detects PDF, DOCX, JPG and rejects text', () => {
    expect(detectFromBuffer(Buffer.from('%PDF-1.7 ....'))).toBe('pdf');
    expect(detectFromBuffer(Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 0]))).toBe('docx');
    expect(detectFromBuffer(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe('jpg');
    expect(detectFromBuffer(Buffer.from('MZ executable'))).toBeNull();
  });
});

describe('helpers', () => {
  test('slugify', () => {
    expect(slugify('Electrician – Dubai, UAE')).toBe('electrician-dubai-uae');
  });
  test('likeTerm escapes wildcards', () => {
    expect(likeTerm('50%_off')).toBe('%50\\%\\_off%');
  });
});

describe('HTTP layer (no database required)', () => {
  test('unknown route returns standard 404 envelope', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false });
  });

  test('admin routes require a token', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect(res.status).toBe(401);
  });

  test('admin routes reject a forged token', async () => {
    const res = await request(app).get('/api/admin/dashboard').set('Authorization', 'Bearer abc.def.ghi');
    expect(res.status).toBe(401);
  });

  test('contact form validation errors are returned per field', async () => {
    const res = await request(app).post('/api/contact').send({ name: 'A' });
    expect(res.status).toBe(422);
    expect(res.body.errors.map((e) => e.field)).toEqual(expect.arrayContaining(['name', 'email', 'subject', 'message']));
  });

  test('CV upload rejects disallowed file types', async () => {
    const res = await request(app)
      .post('/api/applications')
      .attach('cv', Buffer.from('MZ fake exe'), { filename: 'cv.exe', contentType: 'application/octet-stream' });
    expect(res.status).toBe(422);
  });

  test('CV upload rejects a renamed non-PDF file', async () => {
    const res = await request(app)
      .post('/api/applications')
      .field('fullName', 'Test')
      .attach('cv', Buffer.from('this is not a pdf'), { filename: 'cv.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(422);
    expect(res.body.errors[0].message).toMatch(/does not match/);
  });

  test('security headers are set', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

afterAll(async () => {
  await require('../src/config/database').pool.end().catch(() => {});
});

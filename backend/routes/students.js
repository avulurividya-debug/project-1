const express = require('express');
const db = require('../supabase');
const { authenticate, allowRoles } = require('../middleware/auth');
const { text } = require('../utils/validation');
const router = express.Router();
router.use(authenticate);
router.get('/me', async (req, res, next) => {
  try { const { data, error } = await db.from('users').select('id,name,email,role,department,graduation_year,skills,created_at').eq('id', req.user.id).single(); if (error) throw error; res.json({ student: data }); } catch (e) { next(e); }
});
router.patch('/me', async (req, res, next) => {
  try {
    const update = { name: text(req.body.name, 100), department: text(req.body.department, 100), skills: text(req.body.skills, 500), updated_at: new Date().toISOString() };
    if (!update.name) return res.status(400).json({ error: 'Name is required.' });
    const year = Number(req.body.graduation_year); update.graduation_year = Number.isInteger(year) && year >= 2020 && year <= 2100 ? year : null;
    const { data, error } = await db.from('users').update(update).eq('id', req.user.id).select('id,name,email,role,department,graduation_year,skills').single(); if (error) throw error; res.json({ student: data });
  } catch (e) { next(e); }
});
router.get('/', allowRoles('admin'), async (req, res, next) => {
  try { const { data, error } = await db.from('users').select('id,name,email,department,graduation_year,skills,created_at').eq('role','student').order('name'); if (error) throw error; res.json({ students: data }); } catch (e) { next(e); }
});
module.exports = router;

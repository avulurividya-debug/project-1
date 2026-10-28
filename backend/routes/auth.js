const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../supabase');
const { text, email, required } = require('../utils/validation');
const router = express.Router();

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department || '', graduation_year: user.graduation_year || null, skills: user.skills || '' };
}
function tokenFor(user) {
  return jwt.sign({ sub: user.id, id: user.id, name: user.name, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
}
router.post('/register', async (req, res, next) => {
  try {
    const name = text(req.body.name, 100), userEmail = email(req.body.email), password = typeof req.body.password === 'string' ? req.body.password : '';
    required(name, 'Name'); required(userEmail, 'A valid email');
    if (password.length < 8) return res.status(400).json({ error: 'Password must contain at least 8 characters.' });
    const { data: existing, error: lookupError } = await db.from('users').select('id').eq('email', userEmail).maybeSingle();
    if (lookupError) throw lookupError;
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });
    const password_hash = await bcrypt.hash(password, 12);
    const { data, error } = await db.from('users').insert({ name, email: userEmail, password_hash, role: 'student', department: text(req.body.department, 100), graduation_year: Number(req.body.graduation_year) || null, skills: text(req.body.skills, 500) }).select('id,name,email,role,department,graduation_year,skills').single();
    if (error) throw error;
    res.status(201).json({ token: tokenFor(data), user: publicUser(data) });
  } catch (e) { next(e); }
});
router.post('/login', async (req, res, next) => {
  try {
    const userEmail = email(req.body.email), password = typeof req.body.password === 'string' ? req.body.password : '';
    required(userEmail, 'A valid email'); required(password, 'Password');
    const { data: user, error } = await db.from('users').select('*').eq('email', userEmail).maybeSingle();
    if (error) throw error;
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: 'Email or password is incorrect.' });
    res.json({ token: tokenFor(user), user: publicUser(user) });
  } catch (e) { next(e); }
});
module.exports = router;

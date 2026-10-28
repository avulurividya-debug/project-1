const express = require('express');
const db = require('../supabase');
const { authenticate, allowRoles } = require('../middleware/auth');
const { text, required } = require('../utils/validation');
const router = express.Router(); router.use(authenticate);
router.get('/', async (req, res, next) => { try { const { data, error } = await db.from('companies').select('*').order('name'); if (error) throw error; res.json({ companies: data }); } catch(e) { next(e); } });
router.post('/', allowRoles('admin'), async (req, res, next) => { try { const name=text(req.body.name,120); required(name,'Company name'); const { data,error }=await db.from('companies').insert({name,website:text(req.body.website,250)||null,industry:text(req.body.industry,100)||null,description:text(req.body.description,1000)||null,contact_email:text(req.body.contact_email,254).toLowerCase()||null}).select('*').single(); if(error) throw error; res.status(201).json({company:data}); } catch(e){next(e);} });
router.delete('/:id', allowRoles('admin'), async (req,res,next)=>{try{const {error}=await db.from('companies').delete().eq('id',req.params.id);if(error)throw error;res.json({message:'Company deleted.'});}catch(e){next(e);}});
module.exports=router;

import { Router } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Search from '../models/Search.js';
import Recommendation from '../models/Recommendation.js';
import Audit from '../models/AuditLog.js';
import { mockRecommend } from '../services/recommendService.js';

dotenv.config();
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}

// 검색 생성
router.post('/searches', requireAuth, async (req, res) => {
  const { location, mood, budget, companions } = req.body || {};
  if (!location) return res.status(400).json({ error: 'location 필요' });

  const s = await Search.create({
    userId: req.user.uid,
    query: { location, mood, budget: Number(budget || 0), companions },
    status: 'pending'
  });

  // 모의 추천 생성
  try {
    const recData = await mockRecommend({ location, mood, budget, companions });
    const rec = await Recommendation.create({
      searchId: s._id,
      ...recData,
      raw: { mock: true }
    });
    s.status = 'done';
    await s.save();
    await Audit.create({ actorId: req.user.uid, action: 'SEARCH_CREATE', targetId: s._id });
    return res.status(201).json({ id: rec._id });
  } catch (e) {
    s.status = 'failed';
    await s.save();
    return res.status(500).json({ error: e.message });
  }
});

// 내 검색 목록
router.get('/searches', requireAuth, async (req, res) => {
  const list = await Search.find({ userId: req.user.uid })
    .sort({ createdAt: -1 }).limit(50);

  // Search._id 배열
  const ids = list.map(s => s._id);
  // 각 Search에 매칭되는 Recommendation 찾기 (recommendations.searchId == searches._id)
  const recs = await Recommendation.find({ searchId: { $in: ids } }).select('_id searchId');
  const recMap = new Map(recs.map(r => [r.searchId.toString(), r._id.toString()]));

  // Plain object로 변환하면서 recId 주입
  const items = list.map(s => {
    const obj = s.toObject();
    obj.recId = recMap.get(s._id.toString()) || null;
    return obj;
  });

  res.json({ items });
});


export default router;


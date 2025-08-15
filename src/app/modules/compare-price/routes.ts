import express from 'express';
import { comparePrice } from './service'; 

const router = express.Router(); 

router.route('/').post(async (req, res) => {
  try {
    const { query, maxPrice } = req.body;
    const results = await comparePrice(query, maxPrice); // use singular

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router; // ← export router

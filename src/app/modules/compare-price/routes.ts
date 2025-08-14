import express from 'express';
import { comparePrice } from './service'; // make sure the function name matches

const router = express.Router(); // ← define router

router.route('/').post(async (req, res) => {
  try {
    const { query, maxPrice } = req.body;

    console.log(`[Compare] Searching "${query}" with max €${maxPrice}`);
    const results = await comparePrice(query, maxPrice); // use singular

    res.status(200).json(results);
  } catch (error) {
    console.error('Price compare error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router; // ← export router

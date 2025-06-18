import express from 'express';
import pool from './db.js';
import esClient from './elastic.js';

const app = express();
app.use(express.json());

app.post('/product', async (req, res) => {
  const { name, description, price, tags } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO product (name, description, price, tags) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, price, tags]
    );
    const product = result.rows[0];

    await esClient.index({
      index: 'products',
      id: product.id,
      document: product
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Insert failed' });
  }
});

app.get('/product/search', async (req, res) => {
  const { q } = req.query;

  try {
    const result = await esClient.search({
      index: 'products',
      size: 5,
      query: {
        multi_match: {
          query: q,
          fields: ['name', 'description', 'tags'],
          fuzziness: 'AUTO'
        }
      }
    });

    res.json(result.hits.hits.map(hit => hit._source));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));

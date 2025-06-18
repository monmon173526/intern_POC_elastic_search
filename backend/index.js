import express from 'express';
import pool from './db.js';
import esClient, { initElastic } from './elastic.js';
import { syncAllProductsToES } from './sync.js';

const app = express();
app.use(express.json());

// 🧠 Wrap everything in an async function
(async () => {
  try {
    await initElastic(); // 🟢 Ensure index is created BEFORE starting the app
    await syncAllProductsToES();

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

    // 🔍 Exact match search
    app.get('/product/search_exact', async (req, res) => {
      const { q } = req.query;
      if (!q) return res.status(400).json({ error: 'Missing query' });

      try {
        const result = await esClient.search({
          index: 'products',
          size: 5,
          query: {
            match: {
              name: q
            }
          }
        });
        res.json(result.hits.hits.map(hit => hit._source));
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Search failed' });
      }
    });

    // 🔍 Multi-match fuzzy search
    app.get('/product/search_multi_match', async (req, res) => {
      const { q } = req.query;
      if (!q) return res.status(400).json({ error: 'Missing query' });

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

    // 🔍 Hybrid search (multi_match + wildcard)
    app.get('/product/search_hybrid', async (req, res) => {
      const { q } = req.query;
      if (!q) return res.status(400).json({ error: 'Missing query' });

      try {
        const result = await esClient.search({
          index: 'products',
          size: 5,
          query: {
            bool: {
              should: [
                {
                  multi_match: {
                    query: q,
                    fields: ['name^2', 'description', 'tags'],
                    fuzziness: 'AUTO'
                  }
                },
                { wildcard: { name: `*${q.toLowerCase()}*` } },
                { wildcard: { description: `*${q.toLowerCase()}*` } },
                { wildcard: { tags: `*${q.toLowerCase()}*` } }
              ]
            }
          }
        });
        res.json(result.hits.hits.map(hit => hit._source));
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Search failed' });
      }
    });

    // 🔍 Optimal (multi_match + edge_ngram)
    app.get('/product/search_optimal', async (req, res) => {
      const { q } = req.query;
      if (!q) return res.status(400).json({ error: 'Missing query' });

      try {
        const result = await esClient.search({
          index: 'products',
          size: 5,
          query: {
            bool: {
              should: [
                {
                  multi_match: {
                    query: q,
                    fields: ['name^3', 'name.edge^5', 'description', 'tags'],
                    fuzziness: 'AUTO',
                    type: 'best_fields'
                  }
                }
              ]
            }
          }
        });
        res.json(result.hits.hits.map(hit => hit._source));
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Search failed' });
      }
    });

    app.listen(3000, () => console.log('✅ Server running on http://localhost:3000'));
  } catch (err) {
    console.error('❌ Failed to initialize Elasticsearch:', err);
    process.exit(1);
  }
})();

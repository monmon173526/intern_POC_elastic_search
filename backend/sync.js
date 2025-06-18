import pool from './db.js';
import esClient from './elastic.js';

export async function syncAllProductsToES() {
  try {
    const result = await pool.query('SELECT * FROM product');
    const products = result.rows;

    for (const product of products) {
      await esClient.index({
        index: 'products',
        id: product.id,
        document: product
      });
    }

    console.log(`✅ Synced ${products.length} products to Elasticsearch`);
  } catch (err) {
    console.error('❌ Failed to sync products to Elasticsearch:', err);
  }
}

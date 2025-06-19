import { faker } from '@faker-js/faker';
import pool from '../backend/db.js';
import esClient from '../backend/elastic.js';

const BATCH_SIZE = 1000;
const TOTAL = 10000;

async function seed() {
  console.log(`🚀 Seeding ${TOTAL} products...`);

for (let i = 0; i < TOTAL / BATCH_SIZE; i++) {
  const values = [];
  const placeholders = [];

  for (let j = 0; j < BATCH_SIZE; j++) {
    const name = faker.commerce.productName(); // may contain apostrophes
    const description = faker.commerce.productDescription();
    const price = parseFloat(faker.commerce.price());
    const tags = [faker.commerce.department(), faker.commerce.productAdjective()];

    values.push(name, description, price, tags);

    const index = j * 4;
    placeholders.push(`($${index + 1}, $${index + 2}, $${index + 3}, $${index + 4})`);
  }

  const query = `
    INSERT INTO product (name, description, price, tags)
    VALUES ${placeholders.join(',')}
    RETURNING *;
  `;

  const result = await pool.query(query, values);

  for (const product of result.rows) {
    await esClient.index({
      index: 'products',
      id: product.id,
      document: product
    });
  }

  console.log(`✅ Batch ${i + 1} indexed`);
}


  console.log(`🎉 Done: ${TOTAL} products inserted and indexed`);
  process.exit();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});

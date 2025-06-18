import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

const esClient = new Client({ node: process.env.ES_NODE });

export async function initElastic() {
  const exists = await esClient.indices.exists({ index: 'products' });

  if (!exists) {
    await esClient.indices.create({
      index: 'products',
      body: {
        mappings: {
          properties: {
            name: { type: 'text' },
            description: { type: 'text' },
            price: { type: 'float' },
            tags: { type: 'keyword' }
          }
        }
      }
    });
  }
}

export default esClient;

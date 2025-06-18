import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';
dotenv.config();

const esClient = new Client({ node: process.env.ES_NODE });

await esClient.indices.create({
  index: 'products',
  ignore: [400],
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

export default esClient;

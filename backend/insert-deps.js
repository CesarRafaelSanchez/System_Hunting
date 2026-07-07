const { Client } = require('pg');
const client = new Client({ user: 'postgres', password: 'postgres', host: 'localhost', port: 5432, database: 'hunting_crm' });
client.connect().then(async () => {
  try {
    await client.query("INSERT INTO pipeline_stages (id, pipeline_id, name, code, position, stage_type) VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'Etapa 2', 'E2', 2, 'NORMAL') ON CONFLICT DO NOTHING");
    console.log('Inserted Stage 2');
  } catch (e) {
    console.error(e);
  } finally {
    client.end();
  }
});

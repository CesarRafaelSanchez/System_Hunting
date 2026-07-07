const { Client } = require('pg');
const client = new Client({ user: 'postgres', password: 'postgres', host: 'localhost', port: 5432, database: 'hunting_crm' });
client.connect().then(() => client.query("SELECT id FROM distritos WHERE nombre = 'San Isidro'")).then(res => { console.log(res.rows[0].id); client.end(); }).catch(console.error);

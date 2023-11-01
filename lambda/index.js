exports.handler = async (event, context, cb) => {
  const { Client } = require('pg');
  const client = new Client({
                   user: process.env.DB_USER,
                   host: process.env.DB_HOST,
                   database: process.env.DB_DATABASE,
                   password: process.env.DB_PASSWORD,
                   port: 5432
                 });
  await client.connect();
  // Insert new user with event.userSub attribute from event
  client.query("INSERT INTO good_reads_user (id) VALUES ($1)", [event.request.userAttributes.sub])
  client.end();
};
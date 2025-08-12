#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

(async () => {
  const conn = process.env.SUPABASE_CONNECTION_STRING;
  if (!conn) {
    console.log('SUPABASE_CONNECTION_STRING not set. Skipping SQL apply.');
    process.exit(0);
  }
  const sqlPath = path.join(__dirname, '..', 'supabase.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const client = new Client({ connectionString: conn });
  try {
    await client.connect();
    await client.query(sql);
    console.log('Supabase SQL applied successfully.');
  } catch (err) {
    console.error('Failed to apply Supabase SQL:', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
// Corre un archivo .sql contra la base Postgres del proyecto usando DATABASE_URL
// (conexion directa, para DDL que el cliente PostgREST/service_role no puede ejecutar).
// Uso: node scripts/run-sql.mjs supabase/migrations/0001_init.sql
import { readFileSync } from 'node:fs'
import { Client } from 'pg'

const file = process.argv[2]
if (!file) {
  console.error('Uso: node scripts/run-sql.mjs <archivo.sql>')
  process.exit(1)
}
if (!process.env.DATABASE_URL) {
  console.error('Falta DATABASE_URL (definila en .env.local)')
  process.exit(1)
}

const sql = readFileSync(file, 'utf8')
// rejectUnauthorized:false porque el pooler de Supabase presenta una cadena de
// certificados que el store de CAs de Node no valida por default. Aceptable para
// un script local de migracion; la app en runtime no usa esta conexion.
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

await client.connect()
try {
  await client.query(sql)
  console.log(`OK: ${file} ejecutado correctamente.`)
} finally {
  await client.end()
}

const { Client } = require('pg');

async function main() {
  // Conectamos a la base de datos de SUPABASE (que es la que usa el Club Crosti)
  const connectionString = process.env.SUPABASE_POSTGRES_URL_NON_POOLING || "postgres://postgres.exgqehauvjwwnitzcmms:zTIarhjME8k6nI1f@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require";
  
  const client = new Client({ connectionString });

  try {
    console.log("Conectando a Supabase...");
    await client.connect();
    
    console.log("Ejecutando migración...");
    
    // Primero, nos aseguramos de que la tabla club_campaigns exista
    await client.query(`
      CREATE TABLE IF NOT EXISTS club_campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        message TEXT,
        type TEXT DEFAULT 'email',
        reach_count INTEGER DEFAULT 0,
        sent_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Añadimos las nuevas columnas
    await client.query(`
      ALTER TABLE club_campaigns
        ADD COLUMN IF NOT EXISTS subject TEXT,
        ADD COLUMN IF NOT EXISTS target_segment TEXT DEFAULT 'all',
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
        ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;
    `);

    console.log("✅ Migración de campañas completada con éxito en Supabase!");
  } catch (error) {
    console.error("❌ Fallo en la migración:", error);
  } finally {
    await client.end();
  }
}

main();

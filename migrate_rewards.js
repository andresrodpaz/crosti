const { Client } = require('pg');

async function main() {
  const connectionString = process.env.SUPABASE_POSTGRES_URL_NON_POOLING || "postgres://postgres.exgqehauvjwwnitzcmms:zTIarhjME8k6nI1f@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require";
  
  const client = new Client({ connectionString });

  try {
    console.log("Conectando a Supabase para crear tablas de recompensas...");
    await client.connect();
    
    // 1. Crear tabla de recompensas (Catálogo)
    await client.query(`
      CREATE TABLE IF NOT EXISTS club_rewards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        points_cost INTEGER NOT NULL,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Insertar un premio por defecto (para que no esté vacío)
    await client.query(`
      INSERT INTO club_rewards (name, description, points_cost)
      SELECT 'Galleta Clásica', 'Canjea tus puntos por cualquier galleta de nuestro catálogo clásico.', 10
      WHERE NOT EXISTS (SELECT 1 FROM club_rewards);
    `);

    // 2. Crear tabla de canjes (Historial)
    await client.query(`
      CREATE TABLE IF NOT EXISTS club_redemptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID REFERENCES club_customers(id) ON DELETE CASCADE,
        reward_id UUID REFERENCES club_rewards(id) ON DELETE SET NULL,
        points_spent INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log("✅ Tablas de recompensas creadas con éxito!");
  } catch (error) {
    console.error("❌ Fallo en la migración:", error);
  } finally {
    await client.end();
  }
}

main();

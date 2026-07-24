const { Client } = require('pg');
require('dotenv').config();

// Bypass SSL certificate validation issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function main() {
  const connectionString = process.env.SUPABASE_POSTGRES_URL_NON_POOLING || 
                           process.env.SUPABASE_POSTGRES_URL || 
                           "postgres://postgres.exgqehauvjwwnitzcmms:zTIarhjME8k6nI1f@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require";
  
  console.log("Connecting to Supabase Database to configure storage policies...");
  const client = new Client({ 
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log("Connected successfully. Running storage configuration script...");

    // 1. Ensure the bucket 'cookie-images' exists and is set to public
    await client.query(`
      INSERT INTO storage.buckets (id, name, public)
      VALUES ('cookie-images', 'cookie-images', true)
      ON CONFLICT (id) DO UPDATE SET public = true;
    `);
    console.log("✅ Verified 'cookie-images' bucket exists and is public.");

    // 2. Drop existing policies to avoid conflicts or duplication
    const policiesToDrop = [
      'Allow public read access for cookie-images',
      'Allow admin upload to cookie-images',
      'Allow admin update to cookie-images',
      'Allow admin delete from cookie-images',
      'Allow authenticated upload to cookie-images',
      'Allow authenticated update to cookie-images',
      'Allow authenticated delete from cookie-images'
    ];

    for (const policyName of policiesToDrop) {
      await client.query(`DROP POLICY IF EXISTS "${policyName}" ON storage.objects;`);
    }
    console.log("✅ Cleaned up existing storage policies for 'cookie-images'.");

    // 3. Create SELECT policy (Allow public read access)
    await client.query(`
      CREATE POLICY "Allow public read access for cookie-images"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'cookie-images');
    `);
    console.log("✅ Created public SELECT policy.");

    // 4. Create INSERT policy (Allow authenticated users with admin, editor, or developer role)
    await client.query(`
      CREATE POLICY "Allow admin upload to cookie-images"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'cookie-images' AND
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid()
          AND role IN ('admin', 'editor', 'developer')
        )
      );
    `);
    console.log("✅ Created admin INSERT policy.");

    // 5. Create UPDATE policy (Allow authenticated users with admin, editor, or developer role)
    await client.query(`
      CREATE POLICY "Allow admin update to cookie-images"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'cookie-images' AND
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid()
          AND role IN ('admin', 'editor', 'developer')
        )
      )
      WITH CHECK (
        bucket_id = 'cookie-images'
      );
    `);
    console.log("✅ Created admin UPDATE policy.");

    // 6. Create DELETE policy (Allow authenticated users with admin, editor, or developer role)
    await client.query(`
      CREATE POLICY "Allow admin delete from cookie-images"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'cookie-images' AND
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid()
          AND role IN ('admin', 'editor', 'developer')
        )
      );
    `);
    console.log("✅ Created admin DELETE policy.");

    console.log("\n🎉 Storage Row Level Security (RLS) policies configured successfully!");
  } catch (error) {
    console.error("❌ Error running storage configuration:", error);
  } finally {
    await client.end();
  }
}

main();

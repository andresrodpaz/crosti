-- Add invoice_url column to orders table to store PDF location
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS invoice_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN orders.invoice_url IS 'URL to the invoice PDF stored in Vercel Blob Storage';

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

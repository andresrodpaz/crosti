-- Add pack_cookies column to order_items table to store pack details
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS pack_cookies JSONB;

-- Add comment for documentation
COMMENT ON COLUMN order_items.pack_cookies IS 'JSON array containing pack cookie details: [{cookieId, cookieName, quantity}]';

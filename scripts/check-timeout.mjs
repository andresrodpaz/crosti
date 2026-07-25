import { createClient } from '@supabase/supabase-js'

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4Z3FlaGF1dmp3d25pdHpjbW1zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4NzI0OSwiZXhwIjoyMDgxMzYzMjQ5fQ.ejNl7YZVLI6feGdzOA1TpbtSFToXCfFeOKKSAYBkFOs'
const URL = 'https://exgqehauvjwwnitzcmms.supabase.co'

const s = createClient(URL, SERVICE_KEY)

// Try a simple query to see how long it takes
console.time('simple-query')
const { data, error } = await s.from('cookies').select('id').limit(1)
console.timeEnd('simple-query')
console.log('result:', { data, error })

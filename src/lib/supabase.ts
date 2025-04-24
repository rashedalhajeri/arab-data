import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// استيراد عميل Supabase الموجود بدلا من إنشاء عميل جديد
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// تصدير نفس العميل
export const supabase = supabaseClient; 
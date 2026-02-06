import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mfgfbwhznqpdjumtsrus.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2pDY4atjEw5MVSWeakl4HA_exf_osvS';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'sb-auth-token',
    storage: {
      getItem: (key: string) => {
        if (typeof window === 'undefined') return null;
        return document.cookie
          .split('; ')
          .find(row => row.startsWith(`${key}=`))
          ?.split('=')[1] || null;
      },
      setItem: (key: string, value: string) => {
        if (typeof window === 'undefined') return;
        document.cookie = `${key}=${value}; path=/; domain=.familybank.chat; max-age=31536000; SameSite=Lax; Secure`;
      },
      removeItem: (key: string) => {
        if (typeof window === 'undefined') return;
        document.cookie = `${key}=; path=/; domain=.familybank.chat; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      },
    },
  },
});

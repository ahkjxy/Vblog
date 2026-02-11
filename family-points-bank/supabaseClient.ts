import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mfgfbwhznqpdjumtsrus.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2pDY4atjEw5MVSWeakl4HA_exf_osvS';

// 检测是否在生产环境
const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('familybank.chat');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'sb-mfgfbwhznqpdjumtsrus-auth-token',
    storage: isProduction ? {
      getItem: (key: string) => {
        if (typeof window === 'undefined') return null;
        const name = `${key}=`;
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) === ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) === 0) {
            let value = c.substring(name.length, c.length);
            try {
              value = decodeURIComponent(value);
            } catch (e) {
              // inconsistent encoding, use raw
            }
            
            // Handle Supabase SSR's base64 prefix
            if (value.startsWith('base64-')) {
              try {
                const base64 = value.substring(7);
                return atob(base64);
              } catch (e) {
                console.error('Failed to decode base64 cookie', e);
                return null;
              }
            }
            
            return value;
          }
        }
        return null;
      },
      setItem: (key: string, value: string) => {
        if (typeof window === 'undefined') return;
        // Cookie access is tricky with subdomains. We use the same domain for both apps.
        const domain = '.familybank.chat';
        document.cookie = `${key}=${value}; path=/; domain=${domain}; max-age=31536000; SameSite=Lax; Secure`;
      },
      removeItem: (key: string) => {
        if (typeof window === 'undefined') return;
        const domain = '.familybank.chat';
        document.cookie = `${key}=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`;
      },
    } : undefined, // 本地开发使用默认 localStorage
  },
});

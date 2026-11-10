'use strict';

(() => {
  const getConfiguration = () => {
    const config = window.RX_SUPABASE_CONFIG || {};
    return {
      url: typeof config.url === 'string' && config.url.trim()
        ? config.url.trim()
        : typeof window.RXCLOTHS_SUPABASE_URL === 'string'
          ? window.RXCLOTHS_SUPABASE_URL.trim()
          : '',
      publicKey: typeof config.publishableKey === 'string' && config.publishableKey.trim()
        ? config.publishableKey.trim()
        : typeof config.anonKey === 'string' && config.anonKey.trim()
          ? config.anonKey.trim()
          : typeof window.RXCLOTHS_SUPABASE_ANON_KEY === 'string'
            ? window.RXCLOTHS_SUPABASE_ANON_KEY.trim()
            : ''
    };
  };

  const isServiceRoleKey = (key) => {
    if (key.startsWith('sb_secret_')) return true;
    const payload = key.split('.')[1];
    if (!payload) return false;
    try {
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const claims = JSON.parse(window.atob(normalized));
      return claims.role === 'service_role';
    } catch {
      return false;
    }
  };

  const getClient = () => {
    if (window.__rxSupabaseClient) return window.__rxSupabaseClient;

    const { url, publicKey } = getConfiguration();
    if (!url) {
      throw new Error('Supabase project URL is missing. Copy the Project URL from Supabase Dashboard → Project Settings → API, then set window.RXCLOTHS_SUPABASE_URL or RX_SUPABASE_CONFIG.url in js/supabase-config.js.');
    }
    if (!publicKey) {
      throw new Error('Supabase public API key is missing. Copy the publishable key (or legacy anon key) from Supabase Dashboard → Project Settings → API, then set window.RXCLOTHS_SUPABASE_ANON_KEY or RX_SUPABASE_CONFIG.publishableKey in js/supabase-config.js. Never use a secret or service_role key in browser code.');
    }
    if (isServiceRoleKey(publicKey)) {
      throw new Error('A service-role/secret key was supplied to the browser configuration. Remove it and use only the publishable key or legacy anon key from Supabase Dashboard → Project Settings → API.');
    }

    let projectUrl;
    try {
      projectUrl = new URL(url);
    } catch {
      throw new Error('The Supabase project URL is invalid. Copy the Project URL from Supabase Dashboard → Project Settings → API.');
    }
    if (projectUrl.username || projectUrl.password || projectUrl.pathname !== '/' ||
        projectUrl.search || projectUrl.hash) {
      throw new Error('The Supabase project URL must be the project origin only, without a path, query, or fragment.');
    }
    if (projectUrl.protocol !== 'https:' &&
        !(projectUrl.protocol === 'http:' && projectUrl.hostname === 'localhost')) {
      throw new Error('The Supabase project URL must use HTTPS (HTTP is allowed only for localhost development).');
    }

    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      throw new Error('The Supabase client library could not be loaded. Check the network connection to cdn.jsdelivr.net and reload the page.');
    }

    window.__rxSupabaseClient = window.supabase.createClient(projectUrl.origin, publicKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    return window.__rxSupabaseClient;
  };

  window.RXSupabaseClient = { getClient, getConfiguration };
})();

'use strict';

(() => {
  const api = {
    client() {
      return window.RXSupabaseClient.getClient();
    },
    async currentUser() {
      const { data, error } = await api.client().auth.getSession();
      if (error) throw error;
      return data.session?.user || null;
    }
  };

  window.RXStore = api;
})();

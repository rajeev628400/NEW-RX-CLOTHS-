'use strict';

(() => {
  const client = () => window.RXStore.client();
  const statusMessage = (root, message, isError = false) => {
    const status = root.querySelector('[data-address-status]');
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('auth-status-error', isError);
  };
  const setBusy = (form, busy) => {
    const button = form.querySelector('button[type="submit"]');
    if (button) button.disabled = busy;
  };
  const escapeMessage = (error, fallback) =>
    error && typeof error.message === 'string' ? error.message : fallback;

  const initializeAddresses = () => {
    const form = document.querySelector('[data-address-form]');
    const list = document.querySelector('[data-address-list]');
    if (!form || !list) return;

    const load = async () => {
      const user = await window.RXStore.currentUser();
      if (!user) {
        list.replaceChildren();
        statusMessage(form.closest('.account-addresses'), 'Sign in to manage your shipping addresses.', true);
        return [];
      }
      const { data, error } = await client()
        .from('customer_addresses')
        .select('id, recipient_name, phone, address_line_1, address_line_2, city, region, postal_code, country_code, is_default')
        .eq('user_id', user.id)
        .eq('address_type', 'shipping')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      list.replaceChildren();
      (data || []).forEach((address) => {
        const article = document.createElement('article');
        article.className = 'story-panel';
        const heading = document.createElement('h3');
        heading.textContent = `${address.recipient_name}${address.is_default ? ' · Default' : ''}`;
        const lines = document.createElement('p');
        lines.textContent = [
          address.address_line_1,
          address.address_line_2,
          address.city,
          address.region,
          address.postal_code,
          address.country_code,
          address.phone
        ].filter(Boolean).join(', ');
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.className = 'button button-outline';
        edit.textContent = 'Edit address';
        edit.addEventListener('click', () => {
          form.elements.id.value = address.id;
          form.elements.recipient_name.value = address.recipient_name;
          form.elements.phone.value = address.phone || '';
          form.elements.address_line_1.value = address.address_line_1;
          form.elements.address_line_2.value = address.address_line_2 || '';
          form.elements.city.value = address.city;
          form.elements.region.value = address.region || '';
          form.elements.postal_code.value = address.postal_code;
          form.elements.country_code.value = address.country_code.trim();
          form.elements.is_default.checked = address.is_default;
          form.querySelector('button[type="submit"]').textContent = 'Save address';
          form.elements.recipient_name.focus();
        });
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'button button-outline';
        remove.textContent = 'Remove address';
        remove.addEventListener('click', async () => {
          remove.disabled = true;
          try {
            const { error: deleteError } = await client()
              .from('customer_addresses')
              .delete()
              .eq('id', address.id)
              .eq('user_id', user.id);
            if (deleteError) throw deleteError;
            statusMessage(form.closest('.account-addresses'), 'Address removed.');
            await load();
          } catch (error) {
            statusMessage(form.closest('.account-addresses'), escapeMessage(error, 'Address could not be removed.'), true);
            remove.disabled = false;
          }
        });
        article.append(heading, lines, edit, remove);
        list.append(article);
      });
      if (!data?.length) statusMessage(form.closest('.account-addresses'), 'No shipping addresses saved yet.');
      else statusMessage(form.closest('.account-addresses'), `${data.length} shipping ${data.length === 1 ? 'address' : 'addresses'} saved.`);
      return data || [];
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      setBusy(form, true);
      statusMessage(form.closest('.account-addresses'), 'Saving your shipping address…');
      try {
        const user = await window.RXStore.currentUser();
        if (!user) throw new Error('Sign in before saving a shipping address.');
        const values = new FormData(form);
        const isDefault = values.get('is_default') === 'on';
        const addressId = String(values.get('id') || '').trim();
        const address = {
          recipient_name: String(values.get('recipient_name')).trim(),
          phone: String(values.get('phone')).trim() || null,
          address_line_1: String(values.get('address_line_1')).trim(),
          address_line_2: String(values.get('address_line_2')).trim() || null,
          city: String(values.get('city')).trim(),
          region: String(values.get('region')).trim() || null,
          postal_code: String(values.get('postal_code')).trim(),
          country_code: String(values.get('country_code')).trim().toUpperCase(),
          is_default: isDefault
        };
        if (isDefault) {
          const { error: defaultError } = await client()
            .from('customer_addresses')
            .update({ is_default: false })
            .eq('user_id', user.id)
            .eq('address_type', 'shipping')
            .eq('is_default', true);
          if (defaultError) throw defaultError;
        }
        const result = addressId
          ? await client().from('customer_addresses').update(address).eq('id', addressId).eq('user_id', user.id)
          : await client().from('customer_addresses').insert({
            ...address,
            user_id: user.id,
            address_type: 'shipping'
          });
        if (result.error) throw result.error;
        form.reset();
        form.elements.country_code.value = 'IN';
        form.querySelector('button[type="submit"]').textContent = 'Add address';
        statusMessage(form.closest('.account-addresses'), addressId ? 'Address updated.' : 'Address saved.');
        await load();
      } catch (error) {
        statusMessage(form.closest('.account-addresses'), escapeMessage(error, 'Address could not be saved.'), true);
      } finally {
        setBusy(form, false);
      }
    });
    form.addEventListener('reset', () => {
      window.setTimeout(() => {
        form.querySelector('button[type="submit"]').textContent = 'Add address';
      }, 0);
    });

    load().catch((error) => {
      statusMessage(form.closest('.account-addresses'), escapeMessage(error, 'Addresses could not be loaded.'), true);
    });
  };

  initializeAddresses();
})();

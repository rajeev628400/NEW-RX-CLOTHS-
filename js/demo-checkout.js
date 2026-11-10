'use strict';

(() => {
  const CART_KEY = 'rx-cloths-demo-cart';
  const ORDER_KEY = 'rx-cloths-demo-orders';
  const currency = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });
  const products = window.RXProductData?.products || [];
  const productById = (id) => products.find((product) => product.id === id);

  const readList = (key) => {
    const saved = localStorage.getItem(key);
    if (saved === null) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new TypeError(`Stored value for ${key} must be a list.`);
    return parsed;
  };

  const setStatus = (element, message, isError = false) => {
    element.textContent = message;
    element.classList.toggle('auth-status-error', isError);
  };

  const checkout = document.querySelector('[data-checkout-page]');
  if (checkout) {
    const form = checkout.querySelector('[data-checkout-form]');
    const status = checkout.querySelector('[data-store-status]');
    const itemsContainer = checkout.querySelector('[data-checkout-items]');
    const totalElement = checkout.querySelector('[data-checkout-total]');
    const submitButton = checkout.querySelector('[data-checkout-submit]');
    const confirmation = checkout.querySelector('[data-order-confirmation]');
    const confirmationMessage = checkout.querySelector('[data-confirmation-message]');

    const readCheckoutLines = () => readList(CART_KEY).map((line) => {
      const product = productById(line?.productId);
      const quantity = Number(line?.quantity);
      const variant = product?.variants.find((item) => item.color === line?.color && item.size === line?.size);
      const isValid = Boolean(product && variant && Number.isInteger(quantity) &&
        quantity > 0 && quantity <= variant.stock);
      return { line, product, quantity, variant, isValid };
    });

    const renderCheckout = () => {
      const lines = readCheckoutLines();
      itemsContainer.replaceChildren();
      let total = 0;

      lines.forEach(({ line, product, quantity, isValid }) => {
        const row = document.createElement('div');
        row.className = 'checkout-item';
        const details = document.createElement('p');
        details.textContent = product
          ? `${product.name} · ${line.color || 'As shown'} · Size ${line.size || '—'} · Qty ${quantity}`
          : 'Unavailable product in your bag';
        const price = document.createElement('strong');
        if (isValid) {
          const lineTotal = product.price * quantity;
          total += lineTotal;
          price.textContent = currency.format(lineTotal);
        } else {
          row.classList.add('checkout-item-error');
          price.textContent = 'Not available';
        }
        row.append(details, price);
        itemsContainer.append(row);
      });

      totalElement.textContent = currency.format(total);
      submitButton.disabled = lines.length === 0 || lines.some((line) => !line.isValid);
      if (lines.length === 0) {
        setStatus(status, 'Your bag is empty. Add a style before trying the demo checkout.');
      } else if (lines.some((line) => !line.isValid)) {
        setStatus(status, 'One or more bag items are unavailable or exceed the demo stock. Update your bag before continuing.', true);
      } else {
        setStatus(status, 'Cash on Delivery is simulated in this browser. Your delivery details are used only to demonstrate the form.');
      }
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      try {
        const lines = readCheckoutLines();
        if (lines.length === 0 || lines.some((line) => !line.isValid)) {
          renderCheckout();
          setStatus(status, 'Your bag changed or contains unavailable items. Review it before continuing.', true);
          return;
        }

        const order = {
          id: `RX-DEMO-${Date.now().toString(36).toUpperCase()}`,
          createdAt: new Date().toISOString(),
          paymentMethod: 'Cash on Delivery',
          status: 'Demo only — not submitted',
          total: lines.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0),
          items: lines.map(({ line, product, quantity }) => ({
            productName: product.name,
            color: line.color || 'As shown',
            size: line.size || '',
            quantity,
            unitPrice: product.price
          }))
        };
        const orders = readList(ORDER_KEY);
        localStorage.setItem(ORDER_KEY, JSON.stringify([...orders, order]));
        localStorage.setItem(CART_KEY, '[]');
        window.dispatchEvent(new Event('rx:store-updated'));

        form.hidden = true;
        confirmation.hidden = false;
        confirmationMessage.textContent =
          `Demo reference ${order.id}. This practice order is saved only in this browser; no details were sent and nothing will be delivered.`;
        setStatus(status, 'Demo complete. No payment was collected and no real order was placed.');
      } catch (error) {
        console.error('RX CLOTHS demo checkout failed:', error);
        setStatus(status, error instanceof Error ? error.message : 'Demo checkout could not be completed. Please try again.', true);
      }
    });

    try {
      if (!window.RXProductData || !Array.isArray(products)) {
        throw new Error('The product catalogue could not be loaded. Reload this page and try again.');
      }
      renderCheckout();
    } catch (error) {
      console.error('RX CLOTHS demo checkout could not load the bag:', error);
      submitButton.disabled = true;
      setStatus(status, error instanceof Error ? error.message : 'The bag could not be loaded.', true);
    }
  }

  const ordersPage = document.querySelector('[data-orders-page]');
  if (ordersPage) {
    const list = ordersPage.querySelector('[data-order-list]');
    const status = ordersPage.querySelector('[data-store-status]');
    const renderOrders = () => {
      const orders = readList(ORDER_KEY);
      list.replaceChildren();
      if (orders.length === 0) {
        setStatus(status, 'No demo orders saved in this browser yet.');
        return;
      }

      orders.slice().reverse().forEach((order) => {
        if (!order || typeof order.id !== 'string' || !Array.isArray(order.items)) {
          throw new TypeError('A saved demo order is invalid. Clear this browser’s demo order storage and try again.');
        }
        const article = document.createElement('article');
        article.className = 'demo-order';
        const heading = document.createElement('h2');
        heading.textContent = order.id;
        const date = document.createElement('p');
        const createdAt = new Date(order.createdAt);
        date.textContent = `Placed ${Number.isNaN(createdAt.getTime()) ? 'date unavailable' : createdAt.toLocaleString()}`;
        const payment = document.createElement('p');
        payment.textContent = `${order.paymentMethod || 'Cash on Delivery'} · ${order.status || 'Demo only'}`;
        const lines = document.createElement('ul');
        order.items.forEach((item) => {
          const row = document.createElement('li');
          row.textContent = `${item.productName} · ${item.color} · ${item.size ? `Size ${item.size} · ` : ''}Qty ${item.quantity} · ${currency.format(item.unitPrice * item.quantity)}`;
          lines.append(row);
        });
        const total = document.createElement('strong');
        total.textContent = `Demo total: ${currency.format(Number(order.total) || 0)}`;
        article.append(heading, date, payment, lines, total);
        list.append(article);
      });
      setStatus(status, `${orders.length} demo ${orders.length === 1 ? 'order' : 'orders'} saved on this device. These are not real orders.`);
    };

    try {
      renderOrders();
    } catch (error) {
      console.error('RX CLOTHS demo orders could not be loaded:', error);
      setStatus(status, error instanceof Error ? error.message : 'Demo order history could not be loaded.', true);
    }
  }
})();

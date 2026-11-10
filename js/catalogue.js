'use strict';

(() => {
  const data = window.RXProductData;
  const CART_KEY = 'rx-cloths-demo-cart';
  const WISHLIST_KEY = 'rx-cloths-demo-wishlist';
  const currency = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  const text = (tag, className, value) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined) element.textContent = value;
    return element;
  };
  const animate = (element, className) => {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
    element.addEventListener('animationend', () => element.classList.remove(className), { once: true });
  };

  const showStorageError = (error) => {
    console.error('RX CLOTHS demo storage error:', error);
    document.querySelectorAll('[data-storage-message]').forEach((message) => {
      message.hidden = false;
      message.textContent = 'This browser could not save your bag or wishlist. Check browser storage settings and try again.';
    });
    document.querySelectorAll('[data-product-message]').forEach((message) => {
      message.textContent = 'This browser could not save your bag or wishlist. Check browser storage settings and try again.';
    });
  };

  const readList = (key) => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === null) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) throw new TypeError(`Stored value for ${key} must be a list.`);
      return parsed;
    } catch (error) {
      showStorageError(error);
      return [];
    }
  };

  const writeList = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new Event('rx:store-updated'));
      return true;
    } catch (error) {
      showStorageError(error);
      return false;
    }
  };

  const productById = (id) => data.products.find((product) => product.id === id);
  const isCataloguedProduct = (product) =>
    data.categories[product.audience]?.includes(product.category) ||
    data.menuGroups[product.audience]?.some((group) => group.items.includes(product.category));
  const cataloguedProducts = () => data.products.filter(isCataloguedProduct);
  const availability = (product) => product.variants.some((variant) => variant.stock > 0);
  const productLink = (product) => `product.html?id=${encodeURIComponent(product.id)}`;
  const colorNames = (products) => [...new Set(products.flatMap((product) => product.colors))].sort((a, b) => a.localeCompare(b));
  const sizeNames = (products) => [...new Set(products.flatMap((product) => product.sizes))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const appendSelectOptions = (select, options) => {
    options.forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.append(option);
    });
  };

  const productImageFallback = 'assets/images/product-placeholder.svg';
  const setProductImage = (image, productImage, fallbackAlt = 'Product image unavailable') => {
    image.dataset.usingFallback = 'false';
    image.src = productImage?.src || productImageFallback;
    image.alt = productImage?.alt || fallbackAlt;
    if (image.dataset.fallbackListener === 'true') return;
    image.dataset.fallbackListener = 'true';
    image.addEventListener('error', () => {
      if (image.dataset.usingFallback === 'true') return;
      image.dataset.usingFallback = 'true';
      image.src = productImageFallback;
      image.alt = fallbackAlt;
    });
  };

  const makeProductCard = (product, options = {}) => {
    const card = text('article', 'product-card');
    card.addEventListener('click', (event) => {
      if (event.target instanceof Element && event.target.closest('a, button')) return;
      window.location.href = productLink(product);
    });
    const imageLink = document.createElement('a');
    imageLink.className = 'product-card-image';
    imageLink.href = productLink(product);
    imageLink.setAttribute('aria-label', `View ${product.name}`);

    const image = document.createElement('img');
    setProductImage(image, product.images?.[0]);
    image.loading = 'lazy';
    imageLink.append(image);

    if (!availability(product)) imageLink.append(text('span', 'sold-out-badge', 'Out of stock'));
    card.append(imageLink);

    const details = text('div', 'product-card-details');
    const meta = text('p', 'product-card-meta', `${product.audience} / ${product.category}`);
    const title = document.createElement('a');
    title.className = 'product-card-name';
    title.href = productLink(product);
    title.textContent = product.name;
    const price = text('p', 'product-card-price', Number.isFinite(product.price) ? currency.format(product.price) : '');
    const footer = text('div', 'product-card-footer');
    footer.append(price);

    if (options.removeWishlist) {
      const remove = text('button', 'wishlist-remove', 'Remove from wishlist');
      remove.type = 'button';
      remove.addEventListener('click', () => {
        const updated = readList(WISHLIST_KEY).filter((id) => id !== product.id);
        writeList(WISHLIST_KEY, updated);
      });
      footer.append(remove);
    } else if (options.showWishlist !== false) {
      const saved = readList(WISHLIST_KEY).includes(product.id);
      const heart = text('button', `product-heart${saved ? ' is-saved' : ''}`, saved ? '♥' : '♡');
      const feedback = text('span', 'wishlist-feedback');
      feedback.setAttribute('role', 'status');
      feedback.setAttribute('aria-live', 'polite');
      heart.type = 'button';
      heart.setAttribute('aria-label', saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`);
      heart.setAttribute('aria-pressed', String(saved));
      heart.addEventListener('click', () => {
        const wishlist = readList(WISHLIST_KEY);
        const updated = wishlist.includes(product.id)
          ? wishlist.filter((id) => id !== product.id)
          : [...wishlist, product.id];
        if (writeList(WISHLIST_KEY, updated)) {
          const isSaved = updated.includes(product.id);
          heart.classList.toggle('is-saved', isSaved);
          heart.textContent = isSaved ? '♥' : '♡';
          heart.setAttribute('aria-label', isSaved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`);
          heart.setAttribute('aria-pressed', String(isSaved));
          feedback.textContent = isSaved ? 'Saved to wishlist.' : 'Removed from wishlist.';
          animate(heart, 'is-animating');
        }
      });
      footer.append(heart);
      footer.append(feedback);
    }

    details.append(meta, title, footer);
    card.append(details);
    return card;
  };

  const initListing = (root) => {
    const audienceOnPage = root.dataset.audience;
    const grid = root.querySelector('[data-product-grid]');
    const message = root.querySelector('[data-listing-message]');
    const count = root.querySelector('[data-results-count]');
    const loadMore = root.querySelector('[data-load-more]');
    const params = new URLSearchParams(window.location.search);
    let visibleLimit = 8;

    if (!data || !Array.isArray(data.products) || !data.categories) {
      console.error('RX CLOTHS product catalogue data is missing or invalid.');
      message.hidden = false;
      message.textContent = 'Product listings could not be loaded. Please reload this page.';
      count.textContent = 'Catalogue unavailable';
      return;
    }
    const allowedProducts = () => audienceOnPage === 'all'
      ? cataloguedProducts()
      : cataloguedProducts().filter((product) => product.audience === audienceOnPage);

    const categories = audienceOnPage === 'all'
      ? [...new Set(Object.values(data.categories).flat())].sort((a, b) => a.localeCompare(b))
      : data.categories[audienceOnPage];
    const requestedCategory = params.get('category');
    const requestedSubcategory = params.get('subcategory');
    const requestedGroup = data.menuGroups[audienceOnPage]?.find((group) =>
      group.title === requestedCategory && group.items.includes(requestedSubcategory));
    const selectedCategory = categories.includes(requestedCategory) || requestedGroup ? requestedCategory : '';
    const selectedAudience = ['men', 'women', 'kids'].includes(params.get('audience'))
      ? params.get('audience')
      : audienceOnPage;
    const subcategory = params.get('subcategory');
    const title = root.querySelector('[data-category-title]');
    const isValidSubcategory = (category) => data.menuGroups[audienceOnPage]?.some((group) =>
      group.title === category && group.items.includes(subcategory));

    const filteredProducts = () => {
      const query = (params.get('q') || '').trim().toLocaleLowerCase();
      const category = selectedCategory;
      const validSubcategory = isValidSubcategory(category);
      const categoryAliases = validSubcategory
        ? [category, subcategory]
        : category === 'Trousers & Pants'
        ? ['Trousers', 'Trousers & Pants']
        : category === 'Winter Wear'
          ? ['Hoodies', 'Sweatshirts', 'Sweaters', 'Knitwear', 'Cardigans']
          : [category];

      const products = data.products.filter((product) => {
        if (!isCataloguedProduct(product)) return false;
        if (selectedAudience !== 'all' && product.audience !== selectedAudience) return false;
        if (category && !categoryAliases.includes(product.category)) return false;
        if (query && !`${product.name} ${product.description} ${product.category} ${product.audience} ${product.colors.join(' ')}`.toLocaleLowerCase().includes(query)) return false;
      if (validSubcategory && product.subcategory !== subcategory && !`${product.name} ${product.description} ${product.category}`.toLocaleLowerCase().includes(subcategory.toLocaleLowerCase())) return false;
        return true;
      });

      products.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return products;
    };

    const render = () => {
      const category = selectedCategory;
      const validSubcategory = isValidSubcategory(category);
      if (title) {
        title.textContent = validSubcategory
          ? subcategory
          : categories.includes(category)
            ? category
            : audienceOnPage.charAt(0).toUpperCase() + audienceOnPage.slice(1);
      }
      const products = filteredProducts();
      const visibleProducts = products.slice(0, visibleLimit);
      grid.replaceChildren(...visibleProducts.map((product) => makeProductCard(product)));
      count.textContent = `${products.length} ${products.length === 1 ? 'style' : 'styles'}`;
      message.hidden = products.length > 0;
      if (products.length === 0) message.textContent = 'No styles match these selections. Try a different category or search.';
      loadMore.hidden = visibleLimit >= products.length;

      const nextParams = new URLSearchParams();
      const query = (params.get('q') || '').trim();
      if (query) nextParams.set('q', query);
      if (category) nextParams.set('category', category);
      if (selectedAudience !== audienceOnPage) nextParams.set('audience', selectedAudience);
      if (validSubcategory) nextParams.set('subcategory', subcategory);
      const queryString = nextParams.toString();
      window.history.replaceState(null, '', `${window.location.pathname}${queryString ? `?${queryString}` : ''}`);
    };

    loadMore.addEventListener('click', () => {
      visibleLimit += 8;
      render();
    });
    render();
  };

  const initSearch = (root) => {
    const form = root.querySelector('[data-search-form]');
    const input = root.querySelector('[data-search-input]');
    const grid = root.querySelector('[data-product-grid]');
    const count = root.querySelector('[data-results-count]');
    const message = root.querySelector('[data-listing-message]');
    const categoryResults = root.querySelector('[data-category-results]');
    const params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';
    const render = () => {
      const query = input.value.trim().toLocaleLowerCase();
      const products = query
        ? cataloguedProducts().filter((product) =>
          `${product.name} ${product.description} ${product.category} ${product.audience} ${product.colors.join(' ')}`
            .toLocaleLowerCase().includes(query))
        : [];
      const categories = query
        ? Object.entries(data.menuGroups).flatMap(([audience, groups]) => groups.flatMap((group) =>
            [...(data.categories[audience].includes(group.title) ? [group.title] : []), ...group.items]
              .filter((item) => item.toLocaleLowerCase().includes(query))
              .map((item) => ({
                audience,
                item,
                category: data.categories[audience].includes(item) ? item : group.title
              }))))
        : [];
      const uniqueCategories = [...new Map(categories.map((item) => [`${item.audience}:${item.item}`, item])).values()];

      grid.replaceChildren(...products.map((product) => makeProductCard(product)));
      categoryResults.replaceChildren();
      uniqueCategories.forEach(({ audience, item, category }) => {
        const link = document.createElement('a');
        const url = new URLSearchParams({ category });
        if (item !== category) url.set('subcategory', item);
        link.href = `${audience}.html?${url.toString()}`;
        link.textContent = `${item} · ${audience.charAt(0).toUpperCase() + audience.slice(1)}`;
        categoryResults.append(link);
      });
      categoryResults.hidden = uniqueCategories.length === 0;
      count.textContent = query
        ? `${products.length} ${products.length === 1 ? 'style' : 'styles'} found`
        : 'Search products and categories';
      message.hidden = products.length > 0 || uniqueCategories.length > 0;
      message.textContent = query
        ? 'No matches found. Try another product or clothing category.'
        : 'Enter a product name or category to begin.';
      const nextParams = new URLSearchParams();
      if (query) nextParams.set('q', input.value.trim());
      const queryString = nextParams.toString();
      window.history.replaceState(null, '', `${window.location.pathname}${queryString ? `?${queryString}` : ''}`);
    };

    form.addEventListener('input', render);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      render();
    });
    render();
  };

  const initProduct = (root) => {
    const product = productById(new URLSearchParams(window.location.search).get('id'));
    const content = root.querySelector('[data-product-content]');
    const notFound = root.querySelector('[data-product-not-found]');
    const related = root.querySelector('[data-related-products]');

    if (!product) {
      notFound.hidden = false;
      return;
    }

    content.hidden = false;
    root.querySelector('[data-product-category]').textContent =
      [product.audience, product.category, product.subcategory].filter(Boolean).join(' / ');
    root.querySelector('[data-product-name]').textContent = product.name;
    root.querySelector('[data-product-price]').textContent = Number.isFinite(product.price) ? currency.format(product.price) : '';
    root.querySelector('[data-add-to-cart]').textContent = 'Add to bag';
    root.querySelector('[data-product-description]').textContent = product.description;
    root.querySelector('[data-product-breadcrumb]').textContent = product.name;
    root.querySelector('[data-care-copy]').textContent = 'Care details have not been confirmed.';
    const categoryLink = root.querySelector('[data-product-category-link]');
    const categoryParams = new URLSearchParams({ category: product.category });
    if (product.subcategory) categoryParams.set('subcategory', product.subcategory);
    categoryLink.href = `${product.audience}.html?${categoryParams.toString()}`;
    categoryLink.textContent = product.category;
    document.title = `${product.name} | RX CLOTHS`;

    const mainImage = root.querySelector('[data-main-image]');
    const thumbnails = root.querySelector('[data-product-thumbnails]');
    const colorSelect = root.querySelector('[data-variant-color]');
    const sizeGroup = root.querySelector('[data-variant-sizes]');
    const stockMessage = root.querySelector('[data-product-stock]');
    const quantityInput = root.querySelector('[data-quantity]');
    const addButton = root.querySelector('[data-add-to-cart]');
    const actionMessage = root.querySelector('[data-product-message]');
    const colors = product.colors;
    let selectedSize = '';

    (product.images || []).forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `product-thumbnail${index === 0 ? ' is-active' : ''}`;
      button.setAttribute('aria-label', `Show image ${index + 1}: ${item.alt}`);
      button.setAttribute('aria-pressed', String(index === 0));
      const image = document.createElement('img');
      setProductImage(image, item, '');
      image.loading = 'lazy';
      button.append(image);
      button.addEventListener('click', () => {
        setProductImage(mainImage, item);
        animate(mainImage, 'is-animating');
        thumbnails.querySelectorAll('.product-thumbnail').forEach((thumbnail) => {
          const active = thumbnail === button;
          thumbnail.classList.toggle('is-active', active);
          thumbnail.setAttribute('aria-pressed', String(active));
        });
      });
      thumbnails.append(button);
    });
    setProductImage(mainImage, product.images?.[0]);

    const colorField = colorSelect.closest('label');
    colorField.hidden = colors.length === 0;
    colorSelect.required = false;
    if (colors.length > 1) {
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Choose a colour';
      placeholder.disabled = true;
      placeholder.selected = true;
      colorSelect.append(placeholder);
    }
    appendSelectOptions(colorSelect, colors);
    if (colors.length === 1) colorSelect.value = colors[0];

    const isAvailable = (variant) => variant.stock > 0;
    const hasAvailableVariant = product.variants.some(isAvailable);
    let remainingQuantity = 0;
    colorSelect.querySelectorAll('option').forEach((option) => {
      if (option.value) {
        option.disabled = !product.variants.some((variant) =>
          variant.color === option.value && isAvailable(variant));
      }
    });
    const selectedVariant = () => product.variants.find((variant) => variant.color === colorSelect.value && variant.size === selectedSize);
    const updateVariant = (preferredSize = selectedSize) => {
      const color = colorSelect.value;
      const availableSizes = product.sizes.filter((size) => product.variants.some((variant) =>
        variant.color === color && variant.size === size && isAvailable(variant)));
      sizeGroup.replaceChildren();
      product.sizes.forEach((size) => {
        const variant = product.variants.find((item) => item.color === color && item.size === size);
        const button = text('button', `size-option${size === preferredSize ? ' is-selected' : ''}`, size);
        button.type = 'button';
        button.disabled = !color || !variant || !isAvailable(variant);
        button.setAttribute('aria-pressed', String(size === preferredSize && !button.disabled));
        button.addEventListener('click', () => {
          selectedSize = size;
          updateVariant(size);
        });
        sizeGroup.append(button);
      });
      selectedSize = availableSizes.includes(preferredSize) ? preferredSize : '';
      sizeGroup.querySelectorAll('.size-option').forEach((button) => {
        const active = button.textContent === selectedSize;
        button.classList.toggle('is-selected', active);
        button.setAttribute('aria-pressed', String(active));
      });

      const variant = selectedVariant();
      if (variant) root.querySelector('[data-product-price]').textContent =
        currency.format(product.price);
      const cartLine = readList(CART_KEY)
        .find((line) => line.productId === product.id && line.color === color && line.size === selectedSize);
      const remaining = !variant || !isAvailable(variant)
        ? 0
        : Math.max(0, variant.stock - (cartLine
          ? Number.isInteger(cartLine.quantity) && cartLine.quantity > 0
            ? cartLine.quantity
            : variant.stock
          : 0));
      remainingQuantity = remaining;
      quantityInput.value = '1';
      quantityInput.max = String(Math.max(1, Math.min(99, remaining)));
      stockMessage.textContent = remaining < 1
        ? color && selectedSize ? 'Out of stock' : colors.length > 1 && !color ? 'Choose a colour to see available sizes.' : 'Choose an available size.'
        : selectedSize
          ? 'Available'
          : 'Choose a size.';
      stockMessage.classList.toggle('is-unavailable', remaining === 0);
      addButton.disabled = !hasAvailableVariant || Boolean(selectedSize && remaining === 0);
    };

    colorSelect.addEventListener('change', () => updateVariant(''));
    updateVariant('');

    root.querySelector('[data-quantity-down]').addEventListener('click', () => {
      quantityInput.value = String(Math.max(1, Number(quantityInput.value) - 1));
    });
    root.querySelector('[data-quantity-up]').addEventListener('click', () => {
      quantityInput.value = String(Math.min(Number(quantityInput.max), Number(quantityInput.value) + 1));
    });
    quantityInput.addEventListener('change', () => {
      const quantity = Number(quantityInput.value);
      quantityInput.value = String(Number.isFinite(quantity) ? Math.max(1, Math.min(Number(quantityInput.max), Math.floor(quantity))) : 1);
    });

    root.querySelector('[data-product-options]').addEventListener('submit', (event) => {
      event.preventDefault();
      const variant = selectedVariant();
      const quantity = Number(quantityInput.value);
      const inStock = variant && variant.stock > 0;
      if (!inStock || quantity < 1 || quantity > Number(quantityInput.max) || quantity > remainingQuantity) {
        actionMessage.textContent = colors.length > 1 && !colorSelect.value
          ? 'Choose a colour and size before adding this item.'
          : 'Choose an available size and quantity first.';
        animate(actionMessage, 'is-animating');
        return;
      }
      const cart = readList(CART_KEY);
      const line = cart.find((item) => item.productId === product.id && item.color === colorSelect.value && item.size === selectedSize);
      const updated = line
        ? cart.map((item) => item === line ? { ...item, unitPrice: product.price, quantity: item.quantity + quantity } : item)
        : [...cart, { productId: product.id, color: colorSelect.value, size: selectedSize, quantity, unitPrice: product.price }];
      if (writeList(CART_KEY, updated)) {
        actionMessage.textContent = 'Added to your bag.';
        animate(actionMessage, 'is-animating');
        animate(addButton, 'is-animating');
        updateVariant();
      }
    });

    const wishlistButton = root.querySelector('[data-add-to-wishlist]');
    const isInWishlist = () => readList(WISHLIST_KEY).includes(product.id);
    wishlistButton.textContent = isInWishlist() ? 'Remove from wishlist' : 'Add to wishlist';
    wishlistButton.addEventListener('click', (event) => {
      const button = event.currentTarget;
      const wishlist = readList(WISHLIST_KEY);
      const exists = wishlist.includes(product.id);
      const updated = exists ? wishlist.filter((id) => id !== product.id) : [...wishlist, product.id];
      if (writeList(WISHLIST_KEY, updated)) {
        button.textContent = exists ? 'Add to wishlist' : 'Remove from wishlist';
        actionMessage.textContent = exists ? 'Removed from your wishlist.' : 'Saved to your wishlist.';
        animate(actionMessage, 'is-animating');
        animate(button, 'is-animating');
      }
    });

    const guide = root.querySelector('[data-size-guide]');
    root.querySelector('[data-open-size-guide]').addEventListener('click', () => guide.showModal());
    root.querySelector('[data-close-size-guide]').addEventListener('click', () => guide.close());
    guide.addEventListener('click', (event) => {
      if (event.target === guide) guide.close();
    });

    const relatedProducts = cataloguedProducts()
      .filter((item) => item.audience === product.audience && item.id !== product.id)
      .slice(0, 3);
    root.querySelector('[data-related-link]').href = `${product.audience}.html`;
    root.querySelector('[data-related-grid]').replaceChildren(...relatedProducts.map((item) => makeProductCard(item)));
    related.hidden = relatedProducts.length === 0;
  };

  const initWishlist = (root) => {
    const grid = root.querySelector('[data-wishlist-grid]');
    const empty = root.querySelector('[data-wishlist-empty]');
    const state = root.querySelector('[data-wishlist-state]');
    const render = () => {
      const ids = readList(WISHLIST_KEY);
      const products = ids.map(productById).filter(Boolean);
      grid.replaceChildren(...products.map((product) => makeProductCard(product, { removeWishlist: true })));
      empty.hidden = products.length > 0;
      grid.hidden = products.length === 0;
      state.textContent = `${products.length} saved ${products.length === 1 ? 'style' : 'styles'}`;
    };
    window.addEventListener('rx:store-updated', render);
    render();
  };

  const initCart = (root) => {
    const itemsContainer = root.querySelector('[data-cart-items]');
    const empty = root.querySelector('[data-cart-empty]');
    const summary = root.querySelector('[data-cart-summary]');
    const count = root.querySelector('[data-cart-state]');
    const total = root.querySelector('[data-cart-total]');
    const render = () => {
      const cart = readList(CART_KEY);
      const validLines = cart.filter((line) => line.isUnavailable || productById(line.productId));
      const unitCount = validLines.reduce((sum, line) => sum + Number(line.quantity || 0), 0);
      const amount = validLines.reduce((sum, line) =>
        sum + (line.isUnavailable ? 0 : Number(line.unitPrice ?? productById(line.productId).price)) * Number(line.quantity || 0), 0);
      root.querySelector('[data-cart-title]').textContent = 'Your bag';
      document.title = 'Shopping bag | RX CLOTHS';
      root.querySelector('[data-cart-eyebrow]').textContent = 'Saved on this device';
      root.querySelector('[data-cart-description]').textContent = 'Items are saved in this browser.';
      root.querySelector('[data-cart-notice]').hidden = false;
      root.querySelector('[data-cart-summary-title]').textContent = 'Order summary';
      root.querySelector('[data-cart-subtotal-label]').textContent = 'Subtotal';
      root.querySelector('[data-cart-total-copy]').textContent =
        'Demo total only. Cash on Delivery is simulated in this browser; nothing is dispatched.';
      root.querySelector('[data-cart-checkout]').hidden = validLines.length === 0;
      root.querySelector('[data-cart-continue]').hidden = false;
      itemsContainer.replaceChildren();
      validLines.forEach((line, index) => {
        const product = productById(line.productId);
        if (!product) {
          const row = text('article', 'cart-line');
          const details = text('div', 'cart-line-details');
          details.append(
            text('p', 'product-card-name', 'Unavailable product'),
            text('p', 'cart-line-meta', 'This item is no longer in the published catalogue and cannot be checked out.')
          );
          const remove = text('button', 'remove-line', 'Remove');
          remove.type = 'button';
          remove.addEventListener('click', () => {
            writeList(CART_KEY, validLines.filter((_, lineIndex) => lineIndex !== index));
          });
          row.append(details, remove);
          itemsContainer.append(row);
          return;
        }
        const variant = product.variants.find((item) => item.color === line.color && item.size === line.size);
        const row = text('article', 'cart-line');
        const imageLink = document.createElement('a');
        imageLink.href = productLink(product);
        const image = document.createElement('img');
        setProductImage(image, product.images[0]);
        image.loading = 'lazy';
        imageLink.append(image);
        const details = text('div', 'cart-line-details');
        const title = document.createElement('a');
        title.href = productLink(product);
        title.className = 'product-card-name';
        title.textContent = product.name;
        details.append(title, text('p', 'cart-line-meta', [line.color, line.size ? `Size ${line.size}` : ''].filter(Boolean).join(' · ')),
          text('p', 'cart-line-meta', currency.format(Number(line.unitPrice ?? product.price))));
        const actions = text('div', 'cart-line-actions');
        const quantity = text('div', 'quantity-control');
        const decrease = text('button', '', '−');
        decrease.type = 'button';
        decrease.setAttribute('aria-label', `Decrease quantity of ${product.name}`);
        decrease.disabled = Number(line.quantity) <= 1;
        const quantityValue = text('span', 'cart-quantity', String(line.quantity));
        const increase = text('button', '', '+');
        increase.type = 'button';
        increase.setAttribute('aria-label', `Increase quantity of ${product.name}`);
        increase.disabled = !variant || Number(line.quantity) >= variant.stock;
        decrease.addEventListener('click', () => {
          const updated = [...validLines];
          updated[index] = { ...line, quantity: Number(line.quantity) - 1 };
          writeList(CART_KEY, updated);
        });
        increase.addEventListener('click', () => {
          const updated = [...validLines];
          updated[index] = { ...line, quantity: Number(line.quantity) + 1 };
          writeList(CART_KEY, updated);
        });
        quantity.append(decrease, quantityValue, increase);
        const remove = text('button', 'remove-line', 'Remove');
        remove.type = 'button';
        remove.addEventListener('click', () => {
          writeList(CART_KEY, validLines.filter((_, lineIndex) => lineIndex !== index));
        });
        actions.append(quantity, remove);
        row.append(imageLink, details, actions);
        itemsContainer.append(row);
      });
      empty.hidden = validLines.length > 0;
      summary.hidden = validLines.length === 0;
      itemsContainer.hidden = validLines.length === 0;
      count.textContent = `${unitCount} ${unitCount === 1 ? 'item' : 'items'}`;
      total.textContent = currency.format(amount);
    };
    window.addEventListener('rx:store-updated', () => { void render(); });
    void render();
  };

  if (!data || !Array.isArray(data.products) || !data.categories || !data.menuGroups) {
    console.error('RX CLOTHS product data is unavailable.');
    document.querySelectorAll('[data-listing]').forEach((root) => {
      const message = root.querySelector('[data-listing-message]');
      const count = root.querySelector('[data-results-count]');
      message.hidden = false;
      message.textContent = 'Product listings could not be loaded. Please reload this page.';
      count.textContent = 'Catalogue unavailable';
    });
    document.querySelectorAll('[data-storage-message]').forEach((message) => {
      message.hidden = false;
      message.textContent = 'Product listings could not be loaded. Please reload this page.';
    });
    const productNotFound = document.querySelector('[data-product-not-found]');
    if (productNotFound) {
      productNotFound.hidden = false;
      productNotFound.querySelector('h1').textContent = 'Catalogue unavailable';
      productNotFound.querySelector('p').textContent = 'Product listings could not be loaded. Please reload this page.';
    }
  } else {
    document.querySelectorAll('[data-listing]').forEach(initListing);
    const searchRoot = document.querySelector('[data-search-page]');
    if (searchRoot) initSearch(searchRoot);
    const productRoot = document.querySelector('[data-product-detail]');
    if (productRoot) initProduct(productRoot);
    const wishlistRoot = document.querySelector('[data-wishlist-page]');
    if (wishlistRoot) initWishlist(wishlistRoot);
    const cartRoot = document.querySelector('[data-cart-page]');
    if (cartRoot) initCart(cartRoot);
  }
})();

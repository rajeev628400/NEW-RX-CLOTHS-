'use strict';

const menuToggle = document.querySelector('.menu-toggle');
const primaryNavigation = document.querySelector('#primary-navigation');

const buildCategoryLink = (audience, category, subcategory) => {
  const url = new URLSearchParams({ category });
  if (subcategory) url.set('subcategory', subcategory);
  return `${audience}.html?${url.toString()}`;
};

if (primaryNavigation) {
  const currentAudience = window.location.pathname.split('/').pop().replace('.html', '');
  const audiences = [
    { id: 'men', label: 'Men' },
    { id: 'women', label: 'Women' },
    { id: 'kids', label: 'Kids' }
  ];
  const categoryData = window.RXProductData;
  primaryNavigation.replaceChildren();
  let activeMenu = null;
  const menuTimers = new WeakMap();

  const setActiveMenu = (audience) => {
    activeMenu = audience;
    primaryNavigation.querySelectorAll('.nav-dropdown').forEach((item) => {
      const trigger = item.querySelector('.nav-dropdown-trigger');
      const panel = item.querySelector('.mega-menu');
      const isOpen = item.dataset.audience === activeMenu;
      const pendingClose = menuTimers.get(panel);
      if (pendingClose) {
        window.clearTimeout(pendingClose);
        menuTimers.delete(panel);
      }
      trigger.setAttribute('aria-expanded', String(isOpen));
      item.classList.toggle('is-open', isOpen);
      if (isOpen) {
        panel.hidden = false;
        panel.removeAttribute('aria-hidden');
        window.requestAnimationFrame(() => {
          if (item.classList.contains('is-open')) panel.classList.add('is-visible');
        });
      } else if (!panel.hidden) {
        panel.setAttribute('aria-hidden', 'true');
        panel.classList.remove('is-visible');
        const closeDelay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220;
        menuTimers.set(panel, window.setTimeout(() => {
          if (!item.classList.contains('is-open')) panel.hidden = true;
          menuTimers.delete(panel);
        }, closeDelay));
      }
    });
  };

  audiences.forEach(({ id, label }) => {
    const item = document.createElement('div');
    item.className = 'nav-dropdown';
    item.dataset.audience = id;
    const button = document.createElement('button');
    const panelId = `mega-menu-${id}`;
    const triggerId = `mega-menu-trigger-${id}`;
    button.className = 'nav-dropdown-trigger';
    button.id = triggerId;
    button.type = 'button';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', panelId);
    button.textContent = label;
    if (currentAudience === id) button.setAttribute('aria-current', 'page');

    const panel = document.createElement('div');
    panel.className = 'mega-menu';
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', `${label} clothing categories`);
    panel.setAttribute('aria-labelledby', triggerId);
    panel.setAttribute('aria-hidden', 'true');
    panel.hidden = true;

    if (categoryData?.menuGroups?.[id]) {
      const allLink = document.createElement('a');
      allLink.className = 'mega-menu-all';
      allLink.href = `${id}.html`;
      allLink.textContent = `View all ${label}`;
      panel.append(allLink);

      categoryData.menuGroups[id].forEach((group) => {
        const section = document.createElement('section');
        section.className = 'mega-menu-group';
        const heading = document.createElement('h2');
        if (categoryData.categories[id].includes(group.title)) {
          const categoryLink = document.createElement('a');
          categoryLink.href = buildCategoryLink(id, group.title);
          categoryLink.textContent = group.title;
          heading.append(categoryLink);
        } else {
          heading.textContent = group.title;
        }
        section.append(heading);
        group.items.forEach((category) => {
          const link = document.createElement('a');
          const topLevel = categoryData.categories[id].includes(category);
          link.href = buildCategoryLink(id, topLevel ? category : group.title, topLevel ? '' : category);
          link.textContent = category;
          section.append(link);
        });
        panel.append(section);
      });
    } else {
      const link = document.createElement('a');
      link.href = `${id}.html`;
      link.textContent = `View ${label}`;
      panel.append(link);
    }

    item.append(button, panel);
    primaryNavigation.append(item);
    button.addEventListener('click', () => {
      setActiveMenu(activeMenu === id ? null : id);
    });
    button.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowDown') return;
      event.preventDefault();
      setActiveMenu(id);
      panel.querySelector('a')?.focus();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !activeMenu) return;
    const openTrigger = primaryNavigation.querySelector(`#mega-menu-trigger-${activeMenu}`);
    setActiveMenu(null);
    openTrigger?.focus();
  });

  document.addEventListener('click', (event) => {
    if (event.target instanceof Node && !primaryNavigation.contains(event.target)) {
      setActiveMenu(null);
    }
  });
}

if (menuToggle && primaryNavigation) {
  const setMenuExpanded = (isExpanded) => {
    menuToggle.setAttribute('aria-expanded', String(isExpanded));
    menuToggle.setAttribute('aria-label', isExpanded ? 'Close navigation' : 'Open navigation');
    primaryNavigation.classList.toggle('is-open', isExpanded);
  };

  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    setMenuExpanded(!isExpanded);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const openButton = primaryNavigation.querySelector('.nav-dropdown-trigger[aria-expanded="true"]');
    if (openButton) {
      openButton.click();
      openButton.focus();
    } else if (menuToggle.getAttribute('aria-expanded') === 'true') {
      setMenuExpanded(false);
      menuToggle.focus();
    }
  });
}

document.querySelectorAll('[data-current-year]').forEach((year) => {
  year.textContent = String(new Date().getFullYear());
});

const updateBagCounts = () => {
  let quantity = 0;
  try {
    const cart = JSON.parse(localStorage.getItem('rx-cloths-demo-cart') || '[]');
    if (!Array.isArray(cart)) throw new TypeError('The saved demo bag must be a list.');
    quantity = cart.reduce((total, item) => total + (Number.isFinite(Number(item.quantity)) ? Number(item.quantity) : 0), 0);
  } catch (error) {
    console.error('RX CLOTHS demo bag could not be read:', error);
    document.querySelectorAll('[data-cart-count]').forEach((count) => { count.textContent = '!'; });
    return;
  }

  document.querySelectorAll('[data-cart-count], .cart-count').forEach((count) => {
    const nextCount = String(quantity);
    if (count.textContent !== nextCount) {
      count.textContent = nextCount;
      count.classList.remove('is-bumped');
      void count.offsetWidth;
      count.classList.add('is-bumped');
      count.addEventListener('animationend', () => count.classList.remove('is-bumped'), { once: true });
    }
  });
  document.querySelectorAll('[data-cart-link], .cart-action').forEach((link) => {
    link.setAttribute('aria-label', `Shopping bag, ${quantity} ${quantity === 1 ? 'item' : 'items'}`);
  });
};

updateBagCounts();
window.addEventListener('rx:store-updated', updateBagCounts);
window.addEventListener('storage', (event) => {
  if (event.key === 'rx-cloths-demo-cart') updateBagCounts();
});

const revealSelector = [
  'main > section:not(.home-hero)',
  '.section-heading',
  '.category-card',
  '.arrival-feature',
  '.featured-card',
  '.bestsellers-note',
  '.lookbook-copy',
  '.story-copy',
  '.newsletter-section',
  '.catalogue-intro',
  '.demo-notice',
  '.results-heading',
  '.product-breadcrumb',
  '.product-gallery',
  '.product-information',
  '.product-grid > .product-card',
  '[data-cart-items] > .cart-line'
].join(', ');

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const revealCounts = new WeakMap();
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  const observeRevealTargets = (root) => {
    if (root instanceof Element && root.matches(revealSelector) && !root.hasAttribute('data-reveal')) {
      const parent = root.parentElement;
      const index = revealCounts.get(parent) || 0;
      revealCounts.set(parent, index + 1);
      root.style.setProperty('--reveal-delay', `${Math.min(index, 5) * 55}ms`);
      root.setAttribute('data-reveal', '');
      revealObserver.observe(root);
    }
    if (root.querySelectorAll) {
      root.querySelectorAll(revealSelector).forEach((element) => observeRevealTargets(element));
    }
  };

  document.documentElement.classList.add('motion-enabled');
  observeRevealTargets(document);

  const dynamicContainers = document.querySelectorAll('.product-grid, [data-cart-items]');
  const contentObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) observeRevealTargets(node);
      });
    });
  });
  dynamicContainers.forEach((container) => {
    contentObserver.observe(container, { childList: true });
  });
}

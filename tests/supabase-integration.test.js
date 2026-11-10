'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const runBrowserScripts = (files, windowOverrides = {}) => {
  const window = {
    RX_SUPABASE_CONFIG: {
      url: 'https://rx-test.supabase.co',
      publishableKey: 'sb_publishable_test'
    },
    location: { protocol: 'https:', hostname: 'shop.example' },
    dispatchEvent() {},
    ...windowOverrides
  };
  const context = vm.createContext({
    window,
    URL,
    atob: (value) => Buffer.from(value, 'base64').toString('binary'),
    document: { querySelectorAll: () => [] },
    console
  });
  files.forEach((file) => {
    vm.runInContext(read(file), context, { filename: file });
  });
  return window;
};

test('browser client initializes only with a public key and project origin', () => {
  let received;
  const window = runBrowserScripts(['js/supabase-config.js', 'js/supabase-client.js'], {
    supabase: {
      createClient(...args) {
        received = args;
        return { supabaseUrl: args[0] };
      }
    }
  });

  const client = window.RXSupabaseClient.getClient();
  assert.equal(client.supabaseUrl, 'https://rx-test.supabase.co');
  assert.equal(received[1], 'sb_publishable_test');
  assert.equal(received[2].auth.persistSession, true);
});

test('single configuration resolver supports public environment aliases', () => {
  const window = runBrowserScripts(['js/supabase-config.js', 'js/supabase-client.js'], {
    RX_SUPABASE_CONFIG: { url: '', anonKey: '' },
    RXCLOTHS_SUPABASE_URL: 'https://verified-project.supabase.co',
    RXCLOTHS_SUPABASE_ANON_KEY: 'public-anon-key',
    supabase: { createClient: () => ({}) }
  });
  const config = window.RXSupabaseClient.getConfiguration();
  assert.equal(config.url, 'https://verified-project.supabase.co');
  assert.equal(config.publicKey, 'public-anon-key');
});

test('browser client rejects missing, secret, and non-origin configuration', () => {
  for (const [url, key, message] of [
    ['', 'public', /project URL is missing/],
    ['https://rx-test.supabase.co', '', /public API key is missing/],
    ['https://rx-test.supabase.co', 'sb_secret_private', /service-role\/secret key/],
    ['https://rx-test.supabase.co/path', 'public', /project origin only/]
  ]) {
    const window = runBrowserScripts(['js/supabase-client.js'], {
      RX_SUPABASE_CONFIG: { url, publishableKey: key },
      supabase: { createClient: () => ({}) }
    });
    assert.throws(() => window.RXSupabaseClient.getClient(), message);
  }
});

test('local catalogue includes every collection image with unique demo prices', () => {
  const window = runBrowserScripts([
    'js/men-image-manifest.js',
    'js/women-image-manifest.js',
    'js/kids-image-manifest.js',
    'js/product-data.js'
  ]);
  const data = window.RXProductData;
  const products = data.products;
  const menProducts = products.filter((product) => product.audience === 'men');
  const womenProducts = products.filter((product) => product.audience === 'women');
  const kidsProducts = products.filter((product) => product.audience === 'kids');
  const prices = products.map((product) => product.price);
  const removedKidsCategories = ['Trousers', 'Shorts', 'Sweaters', 'Ethnic Wear', 'Festive Wear', 'Winter Wear'];
  const removedWomenCategories = ['Blouses', 'Shorts', 'Blazers', 'Sweaters', 'Cardigans', 'Sweatshirts', 'Hoodies', 'Co-ord Sets', 'Ethnic Wear', 'Activewear', 'Innerwear', 'Loungewear'];

  assert.equal(window.RXMenImageManifest.length, 146);
  assert.equal(window.RXWomenImageManifest.length, 99);
  assert.equal(menProducts.length, 146);
  assert.equal(womenProducts.length, 99);
  assert.equal(kidsProducts.length, 80);
  assert.equal(products.length, 325);
  assert.equal(data.categories.kids.some((category) => removedKidsCategories.includes(category)), false);
  assert.equal(data.menuGroups.kids.flatMap((group) => group.items).some((category) => removedKidsCategories.includes(category)), false);
  assert.equal(data.categories.women.some((category) => removedWomenCategories.includes(category)), false);
  assert.equal(data.menuGroups.women.flatMap((group) => group.items).some((category) => removedWomenCategories.includes(category)), false);
  assert.equal(new Set(prices).size, products.length);
  assert.equal(Math.min(...prices), 699);
  assert.equal(Math.max(...prices), 2994);
  assert.equal(new Set(products.map((product) => product.name)).size, products.length);
  products.forEach((product) => {
    assert.equal(product.price >= 699 && product.price <= 3000, true);
    assert.doesNotMatch(`${product.name} ${product.description}`, /sample|image preview/i);
  });
  menProducts.forEach((product, index) => {
    assert.equal(product.images[0].src, window.RXMenImageManifest[index].src);
    assert.equal(fs.existsSync(path.join(root, decodeURIComponent(product.images[0].src))), true);
  });
  womenProducts.forEach((product, index) => {
    assert.equal(product.images[0].src, window.RXWomenImageManifest[index].src);
    assert.equal(fs.existsSync(path.join(root, decodeURIComponent(product.images[0].src))), true);
  });
  kidsProducts.forEach((product) => {
    assert.equal(fs.existsSync(path.join(root, decodeURIComponent(product.images[0].src))), true);
  });
  const homepage = read('index.html');
  assert.match(homepage, /src="home%20page\.png"/);
  [...homepage.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].forEach(([, src]) => {
    assert.equal(fs.existsSync(path.join(root, decodeURIComponent(src))), true, `homepage image exists: ${src}`);
  });
});

test('store API exposes only authenticated session lookup, never catalogue or cart writes', async () => {
  const session = { data: { session: { user: { id: 'customer-1' } } }, error: null };
  const window = runBrowserScripts([], {
    RXSupabaseClient: { getClient: () => ({ auth: { getSession: async () => session } }) }
  });
  vm.runInContext(read('js/store-api.js'), vm.createContext({ window }), { filename: 'js/store-api.js' });

  assert.deepEqual(Object.keys(window.RXStore).sort(), ['client', 'currentUser']);
  assert.deepEqual(await window.RXStore.currentUser(), { id: 'customer-1' });
});

test('Supabase migrations create only customer-owned delivery-address data', () => {
  const migrationDirectory = path.join(root, 'supabase', 'migrations');
  const migrations = fs.readdirSync(migrationDirectory)
    .filter((file) => file.endsWith('.sql'))
    .map((file) => fs.readFileSync(path.join(migrationDirectory, file), 'utf8'))
    .join('\n');
  const executableSql = migrations.replace(/--.*$/gm, '');
  const schema = read('supabase', 'migrations', '202610150001_core_schema.sql');
  const security = read('supabase', 'migrations', '202610150003_security_policies.sql');

  assert.deepEqual([...executableSql.matchAll(/create table public\.([a-z_]+)/gi)].map((match) => match[1]), ['customer_addresses']);
  assert.match(schema, /references auth\.users \(id\)/i);
  assert.match(schema, /address_type text not null default 'shipping' check \(address_type = 'shipping'\)/i);
  assert.match(security, /grant select, insert, update, delete on public\.customer_addresses to authenticated/i);
  assert.equal((security.match(/create policy/g) || []).length, 4);
  assert.match(security, /user_id = \(select auth\.uid\(\)\)/i);
  assert.doesNotMatch(executableSql, /public\.(profiles|products|product_images|categories|cart_items|orders|store_settings)\b/i);
});

test('signup sends no name/profile metadata; account provides only login and addresses', () => {
  const auth = read('js', 'auth.js');
  const signup = read('signup.html');
  const account = read('account.html');

  assert.match(auth, /client\.auth\.signUp/);
  assert.doesNotMatch(auth, /options:\s*\{\s*data:|\.from\(/);
  assert.doesNotMatch(signup, /name="display_name"/);
  assert.doesNotMatch(account, /data-auth-profile|data-profile-status/);
});

test('only address code accesses Supabase public tables', () => {
  const storefront = read('js', 'storefront.js');
  const adminPage = read('admin', 'index.html');
  const adminScript = path.join(root, 'js', 'admin.js');
  const adminMarkupWithoutGtm = adminPage
    .replace(/<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->/, '')
    .replace(/<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->/, '');

  assert.match(storefront, /\.from\('customer_addresses'\)/);
  assert.doesNotMatch(storefront, /\.from\('(?!customer_addresses')[^']+'\)|\.rpc\(|functions\.invoke/);
  assert.match(storefront, /initializeAddresses\(\)/);
  assert.doesNotMatch(storefront, /initializeCheckout|initializeOrders/);
  assert.doesNotMatch(adminMarkupWithoutGtm, /supabase-client|supabase-js|product-form|Save product|<script/i);
  assert.equal(fs.existsSync(adminScript), false);
});

test('demo COD checkout validates a local bag and stores no delivery details or payment', () => {
  const productData = read('js', 'product-data.js');
  const catalogue = read('js', 'catalogue.js');
  const demoCheckout = read('js', 'demo-checkout.js');
  const checkoutPage = read('checkout.html');
  const ordersPage = read('orders.html');
  const cartPage = read('cart.html');

  assert.match(productData, /mode:\s*'local-demo'/);
  assert.doesNotMatch(catalogue, /window\.RXStore\.(loadCatalogue|addCartItem|readCart|setCartItemQuantity|removeCartItem)/);
  assert.match(catalogue, /localStorage/);
  assert.match(demoCheckout, /data-checkout-form/);
  assert.match(demoCheckout, /rx-cloths-demo-orders/);
  assert.match(demoCheckout, /Cash on Delivery/);
  assert.match(demoCheckout, /Demo only — not submitted/);
  assert.doesNotMatch(demoCheckout, /recipient_name\s*:|address_line_1\s*:|functions\.invoke|fetch\(/i);
  assert.match(checkoutPage, /data-checkout-form/);
  assert.match(checkoutPage, /<title>Checkout \| RX CLOTHS<\/title>/);
  assert.match(checkoutPage, /<h1>Checkout<\/h1>/);
  assert.match(checkoutPage, /Cash on Delivery \(simulated\)/);
  assert.match(checkoutPage, /Delivery details are not sent or saved/);
  assert.match(cartPage, /data-cart-checkout/);
  assert.match(ordersPage, /data-order-list/);
  [
    'men.html',
    'women.html',
    'kids.html',
    'product.html',
    'search.html',
    'wishlist.html',
    'cart.html',
    'checkout.html',
    'orders.html'
  ].forEach((file) => {
    const page = read(file);
    const productDataIndex = page.indexOf('js/product-data.js');
    const menManifestIndex = page.indexOf('js/men-image-manifest.js');
    const womenManifestIndex = page.indexOf('js/women-image-manifest.js');
    assert.ok(productDataIndex >= 0 && menManifestIndex >= 0 && menManifestIndex < productDataIndex,
      `${file} loads men's products before the catalogue`);
    assert.ok(productDataIndex >= 0 && womenManifestIndex >= 0 && womenManifestIndex < productDataIndex,
      `${file} loads women's products before the catalogue`);
  });
});

test('static SEO fallback files are present without inventing a public domain', () => {
  const robots = read('robots.txt');
  const notFound = read('404.html');
  const notFoundWithoutGtm = notFound
    .replace(/<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->/, '')
    .replace(/<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->/, '');
  const vercel = JSON.parse(read('vercel.json'));

  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \//);
  assert.match(notFound, /<title>Page not found \| RX CLOTHS<\/title>/);
  assert.match(notFound, /href="index\.html"/);
  assert.doesNotMatch(robots, /Sitemap:/i);
  assert.doesNotMatch(notFoundWithoutGtm, /https?:\/\//i);
  assert.equal(vercel.headers.length, 1);
  assert.equal(vercel.headers[0].source, '/(.*)');
  const headers = Object.fromEntries(vercel.headers[0].headers.map(({ key, value }) => [key, value]));
  assert.match(headers['Content-Security-Policy'], /default-src 'self'/);
  assert.match(headers['Content-Security-Policy'], /script-src[^;]*https:\/\/www\.googletagmanager\.com/);
  assert.match(headers['Content-Security-Policy'], /'sha256-sZitcj\+5OPnqWfp85LKu\+W62fPr1HDjqk5a\+DaHoFO4='/);
  assert.match(headers['Content-Security-Policy'], /frame-src https:\/\/www\.googletagmanager\.com/);
  assert.match(headers['Content-Security-Policy'], /https:\/\/pruhywawkvqqrapvvoef\.supabase\.co/);
  assert.equal(headers['X-Content-Type-Options'], 'nosniff');
  assert.equal(headers['X-Frame-Options'], 'DENY');
  assert.equal(headers['Referrer-Policy'], 'strict-origin-when-cross-origin');
  assert.equal(headers['Permissions-Policy'], 'camera=(), geolocation=(), microphone=()');
  assert.equal(headers['Strict-Transport-Security'], 'max-age=31536000');
});

test('product detail image placeholder does not request the page as an image', () => {
  const productPage = read('product.html');

  assert.match(productPage, /<img data-main-image alt="">/);
  assert.doesNotMatch(productPage, /<img data-main-image src=["']{2}/);
});

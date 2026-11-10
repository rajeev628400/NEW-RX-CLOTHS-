'use strict';

// RX CLOTHS local learning catalogue. Prices and stock are demonstration data;
// this file is not sent to Supabase.
window.RXProductData = {
  mode: 'local-demo',
  categories: {
    men: ['Shirts', 'T-Shirts', 'Jeans', 'Trousers & Pants', 'Jackets', 'Winter Wear'],
    women: ['Tops', 'T-Shirts', 'Shirts', 'Dresses', 'Jeans', 'Trousers', 'Skirts', 'Jackets', 'Coats', 'Knitwear'],
    kids: ['T-Shirts', 'Shirts', 'Tops', 'Dresses', 'Jeans', 'Skirts', 'Hoodies', 'Jackets', 'Sweatshirts']
  },
  menuGroups: {
    men: [
      { title: 'Shirts', items: ['Boxy Fit Shirts', 'Formal Shirts', 'Linen Shirts'] },
      { title: 'T-Shirts', items: ['Boxy Fit T-Shirts', 'Oversized T-Shirts', 'Regular Fit T-Shirts', 'Polo T-Shirts'] },
      { title: 'Jeans', items: ['Baggy Fit Jeans', 'Bootcut Jeans', 'Straight Fit Jeans'] },
      { title: 'Trousers & Pants', items: ['Straight Fit Trousers', 'Relaxed Fit Trousers'] },
      { title: 'Jackets', items: ['Denim Jackets', 'Leather Jackets'] },
      { title: 'Winter Wear', items: ['Hoodies', 'Sweaters', 'Sweatshirts'] }
    ],
    women: [
      { title: 'Clothing', items: ['Tops', 'T-Shirts', 'Shirts', 'Dresses', 'Jeans', 'Trousers', 'Skirts'] },
      { title: 'Layers & more', items: ['Jackets', 'Coats', 'Knitwear'] }
    ],
    kids: [
      { title: 'Clothing', items: ['T-Shirts', 'Shirts', 'Tops', 'Dresses', 'Jeans', 'Skirts'] },
      { title: 'Seasonal & occasion', items: ['Hoodies', 'Jackets', 'Sweatshirts'] }
    ]
  },
  products: [
    {
      id: 'rx-men-overshirt',
      audience: 'men',
      category: 'Shirts',
      subcategory: 'Boxy Fit Shirts',
      name: 'Dark Green Striped Shirt',
      description: 'A dark green short-sleeve shirt with fine stripes and a large back graphic.',
      price: 1499,
      createdAt: '2026-10-10',
      colors: ['Olive', 'Sand'],
      sizes: ['S', 'M', 'L', 'XL'],
      variants: [
        { color: 'Olive', size: 'S', stock: 4 }, { color: 'Olive', size: 'M', stock: 6 },
        { color: 'Olive', size: 'L', stock: 3 }, { color: 'Olive', size: 'XL', stock: 0 },
        { color: 'Sand', size: 'S', stock: 2 }, { color: 'Sand', size: 'M', stock: 5 },
        { color: 'Sand', size: 'L', stock: 4 }, { color: 'Sand', size: 'XL', stock: 1 }
      ],
      images: [
        { src: 'mens-SHIRT/mens-BOXY FIT SHIRT/Midnight Green Stripe Shirt.jpg', alt: 'Dark green striped shirt' }
      ]
    },
    {
      id: 'rx-men-cotton-tee',
      audience: 'men',
      category: 'T-Shirts',
      subcategory: 'Regular Fit T-Shirts',
      name: 'Everyday Slate T-shirt',
      description: 'A slate-coloured short-sleeve T-shirt with a crew neckline.',
      price: 899,
      createdAt: '2026-10-06',
      colors: ['Ivory', 'Charcoal'],
      sizes: ['S', 'M', 'L', 'XL'],
      variants: [
        { color: 'Ivory', size: 'S', stock: 7 }, { color: 'Ivory', size: 'M', stock: 8 },
        { color: 'Ivory', size: 'L', stock: 5 }, { color: 'Ivory', size: 'XL', stock: 3 },
        { color: 'Charcoal', size: 'S', stock: 4 }, { color: 'Charcoal', size: 'M', stock: 6 },
        { color: 'Charcoal', size: 'L', stock: 0 }, { color: 'Charcoal', size: 'XL', stock: 2 }
      ],
      images: [
        { src: 'mens -T-SHIRT/mens-REGULAR FIT T-SHIRT/Cotton On Men - Everyday Fit T-Shirt - Slate stone.jpg', alt: 'Slate-coloured short-sleeve T-shirt' }
      ]
    },
    {
      id: 'rx-men-straight-jeans',
      audience: 'men',
      category: 'Jeans',
      subcategory: 'Straight Fit Jeans',
      name: 'Straight-Leg Denim',
      description: 'Blue jeans with a straight-leg shape and front pockets.',
      price: 1999,
      createdAt: '2026-09-28',
      colors: ['Mid blue', 'Dark indigo'],
      sizes: ['30', '32', '34', '36'],
      variants: [
        { color: 'Mid blue', size: '30', stock: 2 }, { color: 'Mid blue', size: '32', stock: 5 },
        { color: 'Mid blue', size: '34', stock: 4 }, { color: 'Mid blue', size: '36', stock: 1 },
        { color: 'Dark indigo', size: '30', stock: 3 }, { color: 'Dark indigo', size: '32', stock: 0 },
        { color: 'Dark indigo', size: '34', stock: 2 }, { color: 'Dark indigo', size: '36', stock: 2 }
      ],
      images: [
        { src: 'mens-JEANS/mens-STRAIGHT FIT JEAN/Light Wash Straight Jeans.jpg', alt: 'Blue straight-leg jeans with pockets' }
      ]
    },
    {
      id: 'rx-men-knit-polo',
      audience: 'men',
      category: 'T-Shirts',
      subcategory: 'Regular Fit T-Shirts',
      name: 'Raglan Short-Sleeve T-shirt',
      description: 'A light neutral T-shirt with darker raglan sleeves and a crew neckline.',
      price: 1099,
      createdAt: '2026-09-18',
      colors: ['Stone', 'Deep green'],
      sizes: ['S', 'M', 'L', 'XL'],
      variants: [
        { color: 'Stone', size: 'S', stock: 2 }, { color: 'Stone', size: 'M', stock: 4 },
        { color: 'Stone', size: 'L', stock: 3 }, { color: 'Stone', size: 'XL', stock: 1 },
        { color: 'Deep green', size: 'S', stock: 3 }, { color: 'Deep green', size: 'M', stock: 5 },
        { color: 'Deep green', size: 'L', stock: 0 }, { color: 'Deep green', size: 'XL', stock: 2 }
      ],
      images: [
        { src: 'mens -T-SHIRT/mens-REGULAR FIT T-SHIRT/Next REGULAR FIT - SMART SOFT TOUCH HEAVYWEIGHT T-SHIRT _ - T-shirt basic - neutral raglan.jpg', alt: 'Neutral short-sleeve T-shirt' }
      ]
    },
    {
      id: 'rx-women-midi-dress',
      audience: 'women',
      category: 'Dresses',
      name: 'Sky Floral Dress',
      subcategory: 'Floral Dresses',
      description: 'A pale blue floral dress with puff sleeves and a gathered hem.',
      price: 2299,
      createdAt: '2026-10-11',
      colors: ['Olive', 'Black'],
      sizes: ['XS', 'S', 'M', 'L'],
      variants: [
        { color: 'Olive', size: 'XS', stock: 2 }, { color: 'Olive', size: 'S', stock: 4 },
        { color: 'Olive', size: 'M', stock: 3 }, { color: 'Olive', size: 'L', stock: 0 },
        { color: 'Black', size: 'XS', stock: 1 }, { color: 'Black', size: 'S', stock: 3 },
        { color: 'Black', size: 'M', stock: 4 }, { color: 'Black', size: 'L', stock: 2 }
      ],
      images: [
        { src: 'women cloth/CLOTHING/women-DRESSES/Sky Blossom Floral Midi Dress.jpg', alt: 'Floral-print midi dress' }
      ]
    },
    {
      id: 'rx-women-linen-top',
      audience: 'women',
      category: 'Tops',
      name: 'Mint Floral Puff-Sleeve Top',
      subcategory: 'Puff-Sleeve Tops',
      description: 'A mint-green floral top with puff sleeves and a shaped bodice.',
      price: 999,
      createdAt: '2026-10-04',
      colors: ['Ivory', 'Terracotta'],
      sizes: ['XS', 'S', 'M', 'L'],
      variants: [
        { color: 'Ivory', size: 'XS', stock: 2 }, { color: 'Ivory', size: 'S', stock: 5 },
        { color: 'Ivory', size: 'M', stock: 5 }, { color: 'Ivory', size: 'L', stock: 2 },
        { color: 'Terracotta', size: 'XS', stock: 1 }, { color: 'Terracotta', size: 'S', stock: 4 },
        { color: 'Terracotta', size: 'M', stock: 3 }, { color: 'Terracotta', size: 'L', stock: 0 }
      ],
      images: [
        { src: 'women cloth/CLOTHING/women-TOPS/Mint Green Puff Top.jpg', alt: 'Mint-green puff-sleeve top' }
      ]
    },
    {
      id: 'rx-women-wide-trouser',
      audience: 'women',
      category: 'Trousers',
      name: 'Relaxed Wide-Leg Trouser',
      subcategory: 'Wide-Leg Trousers',
      description: 'Brown trousers with a wide-leg shape.',
      price: 1699,
      createdAt: '2026-09-29',
      colors: ['Charcoal', 'Sand'],
      sizes: ['XS', 'S', 'M', 'L'],
      variants: [
        { color: 'Charcoal', size: 'XS', stock: 2 }, { color: 'Charcoal', size: 'S', stock: 4 },
        { color: 'Charcoal', size: 'M', stock: 3 }, { color: 'Charcoal', size: 'L', stock: 1 },
        { color: 'Sand', size: 'XS', stock: 0 }, { color: 'Sand', size: 'S', stock: 3 },
        { color: 'Sand', size: 'M', stock: 4 }, { color: 'Sand', size: 'L', stock: 2 }
      ],
      images: [
        { src: 'women cloth/CLOTHING/women-TROUSERS/Brown Wide-Leg Trousers.jpg', alt: 'Brown wide-leg trousers' }
      ]
    },
    {
      id: 'rx-women-poplin-blouse',
      audience: 'women',
      category: 'Blouses',
      name: 'White Bow-Print Shirt',
      subcategory: 'Bow-Print Shirts',
      description: 'A white collared shirt with a small bow print.',
      price: 1399,
      createdAt: '2026-09-20',
      colors: ['White', 'Sky blue'],
      sizes: ['XS', 'S', 'M', 'L'],
      variants: [
        { color: 'White', size: 'XS', stock: 3 }, { color: 'White', size: 'S', stock: 4 },
        { color: 'White', size: 'M', stock: 4 }, { color: 'White', size: 'L', stock: 2 },
        { color: 'Sky blue', size: 'XS', stock: 1 }, { color: 'Sky blue', size: 'S', stock: 3 },
        { color: 'Sky blue', size: 'M', stock: 0 }, { color: 'Sky blue', size: 'L', stock: 2 }
      ],
      images: [
        { src: 'women cloth/CLOTHING/women-SHIRTS/White Bow Shirt.jpg', alt: 'White collared shirt with a bow detail' }
      ]
    },
  ]
};

const kidsImageCounts = new Map();
const kidsImageProducts = window.RXKidsImageManifest.map((image, index) => {
  const categoryIndex = kidsImageCounts.get(image.category) || 0;
  kidsImageCounts.set(image.category, categoryIndex + 1);
  const filename = decodeURIComponent(image.src).split('/').pop();
  const sizes = ['2-3Y', '4-5Y', '6-7Y', '8-9Y'];
  return {
    id: `rx-kids-style-${image.category.toLowerCase().replace(/[^a-z]+/g, '-')}-${String(categoryIndex + 1).padStart(2, '0')}`,
    audience: 'kids',
    category: image.category,
    subcategory: image.subcategory,
    name: `Kids ${image.category} - ${filename.replace(/\.[^.]+$/, '')}`,
    description: `${image.category} from the kids collection.`,
    price: 699,
    createdAt: '2026-10-21',
    colors: ['As shown'],
    sizes,
    variants: sizes.map((size, sizeIndex) => ({
      color: 'As shown',
      size,
      stock: 3 + ((index + sizeIndex) % 4)
    })),
    images: [{ src: image.src, alt: image.alt }]
  };
});
window.RXProductData.products = [
  ...window.RXProductData.products.filter((product) => product.audience !== 'kids'),
  ...kidsImageProducts
];

const menImageManifest = window.RXMenImageManifest;
if (Array.isArray(menImageManifest)) {
  const existingMenProductIds = new Map([
    ['mens-SHIRT/mens-BOXY FIT SHIRT/Midnight Green Stripe Shirt.jpg', 'rx-men-overshirt'],
    ['mens -T-SHIRT/mens-REGULAR FIT T-SHIRT/Cotton On Men - Everyday Fit T-Shirt - Slate stone.jpg', 'rx-men-cotton-tee'],
    ['mens-JEANS/mens-STRAIGHT FIT JEAN/Light Wash Straight Jeans.jpg', 'rx-men-straight-jeans'],
    ['mens -T-SHIRT/mens-REGULAR FIT T-SHIRT/Next REGULAR FIT - SMART SOFT TOUCH HEAVYWEIGHT T-SHIRT _ - T-shirt basic - neutral raglan.jpg', 'rx-men-knit-polo']
  ]);
  const imageBackedMenProducts = menImageManifest.map((image, index) => {
    const name = `${image.subcategory.replace(/s$/, '')} ${String(index + 1).padStart(2, '0')}`;
    const sizes = image.category === 'Jeans' || image.category === 'Trousers & Pants'
      ? ['30', '32', '34', '36']
      : ['S', 'M', 'L', 'XL'];

    return {
      id: existingMenProductIds.get(decodeURIComponent(image.src)) || `rx-men-style-${String(index + 1).padStart(3, '0')}`,
      audience: 'men',
      category: image.category,
      subcategory: image.subcategory,
      name,
      description: `${image.subcategory} from the men's collection.`,
      price: 699,
      createdAt: '2026-10-21',
      colors: ['As shown'],
      sizes,
      variants: sizes.map((size, sizeIndex) => ({
        color: 'As shown',
        size,
        stock: 3 + ((index + sizeIndex) % 4)
      })),
      images: [{ src: image.src, alt: image.alt }]
    };
  });
  window.RXProductData.products = [
    ...imageBackedMenProducts,
    ...window.RXProductData.products.filter((product) => product.audience !== 'men')
  ];
}

const womenImageManifest = window.RXWomenImageManifest;
if (Array.isArray(womenImageManifest)) {
  const existingWomenProducts = new Map(
    window.RXProductData.products
      .filter((product) => product.audience === 'women')
      .flatMap((product) => product.images.map((image) => [decodeURIComponent(image.src), product]))
  );
  const imageBackedWomenProducts = womenImageManifest.map((image, index) => {
    const existingProduct = existingWomenProducts.get(decodeURIComponent(image.src));
    const sizes = ['XS', 'S', 'M', 'L', 'XL'];
    return {
      ...existingProduct,
      id: existingProduct?.id || `rx-women-style-${String(index + 1).padStart(3, '0')}`,
      audience: 'women',
      category: image.category,
      subcategory: image.subcategory,
      name: existingProduct?.name || decodeURIComponent(image.src).split('/').pop().replace(/\.[^.]+$/, ''),
      description: existingProduct?.description || `${image.subcategory} from the women's collection.`,
      createdAt: existingProduct?.createdAt || '2026-10-21',
      colors: ['As shown'],
      sizes,
      variants: sizes.map((size, sizeIndex) => ({
        color: 'As shown',
        size,
        stock: existingProduct?.variants.find((variant) => variant.size === size)?.stock ?? 3 + ((index + sizeIndex) % 4)
      })),
      images: [{ src: image.src, alt: image.alt }]
    };
  });
  window.RXProductData.products = [
    ...window.RXProductData.products.filter((product) => product.audience !== 'women'),
    ...imageBackedWomenProducts
  ];
}

window.RXProductData.products.forEach((product, index, products) => {
  const priceRange = 2994 - 699;
  product.price = 699 + Math.floor(index * priceRange / (products.length - 1));
});

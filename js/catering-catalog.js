/**
 * Bottomz Up — Catering catalog
 * Product cards mapped 1:1 to dine-in menu names + food photos
 */
(function () {
  'use strict';

  var IMG = '../assets/images/catering/products/';

  window.BOTTOMZ_CATERING = {
    packages: [
      {
        value: 'Burger bundle for 20',
        name: 'Burger Bundle',
        badge: '20 people',
        image: IMG + 'classic-house-burger.jpg',
        meta: 'Classic House Burgers · House Salad tray · fries · toppings on the side',
      },
      {
        value: 'Burger bundle for 10',
        name: 'Burger Bundle',
        badge: '10 people',
        image: IMG + 'bacon-cheeseburger.jpg',
        meta: 'Bacon Cheeseburger option · half salad · half fries',
      },
      {
        value: 'Burger box lunch for 10 individual',
        name: 'Burger Box Lunch',
        badge: '10 boxes',
        image: '../assets/images/catering/box-burger.jpg',
        meta: 'Classic House Burger + fries in individual boxes',
        cover: true,
      },
      {
        value: 'Burger box lunch for 20 individual',
        name: 'Burger Box Lunch',
        badge: '20 boxes',
        image: '../assets/images/catering/box-burger.jpg',
        meta: 'Classic House Burger + fries in individual boxes',
        cover: true,
      },
      {
        value: 'Wrap box lunch for 10',
        name: 'Wrap Box Lunch',
        badge: '10 boxes',
        image: IMG + 'chicken-wrap.jpg',
        meta: 'Chicken Wrap or Cheese Steak Wrap · individual boxes',
      },
      {
        value: 'Wrap box lunch for 20',
        name: 'Wrap Box Lunch',
        badge: '20 boxes',
        image: IMG + 'chicken-wrap.jpg',
        meta: 'Chicken Wrap or Cheese Steak Wrap · individual boxes',
      },
      {
        value: 'Ribeye VIP lunch for 10',
        name: 'Ribeye Steak VIP',
        badge: 'VIP · 10',
        image: IMG + 'ribeye-steak.jpg',
        meta: 'Ribeye Steak · Mac N Cheese · Mash Potatoes · Churros',
        vip: true,
      },
      {
        value: 'Ribeye VIP lunch for 20',
        name: 'Ribeye Steak VIP',
        badge: 'VIP · 20',
        image: IMG + 'ribeye-steak.jpg',
        meta: 'Ribeye Steak · Mac N Cheese · Mash Potatoes · dessert tray',
        vip: true,
      },
      {
        value: 'Hamburger steak VIP lunch for 10',
        name: 'Hamburger Steak VIP',
        badge: 'VIP · 10',
        image: IMG + 'hamburger-steak.jpg',
        meta: 'Hamburger Steak with gravy · Mash Potatoes',
        vip: true,
      },
      {
        value: 'Hamburger steak VIP lunch for 20',
        name: 'Hamburger Steak VIP',
        badge: 'VIP · 20',
        image: IMG + 'hamburger-steak.jpg',
        meta: 'Hamburger Steak with gravy · Mash Potatoes',
        vip: true,
      },
    ],

    groups: [
      {
        title: 'Back Alley Burgers',
        note: 'Same burgers as the dine-in menu. Add styles for boxes and bundles.',
        products: [
          {
            name: 'Classic House Burger',
            value: 'Classic House Burger',
            image: IMG + 'classic-house-burger.jpg',
            meta: 'Lettuce · tomato · onion · pickles · mayo · fries',
          },
          {
            name: 'Bacon Cheeseburger',
            value: 'Bacon Cheeseburger',
            image: IMG + 'bacon-cheeseburger.jpg',
            meta: 'Cheddar · bacon · lettuce · tomato · onion · fries',
          },
          {
            name: 'Double Decker Burger',
            value: 'Double Decker Burger',
            image: IMG + 'double-decker.jpg',
            meta: 'Two patties · cheddar · pulled pork BBQ · slaw · fries',
          },
          {
            name: 'Garbage Burger',
            value: 'Garbage Burger',
            image: IMG + 'classic-house-burger.jpg',
            meta: 'Cheese · chili · jalapeños · fries · coleslaw',
          },
          {
            name: 'Buffalo Chicken Burger',
            value: 'Buffalo Chicken Burger',
            image: IMG + 'buffalo-chicken-burger.jpg',
            meta: 'Buffalo tossed chicken · ranch · onion rings or fries',
          },
          {
            name: 'Plantastic Burger',
            value: 'Plantastic Burger',
            image: IMG + 'classic-house-burger.jpg',
            meta: 'Plant-based · jalapeño cheddar sauce · fries',
          },
        ],
      },
      {
        title: 'Kitchen Creations',
        note: 'Phillies, wraps, and steaks from the kitchen board.',
        products: [
          {
            name: 'Philly Cheesesteak',
            value: 'Philly Cheesesteak',
            image: IMG + 'philly-cheesesteak.jpg',
            meta: 'Steak · peppers · onions · mushrooms · white cheese · fries',
          },
          {
            name: 'Chicken Philly',
            value: 'Chicken Philly',
            image: IMG + 'chicken-wrap.jpg',
            meta: 'Grilled chicken · peppers · onions · mushrooms · fries',
          },
          {
            name: 'Chicken Wrap',
            value: 'Chicken Wrap',
            image: IMG + 'chicken-wrap.jpg',
            meta: 'Chicken tenders · lettuce · tomato · onion · mayo · fries',
          },
          {
            name: 'Cheese Steak Wrap',
            value: 'Cheese Steak Wrap',
            image: IMG + 'philly-cheesesteak.jpg',
            meta: 'Philly steak · peppers · onions · mushrooms · fries',
          },
          {
            name: 'BBQ Pork Wrap',
            value: 'BBQ Pork Wrap',
            image: IMG + 'philly-cheesesteak.jpg',
            meta: 'Pulled pork BBQ · lettuce · tomato · onion · fries',
          },
          {
            name: 'Ribeye Steak',
            value: 'Ribeye Steak',
            image: IMG + 'ribeye-steak.jpg',
            meta: 'Mesquite grilled · Mash Potatoes · side salad',
          },
          {
            name: 'Hamburger Steak',
            value: 'Hamburger Steak',
            image: IMG + 'hamburger-steak.jpg',
            meta: 'Brown gravy · onions · mushrooms · Mash Potatoes',
          },
        ],
      },
      {
        title: 'Bone-In Wings',
        note: 'Tossed in house sauce. Pick tray size. Note heat in the quote form.',
        products: [
          {
            name: 'Bone-In Wings',
            value: '30 Bone-In Wings',
            image: IMG + 'bone-in-wings.jpg',
            meta: '30 pc tray · pick your sauce',
          },
          {
            name: 'Bone-In Wings',
            value: '60 Bone-In Wings',
            image: IMG + 'bone-in-wings.jpg',
            meta: '60 pc tray · pick your sauce',
          },
          {
            name: 'Bone-In Wings',
            value: '90 Bone-In Wings',
            image: IMG + 'bone-in-wings.jpg',
            meta: '90 pc tray · pick your sauce',
          },
        ],
      },
      {
        title: 'Starters',
        note: 'Tray sizes of the shareables on the menu.',
        products: [
          {
            name: 'Nachos Grande',
            value: 'Half tray Nachos Grande',
            image: IMG + 'nachos-grande.jpg',
            meta: 'Half tray · chips · cheese · toppings',
          },
          {
            name: 'Nachos Grande',
            value: 'Full tray Nachos Grande',
            image: IMG + 'nachos-grande.jpg',
            meta: 'Full tray · chips · cheese · toppings',
          },
          {
            name: 'Street Corn Ribs',
            value: 'Half tray Street Corn Ribs',
            image: IMG + 'street-corn-ribs.jpg',
            meta: 'Half tray · lime · parmesan · ranch',
          },
          {
            name: 'Street Corn Ribs',
            value: 'Full tray Street Corn Ribs',
            image: IMG + 'street-corn-ribs.jpg',
            meta: 'Full tray · lime · parmesan · ranch',
          },
        ],
      },
      {
        title: 'Salads',
        note: 'Greens and dressings from the salad menu.',
        products: [
          {
            name: 'House Salad',
            value: 'Full tray House Salad',
            image: IMG + 'house-salad.jpg',
            meta: 'Full tray · serves up to 12',
          },
          {
            name: 'House Salad',
            value: 'Half tray House Salad',
            image: IMG + 'house-salad.jpg',
            meta: 'Half tray · serves up to 7',
          },
          {
            name: 'House Salad',
            value: 'House Salad with Grilled Chicken',
            image: IMG + 'caesar-chicken.jpg',
            meta: 'Menu house salad + grilled chicken',
          },
          {
            name: 'Caesar Salad',
            value: 'Caesar Salad',
            image: IMG + 'house-salad.jpg',
            meta: 'Romaine · parmesan · croutons · Caesar',
          },
          {
            name: 'Caesar Salad w/ Grilled Chicken',
            value: 'Caesar Salad w/ Grilled Chicken',
            image: IMG + 'caesar-chicken.jpg',
            meta: 'Menu Caesar + grilled chicken',
          },
          {
            name: 'Side Salad',
            value: 'Side Salad tray',
            image: IMG + 'house-salad.jpg',
            meta: 'Tray of side salads',
          },
        ],
      },
      {
        title: 'Sides',
        note: 'Mac N Cheese, fries, and mash from the sides board.',
        products: [
          {
            name: 'Mac N Cheese',
            value: 'Half tray Mac N Cheese',
            image: IMG + 'mac-n-cheese.jpg',
            meta: 'Half tray',
          },
          {
            name: 'Mac N Cheese',
            value: 'Full tray Mac N Cheese',
            image: IMG + 'mac-n-cheese.jpg',
            meta: 'Full tray',
          },
          {
            name: 'Fries',
            value: 'Half tray Fries',
            image: IMG + 'fries.jpg',
            meta: 'Half tray crispy fries',
          },
          {
            name: 'Fries',
            value: 'Full tray Fries',
            image: IMG + 'fries.jpg',
            meta: 'Full tray crispy fries',
          },
          {
            name: 'Mash Potatoes',
            value: 'Half tray Mash Potatoes',
            image: IMG + 'mac-n-cheese.jpg',
            meta: 'Half tray',
          },
          {
            name: 'Mash Potatoes',
            value: 'Full tray Mash Potatoes',
            image: IMG + 'mac-n-cheese.jpg',
            meta: 'Full tray',
          },
        ],
      },
      {
        title: 'Desserts',
        note: 'Sweet finish trays from the dessert menu.',
        products: [
          {
            name: 'Churros',
            value: 'Half tray Churros',
            image: IMG + 'churros.jpg',
            meta: 'Half tray · cinnamon & sugar',
          },
          {
            name: 'Churros',
            value: 'Full tray Churros',
            image: IMG + 'churros.jpg',
            meta: 'Full tray · cinnamon & sugar',
          },
          {
            name: 'Beignets',
            value: 'Half tray Beignets',
            image: IMG + 'churros.jpg',
            meta: 'Half tray · powdered sugar',
          },
          {
            name: 'Beignets',
            value: 'Full tray Beignets',
            image: IMG + 'churros.jpg',
            meta: 'Full tray · powdered sugar',
          },
        ],
      },
      {
        title: 'Drinks',
        note: 'Gallons and packs for the group.',
        compact: true,
        products: [
          {
            name: 'Sweet Tea',
            value: 'Gallon sweet tea',
            image: IMG + 'sweet-tea.jpg',
            meta: '1 gallon',
          },
          {
            name: 'Unsweet Tea',
            value: 'Gallon unsweet tea',
            image: IMG + 'unsweet-tea.jpg',
            meta: '1 gallon',
          },
          {
            name: 'Pepsi',
            value: '12-pack Pepsi',
            image: IMG + 'pepsi-pack.jpg',
            meta: '12-pack',
          },
          {
            name: 'Diet Pepsi',
            value: '12-pack Diet Pepsi',
            image: IMG + 'diet-pepsi-pack.jpg',
            meta: '12-pack',
          },
          {
            name: 'Mountain Dew',
            value: '12-pack Mountain Dew',
            image: IMG + 'mountain-dew-pack.jpg',
            meta: '12-pack',
          },
          {
            name: 'Sierra Mist',
            value: '12-pack Sierra Mist',
            image: IMG + 'sierra-mist-pack.jpg',
            meta: '12-pack',
          },
        ],
      },
    ],
  };

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function productCard(p, compact) {
    var cls = 'p-card cat-item' + (compact ? ' p-card--compact' : '');
    return (
      '<label class="' +
      cls +
      '">' +
      '<input type="checkbox" name="items" value="' +
      esc(p.value) +
      '" />' +
      '<div class="p-card-media p-card-media--food">' +
      '<img src="' +
      esc(p.image) +
      '" alt="" width="480" height="480" loading="lazy" decoding="async" />' +
      '</div>' +
      '<div class="p-card-body">' +
      '<h3 class="p-card-name cat-item-name">' +
      esc(p.name) +
      '</h3>' +
      (p.meta ? '<p class="p-card-meta">' + esc(p.meta) + '</p>' : '') +
      '<span class="p-card-action" aria-hidden="true"></span>' +
      '</div>' +
      '<span class="p-card-check" aria-hidden="true"></span>' +
      '</label>'
    );
  }

  function packageCard(p) {
    var vip = p.vip ? ' bundle-card--vip' : '';
    var badgeVip = p.vip ? ' p-card-badge--vip' : '';
    var mediaCls = p.cover ? 'p-card-media' : 'p-card-media p-card-media--food';
    return (
      '<label class="p-card p-card--lg bundle-card' +
      vip +
      '">' +
      '<input type="checkbox" name="bundles" value="' +
      esc(p.value) +
      '" />' +
      '<div class="' +
      mediaCls +
      '">' +
      '<img src="' +
      esc(p.image) +
      '" alt="" width="640" height="640" loading="lazy" decoding="async" />' +
      '</div>' +
      '<div class="p-card-body">' +
      '<span class="p-card-badge' +
      badgeVip +
      '">' +
      esc(p.badge) +
      '</span>' +
      '<h3 class="p-card-name cat-item-name">' +
      esc(p.name) +
      '</h3>' +
      '<p class="p-card-meta">' +
      esc(p.meta) +
      '</p>' +
      '<span class="p-card-action" aria-hidden="true"></span>' +
      '</div>' +
      '<span class="p-card-check" aria-hidden="true"></span>' +
      '</label>'
    );
  }

  function renderPackages(root) {
    if (!root) return;
    var data = window.BOTTOMZ_CATERING.packages;
    root.innerHTML = data.map(packageCard).join('');
  }

  function renderMenu(root) {
    if (!root) return;
    var groups = window.BOTTOMZ_CATERING.groups;
    root.innerHTML = groups
      .map(function (g) {
        var gridCls = 'p-card-grid' + (g.compact ? ' p-card-grid--compact' : '');
        return (
          '<div class="cat-group">' +
          '<h3 class="cat-group-title">' +
          esc(g.title) +
          '</h3>' +
          (g.note ? '<p class="cat-group-note">' + esc(g.note) + '</p>' : '') +
          '<div class="' +
          gridCls +
          '">' +
          g.products.map(function (p) {
            return productCard(p, g.compact);
          }).join('') +
          '</div></div>'
        );
      })
      .join('');
  }

  function mount() {
    renderPackages(document.getElementById('catPackagesMount'));
    renderMenu(document.getElementById('catMenuMount'));
  }

  window.BOTTOMZ_CATERING.mount = mount;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();

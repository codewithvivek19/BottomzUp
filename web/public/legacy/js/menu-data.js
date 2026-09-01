/**
 * Bottomz Up Bar & Grill — Full menu data
 * Extracted from official 2-page A3 menu PDF
 * 2001 Seymour Dr, South Boston, VA 24592
 */
window.BOTTOMZ_MENU = {
  categories: [
    { id: "starters", label: "Starters", theme: "food", image: "../assets/images/cat_starters.jpg" },
    { id: "salads", label: "Salads", theme: "food", image: "../assets/images/cat_salads.jpg" },
    { id: "burgers", label: "Burgers", theme: "food", image: "../assets/images/cat_burgers.jpg" },
    { id: "kitchen", label: "Kitchen", theme: "food", image: "../assets/images/cat_kitchen.jpg" },
    { id: "wings", label: "Wings", theme: "food", image: "../assets/images/cat_wings.jpg" },
    { id: "kids", label: "Kids", theme: "food", image: "../assets/images/cat_kids.jpg" },
    { id: "desserts", label: "Desserts", theme: "food", image: "../assets/images/cat_desserts.jpg" },
    { id: "sides", label: "Sides", theme: "food", image: "../assets/images/cat_sides.jpg" },
    { id: "drinks", label: "Drinks", theme: "bar", image: "../assets/images/cat_drinks.jpg" },
  ],

  sections: [
    {
      id: "starters",
      title: "Starters",
      theme: "food",
      intro: "Shareables that hit before the main event.",
      items: [
        {
          name: "Nachos Grande",
          price: 14,
          desc: "Fresh tortilla chips topped with melted mixed cheese, onions, tomatoes, jalapeños, sour cream.",
          add: "Jalapeño cheddar sauce +$1",
          options: ["Chili", "Pulled Pork BBQ", "Grilled Chicken"],
          optionsLabel: "Pick any one",
        },
        {
          name: "Bacon Chicken Dip",
          price: 10,
          desc: "Warm creamy dip with chicken, bacon and ranch flavor; served with crispy tortilla chips.",
        },
        {
          name: "Bacon Cheese Fries",
          price: 12,
          desc: "Golden fries loaded with melted cheese & bacon; served with ranch.",
        },
        {
          name: "Mozzarella Sticks",
          price: 12,
          desc: "Fried battered mozzarella; served with marinara sauce.",
        },
        {
          name: "Beer-Battered Onion Rings",
          price: 10,
          desc: "Thick-cut onion rings fried golden brown; served with ranch.",
        },
        {
          name: "Shrimp Appetizer",
          price: 15,
          desc: "Half pound shrimp with cocktail sauce.",
          options: ["Fried", "Grilled", "Steamed"],
          optionsLabel: "Pick any one",
        },
        {
          name: "Jalapeño Poppers",
          price: 12,
          desc: "Six cream cheese–stuffed jalapeños, fried crispy; served with ranch.",
          tags: ["spicy"],
        },
        {
          name: "Fried Okra",
          price: 9,
          desc: "Southern-style fried okra with ranch.",
        },
        {
          name: "Pickle Poppers",
          price: 12,
          desc: "Breaded fried pickle stuffed with cream cheese; served with ranch.",
          tags: ["vegetarian"],
          featured: true,
        },
        {
          name: "Street Corn Ribs",
          price: 12,
          desc: "Street corn seasonings with lime, salt and parmesan; served with ranch.",
          featured: true,
        },
      ],
    },
    {
      id: "salads",
      title: "Salads",
      theme: "food",
      intro: "Fresh greens with house dressings — build them up if you want.",
      items: [
        {
          name: "Side Salad",
          price: 5,
          desc: "Romaine, tomatoes, onions, cucumbers, croutons, choice of dressing.",
        },
        {
          name: "House Salad",
          price: 15,
          desc: "Romaine, tomato, cucumber, red onion, green pepper, mixed cheese blend, croutons, choice of dressing.",
          add: "Fried chicken strips +$4 · Grilled chicken +$4",
        },
        {
          name: "Caesar Salad",
          price: 13,
          desc: "Romaine, parmesan, shaved parmesan, croutons, Caesar dressing.",
          tags: ["undercooked"],
        },
        {
          name: "Caesar Salad w/ Grilled Chicken",
          price: 15,
          desc: "Romaine, grilled chicken, parmesan, shaved parmesan, croutons, Caesar dressing.",
        },
      ],
    },
    {
      id: "burgers",
      title: "Back Alley Burgers",
      theme: "food",
      intro: "Hand-formed, juicy, and served with fries. Stacked the right way.",
      items: [
        {
          name: "Classic House Burger",
          price: 14,
          desc: "Juicy beef patty, lettuce, tomato, onion, pickles, mayo, with fries.",
          add: "Cheese $1.50",
          tags: ["undercooked"],
        },
        {
          name: "Bacon Cheeseburger",
          price: 16,
          desc: "Beef patty, cheddar, crumbled bacon, lettuce, tomato, onions, mayo, fries.",
          tags: ["undercooked"],
        },
        {
          name: "Double Decker Burger",
          price: 18,
          desc: "Two beef patties with cheddar, pulled pork BBQ, slaw, mayo, with fries.",
          tags: ["undercooked"],
          featured: true,
        },
        {
          name: "Garbage Burger",
          price: 16,
          desc: "Beef patty with cheese, chili, jalapeños, fries and coleslaw; served with onion rings or fries.",
          tags: ["undercooked", "spicy"],
          featured: true,
        },
        {
          name: "Buffalo Chicken Burger",
          price: 13,
          desc: "Grilled or breaded chicken tossed in buffalo sauce, lettuce, tomatoes, onions, side of ranch; onion rings or fries.",
          add: "Cheese $1.50",
          tags: ["spicy"],
          options: ["Grilled", "Breaded"],
        },
        {
          name: "Plantastic Burger",
          price: 14,
          desc: "Plant-based burger with romaine, tomato, onion, mayo, jalapeño cheddar sauce; served with fries.",
          add: "Cheese $1.50",
          tags: ["vegetarian"],
        },
      ],
    },
    {
      id: "kitchen",
      title: "Kitchen Creations",
      theme: "food",
      intro: "Phillies, wraps, steaks, and seafood — the full grill board.",
      items: [
        {
          name: "Philly Cheesesteak",
          price: 14,
          desc: "Philly steak, onions, green peppers, mushrooms, white cheese on 6\" French roll, with fries.",
        },
        {
          name: "Chicken Philly",
          price: 14,
          desc: "Grilled chicken, grilled onions, green peppers, mushrooms, white cheese on 6\" French roll, with fries.",
        },
        {
          name: "Chicken Wrap",
          price: 12,
          desc: "Chicken tenders on flour tortilla with lettuce, tomatoes, onions, mayo, with fries.",
          options: ["Fried", "Grilled"],
        },
        {
          name: "Cheese Steak Wrap",
          price: 13,
          desc: "Philly steak, grilled onions, green peppers, mushrooms, white cheese on flour tortilla, with fries.",
        },
        {
          name: "BBQ Pork Wrap",
          price: 13,
          desc: "Pulled pork BBQ with lettuce, tomatoes & onions, with fries.",
        },
        {
          name: "Cheese Quesadilla w/ Jalapeño Cheddar Sauce",
          price: 12,
          desc: "Grilled 12\" flour tortilla with melted mixed cheese, side of jalapeño cheddar sauce, and fries.",
        },
        {
          name: "Chicken Quesadilla",
          price: 14,
          desc: "Grilled 12\" flour tortilla with melted mixed cheese + grilled chicken, with fries.",
          add: "Jalapeño cheddar sauce +$1",
        },
        {
          name: "Hamburger Steak",
          price: 18,
          desc: "Juicy beef patty made to order with grilled onions, grilled mushrooms, homemade brown gravy, over a bed of mash potatoes.",
          tags: ["undercooked"],
          featured: true,
        },
        {
          name: "Ribeye Steak",
          price: 30,
          desc: "Hand-cut, chargrilled over mesquite flavors, basted with butter-lemon sauce; mash potatoes + side salad.",
          tags: ["undercooked"],
          featured: true,
        },
        {
          name: "Fish & Chips",
          price: 17,
          desc: "Crispy white flounder, spicy or mild, with fries or coleslaw + tartar sauce.",
          options: ["Spicy", "Mild"],
        },
        {
          name: "Shrimp Dinner",
          price: 18,
          desc: "Shrimp fried or grilled, spicy or mild, with fries, coleslaw, cocktail sauce.",
          options: ["Fried", "Grilled", "Spicy", "Mild"],
        },
        {
          name: "Fish Sandwich",
          price: 13,
          desc: "Crispy white flounder, lettuce, tomato, onion, tartar sauce on 6\" French roll, with fries.",
        },
        {
          name: "Fried Oyster Sandwich",
          price: 18,
          desc: "Fried oysters, spicy or mild, on 6\" French roll with lettuce, tomato, onions, mayo; served with fries.",
          options: ["Spicy", "Mild"],
        },
      ],
    },
    {
      id: "wings",
      title: "Wings",
      subtitle: "Bone-In",
      theme: "food",
      intro: "Tossed in sauce. Pick your size. Pick your burn.",
      isWings: true,
      sizes: [
        { label: "Small", count: "6 pc", price: 10 },
        { label: "Medium", count: "12 pc", price: 16 },
        { label: "Large", count: "24 pc", price: 29 },
      ],
      flavors: [
        { name: "BBQ", heat: "mild" },
        { name: "Garlic Parmesan", heat: "mild" },
        { name: "Lemon Pepper", heat: "mild" },
        { name: "Sweet Chili Buffalo", heat: "medium" },
        { name: "Sweet Chili Gochujang", heat: "medium" },
        { name: "Red Hot Mild", heat: "medium" },
        { name: "Mango Habanero", heat: "hot" },
        { name: "Garlic Buffalo", heat: "hot" },
        { name: "Red Hot Buffalo", heat: "hot" },
        { name: "Xtra Hot Buffalo", heat: "xtra" },
      ],
      items: [],
    },
    {
      id: "kids",
      title: "Kids Menu",
      theme: "food",
      intro: "Smaller plates for the next generation of regulars.",
      items: [
        {
          name: "Cheese Quesadilla",
          price: 7,
          desc: "6\" grilled flour tortilla with melted mixed cheese, with fries.",
        },
        {
          name: "Kids Cheese Burger",
          price: 8,
          desc: "Kids burger, choice of cheese, mayo, fries.",
          tags: ["undercooked"],
        },
        {
          name: "Kids Fries Basket",
          price: 4,
          desc: "Crispy golden fries in a basket.",
        },
        {
          name: "Chicken Strips",
          price: 8,
          desc: "Fried or grilled, served with fries.",
          options: ["Fried", "Grilled"],
        },
        {
          name: "Grilled Chicken",
          price: 8,
          desc: "Grilled chicken with honey mustard, with fries.",
        },
        {
          name: "Kids Fish n Chips",
          price: 8,
          desc: "Crispy fried white fish (flounder), with fries.",
          tags: ["undercooked"],
        },
      ],
    },
    {
      id: "desserts",
      title: "Desserts",
      theme: "food",
      intro: "Sweet finish. Share if you must.",
      items: [
        {
          name: "Beignets",
          price: 9,
          desc: "French pastry, fried golden, powdered sugar.",
          options: ["Chocolate drizzle", "Caramel drizzle"],
          optionsLabel: "Pick one",
        },
        {
          name: "Churros",
          price: 10,
          desc: "Spanish fried dough dessert, cinnamon & sugar, with vanilla bean ice cream.",
          featured: true,
        },
        {
          name: "Vanilla Bean Ice Cream",
          price: 5,
          desc: "With chocolate or caramel syrup.",
          options: ["Chocolate syrup", "Caramel syrup"],
          optionsLabel: "Pick one",
        },
      ],
    },
    {
      id: "sides",
      title: "Sides",
      theme: "food",
      intro: "All sides $3.",
      items: [
        { name: "Okra", price: 3, desc: "Southern-style side." },
        { name: "Mac N Cheese", price: 3, desc: "Creamy comfort classic." },
        { name: "Mash Potatoes", price: 3, desc: "House mashed potatoes." },
        { name: "Italian Cut Green Beans", price: 3, desc: "Simple and done right." },
      ],
    },
    {
      id: "drinks",
      title: "The Bar",
      theme: "bar",
      intro: "Cocktails, shots, martinis, wine & cold beer. Ask your server for pricing.",
      isBar: true,
      drinkGroups: [
        {
          id: "cocktails",
          title: "Cocktails",
          open: true,
          items: [
            {
              name: "Bottomz Up",
              desc: "Coconut rum, dark rum, pineapple juice, mango juice, lime juice, grenadine.",
              featured: true,
              tags: ["signature"],
            },
            {
              name: "Reggae Rum Smash",
              desc: "Dark rum, Chambord, orange juice, pineapple juice, lime juice.",
            },
            {
              name: "Banana Nana",
              desc: "Banana liqueur, peach schnapps, pineapple juice.",
            },
            {
              name: "Bahama Mama",
              desc: "Coconut rum, dark rum, pineapple juice, orange juice, lime juice, grenadine.",
            },
            {
              name: "Sweet Basil Old Fashioned",
              desc: "Bourbon, simple syrup, basil, orange bitters.",
            },
            {
              name: "Liquid Marijuana",
              desc: "Coconut rum, light rum, blue curaçao, melon liqueur, sour mix, pineapple juice.",
            },
            {
              name: "Blue Motorcycle",
              desc: "Vodka, rum, tequila, gin, blue curaçao, sour mix, lemon-lime soda.",
            },
            {
              name: "Whiskey Sour",
              desc: "Whiskey, sour mix, lemon-lime soda.",
            },
            {
              name: "Amaretto Sour",
              desc: "Amaretto, sour mix, lemon-lime soda.",
            },
            {
              name: "Old Fashioned",
              desc: "Whiskey, simple syrup, bitters, orange slice garnish.",
            },
            {
              name: "XXX Sex on the Beach",
              desc: "Peach schnapps, raspberry liqueur, sour mix, orange juice.",
            },
            {
              name: "The Hawaiian",
              desc: "Dark rum, Chambord, orange juice, pineapple juice, lime juice.",
            },
            {
              name: "Purple Alaskan",
              desc: "Vodka, rum, gin, raspberry liqueur, sour mix, pineapple juice, lemon-lime soda.",
            },
            {
              name: "Sex on the Beach",
              desc: "Vodka, peach schnapps, orange juice, cranberry juice.",
            },
            {
              name: "White Russian",
              desc: "Whipped vodka, coffee liqueur, cream.",
            },
            {
              name: "Black Russian",
              desc: "Vodka and coffee liqueur.",
            },
            {
              name: "Trash Can",
              desc: "Gin, light rum, vodka, peach schnapps, blue curaçao, triple sec, Red Bull.",
              featured: true,
            },
            {
              name: "Tequila Sunrise",
              desc: "Tequila, orange juice, grenadine.",
            },
            {
              name: "Mojito",
              desc: "White rum, simple syrup, lime juice, club soda, fresh mint.",
            },
            {
              name: "Raspberry Mojito",
              desc: "White rum, raspberry liqueur, simple syrup, lime juice, fresh mint.",
            },
          ],
        },
        {
          id: "shots",
          title: "Shots",
          open: false,
          items: [
            {
              name: "Angel Tip",
              desc: "Amaretto, coffee liqueur, cream, whipped topping.",
            },
            {
              name: "Lemon Drop",
              desc: "Vodka, sour mix, sugar-coated lemon.",
            },
            {
              name: "Mind Eraser",
              desc: "Coffee liqueur, vodka, club soda — layered.",
            },
            {
              name: "Blue Kamikaze",
              desc: "Vodka, triple sec, blue curaçao, lime juice.",
            },
            {
              name: "Green Tea",
              desc: "Jameson, peach schnapps, sour mix, lemon-lime soda.",
            },
          ],
        },
        {
          id: "martinis",
          title: "Martinis",
          open: false,
          items: [
            {
              name: "Candy Apple Martini",
              desc: "Sour Apple Pucker, peach schnapps, cranberry juice.",
            },
            {
              name: "Chocolate Martini",
              desc: "Whipped vodka, Irish cream liqueur, chocolate liqueur, chocolate syrup.",
            },
            {
              name: "Caramel Apple Martini",
              desc: "Vodka, Sour Apple Pucker, butterscotch schnapps, caramel around the rim.",
            },
            {
              name: "Lemon Drop Martini",
              desc: "Vodka, simple syrup, sour mix, sugar on the rim.",
            },
            {
              name: "Cotton Candy Martini",
              desc: "Vodka, sugar-free cotton candy syrup, cream.",
            },
            {
              name: "Peaches and Cream Martini",
              desc: "Whipped vodka, peach schnapps, cream liqueur.",
            },
          ],
        },
        {
          id: "wine",
          title: "Wine",
          subtitle: "By glass and by bottle",
          open: false,
          items: [
            { name: "Cabernet Sauvignon", desc: "Red — by glass or bottle." },
            { name: "Pinot Noir", desc: "Red — by glass or bottle." },
            { name: "Chardonnay", desc: "White — by glass or bottle." },
            { name: "Pinot Grigio", desc: "White — by glass or bottle." },
            { name: "Riesling", desc: "White — by glass or bottle." },
            { name: "Moscato", desc: "White — by glass or bottle." },
          ],
        },
        {
          id: "beer",
          title: "Bottled Beer",
          open: false,
          beerLists: {
            domestic: ["Budweiser", "Bud Light", "Coors Light", "Miller Lite", "Michelob Ultra"],
            import: ["Corona", "Modelo", "Heineken"],
          },
          items: [],
        },
      ],
    },
  ],
};

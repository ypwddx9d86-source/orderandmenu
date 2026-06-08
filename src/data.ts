import { MenuItem } from "./types";

export const MENU_ITEMS: MenuItem[] = [
  // --- FOODS ---
  {
    id: "f1",
    name: "Artisan Truffle Wagyu Burger",
    description: "Premium grilled wagyu-style beef patty, rich black truffle aioli, melted sharp cave-aged cheddar, arugula, in a toasted local buttered brioche bun. Served with sea salt crisps.",
    price: 18.50,
    category: "Food",
    popular: true,
    imageEmoji: "🍔"
  },
  {
    id: "f2",
    name: "Spicy Szechuan Chilli Noodles",
    description: "Hand-pulled house noodles tossed in deep fiery roasted chilli oil, toasted ground sesame paste, baby bok choy, garnished with roasted crushed peanuts and thin scallions.",
    price: 14.00,
    category: "Food",
    isVegetarian: true,
    imageEmoji: "🍜"
  },
  {
    id: "f3",
    name: "Crispy Calamari & Citrus Dust",
    description: "Lightly tossed wild calamari rings, fried to perfectly crispy golden brown, seasoned with sweet citrus-paprika blend, served with double garlic saffron aioli dipping sauce.",
    price: 13.50,
    category: "Food",
    popular: true,
    imageEmoji: "🦑"
  },
  {
    id: "f4",
    name: "Avocado Quinoa Garden Harvest Bowl",
    description: "Organic hand-mashed avocado, warm seasoned organic red quinoa, baby power greens, fire-roasted sweet chickpeas, English cucumbers, cherry tomatoes, with honey-tahini dressing.",
    price: 15.50,
    category: "Food",
    isVegetarian: true,
    isGlutenFree: true,
    imageEmoji: "🥗"
  },
  {
    id: "f5",
    name: "Slow-Braised Carnitas Taco Trio",
    description: "Three warm stone-ground soft corn tortillas piled high with 12-hour citrus-braised shredded carnitas, house-pickled red onions, fresh salsa verde, and fragrant coriander.",
    price: 14.50,
    category: "Food",
    isGlutenFree: true,
    imageEmoji: "🌮"
  },
  {
    id: "f6",
    name: "Wild Mushroom & Truffle Risotto",
    description: "Slow-rendered creamy Arborio rice, infused with organic forest reishi & shiitake mushrooms, Parmigiano-Reggiano, chopped garden chives, and finished with white truffle oil drops.",
    price: 19.00,
    category: "Food",
    isVegetarian: true,
    isGlutenFree: true,
    imageEmoji: "🍄"
  },

  // --- DRINKS ---
  {
    id: "d1",
    name: "Signature Smoked Wood Old Fashioned",
    description: "A master class in mixology: Premium aged bourbon, aromatic herbal bitters, wild Vermont maple syrup, cold-smoked directly at table-side with authentic white oak chips. Served over ice sphere.",
    price: 14.00,
    category: "Drinks",
    popular: true,
    imageEmoji: "🥃"
  },
  {
    id: "d2",
    name: "Fresh Cucumber Mint Cooler",
    description: "Zero-proof refreshing mix of freshly pressed English cucumber juice, wild garden basil and mint, hand-squeezed lime, agave nectar, topped with chilled artisanal club soda.",
    price: 7.50,
    category: "Drinks",
    isVegetarian: true,
    isGlutenFree: true,
    imageEmoji: "🍹"
  },
  {
    id: "d3",
    name: "Wild Hibiscus Lavender Brew",
    description: "Refreshing herbal cold infusion of sun-dried Egyptian hibiscus flowers, sweet organic French lavender buds, sweetened lightly with local orange blossom honey, served over crushed ice.",
    price: 6.00,
    category: "Drinks",
    isVegetarian: true,
    isGlutenFree: true,
    imageEmoji: "🌺"
  },
  {
    id: "d4",
    name: "Velvet Salted Caramel Latte",
    description: "Double shot of premium organic espresso beans, velvet-steamed milk, infused with house-cooked dark sea-salt caramel syrup, dusted with fine cocoa powder.",
    price: 6.50,
    category: "Drinks",
    isVegetarian: true,
    imageEmoji: "☕"
  },
  {
    id: "d5",
    name: "Organic Ceremonial Matcha Lemonade",
    description: "Premium ceremonial stone-ground Japanese green matcha layered beautifully over fresh lemonade squeezed from sweet Meyer lemons, carbonated lightly, with clean spearmint.",
    price: 7.00,
    category: "Drinks",
    isVegetarian: true,
    isGlutenFree: true,
    imageEmoji: "🍵"
  },
  {
    id: "d6",
    name: "Sparkling Ginger Pomegranate Elixir",
    description: "Craft probiotic house beverage featuring organic freshly squeezed tart pomegranate juice, cold-pressed raw ginger root squeeze, citrus twists, and active carbonated spring water.",
    price: 8.00,
    category: "Drinks",
    isVegetarian: true,
    isGlutenFree: true,
    imageEmoji: "🍷"
  }
];

export const TABLE_OPTIONS = ["C1", "C2", "C3", "G1", "G2", "CO1", "COT2", "B1", "B2"] as const;

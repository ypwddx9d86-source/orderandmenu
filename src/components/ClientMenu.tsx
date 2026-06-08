import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MenuItem, CartItem } from "../types";
import { 
  ShoppingBag, 
  Minus, 
  Plus, 
  ChevronRight, 
  X, 
  Trash2, 
  Sparkles, 
  UtensilsCrossed, 
  GlassWater, 
  MapPin, 
  Heart,
  CheckCircle,
  FileText,
  Receipt
} from "lucide-react";
import { Order } from "../types";

interface ClientMenuProps {
  tableNumber: string;
  cart: CartItem[];
  onUpdateCart: (cart: CartItem[]) => void;
  onPlaceOrder: (note: string) => Promise<void>;
  orders: Order[];
  historyOrders: Order[];
  menuItems: MenuItem[];
}

export default function ClientMenu({
  tableNumber,
  cart,
  onUpdateCart,
  onPlaceOrder,
  orders,
  historyOrders,
  menuItems
}: ClientMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<"All" | "Food" | "Drinks">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dietaryFilter, setDietaryFilter] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string | null>(null);

  // Cart helper functions
  const handleAddToCart = (item: MenuItem) => {
    const existing = cart.find(c => c.menuItem.id === item.id);
    if (existing) {
      onUpdateCart(
        cart.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
      );
    } else {
      onUpdateCart([...cart, { menuItem: item, quantity: 1 }]);
    }
  };

  const handleDecreaseQuantity = (item: MenuItem) => {
    const existing = cart.find(c => c.menuItem.id === item.id);
    if (!existing) return;
    if (existing.quantity === 1) {
      onUpdateCart(cart.filter(c => c.menuItem.id !== item.id));
    } else {
      onUpdateCart(
        cart.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity - 1 } : c)
      );
    }
  };

  const handleClearCartItem = (itemId: string) => {
    onUpdateCart(cart.filter(c => c.menuItem.id !== itemId));
  };

  const cartCount = cart.reduce((acc, c) => acc + c.quantity, 0);
  const cartSubtotal = cart.reduce((acc, c) => acc + (c.menuItem.price * c.quantity), 0);

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    // Category select
    if (selectedCategory !== "All" && item.category !== selectedCategory) return false;
    
    // Search query
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !item.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Dietary
    if (dietaryFilter === "Veg" && !item.isVegetarian) return false;
    if (dietaryFilter === "NonVeg" && item.isVegetarian) return false;
    if (dietaryFilter === "Fav" && !item.popular) return false;

    return true;
  });

  const handlePlaceOrderSubmit = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      // Create order id for displays
      const orderIdObj = "ORD-" + Math.floor(1000 + Math.random() * 9000);
      setLastPlacedOrderId(orderIdObj);
      await onPlaceOrder(orderNote);
      setOrderNote("");
      setShowOrderSuccess(true);
      setIsCartOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter active and history orders for this table to compute overall bill dynamically
  const myActiveOrders = orders.filter(o => o.tableNumber === tableNumber);
  const myHistoryOrders = historyOrders.filter(o => o.tableNumber === tableNumber);
  const myPlacedOrders = [...myActiveOrders, ...myHistoryOrders];

  const overallBillTotal = myPlacedOrders.reduce((total, order) => total + order.totalPrice, 0);

  // Group items ordered overall across all orders
  const itemisedAggregated: { [id_name: string]: { id: string; name: string; quantity: number; price: number; category: string } } = {};
  myPlacedOrders.forEach((order) => {
    order.items.forEach((item) => {
      const key = item.id || item.name;
      if (itemisedAggregated[key]) {
        itemisedAggregated[key].quantity += item.quantity;
      } else {
        itemisedAggregated[key] = { ...item };
      }
    });
  });
  const aggregatedItems = Object.values(itemisedAggregated);

  return (
    <div id="client-menu-container" className="min-h-screen bg-slate-50 text-slate-800 pb-28">
      {/* Top Brand Banner Header */}
      <header id="client-header" className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-white font-display font-extrabold text-base border border-slate-800">
              LJ
            </div>
            <div>
              <h2 className="font-display font-bold text-slate-900 leading-tight">Le Jardin</h2>
              <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                Digital Ordering Active
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Read-Only Non-clickable Table Badge (Client Can't Change Table) */}
            <div className="bg-slate-950 text-white px-3 py-1.5 rounded-xl text-xs font-semibold tracking-tight flex items-center space-x-1 border border-slate-800 select-none">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="hidden sm:inline">Table</span>
              <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded-md font-mono font-black text-[10px]">
                {tableNumber}
              </span>
            </div>

            {/* Bill & Status Button */}
            <button
              id="view-my-bill-btn"
              onClick={() => setIsBillOpen(true)}
              className="bg-orange-100 hover:bg-orange-200 text-orange-950 border border-orange-200/80 px-3 py-1.5 rounded-xl text-xs font-extrabold tracking-tight transition-all flex items-center space-x-1 cursor-pointer active:scale-95"
            >
              <Receipt className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span>My Bill & Status</span>
              {myPlacedOrders.length > 0 && (
                <span className="bg-orange-600 text-white px-1.5 py-0.2 rounded-full font-mono text-[9px] font-black">
                  {myPlacedOrders.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main id="client-main-content" className="max-w-4xl mx-auto px-4 py-6">
        
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-display font-extrabold text-slate-900 leading-tight">
            Menu Gastronomique
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse our artisanal selection of local dishes, house-crafted signature food, and classic elixirs. Ordered items are prepared fresh.
          </p>
        </div>

        {/* Categories Scroller Tab-Bar */}
        <div className="flex items-center space-x-1 border-b border-slate-200 pb-px mb-6 overflow-x-auto scrollbar-none">
          <button
            id="cat-tab-all"
            onClick={() => { setSelectedCategory("All"); }}
            className={`py-2.5 px-5 text-sm font-semibold whitespace-nowrap rounded-t-xl transition-all border-b-2 -mb-px flex items-center gap-1.5 ${
              selectedCategory === "All"
                ? "border-orange-500 text-orange-600 font-bold bg-orange-500/5"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            All Items
          </button>
          <button
            id="cat-tab-food"
            onClick={() => { setSelectedCategory("Food"); }}
            className={`py-2.5 px-5 text-sm font-semibold whitespace-nowrap rounded-t-xl transition-all border-b-2 -mb-px flex items-center gap-1.5 ${
              selectedCategory === "Food"
                ? "border-orange-500 text-orange-600 font-bold bg-orange-500/5"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            Food Menu
          </button>
          <button
            id="cat-tab-drinks"
            onClick={() => { setSelectedCategory("Drinks"); }}
            className={`py-2.5 px-5 text-sm font-semibold whitespace-nowrap rounded-t-xl transition-all border-b-2 -mb-px flex items-center gap-1.5 ${
              selectedCategory === "Drinks"
                ? "border-orange-500 text-orange-600 font-bold bg-orange-500/5"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <GlassWater className="w-3.5 h-3.5" />
            Drinks & Fine Wine
          </button>
        </div>

        {/* Dynamic Filters with Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-6">
          <span className="text-[10px] text-slate-400 font-medium mr-1 uppercase tracking-wider">Quick Filters:</span>
          {[
            { tag: "Veg", label: "🥦 Vegetarian" },
            { tag: "NonVeg", label: "🍗 Non-Vegetarian" },
            { tag: "Fav", label: "⭐ Popular" }
          ].map((item) => (
            <button
              key={item.tag}
              id={`tag-filter-${item.tag}`}
              onClick={() => setDietaryFilter(dietaryFilter === item.tag ? null : item.tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                dietaryFilter === item.tag
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {item.label}
            </button>
          ))}
          {dietaryFilter && (
            <button
              id="clear-dietary-filter"
              onClick={() => setDietaryFilter(null)}
              className="text-orange-600 hover:text-orange-800 text-xs px-2 py-1 font-semibold"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Search Input Box */}
        <div className="mb-8">
          <input
            id="item-search-input"
            type="text"
            placeholder="Search delicacies (e.g., truffle, taco, cocktail)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200/80 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/20 focus:border-slate-950 transition-all"
          />
        </div>

        {/* Menu Listings */}
        {filteredItems.length === 0 ? (
          <div id="no-items-state" className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-medium">No delicacies found matching filters.</p>
            <button
              id="reset-all-filters-btn"
              onClick={() => {
                setSearchQuery("");
                setDietaryFilter(null);
                setSelectedCategory("All");
              }}
              className="mt-3.5 inline-block text-xs font-bold text-slate-900 border-b border-slate-900 pb-0.5 hover:text-orange-600 hover:border-orange-600 transition-colors"
            >
              Reset view & see all items
            </button>
          </div>
        ) : (
          <div id="menu-items-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const inCart = cart.find(c => c.menuItem.id === item.id);
              return (
                <motion.div
                  key={item.id}
                  id={`item-card-${item.id}`}
                  layout
                  className="bg-white rounded-2xl border border-slate-200/60 p-4.5 hover:border-slate-300/80 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Badge line */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex flex-wrap items-center gap-1">
                        {item.popular && (
                          <span className="inline-flex items-center gap-0.5 bg-orange-50 text-orange-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            <Sparkles className="w-2.5 h-2.5 stroke-[2.5]" />
                            POPULAR
                          </span>
                        )}
                        {item.isVegetarian ? (
                          <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            VEGETARIAN
                          </span>
                        ) : item.category === "Food" ? (
                          <span className="bg-orange-100 text-orange-950 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            NON-VEGETARIAN
                          </span>
                        ) : null}
                        {item.isGlutenFree && (
                          <span className="bg-sky-50 text-sky-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            GLUTEN-FREE
                          </span>
                        )}
                      </div>
                      {item.imageEmoji && (item.imageEmoji.startsWith("http") || item.imageEmoji.startsWith("data:image")) ? (
                        <img 
                          src={item.imageEmoji} 
                          alt={item.name} 
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover rounded-xl shadow-xs border border-slate-100 shrink-0" 
                        />
                      ) : (
                        <span className="text-xl min-w-10 h-10 bg-slate-100/50 border border-slate-100/60 rounded-xl flex items-center justify-center select-none shrink-0 font-sans">
                          {item.imageEmoji || "🍽️"}
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-bold text-base text-slate-900 group-hover:text-orange-600">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 md:line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-display text-base font-extrabold text-slate-900">
                      RS. {item.price.toFixed(2)}
                    </span>

                    {inCart ? (
                      <div className="flex items-center bg-slate-950 text-white rounded-xl py-1 px-1.5 shadow-sm">
                        <button
                          id={`decrease-qty-${item.id}`}
                          onClick={() => handleDecreaseQuantity(item)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 font-mono text-sm font-bold min-w-5 text-center">
                          {inCart.quantity}
                        </span>
                        <button
                          id={`increase-qty-${item.id}`}
                          onClick={() => handleAddToCart(item)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`add-to-cart-btn-${item.id}`}
                        onClick={() => handleAddToCart(item)}
                        className="bg-slate-950 text-white hover:bg-slate-800 active:scale-95 text-xs font-bold py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* STICKY BOTTOM BAR FOR CART PREVIEW */}
      <AnimatePresence>
        {cartCount > 0 && !isCartOpen && (
          <motion.div
            id="client-sticky-cart-bar"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 bg-gradient-to-t from-slate-100 to-transparent pointer-events-none"
          >
            <div className="max-w-md mx-auto bg-slate-950 text-white rounded-2xl shadow-xl shadow-slate-950/20 p-4.5 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center space-x-3.5">
                <div className="relative w-11 h-11 bg-orange-500 text-slate-950 font-bold rounded-xl flex items-center justify-center shadow-inner">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold ring-2 ring-slate-910">
                    {cartCount}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] text-slate-300 font-medium">Bistro order total</p>
                  <p className="font-display font-extrabold text-base text-orange-400">
                    RS. {cartSubtotal.toFixed(2)}
                  </p>
                </div>
              </div>

              <button
                id="view-cart-sticky-btn"
                onClick={() => setIsCartOpen(true)}
                className="bg-orange-500 hover:bg-orange-400 text-slate-950 font-display font-extrabold text-xs tracking-wide py-3 px-5 rounded-xl transition-colors cursor-pointer flex items-center gap-1 active:translate-y-0.5"
              >
                <span>View Cart</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CART OVERLAY / SIDE-PANEL / MODAL VIEW */}
      <AnimatePresence>
        {isCartOpen && (
          <div id="cart-drawer-backdrop" className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end">
            {/* Click backdrop to close */}
            <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

            {/* Panel Card */}
            <motion.div
              id="cart-drawer-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-white h-full flex flex-col justify-between z-10 shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900">Your Fresh Order</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Table Number: <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">{tableNumber}</span>
                  </p>
                </div>
                <button
                  id="close-cart-drawer-btn"
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List Scroll Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-20">
                    <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 text-sm">Your order is empty right now.</p>
                    <button
                      id="cart-empty-browse-btn"
                      onClick={() => setIsCartOpen(false)}
                      className="mt-4 bg-slate-950 text-white text-xs font-bold py-2.5 px-5 rounded-xl"
                    >
                      Browse Delicacies
                    </button>
                  </div>
                ) : (
                  cart.map((cartItem) => {
                    const itemTotal = cartItem.menuItem.price * cartItem.quantity;
                    return (
                      <div
                        key={cartItem.menuItem.id}
                        id={`cart-item-${cartItem.menuItem.id}`}
                        className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0"
                      >
                        <div className="flex-1">
                          <div className="flex items-baseline space-x-1.5">
                            <span className="text-sm font-display font-medium text-slate-400">{cartItem.menuItem.imageEmoji}</span>
                            <h4 className="font-display font-bold text-sm text-slate-900">{cartItem.menuItem.name}</h4>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">RS. {cartItem.menuItem.price.toFixed(2)} each</p>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="flex items-center bg-slate-100 rounded-lg py-1 px-1">
                            <button
                              id={`cart-decrease-${cartItem.menuItem.id}`}
                              onClick={() => handleDecreaseQuantity(cartItem.menuItem)}
                              className="p-1 hover:bg-white text-slate-600 rounded-md transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 font-mono text-xs font-bold text-slate-800 min-w-4 text-center">
                              {cartItem.quantity}
                            </span>
                            <button
                              id={`cart-increase-${cartItem.menuItem.id}`}
                              onClick={() => handleAddToCart(cartItem.menuItem)}
                              className="p-1 hover:bg-white text-slate-600 rounded-md transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right min-w-16">
                            <span className="font-mono text-sm font-bold text-slate-900">RS. {itemTotal.toFixed(2)}</span>
                          </div>

                          <button
                            id={`cart-remove-${cartItem.menuItem.id}`}
                            onClick={() => handleClearCartItem(cartItem.menuItem.id)}
                            className="p-1 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Staff note box */}
                {cart.length > 0 && (
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <label id="staff-note-label" className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mb-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      Add prep instructions (optional):
                    </label>
                    <textarea
                      id="staff-note-textarea"
                      placeholder="E.g., No chili on the noodles, extra napkins, draft water please..."
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      rows={2}
                      className="w-full text-xs bg-slate-50 border border-slate-200/80 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:bg-white text-slate-700 transition-all placeholder:text-slate-400"
                    />
                  </div>
                )}
              </div>

              {/* Drawer Sticky Footer Checkout Box */}
              {cart.length > 0 && (
                <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4">
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>Total items</span>
                      <span className="font-mono">{cartCount} items</span>
                    </div>
                    <div className="flex justify-between font-display text-base font-extrabold text-slate-800 pt-2 border-t border-slate-200">
                      <span>Live Grand Total</span>
                      <span className="font-mono text-orange-500">RS. {cartSubtotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    id="place-order-drawer-btn"
                    onClick={handlePlaceOrderSubmit}
                    disabled={isSubmitting}
                    className={`w-full py-3.5 rounded-xl font-display font-bold text-sm tracking-wide text-white transition-all shadow-md flex items-center justify-center space-x-2 ${
                      isSubmitting
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-100 active:translate-y-0.5 cursor-pointer"
                    }`}
                  >
                    <span>{isSubmitting ? "Sending to kitchen..." : "Confirm & Place Order"}</span>
                  </button>
                  <p className="text-[10px] text-center text-slate-400">
                    Confirming will instantly transmit order details to the kitchen dashboard.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ORDER PLACEMENT SUCCESS MODAL POPUP */}
      <AnimatePresence>
        {showOrderSuccess && (
          <div id="success-modal-backdrop" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              id="success-modal-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full text-center border border-slate-200 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
              
              <div className="w-12 h-12 bg-emerald-50 text-emerald-605 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="w-6 h-6 stroke-[2.5]" />
              </div>

              <h3 className="font-display font-extrabold text-xl text-slate-900 leading-tight">Order Transmitted!</h3>
              
              {lastPlacedOrderId && (
                <div className="mt-2.5 inline-block bg-slate-50 border border-slate-100 text-xs font-mono font-bold text-slate-605 text-slate-600 py-1 px-3 rounded-full">
                  Reference: {lastPlacedOrderId}
                </div>
              )}

              <p className="text-xs text-slate-500 mt-3.5 max-w-xs mx-auto">
                Your order is safely in the queue for table <span className="font-bold text-slate-800">{tableNumber}</span>. The kitchen has begun preparing your fresh selections.
              </p>

              <button
                id="success-modal-dismiss-btn"
                onClick={() => setShowOrderSuccess(false)}
                className="mt-6 w-full py-3 bg-slate-950 hover:bg-slate-800 text-white font-display font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm hover:shadow active:scale-95"
              >
                Continue Ordering
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BILL & ORDERS LIST DRAWER OVERLAY */}
      <AnimatePresence>
        {isBillOpen && (
          <div id="bill-drawer-backdrop" className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end">
            <div className="absolute inset-0" onClick={() => setIsBillOpen(false)} />

            <motion.div
              id="bill-drawer-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-white h-full flex flex-col justify-between z-10 shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-1.5">
                    <Receipt className="w-5 h-5 text-orange-500" />
                    <span>My Running Bill & Orders</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live table tracking statement • <span className="font-bold text-slate-800 bg-slate-100 px-1 py-0.2 rounded font-mono">Table {tableNumber}</span>
                  </p>
                </div>
                <button
                  id="close-bill-drawer-btn"
                  onClick={() => setIsBillOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-705 bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Receipt Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
                {myPlacedOrders.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-3 border border-slate-100">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <h4 className="font-display font-bold text-slate-800">No orders placed yet</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                      As soon as you add delicacies to your cart and hit "Confirm & Place Order", your live dining ticket and billing records will populate here in real-time.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Running Consolidated Balance Block */}
                    <div className="bg-slate-950 text-white rounded-2xl p-5 shadow-lg border border-slate-800 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-xl" />
                      <span className="text-[10px] tracking-wider text-slate-400 uppercase font-black block">
                        Accumulated Table Bill
                      </span>
                      <span className="text-3xl md:text-4xl font-display font-black tracking-tight text-white block mt-1.5">
                        RS. {overallBillTotal.toFixed(2)}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1.5 italic">
                        Sum total across {myPlacedOrders.length} placed order {myPlacedOrders.length === 1 ? 'ticket' : 'tickets'} this session.
                      </p>
                    </div>

                    {/* Consolidated Items ordered Summary Receipt */}
                    <div className="space-y-3">
                      <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                        Itemized Billing Summary
                      </h4>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-3">
                        {aggregatedItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-start text-xs border-b border-dashed border-slate-200 pb-2.5 last:border-0 last:pb-0">
                            <div>
                              <span className="font-bold text-slate-900">
                                {item.name}
                              </span>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {item.quantity} x RS. {item.price.toFixed(2)}
                              </p>
                            </div>
                            <span className="font-mono font-bold text-slate-800">
                              RS. {(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ticket statuses Area */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                        Dining ticket timeline & history
                      </h4>
                      <div className="space-y-3">
                        {myPlacedOrders.map((order) => {
                          let statusColor = "bg-amber-100 text-amber-800 border-amber-200";
                          let statusLabel = "Awaiting Preparation";
                          if (order.status === "Preparing") {
                            statusColor = "bg-orange-500 text-white border-orange-600 font-bold";
                            statusLabel = "Chef Preparing";
                          } else if (order.status === "Served") {
                            statusColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
                            statusLabel = "Served & Plated";
                          } else if (order.status === "Completed") {
                            statusColor = "bg-slate-100 text-slate-700 border-slate-200";
                            statusLabel = "Cleared / Settled";
                          }

                          return (
                            <div key={order.id} className="border border-slate-200/85 rounded-xl p-4 space-y-2.5 hover:border-slate-300 transition-colors bg-white shadow-xs">
                              <div className="flex justify-between items-center text-[11px]">
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-mono font-black text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded text-xs select-all">
                                    {order.id}
                                  </span>
                                  <span className="text-slate-400">
                                    {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${statusColor}`}>
                                  {statusLabel}
                                </span>
                              </div>

                              <ul className="text-xs text-slate-705 text-slate-700 space-y-1.5">
                                {order.items.map((it, itIdx) => (
                                  <li key={itIdx} className="flex justify-between">
                                    <span>
                                      <strong className="font-mono text-[9px] text-slate-500 bg-slate-100 py-0.2 px-1 rounded mr-1">
                                        {it.quantity}x
                                      </strong>
                                      {it.name}
                                    </span>
                                    <span className="font-mono text-slate-400 font-bold text-[11px]">RS. {(it.price * it.quantity).toFixed(2)}</span>
                                  </li>
                                ))}
                              </ul>
                              
                              {order.note && (
                                <div className="p-2 bg-amber-50/50 border border-amber-100 rounded-lg text-[10px] text-amber-800 italic flex items-center gap-1">
                                  <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  <span>"{order.note}"</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Drawer footer close button */}
              <div className="p-4.5 border-t border-slate-100 bg-slate-50">
                <button
                  id="bill-drawer-footer-dismiss-btn"
                  onClick={() => setIsBillOpen(false)}
                  className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white font-display font-bold text-xs rounded-xl text-center cursor-pointer shadow-sm active:scale-[0.98] transition-all"
                >
                  Close Bill Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

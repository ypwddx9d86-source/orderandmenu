import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Order, OrderStatus, MenuItem } from "../types";
import { 
  Check, 
  Clock, 
  Coffee, 
  Trash2, 
  DollarSign, 
  Grid, 
  Plus, 
  Utensils, 
  FileText,
  Activity,
  Sparkles,
  TrendingUp,
  Flame,
  Smartphone,
  ChevronRight,
  History,
  Search,
  Bell,
  X,
  Lock,
  LogOut,
  Database,
  Receipt
} from "lucide-react";

interface AdminDashboardProps {
  orders: Order[];
  historyOrders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onClearOrder: (orderId: string) => void;
  onAddSampleOrder: () => void;
  onResetAllData: () => void;
  menuItems: MenuItem[];
  onAddMenuItem: (newItem: MenuItem) => void;
  onDeleteMenuItem: (itemId: string) => void;
  onResetMenuItems: () => void;
  onSimulatePopularOrder?: (itemId: string, count: number) => void;
}

// Custom hook to force rerender every 10 seconds to update dynamic time elapsed timers
function useTimerTicks() {
  const [ticks, setTicks] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTicks(t => t + 1);
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);
  return ticks;
}

// Synthesize pleasant double-chime with Web Audio API for new orders
function playNewOrderSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play warm pleasant dual chime
    const playBeep = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playBeep(587.33, now, 0.15); // D5
    playBeep(880.00, now + 0.12, 0.25); // A5
  } catch (err) {
    console.warn("Audio Context blocked or failed to play: ", err);
  }
}

interface MenuCreatorFormProps {
  onAddMenuItem: (newItem: MenuItem) => void;
}

function MenuCreatorForm({ onAddMenuItem }: MenuCreatorFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"Food" | "Drinks">("Food");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  
  // Image type selection: 'emoji' | 'url'
  const [imageType, setImageType] = useState<"emoji" | "url">("emoji");
  const [imageEmoji, setImageEmoji] = useState("🍔");
  const [imageUrl, setImageUrl] = useState("");

  const [popular, setPopular] = useState(false);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);

  const [message, setMessage] = useState("");

  const presetEmojis = ["🍔", "🍕", "🥗", "🌮", "🍜", "🍰", "🍩", "🍄", "🥩", "🍣", "🥓", "🥐", "🍹", "🥃", "🍷", "☕", "🍺", "🥤", "🥛", "🍯"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !description.trim()) {
      setMessage("Please fill in name, description, and price.");
      return;
    }

    const itemPrice = parseFloat(price);
    if (isNaN(itemPrice) || itemPrice <= 0) {
      setMessage("Please enter a valid price greater than RS. 0.");
      return;
    }

    const newItem: MenuItem = {
      id: (category === "Food" ? "f" : "d") + "_" + Math.floor(Date.now() + Math.random() * 1000),
      name: name.trim(),
      description: description.trim(),
      price: itemPrice,
      category,
      popular,
      isVegetarian,
      isGlutenFree,
      imageEmoji: imageType === "emoji" ? imageEmoji : imageUrl.trim() || "🍽️"
    };

    onAddMenuItem(newItem);
    
    // reset form fields
    setName("");
    setPrice("");
    setDescription("");
    setImageUrl("");
    setPopular(false);
    setIsVegetarian(false);
    setIsGlutenFree(false);
    setMessage("Delicacy added successfully!");
    
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
          Delicacy Name *
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Flame Grilled Ribeye Steak"
          className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all font-sans"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
            Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as "Food" | "Drinks")}
            className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-xl px-2 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all cursor-pointer font-sans"
          >
            <option value="Food">🍲 Food Menu</option>
            <option value="Drinks">🍹 Drinks / Wine</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
            Price (RS.) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0.10"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 14.50"
            className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all font-mono"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
          Short Description *
        </label>
        <textarea
          required
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe ingredients, rich taste, serving suggestions..."
          className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all resize-none font-sans"
        />
      </div>

      <div>
        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1.5">
          Photo Asset Type
        </label>
        <div className="flex bg-slate-200/60 p-1 rounded-xl mb-2.5">
          <button
            type="button"
            onClick={() => setImageType("emoji")}
            className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${imageType === "emoji" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
          >
            Preset Emoji Icons
          </button>
          <button
            type="button"
            onClick={() => setImageType("url")}
            className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${imageType === "url" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
          >
            Photo URL Link
          </button>
        </div>

        {imageType === "emoji" ? (
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-2xl bg-white border border-slate-200 rounded-xl w-10.5 h-10.5 flex items-center justify-center shrink-0">
                {imageEmoji}
              </span>
              <input
                type="text"
                maxLength={4}
                value={imageEmoji}
                onChange={(e) => setImageEmoji(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all"
                placeholder="Or type custom emoji"
              />
            </div>
            <div className="grid grid-cols-10 gap-1 bg-white p-2 rounded-xl border border-slate-150">
              {presetEmojis.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setImageEmoji(em)}
                  className={`text-sm hover:bg-slate-100 rounded p-1 transition-colors ${imageEmoji === em ? "bg-orange-100 border border-orange-200 scale-110 font-bold" : "border border-transparent"}`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="e.g. https://images.unsplash.com/photo-..."
              className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all font-mono text-[10px]"
            />
            <p className="text-[9px] text-slate-400 leading-normal">
              Paste any public direct photo URL. Standard sizing will adapt dynamically on client devices.
            </p>
          </div>
        )}
      </div>

      {category === "Food" && (
        <div>
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1.5">
            Food Diet Classification *
          </label>
          <div className="flex bg-slate-100 p-1 rounded-xl mb-3 border border-slate-200">
            <button
              type="button"
              onClick={() => setIsVegetarian(true)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                isVegetarian 
                  ? "bg-emerald-600 text-white shadow-sm" 
                  : "bg-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>🥦 Vegetarian</span>
            </button>
            <button
              type="button"
              onClick={() => setIsVegetarian(false)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                !isVegetarian 
                  ? "bg-rose-600 text-white shadow-sm" 
                  : "bg-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>🍗 Non-Vegetarian</span>
            </button>
          </div>
        </div>
      )}

      <div>
        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1.5">
          Delicacy Dietary Tags
        </label>
        <div className="bg-white border border-slate-200 rounded-xl p-2.5">
          <label className="flex items-center space-x-2 text-[11px] font-medium text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={popular}
              onChange={(e) => setPopular(e.target.checked)}
              className="rounded text-orange-500 focus:ring-orange-500/30"
            />
            <span>⭐ Popular / Fav (Featured Item)</span>
          </label>
        </div>
      </div>

      {message && (
        <div className={`p-2.5 rounded-xl text-xs text-center border font-bold ${message.includes("success") ? "bg-emerald-50 text-emerald-700 border-emerald-100 animate-pulse" : "bg-rose-50 text-rose-700 border-rose-100"}`}>
          {message}
        </div>
      )}

      <button
        type="submit"
        className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 font-display font-bold text-xs text-slate-950 rounded-xl tracking-wider uppercase transition-all shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-[0.98] cursor-pointer"
      >
        Publish to Client Menu
      </button>
    </form>
  );
}

interface MenuListSectionProps {
  menuItems: MenuItem[];
  onDeleteMenuItem: (id: string) => void;
  onSimulatePopularOrder?: (itemId: string, count: number) => void;
}

function MenuListSection({ menuItems, onDeleteMenuItem, onSimulatePopularOrder }: MenuListSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"All" | "Food" | "Drinks">("All");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = menuItems.filter(item => {
    if (categoryFilter !== "All" && item.category !== categoryFilter) return false;
    return item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           item.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Search and Category Filter Header */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between">
        <input
          type="text"
          placeholder="Search catalog by keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 transition-all flex-1"
        />

        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 self-start sm:self-center">
          {(["All", "Food", "Drinks"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                categoryFilter === cat
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Delicacies catalog list (scrollable bento container) */}
      <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1.5 scrollbar-thin flex-1">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-slate-100 p-8">
            <p className="text-xs text-slate-400 italic">No menu items found in this section.</p>
          </div>
        ) : (
          filtered.map((item) => {
            const isUrl = item.imageEmoji && (item.imageEmoji.startsWith("http") || item.imageEmoji.startsWith("data:image"));
            return (
              <div 
                key={item.id}
                className="border border-slate-150 rounded-xl p-3 bg-white flex items-start justify-between gap-3 hover:border-orange-200 hover:shadow-xs transition-all"
              >
                <div className="flex items-start space-x-3">
                  {/* Image/Photo */}
                  {isUrl ? (
                    <img 
                      src={item.imageEmoji} 
                      alt={item.name} 
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 object-cover rounded-xl shadow-xs border border-slate-100 shrink-0" 
                    />
                  ) : (
                    <span className="text-xl w-11 h-11 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0 select-none font-sans">
                      {item.imageEmoji || "🍽️"}
                    </span>
                  )}

                  {/* Text details */}
                  <div className="space-y-0.5 max-w-[200px] sm:max-w-[240px]">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 leading-tight">{item.name}</span>
                      <span className="text-[8px] px-1 select-none border border-slate-100 font-mono text-slate-400 rounded bg-slate-50 uppercase leading-relaxed font-bold">
                        {item.category}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                      {item.description}
                    </p>

                    {/* Badge flags row */}
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      {item.isVegetarian ? (
                        <span className="bg-emerald-50 text-emerald-600 text-[8px] font-bold px-1 rounded">Veg</span>
                      ) : item.category === "Food" ? (
                        <span className="bg-orange-105 bg-orange-100 text-orange-700 text-[8px] font-bold px-1 rounded">Non-Veg</span>
                      ) : null}
                      {item.isGlutenFree && (
                        <span className="bg-sky-50 text-sky-600 text-[8px] font-bold px-1 rounded font-semibold">GF</span>
                      )}
                      {item.popular && (
                        <span className="bg-orange-50 text-orange-600 text-[8px] font-bold px-1 rounded">Popular</span>
                      )}
                      {typeof (item as any).orderCount === "number" && (
                        <span className="bg-slate-100 text-slate-500 text-[8px] font-bold px-1 rounded">
                          {(item as any).orderCount} Sold
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right price and delete action */}
                <div className="flex flex-col items-end justify-between self-stretch shrink-0 gap-2">
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-mono text-xs font-black text-slate-900 bg-orange-50 border border-orange-100/60 px-2 py-0.5 rounded-lg">
                      RS. {item.price.toFixed(2)}
                    </span>
                    {onSimulatePopularOrder && (
                      <button
                        onClick={() => onSimulatePopularOrder(item.id, 105)}
                        className="text-[9px] text-orange-700 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 border border-orange-200/40 px-1.5 py-0.5 rounded font-black transition-all cursor-pointer"
                        title="Simulate 105 orders to make this item Popular!"
                      >
                        ⚡ Sim +105 Ord
                      </button>
                    )}
                  </div>

                  {confirmDeleteId === item.id ? (
                    <div className="flex items-center space-x-1 border border-rose-200 bg-rose-50/50 p-1 rounded-lg animate-pulse">
                      <span className="text-[9px] font-bold text-rose-700 uppercase tracking-widest px-1">Delete?</span>
                      <button
                        onClick={() => {
                          onDeleteMenuItem(item.id);
                          setConfirmDeleteId(null);
                        }}
                        className="text-[10px] font-black text-white bg-rose-600 hover:bg-rose-700 px-1.5 py-0.5 rounded cursor-pointer transition-all"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer transition-all"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="p-1 hover:bg-rose-50 text-slate-300 hover:text-rose-600 rounded transition-colors cursor-pointer animate-none"
                      title="Delete Delicacy"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard({
  orders,
  historyOrders,
  onUpdateOrderStatus,
  onClearOrder,
  onAddSampleOrder,
  onResetAllData,
  menuItems,
  onAddMenuItem,
  onDeleteMenuItem,
  onResetMenuItems,
  onSimulatePopularOrder
}: AdminDashboardProps) {
  // Use ticks to trigger state refresh for timestamps dynamically
  useTimerTicks();

  // Secure Admin Authentication state (persisted per session)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("bistro_admin_authenticated") === "true";
    } catch {
      return false;
    }
  });
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  const anyMeta = import.meta as any;
  const EXPECTED_USERNAME = (anyMeta.env && anyMeta.env.VITE_ADMIN_USERNAME) || "admin";
  const EXPECTED_PASSWORD = (anyMeta.env && anyMeta.env.VITE_ADMIN_PASSWORD) || "bistro123";

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput === EXPECTED_USERNAME && passwordInput === EXPECTED_PASSWORD) {
      setIsAdminAuthenticated(true);
      setLoginError("");
      try {
        sessionStorage.setItem("bistro_admin_authenticated", "true");
      } catch (err) {
        console.error(err);
      }
    } else {
      setLoginError("Invalid administrator credentials. Please check your username and password.");
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setUsernameInput("");
    setPasswordInput("");
    try {
      sessionStorage.removeItem("bistro_admin_authenticated");
    } catch (err) {
      console.error(err);
    }
  };

  // Active navigation tab inside the Admin Dashboard: "live" (kitchen bento) vs "history" (order history) vs "tables" (table records) vs "menu" (food & drinks menu options)
  const [activePanel, setActivePanel] = useState<"live" | "history" | "tables" | "menu">("live");

  // Table records search selection
  const [selectedInspectTable, setSelectedInspectTable] = useState<string | null>(null);

  // Dynamic filter for active orders ("All active" | "Pending" | "Preparing")
  const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "Preparing">("All");

  // Filter query inside order history
  const [historySearchQuery, setHistorySearchQuery] = useState("");

  // Tracking loaded orders list to detect dynamic newly received order events
  const [knownOrderIds, setKnownOrderIds] = useState<string[]>(() => orders.map(o => o.id));

  // State to handle incoming new order alerts & visual flashing overlay
  const [showNotification, setShowNotification] = useState(false);
  const [notifiedOrder, setNotifiedOrder] = useState<Order | null>(null);

  // Monitor orders to detect new incoming tickets (placed via customer menu or simulated)
  useEffect(() => {
    const currentIds = orders.map(o => o.id);
    
    // Check if there is any order ID that we didn't know about previously
    const brandNewOrders = orders.filter(o => !knownOrderIds.includes(o.id));
    
    if (brandNewOrders.length > 0) {
      // Pick the newest one
      const newest = brandNewOrders[brandNewOrders.length - 1];
      
      // Update our recognized list of order IDs immediately
      setKnownOrderIds(currentIds);

      // Verify if order's timestamp is fresh (e.g. placed within the last 15 seconds)
      // This is crucial to prevent triggering on initial load or browser refresh
      const elapsedSeconds = (Date.now() - new Date(newest.timestamp).getTime()) / 1000;
      if (elapsedSeconds < 15) {
        setNotifiedOrder(newest);
        setShowNotification(true);
        playNewOrderSound();
      }
    } else {
      // If a ticket is cleared/archived out, we sync the known selection cleanly
      const isListDivergent = currentIds.some(id => !knownOrderIds.includes(id)) || knownOrderIds.some(id => !currentIds.includes(id));
      if (isListDivergent) {
        setKnownOrderIds(currentIds);
      }
    }
  }, [orders, knownOrderIds]);

  // Format Elapsed Time string
  const getElapsedMinutes = (isoString: string) => {
    const parsed = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - parsed.getTime();
    
    if (diffMs < 0) return "0m ago";
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) {
      return "Just now";
    }
    if (diffMins >= 60) {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m ago`;
    }
    return `${diffMins}m ago`;
  };

  // Helper colors for order statuses
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return { text: "Pending Kitchen", classes: "bg-amber-100 text-amber-800 border-amber-200" };
      case "Preparing":
        return { text: "Preparing", classes: "bg-orange-500 text-white border-orange-600 font-bold" };
      case "Served":
        return { text: "Served", classes: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      case "Completed":
        return { text: "Cleared", classes: "bg-slate-100 text-slate-800 border-slate-200" };
    }
  };

  // Filter main active orders board input (only pending and preparing show on live queue board)
  const filteredActiveOrders = orders.filter((order) => {
    if (filterStatus === "All") return order.status === "Pending" || order.status === "Preparing";
    return order.status === filterStatus;
  });

  // Filter history orders based on search query
  const filteredHistoryOrders = historyOrders.filter((order) => {
    if (!historySearchQuery.trim()) return true;
    const query = historySearchQuery.toLowerCase();
    
    const tableMatch = order.tableNumber.toLowerCase().includes(query);
    const idMatch = order.id.toLowerCase().includes(query);
    const itemMatch = order.items.some(it => it.name.toLowerCase().includes(query));
    const noteMatch = order.note ? order.note.toLowerCase().includes(query) : false;
    
    return tableMatch || idMatch || itemMatch || noteMatch;
  });

  // Calculate statistics across active & historical lists
  const pendingCount = orders.filter(o => o.status === "Pending").length;
  const preparingCount = orders.filter(o => o.status === "Preparing").length;
  const servedCount = historyOrders.filter(o => o.status === "Served").length;
  const clearedCount = historyOrders.filter(o => o.status === "Completed").length;

  // Total sales balance
  const totalRevenue = orders.filter(o => o.status === "Preparing").reduce((acc, o) => acc + o.totalPrice, 0) +
    historyOrders.reduce((acc, o) => acc + o.totalPrice, 0);

  // Active tickets load index logic
  const activeCountOverall = orders.length;
  const mockCapacityPercentage = Math.min(100, Math.max(15, activeCountOverall * 15 + 20));

  if (!isAdminAuthenticated) {
    return (
      <div id="admin-login-container" className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 p-4 md:p-8 font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent pointer-events-none" />
        
        {/* Brand Header */}
        <header className="max-w-md w-full mx-auto flex items-center justify-between pt-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-slate-950 font-display font-extrabold text-base shadow-lg shadow-orange-500/10">
              LJ
            </div>
            <div>
              <h2 className="font-display font-black text-slate-100 tracking-tight leading-tight">Le Jardin</h2>
              <span className="text-[10px] text-orange-400 font-mono tracking-wider font-bold">OWNER ACCESS ONLY</span>
            </div>
          </div>
        </header>

        {/* Centered Card */}
        <main className="max-w-md w-full mx-auto my-auto py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 to-amber-500" />
            
            <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center mb-6 border border-orange-500/20">
              <Lock className="w-5 h-5 stroke-[2]" />
            </div>

            <div className="space-y-1 mb-6">
              <h1 className="font-display font-black text-2xl tracking-tight text-white">Kitchen Dashboard Secure Login</h1>
              <p className="text-xs text-slate-400">
                Authorized restaurant staff authentication gateway.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                  Admin Username
                </label>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full bg-slate-950 border border-slate-800/80 hover:border-slate-700/80 focus:border-orange-500/60 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                  Dashboard Password
                </label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800/80 hover:border-slate-700/80 focus:border-orange-500/60 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all font-mono"
                />
              </div>

              {loginError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 leading-relaxed font-semibold">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-slate-950 font-display font-black text-xs rounded-xl tracking-wider uppercase transition-all shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 cursor-pointer active:scale-95 flex items-center justify-center space-x-2"
              >
                <span>Unlock Kitchen Logs</span>
                <ChevronRight className="w-4 h-4 ml-1 shrink-0 stroke-[2.5]" />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-800/50 space-y-2.5">
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">
                Deployment Settings & Credentials Guide
              </span>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                Credentials are secure. You can customize them in your environment settings (Vercel, Cloud Run or `.env` files) via these secret parameters:
              </p>
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 space-y-1 text-[9px] font-mono text-slate-500 select-all">
                <div className="flex justify-between">
                  <span className="text-orange-400">VITE_ADMIN_USERNAME</span>
                  <span>= "admin" (default)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-400">VITE_ADMIN_PASSWORD</span>
                  <span>= "bistro123" (default)</span>
                </div>
              </div>
            </div>
          </motion.div>
        </main>

        <footer className="max-w-md w-full mx-auto text-center pb-4 animate-fade-in">
          <p className="text-[10px] text-slate-600">
            Le Jardin Culinary group • Protected under secure token configuration
          </p>
        </footer>
      </div>
    );
  }

  const allKnownTables = Array.from(new Set([
    ...orders.map(o => o.tableNumber),
    ...historyOrders.map(o => o.tableNumber)
  ])).sort();

  return (
    <div id="admin-dashboard-container" className="min-h-screen bg-slate-50 text-slate-900 pb-20 relative font-sans">
      
      {/* 🚨 AUDIO VISUAL FLASHING OVERLAY ALERTS */}
      <AnimatePresence>
        {showNotification && (
          <>
            {/* Pulsating screen border flashing effect */}
            <div className="fixed inset-0 border-[6px] md:border-[10px] border-orange-500 animate-[pulse_1s_infinite] pointer-events-none z-[999] rounded-none" />

            {/* Float layout notification dialogue card */}
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-900 border-2 border-orange-500 text-white rounded-2xl shadow-[0_20px_50px_rgba(249,115,22,0.3)] p-5 z-[1000] w-[92%] max-w-md overflow-hidden"
            >
              {/* Animated progress bar countdown */}
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-orange-400 to-amber-500 animate-[shrink_4s_linear] w-full" />
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes shrink {
                  from { width: 100%; }
                  to { width: 0%; }
                }
              `}} />

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 bg-orange-500 text-slate-950 font-bold rounded-xl flex items-center justify-center animate-bounce">
                    <Bell className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-orange-400 block">
                      New guest ticket received!
                    </span>
                    <h4 className="font-display font-black text-lg text-white leading-tight">
                      Table {notifiedOrder?.tableNumber}
                    </h4>
                  </div>
                </div>

                <button 
                  onClick={() => setShowNotification(false)}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3.5 pt-3.5 border-t border-white/10 space-y-2">
                <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1.5 scrollbar-thin">
                  {notifiedOrder?.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-xs">
                      <span className="text-slate-200">
                        <strong className="font-mono text-orange-400 mr-1.5">{item.quantity}x</strong>
                        {item.name}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">RS. {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {notifiedOrder?.note && (
                  <div className="p-2 bg-white/5 border border-white/10 rounded-lg mt-2 flex gap-1.5 items-start">
                    <FileText className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-amber-200 italic leading-snug">{notifiedOrder.note}</p>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5 font-mono text-slate-400">
                  <span>Ticket Total</span>
                  <span className="text-sm font-bold text-white">RS. {notifiedOrder?.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setShowNotification(false);
                    setActivePanel("live"); // snap view to kitchen list immediately
                  }}
                  className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center space-x-1"
                >
                  <span>Go to Ticket</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dashboard Executive Header */}
      <div className="bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="font-display font-black text-2xl tracking-tight text-slate-900">
                Kitchen Dashboard
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time bento order synchronization active • Fully local state persistence
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="admin-add-sample-btn"
              onClick={onAddSampleOrder}
              className="bg-orange-500 hover:bg-orange-600 font-display font-semibold text-white px-4 py-2 rounded-xl text-xs transition-all flex items-center space-x-1.5 cursor-pointer shadow-md shadow-orange-500/10 active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simulate Guest Order</span>
            </button>
            <button
              id="admin-reset-btn"
              onClick={onResetAllData}
              className="bg-slate-105 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-505 text-slate-500 border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Board & History</span>
            </button>
            <button
              id="admin-logout-btn"
              onClick={handleLogout}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer boundary-dashed border border-slate-800 shadow-sm active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 mt-px">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex space-x-1 py-1.5 overflow-x-auto scrollbar-none">
          <button
            id="panel-btn-live"
            onClick={() => setActivePanel("live")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
              activePanel === "live"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
            }`}
          >
            <Activity className={`w-4 h-4 ${activePanel === "live" ? "text-emerald-400 animate-pulse" : ""}`} />
            <span>Live Kitchen Board</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activePanel === "live" ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-100 text-slate-500"}`}>
              {orders.length}
            </span>
          </button>
          
          <button
            id="panel-btn-history"
            onClick={() => setActivePanel("history")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
              activePanel === "history"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Completed Order History</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activePanel === "history" ? "bg-orange-500/20 text-orange-600 font-extrabold" : "bg-slate-100 text-slate-500"}`}>
              {historyOrders.length}
            </span>
          </button>

          <button
            id="panel-btn-tables"
            onClick={() => {
              setActivePanel("tables");
              setSelectedInspectTable(null);
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
              activePanel === "tables"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
            }`}
          >
            <Database className="w-4 h-4 text-orange-400" />
            <span>Tablewise Statements</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activePanel === "tables" ? "bg-orange-500/30 text-orange-600 font-extrabold" : "bg-slate-100 text-slate-500"}`}>
              {allKnownTables.length}
            </span>
          </button>

          <button
            id="panel-btn-menu"
            onClick={() => setActivePanel("menu")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
              activePanel === "menu"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
            }`}
          >
            <Utensils className="w-4 h-4 text-orange-400" />
            <span>Manage Menu</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activePanel === "menu" ? "bg-orange-500/30 text-orange-600 font-extrabold" : "bg-slate-100 text-slate-500"}`}>
              {menuItems.length}
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        
        {/* DESIGN BENTO GRID SYSTEM */}
        <div className="grid grid-cols-12 gap-5">

          {/* Stats Row 1: Left Small Card */}
          <div className="col-span-12 md:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Pending Kitchen</span>
              <Activity className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
            </div>
            <div className="mt-4">
              <span className="text-4xl font-display font-black text-slate-900">{pendingCount}</span>
              <p className="text-[10px] text-slate-400 mt-1">Awaiting cook assignment</p>
            </div>
          </div>

          {/* Stats Row 2: Right Small Card */}
          <div className="col-span-12 md:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500" />
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">In Prep Area</span>
              <Coffee className="w-4 h-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
            </div>
            <div className="mt-4">
              <span className="text-4xl font-display font-black text-slate-900">{preparingCount}</span>
              <p className="text-[10px] text-slate-400 mt-1">Currently being cooked</p>
            </div>
          </div>

          {/* Stats Row 3: Double-width Highlight Block */}
          <div className="col-span-12 md:col-span-6 bg-gradient-to-r from-orange-505 via-orange-500 to-amber-600 bg-orange-600 rounded-2xl p-5 text-white flex items-center justify-between shadow-md relative overflow-hidden group">
            {/* Dynamic visual light reflection background */}
            <div className="absolute -right-16 -bottom-16 w-48 h-48 rounded-full bg-white/10 group-hover:scale-110 transition-all duration-700" />
            
            <div className="space-y-1">
              <span className="inline-block py-0.5 px-2 bg-white/20 text-[9px] font-bold rounded-full tracking-wider uppercase">
                Peak Hour Metric
              </span>
              <h3 className="font-display font-black text-xl leading-tight">Kitchen Shift Stats</h3>
              <p className="text-orange-50 text-[11px] max-w-sm mt-0.5">
                Active dishes: {activeCountOverall}. Past completed: {historyOrders.length}. Keep ticket handovers below 15 mins.
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6 text-white animate-pulse" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activePanel === "live" ? (
              <motion.div
                key="live-panel-grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col min-h-[500px]"
              >
                {/* Active queue inner controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="font-display font-black text-lg text-slate-900 leading-tight">Active Ticket Line</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Transition cooking stages & serve customers</p>
                  </div>

                  {/* Status pills inside active queue */}
                  <div className="flex items-center flex-wrap gap-1.5">
                    {(["All", "Pending", "Preparing"] as const).map((status) => {
                      const active = filterStatus === status;
                      return (
                        <button
                          key={status}
                          id={`admin-btn-tab-${status}`}
                          onClick={() => setFilterStatus(status)}
                          className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                            active
                              ? "bg-slate-905 text-white bg-slate-900 shadow-sm"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          <span>{status === "All" ? "All active" : status}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${active ? "bg-amber-400 text-slate-950 font-black" : "bg-slate-200/50 text-slate-500"}`}>
                            {status === "All" ? orders.length : orders.filter(o => o.status === status).length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Queue tickets layout */}
                {filteredActiveOrders.length === 0 ? (
                  <div id="kitchen-empty-placeholder" className="py-20 text-center flex-1 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
                      <Activity className="w-6 h-6" />
                    </div>
                    <h3 className="font-display font-bold text-slate-800">Queue is vacant</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      No tickets currently in {filterStatus === "All" ? "active cooking stages" : `"${filterStatus}" stage`}.
                    </p>
                  </div>
                ) : (
                  <div id="admin-orders-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
                    <AnimatePresence mode="popLayout">
                      {filteredActiveOrders.map((order) => {
                        const badge = getStatusBadge(order.status);
                        const isPending = order.status === "Pending";
                        const isPreparing = order.status === "Preparing";

                        return (
                          <motion.div
                            key={order.id}
                            id={`order-card-${order.id}`}
                            layoutId={`order-${order.id}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`bg-slate-50/50 border rounded-xl flex flex-col justify-between overflow-hidden transition-all ${
                              isPreparing 
                                ? "border-orange-200 bg-orange-50/10 shadow-xs" 
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <div className="p-4">
                              <div className="flex justify-between items-center mb-2.5">
                                <span className={`px-2 py-1 text-[10px] font-mono font-black rounded-md uppercase tracking-wider ${
                                  isPreparing 
                                    ? "bg-orange-500 text-white" 
                                    : "bg-sky-505 bg-sky-500 text-white"
                                }`}>
                                  Table {order.tableNumber}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {getElapsedMinutes(order.timestamp)}
                                </span>
                              </div>

                              <ul className="text-xs text-slate-700 space-y-2 mb-3.5">
                                {order.items.map((item, index) => (
                                  <li key={`${item.id}-${index}`} className="flex justify-between items-start">
                                    <span className="flex items-start space-x-1 font-medium">
                                      <strong className="font-mono text-[10px] text-slate-900 bg-slate-200/70 py-0.5 px-1.5 rounded mr-1">
                                        {item.quantity}x
                                      </strong>
                                      <span className="break-words max-w-[150px] inline-block pt-0.5">{item.name}</span>
                                    </span>
                                    <span className="font-mono text-slate-400 pt-0.5">RS. {(item.price * item.quantity).toFixed(2)}</span>
                                  </li>
                                ))}
                              </ul>

                              {order.note && (
                                <div className="p-2 bg-amber-50 rounded-lg border border-amber-100 flex gap-1.5 items-start">
                                  <FileText className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                                  <p className="text-[10px] text-amber-900 italic leading-snug">{order.note}</p>
                                </div>
                              )}
                            </div>

                            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between gap-1.5 mt-auto">
                              <div>
                                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Ticket Total</span>
                                <span className="font-mono text-sm font-black text-slate-900">
                                  RS. {order.totalPrice.toFixed(2)}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                {isPending ? (
                                  <button
                                    id={`action-prepare-${order.id}`}
                                    onClick={() => onUpdateOrderStatus(order.id, "Preparing")}
                                    className="px-3 py-1.5 bg-slate-905 bg-slate-900 text-white text-[10px] font-bold rounded-lg hover:bg-slate-850 transition-colors cursor-pointer flex items-center space-x-1"
                                  >
                                    <Coffee className="w-3 h-3" />
                                    <span>Start Preparing</span>
                                  </button>
                                ) : (
                                  <button
                                    id={`action-serve-${order.id}`}
                                    onClick={() => onUpdateOrderStatus(order.id, "Served")}
                                    className="px-3 py-1.5 bg-orange-505 bg-orange-500 text-white text-[10px] font-bold rounded-lg hover:bg-orange-600 transition-colors cursor-pointer flex items-center space-x-1 shadow-xs shadow-orange-550/10 animate-pulse"
                                  >
                                    <Check className="w-3 h-3 stroke-[3]" />
                                    <span>Serve Table</span>
                                  </button>
                                )}

                                <button
                                  id={`action-delete-${order.id}`}
                                  onClick={() => onClearOrder(order.id)}
                                  className="p-1.5 border border-slate-200 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Clear / Reject Order"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            ) : activePanel === "history" ? (
              /* ORDER HISTORY TAB SECTION */
              <motion.div
                key="history-panel-grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col min-h-[500px]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="font-display font-black text-lg text-slate-900 leading-tight">Completed Order History</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Archive of served and cleared guest tickets</p>
                  </div>

                  {/* Built-in Search query box */}
                  <div className="relative w-full sm:w-60">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Search table or items..."
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                      className="w-full text-xs py-2 pl-9 pr-4 rounded-xl border border-slate-250 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500 focus:bg-white transition-all"
                    />
                    {historySearchQuery && (
                      <button 
                        onClick={() => setHistorySearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {filteredHistoryOrders.length === 0 ? (
                  <div className="py-20 text-center flex-1 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
                      <History className="w-6 h-6" />
                    </div>
                    <h3 className="font-display font-bold text-slate-800">No past orders found</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      {historySearchQuery ? "Try searching for a different item or Table ID." : "History area is currently empty. Orders placed as 'Served' or 'Cleared' will arrive here!"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
                    <AnimatePresence>
                      {filteredHistoryOrders.map((order) => {
                        const badge = getStatusBadge(order.status);
                        const isServed = order.status === "Served";

                        return (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-white border border-slate-200/90 rounded-xl flex flex-col justify-between overflow-hidden shadow-2xs"
                          >
                            <div className="p-4 bg-slate-50/40">
                              <div className="flex justify-between items-center mb-2.5">
                                <div className="flex items-center space-x-1.5">
                                  <span className="px-2 py-0.5 text-[10px] font-mono font-black bg-slate-800 text-white rounded uppercase">
                                    Table {order.tableNumber}
                                  </span>
                                  <span className="text-[10px] font-mono font-bold text-slate-400 leading-normal">
                                    {order.id}
                                  </span>
                                </div>
                                <span className={`px-2 py-0.5 text-[9px] rounded-md font-mono font-semibold uppercase tracking-wider ${badge.classes}`}>
                                  {badge.text}
                                </span>
                              </div>

                              <ul className="text-xs text-slate-700 space-y-2 mb-3">
                                {order.items.map((item, index) => (
                                  <li key={`${item.id}-${index}`} className="flex justify-between items-start">
                                    <span className="flex items-start space-x-1">
                                      <strong className="font-mono text-[9px] text-slate-600 bg-slate-100 py-0.2 px-1 rounded mr-1 select-none">
                                        {item.quantity}x
                                      </strong>
                                      <span className="break-words max-w-[150px] inline-block text-slate-705 text-slate-700">{item.name}</span>
                                    </span>
                                    <span className="font-mono text-slate-400 font-bold text-[11px]">RS. {(item.price * item.quantity).toFixed(2)}</span>
                                  </li>
                                ))}
                              </ul>

                              {order.note && (
                                <div className="p-2 bg-slate-50 rounded-lg border border-slate-150 flex gap-1.5 items-start mt-2">
                                  <FileText className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                                  <p className="text-[10px] text-slate-500 italic leading-snug">{order.note}</p>
                                </div>
                              )}
                            </div>

                            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between gap-1.5 mt-auto">
                              <div className="text-[10px] text-slate-400 font-medium">
                                <span className="block uppercase font-bold text-[9px] tracking-wider">Placed at</span>
                                <span className="font-mono text-slate-500">
                                  {new Date(order.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                                </span>
                              </div>

                              <div className="text-right">
                                <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Grand Total</span>
                                <span className="font-mono text-xs font-black text-slate-900">
                                  RS. {order.totalPrice.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            ) : activePanel === "tables" ? (
              /* TABLEWISE ARCHIVES VIEW SECTION */
              <motion.div
                key="tables-panel-grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col min-h-[500px]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="font-display font-black text-lg text-slate-900 leading-tight">Table-wise History & Running Records</h2>
                    <p className="text-xs text-slate-505 text-slate-500 mt-0.5">Consolidated spending statements and dish logs grouped per table till date</p>
                  </div>
                  {selectedInspectTable && (
                    <button
                      onClick={() => setSelectedInspectTable(null)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-705 text-slate-755 text-slate-700 text-xs py-1.5 px-3 rounded-lg font-bold transition-all transition-colors cursor-pointer"
                    >
                      View All Tables
                    </button>
                  )}
                </div>

                {allKnownTables.length === 0 ? (
                  <div className="py-20 text-center flex-1 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
                      <Database className="w-6 h-6 animate-pulse" />
                    </div>
                    <h3 className="font-display font-bold text-slate-800">No active tables recorded</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      Once orders are placed by simulated or client guest tables, they will automatically appear here grouped neatly.
                    </p>
                  </div>
                ) : selectedInspectTable ? (
                  /* INSPECT SINGLE TABLE VIEW */
                  <div className="space-y-6">
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <span className="w-11 h-11 bg-slate-900 text-white rounded-xl flex items-center justify-center font-mono font-black text-lg shadow-sm">
                          {selectedInspectTable}
                        </span>
                        <div>
                          <h3 className="font-display font-bold text-slate-900">Table {selectedInspectTable} Dining Statement</h3>
                          <p className="text-xs text-slate-400">Archived list of completed and active tickets</p>
                        </div>
                      </div>
                      <div className="text-right sm:text-right">
                        <span className="text-[10px] text-slate-405 text-slate-400 font-bold block uppercase tracking-wide">Table Spent Balance</span>
                        <span className="text-2xl font-mono font-black text-slate-900">
                          RS. {[...orders, ...historyOrders]
                            .filter(o => o.tableNumber === selectedInspectTable)
                            .reduce((sum, o) => sum + o.totalPrice, 0)
                            .toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Itemized summary total for this table */}
                    <div>
                      <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-2.5">Dishes ordered overall</h4>
                      <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4.5">
                        {(() => {
                          const tableOrders = [...orders, ...historyOrders].filter(o => o.tableNumber === selectedInspectTable);
                          const aggregated: { [key: string]: { name: string; quantity: number; price: number } } = {};
                          tableOrders.forEach(o => {
                            o.items.forEach(it => {
                              const key = it.id || it.name;
                              if (aggregated[key]) {
                                aggregated[key].quantity += it.quantity;
                              } else {
                                aggregated[key] = { name: it.name, quantity: it.quantity, price: it.price };
                              }
                            });
                          });
                          const itemsList = Object.values(aggregated);

                          if (itemsList.length === 0) return <p className="text-xs text-slate-400 italic">No items recorded.</p>;

                          return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                              {itemsList.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-xs border-b border-dashed border-slate-200 pb-1.5 last:pb-0 sm:even:border-b-0">
                                  <span className="text-slate-800">
                                    <strong className="font-mono text-[10px] text-slate-500 bg-slate-105 bg-slate-100 py-0.5 px-1.5 rounded mr-1.5">{item.quantity}x</strong>
                                    {item.name}
                                  </span>
                                  <span className="font-mono font-bold text-slate-600">RS. {(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* List of individual tickets */}
                    <div className="space-y-3">
                      <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Order Tickets for Table {selectedInspectTable}</h4>
                      <div className="space-y-3">
                        {[...orders, ...historyOrders]
                          .filter(o => o.tableNumber === selectedInspectTable)
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .map((order) => {
                            const badge = getStatusBadge(order.status);
                            return (
                              <div key={order.id} className="border border-slate-200/80 rounded-xl p-4 bg-white hover:border-slate-300 transition-all flex flex-col justify-between gap-3 shadow-xs">
                                <div className="flex justify-between items-center text-[11px]">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-mono font-bold bg-slate-100 py-0.5 px-2 rounded-md text-slate-700">{order.id}</span>
                                    <span className="text-slate-400 font-medium">
                                      {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </span>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${badge.classes}`}>
                                    {badge.text}
                                  </span>
                                </div>

                                <ul className="text-xs text-slate-700 space-y-1 bg-slate-50/50 p-2.5 rounded-lg border border-slate-105 border-slate-100">
                                  {order.items.map((it, idx) => (
                                    <li key={idx} className="flex justify-between p-0.5 text-slate-605 text-slate-600">
                                      <span>
                                        <strong className="font-mono text-slate-400 text-[10px] mr-1">{it.quantity}x</strong>
                                        {it.name}
                                      </span>
                                      <span className="font-mono text-slate-400 font-bold text-[11px]">RS. {(it.price * it.quantity).toFixed(2)}</span>
                                    </li>
                                  ))}
                                </ul>

                                {order.note && (
                                  <p className="text-[10px] text-amber-900 bg-amber-50/50 border border-amber-100 px-2.5 py-1.5 rounded-lg italic font-medium">
                                    "{order.note}"
                                  </p>
                                )}

                                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100 font-mono">
                                  <span className="text-slate-400">Grand Price</span>
                                  <span className="font-bold text-slate-900">RS. {order.totalPrice.toFixed(2)}</span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* LIST OF TABLES ACCUMULATED RECORDS GRID */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4.5">
                    {allKnownTables.map((table) => {
                      const tableOrders = [...orders, ...historyOrders].filter(o => o.tableNumber === table);
                      const tableSpent = tableOrders.reduce((sum, o) => sum + o.totalPrice, 0);
                      const tableItemsCount = tableOrders.reduce((sum, o) => sum + o.items.reduce((q, it) => q + it.quantity, 0), 0);
                      const activePending = orders.filter(o => o.tableNumber === table && (o.status === "Pending" || o.status === "Preparing")).length;

                      return (
                        <div
                          key={table}
                          onClick={() => setSelectedInspectTable(table)}
                          className="bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200 hover:border-orange-300 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-xs flex flex-col justify-between h-36"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Table ID</span>
                              <p className="font-mono text-lg font-black text-slate-900">Table {table}</p>
                            </div>
                            {activePending > 0 ? (
                              <span className="bg-orange-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                                {activePending} Active
                              </span>
                            ) : (
                              <span className="bg-slate-200/80 text-slate-650 text-slate-600 text-[9px] px-2 py-0.5 rounded-full font-bold">
                                No active
                              </span>
                            )}
                          </div>

                          <div className="text-xs pt-2 border-t border-slate-200/50 flex justify-between items-end">
                            <div>
                              <span className="text-[9px] text-slate-400 block uppercase font-black tracking-wider">Consolidated spent</span>
                              <span className="font-mono text-sm font-black text-slate-900">RS. {tableSpent.toFixed(2)}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-slate-500 font-bold leading-none">
                                {tableOrders.length} tickets
                              </p>
                              <p className="text-[9px] text-slate-400 mt-0.5">
                                {tableItemsCount} items total
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ) : (
              /* DYNAMIC MENU ITEMS CONFIGURATION & CREATOR */
              <motion.div
                key="menu-editor-panel-grid"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col min-h-[500px]"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="font-display font-black text-xl text-slate-800 leading-tight">Live Menu Catalog Creator</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Add, delete, and configure food & drink delicacies available on the customer client device.</p>
                  </div>
                  <button
                    onClick={onResetMenuItems}
                    className="self-start sm:self-center text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer"
                  >
                    Restore Defaults
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* LEFT: Creator Form (5 columns) */}
                  <div className="md:col-span-5 bg-slate-55 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <h3 className="font-display font-black text-sm text-slate-800 mb-3.5 flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 bg-orange-500 rounded-full inline-block" />
                      <span>Add Brand New Delicacy</span>
                    </h3>

                    <MenuCreatorForm onAddMenuItem={onAddMenuItem} />
                  </div>

                  {/* RIGHT: Active List & Filter (7 columns) */}
                  <div className="md:col-span-7 flex flex-col">
                    <MenuListSection menuItems={menuItems} onDeleteMenuItem={onDeleteMenuItem} onSimulatePopularOrder={onSimulatePopularOrder} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* BENTO BLOCK: Quick Premium Shift Snapshot Side panel */}
          <div className="col-span-12 lg:col-span-4 bg-slate-900 text-white rounded-2xl p-6 shadow-lg flex flex-col justify-between gap-6 relative overflow-hidden">
            {/* Visual aesthetic highlight mesh decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500 to-amber-500 opacity-20 blur-2xl" />

            <div>
              <span className="text-[10px] tracking-widest text-slate-400 uppercase font-black block mb-4">
                Shift Snapshot
              </span>
              <div>
                <span className="text-4xl md:text-5xl font-display font-black tracking-tight text-white block">
                  RS. {totalRevenue.toFixed(2)}
                </span>
                <p className="text-xs text-slate-400 mt-1">Total Sales Balance</p>
              </div>

              {/* Progress dynamic meter widget */}
              <div className="mt-8 space-y-3">
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 transition-all duration-500" 
                    style={{ width: `${mockCapacityPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
                  <span className="text-slate-400">Seat Capacity / Load</span>
                  <span className="text-orange-500">{mockCapacityPercentage}%</span>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-800">
              <div className="space-y-2 mt-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Active Live Tickets</span>
                  <span className="font-mono text-white">{orders.length} in queue</span>
                </div>
                <div className="flex justify-between">
                  <span>Served Table Tickets</span>
                  <span className="font-mono text-emerald-400 font-semibold">+{servedCount} past</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleared / Archived Tickets</span>
                  <span className="font-mono text-teal-400 font-semibold">+{clearedCount} past</span>
                </div>
              </div>
            </div>
          </div>

          {/* BENTO BLOCK: Companion Client Preview widget / guide sidebar box */}
          <div className="col-span-12 lg:col-span-4 bg-slate-100 rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between gap-5 shadow-inner">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 leading-tight">Customer Interface</h4>
                <p className="text-xs text-slate-500 mt-0.5">Toggle at top switcher to place table orders</p>
              </div>
            </div>

            <div className="text-slate-400">
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

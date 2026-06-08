import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MenuItem, CartItem, Order, OrderStatus } from "./types";
import { MENU_ITEMS, TABLE_OPTIONS } from "./data";
import TableSelector from "./components/TableSelector";
import ClientMenu from "./components/ClientMenu";
import AdminDashboard from "./components/AdminDashboard";
import { Tablet, Smartphone, Terminal, Cpu, Clock, HelpCircle, UtensilsCrossed } from "lucide-react";

export default function App() {
  // Current View Toggle: "client" | "admin"
  const [currentView, setCurrentView] = useState<"client" | "admin">("client");

  // Dynamic state list for food and drinks menu items
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const stored = localStorage.getItem("bistro_menu_items");
      return stored ? JSON.parse(stored) : MENU_ITEMS;
    } catch {
      return MENU_ITEMS;
    }
  });

  // Client Table selection
  const [selectedTable, setSelectedTable] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem("bistro_table");
      return stored || null;
    } catch {
      return null;
    }
  });

  // Client Cart items list
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("bistro_cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Admin Active Orders queue (Pending, Preparing)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem("bistro_orders");
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Seed initial active order so the kitchen isn't empty initially!
      const initialOrders: Order[] = [
        {
          id: "ORD-7192",
          tableNumber: "G1",
          items: [
            { id: "f1", name: "Artisan Truffle Wagyu Burger", price: 18.50, quantity: 1, category: "Food" },
            { id: "d1", name: "Signature Smoked Wood Old Fashioned", price: 14.00, quantity: 2, category: "Drinks" }
          ],
          totalPrice: 46.50,
          timestamp: new Date(Date.now() - 8 * 60000).toISOString(), // 8 minutes ago
          status: "Preparing",
          note: "Medium-rare burger patty, extra smoked glass smoke please!"
        }
      ];
      return initialOrders;
    } catch {
      return [];
    }
  });

  // Admin Historical Orders (Served, Completed/Cleared)
  const [historyOrders, setHistoryOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem("bistro_history_orders");
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Seed initial past served order so history is pre-seeded beautifully!
      const initialHistory: Order[] = [
        {
          id: "ORD-3304",
          tableNumber: "B2",
          items: [
            { id: "f3", name: "Crispy Calamari & Citrus Dust", price: 13.50, quantity: 1, category: "Food" },
            { id: "d5", name: "Organic Ceremonial Matcha Lemonade", price: 7.00, quantity: 1, category: "Drinks" }
          ],
          totalPrice: 20.50,
          timestamp: new Date(Date.now() - 25 * 60000).toISOString(), // 25 minutes ago
          status: "Served"
        }
      ];
      return initialHistory;
    } catch {
      return [];
    }
  });

  // Sync state to local storage on change
  useEffect(() => {
    try {
      if (selectedTable) {
        localStorage.setItem("bistro_table", selectedTable);
      } else {
        localStorage.removeItem("bistro_table");
      }
    } catch (e) {
      console.error(e);
    }
  }, [selectedTable]);

  useEffect(() => {
    try {
      localStorage.setItem("bistro_cart", JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("bistro_orders", JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem("bistro_history_orders", JSON.stringify(historyOrders));
    } catch (e) {
      console.error(e);
    }
  }, [historyOrders]);

  useEffect(() => {
    try {
      localStorage.setItem("bistro_menu_items", JSON.stringify(menuItems));
    } catch (e) {
      console.error(e);
    }
  }, [menuItems]);

  // Handle Client placing order
  const handlePlaceOrder = async (note: string) => {
    if (cart.length === 0 || !selectedTable) return;

    const newOrder: Order = {
      id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
      tableNumber: selectedTable,
      items: cart.map(c => ({
        id: c.menuItem.id,
        name: c.menuItem.name,
        price: c.menuItem.price,
        quantity: c.quantity,
        category: c.menuItem.category
      })),
      totalPrice: cart.reduce((acc, c) => acc + (c.menuItem.price * c.quantity), 0),
      timestamp: new Date().toISOString(),
      status: "Pending",
      note: note.trim() ? note.trim() : undefined
    };

    // Add new order to top of list
    setOrders(prev => [newOrder, ...prev]);
    // Clear client's cart upon success
    setCart([]);
  };

  // Switch Order Status helper
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    if (status === "Served" || status === "Completed") {
      const orderToMove = orders.find(order => order.id === orderId);
      if (orderToMove) {
        const archivedOrder: Order = { ...orderToMove, status };
        setHistoryOrders(prev => {
          if (prev.some(o => o.id === orderId)) return prev;
          return [archivedOrder, ...prev];
        });
        setOrders(prev => prev.filter(order => order.id !== orderId));
        return;
      }
    }
    setOrders(prev =>
      prev.map(order => order.id === orderId ? { ...order, status } : order)
    );
  };

  // Remove/Wipe specific order and archive it to history
  const handleClearOrder = (orderId: string) => {
    const orderToMove = orders.find(order => order.id === orderId);
    if (orderToMove) {
      const archivedOrder: Order = { ...orderToMove, status: "Completed" };
      setHistoryOrders(prev => {
        if (prev.some(o => o.id === orderId)) return prev;
        return [archivedOrder, ...prev];
      });
    }
    setOrders(prev => prev.filter(order => order.id !== orderId));
  };

  // Simulate or seed a sample customer order directly from the dashboard
  const handleAddSampleOrder = () => {
    const randomTable = TABLE_OPTIONS[Math.floor(Math.random() * TABLE_OPTIONS.length)];
    
    if (menuItems.length === 0) return;
    
    // Choose 1-3 random menu items
    const itemCount = Math.min(menuItems.length, Math.floor(Math.random() * 3) + 1);
    const shuffled = [...menuItems].sort(() => 0.5 - Math.random());
    const selectedItems = shuffled.slice(0, itemCount);

    const orderItemsSum = selectedItems.map((item) => {
      const quantity = Math.floor(Math.random() * 2) + 1;
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity,
        category: item.category
      };
    });

    const notes = [
      "No onion please",
      "Gluten free if possible",
      "Draft water with ice",
      "Garnish with fresh coriander",
      "",
      ""
    ];

    const randomNote = notes[Math.floor(Math.random() * notes.length)];

    const simulated: Order = {
      id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
      tableNumber: randomTable,
      items: orderItemsSum,
      totalPrice: orderItemsSum.reduce((acc, i) => acc + (i.price * i.quantity), 0),
      timestamp: new Date().toISOString(),
      status: "Pending",
      note: randomNote ? randomNote : undefined
    };

    setOrders(prev => [simulated, ...prev]);
  };

  // Reset all application data back to defaults
  const handleResetAllData = () => {
    if (window.confirm("Are you sure you want to completely erase the active kitchen board and order history?")) {
      setOrders([]);
      setHistoryOrders([]);
      setCart([]);
      localStorage.removeItem("bistro_orders");
      localStorage.removeItem("bistro_history_orders");
      localStorage.removeItem("bistro_cart");
    }
  };

  const handleAddMenuItem = (newItem: MenuItem) => {
    setMenuItems(prev => [...prev, newItem]);
  };

  const handleDeleteMenuItem = (itemId: string) => {
    setMenuItems(prev => prev.filter(it => it.id !== itemId));
    setCart(prev => prev.filter(c => c.menuItem.id !== itemId));
  };

  const handleResetMenuItems = () => {
    if (window.confirm("Are you sure you want to restore the default French bistro food and drinks menu? This will discard all custom additions.")) {
      setMenuItems(MENU_ITEMS);
      localStorage.removeItem("bistro_menu_items");
    }
  };

  // Dynamically compute the popularity based on total ordered quantities across all active and history orders
  const menuItemsWithDynamicPopularity = useMemo(() => {
    const counts: Record<string, number> = {};
    
    // Sum from active orders
    orders.forEach(order => {
      order.items.forEach(it => {
        if (it.id) {
          counts[it.id] = (counts[it.id] || 0) + it.quantity;
        }
      });
    });

    // Sum from history orders
    historyOrders.forEach(order => {
      order.items.forEach(it => {
        if (it.id) {
          counts[it.id] = (counts[it.id] || 0) + it.quantity;
        }
      });
    });

    return menuItems.map(item => {
      const orderCount = counts[item.id] || 0;
      const exceedsThreshold = orderCount > 100;
      return {
        ...item,
        popular: exceedsThreshold ? true : item.popular,
        orderCount
      };
    });
  }, [menuItems, orders, historyOrders]);

  const handleSimulateItemOrders = (itemId: string, count: number) => {
    const item = menuItems.find(it => it.id === itemId);
    if (!item) return;

    const simulated: Order = {
      id: "SIM-" + Math.floor(100 + Math.random() * 900),
      tableNumber: "B1",
      items: [
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: count,
          category: item.category
        }
      ],
      totalPrice: item.price * count,
      timestamp: new Date().toISOString(),
      status: "Completed"
    };

    setHistoryOrders(prev => [simulated, ...prev]);
  };

  const activePendingOrdersCount = orders.filter(o => o.status === "Pending" || o.status === "Preparing").length;

  return (
    <div id="master-app-root" className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* GLOBAL VIEW SWITCHER HEADER BAR */}
      <div id="view-switcher-bar" className="bg-slate-950 text-white px-4 py-3 sticky top-0 md:relative z-50 shadow-md border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <UtensilsCrossed className="w-5 h-5 text-orange-500 stroke-[2.5]" />
          <span className="font-display font-black tracking-normal text-sm md:text-base text-white">
            Le Jardin Digital Lounge
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full font-mono">
            v1.2.0
          </span>
        </div>

        {/* Dynamic Buttons Toggle Selector with framer animations */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            id="view-toggle-client"
            onClick={() => setCurrentView("client")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              currentView === "client"
                ? "bg-orange-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Client Menu</span>
          </button>
          
          <button
            id="view-toggle-admin"
            onClick={() => setCurrentView("admin")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer relative ${
              currentView === "admin"
                ? "bg-orange-500 text-white shadow-sm font-extrabold"
                : "text-slate-400 hover:text-white relative"
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Kitchen Dashboard</span>
            {activePendingOrdersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold ring-2 ring-slate-900">
                {activePendingOrdersCount}
              </span>
            )}
          </button>
        </div>

        {/* Simple live status badge */}
        <div className="hidden lg:flex items-center space-x-4 text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[11px] font-mono">Active Simulation Portal</span>
          </div>
        </div>
      </div>

      {/* CORE VIEW MULTIPLEXER */}
      <div id="view-scaffold-body" className="flex-1">
        <AnimatePresence mode="wait">
          {currentView === "client" ? (
            <motion.div
              key="client-section"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25 }}
            >
              {!selectedTable ? (
                <TableSelector 
                  onSelectTable={(table) => setSelectedTable(table)} 
                  selectedTable={selectedTable}
                />
              ) : (
                <ClientMenu
                  tableNumber={selectedTable}
                  cart={cart}
                  onUpdateCart={setCart}
                  onPlaceOrder={handlePlaceOrder}
                  orders={orders}
                  historyOrders={historyOrders}
                  menuItems={menuItemsWithDynamicPopularity}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="admin-section"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.25 }}
            >
              <AdminDashboard
                orders={orders}
                historyOrders={historyOrders}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onClearOrder={handleClearOrder}
                onAddSampleOrder={handleAddSampleOrder}
                onResetAllData={handleResetAllData}
                menuItems={menuItemsWithDynamicPopularity}
                onAddMenuItem={handleAddMenuItem}
                onDeleteMenuItem={handleDeleteMenuItem}
                onResetMenuItems={handleResetMenuItems}
                onSimulatePopularOrder={handleSimulateItemOrders}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

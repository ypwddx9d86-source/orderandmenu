import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MenuItem, CartItem, Order, OrderStatus } from "./types";
import { MENU_ITEMS, TABLE_OPTIONS } from "./data";
import TableSelector from "./components/TableSelector";
import ClientMenu from "./components/ClientMenu";
import AdminDashboard from "./components/AdminDashboard";
import { Tablet, Smartphone, Terminal, Cpu, Clock, HelpCircle, UtensilsCrossed } from "lucide-react";

// Firebase imports
import { db, handleFirestoreError, OperationType } from "./firebase";
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, getDocs } from "firebase/firestore";

export default function App() {
  // Current View Toggle: "client" | "admin"
  const [currentView, setCurrentView] = useState<"client" | "admin">("client");

  // Dynamic state list for food and drinks menu items (hooked to Firestore)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Client Table selection (stored locally in browser session)
  const [selectedTable, setSelectedTable] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem("bistro_table");
      return stored || null;
    } catch {
      return null;
    }
  });

  // Client Cart items list (stored locally in browser session)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("bistro_cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Admin Active Orders queue (Pending, Preparing)
  const [orders, setOrders] = useState<Order[]>([]);

  // Admin Historical Orders (Served, Completed/Cleared)
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);

  // Local sync of browser UI preferences
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

  // Real-time Firestore sync and automatic seeding logic
  useEffect(() => {
    const unsubMenu = onSnapshot(
      collection(db, "menu_items"),
      async (snapshot) => {
        if (snapshot.empty) {
          // Automatic database catalog bootstrap
          try {
            const seedPromises = MENU_ITEMS.map((item) =>
              setDoc(doc(db, "menu_items", item.id), item)
            );
            await Promise.all(seedPromises);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, "menu_items_seed");
          }
        } else {
          const list: MenuItem[] = [];
          snapshot.forEach((d) => {
            list.push(d.data() as MenuItem);
          });
          setMenuItems(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "menu_items");
      }
    );

    const unsubOrders = onSnapshot(
      collection(db, "orders"),
      async (snapshot) => {
        if (snapshot.empty) {
          // Automatic live and historical ticket queue seeding
          const initialOrders: Order[] = [
            {
              id: "ORD-7192",
              tableNumber: "G1",
              items: [
                { id: "f1", name: "Artisan Truffle Wagyu Burger", price: 18.50, quantity: 1, category: "Food" },
                { id: "d1", name: "Signature Smoked Wood Old Fashioned", price: 14.00, quantity: 2, category: "Drinks" }
              ],
              totalPrice: 46.50,
              timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
              status: "Preparing",
              note: "Medium-rare burger patty, extra smoked glass smoke please!"
            },
            {
              id: "ORD-3304",
              tableNumber: "B2",
              items: [
                { id: "f3", name: "Crispy Calamari & Citrus Dust", price: 13.50, quantity: 1, category: "Food" },
                { id: "d5", name: "Organic Ceremonial Matcha Lemonade", price: 7.00, quantity: 1, category: "Drinks" }
              ],
              totalPrice: 20.50,
              timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
              status: "Served"
            }
          ];
          try {
            const seedPromises = initialOrders.map((ord) =>
              setDoc(doc(db, "orders", ord.id), ord)
            );
            await Promise.all(seedPromises);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, "orders_seed");
          }
        } else {
          const list: Order[] = [];
          snapshot.forEach((d) => {
            list.push(d.data() as Order);
          });
          // Sort descending by placement timestamp
          list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

          setOrders(list.filter((o) => o.status === "Pending" || o.status === "Preparing"));
          setHistoryOrders(list.filter((o) => o.status === "Served" || o.status === "Completed"));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "orders");
      }
    );

    return () => {
      unsubMenu();
      unsubOrders();
    };
  }, []);

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

    try {
      await setDoc(doc(db, "orders", newOrder.id), newOrder);
      // Clear client's cart upon success
      setCart([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `orders/${newOrder.id}`);
    }
  };

  // Switch Order Status helper
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  // Remove/Wipe specific order and archive it to history
  const handleClearOrder = async (orderId: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: "Completed" });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  // Simulate or seed a sample customer order directly from the dashboard
  const handleAddSampleOrder = async () => {
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

    try {
      await setDoc(doc(db, "orders", simulated.id), simulated);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `orders/${simulated.id}`);
    }
  };

  // Reset all application data back to defaults
  const handleResetAllData = async () => {
    if (window.confirm("Are you sure you want to completely erase the active kitchen board and order history?")) {
      try {
        setCart([]);
        const snapshot = await getDocs(collection(db, "orders"));
        const batchPromises = snapshot.docs.map(d => deleteDoc(doc(db, "orders", d.id)));
        await Promise.all(batchPromises);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, "orders");
      }
    }
  };

  const handleAddMenuItem = async (newItem: MenuItem) => {
    try {
      await setDoc(doc(db, "menu_items", newItem.id), newItem);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `menu_items/${newItem.id}`);
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    try {
      await deleteDoc(doc(db, "menu_items", itemId));
      setCart(prev => prev.filter(c => c.menuItem.id !== itemId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `menu_items/${itemId}`);
    }
  };

  const handleResetMenuItems = async () => {
    if (window.confirm("Are you sure you want to restore the default French bistro food and drinks menu? This will discard all custom additions.")) {
      try {
        const snapshot = await getDocs(collection(db, "menu_items"));
        const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, "menu_items", d.id)));
        await Promise.all(deletePromises);
        const seedPromises = MENU_ITEMS.map(item => setDoc(doc(db, "menu_items", item.id), item));
        await Promise.all(seedPromises);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "menu_items");
      }
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

  const handleSimulateItemOrders = async (itemId: string, count: number) => {
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

    try {
      await setDoc(doc(db, "orders", simulated.id), simulated);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `orders/${simulated.id}`);
    }
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

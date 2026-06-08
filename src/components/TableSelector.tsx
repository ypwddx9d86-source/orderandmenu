import React, { useState } from "react";
import { motion } from "motion/react";
import { TABLE_OPTIONS } from "../data";
import { MapPin, Armchair, Flame, Check, Sparkles } from "lucide-react";

interface TableSelectorProps {
  onSelectTable: (table: string) => void;
  selectedTable: string | null;
}

export default function TableSelector({ onSelectTable, selectedTable: initialTable }: TableSelectorProps) {
  const [activeTable, setActiveTable] = useState<string | null>(initialTable);

  const getTableZone = (tableId: string) => {
    if (tableId.startsWith("C") && !tableId.startsWith("CO")) return { name: "Main Dining Hall", icon: Armchair, color: "bg-emerald-50 text-emerald-700 border-emerald-100" };
    if (tableId.startsWith("G")) return { name: "The Sunlit Garden", icon: Sparkles, color: "bg-orange-50 text-orange-700 border-orange-100" };
    if (tableId.startsWith("CO")) return { name: "Central Courtyard / Terrace", icon: MapPin, color: "bg-sky-50 text-sky-700 border-sky-100" };
    if (tableId.startsWith("B")) return { name: "The Cocktail Bar", icon: Flame, color: "bg-purple-50 text-purple-700 border-purple-100" };
    return { name: "Premium Lounge", icon: Armchair, color: "bg-slate-50 text-slate-700 border-slate-100" };
  };

  const handleConfirm = () => {
    if (activeTable) {
      onSelectTable(activeTable);
    }
  };

  return (
    <div id="table-selector-container" className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 md:py-24">
      <motion.div 
        id="table-selector-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100 p-6 md:p-10 text-center relative overflow-hidden"
      >
        {/* Top subtle decorative pattern */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600" />
        
        <div className="mb-8">
          <span className="inline-block py-1 px-3 rounded-full text-[10px] font-semibold text-orange-850 bg-orange-50 uppercase tracking-widest mb-4">
            Welcome to Le Jardin
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Select Your Table
          </h1>
          <p className="mt-2.5 text-sm md:text-base text-slate-500 max-w-md mx-auto">
            Please locate your table number to unlock the digital dining dashboard, request service, or order fine delicacies.
          </p>
        </div>

        {/* Legend for seat styles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8 text-left text-xs text-slate-500">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-100 bg-slate-50/50">
            <Armchair className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dining Hall (C)</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-100 bg-slate-50/50">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Garden (G)</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-100 bg-slate-50/50">
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            <span>Courtyard (CO)</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-100 bg-slate-50/50">
            <Flame className="w-3.5 h-3.5 text-purple-600" />
            <span>Main Bar (B)</span>
          </div>
        </div>

        {/* Grid of Tables */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
          {TABLE_OPTIONS.map((tableId) => {
            const isSelected = activeTable === tableId;
            const zone = getTableZone(tableId);
            const ZoneIcon = zone.icon;
            
            return (
              <motion.button
                key={tableId}
                id={`table-btn-${tableId}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTable(tableId)}
                className={`group py-5 px-3 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border relative ${
                  isSelected
                    ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10 cursor-default"
                    : "bg-white border-slate-200 hover:border-slate-400 text-slate-800 hover:bg-slate-50"
                }`}
              >
                {/* Zone Icon tag top right */}
                <div className="absolute top-2.5 right-2.5">
                  <ZoneIcon className={`w-3.5 h-3.5 transition-colors ${isSelected ? "text-orange-400" : "text-slate-400 group-hover:text-orange-500"}`} />
                </div>

                <div className={`text-2xl md:text-3xl font-display font-extrabold ${isSelected ? "text-orange-400" : "text-slate-900 group-hover:text-orange-600"}`}>
                  {tableId}
                </div>

                <div className={`mt-2.5 text-[9px] font-medium tracking-wide truncate max-w-full text-center px-1 font-sans ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                  {zone.name.split(" ")[1] || zone.name}
                </div>

                {isSelected && (
                  <motion.div 
                    layoutId="checkmark"
                    className="absolute -bottom-1 -right-1 bg-orange-500 text-white rounded-full p-0.5 border-2 border-white"
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            id="table-selector-confirm-btn"
            onClick={handleConfirm}
            disabled={!activeTable}
            className={`w-full py-4 px-6 rounded-2xl font-display font-bold tracking-tight text-base transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTable
                ? "bg-slate-900 text-white hover:bg-slate-800 active:translate-y-0.5 shadow-md hover:shadow-lg cursor-pointer"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            <span>Activate Table Portal</span>
            {activeTable && <span className="font-mono bg-orange-500/20 text-orange-400 px-2.5 py-0.5 rounded-lg text-xs font-bold">{activeTable}</span>}
          </button>
          
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <span>Our hosts can assist with custom table layouts if needed.</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

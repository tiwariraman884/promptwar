"use client";

import { useState, useEffect } from "react";
import { ECO_PRODUCTS } from "@/lib/carbonData";
import { ShoppingCart, Star, Plus, Leaf, ChevronDown, ChevronUp, X } from "lucide-react";

export default function EcoStorePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Highest CO2 saving");
  const [cart, setCart] = useState<{ id: string; qty: number }[]>([]);
  const [expandedDesc, setExpandedDesc] = useState<Record<string, boolean>>({});
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("eco_cart");
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("eco_cart", JSON.stringify(cart));
  }, [cart]);

  const categories = ["All", ...Array.from(new Set(ECO_PRODUCTS.map((p) => p.category)))];

  const filteredProducts = ECO_PRODUCTS.filter((p) => selectedCategory === "All" || p.category === selectedCategory);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "Highest CO2 saving") return b.co2Saved - a.co2Saved;
    if (sortBy === "Lowest price") return a.price - b.price;
    if (sortBy === "Top rated") return b.rating - a.rating;
    return 0;
  });

  const cartTotalCo2 = cart.reduce((total, item) => {
    const p = ECO_PRODUCTS.find((prod) => prod.id === item.id);
    return total + (p ? p.co2Saved * item.qty : 0);
  }, 0);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const treesEquivalent = Math.floor(cartTotalCo2 / 21);

  const addToCart = (id: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id, qty: 1 }];
    });
  };

  const toggleDesc = (id: string) => {
    setExpandedDesc((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAF5] dark:bg-[#0B1815] text-[#1B4332] dark:text-[#F8FAF5] pb-24 md:pb-8">
      
      {/* Hero Banner */}
      <div className="bg-[#2D6A4F] text-white py-12 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#F8FAF5 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <Leaf className="mx-auto mb-4 h-12 w-12 text-[#52B788]" />
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Every purchase is a vote for the planet</h1>
          <p className="text-lg md:text-xl text-[#B7E4C7] font-medium">
            <span className="font-bold text-white">4,280 kg CO2</span> saved by our community this month
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          
          {/* Filters & Sort */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1A2F2A] p-4 rounded-2xl shadow-sm border border-[#52B788]/20">
            <div className="flex overflow-x-auto gap-2 pb-2 md:pb-0 hide-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                    selectedCategory === cat
                      ? "bg-[#2D6A4F] text-white"
                      : "bg-[#F8FAF5] dark:bg-black/20 hover:bg-[#52B788]/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-black/20 px-4 py-2 text-sm font-medium focus:outline-none"
            >
              <option>Highest CO2 saving</option>
              <option>Lowest price</option>
              <option>Top rated</option>
            </select>
          </div>

          {/* Product Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((p) => (
              <div key={p.id} className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-5 shadow-sm border border-[#52B788]/20 flex flex-col hover:shadow-md transition">
                <div className="mb-4 flex items-start justify-between gap-2">
                  <span className="inline-block rounded-full bg-[#52B788]/10 px-3 py-1 text-xs font-bold text-[#2D6A4F] dark:text-[#52B788]">
                    {p.category}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-bold text-yellow-500">
                    <Star size={14} fill="currentColor" /> {p.rating}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-2 leading-tight">{p.name}</h3>
                
                <div className="mb-4 inline-flex self-start items-center gap-1.5 rounded-full bg-[#52B788] px-3 py-1 text-xs font-bold text-[#1B4332]">
                  <Leaf size={12} /> Saves {p.co2Saved} kg CO2/yr
                </div>

                <div className="mb-4 relative">
                  <p className={`text-sm text-neutral-600 dark:text-neutral-400 ${expandedDesc[p.id] ? "" : "line-clamp-2"}`}>
                    <span className="font-semibold text-[#2D6A4F] dark:text-[#52B788] mr-1">{p.badge} •</span>
                    {p.description}
                  </p>
                  <button onClick={() => toggleDesc(p.id)} className="text-xs font-bold text-[#52B788] mt-1 flex items-center hover:underline">
                    {expandedDesc[p.id] ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Learn more</>}
                  </button>
                </div>

                <div className="mt-auto pt-4 border-t border-[#52B788]/10 flex items-center justify-between">
                  <span className="text-2xl font-black">{p.currency}{p.price}</span>
                  <button
                    onClick={() => addToCart(p.id)}
                    className="flex items-center gap-2 rounded-xl bg-[#2D6A4F] px-4 py-2 font-bold text-white hover:bg-[#1B4332] transition"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Cart */}
        <div className="w-full md:w-80 md:shrink-0">
          <div className="sticky top-24 rounded-3xl bg-white dark:bg-[#1A2F2A] p-6 shadow-sm border border-[#52B788]/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-[#2D6A4F] dark:text-[#52B788]">
                <ShoppingCart /> Your Cart
              </h2>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#52B788] text-xs font-bold text-[#1B4332]">
                {cartItemsCount}
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="py-8 text-center text-neutral-500">
                <Leaf className="mx-auto h-12 w-12 opacity-20 mb-3" />
                <p>Your eco cart is empty.</p>
                <p className="text-sm mt-1">Start browsing to make an impact!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => {
                  const p = ECO_PRODUCTS.find(prod => prod.id === item.id);
                  if (!p) return null;
                  return (
                    <div key={item.id} className="flex justify-between text-sm items-center border-b border-[#52B788]/10 pb-2">
                      <div className="flex-1">
                        <p className="font-bold line-clamp-1">{p.name}</p>
                        <p className="text-xs text-[#52B788]">Qty: {item.qty} × ₹{p.price}</p>
                      </div>
                      <span className="font-bold ml-4">₹{p.price * item.qty}</span>
                    </div>
                  );
                })}
                <div className="pt-4 space-y-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₹{cart.reduce((tot, item) => tot + ((ECO_PRODUCTS.find(p => p.id === item.id)?.price || 0) * item.qty), 0)}</span>
                  </div>
                  <div className="rounded-xl bg-[#52B788]/20 p-3 text-sm font-semibold text-[#2D6A4F] dark:text-[#52B788] flex items-center gap-2">
                    <Leaf size={16} />
                    Saves {cartTotalCo2.toFixed(1)} kg CO2/yr
                  </div>
                </div>
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full mt-6 rounded-xl bg-[#2D6A4F] py-3.5 font-bold text-white hover:bg-[#1B4332] transition"
                >
                  Checkout securely
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Affiliate Disclosure */}
      <div className="max-w-7xl mx-auto px-4 pb-8 text-center text-xs text-neutral-500 font-medium">
        EcoStore links are for awareness. We may earn a small commission that funds platform development.
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#0B1815] p-8 text-center shadow-2xl border border-[#52B788]/20 animate-in zoom-in-95 relative">
            <button onClick={() => setShowCheckout(false)} className="absolute right-4 top-4 text-neutral-400 hover:text-black dark:hover:text-white">
              <X size={20} />
            </button>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#52B788]/20 text-3xl">
              🌱
            </div>
            <h2 className="text-2xl font-black text-[#2D6A4F] dark:text-[#52B788] mb-2">Checkout Simulation</h2>
            <p className="text-lg font-medium mb-4">
              Your eco cart saves <span className="font-bold text-[#2D6A4F] dark:text-[#52B788]">{cartTotalCo2.toFixed(1)} kg CO2/year</span>!
            </p>
            <p className="rounded-xl bg-[#F8FAF5] dark:bg-[#1A2F2A] p-4 text-sm font-semibold">
              That&apos;s like planting <span className="text-xl font-black text-[#52B788] mx-1">{treesEquivalent}</span> mature {treesEquivalent === 1 ? 'tree' : 'trees'} 🌳
            </p>
            <button
              onClick={() => { setCart([]); setShowCheckout(false); }}
              className="mt-6 w-full rounded-xl bg-[#2D6A4F] py-3 font-bold text-white hover:bg-[#1B4332] transition"
            >
              Confirm Purchase
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

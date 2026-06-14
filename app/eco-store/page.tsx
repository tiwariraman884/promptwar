"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ECO_PRODUCTS } from "@/lib/carbonData";
import { ShoppingCart, Star, Plus, Leaf, ChevronDown, ChevronUp, X, Minus, User, MapPin, Phone, Mail, CreditCard, CheckCircle, Package, Truck } from "lucide-react";

/* ─── Types ─── */
type CartItem = { id: string; qty: number };

interface PurchaseFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: "upi" | "cod" | "card";
}

const INITIAL_FORM: PurchaseFormData = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  paymentMethod: "upi",
};

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Chandigarh",
];

/* ─── Add-to-Cart Modal ─── */
function AddToCartModal({
  product,
  onClose,
  onConfirm,
}: {
  product: (typeof ECO_PRODUCTS)[0];
  onClose: () => void;
  onConfirm: (qty: number) => void;
}) {
  const [qty, setQty] = useState(1);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Add ${product.name} to cart`}
        className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0f201b] p-6 shadow-2xl border border-[#52B788]/20 animate-[modalIn_280ms_cubic-bezier(0.16,1,0.3,1)_forwards]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <span className="inline-block rounded-full bg-[#52B788]/10 px-3 py-1 text-xs font-bold text-[#2D6A4F] dark:text-[#52B788] mb-2">
              {product.category}
            </span>
            <h2 className="text-xl font-black text-[#1B4332] dark:text-white leading-tight">{product.name}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Product Info */}
        <div className="rounded-2xl bg-[#F8FAF5] dark:bg-[#1A2F2A] p-4 mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Unit Price</span>
            <span className="text-lg font-black text-[#1B4332] dark:text-white">{product.currency}{product.price}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">CO₂ Saved/yr</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2D6A4F] dark:text-[#52B788]">
              <Leaf size={14} /> {product.co2Saved} kg
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Rating</span>
            <span className="flex items-center gap-1 text-sm font-bold text-yellow-500">
              <Star size={14} fill="currentColor" /> {product.rating}
            </span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 pt-2 border-t border-[#52B788]/10">
            <span className="font-semibold text-[#2D6A4F] dark:text-[#52B788] mr-1">{product.badge} •</span>
            {product.description}
          </p>
        </div>

        {/* Quantity selector */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm font-bold text-[#1B4332] dark:text-white">Quantity</span>
          <div className="flex items-center gap-3 rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-1 py-1">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              aria-label="Decrease quantity"
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[#52B788]/20 disabled:opacity-30 transition"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center text-lg font-black tabular-nums">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(10, q + 1))}
              disabled={qty >= 10}
              aria-label="Increase quantity"
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[#52B788]/20 disabled:opacity-30 transition"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Total + impact */}
        <div className="rounded-2xl bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] p-4 text-white mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white/70">Total</span>
            <span className="text-2xl font-black tabular-nums">{product.currency}{product.price * qty}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-[#52B788]">
            <Leaf size={14} />
            This purchase saves {(product.co2Saved * qty).toFixed(1)} kg CO₂/year
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-[#52B788]/30 py-3 font-bold text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#52B788]/10 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(qty)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] py-3 font-bold text-white hover:bg-[#1B4332] transition"
          >
            <Plus size={16} /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Purchase / Checkout Form Modal ─── */
function PurchaseFormModal({
  cart,
  onClose,
  onConfirmPurchase,
}: {
  cart: CartItem[];
  onClose: () => void;
  onConfirmPurchase: () => void;
}) {
  const [form, setForm] = useState<PurchaseFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof PurchaseFormData, string>>>({});
  const [step, setStep] = useState<"form" | "review" | "success">("form");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const updateField = (field: keyof PurchaseFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PurchaseFormData, string>> = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Valid email is required";
    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone)) newErrors.phone = "Valid 10-digit phone number required";
    if (!form.address.trim()) newErrors.address = "Delivery address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state) newErrors.state = "State is required";
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode)) newErrors.pincode = "Valid 6-digit PIN code required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) setStep("review");
  };

  const handleConfirm = () => {
    setStep("success");
    setTimeout(() => {
      onConfirmPurchase();
    }, 3000);
  };

  const cartTotal = cart.reduce((tot, item) => tot + ((ECO_PRODUCTS.find((p) => p.id === item.id)?.price || 0) * item.qty), 0);
  const cartTotalCo2 = cart.reduce((total, item) => {
    const p = ECO_PRODUCTS.find((prod) => prod.id === item.id);
    return total + (p ? p.co2Saved * item.qty : 0);
  }, 0);

  const InputField = ({ label, field, type = "text", placeholder, icon: Icon }: { label: string; field: keyof PurchaseFormData; type?: string; placeholder: string; icon: any }) => (
    <div>
      <label className="block text-sm font-bold text-[#1B4332] dark:text-white/80 mb-1.5">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#52B788]/60" />
        <input
          type={type}
          value={form[field] as string}
          onChange={(e) => updateField(field, e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border ${errors[field] ? "border-red-400 bg-red-50 dark:bg-red-900/10" : "border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A]"} pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#52B788] transition`}
        />
      </div>
      {errors[field] && <p className="text-xs text-red-500 font-medium mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Complete your purchase"
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#0f201b] shadow-2xl border border-[#52B788]/20 animate-[modalIn_280ms_cubic-bezier(0.16,1,0.3,1)_forwards]"
      >
        {/* ── Success State ── */}
        {step === "success" && (
          <div className="p-8 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#52B788]/20">
              <CheckCircle size={40} className="text-[#2D6A4F] dark:text-[#52B788]" />
            </div>
            <h2 className="text-2xl font-black text-[#2D6A4F] dark:text-[#52B788] mb-2">Order Confirmed! 🌱</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Thank you, <span className="font-bold">{form.fullName}</span>! Your eco-friendly purchase is being processed.
            </p>
            <div className="rounded-2xl bg-[#F8FAF5] dark:bg-[#1A2F2A] p-5 space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm">
                <ShoppingCart size={16} className="text-[#52B788]" />
                <span>Order #{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={16} className="text-[#52B788]" />
                <span>Estimated delivery: 5-7 business days</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={16} className="text-[#52B788]" />
                <span className="line-clamp-1">{form.address}, {form.city} — {form.pincode}</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-[#2D6A4F] dark:text-[#52B788]">
                <Leaf size={16} />
                <span>Your purchase saves {cartTotalCo2.toFixed(1)} kg CO₂/year!</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-neutral-400">Redirecting to store...</p>
          </div>
        )}

        {/* ── Review State ── */}
        {step === "review" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-[#1B4332] dark:text-white">Review Order</h2>
              <button onClick={onClose} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10 transition">
                <X size={20} />
              </button>
            </div>

            {/* Order Items */}
            <div className="rounded-2xl bg-[#F8FAF5] dark:bg-[#1A2F2A] p-4 mb-4 space-y-3">
              <h3 className="text-sm font-bold text-[#2D6A4F] dark:text-[#52B788] uppercase tracking-wider">Items</h3>
              {cart.map((item) => {
                const p = ECO_PRODUCTS.find((prod) => prod.id === item.id);
                if (!p) return null;
                return (
                  <div key={item.id} className="flex justify-between text-sm border-b border-[#52B788]/10 pb-2 last:border-0">
                    <div>
                      <p className="font-bold line-clamp-1">{p.name}</p>
                      <p className="text-xs text-neutral-500">Qty: {item.qty}</p>
                    </div>
                    <span className="font-bold shrink-0">₹{p.price * item.qty}</span>
                  </div>
                );
              })}
              <div className="flex justify-between font-black text-lg pt-2 border-t border-[#52B788]/20">
                <span>Total</span>
                <span>₹{cartTotal}</span>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="rounded-2xl bg-[#F8FAF5] dark:bg-[#1A2F2A] p-4 mb-4 space-y-2">
              <h3 className="text-sm font-bold text-[#2D6A4F] dark:text-[#52B788] uppercase tracking-wider">Delivery Details</h3>
              <div className="text-sm space-y-1.5">
                <p><span className="font-bold">{form.fullName}</span></p>
                <p className="text-neutral-600 dark:text-neutral-400">{form.address}</p>
                <p className="text-neutral-600 dark:text-neutral-400">{form.city}, {form.state} — {form.pincode}</p>
                <p className="text-neutral-600 dark:text-neutral-400">{form.phone} • {form.email}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-2xl bg-[#F8FAF5] dark:bg-[#1A2F2A] p-4 mb-5">
              <h3 className="text-sm font-bold text-[#2D6A4F] dark:text-[#52B788] uppercase tracking-wider mb-2">Payment</h3>
              <p className="text-sm font-bold">
                {form.paymentMethod === "upi" ? "📱 UPI / Google Pay / PhonePe" : form.paymentMethod === "cod" ? "💵 Cash on Delivery" : "💳 Credit/Debit Card"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep("form")}
                className="flex-1 rounded-xl border border-[#52B788]/30 py-3.5 font-bold text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#52B788]/10 transition"
              >
                ← Edit Details
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] py-3.5 font-bold text-white hover:bg-[#1B4332] transition"
              >
                <CheckCircle size={16} /> Confirm Purchase
              </button>
            </div>
          </div>
        )}

        {/* ── Form State ── */}
        {step === "form" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-black text-[#1B4332] dark:text-white">Complete Your Purchase</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Fill in your delivery details</p>
              </div>
              <button onClick={onClose} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10 transition">
                <X size={20} />
              </button>
            </div>

            {/* Order summary strip */}
            <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#2D6A4F] to-[#1B4332] px-4 py-3 mb-5 text-white">
              <div className="flex items-center gap-2 text-sm font-bold">
                <ShoppingCart size={16} />
                {cart.reduce((s, i) => s + i.qty, 0)} items
              </div>
              <div className="text-right">
                <p className="text-lg font-black tabular-nums">₹{cartTotal}</p>
                <p className="text-[10px] font-bold text-[#52B788]">Saves {cartTotalCo2.toFixed(1)} kg CO₂/yr</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Personal Info */}
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#52B788] flex items-center gap-2">
                <User size={14} /> Personal Information
              </h3>
              <InputField label="Full Name" field="fullName" placeholder="Raman Kumar" icon={User} />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Email" field="email" type="email" placeholder="raman@email.com" icon={Mail} />
                <InputField label="Phone" field="phone" type="tel" placeholder="9876543210" icon={Phone} />
              </div>

              {/* Address */}
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#52B788] flex items-center gap-2 pt-2">
                <MapPin size={14} /> Delivery Address
              </h3>
              <InputField label="Address" field="address" placeholder="House no, Street, Locality" icon={MapPin} />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="City" field="city" placeholder="Dehradun" icon={MapPin} />
                <div>
                  <label className="block text-sm font-bold text-[#1B4332] dark:text-white/80 mb-1.5">State</label>
                  <select
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    className={`w-full rounded-xl border ${errors.state ? "border-red-400 bg-red-50 dark:bg-red-900/10" : "border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A]"} px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#52B788] transition`}
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p className="text-xs text-red-500 font-medium mt-1">{errors.state}</p>}
                </div>
              </div>
              <InputField label="PIN Code" field="pincode" placeholder="248001" icon={MapPin} />

              {/* Payment */}
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#52B788] flex items-center gap-2 pt-2">
                <CreditCard size={14} /> Payment Method
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { key: "upi", label: "UPI", emoji: "📱" },
                  { key: "cod", label: "COD", emoji: "💵" },
                  { key: "card", label: "Card", emoji: "💳" },
                ] as const).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => updateField("paymentMethod", opt.key)}
                    className={`rounded-xl border p-3 text-center text-sm font-bold transition ${
                      form.paymentMethod === opt.key
                        ? "border-[#2D6A4F] bg-[#52B788]/15 text-[#2D6A4F] dark:text-[#52B788] ring-2 ring-[#52B788]/30"
                        : "border-[#52B788]/20 bg-[#F8FAF5] dark:bg-[#1A2F2A] hover:border-[#52B788]/50"
                    }`}
                  >
                    <span className="text-lg block mb-0.5">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              className="w-full mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] py-3.5 font-bold text-white hover:bg-[#1B4332] transition"
            >
              Review Order →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Eco Store Page ─── */
export default function EcoStorePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Highest CO2 saving");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [expandedDesc, setExpandedDesc] = useState<Record<string, boolean>>({});
  const [addModalProduct, setAddModalProduct] = useState<(typeof ECO_PRODUCTS)[0] | null>(null);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);

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

  const addToCart = useCallback((id: string, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { id, qty }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateCartQty = useCallback((id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  const toggleDesc = (id: string) => {
    setExpandedDesc((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConfirmPurchase = () => {
    setCart([]);
    setShowPurchaseForm(false);
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
            <span className="font-bold text-white">{ECO_PRODUCTS.length} eco products</span> across {new Set(ECO_PRODUCTS.map(p => p.category)).size} categories
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
                  <span className="ml-1 text-xs opacity-60">
                    ({cat === "All" ? ECO_PRODUCTS.length : ECO_PRODUCTS.filter(p => p.category === cat).length})
                  </span>
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
              <div key={p.id} className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-5 shadow-sm border border-[#52B788]/20 flex flex-col hover:shadow-md transition group">
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
                    onClick={() => setAddModalProduct(p)}
                    aria-label={`Add ${p.name} to cart`}
                    className="flex items-center gap-2 rounded-xl bg-[#2D6A4F] px-4 py-2.5 font-bold text-white hover:bg-[#1B4332] transition active:scale-95"
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
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#52B788] text-xs font-bold text-[#1B4332]">
                {cartItemsCount}
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="py-8 text-center text-neutral-500">
                <Leaf className="mx-auto h-12 w-12 opacity-20 mb-3" />
                <p>Your eco cart is empty.</p>
                <p className="text-sm mt-1">Tap <span className="font-bold text-[#2D6A4F] dark:text-[#52B788]">+ Add</span> on any product!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => {
                  const p = ECO_PRODUCTS.find((prod) => prod.id === item.id);
                  if (!p) return null;
                  return (
                    <div key={item.id} className="rounded-xl bg-[#F8FAF5] dark:bg-black/15 p-3">
                      <div className="flex justify-between text-sm items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold line-clamp-1">{p.name}</p>
                          <p className="text-xs text-[#52B788] mt-0.5">
                            <Leaf size={10} className="inline mr-1" />{(p.co2Saved * item.qty).toFixed(1)} kg CO₂ saved
                          </p>
                        </div>
                        <span className="font-bold shrink-0">₹{p.price * item.qty}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 rounded-lg border border-[#52B788]/20 bg-white dark:bg-[#1A2F2A]">
                          <button onClick={() => updateCartQty(item.id, -1)} aria-label="Decrease" className="h-7 w-7 flex items-center justify-center hover:bg-[#52B788]/10 rounded-l-lg transition">
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-xs font-bold tabular-nums">{item.qty}</span>
                          <button onClick={() => updateCartQty(item.id, 1)} aria-label="Increase" className="h-7 w-7 flex items-center justify-center hover:bg-[#52B788]/10 rounded-r-lg transition">
                            <Plus size={12} />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} aria-label={`Remove ${p.name}`} className="text-xs font-bold text-red-500 hover:underline">
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}

                <div className="pt-4 space-y-2 border-t border-[#52B788]/15">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₹{cart.reduce((tot, item) => tot + ((ECO_PRODUCTS.find((p) => p.id === item.id)?.price || 0) * item.qty), 0)}</span>
                  </div>
                  <div className="rounded-xl bg-[#52B788]/20 p-3 text-sm font-semibold text-[#2D6A4F] dark:text-[#52B788] flex items-center gap-2">
                    <Leaf size={16} />
                    Saves {cartTotalCo2.toFixed(1)} kg CO₂/yr ≈ {treesEquivalent} {treesEquivalent === 1 ? "tree" : "trees"} 🌳
                  </div>
                </div>

                <button
                  onClick={() => setShowPurchaseForm(true)}
                  className="w-full mt-2 rounded-xl bg-[#2D6A4F] py-3.5 font-bold text-white hover:bg-[#1B4332] transition flex items-center justify-center gap-2"
                >
                  <CreditCard size={16} /> Checkout securely
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

      {/* Add-to-Cart Modal */}
      {addModalProduct && (
        <AddToCartModal
          product={addModalProduct}
          onClose={() => setAddModalProduct(null)}
          onConfirm={(qty) => {
            addToCart(addModalProduct.id, qty);
            setAddModalProduct(null);
          }}
        />
      )}

      {/* Purchase Form Modal */}
      {showPurchaseForm && (
        <PurchaseFormModal
          cart={cart}
          onClose={() => setShowPurchaseForm(false)}
          onConfirmPurchase={handleConfirmPurchase}
        />
      )}
    </div>
  );
}

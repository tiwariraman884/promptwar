"use client";

import { motion } from "framer-motion";
import { Bike, Building2, Check, MapPin, Target, Utensils } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MotionPage } from "@/components/motion-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { SettingsDB } from "@/lib/settings-db";

/* Lazy-load the India map so SSR doesn't break (canvas + requestAnimationFrame) */
const IndiaMap3D = dynamic(() => import("@/components/IndiaMap3D"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[340px] items-center justify-center rounded-card bg-[#0d1f1a]">
      <div className="h-40 w-28 animate-pulse rounded-2xl bg-[#1a3a2a]" />
    </div>
  ),
});

const cities = [
  "Haridwar",
  "Dehradun",
  "Rishikesh",
  "Roorkee",
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "Pune",
  "Jaipur",
  "Lucknow",
  "Hyderabad"
];

const steps = ["Where are you?", "Your lifestyle", "Set your goal"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState("");
  const [city, setCity] = useState("Haridwar");
  const [manualCity, setManualCity] = useState("");
  const [diet, setDiet] = useState("vegetarian");
  const [homeType, setHomeType] = useState("apartment");
  const [vehicle, setVehicle] = useState("two_wheeler_petrol");
  const [goal, setGoal] = useState(20);
  const [saving, setSaving] = useState(false);

  const selectedCity = useMemo(() => manualCity.trim() || city, [city, manualCity]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();

    void supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, city, state, diet_type, onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.display_name) setUserName(profile.display_name);
      if (profile?.city) setCity(profile.city);
      if (profile?.diet_type) setDiet(profile.diet_type);

      if (profile?.onboarding_completed) {
        router.replace("/dashboard");
      }
    });
  }, [router]);

  const save = async () => {
    if (!isSupabaseConfigured()) {
      router.push("/dashboard");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      const displayName =
        userName.trim() ||
        (user.user_metadata?.full_name as string | undefined) ||
        (user.user_metadata?.name as string | undefined) ||
        "Eco User";

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: displayName,
        city: selectedCity,
        state: selectedCity === "Haridwar" ? "Uttarakhand" : "",
        diet_type: diet,
        onboarding_completed: true,
      });

      if (error) {
        throw error;
      }

      SettingsDB.updateProfile({
        name: displayName,
        email: user.email ?? "",
      });

      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MotionPage>
      <section className="mx-auto max-w-3xl space-y-5">
        <div className="flex items-center justify-center gap-2" aria-label="Onboarding progress">
          {steps.map((item, index) => (
            <button
              aria-label={`Go to ${item}`}
              className={cn(
                "h-3 rounded-full transition-all",
                index === step ? "w-10 bg-primary" : "w-3 bg-line dark:bg-white/20"
              )}
              key={item}
              onClick={() => setStep(index)}
              type="button"
            />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
          {/* LEFT PANEL: India map on ALL steps */}
          <IndiaMap3D
            selectedCity={selectedCity}
            step={step}
            diet={diet}
            vehicle={vehicle}
            goal={goal}
          />

          <Card className="min-h-[420px]">
            <Badge tone="green">Step {step + 1} of 3</Badge>
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
              initial={{ opacity: 0, y: 10 }}
              key={step}
              transition={{ duration: 0.24 }}
            >
              <h1 className="font-heading text-2xl font-extrabold text-primary-dark dark:text-white">
                {steps[step]}
              </h1>

              {step === 0 && (
                <div className="mt-5 space-y-4">
                  <label className="block text-sm font-bold text-ink/70 dark:text-white/70">
                    Your name
                    <Input
                      className="mt-2"
                      onChange={(event) => setUserName(event.target.value)}
                      placeholder="Enter your name"
                      value={userName}
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {cities.map((item) => (
                      <button
                        className={cn(
                          "min-h-11 rounded-pill border px-3 text-sm font-bold transition",
                          selectedCity === item && !manualCity
                            ? "border-primary bg-primary text-white"
                            : "border-line bg-white text-ink hover:border-primary dark:border-white/10 dark:bg-white/5 dark:text-white"
                        )}
                        key={item}
                        onClick={() => {
                          setCity(item);
                          setManualCity("");
                        }}
                        type="button"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <label className="block text-sm font-bold text-ink/70 dark:text-white/70">
                    Manual city
                    <Input
                      className="mt-2"
                      onChange={(event) => setManualCity(event.target.value)}
                      placeholder="Type your city"
                      value={manualCity}
                    />
                  </label>
                </div>
              )}

              {step === 1 && (
                <div className="mt-5 space-y-5">
                  <div>
                    <p className="mb-2 text-sm font-bold text-ink/70 dark:text-white/70">
                      Diet type
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        ["vegan", "Vegan"],
                        ["vegetarian", "Veg"],
                        ["non_veg", "Non-veg"]
                      ].map(([value, label]) => (
                        <button
                          className={cn(
                            "min-h-12 rounded-pill border text-sm font-bold",
                            diet === value
                              ? "border-primary bg-primary text-white"
                              : "border-line bg-white text-ink dark:border-white/10 dark:bg-white/5 dark:text-white"
                          )}
                          key={value}
                          onClick={() => setDiet(value)}
                          type="button"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="block text-sm font-bold text-ink/70 dark:text-white/70">
                    Home type
                    <select
                      className="mt-2 min-h-11 w-full rounded-card border border-line bg-white px-3 text-sm text-ink dark:border-white/10 dark:bg-white/5 dark:text-white"
                      onChange={(event) => setHomeType(event.target.value)}
                      value={homeType}
                    >
                      <option value="apartment">Apartment</option>
                      <option value="independent_house">Independent house</option>
                      <option value="hostel_pg">Hostel / PG</option>
                      <option value="shared_home">Shared home</option>
                    </select>
                  </label>

                  <label className="block text-sm font-bold text-ink/70 dark:text-white/70">
                    Vehicle owned
                    <select
                      className="mt-2 min-h-11 w-full rounded-card border border-line bg-white px-3 text-sm text-ink dark:border-white/10 dark:bg-white/5 dark:text-white"
                      onChange={(event) => setVehicle(event.target.value)}
                      value={vehicle}
                    >
                      <option value="none">No personal vehicle</option>
                      <option value="two_wheeler_petrol">Petrol two-wheeler</option>
                      <option value="two_wheeler_ev">EV two-wheeler</option>
                      <option value="petrol_car">Petrol car</option>
                      <option value="diesel_car">Diesel car</option>
                    </select>
                  </label>
                </div>
              )}

              {step === 2 && (
                <div className="mt-5 space-y-5">
                  <div className="rounded-card bg-primary-light p-5 dark:bg-white/10">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-primary-dark dark:bg-[#10231F]">
                        <Target aria-hidden size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink/65 dark:text-white/65">
                          I want to reduce my footprint by
                        </p>
                        <p className="font-heading text-4xl font-extrabold text-primary-dark dark:text-white">
                          {goal}%
                        </p>
                        <p className="text-sm font-bold text-ink/65 dark:text-white/65">
                          in 6 months
                        </p>
                      </div>
                    </div>
                    <input
                      aria-label="Six month reduction goal"
                      className="mt-6 h-11 w-full"
                      max={60}
                      min={5}
                      onChange={(event) => setGoal(Number(event.target.value))}
                      step={5}
                      type="range"
                      value={goal}
                    />
                  </div>
                  <div className="grid gap-2 text-sm text-ink/70 dark:text-white/70">
                    <p className="flex items-center gap-2">
                      <MapPin aria-hidden size={18} /> {selectedCity || "Haridwar"}
                    </p>
                    <p className="flex items-center gap-2">
                      <Utensils aria-hidden size={18} /> {diet.replace("_", "-")}
                    </p>
                    <p className="flex items-center gap-2">
                      {vehicle.includes("two_wheeler") ? (
                        <Bike aria-hidden size={18} />
                      ) : (
                        <Building2 aria-hidden size={18} />
                      )}
                      {vehicle.replaceAll("_", " ")}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button
                disabled={step === 0}
                onClick={() => setStep((current) => Math.max(0, current - 1))}
                type="button"
                variant="secondary"
              >
                Back
              </Button>
              {step < 2 ? (
                <Button
                  onClick={() => setStep((current) => Math.min(2, current + 1))}
                  type="button"
                >
                  Continue
                </Button>
              ) : (
                <Button onClick={save} type="button" disabled={saving}>
                  <Check aria-hidden size={18} />
                  {saving ? "Saving…" : "Start tracking"}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </section>
    </MotionPage>
  );
}

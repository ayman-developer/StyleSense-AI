"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Auth check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        router.replace("/login");
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, [router]);

  // Gender state
  const [gender, setGender] = useState("male");

  // Occasion state
  const [occasion, setOccasion] = useState("Casual");

  // Weather state
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [showCitySearch, setShowCitySearch] = useState(false);

  // Outfit state
  const [outfit, setOutfit] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [outfitError, setOutfitError] = useState("");

  // Auto detect weather on load
  useEffect(() => {
    if (!authLoading && user) {
      setWeatherLoading(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            await fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
          },
          () => {
            setWeatherLoading(false);
            setShowCitySearch(true);
          }
        );
      } else {
        setWeatherLoading(false);
        setShowCitySearch(true);
      }
    }
  }, [authLoading, user]);

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    setWeatherLoading(true);
    setWeatherError("");
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setWeather(data);
      setShowCitySearch(false);
    } catch (err: any) {
      setWeatherError(err.message);
      setShowCitySearch(true);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleCitySearch = async () => {
    if (!cityInput.trim()) return;
    setWeatherLoading(true);
    setWeatherError("");
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(cityInput.trim())}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setWeather(data);
      setShowCitySearch(false);
    } catch (err: any) {
      setWeatherError("City not found. Try: Chennai, Coimbatore, Mumbai");
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleGenerateOutfit = async () => {
    if (!weather) {
      setOutfitError("Please search your city first to get weather!");
      return;
    }
    setGenerating(true);
    setOutfit(null);
    setOutfitError("");
    try {
      const res = await fetch("/api/outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weather, occasion, gender }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setOutfit(data);
    } catch (err: any) {
      setOutfitError(err.message || "Failed to generate outfit. Check GROQ_API_KEY.");
    } finally {
      setGenerating(false);
    }
  };

  const maleOccasions = ["Casual", "Office", "Formal", "Party", "Date Night", "Gym", "Travel", "Festival", "Traditional (Kurta/Dhoti)"];
  const femaleOccasions = ["Casual", "Office", "Formal", "Party", "Date Night", "Gym", "Travel", "Festival", "Traditional (Saree/Salwar)", "Wedding Guest", "Brunch"];

  if (authLoading)
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#F8F9FF" }}>
        <p>Loading...</p>
      </div>
    );

  return (
    <div style={{ background: "#F8F9FF", minHeight: "100vh", padding: "2rem 1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Welcome */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1A1A2E" }}>
          Welcome back, {user?.displayName?.split(" ")[0] || "User"}! {gender === "male" ? "👨💼" : "👩💼"}
        </h1>
        <p style={{ color: "#6B7280", marginTop: "0.25rem" }}>Personalized fashion intelligence for you.</p>
      </div>

      {/* Gender Toggle */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", background: "#F3F4FF", padding: "0.25rem", borderRadius: "12px", width: "fit-content" }}>
        <button
          onClick={() => {
            setGender("male");
            setOccasion("Casual");
            setOutfit(null);
          }}
          style={{
            padding: "0.6rem 1.5rem",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.9rem",
            transition: "all 0.2s",
            background: gender === "male" ? "linear-gradient(135deg, #7C3AED, #EC4899)" : "transparent",
            color: gender === "male" ? "white" : "#6B7280",
          }}
        >
          👨 Male
        </button>
        <button
          onClick={() => {
            setGender("female");
            setOccasion("Casual");
            setOutfit(null);
          }}
          style={{
            padding: "0.6rem 1.5rem",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.9rem",
            transition: "all 0.2s",
            background: gender === "female" ? "linear-gradient(135deg, #7C3AED, #EC4899)" : "transparent",
            color: gender === "female" ? "white" : "#6B7280",
          }}
        >
          👩 Female
        </button>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "1.5rem", alignItems: "start" }}>
        {/* LEFT: Outfit Generator */}
        <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "1.5rem", border: "1px solid #E2E4F0", boxShadow: "0 2px 12px rgba(124,58,237,0.08)" }}>
          <h2 style={{ color: "#1A1A2E", marginBottom: "1rem", fontSize: "1.1rem", fontWeight: "600" }}>⚡ Outfit Generator</h2>
          <p style={{ fontSize: "0.75rem", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "0.75rem" }}>THE OCCASION</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
            {(gender === "male" ? maleOccasions : femaleOccasions).map((occ) => (
              <button
                key={occ}
                onClick={() => setOccasion(occ)}
                style={{
                  padding: "0.45rem 1rem",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  transition: "all 0.2s",
                  border: "none",
                  background: occasion === occ ? "linear-gradient(135deg, #7C3AED, #EC4899)" : "#F3F4FF",
                  color: occasion === occ ? "white" : "#1A1A2E",
                }}
              >
                {occ}
              </button>
            ))}
          </div>

          {outfitError && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "10px", padding: "0.75rem", marginBottom: "1rem", color: "#DC2626", fontSize: "0.875rem" }}>
              ⚠️ {outfitError}
            </div>
          )}

          <button
            onClick={handleGenerateOutfit}
            disabled={generating}
            style={{
              width: "100%",
              height: "52px",
              border: "none",
              borderRadius: "12px",
              cursor: generating ? "not-allowed" : "pointer",
              background: generating ? "#C4B5FD" : "linear-gradient(135deg, #7C3AED, #EC4899)",
              color: "white",
              fontWeight: "600",
              fontSize: "1rem",
              letterSpacing: "0.03em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            {generating ? (
              <>
                <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span> Generating...
              </>
            ) : (
              "⚡ GENERATE OUTFIT"
            )}
          </button>

          {/* Outfit Result */}
          {outfit && (
            <div style={{ marginTop: "1.5rem", background: "linear-gradient(135deg, #FAF5FF, #FDF2F8)", border: "1px solid #DDD6FE", borderRadius: "16px", padding: "1.5rem" }}>
              <h3 style={{ color: "#7C3AED", marginBottom: "1rem", fontSize: "1.1rem", fontWeight: "600" }}>
                ✨ Your {occasion} Outfit
              </h3>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {outfit.top && (
                  <p style={{ color: "#1A1A2E" }}>
                    <strong>👕 Top:</strong> {outfit.top}
                  </p>
                )}
                {outfit.outfit && (
                  <p style={{ color: "#1A1A2E" }}>
                    <strong>👗 Outfit:</strong> {outfit.outfit}
                  </p>
                )}
                {outfit.bottom && (
                  <p style={{ color: "#1A1A2E" }}>
                    <strong>👖 Bottom:</strong> {outfit.bottom}
                  </p>
                )}
                {outfit.footwear && (
                  <p style={{ color: "#1A1A2E" }}>
                    <strong>👟 Footwear:</strong> {outfit.footwear}
                  </p>
                )}
                {outfit.accessory && (
                  <p style={{ color: "#1A1A2E" }}>
                    <strong>⌚ Accessory:</strong> {outfit.accessory}
                  </p>
                )}
                {outfit.bag && (
                  <p style={{ color: "#1A1A2E" }}>
                    <strong>👜 Bag:</strong> {outfit.bag}
                  </p>
                )}
                {outfit.jewellery && (
                  <p style={{ color: "#1A1A2E" }}>
                    <strong>💍 Jewellery:</strong> {outfit.jewellery}
                  </p>
                )}
                {outfit.outerwear && (
                  <p style={{ color: "#1A1A2E" }}>
                    <strong>🧥 Outerwear:</strong> {outfit.outerwear}
                  </p>
                )}
                {outfit.colors && (
                  <p style={{ color: "#1A1A2E" }}>
                    <strong>🎨 Colors:</strong> {outfit.colors}
                  </p>
                )}
                {outfit.fabric_recommendation && (
                  <p style={{ color: "#1A1A2E" }}>
                    <strong>🧵 Fabric:</strong> {outfit.fabric_recommendation}
                  </p>
                )}
                {outfit.tip && (
                  <div style={{ background: "#EEF2FF", borderRadius: "10px", padding: "0.75rem", borderLeft: "3px solid #7C3AED" }}>
                    <p style={{ color: "#5B21B6", fontStyle: "italic" }}>💡 {outfit.tip}</p>
                  </div>
                )}
                {outfit.avoid && <p style={{ color: "#DC2626", fontSize: "0.875rem" }}>❌ Avoid: {outfit.avoid}</p>}
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <button style={{ flex: 1, padding: "0.6rem", background: "#DCFCE7", color: "#16A34A", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600" }}>👍 Love it</button>
                <button style={{ flex: 1, padding: "0.6rem", background: "#FEE2E2", color: "#DC2626", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600" }}>👎 Not for me</button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Weather + Wardrobe */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Weather Card */}
          <div style={{ background: "linear-gradient(135deg, #EEF2FF, #FAF5FF)", border: "1px solid #DDD6FE", borderRadius: "16px", padding: "1.5rem" }}>
            {weatherLoading && (
              <div style={{ textAlign: "center", color: "#7C3AED", padding: "1rem" }}>
                <p>📍 Detecting location...</p>
              </div>
            )}

            {weather && !weatherLoading && (
              <div>
                <p style={{ color: "#7C3AED", fontWeight: "600", fontSize: "0.95rem", marginBottom: "0.5rem" }}>
                  📍 {weather.city}, {weather.country}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                  {weather.icon_url && <img src={weather.icon_url} width={56} height={56} alt={weather.condition} />}
                  <span style={{ fontSize: "3.5rem", fontWeight: "800", color: "#1A1A2E", lineHeight: 1 }}>{weather.temp}°C</span>
                </div>
                <p style={{ color: "#6B7280", textTransform: "capitalize", marginBottom: "0.75rem" }}>
                  {weather.condition} · Feels like {weather.feels_like}°C
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <div style={{ background: "white", borderRadius: "10px", padding: "0.6rem", textAlign: "center" }}>
                    <p style={{ fontSize: "0.7rem", color: "#9CA3AF", textTransform: "uppercase" }}>Humidity</p>
                    <p style={{ fontWeight: "700", color: "#1A1A2E" }}>{weather.humidity}%</p>
                  </div>
                  <div style={{ background: "white", borderRadius: "10px", padding: "0.6rem", textAlign: "center" }}>
                    <p style={{ fontSize: "0.7rem", color: "#9CA3AF", textTransform: "uppercase" }}>Wind</p>
                    <p style={{ fontWeight: "700", color: "#1A1A2E" }}>{weather.wind} km/h</p>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#6B7280", marginBottom: "0.75rem" }}>
                  <span>🌅 {weather.sunrise}</span>
                  <span>🌇 {weather.sunset}</span>
                </div>
                <div style={{ background: "#7C3AED", borderRadius: "10px", padding: "0.6rem", textAlign: "center" }}>
                  <p style={{ color: "white", fontSize: "0.8rem", fontWeight: "500" }}>
                    {weather.temp >= 35
                      ? "🔥 Very Hot — Wear light cotton/linen"
                      : weather.temp >= 30
                      ? "☀️ Hot — Light breathable fabrics"
                      : weather.temp >= 25
                      ? "🌤️ Warm — Light layers work well"
                      : weather.temp >= 20
                      ? "⛅ Pleasant — Any outfit works"
                      : weather.temp >= 15
                      ? "🌥️ Cool — Add a light jacket"
                      : "🧥 Cold — Layer up with warm clothing"}
                  </p>
                </div>
                <button
                  onClick={() => setShowCitySearch(true)}
                  style={{
                    marginTop: "0.75rem",
                    width: "100%",
                    padding: "0.5rem",
                    background: "transparent",
                    border: "1px solid #DDD6FE",
                    borderRadius: "10px",
                    color: "#7C3AED",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "500",
                  }}
                >
                  🔄 Change City
                </button>
              </div>
            )}

            {(showCitySearch || weatherError) && !weatherLoading && (
              <div>
                {weatherError && <p style={{ color: "#DC2626", fontSize: "0.85rem", marginBottom: "0.75rem" }}>⚠️ {weatherError}</p>}
                <p style={{ color: "#6B7280", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Enter your city:</p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCitySearch()}
                    placeholder="e.g. Coimbatore"
                    style={{ flex: 1, padding: "0.6rem 0.75rem", borderRadius: "10px", border: "1px solid #E2E4F0", fontSize: "0.9rem", background: "white", color: "#1A1A2E", outline: "none" }}
                  />
                  <button
                    onClick={handleCitySearch}
                    style={{ padding: "0.6rem 1rem", background: "linear-gradient(135deg, #7C3AED, #EC4899)", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" }}
                  >
                    Search
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Wardrobe Intelligence Card */}
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E4F0", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 2px 12px rgba(124,58,237,0.08)" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "0.75rem" }}>⚡ WARDROBE INTELLIGENCE</p>
            <p style={{ color: "#6B7280", fontSize: "0.875rem", marginBottom: "1rem" }}>Upload your clothes to get AI analysis and outfit recommendations from your own wardrobe.</p>
            <button
              onClick={() => (window.location.href = "/wardrobe")}
              style={{ width: "100%", padding: "0.75rem", background: "linear-gradient(135deg, #7C3AED, #EC4899)", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "600", fontSize: "0.9rem" }}
            >
              Go to Wardrobe →
            </button>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

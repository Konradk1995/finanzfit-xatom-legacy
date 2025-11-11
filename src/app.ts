import { onReady } from "@xatom/core";
import { initRoutes } from "./routes";

onReady(() => {
  console.log("✅ xAtom: Routes starten");
  try {
    initRoutes();
  } catch (e) {
    console.error("❌ Routen-Initialisierung fehlgeschlagen", e);
  }
});

// Webflow-Typen deklarieren
declare global {
  interface Window {
    Webflow: any;
    __finanzfit_app_initialized?: boolean;
  }
}

import { initFAQ } from "./components/FAQ";
import { initMovingBanner } from "./components/MovingBanner";

// Hauptfunktion für die FinanzFit-Integration
// Optional: Legacy-Schutz gegen doppelte Initialisierung bleibt erhalten, falls nötig
if (!window.__finanzfit_app_initialized) {
  window.__finanzfit_app_initialized = true;
}

// Sanity-Checks für globale Komponenten
try {
  // Header-Container sollte vorhanden sein
  const hasNavbar = !!document.querySelector(
    ".section_navbar, .navbar6_component"
  );
  if (!hasNavbar) console.warn("⚠️ Header-Container nicht gefunden");
} catch {}

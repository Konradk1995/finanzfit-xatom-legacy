import { WFRoute } from "@xatom/core";
import { ReadMore } from "../components/ReadMore";
import { Erstgespraeche } from "../components/Erstgespraeche";
import { initFAQ } from "../components/FAQ";
import { initMovingBanner } from "../components/MovingBanner";
import { initVideoSectionHome } from "../components/VideoSection";
// @ts-ignore: Komponenten-Datei ist vorhanden; Build erfolgreich
import { Vertragscheck } from "../components/Vertragscheck";

// Initialisiert alle Seiten-spezifischen Routen
export const initRoutes = () => {
  console.log("➡️ Routen: init");
  // Global/Fallback: FAQ auf allen Seiten (einmalig)
  new WFRoute("/(.*)").execute(() => {
    console.log("🌐 Global: FAQ");
    try {
      initFAQ();
    } catch (e) {
      console.error("❌ FAQ Init fehlgeschlagen", e);
    }
  });

  // Home-Seite
  new WFRoute("/").execute(async () => {
    console.log("🏠 Home – Komponenten: MovingBanner, VideoSection");
    try {
      initMovingBanner();
    } catch (e) {
      console.error("❌ MovingBanner", e);
    }
    try {
      initVideoSectionHome();
    } catch (e) {
      console.error("❌ VideoSection", e);
    }
    // Nur auf der Startseite laden
    try {
      // optional: VideoGallery/Embed (falls überhaupt benötigt)
      // aus Performancegründen erstmal deaktiviert
    } catch {}
  });

  // Über uns: ReadMore nur hier aktivieren
  new WFRoute("/ueber-uns(.*)").execute(() => {
    console.log("📄 /ueber-uns – Komponenten: ReadMore");
    try {
      new ReadMore();
    } catch (e) {
      console.error("❌ ReadMore", e);
    }
  });

  // Erstgespräch / Formular (Varianten abdecken)
  new WFRoute("/erstgespraech(.*)").execute(() => {
    console.log("📄 /erstgespraech – Komponenten: Erstgespraeche");
    try {
      new Erstgespraeche();
    } catch (e) {
      console.error("❌ Erstgespraeche", e);
    }
  });

  // Vertragscheck-Formular
  new WFRoute("/vertragscheck(.*)").execute(() => {
    console.log("📄 /vertragscheck – Komponenten: Vertragscheck");
    try {
      new Vertragscheck();
    } catch (e) {
      console.error("❌ Vertragscheck", e);
    }
  });

  // Alle Servicegebiete-Seiten - MovingBanner & VideoSection
  new WFRoute("/servicegebiete/(.*)").execute(() => {
    console.log("📄 /servicegebiete – Komponenten: MovingBanner, VideoSection");
    try {
      initMovingBanner();
    } catch (e) {
      console.error("❌ MovingBanner", e);
    }
    try {
      initVideoSectionHome();
    } catch (e) {
      console.error("❌ VideoSection", e);
    }
  });
};

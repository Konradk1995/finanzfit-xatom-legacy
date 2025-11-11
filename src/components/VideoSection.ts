export function initVideoSectionHome(): void {
  console.log("🎬 VideoSection: initVideoSectionHome() aufgerufen");

  function initVideoSection() {
    console.log("🎬 VideoSection: DOMContentLoaded Event gefeuert");

    // Timer für Auto-Slider (Tablet)
    let autoSlideTimer: number | undefined;

    function applyMasonryLayout() {
      try {
        const grid = document.querySelector<HTMLElement>(".mansory-grid");
        if (!grid) return;
        const list =
          grid.querySelector<HTMLElement>(".mansory-wrapper") ?? grid;
        const width = window.innerWidth;
        const isMobile = width < 768;
        const isTablet = width >= 768 && width < 1024;
        const isDesktop = width >= 1024;

        // Hülle zentrieren
        grid.style.width = "100%";
        grid.style.boxSizing = "border-box";

        const items = list.querySelectorAll<HTMLElement>(".cms-item-grid");

        // RESET gemeinsame Styles
        (list.style as any).cssText = "";

        if (isTablet) {
          // Mobile Slider ausblenden
          const mobileSlider =
            document.querySelector<HTMLElement>(".mobile-slider");
          if (mobileSlider) {
            mobileSlider.style.display = "none";
          }

          // Desktop Grid anzeigen
          grid.style.display = "block";

          // Tablet: 1‑Slide‑Slider
          list.style.display = "flex";
          list.style.flexDirection = "row";
          list.style.overflowX = "auto";
          list.style.overflowY = "hidden";
          list.style.scrollSnapType = "x mandatory";
          list.style.setProperty("scroll-snap-stop", "always");
          list.style.scrollBehavior = "smooth";
          list.style.gap = "16px";
          list.style.padding = "0 16px";
          list.style.alignItems = "center";
          list.style.scrollbarWidth = "none";
          (list.style as any).msOverflowStyle = "none";

          items.forEach((item) => {
            item.style.flexShrink = "0";
            item.style.scrollSnapAlign = "center";
            item.style.width = "380px";
            item.style.maxWidth = "380px";
            item.style.minWidth = "380px";
          });

          // Hülle so setzen, dass genau 1 Slide sichtbar ist
          const slide = items[0];
          const slideW = slide
            ? slide.getBoundingClientRect().width || 380
            : 380;
          grid.style.maxWidth = `${Math.round(slideW + 32)}px`; // + padding
          grid.style.margin = "0 auto";

          // Auto‑advance
          if (autoSlideTimer) clearInterval(autoSlideTimer);
          let idx = 0;
          autoSlideTimer = window.setInterval(() => {
            if (!document.body.contains(list)) return;
            idx = (idx + 1) % items.length;
            const gap = 16;
            list.scrollTo({ left: idx * (slideW + gap), behavior: "smooth" });
          }, 4000);
        } else if (isDesktop) {
          // Mobile Slider ausblenden
          const mobileSlider =
            document.querySelector<HTMLElement>(".mobile-slider");
          if (mobileSlider) {
            mobileSlider.style.display = "none";
          }

          // Desktop Grid anzeigen
          grid.style.display = "block";

          // Desktop: echtes Masonry
          if (autoSlideTimer) {
            clearInterval(autoSlideTimer);
            autoSlideTimer = undefined;
          }
          grid.style.maxWidth = "1200px";
          grid.style.margin = "0 auto";
          grid.style.padding = "0 8px";

          list.style.display = "grid";
          list.style.gridTemplateColumns = "repeat(3, minmax(0, 1fr))";
          list.style.gridAutoRows = "8px";
          list.style.gap = "16px";
          list.style.justifyItems = "stretch";
          list.style.alignItems = "start";

          const computeSpan = () => {
            const cs = window.getComputedStyle(list);
            const row = parseFloat((cs as any).gridAutoRows || "8") || 8;
            const gap =
              parseFloat((cs as any).rowGap || (cs as any).gap || "0") || 0;
            items.forEach((item) => {
              const content =
                item.querySelector<HTMLElement>(".video-wrapper") ?? item;
              const h = content.getBoundingClientRect().height;
              const span = Math.max(1, Math.ceil((h + gap) / (row + gap)));
              item.style.gridRowEnd = `span ${span}`;
              item.style.width = "100%";
              item.style.maxWidth = "100%";
            });
          };
          computeSpan();
          requestAnimationFrame(computeSpan);
          setTimeout(computeSpan, 200);
        } else {
          // Mobile: Swiper-Slider verwenden
          if (autoSlideTimer) {
            clearInterval(autoSlideTimer);
            autoSlideTimer = undefined;
          }

          // Desktop Grid ausblenden
          grid.style.display = "none";

          // Mobile Slider anzeigen und Swiper initialisieren
          const mobileSlider =
            document.querySelector<HTMLElement>(".mobile-slider");
          if (mobileSlider) {
            mobileSlider.style.display = "block";

            // Webflow's Swiper-Initialisierung triggern
            const swiperContainer =
              mobileSlider.querySelector<HTMLElement>(".swiper");
            if (
              swiperContainer &&
              !swiperContainer.classList.contains("swiper-initialized")
            ) {
              // Webflow's Swiper-Initialisierung simulieren
              if (typeof (window as any).Swiper !== "undefined") {
                try {
                  new (window as any).Swiper(swiperContainer, {
                    slidesPerView: 1,
                    spaceBetween: 16,
                    loop: true,
                    autoplay: {
                      delay: 4000,
                      disableOnInteraction: false,
                    },
                    navigation: {
                      nextEl: ".swiper-btn.is-next",
                      prevEl: ".swiper-btn.is-prev",
                    },
                  });
                  console.log(
                    "✅ Swiper für Servicegebiete-Seite initialisiert"
                  );
                } catch (error) {
                  console.log(
                    "Swiper bereits initialisiert oder Fehler:",
                    error
                  );
                }
              } else {
                console.log(
                  "⚠️ Swiper.js nicht verfügbar - Webflow sollte es laden"
                );
              }
            } else {
              console.log("✅ Swiper bereits initialisiert");
            }
          }
        }

        // Card‑Look (gemeinsam)
        items.forEach((item) => {
          item.style.position = "relative";
          item.style.margin = "0";
          item.style.padding = "0";
          item.style.borderRadius = "16px";
          item.style.overflow = "hidden";
          item.style.background = "#0b0b0b";
          item.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
          item.style.transition = "transform .25s ease, box-shadow .25s ease";
        });
      } catch {}
    }

    // Wrapper‑Init: Orientation‑Ratio + Thumbnail
    function initVideoWrappers() {
      const wrappers = document.querySelectorAll<HTMLElement>(".video-wrapper");
      wrappers.forEach((wrapper) => {
        const orientation = (
          wrapper.getAttribute("data-video-orientation") || ""
        ).toLowerCase();
        const isVertical =
          orientation === "vertikal" || orientation === "vertical";
        wrapper.style.position = "relative";
        wrapper.style.display = "block";
        wrapper.style.backgroundColor = "#000";
        wrapper.style.borderRadius = "16px";
        wrapper.style.paddingTop = isVertical ? "177.78%" : "56.25%";

        // Placeholder sicherstellen + stylen
        let ph = wrapper.querySelector<HTMLElement>(".video-placeholder");
        if (!ph) {
          ph = document.createElement("div");
          ph.className = "video-placeholder";
          wrapper.appendChild(ph);
        }
        Object.assign(ph.style, {
          position: "absolute",
          left: "0",
          top: "0",
          width: "100%",
          height: "100%",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: "0",
          transition: "opacity .3s ease",
        } as CSSStyleDeclaration);

        // YouTube-ID robust extrahieren und Thumbnail setzen
        const youtube = wrapper.getAttribute("data-youtube-id") || "";
        let videoId = "";
        if (youtube.includes("watch?v="))
          videoId = youtube.split("v=")[1]?.split("&")[0] || "";
        else if (youtube.includes("youtu.be/"))
          videoId = youtube.split("youtu.be/")[1]?.split("?")[0] || "";
        else if (youtube.includes("/embed/"))
          videoId = youtube.split("/embed/")[1]?.split("?")[0] || "";
        else if (youtube.length === 11) videoId = youtube;
        if (videoId) {
          const urls = [
            `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
          ];
          let i = 0;
          const img = new Image();
          const load = () => {
            if (i >= urls.length) return;
            img.onload = () => {
              ph!.style.backgroundImage = `url('${urls[i]}')`;
              ph!.style.opacity = "1";
            };
            img.onerror = () => {
              i += 1;
              load();
            };
            img.src = urls[i];
          };
          load();
        }
      });
    }

    // Click‑Handler bleibt gleich
    document.body.addEventListener("click", function (event) {
      const playButton = (event.target as HTMLElement).closest(
        ".video-play-button"
      );
      if (!playButton) return;
      const wrapper = playButton.closest(
        ".video-wrapper"
      ) as HTMLElement | null;
      if (!wrapper || wrapper.classList.contains("is-playing")) return;
      event.preventDefault();

      const youtube = wrapper.getAttribute("data-youtube-id") || "";
      let videoId = "";
      if (youtube.includes("watch?v="))
        videoId = youtube.split("v=")[1]?.split("&")[0] || "";
      else if (youtube.includes("youtu.be/"))
        videoId = youtube.split("youtu.be/")[1]?.split("?")[0] || "";
      else if (youtube.includes("/embed/"))
        videoId = youtube.split("/embed/")[1]?.split("?")[0] || "";
      else if (youtube.length === 11) videoId = youtube;

      const iframe = document.createElement("iframe");
      const src = videoId
        ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
        : youtube.indexOf("?") >= 0
        ? `${youtube}&autoplay=1`
        : `${youtube}?autoplay=1`;
      iframe.setAttribute("src", src);
      iframe.setAttribute("title", "YouTube video player");
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute(
        "allow",
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      );
      iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      iframe.setAttribute("allowfullscreen", "");
      Object.assign(iframe.style, {
        position: "absolute",
        left: "0",
        top: "0",
        width: "100%",
        height: "100%",
        display: "block",
        border: "none",
      } as CSSStyleDeclaration);

      const ph = wrapper.querySelector(
        ".video-placeholder"
      ) as HTMLElement | null;
      if (ph) {
        ph.style.opacity = "0";
        setTimeout(() => {
          if (ph.parentElement === wrapper) wrapper.removeChild(ph);
        }, 250);
      }
      wrapper.appendChild(iframe);
      wrapper.classList.add("is-playing");
    });

    const init = () => {
      initVideoWrappers();
      applyMasonryLayout();
    };
    init();
    let t: number | undefined;
    window.addEventListener("resize", () => {
      if (t) window.clearTimeout(t);
      t = window.setTimeout(applyMasonryLayout, 250);
    });
    setTimeout(init, 800);
    setTimeout(init, 1600);
    setTimeout(init, 2400); // Zusätzlicher Delay für Swiper-Initialisierung
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initVideoSection);
  else initVideoSection();
}

// Für Webflow/Xatom Export
declare global {
  interface Window {
    initVideoSectionHome: () => void;
  }
}

// Global verfügbar machen
window.initVideoSectionHome = initVideoSectionHome;

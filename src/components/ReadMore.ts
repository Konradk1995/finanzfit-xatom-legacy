import $ from "jquery";

export class ReadMore {
  constructor() {
    this.init();
  }

  private init() {
    $(".team12_item").each((_, wrapperEl) => {
      const $wrapper = $(wrapperEl);
      const $text = $wrapper.find(".text-content");
      const $btn = $wrapper.find(".read-more");
      if (!$text.length || !$btn.length) return;

      // Sanfte Übergänge setzen
      const textEl = $text.get(0) as HTMLElement;
      textEl.style.transition = "max-height 0.4s ease, opacity 0.25s ease";
      textEl.style.overflow = "hidden";
      // Sicherstellen, dass kein CSS-Line-Clamp aktiv ist
      if ($text.hasClass("text-style-2lines")) {
        $text.removeClass("text-style-2lines");
      }

      // Original- und Kürzungslogik vorbereiten
      const originalHtml = $text.html() || "";
      const originalText = ($text.text() || "").replace(/\s+/g, " ").trim();
      const limitAttr = $text.attr("data-readmore-chars");
      const CHAR_LIMIT = Number.isFinite(Number(limitAttr))
        ? Math.max(0, parseInt(String(limitAttr as string), 10))
        : 140;

      const truncateAtWordBoundary = (input: string, maxChars: number) => {
        if (input.length <= maxChars) return input;
        const slice = input.slice(0, maxChars + 1); // +1 um Grenzfall mit Space zu fangen
        const lastSpaceIdx = slice.lastIndexOf(" ");
        const cutIdx =
          lastSpaceIdx > 0 && lastSpaceIdx >= maxChars * 0.6
            ? lastSpaceIdx
            : maxChars;
        return input.slice(0, cutIdx).replace(/[.,;:!\-\s]+$/u, "") + " …";
      };

      const collapsedText = truncateAtWordBoundary(originalText, CHAR_LIMIT);
      const isTruncated = collapsedText !== originalText;

      // Ausgangshöhe messen und als max-height setzen
      const measureCurrentHeight = () => {
        const prev = textEl.style.maxHeight;
        textEl.style.maxHeight = "none";
        const h = textEl.clientHeight;
        textEl.style.maxHeight = prev;
        return h;
      };
      const setMax = (h: number) => (textEl.style.maxHeight = `${h}px`);

      // Startzustand: Wenn Kürzung sinnvoll, gekürzten Text setzen
      if (isTruncated) {
        $text.text(collapsedText);
      }
      setMax(measureCurrentHeight());

      // Button-Label vorbereiten + weiche Animation
      const $btnLabel = $btn.find(".text-button").length
        ? $btn.find(".text-button")
        : $btn;
      if (isTruncated) {
        $btnLabel.text("weiterlesen ...");
      } else {
        // Keine Kürzung notwendig -> Button ausblenden
        $btn.hide();
      }
      const btnEl = $btn.get(0) as HTMLElement;
      btnEl.style.transition =
        "background-color 0.25s ease, box-shadow 0.25s ease, transform 0.2s ease";

      if (isTruncated) {
        $btn.on("click", (e) => {
          e.preventDefault();
          const isExpanded = $wrapper.hasClass("expanded");

          if (isExpanded) {
            // Einklappen: gekürzten Text setzen und Höhe anpassen
            $text.text(collapsedText);
            // Vorsichtshalber Clamp-Klasse entfernt halten
            if ($text.hasClass("text-style-2lines")) {
              $text.removeClass("text-style-2lines");
            }
            setMax(measureCurrentHeight());
            textEl.style.opacity = "0.95";
            $btnLabel.text("weiterlesen ...");
            btnEl.style.backgroundColor = "";
            btnEl.style.boxShadow = "";
            btnEl.style.transform = "scale(1)";
          } else {
            // Ausklappen: Original-HTML setzen und auf volle Höhe animieren
            $text.html(originalHtml);
            // Clamp-Klasse ggf. entfernen, damit volle Höhe sichtbar ist
            if ($text.hasClass("text-style-2lines")) {
              $text.removeClass("text-style-2lines");
            }
            const full = (() => {
              const prev = textEl.style.maxHeight;
              textEl.style.maxHeight = "none";
              const h = textEl.scrollHeight;
              textEl.style.maxHeight = prev;
              return h;
            })();
            setMax(full);
            textEl.style.opacity = "1";
            $btnLabel.text("schließen");
            btnEl.style.backgroundColor = "#001932";
            btnEl.style.boxShadow = "0 6px 20px rgba(0, 25, 50, 0.25)";
            btnEl.style.transform = "scale(1.02)";
          }
          $wrapper.toggleClass("expanded", !isExpanded);
        });
      }
    });
  }
}

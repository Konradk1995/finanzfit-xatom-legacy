export class Erstgespraeche {
  private root: HTMLElement | null = null;
  private formEl: HTMLFormElement | null = null;
  private stepHistory: Array<number> = [];
  private calendlyScheduled: boolean = false;
  private totalSteps = 0;
  private stepOrder: number[] = [];

  private log(...args: any[]): void {
    console.log("[Erstgespraeche]", ...args);
  }

  constructor() {
    this.init();
  }

  // ==================== INIT ====================

  private init() {
    this.root = document.querySelector('[data-component="erstgespraeche"]');
    if (!this.root) {
      this.log("⚠️ Root-Element nicht gefunden");
      return;
    }

    this.formEl = this.root.querySelector("#email-form") as HTMLFormElement;
    if (!this.formEl) {
      this.log("⚠️ Formular nicht gefunden");
      return;
    }

    this.log("✅ Initialisierung gestartet");

    this.refreshStepOrder();
    this.hideAllSteps();
    this.initProgressUI();
    const firstStep = this.stepOrder[0] ?? 1;
    this.showStep(firstStep);
    this.initNavigation();
    this.initValidation();
    this.initCalendlyListener();
    this.initSubmit();

    this.log("✅ Initialisierung abgeschlossen");
  }

  // ==================== STEP NAVIGATION ====================

  private refreshStepOrder() {
    if (!this.root) return;
    const steps = Array.from(
      this.root.querySelectorAll<HTMLElement>(".f-form-steps-item")
    );
    this.stepOrder = steps
      .map((step) => {
        const attr = step.getAttribute("data-form") || "";
        const num = parseInt(attr.split("-")[1], 10);
        return Number.isFinite(num) ? num : NaN;
      })
      .filter((num) => !Number.isNaN(num))
      .sort((a, b) => a - b);
    this.totalSteps = this.stepOrder.length;
  }

  private hideAllSteps() {
    const steps =
      this.root!.querySelectorAll<HTMLElement>(".f-form-steps-item");
    steps.forEach((s) => (s.style.display = "none"));
  }

  private showStep(stepNum: number) {
    this.log(`→ Zeige Step ${stepNum}`);

    this.refreshStepOrder();
    this.hideAllSteps();

    let stepEl = this.root!.querySelector<HTMLElement>(
      `.f-form-steps-item[data-form="step-${stepNum}"]`
    );

    if (!stepEl) {
      this.refreshStepOrder();
      const fallback = this.stepOrder.find((num) => num > stepNum);
      if (fallback !== undefined) {
        this.log(
          `⚠️ Step ${stepNum} nicht gefunden, wechsle zu Step ${fallback}`
        );
        this.showStep(fallback);
        return;
      }
      this.log(`⚠️ Step ${stepNum} nicht gefunden und keine Alternative`);
      return;
    }

    stepEl.style.display = "";
    stepEl.classList.add("is-visible");

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });

    const stepIndex = this.getStepIndex(stepNum);

    // Vorletzter Step: Calendly initialisieren (ursprünglich Step 4)
    if (stepIndex === this.totalSteps - 2) {
      this.initCalendlyWidget();
    }

    // Letzter Step: Summary aktualisieren (ursprünglich Step 5)
    if (stepIndex === this.totalSteps - 1) {
      this.updateSummary();
    }

    this.validateStep(stepNum);
    this.updateProgressUI(stepNum);
  }

  private initNavigation() {
    this.root!.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;

      // Next Button
      const nextBtn = target.closest(
        '[data-form="next-btn"]'
      ) as HTMLElement | null;
      if (nextBtn) {
        e.preventDefault();

        // Button disabled?
        if (nextBtn.style.pointerEvents === "none") {
          return;
        }

        const currentStep = this.getCurrentStep();
        if (!currentStep) return;

        const currentIndex = this.getStepIndex(currentStep);
        const nextStep = this.stepOrder[currentIndex + 1];
        if (nextStep === undefined) return;

        this.stepHistory.push(currentStep);
        this.showStep(nextStep);
        return;
      }

      // Back Button
      const backBtn = target.closest(
        '[data-form="back-btn"]'
      ) as HTMLElement | null;
      if (backBtn) {
        e.preventDefault();
        const prevStep = this.stepHistory.pop();
        if (prevStep !== undefined) {
          this.showStep(prevStep);
          return;
        }
        const currentStep = this.getCurrentStep();
        if (!currentStep) return;
        const currentIndex = this.getStepIndex(currentStep);
        const fallback = this.stepOrder[currentIndex - 1];
        if (fallback !== undefined) {
          this.showStep(fallback);
        }
      }
    });
  }

  private getCurrentStep(): number | null {
    const steps = Array.from(
      this.root!.querySelectorAll<HTMLElement>(".f-form-steps-item")
    );

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step.style.display !== "none") {
        const stepAttr = step.getAttribute("data-form") || "";
        const stepNum = parseInt(stepAttr.split("-")[1], 10);
        return stepNum || null;
      }
    }
    return null;
  }

  private getCurrentStepEl(): HTMLElement | null {
    const steps = Array.from(
      this.root!.querySelectorAll<HTMLElement>(".f-form-steps-item")
    );

    for (const step of steps) {
      if (step.style.display !== "none") {
        return step;
      }
    }
    return null;
  }

  // ==================== PROGRESS UI ====================

  private progressBar?: HTMLElement;
  private progressLabel?: HTMLElement;

  private initProgressUI() {
    // Progress-Bar ganz oben vor allen Steps einfügen (außerhalb der Step-Container)
    const formWrapper =
      this.root!.querySelector<HTMLElement>(".f-form-steps-wrap");

    if (!formWrapper) {
      this.log(
        "⚠️ .f-form-steps-wrap nicht gefunden, Progress-Bar wird nicht angezeigt"
      );
      return;
    }

    const label = document.createElement("div");
    label.className = "f-progress__label";
    label.style.cssText =
      "text-align: center; margin-bottom: 1rem; font-weight: 600; padding: 0 1rem; margin-top: 6rem;";

    const outer = document.createElement("div");
    outer.className = "f-progress";
    outer.style.cssText =
      "width: 100%; max-width: 600px; height: 4px; background: #e0e0e0; border-radius: 2px; overflow: hidden; margin: 0 auto 2rem; position: relative; z-index: 1;";

    const bar = document.createElement("div");
    bar.className = "f-progress__bar";
    bar.style.cssText =
      "height: 100%; background: #fd5b16; transition: width 0.3s ease;";

    outer.appendChild(bar);

    // VOR dem ersten Step einfügen
    formWrapper.insertBefore(label, formWrapper.firstChild);
    formWrapper.insertBefore(outer, label.nextSibling);

    this.progressBar = bar;
    this.progressLabel = label;

    this.log("✅ Progress-Bar außerhalb der Step-Container eingefügt");
  }

  private updateProgressUI(currentStep: number) {
    if (!this.progressBar || !this.progressLabel) return;

    const index = this.getStepIndex(currentStep);
    if (index === -1 || this.totalSteps === 0) return;

    const pct = Math.round(((index + 1) / this.totalSteps) * 100);
    this.progressBar.style.width = pct + "%";
    this.progressLabel.textContent = `Schritt ${index + 1} von ${
      this.totalSteps
    }`;
  }

  // ==================== VALIDATION ====================

  private initValidation() {
    // Live-Validierung bei Input/Change
    this.root!.addEventListener("input", () => {
      const current = this.getCurrentStep();
      if (current) this.validateStep(current);
    });

    this.root!.addEventListener("change", () => {
      const current = this.getCurrentStep();
      if (current) this.validateStep(current);
    });

    // Enter-Taste für Next (außer in Textareas)
    this.root!.addEventListener("keydown", (e) => {
      const ke = e as KeyboardEvent;
      if (ke.key !== "Enter") return;

      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA") return;

      ke.preventDefault();

      const currentStep = this.getCurrentStep();
      if (!currentStep) return;

      this.validateStep(currentStep);

      const currentEl = this.getCurrentStepEl();
      if (!currentEl) return;

      const hasErrors = currentEl.querySelectorAll(".f-field-error").length > 0;
      const currentIndex = this.getStepIndex(currentStep);
      const nextStep = this.stepOrder[currentIndex + 1];
      if (!hasErrors && nextStep !== undefined) {
        this.stepHistory.push(currentStep);
        this.showStep(nextStep);
      }
    });
  }

  private validateStep(stepNum: number) {
    const stepEl = this.root!.querySelector<HTMLElement>(
      `.f-form-steps-item[data-form="step-${stepNum}"]`
    );

    if (!stepEl) return;

    let isValid = true;

    // Alte Fehler entfernen
    this.clearErrors(stepEl);

    const stepIndex = this.getStepIndex(stepNum);

    if (stepIndex === 0) {
      isValid = this.validateStep1(stepEl) && isValid;
    } else if (stepIndex === 1) {
      isValid = this.validateConsentStep(stepEl) && isValid;
    } else if (stepIndex === 2) {
      isValid = this.validateCalendlyStep(stepEl) && isValid;
    }

    // Next-Button aktivieren/deaktivieren
    this.updateNextButton(stepEl, isValid);
  }

  private validateStep1(stepEl: HTMLElement): boolean {
    let isValid = true;

    // Vorname - NUR Pflichtfeld-Check
    const firstName = stepEl.querySelector<HTMLInputElement>(
      '[data-upload="first-name"]'
    );
    if (firstName) {
      if (!firstName.value.trim()) {
        this.setFieldError(firstName, "Vorname ist erforderlich");
        isValid = false;
      }
    }

    // Nachname - NUR Pflichtfeld-Check
    const lastName = stepEl.querySelector<HTMLInputElement>(
      '[data-upload="last-name"]'
    );
    if (lastName) {
      if (!lastName.value.trim()) {
        this.setFieldError(lastName, "Nachname ist erforderlich");
        isValid = false;
      }
    }

    // Email - NUR für Email-Feld mit Email-Pattern!
    const email = stepEl.querySelector<HTMLInputElement>(
      '[data-upload="email"]'
    );
    if (email) {
      const value = email.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!value) {
        this.setFieldError(email, "E-Mail ist erforderlich");
        isValid = false;
      } else if (!emailPattern.test(value)) {
        this.setFieldError(email, "Bitte eine gültige E-Mail eingeben");
        isValid = false;
      }
    }

    // Geburtsdatum - KEIN Email-Check, nur Datumsformat!
    const datum = stepEl.querySelector<HTMLInputElement>(
      '[data-upload="datum"]'
    );
    if (datum) {
      const value = datum.value.trim();
      if (!value) {
        this.setFieldError(datum, "Geburtsdatum ist erforderlich");
        isValid = false;
      } else {
        // Akzeptiere: DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY oder YYYY-MM-DD
        const datePattern =
          /^(\d{1,2}[\.\/\-]\d{1,2}[\.\/\-]\d{4})|(\d{4}[\.\/\-]\d{1,2}[\.\/\-]\d{1,2})$/;
        if (!datePattern.test(value)) {
          this.setFieldError(
            datum,
            "Bitte gültiges Datum eingeben (z.B. 01.01.1990)"
          );
          isValid = false;
        }
      }
    }

    // Telefon - NUR Telefon-Validierung!
    const phone = stepEl.querySelector<HTMLInputElement>(
      '[data-upload="phone"]'
    );
    if (phone) {
      const value = phone.value.trim();
      if (!value) {
        this.setFieldError(phone, "Telefonnummer ist erforderlich");
        isValid = false;
      } else {
        // Nur Ziffern extrahieren und mind. 6 Ziffern verlangen
        const digitsOnly = value.replace(/[^\d]/g, "");
        if (digitsOnly.length < 6) {
          this.setFieldError(
            phone,
            "Bitte eine gültige Telefonnummer eingeben (mind. 6 Ziffern)"
          );
          isValid = false;
        }
      }
    }

    // Nachricht (data-upload="nachricht") ist OPTIONAL - keine Validierung nötig

    return isValid;
  }

  private validateConsentStep(stepEl: HTMLElement): boolean {
    // Datenschutz-Checkbox (flexibel für verschiedene IDs)
    const datenschutz =
      stepEl.querySelector<HTMLInputElement>(
        "#Datenschutz-Erstinformation-2"
      ) ||
      stepEl.querySelector<HTMLInputElement>(
        'input[type="checkbox"][required]'
      );

    if (datenschutz && !datenschutz.checked) {
      this.setStepNotice(
        stepEl,
        "Bitte bestätigen Sie die Datenschutzerklärung und Erstinformation"
      );
      return false;
    }

    this.setStepNotice(stepEl, null);
    return true;
  }

  private validateCalendlyStep(stepEl: HTMLElement): boolean {
    if (!this.calendlyScheduled) {
      this.setStepNotice(
        stepEl,
        "Bitte buchen Sie zuerst einen Termin, bevor Sie fortfahren."
      );
      return false;
    }

    this.setStepNotice(stepEl, null);
    return true;
  }

  private clearErrors(stepEl: HTMLElement) {
    stepEl.querySelectorAll(".f-field-error").forEach((el) => el.remove());
    stepEl.querySelectorAll(".f-step-notice").forEach((el) => el.remove());

    stepEl
      .querySelectorAll<HTMLInputElement>("input, textarea")
      .forEach((el) => {
        el.removeAttribute("aria-invalid");
        el.removeAttribute("aria-describedby");
      });
  }

  private setFieldError(field: HTMLElement, message: string) {
    const errorId = `err-${field.id || Math.random().toString(36).slice(2)}`;

    const errorEl = document.createElement("div");
    errorEl.className = "f-field-error";
    errorEl.id = errorId;
    errorEl.style.cssText = "color: #d32f2f; font-size: 12px; margin-top: 4px;";
    errorEl.textContent = message;

    field.parentElement?.appendChild(errorEl);
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", errorId);
  }

  private setStepNotice(stepEl: HTMLElement, message: string | null) {
    // Alte Notice entfernen
    stepEl.querySelectorAll(".f-step-notice").forEach((el) => el.remove());

    if (!message) return;

    const notice = document.createElement("div");
    notice.className = "f-step-notice";
    notice.style.cssText =
      "color: #d32f2f; font-size: 14px; margin-top: 10px; padding: 10px; background: #ffebee; border-radius: 4px;";
    notice.textContent = message;

    const btnWrap = stepEl.querySelector(".f-form-button-wrapper");
    if (btnWrap) {
      btnWrap.parentElement?.insertBefore(notice, btnWrap);
    } else {
      stepEl.appendChild(notice);
    }
  }

  private updateNextButton(stepEl: HTMLElement, isValid: boolean) {
    const nextBtn =
      stepEl.querySelector<HTMLElement>('[data-form="next-btn"]') ||
      stepEl.querySelector<HTMLElement>("#form-btn");

    if (!nextBtn) return;

    if (isValid) {
      nextBtn.style.pointerEvents = "auto";
      nextBtn.style.cursor = "pointer";
      nextBtn.removeAttribute("aria-disabled");
    } else {
      nextBtn.style.pointerEvents = "none";
      nextBtn.style.cursor = "not-allowed";
      nextBtn.setAttribute("aria-disabled", "true");
    }
  }

  private getStepIndex(stepNum: number): number {
    if (!this.stepOrder.length) {
      this.refreshStepOrder();
    }
    return this.stepOrder.indexOf(stepNum);
  }

  // ==================== CALENDLY ====================

  private async initCalendlyWidget() {
    await this.loadCalendlyAssets();

    // Widget ist bereits im HTML vorhanden, nur sicherstellen dass es geladen ist
    const widget = this.root!.querySelector(".calendly-inline-widget");
    if (widget) {
      this.log("✅ Calendly Widget gefunden");
    }
  }

  private async loadCalendlyAssets(): Promise<void> {
    if ((window as any).__calendlyLoaded) return;

    // CSS laden
    const cssHref = "https://assets.calendly.com/assets/external/widget.css";
    if (!document.querySelector(`link[href="${cssHref}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssHref;
      document.head.appendChild(link);
    }

    // JS laden
    await new Promise<void>((resolve) => {
      if ((window as any).Calendly) {
        (window as any).__calendlyLoaded = true;
        resolve();
        return;
      }

      const scriptSrc = "https://assets.calendly.com/assets/external/widget.js";
      const existing = document.querySelector(`script[src="${scriptSrc}"]`);

      if (existing) {
        existing.addEventListener("load", () => {
          (window as any).__calendlyLoaded = true;
          resolve();
        });
        return;
      }

      const script = document.createElement("script");
      script.src = scriptSrc;
      script.async = true;
      script.onload = () => {
        (window as any).__calendlyLoaded = true;
        resolve();
      };
      script.onerror = () => resolve();
      document.head.appendChild(script);
    });

    this.log("✅ Calendly Assets geladen");
  }

  private initCalendlyListener() {
    window.addEventListener("message", (e) => {
      const data = (e as MessageEvent).data;

      if (data && data.event === "calendly.event_scheduled") {
        this.log("✅ Calendly Termin gebucht!");
        this.calendlyScheduled = true;

        // Button freischalten
        this.refreshStepOrder();
        const calendlyStepNum = this.stepOrder[this.totalSteps - 2];
        if (calendlyStepNum !== undefined) {
          const stepEl = this.root!.querySelector(
            `[data-form="step-${calendlyStepNum}"]`
          );
          if (stepEl) {
            const nextBtn = stepEl.querySelector<HTMLElement>("#form-btn");
            if (nextBtn) {
              nextBtn.style.pointerEvents = "auto";
              nextBtn.style.cursor = "pointer";
              nextBtn.removeAttribute("aria-disabled");
            }

            this.setStepNotice(stepEl as HTMLElement, null);
          }
        }

        // Re-validate Step 4
        if (calendlyStepNum !== undefined) {
          this.validateStep(calendlyStepNum);
        }
      }
    });
  }

  // ==================== SUMMARY ====================

  private updateSummary() {
    this.log("📝 Update Summary");

    if (!this.formEl) return;

    // Text-Felder
    const fields = ["first-name", "last-name", "email", "phone", "datum"];

    fields.forEach((field) => {
      const input = this.formEl!.querySelector<HTMLInputElement>(
        `[data-upload="${field}"]`
      );
      const summaryEl = this.root!.querySelector<HTMLElement>(
        `[data-summary-text="${field}"]`
      );

      if (input && summaryEl) {
        summaryEl.textContent = input.value || "";
      }
    });

    // Checkboxen "Es geht um"
    const summaryContainer = this.root!.querySelector(
      '[data-summary="esgehtum"]'
    );
    if (summaryContainer) {
      summaryContainer.innerHTML = "";

      const checkedBoxes = Array.from(
        this.formEl!.querySelectorAll<HTMLInputElement>(
          '[data-upload="esgehtum"]:checked'
        )
      );

      const labels: string[] = [];

      checkedBoxes.forEach((checkbox) => {
        const label =
          checkbox
            .closest("label")
            ?.querySelector(".checkbox-label-text")
            ?.textContent?.trim() || "";

        if (label) {
          labels.push(label);

          const item = document.createElement("div");
          item.className = "f-summary-checkbox";

          const text = document.createElement("div");
          text.className = "text-block-24";
          text.textContent = label;

          item.appendChild(text);
          summaryContainer.appendChild(item);
        }
      });

      // Hidden Field für Submit
      const hiddenField = this.root!.querySelector<HTMLInputElement>(
        '[data-hidden-summary="esgehtum"]'
      );
      if (hiddenField) {
        hiddenField.value = labels.join(", ");
      }

      // Card verstecken wenn leer
      const card = this.root!.querySelector('[data-summary-card="esgehtum"]');
      if (card) {
        (card as HTMLElement).style.display = labels.length > 0 ? "" : "none";
      }
    }

    this.log("✅ Summary aktualisiert");
  }

  // ==================== SUBMIT ====================

  private initSubmit() {
    if (!this.formEl) return;

    this.formEl.addEventListener("submit", async (e) => {
      e.preventDefault();

      this.log("📤 Formular wird abgesendet...");

      const wrapper = this.formEl!.closest(".w-form");
      const done = wrapper?.querySelector<HTMLElement>(".w-form-done");
      const fail = wrapper?.querySelector<HTMLElement>(".w-form-fail");

      try {
        // TODO: Hier dein API-Call
        // const formData = new FormData(this.formEl!);
        // await fetch('/api/erstgespraech', { method: 'POST', body: formData });

        // Success
        if (this.formEl) this.formEl.style.display = "none";
        if (fail) fail.style.display = "none";
        if (done) done.style.display = "block";

        this.log("✅ Formular erfolgreich abgesendet");
      } catch (err) {
        // Error
        if (this.formEl) this.formEl.style.display = "none";
        if (done) done.style.display = "none";
        if (fail) fail.style.display = "block";

        this.log("❌ Fehler beim Absenden:", err);
      }
    });
  }
}

export function initFAQ() {
  const faqAccordions = document.querySelectorAll(".faq6_accordion");

  faqAccordions.forEach((accordion) => {
    const question = accordion.querySelector(".faq6_question") as HTMLElement;
    const answer = accordion.querySelector(".faq6_answer") as HTMLElement;
    const icon = accordion.querySelector(".faq6_icon-wrapper") as HTMLElement;

    if (!question || !answer || !icon) return;

    // Initial state
    answer.style.display = "none";
    icon.style.transform = "rotate(0deg)";

    question.addEventListener("click", () => {
      const isOpen = answer.style.display === "block";

      // Toggle answer visibilitya
      answer.style.display = isOpen ? "none" : "block";

      // Rotate icon
      icon.style.transform = isOpen ? "rotate(0deg)" : "rotate(45deg)";

      // Add smooth transition
      answer.style.transition = "all 0.3s ease-in-out";
      icon.style.transition = "transform 0.3s ease-in-out";
    });
  });
}

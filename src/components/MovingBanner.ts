import { gsap } from "gsap";

export function initMovingBanner() {
  const firstRow = document.querySelector(
    ".move-usp.first-row-move"
  ) as HTMLElement;
  const secondRow = document.querySelector(
    ".move-usp.second-row-move"
  ) as HTMLElement;

  if (!firstRow || !secondRow) return;

  // Remove any initial inline transform styles that might interfere
  firstRow.style.transform = "none";
  secondRow.style.transform = "none";
  // Reset translation property specifically using GSAP to ensure a clean start
  gsap.set(firstRow, { x: 0 });
  gsap.set(secondRow, { x: 0 });

  // Duplicate content three times for seamless loop (A becomes AAA)
  // Check if content is already duplicated to avoid multiple duplications
  const dataAttribute = "data-duplicated-triple"; // Use a different attribute for triple duplication check

  if (!firstRow.hasAttribute(dataAttribute)) {
    const originalContent = firstRow.innerHTML;
    firstRow.innerHTML += originalContent + originalContent; // Add content twice
    firstRow.setAttribute(dataAttribute, "true");
  }

  if (!secondRow.hasAttribute(dataAttribute)) {
    const originalContent = secondRow.innerHTML;
    secondRow.innerHTML += originalContent + originalContent; // Add content twice
    secondRow.setAttribute(dataAttribute, "true");
  }

  // The total scrollWidth now contains the width of the tripled content
  // The width of the original content is one third of the total scrollWidth
  const firstRowContentWidth = firstRow.scrollWidth / 3;
  const secondRowContentWidth = secondRow.scrollWidth / 3;

  // Kill any existing tweens on these elements before creating new ones
  gsap.killTweensOf(firstRow);
  gsap.killTweensOf(secondRow);

  // Set initial positions explicitly with GSAP for a clean start
  gsap.set(firstRow, { x: 0 });
  // Second row starts one content width to the left to prepare for seamless loop to the right
  gsap.set(secondRow, { x: -secondRowContentWidth });

  // Create GSAP tweens for infinite loop
  // First row moves left: from 0 to -contentWidth
  const firstRowTween = gsap.to(firstRow, {
    x: -firstRowContentWidth,
    duration: 100, // Further increased duration for slower speed
    ease: "none",
    repeat: -1,
  });

  // Second row moves right: from -contentWidth to 0
  const secondRowTween = gsap.to(secondRow, {
    x: 0,
    duration: 100, // Further increased duration for slower speed
    ease: "none",
    repeat: -1,
  });

  // Pause on hover
  const movingBoxes = document.querySelectorAll(".moving-boxes");

  movingBoxes.forEach((box) => {
    box.addEventListener("mouseover", () => {
      firstRowTween.pause();
      secondRowTween.pause();
    });

    box.addEventListener("mouseout", () => {
      firstRowTween.play();
      secondRowTween.play();
    });
  });

  // Also handle hover on the container elements
  firstRow.addEventListener("mouseover", () => firstRowTween.pause());
  firstRow.addEventListener("mouseout", () => firstRowTween.play());

  secondRow.addEventListener("mouseover", () => secondRowTween.pause());
  secondRow.addEventListener("mouseout", () => secondRowTween.play());
}

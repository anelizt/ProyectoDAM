const HEADER_HEIGHT = 80;

export function initDesvanecer(selector) {
  const el = document.querySelector(selector);
  if (!el) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    let ratio = y / HEADER_HEIGHT;
    ratio = Math.min(Math.max(ratio, 0), 1);
    el.style.opacity = (1 - ratio).toString();
  });
}

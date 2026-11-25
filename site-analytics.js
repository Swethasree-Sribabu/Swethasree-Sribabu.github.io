/* In-memory read markers for the author's existing GoatCounter account. */
(() => {
  'use strict';
  if (window.__portfolioReadMarkers) return;
  window.__portfolioReadMarkers = true;

  const pending = new Map();
  const sent = new Set();
  const flush = () => {
    const counter = window.goatcounter;
    if (!counter || typeof counter.count !== 'function') return;
    for (const [path, title] of pending) {
      if (sent.has(path)) continue;
      sent.add(path);
      pending.delete(path);
      try {
        counter.count({ path, title, event: true });
      } catch (_) {
        sent.delete(path);
        pending.set(path, title);
        return;
      }
    }
  };

  const script = document.querySelector('script[data-goatcounter]');
  if (script) script.addEventListener('load', flush, { once: true });
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.5) continue;
      const target = entry.target;
      const path = target.dataset.readEvent;
      observer.unobserve(target);
      if (!sent.has(path)) pending.set(path, target.textContent.trim());
    }
    flush();
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-read-event]').forEach(target => observer.observe(target));
  flush();
})();

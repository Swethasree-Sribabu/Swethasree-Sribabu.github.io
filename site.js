// Local media controls only; no analytics or remote dependencies.
const allowPreview = !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  !navigator.connection?.saveData;
if (allowPreview && 'IntersectionObserver' in window) {
  document.querySelectorAll('video').forEach((preview) => {
    let manuallyPaused = false;
    let pausedByObserver = false;
    preview.addEventListener('pause', () => {
      if (pausedByObserver) pausedByObserver = false;
      else manuallyPaused = true;
    });
    preview.addEventListener('play', () => { manuallyPaused = false; });
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.25);
      if (visible && !manuallyPaused) preview.play().catch(() => {});
      else if (!visible && !preview.paused) {
        pausedByObserver = true;
        preview.pause();
      }
    }, { threshold: 0.25 });
    observer.observe(preview);
  });
}

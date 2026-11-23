// Local video playback only. No analytics, tracking, or remote dependencies.
const allowPreview = !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  !navigator.connection?.saveData;
if (allowPreview && 'IntersectionObserver' in window) {
  document.querySelectorAll('video').forEach((preview) => {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        preview.play().catch(() => {});
      }
    }, { threshold: 0.25 });
    observer.observe(preview);
  });
}

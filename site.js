// Local media only. Lazy loading limits downloads to the teasers a visitor sees.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const saveData = navigator.connection?.saveData;
const canPreview = () => !motionPreference.matches && !saveData;
document.querySelectorAll('video').forEach((video) => {
  // Enable autoplay only when visible and permitted; never start a hidden download.
  video.autoplay = false;
  video.pause();
  video.controls = false;
  let loaded = false;
  let manualPause = false;
  let observerPause = false;
  const load = () => {
    if (loaded) return;
    video.querySelectorAll('source[data-src]').forEach((source) => {
      source.src = source.dataset.src;
    });
    loaded = true;
    video.load();
  };
  const playButton = document.createElement('button');
  playButton.type = 'button';
  playButton.className = 'media-toggle';
  playButton.textContent = 'Play teaser';
  playButton.setAttribute('aria-label', `Play: ${video.getAttribute('aria-label') || 'project teaser'}`);
  video.after(playButton);
  playButton.addEventListener('click', () => {
    manualPause = false;
    load();
    video.play().catch(() => {});
  });
  video.addEventListener('loadeddata', () => {
    video.controls = true;
    playButton.hidden = true;
  });
  video.addEventListener('pointerdown', () => {
    if (!loaded) {
      load();
      video.play().catch(() => {});
    }
  }, { once: true });
  video.addEventListener('keydown', (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      load();
      if (video.paused) video.play().catch(() => {});
      else video.pause();
    }
  });
  video.addEventListener('pause', () => {
    if (observerPause) observerPause = false;
    else manualPause = true;
  });
  video.addEventListener('play', () => { manualPause = false; });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.2);
      if (visible && canPreview() && !manualPause) {
        video.autoplay = true;
        load();
        video.play().catch(() => {});
      } else if (!visible && !video.paused) {
        observerPause = true;
        video.pause();
      }
    }, { threshold: 0.2 });
    observer.observe(video);
  }
  motionPreference.addEventListener('change', () => {
    if (!canPreview() && !video.paused) {
      observerPause = true;
      video.pause();
    }
  });
});

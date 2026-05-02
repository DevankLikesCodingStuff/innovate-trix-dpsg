// ===========================================================
// GOLDEN HOUR — interactions
// ===========================================================

// soft cursor
(function cursor() {
  const ring = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
  if (!ring || !dot) return;
  if (matchMedia('(pointer: coarse)').matches) {
    ring.style.display = 'none';
    dot.style.display = 'none';
    return;
  }

  // start hidden — only show after first mousemove
  ring.style.opacity = '0';
  dot.style.opacity = '0';
  let active = false;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;
  let dx = mx, dy = my;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dx = e.clientX; dy = e.clientY;
    if (!active) {
      active = true;
      ring.style.transition = 'opacity .35s ease, width .35s, height .35s, background .35s, border-color .35s';
      dot.style.transition = 'opacity .35s ease';
      requestAnimationFrame(() => {
        ring.style.opacity = '';
        dot.style.opacity = '';
      });
    }
  });

  function tick() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%,-50%)`;
    requestAnimationFrame(tick);
  }
  tick();

  // ===============================
// AUDIO UNLOCK (REQUIRED FOR HOVER)
// ===============================
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  document.querySelectorAll('#audio-library audio').forEach(audio => {
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
    }).catch(() => {});
  });

  window.removeEventListener('click', unlockAudio);
}

window.addEventListener('click', unlockAudio);


// ===============================
// VINYL HOVER AUDIO SYSTEM
// ===============================
let currentAudio = null;

document.querySelectorAll('.vinyl-card').forEach(el => {

  el.addEventListener('mouseenter', () => {
    const soundId = el.getAttribute('data-sound');
    const sound = document.getElementById(soundId);

    if (!sound) return;

    // stop previous track
    if (currentAudio && currentAudio !== sound) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    currentAudio = sound;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  });

  el.addEventListener('mouseleave', () => {
    const soundId = el.getAttribute('data-sound');
    const sound = document.getElementById(soundId);

    if (sound) {
      fadeOut(sound);
    }
  });

});


// ===============================
// OPTIONAL: SMOOTH FADE OUT
// ===============================
function fadeOut(audio) {
  let vol = audio.volume;
  const fade = setInterval(() => {
    if (vol > 0.05) {
      vol -= 0.05;
      audio.volume = vol;
    } else {
      clearInterval(fade);
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 1;
    }
  }, 30);
}

})();

// hero load reveal
window.addEventListener('load', () => {
  document.querySelector('.hero')?.classList.add('loaded');
});

// scroll reveal observer
(function scrollReveal() {
  const els = document.querySelectorAll('.reveal');
  els.forEach(el => {
    if (el.closest('.hero')) return; // hero handled separately
  });
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  // mark common section blocks for reveal even without manual class
  const auto = document.querySelectorAll(
    '.section-head, .vinyl-card, .ritual-col, .tour-row, .sideb-inner, .manifesto-grid, .signup, .album-bundle, .side-label'
  );
  auto.forEach(el => {
    el.classList.add('reveal');
    io.observe(el);
  });

  els.forEach(el => { if (!el.closest('.hero')) io.observe(el); });
})();

// CTA scrolls to album
document.getElementById('enterAlbum')?.addEventListener('click', () => {
  document.getElementById('album')?.scrollIntoView({ behavior: 'smooth' });
});

// vinyl card flip
document.querySelectorAll('.vinyl-card').forEach(card => {
  card.addEventListener('click', (e) => {
    // ignore clicks on buttons (so add-to-cart works without re-flipping)
    if (e.target.closest('.add-btn')) return;
    card.classList.toggle('flipped');
  });
});

// add to cart toast
window.showToast = function (msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window.__tt);
  window.__tt = setTimeout(() => t.classList.remove('show'), 2600);
};

document.querySelectorAll('.add-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const name = btn.dataset.name || 'this track';
    showToast(`added "${name}" — now go listen to track 04.`);
  });
});

// nav links smooth scroll (in case any browser ignores)
document.querySelectorAll('.nav-links a, .logo').forEach(a => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// scrolled nav background
let scrollTicking = false;
function updateNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  if (window.scrollY > 60) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
  scrollTicking = false;
}
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(updateNavScroll);
    scrollTicking = true;
  }
}, { passive: true });
updateNavScroll();

// nav color shift on dark sections
(function navObserver() {
  const nav = document.querySelector('.nav');
  const dark = document.querySelector('.sideb');
  if (!nav || !dark) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) nav.classList.add('on-dark');
      else nav.classList.remove('on-dark');
    }
  }, { rootMargin: '-60px 0px -75% 0px', threshold: 0 });
  io.observe(dark);
})();

// tour row click → toast (mock RSVP)
document.querySelectorAll('.tour-row').forEach(row => {
  row.addEventListener('click', () => {
    const city = row.querySelector('.tour-city')?.textContent || 'this city';
    showToast(`see you in ${city}.`);
  });
});

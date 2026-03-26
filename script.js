const headerWrapper = document.getElementById('headerWrapper');
const burgerBtn = document.getElementById('burgerBtn');
const navMenu = document.getElementById('navMenu');
const overlay = document.getElementById('menuOverlay');

let lastScrollY = window.scrollY;

function closeMenu() {
  navMenu.classList.remove('open');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function openMenu() {
  navMenu.classList.add('open');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

burgerBtn.addEventListener('click', () => {
  if (navMenu.classList.contains('open')) {
    closeMenu();
  } else {
    openMenu();
  }
});

overlay.addEventListener('click', closeMenu);

navMenu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');

    if (!targetId || !targetId.startsWith('#')) {
      closeMenu();
      return;
    }

    const targetElement = document.querySelector(targetId);

    if (!targetElement) {
      closeMenu();
      return;
    }

    event.preventDefault();
    closeMenu();

    const headerOffset = headerWrapper ? headerWrapper.offsetHeight + 12 : 0;
    const targetTop = targetElement.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: 'smooth',
    });

    window.history.pushState(null, '', targetId);
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 700) {
    closeMenu();
  }
});

window.addEventListener('scroll', () => {
  const currentY = window.scrollY;

  if (currentY < 50 || currentY < lastScrollY) {
    headerWrapper.classList.remove('hide');
  } else {
    headerWrapper.classList.add('hide');
  }

  lastScrollY = currentY;
});

const slidesTrack = document.getElementById('slidesTrack');
const dotsContainer = document.getElementById('dots');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');

let slides = [];
let currentSlide = 0;
let autoplayId;

function stopAutoplay() {
  window.clearInterval(autoplayId);
}

function updateSliderControls() {
  const isSingleSlide = slides.length <= 1;

  if (prevBtn) {
    prevBtn.disabled = isSingleSlide;
    prevBtn.setAttribute('aria-disabled', String(isSingleSlide));
  }

  if (nextBtn) {
    nextBtn.disabled = isSingleSlide;
    nextBtn.setAttribute('aria-disabled', String(isSingleSlide));
  }
}

function renderDots() {
  if (!dotsContainer) {
    return;
  }

  dotsContainer.innerHTML = '';
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = `dot${index === currentSlide ? ' active' : ''}`;
    dot.type = 'button';
    dot.setAttribute('aria-label', `Перейти к слайду ${index + 1}`);
    dot.addEventListener('click', () => {
      goToSlide(index);
      restartAutoplay();
    });
    dotsContainer.appendChild(dot);
  });
}

function syncSlider() {
  if (!slidesTrack) {
    return;
  }

  const nextSlides = Array.from(slidesTrack.querySelectorAll('.slide'));

  if (nextSlides.length === 0) {
    slides = [];
    currentSlide = 0;
    renderDots();
    updateSliderControls();
    stopAutoplay();
    return;
  }

  const activeIndex = nextSlides.findIndex((slide) => slide.classList.contains('active'));
  slides = nextSlides;
  currentSlide = activeIndex >= 0 ? activeIndex : Math.min(currentSlide, slides.length - 1);

  slides.forEach((slide, index) => {
    slide.classList.toggle('active', index === currentSlide);
  });

  renderDots();
  updateSliderControls();

  if (slides.length > 1) {
    restartAutoplay();
  } else {
    stopAutoplay();
  }
}

function goToSlide(index) {
  if (slides.length === 0) {
    return;
  }

  if (slides.length === 1) {
    currentSlide = 0;
    slides[0].classList.add('active');
    renderDots();
    updateSliderControls();
    return;
  }

  slides[currentSlide].classList.remove('active');
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  renderDots();
}

function nextSlide() {
  goToSlide(currentSlide + 1);
}

function prevSlide() {
  goToSlide(currentSlide - 1);
}

function startAutoplay() {
  stopAutoplay();

  if (slides.length <= 1) {
    return;
  }

  autoplayId = window.setInterval(nextSlide, 5000);
}

function restartAutoplay() {
  startAutoplay();
}

if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    nextSlide();
    restartAutoplay();
  });
}

if (prevBtn) {
  prevBtn.addEventListener('click', () => {
    prevSlide();
    restartAutoplay();
  });
}

if (slidesTrack) {
  let touchStartX = 0;
  let touchStartY = 0;

  slidesTrack.addEventListener(
    'touchstart',
    (event) => {
      const touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    },
    { passive: true },
  );

  slidesTrack.addEventListener(
    'touchend',
    (event) => {
      if (slides.length <= 1) {
        return;
      }

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      if (Math.abs(deltaX) < 45 || Math.abs(deltaY) > Math.abs(deltaX)) {
        return;
      }

      if (deltaX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }

      restartAutoplay();
    },
    { passive: true },
  );

  const sliderObserver = new MutationObserver(syncSlider);
  sliderObserver.observe(slidesTrack, { childList: true });
}

syncSlider();

const toggleButtons = Array.from(document.querySelectorAll('.js-toggle-cards'));

toggleButtons.forEach((button) => {
  const targetId = button.dataset.target;
  const cardsGrid = document.getElementById(targetId);
  if (!cardsGrid) {
    return;
  }

  const hiddenCards = Array.from(cardsGrid.querySelectorAll('.is-hidden-toggle'));
  const moreText = button.dataset.moreText || '\u0415\u0449\u0435';
  const lessText = button.dataset.lessText || '\u0421\u043a\u0440\u044b\u0442\u044c';

  if (hiddenCards.length === 0) {
    button.classList.add('is-hidden');
    return;
  }

  let expanded = false;

  button.addEventListener('click', () => {
    expanded = !expanded;
    hiddenCards.forEach((card) => {
      card.classList.toggle('is-hidden-toggle', !expanded);
    });
    button.textContent = expanded ? lessText : moreText;
  });
});

const docImages = Array.from(document.querySelectorAll('.doc-image'));
const docLightbox = document.getElementById('docLightbox');
const docLightboxImage = document.getElementById('docLightboxImage');
const docLightboxCaption = document.getElementById('docLightboxCaption');
const docLightboxClose = document.getElementById('docLightboxClose');

function openDocLightbox(image) {
  if (!docLightbox || !docLightboxImage) {
    return;
  }

  docLightboxImage.src = image.src;
  docLightboxImage.alt = image.alt;

  if (docLightboxCaption) {
    docLightboxCaption.textContent = image.alt;
  }

  docLightbox.classList.add('open');
  docLightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  if (docLightboxClose) {
    docLightboxClose.focus();
  }
}

function closeDocLightbox() {
  if (!docLightbox || !docLightboxImage) {
    return;
  }

  docLightbox.classList.remove('open');
  docLightbox.setAttribute('aria-hidden', 'true');
  docLightboxImage.src = '';
  docLightboxImage.alt = '';
  document.body.style.overflow = '';
}

docImages.forEach((image) => {
  image.tabIndex = 0;
  image.setAttribute('role', 'button');
  image.setAttribute('aria-label', `Открыть ${image.alt}`);

  image.addEventListener('click', () => {
    openDocLightbox(image);
  });

  image.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDocLightbox(image);
    }
  });
});

if (docLightbox) {
  docLightbox.addEventListener('click', (event) => {
    if (event.target === docLightbox) {
      closeDocLightbox();
    }
  });
}

if (docLightboxClose) {
  docLightboxClose.addEventListener('click', closeDocLightbox);
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && docLightbox && docLightbox.classList.contains('open')) {
    closeDocLightbox();
  }
});

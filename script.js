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
  link.addEventListener('click', closeMenu);
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

const slides = Array.from(document.querySelectorAll('.slide'));
const dotsContainer = document.getElementById('dots');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');

let currentSlide = 0;
let autoplayId;

function renderDots() {
  dotsContainer.innerHTML = '';
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = `dot${index === currentSlide ? ' active' : ''}`;
    dot.setAttribute('aria-label', `Slide ${index + 1}`);
    dot.addEventListener('click', () => {
      goToSlide(index);
      restartAutoplay();
    });
    dotsContainer.appendChild(dot);
  });
}

function goToSlide(index) {
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
  autoplayId = window.setInterval(nextSlide, 5000);
}

function restartAutoplay() {
  window.clearInterval(autoplayId);
  startAutoplay();
}

nextBtn.addEventListener('click', () => {
  nextSlide();
  restartAutoplay();
});

prevBtn.addEventListener('click', () => {
  prevSlide();
  restartAutoplay();
});

renderDots();
startAutoplay();

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

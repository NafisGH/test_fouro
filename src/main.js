import "./style.css";

import Swiper from "swiper";
import {
  Navigation,
  Pagination,
  Keyboard,
  A11y,
  EffectCoverflow,
} from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

Swiper.use([Navigation, Pagination, Keyboard, A11y, EffectCoverflow]);

const swiperMap = new WeakMap();

function bindSmartHover(container, instance) {
  const slides = Array.from(container.querySelectorAll(".swiper-slide"));
  if (!slides.length) return;

  let raf = 0;

  function setHoverByX(x) {
    const rects = slides.map((el) => {
      const r = el.getBoundingClientRect();
      return { el, cx: r.left + r.width / 2 };
    });
    let best = rects[0];
    let bestDist = Math.abs(best.cx - x);
    for (let i = 1; i < rects.length; i++) {
      const d = Math.abs(rects[i].cx - x);
      if (d < bestDist) {
        best = rects[i];
        bestDist = d;
      }
    }
    slides.forEach((s) => s.classList.remove("is-hover"));
    best.el.classList.add("is-hover");
  }

  function onMove(e) {
    const x = e.clientX || (e.touches && e.touches[0]?.clientX);
    if (x == null) return;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => setHoverByX(x));
  }

  function onLeave() {
    slides.forEach((s) => s.classList.remove("is-hover"));
  }

  container.addEventListener("mousemove", onMove);
  container.addEventListener("touchmove", onMove, { passive: true });
  container.addEventListener("mouseleave", onLeave);
  container.addEventListener("touchend", onLeave);

  instance.on("resize", () => onLeave());
  instance.on("slideChangeTransitionStart", () => onLeave());
}

function initSwiper(container) {
  if (swiperMap.has(container)) return;

  const paginationEl = container.querySelector(".swiper-pagination");
  const prevEl = container.querySelector(".swiper-button-prev");
  const nextEl = container.querySelector(".swiper-button-next");

  const slides = container.querySelectorAll(".swiper-slide");
  const middleIndex = slides.length > 0 ? Math.floor(slides.length / 2) : 0;

  const instance = new Swiper(container, {
    effect: "coverflow",
    speed: 600,
    spaceBetween: 16,
    loop: false,
    grabCursor: true,

    centeredSlides: true,
    centerInsufficientSlides: true,
    initialSlide: middleIndex,
    watchSlidesProgress: true,

    slidesPerView: 3,
    breakpoints: {
      1200: { slidesPerView: 3, spaceBetween: 16 },
      1400: { slidesPerView: 4, spaceBetween: 20 },
    },

    coverflowEffect: {
      rotate: 6,
      stretch: 0,
      depth: 120,
      modifier: 1,
      slideShadows: false,
    },

    navigation: prevEl && nextEl ? { prevEl, nextEl } : false,
    pagination: paginationEl ? { el: paginationEl, clickable: true } : false,
    keyboard: { enabled: true },
    a11y: { enabled: true },
    watchOverflow: true,
    observer: true,
    observeParents: true,
  });

  swiperMap.set(container, instance);
  bindSmartHover(container, instance);
}

function destroySwiper(container) {
  const instance = swiperMap.get(container);
  if (!instance) return;
  instance.destroy(true, true);
  swiperMap.delete(container);
}

function withTransition(container, fn) {
  container.classList.add("is-transitioning");
  try {
    fn();
  } finally {
    setTimeout(() => container.classList.remove("is-transitioning"), 220);
  }
}

function applyMode(isDesktop) {
  const containers = document.querySelectorAll(".swiper");
  containers.forEach((container) => {
    if (isDesktop) {
      if (!swiperMap.has(container))
        withTransition(container, () => initSwiper(container));
    } else {
      if (swiperMap.has(container))
        withTransition(container, () => destroySwiper(container));
    }
  });
}

const mq = window.matchMedia("(min-width: 1200px)");
function updateByMQ(e) {
  applyMode(e.matches);
}

function setupInViewAnimation() {
  const cards = document.querySelectorAll(".card");
  if (!("IntersectionObserver" in window) || !cards.length) {
    cards.forEach((c) => c.classList.add("in-view"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
  );
  cards.forEach((c) => io.observe(c));
}

function setupImageFadeIn() {
  const imgs = document.querySelectorAll(".card__img");
  imgs.forEach((img) => {
    if (img.complete) {
      img.setAttribute("data-loaded", "true");
      return;
    }
    img.addEventListener(
      "load",
      () => img.setAttribute("data-loaded", "true"),
      { once: true }
    );
    img.addEventListener(
      "error",
      () => img.setAttribute("data-loaded", "true"),
      { once: true }
    );
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyMode(mq.matches);
  if (typeof mq.addEventListener === "function")
    mq.addEventListener("change", updateByMQ);
  else mq.addListener(updateByMQ);
  setupInViewAnimation();
  setupImageFadeIn();
});

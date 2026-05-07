document.addEventListener("DOMContentLoaded", () => {
  highlightActiveNavLink();
  initScrollToTop();
  initNavbarScrollEffect();
  initMobileMenu();
  initLazyImages();
});


// Active nav link highlight
function highlightActiveNavLink() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });
}


// Scroll-to-top button
function initScrollToTop() {
  const btn = document.createElement("button");
  btn.id = "scrollToTopBtn";
  btn.setAttribute("aria-label", "Scroll to top");
  btn.innerHTML = "&#8679;";
  document.body.appendChild(btn);

  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 300);
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}


// Navbar shadow on scroll
function initNavbarScrollEffect() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
  });
}


// Mobile hamburger menu
function initMobileMenu() {
  const hamburger = document.querySelector(".navbar__hamburger");
  const mobileNav = document.querySelector(".navbar__links");
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");
    hamburger.setAttribute("aria-expanded", isOpen);
    hamburger.classList.toggle("open", isOpen);
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", false);
    });
  });
}


// Lazy image loading — images must use data-src instead of src
function initLazyImages() {
  const lazyImages = document.querySelectorAll("img.lazy");
  if (!lazyImages.length) return;

  if (!("IntersectionObserver" in window)) {
    lazyImages.forEach((img) => loadImage(img));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadImage(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px 200px 0px" }
  );

  lazyImages.forEach((img) => observer.observe(img));
}

function loadImage(img) {
  const src = img.getAttribute("data-src");
  if (!src) return;
  img.src = src;
  img.removeAttribute("data-src");
  img.classList.replace("lazy", "loaded");
}


// Utility functions — available globally via window.CookingApp
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric"
  });
}

function truncateText(str, maxLength) {
  if (!str) return "";
  return str.length > maxLength ? str.slice(0, maxLength).trimEnd() + "..." : str;
}

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isValidURL(str) {
  try { new URL(str); return true; }
  catch { return false; }
}

window.CookingApp = { formatDate, truncateText, debounce, capitalize, getRandomInt, isValidURL };
(function () {
  "use strict";

  const config = window.birthdayConfig || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const photos = Array.isArray(config.photos) ? config.photos.slice(0, 3) : [];
  let activePhoto = 0;
  let letterOpened = false;
  let candlesBlown = false;
  let revealsInitialized = false;
  let navigationInitialized = false;

  function setText(selector, value) {
    const element = $(selector);
    if (element && typeof value === "string") element.textContent = value;
  }

  function initContent() {
    const name = config.name || "Someone Special";
    const nameParts = name.trim().split(/\s+/);
    const firstLine = nameParts.shift() || "Someone";
    const secondLine = nameParts.join(" ") || "Special";
    const nameHeading = $("#openingName");
    if (secondLine === "Special" && name.trim().split(/\s+/).length === 1) {
      const singleName = document.createElement("em");
      singleName.textContent = firstLine;
      nameHeading.replaceChildren(singleName);
    } else {
      nameHeading.replaceChildren(document.createTextNode(firstLine + " "));
      const emphasizedName = document.createElement("em");
      emphasizedName.textContent = secondLine;
      nameHeading.append(document.createElement("br"), emphasizedName);
    }
    setText("#openingTitle", config.openingTitle);
    setText("#openingSubtitle", config.openingSubtitle);
    setText("#birthdayDate", config.date);
    setText("#closingTitle", config.closingTitle);
    setText("#closingSubtitle", config.closingSubtitle);
    setText("#footerName", name);
    setText("#letterGreeting", `Dear ${name},`);
    setText("#letterSignoff", config.letterSignoff || "With love, always.");

    const body = $("#letterBody");
    (config.letter || "").split(/\n\s*\n/).filter(Boolean).forEach((paragraph) => {
      const p = document.createElement("p");
      p.textContent = paragraph;
      body.append(p);
    });

    renderGallery();
    createParticles();
    initMusic();
  }

  function renderGallery() {
    const gallery = $("#photoGallery");
    photos.forEach((photo, index) => {
      const item = document.createElement("button");
      item.className = `gallery-card gallery-card--${index + 1} reveal`;
      item.type = "button";
      item.setAttribute("aria-label", `Open photo ${index + 1}: ${photo.caption || "Birthday memory"}`);
      const imageWrap = document.createElement("span");
      imageWrap.className = "gallery-card__image-wrap";
      const image = document.createElement("img");
      image.src = photo.src;
      image.alt = photo.caption || `Birthday memory ${index + 1}`;
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("error", () => {
        image.remove();
        imageWrap.classList.add("gallery-card__image-wrap--missing");
        imageWrap.setAttribute("aria-label", "Photo unavailable. Add the configured image to the images folder.");
        const placeholder = document.createElement("span");
        placeholder.className = "gallery-card__placeholder";
        placeholder.innerHTML = `<span aria-hidden="true">✧</span><small>YOUR MEMORY<br>GOES HERE</small>`;
        imageWrap.append(placeholder);
      }, { once: true });
      imageWrap.append(image);
      const caption = document.createElement("span");
      caption.className = "gallery-card__caption";
      caption.innerHTML = `<span class="gallery-card__number">0${index + 1}</span><span class="gallery-card__caption-text"></span><span class="gallery-card__open" aria-hidden="true">↗</span>`;
      $(".gallery-card__caption-text", caption).textContent = photo.caption || `A memory to keep`;
      item.append(imageWrap, caption);
      item.addEventListener("click", () => openLightbox(index));
      gallery.append(item);
    });
  }

  function openLightbox(index) {
    if (!photos.length) return;
    activePhoto = (index + photos.length) % photos.length;
    const photo = photos[activePhoto];
    $("#lightboxImage").src = photo.src;
    $("#lightboxImage").alt = photo.caption || `Birthday memory ${activePhoto + 1}`;
    $("#lightboxImage").hidden = false;
    $("#lightboxPlaceholder").hidden = true;
    $("#lightboxCaption").textContent = photo.caption || "";
    $("#lightboxCount").textContent = `${String(activePhoto + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`;
    const lightbox = $("#lightbox");
    if (typeof lightbox.showModal === "function") lightbox.showModal();
    else lightbox.setAttribute("open", "");
    document.body.classList.add("lightbox-open");
  }

  function closeLightbox() {
    const lightbox = $("#lightbox");
    if (typeof lightbox.close === "function" && lightbox.open) lightbox.close();
    else lightbox.removeAttribute("open");
    document.body.classList.remove("lightbox-open");
  }

  $("#lightboxImage").addEventListener("error", () => {
    $("#lightboxImage").hidden = true;
    $("#lightboxPlaceholder").hidden = false;
  });

  function changePhoto(step) {
    openLightbox(activePhoto + step);
  }

  function createParticles() {
    const field = $("#particleField");
    for (let i = 0; i < 18; i += 1) {
      const particle = document.createElement("span");
      const layer = i % 3;
      particle.className = `particle particle--layer-${layer + 1}`;
      particle.style.setProperty("--x", `${(i * 43 + 7) % 100}%`);
      particle.style.setProperty("--delay", `${(i % 9) * -1.7}s`);
      particle.style.setProperty("--duration", `${18 + (i % 8) * 2 + layer * 8}s`);
      particle.style.setProperty("--size", `${1 + layer + (i % 2)}px`);
      field.append(particle);
    }
  }

  function initReveal() {
    if (revealsInitialized) return;
    revealsInitialized = true;
    const targets = $$(".reveal");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      targets.forEach((target) => target.classList.add("is-visible"));
      $("#wish").classList.add("wish--active");
      return;
    }
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          if (entry.target.id === "cakeStage") {
            $("#wish").classList.add("wish--active");
          }
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach((target) => observer.observe(target));
  }

  function initNavigation() {
    if (navigationInitialized) return;
    navigationInitialized = true;
    const sections = ["memories", "wish", "letter"].map((id) => document.getElementById(id));
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          $$("[data-nav]").forEach((link) => {
            const current = link.dataset.nav === entry.target.id;
            link.classList.toggle("is-active", current);
            if (current) link.setAttribute("aria-current", "step");
            else link.removeAttribute("aria-current");
          });
        }
      });
    }, { rootMargin: "-35% 0px -50% 0px" });
    sections.forEach((section) => observer.observe(section));
  }

  function initMusic() {
    const audio = $("#backgroundMusic");
    const button = $("#musicToggle");
    const status = $("#musicStatus");
    if (!config.music) {
      button.disabled = true;
      status.textContent = "No music file has been configured.";
      return;
    }
    audio.src = config.music;
    audio.addEventListener("error", () => {
      button.disabled = true;
      button.setAttribute("aria-pressed", "false");
      $(".music-button__label", button).textContent = "Music unavailable";
      status.textContent = `Music file not found. Add the audio file at ${config.music}.`;
    });
    button.addEventListener("click", async () => {
      if (audio.paused) {
        try {
          await audio.play();
          button.classList.add("is-playing");
          button.setAttribute("aria-pressed", "true");
          button.setAttribute("aria-label", "Pause background music");
          $(".music-button__label", button).textContent = "Music on";
          status.textContent = "Background music playing.";
        } catch {
          button.disabled = true;
          $(".music-button__label", button).textContent = "Music unavailable";
          button.setAttribute("aria-label", "Background music unavailable");
          status.textContent = "Music could not be played. Check that the configured audio file exists and is supported.";
        }
      } else {
        audio.pause();
        button.classList.remove("is-playing");
        button.setAttribute("aria-pressed", "false");
        button.setAttribute("aria-label", "Play background music");
        $(".music-button__label", button).textContent = "Music off";
        status.textContent = "Background music paused.";
      }
    });
  }

  function scrollToSection(id) {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  function blowCandles() {
    if (candlesBlown) return;
    candlesBlown = true;
    $("#cake").classList.add("is-blown");
    const result = $("#wishResult");
    result.textContent = config.wishMessage || "May all your wishes come true.";
    result.classList.add("is-shown");
    $("#blowCandles").disabled = true;
    $("#blowCandles span:first-child").textContent = "Wish sent";
    $("#blowCandles").classList.add("is-pressed");
    launchConfetti();
    window.setTimeout(() => {
      $("#continueToLetter").hidden = false;
      requestAnimationFrame(() => $("#continueToLetter").classList.add("is-visible"));
    }, reduceMotion ? 0 : 1050);
  }

  function launchConfetti() {
    const field = $("#confettiField");
    const cakeBounds = $("#cake").getBoundingClientRect();
    const fieldBounds = field.getBoundingClientRect();
    const originX = cakeBounds.left + cakeBounds.width / 2 - fieldBounds.left;
    const originY = cakeBounds.top + cakeBounds.height * .25 - fieldBounds.top;
    const colors = ["#d9b97b", "#f7e9c8", "#b6874e", "#fff9ed", "#f2d896"];
    for (let i = 0; i < 34; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti";
      piece.style.setProperty("--left", `${originX + (Math.random() - .5) * Math.min(cakeBounds.width + 170, fieldBounds.width * .9)}px`);
      piece.style.setProperty("--top", `${Math.max(28, originY + (Math.random() - .5) * 65)}px`);
      piece.style.setProperty("--fall", `${5.2 + Math.random() * 1.8}s`);
      piece.style.setProperty("--delay", `${Math.random() * .65}s`);
      piece.style.setProperty("--spin", `${Math.random() * 520 - 260}deg`);
      piece.style.setProperty("--drift", `${Math.random() * 140 - 70}px`);
      piece.style.setProperty("--confetti-color", colors[i % colors.length]);
      field.append(piece);
      window.setTimeout(() => piece.remove(), 7800);
    }
  }

  function openLetter() {
    if (letterOpened) return;
    letterOpened = true;
    $("#envelope").classList.add("is-open");
    $("#letterPaper").setAttribute("aria-hidden", "false");
    $("#openLetter").disabled = true;
    $("#openLetter span:first-child").textContent = "A little note for you";
    window.setTimeout(() => $("#closing").classList.add("is-visible"), reduceMotion ? 0 : 1450);
    window.setTimeout(() => scrollToSection("closing"), reduceMotion ? 80 : 2850);
  }

  $("#openSurprise").addEventListener("click", () => {
    document.body.classList.add("cinematic-transition");
    $("#opening").classList.add("opening--closed");
    $("#experience").hidden = false;
    document.body.classList.add("experience-open");
    initReveal();
    initNavigation();
    window.setTimeout(() => {
      document.body.classList.remove("cinematic-transition");
      scrollToSection("memories");
    }, reduceMotion ? 0 : 1450);
    window.setTimeout(() => $("#memories .section-heading").classList.add("is-visible"), reduceMotion ? 0 : 650);
  });
  $("#lightboxClose").addEventListener("click", closeLightbox);
  $("#photoPrevious").addEventListener("click", () => changePhoto(-1));
  $("#photoNext").addEventListener("click", () => changePhoto(1));
  $("#lightbox").addEventListener("click", (event) => {
    if (event.target === $("#lightbox")) closeLightbox();
  });
  $("#lightbox").addEventListener("close", () => {
    document.body.classList.remove("lightbox-open");
  });
  $("#lightbox").addEventListener("cancel", () => {
    document.body.classList.remove("lightbox-open");
  });
  document.addEventListener("keydown", (event) => {
    if (!$("#lightbox").open) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") changePhoto(-1);
    if (event.key === "ArrowRight") changePhoto(1);
  });
  $("#blowCandles").addEventListener("click", blowCandles);
  $("#openLetter").addEventListener("click", openLetter);
  $$("[data-scroll-to]").forEach((button) => {
    button.addEventListener("click", () => scrollToSection(button.dataset.scrollTo));
  });

  initContent();
})();

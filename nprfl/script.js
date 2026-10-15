
  const audio = document.getElementById('bgAudio');
  const btn = document.getElementById('audioBtn');

  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      btn.classList.add('playing');
    } else {
      audio.pause();
      btn.classList.remove('playing');
    }
  });

const loader = document.querySelector(".loader");
const progress = document.querySelector(".progress");
const percentage = document.getElementById("percentage");

let count = 0;

function hideLoader() {
    loader.classList.add("hide");

    // Hapus dari DOM setelah animasi fade selesai
    setTimeout(() => loader.remove(), 600);
}

const loading = setInterval(() => {
    count++;

    progress.style.width = count + "%";
    percentage.textContent = count + "%";

    if (count >= 100) {
        clearInterval(loading);
        setTimeout(hideLoader, 300);
    }
}, 25);

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", isOpen);
    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Tutup menu" : "Buka menu"
    );
    menuToggle.textContent = isOpen ? "✕" : "☰";
});

// Tutup menu setelah link dipilih
navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Buka menu");
        menuToggle.textContent = "☰";
    });
});

// =========================
// 2. DARK / LIGHT MODE
// =========================

const themeToggle = document.getElementById("themeToggle");

function updateThemeButton() {
    const isLight = document.body.classList.contains("light-theme");

    themeToggle.textContent = isLight ? "☾" : "☀";
    themeToggle.setAttribute(
        "aria-label",
        isLight ? "Aktifkan dark mode" : "Aktifkan light mode"
    );
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");

    const theme = document.body.classList.contains("light-theme")
        ? "light"
        : "dark";

    try {
        localStorage.setItem("krisna-theme", theme);
    } catch (error) {
        // Website tetap berfungsi jika penyimpanan tidak tersedia.
    }

    updateThemeButton();
});

// Pulihkan tema yang dipilih sebelumnya
try {
    const savedTheme = localStorage.getItem("krisna-theme");

    if (savedTheme === "light") {
        document.body.classList.add("light-theme");
    }
} catch (error) {
    // Gunakan tema default jika penyimpanan tidak tersedia.
}

updateThemeButton();

// =========================
// 3. SCROLL REVEAL
// =========================

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
        (entries, observerInstance) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observerInstance.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12
        }
    );

    revealElements.forEach((element) => {
        observer.observe(element);
    });
} else {
    revealElements.forEach((element) => {
        element.classList.add("visible");
    });
}

// =========================
// 4. FOOTER YEAR
// =========================

document.getElementById("year").textContent =
    new Date().getFullYear();

// =========================
// 5. ACTIVE NAV LINK
// =========================

const sections = document.querySelectorAll("main section[id]");
const navItems = document.querySelectorAll(".nav-links a");

if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    navItems.forEach((link) => {
                        const isActive =
                            link.getAttribute("href") ===
                            `#${entry.target.id}`;

                        if (isActive) {
                            link.classList.add("active");
                        } else {
                            link.classList.remove("active");
                        }
                    });
                }
            });
        },
        {
            rootMargin: "-25% 0px -65% 0px"
        }
    );

    sections.forEach((section) => {
        sectionObserver.observe(section);
    });
}


// =========================
// 6. INTERACTIVE 3D TILT
// =========================
(() => {
    const cards = document.querySelectorAll(".hero-card, .project-card");
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!finePointer || reducedMotion) return;

    cards.forEach((card) => {
        card.addEventListener("pointermove", (event) => {
            const rect = card.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width;
            const y = (event.clientY - rect.top) / rect.height;

            const maxTilt = card.classList.contains("hero-card") ? 8 : 5;
            const rotateY = (x - 0.5) * maxTilt * 2;
            const rotateX = (0.5 - y) * maxTilt * 2;

            card.style.setProperty("--mx", `${x * 100}%`);
            card.style.setProperty("--my", `${y * 100}%`);
            card.style.transform =
                `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
        });

        card.addEventListener("pointerleave", () => {
            // Clear inline transform so the original CSS hover effect still works.
            card.style.transform = "";
            card.style.setProperty("--mx", "50%");
            card.style.setProperty("--my", "50%");
        });
    });
})();


// =========================
// 7. DRAGGABLE LANYARD
// Drag the lanyard down or sideways; release it to spring back.
// =========================
(() => {
    const scene = document.querySelector(".lanyard-scene");
    const strap = scene?.querySelector(".lanyard-strap");
    const badge = scene?.querySelector(".lanyard-badge");
    if (!scene || !strap || !badge) return;

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let offsetX = 0;
    let pullY = 0;

    scene.addEventListener("pointerdown", (event) => {
        if (event.button !== 0 && event.pointerType === "mouse") return;
        dragging = true;
        startX = event.clientX;
        startY = event.clientY;
        lastX = event.clientX;
        scene.setPointerCapture(event.pointerId);
        scene.classList.add("is-dragging");
        scene.style.animation = "none";
        event.preventDefault();
    });

    scene.addEventListener("pointermove", (event) => {
        if (!dragging) return;
        const dx = event.clientX - startX;
        const dy = Math.max(0, Math.min(260, event.clientY - startY));
        offsetX = dx;
        pullY = dy;
        scene.style.setProperty("--pull-length", `${dy}px`);
        scene.style.left = `calc(50% + ${dx}px)`;
        scene.style.setProperty("--drag-tilt", `${Math.max(-18, Math.min(18, (event.clientX - lastX) * 2))}deg`);
        badge.style.transform = `perspective(700px) rotateY(${Math.max(-22, Math.min(22, dx * 0.08))}deg) rotateZ(${Math.max(-12, Math.min(12, (event.clientX - lastX) * 1.5))}deg)`;
        lastX = event.clientX;
    });

    const release = () => {
        if (!dragging) return;
        dragging = false;
        scene.classList.remove("is-dragging");
        scene.style.transition = "left .55s cubic-bezier(.2,.8,.2,1)";
        scene.style.left = "50%";
        scene.style.setProperty("--pull-length", "0px");
        badge.style.transition = "transform .55s cubic-bezier(.2,.8,.2,1)";
        badge.style.transform = "perspective(700px) rotateY(-5deg) rotateZ(0deg)";
        window.setTimeout(() => {
            scene.style.transition = "";
            scene.style.animation = "";
            badge.style.transition = "";
            badge.style.transform = "";
        }, 600);
    };

    scene.addEventListener("pointerup", release);
    scene.addEventListener("pointercancel", release);
})();

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  // Klik gambar di semua kartu proyek
  document.querySelectorAll('.project-image img').forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('active');
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
  }

  // Tutup lewat tombol X
  lightboxClose.addEventListener('click', closeLightbox);

  // Tutup kalau klik area gelap di luar gambar
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Tutup dengan tombol Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
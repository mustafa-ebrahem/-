const openInviteBtn = document.getElementById("openInvite");
const chapters = document.querySelectorAll("[data-chapter]");
const story = document.getElementById("story");
const progressBar = document.getElementById("progressBar");
const chapterNextButtons = document.querySelectorAll(".chapter-next");
const daysLeft = document.getElementById("daysLeft");
const hoursLeft = document.getElementById("hoursLeft");
const minutesLeft = document.getElementById("minutesLeft");
const secondsLeft = document.getElementById("secondsLeft");
const celebrationCanvas = document.getElementById("celebrationCanvas");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const chapterList = Array.from(chapters);
let introCelebrationPlayed = false;

openInviteBtn?.addEventListener("click", () => {
  document.body.classList.add("opened");
  story?.scrollIntoView({ behavior: "smooth", block: "start" });
  launchCelebration(2200);
});

const getNextChapter = (currentChapter) => {
  if (chapterList.length === 0) {
    return null;
  }

  if (!currentChapter) {
    return chapterList[0];
  }

  const currentIndex = chapterList.indexOf(currentChapter);
  if (currentIndex === -1) {
    return chapterList[0];
  }

  return chapterList[currentIndex + 1] || chapterList[0];
};

const chapterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");

        if (entry.target.classList.contains("finale")) {
          launchCelebration(2800);
        }
      }
    });
  },
  {
    threshold: 0.3,
    rootMargin: "0px 0px -10% 0px"
  }
);

chapters.forEach((chapter, index) => {
  chapter.style.transitionDelay = `${index * 110}ms`;
  chapterObserver.observe(chapter);
});

chapterNextButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const currentChapter = button.closest(".chapter");
    const nextChapter = getNextChapter(currentChapter);

    if (!nextChapter) {
      return;
    }

    nextChapter.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const updateProgress = () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
};

const eventDate = new Date("2026-07-03T16:45:00+03:00");

const pad2 = (value) => String(value).padStart(2, "0");

const updateCountdown = () => {
  if (!daysLeft || !hoursLeft || !minutesLeft || !secondsLeft) {
    return;
  }

  const now = new Date();
  const diffMs = eventDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    daysLeft.textContent = "0";
    hoursLeft.textContent = "00";
    minutesLeft.textContent = "00";
    secondsLeft.textContent = "00";
    return;
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const remainingAfterDays = totalSeconds % (24 * 60 * 60);
  const hours = Math.floor(remainingAfterDays / 3600);
  const remainingAfterHours = remainingAfterDays % 3600;
  const minutes = Math.floor(remainingAfterHours / 60);
  const seconds = remainingAfterHours % 60;

  daysLeft.textContent = String(days);
  hoursLeft.textContent = pad2(hours);
  minutesLeft.textContent = pad2(minutes);
  secondsLeft.textContent = pad2(seconds);
};

const fireworksState = {
  particles: [],
  running: false,
  rafId: null,
  timeoutId: null,
  intervalId: null,
  width: 0,
  height: 0
};

const palette = ["#f6b56f", "#d26a3d", "#4f7c72", "#f39f7a", "#ffd47f", "#ffffff"];

const resizeCelebrationCanvas = () => {
  if (!(celebrationCanvas instanceof HTMLCanvasElement)) {
    return;
  }

  fireworksState.width = window.innerWidth;
  fireworksState.height = window.innerHeight;
  celebrationCanvas.width = fireworksState.width;
  celebrationCanvas.height = fireworksState.height;
};

const createBurst = (x, y, count, speedMin, speedMax) => {
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
    const speed = speedMin + Math.random() * (speedMax - speedMin);

    fireworksState.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 55 + Math.random() * 30,
      size: 2 + Math.random() * 3,
      color: palette[Math.floor(Math.random() * palette.length)],
      gravity: 0.035 + Math.random() * 0.03,
      drag: 0.986
    });
  }
};

const renderCelebration = () => {
  if (!(celebrationCanvas instanceof HTMLCanvasElement)) {
    return;
  }

  const ctx = celebrationCanvas.getContext("2d");
  if (!ctx) {
    return;
  }

  ctx.clearRect(0, 0, fireworksState.width, fireworksState.height);

  fireworksState.particles = fireworksState.particles.filter((particle) => {
    particle.life += 1;
    if (particle.life >= particle.maxLife) {
      return false;
    }

    particle.vx *= particle.drag;
    particle.vy = particle.vy * particle.drag + particle.gravity;
    particle.x += particle.vx;
    particle.y += particle.vy;

    const alpha = 1 - particle.life / particle.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    return true;
  });

  ctx.globalAlpha = 1;

  if (fireworksState.running || fireworksState.particles.length > 0) {
    fireworksState.rafId = window.requestAnimationFrame(renderCelebration);
  } else {
    fireworksState.rafId = null;
  }
};

const launchCelebration = (durationMs) => {
  if (prefersReducedMotion || !(celebrationCanvas instanceof HTMLCanvasElement)) {
    return;
  }

  resizeCelebrationCanvas();

  if (fireworksState.intervalId) {
    window.clearInterval(fireworksState.intervalId);
  }

  if (fireworksState.timeoutId) {
    window.clearTimeout(fireworksState.timeoutId);
  }

  fireworksState.running = true;

  createBurst(fireworksState.width * 0.25, fireworksState.height * 0.25, 40, 1.5, 4.2);
  createBurst(fireworksState.width * 0.75, fireworksState.height * 0.25, 40, 1.5, 4.2);
  createBurst(fireworksState.width * 0.5, fireworksState.height * 0.2, 50, 1.8, 4.6);

  fireworksState.intervalId = window.setInterval(() => {
    const x = fireworksState.width * (0.15 + Math.random() * 0.7);
    const y = fireworksState.height * (0.14 + Math.random() * 0.32);
    createBurst(x, y, 42, 1.2, 3.9);
  }, 360);

  fireworksState.timeoutId = window.setTimeout(() => {
    fireworksState.running = false;
    if (fireworksState.intervalId) {
      window.clearInterval(fireworksState.intervalId);
      fireworksState.intervalId = null;
    }
  }, durationMs);

  if (!fireworksState.rafId) {
    renderCelebration();
  }
};

const playIntroCelebration = () => {
  if (introCelebrationPlayed) {
    return;
  }

  introCelebrationPlayed = true;
  launchCelebration(2200);
};

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", resizeCelebrationCanvas);
window.addEventListener("DOMContentLoaded", playIntroCelebration);
window.addEventListener("load", () => {
  resizeCelebrationCanvas();
  updateProgress();
  updateCountdown();
  playIntroCelebration();
});

window.setInterval(updateCountdown, 1000);

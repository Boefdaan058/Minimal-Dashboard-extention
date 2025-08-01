// === CLOCK ===
function updateClock() {
  const now = new Date();
  const clockElement = document.getElementById("clock");
  if (clockElement) {
    clockElement.textContent = now.toLocaleTimeString();
  }
}
setInterval(updateClock, 1000);
updateClock();

// === QUOTE ===
function loadQuote() {
  fetch('https://programming-quotesapi.vercel.app/api/random')
    .then(res => res.json())
    .then(data => {
      let quoteText = "Stay positive and keep coding!";
      if (data.quote && data.author) {
        quoteText = `${data.quote} – ${data.author}`;
      }
      const quoteElement = document.getElementById('quote');
      if (quoteElement) {
        quoteElement.textContent = quoteText;
      }
    })
    .catch(error => {
      console.error("Quote fetch failed:", error);
      const fallback = document.getElementById('quote');
      if (fallback) {
        fallback.textContent = "Stay positive and keep coding!";
      }
    });
}

// === BOOKMARKS ===
function loadBookmarks() {
  let bookmarks = [];
  try {
    bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
  } catch (e) {
    console.warn("Invalid bookmarks data in localStorage. Resetting.");
    localStorage.removeItem("bookmarks");
  }

  const container = document.getElementById("bookmarks");
  const list = document.getElementById("bookmarkList");
  if (!container || !list) return;

  container.innerHTML = "";
  list.innerHTML = "";

  const iconMode = document.body.classList.contains('bookmarks-icons');

  bookmarks.forEach(({ label, url }, idx) => {
    // Display
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    if (iconMode) {
      const icon = document.createElement("img");
      icon.src = `https://www.google.com/s2/favicons?domain=${url}`;
      icon.alt = "";
      a.appendChild(icon);
      a.appendChild(document.createTextNode(label));
    } else {
      a.textContent = label;
    }
    container.appendChild(a);

    // Delete button
    const item = document.createElement("div");
    item.className = "bookmark-row";

    const span = document.createElement("span");
    span.innerHTML = `${label} <small style="color:#888;font-size:0.95em;">${url}</small>`;
    item.appendChild(span);

    const button = document.createElement("button");
    button.textContent = "🗑️";
    button.className = "delete-btn";
    button.addEventListener("click", () => deleteBookmark(idx));

    item.appendChild(button);
    list.appendChild(item);
  });
}

function addBookmark() {
  const label = document.getElementById("siteLabel").value.trim();
  let url = document.getElementById("siteUrl").value.trim();
  if (!label || !url) return;
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }
  const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
  bookmarks.push({ label, url });
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  document.getElementById("siteLabel").value = "";
  document.getElementById("siteUrl").value = "";
  loadBookmarks();
}

function deleteBookmark(idx) {
  const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
  bookmarks.splice(idx, 1);
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  loadBookmarks();
}

// === POMODORO ===
let pomodoroTime = 25 * 60;
let interval;
let isRunning = false;

function updateTimerDisplay() {
  const minutes = Math.floor(pomodoroTime / 60).toString().padStart(2, '0');
  const seconds = (pomodoroTime % 60).toString().padStart(2, '0');
  const timer = document.getElementById("timer");
  if (timer) {
    timer.textContent = `${minutes}:${seconds}`;
  }
}

function startPomodoro() {
  if (isRunning) return;
  isRunning = true;
  interval = setInterval(() => {
    if (pomodoroTime > 0) {
      pomodoroTime--;
      updateTimerDisplay();
      localStorage.setItem("pomodoroTime", pomodoroTime);
    } else {
      clearInterval(interval);
      isRunning = false;
    }
  }, 1000);
}

function resetPomodoro() {
  clearInterval(interval);
  isRunning = false;
  pomodoroTime = 25 * 60;
  updateTimerDisplay();
  localStorage.removeItem("pomodoroTime");
}

// === BACKGROUND GRADIENT ===
if (typeof anime !== "undefined") {
  anime.mix = function (a, b, t) {
    const ah = a.replace("#", "");
    const bh = b.replace("#", "");
    const ar = parseInt(ah.substring(0, 2), 16),
      ag = parseInt(ah.substring(2, 4), 16),
      ab = parseInt(ah.substring(4, 6), 16);
    const br = parseInt(bh.substring(0, 2), 16),
      bg = parseInt(bh.substring(2, 4), 16),
      bb = parseInt(bh.substring(4, 6), 16);
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const b_ = Math.round(ab + (bb - ab) * t);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b_.toString(16).padStart(2, "0")}`;
  };
}

let gradientColors = JSON.parse(localStorage.getItem("bgColors") || '["#ff5f6d", "#ffc371"]');

function animateGradient(fromColors, toColors, duration = 2000) {
  let obj = { t: 0 };
  anime({
    targets: obj,
    t: 1,
    duration,
    easing: "linear",
    update: () => {
      const c1 = anime.mix(fromColors[0], toColors[0], obj.t);
      const c2 = anime.mix(fromColors[1], toColors[1], obj.t);
      document.body.style.background = `linear-gradient(to right, ${c1}, ${c2})`;
    },
    complete: () => {
      document.body.style.background = `linear-gradient(to right, ${toColors[0]}, ${toColors[1]})`;
    }
  });
}

function applyGradient(colors) {
  if (!document.body.classList.contains("light")) {
    document.body.style.background = `linear-gradient(to right, ${colors[0]}, ${colors[1]})`;
  } else {
    document.body.style.background = "";
  }
}

function startGradientLoop() {
  applyGradient(gradientColors);
  setInterval(() => {
    const nextColors = [gradientColors[1], gradientColors[0]];
    animateGradient(gradientColors, nextColors, 2000);
    gradientColors = nextColors;
    localStorage.setItem("bgColors", JSON.stringify(gradientColors));
    updateCardAndDropdownBg(gradientColors);
  }, 8000);
}

function saveColors() {
  let c1 = document.getElementById("color1").value;
  let c2 = document.getElementById("color2").value;
  if (c1 === "#000000") c1 = "#ff5f6d";
  if (c2 === "#000000") c2 = "#ffc371";
  const prevColors = [...gradientColors];
  gradientColors = [c1, c2];
  localStorage.setItem("bgColors", JSON.stringify(gradientColors));
  animateGradient(prevColors, gradientColors, 2000);
  updateCardAndDropdownBg(gradientColors);
}

// === THEME MODE ===
function applyTheme(theme) {
  document.body.classList.remove("light");
  if (theme === "light") {
    document.body.classList.add("light");
  }
  localStorage.setItem("theme", theme);
  updateCardAndDropdownBg(gradientColors);
}

function toggleTheme() {
  const current = localStorage.getItem("theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
}

// === UI SETUP ON LOAD ===
window.addEventListener("DOMContentLoaded", () => {
  loadQuote();
  loadBookmarks();
  updateTimerDisplay();

  // Events
  document.getElementById("settingsBtn").addEventListener("click", () => {
    const dropdown = document.getElementById("settingsDropdown");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (e) => {
    const btn = document.getElementById("settingsBtn");
    const dropdown = document.getElementById("settingsDropdown");
    if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });

  document.getElementById("setBgBtn").addEventListener("click", saveColors);
  document.getElementById("addBookmarkBtn").addEventListener("click", addBookmark);
  document.getElementById("themeBtn").addEventListener("click", toggleTheme);
  document.getElementById("bookmarkIconBtn").addEventListener("click", () => {
    document.body.classList.toggle("bookmarks-icons");
    loadBookmarks();
  });
  document.getElementById("startPomodoroBtn").addEventListener("click", startPomodoro);
  document.getElementById("resetPomodoroBtn").addEventListener("click", resetPomodoro);

  // Apply theme and gradient
  document.getElementById("color1").value = gradientColors[0] || "#ff5f6d";
  document.getElementById("color2").value = gradientColors[1] || "#ffc371";
  applyGradient(gradientColors);
  updateCardAndDropdownBg(gradientColors);
  startGradientLoop();

  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);
});

function updateCardAndDropdownBg(colors) {
  const card = document.getElementById('container');
  const dropdown = document.getElementById('settingsDropdown');
  if (!card || !dropdown) return;
  if (document.body.classList.contains('light')) {
    card.style.background = `linear-gradient(135deg, ${colors[0]}22 0%, ${colors[1]}22 100%), var(--card-bg-light)`;
    dropdown.style.background = `linear-gradient(135deg, ${colors[0]}22 0%, ${colors[1]}22 100%), var(--dropdown-bg-light)`;
  } else {
    card.style.background = `linear-gradient(135deg, ${colors[0]}cc 0%, ${colors[1]}cc 100%), var(--card-bg-dark)`;
    dropdown.style.background = `linear-gradient(135deg, ${colors[0]}22 0%, ${colors[1]}22 100%), var(--dropdown-bg-dark)`;
  }
}

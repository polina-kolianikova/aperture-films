const $ = (s) => document.querySelector(s),
  clamp = (x) => Math.max(0, Math.min(1, x)),
  smooth = (x) => {
    x = clamp(x);
    return x * x * (3 - 2 * x);
  },
  reduce = matchMedia("(prefers-reduced-motion: reduce)");
const opening = $("#opening"),
  land = $(".landscape"),
  photo = land.querySelector("img"),
  title = $(".hero-title"),
  corners = $(".crop-corners"),
  word = $(".aperture-word"),
  left = $(".shutter.left"),
  right = $(".shutter.right"),
  frame = $("#frame");
let raf = 0,
  frames = 0;
function paint() {
  raf = 0;
  if (document.hidden) return;
  const rect = opening.getBoundingClientRect();
  if (rect.bottom < 0 || rect.top > innerHeight) {
    document.documentElement.dataset.renderMode = "offscreen";
    return;
  }
  const p = clamp(-rect.top / Math.max(1, opening.offsetHeight - innerHeight));
  if (!reduce.matches) {
    const wide = smooth(p / 0.7),
      close = smooth((p - 0.83) / 0.17);
    land.style.clipPath = `inset(${(innerWidth < 701 ? 19 : 17) * (1 - wide)}% ${(innerWidth < 701 ? 12 : 24) * (1 - wide)}%)`;
    photo.style.transform = `scale(${1.08 + 0.12 * wide}) translateY(${p * -3}%)`;
    title.style.opacity = 1 - smooth((p - 0.18) / 0.35);
    title.style.transform = `translateY(${-p * 130}px) scale(${1 + p * 0.15})`;
    corners.style.opacity = 1 - smooth(p / 0.22);
    word.style.opacity = smooth((p - 0.3) / 0.25) * (1 - close);
    word.style.transform = `translateY(${(1 - wide) * 60}px)`;
    left.style.transform = `translateX(${-100 + close * 100}%)`;
    right.style.transform = `translateX(${100 - close * 100}%)`;
  }
  frame.textContent = `FRAME ${String(Math.round(p * 143) + 1).padStart(3, "0")}`;
  document.documentElement.dataset.renderFrames = String(++frames);
  document.documentElement.dataset.renderMode = "idle";
}
function wake() {
  if (!raf && !document.hidden) raf = requestAnimationFrame(paint);
}
addEventListener("scroll", wake, { passive: true });
addEventListener("resize", wake);
reduce.addEventListener("change", wake);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(raf);
    raf = 0;
    document.documentElement.dataset.renderMode = "hidden";
  } else wake();
});
wake();
const studies = [
  {
    name: "Altitude",
    file: "alpine",
    text: "A study in scale. An almost empty frame, a single summit and the slow arrival of light. The image stays still; your position changes what it reveals.",
  },
  {
    name: "Between tides",
    file: "ocean",
    text: "The horizon does very little. Water does everything. A visual study in rhythm, patience and the space between two movements.",
  },
  {
    name: "Quiet ground",
    file: "forest",
    text: "There is always more happening than the eye first catches. Vertical lines, scattered light and a path that continues beyond the frame.",
  },
];
let selected = 0;
const dialog = $("#viewer");
function showStudy(i) {
  selected = (i + studies.length) % studies.length;
  const s = studies[selected];
  $("#viewer-image").src = `assets/${s.file}-2400.jpg`;
  $("#viewer-image").alt = s.name + " photographic study";
  $("#viewer-number").textContent = `VISUAL STUDY / 0${selected + 1}`;
  $("#viewer-title").textContent = s.name;
  $("#viewer-text").textContent = s.text;
}
document.querySelectorAll("[data-film]").forEach((b) =>
  b.addEventListener("click", () => {
    showStudy(Number(b.dataset.film));
    dialog.showModal();
  }),
);
$("#close-viewer").addEventListener("click", () => dialog.close());
$("#previous").addEventListener("click", () => showStudy(selected - 1));
$("#next").addEventListener("click", () => showStudy(selected + 1));
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      dialog.close();
  }
});
document.querySelectorAll("[data-filter]").forEach((b) =>
  b.addEventListener("click", () => {
    document
      .querySelectorAll("[data-filter]")
      .forEach((a) => a.setAttribute("aria-pressed", String(a === b)));
    document
      .querySelectorAll(".work")
      .forEach(
        (w) =>
          (w.hidden =
            b.dataset.filter !== "all" &&
            w.dataset.category !== b.dataset.filter),
      );
  }),
);
$("#brief").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = `APERTURE / Starting brief\n\nFormat: ${$("#format").value}\n\nStory:\n${$("#story").value.trim()}\n\nBefore production:\nAudience, desired feeling, locations, delivery format, schedule and budget.\n\nIndependent film studio concept by BlackStack Studio.\nThis local document does not send an enquiry or place an order.\n`;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  a.download = "aperture-starting-brief.txt";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  $("#brief-status").textContent = "Your starting brief has been downloaded.";
});

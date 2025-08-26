// Petite séquence : le perso marche jusqu'au centre, LED s'allume, puis on peut Start.
// + Sons bleep (WebAudio) optionnels, toggle "M" pour mute.

(function () {
  const char = document.getElementById("heroChar");
  const led = document.getElementById("mdLed");
  const startBtn = document.getElementById("startBtn");

  let audioCtx;
  let muted = false;
  function bleep(freq = 880, dur = 0.06, type = "square", vol = 0.04) {
    if (muted) return;
    try {
      audioCtx =
        audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = vol;
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start();
      setTimeout(() => {
        o.stop();
      }, dur * 1000);
    } catch (e) {}
  }

  // Démarre l'anim de marche
  requestAnimationFrame(() => char.classList.add("walk"));
  setTimeout(() => {
    char.classList.remove("walk");
    char.classList.add("idle");
    led.classList.add("on");
    bleep(1200, 0.08);
  }, 1900); // durée alignée sur l'animation CSS

  // Entrée/Space déclenchent Start
  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      bleep(1600, 0.08);
      startBtn.closest("form").submit();
    }
    if (e.key.toLowerCase() === "m") {
      muted = !muted;
      bleep(400, 0.03);
    }
  });

  // Hover / click feedback
  startBtn.addEventListener("mouseenter", () => bleep(1000, 0.04));
  startBtn.addEventListener("click", () => bleep(1400, 0.06));
})();

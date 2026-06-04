// ================================================================
//  audio.js — Sonidos del juego (Web Audio API, funciona offline)
// ================================================================

const AudioManager = (function () {
  let ctx = null;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /**
   * Toca una nota individual.
   * @param {number} freq   - Frecuencia en Hz
   * @param {number} start  - Inicio en segundos desde ahora
   * @param {number} dur    - Duración en segundos
   * @param {string} type   - Tipo de oscilador: 'sine', 'triangle', 'square', 'sawtooth'
   * @param {number} vol    - Volumen (0 a 1)
   */
  function nota(freq, start, dur, type = 'sine', vol = 0.3) {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime + start);
    gain.gain.setValueAtTime(vol, ac.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + dur);
    osc.start(ac.currentTime + start);
    osc.stop(ac.currentTime + start + dur + 0.05);
  }

  /** Sonido de respuesta correcta */
  function playCorrect() {
    nota(523.25, 0.00, 0.12, 'sine', 0.3);   // C5
    nota(659.25, 0.12, 0.12, 'sine', 0.3);   // E5
    nota(783.99, 0.24, 0.28, 'sine', 0.35);  // G5
  }

  /** Sonido de respuesta incorrecta */
  function playWrong() {
    nota(220, 0.00, 0.18, 'sawtooth', 0.3);
    nota(164.81, 0.18, 0.30, 'sawtooth', 0.25);
  }

  /** Fanfarria de victoria (melodía en Do mayor) */
  function playVictory() {
    // Melodía principal
    const melodia = [
      [392.00, 0.00, 0.18],   // G4
      [523.25, 0.18, 0.18],   // C5
      [659.25, 0.36, 0.18],   // E5
      [783.99, 0.54, 0.18],   // G5
      [1046.5, 0.72, 0.55],   // C6 — nota larga
      [783.99, 0.90, 0.18],   // G5
      [880.00, 1.08, 0.18],   // A5
      [1046.5, 1.26, 0.80],   // C6 — final
    ];
    melodia.forEach(([f, s, d]) => nota(f, s, d, 'triangle', 0.38));

    // Armonía de fondo
    const armonia = [
      [261.63, 0.54, 0.55],   // C4
      [329.63, 0.54, 0.55],   // E4
      [261.63, 1.26, 0.80],
      [329.63, 1.26, 0.80],
    ];
    armonia.forEach(([f, s, d]) => nota(f, s, d, 'triangle', 0.15));

    // Acorde de apertura
    nota(261.63, 0.00, 0.40, 'triangle', 0.12);
    nota(329.63, 0.00, 0.40, 'triangle', 0.12);
  }

  /** Melodía de derrota */
  function playDefeat() {
    const notas = [
      [392.00, 0.00, 0.28],   // G4
      [349.23, 0.28, 0.28],   // F4
      [329.63, 0.56, 0.28],   // E4
      [293.66, 0.84, 0.55],   // D4
    ];
    notas.forEach(([f, s, d]) => nota(f, s, d, 'sine', 0.3));

    // Bajo descendente
    nota(196.00, 0.84, 0.70, 'triangle', 0.15);
  }

  return { playCorrect, playWrong, playVictory, playDefeat };
})();

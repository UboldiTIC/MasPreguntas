// ================================================================
//  main.js — Controlador principal del juego "Academia Estelar"
// ================================================================

// ----------------------------------------------------------------
// Configuración de áreas de conocimiento
// Para agregar un área, defínela aquí y crea su archivo en /data/
// ----------------------------------------------------------------
const AREAS = {
  sociales: {
    nombre:   'Ciencias Sociales',
    icono:    '🌍',
    color:    '#ff6b35',
    colorBg:  'rgba(255, 107, 53, 0.22)',
    colorGlow:'rgba(255, 107, 53, 0.55)',
    preguntas: (typeof SOCIALES_PREGUNTAS   !== 'undefined') ? SOCIALES_PREGUNTAS   : []
  },
  naturales: {
    nombre:   'Ciencias Naturales',
    icono:    '🔬',
    color:    '#00c88c',
    colorBg:  'rgba(0, 200, 140, 0.22)',
    colorGlow:'rgba(0, 200, 140, 0.55)',
    preguntas: (typeof NATURALES_PREGUNTAS  !== 'undefined') ? NATURALES_PREGUNTAS  : []
  },
  lengua: {
    nombre:   'Lengua y Literatura',
    icono:    '📚',
    color:    '#e91e8c',
    colorBg:  'rgba(233, 30, 140, 0.22)',
    colorGlow:'rgba(233, 30, 140, 0.55)',
    preguntas: (typeof LENGUA_PREGUNTAS     !== 'undefined') ? LENGUA_PREGUNTAS     : []
  },
  matematicas: {
    nombre:   'Matemáticas',
    icono:    '📐',
    color:    '#00b4ff',
    colorBg:  'rgba(0, 180, 255, 0.22)',
    colorGlow:'rgba(0, 180, 255, 0.55)',
    preguntas: (typeof MATEMATICAS_PREGUNTAS!== 'undefined') ? MATEMATICAS_PREGUNTAS: []
  }
};

// ----------------------------------------------------------------
// Estado del juego
// ----------------------------------------------------------------
let estado = {
  rondaActual:  0,
  areasUsadas:  [],
  areaActual:   null
};

// ----------------------------------------------------------------
// Utilidades
// ----------------------------------------------------------------

/** Devuelve una clave de área al azar, excluyendo las ya usadas */
function areaAleatoria(excluir) {
  const disponibles = Object.keys(AREAS).filter(function (k) {
    return !excluir.includes(k);
  });
  return disponibles[Math.floor(Math.random() * disponibles.length)];
}

/** Devuelve una pregunta aleatoria del área indicada */
function preguntaAleatoria(claveArea) {
  const lista = AREAS[claveArea].preguntas;
  return lista[Math.floor(Math.random() * lista.length)];
}

/** Mezcla las opciones y registra cuál es la correcta */
function mezclarOpciones(pregunta) {
  const opts = pregunta.opciones.map(function (texto, i) {
    return { texto: texto, esCorrecta: (i === pregunta.correcta) };
  });
  // Fisher-Yates
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = opts[i]; opts[i] = opts[j]; opts[j] = tmp;
  }
  return opts;
}

// ----------------------------------------------------------------
// Navegación entre pantallas
// ----------------------------------------------------------------

/**
 * Muestra la pantalla con el id indicado; oculta las demás.
 * Usa un pequeño retardo para que la transición CSS sea visible.
 */
function mostrarPantalla(id) {
  document.querySelectorAll('.screen.active').forEach(function (s) {
    s.classList.remove('active');
  });
  setTimeout(function () {
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
  }, 80);
}

// ----------------------------------------------------------------
// Lógica del juego
// ----------------------------------------------------------------

function iniciarJuego(claveArea) {
  Confetti.stop();
  estado = { rondaActual: 1, areasUsadas: [claveArea], areaActual: claveArea };
  mostrarPregunta(claveArea);
}

function mostrarPregunta(claveArea) {
  const area     = AREAS[claveArea];
  const pregunta = preguntaAleatoria(claveArea);

  if (!pregunta) {
    alert('No hay preguntas cargadas para: ' + area.nombre);
    return;
  }

  // — Header —
  document.getElementById('q-icon').textContent  = area.icono;
  document.getElementById('q-name').textContent  = area.nombre;
  document.querySelector('.question-top').style.background = area.colorBg;
  document.querySelector('.question-top').style.borderBottomColor = area.color;

  // — Dots de progreso —
  document.querySelectorAll('.dot').forEach(function (dot, i) {
    dot.classList.remove('dot-active', 'dot-done');
    dot.style.background   = '';
    dot.style.borderColor  = '';
    dot.style.boxShadow    = '';
    if (i < estado.rondaActual - 1) {
      dot.classList.add('dot-done');
    } else if (i === estado.rondaActual - 1) {
      dot.classList.add('dot-active');
      dot.style.background  = area.color;
      dot.style.borderColor = area.color;
      dot.style.boxShadow   = '0 0 10px ' + area.colorGlow;
    }
  });

  // — Texto de la pregunta —
  document.getElementById('question-text').textContent = pregunta.pregunta;

  // — Feedback bar (oculta al iniciar) —
  const fb = document.getElementById('feedback-bar');
  fb.className = 'feedback-bar';

  // — Opciones mezcladas —
  const opciones   = mezclarOpciones(pregunta);
  const container  = document.getElementById('options-container');
  container.innerHTML = '';
  const letras = ['A', 'B', 'C', 'D'];

  opciones.forEach(function (opt, i) {
    const btn = document.createElement('button');
    btn.className            = 'option-btn';
    btn.dataset.correct      = opt.esCorrecta ? 'true' : 'false';
    btn.innerHTML = (
      '<span class="option-letter">' + letras[i] + '</span>' +
      '<span class="option-text">'   + opt.texto + '</span>'
    );
    btn.addEventListener('click', function () {
      manejarRespuesta(btn, opt.esCorrecta, container, area);
    });
    container.appendChild(btn);
  });

  mostrarPantalla('screen-question');
}

function manejarRespuesta(btn, esCorrecta, container, area) {
  // Deshabilitar todos los botones inmediatamente
  container.querySelectorAll('.option-btn').forEach(function (b) {
    b.disabled = true;
  });

  const fb = document.getElementById('feedback-bar');

  if (esCorrecta) {
    btn.classList.add('correct');
    btn.querySelector('.option-letter').textContent = '✓';
    AudioManager.playCorrect();

    fb.className   = 'feedback-bar fb-correct';
    fb.textContent = '¡Correcto! 🎉';

    setTimeout(function () {
      if (estado.rondaActual >= 3) {
        mostrarVictoria();
      } else {
        estado.rondaActual++;
        const siguiente = areaAleatoria(estado.areasUsadas);
        estado.areasUsadas.push(siguiente);
        estado.areaActual = siguiente;
        mostrarPregunta(siguiente);
      }
    }, 1300);

  } else {
    btn.classList.add('incorrect');
    btn.querySelector('.option-letter').textContent = '✗';

    // Revelar respuesta correcta
    let textoCorrecta = '';
    container.querySelectorAll('.option-btn').forEach(function (b) {
      if (b.dataset.correct === 'true') {
        b.classList.add('correct');
        b.querySelector('.option-letter').textContent = '✓';
        textoCorrecta = b.querySelector('.option-text').textContent;
      }
    });

    AudioManager.playWrong();
    fb.className   = 'feedback-bar fb-incorrect';
    fb.textContent = '¡Incorrecto! 😞  La respuesta era: ' + textoCorrecta;

    setTimeout(function () {
      mostrarDerrota();
    }, 2000);
  }
}

function mostrarVictoria() {
  mostrarPantalla('screen-win');
  Confetti.start();
  AudioManager.playVictory();
}

function mostrarDerrota() {
  mostrarPantalla('screen-lose');
  AudioManager.playDefeat();
}

function reiniciarJuego() {
  Confetti.stop();
  estado = { rondaActual: 0, areasUsadas: [], areaActual: null };
  mostrarPantalla('screen-welcome');
}

// ----------------------------------------------------------------
// Inicialización al cargar la página
// ----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {

  // Efectos visuales
  Stars.init();
  Confetti.init();
  Confetti.stop(); // el canvas inicia oculto

  // Botón de inicio
  document.getElementById('btn-start').addEventListener('click', function () {
    mostrarPantalla('screen-subject-select');
  });

  // Tarjetas de selección de área
  document.querySelectorAll('.subject-card').forEach(function (card) {
    card.addEventListener('click', function () {
      const clave = card.dataset.subject;
      if (AREAS[clave] && AREAS[clave].preguntas.length > 0) {
        iniciarJuego(clave);
      } else {
        alert('No hay preguntas cargadas para esta área.');
      }
    });
  });

  // Botones de "jugar de nuevo"
  document.getElementById('btn-play-again-win').addEventListener('click',  reiniciarJuego);
  document.getElementById('btn-play-again-lose').addEventListener('click', reiniciarJuego);
});

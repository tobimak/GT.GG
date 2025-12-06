let builds = {};
let versionActual = "";

// ==========================================================
// 1. MAPEOS Y UTILIDADES DE NAVEGACIÓN
// ==========================================================
const nombreAId = {
  Wukong: "MonkeyKing",
  Aurelionsol: "AurelionSol",
  Reksai: "RekSai",
  Maestroyi: "MasterYi",
  // Agrega aca otros si queres
};
function obtenerIdOficial(nombreAmigable) {
  // Capitaliza para evitar problemas de mayúsculas/minúsculas
  const nombreCapitalizado = nombreAmigable.charAt(0).toUpperCase() + nombreAmigable.slice(1);
  return nombreAId[nombreCapitalizado] || nombreCapitalizado;
}
// Mapeo inverso ID oficial → nombre amigable (Necesario para el carrusel)
const idANombre = {};
for (const [nombre, id] of Object.entries(nombreAId)) {
  idANombre[id] = nombre;
}

// Obtener versión actual de Data Dragon
async function getVersion() {
  const response = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
  const versiones = await response.json();
  versionActual = versiones[0];
}

// Cargar builds (Solo para saber qué campeones tienen builds, pero no se usan aquí)
async function loadBuilds() {
  try {
    const response = await fetch("builds.json");
    if (!response.ok) {
      throw new Error(`Error al cargar builds.json: ${response.status}`);
    }
    builds = await response.json();
  } catch (error) {
    console.error("No se pudo cargar el archivo JSON:", error);
  }
}

// Función de navegación principal: redirige a la página del campeón
function buscarCampeon(nombreParam) {
  let nombre = nombreParam || document.getElementById("search").value.trim();
  if (!nombre) return;

  nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
  const idOficial = obtenerIdOficial(nombre);

  // Redirige a la nueva página del campeón
  window.location.href = `champ.html?champ=${idOficial}`;
}

// ==========================================================
// 2. LÓGICA DEL CARRUSEL INTERACTIVO
// ==========================================================

const carrusel = document.getElementById('carrusel');
const cuadros = Array.from(carrusel.querySelectorAll('.cuadro'));

// Array con todos los campeones
const campeoneslista = [
  "Aatrox", "Ahri", "Akali", "Alistar","Ambessa", "Amumu", "Anivia", "Annie", "Aphelios", "Ashe",
  "AurelionSol","Aurora", "Azir", "Bard", "Belveth", "Blitzcrank", "Brand", "Braum", "Briar", "Caitlyn",
  "Camille", "Cassiopeia", "Chogath", "Corki", "Darius", "Diana", "Draven", "DrMundo", "Ekko",
  "Elise", "Evelynn", "Ezreal", "FiddleSticks", "Fiora", "Fizz", "Galio", "Gangplank", "Garen",
  "Gnar", "Gragas", "Graves", "Gwen", "Hecarim", "Heimerdinger", "Hwei", "Illaoi", "Irelia",
  "Ivern", "Janna", "JarvanIV", "Jax", "Jayce", "Jhin", "Jinx", "Kaisa", "Kalista", "Karma",
  "Karthus", "Kassadin", "Katarina", "Kayle", "Kayn", "Kennen", "Khazix", "Kindred", "Kled",
  "KogMaw", "KSante", "Leblanc", "LeeSin", "Leona", "Lillia", "Lissandra", "Lucian", "Lulu",
  "Lux", "Malphite", "Malzahar", "Maokai", "MasterYi","Mel", "Milio", "MissFortune", 
  "Mordekaiser", "Morgana", "Naafiri", "Nami", "Nasus", "Nautilus", "Neeko", "Nidalee", "Nilah",
  "Nocturne", "Nunu", "Olaf", "Orianna", "Ornn", "Pantheon", "Poppy", "Pyke", "Qiyana", "Quinn",
  "Rakan", "Rammus", "RekSai", "Rell", "Renata", "Renekton", "Rengar", "Riven", "Rumble", "Ryze",
  "Samira", "Sejuani", "Senna", "Seraphine", "Sett", "Shaco", "Shen", "Shyvana", "Singed", "Sion",
  "Sivir", "Skarner", "Smolder", "Sona", "Soraka", "Swain", "Sylas", "Syndra", "TahmKench",
  "Taliyah", "Talon", "Taric", "Teemo", "Thresh", "Tristana", "Trundle", "Tryndamere", "TwistedFate",
  "Twitch", "Udyr", "Urgot", "Varus", "Vayne", "Veigar", "Velkoz", "Vex", "Vi", "Viego", "Viktor",
  "Vladimir", "Volibear", "Warwick","MonkeyKing", "Xayah", "Xerath", "XinZhao", "Yasuo", "Yone", "Yorick","Yunara",
  "Yuumi", "Zaahen","Zac", "Zed", "Zeri", "Ziggs", "Zilean", "Zoe", "Zyra"
];

const campeones = campeoneslista.map(nombreId => ({
  nombre: idANombre[nombreId] || nombreId, // nombre amigable o el mismo ID si no está en el mapeo
  id: nombreId,
  img: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${nombreId}_0.jpg`
}));


let indiceCentral = 0;

function indiceCircular(i) {
  const n = campeones.length;
  return ((i % n) + n) % n;
}

// Automatización y reinicio
let timeoutReinicio;
let intervaloRotacion;
let tiempoEspera = 2000;
let tiempoEsperaDespuesInteraccion = 5000;

function iniciarRotacionAutomatica(tiempo) {
  if (intervaloRotacion) clearInterval(intervaloRotacion);
  intervaloRotacion = setInterval(() => {
    indiceCentral = indiceCircular(indiceCentral + 1);
    renderizar();
  }, tiempo);
}

function usuarioInteraccion() {
  clearInterval(intervaloRotacion);
  if (timeoutReinicio) clearTimeout(timeoutReinicio);
  timeoutReinicio = setTimeout(() => {
    iniciarRotacionAutomatica(tiempoEspera);
  }, tiempoEsperaDespuesInteraccion);
}

// Renderiza el carrusel
function renderizar() {
  for (let i = 0; i < cuadros.length; i++) {
    const desplazamiento = i - 3; // pos0 a pos6
    const indiceCampeon = indiceCircular(indiceCentral + desplazamiento);
    const cuadro = cuadros[i];
    cuadro.className = 'cuadro';
    cuadro.classList.add(`pos${i}`);
    const campeon = campeones[indiceCampeon];

    // Usar la imagen de carga del campeón y el nombre
    cuadro.innerHTML = `
      <img src="${campeon.img}" alt="${campeon.nombre}" style="width:100%; height:auto; border-radius:12px;">
      <p style="position:absolute; bottom:10px; width:100%; text-align:center; font-weight:bold; margin:0;">${campeon.nombre}</p>
    `;

    // Evento click: si es el centro (i=3), navega. Si no, lo centra.
    cuadro.onclick = () => {
      if (i === 3) {
        buscarCampeon(campeones[indiceCampeon].nombre);
      } else {
        indiceCentral = indiceCircular(indiceCentral + desplazamiento);
        renderizar();
      }
    };
  }
}

// ==========================================================
// 3. LÓGICA DEL BUSCADOR DE SUGERENCIAS
// ==========================================================

const input = document.getElementById("search");
const sugerenciasDiv = document.getElementById("sugerencias");

// Listener de búsqueda por sugerencia
input.addEventListener("input", () => {
  const texto = input.value.toLowerCase();
  sugerenciasDiv.innerHTML = "";

  if (texto.length === 0) return;
  
  // Filtra los campeones por su nombre amigable
  const resultados = campeones
  .map(c => c.nombre)
  .filter(nombre => nombre.toLowerCase().includes(texto.toLowerCase()))
  .slice(0, 5);

  resultados.forEach(nombre => {
    const div = document.createElement("div");
    div.textContent = nombre;
    div.addEventListener("click", () => {
      input.value = nombre;
      sugerenciasDiv.innerHTML = "";
      buscarCampeon(nombre); // Navega al seleccionar la sugerencia
    });
    sugerenciasDiv.appendChild(div);
  });
});

// Opcional: cerrar sugerencias al hacer clic fuera
document.addEventListener("click", (e) => {
  if (e.target !== input) {
    sugerenciasDiv.innerHTML = "";
  }
});

// ==========================================================
// 4. LISTENERS DE INTERACCIÓN DEL CARRUSEL (Drag, Wheel, Click)
// ==========================================================

// Funciones para rotar (usadas por wheel/drag)
function rotarIzquierda() {
  indiceCentral = indiceCircular(indiceCentral + 1);
  renderizar();
  usuarioInteraccion();
}

function rotarDerecha() {
  indiceCentral = indiceCircular(indiceCentral - 1);
  renderizar();
  usuarioInteraccion();
}

// Listeners de Eventos
document.addEventListener('DOMContentLoaded', () => {
  if (!carrusel) return;

  // 4.1 DRAG/TOUCH SWIPE
  let isDragging = false;
  let startX = 0;
  let currentIndiceCentral = indiceCentral;

  carrusel.style.cursor = 'grab';

  carrusel.addEventListener('pointerdown', (e) => {
    isDragging = true;
    startX = e.clientX;
    currentIndiceCentral = indiceCentral;
    carrusel.style.cursor = 'grabbing';
    e.preventDefault();
  });

  window.addEventListener('pointerup', () => {
    isDragging = false;
    carrusel.style.cursor = 'grab';
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const threshold = 30; // Sensibilidad de arrastre

    if (deltaX > threshold) {
      indiceCentral = indiceCircular(currentIndiceCentral - 1);
      renderizar();
      startX = e.clientX;
      currentIndiceCentral = indiceCentral;
      usuarioInteraccion();
    } else if (deltaX < -threshold) {
      indiceCentral = indiceCircular(currentIndiceCentral + 1);
      renderizar();
      startX = e.clientX;
      currentIndiceCentral = indiceCentral;
      usuarioInteraccion();
    }
  });

  // 4.2 RUEDA DEL MOUSE
  carrusel.addEventListener('wheel', (e) => {
    e.preventDefault();
    const umbral = 10;
    if (e.deltaY < -umbral) {
      rotarIzquierda();
    } else if (e.deltaY > umbral) {
      rotarDerecha();
    }
  }, { passive: false });
});

// ==========================================================
// 5. INICIALIZACIÓN
// ==========================================================

// Carga inicial al cargar el DOM
document.addEventListener('DOMContentLoaded', async () => {
    // Cargar versión y builds (para mapeo y carrusel)
    await getVersion();
    await loadBuilds();

    // Iniciar renderizado y rotación automática
    if (carrusel) {
        renderizar();
        iniciarRotacionAutomatica(tiempoEspera);
    }
});

// Listener para el botón de reseteo/recarga (si existe en index.html)
document.getElementById("resetDePagina")?.addEventListener("click", () => {
  location.reload();
});

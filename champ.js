let builds = {};
let versionActual = "";
let campeonIdGlobal = ""; 
let campeones = []; // Almacenará la lista de campeones para sugerencias

// ==========================================================
// 1. MAPEOS Y UTILIDADES DE NAVEGACIÓN
// ==========================================================
// mapping manual (solo para casos especiales)
const nombreAId = {
  Wukong: "MonkeyKing",
  AurelionSol: "AurelionSol",
  RekSai: "RekSai",
  MasterYi: "MasterYi",
  DrMundo: "DrMundo",
  JarvanIV: "JarvanIV",
  KogMaw: "KogMaw",
  TahmKench: "TahmKench",
  XinZhao: "XinZhao",
  TwistedFate: "TwistedFate",
  MissFortune : "MissFortune",
  LeeSin : "LeeSin",
  KSante : "KSante",
};

// Normalizador universal
function normalizar(str) {
  return str
    .normalize("NFD")                  // elimina acentos
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")               // quita espacios
    .toLowerCase();                    // minúsculas
}

// genera una tabla "normalizada → key real"
const tablaNormalizada = {};
Object.keys(nombreAId).forEach(n => {
  tablaNormalizada[ normalizar(n) ] = nombreAId[n];
});

// función principal
function obtenerIdOficial(nombreUsuario) {
  const key = normalizar(nombreUsuario);
  return tablaNormalizada[key] || nombreUsuario; // fallback
}

// MAPEO INVERSO (ID → nombre amigable)
const idANombre = {};
for (const [nombre, id] of Object.entries(nombreAId)) {
  idANombre[id] = nombre;
}

// Definición completa de inforoles (Necesaria para descripción de roles)
const inforoles = {
  "Mage": { nombre: "Mage", descripcion: "Campeones que infligen daño constante mediante sus habilidades. No siempre deben ser de poder de habilidad (AP), pero su estilo se centra en maximizar el daño de habilidades, aprovechar la reducción de enfriamiento, la gestión de maná y pasivas que proporcionan mayor daño. Suelen posicionarse en la retaguardia para aplicar presión con su DPS de habilidades." },
  "Assassin": { nombre: "Assassin", descripcion: "Campeón de alto burst que busca eliminar rápidamente a los objetivos frágiles, no busca peleas largas ni continuas, busca daño bruto y penetracion de armadura ya sea porcentual o plana ." },
  "Assault": { nombre: "Assault", descripcion: "Campeones centrados en infligir daño sostenido con ataques básicos. Su estilo gira en torno a maximizar el DPS a través de velocidad de ataque, efectos al impacto (on-hit) o críticos(on-attack), aprovechando la presión constante en peleas extendidas." },
  "Tank": { nombre: "Tank", descripcion: "Campeones resistentes cuya función principal es absorber daño y proteger a su equipo. Se enfocan en acumulación de vida, armadura y resistencia mágica, destacando por su capacidad de iniciar peleas, aplicar control de masas y mantenerse en primera línea." },
  "Aegis": { nombre: "Aegis", descripcion: "Campeones que son Tankes y Mages, por lo tanto buscan peleas donde puedan extender tradeos metiendo daño de habilidades continuos con la variable de poder absorber daño." },
  "Spellbade": { nombre: "Spellbade", descripcion: "Campeones que son Assault y Mages, por lo tanto buscan peleas donde puedan extender tradeos metiendo daño de habilidades continuos y daño continuo de basicos" },
  "Berserker": { nombre: "Berserker", descripcion: "Campeones que son Assault y Tank, por lo tanto buscan peleas donde puedan extender tradeos metiendo daño continuo de basicos con la variable de poder absorber daño." },
  "Warlock": { nombre: "Warlock", descripcion: "Campeones que son Assassin y Mages, por lo tanto buscan peleas donde pueda meter un daño explosivo de habilidades, para deletear a un objetivo" },
  "Duelist": { nombre: "Duelist", descripcion: "Campeones que son Assassin y Assault, por lo tanto buscan peleas donde pueda meter un daño explosivo de basicos, para deletear a un objetivo" },
  "Rogue": { nombre: "Rogue", descripcion: "Campeones que son Tank y Assassin, por lo tanto buscan peleas donde puedan meter un daño explosivo, para deletear a un objetivo con la variable de poder absorber daño" },
  "Emberlord": { nombre: "Emberlord", descripcion: "Campeones que son Assault, Tank y Mage, por lo tanto buscan peleas donde puedan extender tradeos metiendo daño continuo de basicos y habilidades con la variable de poder absorber daño." },
  "Arcanist": { nombre: "Arcanist", descripcion: "Campeones que son Assassin, Tank y Mage, por lo tanto buscan peleas donde puedan meter daño explosivo de habilidades con la variable de poder absorber daño." },
  "Revenant": { nombre: "Revenant", descripcion: "Campeones que son Assassin, Tank y Assault, por lo tanto buscan peleas donde puedan meter daño explosivo de basicos con la variable de poder absorber daño." },
  "Duskbane": { nombre: "Duskbane", descripcion: "Campeones que son Assault, Assassin y Mage, por lo tanto buscan peleas donde puedan extender tradeos metiendo daño continuo de basicos y habilidades con la variable de poder meter un burts de daño" },
  "Elite": { nombre: "Elite", descripcion: "Campeones que son Assault, Assassin, Mage y Tank, por lo tanto buscan peleas donde puedan extender tradeos metiendo daño continuo de basicos y habilidades con la variable de poder meter un burts de daño y el poder absorber daño" },
  "Peeler": { "nombre": "Peeler", "descripcion": "Campeones enfocados en proteger a los carries, ofreciendo curaciones, escudos y mejoras. Su estilo de juego gira en torno a mantener con vida a los aliados clave y darles las herramientas para brillar en peleas." },
  "Vanguard": { "nombre": "Vanguard", "descripcion": "Campeones que lideran la carga, absorben daño y aseguran la primera línea. Suelen iniciar peleas, controlar zonas y aportar utilidad defensiva para mantener la cohesión del equipo." },
  "Playmaker": { "nombre": "Playmaker", "descripcion": "Campeones híbridos que combinan la protección de un Peeler con la iniciativa de un Vanguard. Destacan por generar jugadas clave, ya sea salvando a un aliado o iniciando peleas ventajosas para el equipo." }
};


// =======================
//     CARGA DE DATOS
// =======================
async function getVersion() {
  const response = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
  const versiones = await response.json();
  versionActual = versiones[0];
}

async function loadBuilds() {
  try {
    const response = await fetch("builds.json");
    if (!response.ok) throw new Error(`Error loading builds.json: ${response.status}`);
    builds = await response.json();
  } catch (error) {
    console.error("Failed to load builds.json:", error);
    const resultadoDiv = document.getElementById("resultado");
    if (resultadoDiv) {
        resultadoDiv.innerHTML =
            "<p style='text-align:center; color:red;'>⚠️ Error al cargar las builds. Verifica que 'builds.json' esté disponible.</p>";
    }
  }
}

async function cargarCampeones() {
  await getVersion(); // Asegura tener la versión
  const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${versionActual}/data/es_ES/champion.json`);
  const data = await response.json();
  
  const campeoneslista = Object.values(data.data).map(c => c.id); 
  
  // Mapear la lista para incluir nombres amigables si existen
  campeones = campeoneslista.map(nombreId => ({
    nombre: idANombre[nombreId] || nombreId, 
    id: nombreId,
  }));
}

// =======================
//     LÓGICA DEL BUSCADOR (Portado de app.js)
// =======================

// Función principal de búsqueda/navegación
function buscarCampeon(nombreParam) {
  let nombre = nombreParam || document.getElementById("search")?.value?.trim();
  if (!nombre) return;

  nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
  const idOficial = obtenerIdOficial(nombre);

  // Redirige a la misma página con el nuevo campeón
  window.location.href = `champ.html?champ=${idOficial}`;
}

// Inicia listeners del buscador
function iniciarListenersBuscador() {
    const input = document.getElementById("search");
    const sugerenciasDiv = document.getElementById("sugerencias");
    if (!input || !sugerenciasDiv) return;

    input.addEventListener("input", () => {
      const texto = input.value.toLowerCase();
      sugerenciasDiv.innerHTML = "";

      if (texto.length === 0) return;
      
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

    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener("click", (e) => {
      const isSearchWrapper = e.target.closest('.search-wrapper-champ');
      if (!isSearchWrapper) {
        sugerenciasDiv.innerHTML = "";
      }
    });
    
    // Buscar con Enter
    input.addEventListener("keydown", function(event) {                             
      if (event.key === "Enter") {
        event.preventDefault();
        buscarCampeon();
      }
    });
}


// =======================
//     RENDER BOTONES DE ROL
// =======================
function renderBotones(campeonId, roles) {
  const botonesDiv = document.getElementById("botones");
  if (!botonesDiv) return;
  botonesDiv.innerHTML = "";

  roles.forEach((rol, index) => {
    const btn = document.createElement("button");
    btn.textContent = rol.toUpperCase();
    btn.onclick = () => {
      mostrarBuild(campeonId, rol); 
    };
    botonesDiv.appendChild(btn);
  });
}

// =======================
//     FUNCIÓN PRINCIPAL MOSTRAR BUILD (Inyecta todo en #resultado)
// =======================
function mostrarBuild(campeonId, rol, opcionRunasIndex = 0) {
  const campeonBuilds = builds[campeonId];
  if (!campeonBuilds) return;
  
  const build = campeonBuilds[rol]; 
  if (!build) return;

  const resultadoDiv = document.getElementById("resultado");
  if (!resultadoDiv) return;
  
  
  // 1. Control de botón activo (RolesBox)
  document.querySelectorAll("#botones button").forEach(btn => {
      if (btn.textContent === rol.toUpperCase()) {
          btn.classList.add("active");
      } else {
          btn.classList.remove("active");
      }
  });

  // 2. Preparar datos
  const nombreAmigable = idANombre[campeonId] || campeonId;
  const runas = build.opcionesRunas ? build.opcionesRunas[opcionRunasIndex] : build.runas;
  const rolBaseKey = build.rol.split(' ')[0];
  const infoRol = inforoles[rolBaseKey] || { nombre: build.rol, descripcion: "Sin descripción." }; 
  
  // 3. Generar el HTML completo para inyectar en #resultado
  resultadoDiv.innerHTML = `
<div class="card">
    <div class="card-header">
      <img class="champion-icon" 
           src="https://ddragon.leagueoflegends.com/cdn/${versionActual}/img/champion/${campeonId}.png">
      <h2>${nombreAmigable}</h2>
    </div>

    ${build ? `
      <div class="section">
        <h3>Runas</h3>
        ${build.opcionesRunas ? `
          <div class="rune-options">
            ${build.opcionesRunas.map((r, i) => `
              <button class="rune-btn ${i == opcionRunasIndex ? "active" : ""}" 
                      onclick="mostrarBuild('${campeonId}', '${rol}', ${i})">
                ${r.nombre}
              </button>
            `).join("")}
          </div>
        ` : ""}
        <div class="runes-primary">
          ${runas.primario.runas.map(r =>
            `<img src="https://ddragon.leagueoflegends.com/cdn/img/${r.icono}" alt="${r.nombre}">`
          ).join("")}
        </div>
        <div class="runes-secondary">
          ${runas.secundario.runas.map(r =>
            `<img src="https://ddragon.leagueoflegends.com/cdn/img/${r.icono}" alt="${r.nombre}">`
          ).join("")}
        </div>
        <div class="shards">
          ${runas.shards.map(s =>
            `<img src="https://ddragon.leagueoflegends.com/cdn/img/${s.icono}" alt="${s.nombre}">`
          ).join("")}
        </div>
        <div class="spells">
          ${build.spells.map(s =>
            `<img src="https://ddragon.leagueoflegends.com/cdn/${versionActual}/img/${s.icono}" alt="${s.nombre}">`
          ).join("")}
        </div>
      </div>

      <div class="section">
        <h3>Items</h3>
        <div class="items">
          ${build.items.map((id, index) => `
            <img src="https://ddragon.leagueoflegends.com/cdn/${versionActual}/img/item/${id}.png">
            ${index < build.items.length - 1 ? '<span class="arrow">→</span>' : ""}
          `).join("")}
        </div>
        <h3>Items Situacionales</h3>
        <div class="Items_S">
          ${build.Items_S.map(id => 
            `<img src="https://ddragon.leagueoflegends.com/cdn/${versionActual}/img/item/${id}.png">`
          ).join("")}
        </div>
      </div>

      <div class="skills-order-container">
        <h3>Orden de habilidades</h3>
        <div id="skillsOrder"></div>
      </div>
      <!-- 🔹 Info del rol -->
      <div class="section1">
        <h3>Rol: ${inforoles[build.rol]?.nombre || build.rol}</h3>
        <p>${inforoles[build.rol]?.descripcion || "Sin información disponible para este rol."}</p>
      </div>
    ` : `<p>⚠️ No hay build guardada para este campeón</p>`}
  </div>

  <div style="text-align: center; margin-top: 15px;">
    <button class="btn-stats" onclick="window.location.href='stats.html?champ=${campeonId}'">Stats</button>
  </div>
  `;
mostrarSkillsOrder(build.ordenHabilidades);
}

function mostrarSkillsOrder(orden) {
  const contenedor = document.getElementById("skillsOrder");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  orden.forEach((habilidad, index) => {
    contenedor.innerHTML += `
      <div class="skill-item">${habilidad}</div>
    `;

    if(index < orden.length - 1){
      contenedor.innerHTML += `<span class="arrow">></span>`;
    }
  })
}



// =======================
//     INICIO PRINCIPAL DE LA PÁGINA (al cargar champ.html)
// =======================
document.addEventListener('DOMContentLoaded', async () => {
  // Cargar datos
  await getVersion();
  await loadBuilds();
  await cargarCampeones(); // Carga la lista de campeones para el buscador
  
  // Iniciar el buscador
  iniciarListenersBuscador();

  // Obtener campeón de la URL y renderizar
  const params = new URLSearchParams(window.location.search);
  const champID = params.get("champ");
  
  const idOficial = obtenerIdOficial(champID);
  
  if (!idOficial || !builds[idOficial]) {
    const resultadoDiv = document.getElementById("resultado");
    if (resultadoDiv) {
        resultadoDiv.innerHTML =
            "<p style='text-align:center;'>⚠️ Campeón no encontrado o sin builds. Vuelve al inicio.</p>";
    }
    return;
  }
  
  campeonIdGlobal = idOficial;

  const roles = Object.keys(builds[idOficial]);
  
  // 1. Renderiza los botones de rol 
  renderBotones(idOficial, roles);
  
  // 2. Muestra la primera build y activa el botón inicial
  const rolPredeterminado = roles[0];
  mostrarBuild(idOficial, rolPredeterminado);

  
});

document.getElementById("resetDePagina")?.addEventListener("click", () => {
  location.reload();
});

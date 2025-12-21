let builds = {};
let versionActual = "";

// =========================
// OBTENER VERSIÓN DDragon
// =========================
async function getVersion() {
  const res = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
  const data = await res.json();
  versionActual = data[0];
}

// =========================
// CARGAR BUILDS
// =========================
async function loadBuilds() {
  const res = await fetch("builds.json");
  builds = await res.json();
}

// =========================
// FILTRAR CAMPEONES POR ROL PURO
// =========================
function obtenerCampeonesPorRol(rolBuscado) {
  const resultado = [];

  for (const champ in builds) {
    for (const buildKey in builds[champ]) {
      const build = builds[champ][buildKey];

      // SOLO ROL PURO
      if (build.rol === rolBuscado) {
        resultado.push(champ);
      }
    }
  }

  return [...new Set(resultado)];
}

// =========================
// RENDER CAMPEONES
// =========================
function renderCampeones(lista) {
  const contenedor = document.getElementById("listaCampeones");
  contenedor.innerHTML = "";

  if (lista.length === 0) {
    contenedor.innerHTML = "<p>No hay campeones para este rol.</p>";
    return;
  }

  lista.forEach(champ => {
    const card = document.createElement("div");
    card.className = "champ-card";

    card.onclick = () => {
      window.location.href = `champ.html?champ=${champ}`;
    };

    card.innerHTML = `
      <img class="champ-icon"
        src="https://ddragon.leagueoflegends.com/cdn/${versionActual}/img/champion/${champ}.png"
        alt="${champ}">
      <span class="champ-name">${champ}</span>
    `;

    contenedor.appendChild(card);
  });
}

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", async () => {
  await getVersion();
  await loadBuilds();

  const params = new URLSearchParams(window.location.search);
  const rol = params.get("rol");

  const titulo = document.getElementById("tituloRol");

  // TEXTO
  titulo.textContent = `Campeones ${rol}`;

  // CLASE DE COLOR
  const rolClass = rol.toLowerCase(); // Assault → assault
  titulo.className = "titulo";
  titulo.classList.add(rolClass);

  // RENDER
  const campeones = obtenerCampeonesPorRol(rol);
  renderCampeones(campeones);
});



//prueba


let versionActual = "14.17.1";
let builds = {};

async function getVersion() {
  const response = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
  const versiones = await response.json();
  versionActual = versiones[0];
}

async function loadBuilds() {
  const response = await fetch("builds.json"); // leemos el archivo externo
  builds = await response.json();
}

async function buscarCampeon() {
  const nombre = document.getElementById("search").value.toLowerCase();
  const resultados = document.getElementById("resultados");

  await getVersion();
  if (Object.keys(builds).length === 0) {
    await loadBuilds(); // solo cargamos builds si aún no están cargadas
  }

  // Traigo lista de campeones
  const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${versionActual}/data/es_ES/champion.json`);
  const data = await response.json();
  const campeones = Object.values(data.data);

  const campeon = campeones.find(c => c.id.toLowerCase() === nombre);

  if (!campeon) {
    resultados.innerHTML = `<p>⚠️ No se encontró el campeón "${nombre}"</p>`;
    return;
  }

  const build = builds[nombre];

  resultados.innerHTML = `
  <div class="card">
    <div class="card-header">
      <img class="champion-icon" 
           src="https://ddragon.leagueoflegends.com/cdn/${versionActual}/img/champion/${campeon.id}.png">
      <h2>${campeon.name}</h2>
    </div>

    ${build ? `
      <div class="section">
        <h3>Runas</h3>
        <div class="runes-primary">
          ${build.runas.primario.runas.map(r =>
            `<img src="https://ddragon.leagueoflegends.com/cdn/img/${r.icono}" alt="${r.nombre}">`
          ).join("")}
        </div>
        <div class="runes-secondary">
          ${build.runas.secundario.runas.map(r =>
            `<img src="https://ddragon.leagueoflegends.com/cdn/img/${r.icono}" alt="${r.nombre}">`
          ).join("")}
        </div>
        <div class="shards">
          ${build.runas.shards.map(s =>
            `<img src="https://ddragon.leagueoflegends.com/cdn/img/${s.icono}" alt="${s.nombre}">`
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
      </div>
    ` : `<p>⚠️ No hay build guardada para este campeón</p>`}
  </div>
`;
}


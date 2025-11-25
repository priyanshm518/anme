const animeDetails = document.getElementById("animeDetails");
const charactersDiv = document.getElementById("characters");
const episodesDiv = document.getElementById("episodes");
const toggleModeBtn = document.getElementById("toggleMode");
// Dark/Light Mode
toggleModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});
// Get Anime ID from URL
const urlParams = new URLSearchParams(window.location.search);
const animeId = urlParams.get("id");

// Fetch Anime Details
async function fetchAnimeDetails(id) {
  const query = `
  query ($id: Int) {
    Media(id:$id, type:ANIME) {
      id
      title { romaji }
      description(asHtml:false)
      coverImage { large }
      episodes
      siteUrl
      characters { edges { node { name { full } image { medium } } } }
    }
  }`;
  const variables = { id: parseInt(id) };
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables })
  });
  const data = await res.json();
  displayDetails(data.data.Media);
}

function displayDetails(anime) {
  animeDetails.innerHTML = `
    <img src="${anime.coverImage.large}" alt="${anime.title.romaji}">
    <h2>${anime.title.romaji}</h2>
    <p>${anime.description}</p>
  `;
  // Characters
  charactersDiv.innerHTML = "";
  anime.characters.edges.forEach(c => {
    const charCard = document.createElement("div");
    charCard.classList.add("card");
    charCard.innerHTML = `
      <img src="${c.node.image.medium}" alt="${c.node.name.full}">
      <div class="title">${c.node.name.full}</div>
    `;
    charactersDiv.appendChild(charCard);
  });
  // Episodes
  episodesDiv.innerHTML = "";
  const totalEpisodes = anime.episodes || 12;
  for (let i = 1; i <= totalEpisodes; i++) {
    const epCard = document.createElement("div");
    epCard.classList.add("episode-card");
    epCard.innerHTML = `
      <span>Episode ${i}</span>
      <a href="${anime.siteUrl}" target="_blank"><button>Watch Legally</button></a>
    `;
    episodesDiv.appendChild(epCard);
  }
}
fetchAnimeDetails(animeId);

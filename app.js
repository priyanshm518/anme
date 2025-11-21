const animeList = document.getElementById("animeList");
const trendingSlider = document.getElementById("trendingSlider");
const searchInput = document.getElementById("searchInput");
const genreFilter = document.getElementById("genreFilter");
const pagination = document.getElementById("pagination");
const toggleModeBtn = document.getElementById("toggleMode");

let currentPage = 1;
let currentSearch = "";
let currentGenre = "";

// Dark/Light Mode
toggleModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// Fetch Trending
async function fetchTrending() {
  const query = `
  query {
    Page(page:1, perPage:10) {
      media(sort:POPULARITY_DESC, type:ANIME) {
        id
        title { romaji }
        coverImage { medium }
        genres
      }
    }
  }`;
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  displayAnime(data.data.Page.media, trendingSlider, true);
  populateGenres(data.data.Page.media);
}

// Populate Genres
function populateGenres(animeArray) {
  let genresSet = new Set();
  animeArray.forEach(a => a.genres.forEach(g => genresSet.add(g)));
  genresSet.forEach(g => {
    let opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    genreFilter.appendChild(opt);
  });
}

// Fetch Anime
async function fetchAnime(search = "", page = 1, genre = "") {
  animeList.innerHTML = "Loading...";
  const query = `
  query ($search: String, $page: Int, $genre: String) {
    Page(page:$page, perPage:20) {
      media(search:$search, type:ANIME, genre:$genre) {
        id
        title { romaji }
        coverImage { medium }
      }
      pageInfo { total, currentPage, lastPage }
    }
  }`;
  const variables = { search, page, genre };
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables })
  });
  const data = await res.json();
  displayAnime(data.data.Page.media, animeList);
  createPagination(data.data.Page.pageInfo.lastPage);
}

// Display Anime Cards
function displayAnime(animeArray, container, isSlider = false) {
  container.innerHTML = "";
  animeArray.forEach(anime => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <img src="${anime.coverImage.medium}" alt="${anime.title.romaji}">
      <div class="title">${anime.title.romaji}</div>
    `;
    card.addEventListener("click", () => {
      window.location.href = `anime.html?id=${anime.id}`;
    });
    container.appendChild(card);
  });
}

// Pagination
function createPagination(lastPage) {
  pagination.innerHTML = "";
  for (let i = 1; i <= lastPage; i++) {
    const btn = document.createElement("div");
    btn.classList.add("page-btn");
    btn.textContent = i;
    if (i === currentPage) btn.style.background = "#66fcf1";
    btn.addEventListener("click", () => {
      currentPage = i;
      fetchAnime(currentSearch, currentPage, currentGenre);
    });
    pagination.appendChild(btn);
  }
}

// Events
searchInput.addEventListener("input", () => {
  currentSearch = searchInput.value.trim();
  currentPage = 1;
  fetchAnime(currentSearch, currentPage, currentGenre);
});

genreFilter.addEventListener("change", () => {
  currentGenre = genreFilter.value;
  currentPage = 1;
  fetchAnime(currentSearch, currentPage, currentGenre);
});

// Initial Load
fetchTrending();
fetchAnime();

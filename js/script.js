//============================================================
// Globals
//============================================================
const global = {
  currentPage: window.location.pathname.slice(31), // slice the first 31 charachters so that you get the base link
  search: {
    term: "",
    type: "",
    page: 1,
    totalPages: 1,
    totalResults: 0,
  },
  api: {
    apiKey: "7ed33d7488e73ec9c7e8bc670c4c4a5a",
    apiUrl: "https://api.themoviedb.org/3/",
  },
  options: {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3ZWQzM2Q3NDg4ZTczZWM5YzdlOGJjNjcwYzRjNGE1YSIsIm5iZiI6MTc3MTg1NDE2Ni4zNDYsInN1YiI6IjY5OWM1OTU2NDFkZjhlMWUzZTM3NDk1ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.jAwrW-hh-N4XXAFYvDMcqTKEyqwDrlwb_g5bmjpvZ7E",
    },
  },
};

//============================================================
// FETCH FUNCTIONS
//============================================================

// Fetch data from TMDB API
async function fetchAPIData(endpoint, credits = "credits") {
  const API_KEY = global.api.apiKey;
  const API_URL = global.api.apiUrl;

  showSpinner();

  const response = await fetch(
    `${API_URL}${endpoint}?language=en-US&append_to_response=${credits}`,
    global.options,
  );
  const data = await response.json();

  hideSpinner();
  return data;
}

// Make request to search
async function searchApiData() {
  const API_URL = global.api.apiUrl;

  showSpinner();

  const response = await fetch(
    `${API_URL}search/${global.search.type}?language=en-US&query=${global.search.term}&page=${global.search.page}`,
    global.options,
  );

  //   const response = await fetch(`${API_URL}${endpoint}`, global.options);
  const data = await response.json();
  hideSpinner();
  return data;
}

// Search Actors API request
async function searchActorApi() {
  const API_URL = global.api.apiUrl;

  showSpinner();

  const response = await fetch(
    `${API_URL}search/person?language=en-US&query=${global.search.term}&page=${global.search.page}&append_to_response=movie_credits,tv_credits`,
    global.options,
  );
  const data = await response.json();
  hideSpinner();
  return data;
}

// Get Watch providers for movie and show (only in netherlands)
async function getWatchProvider(type, id) {
  const API_URL = global.api.apiUrl;

  const response = await fetch(
    `${API_URL}${type}/${id}/watch/providers`,
    global.options,
  );
  const data = await response.json();

  // check if their are providers
  if (data.results["NL"] === undefined) {
    return null;
  } else if (data.results["NL"].flatrate === undefined) {
    return null;
  } else {
    return data.results["NL"].flatrate;
  }
}

// Display 20 popular Movies
async function displayPopularMovies() {
  const { results } = await fetchAPIData("movie/popular"); // destruct results.results -> { results }
  results.forEach((movie) => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.innerHTML = `
          <a href="movie-details.html?id=${movie.id}">
            ${
              movie.poster_path
                ? `            
                <img
                src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
                class="card-img-top"
                alt="${movie.title}"
                />`
                : `
                <img
                src="images/no-image.jpg"
                class="card-img-top"
                alt="${movie.title}"
                />`
            }
          </a>
          <div class="card-body">
            <h5 class="card-title">${movie.title}</h5>
            <p class="card-text">
              <small class="text-muted">Release: ${movie.release_date}</small>
            </p>
          </div>
          `;

    document.querySelector("#popular-movies").appendChild(div);
  });
}

// Display 20 popular TV Shows
async function displayPopularSeries() {
  const { results } = await fetchAPIData("tv/popular");
  results.forEach((show) => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.innerHTML = `
          <a href="tv-details.html?id=${show.id}">
            ${
              show.poster_path
                ? `            
                <img
                src="https://image.tmdb.org/t/p/w500${show.poster_path}"
                class="card-img-top"
                alt="${show.name}"
                />`
                : `
                <img
                src="images/no-image.jpg"
                class="card-img-top"
                alt="${show.name}"
                />`
            }
          </a>
          <div class="card-body">
            <h5 class="card-title">${show.name}</h5>
            <p class="card-text">
              <small class="text-muted">First Aired: ${show.first_air_date}</small>
            </p>
          </div>
        `;
    document.querySelector("#popular-shows").appendChild(div);
  });
}

// Display movie details
async function displayMovieDetails() {
  const movieId = window.location.search.split("=")[1]; // split the string on = and only get the id
  const movie = await fetchAPIData(`movie/${movieId}`);

  const providers = await getWatchProvider("movie", movie.id);

  // Overlay for background image
  displayBackgroundImage("movie", movie.backdrop_path);
  const div = document.createElement("div");
  div.innerHTML = `
    <div class="details-top">
        <div>
        ${
          movie.poster_path
            ? `            
            <img
            src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
            class="card-img-top"
            alt="${movie.title}"
            />`
            : `
            <img
            src="images/no-image.jpg"
            class="card-img-top"
            alt="${movie.title}"
            />`
        }
        </div>
        <div>
        <h2>${movie.title}</h2>
        <p>
            <i class="fas fa-star text-primary"></i>
            ${movie.vote_average.toFixed(1)} / 10
        </p>
        <p class="text-muted">${movie.release_date}</p>
        <p>
        ${movie.overview}
        </p>
        <h5>Genres</h5>
        <ul class="list-group">
            ${movie.genres.map((genre) => `<li> ${genre.name}</>`).join("")}
        </ul>
        <a href="${movie.homepage}" target="_blank" class="btn">Visit Movie Homepage</a>
        </div>
    </div>
    <div class="details-bottom">
        <h2>Movie Info</h2>
        <ul>
        <li><span class="text-secondary">Budget:</span> $${addCommasToNumber(movie.budget)}</li>
        <li><span class="text-secondary">Revenue:</span> $${addCommasToNumber(movie.revenue)}</li>
        <li><span class="text-secondary">Runtime:</span> ${movie.runtime} minutes</li>
        <li><span class="text-secondary">Status:</span> ${movie.status}</li>

            ${
              providers
                ? `
              <li>
              <span class="text-secondary"></span>
                <div class="watch-on-list">
                ${providers
                  .map(
                    (provider) => `
                    <a href="https://www.${provider.provider_name.replaceAll(" ", "")}.com" class="provider-link" target="_blank">
                    <div class="provider-card">
                        <img src="https://image.tmdb.org/t/p/w200${provider.logo_path}" 
                            alt="${provider.provider_name}" 
                            class="provider-logo" />
                        <span class="provider-name">${provider.provider_name}</span>
                    </div>
                    </a>
                `,
                  )
                  .join("")}
                </div>
              </li>`
                : ``
            }

        </ul>

    <h4>Cast</h4>
    <div class="cast-grid">
    ${movie.credits.cast
      .slice(0, 10)
      .map(
        (cast) => `
        <div class="cast-card">
            <a href="actor-detail.html?id=${cast.id}">
            <img src="${
              cast.profile_path
                ? `https://image.tmdb.org/t/p/w500${cast.profile_path}`
                : "images/no-image.jpg"
            }" alt="${cast.name}" />
            </a>
            <p class="cast-name">${cast.name}</p>
            <p class="cast-character">${cast.character}</p>
        </div>
    `,
      )
      .join("")}

    </div>
    </div>
        <br>
        <h4>Production Companies</h4>
        <div class="list-group">${movie.production_companies.map((company) => ` <span>${company.name}</>`)}</div>
    </div>

  `;

  document.querySelector("#movie-details").appendChild(div);
}

// Display TV details
async function displayTvDetails() {
  const tvId = window.location.search.split("=")[1]; // split the string on = and only get the id
  const show = await fetchAPIData(`tv/${tvId}`);

  const providers = await getWatchProvider("tv", show.id);

  // Overlay for background image
  displayBackgroundImage("tv", show.backdrop_path);

  const div = document.createElement("div");
  div.innerHTML = `
              <div id="show-details">
        <div class="details-top">
          <div>
            ${
              show.poster_path
                ? `            
                <img
                src="https://image.tmdb.org/t/p/w500${show.poster_path}"
                class="card-img-top"
                alt="${show.name}"
                />`
                : `
                <img
                src="images/no-image.jpg"
                class="card-img-top"
                alt="${show.name}"
                />`
            }
          </div>
          <div>
            <h2>${show.name}</h2>
            <p>
              <i class="fas fa-star text-primary"></i>
              ${show.vote_average.toFixed(1)} / 10
            </p>
            <p class="text-muted">First Aired: ${show.first_air_date}</p>
            <p>
            ${show.overview}
            </p>
            <h5>Genres</h5>
            <ul class="list-group">
            ${show.genres.map((genre) => `<li> ${genre.name}</>`).join("")}
            </ul>
            <a href="${show.homepage}" target="_blank" class="btn">Visit Show Homepage</a>
          </div>
        </div>
        <div class="details-bottom">
          <h2>Show Info</h2>
          <ul>
            <li><span class="text-secondary">Number Of Episodes:</span> ${show.number_of_episodes}</li>
            <li>
              <span class="text-secondary">Last Episode To Air:</span> ${show.last_episode_to_air.name}
            </li>
            <li><span class="text-secondary">Status:</span> ${show.status}</li>

            <li>
            <span class="text-secondary"></span>
            <div class="watch-on-list">
            ${providers
              .map(
                (provider) => `
                <a href="https://www.${provider.provider_name.replaceAll(" ", "")}.com" class="provider-link" target="_blank">
                <div class="provider-card">
                    <img src="https://image.tmdb.org/t/p/w200${provider.logo_path}" 
                        alt="${provider.provider_name}" 
                        class="provider-logo" />
                    <span class="provider-name">${provider.provider_name}</span>
                </div>
                </a>
            `,
              )
              .join("")}
            </div>
        </li>
          </ul>


        <div class="cast-grid">
        ${show.credits.cast
          .slice(0, 10)
          .map(
            (cast) => `
            <div class="cast-card">
                <a href="actor-detail.html?id=${cast.id}">
                <img src="${
                  cast.profile_path
                    ? `https://image.tmdb.org/t/p/w500${cast.profile_path}`
                    : "images/no-image.jpg"
                }" 
                    alt="${cast.name}"/>
                </a>
                <p class="cast-name">${cast.name}</p>
                <p class="cast-character">${cast.character}</p>
            </div>
        `,
          )
          .join("")}
        </div>
            <br>
          <h4>Production Companies</h4>
          <div class="list-group">${show.production_companies.map((company) => ` <span>${company.name}</>`)}</div>
        </div>
      </div>
  `;

  document.querySelector("#show-details").appendChild(div);
}

// Display Slider movies
async function displayMovieSlider() {
  const { results } = await fetchAPIData("movie/now_playing");

  results.forEach((movie) => {
    const div = document.createElement("div");
    div.classList.add("swiper-slide");
    div.innerHTML = `
            <a href="movie-details.html?id=${movie.id}">
              <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
            </a>
            <h4 class="${movie.title}">
              <i class="fas fa-star text-secondary"></i> ${movie.vote_average.toFixed(1)} / 10
            </h4>`;

    document.querySelector(".swiper-wrapper").appendChild(div);

    initSwiper();
  });
}

async function search(type) {
  const queryString = window.location.search;
  const urlParam = new URLSearchParams(queryString);

  //   global.search.type = type;
  global.search.type = urlParam.get("type");
  if (type === "person") {
    global.search.type = "person";
    global.search.term = urlParam.get("actor-search-term");
  } else {
    global.search.term = urlParam.get("search-term");
  }

  if (!global.search.term) {
    if (type === "person") {
      showAlert("Please fill in search term", "error", "actor-alert");
    } else {
      showAlert("Please fill in search term", "error", "alert");
    }
    return;
  }

  showSpinner();

  if (type === "person") {
    const { results, total_pages, page, total_results } =
      await searchActorApi();
    global.search.page = page;
    global.search.totalPages = total_pages;
    global.search.totalResults = total_results;

    if (results.length === 0) {
      if (type === "person") {
        showAlert(
          `No results found for "${global.search.term}"`,
          "error",
          "actor-alert",
        );
      } else {
        showAlert(
          `No results found for "${global.search.term}"`,
          "error",
          "alert",
        );
      }
      return;
    }
    displayActorResults(results);

    document.querySelector("#actor-search-term").value = ""; // clear input field
  } else {
    const { results, total_pages, page, total_results } = await searchApiData();
    global.search.page = page;
    global.search.totalPages = total_pages;
    global.search.totalResults = total_results;

    if (results.length === 0) {
      if (type === "person") {
        showAlert(
          `No results found for "${global.search.term}"`,
          "error",
          "actor-alert",
        );
      } else {
        showAlert(
          `No results found for "${global.search.term}"`,
          "error",
          "alert",
        );
      }
      return;
    }
    displaySearchResults(results);
    document.querySelector("#search-term").value = ""; // clear input field
  }
}

// Get Popular actors
async function displayPopularActor() {
  const { results } = await fetchAPIData("/person/popular"); // destruct results.results -> { results }

  results.forEach((actor) => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.innerHTML = `
        <div class="card">
        <a href="actor-detail.html?id=${actor.id}">
            ${
              actor.profile_path
                ? `            
                <img
                src="https://image.tmdb.org/t/p/w500${actor.profile_path}"
                class="card-img-top"
                alt="${actor.name}"
                />`
                : `
                <img
                src="images/no-image.jpg"
                class="card-img-top"
                alt="${actor.name}"
                />`
            }
        </a>
            <div class="card-body">
            <h5 class="actor-name">${actor.name}</h5>
            <p class="actor-known-for">
                <b>Known For:</b> ${actor.known_for
                  .map((item) => item.title || item.name)
                  .slice(0, 2)
                  .join(", ")}
            </p>
            </div>
            `;

    document.querySelector("#popular-actors").appendChild(div);
  });
}

async function displayActorDetails() {
  // get the actor info
  const actorId = window.location.search.split("=")[1];
  const actor = await fetchAPIData(`/person/${actorId}`, "combined_credits");
  const allCredits = actor.combined_credits.cast;

  // Split movies and tv shows
  const movies = allCredits.filter((c) => c.media_type === "movie");
  const tv = allCredits.filter((c) => c.media_type === "tv");

  // Overlay for background image
  displayBackgroundImage("actor", movies[0].backdrop_path);
  const div = document.createElement("div");
  div.innerHTML = div.innerHTML = `
    <div class="details-top">
        <div>
        ${
          actor.profile_path
            ? `            
            <img
            src="https://image.tmdb.org/t/p/w500${actor.profile_path}"
            class="card-img-top"
            alt="${actor.name}"
            />`
            : `
            <img
            src="images/no-image.jpg"
            class="card-img-top"
            alt="${actor.name}"
            />`
        }
        </div>
        <div>
        <h2>${actor.name}</h2>
        <p>
        <h4>Popularity</h5>
            <i class="fas fa-star text-primary"></i>
            ${actor.popularity.toFixed(1)} / 100
        </p>
        <h4>Biography</h4>
        <p class="biography collapsed">
        ${actor.biography}
        </p>
        <button class="bio-toggle">Read More</button>
        <br>
        <br>
        <h5>Profession</h5>
        <ul class="cast-character">
            ${actor.known_for_department}
        </ul>
        ${actor.homepage ? `<a href="${actor.homepage}" target="_blank" class="btn">Visit Actors Homepage</a>` : ``}

        </div>
    </div>
    <div class="details-bottom">
        <h2>Actor Info</h2>
        <ul>
        <li><span class="text-secondary">Birthday:</span> ${actor.birthday}</li>
        <li><span class="text-secondary">Place of Birth:</span> ${actor.place_of_birth} </li>
        ${actor.deathday ? `<li><span class="text-secondary">Passed Away: </span> ${actor.deathday}</li>` : ``}
        </ul>
    <h2>Filmography</h2>
      <h3 >Movies</h3>
      <div class="cast-grid" id="movies-grid"></div>
      <br>

      <h3>TV Shows:</h3>
      <div class="cast-grid" id="tv-grid"></div>
    
    </div>
  `;

  // append div to the actor details page
  document.querySelector("#actor-details").appendChild(div);

  // populate the movie and tv grids
  populateMovieGrid(movies);
  populateShowGrid(tv);

  // Biography toggle button
  const toggleBtn = document.querySelector(".bio-toggle");
  const bio = document.querySelector(".biography");

  toggleBtn.addEventListener("click", () => {
    bio.classList.toggle("collapsed");

    toggleBtn.textContent = bio.classList.contains("collapsed")
      ? "Read More"
      : "Read Less";
  });

  // get the movies where they are known for
}

//============================================================
// Element Functions
//============================================================

// Highlight active Link
function highlightActiveLink() {
  const navLink = document.querySelectorAll(".nav-link");
  navLink.forEach((link) => {
    if (link.getAttribute("href") === global.currentPage) {
      link.classList.add("active");
    }
  });
}

function showSpinner() {
  document.querySelector(".spinner").classList.add("show");
}

function hideSpinner() {
  document.querySelector(".spinner").classList.remove("show");
}

function addCommasToNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Display Backdrop on details pages
function displayBackgroundImage(type, backgroundPath) {
  const overlayDiv = document.createElement("div");
  overlayDiv.style.background = `url(https://image.tmdb.org/t/p/original/${backgroundPath})`;
  overlayDiv.style.backgroundSize = "cover";
  overlayDiv.style.backgroundPosition = "center";
  overlayDiv.style.backgroundRepeat = "no-repeat";
  overlayDiv.style.height = "100vh";
  overlayDiv.style.width = "100vw";
  overlayDiv.style.position = "absolute";
  overlayDiv.style.top = "0";
  overlayDiv.style.left = "0";
  overlayDiv.style.zIndex = "-1";
  overlayDiv.style.opacity = "0.1";

  if (type === "movie") {
    document.querySelector("#movie-details").appendChild(overlayDiv);
  } else if (type === "tv") {
    document.querySelector("#show-details").appendChild(overlayDiv);
  } else if (type === "actor") {
    document.querySelector("#actor-details").appendChild(overlayDiv);
  }
}

function initSwiper() {
  const swiper = new Swiper(".swiper", {
    slidesPerView: 1,
    spaceBetween: 30,
    freeMode: true,
    loop: true,
    autoplay: {
      delay: 2000,
      disableOnInteraction: false,
    },
    breakpoints: {
      500: {
        slidesPerView: 2,
      },
      700: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 4,
      },
    },
  });
}

// Show Alert
function showAlert(message, classname = "error", containerId = "alert") {
  const container = document.querySelector(`#${containerId}`);
  if (!container) return; // stop silently if container doesn't exist
  const alertEl = document.createElement("div");
  alertEl.classList.add("alert", classname);
  alertEl.appendChild(document.createTextNode(message));
  container.appendChild(alertEl);
  setTimeout(() => alertEl.remove(), 2000);
}

function displaySearchResults(results) {
  // Clear previous results
  document.querySelector("#search-results").innerHTML = "";
  document.querySelector("#search-results-heading").innerHTML = "";
  document.querySelector("#pagination").innerHTML = "";
  document.querySelector("#search-heading-pagination").innerHTML = "";

  results.forEach((result) => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.innerHTML = `
    
        <div class="card">
          <a href="${global.search.type}-details.html?id=${result.id}">
            ${
              result.poster_path
                ? `            
                <img
                src="https://image.tmdb.org/t/p/w500${result.poster_path}"
                class="card-img-top"
                alt=" ${
                  global.search.type === "movie"
                    ? `${result.title}`
                    : `${result.name} `
                }"
                />`
                : `
                <img
                src="images/no-image.jpg"
                class="card-img-top"
                alt="${
                  global.search.type === "movie"
                    ? `${result.title}`
                    : `${result.name} `
                }"
                />`
            }
          </a>
          <div class="card-body">
            <h5 class="card-title">${
              global.search.type === "movie"
                ? `${result.title}`
                : `${result.name} `
            }</h5>
            <p class="card-text">
              <small class="text-muted">
              ${
                global.search.type === "movie"
                  ? `Released: ${result.release_date}`
                  : `First Aired: ${result.first_air_date} `
              }
              </small>
            </p>
          </div>
        </div>`;

    document.querySelector("#search-results-heading").innerHTML =
      ` <h2>${results.length} of ${global.search.totalResults} Results for ${global.search.term}</h2>`;
    document.querySelector("#search-results").appendChild(div);
  });

  // For movies
  displayPagination("pagination", async () => {
    const { results } = await searchApiData();
    displaySearchResults(results);
  });
}

function displayActorResults(results) {
  // Clear previous results
  document.querySelector("#actor-search-results").innerHTML = "";
  document.querySelector("#actor-search-results-heading").innerHTML = "";
  document.querySelector("#actor-pagination").innerHTML = "";
  document.querySelector("#actor-search-heading-pagination").innerHTML = "";
  results.forEach((actor) => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.innerHTML = `
        <div class="card">
        <a href="actor-detail.html?id=${actor.id}">
            ${
              actor.profile_path
                ? `            
                <img
                src="https://image.tmdb.org/t/p/w500${actor.profile_path}"
                class="card-img-top"
                alt="${actor.name}"
                />`
                : `
                <img
                src="images/no-image.jpg"
                class="card-img-top"
                alt="${actor.name}"
                />`
            }
        </a>
            <div class="card-body">
            <h5 class="actor-name">${actor.name}</h5>
            </div>
            `;

    document.querySelector("#actor-search-results-heading").innerHTML =
      ` <h2>${results.length} of ${global.search.totalResults} Results for ${global.search.term}</h2>`;
    document.querySelector("#actor-search-results").appendChild(div);
  });

  displayPagination("actor-pagination", async () => {
    const { results } = await searchActorApi();
    displayActorResults(results);
  });
}
// Create & Display pagination for search
function displayPagination(divId) {
  const container = document.querySelector(`#${divId}`);
  container.innerHTML = ""; // clear old pagination
  const div = document.createElement("div");
  div.classList.add("pagination");
  div.innerHTML = `
  <button class="btn btn-primary" id="prev">Prev</button>
          <button class="btn btn-primary" id="next">Next</button>
          <div class="page-counter">Page ${global.search.page} of ${global.search.totalPages}</div>
  `;

  document.querySelector(`#${divId}`).appendChild(div);

  // Disable prev button if on first page
  if (global.search.page === 1) {
    document.querySelector("#prev").disabled = true;
  }

  // Disable next button if on last page
  if (global.search.page === global.search.totalPages) {
    document.querySelector("#next").disabled = true;
  }

  // Next page
  document.querySelector("#next").addEventListener("click", async () => {
    global.search.page++;
    let data;
    if (global.search.type === "person") {
      data = await searchActorApi();
      displayActorResults(data.results);
    } else {
      data = await searchApiData();
      displaySearchResults(data.results);
    }
  });

  // Previous page
  document.querySelector("#prev").addEventListener("click", async () => {
    global.search.page--;
    let data;
    if (global.search.type === "person") {
      data = await searchActorApi();
      displayActorResults(data.results);
    } else {
      data = await searchApiData();
      displaySearchResults(data.results);
    }
  });
}

// Populate actor movies grid
function populateMovieGrid(movies) {
  const movieGrid = document.getElementById("movies-grid");

  // Sort movies alphabetically by title
  const sortedMovies = movies.slice().sort((a, b) => {
    return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
  });

  sortedMovies.forEach((movie) => {
    const div = document.createElement("div");
    div.classList.add("cast-card");
    div.innerHTML = `
      <a href="movie-details.html?id=${movie.id}">
        <img src="${movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "images/no-image.jpg"}" alt="${movie.title}" />
      </a>
      <p class="cast-character">${movie.title}</p>
    `;
    movieGrid.appendChild(div);
  });
}

// Populate actor Tv Shows grid
function populateShowGrid(shows) {
  const showGrid = document.getElementById("tv-grid");
  // Sort movies alphabetically by title
  const sortedShows = shows.slice().sort((a, b) => {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });

  sortedShows.forEach((show) => {
    const div = document.createElement("div");
    div.classList.add("cast-card");
    div.innerHTML = `
      <a href="tv-details.html?id=${show.id}">
        <img src="${show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : "images/no-image.jpg"}" alt="${show.title}" />
      </a>
      <p class="cast-character">${show.name}</p>
    `;
    showGrid.appendChild(div);
  });
}

//============================================================
// Init App
//============================================================
function init() {
  switch (global.currentPage) {
    case "index.html":
      displayPopularMovies();
      displayMovieSlider();
      break;
    case "shows.html":
      displayPopularSeries();
      break;

    case "movie-details.html":
      displayMovieDetails();
      break;

    case "tv-details.html":
      displayTvDetails();
      break;

    case "search.html":
      search(global.search.type);
      break;
    case "actors.html":
      displayPopularActor();
      break;

    case "actor-detail.html":
      displayActorDetails();
      break;

    case "search-actor.html":
      search("person");

      break;
  }

  highlightActiveLink();
}

init();

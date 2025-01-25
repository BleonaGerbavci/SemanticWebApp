const endpointURL = 'http://localhost:3030/moviesDataset/query';

async function fetchAllMovies() {
  const sparqlQuery = `
    PREFIX mo: <http://www.movieontology.org/>
    SELECT DISTINCT 
      (STRAFTER(STR(?movie), "http://www.movieontology.org/") AS ?movieLabel)
      (STRAFTER(STR(?genre), "http://www.movieontology.org/") AS ?genreLabel)
    WHERE {
      ?movie mo:belongsToGenre ?genre .
    }
    ORDER BY ?movieLabel
  `;

  const params = new URLSearchParams();
  params.append("query", sparqlQuery);
  params.append("format", "application/json");

  try {
    const response = await fetch(endpointURL + "?" + params.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`SPARQL query failed with status ${response.status}`);
    }

    const data = await response.json();

    // Group movies by title, merging genres
    const movieMap = new Map();
    data.results.bindings.forEach((binding) => {
      const movieLabel = binding.movieLabel.value;
      const genreLabel = binding.genreLabel.value;

      if (!movieMap.has(movieLabel)) {
        movieMap.set(movieLabel, { movieLabel, genres: [genreLabel] });
      } else {
        movieMap.get(movieLabel).genres.push(genreLabel);
      }
    });

    // Convert map to array and format genres as a comma-separated string
    return Array.from(movieMap.values()).map((movie) => ({
      movieLabel: movie.movieLabel,
      genres: movie.genres.join(", "),
    }));
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
}


// Function to fetch movies filtered by name
async function fetchMoviesByName(movieName) {
  const sparqlQuery = `
    PREFIX mo: <http://www.movieontology.org/>
    SELECT DISTINCT 
      (STRAFTER(STR(?movie), "http://www.movieontology.org/") AS ?movieLabel)
      (STRAFTER(STR(?genre), "http://www.movieontology.org/") AS ?genreLabel)
    WHERE {
      ?movie mo:hasTitle ?title .
      ?movie mo:belongsToGenre ?genre .
      FILTER regex(STR(?title), "${movieName}", "i")
    }
    ORDER BY ?movieLabel
  `;

  const params = new URLSearchParams();
  params.append('query', sparqlQuery);
  params.append('format', 'application/json');

  try {
    const response = await fetch(endpointURL + '?' + params.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`SPARQL query failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.results.bindings.map(binding => ({
      movieLabel: binding.movieLabel.value,
      genre: binding.genreLabel.value,
    }));
  } catch (error) {
    console.error('Error fetching movies by name:', error);
    return [];
  }
}

// Display movies in the list
function displayMovies(movies) {
  const movieList = document.getElementById("movieResults");
  const loadingIndicator = document.getElementById("loadingIndicator");
  movieList.innerHTML = ""; // Clear existing content
  loadingIndicator.style.display = "none"; // Hide loading indicator

  movies.forEach((movie) => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.innerHTML = `
      <h3>${movie.movieLabel}</h3>
      <p>Genre: ${movie.genres}</p>
    `;

    // Attach event listener for modal
    card.addEventListener("click", async () => {
      const details = await fetchMovieDetails(movie.movieLabel); // Pass ontology individual
      if (details) {
        showMovieDetails(details);
      } else {
        console.error(`No details found for ${movie.movieLabel}`);
      }
    });

    movieList.appendChild(card);
  });
}


async function fetchMovieDetails(movieLabel) {
  const cleanedMovieLabel = movieLabel.trim();

  const sparqlQuery = `
    PREFIX mo: <http://www.movieontology.org/>
    SELECT DISTINCT
      ?title ?releaseDate ?runtime ?genre ?directorName ?producer ?reviewer ?rating ?festival
    WHERE {
      ?movie mo:hasTitle ?title .
      FILTER regex(STR(?movie), "${cleanedMovieLabel}", "i") .
      OPTIONAL { ?movie mo:hasReleaseDate ?releaseDate . }
      OPTIONAL { ?movie mo:hasRuntime ?runtime . }
      OPTIONAL { ?movie mo:belongsToGenre ?genre . }
      OPTIONAL {
        ?movie mo:hasDirector ?director .
        ?director mo:hasName ?directorName .
      }
      OPTIONAL { ?movie mo:producedBy ?producer . }
      OPTIONAL { ?movie mo:reviewedBy ?reviewer . }
      OPTIONAL { ?movie mo:hasRatingValue ?rating . }
      OPTIONAL { ?movie mo:screenedAt ?festival . }
    }
    LIMIT 1
  `;

  const params = new URLSearchParams();
  params.append("query", sparqlQuery);
  params.append("format", "application/json");

  try {
    const response = await fetch(endpointURL + "?" + params.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`SPARQL query failed with status ${response.status}`);
    }

    const data = await response.json();
    if (data.results.bindings.length > 0) {
      const details = data.results.bindings[0];
      return {
        title: details.title?.value || "Unknown",
        releaseDate: details.releaseDate?.value || "Unknown",
        runtime: details.runtime?.value ? parseFloat(details.runtime.value).toString() : "Unknown",
        genre: details.genre?.value.split("/").pop() || "Unknown",
        directorName: details.directorName?.value || "Unknown",
        producer: details.producer?.value.split("/").pop() || "Unknown",
        reviewer: details.reviewer?.value.split("/").pop() || "Unknown",
        rating: details.rating?.value || "Unknown",
        festival: details.festival?.value.split("/").pop() || "Unknown",
      };
    }
  } catch (error) {
    console.error("Error fetching movie details:", error);
  }
  return null;
}



function showMovieDetails(details) {
  const modal = document.getElementById("movieModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDetails = document.getElementById("modalDetails");

  modalTitle.textContent = details.title;
  modalDetails.innerHTML = `
    <p><strong>Release Date:</strong> ${details.releaseDate}</p>
    <p><strong>Runtime:</strong> ${details.runtime} minutes</p>
    <p><strong>Genre:</strong> ${details.genre}</p>
    <p><strong>Director:</strong> ${details.directorName}</p>
    <p><strong>Producer:</strong> ${details.producer}</p>
    <p><strong>Reviewer:</strong> ${details.reviewer}</p>
    <p><strong>Rating:</strong> ${details.rating}</p>
    <p><strong>Screened At:</strong> ${details.festival}</p>
  `;

  modal.style.display = "flex";
}



// Search button event listener
document.getElementById('searchButton').addEventListener('click', async () => {
  const movieInput = document.getElementById('movieInput').value.trim();
  const loadingIndicator = document.getElementById('loadingIndicator');

  loadingIndicator.style.display = 'block'; // Show loading indicator

  if (movieInput) {
    const movies = await fetchMoviesByName(movieInput);
    displayMovies(movies);
  } else {
    // If no movie name is entered, load all movies
    const movies = await fetchAllMovies();
    displayMovies(movies);
  }
});

// Close modal functionality
document.querySelector('.close-btn').addEventListener('click', () => {
  const modal = document.getElementById('movieModal');
  modal.style.display = 'none';
});

// Click outside modal to close
window.onclick = function(event) {
  const modal = document.getElementById('movieModal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};

function displayStars(stars) {
  const starsList = document.getElementById('starsResults');
  starsList.innerHTML = ''; // Clear existing content

  // Filter out duplicates
  const uniqueStars = stars.filter((star, index, self) => 
    index === self.findIndex((s) => s.personLabel === star.personLabel)
  );

  if (uniqueStars.length === 0) {
    starsList.innerHTML = `<p>No stars found.</p>`;
    return;
  }

  uniqueStars.forEach(star => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <strong>${star.personLabel}</strong> - ${star.roleLabel} <br>
      Name: ${star.name} <br>
      Nationality: ${star.nationality}
    `;
    starsList.appendChild(listItem);
  });
}



// Load all movies by default when the page loads
window.addEventListener("DOMContentLoaded", async () => {
  const loadingIndicator = document.getElementById("loadingIndicator");
  loadingIndicator.style.display = "block";

  const movies = await fetchAllMovies();
  displayMovies(movies);
});

// Function to fetch all genres as instances of the Genre class
async function fetchAllGenres() {
  const sparqlQuery = `
    PREFIX mo: <http://www.movieontology.org/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT DISTINCT (STRAFTER(STR(?genre), "http://www.movieontology.org/") AS ?genreLabel)
    WHERE {
        ?genre rdf:type mo:Genre .
    }
    ORDER BY ?genreLabel
  `;

  const params = new URLSearchParams();
  params.append('query', sparqlQuery);
  params.append('format', 'application/json');

  try {
    const response = await fetch(endpointURL + '?' + params.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`SPARQL query failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.results.bindings.map(binding => binding.genreLabel.value);
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
}

// Function to display genres in a modal
async function showGenresModal() {
  const genreList = document.getElementById('genreList');
  genreList.innerHTML = ''; // Clear existing content

  const genres = await fetchAllGenres();
  genres.forEach(genre => {
    const listItem = document.createElement('li');
    listItem.textContent = genre; // Display the clean label
    listItem.addEventListener('click', () => {
      window.location.href = `genre.html?genre=${encodeURIComponent(genre)}`;
    });
    genreList.appendChild(listItem);
  });

  // Show the modal
  const genreModal = document.getElementById('genreModal');
  genreModal.style.display = 'flex';

}

async function fetchMoviesByGenre(genre) {
  const sparqlQuery = `
      PREFIX mo: <http://www.movieontology.org/>
      SELECT DISTINCT (STRAFTER(STR(?movie), "http://www.movieontology.org/") AS ?movieLabel)
      WHERE {
          ?movie mo:belongsToGenre ?genre .
          FILTER regex(str(?genre), "${genre}", "i")
      }
      ORDER BY ?movieLabel
  `;

  const params = new URLSearchParams();
  params.append('query', sparqlQuery);
  params.append('format', 'application/json');

  try {
      const response = await fetch(endpointURL + '?' + params.toString(), {
          method: 'GET',
          headers: {
              'Accept': 'application/json',
          },
      });

      if (!response.ok) {
          throw new Error(`SPARQL query failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.results.bindings.map(binding => binding.movieLabel.value);
  } catch (error) {
      console.error('Error fetching movies by genre:', error);
      return [];
  }
}


// Close the modal
document.getElementById('closeGenreModal').addEventListener('click', () => {
  document.getElementById('genreModal').style.display = 'none';
});

// Trigger the genres modal on card click
document.getElementById('discoverGenres').addEventListener('click', showGenresModal);

async function fetchAllStars() {
  const sparqlQuery = `
    PREFIX mo: <http://www.movieontology.org/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT DISTINCT 
      (STRAFTER(STR(?person), "http://www.movieontology.org/") AS ?personLabel)
      ?roleLabel
      ?name
      ?nationality
    WHERE {
      {
        ?person rdf:type mo:Actor .
        ?person mo:hasName ?name .
        OPTIONAL { ?person mo:hasNationality ?nationality . }
        BIND("Actor" AS ?roleLabel)
      }
      UNION
      {
        ?person rdf:type mo:Director .
        ?person mo:hasName ?name .
        OPTIONAL { ?person mo:hasNationality ?nationality . }
        BIND("Director" AS ?roleLabel)
      }
    }
    ORDER BY ?personLabel
  `;

  const params = new URLSearchParams();
  params.append('query', sparqlQuery);
  params.append('format', 'application/json');

  try {
    const response = await fetch(endpointURL + '?' + params.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`SPARQL query failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.results.bindings.map(binding => ({
      personLabel: binding.personLabel.value,
      roleLabel: binding.roleLabel.value,
      name: binding.name ? binding.name.value : 'Not available',
      nationality: binding.nationality ? binding.nationality.value : 'Not available',
    }));
  } catch (error) {
    console.error('Error fetching stars:', error);
    return [];
  }
}


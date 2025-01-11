fetch('glossaire.json')
  .then(response => response.json()) // Convertit la réponse en JSON
  .then(data => {
	console.log(data); // Affiche les données pour vérifier la structure

	if (!Array.isArray(data)) {
	  console.error('Les données ne sont pas un tableau.');
	  return;
	}

	// Trier les données par ordre alphabétique
	data.sort((a, b) => a.term.localeCompare(b.term, 'fr'));

	// Fonction pour normaliser les chaînes de caractères (supprime les accents)
	function normalizeString(str) {
	  return str
		.normalize('NFD') // Décompose les caractères accentués
		.replace(/[\u0300-\u036f]/g, ''); // Supprime les diacritiques
	}

	// Fonction pour afficher tous les termes du glossaire
	function displayAllTerms() {
	  const resultsDiv = document.getElementById('results');
	  resultsDiv.innerHTML = ''; // Réinitialiser les résultats

	  let currentLetter = '';

	  data.forEach(entry => {
		const firstLetter = normalizeString(entry.term[0]).toUpperCase();

		// Ajouter un en-tête pour chaque nouvelle lettre
		if (firstLetter !== currentLetter) {
		  currentLetter = firstLetter;

		  const letterHeader = document.createElement('h2');
		  letterHeader.id = currentLetter; // Ajoute un ID pour la navigation
		  letterHeader.textContent = currentLetter;
		  resultsDiv.appendChild(letterHeader);
		}

		// Ajouter chaque terme sous la bonne lettre
		const termDiv = document.createElement('div');
		termDiv.classList.add('glossary-entry'); // Ajoute la classe CSS
		termDiv.innerHTML = `<h3>${entry.term}</h3><p>${entry.definition}</p>`;
		resultsDiv.appendChild(termDiv);
	  });
	}

	// Fonction pour afficher uniquement les termes correspondant à une recherche
	function displaySearchResults(query) {
	  const resultsDiv = document.getElementById('results');
	  resultsDiv.innerHTML = ''; // Réinitialiser les résultats

	  try {
		// Normalise la recherche et crée une regex à partir de la recherche
		const normalizedQuery = normalizeString(query).replace(/\*/g, '.*'); // Remplace `*` par `.*` pour correspondre à tout
		const regex = new RegExp(normalizedQuery, 'i'); // Expression insensible à la casse

		// Trouver les termes qui correspondent à la regex
		const matches = data.filter(entry =>
		  regex.test(normalizeString(entry.term))
		);

		if (matches.length === 0) {
		  resultsDiv.innerHTML = '<p>Aucun résultat trouvé.</p>';
		  return;
		}

		matches.forEach(match => {
		  const termDiv = document.createElement('div');
		  termDiv.classList.add('glossary-entry'); // Ajoute la classe CSS
		  termDiv.innerHTML = `<h3>${match.term}</h3><p>${match.definition}</p>`;
		  resultsDiv.appendChild(termDiv);
		});
	  } catch (error) {
		console.error('Erreur avec l’expression régulière:', error);
		resultsDiv.innerHTML = '<p>Expression régulière invalide.</p>';
	  }
	}

	// Fonction pour générer les liens alphabétiques
	function createAlphabetLinks() {
	  const alphabetLinks = document.getElementById('alphabet-links');
	  const alphabet = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

	  alphabet.forEach(letter => {
		const link = document.createElement('a');
		link.href = `#${letter}`;
		link.textContent = letter;
		alphabetLinks.appendChild(link);
	  });
	}

	// Ajouter un événement sur la barre de recherche
	const searchInput = document.getElementById('search');
	searchInput.addEventListener('input', () => {
	  const query = searchInput.value.trim();

	  if (query === '') {
		displayAllTerms();
	  } else {
		displaySearchResults(query);
	  }
	});

	// Initialisation : Créer les liens alphabétiques et afficher tous les termes
	createAlphabetLinks();
	displayAllTerms();

	// Scroll to Top Button Logic
	const scrollTopBtn = document.getElementById('scrollTopBtn');

	window.addEventListener('scroll', () => {
	  if (window.scrollY > window.innerHeight / 4) {
		scrollTopBtn.style.display = 'block'; // Show button when scrolled 1/4th
	  } else {
		scrollTopBtn.style.display = 'none'; // Hide button otherwise
	  }
	});

	scrollTopBtn.addEventListener('click', () => {
	  window.scrollTo({ top: 0, behavior: 'smooth' });
	});

	// Search Button Logic
	const searchBtn = document.getElementById('searchBtn');

	searchBtn.addEventListener('click', () => {
	  searchInput.focus(); // Focus on the search bar
	  searchInput.scrollIntoView({ behavior: 'smooth' }); // Smooth scroll to the search bar
	});
  })
  .catch(error => console.error('Erreur de chargement du fichier JSON:', error));
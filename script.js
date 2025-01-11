fetch('glossaire.json')
  .then(response => response.json()) // Convertit la réponse en JSON
  .then(data => {
	console.log(data); // Affiche les données pour vérifier la structure

	// Vérifie la structure de `data`
	if (!Array.isArray(data)) {
	  console.error('Les données ne sont pas un tableau.');
	  return;
	}

	// Fonction pour afficher tous les termes du glossaire
	function displayAllTerms() {
	  const resultsDiv = document.getElementById('results');
	  resultsDiv.innerHTML = ''; // Réinitialiser les résultats
	  data.forEach(entry => {
		const termDiv = document.createElement('div');
		termDiv.classList.add('glossary-entry'); // Ajoute la classe CSS
		termDiv.innerHTML = `<h3>${entry.term}</h3><p>${entry.definition}</p>`;
		resultsDiv.appendChild(termDiv);
	  });
	}

	// Affiche tous les termes par défaut
	displayAllTerms();

	// Ajouter un événement sur la barre de recherche
	const searchInput = document.getElementById('search');
	const resultsDiv = document.getElementById('results');

	searchInput.addEventListener('input', () => {
	  const query = searchInput.value.trim();

	  // Si la recherche est vide, afficher tous les termes
	  if (query === '') {
		displayAllTerms();
		return;
	  }

	  try {
		// Crée une regex à partir de la recherche
		const regex = new RegExp(query.replace(/\*/g, '.*'), 'i'); // Remplace `*` par `.*` pour correspondre à tout

		// Trouver les termes qui correspondent à la regex
		const matches = data.filter(entry => regex.test(entry.term));

		// Afficher les résultats
		resultsDiv.innerHTML = ''; // Réinitialiser les résultats
		if (matches.length === 0) {
		  resultsDiv.innerHTML = '<p>Aucun résultat trouvé.</p>';
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
	});
  })
  .catch(error => console.error('Erreur de chargement du fichier JSON:', error));

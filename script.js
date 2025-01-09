// Charger le glossaire et initialiser Lunr.js
fetch('glossaire.json')
  .then(response => response.json())
  .then(data => {
	// Construire l'index Lunr
	const lunrIndex = lunr(function () {
	  this.field('term');
	  this.field('definition');
	  this.ref('term');

	  data.forEach((entry, index) => {
		this.add(entry);
	  });
	});

	// Ajouter un événement sur le champ de recherche
	const searchInput = document.getElementById('search');
	const resultsDiv = document.getElementById('results');

	searchInput.addEventListener('input', () => {
	  const query = searchInput.value.trim();
	  const results = lunrIndex.search(query);

	  // Afficher les résultats
	  resultsDiv.innerHTML = '';
	  results.forEach(result => {
		const match = data.find(item => item.term === result.ref);
		const termDiv = document.createElement('div');
		termDiv.innerHTML = `<h3>${match.term}</h3><p>${match.definition}</p>`;
		resultsDiv.appendChild(termDiv);
	  });

	  if (!results.length && query) {
		resultsDiv.innerHTML = '<p>Aucun résultat trouvé.</p>';
	  }
	});
  });
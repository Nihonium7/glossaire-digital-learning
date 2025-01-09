fetch('glossaire.json')
  .then(response => response.json())  // Convertit la réponse en JSON
  .then(data => {
    console.log(data);  // Ajoute cette ligne pour inspecter les données récupérées

    // Vérifie la structure de `data`
    if (!Array.isArray(data)) {
      console.error('Les données ne sont pas un tableau.');
      return;
    }

    // Construire l'index Lunr
    const lunrIndex = lunr(function () {
      this.field('term');  // Champ "term" pour la recherche
      this.field('definition');  // Champ "definition" pour la recherche
      this.ref('term');  // Référence basée sur "term" (clé unique)

      // Ajouter chaque entrée dans l'index Lunr
      data.forEach((entry) => {
        if (entry.term && entry.definition) {
          this.add({
            term: entry.term,
            definition: entry.definition,
          });
        } else {
          console.error('Entrée mal formée:', entry);
        }
      });
    });

    // Ajouter un événement sur le champ de recherche
    const searchInput = document.getElementById('search');
    const resultsDiv = document.getElementById('results');

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim();
      const results = lunrIndex.search(query);

      // Afficher les résultats
      resultsDiv.innerHTML = '';  // Réinitialiser les résultats
      results.forEach(result => {
        const match = data.find(item => item.term === result.ref);

        if (match) {
          const termDiv = document.createElement('div');
          termDiv.innerHTML = `<h3>${match.term}</h3><p>${match.definition}</p>`;
          resultsDiv.appendChild(termDiv);
        }
      });

      if (!results.length && query) {
        resultsDiv.innerHTML = '<p>Aucun résultat trouvé.</p>';
      }
    });
  })
  .catch(error => console.error('Erreur de chargement du fichier JSON:', error));

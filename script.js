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

    // Fonction pour calculer la distance de Levenshtein
    function levenshtein(a, b) {
      const tmp = [];
      let i, j;
      for (i = 0; i <= b.length; i++) tmp[i] = [i];
      for (j = 0; j <= a.length; j++) tmp[0][j] = j;
      for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
          tmp[i][j] = Math.min(
            tmp[i - 1][j] + 1,
            tmp[i][j - 1] + 1,
            tmp[i - 1][j - 1] + (a[j - 1] === b[i - 1] ? 0 : 1)
          );
        }
      }
      return tmp[b.length][a.length];
    }

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim();
      if (!query) {
        resultsDiv.innerHTML = '';
        return;
      }

      // Recherche de correspondances exactes via Lunr
      const results = lunrIndex.search(query);

      // Recherche de correspondances approximatives via Levenshtein
      const closestMatches = [];
      data.forEach(entry => {
        const distance = levenshtein(query.toLowerCase(), entry.term.toLowerCase());
        // Seuil de tolérance pour accepter la correspondance
        if (distance <= 5) {  // Ajuster la tolérance selon tes besoins
          closestMatches.push({ term: entry.term, definition: entry.definition, distance: distance });
        }
      });

      // Trier les résultats pour avoir le terme le plus proche en premier
      closestMatches.sort((a, b) => a.distance - b.distance);

      // Affichage des résultats
      resultsDiv.innerHTML = '';  // Réinitialiser les résultats
      if (closestMatches.length === 0 && !results.length) {
        resultsDiv.innerHTML = '<p>Aucun résultat trouvé.</p>';
      }

      // Affichage des résultats exacts (Lunr) et approximatifs (Levenshtein)
      closestMatches.forEach(match => {
        const termDiv = document.createElement('div');
        termDiv.innerHTML = `<h3>${match.term}</h3><p>${match.definition}</p>`;
        resultsDiv.appendChild(termDiv);
      });

      results.forEach(result => {
        const match = data.find(item => item.term === result.ref);
        if (match) {
          const termDiv = document.createElement('div');
          termDiv.innerHTML = `<h3>${match.term}</h3><p>${match.definition}</p>`;
          resultsDiv.appendChild(termDiv);
        }
      });
    });
  })
  .catch(error => console.error('Erreur de chargement du fichier JSON:', error));

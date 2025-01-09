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
        termDiv.innerHTML = `<h3>${entry.term}</h3><p>${entry.definition}</p>`;
        resultsDiv.appendChild(termDiv);
      });
    }

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

    // Fonction pour vérifier la correspondance via regex
    function matchByRegex(query, term) {
      const regexPattern = query.replace(/\*/g, '.*'); // Convertir les jokers (*) en regex
      const regex = new RegExp(`^${regexPattern}`, 'i'); // Correspondance insensible à la casse
      return regex.test(term);
    }

    // Ajouter un événement sur le champ de recherche
    const searchInput = document.getElementById('search');
    const resultsDiv = document.getElementById('results');

    // Afficher tous les termes par défaut si la recherche est vide
    displayAllTerms();

    // Ajouter un événement sur la barre de recherche
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim();

      // Si la recherche est vide, réafficher tous les termes
      if (query === '') {
        displayAllTerms();
        return;
      }

      // Trouver les termes correspondant via regex
      let filteredMatches = [];
      try {
        filteredMatches = data.filter(entry => matchByRegex(query, entry.term));
      } catch (error) {
        console.error('Expression régulière invalide:', error);
        resultsDiv.innerHTML = '<p>Erreur dans la recherche.</p>';
        return;
      }

      // Appliquer Levenshtein sur les résultats filtrés
      const closestMatches = filteredMatches.map(entry => ({
        term: entry.term,
        definition: entry.definition,
        distance: levenshtein(query.toLowerCase(), entry.term.toLowerCase())
      }));

      // Trier les résultats par distance de Levenshtein
      closestMatches.sort((a, b) => a.distance - b.distance);

      // Affichage des résultats
      resultsDiv.innerHTML = ''; // Réinitialiser les résultats
      if (closestMatches.length === 0) {
        resultsDiv.innerHTML = '<p>Aucun résultat trouvé.</p>';
      }

      closestMatches.forEach(match => {
        const termDiv = document.createElement('div');
        termDiv.innerHTML = `<h3>${match.term}</h3><p>${match.definition}</p>`;
        resultsDiv.appendChild(termDiv);
      });
    });
  })
  .catch(error => console.error('Erreur de chargement du fichier JSON:', error));

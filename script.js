fetch('glossaire.json')
  .then(response => response.json())  // Convertit la réponse en JSON
  .then(data => {
    console.log(data);  // Ajoute cette ligne pour inspecter les données récupérées

    // Vérifie la structure de `data`
    if (!Array.isArray(data)) {
      console.error('Les données ne sont pas un tableau.');
      return;
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

    // Ajouter un événement sur le champ de recherche
    const searchInput = document.getElementById('search');
    const resultsDiv = document.getElementById('results');

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim();

      // Ne pas chercher si la requête est trop courte (par exemple, moins de 3 caractères)
      if (query.length < 3) {
        resultsDiv.innerHTML = '';  // Réinitialiser les résultats
        return;
      }

      // Trouver les termes les plus proches via Levenshtein
      const closestMatches = [];
      data.forEach(entry => {
        const distance = levenshtein(query.toLowerCase(), entry.term.toLowerCase());
        // Si la distance est faible, on considère que c'est un bon match
        closestMatches.push({ term: entry.term, definition: entry.definition, distance: distance });
      });

      // Trier les résultats pour avoir le terme le plus proche en premier
      closestMatches.sort((a, b) => a.distance - b.distance);

      // Affichage des résultats
      resultsDiv.innerHTML = '';  // Réinitialiser les résultats
      if (closestMatches.length === 0) {
        resultsDiv.innerHTML = '<p>Aucun résultat trouvé.</p>';
      }

      // Affichage des résultats les plus proches
      closestMatches.forEach(match => {
        const termDiv = document.createElement('div');
        termDiv.innerHTML = `<h3>${match.term}</h3><p>${match.definition}</p>`;
        resultsDiv.appendChild(termDiv);
      });
    });
  })
  .catch(error => console.error('Erreur de chargement du fichier JSON:', error));

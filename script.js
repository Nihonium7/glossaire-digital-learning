fetch('glossaire.json')
  .then(response => response.json())  // Convertit la réponse en JSON
  .then(data => {
    console.log(data);  // Affiche les données pour vérifier la structure

    // Vérifie la structure de `data`
    if (!Array.isArray(data)) {
      console.error('Les données ne sont pas un tableau.');
      return;
    }

    // Fonction pour afficher tous les termes du glossaire
    function displayAllTerms() {
      const resultsDiv = document.getElementById('results');
      resultsDiv.innerHTML = '';  // Réinitialiser les résultats
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

    // Fonction pour vérifier si un terme contient une correspondance partielle
    function isMatch(query, term) {
      const words = term.toLowerCase().split(' '); // Séparer le terme en mots
      return words.some(word => levenshtein(query.toLowerCase(), word) <= 3); // Vérifier la correspondance dans chaque mot
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
      if (query.length === 0) {
        displayAllTerms();
        return;
      }

      // Trouver les termes les plus proches via Levenshtein
      const closestMatches = [];
      const maxDistance = Math.max(3, query.length);  // Ajuste le seuil basé sur la longueur de la recherche

      data.forEach(entry => {
        // Vérifie si le terme ou l'un de ses mots correspond à la recherche
        if (isMatch(query, entry.term)) {
          closestMatches.push({ term: entry.term, definition: entry.definition });
        }
      });

      // Trier les résultats pour avoir le terme le plus proche en premier
      closestMatches.sort((a, b) => {
        // Trier par la distance de Levenshtein pour le premier mot
        const firstTermDistance = levenshtein(query.toLowerCase(), a.term.split(' ')[0].toLowerCase());
        const secondTermDistance = levenshtein(query.toLowerCase(), b.term.split(' ')[0].toLowerCase());
        return firstTermDistance - secondTermDistance;
      });

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

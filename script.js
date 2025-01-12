fetch('glossaire.json')
  .then(response => response.json()) // Convert the response to JSON
  .then(data => {
	console.log(data); // Log the data to verify the structure

	if (!Array.isArray(data)) {
	  console.error('Les données ne sont pas un tableau.');
	  return;
	}

	// Sort data alphabetically by the term
	data.sort((a, b) => a.term.localeCompare(b.term, 'fr'));

	// Function to normalize strings (removes accents)
	function normalizeString(str) {
	  return str
		.normalize('NFD') // Decompose accented characters
		.replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
	}

	// Extract tags and display them
	const allTags = new Set();
	data.forEach(entry => {
	  if (entry.tags) {
		entry.tags.forEach(tag => allTags.add(tag));
	  }
	});
	// Show the "Clear Tag" button
	function showClearTagButton() {
	  const clearTagContainer = document.getElementById('clear-tag-container');
	  clearTagContainer.style.display = 'block';
	}
	function clearActiveTagStatus() {
	  const allTagButtons = document.querySelectorAll('.tag');
	  allTagButtons.forEach(button => button.classList.remove('active')); // Remove the active class from all tags
	}
	// Hide the "Clear Tag" button
	function hideClearTagButton() {
	  const clearTagContainer = document.getElementById('clear-tag-container');
	  clearTagContainer.style.display = 'none';
	}
	document.getElementById('clear-tag-btn').addEventListener('click', () => {
	  displayAllTerms(); // Reset the page to display all terms
	  hideClearTagButton(); // Optionally hide the button after clearing
	  clearActiveTagStatus(); // Remove the "active" class from all tags
	});
	// Function to display the tags above the letters
	function displayTags() {
	  const tagsDiv = document.getElementById('tags');
	  if (!tagsDiv) {
		return;
	  }

	  tagsDiv.innerHTML = ''; // Clear existing tags
	  allTags.forEach(tag => {
		const tagButton = document.createElement('button');
		tagButton.textContent = tag;
		tagButton.classList.add('tag'); // Add a CSS class for styling
		tagButton.addEventListener('click', () => {
		  displayTaggedResults(tag); // Filter results by clicked tag
		});
		tagsDiv.appendChild(tagButton);
	  });
	}

	function displayTaggedResults(tag) {
	  const resultsDiv = document.getElementById('results');
	  resultsDiv.innerHTML = ''; // Clear existing results
	
	  // Highlight the selected tag
	  const allTagButtons = document.querySelectorAll('.tag');
	  allTagButtons.forEach(button => {
		if (button.textContent === tag) {
		  button.classList.add('active'); // Add the active class to the selected tag
		} else {
		  button.classList.remove('active'); // Remove the active class from others
		}
	  });
	
	  const taggedEntries = data.filter(entry => entry.tags && entry.tags.includes(tag));
	
	  if (taggedEntries.length === 0) {
		resultsDiv.innerHTML = '<p>Aucun résultat pour ce tag.</p>';
		return;
	  }
	
	  taggedEntries.forEach(entry => {
		const termDiv = document.createElement('div');
		termDiv.classList.add('glossary-entry');
		termDiv.innerHTML = `<h3>${entry.term}</h3><p>${entry.definition}</p>`;
	
		if (entry.tags && entry.tags.length > 0) {
		  const tagsContainer = document.createElement('div');
		  tagsContainer.classList.add('tags-container'); // Add class for styling tags
	
		  entry.tags.forEach(tag => {
			const tagElement = document.createElement('a');
			tagElement.href = '#'; // Make the tag clickable like a link
			tagElement.classList.add('tag'); // Add a CSS class for styling each tag
			tagElement.textContent = tag;
			tagElement.addEventListener('click', (e) => {
			  e.preventDefault(); // Prevent default link behavior
			  displayTaggedResults(tag); // Trigger tag filtering
			});
			tagsContainer.appendChild(tagElement);
		  });
	
		  termDiv.appendChild(tagsContainer); // Append the tags container under the term's definition
		}
	
		resultsDiv.appendChild(termDiv); // Append the whole term entry to the results div
	  });
	
	  showClearTagButton(); // Show the "Clear Tag" button
	}

	// Function to display all terms in the glossary with tags
	function displayAllTerms() {
	  const resultsDiv = document.getElementById('results');
	  resultsDiv.innerHTML = ''; // Reset results

	  let currentLetter = '';
	  data.forEach(entry => {
		const firstLetter = normalizeString(entry.term[0]).toUpperCase();

		// Add a header for each new letter
		if (firstLetter !== currentLetter) {
		  currentLetter = firstLetter;
		  const letterHeader = document.createElement('h2');
		  letterHeader.id = currentLetter; // Add an ID for navigation
		  letterHeader.textContent = currentLetter;
		  resultsDiv.appendChild(letterHeader);
		}

		// Create a container for the term entry
		const termDiv = document.createElement('div');
		termDiv.classList.add('glossary-entry');

		// Add the term and its definition
		termDiv.innerHTML = `<h3>${entry.term}</h3><p>${entry.definition}</p>`;

		// Add the tags under the definition if available
		if (entry.tags && entry.tags.length > 0) {
		  const tagsContainer = document.createElement('div');
		  tagsContainer.classList.add('tags-container'); // Add class for styling tags

		  entry.tags.forEach(tag => {
			const tagElement = document.createElement('a');
			tagElement.href = '#'; // Make the tag clickable like a link
			tagElement.classList.add('tag'); // Add a CSS class for styling each tag
			tagElement.textContent = tag;
			tagElement.addEventListener('click', (e) => {
			  e.preventDefault(); // Prevent default link behavior
			  displayTaggedResults(tag); // Trigger tag filtering
			});
			tagsContainer.appendChild(tagElement);
		  });

		  termDiv.appendChild(tagsContainer); // Append the tags container under the term's definition
		}

		resultsDiv.appendChild(termDiv); // Append the whole term entry to the results div
	  });
	}

	// Function to display search results
	function displaySearchResults(query) {
	  const resultsDiv = document.getElementById('results');
	  resultsDiv.innerHTML = ''; // Clear previous results

	  try {
		const normalizedQuery = normalizeString(query).replace(/\*/g, '.*'); // Replace `*` with `.*` for matching
		const regex = new RegExp(normalizedQuery, 'i'); // Case-insensitive regex

		const includeDefinitions = document.getElementById('search-definitions').checked;

		const matches = data.filter(entry => {
		  const matchesTerm = regex.test(normalizeString(entry.term));
		  const matchesDefinition = includeDefinitions && regex.test(normalizeString(entry.definition));
		  return matchesTerm || matchesDefinition;
		});

		if (matches.length === 0) {
		  resultsDiv.innerHTML = '<p class="noresult" style="color:white;">Aucun résultat trouvé.</p><img class="nothingfound" src="https://dorianfichot.com/data/files/dc_tree2.webp" alt="404 image" /><br>';
		  return;
		}

		matches.forEach(match => {
		  const termDiv = document.createElement('div');
		  termDiv.classList.add('glossary-entry');
		  termDiv.innerHTML = `<h3>${match.term}</h3><p>${match.definition}</p>`;

		  // Add the tags under the definition if available
		  if (match.tags && match.tags.length > 0) {
			const tagsContainer = document.createElement('div');
			tagsContainer.classList.add('tags-container'); // Add class for styling tags

			match.tags.forEach(tag => {
			  const tagElement = document.createElement('a');
			  tagElement.href = '#'; // Make the tag clickable like a link
			  tagElement.classList.add('tag'); // Add a CSS class for styling each tag
			  tagElement.textContent = tag;
			  tagElement.addEventListener('click', (e) => {
				e.preventDefault(); // Prevent default link behavior
				displayTaggedResults(tag); // Trigger tag filtering
			  });
			  tagsContainer.appendChild(tagElement);
			});

			termDiv.appendChild(tagsContainer); // Append the tags container under the term's definition
		  }

		  resultsDiv.appendChild(termDiv); // Append the whole term entry to the results div
		});
	  } catch (error) {
		console.error('Erreur avec l’expression régulière:', error);
		resultsDiv.innerHTML = '<p>Expression régulière invalide.</p>';
	  }
	}

	// Create alphabet links dynamically
	function createAlphabetLinks() {
	  const alphabetLinks = document.getElementById('alphabet-links');
	  const alphabet = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

	  alphabet.forEach(letter => {
		const link = document.createElement('a');
		link.href = `#${letter}`;
		link.textContent = letter;
		link.addEventListener('click', (event) => {
		  event.preventDefault();
		  const target = document.getElementById(letter);
		  smoothScrollTo(target);
		});
		alphabetLinks.appendChild(link);
	  });
	}

	// Smooth scrolling to a specific element
	function smoothScrollTo(element) {
	  element.scrollIntoView({
		behavior: 'smooth',
		block: 'start' // Align the element at the top of the viewport
	  });
	}

	// Event listeners for the search bar
	const searchInput = document.getElementById('search');
	const clearButton = document.querySelector('.clear-btn');
	clearButton.addEventListener('click', () => {
	  searchInput.value = '';
	  clearButton.style.display = 'none';
	  displayAllTerms(); // Show all terms when cleared
	});

	searchInput.addEventListener('input', () => {
	  const query = searchInput.value.trim();

	  if (query === '') {
		clearButton.style.display = 'none';
		displayAllTerms();

		const alphabetLinks = document.getElementById('alphabet-links');
		alphabetLinks.style.display = 'flex';
		alphabetLinks.style.opacity = '1';
	  } else {
		clearButton.style.display = 'block';
		displaySearchResults(query);

		const alphabetLinks = document.getElementById('alphabet-links');
		alphabetLinks.style.opacity = '0';
		setTimeout(() => {
		  alphabetLinks.style.display = 'none';
		}, 300);
	  }
	});

	// Initialization: Create alphabet links, display tags, and show all terms
	createAlphabetLinks();
	displayTags();  // Display tags above the alphabet links
	displayAllTerms();

	// Scroll to Top Button Logic
	const scrollTopBtn = document.getElementById('scrollTopBtn');
	window.addEventListener('scroll', () => {
	  if (window.scrollY > window.innerHeight / 2) {
		scrollTopBtn.style.display = 'block';
	  } else {
		scrollTopBtn.style.display = 'none';
	  }
	});

	scrollTopBtn.addEventListener('click', () => {
	  smoothScrollTo(document.body);
	});
  })
  .catch(error => console.error('Erreur de chargement du fichier JSON:', error));
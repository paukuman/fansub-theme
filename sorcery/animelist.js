class AnimeListApp {
    constructor() {
        this.baseUrl = 'https://mangadb.paukuman.workers.dev/anime';
        this.blogID = document.querySelector('meta[name="blogID"]').getAttribute('content');
        this.allAnime = [];
        this.filteredAnime = [];
        this.currentLetter = 'all';
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        this.renderAnimeListUI();
        this.bindEvents();
        this.loadAnimeData();
    }
    
    renderAnimeListUI() {
        const pageContainer = document.getElementById('page-container');
        
        pageContainer.innerHTML = `
            <div class="glass rounded-xl p-4 md:p-6 mb-6">
                <h1 class="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-primary-700 dark:text-primary-400">Daftar Anime</h1>
                
                <!-- Alphabet Filter -->
                <div class="mb-4 md:mb-6">
                    <div class="flex flex-wrap gap-2 justify-center" id="alphabet-filter">
                        <!-- Alphabet buttons will be populated by JavaScript -->
                    </div>
                </div>
                
                <!-- Search Box -->
                <div class="mb-4 md:mb-6">
                    <div class="relative">
                        <input type="text" id="anime-search-input" placeholder="Cari anime..." 
                            class="w-full px-4 py-2 md:py-3 text-sm md:text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <button id="anime-search-button" class="absolute right-1 top-1 md:right-2 md:top-2 p-1 md:p-2 bg-primary-600 text-white rounded-md md:rounded-lg hover:bg-primary-700 transition-colors">
                            <i class="fas fa-search text-xs md:text-sm"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Results Info -->
                <div id="results-info" class="mb-3 md:mb-4">
                    <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400">Memuat daftar anime...</p>
                </div>
                
                <!-- Anime List Container -->
                <div id="anime-list" class="space-y-2 md:space-y-3"></div>
                
                <!-- Loading Skeleton -->
                <div id="loading-skeleton" class="hidden space-y-2 md:space-y-3">
                    ${this.generateSkeletonItems(10)}
                </div>
                
                <!-- No Results Message -->
                <div id="no-results" class="hidden text-center py-8 md:py-12">
                    <i class="fas fa-search text-3xl md:text-4xl text-gray-400 mb-3 md:mb-4"></i>
                    <h3 class="text-lg md:text-xl font-medium text-gray-600 dark:text-gray-400">Tidak ada anime ditemukan</h3>
                    <p class="text-xs md:text-sm text-gray-500 dark:text-gray-500 mt-1 md:mt-2">Coba gunakan filter yang berbeda</p>
                </div>
            </div>
        `;
    }
    
    generateSkeletonItems(count) {
        let skeletonHTML = '';
        for (let i = 0; i < count; i++) {
            skeletonHTML += `
                <div class="glass rounded-lg p-3 md:p-4 animate-pulse flex items-center">
                    <div class="w-12 h-12 md:w-16 md:h-16 bg-gray-300 dark:bg-gray-700 rounded-lg mr-3 md:mr-4"></div>
                    <div class="flex-1">
                        <div class="h-4 md:h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div class="h-3 md:h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                </div>
            `;
        }
        return skeletonHTML;
    }
    
    generateAlphabetButtons() {
        const alphabetFilter = document.getElementById('alphabet-filter');
        
        // Add "All" button
        const allButton = document.createElement('button');
        allButton.className = 'px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm font-medium rounded-lg bg-primary-600 text-white';
        allButton.textContent = 'All';
        allButton.dataset.letter = 'all';
        allButton.addEventListener('click', () => this.filterByLetter('all'));
        alphabetFilter.appendChild(allButton);
        
        // Get all unique starting characters (dynamic symbols)
        const startingChars = this.getUniqueStartingCharacters();
        
        // Create buttons for each unique starting character
        startingChars.forEach(char => {
            const button = document.createElement('button');
            button.className = 'px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors';
            button.textContent = char;
            button.dataset.letter = char;
            button.addEventListener('click', () => this.filterByLetter(char));
            alphabetFilter.appendChild(button);
        });
    }
    
    getUniqueStartingCharacters() {
        const chars = new Set();
        
        this.allAnime.forEach(anime => {
            if (anime.title && anime.title.length > 0) {
                const firstChar = anime.title.charAt(0).toUpperCase();
                
                // Check if it's a letter (A-Z)
                if (/[A-Z]/.test(firstChar)) {
                    chars.add(firstChar);
                } else {
                    // It's a symbol or other character
                    chars.add(firstChar);
                }
            }
        });
        
        // Convert to array and sort
        const sortedChars = Array.from(chars).sort((a, b) => {
            // Sort letters first, then symbols
            const aIsLetter = /[A-Z]/.test(a);
            const bIsLetter = /[A-Z]/.test(b);
            
            if (aIsLetter && !bIsLetter) return -1;
            if (!aIsLetter && bIsLetter) return 1;
            if (aIsLetter && bIsLetter) return a.localeCompare(b);
            
            // Both are symbols, sort normally
            return a.localeCompare(b);
        });
        
        return sortedChars;
    }
    
    updateAlphabetButtons() {
        // Get all anime titles and extract first characters
        const firstChars = new Set();
        this.allAnime.forEach(anime => {
            if (anime.title && anime.title.length > 0) {
                const firstChar = anime.title.charAt(0).toUpperCase();
                firstChars.add(firstChar);
            }
        });
        
        // Update button states
        const buttons = document.querySelectorAll('#alphabet-filter button');
        buttons.forEach(button => {
            const letter = button.dataset.letter;
            
            if (letter === 'all') {
                // Always enable "All" button
                button.classList.remove('bg-gray-300', 'dark:bg-gray-700', 'text-gray-500', 'dark:text-gray-500', 'cursor-not-allowed');
                button.classList.add('bg-primary-600', 'text-white', 'hover:bg-primary-700');
                return;
            }
            
            if (firstChars.has(letter)) {
                // Enable button if there are anime starting with this character
                button.classList.remove('bg-gray-300', 'dark:bg-gray-700', 'text-gray-500', 'dark:text-gray-500', 'cursor-not-allowed');
                button.classList.add('bg-gray-100', 'dark:bg-gray-800', 'text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-200', 'dark:hover:bg-gray-700');
            } else {
                // Disable button if no anime starts with this character
                button.classList.remove('bg-gray-100', 'dark:bg-gray-800', 'text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-200', 'dark:hover:bg-gray-700');
                button.classList.add('bg-gray-300', 'dark:bg-gray-700', 'text-gray-500', 'dark:text-gray-500', 'cursor-not-allowed');
            }
        });
        
        // Update active button
        this.updateActiveButton();
    }
    
    updateActiveButton() {
        const buttons = document.querySelectorAll('#alphabet-filter button');
        buttons.forEach(button => {
            if (button.dataset.letter === this.currentLetter) {
                button.classList.remove('bg-gray-100', 'dark:bg-gray-800');
                button.classList.add('bg-primary-600', 'text-white');
            } else if (button.dataset.letter !== 'all') {
                button.classList.remove('bg-primary-600', 'text-white');
                
                // Only add background if button is enabled
                if (!button.classList.contains('cursor-not-allowed')) {
                    button.classList.add('bg-gray-100', 'dark:bg-gray-800');
                }
            }
        });
    }
    
    bindEvents() {
        // Search on button click
        document.getElementById('anime-search-button').addEventListener('click', () => {
            this.performSearch();
        });
        
        // Search on enter key
        document.getElementById('anime-search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        // Real-time search
        document.getElementById('anime-search-input').addEventListener('input', () => {
            this.performSearch();
        });
    }
    
    async loadAnimeData() {
        this.showLoadingState();
        
        try {
            // Build query parameters
            const params = new URLSearchParams({
                blogID: this.blogID,
                page: 'animeinfo',
                limit: 1000,
                offset: 0
            });
            
            // Make API request
            const response = await fetch(`${this.baseUrl}?${params.toString()}`);
            const data = await response.json();
            
            if (data.status === 200) {
                this.allAnime = data.response.entries;
                this.filteredAnime = [...this.allAnime];
                
                // Sort anime alphabetically by title
                this.allAnime.sort((a, b) => a.title.localeCompare(b.title));
                this.filteredAnime.sort((a, b) => a.title.localeCompare(b.title));
                
                // Generate alphabet buttons
                this.generateAlphabetButtons();
                
                // Display results
                this.displayResults();
                
                // Update alphabet buttons based on available anime
                this.updateAlphabetButtons();
            } else {
                throw new Error('Failed to fetch anime list');
            }
        } catch (error) {
            console.error('Error loading anime data:', error);
            this.showErrorState();
        } finally {
            this.hideLoadingState();
        }
    }
    
    filterByLetter(letter) {
        this.currentLetter = letter;
        
        if (letter === 'all') {
            this.filteredAnime = [...this.allAnime];
        } else {
            // Filter anime that start with the selected character
            this.filteredAnime = this.allAnime.filter(anime => {
                if (!anime.title || anime.title.length === 0) return false;
                return anime.title.charAt(0).toUpperCase() === letter;
            });
        }
        
        // Apply search filter if there's a search query
        const searchQuery = document.getElementById('anime-search-input').value.trim();
        if (searchQuery) {
            this.filteredAnime = this.filteredAnime.filter(anime => 
                anime.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        // Update active button
        this.updateActiveButton();
        
        // Display results
        this.displayResults();
    }
    
    performSearch() {
        const searchQuery = document.getElementById('anime-search-input').value.trim();
        
        // Reset to all anime if search is empty
        if (!searchQuery) {
            this.filterByLetter(this.currentLetter);
            return;
        }
        
        // Filter anime based on search query
        this.filteredAnime = this.allAnime.filter(anime => 
            anime.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        // Display results
        this.displayResults();
    }
    
    displayResults() {
        const animeList = document.getElementById('anime-list');
        const resultsInfo = document.getElementById('results-info');
        const noResults = document.getElementById('no-results');
        
        // Clear previous results
        animeList.innerHTML = '';
        
        // Show/hide no results message
        if (this.filteredAnime.length === 0) {
            noResults.classList.remove('hidden');
            resultsInfo.classList.add('hidden');
            return;
        } else {
            noResults.classList.add('hidden');
            resultsInfo.classList.remove('hidden');
        }
        
        // Update results info
        let infoText = `Menampilkan ${this.filteredAnime.length} anime`;
        if (this.currentLetter !== 'all') {
            infoText += ` dengan filter "${this.currentLetter}"`;
        }
        
        const searchQuery = document.getElementById('anime-search-input').value.trim();
        if (searchQuery) {
            infoText += ` dan pencarian "${searchQuery}"`;
        }
        
        resultsInfo.querySelector('p').textContent = infoText;
        
        // Process and display entries
        this.filteredAnime.forEach(anime => {
            const animeItem = this.createAnimeListItem(anime);
            animeList.appendChild(animeItem);
        });
    }
    
    createAnimeListItem(anime) {
        const item = document.createElement('a');
        item.href = anime.path;
        item.className = 'glass rounded-lg p-3 md:p-4 flex items-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1';
        
        // Extract image URL from content
        let imageUrl = '';
        const imgMatch = anime.content.match(/src="([^"]*)"/);
        if (imgMatch && imgMatch[1]) {
            imageUrl = imgMatch[1];
        }
        
        // Extract genres from categories
        const genres = anime.categories.filter(cat => 
            !cat.includes(':') && !['scheduled:true', 'scheduled:false', 'page:animeinfo'].includes(cat)
        );
        
        // Extract rating if available
        const rating = anime.categories.find(cat => cat.startsWith('rate:'));
        const ratingValue = rating ? rating.split(':')[1] : null;
        
        item.innerHTML = `
            <div class="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 mr-3 md:mr-4">
                ${imageUrl ? `
                    <img src="${imageUrl}" alt="${anime.title}" 
                        class="w-full h-full object-cover rounded-lg">
                ` : `
                    <div class="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <i class="fas fa-image text-gray-400"></i>
                    </div>
                `}
            </div>
            
            <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-sm md:text-base mb-1 truncate">${anime.title}</h3>
                
                <div class="flex items-center text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <i class="far fa-clock mr-1"></i>
                    <span>${anime.published.relative}</span>
                </div>
                
                ${genres.length > 0 ? `
                    <div class="flex flex-wrap gap-1">
                        <span class="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs px-2 py-1 rounded-full">
                            ${genres[0]}
                        </span>
                        ${genres.length > 1 ? `
                            <span class="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
                                +${genres.length - 1}
                            </span>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
            
            ${ratingValue ? `
                <div class="ml-2 md:ml-4 flex-shrink-0 hidden md:block">
                    <div class="bg-primary-600 text-white text-xs md:text-sm font-bold px-2 py-1 rounded">
                        ⭐ ${ratingValue}
                    </div>
                </div>
            ` : ''}
            
            <div class="ml-2 md:ml-4 flex-shrink-0">
                <i class="fas fa-chevron-right text-gray-400"></i>
            </div>
        `;
        
        return item;
    }
    
    showLoadingState() {
        document.getElementById('loading-skeleton').classList.remove('hidden');
        document.getElementById('anime-list').classList.add('hidden');
        document.getElementById('results-info').classList.add('hidden');
        document.getElementById('no-results').classList.add('hidden');
    }
    
    hideLoadingState() {
        document.getElementById('loading-skeleton').classList.add('hidden');
        document.getElementById('anime-list').classList.remove('hidden');
        document.getElementById('results-info').classList.remove('hidden');
    }
    
    showErrorState() {
        const animeList = document.getElementById('anime-list');
        animeList.innerHTML = `
            <div class="text-center py-8 md:py-12">
                <i class="fas fa-exclamation-triangle text-3xl md:text-4xl text-yellow-500 mb-3 md:mb-4"></i>
                <h3 class="text-lg md:text-xl font-medium text-gray-600 dark:text-gray-400">Terjadi kesalahan</h3>
                <p class="text-xs md:text-sm text-gray-500 dark:text-gray-500 mt-1 md:mt-2">Gagal memuat daftar anime. Silakan coba lagi.</p>
                <button id="retry-loading" class="mt-3 md:mt-4 px-3 md:px-4 py-1 md:py-2 text-sm md:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    Coba Lagi
                </button>
            </div>
        `;
        
        document.getElementById('retry-loading').addEventListener('click', () => {
            this.loadAnimeData();
        });
    }
}

// Initialize the anime list app when DOM is loaded
if (window.location.pathname.includes('animelist')) {
        new AnimeListApp();
}
class SearchApp {
    constructor() {

        // Periksa apakah kita berada di halaman search
        if (!window.location.pathname.includes('/p/search.html')) {
            return;
        }

        this.baseUrl = 'https://mangadb.paukuman.workers.dev/anime';
        this.blogID = document.querySelector('meta[name="blogID"]').getAttribute('content');
        this.currentPage = 1;
        this.isLoading = false;
        this.hasMore = true;
        this.viewMode = 'grid'; // 'grid' or 'list'
        this.currentFilters = {
            q: '',
            genre: '',
            status: '',
            type: '',
            page: 'animeinfo'
        };

        this.init();
    }

    init() {
        this.renderSearchUI();
        this.bindEvents();
        this.loadInitialData();
    }

    renderSearchUI() {
        const pageContainer = document.getElementById('page-container');

        pageContainer.innerHTML = `
            <div class="glass rounded-xl p-4 md:p-6 mb-6">
                <h1 class="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-primary-700 dark:text-primary-400">Cari Anime</h1>
                
                <!-- Simple Search -->
                <div class="mb-4 md:mb-6">
                    <div class="relative">
                        <input type="text" id="search-input" placeholder="Cari judul anime..." 
                            class="w-full px-4 py-2 md:py-3 text-sm md:text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                        <button id="search-button" class="absolute right-1 top-1 md:right-2 md:top-2 p-1 md:p-2 bg-primary-600 text-white rounded-md md:rounded-lg hover:bg-primary-700 transition-colors">
                            <i class="fas fa-search text-xs md:text-sm"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Advanced Search Toggle and View Toggle -->
                <div class="flex justify-between items-center mb-4 md:mb-6">
                    <button id="advanced-search-toggle" class="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm md:text-base">
                        <i class="fas fa-cog mr-1 md:mr-2"></i> Pencarian Lanjutan
                        <i class="fas fa-chevron-down ml-1 md:ml-2 text-xs md:text-sm"></i>
                    </button>
                    
                    <div class="flex items-center space-x-2">
                        <button id="view-grid" class="p-1 md:p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-md transition-colors">
                            <i class="fas fa-th-large text-sm md:text-base"></i>
                        </button>
                        <button id="view-list" class="p-1 md:p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-md transition-colors">
                            <i class="fas fa-list text-sm md:text-base"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Advanced Search Form (Hidden by default) -->
                <div id="advanced-search-form" class="hidden mb-4 md:mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        <div>
                            <label class="block text-xs md:text-sm font-medium mb-1 md:mb-2">Genre</label>
                            <select id="genre-filter" class="w-full px-2 md:px-3 py-1 md:py-2 text-sm md:text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
                                <option value="">Semua Genre</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-xs md:text-sm font-medium mb-1 md:mb-2">Status</label>
                            <select id="status-filter" class="w-full px-2 md:px-3 py-1 md:py-2 text-sm md:text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
                                <option value="">Semua Status</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-xs md:text-sm font-medium mb-1 md:mb-2">Tipe</label>
                            <select id="type-filter" class="w-full px-2 md:px-3 py-1 md:py-2 text-sm md:text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
                                <option value="">Semua Tipe</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="mt-3 md:mt-4 flex justify-end">
                        <button id="apply-filters" class="px-3 md:px-4 py-1 md:py-2 text-sm md:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                            Terapkan Filter
                        </button>
                    </div>
                </div>
                
                <!-- Results Info -->
                <div id="results-info" class="mb-3 md:mb-4 hidden">
                    <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400"></p>
                </div>
                
                <!-- Results Container -->
                <div id="search-results" class="grid-view grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"></div>
                
                <!-- Loading Skeleton -->
                <div id="loading-skeleton" class="hidden grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    ${this.generateSkeletonItems(6)}
                </div>
                
                <!-- Load More Button -->
                <div id="load-more-container" class="mt-6 md:mt-8 text-center hidden">
                    <button id="load-more-button" class="px-4 md:px-6 py-2 md:py-3 text-sm md:text-base bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
                        Muat Lebih Banyak
                    </button>
                </div>
                
                <!-- No Results Message -->
                <div id="no-results" class="hidden text-center py-8 md:py-12">
                    <i class="fas fa-search text-3xl md:text-4xl text-gray-400 mb-3 md:mb-4"></i>
                    <h3 class="text-lg md:text-xl font-medium text-gray-600 dark:text-gray-400">Tidak ada hasil ditemukan</h3>
                    <p class="text-xs md:text-sm text-gray-500 dark:text-gray-500 mt-1 md:mt-2">Coba gunakan kata kunci lain atau filter yang berbeda</p>
                </div>
            </div>
        `;

        // Set active view mode
        this.updateViewModeButtons();
    }

    generateSkeletonItems(count) {
        let skeletonHTML = '';
        for (let i = 0; i < count; i++) {
            skeletonHTML += `
                <div class="glass rounded-lg overflow-hidden animate-pulse">
                    <div class="bg-gray-300 dark:bg-gray-700 h-36 md:h-48"></div>
                    <div class="p-2 md:p-4">
                        <div class="h-4 md:h-6 bg-gray-300 dark:bg-gray-700 rounded mb-2 md:mb-3"></div>
                        <div class="h-3 md:h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-1 md:mb-2"></div>
                        <div class="h-3 md:h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                        <div class="flex flex-wrap gap-1 md:gap-2 mt-2 md:mt-3">
                            <div class="h-5 md:h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-12 md:w-16"></div>
                        </div>
                    </div>
                </div>
            `;
        }
        return skeletonHTML;
    }

    bindEvents() {
        // Toggle advanced search
        document.getElementById('advanced-search-toggle').addEventListener('click', () => {
            const form = document.getElementById('advanced-search-form');
            const icon = document.querySelector('#advanced-search-toggle i.fa-chevron-down');

            form.classList.toggle('hidden');
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        });

        // Search on button click
        document.getElementById('search-button').addEventListener('click', () => {
            this.performSearch();
        });

        // Search on enter key
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // Apply filters
        document.getElementById('apply-filters').addEventListener('click', () => {
            this.applyFilters();
        });

        // Load more results
        document.getElementById('load-more-button').addEventListener('click', () => {
            this.loadMoreResults();
        });

        // View mode toggle
        document.getElementById('view-grid').addEventListener('click', () => {
            this.setViewMode('grid');
        });

        document.getElementById('view-list').addEventListener('click', () => {
            this.setViewMode('list');
        });
    }

    setViewMode(mode) {
        this.viewMode = mode;
        this.updateViewModeButtons();
        this.updateResultsView();
    }

    updateViewModeButtons() {
        const gridBtn = document.getElementById('view-grid');
        const listBtn = document.getElementById('view-list');

        if (this.viewMode === 'grid') {
            gridBtn.classList.add('text-primary-600', 'dark:text-primary-400');
            gridBtn.classList.remove('text-gray-600', 'dark:text-gray-400');
            listBtn.classList.add('text-gray-600', 'dark:text-gray-400');
            listBtn.classList.remove('text-primary-600', 'dark:text-primary-400');
        } else {
            listBtn.classList.add('text-primary-600', 'dark:text-primary-400');
            listBtn.classList.remove('text-gray-600', 'dark:text-gray-400');
            gridBtn.classList.add('text-gray-600', 'dark:text-gray-400');
            gridBtn.classList.remove('text-primary-600', 'dark:text-primary-400');
        }
    }

    updateResultsView() {
        const resultsContainer = document.getElementById('search-results');

        if (this.viewMode === 'grid') {
            resultsContainer.classList.remove('list-view');
            resultsContainer.classList.add('grid-view');
            resultsContainer.className = 'grid-view grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4';
        } else {
            resultsContainer.classList.remove('grid-view');
            resultsContainer.classList.add('list-view');
            resultsContainer.className = 'list-view grid grid-cols-1 gap-3 md:gap-4';
        }

        // Update all existing cards
        const cards = resultsContainer.querySelectorAll('.anime-card');
        cards.forEach(card => {
            if (this.viewMode === 'grid') {
                card.classList.remove('flex', 'flex-row');
                card.classList.add('flex', 'flex-col');

                const img = card.querySelector('img');
                if (img) {
                    img.classList.remove('w-24', 'md:w-32', 'h-24', 'md:h-32', 'rounded-lg');
                    img.classList.add('w-full', 'h-36', 'md:h-48', 'object-cover');
                }

                const details = card.querySelector('.anime-details');
                if (details) {
                    details.classList.remove('ml-3', 'md:ml-4', 'flex-1');
                    details.classList.add('mt-2', 'md:mt-3');
                }
            } else {
                card.classList.remove('flex-col');
                card.classList.add('flex-row');

                const img = card.querySelector('img');
                if (img) {
                    img.classList.remove('w-full', 'h-36', 'md:h-48');
                    img.classList.add('w-24', 'md:w-32', 'h-24', 'md:h-32', 'rounded-lg');
                }

                const details = card.querySelector('.anime-details');
                if (details) {
                    details.classList.remove('mt-2', 'md:mt-3');
                    details.classList.add('ml-3', 'md:ml-4', 'flex-1');
                }
            }
        });
    }

    async loadInitialData() {
        try {
            // Load filter options
            await this.loadFilterOptions();

            // Load initial results if there's a search query in URL
            const urlParams = new URLSearchParams(window.location.search);
            const searchQuery = urlParams.get('q');

            if (searchQuery) {
                document.getElementById('search-input').value = searchQuery;
                this.currentFilters.q = searchQuery;
                this.performSearch();
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    async loadFilterOptions() {
        try {
            // Fetch data to extract filter options
            const response = await fetch(`${this.baseUrl}?blogID=${this.blogID}&page=animeinfo`);
            const data = await response.json();

            if (data.status === 200) {
                this.extractFilterOptions(data.response.feedCategories);
            }
        } catch (error) {
            console.error('Error loading filter options:', error);
        }
    }

    extractFilterOptions(categories) {
        const genres = new Set();
        const statuses = new Set();
        const types = new Set();

        categories.forEach(category => {
            // Extract genres (non-tagged values)
            if (!category.includes(':') && !['scheduled:true', 'scheduled:false'].includes(category)) {
                genres.add(category);
            }

            // Extract statuses
            if (category.startsWith('status:')) {
                statuses.add(category.split(':')[1]);
            }

            // Extract types
            if (category.startsWith('type:')) {
                types.add(category.split(':')[1]);
            }
        });

        // Populate genre filter
        const genreFilter = document.getElementById('genre-filter');
        Array.from(genres).sort().forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            genreFilter.appendChild(option);
        });

        // Populate status filter
        const statusFilter = document.getElementById('status-filter');
        Array.from(statuses).sort().forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            statusFilter.appendChild(option);
        });

        // Populate type filter
        const typeFilter = document.getElementById('type-filter');
        Array.from(types).sort().forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            typeFilter.appendChild(option);
        });
    }

    async performSearch() {
        const searchInput = document.getElementById('search-input').value.trim();
        this.currentFilters.q = searchInput;
        this.currentPage = 1;

        // Update URL with search query
        const url = new URL(window.location);
        if (searchInput) {
            url.searchParams.set('q', searchInput);
        } else {
            url.searchParams.delete('q');
        }
        window.history.pushState({}, '', url);

        await this.executeSearch();
    }

    async applyFilters() {
        const genre = document.getElementById('genre-filter').value;
        const status = document.getElementById('status-filter').value;
        const type = document.getElementById('type-filter').value;

        this.currentFilters.genre = genre;
        this.currentFilters.status = status;
        this.currentFilters.type = type;
        this.currentPage = 1;

        await this.executeSearch();
    }

    async executeSearch() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoadingState();

        try {
            // Build query parameters
            const params = new URLSearchParams({
                blogID: this.blogID,
                page: 'animeinfo'
            });

            // Add search query if exists
            if (this.currentFilters.q) {
                params.append('q', this.currentFilters.q);
            }

            // Add filters if selected
            if (this.currentFilters.genre) {
                params.append('genre', this.currentFilters.genre);
            }

            if (this.currentFilters.status) {
                params.append('status', this.currentFilters.status);
            }

            if (this.currentFilters.type) {
                params.append('type', this.currentFilters.type);
            }

            // Add page number
            params.append('page', this.currentPage);

            // Make API request
            const response = await fetch(`${this.baseUrl}?${params.toString()}`);
            const data = await response.json();

            if (data.status === 200) {
                this.displayResults(data.response);
            } else {
                throw new Error('Failed to fetch search results');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showErrorState();
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    displayResults(data) {
        const resultsContainer = document.getElementById('search-results');
        const resultsInfo = document.getElementById('results-info');
        const noResults = document.getElementById('no-results');
        const loadMoreContainer = document.getElementById('load-more-container');

        // Clear previous results if it's a new search
        if (this.currentPage === 1) {
            resultsContainer.innerHTML = '';
        }

        // Show/hide no results message
        if (data.entries.length === 0 && this.currentPage === 1) {
            noResults.classList.remove('hidden');
            resultsInfo.classList.add('hidden');
            loadMoreContainer.classList.add('hidden');
            return;
        } else {
            noResults.classList.add('hidden');
            resultsInfo.classList.remove('hidden');
        }

        // Update results info
        const resultCount = data.entries.length;
        resultsInfo.querySelector('p').textContent =
            `Menampilkan ${this.currentPage === 1 ? resultCount : resultsContainer.children.length + resultCount} hasil`;

        // Process and display entries
        data.entries.forEach(entry => {
            const animeCard = this.createAnimeCard(entry);
            resultsContainer.appendChild(animeCard);
        });

        // Update view for new items
        this.updateResultsView();

        // Show/hide load more button
        this.hasMore = data.entries.length >= 10; // Assuming 10 items per page
        if (this.hasMore) {
            loadMoreContainer.classList.remove('hidden');
        } else {
            loadMoreContainer.classList.add('hidden');
        }
    }

    createAnimeCard(entry) {
        const card = document.createElement('div');
        card.className = 'anime-card glass rounded-lg overflow-hidden hover:shadow-lg transition-transform duration-300 hover:-translate-y-1 flex flex-col';

        // Extract image URL from content
        let imageUrl = '';
        const imgMatch = entry.content.match(/src="([^"]*)"/);
        if (imgMatch && imgMatch[1]) {
            imageUrl = imgMatch[1];
        }

        // Extract genres from categories
        const genres = entry.categories.filter(cat =>
            !cat.includes(':') && !['scheduled:true', 'scheduled:false', 'page:animeinfo'].includes(cat)
        );

        // Extract rating if available
        const rating = entry.categories.find(cat => cat.startsWith('rate:'));
        const ratingValue = rating ? rating.split(':')[1] : null;

        // Extract status and type
        const status = entry.categories.find(cat => cat.startsWith('status:'));
        const type = entry.categories.find(cat => cat.startsWith('type:'));

        card.innerHTML = `
            <a href="${entry.path}" class="flex flex-col h-full">
                <div class="relative">
                    ${imageUrl ? `
                        <img src="${imageUrl}" alt="${entry.title}" 
                            class="w-full h-36 md:h-48 object-cover">
                    ` : `
                        <div class="w-full h-36 md:h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <i class="fas fa-image text-2xl md:text-3xl text-gray-400"></i>
                        </div>
                    `}
                    
                    ${ratingValue ? `
                        <div class="absolute top-2 right-2 bg-primary-600 text-white text-xs md:text-sm font-bold px-2 py-1 rounded">
                            ⭐ ${ratingValue}
                        </div>
                    ` : ''}
                </div>
                
                <div class="anime-details p-2 md:p-3 flex-1 flex flex-col">
                    <h3 class="font-semibold text-sm md:text-base mb-1 md:mb-2 line-clamp-2">${entry.title}</h3>
                    
                    <div class="flex items-center text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2 md:mb-3">
                        <i class="far fa-clock mr-1"></i>
                        <span>${entry.published.relative}</span>
                    </div>
                    
                    ${status || type ? `
                        <div class="flex flex-wrap gap-1 md:gap-2 mb-2 md:mb-3">
                            ${status ? `
                                <span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                                    ${status.split(':')[1]}
                                </span>
                            ` : ''}
                            ${type ? `
                                <span class="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs px-2 py-1 rounded-full">
                                    ${type.split(':')[1]}
                                </span>
                            ` : ''}
                        </div>
                    ` : ''}
                    
                    ${genres.length > 0 ? `
                        <div class="mt-auto flex flex-wrap gap-1 md:gap-2">
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
            </a>
        `;

        return card;
    }

    async loadMoreResults() {
        if (this.isLoading || !this.hasMore) return;

        this.currentPage++;
        await this.executeSearch();
    }

    showLoadingState() {
        document.getElementById('loading-skeleton').classList.remove('hidden');
        document.getElementById('search-results').classList.add('hidden');
        document.getElementById('load-more-container').classList.add('hidden');
    }

    hideLoadingState() {
        document.getElementById('loading-skeleton').classList.add('hidden');
        document.getElementById('search-results').classList.remove('hidden');

        if (this.hasMore) {
            document.getElementById('load-more-container').classList.remove('hidden');
        }
    }

    showErrorState() {
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = `
            <div class="col-span-full text-center py-8 md:py-12">
                <i class="fas fa-exclamation-triangle text-3xl md:text-4xl text-yellow-500 mb-3 md:mb-4"></i>
                <h3 class="text-lg md:text-xl font-medium text-gray-600 dark:text-gray-400">Terjadi kesalahan</h3>
                <p class="text-xs md:text-sm text-gray-500 dark:text-gray-500 mt-1 md:mt-2">Gagal memuat hasil pencarian. Silakan coba lagi.</p>
                <button id="retry-search" class="mt-3 md:mt-4 px-3 md:px-4 py-1 md:py-2 text-sm md:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    Coba Lagi
                </button>
            </div>
        `;

        document.getElementById('retry-search').addEventListener('click', () => {
            this.executeSearch();
        });
    }
}

new SearchApp();
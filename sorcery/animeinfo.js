/**
 * AnimeInfo Class - Fetches and displays anime information from various APIs
 * 
 * @copyright 2023 Paukuman
 * @author Paukuman
 * @version 1.0.0
 * 
 * @class
 * @classdesc This class handles fetching anime data from MAL/Jikan API and custom backend,
 * then renders it in a responsive layout with anime details, episodes, characters, etc.
 * 
 * @property {string} blogID - Blog identifier from meta tag
 * @property {string} postID - Post identifier from meta tag
 * @property {string|null} malID - MyAnimeList ID extracted from categories
 * @property {Object|null} animeData - Main anime information
 * @property {Array|null} characterData - Character data from MAL
 * @property {Array|null} episodeData - Episode list from custom API
 * @property {Array|null} picturesData - Anime pictures for backdrop
 * @property {HTMLElement} container - DOM container for rendering
 */
class AnimeInfo {
    /**
     * Constructor - Initializes the AnimeInfo instance
     * @constructor
     */
    constructor() {
        this.blogID = document.querySelector('meta[name="blogID"]').content;
        this.postID = document.querySelector('meta[name="postID"]').content;
        this.malID = null;
        this.animeData = null;
        this.characterData = null;
        this.episodeData = null;
        this.picturesData = null;
        this.container = document.getElementById('animeinfo-container');
        this.init();
    }

    /**
     * Initializes the anime info fetching and rendering process
     * @async
     */
    async init() {
        try {
            await this.fetchAnimeInfo();

            // Second protection: Check if this is an animeinfo page
            const pageType = this.animeData.categories?.find(cat => cat.startsWith('page:'))?.split(':')[1];
            if (pageType !== 'animeinfo') {
                console.log('Not an animeinfo page - script not executed');
                return;
            }

            this.extractMalID();

            if (!this.malID) {
                throw new Error('MAL ID not found in anime info');
            }

            await this.fetchJikanAnimeData();
            await this.fetchCharacterData();
            await this.fetchEpisodeData();
            await this.fetchPicturesData();

            this.render();
            this.setupBackdrop();

        } catch (error) {
            console.error('Error initializing AnimeInfo:', error);
            this.showError('Failed to load anime information. Please try again later.');
        }
    }

    /**
     * Fetches anime pictures data from Jikan API for backdrop
     * @async
     */
    async fetchPicturesData() {
        try {
            const response = await fetch(`https://api.jikan.moe/v4/anime/${this.malID}/pictures`);
            if (!response.ok) throw new Error('Pictures API response was not ok');

            const data = await response.json();
            this.picturesData = data.data || [];
        } catch (error) {
            console.error('Error fetching pictures data:', error);
            this.picturesData = [];
        }
    }

    /**
     * Sets up the anime backdrop image from pictures data
     */
    setupBackdrop() {
        const backdropContainer = document.querySelector('.backdrop-image');
        if (!backdropContainer) return;

        if (this.picturesData && this.picturesData.length > 0) {
            const randomImage = this.picturesData[Math.floor(Math.random() * this.picturesData.length)];
            const imageUrl = randomImage.jpg?.large_image_url || randomImage.jpg?.image_url;

            if (imageUrl) {
                backdropContainer.className = 'backdrop-image w-full h-full';
                backdropContainer.style.background = `
          linear-gradient(to bottom right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3)),
          url('${imageUrl}')
        `;
                backdropContainer.style.backgroundSize = 'cover';
                backdropContainer.style.backgroundPosition = 'center';
                backdropContainer.style.backgroundRepeat = 'no-repeat';
                backdropContainer.innerHTML = '';
            }
        }
    }

    /**
     * Fetches basic anime info from custom API
     * @async
     * @throws {Error} When network response is not ok or API returns error status
     */
    async fetchAnimeInfo() {
        try {
            const response = await fetch(`https://mangadb.paukuman.workers.dev/anime?blogID=${this.blogID}&postID=${this.postID}`);
            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            if (data.status !== 200) throw new Error('API returned non-success status');

            this.animeData = data.response.entry;
        } catch (error) {
            console.error('Error fetching anime info:', error);
            throw error;
        }
    }

    /**
     * Extracts MAL ID from anime categories
     */
    extractMalID() {
        try {
            const malCategory = this.animeData.categories.find(cat => cat.startsWith('mal_id:'));
            if (malCategory) {
                this.malID = malCategory.split(':')[1];
            }
        } catch (error) {
            console.error('Error extracting MAL ID:', error);
            throw error;
        }
    }

    /**
     * Fetches detailed anime data from Jikan API
     * @async
     * @throws {Error} When Jikan API response is not ok or no data returned
     */
    async fetchJikanAnimeData() {
        try {
            const response = await fetch(`https://api.jikan.moe/v4/anime/${this.malID}/full`);
            if (!response.ok) throw new Error('Jikan API response was not ok');

            const data = await response.json();
            if (!data.data) throw new Error('No data returned from Jikan API');

            this.animeData = { ...this.animeData, ...data.data };
        } catch (error) {
            console.error('Error fetching Jikan anime data:', error);
            throw error;
        }
    }

    /**
     * Fetches character data from Jikan API
     * @async
     */
    async fetchCharacterData() {
        try {
            const response = await fetch(`https://api.jikan.moe/v4/anime/${this.malID}/characters`);
            if (!response.ok) throw new Error('Jikan characters API response was not ok');

            const data = await response.json();
            this.characterData = data.data || [];
        } catch (error) {
            console.error('Error fetching character data:', error);
            this.characterData = [];
        }
    }

    /**
     * Fetches episode data from custom API
     * @async
     */
    async fetchEpisodeData() {
        try {
            const response = await fetch(`https://mangadb.paukuman.workers.dev/anime?blogID=${this.blogID}&mal_id=${this.malID}&page=episode`);
            if (!response.ok) throw new Error('Episode API response was not ok');

            const data = await response.json();
            this.episodeData = data.entries || [];
        } catch (error) {
            console.error('Error fetching episode data:', error);
            this.episodeData = [];
        }
    }

    /**
     * Displays error message in the container
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.container.innerHTML = `
      <div class="glass rounded-xl p-6 text-red-500">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        ${message}
      </div>
    `;
    }

    /**
     * Renders all anime information sections
     */
    render() {
        this.container.innerHTML = `
      ${this.renderHeader()}
      ${this.renderSynopsis()}
      ${this.renderEpisodes()}
      ${this.renderCharacters()}
    `;
    }

    /**
     * Renders the anime header section with poster and basic info
     * @returns {string} HTML string for the header section
     */
    renderHeader() {
        const englishTitle = this.animeData.title_english || this.animeData.title;
        const japaneseTitle = this.animeData.title_japanese || '';
        const imageUrl = this.animeData.images?.jpg?.large_image_url || 'https://via.placeholder.com/300x400';
        const score = this.animeData.score || this.extractScoreFromCategories();
        const rank = this.animeData.rank ? `Rank #${this.animeData.rank}` : '';
        const members = this.animeData.members ? `${this.formatNumber(this.animeData.members)} Members` : '';
        const favorites = this.animeData.favorites ? `${this.formatNumber(this.animeData.favorites)} Favorites` : '';
        const type = this.animeData.type || '';
        const airedDate = this.animeData.aired?.string || '';
        const duration = this.animeData.duration || '';
        const genres = this.animeData.genres?.map(genre => genre.name) || [];

        return `
      <div class="glass rounded-xl p-6">
        <!-- Mobile layout -->
        <div class="md:hidden mobile-poster-row">
          <div class="mobile-poster">
            <div class="anime-poster w-full bg-gradient-to-br from-gray-400 to-gray-600 overflow-hidden">
              <img src="${imageUrl}" alt="${englishTitle}" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/300x400'">
            </div>
          </div>
          <div class="mobile-title">
            <h1 class="text-2xl font-bold text-primary-700 dark:text-primary-400">${englishTitle}</h1>
            ${japaneseTitle ? `<h2 class="text-lg text-gray-600 dark:text-gray-400">${japaneseTitle}</h2>` : ''}
          </div>
        </div>

        <!-- Desktop layout -->
        <div class="hidden md:flex gap-6">
          <div class="w-48 flex-shrink-0">
            <div class="anime-poster w-full bg-gradient-to-br from-gray-400 to-gray-600 overflow-hidden">
              <img src="${imageUrl}" alt="${englishTitle}" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/300x400'">
            </div>
          </div>

          <div class="flex-1">
            <h1 class="text-3xl font-bold text-primary-700 dark:text-primary-400">${englishTitle}</h1>
            ${japaneseTitle ? `<h2 class="text-xl text-gray-600 dark:text-gray-400 mb-4">${japaneseTitle}</h2>` : ''}

            <div class="flex flex-wrap items-center gap-4 mb-4">
              ${score ? `
              <div class="progress-circle">
                <span class="font-bold text-lg">${score}</span>
              </div>
              ` : ''}

              <div class="space-y-1">
                ${rank ? `
                <div class="flex items-center text-sm">
                  <i class="fas fa-star text-yellow-500 mr-1"></i>
                  <span>${rank}</span>
                </div>
                ` : ''}
                ${members ? `
                <div class="flex items-center text-sm">
                  <i class="fas fa-users mr-1"></i>
                  <span>${members}</span>
                </div>
                ` : ''}
                ${favorites ? `
                <div class="flex items-center text-sm">
                  <i class="fas fa-heart text-red-500 mr-1"></i>
                  <span>${favorites}</span>
                </div>
                ` : ''}
              </div>

              <div class="space-y-1">
                ${type ? `
                <div class="flex items-center text-sm">
                  <i class="fas fa-tv mr-1"></i>
                  <span>${type}</span>
                </div>
                ` : ''}
                ${airedDate ? `
                <div class="flex items-center text-sm">
                  <i class="fas fa-calendar-alt mr-1"></i>
                  <span>${airedDate}</span>
                </div>
                ` : ''}
                ${duration ? `
                <div class="flex items-center text-sm">
                  <i class="fas fa-clock mr-1"></i>
                  <span>${duration}</span>
                </div>
                ` : ''}
              </div>
            </div>

            ${genres.length > 0 ? `
            <div class="mb-4">
              ${genres.map(genre => `
                <span class="genre-tag bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">${genre}</span>
              `).join('')}
            </div>
            ` : ''}

            <div class="flex flex-wrap gap-2">
              <button class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                <i class="fas fa-plus mr-2"></i>Add to List
              </button>
              <button class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                <i class="fas fa-play mr-2"></i>Watch Now
              </button>
              <button class="p-2 bg-primary-200 dark:bg-primary-800 rounded-lg hover:bg-primary-300 dark:hover:bg-primary-700 transition-colors">
                <i class="fas fa-share-alt"></i>
              </button>
              <button class="p-2 bg-primary-200 dark:bg-primary-800 rounded-lg hover:bg-primary-300 dark:hover:bg-primary-700 transition-colors">
                <i class="fas fa-bookmark"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile description -->
        <div class="mt-4 md:hidden">
          ${genres.length > 0 ? `
          <div class="mb-4">
            ${genres.slice(0, 4).map(genre => `
              <span class="genre-tag bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">${genre}</span>
            `).join('')}
          </div>
          ` : ''}
          ${this.animeData.synopsis ? `
          <p class="text-gray-700 dark:text-gray-300 text-sm">
            ${this.truncateSynopsis(this.animeData.synopsis, 200)}
          </p>
          ` : ''}
          <div class="flex gap-2 mt-3">
            <button class="flex-1 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm">
              <i class="fas fa-play mr-1"></i>Watch
            </button>
            <button class="p-2 bg-primary-200 dark:bg-primary-800 rounded-lg hover:bg-primary-300 dark:hover:bg-primary-700 transition-colors">
              <i class="fas fa-plus"></i>
            </button>
            <button class="p-2 bg-primary-200 dark:bg-primary-800 rounded-lg hover:bg-primary-300 dark:hover:bg-primary-700 transition-colors">
              <i class="fas fa-bookmark"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    }

    /**
     * Renders the anime synopsis section
     * @returns {string} HTML string for the synopsis section
     */
    renderSynopsis() {
        if (!this.animeData.synopsis) return '';

        return `
      <div class="glass rounded-xl p-6">
        <h2 class="text-xl font-bold mb-4 text-primary-700 dark:text-primary-400">Synopsis</h2>
        <p class="text-gray-700 dark:text-gray-300">
          ${this.animeData.synopsis}
        </p>
      </div>
    `;
    }

    /**
     * Renders the episodes section
     * @returns {string} HTML string for the episodes section
     */
    renderEpisodes() {
        if (!this.episodeData || this.episodeData.length === 0) return '';

        return `
      <div class="glass rounded-xl p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-primary-700 dark:text-primary-400">Episodes</h2>
          <div class="flex items-center space-x-2">
            <span class="text-sm">Season ${this.extractSeasonFromCategories() || '1'}</span>
            <button class="p-2 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors">
              <i class="fas fa-chevron-down"></i>
            </button>
          </div>
        </div>

        <div class="space-y-4">
          ${this.episodeData.map(episode => this.renderEpisodeItem(episode)).join('')}
        </div>

        ${this.episodeData.length > 2 ? `
        <div class="mt-4 text-center">
          <button class="px-4 py-2 bg-primary-200 dark:bg-primary-800 rounded-lg hover:bg-primary-300 dark:hover:bg-primary-700 transition-colors">
            Load More Episodes
          </button>
        </div>
        ` : ''}
      </div>
    `;
    }

    /**
     * Renders a single episode item
     * @param {Object} episode - Episode data object
     * @returns {string} HTML string for an episode item
     */
    renderEpisodeItem(episode) {
        const episodeNumber = this.extractEpisodeNumber(episode.categories);
        const quality = this.extractQuality(episode.categories);
        const resolution = this.extractResolution(episode.categories);
        const date = episode.published?.relative || episode.published?.default || '';

        let imageUrl = 'https://via.placeholder.com/300x200';
        const imgMatch = episode.content.match(/src="([^"]+)"/);
        if (imgMatch && imgMatch[1]) {
            imageUrl = imgMatch[1];
        }

        return `
      <div class="flex flex-col md:flex-row gap-4 p-4 hover:bg-primary-50 dark:hover:bg-primary-800 rounded-lg transition-colors">
        <div class="w-full md:w-48 flex-shrink-0">
          <div class="episode-thumbnail w-full h-full overflow-hidden rounded-lg">
            <img src="${imageUrl}" alt="${episode.title}" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/300x200'">
          </div>
        </div>
        <div class="flex-1">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-medium">${episode.title}</h3>
              <div class="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                ${episodeNumber ? `<span class="mr-3">Ep ${episodeNumber}</span>` : ''}
                <span class="mr-3"><i class="fas fa-clock mr-1"></i>24m</span>
                ${date ? `<span>${date}</span>` : ''}
              </div>
            </div>
            <div class="flex items-center">
              ${quality ? `<span class="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded mr-2">${quality}</span>` : ''}
              ${resolution ? `<span class="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">${resolution}</span>` : ''}
            </div>
          </div>
          ${episode.content ? `
          <p class="text-gray-600 dark:text-gray-400 mt-2">
            ${this.extractTextFromContent(episode.content)}
          </p>
          ` : ''}
        </div>
      </div>
    `;
    }

    /**
     * Renders the characters section
     * @returns {string} HTML string for the characters section
     */
    renderCharacters() {
        if (!this.characterData || this.characterData.length === 0) return '';

        const mainCharacters = this.characterData
            .filter(char => char.role === 'Main')
            .slice(0, 6);

        if (mainCharacters.length === 0) return '';

        return `
      <div class="glass rounded-xl p-6">
        <h2 class="text-xl font-bold mb-4 text-primary-700 dark:text-primary-400">Characters &amp; Cast</h2>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          ${mainCharacters.map(character => this.renderCharacterItem(character)).join('')}
        </div>

        ${this.characterData.length > 6 ? `
        <div class="mt-4 text-center">
          <button class="px-4 py-2 bg-primary-200 dark:bg-primary-800 rounded-lg hover:bg-primary-300 dark:hover:bg-primary-700 transition-colors">
            View All Characters
          </button>
        </div>
        ` : ''}
      </div>
    `;
    }

    /**
     * Renders a single character item
     * @param {Object} character - Character data object
     * @returns {string} HTML string for a character item
     */
    renderCharacterItem(character) {
        const charImage = character.character.images?.jpg?.image_url || 'https://via.placeholder.com/150';
        const seiyuu = character.voice_actors?.find(va => va.language === 'Japanese');

        return `
      <div class="text-center">
        <div class="cast-card w-full h-48 bg-gradient-to-br from-gray-400 to-gray-600 mb-2 overflow-hidden rounded-lg">
          <img src="${charImage}" alt="${character.character.name}" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/150'">
        </div>
        <h3 class="font-medium">${character.character.name}</h3>
        ${seiyuu ? `<p class="text-sm text-gray-600 dark:text-gray-400">${seiyuu.person.name}</p>` : ''}
      </div>
    `;
    }

    // Helper methods

    /**
     * Extracts score from anime categories
     * @returns {string|null} Score value or null if not found
     */
    extractScoreFromCategories() {
        const scoreCat = this.animeData.categories?.find(cat => cat.startsWith('rate:'));
        return scoreCat ? scoreCat.split(':')[1] : null;
    }

    /**
     * Extracts season number from anime categories
     * @returns {string|null} Season number or null if not found
     */
    extractSeasonFromCategories() {
        const seasonCat = this.animeData.categories?.find(cat => cat.startsWith('season:'));
        return seasonCat ? seasonCat.split(':')[1] : null;
    }

    /**
     * Extracts episode number from episode categories
     * @param {Array} categories - Episode categories array
     * @returns {string|null} Episode number or null if not found
     */
    extractEpisodeNumber(categories) {
        const epCat = categories?.find(cat => cat.startsWith('episode:'));
        return epCat ? epCat.split(':')[1] : null;
    }

    /**
     * Extracts quality from episode categories
     * @param {Array} categories - Episode categories array
     * @returns {string|null} Quality value or null if not found
     */
    extractQuality(categories) {
        const qualityCat = categories?.find(cat => cat.startsWith('quality:'));
        return qualityCat ? qualityCat.split(':')[1] : null;
    }

    /**
     * Extracts resolution from episode categories
     * @param {Array} categories - Episode categories array
     * @returns {string|null} Resolution value or null if not found
     */
    extractResolution(categories) {
        const resCat = categories?.find(cat => cat.startsWith('resolution:'));
        return resCat ? resCat.split(':')[1].replace(/\|/g, ', ') : null;
    }

    /**
     * Extracts text content from HTML string
     * @param {string} content - HTML content string
     * @returns {string} Plain text content
     */
    extractTextFromContent(content) {
        const div = document.createElement('div');
        div.innerHTML = content;
        return div.textContent || div.innerText || '';
    }

    /**
     * Truncates synopsis text to specified length
     * @param {string} text - Synopsis text
     * @param {number} length - Maximum length before truncation
     * @returns {string} Truncated text with ellipsis if needed
     */
    truncateSynopsis(text, length) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }

    /**
     * Formats number with commas
     * @param {number} num - Number to format
     * @returns {string} Formatted number string
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

if (document.getElementById('animeinfo-container')) {
    new AnimeInfo();
}

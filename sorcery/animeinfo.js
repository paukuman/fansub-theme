/**
 * AnimeInfo Class - Fetches and displays anime information from various APIs
 * 
 * @copyright 2023 Paukuman
 * @author Paukuman
 * @version 2.0.0
 * 
 * @class
 * @classdesc This class handles fetching anime data from MAL/Jikan API and custom backend,
 * then renders it in a responsive layout with anime details, episodes, characters, etc.
 */
class AnimeInfo {
    constructor() {
        this.meta = {
            blogID: document.querySelector('meta[name="blogID"]')?.content,
            postID: document.querySelector('meta[name="postID"]')?.content
        };
        this.data = {
            malID: null,
            anime: null,
            characters: null,
            episodes: null,
            pictures: null
        };
        this.selectors = {
            container: '#animeinfo-container',
            backdrop: '.backdrop-image'
        };
        this.defaults = {
            image: {
                poster: 'https://via.placeholder.com/300x400',
                episode: 'https://via.placeholder.com/300x200',
                character: 'https://via.placeholder.com/150'
            },
            truncateLength: 200
        };
        this.init();
    }

    // Core methods
    async init() {
        try {
            if (!this.validateRequirements()) return;
            
            this.showSkeleton();
            await this.fetchAllData();
            
            if (!this.isAnimeInfoPage()) {
                this.removeContainer();
                return;
            }

            this.render();
            this.setupBackdrop();
        } catch (error) {
            console.error('AnimeInfo initialization error:', error);
            this.showError('Failed to load anime information. Please try again later.');
        }
    }

    validateRequirements() {
        if (!this.meta.blogID || !this.meta.postID) {
            console.error('Missing required meta tags');
            return false;
        }
        if (!document.querySelector(this.selectors.container)) {
            console.error('Container element not found');
            return false;
        }
        return true;
    }

    async fetchAllData() {
        await this.fetchAnimeInfo();
        this.extractMalID();
        
        if (!this.data.malID) {
            throw new Error('MAL ID not found');
        }

        await Promise.all([
            this.fetchJikanData(),
            this.fetchCharacters(),
            this.fetchEpisodes(),
            this.fetchPictures()
        ]);
    }

    // Data fetching methods
    async fetchAnimeInfo() {
        const url = `https://mangadb.paukuman.workers.dev/anime?blogID=${this.meta.blogID}&postID=${this.meta.postID}`;
        const response = await this.fetchData(url);
        this.data.anime = response?.entry || null;
    }

    async fetchJikanData() {
        const url = `https://api.jikan.moe/v4/anime/${this.data.malID}/full`;
        const response = await this.fetchData(url);
        this.data.anime = { ...this.data.anime, ...response?.data };
    }

    async fetchCharacters() {
        const url = `https://api.jikan.moe/v4/anime/${this.data.malID}/characters`;
        const response = await this.fetchData(url);
        this.data.characters = response?.data || [];
    }

    async fetchEpisodes() {
        const url = `https://mangadb.paukuman.workers.dev/anime?blogID=${this.meta.blogID}&mal_id=${this.data.malID}&page=episode`;
        const response = await this.fetchData(url);
        this.data.episodes = response?.entries || [];
    }

    async fetchPictures() {
        const url = `https://api.jikan.moe/v4/anime/${this.data.malID}/pictures`;
        const response = await this.fetchData(url);
        this.data.pictures = response?.data || [];
    }

    async fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Fetch error for ${url}:`, error);
            return null;
        }
    }

    // Data processing methods
    extractMalID() {
        const malCategory = this.data.anime?.categories?.find(cat => cat.startsWith('mal_id:'));
        this.data.malID = malCategory?.split(':')[1] || null;
    }

    isAnimeInfoPage() {
        const pageType = this.data.anime?.categories?.find(cat => cat.startsWith('page:'))?.split(':')[1];
        return pageType === 'animeinfo';
    }

    extractFromCategories(categories, prefix) {
        if (!categories) return null;
        const category = Array.isArray(categories) 
            ? categories.find(cat => cat.startsWith(prefix))
            : categories;
        return category?.split(':')[1] || null;
    }

    // Rendering methods
    showSkeleton() {
        const container = document.querySelector(this.selectors.container);
        if (container) {
            container.innerHTML = this.renderSkeleton();
        }
    }

    showError(message) {
        const container = document.querySelector(this.selectors.container);
        if (container) {
            container.innerHTML = `
                <div class="glass rounded-xl p-6 text-red-500">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    ${message}
                </div>
            `;
        }
    }

    removeContainer() {
        const container = document.querySelector(this.selectors.container);
        if (container) container.remove();
    }

    render() {
        const container = document.querySelector(this.selectors.container);
        if (container) {
            container.innerHTML = `
                ${this.renderHeader()}
                ${this.renderSynopsis()}
                ${this.renderEpisodes()}
                ${this.renderCharacters()}
            `;
        }
    }

    setupBackdrop() {
        const backdrop = document.querySelector(this.selectors.backdrop);
        if (!backdrop || !this.data.pictures?.length) return;

        const randomImage = this.getRandomImage();
        if (randomImage) {
            backdrop.className = 'backdrop-image w-full h-full';
            backdrop.style.background = `
                linear-gradient(to bottom right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3)),
                url('${randomImage}')
            `;
            backdrop.style.backgroundSize = 'cover';
            backdrop.style.backgroundPosition = 'center';
            backdrop.style.backgroundRepeat = 'no-repeat';
            backdrop.innerHTML = '';
        }
    }

    getRandomImage() {
        const randomImage = this.data.pictures[Math.floor(Math.random() * this.data.pictures.length)];
        return randomImage.jpg?.large_image_url || randomImage.jpg?.image_url;
    }

    // Component rendering methods
    renderHeader() {
        const anime = this.data.anime;
        if (!anime) return '';

        const {
            title_english: englishTitle = anime.title,
            title_japanese: japaneseTitle = '',
            images,
            score = this.extractFromCategories(anime.categories, 'rate'),
            rank = null,
            members = null,
            favorites = null,
            type = '',
            aired = {},
            duration = '',
            genres = [],
            synopsis = ''
        } = anime;

        const imageUrl = images?.jpg?.large_image_url || this.defaults.image.poster;
        const airedDate = aired?.string || '';
        const genreList = genres.map(genre => genre.name) || [];

        return `
            <div class="glass rounded-xl p-6">
                <!-- Mobile layout -->
                <div class="md:hidden mobile-poster-row">
                    ${this.renderPoster(imageUrl, englishTitle, 'w-24 h-32')}
                    <div class="mobile-title">
                        <h1 class="text-2xl font-bold text-primary-700 dark:text-primary-400">${englishTitle}</h1>
                        ${japaneseTitle ? `<h2 class="text-lg text-gray-600 dark:text-gray-400">${japaneseTitle}</h2>` : ''}
                    </div>
                </div>

                <!-- Desktop layout -->
                <div class="hidden md:flex gap-6">
                    ${this.renderPoster(imageUrl, englishTitle, 'w-48 h-64')}
                    <div class="flex-1">
                        <h1 class="text-3xl font-bold text-primary-700 dark:text-primary-400">${englishTitle}</h1>
                        ${japaneseTitle ? `<h2 class="text-xl text-gray-600 dark:text-gray-400 mb-4">${japaneseTitle}</h2>` : ''}

                        ${this.renderScoreSection(score, rank, members, favorites)}
                        ${this.renderInfoSection(type, airedDate, duration)}
                        ${this.renderGenres(genreList)}
                        ${this.renderActionButtons()}
                    </div>
                </div>

                <!-- Mobile description -->
                <div class="mt-4 md:hidden">
                    ${this.renderGenres(genreList.slice(0, 4), true}
                    ${synopsis ? `<p class="text-gray-700 dark:text-gray-300 text-sm">${this.truncateText(synopsis, this.defaults.truncateLength)}</p>` : ''}
                    ${this.renderMobileActionButtons()}
                </div>
            </div>
        `;
    }

    renderPoster(src, alt, className = '') {
        return `
            <div class="${className} flex-shrink-0">
                <div class="anime-poster w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 overflow-hidden">
                    <img src="${src}" alt="${alt}" class="w-full h-full object-cover" 
                         onerror="this.src='${this.defaults.image.poster}'">
                </div>
            </div>
        `;
    }

    renderScoreSection(score, rank, members, favorites) {
        if (!score && !rank && !members && !favorites) return '';

        return `
            <div class="flex flex-wrap items-center gap-4 mb-4">
                ${score ? this.renderScoreCircle(score) : ''}
                <div class="space-y-1">
                    ${rank ? this.renderInfoItem('star', `Rank #${rank}`, 'yellow-500') : ''}
                    ${members ? this.renderInfoItem('users', `${this.formatNumber(members)} Members`) : ''}
                    ${favorites ? this.renderInfoItem('heart', `${this.formatNumber(favorites)} Favorites`, 'red-500') : ''}
                </div>
            </div>
        `;
    }

    renderScoreCircle(score) {
        return `
            <div class="progress-circle">
                <span class="font-bold text-lg">${score}</span>
            </div>
        `;
    }

    renderInfoSection(type, airedDate, duration) {
        if (!type && !airedDate && !duration) return '';

        return `
            <div class="space-y-1 mb-6">
                ${type ? this.renderInfoItem('tv', type) : ''}
                ${airedDate ? this.renderInfoItem('calendar-alt', airedDate) : ''}
                ${duration ? this.renderInfoItem('clock', duration) : ''}
            </div>
        `;
    }

    renderInfoItem(icon, text, iconColor = '') {
        const colorClass = iconColor ? `text-${iconColor}` : '';
        return `
            <div class="flex items-center text-sm">
                <i class="fas fa-${icon} mr-1 ${colorClass}"></i>
                <span>${text}</span>
            </div>
        `;
    }

    renderGenres(genres, isMobile = false) {
        if (!genres?.length) return '';

        return `
            <div class="${isMobile ? 'mb-4' : 'mb-6'}">
                ${genres.map(genre => `
                    <span class="genre-tag bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">${genre}</span>
                `).join('')}
            </div>
        `;
    }

    renderActionButtons() {
        return `
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
        `;
    }

    renderMobileActionButtons() {
        return `
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
        `;
    }

    renderSynopsis() {
        if (!this.data.anime?.synopsis) return '';

        return `
            <div class="glass rounded-xl p-6">
                <h2 class="text-xl font-bold mb-4 text-primary-700 dark:text-primary-400">Synopsis</h2>
                <p class="text-gray-700 dark:text-gray-300">
                    ${this.data.anime.synopsis}
                </p>
            </div>
        `;
    }

    renderEpisodes() {
        if (!this.data.episodes?.length) return '';

        const visibleEpisodes = this.data.episodes.slice(0, 3);
        const season = this.extractFromCategories(this.data.anime.categories, 'season') || '1';

        return `
            <div class="glass rounded-xl p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-primary-700 dark:text-primary-400">Episodes</h2>
                    <div class="flex items-center space-x-2">
                        <span class="text-sm">Season ${season}</span>
                        <button class="p-2 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors">
                            <i class="fas fa-chevron-down"></i>
                        </button>
                    </div>
                </div>

                <div class="space-y-4">
                    ${visibleEpisodes.map(episode => this.renderEpisode(episode)).join('')}
                </div>

                ${this.data.episodes.length > 3 ? this.renderLoadMoreButton('Load More Episodes') : ''}
            </div>
        `;
    }

    renderEpisode(episode) {
        const episodeNumber = this.extractFromCategories(episode.categories, 'episode');
        const quality = this.extractFromCategories(episode.categories, 'quality');
        const resolution = this.extractFromCategories(episode.categories, 'resolution')?.replace(/\|/g, ', ');
        const date = episode.published?.relative || episode.published?.default || '';
        const imageUrl = this.extractImageFromContent(episode.content) || this.defaults.image.episode;
        const contentText = episode.content ? this.extractTextFromContent(episode.content) : '';

        return `
            <div class="flex flex-col md:flex-row gap-4 p-4 hover:bg-primary-50 dark:hover:bg-primary-800 rounded-lg transition-colors">
                <div class="w-full md:w-48 flex-shrink-0">
                    <div class="episode-thumbnail w-full h-full overflow-hidden rounded-lg">
                        <img src="${imageUrl}" alt="${episode.title}" 
                             class="w-full h-full object-cover" 
                             onerror="this.src='${this.defaults.image.episode}'">
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
                            ${quality ? this.renderQualityBadge(quality, 'blue') : ''}
                            ${resolution ? this.renderQualityBadge(resolution, 'green') : ''}
                        </div>
                    </div>
                    ${contentText ? `<p class="text-gray-600 dark:text-gray-400 mt-2">${contentText}</p>` : ''}
                </div>
            </div>
        `;
    }

    renderQualityBadge(text, color) {
        return `
            <span class="text-sm bg-${color}-100 dark:bg-${color}-900 text-${color}-800 dark:text-${color}-200 px-2 py-1 rounded mr-2">
                ${text}
            </span>
        `;
    }

    renderCharacters() {
        const mainCharacters = this.data.characters
            ?.filter(char => char.role === 'Main')
            ?.slice(0, 6) || [];

        if (!mainCharacters.length) return '';

        return `
            <div class="glass rounded-xl p-6">
                <h2 class="text-xl font-bold mb-4 text-primary-700 dark:text-primary-400">Characters &amp; Cast</h2>

                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    ${mainCharacters.map(character => this.renderCharacter(character)).join('')}
                </div>

                ${this.data.characters.length > 6 ? this.renderLoadMoreButton('View All Characters') : ''}
            </div>
        `;
    }

    renderCharacter(character) {
        const charImage = character.character.images?.jpg?.image_url || this.defaults.image.character;
        const seiyuu = character.voice_actors?.find(va => va.language === 'Japanese');

        return `
            <div class="text-center">
                <div class="cast-card w-full h-48 bg-gradient-to-br from-gray-400 to-gray-600 mb-2 overflow-hidden rounded-lg">
                    <img src="${charImage}" alt="${character.character.name}" 
                         class="w-full h-full object-cover" 
                         onerror="this.src='${this.defaults.image.character}'">
                </div>
                <h3 class="font-medium">${character.character.name}</h3>
                ${seiyuu ? `<p class="text-sm text-gray-600 dark:text-gray-400">${seiyuu.person.name}</p>` : ''}
            </div>
        `;
    }

    renderLoadMoreButton(text) {
        return `
            <div class="mt-4 text-center">
                <button class="px-4 py-2 bg-primary-200 dark:bg-primary-800 rounded-lg hover:bg-primary-300 dark:hover:bg-primary-700 transition-colors">
                    ${text}
                </button>
            </div>
        `;
    }

    renderSkeleton() {
        return `
            <div class="space-y-6">
                ${this.renderHeaderSkeleton()}
                ${this.renderSynopsisSkeleton()}
                ${this.renderEpisodesSkeleton()}
                ${this.renderCharactersSkeleton()}
            </div>
        `;
    }

    renderHeaderSkeleton() {
        return `
            <div class="glass rounded-xl p-6">
                <!-- Mobile layout skeleton -->
                <div class="md:hidden">
                    <div class="flex gap-4">
                        <div class="w-24 h-32 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                        <div class="flex-1">
                            <div class="h-6 w-3/4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                            <div class="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                    </div>
                    <div class="mt-4 flex flex-wrap gap-2">
                        <div class="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
                        <div class="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
                        <div class="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
                    </div>
                    <div class="mt-3 h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div class="mt-2 h-4 w-5/6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div class="mt-4 flex gap-2">
                        <div class="flex-1 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                        <div class="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                        <div class="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                    </div>
                </div>

                <!-- Desktop layout skeleton -->
                <div class="hidden md:flex gap-6">
                    <div class="w-48 h-64 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                    <div class="flex-1">
                        <div class="h-8 w-3/4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
                        <div class="h-6 w-1/2 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-6"></div>
                        
                        <div class="flex items-center gap-4 mb-6">
                            <div class="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
                            <div class="space-y-2">
                                <div class="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div class="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div class="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                            </div>
                            <div class="space-y-2">
                                <div class="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div class="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div class="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                            </div>
                        </div>
                        
                        <div class="flex flex-wrap gap-2 mb-6">
                            <div class="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
                            <div class="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
                            <div class="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
                            <div class="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
                        </div>
                        
                        <div class="flex gap-2">
                            <div class="h-10 w-32 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                            <div class="h-10 w-32 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                            <div class="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                            <div class="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderSynopsisSkeleton() {
        return `
            <div class="glass rounded-xl p-6">
                <div class="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
                <div class="space-y-2">
                    <div class="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div class="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div class="h-4 w-5/6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div class="h-4 w-2/3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div class="h-4 w-3/4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
            </div>
        `;
    }

    renderEpisodesSkeleton() {
        return `
            <div class="glass rounded-xl p-6">
                <div class="flex justify-between items-center mb-4">
                    <div class="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div class="flex items-center gap-2">
                        <div class="h-4 w-16 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div class="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                    </div>
                </div>
                
                <div class="space-y-4">
                    ${Array(3).fill().map(() => `
                        <div class="flex flex-col md:flex-row gap-4 p-4">
                            <div class="w-full md:w-48 h-28 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                            <div class="flex-1 space-y-2">
                                <div class="h-5 w-3/4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div class="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div class="h-3 w-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div class="h-3 w-5/6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="mt-4 text-center">
                    <div class="inline-block h-10 w-40 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                </div>
            </div>
        `;
    }

    renderCharactersSkeleton() {
        return `
            <div class="glass rounded-xl p-6">
                <div class="h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
                
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    ${Array(6).fill().map(() => `
                        <div class="text-center">
                            <div class="w-full h-40 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse mb-2"></div>
                            <div class="h-4 w-3/4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
                            <div class="h-3 w-1/2 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mx-auto mt-1"></div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="mt-4 text-center">
                    <div class="inline-block h-10 w-48 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                </div>
            </div>
        `;
    }

    // Utility methods
    extractImageFromContent(content) {
        if (!content) return null;
        const imgMatch = content.match(/src="([^"]+)"/);
        return imgMatch?.[1] || null;
    }

    extractTextFromContent(content) {
        if (!content) return '';
        const div = document.createElement('div');
        div.innerHTML = content;
        return div.textContent || div.innerText || '';
    }

    truncateText(text, length) {
        if (!text || text.length <= length) return text;
        return text.substring(0, length) + '...';
    }

    formatNumber(num) {
        if (!num) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

// Initialize if container exists
    if (document.querySelector('#animeinfo-container')) {
        new AnimeInfo();
    }

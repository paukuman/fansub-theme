
// Utility Classes
class AnimeError extends Error {
  constructor(message, type = 'error') {
    super(message);
    this.type = type;
  }
}

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttl = 30 * 60 * 1000; // 30 minutes
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  set(key, value, ttl = this.ttl) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  }

  clear() {
    this.cache.clear();
  }
}

// Service Layer
class AnimeAPIService {
  constructor() {
    this.baseUrl = 'https://mangadb.paukuman.workers.dev/anime';
    this.jikanUrl = 'https://api.jikan.moe/v4/anime';
    this.cache = new CacheManager();
  }

  async fetchWithCache(url, cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new AnimeError(`API request failed with status ${response.status}`);
      }
      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw new AnimeError('Failed to fetch data. Please try again later.');
    }
  }

  async getEpisodeData(blogID, postID) {
    const url = `${this.baseUrl}?blogID=${blogID}&postID=${postID}`;
    return this.fetchWithCache(url, `episode-${blogID}-${postID}`);
  }

  async getEpisodesList(blogID, malId) {
    const url = `${this.baseUrl}?blogID=${blogID}&mal_id=${malId}&page=episode`;
    return this.fetchWithCache(url, `episodes-${blogID}-${malId}`);
  }

  async getAnimeInfo(blogID, malId) {
    const url = `${this.baseUrl}?blogID=${blogID}&mal_id=${malId}&page=animeinfo`;
    return this.fetchWithCache(url, `animeinfo-${blogID}-${malId}`);
  }

  async getJikanAnimeDetails(malId) {
    const url = `${this.jikanUrl}/${malId}/full`;
    return this.fetchWithCache(url, `jikan-${malId}`);
  }
}

// Data Models
class AnimeEpisode {
  constructor(data) {
    this.title = data.title;
    this.episodeNumber = this.extractEpisodeNumber(data.categories);
    this.malId = this.extractMalId(data.categories);
    this.content = data.content;
    this.path = data.path;
    this.published = data.published;
    this.updated = data.updated;
    this.streamList = this.parseStreamList(data.content);
    this.downloadList = this.parseDownloadList(data.content);
  }

  extractEpisodeNumber(categories) {
    const episodeCat = categories.find(cat => cat.startsWith('episode:'));
    return episodeCat ? episodeCat.split(':')[1] : null;
  }

  extractMalId(categories) {
    const malIdCat = categories.find(cat => cat.startsWith('mal_id:'));
    return malIdCat ? malIdCat.split(':')[1] : null;
  }

  parseStreamList(content) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const streamList = doc.querySelector('streamList');
    if (!streamList) return [];

    return Array.from(streamList.querySelectorAll('server')).map(server => {
      const name = server.querySelector('name')?.textContent || 'Unknown Server';
      const type = server.querySelector('type')?.textContent || 'embed/iframe';

      if (type === 'embed/iframe') {
        return {
          name,
          type,
          url: server.querySelector('url')?.textContent
        };
      } else {
        const qualities = Array.from(server.querySelectorAll('data qual')).map(qual => ({
          text: qual.querySelector('text')?.textContent || 'Unknown',
          url: qual.querySelector('url')?.textContent
        }));
        return {
          name,
          type,
          qualities
        };
      }
    });
  }

  parseDownloadList(content) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const downloadList = doc.querySelector('downloadList');
    if (!downloadList) return [];

    return Array.from(downloadList.querySelectorAll('download')).map(download => {
      const text = download.querySelector('text')?.textContent || 'Unknown Quality';
      const size = download.querySelector('size')?.textContent || 'N/A';
      const urls = Array.from(download.querySelectorAll('urls data')).map(data => ({
        name: data.querySelector('text')?.textContent || 'Unknown',
        url: data.querySelector('url')?.textContent
      }));

      return {
        quality: text,
        size,
        urls
      };
    });
  }
}

class AnimeSeries {
  constructor(data, jikanData) {
    this.title = data.title;
    this.malId = this.extractMalId(data.categories);
    this.categories = data.categories;
    this.jikanData = jikanData;
    this.rating = this.extractRating(data.categories);
    this.type = this.extractType(data.categories);
    this.status = this.extractStatus(data.categories);
    this.season = this.extractSeason(data.categories);
  }

  extractMalId(categories) {
    const malIdCat = categories.find(cat => cat.startsWith('mal_id:'));
    return malIdCat ? malIdCat.split(':')[1] : null;
  }

  extractRating(categories) {
    const ratingCat = categories.find(cat => cat.startsWith('rate:'));
    return ratingCat ? ratingCat.split(':')[1] : null;
  }

  extractType(categories) {
    const typeCat = categories.find(cat => cat.startsWith('type:'));
    return typeCat ? typeCat.split(':')[1] : null;
  }

  extractStatus(categories) {
    const statusCat = categories.find(cat => cat.startsWith('status:'));
    return statusCat ? statusCat.split(':')[1] : null;
  }

  extractSeason(categories) {
    const seasonCat = categories.find(cat => cat.startsWith('season:'));
    return seasonCat ? seasonCat.split(':')[1] : null;
  }

  get genres() {
    // Filter out technical categories
    return this.categories.filter(cat =>
      !cat.startsWith('mal_id:') &&
      !cat.startsWith('page:') &&
      !cat.startsWith('rate:') &&
      !cat.startsWith('season:') &&
      !cat.startsWith('status:') &&
      !cat.startsWith('type:') &&
      !cat.startsWith('episode:') &&
      !cat.startsWith('quality:') &&
      !cat.startsWith('resolution:')
    );
  }

  get fullInfo() {
    return this.jikanData?.data || null;
  }
}

// UI Components
class LoadingSpinner {
  render() {
    return `
                    <div class="flex justify-center items-center py-12">
                        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                    </div>
                `;
  }
}

class ErrorMessage {
  constructor(error) {
    this.error = error;
  }

  render() {
    const bgColor = this.error.type === 'error' ? 'bg-red-500' : 'bg-yellow-500';
    return `
                    <div class="${bgColor} text-white p-4 rounded-lg mb-6">
                        <div class="flex items-center">
                            <i class="fas fa-exclamation-circle mr-2"></i>
                            <span>${this.error.message}</span>
                        </div>
                    </div>
                `;
  }
}

class AnimeHeader {
  constructor(animeSeries, currentEpisode) {
    this.animeSeries = animeSeries;
    this.currentEpisode = currentEpisode;
  }

  render() {
    return `
                    <div class="glass rounded-xl p-6 mb-6">
                        <h1 class="text-2xl font-bold">${this.animeSeries.title}</h1>
                        <h2 class="text-xl text-primary-600 dark:text-primary-400 mt-1">
                            Episode ${this.currentEpisode.episodeNumber}: ${this.currentEpisode.title}
                        </h2>
                    </div>
                `;
  }
}

class VideoPlayer {
  constructor(streamList) {
    this.streamList = streamList;
    this.currentServer = streamList[0];
  }

  render() {
    return `
                    <div class="glass rounded-xl p-6 mb-6">
                        <div class="flex flex-col md:flex-row md:items-center justify-between mb-4">
                            <h3 class="text-lg font-medium mb-2 md:mb-0">Player</h3>
                            <div class="flex space-x-2">
                                <div class="relative">
                                    <button id="serverDropdownBtn" class="flex items-center justify-between glass rounded-lg px-4 py-2 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors w-48">
                                        <span>${this.currentServer.name}</span>
                                        <i class="fas fa-chevron-down ml-2 transition-transform"></i>
                                    </button>
                                    <div id="serverDropdown" class="dropdown-content absolute left-0 right-0 mt-1 glass rounded-lg shadow-lg z-10">
                                        <ul class="py-1 max-h-60 overflow-y-auto">
                                            ${this.streamList.map(server => `
                                                <li>
                                                    <button data-server='${JSON.stringify(server).replace(/'/g, "\\'")}' class="server-option w-full text-left px-4 py-2 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors">
                                                        ${server.name} (${server.type === 'embed/iframe' ? 'Embed' : 'Direct'})
                                                    </button>
                                                </li>
                                            `).join('')}
                                        </ul>
                                    </div>
                                </div>
                                ${this.currentServer.type !== 'embed/iframe' ? `
                                    <div class="relative">
                                        <button id="qualityDropdownBtn" class="flex items-center justify-between glass rounded-lg px-4 py-2 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors w-24">
                                            <span>${this.currentServer.qualities[0].text}</span>
                                            <i class="fas fa-chevron-down ml-2 transition-transform"></i>
                                        </button>
                                        <div id="qualityDropdown" class="dropdown-content absolute left-0 right-0 mt-1 glass rounded-lg shadow-lg z-10">
                                            <ul class="py-1">
                                                ${this.currentServer.qualities.map(quality => `
                                                    <li>
                                                        <button data-quality='${JSON.stringify(quality).replace(/'/g, "\\'")}' class="quality-option w-full text-left px-4 py-2 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors">
                                                            ${quality.text}
                                                        </button>
                                                    </li>
                                                `).join('')}
                                            </ul>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="bg-black rounded-lg aspect-video flex items-center justify-center mb-4" id="videoContainer">
                            ${this.currentServer.type === 'embed/iframe' ? `
                                <iframe src="${this.currentServer.url}" allowfullscreen class="w-full h-full"></iframe>
                            ` : `
                                <video id="player" controls class="w-full h-full"></video>
                            `}
                        </div>
                    </div>
                `;
  }

  initPlayer() {
    if (this.currentServer.type !== 'embed/iframe') {
      const video = document.getElementById('player');
      if (video) {
        video.innerHTML = this.currentServer.qualities.map(quality => `
                            <source src="${quality.url}" type="video/mp4" size="${quality.text}">
                        `).join('');

        // Initialize Plyr if available
        if (window.Plyr) {
          new Plyr('#player', {
            quality: {
              default: this.currentServer.qualities[0].text,
              options: this.currentServer.qualities.map(q => q.text),
              forced: true
            }
          });
        }
      }
    }
  }

  bindEvents() {
    // Server dropdown
    const serverDropdownBtn = document.getElementById('serverDropdownBtn');
    const serverDropdown = document.getElementById('serverDropdown');

    serverDropdownBtn.addEventListener('click', () => {
      serverDropdown.classList.toggle('show');
      serverDropdownBtn.querySelector('i').classList.toggle('rotate-180');
    });

    // Server selection
    document.querySelectorAll('.server-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const server = JSON.parse(e.target.dataset.server);
        this.currentServer = server;

        // Re-render player section
        const playerSection = document.getElementById('videoPlayerSection');
        if (playerSection) {
          playerSection.innerHTML = this.render();
          this.initPlayer();
          this.bindEvents();
        }
      });
    });

    // Quality dropdown
    const qualityDropdownBtn = document.getElementById('qualityDropdownBtn');
    if (qualityDropdownBtn) {
      const qualityDropdown = document.getElementById('qualityDropdown');

      qualityDropdownBtn.addEventListener('click', () => {
        qualityDropdown.classList.toggle('show');
        qualityDropdownBtn.querySelector('i').classList.toggle('rotate-180');
      });

      // Quality selection
      document.querySelectorAll('.quality-option').forEach(option => {
        option.addEventListener('click', (e) => {
          const quality = JSON.parse(e.target.dataset.quality);
          qualityDropdownBtn.querySelector('span').textContent = quality.text;

          // Update video source
          const video = document.getElementById('player');
          if (video) {
            video.src = quality.url;
            video.load();
          }
        });
      });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.relative')) {
        document.querySelectorAll('.dropdown-content').forEach(dropdown => {
          dropdown.classList.remove('show');
        });
        document.querySelectorAll('[id$="DropdownBtn"] i').forEach(icon => {
          icon.classList.remove('rotate-180');
        });
      }
    });
  }
}

class DownloadSection {
  constructor(downloadList) {
    this.downloadList = downloadList;
  }

  render() {
    return `
                    <div class="glass rounded-xl p-6 mb-6">
                        <h3 class="flex items-center font-bold mb-4">
                            <i class="fas fa-download mr-2 text-primary-600 dark:text-primary-400"></i> 
                            Download Episode
                        </h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            ${this.downloadList.map(download => `
                                <button 
                                    data-download='${JSON.stringify(download).replace(/'/g, "\\'")}'
                                    class="download-btn hover:bg-primary-200 dark:hover:bg-primary-700 p-3 rounded-lg transition-colors text-center"
                                >
                                    <div class="font-medium">${download.quality}</div>
                                    <div class="text-sm text-gray-600 dark:text-gray-400">${download.size}</div>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `;
  }

  bindEvents() {
    document.querySelectorAll('.download-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const download = JSON.parse(e.target.closest('.download-btn').dataset.download);
        this.showDownloadModal(download);
      });
    });
  }

  showDownloadModal(download) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
                    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md w-full mx-2">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-bold">Download ${download.quality} (${download.size})</h3>
                            <button class="close-modal text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="space-y-2">
                            ${download.urls.map(url => `
                                <a href="${url.url}" target="_blank" class="block p-3 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                    <div class="flex items-center">
                                        <i class="fab ${this.getProviderIcon(url.name)} mr-2"></i>
                                        <span>${url.name}</span>
                                    </div>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                `;

    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });

    document.body.appendChild(modal);
  }

  getProviderIcon(providerName) {
    const lowerName = providerName.toLowerCase();
    if (lowerName.includes('google')) return 'fa-google-drive';
    if (lowerName.includes('mega')) return 'fa-mega';
    if (lowerName.includes('terabox')) return 'fa-box';
    return 'fa-cloud-download-alt';
  }
}

class EpisodeNavigation {
  constructor(episodesList, currentEpisode, blogID) {
    this.episodesList = episodesList;
    this.currentEpisode = currentEpisode;
    this.blogID = blogID;
  }

  render() {
    const currentIndex = this.episodesList.findIndex(ep =>
      ep.episodeNumber === this.currentEpisode.episodeNumber
    );

    const prevEpisode = currentIndex > 0 ? this.episodesList[currentIndex - 1] : null;
    const nextEpisode = currentIndex < this.episodesList.length - 1 ? this.episodesList[currentIndex + 1] : null;

    return `
                    <div class="glass rounded-xl p-6 mb-6">
                        <div class="flex justify-between items-center">
                            ${prevEpisode ? `
                                <a href="${prevEpisode.path}" class="flex items-center glass rounded-lg px-4 py-2 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors">
                                    <i class="fas fa-arrow-left mr-2"></i> Previous
                                </a>
                            ` : '<div></div>'}
                            
                            <button id="episodeListToggle" class="flex items-center glass rounded-lg px-4 py-2 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors">
                                <i class="fas fa-list mr-2"></i> Episode List
                            </button>
                            
                            ${nextEpisode ? `
                                <a href="${nextEpisode.path}" class="flex items-center glass rounded-lg px-4 py-2 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors">
                                    Next <i class="fas fa-arrow-right ml-2"></i>
                                </a>
                            ` : '<div></div>'}
                        </div>
                        
                        <div id="episodeList" class="episode-list mt-4">
                            <div class="glass rounded-lg overflow-hidden">
                                <div class="p-4 bg-primary-100 dark:bg-primary-800">
                                    <h3 class="font-bold">All Episodes</h3>
                                </div>
                                <div class="max-h-80 overflow-y-auto">
                                    <table class="w-full">
                                        <tbody>
                                            ${this.episodesList.map(episode => `
                                                <tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors">
                                                    <td class="p-3">
                                                        <a href="${episode.path}" class="flex items-center">
                                                            <span class="w-8 text-center font-medium">${episode.episodeNumber}</span>
                                                            <span class="ml-2">${episode.title || 'Episode ' + episode.episodeNumber}</span>
                                                        </a>
                                                    </td>
                                                    <td class="p-3 text-right text-sm text-gray-600 dark:text-gray-400">
                                                        ${episode.published?.relative || 'N/A'}
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
  }

  bindEvents() {
    const toggleBtn = document.getElementById('episodeListToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const episodeList = document.getElementById('episodeList');
        if (episodeList) {
          episodeList.classList.toggle('open');
        }
      });
    }
  }
}

class AnimeInfoSection {
  constructor(animeSeries) {
    this.animeSeries = animeSeries;
  }

  render() {
    const jikanData = this.animeSeries.fullInfo;

    return `
                    <div class="glass rounded-xl p-6 mb-6">
                        <h2 class="text-xl font-bold mb-4">About ${this.animeSeries.title}</h2>
                        
                        ${jikanData?.synopsis ? `
                            <div class="mb-6">
                                <h3 class="font-semibold mb-2">Synopsis</h3>
                                <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    ${jikanData.synopsis}
                                </p>
                            </div>
                        ` : ''}
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 class="font-semibold mb-2">Information</h3>
                                <ul class="space-y-2">
                                    <li class="flex">
                                        <span class="w-24 text-gray-600 dark:text-gray-400">Type:</span>
                                        <span>${this.animeSeries.type || 'N/A'}</span>
                                    </li>
                                    <li class="flex">
                                        <span class="w-24 text-gray-600 dark:text-gray-400">Episodes:</span>
                                        <span>${jikanData?.episodes || 'N/A'}</span>
                                    </li>
                                    <li class="flex">
                                        <span class="w-24 text-gray-600 dark:text-gray-400">Status:</span>
                                        <span>${this.animeSeries.status || 'N/A'}</span>
                                    </li>
                                    <li class="flex">
                                        <span class="w-24 text-gray-600 dark:text-gray-400">Aired:</span>
                                        <span>${jikanData?.aired?.string || 'N/A'}</span>
                                    </li>
                                    <li class="flex">
                                        <span class="w-24 text-gray-600 dark:text-gray-400">Studios:</span>
                                        <span>${jikanData?.studios?.map(s => s.name).join(', ') || 'N/A'}</span>
                                    </li>
                                    <li class="flex">
                                        <span class="w-24 text-gray-600 dark:text-gray-400">Source:</span>
                                        <span>${jikanData?.source || 'N/A'}</span>
                                    </li>
                                    <li class="flex">
                                        <span class="w-24 text-gray-600 dark:text-gray-400">Genres:</span>
                                        <div>
                                            ${this.animeSeries.genres.map(genre => `
                                                <span class="inline-block px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-800 mr-2 mb-2">
                                                    ${genre}
                                                </span>
                                            `).join('')}
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            
                            <div>
                                <h3 class="font-semibold mb-2">Statistics</h3>
                                <ul class="space-y-2">
                                    <li class="flex">
                                        <span class="w-24 text-gray-600 dark:text-gray-400">Rating:</span>
                                        <span>${jikanData?.rating || 'N/A'}</span>
                                    </li>
                                    <li class="flex">
                                        <span class="w-24 text-gray-600 dark:text-gray-400">Score:</span>
                                        <span>${jikanData?.score || 'N/A'} ${jikanData?.scored_by ? `(${jikanData.scored_by.toLocaleString()} users)` : ''}</span>
                                    </li>
                                    <li class="flex">
                                        <span class="w-24 text-gray-600 dark:text-gray-400">Ranked:</span>
                                        <span>${jikanData?.rank ? `#${jikanData.rank}` : 'N/A'}</span>
                                    </li>
                                    <li class="flex">
                                        <span class="w-24 text-gray-600 dark:text-gray-400">Popularity:</span>
                                        <span>${jikanData?.popularity ? `#${jikanData.popularity}` : 'N/A'}</span>
                                    </li>
                                    <li class="flex">
                                        <span class="w-24 text-gray-600 dark:text-gray-400">Members:</span>
                                        <span>${jikanData?.members?.toLocaleString() || 'N/A'}</span>
                                    </li>
                                    <li class="flex">
                                        <span class="w-24 text-gray-600 dark:text-gray-400">Favorites:</span>
                                        <span>${jikanData?.favorites?.toLocaleString() || 'N/A'}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
  }
}

// Main Application
class AnimePlayerApp {
  constructor() {
    this.apiService = new AnimeAPIService();
    this.blogID = document.querySelector('meta[name="blogID"]')?.content;
    this.postID = document.querySelector('meta[name="postID"]')?.content;
    this.appElement = document.getElementById('app');
    this.currentEpisode = null;
    this.animeSeries = null;
    this.episodesList = [];
  }

  async init() {
    try {
      if (!this.blogID || !this.postID) {
        throw new AnimeError('Missing blogID or postID in meta tags');
      }

      this.showLoading();

      // Fetch all data in parallel
      const [episodeData, episodesListData] = await Promise.all([
        this.apiService.getEpisodeData(this.blogID, this.postID),
        this.apiService.getEpisodesList(this.blogID, this.postID)
      ]);

      // Process episode data
      this.currentEpisode = new AnimeEpisode(episodeData.response.entry);

      // Process episodes list
      this.episodesList = episodesListData.entries.map(entry => new AnimeEpisode(entry));

      // Get MAL ID from current episode
      const malId = this.currentEpisode.malId;
      if (!malId) {
        throw new AnimeError('Missing MAL ID in episode data');
      }

      // Fetch anime info and Jikan data
      const [animeInfoData, jikanData] = await Promise.all([
        this.apiService.getAnimeInfo(this.blogID, malId),
        this.apiService.getJikanAnimeDetails(malId)
      ]);

      // Process anime series data
      this.animeSeries = new AnimeSeries(
        animeInfoData.response.entries[0],
        jikanData
      );

      // Render the app
      this.render();
    } catch (error) {
      console.error('Initialization error:', error);
      this.showError(error);
    }
  }

  showLoading() {
    this.appElement.innerHTML = new LoadingSpinner().render();
  }

  showError(error) {
    const errorToShow = error instanceof AnimeError ? error : new AnimeError(error.message);
    this.appElement.innerHTML = new ErrorMessage(errorToShow).render();
  }

  render() {
    if (!this.currentEpisode || !this.animeSeries) return;

    this.appElement.innerHTML = `
                    ${new AnimeHeader(this.animeSeries, this.currentEpisode).render()}
                    <div id="videoPlayerSection">
                        ${new VideoPlayer(this.currentEpisode.streamList).render()}
                    </div>
                    ${new DownloadSection(this.currentEpisode.downloadList).render()}
                    ${new EpisodeNavigation(this.episodesList, this.currentEpisode, this.blogID).render()}
                    ${new AnimeInfoSection(this.animeSeries).render()}
                `;

    // Initialize video player
    const videoPlayer = new VideoPlayer(this.currentEpisode.streamList);
    videoPlayer.initPlayer();
    videoPlayer.bindEvents();

    // Bind other events
    new DownloadSection(this.currentEpisode.downloadList).bindEvents();
    new EpisodeNavigation(this.episodesList, this.currentEpisode, this.blogID).bindEvents();
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  const app = new AnimePlayerApp();
  app.init();

  // Load Plyr if not already loaded
  if (!window.Plyr) {
    const plyrCSS = document.createElement('link');
    plyrCSS.rel = 'stylesheet';
    plyrCSS.href = 'https://cdn.plyr.io/3.7.8/plyr.css';
    document.head.appendChild(plyrCSS);

    const plyrJS = document.createElement('script');
    plyrJS.src = 'https://cdn.plyr.io/3.7.8/plyr.js';
    plyrJS.onload = () => {
      // Re-init player if needed
      const videoPlayer = document.querySelector('#videoPlayerSection video');
      if (videoPlayer) {
        new Plyr(videoPlayer);
      }
    };
    document.head.appendChild(plyrJS);
  }
});

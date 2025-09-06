// Utility function to parse episode numbers from various formats
class EpisodeNumberParser {
  static parseEpisodeNumber(episodeStr) {
    if (!episodeStr) return 0;

    // Handle comma as decimal separator (e.g., "99,5" -> "99.5")
    const normalized = episodeStr.toString().replace(',', '.');

    // Handle special cases like "OVA", "Special", etc.
    if (isNaN(parseFloat(normalized))) {
      // Assign high numbers for special episodes to sort them at the end
      if (normalized.toLowerCase().includes('ova')) return 9998;
      if (normalized.toLowerCase().includes('special')) return 9999;
      if (normalized.toLowerCase().includes('movie')) return 9997;
      return 9990; // Default for other non-numeric values
    }

    return parseFloat(normalized);
  }

  // Function to extract episode number from categories array
  static extractEpisodeNumberFromCategories(categories) {
    const episodeCat = categories.find(cat => cat.startsWith('episode:'));
    return episodeCat ? episodeCat.split(':')[1] : null;
  }
}

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

  async getAnimePictures(malId) {
    const url = `${this.jikanUrl}/${malId}/pictures`;
    return this.fetchWithCache(url, `pictures-${malId}`);
  }
}

// Data Models
class AnimeEpisode {
  constructor(data) {
    this.title = data.title;
    this.episodeNumber = EpisodeNumberParser.extractEpisodeNumberFromCategories(data.categories);
    this.episodeNumberParsed = EpisodeNumberParser.parseEpisodeNumber(this.episodeNumber);
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
  constructor(data, jikanData, picturesData) {
    this.title = data.title;
    this.malId = this.extractMalId(data.categories);
    this.categories = data.categories;
    this.jikanData = jikanData;
    this.picturesData = picturesData;
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

  get pictures() {
    if (!this.picturesData?.data) return [];
    return this.picturesData.data.map(item => {
      // Prioritize webp, fallback to jpg
      return item.webp?.image_url || item.jpg.image_url;
    });
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
      <div class="glass rounded-xl p-4 mb-4">
        <h1 class="text-xl font-bold truncate">${this.animeSeries.title}</h1>
        <h2 class="text-md text-primary-600 dark:text-primary-400 mt-1 truncate">
          Episode ${this.currentEpisode.episodeNumber}: ${this.currentEpisode.title}
        </h2>
      </div>
    `;
  }
}
class ServerSection {
  constructor(streamList, currentServer) {
    this.streamList = streamList;
    this.currentServer = currentServer;
  }


  render() {
    return `
    <div id="serverSection" class="glass rounded-xl p-4 mb-4 hidden">
      <h3 class="flex items-center font-bold mb-3 text-sm">
        <i class="fas fa-server mr-2 text-primary-600 dark:text-primary-400"></i> 
        Pilih Server
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        ${this.streamList.map(server => `
          <button 
            data-server='${JSON.stringify(server).replace(/'/g, "\\'")}'
            class="server-btn hover:bg-primary-200 dark:hover:bg-primary-700 p-3 rounded transition-colors text-center ${server.name === this.currentServer.name ? 'bg-primary-200 dark:bg-primary-700' : ''}"
          >
            <div class="flex flex-col items-center">
              <i class="fas ${server.type === 'embed/iframe' ? 'fa-film' : 'fa-play-circle'} text-lg mb-1"></i>
              <div class="font-medium text-xs">${server.name}</div>
              <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">${server.type === 'embed/iframe' ? 'Embed' : 'Direct'}</div>
            </div>
          </button>
        `).join('')}
      </div>
      
      <!-- Hapus section kualitas untuk server direct -->
    </div>
  `;
  }

  update(newServer) {
    this.currentServer = newServer;
    const serverSection = document.getElementById('serverSection');
    if (serverSection) {
      // Hanya update bagian yang perlu diupdate
      const serverButtons = serverSection.querySelectorAll('.server-btn');
      serverButtons.forEach(btn => {
        const server = JSON.parse(btn.dataset.server);
        if (server.name === newServer.name) {
          btn.classList.add('bg-primary-200', 'dark:bg-primary-700');
        } else {
          btn.classList.remove('bg-primary-200', 'dark:bg-primary-700');
        }
      });

      // Hapus bagian update quality section
    }
  }

  // Di dalam class ServerSection, perbaiki method bindEvents()

  bindEvents(videoPlayerInstance) {
    // Server selection
    document.querySelectorAll('.server-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const server = JSON.parse(e.target.closest('.server-btn').dataset.server);
        videoPlayerInstance.currentServer = server;

        // Update player section
        const playerSection = document.getElementById('videoPlayerSection');
        if (playerSection) {
          playerSection.innerHTML = videoPlayerInstance.render();
          videoPlayerInstance.initPlayer();
          videoPlayerInstance.bindEvents();
          videoPlayerInstance.setupToggleButtons();
        }

        // Update server section (gunakan method update, bukan render ulang)
        if (window.serverSectionInstance) {
          window.serverSectionInstance.update(server);
        }
      });
    });
  }
}

class VideoPlayer {
  constructor(streamList) {
    this.streamList = streamList;
    this.currentServer = streamList[0];
  }
  render() {
    return `
    <div class="glass rounded-xl overflow-hidden mb-4">
      <div class="bg-black aspect-video flex items-center justify-center" id="videoContainer">
        ${this.currentServer.type === 'embed/iframe' ? `
          <iframe src="${this.currentServer.url}" allowfullscreen class="w-full h-full"></iframe>
        ` : `
          <video id="player" controls class="w-full h-full"></video>
        `}
      </div>
      
      <div class="p-3 flex justify-between items-center bg-gray-100 dark:bg-gray-800">
        <div class="flex space-x-2">
          <button id="serverToggle" class="flex items-center glass rounded-lg px-3 py-1.5 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors text-sm">
            <i class="fas fa-server mr-1"></i>
            <span class="max-w-xs truncate">${this.currentServer.name}</span>
          </button>
          
          <!-- Hapus tombol quality toggle -->
        </div>
        
        <div class="flex space-x-2">
          <button id="downloadToggle" class="glass rounded-lg px-3 py-1.5 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors text-sm">
            <i class="fas fa-download"></i>
          </button>
          <button id="episodesToggle" class="glass rounded-lg px-3 py-1.5 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors text-sm">
            <i class="fas fa-list"></i>
          </button>
          <button id="infoToggle" class="glass rounded-lg px-3 py-1.5 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors text-sm">
            <i class="fas fa-info-circle"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  }

  initPlayer() {
    if (this.currentServer.type !== 'embed/iframe') {
      const video = document.getElementById('player');
      if (video) {
        // Untuk direct server, tambahkan semua quality sebagai source
        video.innerHTML = this.currentServer.qualities.map(quality => `
        <source src="${quality.url}" type="video/mp4" size="${quality.text}">
      `).join('');

        // Initialize Plyr if available
        if (window.Plyr) {
          const player = new Plyr('#player', {
            controls: [
              'play-large',
              'play',
              'progress',
              'current-time',
              'duration',
              'mute',
              'volume',
              'settings',
              'pip',
              'fullscreen'
            ],
            quality: {
              default: this.currentServer.qualities[0].text,
              options: this.currentServer.qualities.map(q => q.text),
              forced: true
            }
          });

          // Otomatis pilih quality terbaik yang tersedia
          player.on('ready', () => {
            if (player.options.quality.options.length > 0) {
              player.quality = player.options.quality.options[0];
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

    if (serverDropdownBtn && serverDropdown) {
      serverDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        serverDropdown.classList.toggle('show');

        // Sembunyikan dropdown kualitas jika terbuka
        const qualityDropdown = document.getElementById('qualityDropdown');
        if (qualityDropdown) qualityDropdown.classList.remove('show');

        // Rotate chevron icon
        const chevron = serverDropdownBtn.querySelector('.fa-chevron-down');
        if (chevron) chevron.classList.toggle('rotate-180');
      });

      // Server selection
      document.querySelectorAll('.server-option').forEach(option => {
        option.addEventListener('click', (e) => {
          e.stopPropagation();
          const server = JSON.parse(e.target.closest('.server-option').dataset.server);
          this.currentServer = server;

          // Re-render player section
          const playerSection = document.getElementById('videoPlayerSection');
          if (playerSection) {
            playerSection.innerHTML = this.render();
            this.initPlayer();
            this.bindEvents();
            this.setupToggleButtons();
          }
        });
      });
    }

    // Quality dropdown
    const qualityDropdownBtn = document.getElementById('qualityDropdownBtn');
    if (qualityDropdownBtn) {
      const qualityDropdown = document.getElementById('qualityDropdown');

      qualityDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        qualityDropdown.classList.toggle('show');

        // Sembunyikan dropdown server jika terbuka
        if (serverDropdown) serverDropdown.classList.remove('show');

        // Rotate chevron icon
        const chevron = qualityDropdownBtn.querySelector('.fa-chevron-down');
        if (chevron) chevron.classList.toggle('rotate-180');
      });

      // Quality selection
      document.querySelectorAll('.quality-option').forEach(option => {
        option.addEventListener('click', (e) => {
          e.stopPropagation();
          const quality = JSON.parse(e.target.closest('.quality-option').dataset.quality);
          qualityDropdownBtn.querySelector('span').textContent = quality.text;

          // Update video source
          const video = document.getElementById('player');
          if (video) {
            video.src = quality.url;
            video.load();
          }

          // Tutup dropdown setelah memilih
          qualityDropdown.classList.remove('show');
          const chevron = qualityDropdownBtn.querySelector('.fa-chevron-down');
          if (chevron) chevron.classList.remove('rotate-180');
        });
      });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.relative')) {
        document.querySelectorAll('.dropdown-content').forEach(dropdown => {
          dropdown.classList.remove('show');
        });

        // Reset chevron icons
        document.querySelectorAll('[id$="DropdownBtn"] .fa-chevron-down').forEach(chevron => {
          chevron.classList.remove('rotate-180');
        });
      }
    });
  }

  setupToggleButtons() {
    // Server toggle
    const serverToggle = document.getElementById('serverToggle');
    const serverSection = document.getElementById('serverSection');

    if (serverToggle && serverSection) {
      serverToggle.addEventListener('click', () => {
        serverSection.classList.toggle('hidden');
        // Hide other sections when showing this one
        document.getElementById('downloadSection').classList.add('hidden');
        document.getElementById('episodesSection').classList.add('hidden');
        document.getElementById('infoSection').classList.add('hidden');
      });
    }

    // Hapus quality toggle

    // Download toggle
    const downloadToggle = document.getElementById('downloadToggle');
    const downloadSection = document.getElementById('downloadSection');

    if (downloadToggle && downloadSection) {
      downloadToggle.addEventListener('click', () => {
        downloadSection.classList.toggle('hidden');
        // Hide other sections when showing this one
        document.getElementById('serverSection').classList.add('hidden');
        document.getElementById('episodesSection').classList.add('hidden');
        document.getElementById('infoSection').classList.add('hidden');
      });
    }

    // Episodes toggle
    const episodesToggle = document.getElementById('episodesToggle');
    const episodesSection = document.getElementById('episodesSection');

    if (episodesToggle && episodesSection) {
      episodesToggle.addEventListener('click', () => {
        episodesSection.classList.toggle('hidden');
        // Hide other sections when showing this one
        document.getElementById('serverSection').classList.add('hidden');
        document.getElementById('downloadSection').classList.add('hidden');
        document.getElementById('infoSection').classList.add('hidden');
      });
    }

    // Info toggle
    const infoToggle = document.getElementById('infoToggle');
    const infoSection = document.getElementById('infoSection');

    if (infoToggle && infoSection) {
      infoToggle.addEventListener('click', () => {
        infoSection.classList.toggle('hidden');
        // Hide other sections when showing this one
        document.getElementById('serverSection').classList.add('hidden');
        document.getElementById('downloadSection').classList.add('hidden');
        document.getElementById('episodesSection').classList.add('hidden');
      });
    }
  }

}

class DownloadSection {
  constructor(downloadList) {
    this.downloadList = downloadList;
  }

  render() {
    return `
      <div id="downloadSection" class="glass rounded-xl p-4 mb-4 hidden">
        <h3 class="flex items-center font-bold mb-3 text-sm">
          <i class="fas fa-download mr-2 text-primary-600 dark:text-primary-400"></i> 
          Download Episode
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          ${this.downloadList.map(download => `
            <button 
              data-download='${JSON.stringify(download).replace(/'/g, "\\'")}'
              class="download-btn hover:bg-primary-200 dark:hover:bg-primary-700 p-2 rounded transition-colors text-center text-xs"
            >
              <div class="font-medium">${download.quality}</div>
              <div class="text-gray-600 dark:text-gray-400">${download.size}</div>
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
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md w-full mx-2">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-sm">Download ${download.quality} (${download.size})</h3>
          <button class="close-modal text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="space-y-2">
          ${download.urls.map(url => `
            <a href="${url.url}" target="_blank" class="block p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm">
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

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
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
    // Urutkan episode berdasarkan nomor episode yang sudah diparsing
    this.episodesList = episodesList.sort((a, b) => {
      return a.episodeNumberParsed - b.episodeNumberParsed;
    });
    this.currentEpisode = currentEpisode;
    this.blogID = blogID;
  }

  render() {
    // Temukan index episode saat ini berdasarkan episodeNumberParsed
    const currentIndex = this.episodesList.findIndex(ep =>
      ep.episodeNumberParsed === this.currentEpisode.episodeNumberParsed
    );

    const prevEpisode = currentIndex > 0 ? this.episodesList[currentIndex - 1] : null;
    const nextEpisode = currentIndex < this.episodesList.length - 1 ? this.episodesList[currentIndex + 1] : null;

    return `
      <div id="episodesSection" class="glass rounded-xl p-4 mb-4 hidden">
        <div class="flex justify-between items-center mb-3">
          ${prevEpisode ? `
            <a href="${prevEpisode.path}" class="flex items-center glass rounded-lg px-3 py-1.5 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors text-sm">
              <i class="fas fa-arrow-left mr-1"></i> Previous
            </a>
          ` : '<div></div>'}
          
          ${nextEpisode ? `
            <a href="${nextEpisode.path}" class="flex items-center glass rounded-lg px-3 py-1.5 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors text-sm">
              Next <i class="fas fa-arrow-right ml-1"></i>
            </a>
          ` : '<div></div>'}
        </div>
        
        <div class="max-h-80 overflow-y-auto">
          <table class="w-full">
            <tbody>
              ${this.episodesList.map(episode => `
                <tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors ${episode.episodeNumberParsed === this.currentEpisode.episodeNumberParsed ? 'bg-primary-100 dark:bg-primary-800' : ''}">
                  <td class="p-2">
                    <a href="${episode.path}" class="flex items-center text-sm">
                      <span class="w-8 text-center font-medium">${episode.episodeNumber}</span>
                      <span class="ml-2 truncate">${episode.title || 'Episode ' + episode.episodeNumber}</span>
                    </a>
                  </td>
                  <td class="p-2 text-right text-xs text-gray-600 dark:text-gray-400">
                    ${episode.published?.relative || 'N/A'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}

class AnimeInfoSection {
  constructor(animeSeries, animeInfoData) {
    this.animeSeries = animeSeries;
    this.animeInfoData = animeInfoData;
  }

  render() {
    const jikanData = this.animeSeries.fullInfo;
    const pictures = this.animeSeries.pictures;

    // Get the path from animeInfoData response
    const animeInfoPath = this.animeInfoData?.response?.entries[0]?.path;
    const animeInfoUrl = animeInfoPath ? `${window.location.origin}${animeInfoPath}` : '#';

    return `
      <div id="infoSection" class="glass rounded-xl p-4 mb-4 hidden">
        <h2 class="text-lg font-bold mb-3">About ${this.animeSeries.title}</h2>
        
        ${pictures.length > 0 ? `
          <div class="mb-4">
            <div class="anime-cover-slider relative rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 aspect-[3/4] max-w-xs mx-auto">
              ${pictures.map((img, index) => `
                <div class="slide ${index === 0 ? 'active' : ''}">
                  <img src="${img}" alt="${this.animeSeries.title} Cover ${index + 1}" class="w-full h-full object-cover">
                </div>
              `).join('')}
              
              ${pictures.length > 1 ? `
                <button class="slider-nav prev absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all text-xs">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <button class="slider-nav next absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all text-xs">
                  <i class="fas fa-chevron-right"></i>
                </button>
                
                <div class="slider-dots absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
                  ${pictures.map((_, index) => `
                    <button class="dot w-2 h-2 rounded-full bg-white bg-opacity-50 ${index === 0 ? 'bg-opacity-100' : ''}" data-index="${index}"></button>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}
        
        ${jikanData?.synopsis ? `
          <div class="mb-4">
            <h3 class="font-semibold mb-2 text-sm">Synopsis</h3>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
              ${jikanData.synopsis.substring(0, 200)}...
            </p>
          </div>
        ` : ''}
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 class="font-semibold mb-2">Information</h3>
            <ul class="space-y-1">
              <li class="flex">
                <span class="w-20 text-gray-600 dark:text-gray-400">Type:</span>
                <span>${this.animeSeries.type || 'N/A'}</span>
              </li>
              <li class="flex">
                <span class="w-20 text-gray-600 dark:text-gray-400">Episodes:</span>
                <span>${jikanData?.episodes || 'N/A'}</span>
              </li>
              <li class="flex">
                <span class="w-20 text-gray-600 dark:text-gray-400">Status:</span>
                <span>${this.animeSeries.status || 'N/A'}</span>
              </li>
              <li class="flex">
                <span class="w-20 text-gray-600 dark:text-gray-400">Aired:</span>
                <span>${jikanData?.aired?.string || 'N/A'}</span>
              </li>
              <li class="flex">
                <span class="w-20 text-gray-600 dark:text-gray-400">Studios:</span>
                <span>${jikanData?.studios?.map(s => s.name).join(', ') || 'N/A'}</span>
              </li>
              <li class="flex">
                <span class="w-20 text-gray-600 dark:text-gray-400">Source:</span>
                <span>${jikanData?.source || 'N/A'}</span>
              </li>
              <li class="flex">
                <span class="w-20 text-gray-600 dark:text-gray-400">Genres:</span>
                <div>
                  ${this.animeSeries.genres.slice(0, 3).map(genre => `
                    <span class="inline-block px-2 py-0.5 text-xs rounded-full bg-primary-100 dark:bg-primary-800 mr-1 mb-1">
                      ${genre}
                    </span>
                  `).join('')}
                  ${this.animeSeries.genres.length > 3 ? `
                    <span class="inline-block px-2 py-0.5 text-xs rounded-full bg-primary-100 dark:bg-primary-800 mr-1 mb-1">
                      +${this.animeSeries.genres.length - 3} more
                    </span>
                  ` : ''}
                </div>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-semibold mb-2">Statistics</h3>
            <ul class="space-y-1">
              <li class="flex">
                <span class="w-20 text-gray-600 dark:text-gray-400">Rating:</span>
                <span>${jikanData?.rating || 'N/A'}</span>
              </li>
              <li class="flex">
                <span class="w-20 text-gray-600 dark:text-gray-400">Score:</span>
                <span>${jikanData?.score || 'N/A'} ${jikanData?.scored_by ? `(${jikanData.scored_by.toLocaleString()} users)` : ''}</span>
              </li>
              <li class="flex">
                <span class="w-20 text-gray-600 dark:text-gray-400">Ranked:</span>
                <span>${jikanData?.rank ? `#${jikanData.rank}` : 'N/A'}</span>
              </li>
              <li class="flex">
                <span class="w-20 text-gray-600 dark:text-gray-400">Popularity:</span>
                <span>${jikanData?.popularity ? `#${jikanData.popularity}` : 'N/A'}</span>
              </li>
              <li class="flex">
                <span class="w-20 text-gray-600 dark:text-gray-400">Members:</span>
                <span>${jikanData?.members?.toLocaleString() || 'N/A'}</span>
              </li>
            </ul>
          </div>
        </div>

        ${animeInfoPath ? `
          <div class="mt-4">
            <a href="${animeInfoUrl}" class="flex items-center glass rounded-lg px-3 py-1.5 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors text-sm">
              <i class="fas fa-external-link-alt mr-1"></i> Lihat Selengkapnya
            </a>
          </div>
        ` : ''}
      </div>
    `;
  }

  bindEvents() {
    // Initialize slider if there are multiple images
    const slider = document.querySelector('.anime-cover-slider');
    if (slider && slider.querySelectorAll('.slide').length > 1) {
      const slides = slider.querySelectorAll('.slide');
      const dots = slider.querySelectorAll('.dot');
      let currentSlide = 0;

      // Function to show a specific slide
      const showSlide = (index) => {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('bg-opacity-100'));

        slides[index].classList.add('active');
        dots[index].classList.add('bg-opacity-100');
        currentSlide = index;
      };

      // Next button
      slider.querySelector('.next').addEventListener('click', () => {
        const nextIndex = (currentSlide + 1) % slides.length;
        showSlide(nextIndex);
      });

      // Previous button
      slider.querySelector('.prev').addEventListener('click', () => {
        const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prevIndex);
      });

      // Dot navigation
      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          showSlide(index);
        });
      });

      // Auto slide every 5 seconds
      setInterval(() => {
        const nextIndex = (currentSlide + 1) % slides.length;
        showSlide(nextIndex);
      }, 5000);
    }
  }
}

// Main Application
class AnimePlayerApp {
  constructor() {
    this.apiService = new AnimeAPIService();
    this.blogID = document.querySelector('meta[name="blogID"]')?.content;
    this.postID = document.querySelector('meta[name="postID"]')?.content;
    this.appElement = null;
    this.currentEpisode = null;
    this.animeSeries = null;
    this.episodesList = [];
    this.observer = null;
    this.maxRetries = 5;
    this.retryCount = 0;
    this.retryDelay = 1000; // 1 second
  }

  async init() {
    try {
      if (!this.blogID || !this.postID) {
        throw new AnimeError('Missing blogID or postID in meta tags');
      }

      // Check if container exists
      this.appElement = document.getElementById('episode-container');

      if (!this.appElement) {
        // If not found, set up a MutationObserver to watch for its appearance
        this.setupObserver();
        return;
      }

      this.showLoading();

      // First fetch the episode data to get the mal_id
      const episodeData = await this.apiService.getEpisodeData(this.blogID, this.postID);

      // Process episode data
      this.currentEpisode = new AnimeEpisode(episodeData.response.entry);

      // Get MAL ID from current episode
      const malId = this.currentEpisode.malId;
      if (!malId) {
        throw new AnimeError('Missing MAL ID in episode data');
      }

      // Now fetch the episodes list and other data in parallel using the malId
      const [episodesListData, animeInfoData, jikanData, picturesData] = await Promise.all([
        this.apiService.getEpisodesList(this.blogID, malId),
        this.apiService.getAnimeInfo(this.blogID, malId),
        this.apiService.getJikanAnimeDetails(malId),
        this.apiService.getAnimePictures(malId)
      ]);

      // Process episodes list - urutkan berdasarkan episodeNumberParsed
      this.episodesList = episodesListData.entries
        .map(entry => new AnimeEpisode(entry))
        .sort((a, b) => a.episodeNumberParsed - b.episodeNumberParsed);

      // Process anime series data
      this.animeSeries = new AnimeSeries(
        animeInfoData.response.entries[0],
        jikanData,
        picturesData
      );

      this.animeInfoData = animeInfoData;

      // Render the app
      this.render();
    } catch (error) {
      console.error('Initialization error:', error);
      this.showError(error);
    }
  }

  setupObserver() {
    if (this.retryCount >= this.maxRetries) {
      console.log('Max retries reached, giving up on finding episode-container');
      return;
    }

    this.retryCount++;

    if (!this.observer) {
      this.observer = new MutationObserver((mutations, obs) => {
        const container = document.getElementById('episode-container');
        if (container) {
          obs.disconnect();
          this.appElement = container;
          this.init();
        } else {
          // If not found after delay, try again
          setTimeout(() => {
            if (this.retryCount < this.maxRetries) {
              this.init();
            } else {
              obs.disconnect();
              console.log('Episode container not found after maximum retries');
            }
          }, this.retryDelay);
        }
      });

      this.observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    // Also try immediately in case it was added just before we set up the observer
    setTimeout(() => {
      const container = document.getElementById('episode-container');
      if (container) {
        this.observer?.disconnect();
        this.appElement = container;
        this.init();
      }
    }, 0);
  }

  showLoading() {
    if (this.appElement) {
      this.appElement.innerHTML = new LoadingSpinner().render();
    }
  }

  showError(error) {
    if (this.appElement) {
      const errorToShow = error instanceof AnimeError ? error : new AnimeError(error.message);
      this.appElement.innerHTML = new ErrorMessage(errorToShow).render();
    }
  }

  render() {
    if (!this.appElement || !this.currentEpisode || !this.animeSeries) return;

    this.appElement.innerHTML = `
    ${new AnimeHeader(this.animeSeries, this.currentEpisode).render()}
    <div id="videoPlayerSection">
      ${new VideoPlayer(this.currentEpisode.streamList).render()}
    </div>
    ${new ServerSection(this.currentEpisode.streamList, this.currentEpisode.streamList[0]).render()}
    ${new DownloadSection(this.currentEpisode.downloadList).render()}
    ${new EpisodeNavigation(this.episodesList, this.currentEpisode, this.blogID).render()}
    ${new AnimeInfoSection(this.animeSeries, this.animeInfoData).render()}
  `;

    // Initialize video player
    const videoPlayer = new VideoPlayer(this.currentEpisode.streamList);
    videoPlayer.initPlayer();
    videoPlayer.bindEvents();
    videoPlayer.setupToggleButtons();

    // Bind other events
    window.serverSectionInstance = new ServerSection(this.currentEpisode.streamList, this.currentEpisode.streamList[0]);
    window.serverSectionInstance.bindEvents(videoPlayer);
    new DownloadSection(this.currentEpisode.downloadList).bindEvents();
    new AnimeInfoSection(this.animeSeries).bindEvents();
  }
}

// Check if the container exists immediately
const container = document.getElementById('episode-container');

if (container) {
  // If it exists, initialize immediately
  const app = new AnimePlayerApp();
  app.init();
} else {
  // Otherwise, create the app instance which will set up the observer
  new AnimePlayerApp().init();
}

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

// Add CSS for the slider and dropdowns
const customCSS = `
/* Style untuk episode number dengan format berbeda */
  .episode-number {
    font-feature-settings: "tnum";
    font-variant-numeric: tabular-nums;
  }
    /* End style episode number */

  .anime-cover-slider {
    position: relative;
  }
  
  .anime-cover-slider .slide {
    display: none;
    opacity: 0;
    transition: opacity 0.5s ease;
  }
  
  .anime-cover-slider .slide.active {
    display: block;
    opacity: 1;
  }
  
  .slider-nav {
    display: none;
  }
  
  .anime-cover-slider:hover .slider-nav {
    display: block;
  }
  
  .slider-dots {
    display: flex;
  }
  
  .dropdown-content {
    max-height: 300px;
    overflow-y: auto;
    z-index: 50;
    background: rgba(255, 255, 255, 0.95);
  }
  
  .dark .dropdown-content {
    background: rgba(30, 41, 59, 0.95);
  }
  
  .server-option, .quality-option {
    cursor: pointer;
  }
  
  .server-option:hover, .quality-option:hover {
    background-color: rgba(59, 130, 246, 0.1);
  }
  
  .rotate-180 {
    transform: rotate(180deg);
    transition: transform 0.2s ease;
  }
  
  /* Fix for dropdown positioning */
  .relative {
    position: relative;
  }
  
  .dropdown-content {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 0.25rem;
  }
  
  /* Glass effect for dropdown */
  .glass {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.18);
  }
  
  .dark .glass {
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

const styleElement = document.createElement('style');
styleElement.textContent = customCSS;
document.head.appendChild(styleElement);
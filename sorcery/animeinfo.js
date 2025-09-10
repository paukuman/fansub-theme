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
    this.episodeData = []; // Inisialisasi sebagai array kosong, bukan null
    this.picturesData = null;
    this.container = document.getElementById('animeinfo-container');
    this.shareData = {
      title: '',
      text: '',
      url: window.location.href
    };
    this.episodeOffset = 1;
    this.episodeLimit = 4;
    this.isLoadingEpisodes = false;
    this.hasMoreEpisodes = true;
    this.isBookmarked = false;
    this.isInList = false;

    this.init();
  }
  /**
       * Renders skeleton loading state
       * @returns {string} HTML string for skeleton loading
       */
  renderSkeleton() {
    return `
    <div class="space-y-6">
      ${this.renderHeaderSkeleton()}
      ${this.renderSynopsisSkeleton()}
      ${this.renderEpisodesSkeleton()}
      ${this.renderCharactersSkeleton()}
      ${this.renderStatisticsSkeleton()}  <!-- Tambahkan skeleton untuk statistics -->
    </div>
  `;
  }

  /**
   * Renders header skeleton
   * @returns {string} HTML string for header skeleton
   */
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

  /**
   * Renders synopsis skeleton
   * @returns {string} HTML string for synopsis skeleton
   */
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

  /**
   * Renders episodes skeleton
   * @returns {string} HTML string for episodes skeleton
   */
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

  /**
   * Renders characters skeleton
   * @returns {string} HTML string for characters skeleton
   */
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

  async init() {
    try {
      // Show skeleton while loading
      this.container.innerHTML = this.renderSkeleton();

      await this.fetchAnimeInfo();

      // Second protection: Check if this is an animeinfo page
      const pageType = this.animeData.categories?.find(cat => cat.startsWith('page:'))?.split(':')[1];
      if (pageType == 'episode') {
        const epsMain = document.createElement('main');
        epsMain.innerHTML = `<div id="app" class="space-y-6"></div>`;
        epsMain.classList.add('flex-1', 'space-y-6');
        epsMain.setAttribute('id', 'episode-container');
        this.container.replaceWith(epsMain);
        return;
      } else if (!pageType || pageType !== 'animeinfo') {
        this.container.innerHTML = '';
        return;
      }

      this.extractMalID();

      if (!this.malID) {
        throw new Error('MAL ID not found in anime info');
      }

      // Fetch data yang membutuhkan MAL ID secara berurutan
      await this.fetchJikanAnimeData();
      await this.fetchCharacterData();
      await this.fetchEpisodeData();
      await this.fetchPicturesData();
      await this.fetchStatisticsData(); // Pastikan MAL ID sudah tersedia
      this.checkBookmarkStatus();
      this.checkListStatus();

      this.render();
      this.setupBackdrop();

    } catch (error) {
      console.error('Error initializing AnimeInfo:', error);
      this.showError('Failed to load anime information. Please try again later.');
    }
  }
  checkBookmarkStatus() {
    const bookmarks = JSON.parse(localStorage.getItem('animeBookmarks') || '{}');
    this.isBookmarked = !!bookmarks[this.malID];
  }
  checkListStatus() {
    const list = JSON.parse(localStorage.getItem('animeList') || '{}');
    this.isInList = !!list[this.malID];
  }
  toggleBookmark() {
    this.isBookmarked = !this.isBookmarked;

    // Update localStorage
    const bookmarks = JSON.parse(localStorage.getItem('animeBookmarks') || '{}');

    if (this.isBookmarked) {
      bookmarks[this.malID] = {
        id: this.malID,
        title: this.animeData.title_english || this.animeData.title,
        image: this.animeData.images?.jpg?.large_image_url,
        addedAt: new Date().toISOString()
      };
      this.showNotification('Added to bookmarks', 'success');
    } else {
      delete bookmarks[this.malID];
      this.showNotification('Removed from bookmarks', 'info');
    }

    localStorage.setItem('animeBookmarks', JSON.stringify(bookmarks));

    // Update UI
    this.updateBookmarkButton();
  }

  toggleList() {
    this.isInList = !this.isInList;

    // Update localStorage
    const list = JSON.parse(localStorage.getItem('animeList') || '{}');

    if (this.isInList) {
      list[this.malID] = {
        id: this.malID,
        title: this.animeData.title_english || this.animeData.title,
        image: this.animeData.images?.jpg?.large_image_url,
        addedAt: new Date().toISOString(),
        status: 'plan_to_watch' // Status default
      };
      this.showNotification('Added to your list', 'success');
    } else {
      delete list[this.malID];
      this.showNotification('Removed from your list', 'info');
    }

    localStorage.setItem('animeList', JSON.stringify(list));

    // Update UI
    this.updateListButton();
  }

  /**
   * Memperbarui tampilan tombol bookmark
   */
  updateBookmarkButton() {
    const bookmarkBtn = this.container.querySelector('.bookmark-button');
    if (!bookmarkBtn) return;

    const icon = bookmarkBtn.querySelector('i');
    if (this.isBookmarked) {
      icon.className = 'fas fa-bookmark text-yellow-500';
      bookmarkBtn.setAttribute('data-tooltip', 'Remove bookmark');
    } else {
      icon.className = 'fas fa-bookmark';
      bookmarkBtn.setAttribute('data-tooltip', 'Add to bookmarks');
    }
  }

  /**
   * Memperbarui tampilan tombol list
   */
  updateListButton() {
    const listBtn = this.container.querySelector('.add-to-list-button');
    if (!listBtn) return;

    if (this.isInList) {
      listBtn.innerHTML = '<i class="fas fa-check mr-2"></i>In List';
      listBtn.className = 'px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors add-to-list-button';
      listBtn.setAttribute('data-tooltip', 'Remove from list');
    } else {
      listBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>Add to List';
      listBtn.className = 'px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors add-to-list-button';
      listBtn.setAttribute('data-tooltip', 'Add to your list');
    }
  }

  /**
   * Menampilkan notifikasi
   */
  showNotification(message, type = 'info') {
    // Hapus notifikasi yang sudah ada
    const existingNotification = document.getElementById('anime-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // Buat elemen notifikasi
    const notification = document.createElement('div');
    notification.id = 'anime-notification';
    notification.className = `fixed bottom-4 mb-24 md:mb-0 right-4 px-4 py-3 rounded-lg shadow-lg transition-opacity duration-300 ${type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
      }`;
    notification.innerHTML = `
      <div class="flex items-center">
        <i class="fas ${type === 'success' ? 'fa-check-circle' :
        type === 'error' ? 'fa-exclamation-circle' :
          'fa-info-circle'
      } mr-2"></i>
        <span>${message}</span>
      </div>
    `;

    // Tambahkan ke DOM
    document.body.appendChild(notification);

    // Animasi masuk
    setTimeout(() => {
      notification.classList.add('opacity-100');
    }, 10);

    // Hapus setelah 3 detik
    setTimeout(() => {
      notification.classList.remove('opacity-100');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
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

  async fetchEpisodeData(loadMore = false) {
    if (this.isLoadingEpisodes) return;

    try {
      this.isLoadingEpisodes = true;

      // Update UI untuk menunjukkan loading state
      this.updateEpisodeLoadingState(true);

      // Jika bukan load more, reset offset
      if (!loadMore) {
        this.episodeOffset = 0;
        this.hasMoreEpisodes = true;
        this.episodeData = []; // Pastikan episodeData adalah array kosong
      }

      const response = await fetch(
        `https://mangadb.paukuman.workers.dev/anime?blogID=${this.blogID}&mal_id=${this.malID}&page=episode&limit=${this.episodeLimit}&offset=${this.episodeOffset}`
      );

      if (!response.ok) throw new Error('Episode API response was not ok');

      const data = await response.json();

      // Periksa jika response adalah 404 (tidak ada konten lagi)
      if (data.status === 404) {
        this.hasMoreEpisodes = false;
        return;
      }

      const newEpisodes = data.entries || [];

      // Jika load more, tambahkan ke existing data
      if (loadMore) {
        this.episodeData = [...this.episodeData, ...newEpisodes];
      } else {
        this.episodeData = newEpisodes;
      }

      // Periksa apakah masih ada episode lagi
      this.hasMoreEpisodes = newEpisodes.length === this.episodeLimit;
      this.episodeOffset += parseInt(newEpisodes.length) + 1;

    } catch (error) {
      console.error('Error fetching episode data:', error);
      // Pastikan episodeData tetap array kosong jika error
      if (!loadMore) this.episodeData = [];
    } finally {
      this.isLoadingEpisodes = false;
      // Update UI untuk menyembunyikan loading state
      this.updateEpisodeLoadingState(false);
    }
  }

  /**
   * Memperbarui UI untuk menunjukkan/menyembunyikan loading state
   * @param {boolean} isLoading - Apakah sedang dalam state loading
   */
  updateEpisodeLoadingState(isLoading) {
    const loadMoreBtn = this.container.querySelector('.load-more-episodes');
    const episodesContainer = this.container.querySelector('.episodes-list');

    if (isLoading) {
      // Tampilkan loading indicator di tombol
      if (loadMoreBtn) {
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Loading...';
        loadMoreBtn.disabled = true;
      }

      // Tambahkan skeleton loading untuk episode baru (jika load more)
      if (this.episodeData && this.episodeData.length > 0 && loadMoreBtn) {
        this.addEpisodeSkeletons();
      }
    } else {
      // Sembunyikan loading indicator
      if (loadMoreBtn) {
        loadMoreBtn.innerHTML = 'Load More Episodes';
        loadMoreBtn.disabled = false;

        // Sembunyikan tombol jika tidak ada episode lagi
        if (!this.hasMoreEpisodes) {
          loadMoreBtn.style.display = 'none';

          // Tambahkan pesan bahwa semua episode telah dimuat
          const loadedAllMessage = document.createElement('div');
          loadedAllMessage.className = 'notif-lasteps text-center text-sm text-gray-500 dark:text-gray-400 mt-4';
          loadedAllMessage.textContent = 'All episodes loaded';
          document.querySelector('.notif-lasteps') ? null : loadMoreBtn.parentNode.appendChild(loadedAllMessage);
        }
      }

      // Hapus skeleton loading
      this.removeEpisodeSkeletons();
    }
  }

  /**
   * Menambahkan skeleton loading untuk episode
   */

  addEpisodeSkeletons() {
    const episodesContainer = this.container.querySelector('.episodes-list');
    if (!episodesContainer) return;

    // Pastikan episodeData ada sebelum melanjutkan
    if (!this.episodeData) return;

    // Tambahkan 3 skeleton loading
    for (let i = 0; i < 3; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'episode-item flex items-center p-3';
      skeleton.innerHTML = `
      <div class="w-16 h-9 flex-shrink-0 mr-3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
      <div class="flex-1">
        <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-2 w-3/4"></div>
        <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
      </div>
    `;
      episodesContainer.appendChild(skeleton);
    }
  }

  /**
   * Menghapus skeleton loading untuk episode
   */
  removeEpisodeSkeletons() {
    const episodesContainer = this.container.querySelector('.episodes-list');
    if (!episodesContainer) return;

    // Hapus semua elemen dengan class skeleton (jika ada)
    const skeletons = episodesContainer.querySelectorAll('.bg-gray-300, .bg-gray-700');
    skeletons.forEach(skeleton => {
      if (skeleton.closest('.episode-item')) {
        skeleton.closest('.episode-item').remove();
      }
    });
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
    ${this.renderStatistics()} 
  `;

    // Setup event listeners setelah render
    this.setupEventListeners();
  }

  /**
   * Setup event listeners untuk tombol share
   */
  setupEventListeners() {
    // Setup untuk tombol share
    const shareButtons = this.container.querySelectorAll('.share-button');
    shareButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.handleShare();
      });
    });

    // Setup untuk tombol view all characters
    const viewAllCharsBtn = this.container.querySelector('.view-all-characters-btn');
    if (viewAllCharsBtn) {
      viewAllCharsBtn.addEventListener('click', () => {
        this.showAllCharacters();
      });
    }

    // Setup untuk tombol load more episodes
    const loadMoreBtn = this.container.querySelector('.load-more-episodes');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.loadMoreEpisodes();
      });
    }

    // this.setupInfiniteScroll();

    const bookmarkBtn = this.container.querySelector('.bookmark-button');
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', () => {
        this.toggleBookmark();
      });
    }

    // Setup untuk tombol add to list
    const listBtn = this.container.querySelector('.add-to-list-button');
    if (listBtn) {
      listBtn.addEventListener('click', () => {
        this.toggleList();
      });
    }

    // Setup tooltips
    this.setupTooltips();

    // Setup untuk tombol watch now
    const watchNowBtn = this.container.querySelector('.watch-now-button');
    if (watchNowBtn) {
      watchNowBtn.addEventListener('click', () => {
        this.handleWatchNow();
      });
    }

    // Setup untuk tombol watch now di mobile
    const watchNowBtnMobile = this.container.querySelector('.watch-now-button-mobile');
    if (watchNowBtnMobile) {
      watchNowBtnMobile.addEventListener('click', () => {
        this.handleWatchNowMobile();
      });
    }

    // Setup untuk tombol add to list di mobile
    const listBtnMobile = this.container.querySelector('.add-to-list-button-mobile');
    if (listBtnMobile) {
      listBtnMobile.addEventListener('click', () => {
        this.toggleListMobile();
      });
    }

    // Setup untuk tombol bookmark di mobile
    const bookmarkBtnMobile = this.container.querySelector('.bookmark-button-mobile');
    if (bookmarkBtnMobile) {
      bookmarkBtnMobile.addEventListener('click', () => {
        this.toggleBookmark();
        this.updateBookmarkButtonMobile();
      });
    }

  }

  /**
   * Memperbarui tampilan tombol bookmark di mobile
   */
  updateBookmarkButtonMobile() {
    const bookmarkBtnMobile = this.container.querySelector('.bookmark-button-mobile');
    if (!bookmarkBtnMobile) return;

    const icon = bookmarkBtnMobile.querySelector('i');
    if (this.isBookmarked) {
      icon.className = 'fas fa-bookmark text-yellow-500';
      bookmarkBtnMobile.setAttribute('data-tooltip', 'Remove bookmark');
    } else {
      icon.className = 'fas fa-bookmark';
      bookmarkBtnMobile.setAttribute('data-tooltip', 'Add to bookmarks');
    }
  }
  
/**
   * Menangani klik tombol Watch Now di mobile
   */
  async handleWatchNowMobile() {
    // Tampilkan loading spinner di tombol mobile
    const watchNowBtnMobile = this.container.querySelector('.watch-now-button-mobile');
    if (!watchNowBtnMobile) return;
    
    const originalHtml = watchNowBtnMobile.innerHTML;
    watchNowBtnMobile.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Loading...';
    watchNowBtnMobile.disabled = true;
    
    try {
      // Ambil data episode dari API
      const response = await fetch(`https://mangadb.paukuman.workers.dev/anime?blogID=${this.blogID}&mal_id=${this.malID}&page=episode&limit=10000&offset=0`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch episodes');
      }
      
      const data = await response.json();
      
      // Cari episode pertama
      const firstEpisode = this.findFirstEpisode(data.entries || []);
      
      if (firstEpisode) {
        // Redirect ke episode pertama
        window.location.href = firstEpisode.path;
      } else {
        this.showNotification('No episodes found', 'error');
      }
    } catch (error) {
      console.error('Error fetching episodes:', error);
      this.showNotification('Failed to load episodes', 'error');
    } finally {
      // Kembalikan tombol ke state semula
      watchNowBtnMobile.innerHTML = originalHtml;
      watchNowBtnMobile.disabled = false;
    }
  }

  /**
   * Menangani toggle list di mobile
   */
  toggleListMobile() {
    this.toggleList();
    
    // Update UI untuk tombol mobile
    this.updateListButtonMobile();
  }

  /**
   * Memperbarui tampilan tombol list di mobile
   */
  updateListButtonMobile() {
    const listBtnMobile = this.container.querySelector('.add-to-list-button-mobile');
    if (!listBtnMobile) return;

    const icon = listBtnMobile.querySelector('i');
    if (this.isInList) {
      icon.className = 'fas fa-check';
      listBtnMobile.setAttribute('data-tooltip', 'Remove from list');
    } else {
      icon.className = 'fas fa-plus';
      listBtnMobile.setAttribute('data-tooltip', 'Add to your list');
    }
  }
  setupTooltips() {
    const tooltipElements = this.container.querySelectorAll('[data-tooltip]');

    tooltipElements.forEach(element => {
      // Hapus tooltip lama jika ada
      const oldTooltip = element.querySelector('.tooltip');
      if (oldTooltip) {
        oldTooltip.remove();
      }

      // Buat tooltip baru
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 pointer-events-none transition-opacity group-hover:opacity-100';
      tooltip.textContent = element.getAttribute('data-tooltip');

      // Tambahkan class group ke parent element
      element.classList.add('group', 'relative');

      // Tambahkan tooltip ke element
      element.appendChild(tooltip);
    });
  }
  /**
     * Menangani klik tombol Watch Now
     */
  async handleWatchNow() {
    // Tampilkan loading spinner di tombol
    const watchNowBtn = this.container.querySelector('.watch-now-button');
    if (!watchNowBtn) return;

    const originalHtml = watchNowBtn.innerHTML;
    watchNowBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Loading...';
    watchNowBtn.disabled = true;

    try {
      // Ambil data episode dari API
      const response = await fetch(`https://mangadb.paukuman.workers.dev/anime?blogID=${this.blogID}&mal_id=${this.malID}&page=episode&limit=10000&offset=0`);

      if (!response.ok) {
        throw new Error('Failed to fetch episodes');
      }

      const data = await response.json();

      // Cari episode pertama
      const firstEpisode = this.findFirstEpisode(data.entries || []);

      if (firstEpisode) {
        // Redirect ke episode pertama
        window.location.href = firstEpisode.path;
      } else {
        this.showNotification('No episodes found', 'error');
      }
    } catch (error) {
      console.error('Error fetching episodes:', error);
      this.showNotification('Failed to load episodes', 'error');
    } finally {
      // Kembalikan tombol ke state semula
      watchNowBtn.innerHTML = originalHtml;
      watchNowBtn.disabled = false;
    }
  }

  /**
   * Mencari episode pertama dari daftar episode
   * @param {Array} episodes - Daftar episode
   * @returns {Object|null} Episode pertama atau null jika tidak ditemukan
   */
  findFirstEpisode(episodes) {
    if (!episodes || episodes.length === 0) return null;

    // Ekstrak semua nomor episode dan urutkan
    const episodeNumbers = [];
    const episodeMap = {};

    episodes.forEach(episode => {
      const epNumber = this.extractEpisodeNumber(episode.categories);
      if (epNumber !== null) {
        // Konversi ke angka untuk sorting yang benar (menangani angka desimal)
        const numericValue = parseFloat(epNumber);
        episodeNumbers.push(numericValue);
        episodeMap[numericValue] = episode;
      }
    });

    // Jika tidak ada episode yang ditemukan
    if (episodeNumbers.length === 0) return null;

    // Urutkan nomor episode
    episodeNumbers.sort((a, b) => a - b);

    // Ambil episode dengan nomor terkecil (episode pertama)
    return episodeMap[episodeNumbers[0]];
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
  * Menampilkan modal dengan semua karakter
  */
  showAllCharacters() {
    // Hapus modal karakter yang sudah ada jika ada
    const existingModal = document.getElementById('characters-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Buat modal untuk menampilkan semua karakter
    const charactersModal = document.createElement('div');
    charactersModal.id = 'characters-modal';
    charactersModal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-auto';
    charactersModal.innerHTML = `
      <div class="glass rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6 glass rounded-xl sticky top-0 p-2">
          <h2 class="text-2xl font-bold text-primary-700 dark:text-primary-400">All Characters & Cast</h2>
          <button class="close-characters-modal p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-xl">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          ${this.characterData.map(character => this.renderCharacterModalItem(character)).join('')}
        </div>
      </div>
    `;

    // Tambahkan modal ke body
    document.body.appendChild(charactersModal);

    // Setup event listener untuk tombol close
    charactersModal.querySelector('.close-characters-modal').addEventListener('click', () => {
      charactersModal.remove();
    });

    // Tutup modal ketika klik di luar
    charactersModal.addEventListener('click', (e) => {
      if (e.target === charactersModal) {
        charactersModal.remove();
      }
    });
  }

  /**
   * Renders a character item for the modal
   * @param {Object} character - Character data object
   * @returns {string} HTML string for a character modal item
   */
  renderCharacterModalItem(character) {
    const imageUrl = character.character.images?.jpg?.image_url;
    const isQuestionmarkGif = imageUrl && /questionmark_\d+\.gif/.test(imageUrl);
    const charImage = isQuestionmarkGif ? 'https://placehold.co/100x100' : imageUrl || 'https://placehold.co/100x100';
    const seiyuu = character.voice_actors?.find(va => va.language === 'Japanese');
    const role = character.role || 'Supporting';

    return `
    <div class="text-center bg-white dark:bg-gray-800 rounded p-2 shadow-sm hover:shadow transition-shadow">
      <div class="cast-card w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 mb-1 overflow-hidden rounded-lg mx-auto">
        <img src="${charImage}" alt="${character.character.name}" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/100x100'">
      </div>
      <div class="mb-1">
        <span class="text-xs px-1 py-0.5 rounded-full ${role === 'Main' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}">${role}</span>
      </div>
      <h3 class="font-medium text-xs mb-0.5">${this.truncateName(character.character.name, 12)}</h3>
      ${seiyuu ? `<p class="text-xs text-gray-600 dark:text-gray-400">${this.truncateName(seiyuu.person.name, 10)}</p>` : ''}
    </div>
  `;
  }

  /**
   * Menangani fungsi berbagi
   */
  handleShare() {
    if (navigator.share) {
      // Web Share API tersedia (biasanya di mobile)
      navigator.share(this.shareData)
        .then(() => console.log('Berhasil berbagi'))
        .catch((error) => {
          console.log('Error berbagi:', error);
          this.showCustomShareDialog();
        });
    } else {
      // Web Share API tidak tersedia, tampilkan dialog custom
      this.showCustomShareDialog();
    }
  }

  /**
   * Menampilkan dialog berbagi custom
   */
  showCustomShareDialog() {
    // Hapus dialog share yang sudah ada jika ada
    const existingDialog = document.getElementById('custom-share-dialog');
    if (existingDialog) {
      existingDialog.remove();
    }

    // Buat dialog share
    const shareDialog = document.createElement('div');
    shareDialog.id = 'custom-share-dialog';
    shareDialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    shareDialog.innerHTML = `
      <div class="glass rounded-xl p-6 max-w-md w-full mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold">Bagikan ${this.shareData.title}</h3>
          <button class="close-share-dialog p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="grid grid-cols-4 gap-4 mb-4">
          <button class="share-option flex flex-col items-center p-3 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800" data-platform="facebook">
            <div class="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mb-2">
              <i class="fab fa-facebook-f text-white text-xl"></i>
            </div>
            <span class="text-sm">Facebook</span>
          </button>
          <button class="share-option flex flex-col items-center p-3 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800" data-platform="twitter">
            <div class="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center mb-2">
              <i class="fab fa-twitter text-white text-xl"></i>
            </div>
            <span class="text-sm">Twitter</span>
          </button>
          <button class="share-option flex flex-col items-center p-3 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800" data-platform="whatsapp">
            <div class="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-2">
              <i class="fab fa-whatsapp text-white text-xl"></i>
            </div>
            <span class="text-sm">WhatsApp</span>
          </button>
          <button class="share-option flex flex-col items-center p-3 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800" data-platform="telegram">
            <div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mb-2">
              <i class="fab fa-telegram-plane text-white text-xl"></i>
            </div>
            <span class="text-sm">Telegram</span>
          </button>
        </div>
        <div class="flex items-center">
          <input type="text" readonly value="${this.shareData.url}" class="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-100 dark:bg-gray-800 text-sm">
          <button class="copy-url p-3 bg-primary-500 text-white rounded-r-lg hover:bg-primary-600">
            <i class="fas fa-copy"></i>
          </button>
        </div>
      </div>
    `;

    // Tambahkan dialog ke body
    document.body.appendChild(shareDialog);

    // Setup event listeners untuk dialog
    shareDialog.querySelector('.close-share-dialog').addEventListener('click', () => {
      shareDialog.remove();
    });

    shareDialog.querySelector('.copy-url').addEventListener('click', () => {
      this.copyUrlToClipboard();
      // Ubah icon sementara untuk memberi feedback
      const copyButton = shareDialog.querySelector('.copy-url');
      const originalHtml = copyButton.innerHTML;
      copyButton.innerHTML = '<i class="fas fa-check"></i>';
      setTimeout(() => {
        copyButton.innerHTML = originalHtml;
      }, 2000);
    });

    // Setup untuk platform berbagi
    const shareOptions = shareDialog.querySelectorAll('.share-option');
    shareOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        const platform = e.currentTarget.getAttribute('data-platform');
        this.shareToPlatform(platform);
      });
    });

    // Tutup dialog ketika klik di luar
    shareDialog.addEventListener('click', (e) => {
      if (e.target === shareDialog) {
        shareDialog.remove();
      }
    });
  }

  /**
   * Berbagi ke platform tertentu
   * @param {string} platform - Nama platform
   */
  shareToPlatform(platform) {
    const encodedUrl = encodeURIComponent(this.shareData.url);
    const encodedText = encodeURIComponent(this.shareData.text);

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText} ${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      default:
        console.error('Platform tidak dikenali:', platform);
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  }

  /**
   * Menyalin URL ke clipboard
   */
  copyUrlToClipboard() {
    navigator.clipboard.writeText(this.shareData.url)
      .then(() => {
        console.log('URL disalin ke clipboard');
      })
      .catch(err => {
        console.error('Gagal menyalin URL: ', err);
        // Fallback untuk browser yang tidak mendukung clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = this.shareData.url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      });
  }

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

    // Simpan data untuk share
    this.shareData.title = englishTitle;
    this.shareData.text = `${englishTitle} - ${this.animeData.synopsis ? this.truncateSynopsis(this.animeData.synopsis, 100) : 'Anime series'}`;

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
          <button class="add-to-list-button px-4 py-2 ${this.isInList ? 'bg-green-500' : 'bg-primary-500'
      } text-white rounded-lg hover:${this.isInList ? 'bg-green-600' : 'bg-primary-600'
      } transition-colors" data-tooltip="${this.isInList ? 'Remove from list' : 'Add to your list'
      }">
            <i class="fas ${this.isInList ? 'fa-check' : 'fa-plus'
      } mr-2"></i>${this.isInList ? 'In List' : 'Add to List'}
          </button>
          <button class="watch-now-button px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors" data-tooltip="Watch first episode">
            <i class="fas fa-play mr-2"></i>Watch Now
          </button>
          <button class="p-2 bg-primary-200 dark:bg-primary-800 rounded-lg hover:bg-primary-300 dark:hover:bg-primary-700 transition-colors share-button" data-tooltip="Share">
            <i class="fas fa-share-alt"></i>
          </button>
          <button class="p-2 bookmark-button bg-primary-200 dark:bg-primary-800 rounded-lg hover:bg-primary-300 dark:hover:bg-primary-700 transition-colors" data-tooltip="${this.isBookmarked ? 'Remove bookmark' : 'Add to bookmarks'
      }">
            <i class="fas fa-bookmark ${this.isBookmarked ? 'text-yellow-500' : ''
      }"></i>
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
            <button class="watch-now-button-mobile flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm" data-tooltip="Watch first episode">
              <i class="fas fa-play mr-1"></i>Watch
            </button>
            <button class="add-to-list-button-mobile p-2 bg-primary-200 dark:bg-primary-800 rounded-lg hover:bg-primary-300 dark:hover:bg-primary-700 transition-colors" data-tooltip="${
              this.isInList ? 'Remove from list' : 'Add to your list'
            }">
              <i class="fas ${
                this.isInList ? 'fa-check' : 'fa-plus'
              }"></i>
            </button>
            <button class="bookmark-button-mobile p-2 bg-primary-200 dark:bg-primary-800 rounded-lg hover:bg-primary-300 dark:hover:bg-primary-700 transition-colors" data-tooltip="${
              this.isBookmarked ? 'Remove bookmark' : 'Add to bookmarks'
            }">
              <i class="fas fa-bookmark ${
                this.isBookmarked ? 'text-yellow-500' : ''
              }"></i>
            </button>
            <button class="p-2 bg-primary-200 dark:bg-primary-800 rounded-lg hover:bg-primary-300 dark:hover:bg-primary-700 transition-colors share-button" data-title="${englishTitle}">
              <i class="fas fa-share-alt"></i>
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
      <div class="glass rounded-xl p-6 hidden md:block">
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
    // Pastikan episodeData adalah array sebelum memeriksa length
    if (!this.episodeData || this.episodeData.length === 0) {
      return `
      <div class="glass rounded-xl p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-primary-700 dark:text-primary-400">Episodes</h2>
        </div>
        <div class="text-center py-8 text-gray-500 dark:text-gray-400">
          <i class="fas fa-film text-4xl mb-3"></i>
          <p>No episodes available yet</p>
        </div>
      </div>
    `;
    }

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

      <div class="episodes-list space-y-2">
        ${this.episodeData.map(episode => this.renderEpisodeItem(episode)).join('')}
      </div>

      ${this.hasMoreEpisodes ? `
      <div class="load-more-container mt-4 text-center">
        <button class="load-more-episodes px-4 py-2 bg-primary-200 dark:bg-primary-800 rounded-lg hover:bg-primary-300 dark:hover:bg-primary-700 transition-colors">
          Load More Episodes
        </button>
      </div>
      ` : this.episodeData.length > 10 ? `
      <div class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        All ${this.episodeData.length} episodes loaded
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

    // Extract thumbnail image
    let imageUrl = 'https://via.placeholder.com/80x45';
    const imgMatch = episode.content.match(/src="([^"]+)"/);
    if (imgMatch && imgMatch[1]) {
      imageUrl = imgMatch[1];
    }

    return `
    <div class="episode-item flex items-center p-3 hover:bg-primary-50 dark:hover:bg-primary-800 rounded-lg transition-colors">
      <div class="w-16 h-16 flex-shrink-0 mr-3 hidden sm:block">
        <img src="${imageUrl}" alt="${episode.title}" class="w-full h-full object-cover rounded" onerror="this.src='https://via.placeholder.com/80x45'">
      </div>
      
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-center">
          <h3 class="font-medium truncate">
            <a href="${episode.path}" class="hover:text-primary-600 dark:hover:text-primary-400">${episode.title}</a>
          </h3>
          <div class="flex items-center ml-2 flex-shrink-0">
            ${quality ? `<span class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded mr-1">${quality}</span>` : ''}
            ${resolution ? `<span class="hidden md:block text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1.5 py-0.5 rounded">${resolution}</span>` : ''}
          </div>
        </div>
        
        <div class="flex items-center text-xs text-gray-600 dark:text-gray-400 mt-1">
          ${episodeNumber ? `<span class="mr-3">Ep ${episodeNumber}</span>` : ''}
          <span class="mr-3"><i class="fas fa-clock mr-1"></i>24m</span>
          ${date ? `<span>${date}</span>` : ''}
        </div>
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

    const mainCharacters = this.characterData.slice(0, 12); // Tampilkan lebih banyak karakter

    if (mainCharacters.length === 0) return '';

    return `
    <div class="glass rounded-xl p-4">
      <h2 class="text-xl font-bold mb-3 text-primary-700 dark:text-primary-400">Characters & Cast</h2>

      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
        ${mainCharacters.map(character => this.renderCharacterItem(character)).join('')}
      </div>

      ${this.characterData.length > 12 ? `
      <div class="mt-3 text-center">
        <button class="view-all-characters-btn px-3 py-1.5 text-sm bg-primary-200 dark:bg-primary-800 rounded-lg hover:bg-primary-300 dark:hover:bg-primary-700 transition-colors">
          View All
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
    const imageUrl = character.character.images?.jpg?.image_url;
    const isQuestionmarkGif = imageUrl && /questionmark_\d+\.gif/.test(imageUrl);
    const charImage = isQuestionmarkGif ? 'https://placehold.co/80x80' : imageUrl || 'https://placehold.co/80x80';
    const seiyuu = character.voice_actors?.find(va => va.language === 'Japanese');

    return `
    <div class="text-center">
      <div class="cast-card w-full h-20 bg-gradient-to-br from-gray-400 to-gray-600 mb-1 overflow-hidden rounded-lg mx-auto">
        <img src="${charImage}" alt="${character.character.name}" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/80x80'">
      </div>
      <h3 class="font-medium text-xs leading-tight mb-0.5">${this.truncateName(character.character.name, 15)}</h3>
      ${seiyuu ? `<p class="text-xs text-gray-600 dark:text-gray-400 leading-tight">${this.truncateName(seiyuu.person.name, 12)}</p>` : ''}
    </div>
  `;
  }
  // Tambahkan method helper untuk memotong nama yang panjang
  truncateName(name, maxLength) {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
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


  /**
 * Memuat lebih banyak episode
 */

  async loadMoreEpisodes() {
    if (this.isLoadingEpisodes || !this.hasMoreEpisodes) return;

    await this.fetchEpisodeData(true);

    // Perbarui UI setelah load more
    this.updateEpisodesUI();
  }

  /**
   * Memperbarui UI daftar episode setelah load more
   */
  updateEpisodesUI() {
    const episodesContainer = this.container.querySelector('.episodes-list');
    const loadMoreContainer = this.container.querySelector('.load-more-container');

    if (episodesContainer && this.episodeData) {
      // Render ulang semua episode
      episodesContainer.innerHTML = this.episodeData.map(episode => this.renderEpisodeItem(episode)).join('');
    }

    // Perbarui state tombol load more
    this.updateEpisodeLoadingState(false);
  }


  setupInfiniteScroll() {
    // Anda bisa menambahkan infinite scroll jika diinginkan
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && this.hasMoreEpisodes && !this.isLoadingEpisodes) {
          this.loadMoreEpisodes();
        }
      });
    }, options);

    // Amati elemen sentinel (tambahkan di akhir daftar episode)
    const sentinel = document.createElement('div');
    sentinel.className = 'sentinel';
    this.container.appendChild(sentinel);
    observer.observe(sentinel);
  }

  /**
 * Fetches statistics data from Jikan API
 * @async
 */
  async fetchStatisticsData() {
    // Pastikan MAL ID tersedia sebelum fetch
    if (!this.malID) {
      console.error('MAL ID is not available for statistics fetch');
      this.statisticsData = null;
      return;
    }

    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime/${this.malID}/statistics`);
      if (!response.ok) throw new Error('Statistics API response was not ok');

      const data = await response.json();
      this.statisticsData = data.data || null;

      console.log('Statistics data loaded:', this.statisticsData);
    } catch (error) {
      console.error('Error fetching statistics data:', error);
      this.statisticsData = null;
    }
  }

  /**
   * Renders the statistics section
   * @returns {string} HTML string for the statistics section
   */
  renderStatistics() {
    if (!this.statisticsData) return '';

    const { watching, completed, on_hold, dropped, plan_to_watch, total, scores } = this.statisticsData;
    const statusData = [
      { label: 'Watching', value: watching, color: 'bg-blue-500' },
      { label: 'Completed', value: completed, color: 'bg-green-500' },
      { label: 'On Hold', value: on_hold, color: 'bg-yellow-500' },
      { label: 'Dropped', value: dropped, color: 'bg-red-500' },
      { label: 'Plan to Watch', value: plan_to_watch, color: 'bg-purple-500' }
    ];

    // Hitung persentase untuk setiap status
    statusData.forEach(item => {
      item.percentage = ((item.value / total) * 100).toFixed(1);
    });

    return `
    <div class="glass rounded-xl p-6 mt-6">
      <h2 class="text-xl font-bold mb-4 text-primary-700 dark:text-primary-400">Statistics</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Status Distribution -->
        <div>
          <h3 class="text-lg font-semibold mb-3 text-primary-600 dark:text-primary-400">Status Distribution</h3>
          <div class="space-y-3">
            ${statusData.map(item => `
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">${item.label}</span>
                <span class="text-sm">${this.formatNumber(item.value)} (${item.percentage}%)</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div class="${item.color} h-2.5 rounded-full" style="width: ${item.percentage}%"></div>
              </div>
            `).join('')}
          </div>
          <div class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Total: ${this.formatNumber(total)} Users
          </div>
        </div>
        
        <!-- Score Distribution -->
        <div>
          <h3 class="text-lg font-semibold mb-3 text-primary-600 dark:text-primary-400">Score Distribution</h3>
          <div class="space-y-2">
            ${scores.slice().reverse().map(score => {
      const percentage = ((score.votes / total) * 100).toFixed(1);
      const width = Math.max(5, percentage); // Minimum width 5% untuk visibility

      return `
                <div class="flex items-center">
                  <span class="w-6 text-sm font-medium">${score.score}</span>
                  <div class="flex-1 ml-2">
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div class="bg-gradient-to-r from-primary-500 to-accent-500 h-3 rounded-full" style="width: ${width}%"></div>
                    </div>
                  </div>
                  <span class="w-16 text-right text-xs ml-2">${this.formatNumber(score.votes)} (${percentage}%)</span>
                </div>
              `;
    }).join('')}
          </div>
          <div class="mt-4 flex justify-between items-center text-sm">
            <span class="text-gray-600 dark:text-gray-400">Weighted Score: ${this.animeData.score || 'N/A'}</span>
            <span class="text-gray-600 dark:text-gray-400">Based on ${this.formatNumber(scores.reduce((sum, score) => sum + score.votes, 0))} votes</span>
          </div>
        </div>
      </div>
    </div>
  `;
  }

  /**
   * Renders statistics skeleton
   * @returns {string} HTML string for statistics skeleton
   */
  renderStatisticsSkeleton() {
    return `
    <div class="glass rounded-xl p-6 mt-6">
      <div class="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Status Distribution Skeleton -->
        <div>
          <div class="h-5 w-48 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-3"></div>
          ${Array(5).fill().map(() => `
            <div class="mb-4">
              <div class="flex justify-between mb-1">
                <div class="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                <div class="h-4 w-16 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div class="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2.5 animate-pulse"></div>
            </div>
          `).join('')}
        </div>
        
        <!-- Score Distribution Skeleton -->
        <div>
          <div class="h-5 w-48 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-3"></div>
          ${Array(10).fill().map(() => `
            <div class="flex items-center mb-2">
              <div class="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
              <div class="ml-2 flex-1">
                <div class="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3 animate-pulse"></div>
              </div>
              <div class="h-4 w-12 bg-gray-300 dark:bg-gray-700 rounded animate-pulse ml-2"></div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  }
}


if (document.getElementById('animeinfo-container')) {
  new AnimeInfo();
}

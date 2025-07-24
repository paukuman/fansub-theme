class AnimeEpisodePlayer {
    constructor() {
        this.blogID = document.querySelector('meta[name="blogID"]').content;
        this.postID = document.querySelector('meta[name="postID"]').content;
        this.mainElement = document.querySelector("main");
        this.currentEpisode = null;
        this.episodeData = null;
        this.animeInfo = null;
        this.episodesList = [];
        this.player = null;
    }

    async init() {
        try {
            this.renderSkeleton();
            await this.loadData();
            this.updatePage();
            this.loadPlyr();
        } catch (error) {
            console.error('Error initializing player:', error);
            this.showToast('Failed to load data. Please try again later.', 'error');
        }
    }

    renderSkeleton() {
        this.mainElement.innerHTML = this.getSkeletonHTML();
    }

    getSkeletonHTML() {
        return `
      <div class="glass rounded-xl p-4">
        <h1 class="font-bold md:text-2xl text-xl"></h1>
        <h2 class="dark:text-primary-400 text-primary-600 text-lg"></h2>
      </div>
      
      <div class="glass rounded-xl p-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-medium"></h3>
          <div class="text-sm">
            <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 dark:text-blue-200 rounded text-blue-800"></span>
          </div>
        </div>
        <select class="p-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 glass-select rounded-lg w-full">
          <option>Loading servers...</option>
        </select>
      </div>
      
      <div class="glass rounded-xl overflow-hidden">
        <div class="video-container">
          <iframe allowfullscreen src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>
        </div>
      </div>
      
      <div class="glass rounded-xl p-4 download-box">
        <h3 class="flex items-center font-bold mb-3">
          <i class="fas dark:text-primary-400 fa-download mr-2 text-primary-600"></i> Download Episode
        </h3>
        <div class="gap-2 grid grid-cols-2 md:grid-cols-4">
          <div class="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded"></div>
          <div class="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded"></div>
          <div class="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded"></div>
          <div class="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded"></div>
        </div>
      </div>
      
      <div class="gap-2 grid grid-cols-3">
        <a class="glass dark:hover:bg-primary-700 hover:bg-primary-200 p-3 rounded-lg text-center transition-colors" href="#">
          <i class="fas block mb-1 mx-auto fa-chevron-left"></i> <span class="text-sm">Previous</span>
        </a>
        <a class="glass dark:hover:bg-primary-700 hover:bg-primary-200 p-3 rounded-lg text-center transition-colors" href="#">
          <i class="fas block mb-1 mx-auto fa-list"></i> <span class="text-sm">Episode List</span>
        </a>
        <a class="glass dark:hover:bg-primary-700 hover:bg-primary-200 p-3 rounded-lg text-center transition-colors" href="#">
          <i class="fas block mb-1 mx-auto fa-chevron-right"></i> <span class="text-sm">Next</span>
        </a>
      </div>
      
      <div class="glass rounded-xl p-4">
        <h3 class="font-bold mb-2">Synopsis</h3>
        <p class="text-sm"></p>
      </div>
      
      <div class="glass rounded-xl p-4">
        <div class="flex gap-3 items-start">
          <div class="flex-shrink-0 md:w-24 w-16">
            <div class="flex items-center aspect-[2/3] bg-gradient-to-br from-gray-400 justify-center rounded-lg text-white to-gray-600">
              <i class="fas fa-image"></i>
            </div>
          </div>
          <div>
            <h3 class="text-sm font-bold md:text-base"></h3>
            <div class="flex flex-wrap gap-1 my-1"></div>
            <div class="text-xs dark:text-gray-400 flex items-center md:text-sm text-gray-600">
              <i class="fas fa-star mr-1 text-yellow-500"></i>
              <span></span>
              <span class="mx-2">•</span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    `;
    }

    async loadData() {
        const [episodeResponse, malId] = await this.fetchEpisodeData();
        const [episodesResponse, animeInfoResponse] = await Promise.all([
            this.fetchEpisodesList(malId),
            this.fetchAnimeInfo(malId)
        ]);

        this.episodesList = episodesResponse.entries;
        this.animeInfo = animeInfoResponse.response.entries[0];

        // Parse content
        const parser = new DOMParser();
        const contentDoc = parser.parseFromString(this.episodeData.response.entry.content, 'text/html');

        return {
            streamList: contentDoc.querySelector('streamList'),
            downloadList: contentDoc.querySelector('downloadList')
        };
    }

    async fetchEpisodeData() {
        const response = await fetch(`https://mangadb.paukuman.workers.dev/anime?blogID=${this.blogID}&postID=${this.postID}`);
        const data = await response.json();

        if (data.status !== 200) {
            throw new Error('Failed to fetch episode data');
        }

        this.episodeData = data;
        const entry = data.response.entry;
        this.currentEpisode = entry.categories.find(cat => cat.startsWith('episode:')).split(':')[1];
        const malId = entry.categories.find(cat => cat.startsWith('mal_id:')).split(':')[1];

        return [data, malId];
    }

    async fetchEpisodesList(malId) {
        const response = await fetch(`https://mangadb.paukuman.workers.dev/anime?blogID=${this.blogID}&mal_id=${malId}&page=episode`);
        const data = await response.json();

        if (!data.entries) {
            throw new Error('Failed to fetch episodes list');
        }

        return data;
    }

    async fetchAnimeInfo(malId) {
        const response = await fetch(`https://mangadb.paukuman.workers.dev/anime?blogID=${this.blogID}&mal_id=${malId}&page=animeinfo`);
        const data = await response.json();

        if (!data.response.entries) {
            throw new Error('Failed to fetch anime info');
        }

        return data;
    }

    updatePage() {
        this.updateEpisodeInfo();
        this.updateServerSelection();
        this.updateDownloadOptions();
        this.updateEpisodeNavigation();
        this.updateAnimeInfo();
    }

    updateEpisodeInfo() {
        const episodeTitleDiv = this.mainElement.querySelector('main > div:first-child');
        episodeTitleDiv.querySelector('h1').textContent = this.animeInfo.title;
        episodeTitleDiv.querySelector('h2').textContent = `Episode ${this.currentEpisode}: ${this.episodeData.response.entry.title}`;
    }

    updateServerSelection() {
        const serverSelect = this.mainElement.querySelector('.glass-select');
        serverSelect.innerHTML = '';

        if (!this.streamList) return;

        this.streamList.querySelectorAll('server').forEach(server => {
            const name = server.querySelector('name').textContent;
            const type = server.querySelector('type').textContent;
            const option = new Option(
                `${name} (${type === 'embed/iframe' ? 'Embed' : 'Direct'})`,
                name
            );

            option.dataset.type = type;

            if (type === 'embed/iframe') {
                option.dataset.url = server.querySelector('url').textContent;
            } else {
                option.dataset.qualities = JSON.stringify(
                    Array.from(server.querySelectorAll('data qual')).map(qual => ({
                        text: qual.querySelector('text').textContent,
                        url: qual.querySelector('url').textContent
                    }))
                );
            }

            serverSelect.appendChild(option);
        });

        serverSelect.addEventListener('change', this.handleServerChange.bind(this));
        serverSelect.dispatchEvent(new Event('change'));
    }

    handleServerChange(event) {
        const selectedOption = event.target.options[event.target.selectedIndex];
        const videoContainer = this.mainElement.querySelector('.video-container');

        if (selectedOption.dataset.type === 'embed/iframe') {
            videoContainer.innerHTML = `<iframe src="${selectedOption.dataset.url}" allowfullscreen></iframe>`;
        } else {
            this.setupPlyrPlayer(selectedOption, videoContainer);
        }
    }

    setupPlyrPlayer(option, container) {
        const qualities = JSON.parse(option.dataset.qualities);
        const sources = qualities.map(quality => ({
            src: quality.url,
            type: 'video/mp4',
            size: quality.text
        }));

        container.innerHTML = `
      <video id="player" playsinline controls>
        ${sources.map(source =>
            `<source src="${source.src}" type="${source.type}" size="${source.size}">`
        ).join('')}
      </video>
    `;

        if (window.Plyr) {
            this.player = new Plyr('#player', {
                quality: {
                    default: sources[sources.length - 1].size,
                    options: sources.map(source => source.size),
                    forced: true
                }
            });
        }
    }

    updateDownloadOptions() {
        const downloadGrid = this.mainElement.querySelector('.download-box .grid');
        downloadGrid.innerHTML = '';

        if (!this.downloadList) return;

        this.downloadList.querySelectorAll('download').forEach(download => {
            const quality = download.querySelector('text').textContent;
            const size = download.querySelector('size').textContent;
            const urls = Array.from(download.querySelectorAll('urls data')).map(data => ({
                name: data.querySelector('text').textContent,
                url: data.querySelector('url').textContent
            }));

            const button = document.createElement('button');
            button.className = 'hover:bg-primary-200 text-center transition-colors bg-primary-100 dark:bg-primary-900 dark:hover:bg-primary-800 p-2 rounded';

            button.innerHTML = `
        <div class="font-medium">${quality}</div>
        <div class="text-xs">(${size})</div>
      `;

            button.addEventListener('click', () => {
                this.showDownloadOptions(urls, `${quality} (${size})`);
            });

            downloadGrid.appendChild(button);
        });
    }

    updateEpisodeNavigation() {
        const episodeNav = this.mainElement.querySelector('main > div:nth-last-child(3)');
        episodeNav.innerHTML = `
      <div class="glass rounded-lg p-3">
        <select class="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 episode-select">
          ${this.episodesList.map(ep => {
            const epNumber = ep.categories.find(cat => cat.startsWith('episode:')).split(':')[1];
            return `
              <option value="${ep.path}" ${epNumber === this.currentEpisode ? 'selected' : ''}>
                Episode ${epNumber} - ${ep.title}
              </option>
            `;
        }).join('')}
        </select>
      </div>
    `;

        const episodeSelect = this.mainElement.querySelector('.episode-select');
        episodeSelect.addEventListener('change', (e) => {
            window.location.href = e.target.value;
        });
    }

    updateAnimeInfo() {
        const animeInfoDiv = this.mainElement.querySelector('main > div:last-child');
        const animeTitle = animeInfoDiv.querySelector('h3');
        const animeGenres = animeInfoDiv.querySelector('.flex.flex-wrap.gap-1');
        const animeRating = animeInfoDiv.querySelector('.flex.items-center.text-xs');

        animeTitle.textContent = this.animeInfo.title;
        animeGenres.innerHTML = '';

        // Add genres from categories
        const genreCategories = this.animeInfo.categories.filter(cat =>
            !cat.startsWith('mal_id:') &&
            !cat.startsWith('page:') &&
            !cat.startsWith('rate:') &&
            !cat.startsWith('season:') &&
            !cat.startsWith('status:') &&
            !cat.startsWith('type:')
        );

        genreCategories.forEach(genre => {
            const span = document.createElement('span');
            span.className = 'text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
            span.textContent = genre;
            animeGenres.appendChild(span);
        });

        // Update rating
        const rating = this.animeInfo.categories.find(cat => cat.startsWith('rate:')).split(':')[1];
        animeRating.querySelector('span:first-child').textContent = rating;
    }

    showDownloadOptions(servers, title) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md w-full mx-2">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold">Download ${title}</h3>
          <button class="text-gray-500 hover:text-gray-700">&times;</button>
        </div>
        <div class="space-y-2">
          ${servers.map(server => `
            <a href="${server.url}" target="_blank" class="block p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              ${server.name}
            </a>
          `).join('')}
        </div>
      </div>
    `;

        modal.querySelector('button').addEventListener('click', () => {
            modal.remove();
        });

        document.body.appendChild(modal);
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white ${type === 'error' ? 'bg-red-500' :
                type === 'success' ? 'bg-green-500' :
                    'bg-blue-500'
            }`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    loadPlyr() {
        if (!document.querySelector('link[href^="https://cdn.plyr.io/"]')) {
            const plyrCSS = document.createElement('link');
            plyrCSS.rel = 'stylesheet';
            plyrCSS.href = 'https://cdn.plyr.io/3.7.8/plyr.css';
            document.head.appendChild(plyrCSS);

            const plyrJS = document.createElement('script');
            plyrJS.src = 'https://cdn.plyr.io/3.7.8/plyr.js';
            document.head.appendChild(plyrJS);
        }
    }
}

// Initialize the player
const player = new AnimeEpisodePlayer();
player.init();
document.addEventListener('DOMContentLoaded', async function() {
    // Get blogID and postID from meta tags
    const blogID = document.querySelector('meta[name="blogID"]').content;
    const postID = document.querySelector('meta[name="postID"]').content;

    try {
        // Fetch initial episode data
        const episodeResponse = await fetch(`https://mangadb.paukuman.workers.dev/anime?blogID=${blogID}&postID=${postID}`);
        const episodeData = await episodeResponse.json();
        
        if (episodeData.status !== 200) {
            throw new Error('Failed to fetch episode data');
        }

        const entry = episodeData.response.entry;
        
        // Extract mal_id from categories
        const malId = entry.categories.find(cat => cat.startsWith('mal_id:')).split(':')[1];
        
        // Fetch episode list and anime info in parallel
        const [episodesResponse, animeInfoResponse] = await Promise.all([
            fetch(`https://mangadb.paukuman.workers.dev/anime?blogID=${blogID}&mal_id=${malId}&page=episode`),
            fetch(`https://mangadb.paukuman.workers.dev/anime?blogID=${blogID}&mal_id=${malId}&page=animeinfo`)
        ]);
        
        const episodesData = await episodesResponse.json();
        const animeInfoData = await animeInfoResponse.json();
        
        if (!episodesData.entries || !animeInfoData.response.entries) {
            throw new Error('Failed to fetch additional data');
        }

        // Parse current episode number
        const currentEpisode = entry.categories.find(cat => cat.startsWith('episode:')).split(':')[1];
        
        // Parse XML content
        const parser = new DOMParser();
        const contentDoc = parser.parseFromString(entry.content, 'text/html');
        
        // Extract streamList and downloadList
        const streamList = contentDoc.querySelector('streamList');
        const downloadList = contentDoc.querySelector('downloadList');
        
        // Update the page with all the data
        updatePage({
            entry,
            malId,
            currentEpisode,
            episodes: episodesData.entries,
            animeInfo: animeInfoData.response.entries[0],
            streamList,
            downloadList
        });
        
    } catch (error) {
        console.error('Error loading data:', error);
        // Show error message to user
        showToast('Failed to load data. Please try again later.', 'error');
    }
});

function updatePage(data) {
    const {
        entry,
        malId,
        currentEpisode,
        episodes,
        animeInfo,
        streamList,
        downloadList
    } = data;
    
    // 1. Update Episode Title
    const episodeTitleDiv = document.querySelector('main > div:first-child');
    episodeTitleDiv.querySelector('h1').textContent = animeInfo.title;
    episodeTitleDiv.querySelector('h2').textContent = `Episode ${currentEpisode}: ${entry.title}`;
    
    // 2. Update Server Selection
    const serverSelect = document.querySelector('.glass-select');
    serverSelect.innerHTML = ''; // Clear existing options
    
    if (streamList) {
        const servers = streamList.querySelectorAll('server');
        servers.forEach(server => {
            const name = server.querySelector('name').textContent;
            const type = server.querySelector('type').textContent;
            const option = document.createElement('option');
            option.textContent = `${name} (${type === 'embed/iframe' ? 'Embed' : 'Direct'})`;
            option.dataset.type = type;
            
            if (type === 'embed/iframe') {
                option.dataset.url = server.querySelector('url').textContent;
            } else {
                // Store all quality options for direct links
                option.dataset.qualities = JSON.stringify(
                    Array.from(server.querySelectorAll('data qual')).map(qual => ({
                        text: qual.querySelector('text').textContent,
                        url: qual.querySelector('url').textContent
                    }))
                );
            }
            
            serverSelect.appendChild(option);
        });
        
        // Add event listener for server change
        serverSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const videoContainer = document.querySelector('.video-container');
            
            if (selectedOption.dataset.type === 'embed/iframe') {
                // Embed/Iframe type
                videoContainer.innerHTML = `<iframe src="${selectedOption.dataset.url}" allowfullscreen></iframe>`;
            } else {
                // Direct link type - using Plyr player
                const qualities = JSON.parse(selectedOption.dataset.qualities);
                const sources = qualities.map(quality => ({
                    src: quality.url,
                    type: 'video/mp4',
                    size: quality.text
                }));
                
                videoContainer.innerHTML = `
                    <video id="player" playsinline controls>
                        ${sources.map(source => 
                            `<source src="${source.src}" type="${source.type}" size="${source.size}">`
                        ).join('')}
                    </video>
                `;
                
                // Initialize Plyr player
                const player = new Plyr('#player', {
                    quality: {
                        default: sources[sources.length - 1].size, // Default to highest quality
                        options: sources.map(source => source.size),
                        forced: true
                    }
                });
            }
        });
        
        // Trigger change event to load first server
        serverSelect.dispatchEvent(new Event('change'));
    }
    
    // 3. Update Download Box with Toast functionality
    const downloadBox = document.querySelector('.download-box');
    const downloadGrid = downloadBox.querySelector('.grid');
    downloadGrid.innerHTML = ''; // Clear existing download options
    
    if (downloadList) {
        const downloads = downloadList.querySelectorAll('download');
        downloads.forEach(download => {
            const quality = download.querySelector('text').textContent;
            const size = download.querySelector('size').textContent;
            const urls = Array.from(download.querySelectorAll('urls data')).map(data => ({
                name: data.querySelector('text').textContent,
                url: data.querySelector('url').textContent
            }));
            
            const downloadLink = document.createElement('button');
            downloadLink.className = 'p-2 text-center bg-primary-100 dark:bg-primary-900 rounded hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors';
            
            const qualityDiv = document.createElement('div');
            qualityDiv.className = 'font-medium';
            qualityDiv.textContent = quality;
            
            const sizeDiv = document.createElement('div');
            sizeDiv.className = 'text-xs';
            sizeDiv.textContent = `(${size})`;
            
            downloadLink.appendChild(qualityDiv);
            downloadLink.appendChild(sizeDiv);
            
            downloadLink.addEventListener('click', () => {
                showDownloadOptions(urls, `${quality} (${size})`);
            });
            
            downloadGrid.appendChild(downloadLink);
        });
    }
    
    // 4. Update Episode Navigation with Select Element
    const episodeNav = document.querySelector('main > div:nth-last-child(3)');
    episodeNav.innerHTML = `
        <div class="glass rounded-lg p-3">
            <select class="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 episode-select">
                ${episodes.map((ep, index) => `
                    <option value="${ep.path}" ${ep.categories.includes(`episode:${currentEpisode}`) ? 'selected' : ''}>
                        Episode ${ep.categories.find(cat => cat.startsWith('episode:')).split(':')[1]} - ${ep.title}
                    </option>
                `).join('')}
            </select>
        </div>
    `;
    
    // Add event listener for episode select
    const episodeSelect = document.querySelector('.episode-select');
    episodeSelect.addEventListener('change', function() {
        window.location.href = this.value;
    });
    
    // 5. Update Anime Info
    const animeInfoDiv = document.querySelector('main > div:last-child');
    const animeTitle = animeInfoDiv.querySelector('h3');
    const animeGenres = animeInfoDiv.querySelector('.flex.flex-wrap.gap-1');
    const animeRating = animeInfoDiv.querySelector('.flex.items-center.text-xs');
    
    animeTitle.textContent = animeInfo.title;
    animeGenres.innerHTML = '';
    
    // Add genres from categories
    const genreCategories = animeInfo.categories.filter(cat => 
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
    const rating = animeInfo.categories.find(cat => cat.startsWith('rate:')).split(':')[1];
    animeRating.querySelector('span:first-child').textContent = rating;
}

// Toast notification function
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white ${
        type === 'error' ? 'bg-red-500' : 
        type === 'success' ? 'bg-green-500' : 
        'bg-blue-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Show download options in a modal/toast
function showDownloadOptions(servers, title) {
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

// Load Plyr CSS and JS if not already loaded
function loadPlyr() {
    if (!document.querySelector('link[href^="https://cdn.plyr.io/"]')) {
        const plyrCSS = document.createElement('link');
        plyrCSS.rel = 'stylesheet';
        plyrCSS.href = 'https://cdn.plyr.io/3.7.8/plyr.css';
        document.head.appendChild(plyrCSS);
        
        const plyrJS = document.createElement('script');
        plyrJS.src = 'https://cdn.plyr.io/3.7.8/plyr.js';
        plyrJS.onload = () => {
            // Plyr is ready
            console.log('Plyr loaded successfully');
        };
        document.head.appendChild(plyrJS);
    }
}

// Initialize Plyr when page loads
loadPlyr();
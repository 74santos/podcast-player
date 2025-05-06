// Full JavaScript for Podcast Player

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    const searchHistory = document.getElementById("searchHistory");
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const resetButton = document.getElementById("resetButton");
    const loader = document.getElementById("loader");
    const responseContainer = document.getElementById("response");
    const player = document.getElementById("player");
    const title = document.getElementById("title");
    const datePublished = document.getElementById("datePublished");
    const image = document.getElementById("image");
  
    const playBtn = document.getElementById("play");
    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");
    const currentTimeEl = document.getElementById("current-time");
    const durationEl = document.getElementById("duration");
    const progress = document.getElementById("progress");
    const progressContainer = document.getElementById("progress-container");
  
    let isPlaying = false;

    let recentlyPlayed = [];
  
    function playPodcast() {
      isPlaying = true;
      playBtn.classList.replace("fa-play", "fa-pause");
      player.play();
    }
  
    function pausePodcast() {
      isPlaying = false;
      playBtn.classList.replace("fa-pause", "fa-play");
      player.pause();
    }
  
    playBtn.addEventListener("click", () =>
      isPlaying ? pausePodcast() : playPodcast()
    );
  
    player.addEventListener("timeupdate", updateProgressBar);
    progressContainer.addEventListener("click", setProgressBar);
    prevBtn.addEventListener("click", () => skipTime(-15));
    nextBtn.addEventListener("click", () => skipTime(15));
  
    function updateProgressBar(e) {
      const { duration, currentTime } = e.srcElement;
      const progressPercent = (currentTime / duration) * 100;
      progress.style.width = `${progressPercent}%`;
      formatTime(duration, durationEl);
      formatTime(currentTime, currentTimeEl);
    }
  
    function setProgressBar(e) {
      const width = this.clientWidth;
      const clickX = e.offsetX;
      const { duration } = player;
      player.currentTime = (clickX / width) * duration;
    }
  
    function skipTime(amount) {
      player.currentTime = Math.max(
        0,
        Math.min(player.duration, player.currentTime + amount)
      );
    }


    function saveRecentlyPlayed(episode) {
        recentlyPlayed = recentlyPlayed.filter(ep => ep.enclosureUrl !== episode.enclosureUrl);
        recentlyPlayed.unshift(episode);
        recentlyPlayed = recentlyPlayed.slice(0, 5); // limit to 5
      
        localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
        renderRecentlyPlayed();
      }
      
      function loadRecentlyPlayed() {
        const saved = JSON.parse(localStorage.getItem('recentlyPlayed'));
        if (Array.isArray(saved)) {
          recentlyPlayed = saved;
          renderRecentlyPlayed();
        }
      }
      
  
    function formatTime(time, elName) {
      const hours = Math.floor(time / 3600);
      const minutes = Math.floor((time % 3600) / 60);
      let seconds = Math.floor(time % 60);
  
      if (seconds < 10) seconds = `0${seconds}`;
      const formattedMinutes = hours > 0 && minutes < 10 ? `0${minutes}` : minutes;
  
      elName.textContent =
        hours > 0
          ? `${hours}:${formattedMinutes}:${seconds}`
          : `${minutes}:${seconds}`;
    }
  
    function showLoader() {
      loader.style.display = 'flex';
      responseContainer.style.display = 'none';
    }
  
    function hideLoader() {
      loader.style.display = 'none';
      responseContainer.style.display = 'flex';
    }
  
    function loadSearchHistory() {
      const savedSearches = JSON.parse(localStorage.getItem('searchHistory')) || [];
      resetHistory();
      savedSearches.forEach(searchTerm => {
        const option = document.createElement('option');
        option.value = searchTerm;
        option.textContent = searchTerm;
        searchHistory.appendChild(option);
      });
    }
  
    function resetHistory() {
      searchHistory.innerText = '';
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'Select a Previous Search';
      searchHistory.appendChild(option);
    }
  
    function saveSearchHistory(searchTerm) {
      let savedSearches = JSON.parse(localStorage.getItem('searchHistory')) || [];
      if (!savedSearches.includes(searchTerm)) {
        savedSearches.push(searchTerm);
        localStorage.setItem('searchHistory', JSON.stringify(savedSearches));
      }
    }
  
    searchHistory.addEventListener('change', () => {
      const selectedSearch = searchHistory.value;
      if (selectedSearch) {
        searchInput.value = selectedSearch;
        searchPodcast();
      }
    });
  
    searchButton.addEventListener('click', searchPodcast);
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        searchPodcast();
      }
    });
  
    resetButton.addEventListener('click', () => {
      localStorage.removeItem('searchHistory');
      resetHistory();
      searchInput.value = '';
    });
  
    searchInput.addEventListener('focus', () => {
      searchInput.value = '';
    });
  
    function formatDate(timestamp) {
      const date = new Date(timestamp * 1000);
      return date.toLocaleDateString();
    }
  
    async function searchPodcast() {
      const searchTerm = searchInput.value.trim();
      if (!searchTerm) {
        responseContainer.innerText = 'Please enter a podcast title.';
        return;
      }
  
      saveSearchHistory(searchTerm);
      loadSearchHistory();
      showLoader();
  
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
  
        responseContainer.innerHTML = '';
  
        if (data && data.feeds && data.feeds.length > 0) {
          data.feeds.forEach(podcast => {
            const card = createCard(podcast);
            responseContainer.appendChild(card);
          });
        } else {
          responseContainer.innerText = 'No results found.';
        }
      } catch (error) {
        responseContainer.innerText = `Error: ${error.message}`;
      }
  
      hideLoader();
    }
  
    function createCard(podcast) {
      const card = document.createElement('div');
      card.className = 'card pointer';
  
      const img = document.createElement('img');
      img.src = podcast.image || './images/default-podcast.png';
      img.alt = podcast.title;
      img.onerror = () => {
        img.src = './images/default-podcast.png';
      };
  
      const content = document.createElement('div');
      content.className = 'card-content';
  
      const titleEl = document.createElement('h3');
      titleEl.innerText = podcast.title;
  
      const description = document.createElement('p');
      description.innerText = podcast.description;
  
      const episodeCount = document.createElement('p');
      episodeCount.className = 'episode-count';
      episodeCount.innerText = `Episodes: ${podcast.episodeCount}`;
  
      const pubDate = document.createElement('p');
      pubDate.className = 'pub-date';
      pubDate.innerText = `Newest Episode: ${podcast.newestItemPubdate ? formatDate(podcast.newestItemPubdate) : 'Not Available'}`;
  
      content.appendChild(titleEl);
      content.appendChild(description);
      content.appendChild(episodeCount);
      content.appendChild(pubDate);
  
      card.appendChild(img);
      card.appendChild(content);
  
      card.addEventListener('click', () => loadEpisodes(podcast.itunesId, podcast.episodeCount));
  
      return card;
    }
  
    async function loadEpisodes(feedId, count) {
      showLoader();
  
      try {
        const response = await fetch(`/api/episodes?feedId=${feedId}&max=${count}`);
        const data = await response.json();
  
        responseContainer.textContent = '';
  
        if (data.items && data.items.length > 0) {
          data.items.forEach(episode => {
            const card = createEpisodeCard(episode);
            responseContainer.appendChild(card);
          });
        } else {
          responseContainer.innerText = 'No episodes found.';
        }
      } catch (error) {
        responseContainer.innerText = `Error: ${error.message}`;
      }
  
      hideLoader();
    }
  
    function createEpisodeCard(episode) {
      const card = document.createElement('div');
      card.className = 'card';
  
      const img = document.createElement('img');
      img.src = episode.image || episode.feedImage || './images/default-podcast.png';
      img.alt = episode.title;
      img.onerror = () => {
        img.src = './images/default-podcast.png';
      };
  
      const content = document.createElement('div');
      content.className = 'card-content';
  
      const titleEl = document.createElement('h3');
      titleEl.innerText = episode.title;
  
      const playBtn = document.createElement('i');
      playBtn.className = 'fas fa-play-circle pointer';
      playBtn.title = 'Play';
      playBtn.addEventListener('click', () => loadPodcast(episode));
  
      const pubDate = document.createElement('p');
      pubDate.className = 'pub-date';
      pubDate.innerText = `Published: ${episode.datePublished ? formatDate(episode.datePublished) : 'Not Available'}`;
  
      const description = document.createElement('p');
      description.innerHTML = episode.description || 'No description available.';
  
      content.appendChild(titleEl);
      content.appendChild(playBtn);
      content.appendChild(pubDate);
      content.appendChild(description);
  
      card.appendChild(img);
      card.appendChild(content);
  
      return card;
    }
  
    async function loadPodcast(episode) {
      title.textContent = episode.title;
      datePublished.textContent = `${episode.datePublished ? formatDate(episode.datePublished) : 'Not Available'}`;
      player.src = episode.enclosureUrl;
      image.src = episode.image || episode.feedImage || './images/default-podcast.png';
      player.currentTime = 0;
  
      try {
        await player.play();
        playBtn.classList.replace('fa-play', 'fa-pause');
        isPlaying = true;
      } catch (err) {
        console.warn('Autoplay prevented:', err.message);
        playBtn.classList.replace('fa-pause', 'fa-play');
        isPlaying = false;
      }
  
      navigateToPlayer();
      saveRecentlyPlayed(episode);
    }


// Load Feture Podcasts
    async function loadFeaturedPodcasts() {
        const defaultTerm = "top news"; // you can change this to "comedy", "tech", "science", etc.
        showLoader();
      
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(defaultTerm)}`);
          const data = await response.json();
      
          responseContainer.innerHTML = '';
      
          if (data && data.feeds && data.feeds.length > 0) {
            data.feeds.slice(0, 10).forEach(podcast => {
              const card = createCard(podcast);
              responseContainer.appendChild(card);
            });
          } else {
            responseContainer.innerText = 'No featured podcasts found.';
          }
        } catch (error) {
          responseContainer.innerText = `Error loading featured podcasts: ${error.message}`;
        }
      
        hideLoader();
      }
      
  
    const searchLink = document.getElementById('searchLink');
    const listenLink = document.getElementById('listenLink');
    const searchContainer = document.querySelector('.search-container');
    const mainContainer = document.querySelector('.main-container');
    const playerContainer = document.querySelector('.player-container');
    const queueContainer = document.querySelector('.queue');
  
    searchLink.addEventListener('click', navigateToSearch);
    listenLink.addEventListener('click', navigateToPlayer);
  
    function navigateToSearch() {
        searchContainer.style.display = 'flex';
        mainContainer.style.display = 'flex';
        playerContainer.style.display = 'none';
        queueContainer.style.display = 'none';
    
        searchLink.classList.add('selected');
        listenLink.classList.remove('selected');
    }
  
    function navigateToPlayer() {
        const isMobile = window.innerWidth < 1025;
      
        // Always show the player and queue
        playerContainer.style.display = 'flex';
        queueContainer.style.display = 'flex';
      
        if (isMobile) {
          // Hide left panel only on mobile
          searchContainer.style.display = 'none';
          mainContainer.style.display = 'none';
        } else {
          // Keep everything visible on desktop
          searchContainer.style.display = 'flex';
          mainContainer.style.display = 'flex';
        }
      
        searchLink.classList.remove('selected');
        listenLink.classList.add('selected');
      }
      


  






// Recently Played

    function renderRecentlyPlayed() {
        const queue = document.querySelector('.queue');
        queue.innerHTML = '';
      
        recentlyPlayed.forEach(episode => {
          const item = document.createElement('div');
          item.className = 'queue-item';
      
          const img = document.createElement('img');
          img.src = episode.image || episode.feedImage || './images/podcast-logo-sonicNest.png';
          img.alt = episode.title;
          img.onerror = () => {
            img.src = './images/podcast-logo-sonicNest.png';
          };
      
          const content = document.createElement('div');
          content.className = 'queue-content';
      
          const title = document.createElement('h3');
          title.innerText = episode.title;
      
          const iconContainer = document.createElement('div');
          iconContainer.className = 'icon-container';
      
          const playBtn = document.createElement('i');
          playBtn.className = 'fas fa-play-circle';
          playBtn.title = 'Play Podcast';
          playBtn.addEventListener('click', () => loadPodcast(episode));
      
          const deleteBtn = document.createElement('i');
          deleteBtn.className = 'fas fa-trash-alt';
          deleteBtn.title = 'Remove from Queue';
          deleteBtn.addEventListener('click', () => removeFromRecentlyPlayed(episode));
      
          iconContainer.appendChild(playBtn);
          iconContainer.appendChild(deleteBtn);
          content.appendChild(title);
          content.appendChild(iconContainer);
      
          item.appendChild(img);
          item.appendChild(content);
          queue.appendChild(item);
        });
      }
      
      function removeFromRecentlyPlayed(episode) {
        recentlyPlayed = recentlyPlayed.filter(ep => ep.enclosureUrl !== episode.enclosureUrl);
        localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
        renderRecentlyPlayed();
      }
      
  

      const homeTitle = document.getElementById("homeTitle");

      homeTitle.addEventListener("click", () => {
        // Reset UI state
        searchInput.value = "";
        responseContainer.innerHTML = "";
        
        // Make sure both panels are visible
        searchContainer.style.display = 'flex';
        mainContainer.style.display = 'flex';
        playerContainer.style.display = 'flex';
        queueContainer.style.display = 'flex';
      
        // Reset nav highlighting
        searchLink.classList.add("selected");
        listenLink.classList.remove("selected");
      
        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
      
        // Reload featured podcasts
        loadFeaturedPodcasts();
      });
      
      



    // On page load
    loadFeaturedPodcasts();
    loadRecentlyPlayed();
    loadSearchHistory();
  });
  
  



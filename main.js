const API_KEY = 'HW9uAAQbLwZf1X5wKBJl7V7iraALckdYRP6WT7gXPsNGVI1BmeE3CYS4';
const API_URL_PHOTOS = 'https://api.pexels.com/v1/search';
const API_URL_VIDEOS = 'https://api.pexels.com/videos/search';
const API_URL_CURATED = 'https://api.pexels.com/v1/curated';

const grid = document.getElementById('results-grid');
const title = document.getElementById('results-title');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchType = document.getElementById('search-type');

const navHome = document.getElementById('nav-home');
const navVideos = document.getElementById('nav-videos');
const navLeaderboard = document.getElementById('nav-leaderboard');
const navChallenges = document.getElementById('nav-challenges');

let currentPage = 1;
let currentQuery = '';
let currentType = 'photos';
let isSearchMode = false;
const loadMoreBtn = document.getElementById('load-more-btn');

const user = JSON.parse(localStorage.getItem('snapnloadUser'));

// --- Leaderboard Mock Data and Render ---
const leaderboardData = [
  {
    name: 'Alice Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    uploads: 120,
    likes: 980
  },
  {
    name: 'Bob Smith',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    uploads: 110,
    likes: 870
  },
  {
    name: 'Carla Gomez',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    uploads: 105,
    likes: 820
  },
  {
    name: 'David Lee',
    avatar: 'https://randomuser.me/api/portraits/men/76.jpg',
    uploads: 95,
    likes: 790
  },
  {
    name: 'Emma Brown',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    uploads: 90,
    likes: 760
  },
  {
    name: 'Frank Miller',
    avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
    uploads: 85,
    likes: 700
  },
  {
    name: 'Grace Kim',
    avatar: 'https://randomuser.me/api/portraits/women/23.jpg',
    uploads: 80,
    likes: 690
  }
];

function renderLeaderboard() {
  title.textContent = 'Leaderboard';
  loadMoreBtn.classList.add('hidden');
  grid.innerHTML = `
    <div class="w-full max-w-2xl mx-auto bg-white/80 rounded-3xl shadow-2xl p-8 flex flex-col gap-6">
      <h2 class="text-2xl font-bold text-center mb-2">Top Contributors</h2>
      <div class="flex flex-col gap-4">
        ${leaderboardData.map((user, i) => `
          <div class="flex items-center gap-4 p-4 rounded-xl ${i === 0 ? 'bg-yellow-100 border-2 border-yellow-400 shadow-lg' : i === 1 ? 'bg-gray-100 border-2 border-gray-400' : i === 2 ? 'bg-orange-100 border-2 border-orange-400' : 'bg-white border'}">
            <div class="text-2xl font-bold w-8 text-center ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-500' : i === 2 ? 'text-orange-500' : 'text-gray-400'}">${i + 1}</div>
            <img src="${user.avatar}" alt="avatar" class="w-14 h-14 rounded-full border-4 ${i === 0 ? 'border-yellow-300' : i === 1 ? 'border-gray-300' : i === 2 ? 'border-orange-300' : 'border-gray-200'} shadow" />
            <div class="flex-1">
              <div class="font-semibold text-lg">${user.name}</div>
              <div class="text-sm text-gray-500">${user.uploads} uploads</div>
            </div>
            <div class="flex items-center gap-1 text-pink-600 font-bold text-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z"/></svg>
              ${user.likes}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

async function fetchTrendingImages(page = 1, append = false) {
  if (!grid) return;
  if (!append) title.textContent = 'Trending Free Stock Photos';
  if (!append) grid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-8">Loading trending photos...</div>';
  try {
    const res = await fetch(`${API_URL_CURATED}?per_page=12&page=${page}`, {
      headers: { Authorization: API_KEY }
    });
    const data = await res.json();
    if (append) {
      grid.innerHTML += data.photos.map(renderPexelsCard).join('');
    } else {
      grid.innerHTML = data.photos.map(renderPexelsCard).join('');
    }
    // Show Load More if there are more results
    if (data.photos.length === 12) {
      loadMoreBtn.classList.remove('hidden');
    } else {
      loadMoreBtn.classList.add('hidden');
    }
  } catch (err) {
    grid.innerHTML = '<div class="col-span-full text-center text-red-500 py-8">Error loading trending photos.</div>';
    loadMoreBtn.classList.add('hidden');
  }
}

async function fetchSearchResults(query, type, page = 1, append = false) {
  if (!grid) return;
  if (!append) title.textContent = `Search Results for "${query}"`;
  if (!append) grid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-8">Loading...</div>';
  try {
    let url = type === 'videos' ? API_URL_VIDEOS : API_URL_PHOTOS;
    const res = await fetch(`${url}?query=${encodeURIComponent(query)}&per_page=16&page=${page}`, {
      headers: { Authorization: API_KEY }
    });
    const data = await res.json();
    if (type === 'videos') {
      if (append) {
        grid.innerHTML += data.videos.map(renderPexelsVideoCard).join('');
      } else {
        grid.innerHTML = data.videos.map(renderPexelsVideoCard).join('');
      }
      if (data.videos.length === 16) {
        loadMoreBtn.classList.remove('hidden');
      } else {
        loadMoreBtn.classList.add('hidden');
      }
    } else {
      if (append) {
        grid.innerHTML += data.photos.map(renderPexelsCard).join('');
      } else {
        grid.innerHTML = data.photos.map(renderPexelsCard).join('');
      }
      if (data.photos.length === 16) {
        loadMoreBtn.classList.remove('hidden');
      } else {
        loadMoreBtn.classList.add('hidden');
      }
    }
  } catch (err) {
    grid.innerHTML = '<div class="col-span-full text-center text-red-500 py-8">Error loading results.</div>';
    loadMoreBtn.classList.add('hidden');
  }
}

function renderPexelsCard(photo) {
  return `
    <div class="bg-white rounded-2xl shadow-lg card-hover flex flex-col overflow-hidden group relative">
      <img src="${photo.src.large}" alt="${photo.alt}" class="w-full h-72 object-cover transition-transform duration-200 group-hover:scale-105">
      <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between">
        <div class="flex justify-end p-3 gap-2">
          <button class="like-btn bg-white/80 hover:bg-white rounded-full p-2 shadow transition"><svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z"/></svg></button>
          <button class="copy-btn bg-white/80 hover:bg-white rounded-full p-2 shadow transition" data-link="${photo.url}"><svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg></button>
        </div>
        <div class="flex justify-end p-3">
          <button class="download-btn flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all text-sm shadow" data-url="${photo.src.original}"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 4v12"/></svg> Download</button>
        </div>
      </div>
      <div class="absolute bottom-0 left-0 w-full flex items-center justify-between px-4 py-3 bg-gradient-to-t from-black/70 to-transparent">
        <div class="flex items-center gap-2">
          <img src="https://i.pravatar.cc/32?u=${encodeURIComponent(photo.photographer)}" alt="avatar" class="w-8 h-8 rounded-full border-2 border-white shadow">
          <span class="text-white font-semibold text-sm drop-shadow">${photo.photographer}</span>
        </div>
      </div>
    </div>
  `;
}

function renderPexelsVideoCard(video) {
  return `
    <div class="bg-white rounded-2xl shadow-lg card-hover flex flex-col overflow-hidden group relative">
      <video src="${video.video_files[0].link}" controls class="w-full h-72 object-cover"></video>
      <div class="absolute bottom-0 left-0 w-full flex items-center justify-between px-4 py-3 bg-gradient-to-t from-black/70 to-transparent">
        <div class="flex items-center gap-2">
          <img src="https://i.pravatar.cc/32?u=${encodeURIComponent(video.user.name)}" alt="avatar" class="w-8 h-8 rounded-full border-2 border-white shadow">
          <span class="text-white font-semibold text-sm drop-shadow">${video.user.name}</span>
        </div>
        <a href="${video.video_files[0].link}" download class="hidden group-hover:flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all text-sm shadow">Download</a>
      </div>
    </div>
  `;
}

function setActiveNav(btn) {
  [navHome, navVideos, navLeaderboard, navChallenges].forEach(b => {
    b.classList.remove('bg-black', 'text-white', 'shadow');
    b.classList.add('text-gray-700');
  });
  btn.classList.add('bg-black', 'text-white', 'shadow');
  btn.classList.remove('text-gray-700');
}

if (navHome) {
  navHome.onclick = () => {
    setActiveNav(navHome);
    currentPage = 1;
    isSearchMode = false;
    fetchTrendingImages(currentPage);
    title.textContent = 'Trending Free Stock Photos';
  };
}
if (navVideos) {
  navVideos.onclick = () => {
    setActiveNav(navVideos);
    currentPage = 1;
    isSearchMode = false;
    fetchTrendingVideos(currentPage);
    title.textContent = 'Trending Free Stock Videos';
  };
}
if (navLeaderboard) {
  navLeaderboard.onclick = () => {
    setActiveNav(navLeaderboard);
    renderLeaderboard();
  };
}
if (navChallenges) {
  navChallenges.onclick = () => {
    setActiveNav(navChallenges);
    renderChallenges(true);
  };
}

// Fetch trending videos for Videos tab
async function fetchTrendingVideos(page = 1, append = false) {
  if (!grid) return;
  if (!append) title.textContent = 'Trending Free Stock Videos';
  if (!append) grid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-8">Loading trending videos...</div>';
  try {
    const res = await fetch(`https://api.pexels.com/videos/popular?per_page=12&page=${page}`, {
      headers: { Authorization: API_KEY }
    });
    const data = await res.json();
    if (append) {
      grid.innerHTML += data.videos.map(renderPexelsVideoCard).join('');
    } else {
      grid.innerHTML = data.videos.map(renderPexelsVideoCard).join('');
    }
    if (data.videos.length === 12) {
      loadMoreBtn.classList.remove('hidden');
    } else {
      loadMoreBtn.classList.add('hidden');
    }
  } catch (err) {
    grid.innerHTML = '<div class="col-span-full text-center text-red-500 py-8">Error loading trending videos.</div>';
    loadMoreBtn.classList.add('hidden');
  }
}

// On page load, fetch trending images
window.addEventListener('DOMContentLoaded', () => {
  currentPage = 1;
  isSearchMode = false;
  fetchTrendingImages(currentPage);

  // Search form submit
  if (searchForm && searchInput && searchType) {
    searchForm.onsubmit = (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      const type = searchType.value;
      if (!query) return;
      currentQuery = query;
      currentType = type;
      currentPage = 1;
      isSearchMode = true;
      fetchSearchResults(currentQuery, currentType, currentPage);
    };
  }

  // Load more button
  if (loadMoreBtn) {
    loadMoreBtn.onclick = () => {
      currentPage++;
      if (isSearchMode) {
        fetchSearchResults(currentQuery, currentType, currentPage, true);
      } else {
        fetchTrendingImages(currentPage, true);
      }
    };
  }

  // Discover Photos button in dropdown
  const discoverPhotosLink = document.getElementById('discover-photos-link');
  if (discoverPhotosLink) {
    discoverPhotosLink.addEventListener('click', () => {
      // Close dropdown
      const dropdown = document.getElementById('explore-dropdown');
      if (dropdown) dropdown.classList.add('hidden');
      // Set Home nav active and show trending images
      if (navHome) setActiveNav(navHome);
      currentPage = 1;
      isSearchMode = false;
      fetchTrendingImages(currentPage);
      title.textContent = 'Trending Free Stock Photos';
    });
  }
});

// Add copy and download logic for home page images
// This must be outside DOMContentLoaded to always work

document.body.addEventListener('click', function(e) {
  if (e.target.closest('.copy-btn')) {
    const btn = e.target.closest('.copy-btn');
    const link = btn.getAttribute('data-link');
    navigator.clipboard.writeText(link);
    btn.classList.add('bg-green-200');
    setTimeout(() => btn.classList.remove('bg-green-200'), 800);
  }
  // Download image logic (force download as blob)
  if (e.target.closest('.download-btn')) {
    e.preventDefault();
    const btn = e.target.closest('.download-btn');
    const url = btn.getAttribute('data-url');
    const filename = url.split('/').pop().split('?')[0] || 'pexels-photo.jpg';
    fetch(url, {mode: 'cors'})
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        const tempLink = document.createElement('a');
        tempLink.href = blobUrl;
        tempLink.download = filename;
        document.body.appendChild(tempLink);
        tempLink.click();
        setTimeout(() => {
          document.body.removeChild(tempLink);
          URL.revokeObjectURL(blobUrl);
        }, 100);
      });
  }
});

// --- Challenges Mock Data and Render ---
let challengesPage = 1;
const CHALLENGES_PER_PAGE = 4;
const allChallengesData = [
  {
    title: 'Urban Exploration',
    image: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&w=600',
    description: 'Capture the energy and beauty of city life. Show us your best urban shots!',
    status: 'Active',
    entries: 134
  },
  {
    title: 'Nature Wonders',
    image: 'https://images.pexels.com/photos/34950/pexels-photo.jpg?auto=compress&w=600',
    description: 'From forests to mountains, share your most breathtaking nature photos.',
    status: 'Active',
    entries: 98
  },
  {
    title: 'Portrait Magic',
    image: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&w=600',
    description: 'Showcase the art of portrait photography. Candid or posed, all are welcome!',
    status: 'Ended',
    entries: 210
  },
  {
    title: 'Creative Lighting',
    image: 'https://images.pexels.com/photos/167964/pexels-photo-167964.jpeg?auto=compress&w=600',
    description: 'Play with light and shadow. Submit your most creative lighting shots.',
    status: 'Ended',
    entries: 156
  },
  // More mock challenges
  {
    title: 'Minimalism',
    image: 'https://images.pexels.com/photos/373912/pexels-photo-373912.jpeg?auto=compress&w=600',
    description: 'Less is more! Share your best minimalist photos.',
    status: 'Active',
    entries: 77
  },
  {
    title: 'Food Art',
    image: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&w=600',
    description: 'Delicious and beautiful! Submit your most artistic food shots.',
    status: 'Ended',
    entries: 142
  },
  {
    title: 'Pet Portraits',
    image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&w=600',
    description: 'Show off your furry (or scaly, or feathery) friends!',
    status: 'Active',
    entries: 65
  },
  {
    title: 'Nightscapes',
    image: 'https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg?auto=compress&w=600',
    description: 'Capture the magic of the night. Stars, city lights, and more.',
    status: 'Ended',
    entries: 120
  }
];

function renderChallenges(reset = false) {
  if (reset) challengesPage = 1;
  title.textContent = 'Challenges';
  const start = 0;
  const end = challengesPage * CHALLENGES_PER_PAGE;
  const visibleChallenges = allChallengesData.slice(start, end);
  grid.innerHTML = `
    <div class="challenges-bg w-full max-w-5xl mx-auto">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
        ${visibleChallenges.map(challenge => `
          <div class="challenge-card${challenge.status === 'Ended' ? ' ended' : ''} flex flex-col overflow-hidden group border border-gray-100 hover:shadow-2xl transition">
            <div class="relative h-48 w-full overflow-hidden">
              <img src="${challenge.image}" alt="${challenge.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <span class="challenge-ribbon">${challenge.status}</span>
            </div>
            <div class="flex-1 flex flex-col p-5 gap-2">
              <h3 class="text-xl font-bold mb-1">${challenge.title}</h3>
              <p class="text-gray-600 text-sm mb-2 flex-1">${challenge.description}</p>
              <div class="flex items-center justify-between mt-auto">
                <span class="text-sm text-gray-500 font-semibold">${challenge.entries} entries</span>
                <button class="px-4 py-2 rounded-lg font-semibold shadow text-white ${challenge.status === 'Active' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'} transition">${challenge.status === 'Active' ? 'Participate' : 'View'}</button>
              </div>
            </div>
          </div>
        `).join('')}
        <div class="col-span-full flex justify-center mt-4">
          <button id="load-more-challenges-btn" class="${end >= allChallengesData.length ? 'hidden' : ''} px-6 py-3 rounded-lg font-semibold shadow text-white flex items-center gap-2">
            <span id="load-more-challenges-text">${end >= allChallengesData.length ? '' : 'Load More'}</span>
            <svg id="load-more-challenges-spinner" class="w-5 h-5 animate-spin hidden" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
          </button>
        </div>
      </div>
    </div>
  `;
  // Add event listener for Load More button
  const loadMoreBtnChallenges = document.getElementById('load-more-challenges-btn');
  if (loadMoreBtnChallenges) {
    loadMoreBtnChallenges.onclick = function() {
      const text = document.getElementById('load-more-challenges-text');
      const spinner = document.getElementById('load-more-challenges-spinner');
      if (text) text.textContent = '';
      if (spinner) spinner.classList.remove('hidden');
      loadMoreBtnChallenges.disabled = true;
      setTimeout(() => {
        challengesPage++;
        renderChallenges();
      }, 900);
    };
  }
  // Hide the main load more button
  loadMoreBtn.classList.add('hidden');
} 
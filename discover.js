// discover.js

const API_KEY = 'HW9uAAQbLwZf1X5wKBJl7V7iraALckdYRP6WT7gXPsNGVI1BmeE3CYS4';
const API_URL_CURATED = 'https://api.pexels.com/v1/curated';
const API_URL_SEARCH = 'https://api.pexels.com/v1/search';
const API_URL_VIDEOS = 'https://api.pexels.com/videos/search';

const grid = document.getElementById('results-grid');
const loadMoreBtn = document.getElementById('load-more-btn');
let currentPage = 1;
let currentType = 'photos';
let currentQuery = '';

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
          <a href="${photo.src.original}" download class="download-btn flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all text-sm shadow"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 4v12"/></svg> Download</a>
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

function setActiveTag(topic) {
  document.querySelectorAll('.topic-tag').forEach(btn => {
    if (btn.dataset.topic === topic) {
      btn.classList.add('bg-yellow-400', 'text-black');
    } else {
      btn.classList.remove('bg-yellow-400', 'text-black');
    }
  });
}

// Filter modal logic
const filterModal = document.getElementById('filter-modal');
const filtersBtn = document.getElementById('filters-btn');
const filterApplyBtn = document.getElementById('filter-apply-btn');
const filterClearBtn = document.getElementById('filter-clear-btn');
const filterOrientation = document.getElementById('filter-orientation');
const filterSize = document.getElementById('filter-size');
let selectedColor = '';
document.querySelectorAll('.filter-color').forEach(btn => {
  btn.onclick = function() {
    document.querySelectorAll('.filter-color').forEach(b => b.classList.remove('ring-2', 'ring-blue-500'));
    btn.classList.add('ring-2', 'ring-blue-500');
    selectedColor = btn.dataset.color;
  };
});
if (filtersBtn && filterModal) {
  filtersBtn.onclick = function(e) {
    e.stopPropagation();
    filterModal.classList.toggle('hidden');
  };
  document.addEventListener('click', function(e) {
    if (!filterModal.contains(e.target) && e.target !== filtersBtn) {
      filterModal.classList.add('hidden');
    }
  });
}
if (filterClearBtn) {
  filterClearBtn.onclick = function(e) {
    e.preventDefault();
    filterOrientation.value = '';
    filterSize.value = '';
    selectedColor = '';
    document.querySelectorAll('.filter-color').forEach(b => b.classList.remove('ring-2', 'ring-blue-500'));
  };
}
if (filterApplyBtn) {
  filterApplyBtn.onclick = function(e) {
    e.preventDefault();
    filterModal.classList.add('hidden');
    // Re-fetch with filters
    if (currentQuery) {
      fetchTopicImages(currentQuery);
    } else {
      fetchTrendingImages();
    }
  };
}

async function fetchTopicImages(topic, page = 1, append = false) {
  if (!grid) return;
  const heading = document.getElementById('topic-heading');
  if (heading) heading.textContent = `Free ${capitalize(topic)} Photos`;
  if (!append) grid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-8">Loading...</div>';
  try {
    let url = `${API_URL_SEARCH}?query=${encodeURIComponent(topic)}&per_page=12&page=${page}`;
    if (filterOrientation && filterOrientation.value) url += `&orientation=${filterOrientation.value}`;
    if (filterSize && filterSize.value) url += `&size=${filterSize.value}`;
    if (selectedColor) url += `&color=${selectedColor}`;
    const res = await fetch(url, {
      headers: { Authorization: API_KEY }
    });
    const data = await res.json();
    if (append) {
      grid.innerHTML += data.photos.map(renderPexelsCard).join('');
    } else {
      grid.innerHTML = data.photos.map(renderPexelsCard).join('');
    }
    if (data.photos.length === 12) {
      loadMoreBtn.classList.remove('hidden');
    } else {
      loadMoreBtn.classList.add('hidden');
    }
  } catch (err) {
    grid.innerHTML = '<div class="col-span-full text-center text-red-500 py-8">Error loading photos.</div>';
    loadMoreBtn.classList.add('hidden');
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function fetchTrendingImages(page = 1, append = false) {
  if (!grid) return;
  const heading = document.getElementById('topic-heading');
  if (heading) heading.textContent = 'Trending Free Stock Photos';
  if (!append) grid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-8">Loading trending photos...</div>';
  try {
    // If any filter is set, use the search endpoint with a better default query
    const hasFilters = (filterOrientation && filterOrientation.value) || (filterSize && filterSize.value) || selectedColor;
    let url;
    if (hasFilters) {
      url = `${API_URL_SEARCH}?query=nature&per_page=12&page=${page}`;
      if (filterOrientation && filterOrientation.value) url += `&orientation=${filterOrientation.value}`;
      if (filterSize && filterSize.value) url += `&size=${filterSize.value}`;
      if (selectedColor) url += `&color=${selectedColor}`;
    } else {
      url = `${API_URL_CURATED}?per_page=12&page=${page}`;
    }
    const res = await fetch(url, {
      headers: { Authorization: API_KEY }
    });
    const data = await res.json();
    if (append) {
      grid.innerHTML += data.photos.map(renderPexelsCard).join('');
    } else {
      grid.innerHTML = data.photos.map(renderPexelsCard).join('');
    }
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

document.addEventListener('DOMContentLoaded', function () {
  fetchTrendingImages();
  if (loadMoreBtn) {
    loadMoreBtn.onclick = function () {
      currentPage++;
      fetchTrendingImages(currentPage, true);
    };
  }

  // Join modal logic
  const joinBtn = document.getElementById('join-btn');
  const joinModal = document.getElementById('join-modal');
  const closeJoinModal = document.getElementById('close-join-modal');
  if (joinBtn && joinModal) {
    joinBtn.onclick = function () {
      joinModal.classList.remove('hidden');
    };
  }
  if (closeJoinModal && joinModal) {
    closeJoinModal.onclick = function () {
      joinModal.classList.add('hidden');
    };
  }
  // Optional: close modal on outside click
  if (joinModal) {
    joinModal.addEventListener('click', function (e) {
      if (e.target === joinModal) joinModal.classList.add('hidden');
    });
  }

  const discoverPhotosBtn = document.getElementById('discover-photos-link');
  if (discoverPhotosBtn) {
    discoverPhotosBtn.addEventListener('click', function () {
      window.open('discover.html', '_blank');
    });
  }

  // Topic tag click logic
  const topicTags = document.querySelectorAll('.topic-tag');
  topicTags.forEach(btn => {
    btn.addEventListener('click', function () {
      setActiveTag(btn.dataset.topic);
      currentPage = 1;
      fetchTopicImages(btn.dataset.topic);
    });
  });

  // Load more for topic
  if (loadMoreBtn) {
    loadMoreBtn.onclick = function () {
      const activeTag = document.querySelector('.topic-tag.bg-yellow-400');
      if (activeTag) {
        currentPage++;
        fetchTopicImages(activeTag.dataset.topic, currentPage, true);
      } else {
        currentPage++;
        fetchTrendingImages(currentPage, true);
      }
    };
  }

  // Search bar logic
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const searchType = document.getElementById('search-type');
  if (searchForm && searchInput && searchType) {
    searchForm.onsubmit = function (e) {
      e.preventDefault();
      const query = searchInput.value.trim();
      const type = searchType.value;
      if (!query) return;
      currentQuery = query;
      currentType = type;
      currentPage = 1;
      setActiveTab(type);
      if (type === 'photos') {
        fetchTopicImages(query);
      } else {
        fetchVideoResults(query);
      }
    };
  }

  // Tabs logic
  const tabPhotos = document.getElementById('tab-photos');
  const tabVideos = document.getElementById('tab-videos');
  const tabUsers = document.getElementById('tab-users');
  function setActiveTab(tab) {
    [tabPhotos, tabVideos, tabUsers].forEach(btn => btn.classList.remove('bg-black', 'text-white'));
    if (tab === 'photos') tabPhotos.classList.add('bg-black', 'text-white');
    if (tab === 'videos') tabVideos.classList.add('bg-black', 'text-white');
    if (tab === 'users') tabUsers.classList.add('bg-black', 'text-white');
  }
  if (tabPhotos) tabPhotos.onclick = function () {
    setActiveTab('photos');
    currentType = 'photos';
    currentPage = 1;
    if (currentQuery) {
      fetchTopicImages(currentQuery);
    } else {
      fetchTrendingImages();
    }
  };
  if (tabVideos) tabVideos.onclick = function () {
    setActiveTab('videos');
    currentType = 'videos';
    currentPage = 1;
    if (currentQuery) {
      fetchVideoResults(currentQuery);
    } else {
      fetchTrendingVideos();
    }
  };
  if (tabUsers) tabUsers.onclick = function () {
    setActiveTab('users');
    // Placeholder: Show users coming soon
    grid.innerHTML = '<div class="col-span-full text-center text-2xl text-gray-500 py-16">Users coming soon!</div>';
  };

  // More button for topic tags (scroll right)
  const topicTagsRow = document.getElementById('topic-tags');
  const moreTagsBtn = document.getElementById('more-tags-btn');
  if (topicTagsRow && moreTagsBtn) {
    moreTagsBtn.onclick = function () {
      topicTagsRow.scrollBy({ left: 300, behavior: 'smooth' });
    };
  }

  // Copy link logic
  document.body.addEventListener('click', function(e) {
    if (e.target.closest('.copy-btn')) {
      const btn = e.target.closest('.copy-btn');
      const link = btn.getAttribute('data-link');
      navigator.clipboard.writeText(link);
      btn.classList.add('bg-green-200');
      setTimeout(() => btn.classList.remove('bg-green-200'), 800);
    }
  });

  // Topic tags slider logic
  const tagsRow = document.getElementById('topic-tags');
  const scrollLeftBtn = document.getElementById('tags-scroll-left');
  const scrollRightBtn = document.getElementById('tags-scroll-right');
  function updateTagSliderButtons() {
    if (!tagsRow) return;
    // Show left button if not at far left
    if (tagsRow.scrollLeft > 10) {
      scrollLeftBtn.classList.remove('hidden');
    } else {
      scrollLeftBtn.classList.add('hidden');
    }
    // Show right button if not at far right
    if (tagsRow.scrollWidth - tagsRow.clientWidth - tagsRow.scrollLeft > 10) {
      scrollRightBtn.classList.remove('hidden');
    } else {
      scrollRightBtn.classList.add('hidden');
    }
  }
  if (scrollLeftBtn && tagsRow) {
    scrollLeftBtn.onclick = () => {
      tagsRow.scrollBy({ left: -200, behavior: 'smooth' });
    };
  }
  if (scrollRightBtn && tagsRow) {
    scrollRightBtn.onclick = () => {
      tagsRow.scrollBy({ left: 200, behavior: 'smooth' });
    };
  }
  if (tagsRow) {
    tagsRow.addEventListener('scroll', updateTagSliderButtons);
    window.addEventListener('resize', updateTagSliderButtons);
    setTimeout(updateTagSliderButtons, 300);
  }

  // Auth/Profile logic
  const navbar = joinBtn.parentElement;
  const authModal = document.getElementById('auth-modal');
  const closeAuthModal = document.getElementById('close-auth-modal');
  const tabRegister = document.getElementById('tab-register');
  const tabLogin = document.getElementById('tab-login');
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const authError = document.getElementById('auth-error');
  const profileModal = document.getElementById('profile-modal');
  const closeProfileModal = document.getElementById('close-profile-modal');
  const profileForm = document.getElementById('profile-form');
  const logoutBtn = document.getElementById('logout-btn');
  const registerPhoto = document.getElementById('register-photo');
  const profilePhoto = document.getElementById('profile-photo');
  const profileAvatarPreview = document.getElementById('profile-avatar-preview');
  const registerAvatarPreview = document.getElementById('register-avatar-preview');
  const registerAvatarPreviewContainer = document.getElementById('register-avatar-preview-container');
  // Modal tab switching with last active tab memory
  tabRegister.onclick = function() {
    tabRegister.classList.add('border-blue-600', 'text-blue-600');
    tabLogin.classList.remove('border-blue-600', 'text-blue-600');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    authError.classList.add('hidden');
    moveTabUnderline('register');
    setTimeout(() => {
      document.getElementById('register-name').focus();
    }, 50);
    localStorage.setItem('snapnloadAuthTab', 'register');
  };
  tabLogin.onclick = function() {
    tabLogin.classList.add('border-blue-600', 'text-blue-600');
    tabRegister.classList.remove('border-blue-600', 'text-blue-600');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    authError.classList.add('hidden');
    moveTabUnderline('login');
    setTimeout(() => {
      document.getElementById('login-identifier').focus();
    }, 50);
    localStorage.setItem('snapnloadAuthTab', 'login');
  };
  // Show correct modal with last active tab
  function showAuthModal() {
    const lastTab = localStorage.getItem('snapnloadAuthTab') || 'register';
    if (lastTab === 'login') {
      tabLogin.classList.add('border-blue-600', 'text-blue-600');
      tabRegister.classList.remove('border-blue-600', 'text-blue-600');
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
      authError.classList.add('hidden');
      moveTabUnderline('login');
      setTimeout(() => {
        moveTabUnderline('login');
        document.getElementById('login-email').focus();
      }, 50);
    } else {
      tabRegister.classList.add('border-blue-600', 'text-blue-600');
      tabLogin.classList.remove('border-blue-600', 'text-blue-600');
      registerForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
      authError.classList.add('hidden');
      moveTabUnderline('register');
      setTimeout(() => {
        moveTabUnderline('register');
        document.getElementById('register-name').focus();
      }, 50);
    }
    authModal.classList.remove('hidden');
  }
  function showProfileModal() {
    profileModal.classList.remove('hidden');
    const user = JSON.parse(localStorage.getItem('snapnloadUser'));
    if (user) {
      document.getElementById('profile-name').value = user.name;
      document.getElementById('profile-email').value = user.email;
      if (user.photo) {
        profileAvatarPreview.src = user.photo;
        profileAvatarPreview.classList.remove('hidden');
      } else {
        profileAvatarPreview.classList.add('hidden');
      }
    }
  }
  // Join/Profile button logic
  function updateNavbarUser() {
    const user = JSON.parse(localStorage.getItem('snapnloadUser'));
    let profileBtn = document.getElementById('profile-btn');
    if (user) {
      if (!profileBtn) {
        profileBtn = document.createElement('button');
        profileBtn.id = 'profile-btn';
        profileBtn.className = 'ml-2 px-5 py-2 bg-black text-white rounded-full font-semibold shadow hover:bg-gray-900 transition flex items-center gap-2';
        navbar.replaceChild(profileBtn, joinBtn);
      }
      profileBtn.innerHTML = user.photo ? `<img src="${user.photo}" alt="avatar" class="w-8 h-8 rounded-full border-2 border-white shadow">` : '';
      profileBtn.innerHTML += `<span>${user.name || 'Profile'}</span>`;
      profileBtn.onclick = showProfileModal;
    } else {
      if (profileBtn) {
        navbar.replaceChild(joinBtn, profileBtn);
      }
      joinBtn.onclick = showAuthModal;
    }
  }
  updateNavbarUser();
  // Register
  registerForm.onsubmit = async function(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const dob = document.getElementById('register-dob').value;
    let photo = '';
    if (registerPhoto && registerPhoto.files && registerPhoto.files[0]) {
      photo = await toBase64(registerPhoto.files[0]);
    }
    if (!name || !email || !password || !confirmPassword || !dob) return;
    if (password !== confirmPassword) {
      authError.textContent = 'Passwords do not match.';
      authError.classList.remove('hidden');
      return;
    }
    localStorage.setItem('snapnloadUser', JSON.stringify({ name, email, password, photo, dob }));
    authModal.classList.add('hidden');
    updateNavbarUser();
  };
  // Login
  loginForm.onsubmit = function(e) {
    e.preventDefault();
    const identifier = document.getElementById('login-identifier').value.trim();
    const password = document.getElementById('login-password').value;
    const user = JSON.parse(localStorage.getItem('snapnloadUser'));
    if (!user || (user.email !== identifier && user.name !== identifier) || user.password !== password) {
      authError.textContent = 'Invalid name/email or password.';
      authError.classList.remove('hidden');
      return;
    }
    authModal.classList.add('hidden');
    updateNavbarUser();
  };
  // Profile edit
  profileForm.onsubmit = async function(e) {
    e.preventDefault();
    const name = document.getElementById('profile-name').value.trim();
    const email = document.getElementById('profile-email').value.trim();
    let photo = '';
    if (profilePhoto && profilePhoto.files && profilePhoto.files[0]) {
      photo = await toBase64(profilePhoto.files[0]);
    } else {
      const user = JSON.parse(localStorage.getItem('snapnloadUser'));
      photo = user && user.photo ? user.photo : '';
    }
    const user = JSON.parse(localStorage.getItem('snapnloadUser'));
    if (user) {
      localStorage.setItem('snapnloadUser', JSON.stringify({ ...user, name, email, photo }));
    }
    profileModal.classList.add('hidden');
    updateNavbarUser();
  };
  // Show preview on photo change
  if (profilePhoto) {
    profilePhoto.onchange = function() {
      if (profilePhoto.files && profilePhoto.files[0]) {
        toBase64(profilePhoto.files[0]).then(base64 => {
          profileAvatarPreview.src = base64;
          profileAvatarPreview.classList.remove('hidden');
        });
      }
    };
  }
  // Avatar preview for register (improved for new file input)
  if (registerPhoto) {
    registerPhoto.onchange = function() {
      if (registerPhoto.files && registerPhoto.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          registerAvatarPreview.src = e.target.result;
          registerAvatarPreview.classList.remove('hidden');
        };
        reader.readAsDataURL(registerPhoto.files[0]);
      }
    };
  }
  // Logout
  logoutBtn.onclick = function() {
    localStorage.removeItem('snapnloadUser');
    profileModal.classList.add('hidden');
    updateNavbarUser();
  };
  // Close modals
  if (closeAuthModal && authModal) {
    closeAuthModal.onclick = function () {
      authModal.classList.add('hidden');
    };
  }
  if (closeProfileModal && profileModal) {
    closeProfileModal.onclick = function () {
      profileModal.classList.add('hidden');
    };
  }
  // Optional: close modal on outside click
  if (authModal) {
    authModal.addEventListener('click', function (e) {
      if (e.target === authModal) authModal.classList.add('hidden');
    });
  }
  if (profileModal) {
    profileModal.addEventListener('click', function (e) {
      if (e.target === profileModal) profileModal.classList.add('hidden');
    });
  }
  // Helper: file to base64
  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  // Animated tab underline
  const tabUnderline = document.getElementById('tab-underline');
  function moveTabUnderline(activeTab) {
    if (activeTab === 'register') {
      tabUnderline.style.left = '0%';
    } else {
      tabUnderline.style.left = '50%';
    }
  }
  tabRegister.onclick = function() {
    moveTabUnderline('register');
  };
  tabLogin.onclick = function() {
    moveTabUnderline('login');
  };
  moveTabUnderline('register');
  // Profile avatar upload overlay logic
  const profileAvatarUploadBtn = document.getElementById('profile-avatar-upload-btn');
  if (profileAvatarUploadBtn && profilePhoto) {
    profileAvatarUploadBtn.onclick = function(e) {
      e.preventDefault();
      profilePhoto.click();
    };
  }
});

// --- Video Fetching ---
async function fetchVideoResults(query, page = 1, append = false) {
  if (!grid) return;
  const heading = document.getElementById('topic-heading');
  if (heading) heading.textContent = `Free ${capitalize(query)} Videos`;
  if (!append) grid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-8">Loading...';
  try {
    const res = await fetch(`${API_URL_VIDEOS}?query=${encodeURIComponent(query)}&per_page=12&page=${page}`, {
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
    grid.innerHTML = '<div class="col-span-full text-center text-red-500 py-8">Error loading videos.</div>';
    loadMoreBtn.classList.add('hidden');
  }
}

async function fetchTrendingVideos(page = 1, append = false) {
  if (!grid) return;
  const heading = document.getElementById('topic-heading');
  if (heading) heading.textContent = 'Trending Free Stock Videos';
  if (!append) grid.innerHTML = '<div class="col-span-full text-center text-gray-400 py-8">Loading trending videos...';
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
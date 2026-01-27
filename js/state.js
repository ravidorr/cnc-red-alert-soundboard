// ============================================
// State - Application state and DOM elements
// ============================================

// Application state
export const state = {
    audioPlayer: null,
    currentlyPlaying: null,
    searchTerm: '',
    deferredInstallPrompt: null,
    favorites: [],
    recentlyPlayed: [],
    isMuted: false,
};

// DOM Elements
export const elements = {
    contentArea: null,
    categoryNav: null,
    searchInput: null,
    clearSearch: null,
    totalFavorites: null,
    visibleSounds: null,
    nowPlaying: null,
    nowPlayingTitle: null,
    audioPlayer: null,
    installPrompt: null,
    btnInstall: null,
    btnDismiss: null,
    installBtn: null,
    toastContainer: null,
    mobileMenuToggle: null,
    mobileMenuOverlay: null,
    sidebar: null,
    searchEmptyState: null,
    searchEmptyTerm: null,
    btnClearSearch: null,
    randomSoundBtn: null,
};

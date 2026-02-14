/* ============================================
   VIDEO HEADER MANAGER
   ============================================ */

/**
 * Manages the video background sequence for the header.
 * Uses a playlist of video URLs and crossfades between them.
 */
const VideoManager = (() => {
    // Configuration
    const CONFIG = {
        transitionDuration: 1500, // ms
        slideDuration: 10000,     // ms
        videos: [] // Unused in this version, using PLAYLIST below
    };

    // Orchard/Nature themed videos from local assets
    const PLAYLIST = [
        'assets/videos/5857693-uhd_3840_2160_25fps.mp4',
        'assets/videos/5944788-hd_1920_1080_25fps.mp4',
        'assets/videos/istockphoto-2256687292-640_adpp_is.mp4'
    ];

    let currentVideoIndex = 0;
    let videoContainer = null;
    let activeVideo = null;
    let nextVideo = null;
    let interval = null;

    function init() {
        // Create container in body (fixed background for all screens)
        videoContainer = document.createElement('div');
        videoContainer.className = 'global-video-background';
        document.body.insertBefore(videoContainer, document.body.firstChild);

        // Load first video
        playNextVideo();

        // Start loop
        interval = setInterval(playNextVideo, CONFIG.slideDuration);
    }

    function playNextVideo() {
        const url = PLAYLIST[currentVideoIndex];

        // Create new video element
        const vid = document.createElement('video');
        vid.src = url;
        vid.autoplay = true;
        vid.muted = true;
        vid.loop = false; // We handle loop by switching
        vid.playsInline = true;
        vid.className = 'header-video incoming';

        // Handle load
        vid.onloadeddata = () => {
            vid.classList.add('active');
            if (activeVideo) {
                activeVideo.classList.remove('active');
                activeVideo.classList.add('outgoing');
                setTimeout(() => {
                    if (activeVideo && activeVideo.parentElement) {
                        activeVideo.parentElement.removeChild(activeVideo);
                    }
                    activeVideo = vid; // New video becomes active
                    vid.classList.remove('incoming');
                }, CONFIG.transitionDuration);
            } else {
                activeVideo = vid;
                vid.classList.remove('incoming');
            }
        };

        // Handle error (skip to next)
        vid.onerror = () => {
            console.warn('Video failed to load:', url);
            // Try next one immediately
            currentVideoIndex = (currentVideoIndex + 1) % PLAYLIST.length;
            // Clear this broken video
            if (vid.parentElement) vid.parentElement.removeChild(vid);
        };

        videoContainer.appendChild(vid);

        // Advance index
        currentVideoIndex = (currentVideoIndex + 1) % PLAYLIST.length;
    }

    return {
        init
    };
})();

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => {
    VideoManager.init();
});

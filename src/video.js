const VideoManager = (() => {
    const CONFIG = {
        transitionDuration: 1500,
        slideDuration: 10000
    };

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
        videoContainer = document.createElement('div');
        videoContainer.className = 'global-video-background';
        document.body.insertBefore(videoContainer, document.body.firstChild);

        playNextVideo();

        interval = setInterval(playNextVideo, CONFIG.slideDuration);
    }

    function playNextVideo() {
        const url = PLAYLIST[currentVideoIndex];

        const vid = document.createElement('video');
        vid.src = url;
        vid.autoplay = true;
        vid.muted = true;
        vid.loop = false;
        vid.playsInline = true;
        vid.className = 'header-video incoming';

        vid.onloadeddata = () => {
            vid.classList.add('active');
            if (activeVideo) {
                activeVideo.classList.remove('active');
                activeVideo.classList.add('outgoing');
                setTimeout(() => {
                    if (activeVideo && activeVideo.parentElement) {
                        activeVideo.parentElement.removeChild(activeVideo);
                    }
                    activeVideo = vid;
                    vid.classList.remove('incoming');
                }, CONFIG.transitionDuration);
            } else {
                activeVideo = vid;
                vid.classList.remove('incoming');
            }
        };

        vid.onerror = () => {
            console.warn('Video failed to load:', url);
            currentVideoIndex = (currentVideoIndex + 1) % PLAYLIST.length;
            if (vid.parentElement) vid.parentElement.removeChild(vid);
        };

        videoContainer.appendChild(vid);

        currentVideoIndex = (currentVideoIndex + 1) % PLAYLIST.length;
    }

    return {
        init
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    VideoManager.init();
});

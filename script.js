document.addEventListener('DOMContentLoaded', () => {
    initStars();
    initGlobalMusic();
    initWelcomeScreen();
    initCurrentPageComponents();
    setupSPARouting();
});

function initWelcomeScreen() {
    const welcome = document.getElementById('welcomeOverlay');
    const enterBtn = document.getElementById('btnEnterWebsite');
    
    if (!welcome) return;

    if (sessionStorage.getItem('vesakEntered') === 'true') {
        welcome.classList.add('hidden');
        welcome.remove();
    } else {
        if (enterBtn) {
            enterBtn.addEventListener('click', () => {
                localStorage.setItem('vesakMusicEnabled', 'true');
                playGlobalMusic();
                
                sessionStorage.setItem('vesakEntered', 'true');
                welcome.classList.add('hidden');
                
                setTimeout(() => {
                    welcome.remove();
                }, 800);
            });
        }
    }
}

function initCurrentPageComponents() {
    if (document.getElementById('pandalSvg')) {
        initThorana();
    }

    if (document.getElementById('audioPlaylist')) {
        initAudioPlayer();
    }

    if (document.getElementById('cardCanvas')) {
        initCardGenerator();
    }

    if (document.getElementById('daysBox')) {
        initCountdown();
    }
}

function setupSPARouting() {
    document.body.addEventListener('click', (e) => {
        const anchor = e.target.closest('a');
        if (!anchor) return;
        
        const href = anchor.getAttribute('href');
        if (href) {
            const pageName = href.split('/').pop();
            if (pageName === 'index.html' || pageName === 'thorana.html' || pageName === 'card-genarate.html') {
                e.preventDefault();
                navigateToPage(href);
            }
        }
    });

    window.addEventListener('popstate', (e) => {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        navigateToPage(path, false);
    });
}

function navigateToPage(url, pushState = true) {
    const pathName = url.split('/').pop();
    
    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error("Navigation failed");
            return res.text();
        })
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            document.title = doc.title;
            
            cleanupPreviousPage();
            
            const newMain = doc.querySelector('main');
            const currentMain = document.querySelector('main');
            if (newMain && currentMain) {
                currentMain.outerHTML = newMain.outerHTML;
                const updatedMain = document.querySelector('main');
                if (updatedMain) {
                    updatedMain.classList.add('spa-transition-fade');
                }
            }
            
            document.querySelectorAll('nav ul li').forEach(li => {
                const a = li.querySelector('a');
                if (a) {
                    const aHref = a.getAttribute('href').split('/').pop();
                    if (aHref === pathName) {
                        li.classList.add('active');
                    } else {
                        li.classList.remove('active');
                    }
                }
            });
            
            const welcome = document.getElementById('welcomeOverlay');
            if (welcome) {
                welcome.classList.add('hidden');
                welcome.remove();
            }
            
            if (pushState) {
                history.pushState({ url }, '', url);
            }
            
            initCurrentPageComponents();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .catch(err => {
            console.warn("SPA navigation fallback to reload:", err);
            window.location.href = url;
        });
}

function cleanupPreviousPage() {
    if (lightInterval) {
        clearInterval(lightInterval);
        lightInterval = null;
    }
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
    isAutoPlaying = false;
    if (spiralAnimFrame) {
        cancelAnimationFrame(spiralAnimFrame);
        spiralAnimFrame = null;
    }
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
}

/* ==========================================
   1. STARFIELD & FLOATING LANTERNS
   ========================================== */
function initStars() {
    const starContainer = document.querySelector('.stars');
    if (!starContainer) return;

    const starCount = window.innerWidth < 768 ? 80 : 150;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 3 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDuration = `${Math.random() * 3 + 2}s`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        starContainer.appendChild(star);
    }

    setInterval(spawnLantern, 4500);
}

function spawnLantern() {
    const lantern = document.createElement('div');
    lantern.className = 'lantern-float';
    lantern.style.left = `${Math.random() * 100}vw`;
    const size = Math.random() * 40 + 30;
    lantern.style.width = `${size}px`;
    lantern.style.height = `${size}px`;
    lantern.style.animationDuration = `${Math.random() * 15 + 20}s`;
    document.body.appendChild(lantern);
    setTimeout(() => lantern.remove(), 35000);
}

/* ==========================================
   2. AMBIENT AUDIO & PLAYLIST SYNTH ENGINE
   ========================================== */
const audioTracks = [
    {
        name: "Budu Bana Padayak",
        sinhala: "බුදු බණ පදයක්",
        artist: "Mangala Denex",
        src: "assets/audio/Budu Bana Padayak (බුදු බණ පදයක්) - Mangala Denex (Hiru Star) (Official Music Video) - Desawana Music (youtube).mp3"
    },
    {
        name: "Sidhdhartha Gautham",
        sinhala: "සිද්ධාර්ථ ගෞතම්",
        artist: "Viraj Perera",
        src: "assets/audio/Sidhdhartha Gautham (සිද්ධාර්ථ ගෞතම්) - Viraj Perera  [Official Audio] - VIP Music (youtube).mp3"
    },
    {
        name: "Sambudu Ruwa",
        sinhala: "සම්බුදු රුව",
        artist: "Vidusha Rajaguru",
        src: "assets/audio/Vidusha Rajaguru - Sambudu Ruwa (සම්බුදු රුව)  Official Music Video - Vidusha Rajaguru (youtube).mp3"
    },
    {
        name: "Nidukanane",
        sinhala: "නිදුකාණන් වහන්සේ",
        artist: "Aksha Chamudi",
        src: "assets/audio/Nidukanane - Aksha Chamudi Official Music Video - TB Recordz (youtube).mp3"
    },
    {
        name: "Thathagathayanane",
        sinhala: "තථාගතයාණන් වහන්සේ",
        artist: "Viraj Perera",
        src: "assets/audio/Thathagathayanane - Viraj Perera (youtube).mp3"
    },
    {
        name: "Sambuddha Raja",
        sinhala: "සම්බුද්ධ රාජා",
        artist: "Viraj Perera",
        src: "assets/audio/Viraj Perera - Sambuddha Raja (සම්බුද්ධ රාජා)  Official Music Video - Viraj Perera (youtube).mp3"
    }
];

let audioCtx = null;
let synthInterval = null;
let isSynthPlaying = false;
let isAudioPlaying = false;
let currentTrackIndex = 0;
let audioPlayer = new Audio();
audioPlayer.volume = 0.5;

// Global track end event -> auto-advances playlist
audioPlayer.onended = () => {
    currentTrackIndex = (currentTrackIndex + 1) % audioTracks.length;
    
    const playlistSelect = document.getElementById('audioPlaylist');
    const songDisplay = document.getElementById('songDisplay');
    const playPauseBtn = document.getElementById('btnAudioPlayPause');

    if (playlistSelect && songDisplay) {
        if (playlistSelect.value !== 'synth') {
            playlistSelect.value = currentTrackIndex;
            changeTrack(currentTrackIndex);
        }
    } else {
        // Just play next song
        audioPlayer.src = audioTracks[currentTrackIndex].src;
        playGlobalMusic();
    }
};

function initGlobalMusic() {
    const globalPlayBtn = document.getElementById('btnGlobalMusic');
    if (!globalPlayBtn) return;

    if (!audioPlayer.src || audioPlayer.src === "") {
        audioPlayer.src = audioTracks[currentTrackIndex].src;
    }

    globalPlayBtn.addEventListener('click', () => {
        if (isAudioPlaying) {
            localStorage.setItem('vesakMusicEnabled', 'false');
            pauseGlobalMusic();
        } else {
            localStorage.setItem('vesakMusicEnabled', 'true');
            playGlobalMusic();
        }
    });

    // If music was enabled, resume playback on the first user interaction
    const resumeOnInteraction = () => {
        if (localStorage.getItem('vesakMusicEnabled') === 'true' && !isAudioPlaying) {
            playGlobalMusic();
        }
        window.removeEventListener('click', resumeOnInteraction);
        window.removeEventListener('keydown', resumeOnInteraction);
    };
    window.addEventListener('click', resumeOnInteraction);
    window.addEventListener('keydown', resumeOnInteraction);

    isAudioPlaying = false;
    updateGlobalMusicUI();
}

function playGlobalMusic() {
    if (!audioPlayer.src || audioPlayer.src === "") {
        audioPlayer.src = audioTracks[currentTrackIndex].src;
    }

    if (isSynthPlaying) {
        stopAmbientSynth();
        isSynthPlaying = false;
        const playPauseBtn = document.getElementById('btnAudioPlayPause');
        if (playPauseBtn) playPauseBtn.innerText = "▶ Play Synth";
    }

    audioPlayer.play()
        .then(() => {
            isAudioPlaying = true;
            updateGlobalMusicUI();
        })
        .catch(err => {
            console.log("Autoplay blocked. Click page or header button to start music.");
            isAudioPlaying = false;
            updateGlobalMusicUI();
        });
}

function pauseGlobalMusic() {
    audioPlayer.pause();
    isAudioPlaying = false;
    updateGlobalMusicUI();
}

function updateGlobalMusicUI() {
    const globalPlayBtn = document.getElementById('btnGlobalMusic');
    if (globalPlayBtn) {
        if (isAudioPlaying) {
            globalPlayBtn.innerText = "⏸️ Music Off";
            globalPlayBtn.classList.add('playing');
        } else {
            globalPlayBtn.innerText = "🔊 Music On";
            globalPlayBtn.classList.remove('playing');
        }
    }

    // Sync with sidebar dashboard controls if on thorana.html
    const playPauseBtn = document.getElementById('btnAudioPlayPause');
    const songDisplay = document.getElementById('songDisplay');
    const playlistSelect = document.getElementById('audioPlaylist');

    if (playPauseBtn && songDisplay && playlistSelect) {
        if (playlistSelect.value !== 'synth') {
            playlistSelect.value = currentTrackIndex;
            const track = audioTracks[currentTrackIndex];
            songDisplay.innerText = `🎵 ${track.sinhala} - ${track.artist}`;
            playPauseBtn.innerText = isAudioPlaying ? "⏸️ Pause" : "▶ Play Music";
        }
    }

    // Show/hide the now-playing toast
    if (isAudioPlaying) {
        const track = audioTracks[currentTrackIndex];
        showNowPlayingToast(track);
    } else {
        hideNowPlayingToast();
    }

    // Update thorana audio status bar if present
    const thoranaStatus = document.getElementById('thoranaAudioStatus');
    if (thoranaStatus) {
        if (isAudioPlaying) {
            const track = audioTracks[currentTrackIndex];
            thoranaStatus.style.color = '#ffd700';
            thoranaStatus.innerHTML = `🎵 Now Playing: <strong>${track.sinhala}</strong> — ${track.artist}`;
        } else {
            thoranaStatus.style.color = '';
            thoranaStatus.innerHTML = `🔊 Press <strong style="color:var(--color-yellow)">Music On</strong> in the header to start devotional music.`;
        }
    }
}

let toastTimer = null;
function showNowPlayingToast(track) {
    let toast = document.getElementById('nowPlayingToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'nowPlayingToast';
        toast.className = 'now-playing-toast';
        toast.innerHTML = `
            <div class="now-playing-bars">
                <span></span><span></span><span></span><span></span>
            </div>
            <div class="now-playing-info">
                <span class="now-playing-label-sm">Now Playing</span>
                <span class="now-playing-title" id="toastTrackTitle"></span>
                <span class="now-playing-artist" id="toastTrackArtist"></span>
            </div>
            <button class="now-playing-close" onclick="pauseGlobalMusic(); localStorage.setItem('vesakMusicEnabled','false');">✕</button>
        `;
        document.body.appendChild(toast);
    }
    document.getElementById('toastTrackTitle').innerText = track.sinhala;
    document.getElementById('toastTrackArtist').innerText = track.artist;
    requestAnimationFrame(() => toast.classList.add('visible'));

    // Auto-hide after 5s
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => hideNowPlayingToast(), 5000);
}

function hideNowPlayingToast() {
    const toast = document.getElementById('nowPlayingToast');
    if (toast) toast.classList.remove('visible');
}

// attemptAutoplay removed - music is fully manual-control only

function initAudioPlayer() {
    const playPauseBtn = document.getElementById('btnAudioPlayPause');
    const playlistSelect = document.getElementById('audioPlaylist');
    const volumeSlider = document.getElementById('audioVolume');
    const songDisplay = document.getElementById('songDisplay');

    if (!playPauseBtn || !playlistSelect || !volumeSlider || !songDisplay) return;

    audioPlayer.volume = parseFloat(volumeSlider.value);

    // If music is already playing globally, sync UI
    if (isAudioPlaying) {
        playlistSelect.value = currentTrackIndex;
        const track = audioTracks[currentTrackIndex];
        songDisplay.innerText = `🎵 ${track.sinhala} - ${track.artist}`;
        playPauseBtn.innerText = "⏸️ Pause";
    }

    playPauseBtn.addEventListener('click', () => {
        const val = playlistSelect.value;
        if (val === 'synth') {
            toggleSynthBellPlaying();
        } else {
            toggleTrackPlaying();
        }
    });

    playlistSelect.addEventListener('change', () => {
        const val = playlistSelect.value;
        if (val === 'synth') {
            stopAudioTrack();
            songDisplay.innerText = "🔔 Temple Bell Chimes";
            toggleSynthBellPlaying(true);
        } else {
            stopAmbientSynth();
            isSynthPlaying = false;
            changeTrack(parseInt(val));
        }
    });

    volumeSlider.addEventListener('input', (e) => {
        audioPlayer.volume = parseFloat(e.target.value);
    });
}

function changeTrack(index) {
    currentTrackIndex = index;
    const playPauseBtn = document.getElementById('btnAudioPlayPause');
    const songDisplay = document.getElementById('songDisplay');
    const track = audioTracks[index];

    audioPlayer.src = track.src;
    songDisplay.innerText = `🎵 ${track.sinhala} - ${track.artist}`;
    
    audioPlayer.play()
        .then(() => {
            isAudioPlaying = true;
            if (playPauseBtn) playPauseBtn.innerText = "⏸️ Pause";
            updateGlobalMusicUI();
        })
        .catch(err => {
            console.error("Audio playback error:", err);
            songDisplay.innerText = "⚠️ Click Play to start";
            isAudioPlaying = false;
            if (playPauseBtn) playPauseBtn.innerText = "▶ Play";
            updateGlobalMusicUI();
        });
}

function toggleTrackPlaying() {
    const playPauseBtn = document.getElementById('btnAudioPlayPause');
    const playlistSelect = document.getElementById('audioPlaylist');
    const songDisplay = document.getElementById('songDisplay');
    const idx = parseInt(playlistSelect.value);

    if (!audioPlayer.src || audioPlayer.src === "") {
        const track = audioTracks[idx];
        audioPlayer.src = track.src;
        songDisplay.innerText = `🎵 ${track.sinhala} - ${track.artist}`;
    }

    if (isAudioPlaying) {
        pauseGlobalMusic();
    } else {
        currentTrackIndex = idx;
        playGlobalMusic();
    }
}

function toggleSynthBellPlaying(forceStart = false) {
    const playPauseBtn = document.getElementById('btnAudioPlayPause');
    const songDisplay = document.getElementById('songDisplay');

    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (isSynthPlaying && !forceStart) {
        stopAmbientSynth();
        isSynthPlaying = false;
        if (playPauseBtn) playPauseBtn.innerText = "▶ Play Synth";
        if (songDisplay) songDisplay.innerText = "🔔 Synth Paused";
    } else {
        startAmbientSynth();
        isSynthPlaying = true;
        if (playPauseBtn) playPauseBtn.innerText = "⏸️ Pause Synth";
        if (songDisplay) songDisplay.innerText = "🔔 Temple Bell Chimes";
    }
}

function stopAudioTrack() {
    audioPlayer.pause();
    isAudioPlaying = false;
    updateGlobalMusicUI();
}

function startAmbientSynth() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playBell(220);
    playBell(330);
    const notes = [220, 277.18, 329.63, 369.99, 440, 554.37, 659.25];
    if (synthInterval) clearInterval(synthInterval);
    synthInterval = setInterval(() => {
        playBell(notes[Math.floor(Math.random() * notes.length)]);
        if (Math.random() > 0.6) {
            setTimeout(() => playBell(notes[Math.floor(Math.random() * notes.length)]), 600);
        }
    }, 3500);
}

function stopAmbientSynth() {
    if (synthInterval) { clearInterval(synthInterval); synthInterval = null; }
}

function playBell(frequency) {
    if (!audioCtx || audioCtx.state === 'suspended') return;
    try {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, now);

        const overtone = audioCtx.createOscillator();
        const overtoneGain = audioCtx.createGain();
        overtone.type = 'sine';
        overtone.frequency.setValueAtTime(frequency * 1.5, now);

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(150, now + 4);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 6);

        overtoneGain.gain.setValueAtTime(0, now);
        overtoneGain.gain.linearRampToValueAtTime(0.04, now + 0.04);
        overtoneGain.gain.exponentialRampToValueAtTime(0.001, now + 3);

        osc.connect(gain); gain.connect(filter);
        overtone.connect(overtoneGain); overtoneGain.connect(filter);
        filter.connect(audioCtx.destination);
        osc.start(now);
        overtone.start(now);
        osc.stop(now + 6);
        overtone.stop(now + 3);
    } catch (e) {
        console.warn(e);
    }
}

const jatakaStories = {
    sasa: [
        {
            titleSi: "01. මහා අධිෂ්ඨානය",
            titleEn: "01. The Devotional Vow",
            textSi: "පින්බර පොහෝ දිනක සාවා, උණහපුළුවා, සිවලා සහ වඳුරා එක්ව සිල් සමාදන් වීමට අදිටන් කර ගත්හ. සාවා තම යහළුවන්ට කරුණාවෙන් ධර්මය දේශනා කරමින්, පැමිණෙන ඕනෑම යාචකයෙකුට ආහාර දීමට පොරොන්දු විය.",
            textEn: "On a sacred Full Moon Poya day, the wise hare, the otter, the jackal, and the monkey gathered in the forest and vowed to keep the holy precepts. The virtuous hare preached the Dhamma to his friends, urging them to offer food to any hungry traveler who passed by.",
            img: "assets/sasa-jathakaya/sasa-jathakaya-maha-adishtanaya.png",
            fallbackIcon: "🐇"
        },
        {
            titleSi: "02. දන් සෙවීම",
            titleEn: "02. Gathering the Offerings",
            textSi: "අනෙක් සතුන් දානය සඳහා ආහාර සෙවූහ. උණහපුළුවා මසුන් ද, සිවලා මුදවාපු කිරි කළයක් ද, වඳුරා අඹ ගෙඩි ද සොයා ගත්හ. එහෙත් සාවාට සොයා ගත හැකි වූයේ තණකොළ පමණි.",
            textEn: "The friends went in search of food to offer as alms. The otter caught fresh fish, the jackal found a jar of curd, and the monkey gathered sweet mangoes. However, the gentle hare could only find grass, which was unfit for humans.",
            img: "assets/sasa-jathakaya/sasa-jathakaya-dan-seweema.jpg",
            fallbackIcon: "🐟"
        },
        {
            titleSi: "03. ජීවිත දානය",
            titleEn: "03. The Ultimate Sacrifice",
            textSi: "සාවා තමා සතුව දීමට කිසිවක් නැති බව වටහාගෙන, මහත් ශ්‍රද්ධාවෙන් යුතුව තම ශරීරයම දන් දීමට අදිටන් කර ගත්තේය. 'කවුරුන් හෝ පැමිණියහොත් මම මගේම මාංශයෙන් ඔහුව පෝෂණය කරමි' යි සාවා සිතීය.",
            textEn: "Realizing he had nothing suitable to offer, the hare resolved with pure faith to sacrifice his own life. 'If a guest arrives, I shall offer my own flesh to feed them,' the noble hare selflessly decided under the glowing moon.",
            img: "assets/sasa-jathakaya/sasa-jathakaya-jeewitha-danaya.png",
            fallbackIcon: "🐇"
        },
        {
            titleSi: "04. ශක්‍ර දේවේන්ද්‍රයාගේ පරීක්ෂණය",
            titleEn: "04. The Divine Test",
            textSi: "සතුන්ගේ අදිටන පරීක්ෂා කරනු පිණිස ශක්‍ර දේවේන්ද්‍රයා මහලු බ්‍රාහ්මණයෙකුගේ වේශයෙන් පැමිණියේය. සෙසු මිතුරන් තම තමන් සොයාගත් ආහාර පූජා කළ අතර, සාවා දානය සඳහා ගිනි ගොඩක් සූදානම් කරන ලෙස පැවසීය.",
            textEn: "To test their virtue, Lord Sakra, king of the gods, descended disguised as a hungry, old Brahmin. While the other animals offered their collected food, the hare joyfully requested the Brahmin to prepare a fire so he could offer his body.",
            img: "assets/sasa-jathakaya/sasa-jathakaya-pareekshanaya.png",
            fallbackIcon: "🔥"
        },
        {
            titleSi: "05. ශශ ලාංඡනය",
            titleEn: "05. The Eternal Tribute",
            textSi: "සාවා කිසිදු පැකිලීමකින් තොරව රක්ත වර්ණ ගින්නට පැන්නේය. එහෙත් ඔහුගේ උදාර ගුණය නිසා ගින්න සිසිල් විය. පැහැදුණු ශක්‍ර දේවේන්ද්‍රයා සාවාගේ රූපය සදාකාලික සිහිවටනයක් ලෙස සඳ මත ඇන්දේය.",
            textEn: "With complete selflessness, the hare leapt into the blazing fire. Yet, due to his supreme virtue, the flames turned cold. Overwhelmed with admiration, Lord Sakra revealed his divine form and painted the hare's image on the moon forever.",
            img: "assets/sasa-jathakaya/sasa-jathakaya-shasha-laxchanya.png",
            fallbackIcon: "🌕"
        }
    ],
    kuru: [
        {
            titleSi: "01. රජතුමාගේ දැහැමි පාලනය",
            titleEn: "01. The Righteous Reign",
            textSi: "කුරු රට ධනංජය රජතුමා දස රාජ ධර්මයෙන් සහ උතුම් කුරු ධර්මයෙන් (පංච ශීලයෙන්) රට පාලනය කළේය. රට වැසියන් ද දැහැමි දිවියක් ගත කළහ.",
            textEn: "King Dhananjaya of Kuru ruled his country with the Ten Royal Virtues and the noble Kuru Dharma (Five Precepts). The citizens also led a righteous life.",
            img: "assets/kuru-dharma-jathakaya/1.png",
            fallbackIcon: "👑"
        },
        {
            titleSi: "02. කාලිංගයේ නියඟය",
            titleEn: "02. The Drought of Kalinga",
            textSi: "අසල්වැසි කාලිංග දේශයට දරුණු නියඟයක් ඇති වූ අතර, මිනිස්සු සාගින්නෙන් පෙළුණහ. කුරු රටේ සිටින මංගල හස්තිරාජයා නිසා වැසි ලැබෙන බව සිතූ කාලිංග වැසියෝ හස්තියා ඉල්ලා සිටියහ.",
            textEn: "The neighboring Kalinga kingdom suffered a severe drought, leading to widespread famine. Believing the auspicious state elephant of Kuru brought rain, Kalinga requested it.",
            img: "assets/kuru-dharma-jathakaya/2.jpg",
            fallbackIcon: "🐘"
        },
        {
            titleSi: "03. හස්ති රාජයා දන් දීම",
            titleEn: "03. Almsgiving of the Elephant",
            textSi: "ධනංජය රජතුමා කිසිදු මසුරුකමකින් තොරව තම මංගල හස්තිරාජයා කාලිංග දේශයෙන් පැමිණි බ්‍රාහ්මණයන්ට දන් දුන්නේය. එහෙත් කාලිංගයට වැසි නොලැබුණි.",
            textEn: "King Dhananjaya selflessly donated his prized royal elephant to the Brahmins of Kalinga. However, the drought in Kalinga persisted even after the offering.",
            img: "assets/kuru-dharma-jathakaya/3.png",
            fallbackIcon: "🌧️"
        },
        {
            titleSi: "04. කුරු ධර්මය සෙවීම",
            titleEn: "04. Seeking the Kuru Dharma",
            textSi: "වැසි නොලැබුණේ රජුගේ ධර්මයේ බලයෙන් බව වටහාගත් කාලිංග දූතයෝ, රජුගෙන් සහ රාජකීයයන්ගෙන් කුරු ධර්මය (පංච ශීලය) ලියා ගැනීමට පැමිණියහ.",
            textEn: "Realizing the rain was due to the moral power of the Kuru ruler, messengers from Kalinga came to write down the Kuru Dharma (Five Precepts) from the King.",
            img: "assets/kuru-dharma-jathakaya/4.png",
            fallbackIcon: "📜"
        },
        {
            titleSi: "05. වැසි වැටී සශ්‍රීක වීම",
            titleEn: "05. Showers of Prosperity",
            textSi: "කුරු ධර්මය ගෙන ගොස් කාලිංගයේදී එය සමාදන් වූ වහාම මහා වැසි වැටී නියඟය දුරු විය. මුළු දේශයම සශ්‍රීකත්වයෙන් හා සන්තෝෂයෙන් පිරී ගියේය.",
            textEn: "As soon as the Kuru Dharma was brought and practiced in Kalinga, heavy rains fell, ending the drought. The entire land became fertile and prosperous.",
            img: "assets/kuru-dharma-jathakaya/5.png",
            fallbackIcon: "🌾"
        }
    ],
    dahamsonda: [
        {
            titleSi: "01. ධර්ම පිපාසය",
            titleEn: "01. Thirst for Dhamma",
            textSi: "දහම්සොඬ රජතුමා බණ ඇසීමට මහත් කැමැත්තක් දැක්වීය. බුදුන් වහන්සේ ලොව පහල නොවූ යුගයක, බණ පදයක් කියා දෙන කෙනෙකුට මුළු රාජ්‍යයම දීමට රජු පොරොන්දු විය.",
            textEn: "King Dahamsonda had an intense desire to hear the Buddha's teachings. In an era when no Buddha was present, he promised to give his entire kingdom to anyone who could teach him a single stanza.",
            img: "assets/daham-soda-jathakaya/1.png",
            fallbackIcon: "👑"
        },
        {
            titleSi: "02. රාජ්‍යය හැරයාම",
            titleEn: "02. Leaving the Kingdom",
            textSi: "නුවර කොතැනකවත් බණ දන්නා අයෙකු නොසිටි බැවින්, රජතුමා සිහසුන අතහැර ධර්මය සොයා ඝන වනාන්තරයට පිවිසුණේය.",
            textEn: "Finding no one in the kingdom who knew the Dhamma, the King abandoned his throne and ventured into the deep forest in search of holy stanzas.",
            img: "assets/daham-soda-jathakaya/2.png",
            fallbackIcon: "🚶"
        },
        {
            titleSi: "03. රක්ෂසයා හමුවීම",
            titleEn: "03. Encountering the Demon",
            textSi: "රජුගේ උදාර අදිටන පරීක්ෂා කරනු පිණිස ශක්‍ර දේවේන්ද්‍රයා බියකරු රක්ෂසයෙකුගේ වේශයෙන් පෙනී සිට බණ පදයක් දන්නා බව පැවසීය.",
            textEn: "To test the King's resolve, Lord Sakra appeared as a terrifying demon (Rakshasa) and claimed he knew a sacred stanza of the Dhamma.",
            img: "assets/daham-soda-jathakaya/3.png",
            fallbackIcon: "👹"
        },
        {
            titleSi: "04. ජීවිතය පූජා කිරීම",
            titleEn: "04. Leap of Faith",
            textSi: "බණ කීමට පෙර රක්ෂසයාට තමාගේ ශරීරය දිය යුතු බව පැවසූ විට, රජු සතුටින් උස් කන්දකින් රක්ෂසයාගේ මුඛයට පැනීමට එකඟ විය.",
            textEn: "The demon demanded the King's body as food before preaching. The King happily agreed to jump from a high cliff into the demon's mouth to hear the Dhamma.",
            img: "assets/daham-soda-jathakaya/4.png",
            fallbackIcon: "⛰️"
        },
        {
            titleSi: "05. ධර්ම දානය",
            titleEn: "05. The Divine Reward",
            textSi: "රජු පහළට පනින විට රක්ෂසයා ශක්‍ර දේවේන්ද්‍රයා බවට පත්ව රජුව සුරක්ෂිතව පිළිගෙන, බණ පද දේශනා කර රාජ්‍යය නැවත ලබා දුන්නේය.",
            textEn: "As the King leaped, the demon transformed back into Lord Sakra, caught him safely, preached the stanzas, and restored him to his rightful throne.",
            img: "assets/daham-soda-jathakaya/5.png",
            fallbackIcon: "✨"
        }
    ],
    sama: [
        {
            titleSi: "01. අන්ධ දෙමාපියන් රැකීම",
            titleEn: "01. Caring for Blind Parents",
            textSi: "සාම කුමාරයා වනාන්තරයේ වෙසෙමින් සිය අන්ධ දෙමාපියන්ට මහත් ආදරයෙන් උපස්ථාන කළේය. වනයේ සිටි සියලු සත්වයෝ සාම කුමාරයාට මිත්‍රශීලී වූහ.",
            textEn: "Sama lived in the forest, caring for his blind parents with immense love. Even the wild animals of the forest were friendly and walked with him.",
            img: "assets/saama-jathakaya/1.png",
            fallbackIcon: "👨‍👩‍👦"
        },
        {
            titleSi: "02. පැන් රැගෙන ඒම",
            titleEn: "02. Fetching Water",
            textSi: "සාම කුමාරයා දෙමාපියන් උදෙසා පැන් රැගෙන ඒමට මුවන් පිරිවරාගෙන ගඟට යන පුරුද්දක් තිබුණි. සතුන් ඔහු කෙරෙහි කිසිදු බියක් දැක්වූයේ නැත.",
            textEn: "Sama used to go to the river surrounded by deer to fetch water for his parents. The animals felt completely safe in his peaceful presence.",
            img: "assets/saama-jathakaya/2.png",
            fallbackIcon: "💧"
        },
        {
            titleSi: "03. විෂ ඊතලය වැදීම",
            titleEn: "03. The Poisoned Arrow",
            textSi: "දඩයමේ ආ පිලියක්ඛ රජතුමා සාම කුමාරයාව දැක මුවෙකු යැයි සිතා විෂ ඊතලයකින් විද්දේය. ඊතලය වැදුණු සාම කුමාරයා මියයමින් දෙමාපියන් ගැන වැලපුණේය.",
            textEn: "King Piliyakkha, who was hunting, mistook Sama for a deer and shot him with a poisoned arrow. As he lay dying, Sama only wept for his helpless parents.",
            img: "assets/saama-jathakaya/3.png",
            fallbackIcon: "🏹"
        },
        {
            titleSi: "04. රජුගේ පසුතැවීම",
            titleEn: "04. The King's Repentance",
            textSi: "තමා විද්දේ අහිංසක තරුණයෙකුට බව වටහාගත් රජතුමා මහත් සේ පසුතැවී, සාමගේ දෙමාපියන්ට උපකාර කිරීමට පොරොන්දු වී ඔවුන්ව සාම සිටි තැනට කැඳවාගෙන ආවේය.",
            textEn: "Realizing he had shot a noble youth, the King repented deeply. He promised to serve the blind parents and led them to Sama's body.",
            img: "assets/saama-jathakaya/4.png",
            fallbackIcon: "😢"
        },
        {
            titleSi: "05. සත්‍ය ක්‍රියාවෙන් පණ ලැබීම",
            titleEn: "05. Power of Truth",
            textSi: "දෙමාපියන්ගේ සහ බහූසොඬී දේවියගේ සත්‍ය ක්‍රියාවෙන් සාම කුමාරයාගේ විෂ නැසී නැවත පණ ලැබූ අතර, දෙමාපියන්ගේ ඇස් ද පෙනීමට පටන් ගත්තේය.",
            textEn: "Through the act of truth performed by his parents and the goddess Bahusodari, the poison vanished. Sama arose healthy, and his parents' sight was miraculously restored.",
            img: "assets/saama-jathakaya/5.png",
            fallbackIcon: "✨"
        }
    ],
    silava: [
        {
            titleSi: "01. මහා සීලව රජතුමා",
            titleEn: "01. King Mahasilava",
            textSi: "සීලව රජතුමා මහා ඉවසීමකින් සහ මෛත්‍රියකින් රට පාලනය කළ දැහැමි රජෙකි. ඔහු කිසිම සතුරෙකුට එරෙහිව අවි ඔසවන්නට කැමති වූයේ නැත.",
            textEn: "King Mahasilava was a righteous king who ruled Benares with supreme patience and loving-kindness. He refused to raise weapons against anyone.",
            img: "assets/seelawa-jathakaya/1.png",
            fallbackIcon: "👑"
        },
        {
            titleSi: "02. රාජ්‍ය ආක්‍රමණය",
            titleEn: "02. Invasion of the Kingdom",
            textSi: "දුෂ්ට ඇමතියෙකුගේ කේලාම් අසා අසල්වැසි රජෙකු බරණැස ආක්‍රමණය කළේය. සීලව රජු සිය සේනාවට සටන් කිරීම තහනම් කර සතුරාට නුවරට ඒමට ඉඩ දුන්නේය.",
            textEn: "A rival king invaded Benares, misled by a treacherous minister. To avoid bloodshed, King Silava ordered his army not to fight, allowing the invaders into the city.",
            img: "assets/seelawa-jathakaya/2.png",
            fallbackIcon: "⚔️"
        },
        {
            titleSi: "03. සොහොනේ වළලෑම",
            titleEn: "03. Buried in the Cemetery",
            textSi: "ආක්‍රමණික රජු සීලව රජතුමා ඇතුළු ඇමතිවරුන් අල්ලාගෙන, ඔවුන්ගේ හිස පමණක් පිටතට පෙනෙන සේ සොහොන් බිමක වළලා දමා මිය යාමට හැරියේය.",
            textEn: "The hostile king captured King Silava and his loyal ministers, burying them up to their necks in a cemetery, leaving them to be eaten by wild beasts at night.",
            img: "assets/seelawa-jathakaya/3.png",
            fallbackIcon: "🪦"
        },
        {
            titleSi: "04. හිවලුන්ගෙන් බේරීම",
            titleEn: "04. Escaping the Jackals",
            textSi: "රාත්‍රියේදී තමා කෑමට ආ හිවලෙකුගේ බෙල්ලෙන් රජු සිය දතින් අල්ලා ගත්තේය. හිවලා බියෙන් ගැස්සී දැඟලීමේදී රජු වළෙන් බේරී සෙසු ඇමතිවරුන්ද නිදහස් කරගත්තේය.",
            textEn: "When a jackal approached to eat him, the King bravely grabbed the jackal's neck with his teeth. The jackal's frantic struggle loosened the soil, allowing the King to escape and free his ministers.",
            img: "assets/seelawa-jathakaya/4.png",
            fallbackIcon: "🐺"
        },
        {
            titleSi: "05. ධර්මයේ ජයග්‍රහණය",
            titleEn: "05. Victory of Dharma",
            textSi: "යක්ෂයෙකුගේ උපකාරයෙන් රජු සිය යහනට ළඟා වී සතුරා ඉදිරියේ පෙනී සිටියේය. රජුගේ මහා ආනුභාවය දුටු සතුරු රජු සමාව ඉල්ලා රාජ්‍යය නැවත ලබා දී යන්නට ගියේය.",
            textEn: "With a spirit's aid, the King entered his bedchamber, appearing before the usurper. Astounded by his virtue and power, the rival king begged forgiveness and returned Benares.",
            img: "assets/seelawa-jathakaya/5.png",
            fallbackIcon: "✨"
        }
    ]
};

let activeStoryKey = 'sasa';
let activePanelIndex = 0;
let currentLanguage = 'si';
let autoPlayInterval = null;
let isAutoPlaying = false;

// Thorana lights
let lightInterval = null;
let lightSpeed = 300;
let activePattern = 'chasing';
let bulbStateTick = 0;

function updateThoranaSVGTexts() {
    const panels = document.querySelectorAll('.pandal-panel-trigger');
    const stories = jatakaStories[activeStoryKey] || jatakaStories['sasa'];
    panels.forEach((panel, i) => {
        if(stories[i]) {
            const texts = panel.querySelectorAll('text');
            if(texts.length >= 3) {
                texts[0].textContent = stories[i].fallbackIcon;
                texts[1].textContent = stories[i].titleSi;
                texts[2].textContent = stories[i].titleEn.replace(/^\d+\.\s*/, '');
            }
        }
    });
}

function initThorana() {
    updateThoranaSVGTexts();
    loadStoryPanel(0);

    const jatakaSelect = document.getElementById('jatakaStorySelect');
    if (jatakaSelect) {
        jatakaSelect.addEventListener('change', function() {
            activeStoryKey = this.value;
            activePanelIndex = 0;

            // Automatically morph the Thorana lights animation based on Jataka story mood!
            const themes = {
                sasa: { pattern: 'chasing', speedVal: 7 },
                kuru: { pattern: 'rainbow', speedVal: 5 },
                dahamsonda: { pattern: 'sparkle', speedVal: 9 },
                sama: { pattern: 'calm', speedVal: 3 },
                silava: { pattern: 'aura', speedVal: 6 }
            };
            const theme = themes[activeStoryKey] || themes.sasa;
            activePattern = theme.pattern;
            lightSpeed = 600 - (theme.speedVal * 50);
            restartLightLoop();

            const speedSlider = document.getElementById('speedSlider');
            if (speedSlider) speedSlider.value = theme.speedVal;
            const labels = ['Very Slow', 'Slow', 'Slow', 'Normal', 'Normal', 'Normal', 'Fast', 'Fast', 'Very Fast', 'Ultra Fast'];
            const speedValLabel = document.getElementById('speedVal');
            if (speedValLabel) speedValLabel.innerText = labels[theme.speedVal - 1] || 'Normal';

            const patternButtons = document.querySelectorAll('.btn-pattern');
            patternButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.pattern === activePattern);
            });

            updateThoranaSVGTexts();
            loadStoryPanel(0);
        });
    }

    document.getElementById('btnPrev').addEventListener('click', () => navigateStory(-1));
    document.getElementById('btnNext').addEventListener('click', () => navigateStory(1));
    document.getElementById('btnLangSi').addEventListener('click', () => setLanguage('si'));
    document.getElementById('btnLangEn').addEventListener('click', () => setLanguage('en'));
    document.getElementById('btnAutoPlay').addEventListener('click', function () { toggleAutoPlay(this); });
    document.getElementById('btnSpeech').addEventListener('click', () => speakStory());

    const patternButtons = document.querySelectorAll('.btn-pattern');
    patternButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            patternButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            activePattern = this.dataset.pattern;
        });
    });

    document.getElementById('speedSlider').addEventListener('input', function () {
        const val = parseInt(this.value);
        lightSpeed = 600 - (val * 50);
        restartLightLoop();
        const labels = ['Very Slow', 'Slow', 'Slow', 'Normal', 'Normal', 'Normal', 'Fast', 'Fast', 'Very Fast', 'Ultra Fast'];
        const el = document.getElementById('speedVal');
        if (el) el.innerText = labels[val - 1] || 'Normal';
    });

    document.querySelectorAll('.pandal-panel-trigger').forEach(panel => {
        panel.addEventListener('click', function () {
            loadStoryPanel(parseInt(this.dataset.panelIndex));
        });
    });

    startLightLoop();

    // Start spiral blade animation
    startSpiralAnimation();
}

function loadStoryPanel(index) {
    activePanelIndex = index;
    const story = jatakaStories[activeStoryKey][index];

    // Trigger visual card active transition
    const storyBody = document.querySelector('.story-card .story-body');
    if (storyBody) {
        storyBody.classList.remove('active-slide');
        void storyBody.offsetWidth; // force reflow
        storyBody.classList.add('active-slide');
    }

    document.querySelectorAll('.pandal-panel-trigger').forEach(p => {
        p.classList.toggle('selected', parseInt(p.dataset.panelIndex) === index);
    });

    document.getElementById('storyBadge').innerText = `පැනලය ${index + 1} / Panel ${index + 1}`;
    updateStoryDisplay();

    const imgEl = document.getElementById('storyImage');
    const fallbackEl = document.getElementById('storyImgFallback');
    imgEl.src = story.img;
    fallbackEl.style.display = 'none';
    imgEl.style.opacity = 1;

    imgEl.onerror = function () {
        imgEl.style.opacity = 0;
        fallbackEl.innerText = story.fallbackIcon;
        fallbackEl.style.display = 'flex';
    };
    imgEl.onload = function () { imgEl.style.opacity = 1; };

    document.getElementById('btnPrev').disabled = index === 0;
    document.getElementById('btnNext').disabled = index === jatakaStories[activeStoryKey].length - 1;

    if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function updateStoryDisplay() {
    const story = jatakaStories[activeStoryKey][activePanelIndex];
    document.getElementById('storyTitleSi').innerText = story.titleSi;
    document.getElementById('storyTitleEn').innerText = story.titleEn;
    document.getElementById('storyTextSi').innerText = story.textSi;
    document.getElementById('storyTextEn').innerText = story.textEn;

    const isSi = currentLanguage === 'si';
    document.getElementById('storyTextSi').style.display = isSi ? 'block' : 'none';
    document.getElementById('storyTitleSi').style.display = isSi ? 'block' : 'none';
    document.getElementById('storyTextEn').style.display = isSi ? 'none' : 'block';
    document.getElementById('storyTitleEn').style.display = isSi ? 'none' : 'block';
}

function setLanguage(lang) {
    currentLanguage = lang;
    document.getElementById('btnLangSi').classList.toggle('active', lang === 'si');
    document.getElementById('btnLangEn').classList.toggle('active', lang === 'en');
    updateStoryDisplay();
}

function navigateStory(dir) {
    const next = activePanelIndex + dir;
    if (next >= 0 && next < jatakaStories[activeStoryKey].length) loadStoryPanel(next);
}

function toggleAutoPlay(button) {
    if (isAutoPlaying) {
        clearInterval(autoPlayInterval);
        isAutoPlaying = false;
        button.classList.remove('playing');
        button.innerHTML = '🔄 Auto Play';
    } else {
        isAutoPlaying = true;
        button.classList.add('playing');
        button.innerHTML = '⏸️ Stop';
        autoPlayInterval = setInterval(() => {
            activePanelIndex < jatakaStories[activeStoryKey].length - 1 ? navigateStory(1) : loadStoryPanel(0);
        }, 10000);
    }
}

function speakStory() {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const story = jatakaStories[activeStoryKey][activePanelIndex];
    const text = currentLanguage === 'si' ? story.textSi : story.textEn;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage === 'si' ? 'si-LK' : 'en-US';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
}

/* --- SPIRAL BLADE ANIMATION --- */
let spiralAnimFrame = null;
let spiralAngle = 0;

function startSpiralAnimation() {
    const blades = document.getElementById('spiralBlades');
    if (!blades) return;

    function animateSpiral() {
        spiralAngle += 0.4;
        blades.setAttribute('transform', `rotate(${spiralAngle}, 400, 280)`);
        spiralAnimFrame = requestAnimationFrame(animateSpiral);
    }
    animateSpiral();
}

/* --- THORANA BULB LIGHT LOOP --- */
function startLightLoop() { restartLightLoop(); }

function restartLightLoop() {
    if (lightInterval) clearInterval(lightInterval);
    lightInterval = setInterval(runLightPatternStep, lightSpeed);
}

function runLightPatternStep() {
    const bulbs = document.querySelectorAll('.bulb');
    if (bulbs.length === 0) return;

    bulbStateTick++;

    bulbs.forEach((bulb, idx) => {
        let on = false;
        const layer = parseInt(bulb.dataset.layer || '0');

        switch (activePattern) {
            case 'chasing':
                on = (idx + bulbStateTick) % 3 === 0;
                break;
            case 'aura':
                on = layer === (bulbStateTick % 6);
                break;
            case 'sparkle':
                on = Math.random() > 0.55;
                break;
            case 'rainbow':
                on = (idx % 5) === (bulbStateTick % 5);
                break;
            case 'spiral':
                // Spiral pattern: wave propagates outward from center ring
                const phase = (layer * 3 + idx) % 8;
                on = phase === (bulbStateTick % 8);
                break;
            case 'calm':
            default:
                on = Math.sin(bulbStateTick * 0.15) > -0.2;
                break;
        }

        bulb.classList.toggle('active', on);
    });
}


/* ==========================================
   4. VESAK CARD GENERATOR ENGINE (ADVANCED)
   ========================================== */
let canvas, ctx;
let cardBgImage = new Image();
let uploadedImage = null;
let currentBgType = 'buddha';
let currentFrame = 'gold';
let textAlignment = 'center';

const vesakVerses = [
    { text: "සැමදෙනාටම පින්බර වෙසක් මංගල්‍යයක් වේවා!", lang: "si" },
    { text: "සම්මා සම්බුදු සරණින් මෙලොව පරලොව සැනසීම ලැබේවා!", lang: "si" },
    { text: "නමෝ තස්ස භගවතෝ අරහතෝ සම්මා සම්බුද්ධස්ස.", lang: "si" },
    { text: "බුදුරජාණන් වහන්සේගේ ආශිර්වාදය සදා ඔබ සැමට ලැබේවා!", lang: "si" },
    { text: "Wishing you a peaceful, joyful, and blessed Vesak Poya Day!", lang: "en" },
    { text: "May the light of Dharma guide you towards eternal peace.", lang: "en" },
    { text: "May Lord Buddha bless your home with harmony and happiness.", lang: "en" },
    { text: "Let us spread love, compassion, and kindness this Vesak!", lang: "en" }
];

function initCardGenerator() {
    canvas = document.getElementById('cardCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 800;

    // Event bindings
    const recipientInput = document.getElementById('cardRecipientName');
    if (recipientInput) recipientInput.addEventListener('input', drawCard);
    document.getElementById('cardSenderName').addEventListener('input', drawCard);
    document.getElementById('cardGreetingText').addEventListener('input', drawCard);
    document.getElementById('textColor').addEventListener('input', drawCard);
    document.getElementById('textSize').addEventListener('input', function() {
        const v = parseInt(this.value);
        const el = document.getElementById('valTextSize');
        if (el) el.innerText = v === 0 ? 'Normal' : (v > 0 ? `+${v}px` : `${v}px`);
        drawCard();
    });
    document.getElementById('textXOffset').addEventListener('input', function() {
        const v = parseInt(this.value);
        const el = document.getElementById('valTextX');
        if (el) el.innerText = v === 0 ? 'Center' : (v > 0 ? `+${v}` : `${v}`);
        drawCard();
    });
    document.getElementById('textOffset').addEventListener('input', function() {
        const v = parseInt(this.value);
        const el = document.getElementById('valTextY');
        if (el) el.innerText = v === 0 ? 'Middle' : (v > 0 ? `+${v}` : `${v}`);
        drawCard();
    });
    document.getElementById('textLineHeight').addEventListener('input', function() {
        const v = parseInt(this.value);
        const el = document.getElementById('valLineH');
        if (el) el.innerText = `${v}px`;
        drawCard();
    });
    document.getElementById('cardFont').addEventListener('change', drawCard);
    document.getElementById('useGoldGradient').addEventListener('change', drawCard);

    // Sticker toggles & sliders
    ['stickerLamp', 'stickerLotus', 'stickerLantern'].forEach(id => {
        document.getElementById(id).addEventListener('change', drawCard);
    });
    ['stickerLampScale', 'stickerLotusScale', 'stickerLanternScale'].forEach(id => {
        document.getElementById(id).addEventListener('input', drawCard);
    });

    // Background selectors
    document.querySelectorAll('.bg-option').forEach(opt => {
        opt.addEventListener('click', function () {
            document.querySelectorAll('.bg-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            uploadedImage = null;
            document.getElementById('btnClearUpload').style.display = 'none';
            selectCardBackground(this.dataset.bg);
        });
    });

    // Frame selectors
    document.querySelectorAll('.btn-frame').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.btn-frame').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFrame = this.dataset.frame;
            drawCard();
        });
    });

    // Alignment buttons
    document.querySelectorAll('.btn-align').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.btn-align').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            textAlignment = this.dataset.align;
            drawCard();
        });
    });

    // Image Upload
    document.getElementById('cardImageUpload').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (ev) {
            uploadedImage = new Image();
            uploadedImage.onload = () => {
                document.querySelectorAll('.bg-option').forEach(o => o.classList.remove('active'));
                document.getElementById('btnClearUpload').style.display = 'inline-block';
                drawCard();
            };
            uploadedImage.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    });

    document.getElementById('btnClearUpload').addEventListener('click', function () {
        uploadedImage = null;
        document.getElementById('cardImageUpload').value = '';
        this.style.display = 'none';
        document.querySelector('.bg-option').classList.add('active');
        selectCardBackground('vesak1');
    });

    // Verses
    const versesContainer = document.getElementById('versesList');
    vesakVerses.forEach(verse => {
        const div = document.createElement('div');
        div.className = 'verse-item';
        div.innerText = verse.text;
        div.addEventListener('click', () => {
            document.getElementById('cardGreetingText').value = verse.text;
            drawCard();
        });
        versesContainer.appendChild(div);
    });

    // Orientation Controls
    const btnPortrait = document.getElementById('btnPortrait');
    const btnSquare = document.getElementById('btnSquare');
    const btnLandscape = document.getElementById('btnLandscape');

    function resetOrientButtons() {
        btnPortrait.style.border = 'none';
        btnSquare.style.border = 'none';
        btnLandscape.style.border = 'none';
    }

    btnPortrait.addEventListener('click', () => {
        resetOrientButtons(); btnPortrait.style.border = '2px solid #fff';
        canvas.width = 800; canvas.height = 1200; drawCard();
    });
    btnSquare.addEventListener('click', () => {
        resetOrientButtons(); btnSquare.style.border = '2px solid #fff';
        canvas.width = 800; canvas.height = 800; drawCard();
    });
    btnLandscape.addEventListener('click', () => {
        resetOrientButtons(); btnLandscape.style.border = '2px solid #fff';
        canvas.width = 1200; canvas.height = 800; drawCard();
    });
    
    // Set default square active border
    btnSquare.style.border = '2px solid #fff';

    // Export
    document.getElementById('btnDownloadCard').addEventListener('click', downloadCardImage);
    const shareBtn = document.getElementById('btnShareCard');
    if (shareBtn) shareBtn.addEventListener('click', shareCardImage);

    // Initial
    selectCardBackground('vesak1');
}

function selectCardBackground(bgType) {
    currentBgType = bgType;
    let src = '';
    if (bgType === 'vesak1') src = 'assets/vesak1.png';
    else if (bgType === 'vesak2') src = 'assets/vesak2.png';
    else if (bgType === 'vesak3') src = 'assets/vesak3.png';
    else if (bgType === 'vesak4') src = 'assets/vesak4.png';
    else if (bgType === 'vesak5') src = 'assets/vesak5.png';
    else if (bgType === 'procedural') src = ''; // Custom procedural gradient

    if (src) {
        cardBgImage = new Image();
        cardBgImage.onload = () => drawCard();
        cardBgImage.onerror = () => {
            console.error("Failed to load background template image: " + src);
            drawCard();
        };
        cardBgImage.src = src;
    } else {
        cardBgImage = null;
        drawCard();
    }
}

function drawCard() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // === 1. Background ===
    if (uploadedImage) {
        drawCoverImage(uploadedImage, W, H);
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(0, 0, W, H);
    } else if (cardBgImage && cardBgImage.complete && cardBgImage.naturalWidth > 0) {
        drawCoverImage(cardBgImage, W, H);
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(0, 0, W, H);
    } else {
        drawProceduralBackground(W, H);
    }

    // === 2. Frame ===
    drawFrame(W, H);

    // === 3. Stickers ===
    drawStickers(W, H);

    // === 4. Text ===
    drawCardTexts(W, H);
}

function drawCoverImage(img, W, H) {
    // Cover-fit the image (like CSS object-fit: cover)
    const ratio = Math.max(W / img.width, H / img.height);
    const nw = img.width * ratio;
    const nh = img.height * ratio;
    ctx.drawImage(img, (W - nw) / 2, (H - nh) / 2, nw, nh);
}

function drawProceduralBackground(W, H) {
    let grad;
    if (currentBgType === 'buddha') {
        grad = ctx.createRadialGradient(400, 300, 50, 400, 400, 550);
        grad.addColorStop(0, '#1d1947'); grad.addColorStop(0.5, '#0c0a29'); grad.addColorStop(1, '#03030c');
    } else if (currentBgType === 'lanterns') {
        grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#1f1303'); grad.addColorStop(0.6, '#0f0701'); grad.addColorStop(1, '#050200');
    } else {
        grad = ctx.createLinearGradient(0, H, W, 0);
        grad.addColorStop(0, '#0d021c'); grad.addColorStop(0.7, '#1f0d3a'); grad.addColorStop(1, '#07000f');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Full moon
    ctx.beginPath();
    ctx.arc(400, 170, 75, 0, Math.PI * 2);
    const moonGrad = ctx.createRadialGradient(400, 170, 10, 400, 170, 75);
    moonGrad.addColorStop(0, '#ffffff'); moonGrad.addColorStop(0.3, '#fffae8'); moonGrad.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.fillStyle = moonGrad;
    ctx.fill();

    // Procedural Buddha silhouette
    if (currentBgType === 'buddha') {
        ctx.fillStyle = "rgba(0,0,0,0.95)";
        ctx.beginPath(); ctx.ellipse(400, 510, 80, 20, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(400, 430, 60, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(400, 455, 80, 40, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(400, 345, 35, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(400, 300, 10, 0, Math.PI * 2); ctx.fill();
        // Halo
        ctx.beginPath(); ctx.arc(400, 340, 70, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,215,0,0.45)"; ctx.lineWidth = 4;
        ctx.shadowColor = "rgba(255,215,0,0.8)"; ctx.shadowBlur = 25;
        ctx.stroke(); ctx.shadowBlur = 0;
    }
}

/* --- FRAME DRAWING --- */
function drawFrame(W, H) {
    if (currentFrame === 'none') return;
    ctx.save();
    switch (currentFrame) {
        case 'gold':
            drawGoldFrame(W, H);
            break;
        case 'floral':
            drawFloralFrame(W, H);
            break;
        case 'neon':
            drawNeonFrame(W, H);
            break;
    }
    ctx.restore();
}

function drawGoldFrame(W, H) {
    // Outer border
    ctx.strokeStyle = "#ffd700"; ctx.lineWidth = 5;
    ctx.strokeRect(25, 25, W - 50, H - 50);
    // Inner border
    ctx.strokeStyle = "rgba(255,215,0,0.4)"; ctx.lineWidth = 1.5;
    ctx.strokeRect(38, 38, W - 76, H - 76);

    // Ornate corners
    const corners = [
        { x: 25, y: 25, dx: 1, dy: 1 },
        { x: W - 25, y: 25, dx: -1, dy: 1 },
        { x: 25, y: H - 25, dx: 1, dy: -1 },
        { x: W - 25, y: H - 25, dx: -1, dy: -1 }
    ];
    corners.forEach(c => {
        ctx.strokeStyle = "#ffd700"; ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y + c.dy * 50);
        ctx.lineTo(c.x, c.y);
        ctx.lineTo(c.x + c.dx * 50, c.y);
        ctx.stroke();

        // Diamond ornament
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        const dx = c.x + c.dx * 28, dy = c.y + c.dy * 28;
        ctx.moveTo(dx, dy - 6); ctx.lineTo(dx + 6, dy); ctx.lineTo(dx, dy + 6); ctx.lineTo(dx - 6, dy);
        ctx.closePath(); ctx.fill();

        // Small circles
        ctx.beginPath(); ctx.arc(c.x + c.dx * 15, c.y + c.dy * 50, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(c.x + c.dx * 50, c.y + c.dy * 15, 3, 0, Math.PI * 2); ctx.fill();
    });

    // Top center deco
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.moveTo(W / 2, 15); ctx.lineTo(W / 2 - 10, 25); ctx.lineTo(W / 2 + 10, 25); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(W / 2, H - 15); ctx.lineTo(W / 2 - 10, H - 25); ctx.lineTo(W / 2 + 10, H - 25); ctx.closePath(); ctx.fill();
}

function drawFloralFrame(W, H) {
    // Soft pink floral outer border
    ctx.strokeStyle = "rgba(255,130,180,0.6)"; ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    // Draw lotus petals in all four corners and centers
    const positions = [
        { x: 50, y: 50 }, { x: W - 50, y: 50 },
        { x: 50, y: H - 50 }, { x: W - 50, y: H - 50 },
        { x: W / 2, y: 30 }, { x: W / 2, y: H - 30 },
        { x: 30, y: H / 2 }, { x: W - 30, y: H / 2 }
    ];
    positions.forEach(pos => drawLotusIcon(pos.x, pos.y, 18));

    // Inner decorative line
    ctx.strokeStyle = "rgba(255,215,0,0.3)"; ctx.lineWidth = 1;
    ctx.strokeRect(35, 35, W - 70, H - 70);
}

function drawNeonFrame(W, H) {
    // Buddhist flag colors neon glow
    const colors = ['#3a86ff', '#ffd700', '#ff3b30', '#ffffff', '#ff7b00'];

    ctx.shadowBlur = 15;
    for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = colors[i];
        ctx.shadowColor = colors[i];
        ctx.lineWidth = 2;
        const offset = 20 + i * 8;
        ctx.strokeRect(offset, offset, W - offset * 2, H - offset * 2);
    }
    ctx.shadowBlur = 0;
}

function drawLotusIcon(x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "rgba(255,105,180,0.8)";
    for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.beginPath(); ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = "#ffd700"; ctx.fill();
    ctx.restore();
}

/* --- STICKER DRAWING --- */
function drawStickers(W, H) {
    const lampActive = document.getElementById('stickerLamp').checked;
    const lotusActive = document.getElementById('stickerLotus').checked;
    const lanternActive = document.getElementById('stickerLantern').checked;

    const lampScale = parseInt(document.getElementById('stickerLampScale').value) / 100;
    const lotusScale = parseInt(document.getElementById('stickerLotusScale').value) / 100;
    const lanternScale = parseInt(document.getElementById('stickerLanternScale').value) / 100;

    if (lampActive) drawOilLamps(W, H, lampScale);
    if (lotusActive) drawLotusOrnaments(W, H, lotusScale);
    if (lanternActive) drawLanternStickers(W, H, lanternScale);
}

function drawOilLamps(W, H, scale) {
    const positions = [
        { x: 120, y: H - 80 },
        { x: W / 2, y: H - 60 },
        { x: W - 120, y: H - 80 }
    ];
    positions.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(scale, scale);

        // Clay body
        ctx.beginPath();
        ctx.moveTo(-45, 0); ctx.bezierCurveTo(-45, 25, 45, 25, 45, 0);
        ctx.quadraticCurveTo(0, -8, -45, 0);
        ctx.fillStyle = "#a0522d"; ctx.fill();
        ctx.strokeStyle = "#8b4513"; ctx.lineWidth = 2; ctx.stroke();

        // Flame
        ctx.shadowColor = "#ff8c00"; ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.moveTo(0, -8); ctx.quadraticCurveTo(-12, -30, 0, -52);
        ctx.quadraticCurveTo(12, -30, 0, -8);
        ctx.fillStyle = "#ff4500"; ctx.fill();

        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(0, -12); ctx.quadraticCurveTo(-7, -28, 0, -42);
        ctx.quadraticCurveTo(7, -28, 0, -12);
        ctx.fillStyle = "#ffd700"; ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();
    });
}

function drawLotusOrnaments(W, H, scale) {
    const positions = [
        { x: 90, y: 90 },
        { x: W - 90, y: 90 }
    ];
    positions.forEach(pos => {
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.scale(scale, scale);
        drawLotusIcon(0, 0, 28);
        ctx.restore();
    });
}

function drawLanternStickers(W, H, scale) {
    const positions = [
        { x: 80, y: 180 },
        { x: W - 80, y: 180 }
    ];
    positions.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(scale, scale);

        // Lantern string
        ctx.strokeStyle = "#ffd700"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(0, -50); ctx.lineTo(0, -25); ctx.stroke();

        // Lantern body (Vesak Kudu shape)
        ctx.fillStyle = "rgba(255,140,0,0.7)";
        ctx.beginPath();
        ctx.moveTo(0, -25);
        ctx.bezierCurveTo(-22, -15, -25, 15, -18, 30);
        ctx.lineTo(18, 30);
        ctx.bezierCurveTo(25, 15, 22, -15, 0, -25);
        ctx.fill();
        ctx.strokeStyle = "#ffd700"; ctx.lineWidth = 1; ctx.stroke();

        // Inner glow
        ctx.beginPath();
        ctx.arc(0, 5, 12, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,200,0.4)";
        ctx.shadowColor = "#ffd700"; ctx.shadowBlur = 15;
        ctx.fill(); ctx.shadowBlur = 0;

        // Bottom tassel
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.moveTo(-12, 30); ctx.lineTo(0, 45); ctx.lineTo(12, 30); ctx.fill();

        ctx.restore();
    });
}

/* --- CARD TEXT RENDERING --- */
function drawCardTexts(W, H) {
    const greetingText = document.getElementById('cardGreetingText').value.trim() || "සැමදෙනාටම පින්බර වෙසක් මංගල්‍යයක් වේවා!";
    const senderName = document.getElementById('cardSenderName').value.trim();
    const recipientInput = document.getElementById('cardRecipientName');
    const recipientName = recipientInput ? recipientInput.value.trim() : "";
    const fontName = document.getElementById('cardFont').value;
    const colorHex = document.getElementById('textColor').value;
    const sizeOffset = parseInt(document.getElementById('textSize').value);
    const horizontalOffset = parseInt(document.getElementById('textXOffset').value);
    const verticalOffset = parseInt(document.getElementById('textOffset').value);
    const lineHeightVal = parseInt(document.getElementById('textLineHeight').value);
    const useGold = document.getElementById('useGoldGradient').checked;

    const fontSize = 32 + sizeOffset;

    // Recipient Name (drawn at the top)
    if (recipientName) {
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.85)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        const recY = 120;
        ctx.fillStyle = "#ffd700";
        ctx.textAlign = 'center';
        ctx.font = `600 24px 'Outfit', sans-serif`;
        ctx.fillText(`To: ${recipientName}`, W / 2, recY);

        ctx.beginPath();
        ctx.moveTo(W / 2 - 100, recY + 12);
        ctx.lineTo(W / 2 + 100, recY + 12);
        ctx.strokeStyle = "rgba(255,215,0,0.5)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
    }

    // Shadow for main text
    ctx.shadowColor = "rgba(0,0,0,0.85)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Text alignment
    let alignX = W / 2 + horizontalOffset;
    ctx.textAlign = textAlignment;
    if (textAlignment === 'left') alignX = 70 + horizontalOffset;
    else if (textAlignment === 'right') alignX = W - 70 + horizontalOffset;

    // Color or Gold Gradient
    if (useGold) {
        const goldGrad = ctx.createLinearGradient(alignX - 100, (H/2) + verticalOffset - 60, alignX + 100, (H/2) + verticalOffset + 40);
        goldGrad.addColorStop(0, '#ffe875');
        goldGrad.addColorStop(0.3, '#ffd700');
        goldGrad.addColorStop(0.6, '#daa520');
        goldGrad.addColorStop(1, '#b8860b');
        ctx.fillStyle = goldGrad;
    } else {
        ctx.fillStyle = colorHex;
    }

    ctx.font = `600 ${fontSize}px '${fontName}', sans-serif`;
    const textYPos = (H/2) + 60 + verticalOffset;
    const maxWidth = textAlignment === 'center' ? W - 180 : W - 140;
    wrapText(ctx, greetingText, alignX, textYPos, maxWidth, lineHeightVal);

    // Sender name
    if (senderName) {
        ctx.shadowBlur = 6;
        const lineY = H - 120 + verticalOffset;
        ctx.beginPath();
        ctx.moveTo(W / 2 - 80 + horizontalOffset, lineY);
        ctx.lineTo(W / 2 + 80 + horizontalOffset, lineY);
        ctx.strokeStyle = "rgba(255,215,0,0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#ffd700";
        ctx.textAlign = 'center';
        ctx.font = `500 22px 'Outfit', sans-serif`;
        ctx.fillText(`From: ${senderName}`, W / 2 + horizontalOffset, lineY + 30);
    }

    // Reset shadow
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        if (context.measureText(testLine).width > maxWidth && n > 0) {
            context.fillText(line, x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, currentY);
}

function downloadCardImage() {
    const sender = document.getElementById('cardSenderName').value.trim() || 'Vesak';
    const filename = `vesak_card_${sender.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

async function shareCardImage() {
    try {
        const dataUrl = canvas.toDataURL('image/png');
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'vesak_card.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Digital Vesak Card 2026',
                text: 'මා ඔබට එවන පින්බර වෙසක් සුබපැතුම්පත! Wishing you a blessed Vesak Poya Day!'
            });
        } else {
            // Web Share fallback
            await navigator.clipboard.writeText("Wishing you a blessed Vesak! Generate yours at " + window.location.href);
            alert("සුබපැතුම්පතේ ලින්ක් එක Clipboard එකට Copy කරගත්තා! ඔබට එය ඕනෑම තැනක Share කළ හැක. (Link copied to clipboard!)");
        }
    } catch (err) {
        console.error("Error sharing: ", err);
        navigator.clipboard.writeText(window.location.href);
        alert("සුබපැතුම්පතේ ලින්ක් එක Clipboard එකට Copy කරගත්තා! (Link copied to clipboard!)");
    }
}

/* ==========================================
   5. VESAK POYA COUNTDOWN
   ========================================== */
function initCountdown() {
    const targetDate = new Date("May 31, 2026 00:00:00").getTime();

    function updateTimer() {
        const diff = targetDate - Date.now();
        const d = document.getElementById('daysBox');
        const h = document.getElementById('hoursBox');
        const m = document.getElementById('minsBox');
        const s = document.getElementById('secsBox');
        if (!d) return;

        if (diff <= 0) {
            d.innerText = "00"; h.innerText = "00"; m.innerText = "00"; s.innerText = "00";
            const t = document.getElementById('heroTitleSi');
            if (t) { t.innerText = "සාදු! සාදු! පින්බර වෙසක් මංගල්‍යයක් වේවා!"; t.style.color = "#ffd700"; }
            return;
        }

        d.innerText = String(Math.floor(diff / 86400000)).padStart(2, '0');
        h.innerText = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
        m.innerText = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        s.innerText = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize common components
    initStars();
    
    // Check which page we are on and initialize the respective engine
    if (document.getElementById('pandalSvg')) {
        initThorana();
    }
    
    if (document.getElementById('cardCanvas')) {
        initCardGenerator();
    }

    // Add countdown initializer if the element exists
    if (document.getElementById('daysBox')) {
        initCountdown();
    }
});

/* ==========================================
   1. STARFIELD & VISUAL ENGINE
   ========================================== */
function initStars() {
    const starContainer = document.querySelector('.stars');
    if (!starContainer) return;
    
    const starCount = window.innerWidth < 768 ? 60 : 120;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        const size = Math.random() * 3 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // Randomize twinkle speeds
        star.style.animationDuration = `${Math.random() * 3 + 2}s`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        
        starContainer.appendChild(star);
    }

    // Spawn floating lanterns occasionally
    setInterval(() => {
        spawnLantern();
    }, 4000);
}

function spawnLantern() {
    const container = document.body;
    if (!container) return;

    const lantern = document.createElement('div');
    lantern.className = 'lantern-float';
    lantern.style.left = `${Math.random() * 100}vw`;
    // Random sizes
    const size = Math.random() * 40 + 30;
    lantern.style.width = `${size}px`;
    lantern.style.height = `${size}px`;
    lantern.style.animationDuration = `${Math.random() * 15 + 20}s`;

    container.appendChild(lantern);

    // Remove lantern after animation finishes
    setTimeout(() => {
        lantern.remove();
    }, 35000);
}

/* ==========================================
   2. AMBIENT AUDIO & MEDITATIVE SYNTH ENGINE
   ========================================== */
let audioCtx = null;
let synthInterval = null;
let isSynthPlaying = false;
let bgMusicAudio = null; // HTML Audio fallback

function toggleAmbientAudio(button) {
    if (!audioCtx) {
        // Initialize Web Audio API
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (isSynthPlaying) {
        // Stop music
        stopAmbientSynth();
        if (bgMusicAudio) bgMusicAudio.pause();
        button.classList.remove('playing');
        button.innerHTML = '🎵 Play Ambient Music';
        isSynthPlaying = false;
    } else {
        // Start music
        isSynthPlaying = true;
        button.classList.add('playing');
        button.innerHTML = '🔊 Playing Devotional Music';

        // 1. Try to load user's mp3 first
        playMusicFile();
        
        // 2. Run synthesized meditation bells as a beautiful atmospheric background layer
        startAmbientSynth();
    }
}

function playMusicFile() {
    if (!bgMusicAudio) {
        bgMusicAudio = new Audio('assets/vesak_music.mp3');
        bgMusicAudio.loop = true;
        bgMusicAudio.volume = 0.5;
    }
    
    // Play with fallback if the user hasn't loaded the file
    bgMusicAudio.play().catch(err => {
        console.log("Custom MP3 not found or blocked. Playing synthesized ambient bells instead.");
    });
}

function startAmbientSynth() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    // Play a gentle soothing bell sound immediately
    playBell(220); // A3 note
    playBell(330); // E4 note

    // Schedule periodic peaceful resonances (pentatonic major scale for pure meditative feel)
    const notes = [220, 277.18, 329.63, 369.99, 440, 554.37, 659.25]; // A major pentatonic
    
    synthInterval = setInterval(() => {
        const randomNote1 = notes[Math.floor(Math.random() * notes.length)];
        const randomNote2 = notes[Math.floor(Math.random() * notes.length)];
        
        // Soothing acoustic chime structure
        playBell(randomNote1);
        if (Math.random() > 0.6) {
            setTimeout(() => {
                playBell(randomNote2);
            }, 600);
        }
    }, 3500);
}

function stopAmbientSynth() {
    if (synthInterval) {
        clearInterval(synthInterval);
        synthInterval = null;
    }
}

// Procedural synthesizer for traditional singing bowl / bell alms sound
function playBell(frequency) {
    if (!audioCtx || audioCtx.state === 'suspended') return;

    try {
        const now = audioCtx.currentTime;
        
        // Oscillator 1 (Warm Fundamental)
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, now);

        // Oscillator 2 (Overtones for metallic shimmer)
        const overtoneOsc = audioCtx.createOscillator();
        const overtoneGain = audioCtx.createGain();
        overtoneOsc.type = 'sine';
        overtoneOsc.frequency.setValueAtTime(frequency * 1.5, now); // Perfect fifth overtone

        // Lowpass Filter for soft warmth
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(150, now + 4.0);

        // Slow Attack, Long meditative release
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.08); // soft strike
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 6.0); // very long decay

        overtoneGain.gain.setValueAtTime(0, now);
        overtoneGain.gain.linearRampToValueAtTime(0.05, now + 0.04);
        overtoneGain.gain.exponentialRampToValueAtTime(0.001, now + 3.0); // shorter decay for high shimmer

        // Connect nodes
        osc.connect(gainNode);
        gainNode.connect(filter);

        overtoneOsc.connect(overtoneGain);
        overtoneGain.connect(filter);

        filter.connect(audioCtx.destination);

        osc.start(now);
        overtoneOsc.start(now);

        osc.stop(now + 6.5);
        overtoneOsc.stop(now + 3.5);
    } catch (e) {
        console.error("Synthesizer error:", e);
    }
}


/* ==========================================
   3. DIGITAL VESAK THORANA ENGINE
   ========================================== */
const jatakaStory = [
    {
        titleSi: "01. මහා අධිෂ්ඨානය (The Devotional Vow)",
        titleEn: "01. The Devotional Vow",
        textSi: "පින්බර පොහෝ දිනක සාවා, උණහපුළුවා, සිවලා සහ වඳුරා එක්ව සිල් සමාදන් වීමට අදිටන් කර ගත්හ. සාවා තම යහළුවන්ට කරුණාවෙන් ධර්මය දේශනා කරමින්, පැමිණෙන ඕනෑම යාචකයෙකුට ආහාර දීමට පොරොන්දු විය.",
        textEn: "On a sacred Full Moon Poya day, the wise hare, the otter, the jackal, and the monkey gathered in the forest and vowed to keep the holy precepts. The virtuous hare preached the Dhamma to his friends, urging them to offer food to any hungry traveler who passed by.",
        img: "assets/panel1.jpg",
        fallbackIcon: "🕊️"
    },
    {
        titleSi: "02. දන් සෙවීම (Gathering the Offerings)",
        titleEn: "02. Gathering the Offerings",
        textSi: "අනෙක් සතුන් දානය සඳහා ආහාර සෙවූහ. උණහපුළුවා මසුන් ද, සිවලා මුදවාපු කිරි කළයක් ද, වඳුරා අඹ ගෙඩි ද සොයා ගත්හ. එහෙත් සාවාට සොයා ගත හැකි වූයේ තණකොළ පමණි.",
        textEn: "The friends went in search of food to offer as alms. The otter caught fresh fish, the jackal found a jar of curd, and the monkey gathered sweet mangoes. However, the gentle hare could only find grass, which was unfit for humans.",
        img: "assets/panel2.jpg",
        fallbackIcon: "🐟"
    },
    {
        titleSi: "03. ජීවිත දානය (The Ultimate Sacrifice)",
        titleEn: "03. The Ultimate Sacrifice",
        textSi: "සාවා තමා සතුව දීමට කිසිවක් නැති බව වටහාගෙන, මහත් ශ්‍රද්ධාවෙන් යුතුව තම ශරීරයම දන් දීමට අදිටන් කර ගත්තේය. 'කවුරුන් හෝ පැමිණියහොත් මම මගේම මාංශයෙන් ඔහුව පෝෂණය කරමි' යි සාවා සිතීය.",
        textEn: "Realizing he had nothing suitable to offer, the hare resolved with pure faith to sacrifice his own life. 'If a guest arrives, I shall offer my own flesh to feed them,' the noble hare selflessly decided under the glowing moon.",
        img: "assets/panel3.jpg",
        fallbackIcon: "🐇"
    },
    {
        titleSi: "04. ශක්‍ර දේවේන්ද්‍රයාගේ පරීක්ෂණය (The Divine Test)",
        titleEn: "04. The Divine Test",
        textSi: "සතුන්ගේ අදිටන පරීක්ෂා කරනු පිණිස ශක්‍ර දේවේන්ද්‍රයා මහලු බ්‍රාහ්මණයෙකුගේ වේශයෙන් පැමිණියේය. සෙසු මිතුරන් තම තමන් සොයාගත් ආහාර පූජා කළ අතර, සාවා දානය සඳහා ගිනි ගොඩක් සූදානම් කරන ලෙස පැවසීය.",
        textEn: "To test their virtue, Lord Sakra, king of the gods, descended disguised as a hungry, old Brahmin. While the other animals offered their collected food, the hare joyfully requested the Brahmin to prepare a fire so he could offer his body.",
        img: "assets/panel4.jpg",
        fallbackIcon: "🔥"
    },
    {
        titleSi: "05. ශශ ලාංඡනය (The Eternal Tribute)",
        titleEn: "05. The Eternal Tribute",
        textSi: "සාවා කිසිදු පැකිලීමකින් තොරව රක්ත වර්ණ ගින්නට පැන්නේය. එහෙත් ඔහුගේ උදාර ගුණය නිසා ගින්න සිසිල් විය. පැහැදුණු ශක්‍ර දේවේන්ද්‍රයා සාවාගේ රූපය සදාකාලික සිහිවටනයක් ලෙස සඳ මත ඇන්දේය.",
        textEn: "With complete selflessness, the hare leapt into the blazing fire. Yet, due to his supreme virtue, the flames turned cold. Overwhelmed with admiration, Lord Sakra revealed his divine form and painted the hare's image on the moon forever.",
        img: "assets/panel5.jpg",
        fallbackIcon: "🌕"
    }
];

let activePanelIndex = 0;
let currentLanguage = 'si'; // 'si' or 'en'
let autoPlayInterval = null;
let isAutoPlaying = false;
let speechUtterance = null;

// Thorana lights variables
let lightInterval = null;
let lightSpeed = 300; // ms
let activePattern = 'chasing';
let bulbStateTick = 0;

function initThorana() {
    // Load first story panel
    loadStoryPanel(0);
    
    // Bind story navigation buttons
    document.getElementById('btnPrev').addEventListener('click', () => {
        navigateStory(-1);
    });
    
    document.getElementById('btnNext').addEventListener('click', () => {
        navigateStory(1);
    });
    
    // Language toggle
    document.getElementById('btnLangSi').addEventListener('click', () => {
        setLanguage('si');
    });
    document.getElementById('btnLangEn').addEventListener('click', () => {
        setLanguage('en');
    });
    
    // Auto play
    document.getElementById('btnAutoPlay').addEventListener('click', function() {
        toggleAutoPlay(this);
    });

    // Audio button
    document.getElementById('btnAmbientAudio').addEventListener('click', function() {
        toggleAmbientAudio(this);
    });

    // Text to Speech
    document.getElementById('btnSpeech').addEventListener('click', () => {
        speakStory();
    });
    
    // Pattern buttons
    const patternButtons = document.querySelectorAll('.btn-pattern');
    patternButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            patternButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            changeLightPattern(this.dataset.pattern);
        });
    });
    
    // Speed slider
    const speedSlider = document.getElementById('speedSlider');
    speedSlider.addEventListener('input', function() {
        // Inverse mapping: slider goes from slow (right) to fast (left) or vice versa.
        // Let's make slider value 1 (slow) to 10 (fast).
        const val = parseInt(this.value);
        lightSpeed = 600 - (val * 50); // 1 = 550ms, 10 = 100ms
        restartLightLoop();
    });
    
    // Select all the clickable panels on the Thorana image/SVG
    const pandalPanels = document.querySelectorAll('.pandal-panel-trigger');
    pandalPanels.forEach(panel => {
        panel.addEventListener('click', function() {
            const index = parseInt(this.dataset.panelIndex);
            loadStoryPanel(index);
        });
    });

    // Start lighting loop
    startLightLoop();
}

function loadStoryPanel(index) {
    activePanelIndex = index;
    const story = jatakaStory[index];
    
    // Update SVG highlighted panel class
    const pandalPanels = document.querySelectorAll('.pandal-panel-trigger');
    pandalPanels.forEach(panel => {
        panel.classList.remove('selected');
        if (parseInt(panel.dataset.panelIndex) === index) {
            panel.classList.add('selected');
        }
    });
    
    // Update narrative badge
    document.getElementById('storyBadge').innerText = `පැනලය ${index + 1} / Panel ${index + 1}`;
    
    // Update story text
    updateStoryDisplay();
    
    // Update Image with fallback if file error
    const imgEl = document.getElementById('storyImage');
    imgEl.src = story.img;
    
    // Clear any previous fallback icon
    const fallbackEl = document.getElementById('storyImgFallback');
    fallbackEl.style.display = 'none';

    imgEl.onerror = function() {
        // If image file doesn't exist yet, show a stunning Buddhist emoji / vector glow placeholder
        imgEl.style.opacity = 0;
        fallbackEl.innerText = story.fallbackIcon;
        fallbackEl.style.display = 'flex';
    };
    imgEl.onload = function() {
        imgEl.style.opacity = 1;
    };
    
    // Enable/disable navigation buttons
    document.getElementById('btnPrev').disabled = index === 0;
    document.getElementById('btnNext').disabled = index === jatakaStory.length - 1;
    
    // Stop speech synthesis if it was speaking
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
}

function updateStoryDisplay() {
    const story = jatakaStory[activePanelIndex];
    const textSi = document.getElementById('storyTextSi');
    const textEn = document.getElementById('storyTextEn');
    const titleSi = document.getElementById('storyTitleSi');
    const titleEn = document.getElementById('storyTitleEn');
    
    titleSi.innerText = story.titleSi;
    titleEn.innerText = story.titleEn;
    
    textSi.innerText = story.textSi;
    textEn.innerText = story.textEn;

    if (currentLanguage === 'si') {
        textSi.style.display = 'block';
        titleSi.style.display = 'block';
        textEn.style.display = 'none';
        titleEn.style.display = 'none';
    } else {
        textSi.style.display = 'none';
        titleSi.style.display = 'none';
        textEn.style.display = 'block';
        titleEn.style.display = 'block';
    }
}

function setLanguage(lang) {
    currentLanguage = lang;
    document.getElementById('btnLangSi').classList.toggle('active', lang === 'si');
    document.getElementById('btnLangEn').classList.toggle('active', lang === 'en');
    updateStoryDisplay();
}

function navigateStory(direction) {
    const nextIndex = activePanelIndex + direction;
    if (nextIndex >= 0 && nextIndex < jatakaStory.length) {
        loadStoryPanel(nextIndex);
    }
}

function toggleAutoPlay(button) {
    if (isAutoPlaying) {
        clearInterval(autoPlayInterval);
        isAutoPlaying = false;
        button.classList.remove('playing');
        button.innerHTML = '🔄 Auto Play Story';
    } else {
        isAutoPlaying = true;
        button.classList.add('playing');
        button.innerHTML = '⏸️ Stop Auto Play';
        
        autoPlayInterval = setInterval(() => {
            if (activePanelIndex < jatakaStory.length - 1) {
                navigateStory(1);
            } else {
                // Loop back to panel 1
                loadStoryPanel(0);
            }
        }, 10000); // 10 seconds per panel
    }
}

function speakStory() {
    if (!window.speechSynthesis) {
        alert("Speech synthesis is not supported on this browser.");
        return;
    }
    
    window.speechSynthesis.cancel(); // Stop current speech
    
    const story = jatakaStory[activePanelIndex];
    let text = currentLanguage === 'si' ? story.textSi : story.textEn;
    let voiceLang = currentLanguage === 'si' ? 'si-LK' : 'en-US';
    
    speechUtterance = new SpeechSynthesisUtterance(text);
    speechUtterance.lang = voiceLang;
    speechUtterance.rate = 0.95; // slightly slower for peaceful narrative feel
    
    // Choose appropriate voice if available
    const voices = window.speechSynthesis.getVoices();
    if (currentLanguage === 'en') {
        const premiumVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural'));
        if (premiumVoice) speechUtterance.voice = premiumVoice;
    }
    
    window.speechSynthesis.speak(speechUtterance);
}

/* --- THORANA BULB CONTROLLERS (LIGHT CIRCUITS) --- */
function startLightLoop() {
    restartLightLoop();
}

function restartLightLoop() {
    if (lightInterval) {
        clearInterval(lightInterval);
    }
    lightInterval = setInterval(runLightPatternStep, lightSpeed);
}

function changeLightPattern(patternName) {
    activePattern = patternName;
}

function runLightPatternStep() {
    const bulbs = document.querySelectorAll('.bulb');
    if (bulbs.length === 0) return;
    
    bulbStateTick++;
    
    bulbs.forEach((bulb, idx) => {
        let shouldBeOn = false;
        
        switch (activePattern) {
            case 'chasing':
                // Chasing patterns around the ring. Turns on every 3rd bulb, moves with tick
                shouldBeOn = (idx + bulbStateTick) % 3 === 0;
                break;
                
            case 'aura':
                // Smooth radial glowing waves. Bulbs are activated based on their ID groups or geometric positions
                const layer = parseInt(bulb.dataset.layer || "0");
                const cycle = bulbStateTick % 4;
                shouldBeOn = layer === cycle;
                break;
                
            case 'sparkle':
                // Rapid twinkling of random bulbs
                shouldBeOn = Math.random() > 0.6;
                break;
                
            case 'rainbow':
                // Group bulbs by flag colors and flash them in a waving sequence
                const flagColor = idx % 5; // 5 colors: blue, yellow, red, white, orange
                const activeColorIndex = bulbStateTick % 5;
                shouldBeOn = flagColor === activeColorIndex;
                break;
                
            case 'calm':
            default:
                // Breathing glow - slowly pulses all bulbs together
                const wave = Math.sin(bulbStateTick * 0.2);
                shouldBeOn = wave > -0.2;
                break;
        }
        
        if (shouldBeOn) {
            bulb.classList.add('active');
        } else {
            bulb.classList.remove('active');
        }
    });
}


/* ==========================================
   4. VESAK CARD GENERATOR ENGINE
   ========================================== */
let canvas, ctx;
let cardBgImage = new Image();
let currentBgType = 'buddha';
let cardLoadedImages = {};

const vesakVerses = [
    { text: "සැමදෙනාටම පින්බර වෙසක් මංගල්‍යයක් වේවා!", lang: "si" },
    { text: "සම්මා සම්බුදු සරණින් මෙලොව පරලොව සැනසීම ලැබේවා!", lang: "si" },
    { text: "නමෝ තස්ස භගවතෝ අරහතෝ සම්මා සම්බුද්ධස්ස.", lang: "si" },
    { text: "Wishing you a peaceful, joyful, and blessed Vesak Poya Day!", lang: "en" },
    { text: "May the light of Dharma guide you towards eternal peace.", lang: "en" },
    { text: "May Lord Buddha bless your home with harmony and happiness.", lang: "en" }
];

function initCardGenerator() {
    canvas = document.getElementById('cardCanvas');
    ctx = canvas.getContext('2d');
    
    // Set fixed high resolution dimensions for premium cards
    canvas.width = 800;
    canvas.height = 800;
    
    // Bind control inputs
    document.getElementById('cardSenderName').addEventListener('input', drawCard);
    document.getElementById('cardGreetingText').addEventListener('input', drawCard);
    
    document.getElementById('textColor').addEventListener('input', drawCard);
    document.getElementById('textSize').addEventListener('input', drawCard);
    document.getElementById('textOffset').addEventListener('input', drawCard);
    
    // Font selection
    document.getElementById('cardFont').addEventListener('change', drawCard);

    // Border and overlay selections
    document.getElementById('overlayLamps').addEventListener('change', drawCard);
    document.getElementById('overlayLotus').addEventListener('change', drawCard);
    document.getElementById('overlayBorders').addEventListener('change', drawCard);
    
    // BG Options click
    const bgOptions = document.querySelectorAll('.bg-option');
    bgOptions.forEach(opt => {
        opt.addEventListener('click', function() {
            bgOptions.forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            selectCardBackground(this.dataset.bg);
        });
    });
    
    // Load pre-written verses
    const versesContainer = document.getElementById('versesList');
    vesakVerses.forEach(verse => {
        const vDiv = document.createElement('div');
        vDiv.className = 'verse-item';
        vDiv.innerText = verse.text;
        vDiv.addEventListener('click', () => {
            document.getElementById('cardGreetingText').value = verse.text;
            drawCard();
        });
        versesContainer.appendChild(vDiv);
    });
    
    // Export button
    document.getElementById('btnDownloadCard').addEventListener('click', downloadCardImage);
    
    // Initial draw
    selectCardBackground('buddha');
}

function selectCardBackground(bgType) {
    currentBgType = bgType;
    
    // Set image source based on selection
    let imgSrc = '';
    if (bgType === 'buddha') imgSrc = 'assets/bg_buddha.jpg';
    else if (bgType === 'lanterns') imgSrc = 'assets/bg_lanterns.jpg';
    else if (bgType === 'lotus') imgSrc = 'assets/bg_lotus.jpg';
    
    cardBgImage.src = imgSrc;
    
    cardBgImage.onload = () => {
        drawCard();
    };
    
    cardBgImage.onerror = () => {
        // Fallback to high-quality vector rendering on canvas if image is not loaded yet
        console.warn("Background image not found. Using high-quality procedural backdrop instead.");
        drawCard();
    };
}

function drawCard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Draw Background Image or Fallback Gradient
    if (cardBgImage.complete && cardBgImage.naturalWidth !== 0) {
        ctx.drawImage(cardBgImage, 0, 0, canvas.width, canvas.height);
        
        // Darken overlay slightly to make white text pop in high contrast
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        // Gorgeous fallback procedural gradient
        let gradient;
        if (currentBgType === 'buddha') {
            // Celestial Buddha golden night gradient
            gradient = ctx.createRadialGradient(400, 300, 50, 400, 400, 550);
            gradient.addColorStop(0, '#1d1947');
            gradient.addColorStop(0.5, '#0c0a29');
            gradient.addColorStop(1, '#03030c');
        } else if (currentBgType === 'lanterns') {
            // Warm orange lantern glow gradient
            gradient = ctx.createLinearGradient(0, 0, 0, 800);
            gradient.addColorStop(0, '#1f1303');
            gradient.addColorStop(0.6, '#0f0701');
            gradient.addColorStop(1, '#050200');
        } else {
            // Calm pink lotus river gradient
            gradient = ctx.createLinearGradient(0, 800, 800, 0);
            gradient.addColorStop(0, '#0d021c');
            gradient.addColorStop(0.7, '#1f0d3a');
            gradient.addColorStop(1, '#07000f');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw procedural full moon in the background
        ctx.beginPath();
        ctx.arc(400, 180, 80, 0, Math.PI * 2);
        let moonGrad = ctx.createRadialGradient(400, 180, 10, 400, 180, 80);
        moonGrad.addColorStop(0, '#ffffff');
        moonGrad.addColorStop(0.3, '#fffae8');
        moonGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = moonGrad;
        ctx.fill();
        
        // Draw procedural silhouette (Bodhi tree or serene meditating figure)
        drawProceduralSilhouettes();
    }
    
    // 2. Draw Decorative Border Overlays
    const bordersActive = document.getElementById('overlayBorders').checked;
    if (bordersActive) {
        drawPremiumBorders();
    }

    const lampsActive = document.getElementById('overlayLamps').checked;
    if (lampsActive) {
        drawProceduralOilLamps();
    }

    const lotusActive = document.getElementById('overlayLotus').checked;
    if (lotusActive) {
        drawProceduralLotusOrnaments();
    }
    
    // 3. Draw Greeting and Sender Text
    drawCardTexts();
}

function drawProceduralSilhouettes() {
    if (currentBgType === 'buddha') {
        // Meditating Buddha Silhouette
        ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
        
        // Base / Lotus seat
        ctx.beginPath();
        ctx.moveTo(250, 520);
        ctx.quadraticCurveTo(400, 470, 550, 520);
        ctx.quadraticCurveTo(400, 560, 250, 520);
        ctx.fill();

        // Torso & shoulders
        ctx.beginPath();
        ctx.arc(400, 430, 65, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(400, 460, 85, 45, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head and Ushnisha (crown)
        ctx.beginPath();
        ctx.arc(400, 345, 38, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(400, 298, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Golden glowing aura ring behind head
        ctx.beginPath();
        ctx.arc(400, 340, 75, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 215, 0, 0.45)";
        ctx.lineWidth = 4;
        ctx.shadowColor = "rgba(255, 215, 0, 0.8)";
        ctx.shadowBlur = 25;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
    }
}

function drawPremiumBorders() {
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 3;
    
    // Outer border
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
    
    // Inner thin border
    ctx.strokeStyle = "rgba(255, 215, 0, 0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
    
    // Classic elegant corner designs
    const corners = [
        { x: 30, y: 30, dx: 1, dy: 1 },
        { x: canvas.width - 30, y: 30, dx: -1, dy: 1 },
        { x: 30, y: canvas.height - 30, dx: 1, dy: -1 },
        { x: canvas.width - 30, y: canvas.height - 30, dx: -1, dy: -1 }
    ];
    
    corners.forEach(c => {
        ctx.beginPath();
        ctx.moveTo(c.x, c.y + c.dy * 40);
        ctx.lineTo(c.x, c.y);
        ctx.lineTo(c.x + c.dx * 40, c.y);
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Draw tiny decorative diamond near corner
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.arc(c.x + c.dx * 25, c.y + c.dy * 25, 4, 0, Math.PI*2);
        ctx.fill();
    });
}

function drawProceduralOilLamps() {
    // Draw 3 glowing clay oil lamps along the bottom corner regions
    const lampPositions = [
        { x: 120, y: 720, scale: 0.8 },
        { x: 400, y: 740, scale: 1.2 },
        { x: 680, y: 720, scale: 0.8 }
    ];

    lampPositions.forEach(lamp => {
        ctx.save();
        ctx.translate(lamp.x, lamp.y);
        ctx.scale(lamp.scale, lamp.scale);

        // Clay body
        ctx.beginPath();
        ctx.moveTo(-50, 0);
        ctx.bezierCurveTo(-50, 30, 50, 30, 50, 0);
        ctx.quadraticCurveTo(0, -10, -50, 0);
        ctx.fillStyle = "#a0522d"; // clay brown
        ctx.fill();
        ctx.strokeStyle = "#8b4513";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Flame glow
        ctx.shadowColor = "#ff8c00";
        ctx.shadowBlur = 30;
        
        // Outer Orange Flame
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.quadraticCurveTo(-15, -35, 0, -60);
        ctx.quadraticCurveTo(15, -35, 0, -10);
        ctx.fillStyle = "#ff4500";
        ctx.fill();

        // Inner Golden Flame
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.quadraticCurveTo(-8, -32, 0, -50);
        ctx.quadraticCurveTo(8, -32, 0, -15);
        ctx.fillStyle = "#ffd700";
        ctx.fill();

        ctx.restore();
    });
}

function drawProceduralLotusOrnaments() {
    // Draw a pair of stylized pink lotus flowers in upper corners
    const lotusPlacements = [
        { x: 100, y: 100, flip: false },
        { x: 700, y: 100, flip: true }
    ];

    lotusPlacements.forEach(lotus => {
        ctx.save();
        ctx.translate(lotus.x, lotus.y);
        if (lotus.flip) ctx.scale(-1, 1);
        
        // Draw leaves and pink petals
        ctx.fillStyle = "rgba(255, 105, 180, 0.85)"; // pink
        
        // Lotus Petals
        for (let i = 0; i < 5; i++) {
            ctx.rotate(Math.PI / 10);
            ctx.beginPath();
            ctx.ellipse(0, 0, 25, 8, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Central Golden core
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#ffd700";
        ctx.fill();

        ctx.restore();
    });
}

function drawCardTexts() {
    const greetingText = document.getElementById('cardGreetingText').value.trim() || "සැමදෙනාටම පින්බර වෙසක් මංගල්‍යයක් වේවා!";
    const senderName = document.getElementById('cardSenderName').value.trim();
    
    const fontName = document.getElementById('cardFont').value; // 'Abhaya Libre', 'Outfit', or 'Yatra One'
    const colorHex = document.getElementById('textColor').value;
    const sizeOffset = parseInt(document.getElementById('textSize').value);
    const verticalOffset = parseInt(document.getElementById('textOffset').value);
    
    // Shadow details for glowing elegant text
    ctx.shadowColor = "rgba(0,0,0,0.85)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Draw Greeting Text
    ctx.fillStyle = colorHex;
    ctx.textAlign = "center";
    
    // Set appropriate font line size
    const fontSize = 32 + sizeOffset;
    ctx.font = `600 ${fontSize}px '${fontName}', sans-serif`;
    
    // Wrap and draw multiline greeting text
    const textYPos = 460 + verticalOffset;
    wrapText(ctx, greetingText, 400, textYPos, 620, fontSize * 1.35);
    
    // Draw Sender Name if exists
    if (senderName) {
        ctx.shadowBlur = 6;
        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.font = `italic 300 24px 'Outfit', sans-serif`;
        
        // Small decorative line above sender name
        const lineY = 670;
        ctx.beginPath();
        ctx.moveTo(320, lineY);
        ctx.lineTo(480, lineY);
        ctx.strokeStyle = "rgba(255, 215, 0, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.fillStyle = "#ffd700";
        ctx.font = `500 22px 'Outfit', sans-serif`;
        ctx.fillText(`- ${senderName} -`, 400, 715);
    }
    
    // Reset shadow values
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

// Canvas text wrap utility
function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = context.measureText(testLine);
        let testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
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
    // Generate card name based on sender
    const sender = document.getElementById('cardSenderName').value.trim() || 'Vesak';
    const cleanSender = sender.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filename = `vesak_card_${cleanSender}.png`;
    
    // Save image trigger
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

/* ==========================================
   5. VESAK POYA COUNTDOWN TIMER
   ========================================== */
function initCountdown() {
    // Set Target Date: Vesak Full Moon Poya Day (May 31, 2026)
    const targetDate = new Date("May 31, 2026 00:00:00").getTime();
    
    function updateTimer() {
        const now = new Date().getTime();
        const difference = targetDate - now;
        
        const daysEl = document.getElementById('daysBox');
        const hoursEl = document.getElementById('hoursBox');
        const minsEl = document.getElementById('minsBox');
        const secsEl = document.getElementById('secsBox');
        
        if (!daysEl || !hoursEl || !minsEl || !secsEl) return;
        
        if (difference <= 0) {
            // Poya day arrived or passed
            daysEl.innerText = "00";
            hoursEl.innerText = "00";
            minsEl.innerText = "00";
            secsEl.innerText = "00";
            
            const titleSi = document.getElementById('heroTitleSi');
            if (titleSi) {
                titleSi.innerText = "සාදු! සාදු! පින්බර වෙසක් මංගල්‍යයක් වේවා!";
                titleSi.style.color = "#ffd700";
            }
            return;
        }
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        daysEl.innerText = String(days).padStart(2, '0');
        hoursEl.innerText = String(hours).padStart(2, '0');
        minsEl.innerText = String(minutes).padStart(2, '0');
        secsEl.innerText = String(seconds).padStart(2, '0');
    }
    
    updateTimer();
    setInterval(updateTimer, 1000);
}

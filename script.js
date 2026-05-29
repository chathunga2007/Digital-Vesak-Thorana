document.addEventListener('DOMContentLoaded', () => {
    initStars();

    if (document.getElementById('pandalSvg')) {
        initThorana();
    }

    if (document.getElementById('cardCanvas')) {
        initCardGenerator();
    }

    if (document.getElementById('daysBox')) {
        initCountdown();
    }
});

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
   2. AMBIENT AUDIO & SYNTH ENGINE
   ========================================== */
let audioCtx = null;
let synthInterval = null;
let isSynthPlaying = false;
let bgMusicAudio = null;

function toggleAmbientAudio(button) {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (isSynthPlaying) {
        stopAmbientSynth();
        if (bgMusicAudio) bgMusicAudio.pause();
        button.classList.remove('playing');
        button.innerHTML = '🎵 Play Ambient Music';
        isSynthPlaying = false;
    } else {
        isSynthPlaying = true;
        button.classList.add('playing');
        button.innerHTML = '🔊 Playing Devotional Music';
        playMusicFile();
        startAmbientSynth();
    }
}

function playMusicFile() {
    if (!bgMusicAudio) {
        bgMusicAudio = new Audio('assets/vesak_music.mp3');
        bgMusicAudio.loop = true;
        bgMusicAudio.volume = 0.5;
    }
    bgMusicAudio.play().catch(() => {
        console.log("Custom MP3 not found. Synth bells playing instead.");
    });
}

function startAmbientSynth() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playBell(220);
    playBell(330);
    const notes = [220, 277.18, 329.63, 369.99, 440, 554.37, 659.25];
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

        osc.start(now); overtone.start(now);
        osc.stop(now + 6.5); overtone.stop(now + 3.5);
    } catch (e) { console.error("Synth error:", e); }
}

/* ==========================================
   3. DIGITAL VESAK THORANA ENGINE
   ========================================== */
const jatakaStory = [
    {
        titleSi: "01. මහා අධිෂ්ඨානය",
        titleEn: "01. The Devotional Vow",
        textSi: "පින්බර පොහෝ දිනක සාවා, උණහපුළුවා, සිවලා සහ වඳුරා එක්ව සිල් සමාදන් වීමට අදිටන් කර ගත්හ. සාවා තම යහළුවන්ට කරුණාවෙන් ධර්මය දේශනා කරමින්, පැමිණෙන ඕනෑම යාචකයෙකුට ආහාර දීමට පොරොන්දු විය.",
        textEn: "On a sacred Full Moon Poya day, the wise hare, the otter, the jackal, and the monkey gathered in the forest and vowed to keep the holy precepts. The virtuous hare preached the Dhamma to his friends, urging them to offer food to any hungry traveler who passed by.",
        img: "assets/panel1.jpg",
        fallbackIcon: "🕊️"
    },
    {
        titleSi: "02. දන් සෙවීම",
        titleEn: "02. Gathering the Offerings",
        textSi: "අනෙක් සතුන් දානය සඳහා ආහාර සෙවූහ. උණහපුළුවා මසුන් ද, සිවලා මුදවාපු කිරි කළයක් ද, වඳුරා අඹ ගෙඩි ද සොයා ගත්හ. එහෙත් සාවාට සොයා ගත හැකි වූයේ තණකොළ පමණි.",
        textEn: "The friends went in search of food to offer as alms. The otter caught fresh fish, the jackal found a jar of curd, and the monkey gathered sweet mangoes. However, the gentle hare could only find grass, which was unfit for humans.",
        img: "assets/panel2.jpg",
        fallbackIcon: "🐟"
    },
    {
        titleSi: "03. ජීවිත දානය",
        titleEn: "03. The Ultimate Sacrifice",
        textSi: "සාවා තමා සතුව දීමට කිසිවක් නැති බව වටහාගෙන, මහත් ශ්‍රද්ධාවෙන් යුතුව තම ශරීරයම දන් දීමට අදිටන් කර ගත්තේය. 'කවුරුන් හෝ පැමිණියහොත් මම මගේම මාංශයෙන් ඔහුව පෝෂණය කරමි' යි සාවා සිතීය.",
        textEn: "Realizing he had nothing suitable to offer, the hare resolved with pure faith to sacrifice his own life. 'If a guest arrives, I shall offer my own flesh to feed them,' the noble hare selflessly decided under the glowing moon.",
        img: "assets/panel3.jpg",
        fallbackIcon: "🐇"
    },
    {
        titleSi: "04. ශක්‍ර දේවේන්ද්‍රයාගේ පරීක්ෂණය",
        titleEn: "04. The Divine Test",
        textSi: "සතුන්ගේ අදිටන පරීක්ෂා කරනු පිණිස ශක්‍ර දේවේන්ද්‍රයා මහලු බ්‍රාහ්මණයෙකුගේ වේශයෙන් පැමිණියේය. සෙසු මිතුරන් තම තමන් සොයාගත් ආහාර පූජා කළ අතර, සාවා දානය සඳහා ගිනි ගොඩක් සූදානම් කරන ලෙස පැවසීය.",
        textEn: "To test their virtue, Lord Sakra, king of the gods, descended disguised as a hungry, old Brahmin. While the other animals offered their collected food, the hare joyfully requested the Brahmin to prepare a fire so he could offer his body.",
        img: "assets/panel4.jpg",
        fallbackIcon: "🔥"
    },
    {
        titleSi: "05. ශශ ලාංඡනය",
        titleEn: "05. The Eternal Tribute",
        textSi: "සාවා කිසිදු පැකිලීමකින් තොරව රක්ත වර්ණ ගින්නට පැන්නේය. එහෙත් ඔහුගේ උදාර ගුණය නිසා ගින්න සිසිල් විය. පැහැදුණු ශක්‍ර දේවේන්ද්‍රයා සාවාගේ රූපය සදාකාලික සිහිවටනයක් ලෙස සඳ මත ඇන්දේය.",
        textEn: "With complete selflessness, the hare leapt into the blazing fire. Yet, due to his supreme virtue, the flames turned cold. Overwhelmed with admiration, Lord Sakra revealed his divine form and painted the hare's image on the moon forever.",
        img: "assets/panel5.jpg",
        fallbackIcon: "🌕"
    }
];

let activePanelIndex = 0;
let currentLanguage = 'si';
let autoPlayInterval = null;
let isAutoPlaying = false;

// Thorana lights
let lightInterval = null;
let lightSpeed = 300;
let activePattern = 'chasing';
let bulbStateTick = 0;

function initThorana() {
    loadStoryPanel(0);

    document.getElementById('btnPrev').addEventListener('click', () => navigateStory(-1));
    document.getElementById('btnNext').addEventListener('click', () => navigateStory(1));
    document.getElementById('btnLangSi').addEventListener('click', () => setLanguage('si'));
    document.getElementById('btnLangEn').addEventListener('click', () => setLanguage('en'));
    document.getElementById('btnAutoPlay').addEventListener('click', function () { toggleAutoPlay(this); });
    document.getElementById('btnAmbientAudio').addEventListener('click', function () { toggleAmbientAudio(this); });
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
    const story = jatakaStory[index];

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
    document.getElementById('btnNext').disabled = index === jatakaStory.length - 1;

    if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function updateStoryDisplay() {
    const story = jatakaStory[activePanelIndex];
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
    if (next >= 0 && next < jatakaStory.length) loadStoryPanel(next);
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
            activePanelIndex < jatakaStory.length - 1 ? navigateStory(1) : loadStoryPanel(0);
        }, 10000);
    }
}

function speakStory() {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const story = jatakaStory[activePanelIndex];
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
    document.getElementById('cardSenderName').addEventListener('input', drawCard);
    document.getElementById('cardGreetingText').addEventListener('input', drawCard);
    document.getElementById('textColor').addEventListener('input', drawCard);
    document.getElementById('textSize').addEventListener('input', drawCard);
    document.getElementById('textOffset').addEventListener('input', drawCard);
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
        selectCardBackground('buddha');
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

    // Export
    document.getElementById('btnDownloadCard').addEventListener('click', downloadCardImage);

    // Initial
    selectCardBackground('buddha');
}

function selectCardBackground(bgType) {
    currentBgType = bgType;
    let src = '';
    if (bgType === 'buddha') src = 'assets/bg_buddha.jpg';
    else if (bgType === 'lanterns') src = 'assets/bg_lanterns.jpg';
    else if (bgType === 'lotus') src = 'assets/bg_lotus.jpg';

    cardBgImage = new Image();
    cardBgImage.src = src;
    cardBgImage.onload = () => drawCard();
    cardBgImage.onerror = () => drawCard();
}

function drawCard() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // === 1. Background ===
    if (uploadedImage) {
        drawCoverImage(uploadedImage, W, H);
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(0, 0, W, H);
    } else if (cardBgImage.complete && cardBgImage.naturalWidth > 0) {
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
    const fontName = document.getElementById('cardFont').value;
    const colorHex = document.getElementById('textColor').value;
    const sizeOffset = parseInt(document.getElementById('textSize').value);
    const verticalOffset = parseInt(document.getElementById('textOffset').value);
    const useGold = document.getElementById('useGoldGradient').checked;

    const fontSize = 32 + sizeOffset;

    // Shadow
    ctx.shadowColor = "rgba(0,0,0,0.85)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Text alignment
    let alignX = W / 2;
    ctx.textAlign = textAlignment;
    if (textAlignment === 'left') alignX = 70;
    else if (textAlignment === 'right') alignX = W - 70;

    // Color or Gold Gradient
    if (useGold) {
        const goldGrad = ctx.createLinearGradient(0, 400 + verticalOffset, 0, 500 + verticalOffset);
        goldGrad.addColorStop(0, '#ffe875');
        goldGrad.addColorStop(0.3, '#ffd700');
        goldGrad.addColorStop(0.6, '#daa520');
        goldGrad.addColorStop(1, '#b8860b');
        ctx.fillStyle = goldGrad;
    } else {
        ctx.fillStyle = colorHex;
    }

    ctx.font = `600 ${fontSize}px '${fontName}', sans-serif`;
    const textYPos = 460 + verticalOffset;
    const maxWidth = textAlignment === 'center' ? 620 : 660;
    wrapText(ctx, greetingText, alignX, textYPos, maxWidth, fontSize * 1.35);

    // Sender name
    if (senderName) {
        ctx.shadowBlur = 6;
        const lineY = 680 + verticalOffset;
        ctx.beginPath();
        ctx.moveTo(W / 2 - 80, lineY);
        ctx.lineTo(W / 2 + 80, lineY);
        ctx.strokeStyle = "rgba(255,215,0,0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#ffd700";
        ctx.textAlign = 'center';
        ctx.font = `500 22px 'Outfit', sans-serif`;
        ctx.fillText(`~ ${senderName} ~`, W / 2, lineY + 30);
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

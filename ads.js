/* ==================================================================
    MiniFlash - ROBUST & MODULAR ADVERTISEMENT SYSTEM
   ================================================================== */
(function() {
    /* ------------------------------------------------------------------
       [1] ADVERTISEMENT CONFIGURATION (AAPKA CONTROL PANEL)
    ------------------------------------------------------------------ */
    const useAdSense = false; 

    // NEW: Direct Ads ke liye alag se switch
    const useDirectAds = false;

    const adSenseLogic = () => `<div style="text-align: center; padding: 20px;"><h3>Advertisement</h3><p>(Google Ad would display here)</p></div>`;

    const directAds = [
        {
            title: "Awesome Game Studio",
            image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",
            link: "https://example.com/gamestudio"
        },
        {
            title: "Super Cool Gaming Headset",
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
            link: "https://example.com/headset"
        }
    ];

    /* ------------------------------------------------------------------
       [2] CORE AD SYSTEM LOGIC (Isko edit karne ki zaroorat nahi)
    ------------------------------------------------------------------ */
    const allAds = [];
    if (useAdSense) {
        allAds.push({ type: 'adsense' });
    }
    // Sirf tabhi direct ads add karein jab switch ON ho
    if (useDirectAds) {
        directAds.forEach(ad => allAds.push({ type: 'direct', ...ad }));
    }
    
    // Yeh ek "Master Switch" hai jo batata hai ke ads chalane hain ya nahi
    const adsEnabled = allAds.length > 0;

    // Agar koi ad enable nahi hai, to script ko yahin rok do.
    if (!adsEnabled) {
        // Sirf click listeners lagao jo direct game khol dein.
        document.addEventListener('gamesRendered', () => {
            document.querySelectorAll('.game-card').forEach(card => {
                const gameUrl = card.dataset.url;
                if (gameUrl && !card.dataset.listenerAttached) {
                    card.dataset.listenerAttached = 'true';
                    card.addEventListener('click', () => {
                        window.location.href = gameUrl;
                    });
                }
            });
        });
        return; // Ad ka baki code nahi chalega.
    }

    // --- Ad ka logic sirf tab chalega jab adsEnabled = true ho ---

    const adModal = document.getElementById('adModal');
    const adContent = document.getElementById('adContent');
    const skipAdBtn = document.getElementById('skipAdBtn');
    let gameUrlToOpen = null;

    function getNextAd() {
        let seenAdIndices = JSON.parse(sessionStorage.getItem('seenAdIndices') || '[]');
        if (seenAdIndices.length >= allAds.length) seenAdIndices = [];
        const availableAds = allAds.filter((ad, index) => !seenAdIndices.includes(index));
        const nextAd = availableAds[Math.floor(Math.random() * availableAds.length)];
        const originalIndex = allAds.indexOf(nextAd);
        seenAdIndices.push(originalIndex);
        sessionStorage.setItem('seenAdIndices', JSON.stringify(seenAdIndices));
        return nextAd;
    }

    function showAd(destinationUrl) {
        gameUrlToOpen = destinationUrl;
        const ad = getNextAd();
        adContent.innerHTML = '';
        if (ad.type === 'direct') {
            adContent.innerHTML = `<a href="${ad.link}" target="_blank"><img src="${ad.image}" alt="${ad.title}" style="display:block;width:100%;"></a>`;
        } else {
            adContent.innerHTML = adSenseLogic();
        }

        const skipButton = skipAdBtn;
        let countdown = 5; 
        skipButton.disabled = true;
        skipButton.textContent = `Skip in ${countdown}...`;
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                skipButton.textContent = `Skip in ${countdown}...`;
            } else {
                clearInterval(countdownInterval);
                skipButton.disabled = false;
                skipButton.textContent = "Skip Ad & Play";
            }
        }, 1000);
        adModal.classList.add('open');
    }

    skipAdBtn.onclick = () => {
        adModal.classList.remove('open');
        if (gameUrlToOpen) window.location.href = gameUrlToOpen;
    };
    
    function addAdBadges() {
        document.querySelectorAll('.game-thumbnail').forEach(thumb => {
            if (!thumb.querySelector('.ad_warn')) {
                const badge = document.createElement('div');
                badge.className = 'ad_warn';
                badge.textContent = 'AD';
                thumb.prepend(badge);
            }
        });
    }
    
    function attachAdListeners() {
        document.querySelectorAll('.game-card').forEach(card => {
            const gameUrl = card.dataset.url;
            if (gameUrl && !card.dataset.listenerAttached) {
                card.dataset.listenerAttached = 'true';
                card.addEventListener('click', e => {
                    e.preventDefault();
                    showAd(gameUrl);
                });
            }
        });
    }

    function initAdSystem() {
        addAdBadges();
        attachAdListeners();
    }
    
    document.addEventListener('gamesRendered', initAdSystem);
})();

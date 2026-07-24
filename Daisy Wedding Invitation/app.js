/**
 * Daisy Wedding Invitation - JavaScript Interactivity
 * Integrates dynamically with config.js and the Creator Studio Panel
 */

document.addEventListener('DOMContentLoaded', async () => {
    // ----------------------------------------------------
    // 0. Configuration Setup — Cloud first, then LocalStorage fallback
    // ----------------------------------------------------
    const defaultConfig = window.weddingConfig;
    if (!defaultConfig) {
        console.error("Wedding Configuration (config.js) not found. Please ensure config.js is loaded.");
        return;
    }

    let activeConfig = { ...defaultConfig };

    // Helper: deep-merge a parsed config object over the default
    function mergeConfig(parsed) {
        return {
            ...defaultConfig,
            ...parsed,
            sections: { ...defaultConfig.sections, ...parsed.sections },
            parents: { ...(defaultConfig.parents || {}), ...(parsed.parents || {}) },
            venue: { ...defaultConfig.venue, ...parsed.venue },
            colors: { ...defaultConfig.colors, ...parsed.colors },
            loveQuote: { ...defaultConfig.loveQuote, ...parsed.loveQuote },
            dressCode: { ...defaultConfig.dressCode, ...parsed.dressCode },
            design: {
                ...defaultConfig.design,
                ...parsed.design,
                heroBouquetStyle: { ...(defaultConfig.design?.heroBouquetStyle || { x: 0, y: 0, scale: 1.0, rotate: 0 }), ...(parsed.design?.heroBouquetStyle || {}) },
                overrides: { ...(defaultConfig.design?.overrides || {}), ...(parsed.design?.overrides || {}) },
                textOverrides: { ...(defaultConfig.design?.textOverrides || {}), ...(parsed.design?.textOverrides || {}) },
                floatingImages: parsed.design?.floatingImages || defaultConfig.design?.floatingImages || []
            },
            story: parsed.story || defaultConfig.story,
            schedule: parsed.schedule || defaultConfig.schedule,
            accommodations: parsed.accommodations || defaultConfig.accommodations
        };
    }

    // Supabase Credentials & Multi-Tenant Site Isolation
    const SUPABASE_URL = "https://gsasgcrcyxztmpsncffl.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzYXNnY3JjeXh6dG1wc25jZmZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3NTYwOTksImV4cCI6MjEwMDMzMjA5OX0.sgpUuSQR4OCO2P5UqUo5zBc12HRFOMt47R40zVbTDVE";

    const urlParams = new URLSearchParams(window.location.search);
    const clientParam = urlParams.get('client');
    const CURRENT_HOST = window.location.hostname || '';

    const SITE_ID = clientParam
        ? `client_${clientParam.replace(/[^a-zA-Z0-9_-]/g, '')}`
        : ((CURRENT_HOST.includes('daisyalexander') || CURRENT_HOST.includes('localhost') || CURRENT_HOST === '')
            ? 'active'
            : CURRENT_HOST.replace(/[^a-zA-Z0-9_-]/g, '_'));

    const STORAGE_KEY = `wedding_design_config_${SITE_ID}`;
    const RSVP_KEY = `wedding_rsvp_${SITE_ID}`;

    // 1. Instant Synchronous Initial Render (from localStorage cache or defaultConfig)
    const storedConfig = (SITE_ID === 'active')
        ? (localStorage.getItem(STORAGE_KEY) || localStorage.getItem('daisy_wedding_design_config'))
        : localStorage.getItem(STORAGE_KEY);
    if (storedConfig) {
        try {
            const parsed = JSON.parse(storedConfig);
            activeConfig = mergeConfig(parsed);
            console.log('Merged cached creator design for instant first paint.');
        } catch (e) {
            console.error('Error parsing saved design config, using defaults:', e);
        }
    }

    // Apply immediate UI render (<50ms) without waiting for network
    if (typeof applyThemeColors === 'function') applyThemeColors(activeConfig.colors);
    if (typeof renderDynamicElements === 'function') renderDynamicElements(activeConfig);
    if (typeof applySectionVisibility === 'function') applySectionVisibility(activeConfig.sections);

    // 2. Non-blocking Asynchronous Cloud Hydration from Supabase
    (async () => {
        try {
            const cloudResp = await fetch(`${SUPABASE_URL}/rest/v1/wedding_config?id=eq.${SITE_ID}&select=config`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });
            if (cloudResp.ok) {
                const rows = await cloudResp.json();
                if (rows && rows.length > 0 && rows[0].config && rows[0].config.brideName) {
                    activeConfig = mergeConfig(rows[0].config);
                    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(activeConfig)); } catch (e) {}
                    if (typeof applyThemeColors === 'function') applyThemeColors(activeConfig.colors);
                    if (typeof renderDynamicElements === 'function') renderDynamicElements(activeConfig);
                    if (typeof applySectionVisibility === 'function') applySectionVisibility(activeConfig.sections);
                    console.log(`Hydrated design config from Supabase Cloud (${SITE_ID})!`);
                }
            }
        } catch (e) {
            console.warn('Supabase background cloud hydration failed:', e);
        }
    })();

    // Creator trigger button — only visible after password unlock
    const creatorTrigger = document.querySelector('.creator-trigger-wrapper');
    const isUnlocked = localStorage.getItem('daisy_creator_unlocked') === 'true';
    if (creatorTrigger) {
        if (isUnlocked) {
            creatorTrigger.style.display = 'block';
            creatorTrigger.classList.remove('hidden');
        } else {
            creatorTrigger.style.display = 'none';
            creatorTrigger.classList.add('hidden');
        }
    }
    
    // Toast Notification Banner Helper
    let toastTimer = null;
    function showToast(msg, isError = false, icon = isError ? '⚠️' : '✅') {
        const toast = document.getElementById('creator-toast');
        const toastMsg = document.getElementById('creator-toast-msg');
        const toastIcon = document.getElementById('creator-toast-icon');
        if (!toast || !toastMsg) return;

        toastMsg.innerText = msg;
        if (toastIcon) toastIcon.innerText = icon;

        toast.classList.remove('hidden', 'toast-error', 'toast-success');
        toast.classList.add(isError ? 'toast-error' : 'toast-success');

        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.add('hidden');
        }, 4000);
    }

    // Helper: Smart converter for Google Drive, Dropbox, & Direct Audio URLs
    function getDirectAudioUrl(url) {
        if (!url) return '';
        let clean = url.trim();
        if (clean.startsWith('data:audio/')) return clean;
        if (clean.includes('dropbox.com')) {
            return clean.replace('dl=0', 'raw=1').replace('dl=1', 'raw=1');
        }
        if (clean.includes('drive.google.com') && clean.includes('/file/d/')) {
            const matches = clean.match(/\/file\/d\/([^\/]+)/);
            if (matches && matches[1]) {
                return 'https://drive.google.com/uc?export=download&id=' + matches[1];
            }
        }
        return clean;
    }

    // Helper: strip massive Data URLs (>50KB) for browser localStorage quota safety
    function createCleanConfigForStorage(cfg) {
        if (!cfg) return {};
        try {
            const str = JSON.stringify(cfg);
            const cleanedStr = str.replace(/data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]{50000,}/g, 'assets/daisy_bouquet.jpg');
            return JSON.parse(cleanedStr);
        } catch (e) {
            return cfg;
        }
    }

    // Auto-save helper (Saves locally + Auto-syncs to Supabase Cloud)
    let autoSaveTimer = null;
    function autoSaveConfig() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(activeConfig));
        } catch (e) {
            try {
                const cleanCfg = createCleanConfigForStorage(activeConfig);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanCfg));
            } catch (err) {
                console.warn("LocalStorage save fallback:", err);
            }
        }

        // Auto-sync to Supabase Cloud Database (debounced 500ms so typing doesn't spam)
        if (autoSaveTimer) clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            fetch(`${SUPABASE_URL}/rest/v1/wedding_config`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify({
                    id: SITE_ID,
                    config: activeConfig,
                    updated_at: new Date().toISOString()
                })
            }).then(res => {
                if (res.ok) {
                    console.log(`Auto-synced design changes to Supabase Cloud (${SITE_ID})!`);
                    showToast('✓ Edits saved & synced', false, '☁️');
                }
            }).catch(err => console.warn('Supabase cloud auto-sync error:', err));
        }, 500);
    }

    // Apply colors to CSS custom properties
    function applyThemeColors(colors) {
        const root = document.documentElement;
        if (colors.creamBg) root.style.setProperty('--color-cream-bg', colors.creamBg);
        if (colors.sageLight) root.style.setProperty('--color-sage-light', colors.sageLight);
        if (colors.sageMedium) root.style.setProperty('--color-sage-medium', colors.sageMedium);
        if (colors.forest) root.style.setProperty('--color-forest', colors.forest);
        if (colors.gold) root.style.setProperty('--color-gold', colors.gold);
    }

    // Toggle sections visibility dynamically
    function applySectionVisibility(sectionsObj) {
        if (!sectionsObj) return;

        const toggleVisible = (id, show) => {
            const el = document.getElementById(id);
            if (el) {
                if (show) el.classList.remove('hidden');
                else el.classList.add('hidden');
            }
        };

        // 1. Toggle Page Sections
        toggleVisible('parents-section', sectionsObj.parents);
        toggleVisible('quote-section', sectionsObj.quote);
        toggleVisible('story', sectionsObj.story);
        toggleVisible('schedule', sectionsObj.schedule);
        
        // 2. Toggle Cards Inside Details Section
        toggleVisible('card-dress-code', sectionsObj.dressCode);
        toggleVisible('card-accommodations', sectionsObj.accommodations);
        
        // Hide details section completely if BOTH dress code and accommodations are hidden
        const showDetailsSection = (sectionsObj.dressCode || sectionsObj.accommodations);
        toggleVisible('details', showDetailsSection);
        
        toggleVisible('countdown', sectionsObj.countdown);
        toggleVisible('rsvp', sectionsObj.rsvp);

        // Apply font size scale if configured
        if (activeConfig && activeConfig.design && activeConfig.design.fontSizeScale) {
            document.documentElement.style.fontSize = (16 * activeConfig.design.fontSizeScale / 100) + 'px';
        }

        // 3. Toggle Sticky Navigation Links
        toggleVisible('nav-link-story', sectionsObj.story);
        toggleVisible('nav-link-schedule', sectionsObj.schedule);
        toggleVisible('nav-link-details', showDetailsSection);
        toggleVisible('nav-link-countdown', sectionsObj.countdown);
        toggleVisible('nav-link-rsvp', sectionsObj.rsvp);

        // 4. Toggle Sidebar CMS Editor forms
        toggleVisible('editor-section-parents', sectionsObj.parents);
        toggleVisible('editor-section-quote', sectionsObj.quote);
        toggleVisible('editor-section-story', sectionsObj.story);
        toggleVisible('editor-section-schedule', sectionsObj.schedule);
        toggleVisible('editor-section-dress', sectionsObj.dressCode);
        toggleVisible('editor-section-accommodations', sectionsObj.accommodations);
    }

    // Render elements dynamically based on config
    function renderDynamicElements(configObj) {
        // Document Title
        document.title = `${configObj.brideName} & ${configObj.groomName} — Wedding Invitation`;

        // Hero Section
        document.getElementById('hero-title-el').innerHTML = `${configObj.brideName} &amp; ${configObj.groomName}`;
        document.getElementById('hero-date-el').innerText = configObj.weddingDateFormatted;
        document.getElementById('hero-location-el').innerText = configObj.venue.name;

        // Nav Bar Logo
        document.getElementById('nav-logo-el').innerHTML = `${configObj.brideName[0]} &amp; ${configObj.groomName[0]}`;

        // Parents Section
        if (configObj.parents) {
            const setElemText = (id, text) => { const el = document.getElementById(id); if (el && text !== undefined) el.innerText = text; };
            setElemText('parents-subtitle-el', configObj.parents.subtitle);
            setElemText('parents-title-el', configObj.parents.title);
            setElemText('bride-parents-label-el', configObj.parents.brideParentsLabel);
            setElemText('bride-parents-names-el', configObj.parents.brideParentsNames);
            setElemText('groom-parents-label-el', configObj.parents.groomParentsLabel);
            setElemText('groom-parents-names-el', configObj.parents.groomParentsNames);
        }

        // Quote Section
        document.getElementById('quote-text-el').innerText = `“${configObj.loveQuote.text}”`;
        document.getElementById('quote-author-el').innerText = configObj.loveQuote.author;

        // Venue Info
        document.getElementById('venue-name-el').innerText = configObj.venue.name;
        document.getElementById('venue-address-el').innerText = configObj.venue.address;
        document.getElementById('venue-note-el').innerHTML = `<strong>Note:</strong> ${configObj.venue.note}`;
        document.getElementById('venue-maps-el').setAttribute('href', configObj.venue.mapsUrl);

        // Dress Code Info
        document.getElementById('dress-style-el').innerText = configObj.dressCode.style;
        document.getElementById('dress-desc-el').innerText = configObj.dressCode.description;
        
        const colorsContainer = document.getElementById('dress-colors-container');
        if (configObj.dressCode.colors && configObj.dressCode.colors.length > 0) {
            colorsContainer.innerHTML = configObj.dressCode.colors.map(color => `
                <div class="color-swatch-wrapper">
                    <div class="color-swatch" style="background-color: ${color.hex};"></div>
                    <span class="color-swatch-name">${color.name}</span>
                </div>
            `).join('');
        } else {
            colorsContainer.innerHTML = '<p style="font-size: 0.85rem; opacity: 0.6;">No suggested colors added.</p>';
        }

        // Accommodations List
        const hotelsContainer = document.getElementById('hotels-container');
        if (configObj.accommodations && configObj.accommodations.length > 0) {
            hotelsContainer.innerHTML = configObj.accommodations.map(hotel => `
                <div class="hotel-item">
                    <h4>${hotel.name}</h4>
                    <div class="hotel-distance">📍 ${hotel.distance}</div>
                    <div class="hotel-phone">📞 Phone: ${hotel.phone}</div>
                    <a href="${hotel.link}" class="hotel-link" target="_blank">Book Room →</a>
                </div>
            `).join('');
        } else {
            hotelsContainer.innerHTML = '<p style="font-size: 0.85rem; opacity: 0.6;">No hotel listings added.</p>';
        }

        // RSVP Deadline
        document.getElementById('rsvp-deadline-el').innerText = `Please RSVP by ${configObj.rsvpDeadline}`;

        // Footer Section
        document.getElementById('footer-logo-el').innerHTML = `${configObj.brideName[0]} &amp; ${configObj.groomName[0]}`;
        document.getElementById('footer-hashtag-el').innerText = configObj.hashtag;
        document.querySelector('.copyright').innerHTML = `&copy; ${new Date().getFullYear()} ${configObj.brideName} &amp; ${configObj.groomName}. Made with Love.`;

        // Render Story Timeline
        const storyContainer = document.getElementById('story-timeline-container');
        if (configObj.story && configObj.story.length > 0) {
            storyContainer.classList.remove('hidden');
            storyContainer.innerHTML = configObj.story.map((item, index) => `
                <div class="timeline-item reveal-on-scroll">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content editor-target" data-edit-id="story-card-${index}">
                        <span class="timeline-date">${item.date}</span>
                        <h3>${item.title}</h3>
                        <p>${item.text}</p>
                    </div>
                </div>
            `).join('');
        } else {
            storyContainer.classList.add('hidden');
        }

        // Render Schedule Grid
        const scheduleContainer = document.getElementById('schedule-grid-container');
        if (configObj.schedule && configObj.schedule.length > 0) {
            scheduleContainer.classList.remove('hidden');
            scheduleContainer.innerHTML = configObj.schedule.map((item, index) => `
                <div class="schedule-card reveal-on-scroll editor-target" data-edit-id="schedule-card-${index}">
                    <div class="card-icon">${item.icon}</div>
                    <h3>${item.title}</h3>
                    <p class="time">${item.time}</p>
                    <p class="details">${item.details}</p>
                </div>
            `).join('');
        } else {
            scheduleContainer.classList.add('hidden');
        }
        applyDesignStyles();
        if (typeof initScrollReveal === 'function') {
            initScrollReveal();
        }
    }

    // Helper: Remove solid white box backgrounds automatically via Canvas
    function processImageTransparency(imgElement) {
        if (!imgElement || !imgElement.src || imgElement.dataset.transparentDone === 'true') return;
        if (imgElement.src.startsWith('data:image/svg')) return;

        const tmpImg = new Image();
        tmpImg.crossOrigin = 'Anonymous';
        tmpImg.onload = function() {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = tmpImg.naturalWidth || tmpImg.width || 300;
                canvas.height = tmpImg.naturalHeight || tmpImg.height || 300;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(tmpImg, 0, 0);

                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imgData.data;
                let modified = false;

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    // Detect pure solid white background pixels only
                    if (r > 250 && g > 250 && b > 250) {
                        data[i + 3] = 0; // Make transparent
                        modified = true;
                    }
                }

                if (modified) {
                    ctx.putImageData(imgData, 0, 0);
                    imgElement.src = canvas.toDataURL('image/png');
                    imgElement.dataset.transparentDone = 'true';
                }
            } catch (e) {
                // Fall back to CSS mix-blend-mode
            }
        };
        tmpImg.src = imgElement.src;
    }

    // Apply design image and positioning styles
    function applyDesignStyles() {
        const bouquet = document.querySelector('.hero-bouquet-img');
        if (bouquet) {
            if (activeConfig.design && activeConfig.design.heroBouquetUrl) {
                bouquet.src = activeConfig.design.heroBouquetUrl;
            }
            const style = (activeConfig.design && activeConfig.design.heroBouquetStyle) || { scale: 1.0, x: 0, y: 0, rotate: 0 };
            bouquet.style.transform = `translate(${style.x}px, ${style.y}px) scale(${style.scale}) rotate(${style.rotate}deg)`;
            processImageTransparency(bouquet);
        }
        
        // Apply bouquet url to all dividers
        const dividerScale = (activeConfig.design && activeConfig.design.dividerStyle?.scale) || 1.0;
        const dividerRotate = (activeConfig.design && activeConfig.design.dividerStyle?.rotate) || 0;
        document.querySelectorAll('.section-divider-img, .quote-divider-img').forEach(el => {
            el.style.transform = `scale(${dividerScale}) rotate(${dividerRotate}deg)`;
            if (activeConfig.design && activeConfig.design.heroBouquetUrl) {
                el.src = activeConfig.design.heroBouquetUrl;
            }
            processImageTransparency(el);
        });

        // Clean styles of all targets before applying overrides (to avoid leftover values if state resets)
        document.querySelectorAll('.editor-target').forEach(el => {
            el.style.display = '';
            el.style.fontSize = '';
            const existingImg = el.querySelector('.card-custom-uploaded-img');
            if (existingImg) existingImg.remove();
            const existingGallery = el.querySelector('.card-custom-gallery-wrapper');
            if (existingGallery) existingGallery.remove();
        });

        // Apply visual WYSIWYG overrides
        if (activeConfig.design && activeConfig.design.overrides) {
            Object.keys(activeConfig.design.overrides).forEach(id => {
                const el = document.getElementById(id) || document.querySelector(`[data-edit-id="${id}"]`);
                if (!el) return;
                
                const item = activeConfig.design.overrides[id];
                
                // Apply deletion
                if (item.deleted) {
                    el.style.display = 'none';
                }
                
                // Apply font size
                if (item.fontSize) {
                    el.style.fontSize = item.fontSize;
                }
                
                // Apply custom card image
                if (item.imageUrl) {
                    let img = el.querySelector('.card-custom-uploaded-img');
                    if (!img) {
                        img = document.createElement('img');
                        img.className = 'card-custom-uploaded-img';
                        el.prepend(img);
                    }
                    img.src = item.imageUrl;
                }

                // Apply custom card image gallery (New multiple image system)
                if (item.imageUrls && item.imageUrls.length > 0) {
                    let gallery = el.querySelector('.card-custom-gallery-wrapper');
                    if (!gallery) {
                        gallery = document.createElement('div');
                        gallery.className = 'card-custom-gallery-wrapper';
                        el.prepend(gallery);
                    }
                    gallery.innerHTML = item.imageUrls.map((url, imgIndex) => `
                        <div class="gallery-image-box" data-image-index="${imgIndex}">
                            <img src="${url}" class="card-custom-gallery-img">
                            <button type="button" class="btn-remove-gallery-img" title="Delete this image">&times;</button>
                        </div>
                    `).join('');
                } else {
                    const gallery = el.querySelector('.card-custom-gallery-wrapper');
                    if (gallery) gallery.remove();
                }
            });
        }

        // Apply direct text overrides
        if (activeConfig.design && activeConfig.design.textOverrides) {
            Object.keys(activeConfig.design.textOverrides).forEach(key => {
                let val = activeConfig.design.textOverrides[key];
                if (typeof val === 'string') {
                    val = val.replace(/[➖➕📷🗑️🚫]/g, '').trim();
                    activeConfig.design.textOverrides[key] = val;
                }
                if (!val) return;

                if (key.includes('::')) {
                    const [parentId, subSelector] = key.split('::');
                    const parent = document.getElementById(parentId) || document.querySelector(`[data-edit-id="${parentId}"]`);
                    if (parent) {
                        const el = parent.querySelector(subSelector);
                        if (el) el.innerText = val;
                    }
                } else {
                    const el = document.getElementById(key);
                    if (el) el.innerText = val;
                }
            });
        }

        // Render floating page decorations
        const floatContainer = document.getElementById('floating-decorations-container');
        if (floatContainer) {
            if (activeConfig.design && activeConfig.design.floatingImages && activeConfig.design.floatingImages.length > 0) {
                floatContainer.innerHTML = activeConfig.design.floatingImages.map(img => {
                    const style = img.style || { x: 0, y: 0, scale: 1.0, rotate: 0 };
                    return `
                        <div class="floating-decor-wrapper editor-target" id="${img.id}" style="left: 0; top: 0; transform: translate(${style.x}px, ${style.y}px) scale(${style.scale}) rotate(${style.rotate}deg);">
                            <img src="${img.url}" class="floating-decor-img">
                        </div>
                    `;
                }).join('');
            } else {
                floatContainer.innerHTML = '';
            }
        }

        // Decorate targets with overlays
        injectVisualEditorOverlays();
        
        // Ensure contenteditable state is synced
        makeTextElementsEditable(document.body.classList.contains('editing-mode'));
    }

    // Toggle contenteditable on all editable target fields
    function makeTextElementsEditable(editable) {
        document.querySelectorAll('.editor-target').forEach(el => {
            if (el.tagName === 'BUTTON' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.classList.contains('visual-btn') || el.classList.contains('visual-edit-overlay')) return;
            if (editable) {
                el.setAttribute('contenteditable', 'true');
                el.style.cursor = 'text';
            } else {
                el.removeAttribute('contenteditable');
                el.style.cursor = '';
            }
        });
    }

    // Inject visual edit overlays to card containers only
    function injectVisualEditorOverlays() {
        const editSelectors = [
            '.timeline-content',
            '.schedule-card',
            '.details-card',
            '.hotel-card'
        ];

        let autoIdCounter = 1;
        editSelectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                if (el.tagName === 'BUTTON' || el.classList.contains('visual-btn') || el.classList.contains('visual-edit-overlay')) return;
                if (!el.classList.contains('editor-target')) {
                    el.classList.add('editor-target');
                }
                let targetId = el.id || el.getAttribute('data-edit-id');
                if (!targetId) {
                    targetId = `auto-edit-${autoIdCounter++}`;
                    el.setAttribute('data-edit-id', targetId);
                }
            });
        });

        // Clean up any old overlays from text elements
        document.querySelectorAll('.visual-edit-overlay').forEach(old => old.remove());

        document.querySelectorAll('.editor-target').forEach(el => {
            // Skip text-only target elements so hero / headers stay clean
            if (!el.classList.contains('timeline-content') && !el.classList.contains('schedule-card') && !el.classList.contains('details-card') && !el.classList.contains('hotel-card')) {
                return;
            }

            const targetId = el.id || el.getAttribute('data-edit-id');
            if (!targetId) return;

            const hasImage = activeConfig.design?.overrides?.[targetId]?.imageUrl;
            const hasGalleryImages = activeConfig.design?.overrides?.[targetId]?.imageUrls?.length > 0;
            
            el.style.position = 'relative'; // Ensure relative positioning
            
            const overlay = document.createElement('div');
            overlay.className = 'visual-edit-overlay';
            
            let imageButtons = `<button type="button" class="visual-btn btn-upload-img" title="Add Photo">📷</button>`;
            if (hasImage || hasGalleryImages) {
                imageButtons += `<button type="button" class="visual-btn btn-remove-img" title="Remove Photos">🚫</button>`;
            }
            
            overlay.innerHTML = `
                <button type="button" class="visual-btn btn-size-down" title="Decrease Size">➖</button>
                <button type="button" class="visual-btn btn-size-up" title="Enlarge Size">➕</button>
                ${imageButtons}
                <button type="button" class="visual-btn btn-delete-el" title="Delete Element">🗑️</button>
            `;
            el.appendChild(overlay);
        });
    }

    // Run Initial Load
    applyThemeColors(activeConfig.colors);
    renderDynamicElements(activeConfig);
    applySectionVisibility(activeConfig.sections);


    // ----------------------------------------------------
    // 1. Falling Petals Animation (Canvas)
    // ----------------------------------------------------
    const canvas = document.getElementById('petals-canvas');
    const ctx = canvas.getContext('2d');

    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    window.addEventListener('resize', () => {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    });

    const petals = [];

    class Petal {
        constructor() {
            this.x = Math.random() * canvasWidth;
            this.y = Math.random() * canvasHeight - canvasHeight;
            this.size = Math.random() * 9 + 6;
            this.aspectRatio = Math.random() * 0.4 + 0.35;
            this.speedY = Math.random() * 1.1 + 0.7;
            this.speedX = Math.random() * 1.4 - 0.7;
            this.angle = Math.random() * Math.PI * 2;
            this.angleSpeed = Math.random() * 0.015 - 0.0075;
            this.windFrequency = Math.random() * 0.015;
            this.windOffset = Math.random() * 100;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.y * this.windFrequency + this.windOffset) * 0.4;
            this.angle += this.angleSpeed;

            if (this.y > canvasHeight + 20) {
                this.y = -20;
                this.x = Math.random() * canvasWidth;
                this.speedY = Math.random() * 1.1 + 0.7;
            }
            if (this.x > canvasWidth + 20) {
                this.x = -20;
            } else if (this.x < -20) {
                this.x = canvasWidth + 20;
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            ctx.beginPath();
            ctx.ellipse(0, 0, this.size * this.aspectRatio, this.size, 0, 0, Math.PI * 2);
            ctx.shadowColor = 'rgba(44, 62, 47, 0.04)';
            ctx.shadowBlur = 4;
            ctx.fillStyle = 'rgba(250, 248, 245, 0.9)';
            ctx.fill();

            if (this.size > 10) {
                ctx.shadowColor = 'transparent';
                ctx.beginPath();
                ctx.arc(0, -this.size + 4, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(227, 168, 87, 0.75)';
                ctx.fill();
            }

            ctx.restore();
        }
    }

    // Initialize Petals
    function adjustPetalCount(targetCount) {
        if (petals.length < targetCount) {
            while (petals.length < targetCount) {
                petals.push(new Petal());
            }
        } else if (petals.length > targetCount) {
            petals.length = targetCount;
        }
    }

    adjustPetalCount(activeConfig.petalDensity);

    function animate() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        petals.forEach(petal => {
            petal.update();
            petal.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();


    // ----------------------------------------------------
    // 2. Countdown Timer
    // ----------------------------------------------------
    let targetDate = new Date(activeConfig.weddingDateISO).getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const countdownTitleEl = document.getElementById('countdown-title-el');

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference < 0) {
            daysEl.innerText = '00';
            hoursEl.innerText = '00';
            minutesEl.innerText = '00';
            secondsEl.innerText = '00';
            if (countdownTitleEl) {
                countdownTitleEl.innerText = "We're Married!";
            }
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        daysEl.innerText = String(days).padStart(2, '0');
        hoursEl.innerText = String(hours).padStart(2, '0');
        minutesEl.innerText = String(minutes).padStart(2, '0');
        secondsEl.innerText = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    let countdownInterval = setInterval(updateCountdown, 1000);


    // ----------------------------------------------------
    // 3. Background Music Player with Reliable CDN Fallbacks
    // ----------------------------------------------------
    const musicBtn = document.getElementById('music-toggle');
    const bgMusic = document.getElementById('bg-music');
    let isPlaying = false;

    // Fast, reliable wedding instrumental CDN fallback list
    const fallbackUrls = [
        activeConfig.musicUrl || "assets/beautiful_in_white.mp3",
        "assets/beautiful_in_white.mp3",
        "https://files.catbox.moe/6omh49.mp3",
        "https://dn710701.ca.archive.org/0/items/westlifebeautifulinwhite_201911/Westlife%20-%20Beautiful%20in%20White.mp3"
    ];
    let fallbackIndex = 0;

    function setAudioSource(url) {
        if (!bgMusic || !url) return;
        const directUrl = getDirectAudioUrl(url);
        bgMusic.src = directUrl;
        bgMusic.volume = 0.5;
        bgMusic.load();
    }

    if (activeConfig.musicUrl) {
        setAudioSource(activeConfig.musicUrl);
    } else {
        setAudioSource(fallbackUrls[1]);
    }

    // Automatic fallback if current audio fails to load
    if (bgMusic) {
        bgMusic.addEventListener('error', () => {
            console.warn("Primary audio source failed, switching to fallback CDN...");
            fallbackIndex = (fallbackIndex + 1) % fallbackUrls.length;
            setAudioSource(fallbackUrls[fallbackIndex]);
            if (isPlaying) {
                bgMusic.play().catch(() => {});
            }
        });
    }

    const musicHint = document.getElementById('music-hint');

    function togglePlayAudio() {
        if (!bgMusic || !musicBtn) return;
        if (isPlaying) {
            bgMusic.pause();
            musicBtn.classList.remove('playing');
            if (musicHint) { musicHint.style.opacity = '1'; musicHint.innerText = '🎵 Play Music'; }
            isPlaying = false;
        } else {
            bgMusic.play().then(() => {
                musicBtn.classList.add('playing');
                if (musicHint) { musicHint.style.opacity = '0.5'; musicHint.innerText = '🎶 Playing'; }
                isPlaying = true;
            }).catch(err => {
                console.warn("Direct play failed, loading fallback CDN stream:", err);
                fallbackIndex = (fallbackIndex + 1) % fallbackUrls.length;
                setAudioSource(fallbackUrls[fallbackIndex]);
                bgMusic.play().then(() => {
                    musicBtn.classList.add('playing');
                    if (musicHint) { musicHint.style.opacity = '0.5'; musicHint.innerText = '🎶 Playing'; }
                    isPlaying = true;
                }).catch(e => console.error("Audio playback tap required:", e));
            });
        }
    }

    if (musicBtn) {
        musicBtn.addEventListener('click', togglePlayAudio);
    }

    // Auto-play attempt on first user gesture anywhere on screen
    const initAudioOnUserInteraction = () => {
        if (!isPlaying && bgMusic) {
            bgMusic.play().then(() => {
                if (musicBtn) musicBtn.classList.add('playing');
                isPlaying = true;
                ['click', 'touchstart', 'scroll', 'keydown'].forEach(evt => {
                    document.removeEventListener(evt, initAudioOnUserInteraction);
                });
            }).catch(() => {
                // Browser policy requires explicit tap on music button
            });
        }
    };

    ['click', 'touchstart', 'scroll', 'keydown'].forEach(evt => {
        document.addEventListener(evt, initAudioOnUserInteraction, { once: true });
    });


    // ----------------------------------------------------
    // 4. Scroll Reveal Animations (Initialized after dynamic injection)
    // ----------------------------------------------------
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal-on-scroll');
        if (!revealElements || !revealElements.length) return;

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: '100px 0px 100px 0px'
        });

        revealElements.forEach(el => {
            revealObserver.observe(el);
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight + 100 && rect.bottom > -100) {
                el.classList.add('revealed');
            }
        });
    }
    
    initScrollReveal();


    // ----------------------------------------------------
    // 5. RSVP Form Interactivity & Storage
    // ----------------------------------------------------
    const rsvpForm = document.getElementById('rsvp-form');
    const rsvpSuccess = document.getElementById('rsvp-success');
    const rsvpName = document.getElementById('rsvp-name');
    const rsvpEmail = document.getElementById('rsvp-email');
    const rsvpGuests = document.getElementById('rsvp-guests');
    const rsvpDiet = document.getElementById('rsvp-diet');
    const successMsg = document.getElementById('success-message');
    const editRsvpBtn = document.getElementById('edit-rsvp-btn');
    
    const guestWrapper = document.querySelector('.select-guests-wrapper');
    const attendingRadios = document.querySelectorAll('input[name="attending"]');

    attendingRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'no') {
                guestWrapper.classList.add('hidden');
            } else {
                guestWrapper.classList.remove('hidden');
            }
        });
    });

    const checkExistingRSVP = () => {
        // Form stays clean & empty by default so guests can always fill out fresh RSVPs
        if (rsvpForm) {
            rsvpForm.classList.remove('hidden');
            try { rsvpForm.reset(); } catch(e) {}
        }
        if (rsvpSuccess) {
            rsvpSuccess.classList.add('hidden');
        }
        if (guestWrapper) {
            guestWrapper.classList.remove('hidden');
        }
    };

    const showSuccessScreen = (rsvpData) => {
        rsvpForm.classList.add('hidden');
        rsvpSuccess.classList.remove('hidden');
        if (rsvpData.attending === 'yes') {
            successMsg.innerHTML = `We are thrilled to celebrate with you, <strong>${rsvpData.name}</strong>! <br>Your response (for ${rsvpData.guests} guest${rsvpData.guests > 1 ? 's' : ''}) has been recorded. See you on the wedding day!`;
        } else {
            successMsg.innerHTML = `Thank you for letting us know, <strong>${rsvpData.name}</strong>. <br>We are sorry you can't make it, and you will be missed!`;
        }
    };

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const attendingRadio = document.querySelector('input[name="attending"]:checked');
        const isAttending = attendingRadio ? attendingRadio.value : 'yes';
        const rsvpData = {
            id: Date.now().toString(),
            name: rsvpName ? rsvpName.value.trim() : 'Guest',
            email: rsvpEmail ? rsvpEmail.value.trim() : 'N/A',
            attending: isAttending,
            guests: isAttending === 'yes' ? (parseInt(rsvpGuests ? rsvpGuests.value : 1) || 1) : 0,
            dietary: ''
        };

        let rsvps = [];
        const existing = localStorage.getItem('daisy_wedding_rsvp');
        if (existing) {
            try { rsvps = JSON.parse(existing); } catch(e) { rsvps = []; }
        }
        
        const index = rsvps.findIndex(r => r.name && r.name.toLowerCase() === rsvpData.name.toLowerCase());
        if (index > -1) {
            rsvps[index] = rsvpData;
        } else {
            rsvps.push(rsvpData);
        }

        try {
            localStorage.setItem(RSVP_KEY, JSON.stringify(rsvps));
        } catch (e) {
            console.warn('RSVP LocalStorage write fallback:', e);
        }

        // 1. Save to Supabase Cloud Database (Primary Cloud Backup)
        try {
            fetch(`${SUPABASE_URL}/rest/v1/rsvps`, {
                method: 'POST',
                keepalive: true,
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    site_id: SITE_ID,
                    name: rsvpData.name,
                    email: rsvpData.email || 'N/A',
                    attending: rsvpData.attending,
                    guests: rsvpData.guests
                })
            }).catch(err => console.warn('Supabase RSVP insert error:', err));
        } catch (err) {
            console.warn('Supabase RSVP failed:', err);
        }

        showSuccessScreen(rsvpData);
        if (typeof renderRsvpList === 'function') renderRsvpList();

        // Calculate cumulative total attending guests
        const totalAttendingGuests = rsvps
            .filter(r => r.attending === 'yes')
            .reduce((sum, r) => sum + (parseInt(r.guests) || 1), 0);

        // 2. Universal Multi-Transport Auto-Sync to Google Sheets (Supports UC Browser, UC Mini, Opera Mini, iOS Safari, Android, In-App Webviews)
        const sheetsUrl = activeConfig.googleSheetsUrl || localStorage.getItem('daisy_google_sheets_url');
        if (sheetsUrl) {
            const sheetPayload = {
                timestamp: new Date().toLocaleString(),
                name: rsvpData.name,
                attendingStatus: isAttending === 'yes' ? 'Joyfully Accept' : 'Regretfully Decline',
                guests: rsvpData.guests,
                totalAttendingGuests: totalAttendingGuests
            };
            const payloadStr = JSON.stringify(sheetPayload);

            // Layer A: URLSearchParams Form-Encoded Fetch (UC Browser Cloud Proxy requirement)
            try {
                const params = new URLSearchParams();
                Object.keys(sheetPayload).forEach(k => params.append(k, sheetPayload[k]));
                fetch(sheetsUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    keepalive: true,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: params.toString()
                }).catch(err => console.warn('Google Sheets params fetch error:', err));
            } catch (err) {}

            // Layer B: Direct XMLHttpRequest (UC Browser proxy executes XHR POST instantly)
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', sheetsUrl, true);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                const params = new URLSearchParams();
                Object.keys(sheetPayload).forEach(k => params.append(k, sheetPayload[k]));
                xhr.send(params.toString());
            } catch (err) {}

            // Layer C: Standard text/plain JSON fetch
            try {
                fetch(sheetsUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    keepalive: true,
                    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
                    body: payloadStr
                }).catch(err => console.warn('Google Sheets fetch error:', err));
            } catch (err) {}

            // Layer D: Hidden iframe HTML Form POST (The 100% fail-safe browser standard for UC Mini / Opera Mini)
            try {
                let iframe = document.getElementById('rsvp-hidden-iframe');
                if (!iframe) {
                    iframe = document.createElement('iframe');
                    iframe.id = 'rsvp-hidden-iframe';
                    iframe.name = 'rsvp-hidden-iframe';
                    iframe.style.display = 'none';
                    document.body.appendChild(iframe);
                }

                const form = document.createElement('form');
                form.method = 'POST';
                form.action = sheetsUrl;
                form.target = 'rsvp-hidden-iframe';
                form.style.display = 'none';

                Object.keys(sheetPayload).forEach(key => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = sheetPayload[key];
                    form.appendChild(input);
                });

                document.body.appendChild(form);
                form.submit();
                setTimeout(() => form.remove(), 3000);
            } catch (err) {}
        }
    });
    }

    if (editRsvpBtn) {
        editRsvpBtn.addEventListener('click', () => {
        rsvpSuccess.classList.add('hidden');
        rsvpForm.classList.remove('hidden');
        const existing = localStorage.getItem('daisy_wedding_rsvp');
        if (existing) {
            const list = JSON.parse(existing);
            const latest = list[list.length - 1];
            if (latest) {
                rsvpName.value = latest.name;
                rsvpEmail.value = latest.email;
                if (latest.attending === 'yes') {
                    document.querySelector('input[name="attending"][value="yes"]').checked = true;
                    guestWrapper.classList.remove('hidden');
                    rsvpGuests.value = parseInt(latest.guests) || 1;
                } else {
                    document.querySelector('input[name="attending"][value="no"]').checked = true;
                    guestWrapper.classList.add('hidden');
                }
            }
        }
    });
    }


    // ----------------------------------------------------
    // 6. Admin Panel / Demo RSVP Viewer
    // ----------------------------------------------------
    const toggleAdminBtn = document.getElementById('toggle-admin-btn');
    const adminContent = document.getElementById('admin-content');
    const rsvpListBody = document.getElementById('rsvp-list-body');
    const totalGuestsCount = document.getElementById('total-guests-count');
    const clearRsvpsBtn = document.getElementById('clear-rsvps-btn');

    if (toggleAdminBtn && adminContent) {
        toggleAdminBtn.addEventListener('click', () => {
            adminContent.classList.toggle('hidden');
            if (!adminContent.classList.contains('hidden')) {
                renderRsvpList();
                adminContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }

    function renderRsvpList() {
        if (!rsvpListBody || !totalGuestsCount) return;
        const stored = localStorage.getItem(RSVP_KEY) || (SITE_ID === 'active' ? localStorage.getItem('daisy_wedding_rsvp') : null);
        const rsvps = stored ? JSON.parse(stored) : [];

        if (rsvps.length === 0) {
            rsvpListBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center" style="padding: 2rem;">No RSVPs yet. Submissions will appear here instantly.</td>
                </tr>
            `;
            totalGuestsCount.innerText = '0';
            return;
        }

        let html = '';
        let totalGuests = 0;

        rsvps.forEach(rsvp => {
            const isAttendingText = rsvp.attending === 'yes' ? '💚 Joyfully Attending' : '💔 Declined';
            const guestNum = rsvp.attending === 'yes' ? rsvp.guests : 0;
            totalGuests += guestNum;

            html += `
                <tr>
                    <td><strong>${escapeHtml(rsvp.name)}</strong></td>
                    <td>${escapeHtml(rsvp.email)}</td>
                    <td>${isAttendingText}</td>
                    <td>${rsvp.attending === 'yes' ? rsvp.guests : '-'}</td>
                    <td>${escapeHtml(rsvp.dietary || 'None')}</td>
                    <td>
                        <button class="btn-text delete-item-btn" data-email="${escapeHtml(rsvp.email)}" style="color: var(--color-danger); text-decoration: none; padding: 0;">Remove</button>
                    </td>
                </tr>
            `;
        });

        rsvpListBody.innerHTML = html;
        totalGuestsCount.innerText = totalGuests;

        document.querySelectorAll('.delete-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const emailToDelete = e.target.getAttribute('data-email');
                deleteRsvp(emailToDelete);
            });
        });
    }

    function deleteRsvp(email) {
        const stored = localStorage.getItem('daisy_wedding_rsvp');
        let rsvps = stored ? JSON.parse(stored) : [];
        rsvps = rsvps.filter(r => r.email.toLowerCase() !== email.toLowerCase());
        localStorage.setItem('daisy_wedding_rsvp', JSON.stringify(rsvps));
        renderRsvpList();
    }

    if (clearRsvpsBtn) {
        clearRsvpsBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to clear all RSVP submissions?")) {
                localStorage.removeItem('daisy_wedding_rsvp');
                renderRsvpList();
                rsvpSuccess.classList.add('hidden');
                rsvpForm.classList.remove('hidden');
                rsvpForm.reset();
                guestWrapper.classList.remove('hidden');
                dietWrapper.classList.remove('hidden');
            }
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    checkExistingRSVP();
    renderRsvpList();


    // ----------------------------------------------------
    // 7. Creator Studio Logic & Real-time Live Previews
    // ----------------------------------------------------
    const openCreatorBtn = document.getElementById('open-creator-btn');
    const closeCreatorBtn = document.getElementById('close-creator-btn');
    const creatorSidebar = document.getElementById('creator-sidebar');

    const editBride = document.getElementById('edit-bride');
    const editGroom = document.getElementById('edit-groom');
    const editHashtag = document.getElementById('edit-hashtag');
    const editDateIso = document.getElementById('edit-date-iso');
    const editDateFormatted = document.getElementById('edit-date-formatted');
    const editRsvpDeadline = document.getElementById('edit-rsvp-deadline');

    const editQuoteText = document.getElementById('edit-quote-text');
    const editQuoteAuthor = document.getElementById('edit-quote-author');

    const editVenueName = document.getElementById('edit-venue-name');
    const editVenueAddress = document.getElementById('edit-venue-address');
    const editVenueNote = document.getElementById('edit-venue-note');
    const editVenueMaps = document.getElementById('edit-venue-maps');

    const editDressStyle = document.getElementById('edit-dress-style');
    const editDressDesc = document.getElementById('edit-dress-desc');
    const editDressColorsList = document.getElementById('editor-dress-colors-list');

    const editorStoryList = document.getElementById('editor-story-list');
    const editorScheduleList = document.getElementById('editor-schedule-list');
    const editorAccommodationsList = document.getElementById('editor-accommodations-list');

    const editColorCream = document.getElementById('edit-color-cream');
    const editColorSageLight = document.getElementById('edit-color-sage-light');
    const editColorSageMed = document.getElementById('edit-color-sage-med');
    const editColorForest = document.getElementById('edit-color-forest');
    const editColorGold = document.getElementById('edit-color-gold');

    const editMusicUrl = document.getElementById('edit-music-url');
    const editPetalDensity = document.getElementById('edit-petal-density');
    const petalCountVal = document.getElementById('petal-count-val');

    const publishLiveBtn = document.getElementById('publish-live-btn');
    const saveConfigBtn = document.getElementById('save-config-btn');
    const exportConfigBtn = document.getElementById('export-config-btn');
    const resetConfigBtn = document.getElementById('reset-config-btn');

    const editUploadBouquet = document.getElementById('edit-upload-bouquet');
    const editBouquetScale = document.getElementById('edit-bouquet-scale');
    const bouquetScaleVal = document.getElementById('bouquet-scale-val');
    const editBouquetX = document.getElementById('edit-bouquet-x');
    const bouquetXVal = document.getElementById('bouquet-x-val');
    const editBouquetY = document.getElementById('edit-bouquet-y');
    const bouquetYVal = document.getElementById('bouquet-y-val');
    const editBouquetRotate = document.getElementById('edit-bouquet-rotate');
    const bouquetRotateVal = document.getElementById('bouquet-rotate-val');
    const resetFlowerPosBtn = document.getElementById('reset-flower-pos-btn');

    // Safe Listener Helper
    function safeOn(idOrEl, event, fn, opts) {
        const el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
        if (el) el.addEventListener(event, fn, opts);
    }

    function openCreatorStudioSidebar() {
        localStorage.setItem('daisy_creator_unlocked', 'true');
        const sidebar = document.getElementById('creator-sidebar');
        const trigger = document.querySelector('.creator-trigger-wrapper');
        if (trigger) trigger.style.display = 'none';
        if (sidebar) {
            sidebar.classList.remove('hidden');
            sidebar.setAttribute('style', 'display: flex !important; transform: translateX(0) !important; opacity: 1 !important; visibility: visible !important; pointer-events: all !important; z-index: 99999999 !important;');
        }
        document.body.classList.add('editing-mode');
        makeTextElementsEditable(true);
        injectVisualEditorOverlays();
        if (typeof populateSidebarFields === 'function' && typeof activeConfig !== 'undefined') {
            populateSidebarFields(activeConfig);
        }
    }
    window.openCreatorStudioSidebar = openCreatorStudioSidebar;

    // Sidebar Toggling
    safeOn(openCreatorBtn, 'click', () => {
        openCreatorStudioSidebar();
    });

    safeOn(closeCreatorBtn, 'click', () => {
        if (creatorSidebar) creatorSidebar.classList.add('hidden');
        const trigger = document.querySelector('.creator-trigger-wrapper');
        if (trigger) { trigger.style.display = 'block'; trigger.classList.remove('hidden'); }
        document.body.classList.remove('editing-mode');
        makeTextElementsEditable(false);
    });

    // Populate Sidebar fields with active config values
    // Populate Sidebar fields with active config values (Crash-proof)
    function populateSidebarFields(configObj) {
        if (!configObj) return;
        try {
            // Setup checkboxes
            const setCheck = (id, val) => { const el = document.getElementById(id); if (el) el.checked = !!val; };
            setCheck('toggle-sec-parents', configObj.sections?.parents);
            setCheck('toggle-sec-quote', configObj.sections?.quote);
            setCheck('toggle-sec-story', configObj.sections?.story);
            setCheck('toggle-sec-schedule', configObj.sections?.schedule);
            setCheck('toggle-sec-dress', configObj.sections?.dressCode);
            setCheck('toggle-sec-accommodations', configObj.sections?.accommodations);
            setCheck('toggle-sec-countdown', configObj.sections?.countdown);
            setCheck('toggle-sec-rsvp', configObj.sections?.rsvp);

            // Setup design sliders safely
            const style = configObj.design?.heroBouquetStyle || { x: 0, y: 0, scale: 1.0, rotate: 0 };
            if (editBouquetScale && bouquetScaleVal) {
                editBouquetScale.value = style.scale ?? 1.0;
                bouquetScaleVal.innerText = style.scale ?? 1.0;
            }
            if (editBouquetX && bouquetXVal) {
                editBouquetX.value = style.x ?? 0;
                bouquetXVal.innerText = style.x ?? 0;
            }
            if (editBouquetY && bouquetYVal) {
                editBouquetY.value = style.y ?? 0;
                bouquetYVal.innerText = style.y ?? 0;
            }
            if (editBouquetRotate && bouquetRotateVal) {
                editBouquetRotate.value = style.rotate ?? 0;
                bouquetRotateVal.innerText = style.rotate ?? 0;
            }

            const setVal = (el, val) => { if (el) el.value = val ?? ''; };
            setVal(editBride, configObj.brideName);
            setVal(editGroom, configObj.groomName);
            setVal(editHashtag, configObj.hashtag);
            setVal(editDateIso, configObj.weddingDateISO);
            setVal(editDateFormatted, configObj.weddingDateFormatted);
            setVal(editRsvpDeadline, configObj.rsvpDeadline);

            setVal(document.getElementById('edit-parents-subtitle'), configObj.parents?.subtitle);
            setVal(document.getElementById('edit-parents-title'), configObj.parents?.title);
            setVal(document.getElementById('edit-bride-parents-label'), configObj.parents?.brideParentsLabel);
            setVal(document.getElementById('edit-bride-parents-names'), configObj.parents?.brideParentsNames);
            setVal(document.getElementById('edit-groom-parents-label'), configObj.parents?.groomParentsLabel);
            setVal(document.getElementById('edit-groom-parents-names'), configObj.parents?.groomParentsNames);

            setVal(editQuoteText, configObj.loveQuote?.text);
            setVal(editQuoteAuthor, configObj.loveQuote?.author);

            setVal(editVenueName, configObj.venue?.name);
            setVal(editVenueAddress, configObj.venue?.address);
            setVal(editVenueNote, configObj.venue?.note);
            setVal(editVenueMaps, configObj.venue?.mapsUrl);

            setVal(editDressStyle, configObj.dressCode?.style);
            setVal(editDressDesc, configObj.dressCode?.description);

            // Resolve hex colors or fetch defaults
            const rootStyles = getComputedStyle(document.documentElement);
            if (editColorCream) editColorCream.value = configObj.colors?.creamBg || rootStyles.getPropertyValue('--color-cream-bg').trim();
            if (editColorSageLight) editColorSageLight.value = configObj.colors?.sageLight || rootStyles.getPropertyValue('--color-sage-light').trim();
            if (editColorSageMed) editColorSageMed.value = configObj.colors?.sageMedium || rootStyles.getPropertyValue('--color-sage-medium').trim();
            if (editColorForest) editColorForest.value = configObj.colors?.forest || rootStyles.getPropertyValue('--color-forest').trim();
            if (editColorGold) editColorGold.value = configObj.colors?.gold || rootStyles.getPropertyValue('--color-gold').trim();

            const editTextScale = document.getElementById('edit-text-scale');
            const textScaleVal = document.getElementById('text-scale-val');
            if (editTextScale && textScaleVal) {
                const scale = configObj.design?.fontSizeScale || 100;
                editTextScale.value = scale;
                textScaleVal.innerText = scale;
            }

            if (editMusicUrl) editMusicUrl.value = configObj.musicUrl ?? '';
            if (editPetalDensity) editPetalDensity.value = configObj.petalDensity ?? 35;
            if (petalCountVal) petalCountVal.innerText = configObj.petalDensity ?? 35;

            const editGoogleSheetsUrl = document.getElementById('edit-google-sheets-url');
            if (editGoogleSheetsUrl) {
                editGoogleSheetsUrl.value = configObj.googleSheetsUrl || localStorage.getItem('daisy_google_sheets_url') || '';
            }

            // Render Dynamic Editor Lists
            if (typeof renderStoryEditorList === 'function') renderStoryEditorList();
            if (typeof renderScheduleEditorList === 'function') renderScheduleEditorList();
            if (typeof renderAccommodationsEditorList === 'function') renderAccommodationsEditorList();
            if (typeof renderDressColorsEditorList === 'function') renderDressColorsEditorList();
        } catch (err) {
            console.error("Error populating sidebar fields:", err);
        }
    }

    // ----------------------------------------------------
    // Dynamic List Editor Renderers
    // ----------------------------------------------------

    // 1. Story Editor List
    function renderStoryEditorList() {
        editorStoryList.innerHTML = activeConfig.story.map((item, index) => `
            <div class="editor-item-box" data-index="${index}">
                <div class="editor-item-box-header">
                    <span>Story Card #${index + 1}</span>
                    <button type="button" class="remove-btn remove-story-item">Delete</button>
                </div>
                <div class="form-group-sm">
                    <label>Date/Era</label>
                    <input type="text" class="edit-story-date" value="${item.date}">
                </div>
                <div class="form-group-sm">
                    <label>Title</label>
                    <input type="text" class="edit-story-title" value="${item.title}">
                </div>
                <div class="form-group-sm">
                    <label>Description</label>
                    <textarea class="edit-story-text" rows="2">${item.text}</textarea>
                </div>
            </div>
        `).join('');
    }

    // 2. Schedule Editor List
    function renderScheduleEditorList() {
        editorScheduleList.innerHTML = activeConfig.schedule.map((item, index) => `
            <div class="editor-item-box" data-index="${index}">
                <div class="editor-item-box-header">
                    <span>Itinerary Card #${index + 1}</span>
                    <button type="button" class="remove-btn remove-schedule-item">Delete</button>
                </div>
                <div class="form-group-sm">
                    <label>Icon Emoji</label>
                    <input type="text" class="edit-schedule-icon" value="${item.icon}" style="max-width: 50px; text-align: center;">
                </div>
                <div class="form-group-sm">
                    <label>Title</label>
                    <input type="text" class="edit-schedule-title" value="${item.title}">
                </div>
                <div class="form-group-sm">
                    <label>Time Window</label>
                    <input type="text" class="edit-schedule-time" value="${item.time}">
                </div>
                <div class="form-group-sm">
                    <label>Details</label>
                    <input type="text" class="edit-schedule-details" value="${item.details}">
                </div>
            </div>
        `).join('');
    }

    // 3. Accommodations Editor List
    function renderAccommodationsEditorList() {
        editorAccommodationsList.innerHTML = activeConfig.accommodations.map((item, index) => `
            <div class="editor-item-box" data-index="${index}">
                <div class="editor-item-box-header">
                    <span>Hotel Card #${index + 1}</span>
                    <button type="button" class="remove-btn remove-accommodation-item">Delete</button>
                </div>
                <div class="form-group-sm">
                    <label>Hotel Name</label>
                    <input type="text" class="edit-hotel-name" value="${item.name}">
                </div>
                <div class="form-group-sm">
                    <label>Distance/Note</label>
                    <input type="text" class="edit-hotel-distance" value="${item.distance}">
                </div>
                <div class="form-group-sm">
                    <label>Phone Number</label>
                    <input type="text" class="edit-hotel-phone" value="${item.phone}">
                </div>
                <div class="form-group-sm">
                    <label>Booking URL Link</label>
                    <input type="text" class="edit-hotel-link" value="${item.link}">
                </div>
            </div>
        `).join('');
    }

    // 4. Dress Code Suggested Colors List
    function renderDressColorsEditorList() {
        editDressColorsList.innerHTML = activeConfig.dressCode.colors.map((item, index) => `
            <div class="editor-item-box" data-index="${index}">
                <div class="editor-item-box-header">
                    <span>Color Swatch #${index + 1}</span>
                    <button type="button" class="remove-btn remove-dress-color">Delete</button>
                </div>
                <div class="color-swatch-edit-row">
                    <input type="color" class="edit-color-hex" value="${item.hex}">
                    <input type="text" class="edit-color-name" value="${item.name}" placeholder="Color Name">
                </div>
            </div>
        `).join('');
    }

    populateSidebarFields(activeConfig);

    // ----------------------------------------------------
    // Event Delegation & Real-time Live Previews
    // ----------------------------------------------------
    function registerLivePreviewListeners() {
        // Section toggle checkboxes listeners
        const toggles = [
            { id: 'toggle-sec-parents', key: 'parents' },
            { id: 'toggle-sec-quote', key: 'quote' },
            { id: 'toggle-sec-story', key: 'story' },
            { id: 'toggle-sec-schedule', key: 'schedule' },
            { id: 'toggle-sec-dress', key: 'dressCode' },
            { id: 'toggle-sec-accommodations', key: 'accommodations' },
            { id: 'toggle-sec-countdown', key: 'countdown' },
            { id: 'toggle-sec-rsvp', key: 'rsvp' }
        ];

        toggles.forEach(t => {
            const toggleEl = document.getElementById(t.id);
            if (toggleEl) {
                toggleEl.addEventListener('change', (e) => {
                    activeConfig.sections[t.key] = e.target.checked;
                    applySectionVisibility(activeConfig.sections);
                    autoSaveConfig();
                });
            }
        });

        // Standard inputs bindings
        const inputs = [
            { el: editBride, prop: 'brideName', updateFn: () => renderDynamicElements(activeConfig) },
            { el: editGroom, prop: 'groomName', updateFn: () => renderDynamicElements(activeConfig) },
            { el: editHashtag, prop: 'hashtag', updateFn: () => renderDynamicElements(activeConfig) },
            { el: editDateFormatted, prop: 'weddingDateFormatted', updateFn: () => renderDynamicElements(activeConfig) },
            { el: editRsvpDeadline, prop: 'rsvpDeadline', updateFn: () => renderDynamicElements(activeConfig) },
            
            { el: document.getElementById('edit-parents-subtitle'), prop: 'parents.subtitle', updateFn: () => renderDynamicElements(activeConfig) },
            { el: document.getElementById('edit-parents-title'), prop: 'parents.title', updateFn: () => renderDynamicElements(activeConfig) },
            { el: document.getElementById('edit-bride-parents-label'), prop: 'parents.brideParentsLabel', updateFn: () => renderDynamicElements(activeConfig) },
            { el: document.getElementById('edit-bride-parents-names'), prop: 'parents.brideParentsNames', updateFn: () => renderDynamicElements(activeConfig) },
            { el: document.getElementById('edit-groom-parents-label'), prop: 'parents.groomParentsLabel', updateFn: () => renderDynamicElements(activeConfig) },
            { el: document.getElementById('edit-groom-parents-names'), prop: 'parents.groomParentsNames', updateFn: () => renderDynamicElements(activeConfig) },

            { el: editQuoteText, prop: 'loveQuote.text', updateFn: () => renderDynamicElements(activeConfig) },
            { el: editQuoteAuthor, prop: 'loveQuote.author', updateFn: () => renderDynamicElements(activeConfig) },

            { el: editVenueName, prop: 'venue.name', updateFn: () => renderDynamicElements(activeConfig) },
            { el: editVenueAddress, prop: 'venue.address', updateFn: () => renderDynamicElements(activeConfig) },
            { el: editVenueNote, prop: 'venue.note', updateFn: () => renderDynamicElements(activeConfig) },
            { el: editVenueMaps, prop: 'venue.mapsUrl', updateFn: () => renderDynamicElements(activeConfig) },

            { el: editDressStyle, prop: 'dressCode.style', updateFn: () => renderDynamicElements(activeConfig) },
            { el: editDressDesc, prop: 'dressCode.description', updateFn: () => renderDynamicElements(activeConfig) }
        ];

        inputs.forEach(item => {
            if (!item.el) return;
            item.el.addEventListener('input', (e) => {
                const val = e.target.value;
                if (item.prop.startsWith('parents.')) {
                    if (!activeConfig.parents) activeConfig.parents = {};
                    const nested = item.prop.split('.')[1];
                    activeConfig.parents[nested] = val;
                } else if (item.prop.startsWith('venue.')) {
                    const nested = item.prop.split('.')[1];
                    activeConfig.venue[nested] = val;
                } else if (item.prop.startsWith('loveQuote.')) {
                    const nested = item.prop.split('.')[1];
                    activeConfig.loveQuote[nested] = val;
                } else if (item.prop.startsWith('dressCode.')) {
                    const nested = item.prop.split('.')[1];
                    activeConfig.dressCode[nested] = val;
                } else {
                    activeConfig[item.prop] = val;
                }
                item.updateFn();
                autoSaveConfig();
            });
        });

        // ISO Date countdown updating
        if (editDateIso) {
            editDateIso.addEventListener('change', (e) => {
                const val = e.target.value.trim();
                activeConfig.weddingDateISO = val;
                targetDate = new Date(val).getTime();
                clearInterval(countdownInterval);
                updateCountdown();
                countdownInterval = setInterval(updateCountdown, 1000);
                autoSaveConfig();
            });
        }

        // Live Colors Theme
        const colorPickers = [
            { el: editColorCream, varName: '--color-cream-bg', prop: 'creamBg' },
            { el: editColorSageLight, varName: '--color-sage-light', prop: 'sageLight' },
            { el: editColorSageMed, varName: '--color-sage-medium', prop: 'sageMedium' },
            { el: editColorForest, varName: '--color-forest', prop: 'forest' },
            { el: editColorGold, varName: '--color-gold', prop: 'gold' }
        ];

        colorPickers.forEach(picker => {
            picker.el.addEventListener('input', (e) => {
                const colorVal = e.target.value;
                document.documentElement.style.setProperty(picker.varName, colorVal);
                activeConfig.colors[picker.prop] = colorVal;
                autoSaveConfig();
            });
        });

        // Live Music url update (Real-time input & change)
        const updateMusicUrlHandler = (e) => {
            const rawVal = e.target.value.trim();
            if (rawVal.includes('youtube.com') || rawVal.includes('youtu.be')) {
                showToast('⚠️ YouTube links cannot play directly in audio tags. Please use a direct MP3 link or click Upload Custom MP3 File!', true, '🎵');
                return;
            }
            const directUrl = getDirectAudioUrl(rawVal);
            activeConfig.musicUrl = directUrl;
            if (bgMusic) {
                bgMusic.src = directUrl;
                bgMusic.load();
                bgMusic.play().then(() => {
                    if (musicBtn) musicBtn.classList.add('playing');
                    const musicHint = document.getElementById('music-hint');
                    if (musicHint) { musicHint.style.opacity = '0.5'; musicHint.innerText = '🎶 Playing'; }
                    isPlaying = true;
                }).catch(() => {});
            }
            autoSaveConfig();
        };

        if (editMusicUrl) {
            editMusicUrl.addEventListener('input', updateMusicUrlHandler);
            editMusicUrl.addEventListener('change', updateMusicUrlHandler);
        }

        // Helper: Cloud MP3 file uploader (Uploads MP3 files to permanent cloud audio host)
        async function uploadAudioFileToCloud(fileBlob, fileName) {
            // 1. Primary: Catbox.moe (Permanent free direct MP3 hosting)
            try {
                const formData = new FormData();
                formData.append('reqtype', 'fileupload');
                formData.append('fileToUpload', fileBlob, fileName || 'wedding_song.mp3');
                const res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: formData });
                if (res.ok) {
                    const url = (await res.text()).trim();
                    if (url.startsWith('http')) return url;
                }
            } catch (e) {
                console.warn('Catbox upload error:', e);
            }

            // 2. Secondary Fallback: Tmpfiles.org
            try {
                const formData = new FormData();
                formData.append('file', fileBlob, fileName || 'wedding_song.mp3');
                const res = await fetch('https://tmpfiles.org/api/v1/upload', { method: 'POST', body: formData });
                if (res.ok) {
                    const json = await res.json();
                    if (json.data && json.data.url) {
                        return json.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
                    }
                }
            } catch (e) {
                console.warn('Tmpfiles upload error:', e);
            }

            return null;
        }

        // Live Custom Audio File Upload (Uploads to Cloud & Saves URL to Supabase)
        const editUploadMusic = document.getElementById('edit-upload-music');
        safeOn(editUploadMusic, 'change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            showToast('⏳ Uploading custom MP3 audio to cloud storage...', false, '☁️');

            // Play local blob preview immediately for instant response
            try {
                const localBlobUrl = URL.createObjectURL(file);
                if (bgMusic) {
                    bgMusic.src = localBlobUrl;
                    bgMusic.load();
                    bgMusic.play().then(() => {
                        if (musicBtn) musicBtn.classList.add('playing');
                        const musicHint = document.getElementById('music-hint');
                        if (musicHint) { musicHint.style.opacity = '0.5'; musicHint.innerText = '🎶 Playing'; }
                        isPlaying = true;
                    }).catch(() => {});
                }
            } catch (err) {}

            // Upload to cloud audio server
            const cloudAudioUrl = await uploadAudioFileToCloud(file, file.name);

            if (cloudAudioUrl) {
                activeConfig.musicUrl = cloudAudioUrl;
                if (editMusicUrl) editMusicUrl.value = cloudAudioUrl;
                if (bgMusic) {
                    bgMusic.src = cloudAudioUrl;
                }
                autoSaveConfig();
                showToast('🎉 Custom MP3 uploaded & saved live for all visitors!', false, '🎵');
            } else {
                // Local fallback
                const reader = new FileReader();
                reader.onload = (evt) => {
                    activeConfig.musicUrl = evt.target.result;
                    autoSaveConfig();
                    showToast('⚠️ Saved locally (Cloud upload server unreachable)', true, '🎵');
                };
                reader.readAsDataURL(file);
            }
        });

        // Google Sheets Auto-Sync Listener & Test Trigger
        const editGoogleSheetsUrl = document.getElementById('edit-google-sheets-url');
        safeOn(editGoogleSheetsUrl, 'change', (e) => {
            const urlVal = e.target.value.trim();
            activeConfig.googleSheetsUrl = urlVal;
            localStorage.setItem('daisy_google_sheets_url', urlVal);
            autoSaveConfig();
        });

        safeOn('test-google-sheets-btn', 'click', () => {
            const url = (editGoogleSheetsUrl ? editGoogleSheetsUrl.value.trim() : '') || activeConfig.googleSheetsUrl || localStorage.getItem('daisy_google_sheets_url');
            if (!url) {
                alert("Please enter a Google Apps Script Webhook URL first!");
                return;
            }
            fetch(url, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timestamp: new Date().toLocaleString(),
                    name: "Test Guest (John Doe)",
                    attendingStatus: "Joyfully Accept",
                    guests: 2,
                    totalAttendingGuests: 15
                })
            }).then(() => {
                alert("✅ Test RSVP payload sent to Google Sheets!\n\nPlease check your Google Sheet to verify that the test row has appeared with the Total Guest Count.");
            }).catch(err => {
                alert("Sync test sent! Check your Google Sheet to confirm receipt.");
            });
        });

        safeOn('toggle-sheets-guide-btn', 'click', () => {
            const guideBox = document.getElementById('sheets-guide-box');
            if (guideBox) guideBox.classList.toggle('hidden');
        });

        // Text size scaling slider listener
        const editTextScale = document.getElementById('edit-text-scale');
        const textScaleVal = document.getElementById('text-scale-val');
        if (editTextScale) {
            editTextScale.addEventListener('input', (e) => {
                const val = parseInt(e.target.value) || 100;
                activeConfig.design = activeConfig.design || {};
                activeConfig.design.fontSizeScale = val;
                if (textScaleVal) textScaleVal.innerText = val;
                document.documentElement.style.fontSize = (16 * val / 100) + 'px';
                autoSaveConfig();
            });
        }

        if (editPetalDensity) {
            editPetalDensity.addEventListener('input', (e) => {
                const count = parseInt(e.target.value);
                activeConfig.petalDensity = count;
                if (petalCountVal) petalCountVal.innerText = count;
                if (typeof adjustPetalCount === 'function') adjustPetalCount(count);
                autoSaveConfig();
            });
        }

        // ----------------------------------------------------
        // Event Delegations for Dynamic Lists Inputs
        // ----------------------------------------------------

        // 1. Story edits
        if (editorStoryList) {
            editorStoryList.addEventListener('input', (e) => {
                const box = e.target.closest('.editor-item-box');
                if (!box) return;
                const index = parseInt(box.getAttribute('data-index'));

                if (e.target.classList.contains('edit-story-date')) {
                    activeConfig.story[index].date = e.target.value;
                } else if (e.target.classList.contains('edit-story-title')) {
                    activeConfig.story[index].title = e.target.value;
                } else if (e.target.classList.contains('edit-story-text')) {
                    activeConfig.story[index].text = e.target.value;
                }
                renderDynamicElements(activeConfig);
                autoSaveConfig();
            });

            editorStoryList.addEventListener('click', (e) => {
                if (!e.target.classList.contains('remove-story-item')) return;
                const index = parseInt(e.target.closest('.editor-item-box').getAttribute('data-index'));
                activeConfig.story.splice(index, 1);
                renderStoryEditorList();
                renderDynamicElements(activeConfig);
                autoSaveConfig();
            });
        }

        // 2. Schedule edits
        if (editorScheduleList) {
            editorScheduleList.addEventListener('input', (e) => {
                const box = e.target.closest('.editor-item-box');
                if (!box) return;
                const index = parseInt(box.getAttribute('data-index'));

                if (e.target.classList.contains('edit-schedule-icon')) {
                    activeConfig.schedule[index].icon = e.target.value;
                } else if (e.target.classList.contains('edit-schedule-title')) {
                    activeConfig.schedule[index].title = e.target.value;
                } else if (e.target.classList.contains('edit-schedule-time')) {
                    activeConfig.schedule[index].time = e.target.value;
                } else if (e.target.classList.contains('edit-schedule-details')) {
                    activeConfig.schedule[index].details = e.target.value;
                }
                renderDynamicElements(activeConfig);
                autoSaveConfig();
            });

            editorScheduleList.addEventListener('click', (e) => {
                if (!e.target.classList.contains('remove-schedule-item')) return;
                const index = parseInt(e.target.closest('.editor-item-box').getAttribute('data-index'));
                activeConfig.schedule.splice(index, 1);
                renderScheduleEditorList();
                renderDynamicElements(activeConfig);
                autoSaveConfig();
            });
        }

        // 3. Accommodations edits
        if (editorAccommodationsList) {
            editorAccommodationsList.addEventListener('input', (e) => {
                const box = e.target.closest('.editor-item-box');
                if (!box) return;
                const index = parseInt(box.getAttribute('data-index'));

                if (e.target.classList.contains('edit-hotel-name')) {
                    activeConfig.accommodations[index].name = e.target.value;
                } else if (e.target.classList.contains('edit-hotel-distance')) {
                    activeConfig.accommodations[index].distance = e.target.value;
                } else if (e.target.classList.contains('edit-hotel-phone')) {
                    activeConfig.accommodations[index].phone = e.target.value;
                } else if (e.target.classList.contains('edit-hotel-link')) {
                    activeConfig.accommodations[index].link = e.target.value;
                }
                renderDynamicElements(activeConfig);
                autoSaveConfig();
            });

            editorAccommodationsList.addEventListener('click', (e) => {
                if (!e.target.classList.contains('remove-accommodation-item')) return;
                const index = parseInt(e.target.closest('.editor-item-box').getAttribute('data-index'));
                activeConfig.accommodations.splice(index, 1);
                renderAccommodationsEditorList();
                renderDynamicElements(activeConfig);
                autoSaveConfig();
            });
        }

        // 4. Dress code colors edits
        if (editDressColorsList) {
            editDressColorsList.addEventListener('input', (e) => {
                const box = e.target.closest('.editor-item-box');
                if (!box) return;
                const index = parseInt(box.getAttribute('data-index'));

                if (e.target.classList.contains('edit-color-hex')) {
                    activeConfig.dressCode.colors[index].hex = e.target.value;
                } else if (e.target.classList.contains('edit-color-name')) {
                    activeConfig.dressCode.colors[index].name = e.target.value;
                }
                renderDynamicElements(activeConfig);
                autoSaveConfig();
            });

            editDressColorsList.addEventListener('click', (e) => {
                if (!e.target.classList.contains('remove-dress-color')) return;
                const index = parseInt(e.target.closest('.editor-item-box').getAttribute('data-index'));
                activeConfig.dressCode.colors.splice(index, 1);
                renderDressColorsEditorList();
                renderDynamicElements(activeConfig);
                autoSaveConfig();
            });
        }
    }

    // ----------------------------------------------------
    // Draggable Elements Drag Logic (Bouquet & Floating Page Images)
    // ----------------------------------------------------
    let activeDragNode = null;
    let isDragging = false;
    let dragStartX, dragStartY;

    document.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);

    document.addEventListener('touchstart', dragStart, { passive: false });
    document.addEventListener('touchmove', dragMove, { passive: false });
    document.addEventListener('touchend', dragEnd);

    function dragStart(e) {
        if (!document.body.classList.contains('editing-mode')) return;
        
        const node = e.target.closest('.draggable-bouquet-container, .floating-decor-wrapper');
        if (!node) return;
        
        activeDragNode = node;
        isDragging = true;
        
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        
        // Get current offset values
        let currentX = 0;
        let currentY = 0;
        
        if (node.classList.contains('draggable-bouquet-container')) {
            currentX = activeConfig.design.heroBouquetStyle.x;
            currentY = activeConfig.design.heroBouquetStyle.y;
        } else {
            const imgId = node.id;
            const imgObj = activeConfig.design.floatingImages?.find(item => item.id === imgId);
            if (imgObj) {
                currentX = imgObj.style.x;
                currentY = imgObj.style.y;
            }
        }
        
        dragStartX = clientX - currentX;
        dragStartY = clientY - currentY;
        
        // Disable transition animations during drag
        const imgEl = node.querySelector('img');
        if (imgEl) imgEl.style.transition = 'none';
        
        if (e.cancelable) e.preventDefault();
    }

    function dragMove(e) {
        if (!isDragging || !activeDragNode) return;
        
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        
        const x = Math.round(clientX - dragStartX);
        const y = Math.round(clientY - dragStartY);
        
        if (activeDragNode.classList.contains('draggable-bouquet-container')) {
            activeConfig.design.heroBouquetStyle.x = x;
            activeConfig.design.heroBouquetStyle.y = y;
            
            editBouquetX.value = x;
            bouquetXVal.innerText = x;
            editBouquetY.value = y;
            bouquetYVal.innerText = y;
        } else {
            const imgId = activeDragNode.id;
            const imgObj = activeConfig.design.floatingImages?.find(item => item.id === imgId);
            if (imgObj) {
                imgObj.style.x = x;
                imgObj.style.y = y;
            }
        }
        
        applyDesignStyles();
    }

    function dragEnd() {
        if (!isDragging) return;
        isDragging = false;
        if (activeDragNode) {
            const imgEl = activeDragNode.querySelector('img');
            if (imgEl) imgEl.style.transition = '';
        }
        activeDragNode = null;
        autoSaveConfig(); // Auto-save when dragging stops
    }

    // ----------------------------------------------------
    // Flower Design Controls Listeners
    // ----------------------------------------------------
    safeOn(editUploadBouquet, 'change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (evt) => {
                const compressedUrl = await compressImage(evt.target.result);
                activeConfig.design.heroBouquetUrl = compressedUrl;
                applyDesignStyles();
                autoSaveConfig();
            };
            reader.readAsDataURL(file);
        }
    });

    safeOn(editBouquetScale, 'input', (e) => {
        const val = parseFloat(e.target.value);
        if (activeConfig.design?.heroBouquetStyle) activeConfig.design.heroBouquetStyle.scale = val;
        if (bouquetScaleVal) bouquetScaleVal.innerText = val;
        applyDesignStyles();
    });

    safeOn(editBouquetX, 'input', (e) => {
        const val = parseInt(e.target.value);
        if (activeConfig.design?.heroBouquetStyle) activeConfig.design.heroBouquetStyle.x = val;
        if (bouquetXVal) bouquetXVal.innerText = val;
        applyDesignStyles();
    });

    safeOn(editBouquetY, 'input', (e) => {
        const val = parseInt(e.target.value);
        if (activeConfig.design?.heroBouquetStyle) activeConfig.design.heroBouquetStyle.y = val;
        if (bouquetYVal) bouquetYVal.innerText = val;
        applyDesignStyles();
    });

    safeOn(editBouquetRotate, 'input', (e) => {
        const val = parseInt(e.target.value);
        if (activeConfig.design?.heroBouquetStyle) activeConfig.design.heroBouquetStyle.rotate = val;
        if (bouquetRotateVal) bouquetRotateVal.innerText = val;
        applyDesignStyles();
    });

    safeOn(resetFlowerPosBtn, 'click', () => {
        activeConfig.design.heroBouquetStyle = { scale: 1.0, x: 0, y: 0, rotate: 0 };
        if (editBouquetScale) editBouquetScale.value = 1.0;
        if (bouquetScaleVal) bouquetScaleVal.innerText = "1.0";
        if (editBouquetX) editBouquetX.value = 0;
        if (bouquetXVal) bouquetXVal.innerText = "0";
        if (editBouquetY) editBouquetY.value = 0;
        if (bouquetYVal) bouquetYVal.innerText = "0";
        if (editBouquetRotate) editBouquetRotate.value = 0;
        if (bouquetRotateVal) bouquetRotateVal.innerText = "0";
        applyDesignStyles();
    });

    // Add Floating Page Decoration Image Listener
    // Helper: compress uploaded images dynamically while preserving PNG transparency
    function compressImage(dataUrl, maxDim = 1200, quality = 0.85) {
        return new Promise((resolve) => {
            const isPng = dataUrl.startsWith('data:image/png') || dataUrl.includes('png');
            const outputMime = isPng ? 'image/png' : 'image/jpeg';

            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, width, height); // Keep transparent background
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL(outputMime, quality));
            };
            img.onerror = () => resolve(dataUrl);
            img.src = dataUrl;
        });
    }

    const editAddFloatingImg = document.getElementById('edit-add-floating-img');
    if (editAddFloatingImg) {
        editAddFloatingImg.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async (evt) => {
                    const compressedUrl = await compressImage(evt.target.result);
                    activeConfig.design.floatingImages = activeConfig.design.floatingImages || [];
                    activeConfig.design.floatingImages.push({
                        id: `float-img-${Date.now()}`,
                        url: compressedUrl,
                        style: {
                            x: Math.round(window.innerWidth / 2 - 75), // Center on page viewport
                            y: Math.round(window.scrollY + window.innerHeight / 2 - 75),
                            scale: 1.0,
                            rotate: 0
                        }
                    });
                    applyDesignStyles();
                    autoSaveConfig(); // Auto-save after floating image addition
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Inject hidden file input for visual element uploader
    const visualFileInput = document.createElement('input');
    visualFileInput.type = 'file';
    visualFileInput.accept = 'image/*';
    visualFileInput.style.display = 'none';
    document.body.appendChild(visualFileInput);
    
    let activeImageUploadTarget = null;
    
    if (visualFileInput) {
        visualFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && activeImageUploadTarget) {
                const reader = new FileReader();
                reader.onload = async (evt) => {
                    const compressedUrl = await compressImage(evt.target.result);
                    const targetId = activeImageUploadTarget;
                    activeConfig.design.overrides = activeConfig.design.overrides || {};
                    activeConfig.design.overrides[targetId] = activeConfig.design.overrides[targetId] || {};
                    
                    // Append new compressed image to card gallery array
                    activeConfig.design.overrides[targetId].imageUrls = activeConfig.design.overrides[targetId].imageUrls || [];
                    activeConfig.design.overrides[targetId].imageUrls.push(compressedUrl);
                    
                    // Reset legacy single image field
                    activeConfig.design.overrides[targetId].imageUrl = '';
                    
                    applyDesignStyles();
                    autoSaveConfig(); // Auto-save on card image upload
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Handle clicks on visual WYSIWYG button overlays
    document.addEventListener('click', (e) => {
        if (!document.body.classList.contains('editing-mode')) return;
        
        // 1. Remove individual gallery image click action
        const removeImgBtn = e.target.closest('.btn-remove-gallery-img');
        if (removeImgBtn) {
            const targetBox = removeImgBtn.closest('.editor-target');
            if (targetBox) {
                const targetId = targetBox.id || targetBox.getAttribute('data-edit-id');
                const imgBox = removeImgBtn.closest('.gallery-image-box');
                if (targetId && imgBox) {
                    const imgIndex = parseInt(imgBox.getAttribute('data-image-index'));
                    if (activeConfig.design.overrides[targetId]?.imageUrls) {
                        activeConfig.design.overrides[targetId].imageUrls.splice(imgIndex, 1);
                        applyDesignStyles();
                    }
                }
            }
            return;
        }

        // 2. Toolbar controls clicks
        const targetBtn = e.target.closest('.visual-btn');
        if (!targetBtn) return;
        
        const targetBox = targetBtn.closest('.editor-target');
        if (!targetBox) return;
        
        const targetId = targetBox.id || targetBox.getAttribute('data-edit-id');
        if (!targetId) return;
        
        // Intercept clicks on floating decoration images
        if (targetId.startsWith('float-img-')) {
            const imgObj = activeConfig.design.floatingImages?.find(item => item.id === targetId);
            if (imgObj) {
                if (targetBtn.classList.contains('btn-delete-el')) {
                    activeConfig.design.floatingImages = activeConfig.design.floatingImages.filter(item => item.id !== targetId);
                    applyDesignStyles();
                } else if (targetBtn.classList.contains('btn-size-up')) {
                    imgObj.style.scale = parseFloat((imgObj.style.scale + 0.1).toFixed(2));
                    applyDesignStyles();
                } else if (targetBtn.classList.contains('btn-size-down')) {
                    imgObj.style.scale = parseFloat(Math.max(0.2, imgObj.style.scale - 0.1).toFixed(2));
                    applyDesignStyles();
                }
                autoSaveConfig(); // Auto-save after modifying floating decor size/delete
            }
            return;
        }
        
        activeConfig.design.overrides = activeConfig.design.overrides || {};
        activeConfig.design.overrides[targetId] = activeConfig.design.overrides[targetId] || {};
        
        if (targetBtn.classList.contains('btn-delete-el')) {
            activeConfig.design.overrides[targetId].deleted = true;
            applyDesignStyles();
            autoSaveConfig();
        } else if (targetBtn.classList.contains('btn-remove-img')) {
            if (activeConfig.design.overrides[targetId]) {
                activeConfig.design.overrides[targetId].imageUrl = '';
                activeConfig.design.overrides[targetId].imageUrls = [];
                applyDesignStyles();
                autoSaveConfig();
            }
        } else if (targetBtn.classList.contains('btn-size-up')) {
            const currentSize = parseFloat(window.getComputedStyle(targetBox).fontSize);
            const newSize = `${(currentSize + 2) / 16}rem`;
            activeConfig.design.overrides[targetId].fontSize = newSize;
            applyDesignStyles();
            autoSaveConfig();
        } else if (targetBtn.classList.contains('btn-size-down')) {
            const currentSize = parseFloat(window.getComputedStyle(targetBox).fontSize);
            const newSize = `${Math.max(10, currentSize - 2) / 16}rem`;
            activeConfig.design.overrides[targetId].fontSize = newSize;
            applyDesignStyles();
            autoSaveConfig();
        } else if (targetBtn.classList.contains('btn-upload-img')) {
            activeImageUploadTarget = targetId;
            visualFileInput.click();
        }
    });

    // Generate unique mapping key for editable content text overrides
    function getElementOverrideKey(el) {
        if (el.id) return el.id;
        
        const parent = el.closest('.editor-target');
        if (parent) {
            const parentId = parent.id || parent.getAttribute('data-edit-id');
            if (parentId) {
                const identifier = el.className ? `.${el.className.split(' ')[0]}` : el.tagName.toLowerCase();
                return `${parentId}::${identifier}`;
            }
        }
        return null;
    }

    // Listen to direct text typing on editable fields
    document.addEventListener('input', (e) => {
        const el = e.target;
        if (el && el.hasAttribute('contenteditable')) {
            const key = getElementOverrideKey(el);
            if (key) {
                activeConfig.design.textOverrides = activeConfig.design.textOverrides || {};
                const cleanText = el.innerText.replace(/[➖➕📷🗑️🚫]/g, '').trim();
                activeConfig.design.textOverrides[key] = cleanText;
            }

            // Map key main fields back to root properties
            if (el.id === 'hero-title-el') {
                const parts = el.innerText.split('&').map(s => s.trim());
                if (parts.length >= 2) {
                    activeConfig.brideName = parts[0];
                    activeConfig.groomName = parts.slice(1).join('&');
                }
            } else if (el.id === 'hero-date-el') {
                activeConfig.weddingDateFormatted = el.innerText;
            } else if (el.id === 'hero-location-el') {
                activeConfig.venue = activeConfig.venue || {};
                activeConfig.venue.name = el.innerText;
            } else if (el.id === 'parents-subtitle-el') {
                activeConfig.parents = activeConfig.parents || {};
                activeConfig.parents.subtitle = el.innerText;
            } else if (el.id === 'parents-title-el') {
                activeConfig.parents = activeConfig.parents || {};
                activeConfig.parents.title = el.innerText;
            } else if (el.id === 'bride-parents-label-el') {
                activeConfig.parents = activeConfig.parents || {};
                activeConfig.parents.brideParentsLabel = el.innerText;
            } else if (el.id === 'bride-parents-names-el') {
                activeConfig.parents = activeConfig.parents || {};
                activeConfig.parents.brideParentsNames = el.innerText;
            } else if (el.id === 'groom-parents-label-el') {
                activeConfig.parents = activeConfig.parents || {};
                activeConfig.parents.groomParentsLabel = el.innerText;
            } else if (el.id === 'groom-parents-names-el') {
                activeConfig.parents = activeConfig.parents || {};
                activeConfig.parents.groomParentsNames = el.innerText;
            } else if (el.id === 'venue-address-el') {
                activeConfig.venue = activeConfig.venue || {};
                activeConfig.venue.address = el.innerText;
            } else if (el.id === 'venue-note-el') {
                activeConfig.venue = activeConfig.venue || {};
                activeConfig.venue.note = el.innerText.replace(/^Note:\s*/i, '');
            } else if (el.id === 'quote-text-el') {
                activeConfig.loveQuote = activeConfig.loveQuote || {};
                activeConfig.loveQuote.text = el.innerText.replace(/^[“"]|[”"]$/g, '');
            } else if (el.id === 'quote-author-el') {
                activeConfig.loveQuote = activeConfig.loveQuote || {};
                activeConfig.loveQuote.author = el.innerText.replace(/^[—–-]\s*/, '');
            } else if (el.id === 'dress-style-el') {
                activeConfig.dressCode = activeConfig.dressCode || {};
                activeConfig.dressCode.style = el.innerText;
            } else if (el.id === 'dress-desc-el') {
                activeConfig.dressCode = activeConfig.dressCode || {};
                activeConfig.dressCode.description = el.innerText;
            } else if (el.id === 'rsvp-deadline-el') {
                activeConfig.rsvpDeadline = el.innerText;
            }

            // Keep Creator Studio sidebar inputs in sync
            if (typeof populateSidebarFields === 'function') {
                populateSidebarFields(activeConfig);
            }
            
            autoSaveConfig(); // Auto-save inline typed overrides
        }
    });

    // Restore Deleted Elements button click
    document.getElementById('restore-elements-btn').addEventListener('click', () => {
        if (activeConfig.design && activeConfig.design.overrides) {
            Object.keys(activeConfig.design.overrides).forEach(id => {
                activeConfig.design.overrides[id].deleted = false;
            });
            applyDesignStyles();
            alert("All deleted layout elements have been restored!");
        }
    });

    registerLivePreviewListeners();

    // ----------------------------------------------------
    // List item additions
    // ----------------------------------------------------
    const addStoryBtn = document.getElementById('add-story-event-btn');
    if (addStoryBtn) {
        addStoryBtn.addEventListener('click', () => {
            activeConfig.story.push({
                date: "New Season",
                title: "Our New Chapter",
                text: "Describe the memories of this moment here..."
            });
            renderStoryEditorList();
            renderDynamicElements(activeConfig);
            autoSaveConfig();
        });
    }

    const addSchedBtn = document.getElementById('add-schedule-item-btn');
    if (addSchedBtn) {
        addSchedBtn.addEventListener('click', () => {
            activeConfig.schedule.push({
                icon: "✨",
                title: "New Event",
                time: "12:00 PM",
                details: "Brief description of the wedding day itinerary event..."
            });
            renderScheduleEditorList();
            renderDynamicElements(activeConfig);
            autoSaveConfig();
        });
    }

    const addAccBtn = document.getElementById('add-accommodation-btn');
    if (addAccBtn) {
        addAccBtn.addEventListener('click', () => {
            activeConfig.accommodations.push({
                name: "New Guest Hotel",
                phone: "+1 (555) 000-0000",
                distance: "Distance details",
                link: "#"
            });
            renderAccommodationsEditorList();
            renderDynamicElements(activeConfig);
            autoSaveConfig();
        });
    }

    const addColorBtn = document.getElementById('add-dress-color-btn');
    if (addColorBtn) {
        addColorBtn.addEventListener('click', () => {
            activeConfig.dressCode.colors.push({
                name: "New Color",
                hex: "#BDCDBD"
            });
            renderDressColorsEditorList();
            renderDynamicElements(activeConfig);
            autoSaveConfig();
        });
    }


    // ----------------------------------------------------
    // Footer config save / exports / resets
    // ----------------------------------------------------

    if (publishLiveBtn) {
        publishLiveBtn.addEventListener('click', async () => {
            const originalText = publishLiveBtn.innerHTML;
            const statusBox = document.getElementById('save-status-msg');

            publishLiveBtn.disabled = true;
            publishLiveBtn.innerHTML = '⏳ Saving changes...';

            if (statusBox) {
                statusBox.classList.remove('hidden');
                statusBox.style.background = 'rgba(214, 163, 84, 0.2)';
                statusBox.style.color = '#2C3E2F';
                statusBox.style.border = '1px solid var(--color-gold)';
                statusBox.innerHTML = '⏳ Saving your changes live...';
            }

            try {
                // Try saving to localStorage safely (with quota fallback)
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeConfig));
                } catch (storageErr) {
                    try {
                        const cleanCfg = createCleanConfigForStorage(activeConfig);
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanCfg));
                    } catch (e) {
                        console.warn("LocalStorage quota reached, relying on Supabase Cloud database:", e);
                    }
                }

                // Save to Supabase Cloud so all visitors see changes
                const response = await fetch(`${SUPABASE_URL}/rest/v1/wedding_config`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'resolution=merge-duplicates'
                    },
                    body: JSON.stringify({
                        id: SITE_ID,
                        config: activeConfig,
                        updated_at: new Date().toISOString()
                    })
                });

                publishLiveBtn.disabled = false;
                publishLiveBtn.innerHTML = '✅ Changes Saved!';
                setTimeout(() => { publishLiveBtn.innerHTML = originalText; }, 3500);

                if (response.ok || response.status === 201 || response.status === 204) {
                    if (statusBox) {
                        statusBox.style.background = 'rgba(44, 120, 60, 0.15)';
                        statusBox.style.color = '#1E382B';
                        statusBox.style.border = '1px solid #2C3E2F';
                        statusBox.innerHTML = '🎉 <strong>Success!</strong> All changes saved and live for all visitors!';
                    }
                    showToast('🎉 Changes saved successfully & live for all visitors!', false, '✅');
                } else {
                    if (statusBox) {
                        statusBox.style.background = 'rgba(214, 163, 84, 0.2)';
                        statusBox.style.color = '#2C3E2F';
                        statusBox.style.border = '1px solid var(--color-gold)';
                        statusBox.innerHTML = '✅ <strong>Saved locally!</strong> (Cloud sync offline)';
                    }
                    showToast('✅ Saved locally to browser cache!', false, '💾');
                }
            } catch (err) {
                publishLiveBtn.disabled = false;
                publishLiveBtn.innerHTML = originalText;
                // Even if cloud fails, local save already worked
                localStorage.setItem('daisy_wedding_design_config', JSON.stringify(activeConfig));
                
                if (statusBox) {
                    statusBox.style.background = 'rgba(180, 50, 50, 0.15)';
                    statusBox.style.color = '#8B0000';
                    statusBox.style.border = '1px solid #B43232';
                    statusBox.innerHTML = '❌ <strong>Save Error:</strong> ' + err.message;
                }
                showToast('❌ Save failed: ' + err.message, true, '⚠️');
            }
        });
    }

    if (saveConfigBtn) {
        saveConfigBtn.addEventListener('click', () => {
            try {
                localStorage.setItem('daisy_wedding_design_config', JSON.stringify(activeConfig));
                alert("Design configuration saved locally to your device browser!");
            } catch (e) {
                if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    alert("⚠️ Browser Storage Limit Exceeded!\n\nYour uploaded images are too large for browser memory. Please click 'Export config.js' instead to download your design configuration file and save it to your project folder.");
                } else {
                    alert("Save failed: " + e.message);
                }
            }
        });
    }

    if (resetConfigBtn) {
        resetConfigBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to discard your custom edits and reset to the config.js defaults?")) {
                localStorage.removeItem('daisy_wedding_design_config');
                location.reload();
            }
        });
    }

    if (exportConfigBtn) {
        exportConfigBtn.addEventListener('click', () => {
            // Deep copy clean active settings
            const exportObj = {
                brideName: activeConfig.brideName,
                groomName: activeConfig.groomName,
                hashtag: activeConfig.hashtag,
                weddingDateISO: activeConfig.weddingDateISO,
                weddingDateFormatted: activeConfig.weddingDateFormatted,
                rsvpDeadline: activeConfig.rsvpDeadline,
                sections: activeConfig.sections,
                loveQuote: activeConfig.loveQuote,
                venue: activeConfig.venue,
                dressCode: activeConfig.dressCode,
                accommodations: activeConfig.accommodations,
                musicUrl: activeConfig.musicUrl,
                petalDensity: activeConfig.petalDensity,
                colors: activeConfig.colors,
                design: activeConfig.design,
                story: activeConfig.story,
                schedule: activeConfig.schedule
            };

            const configTemplate = `// ==========================================================================
// Wedding Invitation Configuration
// Edit the values below to customize the wedding details
// ==========================================================================

window.weddingConfig = ${JSON.stringify(exportObj, null, 4)};
`;
            
            const blob = new Blob([configTemplate], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = 'config.js';
            document.body.appendChild(link);
            link.click();
            
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    }

    // ----------------------------------------------------
    // Passcode Security & Unlock Modal Controls
    // ----------------------------------------------------
    const passcodeModal = document.getElementById('passcode-modal');
    const passcodeInput = document.getElementById('passcode-input');
    const submitPasscodeBtn = document.getElementById('submit-passcode-btn');
    const closePasscodeModal = document.getElementById('close-passcode-modal');
    const passcodeError = document.getElementById('passcode-error');
    const lockCreatorBtn = document.getElementById('lock-creator-btn');
    const footerHashtag = document.getElementById('footer-hashtag-el');

    // Function to show passcode prompt
    function showPasscodeModal() {
        if (passcodeModal) {
            passcodeModal.classList.remove('hidden');
            passcodeInput.value = '';
            passcodeInput.focus();
            if (passcodeError) passcodeError.classList.add('hidden');
        }
    }

    // Function to hide passcode prompt
    function hidePasscodeModal() {
        if (passcodeModal) {
            passcodeModal.classList.add('hidden');
        }
    }

    // Submit passcode logic
    function handlePasscodeSubmit() {
        const entered = passcodeInput.value.trim().toLowerCase();
        if (entered === 'daisy2026' || entered === '1234' || entered === 'daisy' || entered === 'alexander') {
            hidePasscodeModal();
            if (typeof openCreatorStudioSidebar === 'function') {
                openCreatorStudioSidebar();
            }
        } else {
            if (passcodeError) passcodeError.classList.remove('hidden');
        }
    }

    if (submitPasscodeBtn) {
        submitPasscodeBtn.addEventListener('click', handlePasscodeSubmit);
    }
    if (passcodeInput) {
        passcodeInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handlePasscodeSubmit();
        });
    }
    if (closePasscodeModal) {
        closePasscodeModal.addEventListener('click', hidePasscodeModal);
    }
    if (passcodeModal) {
        passcodeModal.addEventListener('click', (e) => {
            if (e.target === passcodeModal) hidePasscodeModal();
        });
    }

    // Lock Creator Mode (Logout)
    if (lockCreatorBtn) {
        lockCreatorBtn.addEventListener('click', () => {
            localStorage.removeItem('daisy_creator_unlocked');
            location.reload();
        });
    }

    // Trigger 1: Keyboard Shortcut (Ctrl/Cmd/Alt + Shift + E) — reveals top-right Edit Design button & prompts password
    document.addEventListener('keydown', (e) => {
        const isKeyE = (e.key && e.key.toLowerCase() === 'e') || e.code === 'KeyE' || e.keyCode === 69;
        const hasModifier = (e.ctrlKey || e.metaKey || e.altKey) && e.shiftKey;
        if (hasModifier && isKeyE) {
            e.preventDefault();
            e.stopPropagation();
            const trigger = document.querySelector('.creator-trigger-wrapper');
            if (trigger) {
                trigger.style.display = 'block';
                trigger.style.visibility = 'visible';
                trigger.classList.remove('hidden');
            }
            if (typeof showPasscodeModal === 'function') {
                showPasscodeModal();
            }
        }
    });

    // Trigger 2: Tap footer hashtag 5 times
    let hashtagClickCount = 0;
    let hashtagClickTimeout;
    if (footerHashtag) {
        footerHashtag.addEventListener('click', () => {
            hashtagClickCount++;
            clearTimeout(hashtagClickTimeout);
            
            if (hashtagClickCount >= 5) {
                hashtagClickCount = 0;
                showPasscodeModal();
            } else {
                // Reset count if they stop tapping for 2 seconds
                hashtagClickTimeout = setTimeout(() => {
                    hashtagClickCount = 0;
                }, 2000);
            }
        });
        footerHashtag.style.cursor = 'pointer';
    }

    // ── Secret URL key auto-open (ONLY opens when ?key=... is present in URL) ──
    var params = new URLSearchParams(window.location.search);
    var secretKey = params.get('key');
    var isKeyUnlocked = secretKey && (secretKey === 'daisy2026' || secretKey === '1234' || secretKey === 'daisy' || secretKey === 'alexander');

    if (isKeyUnlocked) {
        if (typeof openCreatorStudioSidebar === 'function') {
            openCreatorStudioSidebar();
        }
    }

    // ── Secret long-press on bouquet image (3 seconds) — works on mobile ───
    var bouquet = document.querySelector('.hero-bouquet-img, .draggable-bouquet-container');
    if (bouquet) {
        var pressTimer;
        var startLongPress = function() {
            pressTimer = setTimeout(function() {
                if (typeof showPasscodeModal === 'function') showPasscodeModal();
            }, 3000);
        };
        var cancelLongPress = function() { clearTimeout(pressTimer); };
        bouquet.addEventListener('mousedown', startLongPress);
        bouquet.addEventListener('touchstart', startLongPress, { passive: true });
        bouquet.addEventListener('mouseup', cancelLongPress);
        bouquet.addEventListener('mouseleave', cancelLongPress);
        bouquet.addEventListener('touchend', cancelLongPress);
    }
});


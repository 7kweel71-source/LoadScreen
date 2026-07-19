(() => {
    'use strict';

    const defaults = {
        brand: 'phoenix',
        accentColor: '#ff0062',
        loadingTitle: 'BAIXANDO',
        pathPrefix: 'phoenix/assets',
        fallbackAssetName: 'nomedomod',
        showPercentage: false,
        socials: [
            { id: 'discord', label: 'Discord', url: '', highlighted: true },
            { id: 'youtube', label: 'YouTube', url: '', highlighted: false },
            { id: 'instagram', label: 'Instagram', url: '', highlighted: false },
        ],
        music: {
            enabled: true,
            autoplay: true,
            loop: true,
            volume: 22,
            showControl: true,
            startSeconds: 0,
            selection: 'first',
            tracks: [
                {
                    type: 'local',
                    source: 'assets/audio/loading.mp3',
                    title: 'Phoenix — Ambient Loading',
                },
            ],
        },
        animation: {
            enabled: true,
            zoomScale: 1.020,
            zoomDuration: 16,
            palmSwayDegrees: 0.38,
            headMovementPixels: 1.6,
            brandFloatPixels: 4,
            brandDuration: 5.8,
        },
    };

    const handover = window.nuiHandoverData?.phoenixLoadscreen || {};
    const config = {
        ...defaults,
        ...handover,
        music: { ...defaults.music, ...(handover.music || {}) },
        animation: { ...defaults.animation, ...(handover.animation || {}) },
        socials: Array.isArray(handover.socials) ? handover.socials : defaults.socials,
    };

    const root = document.documentElement;
    const loadscreen = document.getElementById('loadscreen');
    const heroBrand = document.getElementById('heroBrand');
    const loadingTitle = document.getElementById('loadingTitle');
    const loadingPercent = document.getElementById('loadingPercent');
    const assetPath = document.getElementById('assetPath');
    const progressBar = document.getElementById('progressBar');
    const progressGlow = document.getElementById('progressGlow');
    const socialLinks = document.getElementById('socialLinks');
    const musicWidget = document.getElementById('musicWidget');
    const musicToggle = document.getElementById('musicToggle');
    const musicIcon = document.getElementById('musicIcon');
    const musicStatus = document.getElementById('musicStatus');
    const musicTitle = document.getElementById('musicTitle');
    const htmlAudioPlayer = document.getElementById('htmlAudioPlayer');

    let targetProgress = 0;
    let renderedProgress = 0;
    let lastAsset = '';
    let closing = false;
    let musicPlayer = null;
    let musicPlaying = false;
    let musicReady = false;
    let musicFailed = false;
    let activeTrackIndex = -1;
    let activeTrackType = '';
    let tracksQueue = [];

    const icons = {
        discord: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.32 4.37a19.8 19.8 0 0 0-4.93-1.52c-.21.38-.46.9-.63 1.3a18.3 18.3 0 0 0-5.48 0 13.6 13.6 0 0 0-.64-1.3A19.7 19.7 0 0 0 3.7 4.38C.58 9.02-.27 13.55.15 18a19.9 19.9 0 0 0 6.06 3.06c.49-.66.92-1.36 1.3-2.1-.72-.27-1.41-.6-2.08-1 .17-.12.34-.25.5-.38a14.2 14.2 0 0 0 12.14 0l.51.38c-.67.4-1.37.74-2.09 1 .38.74.82 1.44 1.3 2.1A19.8 19.8 0 0 0 23.85 18c.5-5.16-.84-9.65-3.53-13.63ZM8.02 15.3c-1.18 0-2.15-1.08-2.15-2.4s.95-2.4 2.15-2.4c1.21 0 2.18 1.1 2.16 2.4 0 1.32-.95 2.4-2.16 2.4Zm7.95 0c-1.18 0-2.15-1.08-2.15-2.4s.95-2.4 2.15-2.4c1.21 0 2.18 1.1 2.16 2.4 0 1.32-.95 2.4-2.16 2.4Z"/></svg>`,
        youtube: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.12C19.54 3.58 12 3.58 12 3.58s-7.54 0-9.4.5A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.12c1.86.5 9.4.5 9.4.5s7.54 0 9.4-.5a3 3 0 0 0 2.1-2.12A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8ZM9.6 15.58V8.42L15.82 12 9.6 15.58Z"/></svg>`,
        instagram: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.7 2h8.6A5.7 5.7 0 0 1 22 7.7v8.6a5.7 5.7 0 0 1-5.7 5.7H7.7A5.7 5.7 0 0 1 2 16.3V7.7A5.7 5.7 0 0 1 7.7 2Zm-.2 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm9.75 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg>`,
        volume: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.06A4.5 4.5 0 0 0 16.5 12Zm0-8.2v2.06a7 7 0 0 1 0 12.28v2.06a9 9 0 0 0 0-16.4Z"/></svg>`,
        muted: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3Zm13.2 3 2.4-2.4-1.2-1.2-2.4 2.4-2.4-2.4-1.2 1.2 2.4 2.4-2.4 2.4 1.2 1.2 2.4-2.4 2.4 2.4 1.2-1.2-2.4-2.4Z"/></svg>`,
    };

    function sanitizeColor(value) {
        return /^#[0-9a-f]{6}$/i.test(String(value || '')) ? value : defaults.accentColor;
    }

    function safeNumber(value, fallback, min, max) {
        const number = Number(value);
        return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
    }

    function applyConfig() {
        root.style.setProperty('--accent', sanitizeColor(config.accentColor));
        root.style.setProperty('--zoom-scale', safeNumber(config.animation.zoomScale, 1.025, 1, 1.08));
        root.style.setProperty('--zoom-duration', `${safeNumber(config.animation.zoomDuration, 14, 4, 60)}s`);
        root.style.setProperty('--palm-sway', `${safeNumber(config.animation.palmSwayDegrees, .55, 0, 2)}deg`);
        root.style.setProperty('--head-shift', `${safeNumber(config.animation.headMovementPixels, 2.5, 0, 8)}px`);
        root.style.setProperty('--brand-float', `${safeNumber(config.animation.brandFloatPixels, 4, 0, 14)}px`);
        root.style.setProperty('--brand-duration', `${safeNumber(config.animation.brandDuration, 5.8, 2, 30)}s`);

        heroBrand.textContent = String(config.brand || defaults.brand).toLowerCase();
        loadingTitle.textContent = String(config.loadingTitle || defaults.loadingTitle).toUpperCase();
        loadingPercent.hidden = config.showPercentage === false;
        setAsset(config.fallbackAssetName);

        if (config.animation.enabled === false) {
            document.querySelectorAll('.scene-layer, .hero-brand').forEach((element) => {
                element.style.animation = 'none';
            });
        }

        renderSocials();
        setupMusic();
    }

    function renderSocials() {
        socialLinks.replaceChildren();

        config.socials.slice(0, 5).forEach((social) => {
            const id = String(social.id || '').toLowerCase();
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `social-button${social.highlighted ? ' is-highlighted' : ''}`;
            button.setAttribute('aria-label', social.label || id || 'Link');
            button.title = social.label || id || 'Link';
            button.innerHTML = icons[id] || icons.instagram;
            button.addEventListener('click', () => openExternal(String(social.url || '')));
            socialLinks.appendChild(button);
        });
    }

    function openExternal(url) {
        if (!/^https?:\/\//i.test(url)) return;

        try {
            if (typeof window.invokeNative === 'function') {
                window.invokeNative('openUrl', url);
                return;
            }
        } catch (error) {
            console.warn('[Phoenix Loadscreen] Não foi possível usar invokeNative:', error);
        }

        window.open(url, '_blank', 'noopener,noreferrer');
    }

    function parseYouTubeUrl(rawUrl) {
        const raw = String(rawUrl || '').trim();
        if (!raw) return null;

        try {
            const url = new URL(raw);
            const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '');
            const playlistId = url.searchParams.get('list');
            let videoId = url.searchParams.get('v');

            if (host === 'youtu.be') {
                videoId = url.pathname.split('/').filter(Boolean)[0] || videoId;
            } else {
                const segments = url.pathname.split('/').filter(Boolean);
                const marker = segments.findIndex((segment) => ['embed', 'shorts', 'live'].includes(segment));
                if (marker >= 0) videoId = segments[marker + 1] || videoId;
            }

            const cleanId = (value) => /^[a-zA-Z0-9_-]{6,64}$/.test(String(value || '')) ? String(value) : '';
            const parsed = {
                videoId: cleanId(videoId),
                playlistId: cleanId(playlistId),
            };

            return parsed.videoId || parsed.playlistId ? parsed : null;
        } catch (_) {
            const directId = raw.match(/^[a-zA-Z0-9_-]{11}$/)?.[0];
            return directId ? { videoId: directId, playlistId: '' } : null;
        }
    }

    function normalizeTrack(track) {
        if (!track || typeof track !== 'object') return null;
        const source = String(track.source || track.url || '').trim();
        if (!source) return null;

        let type = String(track.type || 'auto').toLowerCase();
        if (type === 'auto') {
            if (/youtu(?:\.be|be\.com)/i.test(source)) type = 'youtube';
            else if (/^https?:\/\//i.test(source)) type = 'direct';
            else type = 'local';
        }

        if (!['youtube', 'direct', 'local'].includes(type)) return null;
        return {
            type,
            source,
            title: String(track.title || 'Música do servidor'),
        };
    }

    function setupMusic() {
        if (config.music.enabled === false) return;

        const rawTracks = Array.isArray(config.music.tracks) ? config.music.tracks : [];
        tracksQueue = rawTracks.map(normalizeTrack).filter(Boolean);

        // Compatibilidade com configurações antigas que usavam youtubeUrl/title.
        if (!tracksQueue.length && config.music.youtubeUrl) {
            tracksQueue.push(normalizeTrack({
                type: 'youtube',
                source: config.music.youtubeUrl,
                title: config.music.title || 'Música do servidor',
            }));
        }

        if (!tracksQueue.length) {
            console.warn('[Phoenix Loadscreen] Nenhuma música válida foi configurada.');
            return;
        }

        if (String(config.music.selection || 'first').toLowerCase() === 'random') {
            tracksQueue.sort(() => Math.random() - 0.5);
        }

        musicWidget.hidden = config.music.showControl === false;
        updateMusicUi(false, 'CARREGANDO MÚSICA');
        musicToggle.addEventListener('click', toggleMusic);
        htmlAudioPlayer.volume = safeNumber(config.music.volume, 22, 0, 100) / 100;
        htmlAudioPlayer.loop = config.music.loop !== false;
        htmlAudioPlayer.addEventListener('play', () => {
            musicReady = true;
            musicFailed = false;
            updateMusicUi(true, 'TOCANDO AGORA');
        });
        htmlAudioPlayer.addEventListener('pause', () => {
            if (!htmlAudioPlayer.ended) updateMusicUi(false, 'MÚSICA PAUSADA');
        });
        htmlAudioPlayer.addEventListener('ended', () => {
            if (config.music.loop === false) tryNextTrack('FAIXA FINALIZADA');
        });
        htmlAudioPlayer.addEventListener('error', () => tryNextTrack('ÁUDIO INDISPONÍVEL'));

        tryTrack(0);
    }

    function tryTrack(index) {
        if (index >= tracksQueue.length) {
            markMusicUnavailable('TODAS AS FONTES FALHARAM');
            return;
        }

        activeTrackIndex = index;
        const track = tracksQueue[index];
        activeTrackType = track.type;
        musicTitle.textContent = track.title;
        musicFailed = false;
        musicReady = false;
        updateMusicUi(false, 'CARREGANDO MÚSICA');

        stopCurrentMusic();

        if (track.type === 'youtube') {
            const media = parseYouTubeUrl(track.source);
            if (!media) {
                tryNextTrack('LINK DO YOUTUBE INVÁLIDO');
                return;
            }
            setupYouTubeTrack(media);
            return;
        }

        setupHtmlAudioTrack(track);
    }

    function setupHtmlAudioTrack(track) {
        activeTrackType = track.type;
        htmlAudioPlayer.src = track.source;
        htmlAudioPlayer.currentTime = 0;
        htmlAudioPlayer.load();

        const start = safeNumber(config.music.startSeconds, 0, 0, 86400);
        const beginPlayback = () => {
            if (start > 0 && Number.isFinite(htmlAudioPlayer.duration)) {
                htmlAudioPlayer.currentTime = Math.min(start, Math.max(0, htmlAudioPlayer.duration - 0.1));
            }
            musicReady = true;
            if (config.music.autoplay !== false) {
                htmlAudioPlayer.play().catch(() => updateMusicUi(false, 'CLIQUE PARA TOCAR'));
            } else {
                updateMusicUi(false, 'MÚSICA PAUSADA');
            }
        };

        htmlAudioPlayer.addEventListener('canplay', beginPlayback, { once: true });
        window.setTimeout(() => {
            if (!musicReady && activeTrackType !== 'youtube') tryNextTrack('TEMPO ESGOTADO');
        }, 12000);
    }

    function setupYouTubeTrack(media) {
        window.onYouTubeIframeAPIReady = () => createYouTubePlayer(media);

        if (window.YT?.Player) {
            createYouTubePlayer(media);
            return;
        }

        const api = document.createElement('script');
        api.src = 'https://www.youtube.com/iframe_api';
        api.async = true;
        api.onerror = () => tryNextTrack('YOUTUBE INDISPONÍVEL');
        document.head.appendChild(api);

        window.setTimeout(() => {
            if (!musicReady && !musicFailed && activeTrackType === 'youtube') tryNextTrack('YOUTUBE NÃO RESPONDEU');
        }, 10000);
    }

    function createYouTubePlayer(media) {
        if (!window.YT?.Player || activeTrackType !== 'youtube') return;

        if (musicPlayer?.destroy) {
            try { musicPlayer.destroy(); } catch (_) {}
            musicPlayer = null;
        }

        const playerVars = {
            autoplay: config.music.autoplay === false ? 0 : 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            origin: 'https://www.youtube.com',
            widget_referrer: String(config.music.widgetReferrer || 'https://www.youtube.com/'),
            start: Math.round(safeNumber(config.music.startSeconds, 0, 0, 86400)),
        };

        if (media.playlistId && !media.videoId) {
            playerVars.listType = 'playlist';
            playerVars.list = media.playlistId;
            playerVars.loop = config.music.loop === false ? 0 : 1;
        } else if (config.music.loop !== false && media.videoId) {
            playerVars.loop = 1;
            playerVars.playlist = media.videoId;
        }

        try {
            musicPlayer = new window.YT.Player('youtubePlayer', {
                width: '1',
                height: '1',
                videoId: media.videoId || undefined,
                host: 'https://www.youtube-nocookie.com',
                playerVars,
                events: {
                    onReady: onMusicReady,
                    onStateChange: onMusicStateChange,
                    onAutoplayBlocked: () => updateMusicUi(false, 'CLIQUE PARA TOCAR'),
                    onError: (event) => {
                        console.warn('[Phoenix Loadscreen] YouTube error:', event?.data);
                        tryNextTrack('YOUTUBE BLOQUEOU A FAIXA');
                    },
                },
            });
        } catch (error) {
            console.warn('[Phoenix Loadscreen] Falha ao iniciar YouTube:', error);
            tryNextTrack('YOUTUBE INDISPONÍVEL');
        }
    }

    function onMusicReady(event) {
        musicReady = true;
        musicFailed = false;
        event.target.setVolume(Math.round(safeNumber(config.music.volume, 22, 0, 100)));

        if (config.music.autoplay !== false) {
            event.target.unMute();
            event.target.playVideo();
        } else {
            updateMusicUi(false, 'MÚSICA PAUSADA');
        }
    }

    function onMusicStateChange(event) {
        const state = window.YT?.PlayerState;
        if (!state) return;

        if (event.data === state.PLAYING) {
            musicPlaying = true;
            updateMusicUi(true, 'TOCANDO AGORA');
        } else if (event.data === state.PAUSED || event.data === state.CUED) {
            musicPlaying = false;
            updateMusicUi(false, 'MÚSICA PAUSADA');
        } else if (event.data === state.ENDED) {
            if (config.music.loop !== false) {
                event.target.seekTo(safeNumber(config.music.startSeconds, 0, 0, 86400), true);
                event.target.playVideo();
            } else {
                tryNextTrack('FAIXA FINALIZADA');
            }
        }
    }

    function stopCurrentMusic() {
        if (musicPlayer) {
            try { musicPlayer.stopVideo(); } catch (_) {}
            try { musicPlayer.destroy(); } catch (_) {}
            musicPlayer = null;
        }
        htmlAudioPlayer.pause();
        htmlAudioPlayer.removeAttribute('src');
        htmlAudioPlayer.load();
        musicPlaying = false;
    }

    function tryNextTrack(reason) {
        console.warn(`[Phoenix Loadscreen] ${reason}. Tentando próxima fonte.`);
        stopCurrentMusic();
        window.setTimeout(() => tryTrack(activeTrackIndex + 1), 250);
    }

    function toggleMusic() {
        if (activeTrackType === 'youtube') {
            if (!musicPlayer || !musicReady) {
                musicStatus.textContent = 'AGUARDANDO YOUTUBE';
                return;
            }

            try {
                if (musicPlaying) {
                    musicPlayer.pauseVideo();
                } else {
                    musicPlayer.unMute();
                    musicPlayer.setVolume(Math.round(safeNumber(config.music.volume, 22, 0, 100)));
                    musicPlayer.playVideo();
                }
            } catch (error) {
                console.warn('[Phoenix Loadscreen] Não foi possível alternar o YouTube:', error);
            }
            return;
        }

        if (!htmlAudioPlayer.src) {
            musicStatus.textContent = 'ÁUDIO NÃO CARREGADO';
            return;
        }

        if (htmlAudioPlayer.paused) {
            htmlAudioPlayer.play().catch(() => updateMusicUi(false, 'ÁUDIO BLOQUEADO'));
        } else {
            htmlAudioPlayer.pause();
        }
    }

    function updateMusicUi(isPlaying, status) {
        musicPlaying = isPlaying;
        musicIcon.innerHTML = isPlaying ? icons.volume : icons.muted;
        musicStatus.textContent = status;
        musicToggle.classList.toggle('is-playing', isPlaying);
        musicToggle.setAttribute('aria-label', isPlaying ? 'Pausar música' : 'Tocar música');
        musicToggle.title = isPlaying ? 'Pausar música' : 'Tocar música';
    }

    function markMusicUnavailable(status) {
        musicFailed = true;
        musicReady = false;
        updateMusicUi(false, status);
        musicToggle.disabled = true;
    }

    function cleanAssetName(raw) {
        let value = String(raw || '').trim();
        if (!value) return config.fallbackAssetName;

        value = value.replace(/\\/g, '/');
        value = value.replace(/^.*?resources\//i, '');
        value = value.replace(/^.*?cache\/files\//i, '');
        value = value.replace(/^https?:\/\/[^/]+\//i, '');
        value = value.replace(/["'<>]/g, '');
        value = value.replace(/^\/+|\/+$/g, '');

        const fileLike = value.match(/[\w@.\-\[\]()+]+(?:\/[\w@.\-\[\]()+]+)*\.[a-z0-9]{2,8}/i);
        if (fileLike) value = fileLike[0];

        if (value.length > 96) value = `.../${value.slice(-90)}`;
        return value || config.fallbackAssetName;
    }

    function setAsset(raw) {
        const name = cleanAssetName(raw);
        if (!name || name === lastAsset) return;
        lastAsset = name;
        const prefix = String(config.pathPrefix || defaults.pathPrefix).replace(/\/+$/g, '');
        assetPath.textContent = `${prefix}/${name}`;
    }

    function assetFromLog(message) {
        const text = String(message || '');
        const candidates = [
            /(?:loading|mounting|mounted|download(?:ing)?|started resource|initializing)\s+[:\-]?\s*([^\s]+)/i,
            /([\w@.\-\[\]()+]+\/[\w@.\-\[\]()+/]+\.[a-z0-9]{2,8})/i,
            /resource\s+([\w@.\-\[\]()+]+)/i,
        ];

        for (const expression of candidates) {
            const match = text.match(expression);
            if (match?.[1]) return match[1];
        }
        return '';
    }

    function setTargetProgress(value) {
        const normalized = Math.min(1, Math.max(0, Number(value) || 0));
        targetProgress = Math.max(targetProgress, normalized);
    }

    function renderProgress() {
        const delta = targetProgress - renderedProgress;
        renderedProgress += Math.abs(delta) < .0005 ? delta : delta * .09;
        const percentage = Math.min(100, Math.max(0, renderedProgress * 100));
        const width = `${percentage.toFixed(3)}%`;
        progressBar.style.width = width;
        progressGlow.style.width = width;
        loadingPercent.textContent = `${Math.round(percentage)}%`;
        requestAnimationFrame(renderProgress);
    }

    function closeScreen() {
        if (closing) return;
        closing = true;
        setTargetProgress(1);
        loadingTitle.textContent = 'FINALIZANDO';
        setAsset('conexao_concluida');

        try {
            musicPlayer?.fadeOut;
            musicPlayer?.pauseVideo?.();
        } catch (_) {
            // O NUI será encerrado logo em seguida.
        }

        window.setTimeout(() => loadscreen.classList.add('is-leaving'), 140);
    }

    function handleMessage(data) {
        if (!data || typeof data !== 'object') return;

        switch (data.eventName) {
            case 'loadProgress':
                setTargetProgress(data.loadFraction);
                break;
            case 'onDataFileEntry':
                setAsset(data.name);
                break;
            case 'onLogLine': {
                const asset = assetFromLog(data.message);
                if (asset) setAsset(asset);
                break;
            }
            case 'initFunctionInvoking':
            case 'startInitFunction':
            case 'startInitFunctionOrder':
                setAsset(data.name || data.type || data.idx || 'inicializando_recursos');
                break;
            case 'performMapLoadFunction':
                setAsset(`mapa_${data.idx ?? 'carregando'}`);
                break;
            case 'closeLoadingScreen':
                closeScreen();
                break;
            default:
                break;
        }
    }

    window.addEventListener('message', (event) => handleMessage(event.data));

    // Preview automático ao abrir o index.html fora do FiveM.
    function runBrowserPreview() {
        if (window.nuiHandoverData || typeof window.invokeNative === 'function') return;

        const samples = [
            'vehicles/phoenix_police.yft',
            'maps/phoenix_city.ymap',
            'clothing/mp_m_freemode_01.ydr',
            'sounds/phoenix_sirens.awc',
            'scripts/qbx_core.lua',
        ];
        let index = 0;
        const timer = window.setInterval(() => {
            targetProgress = Math.min(.94, targetProgress + .035 + Math.random() * .035);
            setAsset(samples[index++ % samples.length]);
            if (targetProgress >= .94) window.clearInterval(timer);
        }, 850);
    }

    applyConfig();
    renderProgress();
    runBrowserPreview();
})();

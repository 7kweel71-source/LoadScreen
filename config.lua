Config = {}

-- Identidade visual
Config.Brand = 'phoenix'
Config.AccentColor = GetConvar('mri:color', '#ff0062')
Config.LoadingTitle = 'BAIXANDO'
Config.PathPrefix = 'phoenix/assets'
Config.FallbackAssetName = 'nomedomod'
Config.ShowPercentage = false

-- Links dos botões no canto superior direito.
-- Troque pelos links oficiais da sua cidade.
Config.Socials = {
    {
        id = 'discord',
        label = 'Discord',
        url = 'https://discord.gg/SEU_CONVITE',
        highlighted = true,
    },
    {
        id = 'youtube',
        label = 'YouTube',
        url = 'https://youtube.com/@SEU_CANAL',
        highlighted = false,
    },
    {
        id = 'instagram',
        label = 'Instagram',
        url = 'https://instagram.com/SEU_PERFIL',
        highlighted = false,
    },
}

-- Música local (opção mais estável para FiveM).
-- Para trocar a música, substitua o arquivo:
--   html/assets/audio/loading.mp3
-- Mantenha o mesmo nome para não precisar alterar nenhuma linha do código.
Config.Music = {
    enabled = true,
    autoplay = true,
    loop = true,
    volume = 15, -- 0 a 100
    showControl = true,
    startSeconds = 0,
    selection = 'first',

    tracks = {
        {
            type = 'local',
            source = 'assets/audio/loading.mp3',
            title = 'VEIGH - Artista Genérico',
        },
    },
}

-- Animações da imagem. Valores baixos deixam o efeito natural e leve.
Config.Animation = {
    enabled = true,
    zoomScale = 1.020,
    zoomDuration = 16,
    palmSwayDegrees = 0.38,
    headMovementPixels = 1.6,
    brandFloatPixels = 4,
    brandDuration = 5.8,
}

-- Fechamento suave após o QBOX informar que o personagem terminou de carregar.
Config.CloseDelay = 900

-- Em caso de recurso de spawn externo que não emita o evento do QBOX,
-- o evento universal playerSpawned também fecha a tela.
Config.CloseOnPlayerSpawned = true

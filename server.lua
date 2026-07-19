-- Remove o indicador/mensagem padrão "Loading game (...)" do canto inferior direito.
-- O comando é aplicado automaticamente quando o recurso inicia.
ExecuteCommand('setr sv_showBusySpinnerOnLoadingScreen false')

local function buildHandoverConfig()
    return {
        brand = Config.Brand,
        accentColor = Config.AccentColor,
        loadingTitle = Config.LoadingTitle,
        pathPrefix = Config.PathPrefix,
        fallbackAssetName = Config.FallbackAssetName,
        showPercentage = Config.ShowPercentage,
        socials = Config.Socials,
        music = Config.Music,
        animation = Config.Animation,
    }
end

AddEventHandler('playerConnecting', function(_, _, deferrals)
    deferrals.handover({
        phoenixLoadscreen = buildHandoverConfig(),
    })
end)

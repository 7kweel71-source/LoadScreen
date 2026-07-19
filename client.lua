local isClosing = false

local function closeLoadscreen()
    if isClosing then return end
    isClosing = true

    SendLoadingScreenMessage(json.encode({
        eventName = 'closeLoadingScreen'
    }))

    Wait(Config.CloseDelay or 900)
    ShutdownLoadingScreenNui()
end

-- Evento oficial de carregamento de personagem mantido pelo QBOX.
AddEventHandler('QBCore:Client:OnPlayerLoaded', closeLoadscreen)

-- Compatibilidade com recursos de spawn que disparam o evento universal.
if Config.CloseOnPlayerSpawned then
    AddEventHandler('playerSpawned', closeLoadscreen)
end

-- Export para integrações de multichar/spawn personalizadas.
exports('closeLoadscreen', closeLoadscreen)

-- Evento opcional para outros recursos locais.
RegisterNetEvent('mri_Qloadscreen:client:close', closeLoadscreen)

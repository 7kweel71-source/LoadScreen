# mri_Qloadscreen — Phoenix v3.4.0

Loadscreen animado para FiveM/QBOX com música MP3 local.

## Instalação

1. Coloque a pasta `mri_Qloadscreen` em `resources/[standalone]/`.
2. Adicione ao `server.cfg`:

```cfg
ensure mri_Qloadscreen
setr sv_showBusySpinnerOnLoadingScreen false
```

## Música

O pacote já acompanha uma música ambiente original e pronta para uso em:

```text
html/assets/audio/loading.mp3
```

Para trocar a música, substitua esse arquivo por outro MP3 mantendo exatamente o nome `loading.mp3`. Não é necessário editar HTML ou JavaScript.

A configuração de volume fica em `config.lua`:

```lua
Config.Music = {
    enabled = true,
    autoplay = true,
    loop = true,
    volume = 22,
    showControl = true,
    startSeconds = 0,
    selection = 'first',
    tracks = {
        {
            type = 'local',
            source = 'assets/audio/loading.mp3',
            title = 'Phoenix — Ambient Loading',
        },
    },
}
```

## Personalização

Links sociais, nome, cor, textos e intensidade das animações ficam centralizados em `config.lua`.

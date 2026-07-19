fx_version 'cerulean'
game 'gta5'

lua54 'yes'

author 'Phoenix Roleplay / MRI QBox Brasil'
description 'Phoenix animated QBOX loading screen'
version '3.4.0'

loadscreen 'html/index.html'
loadscreen_cursor 'yes'
loadscreen_manual_shutdown 'yes'

shared_script 'config.lua'
server_script 'server.lua'
client_script 'client.lua'

files {
    'html/index.html',
    'html/assets/*.css',
    'html/assets/*.js',
    'html/assets/*.jpg',
    'html/assets/*.png',
    'html/assets/*.webp',
    'html/assets/audio/*'
}

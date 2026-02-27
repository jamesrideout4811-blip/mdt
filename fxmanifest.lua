fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'westhaven_mdt'
author 'Westhaven District'
description 'Unified Police/EMS/DOJ MDT with cross-framework and configurable prisons'
version '1.0.0'

ui_page 'web/index.html'

files {
    'web/index.html',
    'web/assets/*.css',
    'web/assets/*.js',
    'web/assets/*.*'
}

shared_scripts {
    'config/config.lua',
    'shared/framework.lua'
}

client_scripts {
    'client/main.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/adapters/*.lua',
    'server/main.lua'
}

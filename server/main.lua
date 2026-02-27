local tables = Config.Database

local function ensureTables()
    MySQL.query(([[
        CREATE TABLE IF NOT EXISTS `%s` (
            id INT AUTO_INCREMENT PRIMARY KEY,
            author VARCHAR(80) NOT NULL,
            title VARCHAR(255) NOT NULL,
            body LONGTEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ]]):format(tables.reports))

    MySQL.query(([[
        CREATE TABLE IF NOT EXISTS `%s` (
            id INT AUTO_INCREMENT PRIMARY KEY,
            author VARCHAR(80) NOT NULL,
            title VARCHAR(255) NOT NULL,
            body LONGTEXT NOT NULL,
            officers JSON NULL,
            suspects JSON NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ]]):format(tables.incidents))

    MySQL.query(([[
        CREATE TABLE IF NOT EXISTS `%s` (
            id INT AUTO_INCREMENT PRIMARY KEY,
            author VARCHAR(80) NOT NULL,
            title VARCHAR(255) NOT NULL,
            body LONGTEXT NOT NULL,
            priority VARCHAR(32) DEFAULT 'normal',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ]]):format(tables.bulletins))

    MySQL.query(([[
        CREATE TABLE IF NOT EXISTS `%s` (
            id INT AUTO_INCREMENT PRIMARY KEY,
            author VARCHAR(80) NOT NULL,
            plate VARCHAR(32) NOT NULL,
            note LONGTEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ]]):format(tables.dovs))

    MySQL.query(([[
        CREATE TABLE IF NOT EXISTS `%s` (
            id INT AUTO_INCREMENT PRIMARY KEY,
            owner_cid VARCHAR(80) NOT NULL,
            plate VARCHAR(32) NOT NULL,
            category VARCHAR(32) NOT NULL,
            fee INT NOT NULL,
            registered_by VARCHAR(80) NOT NULL,
            issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NULL
        )
    ]]):format(tables.registrations))
end

CreateThread(function()
    Wait(500)
    ensureTables()
end)

local function getProfile(src)
    local c = Framework:GetCharacterBySource(src)
    return c, (c.firstname .. ' ' .. c.lastname)
end

local function getActiveWorkers()
    local workers = {}
    for _, src in ipairs(GetPlayers()) do
        local c = Framework:GetCharacterBySource(tonumber(src))
        if c and Config.Jobs[c.job] then
            workers[#workers + 1] = {
                source = tonumber(src),
                name = (c.firstname .. ' ' .. c.lastname),
                job = c.job,
                grade = c.grade
            }
        end
    end
    return workers
end

RegisterNetEvent('westhaven_mdt:server:getBootstrap', function()
    local src = source
    local _, fullName = getProfile(src)

    local payload = {
        user = fullName,
        framework = Framework.name,
        jobs = Config.Jobs,
        workers = getActiveWorkers(),
        logo = Config.BackgroundLogo,
        theme = Config.Theme,
        training = Config.Training
    }

    TriggerClientEvent('westhaven_mdt:client:bootstrap', src, payload)
end)

RegisterNetEvent('westhaven_mdt:server:createEntry', function(kind, data)
    local src = source
    local c, fullName = getProfile(src)
    if not c then return end

    if kind == 'report' then
        MySQL.insert(('INSERT INTO `%s` (author, title, body) VALUES (?, ?, ?)'):format(tables.reports), { fullName, data.title, data.body })
    elseif kind == 'incident' then
        MySQL.insert(('INSERT INTO `%s` (author, title, body, officers, suspects) VALUES (?, ?, ?, ?, ?)'):format(tables.incidents), {
            fullName,
            data.title,
            data.body,
            json.encode(data.officers or {}),
            json.encode(data.suspects or {})
        })

        if Config.Dispatch.autoDispatchOnIncident then
            DispatchAdapter:Send({
                title = data.title,
                message = data.body,
                code = data.code or '10-37',
                priority = data.priority or 'normal',
                jobs = data.jobs or { 'police', 'ambulance' },
                coords = data.coords,
                caller = fullName,
                source = src
            })
        end
    elseif kind == 'bulletin' then
        MySQL.insert(('INSERT INTO `%s` (author, title, body, priority) VALUES (?, ?, ?, ?)'):format(tables.bulletins), {
            fullName,
            data.title,
            data.body,
            data.priority or 'normal'
        })
    elseif kind == 'dov' then
        MySQL.insert(('INSERT INTO `%s` (author, plate, note) VALUES (?, ?, ?)'):format(tables.dovs), { fullName, data.plate, data.note })
    end

    TriggerClientEvent('westhaven_mdt:client:notify', src, ('%s saved successfully'):format(kind))
end)

RegisterNetEvent('westhaven_mdt:server:createRegistration', function(data)
    local src = source
    local c = Framework:GetCharacterBySource(src)
    if not c then return end

    local category = Config.Registration.categories[data.category]
    if not category then return end

    local fee = tonumber(data.fee) or category.fee
    local duration = tonumber(data.duration) or Config.Registration.defaultDurationDays

    MySQL.insert(('INSERT INTO `%s` (owner_cid, plate, category, fee, registered_by, expires_at) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))'):format(tables.registrations), {
        data.ownerCid,
        data.plate,
        data.category,
        fee,
        c.citizenId,
        duration
    })

    local target = tonumber(data.ownerSource)
    if target then
        BillingAdapter:ChargePlayer(target, fee, ('Vehicle Registration (%s)'):format(data.plate))
    end

    TriggerClientEvent('westhaven_mdt:client:notify', src, 'Registration created and fee charged.')
end)

RegisterNetEvent('westhaven_mdt:server:issueFine', function(data)
    local src = source
    local amount = tonumber(data.amount)
    local target = tonumber(data.target)
    if not amount or not target then return end

    local success = BillingAdapter:ChargePlayer(target, amount, data.reason)
    if success then
        TriggerClientEvent('westhaven_mdt:client:notify', src, 'Fine issued and deducted automatically.')
    end
end)

RegisterNetEvent('westhaven_mdt:server:jailPlayer', function(data)
    local src = source
    local time = tonumber(data.time)
    local target = tonumber(data.target)
    if not time or not target then return end

    local success = PrisonAdapter:SendToJail(target, time, data.reason or 'No reason')
    if success then
        TriggerClientEvent('westhaven_mdt:client:notify', src, 'Jail action sent to prison script.')
    end
end)

RegisterNetEvent('westhaven_mdt:server:sendDispatch', function(data)
    local src = source
    local c = Framework:GetCharacterBySource(src)
    if not c then return end

    local sent = DispatchAdapter:Send({
        title = data.title,
        message = data.message,
        code = data.code,
        priority = data.priority,
        jobs = data.jobs,
        coords = data.coords,
        target = data.target,
        caller = (c.firstname .. ' ' .. c.lastname),
        source = src
    })

    if sent then
        TriggerClientEvent('westhaven_mdt:client:notify', src, 'Dispatch alert sent.')
    end
end)


RegisterNetEvent('westhaven_mdt:server:getCorrectionsStatus', function()
    local src = source
    local c = Framework:GetCharacterBySource(src)
    if not c then return end

    local data = PrisonAdapter:GetCustodyStatus()
    TriggerClientEvent('westhaven_mdt:client:correctionsStatus', src, data)
end)

RegisterNetEvent('westhaven_mdt:server:assignCommunityService', function(data)
    local src = source
    local actions = tonumber(data.actions)
    local target = tonumber(data.target)
    if not actions or not target then return end

    local success = PrisonAdapter:AssignCommunityService(target, actions, data.reason or 'Community service sentence')
    if success then
        TriggerClientEvent('westhaven_mdt:client:notify', src, 'Community service sentence sent to prison script.')
    end
end)

RegisterNetEvent('westhaven_mdt:server:employmentAction', function(data)
    local src = source
    local c = Framework:GetCharacterBySource(src)
    if not c or not Config.Jobs[c.job] or not Config.Jobs[c.job].canHireFire then return end

    -- Cross-framework APIs vary heavily; this event is intentionally adapter-driven.
    -- Servers can override this by listening and canceling.
    TriggerEvent('westhaven_mdt:server:employmentAdapter', src, data)
    TriggerClientEvent('westhaven_mdt:client:notify', src, ('Employment action queued: %s'):format(data.action))
end)

lib = lib or {}

function lib.GetActiveWorkers()
    return getActiveWorkers()
end

exports('GetActiveWorkers', lib.GetActiveWorkers)

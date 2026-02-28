local tables = Config.Database
local callsigns = {}

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

    MySQL.query(([[
        CREATE TABLE IF NOT EXISTS `%s` (
            id INT AUTO_INCREMENT PRIMARY KEY,
            author VARCHAR(80) NOT NULL,
            subject_name VARCHAR(120) NOT NULL,
            subject_cid VARCHAR(80) NULL,
            license_type VARCHAR(32) NOT NULL,
            action VARCHAR(32) NOT NULL,
            reason VARCHAR(255) NOT NULL,
            notes LONGTEXT NULL,
            expires_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ]]):format(tables.licenseActions))
end

CreateThread(function()
    Wait(500)
    ensureTables()
end)

local function getProfile(src)
    local c = Framework:GetCharacterBySource(src)
    if not c then
        return nil, 'Unknown Unit'
    end

    local fullName = ((c.firstname or '') .. ' ' .. (c.lastname or '')):gsub('^%s+', ''):gsub('%s+$', '')
    if fullName == '' then
        fullName = c.citizenId or ('Unit%s'):format(src)
    end

    return c, fullName
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
                grade = c.grade,
                callsign = callsigns[tonumber(src)]
            }
        end
    end
    return workers
end

local function getOnlinePeople()
    local people = {}
    for _, src in ipairs(GetPlayers()) do
        local c = Framework:GetCharacterBySource(tonumber(src))
        if c then
            people[#people + 1] = {
                source = tonumber(src),
                citizenId = c.citizenId,
                name = (c.firstname .. ' ' .. c.lastname),
                job = c.job,
                grade = c.grade,
                callsign = callsigns[tonumber(src)]
            }
        end
    end
    return people
end

local function formatCaseAppendix(data)
    if type(data) ~= 'table' then
        return ''
    end

    local function mapList(items)
        local out = {}
        for _, item in ipairs(items or {}) do
            if type(item) == 'table' then
                out[#out + 1] = item.name or item.label or item.citizenId or 'Unknown'
            elseif type(item) == 'string' then
                out[#out + 1] = item
            end
        end
        return out
    end

    local criminals = mapList(data.criminals)
    local victims = mapList(data.victims)
    local officers = mapList(data.officers)

    local charges = {}
    for _, charge in ipairs(data.charges or {}) do
        if type(charge) == 'table' then
            charges[#charges + 1] = charge.label or charge.code or 'Unknown charge'
        elseif type(charge) == 'string' then
            charges[#charges + 1] = charge
        end
    end

    local sections = {}
    if #criminals > 0 then sections[#sections + 1] = ('Criminals Involved: %s'):format(table.concat(criminals, ', ')) end
    if #victims > 0 then sections[#sections + 1] = ('Victims Involved: %s'):format(table.concat(victims, ', ')) end
    if #officers > 0 then sections[#sections + 1] = ('Officers Involved: %s'):format(table.concat(officers, ', ')) end
    if #charges > 0 then sections[#sections + 1] = ('Charges: %s'):format(table.concat(charges, ', ')) end

    if #sections == 0 then
        return ''
    end

    return ('\n\n--- MDT Linked Parties ---\n%s'):format(table.concat(sections, '\n'))
end

local function getRecentLicenseActions()
    if not tables.licenseActions then
        return {}
    end

    local rows = MySQL.query.await(('SELECT id, author, subject_name, subject_cid, license_type, action, reason, notes, DATE_FORMAT(expires_at, '%Y-%m-%d') AS expires_at, created_at FROM `%s` ORDER BY created_at DESC LIMIT 25'):format(tables.licenseActions))
    return rows or {}
end


local function hasMdtAccess(src)
    local c = Framework:GetCharacterBySource(src)
    if not c or not c.job then return false end

    local playerJob = tostring(c.job):lower()
    for _, allowedJobs in pairs(Config.Access or {}) do
        for _, allowed in ipairs(allowedJobs or {}) do
            if playerJob == tostring(allowed):lower() then
                return true
            end
        end
    end

    return false
end

local function requireMdtAccess(src)
    if hasMdtAccess(src) then
        return true
    end

    TriggerClientEvent('westhaven_mdt:client:forceClose', src)
    TriggerClientEvent('westhaven_mdt:client:notify', src, 'You do not have MDT access.')
    return false
end

local function sendBootstrap(src)
    local c, fullName = getProfile(src)
    if not c then
        return false
    end

    local payload = {
        user = fullName,
        framework = Framework.name,
        jobs = Config.Jobs,
        workers = getActiveWorkers(),
        people = getOnlinePeople(),
        logo = Config.BackgroundLogo,
        theme = Config.Theme,
        training = Config.Training,
        licenseActions = getRecentLicenseActions(),
        callsign = callsigns[src]
    }

    TriggerClientEvent('westhaven_mdt:client:bootstrap', src, payload)
    return true
end


RegisterNetEvent('westhaven_mdt:server:setCallsign', function(data)
    local src = source
    if not requireMdtAccess(src) then return end

    local value = tostring((data and data.callsign) or ''):gsub('[^%w%-%s]', ''):sub(1, 24)
    if value == '' then
        callsigns[src] = nil
    else
        callsigns[src] = value
    end

    TriggerClientEvent('westhaven_mdt:client:notify', src, 'Call sign updated.')
    sendBootstrap(src)
end)

AddEventHandler('playerDropped', function()
    callsigns[source] = nil
end)

RegisterNetEvent('westhaven_mdt:server:requestOpen', function()
    local src = source
    if not requireMdtAccess(src) then return end

    if not sendBootstrap(src) then
        TriggerClientEvent('westhaven_mdt:client:forceClose', src)
        return
    end

    TriggerClientEvent('westhaven_mdt:client:setOpenState', src, true)
end)

RegisterNetEvent('westhaven_mdt:server:getBootstrap', function()
    local src = source
    if not requireMdtAccess(src) then return end
    sendBootstrap(src)
end)

RegisterNetEvent('westhaven_mdt:server:createEntry', function(kind, data)
    local src = source
    if not requireMdtAccess(src) then return end
    local c, fullName = getProfile(src)
    if not c then return end

    if kind == 'report' then
        local reportBody = (data.body or '') .. formatCaseAppendix(data)
        MySQL.insert(('INSERT INTO `%s` (author, title, body) VALUES (?, ?, ?)'):format(tables.reports), { fullName, data.title, reportBody })
    elseif kind == 'incident' then
        local incidentBody = (data.body or '') .. formatCaseAppendix(data)
        MySQL.insert(('INSERT INTO `%s` (author, title, body, officers, suspects) VALUES (?, ?, ?, ?, ?)'):format(tables.incidents), {
            fullName,
            data.title,
            incidentBody,
            json.encode(data.officers or {}),
            json.encode(data.suspects or data.criminals or {})
        })

        if Config.Dispatch.autoDispatchOnIncident then
            DispatchAdapter:Send({
                title = data.title,
                message = incidentBody,
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
    if not requireMdtAccess(src) then return end
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
    if not requireMdtAccess(src) then return end
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
    if not requireMdtAccess(src) then return end
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
    if not requireMdtAccess(src) then return end
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
    if not requireMdtAccess(src) then return end
    local c = Framework:GetCharacterBySource(src)
    if not c then return end

    local data = PrisonAdapter:GetCustodyStatus()
    TriggerClientEvent('westhaven_mdt:client:correctionsStatus', src, data)
end)


RegisterNetEvent('westhaven_mdt:server:getImpounds', function(filters)
    local src = source
    if not requireMdtAccess(src) then return end

    if not ImpoundAdapter or not ImpoundAdapter.GetImpounds then
        TriggerClientEvent('westhaven_mdt:client:notify', src, 'Impound adapter is not configured.')
        TriggerClientEvent('westhaven_mdt:client:impoundStatus', src, {})
        return
    end

    local data = ImpoundAdapter:GetImpounds(filters or {})
    TriggerClientEvent('westhaven_mdt:client:impoundStatus', src, data)
end)

RegisterNetEvent('westhaven_mdt:server:assignCommunityService', function(data)
    local src = source
    if not requireMdtAccess(src) then return end
    local actions = tonumber(data.actions)
    local target = tonumber(data.target)
    if not actions or not target then return end

    local success = PrisonAdapter:AssignCommunityService(target, actions, data.reason or 'Community service sentence')
    if success then
        TriggerClientEvent('westhaven_mdt:client:notify', src, 'Community service sentence sent to prison script.')
    end
end)

RegisterNetEvent('westhaven_mdt:server:createLicenseAction', function(data)
    local src = source
    if not requireMdtAccess(src) then return end
    local c, fullName = getProfile(src)
    if not c then return end

    local licenseType = tostring(data.licenseType or ''):lower()
    local action = tostring(data.actionType or ''):lower()
    if (licenseType ~= 'gun' and licenseType ~= 'vehicle') then return end
    if (action ~= 'disqualified' and action ~= 'revoked' and action ~= 'suspended' and action ~= 'cleared') then return end

    local subjectName = data.subjectName or 'Unknown'
    local subjectCid = data.subjectCid
    local reason = data.reason or 'No reason provided'
    local notes = data.notes or ''
    local expiresAt = (data.expiresAt and data.expiresAt ~= '') and (data.expiresAt .. ' 23:59:59') or nil

    MySQL.insert(('INSERT INTO `%s` (author, subject_name, subject_cid, license_type, action, reason, notes, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'):format(tables.licenseActions), {
        fullName,
        subjectName,
        subjectCid,
        licenseType,
        action,
        reason,
        notes,
        expiresAt
    })

    TriggerClientEvent('westhaven_mdt:client:notify', src, ('%s license %s saved for %s.'):format(licenseType, action, subjectName))
end)

RegisterNetEvent('westhaven_mdt:server:employmentAction', function(data)
    local src = source
    if not requireMdtAccess(src) then return end
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

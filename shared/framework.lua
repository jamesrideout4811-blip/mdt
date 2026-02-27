Framework = {
    name = 'standalone',
    object = nil
}

local function detectFramework()
    if Config.Framework ~= 'auto' then
        return Config.Framework
    end

    if GetResourceState('qbx_core') == 'started' then
        return 'qbox'
    end

    if GetResourceState('qb-core') == 'started' then
        return 'qbcore'
    end

    if GetResourceState('es_extended') == 'started' then
        return 'esx'
    end

    return 'standalone'
end

CreateThread(function()
    Framework.name = detectFramework()

    if Framework.name == 'esx' then
        Framework.object = exports['es_extended']:getSharedObject()
    elseif Framework.name == 'qbcore' then
        Framework.object = exports['qb-core']:GetCoreObject()
    elseif Framework.name == 'qbox' then
        Framework.object = exports.qbx_core:GetCoreObject()
    end

    print(('[Westhaven MDT] Framework detected: %s'):format(Framework.name))
end)

function Framework:GetCharacterBySource(src)
    if self.name == 'esx' then
        local xPlayer = self.object.GetPlayerFromId(src)
        if not xPlayer then return nil end
        return {
            source = src,
            citizenId = xPlayer.identifier,
            firstname = xPlayer.getName(),
            lastname = '',
            job = xPlayer.getJob().name,
            grade = xPlayer.getJob().grade
        }
    elseif self.name == 'qbcore' or self.name == 'qbox' then
        local player = self.object.Functions.GetPlayer(src)
        if not player then return nil end
        local p = player.PlayerData
        return {
            source = src,
            citizenId = p.citizenid,
            firstname = p.charinfo.firstname,
            lastname = p.charinfo.lastname,
            job = p.job.name,
            grade = p.job.grade.level
        }
    end

    return {
        source = src,
        citizenId = ('standalone_%s'):format(src),
        firstname = ('Unit%s'):format(src),
        lastname = '',
        job = 'police',
        grade = 99
    }
end

function Framework:RemoveMoney(src, amount, reason)
    if amount <= 0 then return true end

    if self.name == 'esx' then
        local xPlayer = self.object.GetPlayerFromId(src)
        if not xPlayer then return false end
        xPlayer.removeAccountMoney('bank', amount, reason)
        return true
    elseif self.name == 'qbcore' or self.name == 'qbox' then
        local player = self.object.Functions.GetPlayer(src)
        if not player then return false end
        return player.Functions.RemoveMoney('bank', amount, reason)
    end

    return true
end

function Framework:AddMoney(src, amount, reason)
    if amount <= 0 then return true end

    if self.name == 'esx' then
        local xPlayer = self.object.GetPlayerFromId(src)
        if not xPlayer then return false end
        xPlayer.addAccountMoney('bank', amount, reason)
        return true
    elseif self.name == 'qbcore' or self.name == 'qbox' then
        local player = self.object.Functions.GetPlayer(src)
        if not player then return false end
        return player.Functions.AddMoney('bank', amount, reason)
    end

    return true
end

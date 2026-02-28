local isOpen = false

local function setMdtState(state)
    isOpen = state
    SetNuiFocus(state, state)
    SendNUIMessage({
        action = 'toggle',
        state = state
    })
end

local function toggleMdt()
    if isOpen then
        setMdtState(false)
        return
    end

    TriggerServerEvent('westhaven_mdt:server:requestOpen')
end

RegisterCommand(Config.MDTCommand, toggleMdt, false)

for _, alias in ipairs(Config.MDTCommandAliases or {}) do
    if alias ~= Config.MDTCommand then
        RegisterCommand(alias, toggleMdt, false)
    end
end

RegisterNUICallback('close', function(_, cb)
    setMdtState(false)
    cb({ ok = true })
end)

RegisterNUICallback('createEntry', function(data, cb)
    TriggerServerEvent('westhaven_mdt:server:createEntry', data.kind, data.payload)
    cb({ ok = true })
end)

RegisterNUICallback('createRegistration', function(data, cb)
    TriggerServerEvent('westhaven_mdt:server:createRegistration', data)
    cb({ ok = true })
end)

RegisterNUICallback('issueFine', function(data, cb)
    TriggerServerEvent('westhaven_mdt:server:issueFine', data)
    cb({ ok = true })
end)

RegisterNUICallback('jailPlayer', function(data, cb)
    TriggerServerEvent('westhaven_mdt:server:jailPlayer', data)
    cb({ ok = true })
end)

RegisterNUICallback('employmentAction', function(data, cb)
    TriggerServerEvent('westhaven_mdt:server:employmentAction', data)
    cb({ ok = true })
end)


RegisterNUICallback('sendDispatch', function(data, cb)
    TriggerServerEvent('westhaven_mdt:server:sendDispatch', data)
    cb({ ok = true })
end)


RegisterNUICallback('getCorrectionsStatus', function(_, cb)
    TriggerServerEvent('westhaven_mdt:server:getCorrectionsStatus')
    cb({ ok = true })
end)

RegisterNUICallback('assignCommunityService', function(data, cb)
    TriggerServerEvent('westhaven_mdt:server:assignCommunityService', data)
    cb({ ok = true })
end)

RegisterNUICallback('getImpounds', function(data, cb)
    TriggerServerEvent('westhaven_mdt:server:getImpounds', data)
    cb({ ok = true })
end)

RegisterNUICallback('createLicenseAction', function(data, cb)
    TriggerServerEvent('westhaven_mdt:server:createLicenseAction', data)
    cb({ ok = true })
end)

RegisterNUICallback('refreshBootstrap', function(_, cb)
    TriggerServerEvent('westhaven_mdt:server:getBootstrap')
    cb({ ok = true })
end)


RegisterNetEvent('westhaven_mdt:client:setOpenState', function(state)
    setMdtState(state)
end)

RegisterNetEvent('westhaven_mdt:client:forceClose', function()
    if isOpen then
        setMdtState(false)
    end
end)

RegisterNetEvent('westhaven_mdt:client:bootstrap', function(payload)
    SendNUIMessage({ action = 'bootstrap', payload = payload })
end)

RegisterNetEvent('westhaven_mdt:client:notify', function(message)
    BeginTextCommandThefeedPost('STRING')
    AddTextComponentSubstringPlayerName(('[MDT] %s'):format(message))
    EndTextCommandThefeedPostTicker(false, false)
end)

RegisterNetEvent('westhaven_mdt:client:correctionsStatus', function(payload)
    SendNUIMessage({ action = 'correctionsStatus', payload = payload })
end)

RegisterNetEvent('westhaven_mdt:client:impoundStatus', function(payload)
    SendNUIMessage({ action = 'impoundStatus', payload = payload })
end)

local isOpen = false

RegisterCommand(Config.MDTCommand, function()
    isOpen = not isOpen
    SetNuiFocus(isOpen, isOpen)
    SendNUIMessage({
        action = 'toggle',
        state = isOpen
    })

    if isOpen then
        TriggerServerEvent('westhaven_mdt:server:getBootstrap')
    end
end, false)

RegisterNUICallback('close', function(_, cb)
    isOpen = false
    SetNuiFocus(false, false)
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

PrisonAdapter = {}

function PrisonAdapter:SendToJail(targetSrc, time, reason)
    local provider = Config.Prison.provider
    local adapter = Config.Prison.adapters[provider]

    if not adapter then
        print(('[Westhaven MDT] Missing prison adapter for %s'):format(provider))
        return false
    end

    TriggerEvent(adapter.event, targetSrc, time, reason)
    return true
end

function PrisonAdapter:AssignCommunityService(targetSrc, actions, reason)
    local provider = Config.Prison.provider
    local adapter = Config.Prison.adapters[provider]

    if not adapter or not adapter.communityServiceEvent then
        print(('[Westhaven MDT] Community service event not configured for %s'):format(provider))
        return false
    end

    TriggerEvent(adapter.communityServiceEvent, targetSrc, actions, reason)
    return true
end

function PrisonAdapter:GetCustodyStatus()
    local statusConfig = Config.Prison.status

    if statusConfig.mode == 'event' then
        TriggerEvent(statusConfig.event)
        return { jail = {}, service = {} }
    end

    local jail = MySQL.query.await(statusConfig.jailQuery) or {}
    local service = MySQL.query.await(statusConfig.serviceQuery) or {}

    return {
        jail = jail,
        service = service
    }
end

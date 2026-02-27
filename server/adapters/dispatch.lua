DispatchAdapter = {}

local function buildPayload(provider, data)
    local base = {
        title = data.title or 'MDT Dispatch',
        code = data.code or '10-00',
        message = data.message or data.title or 'No details provided',
        priority = data.priority or 'normal',
        jobs = data.jobs or { 'police' },
        coords = data.coords,
        source = data.source,
        caller = data.caller
    }

    if provider == 'ps_dispatch' then
        return {
            dispatchCode = base.code,
            firstStreet = data.street or 'Unknown St',
            priority = base.priority,
            origin = base.coords,
            dispatchMessage = base.message,
            job = base.jobs
        }
    elseif provider == 'cd_dispatch' then
        return {
            job_table = base.jobs,
            coords = base.coords,
            title = base.title,
            message = base.message,
            flash = base.priority == 'high',
            unique_id = ('mdt_%s'):format(os.time())
        }
    elseif provider == 'qs_dispatch' then
        return {
            job = base.jobs,
            callLocation = base.coords,
            callCode = { code = base.code, snippet = base.title },
            message = base.message,
            flashes = base.priority == 'high',
            image = data.image
        }
    end

    return base
end

function DispatchAdapter:Send(data)
    local provider = Config.Dispatch.provider
    local adapter = Config.Dispatch.adapters[provider]

    if not adapter then
        print(('[Westhaven MDT] Missing dispatch adapter for %s'):format(provider))
        return false
    end

    local payload = buildPayload(provider, data)

    if adapter.type == 'server_event' then
        TriggerEvent(adapter.event, payload)
    elseif adapter.type == 'client_event' then
        if data.target then
            TriggerClientEvent(adapter.event, data.target, payload)
        else
            TriggerClientEvent(adapter.event, -1, payload)
        end
    elseif adapter.type == 'export' and adapter.resource and adapter.export then
        exports[adapter.resource][adapter.export](payload)
    else
        print(('[Westhaven MDT] Invalid dispatch adapter type for %s'):format(provider))
        return false
    end

    return true
end

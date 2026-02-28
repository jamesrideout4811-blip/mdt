ImpoundAdapter = {}

local function toNumber(v)
    local n = tonumber(v)
    if n then return n end
    return nil
end

local function normalize(rows)
    local now = os.time()
    local out = {}

    for _, row in ipairs(rows or {}) do
        local remaining = toNumber(row.remaining_minutes or row.time_left or row.minutes_left)
        local releaseAt = toNumber(row.release_at_unix or row.release_unix)

        if not remaining and releaseAt then
            remaining = math.max(0, math.floor((releaseAt - now) / 60))
        end

        out[#out + 1] = {
            plate = row.plate or row.vehicle_plate or 'UNKNOWN',
            owner = row.owner or row.owner_name or row.owner_cid or 'Unknown',
            model = row.model or row.vehicle or row.vehicle_model or 'Unknown',
            impoundedAt = row.impounded_at or row.created_at or row.seized_at or 'Unknown',
            impoundedBy = row.impounded_by or row.officer or row.staff or 'Unknown',
            reason = row.reason or row.note or row.impound_reason or 'No reason provided',
            releaseFee = toNumber(row.release_fee or row.fee or row.price) or 0,
            remainingMinutes = remaining,
            lot = row.lot or row.impound_lot or row.garage or row.location or 'Impound'
        }
    end

    return out
end

local function applyFilters(rows, filters)
    local plateFilter = tostring(filters.plate or ''):lower()
    local ownerFilter = tostring(filters.owner or ''):lower()

    if plateFilter == '' and ownerFilter == '' then
        return rows
    end

    local filtered = {}
    for _, row in ipairs(rows) do
        local plate = tostring(row.plate or ''):lower()
        local owner = tostring(row.owner or ''):lower()

        local plateOk = (plateFilter == '') or plate:find(plateFilter, 1, true)
        local ownerOk = (ownerFilter == '') or owner:find(ownerFilter, 1, true)

        if plateOk and ownerOk then
            filtered[#filtered + 1] = row
        end
    end

    return filtered
end

function ImpoundAdapter:GetImpounds(filters)
    local impoundConfig = Config.Impound or {}
    local provider = impoundConfig.provider or 'custom'
    local adapters = impoundConfig.adapters or {}
    local adapter = adapters[provider]

    if not adapter then
        print(('[Westhaven MDT] Missing impound adapter for %s'):format(tostring(provider)))
        return {}
    end

    if adapter.type == 'sql' then
        local rows = MySQL.query.await(adapter.query) or {}
        return applyFilters(normalize(rows), filters or {})
    end

    if adapter.type == 'export' and adapter.resource and adapter.export then
        local rows = exports[adapter.resource][adapter.export](filters or {}) or {}
        return applyFilters(normalize(rows), filters or {})
    end

    if adapter.type == 'event' and adapter.event then
        TriggerEvent(adapter.event, filters or {})
        return {}
    end

    print(('[Westhaven MDT] Invalid impound adapter configuration for %s'):format(tostring(provider)))
    return {}
end

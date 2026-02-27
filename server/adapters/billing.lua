BillingAdapter = {}

function BillingAdapter:ChargePlayer(targetSrc, amount, reason)
    local ok = Framework:RemoveMoney(targetSrc, amount, reason or Config.Financial.defaultReason)
    return ok
end

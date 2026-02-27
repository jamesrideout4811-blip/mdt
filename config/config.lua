Config = {}

Config.Framework = 'auto' -- auto | esx | qbcore | qbox | standalone
Config.Locale = 'en'

Config.Jobs = {
    police = { label = 'Police', canHireFire = true },
    ambulance = { label = 'Ambulance', canHireFire = true },
    doj = { label = 'DOJ', canHireFire = true }
}

Config.Access = {
    police = { 'police' },
    ambulance = { 'ambulance' },
    doj = { 'doj', 'lawyer' }
}

Config.MDTCommand = 'mdt'
Config.BackgroundLogo = 'assets/westhaven-logo.svg'
Config.Theme = {
    primary = '#0f2f5a',
    accent = '#f4b400'
}

Config.Financial = {
    useBillingAccount = true,
    defaultReason = 'MDT fine/fee',
    sendNotification = true
}

Config.Registration = {
    defaultDurationDays = 30,
    categories = {
        car = { fee = 150 },
        bike = { fee = 80 },
        boat = { fee = 250 },
        heli = { fee = 2000 }
    }
}

Config.Prison = {
    provider = 'rcore_prison', -- custom | rcore_prison | qb_prison | esx_jail
    adapters = {
        custom = {
            event = 'westhaven:prison:jailPlayer'
        },
        rcore_prison = {
            event = 'rcore_prison:sendToPrison',
            communityServiceEvent = 'rcore_prison:assignCommunityService',
            expects = 'source,time,reason'
        },
        qb_prison = {
            event = 'prison:server:SendToPrison',
            expects = 'target,time'
        },
        esx_jail = {
            event = 'esx-qalle-jail:jailPlayer',
            expects = 'target,time,reason'
        }
    },
    status = {
        mode = 'sql', -- sql | event
        jailTable = 'rcore_prison',
        serviceTable = 'rcore_community_service',
        -- adjust the SQL statements below to match your exact RCORE schema
        jailQuery = 'SELECT identifier, remaining_time AS remaining, reason FROM rcore_prison',
        serviceQuery = 'SELECT identifier, remaining_actions AS remaining, reason FROM rcore_community_service',
        event = 'westhaven_mdt:server:rcoreStatus'
    }
}

Config.Dispatch = {
    provider = 'custom', -- custom | ps_dispatch | cd_dispatch | qs_dispatch
    autoDispatchOnIncident = true,
    adapters = {
        custom = {
            type = 'server_event',
            event = 'westhaven_mdt:server:dispatch'
        },
        ps_dispatch = {
            type = 'server_event',
            event = 'ps-dispatch:server:notify'
        },
        cd_dispatch = {
            type = 'server_event',
            event = 'cd_dispatch:AddNotification'
        },
        qs_dispatch = {
            type = 'server_event',
            event = 'qs-dispatch:server:CreateCall'
        }
    }
}

Config.Training = {
    enabled = true,
    modules = {
        {
            id = 'basic_patrol',
            title = 'Basic Patrol Training',
            tips = {
                'Always run radio check and bodycam activation at start of shift.',
                'Use contact/cover positioning for all unknown-risk interactions.',
                'Announce location, direction, and plate before initiating a stop.'
            }
        },
        {
            id = 'traffic_stops',
            title = 'Road Stops & Vehicle Contacts',
            tips = {
                'Offset your unit to create a safety corridor and stay visible.',
                'High-risk stops require felony stop procedures and backup staging.',
                'Do not approach until dispatch confirms registration and wants/warrants.'
            }
        },
        {
            id = 'crossfire',
            title = 'Crossfire & Ambush Survival',
            tips = {
                'Break contact and move to hard cover before returning fire.',
                'Communicate suspect count, weapon type, and officer condition immediately.',
                'Use tourniquet-first trauma sequence and request EMS/code-3 support.'
            }
        },
        {
            id = 'ciu',
            title = 'CIU (Criminal Investigations Unit) Tips',
            tips = {
                'Preserve scene integrity: one entry log, one evidence custodian.',
                'Build timeline with CCTV, witness sequence, and call metadata.',
                'Document chain-of-custody on every evidence transfer.'
            }
        },
        {
            id = 'swat',
            title = 'SWAT / Tactical Response Tips',
            tips = {
                'Set command, inner/outer perimeter, and medevac route before breach.',
                'Use clear sectors of fire and challenge/response IDs for all stacks.',
                'After-action debrief is mandatory with lessons logged in MDT report.'
            }
        }
    }
}

Config.Database = {
    reports = 'wh_mdt_reports',
    incidents = 'wh_mdt_incidents',
    bulletins = 'wh_mdt_bulletins',
    dovs = 'wh_mdt_dovs',
    registrations = 'wh_mdt_registrations'
}

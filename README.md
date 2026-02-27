# Westhaven Unified MDT

One resource for Police, Ambulance, and DOJ with cross-framework support:

- ESX
- QB-Core
- QBox
- Standalone fallback

## Features

- Unified command MDT UI (`/MDT`, plus configurable aliases)
- Reports / Incidents / Bulletins / DOVs / Registrations
- Gun + vehicle licensing actions (disqualifications, revocations, suspensions, reinstatements)
- Fines + jail sentencing from MDT
- RCORE prison integration for jail + community service sentencing
- RCORE custody feed tab to view who is jailed / in service and remaining time/actions
- PS-Dispatch compatible + generic adapter pattern for other dispatch scripts
- PD training guide tab with basic patrol, traffic stops, crossfire survival, CIU, and SWAT tips
- Hire / fire / promote / demote event pipeline
- Configurable theme + background logo

## Install

1. Put this folder in your `resources`.
2. Import `sql/schema.sql` (optional because tables auto-create if oxmysql is active).
3. Ensure dependency order:

```cfg
ensure oxmysql
ensure es_extended # or qb-core / qbx_core
ensure westhaven_mdt
```

4. Set your framework and integrations in `config/config.lua`.

## RCORE prison integration (jail + community service + status feed)

Default is already set to RCORE:

```lua
Config.Prison.provider = 'rcore_prison'
Config.Prison.adapters.rcore_prison.event = 'rcore_prison:sendToPrison'
Config.Prison.adapters.rcore_prison.communityServiceEvent = 'rcore_prison:assignCommunityService'
```

### Custody status source (for MDT RCORE Custody tab)

```lua
Config.Prison.status.mode = 'sql'
Config.Prison.status.jailQuery = 'SELECT identifier, remaining_time AS remaining, reason FROM rcore_prison'
Config.Prison.status.serviceQuery = 'SELECT identifier, remaining_actions AS remaining, reason FROM rcore_community_service'
```

> Important: table/column names vary by RCORE version. Update these queries to your exact schema so MDT can show remaining jail/service values correctly.

If you prefer event-based retrieval from your own integration bridge:

```lua
Config.Prison.status.mode = 'event'
Config.Prison.status.event = 'westhaven_mdt:server:rcoreStatus'
```

## Dispatch compatibility (PS Dispatch + others)

```lua
Config.Dispatch.provider = 'ps_dispatch'
Config.Dispatch.adapters.ps_dispatch.event = 'ps-dispatch:server:notify'
```

Supported providers shipped:

- `ps_dispatch`
- `cd_dispatch`
- `qs_dispatch`
- `custom`

For any other dispatch script, use `custom` and set:

- `type` = `server_event` / `client_event` / `export`
- event or export destination

## Officer training guide (built in)

`Config.Training.modules` includes preloaded modules for:

- Basic Patrol
- Road Stops / Vehicle Contacts
- Crossfire & Ambush Survival
- CIU
- SWAT

Edit/add modules in `config/config.lua` to match your SOP exactly.

## Employment integration

The resource emits `westhaven_mdt:server:employmentAdapter`.
Hook your own handler to map hire/fire/promote/demote into your exact job script.

## Logo background integration

Default logo file:

- `web/assets/westhaven-logo.svg`

To use your uploaded logo:

1. Convert your logo to `.png` or `.webp`.
2. Place it inside `web/assets/`.
3. Set `Config.BackgroundLogo` in `config/config.lua`.

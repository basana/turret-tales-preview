# MAP NAVI — Architecture rule: temporary POI navigation tasks

Status: approved project rule; implementation in progress on the Preview branch.

## Core principle
GPS is one shared source of the visitor's current position. The map's base task and the visitor's temporary active task are separate states. Searching for a pharmacy or toilet must temporarily take control of the map without deleting or overwriting the base task.

## Required behavior
1. When GPS starts, the current map establishes its base task (for example, the nearest market on the Christmas market map).
2. When the visitor activates Pharmacy or Toilet, suspend the base task and activate the selected POI as the temporary task.
3. Keep GPS running. Show the visitor and selected POI together in the viewport; draw a dashed connector between them and an orange 150 m radius circle around the POI.
4. Follow mode, when explicitly activated, recenters/fits both the current GPS position and selected POI. GPS updates must update the visitor marker and connector without allowing the base task to pull the camera away from the POI task.
5. Manual pan/zoom must not remove the selected POI, connector, or radius circle. Manual exploration may move the viewport; Follow restores the joint view.
6. Switching Pharmacy <-> Toilet replaces only the temporary task. The original base task remains suspended.
7. Closing/cancelling the temporary POI task removes its connector/radius and restores the base task using the latest GPS position (recalculate nearest market/target rather than restoring stale coordinates).
8. Stopping GPS clears the current-position-dependent line and follow behavior; it must not leave a false GPS-active state.

## Architecture constraints
- Do not create a second geolocation watcher for POIs.
- Do not overwrite the saved ship/departure state or other unrelated MAP NAVI state.
- Keep the POI layer separate from the base map markers.
- Keep baseTask and activeTask conceptually independent; implementation may use existing map state fields if that is safer than introducing a broad state refactor.
- This rule applies to the market map first. Reuse the same behavior on other maps only after checking their distinct GPS and map lifecycle logic.

## Acceptance checks
- Activate GPS on the market map: nearest market is the base task.
- Activate Toilet: nearest toilet, current position, dashed connector, and 150 m orange circle are visible.
- Pan/zoom: toilet marker and overlays remain on the map.
- Tap Follow: both visitor and toilet are fitted in the viewport.
- Switch to Pharmacy: pharmacy becomes active without losing the suspended nearest-market task.
- Cancel POI: nearest market is restored based on the latest GPS position.
- Confirm no duplicate GPS watchers and no regressions to My Ship/departure state.

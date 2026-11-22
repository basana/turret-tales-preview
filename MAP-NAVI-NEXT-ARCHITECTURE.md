# MAP NAVI — Next Interface Architecture

Status: approved direction, implementation target for Experimental Preview only.
Source repository: `basana/turret-tales-preview`
Working branch: `map-navi/map-viewport-counter-layout`
Production/main must not be changed.

## Product structure

MAP NAVI is one regional tourist navigator with three connected levels:

1. **Regional navigation** — Rhine/Moselle overview, towns, castles, passenger-ship berths, markets and practical places.
2. **Town page** — a reusable city/town experience built from the same map + expandable bottom-sheet shell.
3. **Place/story page** — an individual attraction or architectural story, with photographs, explanations and optional deeper layers (Storymarks).

The map remains the dominant visual surface. The bottom sheet is the shared content workspace, not a second unrelated interface.

## Shared map + bottom-sheet interaction

- Keep the established MAP NAVI visual identity and palette. Existing design anchors include burgundy `#7A1026`, parchment `#F5ECD6`, warm gold/brown borders and the current serif/sans typography. Do not introduce a new unrelated visual theme.
- Collapsed state: map remains almost full-screen; a compact bottom entry/carousel remains visible.
- Drag upward/downward to expand/collapse the same sheet. Expanded sheet can show complete content with photos and text.
- **At its fully expanded/top position, the sheet must span the entire screen width edge-to-edge. It must not look like a narrow floating card or retain distracting side gutters.**
- **Do not add an X/close button.** Use the vertical swipe gesture to collapse the sheet and return to the map; keep this interaction discoverable through natural behavior rather than a permanent close icon.
- Horizontal swipe is reserved for carousels inside the sheet; it must not be confused with vertical sheet dragging.
- Selecting a card/list item focuses the corresponding map location and opens/updates its content.
- Selecting a map marker opens/focuses the matching item in the sheet.
- Switching category replaces the sheet content. Content from one category must never leak into another.
- Map, GPS, zoom, search, location selection and sheet behavior must remain consistent across regional and town maps.
- Preserve safe-area handling and usable map controls in collapsed, open and expanded states.

## Regional navigator requirements

### My Ship
- Dedicated category, separate from Explore/markets.
- Saved ship/berth, return/departure time and countdown information.
- Back to ship action.
- Save/change ship location and a clearly accessible Delete my ship action.
- Deleting the saved ship must remove its map marker/layers and refresh the panel.
- Ship-only controls must not appear in market/town content.

### Explore / towns / markets
- Town cards remain a horizontal, swipeable carousel with photos.
- Selecting a town focuses its market/map locations; the town's market content is opened deliberately.
- Market carousels and market lists belong to Explore/town content, never to My Ship.

### Passenger-ship berths
- Show all relevant passenger-ship berths in Koblenz, not only one operator.
- Each berth is a real interactive list item, using the same interaction pattern as the market list: select item → focus/zoom map → show selected berth details.
- Display the operator/company clearly for every berth.
- One physical berth is one map point. Do not invent or guess coordinates; distinguish verified positions from entries awaiting verification.
- Current source code contains a static berth list rendered as non-interactive `div` elements. Replace it with data-backed interactive controls and verified map locators.

### Previous section
- Keep a separate, clearly visible **Previous: Middle Rhine Castles** button/action.
- It must not be hidden among carousel cards or confused with sheet open/close controls.

## Town pages

Each town page reuses the same shared map and bottom-sheet shell and preserves the same visual identity. Town-specific content is data, not a separately invented interface.

Suggested content areas:
- Town overview and history
- Attractions and points of interest
- Architecture and Storymarks
- Local stories and legends
- Walks/routes and viewpoints
- Practical information (toilets, pharmacies, transport, etc.)
- User's photographs, postcards and optional audio/video stories

The town page should support photo-led cards and longer expanded content. Selecting a photo, story or attraction must link to its exact map point where one exists. Do not fabricate locations or media.

## Implementation safeguards / audit findings

- Work only in the named Experimental Preview source branch and its established deployment workflow. Never change `main` or production.
- Before replacing the current prototype, audit event handlers, DOM ownership/reparenting, category visibility, CSS cascade and map layer cleanup.
- Current prototype already creates a floating sheet and moves the GPS panel, save-location button and town list into it.
- Current berth list is generated as static `div` elements with no selection handler or map coordinates; this explains why that list is not interactive in the current implementation.
- Current category switching is driven by `data-category` on both shortcuts and tabs. Keep category state explicit and ensure only the intended content view is visible.
- The sheet's visual style currently uses the established burgundy/parchment palette. Preserve it.
- Do not change Leaflet map center/zoom/bounds merely to create a visual sheet animation. Any map viewport adjustment must be separately justified and tested.
- Test on narrow iPhone portrait and tablet landscape, including collapsed/open/expanded sheet states.

## Acceptance checklist

- [ ] Main/production untouched; Preview deployment verified.
- [ ] Same recognizable MAP NAVI design and palette.
- [ ] Bottom sheet opens, expands, collapses and scrolls reliably.
- [ ] Fully expanded sheet covers the full screen width edge-to-edge.
- [ ] No X/close button; vertical swipe reliably collapses the sheet.
- [ ] Horizontal carousels work independently of vertical sheet dragging.
- [ ] My Ship, Back to ship, departure/return details and Delete my ship work.
- [ ] No market/town carousel appears in My Ship.
- [ ] Every listed berth is selectable and focuses its verified map point; operator is visible.
- [ ] Previous: Middle Rhine Castles is a separate working action.
- [ ] Town pages use the same shell and map interaction model.
- [ ] Map marker ↔ card/list selection stays synchronized.
- [ ] No stale markers, duplicate event handlers or hidden off-screen actions after category changes.

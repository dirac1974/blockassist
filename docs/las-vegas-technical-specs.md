# Las Vegas Feature Technical Specifications (v2.1)

## LV-001: Event-Based Matching
**Description**: Automatically increase assistant visibility and matching priority near major events.
**Technical Approach**:
- Integrate with external event APIs (Ticketmaster, Eventbrite, local casino calendars)
- Use geofencing around event venues
- Boost assistant scores within 2km radius during event windows
- Store event data in Supabase + cache on-chain hashes

## LV-002: Strip & Downtown Hot Zones
**Description**: Prioritize assistants in high-demand zones.
**Technical Approach**:
- Define dynamic hot zones (Las Vegas Strip, Downtown, Airport, Fremont Street)
- Real-time heat map using Redis + geospatial queries
- Weight assistant matching score based on current zone demand

## LV-003: Real-time Event Integration
**Description**: Pull live event data to adjust matching.
**Technical Approach**:
- Use Eventbrite + Ticketmaster APIs
- Webhook listener for new events
- Auto-create matching rules 48 hours before events

## LV-004: Tourist Mode
**Description**: Special experience for visitors.
**Technical Approach**:
- Onboarding flow with language selection (EN, ES, ZH)
- Pre-loaded popular destinations (Strip, Grand Canyon tours, shows)
- Integrated tipping guide and local etiquette tips

## LV-005: Late-Night / Nightlife Focus
**Description**: Enhanced support for 10pm–5am deliveries.
**Technical Approach**:
- Night mode UI toggle
- Higher assistant availability scoring after 10pm
- Safety features (route sharing, check-in prompts)
- Integration with 24-hour venues (casinos, late-night restaurants)
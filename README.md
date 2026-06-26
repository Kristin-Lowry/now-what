# Now What?

A mobile-first web app for parents who wake up on a Saturday with no plan and don't want to spend 20 minutes Googling what to do with their kid.

You enter your child's age and location, pick going out or staying in, and get one AI-generated activity suggestion based on real weather and nearby venues. That's it.

**Live site:** https://now-what-xi.vercel.app/

---

## Built with

- React + Vite
- Framer Motion — screen transitions and button interactions
- Tailwind CSS
- Claude API (claude-sonnet-4-6) — activity suggestion generation
- Google Places API — nearby venue discovery
- Open-Meteo — real-time weather
- National Weather Service API — weather alerts
- Express proxy server — keeps API keys server-side
- Vercel — deployment

## How it works

The app passes the child's age, current weather, location, nearby venues, and indoor/outdoor preference into a carefully engineered system prompt. Claude returns one warm, educational, age-appropriate suggestion in two sentences.

Age-specific safety parameters are built into the system prompt — no suggestions with choking hazards, unsafe materials, or activities inappropriate for the stated age.

## Run locally

You'll need API keys for Anthropic and Google Places. Add them to a `.env` file — see `.env.example` for the required variables.

```
npm install
npm run server   # start the Express proxy on port 3001
npm run dev      # start the Vite dev server
```

## Built using AI tooling

This app was built using Claude Code, Figma MCP, and the Anthropic API — no code written manually. The system prompt, safety parameters, and product decisions are documented in the case study above.

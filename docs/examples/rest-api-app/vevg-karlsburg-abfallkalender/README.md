# vevg-karlsburg-abfallkalender

This project provides an API proxy for the waste calendars of
[VEVG Karlsburg](https://www.vevg-karlsburg.de/) in Mecklenburg-Western Pomerania in Germany.

## Purpose

On their website [VEVG Karlsburg](https://www.vevg-karlsburg.de/) provides waste calendars as html
version and as well as ics feeds.

The delivered data has some weaknesses regarding the data structure and quality:

- There is no index of all calendars for automated processing.
- The urls of the ics feeds are encrypted by non-speaking proprietary parameters.
- Village names are partly used with non-standard names.
- For some villages multiple separated calendars are available.
- The location string of the events does not contain a valid geo location.
- The event summary names are quite long regarding the purpose.

This API proxy tries to fix all named issues by some data processing:

- The proxy provides an optimises ics feed.
- At `/api/communities` an index of villages with proper names and locations is
  provided in json format.
- The index at `/api/` includes pathes to the ics feeds.
- The event data is processed and optimized in several ways e.g. shortening the summary,
  reformatting the location, optimise the description, add categories and a scope, ...

## Getting Started

This API proxy is a [Next.js](https://nextjs.org/) project.

```bash
git clone https://github.com/schafevormfenster/vevg-karlsburg-abfallkalender.git
yarn
yarn dev
```

Open the api proxy locally:

- Show the village index at http://localhost:3000/api/communities
- Show an event list as ics e.g. http://localhost:3000/api/schedule/altpapier

## Status

This API proxy is dedicated to be used for waste calendars of VEVG Karlsburg only. So please do not
expect a generic solution.

The code is functional and tested, but not engineered like a professional commercial project. You
will find some parts of duplicate code, a non-bullet-proof error handling and maybe other
thing you would love to see here.

---

<a href="https://www.schafe-vorm-fenster.org/"><img src="docs/schafe-vorm-fenster_logo.svg" width="50" alt="Schafe vorm Fenster UG"/></a>

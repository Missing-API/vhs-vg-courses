# Calendar API

This application manages organizers and calendars.

## Original data

The original data is stored in a CRM system. The here used CRM ist "hellomateo". The CRM provides a REST API to access "contacts" as records whre clients are stored as incl. calendar information.

The given REST api has performance gaps and has to kept save behind a caching layer or data store.

## Working data

The working data sets can be stored within a database - best might be to use Typesense as a search engine for fast access.

## Data broker

This application should feed the source data and index it into the working data store.

To keep the data up to date, there are two update channels:

- webhook from mateo, which triggers an update of a single record
- cronjob, which triggers a full update of all records utilizing a queue by google tasks to keep the load low

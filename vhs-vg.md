# Course Search and Display Analysis for VHS-VG Website

Analysis and requirements for course search functionality at https://www.vhs-vg.de/

## Overview

**Search URL**: https://www.vhs-vg.de/kurse

## Requirements

### Location-Based Course Lists

Create separate course lists filtered by location:

- **Anklam**
- **Greifswald** 
- **Pasewalk**

Each location should have its own dedicated search/filter to retrieve location-specific course listings.

### Default Search Criteria

When creating course lists, apply the following default search parameters:

- **Zeitraum (Time Period)**: alle (all)
- **Keine Begonnenen** ✓ (Exclude already started courses)
- **Keine Ausgebuchten** ✓ (Exclude fully booked courses)

## Implementation Notes

The search functionality should automatically apply these filters to ensure users see only available and upcoming courses for their selected location.

## Request Analysis

### HTTP Request Details

**Request URL:**
```
https://www.vhs-vg.de/kurse?kathaupt=1&cHash=402d153f8cc68c1a842ce068d34d8e5a
```

Note: The url has to be scaped from `div > div.hauptseite_kurse > div > div.kw-kursuebersicht > div.kw-nurbuchbare > form` at `https://www.vhs-vg.de/kurse`.

**Request Method:** POST

**Content-Type:** `application/x-www-form-urlencoded`

### Request Body Parameters

```
katortfilter%5B%5D=Anklam&katortfilter%5B%5D=__reset__&katwotagefilter%5B%5D=__reset__&katzeitraumfilter=__reset__&katkeinebegonnenenfilter%5B%5D=1&katkeinebegonnenenfilter%5B%5D=__reset__&katneuerkursfilter%5B%5D=__reset__&katnichtvollefilter%5B%5D=1&katnichtvollefilter%5B%5D=__reset__
```

#### Decoded Parameters:
- `katortfilter[]` = Anklam (Location filter)
- `katkeinebegonnenenfilter[]` = 1 (Exclude started courses)
- `katnichtvollefilter[]` = 1 (Exclude full courses)
- Various `__reset__` parameters for form state management

### Result List Structure

Within the response markup is an HTML table with selector `div.kw-kursuebersicht > table`.

The result list uses pagination. The pagination links are located at selector `div.kw-paginationleiste > nav > ul`.

Example pagination links:

```html
<ul class="pagination pagination-lg justify-content-center">
      <li class="page-item active"><span class="page-link" title="Aktuelle Seite 1" aria-label="Seite 1">1</span></li><li class="page-item"><a class="blaetternindex page-link" href="/kurse?browse=forward&amp;kathaupt=1&amp;knr=252A41701&amp;cHash=0c473c3584462fc8e5bf55c866de6af8" title="Seite 2 öffnen" aria-label="Seite 2">2</a></li><li class="page-item"><a class="blaetternindex page-link" href="/kurse?browse=forward&amp;kathaupt=1&amp;knr=252A40615&amp;cHash=05457abe3422b3f32f2c8e7fa80b630e" title="Seite 3 öffnen" aria-label="Seite 3">3</a></li>
      
      <li class="page-item">
        <a class="page-link" title="nächste Seite mit Kursen" href="/kurse?browse=forward&amp;kathaupt=1&amp;knr=252A41701&amp;cHash=0c473c3584462fc8e5bf55c866de6af8">
          <i class="bi bi-chevron-right" aria-hidden="true"></i>
        </a> 
      </li>
</ul>
```

The pagination links must be extracted from the result page due to specific parameters like `cHash`.

**Important**: Due to the pagination functionality, it is recommended to count the results and compare them with the actual result count displayed in the filters (e.g., in selector `#kw-filter-ortvalues > div > ul > li:nth-child(2) > label`).

### Detail Page Structure

The detail page for each course can be accessed via links in the result list. The detail page structure includes the following elements:

#### Key Elements and Selectors

- **Title**: `h1`
- **Description**: `div.kw-kurs-info-text`
- **Course Dates**: Extract from result list or detail page
- **Location**: 
  - Primary source: Extract from result list table column
  - Alternative: Fetch from ICS files at `.hauptseite_kurse > div > a`
- **Image** (optional): `.kw-kurs-fotos > img`
- **Course Link**: Extract from result list
- **Start Date**: Extract from result list

#### Composed Description Format

Combine the following information to create a comprehensive course description:

1. **Date Information**: Begin date, end date, and total number of sessions
2. **Enrollment Status**: "Belegung" status from result list
3. **Course Details**: Content from `div.kw-kurs-info-text`
4. **Detail Link**: Direct link to the full course page

This composed description provides users with essential course information at a glance while maintaining access to detailed information.

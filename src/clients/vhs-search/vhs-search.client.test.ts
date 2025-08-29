import { describe, it, expect } from 'vitest';
import { parseLocationsFromSearchForm, parseLocationDetails } from '@/clients/vhs-website/vhs-search.client';

describe('VHS website client - parsers', () => {
  it('parseLocationsFromSearchForm should extract names and counts', () => {
    const html = `
      <div id="kw-filter-ortvalues">
        <label><input type="checkbox" /> Anklam (77)</label>
        <label><input type="checkbox" /> Greifswald (155)</label>
        <label><input type="checkbox" /> Pasewalk (73)</label>
      </div>
    `;
    const result = parseLocationsFromSearchForm(html);

    expect(result).toHaveLength(3);
    const byId = Object.fromEntries(result.map(r => [r.id, r]));
    expect(byId.anklam.courseCount).toBe(77);
    expect(byId.greifswald.courseCount).toBe(155);
    expect(byId.pasewalk.courseCount).toBe(73);
  });

  it('parseLocationsFromSearchForm should be robust to missing counts', () => {
    const html = `
      <div id="kw-filter-ortvalues">
        <label><input type="checkbox" /> Anklam</label>
        <label><input type="checkbox" /> Greifswald</label>
        <label><input type="checkbox" /> Pasewalk</label>
      </div>
    `;
    const result = parseLocationsFromSearchForm(html);

    expect(result).toHaveLength(3);
    expect(result.every(r => ['anklam', 'greifswald', 'pasewalk'].includes(r.id))).toBe(true);
  });

  it('parseLocationDetails should extract addresses per location', () => {
    const html = `
      <div class="hauptseite_ohnestatus">
        <h2>Außenstelle:  Anklam</h2>
        <div><strong>Adresse:</strong></div>
        <div>Markt 7</div>
        <div>17389 Anklam</div>

        <h2>Außenstelle:  Greifswald</h2>
        <div><strong>Adresse:</strong></div>
        <div>Martin-Luther-Str. 7a</div>
        <div>17489 Greifswald</div>

        <h2>Außenstelle:  Pasewalk</h2>
        <div><strong>Adresse:</strong></div>
        <div>Gemeindewiesenweg 8</div>
        <div>17309 Pasewalk</div>
      </div>
    `;
    const result = parseLocationDetails(html);
    const byId = Object.fromEntries(result.map(r => [r.id, r]));

    expect(result).toHaveLength(3);
    expect(byId.anklam.address).toContain('Markt 7');
    expect(byId.anklam.address).toContain('17389 Anklam');
    expect(byId.greifswald.address).toContain('Martin-Luther-Str. 7a');
    expect(byId.pasewalk.address).toContain('Gemeindewiesenweg 8');
  });
});
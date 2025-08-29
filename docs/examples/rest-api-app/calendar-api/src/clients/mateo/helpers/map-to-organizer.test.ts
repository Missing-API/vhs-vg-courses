import { describe, it, expect } from 'vitest';

import { mapToOrganizer } from './map-to-organizer';
import { MateoContactListItem } from '../types/mateo-contact-list.types';

describe('mapToOrganizer', () => {
  it('should return null when contact has no id', () => {
    const contact = {} as MateoContactListItem;
    expect(mapToOrganizer(contact)).toBeNull();
  });

  it('should return null when contact tarif_status is not active', () => {
    const contact = {
      id: '123',
      tarif_status: 'inactive',
    } as unknown as MateoContactListItem;
    expect(mapToOrganizer(contact)).toBeNull();
  });

  it('should map a valid contact to an organizer', () => {
    const contact = {
      id: '123',
      tarif_status: 'active',
      display_name: 'John Doe',
      organization_name: 'Test Org',
      google_calendar_id_01: 'calendar1',
      google_calendar_id_02: 'calendar2',
      google_calendar_id_03: null,
    } as unknown as MateoContactListItem;

    const result = mapToOrganizer(contact);

    expect(result).toEqual({
      id: '123',
      name: 'John Doe',
      organization: 'Test Org',
      google_calendars: ['calendar1', 'calendar2'],
    });
  });

  it('should use organization_name as name when display_name is not provided', () => {
    const contact = {
      id: '123',
      tarif_status: 'active',
      display_name: null,
      organization_name: 'Test Org',
    } as unknown as MateoContactListItem;

    const result = mapToOrganizer(contact);

    expect(result).toEqual({
      id: '123',
      name: 'Test Org',
      organization: 'Test Org',
      google_calendars: [],
    });
  });

  it('should filter out null and undefined google calendar IDs', () => {
    const contact = {
      id: '123',
      tarif_status: 'active',
      display_name: 'John Doe',
      organization_name: 'Test Org',
      google_calendar_id_01: 'calendar1',
      google_calendar_id_02: undefined,
      google_calendar_id_03: null,
      google_calendar_id_04: 'calendar4',
    } as unknown as MateoContactListItem;

    const result = mapToOrganizer(contact);

    expect(result).toEqual({
      id: '123',
      name: 'John Doe',
      organization: 'Test Org',
      google_calendars: ['calendar1', 'calendar4'],
    });
  });
});

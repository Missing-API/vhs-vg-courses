import { vi } from 'vitest';
import { ApiConfig } from '../../helpers/config';

// Mock responses for the config functions
export const mockMateoApiConfig: ApiConfig = {
  host: 'https://mateo-api.example.com',
  token: 'mock-mateo-token',
};

// Create mock functions that can be used in tests
export const mockGetMateoApiHost = vi.fn(() => mockMateoApiConfig.host);
export const mockGetMateoApiToken = vi.fn(() => mockMateoApiConfig.token);
export const mockGetMateoApiConfig = vi.fn(() => mockMateoApiConfig);

// Default mocked module export for vi.mock
export const configMock = {
  getMateoApiHost: mockGetMateoApiHost,
  getMateoApiToken: mockGetMateoApiToken,
  getMateoApiConfig: mockGetMateoApiConfig,
};

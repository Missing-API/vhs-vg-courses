import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getMateoApiHost, getMateoApiToken, getMateoApiConfig } from './config';
import * as baseConfigModule from '../../helpers/config';

// Mock the logger module
vi.mock('@/src/logging/logger', () => ({
  getLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock the loggerApps.config module
vi.mock('@/src/logging/loggerApps.config', () => ({
  clientLoggerMateo: {
    config: 'client.mateo.config',
  },
}));

describe('Mateo Config Helpers', () => {
  const mockEnv = {
    MATEO_API_ENDPOINT: 'https://api.mateo.test',
    MATEO_TOKEN: 'test-token',
  };
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      ...mockEnv,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    process.env = originalEnv;
  });

  describe('getMateoApiHost', () => {
    it('should return host from environment variable', () => {
      vi.spyOn(baseConfigModule, 'getApiHost').mockReturnValue(
        mockEnv.MATEO_API_ENDPOINT,
      );
      const result = getMateoApiHost();
      expect(result).toBe(mockEnv.MATEO_API_ENDPOINT);
      expect(baseConfigModule.getApiHost).toHaveBeenCalledWith(
        'MATEO_API_ENDPOINT',
        'client.mateo.config',
      );
    });
  });

  describe('getMateoApiToken', () => {
    it('should return token from environment variable', () => {
      vi.spyOn(baseConfigModule, 'getApiToken').mockReturnValue(
        mockEnv.MATEO_TOKEN,
      );
      const result = getMateoApiToken();
      expect(result).toBe(mockEnv.MATEO_TOKEN);
      expect(baseConfigModule.getApiToken).toHaveBeenCalledWith(
        'MATEO_TOKEN',
        'client.mateo.config',
      );
    });
  });

  describe('getMateoApiConfig', () => {
    it('should return complete API configuration', () => {
      const mockConfig = {
        host: mockEnv.MATEO_API_ENDPOINT,
        token: mockEnv.MATEO_TOKEN,
      };
      vi.spyOn(baseConfigModule, 'getApiConfig').mockReturnValue(mockConfig);

      const result = getMateoApiConfig();

      expect(result).toEqual(mockConfig);
      expect(baseConfigModule.getApiConfig).toHaveBeenCalledWith(
        'MATEO_API_ENDPOINT',
        'MATEO_TOKEN',
        'client.mateo.config',
      );
    });
  });
});

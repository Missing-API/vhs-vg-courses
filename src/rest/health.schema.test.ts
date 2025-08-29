import { describe, it, expect } from 'vitest';
import { HealthyApiStatusSchema, UnhealthyApiStatusSchema } from '@/rest/health.schema';

describe('Health Schema Validation', () => {
  describe('HealthyApiStatusSchema', () => {
    it('should validate a correct healthy response', () => {
      const validHealthyResponse = {
        status: 200,
        message: 'healthy',
        name: 'vhs-vg-courses',
        version: '1.0.0',
        description: 'VHS VG Course Calendar API - Web scraping and calendar feed generation for Volkshochschule courses',
        services: [],
      };

      const result = HealthyApiStatusSchema.safeParse(validHealthyResponse);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data).toEqual(validHealthyResponse);
      }
    });

    it('should require all mandatory fields', () => {
      const incompleteResponse = {
        status: 200,
        message: 'healthy',
        // missing name, version, description, services
      };

      const result = HealthyApiStatusSchema.safeParse(incompleteResponse);
      expect(result.success).toBe(false);
    });

    it('should validate status is between 200-299', () => {
      const invalidStatusResponse = {
        status: 500, // Invalid for healthy response
        message: 'healthy',
        name: 'vhs-vg-courses',
        version: '1.0.0',
        description: 'Test description',
        services: [],
      };

      const result = HealthyApiStatusSchema.safeParse(invalidStatusResponse);
      expect(result.success).toBe(false);
    });

    it('should validate services is an array', () => {
      const invalidServicesResponse = {
        status: 200,
        message: 'healthy',
        name: 'vhs-vg-courses',
        version: '1.0.0',
        description: 'Test description',
        services: 'not an array', // Invalid type
      };

      const result = HealthyApiStatusSchema.safeParse(invalidServicesResponse);
      expect(result.success).toBe(false);
    });
  });

  describe('UnhealthyApiStatusSchema', () => {
    it('should validate a correct unhealthy response', () => {
      const validUnhealthyResponse = {
        status: 503,
        error: 'Service unavailable',
        name: 'vhs-vg-courses',
        version: '1.0.0',
        description: 'VHS VG Course Calendar API - Web scraping and calendar feed generation for Volkshochschule courses',
        services: [],
      };

      const result = UnhealthyApiStatusSchema.safeParse(validUnhealthyResponse);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data).toEqual(validUnhealthyResponse);
      }
    });

    it('should require error field for unhealthy responses', () => {
      const incompleteResponse = {
        status: 503,
        // missing error field
        name: 'vhs-vg-courses',
        version: '1.0.0',
        description: 'Test description',
        services: [],
      };

      const result = UnhealthyApiStatusSchema.safeParse(incompleteResponse);
      expect(result.success).toBe(false);
    });

    it('should validate status is between 400-599', () => {
      const invalidStatusResponse = {
        status: 200, // Invalid for unhealthy response
        error: 'Some error',
        name: 'vhs-vg-courses',
        version: '1.0.0',
        description: 'Test description',
        services: [],
      };

      const result = UnhealthyApiStatusSchema.safeParse(invalidStatusResponse);
      expect(result.success).toBe(false);
    });
  });
});

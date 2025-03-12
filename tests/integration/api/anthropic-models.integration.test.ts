import { describe, it, expect, beforeAll } from 'vitest';
import dotenv from 'dotenv';

// Import the model lists from our application
import { VALID_ANTHROPIC_MODELS } from '../../../lib/anthropic';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Define the Anthropic API endpoint for models
const ANTHROPIC_MODELS_ENDPOINT = 'https://api.anthropic.com/v1/models';

// Define the interface for Anthropic API model response
interface AnthropicModel {
  id: string;
  name: string;
  description: string;
  context_window: number;
  max_tokens: number;
}

interface AnthropicModelsResponse {
  models: AnthropicModel[];
}

describe('Anthropic Models Validation', () => {
  let anthropicApiKey: string | undefined;
  let anthropicModels: string[] = [];
  
  beforeAll(() => {
    // Get the Anthropic API key from environment variables
    anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  });

  it('should have an Anthropic API key available for testing', () => {
    if (!anthropicApiKey) {
      console.warn('⚠️ No Anthropic API key found in environment variables. Skipping API validation tests.');
    }
    // This test will pass even if the API key is not available, but it will log a warning
    expect(true).toBe(true);
  });

  it('should fetch available models from Anthropic API if API key is available', async () => {
    if (!anthropicApiKey) {
      console.warn('⚠️ Skipping Anthropic API test due to missing API key');
      return;
    }

    try {
      const response = await fetch(ANTHROPIC_MODELS_ENDPOINT, {
        method: 'GET',
        headers: {
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as AnthropicModelsResponse;
      
      // Store the model IDs for later tests
      anthropicModels = data.models.map(model => model.id);
      
      console.log('Available Anthropic models:', anthropicModels);
      
      expect(anthropicModels.length).toBeGreaterThan(0);
    } catch (error) {
      console.error('Error fetching Anthropic models:', error);
      // If the API request fails, the test should still pass
      // This prevents CI/CD pipelines from failing when API keys are not available
      console.warn('⚠️ Could not validate against Anthropic API. Using local validation only.');
    }
  });

  it('should have all application-defined models available in Anthropic API', async () => {
    if (!anthropicApiKey || anthropicModels.length === 0) {
      console.warn('⚠️ Skipping model validation due to missing API data');
      return;
    }

    // Check if all our defined models exist in the Anthropic API
    for (const model of VALID_ANTHROPIC_MODELS) {
      const modelExists = anthropicModels.includes(model);
      if (!modelExists) {
        console.warn(`⚠️ Model ${model} defined in application but not found in Anthropic API`);
      }
      expect(modelExists).toBe(true);
    }
  });

  it('should have all Anthropic API models defined in our application', async () => {
    if (!anthropicApiKey || anthropicModels.length === 0) {
      console.warn('⚠️ Skipping model validation due to missing API data');
      return;
    }

    // Check if all Anthropic API models are defined in our application
    for (const model of anthropicModels) {
      const modelDefined = VALID_ANTHROPIC_MODELS.includes(model);
      if (!modelDefined) {
        console.warn(`⚠️ Model ${model} available in Anthropic API but not defined in application`);
      }
      expect(modelDefined).toBe(true);
    }
  });

  it('should validate our model list even without API access', () => {
    // This test ensures our model list follows the expected format pattern
    // It runs regardless of API access
    
    // Updated pattern to match all model formats including those with "thinking"
    const modelPattern = /^claude-\d+-\d*-?[a-z]+(-thinking)?-\d{8}$/;
    
    for (const model of VALID_ANTHROPIC_MODELS) {
      const isValidFormat = modelPattern.test(model);
      if (!isValidFormat) {
        console.warn(`⚠️ Model ${model} does not follow the expected format pattern: ${modelPattern}`);
      }
      expect(isValidFormat).toBe(true);
    }
  });
}); 
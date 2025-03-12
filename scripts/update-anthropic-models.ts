#!/usr/bin/env ts-node
/**
 * Script to update Anthropic model lists in the application
 * 
 * This script fetches the latest models from the Anthropic API and updates
 * the model lists in the application code.
 * 
 * Usage:
 * ANTHROPIC_API_KEY=your_api_key ts-node scripts/update-anthropic-models.ts
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Define the Anthropic API endpoint for models
const ANTHROPIC_MODELS_ENDPOINT = 'https://api.anthropic.com/v1/models';

// Define the paths to the files that need to be updated
const ANTHROPIC_LIB_PATH = path.join(process.cwd(), 'lib/anthropic.ts');
const API_SERVICES_PATH = path.join(process.cwd(), 'app/api/api-connections/services/route.ts');

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

/**
 * Fetches the latest models from the Anthropic API
 */
async function fetchAnthropicModels(): Promise<string[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }
  
  console.log('Fetching models from Anthropic API...');
  
  const response = await fetch(ANTHROPIC_MODELS_ENDPOINT, {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
  });
  
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json() as AnthropicModelsResponse;
  const models = data.models.map(model => model.id);
  
  console.log(`Found ${models.length} models:`, models);
  
  return models;
}

/**
 * Updates the Anthropic library file with the latest models
 */
function updateAnthropicLibrary(models: string[]): void {
  console.log(`Updating ${ANTHROPIC_LIB_PATH}...`);
  
  // Read the current file
  const content = fs.readFileSync(ANTHROPIC_LIB_PATH, 'utf8');
  
  // Create the updated model list
  const modelListString = models.map(model => `  '${model}'`).join(',\n');
  
  // Create the model map entries
  const modelMapEntries: Record<string, string> = {};
  
  for (const model of models) {
    // Extract the base name without the version suffix
    const match = model.match(/^(claude-\d+-[a-z]+)-\d{8}$/);
    if (match) {
      const baseName = match[1];
      // Convert hyphens to dots in the first part of the name (e.g., claude-3-7 -> claude-3.7)
      const dotNotation = baseName.replace(/^(claude)-(\d+)-(\d+)/, '$1-$2.$3');
      modelMapEntries[dotNotation] = model;
      // Also add the hyphen version
      modelMapEntries[baseName] = model;
    }
  }
  
  // Create the model map string
  const modelMapString = Object.entries(modelMapEntries)
    .map(([key, value]) => `  '${key}': '${value}'`)
    .join(',\n');
  
  // Replace the VALID_ANTHROPIC_MODELS array
  const updatedContent = content.replace(
    /const VALID_ANTHROPIC_MODELS = \[\n(.*?)\n\];/s,
    `const VALID_ANTHROPIC_MODELS = [\n${modelListString}\n];`
  );
  
  // Replace the MODEL_NAME_MAP object
  const finalContent = updatedContent.replace(
    /const MODEL_NAME_MAP: Record<string, string> = \{\n(.*?)\n\};/s,
    `const MODEL_NAME_MAP: Record<string, string> = {\n${modelMapString}\n};`
  );
  
  // Write the updated content back to the file
  fs.writeFileSync(ANTHROPIC_LIB_PATH, finalContent, 'utf8');
  
  console.log(`Updated ${ANTHROPIC_LIB_PATH}`);
}

/**
 * Updates the API services file with the latest models
 */
function updateApiServices(models: string[]): void {
  console.log(`Updating ${API_SERVICES_PATH}...`);
  
  // Read the current file
  const content = fs.readFileSync(API_SERVICES_PATH, 'utf8');
  
  // Create the updated model list
  const modelListString = models.map(model => `      '${model}'`).join(',\n');
  
  // Replace the models array in the anthropic service
  const updatedContent = content.replace(
    /(id: 'anthropic'.*?models: \[)(.*?)(\],)/s,
    `$1\n${modelListString}\n    $3`
  );
  
  // Write the updated content back to the file
  fs.writeFileSync(API_SERVICES_PATH, updatedContent, 'utf8');
  
  console.log(`Updated ${API_SERVICES_PATH}`);
}

/**
 * Main function
 */
async function main() {
  try {
    // Fetch the latest models from the Anthropic API
    const models = await fetchAnthropicModels();
    
    // Update the Anthropic library file
    updateAnthropicLibrary(models);
    
    // Update the API services file
    updateApiServices(models);
    
    console.log('Successfully updated Anthropic model lists');
  } catch (error) {
    console.error('Error updating Anthropic model lists:', error);
    process.exit(1);
  }
}

// Run the main function
main(); 
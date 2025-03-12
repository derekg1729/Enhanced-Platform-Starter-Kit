import { describe, it, expect } from 'vitest';
import { getModelProvider, ModelProvider } from '../../lib/model-utils';

describe('Model Utilities', () => {
  describe('getModelProvider', () => {
    it('should identify OpenAI models correctly', () => {
      expect(getModelProvider('gpt-3.5-turbo')).toBe(ModelProvider.OPENAI);
      expect(getModelProvider('gpt-4')).toBe(ModelProvider.OPENAI);
      expect(getModelProvider('gpt-4-turbo')).toBe(ModelProvider.OPENAI);
      expect(getModelProvider('gpt-4-vision-preview')).toBe(ModelProvider.OPENAI);
      expect(getModelProvider('text-davinci-003')).toBe(ModelProvider.OPENAI);
    });

    it('should identify Anthropic models correctly', () => {
      expect(getModelProvider('claude-3-opus-20240229')).toBe(ModelProvider.ANTHROPIC);
      expect(getModelProvider('claude-3-sonnet-20240229')).toBe(ModelProvider.ANTHROPIC);
      expect(getModelProvider('claude-3-haiku-20240307')).toBe(ModelProvider.ANTHROPIC);
      expect(getModelProvider('claude-2')).toBe(ModelProvider.ANTHROPIC);
      expect(getModelProvider('claude-instant-1')).toBe(ModelProvider.ANTHROPIC);
    });

    it('should return UNKNOWN for unrecognized models', () => {
      expect(getModelProvider('unknown-model')).toBe(ModelProvider.UNKNOWN);
      expect(getModelProvider('')).toBe(ModelProvider.UNKNOWN);
    });

    it('should handle case insensitivity', () => {
      expect(getModelProvider('GPT-4')).toBe(ModelProvider.OPENAI);
      expect(getModelProvider('Claude-3-Haiku-20240307')).toBe(ModelProvider.ANTHROPIC);
    });

    it('should handle model names with additional parameters', () => {
      expect(getModelProvider('gpt-4-0613')).toBe(ModelProvider.OPENAI);
      expect(getModelProvider('claude-3-opus-20240229-v1:0')).toBe(ModelProvider.ANTHROPIC);
    });
  });
}); 
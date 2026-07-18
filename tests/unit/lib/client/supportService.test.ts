import { describe, it, expect, vi } from 'vitest';
import { getFaqs, searchFaqs } from '@/lib/client/supportService';

// Mock translation function
vi.mock('@/i18n/client', () => ({
  t: (key: string) => {
    const translations: Record<string, string> = {
      'client.support.faq.workouts': 'How do workouts work?',
      'client.support.faq.workouts.answer': 'Your trainer assigns personalized workouts.',
      'client.support.faq.diets': 'How do I follow my diet?',
      'client.support.faq.diets.answer': 'Follow meal plan.',
      'client.support.faq.progress': 'Progress tracking',
      'client.support.faq.progress.answer': 'Log daily weight.',
      'client.support.faq.chat': 'Support Chat',
      'client.support.faq.chat.answer': 'Use support chat.',
      'client.support.faq.medical': 'Medical profile',
      'client.support.faq.medical.answer': 'Helps your trainer.',
    };
    return translations[key] || key;
  },
}));

describe('supportService', () => {
  it('should return all FAQ items', () => {
    const faqs = getFaqs();
    expect(faqs).toHaveLength(5);
    expect(faqs[0]?.question).toBe('How do workouts work?');
  });

  it('should return matching FAQ items on search', () => {
    const matching = searchFaqs('workout');
    expect(matching).toHaveLength(1);
    expect(matching[0]?.question).toBe('How do workouts work?');
  });

  it('should return empty array if no matches found', () => {
    const matching = searchFaqs('nonexistent');
    expect(matching).toHaveLength(0);
  });

  it('should return all FAQs if search query is empty', () => {
    const matching = searchFaqs('  ');
    expect(matching).toHaveLength(5);
  });
});

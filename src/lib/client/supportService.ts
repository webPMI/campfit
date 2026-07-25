import { t } from '@/i18n/client';

export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Obtiene la lista completa de FAQs traducidas.
 */
export function getFaqs(): FAQItem[] {
  return [
    {
      question: t('client.support.faq.workouts'),
      answer: t('client.support.faq.workouts.answer'),
    },
    {
      question: t('client.support.faq.diets'),
      answer: t('client.support.faq.diets.answer'),
    },
    {
      question: t('client.support.faq.progress'),
      answer: t('client.support.faq.progress.answer'),
    },
    {
      question: t('client.support.faq.chat'),
      answer: t('client.support.faq.chat.answer'),
    },
    {
      question: t('client.support.faq.medical'),
      answer: t('client.support.faq.medical.answer'),
    },
  ];
}

/**
 * Filtra los FAQs por un término de búsqueda.
 */
export function searchFaqs(query: string): FAQItem[] {
  const faqs = getFaqs();
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return faqs;

  return faqs.filter(
    (item) =>
      item.question.toLowerCase().includes(trimmed) ||
      item.answer.toLowerCase().includes(trimmed)
  );
}

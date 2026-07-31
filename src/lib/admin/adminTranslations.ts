/**
 * Traducciones compartidas para páginas admin que evitan exponer datos en window.
 * Centraliza las traducciones necesarias para admin/clients y admin/trainers.
 */
import { translations } from '@/i18n/translations';

/**
 * Obtiene traducciones admin centralizadas sin exponer en window.
 * @param lang - Idioma ('es' | 'en')
 */
export function getAdminTranslations(lang: 'es' | 'en' = 'es') {
    const t = (key: string) => translations[lang]?.[key] || translations['es']?.[key] || key;
    return {
        search: t('admin.search'),
        noUsers: t('admin.no.users'),
        noClients: t('admin.no.clients'),
        noTrainers: t('admin.no.trainers'),
        loading: t('admin.loading'),
    };
}
/**
 * 📡 Debug Data Logger — Centralizado
 * =====================================
 * Función única para loguear en consola los datos obtenidos de Firestore
 * durante el desarrollo. Se activa solo en DEV mode.
 *
 * Uso:
 *   import { logFirestoreData } from '@/lib/debug/debugDataLogger';
 *   logFirestoreData('workouts', workouts);
 *   logFirestoreData('diets', diets, { trainerId: 'abc' });
 *
 * @module debug/debugDataLogger
 */

export interface DataLogContext {
    /** ID del usuario que solicita los datos */
    userId?: string;
    /** ID del trainer asociado */
    trainerId?: string;
    /** ID del cliente asociado */
    clientId?: string;
    /** Rol del usuario */
    role?: string;
    /** Operación: 'subscribe', 'fetch', 'add', 'update', 'delete' */
    operation?: string;
    /** Timestamp de la operación */
    timestamp?: string;
    /** Metadatos extra */
    [key: string]: unknown;
}

/**
 * Loguea datos obtenidos de Firestore en la consola del navegador.
 * Solo se ejecuta en modo desarrollo (DEV).
 *
 * @param collection - Nombre de la colección (ej: 'workouts', 'diets', 'users')
 * @param data - Los datos obtenidos (array o objeto)
 * @param context - Contexto adicional (userId, trainerId, operation, etc.)
 */
export function logFirestoreData(
    collection: string,
    data: unknown,
    context: DataLogContext = {},
): void {
    // Solo activo en modo desarrollo
    if (!import.meta.env.DEV) return;

    const ISOString = new Date().toISOString();
    const timestamp = (ISOString.split('T')[1] || '').slice(0, 12);
    const emoji = collectionIcons[collection] || '📦';
    const count = Array.isArray(data) ? data.length : (data ? 1 : 0);

    console.groupCollapsed(
        `%c${emoji} [${timestamp}] ${collection.toUpperCase()}%c · ${count} docs · ${context.operation || 'read'}`,
        'color: #10b981; font-weight: 700;',
        'color: #a1a1aa; font-weight: 400;',
    );

    // Contexto
    const ctx: string[] = [];
    if (context.userId) ctx.push(`👤 ${context.userId.slice(0, 10)}...`);
    if (context.trainerId) ctx.push(`🏋️ ${context.trainerId.slice(0, 10)}...`);
    if (context.clientId) ctx.push(`👥 ${context.clientId.slice(0, 10)}...`);
    if (context.role) ctx.push(`🔑 ${context.role}`);
    if (ctx.length > 0) console.log('   Context:', ctx.join(' | '));

    // Muestra los datos completos
    if (Array.isArray(data)) {
        if (data.length === 0) {
            console.log('   ⚠️  Sin datos (array vacío)');
        } else {
            console.log(`   📋 ${data.length} documentos:`);
            data.forEach((doc, index) => {
                const id = (doc as any)?.id || '?';
                const name = (doc as any)?.name || '';
                const preview = getPreview(doc, collection);
                console.log(
                    `   %c${index + 1}.%c ${preview}`,
                    'color: #6b6b73;',
                    'color: #e4e4e7;',
                );
                console.log(`      id: ${id}`);
                console.log('      data:', doc);
            });
        }
    } else if (data) {
        console.log('   📄 Documento:', data);
    } else {
        console.log('   ⚠️  null / undefined');
    }

    // Summary table
    if (Array.isArray(data) && data.length > 0) {
        console.groupCollapsed('   📊 Tabla resumen');
        console.table(
            data.map((doc: any) => {
                const row: Record<string, unknown> = {};
                row.id = doc.id?.slice(0, 8) || '?';
                if (doc.name) row.name = doc.name;
                if (doc.email) row.email = doc.email;
                if (doc.role) row.role = doc.role;
                if (doc.difficulty) row.difficulty = doc.difficulty;
                if (doc.totalCalories) row.kcal = doc.totalCalories;
                if (doc.type) row.type = doc.type;
                if (doc.weight != null) row.weight = doc.weight;
                if (doc.createdAt) row.created = formatDate(doc.createdAt);
                return row;
            }),
        );
        console.groupEnd();
    }

    console.groupEnd();
}

/** Iconos por colección para identificación visual rápida */
const collectionIcons: Record<string, string> = {
    users: '👤',
    workouts: '🏋️',
    diets: '🍽️',
    messages: '💬',
    progress_logs: '📊',
    medical_profiles: '🏥',
};

/** Genera un preview descriptivo del documento */
function getPreview(doc: any, collection: string): string {
    switch (collection) {
        case 'users':
            return `${doc.name || 'Sin nombre'} (${doc.role || '?'})`;
        case 'workouts':
            return `${doc.name || 'Rutina'} · ${doc.difficulty || '?'} · ${doc.exercises?.length || 0} ejercicios`;
        case 'diets':
            return `${doc.name || 'Dieta'} · ${doc.type || '?'} · ${doc.totalCalories || 0} kcal`;
        case 'messages':
            return `${doc.type || 'msg'} · ${doc.content?.slice(0, 60) || ''}`;
        case 'progress_logs':
            return `${doc.type || 'log'} · ${doc.date ? '✓' : '?'}`;
        default:
            return doc.name || doc.id || JSON.stringify(doc).slice(0, 60);
    }
}

/** Formatea timestamps de Firestore para la tabla */
function formatDate(ts: any): string {
    if (!ts) return '?';
    try {
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toISOString().split('T')[0];
    } catch {
        return String(ts).slice(0, 10);
    }
}

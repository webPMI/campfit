/**
 * 🔍 Firestore Debug System
 * 
 * Sistema de diagnóstico para verificar en tiempo real qué datos
 * se cargan desde Firestore y detectar errores de índices, permisos, etc.
 * 
 * Uso: Pulsa Ctrl+Shift+D en cualquier página para abrir el panel.
 * 
 * @module firestoreDebug
 */

import { db, auth } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore';

// ============================================================
// Configuración
// ============================================================

const DEBUG_KEY = 'campfit:debug:enabled';
const PANEL_ID = 'campfit-debug-panel';

interface QueryTest {
  name: string;
  run: () => Promise<{ ok: boolean; count: number; error?: string; sample?: unknown }>;
}

interface TestResult {
  name: string;
  ok: boolean;
  count: number;
  error?: string;
  sample?: unknown;
  duration: number;
}

// ============================================================
// Tests de queries por rol
// ============================================================

function getQueryTests(uid: string, role: string): QueryTest[] {
  const tests: QueryTest[] = [];

  // ─── Tests comunes ───
  tests.push({
    name: '📄 Perfil propio (users/{uid})',
    run: async () => {
      const snap = await getDoc(doc(db, 'users', uid));
      if (!snap.exists()) return { ok: false, count: 0, error: 'Documento no existe' };
      return { ok: true, count: 1, sample: snap.data() };
    },
  });

  // ─── Tests ADMIN ───
  if (role === 'admin') {
    tests.push({
      name: '👥 Todos los usuarios (sin filtro)',
      run: async () => {
        const q = query(collection(db, 'users'), limit(5));
        const snap = await getDocs(q);
        return { ok: true, count: snap.size, sample: snap.docs[0]?.data() };
      },
    });

    tests.push({
      name: '👥 Usuarios por rol (role == trainer)',
      run: async () => {
        const q = query(collection(db, 'users'), where('role', '==', 'trainer'), orderBy('createdAt', 'desc'), limit(5));
        const snap = await getDocs(q);
        return { ok: true, count: snap.size, sample: snap.docs[0]?.data() };
      },
    });

    tests.push({
      name: '👥 Usuarios por rol (role == client)',
      run: async () => {
        const q = query(collection(db, 'users'), where('role', '==', 'client'), orderBy('createdAt', 'desc'), limit(5));
        const snap = await getDocs(q);
        return { ok: true, count: snap.size, sample: snap.docs[0]?.data() };
      },
    });

    tests.push({
      name: '📊 Conteo workouts',
      run: async () => {
        const snap = await getDocs(query(collection(db, 'workouts'), limit(5)));
        return { ok: true, count: snap.size };
      },
    });

    tests.push({
      name: '📊 Conteo diets',
      run: async () => {
        const snap = await getDocs(query(collection(db, 'diets'), limit(5)));
        return { ok: true, count: snap.size };
      },
    });

    tests.push({
      name: '📊 Conteo messages',
      run: async () => {
        const snap = await getDocs(query(collection(db, 'messages'), limit(5)));
        return { ok: true, count: snap.size };
      },
    });

    tests.push({
      name: '📊 Conteo progress_logs',
      run: async () => {
        const snap = await getDocs(query(collection(db, 'progress_logs'), limit(5)));
        return { ok: true, count: snap.size };
      },
    });
  }

  // ─── Tests TRAINER ───
  if (role === 'trainer') {
    tests.push({
      name: '👥 Clientes asignados (assignedTrainerId == uid)',
      run: async () => {
        const q = query(
          collection(db, 'users'),
          where('assignedTrainerId', '==', uid),
          orderBy('createdAt', 'desc'),
          limit(5),
        );
        const snap = await getDocs(q);
        return { ok: true, count: snap.size, sample: snap.docs[0]?.data() };
      },
    });

    tests.push({
      name: '🏋️ Workouts del trainer',
      run: async () => {
        const q = query(collection(db, 'workouts'), where('trainerId', '==', uid), orderBy('createdAt', 'desc'), limit(5));
        const snap = await getDocs(q);
        return { ok: true, count: snap.size, sample: snap.docs[0]?.data() };
      },
    });

    tests.push({
      name: '🥗 Dietas del trainer',
      run: async () => {
        const q = query(collection(db, 'diets'), where('trainerId', '==', uid), orderBy('createdAt', 'desc'), limit(5));
        const snap = await getDocs(q);
        return { ok: true, count: snap.size, sample: snap.docs[0]?.data() };
      },
    });

    tests.push({
      name: '💬 Mensajes (participants array-contains) DESC',
      run: async () => {
        const q = query(
          collection(db, 'messages'),
          where('participants', 'array-contains', uid),
          orderBy('createdAt', 'desc'),
          limit(5),
        );
        const snap = await getDocs(q);
        return { ok: true, count: snap.size, sample: snap.docs[0]?.data() };
      },
    });

    tests.push({
      name: '💬 Mensajes (participants array-contains) ASC',
      run: async () => {
        const q = query(
          collection(db, 'messages'),
          where('participants', 'array-contains', uid),
          orderBy('createdAt', 'asc'),
          limit(5),
        );
        const snap = await getDocs(q);
        return { ok: true, count: snap.size, sample: snap.docs[0]?.data() };
      },
    });
  }

  // ─── Tests CLIENT ───
  if (role === 'client') {
    tests.push({
      name: '🏋️ Workouts del cliente',
      run: async () => {
        const q = query(collection(db, 'workouts'), where('clientId', '==', uid), orderBy('createdAt', 'desc'), limit(5));
        const snap = await getDocs(q);
        return { ok: true, count: snap.size, sample: snap.docs[0]?.data() };
      },
    });

    tests.push({
      name: '🥗 Dietas del cliente',
      run: async () => {
        const q = query(collection(db, 'diets'), where('clientId', '==', uid), orderBy('createdAt', 'desc'), limit(5));
        const snap = await getDocs(q);
        return { ok: true, count: snap.size, sample: snap.docs[0]?.data() };
      },
    });

    tests.push({
      name: '📊 Progreso (clientId + type)',
      run: async () => {
        const q = query(
          collection(db, 'progress_logs'),
          where('clientId', '==', uid),
          where('type', '==', 'weight'),
          orderBy('date', 'desc'),
          limit(5),
        );
        const snap = await getDocs(q);
        return { ok: true, count: snap.size, sample: snap.docs[0]?.data() };
      },
    });

    tests.push({
      name: '📊 Progreso general (clientId)',
      run: async () => {
        const q = query(collection(db, 'progress_logs'), where('clientId', '==', uid), orderBy('date', 'desc'), limit(5));
        const snap = await getDocs(q);
        return { ok: true, count: snap.size, sample: snap.docs[0]?.data() };
      },
    });

    tests.push({
      name: '💬 Chat (participants array-contains)',
      run: async () => {
        const q = query(
          collection(db, 'messages'),
          where('participants', 'array-contains', uid),
          orderBy('createdAt', 'asc'),
          limit(5),
        );
        const snap = await getDocs(q);
        return { ok: true, count: snap.size, sample: snap.docs[0]?.data() };
      },
    });
  }

  return tests;
}

// ============================================================
// Panel UI
// ============================================================

function createPanel(): HTMLDivElement {
  const existing = document.getElementById(PANEL_ID);
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML = `
    <div id="debug-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:99998;backdrop-filter:blur(4px);"></div>
    <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99999;width:90%;max-width:700px;max-height:85vh;background:#18181b;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;overflow-y:auto;box-shadow:0 25px 50px rgba(0,0,0,0.5);font-family:system-ui,-apple-system,sans-serif;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <div>
          <h2 style="color:#fff;font-size:18px;font-weight:700;margin:0;">🔍 Firestore Debug</h2>
          <p id="debug-user-info" style="color:#a1a1aa;font-size:12px;margin:4px 0 0 0;">Cargando sesión...</p>
        </div>
        <div style="display:flex;gap:8px;">
          <button id="debug-run-all" style="background:#10b981;color:#fff;border:none;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">▶ Ejecutar todo</button>
          <button id="debug-close" style="background:#27272a;color:#a1a1aa;border:1px solid #3f3f46;padding:8px 12px;border-radius:8px;font-size:13px;cursor:pointer;">✕ Cerrar</button>
        </div>
      </div>
      <div id="debug-summary" style="margin-bottom:16px;padding:12px;background:#27272a;border-radius:10px;display:none;">
        <p id="debug-summary-text" style="color:#e4e4e7;font-size:13px;margin:0;"></p>
      </div>
      <div id="debug-tests" style="display:flex;flex-direction:column;gap:8px;">
        <div style="text-align:center;padding:20px;color:#71717a;font-size:14px;">
          <div style="margin-bottom:8px;">⏳ Cargando tests...</div>
          <div style="width:24px;height:24px;border:3px solid #3f3f46;border-top-color:#10b981;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto;"></div>
        </div>
      </div>
      <style>
        @keyframes debug-spin { to { transform: rotate(360deg); } }
        .debug-test { border-radius:10px;padding:12px 16px;font-size:13px;transition:all 0.2s; }
        .debug-test.ok { background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.15); }
        .debug-test.fail { background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.15); }
        .debug-test.pending { background:rgba(113,113,122,0.08);border:1px solid rgba(113,113,122,0.15); }
        .debug-test.running { background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.15); }
        .debug-test .name { color:#e4e4e7;font-weight:500; }
        .debug-test .status { font-size:11px;margin-top:4px; }
        .debug-test.ok .status { color:#34d399; }
        .debug-test.fail .status { color:#f87171; }
        .debug-test .detail { font-size:11px;color:#a1a1aa;margin-top:4px;word-break:break-all; }
        .debug-test .error-detail { font-size:11px;color:#f87171;margin-top:4px;word-break:break-all;background:rgba(239,68,68,0.1);padding:6px 8px;border-radius:6px; }
      </style>
    </div>
  `;

  document.body.appendChild(panel);

  // Close handlers
  document.getElementById('debug-close')!.onclick = () => panel.remove();
  document.getElementById('debug-overlay')!.onclick = () => panel.remove();

  // ESC key
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      panel.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  return panel;
}

async function runTests(uid: string, role: string): Promise<void> {
  const testsContainer = document.getElementById('debug-tests')!;
  const summary = document.getElementById('debug-summary')!;
  const summaryText = document.getElementById('debug-summary-text')!;

  const queryTests = getQueryTests(uid, role);

  if (queryTests.length === 0) {
    testsContainer.innerHTML = `<div style="text-align:center;padding:20px;color:#71717a;font-size:14px;">No hay tests para el rol "${role}"</div>`;
    return;
  }

  // Render test list
  testsContainer.innerHTML = queryTests
    .map(
      (t, i) => `
    <div id="test-${i}" class="debug-test pending">
      <div class="name">${t.name}</div>
      <div class="status">⏳ Pendiente...</div>
    </div>
  `,
    )
    .join('');

  // Run tests sequentially
  const results: TestResult[] = [];
  for (let i = 0; i < queryTests.length; i++) {
    const testEl = document.getElementById(`test-${i}`)!;
    testEl.className = 'debug-test running';
    const runningStatus = testEl.querySelector('.status');
    if (runningStatus) {
      runningStatus.textContent = '🔄 Ejecutando...';
    }

    const start = performance.now();
    try {
      const result = await queryTests[i].run();
      const duration = Math.round(performance.now() - start);

      if (result.ok) {
        testEl.className = 'debug-test ok';
        const okStatusEl = testEl.querySelector('.status');
        if (okStatusEl) {
          okStatusEl.textContent = `✅ OK (${result.count} docs, ${duration}ms)`;
        }
        if (result.sample) {
          const sampleDiv = document.createElement('div');
          sampleDiv.className = 'detail';
          sampleDiv.textContent = `Muestra: ${JSON.stringify(result.sample).substring(0, 200)}`;
          testEl.appendChild(sampleDiv);
        }
      } else {
        testEl.className = 'debug-test fail';
        const failStatusEl = testEl.querySelector('.status');
        if (failStatusEl) {
          failStatusEl.textContent = `❌ Error (${duration}ms)`;
        }
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-detail';
        errorDiv.textContent = result.error || 'Error desconocido';
        testEl.appendChild(errorDiv);
      }

      results.push({ name: queryTests[i].name, ...result, duration });
    } catch (err: unknown) {
      const duration = Math.round(performance.now() - start);
      const errorMsg = err instanceof Error ? err.message : String(err);
      testEl.className = 'debug-test fail';
      const statusEl = testEl.querySelector('.status');
      if (statusEl) {
        statusEl.textContent = `💥 Excepción (${duration}ms)`;
      }
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-detail';
      errorDiv.textContent = errorMsg;
      testEl.appendChild(errorDiv);
      results.push({ name: queryTests[i].name, ok: false, count: 0, error: errorMsg, duration });
    }
  }

  // Summary
  const ok = results.filter((r) => r.ok).length;
  const fail = results.filter((r) => !r.ok).length;
  summary.style.display = 'block';

  if (fail === 0) {
    summaryText.innerHTML = `✅ <strong>Todos los tests pasaron</strong> — ${ok}/${results.length} queries funcionando correctamente.`;
    summary.style.borderLeft = '3px solid #10b981';
  } else {
    summaryText.innerHTML = `⚠️ <strong>${fail} test(s) fallaron</strong> — ${ok}/${results.length} pasaron. Revisa los errores debajo.`;
    summary.style.borderLeft = '3px solid #f87171';
  }
}

// ============================================================
// Inicialización
// ============================================================

let initialized = false;

export function initFirestoreDebug(): void {
  if (initialized) return;
  initialized = true;

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    // Ctrl+Shift+D (o Cmd+Shift+D en Mac)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      openDebugPanel();
    }
  });

  // También exponer globalmente
  (window as unknown as Record<string, unknown>).__openFirestoreDebug = openDebugPanel;

  console.info('[Debug] 🔍 Firestore Debug disponible. Pulsa Ctrl+Shift+D para abrir.');
}

async function openDebugPanel(): Promise<void> {
  const panel = createPanel();
  const userInfo = document.getElementById('debug-user-info')!;

  // Get current user
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) {
    userInfo.textContent = '⚠️ No hay sesión activa. Inicia sesión primero.';
    return;
  }

  userInfo.textContent = `Usuario: ${firebaseUser.email || firebaseUser.uid}`;

  // Get role
  try {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    const userData = userDoc.data();
    const role = userData?.role || 'unknown';
    userInfo.textContent = `Usuario: ${firebaseUser.email || firebaseUser.uid} · Rol: ${role}`;

    // Run tests
    await runTests(firebaseUser.uid, role);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    userInfo.textContent = `⚠️ Error al obtener perfil: ${errorMsg}`;
    const testsContainer = document.getElementById('debug-tests')!;
    testsContainer.innerHTML = `<div class="debug-test fail" style="padding:16px;">
      <div class="name">Error al cargar perfil de usuario</div>
      <div class="error-detail">${errorMsg}</div>
    </div>`;
  }
}

// ============================================================
// Auto-init
// ============================================================

// Inicializar automáticamente cuando se carga el DOM
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initFirestoreDebug());
  } else {
    initFirestoreDebug();
  }
}

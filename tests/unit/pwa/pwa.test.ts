/**
 * Tests unitarios para la configuración PWA
 * Valida que el manifest.json y sw.js cumplen con los requisitos de una PWA instalable.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..", "..");

// Tipos del manifest
interface ManifestIcon {
    src: string;
    sizes: string;
    type: string;
    purpose?: string;
}

interface ManifestShortcut {
    name: string;
    short_name: string;
    description: string;
    url: string;
    icons: { src: string; sizes: string }[];
}

interface WebAppManifest {
    name: string;
    short_name: string;
    description: string;
    start_url: string;
    display: string;
    background_color: string;
    theme_color: string;
    orientation: string;
    lang: string;
    scope: string;
    categories: string[];
    icons: ManifestIcon[];
    shortcuts: ManifestShortcut[];
}

function loadManifest(): WebAppManifest {
    const raw = readFileSync(join(root, "public", "manifest.json"), "utf-8");
    return JSON.parse(raw) as WebAppManifest;
}

function loadServiceWorker(): string {
    return readFileSync(join(root, "public", "sw.js"), "utf-8");
}

describe("PWA - Web App Manifest", () => {
    const manifest = loadManifest();

    it("tiene los campos obligatorios para ser instalable", () => {
        expect(manifest.name).toBe("CampFit");
        expect(manifest.short_name).toBe("CampFit");
        expect(manifest.start_url).toBe("/");
        expect(manifest.display).toBe("standalone");
        expect(manifest.scope).toBe("/");
    });

    it("tiene colores de tema y fondo válidos (hex)", () => {
        expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
        expect(manifest.background_color).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it("tiene al menos un icono de 192x192 y uno de 512x512", () => {
        const has192 = manifest.icons.some((i) => i.sizes === "192x192");
        const has512 = manifest.icons.some((i) => i.sizes === "512x512");
        expect(has192).toBe(true);
        expect(has512).toBe(true);
    });

    it("todos los iconos tienen type image/png", () => {
        manifest.icons.forEach((icon) => {
            expect(icon.type).toBe("image/png");
        });
    });

    it("tiene al menos un icono maskable para Android", () => {
        const hasMaskable = manifest.icons.some(
            (i) => i.purpose?.includes("maskable")
        );
        expect(hasMaskable).toBe(true);
    });

    it("los shortcuts apuntan a rutas válidas del proyecto", () => {
        const validRoutes = [
            "/dashboard",
            "/client/workouts",
            "/client/diets",
        ];
        manifest.shortcuts.forEach((shortcut) => {
            expect(validRoutes).toContain(shortcut.url);
        });
    });

    it("está en español por defecto", () => {
        expect(manifest.lang).toBe("es");
    });

    it("tiene orientación portrait-primary (app móvil)", () => {
        expect(manifest.orientation).toBe("portrait-primary");
    });
});

describe("PWA - Service Worker", () => {
    const sw = loadServiceWorker();

    it("tiene eventos install, activate y fetch", () => {
        expect(sw).toContain("addEventListener('install'");
        expect(sw).toContain("addEventListener('activate'");
        expect(sw).toContain("addEventListener('fetch'");
    });

    it("usa skipWaiting y clients.claim para actualización inmediata", () => {
        expect(sw).toContain("self.skipWaiting()");
        expect(sw).toContain("self.clients.claim()");
    });

    it("excluye dominios de Firebase y Google", () => {
        expect(sw).toContain("firebase");
        expect(sw).toContain("googleapis");
        expect(sw).toContain("gstatic");
    });

    it("solo intercepta peticiones GET", () => {
        expect(sw).toContain("request.method !== 'GET'");
    });

    it("tiene estrategia de fallback offline para navegación", () => {
        expect(sw).toContain("request.mode === 'navigate'");
        expect(sw).toContain("caches.match('/')");
    });

    it("tiene versionado de cache para invalidación", () => {
        expect(sw).toContain("CACHE_VERSION");
        expect(sw).toContain("STATIC_CACHE");
        expect(sw).toContain("RUNTIME_CACHE");
    });
});
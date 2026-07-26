// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Plugin de Vite para registrar todas las salidas de consola (browser & server)
 * en un archivo físico `logs/debug-console.log` durante desarrollo.
 * @returns {import('vite').Plugin}
 */
function debugFileLoggerPlugin() {
  return {
    name: 'vite-plugin-debug-file-logger',
    configureServer(server) {
      const logsDir = path.resolve(process.cwd(), 'logs');
      const logFile = path.join(logsDir, 'debug-console.log');

      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      const banner = `\n============================================================\n[DEV SESSION STARTED] ${new Date().toISOString()}\n============================================================\n`;
      fs.appendFileSync(logFile, banner, 'utf-8');

      server.middlewares.use('/api/debug/log', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (/** @type {Buffer | string} */ chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              if (Array.isArray(data.logs)) {
                const lines =
                  data.logs
                    .map(
                      (
                        /** @type {{ url?: string; messages?: unknown[]; timestamp?: string; level?: string }} */ entry,
                      ) => {
                        const urlStr = entry.url ? ` [${entry.url}]` : '';
                        const msgStr = Array.isArray(entry.messages)
                          ? entry.messages.join(' ')
                          : String(entry.messages || '');
                        return `[${entry.timestamp || ''}] [CLIENT] [${entry.level || 'LOG'}]${urlStr} ${msgStr}`;
                      },
                    )
                    .join('\n') + '\n';

                fs.appendFileSync(logFile, lines, 'utf-8');
              }
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ ok: false, error: String(err) }));
            }
          });
        } else if (req.method === 'DELETE') {
          fs.writeFileSync(logFile, banner, 'utf-8');
          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true, message: 'Logs limpiados' }));
        } else {
          res.statusCode = 405;
          res.end('Method Not Allowed');
        }
      });
    },
  };
}

// https://astro.build/config
export default defineConfig({
  output: 'static',
  vite: {
    plugins: [tailwindcss(), debugFileLoggerPlugin()],
  },
});
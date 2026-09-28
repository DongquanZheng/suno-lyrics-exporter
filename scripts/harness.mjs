import { build } from 'esbuild';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const out = resolve(root, '.harness');
await build({
  absWorkingDir: root,
  entryPoints: ['src/harness/index.ts'],
  bundle: true,
  outfile: resolve(out, 'harness.js'),
  format: 'iife',
  target: 'chrome114'
});

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json' };
const server = createServer(async (request, response) => {
  const path = request.url === '/' ? resolve(root, 'harness/index.html') : resolve(out, request.url?.slice(1) || '');
  try {
    response.setHeader('Content-Type', types[extname(path)] || 'application/octet-stream');
    response.end(await readFile(path));
  } catch {
    response.statusCode = 404;
    response.end('Not found');
  }
});
server.listen(4173, '127.0.0.1', () => console.log('Harness: http://127.0.0.1:4173 (Ctrl+C to stop)'));

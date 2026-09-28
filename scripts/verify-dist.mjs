import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const required = ['manifest.json', 'content.js', 'background.js', 'popup.html', 'popup.js'];
await Promise.all(required.map((file) => access(resolve(root, 'dist', file))));
const manifest = JSON.parse(await readFile(resolve(root, 'dist', 'manifest.json'), 'utf8'));
if (manifest.manifest_version !== 3) throw new Error('dist manifest is not MV3');
if (manifest.permissions?.includes('<all_urls>') || manifest.host_permissions?.includes('<all_urls>')) {
  throw new Error('dist requests <all_urls>');
}
console.log(`Verified dist/ (${required.length} required files, MV3, scoped permissions).`);

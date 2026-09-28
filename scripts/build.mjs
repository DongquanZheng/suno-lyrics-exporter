import { build, context } from 'esbuild';
import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const watch = process.argv.includes('--watch');

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(resolve(root, 'public'), dist, { recursive: true });

const options = {
  absWorkingDir: root,
  entryPoints: {
    content: 'src/content/index.ts',
    background: 'src/background/index.ts',
    popup: 'src/popup/index.ts'
  },
  bundle: true,
  outdir: dist,
  entryNames: '[name]',
  format: 'iife',
  target: 'chrome114',
  sourcemap: true,
  legalComments: 'none',
  define: {
    __APP_VERSION__: JSON.stringify('0.1.0')
  }
};

if (watch) {
  const ctx = await context(options);
  await ctx.watch();
  console.log(`Watching extension sources. Load unpacked from ${dist}`);
} else {
  await build(options);
  console.log(`Built extension in ${dist}`);
}

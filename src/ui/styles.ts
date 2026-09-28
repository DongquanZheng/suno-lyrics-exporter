export const styles = `
  :host { all: initial; color-scheme: dark; }
  *, *::before, *::after { box-sizing: border-box; }
  .shell { position: fixed; right: 22px; bottom: 22px; z-index: 2147483646; color: #f7f7f8; font: 13px/1.4 Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif; }
  .launcher { display: flex; align-items: center; gap: 8px; border: 1px solid rgba(255,255,255,.14); border-radius: 999px; padding: 10px 15px; color: #fff; background: rgba(25,25,30,.92); box-shadow: 0 12px 35px rgba(0,0,0,.35); backdrop-filter: blur(16px); cursor: pointer; font-weight: 700; }
  .launcher:hover { background: #25252c; transform: translateY(-1px); }
  .panel { width: min(370px, calc(100vw - 24px)); max-height: min(700px, calc(100vh - 24px)); overflow: auto; border: 1px solid rgba(255,255,255,.13); border-radius: 16px; background: rgba(18,18,22,.96); box-shadow: 0 22px 60px rgba(0,0,0,.5); backdrop-filter: blur(22px); }
  .header { display: flex; align-items: center; gap: 10px; padding: 15px 16px 12px; cursor: grab; user-select: none; }
  .header:active { cursor: grabbing; }
  h2 { flex: 1; margin: 0; font-size: 15px; line-height: 1.2; }
  .icon { width: 28px; height: 28px; border: 0; border-radius: 7px; color: #aaaab4; background: transparent; cursor: pointer; font-size: 19px; }
  .icon:hover { color: white; background: #292930; }
  .body { padding: 0 16px 16px; }
  .song { margin: 0 0 14px; color: #8f8f99; font: 11px/1.35 ui-monospace, SFMono-Regular, Consolas, monospace; overflow: hidden; text-overflow: ellipsis; }
  .status { padding: 11px 12px; border: 1px solid #2d2d34; border-radius: 10px; background: #202026; }
  .status.good { color: #a7f3d0; border-color: rgba(52,211,153,.28); background: rgba(6,78,59,.22); }
  .status.warn { color: #fde68a; border-color: rgba(251,191,36,.3); background: rgba(120,53,15,.22); }
  .status.error { color: #fecaca; border-color: rgba(248,113,113,.3); background: rgba(127,29,29,.22); }
  .status strong { display: block; margin-bottom: 2px; }
  .status small { color: inherit; opacity: .78; }
  .missing { margin: 8px 0 0; padding-left: 20px; max-height: 94px; overflow: auto; color: #e8cc82; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 13px; }
  label { display: block; color: #a7a7b0; font-size: 11px; }
  select { width: 100%; margin-top: 5px; padding: 8px 9px; border: 1px solid #3a3a43; border-radius: 8px; color: #f7f7f8; background: #24242b; font: inherit; }
  .source { display: flex; gap: 6px; margin-top: 6px; }
  .source button { flex: 1; padding: 7px 5px; border: 1px solid #3a3a43; border-radius: 8px; color: #aaaab3; background: #24242b; cursor: pointer; }
  .source button.active { border-color: #8b5cf6; color: white; background: #4c1d95; }
  .offset { display: grid; grid-template-columns: 30px 1fr 30px; gap: 5px; margin-top: 5px; }
  .offset button, .reset { border: 1px solid #3a3a43; border-radius: 7px; color: #eee; background: #24242b; cursor: pointer; }
  .offset output { padding: 7px 3px; text-align: center; border: 1px solid #34343d; border-radius: 7px; background: #1b1b20; font-variant-numeric: tabular-nums; }
  .reset { width: 100%; margin-top: 5px; padding: 5px; color: #aaaab3; font-size: 11px; }
  .check { display: flex; align-items: center; gap: 7px; margin-top: 12px; cursor: pointer; }
  .check input { accent-color: #8b5cf6; }
  .preview { margin-top: 14px; }
  .preview-head { display: flex; align-items: center; margin-bottom: 6px; color: #aaaab3; font-size: 11px; }
  .preview-head button { margin-left: auto; border: 0; color: #a78bfa; background: transparent; cursor: pointer; font: inherit; }
  .cues { max-height: 190px; overflow: auto; border: 1px solid #2f2f36; border-radius: 9px; background: #151519; }
  .cue { padding: 8px 10px; border-bottom: 1px solid #27272d; }
  .cue:last-child { border-bottom: 0; }
  .cue time { display: block; margin-bottom: 2px; color: #8b8b96; font: 10px ui-monospace, SFMono-Regular, Consolas, monospace; }
  .actions { display: grid; grid-template-columns: 1fr 1.35fr; gap: 8px; margin-top: 14px; }
  .actions button, .retry { padding: 10px; border: 0; border-radius: 9px; color: white; background: #303038; cursor: pointer; font-weight: 700; }
  .actions .primary { background: #7c3aed; }
  .actions .cover { grid-column: 1 / -1; }
  .actions button:disabled { opacity: .45; cursor: not-allowed; }
  .notice { margin-top: 8px; color: #a7f3d0; font-size: 11px; }
  details { margin-top: 12px; color: #8f8f98; }
  summary { cursor: pointer; font-size: 11px; }
  pre { max-height: 170px; overflow: auto; margin: 8px 0; padding: 9px; border-radius: 8px; color: #b8b8c1; background: #111114; font: 10px/1.5 ui-monospace, SFMono-Regular, Consolas, monospace; white-space: pre-wrap; word-break: break-word; }
  .diag-actions { display: flex; gap: 6px; }
  .diag-actions button, .retry { border: 1px solid #383841; border-radius: 7px; padding: 6px 8px; color: #cfcfd5; background: #24242a; cursor: pointer; font-size: 11px; }
  .loading { display: inline-block; width: 12px; height: 12px; margin-right: 6px; border: 2px solid #777; border-top-color: white; border-radius: 50%; animation: spin .8s linear infinite; vertical-align: -2px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
`;

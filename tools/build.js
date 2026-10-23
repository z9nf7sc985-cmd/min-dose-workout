const fs = require('fs'), path = require('path'), E = require('./engine'), S = require('./specs');
const out = path.join(__dirname, '..', 'ex'); fs.mkdirSync(out, { recursive: true });
let sheet = '<html><body style="background:#0b0d12;color:#dde;font:12px system-ui;margin:10px"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">';
let total = 0;
for (const [id, spec] of Object.entries(S)) {
  const svg = E.animated(spec); fs.writeFileSync(path.join(out, id + '.svg'), svg); total += svg.length;
  const panels = spec.poses.length > 2 ? spec.poses.map((_, i) => i) : (spec.iso ? [0] : [0, 1]);
  sheet += `<div style="background:#141925;border-radius:8px;padding:6px"><b>${id}</b> <span style="color:#889">${(svg.length / 1024).toFixed(1)}KB</span><div style="display:flex;gap:3px">${panels.map(i => `<div style="flex:1;max-width:${panels.length===1?'50%':'none'}">${E.staticPanel(spec, i).replace('width="220" height="150"', 'width="100%"')}</div>`).join('')}</div></div>`;
}
sheet += '</div></body></html>';
fs.writeFileSync('/workspace/mindose-work/sheet.html', sheet);
console.log(Object.keys(S).length, 'svgs', (total / 1024).toFixed(0) + 'KB');

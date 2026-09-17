function lum(hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substr(0,2),16)/255;
  const g = parseInt(hex.substr(2,2),16)/255;
  const b = parseInt(hex.substr(4,2),16)/255;
  const f = c => c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
  return 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b);
}
function ratio(hex1, hex2) {
  const l1 = lum(hex1), l2 = lum(hex2);
  const [a,b] = l1>l2 ? [l1,l2] : [l2,l1];
  return (a+0.05)/(b+0.05);
}
const pairs = [
  ['h1/h2 accent on white', '#3d6698', '#ffffff'],
  ['text-muted on white', '#5f5f5f', '#ffffff'],
  ['text-soft on white', '#505751', '#ffffff'],
  ['text on white', '#353535', '#ffffff'],
  ['tag text (muted) on tag-bg', '#5f5f5f', '#e0e6d4'],
  ['tag text (muted) on tag-bg-alt', '#5f5f5f', '#ecffc9'],
  ['button white text on button-bg', '#ffffff', '#0070d6'],
  ['button white text on visited-bg', '#ffffff', '#36739a'],
  ['header bg vs body bg', '#eff3e7', '#ffffff'],
  ['text on header-bg', '#353535', '#eff3e7'],
  ['warning icon on white', '#8a5209', '#ffffff'],
  ['warning icon on tag-bg', '#8a5209', '#e0e6d4'],
  ['warning icon on header-bg', '#8a5209', '#eff3e7'],
  ['stack pill text on stack-bg', '#5f5f5f', '#ebebeb'],
];
for (const [name, c1, c2] of pairs) {
  console.log(name, '=>', ratio(c1,c2).toFixed(2));
}

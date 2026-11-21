// ArboPass: recognition is derived from valid stamps, never from the seen marker.
export const REQUIRED_SLOTS = Object.freeze([
  ...Array.from({ length: 12 }, (_, i) => `month-${i + 1}`),
  'go-tour', 'go-fest', 'wild-area'
]);
export function isComplete(records, year) {
  if (!Number.isInteger(year) || year < 2026 || year > 2100) return false;
  const slots = new Set((records || []).filter(r => r && !r.revoked &&
    (r.year == null || r.year === year)).map(r => r.slot));
  return REQUIRED_SLOTS.every(slot => slots.has(slot));
}
// Deliberate allowlist: no identifiers, QR, email or authentication data.
export function shareDetails(member, year, companionName) {
  return { nickname: String(member.nickname || 'Entrenador').slice(0, 24),
    year, companionName: String(companionName || 'Tu compañero') };
}
function loadArt(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => { img.src = ''; reject(new Error('No se pudo cargar tu compañero. Revisa tu conexión e inténtalo otra vez.')); }, 12000);
    img.crossOrigin = 'anonymous';
    img.onload = () => { clearTimeout(timer); resolve(img); };
    img.onerror = () => { clearTimeout(timer); reject(new Error('No se pudo cargar tu compañero. Revisa tu conexión e inténtalo otra vez.')); };
    img.src = src;
  });
}
export async function downloadRecognition(details, artSrc) {
  const art = await loadArt(artSrc);
  await Promise.race([document.fonts?.ready, new Promise(resolve => setTimeout(resolve, 3000))]);
  const canvas = document.createElement('canvas');
  canvas.width = 1080; canvas.height = 1350;
  const c = canvas.getContext('2d');
  c.fillStyle = '#f7f5ee'; c.fillRect(0, 0, 1080, 1350);
  c.fillStyle = '#eee6f4'; c.beginPath(); c.arc(540, 540, 380, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#806298'; c.lineWidth = 4;
  c.strokeRect(40, 40, 1000, 1270); c.strokeRect(53, 53, 974, 1244);
  c.textAlign = 'center';
  const line = (text, y, size, color = '#392447') => {
    c.fillStyle = color; c.font = `700 ${size}px Montserrat, sans-serif`;
    while (c.measureText(text).width > 900 && size > 20) c.font = `700 ${--size}px Montserrat, sans-serif`;
    c.fillText(text, 540, y);
  };
  line('ARBOPASS · COMUNIDAD ARBODEX', 145, 25, '#527044');
  line('¡LOS 15 RECUERDOS SON TUYOS!', 235, 38);
  line(details.nickname, 315, 55);
  const ratio = Math.min(430 / art.naturalWidth, 440 / art.naturalHeight);
  const w = art.naturalWidth * ratio, h = art.naturalHeight * ratio;
  c.drawImage(art, (1080 - w) / 2, 370 + (440 - h) / 2, w, h);
  line('15 / 15', 900, 72, '#705184');
  line('EXPLORADOR ARBODEX', 990, 46);
  line(String(details.year), 1055, 40, '#527044');
  line('12 meses · 3 aventuras especiales', 1150, 28);
  line('Un año de encuentros. Recuerdos para siempre.', 1210, 24, '#527044');
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('No se pudo crear la imagen. Inténtalo nuevamente.');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `ArboPass-Explorador-${details.year}.png`;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
export function ArboCompletion({ react: R, data, request, companionSrc, companionName, blocked = false }) {
  const h = R.createElement;
  const year = Number(data.year);
  const member = data.member;
  const owner = !!member && member.id === data.ownMember?.id;
  const complete = owner && isComplete(data.records, year);
  const [seen, setSeen] = R.useState(null);
  const [open, setOpen] = R.useState(false);
  const [error, setError] = R.useState('');
  const [busy, setBusy] = R.useState(false);
  const [burst, setBurst] = R.useState(0);
  const [needsSave, setNeedsSave] = R.useState(false);
  const dialog = R.useRef(null);
  const attempted = R.useRef(false);
  const saving = R.useRef(false);
  const alive = R.useRef(true);
  R.useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  async function api(action) {
    const response = await request('/api/portal', { method: 'POST',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, year, cardId: member.id }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No se pudo sincronizar la celebración.');
    return result;
  }
  R.useEffect(() => {
    if (!complete) return;
    let active = true;
    api('celebration-status').then(result => { if (active) { setSeen(result.seen); setError(''); } })
      .catch(() => { if (active) setError('Tu logro está completo. No pudimos consultar si ya viste la celebración; puedes abrirla con el botón.'); });
    return () => { active = false; };
  }, [complete, year, member?.id, request]);
  R.useEffect(() => {
    if (!complete || blocked || seen !== false || attempted.current) return;
    const timer = setTimeout(() => {
      if (document.querySelector('dialog[open]')) return;
      attempted.current = true; setBurst(x => x + 1); setOpen(true);
    }, 600);
    return () => clearTimeout(timer);
  }, [complete, blocked, seen]);
  R.useEffect(() => {
    const node = dialog.current;
    if (open && complete && node && !node.open) node.showModal();
    else if (node?.open) node.close();
  }, [open, complete]);
  R.useEffect(() => { if (!complete) setOpen(false); }, [complete]);
  async function saveSeen() {
    if (!complete || seen === true || saving.current) return;
    saving.current = true;
    try {
      await api('celebration-seen');
      if (alive.current) { setSeen(true); setNeedsSave(false); setError(''); }
    } catch {
      if (alive.current) { setNeedsSave(true); setError('No se guardó que ya viste la celebración. Reintenta para sincronizarlo en tus dispositivos.'); }
    } finally { saving.current = false; }
  }
  function close() { setOpen(false); saveSeen(); }
  async function download() {
    setBusy(true); setError('');
    try { await downloadRecognition(shareDetails(member, year, companionName), companionSrc); }
    catch (e) { if (alive.current) setError(e.message); }
    finally { if (alive.current) setBusy(false); }
  }
  if (!complete) return null;
  const art = (className) => h('img', { key: burst, className, src: companionSrc, alt: companionName || 'Tu compañero de aventuras' });
  const downloadButton = () => h('button', { type: 'button', className: 'arbo-achievement-secondary', disabled: busy, onClick: download }, busy ? 'Preparando imagen…' : 'Descargar reconocimiento');
  const notice = () => error && h('p', { role: 'status', className: 'arbo-achievement-notice' }, error,
    needsSave && h('button', { type: 'button', onClick: saveSeen }, 'Reintentar sincronización'));
  return h(R.Fragment, null,
    h('section', { className: 'arbo-achievement', 'aria-label': `Explorador ArboDex ${year}` },
      h('span', { className: 'arbo-achievement-medal', 'aria-hidden': true }, '15', h('small', null, 'DE 15')),
      h('div', { className: 'arbo-achievement-copy' }, h('p', { className: 'arbo-achievement-eyebrow' }, 'UN AÑO PARA RECORDAR'),
        h('h2', null, `Explorador ArboDex · ${year}`), h('p', null, `${member.nickname}, completaste tus 12 sellos mensuales y las 3 aventuras especiales.`)),
      h('div', { className: 'arbo-achievement-actions' },
        h('button', { type: 'button', className: 'primary', onClick: () => { attempted.current = true; setBurst(x => x + 1); setOpen(true); } }, 'Celebrar mis 15 sellos'), downloadButton()),
      !open && notice()),
    h('dialog', { ref: dialog, className: 'arbo-achievement-dialog', 'aria-labelledby': 'arbo-achievement-title', onCancel: e => { e.preventDefault(); close(); }, onClose: () => setOpen(false) },
      h('button', { type: 'button', className: 'arbo-achievement-close', 'aria-label': 'Cerrar celebración', onClick: close }, '×'),
      open && h('div', { key: burst, className: 'arbo-confetti', 'aria-hidden': true }, Array.from({ length: 36 }, (_, i) => h('i', { key: i, style: { '--x': `${(i * 37) % 100}%`, '--delay': `${(i % 7) * .13}s`, '--turn': `${i * 47}deg` } }))),
      h('p', { className: 'arbo-achievement-eyebrow' }, `COLECCIÓN ARBODEX · ${year}`),
      h('h2', { id: 'arbo-achievement-title' }, '¡Los 15 recuerdos son tuyos!'),
      h('p', { className: 'arbo-achievement-name' }, member.nickname),
      h('div', { className: 'arbo-achievement-art' }, art('arbo-achievement-pokemon'), h('span', null, '15 / 15')),
      h('h3', null, 'Explorador ArboDex'),
      h('p', null, 'Doce meses, tres aventuras especiales y un montón de historias para compartir.'),
      h('p', { className: 'arbo-achievement-thanks' }, 'Gracias por crecer jugando con la comunidad. 🍃'),
      h('div', { className: 'arbo-achievement-actions' }, h('button', { type: 'button', className: 'arbo-achievement-secondary', onClick: () => setBurst(x => x + 1) }, 'Repetir animación'), downloadButton(), h('button', { type: 'button', className: 'primary', onClick: close }, '¡Ahí estuve!')),
      notice())
  );
}

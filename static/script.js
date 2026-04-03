
const delay = ms => new Promise(r => setTimeout(r, ms));
const tick  = ()  => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
function $ (id) { return document.getElementById(id); }

function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  $('view-' + id).classList.add('active');
  const p = $('pill-' + id);
  if (p) p.classList.add('active');
  if (id === 'history') renderHistory();
}

const fileInput  = $('file-input');
const dropCore   = $('drop-core');
const previewEl  = $('preview');
const corePH     = $('core-ph');
const removeFab  = $('remove-btn');
const analyzeBtn = $('analyze-btn');

dropCore.addEventListener('click', e => {
  if (e.target === removeFab || removeFab.contains(e.target)) return;
  fileInput.click();
});
fileInput.addEventListener('change', e => loadFile(e.target.files[0]));

dropCore.addEventListener('dragover',  e => { e.preventDefault(); dropCore.classList.add('drag-over'); });
dropCore.addEventListener('dragleave', ()  => dropCore.classList.remove('drag-over'));
dropCore.addEventListener('drop', e => {
  e.preventDefault(); dropCore.classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (f && f.type.startsWith('image/')) loadFile(f);
});

function loadFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    previewEl.src = e.target.result;
    previewEl.classList.remove('hidden');
    corePH.classList.add('hidden');
    removeFab.classList.remove('hidden');
    dropCore.classList.add('has-img');
    analyzeBtn.disabled = false;
  };
  reader.readAsDataURL(file);
}

removeFab.addEventListener('click', e => { e.stopPropagation(); resetUpload(); });

function resetUpload() {
  fileInput.value = '';
  previewEl.src = '';
  previewEl.classList.add('hidden');
  corePH.classList.remove('hidden');
  removeFab.classList.add('hidden');
  dropCore.classList.remove('has-img');
  analyzeBtn.disabled = true;
  $('bento-result').innerHTML = '';
  $('idle-panel').style.display = '';
  $('loader').classList.remove('visible');
}


async function runZoom() {
  const overlay   = $('zoom-overlay');
  const imgWrap   = $('z-img-wrap');
  const zImg      = $('z-img');
  const grid      = $('z-grid');
  const watermark = $('z-watermark');
  const beam      = $('z-beam');
  const status    = $('z-status');
  const progWrap  = $('z-prog-wrap');
  const prog      = $('z-prog');
  const corners   = ['zc-tl','zc-tr','zc-bl','zc-br'].map($);

  imgWrap.className   = 'z-img-wrap';
  beam.className      = 'z-beam';
  grid.className      = 'z-grid';
  watermark.className = 'z-watermark';
  status.className    = 'z-status';
  progWrap.className  = 'z-progress-wrap';
  prog.className      = 'z-progress';
  corners.forEach(c => c.classList.remove('on'));

  zImg.src = previewEl.src;

  
  overlay.style.display = 'flex';
  await tick();


  watermark.classList.add('on');
  await delay(200);

  imgWrap.classList.add('zoomed');
  await delay(750);

 
  grid.classList.add('on');
  corners.forEach(c => c.classList.add('on'));
  await delay(120);

  status.classList.add('on');
  progWrap.classList.add('on');
  await tick();
  prog.classList.add('run');

  beam.classList.add('sweep');
  await delay(1450);


  grid.classList.remove('on');
  corners.forEach(c => c.classList.remove('on'));
  status.classList.remove('on');
  progWrap.classList.remove('on');
  await delay(150);


  imgWrap.classList.remove('zoomed');
  imgWrap.classList.add('exiting');
  watermark.classList.remove('on');
  await delay(560);

  overlay.style.display = 'none';
}

analyzeBtn.addEventListener('click', async () => {
  const fd = new FormData();
  fd.append('image', fileInput.files[0]);

  analyzeBtn.disabled = true;
  $('idle-panel').style.display = 'none';
  $('bento-result').innerHTML   = '';

  try {
    const [, data] = await Promise.all([
      runZoom(),
      fetch('/analyze', { method:'POST', body:fd }).then(r => {
        if (!r.ok) throw new Error('Server error');
        return r.json();
      })
    ]);

    saveHistory(data);
    renderBento('bento-result', data);
    showToast('🌿', 'Analysis complete!');

  } catch (err) {
    $('idle-panel').style.display = '';
    analyzeBtn.disabled = false;
    showToast('❌', 'Analysis failed. Please try again.');
    $('zoom-overlay').style.display = 'none';
  }
});

function renderBento(containerId, data) {
  const el    = $(containerId);
  const score = data.sustainability_score ?? 0;
  const { cc, sc } = scoreColors(score);
  const circ  = 263.9;
  const offset = circ - (score / 100) * circ;

  const alts  = (data.sustainable_alternatives || []).map(a =>`<li><span class="li-d"></span>${a}</li>`).join('');
  const mats  = (data.materials_likely_used    || []).map(m =>`<li><span class="li-d"></span>${m}</li>`).join('');
  const tips  = (data.sustainability_tips      || []).map(t =>`<li><span class="li-d"></span>${t}</li>`).join('');

  window._lastScanData = data;

  el.innerHTML = `
    <div class="results-hdr">
      <h2>Scan Report</h2>
      <span class="r-badge">Live Result</span>
    </div>

    <!-- ACTION BAR -->
    <div class="action-bar">
      <button class="btn-action btn-pdf" id="btn-pdf-${containerId}" onclick="downloadPDF('${containerId}')">
        <span class="btn-action-icon">📄</span>
        <svg class="pdf-spinner" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
        Download PDF
      </button>
      <button class="btn-action btn-voice" id="btn-voice-${containerId}" onclick="toggleVoice('${containerId}')">
        <div class="voice-bars">
          <div class="vbar"></div><div class="vbar"></div><div class="vbar"></div>
          <div class="vbar"></div><div class="vbar"></div>
        </div>
        <span id="voice-lbl-${containerId}">AI Voice Summary</span>
      </button>
    </div>

    <!-- VOICE PANEL -->
    <div class="voice-panel" id="voice-panel-${containerId}">
      <div class="vp-header">
        <div class="vp-dot"></div>
        <span class="vp-label">🔊 AI Reading Summary</span>
      </div>
      <div class="vp-text" id="vp-text-${containerId}"></div>
    </div>

    <div class="bento">
      <div class="bc bc-score bc-2" style="animation-delay:0s">
        <div class="sc-left">
          <div class="bc-lbl"><span class="dot"></span>Product</div>
          <div class="prod-name">${data.product_name || 'Unknown Product'}</div>
          <span class="sc-cat">${data.category || 'General'}</span>
        </div>
        <div class="sc-ring-wrap">
          <svg viewBox="0 0 92 92">
            <circle class="sc-track" cx="46" cy="46" r="42"/>
            <circle class="sc-arc ${sc}" cx="46" cy="46" r="42"
              style="stroke-dasharray:${circ};stroke-dashoffset:${circ};"
              id="sarc-${containerId}"/>
          </svg>
          <div class="sc-val">
            <span class="sc-num ${cc}" id="snum-${containerId}">0</span>
            <span class="sc-lbl">Score</span>
          </div>
        </div>
      </div>
      <div class="bc bc-metric" style="animation-delay:.06s">
        <span class="m-icon">🌱</span>
        <div class="bc-lbl"><span class="dot"></span>Carbon Saved</div>
        <div class="m-val">${data.impact_metrics?.carbon_saved || '—'}</div>
      </div>
      <div class="bc bc-metric bc-2 c2" style="animation-delay:.1s">
        <span class="m-icon">💧</span>
        <div class="bc-lbl"><span class="dot dot-l"></span>Water Saved</div>
        <div class="m-val">${data.impact_metrics?.water_saved || '—'}</div>
      </div>
      <div class="bc bc-metric" style="animation-delay:.14s">
        <span class="m-icon">🌬️</span>
        <div class="bc-lbl"><span class="dot"></span>Air Impact</div>
        <div class="m-val">${data.impact_metrics?.air_impact || '—'}</div>
      </div>
      <div class="bc bc-text bc-3" style="animation-delay:.18s">
        <div class="bc-lbl"><span class="dot"></span>Impact Summary</div>
        <p>${data.environmental_impact || 'No summary available.'}</p>
      </div>
      <div class="bc bc-2" style="animation-delay:.22s">
        <div class="bc-lbl"><span class="dot dot-l"></span>Eco Alternatives</div>
        <ul class="eco-list alts">${alts || '<li><span class="li-d"></span>None found</li>'}</ul>
      </div>
      <div class="bc" style="animation-delay:.26s">
        <div class="bc-lbl"><span class="dot"></span>Materials</div>
        <ul class="eco-list">${mats || '<li><span class="li-d"></span>Not identified</li>'}</ul>
      </div>
      <div class="bc bc-3" style="animation-delay:.30s">
        <div class="bc-lbl"><span class="dot"></span>Eco Tips</div>
        <ul class="eco-list tips">${tips || '<li><span class="li-d"></span>No tips available</li>'}</ul>
      </div>
    </div>`;

  requestAnimationFrame(() => requestAnimationFrame(() => {
    const arc = $('sarc-' + containerId);
    const num = $('snum-' + containerId);
    if (arc) { arc.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(.25,.8,.25,1)'; arc.style.strokeDashoffset = offset; }
    if (num) animateCount(num, score, 1500);
  }));
}

function animateCount(el, target, dur) {
  const t0 = performance.now();
  (function step(now) {
    const p = Math.min((now - t0) / dur, 1);
    const e = p < .5 ? 2*p*p : -1+(4-2*p)*p;
    el.textContent = Math.round(e * target);
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}

function scoreColors(s) {
  if (s <= 30) return { cc:'c-red',   sc:'s-red'   };
  if (s <= 55) return { cc:'c-amber', sc:'s-amber' };
  if (s <= 78) return { cc:'c-lime',  sc:'s-lime'  };
  return             { cc:'c-em',    sc:'s-em'    };
}

function saveHistory(data) {
  let h = JSON.parse(localStorage.getItem('gs_h') || '[]');
  h.unshift({ ...data, _id: Date.now(), _date: new Date().toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' }) });
  localStorage.setItem('gs_h', JSON.stringify(h));
}

function renderHistory() {
  const grid = $('hgrid');
  const h = JSON.parse(localStorage.getItem('gs_h') || '[]');
  if (!h.length) {
    grid.innerHTML = `<div class="empty"><div class="empty-ico">🌱</div><p>No scans yet — head to Scanner and analyze your first product.</p></div>`;
    return;
  }
  grid.innerHTML = h.map((item, i) => {
    const { cc } = scoreColors(item.sustainability_score ?? 0);
    return `
      <div class="hcard" onclick="viewDetail('${item._id}')" style="animation-delay:${i*.045}s">
        <button class="del-btn" onclick="delItem(event,'${item._id}')" title="Delete">✕</button>
        <div class="hc-name">${item.product_name || 'Unknown'}</div>
        <div class="hc-date">${item._date || ''}</div>
        <div class="hc-row">
          <span class="hc-num ${cc}">${item.sustainability_score ?? '—'}</span>
          <div class="hc-bar"><div class="hc-fill" style="width:${item.sustainability_score ?? 0}%"></div></div>
        </div>
      </div>`;
  }).join('');
}

function delItem(e, id) {
  e.stopPropagation();
  let h = JSON.parse(localStorage.getItem('gs_h') || '[]');
  localStorage.setItem('gs_h', JSON.stringify(h.filter(i => i._id != id)));
  renderHistory();
  showToast('🗑️', 'Scan removed.');
}

function clearAll() {
  if (!confirm('Clear all scan history?')) return;
  localStorage.removeItem('gs_h');
  renderHistory();
  showToast('🗑️', 'History cleared.');
}

function viewDetail(id) {
  const item = JSON.parse(localStorage.getItem('gs_h') || '[]').find(i => i._id == id);
  if (!item) return;
  window._lastScanData = item;
  $('detail-bento').innerHTML = '';
  renderBento('detail-bento', item);
  showView('detail');
}

let toastT;
function showToast(icon, msg) {
  const t = $('toast');
  $('t-icon').textContent = icon;
  $('t-msg').textContent  = msg;
  t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 3200);
}


function downloadPDF(containerId) {
  const btn = $('btn-pdf-' + containerId);
  const data = window._lastScanData;
  if (!data) { showToast('❌','No scan data found.'); return; }

  btn.classList.add('loading');
  showToast('📄','Generating PDF…');

  setTimeout(() => {
    try {
      const score = data.sustainability_score ?? 0;
      const scoreLabel = score <= 30 ? 'Poor' : score <= 55 ? 'Fair' : score <= 78 ? 'Good' : 'Excellent';
      const scoreColor = score <= 30 ? '#ef4444' : score <= 55 ? '#f59e0b' : score <= 78 ? '#a3e635' : '#10b981';
      const now = new Date().toLocaleString('en-IN', { dateStyle:'long', timeStyle:'short' });
      const alts  = (data.sustainable_alternatives || []).map(a => `<li>${a}</li>`).join('');
      const mats  = (data.materials_likely_used    || []).map(m => `<li>${m}</li>`).join('');
      const tips  = (data.sustainability_tips      || []).map(t => `<li>${t}</li>`).join('');
      const carbon = data.impact_metrics?.carbon_saved || '—';
      const water  = data.impact_metrics?.water_saved  || '—';
      const air    = data.impact_metrics?.air_impact   || '—';

      // Build a clean printable HTML
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Aeris Report | ${data.product_name || 'Product'}</title>
    <style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f8faf8;color:#1a2a1a;padding:0}
  .page{max-width:750px;margin:0 auto;background:#fff;padding:40px 44px;min-height:100vh}
  .header{display:flex;align-items:center;justify-content:space-between;padding-bottom:24px;border-bottom:2px solid #e8f5e9;margin-bottom:28px}
  .brand{font-size:1.4rem;font-weight:900;letter-spacing:.05em;text-transform:uppercase;color:#1a2a1a}
  .brand span{color:#10b981}
  .date{font-size:0.72rem;color:#6b7280}
  .report-title{font-size:1.6rem;font-weight:800;color:#1a2a1a;margin-bottom:6px}
  .category-badge{display:inline-block;background:#e8f5e9;color:#059669;font-size:0.65rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:4px 12px;border-radius:100px;margin-bottom:24px}
  .score-section{display:flex;align-items:center;gap:28px;background:linear-gradient(135deg,#f0fdf4,#e8f5e9);border:1.5px solid #bbf7d0;border-radius:16px;padding:22px 28px;margin-bottom:24px}
  .score-circle{width:90px;height:90px;border-radius:50%;border:6px solid ${scoreColor};display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;background:#fff}
  .score-num{font-size:2rem;font-weight:900;color:${scoreColor};line-height:1}
  .score-lbl{font-size:0.55rem;color:#6b7280;letter-spacing:.1em;text-transform:uppercase;margin-top:2px}
  .score-info h3{font-size:1rem;font-weight:800;color:#1a2a1a;margin-bottom:4px}
  .score-info p{font-size:0.82rem;color:#4b5563;line-height:1.6}
  .metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
  .metric{background:#f8faf8;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;text-align:center}
  .metric-icon{font-size:1.3rem;margin-bottom:6px}
  .metric-val{font-size:1.1rem;font-weight:800;color:#10b981;margin-bottom:2px}
  .metric-lbl{font-size:0.6rem;color:#9ca3af;letter-spacing:.08em;text-transform:uppercase}
  h2{font-size:0.75rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#10b981;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #e8f5e9}
  .section{margin-bottom:22px}
  .impact-text{font-size:0.84rem;color:#374151;line-height:1.75;background:#f8faf8;border-left:3px solid #10b981;padding:12px 16px;border-radius:0 8px 8px 0}
  ul{list-style:none;padding:0}
  ul li{padding:7px 0;border-bottom:1px solid #f3f4f6;font-size:0.82rem;color:#374151;display:flex;align-items:baseline;gap:8px}
  ul li::before{content:'';width:5px;height:5px;border-radius:50%;background:#10b981;flex-shrink:0;margin-top:6px}
  ul li:last-child{border-bottom:none}
  .alts li::before{background:#a3e635} .alts li{color:#365314;font-weight:600}
  .tips li::before{background:#059669} .tips li{color:#065f46}
  .footer-pdf{margin-top:32px;padding-top:16px;border-top:1px solid #e8f5e9;display:flex;justify-content:space-between;align-items:center}
  .footer-pdf p{font-size:0.65rem;color:#9ca3af}
  .watermark{font-size:0.65rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#10b981}
  @media print{body{background:#fff}.page{padding:20px}}
</style></head><body>
<div class="page">
  <div class="header">
    <div class="brand">🌿 Aeris</span></div>
    <div class="date">Generated: ${now}</div>
  </div>
  <div class="report-title">${data.product_name || 'Unknown Product'}</div>
  <span class="category-badge">${data.category || 'General'}</span>
  <div class="score-section">
    <div class="score-circle">
      <div class="score-num">${score}</div>
      <div class="score-lbl">/ 100</div>
    </div>
    <div class="score-info">
      <h3>Sustainability Score: ${scoreLabel}</h3>
      <p>${score <= 30 ? 'This product has significant environmental concerns. Consider greener alternatives.' : score <= 55 ? 'This product has moderate environmental impact. Some improvements possible.' : score <= 78 ? 'Good sustainability profile with room for improvement.' : 'Excellent sustainability rating. A great eco-friendly choice!'}</p>
    </div>
  </div>
  <div class="metrics">
    <div class="metric"><div class="metric-icon">🌱</div><div class="metric-val">${carbon}</div><div class="metric-lbl">Carbon Saved</div></div>
    <div class="metric"><div class="metric-icon">💧</div><div class="metric-val">${water}</div><div class="metric-lbl">Water Saved</div></div>
    <div class="metric"><div class="metric-icon">🌬️</div><div class="metric-val">${air}</div><div class="metric-lbl">Air Impact</div></div>
  </div>
  <div class="section"><h2>Environmental Impact Summary</h2><div class="impact-text">${data.environmental_impact || 'No summary available.'}</div></div>
  ${mats ? `<div class="section"><h2>Materials Identified</h2><ul>${mats}</ul></div>` : ''}
  ${alts ? `<div class="section"><h2>Eco-Friendly Alternatives</h2><ul class="alts">${alts}</ul></div>` : ''}
  ${tips ? `<div class="section"><h2>Sustainability Tips</h2><ul class="tips">${tips}</ul></div>` : ''}
  <div class="footer-pdf">
    <p>This report is AI-generated by Aeris. For reference only.</p>
    <div class="watermark">🌿 Aeris</div>
  </div>
</div>
</body></html>`;

      const blob = new Blob([html], { type:'text/html' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `Aeris_${(data.product_name || 'Report').replace(/\s+/g,'_')}_${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      btn.classList.remove('loading');
      showToast('📄','PDF ready! Open in browser → Print → Save as PDF');
    } catch(e) {
      btn.classList.remove('loading');
      showToast('❌','PDF generation failed.');
    }
  }, 800);
}

/* ════════════════════════════════
   VOICE ASSISTANT
════════════════════════════════ */
let voiceUtterance = null;
let voiceSpeaking  = false;
let currentVoiceId = null;

function buildVoiceScript(data) {
  const score = data.sustainability_score ?? 0;
  const label = score <= 30 ? 'poor' : score <= 55 ? 'fair' : score <= 78 ? 'good' : 'excellent';
  const alts  = (data.sustainable_alternatives || []).slice(0,3).join(', ');
  const tip   = (data.sustainability_tips || [])[0] || '';
  return `Aeris Environmental Report for ${data.product_name || 'this product'}.
    Sustainability score: ${score} out of 100 — rated ${label}.
    ${data.environmental_impact ? data.environmental_impact + '.' : ''}
    Carbon saved: ${data.impact_metrics?.carbon_saved || 'not measured'}.
    Water saved: ${data.impact_metrics?.water_saved || 'not measured'}.
    ${alts ? 'Better eco-friendly alternatives include: ' + alts + '.' : ''}
    ${tip ? 'Top sustainability tip: ' + tip : ''}
    Thank you for using Aeris — making every purchase greener.`;
}

function toggleVoice(containerId) {
  if (!('speechSynthesis' in window)) {
    showToast('❌', 'Voice not supported in this browser.');
    return;
  }
  const btn   = $('btn-voice-' + containerId);
  const lbl   = $('voice-lbl-' + containerId);
  const panel = $('voice-panel-' + containerId);
  const vtxt  = $('vp-text-' + containerId);
  const data  = window._lastScanData;
  if (!data) { showToast('❌','No scan data.'); return; }

  // If already speaking this one → stop
  if (voiceSpeaking && currentVoiceId === containerId) {
    speechSynthesis.cancel();
    btn.classList.remove('speaking');
    lbl.textContent = 'AI Voice Summary';
    panel.classList.remove('show');
    voiceSpeaking = false;
    currentVoiceId = null;
    return;
  }

  // Stop any other voice
  speechSynthesis.cancel();
  voiceSpeaking  = false;

  const script = buildVoiceScript(data);
  vtxt.textContent = script;
  panel.classList.add('show');

  const utter = new SpeechSynthesisUtterance(script);

  // Pick best voice
  const voices = speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    v.name.includes('Google UK English Female') ||
    v.name.includes('Samantha') ||
    v.name.includes('Victoria') ||
    v.name.includes('Karen') ||
    (v.lang === 'en-GB' && v.localService)
  ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
  if (preferred) utter.voice = preferred;

  utter.rate   = 0.92;
  utter.pitch  = 1.05;
  utter.volume = 1;

  utter.onstart = () => {
    voiceSpeaking  = true;
    currentVoiceId = containerId;
    btn.classList.add('speaking');
    lbl.textContent = 'Stop';
    showToast('🔊','AI Voice reading summary…');
  };
  utter.onend = utter.onerror = () => {
    btn.classList.remove('speaking');
    lbl.textContent = 'AI Voice Summary';
    voiceSpeaking  = false;
    currentVoiceId = null;
  };

  voiceUtterance = utter;
  speechSynthesis.speak(utter);
}


let demoTimer = null;

function setDemoStep(step) {
  document.querySelectorAll('.demo-step').forEach((el, i) => {
    el.classList.toggle('active', i === step);
  });
  document.querySelectorAll('.dtl-dot').forEach((el, i) => {
    el.classList.remove('active','done');
    if (i === step) el.classList.add('active');
    else if (i < step) el.classList.add('done');
  });
}

function switchStage(from, to) {
  return new Promise(res => {
    const prev = $('ds-' + from);
    const next = $('ds-' + to);
    if (prev) { prev.classList.add('exit'); setTimeout(() => { prev.classList.remove('active','exit'); }, 400); }
    setTimeout(() => { if (next) next.classList.add('active'); res(); }, 420);
  });
}

async function runStage0() {
  setDemoStep(0);
  const cursor  = $('demo-cursor');
  const dropZ   = $('demo-drop-zone');
  const dropInner = $('demo-drop-inner');
  const imgPrev = $('demo-img-preview');
  const screen  = $('demo-screen');

  // reset
  dropZ.classList.remove('drag');
  dropInner.style.opacity = '1';
  imgPrev.classList.remove('show');

  const sr = screen.getBoundingClientRect();
  const dz = dropZ.getBoundingClientRect();

  // cursor starts bottom-right
  cursor.style.left = '85%'; cursor.style.top  = '75%'; cursor.style.opacity = '1';
  await delay(600);

  // cursor moves to drop zone
  const tx = ((dz.left - sr.left + dz.width/2) / sr.width * 100).toFixed(1);
  const ty = ((dz.top  - sr.top  + dz.height/2) / sr.height * 100).toFixed(1);
  cursor.style.left = tx + '%'; cursor.style.top = ty + '%';
  await delay(700);

  // hover effect
  dropZ.classList.add('drag');
  await delay(400);

  // click!
  cursor.classList.add('clicking');
  setTimeout(() => cursor.classList.remove('clicking'), 200);
  await delay(300);

  // image appears
  dropInner.style.opacity = '0';
  imgPrev.classList.add('show');
  dropZ.classList.remove('drag');
  dropZ.style.borderStyle = 'solid';
  dropZ.style.borderColor = 'rgba(16,185,129,0.4)';
  await delay(900);

  // cursor fades out
  cursor.style.opacity = '0';
}

const termLines = [
  { t:'cmd', tx:'$ aeris analyze --model vision-v3' },
  { t:'ok',  tx:'✓ Image loaded · 2.4MB · 1024×1024px' },
  { t:'ok',  tx:'✓ Object detection → product identified' },
  { t:'warn',tx:'⚠ Material: PET plastic (non-recycled)' },
  { t:'ok',  tx:'✓ CO₂ lookup → 2.4kg per unit lifecycle' },
  { t:'ok',  tx:'✓ Water footprint → 18L estimated' },
  { t:'cmd', tx:'$ aeris scoring --weights eco,social,end-of-life' },
  { t:'ok',  tx:'✓ Sustainability score → 42 / 100 (Fair)' },
  { t:'ok',  tx:'✓ Generating eco-alternatives…' },
  { t:'ok',  tx:'✓ Report ready · 3 alternatives found' },
];

async function runStage2() {
  setDemoStep(2);
  const body = $('demo-term-body');
  const arc  = $('demo-score-arc');
  const num  = $('demo-score-num');
  const cat  = $('demo-sp-cat');

  body.innerHTML = '';
  arc.style.strokeDashoffset = '213.6';
  num.textContent = '0'; cat.textContent = 'Calculating…';

  const score = 42;
  const circ  = 213.6;
  const offset = circ - (score / 100) * circ;

  for (let i = 0; i < termLines.length; i++) {
    const { t, tx } = termLines[i];
    const div = document.createElement('div');
    div.className = 'demo-term-line ' + t;
    div.textContent = tx;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    await delay(280);

    // animate ring halfway through
    if (i === 6) {
      arc.style.transition = 'stroke-dashoffset 1.2s ease';
      arc.style.strokeDashoffset = offset;
      animateCount(num, score, 1200);
      setTimeout(() => { cat.textContent = 'Fair — room to improve'; }, 1300);
    }
  }
}

async function runStage1() {
  setDemoStep(1);
  const beam   = $('demo-scan-beam');
  const bar    = $('demo-scan-bar');
  const status = $('demo-scan-status');
  const tags   = ['dtag-0','dtag-1','dtag-2','dtag-3'];

  beam.classList.remove('run');
  bar.style.width = '0';
  tags.forEach(id => $('ds-1').querySelector ? null : null);
  document.querySelectorAll('.dtag').forEach(t => t.classList.remove('lit'));

  const msgs = ['Initialising scan…','Detecting materials…','Computing carbon trace…','Scoring lifecycle…','Finalising report…'];
  let mi = 0;

  beam.classList.add('run');
  bar.style.width = '80%';

  const tick2 = setInterval(() => { if (status) status.textContent = msgs[Math.min(mi++, msgs.length-1)]; }, 400);

  // light up tags one by one
  for (let i = 0; i < tags.length; i++) {
    await delay(350);
    const el = document.getElementById(tags[i]);
    if (el) el.classList.add('lit');
  }

  await delay(600);
  clearInterval(tick2);
  bar.style.width = '100%';
}

async function runStage3() {
  setDemoStep(3);
  // items animate in via CSS animation-delay
}

async function startDemo() {
  // clear any running timers
  clearTimeout(demoTimer);

  // reset all stages
  document.querySelectorAll('.demo-stage').forEach(s => s.classList.remove('active','exit'));
  $('ds-0').classList.add('active');
  setDemoStep(0);

  // reset drop zone
  const dropZ = $('demo-drop-zone');
  if (dropZ) { dropZ.style.borderStyle = ''; dropZ.style.borderColor = ''; }

  await delay(300);

  // Stage 0
  await runStage0();
  await delay(300);

  // Stage 1
  await switchStage(0, 1);
  await runStage1();
  await delay(400);

  // Stage 2
  await switchStage(1, 2);
  await runStage2();
  await delay(600);

  // Stage 3
  await switchStage(2, 3);
  await runStage3();
  await delay(200);

  // loop back after 5s
  demoTimer = setTimeout(startDemo, 5000);
}

// Auto-start demo when visible
const demoObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) { startDemo(); demoObs.disconnect(); }
}, { threshold: 0.3 });
const demoEl = $('demo-section');
if (demoEl) demoObs.observe(demoEl);

showView('scanner');
// HUD (maquete) em HTML/CSS por cima do canvas. Ícones são SVG desenhados à mão neste arquivo:
// nada de fontes de ícones, emojis ou arte de terceiros.
const K = '#4a2f1b'; // contorno marrom

const ico = {
  moeda: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="#ffc93c" stroke="${K}" stroke-width="3"/><circle cx="20" cy="20" r="11.5" fill="#ffe27a" stroke="#d99a1c" stroke-width="2"/><path d="M20 12c5 3 5 11 0 15c-5-4-5-12 0-15z" fill="#f0a020"/></svg>`,
  cash: `<svg viewBox="0 0 40 40"><rect x="3" y="9" width="34" height="22" rx="5" fill="#41b871" stroke="${K}" stroke-width="3"/><circle cx="20" cy="20" r="6.5" fill="#bff0cf" stroke="#2a8a52" stroke-width="2"/><circle cx="9.5" cy="20" r="2" fill="#bff0cf"/><circle cx="30.5" cy="20" r="2" fill="#bff0cf"/></svg>`,
  estrela: `<svg viewBox="0 0 40 40"><path d="M20 3l5.2 10.6 11.7 1.7-8.5 8.2 2 11.6L20 29.6 9.6 35.1l2-11.6-8.5-8.2 11.7-1.7z" fill="#ffd23f" stroke="${K}" stroke-width="3" stroke-linejoin="round"/></svg>`,
  pedidos: `<svg viewBox="0 0 40 40"><rect x="7" y="7" width="26" height="29" rx="4" fill="#fff8e7" stroke="${K}" stroke-width="3"/><rect x="14" y="3.5" width="12" height="8" rx="3" fill="#e9934a" stroke="${K}" stroke-width="3"/><path d="M13 19h4m3 0h8M13 25h4m3 0h8M13 31h4m3 0h5" stroke="${K}" stroke-width="2.6" stroke-linecap="round"/></svg>`,
  amigos: `<svg viewBox="0 0 40 40"><circle cx="14" cy="14" r="6.5" fill="#f6c73d" stroke="${K}" stroke-width="3"/><path d="M3 34c0-8 5-12 11-12s11 4 11 12z" fill="#f6c73d" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><circle cx="28" cy="16" r="5.5" fill="#f27aa6" stroke="${K}" stroke-width="3"/><path d="M22 34c0-6 3-10 7-10s8 4 8 10z" fill="#f27aa6" stroke="${K}" stroke-width="3" stroke-linejoin="round"/></svg>`,
  loja: `<svg viewBox="0 0 40 40"><rect x="7" y="17" width="26" height="19" rx="2" fill="#fff8e7" stroke="${K}" stroke-width="3"/><path d="M4 8h32l1 9a4.5 4.5 0 01-8.5 0a4.5 4.5 0 01-8.5 0a4.5 4.5 0 01-8.5 0a4.5 4.5 0 01-8.5 0z" fill="#e24a3d" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><path d="M12.5 8v9M28 8v9" stroke="#fff8e7" stroke-width="5"/><rect x="16" y="24" width="8" height="12" fill="#3e8cda" stroke="${K}" stroke-width="2.5"/></svg>`,
  missao: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="9" fill="#ffd23f" stroke="${K}" stroke-width="3"/><path d="M20 2v6M20 32v6M2 20h6M32 20h6M7.3 7.3l4.2 4.2M28.5 28.5l4.2 4.2M32.7 7.3l-4.2 4.2M11.5 28.5l-4.2 4.2" stroke="${K}" stroke-width="3.2" stroke-linecap="round"/></svg>`,
  mochila: `<svg viewBox="0 0 40 40"><rect x="5" y="13" width="30" height="22" rx="3" fill="#c79a62" stroke="${K}" stroke-width="3"/><path d="M5 21h30M5 28h30" stroke="${K}" stroke-width="2.5"/><circle cx="13" cy="11" r="5" fill="#f58d27" stroke="${K}" stroke-width="2.5"/><circle cx="23" cy="10" r="5" fill="#f58d27" stroke="${K}" stroke-width="2.5"/><circle cx="30" cy="13" r="4" fill="#f58d27" stroke="${K}" stroke-width="2.5"/></svg>`,
  config: `<svg viewBox="0 0 40 40"><path d="M17 3h6l1 5 4 2 4.5-2.5 4 4.5-3 4 1 4 5 1v6l-5 1-2 4 3 4-4.500 4.500-4.500-2.500-3.500 1.500-1 5h-6l-1-5-4-1.500-4 2.500-4.500-4.500 2.500-4-1.500-4-5-1v-6l5-1 1.500-4-2.500-4.500 4.500-4 4 2.500 4-2z" fill="#fff8e7" stroke="${K}" stroke-width="3" stroke-linejoin="round" transform="translate(1.2 0) scale(0.93)"/><circle cx="20" cy="20" r="5.5" fill="#c9b79a" stroke="${K}" stroke-width="3"/></svg>`,
  gota: `<svg viewBox="0 0 40 40"><path d="M20 4c7 9 11 14 11 20a11 11 0 01-22 0c0-6 4-11 11-20z" fill="#4cb8d8" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><path d="M14 25a6 6 0 004 5" stroke="#dff6f8" stroke-width="3" stroke-linecap="round" fill="none"/></svg>`,
  broto: `<svg viewBox="0 0 40 40"><path d="M20 36V18" stroke="${K}" stroke-width="3.4" stroke-linecap="round"/><path d="M20 20C20 11 13 7 5 8c0 9 6 13 15 12z" fill="#7cc257" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><path d="M20 17c0-8 6-12 15-11c0 9-6 13-15 11z" fill="#93d06a" stroke="${K}" stroke-width="3" stroke-linejoin="round"/></svg>`,
  cesto: `<svg viewBox="0 0 40 40"><path d="M9 17a11 11 0 0122 0" fill="none" stroke="${K}" stroke-width="3.2"/><path d="M4 17h32l-4 17H8z" fill="#c99a52" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><path d="M12 22l2 9M20 22v9M28 22l-2 9" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  mais: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.500" fill="#41b871" stroke="${K}" stroke-width="2.4"/><path d="M12 6.5v11M6.500 12h11" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/></svg>`,
  relogio: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.500" fill="#fff8e7" stroke="${K}" stroke-width="2.4"/><path d="M12 6.500V12l3.500 2.500" stroke="${K}" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>`,
  pulo: `<svg viewBox="0 0 40 40"><path d="M20 33V11M10 20l10-10 10 10" fill="none" stroke="${K}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

const CSS = `
.hud{position:fixed;inset:0;font-family:Inter,'Liberation Sans',sans-serif;color:${K};pointer-events:none;--u:1px}
.hud *{box-sizing:border-box}
.hud svg{display:block}
.card{background:#fff8e7;border:calc(3*var(--u)) solid ${K};border-radius:calc(18*var(--u));box-shadow:0 calc(5*var(--u)) 0 rgba(58,36,20,.32)}
.pill{display:flex;align-items:center;gap:calc(8*var(--u));background:#fff8e7;border:calc(3*var(--u)) solid ${K};border-radius:999px;padding:calc(5*var(--u)) calc(8*var(--u)) calc(5*var(--u)) calc(6*var(--u));box-shadow:0 calc(4*var(--u)) 0 rgba(58,36,20,.32);font-weight:800;font-size:calc(24*var(--u));line-height:1}
.pill .i{width:calc(36*var(--u));height:calc(36*var(--u))}
.pill .lbl{font-size:calc(11.5*var(--u));font-weight:700;letter-spacing:.06em;text-transform:uppercase;opacity:.7;display:block;margin-bottom:calc(2*var(--u))}
.pill .plus{width:calc(28*var(--u));height:calc(28*var(--u));margin-left:calc(4*var(--u))}
.abs{position:absolute}
.row{display:flex;align-items:center}
.bar{height:calc(16*var(--u));border-radius:999px;background:#e6d6b8;border:calc(2.5*var(--u)) solid ${K};overflow:hidden;position:relative}
.bar>i{position:absolute;left:0;top:0;bottom:0;border-radius:999px;background:repeating-linear-gradient(115deg,#59c36f 0 calc(10*var(--u)),#6fd183 calc(10*var(--u)) calc(20*var(--u)))}
.bar.xp>i{background:repeating-linear-gradient(115deg,#4aa8e8 0 calc(10*var(--u)),#6dbdf2 calc(10*var(--u)) calc(20*var(--u)))}
.nivel{position:relative;width:calc(76*var(--u));height:calc(76*var(--u));flex:none}
.nivel svg{width:100%;height:100%;filter:drop-shadow(0 calc(4*var(--u)) 0 rgba(58,36,20,.32))}
.nivel b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:calc(25*var(--u));font-weight:900;padding-top:calc(4*var(--u))}
.t1{font-size:calc(21*var(--u));font-weight:900;line-height:1.1}
.t2{font-size:calc(15*var(--u));font-weight:700;opacity:.82;line-height:1.25}
.t3{font-size:calc(12.5*var(--u));font-weight:800;letter-spacing:.07em;text-transform:uppercase;opacity:.68}
.btn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:calc(4*var(--u));width:calc(104*var(--u));height:calc(98*var(--u));position:relative;font-weight:900;font-size:calc(16*var(--u))}
.btn .i{width:calc(50*var(--u));height:calc(50*var(--u))}
.btn.on{background:#ffe9a8}
.badge{position:absolute;top:calc(-10*var(--u));right:calc(-10*var(--u));min-width:calc(30*var(--u));height:calc(30*var(--u));padding:0 calc(7*var(--u));border-radius:999px;background:#e24a3d;color:#fff;border:calc(2.5*var(--u)) solid ${K};font-size:calc(15*var(--u));font-weight:900;display:flex;align-items:center;justify-content:center}
.badge.g{background:#41b871}
.chip{display:flex;align-items:center;gap:calc(7*var(--u));font-weight:800;font-size:calc(16*var(--u));background:#fff;border:calc(2.5*var(--u)) solid ${K};border-radius:999px;padding:calc(4*var(--u)) calc(11*var(--u)) calc(4*var(--u)) calc(5*var(--u))}
.chip i{width:calc(22*var(--u));height:calc(22*var(--u));border-radius:50%;border:calc(2.5*var(--u)) solid ${K};display:block}
.rbtn{width:calc(58*var(--u));height:calc(58*var(--u));border-radius:50%;display:flex;align-items:center;justify-content:center;padding:calc(9*var(--u))}
.rbtn svg{width:100%;height:100%}
.act{width:calc(96*var(--u));height:calc(96*var(--u));border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:calc(13.5*var(--u));font-weight:900;gap:calc(1*var(--u))}
.act .i{width:calc(44*var(--u));height:calc(44*var(--u))}
.act.big{width:calc(124*var(--u));height:calc(124*var(--u));background:#bfe9ff;font-size:calc(16*var(--u))}
.act.big .i{width:calc(58*var(--u));height:calc(58*var(--u))}
.ped{display:flex;align-items:center;gap:calc(10*var(--u));padding:calc(9*var(--u)) calc(11*var(--u));border-radius:calc(13*var(--u));background:#fff;border:calc(2.5*var(--u)) solid ${K}}
.ped .q{display:flex;gap:calc(5*var(--u));margin-top:calc(3*var(--u))}
.dot{width:calc(15*var(--u));height:calc(15*var(--u));border-radius:50%;border:calc(2*var(--u)) solid ${K};display:inline-block;vertical-align:-2px}
.go{margin-left:auto;text-align:center;line-height:1.15;background:#41b871;color:#fff;border:calc(2.5*var(--u)) solid ${K};border-radius:999px;font-weight:900;font-size:calc(14*var(--u));padding:calc(6*var(--u)) calc(12*var(--u));white-space:nowrap}
.go.w{background:#e6d6b8;color:${K}}
.joy{width:calc(190*var(--u));height:calc(190*var(--u));border-radius:50%;background:rgba(255,248,231,.42);border:calc(3*var(--u)) solid rgba(74,47,27,.55);display:flex;align-items:center;justify-content:center}
.joy i{width:calc(84*var(--u));height:calc(84*var(--u));border-radius:50%;background:#fff8e7;border:calc(3*var(--u)) solid ${K};box-shadow:0 calc(5*var(--u)) 0 rgba(58,36,20,.32);transform:translate(calc(-14*var(--u)),calc(-30*var(--u)))}
.vr-tag{position:fixed;transform:translate(-50%,-100%);font-family:Inter,sans-serif;font-weight:900;color:${K};background:#fff8e7;border:calc(2.5*var(--u)) solid ${K};padding:calc(3*var(--u)) calc(11*var(--u)) calc(3*var(--u)) calc(6*var(--u));border-radius:999px;white-space:nowrap;display:flex;align-items:center;gap:calc(6*var(--u));box-shadow:0 calc(3*var(--u)) 0 rgba(58,36,20,.3);font-size:calc(17*var(--u));--u:1px}
.vr-tag i{width:calc(15*var(--u));height:calc(15*var(--u));border-radius:50%;border:calc(2.5*var(--u)) solid ${K};display:block}
.vr-tag:after{content:'';position:absolute;left:50%;bottom:calc(-8*var(--u));width:calc(10*var(--u));height:calc(10*var(--u));background:#fff8e7;border-right:calc(2.5*var(--u)) solid ${K};border-bottom:calc(2.5*var(--u)) solid ${K};transform:translateX(-50%) rotate(45deg);z-index:0}
.vr-tag>*{position:relative;z-index:1}
`;

function style() {
  if (document.getElementById('hud-css')) return;
  const s = document.createElement('style'); s.id = 'hud-css'; s.textContent = CSS; document.head.appendChild(s);
}
const el = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; };
const I = (name, cls = 'i') => `<span class="${cls}">${ico[name]}</span>`;

export function etiquetas(tags, { portrait = false, big = false } = {}) {
  style();
  const u = big ? 1.25 : portrait ? 1.2 : 1;
  for (const t of tags) {
    const d = el(`<div class="vr-tag" style="left:${t.x}px;top:${t.y}px;--u:${u}px"><i style="background:${t.cor}"></i><span>${t.nome}</span></div>`);
    document.body.appendChild(d);
  }
}

const moedas = (u) => `<div class="pill" style="--u:${u}px">${I('moeda')}<span><span class="lbl">Moedas</span>12.480</span>${I('mais', 'plus')}</div>`;
const cash = (u) => `<div class="pill" style="--u:${u}px">${I('cash')}<span><span class="lbl">Cash</span>85</span>${I('mais', 'plus')}</div>`;
const nivel = () => `<div class="row" style="gap:calc(10*var(--u))"><div class="nivel">${ico.estrela}<b>12</b></div>
  <div class="card" style="padding:calc(9*var(--u)) calc(14*var(--u)) calc(11*var(--u));min-width:calc(250*var(--u))">
    <div class="row" style="justify-content:space-between;gap:calc(14*var(--u))"><span class="t1">Nível 12</span><span class="t2">1.240 / 2.000 XP</span></div>
    <div class="bar xp" style="margin-top:calc(7*var(--u))"><i style="width:62%"></i></div>
  </div></div>`;
const missao = (compact) => `<div class="card" style="padding:calc(12*var(--u)) calc(15*var(--u)) calc(14*var(--u));width:${compact ? '100%' : 'calc(330*var(--u))'}">
  <div class="row" style="gap:calc(10*var(--u))"><span style="width:calc(40*var(--u));height:calc(40*var(--u));flex:none">${ico.missao}</span>
    <div style="flex:1"><div class="t3">Missão do dia</div><div class="t1">Colha 20 espigas de milho</div></div>
    ${compact ? `<div class="row t2" style="gap:calc(5*var(--u));white-space:nowrap"><span style="width:calc(20*var(--u));height:calc(20*var(--u))">${ico.relogio}</span>5 h 12 min</div>` : ''}
  </div>
  <div class="row" style="gap:calc(10*var(--u));margin-top:calc(10*var(--u))"><div class="bar" style="flex:1"><i style="width:60%"></i></div><b class="t2" style="opacity:1">12/20</b></div>
  <div class="row t2" style="gap:calc(6*var(--u));margin-top:calc(9*var(--u))">Prêmio: <span style="width:calc(22*var(--u));height:calc(22*var(--u))">${ico.moeda}</span><b>150</b>&nbsp;+&nbsp;<b>40 XP</b>
    ${compact ? '' : `<span class="row" style="gap:calc(5*var(--u));margin-left:auto"><span style="width:calc(18*var(--u));height:calc(18*var(--u))">${ico.relogio}</span>5 h 12 min</span>`}</div>
</div>`;
const missaoFaixa = () => `<div class="card row" style="padding:calc(9*var(--u)) calc(16*var(--u)) calc(10*var(--u)) calc(12*var(--u));gap:calc(12*var(--u));border-radius:calc(22*var(--u))">
  <span style="width:calc(42*var(--u));height:calc(42*var(--u));flex:none">${ico.missao}</span>
  <div><div class="t3">Missão do dia</div><div class="t1" style="white-space:nowrap">Colha 20 espigas de milho</div></div>
  <div style="width:calc(150*var(--u))"><div class="row t2" style="justify-content:space-between;opacity:1;margin-bottom:calc(4*var(--u))"><b>12/20</b><span class="row" style="gap:calc(4*var(--u));opacity:.8"><span style="width:calc(17*var(--u));height:calc(17*var(--u))">${ico.relogio}</span>5 h 12 min</span></div><div class="bar"><i style="width:60%"></i></div></div>
  <div class="row t2" style="gap:calc(5*var(--u));opacity:1;white-space:nowrap;padding-left:calc(4*var(--u))"><span style="width:calc(26*var(--u));height:calc(26*var(--u))">${ico.moeda}</span><b>150</b>&nbsp;+&nbsp;<b>40 XP</b></div>
</div>`;
const pedidoPronto = () => `<div class="card" style="padding:calc(9*var(--u)) calc(11*var(--u)) calc(11*var(--u));width:calc(318*var(--u))">
  <div class="row" style="gap:calc(8*var(--u));margin-bottom:calc(7*var(--u))"><span style="width:calc(26*var(--u));height:calc(26*var(--u))">${ico.pedidos}</span><span class="t3">Pedidos · 2 de 3 prontos</span></div>
  <div class="ped"><div><div class="t2" style="opacity:1;font-weight:900">Feira da vila</div><div class="t2" style="white-space:nowrap"><span class="dot" style="background:#f58d27"></span> 6 laranjas · <span class="dot" style="background:#f4c532"></span> 4 milhos</div></div><span class="go">Entregar<br><span class="row" style="gap:calc(3*var(--u));justify-content:center"><span style="width:calc(15*var(--u));height:calc(15*var(--u))">${ico.moeda}</span>320</span></span></div>
</div>`;
const pedidos = () => `<div class="card" style="padding:calc(12*var(--u));width:calc(330*var(--u));display:flex;flex-direction:column;gap:calc(8*var(--u))">
  <div class="row" style="gap:calc(8*var(--u))"><span style="width:calc(30*var(--u));height:calc(30*var(--u))">${ico.pedidos}</span><span class="t1">Pedidos</span><span class="t2" style="margin-left:auto">2 de 3 prontos</span></div>
  <div class="ped"><div><div class="t2" style="opacity:1;font-weight:900">Feira da vila</div><div class="t2"><span class="dot" style="background:#f58d27"></span> 6 laranjas · <span class="dot" style="background:#f4c532"></span> 4 milhos</div></div><span class="go">Entregar · 320</span></div>
  <div class="ped"><div><div class="t2" style="opacity:1;font-weight:900">Cooperativa</div><div class="t2"><span class="dot" style="background:#d8283f"></span> 10 sacas de café</div></div><span class="go">Entregar · 540</span></div>
  <div class="ped"><div><div class="t2" style="opacity:1;font-weight:900">Caminhão</div><div class="t2"><span class="dot" style="background:#8a5a3c"></span> 8 mandiocas · <span class="dot" style="background:#b9c552"></span> 5 canas</div></div><span class="go w">Faltam 3</span></div>
</div>`;
const nav = (ativo) => `<div class="row" style="gap:calc(14*var(--u))">
  <div class="card btn${ativo === 'pedidos' ? ' on' : ''}">${I('pedidos')}Pedidos<span class="badge">2</span></div>
  <div class="card btn">${I('amigos')}Amigos<span class="badge g">3</span></div>
  <div class="card btn">${I('loja')}Loja</div>
  <div class="card btn">${I('mochila')}Armazém</div>
</div>`;
const amigos = () => `<div class="card" style="padding:calc(9*var(--u)) calc(12*var(--u)) calc(11*var(--u))">
  <div class="t3" style="margin-bottom:calc(6*var(--u))">Na fazenda agora · 3 de 4</div>
  <div class="row" style="gap:calc(7*var(--u))"><span class="chip"><i style="background:#f6c73d"></i>Ana</span><span class="chip"><i style="background:#2fb5a8"></i>Léo</span><span class="chip"><i style="background:#f27aa6"></i>Bia</span><span class="chip" style="background:#d9f3e2;padding-left:calc(7*var(--u))"><span style="width:calc(20*var(--u));height:calc(20*var(--u))">${ico.mais}</span>Convidar</span></div>
</div>`;
const acoes = (modo) => modo === 'B'
  ? `<div style="position:relative;width:calc(250*var(--u));height:calc(230*var(--u))">
      <div class="card act big abs" style="right:0;bottom:0">${I('gota')}Regar</div>
      <div class="card act abs" style="right:calc(132*var(--u));bottom:calc(4*var(--u))">${I('cesto')}Colher</div>
      <div class="card act abs" style="right:calc(14*var(--u));bottom:calc(134*var(--u))">${I('pulo')}Pular</div>
    </div>`
  : `<div class="row" style="gap:calc(10*var(--u))">
      <div class="card act">${I('broto')}Plantar</div><div class="card act" style="background:#bfe9ff">${I('gota')}Regar</div><div class="card act">${I('cesto')}Colher</div>
    </div>`;

export function montarHUD({ portrait = false, modo = 'A' } = {}) {
  style();
  const u = portrait ? 1.42 : 1;
  const m = portrait ? 26 : 26;
  const hud = el(`<div class="hud" style="--u:${u}px"></div>`);
  if (!portrait) {
    hud.appendChild(el(`<div class="abs" style="left:${m}px;top:${m - 4}px">${nivel()}</div>`));
    hud.appendChild(el(`<div class="abs row" style="right:${m}px;top:${m}px;gap:12px">${moedas(u)}${cash(u)}<div class="card rbtn">${ico.config}</div></div>`));
    hud.appendChild(el(`<div class="abs" style="left:50%;top:${m - 2}px;transform:translateX(-50%)">${missaoFaixa()}</div>`));
    hud.appendChild(el(`<div class="abs" style="left:${m}px;top:112px">${pedidoPronto()}</div>`));
    hud.appendChild(el(`<div class="abs" style="left:50%;bottom:${m}px;transform:translateX(-50%)">${nav('')}</div>`));
    hud.appendChild(el(`<div class="abs" style="left:${m}px;bottom:${m}px">${modo === 'B' ? `<div class="joy"><i></i></div>` : amigos()}</div>`));
    if (modo === 'B') hud.appendChild(el(`<div class="abs" style="left:${m + 220}px;bottom:${m}px">${amigos()}</div>`));
    hud.appendChild(el(`<div class="abs" style="right:${m}px;bottom:${m}px">${acoes(modo)}</div>`));
  } else {
    // retrato: tudo empilhado em faixas, com textos maiores
    hud.appendChild(el(`<div class="abs" style="left:${m}px;top:${m}px">${nivel()}</div>`));
    hud.appendChild(el(`<div class="abs" style="right:${m}px;top:${m}px;display:flex;flex-direction:column;gap:12px;align-items:flex-end">${moedas(u)}${cash(u)}</div>`));
    hud.appendChild(el(`<div class="abs" style="left:${m}px;right:${m}px;top:236px">${missao(true)}</div>`));
    hud.appendChild(el(`<div class="abs" style="left:${m}px;right:${m}px;bottom:${m}px;display:flex;justify-content:space-between">${nav('').replace('gap:calc(14*var(--u))', 'gap:0;justify-content:space-between;width:100%').replace(/class="card btn/g, 'style="width:calc(170*var(--u));height:calc(112*var(--u));font-size:calc(19*var(--u))" class="card btn')}</div>`));
    hud.appendChild(el(`<div class="abs" style="left:${m}px;bottom:${m + 190}px">${modo === 'B' ? `<div class="joy"><i></i></div>` : amigos()}</div>`));
    if (modo === 'B') hud.appendChild(el(`<div class="abs" style="left:${m}px;top:436px">${amigos()}</div>`));
    hud.appendChild(el(`<div class="abs" style="right:${m}px;bottom:${m + 190}px">${modo === 'B' ? acoes('B') : `<div style="display:flex;flex-direction:column;gap:12px">${acoes('A').replace('class="row"', 'style="display:flex;flex-direction:column;gap:calc(10*var(--u))" class=""')}</div>`}</div>`));
  }
  document.body.appendChild(hud);
  return hud;
}

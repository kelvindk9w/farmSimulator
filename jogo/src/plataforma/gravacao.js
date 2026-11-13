// Gravação no aparelho (localStorage) e cópia de segurança por texto. O navegador pode não deixar gravar
// (modo privado, página embutida): tudo aqui tem try/catch e o jogo segue sem gravação.
import { resumo } from '../nucleo/util.js';

export const CHAVE = 'fazenda.jogo.v1';
const CHAVE_PREFS = 'fazenda.jogo.prefs';
const MARCA = 'FAZENDA1';

let guarda; // undefined = ainda não testou; null = não há
function achar() {
  if (guarda !== undefined) return guarda;
  try { const s = globalThis.localStorage; s.setItem(CHAVE + '.t', '1'); s.removeItem(CHAVE + '.t'); guarda = s; } catch { guarda = null; }
  return guarda;
}
function ler(chave) { try { const s = achar(); const t = s && s.getItem(chave); return t ? JSON.parse(t) : null; } catch { return null; } }
function gravar(chave, obj) { try { const s = achar(); if (!s) return false; s.setItem(chave, JSON.stringify(obj)); return true; } catch { return false; } }

const b64 = (texto) => btoa(unescape(encodeURIComponent(texto)));
const deB64 = (b) => decodeURIComponent(escape(atob(b)));

export const gravacao = {
  get disponivel() { return !!achar(); },
  ler: () => ler(CHAVE),
  gravar: (obj) => gravar(CHAVE, obj),
  apagar() { try { const s = achar(); if (s) s.removeItem(CHAVE); } catch { /* sem gravação */ } },
  // uma gravação que não abriu fica guardada à parte, para não se perder ao gravar por cima
  guardarRuim() { try { const s = achar(); const t = s && s.getItem(CHAVE); if (t) s.setItem(CHAVE + '.ruim', t); } catch { /* sem gravação */ } },
  lerPrefs: () => ler(CHAVE_PREFS) || {},
  gravarPrefs: (p) => gravar(CHAVE_PREFS, p),

  // a fazenda inteira num texto para copiar: marca, conteúdo e um resumo que acusa texto cortado
  exportar(obj) {
    const json = JSON.stringify(obj);
    return `${MARCA}.${b64(json)}.${resumo(json)}`;
  },
  // devolve o objeto gravado; lança Error com frase para o jogador se o texto não servir
  importar(texto) {
    const t = String(texto || '').replace(/\s+/g, '');
    if (!t) throw new Error('cole o texto exportado antes');
    if (t.startsWith('{')) { try { return JSON.parse(String(texto)); } catch { throw new Error('o texto não é uma gravação deste jogo'); } }
    const partes = t.split('.');
    if (partes.length !== 3 || partes[0] !== MARCA) throw new Error('o texto não é uma gravação deste jogo');
    let json;
    try { json = deB64(partes[1]); } catch { throw new Error('o texto está cortado ou foi alterado'); }
    if (resumo(json) !== partes[2]) throw new Error('o texto está cortado ou foi alterado');
    try { return JSON.parse(json); } catch { throw new Error('o texto está cortado ou foi alterado'); }
  },
};

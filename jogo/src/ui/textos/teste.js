// Textos do atalho da versão de teste (painel de configurações). Saem junto com o atalho.
import { T, numero } from '../textos.js';

T.teste = {
  secao: 'Versão de teste',
  info: 'Para testar o que vem depois sem jogar horas: sobe direto para o nível e dá ouro e material. Use numa fazenda de teste (fica marcado na gravação).',
  nivel: (n) => `Nível ${n}`,
  material: 'Só ouro e material',
  feito: (n, ouro) => `Pronto: nível ${n} e mais ${numero(ouro)} de ouro, madeira, tábua, prego, pedra, fibra, milho e ração.`,
  jaPassou: (n) => `Você já está no nível ${n}.`,
};

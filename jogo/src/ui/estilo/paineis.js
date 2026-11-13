// CSS dos painéis (loja, mochila, missões, configurações, construir, celeiro, indústria, pedidos, abrigo, animais,
// caderno, conquistas, terras, fazenda, cash, amigos, guarda-roupa, presentes...) no visual aprovado: moldura de
// madeira, cabeçalho de tábua com ícone e título, fechar vermelho redondo, abas, cartões e botões de preço.
// O CSS antigo (index.html) continua dando a arrumação de cada painel; aqui só muda a pele. Os tons que diziam algo
// (verde = pronto, amarelo = agora) passam a ser uma tinta por cima do cartão (::before, multiplicada).
import { mold, img, fixa } from './pecas.js';

// onde o botão comum vira o botão de madeira clara (no HUD os botões têm regras próprias, em estilo/hud.js)
const BT = (s = '') => ['.veu', '.subida', '.cons-barra'].map((p) => `#ui ${p} .bt${s}`).join(',') + `,#ui .bt.concluir${s}`;

// cartões com moldura (o nome antigo de cada um continua)
const CARTOES = ['.oferta', '.missao', '.conquista', '.licao', '.cons-obra', '.cons-ampliar', '.abr-medida', '.abr-aviso', '.ind-fila', '.ind-dica', '.ind-pronto', '.vagas .vaga', '.relogio-de-teste', '.caixa-de-teste'].map((s) => '#ui ' + s).join(',');
// tinta por cima do cartão: [seletor, cor]
const TINTAS = [
  ['.missao.feita', '#dcf3c4'], ['.conquista.pronta', '#ffe9a6'], ['.conquista.completa', '#dcf3c4'], ['.licao.agora', '#ffe9a6'],
  ['.cons-obra', '#fff0bf'], ['.ind-dica', '#fff0bf'], ['.ind-pronto', '#d8f2c0'], ['.abr-aviso', '#ffe9a6'],
  ['.abr-bicho.pronto', '#dcf3c4'], ['.abr-bicho.fim', '#ffe9a6'], ['.abr-bicho.estimacao', '#e2edff'],
  ['.oferta.comprada', '#dcf3c4'], ['.oferta.lote.comprado', '#dcf3c4'], ['.oferta.lote.pedido', '#e6f6d2'], ['.oferta.ferramenta.gasta', '#ffd6c8'],
  ['.oferta.pacote', '#e2f7f4'], ['.bt.concluir', '#fff0bf'], ['.bt.peca.tem', '#dcf3c4'], ['.bt.peca.vestindo', '#ffe9a6'],
  ['.ind-fazendo', '#fff0bf'],
];

export const CSS_PAINEIS = `
/* ---------- o véu e o cartão do painel ---------- */
#ui .veu{background:rgba(30,20,8,.5);padding:14px 14px 8px}
#ui .cartao{${mold('painel', '28px 28px 29px 28px')}position:relative;width:min(716px,100%);max-height:100%;border-width:10px;padding:2px 4px 6px;border-radius:26px;overflow:visible;display:flex;flex-direction:column;color:#4a2a12}
/* o cabeçalho de tábua: ícone, título, saldo; o fechar fica no canto, para fora */
#ui .cartao>header{${mold('cabecalho', '22px 28px 22px 28px')}flex:none;min-height:44px;border-width:6px;margin:-4px -2px 0;padding:0 40px 0 14px;gap:8px;border-radius:14px;font-size:22px;font-weight:900;color:#4a2a12;display:flex;align-items:center}
#ui .cartao>header>canvas.ic{width:36px!important;height:36px!important;margin:-4px 0}
#ui .cartao>header .titulo{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#ui .cartao>header .saldo{display:flex;gap:6px;align-items:center;font-size:17px;font-weight:800}
#ui .cartao>header .saldo:not(:empty):not(.duas),#ui .cartao>header .saldo .moeda{${mold('pilula', '14px')}height:32px;border-width:4px;padding:0 10px 0 1px;gap:3px;border-radius:16px;display:flex;align-items:center;margin:-4px 0}
#ui .cartao>header .saldo canvas.ic{width:26px!important;height:26px!important}
#ui .cartao>header .fechar{${fixa('botao-fechar-normal')}position:absolute;right:-12px;top:-14px;width:47px;height:48px;min-width:0;min-height:0;padding:0;border:0;border-image:none;border-radius:50%;z-index:2}
#ui .cartao>header .fechar:active{${fixa('botao-fechar-apertado')}transform:none}
#ui .cartao>header .fechar>canvas{visibility:hidden}
#ui .cartao>header .fechar:focus-visible{border-radius:50%}
/* no celular deitado o cartão fica um pouco mais estreito: o fechar não encosta no Menu, à direita */
#ui.compacto .veu>.cartao{width:min(692px,100%)}
#ui.compacto .cartao>header .fechar{right:-8px}
#ui .cartao>header .bt.quadrado:not(.fechar){${mold('botao-hud-normal', '21px 16px 16px 16px')}width:44px;height:44px;border-width:6px 5px 7px;margin:-6px 0;padding:0;border-radius:12px}
#ui .cartao>header .bt.quadrado:not(.fechar):active{${img('botao-hud-apertado')}}
#ui .cartao>header .bt.quadrado:not(.fechar)>canvas.ic{width:28px!important;height:28px!important}
/* o corpo: o fundo mais claro, com rolagem */
#ui .cartao>.corpo{${mold('painel-fundo', '16px 17px')}flex:1 1 auto;min-height:0;border-width:4px;margin-top:4px;padding:6px 8px 8px;border-radius:14px;overflow-y:auto}
#ui .cartao>.abas-do-painel+.corpo{margin-top:-2px}

/* ---------- abas ---------- */
#ui .abas{gap:3px;align-items:flex-end}
#ui .veu .bt.aba{${mold('aba-normal', '16px 18px 4px 18px')}min-height:44px;height:44px;border-width:5px 6px 0;padding:0 8px;gap:4px;border-radius:12px 12px 0 0;font-size:15px;font-weight:800;color:#4a2a12;white-space:nowrap}
#ui .veu .bt.aba:active{filter:brightness(.94)}
#ui .veu .bt.aba.ativo{${img('aba-selecionada')}height:48px;margin-top:-4px;color:#4a2a12;-webkit-text-stroke:0}
#ui .veu .corpo .abas{border-bottom:3px solid #e9a259;margin-bottom:8px;padding:0 2px}
/* a fileira de abas da família da loja (loja, animais, enfeites, cash): presa embaixo do cabeçalho */
#ui .abas-do-painel{flex:none;display:flex;gap:3px;margin-top:3px;padding:0 4px;align-items:flex-end;height:49px}
#ui .abas-do-painel .bt.aba{flex:1 1 auto;justify-content:center;font-size:14px;padding:0 3px;letter-spacing:-.2px}
#ui .abas-do-painel .bt.aba>canvas.ic{width:24px!important;height:24px!important}
#ui .abas-do-painel .bt.aba>span{overflow:hidden;text-overflow:ellipsis}
#ui .veu.da-loja .cartao{height:min(368px,100%)}
#ui:not(.compacto) .veu.da-loja .cartao{height:min(470px,100%)}

/* ---------- botões ---------- */
${BT()}{${mold('botao-hud-normal', '21px 16px 16px 16px')}min-height:44px;border-width:5px 5px 7px;padding:0 12px;border-radius:12px;color:#4a2a12;font-weight:800;box-shadow:none}
${BT(':active')}{${img('botao-hud-apertado')}transform:none}
${BT('.verde')}{${mold('botao-verde-normal', '18px 18px 15px 18px')}border-width:5px 6px 6px;color:#fff;-webkit-text-stroke:3px #24470e;paint-order:stroke fill}
${BT('.verde:active')}{${img('botao-verde-apertado')}}
${BT('.verde.sem')},${BT('.verde[disabled]')}{${img('botao-verde-desativado')}opacity:1;-webkit-text-stroke-color:#4b5745}
${BT('.cash')},${BT('.verde.cash')}{${mold('botao-turquesa-normal', '18px 18px 15px 18px')}border-width:5px 6px 6px;color:#fff;-webkit-text-stroke:3px #0b4651;paint-order:stroke fill}
${BT('.cash:active')}{${img('botao-turquesa-apertado')}}
${BT('.cash.sem')}{filter:grayscale(.65);opacity:.85}
${BT('.ruim')}{${mold('botao-verde-normal', '18px 18px 15px 18px')}border-width:5px 6px 6px;filter:hue-rotate(-100deg) saturate(1.3);color:#fff}
${BT('.ativo:not(.aba)')}{${img('botao-hud-selecionado')}color:#fff;-webkit-text-stroke:3px #24470e;paint-order:stroke fill}
${BT('.travado')}{${mold('botao-marrom', '18px 18px 15px 18px')}border-width:5px 6px 6px;color:#fff;-webkit-text-stroke:3px #3a1f0c;paint-order:stroke fill;cursor:default}
${BT('.sem:not(.verde):not(.cash)')}{opacity:.6}
${BT('[disabled]:not(.verde)')}{opacity:.5}
#ui .preco{display:inline-flex;align-items:center;gap:4px;font-variant-numeric:tabular-nums}
#ui .veu .bt .preco canvas.ic{width:22px!important;height:22px!important}
#ui .bt.concluir{position:relative;isolation:isolate}

/* ---------- cartões ---------- */
${CARTOES}{${mold('cartao-item-normal', '21px 20px 20px 20px')}border-width:5px;border-radius:14px;box-shadow:none;position:relative;isolation:isolate;outline-offset:-2px}
#ui .oferta.travada,#ui .ind-receita.travada,#ui .vagas .vaga.travada,#ui .oferta.lote.nivel,#ui .oferta.lote.exige{${img('cartao-item-travado')}}
#ui .oferta.travada .nome{color:#7c6c60}
#ui .oferta.lote.pedido{outline:3px solid rgba(65,168,92,.7)}
#ui .conquista.pronta{outline:3px solid rgba(246,193,44,.75)}
${TINTAS.map(([s]) => '#ui ' + s + '::before').join(',')}{content:'';position:absolute;inset:3px;border-radius:12px;background:var(--tinta);mix-blend-mode:multiply;z-index:-1;pointer-events:none}
${TINTAS.map(([s, c]) => `#ui ${s}{--tinta:${c}}`).join('\n')}
#ui .ind-fazendo,#ui .bt.peca{position:relative;isolation:isolate}
#ui .ind-fazendo{background:none}
#ui .ind-espera{border-top-color:rgba(160,104,52,.35)}
#ui .ped-quadro{border-color:#a0612b;border-radius:14px}
#ui .ind-vaga{border-color:#c08a52}
#ui .ind-vaga.trancada{${mold('cartao-item-travado', '21px 20px 20px 20px')}border-width:5px}
/* (a moldura do cartão tem a borda grossa no desenho: o texto fica mais para dentro) */
#ui .veu:not(.da-loja) .oferta{padding:6px 10px}
#ui .veu .conquista{padding-left:10px;padding-right:10px}
/* (o botão do cocho e do bebedouro não encolhe abaixo do texto: quem cede é a coluna do meio) */
#ui .abr-medida .bt{min-width:max-content;padding:0 10px}
/* as fichas de item (mochila, prêmios, o que liberou) */
#ui .veu .item,#ui .subida .item{${mold('pilula', '14px')}border-width:4px;border-radius:16px;min-height:40px;padding:0 10px 0 2px;gap:5px;box-shadow:none;font-weight:800}
#ui .secao{color:#8a5a2b;letter-spacing:.04em}
#ui .opcao{border-bottom-color:rgba(160,104,52,.3)}
#ui .veu textarea{border:2.5px solid #b06a2c;border-radius:12px;background:#fffaf0;color:#4a2a12}
#ui .nota.aviso-de-teste,#ui .aviso-de-teste{background:#fff0bf;border-color:#c98a1c}
#ui .codigo{border-color:#b06a2c;background:#fffaf0}
#ui .prova canvas{border-color:#b06a2c}
#ui .veu .ponto{${fixa('bolinha-novidade')}position:absolute;right:-6px;top:-6px;width:18px;height:18px;border:0;border-radius:50%}
#ui .veu .barra:not(.hud){${mold('barra-moldura', '8px 9px')}height:16px;border-width:3px;border-radius:8px;background:#5a3014}
#ui .veu .barra:not(.hud) i{border-radius:5px}

/* ---------- loja (e família: animais, enfeites, cash): três cartões por linha, preço no botão ---------- */
#ui .veu.da-loja .corpo>.grade,#ui .veu.da-loja .cons .grade{grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
#ui .veu.da-loja .oferta{display:flex;flex-direction:column;align-items:center;text-align:center;gap:1px;padding:2px 5px 5px;min-height:132px}
#ui .veu.da-loja .oferta>canvas.ic{width:48px!important;height:48px!important;margin-top:1px;flex:none}
#ui .veu.da-loja .oferta .nome{font-size:16px;font-weight:800;line-height:1.1}
#ui .veu.da-loja .oferta .nome small{display:block;font-size:14px}
#ui .veu.da-loja .oferta .info{font-size:14px;font-weight:600;line-height:1.15;color:#8a5a2b;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
#ui .veu.da-loja .oferta .botoes,#ui .veu.da-loja .oferta .cons-pe{margin-top:auto;width:100%;display:flex;gap:4px;align-items:center;justify-content:center}
#ui .veu.da-loja .oferta .botoes .bt{flex:1 1 auto;min-width:0;padding:0 6px;font-size:18px}
#ui .veu.da-loja .oferta .botoes .bt.verde,#ui .veu.da-loja .oferta .botoes .bt.cash{flex:2 1 auto}
#ui .veu.da-loja .oferta .botoes .bt.mais{font-size:16px;flex:1 1 auto}
/* o botão de preço mostra só a moeda e o número; "Comprar" continua no botão para o leitor de tela (navegador sem :has mostra os dois) */
#ui .veu.da-loja .oferta .botoes .bt.verde:has(>.preco)>span:not(.preco),#ui .veu.da-loja .oferta .botoes .bt.cash:has(>.preco)>span:not(.preco){position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
#ui .veu.da-loja .oferta.animal>canvas.ic{align-self:center;grid-row:auto}
#ui .veu.da-loja .oferta .botoes{padding-top:4px}
#ui .veu.da-loja .oferta .botoes .bt:not(.verde):not(.cash):not(.mais){font-size:16px}
#ui .veu.da-loja .oferta.travada .info.trava{${mold('botao-marrom', '18px 18px 15px 18px')}box-sizing:border-box;border-width:5px 5px 7px;border-radius:14px;margin-top:auto;width:100%;min-height:40px;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:900;color:#fff;-webkit-text-stroke:3px #4a2a12;paint-order:stroke fill;-webkit-line-clamp:unset;overflow:visible}
#ui .veu.da-loja .oferta.travada .info.trava canvas.ic{position:absolute;right:6px;top:5px;width:24px!important;height:24px!important}
#ui .veu.da-loja .oferta.travada .info.trava .preco{display:none}
#ui .veu.da-loja .oferta .botoes .bt:not(.verde):not(.cash):not(.mais){white-space:normal;line-height:1.05}
#ui .veu.da-loja .oferta .bt.travado{width:100%;font-size:18px}
#ui .veu.da-loja .oferta .cadeado{position:absolute;right:6px;top:5px}
#ui .veu.da-loja .oferta.travada>canvas.ic:first-child{filter:grayscale(1) opacity(.55)}
#ui .veu.da-loja .oferta.animal .botoes>.preco{margin:0}
#ui .veu.da-loja .oferta.animal .nome>.preco{float:none;display:flex;justify-content:center}
#ui .veu.da-loja .cons-custo{justify-content:center;flex:1 1 100%}
#ui .veu.da-loja .oferta .cons-pe{flex-wrap:wrap}
#ui .veu.da-loja .oferta .cons-pe .bt{flex:1 1 auto;margin:0}
#ui .veu.da-loja .grade.pacotes{grid-template-columns:repeat(3,minmax(0,1fr))}

/* ---------- presente do dia: a cartela dos sete dias ---------- */
#ui .cartela{gap:5px;margin:8px 2px 10px;align-items:stretch}
#ui .cartela .dia{${mold('cartao-dia-futuro', '18px 16px 33px 16px')}border-width:5px 5px 6px;border-radius:12px;min-height:118px;padding:2px 2px 4px;gap:2px;box-shadow:none;position:relative}
#ui .cartela .dia.aberto{${img('cartao-dia-aberto')}}
#ui .cartela .dia.aberto .mini{opacity:.75}
#ui .cartela .dia.especial{${img('cartao-dia-especial')}}
#ui .cartela .dia.hoje{${mold('cartao-dia-hoje', '27px 23px 42px 23px')}border-image-outset:9px 7px;z-index:1;transform:scale(1.04)}
#ui .cartela .rot{font-size:17px;font-weight:900}
#ui .cartela .estado{display:flex;align-items:center;justify-content:center;gap:2px;font-size:14px;font-weight:800;min-height:24px}
#ui .cartela .estado canvas.ic{width:20px!important;height:20px!important}
#ui .cartela .dia.aberto .estado{color:#2f6e1a}
#ui .cartela .dia.hoje .estado{color:#a2620c;font-size:17px;font-weight:900}
#ui .veu[data-painel="presentes"] .pe .bt{min-width:260px;min-height:52px;font-size:22px}
#ui .veu[data-painel="presentes"] .pe .bt canvas.ic{width:36px!important;height:36px!important}

/* ---------- Minha fazenda: atalhos (com a bolinha de novidade) ---------- */
#ui .veu .bt.atalho{min-height:64px;padding:2px 8px}
#ui .veu .bt.atalho .ponto{right:-5px;top:-5px}
`;

// CSS do HUD (a tela do jogo), no visual aprovado: pílulas de madeira, selo do nível, botões quadrados com relevo,
// o Menu do celular, o balão do Seu Tonho, o aviso curto, a vaga "Na mão", o balãozinho e a roda das ações por toque,
// a alavanca e o botão de agir.
// Tudo dentro de #ui (vence o CSS antigo do index.html). Medidas em px do celular deitado (844 x 390); no
// computador e na TV o #ui inteiro cresce pelo zoom (--esc, estilo/index.js).
import { mold, img, fixa } from './pecas.js';

export const CSS_HUD = `
#ui{zoom:var(--esc,1);font:700 16px/1.15 system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans",sans-serif;color:#4a2a12}
#ui .branco,#ui .modo.ativo>span:not(.conta),#ui .bt.verde,#ui .bt.cash,#ui .bt.ruim,#ui .bt.ativo:not(.aba){color:#fff;-webkit-text-stroke:3px #3a1f0c;paint-order:stroke fill}
#ui button:focus-visible,#ui .foco-teclas:focus{outline:4px solid #ff9d2e;outline-offset:2px;border-radius:16px}

/* ---------- em cima, à esquerda: nível, ouro, cash; cesto, regador, fôlego ---------- */
#ui .topo-esq{gap:9px}
#ui .linha{gap:6px}
#ui .chip{${mold('pilula', '18px')}height:36px;border-width:6px;padding:0 10px 0 1px;gap:3px;border-radius:18px;font-weight:800;font-size:19px;color:#4a2a12;font-variant-numeric:tabular-nums}
#ui .chip>canvas.ic{width:30px!important;height:30px!important}
#ui .chip.nivel{position:relative;margin-left:22px;padding-left:22px;gap:6px}
#ui .chip.nivel .selo{${fixa('selo-nivel')}position:absolute;left:-30px;top:-12px;width:47px;height:48px;border:0;border-radius:0;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#fff;-webkit-text-stroke:4px #23400f;paint-order:stroke fill}
#ui .barra.hud{${mold('barra-moldura', '8px 9px')}position:relative;width:90px;height:17px;border-width:3px;border-radius:9px;overflow:visible}
#ui .barra.hud i{${mold('barra-enchimento-dourado', '6px 7px')}position:absolute;left:0;top:-1px;height:12px;width:0;min-width:13px;border-width:2px;transform:none;transition:width .25s}
#ui .barra.hud.verde i,#ui .anda .barra.hud i{${img('barra-enchimento-verde')}}
#ui .chip.folego .barra.hud{width:64px}
#ui .chip.folego .barra.hud i{transition:none;filter:hue-rotate(-28deg) saturate(1.3)}
#ui .chip.folego .barra.hud.cansada i{filter:grayscale(.85)}
#ui .chip.cheio>span,#ui .chip.vazio>span{color:#c62f1d}
#ui .chip.cheio{animation:treme .25s}
#ui .chip.cash{padding-right:0}
#ui .chip .mais-cash{width:44px;height:44px;margin:-10px -6px -10px 2px;padding:0;border:0;background:none;display:flex;align-items:center;justify-content:center;box-shadow:none}
#ui .chip .mais-cash canvas.ic{width:28px!important;height:28px!important}
#ui .chip .mais-cash:active canvas{transform:translateY(1px) scale(.94)}
#ui .chip.trab-carga,#ui .chip.trab-agua,#ui .chip.recipiente{font-size:17px}

/* ---------- em cima, à direita: os botões dos painéis e o Menu ---------- */
#ui .topo-dir{gap:4px;align-items:flex-start}
#ui .bt.quadrado{${mold('botao-hud-normal', '28px 22px 22px 22px')}width:55px;height:55px;min-width:0;min-height:0;border-width:8px 7px 9px;padding:0;border-radius:14px;position:relative;flex-direction:column;gap:0}
#ui .bt.quadrado:active{${img('botao-hud-apertado')}transform:none}
#ui .bt.quadrado>canvas.ic{width:40px!important;height:40px!important}
#ui .bt.quadrado.ativo{${img('botao-hud-selecionado')}}
#ui .bt.quadrado.menu{width:58px}
#ui .bt.quadrado.menu>canvas.ic{width:32px!important;height:26px!important;margin-top:-1px}
#ui .bt.quadrado.menu>span:not(.ponto){font-size:14px;font-weight:800;line-height:1;margin-top:-1px}
#ui .topo-dir.menu-aberto .bt.menu{${img('botao-hud-apertado')}}
#ui .ponto{${fixa('bolinha-novidade')}position:absolute;right:-7px;top:-7px;width:18px;height:18px;border:0;border-radius:50%;pointer-events:none}
#ui .rotulo-menu{display:none}
/* computador e tablet: os oito botões à vista (a lista do Menu vira uma fila antes da Mochila) */
#ui .menu-lista{display:flex;gap:4px}
#ui .bt.menu{display:none}
/* celular deitado: só Mochila, Loja, Construir e Menu; o resto desce numa lista */
#ui.compacto .bt.menu{display:flex}
#ui.compacto .menu-lista{display:none;position:absolute;right:-3px;top:62px;width:240px;flex-direction:column;gap:0;${mold('menu-lista', '27px 36px 18px 17px')}border-width:15px 9px 9px 8px;padding:0 2px;z-index:4;max-height:calc(100vh / var(--esc, 1) - 76px);overflow-y:auto;overscroll-behavior:contain}
#ui.compacto .topo-dir.menu-aberto .menu-lista{display:flex}
/* (a caixa de correio que recebeu presente pulsa só o ícone: a fileira inteira crescendo encostaria nas vizinhas) */
#ui .bt.correio.chegou{animation:none}
#ui .bt.correio.chegou>canvas.ic{animation:pulsa .5s 3}
#ui.compacto .menu-lista .bt.quadrado{border:0;border-image:none;background:none;width:100%;height:44px;flex:none;margin:0;flex-direction:row;justify-content:flex-start;gap:12px;padding:0 6px 0 4px;border-radius:8px}
#ui.compacto .menu-lista .bt.quadrado+.bt.quadrado{border-top:1.5px solid rgba(160,104,52,.4)}
#ui.compacto .menu-lista .bt.quadrado:active{background:rgba(214,160,92,.35)}
#ui.compacto .menu-lista .bt.quadrado>canvas.ic{width:36px!important;height:36px!important;flex:none}
#ui.compacto .menu-lista .rotulo-menu{display:block;order:1;font-size:18px;font-weight:800;white-space:nowrap}
#ui.compacto .menu-lista .ponto{position:static;order:2;margin-left:auto;flex:none}

/* ---------- o balão do Seu Tonho ---------- */
#ui .balao{${mold('balao', '21px 22px 22px 22px')}top:calc(max(6px,env(safe-area-inset-top)) + 61px);width:min(330px,40%);border-width:7px;padding:3px 9px 3px 4px;gap:9px;align-items:center;border-radius:18px;color:#4a2a12}
#ui .balao.pequeno{width:min(276px,34%)}
#ui .balao.esq{top:calc(max(6px,env(safe-area-inset-top)) + 96px)}
#ui .balao .quem{width:66px}
#ui .balao .retrato,#ui .balao.pequeno .retrato{width:62px;height:62px;border:4px solid #e8913a;box-shadow:0 0 0 2px #3a1f0c;background:#9fd3f0;margin:2px}
#ui .balao .retrato canvas,#ui .balao.pequeno .retrato canvas{width:58px!important;height:58px!important}
#ui .balao.pequeno .quem{width:66px}
#ui .balao .quem>div:last-child{font-size:14px;margin-top:2px}
#ui .balao b{font-size:19px;font-weight:900;line-height:1.1}
#ui .balao .fala{font-size:14px;font-weight:800;line-height:1.18}
#ui .balao .anda{margin-top:3px;gap:5px;font-size:16px;font-weight:900}
#ui .balao .anda .barra.hud{flex:1;width:auto;height:16px}
#ui .balao .anda .barra.hud i{height:11px}
#ui .balao.feita::before,#ui .balao.avulsa::before{content:'';position:absolute;inset:6px;border-radius:14px;z-index:-1;background:#e3f6cf}
#ui .balao.avulsa::before{background:#fff2c2}
#ui .balao{isolation:isolate}

/* ---------- o aviso curto (no alto, debaixo das duas fileiras de pílulas e ao lado do balão) ----------
   (a segunda fileira muda de largura: "no poço", o fôlego, a carroça... então o aviso fica abaixo dela, e não ao lado) */
#ui .avisos{top:calc(max(6px,env(safe-area-inset-top)) + 94px);left:8px;right:8px;gap:4px}
#ui:has(.balao:not(.esq):not([hidden])) .avisos{right:calc(min(276px,34%) + 16px)}
#ui:has(.balao:not(.esq):not(.pequeno):not([hidden])) .avisos{right:calc(min(330px,40%) + 16px)}
#ui:has(.balao.esq:not([hidden])) .avisos{left:calc(min(330px,40%) + 16px)}
body.com-painel #ui .avisos{top:max(6px,env(safe-area-inset-top));left:0;right:0}
#ui .aviso{${mold('aviso', '14.3px 15px 14px 15px')}min-height:29px;border-width:4px 6px;padding:0 8px 0 3px;display:flex;align-items:center;gap:5px;max-width:100%;font-size:16px;font-weight:800;line-height:1.15;text-align:left;border-radius:15px}
#ui .aviso canvas.ic{flex:none}
#ui .aviso.deitar{padding:8px 16px;font-size:18px}

/* ---------- embaixo: dica, fila e a fileira de baixo ---------- */
#ui .rodape{bottom:max(8px,env(safe-area-inset-bottom));gap:5px}
#ui .dica{${mold('aviso', '14.3px 15px 14px 15px')}border-width:4px 6px;padding:2px 10px;max-width:100%;font-size:14px;font-weight:800;border-radius:15px}
/* (a largura se mede na linha da dica, que ocupa a tela toda: assim ela não chega na alavanca nem no botão de ação) */
#ui .linha-info{max-width:min(560px,calc(100% - 290px))}
#ui .dica.fraca{opacity:.9}
#ui .fila{${mold('pilula', '18px')}border-width:5px;min-height:44px;padding:0 6px 0 4px;border-radius:18px}
#ui .fila:active{filter:brightness(.92)}
#ui .modos{gap:10px;align-items:flex-end}
/* (a fileira de baixo guarda a vaga "Na mão" e, perto do celeiro, a porta dele, no feitio dos antigos botões de modo) */
#ui .bt.modo{${mold('botao-hud-normal', '28px 22px 22px 22px')}width:69px;height:69px;border-width:8px 7px 9px;padding:1px 0 0;justify-content:flex-start;gap:0;font-size:15px;font-weight:800;line-height:1;border-radius:16px;color:#4a2a12}
#ui .bt.modo>canvas.ic{width:38px!important;height:38px!important;flex:none}
#ui .bt.modo>span:not(.conta):not(.tecla){margin:0 -6px;white-space:nowrap;letter-spacing:-.2px}
#ui .bt.modo:active{${img('botao-hud-apertado')}transform:none}
#ui .bt.modo.ativo{${img('botao-hud-selecionado')}}
#ui .bt.modo.cons-porta{${img('botao-hud-normal')}margin-left:8px}
#ui .bt.modo.cons-porta::before{content:'';position:absolute;inset:3px;border-radius:12px;background:#fff1b8;z-index:-1;mix-blend-mode:multiply}

/* ---------- as ações por toque (ui/acoes.js): a vaga "Na mão", a fileira de escolha, o balãozinho e a roda ---------- */
#ui .mao{position:relative;display:flex;justify-content:center;padding-top:15px}
#ui .bt.vaga-mao{${mold('botao-hud-normal', '28px 22px 22px 22px')}position:relative;min-width:150px;height:70px;border-width:8px 7px 9px;padding:9px 14px 0 6px;gap:6px;border-radius:16px;color:#4a2a12}
#ui .bt.vaga-mao:active,#ui .bt.vaga-mao.aberta{${img('botao-hud-apertado')}transform:none}
#ui .vaga-mao>canvas.ic{width:46px!important;height:46px!important;flex:none}
#ui .vaga-mao .aba-mao{${mold('botao-marrom', '12px 12px 10px 12px')}position:absolute;left:50%;top:-19px;transform:translateX(-50%);height:25px;border-width:4px 5px 5px;padding:0 9px;display:flex;align-items:center;white-space:nowrap;font-size:14px;font-weight:900;line-height:1;color:#fff;-webkit-text-stroke:3px #3a1f0c;paint-order:stroke fill;border-radius:10px;pointer-events:none}
#ui .vaga-mao .txt-mao{display:flex;flex-direction:column;align-items:center;line-height:1.02}
#ui .vaga-mao .txt-mao b{font-size:19px;font-weight:900;white-space:nowrap}
#ui .vaga-mao .conta-mao{font-size:22px;font-weight:900;font-variant-numeric:tabular-nums}
#ui .vaga-mao.vazia .txt-mao b{font-size:15px;white-space:normal;width:84px;text-align:center;line-height:1.08}
#ui .lista-mao{${mold('balao', '21px 22px 22px 22px')}position:absolute;bottom:calc(100% + 4px);left:50%;transform:translateX(-50%);display:flex;flex-wrap:wrap;justify-content:center;gap:7px;border-width:7px;padding:9px 9px 6px;width:max-content;max-width:min(580px,calc(100vw / var(--esc, 1) - 24px));z-index:5}
#ui .lista-mao[hidden]{display:none}
#ui .bt.carta-mao{${mold('cartao-item-normal', '21px 20px 20px 20px')}position:relative;flex-direction:column;width:76px;height:80px;min-width:0;border-width:7px;padding:1px 0 0;gap:0;border-radius:14px;color:#4a2a12;font-size:14px;font-weight:900;line-height:1.05}
#ui .bt.carta-mao:active{transform:translateY(1px)}
#ui .bt.carta-mao>canvas.ic{width:42px!important;height:42px!important;flex:none}
#ui .bt.carta-mao.ativo{${mold('botao-hud-selecionado', '28px 22px 22px 22px')}border-width:8px 7px 9px;color:#fff;-webkit-text-stroke:3px #24470e;paint-order:stroke fill}
#ui .carta-mao .nome-carta{white-space:nowrap;letter-spacing:-.4px;max-width:72px;overflow:hidden;text-overflow:ellipsis}
#ui .carta-mao.comprar .nome-carta{font-size:13px;letter-spacing:-.5px}
/* (com a fileira de escolha aberta, a linha de dica some: a fileira fica no lugar dela) */
#ui .rodape:has(.vaga-mao.aberta) .linha-info{visibility:hidden}
#ui .carta-mao .conta-carta{${mold('pilula', '9px')}position:absolute;right:-9px;top:-11px;height:22px;border-width:4px;padding:0 4px;display:flex;align-items:center;font-size:13px;font-weight:900;color:#4a2a12;-webkit-text-stroke:0;border-radius:11px}
#ui .balao-acao{${fixa('botao-agir-normal')}position:absolute;left:0;top:0;width:58px;height:60px;margin:-76px 0 0 -29px;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:2;filter:drop-shadow(0 2px 2px rgba(60,30,10,.35))}
#ui .balao-acao>canvas.ic{width:40px!important;height:40px!important;margin-top:-2px}
#ui .balao-acao::before,#ui .balao-acao::after{content:'';position:absolute;left:50%;border-style:solid;border-color:transparent;border-bottom:0}
#ui .balao-acao::before{bottom:-12px;margin-left:-10px;border-width:13px 10px 0;border-top-color:#421a02}
#ui .balao-acao::after{bottom:-7px;margin-left:-7px;border-width:9px 7px 0;border-top-color:#e8851f}
#ui .roda-acoes{position:absolute;left:0;top:0;width:0;height:0;z-index:6}
#ui .bt-roda{position:absolute;left:0;top:0;display:flex;flex-direction:column;align-items:center;gap:0;padding:0;border:0;background:none;box-shadow:none;color:#4a2a12;border-radius:16px}
#ui .roda-circ{${fixa('botao-agir-normal')}width:66px;height:68px;display:flex;align-items:center;justify-content:center;border-radius:50%;filter:drop-shadow(0 2px 2px rgba(60,30,10,.35))}
#ui .roda-circ>canvas.ic{width:42px!important;height:42px!important}
#ui .bt-roda.principal .roda-circ{width:86px;height:88px;box-shadow:0 0 0 3px #ffd84a,0 0 16px 7px rgba(255,214,70,.9)}
#ui .bt-roda.principal .roda-circ>canvas.ic{width:56px!important;height:56px!important}
#ui .bt-roda:active .roda-circ{${fixa('botao-agir-apertado')}}
#ui .roda-nome{${mold('pilula', '12px')}position:relative;margin-top:-9px;height:27px;border-width:4px 6px;padding:0 6px;display:flex;align-items:center;font-size:15px;font-weight:900;line-height:1;white-space:nowrap;border-radius:12px}
#ui .bt-roda.principal .roda-nome{font-size:17px;height:29px}
body.na-chegada #ui .rodape,body.na-chegada #ui .balao-acao{visibility:hidden}
body.colocando #ui .balao-acao,body.colocando #ui .roda-acoes{display:none!important}
/* o "Pular" da cena de chegada, no botão verde aprovado */
#ui .bt.pular-chegada{${mold('botao-verde-normal', '18px 18px 15px 18px')}min-height:46px;border-width:5px 6px 6px;padding:0 18px;border-radius:12px;font-size:18px;font-weight:900;color:#fff;-webkit-text-stroke:3px #24470e;paint-order:stroke fill}
#ui .bt.pular-chegada:active{${img('botao-verde-apertado')}transform:none}

/* ---------- alavanca e botão de agir ---------- */
#ui .alavanca{${fixa('alavanca-base')}width:112px;height:114px;border:0;border-radius:50%;left:max(16px,env(safe-area-inset-left));bottom:max(16px,env(safe-area-inset-bottom))}
#ui .alavanca i{${fixa('alavanca-pino')}width:48px;height:49px;margin:-24px 0 0 -24px;border:0;box-shadow:none}
#ui .alavanca.solta{left:0;top:0;bottom:auto;margin:-57px 0 0 -56px}
#ui .bt.agir{${fixa('botao-agir-normal')}width:88px;height:90px;border:0;border-image:none;border-radius:50%;right:max(16px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));padding:0 0 3px;min-width:0;min-height:0}
#ui .bt.agir:active{${fixa('botao-agir-apertado')}transform:none}
#ui .bt.agir>canvas.ic{width:54px!important;height:54px!important}
body.grande #ui .bt.quadrado{width:62px;height:62px}
body.grande #ui .bt.quadrado>canvas.ic{width:44px!important;height:44px!important}
body.grande #ui .bt.modo{width:80px;height:78px}
body.grande #ui .bt.modo>canvas.ic{width:44px!important;height:44px!important}
body.grande #ui .bt.vaga-mao{height:74px;min-width:170px}
body.grande #ui .vaga-mao>canvas.ic{width:52px!important;height:52px!important}
body.grande #ui .bt.agir{width:104px;height:106px}
body.grande #ui .bt.agir>canvas.ic{width:62px!important;height:62px!important}
body.grande #ui .alavanca{width:132px;height:134px}
body.grande #ui .alavanca.solta{margin:-67px 0 0 -66px}

/* o tutorial: um anel em volta do botão e um brilho que pulsa (só opacidade: leve para o celular). O anel é sombra,
   e não uma peça para fora do botão: assim ele não conta como texto que "não cabe" no botão */
#ui .alvo-tutorial:not(.agir):not(.alavanca):not(.fechar){position:relative} /* (os que já são absolutos ficam como estão) */
#ui .alvo-tutorial{animation:none;isolation:isolate;box-shadow:0 0 0 3px #fff6d0,0 0 0 7px #ffb02e!important}
/* (o brilho fica atrás do texto do botão: z-index -1 dentro do próprio botão) */
#ui .alvo-tutorial::after{content:'';position:absolute;inset:0;border-radius:inherit;box-shadow:0 0 12px 9px rgba(255,176,46,.85);pointer-events:none;animation:alvo-anel .7s ease-in-out infinite alternate;z-index:-1}
@keyframes alvo-anel{from{opacity:.15}to{opacity:1}}
#ui .bt.agir.alvo-tutorial,#ui .alavanca.alvo-tutorial,#ui .bt.agir.alvo-tutorial::after,#ui .alavanca.alvo-tutorial::after{border-radius:50%}
`;

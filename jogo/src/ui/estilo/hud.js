// CSS do HUD (a tela do jogo), no visual aprovado: pílulas de madeira, selo do nível, botões quadrados com relevo,
// o Menu do celular, o balão do Seu Tonho, o aviso curto, a barra de ferramentas, a alavanca e o botão de agir.
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
#ui.compacto .menu-lista{display:none;position:absolute;right:-3px;top:62px;width:240px;flex-direction:column;gap:0;${mold('menu-lista', '27px 36px 18px 17px')}border-width:15px 9px 9px 8px;padding:0 2px;z-index:4}
#ui.compacto .topo-dir.menu-aberto .menu-lista{display:flex}
#ui.compacto .menu-lista .bt.quadrado{border:0;border-image:none;background:none;width:100%;height:44px;flex-direction:row;justify-content:flex-start;gap:12px;padding:0 6px 0 4px;border-radius:8px}
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

/* ---------- o aviso curto (no alto, entre as pílulas e o balão) ---------- */
#ui .avisos{top:calc(max(6px,env(safe-area-inset-top)) + 47px);left:214px;right:8px;gap:4px}
#ui:has(.balao:not(.esq):not([hidden])) .avisos{right:calc(min(276px,34%) + 16px)}
#ui:has(.balao:not(.esq):not(.pequeno):not([hidden])) .avisos{right:calc(min(330px,40%) + 16px)}
#ui:has(.chip.folego:not([hidden])) .avisos,#ui:has(.chip.trab-carga:not([hidden])) .avisos,#ui:has(.chip.trab-agua:not([hidden])) .avisos{top:calc(max(6px,env(safe-area-inset-top)) + 94px)}
body.com-painel #ui .avisos{top:max(6px,env(safe-area-inset-top));left:0;right:0}
#ui .aviso{${mold('aviso', '14.3px 15px 14px 15px')}min-height:29px;border-width:4px 6px;padding:0 8px 0 3px;display:flex;align-items:center;gap:5px;max-width:100%;font-size:16px;font-weight:800;line-height:1.15;text-align:left;border-radius:15px}
#ui .aviso canvas.ic{flex:none}
#ui .aviso.deitar{padding:8px 16px;font-size:18px}

/* ---------- embaixo: dica, fila, sementes e a barra de ferramentas ---------- */
#ui .rodape{bottom:max(8px,env(safe-area-inset-bottom));gap:5px}
#ui .dica{${mold('aviso', '14.3px 15px 14px 15px')}border-width:4px 6px;padding:2px 10px;max-width:min(560px,calc(100% - 290px));font-size:14px;font-weight:800;border-radius:15px}
#ui .dica.fraca{opacity:.9}
#ui .fila{${mold('pilula', '18px')}border-width:5px;min-height:44px;padding:0 6px 0 4px;border-radius:18px}
#ui .fila:active{filter:brightness(.92)}
#ui .modos,#ui .sementes{gap:5px}
#ui .bt.modo{${mold('botao-hud-normal', '28px 22px 22px 22px')}width:69px;height:69px;border-width:8px 7px 9px;padding:1px 0 0;justify-content:flex-start;gap:0;font-size:15px;font-weight:800;line-height:1;border-radius:16px;color:#4a2a12}
#ui .bt.modo>canvas.ic{width:38px!important;height:38px!important;flex:none}
#ui .bt.modo>span:not(.conta):not(.tecla){margin:0 -6px;white-space:nowrap;letter-spacing:-.2px}
#ui .bt.modo:active{${img('botao-hud-apertado')}transform:none}
#ui .bt.modo.ativo,#ui .bt.semente.ativo{${img('botao-hud-selecionado')}}
#ui .bt.modo[disabled],#ui .bt.modo.sem{filter:grayscale(.9) opacity(.75)}
#ui .modo .conta{${fixa('bolinha-contador')}right:-9px;top:-10px;min-width:26px;width:26px;height:27px;padding:0;border:0;border-radius:50%;font-size:14px;font-weight:900;line-height:26px;color:#fff;-webkit-text-stroke:3px #12305a;paint-order:stroke fill}
#ui .modo .conta.zero{filter:hue-rotate(155deg) saturate(1.6)}
#ui .bt.semente{${mold('botao-hud-normal', '21px 16px 16px 16px')}width:52px;height:50px;border-width:6px 5px 7px;padding:0;border-radius:12px}
#ui .bt.semente:active{${img('botao-hud-apertado')}transform:none}
#ui .semente .conta{right:-7px;top:-8px;background:#fff9ec;border:2px solid #4a2f1b;color:#4a2a12}
#ui .semente .conta.zero{background:#ffd9d0}
#ui .bt.modo.cons-porta{${img('botao-hud-normal')}margin-left:8px}
#ui .bt.modo.cons-porta::before{content:'';position:absolute;inset:3px;border-radius:12px;background:#fff1b8;z-index:-1;mix-blend-mode:multiply}

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
body.grande #ui .bt.semente{width:62px;height:58px}
body.grande #ui .bt.agir{width:104px;height:106px}
body.grande #ui .bt.agir>canvas.ic{width:62px!important;height:62px!important}
body.grande #ui .alavanca{width:132px;height:134px}
body.grande #ui .alavanca.solta{margin:-67px 0 0 -66px}

/* o tutorial: um anel que pulsa em volta do botão (só opacidade e escala: leve para o celular) */
#ui .alvo-tutorial{animation:none;position:relative}
#ui .alvo-tutorial::after{content:'';position:absolute;inset:-7px;border-radius:20px;border:4px solid #ffb02e;box-shadow:0 0 10px 2px rgba(255,176,46,.8);pointer-events:none;animation:alvo-anel .7s ease-in-out infinite alternate;z-index:3}
@keyframes alvo-anel{from{opacity:.25;transform:scale(.97)}to{opacity:1;transform:scale(1.03)}}
#ui .bt.agir.alvo-tutorial::after,#ui .alavanca.alvo-tutorial::after{border-radius:50%}
`;

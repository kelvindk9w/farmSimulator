// CSS das telas de festa e de pergunta (por cima de tudo): subiu de nível (faixa vermelha, raios girando devagar,
// selo grande com estrelas, "Você ganhou", "Liberou", "Continuar"), as outras recompensas (baú) e o diálogo de
// "tem certeza?". Os raios giram só com transform (o celular faz isso sem redesenhar a página).
import { mold, img, fixa } from './pecas.js';

export const CSS_TELAS = `
#ui .subida{background:rgba(30,20,8,.6)}
#ui .subida .cartao{width:min(476px,94%);padding:6px 16px 12px;align-items:center;text-align:center;border-radius:26px}
#ui .subida .raios{${fixa('raios')}width:640px;height:640px;margin:-320px 0 0 -320px;animation:gira 48s linear infinite;will-change:transform}
body.leve #ui .subida .confete:nth-of-type(2n){display:none}
#ui .subida .faixa{${mold('faixa-nivel', '26px 80px 26px 80px')}box-sizing:border-box;min-height:52px;border-width:0;padding:4px 70px 14px;margin:2px auto 4px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;letter-spacing:0;text-transform:none;color:#fff;-webkit-text-stroke:4px #6e120c;paint-order:stroke fill;white-space:nowrap;max-width:100%}
#ui .subida .rotulo{font-size:19px;font-weight:900;color:#4a2a12;margin-top:4px}
#ui .subida .lista{gap:8px;margin:3px 0 4px}
#ui .subida .premios .item{min-height:44px;padding:0 16px 0 3px;font-size:21px;font-weight:900;background:none}
#ui .subida .premios .item canvas.ic{width:34px!important;height:34px!important}
#ui .subida .lista:not(.premios) .item{${mold('cartao-item-normal', '21px 20px 20px 20px')}border-width:5px;border-radius:12px;min-height:50px;padding:0 10px 0 4px;font-size:16px}
#ui .subida .lista:not(.premios) .item canvas.ic{width:36px!important;height:36px!important}
#ui .subida .cartao>.bt.verde{min-width:230px;min-height:54px;margin-top:6px;font-size:26px;font-weight:900;-webkit-text-stroke-width:4px}
#ui .recompensa .titulo{font-size:21px;font-weight:900}
#ui .recompensa .sub{font-size:15px;color:#8a5a2b}
#ui .recompensa:not(.tipo-nivel) .cartao{overflow:hidden auto}

/* ---------- subiu de nível: faixa no alto, o selo por cima, o quadro só em volta dos prêmios ---------- */
#ui .recompensa.tipo-nivel .raios{display:none}
#ui .recompensa.tipo-nivel .cartao{border:0;border-image:none;background:none;isolation:isolate;width:min(500px,96%);max-height:none;padding:0 18px;overflow:visible}
#ui .recompensa.tipo-nivel .cartao::after{${mold('painel', '28px 28px 29px 28px')}content:'';position:absolute;left:0;right:0;top:124px;bottom:24px;border-width:10px;border-radius:26px;z-index:-1;box-sizing:border-box}
/* (faixa e selo sem z-index: os raios, atrás do selo, ficam na camada do cartão, atrás do quadro) */
#ui .recompensa.tipo-nivel .faixa{border-image-width:39px 120px;height:78px;width:min(450px,100%);padding:0 70px 22px;margin:0 auto;font-size:30px;-webkit-text-stroke-width:5px;position:relative}
#ui .recompensa.tipo-nivel .numero{${fixa('selo-nivel')}position:relative;flex:none;width:98px;height:100px;margin:-30px auto 0;border:0;border-radius:50%;box-shadow:none;background-color:transparent;font-size:56px;font-weight:900;color:#fff;-webkit-text-stroke:6px #1d4a0c;paint-order:stroke fill}
#ui .recompensa.tipo-nivel .numero::before{${fixa('raios')}content:'';position:absolute;left:50%;top:50%;width:620px;height:620px;margin:-310px 0 0 -310px;z-index:-2;animation:gira 48s linear infinite;will-change:transform;pointer-events:none}
#ui .recompensa.tipo-nivel .numero canvas.ic{position:absolute;-webkit-text-stroke:0;filter:drop-shadow(0 2px 0 rgba(74,47,27,.4));animation:estrela 1.6s ease-in-out infinite alternate}
#ui .recompensa.tipo-nivel .numero .e1{left:-52px;top:16px;width:40px!important;height:40px!important}
#ui .recompensa.tipo-nivel .numero .e2{left:-74px;top:54px;width:28px!important;height:28px!important;animation-delay:-.8s}
#ui .recompensa.tipo-nivel .numero .e3{right:-52px;top:16px;width:40px!important;height:40px!important;animation-delay:-.4s}
#ui .recompensa.tipo-nivel .numero .e4{right:-74px;top:54px;width:28px!important;height:28px!important;animation-delay:-1.2s}
@keyframes estrela{from{transform:scale(.88) rotate(-8deg)}to{transform:scale(1.06) rotate(8deg)}}
#ui .recompensa.tipo-nivel .rotulo{margin-top:6px}
#ui .recompensa.tipo-nivel .lista:not(.premios){flex-wrap:nowrap;max-width:100%;overflow-x:auto;justify-content:safe center;padding:2px 2px 4px}
#ui .recompensa.tipo-nivel .lista:not(.premios) .item{flex:none}
#ui .recompensa.tipo-nivel .cartao>.bt.verde{margin-top:8px}
@media (max-height:430px){
  #ui .recompensa.tipo-nivel .faixa{height:70px;border-image-width:35px 108px;padding:0 64px 20px;font-size:27px}
  #ui .recompensa.tipo-nivel .numero{width:88px;height:90px;font-size:50px;margin-top:-28px}
  #ui .recompensa.tipo-nivel .cartao::after{top:110px}
  #ui .recompensa.tipo-nivel .rotulo{margin-top:2px;font-size:18px}
  #ui .subida .lista{margin:2px 0}
  #ui .subida .cartao>.bt.verde{min-height:50px;font-size:24px}
}

/* ---------- a pergunta ---------- */
#ui .subida.dialogo .cartao{${mold('painel', '28px 28px 29px 28px')}width:min(430px,94%);border-width:10px;padding:2px 12px 12px}
#ui .subida.dialogo .cartao>*{order:1}
#ui .subida.dialogo .faixa{${mold('cabecalho', '22px 28px 22px 28px')}order:0;align-self:stretch;min-height:44px;border-width:6px;margin:-4px -10px 4px;padding:0 10px;font-size:20px;color:#4a2a12;-webkit-text-stroke:0;white-space:normal}
#ui .subida.dialogo .pergunta{font-size:17px;font-weight:800}
#ui .subida.dialogo .linha .bt{min-width:130px}
`;

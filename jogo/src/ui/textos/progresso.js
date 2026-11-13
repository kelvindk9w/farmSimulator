// Os textos da frente de progresso: tela de recompensa, conquistas, presente do dia, amigos, cash, guarda-roupa e
// caderno do vizinho. Entram na tabela T de ui/textos.js.
import { T, tempo, numero } from '../textos.js';

const nomeI = (D, id) => (D && D.itens[id] ? D.itens[id].nome : id || '');
const minus = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
const reais = (v) => 'R$ ' + v.toFixed(2).replace('.', ',');
const vezes = (n, um, muitos) => (n === 1 ? um : `${numero(n)} ${muitos}`);

// (os códigos que outra frente também usa, como "sem-cash", ficam com a frase de quem chegou primeiro)
const MOTIVOS = {
  'conquista-ainda-nao': () => 'Ainda falta um pouco para este prêmio',
  'conquista-desconhecida': () => 'Essa conquista não existe mais',
  'sem-presente': () => 'Não há presente esperando',
  'presente-amanha': () => 'O presente de hoje já foi aberto: amanhã tem outro',
  'correio-vazio': () => 'A caixa de correio está vazia',
  'convite-desligado': () => 'Os convites estão desligados nesta versão',
  'convite-invalido': () => 'Esse código de convite não serve',
  'convite-proprio': () => 'Esse é o seu próprio convite',
  'convite-ja-usado': () => 'Esta fazenda já usou um convite',
  'convite-so-no-comeco': () => 'O convite só vale para uma fazenda nova',
  'convite-limite': (d) => `Você já recebeu o presente de ${d ? d.limite : ''} amigos: é o máximo`,
  'amigo-repetido': () => 'Esse amigo já foi contado',
  'em-breve': () => 'Chega em breve',
  'nao-tem': () => 'Você ainda não tem isso',
  'nao-existe': () => 'Isso não existe mais',
  'sem-cash': (d) => `Falta cash${d && d.falta ? ' (' + numero(d.falta) + ')' : ''}`,
  'concluir-nao-vale': () => 'Isto não dá para concluir com cash',
  'nada-a-concluir': () => 'Já está pronto',
  'concluir-limite': (d) => `Você já concluiu ${d ? d.limite : ''} vezes hoje: amanhã tem mais`,
  'compra-indisponivel': () => 'A compra de cash não existe nesta versão',
  limite: (d) => (d && d.limite === 1 ? 'Você já tem um: só cabe um na fazenda' : `Você já tem o máximo (${d ? d.limite : ''})`),
};
for (const k in MOTIVOS) if (!T.motivos[k]) T.motivos[k] = MOTIVOS[k];

Object.assign(T.botoes, { fazenda: 'Minha fazenda', correio: 'Caixa de correio: tem presente' });

T.recompensa = {
  receber: 'Receber', continuar: 'Continuar', ganhou: 'Você ganhou', liberou: 'Liberou',
  faixa: { nivel: 'Subiu de nível!', conquista: 'Conquista!', presente: 'Presente do dia', missao: 'Missão cumprida!', convite: 'Presente de boas-vindas', amigo: 'Presente de amigo', compra: 'Compra de teste' },
  dia: (n) => `Dia ${n}`,
  convite: 'Um amigo convidou você. Bom começo!',
  amigo: (nivel) => `Um amigo seu chegou ao nível ${nivel}`,
  compra: 'Nenhuma cobrança foi feita',
  faltam: (n) => (n === 1 ? 'Há mais um presente esperando' : `Há mais ${n} presentes esperando`),
};

T.dialogo = { sim: 'Sim', nao: 'Agora não', fechar: 'Fechar' };

T.fazenda = {
  titulo: 'Minha fazenda', voltar: 'Voltar', esperando: 'Para receber', nome: 'Nome da fazenda', nomeInfo: 'Aparece na foto e no convite.', nomeVazio: 'Dê um nome à fazenda',
  guardar: 'Guardar', guardado: 'Nome guardado!', semNome: 'Fazenda',
  conquistas: 'Conquistas', presentes: 'Presente do dia', amigos: 'Amigos', roupas: 'Guarda-roupa', cash: 'Loja de cash', caderno: 'Caderno do vizinho',
  conquistasProntas: (n) => (n === 1 ? 'Um prêmio de conquista' : `${n} prêmios de conquista`),
  presenteDoDia: 'O presente de hoje', presenteDeConvite: 'O presente de boas-vindas', presentesDeAmigos: (n) => (n === 1 ? 'Um presente de amigo' : `${n} presentes de amigos`),
  // a linha pequena de cada atalho
  resumo: {
    conquistas: (feitos, total) => `${feitos} de ${total} prêmios`, presenteHoje: 'Tem presente hoje!', presenteAmanha: 'Amanhã tem outro',
    amigos: 'Convite e foto da fazenda', roupas: (n) => (n === 0 ? 'Nenhuma peça ainda' : n === 1 ? 'Uma peça' : `${n} peças`), cash: (n) => `Você tem ${n}`,
    caderno: (n) => (n === 0 ? 'As lições do vizinho' : n === 1 ? 'Uma lição' : `${n} lições`),
  },
};

T.conquistas = {
  titulo: 'Conquistas', receber: 'Receber', proximo: 'Próximo prêmio', completa: 'Completa!', pronta: (d) => `Conquista "${d.nome}": tem prêmio para receber`,
  vazio: 'As conquistas aparecem conforme você joga.', anda: (v, alvo) => `${numero(Math.min(v, alvo))} / ${numero(alvo)}`,
  marcos: (feitos, total) => `${feitos} de ${total}`,
  // o que cada conquista pede (pelo id de missoes.json); as que não estão aqui usam a frase do evento
  meta: {
    'mao-na-terra': (n) => `Colha ${numero(n)} produtos da lavoura e do pomar`,
    'regador-cheio': (n) => `Regue ${numero(n)} vezes`,
    'terra-arada': (n) => `Are ${numero(n)} casas`,
    'bom-de-venda': (n) => `Ganhe ${numero(n)} de ouro vendendo na banca`,
    entregador: (n) => `Entregue ${vezes(n, 'um pedido', 'pedidos')}`,
    'ovos-frescos': (n) => `Recolha ${numero(n)} ovos`,
    'leite-quente': (n) => `Tire ${numero(n)} de leite`,
    tosquiador: (n) => `Tosquie ${numero(n)} de lã`,
    pomar: (n) => `Colha ${numero(n)} frutas`,
    viveirista: (n) => `Plante ${vezes(n, 'uma muda', 'mudas')} de árvore`,
    'mao-na-massa': (n) => `Produza ${numero(n)} coisas nas bancadas`,
    'bem-embalado': (n) => `Embale ${numero(n)} produtos`,
    cozinheiro: (n) => `Faça ${numero(n)} receitas na cozinha`,
    carpinteiro: (n) => `Construa ${numero(n)} vezes`,
    'celeiro-arrumado': (n) => `Monte ${vezes(n, 'um móvel', 'móveis')} no celeiro`,
    'dono-de-terra': (n) => `Compre ${vezes(n, 'um lote', 'lotes')}`,
    'terra-limpa': (n) => `Limpe ${numero(n)} obstáculos da terra`,
    criador: (n) => `Compre ${vezes(n, 'um animal', 'animais')}`,
    'bom-trato': (n) => `Abasteça cocho ou bebedouro ${numero(n)} vezes`,
    'junta-de-boi': (n) => `Are ${numero(n)} casas com o boi`,
    fazendeiro: (n) => `Chegue ao nível ${n}`,
    'todo-dia': (n) => `Abra ${vezes(n, 'um presente', 'presentes')} do dia`,
  },
  evento: (n) => `Faça isso ${numero(n)} vezes`,
};

T.presentes = {
  titulo: 'Presente do dia', abrir: 'Abrir o presente de hoje', dia: (n) => `Dia ${n}`, hoje: 'Hoje!', amanha: 'Amanhã', aberto: 'Aberto',
  info: 'Um presente por dia jogado. Se faltar um dia, não perde nada: continua de onde parou.',
  volta: 'Volte amanhã para o próximo presente.', completa: 'Você abriu os sete! Amanhã começa um cartão novo.',
  chegou: 'Tem presente na caixa de correio',
};

T.amigos = {
  titulo: 'Amigos', convidar: 'Convidar um amigo', codigo: 'O código da sua fazenda', copiar: 'Copiar convite', copiado: 'Convite copiado! Cole no WhatsApp ou onde quiser.',
  naoCopiou: 'Não deu para copiar sozinho: o texto está selecionado, copie por ele.',
  comoFunciona: (nivel) => `Quando o seu amigo chegar ao nível ${nivel}, os dois ganham um presente.`,
  voceGanha: 'Você ganha', amigoGanha: 'O amigo ganha', chegaram: (n, limite) => `Amigos que chegaram: ${n} de ${limite}`,
  texto: (nome, link) => `Estou cuidando ${nome ? 'da ' + nome : 'da minha fazenda'} e queria você de vizinho! Entre por este link e ganhe um presente para começar: ${link}`,
  semServidor: 'Versão de teste: ainda não há servidor, então o jogo não fica sabendo sozinho quando o amigo chega. O botão abaixo serve para experimentar.',
  simular: (nivel) => `Simular: um amigo chegou ao nível ${nivel} (teste)`,
  chegou: 'Um amigo chegou! Tem presente na caixa de correio.',
  abrir: (n) => (n === 1 ? 'Abrir o presente de amigo' : `Abrir um presente de amigo (${n})`),
  convidadoPor: (c) => `Você entrou pelo convite ${c}.`,
  desligado: 'Os convites estão desligados nesta versão.',
  compartilhar: 'Foto da fazenda', foto: 'Tirar foto', fotoInfo: 'Faz uma foto da fazenda para você mostrar a quem quiser. O jogo nunca publica nada sozinho.',
  agrado: 'Uma vez por dia, mostrar a fazenda rende um agrado:', agradoHoje: 'O agrado de hoje já veio.',
  guardarFoto: 'Para guardar: segure o dedo na foto (no computador, botão direito) e escolha salvar a imagem.',
  textoDaFoto: (nome, link) => `Olha ${nome ? 'a ' + nome : 'a minha fazenda'}! ${link}`,
  textoCopiado: 'O texto para mandar junto foi copiado.', ganhouAgrado: (n) => `+${numero(n)} de ouro por mostrar a fazenda`,
  semFoto: 'Não deu para fazer a foto neste navegador.', legenda: 'Fazenda',
};

T.cash = {
  titulo: 'Loja de cash', aba: 'Cash', teste: 'Versão de teste: nenhuma cobrança é feita. A compra é de mentira e o cash entra na hora.',
  pacotes: 'Pacotes de cash', reais, comprar: 'Comprar', ofertas: 'Para gastar', roupas: 'Roupas', enfeites: 'Enfeites da fazenda', animais: 'Bichos especiais',
  tempo: 'Concluir na hora', tempoInfo: (g) => `Onde houver um relógio (obra, fila de produção, muda crescendo) aparece o botão de concluir. Faltando até ${tempo(g)}, é de graça.`,
  tempoEscada: (lista) => lista.map(([seg, n]) => `${tempo(seg)}: ${n}`).join(' · '),
  vaga: 'Vaga na fila', vagaInfo: 'Cada vaga a mais na fila de uma bancada se compra com ouro ou com cash, na própria bancada.',
  vagaDe: (nome, vaga) => `${nome}: ${minus(vaga)}`, ou: 'ou', nivel: (n) => `Nível ${n}`, tem: 'Você já tem', emBreve: 'Em breve',
  guardado: 'Fica guardado: coloque pelo Construir.', vaiParaOGuardaRoupa: 'Vai para o guarda-roupa',
  perguntaPacote: (nome, cash, preco) => `Comprar ${minus(nome)} (${numero(cash)} de cash) por ${reais(preco)}?`,
  perguntaOferta: (nome, cash) => `Comprar ${minus(nome)} por ${numero(cash)} de cash?`,
  saldo: (n) => `Você tem ${numero(n)} de cash.`,
  comprou: (d) => `Comprou ${minus(d.nome)}`,
  soEnfeita: 'Cash só compra tempo, enfeite e bicho de estimação especial. Tudo o que faz a fazenda render se compra com ouro.',
  verRoupas: 'Abrir o guarda-roupa', semOfertas: 'Nada à venda aqui ainda.', falta: (n) => `Falta ${numero(n)} de cash`,
  especial: (familia) => (familia === 'trabalho' ? 'Muda só a figura: anda igual ao comum.' : 'Faz o mesmo que o comum; muda a figura.'),
};

T.concluir = {
  botao: 'Concluir', gratis: 'grátis', titulo: 'Concluir agora?', teste: 'Relógio de teste',
  pergunta: (nome, seg, cash) => `${nome ? nome + ': f' : 'F'}alta ${tempo(seg)}. Concluir agora por ${numero(cash)} de cash?`,
  sim: (cash) => `Concluir (${numero(cash)})`, nao: 'Esperar', concluiu: (d) => (d.nome ? `${d.nome}: pronto!` : 'Pronto!'),
};

T.roupas = {
  titulo: 'Guarda-roupa', aba: 'Roupas', usando: 'Usando', premioCurto: 'Prêmio', partes: { chapeu: 'Na cabeça', roupa: 'Roupa', calcado: 'Nos pés', pintura: 'Ferramentas' },
  vestir: 'Vestir', tirar: 'Tirar', vestindo: 'Está usando', comprarOuro: 'Comprar', comprarCash: 'Comprar',
  emBreve: 'Em breve: o desenho desta peça ainda não está pronto.', nivel: (n) => `Libera no nível ${n}`,
  premio: 'É prêmio: não se compra.', escolha: 'Toque numa peça para provar.', provando: 'Provando', tem: 'É sua',
  perguntaCash: (nome, cash) => `Comprar ${minus(nome)} por ${numero(cash)} de cash?`,
  vestiu: (D, id) => `Vestiu ${minus(nomeI(D, id))}`,
};

T.caderno = {
  titulo: 'Caderno do vizinho', info: (nome) => `O que ${nome} já ensinou. Dá para reler quando quiser.`, ensina: 'Ensina', agora: 'Agora', ja: 'Já aprendido',
  vazio: (nome) => `${nome} ainda não ensinou nada. Fale com ele pelas missões.`,
};

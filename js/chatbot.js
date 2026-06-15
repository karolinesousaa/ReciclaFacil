// =============================================
//  ReciclaFácil — chatbot.js
//  Chatbot simples baseado em regras (sem IA externa)
// =============================================

// -----------------------------------------------
// BASE DE CONHECIMENTO
// Cada item tem palavras-chave (gatilhos) e uma resposta.
// O bot procura a primeira regra cujas palavras-chave
// aparecem na mensagem do usuário.
// -----------------------------------------------
const BASE_CONHECIMENTO = [
  {
    chaves: ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'eai', 'ei'],
    resposta: 'Olá! 👋 Eu sou o ReciclaBot. Posso te ajudar com dúvidas sobre separação de materiais e agendamento da coleta seletiva. O que você quer saber?'
  },
  {
    chaves: ['papel', 'papelão', 'jornal', 'revista'],
    resposta: '📄 PAPEL (lixeira azul)\n\n✓ Pode: jornais, revistas, papelão limpo, caixas, folhas, envelopes\n✗ Não pode: papel higiênico, papel sujo/gorduroso, guardanapos usados, papel plastificado'
  },
  {
    chaves: ['plastico', 'plástico', 'garrafa pet', 'sacola', 'pet'],
    resposta: '🥤 PLÁSTICO (lixeira vermelha)\n\n✓ Pode: garrafas PET, embalagens de xampu, potes, sacolas, canudos\n✗ Não pode: fraldas, talheres com restos, embalagens de remédio, isopor sujo, fios e tomadas'
  },
  {
    chaves: ['metal', 'lata', 'aluminio', 'alumínio', 'ferro'],
    resposta: '🥫 METAL (lixeira amarela)\n\n✓ Pode: latas de alumínio e conserva, tampas metálicas, papel alumínio, ferragens\n✗ Não pode: latas com resíduos, pilhas e baterias, clipes, esponjas de aço usadas, latas de tinta'
  },
  {
    chaves: ['vidro', 'garrafa de vidro', 'pote de vidro'],
    resposta: '🧴 VIDRO (lixeira verde)\n\n✓ Pode: garrafas, potes de conserva, frascos, copos quebrados, vidros de janela\n✗ Não pode: espelhos, lâmpadas, vidros temperados, cristais, cerâmica e porcelana'
  },
  {
    chaves: ['pilha', 'bateria', 'eletronico', 'eletrônico', 'remedio', 'remédio', 'óleo', 'oleo'],
    resposta: '♻️ Pilhas, baterias, eletrônicos, remédios vencidos e óleo de cozinha NÃO devem ir no lixo comum nem reciclável. Procure pontos de coleta especializados, geralmente em farmácias, supermercados ou postos de saúde.'
  },
  {
    chaves: ['agendar', 'agendamento', 'marcar coleta', 'coleta seletiva', 'como funciona a coleta'],
    resposta: '📅 Para agendar a coleta seletiva, role até a seção "Agendar Coleta" e preencha o formulário com seu nome, endereço, data, turno e os materiais que deseja descartar. Você receberá uma confirmação pelo contato informado!'
  },
  {
    chaves: ['data', 'horario', 'horário', 'turno', 'quando'],
    resposta: '🕐 A coleta funciona em dois turnos: Manhã (8h–12h) e Tarde (13h–17h). Escolha o turno preferido ao preencher o formulário de agendamento.'
  },
  {
    chaves: ['duvida', 'dúvida', 'nao sei', 'não sei', 'incerteza', 'misturado'],
    resposta: '🤔 Se você tiver dúvida se um material é reciclável, a recomendação é jogar no lixo comum. Um item contaminado ou errado pode prejudicar toda a coleta seletiva.'
  },
  {
    chaves: ['lavar', 'limpar', 'sujo', 'suja'],
    resposta: '🧼 Sim! Antes de descartar, lave as embalagens para remover restos de comida ou líquidos. Embalagens sujas contaminam outros recicláveis.'
  },
  {
    chaves: ['impacto', 'meio ambiente', 'beneficio', 'benefício', 'por que reciclar', 'porque reciclar'],
    resposta: '🌍 Reciclar economiza energia, água e recursos naturais, além de reduzir a quantidade de lixo enviado a aterros. Por exemplo, reciclar alumínio economiza até 95% de energia em comparação à produção a partir de matéria-prima nova!'
  },
  {
    chaves: ['obrigado', 'obrigada', 'valeu', 'agradeço'],
    resposta: 'De nada! 😊 Estou aqui sempre que precisar. Boa reciclagem! ♻️'
  },
  {
    chaves: ['ajuda', 'help', 'o que voce faz', 'o que você faz', 'opcoes', 'opções'],
    resposta: 'Posso te ajudar com:\n• O que pode ir em cada lixeira (papel, plástico, metal, vidro)\n• Como agendar a coleta seletiva\n• Dicas de boas práticas de reciclagem\n• Curiosidades sobre o impacto da reciclagem\n\nÉ só perguntar!'
  }
];

// Resposta padrão quando nenhuma regra é encontrada
const RESPOSTA_PADRAO = 'Não tenho certeza sobre isso ainda 🤔. Tente perguntar sobre: papel, plástico, metal, vidro, agendamento ou dicas de reciclagem.';

// Sugestões de perguntas rápidas (chips)
const SUGESTOES = [
  'O que pode no plástico?',
  'Como agendar a coleta?',
  'Dúvidas sobre vidro',
  'Por que reciclar?'
];

// -----------------------------------------------
// ELEMENTOS DO DOM
// -----------------------------------------------
const chatbot       = document.getElementById('chatbot');
const toggleBtn     = document.getElementById('chatbot-toggle');
const messagesBox   = document.getElementById('chatbot-messages');
const quickReplies  = document.getElementById('chatbot-quick-replies');
const chatForm      = document.getElementById('chatbot-form');
const chatInput     = document.getElementById('chatbot-input');

let conversaIniciada = false;

// -----------------------------------------------
// ABRIR / FECHAR CHAT
// -----------------------------------------------
toggleBtn.addEventListener('click', () => {
  chatbot.classList.toggle('open');

  if (chatbot.classList.contains('open') && !conversaIniciada) {
    conversaIniciada = true;
    adicionarMensagem('bot', 'Olá! 👋 Eu sou o ReciclaBot. Como posso te ajudar hoje?');
    renderizarSugestoes();
    chatInput.focus();
  }
});

// -----------------------------------------------
// ENVIO DE MENSAGEM (formulário)
// -----------------------------------------------
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const texto = chatInput.value.trim();
  if (!texto) return;

  enviarMensagemUsuario(texto);
  chatInput.value = '';
});

// -----------------------------------------------
// FUNÇÕES PRINCIPAIS
// -----------------------------------------------

function enviarMensagemUsuario(texto) {
  adicionarMensagem('user', texto);
  esconderSugestoes();

  // Pequeno delay para simular "digitando..."
  setTimeout(() => {
    const resposta = buscarResposta(texto);
    adicionarMensagem('bot', resposta);
    renderizarSugestoes();
  }, 500);
}

function buscarResposta(textoUsuario) {
  const texto = normalizar(textoUsuario);

  for (const item of BASE_CONHECIMENTO) {
    for (const chave of item.chaves) {
      if (texto.includes(normalizar(chave))) {
        return item.resposta;
      }
    }
  }
  return RESPOSTA_PADRAO;
}

// Remove acentos e coloca em minúsculas para facilitar a comparação
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function adicionarMensagem(tipo, texto) {
  const msg = document.createElement('div');
  msg.classList.add('chatbot-msg', tipo);
  msg.textContent = texto;
  messagesBox.appendChild(msg);
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

function renderizarSugestoes() {
  quickReplies.innerHTML = '';
  SUGESTOES.forEach(sugestao => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.classList.add('chatbot-chip');
    chip.textContent = sugestao;
    chip.addEventListener('click', () => enviarMensagemUsuario(sugestao));
    quickReplies.appendChild(chip);
  });
}

function esconderSugestoes() {
  quickReplies.innerHTML = '';
}

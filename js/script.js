// =============================================
//  ReciclaFácil — script.js
// =============================================

const SCRIPT_URL ="https://script.google.com/macros/s/AKfycbzwjsARGMkJePKxN1Apq9KYz7Bh2-_LoXi6LovOYDfu9KH4NFxhGnJ0SXHG2aM9sc6X/exec";

// -----------------------------------------------
// ELEMENTOS DO DOM
// -----------------------------------------------
const form = document.getElementById("agendamento-form");
const btnEnviar = document.getElementById("btn-enviar");
const btnTexto = document.getElementById("btn-texto");
const formMsg = document.getElementById("form-msg");
const campoData = document.getElementById("data");

// -----------------------------------------------
// DATA MÍNIMA: amanhã
// -----------------------------------------------
const hoje = new Date();
hoje.setDate(hoje.getDate() + 1);
campoData.min = hoje.toISOString().split("T")[0];

// -----------------------------------------------
// ENVIO DO FORMULÁRIO
// -----------------------------------------------
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  // Valida se ao menos um material foi selecionado
  const checkboxes = form.querySelectorAll('input[name="materiais"]:checked');
  if (checkboxes.length === 0) {
    mostrarMsg(
      "erro",
      "⚠️ Selecione pelo menos um tipo de material para coleta.",
    );
    return;
  }

  const materiais = Array.from(checkboxes)
    .map((c) => c.value)
    .join(", ");

  // Monta objeto com os dados do formulário
  const dados = {
    nome: form.nome.value.trim(),
    telefone: form.telefone.value.trim(),
    email: form.email.value.trim(),
    endereco: form.endereco.value.trim(),
    data: form.data.value,
    turno: form.turno.value,
    materiais: materiais,
    obs: form.obs.value.trim(),
  };

  // Estado de carregamento
  btnEnviar.disabled = true;
  btnTexto.textContent = "Enviando...";
  formMsg.style.display = "none";
  formMsg.className = "";

  // Envia para Google Sheets (se URL configurada) ou modo demonstração
  if (SCRIPT_URL && SCRIPT_URL !== "SUA_URL_DO_APPS_SCRIPT_AQUI") {
    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      mostrarSucesso();
    } catch (err) {
      mostrarMsg(
        "erro",
        "❌ Falha ao enviar. Verifique sua conexão e tente novamente.",
      );
    }
  } else {
    // Modo demonstração sem URL configurada
    await new Promise((r) => setTimeout(r, 1200));
    mostrarSucesso();
  }

  btnEnviar.disabled = false;
  btnTexto.textContent = "Agendar Coleta";
});

// -----------------------------------------------
// FUNÇÕES AUXILIARES
// -----------------------------------------------

function mostrarSucesso() {
  const nome = form.nome.value.split(" ")[0];
  const dataFormatada = new Date(
    form.data.value + "T12:00:00",
  ).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  mostrarMsg(
    "sucesso",
    `✅ Agendamento registrado com sucesso, ${nome}! A coleta está marcada para ${dataFormatada} no turno ${form.turno.value}. Aguarde a confirmação.`,
  );
  form.reset();
}

function mostrarMsg(tipo, texto) {
  formMsg.className = tipo;
  formMsg.textContent = texto;
  formMsg.style.display = "block";

  formMsg.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
}

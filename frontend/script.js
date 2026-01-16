// 1. CONSTANTES
const API_URL = "http://127.0.0.1:8000";
const usuarioId = localStorage.getItem("id_usuario");

// 2. FUNÇÕES DE MOEDA
function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function moedaParaNumero(valor) {
    if (!valor) return 0;

    return Number(
        valor
            .replace(/\s/g, "")
            .replace("R$", "")
            .replace(/\./g, "")
            .replace(",", ".")
    );
}

function aplicarMascaraMoeda(input) {
    if (!input) return;

    input.addEventListener("input", () => {
        let valor = input.value.replace(/\D/g, "");
        valor = (Number(valor) / 100).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
        input.value = valor;
    });
}

    aplicarMascaraMoeda(document.getElementById("inputNovoSaldo"));
    aplicarMascaraMoeda(document.getElementById("trans-valor"));
    aplicarMascaraMoeda(document.getElementById("meta-valor"));
    aplicarMascaraMoeda(document.getElementById("despesa-valor-input"));

// 3. INICIALIZAÇÃO
window.onload = async () => {
    if (!usuarioId) {
        window.location.href = "login.html";
        return;
    }

    const nomeSalvo = localStorage.getItem("nome_usuario");
    document.getElementById("nome-usuario").textContent =
        nomeSalvo && nomeSalvo !== "null" ? nomeSalvo : "Usuário";

    // 👉 AQUI: setar data de hoje
    const hoje = new Date();
    hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());
    const dataHoje = hoje.toISOString().split("T")[0];

    const despesaData = document.getElementById("despesa-data");
    const transData = document.getElementById("trans-data");
    const metaData = document.getElementById("meta-data");

    if (despesaData) despesaData.value = dataHoje;
    if (transData) transData.value = dataHoje;
    if (metaData) metaData.value = dataHoje;

    await carregarDadosIniciais();
    await carregarMetas();
};

// 4. CARREGAR DADOS INICIAIS
async function carregarDadosIniciais() {
    try {
        const respUser = await fetch(`${API_URL}/usuarios/${usuarioId}`);
        const usuario = await respUser.json();
        const saldoInicial = Number(usuario.saldo_inicial) || 0;

        document.getElementById("saldo-inicial-info").textContent =
            `Saldo Inicial: ${formatarMoeda(saldoInicial)}`;

        const respTrans = await fetch(`${API_URL}/transacoes?usuario_id=${usuarioId}`);
        const transacoes = await respTrans.json();

        renderizarTransacoesGerais(transacoes, saldoInicial);
        renderizarHistoricoDespesas(transacoes);

    } catch (erro) {
        console.error("Erro ao carregar dados:", erro);
    }
}

// 5. SALDO TOTAL + HISTÓRICO GERAL
function renderizarTransacoesGerais(transacoes, saldoInicial) {
    const lista = document.getElementById("lista-transacoes");
    lista.innerHTML = "";

    let movimentacao = 0;

    transacoes.forEach(t => {
        const valor = Number(t.valor);
        movimentacao += valor;

        const li = document.createElement("li");
        li.innerHTML = `
            <span>${t.data} - ${t.descricao}</span>
            <b style="color:${valor < 0 ? "#e74c3c" : "#27ae60"}">
                ${formatarMoeda(valor)}
            </b>
        `;
        lista.appendChild(li);
    });

    const saldoTotal = saldoInicial + movimentacao;
    const saldoComp = document.getElementById("saldo-valor");

    saldoComp.textContent = formatarMoeda(saldoTotal);
    saldoComp.style.color = saldoTotal < 0 ? "#e74c3c" : "#ffffff";
}

// 6. HISTÓRICO DE DESPESAS
function renderizarHistoricoDespesas(transacoes) {
    const lista = document.getElementById("lista-despesas");
    const totalComp = document.getElementById("despesas-valor-geral");

    lista.innerHTML = "";
    let total = 0;

    transacoes
        .filter(t => Number(t.valor) < 0)
        .forEach(t => {
            const valor = Math.abs(Number(t.valor));
            total += valor;

            const li = document.createElement("li");
            li.innerHTML = `
                <span>${t.data} - ${t.descricao}</span>
                <b style="color:#e74c3c">${formatarMoeda(valor)}</b>
            `;
            lista.appendChild(li);
        });

    totalComp.textContent = formatarMoeda(total);
}

// 7. SALVAR ENTRADA
async function salvarTransacao() {
    const desc = document.getElementById("trans-desc").value;
    const valor = moedaParaNumero(document.getElementById("trans-valor").value);
    const data = document.getElementById("trans-data").value;
    const categoria = document.getElementById("trans-categoria-select").value;

    if (!desc || !valor || !data) {
        alert("Preencha todos os campos.");
        return;
    }

    await fetch(`${API_URL}/transacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            descricao: desc,
            valor,
            data,
            id_usuario: Number(usuarioId),
            id_categoria: Number(categoria)
        })
    });

    location.reload();
}

// 8. SALVAR DESPESA
async function salvarDespesa() {
    const data = document.getElementById("despesa-data").value;
    const local = document.getElementById("despesa-local").value;
    const desc = document.getElementById("despesa-descricao").value;
    const pagamento = document.getElementById("despesa-pagamento").value;
    const categoria = document.getElementById("despesa-categoria-select").value;

    const valorReais = moedaParaNumero(
        document.getElementById("despesa-valor-input").value
    );

    if (!data || !local || !desc || !valorReais || !categoria) {
        alert("Preencha todos os campos corretamente.");
        return;
    }

    const resposta = await fetch(`${API_URL}/transacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            descricao: `${desc} • ${local} • ${pagamento}`,
            valor: -valorReais,
            data,
            id_usuario: Number(usuarioId),
            id_categoria: Number(categoria)
        })
    });

    if (!resposta.ok) {
        const erro = await resposta.text();
        console.error("Erro ao salvar despesa:", erro);
        alert("Erro ao salvar despesa.");
        return;
    }

    location.reload();
}



// 9. MODAL SALDO
function ajustarSaldoInicial() {
    document.getElementById("modalSaldo").style.display = "block";
}

function fecharModal() {
    document.getElementById("modalSaldo").style.display = "none";
    document.getElementById("inputNovoSaldo").value = "";
}

async function confirmarAjusteSaldo() {
    const saldo = moedaParaNumero(document.getElementById("inputNovoSaldo").value);

    await fetch(`${API_URL}/usuarios/${usuarioId}/saldo-inicial`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saldo })
    });

    fecharModal();
    location.reload();
}

// 10. METAS
async function carregarMetas() {
    const res = await fetch(`${API_URL}/metas?usuario_id=${usuarioId}`);
    const metas = await res.json();

    document.getElementById("lista-metas").innerHTML = metas.map(m => `
        <li>
            <div>
                <strong>${m.nome}</strong><br>
                <small>${m.data_limite}</small>
            </div>
            <span>${formatarMoeda(m.valor_alvo)}</span>
        </li>
    `).join("");
}

async function salvarMeta() {
    const nome = document.getElementById("meta-nome").value;
    const valor = moedaParaNumero(document.getElementById("meta-valor").value);
    const data = document.getElementById("meta-data").value;

    await fetch(`${API_URL}/metas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nome,
            valor_alvo: valor,
            data_limite: data,
            id_usuario: Number(usuarioId)
        })
    });

    carregarMetas();
}

// 11. UTILITÁRIOS
function toggleDespesas() {
    document.getElementById("lista-despesas").classList.toggle("hidden");
}

function toggleTransacoes() {
    document.getElementById("lista-transacoes").classList.toggle("hidden");
}

function toggleMetas() {
    document.getElementById("lista-metas").classList.toggle("hidden");
}

function logout() {
    document.getElementById("modalLogout").style.display = "block";
}

function fecharModalLogout() {
    document.getElementById("modalLogout").style.display = "none";
}

function confirmarLogout() {
    localStorage.clear();
    window.location.href = "login.html";
}

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

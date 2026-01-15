// 1. CONSTANTES
const API_URL = "http://127.0.0.1:8000";
const usuarioId = localStorage.getItem('id_usuario');

// 2. INICIALIZAÇÃO
window.onload = async () => {
    if (!usuarioId) {
        window.location.href = "login.html";
        return;
    }

    const nomeSalvo = localStorage.getItem('nome_usuario');
    const nomeComp = document.getElementById('nome-usuario');
    if (nomeComp) {
        nomeComp.textContent = nomeSalvo && nomeSalvo !== "null" ? nomeSalvo : "Usuário";
    }

    await carregarDadosIniciais();
    await carregarMetas();
};

// 3. CARREGAR DADOS (SALDO E TRANSAÇÕES)
async function carregarDadosIniciais() {
    try {
        // Busca dados do usuário (Saldo Inicial)
        const respUser = await fetch(`${API_URL}/usuarios/${usuarioId}`);
        const usuario = await respUser.json();
        const saldoInicial = Number(usuario.saldo_inicial) || 0;

        document.getElementById('saldo-inicial-info').textContent = `Saldo Inicial: R$ ${saldoInicial.toFixed(2)}`;

        // Busca Transações
        const respTrans = await fetch(`${API_URL}/transacoes?usuario_id=${usuarioId}`);
        const transacoes = await respTrans.json();

        // Renderiza as listas
        renderizarTransacoesGerais(transacoes, saldoInicial);
        renderizarHistoricoDespesas(transacoes);

    } catch (erro) {
        console.error("Erro ao carregar dados iniciais:", erro);
    }
}

// 4. RENDERIZAR TRANSAÇÕES E CÁLCULO DE SALDO TOTAL
function renderizarTransacoesGerais(transacoes, saldoInicial) {
    const lista = document.getElementById('lista-transacoes');
    if (!lista) return;

    lista.innerHTML = "";
    let movimentacaoTotal = 0;

    transacoes.forEach(t => {
        const valor = Number(t.valor);
        movimentacaoTotal += valor;

        const item = document.createElement('li');
        item.innerHTML = `
            <span>${t.data} - ${t.descricao}</span>
            <b style="color: ${valor < 0 ? '#e74c3c' : '#27ae60'}">
                R$ ${valor.toFixed(2)}
            </b>`;
        lista.appendChild(item);
    });

    const saldoTotal = saldoInicial + movimentacaoTotal;
    const compSaldo = document.getElementById('saldo-valor');
    if (compSaldo) {
        compSaldo.textContent = `R$ ${saldoTotal.toFixed(2)}`;
        compSaldo.style.color = saldoTotal < 0 ? "#e74c3c" : "#ffffff";
    }
}

// 5. RENDERIZAR HISTÓRICO ESPECÍFICO DE DESPESAS
function renderizarHistoricoDespesas(transacoes) {
    const listaDespesas = document.getElementById('lista-despesas');
    const despesasValorGeral = document.getElementById('despesas-valor-geral');
    
    if (!listaDespesas) return;

    listaDespesas.innerHTML = "";
    let totalDespesasSoma = 0;

    const despesas = transacoes.filter(t => Number(t.valor) < 0);

    despesas.forEach(t => {
        const valor = Number(t.valor);
        totalDespesasSoma += valor;

        const item = document.createElement('li');
        item.innerHTML = `
            <span>${t.data} - ${t.descricao}</span>
            <b style="color:#e74c3c">
                R$ ${Math.abs(valor).toFixed(2)}
            </b>`;
        listaDespesas.appendChild(item);
    });

    if (despesasValorGeral) {
        despesasValorGeral.textContent = `R$ ${Math.abs(totalDespesasSoma).toFixed(2)}`;
    }
}

// 6. SALVAR TRANSAÇÃO (FORMULÁRIO DIREITO)
async function salvarTransacao() {
    const desc = document.getElementById('trans-desc').value;
    let valorInput = document.getElementById('trans-valor').value;
    const data = document.getElementById('trans-data').value;
    const categoriaSelect = document.getElementById('trans-categoria-select');

    if (!desc || !valorInput || !data) {
        alert("Preencha todos os campos da entrada.");
        return;
    }

    // FORÇAR POSITIVO: 
    // Math.abs garante que se o usuário digitar -50, vire 50.
    const valor = Math.abs(Number(valorInput));

    const dados = {
        descricao: desc,
        valor: valor, // Salva como número positivo no banco
        data: data,
        id_usuario: Number(usuarioId),
        id_categoria: Number(categoriaSelect.value)
    };

    try {
        const response = await fetch(`${API_URL}/transacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (response.ok) {
            alert("Valor adicionado com sucesso!");
            location.reload();
        } else {
            alert("Erro ao salvar entrada.");
        }
    } catch (erro) {
        console.error("Erro de conexão:", erro);
    }
}

// 7. SALVAR DESPESA (FORMULÁRIO ESQUERDO)
async function salvarDespesa() {
    const data = document.getElementById('despesa-data').value;
    const local = document.getElementById('despesa-local').value;
    const descricao = document.getElementById('despesa-descricao').value;
    const valorInput = document.getElementById('despesa-valor-input').value;
    const pagamento = document.getElementById('despesa-pagamento').value;
    const categoria = document.getElementById('despesa-categoria-select').value;

    if (!data || !local || !descricao || !valorInput) {
        alert("Preencha os campos da despesa.");
        return;
    }

    const valor = Math.abs(Number(valorInput)) * -1;

    const dados = {
        descricao: `${descricao} • ${local} • ${pagamento}`,
        valor: valor,
        data: data,
        id_usuario: Number(usuarioId),
        id_categoria: Number(categoria)
    };

    const response = await fetch(`${API_URL}/transacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });

    if (response.ok) location.reload();
}

// 8. MODAL SALDO
function ajustarSaldoInicial() {
    document.getElementById('modalSaldo').style.display = 'block';
    document.getElementById('inputNovoSaldo').focus();
}

function fecharModal() {
    document.getElementById('modalSaldo').style.display = 'none';
    document.getElementById('inputNovoSaldo').value = '';
}

async function confirmarAjusteSaldo() {
    const input = document.getElementById('inputNovoSaldo').value;
    const saldo = Number(input.replace(',', '.'));

    if (isNaN(saldo)) {
        alert("Valor inválido.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/usuarios/${usuarioId}/saldo-inicial`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ saldo })
        });

        if (response.ok) {
            alert("Saldo atualizado!");
            location.reload();
        }
    } catch (e) {
        alert("Erro na conexão.");
    } finally {
        fecharModal();
    }
}

// 9. METAS
async function carregarMetas() {
    try {
        const resposta = await fetch(`${API_URL}/metas?usuario_id=${usuarioId}`);
        const metas = await resposta.json();
        const lista = document.getElementById('lista-metas');
        if (lista) {
            lista.innerHTML = metas.map(m => `
                <li>
                    <div><strong>${m.nome}</strong><br><small>${m.data_limite}</small></div>
                    <span>R$ ${Number(m.valor_alvo).toFixed(2)}</span>
                </li>
            `).join('');
        }
    } catch (e) { console.error("Erro metas:", e); }
}

async function salvarMeta() {
    const nome = document.getElementById('meta-nome').value;
    const valor_alvo = Number(document.getElementById('meta-valor').value);
    const data_limite = document.getElementById('meta-data').value;

    if (!nome || isNaN(valor_alvo)) return;

    await fetch(`${API_URL}/metas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, valor_alvo, data_limite, id_usuario: Number(usuarioId) })
    });
    carregarMetas();
}

// 10. UTILITÁRIOS
function toggleDespesas() {
    const lista = document.getElementById('lista-despesas');
    if (lista) lista.classList.toggle('hidden');
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

// Funções do Menu Lateral (sidenav)
function openNav() { document.getElementById("mySidenav").style.width = "250px"; }
function closeNav() { document.getElementById("mySidenav").style.width = "0"; }
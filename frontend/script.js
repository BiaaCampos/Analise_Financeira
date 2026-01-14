// 1. CONSTANTES E SEGURANÇA
const API_URL = "http://127.0.0.1:8000";
const usuarioId = localStorage.getItem('id_usuario');

// 2. FUNÇÃO DE INICIALIZAÇÃO
window.onload = async () => {
    if (!usuarioId) return;

    // CORREÇÃO: garante nome do usuário
    const nomeSalvo = localStorage.getItem('nome_usuario');
    const nomeComp = document.getElementById('nome-usuario');
    
    if (nomeComp) {
        nomeComp.textContent = nomeSalvo && nomeSalvo !== "null" ? nomeSalvo : "Usuário";
    }

    await carregarDadosIniciais();
    await carregarMetas();
};

// 3. CARREGAR SALDO E TRANSAÇÕES
async function carregarDadosIniciais() {
    try {
        // Busca usuário
        const respUser = await fetch(`${API_URL}/usuarios/${usuarioId}`);
        const usuario = await respUser.json();

        // CORREÇÃO: força número
        const saldoInicial = Number(usuario.saldo_inicial) || 0;

        const infoSaldoIni = document.getElementById('saldo-inicial-info');
        if (infoSaldoIni) {
            infoSaldoIni.textContent = `Saldo Inicial: R$ ${saldoInicial.toFixed(2)}`;
        }

        // Busca transações
        const respTrans = await fetch(`${API_URL}/transacoes?usuario_id=${usuarioId}`);
        const transacoes = await respTrans.json();

        const lista = document.getElementById('lista-transacoes');
        let movimentacao = 0;

        if (lista) {
            lista.innerHTML = "";

            transacoes.forEach(t => {
                // CORREÇÃO CRÍTICA
                const valor = Number(t.valor);
                movimentacao += valor;

                const item = document.createElement('li');
                item.innerHTML = `
                    <span>${t.data} - ${t.descricao}</span>
                    <b style="color: ${valor < 0 ? '#e74c3c' : '#27ae60'}">
                        R$ ${valor.toFixed(2)}
                    </b>`;
                lista.appendChild(item);
            });
        }

        // CORREÇÃO: cálculo correto do saldo
        const saldoTotal = saldoInicial + movimentacao;
        const compSaldo = document.getElementById('saldo-valor');

        if (compSaldo) {
            compSaldo.textContent = `R$ ${saldoTotal.toFixed(2)}`;
            compSaldo.style.color = saldoTotal < 0 ? "#e74c3c" : "#ffffff";
        }

    } catch (erro) {
        console.error("Erro ao carregar dados:", erro);
    }
}

// 4. SALVAR NOVA TRANSAÇÃO
async function salvarTransacao() {
    const desc = document.getElementById('desc').value;
    let valor = Number(document.getElementById('valor').value);
    const data = document.getElementById('data').value;
    const categoriaSelect = document.getElementById('categoria-select');

    if (!desc || isNaN(valor) || !data) {
        alert("Preencha todos os campos corretamente.");
        return;
    }

    const textoCategoria = categoriaSelect.options[categoriaSelect.selectedIndex].text;

    // CORREÇÃO: regra de entrada/saída
    if (textoCategoria.toLowerCase() !== "salário" && valor > 0) {
        valor = valor * -1;
    }

    const dados = {
        descricao: desc,
        valor: valor,
        data: data,
        id_usuario: Number(usuarioId),
        id_categoria: Number(categoriaSelect.value)
    };

    const response = await fetch(`${API_URL}/transacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });

    if (response.ok) {
        location.reload();
    }
}

// 5. AJUSTAR SALDO INICIAL
async function ajustarSaldoInicial() {
    const novoSaldo = prompt("Digite o novo saldo inicial:");
    if (!novoSaldo) return;

    const saldo = Number(novoSaldo.replace(',', '.'));
    if (isNaN(saldo)) {
        alert("Valor inválido.");
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/usuarios/${usuarioId}/saldo-inicial`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ saldo })
            }
        );

        if (response.ok) {
            alert("Saldo modificado!");
            location.reload();
        } else {
            alert("Erro ao atualizar saldo.");
        }
    } catch {
        alert("Erro de conexão com o servidor.");
    }
}


// 6. METAS FUTURAS
async function carregarMetas() {
    try {
        const resposta = await fetch(`${API_URL}/metas?usuario_id=${usuarioId}`);
        const metas = await resposta.json();
        const lista = document.getElementById('lista-metas');

        if (lista) {
            lista.innerHTML = metas.map(m => `
                <li>
                    <div>
                        <strong>${m.nome}</strong><br>
                        <small>${m.data_limite}</small>
                    </div>
                    <span>R$ ${Number(m.valor_alvo).toFixed(2)}</span>
                </li>
            `).join('');
        }
    } catch (erro) {
        console.error("Erro metas:", erro);
    }
}

// 7. SALVAR META
async function salvarMeta() {
    const nome = document.getElementById('meta-nome').value;
    const valor_alvo = Number(document.getElementById('meta-valor').value);
    const data_limite = document.getElementById('meta-data').value;

    if (!nome || isNaN(valor_alvo)) return;

    const dados = {
        nome,
        valor_alvo,
        data_limite,
        id_usuario: Number(usuarioId)
    };

    await fetch(`${API_URL}/metas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });

    carregarMetas();
}

// 8. LOGOUT
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

// 9. CARREGAR TOTAL DE DESPESAS
async function carregarDespesas() {
    try {
        const response = await fetch(
            `${API_URL}/despesas/total?usuario_id=${usuarioId}`
        );

        if (!response.ok) return;

        const data = await response.json();
        const total = Number(data.total_despesas) || 0;

        const compDespesas = document.getElementById('despesas-valor');
        if (compDespesas) {
            compDespesas.textContent = `R$ ${total.toFixed(2)}`;
            compDespesas.style.color = "#e74c3c";
        }
    } catch (e) {
        console.error("Erro ao carregar despesas:", e);
    }
}

async function salvarDespesa() {
    const data = document.getElementById('despesa-data').value;
    const local = document.getElementById('despesa-local').value;
    const descricao = document.getElementById('despesa-descricao').value;
    const valorInput = document.getElementById('despesa-valor').value;
    const pagamento = document.getElementById('despesa-pagamento').value;
    const categoria = document.getElementById('categoria-select').value;

    if (!data || !local || !descricao || !valorInput || !pagamento) {
        alert("Preencha todos os campos da despesa.");
        return;
    }

    const valor = Number(valorInput) * -1; // despesa sempre negativa

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

    if (response.ok) {
        location.reload();
    } else {
        alert("Erro ao salvar despesa.");
    }
}

const listaDespesas = document.getElementById('lista-despesas');
const despesasValor = document.getElementById('despesas-valor');

let totalDespesas = 0;

if (listaDespesas) {
    listaDespesas.innerHTML = "";

    transacoes
        .filter(t => Number(t.valor) < 0)
        .forEach(t => {
            const valor = Number(t.valor);
            totalDespesas += valor;

            const item = document.createElement('li');
            item.innerHTML = `
                <span>${t.data} - ${t.descricao}</span>
                <b style="color:#e74c3c">
                    R$ ${Math.abs(valor).toFixed(2)}
                </b>
            `;
            listaDespesas.appendChild(item);
        });
}

if (despesasValor) {
    despesasValor.textContent = `R$ ${Math.abs(totalDespesas).toFixed(2)}`;
}


function toggleDespesas() {
    const lista = document.getElementById('lista-despesas');
    if (!lista) return;

    lista.classList.toggle('hidden');
}

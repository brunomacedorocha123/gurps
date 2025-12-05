// ============================================
// SISTEMA DE VANTAGENS - JS FUNCIONAL
// ============================================

// Dados do catálogo
const catalogo = {
    vantagens: [
        {
            id: "abencoado",
            nome: "Abençoado",
            categoria: "sobrenatural",
            tipo: "multipla",
            descricao: "Sintonizado com uma entidade divina/demoníaca/espiritual.",
            variacoes: [
                { id: "abencoado-basico", nome: "Abençoado", custo: 10, descricao: "Recebe visões após 1h de ritual." },
                { id: "muito-abencoado", nome: "Muito Abençoado", custo: 20, descricao: "+5 no teste de IQ para visões." },
                { id: "feitos-heroicos", nome: "Feitos Heroicos", custo: 15, descricao: "1x por sessão: +1 dado em ST, DX ou HT." }
            ]
        },
        {
            id: "resistencia-magia",
            nome: "Resistência à Magia",
            categoria: "sobrenatural",
            tipo: "variavel",
            descricao: "Resistência natural contra efeitos mágicos.",
            niveis: 5,
            custoPorNivel: 3,
            nivelBase: 1
        },
        {
            id: "sentidos-aguçados",
            nome: "Sentidos Aguçados",
            categoria: "fisica",
            tipo: "simples",
            custo: 5,
            descricao: "Visão, audição ou olfato excepcionais. +2 em percepção."
        },
        {
            id: "carisma",
            nome: "Carisma",
            categoria: "social",
            tipo: "variavel",
            descricao: "Habilidade natural de influenciar pessoas.",
            niveis: 4,
            custoPorNivel: 5,
            nivelBase: 1
        },
        {
            id: "reflexos-rapidos",
            nome: "Reflexos Rápidos",
            categoria: "fisica",
            tipo: "simples",
            custo: 15,
            descricao: "+1 em todos os testes de iniciativa e esquiva."
        }
    ],
    desvantagens: [
        {
            id: "alcoolismo",
            nome: "Alcoolismo",
            categoria: "mental",
            tipo: "multipla",
            descricao: "Vício em álcool que afeta o julgamento.",
            variacoes: [
                { id: "alcoolismo-leve", nome: "Alcoolismo (Leve)", custo: -10, descricao: "Precisa beber regularmente." },
                { id: "alcoolismo-grave", nome: "Alcoolismo (Grave)", custo: -20, descricao: "Dependente. Testes diários." }
            ]
        },
        {
            id: "medo-de-altura",
            nome: "Medo de Altura",
            categoria: "mental",
            tipo: "simples",
            custo: -15,
            descricao: "Fobia incapacitante de lugares altos."
        },
        {
            id: "codigo-honra",
            nome: "Código de Honra",
            categoria: "social",
            tipo: "multipla",
            descricao: "Seguir um código rígido de conduta.",
            variacoes: [
                { id: "honra-samurai", nome: "Código do Samurai", custo: -15, descricao: "Bushido - Lealdade, honra, coragem." },
                { id: "honra-cavaleiro", nome: "Código do Cavaleiro", custo: -10, descricao: "Proteger os fracos, ser cortês." }
            ]
        },
        {
            id: "pobre",
            nome: "Pobre",
            categoria: "social",
            tipo: "variavel",
            descricao: "Falta de recursos financeiros.",
            niveis: 3,
            custoPorNivel: -5,
            nivelBase: 1
        },
        {
            id: "doenca-cronica",
            nome: "Doença Crônica",
            categoria: "fisica",
            tipo: "simples",
            custo: -10,
            descricao: "Doença persistente que requer tratamento."
        }
    ]
};

// Estado do sistema
let estado = {
    pontosDisponiveis: 100,
    vantagensAdquiridas: [],
    desvantagensAdquiridas: [],
    peculiaridades: [],
    itemSelecionado: null,
    tipoSelecionado: null,
    variacaoSelecionada: null,
    nivelSelecionado: 1
};

// ========== INICIALIZAÇÃO ==========
function inicializar() {
    console.log("Inicializando sistema...");
    
    // Carregar dados salvos
    carregarDados();
    
    // Carregar listas
    carregarVantagens();
    carregarDesvantagens();
    
    // Configurar eventos
    configurarEventos();
    
    // Atualizar interface
    atualizarTudo();
    
    console.log("Sistema pronto!");
}

// ========== CARREGAR DADOS SALVOS ==========
function carregarDados() {
    try {
        const dados = localStorage.getItem('vantagensDados');
        if (dados) {
            const parsed = JSON.parse(dados);
            estado.vantagensAdquiridas = parsed.vantagensAdquiridas || [];
            estado.desvantagensAdquiridas = parsed.desvantagensAdquiridas || [];
            estado.peculiaridades = parsed.peculiaridades || [];
            estado.pontosDisponiveis = parsed.pontosDisponiveis || 100;
            console.log("Dados carregados do localStorage");
        }
    } catch (e) {
        console.error("Erro ao carregar dados:", e);
    }
}

// ========== SALVAR DADOS ==========
function salvarDados() {
    try {
        const dados = {
            vantagensAdquiridas: estado.vantagensAdquiridas,
            desvantagensAdquiridas: estado.desvantagensAdquiridas,
            peculiaridades: estado.peculiaridades,
            pontosDisponiveis: estado.pontosDisponiveis,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('vantagensDados', JSON.stringify(dados));
        mostrarNotificacao("Dados salvos!", "success");
        console.log("Dados salvos");
    } catch (e) {
        console.error("Erro ao salvar:", e);
        mostrarNotificacao("Erro ao salvar!", "error");
    }
}

// ========== CARREGAR VANTAGENS ==========
function carregarVantagens() {
    const container = document.getElementById('lista-vantagens');
    if (!container) return;
    
    container.innerHTML = '';
    
    catalogo.vantagens.forEach(vantagem => {
        // Verificar se já foi adquirida
        const jaAdquirida = estado.vantagensAdquiridas.some(v => v.baseId === vantagem.id);
        if (jaAdquirida) return;
        
        const item = criarItemElemento(vantagem, 'vantagem');
        container.appendChild(item);
    });
    
    // Atualizar lista adquirida
    atualizarVantagensAdquiridas();
}

// ========== CARREGAR DESVANTAGENS ==========
function carregarDesvantagens() {
    const container = document.getElementById('lista-desvantagens');
    if (!container) return;
    
    container.innerHTML = '';
    
    catalogo.desvantagens.forEach(desvantagem => {
        // Verificar se já foi adquirida
        const jaAdquirida = estado.desvantagensAdquiridas.some(d => d.baseId === desvantagem.id);
        if (jaAdquirida) return;
        
        const item = criarItemElemento(desvantagem, 'desvantagem');
        container.appendChild(item);
    });
    
    // Atualizar lista adquirida
    atualizarDesvantagensAdquiridas();
}

// ========== CRIAR ELEMENTO DE ITEM ==========
function criarItemElemento(item, tipo) {
    const div = document.createElement('div');
    div.className = `item ${tipo === 'desvantagem' ? 'item-desvantagem' : ''}`;
    div.dataset.id = item.id;
    div.dataset.tipo = tipo;
    
    // Calcular custo para exibição
    let custoDisplay = '';
    if (item.tipo === 'variavel') {
        const custo = Math.abs(item.custoPorNivel) || 2;
        custoDisplay = `${custo} pts/nível`;
    } else if (item.tipo === 'multipla') {
        const custos = item.variacoes.map(v => Math.abs(v.custo));
        const min = Math.min(...custos);
        const max = Math.max(...custos);
        custoDisplay = min === max ? `${min} pts` : `${min}-${max} pts`;
    } else {
        custoDisplay = `${Math.abs(item.custo)} pts`;
    }
    
    // Adicionar sinal
    if (tipo === 'vantagem') {
        custoDisplay = '+' + custoDisplay;
    } else {
        custoDisplay = '-' + custoDisplay;
    }
    
    div.innerHTML = `
        <div class="item-header">
            <h4 class="item-nome">${item.nome}</h4>
            <div class="item-custo">${custoDisplay}</div>
        </div>
        <div class="item-descricao">${item.descricao}</div>
    `;
    
    div.addEventListener('click', () => selecionarItem(item, tipo));
    
    return div;
}

// ========== SELECIONAR ITEM ==========
function selecionarItem(item, tipo) {
    console.log("Selecionado:", item.nome, tipo);
    
    estado.itemSelecionado = item;
    estado.tipoSelecionado = tipo;
    estado.variacaoSelecionada = null;
    estado.nivelSelecionado = item.nivelBase || 1;
    
    abrirModal(item, tipo);
}

// ========== MODAL ==========
function abrirModal(item, tipo) {
    const modal = document.getElementById('modal');
    const titulo = document.getElementById('modal-titulo');
    const corpo = document.getElementById('modal-corpo');
    
    if (!modal || !titulo || !corpo) return;
    
    // Configurar título
    titulo.textContent = `Adquirir ${tipo === 'vantagem' ? 'Vantagem' : 'Desvantagem'}: ${item.nome}`;
    
    // Gerar conteúdo baseado no tipo
    let conteudo = '';
    
    if (item.tipo === 'multipla') {
        conteudo = gerarConteudoMultipla(item, tipo);
    } else if (item.tipo === 'variavel') {
        conteudo = gerarConteudoVariavel(item, tipo);
    } else {
        conteudo = gerarConteudoSimples(item, tipo);
    }
    
    corpo.innerHTML = conteudo;
    
    // Mostrar modal
    modal.style.display = 'flex';
    
    // Configurar eventos específicos
    setTimeout(() => {
        if (item.tipo === 'multipla') {
            configurarVariacoes();
        } else if (item.tipo === 'variavel') {
            configurarNiveis();
        }
    }, 10);
}

function gerarConteudoSimples(item, tipo) {
    const custo = Math.abs(item.custo);
    const sinal = tipo === 'vantagem' ? '+' : '-';
    
    return `
        <div style="margin-bottom: 20px; line-height: 1.6;">
            ${item.descricao}
        </div>
        <div class="custo-display">
            Custo: ${sinal}${custo} pontos
        </div>
    `;
}

function gerarConteudoMultipla(item, tipo) {
    let html = `
        <div style="margin-bottom: 15px; line-height: 1.6;">
            ${item.descricao}
        </div>
        <div style="margin-bottom: 20px;">
            <p><strong>Escolha uma variação:</strong></p>
    `;
    
    item.variacoes.forEach((variacao, index) => {
        const sinal = variacao.custo > 0 ? '+' : '-';
        html += `
            <div class="opcao-variacao" data-id="${variacao.id}" ${index === 0 ? 'onclick="selecionarVariacao(this)"' : ''}>
                <div class="variacao-header">
                    <strong>${variacao.nome}</strong>
                    <span class="variacao-custo">${sinal}${Math.abs(variacao.custo)} pts</span>
                </div>
                <div style="font-size: 0.9em; color: #666; margin-top: 5px;">
                    ${variacao.descricao}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

function gerarConteudoVariavel(item, tipo) {
    const sinal = tipo === 'vantagem' ? '+' : '-';
    let html = `
        <div style="margin-bottom: 15px; line-height: 1.6;">
            ${item.descricao}
        </div>
        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 10px; font-weight: bold;">
                Selecione o nível (cada nível: ${sinal}${Math.abs(item.custoPorNivel)} pts):
            </label>
            <select class="select-nivel" id="seletor-nivel" onchange="atualizarCustoNivel()">
    `;
    
    for (let i = item.nivelBase || 1; i <= item.niveis; i++) {
        const custo = i * item.custoPorNivel;
        html += `<option value="${i}">Nível ${i} (${sinal}${Math.abs(custo)} pts)</option>`;
    }
    
    html += `
            </select>
            <div class="custo-display" id="custo-total">
                Custo total: ${sinal}${Math.abs(item.nivelBase * item.custoPorNivel)} pontos
            </div>
        </div>
    `;
    
    return html;
}

function configurarVariacoes() {
    const opcoes = document.querySelectorAll('.opcao-variacao');
    opcoes.forEach(opcao => {
        opcao.addEventListener('click', function() {
            selecionarVariacao(this);
        });
    });
    
    // Selecionar primeira
    if (opcoes[0]) {
        opcoes[0].classList.add('selecionada');
        const variacaoId = opcoes[0].dataset.id;
        const item = estado.itemSelecionado;
        estado.variacaoSelecionada = item.variacoes.find(v => v.id === variacaoId);
    }
}

function selecionarVariacao(elemento) {
    // Remover seleção de todas
    document.querySelectorAll('.opcao-variacao').forEach(o => {
        o.classList.remove('selecionada');
    });
    
    // Adicionar seleção
    elemento.classList.add('selecionada');
    
    // Encontrar variação
    const variacaoId = elemento.dataset.id;
    const item = estado.itemSelecionado;
    estado.variacaoSelecionada = item.variacoes.find(v => v.id === variacaoId);
}

function configurarNiveis() {
    const seletor = document.getElementById('seletor-nivel');
    if (seletor) {
        seletor.addEventListener('change', atualizarCustoNivel);
    }
}

function atualizarCustoNivel() {
    const seletor = document.getElementById('seletor-nivel');
    if (!seletor || !estado.itemSelecionado) return;
    
    estado.nivelSelecionado = parseInt(seletor.value);
    const custo = estado.nivelSelecionado * estado.itemSelecionado.custoPorNivel;
    const sinal = estado.tipoSelecionado === 'vantagem' ? '+' : '-';
    
    const display = document.getElementById('custo-total');
    if (display) {
        display.textContent = `Custo total: ${sinal}${Math.abs(custo)} pontos`;
    }
}

function fecharModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.style.display = 'none';
    }
    estado.itemSelecionado = null;
    estado.tipoSelecionado = null;
    estado.variacaoSelecionada = null;
    estado.nivelSelecionado = 1;
}

function confirmarAdquirir() {
    if (!estado.itemSelecionado || !estado.tipoSelecionado) {
        mostrarNotificacao("Nenhum item selecionado!", "error");
        return;
    }
    
    // Criar item adquirido
    let itemAdquirido = {
        id: `${estado.itemSelecionado.id}-${Date.now()}`,
        baseId: estado.itemSelecionado.id,
        nome: estado.itemSelecionado.nome,
        descricao: estado.itemSelecionado.descricao,
        tipo: estado.itemSelecionado.tipo
    };
    
    // Calcular custo
    let custo = 0;
    
    if (estado.itemSelecionado.tipo === 'multipla') {
        if (estado.variacaoSelecionada) {
            itemAdquirido.nome = estado.variacaoSelecionada.nome;
            itemAdquirido.descricao = estado.variacaoSelecionada.descricao;
            custo = estado.variacaoSelecionada.custo;
        } else if (estado.itemSelecionado.variacoes[0]) {
            const primeira = estado.itemSelecionado.variacoes[0];
            itemAdquirido.nome = primeira.nome;
            itemAdquirido.descricao = primeira.descricao;
            custo = primeira.custo;
        }
    } else if (estado.itemSelecionado.tipo === 'variavel') {
        custo = estado.nivelSelecionado * estado.itemSelecionado.custoPorNivel;
        itemAdquirido.nivel = estado.nivelSelecionado;
    } else {
        custo = estado.itemSelecionado.custo;
    }
    
    // Para desvantagens, custo é negativo
    if (estado.tipoSelecionado === 'desvantagem') {
        custo = -Math.abs(custo);
    }
    
    itemAdquirido.custo = custo;
    
    // Verificar pontos
    if (estado.tipoSelecionado === 'vantagem') {
        const custoAbs = Math.abs(custo);
        if (custoAbs > estado.pontosDisponiveis) {
            mostrarNotificacao("Pontos insuficientes!", "error");
            return;
        }
        estado.pontosDisponiveis -= custoAbs;
        estado.vantagensAdquiridas.push(itemAdquirido);
    } else {
        const pontosGanhos = Math.abs(custo);
        estado.pontosDisponiveis += pontosGanhos;
        estado.desvantagensAdquiridas.push(itemAdquirido);
    }
    
    // Atualizar interface
    atualizarTudo();
    fecharModal();
    
    mostrarNotificacao("Item adquirido!", "success");
    salvarDados();
}

// ========== ATUALIZAR LISTAS ADQUIRIDAS ==========
function atualizarVantagensAdquiridas() {
    const container = document.getElementById('lista-vantagens-adquiridas');
    const contador = document.getElementById('contador-vantagens');
    
    if (!container) return;
    
    if (estado.vantagensAdquiridas.length === 0) {
        container.innerHTML = `
            <div class="vazio">
                <i class="fas fa-inbox"></i>
                <p>Nenhuma vantagem</p>
            </div>
        `;
    } else {
        let html = '';
        estado.vantagensAdquiridas.forEach((item, index) => {
            html += criarItemAdquirido(item, 'vantagem', index);
        });
        container.innerHTML = html;
        
        // Adicionar eventos de remoção
        setTimeout(() => {
            document.querySelectorAll('#lista-vantagens-adquiridas .btn-remover').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const index = parseInt(this.dataset.index);
                    removerVantagem(index);
                });
            });
        }, 10);
    }
    
    if (contador) {
        contador.textContent = `(${estado.vantagensAdquiridas.length})`;
    }
}

function atualizarDesvantagensAdquiridas() {
    const container = document.getElementById('lista-desvantagens-adquiridas');
    const contador = document.getElementById('contador-desvantagens');
    
    if (!container) return;
    
    if (estado.desvantagensAdquiridas.length === 0) {
        container.innerHTML = `
            <div class="vazio">
                <i class="fas fa-inbox"></i>
                <p>Nenhuma desvantagem</p>
            </div>
        `;
    } else {
        let html = '';
        estado.desvantagensAdquiridas.forEach((item, index) => {
            html += criarItemAdquirido(item, 'desvantagem', index);
        });
        container.innerHTML = html;
        
        // Adicionar eventos de remoção
        setTimeout(() => {
            document.querySelectorAll('#lista-desvantagens-adquiridas .btn-remover').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const index = parseInt(this.dataset.index);
                    removerDesvantagem(index);
                });
            });
        }, 10);
    }
    
    if (contador) {
        contador.textContent = `(${estado.desvantagensAdquiridas.length})`;
    }
}

function criarItemAdquirido(item, tipo, index) {
    const cor = tipo === 'vantagem' ? 'var(--cor-vantagem)' : 'var(--cor-desvantagem)';
    const sinal = item.custo >= 0 ? '+' : '-';
    
    return `
        <div class="item item-adquirido ${tipo === 'desvantagem' ? 'item-desvantagem' : ''}" 
             style="border-left-color: ${cor};">
            <div class="item-header">
                <h4 class="item-nome">${item.nome}</h4>
                <div class="item-custo" style="background: ${cor}">${sinal}${Math.abs(item.custo)} pts</div>
            </div>
            <div class="item-descricao">${item.descricao}</div>
            <button class="btn-remover" data-index="${index}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
}

// ========== REMOVER ITENS ==========
function removerVantagem(index) {
    if (index < 0 || index >= estado.vantagensAdquiridas.length) return;
    
    if (!confirm("Remover esta vantagem?")) return;
    
    const item = estado.vantagensAdquiridas[index];
    estado.pontosDisponiveis += Math.abs(item.custo);
    estado.vantagensAdquiridas.splice(index, 1);
    
    atualizarTudo();
    salvarDados();
    mostrarNotificacao("Vantagem removida!", "info");
}

function removerDesvantagem(index) {
    if (index < 0 || index >= estado.desvantagensAdquiridas.length) return;
    
    if (!confirm("Remover esta desvantagem?")) return;
    
    const item = estado.desvantagensAdquiridas[index];
    estado.pontosDisponiveis -= Math.abs(item.custo);
    estado.desvantagensAdquiridas.splice(index, 1);
    
    atualizarTudo();
    salvarDados();
    mostrarNotificacao("Desvantagem removida!", "info");
}

function limparVantagens() {
    if (estado.vantagensAdquiridas.length === 0) {
        mostrarNotificacao("Não há vantagens para limpar!", "info");
        return;
    }
    
    if (!confirm(`Limpar TODAS as ${estado.vantagensAdquiridas.length} vantagens?`)) return;
    
    // Recuperar pontos
    const totalPontos = estado.vantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0);
    estado.pontosDisponiveis += totalPontos;
    estado.vantagensAdquiridas = [];
    
    atualizarTudo();
    salvarDados();
    mostrarNotificacao("Todas as vantagens removidas!", "success");
}

function limparDesvantagens() {
    if (estado.desvantagensAdquiridas.length === 0) {
        mostrarNotificacao("Não há desvantagens para limpar!", "info");
        return;
    }
    
    if (!confirm(`Limpar TODAS as ${estado.desvantagensAdquiridas.length} desvantagens?`)) return;
    
    // Perder pontos ganhos
    const totalPontos = estado.desvantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0);
    estado.pontosDisponiveis -= totalPontos;
    estado.desvantagensAdquiridas = [];
    
    atualizarTudo();
    salvarDados();
    mostrarNotificacao("Todas as desvantagens removidas!", "success");
}

// ========== PECULIARIDADES ==========
function configurarEventosPeculiaridades() {
    const textarea = document.getElementById('nova-pec');
    const contador = document.getElementById('contador-pec');
    
    if (textarea && contador) {
        textarea.addEventListener('input', function() {
            const comprimento = this.value.length;
            contador.textContent = `${comprimento}/50`;
            
            if (comprimento > 50) {
                contador.style.color = 'var(--cor-erro)';
            } else if (comprimento > 40) {
                contador.style.color = 'var(--cor-alerta)';
            } else {
                contador.style.color = 'var(--cor-texto-claro)';
            }
        });
    }
}

function adicionarPeculiaridade() {
    const textarea = document.getElementById('nova-pec');
    const texto = textarea.value.trim();
    
    if (!texto) {
        mostrarNotificacao("Digite uma peculiaridade!", "error");
        return;
    }
    
    if (texto.length > 50) {
        mostrarNotificacao("Máximo 50 caracteres!", "error");
        return;
    }
    
    if (estado.peculiaridades.length >= 5) {
        mostrarNotificacao("Limite de 5 peculiaridades!", "error");
        return;
    }
    
    if (estado.pontosDisponiveis < 1) {
        mostrarNotificacao("Pontos insuficientes!", "error");
        return;
    }
    
    // Adicionar peculiaridade
    estado.peculiaridades.push({
        id: `pec-${Date.now()}`,
        texto: texto,
        custo: -1
    });
    
    // Gastar ponto
    estado.pontosDisponiveis -= 1;
    
    // Limpar campo
    textarea.value = '';
    document.getElementById('contador-pec').textContent = '0/50';
    
    atualizarPeculiaridades();
    atualizarTudo();
    salvarDados();
    
    mostrarNotificacao("Peculiaridade adicionada! (-1 ponto)", "success");
}

function atualizarPeculiaridades() {
    const container = document.getElementById('lista-peculiaridades');
    const contadorGeral = document.getElementById('total-peculiaridades');
    
    if (!container) return;
    
    if (estado.peculiaridades.length === 0) {
        container.innerHTML = `
            <div class="vazio">
                <i class="fas fa-sticky-note"></i>
                <p>Nenhuma peculiaridade</p>
            </div>
        `;
    } else {
        let html = '';
        estado.peculiaridades.forEach((pec, index) => {
            html += `
                <div class="pec-item">
                    <div class="peculiaridade-texto">${pec.texto}</div>
                    <button class="btn-remover" onclick="removerPeculiaridade(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });
        container.innerHTML = html;
    }
    
    if (contadorGeral) {
        contadorGeral.textContent = `${estado.peculiaridades.length}/5`;
    }
}

function removerPeculiaridade(index) {
    if (index < 0 || index >= estado.peculiaridades.length) return;
    
    if (!confirm("Remover esta peculiaridade?")) return;
    
    estado.peculiaridades.splice(index, 1);
    estado.pontosDisponiveis += 1; // Recupera ponto
    
    atualizarPeculiaridades();
    atualizarTudo();
    salvarDados();
    
    mostrarNotificacao("Peculiaridade removida! (+1 ponto)", "info");
}

// ========== ATUALIZAR TUDO ==========
function atualizarTudo() {
    // Calcular totais
    const totalVantagens = estado.vantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0);
    const totalDesvantagens = estado.desvantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0);
    const totalPeculiaridades = estado.peculiaridades.length;
    
    // Atualizar elementos
    const pontosRestantes = document.getElementById('pontos-restantes');
    const totalVantagensEl = document.getElementById('total-vantagens');
    const totalDesvantagensEl = document.getElementById('total-desvantagens');
    
    if (pontosRestantes) {
        pontosRestantes.textContent = estado.pontosDisponiveis;
        pontosRestantes.className = 'valor grande';
        
        if (estado.pontosDisponiveis > 0) {
            pontosRestantes.classList.add('positivo');
        } else if (estado.pontosDisponiveis < 0) {
            pontosRestantes.classList.add('negativo');
        } else {
            pontosRestantes.classList.add('neutro');
        }
    }
    
    if (totalVantagensEl) totalVantagensEl.textContent = `+${totalVantagens}`;
    if (totalDesvantagensEl) totalDesvantagensEl.textContent = `-${totalDesvantagens}`;
    
    // Recarregar listas disponíveis (para remover itens já adquiridos)
    carregarVantagens();
    carregarDesvantagens();
}

// ========== RESETAR TUDO ==========
function resetarTudo() {
    const totalItens = estado.vantagensAdquiridas.length + 
                      estado.desvantagensAdquiridas.length + 
                      estado.peculiaridades.length;
    
    if (totalItens === 0) {
        mostrarNotificacao("Não há nada para resetar!", "info");
        return;
    }
    
    if (!confirm(`Resetar TODOS os dados (${totalItens} itens)?`)) return;
    
    estado.vantagensAdquiridas = [];
    estado.desvantagensAdquiridas = [];
    estado.peculiaridades = [];
    estado.pontosDisponiveis = 100;
    
    atualizarTudo();
    localStorage.removeItem('vantagensDados');
    
    mostrarNotificacao("Sistema resetado com sucesso!", "success");
}

// ========== NOTIFICAÇÕES ==========
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Remover notificações anteriores
    const notificacoesAntigas = document.querySelectorAll('.notificacao');
    notificacoesAntigas.forEach(n => n.remove());
    
    // Criar notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    notificacao.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${mensagem}</span>
    `;
    
    document.body.appendChild(notificacao);
    
    // Estilizar
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        background: ${tipo === 'success' ? '#27ae60' : tipo === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 99999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
        max-width: 400px;
    `;
    
    // Adicionar animação
    if (!document.querySelector('#animacao-notificacoes')) {
        const style = document.createElement('style');
        style.id = 'animacao-notificacoes';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                to { opacity: 0; transform: translateX(100%); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remover após 3 segundos
    setTimeout(() => {
        if (notificacao.parentNode) {
            notificacao.parentNode.removeChild(notificacao);
        }
    }, 3000);
}

// ========== CONFIGURAR EVENTOS ==========
function configurarEventos() {
    // Filtros
    const filtroVant = document.getElementById('filtro-vant');
    const filtroDesv = document.getElementById('filtro-desv');
    
    if (filtroVant) {
        filtroVant.addEventListener('input', function() {
            filtrarLista('vantagens', this.value);
        });
    }
    
    if (filtroDesv) {
        filtroDesv.addEventListener('input', function() {
            filtrarLista('desvantagens', this.value);
        });
    }
    
    // Peculiaridades
    configurarEventosPeculiaridades();
    
    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fecharModal();
        }
    });
}

function filtrarLista(tipo, termo) {
    const containerId = tipo === 'vantagens' ? 'lista-vantagens' : 'lista-desvantagens';
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    const itens = container.querySelectorAll('.item');
    termo = termo.toLowerCase();
    
    itens.forEach(item => {
        const nome = item.querySelector('.item-nome').textContent.toLowerCase();
        const desc = item.querySelector('.item-descricao').textContent.toLowerCase();
        const match = nome.includes(termo) || desc.includes(termo);
        item.style.display = match ? 'block' : 'none';
    });
}

// ========== INICIALIZAR ==========
// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM carregado - inicializando sistema...");
    setTimeout(inicializar, 100);
});

// Expor funções globais para botões HTML
window.limparVantagens = limparVantagens;
window.limparDesvantagens = limparDesvantagens;
window.adicionarPeculiaridade = adicionarPeculiaridade;
window.removerPeculiaridade = removerPeculiaridade;
window.fecharModal = fecharModal;
window.confirmarAdquirir = confirmarAdquirir;
window.selecionarVariacao = selecionarVariacao;
window.atualizarCustoNivel = atualizarCustoNivel;
window.resetarTudo = resetarTudo;
window.salvarDados = salvarDados;
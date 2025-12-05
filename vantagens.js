// ============================================
// SISTEMA DE VANTAGENS E DESVANTAGENS - COMPLETO
// ============================================

// Estado global do sistema
const estadoVantagens = {
    pontosTotais: 100,
    vantagensAdquiridas: [],
    desvantagensAdquiridas: [],
    peculiaridades: [],
    vantagensCompradas: 0,
    desvantagensCompradas: 0
};

// Catálogo de Vantagens
const vantagensCatalogo = [
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
        nome: "Reflexos de Combate",
        categoria: "fisica",
        tipo: "simples",
        custo: 15,
        descricao: "+1 em todos os testes de iniciativa e esquiva."
    },
    {
        id: "agilidade",
        nome: "Agilidade",
        categoria: "fisica",
        tipo: "variavel",
        descricao: "Movimentos rápidos e precisos.",
        niveis: 3,
        custoPorNivel: 10,
        nivelBase: 1
    },
    {
        id: "intuicao",
        nome: "Intuição",
        categoria: "mental",
        tipo: "simples",
        custo: 12,
        descricao: "+2 em testes de percepção e detecção de perigo."
    }
];

// Catálogo de Desvantagens
const desvantagensCatalogo = [
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
        id: "teimosia",
        nome: "Teimosia",
        categoria: "mental",
        tipo: "simples",
        custo: -8,
        descricao: "Relutância em mudar de opinião."
    },
    {
        id: "vicio-fumar",
        nome: "Vício em Fumar",
        categoria: "fisica",
        tipo: "simples",
        custo: -12,
        descricao: "Dependência de tabaco."
    }
];

// ========== INICIALIZAÇÃO ==========
function inicializarSistemaVantagens() {
    console.log("🔄 Inicializando sistema de Vantagens/Desvantagens...");
    
    // Carregar dados salvos
    carregarDadosSalvos();
    
    // Configurar eventos
    configurarEventosVantagens();
    
    // Carregar listas
    carregarListaVantagens();
    carregarListaDesvantagens();
    carregarPeculiaridades();
    
    // Atualizar interface
    atualizarInterfaceVantagens();
    
    console.log("✅ Sistema de Vantagens/Desvantagens pronto!");
}

// ========== CARREGAR DADOS SALVOS ==========
function carregarDadosSalvos() {
    try {
        const dados = localStorage.getItem('sistemaVantagensDados');
        if (dados) {
            const parsed = JSON.parse(dados);
            estadoVantagens.vantagensAdquiridas = parsed.vantagensAdquiridas || [];
            estadoVantagens.desvantagensAdquiridas = parsed.desvantagensAdquiridas || [];
            estadoVantagens.peculiaridades = parsed.peculiaridades || [];
            estadoVantagens.pontosTotais = parsed.pontosTotais || 100;
            console.log("📁 Dados carregados do localStorage");
        }
    } catch (e) {
        console.error("❌ Erro ao carregar dados:", e);
        // Resetar se houver erro
        resetarDadosVantagens();
    }
}

// ========== SALVAR DADOS ==========
function salvarDadosVantagens() {
    try {
        const dados = {
            vantagensAdquiridas: estadoVantagens.vantagensAdquiridas,
            desvantagensAdquiridas: estadoVantagens.desvantagensAdquiridas,
            peculiaridades: estadoVantagens.peculiaridades,
            pontosTotais: estadoVantagens.pontosTotais,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('sistemaVantagensDados', JSON.stringify(dados));
        mostrarNotificacaoVantagens("💾 Dados salvos com sucesso!", "success");
        console.log("💾 Dados salvos");
    } catch (e) {
        console.error("❌ Erro ao salvar:", e);
        mostrarNotificacaoVantagens("❌ Erro ao salvar dados!", "error");
    }
}

// ========== CARREGAR LISTA DE VANTAGENS ==========
function carregarListaVantagens() {
    const container = document.getElementById('lista-vantagens');
    if (!container) return;
    
    container.innerHTML = '';
    
    vantagensCatalogo.forEach(vantagem => {
        // Verificar se já foi adquirida
        const jaAdquirida = estadoVantagens.vantagensAdquiridas.some(v => v.baseId === vantagem.id);
        if (jaAdquirida) return;
        
        const item = criarElementoItem(vantagem, 'vantagem');
        container.appendChild(item);
    });
    
    // Atualizar lista adquirida
    atualizarVantagensAdquiridas();
}

// ========== CARREGAR LISTA DE DESVANTAGENS ==========
function carregarListaDesvantagens() {
    const container = document.getElementById('lista-desvantagens');
    if (!container) return;
    
    container.innerHTML = '';
    
    desvantagensCatalogo.forEach(desvantagem => {
        // Verificar se já foi adquirida
        const jaAdquirida = estadoVantagens.desvantagensAdquiridas.some(d => d.baseId === desvantagem.id);
        if (jaAdquirida) return;
        
        const item = criarElementoItem(desvantagem, 'desvantagem');
        container.appendChild(item);
    });
    
    // Atualizar lista adquirida
    atualizarDesvantagensAdquiridas();
}

// ========== CRIAR ELEMENTO DE ITEM ==========
function criarElementoItem(item, tipo) {
    const div = document.createElement('div');
    div.className = `item ${tipo === 'desvantagem' ? 'item-desvantagem' : ''}`;
    div.dataset.id = item.id;
    div.dataset.tipo = tipo;
    
    // Calcular custo para exibição
    let custoDisplay = '';
    if (item.tipo === 'variavel') {
        const custo = Math.abs(item.custoPorNivel);
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
        <div class="item-info">
            <span class="item-categoria">${item.categoria}</span>
            <span class="item-tipo">${item.tipo}</span>
        </div>
    `;
    
    div.addEventListener('click', () => selecionarItemVantagem(item, tipo));
    
    return div;
}

// ========== SELECIONAR ITEM ==========
function selecionarItemVantagem(item, tipo) {
    console.log("🎯 Selecionado:", item.nome, tipo);
    
    // Configurar modal
    abrirModalVantagem(item, tipo);
}

// ========== MODAL ==========
let itemSelecionadoModal = null;
let tipoSelecionadoModal = null;
let variacaoSelecionadaModal = null;
let nivelSelecionadoModal = 1;

function abrirModalVantagem(item, tipo) {
    itemSelecionadoModal = item;
    tipoSelecionadoModal = tipo;
    variacaoSelecionadaModal = null;
    nivelSelecionadoModal = item.nivelBase || 1;
    
    const modal = document.getElementById('modal');
    const titulo = document.getElementById('modal-titulo');
    const corpo = document.getElementById('modal-corpo');
    
    if (!modal || !titulo || !corpo) return;
    
    // Configurar título
    titulo.textContent = `${tipo === 'vantagem' ? 'Vantagem' : 'Desvantagem'}: ${item.nome}`;
    
    // Gerar conteúdo baseado no tipo
    let conteudo = '';
    
    if (item.tipo === 'multipla') {
        conteudo = gerarConteudoModalMultipla(item, tipo);
    } else if (item.tipo === 'variavel') {
        conteudo = gerarConteudoModalVariavel(item, tipo);
    } else {
        conteudo = gerarConteudoModalSimples(item, tipo);
    }
    
    corpo.innerHTML = conteudo;
    
    // Mostrar modal
    modal.style.display = 'flex';
    
    // Configurar eventos específicos
    setTimeout(() => {
        if (item.tipo === 'multipla') {
            configurarVariacoesModal();
        } else if (item.tipo === 'variavel') {
            configurarNiveisModal();
        }
    }, 10);
}

function gerarConteudoModalSimples(item, tipo) {
    const custo = Math.abs(item.custo);
    const sinal = tipo === 'vantagem' ? '+' : '-';
    
    return `
        <div style="margin-bottom: 20px; line-height: 1.6;">
            <strong>Descrição:</strong> ${item.descricao}
        </div>
        <div style="margin-bottom: 20px;">
            <strong>Categoria:</strong> ${item.categoria}
        </div>
        <div class="custo-display">
            Custo: ${sinal}${custo} pontos
        </div>
    `;
}

function gerarConteudoModalMultipla(item, tipo) {
    let html = `
        <div style="margin-bottom: 15px; line-height: 1.6;">
            <strong>Descrição:</strong> ${item.descricao}
        </div>
        <div style="margin-bottom: 20px;">
            <strong>Categoria:</strong> ${item.categoria}
        </div>
        <div style="margin-bottom: 20px;">
            <p><strong>Escolha uma variação:</strong></p>
    `;
    
    item.variacoes.forEach((variacao, index) => {
        const sinal = tipo === 'vantagem' ? '+' : '-';
        const custoAbs = Math.abs(variacao.custo);
        const selecionada = index === 0 ? 'selecionada' : '';
        
        html += `
            <div class="opcao-variacao ${selecionada}" 
                 data-id="${variacao.id}" 
                 onclick="selecionarVariacaoModal(this)">
                <div class="variacao-header">
                    <strong>${variacao.nome}</strong>
                    <span class="variacao-custo">${sinal}${custoAbs} pts</span>
                </div>
                <div style="font-size: 0.9em; color: #ccc; margin-top: 5px;">
                    ${variacao.descricao}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    // Selecionar primeira variação por padrão
    if (item.variacoes[0]) {
        variacaoSelecionadaModal = item.variacoes[0];
    }
    
    return html;
}

function gerarConteudoModalVariavel(item, tipo) {
    const sinal = tipo === 'vantagem' ? '+' : '-';
    let html = `
        <div style="margin-bottom: 15px; line-height: 1.6;">
            <strong>Descrição:</strong> ${item.descricao}
        </div>
        <div style="margin-bottom: 20px;">
            <strong>Categoria:</strong> ${item.categoria}
        </div>
        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 10px; font-weight: bold;">
                Selecione o nível (cada nível: ${sinal}${Math.abs(item.custoPorNivel)} pts):
            </label>
            <select class="select-nivel" id="seletor-nivel" onchange="atualizarCustoNivelModal()">
    `;
    
    for (let i = item.nivelBase || 1; i <= item.niveis; i++) {
        const custo = i * item.custoPorNivel;
        html += `<option value="${i}">Nível ${i} (${sinal}${Math.abs(custo)} pts)</option>`;
    }
    
    html += `
            </select>
            <div class="custo-display" id="custo-total-modal">
                Custo total: ${sinal}${Math.abs(item.nivelBase * item.custoPorNivel)} pontos
            </div>
        </div>
    `;
    
    return html;
}

function configurarVariacoesModal() {
    const opcoes = document.querySelectorAll('.opcao-variacao');
    opcoes.forEach(opcao => {
        opcao.addEventListener('click', function() {
            selecionarVariacaoModal(this);
        });
    });
}

function selecionarVariacaoModal(elemento) {
    // Remover seleção de todas
    document.querySelectorAll('.opcao-variacao').forEach(o => {
        o.classList.remove('selecionada');
    });
    
    // Adicionar seleção
    elemento.classList.add('selecionada');
    
    // Encontrar variação
    const variacaoId = elemento.dataset.id;
    const item = itemSelecionadoModal;
    variacaoSelecionadaModal = item.variacoes.find(v => v.id === variacaoId);
}

function configurarNiveisModal() {
    const seletor = document.getElementById('seletor-nivel');
    if (seletor) {
        seletor.addEventListener('change', atualizarCustoNivelModal);
    }
}

function atualizarCustoNivelModal() {
    const seletor = document.getElementById('seletor-nivel');
    if (!seletor || !itemSelecionadoModal) return;
    
    nivelSelecionadoModal = parseInt(seletor.value);
    const custo = nivelSelecionadoModal * itemSelecionadoModal.custoPorNivel;
    const sinal = tipoSelecionadoModal === 'vantagem' ? '+' : '-';
    
    const display = document.getElementById('custo-total-modal');
    if (display) {
        display.textContent = `Custo total: ${sinal}${Math.abs(custo)} pontos`;
    }
}

function fecharModalVantagem() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.style.display = 'none';
    }
    itemSelecionadoModal = null;
    tipoSelecionadoModal = null;
    variacaoSelecionadaModal = null;
    nivelSelecionadoModal = 1;
}

function adquirirItemModal() {
    if (!itemSelecionadoModal || !tipoSelecionadoModal) {
        mostrarNotificacaoVantagens("⚠️ Nenhum item selecionado!", "error");
        return;
    }
    
    // Criar item adquirido
    let itemAdquirido = {
        id: `${itemSelecionadoModal.id}-${Date.now()}`,
        baseId: itemSelecionadoModal.id,
        nome: itemSelecionadoModal.nome,
        descricao: itemSelecionadoModal.descricao,
        tipo: itemSelecionadoModal.tipo,
        categoria: itemSelecionadoModal.categoria
    };
    
    // Calcular custo
    let custo = 0;
    
    if (itemSelecionadoModal.tipo === 'multipla') {
        if (variacaoSelecionadaModal) {
            itemAdquirido.nome = variacaoSelecionadaModal.nome;
            itemAdquirido.descricao = variacaoSelecionadaModal.descricao;
            custo = variacaoSelecionadaModal.custo;
        } else if (itemSelecionadoModal.variacoes[0]) {
            const primeira = itemSelecionadoModal.variacoes[0];
            itemAdquirido.nome = primeira.nome;
            itemAdquirido.descricao = primeira.descricao;
            custo = primeira.custo;
        }
    } else if (itemSelecionadoModal.tipo === 'variavel') {
        custo = nivelSelecionadoModal * itemSelecionadoModal.custoPorNivel;
        itemAdquirido.nivel = nivelSelecionadoModal;
        itemAdquirido.nivelMax = itemSelecionadoModal.niveis;
    } else {
        custo = itemSelecionadoModal.custo;
    }
    
    // Para desvantagens, custo é negativo
    if (tipoSelecionadoModal === 'desvantagem') {
        custo = -Math.abs(custo);
    }
    
    itemAdquirido.custo = custo;
    itemAdquirido.dataAquisição = new Date().toISOString();
    
    // Verificar pontos
    if (tipoSelecionadoModal === 'vantagem') {
        const custoAbs = Math.abs(custo);
        if (custoAbs > estadoVantagens.pontosTotais) {
            mostrarNotificacaoVantagens("❌ Pontos insuficientes!", "error");
            return;
        }
        estadoVantagens.pontosTotais -= custoAbs;
        estadoVantagens.vantagensAdquiridas.push(itemAdquirido);
        estadoVantagens.vantagensCompradas++;
    } else {
        const pontosGanhos = Math.abs(custo);
        estadoVantagens.pontosTotais += pontosGanhos;
        estadoVantagens.desvantagensAdquiridas.push(itemAdquirido);
        estadoVantagens.desvantagensCompradas++;
    }
    
    // Atualizar interface
    carregarListaVantagens();
    carregarListaDesvantagens();
    atualizarInterfaceVantagens();
    fecharModalVantagem();
    
    mostrarNotificacaoVantagens("✅ Item adquirido com sucesso!", "success");
    salvarDadosVantagens();
}

// ========== ATUALIZAR VANTAGENS ADQUIRIDAS ==========
function atualizarVantagensAdquiridas() {
    const container = document.getElementById('vantagens-adquiridas');
    const contador = document.getElementById('num-vantagens');
    
    if (!container) return;
    
    if (estadoVantagens.vantagensAdquiridas.length === 0) {
        container.innerHTML = `
            <div class="mensagem-vazia">
                <i class="fas fa-inbox"></i>
                <p>Nenhuma vantagem adquirida</p>
            </div>
        `;
    } else {
        let html = '';
        estadoVantagens.vantagensAdquiridas.forEach((item, index) => {
            html += criarItemAdquiridoElemento(item, 'vantagem', index);
        });
        container.innerHTML = html;
        
        // Adicionar eventos de remoção
        setTimeout(() => {
            document.querySelectorAll('#vantagens-adquiridas .btn-remover').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const index = parseInt(this.dataset.index);
                    removerVantagemAdquirida(index);
                });
            });
        }, 10);
    }
    
    if (contador) {
        contador.textContent = estadoVantagens.vantagensAdquiridas.length;
    }
}

// ========== ATUALIZAR DESVANTAGENS ADQUIRIDAS ==========
function atualizarDesvantagensAdquiridas() {
    const container = document.getElementById('desvantagens-adquiridas');
    const contador = document.getElementById('num-desvantagens');
    
    if (!container) return;
    
    if (estadoVantagens.desvantagensAdquiridas.length === 0) {
        container.innerHTML = `
            <div class="mensagem-vazia">
                <i class="fas fa-inbox"></i>
                <p>Nenhuma desvantagem adquirida</p>
            </div>
        `;
    } else {
        let html = '';
        estadoVantagens.desvantagensAdquiridas.forEach((item, index) => {
            html += criarItemAdquiridoElemento(item, 'desvantagem', index);
        });
        container.innerHTML = html;
        
        // Adicionar eventos de remoção
        setTimeout(() => {
            document.querySelectorAll('#desvantagens-adquiridas .btn-remover').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const index = parseInt(this.dataset.index);
                    removerDesvantagemAdquirida(index);
                });
            });
        }, 10);
    }
    
    if (contador) {
        contador.textContent = estadoVantagens.desvantagensAdquiridas.length;
    }
}

function criarItemAdquiridoElemento(item, tipo, index) {
    const cor = tipo === 'vantagem' ? '#27ae60' : '#e74c3c';
    const sinal = item.custo >= 0 ? '+' : '-';
    
    let nivelInfo = '';
    if (item.nivel) {
        nivelInfo = `<div class="item-nivel">Nível ${item.nivel}/${item.nivelMax}</div>`;
    }
    
    return `
        <div class="item item-adquirido ${tipo === 'desvantagem' ? 'item-desvantagem' : ''}" 
             style="border-left-color: ${cor};">
            <div class="item-header">
                <h4 class="item-nome">${item.nome}</h4>
                <div class="item-custo" style="background: ${cor}">${sinal}${Math.abs(item.custo)} pts</div>
            </div>
            <div class="item-descricao">${item.descricao}</div>
            ${nivelInfo}
            <div class="item-info">
                <span class="item-categoria">${item.categoria}</span>
                <span class="item-tipo">${item.tipo}</span>
            </div>
            <button class="btn-remover" data-index="${index}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
}

// ========== REMOVER ITENS ADQUIRIDOS ==========
function removerVantagemAdquirida(index) {
    if (index < 0 || index >= estadoVantagens.vantagensAdquiridas.length) return;
    
    if (!confirm("Remover esta vantagem?\nOs pontos gastos serão devolvidos.")) return;
    
    const item = estadoVantagens.vantagensAdquiridas[index];
    estadoVantagens.pontosTotais += Math.abs(item.custo);
    estadoVantagens.vantagensAdquiridas.splice(index, 1);
    
    carregarListaVantagens();
    atualizarInterfaceVantagens();
    salvarDadosVantagens();
    
    mostrarNotificacaoVantagens("🗑️ Vantagem removida!", "info");
}

function removerDesvantagemAdquirida(index) {
    if (index < 0 || index >= estadoVantagens.desvantagensAdquiridas.length) return;
    
    if (!confirm("Remover esta desvantagem?\nVocê perderá os pontos ganhos.")) return;
    
    const item = estadoVantagens.desvantagensAdquiridas[index];
    estadoVantagens.pontosTotais -= Math.abs(item.custo);
    estadoVantagens.desvantagensAdquiridas.splice(index, 1);
    
    carregarListaDesvantagens();
    atualizarInterfaceVantagens();
    salvarDadosVantagens();
    
    mostrarNotificacaoVantagens("🗑️ Desvantagem removida!", "info");
}

function limparVantagens() {
    if (estadoVantagens.vantagensAdquiridas.length === 0) {
        mostrarNotificacaoVantagens("ℹ️ Não há vantagens para limpar!", "info");
        return;
    }
    
    if (!confirm(`Limpar TODAS as ${estadoVantagens.vantagensAdquiridas.length} vantagens?\nTodos os pontos serão devolvidos.`)) return;
    
    // Recuperar pontos
    const totalPontos = estadoVantagens.vantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0);
    estadoVantagens.pontosTotais += totalPontos;
    estadoVantagens.vantagensAdquiridas = [];
    
    carregarListaVantagens();
    atualizarInterfaceVantagens();
    salvarDadosVantagens();
    
    mostrarNotificacaoVantagens("✅ Todas as vantagens removidas!", "success");
}

function limparDesvantagens() {
    if (estadoVantagens.desvantagensAdquiridas.length === 0) {
        mostrarNotificacaoVantagens("ℹ️ Não há desvantagens para limpar!", "info");
        return;
    }
    
    if (!confirm(`Limpar TODAS as ${estadoVantagens.desvantagensAdquiridas.length} desvantagens?\nVocê perderá os pontos ganhos.`)) return;
    
    // Perder pontos ganhos
    const totalPontos = estadoVantagens.desvantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0);
    estadoVantagens.pontosTotais -= totalPontos;
    estadoVantagens.desvantagensAdquiridas = [];
    
    carregarListaDesvantagens();
    atualizarInterfaceVantagens();
    salvarDadosVantagens();
    
    mostrarNotificacaoVantagens("✅ Todas as desvantagens removidas!", "success");
}

// ========== PECULIARIDADES ==========
function carregarPeculiaridades() {
    const container = document.getElementById('lista-peculiaridades');
    const contador = document.getElementById('total-peculiaridades');
    
    if (!container) return;
    
    if (estadoVantagens.peculiaridades.length === 0) {
        container.innerHTML = `
            <div class="mensagem-vazia">
                <i class="fas fa-sticky-note"></i>
                <p>Nenhuma peculiaridade adicionada</p>
            </div>
        `;
    } else {
        let html = '';
        estadoVantagens.peculiaridades.forEach((pec, index) => {
            html += `
                <div class="pec-item">
                    <div class="peculiaridade-texto">${pec.texto}</div>
                    <button class="btn-remover" onclick="removerPeculiaridadeVantagens(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });
        container.innerHTML = html;
    }
    
    if (contador) {
        contador.textContent = `${estadoVantagens.peculiaridades.length}/5`;
    }
}

function adicionarPeculiaridadeVantagens() {
    const textarea = document.getElementById('nova-pec');
    const texto = textarea.value.trim();
    const contador = document.getElementById('contador-pec');
    
    if (!texto) {
        mostrarNotificacaoVantagens("⚠️ Digite uma peculiaridade!", "error");
        return;
    }
    
    if (texto.length > 50) {
        mostrarNotificacaoVantagens("⚠️ Máximo 50 caracteres!", "error");
        return;
    }
    
    if (estadoVantagens.peculiaridades.length >= 5) {
        mostrarNotificacaoVantagens("⚠️ Limite de 5 peculiaridades!", "error");
        return;
    }
    
    if (estadoVantagens.pontosTotais < 1) {
        mostrarNotificacaoVantagens("❌ Pontos insuficientes!", "error");
        return;
    }
    
    // Adicionar peculiaridade
    estadoVantagens.peculiaridades.push({
        id: `pec-${Date.now()}`,
        texto: texto,
        custo: -1
    });
    
    // Gastar ponto
    estadoVantagens.pontosTotais -= 1;
    
    // Limpar campo
    textarea.value = '';
    if (contador) contador.textContent = '0/50';
    
    carregarPeculiaridades();
    atualizarInterfaceVantagens();
    salvarDadosVantagens();
    
    mostrarNotificacaoVantagens("✅ Peculiaridade adicionada! (-1 ponto)", "success");
}

function removerPeculiaridadeVantagens(index) {
    if (index < 0 || index >= estadoVantagens.peculiaridades.length) return;
    
    if (!confirm("Remover esta peculiaridade?\nVocê recuperará 1 ponto.")) return;
    
    estadoVantagens.peculiaridades.splice(index, 1);
    estadoVantagens.pontosTotais += 1; // Recupera ponto
    
    carregarPeculiaridades();
    atualizarInterfaceVantagens();
    salvarDadosVantagens();
    
    mostrarNotificacaoVantagens("🗑️ Peculiaridade removida! (+1 ponto)", "info");
}

// ========== ATUALIZAR INTERFACE COMPLETA ==========
function atualizarInterfaceVantagens() {
    // Calcular totais
    const totalVantagens = estadoVantagens.vantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0);
    const totalDesvantagens = estadoVantagens.desvantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0);
    const saldoTotal = estadoVantagens.pontosTotais;
    
    // Atualizar elementos
    const totalVantagensEl = document.getElementById('total-vantagens');
    const totalDesvantagensEl = document.getElementById('total-desvantagens');
    const totalPeculiaridadesEl = document.getElementById('total-peculiaridades');
    const saldoTotalEl = document.getElementById('saldo-total');
    
    if (totalVantagensEl) totalVantagensEl.textContent = `+${totalVantagens}`;
    if (totalDesvantagensEl) totalDesvantagensEl.textContent = `-${totalDesvantagens}`;
    if (totalPeculiaridadesEl) totalPeculiaridadesEl.textContent = `${estadoVantagens.peculiaridades.length}/5`;
    if (saldoTotalEl) saldoTotalEl.textContent = saldoTotal;
    
    // Atualizar contadores de peculiaridades
    const contadorPec = document.getElementById('contador-pec');
    if (contadorPec) {
        const textarea = document.getElementById('nova-pec');
        const comprimento = textarea ? textarea.value.length : 0;
        contadorPec.textContent = `${comprimento}/50`;
        
        if (comprimento > 50) {
            contadorPec.style.color = '#e74c3c';
        } else if (comprimento > 40) {
            contadorPec.style.color = '#f39c12';
        } else {
            contadorPec.style.color = '#ffd700';
        }
    }
}

// ========== RESETAR TUDO ==========
function resetarDadosVantagens() {
    const totalItens = estadoVantagens.vantagensAdquiridas.length + 
                      estadoVantagens.desvantagensAdquiridas.length + 
                      estadoVantagens.peculiaridades.length;
    
    if (totalItens === 0) {
        mostrarNotificacaoVantagens("ℹ️ Não há nada para resetar!", "info");
        return;
    }
    
    if (!confirm(`Resetar TODOS os dados (${totalItens} itens)?\nTodos os dados serão perdidos.`)) return;
    
    estadoVantagens.vantagensAdquiridas = [];
    estadoVantagens.desvantagensAdquiridas = [];
    estadoVantagens.peculiaridades = [];
    estadoVantagens.pontosTotais = 100;
    estadoVantagens.vantagensCompradas = 0;
    estadoVantagens.desvantagensCompradas = 0;
    
    carregarListaVantagens();
    carregarListaDesvantagens();
    carregarPeculiaridades();
    atualizarInterfaceVantagens();
    localStorage.removeItem('sistemaVantagensDados');
    
    mostrarNotificacaoVantagens("🔄 Sistema resetado com sucesso!", "success");
}

// ========== CONFIGURAR EVENTOS ==========
function configurarEventosVantagens() {
    // Filtros
    const filtroVant = document.getElementById('filtro-vant');
    const filtroDesv = document.getElementById('filtro-desv');
    
    if (filtroVant) {
        filtroVant.addEventListener('input', function() {
            filtrarListaVantagens(this.value);
        });
    }
    
    if (filtroDesv) {
        filtroDesv.addEventListener('input', function() {
            filtrarListaDesvantagens(this.value);
        });
    }
    
    // Contador de peculiaridades
    const textareaPec = document.getElementById('nova-pec');
    if (textareaPec) {
        textareaPec.addEventListener('input', function() {
            const contador = document.getElementById('contador-pec');
            if (contador) {
                const comprimento = this.value.length;
                contador.textContent = `${comprimento}/50`;
                
                if (comprimento > 50) {
                    contador.style.color = '#e74c3c';
                } else if (comprimento > 40) {
                    contador.style.color = '#f39c12';
                } else {
                    contador.style.color = '#ffd700';
                }
            }
        });
    }
    
    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fecharModalVantagem();
        }
    });
    
    // Click fora do modal para fechar
    document.addEventListener('click', function(e) {
        const modal = document.getElementById('modal');
        if (modal && e.target === modal) {
            fecharModalVantagem();
        }
    });
}

function filtrarListaVantagens(termo) {
    const container = document.getElementById('lista-vantagens');
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

function filtrarListaDesvantagens(termo) {
    const container = document.getElementById('lista-desvantagens');
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

// ========== NOTIFICAÇÕES ==========
function mostrarNotificacaoVantagens(mensagem, tipo = 'info') {
    // Remover notificações anteriores
    const notificacoesAntigas = document.querySelectorAll('.notificacao-vantagens');
    notificacoesAntigas.forEach(n => n.remove());
    
    // Criar notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao-vantagens`;
    notificacao.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${mensagem}</span>
    `;
    
    // Estilizar baseado no tipo
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        background: ${tipo === 'success' ? 'rgba(39, 174, 96, 0.95)' : 
                     tipo === 'error' ? 'rgba(231, 76, 60, 0.95)' : 
                     'rgba(52, 152, 219, 0.95)'};
        color: white;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 99999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRightVantagens 0.3s ease, fadeOutVantagens 0.3s ease 2.7s forwards;
        max-width: 400px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
    `;
    
    document.body.appendChild(notificacao);
    
    // Adicionar animação
    if (!document.querySelector('#animacao-notificacoes-vantagens')) {
        const style = document.createElement('style');
        style.id = 'animacao-notificacoes-vantagens';
        style.textContent = `
            @keyframes slideInRightVantagens {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOutVantagens {
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

// ========== INICIALIZAÇÃO AUTOMÁTICA ==========
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na aba de vantagens
    const vantagensTab = document.getElementById('vantagens');
    if (vantagensTab && vantagensTab.classList.contains('active')) {
        setTimeout(inicializarSistemaVantagens, 100);
    }
    
    // Adicionar listener para quando a aba for ativada
    document.addEventListener('click', function(e) {
        if (e.target.closest('.tab-btn') && e.target.closest('.tab-btn').dataset.tab === 'vantagens') {
            setTimeout(inicializarSistemaVantagens, 100);
        }
    });
});

// ========== EXPOR FUNÇÕES GLOBAIS ==========
// Para botões HTML
window.limparVantagens = limparVantagens;
window.limparDesvantagens = limparDesvantagens;
window.adicionarPeculiaridade = adicionarPeculiaridadeVantagens;
window.removerPeculiaridade = removerPeculiaridadeVantagens;
window.fecharModal = fecharModalVantagem;
window.adquirirItem = adquirirItemModal;
window.selecionarVariacaoModal = selecionarVariacaoModal;
window.atualizarCustoNivelModal = atualizarCustoNivelModal;
window.resetarTudo = resetarDadosVantagens;
window.salvarDados = salvarDadosVantagens;

// Inicialização global
window.inicializarSistemaVantagens = inicializarSistemaVantagens;
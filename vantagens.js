// vantagens.js - SISTEMA COMPLETO DE VANTAGENS E DESVANTAGENS

// DADOS DAS VANTAGENS
const vantagensData = [
    {
        id: "abençoado",
        nome: "Abençoado",
        custo: 10,
        categoria: "mental",
        descricao: "O personagem está sintonizado com um deus, senhor demoníaco, grande espírito, poder cósmico, etc. Recebe visões ou presságios sobre eventos futuros após comungar por uma hora.",
        tipo: "vantagem"
    },
    {
        id: "muito_abençoado",
        nome: "Muito Abençoado", 
        custo: 20,
        categoria: "mental",
        descricao: "Funciona como Abençoado, mas com bônus de +5 no teste de IQ e bônus de reação de +2 dos seguidores.",
        tipo: "vantagem"
    },
    {
        id: "feitos_heroicos",
        nome: "Feitos Heroicos",
        custo: 10,
        categoria: "mental", 
        descricao: "Uma vez por sessão, pode adicionar 1 dado à ST, DX ou HT por 3d segundos.",
        tipo: "vantagem"
    },
    {
        id: "ambidestria",
        nome: "Ambidestria",
        custo: 5,
        categoria: "fisica",
        descricao: "Capaz de lutar e manusear igualmente bem com qualquer uma das mãos. Não sofre penalidade de -4 por usar a mão inábil.",
        tipo: "vantagem"
    },
    {
        id: "aptidão_mágica",
        nome: "Aptidão Mágica",
        custo: "5+10/nível",
        categoria: "mental",
        descricao: "Nível 0: Detecta magia (5 pts). Níveis 1+: +1 em IQ para aprender magias, reduz tempo de aprendizado (10 pts/nível).",
        tipo: "vantagem"
    }
];

// DADOS DAS DESVANTAGENS  
const desvantagensData = [
    {
        id: "alcoolismo",
        nome: "Alcoolismo",
        custo: -15,
        categoria: "mental",
        descricao: "Vício em álcool. Teste de Vontade para resistir quando vê álcool. Se falhar: bebedeira de 2d horas + ressaca.",
        tipo: "desvantagem",
        variante: {
            ilegal: -20
        }
    },
    {
        id: "altruísmo",
        nome: "Altruísmo", 
        custo: -5,
        categoria: "mental",
        descricao: "Coloca outros na frente de si mesmo. Teste de Autocontrole para priorizar próprias necessidades.",
        tipo: "desvantagem"
    },
    {
        id: "barulhento",
        nome: "Barulhento",
        custo: -2,
        categoria: "fisica",
        descricao: "Faz barulho constante. Cada nível: +2 para outros ouvirem, -2 em Furtividade. Máximo 5 níveis.",
        tipo: "desvantagem",
        porNivel: true
    }
];

// VARIÁVEIS GLOBAIS
let vantagensAdquiridas = [];
let desvantagensAdquiridas = [];
let peculiaridades = [];

// FUNÇÃO PRINCIPAL - INICIALIZAÇÃO
function inicializarVantagens() {
    carregarVantagens();
    carregarDesvantagens();
    configurarEventListeners();
    atualizarResumoPontos();
}

// CARREGAR LISTA DE VANTAGENS
function carregarVantagens() {
    const lista = document.getElementById('lista-vantagens');
    
    if (vantagensData.length === 0) {
        lista.innerHTML = '<div class="lista-vazia">Nenhuma vantagem disponível</div>';
        return;
    }
    
    lista.innerHTML = '';
    
    vantagensData.forEach(vantagem => {
        const item = criarItemLista(vantagem, 'vantagem');
        lista.appendChild(item);
    });
}

// CARREGAR LISTA DE DESVANTAGENS
function carregarDesvantagens() {
    const lista = document.getElementById('lista-desvantagens');
    
    if (desvantagensData.length === 0) {
        lista.innerHTML = '<div class="lista-vazia">Nenhuma desvantagem disponível</div>';
        return;
    }
    
    lista.innerHTML = '';
    
    desvantagensData.forEach(desvantagem => {
        const item = criarItemLista(desvantagem, 'desvantagem');
        lista.appendChild(item);
    });
}

// CRIAR ITEM DA LISTA (DISponíveis)
function criarItemLista(item, tipo) {
    const div = document.createElement('div');
    div.className = 'lista-item';
    
    const custoTexto = typeof item.custo === 'string' ? item.custo : 
                      item.custo > 0 ? `+${item.custo}` : item.custo;
    
    div.innerHTML = `
        <div class="item-info">
            <strong>${item.nome}</strong>
            <div class="item-custo">${custoTexto} pts</div>
            <div class="item-descricao">${item.descricao}</div>
        </div>
        <button class="btn-adicionar" data-id="${item.id}" data-tipo="${tipo}">
            ${tipo === 'vantagem' ? '+' : '-'}
        </button>
    `;
    
    return div;
}

// CONFIGURAR EVENT LISTENERS
function configurarEventListeners() {
    // Busca de vantagens
    document.getElementById('busca-vantagens').addEventListener('input', filtrarVantagens);
    document.getElementById('categoria-vantagens').addEventListener('change', filtrarVantagens);
    
    // Busca de desvantagens
    document.getElementById('busca-desvantagens').addEventListener('input', filtrarDesvantagens);
    document.getElementById('categoria-desvantagens').addEventListener('change', filtrarDesvantagens);
    
    // Peculiaridades
    document.getElementById('nova-peculiaridade').addEventListener('input', atualizarContadorPeculiaridade);
    document.getElementById('btn-adicionar-peculiaridade').addEventListener('click', adicionarPeculiaridade);
    
    // Delegation para botões de adicionar/remover
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-adicionar')) {
            const id = e.target.dataset.id;
            const tipo = e.target.dataset.tipo;
            
            if (tipo === 'vantagem') {
                adicionarVantagem(id);
            } else {
                adicionarDesvantagem(id);
            }
        }
        
        if (e.target.classList.contains('btn-remover')) {
            const id = e.target.dataset.id;
            const tipo = e.target.dataset.tipo;
            
            if (tipo === 'vantagem') {
                removerVantagem(id);
            } else if (tipo === 'desvantagem') {
                removerDesvantagem(id);
            } else if (tipo === 'peculiaridade') {
                removerPeculiaridade(id);
            }
        }
    });
}

// FUNÇÕES DE FILTRO
function filtrarVantagens() {
    const termo = document.getElementById('busca-vantagens').value.toLowerCase();
    const categoria = document.getElementById('categoria-vantagens').value;
    
    const vantagensFiltradas = vantagensData.filter(v => {
        const matchTermo = v.nome.toLowerCase().includes(termo) || 
                          v.descricao.toLowerCase().includes(termo);
        const matchCategoria = !categoria || v.categoria === categoria;
        
        return matchTermo && matchCategoria;
    });
    
    const lista = document.getElementById('lista-vantagens');
    lista.innerHTML = '';
    
    if (vantagensFiltradas.length === 0) {
        lista.innerHTML = '<div class="lista-vazia">Nenhuma vantagem encontrada</div>';
        return;
    }
    
    vantagensFiltradas.forEach(vantagem => {
        const item = criarItemLista(vantagem, 'vantagem');
        lista.appendChild(item);
    });
}

function filtrarDesvantagens() {
    const termo = document.getElementById('busca-desvantagens').value.toLowerCase();
    const categoria = document.getElementById('categoria-desvantagens').value;
    
    const desvantagensFiltradas = desvantagensData.filter(d => {
        const matchTermo = d.nome.toLowerCase().includes(termo) || 
                          d.descricao.toLowerCase().includes(termo);
        const matchCategoria = !categoria || d.categoria === categoria;
        
        return matchTermo && matchCategoria;
    });
    
    const lista = document.getElementById('lista-desvantagens');
    lista.innerHTML = '';
    
    if (desvantagensFiltradas.length === 0) {
        lista.innerHTML = '<div class="lista-vazia">Nenhuma desvantagem encontrada</div>';
        return;
    }
    
    desvantagensFiltradas.forEach(desvantagem => {
        const item = criarItemLista(desvantagem, 'desvantagem');
        lista.appendChild(item);
    });
}

// FUNÇÕES PARA ADICIONAR VANTAGENS/DESVANTAGENS
function adicionarVantagem(id) {
    const vantagem = vantagensData.find(v => v.id === id);
    if (!vantagem || vantagensAdquiridas.find(v => v.id === id)) return;
    
    vantagensAdquiridas.push({...vantagem});
    atualizarListaVantagensAdquiridas();
    atualizarResumoPontos();
}

function adicionarDesvantagem(id) {
    const desvantagem = desvantagensData.find(d => d.id === id);
    if (!desvantagem || desvantagensAdquiridas.find(d => d.id === id)) return;
    
    // Para desvantagens por nível, criar com nível 1
    const desvantagemAdicionar = {...desvantagem};
    if (desvantagemAdicionar.porNivel) {
        desvantagemAdicionar.nivel = 1;
        desvantagemAdicionar.custoAtual = desvantagemAdicionar.custo;
    }
    
    desvantagensAdquiridas.push(desvantagemAdicionar);
    atualizarListaDesvantagensAdquiridas();
    atualizarResumoPontos();
}

function removerVantagem(id) {
    vantagensAdquiridas = vantagensAdquiridas.filter(v => v.id !== id);
    atualizarListaVantagensAdquiridas();
    atualizarResumoPontos();
}

function removerDesvantagem(id) {
    desvantagensAdquiridas = desvantagensAdquiridas.filter(d => d.id !== id);
    atualizarListaDesvantagensAdquiridas();
    atualizarResumoPontos();
}

// ATUALIZAR LISTAS ADQUIRIDAS
function atualizarListaVantagensAdquiridas() {
    const lista = document.getElementById('vantagens-adquiridas');
    const totalElement = document.getElementById('total-vantagens-adquiridas');
    
    if (vantagensAdquiridas.length === 0) {
        lista.innerHTML = '<div class="lista-vazia">Nenhuma vantagem adquirida</div>';
        totalElement.textContent = '0 pts';
        return;
    }
    
    lista.innerHTML = '';
    let totalPontos = 0;
    
    vantagensAdquiridas.forEach(vantagem => {
        const custo = typeof vantagem.custo === 'string' ? 0 : vantagem.custo;
        totalPontos += custo;
        
        const item = document.createElement('div');
        item.className = 'item-adquirido';
        item.innerHTML = `
            <div class="item-info">
                <strong>${vantagem.nome}</strong>
                <div class="item-custo">+${custo} pts</div>
            </div>
            <button class="btn-remover" data-id="${vantagem.id}" data-tipo="vantagem">×</button>
        `;
        lista.appendChild(item);
    });
    
    totalElement.textContent = `${totalPontos} pts`;
}

function atualizarListaDesvantagensAdquiridas() {
    const lista = document.getElementById('desvantagens-adquiridas');
    const totalElement = document.getElementById('total-desvantagens-adquiridas');
    
    if (desvantagensAdquiridas.length === 0) {
        lista.innerHTML = '<div class="lista-vazia">Nenhuma desvantagem adquirida</div>';
        totalElement.textContent = '0 pts';
        return;
    }
    
    lista.innerHTML = '';
    let totalPontos = 0;
    
    desvantagensAdquiridas.forEach(desvantagem => {
        const custo = desvantagem.porNivel ? 
                     (desvantagem.custoAtual || desvantagem.custo) : 
                     desvantagem.custo;
        totalPontos += custo;
        
        const nivelTexto = desvantagem.porNivel ? ` (Nível ${desvantagem.nivel || 1})` : '';
        
        const item = document.createElement('div');
        item.className = 'item-adquirido';
        item.innerHTML = `
            <div class="item-info">
                <strong>${desvantagem.nome}${nivelTexto}</strong>
                <div class="item-custo">${custo} pts</div>
            </div>
            <button class="btn-remover" data-id="${desvantagem.id}" data-tipo="desvantagem">×</button>
        `;
        lista.appendChild(item);
    });
    
    totalElement.textContent = `${totalPontos} pts`;
}

// SISTEMA DE PECULIARIDADES
function atualizarContadorPeculiaridade() {
    const input = document.getElementById('nova-peculiaridade');
    const contador = document.getElementById('contador-chars');
    const botao = document.getElementById('btn-adicionar-peculiaridade');
    
    const texto = input.value;
    const count = texto.length;
    
    contador.textContent = count;
    
    // Habilitar/desabilitar botão
    const podeAdicionar = count > 0 && count <= 30 && peculiaridades.length < 5;
    botao.disabled = !podeAdicionar;
    
    // Atualizar cor do contador
    if (count > 30) {
        contador.style.color = '#e74c3c';
    } else if (count > 25) {
        contador.style.color = '#f39c12';
    } else {
        contador.style.color = '#ffd700';
    }
}

function adicionarPeculiaridade() {
    const input = document.getElementById('nova-peculiaridade');
    const texto = input.value.trim();
    
    if (texto.length === 0 || texto.length > 30) {
        return;
    }
    
    if (peculiaridades.length >= 5) {
        alert('Máximo de 5 peculiaridades atingido!');
        return;
    }
    
    // Verificar se já existe
    if (peculiaridades.includes(texto)) {
        alert('Esta peculiaridade já foi adicionada!');
        return;
    }
    
    peculiaridades.push(texto);
    input.value = '';
    atualizarContadorPeculiaridade();
    atualizarListaPeculiaridades();
    atualizarResumoPontos();
}

function removerPeculiaridade(index) {
    peculiaridades.splice(index, 1);
    atualizarListaPeculiaridades();
    atualizarResumoPontos();
}

function atualizarListaPeculiaridades() {
    const lista = document.getElementById('lista-peculiaridades');
    const contador = document.getElementById('contador-peculiaridades');
    
    contador.textContent = `${peculiaridades.length}/5`;
    
    if (peculiaridades.length === 0) {
        lista.innerHTML = '<div class="lista-vazia">Nenhuma peculiaridade adicionada</div>';
        return;
    }
    
    lista.innerHTML = '';
    
    peculiaridades.forEach((peculiaridade, index) => {
        const item = document.createElement('div');
        item.className = 'item-adquirido';
        item.innerHTML = `
            <div class="item-info">
                <strong>${peculiaridade}</strong>
                <div class="item-custo">-1 pts</div>
            </div>
            <button class="btn-remover" data-id="${index}" data-tipo="peculiaridade">×</button>
        `;
        lista.appendChild(item);
    });
}

// CÁLCULO DE PONTOS
function calcularPontosVantagens() {
    return vantagensAdquiridas.reduce((total, vantagem) => {
        const custo = typeof vantagem.custo === 'string' ? 0 : vantagem.custo;
        return total + custo;
    }, 0);
}

function calcularPontosDesvantagens() {
    return desvantagensAdquiridas.reduce((total, desvantagem) => {
        const custo = desvantagem.porNivel ? 
                     (desvantagem.custoAtual || desvantagem.custo) : 
                     desvantagem.custo;
        return total + Math.abs(custo); // Usar valor absoluto para display
    }, 0);
}

function calcularPontosPeculiaridades() {
    return peculiaridades.length; // -1 ponto cada
}

function atualizarResumoPontos() {
    const pontosVantagens = calcularPontosVantagens();
    const pontosDesvantagens = calcularPontosDesvantagens();
    const pontosPeculiaridades = calcularPontosPeculiaridades();
    const saldoTotal = pontosVantagens - pontosDesvantagens - pontosPeculiaridades;
    
    // Atualizar displays
    document.getElementById('total-vantagens').textContent = `+${pontosVantagens}`;
    document.getElementById('total-desvantagens').textContent = `-${pontosDesvantagens}`;
    document.getElementById('total-peculiaridades').textContent = `-${pontosPeculiaridades}`;
    document.getElementById('saldo-total').textContent = saldoTotal;
    
    // Atualizar cor do saldo
    const saldoElement = document.getElementById('saldo-total');
    if (saldoTotal > 0) {
        saldoElement.style.color = '#27ae60';
    } else if (saldoTotal < 0) {
        saldoElement.style.color = '#e74c3c';
    } else {
        saldoElement.style.color = '#ffd700';
    }
}

// INICIALIZAÇÃO AVANÇADA PARA VANTAGENS COMPLEXAS
function configurarVantagemEspecial(vantagemId) {
    // Para vantagens como Aliados, Aptidão Mágica, etc.
    // Esta função pode ser expandida para lidar com vantagens complexas
    switch (vantagemId) {
        case 'aptidão_mágica':
            // Poderia abrir um modal para selecionar nível
            console.log('Configurando Aptidão Mágica...');
            break;
        case 'aliados':
            // Configuração complexa de aliados
            console.log('Configurando Aliados...');
            break;
    }
}

// FUNÇÃO PARA SALVAR/CARREGAR DADOS
function salvarVantagens() {
    const dados = {
        vantagens: vantagensAdquiridas,
        desvantagens: desvantagensAdquiridas,
        peculiaridades: peculiaridades,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('gurpsVantagens', JSON.stringify(dados));
    console.log('Vantagens salvas!', dados);
}

function carregarVantagens() {
    const dadosSalvos = localStorage.getItem('gurpsVantagens');
    
    if (dadosSalvos) {
        try {
            const dados = JSON.parse(dadosSalvos);
            vantagensAdquiridas = dados.vantagens || [];
            desvantagensAdquiridas = dados.desvantagens || [];
            peculiaridades = dados.peculiaridades || [];
            
            console.log('Vantagens carregadas!', dados);
        } catch (e) {
            console.error('Erro ao carregar vantagens:', e);
        }
    }
    
    // Atualizar interfaces
    atualizarListaVantagensAdquiridas();
    atualizarListaDesvantagensAdquiridas();
    atualizarListaPeculiaridades();
    atualizarResumoPontos();
}

// INICIALIZAÇÃO COMPLETA
document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados salvos primeiro
    carregarVantagens();
    
    // Inicializar sistema
    inicializarVantagens();
    
    // Salvar automaticamente quando a página for fechada/atualizada
    window.addEventListener('beforeunload', salvarVantagens);
    
    // Salvar periodicamente (a cada 30 segundos)
    setInterval(salvarVantagens, 30000);
    
    console.log('Sistema de Vantagens inicializado!');
});

// FUNÇÕES DE UTILIDADE PARA DESENVOLVIMENTO
function debugVantagens() {
    console.log('=== DEBUG VANTAGENS ===');
    console.log('Vantagens Adquiridas:', vantagensAdquiridas);
    console.log('Desvantagens Adquiridas:', desvantagensAdquiridas);
    console.log('Peculiaridades:', peculiaridades);
    console.log('Pontos Vantagens:', calcularPontosVantagens());
    console.log('Pontos Desvantagens:', calcularPontosDesvantagens());
    console.log('Pontos Peculiaridades:', calcularPontosPeculiaridades());
    console.log('Saldo Total:', calcularPontosVantagens() - calcularPontosDesvantagens() - calcularPontosPeculiaridades());
}

// Exportar para uso global (se necessário)
if (typeof window !== 'undefined') {
    window.SistemaVantagens = {
        inicializarVantagens,
        adicionarVantagem,
        removerVantagem,
        adicionarDesvantagem,
        removerDesvantagem,
        adicionarPeculiaridade,
        removerPeculiaridade,
        salvarVantagens,
        carregarVantagens,
        debugVantagens
    };
}
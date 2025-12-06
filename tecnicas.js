// ===== SISTEMA DE TÉCNICAS =====

// Estado do sistema de técnicas
let estadoTecnicas = {
    pontosTecnicasTotal: 0,
    pontosMedio: 0,
    pontosDificil: 0,
    qtdMedio: 0,
    qtdDificil: 0,
    qtdTotal: 0,
    tecnicasAprendidas: [],
    filtroAtivo: 'todas-tecnicas',
    buscaAtiva: '',
    tecnicasDisponiveis: [], // Será preenchido dinamicamente
    modalTecnicaAtiva: null,
    nivelTecnica: 0
};

// ===== TABELAS DE CUSTO DAS TÉCNICAS =====
const tabelasCustoTecnicas = {
    // TABELA PARA DIFICULDADE MÉDIA
    'Média': {
        nome: 'Média',
        custos: {
            0: 0,   // Exatamente no requisito
            1: 1,   // +1 acima
            2: 2,   // +2 acima  
            3: 3,   // +3 acima
            4: 4,   // +4 acima
            // +5 ou mais: +1 ponto por +1
        }
    },
    
    // TABELA PARA DIFICULDADE DIFÍCIL
    'Difícil': {
        nome: 'Difícil',
        custos: {
            0: 0,   // Exatamente no requisito
            1: 2,   // +1 acima
            2: 3,   // +2 acima
            3: 4,   // +3 acima
            4: 5,   // +4 acima
            // +5 ou mais: +1 ponto por +1
        }
    }
};

// ===== FUNÇÃO: CALCULAR CUSTO DA TÉCNICA =====
function calcularCustoTecnica(diferencaNivel, dificuldade) {
    const tabela = tabelasCustoTecnicas[dificuldade];
    if (!tabela) return 0;
    
    // Se diferença for exatamente um valor da tabela
    if (tabela.custos.hasOwnProperty(diferencaNivel)) {
        return tabela.custos[diferencaNivel];
    }
    
    // Se diferença for 5 ou mais: 5 pontos + (diferença - 4) * 1
    if (diferencaNivel >= 5) {
        const base = dificuldade === 'Difícil' ? 5 : 4; // +4 já custa 5 ou 4
        return base + (diferencaNivel - 4);
    }
    
    return 0;
}

// ===== FUNÇÃO: OBTER NH DA PERÍCIA EM TEMPO REAL =====
function obterNHPericia(idPericia) {
    // Busca a perícia aprendida
    const periciaAprendida = estadoPericias.periciasAprendidas.find(p => p.id === idPericia);
    if (!periciaAprendida) return null;
    
    // Calcula NH atual: atributo base + nível da perícia
    const atributoBase = obterAtributoAtual(periciaAprendida.atributo);
    return atributoBase + periciaAprendida.nivel;
}

// ===== FUNÇÃO: VERIFICAR PRÉ-REQUISITOS =====
function verificarPreRequisitosTecnica(tecnica) {
    // Verifica se tem todas as perícias requisitadas
    for (const prereq of tecnica.preRequisitos) {
        const periciaAprendida = estadoPericias.periciasAprendidas.find(p => p.id === prereq.idPericia);
        if (!periciaAprendida) {
            return {
                passou: false,
                motivo: `Falta a perícia: ${prereq.nomePericia}`
            };
        }
        
        // Verifica se tem o nível mínimo na perícia
        const nhPericia = obterNHPericia(prereq.idPericia);
        if (nhPericia < prereq.nivelMinimo) {
            return {
                passou: false,
                motivo: `${prereq.nomePericia} precisa ter NH ${prereq.nivelMinimo} (atual: ${nhPericia})`
            };
        }
    }
    
    return { passou: true, motivo: '' };
}

// ===== FUNÇÃO: CALCULAR DIFERENÇA DO REQUISITO =====
function calcularDiferencaRequisito(tecnica) {
    // A técnica usa o requisito da primeira perícia da lista
    const periciaPrincipal = tecnica.preRequisitos[0];
    const nhAtual = obterNHPericia(periciaPrincipal.idPericia);
    
    if (nhAtual === null) return 0;
    
    // Diferença = NH atual - requisito
    return Math.max(0, nhAtual - periciaPrincipal.nivelMinimo);
}

// ===== FUNÇÃO: ATUALIZAR TÉCNICAS DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
    if (!window.catalogoTecnicas) return;
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    const disponiveis = [];
    
    // Filtra técnicas que o jogador tem pré-requisitos
    todasTecnicas.forEach(tecnica => {
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.some(t => t.id === tecnica.id);
        
        if (verificacao.passou && !jaAprendida) {
            // Calcula custo atual
            const diferenca = calcularDiferencaRequisito(tecnica);
            const custoAtual = calcularCustoTecnica(diferenca, tecnica.dificuldade);
            
            disponiveis.push({
                ...tecnica,
                disponivel: true,
                custoAtual: custoAtual,
                diferencaRequisito: diferenca,
                verificacao: verificacao
            });
        } else if (!jaAprendida) {
            // Técnica não disponível (falta pré-requisitos)
            disponiveis.push({
                ...tecnica,
                disponivel: false,
                motivoIndisponivel: verificacao.motivo,
                verificacao: verificacao
            });
        }
    });
    
    estadoTecnicas.tecnicasDisponiveis = disponiveis;
}

// ===== FUNÇÃO: RENDERIZAR STATUS DAS TÉCNICAS =====
function renderizarStatusTecnicas() {
    // Calcula estatísticas
    estadoTecnicas.pontosTecnicasTotal = 0;
    estadoTecnicas.pontosMedio = 0;
    estadoTecnicas.pontosDificil = 0;
    estadoTecnicas.qtdMedio = 0;
    estadoTecnicas.qtdDificil = 0;
    
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        if (tecnica.dificuldade === 'Média') {
            estadoTecnicas.qtdMedio++;
            estadoTecnicas.pontosMedio += tecnica.custoPago;
        } else if (tecnica.dificuldade === 'Difícil') {
            estadoTecnicas.qtdDificil++;
            estadoTecnicas.pontosDificil += tecnica.custoPago;
        }
        estadoTecnicas.pontosTecnicasTotal += tecnica.custoPago;
    });
    
    estadoTecnicas.qtdTotal = estadoTecnicas.qtdMedio + estadoTecnicas.qtdDificil;
    
    // Atualiza a interface
    document.getElementById('qtd-tecnicas-medio').textContent = estadoTecnicas.qtdMedio;
    document.getElementById('pts-tecnicas-medio').textContent = `(${estadoTecnicas.pontosMedio} pts)`;
    
    document.getElementById('qtd-tecnicas-dificil').textContent = estadoTecnicas.qtdDificil;
    document.getElementById('pts-tecnicas-dificil').textContent = `(${estadoTecnicas.pontosDificil} pts)`;
    
    document.getElementById('qtd-tecnicas-total').textContent = estadoTecnicas.qtdTotal;
    document.getElementById('pts-tecnicas-total').textContent = `(${estadoTecnicas.pontosTecnicasTotal} pts)`;
    
    const badgeTotal = document.getElementById('pontos-tecnicas-total');
    if (badgeTotal) {
        badgeTotal.textContent = `[${estadoTecnicas.pontosTecnicasTotal} pts]`;
    }
}

// ===== FUNÇÃO: RENDERIZAR CATÁLOGO DE TÉCNICAS =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
    let tecnicasFiltradas = estadoTecnicas.tecnicasDisponiveis;
    
    // Aplica filtro
    if (estadoTecnicas.filtroAtivo === 'medio-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Média');
    } else if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Difícil');
    } else if (estadoTecnicas.filtroAtivo === 'pericia-tecnicas') {
        // Mostrará depois quando implementarmos filtro por perícia
    }
    
    // Aplica busca
    if (estadoTecnicas.buscaAtiva.trim() !== '') {
        const termo = estadoTecnicas.buscaAtiva.toLowerCase();
        tecnicasFiltradas = tecnicasFiltradas.filter(t => 
            t.nome.toLowerCase().includes(termo) ||
            t.descricao.toLowerCase().includes(termo)
        );
    }
    
    // Renderiza
    if (tecnicasFiltradas.length === 0) {
        if (estadoTecnicas.tecnicasDisponiveis.length === 0) {
            container.innerHTML = `
                <div class="nenhuma-pericia">
                    <i class="fas fa-info-circle"></i>
                    <div>Aprenda perícias primeiro</div>
                    <small>As técnicas aparecerão aqui quando você tiver as perícias necessárias</small>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h4>Nenhuma técnica encontrada</h4>
                    <p>Tente outro filtro ou termo de busca</p>
                </div>
            `;
        }
        return;
    }
    
    container.innerHTML = '';
    
    tecnicasFiltradas.forEach(tecnica => {
        const item = document.createElement('div');
        item.className = `pericia-item ${tecnica.disponivel ? '' : 'item-indisponivel'}`;
        item.dataset.id = tecnica.id;
        
        let html = `
            <div class="pericia-header">
                <h4 class="pericia-nome">${tecnica.nome}</h4>
                <div class="pericia-info">
                    <span class="pericia-dificuldade dificuldade-${tecnica.dificuldade.toLowerCase()}">
                        ${tecnica.dificuldade}
                    </span>
                    ${tecnica.disponivel ? `
                    <span class="pericia-custo">${tecnica.custoAtual} pts</span>
                    ` : ''}
                </div>
            </div>
            <p class="pericia-descricao">${tecnica.descricao}</p>
        `;
        
        if (!tecnica.disponivel) {
            html += `<div class="tecnica-indisponivel-badge">
                <i class="fas fa-lock"></i> ${tecnica.motivoIndisponivel || 'Pré-requisitos não atendidos'}
            </div>`;
        } else {
            html += `<div class="pericia-requisitos">
                <small><strong>Requisito:</strong> ${tecnica.preRequisitos.map(p => `${p.nomePericia} ${p.nivelMinimo}+`).join(', ')}</small>
            </div>`;
        }
        
        item.innerHTML = html;
        
        if (tecnica.disponivel) {
            item.addEventListener('click', () => abrirModalTecnica(tecnica));
            item.style.cursor = 'pointer';
        } else {
            item.style.cursor = 'not-allowed';
            item.style.opacity = '0.7';
        }
        
        container.appendChild(item);
    });
}

// ===== FUNÇÃO: RENDERIZAR TÉCNICAS APRENDIDAS =====
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    if (estadoTecnicas.tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia-aprendida">
                <i class="fas fa-tools"></i>
                <div>Nenhuma técnica aprendida</div>
                <small>As técnicas que você aprender aparecerão aqui</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        const item = document.createElement('div');
        item.className = 'pericia-aprendida-item';
        
        const html = `
            <div class="pericia-aprendida-header">
                <h4 class="pericia-aprendida-nome">${tecnica.nome}</h4>
                <div class="pericia-aprendida-info">
                    <span class="pericia-aprendida-nivel">${tecnica.nhAtual}</span>
                    <span class="pericia-dificuldade dificuldade-${tecnica.dificuldade.toLowerCase()}">
                        ${tecnica.dificuldade}
                    </span>
                    <span class="pericia-aprendida-custo">${tecnica.custoPago} pts</span>
                </div>
            </div>
            <div class="pericia-requisitos">
                <small><strong>Base:</strong> ${tecnica.periciaBase}</small>
            </div>
            <button class="btn-remover-pericia" data-id="${tecnica.id}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        item.innerHTML = html;
        
        const btnRemover = item.querySelector('.btn-remover-pericia');
        btnRemover.addEventListener('click', (e) => {
            e.stopPropagation();
            removerTecnica(tecnica.id);
        });
        
        item.addEventListener('click', () => {
            // Abre modal para ver detalhes
            const tecnicaOriginal = window.catalogoTecnicas.buscarTecnicaPorId(tecnica.id);
            if (tecnicaOriginal) {
                abrirModalTecnica(tecnicaOriginal, tecnica);
            }
        });
        
        container.appendChild(item);
    });
}

// ===== FUNÇÃO: ABRIR MODAL DA TÉCNICA =====
function abrirModalTecnica(tecnica, tecnicaAprendida = null) {
    estadoTecnicas.modalTecnicaAtiva = tecnica;
    
    // Verifica pré-requisitos e calcula custo
    const verificacao = verificarPreRequisitosTecnica(tecnica);
    const diferenca = calcularDiferencaRequisito(tecnica);
    const custo = calcularCustoTecnica(diferenca, tecnica.dificuldade);
    
    // Calcula NH máximo (não pode exceder o NH da perícia base)
    const periciaBase = tecnica.preRequisitos[0];
    const nhPericiaBase = obterNHPericia(periciaBase.idPericia);
    const nhMaximo = nhPericiaBase;
    
    // Define nível inicial
    let nivelInicial = tecnicaAprendida ? tecnicaAprendida.nhAtual : nhPericiaBase;
    estadoTecnicas.nivelTecnica = Math.min(nivelInicial, nhMaximo);
    
    const modalContent = document.querySelector('.modal-tecnica');
    if (!modalContent) return;
    
    modalContent.innerHTML = `
        <div class="modal-header-pericia">
            <span class="modal-close" onclick="fecharModalTecnica()">&times;</span>
            <h3>${tecnica.nome}</h3>
            <div class="modal-subtitulo">
                ${tecnica.dificuldade} • Requer: ${tecnica.preRequisitos.map(p => `${p.nomePericia} ${p.nivelMinimo}+`).join(', ')}
            </div>
        </div>
        
        <div class="modal-body-pericia">
            <div class="nivel-controle">
                <div class="nivel-info">
                    <div class="nivel-atual">
                        <label>Nível da Técnica</label>
                        <div class="nivel-valor" id="nivel-tecnica-valor">${estadoTecnicas.nivelTecnica}</div>
                        <div class="custo-detalhes" style="margin-top: 5px;">
                            Máximo: ${nhMaximo} (NH de ${periciaBase.nomePericia})
                        </div>
                    </div>
                </div>
                
                <div class="custo-info">
                    <div class="custo-total">
                        <label>${tecnicaAprendida ? 'Custo para Melhorar' : 'Custo para Aprender'}</label>
                        <div id="custo-tecnica-atual">${custo} pontos</div>
                    </div>
                    <div class="custo-detalhes" id="info-custo-tecnica">
                        ${diferenca === 0 ? 'Exatamente no requisito' : 
                          `${diferenca} nível(s) acima do requisito`}
                    </div>
                </div>
                
                <div class="nh-info">
                    <div class="nh-calculado">
                        <label>Efeito da Técnica</label>
                        <span id="efeito-tecnica">Reduz penalidades</span>
                    </div>
                    <div class="custo-detalhes">
                        Penalidades de cavalgar não reduzem abaixo deste nível
                    </div>
                </div>
            </div>
            
            <div class="detalhes-pericia-descricao">
                <h4>Descrição</h4>
                <p>${tecnica.descricao}</p>
            </div>
            
            <div class="detalhes-pericia-default">
                <strong>Pré-requisitos:</strong> ${tecnica.preRequisitos.map(p => `${p.nomePericia} ${p.nivelMinimo}+`).join(', ')}
            </div>
            
            <div class="detalhes-pericia-default">
                <strong>Limite:</strong> Não pode exceder o NH em ${periciaBase.nomePericia}
            </div>
            
            ${!verificacao.passou ? `
            <div class="detalhes-pericia-default" style="background: rgba(231, 76, 60, 0.1); border-left-color: #e74c3c;">
                <strong><i class="fas fa-exclamation-triangle"></i> Pré-requisitos não atendidos:</strong><br>
                ${verificacao.motivo}
            </div>
            ` : ''}
        </div>
        
        <div class="modal-actions-pericia">
            <button class="btn-modal btn-cancelar" onclick="fecharModalTecnica()">Cancelar</button>
            <button class="btn-modal btn-confirmar" id="btn-confirmar-tecnica" 
                    onclick="confirmarTecnica()" 
                    ${!verificacao.passou || custo === 0 ? 'disabled' : ''}>
                ${tecnicaAprendida ? 'Melhorar' : 'Aprender'} (${custo} pontos)
            </button>
        </div>
    `;
    
    document.querySelector('.modal-tecnica-overlay').style.display = 'block';
}

// ===== FUNÇÃO: CONFIRMAR COMPRA/MELHORIA DA TÉCNICA =====
function confirmarTecnica() {
    if (!estadoTecnicas.modalTecnicaAtiva) return;
    
    const tecnica = estadoTecnicas.modalTecnicaAtiva;
    const verificacao = verificarPreRequisitosTecnica(tecnica);
    
    if (!verificacao.passou) {
        alert(`Não é possível aprender esta técnica:\n${verificacao.motivo}`);
        return;
    }
    
    const diferenca = calcularDiferencaRequisito(tecnica);
    const custo = calcularCustoTecnica(diferenca, tecnica.dificuldade);
    
    if (custo <= 0) {
        alert('Erro ao calcular custo da técnica.');
        return;
    }
    
    // Verifica se já tem a técnica
    const indexExistente = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnica.id);
    
    if (indexExistente >= 0) {
        // Melhorar técnica existente
        estadoTecnicas.tecnicasAprendidas[indexExistente] = {
            ...estadoTecnicas.tecnicasAprendidas[indexExistente],
            nhAtual: estadoTecnicas.nivelTecnica,
            custoPago: estadoTecnicas.tecnicasAprendidas[indexExistente].custoPago + custo,
            dataMelhoria: new Date().toISOString()
        };
    } else {
        // Nova técnica
        const periciaBase = tecnica.preRequisitos[0];
        const nhPericiaBase = obterNHPericia(periciaBase.idPericia);
        
        const novaTecnica = {
            id: tecnica.id,
            nome: tecnica.nome,
            descricao: tecnica.descricao,
            dificuldade: tecnica.dificuldade,
            preRequisitos: tecnica.preRequisitos,
            periciaBase: periciaBase.nomePericia,
            nhAtual: Math.min(estadoTecnicas.nivelTecnica, nhPericiaBase),
            nhMaximo: nhPericiaBase,
            custoPago: custo,
            dataAquisicao: new Date().toISOString(),
            tipo: 'tecnica'
        };
        
        estadoTecnicas.tecnicasAprendidas.push(novaTecnica);
    }
    
    fecharModalTecnica();
    salvarTecnicas();
    renderizarStatusTecnicas();
    renderizarTecnicasAprendidas();
    atualizarTecnicasDisponiveis();
    renderizarCatalogoTecnicas();
    
    // Atualiza os pontos totais da ficha (se houver integração)
    if (window.atualizarPontosTotais) {
        window.atualizarPontosTotais();
    }
}

// ===== FUNÇÃO: REMOVER TÉCNICA =====
function removerTecnica(idTecnica) {
    if (confirm('Tem certeza que deseja remover esta técnica?\nOs pontos gastos serão perdidos.')) {
        estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== idTecnica);
        salvarTecnicas();
        renderizarStatusTecnicas();
        renderizarTecnicasAprendidas();
        atualizarTecnicasDisponiveis();
        renderizarCatalogoTecnicas();
    }
}

// ===== FUNÇÃO: FECHAR MODAL DA TÉCNICA =====
function fecharModalTecnica() {
    document.querySelector('.modal-tecnica-overlay').style.display = 'none';
    estadoTecnicas.modalTecnicaAtiva = null;
    estadoTecnicas.nivelTecnica = 0;
}

// ===== FUNÇÕES DE PERSISTÊNCIA =====
function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
    } catch (e) {
        console.error('Erro ao salvar técnicas:', e);
    }
}

function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
        }
    } catch (e) {
        console.error('Erro ao carregar técnicas:', e);
    }
}

// ===== FUNÇÕES DE INICIALIZAÇÃO =====
function inicializarSistemaTecnicas() {
    carregarTecnicas();
    configurarEventListenersTecnicas();
    atualizarTecnicasDisponiveis();
    renderizarStatusTecnicas();
    renderizarFiltrosTecnicas();
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
}

function configurarEventListenersTecnicas() {
    // Filtros das técnicas
    const filtroButtons = document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]');
    filtroButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const filtro = this.dataset.filtro;
            estadoTecnicas.filtroAtivo = filtro;
            renderizarFiltrosTecnicas();
            renderizarCatalogoTecnicas();
        });
    });
    
    // Busca de técnicas
    const buscaInput = document.getElementById('busca-tecnicas');
    if (buscaInput) {
        buscaInput.addEventListener('input', function() {
            estadoTecnicas.buscaAtiva = this.value;
            renderizarCatalogoTecnicas();
        });
    }
    
    // Overlay para fechar modal
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModalTecnica();
            }
        });
    }
    
    // Tecla ESC para fechar modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fecharModalTecnica();
        }
    });
    
    // Ouvinte para quando perícias forem alteradas
    document.addEventListener('periciasAlteradas', function() {
        setTimeout(() => {
            atualizarTecnicasDisponiveis();
            renderizarCatalogoTecnicas();
            renderizarStatusTecnicas();
        }, 100);
    });
}

function renderizarFiltrosTecnicas() {
    const filtroButtons = document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]');
    filtroButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filtro === estadoTecnicas.filtroAtivo) {
            btn.classList.add('active');
        }
    });
}

// ===== EXPORTAÇÃO DE FUNÇÕES =====
window.fecharModalTecnica = fecharModalTecnica;
window.confirmarTecnica = confirmarTecnica;
window.abrirModalTecnica = abrirModalTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

// Inicialização automática quando a aba for ativada
document.addEventListener('DOMContentLoaded', function() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'pericias' && tab.classList.contains('active')) {
                    setTimeout(() => {
                        if (!window.sistemaTecnicasInicializado) {
                            inicializarSistemaTecnicas();
                            window.sistemaTecnicasInicializado = true;
                        }
                    }, 100);
                }
            }
        });
    });
    
    const periciasTab = document.getElementById('pericias');
    if (periciasTab) {
        observer.observe(periciasTab, { attributes: true });
    }
});
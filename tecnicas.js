// ===== SISTEMA DE TÉCNICAS =====
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
    tecnicasDisponiveis: [],
    modalTecnicaAtiva: null,
    nivelTecnica: 0
};

// ===== TABELAS DE CUSTO =====
const tabelasCustoTecnicas = {
    'Média': { 0:0, 1:1, 2:2, 3:3, 4:4 },
    'Difícil': { 0:0, 1:2, 2:3, 3:4, 4:5 }
};

// ===== FUNÇÃO CORRIGIDA: CALCULAR CUSTO =====
function calcularCustoTecnica(diferenca, dificuldade) {
    if (diferenca < 0) return 0;
    
    // Tabela DIFÍCIL (Arquearia Montada é Difícil)
    if (dificuldade === 'Difícil') {
        if (diferenca === 0) return 0;      // Exatamente no requisito
        if (diferenca === 1) return 2;      // +1 acima
        if (diferenca === 2) return 3;      // +2 acima
        if (diferenca === 3) return 4;      // +3 acima
        if (diferenca === 4) return 5;      // +4 acima
        // +5 ou mais: 5 pontos + (diferença - 4) * 1
        return 5 + (diferenca - 4);
    }
    
    // Tabela MÉDIA
    if (dificuldade === 'Média') {
        if (diferenca === 0) return 0;      // Exatamente no requisito
        if (diferenca === 1) return 1;      // +1 acima
        if (diferenca === 2) return 2;      // +2 acima
        if (diferenca === 3) return 3;      // +3 acima
        if (diferenca === 4) return 4;      // +4 acima
        // +5 ou mais: 4 pontos + (diferença - 4) * 1
        return 4 + (diferenca - 4);
    }
    
    return 0;
}

// ===== FUNÇÃO: OBTER NH DA PERÍCIA =====
function obterNHPericia(idPericia) {
    if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) return 0;
    
    const pericia = window.estadoPericias.periciasAprendidas.find(p => p.id === idPericia);
    if (!pericia) return 0;
    
    let atributoBase = 10;
    if (window.obterAtributoAtual) {
        atributoBase = window.obterAtributoAtual(pericia.atributo);
    }
    
    return atributoBase + (pericia.nivel || 0);
}

// ===== FUNÇÃO: VERIFICAR PRÉ-REQUISITOS (CORRIGIDA) =====
function verificarPreRequisitosTecnica(tecnica) {
    if (!tecnica || !tecnica.preRequisitos) {
        return { passou: false, motivo: "Técnica inválida" };
    }
    
    for (const prereq of tecnica.preRequisitos) {
        let periciaEncontrada = null;
        
        // MÉTODO 1: Procura por ID exato
        if (prereq.idPericia) {
            periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => 
                p.id === prereq.idPericia
            );
        }
        
        // MÉTODO 2: Se não achou, procura por prefixo (para Cavalgar)
        if (!periciaEncontrada && prereq.idPrefix) {
            periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => 
                p.id && p.id.startsWith(prereq.idPrefix)
            );
        }
        
        // MÉTODO 3: Se ainda não achou, procura por nome
        if (!periciaEncontrada && prereq.nomePericia) {
            periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => 
                p.nome && p.nome.toLowerCase().includes(prereq.nomePericia.toLowerCase())
            );
        }
        
        // Se não encontrou de jeito nenhum
        if (!periciaEncontrada) {
            return { 
                passou: false, 
                motivo: `Falta: ${prereq.nomePericia}`
            };
        }
        
        // Verifica nível mínimo
        if (prereq.nivelMinimo > 0) {
            const nh = obterNHPericia(periciaEncontrada.id);
            if (nh < prereq.nivelMinimo) {
                return { 
                    passou: false, 
                    motivo: `${prereq.nomePericia} precisa NH ${prereq.nivelMinimo} (tem ${nh})`
                };
            }
        }
    }
    
    return { passou: true, motivo: '' };
}

// ===== FUNÇÃO: CALCULAR DIFERENÇA DO REQUISITO =====
function calcularDiferencaRequisito(tecnica) {
    if (!tecnica.preRequisitos || tecnica.preRequisitos.length === 0) return 0;
    
    const prereq = tecnica.preRequisitos[0];
    let periciaAprendida = null;
    
    // Procura a perícia base
    if (prereq.idPericia) {
        periciaAprendida = window.estadoPericias.periciasAprendidas.find(p => 
            p.id === prereq.idPericia
        );
    }
    
    if (!periciaAprendida && prereq.idPrefix) {
        periciaAprendida = window.estadoPericias.periciasAprendidas.find(p => 
            p.id && p.id.startsWith(prereq.idPrefix)
        );
    }
    
    if (!periciaAprendida) return 0;
    
    const nhAtual = obterNHPericia(periciaAprendida.id);
    return Math.max(0, nhAtual - (prereq.nivelMinimo || 0));
}

// ===== FUNÇÃO: ATUALIZAR TÉCNICAS DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
    if (!window.catalogoTecnicas || !window.catalogoTecnicas.obterTodasTecnicas) return;
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    const disponiveis = [];
    
    todasTecnicas.forEach(tecnica => {
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.some(t => t.id === tecnica.id);
        
        if (!jaAprendida) {
            const verificacao = verificarPreRequisitosTecnica(tecnica);
            const diferenca = calcularDiferencaRequisito(tecnica);
            const custo = calcularCustoTecnica(diferenca, tecnica.dificuldade);
            
            disponiveis.push({
                ...tecnica,
                disponivel: verificacao.passou,
                custoAtual: custo,
                diferencaRequisito: diferenca,
                motivoIndisponivel: verificacao.motivo,
                verificacao: verificacao
            });
        }
    });
    
    estadoTecnicas.tecnicasDisponiveis = disponiveis;
    renderizarCatalogoTecnicas();
}

// ===== FUNÇÃO: RENDERIZAR STATUS =====
function renderizarStatusTecnicas() {
    estadoTecnicas.pontosTecnicasTotal = 0;
    estadoTecnicas.pontosMedio = 0;
    estadoTecnicas.pontosDificil = 0;
    estadoTecnicas.qtdMedio = 0;
    estadoTecnicas.qtdDificil = 0;
    
    estadoTecnicas.tecnicasAprendidas.forEach(t => {
        const custo = t.custoPago || 0;
        
        if (t.dificuldade === 'Média') {
            estadoTecnicas.qtdMedio++;
            estadoTecnicas.pontosMedio += custo;
        } else if (t.dificuldade === 'Difícil') {
            estadoTecnicas.qtdDificil++;
            estadoTecnicas.pontosDificil += custo;
        }
        
        estadoTecnicas.pontosTecnicasTotal += custo;
    });
    
    estadoTecnicas.qtdTotal = estadoTecnicas.qtdMedio + estadoTecnicas.qtdDificil;
    
    // Atualizar interface
    const elementos = {
        'qtd-tecnicas-medio': estadoTecnicas.qtdMedio,
        'pts-tecnicas-medio': `(${estadoTecnicas.pontosMedio} pts)`,
        'qtd-tecnicas-dificil': estadoTecnicas.qtdDificil,
        'pts-tecnicas-dificil': `(${estadoTecnicas.pontosDificil} pts)`,
        'qtd-tecnicas-total': estadoTecnicas.qtdTotal,
        'pts-tecnicas-total': `(${estadoTecnicas.pontosTecnicasTotal} pts)`
    };
    
    for (const [id, valor] of Object.entries(elementos)) {
        const el = document.getElementById(id);
        if (el) el.textContent = valor;
    }
    
    const badge = document.getElementById('pontos-tecnicas-total');
    if (badge) badge.textContent = `[${estadoTecnicas.pontosTecnicasTotal} pts]`;
}

// ===== FUNÇÃO: RENDERIZAR CATÁLOGO =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
    let tecnicasFiltradas = estadoTecnicas.tecnicasDisponiveis;
    
    // Aplicar filtro
    if (estadoTecnicas.filtroAtivo === 'medio-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Média');
    } else if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Difícil');
    }
    
    // Aplicar busca
    if (estadoTecnicas.buscaAtiva.trim() !== '') {
        const termo = estadoTecnicas.buscaAtiva.toLowerCase();
        tecnicasFiltradas = tecnicasFiltradas.filter(t => 
            t.nome.toLowerCase().includes(termo) ||
            (t.descricao && t.descricao.toLowerCase().includes(termo))
        );
    }
    
    // Se não tem técnicas
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
    
    // Renderizar técnicas
    let html = '';
    tecnicasFiltradas.forEach(tecnica => {
        const disponivel = tecnica.disponivel;
        const classe = disponivel ? 'pericia-item' : 'pericia-item item-indisponivel';
        
        html += `
            <div class="${classe}" data-id="${tecnica.id}" style="cursor: ${disponivel ? 'pointer' : 'not-allowed'};">
                <div class="pericia-header">
                    <h4 class="pericia-nome">${tecnica.nome}</h4>
                    <div class="pericia-info">
                        <span class="pericia-dificuldade dificuldade-${tecnica.dificuldade.toLowerCase()}">
                            ${tecnica.dificuldade}
                        </span>
                        ${disponivel ? `<span class="pericia-custo">${tecnica.custoAtual} pts</span>` : ''}
                    </div>
                </div>
                <p class="pericia-descricao">${tecnica.descricao || ''}</p>
                
                ${!disponivel ? `
                <div class="tecnica-indisponivel-badge">
                    <i class="fas fa-lock"></i> ${tecnica.motivoIndisponivel || 'Pré-requisitos não atendidos'}
                </div>
                ` : `
                <div class="pericia-requisitos">
                    <small><strong>Requisito:</strong> ${tecnica.preRequisitos.map(p => `${p.nomePericia} ${p.nivelMinimo}+`).join(', ')}</small>
                </div>
                `}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Adicionar event listeners
    document.querySelectorAll('.pericia-item[data-id]').forEach(item => {
        if (!item.classList.contains('item-indisponivel')) {
            item.addEventListener('click', function() {
                const id = this.dataset.id;
                const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
                if (tecnica) abrirModalTecnica(tecnica);
            });
        }
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
    
    let html = '';
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        html += `
            <div class="pericia-aprendida-item">
                <div class="pericia-aprendida-header">
                    <h4 class="pericia-aprendida-nome">${tecnica.nome}</h4>
                    <div class="pericia-aprendida-info">
                        <span class="pericia-aprendida-nivel">NH ${tecnica.nhAtual || 0}</span>
                        <span class="pericia-dificuldade dificuldade-${tecnica.dificuldade.toLowerCase()}">
                            ${tecnica.dificuldade}
                        </span>
                        <span class="pericia-aprendida-custo">${tecnica.custoPago || 0} pts</span>
                    </div>
                </div>
                <div class="pericia-requisitos">
                    <small><strong>Base:</strong> ${tecnica.periciaBase || 'Técnica'}</small>
                </div>
                <button class="btn-remover-pericia" data-id="${tecnica.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Botões de remover
    document.querySelectorAll('.btn-remover-pericia').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.dataset.id;
            if (confirm('Remover esta técnica? Os pontos serão perdidos.')) {
                estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
                salvarTecnicas();
                renderizarStatusTecnicas();
                renderizarTecnicasAprendidas();
                atualizarTecnicasDisponiveis();
            }
        });
    });
}

// ===== FUNÇÃO: ABRIR MODAL DA TÉCNICA =====
function abrirModalTecnica(tecnica) {
    if (!tecnica) return;
    
    estadoTecnicas.modalTecnicaAtiva = tecnica;
    
    const verificacao = verificarPreRequisitosTecnica(tecnica);
    const diferenca = calcularDiferencaRequisito(tecnica);
    const custo = calcularCustoTecnica(diferenca, tecnica.dificuldade);
    
    // Encontrar a perícia base para calcular NH máximo
    let nhMaximo = 0;
    let nomePericiaBase = '';
    
    if (tecnica.preRequisitos && tecnica.preRequisitos.length > 0) {
        const prereq = tecnica.preRequisitos[0];
        nomePericiaBase = prereq.nomePericia || '';
        
        // Procurar a perícia aprendida
        let periciaAprendida = null;
        
        if (prereq.idPericia) {
            periciaAprendida = window.estadoPericias.periciasAprendidas.find(p => 
                p.id === prereq.idPericia
            );
        }
        
        if (!periciaAprendida && prereq.idPrefix) {
            periciaAprendida = window.estadoPericias.periciasAprendidas.find(p => 
                p.id && p.id.startsWith(prereq.idPrefix)
            );
        }
        
        if (periciaAprendida) {
            nhMaximo = obterNHPericia(periciaAprendida.id);
        }
    }
    
    // Nível inicial da técnica
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    estadoTecnicas.nivelTecnica = jaAprendida ? (jaAprendida.nhAtual || nhMaximo) : nhMaximo;
    
    // Criar modal
    const modal = document.querySelector('.modal-tecnica');
    if (!modal) return;
    
    modal.innerHTML = `
        <div class="modal-header-pericia">
            <span class="modal-close" onclick="fecharModalTecnica()">&times;</span>
            <h3>${tecnica.nome}</h3>
            <div class="modal-subtitulo">
                ${tecnica.dificuldade} • ${custo} pontos
            </div>
        </div>
        
        <div class="modal-body-pericia">
            <div class="nivel-controle">
                <div class="nivel-info">
                    <div class="nivel-atual">
                        <label>Nível da Técnica</label>
                        <div class="nivel-valor">${estadoTecnicas.nivelTecnica}</div>
                        <div class="custo-detalhes">
                            Máximo: ${nhMaximo} (NH em ${nomePericiaBase})
                        </div>
                    </div>
                </div>
                
                <div class="custo-info">
                    <div class="custo-total">
                        <label>${jaAprendida ? 'Custo para Melhorar' : 'Custo para Aprender'}</label>
                        <div>${custo} pontos</div>
                    </div>
                    <div class="custo-detalhes">
                        ${diferenca === 0 ? 'Exatamente no requisito' : `${diferenca} nível(s) acima do requisito`}
                    </div>
                </div>
            </div>
            
            <div class="detalhes-pericia-descricao">
                <h4>Descrição</h4>
                <p>${tecnica.descricao || ''}</p>
            </div>
            
            <div class="detalhes-pericia-default">
                <strong>Pré-requisitos:</strong> ${tecnica.preRequisitos.map(p => `${p.nomePericia} ${p.nivelMinimo}+`).join(', ')}
            </div>
            
            ${tecnica.regrasEspeciais ? `
            <div class="detalhes-pericia-default">
                <strong>Regras Especiais:</strong><br>
                ${tecnica.regrasEspeciais.join('<br>')}
            </div>
            ` : ''}
            
            ${!verificacao.passou ? `
            <div class="detalhes-pericia-default" style="background: rgba(231, 76, 60, 0.1); border-left-color: #e74c3c;">
                <strong><i class="fas fa-exclamation-triangle"></i> Não pode aprender:</strong><br>
                ${verificacao.motivo}
            </div>
            ` : ''}
        </div>
        
        <div class="modal-actions-pericia">
            <button class="btn-modal btn-cancelar" onclick="fecharModalTecnica()">Cancelar</button>
            <button class="btn-modal btn-confirmar" onclick="confirmarTecnica()" 
                ${!verificacao.passou ? 'disabled' : ''}>
                ${jaAprendida ? 'Atualizar' : 'Aprender'} (${custo} pontos)
            </button>
        </div>
    `;
    
    document.querySelector('.modal-tecnica-overlay').style.display = 'block';
}

// ===== FUNÇÃO: CONFIRMAR COMPRA =====
function confirmarTecnica() {
    const tecnica = estadoTecnicas.modalTecnicaAtiva;
    if (!tecnica) return;
    
    const verificacao = verificarPreRequisitosTecnica(tecnica);
    if (!verificacao.passou) {
        alert(`Não pode aprender: ${verificacao.motivo}`);
        return;
    }
    
    const diferenca = calcularDiferencaRequisito(tecnica);
    const custo = calcularCustoTecnica(diferenca, tecnica.dificuldade);
    
    // Encontrar índice se já existe
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnica.id);
    
    if (index >= 0) {
        // Atualizar técnica existente
        estadoTecnicas.tecnicasAprendidas[index] = {
            ...estadoTecnicas.tecnicasAprendidas[index],
            nhAtual: estadoTecnicas.nivelTecnica,
            custoPago: (estadoTecnicas.tecnicasAprendidas[index].custoPago || 0) + custo,
            dataAtualizacao: new Date().toISOString()
        };
    } else {
        // Nova técnica
        const periciaBase = tecnica.preRequisitos[0].nomePericia || 'Técnica';
        
        estadoTecnicas.tecnicasAprendidas.push({
            id: tecnica.id,
            nome: tecnica.nome,
            descricao: tecnica.descricao,
            dificuldade: tecnica.dificuldade,
            preRequisitos: tecnica.preRequisitos,
            periciaBase: periciaBase,
            nhAtual: estadoTecnicas.nivelTecnica,
            custoPago: custo,
            dataAquisicao: new Date().toISOString()
        });
    }
    
    fecharModalTecnica();
    salvarTecnicas();
    renderizarStatusTecnicas();
    renderizarTecnicasAprendidas();
    atualizarTecnicasDisponiveis();
    
    if (window.atualizarPontosTotais) {
        window.atualizarPontosTotais();
    }
}

// ===== FUNÇÃO: FECHAR MODAL =====
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

// ===== FUNÇÕES DE EVENTOS =====
function configurarEventListenersTecnicas() {
    // Filtros
    const filtroButtons = document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]');
    filtroButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            estadoTecnicas.filtroAtivo = this.dataset.filtro;
            renderizarFiltrosTecnicas();
            renderizarCatalogoTecnicas();
        });
    });
    
    // Busca
    const buscaInput = document.getElementById('busca-tecnicas');
    if (buscaInput) {
        buscaInput.addEventListener('input', function() {
            estadoTecnicas.buscaAtiva = this.value;
            renderizarCatalogoTecnicas();
        });
    }
    
    // Modal overlay
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModalTecnica();
            }
        });
    }
    
    // Tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fecharModalTecnica();
        }
    });
    
    // Atualizar quando perícias mudarem
    if (window.estadoPericias) {
        const originalPericias = [...window.estadoPericias.periciasAprendidas];
        
        setInterval(() => {
            if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
                const novasPericias = window.estadoPericias.periciasAprendidas;
                if (JSON.stringify(originalPericias) !== JSON.stringify(novasPericias)) {
                    originalPericias.length = 0;
                    originalPericias.push(...novasPericias);
                    atualizarTecnicasDisponiveis();
                }
            }
        }, 500);
    }
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

// ===== FUNÇÃO: INICIALIZAR SISTEMA =====
function inicializarSistemaTecnicas() {
    // Carregar dados salvos
    carregarTecnicas();
    
    // Configurar eventos
    configurarEventListenersTecnicas();
    
    // Atualizar interface
    atualizarTecnicasDisponiveis();
    renderizarStatusTecnicas();
    renderizarFiltrosTecnicas();
    renderizarTecnicasAprendidas();
    
    console.log('Sistema de técnicas inicializado');
}

// ===== FUNÇÃO FORÇAR ATUALIZAÇÃO (PARA DEBUG) =====
function forcarAtualizacaoTecnicas() {
    console.log('Forçando atualização de técnicas...');
    
    // Atualizar tudo
    atualizarTecnicasDisponiveis();
    renderizarStatusTecnicas();
    renderizarTecnicasAprendidas();
    
    // Destacar seção
    const secao = document.querySelector('.tecnicas-section');
    if (secao) {
        secao.style.border = '3px solid #27ae60';
        secao.style.boxShadow = '0 0 15px rgba(39, 174, 96, 0.3)';
        
        setTimeout(() => {
            secao.style.border = '';
            secao.style.boxShadow = '';
        }, 2000);
    }
    
    console.log('Técnicas disponíveis:', estadoTecnicas.tecnicasDisponiveis.length);
    console.log('Técnicas aprendidas:', estadoTecnicas.tecnicasAprendidas.length);
}

// ===== FUNÇÃO VERIFICAR ESTADO (PARA DEBUG) =====
function verificarEstadoTecnicas() {
    console.log('=== VERIFICAÇÃO DO ESTADO ===');
    console.log('Perícias aprendidas:', window.estadoPericias ? window.estadoPericias.periciasAprendidas : 'N/A');
    console.log('Técnicas no catálogo:', window.catalogoTecnicas ? window.catalogoTecnicas.obterTodasTecnicas().length : 'N/A');
    console.log('Técnicas disponíveis:', estadoTecnicas.tecnicasDisponiveis.length);
    console.log('Técnicas aprendidas:', estadoTecnicas.tecnicasAprendidas.length);
    
    // Verificar Arco especificamente
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const arco = window.estadoPericias.periciasAprendidas.find(p => 
            p.id === 'arco' || (p.nome && p.nome.includes('Arco'))
        );
        console.log('Arco encontrada?', arco ? `Sim: ${arco.id} - ${arco.nome}` : 'Não');
    }
    
    // Verificar Cavalgar
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const cavalgar = window.estadoPericias.periciasAprendidas.find(p => 
            p.id && p.id.startsWith('cavalgar-')
        );
        console.log('Cavalgar encontrada?', cavalgar ? `Sim: ${cavalgar.id} - ${cavalgar.nome}` : 'Não');
    }
    
    console.log('=== FIM DA VERIFICAÇÃO ===');
}

// ===== EXPORTAÇÃO DE FUNÇÕES =====
window.fecharModalTecnica = fecharModalTecnica;
window.confirmarTecnica = confirmarTecnica;
window.abrirModalTecnica = abrirModalTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;
window.forcarAtualizacaoTecnicas = forcarAtualizacaoTecnicas;
window.verificarEstadoTecnicas = verificarEstadoTecnicas;

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    // Esperar um pouco para garantir que tudo carregou
    setTimeout(() => {
        // Verificar se estamos na aba de perícias
        const abaPericias = document.getElementById('pericias');
        
        if (abaPericias) {
            // Se a aba já está visível, inicializar
            if (abaPericias.style.display !== 'none') {
                inicializarSistemaTecnicas();
            }
            
            // Observar mudanças na aba
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (abaPericias.style.display !== 'none') {
                            // Aguardar um pouco para garantir que as perícias carregaram
                            setTimeout(inicializarSistemaTecnicas, 300);
                        }
                    }
                });
            });
            
            observer.observe(abaPericias, { attributes: true, attributeFilter: ['style'] });
        }
    }, 1500);
});

// ===== FUNÇÃO DE TESTE RÁPIDO =====
// Use esta função no console para testar rapidamente
window.testarTecnica = function() {
    console.log('=== TESTANDO TÉCNICA ===');
    
    // 1. Verificar se Arco está aprendida
    if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
        console.error('❌ Sistema de perícias não carregado');
        return;
    }
    
    const temArco = window.estadoPericias.periciasAprendidas.some(p => 
        p.id === 'arco' || (p.nome && p.nome.toLowerCase().includes('arco'))
    );
    
    const temCavalgar = window.estadoPericias.periciasAprendidas.some(p => 
        p.id && p.id.startsWith('cavalgar-')
    );
    
    console.log(`✅ Tem Arco: ${temArco ? 'SIM' : 'NÃO'}`);
    console.log(`✅ Tem Cavalgar: ${temCavalgar ? 'SIM' : 'NÃO'}`);
    
    // 2. Verificar técnica no catálogo
    if (!window.catalogoTecnicas) {
        console.error('❌ Catálogo de técnicas não carregado');
        return;
    }
    
    const tecnica = window.catalogoTecnicas.dados['arquearia-montada'];
    if (!tecnica) {
        console.error('❌ Técnica "Arquearia Montada" não encontrada no catálogo');
        return;
    }
    
    console.log(`✅ Técnica encontrada: ${tecnica.nome}`);
    
    // 3. Verificar pré-requisitos
    const verificacao = verificarPreRequisitosTecnica(tecnica);
    console.log(`✅ Pré-requisitos: ${verificacao.passou ? 'OK' : 'FALHOU'} - ${verificacao.motivo}`);
    
    // 4. Forçar atualização
    forcarAtualizacaoTecnicas();
    
    console.log('=== FIM DO TESTE ===');
};

// Inicialização final
console.log('tecnicas.js carregado - Sistema de técnicas pronto');
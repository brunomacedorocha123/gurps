// ===== SISTEMA DE TÉCNICAS =====
// Estado global das técnicas
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
    nivelTecnica: 0,
    inicializado: false
};

// ===== TABELAS DE CUSTO =====
const tabelasCustoTecnicas = {
    'Média': { 0:0, 1:1, 2:2, 3:3, 4:4 },
    'Difícil': { 0:0, 1:2, 2:3, 3:4, 4:5 }
};

// ===== FUNÇÕES CORE =====

// 1. Calcular custo da técnica
function calcularCustoTecnica(diferenca, dificuldade) {
    const tabela = tabelasCustoTecnicas[dificuldade];
    if (!tabela) return 0;
    
    if (tabela[diferenca] !== undefined) return tabela[diferenca];
    if (diferenca >= 5) {
        const base = dificuldade === 'Difícil' ? 5 : 4;
        return base + (diferenca - 4);
    }
    return 0;
}

// 2. Obter NH de uma perícia
function obterNHPericia(idPericia) {
    if (!window.estadoPericias) return 0;
    
    const pericia = window.estadoPericias.periciasAprendidas.find(p => p.id === idPericia);
    if (!pericia) return 0;
    
    const atributoBase = window.obterAtributoAtual ? window.obterAtributoAtual(pericia.atributo) : 10;
    return atributoBase + (pericia.nivel || 0);
}

// 3. Verificar pré-requisitos CORRETO
function verificarPreRequisitosTecnica(tecnica) {
    if (!tecnica || !tecnica.preRequisitos) return { passou: false, motivo: "Técnica inválida" };
    
    for (const prereq of tecnica.preRequisitos) {
        // Verificar se tem a perícia
        let temPericia = false;
        let periciaEncontrada = null;
        
        // Para Cavalgar: verifica por prefixo
        if (prereq.idPrefix) {
            periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => 
                p.id && p.id.startsWith(prereq.idPrefix)
            );
            temPericia = !!periciaEncontrada;
        } 
        // Para outras: ID exato
        else if (prereq.idPericia) {
            periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => 
                p.id === prereq.idPericia
            );
            temPericia = !!periciaEncontrada;
        }
        
        if (!temPericia) {
            return { 
                passou: false, 
                motivo: `Falta: ${prereq.nomePericia}` 
            };
        }
        
        // Verificar nível mínimo
        if (periciaEncontrada && prereq.nivelMinimo > 0) {
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

// 4. Calcular diferença do requisito
function calcularDiferencaRequisito(tecnica) {
    if (!tecnica.preRequisitos || tecnica.preRequisitos.length === 0) return 0;
    
    const periciaPrincipal = tecnica.preRequisitos[0];
    let periciaAprendida = null;
    
    if (periciaPrincipal.idPrefix) {
        periciaAprendida = window.estadoPericias.periciasAprendidas.find(p => 
            p.id && p.id.startsWith(periciaPrincipal.idPrefix)
        );
    } else {
        periciaAprendida = window.estadoPericias.periciasAprendidas.find(p => 
            p.id === periciaPrincipal.idPericia
        );
    }
    
    if (!periciaAprendida) return 0;
    
    const nhAtual = obterNHPericia(periciaAprendida.id);
    return Math.max(0, nhAtual - (periciaPrincipal.nivelMinimo || 0));
}

// 5. Atualizar técnicas disponíveis
function atualizarTecnicasDisponiveis() {
    if (!window.catalogoTecnicas || !window.catalogoTecnicas.obterTodasTecnicas) {
        console.warn('Catálogo de técnicas não carregado');
        return;
    }
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    const disponiveis = [];
    
    todasTecnicas.forEach(tecnica => {
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.some(t => t.id === tecnica.id);
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        
        if (!jaAprendida) {
            const diferenca = calcularDiferencaRequisito(tecnica);
            const custo = calcularCustoTecnica(diferenca, tecnica.dificuldade);
            
            disponiveis.push({
                ...tecnica,
                disponivel: verificacao.passou,
                custoAtual: custo,
                diferencaRequisito: diferenca,
                motivoIndisponivel: verificacao.motivo
            });
        }
    });
    
    estadoTecnicas.tecnicasDisponiveis = disponiveis;
    renderizarCatalogoTecnicas();
}

// ===== RENDERIZAÇÃO =====

// 6. Renderizar status
function renderizarStatusTecnicas() {
    // Reset contadores
    estadoTecnicas.pontosTecnicasTotal = 0;
    estadoTecnicas.pontosMedio = 0;
    estadoTecnicas.pontosDificil = 0;
    estadoTecnicas.qtdMedio = 0;
    estadoTecnicas.qtdDificil = 0;
    
    // Calcular
    estadoTecnicas.tecnicasAprendidas.forEach(t => {
        if (t.dificuldade === 'Média') {
            estadoTecnicas.qtdMedio++;
            estadoTecnicas.pontosMedio += (t.custoPago || 0);
        } else if (t.dificuldade === 'Difícil') {
            estadoTecnicas.qtdDificil++;
            estadoTecnicas.pontosDificil += (t.custoPago || 0);
        }
        estadoTecnicas.pontosTecnicasTotal += (t.custoPago || 0);
    });
    
    estadoTecnicas.qtdTotal = estadoTecnicas.qtdMedio + estadoTecnicas.qtdDificil;
    
    // Atualizar UI
    const atualizarElemento = (id, valor) => {
        const el = document.getElementById(id);
        if (el) el.textContent = valor;
    };
    
    atualizarElemento('qtd-tecnicas-medio', estadoTecnicas.qtdMedio);
    atualizarElemento('pts-tecnicas-medio', `(${estadoTecnicas.pontosMedio} pts)`);
    atualizarElemento('qtd-tecnicas-dificil', estadoTecnicas.qtdDificil);
    atualizarElemento('pts-tecnicas-dificil', `(${estadoTecnicas.pontosDificil} pts)`);
    atualizarElemento('qtd-tecnicas-total', estadoTecnicas.qtdTotal);
    atualizarElemento('pts-tecnicas-total', `(${estadoTecnicas.pontosTecnicasTotal} pts)`);
    
    const badge = document.getElementById('pontos-tecnicas-total');
    if (badge) badge.textContent = `[${estadoTecnicas.pontosTecnicasTotal} pts]`;
}

// 7. Renderizar catálogo
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
    // Filtrar
    let tecnicas = estadoTecnicas.tecnicasDisponiveis;
    
    if (estadoTecnicas.filtroAtivo === 'medio-tecnicas') {
        tecnicas = tecnicas.filter(t => t.dificuldade === 'Média');
    } else if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas') {
        tecnicas = tecnicas.filter(t => t.dificuldade === 'Difícil');
    }
    
    if (estadoTecnicas.buscaAtiva) {
        const busca = estadoTecnicas.buscaAtiva.toLowerCase();
        tecnicas = tecnicas.filter(t => 
            t.nome.toLowerCase().includes(busca) || 
            (t.descricao && t.descricao.toLowerCase().includes(busca))
        );
    }
    
    // Renderizar
    if (tecnicas.length === 0) {
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
    
    let html = '';
    tecnicas.forEach(tecnica => {
        const classe = tecnica.disponivel ? 'pericia-item' : 'pericia-item item-indisponivel';
        const cursor = tecnica.disponivel ? 'pointer' : 'not-allowed';
        
        html += `
            <div class="${classe}" data-id="${tecnica.id}" style="cursor: ${cursor};">
                <div class="pericia-header">
                    <h4 class="pericia-nome">${tecnica.nome}</h4>
                    <div class="pericia-info">
                        <span class="pericia-dificuldade dificuldade-${tecnica.dificuldade.toLowerCase()}">
                            ${tecnica.dificuldade}
                        </span>
                        ${tecnica.disponivel ? `<span class="pericia-custo">${tecnica.custoAtual} pts</span>` : ''}
                    </div>
                </div>
                <p class="pericia-descricao">${tecnica.descricao || ''}</p>
                ${!tecnica.disponivel ? `
                <div class="tecnica-indisponivel-badge">
                    <i class="fas fa-lock"></i> ${tecnica.motivoIndisponivel || 'Pré-requisitos não atendidos'}
                </div>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Adicionar event listeners
    document.querySelectorAll('.pericia-item[data-id]').forEach(item => {
        if (!item.classList.contains('item-indisponivel')) {
            item.addEventListener('click', function() {
                const tecnicaId = this.dataset.id;
                const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === tecnicaId);
                if (tecnica) abrirModalTecnica(tecnica);
            });
        }
    });
}

// 8. Renderizar técnicas aprendidas
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
            if (confirm('Remover esta técnica?')) {
                estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
                salvarTecnicas();
                renderizarStatusTecnicas();
                renderizarTecnicasAprendidas();
                atualizarTecnicasDisponiveis();
            }
        });
    });
}

// ===== MODAL =====

// 9. Abrir modal da técnica
function abrirModalTecnica(tecnica) {
    if (!tecnica) return;
    
    estadoTecnicas.modalTecnicaAtiva = tecnica;
    
    const verificacao = verificarPreRequisitosTecnica(tecnica);
    const diferenca = calcularDiferencaRequisito(tecnica);
    const custo = calcularCustoTecnica(diferenca, tecnica.dificuldade);
    
    // Calcular NH máximo
    let nhMaximo = 0;
    if (tecnica.preRequisitos && tecnica.preRequisitos.length > 0) {
        const periciaBase = tecnica.preRequisitos[0];
        let periciaAprendida = null;
        
        if (periciaBase.idPrefix) {
            periciaAprendida = window.estadoPericias.periciasAprendidas.find(p => 
                p.id && p.id.startsWith(periciaBase.idPrefix)
            );
        } else {
            periciaAprendida = window.estadoPericias.periciasAprendidas.find(p => 
                p.id === periciaBase.idPericia
            );
        }
        
        if (periciaAprendida) {
            nhMaximo = obterNHPericia(periciaAprendida.id);
        }
    }
    
    // Nível inicial
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
                            Máximo: ${nhMaximo} (não pode exceder o NH em Arco)
                        </div>
                    </div>
                </div>
                
                <div class="custo-info">
                    <div class="custo-total">
                        <label>Custo</label>
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
                <strong>Pré-requisitos:</strong> Arco-4 e Cavalgar
            </div>
            
            ${!verificacao.passou ? `
            <div class="detalhes-pericia-default" style="background: rgba(231, 76, 60, 0.1);">
                <strong><i class="fas fa-exclamation-triangle"></i> Falta:</strong> ${verificacao.motivo}
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

// 10. Confirmar compra
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
    
    // Encontrar ou criar técnica
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnica.id);
    const periciaBase = tecnica.preRequisitos[0].nomePericia;
    
    if (index >= 0) {
        // Atualizar existente
        estadoTecnicas.tecnicasAprendidas[index] = {
            ...estadoTecnicas.tecnicasAprendidas[index],
            nhAtual: estadoTecnicas.nivelTecnica,
            custoPago: (estadoTecnicas.tecnicasAprendidas[index].custoPago || 0) + custo
        };
    } else {
        // Nova técnica
        estadoTecnicas.tecnicasAprendidas.push({
            id: tecnica.id,
            nome: tecnica.nome,
            descricao: tecnica.descricao,
            dificuldade: tecnica.dificuldade,
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
}

// 11. Fechar modal
function fecharModalTecnica() {
    document.querySelector('.modal-tecnica-overlay').style.display = 'none';
    estadoTecnicas.modalTecnicaAtiva = null;
}

// ===== PERSISTÊNCIA =====

// 12. Salvar técnicas
function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
    } catch (e) {
        console.error('Erro ao salvar técnicas:', e);
    }
}

// 13. Carregar técnicas
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

// ===== INICIALIZAÇÃO =====

// 14. Configurar event listeners
function configurarEventListeners() {
    // Filtros
    document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
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
            if (e.target === this) fecharModalTecnica();
        });
    }
    
    // Tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') fecharModalTecnica();
    });
    
    // Ouvinte para mudanças nas perícias
    if (window.estadoPericias) {
        // Atualizar quando perícias mudarem
        const originalPush = Array.prototype.push;
        Array.prototype.push = function() {
            const result = originalPush.apply(this, arguments);
            if (this === window.estadoPericias.periciasAprendidas) {
                setTimeout(atualizarTecnicasDisponiveis, 100);
            }
            return result;
        };
    }
}

// 15. Renderizar filtros
function renderizarFiltrosTecnicas() {
    document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filtro === estadoTecnicas.filtroAtivo) {
            btn.classList.add('active');
        }
    });
}

// 16. Inicializar sistema
function inicializarSistemaTecnicas() {
    if (estadoTecnicas.inicializado) return;
    
    carregarTecnicas();
    configurarEventListeners();
    atualizarTecnicasDisponiveis();
    renderizarStatusTecnicas();
    renderizarFiltrosTecnicas();
    renderizarTecnicasAprendidas();
    
    estadoTecnicas.inicializado = true;
    console.log('Sistema de técnicas inicializado');
}

// ===== EXPORTAÇÃO =====
window.fecharModalTecnica = fecharModalTecnica;
window.confirmarTecnica = confirmarTecnica;
window.abrirModalTecnica = abrirModalTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

// Auto-inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Esperar um pouco para garantir que as perícias carregaram
    setTimeout(() => {
        if (document.getElementById('pericias')) {
            inicializarSistemaTecnicas();
        }
    }, 1000);
});
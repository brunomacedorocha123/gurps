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
    tecnicasDisponiveis: []
};

// ===== FUNÇÕES BÁSICAS =====
function calcularCustoTecnica(niveisAcima, dificuldade) {
    if (niveisAcima <= 0) return 0;
    
    if (dificuldade === 'Difícil') {
        if (niveisAcima === 1) return 2;
        if (niveisAcima === 2) return 3;
        if (niveisAcima === 3) return 4;
        if (niveisAcima === 4) return 5;
        return 5 + (niveisAcima - 4);
    }
    
    return 0;
}

function obterNHPericiaPorId(idPericia) {
    if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) return null;
    
    const pericia = window.estadoPericias.periciasAprendidas.find(p => p.id === idPericia);
    if (!pericia) return null;
    
    // Simples para teste
    const atributo = pericia.atributo || 'DX';
    const valorAtributo = 10; // Valor base
    return valorAtributo + (pericia.nivel || 0);
}

function verificarPreRequisitosTecnica(tecnica) {
    if (!tecnica || !tecnica.preRequisitos) {
        return { passou: true, motivo: '' };
    }
    
    for (const prereq of tecnica.preRequisitos) {
        let periciaEncontrada = null;
        
        if (prereq.idPericia) {
            periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => p.id === prereq.idPericia);
        }
        
        if (!periciaEncontrada && prereq.idsCavalgar) {
            periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => 
                prereq.idsCavalgar.includes(p.id)
            );
        }
        
        if (!periciaEncontrada) {
            return { passou: false, motivo: `Falta: ${prereq.nomePericia}` };
        }
        
        if (prereq.nivelMinimo > 0) {
            const nh = obterNHPericiaPorId(periciaEncontrada.id);
            if (nh === null || nh < prereq.nivelMinimo) {
                return { passou: false, motivo: `${prereq.nomePericia} precisa NH ${prereq.nivelMinimo}` };
            }
        }
    }
    
    return { passou: true, motivo: '' };
}

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
    if (!window.catalogoTecnicas || typeof window.catalogoTecnicas.obterTodasTecnicas !== 'function') {
        return;
    }
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    const disponiveis = [];
    
    todasTecnicas.forEach(tecnica => {
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        
        let nhAtual = 0;
        let custoMostrar = 0;
        
        if (jaAprendida) {
            const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(tecnica.id);
            if (tecnicaCatalogo && tecnicaCatalogo.baseCalculo) {
                if (tecnicaCatalogo.baseCalculo.tipo === "pericia") {
                    const nhPericia = obterNHPericiaPorId(tecnicaCatalogo.baseCalculo.idPericia);
                    if (nhPericia !== null) {
                        nhAtual = nhPericia + (tecnicaCatalogo.baseCalculo.redutor || 0) + (jaAprendida.niveisAcimaBase || 0);
                    }
                }
            }
            custoMostrar = jaAprendida.custoPago || 0;
        } else {
            const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(tecnica.id);
            if (tecnicaCatalogo && tecnicaCatalogo.baseCalculo) {
                if (tecnicaCatalogo.baseCalculo.tipo === "pericia") {
                    const nhPericia = obterNHPericiaPorId(tecnicaCatalogo.baseCalculo.idPericia);
                    if (nhPericia !== null) {
                        nhAtual = nhPericia + (tecnicaCatalogo.baseCalculo.redutor || 0);
                    }
                }
            }
            custoMostrar = 0;
        }
        
        disponiveis.push({
            ...tecnica,
            disponivel: verificacao.passou,
            nhAtual: nhAtual,
            custoAtual: custoMostrar,
            jaAprendida: !!jaAprendida,
            motivoIndisponivel: verificacao.motivo
        });
    });
    
    estadoTecnicas.tecnicasDisponiveis = disponiveis;
    renderizarCatalogoTecnicas();
}

// ===== RENDERIZAR CATÁLOGO =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
    let tecnicasFiltradas = estadoTecnicas.tecnicasDisponiveis;
    
    if (estadoTecnicas.filtroAtivo === 'medio-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Média');
    } else if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Difícil');
    }
    
    if (estadoTecnicas.buscaAtiva.trim() !== '') {
        const termo = estadoTecnicas.buscaAtiva.toLowerCase();
        tecnicasFiltradas = tecnicasFiltradas.filter(t => 
            t.nome.toLowerCase().includes(termo) ||
            (t.descricao && t.descricao.toLowerCase().includes(termo))
        );
    }
    
    if (tecnicasFiltradas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia">
                <i class="fas fa-info-circle"></i>
                <div>Nenhuma técnica disponível</div>
                <small>Aprenda as perícias necessárias primeiro</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    tecnicasFiltradas.forEach(tecnica => {
        const disponivel = tecnica.disponivel;
        const jaAprendida = tecnica.jaAprendida;
        
        html += `
            <div class="pericia-item" data-id="${tecnica.id}" data-tipo="tecnica" style="cursor: ${disponivel ? 'pointer' : 'not-allowed'};">
                <div class="pericia-header">
                    <h4 class="pericia-nome">${tecnica.nome} ${jaAprendida ? '✓' : ''}</h4>
                    <div class="pericia-info">
                        <span class="pericia-dificuldade dificuldade-dificil-tecnica">
                            ${tecnica.dificuldade}
                        </span>
                        <span class="pericia-custo">NH ${tecnica.nhAtual}</span>
                    </div>
                </div>
                <p class="pericia-descricao">${tecnica.descricao || ''}</p>
                
                ${!disponivel ? `
                <div class="tecnica-indisponivel">
                    <i class="fas fa-lock"></i> ${tecnica.motivoIndisponivel}
                </div>
                ` : ''}
                
                <div class="pericia-requisitos">
                    <small>
                        <strong>Requer:</strong> Arco 4+, Cavalgar
                    </small>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    document.querySelectorAll('.pericia-item[data-tipo="tecnica"]').forEach(item => {
        if (item.style.cursor === 'pointer') {
            item.addEventListener('click', function() {
                const id = this.dataset.id;
                const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
                if (tecnica && tecnica.disponivel) {
                    abrirModalTecnica(tecnica);
                }
            });
        }
    });
}

// ===== RENDERIZAR TÉCNICAS APRENDIDAS =====
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    if (estadoTecnicas.tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia-aprendida">
                <i class="fas fa-tools"></i>
                <div>Nenhuma técnica aprendida</div>
                <small>Clique em uma técnica disponível para aprender</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(tecnica.id);
        let nhFinal = 0;
        let nhMaximo = Infinity;
        
        if (tecnicaCatalogo && tecnicaCatalogo.baseCalculo) {
            if (tecnicaCatalogo.baseCalculo.tipo === "pericia") {
                const nhPericia = obterNHPericiaPorId(tecnicaCatalogo.baseCalculo.idPericia);
                if (nhPericia !== null) {
                    nhFinal = nhPericia + (tecnicaCatalogo.baseCalculo.redutor || 0) + (tecnica.niveisAcimaBase || 0);
                    
                    if (tecnicaCatalogo.limiteMaximo) {
                        if (tecnicaCatalogo.limiteMaximo.tipo === "pericia") {
                            nhMaximo = obterNHPericiaPorId(tecnicaCatalogo.limiteMaximo.idPericia) || nhFinal;
                        }
                    }
                }
            }
        }
        
        html += `
            <div class="pericia-aprendida-item" data-tipo="tecnica">
                <div class="pericia-aprendida-header">
                    <h4 class="pericia-aprendida-nome">${tecnica.nome}</h4>
                    <div class="pericia-aprendida-info">
                        <span class="pericia-aprendida-nivel">NH ${nhFinal}</span>
                        <span class="pericia-dificuldade dificuldade-dificil-tecnica">
                            ${tecnica.dificuldade}
                        </span>
                        <span class="pericia-aprendida-custo">${tecnica.custoPago || 0} pts</span>
                    </div>
                </div>
                <div class="pericia-requisitos">
                    <small>
                        <strong>Máximo:</strong> NH ${nhMaximo}
                    </small>
                </div>
                <button class="btn-remover-pericia" data-id="${tecnica.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
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

// ===== RENDERIZAR STATUS =====
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

// ===== MODAL =====
function abrirModalTecnica(tecnica) {
    if (!tecnica) return;
    
    const verificacao = verificarPreRequisitosTecnica(tecnica);
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(tecnica.id);
    
    // Calcular base
    let baseAtual = 0;
    if (tecnicaCatalogo && tecnicaCatalogo.baseCalculo) {
        if (tecnicaCatalogo.baseCalculo.tipo === "pericia") {
            const nhPericia = obterNHPericiaPorId(tecnicaCatalogo.baseCalculo.idPericia);
            if (nhPericia !== null) {
                baseAtual = nhPericia + (tecnicaCatalogo.baseCalculo.redutor || 0);
            }
        }
    }
    
    // Calcular limite
    let nhMaximo = Infinity;
    if (tecnicaCatalogo && tecnicaCatalogo.limiteMaximo) {
        if (tecnicaCatalogo.limiteMaximo.tipo === "pericia") {
            nhMaximo = obterNHPericiaPorId(tecnicaCatalogo.limiteMaximo.idPericia) || Infinity;
        }
    }
    
    const niveisAcima = jaAprendida ? jaAprendida.niveisAcimaBase || 0 : 0;
    const nhAtual = baseAtual + niveisAcima;
    
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    const modalContent = document.querySelector('.modal-tecnica');
    
    if (!modalOverlay || !modalContent) return;
    
    modalContent.innerHTML = `
        <div class="modal-header-pericia">
            <span class="modal-close" onclick="fecharModalTecnica()">&times;</span>
            <h3>${tecnica.nome} ${jaAprendida ? '(Aprendida)' : ''}</h3>
            <div class="modal-subtitulo">
                ${tecnica.dificuldade} • Base: NH(Arco) - 4
            </div>
        </div>
        
        <div class="modal-body-pericia">
            <div class="nivel-info-tecnica">
                <div class="info-item-tecnica">
                    <label>Nível Base</label>
                    <div class="info-valor-tecnica">${baseAtual}</div>
                </div>
                <div class="info-item-tecnica">
                    <label>Nível Máximo</label>
                    <div class="info-valor-tecnica">${nhMaximo === Infinity ? '∞' : nhMaximo}</div>
                </div>
                <div class="info-item-tecnica">
                    <label>Nível Atual</label>
                    <div class="info-valor-tecnica">${nhAtual}</div>
                </div>
            </div>
            
            <div class="seletor-nivel-tecnica">
                <label>Selecione o nível desejado:</label>
                <select id="seletor-nh-tecnica" class="select-nivel-tecnica">
                    ${(() => {
                        let options = '';
                        const max = nhMaximo === Infinity ? baseAtual + 10 : nhMaximo;
                        for (let nh = baseAtual; nh <= max; nh++) {
                            const niveisAcimaOpt = nh - baseAtual;
                            const custo = calcularCustoTecnica(niveisAcimaOpt, tecnica.dificuldade);
                            const selected = nh === nhAtual ? 'selected' : '';
                            options += `<option value="${nh}" data-niveis="${niveisAcimaOpt}" data-custo="${custo}" ${selected}>
                                NH ${nh} (${custo} pontos)
                            </option>`;
                        }
                        return options;
                    })()}
                </select>
            </div>
            
            <div class="custo-tecnica-box">
                <div class="custo-tecnica-label">Custo Total</div>
                <div class="custo-tecnica-valor" id="custo-tecnica-valor">0 pontos</div>
            </div>
            
            <div class="detalhes-pericia-descricao">
                <h4>Descrição</h4>
                <p>${tecnica.descricao || ''}</p>
            </div>
            
            <div class="regras-especiais-tecnica">
                <h4><i class="fas fa-info-circle"></i> Regra Especial</h4>
                <p>Não pode exceder o NH da perícia Arco. Permite usar arco eficientemente enquanto cavalga.</p>
            </div>
            
            ${!verificacao.passou ? `
            <div class="tecnica-indisponivel" style="margin-top: 15px;">
                <i class="fas fa-exclamation-triangle"></i> ${verificacao.motivo}
            </div>
            ` : ''}
        </div>
        
        <div class="modal-actions-pericia">
            <button class="btn-modal btn-cancelar" onclick="fecharModalTecnica()">Cancelar</button>
            <button class="btn-modal btn-confirmar" id="btn-confirmar-tecnica" onclick="confirmarTecnica()" 
                ${!verificacao.passou ? 'disabled' : ''}>
                ${jaAprendida ? 'Atualizar' : 'Aprender'}
            </button>
        </div>
    `;
    
    const select = document.getElementById('seletor-nh-tecnica');
    const custoDisplay = document.getElementById('custo-tecnica-valor');
    const btnConfirmar = document.getElementById('btn-confirmar-tecnica');
    
    function atualizarCusto() {
        const selectedOption = select.options[select.selectedIndex];
        const custo = parseInt(selectedOption.dataset.custo);
        const niveis = parseInt(selectedOption.dataset.niveis);
        custoDisplay.textContent = `${custo} pontos`;
        
        if (jaAprendida) {
            const custoAtual = jaAprendida.custoPago || 0;
            if (niveis === jaAprendida.niveisAcimaBase) {
                btnConfirmar.textContent = `Manter (0 pontos)`;
                btnConfirmar.disabled = true;
            } else {
                const diferenca = custo - custoAtual;
                if (diferenca > 0) {
                    btnConfirmar.textContent = `Melhorar (+${diferenca} pontos)`;
                } else {
                    btnConfirmar.textContent = `Reduzir (${diferenca} pontos)`;
                }
                btnConfirmar.disabled = false;
            }
        } else {
            btnConfirmar.textContent = `Aprender (${custo} pontos)`;
        }
    }
    
    select.addEventListener('change', atualizarCusto);
    atualizarCusto();
    
    modalOverlay.style.display = 'block';
    
    window.tecnicaModalData = {
        tecnica: tecnica,
        jaAprendida: jaAprendida,
        tecnicaCatalogo: tecnicaCatalogo
    };
}

function confirmarTecnica() {
    if (!window.tecnicaModalData) return;
    
    const { tecnica, jaAprendida } = window.tecnicaModalData;
    const select = document.getElementById('seletor-nh-tecnica');
    
    if (!select) return;
    
    const nhEscolhido = parseInt(select.value);
    const selectedOption = select.options[select.selectedIndex];
    const niveisAcima = parseInt(selectedOption.dataset.niveis);
    const custo = parseInt(selectedOption.dataset.custo);
    
    if (jaAprendida && niveisAcima === jaAprendida.niveisAcimaBase) {
        fecharModalTecnica();
        return;
    }
    
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnica.id);
    
    if (index >= 0) {
        estadoTecnicas.tecnicasAprendidas[index] = {
            ...estadoTecnicas.tecnicasAprendidas[index],
            niveisAcimaBase: niveisAcima,
            custoPago: custo
        };
    } else {
        estadoTecnicas.tecnicasAprendidas.push({
            id: tecnica.id,
            nome: tecnica.nome,
            descricao: tecnica.descricao,
            dificuldade: tecnica.dificuldade,
            preRequisitos: tecnica.preRequisitos,
            niveisAcimaBase: niveisAcima,
            custoPago: custo,
            dataAprendizado: new Date().toISOString()
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

function fecharModalTecnica() {
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
    window.tecnicaModalData = null;
}

// ===== FUNÇÕES DE PERSISTÊNCIA =====
function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
    } catch (e) {}
}

function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
        }
    } catch (e) {
        estadoTecnicas.tecnicasAprendidas = [];
    }
}

// ===== CONFIGURAÇÃO =====
function configurarEventListeners() {
    // Filtros
    document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
        btn.addEventListener('click', function() {
            estadoTecnicas.filtroAtivo = this.dataset.filtro;
            renderizarFiltros();
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
    
    // Fechar modal
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModalTecnica();
            }
        });
    }
    
    // ESC para fechar
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fecharModalTecnica();
        }
    });
}

function renderizarFiltros() {
    document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filtro === estadoTecnicas.filtroAtivo) {
            btn.classList.add('active');
        }
    });
}

// ===== INICIALIZAÇÃO =====
function inicializarSistemaTecnicas() {
    console.log("Inicializando técnicas...");
    
    // 1. Carregar dados salvos
    carregarTecnicas();
    
    // 2. Configurar eventos
    configurarEventListeners();
    
    // 3. Renderizar tudo
    atualizarTecnicasDisponiveis();
    renderizarStatusTecnicas();
    renderizarFiltros();
    renderizarTecnicasAprendidas();
    
    console.log("✅ Sistema de técnicas inicializado!");
}

// ===== EXPORT =====
window.fecharModalTecnica = fecharModalTecnica;
window.confirmarTecnica = confirmarTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const abaPericias = document.getElementById('pericias');
        
        if (abaPericias) {
            // Se a aba já estiver visível
            if (window.getComputedStyle(abaPericias).display !== 'none') {
                inicializarSistemaTecnicas();
            }
            
            // Observar mudanças
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (window.getComputedStyle(abaPericias).display !== 'none') {
                            setTimeout(inicializarSistemaTecnicas, 100);
                        }
                    }
                });
            });
            
            observer.observe(abaPericias, { 
                attributes: true, 
                attributeFilter: ['style'] 
            });
        }
    }, 500);
});

// ===== INICIALIZAÇÃO SEGURA DAS TÉCNICAS =====
function inicializarSistemaTecnicasComSeguranca() {
    if (
        window.estadoPericias &&
        Array.isArray(window.estadoPericias.periciasAprendidas) &&
        window.catalogoTecnicas &&
        typeof window.catalogoTecnicas.obterTodasTecnicas === 'function' &&
        typeof window.obterDadosAtributos === 'function'
    ) {
        if (!window.tecnicasIniciadas) {
            window.tecnicasIniciadas = true;
            console.log("✅ Sistema de Técnicas inicializado com sucesso!");
            window.inicializarSistemaTecnicas();
        }
    } else {
        setTimeout(inicializarSistemaTecnicasComSeguranca, 600);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver(() => {
        const aba = document.getElementById('pericias');
        if (aba && aba.classList.contains('active')) {
            inicializarSistemaTecnicasComSeguranca();
        }
    });
    document.querySelectorAll('.tab-content').forEach(tab => {
        observer.observe(tab, { attributes: true, attributeFilter: ['class'] });
    });
});
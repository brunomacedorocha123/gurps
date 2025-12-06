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

// ===== TABELA DE CUSTO =====
function calcularCustoTecnica(niveisAcima, dificuldade) {
    if (niveisAcima <= 0) return 0;
    
    if (dificuldade === 'Difícil') {
        if (niveisAcima === 1) return 2;
        if (niveisAcima === 2) return 3;
        if (niveisAcima === 3) return 4;
        if (niveisAcima === 4) return 5;
        return 5 + (niveisAcima - 4);
    }
    
    if (dificuldade === 'Média') {
        if (niveisAcima <= 4) return niveisAcima;
        return 4 + (niveisAcima - 4);
    }
    
    return 0;
}

// ===== OBTER NH DA PERÍCIA =====
function obterNHPericiaAtual(idPericia) {
    if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) return 0;
    
    const pericia = window.estadoPericias.periciasAprendidas.find(p => p.id === idPericia);
    if (!pericia) return 0;
    
    let atributoBase = 10;
    if (window.obterAtributoAtual) {
        atributoBase = window.obterAtributoAtual(pericia.atributo);
    } else {
        const atributosSalvos = JSON.parse(localStorage.getItem('atributosPersonagem') || '{}');
        atributoBase = atributosSalvos[pericia.atributo] || 10;
    }
    
    return atributoBase + (pericia.nivel || 0);
}

// ===== VERIFICAR PRÉ-REQUISITOS =====
function verificarPreRequisitosTecnica(tecnica) {
    if (!tecnica || !tecnica.preRequisitos) {
        return { passou: false, motivo: "Técnica inválida" };
    }
    
    for (const prereq of tecnica.preRequisitos) {
        let periciaEncontrada = null;
        
        if (prereq.idPericia) {
            periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => p.id === prereq.idPericia);
        }
        
        if (!periciaEncontrada && prereq.idsCavalgar) {
            periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => prereq.idsCavalgar.includes(p.id));
        }
        
        if (!periciaEncontrada && prereq.nomePericia) {
            const nomeBusca = prereq.nomePericia.toLowerCase();
            periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => 
                p.nome && p.nome.toLowerCase().includes(nomeBusca)
            );
        }
        
        if (!periciaEncontrada) {
            return { passou: false, motivo: `Falta: ${prereq.nomePericia}` };
        }
        
        if (prereq.nivelMinimo > 0) {
            const nh = obterNHPericiaAtual(periciaEncontrada.id);
            if (nh < prereq.nivelMinimo) {
                return { passou: false, motivo: `${prereq.nomePericia} precisa NH ${prereq.nivelMinimo} (tem ${nh})` };
            }
        }
    }
    
    return { passou: true, motivo: '' };
}

// ===== CALCULAR NH BASE E MÁXIMO =====
function calcularNHBaseTecnica(tecnica) {
    if (!tecnica.preRequisitos || tecnica.preRequisitos.length === 0) return 0;
    
    const prereq = tecnica.preRequisitos[0];
    let periciaAprendida = null;
    
    if (prereq.idPericia) {
        periciaAprendida = window.estadoPericias.periciasAprendidas.find(p => p.id === prereq.idPericia);
    }
    
    if (!periciaAprendida && prereq.idsCavalgar) {
        periciaAprendida = window.estadoPericias.periciasAprendidas.find(p => prereq.idsCavalgar.includes(p.id));
    }
    
    if (!periciaAprendida) return 0;
    
    const nhPericia = obterNHPericiaAtual(periciaAprendida.id);
    return Math.max(0, nhPericia - 4);
}

function calcularNHMaximoTecnica(tecnica) {
    if (!tecnica.preRequisitos || tecnica.preRequisitos.length === 0) return 0;
    
    const prereq = tecnica.preRequisitos[0];
    let periciaAprendida = null;
    
    if (prereq.idPericia) {
        periciaAprendida = window.estadoPericias.periciasAprendidas.find(p => p.id === prereq.idPericia);
    }
    
    if (!periciaAprendida && prereq.idsCavalgar) {
        periciaAprendida = window.estadoPericias.periciasAprendidas.find(p => prereq.idsCavalgar.includes(p.id));
    }
    
    if (!periciaAprendida) return 0;
    
    return obterNHPericiaAtual(periciaAprendida.id);
}

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
    if (!window.catalogoTecnicas || !window.catalogoTecnicas.obterTodasTecnicas) return;
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    const disponiveis = [];
    
    todasTecnicas.forEach(tecnica => {
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        const nhBase = calcularNHBaseTecnica(tecnica);
        const nhMaximo = calcularNHMaximoTecnica(tecnica);
        
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        let nhAtual = jaAprendida ? jaAprendida.nhAtual : nhBase;
        
        // CORREÇÃO: Ajusta nhAtual se exceder nhMaximo
        if (nhAtual > nhMaximo) {
            nhAtual = nhMaximo;
            if (jaAprendida) {
                jaAprendida.nhAtual = nhMaximo;
            }
        }
        
        const niveisAcima = Math.max(0, nhAtual - nhBase);
        const custo = calcularCustoTecnica(niveisAcima, tecnica.dificuldade);
        
        // Atualiza custo na técnica aprendida
        if (jaAprendida) {
            jaAprendida.custoPago = custo;
        }
        
        disponiveis.push({
            ...tecnica,
            disponivel: verificacao.passou,
            nhBase: nhBase,
            nhMaximo: nhMaximo,
            nhAtual: nhAtual,
            custoAtual: custo,
            jaAprendida: !!jaAprendida,
            motivoIndisponivel: verificacao.motivo
        });
    });
    
    estadoTecnicas.tecnicasDisponiveis = disponiveis;
    renderizarCatalogoTecnicas();
}

// ===== MONITORAR MUDANÇAS =====
let ultimoEstadoPericias = '';
let ultimoEstadoAtributos = '';

function monitorarMudancas() {
    function obterHashEstado() {
        const estadoPericias = window.estadoPericias ? JSON.stringify(window.estadoPericias.periciasAprendidas) : '';
        let estadoAtributos = '';
        
        if (window.obterAtributoAtual) {
            const atributos = ['dx', 'iq', 'ht', 'perc'];
            estadoAtributos = atributos.map(a => window.obterAtributoAtual(a)).join(',');
        } else {
            const atributosSalvos = JSON.parse(localStorage.getItem('atributosPersonagem') || '{}');
            estadoAtributos = JSON.stringify(atributosSalvos);
        }
        
        return estadoPericias + '|' + estadoAtributos;
    }
    
    setInterval(() => {
        const estadoAtual = obterHashEstado();
        
        if (estadoAtual !== ultimoEstadoPericias + '|' + ultimoEstadoAtributos) {
            ultimoEstadoPericias = window.estadoPericias ? JSON.stringify(window.estadoPericias.periciasAprendidas) : '';
            ultimoEstadoAtributos = estadoAtual.split('|')[1];
            
            // Atualiza NH das técnicas aprendidas
            estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
                const nhMaximo = calcularNHMaximoTecnica(tecnica);
                const nhBase = calcularNHBaseTecnica(tecnica);
                
                if (tecnica.nhAtual > nhMaximo) {
                    tecnica.nhAtual = nhMaximo;
                }
                if (tecnica.nhAtual < nhBase) {
                    tecnica.nhAtual = nhBase;
                }
                
                const niveisAcima = Math.max(0, tecnica.nhAtual - nhBase);
                tecnica.custoPago = calcularCustoTecnica(niveisAcima, tecnica.dificuldade);
            });
            
            salvarTecnicas();
            atualizarTecnicasDisponiveis();
            renderizarStatusTecnicas();
            renderizarTecnicasAprendidas();
        }
    }, 300);
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
                <div>Aprenda perícias primeiro</div>
                <small>As técnicas aparecerão aqui quando você tiver as perícias necessárias</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    tecnicasFiltradas.forEach(tecnica => {
        const disponivel = tecnica.disponivel;
        const jaAprendida = tecnica.jaAprendida;
        const classe = 'pericia-item';
        
        html += `
            <div class="${classe}" data-id="${tecnica.id}" style="cursor: pointer;">
                <div class="pericia-header">
                    <h4 class="pericia-nome">${tecnica.nome} ${jaAprendida ? '✓' : ''}</h4>
                    <div class="pericia-info">
                        <span class="pericia-dificuldade dificuldade-${tecnica.dificuldade.toLowerCase()}">
                            ${tecnica.dificuldade}
                        </span>
                        <span class="pericia-custo">NH ${tecnica.nhAtual}</span>
                    </div>
                </div>
                <p class="pericia-descricao">${tecnica.descricao || ''}</p>
                
                ${!disponivel ? `
                <div class="tecnica-indisponivel-badge">
                    <i class="fas fa-lock"></i> ${tecnica.motivoIndisponivel}
                </div>
                ` : `
                <div class="pericia-requisitos">
                    <small>
                        <strong>${jaAprendida ? 'Nível Atual' : 'Nível Base'}:</strong> 
                        NH ${tecnica.nhAtual} | 
                        <strong>Máximo:</strong> NH ${tecnica.nhMaximo}
                    </small>
                </div>
                `}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    document.querySelectorAll('.pericia-item[data-id]').forEach(item => {
        item.addEventListener('click', function() {
            const id = this.dataset.id;
            const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
            if (tecnica && tecnica.disponivel) abrirModalTecnica(tecnica);
        });
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
                <small>As técnicas que você aprender aparecerão aqui</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        const periciaBase = tecnica.preRequisitos && tecnica.preRequisitos[0] ? tecnica.preRequisitos[0].nomePericia : 'Técnica';
        const nhMaximo = calcularNHMaximoTecnica(tecnica);
        
        html += `
            <div class="pericia-aprendida-item">
                <div class="pericia-aprendida-header">
                    <h4 class="pericia-aprendida-nome">${tecnica.nome}</h4>
                    <div class="pericia-aprendida-info">
                        <span class="pericia-aprendida-nivel">NH ${tecnica.nhAtual}</span>
                        <span class="pericia-dificuldade dificuldade-${tecnica.dificuldade.toLowerCase()}">
                            ${tecnica.dificuldade}
                        </span>
                        <span class="pericia-aprendida-custo">${tecnica.custoPago} pts</span>
                    </div>
                </div>
                <div class="pericia-requisitos">
                    <small>
                        <strong>Base:</strong> ${periciaBase}-4 | 
                        <strong>Máximo Atual:</strong> NH ${nhMaximo}
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

// ===== ABRIR MODAL =====
function abrirModalTecnica(tecnica) {
    if (!tecnica) return;
    
    const verificacao = verificarPreRequisitosTecnica(tecnica);
    const nhBase = calcularNHBaseTecnica(tecnica);
    const nhMaximo = calcularNHMaximoTecnica(tecnica);
    
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    const nhAtual = jaAprendida ? jaAprendida.nhAtual : nhBase;
    
    const periciaBase = tecnica.preRequisitos && tecnica.preRequisitos[0] ? tecnica.preRequisitos[0].nomePericia : 'Técnica';
    
    const modal = document.querySelector('.modal-tecnica');
    if (!modal) return;
    
    modal.innerHTML = `
        <div class="modal-header-pericia">
            <span class="modal-close" onclick="fecharModalTecnica()">&times;</span>
            <h3>${tecnica.nome} ${jaAprendida ? '(Aprendida)' : ''}</h3>
            <div class="modal-subtitulo">
                ${tecnica.dificuldade} • Base: ${periciaBase}-4
            </div>
        </div>
        
        <div class="modal-body-pericia">
            <div class="nivel-selecao-container">
                <div class="nivel-info-box">
                    <div class="nivel-info-item">
                        <label>Nível Base:</label>
                        <div class="nivel-valor-grande">${nhBase}</div>
                    </div>
                    <div class="nivel-info-item">
                        <label>Nível Máximo:</label>
                        <div class="nivel-valor-grande">${nhMaximo}</div>
                    </div>
                    <div class="nivel-info-item">
                        <label>Nível Atual:</label>
                        <div class="nivel-valor-grande">${nhAtual}</div>
                    </div>
                </div>
                
                <div class="seletor-nivel-tecnica">
                    <label>Selecione o NH desejado (${nhBase} a ${nhMaximo}):</label>
                    <select id="seletor-nh-tecnica" class="select-nivel">
                        ${(() => {
                            let options = '';
                            for (let nh = nhBase; nh <= nhMaximo; nh++) {
                                const niveisAcima = nh - nhBase;
                                const custo = calcularCustoTecnica(niveisAcima, tecnica.dificuldade);
                                const selected = nh === nhAtual ? 'selected' : '';
                                options += `<option value="${nh}" data-custo="${custo}" ${selected}>NH ${nh} (${custo} pontos)</option>`;
                            }
                            return options;
                        })()}
                    </select>
                </div>
                
                <div class="custo-final-box">
                    <div class="custo-final-label">Custo Total:</div>
                    <div class="custo-final-valor" id="custo-final-tecnica">0 pontos</div>
                </div>
            </div>
            
            <div class="detalhes-pericia-descricao">
                <h4>Descrição</h4>
                <p>${tecnica.descricao || ''}</p>
            </div>
            
            <div class="detalhes-pericia-default">
                <strong>Pré-requisitos:</strong> ${tecnica.preRequisitos.map(p => `${p.nomePericia} ${p.nivelMinimo}+`).join(', ')}
            </div>
            
            ${!verificacao.passou ? `
            <div class="detalhes-pericia-default" style="background: rgba(231, 76, 60, 0.1); border-left-color: #e74c3c;">
                <strong><i class="fas fa-exclamation-triangle"></i> Não pode aprender:</strong><br>
                ${verificacao.motivo}
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
    const custoDisplay = document.getElementById('custo-final-tecnica');
    const btnConfirmar = document.getElementById('btn-confirmar-tecnica');
    
    function atualizarCustoDisplay() {
        const selectedOption = select.options[select.selectedIndex];
        const custo = parseInt(selectedOption.dataset.custo);
        custoDisplay.textContent = `${custo} pontos`;
        
        const nhEscolhido = parseInt(select.value);
        
        if (jaAprendida) {
            const custoAtual = jaAprendida.custoPago || 0;
            if (nhEscolhido === jaAprendida.nhAtual) {
                btnConfirmar.textContent = `Manter (0 pontos)`;
                btnConfirmar.disabled = true;
            } else {
                const diferenca = custo - custoAtual;
                btnConfirmar.textContent = diferenca > 0 ? 
                    `Melhorar (+${diferenca} pontos)` : 
                    `Reduzir (${diferenca} pontos)`;
                btnConfirmar.disabled = false;
            }
        } else {
            btnConfirmar.textContent = `Aprender (${custo} pontos)`;
        }
    }
    
    select.addEventListener('change', atualizarCustoDisplay);
    atualizarCustoDisplay();
    
    document.querySelector('.modal-tecnica-overlay').style.display = 'block';
    
    window.tecnicaModalData = {
        tecnica: tecnica,
        nhBase: nhBase,
        nhMaximo: nhMaximo,
        jaAprendida: jaAprendida
    };
}

// ===== CONFIRMAR TÉCNICA =====
function confirmarTecnica() {
    if (!window.tecnicaModalData) return;
    
    const { tecnica, jaAprendida, nhBase } = window.tecnicaModalData;
    const select = document.getElementById('seletor-nh-tecnica');
    const nhEscolhido = parseInt(select.value);
    const niveisAcima = nhEscolhido - nhBase;
    const custo = calcularCustoTecnica(niveisAcima, tecnica.dificuldade);
    
    if (jaAprendida && nhEscolhido === jaAprendida.nhAtual) {
        fecharModalTecnica();
        return;
    }
    
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnica.id);
    
    if (index >= 0) {
        estadoTecnicas.tecnicasAprendidas[index] = {
            ...estadoTecnicas.tecnicasAprendidas[index],
            nhAtual: nhEscolhido,
            custoPago: custo
        };
    } else {
        const periciaBase = tecnica.preRequisitos && tecnica.preRequisitos[0] ? tecnica.preRequisitos[0].nomePericia : 'Técnica';
        
        estadoTecnicas.tecnicasAprendidas.push({
            id: tecnica.id,
            nome: tecnica.nome,
            descricao: tecnica.descricao,
            dificuldade: tecnica.dificuldade,
            preRequisitos: tecnica.preRequisitos,
            periciaBase: periciaBase,
            nhAtual: nhEscolhido,
            custoPago: custo
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

// ===== FUNÇÕES AUXILIARES =====
function fecharModalTecnica() {
    document.querySelector('.modal-tecnica-overlay').style.display = 'none';
    window.tecnicaModalData = null;
}

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
    } catch (e) {}
}

function configurarEventListenersTecnicas() {
    const filtroButtons = document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]');
    filtroButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            estadoTecnicas.filtroAtivo = this.dataset.filtro;
            renderizarFiltrosTecnicas();
            renderizarCatalogoTecnicas();
        });
    });
    
    const buscaInput = document.getElementById('busca-tecnicas');
    if (buscaInput) {
        buscaInput.addEventListener('input', function() {
            estadoTecnicas.buscaAtiva = this.value;
            renderizarCatalogoTecnicas();
        });
    }
    
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModalTecnica();
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fecharModalTecnica();
        }
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

// ===== INICIALIZAR =====
function inicializarSistemaTecnicas() {
    carregarTecnicas();
    configurarEventListenersTecnicas();
    atualizarTecnicasDisponiveis();
    renderizarStatusTecnicas();
    renderizarFiltrosTecnicas();
    renderizarTecnicasAprendidas();
    monitorarMudancas();
}

// ===== EXPORTAR =====
window.fecharModalTecnica = fecharModalTecnica;
window.confirmarTecnica = confirmarTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const abaPericias = document.getElementById('pericias');
        
        if (abaPericias) {
            if (abaPericias.style.display !== 'none') {
                inicializarSistemaTecnicas();
            }
            
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (abaPericias.style.display !== 'none') {
                            setTimeout(inicializarSistemaTecnicas, 300);
                        }
                    }
                });
            });
            
            observer.observe(abaPericias, { attributes: true, attributeFilter: ['style'] });
        }
    }, 1000);
});
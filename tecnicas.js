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

// ===== TABELA DE CUSTO PARA TÉCNICAS =====
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

// ===== FUNÇÃO PARA OBTER NH DA PERÍCIA =====
function obterAtributoAtual(atributo) {
    const dadosAtributos = window.obterDadosAtributos ? window.obterDadosAtributos() : null;
    if (dadosAtributos) {
        switch(atributo) {
            case 'DX': return dadosAtributos.DX || 10;
            case 'IQ': return dadosAtributos.IQ || 10;
            case 'HT': return dadosAtributos.HT || 10;
            case 'PERC': 
                const iq = dadosAtributos.IQ || 10;
                const bonusPercepcao = dadosAtributos.Bonus ? dadosAtributos.Bonus.Percepcao || 0 : 0;
                return iq + bonusPercepcao;
            default: return 10;
        }
    }
    return 10;
}

// ===== OBTÉM NH DA PERÍCIA PELO ID =====
function obterNHPericiaPorId(idPericia) {
    if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) return null;
    const pericia = window.estadoPericias.periciasAprendidas.find(p => p.id === idPericia);
    if (!pericia) return null;
    const atributoBase = obterAtributoAtual(pericia.atributo);
    return atributoBase + (pericia.nivel || 0);
}

// ===== CALCULA NH DA TÉCNICA =====
function calcularNHAtualDaTecnica(tecnicaAprendida) {
    const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(tecnicaAprendida.id);
    if (!tecnicaCatalogo || !tecnicaCatalogo.baseCalculo) return 0;

    const baseCalc = tecnicaCatalogo.baseCalculo;
    let baseTecnica = 0;

    if (baseCalc.tipo === "pericia") {
        const nhPericia = obterNHPericiaPorId(baseCalc.idPericia);
        if (nhPericia === null) return 0;
        baseTecnica = nhPericia + (baseCalc.redutor || 0);
    } else if (baseCalc.tipo === "atributo") {
        const valorAtributo = obterAtributoAtual(baseCalc.atributo);
        baseTecnica = valorAtributo + (baseCalc.bonus || 0);
    } else {
        return 0;
    }

    const niveisAcima = tecnicaAprendida.niveisAcimaBase || 0;
    let nhTecnica = baseTecnica + niveisAcima;

    if (tecnicaCatalogo.limiteMaximo) {
        const limite = tecnicaCatalogo.limiteMaximo;
        let nhMaximo = Infinity;
        if (limite.tipo === "pericia") {
            nhMaximo = obterNHPericiaPorId(limite.idPericia) || Infinity;
        } else if (limite.tipo === "fixo") {
            nhMaximo = limite.valor || Infinity;
        }
        nhTecnica = Math.min(nhTecnica, nhMaximo);
    }

    return Math.max(0, nhTecnica);
}

// ===== VERIFICA PRÉ-REQUISITOS =====
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
            const nh = obterNHPericiaPorId(periciaEncontrada.id);
            if (nh === null || nh < prereq.nivelMinimo) {
                return { passou: false, motivo: `${prereq.nomePericia} precisa NH ${prereq.nivelMinimo} (tem ${nh || 0})` };
            }
        }
    }
    
    return { passou: true, motivo: '' };
}

// ===== ATUALIZA LISTA DE TÉCNICAS DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
    if (!window.catalogoTecnicas || !window.catalogoTecnicas.obterTodasTecnicas) return;
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    const disponiveis = [];
    
    todasTecnicas.forEach(tecnica => {
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        
        let nhAtual = 0;
        if (jaAprendida) {
            nhAtual = calcularNHAtualDaTecnica(jaAprendida);
        } else {
            // Para nova técnica, usa base atual + 0 níveis
            const nhPericiaBase = obterNHPericiaPorId(tecnica.baseCalculo?.idPericia) || 0;
            nhAtual = nhPericiaBase + (tecnica.baseCalculo?.redutor || 0);
        }
        
        disponiveis.push({
            ...tecnica,
            disponivel: verificacao.passou,
            nhAtual: nhAtual,
            jaAprendida: !!jaAprendida,
            motivoIndisponivel: verificacao.motivo
        });
    });
    
    estadoTecnicas.tecnicasDisponiveis = disponiveis;
    renderizarCatalogoTecnicas();
}

// ===== RENDERIZA CATÁLOGO DE TÉCNICAS =====
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
    
    container.innerHTML = '';
    tecnicasFiltradas.forEach(tecnica => {
        const disponivel = tecnica.disponivel;
        const jaAprendida = tecnica.jaAprendida;
        
        const item = document.createElement('div');
        item.className = `pericia-item ${!disponivel ? 'item-indisponivel' : ''}`;
        item.dataset.id = tecnica.id;
        item.style.cursor = disponivel ? 'pointer' : 'not-allowed';
        
        let html = `
            <div class="pericia-header">
                <h4 class="pericia-nome">${tecnica.nome} ${jaAprendida ? '✓' : ''}</h4>
                <div class="pericia-info">
                    <span class="pericia-dificuldade dificuldade-${tecnica.dificuldade.toLowerCase()}">
                        ${tecnica.dificuldade}
                    </span>
                    ${disponivel ? `<span class="pericia-custo">NH ${tecnica.nhAtual}</span>` : ''}
                </div>
            </div>
            <p class="pericia-descricao">${tecnica.descricao || ''}</p>
        `;
        
        if (!disponivel) {
            html += `
            <div class="tecnica-indisponivel-badge">
                <i class="fas fa-lock"></i> ${tecnica.motivoIndisponivel}
            </div>
            `;
        } else {
            html += `
            <div class="pericia-requisitos">
                <small><strong>${jaAprendida ? 'Nível Atual' : 'Base'}</strong>: NH ${tecnica.nhAtual}</small>
            </div>
            `;
        }
        
        item.innerHTML = html;
        
        if (disponivel) {
            item.addEventListener('click', () => {
                abrirModalTecnica(tecnica);
            });
        }
        
        container.appendChild(item);
    });
}

// ===== RENDERIZA TÉCNICAS APRENDIDAS =====
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
        const nhFinal = calcularNHAtualDaTecnica(tecnica);
        
        const item = document.createElement('div');
        item.className = 'pericia-aprendida-item';
        item.dataset.tipo = 'tecnica';
        
        const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(tecnica.id);
        let nhMaximo = nhFinal;
        if (tecnicaCatalogo && tecnicaCatalogo.limiteMaximo && tecnicaCatalogo.limiteMaximo.tipo === "pericia") {
            nhMaximo = obterNHPericiaPorId(tecnicaCatalogo.limiteMaximo.idPericia) || nhFinal;
        }
        
        item.innerHTML = `
            <div class="pericia-aprendida-header">
                <h4 class="pericia-aprendida-nome">${tecnica.nome}</h4>
                <div class="pericia-aprendida-info">
                    <span class="pericia-aprendida-nivel">NH ${nhFinal}</span>
                    <span class="pericia-dificuldade dificuldade-${tecnica.dificuldade.toLowerCase()}">
                        ${tecnica.dificuldade}
                    </span>
                    <span class="pericia-aprendida-custo">${tecnica.custoPago} pts</span>
                </div>
            </div>
            <div class="pericia-requisitos">
                <small><strong>Máximo:</strong> NH ${nhMaximo}</small>
            </div>
            <button class="btn-remover-pericia" data-id="${tecnica.id}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        const btnRemover = item.querySelector('.btn-remover-pericia');
        btnRemover.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Remover esta técnica? Os pontos serão perdidos.')) {
                estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== tecnica.id);
                salvarTecnicas();
                renderizarStatusTecnicas();
                renderizarTecnicasAprendidas();
                atualizarTecnicasDisponiveis();
            }
        });
        
        container.appendChild(item);
    });
}

// ===== RENDERIZA STATUS =====
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

// ===== ABRIR MODAL =====
function abrirModalTecnica(tecnica) {
    if (!tecnica) return;
    
    const verificacao = verificarPreRequisitosTecnica(tecnica);
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    
    // Calcular base atual
    let baseAtual = 0;
    if (tecnica.baseCalculo && tecnica.baseCalculo.tipo === "pericia") {
        const nhPericia = obterNHPericiaPorId(tecnica.baseCalculo.idPericia);
        if (nhPericia !== null) {
            baseAtual = nhPericia + (tecnica.baseCalculo.redutor || 0);
        }
    }
    
    const niveisAcima = jaAprendida ? jaAprendida.niveisAcimaBase || 0 : 0;
    const nhAtual = baseAtual + niveisAcima;
    
    // Determinar limite máximo (para Arquearia Montada = NH de Arco)
    let nhMaximo = nhAtual;
    if (tecnica.limiteMaximo && tecnica.limiteMaximo.tipo === "pericia") {
        const limiteNh = obterNHPericiaPorId(tecnica.limiteMaximo.idPericia);
        if (limiteNh !== null) nhMaximo = limiteNh;
    }
    
    const modal = document.querySelector('.modal-tecnica');
    if (!modal) return;
    
    // Gerar opções de NH
    let options = '';
    for (let nh = baseAtual; nh <= nhMaximo; nh++) {
        const niveisAcimaOpt = nh - baseAtual;
        const custo = calcularCustoTecnica(niveisAcimaOpt, tecnica.dificuldade);
        const selected = nh === nhAtual ? 'selected' : '';
        options += `<option value="${nh}" data-niveis-acima="${niveisAcimaOpt}" data-custo="${custo}" ${selected}>NH ${nh} (${custo} pts)</option>`;
    }
    
    modal.innerHTML = `
        <div class="modal-header-pericia">
            <span class="modal-close" onclick="fecharModalTecnica()">&times;</span>
            <h3>${tecnica.nome} ${jaAprendida ? '(Aprendida)' : ''}</h3>
            <div class="modal-subtitulo">
                ${tecnica.dificuldade} • Base: NH ${baseAtual}
            </div>
        </div>
        <div class="modal-body-pericia">
            <div class="nivel-selecao-container">
                <div class="nivel-info-box">
                    <div class="nivel-info-item">
                        <label>Nível Base:</label>
                        <div class="nivel-valor-grande">${baseAtual}</div>
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
                    <label>Selecione o NH desejado (${baseAtual} a ${nhMaximo}):</label>
                    <select id="seletor-nh-tecnica" class="select-nivel">
                        ${options}
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
                <strong>Pré-requisitos:</strong> ${tecnica.preRequisitos.map(p => `${p.nomePericia} NH ${p.nivelMinimo}+`).join(', ')}
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
            <button class="btn-modal btn-confirmar" id="btn-confirmar-tecnica" 
                ${!verificacao.passou ? 'disabled' : ''}>
                ${jaAprendida ? 'Atualizar' : 'Aprender'}
            </button>
        </div>
    `;
    
    const select = document.getElementById('seletor-nh-tecnica');
    const custoDisplay = document.getElementById('custo-final-tecnica');
    const btnConfirmar = document.getElementById('btn-confirmar-tecnica');
    
    function atualizarCustoDisplay() {
        const selectedOption = select.selectedOptions[0];
        if (!selectedOption) return;
        const custo = parseInt(selectedOption.dataset.custo);
        const niveisAcimaOpt = parseInt(selectedOption.dataset.niveisAcima);
        custoDisplay.textContent = `${custo} pontos`;
        
        if (jaAprendida) {
            const custoAtual = jaAprendida.custoPago || 0;
            if (niveisAcimaOpt === jaAprendida.niveisAcimaBase) {
                btnConfirmar.textContent = `Manter (0 pts)`;
                btnConfirmar.disabled = true;
            } else {
                const diferenca = custo - custoAtual;
                if (diferenca > 0) {
                    btnConfirmar.textContent = `Melhorar (+${diferenca} pts)`;
                } else {
                    btnConfirmar.textContent = `Reduzir (${diferenca} pts)`;
                }
                btnConfirmar.disabled = false;
            }
        } else {
            btnConfirmar.textContent = `Aprender (${custo} pts)`;
        }
    }
    
    select.addEventListener('change', atualizarCustoDisplay);
    atualizarCustoDisplay();
    window.tecnicaModalData = { tecnica, jaAprendida };
    document.querySelector('.modal-tecnica-overlay').style.display = 'block';
}

// ===== CONFIRMAR COMPRA/EDIÇÃO =====
function confirmarTecnica() {
    if (!window.tecnicaModalData) return;
    
    const { tecnica, jaAprendida } = window.tecnicaModalData;
    const select = document.getElementById('seletor-nh-tecnica');
    const nhEscolhido = parseInt(select.value);
    
    let baseNoMomento = 0;
    if (tecnica.baseCalculo && tecnica.baseCalculo.tipo === "pericia") {
        const nhPericia = obterNHPericiaPorId(tecnica.baseCalculo.idPericia);
        if (nhPericia !== null) {
            baseNoMomento = nhPericia + (tecnica.baseCalculo.redutor || 0);
        }
    }
    
    const niveisAcima = nhEscolhido - baseNoMomento;
    const custo = calcularCustoTecnica(niveisAcima, tecnica.dificuldade);
    
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
            custoPago: custo
        });
    }
    
    fecharModalTecnica();
    salvarTecnicas();
    renderizarStatusTecnicas();
    renderizarTecnicasAprendidas();
    atualizarTecnicasDisponiveis();
}

// ===== AUXILIARES =====
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

// ===== MONITORAMENTO EM TEMPO REAL =====
function configurarMonitoramento() {
    // Ouvir mudanças nos atributos
    document.addEventListener('atributosAlterados', () => {
        atualizarTecnicasDisponiveis();
        renderizarTecnicasAprendidas();
        renderizarStatusTecnicas();
    });
    
    // Observar mudanças nas perícias (polling seguro)
    let ultimasPericias = '';
    setInterval(() => {
        if (!window.estadoPericias?.periciasAprendidas) return;
        const periciasAtuais = JSON.stringify(window.estadoPericias.periciasAprendidas);
        if (periciasAtuais !== ultimasPericias) {
            ultimasPericias = periciasAtuais;
            atualizarTecnicasDisponiveis();
            renderizarTecnicasAprendidas();
            renderizarStatusTecnicas();
        }
    }, 800);
}

// ===== INICIALIZAR SISTEMA =====
function inicializarSistemaTecnicas() {
    if (window.sistemaTecnicasJaIniciado) return;
    window.sistemaTecnicasJaIniciado = true;
    
    carregarTecnicas();
    configurarEventListenersTecnicas();
    configurarMonitoramento();
    atualizarTecnicasDisponiveis();
    renderizarStatusTecnicas();
    renderizarFiltrosTecnicas();
    renderizarTecnicasAprendidas();
}

// ===== EXPORTAR =====
window.fecharModalTecnica = fecharModalTecnica;
window.confirmarTecnica = confirmarTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

// ===== INICIALIZAÇÃO SEGURA (só após perícias estarem prontas) =====
function tentarInicializar() {
    if (window.estadoPericias && window.catalogoTecnicas && window.obterDadosAtributos) {
        inicializarSistemaTecnicas();
    } else {
        setTimeout(tentarInicializar, 500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver(() => {
        const aba = document.getElementById('pericias');
        if (aba && aba.classList.contains('active')) {
            tentarInicializar();
        }
    });
    document.querySelectorAll('.tab-content').forEach(tab => {
        observer.observe(tab, { attributes: true, attributeFilter: ['class'] });
    });
});
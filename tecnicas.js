// ===== SISTEMA DE TÉCNICAS - FUNCIONAL =====
let estadoTecnicas = {
    tecnicasAprendidas: [],
    filtroAtivo: 'todas-tecnicas',
    buscaAtiva: ''
};

// ===== FUNÇÕES QUE VÃO RESOLVER O PROBLEMA =====
function temPericia(idPericia, nivelMinimo = 0) {
    // Verificar se o sistema de perícias existe
    if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
        console.log("Sistema de perícias não encontrado");
        return { tem: false, pericia: null };
    }
    
    // Procurar a perícia aprendida
    const periciaAprendida = window.estadoPericias.periciasAprendidas.find(p => {
        // Tenta pelo ID exato
        if (p.id === idPericia) return true;
        
        // Tenta pelo nome similar
        if (p.nome.toLowerCase().includes(idPericia.toLowerCase()) || 
            idPericia.toLowerCase().includes(p.nome.toLowerCase())) {
            return true;
        }
        
        return false;
    });
    
    if (!periciaAprendida) {
        return { tem: false, pericia: null };
    }
    
    // Calcular NH da perícia
    const atributo = periciaAprendida.atributo || 'DX';
    let valorAtributo = 10;
    
    // Tentar obter valor real do atributo
    if (window.obterDadosAtributos && typeof window.obterDadosAtributos === 'function') {
        const atributos = window.obterDadosAtributos();
        const map = {
            'DX': atributos.destreza || 10,
            'IQ': atributos.inteligencia || 10,
            'HT': atributos.saude || 10,
            'PERC': atributos.percepcao || 10
        };
        valorAtributo = map[atributo] || 10;
    }
    
    const nivelPericia = periciaAprendida.nivel || 0;
    const nh = valorAtributo + nivelPericia;
    
    // Verificar nível mínimo
    const nivelOk = nivelMinimo === 0 || nh >= nivelMinimo;
    
    return {
        tem: nivelOk,
        pericia: periciaAprendida,
        nh: nh,
        nivelOk: nivelOk
    };
}

function temCavalgar() {
    if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
        return false;
    }
    
    // Verificar se tem qualquer perícia de cavalgar
    return window.estadoPericias.periciasAprendidas.some(p => 
        p.id.startsWith('cavalgar-') || 
        p.nome.toLowerCase().includes('cavalgar')
    );
}

function verificarPreRequisitos(tecnica) {
    if (!tecnica.preRequisitos || tecnica.preRequisitos.length === 0) {
        return { passou: true, motivo: '' };
    }
    
    for (const prereq of tecnica.preRequisitos) {
        // Caso especial: Cavalgar
        if (prereq.tipo === 'cavalgar') {
            if (!temCavalgar()) {
                return { passou: false, motivo: 'Falta: Cavalgar (qualquer animal)' };
            }
            continue;
        }
        
        // Caso normal: Perícia específica
        if (prereq.pericia) {
            const resultado = temPericia(prereq.pericia, prereq.nivelMin || 0);
            if (!resultado.tem) {
                return { 
                    passou: false, 
                    motivo: `Falta: ${prereq.pericia} ${prereq.nivelMin ? 'NH ' + prereq.nivelMin + '+' : ''}` 
                };
            }
        }
    }
    
    return { passou: true, motivo: '' };
}

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

function calcularNHBase(tecnica) {
    if (!tecnica.basePericia) return 0;
    
    const resultado = temPericia(tecnica.basePericia);
    if (!resultado.tem) return 0;
    
    const baseNH = resultado.nh;
    const redutor = tecnica.redutor || 0;
    
    return baseNH + redutor;
}

// ===== CATÁLOGO SIMPLES DE TÉCNICAS =====
const catalogoTecnicas = {
    "arquearia-montada": {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        descricao: "Permite usar arco enquanto cavalga. Penalidade reduzida de -6 para -2.",
        dificuldade: "Difícil",
        basePericia: "arco",
        redutor: -4,
        limitePericia: "arco",
        preRequisitos: [
            { pericia: "arco", nivelMin: 4 },
            { tipo: "cavalgar" }
        ]
    }
};

// ===== RENDERIZAR CATÁLOGO =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
    // Converter catálogo para array
    const tecnicasArray = Object.values(catalogoTecnicas);
    
    // Filtrar se necessário
    let tecnicasFiltradas = tecnicasArray;
    if (estadoTecnicas.filtroAtivo === 'medio-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Média');
    } else if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Difícil');
    }
    
    if (estadoTecnicas.buscaAtiva.trim() !== '') {
        const termo = estadoTecnicas.buscaAtiva.toLowerCase();
        tecnicasFiltradas = tecnicasFiltradas.filter(t => 
            t.nome.toLowerCase().includes(termo) ||
            t.descricao.toLowerCase().includes(termo)
        );
    }
    
    if (tecnicasFiltradas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia">
                <i class="fas fa-info-circle"></i>
                <div>Nenhuma técnica encontrada</div>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    tecnicasFiltradas.forEach(tecnica => {
        const verificacao = verificarPreRequisitos(tecnica);
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        const nhBase = calcularNHBase(tecnica);
        const nhAtual = jaAprendida ? nhBase + (jaAprendida.niveisAcima || 0) : nhBase;
        
        html += `
            <div class="pericia-item" data-id="${tecnica.id}" 
                 style="cursor: ${verificacao.passou ? 'pointer' : 'not-allowed'}; opacity: ${verificacao.passou ? '1' : '0.7'}"
                 onclick="${verificacao.passou ? `abrirModalTecnica('${tecnica.id}')` : ''}">
                <div class="pericia-header">
                    <h4 class="pericia-nome">
                        ${tecnica.nome} ${jaAprendida ? '✓' : ''}
                    </h4>
                    <div class="pericia-info">
                        <span class="pericia-dificuldade" style="background: ${tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f1c40f'}">
                            ${tecnica.dificuldade}
                        </span>
                        <span class="pericia-custo">NH ${nhAtual}</span>
                    </div>
                </div>
                <p class="pericia-descricao">${tecnica.descricao}</p>
                
                ${tecnica.preRequisitos && tecnica.preRequisitos.length > 0 ? `
                <div class="pericia-requisitos">
                    <small><strong>Requer:</strong> 
                    ${tecnica.preRequisitos.map(p => 
                        p.tipo === 'cavalgar' ? 'Cavalgar' : 
                        `${p.pericia}${p.nivelMin ? ' ' + p.nivelMin + '+' : ''}`
                    ).join(', ')}
                    </small>
                </div>
                ` : ''}
                
                ${!verificacao.passou ? `
                <div style="margin-top: 8px; color: #e74c3c; font-size: 0.9em;">
                    <i class="fas fa-lock"></i> ${verificacao.motivo}
                </div>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ===== MODAL =====
function abrirModalTecnica(id) {
    const tecnica = catalogoTecnicas[id];
    if (!tecnica) return;
    
    const verificacao = verificarPreRequisitos(tecnica);
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === id);
    const nhBase = calcularNHBase(tecnica);
    const niveisAcima = jaAprendida ? jaAprendida.niveisAcima || 0 : 0;
    const nhAtual = nhBase + niveisAcima;
    
    // Calcular limite máximo
    let limiteMaximo = Infinity;
    if (tecnica.limitePericia) {
        const resultadoLimite = temPericia(tecnica.limitePericia);
        if (resultadoLimite.tem) {
            limiteMaximo = resultadoLimite.nh;
        }
    }
    
    const modal = document.querySelector('.modal-tecnica');
    const overlay = document.querySelector('.modal-tecnica-overlay');
    
    if (!modal || !overlay) return;
    
    // Gerar opções de nível
    let options = '';
    const maxNiveis = Math.min(limiteMaximo - nhBase, 10); // Máximo 10 níveis acima
    
    for (let i = 0; i <= maxNiveis; i++) {
        const nh = nhBase + i;
        const custo = calcularCustoTecnica(i, tecnica.dificuldade);
        const selected = i === niveisAcima ? 'selected' : '';
        options += `<option value="${i}" ${selected} data-custo="${custo}">NH ${nh} (${custo} pts)</option>`;
    }
    
    modal.innerHTML = `
        <div class="modal-header-pericia">
            <span class="modal-close" onclick="fecharModalTecnica()">&times;</span>
            <h3>${tecnica.nome}</h3>
            <div class="modal-subtitulo">${tecnica.dificuldade} • Base: NH(${tecnica.basePericia}) ${tecnica.redutor || 0}</div>
        </div>
        
        <div class="modal-body-pericia">
            <p>${tecnica.descricao}</p>
            
            <div style="margin: 20px 0;">
                <label>Nível da Técnica:</label>
                <select id="nivel-tecnica" style="width: 100%; padding: 10px; margin-top: 5px;">
                    ${options}
                </select>
            </div>
            
            <div style="text-align: center; padding: 15px; background: rgba(39, 174, 96, 0.1); border-radius: 8px;">
                <div style="color: #95a5a6; font-size: 0.9em;">Custo Total</div>
                <div id="custo-total" style="color: #27ae60; font-size: 2em; font-weight: bold;">0 pontos</div>
            </div>
            
            ${!verificacao.passou ? `
            <div style="margin-top: 15px; padding: 10px; background: rgba(231, 76, 60, 0.1); border-radius: 5px; color: #e74c3c;">
                <i class="fas fa-exclamation-triangle"></i> ${verificacao.motivo}
            </div>
            ` : ''}
        </div>
        
        <div class="modal-actions-pericia">
            <button class="btn-modal btn-cancelar" onclick="fecharModalTecnica()">Cancelar</button>
            <button class="btn-modal btn-confirmar" onclick="salvarTecnica('${id}')" 
                ${!verificacao.passou ? 'disabled' : ''}>
                ${jaAprendida ? 'Atualizar' : 'Aprender'}
            </button>
        </div>
    `;
    
    overlay.style.display = 'block';
    
    // Atualizar custo quando mudar nível
    const select = document.getElementById('nivel-tecnica');
    const custoDisplay = document.getElementById('custo-total');
    
    function atualizarCusto() {
        const selected = select.options[select.selectedIndex];
        const custo = selected.dataset.custo;
        custoDisplay.textContent = `${custo} pontos`;
    }
    
    select.addEventListener('change', atualizarCusto);
    atualizarCusto(); // Valor inicial
    
    // Guardar dados para salvar depois
    window.tecnicaEmEdicao = {
        id: id,
        tecnica: tecnica
    };
}

function salvarTecnica(id) {
    const select = document.getElementById('nivel-tecnica');
    const niveisAcima = parseInt(select.value);
    const custo = parseInt(select.options[select.selectedIndex].dataset.custo);
    
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === id);
    
    const dadosTecnica = {
        id: id,
        nome: catalogoTecnicas[id].nome,
        dificuldade: catalogoTecnicas[id].dificuldade,
        niveisAcima: niveisAcima,
        custo: custo,
        data: new Date().toISOString()
    };
    
    if (index >= 0) {
        estadoTecnicas.tecnicasAprendidas[index] = dadosTecnica;
    } else {
        estadoTecnicas.tecnicasAprendidas.push(dadosTecnica);
    }
    
    // Salvar no localStorage
    localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
    
    fecharModalTecnica();
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
    atualizarStatusTecnicas();
}

function fecharModalTecnica() {
    const overlay = document.querySelector('.modal-tecnica-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    window.tecnicaEmEdicao = null;
}

// ===== TÉCNICAS APRENDIDAS =====
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    if (estadoTecnicas.tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia-aprendida">
                <i class="fas fa-tools"></i>
                <div>Nenhuma técnica aprendida</div>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        const infoCatalogo = catalogoTecnicas[tecnica.id];
        const nhBase = calcularNHBase(infoCatalogo);
        const nhTotal = nhBase + (tecnica.niveisAcima || 0);
        
        html += `
            <div class="pericia-aprendida-item">
                <div class="pericia-aprendida-header">
                    <h4 class="pericia-aprendida-nome">${tecnica.nome}</h4>
                    <div class="pericia-aprendida-info">
                        <span class="pericia-aprendida-nivel">NH ${nhTotal}</span>
                        <span class="pericia-dificuldade" style="background: ${tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f1c40f'}">
                            ${tecnica.dificuldade}
                        </span>
                        <span class="pericia-aprendida-custo">${tecnica.custo} pts</span>
                    </div>
                </div>
                <button class="btn-remover-pericia" onclick="removerTecnica('${tecnica.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function removerTecnica(id) {
    if (confirm('Remover esta técnica?')) {
        estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
        renderizarTecnicasAprendidas();
        renderizarCatalogoTecnicas();
        atualizarStatusTecnicas();
    }
}

// ===== STATUS =====
function atualizarStatusTecnicas() {
    // Calcular totais
    let totalPontos = 0;
    let totalMedio = 0;
    let totalDificil = 0;
    let qtdMedio = 0;
    let qtdDificil = 0;
    
    estadoTecnicas.tecnicasAprendidas.forEach(t => {
        totalPontos += t.custo || 0;
        if (t.dificuldade === 'Média') {
            totalMedio += t.custo || 0;
            qtdMedio++;
        } else {
            totalDificil += t.custo || 0;
            qtdDificil++;
        }
    });
    
    // Atualizar elementos
    const elementos = {
        'qtd-tecnicas-medio': qtdMedio,
        'pts-tecnicas-medio': `(${totalMedio} pts)`,
        'qtd-tecnicas-dificil': qtdDificil,
        'pts-tecnicas-dificil': `(${totalDificil} pts)`,
        'qtd-tecnicas-total': qtdMedio + qtdDificil,
        'pts-tecnicas-total': `(${totalPontos} pts)`
    };
    
    for (const [id, valor] of Object.entries(elementos)) {
        const el = document.getElementById(id);
        if (el) el.textContent = valor;
    }
    
    const badge = document.getElementById('pontos-tecnicas-total');
    if (badge) badge.textContent = `[${totalPontos} pts]`;
}

// ===== INICIALIZAÇÃO =====
function inicializarTecnicas() {
    // Carregar técnicas aprendidas
    const salvo = localStorage.getItem('tecnicasAprendidas');
    if (salvo) {
        try {
            estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
        } catch (e) {
            estadoTecnicas.tecnicasAprendidas = [];
        }
    }
    
    // Configurar eventos
    const buscaInput = document.getElementById('busca-tecnicas');
    if (buscaInput) {
        buscaInput.addEventListener('input', function() {
            estadoTecnicas.buscaAtiva = this.value;
            renderizarCatalogoTecnicas();
        });
    }
    
    // Filtros
    document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
        btn.addEventListener('click', function() {
            estadoTecnicas.filtroAtivo = this.dataset.filtro;
            
            // Ativar botão
            document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            renderizarCatalogoTecnicas();
        });
    });
    
    // Fechar modal
    const overlay = document.querySelector('.modal-tecnica-overlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
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
    
    // Renderizar tudo
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
    atualizarStatusTecnicas();
    
    console.log('✅ Sistema de técnicas inicializado');
}

// ===== INICIALIZAR QUANDO A ABA ABRIR =====
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir carregamento
    setTimeout(() => {
        const observer = new MutationObserver(function() {
            const abaPericias = document.getElementById('pericias');
            if (abaPericias && window.getComputedStyle(abaPericias).display !== 'none') {
                // Verificar se já foi inicializado
                if (!window.tecnicasIniciadas) {
                    window.tecnicasIniciadas = true;
                    inicializarTecnicas();
                }
            }
        });
        
        // Observar mudanças na aba
        const abaPericias = document.getElementById('pericias');
        if (abaPericias) {
            observer.observe(abaPericias, { attributes: true, attributeFilter: ['style'] });
            
            // Inicializar se já estiver visível
            if (window.getComputedStyle(abaPericias).display !== 'none') {
                window.tecnicasIniciadas = true;
                inicializarTecnicas();
            }
        }
    }, 500);
});

// ===== EXPORTAR FUNÇÕES =====
window.fecharModalTecnica = fecharModalTecnica;
window.abrirModalTecnica = abrirModalTecnica;
window.removerTecnica = removerTecnica;
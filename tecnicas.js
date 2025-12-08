// ===== SISTEMA DE TÉCNICAS - VERSÃO 100% FUNCIONAL =====
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
    modalAberto: false
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
function obterNHPericiaPorId(idPericia) {
    if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
        return 10; // Default
    }
    
    const pericia = window.estadoPericias.periciasAprendidas.find(p => p.id === idPericia);
    if (!pericia) return 10;
    
    // Simular atributo base - você pode substituir pela sua função real
    let valorAtributo = 10;
    if (pericia.atributo === 'DX') valorAtributo = 11;
    if (pericia.atributo === 'IQ') valorAtributo = 12;
    if (pericia.atributo === 'HT') valorAtributo = 13;
    if (pericia.atributo === 'PERC') valorAtributo = 14;
    
    return valorAtributo + (pericia.nivel || 0);
}

// ===== VERIFICAR PRÉ-REQUISITOS =====
function verificarPreRequisitosTecnica(tecnica) {
    if (!tecnica || !tecnica.preRequisitos) {
        return { passou: false, motivo: "Técnica inválida" };
    }
    
    if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
        return { passou: false, motivo: "Sistema de perícias não carregado" };
    }
    
    for (const prereq of tecnica.preRequisitos) {
        let periciaEncontrada = false;
        
        // Verificar Arco
        if (prereq.idPericia === "arco") {
            periciaEncontrada = window.estadoPericias.periciasAprendidas.some(p => p.id === "arco");
            if (!periciaEncontrada) {
                return { passou: false, motivo: "Falta: Arco" };
            }
            
            // Verificar nível mínimo do Arco
            const periciaArco = window.estadoPericias.periciasAprendidas.find(p => p.id === "arco");
            if (periciaArco && (periciaArco.nivel || 0) < 4) {
                return { passou: false, motivo: "Arco precisa nível 4+" };
            }
        }
        
        // Verificar Cavalgar
        if (prereq.idsCavalgar) {
            periciaEncontrada = window.estadoPericias.periciasAprendidas.some(p => 
                prereq.idsCavalgar.includes(p.id)
            );
            if (!periciaEncontrada) {
                return { passou: false, motivo: "Falta: Cavalgar (qualquer tipo)" };
            }
        }
    }
    
    return { passou: true, motivo: '' };
}

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
    console.log("Atualizando técnicas disponíveis...");
    
    // Forçar recarregamento do catálogo
    if (!window.catalogoTecnicas) {
        console.error("Catálogo de técnicas não carregado!");
        return;
    }
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    console.log("Técnicas no catálogo:", todasTecnicas);
    
    if (!todasTecnicas || todasTecnicas.length === 0) {
        console.error("Nenhuma técnica encontrada no catálogo!");
        return;
    }
    
    const disponiveis = [];
    
    todasTecnicas.forEach(tecnica => {
        console.log("Processando técnica:", tecnica.nome);
        
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        
        // Calcular NH atual
        let nhAtual = 0;
        if (tecnica.baseCalculo && tecnica.baseCalculo.tipo === "pericia") {
            const nhPericia = obterNHPericiaPorId(tecnica.baseCalculo.idPericia);
            nhAtual = nhPericia + (tecnica.baseCalculo.redutor || 0);
        }
        
        // Se já aprendida, ajustar com níveis acima
        if (jaAprendida) {
            nhAtual += (jaAprendida.niveisAcimaBase || 0);
        }
        
        disponiveis.push({
            ...tecnica,
            disponivel: verificacao.passou,
            nhAtual: nhAtual,
            custoAtual: jaAprendida ? (jaAprendida.custoPago || 0) : 0,
            jaAprendida: !!jaAprendida,
            motivoIndisponivel: verificacao.motivo
        });
    });
    
    estadoTecnicas.tecnicasDisponiveis = disponiveis;
    console.log("Técnicas disponíveis atualizadas:", disponiveis);
    
    renderizarCatalogoTecnicas();
}

// ===== RENDERIZAR CATÁLOGO =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("Container 'lista-tecnicas' não encontrado!");
        return;
    }
    
    console.log("Renderizando catálogo com", estadoTecnicas.tecnicasDisponiveis.length, "técnicas");
    
    if (estadoTecnicas.tecnicasDisponiveis.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia">
                <i class="fas fa-info-circle"></i>
                <div>Nenhuma técnica disponível</div>
                <small>Aprenda Arco (nível 4) e Cavalgar primeiro</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    estadoTecnicas.tecnicasDisponiveis.forEach(tecnica => {
        const disponivel = tecnica.disponivel;
        const jaAprendida = tecnica.jaAprendida;
        
        html += `
            <div class="pericia-item" data-id="${tecnica.id}" 
                 style="cursor: ${disponivel ? 'pointer' : 'not-allowed'}; 
                        opacity: ${disponivel ? '1' : '0.7'};
                        border-left: 4px solid ${tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12'};">
                
                <div class="pericia-header">
                    <h4 class="pericia-nome">
                        ${tecnica.nome} 
                        ${jaAprendida ? '<span style="color: #27ae60; margin-left: 5px;">✓</span>' : ''}
                    </h4>
                    <div class="pericia-info">
                        <span class="pericia-dificuldade" 
                              style="background: ${tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12'}; 
                                     color: white; padding: 3px 8px; border-radius: 10px; font-size: 12px;">
                            ${tecnica.dificuldade}
                        </span>
                        <span class="pericia-custo" 
                              style="background: #3498db; color: white; padding: 3px 8px; border-radius: 10px; font-size: 12px;">
                            NH ${tecnica.nhAtual}
                        </span>
                    </div>
                </div>
                
                <p class="pericia-descricao">${tecnica.descricao}</p>
                
                ${!disponivel ? `
                <div style="background: rgba(231, 76, 60, 0.1); padding: 8px; border-radius: 5px; margin-top: 8px; border-left: 3px solid #e74c3c;">
                    <i class="fas fa-lock" style="color: #e74c3c; margin-right: 5px;"></i>
                    <span style="color: #e74c3c; font-size: 13px;">${tecnica.motivoIndisponivel}</span>
                </div>
                ` : ''}
                
                <div style="margin-top: 8px; font-size: 13px; color: #95a5a6;">
                    <strong>Base:</strong> ${tecnica.baseCalculo.idPericia} ${tecnica.baseCalculo.redutor >= 0 ? '+' : ''}${tecnica.baseCalculo.redutor}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Adicionar eventos de clique
    const itens = container.querySelectorAll('.pericia-item');
    itens.forEach(item => {
        const id = item.getAttribute('data-id');
        const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
        
        if (tecnica && tecnica.disponivel) {
            item.addEventListener('click', () => {
                console.log("Clicou na técnica:", tecnica.nome);
                abrirModalTecnica(tecnica);
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
                <small>Clique em uma técnica disponível para aprendê-la</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        // Calcular NH atual
        let nhAtual = 0;
        if (tecnica.baseCalculo && tecnica.baseCalculo.tipo === "pericia") {
            const nhPericia = obterNHPericiaPorId(tecnica.baseCalculo.idPericia);
            nhAtual = nhPericia + (tecnica.baseCalculo.redutor || 0) + (tecnica.niveisAcimaBase || 0);
        }
        
        html += `
            <div class="pericia-aprendida-item" 
                 style="border-left: 4px solid ${tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12'};
                        background: rgba(155, 89, 182, 0.05); padding: 15px; margin-bottom: 10px; border-radius: 5px; position: relative;">
                
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <h4 style="margin: 0; color: #ffd700; font-size: 16px;">${tecnica.nome}</h4>
                    <div style="display: flex; gap: 8px;">
                        <span style="background: #3498db; color: white; padding: 3px 8px; border-radius: 10px; font-size: 12px;">
                            NH ${nhAtual}
                        </span>
                        <span style="background: ${tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12'}; 
                              color: white; padding: 3px 8px; border-radius: 10px; font-size: 12px;">
                            ${tecnica.dificuldade}
                        </span>
                        <span style="background: #27ae60; color: white; padding: 3px 8px; border-radius: 10px; font-size: 12px;">
                            ${tecnica.custoPago} pts
                        </span>
                    </div>
                </div>
                
                <div style="font-size: 13px; color: #95a5a6; margin-bottom: 8px;">
                    <strong>Níveis acima da base:</strong> ${tecnica.niveisAcimaBase || 0}
                </div>
                
                <button onclick="removerTecnica('${tecnica.id}')" 
                        style="position: absolute; top: 10px; right: 10px; background: #e74c3c; color: white; 
                               border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer;">
                    ×
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ===== ABRIR MODAL =====
function abrirModalTecnica(tecnica) {
    console.log("Abrindo modal para:", tecnica.nome);
    
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    const modal = document.querySelector('.modal-tecnica');
    
    if (!modalOverlay || !modal) {
        console.error("Modal não encontrado!");
        return;
    }
    
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    
    // Calcular base
    let baseAtual = 0;
    if (tecnica.baseCalculo && tecnica.baseCalculo.tipo === "pericia") {
        const nhPericia = obterNHPericiaPorId(tecnica.baseCalculo.idPericia);
        baseAtual = nhPericia + (tecnica.baseCalculo.redutor || 0);
    }
    
    // Calcular limite máximo
    let nhMaximo = Infinity;
    if (tecnica.limiteMaximo && tecnica.limiteMaximo.tipo === "pericia") {
        nhMaximo = obterNHPericiaPorId(tecnica.limiteMaximo.idPericia);
    }
    
    // Nível atual
    const niveisAcima = jaAprendida ? (jaAprendida.niveisAcimaBase || 0) : 0;
    const nhAtual = baseAtual + niveisAcima;
    
    // Criar opções do select
    let opcoesHTML = '';
    for (let nh = baseAtual; nh <= nhMaximo; nh++) {
        const niveisAcimaOpt = nh - baseAtual;
        const custo = calcularCustoTecnica(niveisAcimaOpt, tecnica.dificuldade);
        const selected = nh === nhAtual ? 'selected' : '';
        opcoesHTML += `<option value="${nh}" data-niveis="${niveisAcimaOpt}" data-custo="${custo}" ${selected}>NH ${nh} (${custo} pontos)</option>`;
    }
    
    modal.innerHTML = `
        <div style="background: #2c3e50; color: white; padding: 20px; border-radius: 8px 8px 0 0; position: relative;">
            <span onclick="fecharModalTecnica()" 
                  style="position: absolute; right: 20px; top: 20px; font-size: 24px; cursor: pointer; color: #ffd700;">
                &times;
            </span>
            <h3 style="margin: 0; color: #ffd700;">${tecnica.nome}</h3>
            <div style="color: #95a5a6; margin-top: 5px;">${tecnica.dificuldade} • Base: ${tecnica.baseCalculo.idPericia} ${tecnica.baseCalculo.redutor >= 0 ? '+' : ''}${tecnica.baseCalculo.redutor}</div>
        </div>
        
        <div style="padding: 20px; background: #1e1e28; color: #ccc;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="text-align: center;">
                    <div style="font-size: 12px; color: #95a5a6;">Base</div>
                    <div style="font-size: 24px; font-weight: bold; color: #3498db;">${baseAtual}</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 12px; color: #95a5a6;">Máximo</div>
                    <div style="font-size: 24px; font-weight: bold; color: #27ae60;">${nhMaximo}</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 12px; color: #95a5a6;">Atual</div>
                    <div style="font-size: 24px; font-weight: bold; color: #f39c12;">${nhAtual}</div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; color: #ffd700; font-weight: bold;">
                    Selecione o nível:
                </label>
                <select id="select-nh-tecnica" 
                        style="width: 100%; padding: 10px; border-radius: 5px; border: 2px solid #ff8c00; 
                               background: #2c3e50; color: #ffd700; font-size: 16px;">
                    ${opcoesHTML}
                </select>
            </div>
            
            <div style="background: rgba(39, 174, 96, 0.1); padding: 15px; border-radius: 5px; 
                        border-left: 4px solid #27ae60; margin-bottom: 20px;">
                <div style="font-size: 12px; color: #95a5a6;">Custo Total</div>
                <div id="custo-display" style="font-size: 28px; font-weight: bold; color: #27ae60;">
                    ${jaAprendida ? jaAprendida.custoPago : 0} pontos
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="color: #ffd700; margin-bottom: 10px;">Descrição</h4>
                <p>${tecnica.descricao}</p>
            </div>
        </div>
        
        <div style="padding: 20px; background: #2c3e50; border-radius: 0 0 8px 8px; display: flex; gap: 10px; justify-content: flex-end;">
            <button onclick="fecharModalTecnica()" 
                    style="padding: 10px 20px; background: #7f8c8d; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Cancelar
            </button>
            <button onclick="comprarTecnica('${tecnica.id}')" 
                    id="btn-comprar-tecnica"
                    style="padding: 10px 20px; background: linear-gradient(45deg, #ff8c00, #ffd700); 
                           color: #1e1e28; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">
                ${jaAprendida ? 'Atualizar' : 'Aprender'}
            </button>
        </div>
    `;
    
    modalOverlay.style.display = 'flex';
    estadoTecnicas.modalAberto = true;
    
    // Configurar eventos do select
    const select = document.getElementById('select-nh-tecnica');
    const custoDisplay = document.getElementById('custo-display');
    const btnComprar = document.getElementById('btn-comprar-tecnica');
    
    function atualizarCusto() {
        const opcao = select.options[select.selectedIndex];
        const custo = opcao.getAttribute('data-custo');
        const niveis = opcao.getAttribute('data-niveis');
        
        custoDisplay.textContent = `${custo} pontos`;
        
        if (jaAprendida && niveis == jaAprendida.niveisAcimaBase) {
            btnComprar.textContent = 'Manter';
            btnComprar.style.background = '#95a5a6';
            btnComprar.disabled = true;
        } else {
            btnComprar.textContent = jaAprendida ? 'Atualizar' : 'Aprender';
            btnComprar.style.background = 'linear-gradient(45deg, #ff8c00, #ffd700)';
            btnComprar.disabled = false;
        }
    }
    
    select.addEventListener('change', atualizarCusto);
    atualizarCusto();
}

// ===== COMPRAR/ATUALIZAR TÉCNICA =====
function comprarTecnica(id) {
    const select = document.getElementById('select-nh-tecnica');
    if (!select) return;
    
    const opcao = select.options[select.selectedIndex];
    const nh = parseInt(select.value);
    const niveisAcima = parseInt(opcao.getAttribute('data-niveis'));
    const custo = parseInt(opcao.getAttribute('data-custo'));
    
    const tecnicaCatalogo = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
    if (!tecnicaCatalogo) return;
    
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === id);
    
    if (index >= 0) {
        // Atualizar
        estadoTecnicas.tecnicasAprendidas[index] = {
            ...estadoTecnicas.tecnicasAprendidas[index],
            niveisAcimaBase: niveisAcima,
            custoPago: custo
        };
    } else {
        // Nova técnica
        estadoTecnicas.tecnicasAprendidas.push({
            id: id,
            nome: tecnicaCatalogo.nome,
            descricao: tecnicaCatalogo.descricao,
            dificuldade: tecnicaCatalogo.dificuldade,
            baseCalculo: tecnicaCatalogo.baseCalculo,
            limiteMaximo: tecnicaCatalogo.limiteMaximo,
            preRequisitos: tecnicaCatalogo.preRequisitos,
            niveisAcimaBase: niveisAcima,
            custoPago: custo
        });
    }
    
    // Salvar
    localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
    
    // Atualizar displays
    renderizarStatusTecnicas();
    renderizarTecnicasAprendidas();
    atualizarTecnicasDisponiveis();
    
    // Fechar modal
    fecharModalTecnica();
}

// ===== REMOVER TÉCNICA =====
function removerTecnica(id) {
    if (confirm('Remover esta técnica? Os pontos serão perdidos.')) {
        estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
        renderizarStatusTecnicas();
        renderizarTecnicasAprendidas();
        atualizarTecnicasDisponiveis();
    }
}

// ===== FECHAR MODAL =====
function fecharModalTecnica() {
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
    estadoTecnicas.modalAberto = false;
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

// ===== CONFIGURAR EVENTOS =====
function configurarEventListenersTecnicas() {
    // Filtros
    document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
        btn.addEventListener('click', function() {
            estadoTecnicas.filtroAtivo = this.getAttribute('data-filtro');
            document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
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
    
    // Fechar modal ao clicar fora
    document.querySelector('.modal-tecnica-overlay')?.addEventListener('click', function(e) {
        if (e.target === this) {
            fecharModalTecnica();
        }
    });
    
    // Fechar com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && estadoTecnicas.modalAberto) {
            fecharModalTecnica();
        }
    });
}

// ===== INICIALIZAR =====
function inicializarSistemaTecnicas() {
    console.log("🔧 Inicializando sistema de técnicas...");
    
    // Carregar técnicas salvas
    const salvo = localStorage.getItem('tecnicasAprendidas');
    if (salvo) {
        try {
            estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
        } catch (e) {
            console.error("Erro ao carregar técnicas:", e);
        }
    }
    
    // Configurar eventos
    configurarEventListenersTecnicas();
    
    // Inicializar displays
    atualizarTecnicasDisponiveis();
    renderizarStatusTecnicas();
    renderizarTecnicasAprendidas();
    
    console.log("✅ Sistema de técnicas inicializado!");
}

// ===== EXPORTAR FUNÇÕES =====
window.fecharModalTecnica = fecharModalTecnica;
window.comprarTecnica = comprarTecnica;
window.removerTecnica = removerTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const abaPericias = document.getElementById('pericias');
        if (abaPericias) {
            if (abaPericias.style.display !== 'none') {
                setTimeout(inicializarSistemaTecnicas, 500);
            }
            
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (abaPericias.style.display !== 'none') {
                            setTimeout(inicializarSistemaTecnicas, 300);
                        } else {
                            fecharModalTecnica();
                        }
                    }
                });
            });
            
            observer.observe(abaPericias, { attributes: true, attributeFilter: ['style'] });
        }
    }, 1000);
});
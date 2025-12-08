// ===== SISTEMA DE TÉCNICAS - VERSÃO 100% FUNCIONAL =====
// Baseado no seu código que já funciona

console.log("🎯 SISTEMA DE TÉCNICAS - INICIANDO...");

// ===== ESTADO DO SISTEMA =====
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
    modalAberto: false,
    tecnicaSelecionada: null
};

// ===== TABELA DE CUSTO SIMPLIFICADA =====
function calcularCustoTecnica(niveisAcima, dificuldade) {
    if (niveisAcima <= 0) return 0;
    
    if (dificuldade === 'Difícil') {
        const custos = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        return custos[niveisAcima - 1] || (niveisAcima + 1);
    }
    
    if (dificuldade === 'Média') {
        return niveisAcima; // 1 ponto por nível
    }
    
    return 0;
}

// ===== FUNÇÃO CHAVE: OBTER VALOR DE ATRIBUTO =====
function obterValorAtributo(atributoId) {
    // Método 1: Tentar do elemento HTML
    const elemento = document.getElementById(atributoId);
    if (elemento) {
        const valor = parseInt(elemento.value);
        if (!isNaN(valor)) return valor;
    }
    
    // Método 2: Do sistema de atributos se existir
    if (window.obterValorAtributoGlobal) {
        return window.obterValorAtributoGlobal(atributoId);
    }
    
    // Método 3: Valor padrão
    return 10;
}

// ===== FUNÇÃO CHAVE: OBTER NH DA PERÍCIA =====
function obterNHPericia(idPericia) {
    console.log(`🎯 Calculando NH para: "${idPericia}"`);
    
    // Obter atributo base (Arco e Cavalgar são DX)
    let atributoBase = obterValorAtributo('DX');
    
    // Verificar se o sistema de perícias está disponível
    if (!window.estadoPericias) {
        console.error("❌ window.estadoPericias não encontrado!");
        return atributoBase; // Retorna apenas o atributo base
    }
    
    if (!window.estadoPericias.periciasAprendidas) {
        console.error("❌ Perícias aprendidas não encontradas!");
        return atributoBase;
    }
    
    console.log(`📊 Perícias disponíveis:`, 
        window.estadoPericias.periciasAprendidas.map(p => `${p.id}: ${p.nome} (nível ${p.nivel})`));
    
    // Buscar a perícia específica
    let periciaEncontrada = null;
    
    // Para Arco
    if (idPericia === 'arco') {
        periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => 
            p.id === 'arco' || 
            (p.nome && p.nome.toLowerCase().includes('arco'))
        );
        
        if (periciaEncontrada) {
            console.log(`✅ Arco encontrado: nível ${periciaEncontrada.nivel}`);
        } else {
            console.log(`⚠️ Arco NÃO encontrado nas perícias aprendidas`);
        }
    }
    
    // Para Cavalgar (qualquer especialização)
    if (idPericia.includes('cavalgar')) {
        periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => 
            p.id.includes('cavalgar') || 
            (p.nome && p.nome.toLowerCase().includes('cavalgar')) ||
            (p.grupo && p.grupo.toLowerCase() === 'cavalgar')
        );
        
        if (periciaEncontrada) {
            console.log(`✅ Cavalgar encontrado: ${periciaEncontrada.nome}, nível ${periciaEncontrada.nivel}`);
        }
    }
    
    // Calcular NH
    let nhFinal = atributoBase; // Começa com o atributo base
    
    if (periciaEncontrada) {
        const nivel = periciaEncontrada.nivel || 0;
        nhFinal = atributoBase + nivel;
        console.log(`🧮 NH ${periciaEncontrada.nome}: ${atributoBase} (DX) + ${nivel} = ${nhFinal}`);
    } else {
        console.log(`📊 NH base para ${idPericia}: ${atributoBase} (DX sem perícia)`);
    }
    
    return nhFinal;
}

// ===== VERIFICAÇÃO DE PRÉ-REQUISITOS =====
function verificarPreRequisitosTecnica(tecnica) {
    console.log(`🔍 Verificando pré-requisitos para: ${tecnica.nome}`);
    
    const motivos = [];
    let passou = true;
    
    // VERIFICAR ARCO NÍVEL 4
    const nhArco = obterNHPericia('arco');
    const dx = obterValorAtributo('DX');
    const nivelArco = nhArco - dx; // Calcula nível = NH - atributo
    
    if (nivelArco < 4) {
        passou = false;
        motivos.push(`❌ Arco precisa nível 4 (atual: ${nivelArco})`);
    } else {
        motivos.push(`✅ Arco nível ${nivelArco} (mínimo: 4)`);
    }
    
    // VERIFICAR CAVALGAR
    const temCavalgar = window.estadoPericias && 
        window.estadoPericias.periciasAprendidas && 
        window.estadoPericias.periciasAprendidas.some(p => 
            p.id.includes('cavalgar') || 
            (p.nome && p.nome.toLowerCase().includes('cavalgar'))
        );
    
    if (!temCavalgar) {
        passou = false;
        motivos.push('❌ Precisa de alguma perícia de Cavalgar');
    } else {
        motivos.push('✅ Possui perícia de Cavalgar');
    }
    
    return {
        passou: passou,
        motivos: motivos
    };
}

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
    console.log("🔄 Atualizando técnicas disponíveis...");
    
    if (!window.catalogoTecnicas || !window.catalogoTecnicas.obterTodasTecnicas) {
        console.error("❌ Catálogo de técnicas não carregado!");
        return;
    }
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    console.log(`📚 Técnicas no catálogo: ${todasTecnicas.length}`);
    
    const tecnicasProcessadas = todasTecnicas.map(tecnica => {
        // Verificar pré-requisitos
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        
        // Verificar se já aprendeu
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        
        // Calcular NH
        const nhArco = obterNHPericia('arco');
        const nhBase = nhArco - 4; // Arco-4
        let nhAtual = nhBase;
        
        if (jaAprendida && jaAprendida.niveisComprados) {
            nhAtual = nhBase + jaAprendida.niveisComprados;
        }
        
        // Não pode exceder NH do Arco
        if (nhAtual > nhArco) nhAtual = nhArco;
        
        return {
            ...tecnica,
            disponivel: verificacao.passou,
            motivoIndisponivel: verificacao.motivos.join(' | '),
            jaAprendida: !!jaAprendida,
            niveisComprados: jaAprendida ? jaAprendida.niveisComprados || 0 : 0,
            custoTotal: jaAprendida ? jaAprendida.custoTotal || 0 : 0,
            nhAtual: nhAtual,
            nhArco: nhArco,
            nhBase: nhBase
        };
    });
    
    estadoTecnicas.tecnicasDisponiveis = tecnicasProcessadas;
    renderizarCatalogoTecnicas();
}

// ===== RENDERIZAR CATÁLOGO =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("❌ Container #lista-tecnicas não encontrado!");
        return;
    }
    
    // Aplicar filtros
    let tecnicasFiltradas = estadoTecnicas.tecnicasDisponiveis;
    
    if (estadoTecnicas.filtroAtivo === 'medio-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Média');
    } else if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Difícil');
    }
    
    if (estadoTecnicas.buscaAtiva) {
        const busca = estadoTecnicas.buscaAtiva.toLowerCase();
        tecnicasFiltradas = tecnicasFiltradas.filter(t => 
            t.nome.toLowerCase().includes(busca) ||
            t.descricao.toLowerCase().includes(busca)
        );
    }
    
    // Se não houver técnicas
    if (tecnicasFiltradas.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #95a5a6;">
                <i class="fas fa-tools" style="font-size: 48px; margin-bottom: 15px;"></i>
                <div style="font-size: 18px; margin-bottom: 10px;">Nenhuma técnica encontrada</div>
                <small>Verifique filtros ou pré-requisitos</small>
            </div>
        `;
        return;
    }
    
    // Renderizar técnicas
    let html = '';
    
    tecnicasFiltradas.forEach(tecnica => {
        const modificador = tecnica.modificadorBase >= 0 ? `+${tecnica.modificadorBase}` : tecnica.modificadorBase;
        
        html += `
            <div class="pericia-item ${!tecnica.disponivel ? 'item-indisponivel' : ''}"
                data-id="${tecnica.id}"
                style="cursor: ${tecnica.disponivel ? 'pointer' : 'not-allowed'};
                       opacity: ${tecnica.disponivel ? '1' : '0.6'};
                       background: ${tecnica.jaAprendida ? 'rgba(39, 174, 96, 0.15)' : 'rgba(50, 50, 65, 0.9)'};
                       border: 1px solid ${tecnica.jaAprendida ? 'rgba(39, 174, 96, 0.4)' : 'rgba(255, 140, 0, 0.3)'};
                       border-radius: 8px;
                       padding: 15px;
                       margin-bottom: 10px;
                       transition: all 0.3s ease;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <h4 style="margin: 0; color: ${tecnica.jaAprendida ? '#27ae60' : '#ffd700'}; font-size: 16px;">
                        ${tecnica.nome}
                        ${tecnica.jaAprendida ? '<span style="color: #27ae60; margin-left: 5px;">✓</span>' : ''}
                    </h4>
                    <div style="display: flex; gap: 10px;">
                        <span style="background: ${tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12'}; 
                              color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                            ${tecnica.dificuldade}
                        </span>
                        <span style="background: #3498db; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                            NH ${tecnica.nhAtual}
                        </span>
                    </div>
                </div>
                
                <p style="margin: 10px 0; color: #ccc; font-size: 14px; line-height: 1.4;">${tecnica.descricao}</p>
                
                <div style="font-size: 12px; color: #95a5a6; margin-bottom: 8px;">
                    <i class="fas fa-calculator"></i> Base: Arco-4 (NH Arco: ${tecnica.nhArco})
                </div>
                
                ${!tecnica.disponivel ? `
                    <div style="background: rgba(231, 76, 60, 0.1); border-left: 3px solid #e74c3c; 
                         padding: 8px 12px; margin-top: 10px; border-radius: 4px;">
                        <i class="fas fa-lock" style="color: #e74c3c;"></i> 
                        <span style="color: #e74c3c; margin-left: 5px; font-size: 12px;">${tecnica.motivoIndisponivel}</span>
                    </div>
                ` : ''}
                
                ${tecnica.disponivel ? `
                    <div style="margin-top: 10px; font-size: 12px; color: #95a5a6;">
                        <i class="fas fa-bullseye" style="margin-right: 5px;"></i>
                        Clique para ${tecnica.jaAprendida ? 'melhorar' : 'aprender'}
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Adicionar eventos de clique
    container.querySelectorAll('.pericia-item').forEach(item => {
        if (!item.classList.contains('item-indisponivel')) {
            item.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
                if (tecnica && tecnica.disponivel) {
                    abrirModalTecnica(tecnica);
                }
            });
        }
    });
}

// ===== ABRIR MODAL =====
function abrirModalTecnica(tecnica) {
    console.log(`📖 Abrindo modal: ${tecnica.nome}`);
    
    estadoTecnicas.tecnicaSelecionada = tecnica;
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    
    // Cálculos
    const nhArco = obterNHPericia('arco');
    const nhBase = nhArco - 4; // Arco-4
    const limiteMaximo = nhArco;
    
    // Valores atuais
    let niveisCompradosAtuais = 0;
    let custoTotalAtual = 0;
    let nhAtual = nhBase;
    
    if (jaAprendida) {
        niveisCompradosAtuais = jaAprendida.niveisComprados || 0;
        custoTotalAtual = jaAprendida.custoTotal || 0;
        nhAtual = nhBase + niveisCompradosAtuais;
        if (nhAtual > limiteMaximo) nhAtual = limiteMaximo;
    }
    
    // Níveis possíveis
    const niveisPossiveis = Math.max(0, limiteMaximo - nhBase);
    
    // Opções
    let opcoesHTML = '';
    for (let i = 0; i <= niveisPossiveis; i++) {
        const nhOpcao = nhBase + i;
        const custo = calcularCustoTecnica(i, tecnica.dificuldade);
        const selected = i === niveisCompradosAtuais ? 'selected' : '';
        const texto = i === 0 ? 'Base (Arco-4)' : `+${i} nível${i > 1 ? 's' : ''}`;
        
        opcoesHTML += `
            <option value="${i}" ${selected} data-custo="${custo}">
                NH ${nhOpcao} - ${texto} (${custo} pontos)
            </option>
        `;
    }
    
    // Modal HTML
    const modalHTML = `
        <div style="background: linear-gradient(135deg, #2c3e50, #34495e); color: white; 
             padding: 20px; border-radius: 8px 8px 0 0; position: relative;">
            <span onclick="fecharModalTecnica()" style="position: absolute; right: 20px; top: 20px; 
                  font-size: 24px; cursor: pointer; color: #ffd700;">×</span>
            <h3 style="margin: 0; color: #ffd700;">${tecnica.nome}</h3>
            <div style="color: #95a5a6; margin-top: 5px;">
                <span style="background: ${tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12'}; 
                      padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                    ${tecnica.dificuldade}
                </span>
                • Arco-4
            </div>
        </div>
        
        <div style="padding: 20px; background: #1e1e28; color: #ccc;">
            <!-- Pré-requisitos -->
            <div style="background: rgba(155, 89, 182, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="color: #9b59b6; margin: 0 0 10px 0;">Pré-requisitos</h4>
                <div>Arco nível 4+ ✅</div>
                <div>Cavalgar qualquer ✅</div>
            </div>
            
            <!-- Estatísticas -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 15px; background: rgba(52, 152, 219, 0.1); border-radius: 8px;">
                    <div style="font-size: 12px; color: #95a5a6;">Base</div>
                    <div style="font-size: 28px; font-weight: bold; color: #3498db;">${nhBase}</div>
                    <div style="font-size: 11px; color: #7f8c8d;">Arco-4</div>
                </div>
                <div style="text-align: center; padding: 15px; background: rgba(39, 174, 96, 0.1); border-radius: 8px;">
                    <div style="font-size: 12px; color: #95a5a6;">Máximo</div>
                    <div style="font-size: 28px; font-weight: bold; color: #27ae60;">${limiteMaximo}</div>
                    <div style="font-size: 11px; color: #7f8c8d;">NH Arco</div>
                </div>
                <div style="text-align: center; padding: 15px; background: rgba(243, 156, 18, 0.1); border-radius: 8px;">
                    <div style="font-size: 12px; color: #95a5a6;">Atual</div>
                    <div style="font-size: 28px; font-weight: bold; color: #f39c12;">${nhAtual}</div>
                    <div style="font-size: 11px; color: #7f8c8d;">${niveisCompradosAtuais} nível(s)</div>
                </div>
            </div>
            
            <!-- Seleção -->
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 10px; color: #ffd700;">Níveis acima da base:</label>
                <select id="select-niveis-tecnica" style="width: 100%; padding: 10px; border-radius: 6px; 
                       background: #2c3e50; color: #ffd700; border: 2px solid #9b59b6;">
                    ${opcoesHTML}
                </select>
            </div>
            
            <!-- Custo -->
            <div style="background: rgba(39, 174, 96, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <div style="font-size: 14px; color: #95a5a6;">Custo Total</div>
                <div id="custo-display" style="font-size: 32px; font-weight: bold; color: #27ae60;">${custoTotalAtual} pontos</div>
            </div>
            
            <!-- Descrição -->
            <div>
                <h4 style="color: #ffd700; margin-bottom: 10px;">Descrição</h4>
                <p style="line-height: 1.5;">${tecnica.descricao}</p>
            </div>
        </div>
        
        <!-- Ações -->
        <div style="padding: 20px; background: #2c3e50; border-radius: 0 0 8px 8px; display: flex; gap: 15px; justify-content: flex-end;">
            <button onclick="fecharModalTecnica()" style="padding: 10px 20px; background: #7f8c8d; color: white; border: none; border-radius: 6px; cursor: pointer;">
                Cancelar
            </button>
            <button onclick="comprarTecnica()" id="btn-comprar-tecnica" style="padding: 10px 20px; background: linear-gradient(45deg, #9b59b6, #8e44ad); color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
                ${jaAprendida ? 'Atualizar' : 'Comprar'}
            </button>
        </div>
    `;
    
    // Inserir modal
    const modal = document.querySelector('.modal-tecnica');
    const overlay = document.querySelector('.modal-tecnica-overlay');
    
    if (modal && overlay) {
        modal.innerHTML = modalHTML;
        overlay.style.display = 'flex';
        estadoTecnicas.modalAberto = true;
        
        // Configurar evento de mudança
        const select = document.getElementById('select-niveis-tecnica');
        if (select) {
            select.addEventListener('change', function() {
                const niveis = parseInt(this.value);
                const custo = calcularCustoTecnica(niveis, tecnica.dificuldade);
                document.getElementById('custo-display').textContent = `${custo} pontos`;
            });
        }
    }
}

// ===== COMPRAR TÉCNICA =====
function comprarTecnica() {
    if (!estadoTecnicas.tecnicaSelecionada) return;
    
    const select = document.getElementById('select-niveis-tecnica');
    if (!select) return;
    
    const niveisComprados = parseInt(select.value);
    const custo = calcularCustoTecnica(niveisComprados, estadoTecnicas.tecnicaSelecionada.dificuldade);
    const tecnicaId = estadoTecnicas.tecnicaSelecionada.id;
    
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnicaId);
    
    if (index >= 0) {
        // Atualizar
        estadoTecnicas.tecnicasAprendidas[index] = {
            ...estadoTecnicas.tecnicasAprendidas[index],
            niveisComprados: niveisComprados,
            custoTotal: custo
        };
    } else {
        // Nova
        estadoTecnicas.tecnicasAprendidas.push({
            id: tecnicaId,
            nome: estadoTecnicas.tecnicaSelecionada.nome,
            dificuldade: estadoTecnicas.tecnicaSelecionada.dificuldade,
            basePericia: 'arco',
            modificadorBase: -4,
            niveisComprados: niveisComprados,
            custoTotal: custo
        });
    }
    
    // Salvar
    salvarTecnicas();
    
    // Atualizar
    atualizarTecnicasDisponiveis();
    fecharModalTecnica();
    
    alert(`✅ ${estadoTecnicas.tecnicaSelecionada.nome} comprada!\nCusto: ${custo} pontos`);
}

// ===== FUNÇÕES AUXILIARES =====
function fecharModalTecnica() {
    const overlay = document.querySelector('.modal-tecnica-overlay');
    if (overlay) overlay.style.display = 'none';
    estadoTecnicas.modalAberto = false;
    estadoTecnicas.tecnicaSelecionada = null;
}

function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
    } catch (e) {
        console.error("Erro ao salvar:", e);
    }
}

function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
        }
    } catch (e) {
        console.error("Erro ao carregar:", e);
    }
}

// ===== OBSERVAR MUDANÇAS NAS PERÍCIAS =====
function observarPericias() {
    setInterval(() => {
        if (window.estadoPericias) {
            atualizarTecnicasDisponiveis();
        }
    }, 1000);
}

// ===== INICIALIZAR =====
function inicializarSistemaTecnicas() {
    console.log("🚀 Inicializando sistema de técnicas...");
    
    // Carregar
    carregarTecnicas();
    
    // Observar perícias
    observarPericias();
    
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
            estadoTecnicas.filtroAtivo = this.getAttribute('data-filtro');
            renderizarCatalogoTecnicas();
        });
    });
    
    // Inicializar após 1 segundo
    setTimeout(() => {
        atualizarTecnicasDisponiveis();
        console.log("✅ Sistema de técnicas pronto!");
    }, 1000);
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (!window.sistemaTecnicasInicializado) {
            inicializarSistemaTecnicas();
            window.sistemaTecnicasInicializado = true;
        }
    }, 2000);
});

// ===== EXPORTAR =====
window.fecharModalTecnica = fecharModalTecnica;
window.comprarTecnica = comprarTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

console.log("✅ Módulo de técnicas carregado!");
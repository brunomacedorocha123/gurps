// ===== SISTEMA DE TÉCNICAS - VERSÃO 1.0 =====
// Sistema que respeita EXATAMENTE as regras do GURPS para técnicas
// Autor: DeepSeek AI - Baseado nas especificações do usuário
// Data: 2024

console.log("🏹 SISTEMA DE TÉCNICAS - INICIALIZANDO");

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
    tecnicaSelecionada: null,
    niveisCompradosSelecionados: 0
};

// ===== CONSTANTES DO SISTEMA =====
const TABELA_CUSTO = {
    'Difícil': [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // 0 níveis = 0pts, +1 = 2pts, +2 = 3pts...
    'Média':   [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]   // 0 níveis = 0pts, +1 = 1pt, +2 = 2pts...
};

// ===== FUNÇÕES PRINCIPAIS =====

// 1. OBTER VALOR DE ATRIBUTO
function obterValorAtributo(atributoId) {
    const elemento = document.getElementById(atributoId);
    return elemento ? parseInt(elemento.value) || 10 : 10;
}

// 2. BUSCAR PERÍCIA NO ESTADO ATUAL
function buscarPericiaNoEstado(idPericia) {
    if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
        return null;
    }
    
    // Buscar por ID exato
    const pericia = window.estadoPericias.periciasAprendidas.find(p => p.id === idPericia);
    if (pericia) return pericia;
    
    // Buscar por nome similar
    const periciaSimilar = window.estadoPericias.periciasAprendidas.find(p => 
        p.nome.toLowerCase().includes(idPericia.toLowerCase()) ||
        p.id.includes(idPericia)
    );
    
    return periciaSimilar || null;
}

// 3. VERIFICAR SE TEM CAVALGAR
function temCavalgar() {
    if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
        return false;
    }
    
    return window.estadoPericias.periciasAprendidas.some(p => 
        p.id.includes('cavalgar') || 
        p.nome.toLowerCase().includes('cavalgar') ||
        (p.grupo && p.grupo.toLowerCase() === 'cavalgar')
    );
}

// 4. CALCULAR NH DA PERÍCIA BASE
function calcularNHPericiaBase(idPericia) {
    const pericia = buscarPericiaNoEstado(idPericia);
    if (!pericia) {
        // Se não tem a perícia, retorna apenas o atributo base
        const atributo = pericia?.atributo || 'DX';
        return obterValorAtributo(atributo);
    }
    
    // Obter atributo base correto
    let atributoBase;
    switch(pericia.atributo) {
        case 'DX': atributoBase = obterValorAtributo('DX'); break;
        case 'IQ': atributoBase = obterValorAtributo('IQ'); break;
        case 'HT': atributoBase = obterValorAtributo('HT'); break;
        case 'PERC': atributoBase = obterValorAtributo('PERC'); break;
        default: atributoBase = 10;
    }
    
    // NH = Atributo + Nível
    return atributoBase + (pericia.nivel || 0);
}

// 5. VERIFICAR PRÉ-REQUISITOS DA TÉCNICA
function verificarPreRequisitosTecnica(tecnica) {
    const resultados = {
        passou: true,
        motivos: []
    };
    
    // Verificar Arco-4
    if (tecnica.preRequisitos && tecnica.preRequisitos.find(r => r.id === 'arco')) {
        const periciaArco = buscarPericiaNoEstado('arco');
        const nivelRequerido = 4; // Arquearia Montada requer Arco-4
        
        if (!periciaArco) {
            resultados.passou = false;
            resultados.motivos.push(`❌ Precisa da perícia Arco (nível mínimo: ${nivelRequerido})`);
        } else {
            const nhArco = calcularNHPericiaBase('arco');
            const nivelAtualArco = nhArco - obterValorAtributo('DX');
            
            if (nivelAtualArco < nivelRequerido) {
                resultados.passou = false;
                resultados.motivos.push(`❌ Arco precisa ter nível ${nivelRequerido} (atual: ${nivelAtualArco})`);
            }
        }
    }
    
    // Verificar Cavalgar
    if (tecnica.preRequisitos && tecnica.preRequisitos.find(r => r.tipo === 'cavalgar')) {
        if (!temCavalgar()) {
            resultados.passou = false;
            resultados.motivos.push('❌ Precisa de alguma perícia de Cavalgar');
        }
    }
    
    return resultados;
}

// 6. CALCULAR CUSTO DA TÉCNICA
function calcularCustoTecnica(niveisAcima, dificuldade) {
    if (niveisAcima < 0) return 0;
    
    const tabela = TABELA_CUSTO[dificuldade];
    if (!tabela) return 0;
    
    // Garantir que não exceda o array
    return tabela[Math.min(niveisAcima, tabela.length - 1)] || 0;
}

// 7. ATUALIZAR TÉCNICAS DISPONÍVEIS
function atualizarTecnicasDisponiveis() {
    console.log("🔄 Atualizando técnicas disponíveis...");
    
    if (!window.catalogoTecnicas || !window.catalogoTecnicas.obterTodasTecnicas) {
        console.error("❌ Catálogo de técnicas não carregado!");
        estadoTecnicas.tecnicasDisponiveis = [];
        return;
    }
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    
    estadoTecnicas.tecnicasDisponiveis = todasTecnicas.map(tecnica => {
        // Verificar pré-requisitos
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        
        // Verificar se já aprendeu
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        
        // Calcular NH base (ex: Arco-4)
        let nhBase = 0;
        let nhPericiaBase = 0;
        
        if (tecnica.basePericia) {
            nhPericiaBase = calcularNHPericiaBase(tecnica.basePericia);
            nhBase = nhPericiaBase + tecnica.modificadorBase;
            
            // Adicionar níveis comprados se já aprendida
            if (jaAprendida && jaAprendida.niveisComprados) {
                nhBase += jaAprendida.niveisComprados;
            }
            
            // Limitar ao máximo (não pode exceder NH da perícia base)
            if (tecnica.limiteMaximo) {
                const nhLimite = calcularNHPericiaBase(tecnica.limiteMaximo);
                nhBase = Math.min(nhBase, nhLimite);
            }
        }
        
        return {
            ...tecnica,
            disponivel: verificacao.passou,
            nhAtual: nhBase,
            nhPericiaBase: nhPericiaBase,
            motivoIndisponivel: verificacao.motivos.join(' | '),
            jaAprendida: !!jaAprendida,
            niveisComprados: jaAprendida ? jaAprendida.niveisComprados || 0 : 0,
            custoTotal: jaAprendida ? jaAprendida.custoTotal || 0 : 0
        };
    });
    
    console.log(`✅ ${estadoTecnicas.tecnicasDisponiveis.length} técnicas processadas`);
    renderizarCatalogoTecnicas();
}

// 8. RENDERIZAR CATÁLOGO DE TÉCNICAS
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("❌ Container #lista-tecnicas não encontrado!");
        return;
    }
    
    // Aplicar filtros
    const tecnicasFiltradas = estadoTecnicas.tecnicasDisponiveis.filter(tecnica => {
        // Filtro por dificuldade
        if (estadoTecnicas.filtroAtivo === 'medio-tecnicas' && tecnica.dificuldade !== 'Média') return false;
        if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas' && tecnica.dificuldade !== 'Difícil') return false;
        
        // Filtro por busca
        if (estadoTecnicas.buscaAtiva) {
            const busca = estadoTecnicas.buscaAtiva.toLowerCase();
            return tecnica.nome.toLowerCase().includes(busca) ||
                   tecnica.descricao.toLowerCase().includes(busca);
        }
        
        return true;
    });
    
    // Se não houver técnicas
    if (tecnicasFiltradas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia" style="text-align: center; padding: 40px; color: #95a5a6;">
                <i class="fas fa-tools" style="font-size: 48px; margin-bottom: 15px;"></i>
                <div style="font-size: 18px; margin-bottom: 10px;">Nenhuma técnica encontrada</div>
                <small>Verifique se você tem os pré-requisitos necessários</small>
            </div>
        `;
        return;
    }
    
    // Renderizar cada técnica
    let html = '';
    
    tecnicasFiltradas.forEach(tecnica => {
        const jaAprendida = tecnica.jaAprendida;
        const disponivel = tecnica.disponivel;
        const baseCalculo = tecnica.basePericia ? `${tecnica.basePericia}${tecnica.modificadorBase}` : '';
        
        html += `
            <div class="pericia-item ${!disponivel ? 'item-indisponivel' : ''}"
                data-id="${tecnica.id}"
                style="cursor: ${disponivel ? 'pointer' : 'not-allowed'};
                       opacity: ${disponivel ? '1' : '0.6'};
                       background: ${jaAprendida ? 'rgba(39, 174, 96, 0.15)' : 'rgba(50, 50, 65, 0.9)'};
                       border: 1px solid ${jaAprendida ? 'rgba(39, 174, 96, 0.4)' : 'rgba(255, 140, 0, 0.3)'};
                       border-radius: 8px;
                       padding: 15px;
                       margin-bottom: 10px;
                       transition: all 0.3s ease;">
                
                <!-- Cabeçalho -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <h4 style="margin: 0; color: ${jaAprendida ? '#27ae60' : '#ffd700'}; font-size: 16px;">
                        ${tecnica.nome}
                        ${jaAprendida ? '<span style="color: #27ae60; margin-left: 5px;">✓</span>' : ''}
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
                
                <!-- Descrição -->
                <p style="margin: 10px 0; color: #ccc; font-size: 14px; line-height: 1.4;">${tecnica.descricao}</p>
                
                <!-- Base de Cálculo -->
                <div style="font-size: 12px; color: #95a5a6; margin-bottom: 8px;">
                    <i class="fas fa-calculator"></i> Base: ${baseCalculo} 
                    (NH ${tecnica.nhPericiaBase}${tecnica.modificadorBase >= 0 ? '+' : ''}${tecnica.modificadorBase})
                </div>
                
                <!-- Motivo Indisponível -->
                ${!disponivel ? `
                    <div style="background: rgba(231, 76, 60, 0.1); border-left: 3px solid #e74c3c; 
                         padding: 8px 12px; margin-top: 10px; border-radius: 4px;">
                        <i class="fas fa-lock" style="color: #e74c3c;"></i> 
                        <span style="color: #e74c3c; margin-left: 5px; font-size: 12px;">${tecnica.motivoIndisponivel}</span>
                    </div>
                ` : ''}
                
                <!-- Info para clique -->
                ${disponivel ? `
                    <div style="margin-top: 10px; font-size: 12px; color: #95a5a6; display: flex; align-items: center;">
                        <i class="fas fa-bullseye" style="margin-right: 5px;"></i>
                        Clique para ${jaAprendida ? 'melhorar' : 'aprender'} esta técnica
                        ${tecnica.niveisComprados > 0 ? 
                            `<span style="margin-left: 10px; color: #f39c12;">(+${tecnica.niveisComprados} níveis)</span>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Adicionar eventos de clique
    const itens = container.querySelectorAll('.pericia-item');
    itens.forEach(item => {
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

// 9. ABRIR MODAL DE COMPRA/ATUALIZAÇÃO
function abrirModalTecnica(tecnica) {
    console.log(`📖 Abrindo modal para: ${tecnica.nome}`);
    
    estadoTecnicas.tecnicaSelecionada = tecnica;
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    
    // Calcular valores base
    const nhPericiaBase = calcularNHPericiaBase(tecnica.basePericia);
    const nhBase = nhPericiaBase + tecnica.modificadorBase; // Ex: Arco-4
    const limiteMaximo = nhPericiaBase; // Não pode exceder NH da perícia base
    
    // Calcular NH atual
    let nhAtual = nhBase;
    let niveisCompradosAtuais = 0;
    let custoTotalAtual = 0;
    
    if (jaAprendida) {
        niveisCompradosAtuais = jaAprendida.niveisComprados || 0;
        custoTotalAtual = jaAprendida.custoTotal || 0;
        nhAtual = nhBase + niveisCompradosAtuais;
        
        // Garantir que não exceda o limite
        if (nhAtual > limiteMaximo) {
            nhAtual = limiteMaximo;
            niveisCompradosAtuais = limiteMaximo - nhBase;
        }
    }
    
    // Calcular níveis possíveis
    const niveisPossiveis = Math.max(0, limiteMaximo - nhBase);
    
    console.log(`
    📊 DADOS TÉCNICOS:
    • NH ${tecnica.basePericia}: ${nhPericiaBase}
    • Base (${tecnica.basePericia}${tecnica.modificadorBase}): ${nhBase}
    • Máximo permitido: ${limiteMaximo}
    • Níveis possíveis acima da base: ${niveisPossiveis}
    • Níveis já comprados: ${niveisCompradosAtuais}
    `);
    
    // Gerar opções de níveis
    let opcoesHTML = '';
    
    for (let i = 0; i <= niveisPossiveis; i++) {
        const nhOpcao = nhBase + i;
        const custo = calcularCustoTecnica(i, tecnica.dificuldade);
        const selected = i === niveisCompradosAtuais ? 'selected' : '';
        const textoNivel = i === 0 ? 'Base' : `+${i} nível${i > 1 ? 's' : ''} acima`;
        
        opcoesHTML += `
            <option value="${i}" data-custo="${custo}" ${selected}>
                NH ${nhOpcao} - ${textoNivel} (${custo} pontos)
            </option>
        `;
    }
    
    // HTML do Modal
    const modalHTML = `
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2c3e50, #34495e); color: white; 
             padding: 20px; border-radius: 8px 8px 0 0; position: relative; border-bottom: 2px solid #9b59b6;">
            <span onclick="fecharModalTecnica()" 
                  style="position: absolute; right: 20px; top: 20px; font-size: 24px; 
                         cursor: pointer; color: #ffd700; font-weight: bold;">×</span>
            <h3 style="margin: 0; color: #ffd700; font-size: 20px;">${tecnica.nome}</h3>
            <div style="color: #95a5a6; margin-top: 5px; font-size: 14px;">
                <span style="background: ${tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12'}; 
                      padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                    ${tecnica.dificuldade}
                </span>
                • Técnica Especial • ${tecnica.basePericia}${tecnica.modificadorBase}
            </div>
        </div>
        
        <!-- Corpo -->
        <div style="padding: 20px; background: #1e1e28; color: #ccc; max-height: 60vh; overflow-y: auto;">
            
            <!-- Info de Pré-requisitos -->
            <div style="background: rgba(155, 89, 182, 0.1); padding: 15px; border-radius: 8px; 
                 border-left: 4px solid #9b59b6; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <i class="fas fa-check-circle" style="color: #9b59b6; font-size: 18px;"></i>
                    <h4 style="margin: 0; color: #9b59b6;">Pré-requisitos atendidos</h4>
                </div>
                <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 14px;">
                    <li>✅ ${tecnica.basePericia} nível ${-tecnica.modificadorBase} ou superior</li>
                    <li>✅ Alguma perícia de Cavalgar</li>
                </ul>
            </div>
            
            <!-- Estatísticas -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 15px; background: rgba(52, 152, 219, 0.1); 
                     border-radius: 8px; border: 1px solid rgba(52, 152, 219, 0.3);">
                    <div style="font-size: 12px; color: #95a5a6; margin-bottom: 5px;">Base</div>
                    <div style="font-size: 28px; font-weight: bold; color: #3498db;">${nhBase}</div>
                    <div style="font-size: 11px; color: #7f8c8d; margin-top: 5px;">${tecnica.basePericia}${tecnica.modificadorBase}</div>
                </div>
                <div style="text-align: center; padding: 15px; background: rgba(39, 174, 96, 0.1); 
                     border-radius: 8px; border: 1px solid rgba(39, 174, 96, 0.3);">
                    <div style="font-size: 12px; color: #95a5a6; margin-bottom: 5px;">Máximo</div>
                    <div style="font-size: 28px; font-weight: bold; color: #27ae60;">${limiteMaximo}</div>
                    <div style="font-size: 11px; color: #7f8c8d; margin-top: 5px;">NH em ${tecnica.basePericia}</div>
                </div>
                <div style="text-align: center; padding: 15px; background: rgba(243, 156, 18, 0.1); 
                     border-radius: 8px; border: 1px solid rgba(243, 156, 18, 0.3);">
                    <div style="font-size: 12px; color: #95a5a6; margin-bottom: 5px;">Atual</div>
                    <div style="font-size: 28px; font-weight: bold; color: #f39c12;">${nhAtual}</div>
                    <div style="font-size: 11px; color: #7f8c8d; margin-top: 5px;">${niveisCompradosAtuais} nível(s) extra</div>
                </div>
            </div>
            
            <!-- Seleção de Níveis -->
            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 10px; color: #ffd700; font-weight: bold; font-size: 16px;">
                    <i class="fas fa-chart-line" style="margin-right: 8px;"></i>
                    Níveis acima da base:
                </label>
                <select id="select-niveis-tecnica"
                    style="width: 100%; padding: 14px; border-radius: 8px; border: 2px solid #9b59b6;
                           background: #2c3e50; color: #ffd700; font-size: 16px; 
                           cursor: pointer; transition: all 0.3s ease;"
                    onfocus="this.style.boxShadow='0 0 0 3px rgba(155, 89, 182, 0.3)'"
                    onblur="this.style.boxShadow='none'">
                    ${opcoesHTML}
                </select>
                <div style="font-size: 13px; color: #95a5a6; margin-top: 8px;">
                    <i class="fas fa-info-circle" style="margin-right: 5px;"></i>
                    ${tecnica.dificuldade === 'Difícil' ? 
                        'Custo: 2 pontos para +1 nível, 3 para +2, 4 para +3...' : 
                        'Custo: 1 ponto por nível acima da base'}
                </div>
            </div>
            
            <!-- Custo -->
            <div style="background: rgba(39, 174, 96, 0.1); padding: 20px; border-radius: 8px;
                 border-left: 4px solid #27ae60; margin-bottom: 25px; text-align: center;">
                <div style="font-size: 14px; color: #95a5a6; margin-bottom: 8px;">
                    <i class="fas fa-coins" style="margin-right: 5px;"></i>
                    Custo Total
                </div>
                <div id="custo-display" style="font-size: 36px; font-weight: bold; color: #27ae60;">
                    ${custoTotalAtual} pontos
                </div>
                <div id="info-custo-detalhe" style="font-size: 13px; color: #7f8c8d; margin-top: 5px;">
                    ${jaAprendida ? 
                        `${niveisCompradosAtuais} nível(s) já comprado(s)` : 
                        'Nova técnica'}
                </div>
            </div>
            
            <!-- Descrição -->
            <div style="margin-bottom: 20px;">
                <h4 style="color: #ffd700; margin-bottom: 12px; font-size: 18px; border-bottom: 1px solid #34495e; padding-bottom: 5px;">
                    <i class="fas fa-scroll" style="margin-right: 8px;"></i>
                    Descrição
                </h4>
                <p style="line-height: 1.6; font-size: 14px; color: #ccc;">${tecnica.descricao}</p>
            </div>
            
            <!-- Regras -->
            <div style="background: rgba(155, 89, 182, 0.1); padding: 18px; border-radius: 8px;
                 border-left: 4px solid #9b59b6;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <i class="fas fa-gavel" style="color: #9b59b6; font-size: 18px;"></i>
                    <h5 style="color: #9b59b6; margin: 0; font-size: 16px;">Regras da Técnica</h5>
                </div>
                <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 13px; line-height: 1.5;">
                    <li><strong>NH Base</strong>: ${tecnica.basePericia}${tecnica.modificadorBase} (pré-definido)</li>
                    <li><strong>Níveis extras</strong>: Podem ser comprados acima da base</li>
                    <li><strong>Limite máximo</strong>: NH NUNCA pode exceder seu NH em ${tecnica.basePericia}</li>
                    <li><strong>Vantagem</strong>: Penalidades de cavalgar não reduzem abaixo do NH nesta técnica</li>
                    <li>Cada nível acima da base tem custo progressivo conforme tabela</li>
                </ul>
            </div>
        </div>
        
        <!-- Ações -->
        <div style="padding: 20px; background: #2c3e50; border-radius: 0 0 8px 8px; 
             display: flex; gap: 15px; justify-content: flex-end; border-top: 2px solid #34495e;">
            <button onclick="fecharModalTecnica()"
                style="padding: 12px 30px; background: #7f8c8d; color: white; border: none; 
                       border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px;
                       transition: all 0.3s ease; min-width: 120px;"
                onmouseover="this.style.backgroundColor='#95a5a6'"
                onmouseout="this.style.backgroundColor='#7f8c8d'">
                <i class="fas fa-times" style="margin-right: 8px;"></i>Cancelar
            </button>
            <button onclick="comprarTecnica()"
                id="btn-comprar-tecnica"
                style="padding: 12px 30px; background: linear-gradient(45deg, #9b59b6, #8e44ad);
                       color: white; border: none; border-radius: 6px; font-weight: bold; 
                       cursor: pointer; font-size: 14px; transition: all 0.3s ease; min-width: 120px;"
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(155, 89, 182, 0.4)'"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                <i class="fas fa-shopping-cart" style="margin-right: 8px;"></i>
                ${jaAprendida ? 'Atualizar' : 'Comprar'}
            </button>
        </div>
    `;
    
    // Inserir modal
    const modal = document.querySelector('.modal-tecnica');
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    
    if (!modal || !modalOverlay) {
        console.error("❌ Elementos do modal não encontrados!");
        return;
    }
    
    modal.innerHTML = modalHTML;
    modalOverlay.style.display = 'flex';
    estadoTecnicas.modalAberto = true;
    
    // Configurar evento do select
    const select = document.getElementById('select-niveis-tecnica');
    const custoDisplay = document.getElementById('custo-display');
    const btnComprar = document.getElementById('btn-comprar-tecnica');
    const infoDetalhe = document.getElementById('info-custo-detalhe');
    
    function atualizarCustoDisplay() {
        if (!select || !custoDisplay) return;
        
        const niveisSelecionados = parseInt(select.value);
        const custo = calcularCustoTecnica(niveisSelecionados, tecnica.dificuldade);
        
        custoDisplay.textContent = `${custo} pontos`;
        
        if (infoDetalhe) {
            if (jaAprendida) {
                if (niveisSelecionados === niveisCompradosAtuais) {
                    infoDetalhe.textContent = `${niveisCompradosAtuais} nível(s) já comprado(s)`;
                    infoDetalhe.style.color = '#95a5a6';
                } else if (niveisSelecionados > niveisCompradosAtuais) {
                    const diferenca = niveisSelecionados - niveisCompradosAtuais;
                    const custoDiferenca = custo - custoTotalAtual;
                    infoDetalhe.textContent = `+${diferenca} nível(s) (${custoDiferenca} pontos extras)`;
                    infoDetalhe.style.color = '#f39c12';
                } else {
                    const reducao = niveisCompradosAtuais - niveisSelecionados;
                    infoDetalhe.textContent = `Redução de ${reducao} nível(s)`;
                    infoDetalhe.style.color = '#e74c3c';
                }
            } else {
                infoDetalhe.textContent = niveisSelecionados === 0 ? 
                    'Apenas base (sem custo)' : 
                    `${niveisSelecionados} nível(s) acima da base`;
                infoDetalhe.style.color = '#95a5a6';
            }
        }
        
        if (btnComprar) {
            if (jaAprendida && niveisSelecionados === niveisCompradosAtuais) {
                btnComprar.innerHTML = '<i class="fas fa-check" style="margin-right: 8px;"></i> Sem alterações';
                btnComprar.style.background = '#95a5a6';
                btnComprar.disabled = true;
            } else {
                btnComprar.innerHTML = `${jaAprendida ? 'Atualizar' : 'Comprar'} por ${custo} pontos`;
                btnComprar.style.background = 'linear-gradient(45deg, #9b59b6, #8e44ad)';
                btnComprar.disabled = false;
            }
        }
    }
    
    if (select) {
        select.addEventListener('change', atualizarCustoDisplay);
        // Atualizar display inicial
        setTimeout(atualizarCustoDisplay, 100);
    }
}

// 10. COMPRAR/ATUALIZAR TÉCNICA
function comprarTecnica() {
    if (!estadoTecnicas.tecnicaSelecionada) {
        alert("❌ Erro: Nenhuma técnica selecionada!");
        return;
    }
    
    const select = document.getElementById('select-niveis-tecnica');
    if (!select) {
        alert("❌ Erro: Seletor de níveis não encontrado!");
        return;
    }
    
    const niveisComprados = parseInt(select.value);
    const custo = calcularCustoTecnica(niveisComprados, estadoTecnicas.tecnicaSelecionada.dificuldade);
    
    const tecnicaId = estadoTecnicas.tecnicaSelecionada.id;
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnicaId);
    
    if (index >= 0) {
        // Atualizar técnica existente
        estadoTecnicas.tecnicasAprendidas[index] = {
            ...estadoTecnicas.tecnicasAprendidas[index],
            niveisComprados: niveisComprados,
            custoTotal: custo,
            nhPericiaBaseNaCompra: calcularNHPericiaBase(estadoTecnicas.tecnicaSelecionada.basePericia),
            dataAtualizacao: new Date().toISOString()
        };
    } else {
        // Nova técnica
        estadoTecnicas.tecnicasAprendidas.push({
            id: tecnicaId,
            nome: estadoTecnicas.tecnicaSelecionada.nome,
            dificuldade: estadoTecnicas.tecnicaSelecionada.dificuldade,
            basePericia: estadoTecnicas.tecnicaSelecionada.basePericia,
            modificadorBase: estadoTecnicas.tecnicaSelecionada.modificadorBase,
            niveisComprados: niveisComprados,
            custoTotal: custo,
            nhPericiaBaseNaCompra: calcularNHPericiaBase(estadoTecnicas.tecnicaSelecionada.basePericia),
            dataAquisicao: new Date().toISOString()
        });
    }
    
    // Salvar
    salvarTecnicas();
    
    // Atualizar interface
    atualizarTecnicasDisponiveis();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
    
    // Fechar modal
    fecharModalTecnica();
    
    // Feedback
    setTimeout(() => {
        alert(`✅ ${estadoTecnicas.tecnicaSelecionada.nome} ${index >= 0 ? 'atualizada' : 'aprendida'}!\n\n• NH: ${calcularNHPericiaBase(estadoTecnicas.tecnicaSelecionada.basePericia) + estadoTecnicas.tecnicaSelecionada.modificadorBase + niveisComprados}\n• Custo: ${custo} pontos\n• Níveis extras: ${niveisComprados}`);
    }, 300);
}

// 11. RENDERIZAR TÉCNICAS APRENDIDAS
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) {
        console.warn("⚠️ Container #tecnicas-aprendidas não encontrado");
        return;
    }
    
    if (estadoTecnicas.tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia-aprendida" style="text-align: center; padding: 40px; color: #95a5a6;">
                <i class="fas fa-tools" style="font-size: 48px; margin-bottom: 15px; color: #9b59b6;"></i>
                <div style="font-size: 18px; margin-bottom: 10px;">Nenhuma técnica aprendida</div>
                <small>Aprenda técnicas no catálogo à esquerda</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        // Calcular NH atual
        const nhPericiaBaseAtual = calcularNHPericiaBase(tecnica.basePericia);
        const nhBase = nhPericiaBaseAtual + tecnica.modificadorBase;
        const nhAtual = nhBase + (tecnica.niveisComprados || 0);
        
        // Limitar ao máximo
        const nhFinal = Math.min(nhAtual, nhPericiaBaseAtual);
        
        html += `
            <div class="pericia-aprendida-item" style="background: rgba(155, 89, 182, 0.15); 
                 border: 1px solid rgba(155, 89, 182, 0.4); border-radius: 8px; padding: 15px; 
                 margin-bottom: 10px; position: relative; transition: all 0.3s ease;">
                
                <!-- Cabeçalho -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <h4 style="margin: 0; color: #ffd700; font-size: 16px;">
                        ${tecnica.nome}
                        <span style="color: #9b59b6; font-size: 0.9em; font-style: italic; margin-left: 5px;">
                            (${tecnica.basePericia}${tecnica.modificadorBase} + ${tecnica.niveisComprados || 0})
                        </span>
                    </h4>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <span style="background: #9b59b6; color: white; padding: 3px 10px; 
                              border-radius: 4px; font-size: 14px; font-weight: bold;">
                            NH ${nhFinal}
                        </span>
                        <span style="background: #27ae60; color: white; padding: 3px 10px; 
                              border-radius: 4px; font-size: 14px;">
                            ${tecnica.custoTotal || 0} pts
                        </span>
                    </div>
                </div>
                
                <!-- Detalhes -->
                <div style="font-size: 13px; color: #95a5a6; margin-top: 8px; line-height: 1.5;">
                    <div><strong>Base:</strong> ${tecnica.basePericia}${tecnica.modificadorBase} = NH ${nhBase}</div>
                    <div><strong>Níveis comprados:</strong> ${tecnica.niveisComprados || 0}</div>
                    <div><strong>NH em ${tecnica.basePericia}:</strong> ${nhPericiaBaseAtual} (limite máximo)</div>
                    <div><strong>Data:</strong> ${new Date(tecnica.dataAquisicao).toLocaleDateString('pt-BR')}</div>
                </div>
                
                <!-- Botão remover -->
                <button onclick="removerTecnica('${tecnica.id}')"
                    style="position: absolute; top: 15px; right: 15px; background: rgba(231, 76, 60, 0.2); 
                           color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.4); border-radius: 4px; 
                           width: 30px; height: 30px; cursor: pointer; transition: all 0.3s ease;"
                    onmouseover="this.style.backgroundColor='rgba(231, 76, 60, 0.4)'"
                    onmouseout="this.style.backgroundColor='rgba(231, 76, 60, 0.2)'">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 12. REMOVER TÉCNICA
function removerTecnica(id) {
    const tecnica = estadoTecnicas.tecnicasAprendidas.find(t => t.id === id);
    if (!tecnica) return;
    
    if (confirm(`Remover "${tecnica.nome}"?\n\nIsso removerá ${tecnica.custoTotal || 0} pontos investidos.`)) {
        estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
        salvarTecnicas();
        atualizarTecnicasDisponiveis();
        renderizarTecnicasAprendidas();
        atualizarEstatisticasTecnicas();
        
        console.log(`🗑️ Técnica "${tecnica.nome}" removida`);
    }
}

// 13. ATUALIZAR ESTATÍSTICAS
function atualizarEstatisticasTecnicas() {
    // Zerar
    estadoTecnicas.pontosTecnicasTotal = 0;
    estadoTecnicas.pontosMedio = 0;
    estadoTecnicas.pontosDificil = 0;
    estadoTecnicas.qtdMedio = 0;
    estadoTecnicas.qtdDificil = 0;
    
    // Calcular
    estadoTecnicas.tecnicasAprendidas.forEach(t => {
        const custo = t.custoTotal || 0;
        estadoTecnicas.pontosTecnicasTotal += custo;
        
        if (t.dificuldade === 'Média') {
            estadoTecnicas.qtdMedio++;
            estadoTecnicas.pontosMedio += custo;
        } else if (t.dificuldade === 'Difícil') {
            estadoTecnicas.qtdDificil++;
            estadoTecnicas.pontosDificil += custo;
        }
    });
    
    estadoTecnicas.qtdTotal = estadoTecnicas.qtdMedio + estadoTecnicas.qtdDificil;
    
    // Atualizar HTML
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
    
    // Badge total
    const badge = document.getElementById('pontos-tecnicas-total');
    if (badge) {
        badge.textContent = `[${estadoTecnicas.pontosTecnicasTotal} pts]`;
    }
    
    console.log(`📊 Estatísticas: ${estadoTecnicas.qtdTotal} técnicas, ${estadoTecnicas.pontosTecnicasTotal} pontos`);
}

// 14. FECHAR MODAL
function fecharModalTecnica() {
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
    estadoTecnicas.modalAberto = false;
    estadoTecnicas.tecnicaSelecionada = null;
    estadoTecnicas.niveisCompradosSelecionados = 0;
}

// 15. SALVAR/CARREGAR
function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
        console.log(`💾 Técnicas salvas: ${estadoTecnicas.tecnicasAprendidas.length}`);
    } catch (e) {
        console.error("❌ Erro ao salvar técnicas:", e);
    }
}

function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
            console.log(`📂 Carregadas ${estadoTecnicas.tecnicasAprendidas.length} técnicas salvas`);
        }
    } catch (e) {
        console.error("❌ Erro ao carregar técnicas:", e);
        estadoTecnicas.tecnicasAprendidas = [];
    }
}

// 16. CONFIGURAR EVENTOS
function configurarEventListenersTecnicas() {
    // Filtros
    document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const filtro = this.getAttribute('data-filtro');
            estadoTecnicas.filtroAtivo = filtro;
            
            // Atualizar botões ativos
            document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(b => {
                b.classList.remove('active');
            });
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
    document.addEventListener('click', function(e) {
        if (estadoTecnicas.modalAberto && 
            e.target.classList.contains('modal-tecnica-overlay')) {
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

// 17. OBSERVAR MUDANÇAS NAS PERÍCIAS
function observarMudancasPericias() {
    let ultimoEstado = '';
    
    setInterval(() => {
        if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) return;
        
        const estadoAtual = JSON.stringify(window.estadoPericias.periciasAprendidas.map(p => ({
            id: p.id,
            nome: p.nome,
            nivel: p.nivel,
            atributo: p.atributo
        })));
        
        if (estadoAtual !== ultimoEstado) {
            console.log("🔄 Perícias alteradas, atualizando técnicas...");
            ultimoEstado = estadoAtual;
            atualizarTecnicasDisponiveis();
            atualizarEstatisticasTecnicas();
        }
    }, 1000);
}

// 18. INICIALIZAR SISTEMA
function inicializarSistemaTecnicas() {
    console.log("🚀 INICIALIZANDO SISTEMA DE TÉCNICAS...");
    
    // Carregar técnicas salvas
    carregarTecnicas();
    
    // Configurar eventos
    configurarEventListenersTecnicas();
    
    // Observar perícias
    observarMudancasPericias();
    
    // Inicializar
    setTimeout(() => {
        atualizarTecnicasDisponiveis();
        renderizarTecnicasAprendidas();
        atualizarEstatisticasTecnicas();
        console.log("✅ SISTEMA DE TÉCNICAS INICIALIZADO COM SUCESSO!");
    }, 1000);
}

// 19. INICIALIZAÇÃO AUTOMÁTICA
document.addEventListener('DOMContentLoaded', function() {
    // Esperar aba de perícias carregar
    const verificarAba = setInterval(() => {
        const abaPericias = document.getElementById('pericias');
        if (abaPericias && abaPericias.style.display !== 'none') {
            clearInterval(verificarAba);
            
            setTimeout(() => {
                if (!window.sistemaTecnicasInicializado) {
                    inicializarSistemaTecnicas();
                    window.sistemaTecnicasInicializado = true;
                }
            }, 1500);
        }
    }, 500);
    
    // Observar mudança de abas
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const abaPericias = document.getElementById('pericias');
                if (abaPericias && abaPericias.style.display !== 'none') {
                    if (!window.sistemaTecnicasInicializado) {
                        setTimeout(() => {
                            inicializarSistemaTecnicas();
                            window.sistemaTecnicasInicializado = true;
                        }, 800);
                    } else {
                        // Já inicializado, apenas atualizar
                        atualizarTecnicasDisponiveis();
                    }
                }
            }
        });
    });
    
    // Observar a aba de perícias
    const abaPericias = document.getElementById('pericias');
    if (abaPericias) {
        observer.observe(abaPericias, { attributes: true, attributeFilter: ['style'] });
    }
});

// 20. EXPORTAR FUNÇÕES PARA USO GLOBAL
window.fecharModalTecnica = fecharModalTecnica;
window.comprarTecnica = comprarTecnica;
window.removerTecnica = removerTecnica;
window.atualizarTecnicasDisponiveis = atualizarTecnicasDisponiveis;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

console.log("🎯 MÓDULO DE TÉCNICAS CARREGADO E PRONTO!");
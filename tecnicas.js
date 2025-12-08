// ===== SISTEMA DE TÉCNICAS - VERSÃO OTIMIZADA =====
// Sistema completo e funcional para técnicas GURPS

console.log("🎯 SISTEMA DE TÉCNICAS - CARREGANDO SISTEMA OTIMIZADO");

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

// ===== CONSTANTES =====
const TABELA_CUSTO = {
    'Difícil': [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    'Média': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
};

// ===== FUNÇÕES DE BUSCA DE PERÍCIAS =====

function obterValorAtributo(atributoId) {
    // Primeiro tenta obter do sistema de atributos
    if (window.obterValorAtributoGlobal) {
        return window.obterValorAtributoGlobal(atributoId);
    }
    
    // Fallback para o método antigo
    const elemento = document.getElementById(atributoId);
    return elemento ? parseInt(elemento.value) || 10 : 10;
}

// ===== FUNÇÃO CRÍTICA: OBTER NH DA PERÍCIA =====
function obterNHPericia(idPericia) {
    console.log(`🔍 [TÉCNICA] Buscando NH para: "${idPericia}"`);
    
    // 1. Verificar se temos o sistema de perícias
    if (!window.estadoPericias) {
        console.error("❌ Sistema de perícias não carregado!");
        return 10;
    }
    
    // 2. Buscar a perícia nas aprendidas
    const periciaAprendida = window.estadoPericias.periciasAprendidas.find(p => {
        // Comparação por ID exato
        if (p.id === idPericia) return true;
        
        // Comparação por nome contendo
        if (p.nome && p.nome.toLowerCase().includes(idPericia.toLowerCase())) return true;
        
        // Para Arco
        if (idPericia === 'arco' && (p.id.includes('arco') || p.nome.includes('Arco'))) return true;
        
        return false;
    });
    
    if (periciaAprendida) {
        // 3. Obter atributo base
        let atributoBase;
        const atributo = periciaAprendida.atributo || 'DX';
        
        switch(atributo) {
            case 'DX': atributoBase = obterValorAtributo('DX'); break;
            case 'IQ': atributoBase = obterValorAtributo('IQ'); break;
            case 'HT': atributoBase = obterValorAtributo('HT'); break;
            case 'PERC': 
                const iq = obterValorAtributo('IQ');
                const bonusPercepcao = window.obterBonusPercepcao ? window.obterBonusPercepcao() : 0;
                atributoBase = iq + bonusPercepcao;
                break;
            default: atributoBase = 10;
        }
        
        // 4. Calcular NH: atributo + nível da perícia
        const nivel = periciaAprendida.nivel || 0;
        const nh = atributoBase + nivel;
        
        console.log(`✅ NH calculado para ${periciaAprendida.nome}: ${nh} (${atributo} ${atributoBase} + nível ${nivel})`);
        return nh;
    }
    
    // Se não encontrou a perícia aprendida
    console.log(`⚠️ Perícia "${idPericia}" não aprendida`);
    
    // Tentar obter do catálogo para base
    if (window.buscarPericiaPorId) {
        const periciaCatalogo = window.buscarPericiaPorId(idPericia);
        if (periciaCatalogo) {
            let atributoBase = 10;
            if (periciaCatalogo.atributo === 'DX') atributoBase = obterValorAtributo('DX');
            if (periciaCatalogo.atributo === 'IQ') atributoBase = obterValorAtributo('IQ');
            if (periciaCatalogo.atributo === 'HT') atributoBase = obterValorAtributo('HT');
            if (periciaCatalogo.atributo === 'PERC') {
                const iq = obterValorAtributo('IQ');
                const bonusPercepcao = window.obterBonusPercepcao ? window.obterBonusPercepcao() : 0;
                atributoBase = iq + bonusPercepcao;
            }
            
            console.log(`⚠️ Usando perícia do catálogo (nível 0): ${atributoBase}`);
            return atributoBase; // Retorna apenas o atributo (nível 0)
        }
    }
    
    // Fallback para Arco
    if (idPericia === 'arco' || idPericia.includes('arco')) {
        const dx = obterValorAtributo('DX');
        console.log(`⚠️ Usando DX base para Arco não aprendido: ${dx}`);
        return dx;
    }
    
    console.log(`❌ Não foi possível encontrar a perícia "${idPericia}"`);
    return 10;
}

// ===== FUNÇÕES DE VERIFICAÇÃO DE PRÉ-REQUISITOS =====
function verificarArcoNivel4() {
    // Buscar perícia Arco
    const periciaArco = window.estadoPericias?.periciasAprendidas?.find(p => 
        p.id === 'arco' || 
        p.nome.includes('Arco')
    );
    
    if (!periciaArco) {
        return { 
            tem: false, 
            nivel: 0, 
            motivo: "❌ Não possui a perícia Arco"
        };
    }
    
    const nivelAtual = periciaArco.nivel || 0;
    const nivelRequerido = 4;
    
    if (nivelAtual >= nivelRequerido) {
        return { 
            tem: true, 
            nivel: nivelAtual,
            motivo: `✅ Arco nível ${nivelAtual} (mínimo: ${nivelRequerido})`
        };
    } else {
        return { 
            tem: false, 
            nivel: nivelAtual,
            motivo: `❌ Arco precisa nível ${nivelRequerido} (atual: ${nivelAtual})`
        };
    }
}

function verificarCavalgar() {
    if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
        return { 
            tem: false, 
            motivo: "❌ Sistema de perícias não carregado"
        };
    }
    
    const cavalgar = window.estadoPericias.periciasAprendidas.find(p => 
        p.id.includes('cavalgar') || 
        p.nome.toLowerCase().includes('cavalgar')
    );
    
    if (cavalgar) {
        return { 
            tem: true, 
            motivo: `✅ ${cavalgar.nome}`
        };
    } else {
        return { 
            tem: false, 
            motivo: "❌ Precisa de alguma perícia de Cavalgar"
        };
    }
}

function verificarPreRequisitosTecnica(tecnica) {
    console.log(`📋 Verificando pré-requisitos para: ${tecnica.nome}`);
    
    const resultados = {
        passou: true,
        motivos: []
    };
    
    // Verificar Arco nível 4
    if (tecnica.basePericia === 'arco') {
        const arco = verificarArcoNivel4();
        resultados.passou = resultados.passou && arco.tem;
        resultados.motivos.push(arco.motivo);
    }
    
    // Verificar Cavalgar
    const cavalgar = verificarCavalgar();
    resultados.passou = resultados.passou && cavalgar.tem;
    resultados.motivos.push(cavalgar.motivo);
    
    console.log(`📊 Resultado: ${resultados.passou ? '✅ OK' : '❌ FALTA'}`);
    
    return resultados;
}

// ===== FUNÇÕES DE CUSTO E CÁLCULO =====
function calcularCustoTecnica(niveisAcima, dificuldade) {
    if (niveisAcima < 0) return 0;
    
    const tabela = TABELA_CUSTO[dificuldade];
    if (!tabela) return 0;
    
    return tabela[Math.min(niveisAcima, tabela.length - 1)] || 0;
}

function calcularNHCompleto(tecnica, niveisComprados = 0) {
    // 1. Obter NH da perícia base
    const nhPericia = obterNHPericia(tecnica.basePericia);
    
    // 2. Aplicar modificador base (ex: -4 para Arquearia Montada)
    let nhBase = nhPericia + tecnica.modificadorBase;
    
    // 3. Adicionar níveis comprados
    nhBase += niveisComprados;
    
    // 4. Aplicar limite máximo (não pode exceder NH da perícia base)
    const limiteMaximo = nhPericia;
    const nhFinal = Math.min(nhBase, limiteMaximo);
    
    console.log(`🧮 Cálculo NH ${tecnica.nome}:`);
    console.log(`   NH Perícia: ${nhPericia}`);
    console.log(`   Modificador: ${tecnica.modificadorBase}`);
    console.log(`   Níveis extras: +${niveisComprados}`);
    console.log(`   Limite máximo: ${limiteMaximo}`);
    console.log(`   NH Final: ${nhFinal}`);
    
    return {
        nhFinal: nhFinal,
        nhPericia: nhPericia,
        nhBase: nhPericia + tecnica.modificadorBase,
        limiteMaximo: limiteMaximo
    };
}

// ===== FUNÇÕES DE INTERFACE =====
function atualizarTecnicasDisponiveis() {
    console.log("🔄 Atualizando técnicas disponíveis...");
    
    if (!window.catalogoTecnicas || !window.catalogoTecnicas.obterTodasTecnicas) {
        console.error("❌ Catálogo de técnicas não carregado!");
        return;
    }
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    console.log(`📚 Técnicas no catálogo: ${todasTecnicas.length}`);
    
    estadoTecnicas.tecnicasDisponiveis = todasTecnicas.map(tecnica => {
        // Verificar pré-requisitos
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        
        // Verificar se já aprendeu
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        
        // Calcular NH atual
        const niveisComprados = jaAprendida ? jaAprendida.niveisComprados || 0 : 0;
        const calculoNH = calcularNHCompleto(tecnica, niveisComprados);
        
        return {
            ...tecnica,
            disponivel: verificacao.passou,
            nhAtual: calculoNH.nhFinal,
            nhPericia: calculoNH.nhPericia,
            nhBase: calculoNH.nhBase,
            limiteMaximo: calculoNH.limiteMaximo,
            motivoIndisponivel: verificacao.motivos.join(' | '),
            jaAprendida: !!jaAprendida,
            niveisComprados: niveisComprados,
            custoTotal: jaAprendida ? jaAprendida.custoTotal || 0 : 0
        };
    });
    
    renderizarCatalogoTecnicas();
}

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
                <small>Verifique os filtros ou pré-requisitos</small>
            </div>
        `;
        return;
    }
    
    // Renderizar técnicas
    let html = '';
    
    tecnicasFiltradas.forEach(tecnica => {
        const jaAprendida = tecnica.jaAprendida;
        const disponivel = tecnica.disponivel;
        const modificador = tecnica.modificadorBase >= 0 ? `+${tecnica.modificadorBase}` : tecnica.modificadorBase;
        const baseCalculo = tecnica.basePericia ? `${tecnica.basePericia}${modificador}` : '';
        
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
                
                <!-- Base de cálculo -->
                <div style="font-size: 12px; color: #95a5a6; margin-bottom: 8px;">
                    <i class="fas fa-calculator"></i> Base: ${baseCalculo} (Máx: NH ${tecnica.limiteMaximo})
                </div>
                
                <!-- Motivo indisponível -->
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

function abrirModalTecnica(tecnica) {
    console.log(`📖 Abrindo modal para: ${tecnica.nome}`);
    
    estadoTecnicas.tecnicaSelecionada = tecnica;
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    
    // Calcular valores
    const nhPericia = obterNHPericia(tecnica.basePericia);
    const modificador = tecnica.modificadorBase >= 0 ? `+${tecnica.modificadorBase}` : tecnica.modificadorBase;
    const nhBase = nhPericia + tecnica.modificadorBase;
    const limiteMaximo = nhPericia;
    
    // Valores atuais
    let nhAtual = nhBase;
    let niveisCompradosAtuais = 0;
    let custoTotalAtual = 0;
    
    if (jaAprendida) {
        niveisCompradosAtuais = jaAprendida.niveisComprados || 0;
        custoTotalAtual = jaAprendida.custoTotal || 0;
        nhAtual = nhBase + niveisCompradosAtuais;
        
        // Limitar
        if (nhAtual > limiteMaximo) {
            nhAtual = limiteMaximo;
            niveisCompradosAtuais = limiteMaximo - nhBase;
        }
    }
    
    // Níveis possíveis
    const niveisPossiveis = Math.max(0, limiteMaximo - nhBase);
    
    // Gerar opções
    let opcoesHTML = '';
    for (let i = 0; i <= niveisPossiveis; i++) {
        const nhOpcao = nhBase + i;
        const custo = calcularCustoTecnica(i, tecnica.dificuldade);
        const selected = i === niveisCompradosAtuais ? 'selected' : '';
        const textoNivel = i === 0 ? 'Base' : `+${i} nível${i > 1 ? 's' : ''}`;
        
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
                • ${tecnica.basePericia}${modificador}
            </div>
        </div>
        
        <!-- Corpo -->
        <div style="padding: 20px; background: #1e1e28; color: #ccc; max-height: 60vh; overflow-y: auto;">
            
            <!-- Pré-requisitos -->
            <div style="background: rgba(155, 89, 182, 0.1); padding: 15px; border-radius: 8px; 
                 border-left: 4px solid #9b59b6; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <i class="fas fa-check-circle" style="color: #9b59b6; font-size: 18px;"></i>
                    <h4 style="margin: 0; color: #9b59b6;">Pré-requisitos</h4>
                </div>
                <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 14px;">
                    <li>${verificarArcoNivel4().motivo}</li>
                    <li>${verificarCavalgar().motivo}</li>
                </ul>
            </div>
            
            <!-- Estatísticas -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 15px; background: rgba(52, 152, 219, 0.1); 
                     border-radius: 8px; border: 1px solid rgba(52, 152, 219, 0.3);">
                    <div style="font-size: 12px; color: #95a5a6; margin-bottom: 5px;">Base</div>
                    <div style="font-size: 28px; font-weight: bold; color: #3498db;">${nhBase}</div>
                    <div style="font-size: 11px; color: #7f8c8d; margin-top: 5px;">${tecnica.basePericia}${modificador}</div>
                </div>
                <div style="text-align: center; padding: 15px; background: rgba(39, 174, 96, 0.1); 
                     border-radius: 8px; border: 1px solid rgba(39, 174, 96, 0.3);">
                    <div style="font-size: 12px; color: #95a5a6; margin-bottom: 5px;">Máximo</div>
                    <div style="font-size: 28px; font-weight: bold; color: #27ae60;">${limiteMaximo}</div>
                    <div style="font-size: 11px; color: #7f8c8d; margin-top: 5px;">NH ${tecnica.basePericia}</div>
                </div>
                <div style="text-align: center; padding: 15px; background: rgba(243, 156, 18, 0.1); 
                     border-radius: 8px; border: 1px solid rgba(243, 156, 18, 0.3);">
                    <div style="font-size: 12px; color: #95a5a6; margin-bottom: 5px;">Atual</div>
                    <div style="font-size: 28px; font-weight: bold; color: #f39c12;">${nhAtual}</div>
                    <div style="font-size: 11px; color: #7f8c8d; margin-top: 5px;">${niveisCompradosAtuais} nível(s)</div>
                </div>
            </div>
            
            <!-- Cálculo detalhado -->
            <div style="background: rgba(52, 152, 219, 0.1); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="color: #3498db; margin-bottom: 10px; font-size: 16px;">
                    <i class="fas fa-calculator" style="margin-right: 8px;"></i>
                    Cálculo do NH
                </h4>
                <div style="font-size: 14px; line-height: 1.6;">
                    <div>NH ${tecnica.basePericia}: <strong>${nhPericia}</strong></div>
                    <div>Modificador base: <strong>${modificador}</strong></div>
                    <div>Níveis extras: <strong>+${niveisCompradosAtuais}</strong></div>
                    <div style="margin-top: 8px; border-top: 1px solid rgba(52, 152, 219, 0.3); padding-top: 8px;">
                        NH Final: <strong style="font-size: 18px; color: #f39c12;">${nhAtual}</strong>
                    </div>
                </div>
            </div>
            
            <!-- Seleção -->
            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 10px; color: #ffd700; font-weight: bold; font-size: 16px;">
                    <i class="fas fa-chart-line" style="margin-right: 8px;"></i>
                    Níveis acima da base:
                </label>
                <select id="select-niveis-tecnica"
                    style="width: 100%; padding: 14px; border-radius: 8px; border: 2px solid #9b59b6;
                           background: #2c3e50; color: #ffd700; font-size: 16px; 
                           cursor: pointer; transition: all 0.3s ease;">
                    ${opcoesHTML}
                </select>
                <div style="font-size: 13px; color: #95a5a6; margin-top: 8px;">
                    ${tecnica.dificuldade === 'Difícil' ? 
                        'Custo: 2 pontos para +1 nível, 3 para +2, 4 para +3...' : 
                        'Custo: 1 ponto por nível acima da base'}
                </div>
            </div>
            
            <!-- Custo -->
            <div style="background: rgba(39, 174, 96, 0.1); padding: 20px; border-radius: 8px;
                 border-left: 4px solid #27ae60; margin-bottom: 25px; text-align: center;">
                <div style="font-size: 14px; color: #95a5a6; margin-bottom: 8px;">
                    <i class="fas fa-coins"></i> Custo Total
                </div>
                <div id="custo-display" style="font-size: 36px; font-weight: bold; color: #27ae60;">
                    ${custoTotalAtual} pontos
                </div>
                <div id="info-custo-detalhe" style="font-size: 13px; color: #7f8c8d; margin-top: 5px;">
                    ${jaAprendida ? 'Técnica já aprendida' : 'Nova técnica'}
                </div>
            </div>
            
            <!-- Descrição -->
            <div style="margin-bottom: 20px;">
                <h4 style="color: #ffd700; margin-bottom: 12px; font-size: 18px;">
                    <i class="fas fa-scroll" style="margin-right: 8px;"></i>
                    Descrição
                </h4>
                <p style="line-height: 1.6; font-size: 14px; color: #ccc;">${tecnica.descricao}</p>
            </div>
        </div>
        
        <!-- Ações -->
        <div style="padding: 20px; background: #2c3e50; border-radius: 0 0 8px 8px; 
             display: flex; gap: 15px; justify-content: flex-end; border-top: 2px solid #34495e;">
            <button onclick="fecharModalTecnica()"
                style="padding: 12px 30px; background: #7f8c8d; color: white; border: none; 
                       border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px;
                       transition: all 0.3s ease; min-width: 120px;">
                <i class="fas fa-times" style="margin-right: 8px;"></i>Cancelar
            </button>
            <button onclick="comprarTecnica()"
                id="btn-comprar-tecnica"
                style="padding: 12px 30px; background: linear-gradient(45deg, #9b59b6, #8e44ad);
                       color: white; border: none; border-radius: 6px; font-weight: bold; 
                       cursor: pointer; font-size: 14px; transition: all 0.3s ease; min-width: 120px;">
                <i class="fas fa-shopping-cart" style="margin-right: 8px;"></i>
                ${jaAprendida ? 'Atualizar' : 'Comprar'}
            </button>
        </div>
    `;
    
    // Inserir modal
    const modal = document.querySelector('.modal-tecnica');
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    
    if (!modal || !modalOverlay) {
        console.error("❌ Modal não encontrado!");
        return;
    }
    
    modal.innerHTML = modalHTML;
    modalOverlay.style.display = 'flex';
    estadoTecnicas.modalAberto = true;
    
    // Configurar eventos
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
            if (jaAprendida && niveisSelecionados === niveisCompradosAtuais) {
                infoDetalhe.textContent = 'Sem alterações';
                infoDetalhe.style.color = '#95a5a6';
            } else if (jaAprendida) {
                const diferenca = Math.abs(niveisSelecionados - niveisCompradosAtuais);
                infoDetalhe.textContent = niveisSelecionados > niveisCompradosAtuais ? 
                    `+${diferenca} nível(s)` : 
                    `-${diferenca} nível(s)`;
                infoDetalhe.style.color = niveisSelecionados > niveisCompradosAtuais ? '#f39c12' : '#e74c3c';
            } else {
                infoDetalhe.textContent = niveisSelecionados === 0 ? 
                    'Apenas base' : 
                    `${niveisSelecionados} nível(s) extra`;
                infoDetalhe.style.color = '#95a5a6';
            }
        }
        
        if (btnComprar) {
            if (jaAprendida && niveisSelecionados === niveisCompradosAtuais) {
                btnComprar.innerHTML = '<i class="fas fa-check" style="margin-right: 8px;"></i> Sem alterações';
                btnComprar.style.background = '#95a5a6';
                btnComprar.disabled = true;
            } else {
                btnComprar.innerHTML = `<i class="fas fa-shopping-cart" style="margin-right: 8px;"></i>${jaAprendida ? 'Atualizar' : 'Comprar'} por ${custo} pontos`;
                btnComprar.style.background = 'linear-gradient(45deg, #9b59b6, #8e44ad)';
                btnComprar.disabled = false;
            }
        }
    }
    
    if (select) {
        select.addEventListener('change', atualizarCustoDisplay);
        setTimeout(atualizarCustoDisplay, 100);
    }
}

function comprarTecnica() {
    if (!estadoTecnicas.tecnicaSelecionada) {
        alert("❌ Erro: Nenhuma técnica selecionada!");
        return;
    }
    
    const select = document.getElementById('select-niveis-tecnica');
    if (!select) {
        alert("❌ Erro no sistema!");
        return;
    }
    
    const niveisComprados = parseInt(select.value);
    const custo = calcularCustoTecnica(niveisComprados, estadoTecnicas.tecnicaSelecionada.dificuldade);
    
    const tecnicaId = estadoTecnicas.tecnicaSelecionada.id;
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnicaId);
    
    if (index >= 0) {
        // Atualizar
        estadoTecnicas.tecnicasAprendidas[index] = {
            ...estadoTecnicas.tecnicasAprendidas[index],
            niveisComprados: niveisComprados,
            custoTotal: custo,
            dataAtualizacao: new Date().toISOString()
        };
    } else {
        // Nova
        estadoTecnicas.tecnicasAprendidas.push({
            id: tecnicaId,
            nome: estadoTecnicas.tecnicaSelecionada.nome,
            dificuldade: estadoTecnicas.tecnicaSelecionada.dificuldade,
            basePericia: estadoTecnicas.tecnicaSelecionada.basePericia,
            modificadorBase: estadoTecnicas.tecnicaSelecionada.modificadorBase,
            niveisComprados: niveisComprados,
            custoTotal: custo,
            dataAquisicao: new Date().toISOString()
        });
    }
    
    // Salvar
    salvarTecnicas();
    
    // Atualizar
    atualizarTecnicasDisponiveis();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
    
    // Fechar modal
    fecharModalTecnica();
    
    // Feedback
    alert(`✅ ${estadoTecnicas.tecnicaSelecionada.nome} ${index >= 0 ? 'atualizada' : 'aprendida'}!\nCusto: ${custo} pontos\nNíveis extras: ${niveisComprados}`);
}

function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    if (estadoTecnicas.tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia-aprendida" style="text-align: center; padding: 40px; color: #95a5a6;">
                <i class="fas fa-tools" style="font-size: 48px; margin-bottom: 15px; color: #9b59b6;"></i>
                <div style="font-size: 18px; margin-bottom: 10px;">Nenhuma técnica aprendida</div>
                <small>Aprenda técnicas no catálogo</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        // Calcular NH completo
        const calculo = calcularNHCompleto({
            basePericia: tecnica.basePericia,
            modificadorBase: tecnica.modificadorBase
        }, tecnica.niveisComprados || 0);
        
        const modificador = tecnica.modificadorBase >= 0 ? `+${tecnica.modificadorBase}` : tecnica.modificadorBase;
        const niveisExtras = tecnica.niveisComprados || 0;
        const textoNiveis = niveisExtras > 0 ? `+${niveisExtras}` : '';
        
        html += `
            <div class="pericia-aprendida-item" style="background: rgba(155, 89, 182, 0.15); 
                 border: 1px solid rgba(155, 89, 182, 0.4); border-radius: 8px; padding: 15px; 
                 margin-bottom: 10px; position: relative;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <h4 style="margin: 0; color: #ffd700; font-size: 16px;">
                        ${tecnica.nome}
                        <span style="color: #9b59b6; font-size: 0.9em; margin-left: 5px;">
                            (${tecnica.basePericia}${modificador}${textoNiveis ? ` + ${textoNiveis}` : ''})
                        </span>
                    </h4>
                    <div style="display: flex; gap: 10px;">
                        <span style="background: #9b59b6; color: white; padding: 3px 10px; border-radius: 4px; font-size: 14px;">
                            NH ${calculo.nhFinal}
                        </span>
                        <span style="background: #27ae60; color: white; padding: 3px 10px; border-radius: 4px; font-size: 14px;">
                            ${tecnica.custoTotal || 0} pts
                        </span>
                    </div>
                </div>
                
                <div style="font-size: 13px; color: #95a5a6; line-height: 1.5;">
                    <div><strong>Base:</strong> ${tecnica.basePericia}${modificador} = NH ${calculo.nhBase}</div>
                    <div><strong>Níveis comprados:</strong> ${niveisExtras}</div>
                    <div><strong>Máximo:</strong> NH ${calculo.limiteMaximo} em ${tecnica.basePericia}</div>
                    <div><strong>NH atual:</strong> ${calculo.nhFinal}</div>
                </div>
                
                <button onclick="removerTecnica('${tecnica.id}')"
                    style="position: absolute; top: 15px; right: 15px; background: rgba(231, 76, 60, 0.2); 
                           color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.4); border-radius: 4px; 
                           width: 30px; height: 30px; cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function removerTecnica(id) {
    const tecnica = estadoTecnicas.tecnicasAprendidas.find(t => t.id === id);
    if (!tecnica) return;
    
    if (confirm(`Remover "${tecnica.nome}"?\nIsso removerá ${tecnica.custoTotal || 0} pontos.`)) {
        estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
        salvarTecnicas();
        atualizarTecnicasDisponiveis();
        renderizarTecnicasAprendidas();
        atualizarEstatisticasTecnicas();
    }
}

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
}

function fecharModalTecnica() {
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
    estadoTecnicas.modalAberto = false;
    estadoTecnicas.tecnicaSelecionada = null;
}

function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
    } catch (e) {
        console.error("Erro ao salvar técnicas:", e);
    }
}

function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
        }
    } catch (e) {
        console.error("Erro ao carregar técnicas:", e);
    }
}

// ===== INTEGRAÇÃO COM PERÍCIAS =====
function observarMudancasPericias() {
    let ultimoEstado = '';
    
    setInterval(() => {
        if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
            console.log("⚠️ Aguardando sistema de perícias...");
            return;
        }
        
        const estadoAtual = JSON.stringify(window.estadoPericias.periciasAprendidas);
        if (estadoAtual !== ultimoEstado) {
            console.log("🔄 Perícias alteradas, atualizando técnicas...");
            ultimoEstado = estadoAtual;
            atualizarTecnicasDisponiveis();
            atualizarEstatisticasTecnicas();
        }
    }, 1000);
}

// ===== INICIALIZAÇÃO =====
function configurarEventListeners() {
    // Filtros
    document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const filtro = this.getAttribute('data-filtro');
            estadoTecnicas.filtroAtivo = filtro;
            
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
    
    // Fechar modal
    document.addEventListener('click', function(e) {
        if (estadoTecnicas.modalAberto && e.target.classList.contains('modal-tecnica-overlay')) {
            fecharModalTecnica();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && estadoTecnicas.modalAberto) {
            fecharModalTecnica();
        }
    });
}

function inicializarSistemaTecnicas() {
    console.log("🚀 INICIALIZANDO SISTEMA DE TÉCNICAS OTIMIZADO...");
    
    // Carregar dados
    carregarTecnicas();
    
    // Configurar eventos
    configurarEventListeners();
    
    // Observar mudanças nas perícias
    observarMudancasPericias();
    
    // Inicializar
    setTimeout(() => {
        atualizarTecnicasDisponiveis();
        renderizarTecnicasAprendidas();
        atualizarEstatisticasTecnicas();
        console.log("✅ SISTEMA DE TÉCNICAS PRONTO!");
    }, 1500);
}

// ===== EXPORTAR FUNÇÕES =====
window.fecharModalTecnica = fecharModalTecnica;
window.comprarTecnica = comprarTecnica;
window.removerTecnica = removerTecnica;
window.atualizarTecnicasDisponiveis = atualizarTecnicasDisponiveis;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;
window.obterNHPericia = obterNHPericia; // Exportar para debugging

// Inicialização automática
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (!window.sistemaTecnicasInicializado) {
            inicializarSistemaTecnicas();
            window.sistemaTecnicasInicializado = true;
        }
    }, 2000);
});

console.log("🎯 SISTEMA DE TÉCNICAS OTIMIZADO CARREGADO!");
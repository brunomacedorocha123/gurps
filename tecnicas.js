// ===== SISTEMA DE TÉCNICAS - VERSÃO FINAL CORRIGIDA =====
console.log("🚀 INICIANDO SISTEMA DE TÉCNICAS - VERSÃO CORRIGIDA");

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
    cacheNH: {}, // Cache para NH das perícias
    ultimaAtualizacao: null
};

// ===== SISTEMA DE CACHE E OBSERVAÇÃO =====
let cachePericias = {
    arco: { nivel: 0, nh: 0, timestamp: 0 },
    cavalgar: { temCavalgar: false, timestamp: 0 }
};

// ===== FUNÇÃO CRÍTICA: OBTER NH REAL DA PERÍCIA =====
function obterNHRealPericia(idPericia) {
    console.log(`🎯 [NH REAL] Buscando NH para: ${idPericia}`);
    
    // Verificar cache primeiro (performance)
    if (cachePericias[idPericia] && 
        (Date.now() - cachePericias[idPericia].timestamp) < 5000) {
        console.log(`📦 [CACHE] NH ${idPericia}: ${cachePericias[idPericia].nh}`);
        return cachePericias[idPericia].nh;
    }
    
    if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
        console.warn("⚠️ Sistema de perícias não disponível");
        const base = window.obterAtributoAtual ? window.obterAtributoAtual('DX') : 10;
        return base;
    }
    
    // BUSCA ESPECÍFICA PARA ARCO
    if (idPericia === 'arco') {
        // 1. Buscar perícia Arco nas perícias aprendidas
        const periciaArco = window.estadoPericias.periciasAprendidas.find(p => 
            p.id === 'arco'
        );
        
        if (periciaArco) {
            // 2. Obter atributo DX atual
            const atributoDX = window.obterAtributoAtual ? 
                window.obterAtributoAtual('DX') : 10;
            
            // 3. Calcular NH REAL: Atributo + Nível da Perícia
            const nhReal = atributoDX + periciaArco.nivel;
            
            // 4. Atualizar cache
            cachePericias.arco = {
                nivel: periciaArco.nivel,
                nh: nhReal,
                timestamp: Date.now()
            };
            
            console.log(`✅ [ARCO REAL] Encontrado! 
                DX: ${atributoDX} + Nível: ${periciaArco.nivel} = NH: ${nhReal}`);
            return nhReal;
        } else {
            // Arco não aprendido - usar apenas DX base
            const atributoDX = window.obterAtributoAtual ? 
                window.obterAtributoAtual('DX') : 10;
            
            cachePericias.arco = {
                nivel: 0,
                nh: atributoDX,
                timestamp: Date.now()
            };
            
            console.log(`ℹ️ [ARCO] Não aprendido, usando DX base: ${atributoDX}`);
            return atributoDX;
        }
    }
    
    // BUSCA PARA CAVALGAR (só verifica se existe)
    if (idPericia === 'cavalgar') {
        const temCavalgar = window.estadoPericias.periciasAprendidas.some(p => 
            p.id.includes('cavalgar') || 
            p.nome.toLowerCase().includes('cavalgar') ||
            (p.grupo && p.grupo.toLowerCase() === 'cavalgar')
        );
        
        cachePericias.cavalgar = {
            temCavalgar: temCavalgar,
            timestamp: Date.now()
        };
        
        return temCavalgar ? 1 : 0; // Retorna 1 se tem, 0 se não
    }
    
    console.warn(`⚠️ Perícia ${idPericia} não reconhecida`);
    return 10; // Fallback
}

// ===== FUNÇÃO: OBTER NÍVEL DA PERÍCIA =====
function obterNivelPericia(idPericia) {
    if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
        return 0;
    }
    
    const pericia = window.estadoPericias.periciasAprendidas.find(p => 
        p.id === idPericia
    );
    
    return pericia ? pericia.nivel : 0;
}

// ===== VERIFICAR PRÉ-REQUISITOS ATUALIZADA =====
function verificarPreRequisitosTecnica(tecnica) {
    console.log(`📋 Verificando pré-requisitos para: ${tecnica.nome}`);
    
    if (!tecnica.preRequisitos) {
        return { passou: true, motivo: '' };
    }
    
    // VERIFICAR ARCO-4
    const reqArco = tecnica.preRequisitos.find(req => req.idPericia === 'arco');
    if (reqArco) {
        const nivelArco = obterNivelPericia('arco');
        
        console.log(`📊 Arco - Nível necessário: ${reqArco.nivelMinimo}, Nível atual: ${nivelArco}`);
        
        if (nivelArco === 0) {
            return {
                passou: false,
                motivo: `❌ Precisa aprender a perícia Arco (nível mínimo: ${reqArco.nivelMinimo})`
            };
        }
        
        if (nivelArco < reqArco.nivelMinimo) {
            return {
                passou: false,
                motivo: `❌ Arco precisa ter nível ${reqArco.nivelMinimo} (atual: ${nivelArco})`
            };
        }
        
        console.log(`✅ Arco OK: nível ${nivelArco} >= ${reqArco.nivelMinimo}`);
    }
    
    // VERIFICAR CAVALGAR
    const reqCavalgar = tecnica.preRequisitos.find(req => req.idsCavalgar);
    if (reqCavalgar) {
        const temCavalgar = window.estadoPericias && 
            window.estadoPericias.periciasAprendidas && 
            window.estadoPericias.periciasAprendidas.some(p => 
                p.id.includes('cavalgar') || 
                p.nome.toLowerCase().includes('cavalgar') ||
                (p.grupo && p.grupo.toLowerCase() === 'cavalgar')
            );
        
        if (!temCavalgar) {
            return {
                passou: false,
                motivo: '❌ Precisa de alguma perícia de Cavalgar'
            };
        }
        
        console.log("✅ Cavalgar OK");
    }
    
    return { passou: true, motivo: '' };
}

// ===== OBSERVADOR DE MUDANÇAS NAS PERÍCIAS =====
function iniciarObservadorPericias() {
    console.log("👀 Iniciando observador de perícias...");
    
    let ultimoEstado = '';
    let ultimoDX = window.obterAtributoAtual ? window.obterAtributoAtual('DX') : 10;
    
    // Observar mudanças nas perícias
    setInterval(() => {
        if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
            return;
        }
        
        // 1. Verificar se perícias mudaram
        const estadoAtual = JSON.stringify(window.estadoPericias.periciasAprendidas.map(p => ({
            id: p.id,
            nivel: p.nivel
        })));
        
        // 2. Verificar se DX mudou
        const dxAtual = window.obterAtributoAtual ? window.obterAtributoAtual('DX') : 10;
        
        // 3. Se algo mudou, atualizar cache e técnicas
        if (estadoAtual !== ultimoEstado || dxAtual !== ultimoDX) {
            console.log("🔄 Mudança detectada! Atualizando técnicas...");
            console.log(`   - Estado perícias: ${estadoAtual !== ultimoEstado ? 'MUDOU' : 'igual'}`);
            console.log(`   - DX: ${ultimoDX} → ${dxAtual} ${dxAtual !== ultimoDX ? 'MUDOU' : 'igual'}`);
            
            // Limpar cache
            cachePericias = {
                arco: { nivel: 0, nh: 0, timestamp: 0 },
                cavalgar: { temCavalgar: false, timestamp: 0 }
            };
            
            // Atualizar variáveis de controle
            ultimoEstado = estadoAtual;
            ultimoDX = dxAtual;
            
            // Forçar atualização completa
            atualizarTecnicasDisponiveisForcado();
        }
    }, 800);
}

// ===== ATUALIZAÇÃO FORÇADA DAS TÉCNICAS =====
function atualizarTecnicasDisponiveisForcado() {
    console.log("🔄 ATUALIZAÇÃO FORÇADA de técnicas disponíveis");
    
    // Limpar cache
    estadoTecnicas.cacheNH = {};
    
    // Atualizar disponíveis
    atualizarTecnicasDisponiveis();
    
    // Se modal aberto, atualizar também
    if (estadoTecnicas.modalAberto && estadoTecnicas.tecnicaSelecionada) {
        setTimeout(() => {
            abrirModalTecnica(estadoTecnicas.tecnicaSelecionada);
        }, 300);
    }
}

// ===== TABELA DE CUSTO =====
function calcularCustoTecnica(niveisAcima, dificuldade) {
    if (niveisAcima <= 0) return 0;
    
    if (dificuldade === 'Difícil') {
        const custos = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        return custos[niveisAcima - 1] || (niveisAcima + 1);
    }
    
    if (dificuldade === 'Média') {
        return niveisAcima;
    }
    
    return 0;
}

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
    console.log("🔄 Atualizando técnicas disponíveis...");
    
    if (!window.catalogoTecnicas) {
        console.error("❌ Catálogo de técnicas não carregado!");
        return;
    }
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    
    const disponiveis = todasTecnicas.map(tecnica => {
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        
        // CALCULAR NH CORRETO: NH Arco real - 4
        let nhBase = 0;
        let nhArcoReal = 0;
        let nivelArco = 0;
        
        if (tecnica.baseCalculo && tecnica.baseCalculo.idPericia === 'arco') {
            // Obter NH REAL do Arco
            nhArcoReal = obterNHRealPericia('arco');
            nivelArco = obterNivelPericia('arco');
            
            // Base = NH Arco - 4
            nhBase = nhArcoReal + (tecnica.baseCalculo.redutor || 0);
            
            // Adicionar níveis comprados da técnica
            if (jaAprendida && jaAprendida.niveisComprados) {
                nhBase += jaAprendida.niveisComprados;
            }
            
            console.log(`📊 ${tecnica.nome}: 
                NH Arco REAL: ${nhArcoReal} 
                (DX ${window.obterAtributoAtual('DX')} + nível ${nivelArco})
                Base (Arco-4): ${nhBase}`);
        }
        
        return {
            ...tecnica,
            disponivel: verificacao.passou,
            nhAtual: nhBase,
            nhArcoReal: nhArcoReal,
            nivelArco: nivelArco,
            motivoIndisponivel: verificacao.motivo,
            jaAprendida: !!jaAprendida,
            niveisComprados: jaAprendida ? jaAprendida.niveisComprados || 0 : 0
        };
    });
    
    estadoTecnicas.tecnicasDisponiveis = disponiveis;
    estadoTecnicas.ultimaAtualizacao = new Date().toISOString();
    
    renderizarCatalogoTecnicas();
}

// ===== RENDERIZAR CATÁLOGO =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
    const tecnicasFiltradas = estadoTecnicas.tecnicasDisponiveis.filter(tecnica => {
        if (estadoTecnicas.filtroAtivo === 'medio-tecnicas' && tecnica.dificuldade !== 'Média') return false;
        if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas' && tecnica.dificuldade !== 'Difícil') return false;
        
        if (estadoTecnicas.buscaAtiva) {
            const busca = estadoTecnicas.buscaAtiva.toLowerCase();
            return tecnica.nome.toLowerCase().includes(busca) ||
                   tecnica.descricao.toLowerCase().includes(busca);
        }
        
        return true;
    });
    
    if (tecnicasFiltradas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia" style="text-align: center; padding: 40px; color: #95a5a6;">
                <i class="fas fa-tools" style="font-size: 48px; margin-bottom: 15px;"></i>
                <div style="font-size: 18px; margin-bottom: 10px;">Nenhuma técnica disponível</div>
                <small>Pré-requisitos: Arco nível 4 + Cavalgar (qualquer animal)</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    tecnicasFiltradas.forEach(tecnica => {
        const jaAprendida = tecnica.jaAprendida;
        const disponivel = tecnica.disponivel;
        
        html += `
            <div class="pericia-item ${!disponivel ? 'item-indisponivel' : ''}"
                data-id="${tecnica.id}"
                style="cursor: ${disponivel ? 'pointer' : 'not-allowed'};
                       opacity: ${disponivel ? '1' : '0.6'};
                       background: ${jaAprendida ? 'rgba(39, 174, 96, 0.15)' : 'rgba(50, 50, 65, 0.9)'};
                       border: 1px solid ${jaAprendida ? 'rgba(39, 174, 96, 0.4)' : 'rgba(255, 140, 0, 0.3)'};
                       border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <div>
                        <h4 style="margin: 0; color: ${jaAprendida ? '#27ae60' : '#ffd700'}; font-size: 16px;">
                            ${tecnica.nome}
                            ${jaAprendida ? '<span style="color: #27ae60; margin-left: 5px;">✓</span>' : ''}
                        </h4>
                        <div style="font-size: 12px; color: #95a5a6; margin-top: 5px;">
                            <i class="fas fa-bullseye"></i> Base: Arco-4 (NH Arco: ${tecnica.nhArcoReal})
                        </div>
                    </div>
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
                
                <p style="margin: 10px 0; color: #ccc; font-size: 14px;">${tecnica.descricao}</p>
                
                ${!disponivel ? `
                    <div style="background: rgba(231, 76, 60, 0.1); border-left: 3px solid #e74c3c; 
                         padding: 8px 12px; margin-top: 10px; border-radius: 4px;">
                        <i class="fas fa-lock" style="color: #e74c3c;"></i> 
                        <span style="color: #e74c3c; margin-left: 5px;">${tecnica.motivoIndisponivel}</span>
                    </div>
                ` : ''}
                
                ${disponivel ? `
                    <div style="margin-top: 10px; font-size: 12px; color: #95a5a6;">
                        <i class="fas fa-info-circle" style="margin-right: 5px;"></i>
                        Clique para ${jaAprendida ? 'melhorar' : 'aprender'}
                        ${tecnica.niveisComprados > 0 ? 
                            `(${tecnica.niveisComprados} nível(s) já comprado(s))` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Adicionar eventos
    container.querySelectorAll('.pericia-item:not(.item-indisponivel)').forEach(item => {
        item.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
            if (tecnica && tecnica.disponivel) {
                abrirModalTecnica(tecnica);
            }
        });
    });
}

// ===== ABRIR MODAL COM CÁLCULOS CORRETOS =====
function abrirModalTecnica(tecnica) {
    console.log(`🎯 Abrindo modal para: ${tecnica.nome}`);
    
    estadoTecnicas.tecnicaSelecionada = tecnica;
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    
    // CALCULAR VALORES COM NH REAL DO ARCO
    const nhArcoReal = obterNHRealPericia('arco');
    const nivelArco = obterNivelPericia('arco');
    const nhBase = nhArcoReal - 4; // Arco-4
    const nhMaximo = nhArcoReal; // Não pode exceder NH em Arco
    
    // Calcular NH atual
    let nhAtual = nhBase;
    let niveisComprados = 0;
    let custoTotal = 0;
    
    if (jaAprendida) {
        niveisComprados = jaAprendida.niveisComprados || 0;
        custoTotal = jaAprendida.custoTotal || 0;
        nhAtual = nhBase + niveisComprados;
    }
    
    // Níveis possíveis
    const niveisPossiveis = Math.max(0, nhMaximo - nhBase);
    
    console.log(`📊 MODAL - Cálculos:
        NH Arco REAL: ${nhArcoReal} (DX ${window.obterAtributoAtual('DX')} + nível ${nivelArco})
        Base (Arco-4): ${nhBase}
        Máximo: ${nhMaximo}
        Atual: ${nhAtual}
        Níveis já comprados: ${niveisComprados}
        Níveis possíveis: ${niveisPossiveis}`);
    
    // Opções de NH
    let opcoesHTML = '';
    
    for (let i = 0; i <= niveisPossiveis; i++) {
        const nhOpcao = nhBase + i;
        const custo = calcularCustoTecnica(i, tecnica.dificuldade);
        const selected = (nhBase + i) === nhAtual ? 'selected' : '';
        const textoNivel = i === 0 ? 'Base (Arco-4)' : `+${i} nível${i > 1 ? 's' : ''} acima`;
        
        opcoesHTML += `
            <option value="${i}" data-custo="${custo}" ${selected}>
                NH ${nhOpcao} - ${textoNivel} (${custo} pontos)
            </option>
        `;
    }
    
    // Criar modal
    const modalHTML = `
        <div style="background: linear-gradient(135deg, #2c3e50, #34495e); color: white; 
             padding: 20px; border-radius: 8px 8px 0 0; position: relative; border-bottom: 2px solid #ff8c00;">
            <span onclick="fecharModalTecnica()" 
                  style="position: absolute; right: 20px; top: 20px; font-size: 24px; 
                         cursor: pointer; color: #ffd700; font-weight: bold;">×</span>
            <h3 style="margin: 0; color: #ffd700;">${tecnica.nome}</h3>
            <div style="color: #95a5a6; margin-top: 5px;">
                <span style="background: ${tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12'}; 
                      padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                    ${tecnica.dificuldade}
                </span>
                • Técnica Especial • NH Base = Arco-4
            </div>
        </div>
        
        <div style="padding: 20px; background: #1e1e28; color: #ccc; max-height: 60vh; overflow-y: auto;">
            <!-- INFO NH ARCO -->
            <div style="background: rgba(52, 152, 219, 0.1); padding: 15px; border-radius: 8px; 
                 border-left: 4px solid #3498db; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <i class="fas fa-crosshairs" style="color: #3498db;"></i>
                    <h4 style="margin: 0; color: #3498db;">NH em Arco (Base de Cálculo)</h4>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px;">
                    <div style="text-align: center;">
                        <div style="font-size: 11px; color: #95a5a6;">Atributo DX</div>
                        <div style="font-size: 20px; font-weight: bold; color: #3498db;">
                            ${window.obterAtributoAtual('DX')}
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 11px; color: #95a5a6;">Nível em Arco</div>
                        <div style="font-size: 20px; font-weight: bold; color: ${nivelArco >= 0 ? '#27ae60' : '#e74c3c'}">
                            ${nivelArco >= 0 ? '+' : ''}${nivelArco}
                        </div>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(52, 152, 219, 0.3);">
                    <div style="font-size: 11px; color: #95a5a6;">NH Total em Arco</div>
                    <div style="font-size: 24px; font-weight: bold; color: #ffd700;">
                        ${nhArcoReal}
                    </div>
                    <div style="font-size: 12px; color: #7f8c8d;">
                        (DX ${window.obterAtributoAtual('DX')} ${nivelArco >= 0 ? '+' : ''}${nivelArco})
                    </div>
                </div>
            </div>
            
            <!-- ESTATÍSTICAS TÉCNICA -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 12px; background: rgba(155, 89, 182, 0.1); 
                     border-radius: 8px; border: 1px solid rgba(155, 89, 182, 0.3);">
                    <div style="font-size: 11px; color: #95a5a6;">Base (Arco-4)</div>
                    <div style="font-size: 22px; font-weight: bold; color: #9b59b6;">${nhBase}</div>
                    <div style="font-size: 10px; color: #7f8c8d;">${nhArcoReal} - 4</div>
                </div>
                <div style="text-align: center; padding: 12px; background: rgba(39, 174, 96, 0.1); 
                     border-radius: 8px; border: 1px solid rgba(39, 174, 96, 0.3);">
                    <div style="font-size: 11px; color: #95a5a6;">Máximo (NH Arco)</div>
                    <div style="font-size: 22px; font-weight: bold; color: #27ae60;">${nhMaximo}</div>
                    <div style="font-size: 10px; color: #7f8c8d;">Limite absoluto</div>
                </div>
                <div style="text-align: center; padding: 12px; background: rgba(243, 156, 18, 0.1); 
                     border-radius: 8px; border: 1px solid rgba(243, 156, 18, 0.3);">
                    <div style="font-size: 11px; color: #95a5a6;">Atual</div>
                    <div style="font-size: 22px; font-weight: bold; color: #f39c12;">${nhAtual}</div>
                    <div style="font-size: 10px; color: #7f8c8d;">${niveisComprados} nível(s)</div>
                </div>
            </div>
            
            <!-- SELEÇÃO DE NÍVEL -->
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; color: #ffd700; font-weight: bold;">
                    <i class="fas fa-level-up-alt" style="margin-right: 8px;"></i>
                    Níveis acima da base:
                </label>
                <select id="select-niveis-tecnica"
                    style="width: 100%; padding: 12px; border-radius: 6px; border: 2px solid #ff8c00;
                           background: #2c3e50; color: #ffd700; font-size: 14px; cursor: pointer;">
                    ${opcoesHTML}
                </select>
                <div style="font-size: 12px; color: #95a5a6; margin-top: 5px;">
                    <i class="fas fa-calculator" style="margin-right: 5px;"></i>
                    Cada nível custa ${tecnica.dificuldade === 'Média' ? '1 ponto' : 'valor progressivo'}
                </div>
            </div>
            
            <!-- CUSTO -->
            <div style="background: rgba(39, 174, 96, 0.1); padding: 15px; border-radius: 6px;
                 border-left: 4px solid #27ae60; margin-bottom: 20px; text-align: center;">
                <div style="font-size: 12px; color: #95a5a6;">Custo Total</div>
                <div id="custo-display" style="font-size: 28px; font-weight: bold; color: #27ae60;">
                    ${custoTotal} pontos
                </div>
                <div id="info-custo-detalhe" style="font-size: 12px; color: #7f8c8d; margin-top: 5px;">
                    ${jaAprendida ? `${niveisComprados} nível(s) já comprado(s)` : 'Nova técnica'}
                </div>
            </div>
            
            <!-- DESCRIÇÃO -->
            <div style="margin-bottom: 15px;">
                <h4 style="color: #ffd700; margin-bottom: 8px; font-size: 16px;">
                    <i class="fas fa-scroll" style="margin-right: 8px;"></i>
                    Descrição
                </h4>
                <p style="line-height: 1.5; font-size: 14px;">${tecnica.descricao}</p>
            </div>
            
            <!-- REGRAS -->
            <div style="background: rgba(155, 89, 182, 0.1); padding: 15px; border-radius: 6px;
                 border-left: 4px solid #9b59b6;">
                <h5 style="color: #9b59b6; margin-top: 0; margin-bottom: 10px;">
                    <i class="fas fa-gavel" style="margin-right: 8px;"></i>
                    Regras Importantes
                </h5>
                <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 13px; line-height: 1.4;">
                    <li><strong>Base:</strong> NH nesta técnica = NH em Arco - 4</li>
                    <li><strong>Limite:</strong> Nunca pode exceder seu NH em Arco</li>
                    <li><strong>Vantagem:</strong> Penalidades de disparo montado não reduzem abaixo deste NH</li>
                    <li><strong>Custo:</strong> ${tecnica.dificuldade === 'Média' ? '1 ponto por nível' : 'Progressivo (2, 3, 4, ... pontos)'}</li>
                </ul>
            </div>
        </div>
        
        <div style="padding: 20px; background: #2c3e50; border-radius: 0 0 8px 8px; 
             display: flex; gap: 10px; justify-content: flex-end;">
            <button onclick="fecharModalTecnica()"
                style="padding: 10px 20px; background: #7f8c8d; color: white; border: none; 
                       border-radius: 5px; cursor: pointer; font-weight: 600;">
                Cancelar
            </button>
            <button onclick="comprarTecnica()"
                id="btn-comprar-tecnica"
                style="padding: 10px 20px; background: linear-gradient(45deg, #ff8c00, #ffd700);
                       color: #1e1e28; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">
                ${jaAprendida ? 'Atualizar' : 'Comprar'}
            </button>
        </div>
    `;

    // Inserir modal
    const modal = document.querySelector('.modal-tecnica');
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    
    if (!modal || !modalOverlay) return;

    modal.innerHTML = modalHTML;
    modalOverlay.style.display = 'flex';
    estadoTecnicas.modalAberto = true;

    // Configurar eventos
    const select = document.getElementById('select-niveis-tecnica');
    const custoDisplay = document.getElementById('custo-display');
    const btnComprar = document.getElementById('btn-comprar-tecnica');
    const infoDetalhe = document.getElementById('info-custo-detalhe');

    function atualizarCusto() {
        if (!select || !custoDisplay) return;
        
        const niveisSelecionados = parseInt(select.value);
        const custo = calcularCustoTecnica(niveisSelecionados, tecnica.dificuldade);
        
        custoDisplay.textContent = `${custo} pontos`;
        
        if (infoDetalhe) {
            if (jaAprendida) {
                if (niveisSelecionados === niveisComprados) {
                    infoDetalhe.textContent = `${niveisComprados} nível(s) já comprado(s)`;
                } else if (niveisSelecionados > niveisComprados) {
                    const diferenca = niveisSelecionados - niveisComprados;
                    infoDetalhe.textContent = `+${diferenca} nível(s) (${niveisComprados} → ${niveisSelecionados})`;
                } else {
                    infoDetalhe.textContent = `${niveisSelecionados} nível(s)`;
                }
            } else {
                infoDetalhe.textContent = `${niveisSelecionados} nível(s) acima da base`;
            }
        }
        
        if (btnComprar) {
            if (jaAprendida && niveisSelecionados === niveisComprados) {
                btnComprar.textContent = 'Manter';
                btnComprar.style.background = '#95a5a6';
                btnComprar.disabled = true;
            } else {
                btnComprar.textContent = jaAprendida ? `Atualizar (${custo} pts)` : `Comprar (${custo} pts)`;
                btnComprar.style.background = 'linear-gradient(45deg, #ff8c00, #ffd700)';
                btnComprar.disabled = false;
            }
        }
    }

    if (select) {
        select.addEventListener('change', atualizarCusto);
        atualizarCusto();
    }
}

// ===== COMPRAR TÉCNICA =====
function comprarTecnica() {
    if (!estadoTecnicas.tecnicaSelecionada) {
        alert("❌ Erro: Nenhuma técnica selecionada!");
        return;
    }

    const select = document.getElementById('select-niveis-tecnica');
    if (!select) {
        alert("❌ Erro: Seletor não encontrado!");
        return;
    }

    const niveisComprados = parseInt(select.value);
    const custo = calcularCustoTecnica(niveisComprados, estadoTecnicas.tecnicaSelecionada.dificuldade);

    const tecnicaId = estadoTecnicas.tecnicaSelecionada.id;
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnicaId);

    if (index >= 0) {
        estadoTecnicas.tecnicasAprendidas[index] = {
            ...estadoTecnicas.tecnicasAprendidas[index],
            niveisComprados: niveisComprados,
            custoTotal: custo,
            nhArcoNaCompra: obterNHRealPericia('arco'),
            dataAtualizacao: new Date().toISOString()
        };
    } else {
        estadoTecnicas.tecnicasAprendidas.push({
            id: tecnicaId,
            nome: estadoTecnicas.tecnicaSelecionada.nome,
            dificuldade: estadoTecnicas.tecnicaSelecionada.dificuldade,
            niveisComprados: niveisComprados,
            custoTotal: custo,
            nhArcoNaCompra: obterNHRealPericia('arco'),
            dataAquisicao: new Date().toISOString(),
            baseCalculo: estadoTecnicas.tecnicaSelecionada.baseCalculo
        });
    }

    salvarTecnicas();
    atualizarTecnicasDisponiveis();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
    fecharModalTecnica();

    alert(`✅ ${estadoTecnicas.tecnicaSelecionada.nome} ${index >= 0 ? 'atualizada' : 'aprendida'}!\n\n• Custo: ${custo} pontos\n• Níveis: ${niveisComprados}\n• NH final: ${obterNHRealPericia('arco') - 4 + niveisComprados}`);
}

// ===== RENDERIZAR TÉCNICAS APRENDIDAS =====
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;

    if (estadoTecnicas.tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia-aprendida" style="text-align: center; padding: 40px; color: #95a5a6;">
                <i class="fas fa-tools" style="font-size: 48px; margin-bottom: 15px; color: #9b59b6;"></i>
                <div style="font-size: 18px; margin-bottom: 10px;">Nenhuma técnica aprendida</div>
                <small>Compre técnicas para ver detalhes aqui</small>
            </div>
        `;
        return;
    }

    let html = '';

    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        const nhArco = obterNHRealPericia('arco');
        const nhBase = nhArco - 4;
        const nhAtual = nhBase + (tecnica.niveisComprados || 0);
        
        html += `
            <div class="pericia-aprendida-item" style="background: rgba(155, 89, 182, 0.15); 
                 border: 1px solid rgba(155, 89, 182, 0.4); border-radius: 8px; padding: 15px; 
                 margin-bottom: 10px; position: relative;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <h4 style="margin: 0; color: #e67e22; font-size: 16px;">
                        ${tecnica.nome}
                        <span style="color: #f39c12; font-size: 0.9em; font-style: italic; margin-left: 5px;">
                            (Arco-4 + ${tecnica.niveisComprados || 0})
                        </span>
                    </h4>
                    <div style="display: flex; gap: 10px;">
                        <span style="background: #2ecc71; color: white; padding: 3px 10px; border-radius: 4px; font-size: 14px;">
                            NH ${nhAtual}
                        </span>
                        <span style="background: #3498db; color: white; padding: 3px 10px; border-radius: 4px; font-size: 14px;">
                            ${tecnica.custoTotal || 0} pts
                        </span>
                    </div>
                </div>
                
                <div style="font-size: 13px; color: #95a5a6; line-height: 1.5;">
                    <div><strong>Níveis comprados:</strong> ${tecnica.niveisComprados || 0}</div>
                    <div><strong>Base (Arco-4):</strong> ${nhBase} (NH Arco atual: ${nhArco})</div>
                    <div><strong>Máximo possível:</strong> ${nhArco}</div>
                    <div><strong>Custo total:</strong> ${tecnica.custoTotal || 0} pontos</div>
                    ${tecnica.nhArcoNaCompra ? `
                    <div><strong>NH Arco na compra:</strong> ${tecnica.nhArcoNaCompra}</div>
                    ` : ''}
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

// ===== FUNÇÕES RESTANTES (MANTIDAS) =====
function removerTecnica(id) {
    const tecnica = estadoTecnicas.tecnicasAprendidas.find(t => t.id === id);
    if (!tecnica) return;
    
    if (confirm(`Remover "${tecnica.nome}"?\n\n${tecnica.custoTotal || 0} pontos serão perdidos.`)) {
        estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
        salvarTecnicas();
        atualizarTecnicasDisponiveis();
        renderizarTecnicasAprendidas();
        atualizarEstatisticasTecnicas();
    }
}

function atualizarEstatisticasTecnicas() {
    estadoTecnicas.pontosTecnicasTotal = 0;
    estadoTecnicas.pontosMedio = 0;
    estadoTecnicas.pontosDificil = 0;
    estadoTecnicas.qtdMedio = 0;
    estadoTecnicas.qtdDificil = 0;

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

function fecharModalTecnica() {
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) modalOverlay.style.display = 'none';
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
        if (salvo) estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
    } catch (e) {
        console.error("Erro ao carregar técnicas:", e);
    }
}

function configurarEventListenersTecnicas() {
    document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
        btn.addEventListener('click', function() {
            estadoTecnicas.filtroAtivo = this.getAttribute('data-filtro');
            document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
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

// ===== INICIALIZAÇÃO COMPLETA =====
function inicializarSistemaTecnicas() {
    console.log("🚀 INICIALIZANDO SISTEMA DE TÉCNICAS - VERSÃO CORRIGIDA");
    
    carregarTecnicas();
    configurarEventListenersTecnicas();
    iniciarObservadorPericias();
    
    setTimeout(() => {
        atualizarTecnicasDisponiveis();
        renderizarTecnicasAprendidas();
        atualizarEstatisticasTecnicas();
        console.log("✅ SISTEMA DE TÉCNICAS 100% FUNCIONAL!");
    }, 1000);
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
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

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const abaPericias = document.getElementById('pericias');
                if (abaPericias && abaPericias.style.display !== 'none') {
                    if (!window.sistemaTecnicasInicializado) {
                        setTimeout(() => {
                            inicializarSistemaTecnicas();
                            window.sistemaTecnicasInicializado = true;
                        }, 1000);
                    } else {
                        atualizarTecnicasDisponiveisForcado();
                    }
                }
            }
        });
    });

    const abaPericias = document.getElementById('pericias');
    if (abaPericias) {
        observer.observe(abaPericias, { attributes: true, attributeFilter: ['style'] });
    }
});

// ===== EXPORTAR FUNÇÕES =====
window.fecharModalTecnica = fecharModalTecnica;
window.comprarTecnica = comprarTecnica;
window.removerTecnica = removerTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

console.log("🎮 Módulo de técnicas corrigido carregado!");
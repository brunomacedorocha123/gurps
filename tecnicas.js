// ===== SISTEMA DE TÉCNICAS - ATUALIZAÇÃO EM TEMPO REAL =====
console.log("🎯 SISTEMA DE TÉCNICAS - TEMPO REAL");

// ===== 1. ESTADO DO SISTEMA =====
const estadoTecnicas = {
    aprendidas: [],
    disponiveis: [],
    pontosTotal: 0,
    ultimoNHArco: 0,
    observandoPericias: false,
    // Novos campos para tracking
    tecnicasMedias: 0,
    tecnicasDificeis: 0,
    pontosMedias: 0,
    pontosDificeis: 0
};

// ===== 2. FUNÇÕES PRINCIPAIS =====

// 2.1 Obter NH REAL do Arco (COM CACHE)
function obterNHArcoReal(forceUpdate = false) {
    if (!forceUpdate && estadoTecnicas.ultimoNHArco > 0) {
        return estadoTecnicas.ultimoNHArco;
    }
    
    console.log("🎯 Calculando NH REAL do Arco...");
    
    let nhArco = 10; // Default
    
    // PRIMEIRO: Tentar pegar NH DIRETO da perícia
    if (window.estadoPericias?.periciasAprendidas) {
        const arco = window.estadoPericias.periciasAprendidas.find(p => p.id === 'arco');
        if (arco && arco.nh) {
            nhArco = arco.nh;
            console.log(`✅ NH do Arco (direto): ${nhArco}`);
        }
    }
    
    // SEGUNDO: Tentar do localStorage
    if (nhArco === 10) {
        try {
            const salvo = localStorage.getItem('periciasAprendidas');
            if (salvo) {
                const pericias = JSON.parse(salvo);
                const arco = pericias.find(p => p.id === 'arco');
                if (arco && arco.nh) {
                    nhArco = arco.nh;
                    console.log(`✅ NH do Arco (localStorage): ${nhArco}`);
                }
            }
        } catch (e) {}
    }
    
    // Cache
    estadoTecnicas.ultimoNHArco = nhArco;
    return nhArco;
}

// 2.2 Observar mudanças nas perícias (ATUALIZAÇÃO EM TEMPO REAL)
function observarMudancasPericias() {
    if (estadoTecnicas.observandoPericias) return;
    
    console.log("👀 Observando mudanças nas perícias...");
    
    // Observar localStorage (mudanças salvas)
    window.addEventListener('storage', function(e) {
        if (e.key === 'periciasAprendidas') {
            console.log("📦 Perícias atualizadas no localStorage!");
            estadoTecnicas.ultimoNHArco = 0; // Reset cache
            atualizarTecnicaNaTela();
        }
    });
    
    // Observar estadoPericias (mudanças em memória)
    let ultimoEstado = '';
    const intervalo = setInterval(() => {
        if (window.estadoPericias?.periciasAprendidas) {
            const estadoAtual = JSON.stringify(window.estadoPericias.periciasAprendidas);
            if (estadoAtual !== ultimoEstado) {
                console.log("🔄 Estado das perícias mudou!");
                ultimoEstado = estadoAtual;
                estadoTecnicas.ultimoNHArco = 0; // Reset cache
                atualizarTecnicaNaTela();
            }
        }
    }, 1000); // Verificar a cada 1 segundo
    
    estadoTecnicas.observandoPericias = true;
    estadoTecnicas.intervaloObservacao = intervalo;
}

// 2.3 Verificar se tem Cavalgar
function verificarTemCavalgar() {
    // 1. No estadoPericias
    if (window.estadoPericias?.periciasAprendidas) {
        const cavalgar = window.estadoPericias.periciasAprendidas.find(p => 
            p.id.includes('cavalgar') || p.nome.includes('Cavalgar')
        );
        if (cavalgar) return true;
    }
    
    // 2. No localStorage
    try {
        const salvo = localStorage.getItem('periciasAprendidas');
        if (salvo) {
            const pericias = JSON.parse(salvo);
            return pericias.some(p => 
                p.id.includes('cavalgar') || p.nome.includes('Cavalgar')
            );
        }
    } catch (e) {}
    
    return false;
}

// 2.4 Verificar pré-requisitos (ATUALIZADO EM TEMPO REAL)
function verificarPreRequisitosTecnica() {
    const nhArco = obterNHArcoReal();
    const dx = 10;
    const nivelArco = nhArco - dx;
    
    // CORREÇÃO GURPS: Default DX-5 = nível -5
    const temArcoNecessario = nivelArco > -5;
    const temCavalgar = verificarTemCavalgar();
    const pode = temArcoNecessario && temCavalgar;
    
    return {
        pode: pode,
        motivo: !temArcoNecessario ? `Arco precisa ter pelo menos 1 ponto` : 
                !temCavalgar ? 'Falta Cavalgar' : 'OK',
        nhArco: nhArco,
        nivelArco: nivelArco
    };
}

// 2.5 Calcular custo da técnica
function calcularCustoNiveis(niveis) {
    if (niveis <= 0) return 0;
    // Tabela técnica difícil: +1=2, +2=3, +3=4, +4=5...
    return niveis + 1;
}

// 2.6 Atualizar estatísticas das técnicas
function atualizarEstatisticasTecnicas() {
    // Reset contadores
    estadoTecnicas.tecnicasMedias = 0;
    estadoTecnicas.tecnicasDificeis = 0;
    estadoTecnicas.pontosMedias = 0;
    estadoTecnicas.pontosDificeis = 0;
    
    // Calcular estatísticas
    estadoTecnicas.aprendidas.forEach(tecnica => {
        if (tecnica.dificuldade === 'Média') {
            estadoTecnicas.tecnicasMedias++;
            estadoTecnicas.pontosMedias += tecnica.custoTotal || 0;
        } else if (tecnica.dificuldade === 'Difícil') {
            estadoTecnicas.tecnicasDificeis++;
            estadoTecnicas.pontosDificeis += tecnica.custoTotal || 0;
        }
    });
    
    // Atualizar total
    estadoTecnicas.pontosTotal = estadoTecnicas.pontosMedias + estadoTecnicas.pontosDificeis;
    
    // Atualizar na interface
    atualizarDisplayEstatisticas();
}

// 2.7 Atualizar display das estatísticas
function atualizarDisplayEstatisticas() {
    // Atualizar quantidade de técnicas
    const qtdMedio = document.getElementById('qtd-tecnicas-medio');
    const qtdDificil = document.getElementById('qtd-tecnicas-dificil');
    const qtdTotal = document.getElementById('qtd-tecnicas-total');
    
    if (qtdMedio) qtdMedio.textContent = estadoTecnicas.tecnicasMedias;
    if (qtdDificil) qtdDificil.textContent = estadoTecnicas.tecnicasDificeis;
    if (qtdTotal) qtdTotal.textContent = estadoTecnicas.tecnicasMedias + estadoTecnicas.tecnicasDificeis;
    
    // Atualizar pontos gastos
    const ptsMedio = document.getElementById('pts-tecnicas-medio');
    const ptsDificil = document.getElementById('pts-tecnicas-dificil');
    const ptsTotal = document.getElementById('pts-tecnicas-total');
    
    if (ptsMedio) ptsMedio.textContent = `(${estadoTecnicas.pontosMedias} pts)`;
    if (ptsDificil) ptsDificil.textContent = `(${estadoTecnicas.pontosDificeis} pts)`;
    if (ptsTotal) ptsTotal.textContent = `(${estadoTecnicas.pontosTotal} pts)`;
    
    // Atualizar badge do total
    const badgeTotal = document.getElementById('pontos-tecnicas-total');
    if (badgeTotal) badgeTotal.textContent = `[${estadoTecnicas.pontosTotal} pts]`;
}

// ===== 3. ATUALIZAR TÉCNICA NA TELA (FUNÇÃO PRINCIPAL) =====
function atualizarTecnicaNaTela() {
    console.log("🔄 Atualizando técnica na tela...");
    
    // Encontrar container
    let container = document.getElementById('lista-tecnicas');
    if (!container) {
        container = document.querySelector('.catalog-list-pericias');
    }
    
    if (!container) {
        console.warn("Container não encontrado, tentando novamente em 500ms...");
        setTimeout(atualizarTecnicaNaTela, 500);
        return;
    }
    
    // Verificar pré-requisitos ATUALIZADOS
    const prereq = verificarPreRequisitosTecnica();
    const nhBase = prereq.nhArco - 4;
    const maxNiveis = prereq.nhArco - nhBase;
    
    // Verificar se já tem técnica aprendida
    const tecnicaAprendida = estadoTecnicas.aprendidas.find(t => t.id === 'arquearia-montada');
    const niveisComprados = tecnicaAprendida ? tecnicaAprendida.niveisComprados || 0 : 0;
    const nhAtual = nhBase + niveisComprados;
    
    // Verificar se já existe um card de técnica
    const tecnicaExistente = document.getElementById('tecnica-arquearia-montada');
    
    if (!tecnicaExistente) {
        // Criar elemento da técnica
        const tecnicaDiv = document.createElement('div');
        tecnicaDiv.id = 'tecnica-arquearia-montada';
        tecnicaDiv.className = `pericia-item ${!prereq.pode ? 'item-indisponivel' : ''}`;
        tecnicaDiv.style.cssText = `
            background: rgba(50, 50, 65, 0.95);
            border: 2px solid ${prereq.pode ? (tecnicaAprendida ? '#9b59b6' : '#27ae60') : '#e74c3c'};
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            cursor: ${prereq.pode ? 'pointer' : 'not-allowed'};
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        
        // Adicionar evento de clique apenas se disponível
        if (prereq.pode) {
            tecnicaDiv.onclick = function(e) {
                e.stopPropagation();
                abrirModalTecnicaCompleta();
            };
        }
        
        // Conteúdo HTML da técnica
        tecnicaDiv.innerHTML = `
            <!-- CABEÇALHO -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div>
                    <h3 style="color: ${prereq.pode ? '#ffd700' : '#95a5a6'}; margin: 0 0 5px 0; font-size: 18px;">
                        🏹 Arquearia Montada
                        ${tecnicaAprendida ? '✅' : (prereq.pode ? '▶' : '🔒')}
                    </h3>
                    <div style="font-size: 12px; color: #95a5a6;">
                        ● Difícil ● Técnica Especial
                    </div>
                </div>
                <div style="background: ${tecnicaAprendida ? '#9b59b6' : (prereq.pode ? '#27ae60' : '#e74c3c')}; 
                      color: white; padding: 6px 12px; border-radius: 15px; font-size: 14px; font-weight: bold;">
                    NH ${nhAtual}
                    ${niveisComprados > 0 ? ` (+${niveisComprados})` : ''}
                </div>
            </div>
            
            <!-- DESCRIÇÃO -->
            <p style="color: #ccc; margin: 10px 0; line-height: 1.5; font-size: 14px;">
                Usar arco enquanto cavalga. Penalidades para disparar montado não reduzem abaixo do NH desta técnica.
            </p>
            
            <!-- INFORMAÇÕES EM TEMPO REAL -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 15px;">
                <div style="background: rgba(52, 152, 219, 0.1); padding: 8px; border-radius: 6px; border-left: 3px solid #3498db;">
                    <div style="color: #95a5a6; font-size: 11px;">Base (Arco-4)</div>
                    <div style="color: #3498db; font-size: 16px; font-weight: bold;">${nhBase}</div>
                </div>
                <div style="background: rgba(46, 204, 113, 0.1); padding: 8px; border-radius: 6px; border-left: 3px solid #2ecc71;">
                    <div style="color: #95a5a6; font-size: 11px;">Máximo</div>
                    <div style="color: #2ecc71; font-size: 16px; font-weight: bold;">${prereq.nhArco}</div>
                </div>
            </div>
            
            <!-- STATUS -->
            <div style="margin-top: 15px;">
                ${!prereq.pode ? `
                    <div style="background: rgba(231, 76, 60, 0.1); padding: 10px; border-radius: 6px; border-left: 3px solid #e74c3c;">
                        <div style="color: #e74c3c; font-size: 13px;">
                            <i class="fas fa-info-circle"></i> ${prereq.motivo}
                        </div>
                    </div>
                ` : tecnicaAprendida ? `
                    <div style="background: rgba(155, 89, 182, 0.1); padding: 10px; border-radius: 6px; border-left: 3px solid #9b59b6;">
                        <div style="color: #9b59b6; font-size: 13px;">
                            <i class="fas fa-check-circle"></i> Aprendida (${niveisComprados} níveis comprados)
                        </div>
                    </div>
                ` : `
                    <div style="background: rgba(39, 174, 96, 0.1); padding: 10px; border-radius: 6px; border-left: 3px solid #27ae60;">
                        <div style="color: #27ae60; font-size: 13px;">
                            <i class="fas fa-shopping-cart"></i> Disponível para compra
                        </div>
                    </div>
                `}
            </div>
            
            <!-- ATUALIZAÇÃO EM TEMPO REAL -->
            <div style="color: #95a5a6; font-size: 11px; margin-top: 10px; text-align: right;">
                <i class="fas fa-sync-alt"></i> Atualiza automaticamente
            </div>
        `;
        
        // Inserir no container
        if (container) {
            // Remover placeholder se existir
            const placeholder = container.querySelector('.nenhuma-pericia');
            if (placeholder) placeholder.remove();
            
            // Inserir no início do container
            container.insertBefore(tecnicaDiv, container.firstChild);
            console.log(`✅ Técnica atualizada na lista! NH: ${nhAtual} (Arco: ${prereq.nhArco})`);
        }
    } else {
        // Atualizar card existente
        tecnicaExistente.style.borderColor = prereq.pode ? (tecnicaAprendida ? '#9b59b6' : '#27ae60') : '#e74c3c';
        
        const titulo = tecnicaExistente.querySelector('h3');
        if (titulo) {
            titulo.style.color = prereq.pode ? '#ffd700' : '#95a5a6';
            const iconSpan = titulo.querySelector('span');
            if (iconSpan) {
                iconSpan.textContent = tecnicaAprendida ? '✅' : (prereq.pode ? '▶' : '🔒');
            }
        }
        
        const badge = tecnicaExistente.querySelector('div[style*="background:"]:last-child');
        if (badge) {
            badge.style.background = tecnicaAprendida ? '#9b59b6' : (prereq.pode ? '#27ae60' : '#e74c3c');
            badge.textContent = `NH ${nhAtual}${niveisComprados > 0 ? ` (+${niveisComprados})` : ''}`;
        }
        
        const statusDiv = tecnicaExistente.querySelector('div[style*="margin-top: 15px;"] > div');
        if (statusDiv) {
            statusDiv.innerHTML = !prereq.pode ? `
                <div style="background: rgba(231, 76, 60, 0.1); padding: 10px; border-radius: 6px; border-left: 3px solid #e74c3c;">
                    <div style="color: #e74c3c; font-size: 13px;">
                        <i class="fas fa-info-circle"></i> ${prereq.motivo}
                    </div>
                </div>
            ` : tecnicaAprendida ? `
                <div style="background: rgba(155, 89, 182, 0.1); padding: 10px; border-radius: 6px; border-left: 3px solid #9b59b6;">
                    <div style="color: #9b59b6; font-size: 13px;">
                        <i class="fas fa-check-circle"></i> Aprendida (${niveisComprados} níveis comprados)
                    </div>
                </div>
            ` : `
                <div style="background: rgba(39, 174, 96, 0.1); padding: 10px; border-radius: 6px; border-left: 3px solid #27ae60;">
                    <div style="color: #27ae60; font-size: 13px;">
                        <i class="fas fa-shopping-cart"></i> Disponível para compra
                    </div>
                </div>
            `;
        }
    }
}

// ===== 4. MODAL DE COMPRA - USANDO OS MODAIS DO HTML =====
function abrirModalTecnicaCompleta() {
    const nhArco = obterNHArcoReal();
    const nhBase = nhArco - 4;
    const tecnicaAprendida = estadoTecnicas.aprendidas.find(t => t.id === 'arquearia-montada');
    const niveisAtuais = tecnicaAprendida ? tecnicaAprendida.niveisComprados || 0 : 0;
    const maxNiveis = nhArco - nhBase;
    
    let niveisSelecionados = niveisAtuais;
    
    // Usar o modal do HTML existente
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    const modalContent = document.querySelector('.modal-tecnica');
    
    if (!modalOverlay || !modalContent) {
        console.error('Modal de técnica não encontrado!');
        alert('Erro: Modal de técnica não encontrado');
        return;
    }
    
    // Preencher o modal
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2><i class="fas fa-bullseye"></i> Arquearia Montada</h2>
            <button class="modal-close-btn" id="fechar-modal-tecnica">×</button>
        </div>
        
        <div class="modal-body">
            <div style="margin-bottom: 20px;">
                <p style="color: #ccc; margin-bottom: 20px; line-height: 1.5;">
                    <strong>Descrição:</strong> Usar arco enquanto cavalga. Penalidades para disparar montado não reduzem abaixo do NH desta técnica.
                </p>
                
                <!-- INFORMAÇÕES ATUAIS -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="text-align: center; background: rgba(52, 152, 219, 0.1); padding: 15px; border-radius: 8px; border: 1px solid #3498db;">
                        <div style="color: #95a5a6; font-size: 12px; margin-bottom: 5px;">Seu NH em Arco</div>
                        <div style="color: #3498db; font-size: 28px; font-weight: bold;">${nhArco}</div>
                    </div>
                    <div style="text-align: center; background: rgba(46, 204, 113, 0.1); padding: 15px; border-radius: 8px; border: 1px solid #2ecc71;">
                        <div style="color: #95a5a6; font-size: 12px; margin-bottom: 5px;">Base (Arco-4)</div>
                        <div style="color: #2ecc71; font-size: 28px; font-weight: bold;">${nhBase}</div>
                    </div>
                </div>
                
                <!-- SELEÇÃO DE NÍVEIS -->
                <div style="margin-bottom: 25px;">
                    <div style="color: #ffd700; font-size: 16px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-chart-line"></i>
                        <span>Níveis acima da base</span>
                    </div>
                    
                    <!-- CONTROLE + e - -->
                    <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px;">
                        <button id="btn-menos-tecnica" style="width: 50px; height: 50px; border-radius: 50%; background: #e74c3c; color: white; border: none; font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;" 
                                ${niveisSelecionados <= 0 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                            -
                        </button>
                        
                        <div style="text-align: center;">
                            <div id="nivel-display-tecnica" style="color: #ffd700; font-size: 48px; font-weight: bold; line-height: 1;">${niveisSelecionados}</div>
                            <div style="color: #95a5a6; font-size: 14px;">
                                NH: <span id="nh-display-tecnica" style="color: #2ecc71; font-weight: bold;">${nhBase + niveisSelecionados}</span>
                            </div>
                        </div>
                        
                        <button id="btn-mais-tecnica" style="width: 50px; height: 50px; border-radius: 50%; background: #27ae60; color: white; border: none; font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;"
                                ${niveisSelecionados >= maxNiveis ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                            +
                        </button>
                    </div>
                    
                    <!-- BARRA DE PROGRESSO -->
                    <div style="background: rgba(255,255,255,0.1); height: 6px; border-radius: 3px; margin: 0 20px 10px 20px; overflow: hidden;">
                        <div id="progresso-bar-tecnica" style="height: 100%; background: linear-gradient(90deg, #27ae60, #2ecc71); width: ${(niveisSelecionados / maxNiveis) * 100}%; transition: width 0.3s;"></div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; color: #95a5a6; font-size: 12px; padding: 0 20px;">
                        <span>Base: NH ${nhBase}</span>
                        <span>Máximo: NH ${nhArco}</span>
                    </div>
                </div>
                
                <!-- CUSTO -->
                <div style="background: rgba(39, 174, 96, 0.1); padding: 20px; border-radius: 8px; border: 1px solid rgba(39, 174, 96, 0.3); margin-bottom: 20px; text-align: center;">
                    <div style="color: #95a5a6; font-size: 14px; margin-bottom: 5px;">
                        <i class="fas fa-coins"></i> Custo Total
                    </div>
                    <div id="custo-display-tecnica" style="color: #27ae60; font-size: 36px; font-weight: bold;">
                        ${calcularCustoNiveis(niveisSelecionados)} pontos
                    </div>
                    <div id="custo-detalhe-tecnica" style="color: #7f8c8d; font-size: 13px; margin-top: 5px;">
                        ${niveisAtuais > 0 ? 
                            `${niveisAtuais} níveis já comprados` : 
                            'Nova técnica'}
                    </div>
                </div>
                
                <!-- REGRAS -->
                <div style="background: rgba(155, 89, 182, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #9b59b6; margin-top: 20px;">
                    <div style="color: #9b59b6; font-size: 14px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-scroll"></i>
                        <span>Regras da Técnica</span>
                    </div>
                    <div style="color: #ccc; font-size: 13px; line-height: 1.5;">
                        • NH base = NH em Arco - 4<br>
                        • Pode comprar níveis adicionais acima da base<br>
                        • Não pode exceder seu NH em Arco<br>
                        • Custo: 2 pontos para +1, 3 pontos para +2, etc.<br>
                        • Dificuldade: Difícil
                    </div>
                </div>
            </div>
        </div>
        
        <div class="modal-footer">
            <button id="btn-cancelar-tecnica" class="btn-cancelar">
                Cancelar
            </button>
            <button id="btn-comprar-tecnica" class="btn-confirmar" style="${niveisSelecionados === niveisAtuais ? 'background: #95a5a6' : niveisSelecionados > niveisAtuais ? 'background: linear-gradient(45deg, #9b59b6, #8e44ad)' : 'background: linear-gradient(45deg, #e74c3c, #c0392b)'};">
                ${niveisSelecionados === niveisAtuais ? 'Manter' : niveisSelecionados > niveisAtuais ? 'Comprar' : 'Reduzir'}
            </button>
        </div>
    `;
    
    // Mostrar o modal
    modalOverlay.style.display = 'flex';
    
    // Configurar eventos
    function configurarEventosModal() {
        // Fechar modal
        const fecharBtn = document.getElementById('fechar-modal-tecnica');
        const cancelarBtn = document.getElementById('btn-cancelar-tecnica');
        
        const fecharModal = function() {
            modalOverlay.style.display = 'none';
        };
        
        if (fecharBtn) fecharBtn.onclick = fecharModal;
        if (cancelarBtn) cancelarBtn.onclick = fecharModal;
        
        // Fechar ao clicar fora
        modalOverlay.onclick = function(e) {
            if (e.target === modalOverlay) {
                fecharModal();
            }
        };
        
        // Função para atualizar nível
        function mudarNivel(mudanca) {
            const novoNivel = niveisSelecionados + mudanca;
            if (novoNivel >= 0 && novoNivel <= maxNiveis) {
                niveisSelecionados = novoNivel;
                
                // Atualizar display
                const nivelDisplay = document.getElementById('nivel-display-tecnica');
                const nhDisplay = document.getElementById('nh-display-tecnica');
                const custoDisplay = document.getElementById('custo-display-tecnica');
                const custoDetalhe = document.getElementById('custo-detalhe-tecnica');
                
                if (nivelDisplay) nivelDisplay.textContent = niveisSelecionados;
                if (nhDisplay) nhDisplay.textContent = nhBase + niveisSelecionados;
                if (custoDisplay) custoDisplay.textContent = calcularCustoNiveis(niveisSelecionados) + ' pontos';
                if (custoDetalhe) {
                    custoDetalhe.textContent = niveisAtuais > 0 ? 
                        `${niveisAtuais} níveis já comprados` : 
                        'Nova técnica';
                }
                
                // Atualizar barra de progresso
                const progressoBar = document.getElementById('progresso-bar-tecnica');
                if (progressoBar) {
                    progressoBar.style.width = `${(niveisSelecionados / maxNiveis) * 100}%`;
                }
                
                // Atualizar botões
                const btnMenos = document.getElementById('btn-menos-tecnica');
                const btnMais = document.getElementById('btn-mais-tecnica');
                const btnComprar = document.getElementById('btn-comprar-tecnica');
                
                if (btnMenos) {
                    btnMenos.disabled = niveisSelecionados <= 0;
                    btnMenos.style.opacity = niveisSelecionados <= 0 ? '0.5' : '1';
                    btnMenos.style.cursor = niveisSelecionados <= 0 ? 'not-allowed' : 'pointer';
                }
                
                if (btnMais) {
                    btnMais.disabled = niveisSelecionados >= maxNiveis;
                    btnMais.style.opacity = niveisSelecionados >= maxNiveis ? '0.5' : '1';
                    btnMais.style.cursor = niveisSelecionados >= maxNiveis ? 'not-allowed' : 'pointer';
                }
                
                if (btnComprar) {
                    if (niveisSelecionados === niveisAtuais) {
                        btnComprar.textContent = 'Manter';
                        btnComprar.style.background = '#95a5a6';
                    } else if (niveisSelecionados > niveisAtuais) {
                        btnComprar.textContent = 'Comprar';
                        btnComprar.style.background = 'linear-gradient(45deg, #9b59b6, #8e44ad)';
                    } else {
                        btnComprar.textContent = 'Reduzir';
                        btnComprar.style.background = 'linear-gradient(45deg, #e74c3c, #c0392b)';
                    }
                }
            }
        }
        
        // Eventos dos botões + e -
        const btnMenos = document.getElementById('btn-menos-tecnica');
        const btnMais = document.getElementById('btn-mais-tecnica');
        
        if (btnMenos) btnMenos.onclick = () => mudarNivel(-1);
        if (btnMais) btnMais.onclick = () => mudarNivel(1);
        
        // Evento do botão comprar
        const btnComprar = document.getElementById('btn-comprar-tecnica');
        if (btnComprar) {
            btnComprar.onclick = function() {
                const custo = calcularCustoNiveis(niveisSelecionados);
                
                if (niveisSelecionados === niveisAtuais) {
                    alert("Nenhuma alteração feita.");
                    modalOverlay.style.display = 'none';
                    return;
                }
                
                if (confirm(`Confirmar ${niveisSelecionados > niveisAtuais ? 'compra' : 'redução'}?\n\n` +
                           `Níveis: ${niveisAtuais} → ${niveisSelecionados}\n` +
                           `NH: ${nhBase + niveisAtuais} → ${nhBase + niveisSelecionados}\n` +
                           `Custo: ${custo} pontos`)) {
                    
                    // Atualizar estado
                    const index = estadoTecnicas.aprendidas.findIndex(t => t.id === 'arquearia-montada');
                    if (index >= 0) {
                        // Atualizar existente
                        estadoTecnicas.aprendidas[index] = {
                            ...estadoTecnicas.aprendidas[index],
                            nome: 'Arquearia Montada',
                            dificuldade: 'Difícil',
                            niveisComprados: niveisSelecionados,
                            custoTotal: custo,
                            nhAtual: nhBase + niveisSelecionados,
                            periciaBase: 'Arco',
                            modificadorBase: -4,
                            dataAtualizacao: new Date().toISOString()
                        };
                    } else {
                        // Nova técnica
                        estadoTecnicas.aprendidas.push({
                            id: 'arquearia-montada',
                            nome: 'Arquearia Montada',
                            dificuldade: 'Difícil',
                            niveisComprados: niveisSelecionados,
                            custoTotal: custo,
                            nhAtual: nhBase + niveisSelecionados,
                            periciaBase: 'Arco',
                            modificadorBase: -4,
                            dataAquisicao: new Date().toISOString()
                        });
                    }
                    
                    // Salvar no localStorage
                    localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.aprendidas));
                    
                    // Atualizar estatísticas
                    atualizarEstatisticasTecnicas();
                    
                    // Atualizar display
                    atualizarDisplayTecnicasAprendidas();
                    atualizarTecnicaNaTela();
                    
                    alert(`✅ Técnica ${niveisSelecionados > niveisAtuais ? 'comprada' : 'atualizada'} com sucesso!\n\n` +
                          `Níveis: ${niveisSelecionados}\n` +
                          `NH: ${nhBase + niveisSelecionados}\n` +
                          `Custo: ${custo} pontos`);
                    
                    modalOverlay.style.display = 'none';
                }
            };
        }
    }
    
    // Configurar eventos após o DOM ser atualizado
    setTimeout(configurarEventosModal, 50);
}

// ===== 5. ATUALIZAR DISPLAY DE TÉCNICAS APRENDIDAS =====
function atualizarDisplayTecnicasAprendidas() {
    const containerAprendidas = document.getElementById('tecnicas-aprendidas');
    
    if (!containerAprendidas) {
        console.warn('Container de técnicas aprendidas não encontrado!');
        return;
    }
    
    // Limpar container
    containerAprendidas.innerHTML = '';
    
    if (estadoTecnicas.aprendidas.length === 0) {
        // Mostrar placeholder
        containerAprendidas.innerHTML = `
            <div class="nenhuma-pericia-aprendida">
                <i class="fas fa-tools"></i>
                <div>Nenhuma técnica aprendida</div>
                <small>As técnicas que você aprender aparecerão aqui</small>
            </div>
        `;
        return;
    }
    
    // Adicionar cada técnica aprendida
    estadoTecnicas.aprendidas.forEach(tecnica => {
        const nhArco = obterNHArcoReal();
        const nhBase = nhArco - 4;
        const nhAtual = nhBase + (tecnica.niveisComprados || 0);
        
        const item = document.createElement('div');
        item.className = 'pericia-item aprendida';
        item.style.cssText = `
            background: rgba(50, 50, 65, 0.95);
            border: 2px solid #9b59b6;
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        item.onclick = () => abrirModalTecnicaCompleta();
        
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="flex: 1;">
                    <h4 style="color: #ffd700; margin: 0 0 5px 0; font-size: 16px;">
                        🏹 ${tecnica.nome}
                        <span style="font-size: 12px; color: ${tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12'}; margin-left: 8px;">
                            ● ${tecnica.dificuldade}
                        </span>
                    </h4>
                    <div style="color: #9b59b6; font-size: 12px; margin-bottom: 5px;">
                        ${tecnica.periciaBase}${tecnica.modificadorBase < 0 ? tecnica.modificadorBase : `+${tecnica.modificadorBase}`}
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="background: #9b59b6; color: white; padding: 4px 12px; border-radius: 15px; font-size: 14px; font-weight: bold;">
                        NH ${nhAtual}
                    </div>
                    <div style="color: #27ae60; font-size: 14px; font-weight: bold;">
                        ${tecnica.custoTotal} pts
                    </div>
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="color: #95a5a6; font-size: 12px;">
                    <i class="fas fa-chart-line"></i> +${tecnica.niveisComprados} níveis
                </div>
                <div style="color: #7f8c8d; font-size: 11px;">
                    Clique para editar
                </div>
            </div>
        `;
        
        containerAprendidas.appendChild(item);
    });
    
    console.log(`✅ Display atualizado: ${estadoTecnicas.aprendidas.length} técnicas aprendidas`);
}

// ===== 6. INICIALIZAÇÃO COMPLETA =====
function inicializarSistemaTecnicas() {
    console.log("🚀 Inicializando sistema de técnicas...");
    
    // Carregar técnicas aprendidas
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.aprendidas = JSON.parse(salvo);
            console.log(`📂 Carregadas ${estadoTecnicas.aprendidas.length} técnicas`);
        }
    } catch (e) {
        console.log("⚠️ Nenhuma técnica salva encontrada");
    }
    
    // Iniciar observação de mudanças
    observarMudancasPericias();
    
    // Inicializar estatísticas
    atualizarEstatisticasTecnicas();
    
    // Atualizar display inicial
    setTimeout(() => {
        atualizarTecnicaNaTela();
        atualizarDisplayTecnicasAprendidas();
    }, 1000);
    
    // Atualizar periodicamente
    setInterval(() => {
        atualizarTecnicaNaTela();
    }, 3000);
    
    console.log("✅ Sistema de técnicas inicializado!");
}

// ===== 7. CARREGAR =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM carregado, preparando técnicas...");
    
    // Aguardar outros sistemas carregarem
    setTimeout(() => {
        if (!window.sistemaTecnicasInicializado) {
            inicializarSistemaTecnicas();
            window.sistemaTecnicasInicializado = true;
        }
    }, 2000);
});

// ===== 8. FUNÇÕES GLOBAIS =====
window.abrirModalTecnica = abrirModalTecnicaCompleta;
window.atualizarTecnicaNaTela = atualizarTecnicaNaTela;
window.atualizarDisplayTecnicasAprendidas = atualizarDisplayTecnicasAprendidas;
window.atualizarEstatisticasTecnicas = atualizarEstatisticasTecnicas;

// Função de teste
window.testarSistemaTecnicas = function() {
    console.log("🧪 Testando sistema de técnicas...");
    console.log("NH Arco:", obterNHArcoReal());
    console.log("Pré-requisitos:", verificarPreRequisitosTecnica());
    console.log("Técnicas aprendidas:", estadoTecnicas.aprendidas);
    console.log("Estatísticas:", {
        medias: estadoTecnicas.tecnicasMedias,
        dificeis: estadoTecnicas.tecnicasDificeis,
        total: estadoTecnicas.pontosTotal
    });
    
    atualizarTecnicaNaTela();
    atualizarDisplayTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
};

// Função para limpar dados
window.limparTecnicas = function() {
    if (confirm("Tem certeza que deseja limpar todas as técnicas aprendidas?")) {
        estadoTecnicas.aprendidas = [];
        estadoTecnicas.tecnicasMedias = 0;
        estadoTecnicas.tecnicasDificeis = 0;
        estadoTecnicas.pontosTotal = 0;
        localStorage.removeItem('tecnicasAprendidas');
        alert("✅ Técnicas limpas!");
        atualizarTecnicaNaTela();
        atualizarDisplayTecnicasAprendidas();
        atualizarEstatisticasTecnicas();
    }
};

console.log("✅ Sistema de técnicas carregado (atualização em tempo real)!");
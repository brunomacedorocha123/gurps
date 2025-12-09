// ===== SISTEMA DE TÉCNICAS - ATUALIZAÇÃO EM TEMPO REAL =====
console.log("🎯 SISTEMA DE TÉCNICAS - TEMPO REAL");

// ===== 1. ESTADO DO SISTEMA =====
const estadoTecnicas = {
    aprendidas: [],
    disponiveis: [],
    pontosTotal: 0,
    ultimoNHArco: 0,
    observandoPericias: false
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

// ===== 3. ATUALIZAR TÉCNICA NA TELA (FUNÇÃO PRINCIPAL) =====
function atualizarTecnicaNaTela() {
    console.log("🔄 Atualizando técnica na tela...");
    
    // Encontrar container
    let container = document.getElementById('lista-tecnicas');
    if (!container) {
        container = document.querySelector('.catalog-list-pericias, .tecnicas-section div');
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
    if (tecnicaExistente) {
        tecnicaExistente.remove();
    }
    
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
            criarModalTecnica();
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
        // Inserir no início do container
        container.insertBefore(tecnicaDiv, container.firstChild);
        console.log(`✅ Técnica atualizada! NH: ${nhAtual} (Arco: ${prereq.nhArco})`);
    }
}

// ===== 4. MODAL DE COMPRA COMPLETO =====
function criarModalTecnica() {
    const nhArco = obterNHArcoReal();
    const nhBase = nhArco - 4;
    const tecnicaAprendida = estadoTecnicas.aprendidas.find(t => t.id === 'arquearia-montada');
    const niveisAtuais = tecnicaAprendida ? tecnicaAprendida.niveisComprados || 0 : 0;
    const maxNiveis = nhArco - nhBase;
    
    let niveisSelecionados = niveisAtuais;
    
    // Remover modal existente
    const modalExistente = document.getElementById('modal-tecnica-overlay');
    if (modalExistente) {
        modalExistente.remove();
    }
    
    // Criar modal
    const modalHTML = `
        <div id="modal-tecnica-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); display: flex; justify-content: center; align-items: center; z-index: 10000; backdrop-filter: blur(5px);">
            <div style="background: #1a1a24; border: 2px solid #9b59b6; border-radius: 12px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                
                <!-- CABEÇALHO -->
                <div style="background: linear-gradient(135deg, #2c003e, #4a0072); padding: 20px; border-bottom: 1px solid #9b59b6;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="color: #ffd700; margin: 0; font-size: 20px;">
                            <i class="fas fa-bullseye"></i> Arquearia Montada
                        </h2>
                        <button id="fechar-modal" style="background: none; border: none; color: #ffd700; font-size: 24px; cursor: pointer; padding: 0; width: 30px; height: 30px;">×</button>
                    </div>
                    <div style="color: #9b59b6; font-size: 14px; margin-top: 5px;">
                        Técnica Difícil • Base: Arco-4
                    </div>
                </div>
                
                <!-- CORPO -->
                <div style="padding: 20px;">
                    
                    <!-- INFORMAÇÕES ATUAIS -->
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
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
                            <button id="btn-menos" style="width: 50px; height: 50px; border-radius: 50%; background: #e74c3c; color: white; border: none; font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;" 
                                    ${niveisSelecionados <= 0 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                                -
                            </button>
                            
                            <div style="text-align: center;">
                                <div id="nivel-display" style="color: #ffd700; font-size: 48px; font-weight: bold; line-height: 1;">${niveisSelecionados}</div>
                                <div style="color: #95a5a6; font-size: 14px;">
                                    NH: <span id="nh-display" style="color: #2ecc71; font-weight: bold;">${nhBase + niveisSelecionados}</span>
                                </div>
                            </div>
                            
                            <button id="btn-mais" style="width: 50px; height: 50px; border-radius: 50%; background: #27ae60; color: white; border: none; font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;"
                                    ${niveisSelecionados >= maxNiveis ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                                +
                            </button>
                        </div>
                        
                        <!-- BARRA DE PROGRESSO -->
                        <div style="background: rgba(255,255,255,0.1); height: 6px; border-radius: 3px; margin: 0 20px 10px 20px; overflow: hidden;">
                            <div id="progresso-bar" style="height: 100%; background: linear-gradient(90deg, #27ae60, #2ecc71); width: ${(niveisSelecionados / maxNiveis) * 100}%; transition: width 0.3s;"></div>
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
                        <div id="custo-display" style="color: #27ae60; font-size: 36px; font-weight: bold;">
                            ${calcularCustoNiveis(niveisSelecionados)} pontos
                        </div>
                        <div id="custo-detalhe" style="color: #7f8c8d; font-size: 13px; margin-top: 5px;">
                            ${niveisAtuais > 0 ? 
                                `${niveisAtuais} níveis já comprados` : 
                                'Nova técnica'}
                        </div>
                    </div>
                    
                    <!-- DESCRIÇÃO -->
                    <div style="background: rgba(155, 89, 182, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #9b59b6;">
                        <div style="color: #9b59b6; font-size: 14px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-scroll"></i>
                            <span>Regras da Técnica</span>
                        </div>
                        <div style="color: #ccc; font-size: 13px; line-height: 1.5;">
                            • NH base = NH em Arco - 4<br>
                            • Pode comprar níveis adicionais acima da base<br>
                            • Não pode exceder seu NH em Arco<br>
                            • Custo: 2 pontos para +1, 3 pontos para +2, etc.
                        </div>
                    </div>
                </div>
                
                <!-- RODAPÉ -->
                <div style="padding: 20px; background: #2c3e50; border-top: 1px solid #34495e; display: flex; gap: 15px;">
                    <button id="btn-cancelar" 
                            style="flex: 1; padding: 15px; background: #7f8c8d; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px;">
                        Cancelar
                    </button>
                    <button id="btn-comprar" 
                            style="flex: 1; padding: 15px; ${niveisSelecionados === niveisAtuais ? 'background: #95a5a6' : niveisSelecionados > niveisAtuais ? 'background: linear-gradient(45deg, #9b59b6, #8e44ad)' : 'background: linear-gradient(45deg, #e74c3c, #c0392b)'}; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px;">
                        ${niveisSelecionados === niveisAtuais ? 'Manter' : niveisSelecionados > niveisAtuais ? 'Comprar' : 'Reduzir'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar modal ao body
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHTML;
    document.body.appendChild(modalDiv);
    
    // Configurar eventos do modal
    const modalOverlay = document.getElementById('modal-tecnica-overlay');
    
    // Função para fechar modal
    function fecharModal() {
        if (modalOverlay) {
            modalOverlay.remove();
        }
    }
    
    // Evento para fechar ao clicar no X
    document.getElementById('fechar-modal').addEventListener('click', fecharModal);
    
    // Evento para fechar ao clicar no botão cancelar
    document.getElementById('btn-cancelar').addEventListener('click', fecharModal);
    
    // Evento para fechar ao clicar fora do modal
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            fecharModal();
        }
    });
    
    // Função para atualizar nível
    function mudarNivel(mudanca) {
        const novoNivel = niveisSelecionados + mudanca;
        if (novoNivel >= 0 && novoNivel <= maxNiveis) {
            niveisSelecionados = novoNivel;
            
            // Atualizar display
            document.getElementById('nivel-display').textContent = niveisSelecionados;
            document.getElementById('nh-display').textContent = nhBase + niveisSelecionados;
            document.getElementById('custo-display').textContent = calcularCustoNiveis(niveisSelecionados) + ' pontos';
            
            // Atualizar barra de progresso
            document.getElementById('progresso-bar').style.width = `${(niveisSelecionados / maxNiveis) * 100}%`;
            
            // Atualizar botões
            const btnMenos = document.getElementById('btn-menos');
            btnMenos.disabled = niveisSelecionados <= 0;
            btnMenos.style.opacity = niveisSelecionados <= 0 ? '0.5' : '1';
            
            const btnMais = document.getElementById('btn-mais');
            btnMais.disabled = niveisSelecionados >= maxNiveis;
            btnMais.style.opacity = niveisSelecionados >= maxNiveis ? '0.5' : '1';
            
            // Atualizar botão de compra
            const btnComprar = document.getElementById('btn-comprar');
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
    
    // Eventos dos botões + e -
    document.getElementById('btn-menos').addEventListener('click', () => mudarNivel(-1));
    document.getElementById('btn-mais').addEventListener('click', () => mudarNivel(1));
    
    // Evento do botão comprar
    document.getElementById('btn-comprar').addEventListener('click', function() {
        const custo = calcularCustoNiveis(niveisSelecionados);
        
        if (niveisSelecionados === niveisAtuais) {
            alert("Nenhuma alteração feita.");
            fecharModal();
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
                    niveisComprados: niveisSelecionados,
                    custoTotal: custo,
                    nhAtual: nhBase + niveisSelecionados,
                    dataAtualizacao: new Date().toISOString()
                };
            } else {
                // Nova técnica
                estadoTecnicas.aprendidas.push({
                    id: 'arquearia-montada',
                    nome: 'Arquearia Montada',
                    niveisComprados: niveisSelecionados,
                    custoTotal: custo,
                    nhAtual: nhBase + niveisSelecionados,
                    dataAquisicao: new Date().toISOString()
                });
            }
            
            // Salvar no localStorage
            localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.aprendidas));
            
            // Atualizar total de pontos gastos
            estadoTecnicas.pontosTotal = estadoTecnicas.aprendidas.reduce((total, t) => total + t.custoTotal, 0);
            
            alert(`✅ Técnica ${niveisSelecionados > niveisAtuais ? 'comprada' : 'atualizada'} com sucesso!\n\n` +
                  `Níveis: ${niveisSelecionados}\n` +
                  `NH: ${nhBase + niveisSelecionados}\n` +
                  `Custo: ${custo} pontos`);
            
            fecharModal();
            
            // Atualizar interface em tempo real
            atualizarTecnicaNaTela();
            
            // Atualizar display de técnicas aprendidas se existir
            atualizarDisplayTecnicasAprendidas();
        }
    });
}

// ===== 5. FUNÇÃO PARA ATUALIZAR DISPLAY DE TÉCNICAS APRENDIDAS =====
function atualizarDisplayTecnicasAprendidas() {
    const listaAprendidas = document.querySelector('#lista-tecnicas-aprendidas, .tecnicas-aprendidas-list, .pericias-aprendidas-list');
    
    if (listaAprendidas && estadoTecnicas.aprendidas.length > 0) {
        // Limpar lista atual
        listaAprendidas.innerHTML = '';
        
        // Adicionar cada técnica aprendida
        estadoTecnicas.aprendidas.forEach(tecnica => {
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
            item.onclick = () => criarModalTecnica();
            
            const nhArco = obterNHArcoReal();
            const nhBase = nhArco - 4;
            const nhAtual = nhBase + tecnica.niveisComprados;
            
            item.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="color: #ffd700; margin: 0; font-size: 16px;">
                            🏹 ${tecnica.nome}
                        </h4>
                        <div style="color: #9b59b6; font-size: 11px; margin-top: 2px;">
                            NH ${nhAtual} (Base ${nhBase} +${tecnica.niveisComprados})
                        </div>
                    </div>
                    <div style="color: #27ae60; font-size: 14px; font-weight: bold;">
                        ${tecnica.custoTotal} pts
                    </div>
                </div>
                <div style="color: #95a5a6; font-size: 12px; margin-top: 8px;">
                    Clique para editar
                </div>
            `;
            
            listaAprendidas.appendChild(item);
        });
        
        console.log(`✅ Display atualizado: ${estadoTecnicas.aprendidas.length} técnicas aprendidas`);
    }
}

// ===== 6. INICIALIZAÇÃO =====
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
    
    // Atualizar técnica na tela após um breve delay
    setTimeout(() => {
        atualizarTecnicaNaTela();
        atualizarDisplayTecnicasAprendidas();
    }, 1000);
    
    // Atualizar periodicamente (backup)
    setInterval(() => {
        atualizarTecnicaNaTela();
    }, 3000);
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
    }, 1500);
});

// ===== 8. FUNÇÕES GLOBAIS =====
window.abrirModalTecnica = criarModalTecnica;
window.atualizarTecnicaNaTela = atualizarTecnicaNaTela;
window.atualizarDisplayTecnicasAprendidas = atualizarDisplayTecnicasAprendidas;

// Função de teste
window.testarSistemaTecnicas = function() {
    console.log("🧪 Testando sistema de técnicas...");
    console.log("NH Arco:", obterNHArcoReal());
    console.log("Pré-requisitos:", verificarPreRequisitosTecnica());
    console.log("Técnicas aprendidas:", estadoTecnicas.aprendidas);
    atualizarTecnicaNaTela();
    atualizarDisplayTecnicasAprendidas();
};

// Função para limpar dados
window.limparTecnicas = function() {
    if (confirm("Tem certeza que deseja limpar todas as técnicas aprendidas?")) {
        estadoTecnicas.aprendidas = [];
        localStorage.removeItem('tecnicasAprendidas');
        alert("✅ Técnicas limpas!");
        atualizarTecnicaNaTela();
        atualizarDisplayTecnicasAprendidas();
    }
};

console.log("✅ Sistema de técnicas carregado (atualização em tempo real)!");
// ===== SISTEMA DE TÉCNICAS - COMPLETO COM EXCLUSÃO E ATUALIZAÇÃO EM TEMPO REAL =====
console.log("🎯 SISTEMA DE TÉCNICAS - CARREGADO");

// ===== 1. ESTADO DO SISTEMA =====
const estadoTecnicas = {
    aprendidas: [],
    disponiveis: [],
    pontosTotal: 0,
    ultimoNHArco: 0,
    observandoPericias: false,
    // Contadores
    tecnicasMedias: 0,
    tecnicasDificeis: 0,
    pontosMedias: 0,
    pontosDificeis: 0,
    // Cache para debugar
    cache: {
        ultimoNHArcoEncontrado: 0,
        fonte: '',
        timestamp: null
    }
};

// ===== 2. FUNÇÕES PRINCIPAIS =====

// 2.1 Obter NH REAL do Arco (MELHORADO)
function obterNHArcoReal(forcar = false) {
    // Se não for forçar e já tem cache válido, retornar cache
    if (!forcar && estadoTecnicas.ultimoNHArco > 0 && 
        estadoTecnicas.cache.timestamp && 
        (Date.now() - new Date(estadoTecnicas.cache.timestamp).getTime()) < 5000) {
        return estadoTecnicas.ultimoNHArco;
    }
    
    let nhArco = 10; // Default
    let fonte = 'default';
    
    // PRIMEIRO: Tentar pegar direto do estadoPericias (se existir)
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const arco = window.estadoPericias.periciasAprendidas.find(p => 
            p.id === 'arco' || p.id === 'pericia-arco' || p.nome?.includes('Arco')
        );
        if (arco && arco.nh) {
            nhArco = arco.nh;
            fonte = 'estadoPericias';
        }
    }
    
    // SEGUNDO: Tentar do localStorage
    if (nhArco === 10) {
        try {
            const salvo = localStorage.getItem('periciasAprendidas');
            if (salvo) {
                const pericias = JSON.parse(salvo);
                const arco = pericias.find(p => 
                    p.id === 'arco' || p.id === 'pericia-arco' || p.nome?.includes('Arco')
                );
                if (arco && arco.nh) {
                    nhArco = arco.nh;
                    fonte = 'localStorage';
                }
            }
        } catch (e) {}
    }
    
    // Cache
    estadoTecnicas.ultimoNHArco = nhArco;
    estadoTecnicas.cache = {
        ultimoNHArcoEncontrado: nhArco,
        fonte: fonte,
        timestamp: new Date().toISOString()
    };
    
    return nhArco;
}

// 2.2 Sistema de observação em tempo real (NOVO E MELHORADO)
function iniciarObservacaoPericias() {
    if (estadoTecnicas.observandoPericias) return;
    
    console.log("👀 Iniciando observação em tempo real...");
    
    // 1. Observar localStorage
    window.addEventListener('storage', function(e) {
        if (e.key === 'periciasAprendidas') {
            console.log("📦 Mudança detectada no localStorage!");
            estadoTecnicas.ultimoNHArco = 0; // Resetar cache
            setTimeout(() => {
                atualizarTodasAsTecnicas();
            }, 100);
        }
    });
    
    // 2. Observar mudanças no estadoPericias (se existir)
    if (window.estadoPericias) {
        // Hook no método que atualiza as perícias (se existir)
        const originalAtualizar = window.estadoPericias.atualizarPericiaAprendida;
        if (originalAtualizar) {
            window.estadoPericias.atualizarPericiaAprendida = function(...args) {
                const result = originalAtualizar.apply(this, args);
                setTimeout(() => {
                    estadoTecnicas.ultimoNHArco = 0;
                    atualizarTodasAsTecnicas();
                }, 100);
                return result;
            };
        }
    }
    
    // 3. Polling a cada 500ms para garantir
    let ultimoEstado = '';
    estadoTecnicas.intervaloObservacao = setInterval(() => {
        // Verificar se houve mudança no estado
        try {
            const salvo = localStorage.getItem('periciasAprendidas');
            if (salvo !== ultimoEstado) {
                if (ultimoEstado !== '') {
                    console.log("🔄 Mudança detectada via polling!");
                    estadoTecnicas.ultimoNHArco = 0;
                    atualizarTodasAsTecnicas();
                }
                ultimoEstado = salvo;
            }
        } catch (e) {}
    }, 500);
    
    estadoTecnicas.observandoPericias = true;
}

// 2.3 Verificar se tem Cavalgar
function verificarTemCavalgar() {
    // 1. No estadoPericias
    if (window.estadoPericias?.periciasAprendidas) {
        const temCavalgar = window.estadoPericias.periciasAprendidas.some(p => 
            p.id.includes('cavalgar') || p.nome.includes('Cavalgar')
        );
        if (temCavalgar) return true;
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

// 2.4 Verificar pré-requisitos
function verificarPreRequisitosTecnica() {
    const nhArco = obterNHArcoReal();
    const dx = 10;
    const nivelArco = nhArco - dx;
    
    const temArcoNecessario = nivelArco > -5;
    const temCavalgar = verificarTemCavalgar();
    const pode = temArcoNecessario && temCavalgar;
    
    return {
        pode: pode,
        motivo: !temArcoNecessario ? `Arco precisa ter pelo menos 1 ponto (nível: ${nivelArco})` : 
                !temCavalgar ? 'Falta Cavalgar' : 'OK',
        nhArco: nhArco,
        nivelArco: nivelArco
    };
}

// 2.5 Calcular custo da técnica
function calcularCustoNiveis(niveis) {
    if (niveis <= 0) return 0;
    // Técnica difícil: +1=2, +2=3, +3=4, +4=5...
    return niveis + 1;
}

// 2.6 Atualizar todas as técnicas de uma vez
function atualizarTodasAsTecnicas() {
    console.log("🔄 Atualizando TODAS as técnicas...");
    atualizarEstatisticasTecnicas();
    atualizarTecnicaNaTela(true);
    atualizarDisplayTecnicasAprendidas();
}

// 2.7 Atualizar estatísticas
function atualizarEstatisticasTecnicas() {
    // Reset
    estadoTecnicas.tecnicasMedias = 0;
    estadoTecnicas.tecnicasDificeis = 0;
    estadoTecnicas.pontosMedias = 0;
    estadoTecnicas.pontosDificeis = 0;
    
    estadoTecnicas.aprendidas.forEach(tecnica => {
        if (tecnica.dificuldade === 'Média') {
            estadoTecnicas.tecnicasMedias++;
            estadoTecnicas.pontosMedias += tecnica.custoTotal || 0;
        } else if (tecnica.dificuldade === 'Difícil') {
            estadoTecnicas.tecnicasDificeis++;
            estadoTecnicas.pontosDificeis += tecnica.custoTotal || 0;
        }
    });
    
    estadoTecnicas.pontosTotal = estadoTecnicas.pontosMedias + estadoTecnicas.pontosDificeis;
    atualizarDisplayEstatisticas();
}

// 2.8 Atualizar display das estatísticas
function atualizarDisplayEstatisticas() {
    const qtdMedio = document.getElementById('qtd-tecnicas-medio');
    const qtdDificil = document.getElementById('qtd-tecnicas-dificil');
    const qtdTotal = document.getElementById('qtd-tecnicas-total');
    const ptsMedio = document.getElementById('pts-tecnicas-medio');
    const ptsDificil = document.getElementById('pts-tecnicas-dificil');
    const ptsTotal = document.getElementById('pts-tecnicas-total');
    const badgeTotal = document.getElementById('pontos-tecnicas-total');
    
    if (qtdMedio) qtdMedio.textContent = estadoTecnicas.tecnicasMedias;
    if (qtdDificil) qtdDificil.textContent = estadoTecnicas.tecnicasDificeis;
    if (qtdTotal) qtdTotal.textContent = estadoTecnicas.tecnicasMedias + estadoTecnicas.tecnicasDificeis;
    if (ptsMedio) ptsMedio.textContent = `(${estadoTecnicas.pontosMedias} pts)`;
    if (ptsDificil) ptsDificil.textContent = `(${estadoTecnicas.pontosDificeis} pts)`;
    if (ptsTotal) ptsTotal.textContent = `(${estadoTecnicas.pontosTotal} pts)`;
    if (badgeTotal) badgeTotal.textContent = `[${estadoTecnicas.pontosTotal} pts]`;
}

// 2.9 Remover técnica (BOTÃO X)
function removerTecnica(idTecnica) {
    console.log(`🗑️ Removendo técnica: ${idTecnica}`);
    
    const index = estadoTecnicas.aprendidas.findIndex(t => t.id === idTecnica);
    if (index === -1) {
        console.log("Técnica não encontrada");
        return false;
    }
    
    const tecnica = estadoTecnicas.aprendidas[index];
    const custo = tecnica.custoTotal || 0;
    
    if (confirm(`Remover "${tecnica.nome}"?\n\nRecuperará ${custo} pontos.`)) {
        estadoTecnicas.aprendidas.splice(index, 1);
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.aprendidas));
        
        atualizarTodasAsTecnicas();
        
        alert(`✅ "${tecnica.nome}" removida!\n${custo} pontos recuperados.`);
        return true;
    }
    
    return false;
}

// ===== 3. TÉCNICA NA TELA (COM BOTÃO X) =====
function atualizarTecnicaNaTela(forcar = false) {
    console.log("🎯 Atualizando técnica na tela...");
    
    // Encontrar container
    let container = document.getElementById('lista-tecnicas');
    if (!container) {
        container = document.querySelector('.catalog-list-pericias');
        if (!container) {
            console.warn("Container não encontrado");
            setTimeout(() => atualizarTecnicaNaTela(true), 500);
            return;
        }
    }
    
    // Obter dados
    const prereq = verificarPreRequisitosTecnica();
    const nhBase = prereq.nhArco - 4;
    const maxNiveis = prereq.nhArco - nhBase;
    const tecnicaAprendida = estadoTecnicas.aprendidas.find(t => t.id === 'arquearia-montada');
    const niveisComprados = tecnicaAprendida ? tecnicaAprendida.niveisComprados || 0 : 0;
    const nhAtual = nhBase + niveisComprados;
    
    // Verificar se já existe
    let tecnicaDiv = document.getElementById('tecnica-arquearia-montada');
    
    if (!tecnicaDiv) {
        // Criar novo elemento
        tecnicaDiv = document.createElement('div');
        tecnicaDiv.id = 'tecnica-arquearia-montada';
        tecnicaDiv.className = `pericia-item ${!prereq.pode ? 'item-indisponivel' : ''}`;
        
        // Remover placeholder se existir
        const placeholder = container.querySelector('.nenhuma-pericia');
        if (placeholder) placeholder.remove();
        
        container.insertBefore(tecnicaDiv, container.firstChild);
    }
    
    // DEFINIR HTML COM BOTÃO X
    tecnicaDiv.style.cssText = `
        background: rgba(50, 50, 65, 0.95);
        border: 2px solid ${prereq.pode ? (tecnicaAprendida ? '#9b59b6' : '#27ae60') : '#e74c3c'};
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 15px;
        cursor: ${prereq.pode ? 'pointer' : 'not-allowed'};
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        position: relative;
    `;
    
    // Evento de clique
    if (prereq.pode) {
        tecnicaDiv.onclick = function(e) {
            if (e.target.closest('.btn-excluir-tecnica')) return;
            abrirModalTecnicaCompleta();
        };
    } else {
        tecnicaDiv.onclick = null;
    }
    
    // HTML COMPLETO COM BOTÃO X
    tecnicaDiv.innerHTML = `
        <!-- BOTÃO X DE EXCLUSÃO (APENAS SE APRENDIDA) -->
        ${tecnicaAprendida ? `
            <button class="btn-excluir-tecnica" 
                    onclick="event.stopPropagation(); removerTecnica('arquearia-montada');"
                    style="position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; border-radius: 50%; background: #e74c3c; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; z-index: 10;">
                ×
            </button>
        ` : ''}
        
        <!-- CABEÇALHO -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; ${tecnicaAprendida ? 'padding-right: 30px;' : ''}">
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
        
        <!-- INFORMAÇÕES -->
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
            <br>
            <small style="font-size: 9px;">Última atualização: ${new Date().toLocaleTimeString()}</small>
        </div>
    `;
    
    console.log("✅ Técnica atualizada na tela!");
}

// ===== 4. DISPLAY DE TÉCNICAS APRENDIDAS (COM BOTÃO X) =====
function atualizarDisplayTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    // Limpar
    container.innerHTML = '';
    
    if (estadoTecnicas.aprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia-aprendida">
                <i class="fas fa-tools"></i>
                <div>Nenhuma técnica aprendida</div>
                <small>As técnicas que você aprender aparecerão aqui</small>
            </div>
        `;
        return;
    }
    
    // Adicionar cada técnica com botão X
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
            position: relative;
        `;
        item.onclick = () => abrirModalTecnicaCompleta();
        
        item.innerHTML = `
            <!-- BOTÃO X DE EXCLUSÃO -->
            <button class="btn-excluir-tecnica" 
                    onclick="event.stopPropagation(); removerTecnica('${tecnica.id}');"
                    style="position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; border-radius: 50%; background: #e74c3c; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; z-index: 10;">
                ×
            </button>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-right: 30px;">
                <div style="flex: 1;">
                    <h4 style="color: #ffd700; margin: 0 0 5px 0; font-size: 16px;">
                        🏹 ${tecnica.nome}
                        <span style="font-size: 12px; color: ${tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12'}; margin-left: 8px;">
                            ● ${tecnica.dificuldade}
                        </span>
                    </h4>
                    <div style="color: #9b59b6; font-size: 12px; margin-bottom: 5px;">
                        ${tecnica.periciaBase || 'Arco'}${tecnica.modificadorBase < 0 ? tecnica.modificadorBase : `+${tecnica.modificadorBase || 0}`}
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="background: #9b59b6; color: white; padding: 4px 12px; border-radius: 15px; font-size: 14px; font-weight: bold;">
                        NH ${nhAtual}
                    </div>
                    <div style="color: #27ae60; font-size: 14px; font-weight: bold;">
                        ${tecnica.custoTotal || 0} pts
                    </div>
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="color: #95a5a6; font-size: 12px;">
                    <i class="fas fa-chart-line"></i> +${tecnica.niveisComprados || 0} níveis
                </div>
                <div style="color: #7f8c8d; font-size: 11px;">
                    Clique para editar
                </div>
            </div>
        `;
        
        container.appendChild(item);
    });
}

// ===== 5. MODAL DE COMPRA (SIMPLIFICADO) =====
function abrirModalTecnicaCompleta() {
    const nhArco = obterNHArcoReal();
    const nhBase = nhArco - 4;
    const tecnicaAprendida = estadoTecnicas.aprendidas.find(t => t.id === 'arquearia-montada');
    const niveisAtuais = tecnicaAprendida ? tecnicaAprendida.niveisComprados || 0 : 0;
    const maxNiveis = nhArco - nhBase;
    
    let niveisSelecionados = niveisAtuais;
    
    // Usar modal existente
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    const modalContent = document.querySelector('.modal-tecnica');
    
    if (!modalOverlay || !modalContent) {
        alert('Modal não encontrado!');
        return;
    }
    
    // Função para criar conteúdo dinâmico
    function atualizarModal() {
        modalContent.innerHTML = `
            <div class="modal-header">
                <h2><i class="fas fa-bullseye"></i> Arquearia Montada</h2>
                <button class="modal-close-btn" onclick="fecharModal()">×</button>
            </div>
            
            <div class="modal-body">
                <p style="color: #ccc; margin-bottom: 20px;">Usar arco enquanto cavalga.</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="text-align: center; background: rgba(52, 152, 219, 0.1); padding: 15px; border-radius: 8px;">
                        <div style="color: #95a5a6; font-size: 12px;">NH Arco</div>
                        <div style="color: #3498db; font-size: 28px; font-weight: bold;">${nhArco}</div>
                    </div>
                    <div style="text-align: center; background: rgba(46, 204, 113, 0.1); padding: 15px; border-radius: 8px;">
                        <div style="color: #95a5a6; font-size: 12px;">Base (Arco-4)</div>
                        <div style="color: #2ecc71; font-size: 28px; font-weight: bold;">${nhBase}</div>
                    </div>
                </div>
                
                <!-- Controle de níveis -->
                <div style="text-align: center; margin: 20px 0;">
                    <div style="color: #ffd700; font-size: 16px; margin-bottom: 10px;">Níveis: ${niveisSelecionados}</div>
                    <div style="display: flex; justify-content: center; gap: 20px;">
                        <button onclick="mudarNivel(-1)" ${niveisSelecionados <= 0 ? 'disabled style="opacity:0.5"' : ''}
                                style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            -1
                        </button>
                        <button onclick="mudarNivel(1)" ${niveisSelecionados >= maxNiveis ? 'disabled style="opacity:0.5"' : ''}
                                style="padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            +1
                        </button>
                    </div>
                    <div style="color: #95a5a6; font-size: 14px; margin-top: 10px;">
                        NH: <strong style="color: #2ecc71;">${nhBase + niveisSelecionados}</strong>
                    </div>
                </div>
                
                <!-- Custo -->
                <div style="background: rgba(39, 174, 96, 0.1); padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <div style="color: #95a5a6; font-size: 14px;">Custo</div>
                    <div style="color: #27ae60; font-size: 32px; font-weight: bold;">${calcularCustoNiveis(niveisSelecionados)} pts</div>
                </div>
            </div>
            
            <div class="modal-footer" style="display: flex; gap: 10px;">
                <button onclick="fecharModal()" style="flex: 1; padding: 12px; background: #7f8c8d; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Cancelar
                </button>
                <button onclick="comprarTecnica(${niveisSelecionados})" style="flex: 1; padding: 12px; background: ${niveisSelecionados === niveisAtuais ? '#95a5a6' : '#9b59b6'}; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    ${niveisSelecionados === niveisAtuais ? 'Fechar' : niveisSelecionados > niveisAtuais ? 'Comprar' : 'Reduzir'}
                </button>
            </div>
        `;
    }
    
    // Funções auxiliares
    window.fecharModal = function() {
        modalOverlay.style.display = 'none';
    };
    
    window.mudarNivel = function(mudanca) {
        const novo = niveisSelecionados + mudanca;
        if (novo >= 0 && novo <= maxNiveis) {
            niveisSelecionados = novo;
            atualizarModal();
        }
    };
    
    window.comprarTecnica = function(niveis) {
        const custo = calcularCustoNiveis(niveis);
        
        if (niveis === niveisAtuais) {
            fecharModal();
            return;
        }
        
        // Atualizar ou adicionar técnica
        const index = estadoTecnicas.aprendidas.findIndex(t => t.id === 'arquearia-montada');
        if (index >= 0) {
            estadoTecnicas.aprendidas[index] = {
                id: 'arquearia-montada',
                nome: 'Arquearia Montada',
                dificuldade: 'Difícil',
                niveisComprados: niveis,
                custoTotal: custo,
                periciaBase: 'Arco',
                modificadorBase: -4,
                dataAtualizacao: new Date().toISOString()
            };
        } else {
            estadoTecnicas.aprendidas.push({
                id: 'arquearia-montada',
                nome: 'Arquearia Montada',
                dificuldade: 'Difícil',
                niveisComprados: niveis,
                custoTotal: custo,
                periciaBase: 'Arco',
                modificadorBase: -4,
                dataAquisicao: new Date().toISOString()
            });
        }
        
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.aprendidas));
        atualizarTodasAsTecnicas();
        
        alert(`✅ Técnica ${niveis > niveisAtuais ? 'comprada' : 'atualizada'}!\nNH: ${nhBase + niveis}\nCusto: ${custo} pts`);
        fecharModal();
    };
    
    // Mostrar modal
    atualizarModal();
    modalOverlay.style.display = 'flex';
}

// ===== 6. INICIALIZAÇÃO =====
function inicializarSistemaTecnicas() {
    console.log("🚀 Inicializando sistema de técnicas...");
    
    // Carregar técnicas salvas
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.aprendidas = JSON.parse(salvo);
            console.log(`📂 ${estadoTecnicas.aprendidas.length} técnicas carregadas`);
        }
    } catch (e) {
        console.log("⚠️ Nenhuma técnica salva");
    }
    
    // Iniciar observação
    iniciarObservacaoPericias();
    
    // Atualizar interface
    setTimeout(() => {
        atualizarTodasAsTecnicas();
    }, 1000);
    
    console.log("✅ Sistema pronto!");
}

// ===== 7. CARREGAR =====
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (!window.sistemaTecnicasInicializado) {
            inicializarSistemaTecnicas();
            window.sistemaTecnicasInicializado = true;
        }
    }, 1500);
});

// ===== 8. FUNÇÕES GLOBAIS =====
window.abrirModalTecnica = abrirModalTecnicaCompleta;
window.removerTecnica = removerTecnica;
window.atualizarTecnicaNaTela = atualizarTecnicaNaTela;

// Função de teste
window.testarTecnicas = function() {
    console.log("=== TESTE ===");
    console.log("NH Arco:", obterNHArcoReal());
    console.log("Técnicas:", estadoTecnicas.aprendidas.length);
    console.log("Estado completo:", estadoTecnicas);
    atualizarTodasAsTecnicas();
};

console.log("✅ Sistema de técnicas 100% completo!");
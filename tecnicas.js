// ===== SISTEMA DE TÉCNICAS - VERSÃO FINAL CORRETA =====
console.log("🎯 SISTEMA DE TÉCNICAS - CARREGADO");

// ===== 1. ESTADO DO SISTEMA =====
const estadoTecnicas = {
    aprendidas: [],        // Técnicas que o jogador comprou
    pontosTotal: 0,        // Total de pontos gastos
    ultimoNHArco: 0,       // Cache do último NH do Arco encontrado
    observacaoAtiva: false // Se está observando mudanças
};

// ===== 2. FUNÇÕES PRINCIPAIS =====

// 2.1 Obter NH do Arco APENAS da TELA
function obterNHArcoReal() {
    // Valor padrão se não encontrar
    let nhArco = 10;
    let encontrado = false;
    
    // Procurar em TODOS os elementos que podem conter a perícia Arco
    const selectors = [
        '.pericia-item',
        '.pericia-aprendida', 
        '.pericia-disponivel',
        '[class*="pericia"]',
        '.catalog-list-pericias > div'
    ];
    
    // Juntar todos os elementos possíveis
    let todosElementos = [];
    selectors.forEach(selector => {
        const elementos = document.querySelectorAll(selector);
        elementos.forEach(el => todosElementos.push(el));
    });
    
    // Procurar a perícia ARCO (não a técnica)
    for (let elemento of todosElementos) {
        if (!elemento || !elemento.textContent) continue;
        
        const texto = elemento.textContent.toLowerCase();
        
        // É a perícia Arco (não a técnica Arquearia Montada)
        if (texto.includes('arco') && 
            !texto.includes('montada') && 
            !texto.includes('técnica') &&
            !texto.includes('arquearia')) {
            
            // Tentar extrair o NH do elemento
            const html = elemento.innerHTML || elemento.outerHTML || '';
            
            // Procurar padrões comuns de NH
            const padroes = [
                /NH\s*(\d+)/i,
                /nh\s*(\d+)/i,
                /Nível\s*(\d+)/i,
                /(\d+)\s*\(nh\)/i,
                /<span[^>]*>(\d+)<\/span>/i,
                /class="[^"]*nh[^"]*"[^>]*>(\d+)/i
            ];
            
            for (let padrao of padroes) {
                const match = html.match(padrao);
                if (match && match[1]) {
                    nhArco = parseInt(match[1]);
                    encontrado = true;
                    console.log(`✅ NH do Arco encontrado: ${nhArco}`);
                    break;
                }
            }
            
            // Se não encontrou nos padrões, tentar no texto
            if (!encontrado) {
                const textoMatch = elemento.textContent.match(/\d+/);
                if (textoMatch) {
                    nhArco = parseInt(textoMatch[0]);
                    encontrado = true;
                    console.log(`✅ NH do Arco (texto): ${nhArco}`);
                }
            }
            
            if (encontrado) break;
        }
    }
    
    // Se não encontrou, usar cache ou padrão
    if (!encontrado && estadoTecnicas.ultimoNHArco > 0) {
        nhArco = estadoTecnicas.ultimoNHArco;
        console.log(`📊 Usando cache do NH: ${nhArco}`);
    }
    
    // Atualizar cache
    estadoTecnicas.ultimoNHArco = nhArco;
    
    return nhArco;
}

// 2.2 Verificar pré-requisitos
function verificarPreRequisitos() {
    const nhArco = obterNHArcoReal();
    
    // Cálculo CORRETO do GURPS:
    // 1. Precisa ter pelo menos 1 ponto em Arco (nível > -5)
    const dx = 10; // DX padrão do GURPS
    const nivelArco = nhArco - dx; // Ex: 13 - 10 = 3 (correto)
    
    // 2. Precisa ter Cavalgar
    const temCavalgar = verificarTemCavalgar();
    
    const temArco = nivelArco > -5; // Pelo menos 1 ponto
    const pode = temArco && temCavalgar;
    
    return {
        pode: pode,
        motivo: !temArco ? `Arco precisa de pelo menos 1 ponto (nível: ${nivelArco})` :
                !temCavalgar ? 'Falta perícia Cavalgar' : 'OK',
        nhArco: nhArco,
        nivelArco: nivelArco
    };
}

// 2.3 Verificar se tem Cavalgar (da tela)
function verificarTemCavalgar() {
    // Procurar Cavalgar na tela
    const elementos = document.querySelectorAll('.pericia-item, .pericia-aprendida');
    
    for (let elemento of elementos) {
        const texto = (elemento.textContent || '').toLowerCase();
        if (texto.includes('cavalgar')) {
            return true;
        }
    }
    
    return false;
}

// 2.4 Calcular técnica CORRETAMENTE
function calcularTecnica() {
    const prereq = verificarPreRequisitos();
    const nhArco = prereq.nhArco;
    
    // CÁLCULO 100% CORRETO DO GURPS:
    // Base: Arco-4
    const base = nhArco - 4; // Ex: 13 - 4 = 9
    
    // Verificar se já tem técnica aprendida
    const aprendida = estadoTecnicas.aprendidas.find(t => t.id === 'arquearia-montada');
    
    if (!aprendida) {
        return {
            base: base,
            atual: base,
            niveis: 0,
            pontos: 0,
            max: nhArco,
            podeComprar: prereq.pode
        };
    }
    
    // Sistema do GURPS: cada 2 pontos = +1 nível
    const pontos = aprendida.custoTotal || 0;
    const niveis = Math.floor(pontos / 2); // 2 pontos = 1 nível
    const atual = base + niveis; // Ex: 9 + 1 = 10
    
    return {
        base: base,
        atual: atual,
        niveis: niveis,
        pontos: pontos,
        max: nhArco,
        podeComprar: prereq.pode
    };
}

// 2.5 Atualizar todas as técnicas
function atualizarTodasTecnicas() {
    atualizarTecnicaNaTela();
    atualizarDisplayAprendidas();
    atualizarEstatisticas();
}

// ===== 3. INTERFACE DA TÉCNICA (SEM BOTÃO X) =====

function atualizarTecnicaNaTela() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        setTimeout(atualizarTecnicaNaTela, 500);
        return;
    }
    
    const calculo = calcularTecnica();
    const aprendida = estadoTecnicas.aprendidas.find(t => t.id === 'arquearia-montada');
    
    // Criar ou atualizar card
    let card = document.getElementById('tecnica-arquearia-montada-disponivel');
    if (!card) {
        card = document.createElement('div');
        card.id = 'tecnica-arquearia-montada-disponivel';
        
        // Remover placeholder se existir
        const placeholder = container.querySelector('.nenhuma-pericia');
        if (placeholder) placeholder.remove();
        
        container.insertBefore(card, container.firstChild);
    }
    
    // Definir estilos e conteúdo
    card.className = `pericia-item ${!calculo.podeComprar ? 'item-indisponivel' : ''}`;
    card.style.cssText = `
        background: rgba(50, 50, 65, 0.95);
        border: 2px solid ${calculo.podeComprar ? (aprendida ? '#9b59b6' : '#27ae60') : '#e74c3c'};
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 15px;
        cursor: ${calculo.podeComprar ? 'pointer' : 'not-allowed'};
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    
    // Evento de clique
    if (calculo.podeComprar) {
        card.onclick = abrirModalTecnica;
    } else {
        card.onclick = null;
    }
    
    // HTML da técnica (SEM BOTÃO X)
    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
                <h3 style="color: ${calculo.podeComprar ? '#ffd700' : '#95a5a6'}; margin: 0 0 5px 0; font-size: 18px;">
                    🏹 Arquearia Montada
                    ${aprendida ? '✅' : (calculo.podeComprar ? '▶' : '🔒')}
                </h3>
                <div style="font-size: 12px; color: #95a5a6;">
                    ● Difícil ● Técnica Especial ● Arco-4
                </div>
            </div>
            <div style="background: ${aprendida ? '#9b59b6' : (calculo.podeComprar ? '#27ae60' : '#e74c3c')}; 
                  color: white; padding: 6px 12px; border-radius: 15px; font-size: 14px; font-weight: bold;">
                NH ${calculo.atual}
                ${calculo.niveis > 0 ? ` (+${calculo.niveis})` : ''}
            </div>
        </div>
        
        <p style="color: #ccc; margin: 10px 0; line-height: 1.5; font-size: 14px;">
            Usar arco enquanto cavalga. Penalidades para disparar montado não reduzem abaixo do NH desta técnica.
        </p>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 15px;">
            <div style="background: rgba(52, 152, 219, 0.1); padding: 8px; border-radius: 6px; border-left: 3px solid #3498db;">
                <div style="color: #95a5a6; font-size: 11px;">Base (Arco-4)</div>
                <div style="color: #3498db; font-size: 16px; font-weight: bold;">${calculo.base}</div>
            </div>
            <div style="background: rgba(46, 204, 113, 0.1); padding: 8px; border-radius: 6px; border-left: 3px solid #2ecc71;">
                <div style="color: #95a5a6; font-size: 11px;">Máximo</div>
                <div style="color: #2ecc71; font-size: 16px; font-weight: bold;">${calculo.max}</div>
            </div>
        </div>
        
        <div style="margin-top: 15px;">
            ${!calculo.podeComprar ? `
                <div style="background: rgba(231, 76, 60, 0.1); padding: 10px; border-radius: 6px; border-left: 3px solid #e74c3c;">
                    <div style="color: #e74c3c; font-size: 13px;">
                        <i class="fas fa-info-circle"></i> ${verificarPreRequisitos().motivo}
                    </div>
                </div>
            ` : aprendida ? `
                <div style="background: rgba(155, 89, 182, 0.1); padding: 10px; border-radius: 6px; border-left: 3px solid #9b59b6;">
                    <div style="color: #9b59b6; font-size: 13px;">
                        <i class="fas fa-check-circle"></i> Aprendida (${calculo.pontos} pontos)
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
        
        <div style="color: #95a5a6; font-size: 11px; margin-top: 10px; text-align: right;">
            <i class="fas fa-sync-alt"></i> Atualizado: ${new Date().toLocaleTimeString()}
        </div>
    `;
    
    console.log(`✅ Técnica atualizada: NH ${calculo.atual} (Arco: ${calculo.max})`);
}

// ===== 4. DISPLAY DE TÉCNICAS APRENDIDAS (COM BOTÃO X) =====

function atualizarDisplayAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    // Limpar container
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
    
    // Adicionar cada técnica aprendida
    estadoTecnicas.aprendidas.forEach(tecnica => {
        const calculo = calcularTecnica();
        
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
        item.onclick = abrirModalTecnica;
        
        // HTML COM BOTÃO X
        item.innerHTML = `
            <!-- BOTÃO X DE EXCLUSÃO -->
            <button class="btn-excluir-tecnica" 
                    onclick="event.stopPropagation(); excluirTecnica('${tecnica.id}');"
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
                    <div style="color: #9b59b6; font-size: 12px;">
                        Arco-4
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="background: #9b59b6; color: white; padding: 4px 12px; border-radius: 15px; font-size: 14px; font-weight: bold;">
                        NH ${calculo.atual}
                    </div>
                    <div style="color: #27ae60; font-size: 14px; font-weight: bold;">
                        ${tecnica.custoTotal || 0} pts
                    </div>
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="color: #95a5a6; font-size: 12px;">
                    <i class="fas fa-chart-line"></i> +${calculo.niveis} nível(s)
                </div>
                <div style="color: #7f8c8d; font-size: 11px;">
                    Clique para editar
                </div>
            </div>
        `;
        
        container.appendChild(item);
    });
    
    console.log(`✅ Display atualizado: ${estadoTecnicas.aprendidas.length} técnica(s) aprendida(s)`);
}

// ===== 5. BOTÃO X DE EXCLUSÃO =====

function excluirTecnica(idTecnica) {
    const index = estadoTecnicas.aprendidas.findIndex(t => t.id === idTecnica);
    if (index === -1) return;
    
    const tecnica = estadoTecnicas.aprendidas[index];
    const calculo = calcularTecnica();
    
    if (confirm(`Remover "${tecnica.nome}"?\n\n` +
               `NH atual: ${calculo.atual}\n` +
               `Pontos recuperados: ${calculo.pontos}`)) {
        
        estadoTecnicas.aprendidas.splice(index, 1);
        
        // Salvar apenas as técnicas (sem localStorage de perícias)
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.aprendidas));
        }
        
        atualizarTodasTecnicas();
        
        alert(`✅ "${tecnica.nome}" removida!\n${calculo.pontos} pontos recuperados.`);
    }
}

// ===== 6. ATUALIZAR ESTATÍSTICAS =====

function atualizarEstatisticas() {
    // Calcular total de pontos
    const total = estadoTecnicas.aprendidas.reduce((sum, t) => sum + (t.custoTotal || 0), 0);
    estadoTecnicas.pontosTotal = total;
    
    // Atualizar badges
    const badge = document.getElementById('pontos-tecnicas-total');
    if (badge) badge.textContent = `[${total} pts]`;
    
    const qtdTotal = document.getElementById('qtd-tecnicas-total');
    const ptsTotal = document.getElementById('pts-tecnicas-total');
    
    if (qtdTotal) qtdTotal.textContent = estadoTecnicas.aprendidas.length;
    if (ptsTotal) ptsTotal.textContent = `(${total} pts)`;
}

// ===== 7. MODAL DE COMPRA =====

function abrirModalTecnica() {
    const calculo = calcularTecnica();
    const nhArco = calculo.max;
    const base = calculo.base;
    
    const aprendida = estadoTecnicas.aprendidas.find(t => t.id === 'arquearia-montada');
    const pontosAtuais = aprendida ? aprendida.custoTotal || 0 : 0;
    const niveisAtuais = Math.floor(pontosAtuais / 2);
    
    let pontosSelecionados = pontosAtuais;
    const maxNiveis = nhArco - base;
    const maxPontos = maxNiveis * 2; // Cada nível custa 2 pontos
    
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    const modalContent = document.querySelector('.modal-tecnica');
    
    if (!modalOverlay || !modalContent) {
        alert('Modal não encontrado!');
        return;
    }
    
    function atualizarModal() {
        const niveisSelecionados = Math.floor(pontosSelecionados / 2);
        const nhAtual = base + niveisSelecionados;
        const diferenca = pontosSelecionados - pontosAtuais;
        
        modalContent.innerHTML = `
            <div class="modal-header">
                <h2><i class="fas fa-bullseye"></i> Arquearia Montada</h2>
                <button class="modal-close-btn" onclick="fecharModalTecnica()">×</button>
            </div>
            
            <div class="modal-body">
                <!-- INFORMAÇÕES -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="text-align: center; background: rgba(52, 152, 219, 0.1); padding: 15px; border-radius: 8px;">
                        <div style="color: #95a5a6; font-size: 12px;">Seu NH em Arco</div>
                        <div style="color: #3498db; font-size: 28px; font-weight: bold;">${nhArco}</div>
                    </div>
                    <div style="text-align: center; background: rgba(46, 204, 113, 0.1); padding: 15px; border-radius: 8px;">
                        <div style="color: #95a5a6; font-size: 12px;">Base (Arco-4)</div>
                        <div style="color: #2ecc71; font-size: 28px; font-weight: bold;">${base}</div>
                    </div>
                </div>
                
                <!-- CONTROLE DE PONTOS -->
                <div style="text-align: center; margin: 25px 0;">
                    <div style="color: #ffd700; font-size: 16px; margin-bottom: 15px;">
                        Pontos: <span style="font-size: 32px;">${pontosSelecionados}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: center; gap: 15px; margin: 20px 0;">
                        <button id="btn-menos-pontos" 
                                onclick="mudarPontosTecnica(-2)"
                                ${pontosSelecionados <= 0 ? 'disabled' : ''}
                                style="padding: 12px 24px; background: #e74c3c; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; ${pontosSelecionados <= 0 ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
                            -2 pts
                        </button>
                        
                        <button id="btn-mais-pontos"
                                onclick="mudarPontosTecnica(2)"
                                ${pontosSelecionados >= maxPontos ? 'disabled' : ''}
                                style="padding: 12px 24px; background: #27ae60; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; ${pontosSelecionados >= maxPontos ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
                            +2 pts
                        </button>
                    </div>
                    
                    <div style="color: #95a5a6; font-size: 14px; margin-top: 10px;">
                        Níveis: <strong style="color: #ffd700;">${niveisSelecionados}</strong>
                        | NH final: <strong style="color: #2ecc71;">${nhAtual}</strong>
                    </div>
                </div>
                
                <!-- CUSTO -->
                <div style="background: rgba(155, 89, 182, 0.2); padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
                    <div style="color: #9b59b6; font-size: 14px; margin-bottom: 5px;">Custo Total</div>
                    <div style="color: white; font-size: 36px; font-weight: bold;">${pontosSelecionados} pontos</div>
                    
                    ${diferenca !== 0 ? `
                        <div style="color: ${diferenca > 0 ? '#27ae60' : '#e74c3c'}; font-size: 14px; margin-top: 8px;">
                            ${diferenca > 0 ? '+' : ''}${diferenca} pontos
                        </div>
                    ` : ''}
                </div>
                
                <!-- REGRAS -->
                <div style="background: rgba(52, 152, 219, 0.1); padding: 15px; border-radius: 6px; margin-top: 20px;">
                    <div style="color: #3498db; font-size: 13px; margin-bottom: 8px;">
                        <i class="fas fa-info-circle"></i> Regras do GURPS
                    </div>
                    <div style="color: #ccc; font-size: 12px; line-height: 1.4;">
                        • Cada 2 pontos = +1 nível na técnica<br>
                        • Máximo: NH ${nhArco} (${maxNiveis} níveis acima da base)<br>
                        • Dificuldade: Difícil<br>
                        • Técnica não pode exceder o NH da perícia base
                    </div>
                </div>
            </div>
            
            <div class="modal-footer" style="display: flex; gap: 10px; padding: 20px;">
                <button onclick="fecharModalTecnica()" 
                        style="flex: 1; padding: 15px; background: #7f8c8d; color: white; border: none; border-radius: 5px; font-size: 14px; cursor: pointer;">
                    Cancelar
                </button>
                <button onclick="comprarTecnica(${pontosSelecionados})" 
                        style="flex: 1; padding: 15px; background: ${pontosSelecionados === pontosAtuais ? '#95a5a6' : '#9b59b6'}; color: white; border: none; border-radius: 5px; font-size: 14px; font-weight: bold; cursor: pointer;">
                    ${pontosSelecionados === pontosAtuais ? 'Fechar' : pontosSelecionados > pontosAtuais ? 'Comprar' : 'Reduzir'}
                </button>
            </div>
        `;
    }
    
    // Funções globais do modal
    window.fecharModalTecnica = function() {
        modalOverlay.style.display = 'none';
    };
    
    window.mudarPontosTecnica = function(mudanca) {
        const novo = pontosSelecionados + mudanca;
        if (novo >= 0 && novo <= maxPontos) {
            pontosSelecionados = novo;
            atualizarModal();
        }
    };
    
    window.comprarTecnica = function(pontos) {
        if (pontos === pontosAtuais) {
            fecharModalTecnica();
            return;
        }
        
        const niveis = Math.floor(pontos / 2);
        const nhFinal = base + niveis;
        
        if (confirm(`Confirmar ${pontos > pontosAtuais ? 'compra' : 'redução'}?\n\n` +
                   `Pontos: ${pontosAtuais} → ${pontos}\n` +
                   `Níveis: +${niveis}\n` +
                   `NH: ${base + Math.floor(pontosAtuais/2)} → ${nhFinal}`)) {
            
            const index = estadoTecnicas.aprendidas.findIndex(t => t.id === 'arquearia-montada');
            
            if (index >= 0) {
                // Atualizar existente
                estadoTecnicas.aprendidas[index] = {
                    id: 'arquearia-montada',
                    nome: 'Arquearia Montada',
                    dificuldade: 'Difícil',
                    custoTotal: pontos,
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
                    custoTotal: pontos,
                    periciaBase: 'Arco',
                    modificadorBase: -4,
                    dataAquisicao: new Date().toISOString()
                });
            }
            
            // Salvar técnicas aprendidas
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.aprendidas));
            }
            
            atualizarTodasTecnicas();
            
            alert(`✅ Técnica ${pontos > pontosAtuais ? 'comprada' : 'atualizada'}!\nNH: ${nhFinal}`);
            
            fecharModalTecnica();
        }
    };
    
    // Mostrar modal
    atualizarModal();
    modalOverlay.style.display = 'flex';
}

// ===== 8. OBSERVAÇÃO EM TEMPO REAL =====

function iniciarObservacao() {
    if (estadoTecnicas.observacaoAtiva) return;
    
    console.log("👀 Iniciando observação em tempo real...");
    
    let ultimoNH = 0;
    let ultimoUpdate = Date.now();
    
    estadoTecnicas.intervaloObservacao = setInterval(() => {
        const agora = Date.now();
        
        // Verificar a cada 500ms
        if (agora - ultimoUpdate > 500) {
            const nhAtual = obterNHArcoReal();
            
            if (nhAtual !== ultimoNH) {
                console.log(`🔄 NH do Arco mudou: ${ultimoNH} → ${nhAtual}`);
                ultimoNH = nhAtual;
                atualizarTodasTecnicas();
            }
            
            ultimoUpdate = agora;
        }
    }, 100); // Verificar a cada 100ms
    
    estadoTecnicas.observacaoAtiva = true;
}

// ===== 9. INICIALIZAÇÃO =====

function inicializarSistemaTecnicas() {
    console.log("🚀 Inicializando sistema de técnicas...");
    
    // Carregar técnicas aprendidas (se houver localStorage)
    if (typeof localStorage !== 'undefined') {
        try {
            const salvo = localStorage.getItem('tecnicasAprendidas');
            if (salvo) {
                estadoTecnicas.aprendidas = JSON.parse(salvo);
                console.log(`📂 ${estadoTecnicas.aprendidas.length} técnica(s) carregada(s)`);
            }
        } catch (e) {
            console.log("⚠️ Erro ao carregar técnicas:", e);
        }
    }
    
    // Iniciar observação
    iniciarObservacao();
    
    // Primeira atualização
    setTimeout(() => {
        atualizarTodasTecnicas();
    }, 1000);
    
    console.log("✅ Sistema de técnicas inicializado!");
}

// ===== 10. CARREGAMENTO =====

document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM carregado, aguardando para iniciar técnicas...");
    
    setTimeout(() => {
        if (!window.sistemaTecnicasInicializado) {
            inicializarSistemaTecnicas();
            window.sistemaTecnicasInicializado = true;
        }
    }, 1500);
});

// ===== 11. FUNÇÕES GLOBAIS =====

window.abrirModalTecnica = abrirModalTecnica;
window.excluirTecnica = excluirTecnica;

// Função para debug
window.verificarCalculo = function() {
    console.log("=== CÁLCULO DA TÉCNICA ===");
    const nh = obterNHArcoReal();
    const calculo = calcularTecnica();
    console.log("NH Arco:", nh);
    console.log("Base (Arco-4):", calculo.base);
    console.log("Pontos gastos:", calculo.pontos);
    console.log("Níveis:", calculo.niveis);
    console.log("NH atual:", calculo.atual);
    console.log("Máximo:", calculo.max);
    console.log("Pode comprar:", calculo.podeComprar);
};

console.log("✅ TECNICAS.JS - VERSÃO FINAL CARREGADA!");
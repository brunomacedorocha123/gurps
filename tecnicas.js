// ===== SISTEMA DE TÉCNICAS - VERSÃO COMPLETA CORRIGIDA =====
console.log("🎯 SISTEMA DE TÉCNICAS - CÁLCULO INCREMENTAL CORRETO CARREGADO");

// ===== 1. ESTADO DO SISTEMA =====
const estadoTecnicas = {
    aprendidas: [],        // Técnicas compradas
    pontosTotal: 0         // Pontos gastos
};

// ===== 2. FUNÇÕES PRINCIPAIS =====

// 2.1 Obter NH do Arco CORRETAMENTE - VERSÃO MELHORADA
function obterNHArcoReal() {
    console.log("🔍 Buscando NH do Arco...");
    
    // Estratégia 1: Buscar em pericias-aprendidas
    const aprendidasContainer = document.getElementById('pericias-aprendidas');
    if (aprendidasContainer) {
        console.log("✅ Container 'pericias-aprendidas' encontrado");
        
        // Procurar por qualquer elemento que contenha "Arco" e "NH"
        const elementos = aprendidasContainer.querySelectorAll('*');
        
        for (let elemento of elementos) {
            const texto = (elemento.textContent || '').trim();
            if (texto.includes('Arco') && !texto.includes('Montada')) {
                console.log("📋 Texto encontrado:", texto);
                
                // Extrair número após "NH"
                const match = texto.match(/NH\s*[:\-]?\s*(\d+)/i);
                if (match && match[1]) {
                    const nh = parseInt(match[1]);
                    console.log("✅ NH encontrado:", nh);
                    return nh;
                }
                
                // Tentar pegar o último número no texto (como fallback)
                const numeros = texto.match(/\d+/g);
                if (numeros && numeros.length > 0) {
                    // Pega o maior número (geralmente é o NH)
                    const maiorNumero = Math.max(...numeros.map(n => parseInt(n)));
                    if (maiorNumero > 0 && maiorNumero <= 25) {
                        console.log("⚠️ NH inferido (fallback):", maiorNumero);
                        return maiorNumero;
                    }
                }
            }
        }
    }
    
    // Estratégia 2: Buscar em toda a página
    console.log("⚠️ Buscando em toda a página...");
    const elementosGlobais = document.querySelectorAll('*');
    for (let elemento of elementosGlobais) {
        const texto = (elemento.textContent || '').trim();
        if (texto.includes('Arco') && texto.includes('NH') && !texto.includes('Montada')) {
            console.log("🌍 Texto global:", texto.substring(0, 50));
            const match = texto.match(/NH\s*[:\-]?\s*(\d+)/i);
            if (match && match[1]) {
                const nh = parseInt(match[1]);
                console.log("✅ NH encontrado (global):", nh);
                return nh;
            }
        }
    }
    
    // Estratégia 3: Verificar console.log do seu sistema
    console.log("⚠️ Usando valor padrão 10 (não encontrou Arco)");
    return 10; // Default
}

// 2.2 Verificar se tem Cavalgar
function verificarTemCavalgar() {
    const aprendidasContainer = document.getElementById('pericias-aprendidas');
    if (!aprendidasContainer) {
        console.log("⚠️ Container pericias-aprendidas não encontrado para Cavalgar");
        return false;
    }
    
    const elementos = aprendidasContainer.querySelectorAll('*');
    for (let elemento of elementos) {
        const texto = (elemento.textContent || '').toLowerCase();
        if (texto.includes('cavalgar') || texto.includes('cavalaria')) {
            console.log("✅ Cavalgar encontrado");
            return true;
        }
    }
    
    console.log("⚠️ Cavalgar NÃO encontrado");
    return false;
}

// 2.3 FUNÇÃO 100% CORRETA: Calcular níveis baseado nos pontos (TÉCNICA DIFÍCIL)
function calcularNiveisParaPontos(pontos) {
    // REGRA 100% CORRETA PARA TÉCNICA DIFÍCIL:
    // 2 pontos = 1 nível (+1)
    // 3 pontos = 2 níveis (+2) 
    // 4 pontos = 3 níveis (+3)
    // 5 pontos = 4 níveis (+4)
    
    if (pontos >= 5) return 4;
    if (pontos >= 4) return 3;
    if (pontos >= 3) return 2;
    if (pontos >= 2) return 1;
    return 0;
}

// 2.4 FUNÇÃO 100% CORRETA: Calcular pontos baseado nos níveis (TÉCNICA DIFÍCIL)
function calcularPontosParaNiveis(niveis) {
    // REGRA INVERSA 100% CORRETA:
    // 1 nível = 2 pontos
    // 2 níveis = 3 pontos
    // 3 níveis = 4 pontos
    // 4 níveis = 5 pontos
    
    switch(niveis) {
        case 4: return 5;
        case 3: return 4;
        case 2: return 3;
        case 1: return 2;
        default: return 0;
    }
}

// 2.5 FUNÇÃO IMPORTANTE: Obter próximo valor de pontos permitido
function obterProximoValorPontos(pontosAtuais, aumentar) {
    const valoresPermitidos = [0, 2, 3, 4, 5];
    
    if (aumentar) {
        // Encontrar o próximo valor MAIOR que o atual
        for (let valor of valoresPermitidos) {
            if (valor > pontosAtuais) {
                return valor;
            }
        }
        return pontosAtuais; // Já está no máximo
    } else {
        // Encontrar o próximo valor MENOR que o atual
        for (let i = valoresPermitidos.length - 1; i >= 0; i--) {
            if (valoresPermitidos[i] < pontosAtuais) {
                return valoresPermitidos[i];
            }
        }
        return 0; // Já está no mínimo
    }
}

// 2.6 Calcular técnica COM CÁLCULO 100% CORRETO
function calcularTecnica() {
    const nhArco = obterNHArcoReal();
    const base = nhArco - 4;
    const temCavalgar = verificarTemCavalgar();
    
    // Verificar técnica aprendida
    const aprendida = estadoTecnicas.aprendidas.find(t => t.id === 'arquearia-montada');
    
    if (!aprendida) {
        return {
            base: base,
            atual: base,
            niveis: 0,
            pontos: 0,
            max: nhArco,
            podeComprar: true,
            temCavalgar: temCavalgar,
            nhArco: nhArco
        };
    }
    
    const pontos = aprendida.custoTotal || 0;
    const niveis = calcularNiveisParaPontos(pontos);
    const atual = base + niveis;
    
    return {
        base: base,
        atual: atual,
        niveis: niveis,
        pontos: pontos,
        max: nhArco,
        podeComprar: true,
        temCavalgar: temCavalgar,
        nhArco: nhArco
    };
}

// ===== 3. INTERFACE DA TÉCNICA =====

function atualizarTecnicaNaTela() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        setTimeout(atualizarTecnicaNaTela, 1000);
        return;
    }
    
    const calculo = calcularTecnica();
    const aprendida = estadoTecnicas.aprendidas.find(t => t.id === 'arquearia-montada');
    
    // Criar ou atualizar card
    let card = document.getElementById('tecnica-arquearia-montada');
    if (!card) {
        card = document.createElement('div');
        card.id = 'tecnica-arquearia-montada';
        card.style.cssText = 'margin-bottom: 15px;';
        container.insertBefore(card, container.firstChild);
    }
    
    // Determinar se pode comprar
    const podeComprar = calculo.temCavalgar && calculo.nhArco > 0;
    
    // HTML da técnica
    card.innerHTML = `
        <div class="pericia-item" style="
            background: rgba(50, 50, 65, 0.95);
            border: 2px solid ${aprendida ? '#9b59b6' : (podeComprar ? '#27ae60' : '#e74c3c')};
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            cursor: ${podeComprar ? 'pointer' : 'not-allowed'};
            opacity: ${podeComprar ? '1' : '0.7'};
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div>
                    <h3 style="color: #ffd700; margin: 0 0 5px 0; font-size: 18px;">
                        🏹 Arquearia Montada
                        ${aprendida ? '✅' : (podeComprar ? '▶' : '🚫')}
                    </h3>
                    <div style="font-size: 12px; color: #95a5a6;">
                        ● Difícil ● Técnica Especial ● Arco-4
                    </div>
                </div>
                <div style="
                    background: ${aprendida ? '#9b59b6' : (podeComprar ? '#27ae60' : '#e74c3c')}; 
                    color: white; 
                    padding: 6px 12px; 
                    border-radius: 15px; 
                    font-size: 14px; 
                    font-weight: bold;
                ">
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
                    <div style="color: #95a5a6; font-size: 11px;">Máximo (Arco)</div>
                    <div style="color: #2ecc71; font-size: 16px; font-weight: bold;">${calculo.max}</div>
                </div>
            </div>
            
            <div style="margin-top: 15px;">
                <div style="
                    background: ${aprendida ? 'rgba(155, 89, 182, 0.1)' : (podeComprar ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)')}; 
                    padding: 10px; 
                    border-radius: 6px; 
                    border-left: 3px solid ${aprendida ? '#9b59b6' : (podeComprar ? '#27ae60' : '#e74c3c')};
                ">
                    <div style="color: ${aprendida ? '#9b59b6' : (podeComprar ? '#27ae60' : '#e74c3c')}; font-size: 13px;">
                        <i class="fas fa-${aprendida ? 'check-circle' : (podeComprar ? 'shopping-cart' : 'exclamation-triangle')}"></i>
                        ${aprendida ? `Aprendida (${calculo.pontos} pontos = +${calculo.niveis} níveis)` : 
                          podeComprar ? 'Disponível para compra' : 
                          `PRÉ-REQUISITO: Precisa de Cavalgar (Arco: ${calculo.nhArco})`}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Evento de clique APENAS se pode comprar
    if (podeComprar) {
        card.onclick = abrirModalTecnica;
    } else {
        card.onclick = null;
    }
}

// ===== 4. TÉCNICAS APRENDIDAS =====

function atualizarDisplayAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (estadoTecnicas.aprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia-aprendida" style="
                text-align: center; 
                padding: 30px; 
                color: #95a5a6; 
                font-style: italic;
            ">
                <i class="fas fa-tools" style="font-size: 32px; margin-bottom: 10px;"></i>
                <div>Nenhuma técnica aprendida</div>
            </div>
        `;
        return;
    }
    
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
            position: relative;
        `;
        item.onclick = abrirModalTecnica;
        
        item.innerHTML = `
            <button class="btn-excluir-tecnica" 
                    onclick="event.stopPropagation(); excluirTecnica('${tecnica.id}');"
                    style="
                        position: absolute; 
                        top: 10px; 
                        right: 10px; 
                        width: 30px; 
                        height: 30px; 
                        border-radius: 50%; 
                        background: #e74c3c; 
                        color: white; 
                        border: none; 
                        cursor: pointer; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        font-size: 20px; 
                        font-weight: bold; 
                        z-index: 10;
                    ">
                ×
            </button>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-right: 30px;">
                <div>
                    <h4 style="color: #ffd700; margin: 0 0 5px 0; font-size: 16px;">
                        🏹 ${tecnica.nome}
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
            
            <div style="color: #95a5a6; font-size: 12px;">
                +${calculo.niveis} nível(s) acima da base (${calculo.pontos} pontos)
            </div>
        `;
        
        container.appendChild(item);
    });
}

// ===== 5. EXCLUSÃO DE TÉCNICA =====

function excluirTecnica(id) {
    const index = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
    if (index === -1) return;
    
    const tecnica = estadoTecnicas.aprendidas[index];
    
    if (confirm(`Remover "${tecnica.nome}"?\n\nRecuperará ${tecnica.custoTotal || 0} pontos.`)) {
        estadoTecnicas.aprendidas.splice(index, 1);
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.aprendidas));
        
        atualizarTodasTecnicas();
        alert(`✅ "${tecnica.nome}" removida!`);
    }
}

// ===== 6. MODAL DE COMPRA - VERSÃO INCREMENTAL 100% CORRETA =====

function abrirModalTecnica() {
    const calculo = calcularTecnica();
    const nhArco = calculo.nhArco;
    const base = calculo.base;
    
    if (nhArco < 5) {
        alert("❌ Você precisa ter Arco NH 5 ou mais para usar esta técnica!");
        return;
    }
    
    if (!calculo.temCavalgar) {
        alert("❌ Você precisa da perícia Cavalgar para usar esta técnica!");
        return;
    }
    
    const aprendida = estadoTecnicas.aprendidas.find(t => t.id === 'arquearia-montada');
    const pontosAtuais = aprendida ? aprendida.custoTotal || 0 : 0;
    
    let pontosSelecionados = pontosAtuais;
    const maxNiveis = nhArco - base;
    const maxPontos = calcularPontosParaNiveis(maxNiveis);
    
    // Criar modal se não existir
    let modalOverlay = document.querySelector('.modal-tecnica-overlay');
    let modalContent = document.querySelector('.modal-tecnica');
    
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-tecnica-overlay';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            display: none;
        `;
        
        modalContent = document.createElement('div');
        modalContent.className = 'modal-tecnica';
        modalContent.style.cssText = `
            background: rgba(40, 40, 50, 0.95);
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            border: 2px solid #9b59b6;
            overflow: hidden;
        `;
        
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
    }
    
    function atualizarModal() {
        const niveisSelecionados = calcularNiveisParaPontos(pontosSelecionados);
        const nhAtual = base + niveisSelecionados;
        const diferenca = pontosSelecionados - pontosAtuais;
        
        modalContent.innerHTML = `
            <div class="modal-header" style="
                background: rgba(155, 89, 182, 0.2);
                padding: 20px;
                border-bottom: 1px solid #9b59b6;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <h2 style="color: #ffd700; margin: 0; font-size: 20px;">
                    <i class="fas fa-bullseye"></i> Arquearia Montada
                </h2>
                <button class="modal-close-btn" onclick="fecharModalTecnica()" style="
                    background: none;
                    border: none;
                    color: white;
                    font-size: 28px;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">×</button>
            </div>
            
            <div class="modal-body" style="padding: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="text-align: center; padding: 10px; background: rgba(52, 152, 219, 0.1); border-radius: 8px;">
                        <div style="color: #95a5a6; font-size: 12px;">Seu Arco</div>
                        <div style="color: #3498db; font-size: 28px; font-weight: bold;">${nhArco}</div>
                    </div>
                    <div style="text-align: center; padding: 10px; background: rgba(46, 204, 113, 0.1); border-radius: 8px;">
                        <div style="color: #95a5a6; font-size: 12px;">Base (Arco-4)</div>
                        <div style="color: #2ecc71; font-size: 28px; font-weight: bold;">${base}</div>
                    </div>
                </div>
                
                <!-- CONTROLE INCREMENTAL SIMPLES E CORRETO -->
                <div style="text-align: center; margin: 20px 0; padding: 20px; background: rgba(0, 0, 0, 0.2); border-radius: 8px;">
                    <div style="color: #95a5a6; font-size: 14px;">Pontos de Técnica</div>
                    <div style="color: #ffd700; font-size: 42px; font-weight: bold; margin: 10px 0;">${pontosSelecionados}</div>
                    
                    <div style="display: flex; justify-content: center; gap: 15px; margin: 20px 0;">
                        <button onclick="mudarPontosTecnica(-1)" ${pontosSelecionados <= 0 ? 'disabled' : ''}
                                style="
                                    padding: 12px 24px;
                                    background: ${pontosSelecionados <= 0 ? '#7f8c8d' : '#e74c3c'};
                                    color: white;
                                    border: none;
                                    border-radius: 6px;
                                    cursor: ${pontosSelecionados <= 0 ? 'not-allowed' : 'pointer'};
                                    font-size: 16px;
                                    font-weight: bold;
                                    min-width: 100px;
                                ">
                            -1 pt
                        </button>
                        <button onclick="mudarPontosTecnica(1)" ${pontosSelecionados >= maxPontos ? 'disabled' : ''}
                                style="
                                    padding: 12px 24px;
                                    background: ${pontosSelecionados >= maxPontos ? '#7f8c8d' : '#27ae60'};
                                    color: white;
                                    border: none;
                                    border-radius: 6px;
                                    cursor: ${pontosSelecionados >= maxPontos ? 'not-allowed' : 'pointer'};
                                    font-size: 16px;
                                    font-weight: bold;
                                    min-width: 100px;
                                ">
                            +1 pt
                        </button>
                    </div>
                    
                    <div style="color: #ccc; margin-top: 15px;">
                        <div>
                            Níveis: <strong style="color: #ffd700;">${niveisSelecionados}</strong>
                            | NH Final: <strong style="color: #2ecc71;">${nhAtual}</strong>
                        </div>
                        <div style="font-size: 12px; color: #95a5a6; margin-top: 5px;">
                            Técnica Difícil: 2 pts = +1 nível | 3 pts = +2 | 4 pts = +3 | 5 pts = +4
                        </div>
                    </div>
                </div>
                
                <!-- CUSTO -->
                <div style="background: rgba(155, 89, 182, 0.2); padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <div style="color: #9b59b6; font-size: 12px;">Custo Total</div>
                    <div style="color: white; font-size: 32px; font-weight: bold;">${pontosSelecionados} pontos</div>
                    ${diferenca !== 0 ? `
                        <div style="color: ${diferenca > 0 ? '#27ae60' : '#e74c3c'}; font-size: 14px; margin-top: 5px;">
                            ${diferenca > 0 ? '+' : ''}${diferenca} ponto(s) ${diferenca > 0 ? 'adicionais' : 'a menos'}
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="modal-footer" style="
                display: flex;
                gap: 10px;
                padding: 20px;
                background: rgba(0, 0, 0, 0.2);
                border-top: 1px solid #9b59b6;
            ">
                <button onclick="fecharModalTecnica()" 
                        style="
                            flex: 1;
                            padding: 12px;
                            background: #7f8c8d;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 16px;
                        ">
                    Cancelar
                </button>
                <button onclick="comprarTecnica(${pontosSelecionados})" 
                        style="
                            flex: 1;
                            padding: 12px;
                            background: ${pontosSelecionados === pontosAtuais ? '#95a5a6' : '#9b59b6'};
                            color: white;
                            border: none;
                            border-radius: 5px;
                            font-weight: bold;
                            cursor: pointer;
                            font-size: 16px;
                        ">
                    ${pontosSelecionados === pontosAtuais ? 'Fechar' : 
                      pontosSelecionados > pontosAtuais ? 'Comprar' : 'Reduzir'}
                </button>
            </div>
        `;
    }
    
    // Funções globais do modal
    window.fecharModalTecnica = () => {
        modalOverlay.style.display = 'none';
    };
    
    window.mudarPontosTecnica = (mudanca) => {
        const novo = pontosSelecionados + mudanca;
        
        // Só permitir valores entre 0 e maxPontos
        if (novo >= 0 && novo <= maxPontos) {
            pontosSelecionados = novo;
            atualizarModal();
        }
    };
    
    window.comprarTecnica = (pontos) => {
        if (pontos === pontosAtuais) {
            fecharModalTecnica();
            return;
        }
        
        const niveis = calcularNiveisParaPontos(pontos);
        const nhFinal = base + niveis;
        
        const diferenca = pontos - pontosAtuais;
        const mensagem = diferenca > 0 
            ? `Adicionar ${diferenca} ponto(s)?\n\nNíveis: +${niveis} (era +${calcularNiveisParaPontos(pontosAtuais)})\nNH: ${nhFinal} (era ${base + calcularNiveisParaPontos(pontosAtuais)})\nTotal: ${pontos} pontos`
            : `Reduzir ${Math.abs(diferenca)} ponto(s)?\n\nNíveis: +${niveis} (era +${calcularNiveisParaPontos(pontosAtuais)})\nNH: ${nhFinal} (era ${base + calcularNiveisParaPontos(pontosAtuais)})\nTotal: ${pontos} pontos`;
        
        if (confirm(mensagem)) {
            const index = estadoTecnicas.aprendidas.findIndex(t => t.id === 'arquearia-montada');
            
            if (pontos === 0 && index >= 0) {
                estadoTecnicas.aprendidas.splice(index, 1);
            } else if (index >= 0) {
                estadoTecnicas.aprendidas[index] = {
                    id: 'arquearia-montada',
                    nome: 'Arquearia Montada',
                    custoTotal: pontos,
                    dificuldade: 'Difícil'
                };
            } else if (pontos > 0) {
                estadoTecnicas.aprendidas.push({
                    id: 'arquearia-montada',
                    nome: 'Arquearia Montada',
                    custoTotal: pontos,
                    dificuldade: 'Difícil'
                });
            }
            
            localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.aprendidas));
            atualizarTodasTecnicas();
            
            alert(`✅ Técnica ${diferenca > 0 ? 'melhorada' : 'reduzida'}!\nNíveis: +${niveis}\nNH: ${nhFinal}`);
            fecharModalTecnica();
        }
    };
    
    // Mostrar modal
    atualizarModal();
    modalOverlay.style.display = 'flex';
}

// ===== 7. ATUALIZAR TUDO =====

function atualizarTodasTecnicas() {
    atualizarTecnicaNaTela();
    atualizarDisplayAprendidas();
}

// ===== 8. INICIALIZAÇÃO =====

function inicializarSistemaTecnicas() {
    // Carregar técnicas salvas
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.aprendidas = JSON.parse(salvo);
        }
    } catch (e) {
        console.error("Erro ao carregar técnicas:", e);
    }
    
    // Aguardar página carregar e atualizar
    setTimeout(() => {
        atualizarTodasTecnicas();
        
        // Atualizar periodicamente (caso mude o Arco)
        setInterval(() => {
            atualizarTodasTecnicas();
        }, 5000);
    }, 1500);
}

// ===== 9. CARREGAMENTO =====

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(inicializarSistemaTecnicas, 1000);
});

// ===== 10. FUNÇÕES GLOBAIS =====

window.abrirModalTecnica = abrirModalTecnica;
window.excluirTecnica = excluirTecnica;
window.atualizarTodasTecnicas = atualizarTodasTecnicas;

console.log("✅ TECNICAS.JS - VERSÃO INCREMENTAL CORRETA PRONTA!");
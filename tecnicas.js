// ===== SISTEMA DE TÉCNICAS - VERSÃO COMPLETA 100% CORRETA FINAL =====
console.log("🎯 SISTEMA DE TÉCNICAS - VERSÃO FINAL 100% CORRETA");

// ===== 1. ESTADO DO SISTEMA =====
const estadoTecnicas = {
    aprendidas: [],        // Técnicas compradas
    pontosTotal: 0         // Pontos gastos
};

// ===== 2. FUNÇÕES DE CÁLCULO 100% CORRETAS FINAIS =====

// 2.1 Obter NH do Arco CORRETAMENTE
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

// 2.3 FUNÇÃO 100% CORRETA FINAL: Calcular níveis baseado nos pontos (TÉCNICA DIFÍCIL)
function calcularNiveisParaPontos(pontos) {
    console.log(`🔢 Calculando níveis para ${pontos} pontos (Técnica Difícil - CORRETO)`);
    
    // REGRA 100% CORRETA FINAL PARA TÉCNICA DIFÍCIL:
    // MENOS DE 2 PONTOS = 0 NÍVEIS
    // 2 pontos = 1 nível (+1)
    // 3 pontos = 2 níveis (+2) 
    // 4 pontos = 3 níveis (+3)
    // 5 pontos = 4 níveis (+4)
    
    // CORREÇÃO FINAL: MENOS DE 2 PONTOS = 0 NÍVEIS
    if (pontos < 2) {
        console.log(`❌ ${pontos} pontos → 0 níveis (mínimo 2 pontos para técnica difícil)`);
        return 0;
    }
    
    if (pontos >= 5) {
        console.log(`✅ ${pontos} pontos → 4 níveis`);
        return 4;
    }
    
    if (pontos >= 4) {
        console.log(`✅ ${pontos} pontos → 3 níveis`);
        return 3;
    }
    
    if (pontos >= 3) {
        console.log(`✅ ${pontos} pontos → 2 níveis`);
        return 2;
    }
    
    // pontos >= 2
    console.log(`✅ ${pontos} pontos → 1 nível`);
    return 1;
}

// 2.4 FUNÇÃO 100% CORRETA: Calcular pontos baseado nos níveis (TÉCNICA DIFÍCIL)
function calcularPontosParaNiveis(niveis) {
    console.log(`💰 Calculando pontos para ${niveis} níveis (Técnica Difícil - CORRETO)`);
    
    // REGRA INVERSA 100% CORRETA:
    // 0 níveis = 0 pontos
    // 1 nível = 2 pontos
    // 2 níveis = 3 pontos
    // 3 níveis = 4 pontos
    // 4 níveis = 5 pontos
    
    switch(niveis) {
        case 4:
            console.log("✅ 4 níveis → 5 pontos");
            return 5;
        case 3:
            console.log("✅ 3 níveis → 4 pontos");
            return 4;
        case 2:
            console.log("✅ 2 níveis → 3 pontos");
            return 3;
        case 1:
            console.log("✅ 1 nível → 2 pontos");
            return 2;
        case 0:
            console.log("✅ 0 níveis → 0 pontos");
            return 0;
        default:
            console.log(`⚠️ Nível inválido: ${niveis}, usando 0 pontos`);
            return 0;
    }
}

// 2.5 Calcular técnica COM CÁLCULO 100% CORRETO
function calcularTecnica() {
    console.log("🧮 Calculando técnica (CÁLCULO 100% CORRETO)...");
    
    const nhArco = obterNHArcoReal();
    const base = nhArco - 4;
    const temCavalgar = verificarTemCavalgar();
    
    console.log(`📊 NH Arco: ${nhArco}, Base: ${base}, Tem Cavalgar: ${temCavalgar}`);
    
    // Verificar técnica aprendida
    const aprendida = estadoTecnicas.aprendidas.find(t => t.id === 'arquearia-montada');
    
    if (!aprendida) {
        const resultado = {
            base: base,
            atual: base,
            niveis: 0,
            pontos: 0,
            max: nhArco,
            podeComprar: true,
            temCavalgar: temCavalgar,
            nhArco: nhArco
        };
        
        console.log("📈 Resultado (não aprendida):", resultado);
        return resultado;
    }
    
    // CÁLCULO CORRETO: Usar nova função
    const pontos = aprendida.custoTotal || 0;
    const niveis = calcularNiveisParaPontos(pontos);
    const atual = base + niveis;
    
    const resultado = {
        base: base,
        atual: atual,
        niveis: niveis,
        pontos: pontos,
        max: nhArco,
        podeComprar: true,
        temCavalgar: temCavalgar,
        nhArco: nhArco
    };
    
    console.log("📈 Resultado (aprendida):", resultado);
    console.log(`✅ CORRETO: ${pontos} pontos → ${niveis} níveis → NH ${atual}`);
    return resultado;
}

// ===== 3. INTERFACE DA TÉCNICA =====

function atualizarTecnicaNaTela() {
    console.log("🔄 Atualizando técnica na tela...");
    
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.log("❌ Container '#lista-tecnicas' não encontrado!");
        setTimeout(atualizarTecnicaNaTela, 1000);
        return;
    }
    
    const calculo = calcularTecnica();
    const aprendida = estadoTecnicas.aprendidas.find(t => t.id === 'arquearia-montada');
    
    console.log(`🎯 Dados para display: NH Arco=${calculo.nhArco}, Base=${calculo.base}, Atual=${calculo.atual}, Níveis=${calculo.niveis}, Pontos=${calculo.pontos}`);
    
    // Criar ou atualizar card
    let card = document.getElementById('tecnica-arquearia-montada');
    if (!card) {
        card = document.createElement('div');
        card.id = 'tecnica-arquearia-montada';
        card.style.cssText = 'margin-bottom: 15px;';
        container.insertBefore(card, container.firstChild);
        console.log("✅ Card criado");
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
                          podeComprar ? 'Disponível para adquirir' : 
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
    
    console.log("✅ Técnica atualizada na tela");
}

// ===== 4. TÉCNICAS APRENDIDAS =====

function atualizarDisplayAprendidas() {
    console.log("🔄 Atualizando display de aprendidas...");
    
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) {
        console.log("❌ Container 'tecnicas-aprendidas' não encontrado");
        return;
    }
    
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
        console.log("✅ Nenhuma técnica aprendida (display limpo)");
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
            <!-- BOTÃO X DE EXCLUSÃO -->
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
    
    console.log(`✅ ${estadoTecnicas.aprendidas.length} técnica(s) aprendida(s) exibida(s)`);
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

// ===== 6. MODAL DE AQUISIÇÃO - VERSÃO FINAL 100% CORRETA =====

function abrirModalTecnica() {
    console.log("📱 Abrindo modal (VERSÃO FINAL 100% CORRETA)...");
    
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
    
    // CORREÇÃO FINAL: SEMPRE começar com mínimo 2 pontos para técnica difícil
    // Se não tem a técnica, começa com 2 pontos (mínimo)
    // Se já tem, mantém os pontos atuais (mas nunca menos que 2)
    let pontosSelecionados = pontosAtuais;
    if (pontosAtuais === 0) {
        pontosSelecionados = 2; // MÍNIMO ABSOLUTO: 2 PONTOS PARA TÉCNICA DIFÍCIL
    }
    
    const maxNiveis = nhArco - base;
    const maxPontos = calcularPontosParaNiveis(maxNiveis);
    
    console.log(`📊 Modal: NH=${nhArco}, Base=${base}, PontosAtuais=${pontosAtuais}, PontosSelecionados=${pontosSelecionados}, MaxNíveis=${maxNiveis}, MaxPontos=${maxPontos}`);
    
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
        
        // Determinar texto do botão principal
        const temTecnica = pontosAtuais > 0;
        let textoBotaoPrincipal = "Adquirir"; // Padrão
        
        if (temTecnica) {
            if (diferenca > 0) {
                textoBotaoPrincipal = "Evoluir";
            } else if (diferenca < 0) {
                textoBotaoPrincipal = "Reduzir";
            } else {
                textoBotaoPrincipal = "Fechar";
            }
        }
        
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
                <!-- INFORMAÇÕES -->
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
                
                <!-- CONTROLE INCREMENTAL 100% CORRETO -->
                <div style="text-align: center; margin: 20px 0; padding: 20px; background: rgba(0, 0, 0, 0.2); border-radius: 8px;">
                    <div style="color: #95a5a6; font-size: 14px;">Pontos de Técnica</div>
                    <div style="color: #ffd700; font-size: 42px; font-weight: bold; margin: 10px 0;">${pontosSelecionados}</div>
                    
                    <div style="display: flex; justify-content: center; gap: 15px; margin: 20px 0;">
                        <button onclick="mudarPontosTecnica(-1)" ${pontosSelecionados <= 2 ? 'disabled' : ''}
                                style="
                                    padding: 12px 24px;
                                    background: ${pontosSelecionados <= 2 ? '#7f8c8d' : '#e74c3c'};
                                    color: white;
                                    border: none;
                                    border-radius: 6px;
                                    cursor: ${pontosSelecionados <= 2 ? 'not-allowed' : 'pointer'};
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
                    <div style="color: #2ecc71; font-size: 14px; margin-top: 5px;">
                        +${niveisSelecionados} nível(s) acima da base
                    </div>
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
                <button onclick="adquirirTecnica(${pontosSelecionados})" 
                        style="
                            flex: 1;
                            padding: 12px;
                            background: ${diferenca === 0 ? '#95a5a6' : '#9b59b6'};
                            color: white;
                            border: none;
                            border-radius: 5px;
                            font-weight: bold;
                            cursor: pointer;
                            font-size: 16px;
                        ">
                    ${textoBotaoPrincipal}
                </button>
            </div>
        `;
    }
    
    // Funções globais do modal
    window.fecharModalTecnica = () => {
        modalOverlay.style.display = 'none';
        console.log("📱 Modal fechado");
    };
    
    window.mudarPontosTecnica = (mudanca) => {
        const novo = pontosSelecionados + mudanca;
        
        // REGRAS FINAIS:
        // 1. MÍNIMO: 2 pontos (NUNCA menos que 2 para técnica difícil)
        // 2. MÁXIMO: maxPontos (depende do NH do Arco)
        
        if (novo >= 2 && novo <= maxPontos) {
            pontosSelecionados = novo;
            atualizarModal();
            console.log(`📊 Pontos alterados: ${pontosSelecionados} → Níveis: ${calcularNiveisParaPontos(pontosSelecionados)}`);
        } else {
            console.log(`❌ Tentativa inválida: ${novo} pontos (deve estar entre 2 e ${maxPontos})`);
        }
    };
    
    window.adquirirTecnica = (pontos) => {
        if (pontos === pontosAtuais) {
            fecharModalTecnica();
            return;
        }
        
        const niveis = calcularNiveisParaPontos(pontos);
        const nhFinal = base + niveis;
        const diferenca = pontos - pontosAtuais;
        
        const temTecnica = pontosAtuais > 0;
        let acao = "adquirir";
        let mensagem = "";
        
        if (temTecnica) {
            if (diferenca > 0) {
                acao = "evoluir";
                mensagem = `Evoluir ${Math.abs(diferenca)} ponto(s)?\n\n`;
            } else {
                acao = "reduzir";
                mensagem = `Reduzir ${Math.abs(diferenca)} ponto(s)?\n\n`;
            }
            
            const niveisAnteriores = calcularNiveisParaPontos(pontosAtuais);
            const nhAnterior = base + niveisAnteriores;
            
            mensagem += `Níveis: +${niveis} (era +${niveisAnteriores})\n`;
            mensagem += `NH: ${nhFinal} (era ${nhAnterior})\n`;
            mensagem += `Total: ${pontos} pontos`;
        } else {
            mensagem = `Adquirir técnica por ${pontos} pontos?\n\n`;
            mensagem += `Níveis: +${niveis}\n`;
            mensagem += `NH: ${nhFinal}\n`;
            mensagem += `Total: ${pontos} pontos`;
        }
        
        if (confirm(mensagem)) {
            const index = estadoTecnicas.aprendidas.findIndex(t => t.id === 'arquearia-montada');
            
            if (pontos === 0 && index >= 0) {
                // Remover se zerou os pontos (não deve acontecer porque mínimo é 2)
                estadoTecnicas.aprendidas.splice(index, 1);
            } else if (index >= 0) {
                // Atualizar existente
                estadoTecnicas.aprendidas[index] = {
                    id: 'arquearia-montada',
                    nome: 'Arquearia Montada',
                    custoTotal: pontos,
                    dificuldade: 'Difícil'
                };
            } else if (pontos > 0) {
                // Adicionar nova
                estadoTecnicas.aprendidas.push({
                    id: 'arquearia-montada',
                    nome: 'Arquearia Montada',
                    custoTotal: pontos,
                    dificuldade: 'Difícil'
                });
            }
            
            localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.aprendidas));
            
            atualizarTodasTecnicas();
            
            alert(`✅ Técnica ${acao}da!\nNíveis: +${niveis}\nNH: ${nhFinal}`);
            fecharModalTecnica();
        }
    };
    
    // Mostrar modal
    atualizarModal();
    modalOverlay.style.display = 'flex';
    console.log("📱 Modal aberto (versão final 100% correta)");
}

// ===== 7. ATUALIZAR TUDO =====

function atualizarTodasTecnicas() {
    console.log("🔄 Atualizando todas as técnicas...");
    atualizarTecnicaNaTela();
    atualizarDisplayAprendidas();
}

// ===== 8. INICIALIZAÇÃO =====

function inicializarSistemaTecnicas() {
    console.log("🚀 Inicializando sistema de técnicas...");
    
    // Carregar técnicas salvas
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.aprendidas = JSON.parse(salvo);
            console.log(`📂 ${estadoTecnicas.aprendidas.length} técnica(s) carregada(s) do localStorage`);
        }
    } catch (e) {
        console.error("❌ Erro ao carregar técnicas:", e);
    }
    
    // Aguardar página carregar e atualizar
    setTimeout(() => {
        console.log("⏳ Atualizando interface...");
        atualizarTodasTecnicas();
        
        // Atualizar periodicamente (caso mude o Arco)
        setInterval(() => {
            atualizarTodasTecnicas();
        }, 5000);
    }, 1500);
}

// ===== 9. CARREGAMENTO =====

document.addEventListener('DOMContentLoaded', () => {
    console.log("📄 DOM carregado, iniciando sistema...");
    setTimeout(inicializarSistemaTecnicas, 1000);
});

// ===== 10. FUNÇÕES GLOBAIS =====

window.abrirModalTecnica = abrirModalTecnica;
window.excluirTecnica = excluirTecnica;
window.atualizarTodasTecnicas = atualizarTodasTecnicas;

// Função de teste pública
window.testarCalculo = () => {
    console.log("=== TESTE DE CÁLCULO 100% CORRETO ===");
    const nh = obterNHArcoReal();
    const calculo = calcularTecnica();
    console.log("📊 RESULTADOS CORRETOS:");
    console.log("- NH Arco:", nh);
    console.log("- Base (Arco-4):", calculo.base);
    console.log("- Pontos atuais:", calculo.pontos);
    console.log("- Níveis:", calculo.niveis);
    console.log("- NH atual:", calculo.atual);
    console.log("- Máximo (Arco):", calculo.max);
    
    // Testar conversões
    console.log("\n🧪 TESTE DE CONVERSÕES (TÉCNICA DIFÍCIL):");
    console.log("0 pontos → Níveis:", calcularNiveisParaPontos(0));
    console.log("1 ponto → Níveis:", calcularNiveisParaPontos(1));
    console.log("2 pontos → Níveis:", calcularNiveisParaPontos(2));
    console.log("3 pontos → Níveis:", calcularNiveisParaPontos(3));
    console.log("4 pontos → Níveis:", calcularNiveisParaPontos(4));
    console.log("5 pontos → Níveis:", calcularNiveisParaPontos(5));
    
    console.log("\n🧪 TESTE DE CONVERSÕES INVERSAS:");
    console.log("0 níveis → Pontos:", calcularPontosParaNiveis(0));
    console.log("1 nível → Pontos:", calcularPontosParaNiveis(1));
    console.log("2 níveis → Pontos:", calcularPontosParaNiveis(2));
    console.log("3 níveis → Pontos:", calcularPontosParaNiveis(3));
    console.log("4 níveis → Pontos:", calcularPontosParaNiveis(4));
    console.log("=== FIM TESTE ===");
};

console.log("✅ TECNICAS.JS - VERSÃO FINAL 100% CORRETA PRONTA!");
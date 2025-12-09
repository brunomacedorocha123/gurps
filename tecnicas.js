// ===== SISTEMA DE TÉCNICAS - VERSÃO FINAL CORRETA =====
console.log("🎯 SISTEMA DE TÉCNICAS - CARREGADO");

// ===== 1. ESTADO DO SISTEMA =====
const estadoTecnicas = {
    aprendidas: [],        // Técnicas compradas
    pontosTotal: 0         // Pontos gastos
};

// ===== 2. FUNÇÕES PRINCIPAIS =====

// 2.1 Obter NH do Arco CORRETAMENTE
function obterNHArcoReal() {
    // Procurar ESPECIFICAMENTE na lista de perícias aprendidas
    const aprendidasContainer = document.getElementById('pericias-aprendidas');
    if (!aprendidasContainer) return 10; // Default
    
    // Procurar elemento da perícia Arco
    const elementosArco = aprendidasContainer.querySelectorAll('.pericia-aprendida-item, [class*="pericia"]');
    
    for (let elemento of elementosArco) {
        const texto = elemento.textContent || '';
        if (texto.includes('Arco') && !texto.includes('Montada')) {
            // Procurar "NH" seguido de número
            const match = texto.match(/NH\s*(\d+)/i);
            if (match && match[1]) {
                const nh = parseInt(match[1]);
                return nh; // Retorna o NH encontrado (ex: 13)
            }
        }
    }
    
    return 10; // Default se não encontrar
}

// 2.2 Verificar se tem Cavalgar (simplificado)
function verificarTemCavalgar() {
    const aprendidasContainer = document.getElementById('pericias-aprendidas');
    if (!aprendidasContainer) return false;
    
    const elementos = aprendidasContainer.querySelectorAll('.pericia-aprendida-item');
    for (let elemento of elementos) {
        const texto = (elemento.textContent || '').toLowerCase();
        if (texto.includes('cavalgar')) {
            return true;
        }
    }
    
    return false;
}

// 2.3 Calcular técnica CORRETAMENTE
function calcularTecnica() {
    const nhArco = obterNHArcoReal(); // Ex: 13
    const base = nhArco - 4;          // Ex: 13 - 4 = 9
    
    // Verificar técnica aprendida
    const aprendida = estadoTecnicas.aprendidas.find(t => t.id === 'arquearia-montada');
    
    if (!aprendida) {
        return {
            base: base,
            atual: base,
            niveis: 0,
            pontos: 0,
            max: nhArco,
            podeComprar: true
        };
    }
    
    // Cálculo GURPS: cada 2 pontos = +1 nível
    const pontos = aprendida.custoTotal || 0;
    const niveis = Math.floor(pontos / 2); // 2 pontos = 1 nível
    const atual = base + niveis;           // Ex: 9 + 1 = 10
    
    return {
        base: base,
        atual: atual,
        niveis: niveis,
        pontos: pontos,
        max: nhArco,
        podeComprar: true
    };
}

// ===== 3. INTERFACE DA TÉCNICA =====

function atualizarTecnicaNaTela() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        setTimeout(atualizarTecnicaNaTela, 500);
        return;
    }
    
    const calculo = calcularTecnica();
    const aprendida = estadoTecnicas.aprendidas.find(t => t.id === 'arquearia-montada');
    
    // Criar ou atualizar card
    let card = document.getElementById('tecnica-arquearia-montada');
    if (!card) {
        card = document.createElement('div');
        card.id = 'tecnica-arquearia-montada';
        container.insertBefore(card, container.firstChild);
    }
    
    // HTML da técnica (SEM botão X aqui)
    card.innerHTML = `
        <div class="pericia-item" style="background: rgba(50, 50, 65, 0.95); border: 2px solid ${aprendida ? '#9b59b6' : '#27ae60'}; border-radius: 12px; padding: 20px; margin-bottom: 15px; cursor: pointer;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div>
                    <h3 style="color: #ffd700; margin: 0 0 5px 0; font-size: 18px;">
                        🏹 Arquearia Montada
                        ${aprendida ? '✅' : '▶'}
                    </h3>
                    <div style="font-size: 12px; color: #95a5a6;">
                        ● Difícil ● Técnica Especial ● Arco-4
                    </div>
                </div>
                <div style="background: ${aprendida ? '#9b59b6' : '#27ae60'}; color: white; padding: 6px 12px; border-radius: 15px; font-size: 14px; font-weight: bold;">
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
                <div style="background: ${aprendida ? 'rgba(155, 89, 182, 0.1)' : 'rgba(39, 174, 96, 0.1)'}; padding: 10px; border-radius: 6px; border-left: 3px solid ${aprendida ? '#9b59b6' : '#27ae60'};">
                    <div style="color: ${aprendida ? '#9b59b6' : '#27ae60'}; font-size: 13px;">
                        <i class="fas fa-${aprendida ? 'check-circle' : 'shopping-cart'}"></i>
                        ${aprendida ? `Aprendida (${calculo.pontos} pontos)` : 'Disponível para compra'}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Evento de clique
    card.onclick = abrirModalTecnica;
}

// ===== 4. TÉCNICAS APRENDIDAS (COM BOTÃO X) =====

function atualizarDisplayAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (estadoTecnicas.aprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia-aprendida">
                <i class="fas fa-tools"></i>
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
        
        // HTML COM BOTÃO X
        item.innerHTML = `
            <!-- BOTÃO X DE EXCLUSÃO -->
            <button class="btn-excluir-tecnica" 
                    onclick="event.stopPropagation(); excluirTecnica('${tecnica.id}');"
                    style="position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; border-radius: 50%; background: #e74c3c; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; z-index: 10;">
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
                +${calculo.niveis} nível(s) acima da base
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

// ===== 6. MODAL DE COMPRA =====

function abrirModalTecnica() {
    const calculo = calcularTecnica();
    const nhArco = calculo.max;
    const base = calculo.base;
    
    const aprendida = estadoTecnicas.aprendidas.find(t => t.id === 'arquearia-montada');
    const pontosAtuais = aprendida ? aprendida.custoTotal || 0 : 0;
    
    let pontosSelecionados = pontosAtuais;
    const maxNiveis = nhArco - base;
    const maxPontos = maxNiveis * 2;
    
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
                    <div style="text-align: center;">
                        <div style="color: #95a5a6;">Seu Arco</div>
                        <div style="color: #3498db; font-size: 28px; font-weight: bold;">${nhArco}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="color: #95a5a6;">Base (Arco-4)</div>
                        <div style="color: #2ecc71; font-size: 28px; font-weight: bold;">${base}</div>
                    </div>
                </div>
                
                <!-- CONTROLE -->
                <div style="text-align: center; margin: 20px 0;">
                    <div style="color: #ffd700; font-size: 16px;">
                        Pontos: <span style="font-size: 32px;">${pontosSelecionados}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: center; gap: 15px; margin: 15px 0;">
                        <button onclick="mudarPontos(-2)" ${pontosSelecionados <= 0 ? 'disabled style="opacity:0.5"' : ''}
                                style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            -2 pts
                        </button>
                        <button onclick="mudarPontos(2)" ${pontosSelecionados >= maxPontos ? 'disabled style="opacity:0.5"' : ''}
                                style="padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            +2 pts
                        </button>
                    </div>
                    
                    <div style="color: #95a5a6;">
                        Níveis: <strong style="color: #ffd700;">${niveisSelecionados}</strong>
                        | NH: <strong style="color: #2ecc71;">${nhAtual}</strong>
                    </div>
                </div>
                
                <!-- CUSTO -->
                <div style="background: rgba(155, 89, 182, 0.2); padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <div style="color: #9b59b6;">Custo Total</div>
                    <div style="color: white; font-size: 32px; font-weight: bold;">${pontosSelecionados} pontos</div>
                </div>
            </div>
            
            <div class="modal-footer" style="display: flex; gap: 10px; padding: 20px;">
                <button onclick="fecharModalTecnica()" 
                        style="flex: 1; padding: 12px; background: #7f8c8d; color: white; border: none; border-radius: 5px;">
                    Cancelar
                </button>
                <button onclick="comprarTecnica(${pontosSelecionados})" 
                        style="flex: 1; padding: 12px; background: ${pontosSelecionados === pontosAtuais ? '#95a5a6' : '#9b59b6'}; color: white; border: none; border-radius: 5px; font-weight: bold;">
                    ${pontosSelecionados === pontosAtuais ? 'Fechar' : pontosSelecionados > pontosAtuais ? 'Comprar' : 'Reduzir'}
                </button>
            </div>
        `;
    }
    
    // Funções globais do modal
    window.fecharModalTecnica = () => modalOverlay.style.display = 'none';
    
    window.mudarPontos = (mudanca) => {
        const novo = pontosSelecionados + mudanca;
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
        
        const niveis = Math.floor(pontos / 2);
        const nhFinal = base + niveis;
        
        if (confirm(`Confirmar compra?\n\nNH: ${nhFinal}\nPontos: ${pontos}`)) {
            const index = estadoTecnicas.aprendidas.findIndex(t => t.id === 'arquearia-montada');
            
            if (index >= 0) {
                estadoTecnicas.aprendidas[index] = {
                    id: 'arquearia-montada',
                    nome: 'Arquearia Montada',
                    custoTotal: pontos,
                    dificuldade: 'Difícil'
                };
            } else {
                estadoTecnicas.aprendidas.push({
                    id: 'arquearia-montada',
                    nome: 'Arquearia Montada',
                    custoTotal: pontos,
                    dificuldade: 'Difícil'
                });
            }
            
            localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.aprendidas));
            
            atualizarTecnicaNaTela();
            atualizarDisplayAprendidas();
            
            alert(`✅ Técnica comprada!\nNH: ${nhFinal}`);
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
    console.log("🚀 Inicializando técnicas...");
    
    // Carregar técnicas salvas
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.aprendidas = JSON.parse(salvo);
        }
    } catch (e) {}
    
    // Primeira atualização
    setTimeout(() => {
        atualizarTodasTecnicas();
    }, 1000);
}

// ===== 9. CARREGAMENTO =====

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(inicializarSistemaTecnicas, 1500);
});

// ===== 10. FUNÇÕES GLOBAIS =====

window.abrirModalTecnica = abrirModalTecnica;
window.excluirTecnica = excluirTecnica;

// Função de teste
window.testarCalculo = () => {
    const nh = obterNHArcoReal();
    const calculo = calcularTecnica();
    console.log("NH Arco:", nh);
    console.log("Base:", calculo.base);
    console.log("Pontos:", calculo.pontos);
    console.log("NH atual:", calculo.atual);
    console.log("Máximo:", calculo.max);
};

console.log("✅ TECNICAS.JS - VERSÃO CORRIGIDA CARREGADA!");
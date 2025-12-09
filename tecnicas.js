// ===== SISTEMA DE TÉCNICAS - CÁLCULO CORRETO =====
console.log("🎯 SISTEMA DE TÉCNICAS - CÁLCULO 100% CORRETO");

const estadoTecnicas = {
    aprendidas: [],
    pontosTotal: 0
};

// ===== FUNÇÕES CORRETAS =====

// 1. Obter NH do Arco
function obterNHArco() {
    let nh = 10;
    
    // Procurar no localStorage
    try {
        const salvo = localStorage.getItem('periciasAprendidas');
        if (salvo) {
            const pericias = JSON.parse(salvo);
            const arco = pericias.find(p => p.id === 'arco');
            if (arco?.nh) nh = arco.nh;
        }
    } catch (e) {}
    
    return nh;
}

// 2. Calcular técnica CORRETAMENTE
function calcularTecnica() {
    const nhArco = obterNHArco(); // Ex: 13
    const base = nhArco - 4;      // Ex: 13 - 4 = 9
    
    // Procurar técnica aprendida
    const aprendida = estadoTecnicas.aprendidas.find(t => t.id === 'arquearia-montada');
    
    if (!aprendida) {
        return {
            base: base,
            atual: base,
            niveis: 0,
            pontos: 0,
            max: nhArco
        };
    }
    
    // SEU SISTEMA: 2 pontos = +1 nível
    const pontos = aprendida.custoTotal || 0;
    const niveis = Math.floor(pontos / 2); // 2 pontos = 1 nível
    const atual = base + niveis;           // 9 + 1 = 10
    
    return {
        base: base,
        atual: atual,
        niveis: niveis,
        pontos: pontos,
        max: nhArco
    };
}

// 3. Atualizar display da técnica
function atualizarDisplayTecnica() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
    const calculo = calcularTecnica();
    const aprendida = estadoTecnicas.aprendidas.find(t => t.id === 'arquearia-montada');
    
    // Card SEM botão X (disponível)
    let card = document.getElementById('tecnica-disponivel');
    if (!card) {
        card = document.createElement('div');
        card.id = 'tecnica-disponivel';
        container.insertBefore(card, container.firstChild);
    }
    
    card.innerHTML = `
        <div class="pericia-item" style="background: rgba(50, 50, 65, 0.95); border: 2px solid ${aprendida ? '#9b59b6' : '#27ae60'}; border-radius: 12px; padding: 20px; margin-bottom: 15px; cursor: pointer;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div>
                    <h3 style="color: #ffd700; margin: 0 0 5px 0; font-size: 18px;">
                        🏹 Arquearia Montada
                        ${aprendida ? '✅' : '▶'}
                    </h3>
                    <div style="font-size: 12px; color: #95a5a6;">
                        ● Difícil ● Técnica Especial
                    </div>
                </div>
                <div style="background: ${aprendida ? '#9b59b6' : '#27ae60'}; color: white; padding: 6px 12px; border-radius: 15px; font-size: 14px; font-weight: bold;">
                    NH ${calculo.atual}
                    ${calculo.niveis > 0 ? ` (+${calculo.niveis})` : ''}
                </div>
            </div>
            
            <p style="color: #ccc; margin: 10px 0; line-height: 1.5; font-size: 14px;">
                Usar arco enquanto cavalga.
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
    
    card.onclick = abrirModalCorreto;
}

// 4. Atualizar display das aprendidas (COM BOTÃO X)
function atualizarAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    container.innerHTML = '';
    
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
        item.onclick = abrirModalCorreto;
        
        // AQUI TEM BOTÃO X
        item.innerHTML = `
            <button onclick="excluirTecnicaCorreta('${tecnica.id}')" 
                    style="position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; border-radius: 50%; background: #e74c3c; color: white; border: none; cursor: pointer; font-size: 20px; font-weight: bold;">
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
                        ${calculo.pontos} pts
                    </div>
                </div>
            </div>
            
            <div style="color: #95a5a6; font-size: 12px;">
                ${calculo.niveis} nível(s) acima da base
            </div>
        `;
        
        container.appendChild(item);
    });
}

// 5. Modal correto
function abrirModalCorreto() {
    const nhArco = obterNHArco(); // Ex: 13
    const base = nhArco - 4;      // Ex: 9
    
    const aprendida = estadoTecnicas.aprendidas.find(t => t.id === 'arquearia-montada');
    const pontosAtuais = aprendida ? aprendida.custoTotal || 0 : 0;
    const niveisAtuais = Math.floor(pontosAtuais / 2); // 2 pontos = 1 nível
    
    let pontosSelecionados = pontosAtuais;
    
    const modal = document.querySelector('.modal-tecnica-overlay');
    const content = document.querySelector('.modal-tecnica');
    
    if (!modal || !content) return;
    
    function atualizarModal() {
        const niveisSelecionados = Math.floor(pontosSelecionados / 2);
        const nhAtual = base + niveisSelecionados;
        const maxNiveis = nhArco - base; // Máximo de níveis que pode comprar
        const maxPontos = maxNiveis * 2; // Cada nível custa 2 pontos
        
        content.innerHTML = `
            <div class="modal-header">
                <h2>🏹 Arquearia Montada</h2>
                <button onclick="fecharModalCorreto()">×</button>
            </div>
            
            <div class="modal-body">
                <!-- INFO -->
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
                    <div style="color: #ffd700; font-size: 16px; margin-bottom: 10px;">
                        Pontos: ${pontosSelecionados}
                    </div>
                    <div style="display: flex; justify-content: center; gap: 15px; margin: 15px 0;">
                        <button onclick="mudarPontos(-2)" ${pontosSelecionados <= 0 ? 'disabled style="opacity:0.5"' : ''}
                                style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 5px;">
                            -2 pts
                        </button>
                        <button onclick="mudarPontos(2)" ${pontosSelecionados >= maxPontos ? 'disabled style="opacity:0.5"' : ''}
                                style="padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 5px;">
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
                    ${pontosSelecionados !== pontosAtuais ? 
                        `<div style="color: #95a5a6; font-size: 12px; margin-top: 5px;">
                            ${pontosSelecionados > pontosAtuais ? 
                                `+${pontosSelecionados - pontosAtuais} pontos` : 
                                `-${pontosAtuais - pontosSelecionados} pontos`
                            }
                        </div>` : ''
                    }
                </div>
                
                <!-- REGRAS -->
                <div style="background: rgba(52, 152, 219, 0.1); padding: 12px; border-radius: 6px; font-size: 13px; color: #ccc;">
                    <div style="color: #3498db; margin-bottom: 5px;"><i class="fas fa-info-circle"></i> Regras</div>
                    • Cada 2 pontos = +1 nível<br>
                    • Máximo: NH ${nhArco} (${maxNiveis} níveis acima da base)<br>
                    • Custo: 2 pontos para cada +1
                </div>
            </div>
            
            <div class="modal-footer" style="display: flex; gap: 10px;">
                <button onclick="fecharModalCorreto()" 
                        style="flex: 1; padding: 12px; background: #7f8c8d; color: white; border: none; border-radius: 5px;">
                    Cancelar
                </button>
                <button onclick="comprarTecnicaCorreta(${pontosSelecionados})" 
                        style="flex: 1; padding: 12px; background: ${pontosSelecionados === pontosAtuais ? '#95a5a6' : '#9b59b6'}; color: white; border: none; border-radius: 5px;">
                    ${pontosSelecionados === pontosAtuais ? 'Fechar' : pontosSelecionados > pontosAtuais ? 'Comprar' : 'Reduzir'}
                </button>
            </div>
        `;
    }
    
    window.fecharModalCorreto = () => modal.style.display = 'none';
    
    window.mudarPontos = (mudanca) => {
        const novo = pontosSelecionados + mudanca;
        const max = (nhArco - base) * 2; // Pontos máximos
        if (novo >= 0 && novo <= max) {
            pontosSelecionados = novo;
            atualizarModal();
        }
    };
    
    window.comprarTecnicaCorreta = (pontos) => {
        if (pontos === pontosAtuais) {
            fecharModalCorreto();
            return;
        }
        
        const index = estadoTecnicas.aprendidas.findIndex(t => t.id === 'arquearia-montada');
        
        if (index >= 0) {
            // Atualizar existente
            estadoTecnicas.aprendidas[index] = {
                id: 'arquearia-montada',
                nome: 'Arquearia Montada',
                custoTotal: pontos,
                dificuldade: 'Difícil'
            };
        } else {
            // Nova técnica
            estadoTecnicas.aprendidas.push({
                id: 'arquearia-montada',
                nome: 'Arquearia Montada',
                custoTotal: pontos,
                dificuldade: 'Difícil'
            });
        }
        
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.aprendidas));
        
        // Atualizar tudo
        atualizarDisplayTecnica();
        atualizarAprendidas();
        
        // Calcular resultado
        const niveis = Math.floor(pontos / 2);
        const nhFinal = base + niveis;
        
        alert(`✅ Técnica ${pontos > pontosAtuais ? 'comprada' : 'atualizada'}!\n\n` +
              `Pontos: ${pontosAtuais} → ${pontos}\n` +
              `Níveis: +${niveis}\n` +
              `NH: ${base + Math.floor(pontosAtuais/2)} → ${nhFinal}`);
        
        fecharModalCorreto();
    };
    
    atualizarModal();
    modal.style.display = 'flex';
}

// 6. Exclusão correta
function excluirTecnicaCorreta(id) {
    const index = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
    if (index === -1) return;
    
    const tecnica = estadoTecnicas.aprendidas[index];
    const calculo = calcularTecnica();
    
    if (confirm(`Remover "${tecnica.nome}"?\n\n` +
               `NH: ${calculo.atual}\n` +
               `Pontos recuperados: ${calculo.pontos}`)) {
        
        estadoTecnicas.aprendidas.splice(index, 1);
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.aprendidas));
        
        atualizarDisplayTecnica();
        atualizarAprendidas();
        
        alert(`✅ "${tecnica.nome}" removida!\n${calculo.pontos} pontos recuperados.`);
    }
}

// ===== INICIALIZAÇÃO =====
function inicializarCorreto() {
    console.log("🚀 Iniciando sistema correto...");
    
    // Carregar técnicas
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.aprendidas = JSON.parse(salvo);
            console.log(`${estadoTecnicas.aprendidas.length} técnica(s) carregada(s)`);
        }
    } catch (e) {}
    
    // Atualizar displays
    setTimeout(() => {
        atualizarDisplayTecnica();
        atualizarAprendidas();
    }, 1000);
    
    // Observar mudanças no NH
    let ultimoNH = 0;
    setInterval(() => {
        const nhAtual = obterNHArco();
        if (nhAtual !== ultimoNH) {
            console.log(`🔄 NH mudou: ${ultimoNH} → ${nhAtual}`);
            ultimoNH = nhAtual;
            atualizarDisplayTecnica();
            atualizarAprendidas();
        }
    }, 500);
}

// ===== CARREGAR =====
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(inicializarCorreto, 1500);
});

// ===== GLOBAIS =====
window.abrirModalTecnica = abrirModalCorreto;
window.excluirTecnica = excluirTecnicaCorreta;

// Debug
window.mostrarCalculo = () => {
    const calc = calcularTecnica();
    console.log("=== CÁLCULO ===");
    console.log("NH Arco:", obterNHArco());
    console.log("Base (Arco-4):", calc.base);
    console.log("Pontos gastos:", calc.pontos);
    console.log("Níveis:", calc.niveis);
    console.log("NH Atual:", calc.atual);
    console.log("Máximo:", calc.max);
};

console.log("✅ Sistema com cálculo CORRETO carregado!");
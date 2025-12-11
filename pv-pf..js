// pv-pf.js - VERSÃO CORRETA COM REGRAS GURPS

// Estado GLOBAL
window.estadoPVPF = {
    pv: { 
        atual: 0,      // Pode ser negativo
        maximo: 0,     // PV máximo positivo (ST + bônus)
        stBase: 0      // ST base
    },
    pf: {
        atual: 0,
        maximo: 0,
        htBase: 0
    }
};

// ==================== REGRAS GURPS ====================
// PV pode ser NEGATIVO:
// 0 a -ST: Ferido (amarelo)
// -ST a -2×ST: Muito Ferido (laranja)
// -2×ST a -3×ST: Crítico (vermelho)
// -3×ST a -4×ST: Morrendo (roxo)
// -4×ST a -5×ST: Morto (preto)
// ======================================================

// 1. PEGAR ATRIBUTOS REAIS
function pegarAtributosReais() {
    if (window.obterDadosAtributos) {
        try {
            const dados = window.obterDadosAtributos();
            
            // PV = ST + bônus (sempre POSITIVO)
            window.estadoPVPF.pv.maximo = dados.PV || 10;
            window.estadoPVPF.pv.stBase = dados.ST || 10;
            window.estadoPVPF.pv.atual = dados.PV || 10;
            
            // PF = HT + bônus
            window.estadoPVPF.pf.maximo = dados.PF || 10;
            window.estadoPVPF.pf.htBase = dados.HT || 10;
            window.estadoPVPF.pf.atual = dados.PF || 10;
            
        } catch (e) {
            console.error("Erro:", e);
        }
    }
}

// 2. FUNÇÃO para mudar PV (COM REGRAS GURPS)
window.alterarPV = function(valor) {
    // Adiciona o valor (pode ser positivo ou negativo)
    window.estadoPVPF.pv.atual += valor;
    
    // Morte: se PV ≤ -5×ST
    if (window.estadoPVPF.pv.atual <= -(window.estadoPVPF.pv.stBase * 5)) {
        window.estadoPVPF.pv.atual = -(window.estadoPVPF.pv.stBase * 5);
        console.log("💀 PERSONAGEM MORTO!");
    }
    
    // Atualizar TELA
    atualizarDisplayPV();
};

// 3. FUNÇÃO para mudar PF
window.alterarPF = function(valor) {
    window.estadoPVPF.pf.atual += valor;
    
    // Limites básicos
    if (window.estadoPVPF.pf.atual < 0) {
        window.estadoPVPF.pf.atual = 0;
    }
    if (window.estadoPVPF.pf.atual > window.estadoPVPF.pf.maximo * 2) {
        window.estadoPVPF.pf.atual = window.estadoPVPF.pf.maximo * 2;
    }
    
    atualizarDisplayPF();
};

// 4. DETERMINAR ESTADO DO PV (CORES)
function determinarEstadoPV() {
    const pv = window.estadoPVPF.pv.atual;
    const st = window.estadoPVPF.pv.stBase;
    
    // Positivo: Verde
    if (pv > 0) return { cor: '#27ae60', nome: 'Saudável' };
    
    // 0 a -ST: Amarelo (Ferido)
    if (pv >= -st) return { cor: '#f1c40f', nome: 'Ferido' };
    
    // -ST a -2×ST: Laranja (Muito Ferido)
    if (pv >= -(st * 2)) return { cor: '#e67e22', nome: 'Muito Ferido' };
    
    // -2×ST a -3×ST: Vermelho (Crítico)
    if (pv >= -(st * 3)) return { cor: '#e74c3c', nome: 'Crítico' };
    
    // -3×ST a -4×ST: Roxo (Morrendo)
    if (pv >= -(st * 4)) return { cor: '#9b59b6', nome: 'Morrendo' };
    
    // -4×ST a -5×ST: Preto (Morto)
    return { cor: '#2c3e50', nome: 'Morto' };
}

// 5. ATUALIZAR DISPLAY PV
function atualizarDisplayPV() {
    const estado = determinarEstadoPV();
    const pv = window.estadoPVPF.pv.atual;
    const max = window.estadoPVPF.pv.maximo;
    const st = window.estadoPVPF.pv.stBase;
    
    // Calcular porcentagem para barra (sempre mostramos de 100% a -500%)
    const porcentagemPositiva = (pv / max) * 100;
    const porcentagemNegativa = (pv / -(st * 5)) * 100;
    
    // Elementos para atualizar
    const elementos = [
        { id: 'pvAtualValue', value: pv },
        { id: 'pvMaxValue', value: max },
        { id: 'pvBase', value: st },
        { id: 'pvText', value: pv + '/' + max },
        { id: 'pvAtualInput', value: pv },
        { id: 'pvMaxInput', value: max },
        { id: 'pvModificador', value: max - st }
    ];
    
    // Atualizar todos elementos
    elementos.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) {
            if (el.tagName === 'INPUT') {
                el.value = item.value;
            } else {
                el.textContent = item.value;
            }
        }
    });
    
    // Atualizar barra com COR CORRETA
    const barra = document.getElementById('pvFill');
    if (barra) {
        // Para valores positivos: 0% a 100%
        // Para valores negativos: 0% a -500% (ajustado para caber na barra)
        let largura;
        if (pv >= 0) {
            largura = (pv / max) * 100;
        } else {
            // Mostrar negativo como redução da barra
            largura = Math.max(0, 100 + ((pv / (st * 5)) * 100));
        }
        
        barra.style.width = largura + '%';
        barra.style.background = estado.cor;
        
        // Adicionar texto de estado se existir
        const estadoEl = document.getElementById('pvEstadoTexto');
        if (estadoEl) estadoEl.textContent = estado.nome;
    }
    
    // Atualizar faixas de cores
    atualizarFaixasPV();
}

// 6. ATUALIZAR FAIXAS DE CORES (marcadores na barra)
function atualizarFaixasPV() {
    const st = window.estadoPVPF.pv.stBase;
    
    // Marcadores: 0, -ST, -2×ST, -3×ST, -4×ST, -5×ST
    const marcadores = [
        { valor: 0, label: '0' },
        { valor: -st, label: '-ST' },
        { valor: -(st * 2), label: '-2×ST' },
        { valor: -(st * 3), label: '-3×ST' },
        { valor: -(st * 4), label: '-4×ST' },
        { valor: -(st * 5), label: 'Morte' }
    ];
    
    // Atualizar ou criar marcadores
    marcadores.forEach((marcador, index) => {
        let marcadorEl = document.getElementById(`pvMarcador${index}`);
        
        if (!marcadorEl && document.getElementById('pvBar')) {
            marcadorEl = document.createElement('div');
            marcadorEl.id = `pvMarcador${index}`;
            marcadorEl.className = 'pv-marcador';
            marcadorEl.innerHTML = `
                <div class="marcador-valor">${marcador.label}</div>
                <div class="marcador-line"></div>
            `;
            document.getElementById('pvBar').appendChild(marcadorEl);
        }
        
        if (marcadorEl) {
            // Posicionar o marcador (0% a -500% ajustado)
            let posicao;
            if (marcador.valor >= 0) {
                posicao = (marcador.valor / window.estadoPVPF.pv.maximo) * 100;
            } else {
                posicao = 100 + ((marcador.valor / (st * 5)) * 100);
            }
            
            marcadorEl.style.left = posicao + '%';
        }
    });
}

// 7. ATUALIZAR DISPLAY PF
function atualizarDisplayPF() {
    const pf = window.estadoPVPF.pf.atual;
    const max = window.estadoPVPF.pf.maximo;
    
    // Elementos para atualizar
    const elementos = [
        { id: 'pfAtualValue', value: pf },
        { id: 'pfMaxValue', value: max },
        { id: 'pfBase', value: window.estadoPVPF.pf.htBase },
        { id: 'pfText', value: pf + '/' + max },
        { id: 'pfAtualInput', value: pf },
        { id: 'pfMaxInput', value: max },
        { id: 'pfModificador', value: max - window.estadoPVPF.pf.htBase }
    ];
    
    // Atualizar todos elementos
    elementos.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) {
            if (el.tagName === 'INPUT') {
                el.value = item.value;
            } else {
                el.textContent = item.value;
            }
        }
    });
    
    // Atualizar barra PF
    const barra = document.getElementById('pfFill');
    if (barra) {
        let porcentagem = (pf / max) * 100;
        if (porcentagem < 0) porcentagem = 0;
        if (porcentagem > 200) porcentagem = 200;
        
        barra.style.width = porcentagem + '%';
        
        // Cor baseada no estado
        if (pf >= max * 0.33) {
            barra.style.background = '#2ecc71'; // Normal
        } else if (pf > 0) {
            barra.style.background = '#f39c12'; // Fadigado
        } else {
            barra.style.background = '#e74c3c'; // Inconsciente
        }
    }
}

// 8. CONFIGURAR BOTÕES
function configurarBotoes() {
    // Botões de dano PV (-5, -2, -1)
    document.querySelectorAll('.btn-dano').forEach(botao => {
        botao.onclick = () => window.alterarPV(-parseInt(botao.getAttribute('data-amount') || 1));
    });
    
    // Botões de cura PV (+1, +2, +5)
    document.querySelectorAll('.btn-cura').forEach(botao => {
        botao.onclick = () => window.alterarPV(parseInt(botao.getAttribute('data-amount') || 1));
    });
    
    // Botões de fadiga PF (-3, -1)
    document.querySelectorAll('.btn-fadiga').forEach(botao => {
        botao.onclick = () => window.alterarPF(-parseInt(botao.getAttribute('data-amount') || 1));
    });
    
    // Botões de descanso PF (+1, +3)
    document.querySelectorAll('.btn-descanso').forEach(botao => {
        botao.onclick = () => window.alterarPF(parseInt(botao.getAttribute('data-amount') || 1));
    });
}

// 9. INICIAR SISTEMA
function iniciarSistema() {
    // 1. Pegar atributos REAIS
    pegarAtributosReais();
    
    // 2. Configurar botões
    configurarBotoes();
    
    // 3. Atualizar display
    atualizarDisplayPV();
    atualizarDisplayPF();
    
    // 4. Escutar mudanças de atributos
    document.addEventListener('atributosAlterados', function(e) {
        if (e.detail) {
            if (e.detail.PV) {
                window.estadoPVPF.pv.maximo = e.detail.PV;
                window.estadoPVPF.pv.atual = e.detail.PV;
            }
            if (e.detail.ST) {
                window.estadoPVPF.pv.stBase = e.detail.ST;
            }
            if (e.detail.PF) {
                window.estadoPVPF.pf.maximo = e.detail.PF;
                window.estadoPVPF.pf.atual = e.detail.PF;
            }
            if (e.detail.HT) {
                window.estadoPVPF.pf.htBase = e.detail.HT;
            }
            
            atualizarDisplayPV();
            atualizarDisplayPF();
        }
    });
    
    console.log("✅ SISTEMA PV/PF INICIADO - REGRAS GURPS");
}

// 10. INICIAR quando aba carregar
document.addEventListener('DOMContentLoaded', function() {
    const combateTab = document.getElementById('combate');
    
    function iniciar() {
        if (document.querySelector('#combate .pv-card')) {
            iniciarSistema();
        } else {
            setTimeout(iniciar, 100);
        }
    }
    
    if (combateTab && combateTab.classList.contains('active')) {
        iniciar();
    }
});

// 11. TESTE
window.testePV = (v) => { window.alterarPV(v); console.log("PV:", window.estadoPVPF.pv.atual); };
window.testePF = (v) => { window.alterarPF(v); console.log("PF:", window.estadoPVPF.pf.atual); };
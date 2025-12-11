// pv-pf.js - SISTEMA DIRETO DE PV E PF

// Estado do personagem
let estadoPersonagem = {
    pv: {
        base: 10,      // ST base
        bonus: 0,      // Bônus de itens/magia
        maximo: 10,    // base + bonus
        atual: 10      // Valor atual
    },
    pf: {
        base: 10,      // HT base
        bonus: 0,      // Bônus de itens/magia
        maximo: 10,    // base + bonus
        atual: 10      // Valor atual
    }
};

// ==================== FUNÇÕES PV ====================

function alterarPV(quantidade) {
    estadoPersonagem.pv.atual += quantidade;
    
    // Limites
    if (estadoPersonagem.pv.atual > estadoPersonagem.pv.maximo) {
        estadoPersonagem.pv.atual = estadoPersonagem.pv.maximo;
    }
    if (estadoPersonagem.pv.atual < -estadoPersonagem.pv.maximo) {
        estadoPersonagem.pv.atual = -estadoPersonagem.pv.maximo;
    }
    
    atualizarDisplayPV();
    salvarEstado();
}

function calcularPVMaximo() {
    estadoPersonagem.pv.maximo = estadoPersonagem.pv.base + estadoPersonagem.pv.bonus;
    if (estadoPersonagem.pv.maximo < 1) estadoPersonagem.pv.maximo = 1;
}

function setPVBase(valor) {
    estadoPersonagem.pv.base = valor;
    calcularPVMaximo();
    atualizarDisplayPV();
}

function setPVBonus(valor) {
    estadoPersonagem.pv.bonus = valor;
    calcularPVMaximo();
    atualizarDisplayPV();
}

function setPVAtual(valor) {
    estadoPersonagem.pv.atual = valor;
    atualizarDisplayPV();
}

function atualizarDisplayPV() {
    // Atualizar números
    const pvBaseEl = document.getElementById('pvBase');
    const pvMaxValueEl = document.getElementById('pvMaxValue');
    const pvAtualValueEl = document.getElementById('pvAtualValue');
    const pvTextEl = document.getElementById('pvText');
    
    if (pvBaseEl) pvBaseEl.textContent = estadoPersonagem.pv.base;
    if (pvMaxValueEl) pvMaxValueEl.textContent = estadoPersonagem.pv.maximo;
    if (pvAtualValueEl) pvAtualValueEl.textContent = estadoPersonagem.pv.atual;
    if (pvTextEl) pvTextEl.textContent = `${estadoPersonagem.pv.atual}/${estadoPersonagem.pv.maximo}`;
    
    // Atualizar barra
    const pvFillEl = document.getElementById('pvFill');
    if (pvFillEl) {
        const porcentagem = (estadoPersonagem.pv.atual / estadoPersonagem.pv.maximo) * 100;
        pvFillEl.style.width = `${Math.max(0, porcentagem)}%`;
        
        // Cor baseada na porcentagem
        if (porcentagem > 80) pvFillEl.style.background = '#27ae60';
        else if (porcentagem > 60) pvFillEl.style.background = '#f1c40f';
        else if (porcentagem > 40) pvFillEl.style.background = '#e67e22';
        else if (porcentagem > 20) pvFillEl.style.background = '#d35400';
        else if (porcentagem > 0) pvFillEl.style.background = '#c0392b';
        else pvFillEl.style.background = '#7f8c8d';
    }
    
    // Atualizar inputs
    const pvBonusInput = document.getElementById('pvBonus');
    const pvMaxInput = document.getElementById('pvMaxInput');
    const pvAtualInput = document.getElementById('pvAtualInput');
    
    if (pvBonusInput) pvBonusInput.value = estadoPersonagem.pv.bonus;
    if (pvMaxInput) pvMaxInput.value = estadoPersonagem.pv.maximo;
    if (pvAtualInput) pvAtualInput.value = estadoPersonagem.pv.atual;
}

// ==================== FUNÇÕES PF ====================

function alterarPF(quantidade) {
    estadoPersonagem.pf.atual += quantidade;
    
    // Limites
    if (estadoPersonagem.pf.atual > estadoPersonagem.pf.maximo) {
        estadoPersonagem.pf.atual = estadoPersonagem.pf.maximo;
    }
    if (estadoPersonagem.pf.atual < -estadoPersonagem.pf.maximo) {
        estadoPersonagem.pf.atual = -estadoPersonagem.pf.maximo;
    }
    
    atualizarDisplayPF();
    salvarEstado();
}

function calcularPFMaximo() {
    estadoPersonagem.pf.maximo = estadoPersonagem.pf.base + estadoPersonagem.pf.bonus;
    if (estadoPersonagem.pf.maximo < 1) estadoPersonagem.pf.maximo = 1;
}

function setPFBase(valor) {
    estadoPersonagem.pf.base = valor;
    calcularPFMaximo();
    atualizarDisplayPF();
}

function setPFBonus(valor) {
    estadoPersonagem.pf.bonus = valor;
    calcularPFMaximo();
    atualizarDisplayPF();
}

function setPFAtual(valor) {
    estadoPersonagem.pf.atual = valor;
    atualizarDisplayPF();
}

function atualizarDisplayPF() {
    // Atualizar números
    const pfBaseEl = document.getElementById('pfBase');
    const pfMaxValueEl = document.getElementById('pfMaxValue');
    const pfAtualValueEl = document.getElementById('pfAtualValue');
    const pfTextEl = document.getElementById('pfText');
    
    if (pfBaseEl) pfBaseEl.textContent = estadoPersonagem.pf.base;
    if (pfMaxValueEl) pfMaxValueEl.textContent = estadoPersonagem.pf.maximo;
    if (pfAtualValueEl) pfAtualValueEl.textContent = estadoPersonagem.pf.atual;
    if (pfTextEl) pfTextEl.textContent = `${estadoPersonagem.pf.atual}/${estadoPersonagem.pf.maximo}`;
    
    // Atualizar barra
    const pfFillEl = document.getElementById('pfFill');
    if (pfFillEl) {
        const porcentagem = (estadoPersonagem.pf.atual / estadoPersonagem.pf.maximo) * 100;
        pfFillEl.style.width = `${Math.max(0, porcentagem)}%`;
        
        // Cor baseada na porcentagem
        if (porcentagem > 33) pfFillEl.style.background = '#2ecc71';
        else if (porcentagem > 0) pfFillEl.style.background = '#f39c12';
        else pfFillEl.style.background = '#e74c3c';
    }
    
    // Atualizar inputs
    const pfBonusInput = document.getElementById('pfBonus');
    const pfMaxInput = document.getElementById('pfMaxInput');
    const pfAtualInput = document.getElementById('pfAtualInput');
    
    if (pfBonusInput) pfBonusInput.value = estadoPersonagem.pf.bonus;
    if (pfMaxInput) pfMaxInput.value = estadoPersonagem.pf.maximo;
    if (pfAtualInput) pfAtualInput.value = estadoPersonagem.pf.atual;
}

// ==================== EVENT LISTENERS ====================

function configurarEventListeners() {
    console.log("Configurando event listeners...");
    
    // Botões de dano PV (-1, -5)
    document.querySelectorAll('.btn-dano').forEach(botao => {
        botao.addEventListener('click', function() {
            const valor = parseInt(this.getAttribute('data-amount')) || 0;
            alterarPV(-valor);
        });
    });
    
    // Botões de cura PV (+1, +5)
    document.querySelectorAll('.btn-cura').forEach(botao => {
        botao.addEventListener('click', function() {
            const valor = parseInt(this.getAttribute('data-amount')) || 0;
            alterarPV(valor);
        });
    });
    
    // Botões de fadiga PF (-1, -3)
    document.querySelectorAll('.btn-fadiga').forEach(botao => {
        botao.addEventListener('click', function() {
            const valor = parseInt(this.getAttribute('data-amount')) || 0;
            alterarPF(-valor);
        });
    });
    
    // Botões de descanso PF (+1, +3)
    document.querySelectorAll('.btn-descanso').forEach(botao => {
        botao.addEventListener('click', function() {
            const valor = parseInt(this.getAttribute('data-amount')) || 0;
            alterarPF(valor);
        });
    });
    
    // Input de bônus PV
    const pvBonusInput = document.getElementById('pvBonus');
    if (pvBonusInput) {
        pvBonusInput.addEventListener('change', function() {
            setPVBonus(parseInt(this.value) || 0);
        });
    }
    
    // Input de bônus PF
    const pfBonusInput = document.getElementById('pfBonus');
    if (pfBonusInput) {
        pfBonusInput.addEventListener('change', function() {
            setPFBonus(parseInt(this.value) || 0);
        });
    }
    
    // Input de máximo PV
    const pvMaxInput = document.getElementById('pvMaxInput');
    if (pvMaxInput) {
        pvMaxInput.addEventListener('change', function() {
            const valor = parseInt(this.value) || 10;
            estadoPersonagem.pv.maximo = Math.max(1, valor);
            atualizarDisplayPV();
            salvarEstado();
        });
    }
    
    // Input de máximo PF
    const pfMaxInput = document.getElementById('pfMaxInput');
    if (pfMaxInput) {
        pfMaxInput.addEventListener('change', function() {
            const valor = parseInt(this.value) || 10;
            estadoPersonagem.pf.maximo = Math.max(1, valor);
            atualizarDisplayPF();
            salvarEstado();
        });
    }
    
    // Input de atual PV
    const pvAtualInput = document.getElementById('pvAtualInput');
    if (pvAtualInput) {
        pvAtualInput.addEventListener('change', function() {
            const valor = parseInt(this.value) || 10;
            setPVAtual(valor);
        });
    }
    
    // Input de atual PF
    const pfAtualInput = document.getElementById('pfAtualInput');
    if (pfAtualInput) {
        pfAtualInput.addEventListener('change', function() {
            const valor = parseInt(this.value) || 10;
            setPFAtual(valor);
        });
    }
    
    // Botões de modificador (+/-)
    document.querySelectorAll('.mod-btn').forEach(botao => {
        botao.addEventListener('click', function() {
            const input = this.closest('.mod-control').querySelector('.mod-input');
            if (!input) return;
            
            let valor = parseInt(input.value) || 0;
            
            if (this.classList.contains('plus')) {
                valor++;
            } else if (this.classList.contains('minus')) {
                valor--;
            }
            
            // Limites
            if (input.id === 'pvBonus') {
                valor = Math.max(-20, Math.min(20, valor));
                input.value = valor;
                setPVBonus(valor);
            } else if (input.id === 'pfBonus') {
                valor = Math.max(-10, Math.min(10, valor));
                input.value = valor;
                setPFBonus(valor);
            }
        });
    });
    
    console.log("Event listeners configurados!");
}

// ==================== INTEGRAÇÃO COM ATRIBUTOS ====================

function receberAtributos(atributos) {
    console.log("Recebendo atributos:", atributos);
    
    if (atributos.ST) {
        setPVBase(atributos.ST);
    }
    
    if (atributos.HT) {
        setPFBase(atributos.HT);
    }
    
    // Se vier PV e PF totais dos atributos
    if (atributos.PV) {
        estadoPersonagem.pv.maximo = atributos.PV;
        estadoPersonagem.pv.bonus = estadoPersonagem.pv.maximo - estadoPersonagem.pv.base;
        atualizarDisplayPV();
    }
    
    if (atributos.PF) {
        estadoPersonagem.pf.maximo = atributos.PF;
        estadoPersonagem.pf.bonus = estadoPersonagem.pf.maximo - estadoPersonagem.pf.base;
        atualizarDisplayPF();
    }
}

// ==================== SALVAR/CARREGAR ====================

function salvarEstado() {
    try {
        localStorage.setItem('gurps_pv_pf', JSON.stringify(estadoPersonagem));
    } catch (e) {
        console.warn("Não foi possível salvar:", e);
    }
}

function carregarEstado() {
    try {
        const salvo = localStorage.getItem('gurps_pv_pf');
        if (salvo) {
            const dados = JSON.parse(salvo);
            
            if (dados.pv) {
                estadoPersonagem.pv = { ...estadoPersonagem.pv, ...dados.pv };
            }
            
            if (dados.pf) {
                estadoPersonagem.pf = { ...estadoPersonagem.pf, ...dados.pf };
            }
            
            console.log("Estado carregado:", estadoPersonagem);
        }
    } catch (e) {
        console.warn("Erro ao carregar:", e);
    }
}

// ==================== INICIALIZAÇÃO ====================

function iniciarSistemaPVPF() {
    console.log("🚀 Iniciando sistema PV/PF...");
    
    // 1. Carregar estado salvo
    carregarEstado();
    
    // 2. Configurar eventos
    configurarEventListeners();
    
    // 3. Atualizar display inicial
    atualizarDisplayPV();
    atualizarDisplayPF();
    
    // 4. Ouvir eventos de atributos
    document.addEventListener('atributosAlterados', function(e) {
        if (e.detail) {
            receberAtributos(e.detail);
        }
    });
    
    console.log("✅ Sistema PV/PF pronto!");
    
    // Testar se os botões estão funcionando
    setTimeout(() => {
        const botoes = document.querySelectorAll('.btn-dano, .btn-cura, .btn-fadiga, .btn-descanso');
        console.log(`Total de botões encontrados: ${botoes.length}`);
    }, 500);
}

// Iniciar quando a aba combate for carregada
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na aba de combate
    const combateTab = document.getElementById('combate');
    
    if (combateTab && combateTab.classList.contains('active')) {
        setTimeout(iniciarSistemaPVPF, 100);
    }
    
    // Observar mudanças de aba
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                if (combateTab.classList.contains('active')) {
                    setTimeout(iniciarSistemaPVPF, 100);
                }
            }
        });
    });
    
    observer.observe(combateTab, { attributes: true });
});

// ==================== EXPORTAR FUNÇÕES ====================

// Para outros scripts usarem
window.PVPF = {
    alterarPV: alterarPV,
    alterarPF: alterarPF,
    getPV: () => estadoPersonagem.pv.atual,
    getPF: () => estadoPersonagem.pf.atual,
    getPVMax: () => estadoPersonagem.pv.maximo,
    getPFMax: () => estadoPersonagem.pf.maximo,
    receberAtributos: receberAtributos
};

// Para testar no console
window.testarPV = function(valor) {
    alterarPV(valor);
    console.log(`PV alterado: ${valor} | Novo: ${estadoPersonagem.pv.atual}/${estadoPersonagem.pv.maximo}`);
};

window.testarPF = function(valor) {
    alterarPF(valor);
    console.log(`PF alterado: ${valor} | Novo: ${estadoPersonagem.pf.atual}/${estadoPersonagem.pf.maximo}`);
};
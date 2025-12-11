// pv-pf.js - SISTEMA COMPLETO DE PV E PF

// Estado do personagem
let estadoPersonagem = {
    pv: {
        base: 10,      // ST base do atributo
        bonus: 0,      // Bônus de itens/magia
        maximo: 10,    // base + bonus
        atual: 10      // Valor atual
    },
    pf: {
        base: 10,      // HT base do atributo
        bonus: 0,      // Bônus de itens/magia
        maximo: 10,    // base + bonus
        atual: 10      // Valor atual
    }
};

// ==================== FUNÇÕES PRINCIPAIS ====================

// Função principal para alterar PV
function alterarPV(quantidade) {
    console.log(`Alterando PV: ${quantidade} (Atual: ${estadoPersonagem.pv.atual})`);
    
    // Adiciona a quantidade
    estadoPersonagem.pv.atual += quantidade;
    
    // Limites
    if (estadoPersonagem.pv.atual > estadoPersonagem.pv.maximo) {
        estadoPersonagem.pv.atual = estadoPersonagem.pv.maximo;
    }
    if (estadoPersonagem.pv.atual < -estadoPersonagem.pv.maximo) {
        estadoPersonagem.pv.atual = -estadoPersonagem.pv.maximo;
    }
    
    // Atualiza a tela
    atualizarDisplayPV();
    salvarEstado();
}

// Função principal para alterar PF
function alterarPF(quantidade) {
    console.log(`Alterando PF: ${quantidade} (Atual: ${estadoPersonagem.pf.atual})`);
    
    // Adiciona a quantidade
    estadoPersonagem.pf.atual += quantidade;
    
    // Limites
    if (estadoPersonagem.pf.atual > estadoPersonagem.pf.maximo) {
        estadoPersonagem.pf.atual = estadoPersonagem.pf.maximo;
    }
    if (estadoPersonagem.pf.atual < -estadoPersonagem.pf.maximo) {
        estadoPersonagem.pf.atual = -estadoPersonagem.pf.maximo;
    }
    
    // Atualiza a tela
    atualizarDisplayPF();
    salvarEstado();
}

// ==================== ATUALIZAR DISPLAY ====================

function atualizarDisplayPV() {
    // Encontrar elementos
    const pvBase = document.getElementById('pvBase');
    const pvMaxValue = document.getElementById('pvMaxValue');
    const pvAtualValue = document.getElementById('pvAtualValue');
    const pvText = document.getElementById('pvText');
    const pvFill = document.getElementById('pvFill');
    
    const pvBonusInput = document.getElementById('pvBonus');
    const pvMaxInput = document.getElementById('pvMaxInput');
    const pvAtualInput = document.getElementById('pvAtualInput');
    
    // Atualizar textos
    if (pvBase) pvBase.textContent = estadoPersonagem.pv.base;
    if (pvMaxValue) pvMaxValue.textContent = estadoPersonagem.pv.maximo;
    if (pvAtualValue) pvAtualValue.textContent = estadoPersonagem.pv.atual;
    if (pvText) pvText.textContent = `${estadoPersonagem.pv.atual}/${estadoPersonagem.pv.maximo}`;
    
    // Atualizar barra
    if (pvFill) {
        const porcentagem = (estadoPersonagem.pv.atual / estadoPersonagem.pv.maximo) * 100;
        const largura = Math.max(0, porcentagem);
        pvFill.style.width = `${largura}%`;
        
        // Mudar cor baseada na porcentagem
        if (porcentagem > 80) {
            pvFill.style.background = '#27ae60';
        } else if (porcentagem > 60) {
            pvFill.style.background = '#f1c40f';
        } else if (porcentagem > 40) {
            pvFill.style.background = '#e67e22';
        } else if (porcentagem > 20) {
            pvFill.style.background = '#d35400';
        } else if (porcentagem > 0) {
            pvFill.style.background = '#c0392b';
        } else {
            pvFill.style.background = '#7f8c8d';
        }
    }
    
    // Atualizar inputs
    if (pvBonusInput) pvBonusInput.value = estadoPersonagem.pv.bonus;
    if (pvMaxInput) pvMaxInput.value = estadoPersonagem.pv.maximo;
    if (pvAtualInput) pvAtualInput.value = estadoPersonagem.pv.atual;
}

function atualizarDisplayPF() {
    // Encontrar elementos
    const pfBase = document.getElementById('pfBase');
    const pfMaxValue = document.getElementById('pfMaxValue');
    const pfAtualValue = document.getElementById('pfAtualValue');
    const pfText = document.getElementById('pfText');
    const pfFill = document.getElementById('pfFill');
    
    const pfBonusInput = document.getElementById('pfBonus');
    const pfMaxInput = document.getElementById('pfMaxInput');
    const pfAtualInput = document.getElementById('pfAtualInput');
    
    // Atualizar textos
    if (pfBase) pfBase.textContent = estadoPersonagem.pf.base;
    if (pfMaxValue) pfMaxValue.textContent = estadoPersonagem.pf.maximo;
    if (pfAtualValue) pfAtualValue.textContent = estadoPersonagem.pf.atual;
    if (pfText) pfText.textContent = `${estadoPersonagem.pf.atual}/${estadoPersonagem.pf.maximo}`;
    
    // Atualizar barra
    if (pfFill) {
        const porcentagem = (estadoPersonagem.pf.atual / estadoPersonagem.pf.maximo) * 100;
        const largura = Math.max(0, porcentagem);
        pfFill.style.width = `${largura}%`;
        
        // Mudar cor baseada na porcentagem
        if (porcentagem > 33) {
            pfFill.style.background = '#2ecc71';
        } else if (porcentagem > 0) {
            pfFill.style.background = '#f39c12';
        } else {
            pfFill.style.background = '#e74c3c';
        }
    }
    
    // Atualizar inputs
    if (pfBonusInput) pfBonusInput.value = estadoPersonagem.pf.bonus;
    if (pfMaxInput) pfMaxInput.value = estadoPersonagem.pf.maximo;
    if (pfAtualInput) pfAtualInput.value = estadoPersonagem.pf.atual;
}

// ==================== CONFIGURAR BOTÕES ====================

function configurarBotoes() {
    console.log('Configurando botões...');
    
    // Botões de dano PV
    const botoesDano = document.querySelectorAll('.btn-dano');
    botoesDano.forEach(botao => {
        botao.addEventListener('click', function() {
            const valor = parseInt(this.getAttribute('data-amount')) || 0;
            console.log(`Botão dano clicado: -${valor} PV`);
            alterarPV(-valor);
        });
    });
    
    // Botões de cura PV
    const botoesCura = document.querySelectorAll('.btn-cura');
    botoesCura.forEach(botao => {
        botao.addEventListener('click', function() {
            const valor = parseInt(this.getAttribute('data-amount')) || 0;
            console.log(`Botão cura clicado: +${valor} PV`);
            alterarPV(valor);
        });
    });
    
    // Botões de fadiga PF
    const botoesFadiga = document.querySelectorAll('.btn-fadiga');
    botoesFadiga.forEach(botao => {
        botao.addEventListener('click', function() {
            const valor = parseInt(this.getAttribute('data-amount')) || 0;
            console.log(`Botão fadiga clicado: -${valor} PF`);
            alterarPF(-valor);
        });
    });
    
    // Botões de descanso PF
    const botoesDescanso = document.querySelectorAll('.btn-descanso');
    botoesDescanso.forEach(botao => {
        botao.addEventListener('click', function() {
            const valor = parseInt(this.getAttribute('data-amount')) || 0;
            console.log(`Botão descanso clicado: +${valor} PF`);
            alterarPF(valor);
        });
    });
    
    // Botões de modificador (+/-)
    const botoesMod = document.querySelectorAll('.mod-btn');
    botoesMod.forEach(botao => {
        botao.addEventListener('click', function() {
            const input = this.closest('.mod-control').querySelector('.mod-input');
            if (!input) return;
            
            let valor = parseInt(input.value) || 0;
            
            if (this.classList.contains('plus')) {
                valor++;
            } else if (this.classList.contains('minus')) {
                valor--;
            }
            
            // Limites diferentes para PV e PF
            if (input.id === 'pvBonus' || input.id === 'pvModificador') {
                valor = Math.max(-20, Math.min(20, valor));
            } else if (input.id === 'pfBonus' || input.id === 'pfModificador') {
                valor = Math.max(-10, Math.min(10, valor));
            }
            
            input.value = valor;
            
            // Atualizar estado
            if (input.id === 'pvBonus' || input.id === 'pvModificador') {
                estadoPersonagem.pv.bonus = valor;
                calcularMaximos();
            } else if (input.id === 'pfBonus' || input.id === 'pfModificador') {
                estadoPersonagem.pf.bonus = valor;
                calcularMaximos();
            }
        });
    });
    
    // Inputs de bônus
    const pvBonusInput = document.getElementById('pvBonus') || document.getElementById('pvModificador');
    if (pvBonusInput) {
        pvBonusInput.addEventListener('change', function() {
            const valor = parseInt(this.value) || 0;
            estadoPersonagem.pv.bonus = valor;
            calcularMaximos();
        });
    }
    
    const pfBonusInput = document.getElementById('pfBonus') || document.getElementById('pfModificador');
    if (pfBonusInput) {
        pfBonusInput.addEventListener('change', function() {
            const valor = parseInt(this.value) || 0;
            estadoPersonagem.pf.bonus = valor;
            calcularMaximos();
        });
    }
    
    // Inputs de máximo
    const pvMaxInput = document.getElementById('pvMaxInput');
    if (pvMaxInput) {
        pvMaxInput.addEventListener('change', function() {
            const valor = parseInt(this.value) || 10;
            estadoPersonagem.pv.maximo = Math.max(1, valor);
            atualizarDisplayPV();
            salvarEstado();
        });
    }
    
    const pfMaxInput = document.getElementById('pfMaxInput');
    if (pfMaxInput) {
        pfMaxInput.addEventListener('change', function() {
            const valor = parseInt(this.value) || 10;
            estadoPersonagem.pf.maximo = Math.max(1, valor);
            atualizarDisplayPF();
            salvarEstado();
        });
    }
    
    // Inputs de atual
    const pvAtualInput = document.getElementById('pvAtualInput');
    if (pvAtualInput) {
        pvAtualInput.addEventListener('change', function() {
            const valor = parseInt(this.value) || 10;
            estadoPersonagem.pv.atual = Math.max(-estadoPersonagem.pv.maximo, Math.min(valor, estadoPersonagem.pv.maximo));
            atualizarDisplayPV();
            salvarEstado();
        });
    }
    
    const pfAtualInput = document.getElementById('pfAtualInput');
    if (pfAtualInput) {
        pfAtualInput.addEventListener('change', function() {
            const valor = parseInt(this.value) || 10;
            estadoPersonagem.pf.atual = Math.max(-estadoPersonagem.pf.maximo, Math.min(valor, estadoPersonagem.pf.maximo));
            atualizarDisplayPF();
            salvarEstado();
        });
    }
    
    console.log('Botões configurados!');
}

// ==================== CALCULAR VALORES ====================

function calcularMaximos() {
    // PV Máximo = ST base + bônus
    estadoPersonagem.pv.maximo = Math.max(1, estadoPersonagem.pv.base + estadoPersonagem.pv.bonus);
    
    // PF Máximo = HT base + bônus
    estadoPersonagem.pf.maximo = Math.max(1, estadoPersonagem.pf.base + estadoPersonagem.pf.bonus);
    
    // Ajustar valores atuais se necessário
    if (estadoPersonagem.pv.atual > estadoPersonagem.pv.maximo) {
        estadoPersonagem.pv.atual = estadoPersonagem.pv.maximo;
    }
    if (estadoPersonagem.pf.atual > estadoPersonagem.pf.maximo) {
        estadoPersonagem.pf.atual = estadoPersonagem.pf.maximo;
    }
    
    atualizarDisplayPV();
    atualizarDisplayPF();
    salvarEstado();
}

// ==================== INTEGRAÇÃO COM ATRIBUTOS ====================

function receberAtributos(atributos) {
    console.log('Recebendo atributos:', atributos);
    
    if (atributos.ST) {
        estadoPersonagem.pv.base = atributos.ST;
        console.log(`ST atualizado para PV: ${atributos.ST}`);
    }
    
    if (atributos.HT) {
        estadoPersonagem.pf.base = atributos.HT;
        console.log(`HT atualizado para PF: ${atributos.HT}`);
    }
    
    // Se o sistema de atributos já calculou PV e PF totais
    if (atributos.PV) {
        estadoPersonagem.pv.maximo = atributos.PV;
        estadoPersonagem.pv.bonus = estadoPersonagem.pv.maximo - estadoPersonagem.pv.base;
        console.log(`PV total recebido: ${atributos.PV}`);
    }
    
    if (atributos.PF) {
        estadoPersonagem.pf.maximo = atributos.PF;
        estadoPersonagem.pf.bonus = estadoPersonagem.pf.maximo - estadoPersonagem.pf.base;
        console.log(`PF total recebido: ${atributos.PF}`);
    }
    
    // Recalcular tudo
    calcularMaximos();
}

// ==================== SALVAR E CARREGAR ====================

function salvarEstado() {
    try {
        localStorage.setItem('gurps_pv_pf', JSON.stringify(estadoPersonagem));
    } catch (e) {
        console.warn('Não foi possível salvar o estado:', e);
    }
}

function carregarEstado() {
    try {
        const salvo = localStorage.getItem('gurps_pv_pf');
        if (salvo) {
            const dados = JSON.parse(salvo);
            
            // Mesclar com estado atual
            if (dados.pv) {
                estadoPersonagem.pv = { ...estadoPersonagem.pv, ...dados.pv };
            }
            
            if (dados.pf) {
                estadoPersonagem.pf = { ...estadoPersonagem.pf, ...dados.pf };
            }
            
            console.log('Estado PV/PF carregado:', estadoPersonagem);
        }
    } catch (e) {
        console.warn('Erro ao carregar estado:', e);
    }
}

// ==================== INICIALIZAÇÃO ====================

function iniciarSistemaPVPF() {
    console.log('🚀 Iniciando sistema PV/PF...');
    
    // 1. Carregar estado salvo
    carregarEstado();
    
    // 2. Configurar botões
    configurarBotoes();
    
    // 3. Atualizar display inicial
    atualizarDisplayPV();
    atualizarDisplayPF();
    
    // 4. Tentar obter atributos do sistema principal
    if (window.obterDadosAtributos) {
        try {
            const atributos = window.obterDadosAtributos();
            if (atributos) {
                receberAtributos(atributos);
            }
        } catch (e) {
            console.warn('Não foi possível obter atributos:', e);
        }
    }
    
    // 5. Escutar eventos de atributos alterados
    document.addEventListener('atributosAlterados', function(e) {
        if (e.detail) {
            receberAtributos(e.detail);
        }
    });
    
    console.log('✅ Sistema PV/PF pronto!');
    
    // Debug: mostrar quantos botões foram encontrados
    const totalBotoes = document.querySelectorAll('.btn-dano, .btn-cura, .btn-fadiga, .btn-descanso').length;
    console.log(`📊 Total de botões encontrados: ${totalBotoes}`);
}

// ==================== INICIALIZAÇÃO AUTOMÁTICA ====================

// Aguardar o DOM estar pronto
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na aba de combate
    const combateTab = document.getElementById('combate');
    
    if (combateTab && combateTab.classList.contains('active')) {
        // Esperar um pouco para garantir que o HTML está carregado
        setTimeout(iniciarSistemaPVPF, 300);
    }
    
    // Observar mudanças de aba
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'combate' && tab.classList.contains('active')) {
                    // Esperar um pouco para garantir que o HTML está carregado
                    setTimeout(iniciarSistemaPVPF, 300);
                }
            }
        });
    });
    
    // Começar a observar a aba de combate
    if (combateTab) {
        observer.observe(combateTab, { attributes: true });
    }
});

// ==================== FUNÇÕES PARA TESTE ====================

// Para testar no console do navegador
window.testePV = function(valor) {
    alterarPV(valor);
    console.log(`PV: ${estadoPersonagem.pv.atual}/${estadoPersonagem.pv.maximo}`);
};

window.testePF = function(valor) {
    alterarPF(valor);
    console.log(`PF: ${estadoPersonagem.pf.atual}/${estadoPersonagem.pf.maximo}`);
};

// ==================== EXPORTAÇÃO ====================

// Exportar funções para outros scripts
window.PVPF = {
    alterarPV: alterarPV,
    alterarPF: alterarPF,
    getPVAtual: () => estadoPersonagem.pv.atual,
    getPFAtual: () => estadoPersonagem.pf.atual,
    getPVMax: () => estadoPersonagem.pv.maximo,
    getPFMax: () => estadoPersonagem.pf.maximo,
    receberAtributos: receberAtributos
};
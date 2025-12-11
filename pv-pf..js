// pv-pf.js - SISTEMA DEFINITIVO DE PV E PF

// Estado do personagem - PEGANDO OS VALORES REAIS
let estado = {
    pv: { atual: 12, maximo: 12 }, // Pegando do atributo (ST: 12, PV: 12)
    pf: { atual: 13, maximo: 13 }  // Pegando do atributo (HT: 13, PF: 13)
};

// ========== FUNÇÕES BÁSICAS QUE FUNCIONAM ==========

// Função para mudar PV
function mudarPV(valor) {
    console.log(`Mudando PV: ${valor} (De: ${estado.pv.atual})`);
    
    estado.pv.atual += valor;
    
    // Limites
    if (estado.pv.atual > estado.pv.maximo) {
        estado.pv.atual = estado.pv.maximo;
    }
    if (estado.pv.atual < 0) {
        estado.pv.atual = 0;
    }
    
    atualizarTelaPV();
    salvarEstado();
}

// Função para mudar PF
function mudarPF(valor) {
    console.log(`Mudando PF: ${valor} (De: ${estado.pf.atual})`);
    
    estado.pf.atual += valor;
    
    // Limites
    if (estado.pf.atual > estado.pf.maximo) {
        estado.pf.atual = estado.pf.maximo;
    }
    if (estado.pf.atual < 0) {
        estado.pf.atual = 0;
    }
    
    atualizarTelaPF();
    salvarEstado();
}

// ========== ATUALIZAR TELA ==========

function atualizarTelaPV() {
    console.log("Atualizando tela PV...");
    
    // 1. Atualizar textos
    const pvBaseEl = document.getElementById('pvBase');
    const pvMaxEl = document.getElementById('pvMaxValue');
    const pvAtualEl = document.getElementById('pvAtualValue');
    const pvTextEl = document.getElementById('pvText');
    
    if (pvBaseEl) pvBaseEl.textContent = estado.pv.maximo; // ST base
    if (pvMaxEl) pvMaxEl.textContent = estado.pv.maximo;
    if (pvAtualEl) pvAtualEl.textContent = estado.pv.atual;
    if (pvTextEl) pvTextEl.textContent = `${estado.pv.atual}/${estado.pv.maximo}`;
    
    // 2. Atualizar barra
    const pvFillEl = document.getElementById('pvFill');
    if (pvFillEl) {
        const porcentagem = (estado.pv.atual / estado.pv.maximo) * 100;
        pvFillEl.style.width = `${porcentagem}%`;
        
        // Cor da barra
        if (porcentagem > 80) pvFillEl.style.background = '#27ae60';
        else if (porcentagem > 60) pvFillEl.style.background = '#f1c40f';
        else if (porcentagem > 40) pvFillEl.style.background = '#e67e22';
        else if (porcentagem > 20) pvFillEl.style.background = '#d35400';
        else if (porcentagem > 0) pvFillEl.style.background = '#c0392b';
        else pvFillEl.style.background = '#7f8c8d';
    }
    
    // 3. Atualizar inputs
    const pvModificadorEl = document.getElementById('pvModificador');
    const pvMaxInputEl = document.getElementById('pvMaxInput');
    const pvAtualInputEl = document.getElementById('pvAtualInput');
    
    if (pvModificadorEl) pvModificadorEl.value = estado.pv.maximo - 10; // Calcula bônus
    if (pvMaxInputEl) pvMaxInputEl.value = estado.pv.maximo;
    if (pvAtualInputEl) pvAtualInputEl.value = estado.pv.atual;
    
    console.log(`PV atualizado: ${estado.pv.atual}/${estado.pv.maximo}`);
}

function atualizarTelaPF() {
    console.log("Atualizando tela PF...");
    
    // 1. Atualizar textos
    const pfBaseEl = document.getElementById('pfBase');
    const pfMaxEl = document.getElementById('pfMaxValue');
    const pfAtualEl = document.getElementById('pfAtualValue');
    const pfTextEl = document.getElementById('pfText');
    
    if (pfBaseEl) pfBaseEl.textContent = estado.pf.maximo; // HT base
    if (pfMaxEl) pfMaxEl.textContent = estado.pf.maximo;
    if (pfAtualEl) pfAtualEl.textContent = estado.pf.atual;
    if (pfTextEl) pfTextEl.textContent = `${estado.pf.atual}/${estado.pf.maximo}`;
    
    // 2. Atualizar barra
    const pfFillEl = document.getElementById('pfFill');
    if (pfFillEl) {
        const porcentagem = (estado.pf.atual / estado.pf.maximo) * 100;
        pfFillEl.style.width = `${porcentagem}%`;
        
        // Cor da barra
        if (porcentagem > 33) pfFillEl.style.background = '#2ecc71';
        else if (porcentagem > 0) pfFillEl.style.background = '#f39c12';
        else pfFillEl.style.background = '#e74c3c';
    }
    
    // 3. Atualizar inputs
    const pfModificadorEl = document.getElementById('pfModificador');
    const pfMaxInputEl = document.getElementById('pfMaxInput');
    const pfAtualInputEl = document.getElementById('pfAtualInput');
    
    if (pfModificadorEl) pfModificadorEl.value = estado.pf.maximo - 10; // Calcula bônus
    if (pfMaxInputEl) pfMaxInputEl.value = estado.pf.maximo;
    if (pfAtualInputEl) pfAtualInputEl.value = estado.pf.atual;
    
    console.log(`PF atualizado: ${estado.pf.atual}/${estado.pf.maximo}`);
}

// ========== CONFIGURAR BOTÕES ==========

function configurarTodosBotoes() {
    console.log("🔧 Configurando todos os botões...");
    
    // BOTÕES DE DANO PV (-5, -2, -1)
    document.querySelectorAll('.btn-dano').forEach(botao => {
        botao.addEventListener('click', function() {
            const valor = parseInt(this.getAttribute('data-amount')) || 1;
            console.log(`Botão DANO PV clicado: -${valor}`);
            mudarPV(-valor);
        });
    });
    
    // BOTÕES DE CURA PV (+1, +2, +5)
    document.querySelectorAll('.btn-cura').forEach(botao => {
        botao.addEventListener('click', function() {
            const valor = parseInt(this.getAttribute('data-amount')) || 1;
            console.log(`Botão CURA PV clicado: +${valor}`);
            mudarPV(valor);
        });
    });
    
    // BOTÕES DE FADIGA PF (-3, -1)
    document.querySelectorAll('.btn-fadiga').forEach(botao => {
        botao.addEventListener('click', function() {
            const valor = parseInt(this.getAttribute('data-amount')) || 1;
            console.log(`Botão FADIGA PF clicado: -${valor}`);
            mudarPF(-valor);
        });
    });
    
    // BOTÕES DE DESCANSO PF (+1, +3)
    document.querySelectorAll('.btn-descanso').forEach(botao => {
        botao.addEventListener('click', function() {
            const valor = parseInt(this.getAttribute('data-amount')) || 1;
            console.log(`Botão DESCANSO PF clicado: +${valor}`);
            mudarPF(valor);
        });
    });
    
    // BOTÕES DE MODIFICADOR (+/-)
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
            if (input.id === 'pvModificador') {
                valor = Math.max(-20, Math.min(20, valor));
                input.value = valor;
                
                // Atualizar PV máximo com o bônus
                estado.pv.maximo = 10 + valor;
                if (estado.pv.atual > estado.pv.maximo) {
                    estado.pv.atual = estado.pv.maximo;
                }
                atualizarTelaPV();
                
            } else if (input.id === 'pfModificador') {
                valor = Math.max(-10, Math.min(10, valor));
                input.value = valor;
                
                // Atualizar PF máximo com o bônus
                estado.pf.maximo = 10 + valor;
                if (estado.pf.atual > estado.pf.maximo) {
                    estado.pf.atual = estado.pf.maximo;
                }
                atualizarTelaPF();
            }
            
            salvarEstado();
        });
    });
    
    // INPUTS
    const pvModificadorInput = document.getElementById('pvModificador');
    if (pvModificadorInput) {
        pvModificadorInput.addEventListener('change', function() {
            const valor = parseInt(this.value) || 0;
            estado.pv.maximo = 10 + valor;
            if (estado.pv.atual > estado.pv.maximo) {
                estado.pv.atual = estado.pv.maximo;
            }
            atualizarTelaPV();
            salvarEstado();
        });
    }
    
    const pfModificadorInput = document.getElementById('pfModificador');
    if (pfModificadorInput) {
        pfModificadorInput.addEventListener('change', function() {
            const valor = parseInt(this.value) || 0;
            estado.pf.maximo = 10 + valor;
            if (estado.pf.atual > estado.pf.maximo) {
                estado.pf.atual = estado.pf.maximo;
            }
            atualizarTelaPF();
            salvarEstado();
        });
    }
    
    const pvMaxInput = document.getElementById('pvMaxInput');
    if (pvMaxInput) {
        pvMaxInput.addEventListener('change', function() {
            const valor = parseInt(this.value) || 12;
            estado.pv.maximo = Math.max(1, valor);
            if (estado.pv.atual > estado.pv.maximo) {
                estado.pv.atual = estado.pv.maximo;
            }
            atualizarTelaPV();
            salvarEstado();
        });
    }
    
    const pfMaxInput = document.getElementById('pfMaxInput');
    if (pfMaxInput) {
        pfMaxInput.addEventListener('change', function() {
            const valor = parseInt(this.value) || 13;
            estado.pf.maximo = Math.max(1, valor);
            if (estado.pf.atual > estado.pf.maximo) {
                estado.pf.atual = estado.pf.maximo;
            }
            atualizarTelaPF();
            salvarEstado();
        });
    }
    
    const pvAtualInput = document.getElementById('pvAtualInput');
    if (pvAtualInput) {
        pvAtualInput.addEventListener('change', function() {
            const valor = parseInt(this.value) || 12;
            estado.pv.atual = Math.max(0, Math.min(valor, estado.pv.maximo));
            atualizarTelaPV();
            salvarEstado();
        });
    }
    
    const pfAtualInput = document.getElementById('pfAtualInput');
    if (pfAtualInput) {
        pfAtualInput.addEventListener('change', function() {
            const valor = parseInt(this.value) || 13;
            estado.pf.atual = Math.max(0, Math.min(valor, estado.pf.maximo));
            atualizarTelaPF();
            salvarEstado();
        });
    }
    
    console.log("✅ Todos os botões configurados!");
}

// ========== PEGAR ATRIBUTOS DO PERSONAGEM ==========

function pegarAtributosAtuais() {
    console.log("🔄 Pegando atributos do personagem...");
    
    if (typeof window.obterDadosAtributos === 'function') {
        try {
            const dados = window.obterDadosAtributos();
            console.log("Dados encontrados:", dados);
            
            // USAR OS VALORES REAIS DO PERSONAGEM
            if (dados.ST && dados.PV) {
                estado.pv.maximo = dados.PV; // Usar PV total (já com bônus)
                estado.pv.atual = dados.PV;
                console.log(`PV do personagem: ${dados.PV} (ST: ${dados.ST})`);
            }
            
            if (dados.HT && dados.PF) {
                estado.pf.maximo = dados.PF; // Usar PF total (já com bônus)
                estado.pf.atual = dados.PF;
                console.log(`PF do personagem: ${dados.PF} (HT: ${dados.HT})`);
            }
            
            // Atualizar tela com os valores reais
            atualizarTelaPV();
            atualizarTelaPF();
            
        } catch (e) {
            console.warn("Erro ao pegar atributos:", e);
        }
    } else {
        console.warn("Função obterDadosAtributos não encontrada!");
    }
}

// ========== SALVAR E CARREGAR ==========

function salvarEstado() {
    try {
        localStorage.setItem('gurps_pv_pf_estado', JSON.stringify(estado));
    } catch (e) {
        console.warn("Não foi possível salvar:", e);
    }
}

function carregarEstado() {
    try {
        const salvo = localStorage.getItem('gurps_pv_pf_estado');
        if (salvo) {
            const dados = JSON.parse(salvo);
            estado = { ...estado, ...dados };
            console.log("Estado carregado:", estado);
        }
    } catch (e) {
        console.warn("Erro ao carregar:", e);
    }
}

// ========== INICIAR SISTEMA ==========

function iniciarSistema() {
    console.log("🚀 INICIANDO SISTEMA PV/PF");
    
    // 1. Carregar estado salvo
    carregarEstado();
    
    // 2. Pegar atributos atuais do personagem
    pegarAtributosAtuais();
    
    // 3. Configurar todos os botões
    configurarTodosBotoes();
    
    // 4. Atualizar tela inicial
    atualizarTelaPV();
    atualizarTelaPF();
    
    // 5. Escutar quando atributos mudarem
    document.addEventListener('atributosAlterados', function(e) {
        console.log("📡 Evento de atributos alterados recebido!", e.detail);
        
        if (e.detail.PV !== undefined) {
            estado.pv.maximo = e.detail.PV;
            if (estado.pv.atual > estado.pv.maximo) {
                estado.pv.atual = estado.pv.maximo;
            }
            atualizarTelaPV();
        }
        
        if (e.detail.PF !== undefined) {
            estado.pf.maximo = e.detail.PF;
            if (estado.pf.atual > estado.pf.maximo) {
                estado.pf.atual = estado.pf.maximo;
            }
            atualizarTelaPF();
        }
        
        salvarEstado();
    });
    
    console.log("✅ SISTEMA PV/PF PRONTO!");
    console.log(`PV Inicial: ${estado.pv.atual}/${estado.pv.maximo}`);
    console.log(`PF Inicial: ${estado.pf.atual}/${estado.pf.maximo}`);
}

// ========== INICIALIZAÇÃO AUTOMÁTICA ==========

// Esperar a aba de combate carregar
document.addEventListener('DOMContentLoaded', function() {
    const combateTab = document.getElementById('combate');
    
    // Se a aba de combate já estiver ativa, iniciar
    if (combateTab && combateTab.classList.contains('active')) {
        setTimeout(iniciarSistema, 500);
    }
    
    // Observar quando a aba de combate for ativada
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                if (combateTab.classList.contains('active')) {
                    setTimeout(iniciarSistema, 500);
                }
            }
        });
    });
    
    observer.observe(combateTab, { attributes: true });
});

// ========== FUNÇÕES PARA TESTE NO CONSOLE ==========

// Testar no console (F12)
window.testePV = function(valor) {
    mudarPV(valor);
    console.log(`PV: ${estado.pv.atual}/${estado.pv.maximo}`);
};

window.testePF = function(valor) {
    mudarPF(valor);
    console.log(`PF: ${estado.pf.atual}/${estado.pf.maximo}`);
};

window.mostrarEstado = function() {
    console.log("ESTADO ATUAL:", estado);
    console.log(`PV: ${estado.pv.atual}/${estado.pv.maximo}`);
    console.log(`PF: ${estado.pf.atual}/${estado.pf.maximo}`);
};

// ========== EXPORTAR FUNÇÕES ==========

window.PVPF = {
    mudarPV: mudarPV,
    mudarPF: mudarPF,
    getPV: () => estado.pv.atual,
    getPF: () => estado.pf.atual,
    getPVMax: () => estado.pv.maximo,
    getPFMax: () => estado.pf.maximo,
    pegarAtributosAtuais: pegarAtributosAtuais
};
// pv-pf.js - CÓDIGO COMPLETO E FUNCIONAL

// ============ VARIÁVEIS GLOBAIS ============
window.personagemPV = 10;
window.personagemPF = 10;
window.personagemST = 10;
window.personagemHT = 10;

// ============ FUNÇÃO PRINCIPAL: ALTERAR PV ============
window.alterarPV = function(valor) {
    // 1. Alterar o valor
    window.personagemPV += valor;
    
    // 2. Atualizar na tela - TODOS os elementos
    const elementosPV = [
        'pvAtualValue', 'pvAtualInput', 'pvText'
    ];
    
    elementosPV.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            if (elemento.tagName === 'INPUT') {
                elemento.value = window.personagemPV;
            } else {
                elemento.textContent = window.personagemPV;
            }
        }
    });
    
    // 3. Atualizar barra de PV
    const barraPV = document.getElementById('pvFill');
    if (barraPV) {
        // Calcular porcentagem (0% a 100%)
        let porcentagem = (window.personagemPV / 20) * 100;
        if (porcentagem > 100) porcentagem = 100;
        if (porcentagem < 0) porcentagem = 0;
        
        barraPV.style.width = porcentagem + '%';
        
        // Mudar cor baseada no valor
        if (window.personagemPV > 15) barraPV.style.background = '#27ae60';
        else if (window.personagemPV > 10) barraPV.style.background = '#2ecc71';
        else if (window.personagemPV > 5) barraPV.style.background = '#f1c40f';
        else if (window.personagemPV > 0) barraPV.style.background = '#e67e22';
        else if (window.personagemPV > -5) barraPV.style.background = '#e74c3c';
        else if (window.personagemPV > -10) barraPV.style.background = '#9b59b6';
        else barraPV.style.background = '#2c3e50';
    }
    
    console.log('PV alterado para:', window.personagemPV);
};

// ============ FUNÇÃO PRINCIPAL: ALTERAR PF ============
window.alterarPF = function(valor) {
    // 1. Alterar o valor
    window.personagemPF += valor;
    
    // 2. Atualizar na tela - TODOS os elementos
    const elementosPF = [
        'pfAtualValue', 'pfAtualInput', 'pfText'
    ];
    
    elementosPF.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            if (elemento.tagName === 'INPUT') {
                elemento.value = window.personagemPF;
            } else {
                elemento.textContent = window.personagemPF;
            }
        }
    });
    
    // 3. Atualizar barra de PF
    const barraPF = document.getElementById('pfFill');
    if (barraPF) {
        // Calcular porcentagem (0% a 100%)
        let porcentagem = (window.personagemPF / 20) * 100;
        if (porcentagem > 100) porcentagem = 100;
        if (porcentagem < 0) porcentagem = 0;
        
        barraPF.style.width = porcentagem + '%';
        
        // Mudar cor baseada no valor
        if (window.personagemPF > 7) barraPF.style.background = '#2ecc71';
        else if (window.personagemPF > 3) barraPF.style.background = '#f1c40f';
        else barraPF.style.background = '#e74c3c';
    }
    
    console.log('PF alterado para:', window.personagemPF);
};

// ============ CONFIGURAR TODOS OS BOTÕES ============
function configurarTodosBotoes() {
    console.log('Configurando botões...');
    
    // BOTÕES DE DANO PV
    const botoesDano = document.querySelectorAll('.btn-dano');
    botoesDano.forEach(botao => {
        botao.addEventListener('click', function() {
            const valor = parseInt(this.getAttribute('data-amount')) || 1;
            console.log('Botão dano clicado:', valor);
            window.alterarPV(-valor);
        });
    });
    
    // BOTÕES DE CURA PV
    const botoesCura = document.querySelectorAll('.btn-cura');
    botoesCura.forEach(botao => {
        botao.addEventListener('click', function() {
            const valor = parseInt(this.getAttribute('data-amount')) || 1;
            console.log('Botão cura clicado:', valor);
            window.alterarPV(valor);
        });
    });
    
    // BOTÕES DE FADIGA PF
    const botoesFadiga = document.querySelectorAll('.btn-fadiga');
    botoesFadiga.forEach(botao => {
        botao.addEventListener('click', function() {
            const valor = parseInt(this.getAttribute('data-amount')) || 1;
            console.log('Botão fadiga clicado:', valor);
            window.alterarPF(-valor);
        });
    });
    
    // BOTÕES DE DESCANSO PF
    const botoesDescanso = document.querySelectorAll('.btn-descanso');
    botoesDescanso.forEach(botao => {
        botao.addEventListener('click', function() {
            const valor = parseInt(this.getAttribute('data-amount')) || 1;
            console.log('Botão descanso clicado:', valor);
            window.alterarPF(valor);
        });
    });
    
    // BOTÕES DE MODIFICADOR (+/-)
    const botoesMod = document.querySelectorAll('.mod-btn');
    botoesMod.forEach(botao => {
        botao.addEventListener('click', function() {
            const input = this.closest('.mod-control').querySelector('.mod-input');
            if (!input) return;
            
            let valor = parseInt(input.value) || 0;
            
            if (this.classList.contains('plus')) {
                valor += 1;
            } else {
                valor -= 1;
            }
            
            input.value = valor;
            
            // Atualizar máximo se for modificador de PV
            if (input.id === 'pvModificador') {
                window.personagemPV = 10 + valor;
                window.alterarPV(0); // Forçar atualização
            }
            
            // Atualizar máximo se for modificador de PF
            if (input.id === 'pfModificador') {
                window.personagemPF = 10 + valor;
                window.alterarPF(0); // Forçar atualização
            }
        });
    });
    
    console.log('Botões configurados:', 
        botoesDano.length + botoesCura.length + 
        botoesFadiga.length + botoesDescanso.length + ' botões');
}

// ============ PEGAR ATRIBUTOS DO PERSONAGEM ============
function pegarAtributos() {
    if (typeof window.obterDadosAtributos === 'function') {
        try {
            const dados = window.obterDadosAtributos();
            
            if (dados.ST) {
                window.personagemST = dados.ST;
                window.personagemPV = dados.PV || dados.ST;
                
                // Atualizar displays de ST
                const stElementos = ['pvBase', 'pvMaxValue', 'pvMaxInput'];
                stElementos.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) {
                        if (el.tagName === 'INPUT') {
                            el.value = dados.ST;
                        } else {
                            el.textContent = dados.ST;
                        }
                    }
                });
            }
            
            if (dados.HT) {
                window.personagemHT = dados.HT;
                window.personagemPF = dados.PF || dados.HT;
                
                // Atualizar displays de HT
                const htElementos = ['pfBase', 'pfMaxValue', 'pfMaxInput'];
                htElementos.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) {
                        if (el.tagName === 'INPUT') {
                            el.value = dados.HT;
                        } else {
                            el.textContent = dados.HT;
                        }
                    }
                });
            }
            
            // Forçar atualização
            window.alterarPV(0);
            window.alterarPF(0);
            
        } catch (error) {
            console.error('Erro ao pegar atributos:', error);
        }
    }
}

// ============ INICIAR SISTEMA ============
function iniciarSistemaPVPF() {
    console.log('=== INICIANDO SISTEMA PV/PF ===');
    
    // 1. Pegar atributos
    pegarAtributos();
    
    // 2. Configurar botões
    configurarTodosBotoes();
    
    // 3. Atualizar valores iniciais
    window.alterarPV(0);
    window.alterarPF(0);
    
    // 4. Escutar eventos de atributos alterados
    document.addEventListener('atributosAlterados', function(evento) {
        if (evento.detail) {
            if (evento.detail.ST) {
                window.personagemST = evento.detail.ST;
                window.personagemPV = evento.detail.PV || evento.detail.ST;
                window.alterarPV(0);
            }
            
            if (evento.detail.HT) {
                window.personagemHT = evento.detail.HT;
                window.personagemPF = evento.detail.PF || evento.detail.HT;
                window.alterarPF(0);
            }
        }
    });
    
    console.log('✅ SISTEMA PV/PF INICIADO COM SUCESSO');
}

// ============ INICIAR QUANDO PÁGINA CARREGAR ============
document.addEventListener('DOMContentLoaded', function() {
    // Esperar 1 segundo para garantir que tudo carregou
    setTimeout(function() {
        const combateTab = document.getElementById('combate');
        
        if (combateTab && combateTab.classList.contains('active')) {
            iniciarSistemaPVPF();
        }
        
        // Observar quando a aba combate for ativada
        const observer = new MutationObserver(function(mutacoes) {
            mutacoes.forEach(function(mutacao) {
                if (mutacao.attributeName === 'class') {
                    if (combateTab.classList.contains('active')) {
                        iniciarSistemaPVPF();
                    }
                }
            });
        });
        
        if (combateTab) {
            observer.observe(combateTab, { attributes: true });
        }
    }, 1000);
});

// ============ FUNÇÕES PARA TESTE NO CONSOLE ============
// Para testar: abra console (F12) e digite:
// testarPV(-5) ou testarPF(-3)
window.testarPV = function(valor) {
    console.log('Testando PV:', valor);
    window.alterarPV(valor);
};

window.testarPF = function(valor) {
    console.log('Testando PF:', valor);
    window.alterarPF(valor);
};

window.mostrarEstado = function() {
    console.log('ESTADO ATUAL:');
    console.log('PV:', window.personagemPV);
    console.log('PF:', window.personagemPF);
    console.log('ST:', window.personagemST);
    console.log('HT:', window.personagemHT);
};
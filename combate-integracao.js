// combate-integracao.js - Integração do sistema de combate

// Aguarda todos os scripts necessários carregarem
function aguardarScripts() {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            // Verifica se as funções necessárias existem
            if (window.obterDadosAtributos && window.inicializarSistemaCombate) {
                clearInterval(interval);
                resolve();
            }
        }, 100);
        
        // Timeout de segurança
        setTimeout(() => {
            clearInterval(interval);
            resolve();
        }, 5000);
    });
}

// Inicializa o sistema de combate quando tudo estiver pronto
async function inicializarTudo() {
    console.log('Aguardando scripts necessários...');
    await aguardarScripts();
    
    // Tenta inicializar imediatamente
    if (window.inicializarSistemaCombate) {
        window.inicializarSistemaCombate();
    }
    
    // Configura integração com equipamentos
    if (window.obterEquipamentoEquipado) {
        try {
            const armaEquipada = window.obterEquipamentoEquipado('arma');
            if (armaEquipada && window.receberArmaEquipada) {
                window.receberArmaEquipada(armaEquipada);
            }
        } catch (e) {
            console.warn('Não foi possível carregar arma equipada:', e);
        }
    }
    
    console.log('Integração de combate completa!');
}

// Inicia quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', inicializarTudo);

// Exporta funções para outros módulos
window.integrarCombate = {
    obterPV: () => window.obterPV ? window.obterPV() : 10,
    obterPF: () => window.obterPF ? window.obterPF() : 10,
    aplicarDano: (quantidade, tipo) => {
        if (window.aplicarDano) window.aplicarDano(quantidade, tipo);
    },
    curar: (quantidade, tipo) => {
        if (window.curar) window.curar(quantidade, tipo);
    }
};
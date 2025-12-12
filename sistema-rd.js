// sistema-rd.js - Sistema Automático de Resistência a Dano

class SistemaRD {
    constructor() {
        console.log('🛡️ Inicializando Sistema RD...');
        
        // Partes do corpo mapeadas
        this.partesCorpo = [
            'cabeca', 'tronco', 'rosto', 'crânio', 'pescoco',
            'virilha', 'bracos', 'pernas', 'maos', 'pes'
        ];
        
        // Mapeamento CORRETO baseado no catálogo
        this.mapeamentoArmaduras = {
            // Armadura de Couro: "Tronco/Virilha" no catálogo
            'Tronco/Virilha': ['tronco', 'virilha'],
            
            // Cota de Malha Longa: "Tronco/Virilha"
            // Armadura de Escamas: "Tronco/Virilha"
            
            // Elmo de Bronze: "Cabeça" no catálogo
            'Cabeça': ['cabeca', 'crânio', 'rosto'],
            
            // Braçadeiras de Bronze: "Braços" no catálogo
            'Braços': ['bracos'],
            
            // Para armadura completa
            'Corpo Inteiro': ['tronco', 'virilha', 'bracos', 'pernas', 'cabeca', 'crânio', 'rosto'],
            
            // Para escudos (se tiverem RD)
            'Escudo': ['bracos']
        };
        
        // Cache do RD
        this.rdCalculado = {};
        this.partesCorpo.forEach(parte => {
            this.rdCalculado[parte] = 0;
        });
        
        this.inicializado = false;
        this.inicializarQuandoPronto();
    }
    
    async inicializarQuandoPronto() {
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }
        
        await this.aguardarSistemaEquipamentos();
        this.inicializar();
    }
    
    aguardarSistemaEquipamentos() {
        return new Promise((resolve) => {
            let tentativas = 0;
            const verificar = () => {
                tentativas++;
                if (window.sistemaEquipamentos) {
                    console.log('✅ Sistema de equipamentos OK para RD');
                    resolve();
                } else if (tentativas < 30) {
                    setTimeout(verificar, 100);
                } else {
                    resolve();
                }
            };
            verificar();
        });
    }
    
    inicializar() {
        try {
            console.log('🚀 Iniciando RD...');
            
            this.configurarObservadorEquipamentos();
            this.configurarEventosCamposRD();
            this.calcularRDAutomatico();
            this.atualizarInterfaceRD();
            this.adicionarBotaoReset();
            
            this.inicializado = true;
            console.log('✅ Sistema RD pronto!');
            
        } catch (error) {
            console.error('❌ Erro RD:', error);
        }
    }
    
    configurarObservadorEquipamentos() {
        document.addEventListener('equipamentosAtualizados', () => {
            setTimeout(() => {
                this.calcularRDAutomatico();
                this.atualizarInterfaceRD();
            }, 100);
        });
    }
    
    configurarEventosCamposRD() {
        this.partesCorpo.forEach(parte => {
            const input = document.querySelector(`.rd-parte[data-parte="${parte}"] input`);
            if (input) {
                const novoInput = input.cloneNode(true);
                input.parentNode.replaceChild(novoInput, input);
                
                novoInput.addEventListener('change', (e) => {
                    const valor = parseInt(e.target.value) || 0;
                    this.rdCalculado[parte] = valor;
                    this.calcularRDTotal();
                });
            }
        });
    }
    
    adicionarBotaoReset() {
        const botaoReset = document.createElement('button');
        botaoReset.className = 'btn-rd-reset';
        botaoReset.innerHTML = '<i class="fas fa-sync-alt"></i> Recalcular RD';
        botaoReset.onclick = () => {
            this.calcularRDAutomatico();
            this.atualizarInterfaceRD();
            this.mostrarFeedback('RD recalculado!', 'info');
        };
        
        const cardHeader = document.querySelector('.card-rd .card-header');
        if (cardHeader) {
            cardHeader.appendChild(botaoReset);
        }
    }
    
    // MÉTODO PRINCIPAL: Calcular RD com base nos equipamentos
    calcularRDAutomatico() {
        console.log('🧮 Calculando RD automático...');
        
        // Resetar cache
        this.partesCorpo.forEach(parte => {
            this.rdCalculado[parte] = 0;
        });
        
        // Verificar se temos sistema de equipamentos
        if (!window.sistemaEquipamentos) {
            console.warn('⚠️ Sistema de equipamentos não disponível');
            return;
        }
        
        // Obter armaduras equipadas
        const armadurasEquipadas = window.sistemaEquipamentos.equipamentosEquipados?.armaduras || [];
        console.log(`🔍 ${armadurasEquipadas.length} armadura(s) equipada(s)`);
        
        // Processar cada armadura
        armadurasEquipadas.forEach(armadura => {
            this.processarArmadura(armadura);
        });
        
        // Calcular total
        this.calcularRDTotal();
    }
    
    processarArmadura(armadura) {
        if (!armadura) return;
        
        console.log(`🛡️ Processando: ${armadura.nome}`, armadura);
        
        // Obter RD da armadura
        let rdValor = 0;
        
        if (typeof armadura.rd === 'number') {
            rdValor = armadura.rd;
        } else if (typeof armadura.rd === 'string') {
            // Pode ser "4/2" ou similar
            const partes = armadura.rd.split('/');
            rdValor = parseInt(partes[0]) || 0;
        }
        
        if (rdValor === 0) {
            console.log(`⚠️ ${armadura.nome} sem RD definido`);
            return;
        }
        
        // Determinar partes protegidas baseado no LOCAL da armadura
        const partesProtegidas = this.determinarPartesProtegidas(armadura);
        
        console.log(`📊 ${armadura.nome} protege: ${partesProtegidas.join(', ')} com RD ${rdValor}`);
        
        // Aplicar RD às partes
        partesProtegidas.forEach(parte => {
            this.rdCalculado[parte] += rdValor;
        });
    }
    
    determinarPartesProtegidas(armadura) {
        const partes = [];
        
        // 1. Primeiro tentar pelo local direto da armadura
        if (armadura.local) {
            const localLower = armadura.local.toLowerCase();
            
            // Verificar mapeamento direto
            if (this.mapeamentoArmaduras[armadura.local]) {
                partes.push(...this.mapeamentoArmaduras[armadura.local]);
            } 
            // Inferir por palavras-chave
            else if (localLower.includes('tronco') || localLower.includes('torso')) {
                if (localLower.includes('virilha')) {
                    partes.push('tronco', 'virilha');
                } else {
                    partes.push('tronco');
                }
            }
            else if (localLower.includes('cabeça') || localLower.includes('cabeca') || localLower.includes('elmo') || localLower.includes('capacete')) {
                partes.push('cabeca', 'crânio', 'rosto');
            }
            else if (localLower.includes('braço') || localLower.includes('braco')) {
                partes.push('bracos');
            }
            else if (localLower.includes('perna')) {
                partes.push('pernas');
            }
            else if (localLower.includes('mão') || localLower.includes('mao')) {
                partes.push('maos');
            }
            else if (localLower.includes('pé') || localLower.includes('pe')) {
                partes.push('pes');
            }
            else if (localLower.includes('pescoço') || localLower.includes('pescoco')) {
                partes.push('pescoco');
            }
        }
        
        // 2. Se não encontrou, tentar inferir pelo nome
        if (partes.length === 0) {
            const nomeLower = armadura.nome.toLowerCase();
            
            if (nomeLower.includes('elmo') || nomeLower.includes('capacete') || nomeLower.includes('helm')) {
                partes.push('cabeca', 'crânio', 'rosto');
            }
            else if (nomeLower.includes('peitoral') || nomeLower.includes('couraça') || nomeLower.includes('cota') || nomeLower.includes('armadura de couro')) {
                if (nomeLower.includes('virilha') || nomeLower.includes('inteira')) {
                    partes.push('tronco', 'virilha');
                } else {
                    partes.push('tronco');
                }
            }
            else if (nomeLower.includes('braçadeira') || nomeLower.includes('brace')) {
                partes.push('bracos');
            }
            else if (nomeLower.includes('perneira') || nomeLower.includes('greva')) {
                partes.push('pernas');
            }
            else if (nomeLower.includes('manopla') || nomeLower.includes('luva')) {
                partes.push('maos');
            }
            else if (nomeLower.includes('bota') || nomeLower.includes('sabatona')) {
                partes.push('pes');
            }
            else if (nomeLower.includes('completa') || nomeLower.includes('full') || nomeLower.includes('armadura completa')) {
                partes.push('tronco', 'virilha', 'bracos', 'pernas', 'cabeca', 'crânio', 'rosto');
            }
        }
        
        // Remover duplicatas
        return [...new Set(partes)];
    }
    
    calcularRDTotal() {
        let total = 0;
        
        this.partesCorpo.forEach(parte => {
            total += this.rdCalculado[parte] || 0;
        });
        
        // Atualizar display do total
        const rdTotalElement = document.getElementById('rdTotal');
        if (rdTotalElement) {
            rdTotalElement.textContent = total;
        }
        
        return total;
    }
    
    atualizarInterfaceRD() {
        // Para cada parte do corpo
        this.partesCorpo.forEach(parte => {
            const rdValor = this.rdCalculado[parte] || 0;
            
            // Encontrar o elemento input correspondente
            const input = document.querySelector(`.rd-parte[data-parte="${parte}"] input`);
            const container = document.querySelector(`.rd-parte[data-parte="${parte}"]`);
            
            if (input && container) {
                // Atualizar valor
                input.value = rdValor;
                
                // Adicionar classe visual se tiver RD
                container.classList.remove('tem-rd');
                if (rdValor > 0) {
                    container.classList.add('tem-rd');
                    container.title = `RD ${rdValor}`;
                } else {
                    container.title = 'Sem proteção';
                }
            }
        });
        
        // Notificar outros sistemas
        this.notificarMudancaRD();
    }
    
    notificarMudancaRD() {
        const event = new CustomEvent('rdAtualizado', {
            detail: {
                rdCalculado: this.rdCalculado,
                rdTotal: this.calcularRDTotal()
            }
        });
        document.dispatchEvent(event);
    }
    
    mostrarFeedback(mensagem, tipo = 'info') {
        console.log(`📢 ${mensagem}`);
        
        // Feedback simples no console
        if (tipo === 'erro') {
            console.error(`❌ ${mensagem}`);
        } else if (tipo === 'sucesso') {
            console.log(`✅ ${mensagem}`);
        }
    }
    
    // Método para debug
    mostrarDebug() {
        console.group('🔍 DEBUG Sistema RD');
        console.log('📊 RD Calculado:', this.rdCalculado);
        console.log('🧮 RD Total:', this.calcularRDTotal());
        
        if (window.sistemaEquipamentos) {
            console.log('🎒 Equipamentos Equipados:', {
                armaduras: window.sistemaEquipamentos.equipamentosEquipados?.armaduras
            });
        }
        console.groupEnd();
    }
}

// ========== INICIALIZAÇÃO ==========
let sistemaRD;

document.addEventListener('DOMContentLoaded', function() {
    console.log('📦 Carregando Sistema RD...');
    
    if (window.sistemaRD) return;
    
    const inicializarQuandoNecessario = () => {
        const abaCombate = document.getElementById('combate');
        
        if (abaCombate && !sistemaRD) {
            console.log('🎯 Aba de combate detectada, inicializando RD...');
            sistemaRD = new SistemaRD();
            window.sistemaRD = sistemaRD;
        }
    };
    
    inicializarQuandoNecessario();
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'combate' && tab.classList.contains('active')) {
                    setTimeout(inicializarQuandoNecessario, 100);
                }
            }
        });
    });
    
    document.querySelectorAll('.tab-content').forEach(tab => {
        observer.observe(tab, { attributes: true });
    });
    
    const abaCombateAtiva = document.querySelector('#combate.active');
    if (abaCombateAtiva) {
        setTimeout(inicializarQuandoNecessario, 500);
    }
});

// Funções globais de conveniência
window.calcularRDAutomatico = function() {
    if (window.sistemaRD && window.sistemaRD.calcularRDAutomatico) {
        window.sistemaRD.calcularRDAutomatico();
        window.sistemaRD.atualizarInterfaceRD();
    }
};

window.debugRD = function() {
    if (window.sistemaRD && window.sistemaRD.mostrarDebug) {
        window.sistemaRD.mostrarDebug();
    }
};

console.log('🔧 sistema-rd.js carregado!');
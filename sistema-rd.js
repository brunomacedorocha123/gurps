// sistema-rd.js - Sistema Automático de Resistência a Dano
// Corrigido para verificar itens NO CORPO

class SistemaRD {
    constructor() {
        console.log('🛡️ Inicializando Sistema RD...');
        
        // Partes do corpo
        this.partesCorpo = [
            'cabeca', 'tronco', 'rosto', 'crânio', 'pescoco',
            'virilha', 'bracos', 'pernas', 'maos', 'pes'
        ];
        
        // Mapeamento correto baseado no catálogo
        this.mapeamentoArmaduras = {
            'Tronco/Virilha': ['tronco', 'virilha'],
            'Cabeça': ['cabeca', 'crânio', 'rosto'],
            'Braços': ['bracos'],
            'Pernas': ['pernas'],
            'Mãos': ['maos'],
            'Pés': ['pes'],
            'Corpo Inteiro': ['tronco', 'virilha', 'bracos', 'pernas', 'cabeca', 'crânio', 'rosto']
        };
        
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
                    console.log('✅ Sistema de equipamentos OK');
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
            
            this.configurarObservador();
            this.configurarEventosCampos();
            this.calcularRDAutomatico();
            this.atualizarInterface();
            
            this.inicializado = true;
            console.log('✅ Sistema RD pronto!');
            
        } catch (error) {
            console.error('❌ Erro RD:', error);
        }
    }
    
    configurarObservador() {
        // Observar mudanças no sistema de equipamentos
        document.addEventListener('equipamentosAtualizados', () => {
            setTimeout(() => {
                this.calcularRDAutomatico();
                this.atualizarInterface();
            }, 100);
        });
    }
    
    configurarEventosCampos() {
        this.partesCorpo.forEach(parte => {
            const input = document.querySelector(`.rd-parte[data-parte="${parte}"] input`);
            if (input) {
                // Substituir o input para remover event listeners antigos
                const novoInput = input.cloneNode(true);
                input.parentNode.replaceChild(novoInput, input);
                
                novoInput.addEventListener('change', (e) => {
                    const valor = parseInt(e.target.value) || 0;
                    this.rdCalculado[parte] = valor;
                    this.atualizarTotal();
                });
            }
        });
    }
    
    // MÉTODO CORRIGIDO: Verificar itens NO CORPO
    calcularRDAutomatico() {
        console.log('🧮 Calculando RD automático...');
        
        // Resetar cache
        this.partesCorpo.forEach(parte => {
            this.rdCalculado[parte] = 0;
        });
        
        if (!window.sistemaEquipamentos) {
            console.warn('⚠️ Sistema de equipamentos não disponível');
            return;
        }
        
        // CORREÇÃO AQUI: Verificar itens NO CORPO, não equipados
        const itensNoCorpo = this.obterItensNoCorpo();
        console.log(`🔍 ${itensNoCorpo.length} item(s) no corpo detectado(s)`);
        
        // Processar cada item no corpo
        itensNoCorpo.forEach(item => {
            this.processarItem(item);
        });
        
        this.atualizarTotal();
    }
    
    // CORREÇÃO: Método para obter itens NO CORPO
    obterItensNoCorpo() {
        if (!window.sistemaEquipamentos || !window.sistemaEquipamentos.equipamentosAdquiridos) {
            return [];
        }
        
        // Filtrar itens com status 'no-corpo'
        return window.sistemaEquipamentos.equipamentosAdquiridos.filter(item => 
            item.status === 'no-corpo' && 
            (item.tipo === 'armadura' || item.local || item.rd)
        );
    }
    
    processarItem(item) {
        if (!item) return;
        
        console.log(`🛡️ Processando item no corpo: ${item.nome}`, item);
        
        // Obter RD do item
        let rdValor = 0;
        
        if (typeof item.rd === 'number') {
            rdValor = item.rd;
        } else if (typeof item.rd === 'string') {
            const partes = item.rd.split('/');
            rdValor = parseInt(partes[0]) || 0;
        }
        
        if (rdValor === 0) {
            console.log(`⚠️ ${item.nome} sem RD definido`);
            return;
        }
        
        // Determinar partes protegidas
        const partesProtegidas = this.determinarPartesProtegidas(item);
        
        console.log(`📊 ${item.nome} protege: ${partesProtegidas.join(', ')} com RD ${rdValor}`);
        
        // Aplicar RD às partes
        partesProtegidas.forEach(parte => {
            this.rdCalculado[parte] += rdValor;
        });
    }
    
    determinarPartesProtegidas(item) {
        const partes = [];
        
        // 1. Usar o local do item se existir
        if (item.local) {
            const local = item.local.trim();
            
            // Verificar mapeamento direto
            if (this.mapeamentoArmaduras[local]) {
                partes.push(...this.mapeamentoArmaduras[local]);
            } 
            // Inferir se for "Tronco/Virilha"
            else if (local.includes('Tronco') && local.includes('Virilha')) {
                partes.push('tronco', 'virilha');
            }
            // Inferir se for "Cabeça"
            else if (local.includes('Cabeça')) {
                partes.push('cabeca', 'crânio', 'rosto');
            }
            // Inferir outros
            else if (local.includes('Braços')) {
                partes.push('bracos');
            }
            else if (local.includes('Pernas')) {
                partes.push('pernas');
            }
            else if (local.includes('Mãos')) {
                partes.push('maos');
            }
            else if (local.includes('Pés')) {
                partes.push('pes');
            }
        }
        
        // 2. Se não encontrou, tentar pelo nome
        if (partes.length === 0) {
            const nomeLower = item.nome.toLowerCase();
            
            if (nomeLower.includes('elmo') || nomeLower.includes('capacete') || nomeLower.includes('cabeça')) {
                partes.push('cabeca', 'crânio', 'rosto');
            }
            else if (nomeLower.includes('couro') || nomeLower.includes('cota') || nomeLower.includes('peitoral')) {
                if (nomeLower.includes('virilha') || nomeLower.includes('inteira')) {
                    partes.push('tronco', 'virilha');
                } else {
                    partes.push('tronco');
                }
            }
            else if (nomeLower.includes('braçadeira') || nomeLower.includes('braço')) {
                partes.push('bracos');
            }
            else if (nomeLower.includes('perneira') || nomeLower.includes('perna')) {
                partes.push('pernas');
            }
            else if (nomeLower.includes('manopla') || nomeLower.includes('luva')) {
                partes.push('maos');
            }
            else if (nomeLower.includes('bota') || nomeLower.includes('sapato')) {
                partes.push('pes');
            }
        }
        
        // Remover duplicatas
        return [...new Set(partes)];
    }
    
    atualizarTotal() {
        let total = 0;
        
        this.partesCorpo.forEach(parte => {
            total += this.rdCalculado[parte] || 0;
        });
        
        // Atualizar display
        const rdTotalElement = document.getElementById('rdTotal');
        if (rdTotalElement) {
            rdTotalElement.textContent = total;
        }
        
        return total;
    }
    
    atualizarInterface() {
        this.partesCorpo.forEach(parte => {
            const rdValor = this.rdCalculado[parte] || 0;
            
            const input = document.querySelector(`.rd-parte[data-parte="${parte}"] input`);
            const container = document.querySelector(`.rd-parte[data-parte="${parte}"]`);
            
            if (input && container) {
                // Atualizar valor
                input.value = rdValor;
                
                // Destacar se tem RD
                if (rdValor > 0) {
                    container.classList.add('tem-rd');
                    container.title = `RD ${rdValor}`;
                } else {
                    container.classList.remove('tem-rd');
                    container.title = 'Sem proteção';
                }
            }
        });
        
        // Notificar outros sistemas
        this.notificarMudanca();
    }
    
    notificarMudanca() {
        const event = new CustomEvent('rdAtualizado', {
            detail: {
                rdCalculado: this.rdCalculado,
                rdTotal: this.atualizarTotal()
            }
        });
        document.dispatchEvent(event);
    }
}

// Inicialização
let sistemaRD;

document.addEventListener('DOMContentLoaded', function() {
    if (window.sistemaRD) return;
    
    const inicializarQuandoNecessario = () => {
        const abaCombate = document.getElementById('combate');
        if (abaCombate && !sistemaRD) {
            console.log('🎯 Inicializando RD...');
            sistemaRD = new SistemaRD();
            window.sistemaRD = sistemaRD;
        }
    };
    
    inicializarQuandoNecessario();
});

// Adicione este CSS no seu arquivo CSS existente:
/*
.rd-parte.tem-rd {
    background: rgba(46, 204, 113, 0.15) !important;
    border-color: #2ecc71 !important;
}

.rd-parte.tem-rd input {
    color: #2ecc71 !important;
    font-weight: bold !important;
}
*/

console.log('🔧 sistema-rd.js (corrigido) carregado!');
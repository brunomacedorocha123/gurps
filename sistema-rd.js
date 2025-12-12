// sistema-rd.js - Versão corrigida para detectar armaduras no corpo

class SistemaRD {
    constructor() {
        console.log('🛡️ Inicializando Sistema RD...');
        
        this.partesCorpo = [
            'cabeca', 'tronco', 'rosto', 'crânio', 'pescoco',
            'virilha', 'bracos', 'pernas', 'maos', 'pes'
        ];
        
        this.mapeamentoArmaduras = {
            'Tronco/Virilha': ['tronco', 'virilha'],
            'Tronco/Virilha': ['tronco', 'virilha'], // Sem acento
            'Cabeça': ['cabeca', 'crânio', 'rosto'],
            'Braços': ['bracos'],
            'Pernas': ['pernas'],
            'Corpo Inteiro': ['tronco', 'virilha', 'bracos', 'pernas', 'cabeca', 'crânio', 'rosto']
        };
        
        this.rdCalculado = {};
        this.partesCorpo.forEach(parte => {
            this.rdCalculado[parte] = 0;
        });
        
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
            const verificar = () => {
                if (window.sistemaEquipamentos && 
                    window.sistemaEquipamentos.equipamentosAdquiridos) {
                    console.log('✅ Sistema de equipamentos detectado');
                    resolve();
                } else {
                    setTimeout(verificar, 100);
                }
            };
            verificar();
        });
    }
    
    inicializar() {
        console.log('🚀 Iniciando RD...');
        
        // 1. Configurar observador
        document.addEventListener('equipamentosAtualizados', () => {
            setTimeout(() => {
                this.calcularRDAutomatico();
                this.atualizarInterface();
            }, 100);
        });
        
        // 2. Calcular RD inicial
        setTimeout(() => {
            this.calcularRDAutomatico();
            this.atualizarInterface();
        }, 500);
        
        console.log('✅ Sistema RD pronto!');
    }
    
    // MÉTODO PRINCIPAL - Versão simplificada e mais robusta
    calcularRDAutomatico() {
        console.log('🧮 Calculando RD automático...');
        
        // Reset
        this.partesCorpo.forEach(parte => {
            this.rdCalculado[parte] = 0;
        });
        
        if (!window.sistemaEquipamentos) {
            console.warn('⚠️ Sistema de equipamentos não encontrado');
            return;
        }
        
        // DEBUG: Mostrar todos os itens adquiridos
        console.log('🔍 Todos os itens adquiridos:', window.sistemaEquipamentos.equipamentosAdquiridos);
        
        // Procurar itens NO CORPO
        const itensNoCorpo = window.sistemaEquipamentos.equipamentosAdquiridos.filter(item => {
            const estaNoCorpo = item.status === 'no-corpo';
            const temRD = item.rd !== undefined && item.rd !== null;
            const temLocal = item.local !== undefined;
            
            console.log(`📦 Item: ${item.nome}, Status: ${item.status}, RD: ${item.rd}, Local: ${item.local}`);
            
            return estaNoCorpo && (temRD || temLocal);
        });
        
        console.log(`🎯 ${itensNoCorpo.length} item(s) no corpo com RD detectado(s):`, itensNoCorpo);
        
        // Processar cada item
        itensNoCorpo.forEach(item => {
            this.processarItemArmadura(item);
        });
        
        this.atualizarTotal();
    }
    
    processarItemArmadura(item) {
        console.log(`🛡️ Processando: ${item.nome}`, item);
        
        // Extrair valor de RD
        let rdValor = 0;
        
        if (typeof item.rd === 'number') {
            rdValor = item.rd;
        } else if (typeof item.rd === 'string') {
            // Tentar extrair número da string
            const match = item.rd.match(/(\d+)/);
            rdValor = match ? parseInt(match[1]) : 0;
        }
        
        if (rdValor === 0) {
            console.log(`⚠️ ${item.nome} sem valor de RD válido:`, item.rd);
            return;
        }
        
        // Determinar partes protegidas - VERSÃO MAIS FLEXÍVEL
        const partes = this.determinarPartesProtegidasFlex(item);
        
        console.log(`📊 ${item.nome} (RD ${rdValor}) protege:`, partes);
        
        // Aplicar RD
        partes.forEach(parte => {
            if (this.rdCalculado[parte] !== undefined) {
                this.rdCalculado[parte] += rdValor;
            }
        });
    }
    
    determinarPartesProtegidasFlex(item) {
        const partes = [];
        const local = item.local || '';
        const nome = item.nome || '';
        
        console.log(`🔍 Determinando partes para: ${nome} (Local: "${local}")`);
        
        // Converter para minúsculas sem acentos para comparação
        const localLower = this.removerAcentos(local.toLowerCase());
        const nomeLower = this.removerAcentos(nome.toLowerCase());
        
        // 1. Verificar por local específico
        if (local) {
            // "Tronco/Virilha" ou "Tronco/Virilha"
            if (localLower.includes('tronco') && localLower.includes('virilha')) {
                partes.push('tronco', 'virilha');
            }
            // "Cabeça"
            else if (localLower.includes('cabeça') || localLower.includes('cabeca')) {
                partes.push('cabeca', 'crânio', 'rosto');
            }
            // "Braços"
            else if (localLower.includes('braço') || localLower.includes('braco')) {
                partes.push('bracos');
            }
            // "Pernas"
            else if (localLower.includes('perna')) {
                partes.push('pernas');
            }
            // "Mãos"
            else if (localLower.includes('mão') || localLower.includes('mao')) {
                partes.push('maos');
            }
            // "Pés"
            else if (localLower.includes('pé') || localLower.includes('pe')) {
                partes.push('pes');
            }
        }
        
        // 2. Se não encontrou por local, tentar por nome
        if (partes.length === 0) {
            if (nomeLower.includes('elmo') || nomeLower.includes('capacete') || nomeLower.includes('helm')) {
                partes.push('cabeca', 'crânio', 'rosto');
            }
            else if (nomeLower.includes('couro') || nomeLower.includes('cota') || nomeLower.includes('peitoral') || nomeLower.includes('armadura')) {
                if (nomeLower.includes('virilha') || nomeLower.includes('inteira') || nomeLower.includes('completa')) {
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
        }
        
        // 3. Remover duplicatas
        return [...new Set(partes)];
    }
    
    removerAcentos(texto) {
        return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    
    atualizarTotal() {
        let total = 0;
        
        this.partesCorpo.forEach(parte => {
            total += this.rdCalculado[parte] || 0;
        });
        
        const rdTotalElement = document.getElementById('rdTotal');
        if (rdTotalElement) {
            rdTotalElement.textContent = total;
            console.log(`💰 RD Total atualizado: ${total}`);
        }
        
        return total;
    }
    
    atualizarInterface() {
        this.partesCorpo.forEach(parte => {
            const rdValor = this.rdCalculado[parte] || 0;
            
            const input = document.querySelector(`.rd-parte[data-parte="${parte}"] input`);
            const container = document.querySelector(`.rd-parte[data-parte="${parte}"]`);
            
            if (input && container) {
                input.value = rdValor;
                
                // Destacar visualmente
                container.classList.toggle('tem-rd', rdValor > 0);
                
                if (rdValor > 0) {
                    console.log(`🎨 ${parte}: RD ${rdValor}`);
                }
            }
        });
        
        console.log('✅ Interface RD atualizada');
    }
}

// Inicialização imediata
document.addEventListener('DOMContentLoaded', function() {
    console.log('📦 Carregando Sistema RD...');
    
    // Inicializar imediatamente se a aba combate existir
    const abaCombate = document.getElementById('combate');
    if (abaCombate && !window.sistemaRD) {
        console.log('🎯 Inicializando RD agora...');
        window.sistemaRD = new SistemaRD();
        
        // Forçar cálculo após 1 segundo (tempo para sistemas carregarem)
        setTimeout(() => {
            if (window.sistemaRD.calcularRDAutomatico) {
                window.sistemaRD.calcularRDAutomatico();
                window.sistemaRD.atualizarInterface();
            }
        }, 1000);
    }
});

// Função de debug para testar manualmente
window.testarRD = function() {
    console.log('🧪 Testando RD...');
    if (window.sistemaRD) {
        console.log('📊 RD Atual:', window.sistemaRD.rdCalculado);
        console.log('💰 RD Total:', window.sistemaRD.atualizarTotal());
        
        // Mostrar itens no corpo
        if (window.sistemaEquipamentos) {
            const itensNoCorpo = window.sistemaEquipamentos.equipamentosAdquiridos.filter(item => 
                item.status === 'no-corpo'
            );
            console.log('👕 Itens no corpo:', itensNoCorpo);
        }
    }
};

console.log('🔧 sistema-rd.js (debug) carregado!');
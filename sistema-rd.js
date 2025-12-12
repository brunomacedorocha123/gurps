// sistema-rd.js - Sistema Automático de Resistência a Dano
// Versão completa e funcional

class SistemaRD {
    constructor() {
        console.log('🛡️ Inicializando Sistema de Resistência a Dano...');
        
        // Partes do corpo (corrigido: rosto em vez de órgãos)
        this.partesCorpo = [
            'cabeca', 'tronco', 'rosto', 'crânio', 'pescoco',
            'virilha', 'bracos', 'pernas', 'maos', 'pes'
        ];
        
        // Mapeamento CORRETO baseado no seu catálogo
        this.mapeamentoArmaduras = {
            // Armadura de Couro: Tronco/Virilha, RD 2
            'Tronco/Virilha': ['tronco', 'virilha'],
            
            // Elmo de Bronze: Cabeça, RD 3
            'Cabeça': ['cabeca', 'crânio', 'rosto'],
            
            // Braçadeiras de Bronze: Braços, RD 3
            'Braços': ['bracos'],
            
            // Pernas
            'Pernas': ['pernas'],
            
            // Mãos
            'Mãos': ['maos'],
            
            // Pés
            'Pés': ['pes'],
            
            // Armadura completa
            'Corpo Inteiro': ['tronco', 'virilha', 'bracos', 'pernas', 'cabeca', 'crânio', 'rosto']
        };
        
        // Cache do RD calculado
        this.rdCalculado = {};
        this.partesCorpo.forEach(parte => {
            this.rdCalculado[parte] = 0;
        });
        
        this.inicializado = false;
        
        // Inicializar quando pronto
        this.inicializarQuandoPronto();
    }
    
    async inicializarQuandoPronto() {
        // Esperar DOM carregar
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }
        
        // Esperar sistema de equipamentos
        await this.aguardarSistemaEquipamentos();
        
        // Inicializar
        this.inicializar();
    }
    
    aguardarSistemaEquipamentos() {
        return new Promise((resolve) => {
            let tentativas = 0;
            const verificar = () => {
                tentativas++;
                if (window.sistemaEquipamentos && 
                    window.sistemaEquipamentos.equipamentosAdquiridos) {
                    console.log('✅ Sistema de equipamentos detectado');
                    resolve();
                } else if (tentativas < 50) {
                    setTimeout(verificar, 100);
                } else {
                    console.warn('⚠️ Sistema de equipamentos não encontrado após tentativas');
                    resolve();
                }
            };
            verificar();
        });
    }
    
    inicializar() {
        try {
            console.log('🚀 Inicializando Sistema RD...');
            
            // 1. Limpar eventos conflitantes
            this.limparEventosConflitantes();
            
            // 2. Configurar observador de equipamentos
            this.configurarObservadorEquipamentos();
            
            // 3. Configurar eventos dos campos RD
            this.configurarEventosCamposRD();
            
            // 4. Calcular RD inicial
            setTimeout(() => {
                this.calcularRDAutomatico();
                this.atualizarInterfaceRD();
            }, 300);
            
            // 5. Adicionar botão de reset
            this.adicionarBotaoReset();
            
            // 6. Forçar cálculo após 2 segundos (tempo extra para carregamento)
            setTimeout(() => {
                this.calcularRDAutomatico();
                this.atualizarInterfaceRD();
            }, 2000);
            
            this.inicializado = true;
            console.log('✅ Sistema RD inicializado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar Sistema RD:', error);
        }
    }
    
    limparEventosConflitantes() {
        // Remover a função global calcularRDTotal se existir
        if (window.calcularRDTotal) {
            console.log('🔄 Substituindo função calcularRDTotal global');
            window.calcularRDTotal = () => {
                // Usar nosso sistema
                if (window.sistemaRD) {
                    return window.sistemaRD.atualizarTotalRD();
                }
                return 0;
            };
        }
        
        // Remover onchange dos inputs que podem conflitar
        document.querySelectorAll('.rd-input').forEach(input => {
            // Guardar o valor original do onchange
            const originalOnChange = input.onchange;
            if (originalOnChange) {
                console.log('🔄 Removendo onchange conflitante');
                input.onchange = null;
            }
        });
    }
    
    configurarObservadorEquipamentos() {
        // Observar eventos do sistema de equipamentos
        document.addEventListener('equipamentosAtualizados', () => {
            console.log('📦 Evento equipamentosAtualizados detectado');
            setTimeout(() => {
                this.calcularRDAutomatico();
                this.atualizarInterfaceRD();
            }, 100);
        });
        
        // Se o sistemaEquipamentos tiver método de notificação, conectamos
        if (window.sistemaEquipamentos) {
            console.log('🔗 Conectando ao sistemaEquipamentos...');
            
            // Sobrescrever métodos que atualizam a interface
            const originalAtualizarInterface = window.sistemaEquipamentos.atualizarInterface;
            if (originalAtualizarInterface) {
                window.sistemaEquipamentos.atualizarInterface = function() {
                    // Executar original
                    const resultado = originalAtualizarInterface.apply(this, arguments);
                    
                    // Notificar sistema RD
                    setTimeout(() => {
                        if (window.sistemaRD) {
                            window.sistemaRD.calcularRDAutomatico();
                            window.sistemaRD.atualizarInterfaceRD();
                        }
                    }, 150);
                    
                    return resultado;
                };
            }
        }
    }
    
    configurarEventosCamposRD() {
        // Para cada parte do corpo, configurar eventos apropriados
        this.partesCorpo.forEach(parte => {
            const input = document.querySelector(`.rd-parte[data-parte="${parte}"] input`);
            if (input) {
                // Clonar input para limpar event listeners
                const novoInput = input.cloneNode(true);
                input.parentNode.replaceChild(novoInput, input);
                
                // Configurar nosso evento
                novoInput.addEventListener('change', (e) => {
                    const valor = parseInt(e.target.value) || 0;
                    this.rdCalculado[parte] = valor;
                    this.atualizarTotalRD();
                    
                    // Marcar como editado manualmente
                    e.target.classList.add('editado-manual');
                    e.target.title = 'Valor editado manualmente';
                });
                
                novoInput.addEventListener('input', (e) => {
                    // Feedback visual durante edição
                    e.target.style.backgroundColor = 'rgba(155, 89, 182, 0.2)';
                });
                
                novoInput.addEventListener('blur', (e) => {
                    e.target.style.backgroundColor = '';
                });
            }
        });
    }
    
    adicionarBotaoReset() {
        // Criar botão de reset
        const botaoReset = document.createElement('button');
        botaoReset.className = 'btn-rd-reset';
        botaoReset.innerHTML = '<i class="fas fa-sync-alt"></i> Recalcular RD';
        botaoReset.title = 'Recalcular RD automaticamente com base nos equipamentos no corpo';
        
        botaoReset.addEventListener('click', () => {
            this.calcularRDAutomatico();
            this.atualizarInterfaceRD();
            this.mostrarFeedback('RD recalculado com base nos equipamentos!', 'info');
        });
        
        // Adicionar ao cabeçalho do card RD
        const cardHeader = document.querySelector('.card-rd .card-header');
        if (cardHeader) {
            // Verificar se já não existe
            if (!cardHeader.querySelector('.btn-rd-reset')) {
                cardHeader.appendChild(botaoReset);
            }
        }
    }
    
    // MÉTODO PRINCIPAL: Calcular RD com base nos equipamentos NO CORPO
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
        
        // Obter itens NO CORPO (status: 'no-corpo')
        const itensNoCorpo = window.sistemaEquipamentos.equipamentosAdquiridos.filter(item => 
            item.status === 'no-corpo'
        );
        
        console.log(`🔍 ${itensNoCorpo.length} item(s) no corpo detectado(s)`);
        
        // Processar cada item no corpo
        itensNoCorpo.forEach(item => {
            this.processarArmadura(item);
        });
        
        console.log('📊 RD calculado:', this.rdCalculado);
    }
    
    processarArmadura(armadura) {
        if (!armadura) return;
        
        // Verificar se é uma armadura (tem RD ou local)
        const temRD = armadura.rd !== undefined && armadura.rd !== null;
        const temLocal = armadura.local !== undefined;
        
        if (!temRD && !temLocal) {
            return; // Não é uma armadura
        }
        
        // Obter valor de RD
        let rdValor = 0;
        
        if (typeof armadura.rd === 'number') {
            rdValor = armadura.rd;
        } else if (typeof armadura.rd === 'string') {
            // Formato "4/2" ou similar
            const partes = armadura.rd.toString().split('/');
            rdValor = parseInt(partes[0]) || 0;
        }
        
        if (rdValor === 0) {
            console.log(`⚠️ ${armadura.nome} sem valor de RD válido`);
            return;
        }
        
        // Determinar quais partes do corpo são protegidas
        const partesProtegidas = this.determinarPartesProtegidas(armadura);
        
        console.log(`📊 ${armadura.nome} (RD ${rdValor}) protege: ${partesProtegidas.join(', ')}`);
        
        // Aplicar RD às partes protegidas
        partesProtegidas.forEach(parte => {
            // Verificar se a parte existe no nosso mapeamento
            if (this.rdCalculado[parte] !== undefined) {
                this.rdCalculado[parte] += rdValor;
            }
        });
    }
    
    determinarPartesProtegidas(armadura) {
        const partes = [];
        
        // 1. Usar mapeamento direto se o local estiver no nosso mapeamento
        if (armadura.local && this.mapeamentoArmaduras[armadura.local]) {
            return this.mapeamentoArmaduras[armadura.local];
        }
        
        // 2. Inferir por palavras-chave no local
        if (armadura.local) {
            const localLower = armadura.local.toLowerCase();
            
            if (localLower.includes('tronco')) {
                partes.push('tronco');
                if (localLower.includes('virilha')) {
                    partes.push('virilha');
                }
            }
            else if (localLower.includes('cabeça') || localLower.includes('cabeca')) {
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
        
        // 3. Se ainda não encontrou, tentar inferir pelo nome
        if (partes.length === 0 && armadura.nome) {
            const nomeLower = armadura.nome.toLowerCase();
            
            if (nomeLower.includes('elmo') || nomeLower.includes('capacete') || nomeLower.includes('helm')) {
                partes.push('cabeca', 'crânio', 'rosto');
            }
            else if (nomeLower.includes('couro') || nomeLower.includes('cota') || nomeLower.includes('armadura')) {
                if (nomeLower.includes('virilha') || nomeLower.includes('completa')) {
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
            else if (nomeLower.includes('bota') || nomeLower.includes('sapat')) {
                partes.push('pes');
            }
        }
        
        // Remover duplicatas
        return [...new Set(partes)];
    }
    
    atualizarTotalRD() {
        let total = 0;
        
        this.partesCorpo.forEach(parte => {
            total += this.rdCalculado[parte] || 0;
        });
        
        // Atualizar display do total
        const rdTotalElement = document.getElementById('rdTotal');
        if (rdTotalElement) {
            rdTotalElement.textContent = total;
            
            // Destacar visualmente se tiver RD
            if (total > 0) {
                rdTotalElement.classList.add('com-protecao');
                rdTotalElement.title = `Resistência a Dano Total: ${total}`;
            } else {
                rdTotalElement.classList.remove('com-protecao');
                rdTotalElement.title = 'Sem proteção de armadura';
            }
        }
        
        return total;
    }
    
    atualizarInterfaceRD() {
        console.log('🎨 Atualizando interface RD...');
        
        // Para cada parte do corpo
        this.partesCorpo.forEach(parte => {
            const rdValor = this.rdCalculado[parte] || 0;
            
            // Encontrar elementos
            const input = document.querySelector(`.rd-parte[data-parte="${parte}"] input`);
            const container = document.querySelector(`.rd-parte[data-parte="${parte}"]`);
            
            if (input && container) {
                // Atualizar valor do input
                input.value = rdValor;
                
                // Verificar se foi editado manualmente
                const editadoManual = input.classList.contains('editado-manual');
                
                // Aplicar classes visuais
                container.classList.remove('sem-rd', 'rd-baixo', 'rd-medio', 'rd-alto', 'editado-manualmente');
                
                if (editadoManual) {
                    container.classList.add('editado-manualmente');
                    container.title = 'Valor editado manualmente';
                } else if (rdValor === 0) {
                    container.classList.add('sem-rd');
                    container.title = 'Sem proteção';
                } else if (rdValor <= 2) {
                    container.classList.add('rd-baixo');
                    container.title = `Proteção leve: RD ${rdValor}`;
                } else if (rdValor <= 5) {
                    container.classList.add('rd-medio');
                    container.title = `Proteção média: RD ${rdValor}`;
                } else {
                    container.classList.add('rd-alto');
                    container.title = `Proteção pesada: RD ${rdValor}`;
                }
                
                // Adicionar badge visual se tiver RD
                let badge = container.querySelector('.rd-badge');
                if (!badge && rdValor > 0) {
                    badge = document.createElement('span');
                    badge.className = 'rd-badge';
                    container.appendChild(badge);
                }
                
                if (badge) {
                    if (rdValor > 0) {
                        badge.textContent = `RD ${rdValor}`;
                        badge.style.display = 'inline-block';
                    } else {
                        badge.style.display = 'none';
                    }
                }
            }
        });
        
        // Atualizar total
        this.atualizarTotalRD();
        
        // Notificar outros sistemas
        this.notificarMudancaRD();
        
        console.log('✅ Interface RD atualizada');
    }
    
    notificarMudancaRD() {
        // Disparar evento para outros sistemas saberem que o RD mudou
        const event = new CustomEvent('rdAtualizado', {
            detail: {
                rdCalculado: this.rdCalculado,
                rdTotal: this.atualizarTotalRD(),
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(event);
    }
    
    mostrarFeedback(mensagem, tipo = 'info') {
        console.log(`📢 ${mensagem}`);
        
        // Feedback visual simples
        const feedback = document.createElement('div');
        feedback.className = `feedback-rd feedback-${tipo}`;
        feedback.innerHTML = `<i class="fas fa-info-circle"></i> ${mensagem}`;
        feedback.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${tipo === 'sucesso' ? '#27ae60' : tipo === 'erro' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 9999;
            font-weight: bold;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 3000);
    }
    
    // Método para debug
    mostrarDebug() {
        console.group('🔍 DEBUG Sistema RD');
        console.log('📊 RD Calculado:', this.rdCalculado);
        console.log('🧮 RD Total:', this.atualizarTotalRD());
        
        if (window.sistemaEquipamentos) {
            const itensNoCorpo = window.sistemaEquipamentos.equipamentosAdquiridos.filter(item => 
                item.status === 'no-corpo'
            );
            console.log('👕 Itens no corpo:', itensNoCorpo);
        }
        console.groupEnd();
    }
}

// ========== INICIALIZAÇÃO GLOBAL ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('📦 Carregando Sistema RD...');
    
    // Verificar se já foi inicializado
    if (window.sistemaRD) {
        console.log('⚠️ Sistema RD já inicializado, evitando duplicação');
        return;
    }
    
    // Inicializar quando a aba de combate existir
    const inicializarQuandoNecessario = () => {
        const abaCombate = document.getElementById('combate');
        
        if (abaCombate && !window.sistemaRD) {
            console.log('🎯 Aba de combate detectada, inicializando Sistema RD...');
            window.sistemaRD = new SistemaRD();
        }
    };
    
    // Verificar inicialmente
    inicializarQuandoNecessario();
    
    // Observar mudanças nas abas
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'combate' && tab.classList.contains('active')) {
                    console.log('⚔️ Aba de combate ativada');
                    setTimeout(inicializarQuandoNecessario, 100);
                }
            }
        });
    });
    
    // Observar todas as abas
    document.querySelectorAll('.tab-content').forEach(tab => {
        observer.observe(tab, { attributes: true });
    });
    
    // Se já estiver na aba de combate
    const abaCombateAtiva = document.querySelector('#combate.active');
    if (abaCombateAtiva) {
        setTimeout(inicializarQuandoNecessario, 500);
    }
});

// ========== FUNÇÕES GLOBAIS DE CONVENIÊNCIA ==========
window.calcularRDAutomatico = function() {
    if (window.sistemaRD && window.sistemaRD.calcularRDAutomatico) {
        window.sistemaRD.calcularRDAutomatico();
        window.sistemaRD.atualizarInterfaceRD();
        return true;
    }
    return false;
};

window.obterRDTotal = function() {
    if (window.sistemaRD && window.sistemaRD.atualizarTotalRD) {
        return window.sistemaRD.atualizarTotalRD();
    }
    return 0;
};

window.debugRD = function() {
    if (window.sistemaRD && window.sistemaRD.mostrarDebug) {
        window.sistemaRD.mostrarDebug();
    }
};

// Exportar a classe globalmente
window.SistemaRD = SistemaRD;

console.log('🔧 sistema-rd.js (versão completa) carregado!');
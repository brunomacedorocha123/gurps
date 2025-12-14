// sistema-rd.js - Sistema Automático de Resistência a Dano

class SistemaRD {
    constructor() {
        this.partesCorpo = [
            'cabeca', 'tronco', 'rosto', 'crânio', 'pescoco',
            'virilha', 'bracos', 'pernas', 'maos', 'pes'
        ];
        
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
                if (window.sistemaEquipamentos && 
                    window.sistemaEquipamentos.equipamentosAdquiridos) {
                    resolve();
                } else if (tentativas < 50) {
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
            this.limparEventosConflitantes();
            this.configurarObservadorEquipamentos();
            this.configurarEventosCamposRD();
            
            setTimeout(() => {
                this.calcularRDAutomatico();
                this.atualizarInterfaceRD();
            }, 300);
            
            this.adicionarBotaoReset();
            
            setTimeout(() => {
                this.calcularRDAutomatico();
                this.atualizarInterfaceRD();
            }, 2000);
            
            this.inicializado = true;
            
        } catch (error) {
            // Silencioso
        }
    }
    
    limparEventosConflitantes() {
        if (window.calcularRDTotal) {
            window.calcularRDTotal = () => {
                if (window.sistemaRD) {
                    return window.sistemaRD.atualizarTotalRD();
                }
                return 0;
            };
        }
        
        document.querySelectorAll('.rd-input').forEach(input => {
            const originalOnChange = input.onchange;
            if (originalOnChange) {
                input.onchange = null;
            }
        });
    }
    
    configurarObservadorEquipamentos() {
        document.addEventListener('equipamentosAtualizados', () => {
            setTimeout(() => {
                this.calcularRDAutomatico();
                this.atualizarInterfaceRD();
            }, 100);
        });
        
        if (window.sistemaEquipamentos) {
            const originalAtualizarInterface = window.sistemaEquipamentos.atualizarInterface;
            if (originalAtualizarInterface) {
                window.sistemaEquipamentos.atualizarInterface = function() {
                    const resultado = originalAtualizarInterface.apply(this, arguments);
                    
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
        this.partesCorpo.forEach(parte => {
            const input = document.querySelector(`.rd-parte[data-parte="${parte}"] input`);
            if (input) {
                const novoInput = input.cloneNode(true);
                input.parentNode.replaceChild(novoInput, input);
                
                novoInput.addEventListener('change', (e) => {
                    const valor = parseInt(e.target.value) || 0;
                    this.rdCalculado[parte] = valor;
                    this.atualizarTotalRD();
                    e.target.classList.add('editado-manual');
                    e.target.title = 'Valor editado manualmente';
                });
                
                novoInput.addEventListener('input', (e) => {
                    e.target.style.backgroundColor = 'rgba(155, 89, 182, 0.2)';
                });
                
                novoInput.addEventListener('blur', (e) => {
                    e.target.style.backgroundColor = '';
                });
            }
        });
    }
    
    adicionarBotaoReset() {
        const botaoReset = document.createElement('button');
        botaoReset.className = 'btn-rd-reset';
        botaoReset.innerHTML = '<i class="fas fa-sync-alt"></i> Recalcular RD';
        botaoReset.title = 'Recalcular RD automaticamente com base nos equipamentos no corpo';
        
        botaoReset.addEventListener('click', () => {
            this.calcularRDAutomatico();
            this.atualizarInterfaceRD();
            this.mostrarFeedback('RD recalculado com base nos equipamentos!', 'info');
        });
        
        const cardHeader = document.querySelector('.card-rd .card-header');
        if (cardHeader) {
            if (!cardHeader.querySelector('.btn-rd-reset')) {
                cardHeader.appendChild(botaoReset);
            }
        }
    }
    
    calcularRDAutomatico() {
        this.partesCorpo.forEach(parte => {
            this.rdCalculado[parte] = 0;
        });
        
        if (!window.sistemaEquipamentos) {
            return;
        }
        
        const itensNoCorpo = window.sistemaEquipamentos.equipamentosAdquiridos.filter(item => 
            item.status === 'no-corpo'
        );
        
        itensNoCorpo.forEach(item => {
            this.processarArmadura(item);
        });
    }
    
    processarArmadura(armadura) {
        if (!armadura) return;
        
        const temRD = armadura.rd !== undefined && armadura.rd !== null;
        const temLocal = armadura.local !== undefined;
        
        if (!temRD && !temLocal) {
            return;
        }
        
        let rdValor = 0;
        
        if (typeof armadura.rd === 'number') {
            rdValor = armadura.rd;
        } else if (typeof armadura.rd === 'string') {
            const partes = armadura.rd.toString().split('/');
            rdValor = parseInt(partes[0]) || 0;
        }
        
        if (rdValor === 0) {
            return;
        }
        
        const partesProtegidas = this.determinarPartesProtegidas(armadura);
        
        partesProtegidas.forEach(parte => {
            if (this.rdCalculado[parte] !== undefined) {
                this.rdCalculado[parte] += rdValor;
            }
        });
    }
    
    determinarPartesProtegidas(armadura) {
        const partes = [];
        
        if (armadura.local && this.mapeamentoArmaduras[armadura.local]) {
            return this.mapeamentoArmaduras[armadura.local];
        }
        
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
        
        return [...new Set(partes)];
    }
    
    atualizarTotalRD() {
        let total = 0;
        
        this.partesCorpo.forEach(parte => {
            total += this.rdCalculado[parte] || 0;
        });
        
        const rdTotalElement = document.getElementById('rdTotal');
        if (rdTotalElement) {
            rdTotalElement.textContent = total;
            
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
        this.partesCorpo.forEach(parte => {
            const rdValor = this.rdCalculado[parte] || 0;
            
            const input = document.querySelector(`.rd-parte[data-parte="${parte}"] input`);
            const container = document.querySelector(`.rd-parte[data-parte="${parte}"]`);
            
            if (input && container) {
                input.value = rdValor;
                const editadoManual = input.classList.contains('editado-manual');
                
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
        
        this.atualizarTotalRD();
        this.notificarMudancaRD();
    }
    
    notificarMudancaRD() {
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
}

document.addEventListener('DOMContentLoaded', function() {
    if (window.sistemaRD) {
        return;
    }
    
    const inicializarQuandoNecessario = () => {
        const abaCombate = document.getElementById('combate');
        
        if (abaCombate && !window.sistemaRD) {
            window.sistemaRD = new SistemaRD();
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

window.SistemaRD = SistemaRD;
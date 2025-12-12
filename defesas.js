// defesas.js - SISTEMA LIMPO DE DEFESAS (SEM POLUIÇÃO VISUAL)
class SistemaDefesas {
    constructor() {
        this.defesas = {
            esquiva: { base: 0, modificador: 0, bonus: 0, total: 0 },
            bloqueio: { base: 0, modificador: 0, bonus: 0, total: 0 },
            aparar: { base: 0, modificador: 0, bonus: 0, total: 0 },
            deslocamento: { base: 0, modificador: 0, bonus: 0, total: 0 }
        };
        
        this.DX = 10;
        this.HT = 10;
        this.nivelCarga = 'nenhuma';
        this.armaEquipada = null;
        this.escudoEquipado = null;
        this.periciaEscudo = null;
        this.periciaArma = null;
        this.totalBonus = 0;
        
        // Redutores aplicados SILENCIOSAMENTE
        this.redutoresCarga = {
            'nenhuma': 0,
            'leve': -1,
            'média': -2,
            'pesada': -3,
            'muito pesada': -4
        };
    }

    // ===== MÉTODOS PRINCIPAIS =====
    inicializar() {
        this.configurarEventListeners();
        this.configurarControlesManuais();
        this.atualizarTodosDadosExternos();
        this.calcularTodasDefesas();
    }

    configurarEventListeners() {
        // Ouvir atributos
        document.addEventListener('atributosAlterados', (e) => {
            if (e.detail) {
                this.DX = e.detail.DX || 10;
                this.HT = e.detail.HT || 10;
                this.calcularTodasDefesas();
            }
        });

        // Ouvir equipamentos
        document.addEventListener('equipamentosAtualizados', () => {
            this.atualizarDadosEquipamentos();
            this.calcularTodasDefesas();
        });

        // Monitorar nível de carga silenciosamente
        this.configurarObservadorCargaSilencioso();
    }

    configurarObservadorCargaSilencioso() {
        // Observa mudanças no elemento de nível de carga SEM fazer barulho
        const observer = new MutationObserver(() => {
            const nivelCargaElement = document.getElementById('nivelCarga');
            if (nivelCargaElement) {
                const novoNivel = nivelCargaElement.textContent.toLowerCase().trim();
                if (novoNivel !== this.nivelCarga) {
                    this.nivelCarga = novoNivel;
                    this.calcularTodasDefesas(); // Recalcula silenciosamente
                }
            }
        });

        const nivelCargaElement = document.getElementById('nivelCarga');
        if (nivelCargaElement) {
            observer.observe(nivelCargaElement, { 
                childList: true, 
                characterData: true 
            });
        }
    }

    configurarControlesManuais() {
        // Configurar botões +/- de forma limpa
        const defesasIds = ['esquiva', 'bloqueio', 'aparar', 'deslocamento'];
        
        defesasIds.forEach(defesaId => {
            const modInput = document.getElementById(`${defesaId}Mod`);
            const container = modInput?.parentElement;
            
            if (container) {
                // Encontrar botões
                const minusBtn = container.querySelector('.minus');
                const plusBtn = container.querySelector('.plus');
                
                if (minusBtn && plusBtn) {
                    // Configurar eventos
                    minusBtn.onclick = () => this.alterarModificador(defesaId, -1);
                    plusBtn.onclick = () => this.alterarModificador(defesaId, 1);
                }
                
                // Input manual
                modInput.addEventListener('change', (e) => {
                    this.defesas[defesaId].modificador = parseInt(e.target.value) || 0;
                    this.calcularTodasDefesas();
                });
            }
        });

        // Bônus gerais (Reflexos, Escudo, Capa, Outros)
        ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonusId => {
            const input = document.getElementById(`bonus${bonusId}`);
            if (input) {
                input.addEventListener('change', () => {
                    this.atualizarBonusGerais();
                    this.calcularTodasDefesas();
                });
            }
        });
    }

    alterarModificador(defesaId, valor) {
        const modInput = document.getElementById(`${defesaId}Mod`);
        if (!modInput) return;
        
        const atual = parseInt(modInput.value) || 0;
        const novoValor = atual + valor;
        modInput.value = novoValor;
        
        this.defesas[defesaId].modificador = novoValor;
        this.calcularTodasDefesas();
    }

    atualizarBonusGerais() {
        let total = 0;
        total += parseInt(document.getElementById('bonusReflexos')?.value) || 0;
        total += parseInt(document.getElementById('bonusEscudo')?.value) || 0;
        total += parseInt(document.getElementById('bonusCapa')?.value) || 0;
        total += parseInt(document.getElementById('bonusOutros')?.value) || 0;
        
        this.totalBonus = total;
        
        // Atualizar apenas o número do total
        const totalElement = document.getElementById('totalBonus');
        if (totalElement) {
            totalElement.textContent = total >= 0 ? `+${total}` : `${total}`;
        }
    }

    // ===== ATUALIZAR DADOS EXTERNOS =====
    atualizarTodosDadosExternos() {
        // Atributos
        const dxInput = document.getElementById('DX');
        const htInput = document.getElementById('HT');
        if (dxInput && htInput) {
            this.DX = parseInt(dxInput.value) || 10;
            this.HT = parseInt(htInput.value) || 10;
        }
        
        // Nível de carga (silenciosamente)
        const cargaElement = document.getElementById('nivelCarga');
        if (cargaElement) {
            this.nivelCarga = cargaElement.textContent.toLowerCase().trim();
        }
        
        // Equipamentos
        this.atualizarDadosEquipamentos();
        
        // Perícias
        this.atualizarDadosPericias();
    }

    atualizarDadosEquipamentos() {
        const sistemaEquip = window.sistemaEquipamentos;
        if (sistemaEquip) {
            this.armaEquipada = sistemaEquip.armasCombate?.maos[0] || null;
            this.escudoEquipado = sistemaEquip.escudoCombate;
        }
    }

    atualizarDadosPericias() {
        const estadoPericias = window.estadoPericias;
        if (estadoPericias?.periciasAprendidas) {
            // Perícia de Escudo
            this.periciaEscudo = estadoPericias.periciasAprendidas.find(p => 
                p.nome?.toLowerCase().includes('escudo')
            );
            
            // Perícia da Arma (busca simplificada)
            if (this.armaEquipada) {
                const nomeArma = this.armaEquipada.nome.toLowerCase();
                this.periciaArma = estadoPericias.periciasAprendidas.find(p => {
                    if (p.categoria !== 'Combate') return false;
                    const nomePericia = p.nome.toLowerCase();
                    return nomeArma.includes(nomePericia.split(' ')[0].toLowerCase());
                });
            }
        }
    }

    // ===== CÁLCULOS LIMPOS =====
    calcularTodasDefesas() {
        this.calcularEsquiva();
        this.calcularDeslocamento();
        this.calcularBloqueio();
        this.calcularAparar();
        this.atualizarInterface();
    }

    calcularEsquiva() {
        // HT + DX/4 + 3 (arredonda pra baixo) + bônus + modificador - redutorCarga
        const base = Math.floor(this.HT + (this.DX / 4) + 3);
        const redutorCarga = this.redutoresCarga[this.nivelCarga] || 0;
        
        this.defesas.esquiva.base = base;
        this.defesas.esquiva.total = Math.max(
            base + 
            this.totalBonus + 
            this.defesas.esquiva.modificador + 
            redutorCarga,
            1
        );
    }

    calcularDeslocamento() {
        // (DX + HT)/4 + bônus + modificador - redutorCarga (SEM +3!)
        const base = (this.DX + this.HT) / 4;
        const redutorCarga = this.redutoresCarga[this.nivelCarga] || 0;
        
        this.defesas.deslocamento.base = base;
        this.defesas.deslocamento.total = Math.max(
            base + 
            this.totalBonus + 
            this.defesas.deslocamento.modificador + 
            redutorCarga,
            0
        );
    }

    calcularBloqueio() {
        // NH_Escudo/2 + 3 (arredonda pra baixo) + bônus + modificador
        let base = 3; // Mínimo sem perícia
        
        if (this.periciaEscudo && this.escudoEquipado) {
            const nhEscudo = this.periciaEscudo.nh || (this.periciaEscudo.nivel + 10);
            base = Math.floor(nhEscudo / 2) + 3;
        }
        
        this.defesas.bloqueio.base = base;
        this.defesas.bloqueio.total = Math.max(
            base + 
            this.totalBonus + 
            this.defesas.bloqueio.modificador,
            1
        );
    }

    calcularAparar() {
        // NH_Arma/2 + 3 (arredonda pra baixo) + bônus + modificador
        let base = 3; // Mínimo sem perícia
        
        if (this.periciaArma && this.armaEquipada) {
            const nhArma = this.periciaArma.nh || (this.periciaArma.nivel + 10);
            base = Math.floor(nhArma / 2) + 3;
        }
        
        this.defesas.aparar.base = base;
        this.defesas.aparar.total = Math.max(
            base + 
            this.totalBonus + 
            this.defesas.aparar.modificador,
            1
        );
    }

    // ===== INTERFACE LIMPA =====
    atualizarInterface() {
        // APENAS OS NÚMEROS FINAIS - nada mais!
        document.getElementById('esquivaTotal').textContent = this.defesas.esquiva.total;
        document.getElementById('deslocamentoTotal').textContent = this.defesas.deslocamento.total.toFixed(2);
        document.getElementById('bloqueioTotal').textContent = this.defesas.bloqueio.total;
        document.getElementById('apararTotal').textContent = this.defesas.aparar.total;
        
        // Modificadores (apenas números)
        document.getElementById('esquivaMod').value = this.defesas.esquiva.modificador;
        document.getElementById('bloqueioMod').value = this.defesas.bloqueio.modificador;
        document.getElementById('apararMod').value = this.defesas.aparar.modificador;
        document.getElementById('deslocamentoMod').value = this.defesas.deslocamento.modificador;
        
        // SEM estilos, SEM indicadores, SEM poluição visual!
    }

    // ===== MÉTODOS PÚBLICOS SIMPLES =====
    obterDadosDefesas() {
        return {
            esquiva: this.defesas.esquiva.total,
            deslocamento: this.defesas.deslocamento.total,
            bloqueio: this.defesas.bloqueio.total,
            aparar: this.defesas.aparar.total
        };
    }

    forcarRecalculo() {
        this.atualizarTodosDadosExternos();
        this.calcularTodasDefesas();
    }
}

// ===== INICIALIZAÇÃO SIMPLES =====
let sistemaDefesas;

function inicializarSistemaDefesas() {
    if (!sistemaDefesas) {
        sistemaDefesas = new SistemaDefesas();
        window.sistemaDefesas = sistemaDefesas;
        
        setTimeout(() => {
            sistemaDefesas.inicializar();
        }, 1000);
    }
}

// Inicializar quando combate for aberto
document.addEventListener('DOMContentLoaded', function() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'combate' && tab.classList.contains('active')) {
                    setTimeout(() => {
                        inicializarSistemaDefesas();
                    }, 100);
                }
            }
        });
    });
    
    document.querySelectorAll('.tab-content').forEach(tab => {
        observer.observe(tab, { attributes: true });
    });
});

// Funções globais mínimas
window.obterDadosDefesas = () => window.sistemaDefesas?.obterDadosDefesas() || null;
window.forcarRecalculoDefesas = () => window.sistemaDefesas?.forcarRecalculo();

// Exportação limpa
window.SistemaDefesas = SistemaDefesas;
window.inicializarSistemaDefesas = inicializarSistemaDefesas;

console.log('✅ Sistema de Defesas carregado (versão limpa)');
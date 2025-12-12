// defesas.js - SISTEMA CORRETO DE DEFESAS
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
        
        // Redutores de carga
        this.redutoresCarga = {
            'nenhuma': 0,
            'leve': -1,
            'média': -2,
            'pesada': -3,
            'muito pesada': -4
        };
    }

    // ===== INICIALIZAÇÃO =====
    inicializar() {
        this.configurarEventListeners();
        this.configurarControlesManuais();
        this.atualizarTodosDadosExternos();
        this.calcularTodasDefesas();
    }

    // ===== CONFIGURAÇÃO DE EVENTOS =====
    configurarEventListeners() {
        // 1. Atributos alterados
        document.addEventListener('atributosAlterados', (e) => {
            if (e.detail) {
                this.DX = e.detail.DX || 10;
                this.HT = e.detail.HT || 10;
                this.calcularTodasDefesas();
            }
        });

        // 2. Equipamentos alterados
        document.addEventListener('equipamentosAtualizados', () => {
            this.atualizarDadosEquipamentos();
            this.calcularTodasDefesas();
        });

        // 3. Monitorar nível de carga silenciosamente
        this.configurarObservadorCarga();
    }

    configurarObservadorCarga() {
        const observer = new MutationObserver(() => {
            const nivelCargaElement = document.getElementById('nivelCarga');
            if (nivelCargaElement) {
                const novoNivel = nivelCargaElement.textContent.toLowerCase().trim();
                if (novoNivel !== this.nivelCarga) {
                    this.nivelCarga = novoNivel;
                    this.calcularTodasDefesas();
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

    // ===== CONTROLES MANUAIS =====
    configurarControlesManuais() {
        // Configurar botões +/- para cada defesa
        const defesasIds = ['esquiva', 'bloqueio', 'aparar', 'deslocamento'];
        
        defesasIds.forEach(defesaId => {
            const modInput = document.getElementById(`${defesaId}Mod`);
            const container = modInput?.parentElement;
            
            if (container) {
                const minusBtn = container.querySelector('.minus');
                const plusBtn = container.querySelector('.plus');
                
                if (minusBtn && plusBtn) {
                    minusBtn.onclick = () => this.alterarModificador(defesaId, -1);
                    plusBtn.onclick = () => this.alterarModificador(defesaId, 1);
                }
                
                modInput.addEventListener('change', (e) => {
                    this.defesas[defesaId].modificador = parseInt(e.target.value) || 0;
                    this.calcularTodasDefesas();
                });
            }
        });

        // Bônus gerais
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
        
        const totalElement = document.getElementById('totalBonus');
        if (totalElement) {
            totalElement.textContent = total >= 0 ? `+${total}` : `${total}`;
        }
    }

    // ===== OBTER DADOS EXTERNOS =====
    atualizarTodosDadosExternos() {
        // Atributos
        const dxInput = document.getElementById('DX');
        const htInput = document.getElementById('HT');
        if (dxInput && htInput) {
            this.DX = parseInt(dxInput.value) || 10;
            this.HT = parseInt(htInput.value) || 10;
        }
        
        // Nível de carga
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
            
            // Perícia da Arma
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

    // ===== CÁLCULOS CORRETOS =====
    calcularTodasDefesas() {
        this.calcularEsquiva();
        this.calcularDeslocamento();
        this.calcularBloqueio();
        this.calcularAparar();
        this.atualizarInterface();
    }

    calcularEsquiva() {
        // FÓRMULA CORRETA: floor((DX + HT)/4) + 3
        const baseCalculada = (this.DX + this.HT) / 4;
        const base = Math.floor(baseCalculada) + 3; // Arredonda pra baixo e soma 3
        const redutorCarga = this.redutoresCarga[this.nivelCarga] || 0;
        
        this.defesas.esquiva.base = base;
        this.defesas.esquiva.total = Math.max(
            base + 
            this.totalBonus + 
            this.defesas.esquiva.modificador + 
            redutorCarga,
            1
        );
        
        console.log(`🏃 Esquiva: floor((${this.DX}+${this.HT})/4)=${Math.floor((this.DX + this.HT) / 4)} + 3 = ${base} + ${redutorCarga} (carga) = ${this.defesas.esquiva.total}`);
    }

    calcularDeslocamento() {
        // FÓRMULA CORRETA: (DX + HT)/4 (valor exato)
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
        
        console.log(`👣 Deslocamento: (${this.DX}+${this.HT})/4=${base.toFixed(2)} + ${redutorCarga} (carga) = ${this.defesas.deslocamento.total.toFixed(2)}`);
    }

    calcularBloqueio() {
        // FÓRMULA CORRETA: floor(NH_Escudo/2) + 3
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
        
        console.log(`🛡️ Bloqueio: ${base} (base) = ${this.defesas.bloqueio.total}`);
    }

    calcularAparar() {
        // FÓRMULA CORRETA: floor(NH_Arma/2) + 3
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
        
        console.log(`⚔️ Aparar: ${base} (base) = ${this.defesas.aparar.total}`);
    }

    // ===== INTERFACE =====
    atualizarInterface() {
        // Apenas os números finais
        document.getElementById('esquivaTotal').textContent = this.defesas.esquiva.total;
        document.getElementById('deslocamentoTotal').textContent = this.defesas.deslocamento.total.toFixed(2);
        document.getElementById('bloqueioTotal').textContent = this.defesas.bloqueio.total;
        document.getElementById('apararTotal').textContent = this.defesas.aparar.total;
        
        // Modificadores
        document.getElementById('esquivaMod').value = this.defesas.esquiva.modificador;
        document.getElementById('bloqueioMod').value = this.defesas.bloqueio.modificador;
        document.getElementById('apararMod').value = this.defesas.aparar.modificador;
        document.getElementById('deslocamentoMod').value = this.defesas.deslocamento.modificador;
    }

    // ===== MÉTODOS PÚBLICOS =====
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

// ===== INICIALIZAÇÃO GLOBAL =====
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

// Funções globais
window.obterDadosDefesas = () => window.sistemaDefesas?.obterDadosDefesas() || null;
window.forcarRecalculoDefesas = () => window.sistemaDefesas?.forcarRecalculo();

// Exportação
window.SistemaDefesas = SistemaDefesas;
window.inicializarSistemaDefesas = inicializarSistemaDefesas;

console.log('✅ Sistema de Defesas carregado (fórmulas corrigidas)');
// defesas.js - SISTEMA COMPLETO DE DEFESAS ATIVAS
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
        this.totalBonus = 0;
        
        // Redutores de carga
        this.redutoresCarga = {
            'nenhuma': 0,
            'leve': -1,
            'média': -2,
            'pesada': -3,
            'muito pesada': -4
        };
        
        // Cache para NH das perícias
        this.cacheNH = {
            escudo: null,
            arma: null
        };
    }

    // ===== INICIALIZAÇÃO =====
    inicializar() {
        console.log('🛡️ Inicializando Sistema de Defesas...');
        this.configurarEventListeners();
        this.configurarControlesManuais();
        this.atualizarTodosDadosExternos();
        this.calcularTodasDefesas();
        console.log('✅ Sistema de Defesas inicializado!');
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
            console.log('🎒 Evento: equipamentosAtualizados');
            this.atualizarDadosEquipamentos();
            this.calcularTodasDefesas();
        });

        // 3. Perícias alteradas (observar mudanças na aba de perícias)
        const observerPericias = new MutationObserver(() => {
            if (document.getElementById('pericias')?.classList.contains('active')) {
                setTimeout(() => {
                    console.log('📚 Perícias atualizadas - buscando NH...');
                    this.buscarNHEscudo();
                    this.buscarNHArma();
                    this.calcularTodasDefesas();
                }, 500);
            }
        });

        document.querySelectorAll('.tab-content').forEach(tab => {
            observerPericias.observe(tab, { 
                attributes: true, 
                attributeFilter: ['class'] 
            });
        });

        // 4. Monitorar nível de carga
        this.configurarObservadorCarga();
    }

    configurarObservadorCarga() {
        const observer = new MutationObserver(() => {
            const nivelCargaElement = document.getElementById('nivelCarga');
            if (nivelCargaElement) {
                const novoNivel = nivelCargaElement.textContent.toLowerCase().trim();
                if (novoNivel !== this.nivelCarga) {
                    console.log(`⚖️ Nível de carga alterado: ${this.nivelCarga} → ${novoNivel}`);
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
        console.log('🔄 Atualizando todos dados externos...');
        
        // Atributos
        this.atualizarAtributos();
        
        // Nível de carga
        this.atualizarNivelCarga();
        
        // Equipamentos
        this.atualizarDadosEquipamentos();
        
        // NH das perícias
        this.buscarNHEscudo();
        this.buscarNHArma();
    }

    atualizarAtributos() {
        const dxInput = document.getElementById('DX');
        const htInput = document.getElementById('HT');
        
        if (dxInput && htInput) {
            this.DX = parseInt(dxInput.value) || 10;
            this.HT = parseInt(htInput.value) || 10;
        } else if (window.obterDadosAtributos) {
            const dados = window.obterDadosAtributos();
            if (dados) {
                this.DX = dados.DX || 10;
                this.HT = dados.HT || 10;
            }
        }
        
        console.log(`📊 Atributos: DX=${this.DX}, HT=${this.HT}`);
    }

    atualizarNivelCarga() {
        const cargaElement = document.getElementById('nivelCarga');
        if (cargaElement) {
            this.nivelCarga = cargaElement.textContent.toLowerCase().trim();
            console.log(`⚖️ Nível de carga: ${this.nivelCarga}`);
        } else if (window.sistemaEquipamentos) {
            this.nivelCarga = window.sistemaEquipamentos.nivelCargaAtual || 'nenhuma';
        }
    }

    atualizarDadosEquipamentos() {
        const sistemaEquip = window.sistemaEquipamentos;
        
        if (sistemaEquip) {
            // Arma equipada (primeira nas mãos)
            this.armaEquipada = sistemaEquip.armasCombate?.maos[0] || null;
            
            // Escudo equipado
            this.escudoEquipado = sistemaEquip.escudoCombate;
            
            console.log('⚔️ Equipamentos:', {
                arma: this.armaEquipada ? this.armaEquipada.nome : 'Nenhuma',
                escudo: this.escudoEquipado ? this.escudoEquipado.nome : 'Nenhum'
            });
        } else {
            console.warn('⚠️ Sistema de equipamentos não disponível');
        }
    }

    // ===== BUSCAR NH DAS PERÍCIAS =====
    buscarNHEscudo() {
        console.log('🔍 Buscando NH do Escudo...');
        this.cacheNH.escudo = null;
        
        // Método 1: Buscar na lista de perícias aprendidas
        if (window.estadoPericias?.periciasAprendidas) {
            const pericias = window.estadoPericias.periciasAprendidas;
            
            // Procurar por "Escudo" no nome ou grupo
            const periciaEscudo = pericias.find(p => {
                if (!p.nome) return false;
                
                // Verificar no nome
                if (p.nome.toLowerCase().includes('escudo')) return true;
                
                // Verificar no grupo
                if (p.grupo && p.grupo.toLowerCase().includes('escudo')) return true;
                
                // Verificar especialização
                if (p.especializacao && p.especializacao.toLowerCase().includes('escudo')) return true;
                
                return false;
            });
            
            if (periciaEscudo) {
                this.cacheNH.escudo = periciaEscudo.nh || (periciaEscudo.nivel + 10);
                console.log(`✅ NH do Escudo encontrado: ${this.cacheNH.escudo} (${periciaEscudo.nome})`);
                return;
            }
        }
        
        // Método 2: Buscar diretamente no HTML da aba de perícias
        setTimeout(() => {
            this.buscarNHEscudoNoHTML();
        }, 1000);
    }

    buscarNHEscudoNoHTML() {
        const container = document.getElementById('pericias-aprendidas');
        if (!container) {
            console.warn('⚠️ Container de perícias não encontrado');
            return;
        }
        
        const elementos = container.querySelectorAll('.pericia-aprendida-item, .pericia-aprendida-nome');
        for (const elemento of elementos) {
            const texto = elemento.textContent || '';
            if (texto.toLowerCase().includes('escudo')) {
                // Tentar extrair NH do texto
                const match = texto.match(/NH\s*(\d+)/i);
                if (match) {
                    this.cacheNH.escudo = parseInt(match[1]);
                    console.log(`✅ NH do Escudo extraído do HTML: ${this.cacheNH.escudo}`);
                    break;
                }
            }
        }
        
        if (!this.cacheNH.escudo) {
            console.log('ℹ️ NH do Escudo não encontrado - usando padrão (3)');
        }
    }

    buscarNHArma() {
        console.log('🔍 Buscando NH da Arma...');
        this.cacheNH.arma = null;
        
        if (!this.armaEquipada) {
            console.log('ℹ️ Nenhuma arma equipada - aparar usará padrão (3)');
            return;
        }
        
        const nomeArma = this.armaEquipada.nome.toLowerCase();
        console.log(`🔍 Buscando perícia para: ${nomeArma}`);
        
        // Método 1: Buscar na lista de perícias aprendidas
        if (window.estadoPericias?.periciasAprendidas) {
            const pericias = window.estadoPericias.periciasAprendidas;
            
            // Mapeamento de armas para perícias
            const mapeamento = {
                'adaga': 'Adaga de Esgrima',
                'arco': 'Arco',
                'espada': 'Espadas',
                'faca': 'Faca',
                'lanca': 'Lança',
                'maca': 'Maça/Machado',
                'machado': 'Maça/Machado',
                'bastao': 'Bastão',
                'chicote': 'Chicote'
            };
            
            // Procurar por correspondência
            for (const [keyword, periciaNome] of Object.entries(mapeamento)) {
                if (nomeArma.includes(keyword)) {
                    const pericia = pericias.find(p => p.nome === periciaNome);
                    if (pericia) {
                        this.cacheNH.arma = pericia.nh || (pericia.nivel + 10);
                        console.log(`✅ NH da Arma encontrado: ${this.cacheNH.arma} (${pericia.nome})`);
                        return;
                    }
                }
            }
            
            // Busca genérica
            const periciaGenérica = pericias.find(p => {
                if (!p.nome || p.categoria !== 'Combate') return false;
                
                const nomePericia = p.nome.toLowerCase();
                const palavrasPericia = nomePericia.split(/[^a-záéíóúãõâêîôûàèìòùç]+/);
                
                for (const palavra of palavrasPericia) {
                    if (palavra.length > 3 && nomeArma.includes(palavra)) {
                        return true;
                    }
                }
                
                return false;
            });
            
            if (periciaGenérica) {
                this.cacheNH.arma = periciaGenérica.nh || (periciaGenérica.nivel + 10);
                console.log(`✅ NH da Arma encontrado (genérico): ${this.cacheNH.arma} (${periciaGenérica.nome})`);
                return;
            }
        }
        
        console.log('ℹ️ NH da Arma não encontrado - usando padrão (3)');
    }

    // ===== CÁLCULOS =====
    calcularTodasDefesas() {
        console.log('🧮 Calculando todas as defesas...');
        
        this.calcularEsquiva();
        this.calcularDeslocamento();
        this.calcularBloqueio();
        this.calcularAparar();
        
        this.atualizarInterface();
    }

    calcularEsquiva() {
        // Fórmula: floor((DX + HT)/4) + 3
        const baseCalculada = (this.DX + this.HT) / 4;
        const base = Math.floor(baseCalculada) + 3;
        const redutorCarga = this.redutoresCarga[this.nivelCarga] || 0;
        
        this.defesas.esquiva.base = base;
        this.defesas.esquiva.total = Math.max(
            base + 
            this.totalBonus + 
            this.defesas.esquiva.modificador + 
            redutorCarga,
            1
        );
        
        console.log(`🏃 Esquiva: floor((${this.DX}+${this.HT})/4)=${Math.floor(baseCalculada)} + 3 = ${base} + ${redutorCarga} (carga) = ${this.defesas.esquiva.total}`);
    }

    calcularDeslocamento() {
        // Fórmula: (DX + HT)/4 (valor exato)
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
        // Fórmula: floor(NH_Escudo/2) + 3
        let base = 3; // Mínimo sem perícia ou escudo
        
        if (this.escudoEquipado && this.cacheNH.escudo) {
            base = Math.floor(this.cacheNH.escudo / 2) + 3;
            console.log(`🛡️ Bloqueio: floor(${this.cacheNH.escudo}/2) + 3 = ${base}`);
        } else if (this.escudoEquipado) {
            console.log(`ℹ️ Bloqueio: Escudo equipado mas NH não encontrado - usando ${base}`);
        } else {
            console.log(`ℹ️ Bloqueio: Nenhum escudo equipado - usando ${base}`);
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
        // Fórmula: floor(NH_Arma/2) + 3
        let base = 3; // Mínimo sem perícia ou arma
        
        if (this.armaEquipada && this.cacheNH.arma) {
            base = Math.floor(this.cacheNH.arma / 2) + 3;
            console.log(`⚔️ Aparar: floor(${this.cacheNH.arma}/2) + 3 = ${base}`);
        } else if (this.armaEquipada) {
            console.log(`ℹ️ Aparar: Arma equipada mas NH não encontrado - usando ${base}`);
        } else {
            console.log(`ℹ️ Aparar: Nenhuma arma equipada - usando ${base}`);
        }
        
        this.defesas.aparar.base = base;
        this.defesas.aparar.total = Math.max(
            base + 
            this.totalBonus + 
            this.defesas.aparar.modificador,
            1
        );
    }

    // ===== INTERFACE =====
    atualizarInterface() {
        // Atualizar valores totais
        document.getElementById('esquivaTotal').textContent = this.defesas.esquiva.total;
        document.getElementById('deslocamentoTotal').textContent = this.defesas.deslocamento.total.toFixed(2);
        document.getElementById('bloqueioTotal').textContent = this.defesas.bloqueio.total;
        document.getElementById('apararTotal').textContent = this.defesas.aparar.total;
        
        // Atualizar modificadores
        document.getElementById('esquivaMod').value = this.defesas.esquiva.modificador;
        document.getElementById('bloqueioMod').value = this.defesas.bloqueio.modificador;
        document.getElementById('apararMod').value = this.defesas.aparar.modificador;
        document.getElementById('deslocamentoMod').value = this.defesas.deslocamento.modificador;
        
        console.log('📊 Defesas atualizadas:', this.defesas);
    }

    // ===== MÉTODOS PÚBLICOS =====
    obterDadosDefesas() {
        return {
            esquiva: this.defesas.esquiva.total,
            deslocamento: this.defesas.deslocamento.total,
            bloqueio: this.defesas.bloqueio.total,
            aparar: this.defesas.aparar.total,
            nivelCarga: this.nivelCarga,
            redutorCarga: this.redutoresCarga[this.nivelCarga] || 0
        };
    }

    forcarRecalculo() {
        console.log('🔄 Forçando recálculo completo...');
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
        
        // Esperar um pouco para garantir que outros sistemas carreguem
        setTimeout(() => {
            sistemaDefesas.inicializar();
        }, 1500);
    }
    return sistemaDefesas;
}

// Inicializar quando a aba de combate for carregada
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

// ===== FUNÇÕES GLOBAIS PARA INTEGRAÇÃO =====
window.obterDadosDefesas = function() {
    if (window.sistemaDefesas) {
        return window.sistemaDefesas.obterDadosDefesas();
    }
    return null;
};

window.forcarRecalculoDefesas = function() {
    if (window.sistemaDefesas) {
        window.sistemaDefesas.forcarRecalculo();
    }
};

// ===== EXPORTAÇÕES =====
window.SistemaDefesas = SistemaDefesas;
window.inicializarSistemaDefesas = inicializarSistemaDefesas;

console.log('✅ Sistema de Defesas carregado e pronto!');
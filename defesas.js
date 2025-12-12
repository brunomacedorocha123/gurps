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
        this.totalBonus = 0;
        
        this.redutoresCarga = {
            'nenhuma': 0,
            'leve': -1,
            'média': -2,
            'pesada': -3,
            'muito pesada': -4
        };
        
        // Cache para melhor performance
        this.cache = {
            nhEscudo: null,
            nhArma: null,
            ultimaAtualizacao: 0
        };
        
        // Observador para perícias
        this.observadorPericias = null;
    }

    // ===== INICIALIZAÇÃO =====
    inicializar() {
        console.log('🛡️ Iniciando Sistema de Defesas...');
        
        this.configurarEventListeners();
        this.configurarControlesManuais();
        this.configurarObservadorPericias();
        this.atualizarDadosIniciais();
        this.calcularTodasDefesas();
        
        console.log('✅ Sistema de Defesas pronto!');
    }

    // ===== CONFIGURAÇÃO DE EVENTOS =====
    configurarEventListeners() {
        // Atributos alterados
        document.addEventListener('atributosAlterados', (e) => {
            if (e.detail) {
                this.DX = e.detail.DX || 10;
                this.HT = e.detail.HT || 10;
                this.calcularTodasDefesas();
            }
        });

        // Equipamentos alterados
        document.addEventListener('equipamentosAtualizados', () => {
            this.cache.nhArma = null; // Limpar cache da arma
            this.calcularTodasDefesas();
        });

        // Nível de carga
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

    configurarObservadorPericias() {
        // Observar mudanças no localStorage (quando perícias são atualizadas)
        window.addEventListener('storage', (e) => {
            if (e.key === 'periciasAprendidas') {
                console.log('📚 Perícias atualizadas no localStorage');
                this.cache.nhEscudo = null;
                this.cache.nhArma = null;
                setTimeout(() => this.calcularTodasDefesas(), 100);
            }
        });

        // Observar mudanças na aba de perícias
        this.observadorPericias = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    // Verificar se é algo relacionado a perícias
                    const texto = mutation.target.textContent || '';
                    if (texto.includes('Escudo') || texto.includes('NH') || texto.includes('nível')) {
                        console.log('📚 Mudança detectada em perícias');
                        this.cache.nhEscudo = null;
                        this.cache.nhArma = null;
                        setTimeout(() => this.calcularTodasDefesas(), 300);
                    }
                }
            });
        });

        // Começar a observar quando a aba de perícias estiver ativa
        const observarAbaPericias = () => {
            const containerPericias = document.getElementById('pericias-aprendidas');
            if (containerPericias) {
                this.observadorPericias.observe(containerPericias, {
                    childList: true,
                    characterData: true,
                    subtree: true
                });
                console.log('👀 Observador de perícias ativado');
            } else {
                setTimeout(observarAbaPericias, 1000);
            }
        };

        observarAbaPericias();
    }

    // ===== CONTROLES MANUAIS =====
    configurarControlesManuais() {
        // Botões +/- para cada defesa
        const defesasIds = ['esquiva', 'bloqueio', 'aparar', 'deslocamento'];
        
        defesasIds.forEach(defesaId => {
            const modInput = document.getElementById(`${defesaId}Mod`);
            if (!modInput) return;
            
            const container = modInput.parentElement;
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
        });

        // Bônus gerais
        const bonusIds = ['Reflexos', 'Escudo', 'Capa', 'Outros'];
        bonusIds.forEach(bonusId => {
            const input = document.getElementById(`bonus${bonusId}`);
            if (input) {
                input.addEventListener('change', () => {
                    this.atualizarBonusGerais();
                    this.calcularTodasDefesas();
                });
            }
        });
    }

    // ===== ATUALIZAÇÃO DE DADOS =====
    atualizarDadosIniciais() {
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
        
        // Bônus gerais
        this.atualizarBonusGerais();
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

    // ===== BUSCAR NH DAS PERÍCIAS =====
    buscarNHEscudo() {
        // Usar cache se disponível
        if (this.cache.nhEscudo !== null) {
            return this.cache.nhEscudo;
        }
        
        console.log('🔍 Buscando NH do Escudo...');
        let nhEncontrado = null;
        
        // Método 1: Buscar no localStorage
        try {
            const salvo = localStorage.getItem('periciasAprendidas');
            if (salvo) {
                const pericias = JSON.parse(salvo);
                const escudoPericia = pericias.find(p => 
                    p.nome && p.nome.toLowerCase().includes('escudo')
                );
                
                if (escudoPericia) {
                    nhEncontrado = escudoPericia.nh || (escudoPericia.nivel + 10);
                    console.log(`✅ NH do Escudo: ${nhEncontrado} (nível ${escudoPericia.nivel})`);
                    
                    // Salvar no cache
                    this.cache.nhEscudo = nhEncontrado;
                    this.cache.ultimaAtualizacao = Date.now();
                    return nhEncontrado;
                }
            }
        } catch (e) {
            console.log('❌ Erro ao buscar NH do Escudo:', e);
        }
        
        // Método 2: Buscar no sistema de perícias
        if (window.estadoPericias?.periciasAprendidas) {
            const pericias = window.estadoPericias.periciasAprendidas;
            const escudoPericia = pericias.find(p => 
                p.nome && p.nome.toLowerCase().includes('escudo')
            );
            
            if (escudoPericia) {
                nhEncontrado = escudoPericia.nh || (escudoPericia.nivel + 10);
                console.log(`✅ NH do Escudo (sistema): ${nhEncontrado}`);
                
                this.cache.nhEscudo = nhEncontrado;
                this.cache.ultimaAtualizacao = Date.now();
                return nhEncontrado;
            }
        }
        
        console.log('❌ NH do Escudo não encontrado');
        return null;
    }

    buscarNHArma() {
        // Usar cache se disponível
        if (this.cache.nhArma !== null) {
            return this.cache.nhArma;
        }
        
        // Verificar se há arma equipada
        const sistemaEquip = window.sistemaEquipamentos;
        if (!sistemaEquip || !sistemaEquip.armasCombate?.maos?.length) {
            return null;
        }
        
        const armaEquipada = sistemaEquip.armasCombate.maos[0];
        console.log(`🔍 Buscando NH para arma: ${armaEquipada.nome}`);
        
        // Buscar no localStorage
        try {
            const salvo = localStorage.getItem('periciasAprendidas');
            if (salvo) {
                const pericias = JSON.parse(salvo);
                const nomeArma = armaEquipada.nome.toLowerCase();
                
                // Procurar perícia correspondente
                const periciaArma = pericias.find(p => {
                    if (!p.nome) return false;
                    
                    const nomePericia = p.nome.toLowerCase();
                    
                    // Mapeamento de armas
                    if (nomeArma.includes('adaga') && nomePericia.includes('adaga')) return true;
                    if (nomeArma.includes('arco') && nomePericia.includes('arco')) return true;
                    if (nomeArma.includes('maça') && nomePericia.includes('maça')) return true;
                    if (nomeArma.includes('machado') && nomePericia.includes('machado')) return true;
                    if (nomeArma.includes('espada') && nomePericia.includes('espada')) return true;
                    
                    // Correspondência por primeira palavra
                    const palavrasArma = nomeArma.split(/[^a-záéíóúãõâêîôûàèìòùç]+/);
                    const palavrasPericia = nomePericia.split(/[^a-záéíóúãõâêîôûàèìòùç]+/);
                    
                    for (const palavraArma of palavrasArma) {
                        if (palavraArma.length > 3) {
                            for (const palavraPericia of palavrasPericia) {
                                if (palavraPericia.includes(palavraArma) || palavraArma.includes(palavraPericia)) {
                                    return true;
                                }
                            }
                        }
                    }
                    
                    return false;
                });
                
                if (periciaArma) {
                    const nhArma = periciaArma.nh || (periciaArma.nivel + 10);
                    console.log(`✅ NH da Arma: ${nhArma} (${periciaArma.nome})`);
                    
                    this.cache.nhArma = nhArma;
                    this.cache.ultimaAtualizacao = Date.now();
                    return nhArma;
                }
            }
        } catch (e) {
            console.log('❌ Erro ao buscar NH da Arma:', e);
        }
        
        console.log('❌ NH da Arma não encontrado');
        return null;
    }

    // ===== CÁLCULOS =====
    calcularTodasDefesas() {
        console.log('🧮 Calculando defesas...');
        
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
        
        console.log(`🏃 Esquiva: ${this.defesas.esquiva.total}`);
    }

    calcularDeslocamento() {
        // Fórmula: (DX + HT)/4
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
        
        console.log(`👣 Deslocamento: ${this.defesas.deslocamento.total.toFixed(2)}`);
    }

    calcularBloqueio() {
        // Buscar NH do Escudo
        const nhEscudo = this.buscarNHEscudo();
        
        let base = 3; // Mínimo sem escudo
        
        if (nhEscudo) {
            base = Math.floor(nhEscudo / 2) + 3;
            console.log(`🛡️ Bloqueio: floor(${nhEscudo}/2) + 3 = ${base}`);
        } else {
            console.log(`ℹ️ Bloqueio: Sem perícia de Escudo - usando ${base}`);
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
        // Buscar NH da Arma
        const nhArma = this.buscarNHArma();
        
        let base = 3; // Mínimo sem arma
        
        if (nhArma) {
            base = Math.floor(nhArma / 2) + 3;
            console.log(`⚔️ Aparar: floor(${nhArma}/2) + 3 = ${base}`);
        } else {
            console.log(`ℹ️ Aparar: ${nhArma === null ? 'Nenhuma arma equipada' : 'Sem perícia para arma'} - usando ${base}`);
        }
        
        this.defesas.aparar.base = base;
        this.defesas.aparar.total = Math.max(
            base + 
            this.totalBonus + 
            this.defesas.aparar.modificador,
            1
        );
    }

    // ===== ATUALIZAR INTERFACE =====
    atualizarInterface() {
        // Atualizar valores totais
        const atualizar = (id, valor) => {
            const element = document.getElementById(id);
            if (element) element.textContent = valor;
        };
        
        atualizar('esquivaTotal', this.defesas.esquiva.total);
        atualizar('deslocamentoTotal', this.defesas.deslocamento.total.toFixed(2));
        atualizar('bloqueioTotal', this.defesas.bloqueio.total);
        atualizar('apararTotal', this.defesas.aparar.total);
        
        // Atualizar modificadores
        const atualizarMod = (id, valor) => {
            const element = document.getElementById(id);
            if (element) element.value = valor;
        };
        
        atualizarMod('esquivaMod', this.defesas.esquiva.modificador);
        atualizarMod('bloqueioMod', this.defesas.bloqueio.modificador);
        atualizarMod('apararMod', this.defesas.aparar.modificador);
        atualizarMod('deslocamentoMod', this.defesas.deslocamento.modificador);
    }

    // ===== MÉTODOS PÚBLICOS =====
    forcarRecalculo() {
        console.log('🔄 Forçando recálculo completo...');
        this.cache.nhEscudo = null;
        this.cache.nhArma = null;
        this.atualizarDadosIniciais();
        this.calcularTodasDefesas();
    }

    atualizarEmTempoReal() {
        console.log('⏱️ Atualizando em tempo real...');
        this.forcarRecalculo();
    }

    obterDadosDefesas() {
        return {
            esquiva: this.defesas.esquiva.total,
            deslocamento: this.defesas.deslocamento.total,
            bloqueio: this.defesas.bloqueio.total,
            aparar: this.defesas.aparar.total,
            nivelCarga: this.nivelCarga,
            detalhes: this.defesas
        };
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
    return sistemaDefesas;
}

// Inicializar quando combate for aberto
document.addEventListener('DOMContentLoaded', function() {
    const combateTab = document.getElementById('combate');
    if (combateTab && combateTab.classList.contains('active')) {
        setTimeout(() => {
            inicializarSistemaDefesas();
        }, 100);
    }
    
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

// ===== FUNÇÕES GLOBAIS =====
window.obterDadosDefesas = function() {
    return window.sistemaDefesas?.obterDadosDefesas() || null;
};

window.forcarRecalculoDefesas = function() {
    window.sistemaDefesas?.forcarRecalculo();
};

window.atualizarDefesasTempoReal = function() {
    window.sistemaDefesas?.atualizarEmTempoReal();
};

// Função para testar NH
window.testarNH = function() {
    console.log('=== TESTE NH ===');
    const sistema = window.sistemaDefesas;
    if (!sistema) {
        console.log('❌ Sistema não inicializado');
        return;
    }
    
    console.log('1. NH do Escudo:', sistema.buscarNHEscudo());
    console.log('2. NH da Arma:', sistema.buscarNHArma());
    
    // Verificar localStorage
    try {
        const salvo = localStorage.getItem('periciasAprendidas');
        if (salvo) {
            const pericias = JSON.parse(salvo);
            console.log(`📁 ${pericias.length} perícias no localStorage:`);
            pericias.forEach(p => {
                console.log(`   - ${p.nome}: NH ${p.nh}, Nível ${p.nivel}`);
            });
        }
    } catch (e) {
        console.log('❌ Erro:', e);
    }
};

// ===== EXPORTAÇÕES =====
window.SistemaDefesas = SistemaDefesas;
window.inicializarSistemaDefesas = inicializarSistemaDefesas;

console.log('✅ Sistema de Defesas carregado!');
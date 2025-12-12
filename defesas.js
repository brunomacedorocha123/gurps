// defesas.js - VERSÃO QUE FUÇA EM TODOS OS LUGARES POSSÍVEIS
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
    }

    // ===== MÉTODO PRINCIPAL =====
    inicializar() {
        console.log('🛡️ Iniciando Sistema de Defesas...');
        
        this.configurarEventListeners();
        this.configurarControlesManuais();
        this.atualizarDadosIniciais();
        this.calcularTodasDefesas();
        
        console.log('✅ Sistema de Defesas pronto!');
    }

    configurarEventListeners() {
        document.addEventListener('atributosAlterados', (e) => {
            if (e.detail) {
                this.DX = e.detail.DX || 10;
                this.HT = e.detail.HT || 10;
                this.calcularTodasDefesas();
            }
        });

        document.addEventListener('equipamentosAtualizados', () => {
            this.calcularTodasDefesas();
        });

        // Monitorar quando abrir aba de perícias
        const observer = new MutationObserver(() => {
            const periciasTab = document.getElementById('pericias');
            if (periciasTab && periciasTab.classList.contains('active')) {
                setTimeout(() => {
                    this.calcularTodasDefesas();
                }, 1000);
            }
        });
        
        document.querySelectorAll('.tab-content').forEach(tab => {
            observer.observe(tab, { attributes: true });
        });

        // Monitorar nível de carga
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

    configurarControlesManuais() {
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

    atualizarDadosIniciais() {
        const dxInput = document.getElementById('DX');
        const htInput = document.getElementById('HT');
        if (dxInput && htInput) {
            this.DX = parseInt(dxInput.value) || 10;
            this.HT = parseInt(htInput.value) || 10;
        }
        
        const cargaElement = document.getElementById('nivelCarga');
        if (cargaElement) {
            this.nivelCarga = cargaElement.textContent.toLowerCase().trim();
        }
        
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

    // ===== BUSCAR NH MANUALMENTE =====
    buscarNHEscudoManual() {
        console.log('🔍 Buscando NH do Escudo MANUALMENTE...');
        
        // Método 1: Verificar localStorage
        try {
            const salvo = localStorage.getItem('periciasAprendidas');
            if (salvo) {
                const pericias = JSON.parse(salvo);
                console.log(`📁 Encontrado ${pericias.length} perícias no localStorage`);
                
                const escudoPericia = pericias.find(p => 
                    p.nome && p.nome.toLowerCase().includes('escudo')
                );
                
                if (escudoPericia) {
                    const nh = escudoPericia.nh || (escudoPericia.nivel + 10);
                    console.log(`✅ NH do Escudo no localStorage: ${nh} (${escudoPericia.nome})`);
                    return nh;
                }
            }
        } catch (e) {
            console.log('❌ Erro ao ler localStorage:', e);
        }
        
        // Método 2: Verificar sistema global
        if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
            const pericias = window.estadoPericias.periciasAprendidas;
            console.log(`🌐 Encontrado ${pericias.length} perícias no sistema`);
            
            // Procurar por "Escudo" de qualquer forma
            const escudoPericia = pericias.find(p => {
                if (!p || !p.nome) return false;
                
                // Verificar nome
                if (p.nome.toLowerCase().includes('escudo')) return true;
                
                // Verificar grupo
                if (p.grupo && p.grupo.toLowerCase().includes('escudo')) return true;
                
                // Verificar especialização
                if (p.especializacao && p.especializacao.toLowerCase().includes('escudo')) return true;
                
                return false;
            });
            
            if (escudoPericia) {
                const nh = escudoPericia.nh || (escudoPericia.nivel + 10);
                console.log(`✅ NH do Escudo no sistema: ${nh} (${escudoPericia.nome})`);
                return nh;
            }
        }
        
        // Método 3: Buscar no HTML da página atual
        console.log('🔍 Procurando "Escudo" no HTML da página...');
        const elementos = document.querySelectorAll('*');
        
        for (const elemento of elementos) {
            const texto = elemento.textContent || '';
            if (texto.toLowerCase().includes('escudo')) {
                console.log('📍 Elemento encontrado com "Escudo":', elemento);
                
                // Tentar extrair NH do texto
                const match = texto.match(/NH\s*(\d+)/i);
                if (match) {
                    const nh = parseInt(match[1]);
                    console.log(`✅ NH extraído do texto: ${nh}`);
                    return nh;
                }
                
                // Se não encontrar, verificar se tem número (pode ser o nível)
                const nivelMatch = texto.match(/[+-]\s*\d+/);
                if (nivelMatch) {
                    const nivel = parseInt(nivelMatch[0].replace(/\s/g, ''));
                    const nh = nivel + 10; // Assumindo atributo 10
                    console.log(`✅ NH calculado do nível ${nivel}: ${nh}`);
                    return nh;
                }
            }
        }
        
        console.log('❌ NH do Escudo não encontrado em lugar nenhum');
        return null;
    }

    buscarNHArmaManual() {
        console.log('🔍 Buscando NH da Arma MANUALMENTE...');
        
        // Verificar se há arma equipada
        const sistemaEquip = window.sistemaEquipamentos;
        if (!sistemaEquip || !sistemaEquip.armasCombate?.maos?.length) {
            console.log('ℹ️ Nenhuma arma equipada');
            return null;
        }
        
        const armaEquipada = sistemaEquip.armasCombate.maos[0];
        console.log(`🔍 Arma equipada: ${armaEquipada.nome}`);
        
        // Método 1: Verificar localStorage
        try {
            const salvo = localStorage.getItem('periciasAprendidas');
            if (salvo) {
                const pericias = JSON.parse(salvo);
                
                // Procurar perícia correspondente
                const periciaArma = pericias.find(p => {
                    if (!p.nome) return false;
                    
                    const nomePericia = p.nome.toLowerCase();
                    const nomeArma = armaEquipada.nome.toLowerCase();
                    
                    // Verificar correspondência
                    if (nomePericia.includes(nomeArma.split(' ')[0].toLowerCase())) return true;
                    
                    // Verificar mapeamento comum
                    if (nomeArma.includes('adaga') && nomePericia.includes('adaga')) return true;
                    if (nomeArma.includes('arco') && nomePericia.includes('arco')) return true;
                    if (nomeArma.includes('espada') && nomePericia.includes('espada')) return true;
                    
                    return false;
                });
                
                if (periciaArma) {
                    const nh = periciaArma.nh || (periciaArma.nivel + 10);
                    console.log(`✅ NH da Arma no localStorage: ${nh} (${periciaArma.nome})`);
                    return nh;
                }
            }
        } catch (e) {
            console.log('❌ Erro ao ler localStorage:', e);
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
        const nhEscudo = this.buscarNHEscudoManual();
        
        let base = 3; // Mínimo sem escudo
        
        if (nhEscudo) {
            base = Math.floor(nhEscudo / 2) + 3;
            console.log(`🛡️ Bloqueio: floor(${nhEscudo}/2) + 3 = ${base}`);
        } else {
            console.log(`ℹ️ Bloqueio: Sem NH do Escudo - usando ${base}`);
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
        const nhArma = this.buscarNHArmaManual();
        
        let base = 3; // Mínimo sem arma
        
        if (nhArma) {
            base = Math.floor(nhArma / 2) + 3;
            console.log(`⚔️ Aparar: floor(${nhArma}/2) + 3 = ${base}`);
        } else {
            console.log(`ℹ️ Aparar: Sem NH da Arma - usando ${base}`);
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
        const atualizar = (id, valor) => {
            const element = document.getElementById(id);
            if (element) element.textContent = valor;
        };
        
        atualizar('esquivaTotal', this.defesas.esquiva.total);
        atualizar('deslocamentoTotal', this.defesas.deslocamento.total.toFixed(2));
        atualizar('bloqueioTotal', this.defesas.bloqueio.total);
        atualizar('apararTotal', this.defesas.aparar.total);
        
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
        console.log('🔄 Forçando recálculo...');
        this.atualizarDadosIniciais();
        this.calcularTodasDefesas();
    }

    obterDadosDefesas() {
        return this.defesas;
    }
}

// ===== INICIALIZAÇÃO =====
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

// Inicializar
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

// Funções globais
window.obterDadosDefesas = () => window.sistemaDefesas?.obterDadosDefesas();
window.forcarRecalculoDefesas = () => window.sistemaDefesas?.forcarRecalculo();

// Testar busca manual
window.testarBuscaEscudo = () => {
    console.log('=== TESTE MANUAL BUSCA ESCUDO ===');
    const nh = window.sistemaDefesas?.buscarNHEscudoManual();
    console.log('NH encontrado:', nh);
    return nh;
};

window.testarBuscaArma = () => {
    console.log('=== TESTE MANUAL BUSCA ARMA ===');
    const nh = window.sistemaDefesas?.buscarNHArmaManual();
    console.log('NH encontrado:', nh);
    return nh;
};

// Exportações
window.SistemaDefesas = SistemaDefesas;
window.inicializarSistemaDefesas = inicializarSistemaDefesas;

console.log('✅ Sistema de Defesas carregado!');
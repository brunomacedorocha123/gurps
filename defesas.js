// defesas.js - SISTEMA QUE BUSCA NAS PERÍCIAS ADQUIRIDAS
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
        
        // Cache para evitar múltiplas buscas
        this.cachePericias = {
            escudo: null,
            arma: null,
            ultimaBusca: 0
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
            this.calcularTodasDefesas();
        });

        // Monitorar mudanças nas perícias (quando aba de perícias é aberta)
        this.configurarObservadorPericias();
        
        // Monitorar nível de carga
        this.configurarObservadorCarga();
    }

    configurarObservadorPericias() {
        // Observar quando a aba de perícias é aberta
        const observer = new MutationObserver(() => {
            const periciasTab = document.getElementById('pericias');
            if (periciasTab && periciasTab.classList.contains('active')) {
                // Limpar cache quando abrir a aba de perícias
                this.cachePericias = { escudo: null, arma: null, ultimaBusca: 0 };
                setTimeout(() => {
                    this.calcularTodasDefesas();
                }, 500);
            }
        });
        
        document.querySelectorAll('.tab-content').forEach(tab => {
            observer.observe(tab, { 
                attributes: true, 
                attributeFilter: ['class'] 
            });
        });
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
        // Configurar botões +/- para cada defesa
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

    // ===== BUSCAR PERÍCIAS ADQUIRIDAS =====
    buscarPericiasAdquiridas() {
        console.log('🔍 Buscando perícias adquiridas...');
        
        // Método 1: Buscar no sistema de perícias (se disponível)
        if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
            console.log('✅ Usando sistema de perícias');
            return window.estadoPericias.periciasAprendidas;
        }
        
        // Método 2: Buscar no localStorage
        try {
            const salvo = localStorage.getItem('periciasAprendidas');
            if (salvo) {
                const pericias = JSON.parse(salvo);
                console.log(`✅ Encontrado ${pericias.length} perícias no localStorage`);
                return pericias;
            }
        } catch (e) {
            console.log('❌ Erro ao ler localStorage:', e);
        }
        
        // Método 3: Buscar no HTML da página
        return this.buscarPericiasNoHTML();
    }

    buscarPericiasNoHTML() {
        console.log('🔍 Buscando perícias no HTML...');
        const pericias = [];
        
        // Procurar em todos os lugares possíveis
        const seletores = [
            '#pericias-aprendidas .pericia-aprendida-item',
            '.acquired-list-pericias .pericia-aprendida-item',
            '.pericia-aprendida-item',
            '[class*="pericia"][class*="aprendida"]',
            '#pericias [class*="item"]'
        ];
        
        for (const seletor of seletores) {
            const elementos = document.querySelectorAll(seletor);
            if (elementos.length > 0) {
                console.log(`✅ Encontrado ${elementos.length} elementos com seletor: ${seletor}`);
                
                elementos.forEach((el, index) => {
                    const texto = el.textContent || '';
                    const nomeMatch = texto.match(/^[^\n\d]+/);
                    const nhMatch = texto.match(/NH\s*(\d+)/i);
                    const nivelMatch = texto.match(/[+-]\s*\d+/);
                    
                    if (nomeMatch) {
                        const pericia = {
                            nome: nomeMatch[0].trim(),
                            nh: nhMatch ? parseInt(nhMatch[1]) : null,
                            nivel: nivelMatch ? parseInt(nivelMatch[0].replace(/\s/g, '')) : 0,
                            textoCompleto: texto
                        };
                        pericias.push(pericia);
                    }
                });
                break;
            }
        }
        
        console.log(`📋 Perícias encontradas no HTML: ${pericias.length}`);
        pericias.forEach(p => console.log(`  - ${p.nome}: NH ${p.nh}, Nível ${p.nivel}`));
        
        return pericias;
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
        // Buscar NH do Escudo
        let nhEscudo = this.cachePericias.escudo;
        
        if (!nhEscudo) {
            const pericias = this.buscarPericiasAdquiridas();
            const periciaEscudo = pericias.find(p => 
                p.nome && p.nome.toLowerCase().includes('escudo')
            );
            
            if (periciaEscudo) {
                nhEscudo = periciaEscudo.nh || (periciaEscudo.nivel + 10);
                this.cachePericias.escudo = nhEscudo;
                console.log(`✅ NH do Escudo encontrado: ${nhEscudo} (${periciaEscudo.nome})`);
            }
        }
        
        let base = 3; // Mínimo sem escudo
        
        if (nhEscudo) {
            base = Math.floor(nhEscudo / 2) + 3;
            console.log(`🛡️ Bloqueio: floor(${nhEscudo}/2) + 3 = ${base}`);
        } else {
            console.log(`ℹ️ Bloqueio: Perícia de Escudo não encontrada - usando ${base}`);
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
        let nhArma = this.cachePericias.arma;
        
        if (!nhArma) {
            const pericias = this.buscarPericiasAdquiridas();
            
            // Verificar se há arma equipada
            const sistemaEquip = window.sistemaEquipamentos;
            let periciaArma = null;
            
            if (sistemaEquip && sistemaEquip.armasCombate?.maos?.length > 0) {
                const armaEquipada = sistemaEquip.armasCombate.maos[0];
                const nomeArma = armaEquipada.nome.toLowerCase();
                console.log(`🔍 Buscando perícia para arma: ${nomeArma}`);
                
                // Procurar perícia correspondente
                periciaArma = pericias.find(p => {
                    if (!p.nome) return false;
                    
                    const nomePericia = p.nome.toLowerCase();
                    
                    // Mapeamento simples
                    if (nomeArma.includes('adaga') && nomePericia.includes('adaga')) return true;
                    if (nomeArma.includes('arco') && nomePericia.includes('arco')) return true;
                    if (nomeArma.includes('espada') && nomePericia.includes('espada')) return true;
                    if (nomeArma.includes('faca') && nomePericia.includes('faca')) return true;
                    
                    return false;
                });
            }
            
            if (periciaArma) {
                nhArma = periciaArma.nh || (periciaArma.nivel + 10);
                this.cachePericias.arma = nhArma;
                console.log(`✅ NH da Arma encontrado: ${nhArma} (${periciaArma.nome})`);
            }
        }
        
        let base = 3; // Mínimo sem arma
        
        if (nhArma) {
            base = Math.floor(nhArma / 2) + 3;
            console.log(`⚔️ Aparar: floor(${nhArma}/2) + 3 = ${base}`);
        } else {
            console.log(`ℹ️ Aparar: Perícia da Arma não encontrada - usando ${base}`);
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
        
        console.log('📊 Defesas atualizadas:', this.defesas);
    }

    // ===== MÉTODOS PÚBLICOS =====
    forcarRecalculo() {
        console.log('🔄 Forçando recálculo...');
        this.cachePericias = { escudo: null, arma: null, ultimaBusca: 0 };
        this.atualizarDadosIniciais();
        this.calcularTodasDefesas();
    }

    obterDadosDefesas() {
        return {
            esquiva: this.defesas.esquiva.total,
            deslocamento: this.defesas.deslocamento.total,
            bloqueio: this.defesas.bloqueio.total,
            aparar: this.defesas.aparar.total,
            nivelCarga: this.nivelCarga
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
        }, 1500);
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

// ===== EXPORTAÇÕES =====
window.SistemaDefesas = SistemaDefesas;
window.inicializarSistemaDefesas = inicializarSistemaDefesas;

console.log('✅ Sistema de Defesas carregado!');
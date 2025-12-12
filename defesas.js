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
    }

    // ===== MÉTODO PRINCIPAL =====
    inicializar() {
        console.log('🛡️ Iniciando Sistema de Defesas...');
        
        // 1. Configurar eventos
        this.configurarEventListeners();
        
        // 2. Configurar controles manuais
        this.configurarControlesManuais();
        
        // 3. Atualizar dados iniciais
        this.atualizarDadosIniciais();
        
        // 4. Calcular tudo
        this.calcularTodasDefesas();
        
        console.log('✅ Sistema de Defesas pronto!');
    }

    // ===== CONFIGURAÇÃO SIMPLES =====
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

        // Monitorar nível de carga
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
        const nhEscudo = this.buscarNHEscudo();
        
        let base = 3; // Mínimo sem escudo
        
        if (nhEscudo) {
            base = Math.floor(nhEscudo / 2) + 3;
            console.log(`🛡️ Bloqueio: floor(${nhEscudo}/2) + 3 = ${base}`);
        } else {
            console.log(`ℹ️ Bloqueio: NH do Escudo não encontrado - usando ${base}`);
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
            console.log(`ℹ️ Aparar: NH da Arma não encontrado - usando ${base}`);
        }
        
        this.defesas.aparar.base = base;
        this.defesas.aparar.total = Math.max(
            base + 
            this.totalBonus + 
            this.defesas.aparar.modificador,
            1
        );
    }

    // ===== BUSCA DE NH NO HTML =====
    buscarNHEscudo() {
        // Método 1: Buscar no container de perícias aprendidas
        const container = document.getElementById('pericias-aprendidas');
        if (!container) {
            console.log('⚠️ Container de perícias não encontrado');
            return null;
        }
        
        // Procurar por elemento com "Escudo"
        const elementos = container.querySelectorAll('.pericia-aprendida-item, .pericia-aprendida-nome, h4, div');
        
        for (const elemento of elementos) {
            const texto = elemento.textContent || '';
            if (texto.toLowerCase().includes('escudo')) {
                // Tentar extrair NH do texto
                const match = texto.match(/NH\s*(\d+)/i);
                if (match) {
                    const nh = parseInt(match[1]);
                    console.log(`✅ NH do Escudo encontrado: ${nh}`);
                    return nh;
                }
                
                // Se não encontrar NH no texto, tentar buscar no elemento pai ou próximo
                const parent = elemento.closest('.pericia-aprendida-item');
                if (parent) {
                    const parentText = parent.textContent || '';
                    const parentMatch = parentText.match(/NH\s*(\d+)/i);
                    if (parentMatch) {
                        const nh = parseInt(parentMatch[1]);
                        console.log(`✅ NH do Escudo encontrado (parent): ${nh}`);
                        return nh;
                    }
                }
            }
        }
        
        console.log('ℹ️ NH do Escudo não encontrado no HTML');
        return null;
    }

    buscarNHArma() {
        // Primeiro verificar se há arma equipada
        const sistemaEquip = window.sistemaEquipamentos;
        if (!sistemaEquip || !sistemaEquip.armasCombate?.maos?.length) {
            console.log('ℹ️ Nenhuma arma equipada');
            return null;
        }
        
        const armaEquipada = sistemaEquip.armasCombate.maos[0];
        console.log(`🔍 Buscando NH para arma: ${armaEquipada.nome}`);
        
        // Buscar no container de perícias aprendidas
        const container = document.getElementById('pericias-aprendidas');
        if (!container) return null;
        
        const elementos = container.querySelectorAll('.pericia-aprendida-item, .pericia-aprendida-nome, h4, div');
        const nomeArma = armaEquipada.nome.toLowerCase();
        
        // Palavras-chave comuns
        const keywords = [
            'adaga', 'arco', 'espada', 'faca', 'lanca', 'maca', 'machado', 
            'bastao', 'chicote', 'rapieira', 'sabre', 'terçado', 'tonfa'
        ];
        
        for (const keyword of keywords) {
            if (nomeArma.includes(keyword)) {
                // Procurar perícia que corresponda
                for (const elemento of elementos) {
                    const texto = elemento.textContent || '';
                    const textoLower = texto.toLowerCase();
                    
                    if (textoLower.includes(keyword)) {
                        // Tentar extrair NH
                        const match = texto.match(/NH\s*(\d+)/i);
                        if (match) {
                            const nh = parseInt(match[1]);
                            console.log(`✅ NH da Arma encontrado (${keyword}): ${nh}`);
                            return nh;
                        }
                        
                        // Buscar no elemento pai
                        const parent = elemento.closest('.pericia-aprendida-item');
                        if (parent) {
                            const parentText = parent.textContent || '';
                            const parentMatch = parentText.match(/NH\s*(\d+)/i);
                            if (parentMatch) {
                                const nh = parseInt(parentMatch[1]);
                                console.log(`✅ NH da Arma encontrado (parent): ${nh}`);
                                return nh;
                            }
                        }
                    }
                }
            }
        }
        
        console.log('ℹ️ NH da Arma não encontrado');
        return null;
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
        
        // Esperar um pouco para garantir que a página carregue
        setTimeout(() => {
            sistemaDefesas.inicializar();
        }, 1000);
    }
    return sistemaDefesas;
}

// Inicializar quando combate for aberto
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já está na aba combate
    const combateTab = document.getElementById('combate');
    if (combateTab && combateTab.classList.contains('active')) {
        setTimeout(() => {
            inicializarSistemaDefesas();
        }, 100);
    }
    
    // Observar mudanças nas abas
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
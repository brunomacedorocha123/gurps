// defesas.js - SISTEMA 100% COMPLETO E CORRETO
class SistemaDefesasCompleto {
    constructor() {
        console.log('🎮 SISTEMA DE DEFESAS COMPLETO INICIADO!');
        
        this.config = {
            bonus: {
                // BÔNUS QUE APLICAM EM TODAS AS DEFESAS
                TODAS_DEFESAS: ['Outros'],
                
                // BÔNUS ESPECÍFICOS
                ESPECIFICOS: {
                    'Reflexos': ['esquiva', 'deslocamento'],
                    'Escudo': ['bloqueio'],
                    'Capa': ['esquiva', 'bloqueio', 'aparar', 'deslocamento']
                }
            },
            
            formulas: {
                esquiva: (dx, ht) => Math.floor((dx + ht) / 4) + 3,
                deslocamento: (dx, ht) => (dx + ht) / 4,
                bloqueio: (nh) => Math.floor(nh / 2) + 3,
                aparar: (nh) => Math.floor(nh / 2) + 3
            },
            
            redutoresCarga: {
                'nenhuma': 0,
                'leve': -1,
                'média': -2,
                'pesada': -3,
                'muito pesada': -4
            }
        };
        
        this.estado = {
            atributos: { dx: 10, ht: 10 },
            bonusValores: { Reflexos: 0, Escudo: 0, Capa: 0, Outros: 0 },
            nh: { escudo: null, arma: null },
            defesas: { esquiva: 0, bloqueio: 0, aparar: 0, deslocamento: 0 },
            nivelCarga: 'nenhuma'
        };
        
        this.iniciado = false;
    }
    
    // ===== INICIALIZAÇÃO COMPLETA =====
    iniciar() {
        if (this.iniciado) return;
        console.log('🔄 INICIANDO SISTEMA COMPLETO...');
        
        // 1. Configurar tudo
        this.configurarElementos();
        this.configurarEventos();
        this.configurarObservadores();
        
        // 2. Carregar valores iniciais
        this.carregarValoresIniciais();
        
        // 3. Calcular pela primeira vez
        this.calcularTudo();
        
        // 4. Iniciar monitoramento
        this.iniciarMonitoramento();
        
        this.iniciado = true;
        console.log('✅ SISTEMA COMPLETO PRONTO!');
    }
    
    configurarElementos() {
        // Garantir que todos os inputs de bônus existem
        ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonus => {
            const id = `bonus${bonus}`;
            let input = document.getElementById(id);
            
            if (!input) {
                // Se não existe, cria (só por segurança)
                console.log(`⚠️ Input ${id} não encontrado, criando...`);
                input = document.createElement('input');
                input.id = id;
                input.type = 'number';
                input.value = '0';
                input.className = 'bonus-input';
                document.body.appendChild(input);
            }
        });
    }
    
    configurarEventos() {
        // Eventos para cada bônus
        ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonus => {
            const input = document.getElementById(`bonus${bonus}`);
            if (input) {
                // Quando muda o valor
                input.addEventListener('input', () => {
                    this.estado.bonusValores[bonus] = parseInt(input.value) || 0;
                    this.calcularTudo();
                });
                
                input.addEventListener('change', () => {
                    this.estado.bonusValores[bonus] = parseInt(input.value) || 0;
                    this.calcularTudo();
                });
            }
        });
        
        // Eventos para modificadores de defesa
        ['esquiva', 'bloqueio', 'aparar', 'deslocamento'].forEach(defesa => {
            const input = document.getElementById(`${defesa}Mod`);
            if (input) {
                input.addEventListener('change', () => {
                    this.calcularTudo();
                });
            }
        });
        
        // Eventos para atributos
        ['DX', 'HT'].forEach(atributo => {
            const input = document.getElementById(atributo);
            if (input) {
                input.addEventListener('input', () => {
                    this.estado.atributos[atributo.toLowerCase()] = parseInt(input.value) || 10;
                    this.calcularTudo();
                });
            }
        });
    }
    
    configurarObservadores() {
        // Observar nível de carga
        const cargaElement = document.getElementById('nivelCarga');
        if (cargaElement) {
            const observer = new MutationObserver(() => {
                this.estado.nivelCarga = cargaElement.textContent.toLowerCase().trim();
                this.calcularTudo();
            });
            
            observer.observe(cargaElement, { 
                childList: true, 
                characterData: true 
            });
        }
        
        // Observar mudanças em perícias
        this.configurarObservadorPericias();
        
        // Observar mudanças em equipamentos
        this.configurarObservadorEquipamentos();
    }
    
    configurarObservadorPericias() {
        const container = document.getElementById('pericias-aprendidas');
        if (container) {
            const observer = new MutationObserver(() => {
                console.log('📚 Perícias atualizadas!');
                this.estado.nh.escudo = null;
                this.estado.nh.arma = null;
                setTimeout(() => this.calcularTudo(), 300);
            });
            
            observer.observe(container, { 
                childList: true, 
                subtree: true 
            });
        }
    }
    
    configurarObservadorEquipamentos() {
        const armaInfo = document.getElementById('armaInfo');
        if (armaInfo) {
            const observer = new MutationObserver(() => {
                console.log('⚔️ Equipamento alterado!');
                this.estado.nh.arma = null;
                setTimeout(() => this.calcularTudo(), 300);
            });
            
            observer.observe(armaInfo, { 
                childList: true, 
                attributes: true 
            });
        }
    }
    
    carregarValoresIniciais() {
        // Carregar atributos
        const dxInput = document.getElementById('DX');
        const htInput = document.getElementById('HT');
        
        if (dxInput) this.estado.atributos.dx = parseInt(dxInput.value) || 10;
        if (htInput) this.estado.atributos.ht = parseInt(htInput.value) || 10;
        
        // Carregar bônus
        ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonus => {
            const input = document.getElementById(`bonus${bonus}`);
            if (input) {
                this.estado.bonusValores[bonus] = parseInt(input.value) || 0;
            }
        });
        
        // Carregar nível de carga
        const cargaElement = document.getElementById('nivelCarga');
        if (cargaElement) {
            this.estado.nivelCarga = cargaElement.textContent.toLowerCase().trim();
        }
    }
    
    iniciarMonitoramento() {
        // Atualização periódica (só pra garantir)
        setInterval(() => {
            this.verificarMudancas();
        }, 2000);
    }
    
    verificarMudancas() {
        // Verifica se algo mudou desde a última atualização
        let mudou = false;
        
        // Verificar atributos
        const dxInput = document.getElementById('DX');
        const htInput = document.getElementById('HT');
        
        if (dxInput) {
            const novoDX = parseInt(dxInput.value) || 10;
            if (novoDX !== this.estado.atributos.dx) {
                this.estado.atributos.dx = novoDX;
                mudou = true;
            }
        }
        
        if (htInput) {
            const novoHT = parseInt(htInput.value) || 10;
            if (novoHT !== this.estado.atributos.ht) {
                this.estado.atributos.ht = novoHT;
                mudou = true;
            }
        }
        
        // Verificar bônus
        ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonus => {
            const input = document.getElementById(`bonus${bonus}`);
            if (input) {
                const novoValor = parseInt(input.value) || 0;
                if (novoValor !== this.estado.bonusValores[bonus]) {
                    this.estado.bonusValores[bonus] = novoValor;
                    mudou = true;
                }
            }
        });
        
        if (mudou) {
            this.calcularTudo();
        }
    }
    
    // ===== CÁLCULOS COMPLETOS =====
    calcularTudo() {
        console.log('🧮 CALCULANDO TUDO...');
        
        // 1. Buscar NH atualizado
        this.buscarNHAtual();
        
        // 2. Calcular cada defesa
        this.calcularEsquiva();
        this.calcularDeslocamento();
        this.calcularBloqueio();
        this.calcularAparar();
        
        // 3. Atualizar interface
        this.atualizarInterface();
        
        // 4. Atualizar total de bônus
        this.atualizarTotalBonus();
        
        console.log('✅ CÁLCULO COMPLETO!');
    }
    
    buscarNHAtual() {
        // Buscar NH do Escudo
        if (this.estado.nh.escudo === null) {
            this.estado.nh.escudo = this.calcularNHEscudo();
        }
        
        // Buscar NH da Arma
        if (this.estado.nh.arma === null) {
            this.estado.nh.arma = this.calcularNHArma();
        }
    }
    
    calcularNHEscudo() {
        const dx = this.estado.atributos.dx;
        
        // Procurar perícia de Escudo
        let nivelEscudo = 0;
        
        // Procurar na lista de perícias
        const itens = document.querySelectorAll('.pericia-aprendida-item');
        for (let item of itens) {
            const nome = item.querySelector('.pericia-aprendida-nome');
            if (nome && nome.textContent.toLowerCase().includes('escudo')) {
                const nivel = item.querySelector('.pericia-aprendida-nivel');
                if (nivel) {
                    const texto = nivel.textContent.replace('+', '');
                    nivelEscudo = parseInt(texto) || 0;
                    break;
                }
            }
        }
        
        return dx + nivelEscudo;
    }
    
    calcularNHArma() {
        // Verificar se tem arma equipada
        const comArma = document.getElementById('comArma');
        if (!comArma || comArma.style.display === 'none') {
            return 0; // Nenhuma arma equipada
        }
        
        const dx = this.estado.atributos.dx;
        
        // Buscar nome da arma
        const armaNome = comArma.querySelector('.arma-nome');
        if (!armaNome) return dx; // Retorna DX mínimo
        
        const nomeArma = armaNome.textContent.toLowerCase();
        
        // Buscar perícia correspondente
        let nivelArma = 0;
        
        // Procurar na lista de perícias
        const itens = document.querySelectorAll('.pericia-aprendida-item');
        for (let item of itens) {
            const nomePericia = item.querySelector('.pericia-aprendida-nome');
            if (nomePericia) {
                const nome = nomePericia.textContent.toLowerCase();
                
                // Verificar correspondência
                if (this.periciaCorrespondeArma(nome, nomeArma)) {
                    const nivel = item.querySelector('.pericia-aprendida-nivel');
                    if (nivel) {
                        const texto = nivel.textContent.replace('+', '');
                        nivelArma = parseInt(texto) || 0;
                        break;
                    }
                }
            }
        }
        
        return dx + nivelArma;
    }
    
    periciaCorrespondeArma(nomePericia, nomeArma) {
        // Mapeamento simples
        const mapeamento = {
            'adaga': ['adaga', 'faca'],
            'espada': ['espada', 'sabre', 'rapieira', 'terçado'],
            'arco': ['arco', 'besta', 'funda'],
            'machado': ['machado', 'maça/machado'],
            'maça': ['maça', 'maça/machado', 'martelo'],
            'lanca': ['lança', 'bastão'],
            'pistola': ['armas de fogo'],
            'rifle': ['armas de fogo'],
            'shotgun': ['armas de fogo']
        };
        
        for (const [pericia, armas] of Object.entries(mapeamento)) {
            if (nomePericia.includes(pericia)) {
                for (const arma of armas) {
                    if (nomeArma.includes(arma)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    // ===== CÁLCULO DE CADA DEFESA =====
    calcularEsquiva() {
        const { dx, ht } = this.estado.atributos;
        
        // Base da fórmula
        const base = this.config.formulas.esquiva(dx, ht);
        
        // Modificador
        const modInput = document.getElementById('esquivaMod');
        const modificador = modInput ? parseInt(modInput.value) || 0 : 0;
        
        // Bônus que se aplicam à esquiva
        let bonusTotal = 0;
        
        // "Outros" aplica em tudo
        bonusTotal += this.estado.bonusValores.Outros || 0;
        
        // "Reflexos" aplica na esquiva
        bonusTotal += this.estado.bonusValores.Reflexos || 0;
        
        // "Capa" aplica na esquiva
        bonusTotal += this.estado.bonusValores.Capa || 0;
        
        // Redutor de carga
        const redutor = this.config.redutoresCarga[this.estado.nivelCarga] || 0;
        
        // Total
        const total = base + modificador + bonusTotal + redutor;
        
        this.estado.defesas.esquiva = Math.max(total, 1);
    }
    
    calcularDeslocamento() {
        const { dx, ht } = this.estado.atributos;
        
        // Base da fórmula
        const base = this.config.formulas.deslocamento(dx, ht);
        
        // Modificador
        const modInput = document.getElementById('deslocamentoMod');
        const modificador = modInput ? parseInt(modInput.value) || 0 : 0;
        
        // Bônus que se aplicam ao deslocamento
        let bonusTotal = 0;
        
        // "Outros" aplica em tudo
        bonusTotal += this.estado.bonusValores.Outros || 0;
        
        // "Reflexos" aplica no deslocamento
        bonusTotal += this.estado.bonusValores.Reflexos || 0;
        
        // "Capa" aplica no deslocamento
        bonusTotal += this.estado.bonusValores.Capa || 0;
        
        // Redutor de carga
        const redutor = this.config.redutoresCarga[this.estado.nivelCarga] || 0;
        
        // Total
        const total = base + modificador + bonusTotal + redutor;
        
        this.estado.defesas.deslocamento = Math.max(total, 0);
    }
    
    calcularBloqueio() {
        const nhEscudo = this.estado.nh.escudo || this.estado.atributos.dx;
        
        // Base da fórmula
        const base = this.config.formulas.bloqueio(nhEscudo);
        
        // Modificador
        const modInput = document.getElementById('bloqueioMod');
        const modificador = modInput ? parseInt(modInput.value) || 0 : 0;
        
        // Bônus que se aplicam ao bloqueio
        let bonusTotal = 0;
        
        // "Outros" aplica em tudo
        bonusTotal += this.estado.bonusValores.Outros || 0;
        
        // "Escudo" aplica no bloqueio
        bonusTotal += this.estado.bonusValores.Escudo || 0;
        
        // "Capa" aplica no bloqueio
        bonusTotal += this.estado.bonusValores.Capa || 0;
        
        // Total
        const total = base + modificador + bonusTotal;
        
        this.estado.defesas.bloqueio = Math.max(total, 1);
    }
    
    calcularAparar() {
        const nhArma = this.estado.nh.arma;
        
        if (!nhArma || nhArma <= 0) {
            this.estado.defesas.aparar = 0;
            return;
        }
        
        // Base da fórmula
        const base = this.config.formulas.aparar(nhArma);
        
        // Modificador
        const modInput = document.getElementById('apararMod');
        const modificador = modInput ? parseInt(modInput.value) || 0 : 0;
        
        // Bônus que se aplicam ao aparar
        let bonusTotal = 0;
        
        // "Outros" aplica em tudo
        bonusTotal += this.estado.bonusValores.Outros || 0;
        
        // "Capa" aplica no aparar
        bonusTotal += this.estado.bonusValores.Capa || 0;
        
        // Total
        const total = base + modificador + bonusTotal;
        
        this.estado.defesas.aparar = Math.max(total, 1);
    }
    
    // ===== ATUALIZAÇÃO DA INTERFACE =====
    atualizarInterface() {
        // Atualizar cada valor total
        this.atualizarElemento('esquivaTotal', this.estado.defesas.esquiva);
        this.atualizarElemento('deslocamentoTotal', this.estado.defesas.deslocamento.toFixed(2));
        this.atualizarElemento('bloqueioTotal', this.estado.defesas.bloqueio);
        this.atualizarElemento('apararTotal', this.estado.defesas.aparar || 0);
    }
    
    atualizarElemento(id, valor) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = valor;
        }
    }
    
    atualizarTotalBonus() {
        // Calcular total de todos os bônus
        const total = this.estado.bonusValores.Reflexos + 
                     this.estado.bonusValores.Escudo + 
                     this.estado.bonusValores.Capa + 
                     this.estado.bonusValores.Outros;
        
        const totalElement = document.getElementById('totalBonus');
        if (totalElement) {
            totalElement.textContent = total >= 0 ? `+${total}` : `${total}`;
        }
    }
    
    // ===== FUNÇÕES PÚBLICAS =====
    mostrarStatus() {
        console.log('=== 📊 STATUS DO SISTEMA 📊 ===');
        console.log('🎯 Atributos:', this.estado.atributos);
        console.log('💰 Bônus:', this.estado.bonusValores);
        console.log('📊 NH:', this.estado.nh);
        console.log('🛡️ Defesas:', this.estado.defesas);
        console.log('🏋️ Carga:', this.estado.nivelCarga);
        console.log('===============================');
    }
    
    testarBônus() {
        console.log('🧪 TESTANDO APLICAÇÃO DE BÔNUS...');
        
        console.log('💰 Bônus Reflexos:', this.estado.bonusValores.Reflexos);
        console.log('   → Aplica em: Esquiva, Deslocamento');
        
        console.log('💰 Bônus Escudo:', this.estado.bonusValores.Escudo);
        console.log('   → Aplica em: Bloqueio');
        
        console.log('💰 Bônus Capa:', this.estado.bonusValores.Capa);
        console.log('   → Aplica em: Esquiva, Bloqueio, Aparar, Deslocamento');
        
        console.log('💰 Bônus Outros:', this.estado.bonusValores.Outros);
        console.log('   → Aplica em: TODAS as defesas');
        
        console.log('🎯 Verificando cálculos...');
        console.log(`🏃 Esquiva: +${this.estado.bonusValores.Reflexos + this.estado.bonusValores.Capa + this.estado.bonusValores.Outros} de bônus`);
        console.log(`🛡️ Bloqueio: +${this.estado.bonusValores.Escudo + this.estado.bonusValores.Capa + this.estado.bonusValores.Outros} de bônus`);
        console.log(`⚔️ Aparar: +${this.estado.bonusValores.Capa + this.estado.bonusValores.Outros} de bônus`);
        console.log(`👣 Deslocamento: +${this.estado.bonusValores.Reflexos + this.estado.bonusValores.Capa + this.estado.bonusValores.Outros} de bônus`);
        
        console.log('✅ TESTE COMPLETO!');
    }
    
    forcarAtualizacao() {
        console.log('🔄 FORÇANDO ATUALIZAÇÃO COMPLETA...');
        this.estado.nh.escudo = null;
        this.estado.nh.arma = null;
        this.calcularTudo();
    }
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
let sistemaCompleto;

function iniciarSistemaCompleto() {
    if (sistemaCompleto) {
        console.log('⚠️ Sistema já está ativo!');
        return sistemaCompleto;
    }
    
    console.log('🚀 INICIANDO SISTEMA COMPLETO...');
    sistemaCompleto = new SistemaDefesasCompleto();
    window.sistemaDefesasCompleto = sistemaCompleto;
    
    // Esperar página carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => sistemaCompleto.iniciar(), 500);
        });
    } else {
        setTimeout(() => sistemaCompleto.iniciar(), 500);
    }
    
    return sistemaCompleto;
}

// Iniciar quando aba de combate abrir
document.addEventListener('DOMContentLoaded', function() {
    const combateTab = document.getElementById('combate');
    
    function verificarEIniciar() {
        if (combateTab && combateTab.classList.contains('active')) {
            if (!window.sistemaDefesasCompleto) {
                setTimeout(() => {
                    iniciarSistemaCompleto();
                }, 300);
            }
        }
    }
    
    // Verificar inicialmente
    verificarEIniciar();
    
    // Observar mudanças
    if (combateTab) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    verificarEIniciar();
                }
            });
        });
        
        observer.observe(combateTab, { attributes: true });
    }
});

// ===== FUNÇÕES GLOBAIS =====
window.mostrarStatusDefesas = function() {
    if (window.sistemaDefesasCompleto) {
        window.sistemaDefesasCompleto.mostrarStatus();
    } else {
        console.log('❌ Sistema não iniciado. Use iniciarSistemaCompleto()');
    }
};

window.testarBonusDefesas = function() {
    if (window.sistemaDefesasCompleto) {
        window.sistemaDefesasCompleto.testarBônus();
    } else {
        console.log('❌ Sistema não iniciado.');
    }
};

window.atualizarDefesas = function() {
    if (window.sistemaDefesasCompleto) {
        window.sistemaDefesasCompleto.forcarAtualizacao();
    } else {
        console.log('❌ Sistema não iniciado.');
    }
};

// Atalho rápido
window.DC = function() { // Defesas Completas
    if (!window.sistemaDefesasCompleto) {
        iniciarSistemaCompleto();
    } else {
        window.sistemaDefesasCompleto.forcarAtualizacao();
    }
};

console.log('✅ SISTEMA DE DEFESAS COMPLETO CARREGADO!');
console.log('💡 Use mostrarStatusDefesas() para ver status');
console.log('💡 Use testarBonusDefesas() para testar bônus');
console.log('💡 Use atualizarDefesas() ou DC() para forçar atualização');
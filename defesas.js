// defesas.js - SISTEMA COMPLETO E BRABO!
class SistemaDefesasBraboCompleto {
    constructor() {
        console.log('💪💪💪 SISTEMA DE DEFESAS BRABO COMPLETO INICIADO! 💪💪💪');
        
        // CONFIGURAÇÃO DOS BÔNUS
        this.CONFIG_BONUS = {
            // BÔNUS QUE APLICAM EM TODAS AS DEFESAS
            TODOS: ['Outros', 'Capa'],  // Capa e Outros aplicam em TUDO
            
            // BÔNUS ESPECÍFICOS
            ESPECIFICOS: {
                'Reflexos': ['esquiva', 'deslocamento'],
                'Escudo': ['bloqueio']
            }
        };
        
        // ESTADO DO SISTEMA
        this.estado = {
            atributos: { dx: 10, ht: 10 },
            bonus: {
                Reflexos: 0,
                Escudo: 0,
                Capa: 0,
                Outros: 0
            },
            modificadores: {
                esquiva: 0,
                bloqueio: 0,
                aparar: 0,
                deslocamento: 0
            },
            defesas: {
                esquiva: 0,
                bloqueio: 0,
                aparar: 0,
                deslocamento: 0
            },
            nivelCarga: 'nenhuma',
            nh: {
                escudo: null,
                arma: null
            }
        };
        
        this.ultimaAtualizacao = 0;
        this.atualizando = false;
        this.iniciado = false;
        
        console.log('🔥 CONFIGURAÇÃO BRABA PRONTA!');
    }
    
    // ========== INICIALIZAÇÃO BRABA ==========
    iniciar() {
        if (this.iniciado) return;
        console.log('🚀🚀🚀 INICIANDO SISTEMA BRABO COMPLETO! 🚀🚀🚀');
        
        // 1. CONFIGURAR TUDO
        this.configurarSistemaInteiro();
        
        // 2. PEGAR VALORES INICIAIS
        this.carregarTudoAgora();
        
        // 3. CALCULAR PELA PRIMEIRA VEZ
        this.calcularTudoComForca();
        
        // 4. INICIAR MONITORAMENTO BRABO
        this.iniciarMonitoramentoBrabo();
        
        // 5. INICIAR ATUALIZAÇÃO AUTOMÁTICA
        this.iniciarAtualizacaoAutomatica();
        
        this.iniciado = true;
        console.log('✅✅✅ SISTEMA BRABO COMPLETO PRONTO PARA AÇÃO! ✅✅✅');
    }
    
    configurarSistemaInteiro() {
        console.log('🔧 CONFIGURANDO SISTEMA INTEIRO...');
        
        // CONFIGURAR INPUTS DE BÔNUS
        this.configurarInputsBonus();
        
        // CONFIGURAR INPUTS DE MODIFICADOR
        this.configurarInputsModificador();
        
        // CONFIGURAR INPUTS DE ATRIBUTOS
        this.configurarInputsAtributos();
        
        // CONFIGURAR BOTÕES
        this.configurarBotoes();
    }
    
    configurarInputsBonus() {
        console.log('💰 CONFIGURANDO INPUTS DE BÔNUS...');
        
        ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonus => {
            const input = document.getElementById(`bonus${bonus}`);
            if (input) {
                // REMOVER EVENTOS ANTIGOS
                const novoInput = input.cloneNode(true);
                input.parentNode.replaceChild(novoInput, input);
                
                // CONFIGURAR NOVOS EVENTOS
                novoInput.addEventListener('input', () => {
                    this.estado.bonus[bonus] = parseInt(novoInput.value) || 0;
                    console.log(`💰 ${bonus} alterado para: ${this.estado.bonus[bonus]}`);
                    this.calcularTudoComForca();
                });
                
                novoInput.addEventListener('change', () => {
                    this.estado.bonus[bonus] = parseInt(novoInput.value) || 0;
                    console.log(`💰 ${bonus} confirmado: ${this.estado.bonus[bonus]}`);
                    this.calcularTudoComForca();
                });
                
                // VALOR INICIAL
                this.estado.bonus[bonus] = parseInt(novoInput.value) || 0;
            }
        });
    }
    
    configurarInputsModificador() {
        console.log('🎛️ CONFIGURANDO MODIFICADORES...');
        
        ['esquiva', 'bloqueio', 'aparar', 'deslocamento'].forEach(defesa => {
            const input = document.getElementById(`${defesa}Mod`);
            if (input) {
                input.addEventListener('change', () => {
                    this.estado.modificadores[defesa] = parseInt(input.value) || 0;
                    this.calcularTudoComForca();
                });
            }
        });
    }
    
    configurarInputsAtributos() {
        console.log('🎯 CONFIGURANDO ATRIBUTOS...');
        
        ['DX', 'HT'].forEach(atributo => {
            const input = document.getElementById(atributo);
            if (input) {
                input.addEventListener('input', () => {
                    setTimeout(() => {
                        this.estado.atributos[atributo.toLowerCase()] = parseInt(input.value) || 10;
                        this.calcularTudoComForca();
                    }, 300);
                });
            }
        });
    }
    
    configurarBotoes() {
        console.log('🔘 CONFIGURANDO BOTÕES...');
        
        // BOTÕES DE +/- DOS MODIFICADORES
        document.querySelectorAll('.defesa-modificador, .defesa-controle').forEach(container => {
            const minus = container.querySelector('.minus, .mod-btn.minus');
            const plus = container.querySelector('.plus, .mod-btn.plus');
            const input = container.querySelector('input[type="number"]');
            
            if (minus && plus && input) {
                const defesa = input.id.replace('Mod', '');
                
                minus.addEventListener('click', () => {
                    const valorAtual = parseInt(input.value) || 0;
                    input.value = valorAtual - 1;
                    this.estado.modificadores[defesa] = valorAtual - 1;
                    this.calcularTudoComForca();
                });
                
                plus.addEventListener('click', () => {
                    const valorAtual = parseInt(input.value) || 0;
                    input.value = valorAtual + 1;
                    this.estado.modificadores[defesa] = valorAtual + 1;
                    this.calcularTudoComForca();
                });
            }
        });
    }
    
    carregarTudoAgora() {
        console.log('📥 CARREGANDO TUDO AGORA...');
        
        // CARREGAR ATRIBUTOS
        const dxInput = document.getElementById('DX');
        const htInput = document.getElementById('HT');
        
        if (dxInput) this.estado.atributos.dx = parseInt(dxInput.value) || 10;
        if (htInput) this.estado.atributos.ht = parseInt(htInput.value) || 10;
        
        // CARREGAR BÔNUS
        ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonus => {
            const input = document.getElementById(`bonus${bonus}`);
            if (input) {
                this.estado.bonus[bonus] = parseInt(input.value) || 0;
            }
        });
        
        // CARREGAR MODIFICADORES
        ['esquiva', 'bloqueio', 'aparar', 'deslocamento'].forEach(defesa => {
            const input = document.getElementById(`${defesa}Mod`);
            if (input) {
                this.estado.modificadores[defesa] = parseInt(input.value) || 0;
            }
        });
        
        // CARREGAR NÍVEL DE CARGA
        const cargaElement = document.getElementById('nivelCarga');
        if (cargaElement) {
            this.estado.nivelCarga = cargaElement.textContent.toLowerCase().trim();
        }
        
        console.log('📊 DADOS CARREGADOS:', this.estado);
    }
    
    // ========== CÁLCULOS BRABOS ==========
    calcularTudoComForca() {
        if (this.atualizando) return;
        
        this.atualizando = true;
        console.log('💪💪💪 CALCULANDO TUDO COM FORÇA! 💪💪💪');
        
        try {
            // ATUALIZAR CACHE
            this.atualizarCache();
            
            // BUSCAR NH ATUALIZADO
            this.buscarNHAtualizado();
            
            // CALCULAR CADA DEFESA
            this.calcularEsquivaComBonus();
            this.calcularDeslocamentoComBonus();
            this.calcularBloqueioComBonus();
            this.calcularApararComBonus();
            
            // ATUALIZAR TELA
            this.atualizarTelaComForca();
            
            // ATUALIZAR TOTAL DE BÔNUS
            this.atualizarTotalBonusComForca();
            
            this.ultimaAtualizacao = Date.now();
            console.log('✅✅✅ CÁLCULO COMPLETO COM SUCESSO! ✅✅✅');
        } catch (error) {
            console.error('❌❌❌ ERRO NO CÁLCULO:', error);
        } finally {
            this.atualizando = false;
        }
    }
    
    atualizarCache() {
        // ATUALIZAR ATRIBUTOS DO CACHE
        const dxInput = document.getElementById('DX');
        const htInput = document.getElementById('HT');
        
        if (dxInput) this.estado.atributos.dx = parseInt(dxInput.value) || 10;
        if (htInput) this.estado.atributos.ht = parseInt(htInput.value) || 10;
        
        // ATUALIZAR BÔNUS DO CACHE
        ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonus => {
            const input = document.getElementById(`bonus${bonus}`);
            if (input) {
                this.estado.bonus[bonus] = parseInt(input.value) || 0;
            }
        });
    }
    
    buscarNHAtualizado() {
        // BUSCAR NH DO ESCUDO
        this.estado.nh.escudo = this.calcularNHEscudo();
        
        // BUSCAR NH DA ARMA
        this.estado.nh.arma = this.calcularNHArma();
    }
    
    calcularNHEscudo() {
        const dx = this.estado.atributos.dx;
        
        // PROCURAR PERÍCIA DE ESCUDO
        let nivelEscudo = 0;
        
        // MÉTODO 1: PERÍCIAS APRENDIDAS
        const container = document.getElementById('pericias-aprendidas');
        if (container) {
            const itens = container.querySelectorAll('.pericia-aprendida-item');
            
            for (let item of itens) {
                const texto = item.textContent || '';
                if (texto.toLowerCase().includes('escudo')) {
                    // EXTRAIR NÍVEL
                    const match = texto.match(/[+-]?\d+/);
                    if (match) {
                        nivelEscudo = parseInt(match[0]) || 0;
                    }
                    break;
                }
            }
        }
        
        // MÉTODO 2: LOCALSTORAGE
        if (nivelEscudo === 0) {
            try {
                const salvo = localStorage.getItem('periciasAprendidas');
                if (salvo) {
                    const pericias = JSON.parse(salvo);
                    const escudo = pericias.find(p => 
                        p.nome && p.nome.toLowerCase().includes('escudo')
                    );
                    
                    if (escudo) {
                        nivelEscudo = escudo.nivel || 0;
                    }
                }
            } catch (e) {
                // IGNORA ERRO
            }
        }
        
        const nh = dx + nivelEscudo;
        console.log(`🛡️ NH do Escudo: ${nh} (DX ${dx} + nível ${nivelEscudo})`);
        return nh;
    }
    
    calcularNHArma() {
        // VERIFICAR SE TEM ARMA EQUIPADA
        const comArma = document.getElementById('comArma');
        if (!comArma || comArma.style.display === 'none') {
            console.log('⚔️ Nenhuma arma equipada');
            return 0;
        }
        
        const dx = this.estado.atributos.dx;
        
        // BUSCAR PERÍCIA DA ARMA
        let nivelArma = 0;
        let encontrou = false;
        
        // BUSCAR NA LISTA DE PERÍCIAS
        const container = document.getElementById('pericias-aprendidas');
        if (container) {
            const itens = container.querySelectorAll('.pericia-aprendida-item');
            
            for (let item of itens) {
                const texto = item.textContent || '';
                
                // VERIFICAR SE É PERÍCIA DE ARMA
                if (this.ehPericiaDeArma(texto)) {
                    const match = texto.match(/[+-]?\d+/);
                    if (match) {
                        nivelArma = parseInt(match[0]) || 0;
                        encontrou = true;
                        break;
                    }
                }
            }
        }
        
        if (!encontrou) {
            // TENTAR LOCALSTORAGE
            try {
                const salvo = localStorage.getItem('periciasAprendidas');
                if (salvo) {
                    const pericias = JSON.parse(salvo);
                    for (let pericia of pericias) {
                        if (pericia.nome && this.ehPericiaDeArma(pericia.nome)) {
                            nivelArma = pericia.nivel || 0;
                            encontrou = true;
                            break;
                        }
                    }
                }
            } catch (e) {
                // IGNORA ERRO
            }
        }
        
        const nh = encontrou ? (dx + nivelArma) : dx;
        console.log(`⚔️ NH da Arma: ${nh} ${encontrou ? '(com perícia)' : '(DX mínimo)'}`);
        return encontrou ? nh : 0;
    }
    
    ehPericiaDeArma(texto) {
        const textoLower = texto.toLowerCase();
        const armas = [
            'adaga', 'espada', 'machado', 'maça', 'arco', 'lanca', 'lança',
            'martelo', 'faca', 'sabre', 'rapieira', 'terçado', 'bastão',
            'tonfa', 'pistola', 'rifle', 'shotgun', 'besta', 'funda'
        ];
        
        for (let arma of armas) {
            if (textoLower.includes(arma)) {
                return true;
            }
        }
        
        return false;
    }
    
    // ========== CÁLCULO DE CADA DEFESA COM BÔNUS ==========
    calcularEsquivaComBonus() {
        const { dx, ht } = this.estado.atributos;
        
        // FÓRMULA BASE
        const base = Math.floor((dx + ht) / 4) + 3;
        
        // MODIFICADOR
        const modificador = this.estado.modificadores.esquiva;
        
        // CALCULAR BÔNUS TOTAL
        let bonusTotal = 0;
        
        // BÔNUS QUE APLICAM NA ESQUIVA
        if (this.CONFIG_BONUS.TODOS.includes('Capa')) {
            bonusTotal += this.estado.bonus.Capa;
        }
        if (this.CONFIG_BONUS.TODOS.includes('Outros')) {
            bonusTotal += this.estado.bonus.Outros;
        }
        
        // BÔNUS ESPECÍFICOS
        if (this.CONFIG_BONUS.ESPECIFICOS['Reflexos']?.includes('esquiva')) {
            bonusTotal += this.estado.bonus.Reflexos;
        }
        
        // REDUTOR DE CARGA
        const redutorCarga = this.getRedutorCarga(this.estado.nivelCarga);
        
        // TOTAL
        const total = base + modificador + bonusTotal + redutorCarga;
        
        this.estado.defesas.esquiva = Math.max(total, 1);
        
        console.log(`🏃 ESQUIVA: ${total} = base ${base} + mod ${modificador} + bonus ${bonusTotal} + carga ${redutorCarga}`);
    }
    
    calcularDeslocamentoComBonus() {
        const { dx, ht } = this.estado.atributos;
        
        // FÓRMULA BASE
        const base = (dx + ht) / 4;
        
        // MODIFICADOR
        const modificador = this.estado.modificadores.deslocamento;
        
        // CALCULAR BÔNUS TOTAL
        let bonusTotal = 0;
        
        // BÔNUS QUE APLICAM NO DESLOCAMENTO
        if (this.CONFIG_BONUS.TODOS.includes('Capa')) {
            bonusTotal += this.estado.bonus.Capa;
        }
        if (this.CONFIG_BONUS.TODOS.includes('Outros')) {
            bonusTotal += this.estado.bonus.Outros;
        }
        
        // BÔNUS ESPECÍFICOS
        if (this.CONFIG_BONUS.ESPECIFICOS['Reflexos']?.includes('deslocamento')) {
            bonusTotal += this.estado.bonus.Reflexos;
        }
        
        // REDUTOR DE CARGA
        const redutorCarga = this.getRedutorCarga(this.estado.nivelCarga);
        
        // TOTAL
        const total = base + modificador + bonusTotal + redutorCarga;
        
        this.estado.defesas.deslocamento = Math.max(total, 0);
        
        console.log(`👣 DESLOCAMENTO: ${total.toFixed(2)} = base ${base.toFixed(2)} + mod ${modificador} + bonus ${bonusTotal} + carga ${redutorCarga}`);
    }
    
    calcularBloqueioComBonus() {
        const nhEscudo = this.estado.nh.escudo || this.estado.atributos.dx;
        
        // FÓRMULA BASE
        const base = Math.floor(nhEscudo / 2) + 3;
        
        // MODIFICADOR
        const modificador = this.estado.modificadores.bloqueio;
        
        // CALCULAR BÔNUS TOTAL
        let bonusTotal = 0;
        
        // BÔNUS QUE APLICAM NO BLOQUEIO
        if (this.CONFIG_BONUS.TODOS.includes('Capa')) {
            bonusTotal += this.estado.bonus.Capa;
        }
        if (this.CONFIG_BONUS.TODOS.includes('Outros')) {
            bonusTotal += this.estado.bonus.Outros;
        }
        
        // BÔNUS ESPECÍFICOS
        if (this.CONFIG_BONUS.ESPECIFICOS['Escudo']?.includes('bloqueio')) {
            bonusTotal += this.estado.bonus.Escudo;
        }
        
        // TOTAL
        const total = base + modificador + bonusTotal;
        
        this.estado.defesas.bloqueio = Math.max(total, 1);
        
        console.log(`🛡️ BLOQUEIO: ${total} = base ${base} + mod ${modificador} + bonus ${bonusTotal} (NH: ${nhEscudo})`);
    }
    
    calcularApararComBonus() {
        const nhArma = this.estado.nh.arma;
        
        if (!nhArma || nhArma <= 0) {
            this.estado.defesas.aparar = 0;
            console.log(`⚔️ APARAR: Nenhuma arma equipada`);
            return;
        }
        
        // FÓRMULA BASE
        const base = Math.floor(nhArma / 2) + 3;
        
        // MODIFICADOR
        const modificador = this.estado.modificadores.aparar;
        
        // CALCULAR BÔNUS TOTAL
        let bonusTotal = 0;
        
        // BÔNUS QUE APLICAM NO APARAR
        if (this.CONFIG_BONUS.TODOS.includes('Capa')) {
            bonusTotal += this.estado.bonus.Capa;
        }
        if (this.CONFIG_BONUS.TODOS.includes('Outros')) {
            bonusTotal += this.estado.bonus.Outros;
        }
        
        // TOTAL
        const total = base + modificador + bonusTotal;
        
        this.estado.defesas.aparar = Math.max(total, 1);
        
        console.log(`⚔️ APARAR: ${total} = base ${base} + mod ${modificador} + bonus ${bonusTotal} (NH: ${nhArma})`);
    }
    
    getRedutorCarga(nivelCarga) {
        const redutores = {
            'nenhuma': 0,
            'leve': -1,
            'média': -2,
            'pesada': -3,
            'muito pesada': -4
        };
        return redutores[nivelCarga] || 0;
    }
    
    // ========== ATUALIZAÇÃO DA TELA ==========
    atualizarTelaComForca() {
        console.log('💥 ATUALIZANDO TELA COM FORÇA!');
        
        // ATUALIZAR CADA VALOR
        this.atualizarElemento('esquivaTotal', this.estado.defesas.esquiva);
        this.atualizarElemento('deslocamentoTotal', this.estado.defesas.deslocamento.toFixed(2));
        this.atualizarElemento('bloqueioTotal', this.estado.defesas.bloqueio);
        this.atualizarElemento('apararTotal', this.estado.defesas.aparar || 0);
    }
    
    atualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento && elemento.textContent !== String(valor)) {
            elemento.textContent = valor;
        }
    }
    
    atualizarTotalBonusComForca() {
        const total = this.estado.bonus.Reflexos + 
                     this.estado.bonus.Escudo + 
                     this.estado.bonus.Capa + 
                     this.estado.bonus.Outros;
        
        const totalElement = document.getElementById('totalBonus');
        if (totalElement) {
            const texto = total >= 0 ? `+${total}` : `${total}`;
            if (totalElement.textContent !== texto) {
                totalElement.textContent = texto;
            }
        }
    }
    
    // ========== MONITORAMENTO BRABO ==========
    iniciarMonitoramentoBrabo() {
        console.log('👁️‍🗨️👁️‍🗨️👁️‍🗨️ INICIANDO MONITORAMENTO BRABO! 👁️‍🗨️👁️‍🗨️👁️‍🗨️');
        
        // MONITORAR NÍVEL DE CARGA
        this.monitorarCarga();
        
        // MONITORAR MUDANÇAS EM PERÍCIAS
        this.monitorarPericias();
        
        // MONITORAR MUDANÇAS EM EQUIPAMENTOS
        this.monitorarEquipamentos();
        
        // MONITORAR MUDANÇAS GERAIS
        this.monitorarGeral();
    }
    
    monitorarCarga() {
        const cargaElement = document.getElementById('nivelCarga');
        if (cargaElement) {
            const observer = new MutationObserver(() => {
                const novoNivel = cargaElement.textContent.toLowerCase().trim();
                if (novoNivel !== this.estado.nivelCarga) {
                    this.estado.nivelCarga = novoNivel;
                    this.calcularTudoComForca();
                }
            });
            
            observer.observe(cargaElement, { 
                childList: true, 
                characterData: true 
            });
        }
    }
    
    monitorarPericias() {
        const container = document.getElementById('pericias-aprendidas') || 
                         document.getElementById('lista-pericias');
        
        if (container) {
            const observer = new MutationObserver(() => {
                console.log('📚 Mudança detectada em perícias!');
                this.estado.nh.escudo = null;
                this.estado.nh.arma = null;
                setTimeout(() => this.calcularTudoComForca(), 500);
            });
            
            observer.observe(container, { 
                childList: true, 
                subtree: true 
            });
        }
    }
    
    monitorarEquipamentos() {
        const armaInfo = document.getElementById('armaInfo');
        if (armaInfo) {
            const observer = new MutationObserver(() => {
                console.log('⚔️ Mudança detectada em equipamento!');
                this.estado.nh.arma = null;
                setTimeout(() => this.calcularTudoComForca(), 500);
            });
            
            observer.observe(armaInfo, { 
                childList: true, 
                attributes: true,
                subtree: true 
            });
        }
    }
    
    monitorarGeral() {
        // MONITORAR MUDANÇAS GERAIS NO DOM
        const observer = new MutationObserver(() => {
            // Verificar se houve mudanças relevantes
            this.calcularTudoComForca();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['value', 'class', 'style']
        });
    }
    
    iniciarAtualizacaoAutomatica() {
        // ATUALIZAR A CADA SEGUNDO (SÓ PRA GARANTIR)
        setInterval(() => {
            if (!this.atualizando) {
                this.calcularTudoComForca();
            }
        }, 1000);
    }
    
    // ========== FUNÇÕES PÚBLICAS BRABAS ==========
    mostrarStatusCompleto() {
        console.log('=== 🦾🦾🦾 STATUS COMPLETO DO SISTEMA 🦾🦾🦾 ===');
        console.log('🎯 ATRIBUTOS:', this.estado.atributos);
        console.log('💰 BÔNUS:', this.estado.bonus);
        console.log('🎛️ MODIFICADORES:', this.estado.modificadores);
        console.log('📊 NH:', this.estado.nh);
        console.log('🛡️ DEFESAS:', this.estado.defesas);
        console.log('🏋️ CARGA:', this.estado.nivelCarga);
        console.log('⏰ ÚLTIMA ATUALIZAÇÃO:', new Date(this.ultimaAtualizacao).toLocaleTimeString());
        console.log('================================================');
    }
    
    testarAplicacaoBonus() {
        console.log('🧪🧪🧪 TESTANDO APLICAÇÃO DE BÔNUS 🧪🧪🧪');
        
        const bonus = this.estado.bonus;
        
        console.log('\n💰 BÔNUS ATUAIS:');
        console.log(`   Reflexos: ${bonus.Reflexos} → Esquiva, Deslocamento`);
        console.log(`   Escudo: ${bonus.Escudo} → Bloqueio`);
        console.log(`   Capa: ${bonus.Capa} → TODAS as defesas`);
        console.log(`   Outros: ${bonus.Outros} → TODAS as defesas`);
        
        console.log('\n🎯 BÔNUS APLICADOS EM CADA DEFESA:');
        console.log(`🏃 Esquiva: ${bonus.Reflexos + bonus.Capa + bonus.Outros}`);
        console.log(`🛡️ Bloqueio: ${bonus.Escudo + bonus.Capa + bonus.Outros}`);
        console.log(`⚔️ Aparar: ${bonus.Capa + bonus.Outros}`);
        console.log(`👣 Deslocamento: ${bonus.Reflexos + bonus.Capa + bonus.Outros}`);
        
        console.log('\n✅ TESTE DE APLICAÇÃO COMPLETO!');
    }
    
    forcarRecalculoTotal() {
        console.log('💥💥💥 FORÇANDO RECÁLCULO TOTAL! 💥💥💥');
        
        // LIMPAR CACHE
        this.estado.nh.escudo = null;
        this.estado.nh.arma = null;
        
        // RECARREGAR TUDO
        this.carregarTudoAgora();
        
        // CALCULAR
        this.calcularTudoComForca();
        
        console.log('✅ RECÁLCULO FORÇADO COMPLETO!');
    }
}

// ========== INICIALIZAÇÃO GLOBAL ==========
let sistemaBraboCompleto;

function iniciarSistemaBraboCompleto() {
    if (sistemaBraboCompleto) {
        console.log('⚠️ Sistema já está ativo! Mostrando status...');
        sistemaBraboCompleto.mostrarStatusCompleto();
        return sistemaBraboCompleto;
    }
    
    console.log('🌋🌋🌋 INICIANDO SISTEMA BRABO COMPLETO! 🌋🌋🌋');
    sistemaBraboCompleto = new SistemaDefesasBraboCompleto();
    window.sistemaDefesasBraboCompleto = sistemaBraboCompleto;
    
    // INICIAR IMEDIATAMENTE
    setTimeout(() => {
        sistemaBraboCompleto.iniciar();
    }, 500);
    
    return sistemaBraboCompleto;
}

// INICIAR AUTOMATICAMENTE QUANDO COMBATE ABRIR
document.addEventListener('DOMContentLoaded', function() {
    const combateTab = document.getElementById('combate');
    
    function verificarEIniciar() {
        if (combateTab && combateTab.classList.contains('active')) {
            console.log('🎯 ABA DE COMBATE ATIVA - INICIANDO SISTEMA...');
            iniciarSistemaBraboCompleto();
        }
    }
    
    // VERIFICAR INICIALMENTE
    verificarEIniciar();
    
    // OBSERVAR MUDANÇAS
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

// ========== FUNÇÕES GLOBAIS BRABAS ==========
window.mostrarStatusBrabo = function() {
    if (window.sistemaDefesasBraboCompleto) {
        window.sistemaDefesasBraboCompleto.mostrarStatusCompleto();
    } else {
        console.log('❌ Sistema não iniciado. Use iniciarSistemaBraboCompleto()');
    }
};

window.testarBonusBrabo = function() {
    if (window.sistemaDefesasBraboCompleto) {
        window.sistemaDefesasBraboCompleto.testarAplicacaoBonus();
    } else {
        console.log('❌ Sistema não iniciado.');
    }
};

window.recarregarTudoBrabo = function() {
    if (window.sistemaDefesasBraboCompleto) {
        window.sistemaDefesasBraboCompleto.forcarRecalculoTotal();
    } else {
        console.log('❌ Sistema não iniciado. Iniciando...');
        iniciarSistemaBraboCompleto();
    }
};

// ATALHOS RÁPIDOS
window.SDB = function() { // Sistema Defesas Brabo
    if (!window.sistemaDefesasBraboCompleto) {
        iniciarSistemaBraboCompleto();
    } else {
        window.sistemaDefesasBraboCompleto.forcarRecalculoTotal();
    }
};

window.B = function() { // Bonus
    if (window.sistemaDefesasBraboCompleto) {
        window.sistemaDefesasBraboCompleto.testarAplicacaoBonus();
    }
};

console.log('🔥🔥🔥 SISTEMA DE DEFESAS BRABO COMPLETO CARREGADO! 🔥🔥🔥');
console.log('💡 Use mostrarStatusBrabo() para ver status completo');
console.log('💡 Use testarBonusBrabo() ou B() para testar bônus');
console.log('💡 Use recarregarTudoBrabo() ou SDB() para forçar recálculo');
console.log('💡 Sistema inicia automaticamente quando a aba de Combate é aberta!');
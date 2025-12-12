// defesas.js - SISTEMA COMPLETO E BRABO COM FADIGA INTEGRADA
// VERSÃO COMPLETA - PARTE 1/2

class SistemaDefesasBraboCompleto {
    constructor() {
        console.log('💪💪💪 SISTEMA DE DEFESAS BRABO COMPLETO INICIADO! 💪💪💪');
        
        // CONFIGURAÇÃO CORRETA DOS BÔNUS
        this.CONFIG_BONUS = {
            // TODOS os bônus abaixo aplicam SOMENTE em:
            // ESQUIVA, BLOQUEIO e APARAR
            BONUS_TODOS: ['Reflexos', 'Escudo', 'Capa', 'Outros'],
            // Lista das defesas que recebem bônus
            DEFESAS_COM_BONUS: ['esquiva', 'bloqueio', 'aparar']
        };
        
        // ESTADO COMPLETO DO SISTEMA
        this.estado = {
            // Atributos básicos
            atributos: { dx: 10, ht: 10 },
            
            // Bônus manuais
            bonus: {
                Reflexos: 0,
                Escudo: 0,
                Capa: 0,
                Outros: 0
            },
            
            // Modificadores individuais
            modificadores: {
                esquiva: 0,
                bloqueio: 0,
                aparar: 0,
                deslocamento: 0
            },
            
            // Valores finais das defesas
            defesas: {
                esquiva: 0,
                bloqueio: 0,
                aparar: 0,
                deslocamento: 0
            },
            
            // Nível de carga (afeta esquiva e deslocamento)
            nivelCarga: 'nenhuma',
            
            // Níveis de habilidade para escudo e arma
            nh: {
                escudo: null,
                arma: null
            },
            
            // NOVO: Estado de fadiga
            fadiga: {
                ativa: false,
                pfAtual: null,      // Será detectado automaticamente
                pfMaximo: null,     // Será detectado automaticamente
                limiteFadiga: null  // 1/3 do PF máximo arredondado para CIMA
            }
        };
        
        // Controles do sistema
        this.ultimaAtualizacao = 0;
        this.atualizando = false;
        this.iniciado = false;
        
        console.log('🔥 CONFIGURAÇÃO BRABA PRONTA!');
    }
    
    // ========== INICIALIZAÇÃO BRABA ==========
    iniciar() {
        if (this.iniciado) {
            console.log('⚠️ Sistema já está ativo!');
            return;
        }
        
        console.log('🚀🚀🚀 INICIANDO SISTEMA BRABO COMPLETO! 🚀🚀🚀');
        
        // 1. CONFIGURAR TUDO
        this.configurarSistemaInteiro();
        
        // 2. PEGAR VALORES INICIAIS
        this.carregarTudoAgora();
        
        // 3. DETECTAR ESTADO INICIAL DE FADIGA
        this.detectarEstadoFadiga();
        
        // 4. CALCULAR PELA PRIMEIRA VEZ
        this.calcularTudoComForca();
        
        // 5. INICIAR MONITORAMENTO BRABO
        this.iniciarMonitoramentoBrabo();
        
        // 6. INICIAR ATUALIZAÇÃO AUTOMÁTICA
        this.iniciarAtualizacaoAutomatica();
        
        this.iniciado = true;
        console.log('✅✅✅ SISTEMA BRABO COMPLETO PRONTO PARA AÇÃO! ✅✅✅');
    }
    
    configurarSistemaInteiro() {
        console.log('🔧 CONFIGURANDO SISTEMA INTEIRO...');
        
        this.configurarInputsBonus();
        this.configurarInputsModificador();
        this.configurarInputsAtributos();
        this.configurarBotoes();
    }
    
    configurarInputsBonus() {
        console.log('💰 CONFIGURANDO INPUTS DE BÔNUS...');
        
        ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonus => {
            const input = document.getElementById(`bonus${bonus}`);
            if (input) {
                // Clonar para remover eventos antigos
                const novoInput = input.cloneNode(true);
                input.parentNode.replaceChild(novoInput, input);
                
                // Configurar novo evento de input
                novoInput.addEventListener('input', () => {
                    this.estado.bonus[bonus] = parseInt(novoInput.value) || 0;
                    console.log(`💰 ${bonus} alterado para: ${this.estado.bonus[bonus]}`);
                    this.calcularTudoComForca();
                });
                
                // Configurar evento de change
                novoInput.addEventListener('change', () => {
                    this.estado.bonus[bonus] = parseInt(novoInput.value) || 0;
                    console.log(`💰 ${bonus} confirmado: ${this.estado.bonus[bonus]}`);
                    this.calcularTudoComForca();
                });
                
                // Definir valor inicial
                this.estado.bonus[bonus] = parseInt(novoInput.value) || 0;
            }
        });
    }
    
    configurarInputsModificador() {
        console.log('🎛️ CONFIGURANDO MODIFICADORES...');
        
        // Configurar modificadores para as 3 defesas ativas
        ['esquiva', 'bloqueio', 'aparar'].forEach(defesa => {
            const input = document.getElementById(`${defesa}Mod`);
            if (input) {
                input.addEventListener('change', () => {
                    this.estado.modificadores[defesa] = parseInt(input.value) || 0;
                    this.calcularTudoComForca();
                });
            }
        });
        
        // Configurar modificador de deslocamento (separado)
        const deslocamentoInput = document.getElementById('deslocamentoMod');
        if (deslocamentoInput) {
            deslocamentoInput.addEventListener('change', () => {
                this.estado.modificadores.deslocamento = parseInt(deslocamentoInput.value) || 0;
                this.calcularTudoComForca();
            });
        }
    }
    
    configurarInputsAtributos() {
        console.log('🎯 CONFIGURANDO ATRIBUTOS...');
        
        ['DX', 'HT'].forEach(atributo => {
            const input = document.getElementById(atributo);
            if (input) {
                input.addEventListener('input', () => {
                    // Pequeno delay para evitar cálculos excessivos
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
    
    // ========== NOVO: SISTEMA DE DETECÇÃO DE FADIGA ==========
    detectarEstadoFadiga() {
        console.log('🔍 DETECTANDO ESTADO DE FADIGA...');
        
        let pfAtual = null;
        let pfMaximo = null;
        
        // MÉTODO 1: Tentar pegar dos elementos do sistema PV-PF
        const pfAtualElement = document.getElementById('pfAtualDisplay');
        const pfMaxElement = document.getElementById('pfMaxDisplay');
        
        if (pfAtualElement && pfMaxElement) {
            // Pode ser input (value) ou span (textContent)
            const atualVal = pfAtualElement.value || pfAtualElement.textContent;
            const maxVal = pfMaxElement.textContent;
            
            pfAtual = parseInt(atualVal) || 10;
            pfMaximo = parseInt(maxVal) || 10;
            
            console.log(`📊 PF detectado: ${pfAtual}/${pfMaximo} (dos elementos)`);
        }
        
        // MÉTODO 2: Tentar detectar visualmente pelo marcador
        if (pfAtual === null) {
            const marcadorFadiga = document.querySelector('.marcador-fadiga');
            if (marcadorFadiga) {
                const cor = marcadorFadiga.style.backgroundColor;
                if (cor === 'rgb(231, 76, 60)' || cor === '#e74c3c') {
                    // Marcador vermelho = em fadiga
                    pfAtual = 3; // Valor estimado para fadiga
                    pfMaximo = 10; // Valor padrão
                    console.log(`📊 PF detectado: ${pfAtual}/${pfMaximo} (do marcador visual)`);
                }
            }
        }
        
        // MÉTODO 3: Tentar pegar de variável global
        if (pfAtual === null && window.estadoPVPF) {
            pfAtual = window.estadoPVPF.pfAtual || 10;
            pfMaximo = window.estadoPVPF.pfMaximo || 10;
            console.log(`📊 PF detectado: ${pfAtual}/${pfMaximo} (da variável global)`);
        }
        
        // Se não conseguiu detectar, usar valores padrão
        if (pfAtual === null) {
            pfAtual = 10;
            pfMaximo = 10;
            console.log(`📊 PF: usando padrão ${pfAtual}/${pfMaximo}`);
        }
        
        // Calcular limite de fadiga (1/3 arredondado para CIMA - REGRA GURPS)
        const limiteFadiga = Math.ceil(pfMaximo / 3);
        
        // Verificar se está em fadiga
        const fadigaAtiva = pfAtual <= limiteFadiga;
        
        // Atualizar estado
        this.estado.fadiga = {
            ativa: fadigaAtiva,
            pfAtual: pfAtual,
            pfMaximo: pfMaximo,
            limiteFadiga: limiteFadiga
        };
        
        console.log(`📊 FADIGA: PF ${pfAtual}/${pfMaximo}, Limite: ${limiteFadiga}, Ativa: ${fadigaAtiva}`);
        
        return fadigaAtiva;
    }
    
    aplicarPenalidadeFadiga(valor, nomeDefesa) {
        const fadigaAtiva = this.estado.fadiga.ativa;
        
        if (!fadigaAtiva) {
            return valor; // Sem penalidade
        }
        
        console.log(`⚠️ FADIGA ATIVA! Penalidade em ${nomeDefesa.toUpperCase()}`);
        
        // Apenas esquiva e deslocamento sofrem penalidade
        if (nomeDefesa === 'esquiva' || nomeDefesa === 'deslocamento') {
            // Metade do valor, arredondando para CIMA (regra GURPS)
            const valorMetade = Math.ceil(valor / 2);
            
            console.log(`   ${nomeDefesa}: ${valor} → ${valorMetade} (metade arredondada para cima)`);
            
            // Atualizar indicador visual
            this.atualizarIndicadorFadiga();
            
            return valorMetade;
        }
        
        // Bloqueio e aparar não sofrem penalidade
        return valor;
    }
    
    // CONTINUA NA PARTE 2...
        // ========== CARREGAMENTO INICIAL ==========
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
    
    // ========== CÁLCULOS BRABOS COM FADIGA ==========
    calcularTudoComForca() {
        if (this.atualizando) return;
        
        this.atualizando = true;
        console.log('💪💪💪 CALCULANDO TUDO COM FORÇA! 💪💪💪');
        
        try {
            // 1. ATUALIZAR CACHE
            this.atualizarCache();
            
            // 2. DETECTAR FADIGA (Faz aqui também para garantir)
            this.detectarEstadoFadiga();
            
            // 3. BUSCAR NH ATUALIZADO
            this.buscarNHAtualizado();
            
            // 4. CALCULAR CADA DEFESA
            this.calcularEsquivaComBonus();
            this.calcularDeslocamentoComBonus();
            this.calcularBloqueioComBonus();
            this.calcularApararComBonus();
            
            // 5. ATUALIZAR TELA
            this.atualizarTelaComForca();
            
            // 6. ATUALIZAR TOTAL DE BÔNUS
            this.atualizarTotalBonusComForca();
            
            // 7. MOSTRAR STATUS DE FADIGA
            this.mostrarStatusFadiga();
            
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
    
    // ========== CÁLCULO DE CADA DEFESA COM BÔNUS E FADIGA ==========
    calcularEsquivaComBonus() {
        const { dx, ht } = this.estado.atributos;
        
        // FÓRMULA BASE
        const base = Math.floor((dx + ht) / 4) + 3;
        
        // MODIFICADOR
        const modificador = this.estado.modificadores.esquiva;
        
        // CALCULAR BÔNUS TOTAL
        let bonusTotal = 0;
        
        // SOMA TODOS OS BÔNUS MANUAIS NA ESQUIVA
        bonusTotal += this.estado.bonus.Reflexos;  // ✅
        bonusTotal += this.estado.bonus.Escudo;    // ✅  
        bonusTotal += this.estado.bonus.Capa;      // ✅
        bonusTotal += this.estado.bonus.Outros;    // ✅
        
        // REDUTOR DE CARGA
        const redutorCarga = this.getRedutorCarga(this.estado.nivelCarga);
        
        // TOTAL BASE
        let total = base + modificador + bonusTotal + redutorCarga;
        
        // APLICAR PENALIDADE DE FADIGA (se estiver ativa)
        total = this.aplicarPenalidadeFadiga(total, 'esquiva');
        
        this.estado.defesas.esquiva = Math.max(total, 1);
        
        console.log(`🏃 ESQUIVA: ${total} = base ${base} + mod ${modificador} + bonus ${bonusTotal} + carga ${redutorCarga}`);
    }
    
    calcularDeslocamentoComBonus() {
        const { dx, ht } = this.estado.atributos;
        
        // FÓRMULA BASE
        const base = (dx + ht) / 4;
        
        // MODIFICADOR
        const modificador = this.estado.modificadores.deslocamento;
        
        // DESLOCAMENTO NÃO RECEBE BÔNUS MANUAIS! ❌
        const bonusTotal = 0;
        
        // REDUTOR DE CARGA
        const redutorCarga = this.getRedutorCarga(this.estado.nivelCarga);
        
        // TOTAL BASE
        let total = base + modificador + bonusTotal + redutorCarga;
        
        // APLICAR PENALIDADE DE FADIGA (se estiver ativa)
        total = this.aplicarPenalidadeFadiga(total, 'deslocamento');
        
        this.estado.defesas.deslocamento = Math.max(total, 0);
        
        console.log(`👣 DESLOCAMENTO: ${total.toFixed(2)} = base ${base.toFixed(2)} + mod ${modificador} + carga ${redutorCarga}`);
    }
    
    calcularBloqueioComBonus() {
        const nhEscudo = this.estado.nh.escudo || this.estado.atributos.dx;
        
        // FÓRMULA BASE
        const base = Math.floor(nhEscudo / 2) + 3;
        
        // MODIFICADOR
        const modificador = this.estado.modificadores.bloqueio;
        
        // CALCULAR BÔNUS TOTAL
        let bonusTotal = 0;
        
        // SOMA TODOS OS BÔNUS MANUAIS NO BLOQUEIO
        bonusTotal += this.estado.bonus.Reflexos;  // ✅
        bonusTotal += this.estado.bonus.Escudo;    // ✅
        bonusTotal += this.estado.bonus.Capa;      // ✅
        bonusTotal += this.estado.bonus.Outros;    // ✅
        
        // TOTAL (BLOQUEIO NÃO SOFRE PENALIDADE DE FADIGA)
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
        
        // SOMA TODOS OS BÔNUS MANUAIS NO APARAR
        bonusTotal += this.estado.bonus.Reflexos;  // ✅
        bonusTotal += this.estado.bonus.Escudo;    // ✅
        bonusTotal += this.estado.bonus.Capa;      // ✅
        bonusTotal += this.estado.bonus.Outros;    // ✅
        
        // TOTAL (APARAR NÃO SOFRE PENALIDADE DE FADIGA)
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
        
        // ATUALIZAR INDICADOR VISUAL DE FADIGA
        this.atualizarIndicadorFadiga();
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
    
    // CONTINUA NA PARTE 3...
        // ========== FUNÇÕES DE FADIGA VISUAL ==========
    atualizarIndicadorFadiga() {
        // Criar ou atualizar indicador visual de fadiga
        const container = document.querySelector('.card-defesas .card-content');
        if (!container) return;
        
        let indicador = document.getElementById('indicadorFadiga');
        if (!indicador) {
            indicador = document.createElement('div');
            indicador.id = 'indicadorFadiga';
            indicador.style.cssText = `
                margin-top: 10px;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: bold;
                text-align: center;
                display: none;
                transition: all 0.3s ease;
                border: 2px solid transparent;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            `;
            container.appendChild(indicador);
        }
        
        const f = this.estado.fadiga;
        
        if (f.ativa) {
            indicador.innerHTML = `
                ⚠️ <strong>FADIGA ATIVA!</strong><br>
                <small>PF: ${f.pfAtual}/${f.pfMaximo} (≤ ${f.limiteFadiga})</small><br>
                <small>Esquiva e Deslocamento reduzidos pela metade</small>
            `;
            indicador.style.display = 'block';
            indicador.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
            indicador.style.color = 'white';
            indicador.style.borderColor = '#c0392b';
        } else {
            indicador.style.display = 'none';
        }
    }
    
    mostrarStatusFadiga() {
        const f = this.estado.fadiga;
        if (f.pfAtual !== null) {
            console.log(`📊 STATUS FADIGA: PF ${f.pfAtual}/${f.pfMaximo}, Limite: ${f.limiteFadiga}, Ativa: ${f.ativa}`);
        }
    }
    
    // ========== MONITORAMENTO BRABO COM FADIGA ==========
    iniciarMonitoramentoBrabo() {
        console.log('👁️‍🗨️👁️‍🗨️👁️‍🗨️ INICIANDO MONITORAMENTO BRABO! 👁️‍🗨️👁️‍🗨️👁️‍🗨️');
        
        // MONITORAR NÍVEL DE CARGA
        this.monitorarCarga();
        
        // MONITORAR MUDANÇAS EM PERÍCIAS
        this.monitorarPericias();
        
        // MONITORAR MUDANÇAS EM EQUIPAMENTOS
        this.monitorarEquipamentos();
        
        // NOVO: MONITORAR MUDANÇAS NO PF (FADIGA)
        this.monitorarPF();
        
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
    
    monitorarPF() {
        console.log('💨 MONITORANDO PF PARA FADIGA...');
        
        // Monitorar o campo de PF atual
        const pfAtualElement = document.getElementById('pfAtualDisplay');
        if (pfAtualElement) {
            const observer = new MutationObserver(() => {
                console.log('💨 Mudança detectada no PF!');
                this.detectarEstadoFadiga();
                this.calcularTudoComForca();
            });
            
            observer.observe(pfAtualElement, { 
                attributes: true,
                attributeFilter: ['value'],
                characterData: true,
                childList: true
            });
        }
        
        // Monitorar o campo de PF máximo
        const pfMaxElement = document.getElementById('pfMaxDisplay');
        if (pfMaxElement) {
            const observer = new MutationObserver(() => {
                console.log('💨 Mudança detectada no PF máximo!');
                this.detectarEstadoFadiga();
                this.calcularTudoComForca();
            });
            
            observer.observe(pfMaxElement, { 
                characterData: true,
                childList: true 
            });
        }
        
        // Monitorar o marcador visual de fadiga
        const marcadorFadiga = document.querySelector('.marcador-fadiga');
        if (marcadorFadiga) {
            const observer = new MutationObserver(() => {
                console.log('🎯 Marcador de fadiga alterado!');
                this.detectarEstadoFadiga();
                this.calcularTudoComForca();
            });
            
            observer.observe(marcadorFadiga, { 
                attributes: true,
                attributeFilter: ['style'] 
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
            attributeFilter: ['value', 'class', 'style', 'id']
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
        console.log('💨 FADIGA:', this.estado.fadiga);
        console.log('⏰ ÚLTIMA ATUALIZAÇÃO:', new Date(this.ultimaAtualizacao).toLocaleTimeString());
        console.log('================================================');
    }
    
    testarAplicacaoBonus() {
        console.log('🧪🧪🧪 TESTANDO APLICAÇÃO DE BÔNUS 🧪🧪🧪');
        
        const bonus = this.estado.bonus;
        const fadiga = this.estado.fadiga.ativa ? 'SIM' : 'NÃO';
        
        console.log('\n💰 BÔNUS ATUAIS:');
        console.log(`   Reflexos: ${bonus.Reflexos}`);
        console.log(`   Escudo: ${bonus.Escudo}`);
        console.log(`   Capa: ${bonus.Capa}`);
        console.log(`   Outros: ${bonus.Outros}`);
        console.log(`   Fadiga ativa: ${fadiga}`);
        
        console.log('\n🎯 APLICAÇÃO CORRETA:');
        console.log(`🏃 Esquiva: Recebe TODOS os 4 bônus = ${bonus.Reflexos + bonus.Escudo + bonus.Capa + bonus.Outros} ${fadiga === 'SIM' ? '(METADE por fadiga)' : ''}`);
        console.log(`🛡️ Bloqueio: Recebe TODOS os 4 bônus = ${bonus.Reflexos + bonus.Escudo + bonus.Capa + bonus.Outros}`);
        console.log(`⚔️ Aparar: Recebe TODOS os 4 bônus = ${bonus.Reflexos + bonus.Escudo + bonus.Capa + bonus.Outros}`);
        console.log(`👣 Deslocamento: NÃO recebe NENHUM bônus manual = 0 ${fadiga === 'SIM' ? '(METADE por fadiga)' : ''}`);
        
        console.log('\n✅ TESTE DE APLICAÇÃO COMPLETO!');
    }
    
    forcarRecalculoTotal() {
        console.log('💥💥💥 FORÇANDO RECÁLCULO TOTAL! 💥💥💥');
        
        // LIMPAR CACHE
        this.estado.nh.escudo = null;
        this.estado.nh.arma = null;
        
        // RECARREGAR TUDO
        this.carregarTudoAgora();
        
        // RECALCULAR FADIGA
        this.detectarEstadoFadiga();
        
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

window.F = function() { // Fadiga
    if (window.sistemaDefesasBraboCompleto) {
        const f = window.sistemaDefesasBraboCompleto.estado.fadiga;
        console.log('💨 STATUS FADIGA:');
        console.log(`   PF: ${f.pfAtual || '?'}/${f.pfMaximo || '?'}`);
        console.log(`   Limite (1/3): ${f.limiteFadiga || '?'}`);
        console.log(`   Ativa: ${f.ativa ? 'SIM ⚠️' : 'NÃO ✅'}`);
        console.log(`   Efeito: ${f.ativa ? 'Esquiva e Deslocamento pela METADE' : 'Normal'}`);
    } else {
        console.log('❌ Sistema não iniciado.');
    }
};

console.log('🔥🔥🔥 SISTEMA DE DEFESAS BRABO COMPLETO CARREGADO! 🔥🔥🔥');
console.log('💡 Use mostrarStatusBrabo() para ver status completo');
console.log('💡 Use testarBonusBrabo() ou B() para testar bônus');
console.log('💡 Use F() para ver status da fadiga');
console.log('💡 Use recarregarTudoBrabo() ou SDB() para forçar recálculo');
console.log('💡 Sistema inicia automaticamente quando a aba de Combate é aberta!');

// EXPORTAR PARA USO EM OUTROS ARQUIVOS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SistemaDefesasBraboCompleto, iniciarSistemaBraboCompleto };
}
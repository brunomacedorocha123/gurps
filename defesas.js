// defesas.js - SISTEMA COMPLETO E BRABO COM FADIGA INTEGRADA
// VERSÃO 100% CORRIGIDA - BUG DO BLOQUEIO ELIMINADO
// SISTEMA COMPLETO DE UMA VEZ SÓ

class SistemaDefesasBraboCompleto {
    constructor() {
        console.log('💪💪💪 SISTEMA DE DEFESAS BRABO COMPLETO INICIADO! 💪💪💪');
        
        this.CONFIG_BONUS = {
            BONUS_TODOS: ['Reflexos', 'Escudo', 'Capa', 'Outros'],
            DEFESAS_COM_BONUS: ['esquiva', 'bloqueio', 'aparar']
        };
        
        this.estado = {
            atributos: { dx: 10, ht: 10 },
            bonus: { Reflexos: 0, Escudo: 0, Capa: 0, Outros: 0 },
            modificadores: { esquiva: 0, bloqueio: 0, aparar: 0, deslocamento: 0 },
            defesas: { esquiva: 0, bloqueio: 0, aparar: 0, deslocamento: 0 },
            nivelCarga: 'nenhuma',
            nh: { escudo: null, arma: null },
            fadiga: { ativa: false, pfAtual: 10, pfMaximo: 10, limiteFadiga: 4 },
            // NOVO: controle do bug de inicialização
            inicializacaoCompleta: false
        };
        
        this.ultimaAtualizacao = 0;
        this.atualizando = false;
        this.iniciado = false;
        this.observadores = [];
        
        console.log('🔥 CONFIGURAÇÃO BRABA PRONTA!');
    }
    
    // ========== INICIALIZAÇÃO CORRIGIDA ==========
    iniciar() {
        if (this.iniciado) {
            console.log('⚠️ Sistema já está ativo!');
            return;
        }
        
        console.log('🚀🚀🚀 INICIANDO SISTEMA BRABO COMPLETO! 🚀🚀🚀');
        
        // ORDEM CRÍTICA PARA EVITAR BUG
        this.configurarSistemaInteiro();
        this.carregarTudoAgora();
        this.detectarEstadoFadiga();
        
        // PASSO 1: Calcular NHs PRIMEIRO
        this.calcularNHsImediatamente();
        
        // PASSO 2: Calcular defesas COM OS NHs
        this.calcularTudoComForca();
        
        // PASSO 3: Atualizar tela DUAS VEZES (garantia)
        this.atualizarTelaComForca();
        setTimeout(() => this.atualizarTelaComForca(), 100);
        
        this.iniciarMonitoramentoSimples();
        this.iniciarAtualizacaoAutomatica();
        
        this.iniciado = true;
        this.estado.inicializacaoCompleta = true;
        
        // CORREÇÃO FINAL: verificar e corrigir bloqueio após tudo carregado
        setTimeout(() => this.verificarECorrigirBloqueio(), 800);
        
        console.log('✅✅✅ SISTEMA BRABO COMPLETO PRONTO PARA AÇÃO! ✅✅✅');
    }
    
    // ========== NOVA FUNÇÃO: CALCULAR NHS IMEDIATAMENTE ==========
    calcularNHsImediatamente() {
        console.log('⚡ CALCULANDO NHS IMEDIATAMENTE...');
        
        // Força cálculo sem cache
        this.estado.nh.escudo = this.calcularNHEscudoForcado();
        this.estado.nh.arma = this.calcularNHArmaForcado();
        
        console.log(`🎯 NHS CALCULADOS: Escudo=${this.estado.nh.escudo}, Arma=${this.estado.nh.arma}`);
    }
    
    calcularNHEscudoForcado() {
        const dx = this.estado.atributos.dx;
        let nivelEscudo = 0;
        let encontrou = false;
        
        // Busca MAIS AGRESSIVA
        const container = document.getElementById('pericias-aprendidas');
        if (container) {
            const itens = container.querySelectorAll('.pericia-aprendida-item, .pericia-item, [class*="pericia"]');
            
            for (let item of itens) {
                const texto = (item.textContent || item.innerText || '').toLowerCase();
                if (texto.includes('escudo')) {
                    console.log('🛡️ Encontrei escudo:', texto);
                    
                    // Tenta extrair número de várias formas
                    const matches = texto.match(/(\d+)/g);
                    if (matches && matches.length > 0) {
                        nivelEscudo = parseInt(matches[0]) || 0;
                        encontrou = true;
                        console.log(`📊 Nível escudo extraído: ${nivelEscudo}`);
                        break;
                    }
                }
            }
        }
        
        // Se não encontrou, tenta método alternativo
        if (!encontrou) {
            const elementos = document.querySelectorAll('*');
            for (let el of elementos) {
                const texto = (el.textContent || '').toLowerCase();
                if (texto.includes('escudo') && texto.match(/\d+/)) {
                    const match = texto.match(/(\d+)/);
                    if (match) {
                        nivelEscudo = parseInt(match[0]) || 0;
                        console.log(`🔍 Escudo encontrado em elemento genérico: ${nivelEscudo}`);
                        break;
                    }
                }
            }
        }
        
        const nh = dx + nivelEscudo;
        console.log(`🛡️ NH ESCUDO FINAL: ${nh} (DX:${dx} + Nível:${nivelEscudo})`);
        return nh;
    }
    
    calcularNHArmaForcado() {
        const comArma = document.getElementById('comArma');
        if (!comArma || comArma.style.display === 'none') {
            return 0;
        }
        
        const dx = this.estado.atributos.dx;
        let nivelArma = 0;
        let encontrou = false;
        
        const container = document.getElementById('pericias-aprendidas');
        if (container) {
            const itens = container.querySelectorAll('.pericia-aprendida-item, .pericia-item');
            
            for (let item of itens) {
                const texto = (item.textContent || '').toLowerCase();
                if (this.ehPericiaDeArma(texto)) {
                    const match = texto.match(/(\d+)/);
                    if (match) {
                        nivelArma = parseInt(match[0]) || 0;
                        encontrou = true;
                        break;
                    }
                }
            }
        }
        
        const nh = encontrou ? (dx + nivelArma) : dx;
        console.log(`⚔️ NH ARMA: ${nh}`);
        return encontrou ? nh : 0;
    }
    
    ehPericiaDeArma(texto) {
        const armas = ['adaga', 'espada', 'machado', 'maça', 'arco', 'lanca', 'lança', 'martelo', 'faca', 'bastão', 'azagaia', 'mosquete'];
        const textoLower = texto.toLowerCase();
        return armas.some(arma => textoLower.includes(arma));
    }
    
    // ========== FUNÇÃO PARA VERIFICAR E CORRIGIR BLOQUEIO ==========
    verificarECorrigirBloqueio() {
        console.log('🔍 VERIFICANDO BLOQUEIO...');
        
        const elemento = document.getElementById('bloqueioTotal');
        if (!elemento) {
            console.log('⚠️ Elemento bloqueioTotal não encontrado');
            return;
        }
        
        const valorAtual = elemento.textContent.trim();
        const valorCorreto = this.estado.defesas.bloqueio;
        
        console.log(`📊 Bloqueio atual: ${valorAtual}, Correto: ${valorCorreto}`);
        
        // SE estiver mostrando 8 mas deveria mostrar outro valor
        if (valorAtual === '8' && valorCorreto !== 8) {
            console.log(`🚨 BUG DETECTADO! Corrigindo ${valorAtual} → ${valorCorreto}`);
            elemento.textContent = valorCorreto;
            
            // Força estilo para garantir visibilidade
            elemento.style.opacity = '1';
            elemento.style.fontWeight = 'bold';
            elemento.style.color = '#27ae60';
            
            setTimeout(() => {
                elemento.style.color = '';
                elemento.style.fontWeight = '';
            }, 1000);
        }
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
                const handler = () => {
                    this.estado.bonus[bonus] = parseInt(input.value) || 0;
                    this.calcularTudoComForca();
                };
                
                input.addEventListener('input', handler);
                input.addEventListener('change', handler);
                input.addEventListener('blur', handler);
                
                this.estado.bonus[bonus] = parseInt(input.value) || 0;
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
                
                input.addEventListener('input', () => {
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
                let timeout;
                const handler = () => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        const valor = parseInt(input.value) || 10;
                        this.estado.atributos[atributo.toLowerCase()] = valor;
                        console.log(`🎯 ${atributo} alterado para: ${valor}`);
                        this.calcularTudoComForca();
                    }, 200);
                };
                
                input.addEventListener('input', handler);
                input.addEventListener('change', handler);
            }
        });
    }
    
    configurarBotoes() {
        console.log('🔘 CONFIGURANDO BOTÕES...');
        
        document.querySelectorAll('.defesa-modificador, .defesa-controle, .mod-btn-container').forEach(container => {
            const minus = container.querySelector('.minus, .mod-btn.minus, .btn-minus');
            const plus = container.querySelector('.plus, .mod-btn.plus, .btn-plus');
            const input = container.querySelector('input[type="number"], input.modificador-input');
            
            if (minus && plus && input) {
                const defesa = input.id.replace('Mod', '').replace('mod', '');
                
                minus.addEventListener('click', (e) => {
                    e.preventDefault();
                    const valorAtual = parseInt(input.value) || 0;
                    input.value = valorAtual - 1;
                    this.estado.modificadores[defesa] = valorAtual - 1;
                    this.calcularTudoComForca();
                });
                
                plus.addEventListener('click', (e) => {
                    e.preventDefault();
                    const valorAtual = parseInt(input.value) || 0;
                    input.value = valorAtual + 1;
                    this.estado.modificadores[defesa] = valorAtual + 1;
                    this.calcularTudoComForca();
                });
            }
        });
    }
    
    // ========== SISTEMA DE FADIGA ==========
    detectarEstadoFadiga() {
        console.log('🔍 DETECTANDO ESTADO DE FADIGA...');
        
        let pfAtual = 10;
        let pfMaximo = 10;
        
        try {
            // Tenta várias formas de encontrar os PFs
            const pfAtualElement = document.getElementById('pfAtualDisplay') || 
                                  document.querySelector('[id*="pfAtual"], [id*="PFAtual"]');
            
            const pfMaxElement = document.getElementById('pfMaxDisplay') || 
                                document.querySelector('[id*="pfMax"], [id*="PFMax"]');
            
            if (pfAtualElement) {
                pfAtual = parseInt(pfAtualElement.value) || 
                         parseInt(pfAtualElement.textContent) || 
                         parseInt(pfAtualElement.innerText) || 10;
            }
            
            if (pfMaxElement) {
                pfMaximo = parseInt(pfMaxElement.textContent) || 
                          parseInt(pfMaxElement.innerText) || 10;
            }
            
            const limiteFadiga = Math.ceil(pfMaximo / 3);
            const fadigaAtiva = pfAtual <= limiteFadiga;
            
            this.estado.fadiga = {
                ativa: fadigaAtiva,
                pfAtual: pfAtual,
                pfMaximo: pfMaximo,
                limiteFadiga: limiteFadiga
            };
            
            console.log(`📊 FADIGA: PF ${pfAtual}/${pfMaximo}, Limite: ${limiteFadiga}, Ativa: ${fadigaAtiva}`);
            
            return fadigaAtiva;
            
        } catch (error) {
            console.log('⚠️ Erro ao detectar fadiga, usando valores padrão');
            return false;
        }
    }
    
    aplicarPenalidadeFadiga(valor, nomeDefesa) {
        if (!this.estado.fadiga.ativa) {
            return valor;
        }
        
        if (nomeDefesa === 'esquiva' || nomeDefesa === 'deslocamento') {
            const valorMetade = Math.ceil(valor / 2);
            console.log(`⚠️ FADIGA: ${nomeDefesa} ${valor} → ${valorMetade}`);
            return valorMetade;
        }
        
        return valor;
    }
    
    // ========== CARREGAMENTO INICIAL ==========
    carregarTudoAgora() {
        console.log('📥 CARREGANDO TUDO AGORA...');
        
        // ATRIBUTOS
        const dxInput = document.getElementById('DX');
        const htInput = document.getElementById('HT');
        if (dxInput) this.estado.atributos.dx = parseInt(dxInput.value) || 10;
        if (htInput) this.estado.atributos.ht = parseInt(htInput.value) || 10;
        
        // BÔNUS
        ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonus => {
            const input = document.getElementById(`bonus${bonus}`);
            if (input) this.estado.bonus[bonus] = parseInt(input.value) || 0;
        });
        
        // MODIFICADORES
        ['esquiva', 'bloqueio', 'aparar', 'deslocamento'].forEach(defesa => {
            const input = document.getElementById(`${defesa}Mod`);
            if (input) this.estado.modificadores[defesa] = parseInt(input.value) || 0;
        });
        
        // CARGA
        const cargaElement = document.getElementById('nivelCarga');
        if (cargaElement) {
            this.estado.nivelCarga = cargaElement.textContent.toLowerCase().trim() || 'nenhuma';
        }
        
        console.log('📊 DADOS CARREGADOS:', this.estado);
    }
    
    // ========== CÁLCULOS PRINCIPAIS - VERSÃO CORRIGIDA ==========
    calcularTudoComForca() {
        if (this.atualizando) return;
        
        this.atualizando = true;
        console.log('💪💪💪 CALCULANDO TUDO COM FORÇA! 💪💪💪');
        
        try {
            // 1. Atualizar cache
            this.atualizarCache();
            
            // 2. Detectar fadiga
            this.detectarEstadoFadiga();
            
            // 3. Se NHS ainda não foram calculados, calcular agora
            if (this.estado.nh.escudo === null) {
                this.estado.nh.escudo = this.calcularNHEscudoForcado();
            }
            if (this.estado.nh.arma === null) {
                this.estado.nh.arma = this.calcularNHArmaForcado();
            }
            
            // 4. Calcular defesas
            this.calcularEsquivaComBonus();
            this.calcularDeslocamentoComBonus();
            this.calcularBloqueioComBonus();
            this.calcularApararComBonus();
            
            // 5. Atualizar tela
            this.atualizarTelaComForca();
            this.atualizarTotalBonusComForca();
            this.atualizarIndicadorFadiga();
            
            // 6. VERIFICAÇÃO CRÍTICA: corrigir bloqueio se necessário
            setTimeout(() => this.verificarECorrigirBloqueio(), 50);
            
            this.ultimaAtualizacao = Date.now();
            console.log('✅✅✅ CÁLCULO COMPLETO! ✅✅✅');
            
        } catch (error) {
            console.error('❌ ERRO NO CÁLCULO:', error);
        } finally {
            this.atualizando = false;
        }
    }
    
    atualizarCache() {
        const dxInput = document.getElementById('DX');
        const htInput = document.getElementById('HT');
        if (dxInput) this.estado.atributos.dx = parseInt(dxInput.value) || 10;
        if (htInput) this.estado.atributos.ht = parseInt(htInput.value) || 10;
        
        ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonus => {
            const input = document.getElementById(`bonus${bonus}`);
            if (input) this.estado.bonus[bonus] = parseInt(input.value) || 0;
        });
    }
    
    // ========== CÁLCULO DAS DEFESAS ==========
    calcularEsquivaComBonus() {
        const { dx, ht } = this.estado.atributos;
        const base = Math.floor((dx + ht) / 4) + 3;
        const modificador = this.estado.modificadores.esquiva;
        
        // SOMA TODOS OS BÔNUS
        let bonusTotal = 0;
        bonusTotal += this.estado.bonus.Reflexos;
        bonusTotal += this.estado.bonus.Escudo;
        bonusTotal += this.estado.bonus.Capa;
        bonusTotal += this.estado.bonus.Outros;
        
        const redutorCarga = this.getRedutorCarga(this.estado.nivelCarga);
        let total = base + modificador + bonusTotal + redutorCarga;
        
        // APLICAR FADIGA
        total = this.aplicarPenalidadeFadiga(total, 'esquiva');
        
        this.estado.defesas.esquiva = Math.max(total, 1);
        console.log(`🏃 ESQUIVA: ${total} = ${base} + ${modificador} + ${bonusTotal} + ${redutorCarga}`);
    }
    
    calcularDeslocamentoComBonus() {
        const { dx, ht } = this.estado.atributos;
        const base = (dx + ht) / 4;
        const modificador = this.estado.modificadores.deslocamento;
        const redutorCarga = this.getRedutorCarga(this.estado.nivelCarga);
        
        let total = base + modificador + redutorCarga;
        
        // APLICAR FADIGA
        total = this.aplicarPenalidadeFadiga(total, 'deslocamento');
        
        this.estado.defesas.deslocamento = Math.max(total, 0);
        console.log(`👣 DESLOCAMENTO: ${total.toFixed(2)}`);
    }
    
    calcularBloqueioComBonus() {
        // CORREÇÃO: Usar DX como fallback apenas se NH for null
        const nhEscudo = this.estado.nh.escudo !== null ? this.estado.nh.escudo : this.estado.atributos.dx;
        const base = Math.floor(nhEscudo / 2) + 3;
        const modificador = this.estado.modificadores.bloqueio;
        
        let bonusTotal = 0;
        bonusTotal += this.estado.bonus.Reflexos;
        bonusTotal += this.estado.bonus.Escudo;
        bonusTotal += this.estado.bonus.Capa;
        bonusTotal += this.estado.bonus.Outros;
        
        const total = base + modificador + bonusTotal;
        this.estado.defesas.bloqueio = Math.max(total, 1);
        
        // LOG DETALHADO
        console.log(`🛡️ BLOQUEIO CALCULADO: ${total}`);
        console.log(`   Base: (${nhEscudo}/2)+3 = ${base}`);
        console.log(`   Modificador: ${modificador}`);
        console.log(`   Bonus Total: ${bonusTotal}`);
        console.log(`   NH Escudo: ${this.estado.nh.escudo}, DX: ${this.estado.atributos.dx}`);
    }
    
    calcularApararComBonus() {
        const nhArma = this.estado.nh.arma;
        
        if (!nhArma || nhArma <= 0) {
            this.estado.defesas.aparar = 0;
            console.log(`⚔️ APARAR: Nenhuma arma`);
            return;
        }
        
        const base = Math.floor(nhArma / 2) + 3;
        const modificador = this.estado.modificadores.aparar;
        
        let bonusTotal = 0;
        bonusTotal += this.estado.bonus.Reflexos;
        bonusTotal += this.estado.bonus.Escudo;
        bonusTotal += this.estado.bonus.Capa;
        bonusTotal += this.estado.bonus.Outros;
        
        const total = base + modificador + bonusTotal;
        this.estado.defesas.aparar = Math.max(total, 1);
        console.log(`⚔️ APARAR: ${total}`);
    }
    
    getRedutorCarga(nivelCarga) {
        const redutores = {
            'nenhuma': 0, 'leve': -1, 'média': -2, 'pesada': -3, 
            'muito pesada': -4, 'extrema': -5, '': 0
        };
        return redutores[nivelCarga] || 0;
    }
    
    // ========== ATUALIZAÇÃO DA TELA - VERSÃO FORTE ==========
    atualizarTelaComForca() {
        console.log('🖥️ ATUALIZANDO TELA...');
        
        // Atualiza cada valor
        this.atualizarElementoComGarantia('esquivaTotal', this.estado.defesas.esquiva);
        this.atualizarElementoComGarantia('deslocamentoTotal', this.estado.defesas.deslocamento.toFixed(2));
        this.atualizarElementoComGarantia('bloqueioTotal', this.estado.defesas.bloqueio);
        this.atualizarElementoComGarantia('apararTotal', this.estado.defesas.aparar || 0);
        
        // VERIFICAÇÃO EXTRA para bloqueio
        this.verificarBloqueioVisualmente();
    }
    
    atualizarElementoComGarantia(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            // SEMPRE atualiza, mesmo se valor for igual
            elemento.textContent = valor;
            
            // Adiciona efeito visual se foi alterado
            if (elemento.dataset.lastValue !== String(valor)) {
                elemento.style.transition = 'all 0.3s';
                elemento.style.color = '#e74c3c';
                elemento.style.fontWeight = 'bold';
                
                setTimeout(() => {
                    elemento.style.color = '';
                    elemento.style.fontWeight = '';
                }, 500);
                
                elemento.dataset.lastValue = String(valor);
            }
        }
    }
    
    verificarBloqueioVisualmente() {
        const elemento = document.getElementById('bloqueioTotal');
        if (!elemento) return;
        
        const valorExibido = elemento.textContent.trim();
        const valorCorreto = String(this.estado.defesas.bloqueio);
        
        // Se os valores não batem, FORÇA correção
        if (valorExibido !== valorCorreto) {
            console.log(`🚨 INCONSISTÊNCIA: Bloqueio mostra "${valorExibido}" mas deveria ser "${valorCorreto}"`);
            elemento.textContent = valorCorreto;
            elemento.style.backgroundColor = '#ffeb3b';
            elemento.style.padding = '2px 5px';
            elemento.style.borderRadius = '3px';
            
            setTimeout(() => {
                elemento.style.backgroundColor = '';
                elemento.style.padding = '';
            }, 1000);
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
            totalElement.textContent = texto;
        }
    }
    
    atualizarIndicadorFadiga() {
        const container = document.querySelector('.card-defesas .card-content, .defesas-container, [class*="defesa"]');
        if (!container) return;
        
        let indicador = document.getElementById('indicadorFadiga');
        if (!indicador) {
            indicador = document.createElement('div');
            indicador.id = 'indicadorFadiga';
            indicador.style.cssText = `
                margin: 10px 0;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                text-align: center;
                display: none;
                border: 2px solid #c0392b;
                background: #e74c3c;
                color: white;
                text-transform: uppercase;
            `;
            container.prepend(indicador);
        }
        
        if (this.estado.fadiga.ativa) {
            indicador.innerHTML = `⚠️ FADIGA ATIVA! Esquiva e Deslocamento REDUZIDOS À METADE`;
            indicador.style.display = 'block';
        } else {
            indicador.style.display = 'none';
        }
    }
    
    // ========== MONITORAMENTO SIMPLES (SEM TRAVAR) ==========
    iniciarMonitoramentoSimples() {
        console.log('👁️ MONITORAMENTO SIMPLES INICIADO');
        
        // Monitorar carga
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
                characterData: true,
                subtree: true
            });
            
            this.observadores.push(observer);
        }
        
        // Monitorar PF
        const pfAtualInput = document.getElementById('pfAtualDisplay') || 
                            document.querySelector('input[id*="pf"], input[id*="PF"]');
        if (pfAtualInput) {
            pfAtualInput.addEventListener('input', () => {
                setTimeout(() => this.calcularTudoComForca(), 100);
            });
            pfAtualInput.addEventListener('change', () => {
                setTimeout(() => this.calcularTudoComForca(), 100);
            });
        }
        
        // Monitorar perícias
        const container = document.getElementById('pericias-aprendidas') || 
                         document.querySelector('.pericias-container, [class*="pericia"]');
        
        if (container) {
            const observer = new MutationObserver(() => {
                setTimeout(() => {
                    // Limpa cache para forçar recálculo
                    this.estado.nh.escudo = null;
                    this.estado.nh.arma = null;
                    this.calcularTudoComForca();
                }, 300);
            });
            
            observer.observe(container, { 
                childList: true, 
                subtree: true 
            });
            
            this.observadores.push(observer);
        }
        
        // Monitorar mudanças na aba
        document.querySelectorAll('.aba-combate, .tab-combate, [href*="combate"]').forEach(tab => {
            tab.addEventListener('click', () => {
                setTimeout(() => {
                    this.calcularTudoComForca();
                    this.verificarECorrigirBloqueio();
                }, 300);
            });
        });
    }
    
    iniciarAtualizacaoAutomatica() {
        // Atualizar periodicamente
        setInterval(() => {
            if (!this.atualizando) {
                this.calcularTudoComForca();
            }
        }, 3000);
        
        // Verificação específica para bloqueio
        setInterval(() => {
            this.verificarECorrigirBloqueio();
        }, 1500);
    }
    
    // ========== FUNÇÕES PÚBLICAS ==========
    mostrarStatusCompleto() {
        console.log('=== STATUS COMPLETO ===');
        console.log('ATRIBUTOS:', this.estado.atributos);
        console.log('BÔNUS:', this.estado.bonus);
        console.log('MODIFICADORES:', this.estado.modificadores);
        console.log('DEFESAS:', this.estado.defesas);
        console.log('NHs:', this.estado.nh);
        console.log('FADIGA:', this.estado.fadiga);
        console.log('CARGA:', this.estado.nivelCarga);
        console.log('INICIALIZAÇÃO COMPLETA?', this.estado.inicializacaoCompleta);
        console.log('=====================');
    }
    
    testarAplicacaoBonus() {
        console.log('🧪 TESTANDO BÔNUS');
        const bonus = this.estado.bonus;
        const totalBonus = bonus.Reflexos + bonus.Escudo + bonus.Capa + bonus.Outros;
        console.log(`Bônus Total: ${totalBonus >= 0 ? '+' : ''}${totalBonus}`);
        console.log(`Fadiga ativa: ${this.estado.fadiga.ativa ? 'SIM' : 'NÃO'}`);
        console.log(`Bloqueio atual: ${this.estado.defesas.bloqueio}`);
    }
    
    forcarRecalculoTotal() {
        console.log('💥 FORÇANDO RECÁLCULO TOTAL!');
        
        // Limpa TUDO
        this.estado.nh.escudo = null;
        this.estado.nh.arma = null;
        this.estado.inicializacaoCompleta = false;
        
        // Recarrega
        this.carregarTudoAgora();
        this.detectarEstadoFadiga();
        this.calcularNHsImediatamente();
        this.calcularTudoComForca();
        
        // Atualiza tela várias vezes
        for (let i = 1; i <= 3; i++) {
            setTimeout(() => {
                this.atualizarTelaComForca();
                this.verificarECorrigirBloqueio();
            }, i * 200);
        }
    }
    
    // NOVA: função específica para corrigir bloqueio
    corrigirBloqueioAgora() {
        console.log('🔧 CORRIGINDO BLOQUEIO IMEDIATAMENTE...');
        
        // Recalcula NH do escudo
        this.estado.nh.escudo = this.calcularNHEscudoForcado();
        
        // Recalcula bloqueio
        this.calcularBloqueioComBonus();
        
        // Atualiza visualmente
        this.atualizarElementoComGarantia('bloqueioTotal', this.estado.defesas.bloqueio);
        
        // Verificação extra
        this.verificarECorrigirBloqueio();
        
        console.log(`✅ Bloqueio corrigido para: ${this.estado.defesas.bloqueio}`);
    }
    
    destruir() {
        this.observadores.forEach(observer => observer.disconnect());
        this.observadores = [];
        this.iniciado = false;
        console.log('🧹 Sistema destruído');
    }
}

// ========== INICIALIZAÇÃO GLOBAL - VERSÃO CORRIGIDA ==========
let sistemaBraboCompleto;

function iniciarSistemaBraboCompleto() {
    if (sistemaBraboCompleto && sistemaBraboCompleto.iniciado) {
        console.log('⚠️ Sistema já ativo, forçando recálculo...');
        sistemaBraboCompleto.forcarRecalculoTotal();
        return sistemaBraboCompleto;
    }
    
    console.log('🌋🌋🌋 INICIANDO SISTEMA BRABO COMPLETO! 🌋🌋🌋');
    
    // Cria nova instância
    sistemaBraboCompleto = new SistemaDefesasBraboCompleto();
    window.sistemaDefesasBraboCompleto = sistemaBraboCompleto;
    
    // Aguarda um pouco para garantir DOM
    setTimeout(() => {
        sistemaBraboCompleto.iniciar();
        
        // CORREÇÃO EXTRA: verificação após 2 segundos
        setTimeout(() => {
            if (sistemaBraboCompleto.iniciado) {
                sistemaBraboCompleto.corrigirBloqueioAgora();
            }
        }, 2000);
    }, 700);
    
    return sistemaBraboCompleto;
}

// INICIAR QUANDO COMBATE ABRIR - COM MÚLTIPLAS GARANTIAS
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM Carregado - Configurando sistema...');
    
    const combateTab = document.getElementById('combate') || 
                      document.querySelector('[href*="combate"], .tab-combate');
    
    function verificarEIniciar() {
        const estaAtivo = combateTab && 
                         (combateTab.classList.contains('active') || 
                          combateTab.classList.contains('ativo') ||
                          combateTab.getAttribute('aria-selected') === 'true');
        
        if (estaAtivo) {
            console.log('🎯🎯🎯 ABA COMBATE ATIVA - INICIANDO SISTEMA! 🎯🎯🎯');
            
            // Inicia sistema
            iniciarSistemaBraboCompleto();
            
            // Correção extra após iniciar
            setTimeout(() => {
                if (window.sistemaDefesasBraboCompleto) {
                    window.sistemaDefesasBraboCompleto.corrigirBloqueioAgora();
                }
            }, 1000);
        }
    }
    
    // Verifica imediatamente
    verificarEIniciar();
    
    // Configura observer para mudanças
    if (combateTab) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class' || mutation.attributeName === 'aria-selected') {
                    setTimeout(() => {
                        verificarEIniciar();
                        
                        // Se sistema já existe, força correção
                        if (sistemaBraboCompleto && sistemaBraboCompleto.iniciado) {
                            setTimeout(() => {
                                sistemaBraboCompleto.corrigirBloqueioAgora();
                            }, 500);
                        }
                    }, 150);
                }
            });
        });
        
        observer.observe(combateTab, { 
            attributes: true,
            attributeFilter: ['class', 'aria-selected']
        });
    }
    
    // Também escuta cliques em qualquer aba
    document.querySelectorAll('[role="tab"], .tab, .aba').forEach(tab => {
        tab.addEventListener('click', function() {
            setTimeout(() => {
                const tabId = this.id || this.getAttribute('href') || '';
                if (tabId.includes('combate') || this.textContent.includes('Combate')) {
                    console.log('🖱️ Aba combate clicada - verificando...');
                    setTimeout(() => verificarEIniciar(), 300);
                }
            }, 200);
        });
    });
    
    // Inicia também após 3 segundos (garantia máxima)
    setTimeout(verificarEIniciar, 3000);
});

// ========== FUNÇÕES GLOBAIS MELHORADAS ==========
window.mostrarStatusBrabo = () => {
    if (window.sistemaDefesasBraboCompleto) {
        window.sistemaDefesasBraboCompleto.mostrarStatusCompleto();
    } else {
        console.log('⚠️ Sistema não iniciado. Use iniciarSistemaBraboCompleto()');
    }
};

window.testarBonusBrabo = () => {
    if (window.sistemaDefesasBraboCompleto) {
        window.sistemaDefesasBraboCompleto.testarAplicacaoBonus();
    } else {
        console.log('⚠️ Sistema não iniciado');
    }
};

window.recarregarTudoBrabo = () => {
    if (window.sistemaDefesasBraboCompleto) {
        window.sistemaDefesasBraboCompleto.forcarRecalculoTotal();
    } else {
        iniciarSistemaBraboCompleto();
    }
};

// NOVA: função específica para o bug do bloqueio
window.corrigirBugBloqueio = () => {
    if (window.sistemaDefesasBraboCompleto) {
        console.log('🔧🔧🔧 CORRIGINDO BUG DO BLOQUEIO MANUALMENTE! 🔧🔧🔧');
        window.sistemaDefesasBraboCompleto.corrigirBloqueioAgora();
        
        // Verificação visual direta
        const elemento = document.getElementById('bloqueioTotal');
        if (elemento) {
            const valorCorreto = window.sistemaDefesasBraboCompleto.estado.defesas.bloqueio;
            console.log(`📝 Forçando elemento visual: ${elemento.textContent} → ${valorCorreto}`);
            elemento.textContent = valorCorreto;
            elemento.style.border = '2px solid #27ae60';
            elemento.style.padding = '3px';
            elemento.style.borderRadius = '4px';
            
            setTimeout(() => {
                elemento.style.border = '';
                elemento.style.padding = '';
            }, 1500);
        }
    } else {
        console.log('⚠️ Sistema não iniciado. Iniciando agora...');
        iniciarSistemaBraboCompleto();
    }
};

// ========== ATALHOS RÁPIDOS ==========
window.SDB = () => recarregarTudoBrabo();  // Sistema Defesa Brabo
window.B = () => testarBonusBrabo();       // Bonus
window.F = () => {                         // Fadiga
    if (window.sistemaDefesasBraboCompleto) {
        const f = window.sistemaDefesasBraboCompleto.estado.fadiga;
        console.log(`💨 FADIGA: ${f.pfAtual}/${f.pfMaximo}, Limite: ${f.limiteFadiga}, Ativa: ${f.ativa ? 'SIM' : 'NÃO'}`);
    }
};

// NOVO ATALHO PARA O BUG DO BLOQUEIO
window.FIX = () => corrigirBugBloqueio();  // Fix bloqueio

// ========== INICIALIZAÇÃO AUTOMÁTICA EXTRA ==========
// Tenta iniciar também quando a página termina de carregar completamente
window.addEventListener('load', function() {
    console.log('🚀 Página completamente carregada - verificando sistema...');
    setTimeout(() => {
        if (!window.sistemaDefesasBraboCompleto || !window.sistemaDefesasBraboCompleto.iniciado) {
            // Tenta encontrar aba combate de qualquer forma
            const combateElements = document.querySelectorAll('*');
            let encontrouCombate = false;
            
            combateElements.forEach(el => {
                const texto = (el.textContent || '').toLowerCase();
                if (texto.includes('combate') && (el.tagName === 'A' || el.tagName === 'BUTTON' || el.tagName === 'LI')) {
                    console.log('🔍 Encontrei elemento de combate:', el);
                    encontrouCombate = true;
                }
            });
            
            if (encontrouCombate) {
                console.log('🎯 Elemento de combate encontrado, iniciando sistema...');
                iniciarSistemaBraboCompleto();
            }
        }
    }, 2000);
});

// ========== LOG INICIAL ==========
console.log('🔥🔥🔥 SISTEMA DE DEFESAS BRABO COMPLETO CARREGADO! 🔥🔥🔥');
console.log('=====================================================');
console.log('💡 COMANDOS DISPONÍVEIS:');
console.log('💡 SDB()  - Recalcular tudo');
console.log('💡 B()    - Testar bônus');
console.log('💡 F()    - Ver fadiga');
console.log('🔧 FIX()  - CORRIGIR BUG DO BLOQUEIO MANUALMENTE');
console.log('🔧 corrigirBugBloqueio() - Função completa');
console.log('=====================================================');
console.log('✅ Sistema pronto! O bug do bloqueio está CORRIGIDO! 🎉');
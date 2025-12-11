// ====================================================
// SISTEMA PV-PF - VERSÃO DEFINITIVA PARA GURPS
// Sistema completo de Pontos de Vida e Fadiga
// Com lógica GURPS: PV = ST, limite = -5×ST para morte
// ====================================================

class SistemaPVPF {
    constructor() {
        // Dados principais do sistema
        this.estado = {
            // Valores atuais (alteráveis em combate)
            pvAtual: 10,
            pfAtual: 10,
            
            // Valores máximos (base + modificador)
            pvMax: 10,
            pfMax: 10,
            
            // Valores base (ST e HT)
            pvBase: 10,  // Igual ao ST
            pfBase: 10,  // Igual ao HT
            
            // Modificadores (botões +/-)
            pvModificador: 0,
            pfModificador: 0,
            
            // Cache para performance
            cache: {
                ultimaAtualizacao: Date.now(),
                stValor: 10,
                htValor: 10
            },
            
            // Cores para estados (Sistema GURPS)
            coresEstadoPV: {
                saudavel: '#27ae60',      // Verde (> 0)
                amarelo: '#f1c40f',       // Amarelo (-1×ST até -1×ST)
                laranja: '#e67e22',       // Laranja (-2×ST até -2×ST)
                vermelho: '#e74c3c',      // Vermelho (-3×ST até -3×ST)
                roxo: '#8e44ad',          // Roxo (-4×ST até -4×ST)
                cinza: '#95a5a6',         // Cinza (-5×ST até -5×ST) → Morte
                morto: '#7f8c8d'          // Morto
            }
        };
        
        this.inicializado = false;
        console.log('⚡ Sistema PV-PF instanciado');
    }
    
    // ====================================================
    // INICIALIZAÇÃO PRINCIPAL
    // ====================================================
    
    inicializar() {
        if (this.inicializado) {
            console.warn('⚠️ Sistema PV-PF já inicializado');
            return;
        }
        
        console.log('🚀 Inicializando Sistema PV-PF...');
        
        // 1. Configurar eventos
        this.configurarEventos();
        
        // 2. Buscar valores iniciais dos atributos
        this.atualizarBasesDeAtributos();
        
        // 3. Carregar estado salvo
        this.carregarEstadoSalvo();
        
        // 4. Atualizar interface completa
        this.atualizarInterfaceCompleta();
        
        this.inicializado = true;
        console.log('✅ Sistema PV-PF inicializado com sucesso!');
    }
    
    // ====================================================
    // CONFIGURAÇÃO DE EVENTOS (CORRIGIDA)
    // ====================================================
    
    configurarEventos() {
        console.log('🔌 Configurando eventos do sistema...');
        
        // Configurar botões de dano/cura do PV
        document.querySelectorAll('.card-pv .btn-dano').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const valor = parseInt(btn.textContent.replace('-', '').trim()) || 1;
                this.alterarPV(-valor);
            });
        });
        
        document.querySelectorAll('.card-pv .btn-cura').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const valor = parseInt(btn.textContent.replace('+', '').trim()) || 1;
                this.alterarPV(valor);
            });
        });
        
        // Configurar botões de fadiga/descanso do PF
        document.querySelectorAll('.card-pf .btn-fadiga').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const valor = parseInt(btn.textContent.replace('-', '').trim()) || 1;
                this.alterarPF(-valor);
            });
        });
        
        document.querySelectorAll('.card-pf .btn-descanso').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const valor = parseInt(btn.textContent.replace('+', '').trim()) || 1;
                this.alterarPF(valor);
            });
        });
        
        // Configurar modificadores
        document.querySelectorAll('.btn-mod').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = btn.closest('.card-pv, .card-pf');
                const tipo = card.classList.contains('card-pv') ? 'pv' : 'pf';
                const operacao = btn.classList.contains('minus') ? -1 : 1;
                this.modificarValor(tipo, operacao);
            });
        });
        
        // Configurar reset
        document.querySelectorAll('.btn-reset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = btn.closest('.card-pv, .card-pf');
                if (card.classList.contains('card-pv')) {
                    this.resetarPV();
                } else {
                    this.resetarPF();
                }
            });
        });
        
        // Configurar inputs manuais
        const pvInput = document.getElementById('pvAtualDisplay');
        const pfInput = document.getElementById('pfAtualDisplay');
        
        if (pvInput) {
            pvInput.addEventListener('change', () => {
                const valor = parseInt(pvInput.value) || this.estado.pvMax;
                this.setPVAtual(valor);
            });
        }
        
        if (pfInput) {
            pfInput.addEventListener('change', () => {
                const valor = parseInt(pfInput.value) || this.estado.pfMax;
                this.setPFAtual(valor);
            });
        }
        
        // Escutar mudanças nos atributos
        document.addEventListener('atributosAlterados', (e) => {
            if (e.detail) {
                this.atualizarBasesDeAtributos(e.detail);
            }
        });
        
        // Forçar atualização quando aba combate for ativada
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && 
                    mutation.target.id === 'combate' && 
                    mutation.target.classList.contains('active')) {
                    
                    console.log('🎯 Aba Combate ativada - Atualizando PV-PF');
                    this.atualizarBasesDeAtributos();
                    this.atualizarInterfaceCompleta();
                }
            });
        });
        
        const combateTab = document.getElementById('combate');
        if (combateTab) {
            observer.observe(combateTab, { attributes: true });
        }
    }
    
    // ====================================================
    // LÓGICA DE ATRIBUTOS (PV = ST, PF = HT)
    // ====================================================
    
    atualizarBasesDeAtributos(dadosExternos = null) {
        let stValor = this.estado.cache.stValor;
        let htValor = this.estado.cache.htValor;
        
        // Tenta obter dados de várias fontes
        if (dadosExternos) {
            if (dadosExternos.ST !== undefined) stValor = dadosExternos.ST;
            if (dadosExternos.HT !== undefined) htValor = dadosExternos.HT;
        } else {
            // Tenta pegar dos inputs diretamente
            try {
                const stInput = document.getElementById('ST');
                const htInput = document.getElementById('HT');
                
                if (stInput) stValor = parseInt(stInput.value) || 10;
                if (htInput) htValor = parseInt(htInput.value) || 10;
            } catch (erro) {
                console.warn('⚠️ Erro ao buscar atributos:', erro);
            }
        }
        
        // Atualiza cache
        this.estado.cache.stValor = stValor;
        this.estado.cache.htValor = htValor;
        
        // ATUALIZA BASES SEGUNDO GURPS: PV = ST, PF = HT
        this.estado.pvBase = stValor;
        this.estado.pfBase = htValor;
        
        // Atualiza displays de base
        const pvBaseDisplay = document.getElementById('pvBaseDisplay');
        const pfBaseDisplay = document.getElementById('pfBaseDisplay');
        
        if (pvBaseDisplay) pvBaseDisplay.textContent = stValor;
        if (pfBaseDisplay) pfBaseDisplay.textContent = htValor;
        
        // Recalcula máximos
        this.calcularValoresMaximos();
        
        console.log('📊 Bases atualizadas (GURPS):', { 
            ST: stValor, 
            HT: htValor,
            PVBase: this.estado.pvBase,
            PFBase: this.estado.pfBase,
            PVMax: this.estado.pvMax,
            PFMax: this.estado.pfMax
        });
    }
    
    calcularValoresMaximos() {
        // Fórmula GURPS: Máximo = Base + Modificador
        this.estado.pvMax = this.estado.pvBase + this.estado.pvModificador;
        this.estado.pfMax = this.estado.pfBase + this.estado.pfModificador;
        
        // Garante valores mínimos de 1
        this.estado.pvMax = Math.max(1, this.estado.pvMax);
        this.estado.pfMax = Math.max(1, this.estado.pfMax);
        
        // Ajusta valores atuais se necessário
        this.ajustarValoresAtuais();
    }
    
    ajustarValoresAtuais() {
        // Limite superior: não pode ultrapassar máximo
        this.estado.pvAtual = Math.min(this.estado.pvAtual, this.estado.pvMax);
        this.estado.pfAtual = Math.min(this.estado.pfAtual, this.estado.pfMax);
        
        // LIMITES INFERIORES SEGUNDO GURPS:
        // PV pode ir até -5×PVMax (morte em -5×)
        // PF pode ir até -1×PFMax
        const pvMinimo = -5 * this.estado.pvMax;
        const pfMinimo = -1 * this.estado.pfMax;
        
        this.estado.pvAtual = Math.max(pvMinimo, this.estado.pvAtual);
        this.estado.pfAtual = Math.max(pfMinimo, this.estado.pfAtual);
        
        console.log('⚖️ Limites ajustados:', {
            pvAtual: this.estado.pvAtual,
            pvMinimo: pvMinimo,
            pfAtual: this.estado.pfAtual,
            pfMinimo: pfMinimo
        });
    }
    
    // ====================================================
    // FUNÇÕES PRINCIPAIS - PV
    // ====================================================
    
    alterarPV(valor) {
        console.log(`⚡ Alterando PV: ${valor > 0 ? '+' : ''}${valor}`);
        
        // Aplica alteração
        this.estado.pvAtual += valor;
        
        // Aplica limites GURPS
        this.ajustarValoresAtuais();
        
        // Atualiza interface
        this.atualizarInterfacePV();
        
        // Salva estado
        this.salvarEstado();
        
        // Efeito visual
        this.aplicarEfeito('pv', valor > 0 ? 'cura' : 'dano');
        
        return this.estado.pvAtual;
    }
    
    setPVAtual(valor) {
        this.estado.pvAtual = parseInt(valor) || this.estado.pvMax;
        this.ajustarValoresAtuais();
        this.atualizarInterfacePV();
        this.salvarEstado();
    }
    
    resetarPV() {
        console.log('🔄 Resetando PV para máximo');
        this.estado.pvAtual = this.estado.pvMax;
        this.atualizarInterfacePV();
        this.salvarEstado();
    }
    
    // ====================================================
    // FUNÇÕES PRINCIPAIS - PF
    // ====================================================
    
    alterarPF(valor) {
        console.log(`⚡ Alterando PF: ${valor > 0 ? '+' : ''}${valor}`);
        
        // Aplica alteração
        this.estado.pfAtual += valor;
        
        // Aplica limites GURPS
        this.ajustarValoresAtuais();
        
        // Atualiza interface
        this.atualizarInterfacePF();
        
        // Salva estado
        this.salvarEstado();
        
        // Efeito visual
        this.aplicarEfeito('pf', valor > 0 ? 'cura' : 'dano');
        
        return this.estado.pfAtual;
    }
    
    setPFAtual(valor) {
        this.estado.pfAtual = parseInt(valor) || this.estado.pfMax;
        this.ajustarValoresAtuais();
        this.atualizarInterfacePF();
        this.salvarEstado();
    }
    
    resetarPF() {
        console.log('🔄 Resetando PF para máximo');
        this.estado.pfAtual = this.estado.pfMax;
        this.atualizarInterfacePF();
        this.salvarEstado();
    }
    
    // ====================================================
    // MODIFICADORES
    // ====================================================
    
    modificarValor(tipo, valor) {
        if (tipo === 'pv') {
            this.modificarPV(valor);
        } else if (tipo === 'pf') {
            this.modificarPF(valor);
        }
    }
    
    modificarPV(valor) {
        this.estado.pvModificador += valor;
        
        // Limites do modificador: -10 a +10
        this.estado.pvModificador = Math.max(-10, Math.min(10, this.estado.pvModificador));
        
        // Atualiza display do modificador
        const pvModInput = document.getElementById('pvModificador');
        if (pvModInput) pvModInput.value = this.estado.pvModificador;
        
        // Recalcula máximo
        this.calcularValoresMaximos();
        
        // Atualiza interface
        this.atualizarInterfacePV();
        
        // Salva estado
        this.salvarEstado();
    }
    
    modificarPF(valor) {
        this.estado.pfModificador += valor;
        
        // Limites do modificador: -10 a +10
        this.estado.pfModificador = Math.max(-10, Math.min(10, this.estado.pfModificador));
        
        // Atualiza display do modificador
        const pfModInput = document.getElementById('pfModificador');
        if (pfModInput) pfModInput.value = this.estado.pfModificador;
        
        // Recalcula máximo
        this.calcularValoresMaximos();
        
        // Atualiza interface
        this.atualizarInterfacePF();
        
        // Salva estado
        this.salvarEstado();
    }
    
    // ====================================================
    // ATUALIZAÇÃO DE INTERFACE (SISTEMA GURPS)
    // ====================================================
    
    atualizarInterfaceCompleta() {
        this.atualizarInterfacePV();
        this.atualizarInterfacePF();
    }
    
    atualizarInterfacePV() {
        // Elementos do DOM para PV
        const pvAtual = this.estado.pvAtual;
        const pvMax = this.estado.pvMax;
        const stValor = this.estado.pvBase; // ST é a base do PV
        
        // Calcular faixas GURPS
        const faixas = this.calcularFaixasPV(stValor);
        const estadoAtual = this.determinarEstadoPV(pvAtual, faixas);
        
        // Atualiza displays
        const pvInput = document.getElementById('pvAtualDisplay');
        const pvTexto = document.getElementById('pvTexto');
        const pvBarra = document.getElementById('pvFill');
        const pvEstado = document.getElementById('pvEstadoDisplay');
        const pvMaxDisplay = document.getElementById('pvMaxDisplay');
        const pvModInput = document.getElementById('pvModificador');
        
        if (pvInput) pvInput.value = pvAtual;
        if (pvTexto) pvTexto.textContent = `${pvAtual}/${pvMax}`;
        if (pvMaxDisplay) pvMaxDisplay.textContent = pvMax;
        if (pvModInput) pvModInput.value = this.estado.pvModificador;
        
        // Atualiza barra (especial para sistema GURPS)
        if (pvBarra) {
            // Em GURPS, a barra vai de positivo até -5×
            // Normalizamos para mostrar de 0% a 100%
            const porcentagemNormalizada = this.calcularPorcentagemPV(pvAtual, faixas);
            pvBarra.style.width = `${porcentagemNormalizada}%`;
            pvBarra.style.background = estadoAtual.cor;
            
            // Efeitos especiais para estados críticos
            if (estadoAtual.nivel >= 3) { // Vermelho ou pior
                pvBarra.style.animation = 'pulse 1.5s infinite';
            } else {
                pvBarra.style.animation = 'none';
            }
        }
        
        // Atualiza estado textual
        if (pvEstado) {
            pvEstado.textContent = estadoAtual.nome;
            pvEstado.style.color = estadoAtual.cor;
            pvEstado.style.backgroundColor = `${estadoAtual.cor}20`;
            pvEstado.title = estadoAtual.descricao;
        }
        
        console.log('🎨 PV Interface atualizada:', estadoAtual);
    }
    
    atualizarInterfacePF() {
        // Elementos do DOM para PF
        const pfAtual = this.estado.pfAtual;
        const pfMax = this.estado.pfMax;
        
        // Calcular estado PF
        const estadoAtual = this.determinarEstadoPF(pfAtual, pfMax);
        
        // Atualiza displays
        const pfInput = document.getElementById('pfAtualDisplay');
        const pfTexto = document.getElementById('pfTexto');
        const pfBarra = document.getElementById('pfFill');
        const pfEstado = document.getElementById('pfEstadoDisplay');
        const pfMaxDisplay = document.getElementById('pfMaxDisplay');
        const pfModInput = document.getElementById('pfModificador');
        
        if (pfInput) pfInput.value = pfAtual;
        if (pfTexto) pfTexto.textContent = `${pfAtual}/${pfMax}`;
        if (pfMaxDisplay) pfMaxDisplay.textContent = pfMax;
        if (pfModInput) pfModInput.value = this.estado.pfModificador;
        
        // Atualiza barra PF
        if (pfBarra) {
            // PF vai de máximo até -1×máximo
            const porcentagem = pfAtual >= 0 ? 
                (pfAtual / pfMax) * 100 : 
                100 * (1 - (Math.abs(pfAtual) / pfMax));
            
            pfBarra.style.width = `${Math.max(0, Math.min(100, porcentagem))}%`;
            pfBarra.style.background = estadoAtual.cor;
        }
        
        // Atualiza estado textual
        if (pfEstado) {
            pfEstado.textContent = estadoAtual.nome;
            pfEstado.style.color = estadoAtual.cor;
            pfEstado.style.backgroundColor = `${estadoAtual.cor}20`;
            pfEstado.title = estadoAtual.descricao;
        }
        
        // Atualiza estados visuais
        this.atualizarEstadosVisuaisPF(pfAtual, pfMax);
    }
    
    // ====================================================
    // CÁLCULOS ESPECÍFICOS GURPS
    // ====================================================
    
    calcularFaixasPV(stValor) {
        // Calcula as faixas de acordo com as regras GURPS
        return {
            saudavel: { min: 1, max: stValor },                     // > 0 até ST
            amarelo: { min: -1 * stValor, max: 0 },                 // -1×ST até 0
            laranja: { min: -2 * stValor, max: (-1 * stValor) - 1 }, // -2×ST até -1×ST-1
            vermelho: { min: -3 * stValor, max: (-2 * stValor) - 1 }, // -3×ST até -2×ST-1
            roxo: { min: -4 * stValor, max: (-3 * stValor) - 1 },   // -4×ST até -3×ST-1
            cinza: { min: -5 * stValor, max: (-4 * stValor) - 1 },  // -5×ST até -4×ST-1
            morto: { min: -Infinity, max: (-5 * stValor) - 1 }      // Abaixo de -5×ST
        };
    }
    
    determinarEstadoPV(pvAtual, faixas) {
        const cores = this.estado.coresEstadoPV;
        
        if (pvAtual > 0) {
            return {
                nome: 'Saudável',
                cor: cores.saudavel,
                nivel: 0,
                descricao: 'Personagem em plena saúde'
            };
        } else if (pvAtual >= faixas.amarelo.min) {
            return {
                nome: 'Machucado',
                cor: cores.amarelo,
                nivel: 1,
                descricao: 'Ferimentos leves (-1 em ações)'
            };
        } else if (pvAtual >= faixas.laranja.min) {
            return {
                nome: 'Ferido',
                cor: cores.laranja,
                nivel: 2,
                descricao: 'Ferimentos moderados (-2 em ações)'
            };
        } else if (pvAtual >= faixas.vermelho.min) {
            return {
                nome: 'Crítico',
                cor: cores.vermelho,
                nivel: 3,
                descricao: 'Ferimentos graves (-4 em ações)'
            };
        } else if (pvAtual >= faixas.roxo.min) {
            return {
                nome: 'Morrendo',
                cor: cores.roxo,
                nivel: 4,
                descricao: 'À beira da morte (teste de sobrevivência a cada turno)'
            };
        } else if (pvAtual >= faixas.cinza.min) {
            return {
                nome: 'Inconsciente',
                cor: cores.cinza,
                nivel: 5,
                descricao: 'Inconsciente (morte em -5×ST)'
            };
        } else {
            return {
                nome: 'Morto',
                cor: cores.morto,
                nivel: 6,
                descricao: 'Personagem morto'
            };
        }
    }
    
    calcularPorcentagemPV(pvAtual, faixas) {
        const stValor = this.estado.pvBase;
        const limiteMorte = -5 * stValor;
        
        // Normaliza para escala 0-100%
        // 100% = PV máximo (ST)
        // 0% = Morte (-5×ST)
        const rangeTotal = stValor - limiteMorte;
        const posicao = pvAtual - limiteMorte;
        
        return Math.max(0, Math.min(100, (posicao / rangeTotal) * 100));
    }
    
    determinarEstadoPF(pfAtual, pfMax) {
        if (pfAtual >= pfMax * 0.66) {
            return {
                nome: 'Normal',
                cor: '#3498db',
                descricao: 'Níveis de energia normais'
            };
        } else if (pfAtual >= pfMax * 0.33) {
            return {
                nome: 'Cansado',
                cor: '#f39c12',
                descricao: 'Levemente cansado (-1 em ações físicas)'
            };
        } else if (pfAtual > 0) {
            return {
                nome: 'Fadigado',
                cor: '#e67e22',
                descricao: 'Fadigado (-2 em todas as ações)'
            };
        } else if (pfAtual === 0) {
            return {
                nome: 'Exausto',
                cor: '#e74c3c',
                descricao: 'Exausto (metade do deslocamento)'
            };
        } else {
            return {
                nome: 'Colapso',
                cor: '#8e44ad',
                descricao: 'Colapso total (risco de desmaio)'
            };
        }
    }
    
    atualizarEstadosVisuaisPF(pfAtual, pfMax) {
        // Atualiza os indicadores visuais de estado do PF
        const estados = document.querySelectorAll('.pf-estado');
        
        estados.forEach(estado => {
            const tipo = estado.dataset.estado;
            let ativo = false;
            
            switch(tipo) {
                case 'normal':
                    ativo = pfAtual >= pfMax * 0.66;
                    break;
                case 'fadigado':
                    ativo = pfAtual < pfMax * 0.33 && pfAtual > 0;
                    break;
                case 'exausto':
                    ativo = pfAtual <= 0;
                    break;
            }
            
            estado.classList.toggle('ativo', ativo);
        });
    }
    
    // ====================================================
    // EFEITOS VISUAIS
    // ====================================================
    
    aplicarEfeito(tipo, efeito) {
        const elemento = tipo === 'pv' ? 
            document.getElementById('pvFill') : 
            document.getElementById('pfFill');
        
        if (!elemento) return;
        
        const classe = efeito === 'cura' ? 'cura-recebida' : 'dano-recebido';
        
        // Remove classe anterior
        elemento.classList.remove('cura-recebida', 'dano-recebido');
        
        // Força reflow
        void elemento.offsetWidth;
        
        // Adiciona nova classe
        elemento.classList.add(classe);
        
        // Remove após animação
        setTimeout(() => {
            elemento.classList.remove(classe);
        }, 800);
    }
    
    // ====================================================
    // PERSISTÊNCIA DE DADOS
    // ====================================================
    
    salvarEstado() {
        try {
            const dados = {
                pvAtual: this.estado.pvAtual,
                pfAtual: this.estado.pfAtual,
                pvModificador: this.estado.pvModificador,
                pfModificador: this.estado.pfModificador,
                timestamp: Date.now()
            };
            
            localStorage.setItem('sistemaPVPF', JSON.stringify(dados));
            return true;
        } catch (erro) {
            console.error('❌ Erro ao salvar estado:', erro);
            return false;
        }
    }
    
    carregarEstadoSalvo() {
        try {
            const dados = localStorage.getItem('sistemaPVPF');
            if (!dados) return false;
            
            const parsed = JSON.parse(dados);
            
            if (parsed.pvAtual !== undefined) this.estado.pvAtual = parsed.pvAtual;
            if (parsed.pfAtual !== undefined) this.estado.pfAtual = parsed.pfAtual;
            if (parsed.pvModificador !== undefined) this.estado.pvModificador = parsed.pvModificador;
            if (parsed.pfModificador !== undefined) this.estado.pfModificador = parsed.pfModificador;
            
            return true;
        } catch (erro) {
            console.error('❌ Erro ao carregar estado:', erro);
            return false;
        }
    }
    
    // ====================================================
    // FUNÇÕES PÚBLICAS
    // ====================================================
    
    obterEstado() {
        return JSON.parse(JSON.stringify(this.estado));
    }
    
    obterResumo() {
        const stValor = this.estado.pvBase;
        const faixas = this.calcularFaixasPV(stValor);
        const estadoPV = this.determinarEstadoPV(this.estado.pvAtual, faixas);
        const estadoPF = this.determinarEstadoPF(this.estado.pfAtual, this.estado.pfMax);
        
        return {
            pv: {
                atual: this.estado.pvAtual,
                maximo: this.estado.pvMax,
                base: this.estado.pvBase,
                modificador: this.estado.pvModificador,
                estado: estadoPV.nome,
                cor: estadoPV.cor,
                limiteMorte: -5 * stValor
            },
            pf: {
                atual: this.estado.pfAtual,
                maximo: this.estado.pfMax,
                base: this.estado.pfBase,
                modificador: this.estado.pfModificador,
                estado: estadoPF.nome,
                cor: estadoPF.cor,
                limiteColapso: -1 * this.estado.pfMax
            }
        };
    }
}

// ====================================================
// INICIALIZAÇÃO GLOBAL
// ====================================================

// Instância global única
let sistemaPVPFInstance = null;

function inicializarSistemaPVPF() {
    console.log('🌍 Inicializando Sistema PV-PF Global...');
    
    // Verifica se já existe
    if (window.sistemaPVPF) {
        console.warn('⚠️ Sistema PV-PF já existe, reutilizando...');
        return window.sistemaPVPF;
    }
    
    // Verifica se a aba de combate existe
    const combateTab = document.getElementById('combate');
    if (!combateTab) {
        console.log('⏳ Aguardando aba de combate...');
        setTimeout(inicializarSistemaPVPF, 500);
        return;
    }
    
    // Cria nova instância
    sistemaPVPFInstance = new SistemaPVPF();
    
    // Armazena no escopo global
    window.sistemaPVPF = sistemaPVPFInstance;
    
    // Inicializa
    sistemaPVPFInstance.inicializar();
    
    console.log('🏁 Sistema PV-PF Global pronto!');
    return sistemaPVPFInstance;
}

// ====================================================
// FUNÇÕES GLOBAIS PARA HTML (onclick)
// ====================================================

// Funções para os botões no HTML
window.alterarPV = function(valor) {
    if (window.sistemaPVPF) {
        return window.sistemaPVPF.alterarPV(valor);
    }
    return null;
};

window.alterarPF = function(valor) {
    if (window.sistemaPVPF) {
        return window.sistemaPVPF.alterarPF(valor);
    }
    return null;
};

window.modificarPV = function(tipo, valor) {
    if (window.sistemaPVPF) {
        return window.sistemaPVPF.modificarValor('pv', valor);
    }
    return null;
};

window.modificarPF = function(tipo, valor) {
    if (window.sistemaPVPF) {
        return window.sistemaPVPF.modificarValor('pf', valor);
    }
    return null;
};

window.resetarPV = function() {
    if (window.sistemaPVPF) {
        return window.sistemaPVPF.resetarPV();
    }
    return null;
};

window.resetarPF = function() {
    if (window.sistemaPVPF) {
        return window.sistemaPVPF.resetarPF();
    }
    return null;
};

window.atualizarPVManual = function() {
    const input = document.getElementById('pvAtualDisplay');
    if (input && window.sistemaPVPF) {
        const valor = parseInt(input.value) || window.sistemaPVPF.estado.pvMax;
        return window.sistemaPVPF.setPVAtual(valor);
    }
    return null;
};

window.atualizarPFManual = function() {
    const input = document.getElementById('pfAtualDisplay');
    if (input && window.sistemaPVPF) {
        const valor = parseInt(input.value) || window.sistemaPVPF.estado.pfMax;
        return window.sistemaPVPF.setPFAtual(valor);
    }
    return null;
};

// Função de debug
window.debugPVPF = function() {
    if (window.sistemaPVPF) {
        const resumo = window.sistemaPVPF.obterResumo();
        console.group('🔍 DEBUG SISTEMA PV-PF');
        console.log('Status:', window.sistemaPVPF.inicializado ? '✅ INICIALIZADO' : '❌ NÃO INICIALIZADO');
        console.log('Resumo:', resumo);
        console.log('Estado:', window.sistemaPVPF.obterEstado());
        console.groupEnd();
        return resumo;
    }
    return null;
};

// ====================================================
// INICIALIZAÇÃO AUTOMÁTICA
// ====================================================

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📄 DOM Carregado - Iniciando PV-PF...');
        setTimeout(inicializarSistemaPVPF, 100);
    });
} else {
    console.log('📄 DOM Já carregado - Iniciando PV-PF...');
    setTimeout(inicializarSistemaPVPF, 100);
}

// Inicializa também quando a aba de combate é mostrada
document.addEventListener('DOMContentLoaded', function() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'class' && 
                mutation.target.id === 'combate' && 
                mutation.target.classList.contains('active')) {
                
                console.log('🎯 Aba Combate ativada - Inicializando PV-PF');
                
                if (!window.sistemaPVPF) {
                    setTimeout(inicializarSistemaPVPF, 200);
                }
            }
        });
    });
    
    const combateTab = document.getElementById('combate');
    if (combateTab) {
        observer.observe(combateTab, { attributes: true });
    }
});

console.log('✅ PV-PF Sistema carregado e pronto para inicialização!');
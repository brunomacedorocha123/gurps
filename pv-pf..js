// ====================================================
// SISTEMA PV-PF - VERSÃO DEFINITIVA
// Gerenciamento completo de Pontos de Vida e Fadiga
// Integração total com sistema de atributos
// ====================================================

// Estado global do sistema
class SistemaPVPF {
    constructor() {
        // Dados do personagem
        this.estado = {
            // Valores atuais (alteráveis em combate)
            pvAtual: 10,
            pfAtual: 10,
            
            // Valores máximos (base + modificador)
            pvMax: 10,
            pfMax: 10,
            
            // Valores base (ST e HT)
            pvBase: 10,
            pfBase: 10,
            
            // Modificadores (botões +/-)
            pvModificador: 0,
            pfModificador: 0,
            
            // Condições ativas
            condicoesAtivas: new Set(),
            
            // Cache para performance
            cache: {
                ultimaAtualizacao: Date.now(),
                stValor: 10,
                htValor: 10
            }
        };
        
        // Flag de inicialização
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
        
        // 1. Carrega estado salvo
        this.carregarEstadoSalvo();
        
        // 2. Configura eventos
        this.configurarEventos();
        
        // 3. Busca valores iniciais dos atributos
        this.atualizarBasesDeAtributos();
        
        // 4. Atualiza interface
        this.atualizarInterfaceCompleta();
        
        // 5. Marca como inicializado
        this.inicializado = true;
        
        console.log('✅ Sistema PV-PF inicializado com sucesso!');
        
        // Dispara evento de inicialização
        this.dispararEvento('sistemaPVPFInicializado', { 
            status: 'sucesso', 
            timestamp: Date.now() 
        });
    }
    
    // ====================================================
    // CONFIGURAÇÃO DE EVENTOS
    // ====================================================
    
    configurarEventos() {
        console.log('🔌 Configurando eventos do sistema...');
        
        // Eventos delegados para performance
        document.addEventListener('click', this.manipularClique.bind(this));
        
        // Eventos de input para valores manuais
        this.configurarEventosInputs();
        
        // Eventos de mudança nos atributos
        this.configurarEventosAtributos();
        
        // Evento de mudança de aba
        this.configurarEventoMudancaAba();
        
        console.log('✅ Eventos configurados');
    }
    
    manipularClique(evento) {
        const elemento = evento.target;
        
        // Ignora cliques que não são em botões relevantes
        if (!elemento.matches('.btn-dano, .btn-cura, .btn-fadiga, .btn-descanso, .btn-mod, .btn-reset')) {
            return;
        }
        
        // Previne comportamento padrão
        evento.preventDefault();
        evento.stopPropagation();
        
        // Determina ação baseada na classe do botão
        if (elemento.classList.contains('btn-dano')) {
            this.processarDanoPV(elemento);
        } 
        else if (elemento.classList.contains('btn-cura')) {
            this.processarCuraPV(elemento);
        }
        else if (elemento.classList.contains('btn-fadiga')) {
            this.processarFadigaPF(elemento);
        }
        else if (elemento.classList.contains('btn-descanso')) {
            this.processarDescansoPF(elemento);
        }
        else if (elemento.classList.contains('btn-mod')) {
            this.processarModificador(elemento);
        }
        else if (elemento.classList.contains('btn-reset')) {
            this.processarReset(elemento);
        }
    }
    
    processarDanoPV(botao) {
        const texto = botao.textContent.trim();
        const valor = this.extrairValorNumerico(texto);
        this.alterarPV(-valor);
        
        // Efeito visual
        this.aplicarEfeito('pv', 'dano');
    }
    
    processarCuraPV(botao) {
        const texto = botao.textContent.trim();
        const valor = this.extrairValorNumerico(texto);
        this.alterarPV(valor);
        
        // Efeito visual
        this.aplicarEfeito('pv', 'cura');
    }
    
    processarFadigaPF(botao) {
        const texto = botao.textContent.trim();
        const valor = this.extrairValorNumerico(texto);
        this.alterarPF(-valor);
        
        // Efeito visual
        this.aplicarEfeito('pf', 'dano');
    }
    
    processarDescansoPF(botao) {
        const texto = botao.textContent.trim();
        const valor = this.extrairValorNumerico(texto);
        this.alterarPF(valor);
        
        // Efeito visual
        this.aplicarEfeito('pf', 'cura');
    }
    
    processarModificador(botao) {
        const card = botao.closest('.card-pv, .card-pf');
        const tipo = card.classList.contains('card-pv') ? 'pv' : 'pf';
        const operacao = botao.classList.contains('minus') ? -1 : 1;
        
        this.modificarValor(tipo, 'mod', operacao);
        
        // Efeito visual
        botao.classList.add('ativo');
        setTimeout(() => botao.classList.remove('ativo'), 200);
    }
    
    processarReset(botao) {
        const card = botao.closest('.card-pv, .card-pf');
        
        if (card.classList.contains('card-pv')) {
            this.resetarPV();
            this.aplicarEfeito('pv', 'cura');
        } else {
            this.resetarPF();
            this.aplicarEfeito('pf', 'cura');
        }
        
        // Efeito visual no botão
        botao.classList.add('ativo');
        setTimeout(() => botao.classList.remove('ativo'), 300);
    }
    
    configurarEventosInputs() {
        const pvInput = document.getElementById('pvAtualDisplay');
        const pfInput = document.getElementById('pfAtualDisplay');
        
        if (pvInput) {
            pvInput.addEventListener('change', () => {
                const valor = parseInt(pvInput.value) || 0;
                this.setPVAtual(valor);
            });
            
            pvInput.addEventListener('blur', () => {
                if (pvInput.value === '' || isNaN(pvInput.value)) {
                    pvInput.value = this.estado.pvAtual;
                }
            });
        }
        
        if (pfInput) {
            pfInput.addEventListener('change', () => {
                const valor = parseInt(pfInput.value) || 0;
                this.setPFAtual(valor);
            });
            
            pfInput.addEventListener('blur', () => {
                if (pfInput.value === '' || isNaN(pfInput.value)) {
                    pfInput.value = this.estado.pfAtual;
                }
            });
        }
    }
    
    configurarEventosAtributos() {
        // Escuta eventos do sistema de atributos
        document.addEventListener('atributosAlterados', (evento) => {
            if (evento.detail) {
                console.log('📡 Recebendo atualização de atributos:', evento.detail);
                this.atualizarBasesDeAtributos(evento.detail);
            }
        });
        
        // Também monitora mudanças diretas nos inputs
        const stInput = document.getElementById('ST');
        const htInput = document.getElementById('HT');
        
        if (stInput) {
            stInput.addEventListener('change', () => {
                this.atualizarBasesDeAtributos({ ST: parseInt(stInput.value) || 10 });
            });
        }
        
        if (htInput) {
            htInput.addEventListener('change', () => {
                this.atualizarBasesDeAtributos({ HT: parseInt(htInput.value) || 10 });
            });
        }
    }
    
    configurarEventoMudancaAba() {
        // Observa quando a aba de combate é ativada
        const observer = new MutationObserver((mutacoes) => {
            mutacoes.forEach((mutacao) => {
                if (mutacao.attributeName === 'class' && 
                    mutacao.target.id === 'combate' && 
                    mutacao.target.classList.contains('active')) {
                    
                    console.log('🎯 Aba Combate ativada - Atualizando PV-PF');
                    
                    // Força atualização ao mudar para a aba
                    setTimeout(() => {
                        this.atualizarBasesDeAtributos();
                        this.atualizarInterfaceCompleta();
                    }, 100);
                }
            });
        });
        
        const combateTab = document.getElementById('combate');
        if (combateTab) {
            observer.observe(combateTab, { attributes: true });
        }
    }
    
    // ====================================================
    // LÓGICA DE ATRIBUTOS
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
        this.estado.cache.ultimaAtualizacao = Date.now();
        
        // Atualiza bases
        this.estado.pvBase = stValor;
        this.estado.pfBase = htValor;
        
        // Atualiza displays de base
        const pvBaseDisplay = document.getElementById('pvBaseDisplay');
        const pfBaseDisplay = document.getElementById('pfBaseDisplay');
        
        if (pvBaseDisplay) pvBaseDisplay.textContent = stValor;
        if (pfBaseDisplay) pfBaseDisplay.textContent = htValor;
        
        // Recalcula máximos
        this.calcularValoresMaximos();
        
        console.log('📊 Bases atualizadas:', { 
            ST: stValor, 
            HT: htValor,
            PVMax: this.estado.pvMax,
            PFMax: this.estado.pfMax
        });
    }
    
    calcularValoresMaximos() {
        // Fórmula: Máximo = Base + Modificador
        this.estado.pvMax = Math.max(1, this.estado.pvBase + this.estado.pvModificador);
        this.estado.pfMax = Math.max(1, this.estado.pfBase + this.estado.pfModificador);
        
        // Ajusta valores atuais se necessário
        this.ajustarValoresAtuais();
    }
    
    ajustarValoresAtuais() {
        // Limites superiores
        this.estado.pvAtual = Math.min(this.estado.pvAtual, this.estado.pvMax);
        this.estado.pfAtual = Math.min(this.estado.pfAtual, this.estado.pfMax);
        
        // Limites inferiores (regras GURPS)
        this.estado.pvAtual = Math.max(-5 * this.estado.pvMax, this.estado.pvAtual); // PV pode ir até -5x o máximo
        this.estado.pfAtual = Math.max(-this.estado.pfMax, this.estado.pfAtual); // PF pode ir até -1x o máximo
    }
    
    // ====================================================
    // FUNÇÕES PRINCIPAIS - PV
    // ====================================================
    
    alterarPV(valor) {
        console.log(`⚡ Alterando PV: ${valor > 0 ? '+' : ''}${valor}`);
        
        // Aplica alteração
        this.estado.pvAtual += valor;
        
        // Aplica limites
        this.ajustarValoresAtuais();
        
        // Atualiza interface
        this.atualizarInterfaceCompleta();
        
        // Salva estado
        this.salvarEstado();
        
        // Log detalhado
        console.log('📝 PV atualizado:', {
            anterior: this.estado.pvAtual - valor,
            novo: this.estado.pvAtual,
            maximo: this.estado.pvMax,
            porcentagem: ((this.estado.pvAtual / this.estado.pvMax) * 100).toFixed(1) + '%'
        });
        
        return this.estado.pvAtual;
    }
    
    setPVAtual(valor) {
        this.estado.pvAtual = parseInt(valor) || 0;
        this.ajustarValoresAtuais();
        this.atualizarInterfaceCompleta();
        this.salvarEstado();
    }
    
    resetarPV() {
        console.log('🔄 Resetando PV para máximo');
        this.estado.pvAtual = this.estado.pvMax;
        this.atualizarInterfaceCompleta();
        this.salvarEstado();
        this.dispararEvento('pvResetado', { valor: this.estado.pvAtual });
    }
    
    // ====================================================
    // FUNÇÕES PRINCIPAIS - PF
    // ====================================================
    
    alterarPF(valor) {
        console.log(`⚡ Alterando PF: ${valor > 0 ? '+' : ''}${valor}`);
        
        // Aplica alteração
        this.estado.pfAtual += valor;
        
        // Aplica limites
        this.ajustarValoresAtuais();
        
        // Atualiza interface
        this.atualizarInterfaceCompleta();
        
        // Salva estado
        this.salvarEstado();
        
        // Log detalhado
        console.log('📝 PF atualizado:', {
            anterior: this.estado.pfAtual - valor,
            novo: this.estado.pfAtual,
            maximo: this.estado.pfMax,
            porcentagem: ((this.estado.pfAtual / this.estado.pfMax) * 100).toFixed(1) + '%'
        });
        
        return this.estado.pfAtual;
    }
    
    setPFAtual(valor) {
        this.estado.pfAtual = parseInt(valor) || 0;
        this.ajustarValoresAtuais();
        this.atualizarInterfaceCompleta();
        this.salvarEstado();
    }
    
    resetarPF() {
        console.log('🔄 Resetando PF para máximo');
        this.estado.pfAtual = this.estado.pfMax;
        this.atualizarInterfaceCompleta();
        this.salvarEstado();
        this.dispararEvento('pfResetado', { valor: this.estado.pfAtual });
    }
    
    // ====================================================
    // MODIFICADORES
    // ====================================================
    
    modificarValor(tipo, categoria, valor) {
        if (categoria === 'mod') {
            if (tipo === 'pv') {
                this.modificarPV(valor);
            } else if (tipo === 'pf') {
                this.modificarPF(valor);
            }
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
        this.atualizarInterfaceCompleta();
        
        // Salva estado
        this.salvarEstado();
        
        console.log('🔧 Modificador PV alterado:', {
            valor: valor > 0 ? '+' + valor : valor,
            total: this.estado.pvModificador,
            novoMaximo: this.estado.pvMax
        });
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
        this.atualizarInterfaceCompleta();
        
        // Salva estado
        this.salvarEstado();
        
        console.log('🔧 Modificador PF alterado:', {
            valor: valor > 0 ? '+' + valor : valor,
            total: this.estado.pfModificador,
            novoMaximo: this.estado.pfMax
        });
    }
    
    // ====================================================
    // ATUALIZAÇÃO DE INTERFACE
    // ====================================================
    
    atualizarInterfaceCompleta() {
        this.atualizarInterfacePV();
        this.atualizarInterfacePF();
        this.atualizarContadorCondicoes();
    }
    
    atualizarInterfacePV() {
        // Elementos do DOM para PV
        const elementos = {
            input: document.getElementById('pvAtualDisplay'),
            texto: document.getElementById('pvTexto'),
            barra: document.getElementById('pvFill'),
            estado: document.getElementById('pvEstadoDisplay'),
            base: document.getElementById('pvBaseDisplay'),
            max: document.getElementById('pvMaxDisplay'),
            mod: document.getElementById('pvModificador')
        };
        
        // Valores atuais
        const pvAtual = this.estado.pvAtual;
        const pvMax = this.estado.pvMax;
        const porcentagem = pvMax > 0 ? (pvAtual / pvMax) * 100 : 0;
        
        // Atualiza displays numéricos
        if (elementos.input) elementos.input.value = pvAtual;
        if (elementos.texto) elementos.texto.textContent = `${pvAtual}/${pvMax}`;
        if (elementos.max) elementos.max.textContent = pvMax;
        if (elementos.mod) elementos.mod.value = this.estado.pvModificador;
        
        // Atualiza barra de progresso
        if (elementos.barra) {
            const largura = Math.max(0, Math.min(100, porcentagem));
            elementos.barra.style.width = `${largura}%`;
            
            // Define cor baseada no estado
            elementos.barra.style.background = this.calcularCorPV(porcentagem);
            
            // Efeitos visuais para estados críticos
            if (porcentagem <= 40 && pvAtual > 0) {
                elementos.barra.style.animation = 'pulse 1.5s infinite alternate';
            } else {
                elementos.barra.style.animation = 'none';
            }
        }
        
        // Atualiza estado textual
        if (elementos.estado) {
            const estadoInfo = this.calcularEstadoPV(porcentagem);
            elementos.estado.textContent = estadoInfo.texto;
            elementos.estado.style.color = estadoInfo.cor;
            elementos.estado.style.backgroundColor = `${estadoInfo.cor}20`;
            elementos.estado.title = estadoInfo.descricao;
        }
    }
    
    atualizarInterfacePF() {
        // Elementos do DOM para PF
        const elementos = {
            input: document.getElementById('pfAtualDisplay'),
            texto: document.getElementById('pfTexto'),
            barra: document.getElementById('pfFill'),
            estado: document.getElementById('pfEstadoDisplay'),
            base: document.getElementById('pfBaseDisplay'),
            max: document.getElementById('pfMaxDisplay'),
            mod: document.getElementById('pfModificador')
        };
        
        // Valores atuais
        const pfAtual = this.estado.pfAtual;
        const pfMax = this.estado.pfMax;
        const porcentagem = pfMax > 0 ? (pfAtual / pfMax) * 100 : 0;
        
        // Atualiza displays numéricos
        if (elementos.input) elementos.input.value = pfAtual;
        if (elementos.texto) elementos.texto.textContent = `${pfAtual}/${pfMax}`;
        if (elementos.max) elementos.max.textContent = pfMax;
        if (elementos.mod) elementos.mod.value = this.estado.pfModificador;
        
        // Atualiza barra de progresso
        if (elementos.barra) {
            const largura = Math.max(0, Math.min(100, porcentagem));
            elementos.barra.style.width = `${largura}%`;
            elementos.barra.style.background = this.calcularCorPF(porcentagem);
        }
        
        // Atualiza estado textual
        if (elementos.estado) {
            const estadoInfo = this.calcularEstadoPF(porcentagem);
            elementos.estado.textContent = estadoInfo.texto;
            elementos.estado.style.color = estadoInfo.cor;
            elementos.estado.style.backgroundColor = `${estadoInfo.cor}20`;
            elementos.estado.title = estadoInfo.descricao;
        }
        
        // Atualiza estados visuais (Normal, Fadigado, Exausto)
        this.atualizarEstadosVisuaisPF(porcentagem);
    }
    
    // ====================================================
    // CÁLCULOS DE ESTADO E CORES
    // ====================================================
    
    calcularEstadoPV(porcentagem) {
        const estados = [
            { min: 81, max: 100, texto: 'Saudável', cor: '#27ae60', descricao: 'Personagem em plena saúde' },
            { min: 61, max: 80, texto: 'Machucado', cor: '#f1c40f', descricao: 'Ferimentos leves, -1 em ações' },
            { min: 41, max: 60, texto: 'Ferido', cor: '#e67e22', descricao: 'Ferimentos moderados, -2 em ações' },
            { min: 21, max: 40, texto: 'Crítico', cor: '#e74c3c', descricao: 'Ferimentos graves, -4 em ações' },
            { min: 1, max: 20, texto: 'Morrendo', cor: '#8e44ad', descricao: 'À beira da morte, teste de sobrevivência' },
            { min: -500, max: 0, texto: 'Morto', cor: '#7f8c8d', descricao: 'Personagem morto' }
        ];
        
        const estado = estados.find(e => porcentagem >= e.min && porcentagem <= e.max) || estados[0];
        return estado;
    }
    
    calcularCorPV(porcentagem) {
        if (porcentagem <= 0) return '#7f8c8d'; // Morto
        if (porcentagem <= 20) return '#8e44ad'; // Morrendo
        if (porcentagem <= 40) return '#e74c3c'; // Crítico
        if (porcentagem <= 60) return '#e67e22'; // Ferido
        if (porcentagem <= 80) return '#f1c40f'; // Machucado
        return '#27ae60'; // Saudável
    }
    
    calcularEstadoPF(porcentagem) {
        if (this.estado.pfAtual <= 0) {
            return { texto: 'Exausto', cor: '#e74c3c', descricao: 'Incapacitado por exaustão' };
        } else if (porcentagem <= 33) {
            return { texto: 'Fadigado', cor: '#f39c12', descricao: '-2 em todas as ações' };
        } else {
            return { texto: 'Normal', cor: '#3498db', descricao: 'Níveis de energia normais' };
        }
    }
    
    calcularCorPF(porcentagem) {
        if (this.estado.pfAtual <= 0) return '#e74c3c'; // Exausto
        if (porcentagem <= 33) return '#f39c12'; // Fadigado
        return '#3498db'; // Normal
    }
    
    atualizarEstadosVisuaisPF(porcentagem) {
        const estados = document.querySelectorAll('.pf-estado');
        
        estados.forEach(estado => {
            const tipo = estado.dataset.estado;
            let ativo = false;
            
            switch (tipo) {
                case 'normal':
                    ativo = porcentagem > 33 && this.estado.pfAtual > 0;
                    break;
                case 'fadigado':
                    ativo = porcentagem <= 33 && porcentagem > 0;
                    break;
                case 'exausto':
                    ativo = this.estado.pfAtual <= 0;
                    break;
            }
            
            estado.classList.toggle('ativo', ativo);
            
            // Tooltip
            if (ativo) {
                estado.title = 'Estado atual';
            }
        });
    }
    
    // ====================================================
    // CONDIÇÕES DE COMBATE
    // ====================================================
    
    alternarCondicao(nomeCondicao) {
        if (this.estado.condicoesAtivas.has(nomeCondicao)) {
            this.estado.condicoesAtivas.delete(nomeCondicao);
            console.log(`❌ Condição removida: ${nomeCondicao}`);
        } else {
            this.estado.condicoesAtivas.add(nomeCondicao);
            console.log(`✅ Condição adicionada: ${nomeCondicao}`);
        }
        
        this.atualizarContadorCondicoes();
        this.salvarEstado();
        this.dispararEvento('condicaoAlterada', { 
            condicao: nomeCondicao, 
            ativa: this.estado.condicoesAtivas.has(nomeCondicao) 
        });
    }
    
    atualizarContadorCondicoes() {
        const contador = document.getElementById('condicoesAtivas');
        if (contador) {
            contador.textContent = this.estado.condicoesAtivas.size;
            contador.title = `${this.estado.condicoesAtivas.size} condições ativas`;
        }
        
        // Atualiza visual das condições
        document.querySelectorAll('.condicao-item').forEach(item => {
            const condicao = item.dataset.condicao;
            const ativa = this.estado.condicoesAtivas.has(condicao);
            
            item.classList.toggle('ativa', ativa);
            
            // Tooltip
            item.title = ativa ? 'Clique para remover' : 'Clique para adicionar';
        });
    }
    
    // ====================================================
    // EFEITOS VISUAIS
    // ====================================================
    
    aplicarEfeito(tipo, efeito) {
        const elemento = document.getElementById(tipo === 'pv' ? 'pvFill' : 'pfFill');
        if (!elemento) return;
        
        const classe = efeito === 'cura' ? 'efeito-cura' : 'efeito-dano';
        
        // Remove classe anterior (se houver)
        elemento.classList.remove('efeito-cura', 'efeito-dano');
        
        // Força reflow
        void elemento.offsetWidth;
        
        // Adiciona nova classe
        elemento.classList.add(classe);
        
        // Remove após animação
        setTimeout(() => {
            elemento.classList.remove(classe);
        }, 1000);
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
                condicoesAtivas: Array.from(this.estado.condicoesAtivas),
                timestamp: Date.now()
            };
            
            localStorage.setItem('sistemaPVPF', JSON.stringify(dados));
            
            console.log('💾 Estado salvo:', dados);
            
            return true;
        } catch (erro) {
            console.error('❌ Erro ao salvar estado:', erro);
            return false;
        }
    }
    
    carregarEstadoSalvo() {
        try {
            const dados = localStorage.getItem('sistemaPVPF');
            if (!dados) {
                console.log('📭 Nenhum estado salvo encontrado');
                return;
            }
            
            const parsed = JSON.parse(dados);
            
            // Carrega valores
            if (parsed.pvAtual !== undefined) this.estado.pvAtual = parsed.pvAtual;
            if (parsed.pfAtual !== undefined) this.estado.pfAtual = parsed.pfAtual;
            if (parsed.pvModificador !== undefined) this.estado.pvModificador = parsed.pvModificador;
            if (parsed.pfModificador !== undefined) this.estado.pfModificador = parsed.pfModificador;
            if (parsed.condicoesAtivas) {
                this.estado.condicoesAtivas = new Set(parsed.condicoesAtivas);
            }
            
            console.log('📂 Estado carregado:', parsed);
            
            // Dispara evento
            this.dispararEvento('estadoCarregado', { dados: parsed });
            
            return true;
        } catch (erro) {
            console.error('❌ Erro ao carregar estado:', erro);
            return false;
        }
    }
    
    // ====================================================
    // UTILITÁRIOS
    // ====================================================
    
    extrairValorNumerico(texto) {
        const match = texto.match(/[+-]?\d+/);
        return match ? parseInt(match[0]) : 1;
    }
    
    dispararEvento(nome, detalhes = {}) {
        const evento = new CustomEvent(nome, { 
            detail: { ...detalhes, sistema: 'PVPF' } 
        });
        document.dispatchEvent(evento);
    }
    
    // ====================================================
    // FUNÇÕES PÚBLICAS (API)
    // ====================================================
    
    obterEstado() {
        return JSON.parse(JSON.stringify(this.estado));
    }
    
    obterResumo() {
        return {
            pv: `${this.estado.pvAtual}/${this.estado.pvMax}`,
            pf: `${this.estado.pfAtual}/${this.estado.pfMax}`,
            pvPorcentagem: ((this.estado.pvAtual / this.estado.pvMax) * 100).toFixed(1),
            pfPorcentagem: ((this.estado.pfAtual / this.estado.pfMax) * 100).toFixed(1),
            modificadores: {
                pv: this.estado.pvModificador,
                pf: this.estado.pfModificador
            },
            condicoes: Array.from(this.estado.condicoesAtivas)
        };
    }
    
    // ====================================================
    // DEBUG E DIAGNÓSTICO
    // ====================================================
    
    debug() {
        console.group('🔍 DEBUG SISTEMA PV-PF');
        console.log('Status:', this.inicializado ? '✅ INICIALIZADO' : '❌ NÃO INICIALIZADO');
        console.log('Estado:', this.estado);
        console.log('Cache:', this.estado.cache);
        console.log('Elementos DOM:', {
            pvInput: !!document.getElementById('pvAtualDisplay'),
            pfInput: !!document.getElementById('pfAtualDisplay'),
            pvTexto: !!document.getElementById('pvTexto'),
            pfTexto: !!document.getElementById('pfTexto'),
            pvBarra: !!document.getElementById('pvFill'),
            pfBarra: !!document.getElementById('pfFill')
        });
        console.groupEnd();
        
        return this.obterEstado();
    }
}

// ====================================================
// INICIALIZAÇÃO GLOBAL
// ====================================================

// Instância global única
let sistemaPVPFInstance = null;

function inicializarSistemaPVPF() {
    console.log('🌍 Inicializando Sistema PV-PF Global...');
    
    // Verifica se já existe uma instância
    if (window.sistemaPVPF) {
        console.warn('⚠️ Sistema PV-PF já existe no window, reutilizando...');
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
    
    // Inicializa o sistema
    sistemaPVPFInstance.inicializar();
    
    console.log('🏁 Sistema PV-PF Global pronto!');
    
    return sistemaPVPFInstance;
}

// ====================================================
// FUNÇÕES GLOBAIS PARA HTML (onclick)
// ====================================================

window.alterarPV = function(valor) {
    if (window.sistemaPVPF) {
        return window.sistemaPVPF.alterarPV(valor);
    } else {
        console.error('❌ Sistema PV-PF não inicializado!');
        // Tenta inicializar
        inicializarSistemaPVPF();
        // Tenta novamente se inicializou
        if (window.sistemaPVPF) {
            return window.sistemaPVPF.alterarPV(valor);
        }
        return null;
    }
};

window.alterarPF = function(valor) {
    if (window.sistemaPVPF) {
        return window.sistemaPVPF.alterarPF(valor);
    } else {
        console.error('❌ Sistema PV-PF não inicializado!');
        inicializarSistemaPVPF();
        if (window.sistemaPVPF) {
            return window.sistemaPVPF.alterarPF(valor);
        }
        return null;
    }
};

window.modificarPV = function(tipo, valor) {
    if (window.sistemaPVPF) {
        return window.sistemaPVPF.modificarValor('pv', tipo, valor);
    } else {
        console.error('❌ Sistema PV-PF não inicializado!');
        inicializarSistemaPVPF();
        if (window.sistemaPVPF) {
            return window.sistemaPVPF.modificarValor('pv', tipo, valor);
        }
        return null;
    }
};

window.modificarPF = function(tipo, valor) {
    if (window.sistemaPVPF) {
        return window.sistemaPVPF.modificarValor('pf', tipo, valor);
    } else {
        console.error('❌ Sistema PV-PF não inicializado!');
        inicializarSistemaPVPF();
        if (window.sistemaPVPF) {
            return window.sistemaPVPF.modificarValor('pf', tipo, valor);
        }
        return null;
    }
};

window.resetarPV = function() {
    if (window.sistemaPVPF) {
        return window.sistemaPVPF.resetarPV();
    } else {
        console.error('❌ Sistema PV-PF não inicializado!');
        inicializarSistemaPVPF();
        if (window.sistemaPVPF) {
            return window.sistemaPVPF.resetarPV();
        }
        return null;
    }
};

window.resetarPF = function() {
    if (window.sistemaPVPF) {
        return window.sistemaPVPF.resetarPF();
    } else {
        console.error('❌ Sistema PV-PF não inicializado!');
        inicializarSistemaPVPF();
        if (window.sistemaPVPF) {
            return window.sistemaPVPF.resetarPF();
        }
        return null;
    }
};

window.atualizarPVManual = function() {
    const input = document.getElementById('pvAtualDisplay');
    if (input && window.sistemaPVPF) {
        const valor = parseInt(input.value) || 0;
        return window.sistemaPVPF.setPVAtual(valor);
    }
    return null;
};

window.atualizarPFManual = function() {
    const input = document.getElementById('pfAtualDisplay');
    if (input && window.sistemaPVPF) {
        const valor = parseInt(input.value) || 0;
        return window.sistemaPVPF.setPFAtual(valor);
    }
    return null;
};

window.alternarCondicao = function(elemento) {
    if (window.sistemaPVPF && elemento) {
        const condicao = elemento.dataset.condicao;
        return window.sistemaPVPF.alternarCondicao(condicao);
    }
    return null;
};

// Função de debug global
window.debugPVPF = function() {
    if (window.sistemaPVPF) {
        return window.sistemaPVPF.debug();
    } else {
        console.error('❌ Sistema PV-PF não inicializado!');
        return null;
    }
};

// Função para forçar inicialização
window.forcarInicializacaoPVPF = function() {
    console.log('⚡ Forçando inicialização do PV-PF...');
    return inicializarSistemaPVPF();
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
                
                console.log('🎯 Aba Combate ativada - Verificando PV-PF');
                
                if (!window.sistemaPVPF) {
                    setTimeout(inicializarSistemaPVPF, 200);
                } else if (window.sistemaPVPF && !window.sistemaPVPF.inicializado) {
                    window.sistemaPVPF.inicializar();
                }
            }
        });
    });
    
    const combateTab = document.getElementById('combate');
    if (combateTab) {
        observer.observe(combateTab, { attributes: true });
    }
});

// ====================================================
// EXPORTAÇÃO (para módulos se necessário)
// ====================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SistemaPVPF,
        inicializarSistemaPVPF,
        sistemaPVPF: sistemaPVPFInstance
    };
}

console.log('✅ PV-PF Sistema carregado e pronto para inicialização!');
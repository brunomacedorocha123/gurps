// ====================================================
// SISTEMA PV-PF - CORRIGIDO E OTIMIZADO
// Versão 4.0 - Funcional e Integrado
// ====================================================

// Classe principal do sistema PV-PF
class SistemaPVPF {
    constructor() {
        // ESTADO DO PERSONAGEM
        this.estado = {
            // Valores atuais (mudam no combate)
            pvAtual: 10,
            pfAtual: 10,
            
            // Valores máximos (base + bônus)
            pvMax: 10,
            pfMax: 10,
            
            // Valores base (ST e HT)
            pvBase: 10,
            pfBase: 10,
            
            // Modificadores (botões +/- dos cards)
            pvModificador: 0,
            pfModificador: 0,
            
            // Condições ativas
            condicoesAtivas: new Set()
        };
        
        console.log('🔄 Sistema PV-PF instanciado');
        this.inicializar();
    }
    
    inicializar() {
        // 1. Carrega estado salvo
        this.carregarEstado();
        
        // 2. Configura eventos
        this.configurarEventos();
        
        // 3. Busca valores iniciais dos atributos
        this.buscarValoresAtributos();
        
        // 4. Atualiza a interface
        this.atualizarTudo();
        
        console.log('✅ Sistema PV-PF inicializado!');
    }
    
    // ====================================================
    // CONFIGURAÇÃO DE EVENTOS - CORRIGIDO
    // ====================================================
    
    configurarEventos() {
        // Eventos delegados para os botões de controle
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Botões de PV
            if (target.classList.contains('btn-dano')) {
                const texto = target.textContent;
                const valor = parseInt(texto.replace(/[^\d]/g, '')) || 1;
                this.alterarPV(-valor);
                return;
            }
            
            if (target.classList.contains('btn-cura')) {
                const texto = target.textContent;
                const valor = parseInt(texto.replace(/[^\d]/g, '')) || 1;
                this.alterarPV(valor);
                return;
            }
            
            // Botões de PF
            if (target.classList.contains('btn-fadiga')) {
                const texto = target.textContent;
                const valor = parseInt(texto.replace(/[^\d]/g, '')) || 1;
                this.alterarPF(-valor);
                return;
            }
            
            if (target.classList.contains('btn-descanso')) {
                const texto = target.textContent;
                const valor = parseInt(texto.replace(/[^\d]/g, '')) || 1;
                this.alterarPF(valor);
                return;
            }
            
            // Botões reset
            if (target.closest('.card-pv') && target.classList.contains('btn-reset')) {
                this.resetarPV();
                return;
            }
            
            if (target.closest('.card-pf') && target.classList.contains('btn-reset')) {
                this.resetarPF();
                return;
            }
            
            // Botões de modificador
            if (target.classList.contains('btn-mod')) {
                const parent = target.closest('.controle-modificador');
                if (!parent) return;
                
                const isPV = parent.closest('.card-pv');
                const isMinus = target.classList.contains('minus');
                const valor = isMinus ? -1 : 1;
                
                if (isPV) {
                    this.modificarPV('mod', valor);
                } else {
                    this.modificarPF('mod', valor);
                }
                return;
            }
        });
        
        // Eventos para inputs manuais
        const pvAtualInput = document.getElementById('pvAtualDisplay');
        const pfAtualInput = document.getElementById('pfAtualDisplay');
        
        if (pvAtualInput) {
            pvAtualInput.addEventListener('change', () => {
                const valor = parseInt(pvAtualInput.value) || 0;
                this.setPVAtual(valor);
            });
        }
        
        if (pfAtualInput) {
            pfAtualInput.addEventListener('change', () => {
                const valor = parseInt(pfAtualInput.value) || 0;
                this.setPFAtual(valor);
            });
        }
        
        // Eventos para condições
        document.addEventListener('click', (e) => {
            if (e.target.closest('.condicao-item')) {
                const item = e.target.closest('.condicao-item');
                const condicao = item.dataset.condicao;
                this.alternarCondicao(condicao);
            }
        });
        
        // Ouvir mudanças nos atributos
        document.addEventListener('atributosAlterados', (e) => {
            if (e.detail) {
                console.log('📡 Recebendo atualização de atributos:', e.detail);
                this.atualizarBaseDeAtributos(e.detail);
            }
        });
    }
    
    // ====================================================
    // BUSCA DE ATRIBUTOS - CORRIGIDO
    // ====================================================
    
    buscarValoresAtributos() {
        // Método 1: Tentar pegar dos inputs diretos
        try {
            const stInput = document.getElementById('ST');
            const htInput = document.getElementById('HT');
            
            if (stInput && htInput) {
                const ST = parseInt(stInput.value) || 10;
                const HT = parseInt(htInput.value) || 10;
                
                console.log('📊 Atributos encontrados:', { ST, HT });
                
                this.estado.pvBase = ST;
                this.estado.pfBase = HT;
                
                this.calcularMaximos();
                this.atualizarTudo();
                return;
            }
        } catch (e) {
            console.log('⚠️ Não encontrou inputs diretos de atributos');
        }
        
        // Método 2: Tentar usar o objeto window se existir
        if (window.personagem && window.personagem.atributos) {
            console.log('📊 Usando atributos do objeto window');
            this.estado.pvBase = window.personagem.atributos.ST || 10;
            this.estado.pfBase = window.personagem.atributos.HT || 10;
            
            this.calcularMaximos();
            this.atualizarTudo();
            return;
        }
        
        // Método 3: Valores padrão
        console.log('📊 Usando valores padrão');
        this.estado.pvBase = 10;
        this.estado.pfBase = 10;
        this.calcularMaximos();
        this.atualizarTudo();
    }
    
    atualizarBaseDeAtributos(dados) {
        console.log('🔄 Atualizando bases com:', dados);
        
        if (dados.ST !== undefined) {
            this.estado.pvBase = dados.ST;
        }
        if (dados.HT !== undefined) {
            this.estado.pfBase = dados.HT;
        }
        
        this.calcularMaximos();
        this.atualizarTudo();
        this.salvarEstado();
    }
    
    // ====================================================
    // CÁLCULOS PRINCIPAIS
    // ====================================================
    
    calcularMaximos() {
        // Fórmula: Máximo = Base + Modificador
        this.estado.pvMax = Math.max(1, this.estado.pvBase + this.estado.pvModificador);
        this.estado.pfMax = Math.max(1, this.estado.pfBase + this.estado.pfModificador);
        
        // Ajusta valores atuais se necessário
        this.estado.pvAtual = Math.min(this.estado.pvAtual, this.estado.pvMax);
        this.estado.pfAtual = Math.min(this.estado.pfAtual, this.estado.pfMax);
        
        console.log('🧮 Máximos calculados:', {
            pvMax: this.estado.pvMax,
            pfMax: this.estado.pfMax,
            pvBase: this.estado.pvBase,
            pfBase: this.estado.pfBase
        });
    }
    
    // ====================================================
    // CONTROLE DE PV - FUNÇÕES PÚBLICAS
    // ====================================================
    
    alterarPV(valor) {
        console.log('⚡ Alterando PV:', valor);
        
        this.estado.pvAtual += valor;
        
        // Limites: máximo é pvMax, mínimo é -5 * pvMax (regra GURPS)
        this.estado.pvAtual = Math.min(this.estado.pvAtual, this.estado.pvMax);
        this.estado.pvAtual = Math.max(-5 * this.estado.pvMax, this.estado.pvAtual);
        
        this.atualizarTudo();
        this.salvarEstado();
        this.aplicarEfeitoVisual('pv', valor > 0 ? 'cura' : 'dano');
    }
    
    setPVAtual(valor) {
        this.estado.pvAtual = valor;
        this.estado.pvAtual = Math.min(this.estado.pvAtual, this.estado.pvMax);
        this.estado.pvAtual = Math.max(-5 * this.estado.pvMax, this.estado.pvAtual);
        
        this.atualizarTudo();
        this.salvarEstado();
    }
    
    resetarPV() {
        this.estado.pvAtual = this.estado.pvMax;
        this.atualizarTudo();
        this.salvarEstado();
        this.aplicarEfeitoVisual('pv', 'cura');
    }
    
    modificarPV(tipo, valor) {
        if (tipo === 'mod') {
            this.estado.pvModificador += valor;
            
            // Limita entre -10 e +10
            this.estado.pvModificador = Math.max(-10, Math.min(10, this.estado.pvModificador));
            
            // Atualiza visual do input
            const input = document.getElementById('pvModificador');
            if (input) input.value = this.estado.pvModificador;
            
            // Recalcula máximos
            this.calcularMaximos();
            this.atualizarTudo();
            this.salvarEstado();
            
            console.log('🔧 Modificador PV alterado:', this.estado.pvModificador);
        }
    }
    
    // ====================================================
    // CONTROLE DE PF - FUNÇÕES PÚBLICAS
    // ====================================================
    
    alterarPF(valor) {
        console.log('⚡ Alterando PF:', valor);
        
        this.estado.pfAtual += valor;
        
        // Limites
        this.estado.pfAtual = Math.min(this.estado.pfAtual, this.estado.pfMax);
        this.estado.pfAtual = Math.max(-this.estado.pfMax, this.estado.pfAtual);
        
        this.atualizarTudo();
        this.salvarEstado();
        this.aplicarEfeitoVisual('pf', valor > 0 ? 'cura' : 'dano');
    }
    
    setPFAtual(valor) {
        this.estado.pfAtual = valor;
        this.estado.pfAtual = Math.min(this.estado.pfAtual, this.estado.pvMax);
        this.estado.pfAtual = Math.max(-this.estado.pfMax, this.estado.pfAtual);
        
        this.atualizarTudo();
        this.salvarEstado();
    }
    
    resetarPF() {
        this.estado.pfAtual = this.estado.pfMax;
        this.atualizarTudo();
        this.salvarEstado();
        this.aplicarEfeitoVisual('pf', 'cura');
    }
    
    modificarPF(tipo, valor) {
        if (tipo === 'mod') {
            this.estado.pfModificador += valor;
            
            // Limita entre -10 e +10
            this.estado.pfModificador = Math.max(-10, Math.min(10, this.estado.pfModificador));
            
            // Atualiza visual do input
            const input = document.getElementById('pfModificador');
            if (input) input.value = this.estado.pfModificador;
            
            // Recalcula máximos
            this.calcularMaximos();
            this.atualizarTudo();
            this.salvarEstado();
            
            console.log('🔧 Modificador PF alterado:', this.estado.pfModificador);
        }
    }
    
    // ====================================================
    // ATUALIZAÇÃO VISUAL - CORE DO SISTEMA
    // ====================================================
    
    atualizarTudo() {
        this.atualizarCardPV();
        this.atualizarCardPF();
        this.atualizarContadorCondicoes();
    }
    
    atualizarCardPV() {
        // 1. Atualiza displays numéricos
        const atualizarElemento = (id, valor) => {
            const el = document.getElementById(id);
            if (el) el.textContent = valor;
        };
        
        atualizarElemento('pvBaseDisplay', this.estado.pvBase);
        atualizarElemento('pvMaxDisplay', this.estado.pvMax);
        
        // 2. Input de valor atual
        const pvAtualInput = document.getElementById('pvAtualDisplay');
        if (pvAtualInput) pvAtualInput.value = this.estado.pvAtual;
        
        // 3. Texto da barra
        const pvTexto = document.getElementById('pvTexto');
        if (pvTexto) pvTexto.textContent = `${this.estado.pvAtual}/${this.estado.pvMax}`;
        
        // 4. Calcula porcentagem para a barra
        const porcentagem = this.estado.pvMax > 0 ? 
            (this.estado.pvAtual / this.estado.pvMax) * 100 : 0;
        
        // 5. Determina estado e cor
        const estadoInfo = this.calcularEstadoPV(porcentagem);
        
        // 6. Atualiza barra de PV
        const pvFill = document.getElementById('pvFill');
        if (pvFill) {
            pvFill.style.width = `${Math.max(0, Math.min(100, porcentagem))}%`;
            pvFill.style.background = estadoInfo.cor;
        }
        
        // 7. Atualiza estado textual
        const pvEstadoDisplay = document.getElementById('pvEstadoDisplay');
        if (pvEstadoDisplay) {
            pvEstadoDisplay.textContent = estadoInfo.estado;
            pvEstadoDisplay.style.color = estadoInfo.cor;
            pvEstadoDisplay.style.backgroundColor = `${estadoInfo.cor}20`;
        }
        
        // 8. Atualiza modificador visual
        const pvModInput = document.getElementById('pvModificador');
        if (pvModInput) pvModInput.value = this.estado.pvModificador;
    }
    
    calcularEstadoPV(porcentagem) {
        // Sistema de cores baseado em jogos de luta:
        // 100-81%: Saudável (Verde)
        // 80-61%: Machucado (Amarelo)  
        // 60-41%: Ferido (Laranja)
        // 40-21%: Crítico (Vermelho)
        // 20-1%: Morrendo (Roxo)
        // 0% ou negativo: Morto (Cinza)
        
        if (this.estado.pvAtual <= 0) {
            return { cor: '#7f8c8d', estado: 'Morto' };
        } else if (porcentagem <= 20) {
            return { cor: '#8e44ad', estado: 'Morrendo' };
        } else if (porcentagem <= 40) {
            return { cor: '#e74c3c', estado: 'Crítico' };
        } else if (porcentagem <= 60) {
            return { cor: '#e67e22', estado: 'Ferido' };
        } else if (porcentagem <= 80) {
            return { cor: '#f1c40f', estado: 'Machucado' };
        } else {
            return { cor: '#27ae60', estado: 'Saudável' };
        }
    }
    
    atualizarCardPF() {
        // 1. Atualiza displays numéricos
        const atualizarElemento = (id, valor) => {
            const el = document.getElementById(id);
            if (el) el.textContent = valor;
        };
        
        atualizarElemento('pfBaseDisplay', this.estado.pfBase);
        atualizarElemento('pfMaxDisplay', this.estado.pfMax);
        
        // 2. Input de valor atual
        const pfAtualInput = document.getElementById('pfAtualDisplay');
        if (pfAtualInput) pfAtualInput.value = this.estado.pfAtual;
        
        // 3. Texto da barra
        const pfTexto = document.getElementById('pfTexto');
        if (pfTexto) pfTexto.textContent = `${this.estado.pfAtual}/${this.estado.pfMax}`;
        
        // 4. Calcula porcentagem para a barra
        const porcentagem = this.estado.pfMax > 0 ? 
            (this.estado.pfAtual / this.estado.pfMax) * 100 : 0;
        
        // 5. Determina estado e cor
        const estadoInfo = this.calcularEstadoPF(porcentagem);
        
        // 6. Atualiza barra de PF
        const pfFill = document.getElementById('pfFill');
        if (pfFill) {
            pfFill.style.width = `${Math.max(0, Math.min(100, porcentagem))}%`;
            pfFill.style.background = estadoInfo.cor;
        }
        
        // 7. Atualiza estado textual
        const pfEstadoDisplay = document.getElementById('pfEstadoDisplay');
        if (pfEstadoDisplay) {
            pfEstadoDisplay.textContent = estadoInfo.estado;
            pfEstadoDisplay.style.color = estadoInfo.cor;
            pfEstadoDisplay.style.backgroundColor = `${estadoInfo.cor}20`;
        }
        
        // 8. Atualiza estados PF (Normal, Fadigado, Exausto)
        this.atualizarEstadosPF(porcentagem);
        
        // 9. Atualiza modificador visual
        const pfModInput = document.getElementById('pfModificador');
        if (pfModInput) pfModInput.value = this.estado.pfModificador;
    }
    
    calcularEstadoPF(porcentagem) {
        // Sistema PF:
        // > 33%: Normal (Azul)
        // 33-1%: Fadigado (Laranja)
        // ≤ 0%: Exausto (Vermelho)
        
        if (this.estado.pfAtual <= 0) {
            return { cor: '#e74c3c', estado: 'Exausto' };
        } else if (porcentagem <= 33) {
            return { cor: '#f39c12', estado: 'Fadigado' };
        } else {
            return { cor: '#3498db', estado: 'Normal' };
        }
    }
    
    atualizarEstadosPF(porcentagem) {
        const estados = document.querySelectorAll('.pf-estado');
        
        estados.forEach(estado => {
            estado.classList.remove('ativo');
            
            const tipo = estado.dataset.estado;
            
            if (tipo === 'normal' && porcentagem > 33 && this.estado.pfAtual > 0) {
                estado.classList.add('ativo');
            } else if (tipo === 'fadigado' && porcentagem <= 33 && porcentagem > 0) {
                estado.classList.add('ativo');
            } else if (tipo === 'exausto' && this.estado.pfAtual <= 0) {
                estado.classList.add('ativo');
            }
        });
    }
    
    // ====================================================
    // CONDIÇÕES DE COMBATE
    // ====================================================
    
    alternarCondicao(nomeCondicao) {
        if (this.estado.condicoesAtivas.has(nomeCondicao)) {
            this.estado.condicoesAtivas.delete(nomeCondicao);
        } else {
            this.estado.condicoesAtivas.add(nomeCondicao);
        }
        
        this.atualizarContadorCondicoes();
        this.salvarEstado();
    }
    
    atualizarContadorCondicoes() {
        const contador = document.getElementById('condicoesAtivas');
        if (contador) {
            contador.textContent = this.estado.condicoesAtivas.size;
        }
        
        // Atualiza visual das condições
        document.querySelectorAll('.condicao-item').forEach(item => {
            const condicao = item.dataset.condicao;
            item.classList.toggle('ativa', this.estado.condicoesAtivas.has(condicao));
        });
    }
    
    // ====================================================
    // EFEITOS VISUAIS
    // ====================================================
    
    aplicarEfeitoVisual(tipo, efeito) {
        const barra = document.getElementById(tipo === 'pv' ? 'pvFill' : 'pfFill');
        if (!barra) return;
        
        barra.classList.add(efeito === 'cura' ? 'cura-recebida' : 'dano-recebido');
        
        setTimeout(() => {
            barra.classList.remove('cura-recebida', 'dano-recebido');
        }, 1000);
    }
    
    // ====================================================
    // SALVAR E CARREGAR ESTADO
    // ====================================================
    
    salvarEstado() {
        try {
            const estadoParaSalvar = {
                pvAtual: this.estado.pvAtual,
                pfAtual: this.estado.pfAtual,
                pvModificador: this.estado.pvModificador,
                pfModificador: this.estado.pfModificador,
                condicoesAtivas: Array.from(this.estado.condicoesAtivas)
            };
            
            localStorage.setItem('sistemaPVPF', JSON.stringify(estadoParaSalvar));
        } catch (e) {
            console.warn('Não foi possível salvar o estado:', e);
        }
    }
    
    carregarEstado() {
        try {
            const salvo = localStorage.getItem('sistemaPVPF');
            if (salvo) {
                const dados = JSON.parse(salvo);
                
                // Carrega valores salvos
                if (dados.pvAtual !== undefined) this.estado.pvAtual = dados.pvAtual;
                if (dados.pfAtual !== undefined) this.estado.pfAtual = dados.pfAtual;
                if (dados.pvModificador !== undefined) this.estado.pvModificador = dados.pvModificador;
                if (dados.pfModificador !== undefined) this.estado.pfModificador = dados.pfModificador;
                if (dados.condicoesAtivas) {
                    this.estado.condicoesAtivas = new Set(dados.condicoesAtivas);
                }
                
                console.log('💾 Estado do PV-PF carregado!');
            }
        } catch (e) {
            console.warn('Não foi possível carregar o estado:', e);
        }
    }
}

// ====================================================
// GLOBAL INIT - INICIALIZAÇÃO GLOBAL
// ====================================================

// Instância global do sistema
let sistemaPVPF = null;

// Função para inicializar o sistema
function inicializarSistemaPVPF() {
    console.log('🚀 Tentando inicializar sistema PV-PF...');
    
    // Verifica se a aba de combate existe
    const combateTab = document.getElementById('combate');
    if (!combateTab) {
        console.log('⏳ Aguardando aba de combate...');
        setTimeout(inicializarSistemaPVPF, 500);
        return;
    }
    
    // Verifica se os elementos necessários existem
    const elementosNecessarios = [
        'pvAtualDisplay',
        'pfAtualDisplay',
        'pvTexto',
        'pfTexto'
    ];
    
    const elementosFaltando = elementosNecessarios.filter(id => !document.getElementById(id));
    
    if (elementosFaltando.length > 0) {
        console.log('⏳ Aguardando elementos:', elementosFaltando);
        setTimeout(inicializarSistemaPVPF, 500);
        return;
    }
    
    // Inicializa o sistema
    sistemaPVPF = new SistemaPVPF();
    window.sistemaPVPF = sistemaPVPF;
    
    console.log('✅ Sistema PV-PF inicializado com sucesso!');
    
    // Dispara evento para informar que está pronto
    document.dispatchEvent(new CustomEvent('sistemaPVPFInicializado'));
}

// ====================================================
// FUNÇÕES GLOBAIS PARA OS ONCLICK DO HTML
// ====================================================

window.alterarPV = function(valor) {
    if (window.sistemaPVPF) {
        window.sistemaPVPF.alterarPV(valor);
    } else {
        console.error('❌ Sistema PV-PF não inicializado!');
        // Tenta inicializar
        inicializarSistemaPVPF();
    }
};

window.alterarPF = function(valor) {
    if (window.sistemaPVPF) {
        window.sistemaPVPF.alterarPF(valor);
    } else {
        console.error('❌ Sistema PV-PF não inicializado!');
        inicializarSistemaPVPF();
    }
};

window.modificarPV = function(tipo, valor) {
    if (window.sistemaPVPF) {
        window.sistemaPVPF.modificarPV(tipo, valor);
    } else {
        console.error('❌ Sistema PV-PF não inicializado!');
        inicializarSistemaPVPF();
    }
};

window.modificarPF = function(tipo, valor) {
    if (window.sistemaPVPF) {
        window.sistemaPVPF.modificarPF(tipo, valor);
    } else {
        console.error('❌ Sistema PV-PF não inicializado!');
        inicializarSistemaPVPF();
    }
};

window.resetarPV = function() {
    if (window.sistemaPVPF) {
        window.sistemaPVPF.resetarPV();
    } else {
        console.error('❌ Sistema PV-PF não inicializado!');
        inicializarSistemaPVPF();
    }
};

window.resetarPF = function() {
    if (window.sistemaPVPF) {
        window.sistemaPVPF.resetarPF();
    } else {
        console.error('❌ Sistema PV-PF não inicializado!');
        inicializarSistemaPVPF();
    }
};

window.atualizarPVManual = function() {
    const input = document.getElementById('pvAtualDisplay');
    if (input && window.sistemaPVPF) {
        const valor = parseInt(input.value) || 0;
        window.sistemaPVPF.setPVAtual(valor);
    }
};

window.atualizarPFManual = function() {
    const input = document.getElementById('pfAtualDisplay');
    if (input && window.sistemaPVPF) {
        const valor = parseInt(input.value) || 0;
        window.sistemaPVPF.setPFAtual(valor);
    }
};

window.alternarCondicao = function(elemento) {
    if (window.sistemaPVPF) {
        const condicao = elemento.dataset.condicao;
        window.sistemaPVPF.alternarCondicao(condicao);
    }
};

window.calcularRDTotal = function() {
    let total = 0;
    document.querySelectorAll('.rd-input').forEach(input => {
        total += parseInt(input.value) || 0;
    });
    
    const rdTotalEl = document.getElementById('rdTotal');
    if (rdTotalEl) {
        rdTotalEl.textContent = total;
    }
};

// ====================================================
// INICIALIZAÇÃO AUTOMÁTICA
// ====================================================

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📄 DOM Carregado - Inicializando PV-PF...');
        inicializarSistemaPVPF();
    });
} else {
    console.log('📄 DOM Já carregado - Inicializando PV-PF...');
    inicializarSistemaPVPF();
}

// Também inicializa quando a aba de combate é ativada
document.addEventListener('DOMContentLoaded', function() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'combate' && tab.classList.contains('active')) {
                    console.log('🎯 Aba Combate ativada!');
                    if (!window.sistemaPVPF) {
                        inicializarSistemaPVPF();
                    }
                }
            }
        });
    });
    
    // Observa a aba de combate
    const combateTab = document.getElementById('combate');
    if (combateTab) {
        observer.observe(combateTab, { attributes: true });
    }
});

// ====================================================
// DEPURAÇÃO - Remove em produção
// ====================================================

// Adiciona função de debug
window.debugPVPF = function() {
    console.log('🔍 DEBUG SISTEMA PV-PF:');
    console.log('Sistema inicializado:', !!window.sistemaPVPF);
    console.log('Estado:', window.sistemaPVPF ? window.sistemaPVPF.estado : 'N/A');
    console.log('Elementos encontrados:', {
        pvAtualDisplay: !!document.getElementById('pvAtualDisplay'),
        pfAtualDisplay: !!document.getElementById('pfAtualDisplay'),
        pvTexto: !!document.getElementById('pvTexto'),
        pfTexto: !!document.getElementById('pfTexto')
    });
    
    // Testa comunicação com atributos
    const stInput = document.getElementById('ST');
    const htInput = document.getElementById('HT');
    console.log('Inputs de atributos:', {
        ST: stInput ? stInput.value : 'Não encontrado',
        HT: htInput ? htInput.value : 'Não encontrado'
    });
};
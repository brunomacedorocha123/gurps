// ====================================================
// SISTEMA PV-PF - COMPLETO E FUNCIONAL
// Controle dos cards de Pontos de Vida e Pontos de Fadiga
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
        
        // Inicialização
        this.carregarEstado();
        this.configurarEventos();
        this.integrarComAtributos();
        this.atualizarTudo();
        
        console.log('✅ Sistema PV-PF carregado e pronto!');
    }
    
    // ====================================================
    // CONFIGURAÇÃO DE EVENTOS
    // ====================================================
    
    configurarEventos() {
        // 1. Botões de dano/cura PV (-5, -2, -1, +1, +2, +5)
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Botões de dano PV
            if (target.classList.contains('btn-dano')) {
                const texto = target.textContent;
                const valor = parseInt(texto.replace(/[^\d]/g, '')) || 1;
                this.alterarPV(-valor);
            }
            
            // Botões de cura PV
            if (target.classList.contains('btn-cura')) {
                const texto = target.textContent;
                const valor = parseInt(texto.replace(/[^\d]/g, '')) || 1;
                this.alterarPV(valor);
            }
            
            // Botões de fadiga PF (-3, -1)
            if (target.classList.contains('btn-fadiga')) {
                const texto = target.textContent;
                const valor = parseInt(texto.replace(/[^\d]/g, '')) || 1;
                this.alterarPF(-valor);
            }
            
            // Botões de descanso PF (+1, +3)
            if (target.classList.contains('btn-descanso')) {
                const texto = target.textContent;
                const valor = parseInt(texto.replace(/[^\d]/g, '')) || 1;
                this.alterarPF(valor);
            }
            
            // Botão reset PV
            if (target.classList.contains('btn-reset') && target.closest('.card-pv')) {
                this.resetarPV();
            }
            
            // Botão reset PF
            if (target.classList.contains('btn-reset') && target.closest('.card-pf')) {
                this.resetarPF();
            }
        });
        
        // 2. Inputs de valores atuais (quando o usuário digita)
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
        
        // 3. Condições de combate
        document.querySelectorAll('.condicao-item').forEach(item => {
            item.addEventListener('click', () => {
                this.alternarCondicao(item.dataset.condicao);
            });
        });
    }
    
    // ====================================================
    // INTEGRAÇÃO COM ATRIBUTOS (ST e HT)
    // ====================================================
    
    integrarComAtributos() {
        // Método 1: Ouvir o evento que já existe
        document.addEventListener('atributosAlterados', (e) => {
            if (e.detail) {
                this.atualizarBaseDeAtributos(e.detail);
            }
        });
        
        // Método 2: Tentar pegar valores iniciais
        this.buscarValoresAtributosIniciais();
    }
    
    buscarValoresAtributosIniciais() {
        // Tenta pegar ST e HT diretamente
        try {
            const stInput = document.getElementById('ST');
            const htInput = document.getElementById('HT');
            
            if (stInput && htInput) {
                const ST = parseInt(stInput.value) || 10;
                const HT = parseInt(htInput.value) || 10;
                
                this.estado.pvBase = ST;
                this.estado.pfBase = HT;
                
                // Atualiza máximos considerando modificadores
                this.calcularMaximos();
                this.atualizarTudo();
            }
        } catch (e) {
            console.log('Aguardando dados dos atributos...');
        }
    }
    
    atualizarBaseDeAtributos(dados) {
        // Atualiza bases com ST e HT
        if (dados.ST !== undefined) {
            this.estado.pvBase = dados.ST;
        }
        if (dados.HT !== undefined) {
            this.estado.pfBase = dados.HT;
        }
        
        // Recalcula máximos
        this.calcularMaximos();
        this.atualizarTudo();
    }
    
    // ====================================================
    // CÁLCULOS DE PV E PF (CORE DO SISTEMA)
    // ====================================================
    
    calcularMaximos() {
        // FÓRMULA: Máximo = Base + Modificador
        this.estado.pvMax = Math.max(1, this.estado.pvBase + this.estado.pvModificador);
        this.estado.pfMax = Math.max(1, this.estado.pfBase + this.estado.pfModificador);
        
        // Ajusta valores atuais se necessário
        this.estado.pvAtual = Math.min(this.estado.pvAtual, this.estado.pvMax);
        this.estado.pvAtual = Math.max(-5 * this.estado.pvMax, this.estado.pvAtual); // Limite de -5x PV máximo
        
        this.estado.pfAtual = Math.min(this.estado.pfAtual, this.estado.pfMax);
        this.estado.pfAtual = Math.max(-this.estado.pfMax, this.estado.pfAtual); // Limite de -1x PF máximo
    }
    
    // ====================================================
    // FUNÇÕES PRINCIPAIS - CONTROLE DE PV
    // ====================================================
    
    alterarPV(valor) {
        // Aplica o valor
        this.estado.pvAtual += valor;
        
        // Limites
        this.estado.pvAtual = Math.min(this.estado.pvAtual, this.estado.pvMax);
        this.estado.pvAtual = Math.max(-5 * this.estado.pvMax, this.estado.pvAtual);
        
        // Atualiza display e salva
        this.atualizarTudo();
        this.salvarEstado();
        
        // Efeito visual
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
        
        // Efeito visual de cura
        this.aplicarEfeitoVisual('pv', 'cura');
    }
    
    // ====================================================
    // FUNÇÕES PRINCIPAIS - CONTROLE DE PF
    // ====================================================
    
    alterarPF(valor) {
        // Aplica o valor
        this.estado.pfAtual += valor;
        
        // Limites
        this.estado.pfAtual = Math.min(this.estado.pfAtual, this.estado.pfMax);
        this.estado.pfAtual = Math.max(-this.estado.pfMax, this.estado.pfAtual);
        
        // Atualiza display e salva
        this.atualizarTudo();
        this.salvarEstado();
        
        // Efeito visual
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
        
        // Efeito visual de cura
        this.aplicarEfeitoVisual('pf', 'cura');
    }
    
    // ====================================================
    // FUNÇÕES DOS MODIFICADORES (Botões + e -)
    // ====================================================
    
    modificarPV(tipo, valor) {
        if (tipo === 'mod') {
            this.estado.pvModificador += valor;
            
            // Limita entre -10 e +10
            this.estado.pvModificador = Math.max(-10, Math.min(10, this.estado.pvModificador));
            
            // Atualiza o input visual
            const input = document.getElementById('pvModificador');
            if (input) input.value = this.estado.pvModificador;
            
            // Recalcula máximos
            this.calcularMaximos();
            this.atualizarTudo();
            this.salvarEstado();
        }
    }
    
    modificarPF(tipo, valor) {
        if (tipo === 'mod') {
            this.estado.pfModificador += valor;
            
            // Limita entre -10 e +10
            this.estado.pfModificador = Math.max(-10, Math.min(10, this.estado.pfModificador));
            
            // Atualiza o input visual
            const input = document.getElementById('pfModificador');
            if (input) input.value = this.estado.pfModificador;
            
            // Recalcula máximos
            this.calcularMaximos();
            this.atualizarTudo();
            this.salvarEstado();
        }
    }
    
    // ====================================================
    // ATUALIZAÇÃO VISUAL - CORE DA INTERFACE
    // ====================================================
    
    atualizarTudo() {
        this.atualizarCardPV();
        this.atualizarCardPF();
        this.atualizarContadorCondicoes();
    }
    
    atualizarCardPV() {
        // 1. Atualiza valores numéricos
        const pvBaseDisplay = document.getElementById('pvBaseDisplay');
        const pvMaxDisplay = document.getElementById('pvMaxDisplay');
        const pvAtualInput = document.getElementById('pvAtualDisplay');
        const pvTexto = document.getElementById('pvTexto');
        
        if (pvBaseDisplay) pvBaseDisplay.textContent = this.estado.pvBase;
        if (pvMaxDisplay) pvMaxDisplay.textContent = this.estado.pvMax;
        if (pvAtualInput) pvAtualInput.value = this.estado.pvAtual;
        if (pvTexto) pvTexto.textContent = `${this.estado.pvAtual}/${this.estado.pvMax}`;
        
        // 2. Calcula porcentagem para a barra
        const porcentagem = this.estado.pvMax > 0 ? 
            (this.estado.pvAtual / this.estado.pvMax) * 100 : 0;
        
        // 3. Determina estado e cor baseado na porcentagem
        const estadoInfo = this.calcularEstadoPV(porcentagem);
        
        // 4. Atualiza barra de PV
        const pvFill = document.getElementById('pvFill');
        const pvEstadoDisplay = document.getElementById('pvEstadoDisplay');
        
        if (pvFill) {
            pvFill.style.width = `${Math.max(0, Math.min(100, porcentagem))}%`;
            pvFill.style.background = estadoInfo.cor;
            
            // Efeito de pulsação para estados críticos
            if (porcentagem <= 40 && this.estado.pvAtual > 0) {
                pvFill.style.animation = 'pulse 1.5s infinite alternate';
            } else {
                pvFill.style.animation = 'none';
            }
        }
        
        if (pvEstadoDisplay) {
            pvEstadoDisplay.textContent = estadoInfo.estado;
            pvEstadoDisplay.style.color = estadoInfo.cor;
            pvEstadoDisplay.style.backgroundColor = `${estadoInfo.cor}20`;
        }
        
        // 5. Atualiza modificador visual
        const pvModInput = document.getElementById('pvModificador');
        if (pvModInput && pvModInput.value != this.estado.pvModificador) {
            pvModInput.value = this.estado.pvModificador;
        }
    }
    
    calcularEstadoPV(porcentagem) {
        // FÓRMULA COMPLETA DE ESTADOS DE PV (como você quer):
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
        // 1. Atualiza valores numéricos
        const pfBaseDisplay = document.getElementById('pfBaseDisplay');
        const pfMaxDisplay = document.getElementById('pfMaxDisplay');
        const pfAtualInput = document.getElementById('pfAtualDisplay');
        const pfTexto = document.getElementById('pfTexto');
        
        if (pfBaseDisplay) pfBaseDisplay.textContent = this.estado.pfBase;
        if (pfMaxDisplay) pfMaxDisplay.textContent = this.estado.pfMax;
        if (pfAtualInput) pfAtualInput.value = this.estado.pfAtual;
        if (pfTexto) pfTexto.textContent = `${this.estado.pfAtual}/${this.estado.pfMax}`;
        
        // 2. Calcula porcentagem para a barra
        const porcentagem = this.estado.pfMax > 0 ? 
            (this.estado.pfAtual / this.estado.pfMax) * 100 : 0;
        
        // 3. Determina estado e cor
        const estadoInfo = this.calcularEstadoPF(porcentagem);
        
        // 4. Atualiza barra de PF
        const pfFill = document.getElementById('pfFill');
        const pfEstadoDisplay = document.getElementById('pfEstadoDisplay');
        
        if (pfFill) {
            pfFill.style.width = `${Math.max(0, Math.min(100, porcentagem))}%`;
            pfFill.style.background = estadoInfo.cor;
        }
        
        if (pfEstadoDisplay) {
            pfEstadoDisplay.textContent = estadoInfo.estado;
            pfEstadoDisplay.style.color = estadoInfo.cor;
            pfEstadoDisplay.style.backgroundColor = `${estadoInfo.cor}20`;
        }
        
        // 5. Atualiza estados PF (Normal, Fadigado, Exausto)
        this.atualizarEstadosPF(porcentagem);
        
        // 6. Atualiza modificador visual
        const pfModInput = document.getElementById('pfModificador');
        if (pfModInput && pfModInput.value != this.estado.pfModificador) {
            pfModInput.value = this.estado.pfModificador;
        }
    }
    
    calcularEstadoPF(porcentagem) {
        // FÓRMULA DE ESTADOS DE PF:
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
            
            // Lógica para ativar o estado correto
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
            if (this.estado.condicoesAtivas.has(condicao)) {
                item.classList.add('ativa');
            } else {
                item.classList.remove('ativa');
            }
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
                
                console.log('Estado do PV-PF carregado com sucesso!');
            }
        } catch (e) {
            console.warn('Não foi possível carregar o estado:', e);
        }
    }
}

// ====================================================
// INICIALIZAÇÃO GLOBAL
// ====================================================

let sistemaPVPF;

function inicializarSistemaPVPF() {
    // Espera a aba de combate estar pronta
    const combateTab = document.getElementById('combate');
    if (!combateTab) {
        // Tenta novamente em 500ms
        setTimeout(inicializarSistemaPVPF, 500);
        return;
    }
    
    // Inicializa o sistema
    sistemaPVPF = new SistemaPVPF();
    window.sistemaPVPF = sistemaPVPF;
    
    console.log('✅ Sistema PV-PF inicializado na aba de combate!');
}

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarSistemaPVPF);
} else {
    inicializarSistemaPVPF();
}

// ====================================================
// FUNÇÕES GLOBAIS PARA O HTML (onclick)
// ====================================================

// Funções chamadas diretamente do HTML
window.alterarPV = function(valor) {
    if (window.sistemaPVPF) {
        window.sistemaPVPF.alterarPV(valor);
    }
};

window.alterarPF = function(valor) {
    if (window.sistemaPVPF) {
        window.sistemaPVPF.alterarPF(valor);
    }
};

window.modificarPV = function(tipo, valor) {
    if (window.sistemaPVPF) {
        window.sistemaPVPF.modificarPV(tipo, valor);
    }
};

window.modificarPF = function(tipo, valor) {
    if (window.sistemaPVPF) {
        window.sistemaPVPF.modificarPF(tipo, valor);
    }
};

window.resetarPV = function() {
    if (window.sistemaPVPF) {
        window.sistemaPVPF.resetarPV();
    }
};

window.resetarPF = function() {
    if (window.sistemaPVPF) {
        window.sistemaPVPF.resetarPF();
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

// Função para calcular RD total (mantida para compatibilidade)
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

// Inicializa o cálculo de RD ao carregar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (typeof calcularRDTotal === 'function') {
            calcularRDTotal();
        }
    }, 1000);
});
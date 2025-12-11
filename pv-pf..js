// pv-pf-integrado.js
class SistemaPVPFIntegrado {
    constructor() {
        this.pvBase = 10;
        this.pvBonus = 0;
        this.pvMax = 10;
        this.pvAtual = 10;
        
        this.pfBase = 10;
        this.pfBonus = 0;
        this.pfMax = 10;
        this.pfAtual = 10;
        
        this.condicoesAtivas = new Set();
        this.rdValores = {};
        
        this.init();
    }
    
    init() {
        this.configurarEventos();
        this.observarAtributos();
        this.carregarEstado();
        this.atualizarDisplayCompleto();
        
        console.log('Sistema PV-PF Integrado inicializado!');
    }
    
    observarAtributos() {
        // Método 1: Observa os inputs ST e HT diretamente
        const STInput = document.getElementById('ST');
        const HTInput = document.getElementById('HT');
        
        if (STInput) {
            STInput.addEventListener('change', () => this.atualizarBaseDeAtributos());
            STInput.addEventListener('input', () => {
                clearTimeout(this.stTimeout);
                this.stTimeout = setTimeout(() => this.atualizarBaseDeAtributos(), 300);
            });
        }
        
        if (HTInput) {
            HTInput.addEventListener('change', () => this.atualizarBaseDeAtributos());
            HTInput.addEventListener('input', () => {
                clearTimeout(this.htTimeout);
                this.htTimeout = setTimeout(() => this.atualizarBaseDeAtributos(), 300);
            });
        }
        
        // Método 2: Observa bônus de PV e PF da aba atributos
        this.observarBonusAtributos();
        
        // Método 3: Tenta pegar dados do evento do atributos.js (se existir)
        document.addEventListener('atributosAlterados', (e) => {
            if (e.detail) {
                this.processarDadosAtributos(e.detail);
            }
        });
        
        // Inicializa com os valores atuais
        this.atualizarBaseDeAtributos();
    }
    
    observarBonusAtributos() {
        // Observa os inputs de bônus na aba atributos
        const bonusPV = document.getElementById('bonusPV');
        const bonusPF = document.getElementById('bonusPF');
        
        if (bonusPV) {
            bonusPV.addEventListener('change', () => this.atualizarBonus());
            bonusPV.addEventListener('input', () => {
                clearTimeout(this.bonusTimeout);
                this.bonusTimeout = setTimeout(() => this.atualizarBonus(), 300);
            });
        }
        
        if (bonusPF) {
            bonusPF.addEventListener('change', () => this.atualizarBonus());
            bonusPF.addEventListener('input', () => {
                clearTimeout(this.bonusTimeout);
                this.bonusTimeout = setTimeout(() => this.atualizarBonus(), 300);
            });
        }
    }
    
    atualizarBaseDeAtributos() {
        // Pega valores diretamente dos inputs
        const ST = this.obterValorAtributo('ST');
        const HT = this.obterValorAtributo('HT');
        
        this.pvBase = ST || 10;
        this.pfBase = HT || 10;
        
        this.calcularMaximos();
        this.atualizarDisplayCompleto();
    }
    
    atualizarBonus() {
        // Pega bônus dos inputs na aba atributos
        const bonusPV = this.obterValorAtributo('bonusPV');
        const bonusPF = this.obterValorAtributo('bonusPF');
        
        this.pvBonus = bonusPV || 0;
        this.pfBonus = bonusPF || 0;
        
        // Atualiza os inputs de modificador na aba combate
        const pvModInput = document.getElementById('pvModificador');
        const pfModInput = document.getElementById('pfModificador');
        
        if (pvModInput) pvModInput.value = this.pvBonus;
        if (pfModInput) pfModInput.value = this.pfBonus;
        
        this.calcularMaximos();
        this.atualizarDisplayCompleto();
    }
    
    obterValorAtributo(id) {
        const elemento = document.getElementById(id);
        if (!elemento) return null;
        
        // Tenta pegar o valor
        const valor = elemento.value || elemento.textContent;
        const numero = parseInt(valor);
        
        return isNaN(numero) ? null : numero;
    }
    
    processarDadosAtributos(dados) {
        // Processa dados do evento (se o atributos.js disparar)
        if (dados.ST !== undefined) this.pvBase = dados.ST;
        if (dados.HT !== undefined) this.pfBase = dados.HT;
        if (dados.Bonus?.PV !== undefined) this.pvBonus = dados.Bonus.PV;
        if (dados.Bonus?.PF !== undefined) this.pfBonus = dados.Bonus.PF;
        
        this.calcularMaximos();
        this.atualizarDisplayCompleto();
    }
    
    calcularMaximos() {
        this.pvMax = Math.max(1, this.pvBase + this.pvBonus);
        this.pfMax = Math.max(1, this.pfBase + this.pfBonus);
        
        // Ajusta valores atuais se necessário
        this.pvAtual = Math.min(this.pvAtual, this.pvMax);
        this.pvAtual = Math.max(-50, this.pvAtual);
        
        this.pfAtual = Math.min(this.pfAtual, this.pfMax);
        this.pfAtual = Math.max(-10, this.pfAtual);
    }
    
    configurarEventos() {
        // Eventos dos botões de dano/cura
        document.addEventListener('click', (e) => {
            // Botões de dano PV (-5, -2, -1)
            if (e.target.classList.contains('btn-dano')) {
                const texto = e.target.textContent;
                const valor = parseInt(texto.replace(/[^\d]/g, '')) || 1;
                this.alterarPV(-valor);
                return;
            }
            
            // Botões de cura PV (+1, +2, +5)
            if (e.target.classList.contains('btn-cura')) {
                const texto = e.target.textContent;
                const valor = parseInt(texto.replace(/[^\d]/g, '')) || 1;
                this.alterarPV(valor);
                return;
            }
            
            // Botões de fadiga PF (-3, -1)
            if (e.target.classList.contains('btn-fadiga')) {
                const texto = e.target.textContent;
                const valor = parseInt(texto.replace(/[^\d]/g, '')) || 1;
                this.alterarPF(-valor);
                return;
            }
            
            // Botões de descanso PF (+1, +3)
            if (e.target.classList.contains('btn-descanso')) {
                const texto = e.target.textContent;
                const valor = parseInt(texto.replace(/[^\d]/g, '')) || 1;
                this.alterarPF(valor);
                return;
            }
            
            // Botão reset PV
            if (e.target.classList.contains('btn-reset') && 
                e.target.closest('.card-pv')) {
                this.resetarPV();
                return;
            }
            
            // Botão reset PF
            if (e.target.classList.contains('btn-reset') && 
                e.target.closest('.card-pf')) {
                this.resetarPF();
                return;
            }
            
            // Botões modificadores (- e +)
            if (e.target.classList.contains('btn-mod')) {
                const modificador = e.target.closest('.controle-modificador');
                if (!modificador) return;
                
                const input = modificador.querySelector('.mod-input');
                const isMinus = e.target.classList.contains('minus');
                const isPV = modificador.closest('.card-pv');
                
                if (input) {
                    let valor = parseInt(input.value) || 0;
                    valor += isMinus ? -1 : 1;
                    valor = Math.max(-10, Math.min(10, valor));
                    input.value = valor;
                    
                    if (isPV) {
                        this.pvBonus = valor;
                    } else {
                        this.pfBonus = valor;
                    }
                    
                    this.calcularMaximos();
                    this.atualizarDisplayCompleto();
                    this.salvarEstado();
                }
            }
        });
        
        // Eventos dos inputs (modificadores e valores atuais)
        document.addEventListener('change', (e) => {
            // Inputs de modificador
            if (e.target.classList.contains('mod-input')) {
                const valor = parseInt(e.target.value) || 0;
                const isPV = e.target.closest('.card-pv');
                
                if (isPV) {
                    this.pvBonus = valor;
                } else {
                    this.pfBonus = valor;
                }
                
                this.calcularMaximos();
                this.atualizarDisplayCompleto();
                this.salvarEstado();
                return;
            }
            
            // Inputs de PV/PF atuais
            if (e.target.id === 'pvAtualDisplay') {
                this.pvAtual = parseInt(e.target.value) || 0;
                this.atualizarDisplayCompleto();
                this.salvarEstado();
                return;
            }
            
            if (e.target.id === 'pfAtualDisplay') {
                this.pfAtual = parseInt(e.target.value) || 0;
                this.atualizarDisplayCompleto();
                this.salvarEstado();
                return;
            }
        });
        
        // Eventos das condições
        document.addEventListener('click', (e) => {
            if (e.target.closest('.condicao-item')) {
                const item = e.target.closest('.condicao-item');
                const condicao = item.dataset.condicao;
                
                item.classList.toggle('ativa');
                
                if (item.classList.contains('ativa')) {
                    this.condicoesAtivas.add(condicao);
                } else {
                    this.condicoesAtivas.delete(condicao);
                }
                
                this.atualizarContadorCondicoes();
                this.salvarEstado();
            }
        });
        
        // Eventos dos inputs RD
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('rd-input')) {
                this.calcularRDTotal();
            }
        });
    }
    
    alterarPV(valor) {
        this.pvAtual += valor;
        this.pvAtual = Math.max(-50, Math.min(this.pvAtual, this.pvMax));
        this.atualizarDisplayCompleto();
        this.salvarEstado();
        
        // Efeito visual
        this.aplicarEfeito('pv', valor > 0 ? 'cura' : 'dano');
    }
    
    alterarPF(valor) {
        this.pfAtual += valor;
        this.pfAtual = Math.max(-10, Math.min(this.pfAtual, this.pfMax));
        this.atualizarDisplayCompleto();
        this.salvarEstado();
        
        // Efeito visual
        this.aplicarEfeito('pf', valor > 0 ? 'cura' : 'dano');
    }
    
    aplicarEfeito(tipo, efeito) {
        const barra = document.getElementById(tipo === 'pv' ? 'pvFill' : 'pfFill');
        if (!barra) return;
        
        barra.classList.add(efeito === 'cura' ? 'cura-recebida' : 'dano-recebido');
        
        setTimeout(() => {
            barra.classList.remove('cura-recebida', 'dano-recebido');
        }, 1000);
    }
    
    resetarPV() {
        this.pvAtual = this.pvMax;
        this.atualizarDisplayCompleto();
        this.salvarEstado();
    }
    
    resetarPF() {
        this.pfAtual = this.pfMax;
        this.atualizarDisplayCompleto();
        this.salvarEstado();
    }
    
    atualizarDisplayCompleto() {
        this.atualizarDisplayPV();
        this.atualizarDisplayPF();
        this.atualizarEstadosPF();
        this.atualizarContadorCondicoes();
    }
    
    atualizarDisplayPV() {
        // Atualiza elementos específicos
        const elementos = {
            base: document.getElementById('pvBaseDisplay'),
            max: document.getElementById('pvMaxDisplay'),
            atual: document.getElementById('pvAtualDisplay'),
            estado: document.getElementById('pvEstadoDisplay'),
            texto: document.getElementById('pvTexto'),
            fill: document.getElementById('pvFill')
        };
        
        // Atualiza valores
        if (elementos.base) elementos.base.textContent = this.pvBase;
        if (elementos.max) elementos.max.textContent = this.pvMax;
        if (elementos.atual) elementos.atual.value = this.pvAtual;
        if (elementos.texto) elementos.texto.textContent = `${this.pvAtual}/${this.pvMax}`;
        
        // Calcula porcentagem e estado
        const porcentagem = this.pvMax > 0 ? (this.pvAtual / this.pvMax) * 100 : 0;
        const { cor, estado } = this.calcularEstadoPV(porcentagem);
        
        // Aplica cor e estado
        if (elementos.fill) {
            elementos.fill.style.background = cor;
            elementos.fill.style.width = `${Math.max(0, Math.min(100, porcentagem))}%`;
            
            // Efeito de pulsação para estados críticos
            if (porcentagem <= 40 && this.pvAtual > 0) {
                elementos.fill.style.animation = 'pulse 1.5s infinite alternate';
            } else {
                elementos.fill.style.animation = 'none';
            }
        }
        
        if (elementos.estado) {
            elementos.estado.textContent = estado;
            elementos.estado.style.color = cor;
            elementos.estado.style.backgroundColor = `${cor}20`;
        }
    }
    
    calcularEstadoPV(porcentagem) {
        if (this.pvAtual <= 0) {
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
    
    atualizarDisplayPF() {
        // Atualiza elementos específicos
        const elementos = {
            base: document.getElementById('pfBaseDisplay'),
            max: document.getElementById('pfMaxDisplay'),
            atual: document.getElementById('pfAtualDisplay'),
            estado: document.getElementById('pfEstadoDisplay'),
            texto: document.getElementById('pfTexto'),
            fill: document.getElementById('pfFill')
        };
        
        // Atualiza valores
        if (elementos.base) elementos.base.textContent = this.pfBase;
        if (elementos.max) elementos.max.textContent = this.pfMax;
        if (elementos.atual) elementos.atual.value = this.pfAtual;
        if (elementos.texto) elementos.texto.textContent = `${this.pfAtual}/${this.pfMax}`;
        
        // Calcula porcentagem e estado
        const porcentagem = this.pfMax > 0 ? (this.pfAtual / this.pfMax) * 100 : 0;
        const { cor, estado } = this.calcularEstadoPF(porcentagem);
        
        // Aplica cor e estado
        if (elementos.fill) {
            elementos.fill.style.background = cor;
            elementos.fill.style.width = `${Math.max(0, Math.min(100, porcentagem))}%`;
        }
        
        if (elementos.estado) {
            elementos.estado.textContent = estado;
            elementos.estado.style.color = cor;
            elementos.estado.style.backgroundColor = `${cor}20`;
        }
    }
    
    calcularEstadoPF(porcentagem) {
        if (this.pfAtual <= 0) {
            return { cor: '#e74c3c', estado: 'Exausto' };
        } else if (porcentagem <= 33) {
            return { cor: '#f39c12', estado: 'Fadigado' };
        } else {
            return { cor: '#3498db', estado: 'Normal' };
        }
    }
    
    atualizarEstadosPF() {
        const porcentagem = this.pfMax > 0 ? (this.pfAtual / this.pfMax) * 100 : 0;
        const estados = document.querySelectorAll('.pf-estado');
        
        estados.forEach(estado => {
            estado.classList.remove('ativo');
            
            const tipo = estado.dataset.estado;
            if (tipo === 'normal' && porcentagem > 33 && this.pfAtual > 0) {
                estado.classList.add('ativo');
            } else if (tipo === 'fadigado' && porcentagem <= 33 && porcentagem > 0) {
                estado.classList.add('ativo');
            } else if (tipo === 'exausto' && this.pfAtual <= 0) {
                estado.classList.add('ativo');
            }
        });
    }
    
    calcularRDTotal() {
        let total = 0;
        const inputs = document.querySelectorAll('.rd-input');
        
        inputs.forEach(input => {
            const valor = parseInt(input.value) || 0;
            const parte = input.closest('.rd-parte')?.dataset.parte;
            
            if (parte) {
                this.rdValores[parte] = valor;
            }
            
            total += valor;
        });
        
        const rdTotalEl = document.getElementById('rdTotal');
        if (rdTotalEl) {
            rdTotalEl.textContent = total;
        }
        
        this.salvarEstado();
    }
    
    atualizarContadorCondicoes() {
        const contador = document.getElementById('condicoesAtivas');
        if (contador) {
            contador.textContent = this.condicoesAtivas.size;
        }
    }
    
    salvarEstado() {
        const estado = {
            pvAtual: this.pvAtual,
            pvMax: this.pvMax,
            pvBonus: this.pvBonus,
            pfAtual: this.pfAtual,
            pfMax: this.pfMax,
            pfBonus: this.pfBonus,
            condicoes: Array.from(this.condicoesAtivas),
            rdValores: this.rdValores
        };
        
        localStorage.setItem('combateEstado', JSON.stringify(estado));
    }
    
    carregarEstado() {
        const estado = localStorage.getItem('combateEstado');
        if (estado) {
            try {
                const dados = JSON.parse(estado);
                
                // Carrega valores principais
                this.pvAtual = dados.pvAtual || this.pvAtual;
                this.pvMax = dados.pvMax || this.pvMax;
                this.pvBonus = dados.pvBonus || 0;
                
                this.pfAtual = dados.pfAtual || this.pfAtual;
                this.pfMax = dados.pfMax || this.pfMax;
                this.pfBonus = dados.pfBonus || 0;
                
                // Atualiza inputs de modificador
                const pvModInput = document.getElementById('pvModificador');
                const pfModInput = document.getElementById('pfModificador');
                
                if (pvModInput) pvModInput.value = this.pvBonus;
                if (pfModInput) pfModInput.value = this.pfBonus;
                
                // Carrega condições
                if (dados.condicoes) {
                    this.condicoesAtivas = new Set(dados.condicoes);
                    document.querySelectorAll('.condicao-item').forEach(item => {
                        if (this.condicoesAtivas.has(item.dataset.condicao)) {
                            item.classList.add('ativa');
                        }
                    });
                }
                
                // Carrega RD
                if (dados.rdValores) {
                    this.rdValores = dados.rdValores;
                    Object.entries(this.rdValores).forEach(([parte, valor]) => {
                        const input = document.querySelector(`.rd-parte[data-parte="${parte}"] .rd-input`);
                        if (input) {
                            input.value = valor;
                        }
                    });
                }
                
            } catch (e) {
                console.error('Erro ao carregar estado do combate:', e);
            }
        }
    }
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====

let sistemaPVPF;

function inicializarSistemaPVPF() {
    // Espera o DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            iniciar();
        });
    } else {
        iniciar();
    }
    
    function iniciar() {
        // Verifica se a aba de combate está presente
        const combateTab = document.getElementById('combate');
        if (!combateTab) return;
        
        // Inicializa o sistema
        sistemaPVPF = new SistemaPVPFIntegrado();
        window.sistemaPVPF = sistemaPVPF;
        
        // Calcula RD total inicial
        sistemaPVPF.calcularRDTotal();
        
        console.log('Sistema PV-PF Integrado carregado!');
    }
}

// Observa quando a aba de combate se torna ativa
function observarAbaCombate() {
    const combateTab = document.getElementById('combate');
    if (!combateTab) return;
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'class' &&
                mutation.target.classList.contains('active')) {
                
                // Pequeno delay para garantir que o conteúdo esteja carregado
                setTimeout(() => {
                    if (!window.sistemaPVPF) {
                        inicializarSistemaPVPF();
                    }
                }, 50);
            }
        });
    });
    
    observer.observe(combateTab, { attributes: true });
    
    // Se já estiver ativo, inicializa imediatamente
    if (combateTab.classList.contains('active')) {
        setTimeout(() => {
            inicializarSistemaPVPF();
        }, 100);
    }
}

// Inicia a observação quando a página carrega
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observarAbaCombate);
} else {
    observarAbaCombate();
}

// ===== FUNÇÕES GLOBAIS PARA O HTML =====

// Estas funções podem ser chamadas diretamente do HTML
window.alterarPV = function(valor) {
    window.sistemaPVPF?.alterarPV(valor);
};

window.alterarPF = function(valor) {
    window.sistemaPVPF?.alterarPF(valor);
};

window.modificarPV = function(tipo, valor) {
    if (tipo === 'mod' && window.sistemaPVPF) {
        const input = document.getElementById('pvModificador');
        if (input) {
            let current = parseInt(input.value) || 0;
            current += valor;
            current = Math.max(-10, Math.min(10, current));
            input.value = current;
            
            window.sistemaPVPF.pvBonus = current;
            window.sistemaPVPF.calcularMaximos();
            window.sistemaPVPF.atualizarDisplayCompleto();
            window.sistemaPVPF.salvarEstado();
        }
    }
};

window.modificarPF = function(tipo, valor) {
    if (tipo === 'mod' && window.sistemaPVPF) {
        const input = document.getElementById('pfModificador');
        if (input) {
            let current = parseInt(input.value) || 0;
            current += valor;
            current = Math.max(-10, Math.min(10, current));
            input.value = current;
            
            window.sistemaPVPF.pfBonus = current;
            window.sistemaPVPF.calcularMaximos();
            window.sistemaPVPF.atualizarDisplayCompleto();
            window.sistemaPVPF.salvarEstado();
        }
    }
};

window.resetarPV = function() {
    window.sistemaPVPF?.resetarPV();
};

window.resetarPF = function() {
    window.sistemaPVPF?.resetarPF();
};

window.calcularRDTotal = function() {
    window.sistemaPVPF?.calcularRDTotal();
};

window.alternarCondicao = function(elemento) {
    elemento.classList.toggle('ativa');
    const condicao = elemento.dataset.condicao;
    
    if (window.sistemaPVPF) {
        if (elemento.classList.contains('ativa')) {
            window.sistemaPVPF.condicoesAtivas.add(condicao);
        } else {
            window.sistemaPVPF.condicoesAtivas.delete(condicao);
        }
        
        window.sistemaPVPF.atualizarContadorCondicoes();
        window.sistemaPVPF.salvarEstado();
    }
};

window.atualizarPVManual = function() {
    const input = document.getElementById('pvAtualDisplay');
    if (input && window.sistemaPVPF) {
        window.sistemaPVPF.pvAtual = parseInt(input.value) || 0;
        window.sistemaPVPF.atualizarDisplayCompleto();
        window.sistemaPVPF.salvarEstado();
    }
};

window.atualizarPFManual = function() {
    const input = document.getElementById('pfAtualDisplay');
    if (input && window.sistemaPVPF) {
        window.sistemaPVPF.pfAtual = parseInt(input.value) || 0;
        window.sistemaPVPF.atualizarDisplayCompleto();
        window.sistemaPVPF.salvarEstado();
    }
};
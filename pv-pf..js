// pv-pf-inteligente.js
class SistemaPVPF {
    constructor() {
        this.pvAtual = 10;
        this.pvMax = 10;
        this.pvMod = 0;
        
        this.pfAtual = 10;
        this.pfMax = 10;
        this.pfMod = 0;
        
        this.condicoesAtivas = new Set();
        
        this.init();
    }
    
    init() {
        this.carregarDados();
        this.atualizarDisplayPV();
        this.atualizarDisplayPF();
        this.configurarEventos();
    }
    
    carregarDados() {
        // Carrega dados dos atributos
        const ST = parseInt(document.getElementById('ST')?.value) || 10;
        const HT = parseInt(document.getElementById('HT')?.value) || 10;
        
        // Calcula PV base baseado em ST
        this.pvBase = ST;
        this.pvMax = this.pvBase + this.pvMod;
        this.pvAtual = Math.min(this.pvAtual, this.pvMax);
        
        // Calcula PF base baseado em HT
        this.pfBase = HT;
        this.pfMax = this.pfBase + this.pfMod;
        this.pfAtual = Math.min(this.pfAtual, this.pfMax);
        
        // Atualiza dano base
        this.atualizarDanoBase(ST);
    }
    
    atualizarDanoBase(ST) {
        // Sistema GURPS de dano base
        let danoGDP = "1d-2";
        let danoGEB = "1d";
        
        if (ST >= 11) danoGEB = "1d+1";
        if (ST >= 13) danoGEB = "2d-1";
        if (ST >= 15) danoGEB = "2d";
        if (ST >= 17) danoGEB = "2d+1";
        if (ST >= 19) danoGEB = "2d+2";
        if (ST >= 21) danoGEB = "3d-1";
        
        if (ST >= 12) danoGDP = "1d-1";
        if (ST >= 14) danoGDP = "1d";
        if (ST >= 16) danoGDP = "1d+1";
        if (ST >= 18) danoGDP = "1d+2";
        if (ST >= 20) danoGDP = "2d-1";
        if (ST >= 22) danoGDP = "2d";
        
        document.getElementById('danoGdp').textContent = danoGDP;
        document.getElementById('danoGeb').textContent = danoGEB;
    }
    
    configurarEventos() {
        // Eventos para controle de PV
        document.querySelectorAll('.btn-dano').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = parseInt(e.target.dataset.amount) || 
                              parseInt(e.target.textContent.replace('-', ''));
                this.alterarPV(-Math.abs(amount));
            });
        });
        
        document.querySelectorAll('.btn-cura').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = parseInt(e.target.dataset.amount) || 
                              parseInt(e.target.textContent.replace('+', ''));
                this.alterarPV(Math.abs(amount));
            });
        });
        
        document.querySelectorAll('.btn-fadiga').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = parseInt(e.target.dataset.amount) || 
                              parseInt(e.target.textContent.replace('-', ''));
                this.alterarPF(-Math.abs(amount));
            });
        });
        
        document.querySelectorAll('.btn-descanso').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = parseInt(e.target.dataset.amount) || 
                              parseInt(e.target.textContent.replace('+', ''));
                this.alterarPF(Math.abs(amount));
            });
        });
        
        // Eventos para condições
        document.querySelectorAll('.condicao-item').forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('ativa');
                const condicao = item.dataset.condicao;
                
                if (item.classList.contains('ativa')) {
                    this.condicoesAtivas.add(condicao);
                } else {
                    this.condicoesAtivas.delete(condicao);
                }
                
                this.atualizarContadorCondicoes();
            });
        });
    }
    
    alterarPV(valor) {
        this.pvAtual += valor;
        
        // Limitar entre -50 e máximo
        this.pvAtual = Math.max(-50, Math.min(this.pvAtual, this.pvMax));
        
        this.atualizarDisplayPV();
        this.salvarEstado();
    }
    
    alterarPF(valor) {
        this.pfAtual += valor;
        
        // Limitar entre -10 e máximo
        this.pfAtual = Math.max(-10, Math.min(this.pfAtual, this.pfMax));
        
        this.atualizarDisplayPF();
        this.salvarEstado();
    }
    
    modificarPV(tipo, valor) {
        if (tipo === 'mod') {
            this.pvMod += valor;
            this.pvMod = Math.max(-10, Math.min(this.pvMod, 10));
            document.getElementById('pvModificador').value = this.pvMod;
            this.pvMax = this.pvBase + this.pvMod;
        } else if (tipo === 'max') {
            this.pvMax += valor;
            this.pvMax = Math.max(1, this.pvMax);
        }
        
        this.pvAtual = Math.min(this.pvAtual, this.pvMax);
        this.atualizarDisplayPV();
        this.salvarEstado();
    }
    
    modificarPF(tipo, valor) {
        if (tipo === 'mod') {
            this.pfMod += valor;
            this.pfMod = Math.max(-10, Math.min(this.pfMod, 10));
            document.getElementById('pfModificador').value = this.pfMod;
            this.pfMax = this.pfBase + this.pfMod;
        } else if (tipo === 'max') {
            this.pfMax += valor;
            this.pfMax = Math.max(1, this.pfMax);
        }
        
        this.pfAtual = Math.min(this.pfAtual, this.pfMax);
        this.atualizarDisplayPF();
        this.salvarEstado();
    }
    
    atualizarDisplayPV() {
        const porcentagem = (this.pvAtual / this.pvMax) * 100;
        const barraFill = document.getElementById('pvFill');
        const pvTexto = document.getElementById('pvTexto');
        const pvEstado = document.getElementById('pvEstadoDisplay');
        
        // Atualizar valores
        document.getElementById('pvBase').textContent = this.pvBase;
        document.getElementById('pvMax').textContent = this.pvMax;
        document.getElementById('pvAtualDisplay').textContent = this.pvAtual;
        document.getElementById('pvAtualInput').value = this.pvAtual;
        pvTexto.textContent = `${this.pvAtual}/${this.pvMax}`;
        
        // Sistema de cores inteligente
        let cor, estado;
        
        if (this.pvAtual <= 0) {
            cor = '#7f8c8d'; // Cinza - Morto
            estado = 'Morto';
        } else if (porcentagem <= 20) {
            cor = '#8e44ad'; // Roxo - Morrendo
            estado = 'Morrendo';
        } else if (porcentagem <= 40) {
            cor = '#e74c3c'; // Vermelho - Crítico
            estado = 'Crítico';
        } else if (porcentagem <= 60) {
            cor = '#e67e22'; // Laranja - Ferido
            estado = 'Ferido';
        } else if (porcentagem <= 80) {
            cor = '#f1c40f'; // Amarelo - Machucado
            estado = 'Machucado';
        } else {
            cor = '#27ae60'; // Verde - Saudável
            estado = 'Saudável';
        }
        
        // Aplicar cor e transição suave
        barraFill.style.background = `linear-gradient(90deg, ${cor}, ${cor})`;
        barraFill.style.width = `${Math.max(0, porcentagem)}%`;
        pvEstado.textContent = estado;
        pvEstado.style.color = cor;
        pvEstado.style.background = `${cor}20`;
        
        // Efeito de pulsação para estados críticos
        if (porcentagem <= 40) {
            barraFill.style.animation = 'pulse 1.5s infinite alternate';
        } else {
            barraFill.style.animation = 'none';
        }
    }
    
    atualizarDisplayPF() {
        const porcentagem = (this.pfAtual / this.pfMax) * 100;
        const barraFill = document.getElementById('pfFill');
        const pfTexto = document.getElementById('pfTexto');
        const pfEstado = document.getElementById('pfEstado');
        
        // Atualizar valores
        document.getElementById('pfBase').textContent = this.pfBase;
        document.getElementById('pfMax').textContent = this.pfMax;
        document.getElementById('pfAtualDisplay').textContent = this.pfAtual;
        document.getElementById('pfAtualInput').value = this.pfAtual;
        pfTexto.textContent = `${this.pfAtual}/${this.pfMax}`;
        
        // Sistema de cores para PF
        let cor, estado;
        
        if (this.pfAtual <= 0) {
            cor = '#e74c3c'; // Vermelho - Exausto
            estado = 'Exausto';
        } else if (porcentagem <= 33) {
            cor = '#f39c12'; // Laranja - Fadigado
            estado = 'Fadigado';
        } else {
            cor = '#3498db'; // Azul - Normal
            estado = 'Normal';
        }
        
        // Aplicar cor
        barraFill.style.background = `linear-gradient(90deg, ${cor}, ${cor})`;
        barraFill.style.width = `${Math.max(0, porcentagem)}%`;
        pfEstado.textContent = estado;
        pfEstado.style.color = cor;
        pfEstado.style.background = `${cor}20`;
    }
    
    atualizarContadorCondicoes() {
        const contador = document.getElementById('condicoesAtivas');
        contador.textContent = this.condicoesAtivas.size;
    }
    
    calcularRDTotal() {
        let total = 0;
        document.querySelectorAll('.rd-input').forEach(input => {
            total += parseInt(input.value) || 0;
        });
        document.getElementById('rdTotal').textContent = total;
    }
    
    salvarEstado() {
        // Salva no localStorage para persistência
        const estado = {
            pvAtual: this.pvAtual,
            pvMax: this.pvMax,
            pvMod: this.pvMod,
            pfAtual: this.pfAtual,
            pfMax: this.pfMax,
            pfMod: this.pfMod,
            condicoes: Array.from(this.condicoesAtivas)
        };
        
        localStorage.setItem('combateEstado', JSON.stringify(estado));
    }
    
    carregarEstado() {
        const estado = localStorage.getItem('combateEstado');
        if (estado) {
            const dados = JSON.parse(estado);
            Object.assign(this, dados);
            this.condicoesAtivas = new Set(dados.condicoes || []);
            
            // Aplicar condições salvas
            document.querySelectorAll('.condicao-item').forEach(item => {
                if (this.condicoesAtivas.has(item.dataset.condicao)) {
                    item.classList.add('ativa');
                }
            });
        }
    }
    
    resetarPV() {
        this.pvAtual = this.pvMax;
        this.atualizarDisplayPV();
    }
    
    resetarPF() {
        this.pfAtual = this.pfMax;
        this.atualizarDisplayPF();
    }
}

// Inicializar o sistema quando a aba for carregada
function inicializarCombate() {
    const sistemaCombate = new SistemaPVPF();
    window.sistemaCombate = sistemaCombate; // Tornar acessível globalmente
    
    // Configurar eventos globais
    document.addEventListener('DOMContentLoaded', () => {
        sistemaCombate.carregarEstado();
        sistemaCombate.atualizarDisplayPV();
        sistemaCombate.atualizarDisplayPF();
        sistemaCombate.atualizarContadorCondicoes();
        sistemaCombate.calcularRDTotal();
    });
    
    // Atualizar quando atributos mudarem
    document.addEventListener('atributosAtualizados', () => {
        sistemaCombate.carregarDados();
        sistemaCombate.atualizarDisplayPV();
        sistemaCombate.atualizarDisplayPF();
    });
    
    return sistemaCombate;
}

// Funções globais para chamar do HTML
function alterarPV(valor) {
    window.sistemaCombate?.alterarPV(valor);
}

function alterarPF(valor) {
    window.sistemaCombate?.alterarPF(valor);
}

function modificarPV(tipo, valor) {
    window.sistemaCombate?.modificarPV(tipo, valor);
}

function modificarPF(tipo, valor) {
    window.sistemaCombate?.modificarPF(tipo, valor);
}

function resetarPV() {
    window.sistemaCombate?.resetarPV();
}

function resetarPF() {
    window.sistemaCombate?.resetarPF();
}

function calcularRDTotal() {
    window.sistemaCombate?.calcularRDTotal();
}

function atualizarPV() {
    window.sistemaCombate?.carregarDados();
}

function atualizarPF() {
    window.sistemaCombate?.carregarDados();
}

function atualizarPVManual() {
    const valor = parseInt(document.getElementById('pvAtualInput').value) || 0;
    if (window.sistemaCombate) {
        window.sistemaCombate.pvAtual = valor;
        window.sistemaCombate.atualizarDisplayPV();
    }
}

function atualizarPFManual() {
    const valor = parseInt(document.getElementById('pfAtualInput').value) || 0;
    if (window.sistemaCombate) {
        window.sistemaCombate.pfAtual = valor;
        window.sistemaCombate.atualizarDisplayPF();
    }
}

// Inicializar quando a aba de combate for aberta
if (document.getElementById('combate')) {
    setTimeout(() => inicializarCombate(), 100);
}
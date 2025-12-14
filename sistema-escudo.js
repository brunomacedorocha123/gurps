// sistema-escudo.js - SISTEMA DIRETO E FUNCIONAL

class SistemaEscudo {
    constructor() {
        this.escudoEquipado = null;
        this.PVMaximo = 0;
        this.PVAtual = 0;
        this.RD = 0;
        
        this.init();
    }

    init() {
        this.configurarBotoes();
        this.atualizarDadosEscudo();
        
        setInterval(() => {
            if (window.sistemaEquipamentos) {
                this.verificarEscudo();
            }
        }, 2000);
    }

    configurarBotoes() {
        const botoes = document.querySelectorAll('.btn-escudo');
        botoes.forEach(botao => {
            botao.addEventListener('click', (e) => {
                if (botao.classList.contains('dano-5')) {
                    this.aplicarDano(5);
                } else if (botao.classList.contains('dano-1')) {
                    this.aplicarDano(1);
                } else if (botao.classList.contains('cura-1')) {
                    this.aplicarCura(1);
                } else if (botao.classList.contains('cura-5')) {
                    this.aplicarCura(5);
                }
            });
        });
    }

    verificarEscudo() {
        if (!window.sistemaEquipamentos) return;
        
        try {
            const escudosEquipados = window.sistemaEquipamentos.equipamentosEquipados.escudos;
            
            if (escudosEquipados && escudosEquipados.length > 0) {
                const escudoAtual = escudosEquipados[0];
                
                if (!this.escudoEquipado || this.escudoEquipado.idUnico !== escudoAtual.idUnico) {
                    this.escudoEquipado = escudoAtual;
                    this.carregarDadosEscudo(escudoAtual);
                    this.atualizarCard();
                }
            } else {
                if (this.escudoEquipado) {
                    this.escudoEquipado = null;
                    this.atualizarCardVazio();
                }
            }
        } catch (error) {
            // Silencioso
        }
    }

    atualizarDadosEscudo() {
        this.verificarEscudo();
        setTimeout(() => this.verificarEscudo(), 1000);
    }

    carregarDadosEscudo(escudo) {
        if (escudo.rdpv && escudo.rdpv.includes('/')) {
            const partes = escudo.rdpv.split('/');
            this.RD = parseInt(partes[0].replace(/\D/g, '')) || 0;
            this.PVMaximo = parseInt(partes[1].replace(/\D/g, '')) || 0;
        } else if (escudo.rdpv) {
            this.RD = parseInt(escudo.rdpv.replace(/\D/g, '')) || 0;
            this.PVMaximo = 0;
        }
        
        const chave = `escudo_${escudo.idUnico}`;
        const salvo = localStorage.getItem(chave);
        this.PVAtual = salvo ? parseInt(salvo) : this.PVMaximo;
    }

    aplicarDano(dano) {
        if (!this.escudoEquipado || this.PVAtual <= 0) return;
        
        this.PVAtual = Math.max(0, this.PVAtual - dano);
        this.salvarPVAtual();
        this.atualizarCard();
    }

    aplicarCura(cura) {
        if (!this.escudoEquipado || this.PVMaximo === 0) return;
        
        const curaEfetiva = Math.min(cura, this.PVMaximo - this.PVAtual);
        if (curaEfetiva > 0) {
            this.PVAtual += curaEfetiva;
            this.salvarPVAtual();
            this.atualizarCard();
        }
    }

    salvarPVAtual() {
        if (this.escudoEquipado && this.escudoEquipado.idUnico) {
            localStorage.setItem(`escudo_${this.escudoEquipado.idUnico}`, this.PVAtual.toString());
        }
    }

    atualizarCard() {
        if (!this.escudoEquipado) {
            this.atualizarCardVazio();
            return;
        }

        const nomeElement = document.getElementById('escudoNome');
        if (nomeElement) nomeElement.textContent = this.escudoEquipado.nome;
        
        const drElement = document.getElementById('escudoDR');
        if (drElement) drElement.textContent = this.RD;
        
        const statusElement = document.getElementById('escudoStatus');
        if (statusElement) {
            if (this.PVMaximo > 0) {
                if (this.PVAtual > 0) {
                    statusElement.textContent = 'Ativo';
                    statusElement.className = 'status-badge ativo';
                } else {
                    statusElement.textContent = 'Quebrado';
                    statusElement.className = 'status-badge quebrado';
                }
            } else {
                statusElement.textContent = 'Ativo';
                statusElement.className = 'status-badge ativo';
            }
        }
        
        const pvTextoElement = document.getElementById('escudoPVTexto');
        const pvFillElement = document.getElementById('escudoPVFill');
        
        if (pvTextoElement && pvFillElement) {
            if (this.PVMaximo > 0) {
                const porcentagem = (this.PVAtual / this.PVMaximo) * 100;
                pvTextoElement.textContent = `${this.PVAtual}/${this.PVMaximo}`;
                pvFillElement.style.width = `${porcentagem}%`;
                
                if (porcentagem > 50) {
                    pvFillElement.style.background = '#2ecc71';
                } else if (porcentagem > 25) {
                    pvFillElement.style.background = '#f39c12';
                } else {
                    pvFillElement.style.background = '#e74c3c';
                }
            } else {
                pvTextoElement.textContent = `RD ${this.RD}`;
                pvFillElement.style.width = '100%';
                pvFillElement.style.background = '#3498db';
            }
        }
    }

    atualizarCardVazio() {
        const nomeElement = document.getElementById('escudoNome');
        const drElement = document.getElementById('escudoDR');
        const statusElement = document.getElementById('escudoStatus');
        const pvTextoElement = document.getElementById('escudoPVTexto');
        const pvFillElement = document.getElementById('escudoPVFill');

        if (nomeElement) nomeElement.textContent = 'Nenhum escudo equipado';
        if (drElement) drElement.textContent = '0';
        if (statusElement) {
            statusElement.textContent = 'Inativo';
            statusElement.className = 'status-badge inativo';
        }
        if (pvTextoElement) pvTextoElement.textContent = '0/0';
        if (pvFillElement) {
            pvFillElement.style.width = '0%';
            pvFillElement.style.background = '#95a5a6';
        }
    }
}

setTimeout(() => {
    const cardEscudo = document.querySelector('.card-escudo');
    if (cardEscudo) {
        window.sistemaEscudo = new SistemaEscudo();
    }
}, 1500);

function danoEscudo(dano) {
    if (window.sistemaEscudo) {
        window.sistemaEscudo.aplicarDano(dano);
    }
}

function curarEscudo(cura) {
    if (window.sistemaEscudo) {
        window.sistemaEscudo.aplicarCura(cura);
    }
}
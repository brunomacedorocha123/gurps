// sistema-escudo.js - SISTEMA SIMPLES PARA ESCUDO NO COMBATE

class SistemaEscudo {
    constructor() {
        this.escudoEquipado = null;
        this.PVMaximo = 0;
        this.PVAtual = 0;
        this.RD = 0;
        this.inicializado = false;
        
        this.init();
    }

    // Inicialização
    init() {
        if (this.inicializado) return;
        
        console.log('🛡️ Sistema de escudo inicializando...');
        
        // Espera o sistema de equipamentos carregar
        setTimeout(() => this.configurarEventos(), 100);
        
        this.inicializado = true;
    }

    // Configura eventos
    configurarEventos() {
        // Observa mudanças no sistema de equipamentos
        document.addEventListener('equipamentosAtualizados', () => {
            setTimeout(() => this.atualizarDadosEscudo(), 150);
        });
        
        // Configura botões do card
        this.configurarBotoes();
    }

    // Atualiza dados do escudo equipado
    atualizarDadosEscudo() {
        if (!window.sistemaEquipamentos) {
            console.warn('Sistema de equipamentos não carregado');
            return;
        }

        // Busca escudo equipado
        const escudoEquipado = window.sistemaEquipamentos.equipamentosEquipados.escudos[0];
        
        if (!escudoEquipado) {
            this.escudoEquipado = null;
            this.atualizarCardVazio();
            return;
        }

        // Atualiza dados
        this.escudoEquipado = escudoEquipado;
        this.extrairDadosEscudo(escudoEquipado);
        this.atualizarCard();
    }

    // Extrai RD e PV do formato "5/20" ou similar
    extrairDadosEscudo(escudo) {
        if (!escudo.rdpv) {
            this.RD = 0;
            this.PVMaximo = 0;
            this.PVAtual = 0;
            return;
        }

        const rdpv = escudo.rdpv.toString();
        
        // Formato "5/20"
        if (rdpv.includes('/')) {
            const partes = rdpv.split('/');
            if (partes.length >= 2) {
                // Remove texto não numérico
                const rdStr = partes[0].replace(/\D/g, '');
                const pvStr = partes[1].replace(/\D/g, '');
                
                this.RD = parseInt(rdStr) || 0;
                this.PVMaximo = parseInt(pvStr) || 0;
                this.PVAtual = this.PVMaximo; // Começa com PV máximo
            }
        } 
        // Formato com apenas RD
        else if (rdpv.toLowerCase().includes('rd')) {
            const rdMatch = rdpv.match(/\d+/);
            this.RD = rdMatch ? parseInt(rdMatch[0]) : 0;
            this.PVMaximo = 0;
            this.PVAtual = 0;
        }
        // Formato com apenas número
        else {
            const num = parseInt(rdpv);
            if (!isNaN(num)) {
                this.RD = num;
                this.PVMaximo = 0;
                this.PVAtual = 0;
            }
        }
    }

    // Configura botões do card
    configurarBotoes() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-escudo.dano-5')) {
                this.aplicarDano(5);
            } else if (e.target.closest('.btn-escudo.dano-1')) {
                this.aplicarDano(1);
            } else if (e.target.closest('.btn-escudo.cura-1')) {
                this.curar(1);
            } else if (e.target.closest('.btn-escudo.cura-5')) {
                this.curar(5);
            }
        });
    }

    // Aplica dano ao escudo
    aplicarDano(dano) {
        if (!this.escudoEquipado || this.PVAtual <= 0) return;
        
        // Calcula dano efetivo (dano - RD)
        const danoEfetivo = Math.max(0, dano - this.RD);
        
        if (danoEfetivo > 0) {
            this.PVAtual = Math.max(0, this.PVAtual - danoEfetivo);
            this.atualizarCard();
            
            // Efeito visual
            this.efeitoDano(danoEfetivo);
        }
    }

    // Cura o escudo
    curar(cura) {
        if (!this.escudoEquipado || this.PVMaximo === 0) return;
        
        const novaCura = Math.min(cura, this.PVMaximo - this.PVAtual);
        if (novaCura > 0) {
            this.PVAtual += novaCura;
            this.atualizarCard();
            
            // Efeito visual
            this.efeitoCura(novaCura);
        }
    }

    // Efeito visual de dano
    efeitoDano(dano) {
        const pvFill = document.getElementById('escudoPVFill');
        if (pvFill) {
            pvFill.classList.add('dano-efeito');
            setTimeout(() => pvFill.classList.remove('dano-efeito'), 300);
        }
    }

    // Efeito visual de cura
    efeitoCura(cura) {
        const pvFill = document.getElementById('escudoPVFill');
        if (pvFill) {
            pvFill.classList.add('cura-efeito');
            setTimeout(() => pvFill.classList.remove('cura-efeito'), 300);
        }
    }

    // Atualiza card com escudo equipado
    atualizarCard() {
        if (!this.escudoEquipado) {
            this.atualizarCardVazio();
            return;
        }

        // Atualiza elementos
        const nomeElement = document.getElementById('escudoNome');
        const drElement = document.getElementById('escudoDR');
        const statusElement = document.getElementById('escudoStatus');
        const pvTextoElement = document.getElementById('escudoPVTexto');
        const pvFillElement = document.getElementById('escudoPVFill');

        if (!nomeElement) return;

        // Nome do escudo
        nomeElement.textContent = this.escudoEquipado.nome;
        
        // RD
        drElement.textContent = this.RD;
        
        // Status
        const status = this.calcularStatus();
        statusElement.textContent = status.texto;
        statusElement.className = `status-badge ${status.classe}`;
        
        // PV
        if (this.PVMaximo > 0) {
            const porcentagem = (this.PVAtual / this.PVMaximo) * 100;
            pvTextoElement.textContent = `${this.PVAtual}/${this.PVMaximo}`;
            pvFillElement.style.width = `${porcentagem}%`;
            
            // Cor baseada na porcentagem
            if (porcentagem > 60) {
                pvFillElement.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
            } else if (porcentagem > 30) {
                pvFillElement.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
            } else {
                pvFillElement.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
            }
        } else {
            // Sem sistema de PV
            pvTextoElement.textContent = `RD ${this.RD}`;
            pvFillElement.style.width = '100%';
            pvFillElement.style.background = 'linear-gradient(90deg, #3498db, #2980b9)';
        }
    }

    // Calcula status do escudo
    calcularStatus() {
        if (!this.escudoEquipado) {
            return { texto: 'Inativo', classe: 'inativo' };
        }
        
        if (this.PVMaximo === 0) {
            return { texto: 'Ativo', classe: 'ativo' };
        }
        
        const porcentagem = (this.PVAtual / this.PVMaximo) * 100;
        
        if (porcentagem > 50) {
            return { texto: 'Ativo', classe: 'ativo' };
        } else if (porcentagem > 0) {
            return { texto: 'Danificado', classe: 'danificado' };
        } else {
            return { texto: 'Quebrado', classe: 'quebrado' };
        }
    }

    // Atualiza card sem escudo
    atualizarCardVazio() {
        const nomeElement = document.getElementById('escudoNome');
        const drElement = document.getElementById('escudoDR');
        const statusElement = document.getElementById('escudoStatus');
        const pvTextoElement = document.getElementById('escudoPVTexto');
        const pvFillElement = document.getElementById('escudoPVFill');

        if (!nomeElement) return;

        // Valores padrão
        nomeElement.textContent = 'Nenhum escudo equipado';
        drElement.textContent = '0';
        statusElement.textContent = 'Inativo';
        statusElement.className = 'status-badge inativo';
        pvTextoElement.textContent = '0/0';
        pvFillElement.style.width = '0%';
        pvFillElement.style.background = 'linear-gradient(90deg, #95a5a6, #7f8c8d)';
    }

    // Repara completamente
    repararCompletamente() {
        if (!this.escudoEquipado || this.PVMaximo === 0) return;
        
        this.PVAtual = this.PVMaximo;
        this.atualizarCard();
    }
}

// Inicializa automaticamente
document.addEventListener('DOMContentLoaded', function() {
    const cardEscudo = document.querySelector('.card-escudo');
    if (cardEscudo) {
        window.sistemaEscudo = new SistemaEscudo();
    }
});

// Funções globais para os botões
function danoEscudo(dano) {
    if (window.sistemaEscudo) {
        window.sistemaEscudo.aplicarDano(dano);
    }
}

function curarEscudo(cura) {
    if (window.sistemaEscudo) {
        window.sistemaEscudo.curar(cura);
    }
}
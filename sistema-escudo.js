// sistema-escudo.js - SISTEMA COMPLETO E FUNCIONAL

class SistemaEscudo {
    constructor() {
        this.escudoEquipado = null;
        this.PVMaximo = 0;
        this.PVAtual = 0;
        this.RD = 0;
        
        console.log('🛡️ SistemaEscudo criado');
        this.init();
    }

    init() {
        console.log('🛡️ Inicializando sistema de escudo...');
        
        this.configurarBotoes();
        this.configurarEventos();
        this.atualizarDadosEscudo();
    }

    configurarEventos() {
        document.addEventListener('equipamentosAtualizados', () => {
            this.atualizarDadosEscudo();
        });
    }

    configurarBotoes() {
        // Botão -5
        document.querySelector('.btn-escudo.dano-5').addEventListener('click', (e) => {
            e.preventDefault();
            this.aplicarDano(5);
        });
        
        // Botão -1
        document.querySelector('.btn-escudo.dano-1').addEventListener('click', (e) => {
            e.preventDefault();
            this.aplicarDano(1);
        });
        
        // Botão +1
        document.querySelector('.btn-escudo.cura-1').addEventListener('click', (e) => {
            e.preventDefault();
            this.aplicarCura(1);
        });
        
        // Botão +5
        document.querySelector('.btn-escudo.cura-5').addEventListener('click', (e) => {
            e.preventDefault();
            this.aplicarCura(5);
        });
    }

    atualizarDadosEscudo() {
        if (!window.sistemaEquipamentos) {
            console.log('Aguardando sistema de equipamentos...');
            setTimeout(() => this.atualizarDadosEscudo(), 1000);
            return;
        }
        
        try {
            let escudoEncontrado = null;
            
            if (window.sistemaEquipamentos.equipamentosEquipados &&
                window.sistemaEquipamentos.equipamentosEquipados.escudos) {
                const escudos = window.sistemaEquipamentos.equipamentosEquipados.escudos;
                
                if (escudos.length > 0) {
                    escudoEncontrado = escudos[0];
                }
            }
            
            if (!escudoEncontrado) {
                this.escudoEquipado = null;
                this.atualizarCardVazio();
                return;
            }
            
            this.escudoEquipado = escudoEncontrado;
            this.extrairDadosEscudo(escudoEncontrado);
            this.atualizarCard();
            
        } catch (error) {
            console.error('Erro ao atualizar escudo:', error);
            this.atualizarCardVazio();
        }
    }

    extrairDadosEscudo(escudo) {
        if (!escudo.rdpv) {
            this.RD = 0;
            this.PVMaximo = 0;
            this.PVAtual = 0;
            return;
        }
        
        const rdpv = escudo.rdpv.toString().trim();
        
        // Formato "5/20"
        if (rdpv.includes('/')) {
            const partes = rdpv.split('/');
            if (partes.length >= 2) {
                const rdStr = partes[0].replace(/\D/g, '');
                const pvStr = partes[1].replace(/\D/g, '');
                
                this.RD = parseInt(rdStr) || 0;
                this.PVMaximo = parseInt(pvStr) || 0;
                
                // Tenta carregar PV salvo, senão começa com máximo
                const chave = `escudo_${escudo.idUnico || escudo.id}`;
                const salvo = localStorage.getItem(chave);
                
                if (salvo !== null) {
                    this.PVAtual = parseInt(salvo) || 0;
                } else {
                    this.PVAtual = this.PVMaximo;
                }
            }
        }
        // Formato só RD
        else if (rdpv.toLowerCase().includes('rd')) {
            const rdMatch = rdpv.match(/\d+/);
            this.RD = rdMatch ? parseInt(rdMatch[0]) : 0;
            this.PVMaximo = 0;
            this.PVAtual = 0;
        }
        // Só número
        else {
            const num = parseInt(rdpv);
            if (!isNaN(num)) {
                this.RD = num;
                this.PVMaximo = 0;
                this.PVAtual = 0;
            }
        }
    }

    aplicarDano(dano) {
        if (!this.escudoEquipado) {
            return;
        }
        
        if (this.PVMaximo === 0) {
            return;
        }
        
        // Aplica dano direto
        this.PVAtual = Math.max(0, this.PVAtual - dano);
        
        // Salva no localStorage
        if (this.escudoEquipado.idUnico || this.escudoEquipado.id) {
            const chave = `escudo_${this.escudoEquipado.idUnico || this.escudoEquipado.id}`;
            localStorage.setItem(chave, this.PVAtual.toString());
        }
        
        this.atualizarCard();
    }

    aplicarCura(cura) {
        if (!this.escudoEquipado) {
            return;
        }
        
        if (this.PVMaximo === 0) {
            return;
        }
        
        // Aplica cura
        const curaEfetiva = Math.min(cura, this.PVMaximo - this.PVAtual);
        
        if (curaEfetiva > 0) {
            this.PVAtual += curaEfetiva;
            
            // Salva
            if (this.escudoEquipado.idUnico || this.escudoEquipado.id) {
                const chave = `escudo_${this.escudoEquipado.idUnico || this.escudoEquipado.id}`;
                localStorage.setItem(chave, this.PVAtual.toString());
            }
            
            this.atualizarCard();
        }
    }

    atualizarCard() {
        const nomeElement = document.getElementById('escudoNome');
        const drElement = document.getElementById('escudoDR');
        const statusElement = document.getElementById('escudoStatus');
        const pvTextoElement = document.getElementById('escudoPVTexto');
        const pvFillElement = document.getElementById('escudoPVFill');

        if (!nomeElement) return;

        if (!this.escudoEquipado) {
            this.atualizarCardVazio();
            return;
        }

        try {
            // Nome
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
                pvTextoElement.textContent = `RD ${this.RD}`;
                pvFillElement.style.width = '100%';
                pvFillElement.style.background = 'linear-gradient(90deg, #3498db, #2980b9)';
            }
            
        } catch (error) {
            console.error('Erro ao atualizar card:', error);
            this.atualizarCardVazio();
        }
    }

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

    atualizarCardVazio() {
        const nomeElement = document.getElementById('escudoNome');
        const drElement = document.getElementById('escudoDR');
        const statusElement = document.getElementById('escudoStatus');
        const pvTextoElement = document.getElementById('escudoPVTexto');
        const pvFillElement = document.getElementById('escudoPVFill');

        if (!nomeElement) return;

        nomeElement.textContent = 'Nenhum escudo equipado';
        drElement.textContent = '0';
        statusElement.textContent = 'Inativo';
        statusElement.className = 'status-badge inativo';
        pvTextoElement.textContent = '0/0';
        pvFillElement.style.width = '0%';
        pvFillElement.style.background = 'linear-gradient(90deg, #95a5a6, #7f8c8d)';
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const cardEscudo = document.querySelector('.card-escudo');
        if (cardEscudo) {
            window.sistemaEscudo = new SistemaEscudo();
        }
    }, 1000);
});

// Funções globais para compatibilidade
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
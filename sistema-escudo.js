// sistema-escudo.js - SISTEMA SIMPLES QUE FUNCIONA

class SistemaEscudo {
    constructor() {
        this.escudoEquipado = null;
        this.PVMaximo = 0;
        this.PVAtual = 0;
        this.RD = 0; // Só para informação
        
        console.log('🛡️ SistemaEscudo criado');
        this.init();
    }

    init() {
        console.log('🛡️ Inicializando...');
        
        // Configura botões
        this.configurarBotoes();
        
        // Escuta eventos
        document.addEventListener('equipamentosAtualizados', () => {
            console.log('📢 Evento recebido - atualizando escudo');
            this.atualizarDadosEscudo();
        });
        
        // Atualiza inicialmente
        setTimeout(() => this.atualizarDadosEscudo(), 500);
    }

    configurarBotoes() {
        console.log('🔘 Configurando botões...');
        
        // Botão -5
        document.querySelector('.btn-escudo.dano-5').addEventListener('click', (e) => {
            e.preventDefault();
            console.log('💥 Botão -5 clicado');
            this.aplicarDano(5);
        });
        
        // Botão -1
        document.querySelector('.btn-escudo.dano-1').addEventListener('click', (e) => {
            e.preventDefault();
            console.log('💥 Botão -1 clicado');
            this.aplicarDano(1);
        });
        
        // Botão +1
        document.querySelector('.btn-escudo.cura-1').addEventListener('click', (e) => {
            e.preventDefault();
            console.log('💚 Botão +1 clicado');
            this.aplicarCura(1);
        });
        
        // Botão +5
        document.querySelector('.btn-escudo.cura-5').addEventListener('click', (e) => {
            e.preventDefault();
            console.log('💚 Botão +5 clicado');
            this.aplicarCura(5);
        });
    }

    atualizarDadosEscudo() {
        console.log('📊 Buscando escudo...');
        
        if (!window.sistemaEquipamentos) {
            console.log('⏳ Aguardando sistema de equipamentos...');
            return;
        }
        
        try {
            // Busca escudo equipado
            let escudo = null;
            
            if (window.sistemaEquipamentos.equipamentosEquipados &&
                window.sistemaEquipamentos.equipamentosEquipados.escudos) {
                const escudos = window.sistemaEquipamentos.equipamentosEquipados.escudos;
                
                if (escudos.length > 0) {
                    escudo = escudos[0];
                    console.log('✅ Escudo encontrado:', escudo.nome);
                }
            }
            
            if (!escudo) {
                console.log('❌ Nenhum escudo equipado');
                this.escudoEquipado = null;
                this.atualizarCardVazio();
                return;
            }
            
            // Atualiza dados
            this.escudoEquipado = escudo;
            this.extrairDadosEscudo(escudo);
            this.atualizarCard();
            
        } catch (error) {
            console.error('❌ Erro:', error);
            this.atualizarCardVazio();
        }
    }

    extrairDadosEscudo(escudo) {
        console.log('🔧 Extraindo dados:', escudo.rdpv);
        
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
                
                if (salvo) {
                    this.PVAtual = parseInt(salvo) || this.PVMaximo;
                } else {
                    this.PVAtual = this.PVMaximo;
                }
                
                console.log(`📊 RD: ${this.RD}, PV: ${this.PVAtual}/${this.PVMaximo}`);
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
        console.log(`💥 Aplicando ${dano} de dano NO ESCUDO`);
        
        if (!this.escudoEquipado) {
            alert('Nenhum escudo equipado!');
            return;
        }
        
        if (this.PVMaximo === 0) {
            alert('Este escudo não tem PV!');
            return;
        }
        
        // DANO DIRETO - SEM VERIFICAR RD
        this.PVAtual = Math.max(0, this.PVAtual - dano);
        
        console.log(`💔 Novo PV: ${this.PVAtual}/${this.PVMaximo}`);
        
        // Salva no localStorage
        if (this.escudoEquipado.idUnico || this.escudoEquipado.id) {
            const chave = `escudo_${this.escudoEquipado.idUnico || this.escudoEquipado.id}`;
            localStorage.setItem(chave, this.PVAtual.toString());
        }
        
        // Atualiza visual
        this.atualizarCard();
        
        // Efeito visual
        this.efeitoDano();
    }

    aplicarCura(cura) {
        console.log(`💚 Aplicando ${cura} de cura NO ESCUDO`);
        
        if (!this.escudoEquipado) {
            alert('Nenhum escudo equipado!');
            return;
        }
        
        if (this.PVMaximo === 0) {
            alert('Este escudo não tem PV!');
            return;
        }
        
        // CURA DIRETA
        const curaEfetiva = Math.min(cura, this.PVMaximo - this.PVAtual);
        
        if (curaEfetiva > 0) {
            this.PVAtual += curaEfetiva;
            
            console.log(`💚 Novo PV: ${this.PVAtual}/${this.PVMaximo}`);
            
            // Salva
            if (this.escudoEquipado.idUnico || this.escudoEquipado.id) {
                const chave = `escudo_${this.escudoEquipado.idUnico || this.escudoEquipado.id}`;
                localStorage.setItem(chave, this.PVAtual.toString());
            }
            
            this.atualizarCard();
            this.efeitoCura();
        }
    }

    efeitoDano() {
        const pvFill = document.getElementById('escudoPVFill');
        if (pvFill) {
            pvFill.style.transform = 'scaleX(1.05)';
            pvFill.style.transition = 'transform 0.1s';
            
            setTimeout(() => {
                pvFill.style.transform = 'scaleX(1)';
            }, 100);
        }
    }

    efeitoCura() {
        const pvFill = document.getElementById('escudoPVFill');
        if (pvFill) {
            pvFill.style.filter = 'brightness(1.3)';
            pvFill.style.transition = 'filter 0.3s';
            
            setTimeout(() => {
                pvFill.style.filter = 'brightness(1)';
            }, 300);
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
            
            // RD (só para informação)
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
                
                // Cor
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
            console.error('❌ Erro ao atualizar card:', error);
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

// Inicializa quando o DOM carrega
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado - procurando card de escudo');
    
    setTimeout(() => {
        const cardEscudo = document.querySelector('.card-escudo');
        if (cardEscudo) {
            console.log('✅ Card encontrado - criando sistema');
            window.sistemaEscudo = new SistemaEscudo();
        }
    }, 1000);
});

// Mantém as funções globais para compatibilidade
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
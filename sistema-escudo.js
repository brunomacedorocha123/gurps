// sistema-escudo.js - SISTEMA SIMPLIFICADO

class SistemaEscudo {
    constructor() {
        this.escudoEquipado = null;
        this.PVMaximo = 0;
        this.PVAtual = 0;
        this.RD = 0;
        
        console.log('🔧 SistemaEscudo criado');
        this.init();
    }

    init() {
        console.log('🛡️ Sistema de escudo inicializando...');
        
        // Configura eventos de equipamentos
        this.configurarEventosEquipamentos();
        
        // Configura botões IMEDIATAMENTE
        this.configurarBotoesDiretamente();
        
        // Atualiza dados inicialmente
        setTimeout(() => this.atualizarDadosEscudo(), 500);
    }

    configurarEventosEquipamentos() {
        // Escuta eventos do sistema de equipamentos
        document.addEventListener('equipamentosAtualizados', () => {
            console.log('📢 Evento equipamentosAtualizados recebido');
            setTimeout(() => this.atualizarDadosEscudo(), 200);
        });
    }

    configurarBotoesDiretamente() {
        console.log('🔘 Configurando botões diretamente...');
        
        // Função para configurar botões quando disponíveis
        const configurarBotoes = () => {
            const botoes = document.querySelectorAll('.btn-escudo');
            console.log(`🔘 Encontrados ${botoes.length} botões`);
            
            botoes.forEach(botao => {
                // Remove event listeners antigos
                const novoBotao = botao.cloneNode(true);
                botao.parentNode.replaceChild(novoBotao, botao);
                
                // Adiciona novo event listener
                novoBotao.addEventListener('click', (e) => {
                    console.log('✅ Botão clicado!', novoBotao.className);
                    e.stopPropagation();
                    
                    if (novoBotao.classList.contains('dano-5')) {
                        this.aplicarDano(5);
                    } else if (novoBotao.classList.contains('dano-1')) {
                        this.aplicarDano(1);
                    } else if (novoBotao.classList.contains('cura-1')) {
                        this.curar(1);
                    } else if (novoBotao.classList.contains('cura-5')) {
                        this.curar(5);
                    }
                });
                
                console.log(`✅ Botão ${novoBotao.className} configurado`);
            });
        };
        
        // Tenta configurar imediatamente
        setTimeout(configurarBotoes, 100);
        
        // Tenta novamente após 1 segundo (para caso o card seja carregado depois)
        setTimeout(configurarBotoes, 1000);
        
        // Tenta quando a aba de combate é ativada
        const abaCombate = document.getElementById('combate');
        if (abaCombate) {
            const observer = new MutationObserver(() => {
                if (abaCombate.classList.contains('active')) {
                    console.log('🎯 Aba combate ativada - configurando botões');
                    setTimeout(configurarBotoes, 100);
                }
            });
            observer.observe(abaCombate, { attributes: true, attributeFilter: ['class'] });
        }
    }

    atualizarDadosEscudo() {
        console.log('📊 Atualizando dados do escudo...');
        
        if (!window.sistemaEquipamentos) {
            console.warn('⚠️ sistemaEquipamentos não disponível');
            this.atualizarCardVazio();
            return;
        }

        try {
            // Busca escudo equipado
            let escudoEncontrado = null;
            
            if (window.sistemaEquipamentos.equipamentosEquipados && 
                window.sistemaEquipamentos.equipamentosEquipados.escudos) {
                const escudosEquipados = window.sistemaEquipamentos.equipamentosEquipados.escudos;
                
                if (escudosEquipados.length > 0) {
                    escudoEncontrado = escudosEquipados[0];
                    console.log('🎯 Escudo encontrado:', escudoEncontrado.nome);
                }
            }
            
            if (!escudoEncontrado) {
                this.escudoEquipado = null;
                this.atualizarCardVazio();
                return;
            }

            // Atualiza dados
            this.escudoEquipado = escudoEncontrado;
            this.extrairDadosEscudo(escudoEncontrado);
            this.atualizarCard();
            
        } catch (error) {
            console.error('❌ Erro ao atualizar escudo:', error);
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

        const rdpv = escudo.rdpv.toString();
        
        if (rdpv.includes('/')) {
            const partes = rdpv.split('/');
            if (partes.length >= 2) {
                const rdStr = partes[0].replace(/\D/g, '');
                const pvStr = partes[1].replace(/\D/g, '');
                
                this.RD = parseInt(rdStr) || 0;
                this.PVMaximo = parseInt(pvStr) || 0;
                this.PVAtual = this.PVMaximo;
            }
        } else if (rdpv.toLowerCase().includes('rd')) {
            const rdMatch = rdpv.match(/\d+/);
            this.RD = rdMatch ? parseInt(rdMatch[0]) : 0;
            this.PVMaximo = 0;
            this.PVAtual = 0;
        } else {
            const num = parseInt(rdpv);
            if (!isNaN(num)) {
                this.RD = num;
                this.PVMaximo = 0;
                this.PVAtual = 0;
            }
        }
    }

    aplicarDano(dano) {
        console.log(`💥 Aplicando ${dano} de dano`);
        
        if (!this.escudoEquipado || this.PVAtual <= 0) {
            console.log('⚠️ Escudo não está ativo');
            return;
        }
        
        const danoEfetivo = Math.max(0, dano - this.RD);
        
        if (danoEfetivo > 0) {
            this.PVAtual = Math.max(0, this.PVAtual - danoEfetivo);
            this.atualizarCard();
            this.efeitoDano();
        }
    }

    curar(cura) {
        console.log(`💚 Curando ${cura} PV`);
        
        if (!this.escudoEquipado || this.PVMaximo === 0) {
            console.log('⚠️ Escudo não tem sistema de PV');
            return;
        }
        
        const novaCura = Math.min(cura, this.PVMaximo - this.PVAtual);
        if (novaCura > 0) {
            this.PVAtual += novaCura;
            this.atualizarCard();
            this.efeitoCura();
        }
    }

    efeitoDano() {
        const pvFill = document.getElementById('escudoPVFill');
        if (pvFill) {
            pvFill.classList.add('dano-efeito');
            setTimeout(() => pvFill.classList.remove('dano-efeito'), 300);
        }
    }

    efeitoCura() {
        const pvFill = document.getElementById('escudoPVFill');
        if (pvFill) {
            pvFill.classList.add('cura-efeito');
            setTimeout(() => pvFill.classList.remove('cura-efeito'), 500);
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
            nomeElement.textContent = this.escudoEquipado.nome || 'Escudo';
            drElement.textContent = this.RD;
            
            const status = this.calcularStatus();
            statusElement.textContent = status.texto;
            statusElement.className = `status-badge ${status.classe}`;
            
            if (this.PVMaximo > 0) {
                const porcentagem = (this.PVAtual / this.PVMaximo) * 100;
                pvTextoElement.textContent = `${this.PVAtual}/${this.PVMaximo}`;
                pvFillElement.style.width = `${porcentagem}%`;
                
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

// Inicialização SIMPLES
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado');
    
    // Verifica se o card existe
    setTimeout(() => {
        const cardEscudo = document.querySelector('.card-escudo');
        if (cardEscudo) {
            console.log('✅ Card de escudo encontrado');
            window.sistemaEscudo = new SistemaEscudo();
        } else {
            console.log('❌ Card de escudo não encontrado');
        }
    }, 1000);
});
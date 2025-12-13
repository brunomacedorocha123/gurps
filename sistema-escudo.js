// sistema-escudo.js - SISTEMA COMPLETO E FUNCIONAL

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
        console.log('🛡️ Inicializando sistema de escudo...');
        
        // Configura tudo
        this.configurarEventosEquipamentos();
        this.configurarBotoes();
        this.forcarAtualizacao();
    }

    configurarEventosEquipamentos() {
        // Evento principal do sistema de equipamentos
        document.addEventListener('equipamentosAtualizados', () => {
            console.log('📢 Evento equipamentosAtualizados - atualizando escudo');
            setTimeout(() => this.atualizarDadosEscudo(), 100);
        });
        
        // Também tenta ouvir eventos do equipamento.js
        document.addEventListener('itemEquipado', () => {
            console.log('📢 Evento itemEquipado - atualizando escudo');
            setTimeout(() => this.atualizarDadosEscudo(), 200);
        });
        
        // Observa quando a aba de combate é ativada
        const abaCombate = document.getElementById('combate');
        if (abaCombate) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'class' && 
                        abaCombate.classList.contains('active')) {
                        console.log('🎯 Aba combate ativada - forçando atualização');
                        setTimeout(() => this.atualizarDadosEscudo(), 300);
                    }
                });
            });
            observer.observe(abaCombate, { attributes: true });
        }
    }

    configurarBotoes() {
        console.log('🔘 Configurando botões do escudo');
        
        // Usa delegação de eventos no documento inteiro
        document.addEventListener('click', (e) => {
            const botao = e.target.closest('.btn-escudo');
            if (!botao) return;
            
            console.log('🎯 Botão clicado:', botao.className);
            
            // Adiciona feedback visual
            botao.style.transform = 'scale(0.95)';
            setTimeout(() => botao.style.transform = '', 150);
            
            if (botao.classList.contains('dano-5')) {
                this.aplicarDano(5);
            } else if (botao.classList.contains('dano-1')) {
                this.aplicarDano(1);
            } else if (botao.classList.contains('cura-1')) {
                this.curar(1);
            } else if (botao.classList.contains('cura-5')) {
                this.curar(5);
            }
        });
        
        // Também tenta configurar diretamente os botões
        setTimeout(() => {
            const botoes = document.querySelectorAll('.btn-escudo');
            console.log(`🔍 Encontrados ${botoes.length} botões diretos`);
        }, 1000);
    }

    forcarAtualizacao() {
        // Força atualizações em intervalos
        setTimeout(() => this.atualizarDadosEscudo(), 500);
        setTimeout(() => this.atualizarDadosEscudo(), 1500);
        setTimeout(() => this.atualizarDadosEscudo(), 3000);
        
        // Configura verificação periódica
        setInterval(() => {
            if (!this.escudoEquipado) {
                this.atualizarDadosEscudo();
            }
        }, 5000);
    }

    atualizarDadosEscudo() {
        console.log('📊 Buscando dados do escudo...');
        
        // Verifica se o sistema de equipamentos existe
        if (!window.sistemaEquipamentos) {
            console.warn('⚠️ Sistema de equipamentos não carregado');
            console.log('📦 Tentando acessar diretamente:', window);
            
            // Tenta verificar novamente em 1 segundo
            setTimeout(() => this.atualizarDadosEscudo(), 1000);
            return;
        }
        
        console.log('✅ Sistema de equipamentos encontrado:', window.sistemaEquipamentos);
        
        try {
            // Verifica se temos a estrutura correta
            if (!window.sistemaEquipamentos.equipamentosEquipados) {
                console.warn('⚠️ equipamentosEquipados não existe');
                this.atualizarCardVazio();
                return;
            }
            
            const escudosEquipados = window.sistemaEquipamentos.equipamentosEquipados.escudos;
            console.log('📦 Escudos equipados:', escudosEquipados);
            
            if (!escudosEquipados || escudosEquipados.length === 0) {
                console.log('❌ Nenhum escudo equipado');
                this.escudoEquipado = null;
                this.atualizarCardVazio();
                return;
            }
            
            const escudoEncontrado = escudosEquipados[0];
            console.log('🎯 Escudo encontrado:', escudoEncontrado);
            
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
        console.log('🔧 Extraindo dados do escudo:', escudo.rdpv);
        
        if (!escudo.rdpv) {
            console.log('⚠️ Escudo sem RD/PV definido');
            this.RD = 0;
            this.PVMaximo = 0;
            this.PVAtual = 0;
            return;
        }

        const rdpv = escudo.rdpv.toString().trim();
        console.log('📝 RD/PV string:', rdpv);
        
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
                
                console.log(`📊 Extraído: RD=${this.RD}, PV=${this.PVAtual}/${this.PVMaximo}`);
            }
        } 
        // Formato com apenas RD
        else if (rdpv.toLowerCase().includes('rd')) {
            const rdMatch = rdpv.match(/\d+/);
            this.RD = rdMatch ? parseInt(rdMatch[0]) : 0;
            this.PVMaximo = 0;
            this.PVAtual = 0;
            console.log(`📊 Extraído (apenas RD): RD=${this.RD}`);
        }
        // Formato com apenas número
        else {
            const num = parseInt(rdpv);
            if (!isNaN(num)) {
                this.RD = num;
                this.PVMaximo = 0;
                this.PVAtual = 0;
                console.log(`📊 Extraído (apenas número): RD=${this.RD}`);
            }
        }
    }

    aplicarDano(dano) {
        console.log(`💥 Tentando aplicar ${dano} de dano`);
        
        if (!this.escudoEquipado) {
            console.log('⚠️ Nenhum escudo equipado para receber dano');
            this.mostrarMensagem('Nenhum escudo equipado!', 'erro');
            return;
        }
        
        if (this.PVMaximo === 0) {
            console.log('ℹ️ Escudo não tem sistema de PV (apenas RD)');
            this.mostrarMensagem('Este escudo não tem PV para danificar', 'info');
            return;
        }
        
        if (this.PVAtual <= 0) {
            console.log('💀 Escudo já está quebrado');
            this.mostrarMensagem('Escudo já está quebrado!', 'aviso');
            return;
        }
        
        // Calcula dano efetivo (dano - RD)
        const danoEfetivo = Math.max(0, dano - this.RD);
        console.log(`🛡️ Dano: ${dano}, RD: ${this.RD}, Dano efetivo: ${danoEfetivo}`);
        
        if (danoEfetivo > 0) {
            this.PVAtual = Math.max(0, this.PVAtual - danoEfetivo);
            console.log(`💔 Novo PV: ${this.PVAtual}/${this.PVMaximo}`);
            
            this.atualizarCard();
            this.efeitoDano();
            
            // Mensagem de feedback
            if (this.PVAtual === 0) {
                this.mostrarMensagem('Escudo quebrado!', 'erro');
            } else {
                this.mostrarMensagem(`Escudo sofreu ${danoEfetivo} de dano`, 'aviso');
            }
        } else {
            console.log('✅ Dano completamente bloqueado!');
            this.mostrarMensagem(`Escudo bloqueou todo o dano! (RD: ${this.RD})`, 'sucesso');
        }
    }

    curar(cura) {
        console.log(`💚 Tentando curar ${cura} PV`);
        
        if (!this.escudoEquipado) {
            console.log('⚠️ Nenhum escudo equipado para curar');
            this.mostrarMensagem('Nenhum escudo equipado!', 'erro');
            return;
        }
        
        if (this.PVMaximo === 0) {
            console.log('ℹ️ Escudo não tem sistema de PV');
            this.mostrarMensagem('Este escudo não tem PV para curar', 'info');
            return;
        }
        
        if (this.PVAtual >= this.PVMaximo) {
            console.log('✅ Escudo já está com PV máximo');
            this.mostrarMensagem('Escudo já está com PV máximo!', 'info');
            return;
        }
        
        const novaCura = Math.min(cura, this.PVMaximo - this.PVAtual);
        if (novaCura > 0) {
            this.PVAtual += novaCura;
            console.log(`💚 Novo PV: ${this.PVAtual}/${this.PVMaximo}`);
            
            this.atualizarCard();
            this.efeitoCura();
            
            this.mostrarMensagem(`Escudo reparado em ${novaCura} PV`, 'sucesso');
        }
    }

    efeitoDano() {
        const card = document.querySelector('.card-escudo');
        const pvFill = document.getElementById('escudoPVFill');
        
        if (card) {
            card.classList.add('dano-efeito');
            setTimeout(() => card.classList.remove('dano-efeito'), 300);
        }
        
        if (pvFill) {
            pvFill.classList.add('dano-efeito');
            setTimeout(() => pvFill.classList.remove('dano-efeito'), 300);
        }
    }

    efeitoCura() {
        const card = document.querySelector('.card-escudo');
        const pvFill = document.getElementById('escudoPVFill');
        
        if (card) {
            card.classList.add('cura-efeito');
            setTimeout(() => card.classList.remove('cura-efeito'), 500);
        }
        
        if (pvFill) {
            pvFill.classList.add('cura-efeito');
            setTimeout(() => pvFill.classList.remove('cura-efeito'), 500);
        }
    }

    mostrarMensagem(texto, tipo) {
        // Cria uma mensagem flutuante
        const mensagem = document.createElement('div');
        mensagem.className = `mensagem-escudo mensagem-${tipo}`;
        mensagem.textContent = texto;
        mensagem.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 15px 25px;
            background: ${tipo === 'erro' ? '#e74c3c' : 
                        tipo === 'sucesso' ? '#27ae60' : 
                        tipo === 'aviso' ? '#f39c12' : '#3498db'};
            color: white;
            border-radius: 8px;
            font-weight: bold;
            z-index: 10000;
            animation: fadeInOut 2s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(mensagem);
        
        setTimeout(() => {
            mensagem.style.opacity = '0';
            mensagem.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                if (mensagem.parentNode) {
                    mensagem.parentNode.removeChild(mensagem);
                }
            }, 500);
        }, 1500);
    }

    atualizarCard() {
        console.log('🎨 Atualizando card do escudo');
        
        const elementos = {
            nome: document.getElementById('escudoNome'),
            dr: document.getElementById('escudoDR'),
            status: document.getElementById('escudoStatus'),
            pvTexto: document.getElementById('escudoPVTexto'),
            pvFill: document.getElementById('escudoPVFill')
        };

        // Verifica se todos os elementos existem
        if (!elementos.nome) {
            console.error('❌ Elementos do card não encontrados!');
            return;
        }

        if (!this.escudoEquipado) {
            this.atualizarCardVazio();
            return;
        }

        try {
            // Nome do escudo
            elementos.nome.textContent = this.escudoEquipado.nome || 'Escudo';
            console.log(`🏷️ Nome: ${elementos.nome.textContent}`);
            
            // RD
            elementos.dr.textContent = this.RD;
            console.log(`🛡️ RD: ${this.RD}`);
            
            // Status
            const status = this.calcularStatus();
            elementos.status.textContent = status.texto;
            elementos.status.className = `status-badge ${status.classe}`;
            console.log(`🔧 Status: ${status.texto} (${status.classe})`);
            
            // PV
            if (this.PVMaximo > 0) {
                const porcentagem = (this.PVAtual / this.PVMaximo) * 100;
                elementos.pvTexto.textContent = `${this.PVAtual}/${this.PVMaximo}`;
                elementos.pvFill.style.width = `${porcentagem}%`;
                
                // Cor baseada na porcentagem
                if (porcentagem > 60) {
                    elementos.pvFill.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
                } else if (porcentagem > 30) {
                    elementos.pvFill.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
                } else {
                    elementos.pvFill.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
                }
                console.log(`❤️ PV: ${elementos.pvTexto.textContent} (${porcentagem.toFixed(1)}%)`);
            } else {
                // Sem sistema de PV
                elementos.pvTexto.textContent = `RD ${this.RD}`;
                elementos.pvFill.style.width = '100%';
                elementos.pvFill.style.background = 'linear-gradient(90deg, #3498db, #2980b9)';
                console.log(`🛡️ Apenas RD: ${this.RD}`);
            }
            
        } catch (error) {
            console.error('❌ Erro ao atualizar card:', error);
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
        console.log('⬜ Atualizando card vazio');
        
        const elementos = {
            nome: document.getElementById('escudoNome'),
            dr: document.getElementById('escudoDR'),
            status: document.getElementById('escudoStatus'),
            pvTexto: document.getElementById('escudoPVTexto'),
            pvFill: document.getElementById('escudoPVFill')
        };

        if (!elementos.nome) {
            console.error('❌ Elementos do card não encontrados!');
            return;
        }

        try {
            elementos.nome.textContent = 'Nenhum escudo equipado';
            elementos.dr.textContent = '0';
            elementos.status.textContent = 'Inativo';
            elementos.status.className = 'status-badge inativo';
            elementos.pvTexto.textContent = '0/0';
            elementos.pvFill.style.width = '0%';
            elementos.pvFill.style.background = 'linear-gradient(90deg, #95a5a6, #7f8c8d)';
            
        } catch (error) {
            console.error('❌ Erro ao atualizar card vazio:', error);
        }
    }
}

// Inicialização robusta
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado - iniciando sistema de escudo');
    
    // Espera um pouco para garantir que tudo esteja carregado
    setTimeout(() => {
        const cardEscudo = document.querySelector('.card-escudo');
        if (cardEscudo) {
            console.log('✅ Card de escudo encontrado - inicializando sistema');
            window.sistemaEscudo = new SistemaEscudo();
            
            // Força uma verificação extra
            setTimeout(() => {
                if (window.sistemaEscudo) {
                    window.sistemaEscudo.atualizarDadosEscudo();
                }
            }, 2000);
        } else {
            console.log('❌ Card de escudo não encontrado no DOM');
            console.log('🔍 Tentando encontrar mais tarde...');
            
            // Tenta novamente depois
            setTimeout(() => {
                const cardLate = document.querySelector('.card-escudo');
                if (cardLate) {
                    console.log('✅ Card encontrado tardiamente');
                    window.sistemaEscudo = new SistemaEscudo();
                }
            }, 3000);
        }
    }, 1000);
});

// Adiciona CSS para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -40%); }
        15% { opacity: 1; transform: translate(-50%, -50%); }
        85% { opacity: 1; transform: translate(-50%, -50%); }
        100% { opacity: 0; transform: translate(-50%, -60%); }
    }
    
    .dano-efeito {
        animation: shake 0.3s ease;
    }
    
    .cura-efeito {
        animation: pulseGreen 0.5s ease;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes pulseGreen {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.3); }
    }
    
    .status-badge.ativo {
        background: rgba(46, 204, 113, 0.2);
        color: #2ecc71;
        border: 1px solid rgba(46, 204, 113, 0.3);
    }
    
    .status-badge.danificado {
        background: rgba(243, 156, 18, 0.2);
        color: #f39c12;
        border: 1px solid rgba(243, 156, 18, 0.3);
    }
    
    .status-badge.quebrado {
        background: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
        border: 1px solid rgba(231, 76, 60, 0.3);
    }
    
    .status-badge.inativo {
        background: rgba(149, 165, 166, 0.2);
        color: #95a5a6;
        border: 1px solid rgba(149, 165, 166, 0.3);
    }
`;
document.head.appendChild(style);
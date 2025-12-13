// sistema-escudo.js - SISTEMA COMPLETO E SIMPLIFICADO

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
        
        // Configura botões
        this.configurarBotoes();
        
        // Observa mudanças no sistema de equipamentos
        document.addEventListener('equipamentosAtualizados', () => {
            setTimeout(() => this.atualizarDadosEscudo(), 200);
        });
        
        // Atualização periódica (a cada 2 segundos)
        setInterval(() => this.atualizarDadosEscudo(), 2000);
        
        // Atualização inicial
        setTimeout(() => this.atualizarDadosEscudo(), 1000);
    }

    configurarBotoes() {
        console.log('🔘 Configurando botões...');
        
        // Configura botões de dano
        const botoesDano = document.querySelectorAll('.btn-escudo.dano');
        botoesDano.forEach(botao => {
            botao.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const dano = parseInt(botao.getAttribute('data-dano'));
                console.log(`💥 Aplicando ${dano} PV de dano ao escudo`);
                this.aplicarDanoDireto(dano);
            });
        });
        
        // Configura botões de cura
        const botoesCura = document.querySelectorAll('.btn-escudo.cura');
        botoesCura.forEach(botao => {
            botao.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const cura = parseInt(botao.getAttribute('data-cura'));
                console.log(`💚 Aplicando ${cura} PV de cura ao escudo`);
                this.curarDireto(cura);
            });
        });
        
        console.log(`✅ Configurados ${botoesDano.length} botões de dano e ${botoesCura.length} de cura`);
    }

    atualizarDadosEscudo() {
        console.log('📊 Atualizando dados do escudo...');
        
        if (!window.sistemaEquipamentos) {
            console.log('⏳ Aguardando sistema de equipamentos...');
            return;
        }
        
        try {
            // Busca escudo equipado
            let escudoEncontrado = null;
            
            if (window.sistemaEquipamentos.equipamentosEquipados && 
                window.sistemaEquipamentos.equipamentosEquipados.escudos) {
                const escudos = window.sistemaEquipamentos.equipamentosEquipados.escudos;
                console.log(`📦 ${escudos.length} escudo(s) equipado(s)`);
                
                if (escudos.length > 0) {
                    escudoEncontrado = escudos[0];
                }
            }
            
            if (!escudoEncontrado) {
                console.log('❌ Nenhum escudo equipado');
                this.escudoEquipado = null;
                this.atualizarCardVazio();
                return;
            }
            
            console.log('🎯 Escudo encontrado:', escudoEncontrado.nome);
            
            // Atualiza dados internos
            this.escudoEquipado = escudoEncontrado;
            this.extrairDadosEscudo(escudoEncontrado);
            
            // Atualiza card
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

        const rdpv = escudo.rdpv.toString().trim();
        console.log('📝 RD/PV string:', rdpv);
        
        // Formato "5/20" (RD 5, PV 20)
        if (rdpv.includes('/')) {
            const partes = rdpv.split('/');
            if (partes.length >= 2) {
                const rdStr = partes[0].replace(/\D/g, '');
                const pvStr = partes[1].replace(/\D/g, '');
                
                this.RD = parseInt(rdStr) || 0;
                this.PVMaximo = parseInt(pvStr) || 0;
                this.PVAtual = this.PVAtual || this.PVMaximo; // Mantém PV atual ou começa com máximo
                
                console.log(`📊 Extraído: RD=${this.RD}, PV=${this.PVAtual}/${this.PVMaximo}`);
            }
        } 
        // Formato com apenas RD (ex: "RD 5")
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

    aplicarDanoDireto(dano) {
        console.log(`💥 Recebendo ${dano} PV de dano no escudo`);
        
        if (!this.escudoEquipado) {
            this.mostrarMensagem('Nenhum escudo equipado!', 'erro');
            return;
        }
        
        if (this.PVMaximo === 0) {
            this.mostrarMensagem('Este escudo não tem PV para danificar', 'info');
            return;
        }
        
        if (this.PVAtual <= 0) {
            this.mostrarMensagem('Escudo já está quebrado!', 'aviso');
            return;
        }
        
        // Aplica dano DIRETAMENTE (sem RD, o RD já foi considerado no cálculo do dano)
        this.PVAtual = Math.max(0, this.PVAtual - dano);
        console.log(`💔 Novo PV: ${this.PVAtual}/${this.PVMaximo}`);
        
        // Efeito visual
        this.efeitoDano();
        
        // Atualiza card
        this.atualizarCard();
        
        // Mensagem
        if (this.PVAtual === 0) {
            this.mostrarMensagem('Escudo quebrado!', 'erro');
        } else {
            this.mostrarMensagem(`Escudo perdeu ${dano} PV`, 'aviso');
        }
        
        // Salva dados
        this.salvarDados();
    }

    curarDireto(cura) {
        console.log(`💚 Curando ${cura} PV no escudo`);
        
        if (!this.escudoEquipado) {
            this.mostrarMensagem('Nenhum escudo equipado!', 'erro');
            return;
        }
        
        if (this.PVMaximo === 0) {
            this.mostrarMensagem('Este escudo não tem PV para curar', 'info');
            return;
        }
        
        if (this.PVAtual >= this.PVMaximo) {
            this.mostrarMensagem('Escudo já está com PV máximo!', 'info');
            return;
        }
        
        // Aplica cura
        const curaEfetiva = Math.min(cura, this.PVMaximo - this.PVAtual);
        this.PVAtual += curaEfetiva;
        console.log(`💚 Novo PV: ${this.PVAtual}/${this.PVMaximo}`);
        
        // Efeito visual
        this.efeitoCura();
        
        // Atualiza card
        this.atualizarCard();
        
        // Mensagem
        if (curaEfetiva > 0) {
            this.mostrarMensagem(`Escudo recuperou ${curaEfetiva} PV`, 'sucesso');
        }
        
        // Salva dados
        this.salvarDados();
    }

    salvarDados() {
        // Salva os PV atuais no escudo para persistência
        if (this.escudoEquipado && this.escudoEquipado.idUnico) {
            // Cria uma chave única para este escudo
            const chave = `escudo_${this.escudoEquipado.idUnico}`;
            const dados = {
                PVAtual: this.PVAtual,
                PVMaximo: this.PVMaximo,
                RD: this.RD,
                timestamp: Date.now()
            };
            
            localStorage.setItem(chave, JSON.stringify(dados));
            console.log('💾 Dados do escudo salvos:', dados);
        }
    }

    carregarDados() {
        // Tenta carregar PV salvos
        if (this.escudoEquipado && this.escudoEquipado.idUnico) {
            const chave = `escudo_${this.escudoEquipado.idUnico}`;
            const dadosSalvos = localStorage.getItem(chave);
            
            if (dadosSalvos) {
                try {
                    const dados = JSON.parse(dadosSalvos);
                    this.PVAtual = dados.PVAtual || this.PVMaximo;
                    console.log('📂 Dados do escudo carregados:', dados);
                } catch (e) {
                    console.log('⚠️ Não foi possível carregar dados do escudo');
                    this.PVAtual = this.PVMaximo; // Começa com PV máximo
                }
            }
        }
    }

    efeitoDano() {
        const pvFill = document.getElementById('escudoPVFill');
        if (pvFill) {
            pvFill.classList.add('dano-efeito');
            setTimeout(() => pvFill.classList.remove('dano-efeito'), 300);
        }
        
        const card = document.querySelector('.card-escudo');
        if (card) {
            card.classList.add('card-dano');
            setTimeout(() => card.classList.remove('card-dano'), 300);
        }
    }

    efeitoCura() {
        const pvFill = document.getElementById('escudoPVFill');
        if (pvFill) {
            pvFill.classList.add('cura-efeito');
            setTimeout(() => pvFill.classList.remove('cura-efeito'), 500);
        }
        
        const card = document.querySelector('.card-escudo');
        if (card) {
            card.classList.add('card-cura');
            setTimeout(() => card.classList.remove('card-cura'), 500);
        }
    }

    mostrarMensagem(texto, tipo) {
        // Remove mensagens antigas
        const mensagensAntigas = document.querySelectorAll('.mensagem-escudo');
        mensagensAntigas.forEach(msg => msg.remove());
        
        // Cria nova mensagem
        const mensagem = document.createElement('div');
        mensagem.className = `mensagem-escudo mensagem-${tipo}`;
        mensagem.textContent = texto;
        mensagem.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${this.getCorTipo(tipo)};
            color: white;
            border-radius: 6px;
            font-weight: bold;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(mensagem);
        
        // Remove após 3 segundos
        setTimeout(() => {
            mensagem.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (mensagem.parentNode) {
                    mensagem.parentNode.removeChild(mensagem);
                }
            }, 300);
        }, 3000);
    }

    getCorTipo(tipo) {
        switch(tipo) {
            case 'erro': return '#e74c3c';
            case 'sucesso': return '#27ae60';
            case 'aviso': return '#f39c12';
            case 'info': return '#3498db';
            default: return '#34495e';
        }
    }

    atualizarCard() {
        const nomeElement = document.getElementById('escudoNome');
        const drElement = document.getElementById('escudoDR');
        const statusElement = document.getElementById('escudoStatus');
        const pvTextoElement = document.getElementById('escudoPVTexto');
        const pvFillElement = document.getElementById('escudoPVFill');

        if (!nomeElement) {
            console.error('❌ Elementos do card não encontrados!');
            return;
        }

        if (!this.escudoEquipado) {
            this.atualizarCardVazio();
            return;
        }

        try {
            // Nome do escudo
            nomeElement.textContent = this.escudoEquipado.nome || 'Escudo';
            
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
        
        if (porcentagem > 75) {
            return { texto: 'Excelente', classe: 'excelente' };
        } else if (porcentagem > 50) {
            return { texto: 'Bom', classe: 'bom' };
        } else if (porcentagem > 25) {
            return { texto: 'Danificado', classe: 'danificado' };
        } else if (porcentagem > 0) {
            return { texto: 'Crítico', classe: 'critico' };
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

    // Métodos públicos para uso externo
    aplicarDanoComRD(danoTotal) {
        // Método para quando você recebe um ataque
        if (!this.escudoEquipado || this.PVAtual <= 0) {
            return danoTotal; // Sem escudo, todo dano passa
        }
        
        // Dano que passa pelo RD
        const danoAposRD = Math.max(0, danoTotal - this.RD);
        
        // Dano que o escudo absorve (até o que resta dele)
        const danoNoEscudo = Math.min(danoAposRD, this.PVAtual);
        
        // Dano que passa para o personagem
        const danoNoPersonagem = danoAposRD - danoNoEscudo;
        
        // Aplica dano ao escudo
        if (danoNoEscudo > 0) {
            this.PVAtual -= danoNoEscudo;
            this.atualizarCard();
            this.salvarDados();
            
            console.log(`🛡️ Escudo absorveu ${danoNoEscudo} de dano (${danoTotal} - ${this.RD} RD)`);
        }
        
        return danoNoPersonagem;
    }

    repararCompletamente() {
        if (!this.escudoEquipado || this.PVMaximo === 0) return;
        
        this.PVAtual = this.PVMaximo;
        this.atualizarCard();
        this.salvarDados();
        this.mostrarMensagem('Escudo completamente reparado!', 'sucesso');
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado - iniciando sistema de escudo');
    
    // Aguarda um pouco para garantir que o card exista
    setTimeout(() => {
        const cardEscudo = document.querySelector('.card-escudo');
        if (cardEscudo) {
            console.log('✅ Card de escudo encontrado');
            window.sistemaEscudo = new SistemaEscudo();
        } else {
            console.warn('⚠️ Card de escudo não encontrado');
        }
    }, 500);
});

// Adiciona CSS para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .dano-efeito {
        animation: shake 0.3s ease;
    }
    
    .cura-efeito {
        animation: pulse 0.5s ease;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes pulse {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.2); }
    }
    
    .card-dano {
        border-color: #e74c3c !important;
        box-shadow: 0 0 15px rgba(231, 76, 60, 0.3) !important;
    }
    
    .card-cura {
        border-color: #27ae60 !important;
        box-shadow: 0 0 15px rgba(46, 204, 113, 0.3) !important;
    }
    
    .status-badge {
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .status-badge.inativo {
        background: rgba(149, 165, 166, 0.2);
        color: #95a5a6;
        border: 1px solid rgba(149, 165, 166, 0.3);
    }
    
    .status-badge.excelente {
        background: rgba(46, 204, 113, 0.2);
        color: #2ecc71;
        border: 1px solid rgba(46, 204, 113, 0.3);
    }
    
    .status-badge.bom {
        background: rgba(52, 152, 219, 0.2);
        color: #3498db;
        border: 1px solid rgba(52, 152, 219, 0.3);
    }
    
    .status-badge.danificado {
        background: rgba(243, 156, 18, 0.2);
        color: #f39c12;
        border: 1px solid rgba(243, 156, 18, 0.3);
    }
    
    .status-badge.critico {
        background: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
        border: 1px solid rgba(231, 76, 60, 0.3);
    }
    
    .status-badge.quebrado {
        background: rgba(192, 57, 43, 0.2);
        color: #c0392b;
        border: 1px solid rgba(192, 57, 43, 0.3);
    }
    
    .escudo-controles {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-top: 15px;
    }
    
    .controle-dano, .controle-cura {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .controle-label {
        color: #ccc;
        font-size: 0.85rem;
        font-weight: 500;
    }
    
    .botoes-dano, .botoes-cura {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }
    
    .btn-escudo.dano {
        background: linear-gradient(135deg, rgba(231, 76, 60, 0.3), rgba(192, 57, 43, 0.3));
        color: #e74c3c;
        border: 1px solid rgba(231, 76, 60, 0.4);
        flex: 1;
        min-width: 60px;
    }
    
    .btn-escudo.dano:hover {
        background: linear-gradient(135deg, rgba(231, 76, 60, 0.5), rgba(192, 57, 43, 0.5));
    }
    
    .btn-escudo.cura {
        background: linear-gradient(135deg, rgba(46, 204, 113, 0.3), rgba(39, 174, 96, 0.3));
        color: #27ae60;
        border: 1px solid rgba(46, 204, 113, 0.4);
        flex: 1;
        min-width: 60px;
    }
    
    .btn-escudo.cura:hover {
        background: linear-gradient(135deg, rgba(46, 204, 113, 0.5), rgba(39, 174, 96, 0.5));
    }
`;
document.head.appendChild(style);
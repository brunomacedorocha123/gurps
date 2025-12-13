// sistema-escudo.js - SISTEMA SIMPLES PARA ESCUDO NO COMBATE

class SistemaEscudo {
    constructor() {
        this.escudoEquipado = null;
        this.PVMaximo = 0;
        this.PVAtual = 0;
        this.RD = 0;
        this.inicializado = false;
        
        console.log('🔧 SistemaEscudo criado');
        this.init();
    }

    // Inicialização
    init() {
        if (this.inicializado) return;
        
        console.log('🛡️ Sistema de escudo inicializando...');
        
        // Configura eventos
        this.configurarEventos();
        
        // Verificação agressiva do escudo
        this.verificarEscudoImediatamente();
        
        this.inicializado = true;
    }

    // Configura eventos
    configurarEventos() {
        // Evento quando equipamentos são atualizados
        document.addEventListener('equipamentosAtualizados', () => {
            console.log('📢 Evento equipamentosAtualizados recebido');
            setTimeout(() => this.atualizarDadosEscudo(), 200);
        });
        
        // Evento quando um item é equipado/desequipado
        document.addEventListener('itemEquipado', () => {
            console.log('📢 Evento itemEquipado recebido');
            setTimeout(() => this.atualizarDadosEscudo(), 200);
        });
        
        // Evento quando a aba de combate é aberta
        const abaCombate = document.getElementById('combate');
        if (abaCombate) {
            const observer = new MutationObserver(() => {
                if (abaCombate.classList.contains('active')) {
                    console.log('🎯 Aba combate ativada');
                    setTimeout(() => this.atualizarDadosEscudo(), 300);
                }
            });
            observer.observe(abaCombate, { attributes: true, attributeFilter: ['class'] });
        }
        
        // Configura botões do card - CORREÇÃO AQUI
        this.configurarBotoes();
    }

    // Configura botões do card - MÉTODO CORRIGIDO
    configurarBotoes() {
        console.log('🔘 Configurando botões do escudo');
        
        // Usar delegação de eventos no container principal
        const cardEscudo = document.querySelector('.card-escudo');
        if (cardEscudo) {
            cardEscudo.addEventListener('click', (e) => {
                this.handleBotaoClick(e);
            });
        }
        
        // Também adiciona listener no documento para garantir
        document.addEventListener('click', (e) => {
            this.handleBotaoClick(e);
        });
    }

    // Handler para clicks nos botões
    handleBotaoClick(e) {
        const botao = e.target.closest('.btn-escudo');
        if (!botao) return;
        
        console.log('🔘 Botão clicado:', botao.className);
        
        // Previne comportamento padrão
        e.preventDefault();
        e.stopPropagation();
        
        if (botao.classList.contains('dano-5')) {
            console.log('💥 Botão -5 clicado');
            this.aplicarDano(5);
        } else if (botao.classList.contains('dano-1')) {
            console.log('💥 Botão -1 clicado');
            this.aplicarDano(1);
        } else if (botao.classList.contains('cura-1')) {
            console.log('💚 Botão +1 clicado');
            this.curar(1);
        } else if (botao.classList.contains('cura-5')) {
            console.log('💚 Botão +5 clicado');
            this.curar(5);
        }
    }

    // Verificação imediata do escudo
    verificarEscudoImediatamente() {
        console.log('🔍 Verificando escudo imediatamente...');
        
        // Tenta várias vezes encontrar o sistema de equipamentos
        let tentativas = 0;
        const verificar = () => {
            tentativas++;
            
            if (window.sistemaEquipamentos) {
                console.log('✅ Sistema de equipamentos encontrado');
                this.atualizarDadosEscudo();
                
                // Força atualização extra
                setTimeout(() => this.atualizarDadosEscudo(), 500);
                setTimeout(() => this.atualizarDadosEscudo(), 1000);
            } else if (tentativas < 10) {
                console.log(`⏳ Aguardando sistema de equipamentos... (${tentativas})`);
                setTimeout(verificar, 500);
            } else {
                console.log('⚠️ Sistema de equipamentos não encontrado');
            }
        };
        
        setTimeout(verificar, 1000);
    }

    // Atualiza dados do escudo equipado
    atualizarDadosEscudo() {
        console.log('📊 Atualizando dados do escudo...');
        
        if (!window.sistemaEquipamentos) {
            console.warn('⚠️ sistemaEquipamentos não disponível');
            this.atualizarCardVazio();
            return;
        }

        try {
            // Busca escudo equipado no sistema de equipamentos
            let escudoEncontrado = null;
            
            // Verifica se o objeto existe e tem a propriedade
            if (window.sistemaEquipamentos.equipamentosEquipados) {
                const escudosEquipados = window.sistemaEquipamentos.equipamentosEquipados.escudos;
                console.log('📦 Escudos equipados:', escudosEquipados);
                
                if (escudosEquipados && escudosEquipados.length > 0) {
                    escudoEncontrado = escudosEquipados[0];
                    console.log('🎯 Escudo encontrado:', escudoEncontrado);
                }
            }
            
            if (!escudoEncontrado) {
                console.log('❌ Nenhum escudo equipado');
                this.escudoEquipado = null;
                this.atualizarCardVazio();
                return;
            }

            // Atualiza dados internos
            this.escudoEquipado = escudoEncontrado;
            console.log('📝 Dados do escudo:', {
                nome: escudoEncontrado.nome,
                rdpv: escudoEncontrado.rdpv,
                bd: escudoEncontrado.bd
            });
            
            // Extrai dados
            this.extrairDadosEscudo(escudoEncontrado);
            
            // Atualiza interface
            this.atualizarCard();
            
        } catch (error) {
            console.error('❌ Erro ao atualizar escudo:', error);
            this.atualizarCardVazio();
        }
    }

    // Extrai RD e PV do formato "5/20" ou similar
    extrairDadosEscudo(escudo) {
        console.log('🔧 Extraindo dados do escudo:', escudo.rdpv);
        
        if (!escudo.rdpv) {
            console.log('⚠️ Escudo sem RD/PV definido');
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

    // Aplica dano ao escudo
    aplicarDano(dano) {
        console.log(`💥 Aplicando ${dano} de dano ao escudo`);
        
        if (!this.escudoEquipado || this.PVAtual <= 0) {
            console.log('⚠️ Escudo não está ativo');
            return;
        }
        
        // Calcula dano efetivo (dano - RD)
        const danoEfetivo = Math.max(0, dano - this.RD);
        console.log(`🛡️ Dano: ${dano}, RD: ${this.RD}, Dano efetivo: ${danoEfetivo}`);
        
        if (danoEfetivo > 0) {
            this.PVAtual = Math.max(0, this.PVAtual - danoEfetivo);
            console.log(`💔 Novo PV: ${this.PVAtual}/${this.PVMaximo}`);
            this.atualizarCard();
            
            // Efeito visual
            this.efeitoDano();
        } else {
            console.log('✅ Dano completamente bloqueado!');
        }
    }

    // Cura o escudo
    curar(cura) {
        console.log(`💚 Curando ${cura} PV do escudo`);
        
        if (!this.escudoEquipado || this.PVMaximo === 0) {
            console.log('⚠️ Escudo não tem sistema de PV');
            return;
        }
        
        const novaCura = Math.min(cura, this.PVMaximo - this.PVAtual);
        if (novaCura > 0) {
            this.PVAtual += novaCura;
            console.log(`💚 Novo PV: ${this.PVAtual}/${this.PVMaximo}`);
            this.atualizarCard();
            
            // Efeito visual
            this.efeitoCura();
        } else {
            console.log('✅ Escudo já está com PV máximo');
        }
    }

    // Efeito visual de dano
    efeitoDano() {
        const pvFill = document.getElementById('escudoPVFill');
        if (pvFill) {
            pvFill.classList.add('dano-efeito');
            setTimeout(() => pvFill.classList.remove('dano-efeito'), 300);
        }
    }

    // Efeito visual de cura
    efeitoCura() {
        const pvFill = document.getElementById('escudoPVFill');
        if (pvFill) {
            pvFill.classList.add('cura-efeito');
            setTimeout(() => pvFill.classList.remove('cura-efeito'), 500);
        }
    }

    // Atualiza card com escudo equipado
    atualizarCard() {
        console.log('🎨 Atualizando card do escudo');
        
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
            console.log(`🏷️ Nome: ${nomeElement.textContent}`);
            
            // RD
            drElement.textContent = this.RD;
            console.log(`🛡️ RD: ${this.RD}`);
            
            // Status
            const status = this.calcularStatus();
            statusElement.textContent = status.texto;
            statusElement.className = `status-badge ${status.classe}`;
            console.log(`🔧 Status: ${status.texto} (${status.classe})`);
            
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
                console.log(`❤️ PV: ${pvTextoElement.textContent} (${porcentagem.toFixed(1)}%)`);
            } else {
                // Sem sistema de PV
                pvTextoElement.textContent = `RD ${this.RD}`;
                pvFillElement.style.width = '100%';
                pvFillElement.style.background = 'linear-gradient(90deg, #3498db, #2980b9)';
                console.log(`🛡️ Apenas RD: ${this.RD}`);
            }
            
        } catch (error) {
            console.error('❌ Erro ao atualizar card:', error);
            this.atualizarCardVazio();
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
        console.log('⬜ Atualizando card vazio');
        
        const nomeElement = document.getElementById('escudoNome');
        const drElement = document.getElementById('escudoDR');
        const statusElement = document.getElementById('escudoStatus');
        const pvTextoElement = document.getElementById('escudoPVTexto');
        const pvFillElement = document.getElementById('escudoPVFill');

        if (!nomeElement) {
            console.error('❌ Elementos do card não encontrados!');
            return;
        }

        try {
            // Valores padrão
            nomeElement.textContent = 'Nenhum escudo equipado';
            drElement.textContent = '0';
            statusElement.textContent = 'Inativo';
            statusElement.className = 'status-badge inativo';
            pvTextoElement.textContent = '0/0';
            pvFillElement.style.width = '0%';
            pvFillElement.style.background = 'linear-gradient(90deg, #95a5a6, #7f8c8d)';
            
        } catch (error) {
            console.error('❌ Erro ao atualizar card vazio:', error);
        }
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
    console.log('📄 DOM carregado - verificando card de escudo');
    
    const cardEscudo = document.querySelector('.card-escudo');
    if (cardEscudo) {
        console.log('✅ Card de escudo encontrado no DOM');
        setTimeout(() => {
            window.sistemaEscudo = new SistemaEscudo();
        }, 500);
    } else {
        console.log('❌ Card de escudo NÃO encontrado no DOM');
    }
});

// Remove as funções globais antigas se existirem
if (window.danoEscudo) delete window.danoEscudo;
if (window.curarEscudo) delete window.curarEscudo;
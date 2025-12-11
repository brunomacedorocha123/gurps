// pv-pf.js - Sistema de Pontos de Vida e Fadiga
// Focado APENAS no card de PV e PF

class SistemaPVPF {
    constructor() {
        console.log('Iniciando sistema PV/PF...');
        
        // Estado do PV
        this.pv = {
            max: 10,
            atual: 10,
            bonus: 0,
            porcentagem: 100,
            stThreshold: 5 // Limite de ST (metade do PV)
        };
        
        // Estado do PF
        this.pf = {
            max: 10,
            atual: 10,
            porcentagem: 100
        };
        
        // Cache dos elementos
        this.elements = {};
        
        // Inicializar
        this.cacheElements();
        this.bindEvents();
        this.carregarSalvo();
        this.atualizarTudo();
        
        console.log('Sistema PV/PF pronto!');
    }
    
    cacheElements() {
        // Elementos do PV
        this.elements.pv = {
            maxInput: document.getElementById('pvMax'),
            atualInput: document.getElementById('pvAtual'),
            bonusInput: document.getElementById('pvBonus'),
            fill: document.getElementById('pvFill'),
            texto: document.getElementById('pvTexto'),
            botoes: document.querySelectorAll('.pv-btn'),
            marcadorSt: document.getElementById('marcadorSt')
        };
        
        // Elementos do PF
        this.elements.pf = {
            maxInput: document.getElementById('pfMax'),
            atualInput: document.getElementById('pfAtual'),
            fill: document.getElementById('pfFill'),
            texto: document.getElementById('pfTexto'),
            botoes: document.querySelectorAll('.pf-btn')
        };
        
        // Faixas de PV
        this.elements.faixas = document.querySelectorAll('.faixa-item');
        
        // Estados de PF
        this.elements.estados = document.querySelectorAll('.estado-item');
    }
    
    bindEvents() {
        // === EVENTOS DO PV ===
        
        // Quando muda o máximo de PV
        this.elements.pv.maxInput.addEventListener('change', (e) => {
            const novoMax = parseInt(e.target.value) || 1;
            this.alterarPvMax(novoMax);
        });
        
        // Quando muda o atual de PV
        this.elements.pv.atualInput.addEventListener('change', (e) => {
            const novoAtual = parseInt(e.target.value) || 0;
            this.alterarPvAtual(novoAtual);
        });
        
        // Quando muda o bônus de PV
        this.elements.pv.bonusInput.addEventListener('change', (e) => {
            this.pv.bonus = parseInt(e.target.value) || 0;
            this.atualizarPV();
        });
        
        // Botões +- do PV
        this.elements.pv.botoes.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const valor = parseInt(e.target.dataset.amount) || 1;
                if (e.target.classList.contains('plus')) {
                    this.alterarPv(valor);
                } else {
                    this.alterarPv(-valor);
                }
            });
        });
        
        // === EVENTOS DO PF ===
        
        // Quando muda o máximo de PF
        this.elements.pf.maxInput.addEventListener('change', (e) => {
            const novoMax = parseInt(e.target.value) || 1;
            this.alterarPfMax(novoMax);
        });
        
        // Quando muda o atual de PF
        this.elements.pf.atualInput.addEventListener('change', (e) => {
            const novoAtual = parseInt(e.target.value) || 0;
            this.alterarPfAtual(novoAtual);
        });
        
        // Botões +- do PF
        this.elements.pf.botoes.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const valor = parseInt(e.target.dataset.amount) || 1;
                if (e.target.classList.contains('plus')) {
                    this.alterarPf(valor);
                } else {
                    this.alterarPf(-valor);
                }
            });
        });
        
        // Escutar mudanças dos atributos (se o sistema existir)
        if (window.obterDadosAtributos) {
            document.addEventListener('atributosAlterados', () => {
                this.sincronizarComAtributos();
            });
        }
    }
    
    // ==================== MÉTODOS DO PV ====================
    
    alterarPvMax(novoMax) {
        // Garantir mínimo de 1
        if (novoMax < 1) novoMax = 1;
        
        // Atualizar estado
        this.pv.max = novoMax;
        this.elements.pv.maxInput.value = novoMax;
        
        // Recalcular ST (metade do PV)
        this.pv.stThreshold = Math.floor(this.pv.max / 2);
        
        // Ajustar PV atual se ficou maior que o máximo
        if (this.pv.atual > novoMax) {
            this.pv.atual = novoMax;
            this.elements.pv.atualInput.value = novoMax;
        }
        
        this.atualizarPV();
    }
    
    alterarPvAtual(novoAtual) {
        // Permitir negativo até -50
        if (novoAtual < -50) novoAtual = -50;
        
        // Limite superior: 2x o máximo
        const limiteMaximo = this.pv.max * 2;
        if (novoAtual > limiteMaximo) novoAtual = limiteMaximo;
        
        // Atualizar estado
        this.pv.atual = novoAtual;
        this.elements.pv.atualInput.value = novoAtual;
        
        this.atualizarPV();
    }
    
    alterarPv(quantidade) {
        this.alterarPvAtual(this.pv.atual + quantidade);
    }
    
    atualizarPV() {
        // Calcular porcentagem
        this.pv.porcentagem = (this.pv.atual / this.pv.max) * 100;
        if (this.pv.porcentagem < 0) this.pv.porcentagem = 0;
        if (this.pv.porcentagem > 200) this.pv.porcentagem = 200;
        
        // Atualizar barra visual
        this.elements.pv.fill.style.width = `${this.pv.porcentagem}%`;
        this.elements.pv.texto.textContent = `${this.pv.atual}/${this.pv.max}`;
        
        // Atualizar marcador de ST
        this.atualizarMarcadorSt();
        
        // Atualizar faixas de cor
        this.atualizarFaixasPV();
        
        // Atualizar cor da barra
        this.atualizarCorBarraPV();
        
        // Salvar estado
        this.salvar();
    }
    
    atualizarMarcadorSt() {
        if (!this.elements.pv.marcadorSt) return;
        
        // Calcular posição do marcador (ST = metade do PV)
        const posicaoSt = (this.pv.stThreshold / this.pv.max) * 100;
        this.elements.pv.marcadorSt.textContent = `ST (${this.pv.stThreshold})`;
        
        // Mover o marcador visual
        const marcadorElement = document.querySelector('.pv-marcador[style*="left: 0%"]');
        if (marcadorElement) {
            marcadorElement.style.left = `${Math.min(posicaoSt, 100)}%`;
        }
    }
    
    atualizarFaixasPV() {
        // Definir faixas de PV
        const faixas = [
            { min: 100, cor: '#27ae60', nome: 'Cheio' },
            { min: 80, cor: '#f1c40f', nome: 'Machucado' },
            { min: 60, cor: '#e67e22', nome: 'Ferido' },
            { min: 40, cor: '#e74c3c', nome: 'Crítico' },
            { min: 20, cor: '#9b59b6', nome: 'Morrendo' },
            { min: 0, cor: '#7f8c8d', nome: 'Inconsciente' }
        ];
        
        // Encontrar faixa atual
        let faixaAtual = null;
        for (const faixa of faixas) {
            if (this.pv.porcentagem >= faixa.min) {
                faixaAtual = faixa;
                break;
            }
        }
        
        // Se estiver abaixo de 0, é inconsciente
        if (this.pv.atual <= 0) {
            faixaAtual = { nome: 'Inconsciente', cor: '#7f8c8d' };
        }
        
        // Atualizar visual das faixas
        this.elements.faixas.forEach((item, index) => {
            const faixa = faixas[index];
            item.style.backgroundColor = faixa.cor;
            
            if (faixaAtual && faixa.nome === faixaAtual.nome) {
                item.classList.add('ativa');
            } else {
                item.classList.remove('ativa');
            }
        });
    }
    
    atualizarCorBarraPV() {
        // Cores baseadas na porcentagem
        let cor = '#27ae60'; // Verde (saudável)
        
        if (this.pv.porcentagem < 80) cor = '#f1c40f'; // Amarelo
        if (this.pv.porcentagem < 60) cor = '#e67e22'; // Laranja
        if (this.pv.porcentagem < 40) cor = '#e74c3c'; // Vermelho
        if (this.pv.porcentagem < 20) cor = '#9b59b6'; // Roxo
        if (this.pv.atual <= 0) cor = '#7f8c8d';       // Cinza (inconsciente)
        
        this.elements.pv.fill.style.backgroundColor = cor;
    }
    
    // ==================== MÉTODOS DO PF ====================
    
    alterarPfMax(novoMax) {
        if (novoMax < 1) novoMax = 1;
        
        this.pf.max = novoMax;
        this.elements.pf.maxInput.value = novoMax;
        
        // Ajustar PF atual se necessário
        if (this.pf.atual > novoMax) {
            this.pf.atual = novoMax;
            this.elements.pf.atualInput.value = novoMax;
        }
        
        this.atualizarPF();
    }
    
    alterarPfAtual(novoAtual) {
        // Permitir até -10
        if (novoAtual < -10) novoAtual = -10;
        
        // Limite superior: 2x máximo
        if (novoAtual > this.pf.max * 2) novoAtual = this.pf.max * 2;
        
        this.pf.atual = novoAtual;
        this.elements.pf.atualInput.value = novoAtual;
        
        this.atualizarPF();
    }
    
    alterarPf(quantidade) {
        this.alterarPfAtual(this.pf.atual + quantidade);
    }
    
    atualizarPF() {
        // Calcular porcentagem
        this.pf.porcentagem = (this.pf.atual / this.pf.max) * 100;
        if (this.pf.porcentagem < -100) this.pf.porcentagem = -100;
        if (this.pf.porcentagem > 200) this.pf.porcentagem = 200;
        
        // Atualizar barra
        this.elements.pf.fill.style.width = `${this.pf.porcentagem}%`;
        this.elements.pf.texto.textContent = `${this.pf.atual}/${this.pf.max}`;
        
        // Atualizar estados
        this.atualizarEstadosPF();
        
        // Atualizar cor da barra
        this.atualizarCorBarraPF();
        
        // Salvar
        this.salvar();
    }
    
    atualizarEstadosPF() {
        const tercoMax = this.pf.max / 3;
        let estado = 'normal'; // PF ≥ 1/3 máximo
        
        if (this.pf.atual < tercoMax) {
            estado = 'fadigado'; // PF < 1/3 máximo
        }
        
        if (this.pf.atual <= 0) {
            estado = 'inconsciente'; // PF = 0 ou menos
        }
        
        // Atualizar visual dos estados
        this.elements.estados.forEach(item => {
            if (item.dataset.estado === estado) {
                item.classList.add('ativo');
            } else {
                item.classList.remove('ativo');
            }
        });
    }
    
    atualizarCorBarraPF() {
        let cor = '#2ecc71'; // Verde (normal)
        
        if (this.pf.atual < this.pf.max / 3) {
            cor = '#f1c40f'; // Amarelo (fadigado)
        }
        
        if (this.pf.atual <= 0) {
            cor = '#e74c3c'; // Vermelho (inconsciente)
        }
        
        this.elements.pf.fill.style.backgroundColor = cor;
    }
    
    // ==================== INTEGRAÇÃO ====================
    
    sincronizarComAtributos() {
        // Se existir o sistema de atributos, pega PV e PF dele
        try {
            if (window.obterDadosAtributos) {
                const dados = window.obterDadosAtributos();
                
                // Atualizar PV máximo
                if (dados.PV && dados.PV !== this.pv.max) {
                    this.alterarPvMax(dados.PV);
                }
                
                // Atualizar PF máximo
                if (dados.PF && dados.PF !== this.pf.max) {
                    this.alterarPfMax(dados.PF);
                }
            }
        } catch (error) {
            console.log('Sistema de atributos não disponível:', error);
        }
    }
    
    // ==================== PERSISTÊNCIA ====================
    
    salvar() {
        try {
            const dados = {
                pv: this.pv,
                pf: this.pf,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('gurps-pv-pf', JSON.stringify(dados));
        } catch (error) {
            console.log('Não foi possível salvar:', error);
        }
    }
    
    carregarSalvo() {
        try {
            const salvo = localStorage.getItem('gurps-pv-pf');
            if (salvo) {
                const dados = JSON.parse(salvo);
                
                // Carregar PV
                if (dados.pv) {
                    this.pv = dados.pv;
                    this.elements.pv.maxInput.value = this.pv.max;
                    this.elements.pv.atualInput.value = this.pv.atual;
                    this.elements.pv.bonusInput.value = this.pv.bonus;
                }
                
                // Carregar PF
                if (dados.pf) {
                    this.pf = dados.pf;
                    this.elements.pf.maxInput.value = this.pf.max;
                    this.elements.pf.atualInput.value = this.pf.atual;
                }
                
                console.log('Dados PV/PF carregados do armazenamento local');
            }
        } catch (error) {
            console.log('Não foi possível carregar dados salvos:', error);
        }
    }
    
    // ==================== PÚBLICO ====================
    
    // Para outros sistemas acessarem os dados
    getDados() {
        return {
            pv: { ...this.pv },
            pf: { ...this.pf }
        };
    }
    
    // Para outros sistemas alterarem os dados
    setDados(dados) {
        if (dados.pv) {
            if (dados.pv.max !== undefined) this.alterarPvMax(dados.pv.max);
            if (dados.pv.atual !== undefined) this.alterarPvAtual(dados.pv.atual);
            if (dados.pv.bonus !== undefined) {
                this.pv.bonus = dados.pv.bonus;
                this.elements.pv.bonusInput.value = this.pv.bonus;
            }
        }
        
        if (dados.pf) {
            if (dados.pf.max !== undefined) this.alterarPfMax(dados.pf.max);
            if (dados.pf.atual !== undefined) this.alterarPfAtual(dados.pf.atual);
        }
    }
}

// ==================== INICIALIZAÇÃO ====================

let sistemaPVPF = null;

// Função para iniciar quando a aba de combate for ativada
function iniciarSistemaPVPF() {
    if (!sistemaPVPF) {
        sistemaPVPF = new SistemaPVPF();
    }
    return sistemaPVPF;
}

// Inicialização automática
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se estamos na aba de combate
    const combateTab = document.getElementById('combate');
    
    // Se a aba já estiver ativa, inicia
    if (combateTab && combateTab.classList.contains('active')) {
        setTimeout(() => {
            iniciarSistemaPVPF();
        }, 100);
    }
    
    // Observa mudanças nas abas
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                // Quando a aba de combate ficar ativa
                if (tab.id === 'combate' && tab.classList.contains('active')) {
                    setTimeout(() => {
                        iniciarSistemaPVPF();
                    }, 100);
                }
            }
        });
    });
    
    // Começa a observar a aba de combate
    if (combateTab) {
        observer.observe(combateTab, { attributes: true });
    }
});

// Exportar para uso global
window.iniciarSistemaPVPF = iniciarSistemaPVPF;
window.obterDadosPVPF = () => sistemaPVPF ? sistemaPVPF.getDados() : null;
window.atualizarPVPF = (dados) => sistemaPVPF ? sistemaPVPF.setDados(dados) : null;
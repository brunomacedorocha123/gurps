// caracteristicas-riqueza.js - VERSÃO COMPLETA COM INTEGRAÇÃO DASHBOARD
class SistemaRiqueza {
    constructor() {
        this.niveisRiqueza = {
            "falido": { 
                pontos: -25, 
                multiplicador: 0, 
                descricao: "Sem emprego, fonte de renda, dinheiro ou bens",
                recursos: "Nenhum",
                icone: "fas fa-skull-crossbones",
                tipo: "desvantagem"
            },
            "pobre": { 
                pontos: -15, 
                multiplicador: 0.2, 
                descricao: "1/5 da riqueza média da sociedade",
                recursos: "Muito limitados",
                icone: "fas fa-house-damage",
                tipo: "desvantagem"
            },
            "batalhador": { 
                pontos: -10, 
                multiplicador: 0.5, 
                descricao: "Metade da riqueza média",
                recursos: "Limitados",
                icone: "fas fa-hands-helping",
                tipo: "desvantagem"
            },
            "medio": { 
                pontos: 0, 
                multiplicador: 1, 
                descricao: "Nível de recursos pré-definido padrão",
                recursos: "Padrão",
                icone: "fas fa-user",
                tipo: "neutro"
            },
            "confortavel": { 
                pontos: 10, 
                multiplicador: 2, 
                descricao: "O dobro da riqueza média",
                recursos: "Confortáveis",
                icone: "fas fa-smile",
                tipo: "vantagem"
            },
            "rico": { 
                pontos: 20, 
                multiplicador: 5, 
                descricao: "5 vezes a riqueza média",
                recursos: "Abundantes",
                icone: "fas fa-grin-stars",
                tipo: "vantagem"
            },
            "muito-rico": { 
                pontos: 30, 
                multiplicador: 20, 
                descricao: "20 vezes a riqueza média", 
                recursos: "Extremamente abundantes",
                icone: "fas fa-crown",
                tipo: "vantagem"
            },
            "podre-rico": { 
                pontos: 50, 
                multiplicador: 100, 
                descricao: "100 vezes a riqueza média",
                recursos: "Ilimitados para necessidades comuns",
                icone: "fas fa-gem",
                tipo: "vantagem"
            }
        };

        this.rendaBase = 1000; // Renda base do cenário
        this.inicializado = false;
        this.ultimoPontos = 0; // Para detectar mudanças
        this.inicializar();
    }

    inicializar() {
        if (this.inicializado) return;
        
        console.log('💰 Inicializando Sistema de Riqueza (v2.0)...');
        this.carregarDadosSalvos();
        this.configurarEventos();
        this.atualizarDisplayRiqueza();
        this.inicializado = true;
        
        // Notificar dashboard imediatamente
        this.notificarDashboard();
    }

    configurarEventos() {
        const selectRiqueza = document.getElementById('nivelRiqueza');
        if (selectRiqueza) {
            // Remover event listener anterior se existir
            selectRiqueza.removeEventListener('change', this.handleRiquezaChange);
            
            // Adicionar novo
            this.handleRiquezaChange = () => {
                this.atualizarDisplayRiqueza();
                this.salvarDados();
                this.notificarSistemaPrincipal();
                this.notificarDashboard();
            };
            
            selectRiqueza.addEventListener('change', this.handleRiquezaChange);
        }
    }

    atualizarDisplayRiqueza() {
        const select = document.getElementById('nivelRiqueza');
        const display = document.getElementById('displayRiqueza');
        const badge = document.getElementById('pontosRiqueza');
        const rendaElement = document.getElementById('rendaMensal');
        
        if (!select || !display || !badge || !rendaElement) return;

        const valor = parseInt(select.value);
        const nivel = this.obterNivelPorPontos(valor);
        
        if (nivel) {
            // Calcular renda mensal
            const rendaMensal = this.calcularRendaMensal(valor);
            
            // Atualizar display principal
            display.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <i class="${nivel.icone}" style="color: ${this.getCorPorTipo(nivel.tipo)};"></i>
                    <strong style="color: #ffd700;">${this.obterNomePorPontos(valor)}</strong>
                </div>
                <div style="font-size: 0.9em; color: #ccc;">
                    <div>Multiplicador: ${nivel.multiplicador}x | Recursos: ${nivel.recursos}</div>
                    <div style="margin-top: 4px;">${nivel.descricao}</div>
                </div>
            `;

            // Atualizar badge de pontos
            const pontosTexto = valor >= 0 ? `+${valor} pts` : `${valor} pts`;
            badge.textContent = pontosTexto;
            badge.style.background = this.getCorPorTipo(nivel.tipo);
            badge.style.color = '#fff';

            // Atualizar renda mensal
            rendaElement.textContent = this.formatarMoeda(rendaMensal);
            rendaElement.style.color = this.getCorPorTipo(nivel.tipo);
            rendaElement.style.fontWeight = 'bold';
            
            // Atualizar card de características no dashboard
            this.atualizarCardDashboard(valor, rendaMensal);
            
            // Guardar para detectar mudanças
            this.ultimoPontos = valor;
        }
    }
    
    getCorPorTipo(tipo) {
        switch(tipo) {
            case 'vantagem': return '#27ae60'; // Verde
            case 'desvantagem': return '#e74c3c'; // Vermelho
            case 'neutro': return '#95a5a6'; // Cinza
            default: return '#ff8c00'; // Laranja
        }
    }
    
    atualizarCardDashboard(pontos, renda) {
        try {
            // Atualizar o card de características no dashboard
            const statusRiqueza = document.getElementById('statusRiqueza');
            const statusSaldo = document.getElementById('statusSaldo');
            
            if (statusRiqueza) {
                statusRiqueza.textContent = this.obterNomePorPontos(pontos);
                
                // Colorir baseado no tipo
                if (pontos > 0) {
                    statusRiqueza.style.color = '#27ae60';
                } else if (pontos < 0) {
                    statusRiqueza.style.color = '#e74c3c';
                } else {
                    statusRiqueza.style.color = '#95a5a6';
                }
            }
            
            if (statusSaldo) {
                statusSaldo.textContent = this.formatarMoeda(renda);
                statusSaldo.style.color = pontos >= 0 ? '#27ae60' : '#e74c3c';
            }
            
        } catch (error) {
            console.log('⚠️ Dashboard ainda não carregado, tentando novamente...');
            // Tentar novamente em 500ms
            setTimeout(() => this.atualizarCardDashboard(pontos, renda), 500);
        }
    }

    calcularRendaMensal(pontosRiqueza) {
        const nivel = this.obterNivelPorPontos(pontosRiqueza);
        if (!nivel) return 0;
        
        return Math.floor(this.rendaBase * nivel.multiplicador);
    }

    formatarMoeda(valor) {
        return `$${valor.toLocaleString('en-US')}`;
    }

    obterNivelPorPontos(pontos) {
        return Object.values(this.niveisRiqueza).find(nivel => nivel.pontos === pontos);
    }

    obterNomePorPontos(pontos) {
        const entry = Object.entries(this.niveisRiqueza).find(([key, nivel]) => nivel.pontos === pontos);
        return entry ? this.formatarNome(entry[0]) : 'Desconhecido';
    }

    formatarNome(key) {
        return key.split('-')
            .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
            .join(' ');
    }

    getPontosRiqueza() {
        const select = document.getElementById('nivelRiqueza');
        return select ? parseInt(select.value) || 0 : 0;
    }

    getRendaMensal() {
        return this.calcularRendaMensal(this.getPontosRiqueza());
    }

    // SISTEMA DE SALVAMENTO
    carregarDadosSalvos() {
        try {
            const dadosSalvos = localStorage.getItem('sistemaRiqueza_data');
            if (dadosSalvos) {
                const dados = JSON.parse(dadosSalvos);
                const select = document.getElementById('nivelRiqueza');
                if (select && dados.nivelRiqueza !== undefined) {
                    select.value = dados.nivelRiqueza;
                    console.log('✅ Dados de riqueza carregados:', dados.nivelRiqueza);
                }
            }
        } catch (error) {
            console.log('❌ Erro ao carregar dados de riqueza:', error);
        }
    }

    salvarDados() {
        try {
            const select = document.getElementById('nivelRiqueza');
            if (select) {
                const dadosParaSalvar = {
                    nivelRiqueza: parseInt(select.value),
                    rendaMensal: this.getRendaMensal(),
                    ultimaAtualizacao: new Date().toISOString(),
                    versao: '2.0'
                };
                localStorage.setItem('sistemaRiqueza_data', JSON.stringify(dadosParaSalvar));
            }
        } catch (error) {
            console.log('❌ Erro ao salvar dados de riqueza:', error);
        }
    }

    // INTEGRAÇÃO COM DASHBOARD (NOVO!)
    notificarDashboard() {
        const pontos = this.getPontosRiqueza();
        const renda = this.getRendaMensal();
        
        // Disparar evento para o dashboard
        const evento = new CustomEvent('riquezaPontosAtualizados', {
            detail: {
                pontos: pontos,
                valorAbsoluto: Math.abs(pontos), // Para cálculo
                nivel: this.obterNomePorPontos(pontos),
                rendaMensal: renda,
                tipo: pontos >= 0 ? 'vantagem' : 'desvantagem',
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(evento);
        
        console.log('📢 Notificando dashboard sobre riqueza:', {
            pontos: pontos,
            tipo: pontos >= 0 ? 'VANTAGEM (custa pontos)' : 'DESVANTAGEM (ganha pontos)',
            renda: this.formatarMoeda(renda)
        });
    }

    notificarSistemaPrincipal() {
        // Manter compatibilidade com sistema antigo
        if (window.sistemaCaracteristicas && typeof window.sistemaCaracteristicas.atualizarPontosTotais === 'function') {
            window.sistemaCaracteristicas.atualizarPontosTotais();
        }
        
        // Evento antigo (manter para compatibilidade)
        const eventoAntigo = new CustomEvent('riquezaAlterada', {
            detail: {
                pontos: this.getPontosRiqueza(),
                nivel: this.obterNomePorPontos(this.getPontosRiqueza()),
                rendaMensal: this.getRendaMensal()
            }
        });
        document.dispatchEvent(eventoAntigo);
        
        // Disparar também para dashboard
        this.notificarDashboard();
    }

    // MÉTODOS PARA INTEGRAÇÃO
    exportarDados() {
        const pontos = this.getPontosRiqueza();
        const nivel = this.obterNivelPorPontos(pontos);
        
        return {
            riqueza: {
                nivel: pontos,
                nome: this.obterNomePorPontos(pontos),
                multiplicador: nivel?.multiplicador || 1,
                rendaMensal: this.getRendaMensal(),
                descricao: nivel?.descricao || '',
                tipo: pontos >= 0 ? 'vantagem' : 'desvantagem',
                custoPontos: Math.abs(pontos) // Sempre positivo para cálculo
            }
        };
    }

    carregarDados(dados) {
        if (dados.riqueza && dados.riqueza.nivel !== undefined) {
            const select = document.getElementById('nivelRiqueza');
            if (select) {
                select.value = dados.riqueza.nivel;
                this.atualizarDisplayRiqueza();
                this.notificarDashboard(); // Notificar após carregar
            }
        }
    }

    // VALIDAÇÕES
    validarRiqueza() {
        const pontos = this.getPontosRiqueza();
        const renda = this.getRendaMensal();
        const tipo = pontos >= 0 ? 'Vantagem' : 'Desvantagem';
        
        return {
            valido: true,
            pontos: pontos,
            rendaMensal: renda,
            tipo: tipo,
            mensagem: `Riqueza: ${this.obterNomePorPontos(pontos)} (${pontos >= 0 ? '+' : ''}${pontos} pts) | Renda: ${this.formatarMoeda(renda)} | ${tipo}`
        };
    }

    // MÉTODOS DE CONFIGURAÇÃO
    setRendaBase(novaRendaBase) {
        this.rendaBase = novaRendaBase;
        this.atualizarDisplayRiqueza();
        this.notificarDashboard(); // Notificar mudança
    }

    getRendaBase() {
        return this.rendaBase;
    }
    
    // MÉTODO PARA FORÇAR ATUALIZAÇÃO
    forcarAtualizacao() {
        console.log('🔄 Forçando atualização do sistema de riqueza...');
        this.atualizarDisplayRiqueza();
        this.notificarDashboard();
    }
}

// INICIALIZAÇÃO SEGURA
let sistemaRiqueza;

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado, inicializando sistema de riqueza...');
    
    // Esperar um pouco para garantir que todos os elementos estão carregados
    setTimeout(() => {
        try {
            sistemaRiqueza = new SistemaRiqueza();
            console.log('✅ Sistema de riqueza inicializado com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao inicializar sistema de riqueza:', error);
        }
    }, 300);
});

// Inicialização quando a aba características for ativada
document.addEventListener('caracteristicasCarregadas', function() {
    console.log('🎯 Evento caracteristicasCarregadas disparado');
    if (!sistemaRiqueza || !sistemaRiqueza.inicializado) {
        sistemaRiqueza = new SistemaRiqueza();
    } else {
        sistemaRiqueza.forcarAtualizacao();
    }
});

// TORNAR DISPONÍVEL GLOBALMENTE
window.SistemaRiqueza = SistemaRiqueza;
window.sistemaRiqueza = sistemaRiqueza;

// Exportar função de inicialização manual
window.inicializarSistemaRiqueza = function() {
    if (!sistemaRiqueza || !sistemaRiqueza.inicializado) {
        sistemaRiqueza = new SistemaRiqueza();
    }
    return sistemaRiqueza;
};

// Inicialização automática para desenvolvimento
if (window.location.hash === '#teste-riqueza') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            if (sistemaRiqueza) {
                sistemaRiqueza.forcarAtualizacao();
                console.log('🧪 Teste de riqueza realizado!');
            }
        }, 1000);
    });
}
// caracteristicas-riqueza.js
class SistemaRiqueza {
    constructor() {
        this.niveisRiqueza = {
            "falido": { 
                pontos: -25, 
                multiplicador: 0, 
                descricao: "Sem emprego, fonte de renda, dinheiro ou bens",
                recursos: "Nenhum",
                icone: "fas fa-skull-crossbones"
            },
            "pobre": { 
                pontos: -15, 
                multiplicador: 0.2, 
                descricao: "1/5 da riqueza média da sociedade",
                recursos: "Muito limitados",
                icone: "fas fa-house-damage"
            },
            "batalhador": { 
                pontos: -10, 
                multiplicador: 0.5, 
                descricao: "Metade da riqueza média",
                recursos: "Limitados",
                icone: "fas fa-hands-helping"
            },
            "medio": { 
                pontos: 0, 
                multiplicador: 1, 
                descricao: "Nível de recursos pré-definido padrão",
                recursos: "Padrão",
                icone: "fas fa-user"
            },
            "confortavel": { 
                pontos: 10, 
                multiplicador: 2, 
                descricao: "O dobro da riqueza média",
                recursos: "Confortáveis",
                icone: "fas fa-smile"
            },
            "rico": { 
                pontos: 20, 
                multiplicador: 5, 
                descricao: "5 vezes a riqueza média",
                recursos: "Abundantes",
                icone: "fas fa-grin-stars"
            },
            "muito-rico": { 
                pontos: 30, 
                multiplicador: 20, 
                descricao: "20 vezes a riqueza média", 
                recursos: "Extremamente abundantes",
                icone: "fas fa-crown"
            },
            "podre-rico": { 
                pontos: 50, 
                multiplicador: 100, 
                descricao: "100 vezes a riqueza média",
                recursos: "Ilimitados para necessidades comuns",
                icone: "fas fa-gem"
            }
        };

        this.rendaBase = 1000; // Renda base do cenário
        this.inicializado = false;
        this.inicializar();
    }

    inicializar() {
        if (this.inicializado) return;
        
        console.log('💰 Inicializando Sistema de Riqueza...');
        this.carregarDadosSalvos();
        this.configurarEventos();
        this.atualizarDisplayRiqueza();
        this.inicializado = true;
    }

    configurarEventos() {
        const selectRiqueza = document.getElementById('nivelRiqueza');
        if (selectRiqueza) {
            selectRiqueza.addEventListener('change', () => {
                this.atualizarDisplayRiqueza();
                this.salvarDados();
                this.notificarSistemaPrincipal();
            });
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
            
            // Atualizar display
            display.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <i class="${nivel.icone}" style="color: #3498db;"></i>
                    <strong style="color: #2c3e50;">${this.obterNomePorPontos(valor)}</strong>
                </div>
                <div style="font-size: 0.9em; color: #7f8c8d;">
                    <div>Multiplicador: ${nivel.multiplicador}x | Recursos: ${nivel.recursos}</div>
                    <div style="margin-top: 4px;">${nivel.descricao}</div>
                </div>
            `;

            // Atualizar badge de pontos
            const pontosTexto = valor >= 0 ? `+${valor} pts` : `${valor} pts`;
            badge.textContent = pontosTexto;
            
            // Cor do badge baseada nos pontos
            if (valor > 0) {
                badge.style.background = '#27ae60';
            } else if (valor < 0) {
                badge.style.background = '#e74c3c';
            } else {
                badge.style.background = '#95a5a6';
            }

            // Atualizar renda mensal
            rendaElement.textContent = this.formatarMoeda(rendaMensal);
            rendaElement.style.color = valor >= 0 ? '#27ae60' : '#e74c3c';
            rendaElement.style.fontWeight = 'bold';
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
                    ultimaAtualizacao: new Date().toISOString()
                };
                localStorage.setItem('sistemaRiqueza_data', JSON.stringify(dadosParaSalvar));
            }
        } catch (error) {
            console.log('❌ Erro ao salvar dados de riqueza:', error);
        }
    }

    notificarSistemaPrincipal() {
        // Notificar o sistema principal sobre mudanças nos pontos
        if (window.sistemaCaracteristicas && typeof window.sistemaCaracteristicas.atualizarPontosTotais === 'function') {
            window.sistemaCaracteristicas.atualizarPontosTotais();
        }
        
        // Disparar evento customizado
        const evento = new CustomEvent('riquezaAlterada', {
            detail: {
                pontos: this.getPontosRiqueza(),
                nivel: this.obterNomePorPontos(this.getPontosRiqueza()),
                rendaMensal: this.getRendaMensal()
            }
        });
        document.dispatchEvent(evento);
    }

    // MÉTODOS PARA INTEGRAÇÃO
    exportarDados() {
        return {
            riqueza: {
                nivel: this.getPontosRiqueza(),
                nome: this.obterNomePorPontos(this.getPontosRiqueza()),
                multiplicador: this.obterNivelPorPontos(this.getPontosRiqueza())?.multiplicador,
                rendaMensal: this.getRendaMensal(),
                descricao: this.obterNivelPorPontos(this.getPontosRiqueza())?.descricao
            }
        };
    }

    carregarDados(dados) {
        if (dados.riqueza && dados.riqueza.nivel !== undefined) {
            const select = document.getElementById('nivelRiqueza');
            if (select) {
                select.value = dados.riqueza.nivel;
                this.atualizarDisplayRiqueza();
            }
        }
    }

    // VALIDAÇÕES
    validarRiqueza() {
        const pontos = this.getPontosRiqueza();
        const renda = this.getRendaMensal();
        return {
            valido: true,
            pontos: pontos,
            rendaMensal: renda,
            mensagem: `Riqueza: ${this.obterNomePorPontos(pontos)} (${pontos >= 0 ? '+' : ''}${pontos} pts) | Renda: ${this.formatarMoeda(renda)}`
        };
    }

    // MÉTODOS DE CONFIGURAÇÃO
    setRendaBase(novaRendaBase) {
        this.rendaBase = novaRendaBase;
        this.atualizarDisplayRiqueza();
    }

    getRendaBase() {
        return this.rendaBase;
    }
}

// INICIALIZAÇÃO E EXPORTAÇÃO
let sistemaRiqueza;

document.addEventListener('DOMContentLoaded', function() {
    sistemaRiqueza = new SistemaRiqueza();
});

// TORNAR DISPONÍVEL GLOBALMENTE
window.SistemaRiqueza = SistemaRiqueza;
window.sistemaRiqueza = sistemaRiqueza;

// Event listener para quando a aba características for carregada
document.addEventListener('caracteristicasCarregadas', function() {
    if (sistemaRiqueza) {
        sistemaRiqueza.inicializar();
    }
});
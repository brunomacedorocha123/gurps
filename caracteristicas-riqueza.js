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

        this.rendaBase = 1000;
        this.inicializado = false;
        this.ultimoPontos = 0;
        
        // Não carrega nada automaticamente - começa no padrão
        this.nivelAtual = 'medio';
        this.pontosAtuais = 0;
        
        this.inicializar();
    }

    inicializar() {
        if (this.inicializado) return;
        
        this.configurarEventos();
        this.atualizarDisplayRiqueza();
        this.inicializado = true;
        this.notificarDashboard();
    }

    configurarEventos() {
        const selectRiqueza = document.getElementById('nivelRiqueza');
        if (selectRiqueza) {
            // Configurar valor padrão (médio = 0 pontos)
            selectRiqueza.value = '0';
            
            this.handleRiquezaChange = () => {
                this.atualizarDisplayRiqueza();
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

        const valor = parseInt(select.value) || 0;
        const nivel = this.obterNivelPorPontos(valor);
        
        if (nivel) {
            const rendaMensal = this.calcularRendaMensal(valor);
            
            // Atualizar variáveis internas
            this.nivelAtual = this.obterNomePorPontos(valor);
            this.pontosAtuais = valor;
            
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

            const pontosTexto = valor >= 0 ? `+${valor} pts` : `${valor} pts`;
            badge.textContent = pontosTexto;
            badge.style.background = this.getCorPorTipo(nivel.tipo);
            badge.style.color = '#fff';

            rendaElement.textContent = this.formatarMoeda(rendaMensal);
            rendaElement.style.color = this.getCorPorTipo(nivel.tipo);
            rendaElement.style.fontWeight = 'bold';
            
            this.atualizarCardDashboard(valor, rendaMensal);
            this.ultimoPontos = valor;
        }
    }
    
    getCorPorTipo(tipo) {
        switch(tipo) {
            case 'vantagem': return '#27ae60';
            case 'desvantagem': return '#e74c3c';
            case 'neutro': return '#95a5a6';
            default: return '#ff8c00';
        }
    }
    
    atualizarCardDashboard(pontos, renda) {
        // Manter integração com dashboard/equipamentos
        const evento = new CustomEvent('riquezaAtualizada', {
            detail: {
                pontos: pontos,
                rendaMensal: renda,
                nivel: this.obterNomePorPontos(pontos)
            }
        });
        document.dispatchEvent(evento);
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

    getNivelAtual() {
        return this.nivelAtual;
    }

    notificarDashboard() {
        const pontos = this.getPontosRiqueza();
        const renda = this.getRendaMensal();
        
        const evento = new CustomEvent('riquezaPontosAtualizados', {
            detail: {
                pontos: pontos,
                valorAbsoluto: Math.abs(pontos),
                nivel: this.obterNomePorPontos(pontos),
                rendaMensal: renda,
                tipo: pontos >= 0 ? 'vantagem' : 'desvantagem'
            }
        });
        document.dispatchEvent(evento);
    }

    notificarSistemaPrincipal() {
        // Mantém a integração com outros sistemas (como equipamentos)
        if (window.sistemaCaracteristicas && typeof window.sistemaCaracteristicas.atualizarPontosTotais === 'function') {
            window.sistemaCaracteristicas.atualizarPontosTotais();
        }
        
        const evento = new CustomEvent('riquezaAlterada', {
            detail: {
                pontos: this.getPontosRiqueza(),
                nivel: this.obterNomePorPontos(this.getPontosRiqueza()),
                rendaMensal: this.getRendaMensal()
            }
        });
        document.dispatchEvent(evento);
        
        this.notificarDashboard();
    }

    // MÉTODOS PARA SUPABASE - OBRIGATÓRIOS
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
                custoPontos: Math.abs(pontos)
            }
        };
    }

    carregarDados(dados) {
        // Só carrega se tiver dados do Supabase
        if (dados && dados.riqueza && dados.riqueza.nivel !== undefined) {
            const select = document.getElementById('nivelRiqueza');
            if (select) {
                select.value = dados.riqueza.nivel;
                this.nivelAtual = dados.riqueza.nome;
                this.pontosAtuais = dados.riqueza.nivel;
                this.atualizarDisplayRiqueza();
                this.notificarDashboard();
                return true;
            }
        }
        return false; // Não tinha dados para carregar
    }

    // Método para resetar para padrão (quando não há salvamento)
    resetarParaPadrao() {
        const select = document.getElementById('nivelRiqueza');
        if (select) {
            select.value = '0'; // Médio
            this.nivelAtual = 'medio';
            this.pontosAtuais = 0;
            this.atualizarDisplayRiqueza();
            this.notificarDashboard();
        }
    }

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

    setRendaBase(novaRendaBase) {
        this.rendaBase = novaRendaBase;
        this.atualizarDisplayRiqueza();
        this.notificarDashboard();
    }

    getRendaBase() {
        return this.rendaBase;
    }
    
    forcarAtualizacao() {
        this.atualizarDisplayRiqueza();
        this.notificarDashboard();
    }
}

// INICIALIZAÇÃO
let sistemaRiqueza;

document.addEventListener('DOMContentLoaded', function() {
    // Sempre começa com valor padrão
    sistemaRiqueza = new SistemaRiqueza();
});

// Quando a aba de características for carregada
document.addEventListener('caracteristicasCarregadas', function() {
    if (!sistemaRiqueza || !sistemaRiqueza.inicializado) {
        sistemaRiqueza = new SistemaRiqueza();
    } else {
        sistemaRiqueza.forcarAtualizacao();
    }
});

// Exportar para uso global
window.SistemaRiqueza = SistemaRiqueza;
window.sistemaRiqueza = sistemaRiqueza;

// Função para inicializar manualmente
window.inicializarSistemaRiqueza = function() {
    if (!sistemaRiqueza || !sistemaRiqueza.inicializado) {
        sistemaRiqueza = new SistemaRiqueza();
    }
    return sistemaRiqueza;
};
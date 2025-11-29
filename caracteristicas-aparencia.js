// caracteristicas-aparencia.js
class SistemaAparencia {
    constructor() {
        this.niveisAparencia = {
            "horrendo": { 
                pontos: -24, 
                reacao: -6, 
                descricao: "Indescritivelmente monstruoso ou repugnante",
                icone: "fas fa-frown"
            },
            "monstruoso": { 
                pontos: -20, 
                reacao: -5, 
                descricao: "Horrível e obviamente anormal",
                icone: "fas fa-ghost"
            },
            "hediondo": { 
                pontos: -16, 
                reacao: -4, 
                descricao: "Característica repugnante na aparência",
                icone: "fas fa-meh-rolling-eyes"
            },
            "feio": { 
                pontos: -8, 
                reacao: -2, 
                descricao: "Cabelo seboso, dentes tortos, etc.",
                icone: "fas fa-meh"
            },
            "sem-atrativos": { 
                pontos: -4, 
                reacao: -1, 
                descricao: "Algo antipático, mas não específico",
                icone: "fas fa-meh-blank"
            },
            "comum": { 
                pontos: 0, 
                reacao: 0, 
                descricao: "Aparência padrão, sem modificadores",
                icone: "fas fa-user"
            },
            "atraente": { 
                pontos: 4, 
                reacao: 1, 
                descricao: "Boa aparência, +1 em testes de reação",
                icone: "fas fa-smile"
            },
            "elegante": { 
                pontos: 12, 
                reacao: { mesmoSexo: 2, outroSexo: 4 },
                descricao: "Poderia entrar em concursos de beleza",
                icone: "fas fa-grin-stars"
            },
            "muito-elegante": { 
                pontos: 16, 
                reacao: { mesmoSexo: 2, outroSexo: 6 },
                descricao: "Poderia vencer concursos de beleza",
                icone: "fas fa-crown"
            },
            "lindo": { 
                pontos: 20, 
                reacao: { mesmoSexo: 2, outroSexo: 8 },
                descricao: "Espécime ideal, aparência divina",
                icone: "fas fa-star"
            }
        };

        this.inicializado = false;
        this.inicializar();
    }

    inicializar() {
        if (this.inicializado) return;
        
        console.log('🎭 Inicializando Sistema de Aparência...');
        this.carregarDadosSalvos();
        this.configurarEventos();
        this.atualizarDisplayAparencia();
        this.inicializado = true;
    }

    configurarEventos() {
        const selectAparencia = document.getElementById('nivelAparencia');
        if (selectAparencia) {
            selectAparencia.addEventListener('change', () => {
                this.atualizarDisplayAparencia();
                this.salvarDados();
                this.notificarSistemaPrincipal();
            });
        }
    }

    atualizarDisplayAparencia() {
        const select = document.getElementById('nivelAparencia');
        const display = document.getElementById('displayAparencia');
        const badge = document.getElementById('pontosAparencia');
        
        if (!select || !display || !badge) return;

        const valor = parseInt(select.value);
        const nivel = this.obterNivelPorPontos(valor);
        
        if (nivel) {
            // Atualizar texto de reação
            let textoReacao = '';
            if (typeof nivel.reacao === 'object') {
                textoReacao = `Reação: +${nivel.reacao.outroSexo} (outro sexo), +${nivel.reacao.mesmoSexo} (mesmo sexo)`;
            } else {
                textoReacao = `Reação: ${nivel.reacao >= 0 ? '+' : ''}${nivel.reacao}`;
            }
            
            // Atualizar display
            display.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <i class="${nivel.icone}" style="color: #3498db;"></i>
                    <strong style="color: #2c3e50;">${this.obterNomePorPontos(valor)}</strong>
                </div>
                <div style="font-size: 0.9em; color: #7f8c8d;">
                    <div>${textoReacao}</div>
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
        }
    }

    obterNivelPorPontos(pontos) {
        return Object.values(this.niveisAparencia).find(nivel => nivel.pontos === pontos);
    }

    obterNomePorPontos(pontos) {
        const entry = Object.entries(this.niveisAparencia).find(([key, nivel]) => nivel.pontos === pontos);
        return entry ? this.formatarNome(entry[0]) : 'Desconhecido';
    }

    formatarNome(key) {
        return key.split('-')
            .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
            .join(' ');
    }

    getPontosAparencia() {
        const select = document.getElementById('nivelAparencia');
        return select ? parseInt(select.value) || 0 : 0;
    }

    // SISTEMA DE SALVAMENTO
    carregarDadosSalvos() {
        try {
            const dadosSalvos = localStorage.getItem('sistemaAparencia_data');
            if (dadosSalvos) {
                const dados = JSON.parse(dadosSalvos);
                const select = document.getElementById('nivelAparencia');
                if (select && dados.nivelAparencia !== undefined) {
                    select.value = dados.nivelAparencia;
                    console.log('✅ Dados de aparência carregados:', dados.nivelAparencia);
                }
            }
        } catch (error) {
            console.log('❌ Erro ao carregar dados de aparência:', error);
        }
    }

    salvarDados() {
        try {
            const select = document.getElementById('nivelAparencia');
            if (select) {
                const dadosParaSalvar = {
                    nivelAparencia: parseInt(select.value),
                    ultimaAtualizacao: new Date().toISOString()
                };
                localStorage.setItem('sistemaAparencia_data', JSON.stringify(dadosParaSalvar));
            }
        } catch (error) {
            console.log('❌ Erro ao salvar dados de aparência:', error);
        }
    }

    notificarSistemaPrincipal() {
        // Notificar o sistema principal sobre mudanças nos pontos
        if (window.sistemaCaracteristicas && typeof window.sistemaCaracteristicas.atualizarPontosTotais === 'function') {
            window.sistemaCaracteristicas.atualizarPontosTotais();
        }
        
        // Disparar evento customizado
        const evento = new CustomEvent('aparenciaAlterada', {
            detail: {
                pontos: this.getPontosAparencia(),
                nivel: this.obterNomePorPontos(this.getPontosAparencia())
            }
        });
        document.dispatchEvent(evento);
    }

    // MÉTODOS PARA INTEGRAÇÃO
    exportarDados() {
        return {
            aparencia: {
                nivel: this.getPontosAparencia(),
                nome: this.obterNomePorPontos(this.getPontosAparencia()),
                descricao: this.obterNivelPorPontos(this.getPontosAparencia())?.descricao
            }
        };
    }

    carregarDados(dados) {
        if (dados.aparencia && dados.aparencia.nivel !== undefined) {
            const select = document.getElementById('nivelAparencia');
            if (select) {
                select.value = dados.aparencia.nivel;
                this.atualizarDisplayAparencia();
            }
        }
    }

    // VALIDAÇÕES
    validarAparencia() {
        const pontos = this.getPontosAparencia();
        return {
            valido: true,
            pontos: pontos,
            mensagem: `Aparência: ${this.obterNomePorPontos(pontos)} (${pontos >= 0 ? '+' : ''}${pontos} pts)`
        };
    }
}

// INICIALIZAÇÃO E EXPORTAÇÃO
let sistemaAparencia;

document.addEventListener('DOMContentLoaded', function() {
    sistemaAparencia = new SistemaAparencia();
});

// TORNAR DISPONÍVEL GLOBALMENTE
window.SistemaAparencia = SistemaAparencia;
window.sistemaAparencia = sistemaAparencia;

// Event listener para quando a aba características for carregada
document.addEventListener('caracteristicasCarregadas', function() {
    if (sistemaAparencia) {
        sistemaAparencia.inicializar();
    }
});
class SistemaAparencia {
    constructor() {
        this.niveisAparencia = {
            "horrendo": { 
                pontos: -24, 
                reacao: -6, 
                descricao: "Indescritivelmente monstruoso ou repugnante",
                icone: "fas fa-frown",
                tipo: "desvantagem"
            },
            "monstruoso": { 
                pontos: -20, 
                reacao: -5, 
                descricao: "Horrível e obviamente anormal",
                icone: "fas fa-ghost",
                tipo: "desvantagem"
            },
            "hediondo": { 
                pontos: -16, 
                reacao: -4, 
                descricao: "Característica repugnante na aparência",
                icone: "fas fa-meh-rolling-eyes",
                tipo: "desvantagem"
            },
            "feio": { 
                pontos: -8, 
                reacao: -2, 
                descricao: "Cabelo seboso, dentes tortos, etc.",
                icone: "fas fa-meh",
                tipo: "desvantagem"
            },
            "sem-atrativos": { 
                pontos: -4, 
                reacao: -1, 
                descricao: "Algo antipático, mas não específico",
                icone: "fas fa-meh-blank",
                tipo: "desvantagem"
            },
            "comum": { 
                pontos: 0, 
                reacao: 0, 
                descricao: "Aparência padrão, sem modificadores",
                icone: "fas fa-user",
                tipo: "neutro"
            },
            "atraente": { 
                pontos: 4, 
                reacao: 1, 
                descricao: "Boa aparência, +1 em testes de reação",
                icone: "fas fa-smile",
                tipo: "vantagem"
            },
            "elegante": { 
                pontos: 12, 
                reacao: { mesmoSexo: 2, outroSexo: 4 },
                descricao: "Poderia entrar em concursos de beleza",
                icone: "fas fa-grin-stars",
                tipo: "vantagem"
            },
            "muito-elegante": { 
                pontos: 16, 
                reacao: { mesmoSexo: 2, outroSexo: 6 },
                descricao: "Poderia vencer concursos de beleza",
                icone: "fas fa-crown",
                tipo: "vantagem"
            },
            "lindo": { 
                pontos: 20, 
                reacao: { mesmoSexo: 2, outroSexo: 8 },
                descricao: "Espécime ideal, aparência divina",
                icone: "fas fa-star",
                tipo: "vantagem"
            }
        };

        this.nivelAtual = 'comum';
        this.pontosAtuais = 0;
        this.inicializado = false;
        this.inicializar();
    }

    inicializar() {
        if (this.inicializado) return;
        
        this.configurarEventos();
        this.atualizarDisplayAparencia();
        this.inicializado = true;
        this.notificarSistemaPontos();
    }

    configurarEventos() {
        const selectAparencia = document.getElementById('nivelAparencia');
        if (selectAparencia) {
            selectAparencia.addEventListener('change', (e) => {
                this.nivelAtual = this.obterNomePorPontos(parseInt(e.target.value));
                this.pontosAtuais = parseInt(e.target.value);
                this.atualizarDisplayAparencia();
                this.notificarSistemaPontos();
            });
        }
    }

    atualizarDisplayAparencia() {
        const select = document.getElementById('nivelAparencia');
        const display = document.getElementById('displayAparencia');
        const badge = document.getElementById('pontosAparencia');
        
        if (!select || !display || !badge) return;

        const valor = parseInt(select.value) || 0;
        const nivel = this.obterNivelPorPontos(valor);
        
        if (nivel) {
            let textoReacao = '';
            if (typeof nivel.reacao === 'object') {
                textoReacao = `Reação: +${nivel.reacao.outroSexo} (outro sexo), +${nivel.reacao.mesmoSexo} (mesmo sexo)`;
            } else {
                textoReacao = `Reação: ${nivel.reacao >= 0 ? '+' : ''}${nivel.reacao}`;
            }
            
            display.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <i class="${nivel.icone}" style="color: ${nivel.tipo === 'vantagem' ? '#27ae60' : nivel.tipo === 'desvantagem' ? '#e74c3c' : '#3498db'};"></i>
                    <strong style="color: #2c3e50;">${this.obterNomePorPontos(valor)}</strong>
                </div>
                <div style="font-size: 0.9em; color: #7f8c8d;">
                    <div>${textoReacao}</div>
                    <div style="margin-top: 4px;">${nivel.descricao}</div>
                </div>
            `;

            const pontosTexto = valor >= 0 ? `+${valor} pts` : `${valor} pts`;
            badge.textContent = pontosTexto;
            
            if (nivel.tipo === 'vantagem') {
                badge.style.background = '#27ae60';
                badge.style.color = '#fff';
            } else if (nivel.tipo === 'desvantagem') {
                badge.style.background = '#e74c3c';
                badge.style.color = '#fff';
            } else {
                badge.style.background = '#95a5a6';
                badge.style.color = '#fff';
            }
        }
    }

    getPontosAparencia() {
        const select = document.getElementById('nivelAparencia');
        return select ? parseInt(select.value) || 0 : 0;
    }

    getTipoPontos() {
        const pontos = this.getPontosAparencia();
        if (pontos > 0) return 'vantagem';
        if (pontos < 0) return 'desvantagem';
        return 'neutro';
    }

    notificarSistemaPontos() {
        const pontos = this.getPontosAparencia();
        const tipo = this.getTipoPontos();
        
        const evento = new CustomEvent('aparenciaPontosAtualizados', {
            detail: {
                pontos: pontos,
                tipo: tipo,
                nivel: this.obterNomePorPontos(pontos),
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(evento);
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

    exportarDados() {
        return {
            aparencia: {
                pontos: this.getPontosAparencia(),
                tipo: this.getTipoPontos(),
                nome: this.obterNomePorPontos(this.getPontosAparencia()),
                descricao: this.obterNivelPorPontos(this.getPontosAparencia())?.descricao,
                nivel: this.getPontosAparencia()
            }
        };
    }

    carregarDados(dados) {
        if (dados.aparencia && dados.aparencia.nivel !== undefined) {
            const select = document.getElementById('nivelAparencia');
            if (select) {
                select.value = dados.aparencia.nivel;
                this.nivelAtual = dados.aparencia.nome;
                this.pontosAtuais = dados.aparencia.nivel;
                this.atualizarDisplayAparencia();
                this.notificarSistemaPontos();
            }
        }
    }

    validarAparencia() {
        const pontos = this.getPontosAparencia();
        const tipo = this.getTipoPontos();
        
        return {
            valido: true,
            pontos: pontos,
            tipo: tipo,
            mensagem: `Aparência: ${this.obterNomePorPontos(pontos)} (${pontos >= 0 ? '+' : ''}${pontos} pts) - ${tipo === 'vantagem' ? 'Vantagem' : tipo === 'desvantagem' ? 'Desvantagem' : 'Neutro'}`
        };
    }
}

let sistemaAparencia;

document.addEventListener('DOMContentLoaded', function() {
    sistemaAparencia = new SistemaAparencia();
});

window.SistemaAparencia = SistemaAparencia;
window.sistemaAparencia = sistemaAparencia;

document.addEventListener('caracteristicasCarregadas', function() {
    if (sistemaAparencia) {
        sistemaAparencia.inicializar();
    }
});
// caracteristicas-fisicas.js - VERSÃO 100% COMPLETA
class SistemaCaracteristicasFisicas {
    constructor() {
        this.caracteristicas = {
            "magro": { 
                pontos: -5,
                tipo: "desvantagem",
                efeitos: "Pesa 2/3 da média para ST. -2 ST vs derrubar, -2 Disfarce. HT máxima 14.",
                pesoMultiplicador: 0.67,
                modificadores: {
                    stDerrubar: -2,
                    disfarce: -2,
                    htMaxima: 14
                },
                icone: "fas fa-person-walking",
                conflitos: ["acima-peso", "gordo", "muito-gordo"]
            },
            "acima-peso": { 
                pontos: -1,
                tipo: "desvantagem", 
                efeitos: "Pesa 130% da média. -1 Disfarce, +1 Natação, +1 ST vs derrubar.",
                pesoMultiplicador: 1.3,
                modificadores: {
                    disfarce: -1,
                    natacao: 1,
                    stDerrubar: 1
                },
                icone: "fas fa-weight-hanging",
                conflitos: ["magro", "gordo", "muito-gordo"]
            },
            "gordo": { 
                pontos: -3,
                tipo: "desvantagem",
                efeitos: "Pesa 150% da média. -2 Disfarce, +3 Natação, +2 ST vs derrubar. HT máxima 15.",
                pesoMultiplicador: 1.5,
                modificadores: {
                    disfarce: -2,
                    natacao: 3,
                    stDerrubar: 2,
                    htMaxima: 15
                },
                icone: "fas fa-weight-hanging",
                conflitos: ["magro", "acima-peso", "muito-gordo"]
            },
            "muito-gordo": { 
                pontos: -5,
                tipo: "desvantagem",
                efeitos: "Peso dobrado. -3 Disfarce, +5 Natação, +3 ST vs derrubar. HT máxima 13.",
                pesoMultiplicador: 2.0,
                modificadores: {
                    disfarce: -3,
                    natacao: 5,
                    stDerrubar: 3,
                    htMaxima: 13
                },
                icone: "fas fa-weight-hanging",
                conflitos: ["magro", "acima-peso", "gordo"]
            },
            "nanismo": { 
                pontos: -15,
                tipo: "desvantagem",
                efeitos: "MT -1, -1 Deslocamento, pernas curtas. -2 Disfarce/Perseguição. Altura abaixo do mínimo racial.",
                modificadores: {
                    tamanho: -1,
                    deslocamento: -1,
                    disfarce: -2,
                    perseguicao: -2
                },
                icone: "fas fa-arrow-down",
                conflitos: ["gigantismo"]
            },
            "gigantismo": { 
                pontos: 0,
                tipo: "vantagem",
                efeitos: "MT +1, +1 Deslocamento, pernas longas. -2 Disfarce/Perseguição. Altura acima do máximo racial.",
                modificadores: {
                    tamanho: 1,
                    deslocamento: 1,
                    disfarce: -2,
                    perseguicao: -2
                },
                icone: "fas fa-arrow-up",
                conflitos: ["nanismo"]
            }
        };

        this.caracteristicasSelecionadas = [];
        this.inicializado = false;
        this.inicializar();
    }

    inicializar() {
        if (this.inicializado) return;
        
        this.carregarDadosSalvos();
        this.configurarEventos();
        this.atualizarDisplay();
        this.inicializado = true;
    }

    configurarEventos() {
        document.querySelectorAll('.btn-add-caracteristica').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tipo = e.target.closest('.caracteristica-item').dataset.tipo;
                this.adicionarCaracteristica(tipo);
            });
        });

        this.configurarEventosBotoes();
    }

    configurarEventosBotoes() {
        document.querySelectorAll('.btn-add-caracteristica').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tipo = e.target.dataset.tipo;
                const jaSelecionada = this.caracteristicasSelecionadas.find(c => c.tipo === tipo);
                
                if (jaSelecionada) {
                    this.removerCaracteristica(jaSelecionada.id);
                } else {
                    this.adicionarCaracteristica(tipo);
                }
            });
        });
    }

    adicionarCaracteristica(tipo) {
        const caracteristica = this.caracteristicas[tipo];
        if (!caracteristica) return;

        if (this.caracteristicasSelecionadas.find(c => c.tipo === tipo)) {
            this.mostrarMensagem(`"${this.formatarNome(tipo)}" já está selecionada!`, 'aviso');
            return;
        }

        this.removerCaracteristicasConflitantes(tipo);

        const caracteristicaObj = {
            id: Date.now() + Math.random(),
            tipo: tipo,
            nome: this.formatarNome(tipo),
            pontos: caracteristica.pontos,
            efeitos: caracteristica.efeitos,
            pesoMultiplicador: caracteristica.pesoMultiplicador,
            modificadores: caracteristica.modificadores,
            icone: caracteristica.icone,
            dataAdicao: new Date()
        };

        this.caracteristicasSelecionadas.push(caracteristicaObj);
        
        this.atualizarDisplay();
        this.salvarDados();
        this.notificarAlturaPeso();
        
        this.mostrarMensagem(`"${caracteristicaObj.nome}" adicionada!`, 'sucesso');
        
        return caracteristicaObj;
    }

    removerCaracteristicasConflitantes(tipoNova) {
        const caracteristica = this.caracteristicas[tipoNova];
        if (!caracteristica || !caracteristica.conflitos) return;

        caracteristica.conflitos.forEach(tipoConflito => {
            this.removerCaracteristicaPorTipo(tipoConflito);
        });
    }

    removerCaracteristicaPorTipo(tipo) {
        const index = this.caracteristicasSelecionadas.findIndex(c => c.tipo === tipo);
        if (index !== -1) {
            this.caracteristicasSelecionadas.splice(index, 1);
        }
    }

    removerCaracteristica(id) {
        const index = this.caracteristicasSelecionadas.findIndex(c => c.id === id);
        if (index !== -1) {
            const caracteristicaRemovida = this.caracteristicasSelecionadas[index];
            this.caracteristicasSelecionadas.splice(index, 1);
            
            this.atualizarDisplay();
            this.salvarDados();
            this.notificarAlturaPeso();
            
            this.mostrarMensagem(`"${caracteristicaRemovida.nome}" removida!`, 'sucesso');
        }
    }

    notificarAlturaPeso() {
        const evento = new CustomEvent('caracteristicasFisicasAlteradas', {
            detail: {
                pontos: this.calcularPontosTotais(),
                multiplicadorPeso: this.getMultiplicadorPeso(),
                modificadores: this.getModificadores(),
                caracteristicas: this.caracteristicasSelecionadas.map(c => c.tipo),
                caracteristicasSelecionadas: this.caracteristicasSelecionadas
            }
        });
        document.dispatchEvent(evento);
        
        if (window.sistemaAlturaPeso && typeof window.sistemaAlturaPeso.atualizarDisplay === 'function') {
            window.sistemaAlturaPeso.atualizarDisplay();
        }
    }

    atualizarDisplay() {
        this.atualizarListaCaracteristicas();
        this.atualizarCaracteristicasSelecionadas();
        this.atualizarBadgePontos();
        this.atualizarBotoes();
    }

    atualizarListaCaracteristicas() {
        const container = document.querySelector('.caracteristicas-lista');
        if (!container) return;

        container.innerHTML = Object.entries(this.caracteristicas).map(([tipo, dados]) => {
            const jaSelecionada = this.caracteristicasSelecionadas.find(c => c.tipo === tipo);
            const textoBotao = jaSelecionada ? 'Remover' : 'Adicionar';
            const classeBotao = jaSelecionada ? 'btn-add-caracteristica added' : 'btn-add-caracteristica';
            
            return `
                <div class="caracteristica-item" data-tipo="${tipo}">
                    <div class="caracteristica-info">
                        <strong>${this.formatarNome(tipo)}</strong>
                        <small>${dados.pontos >= 0 ? '+' : ''}${dados.pontos} pts | ${dados.efeitos}</small>
                    </div>
                    <button class="${classeBotao}" data-tipo="${tipo}">
                        ${textoBotao}
                    </button>
                </div>
            `;
        }).join('');

        this.configurarEventosBotoes();
    }

    atualizarCaracteristicasSelecionadas() {
        const container = document.getElementById('caracteristicasSelecionadas');
        if (!container) return;

        if (this.caracteristicasSelecionadas.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: #999; padding: 20px;">
                    Nenhuma característica física selecionada
                </div>
            `;
            return;
        }

        container.innerHTML = this.caracteristicasSelecionadas.map(carac => `
            <div class="caracteristica-selecionada">
                <div>
                    <strong>${carac.nome}</strong>
                    <div class="efeitos">${carac.efeitos}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="color: ${carac.pontos >= 0 ? '#27ae60' : '#e74c3c'}; font-weight: bold;">
                        ${carac.pontos >= 0 ? '+' : ''}${carac.pontos} pts
                    </span>
                    <button onclick="sistemaCaracteristicasFisicas.removerCaracteristica(${carac.id})" 
                            style="background: #e74c3c; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }

    atualizarBadgePontos() {
        const badge = document.getElementById('pontosCaracteristicas');
        if (badge) {
            const pontos = this.calcularPontosTotais();
            badge.textContent = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
            badge.style.background = pontos > 0 ? '#27ae60' : pontos < 0 ? '#e74c3c' : '#95a5a6';
        }
    }

    atualizarBotoes() {
        document.querySelectorAll('.caracteristica-item').forEach(item => {
            const tipo = item.dataset.tipo;
            const botao = item.querySelector('.btn-add-caracteristica');
            const jaSelecionada = this.caracteristicasSelecionadas.find(c => c.tipo === tipo);
            
            if (jaSelecionada) {
                botao.textContent = 'Remover';
                botao.classList.add('added');
            } else {
                botao.textContent = 'Adicionar';
                botao.classList.remove('added');
            }
        });
    }

    calcularPontosTotais() {
        return this.caracteristicasSelecionadas.reduce((total, carac) => total + carac.pontos, 0);
    }

    getMultiplicadorPeso() {
        const caracteristicaPeso = this.caracteristicasSelecionadas.find(c => c.pesoMultiplicador);
        return caracteristicaPeso ? caracteristicaPeso.pesoMultiplicador : 1.0;
    }

    getModificadores() {
        const modificadores = {};
        
        this.caracteristicasSelecionadas.forEach(carac => {
            if (carac.modificadores) {
                Object.entries(carac.modificadores).forEach(([chave, valor]) => {
                    if (!modificadores[chave]) {
                        modificadores[chave] = 0;
                    }
                    modificadores[chave] += valor;
                });
            }
        });
        
        return modificadores;
    }

    formatarNome(key) {
        return key.split('-')
            .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
            .join(' ');
    }

    mostrarMensagem(mensagem, tipo) {
        const cores = {
            sucesso: '#27ae60',
            erro: '#e74c3c',
            aviso: '#f39c12'
        };
        
        const existingMessage = document.getElementById('caracteristicaMessage');
        if (existingMessage) existingMessage.remove();
        
        const messageDiv = document.createElement('div');
        messageDiv.id = 'caracteristicaMessage';
        messageDiv.textContent = mensagem;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            background: ${cores[tipo] || '#3498db'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) messageDiv.parentNode.removeChild(messageDiv);
        }, 3000);
    }

    carregarDadosSalvos() {
        try {
            const dadosSalvos = localStorage.getItem('sistemaCaracteristicasFisicas_data');
            if (dadosSalvos) {
                const dados = JSON.parse(dadosSalvos);
                if (dados.caracteristicasSelecionadas) {
                    this.caracteristicasSelecionadas = dados.caracteristicasSelecionadas;
                }
            }
        } catch (error) {}
    }

    salvarDados() {
        try {
            const dadosParaSalvar = {
                caracteristicasSelecionadas: this.caracteristicasSelecionadas
            };
            localStorage.setItem('sistemaCaracteristicasFisicas_data', JSON.stringify(dadosParaSalvar));
        } catch (error) {}
    }
}

let sistemaCaracteristicasFisicas;
document.addEventListener('DOMContentLoaded', function() {
    sistemaCaracteristicasFisicas = new SistemaCaracteristicasFisicas();
});
window.SistemaCaracteristicasFisicas = SistemaCaracteristicasFisicas;
window.sistemaCaracteristicasFisicas = sistemaCaracteristicasFisicas;
// caracteristicas-altura-peso.js
class SistemaAlturaPeso {
    constructor() {
        this.altura = 1.70;
        this.peso = 70;
        this.stBase = 10;
        
        // Tabelas oficiais do GURPS
        this.heightRanges = {
            6: { min: 1.30, max: 1.55, media: 1.43 },
            7: { min: 1.38, max: 1.63, media: 1.51 },
            8: { min: 1.45, max: 1.70, media: 1.58 },
            9: { min: 1.53, max: 1.78, media: 1.66 },
            10: { min: 1.58, max: 1.83, media: 1.71 },
            11: { min: 1.63, max: 1.88, media: 1.76 },
            12: { min: 1.70, max: 1.95, media: 1.83 },
            13: { min: 1.78, max: 2.03, media: 1.91 },
            14: { min: 1.85, max: 2.10, media: 1.98 }
        };

        this.weightRanges = {
            6: { min: 30, max: 60, media: 45 },
            7: { min: 37.5, max: 67.5, media: 52.5 },
            8: { min: 45, max: 75, media: 60 },
            9: { min: 52.5, max: 82.5, media: 67.5 },
            10: { min: 57.5, max: 87.5, media: 72.5 },
            11: { min: 62.5, max: 97.5, media: 80 },
            12: { min: 70, max: 110, media: 90 },
            13: { min: 77.5, max: 122.5, media: 100 },
            14: { min: 85, max: 135, media: 110 }
        };

        this.multiplicadorPeso = 1.0;
        this.inicializado = false;
        this.inicializar();
    }

    inicializar() {
        if (this.inicializado) return;
        
        console.log('📏 Inicializando Sistema de Altura e Peso...');
        this.carregarDadosSalvos();
        this.configurarEventos();
        this.configurarObservadores();
        this.calcularValoresIniciais();
        this.atualizarDisplay();
        this.inicializado = true;
    }

    configurarEventos() {
        // Eventos dos controles de altura
        const btnAlturaMenos = document.querySelector('button[onclick*="ajustarAltura(-0.01)"]');
        const btnAlturaMais = document.querySelector('button[onclick*="ajustarAltura(0.01)"]');
        const inputAltura = document.getElementById('altura');

        if (btnAlturaMenos) {
            btnAlturaMenos.onclick = () => this.ajustarAltura(-0.01);
        }
        if (btnAlturaMais) {
            btnAlturaMais.onclick = () => this.ajustarAltura(0.01);
        }
        if (inputAltura) {
            inputAltura.addEventListener('input', (e) => this.definirAltura(parseFloat(e.target.value)));
            inputAltura.addEventListener('change', (e) => this.definirAltura(parseFloat(e.target.value)));
        }

        // Eventos dos controles de peso
        const btnPesoMenos = document.querySelector('button[onclick*="ajustarPeso(-1)"]');
        const btnPesoMais = document.querySelector('button[onclick*="ajustarPeso(1)"]');
        const inputPeso = document.getElementById('peso');

        if (btnPesoMenos) {
            btnPesoMenos.onclick = () => this.ajustarPeso(-1);
        }
        if (btnPesoMais) {
            btnPesoMais.onclick = () => this.ajustarPeso(1);
        }
        if (inputPeso) {
            inputPeso.addEventListener('input', (e) => this.definirPeso(parseInt(e.target.value)));
            inputPeso.addEventListener('change', (e) => this.definirPeso(parseInt(e.target.value)));
        }
    }

    configurarObservadores() {
        // Observar mudanças no ST
        document.addEventListener('atributosAlterados', (e) => {
            if (e.detail && e.detail.ST !== undefined) {
                this.stBase = e.detail.ST;
                this.calcularValoresBase();
                this.atualizarDisplay();
            }
        });

        // Observar mudanças nas características físicas
        document.addEventListener('caracteristicasFisicasAlteradas', (e) => {
            if (e.detail && e.detail.multiplicadorPeso !== undefined) {
                this.multiplicadorPeso = e.detail.multiplicadorPeso;
                this.calcularPesoAjustado();
                this.atualizarDisplay();
            }
        });
    }

    ajustarAltura(variacao) {
        const novaAltura = this.altura + variacao;
        this.definirAltura(novaAltura);
    }

    definirAltura(novaAltura) {
        // Validar limites
        if (novaAltura < 1.30) novaAltura = 1.30;
        if (novaAltura > 2.50) novaAltura = 2.50;
        
        this.altura = parseFloat(novaAltura.toFixed(2));
        
        // Atualizar input
        const inputAltura = document.getElementById('altura');
        if (inputAltura) {
            inputAltura.value = this.altura;
        }
        
        this.calcularPesoIdeal();
        this.atualizarDisplay();
        this.salvarDados();
    }

    ajustarPeso(variacao) {
        const novoPeso = this.peso + variacao;
        this.definirPeso(novoPeso);
    }

    definirPeso(novoPeso) {
        // Validar limites
        if (novoPeso < 30) novoPeso = 30;
        if (novoPeso > 200) novoPeso = 200;
        
        this.peso = parseInt(novoPeso);
        
        // Atualizar input
        const inputPeso = document.getElementById('peso');
        if (inputPeso) {
            inputPeso.value = this.peso;
        }
        
        this.atualizarDisplay();
        this.salvarDados();
    }

    calcularValoresIniciais() {
        this.calcularValoresBase();
        this.calcularPesoIdeal();
    }

    calcularValoresBase() {
        // Encontrar a faixa do ST atual
        this.stRange = this.encontrarFaixaST(this.stBase);
        this.alturaMedia = this.stRange ? this.stRange.media : 1.70;
        this.pesoMedio = this.stRange ? this.calcularPesoMedio() : 70;
    }

    encontrarFaixaST(st) {
        for (let stValue in this.heightRanges) {
            const stNum = parseInt(stValue);
            if (st === stNum) {
                return {
                    ...this.heightRanges[stValue],
                    pesoMedia: this.weightRanges[stValue].media
                };
            }
        }
        return null;
    }

    calcularPesoMedio() {
        const range = this.weightRanges[this.stBase];
        return range ? range.media : 70;
    }

    calcularPesoIdeal() {
        // Peso ideal baseado na altura (fórmula simplificada do GURPS)
        // BMI aproximado para personagem médio
        const alturaCm = this.altura * 100;
        const bmiIdeal = 22; // BMI médio saudável
        this.pesoIdeal = Math.round((alturaCm - 100) * 0.9); // Fórmula simplificada
        
        // Ajustar pelo multiplicador das características físicas
        this.pesoAjustado = Math.round(this.pesoIdeal * this.multiplicadorPeso);
    }

    calcularPesoAjustado() {
        this.pesoAjustado = Math.round(this.pesoIdeal * this.multiplicadorPeso);
        
        // Se o peso atual estiver muito longe do ajustado, sugerir ajuste
        const diferenca = Math.abs(this.peso - this.pesoAjustado);
        if (diferenca > 10) {
            console.log(`💡 Sugestão: ajustar peso para ${this.pesoAjustado}kg (característica física)`);
        }
    }

    atualizarDisplay() {
        this.atualizarStatusAltura();
        this.atualizarStatusPeso();
        this.atualizarInfoFisica();
        this.atualizarStatusGeral();
    }

    atualizarStatusAltura() {
        const statusAltura = document.getElementById('statusAltura');
        if (!statusAltura) return;

        const diferenca = this.altura - this.alturaMedia;
        const percentual = (diferenca / this.alturaMedia) * 100;

        let status, classe;
        
        if (Math.abs(percentual) < 5) {
            status = "Na média para ST";
            classe = "normal";
        } else if (percentual > 0) {
            status = `Alto (+${Math.abs(percentual).toFixed(1)}%)`;
            classe = "acima";
        } else {
            status = `Baixo (-${Math.abs(percentual).toFixed(1)}%)`;
            classe = "abaixo";
        }

        statusAltura.innerHTML = `
            <span class="status-info ${classe}">
                ${status}
            </span>
        `;
    }

    atualizarStatusPeso() {
        const statusPeso = document.getElementById('statusPeso');
        if (!statusPeso) return;

        const diferenca = this.peso - this.pesoAjustado;
        const percentual = (diferenca / this.pesoAjustado) * 100;

        let status, classe;
        
        if (Math.abs(percentual) < 10) {
            status = "Peso adequado";
            classe = "normal";
        } else if (percentual > 0) {
            status = `Acima (+${Math.abs(percentual).toFixed(1)}%)`;
            classe = "acima";
        } else {
            status = `Abaixo (-${Math.abs(percentual).toFixed(1)}%)`;
            classe = "abaixo";
        }

        statusPeso.innerHTML = `
            <span class="status-info ${classe}">
                ${status}
            </span>
        `;
    }

    atualizarInfoFisica() {
        this.atualizarElemento('stBase', this.stBase);
        this.atualizarElemento('alturaMedia', `${this.alturaMedia.toFixed(2)}m`);
        this.atualizarElemento('pesoMedio', `${this.pesoMedio}kg`);
        this.atualizarElemento('modificadorPeso', `${this.multiplicadorPeso.toFixed(1)}x`);
    }

    atualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    }

    atualizarStatusGeral() {
        const statusFisico = document.getElementById('statusFisico');
        if (!statusFisico) return;

        // Avaliar status geral baseado na relação altura/peso
        const alturaNormal = Math.abs(this.altura - this.alturaMedia) / this.alturaMedia < 0.1;
        const pesoNormal = Math.abs(this.peso - this.pesoAjustado) / this.pesoAjustado < 0.15;

        if (alturaNormal && pesoNormal) {
            statusFisico.textContent = "Normal";
            statusFisico.style.background = "#27ae60";
        } else if (!pesoNormal) {
            statusFisico.textContent = "Ajustar Peso";
            statusFisico.style.background = "#f39c12";
        } else {
            statusFisico.textContent = "Fora da Média";
            statusFisico.style.background = "#e74c3c";
        }
    }

    sugerirAjustes() {
        const sugestoes = [];
        
        // Sugerir ajuste de peso se necessário
        const diferencaPeso = Math.abs(this.peso - this.pesoAjustado);
        if (diferencaPeso > 5) {
            sugestoes.push(`Considere ajustar o peso para ${this.pesoAjustado}kg`);
        }

        // Sugerir ajuste de altura se muito fora da média
        const diferencaAltura = Math.abs(this.altura - this.alturaMedia);
        if (diferencaAltura > 0.15) {
            sugestoes.push(`Altura sugerida para ST ${this.stBase}: ${this.alturaMedia.toFixed(2)}m`);
        }

        return sugestoes;
    }

    // SISTEMA DE SALVAMENTO
    carregarDadosSalvos() {
        try {
            const dadosSalvos = localStorage.getItem('sistemaAlturaPeso_data');
            if (dadosSalvos) {
                const dados = JSON.parse(dadosSalvos);
                if (dados.altura !== undefined) this.altura = dados.altura;
                if (dados.peso !== undefined) this.peso = dados.peso;
                
                console.log('✅ Dados de altura/peso carregados:', { altura: this.altura, peso: this.peso });
            }
        } catch (error) {
            console.log('❌ Erro ao carregar dados de altura/peso:', error);
        }
    }

    salvarDados() {
        try {
            const dadosParaSalvar = {
                altura: this.altura,
                peso: this.peso,
                stBase: this.stBase,
                ultimaAtualizacao: new Date().toISOString()
            };
            localStorage.setItem('sistemaAlturaPeso_data', JSON.stringify(dadosParaSalvar));
        } catch (error) {
            console.log('❌ Erro ao salvar dados de altura/peso:', error);
        }
    }

    notificarSistemaPrincipal() {
        const evento = new CustomEvent('alturaPesoAlterados', {
            detail: {
                altura: this.altura,
                peso: this.peso,
                stBase: this.stBase,
                alturaMedia: this.alturaMedia,
                pesoAjustado: this.pesoAjustado,
                sugestoes: this.sugerirAjustes()
            }
        });
        document.dispatchEvent(evento);
    }

    // MÉTODOS PARA INTEGRAÇÃO
    exportarDados() {
        return {
            altura: this.altura,
            peso: this.peso,
            stBase: this.stBase,
            alturaMedia: this.alturaMedia,
            pesoMedio: this.pesoMedio,
            pesoAjustado: this.pesoAjustado,
            multiplicadorPeso: this.multiplicadorPeso,
            sugestoes: this.sugerirAjustes()
        };
    }

    carregarDados(dados) {
        if (dados.altura !== undefined) this.definirAltura(dados.altura);
        if (dados.peso !== undefined) this.definirPeso(dados.peso);
        if (dados.stBase !== undefined) this.stBase = dados.stBase;
        
        this.calcularValoresBase();
        this.atualizarDisplay();
    }

    // MÉTODOS DE CONFIGURAÇÃO
    setST(novoST) {
        this.stBase = novoST;
        this.calcularValoresBase();
        this.atualizarDisplay();
    }

    setMultiplicadorPeso(multiplicador) {
        this.multiplicadorPeso = multiplicador;
        this.calcularPesoAjustado();
        this.atualizarDisplay();
    }

    // VALIDAÇÕES
    validarAlturaPeso() {
        const alturaValida = this.altura >= 1.30 && this.altura <= 2.50;
        const pesoValido = this.peso >= 30 && this.peso <= 200;
        
        return {
            valido: alturaValida && pesoValido,
            altura: this.altura,
            peso: this.peso,
            mensagem: `Altura: ${this.altura}m, Peso: ${this.peso}kg`,
            sugestoes: this.sugerirAjustes()
        };
    }

    // AUTO-AJUSTE
    autoAjustarPeso() {
        this.definirPeso(this.pesoAjustado);
        this.mostrarMensagem(`Peso ajustado automaticamente para ${this.pesoAjustado}kg`, 'sucesso');
    }

    mostrarMensagem(mensagem, tipo) {
        console.log(`${tipo.toUpperCase()}: ${mensagem}`);
        
        const cores = {
            sucesso: '#27ae60',
            erro: '#e74c3c',
            aviso: '#f39c12'
        };
        
        const existingMessage = document.getElementById('alturaPesoMessage');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.id = 'alturaPesoMessage';
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
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }
}

// INICIALIZAÇÃO E EXPORTAÇÃO
let sistemaAlturaPeso;

document.addEventListener('DOMContentLoaded', function() {
    sistemaAlturaPeso = new SistemaAlturaPeso();
});

// TORNAR DISPONÍVEL GLOBALMENTE
window.SistemaAlturaPeso = SistemaAlturaPeso;
window.sistemaAlturaPeso = sistemaAlturaPeso;

// Event listener para quando a aba características for carregada
document.addEventListener('caracteristicasCarregadas', function() {
    if (sistemaAlturaPeso) {
        sistemaAlturaPeso.inicializar();
    }
});

// Funções globais para uso no HTML
window.ajustarAltura = (variacao) => sistemaAlturaPeso.ajustarAltura(variacao);
window.ajustarPeso = (variacao) => sistemaAlturaPeso.ajustarPeso(variacao);
window.validarAlturaPeso = () => sistemaAlturaPeso.validarAlturaPeso();
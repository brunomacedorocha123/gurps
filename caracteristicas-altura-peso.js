// caracteristicas-altura-peso.js - VERSÃO LIMPA
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
    }

    inicializar() {
        if (this.inicializado) return;
        
        this.carregarDadosSalvos();
        this.configurarEventos();
        this.configurarObservadores();
        this.atualizarSTReal();
        this.calcularValoresIniciais();
        this.atualizarDisplay();
        this.inicializado = true;
    }

    configurarObservadores() {
        document.addEventListener('atributosAlterados', (e) => {
            if (e.detail && e.detail.ST !== undefined) {
                this.stBase = e.detail.ST;
                this.calcularValoresBase();
                this.atualizarDisplay();
                this.salvarDados();
            }
        });

        const inputST = document.getElementById('ST');
        if (inputST) {
            inputST.addEventListener('change', () => {
                this.atualizarSTReal();
            });
            inputST.addEventListener('input', () => {
                clearTimeout(this.stTimeout);
                this.stTimeout = setTimeout(() => {
                    this.atualizarSTReal();
                }, 500);
            });
        }

        document.addEventListener('caracteristicasFisicasAlteradas', (e) => {
            if (e.detail && e.detail.multiplicadorPeso !== undefined) {
                this.multiplicadorPeso = e.detail.multiplicadorPeso;
                this.calcularPesoAjustado();
                this.atualizarDisplay();
            }
        });

        setTimeout(() => this.atualizarSTReal(), 100);
    }

    atualizarSTReal() {
        const inputST = document.getElementById('ST');
        if (inputST && inputST.value) {
            const stValor = parseInt(inputST.value);
            if (!isNaN(stValor) && stValor !== this.stBase) {
                this.stBase = stValor;
                this.calcularValoresBase();
                this.atualizarDisplay();
                return;
            }
        }

        if (typeof obterDadosAtributos === 'function') {
            try {
                const dadosAtributos = obterDadosAtributos();
                if (dadosAtributos && dadosAtributos.ST && dadosAtributos.ST !== this.stBase) {
                    this.stBase = dadosAtributos.ST;
                    this.calcularValoresBase();
                    this.atualizarDisplay();
                }
            } catch (error) {}
        }
    }

    ajustarAltura(variacao) {
        const novaAltura = this.altura + variacao;
        this.definirAltura(novaAltura);
    }

    definirAltura(novaAltura) {
        if (novaAltura < 1.30) novaAltura = 1.30;
        if (novaAltura > 2.50) novaAltura = 2.50;
        
        this.altura = parseFloat(novaAltura.toFixed(2));
        
        const inputAltura = document.getElementById('altura');
        if (inputAltura) {
            inputAltura.value = this.altura;
        }
        
        this.calcularPesoIdeal();
        this.atualizarDisplay();
        this.salvarDados();
        this.notificarSistemaPrincipal();
    }

    ajustarPeso(variacao) {
        const novoPeso = this.peso + variacao;
        this.definirPeso(novoPeso);
    }

    definirPeso(novoPeso) {
        if (novoPeso < 30) novoPeso = 30;
        if (novoPeso > 200) novoPeso = 200;
        
        this.peso = parseInt(novoPeso);
        
        const inputPeso = document.getElementById('peso');
        if (inputPeso) {
            inputPeso.value = this.peso;
        }
        
        this.atualizarDisplay();
        this.salvarDados();
        this.notificarSistemaPrincipal();
    }

    calcularValoresIniciais() {
        this.calcularValoresBase();
        this.calcularPesoIdeal();
    }

    calcularValoresBase() {
        this.stRange = this.encontrarFaixaST(this.stBase);
        this.alturaMedia = this.stRange ? this.stRange.media : 1.70;
        this.pesoMedio = this.stRange ? this.calcularPesoMedio() : 70;
    }

    encontrarFaixaST(st) {
        if (st > 14) {
            const baseST = 14;
            const baseAltura = this.heightRanges[14].media;
            const basePeso = this.weightRanges[14].media;
            
            const alturaExtra = (st - baseST) * 0.05;
            const pesoExtra = (st - baseST) * 10;
            
            return {
                min: this.heightRanges[14].min + alturaExtra,
                max: this.heightRanges[14].max + alturaExtra,
                media: baseAltura + alturaExtra,
                pesoMedia: basePeso + pesoExtra
            };
        }
        
        if (st < 6) {
            const baseST = 6;
            const baseAltura = this.heightRanges[6].media;
            const basePeso = this.weightRanges[6].media;
            
            const alturaReducao = (baseST - st) * 0.05;
            const pesoReducao = (baseST - st) * 5;
            
            return {
                min: this.heightRanges[6].min - alturaReducao,
                max: this.heightRanges[6].max - alturaReducao,
                media: baseAltura - alturaReducao,
                pesoMedia: basePeso - pesoReducao
            };
        }
        
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
        const alturaCm = this.altura * 100;
        this.pesoIdeal = Math.round((alturaCm - 100) * 0.9);
        this.calcularPesoAjustado();
    }

    calcularPesoAjustado() {
        this.pesoAjustado = Math.round(this.pesoIdeal * this.multiplicadorPeso);
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
            status = "Na média para ST " + this.stBase;
            classe = "normal";
        } else if (percentual > 0) {
            status = `Alto (+${Math.abs(percentual).toFixed(1)}%) para ST ${this.stBase}`;
            classe = "acima";
        } else {
            status = `Baixo (-${Math.abs(percentual).toFixed(1)}%) para ST ${this.stBase}`;
            classe = "abaixo";
        }

        statusAltura.innerHTML = `<span class="status-info ${classe}">${status}</span>`;
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

        statusPeso.innerHTML = `<span class="status-info ${classe}">${status}</span>`;
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

    carregarDadosSalvos() {
        try {
            const dadosSalvos = localStorage.getItem('sistemaAlturaPeso_data');
            if (dadosSalvos) {
                const dados = JSON.parse(dadosSalvos);
                if (dados.altura !== undefined) this.altura = dados.altura;
                if (dados.peso !== undefined) this.peso = dados.peso;
                if (dados.stBase !== undefined) this.stBase = dados.stBase;
            }
        } catch (error) {}
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
        } catch (error) {}
    }

    notificarSistemaPrincipal() {
        const evento = new CustomEvent('alturaPesoAlterados', {
            detail: {
                altura: this.altura,
                peso: this.peso,
                stBase: this.stBase
            }
        });
        document.dispatchEvent(evento);
    }

    exportarDados() {
        return {
            altura: this.altura,
            peso: this.peso,
            stBase: this.stBase,
            alturaMedia: this.alturaMedia,
            pesoMedio: this.pesoMedio,
            pesoAjustado: this.pesoAjustado,
            multiplicadorPeso: this.multiplicadorPeso
        };
    }

    carregarDados(dados) {
        if (dados.altura !== undefined) this.definirAltura(dados.altura);
        if (dados.peso !== undefined) this.definirPeso(dados.peso);
        if (dados.stBase !== undefined) this.stBase = dados.stBase;
        
        this.calcularValoresBase();
        this.atualizarDisplay();
    }

    validarAlturaPeso() {
        const alturaValida = this.altura >= 1.30 && this.altura <= 2.50;
        const pesoValido = this.peso >= 30 && this.peso <= 200;
        
        return {
            valido: alturaValida && pesoValido,
            altura: this.altura,
            peso: this.peso,
            stBase: this.stBase,
            mensagem: `ST: ${this.stBase}, Altura: ${this.altura}m, Peso: ${this.peso}kg`
        };
    }
}

let sistemaAlturaPeso;

document.addEventListener('DOMContentLoaded', function() {
    sistemaAlturaPeso = new SistemaAlturaPeso();
});

window.SistemaAlturaPeso = SistemaAlturaPeso;
window.sistemaAlturaPeso = sistemaAlturaPeso;

document.addEventListener('caracteristicasCarregadas', function() {
    if (sistemaAlturaPeso) {
        sistemaAlturaPeso.inicializar();
    }
});

window.ajustarAltura = (variacao) => sistemaAlturaPeso.ajustarAltura(variacao);
window.ajustarPeso = (variacao) => sistemaAlturaPeso.ajustarPeso(variacao);
window.validarAlturaPeso = () => sistemaAlturaPeso.validarAlturaPeso();
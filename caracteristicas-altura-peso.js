// caracteristicas-altura-peso.js - VERSÃO 100% COMPLETA
class SistemaAlturaPeso {
    constructor() {
        this.altura = 1.70;
        this.peso = 70;
        this.stBase = 10;
        this.inicializado = false;

        this.alturaPorST = {
            6: { min: 1.30, max: 1.55 },
            7: { min: 1.38, max: 1.63 },
            8: { min: 1.45, max: 1.70 },
            9: { min: 1.53, max: 1.78 },
            10: { min: 1.58, max: 1.83 },
            11: { min: 1.63, max: 1.88 },
            12: { min: 1.70, max: 1.95 },
            13: { min: 1.78, max: 2.03 },
            14: { min: 1.85, max: 2.10 }
        };

        this.pesoPorST = {
            6: { min: 30, max: 60 },
            7: { min: 37.5, max: 67.5 },
            8: { min: 45.0, max: 75.0 },
            9: { min: 52.5, max: 82.5 },
            10: { min: 57.5, max: 87.5 },
            11: { min: 62.5, max: 97.5 },
            12: { min: 70.0, max: 110.0 },
            13: { min: 77.5, max: 122.5 },
            14: { min: 85.0, max: 135.0 }
        };
    }

    verificarConformidadeST() {
        const faixaAltura = this.obterFaixaAltura(this.stBase);
        const faixaPeso = this.obterFaixaPeso(this.stBase);
        
        const multiplicadorPeso = this.getMultiplicadorPeso();
        const faixaPesoAjustada = {
            min: faixaPeso.min * multiplicadorPeso,
            max: faixaPeso.max * multiplicadorPeso
        };
        
        const alturaValida = this.altura >= faixaAltura.min && this.altura <= faixaAltura.max;
        const pesoValido = this.peso >= faixaPesoAjustada.min && this.peso <= faixaPesoAjustada.max;

        return {
            alturaValida,
            pesoValido,
            faixaAltura,
            faixaPeso: faixaPesoAjustada,
            faixaPesoOriginal: faixaPeso,
            multiplicadorPeso,
            mensagemAltura: alturaValida ? 
                `Dentro da faixa para ST ${this.stBase}` : 
                this.altura < faixaAltura.min ? 
                    `Abaixo do mínimo (${faixaAltura.min}m)` :
                    `Acima do máximo (${faixaAltura.max}m)`,
            mensagemPeso: pesoValido ? 
                `Dentro da faixa ajustada para ST ${this.stBase}` : 
                this.peso < faixaPesoAjustada.min ? 
                    `Abaixo do mínimo ajustado (${faixaPesoAjustada.min.toFixed(1)}kg)` :
                    `Acima do máximo ajustado (${faixaPesoAjustada.max.toFixed(1)}kg)`
        };
    }

    getMultiplicadorPeso() {
        if (!window.sistemaCaracteristicasFisicas) return 1.0;
        const caracteristicasAtivas = window.sistemaCaracteristicasFisicas.caracteristicasSelecionadas;
        const caracteristicaPeso = caracteristicasAtivas.find(c => c.pesoMultiplicador);
        return caracteristicaPeso ? caracteristicaPeso.pesoMultiplicador : 1.0;
    }

    getCaracteristicaPesoAtiva() {
        if (!window.sistemaCaracteristicasFisicas) return null;
        const caracteristicasAtivas = window.sistemaCaracteristicasFisicas.caracteristicasSelecionadas;
        return caracteristicasAtivas.find(c => c.pesoMultiplicador);
    }

    obterFaixaAltura(st) {
        if (st >= 6 && st <= 14) return this.alturaPorST[st];
        if (st > 14) {
            const stExtra = st - 14;
            const incremento = stExtra * 0.05;
            return {
                min: (this.alturaPorST[14].min + incremento).toFixed(2),
                max: (this.alturaPorST[14].max + incremento).toFixed(2)
            };
        }
        if (st < 6) {
            const stFaltante = 6 - st;
            const decremento = stFaltante * 0.05;
            return {
                min: (this.alturaPorST[6].min - decremento).toFixed(2),
                max: (this.alturaPorST[6].max - decremento).toFixed(2)
            };
        }
        return { min: 1.30, max: 2.50 };
    }

    obterFaixaPeso(st) {
        if (st >= 6 && st <= 14) return this.pesoPorST[st];
        if (st > 14) {
            const stExtra = st - 14;
            const incremento = stExtra * 10;
            return {
                min: this.pesoPorST[14].min + incremento,
                max: this.pesoPorST[14].max + incremento
            };
        }
        if (st < 6) {
            const stFaltante = 6 - st;
            const decremento = stFaltante * 5;
            return {
                min: Math.max(20, this.pesoPorST[6].min - decremento),
                max: Math.max(25, this.pesoPorST[6].max - decremento)
            };
        }
        return { min: 30, max: 200 };
    }

    aplicarRegrasNanismo() {
        if (!this.temNanismo()) return false;
        let alteracoes = false;

        if (this.altura > 1.32) {
            this.altura = 1.32;
            alteracoes = true;
            const inputAltura = document.getElementById('altura');
            if (inputAltura) inputAltura.value = '1.32';
        }

        return alteracoes;
    }

    temNanismo() {
        if (!window.sistemaCaracteristicasFisicas) return false;
        return window.sistemaCaracteristicasFisicas.caracteristicasSelecionadas?.some(c => c.tipo === 'nanismo');
    }

    obterSTReal() {
        const inputST = document.getElementById('ST');
        if (inputST && inputST.value) {
            const st = parseInt(inputST.value);
            if (!isNaN(st) && st >= 1 && st <= 40) return st;
        }
        if (typeof obterDadosAtributos === 'function') {
            try {
                const dados = obterDadosAtributos();
                if (dados.ST && dados.ST >= 1 && dados.ST <= 40) return dados.ST;
            } catch (error) {}
        }
        return 10;
    }

    inicializar() {
        if (this.inicializado) return;
        this.carregarDadosSalvos();
        this.configurarEventos();
        this.forcarAtualizacaoST();
        this.atualizarDisplay();
        this.inicializado = true;
    }

    configurarEventos() {
        document.addEventListener('atributosAlterados', (e) => {
            if (e.detail && e.detail.ST !== undefined) this.atualizarST(e.detail.ST);
        });

        document.addEventListener('caracteristicasFisicasAlteradas', () => {
            this.aplicarRegrasNanismo();
            this.atualizarDisplay();
        });

        const inputST = document.getElementById('ST');
        if (inputST) {
            inputST.addEventListener('change', () => this.forcarAtualizacaoST());
            inputST.addEventListener('input', () => {
                clearTimeout(this.stInputTimeout);
                this.stInputTimeout = setTimeout(() => this.forcarAtualizacaoST(), 500);
            });
        }

        this.configurarEventosControles();
        this.iniciarVerificacaoPeriodica();
    }

    iniciarVerificacaoPeriodica() {
        setInterval(() => {
            const stAtual = this.obterSTReal();
            if (stAtual !== this.stBase) this.atualizarST(stAtual);
        }, 1000);
    }

    configurarEventosControles() {
        const inputAltura = document.getElementById('altura');
        const inputPeso = document.getElementById('peso');
        
        if (inputAltura) {
            inputAltura.addEventListener('change', () => {
                let novaAltura = parseFloat(inputAltura.value);
                if (this.temNanismo() && novaAltura > 1.32) {
                    novaAltura = 1.32;
                    inputAltura.value = '1.32';
                }
                this.definirAltura(novaAltura);
            });
        }
        
        if (inputPeso) {
            inputPeso.addEventListener('change', () => {
                this.definirPeso(parseInt(inputPeso.value));
            });
        }
    }

    atualizarST(novoST) {
        if (novoST === this.stBase) return;
        this.stBase = novoST;
        this.aplicarRegrasNanismo();
        this.atualizarDisplay();
        this.salvarDados();
    }

    forcarAtualizacaoST() {
        const stReal = this.obterSTReal();
        if (stReal !== this.stBase) this.atualizarST(stReal);
    }

    ajustarAltura(variacao) {
        let novaAltura = this.altura + variacao;
        if (this.temNanismo() && novaAltura > 1.32) novaAltura = 1.32;
        if (novaAltura < 1.20) novaAltura = 1.20;
        if (novaAltura > 2.50) novaAltura = 2.50;
        this.definirAltura(novaAltura);
    }

    definirAltura(novaAltura) {
        this.altura = parseFloat(novaAltura.toFixed(2));
        const inputAltura = document.getElementById('altura');
        if (inputAltura) inputAltura.value = this.altura;
        this.atualizarDisplay();
        this.salvarDados();
    }

    ajustarPeso(variacao) {
        let novoPeso = this.peso + variacao;
        if (novoPeso < 20) novoPeso = 20;
        if (novoPeso > 200) novoPeso = 200;
        this.definirPeso(novoPeso);
    }

    definirPeso(novoPeso) {
        this.peso = parseInt(novoPeso);
        const inputPeso = document.getElementById('peso');
        if (inputPeso) inputPeso.value = this.peso;
        this.atualizarDisplay();
        this.salvarDados();
    }

    atualizarDisplay() {
        const conformidade = this.verificarConformidadeST();
        const temNanismo = this.temNanismo();
        const caracteristicaPeso = this.getCaracteristicaPesoAtiva();
        
        this.atualizarStatusAltura(conformidade, temNanismo);
        this.atualizarStatusPeso(conformidade, temNanismo, caracteristicaPeso);
        this.atualizarInfoFisica(conformidade, temNanismo, caracteristicaPeso);
        this.atualizarStatusGeral(conformidade, temNanismo);
    }

    atualizarStatusAltura(conformidade, temNanismo) {
        const statusAltura = document.getElementById('statusAltura');
        if (!statusAltura) return;

        let status, classe;
        if (temNanismo) {
            status = "Nanismo: Altura 1.32m";
            classe = "abaixo";
        } else {
            status = conformidade.mensagemAltura;
            classe = conformidade.alturaValida ? "normal" : 
                    this.altura < conformidade.faixaAltura.min ? "abaixo" : "acima";
        }
        statusAltura.innerHTML = `<span class="status-info ${classe}">${status}</span>`;
    }

    atualizarStatusPeso(conformidade, temNanismo, caracteristicaPeso) {
        const statusPeso = document.getElementById('statusPeso');
        if (!statusPeso) return;

        let status, classe;
        if (temNanismo) {
            status = "Nanismo: Peso livre";
            classe = "normal";
        } else if (caracteristicaPeso) {
            status = `${caracteristicaPeso.nome}: ${conformidade.mensagemPeso}`;
            classe = conformidade.pesoValido ? "normal" : 
                    this.peso < conformidade.faixaPeso.min ? "abaixo" : "acima";
        } else {
            status = conformidade.mensagemPeso;
            classe = conformidade.pesoValido ? "normal" : 
                    this.peso < conformidade.faixaPeso.min ? "abaixo" : "acima";
        }
        statusPeso.innerHTML = `<span class="status-info ${classe}">${status}</span>`;
    }

    atualizarInfoFisica(conformidade, temNanismo, caracteristicaPeso) {
        this.atualizarElemento('stBase', this.stBase);
        
        this.atualizarElemento('alturaFaixa', 
            temNanismo ? '1.32m (Nanismo)' : 
            `${conformidade.faixaAltura.min}m - ${conformidade.faixaAltura.max}m`);
        
        if (caracteristicaPeso) {
            const multiplicador = caracteristicaPeso.pesoMultiplicador;
            const faixaOriginal = conformidade.faixaPesoOriginal;
            this.atualizarElemento('pesoFaixa', 
                `${(faixaOriginal.min * multiplicador).toFixed(1)}kg - ${(faixaOriginal.max * multiplicador).toFixed(1)}kg (${caracteristicaPeso.nome})`);
        } else {
            this.atualizarElemento('pesoFaixa', 
                `${conformidade.faixaPesoOriginal.min}kg - ${conformidade.faixaPesoOriginal.max}kg`);
        }
        
        if (temNanismo) {
            this.atualizarElemento('modificadorPeso', 'Nanismo Ativo');
        } else if (caracteristicaPeso) {
            this.atualizarElemento('modificadorPeso', `${caracteristicaPeso.nome} (${caracteristicaPeso.pesoMultiplicador}x)`);
        } else {
            this.atualizarElemento('modificadorPeso', 
                (conformidade.alturaValida && conformidade.pesoValido) ? 'Dentro da faixa' : 'Fora da faixa');
        }
    }

    atualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = valor;
    }

    atualizarStatusGeral(conformidade, temNanismo) {
        const statusFisico = document.getElementById('statusFisico');
        if (!statusFisico) return;

        if (temNanismo) {
            statusFisico.textContent = "Nanismo";
            statusFisico.style.background = "#e74c3c";
        } else if (conformidade.alturaValida && conformidade.pesoValido) {
            statusFisico.textContent = "Normal";
            statusFisico.style.background = "#27ae60";
        } else {
            statusFisico.textContent = "Fora da Faixa";
            statusFisico.style.background = "#f39c12";
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
                stBase: this.stBase
            };
            localStorage.setItem('sistemaAlturaPeso_data', JSON.stringify(dadosParaSalvar));
        } catch (error) {}
    }
}

let sistemaAlturaPeso;
document.addEventListener('DOMContentLoaded', function() {
    sistemaAlturaPeso = new SistemaAlturaPeso();
});
window.SistemaAlturaPeso = SistemaAlturaPeso;
window.sistemaAlturaPeso = sistemaAlturaPeso;
window.ajustarAltura = (v) => sistemaAlturaPeso?.ajustarAltura(v);
window.ajustarPeso = (v) => sistemaAlturaPeso?.ajustarPeso(v);
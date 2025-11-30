// caracteristicas-altura-peso.js - VERSÃO COMPLETA COM DESVANTAGENS
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

    // === MÉTODOS PARA DESVANTAGENS ATIVAS ===
    obterMultiplicadoresCaracteristicas() {
        if (!window.sistemaCaracteristicasFisicas) {
            return { 
                multiplicadorPeso: 1.0, 
                alturaLimitada: null, 
                caracteristicasAtivas: []
            };
        }
        
        const caracteristicas = window.sistemaCaracteristicasFisicas.caracteristicasSelecionadas;
        let multiplicadorPeso = 1.0;
        let alturaLimitada = null;
        const caracteristicasAtivas = [];

        // Processar cada característica
        caracteristicas.forEach(carac => {
            caracteristicasAtivas.push(carac);
            
            switch(carac.tipo) {
                case 'magro':
                    multiplicadorPeso = 0.67;
                    break;
                case 'acima-peso':
                    multiplicadorPeso = 1.3;
                    break;
                case 'gordo':
                    multiplicadorPeso = 1.5;
                    break;
                case 'muito-gordo':
                    multiplicadorPeso = 2.0;
                    break;
                case 'nanismo':
                    alturaLimitada = 1.32;
                    break;
            }
        });

        return {
            multiplicadorPeso,
            alturaLimitada,
            caracteristicasAtivas
        };
    }

    aplicarLimitesAltura() {
        const regras = this.obterMultiplicadoresCaracteristicas();
        
        if (regras.alturaLimitada && this.altura > regras.alturaLimitada) {
            this.altura = regras.alturaLimitada;
            const inputAltura = document.getElementById('altura');
            if (inputAltura) inputAltura.value = this.altura.toFixed(2);
            return true;
        }
        
        return false;
    }

    obterFaixaPesoAjustada(st) {
        const faixaOriginal = this.obterFaixaPeso(st);
        const regras = this.obterMultiplicadoresCaracteristicas();
        
        return {
            min: faixaOriginal.min * regras.multiplicadorPeso,
            max: faixaOriginal.max * regras.multiplicadorPeso,
            original: faixaOriginal,
            multiplicador: regras.multiplicadorPeso,
            caracteristicasAtivas: regras.caracteristicasAtivas
        };
    }

    atualizarDesvantagensAtivas() {
        const container = document.getElementById('desvantagensAtivas');
        const lista = document.getElementById('listaDesvantagens');
        
        if (!container || !lista) return;
        
        if (!window.sistemaCaracteristicasFisicas || 
            !window.sistemaCaracteristicasFisicas.caracteristicasSelecionadas ||
            window.sistemaCaracteristicasFisicas.caracteristicasSelecionadas.length === 0) {
            
            container.style.display = 'none';
            return;
        }
        
        const caracteristicas = window.sistemaCaracteristicasFisicas.caracteristicasSelecionadas;
        
        // Mostrar container
        container.style.display = 'block';
        
        // Gerar lista de desvantagens
        lista.innerHTML = caracteristicas.map(carac => {
            let icone, descricao, efeito;
            
            switch(carac.tipo) {
                case 'magro':
                    icone = '⚖️';
                    descricao = 'Magro';
                    efeito = 'Peso = 2/3 do normal (×0.67)';
                    break;
                case 'acima-peso':
                    icone = '⚖️';
                    descricao = 'Acima do Peso';
                    efeito = 'Peso = 130% do normal (×1.3)';
                    break;
                case 'gordo':
                    icone = '⚖️';
                    descricao = 'Gordo';
                    efeito = 'Peso = 150% do normal (×1.5)';
                    break;
                case 'muito-gordo':
                    icone = '⚖️';
                    descricao = 'Muito Gordo';
                    efeito = 'Peso = 200% do normal (×2.0)';
                    break;
                case 'nanismo':
                    icone = '📏';
                    descricao = 'Nanismo';
                    efeito = 'Altura máxima: 1.32m';
                    break;
                case 'gigantismo':
                    icone = '📏';
                    descricao = 'Gigantismo';
                    efeito = 'Altura acima do máximo racial';
                    break;
                default:
                    icone = '🔹';
                    descricao = carac.nome;
                    efeito = carac.efeitos;
            }
            
            return `
                <div class="desvantagem-item">
                    <div class="desvantagem-icone">${icone}</div>
                    <div class="desvantagem-info">
                        <strong>${descricao}</strong>
                        <small>${efeito}</small>
                    </div>
                    <div class="desvantagem-pontos">
                        ${carac.pontos >= 0 ? '+' : ''}${carac.pontos}
                    </div>
                </div>
            `;
        }).join('');
    }

    // === MÉTODOS EXISTENTES ATUALIZADOS ===
    verificarConformidadeST() {
        const faixaAltura = this.obterFaixaAltura(this.stBase);
        const faixaPesoAjustada = this.obterFaixaPesoAjustada(this.stBase);
        const regras = this.obterMultiplicadoresCaracteristicas();
        
        const alturaValida = regras.alturaLimitada ? 
            this.altura <= regras.alturaLimitada : 
            this.altura >= faixaAltura.min && this.altura <= faixaAltura.max;
            
        const pesoValido = this.peso >= faixaPesoAjustada.min && this.peso <= faixaPesoAjustada.max;

        let mensagemAltura, mensagemPeso;

        if (regras.alturaLimitada) {
            mensagemAltura = `Nanismo: Altura ${this.altura}m`;
        } else {
            mensagemAltura = alturaValida ? 
                `Dentro da faixa para ST ${this.stBase}` : 
                this.altura < faixaAltura.min ? 
                    `Abaixo do mínimo (${faixaAltura.min}m)` :
                    `Acima do máximo (${faixaAltura.max}m)`;
        }

        if (regras.caracteristicasAtivas.length > 0 && regras.multiplicadorPeso !== 1.0) {
            const nomeCarac = regras.caracteristicasAtivas[0].nome;
            mensagemPeso = pesoValido ? 
                `${nomeCarac}: Dentro da faixa` : 
                this.peso < faixaPesoAjustada.min ? 
                    `${nomeCarac}: Abaixo do mínimo (${faixaPesoAjustada.min.toFixed(1)}kg)` :
                    `${nomeCarac}: Acima do máximo (${faixaPesoAjustada.max.toFixed(1)}kg)`;
        } else {
            mensagemPeso = pesoValido ? 
                `Dentro da faixa para ST ${this.stBase}` : 
                this.peso < faixaPesoAjustada.min ? 
                    `Abaixo do mínimo (${faixaPesoAjustada.min.toFixed(1)}kg)` :
                    `Acima do máximo (${faixaPesoAjustada.max.toFixed(1)}kg)`;
        }

        return {
            alturaValida,
            pesoValido,
            faixaAltura,
            faixaPeso: faixaPesoAjustada,
            faixaPesoOriginal: faixaPesoAjustada.original,
            multiplicadorPeso: regras.multiplicadorPeso,
            caracteristicasAtivas: regras.caracteristicasAtivas,
            mensagemAltura,
            mensagemPeso
        };
    }

    obterFaixaAltura(st) {
        if (st >= 6 && st <= 14) {
            return this.alturaPorST[st];
        }
        
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
        if (st >= 6 && st <= 14) {
            return this.pesoPorST[st];
        }
        
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
        this.aplicarLimitesAltura();
        this.atualizarDisplay();
        this.inicializado = true;
    }

    configurarEventos() {
        document.addEventListener('atributosAlterados', (e) => {
            if (e.detail && e.detail.ST !== undefined) {
                this.atualizarST(e.detail.ST);
            }
        });

        document.addEventListener('caracteristicasFisicasAlteradas', () => {
            this.aplicarLimitesAltura();
            this.atualizarDisplay();
        });

        const inputST = document.getElementById('ST');
        if (inputST) {
            inputST.addEventListener('change', () => {
                this.forcarAtualizacaoST();
            });
            
            inputST.addEventListener('input', () => {
                clearTimeout(this.stInputTimeout);
                this.stInputTimeout = setTimeout(() => {
                    this.forcarAtualizacaoST();
                }, 500);
            });
        }

        this.configurarEventosControles();
        this.iniciarVerificacaoPeriodica();
    }

    configurarEventosControles() {
        const inputAltura = document.getElementById('altura');
        const inputPeso = document.getElementById('peso');
        
        if (inputAltura) {
            inputAltura.addEventListener('change', () => {
                let novaAltura = parseFloat(inputAltura.value);
                
                const regras = this.obterMultiplicadoresCaracteristicas();
                if (regras.alturaLimitada && novaAltura > regras.alturaLimitada) {
                    novaAltura = regras.alturaLimitada;
                    inputAltura.value = novaAltura.toFixed(2);
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

    atualizarDisplay() {
        const conformidade = this.verificarConformidadeST();
        const regras = this.obterMultiplicadoresCaracteristicas();
        
        this.atualizarStatusAltura(conformidade, regras);
        this.atualizarStatusPeso(conformidade, regras);
        this.atualizarInfoFisica(conformidade, regras);
        this.atualizarStatusGeral(conformidade, regras);
        this.atualizarDesvantagensAtivas(); // NOVO: Atualizar desvantagens
    }

    atualizarStatusAltura(conformidade, regras) {
        const statusAltura = document.getElementById('statusAltura');
        if (!statusAltura) return;

        let status, classe;
        
        if (regras.alturaLimitada) {
            status = `Nanismo: Altura ${this.altura}m`;
            classe = "abaixo";
        } else {
            status = conformidade.mensagemAltura;
            classe = conformidade.alturaValida ? "normal" : 
                    this.altura < conformidade.faixaAltura.min ? "abaixo" : "acima";
        }

        statusAltura.innerHTML = `<span class="status-info ${classe}">${status}</span>`;
    }

    atualizarStatusPeso(conformidade, regras) {
        const statusPeso = document.getElementById('statusPeso');
        if (!statusPeso) return;

        let status, classe;
        
        if (regras.caracteristicasAtivas.length > 0 && regras.multiplicadorPeso !== 1.0) {
            status = conformidade.mensagemPeso;
            classe = conformidade.pesoValido ? "normal" : 
                    this.peso < conformidade.faixaPeso.min ? "abaixo" : "acima";
        } else {
            status = conformidade.mensagemPeso;
            classe = conformidade.pesoValido ? "normal" : 
                    this.peso < conformidade.faixaPeso.min ? "abaixo" : "acima";
        }

        statusPeso.innerHTML = `<span class="status-info ${classe}">${status}</span>`;
    }

    atualizarInfoFisica(conformidade, regras) {
        this.atualizarElemento('stBase', this.stBase);
        
        if (regras.alturaLimitada) {
            this.atualizarElemento('alturaFaixa', `1.32m (Nanismo)`);
        } else {
            this.atualizarElemento('alturaFaixa', 
                `${conformidade.faixaAltura.min}m - ${conformidade.faixaAltura.max}m`);
        }
        
        if (regras.caracteristicasAtivas.length > 0 && regras.multiplicadorPeso !== 1.0) {
            const nome = regras.caracteristicasAtivas[0].nome;
            this.atualizarElemento('pesoFaixa', 
                `${conformidade.faixaPeso.min.toFixed(1)}kg - ${conformidade.faixaPeso.max.toFixed(1)}kg (${nome})`);
        } else {
            this.atualizarElemento('pesoFaixa', 
                `${conformidade.faixaPesoOriginal.min}kg - ${conformidade.faixaPesoOriginal.max}kg`);
        }
        
        if (regras.alturaLimitada) {
            this.atualizarElemento('modificadorPeso', 'Nanismo Ativo');
        } else if (regras.caracteristicasAtivas.length > 0 && regras.multiplicadorPeso !== 1.0) {
            this.atualizarElemento('modificadorPeso', 
                `${regras.caracteristicasAtivas[0].nome} (${regras.multiplicadorPeso}x)`);
        } else {
            this.atualizarElemento('modificadorPeso', 
                (conformidade.alturaValida && conformidade.pesoValido) ? 'Dentro da faixa' : 'Fora da faixa');
        }
    }

    atualizarStatusGeral(conformidade, regras) {
        const statusFisico = document.getElementById('statusFisico');
        if (!statusFisico) return;

        if (regras.alturaLimitada) {
            statusFisico.textContent = "Nanismo";
            statusFisico.style.background = "#e74c3c";
        } else if (regras.caracteristicasAtivas.length > 0 && regras.multiplicadorPeso !== 1.0) {
            statusFisico.textContent = regras.caracteristicasAtivas[0].nome;
            statusFisico.style.background = "#f39c12";
        } else if (conformidade.alturaValida && conformidade.pesoValido) {
            statusFisico.textContent = "Normal";
            statusFisico.style.background = "#27ae60";
        } else {
            statusFisico.textContent = "Fora da Faixa";
            statusFisico.style.background = "#f39c12";
        }
    }

    atualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = valor;
    }

    iniciarVerificacaoPeriodica() {
        setInterval(() => {
            const stAtual = this.obterSTReal();
            if (stAtual !== this.stBase) {
                this.atualizarST(stAtual);
            }
        }, 1000);
    }

    atualizarST(novoST) {
        if (novoST === this.stBase) return;
        
        this.stBase = novoST;
        this.aplicarLimitesAltura();
        this.atualizarDisplay();
        this.salvarDados();
    }

    forcarAtualizacaoST() {
        const stReal = this.obterSTReal();
        if (stReal !== this.stBase) {
            this.atualizarST(stReal);
        }
    }

    ajustarAltura(variacao) {
        let novaAltura = this.altura + variacao;
        
        const regras = this.obterMultiplicadoresCaracteristicas();
        if (regras.alturaLimitada && novaAltura > regras.alturaLimitada) {
            novaAltura = regras.alturaLimitada;
        }
        
        if (novaAltura < 1.20) novaAltura = 1.20;
        if (novaAltura > 2.50) novaAltura = 2.50;
        
        this.definirAltura(novaAltura);
    }

    definirAltura(novaAltura) {
        this.altura = parseFloat(novaAltura.toFixed(2));
        
        const inputAltura = document.getElementById('altura');
        if (inputAltura) {
            inputAltura.value = this.altura;
        }
        
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
        if (inputPeso) {
            inputPeso.value = this.peso;
        }
        
        this.atualizarDisplay();
        this.salvarDados();
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

// === INICIALIZAÇÃO GLOBAL ===
let sistemaAlturaPeso;

document.addEventListener('DOMContentLoaded', function() {
    sistemaAlturaPeso = new SistemaAlturaPeso();
    
    const caracteristicasTab = document.getElementById('caracteristicas');
    if (caracteristicasTab && caracteristicasTab.classList.contains('active')) {
        setTimeout(() => {
            sistemaAlturaPeso.inicializar();
        }, 100);
    }
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'caracteristicas' && tab.classList.contains('active')) {
                    setTimeout(() => {
                        if (!sistemaAlturaPeso.inicializado) {
                            sistemaAlturaPeso.inicializar();
                        }
                    }, 100);
                }
            }
        });
    });
    
    document.querySelectorAll('.tab-content').forEach(tab => {
        observer.observe(tab, { attributes: true });
    });
});

window.SistemaAlturaPeso = SistemaAlturaPeso;
window.sistemaAlturaPeso = sistemaAlturaPeso;

window.ajustarAltura = (variacao) => {
    if (sistemaAlturaPeso) {
        sistemaAlturaPeso.ajustarAltura(variacao);
    }
};

window.ajustarPeso = (variacao) => {
    if (sistemaAlturaPeso) {
        sistemaAlturaPeso.ajustarPeso(variacao);
    }
};
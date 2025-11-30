// caracteristicas-altura-peso.js - VERSÃO COMPLETA COM ATUALIZAÇÃO VISUAL
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

    // 🔧 NOVOS MÉTODOS PARA ATUALIZAÇÃO VISUAL
    forcarRenderizacaoVisual() {
        console.log("🎨 Forçando renderização visual completa");
        
        // 1. Atualizar todos os elementos
        this.atualizarDisplay();
        
        // 2. Forçar visibilidade das desvantagens
        this.atualizarVisibilidadeDesvantagens();
    }

    atualizarVisibilidadeDesvantagens() {
        const container = document.getElementById('desvantagensAtivas');
        const caracteristicas = this.obterCaracteristicasAtivas();
        
        if (!container) return;
        
        if (caracteristicas.length > 0) {
            container.style.display = 'block';
            // Animação suave
            container.style.opacity = '1';
            container.style.transition = 'all 0.3s ease';
        } else {
            container.style.display = 'none';
        }
    }

    forcarAtualizacaoDOM() {
        // Truque para forçar reflow/repaint
        const element = document.getElementById('statusFisico');
        if (element) {
            void element.offsetWidth;
        }
    }

    // MÉTODO SIMPLIFICADO PARA OBTER CARACTERÍSTICAS
    obterCaracteristicasAtivas() {
        // ✅ BUSCAR DA PONTE GLOBAL
        if (window.ponteCaracteristicas) {
            return window.ponteCaracteristicas.obterCaracteristicasAtivas();
        }
        return [];
    }

    obterMultiplicadorPeso() {
        const caracteristicas = this.obterCaracteristicasAtivas();
        if (caracteristicas.length === 0) return 1.0;
        
        const caracteristica = caracteristicas[0];
        switch(caracteristica.tipo) {
            case 'magro': return 0.67;
            case 'acima-peso': return 1.3;
            case 'gordo': return 1.5;
            case 'muito-gordo': return 2.0;
            default: return 1.0;
        }
    }

    temNanismo() {
        const caracteristicas = this.obterCaracteristicasAtivas();
        return caracteristicas.some(c => c.tipo === 'nanismo');
    }

    aplicarLimitesAltura() {
        if (this.temNanismo() && this.altura > 1.32) {
            this.altura = 1.32;
            const inputAltura = document.getElementById('altura');
            if (inputAltura) inputAltura.value = '1.32';
            return true;
        }
        return false;
    }

    verificarConformidadeST() {
        const faixaAltura = this.obterFaixaAltura(this.stBase);
        const faixaPeso = this.obterFaixaPeso(this.stBase);
        const multiplicador = this.obterMultiplicadorPeso();
        const caracteristicas = this.obterCaracteristicasAtivas();
        const temNanismo = this.temNanismo();
        
        const faixaPesoAjustada = {
            min: faixaPeso.min * multiplicador,
            max: faixaPeso.max * multiplicador
        };
        
        const alturaValida = temNanismo ? this.altura <= 1.32 : 
                            this.altura >= faixaAltura.min && this.altura <= faixaAltura.max;
        const pesoValido = this.peso >= faixaPesoAjustada.min && this.peso <= faixaPesoAjustada.max;

        const caracteristicaAtiva = caracteristicas.length > 0 ? caracteristicas[0] : null;

        return {
            alturaValida,
            pesoValido,
            faixaAltura,
            faixaPeso: faixaPesoAjustada,
            faixaPesoOriginal: faixaPeso,
            multiplicadorPeso: multiplicador,
            caracteristicaAtiva,
            temNanismo,
            dentroDaFaixa: alturaValida && pesoValido
        };
    }

    atualizarDisplay() {
        const conformidade = this.verificarConformidadeST();
        
        console.log("🎯 Altura/Peso - Display atualizado:", conformidade);
        
        this.atualizarStatusGeral(conformidade);
        this.atualizarStatusAltura(conformidade);
        this.atualizarStatusPeso(conformidade);
        this.atualizarInfoFisica(conformidade);
        this.atualizarDesvantagensAtivas();
        
        // ✅ Garantir que o DOM foi atualizado
        this.forcarAtualizacaoDOM();
    }

    atualizarStatusGeral(conformidade) {
        const statusFisico = document.getElementById('statusFisico');
        if (!statusFisico) return;

        if (conformidade.temNanismo) {
            statusFisico.textContent = "Nanismo";
            statusFisico.style.background = "#e74c3c";
        } else if (conformidade.caracteristicaAtiva) {
            statusFisico.textContent = conformidade.caracteristicaAtiva.nome;
            statusFisico.style.background = "#f39c12";
        } else if (conformidade.dentroDaFaixa) {
            statusFisico.textContent = "Normal";
            statusFisico.style.background = "#27ae60";
        } else {
            statusFisico.textContent = "Fora da Faixa";
            statusFisico.style.background = "#f39c12";
        }
    }

    atualizarStatusAltura(conformidade) {
        const statusAltura = document.getElementById('statusAltura');
        if (!statusAltura) return;

        let status, classe;
        
        if (conformidade.temNanismo) {
            status = `Nanismo: Altura ${this.altura}m`;
            classe = "abaixo";
        } else {
            status = conformidade.alturaValida ? 
                `Dentro da faixa para ST ${this.stBase}` : 
                this.altura < conformidade.faixaAltura.min ? 
                    `Abaixo do mínimo (${conformidade.faixaAltura.min}m)` :
                    `Acima do máximo (${conformidade.faixaAltura.max}m)`;
            classe = conformidade.alturaValida ? "normal" : "abaixo";
        }

        statusAltura.innerHTML = `<span class="status-info ${classe}">${status}</span>`;
    }

    atualizarStatusPeso(conformidade) {
        const statusPeso = document.getElementById('statusPeso');
        if (!statusPeso) return;

        let status, classe;
        
        if (conformidade.caracteristicaAtiva && conformidade.multiplicadorPeso !== 1.0) {
            const nomeCarac = conformidade.caracteristicaAtiva.nome;
            status = conformidade.pesoValido ? 
                `${nomeCarac}: Dentro da faixa` : 
                this.peso < conformidade.faixaPeso.min ? 
                    `${nomeCarac}: Abaixo do mínimo (${conformidade.faixaPeso.min.toFixed(1)}kg)` :
                    `${nomeCarac}: Acima do máximo (${conformidade.faixaPeso.max.toFixed(1)}kg)`;
            classe = conformidade.pesoValido ? "normal" : "abaixo";
        } else {
            status = conformidade.pesoValido ? 
                `Dentro da faixa para ST ${this.stBase}` : 
                this.peso < conformidade.faixaPeso.min ? 
                    `Abaixo do mínimo (${conformidade.faixaPeso.min.toFixed(1)}kg)` :
                    `Acima do máximo (${conformidade.faixaPeso.max.toFixed(1)}kg)`;
            classe = conformidade.pesoValido ? "normal" : "abaixo";
        }

        statusPeso.innerHTML = `<span class="status-info ${classe}">${status}</span>`;
    }

    atualizarInfoFisica(conformidade) {
        this.atualizarElemento('stBase', this.stBase);
        
        if (conformidade.temNanismo) {
            this.atualizarElemento('alturaFaixa', `1.32m (Nanismo)`);
        } else {
            this.atualizarElemento('alturaFaixa', 
                `${conformidade.faixaAltura.min}m - ${conformidade.faixaAltura.max}m`);
        }
        
        if (conformidade.caracteristicaAtiva && conformidade.multiplicadorPeso !== 1.0) {
            const nome = conformidade.caracteristicaAtiva.nome;
            this.atualizarElemento('pesoFaixa', 
                `${conformidade.faixaPeso.min.toFixed(1)}kg - ${conformidade.faixaPeso.max.toFixed(1)}kg (${nome})`);
        } else {
            this.atualizarElemento('pesoFaixa', 
                `${conformidade.faixaPesoOriginal.min}kg - ${conformidade.faixaPesoOriginal.max}kg`);
        }
        
        if (conformidade.temNanismo) {
            this.atualizarElemento('modificadorPeso', 'Nanismo Ativo');
        } else if (conformidade.caracteristicaAtiva && conformidade.multiplicadorPeso !== 1.0) {
            this.atualizarElemento('modificadorPeso', 
                `${conformidade.caracteristicaAtiva.nome} (${conformidade.multiplicadorPeso}x)`);
        } else {
            this.atualizarElemento('modificadorPeso', 
                conformidade.dentroDaFaixa ? 'Dentro da faixa' : 'Fora da faixa');
        }
    }

    atualizarDesvantagensAtivas() {
        const container = document.getElementById('desvantagensAtivas');
        const lista = document.getElementById('listaDesvantagens');
        
        if (!container || !lista) return;
        
        const caracteristicas = this.obterCaracteristicasAtivas();
        
        if (caracteristicas.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'block';
        
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
        
        if (this.temNanismo() && novaAltura > 1.32) {
            novaAltura = 1.32;
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
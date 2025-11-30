// caracteristicas-altura-peso.js - VERSÃO OFICIAL GURPS
class SistemaAlturaPeso {
    constructor() {
        this.altura = 1.70;
        this.peso = 70;
        this.stBase = 10;
        this.inicializado = false;

        // TABELAS OFICIAIS DO GURPS - ALTURA EM METROS
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

        // TABELAS OFICIAIS DO GURPS - PESO EM KG
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

    // MÉTODO PRINCIPAL: Verificar se altura/peso estão dentro da faixa do ST
    verificarConformidadeST() {
        const faixaAltura = this.obterFaixaAltura(this.stBase);
        const faixaPeso = this.obterFaixaPeso(this.stBase);
        
        const alturaValida = this.altura >= faixaAltura.min && this.altura <= faixaAltura.max;
        const pesoValido = this.peso >= faixaPeso.min && this.peso <= faixaPeso.max;

        return {
            alturaValida,
            pesoValido,
            faixaAltura,
            faixaPeso,
            mensagemAltura: alturaValida ? 
                `Dentro da faixa para ST ${this.stBase}` : 
                `FORA da faixa (${faixaAltura.min}m - ${faixaAltura.max}m)`,
            mensagemPeso: pesoValido ? 
                `Dentro da faixa para ST ${this.stBase}` : 
                `FORA da faixa (${faixaPeso.min}kg - ${faixaPeso.max}kg)`
        };
    }

    // OBTER FAIXAS BASEADAS NO ST
    obterFaixaAltura(st) {
        // Para ST dentro da tabela
        if (st >= 6 && st <= 14) {
            return this.alturaPorST[st];
        }
        
        // Para ST acima de 14
        if (st > 14) {
            const stExtra = st - 14;
            const incremento = stExtra * 0.05; // +5cm por ST acima de 14
            return {
                min: this.alturaPorST[14].min + incremento,
                max: this.alturaPorST[14].max + incremento
            };
        }
        
        // Para ST abaixo de 6
        if (st < 6) {
            const stFaltante = 6 - st;
            const decremento = stFaltante * 0.05; // -5cm por ST abaixo de 6
            return {
                min: this.alturaPorST[6].min - decremento,
                max: this.alturaPorST[6].max - decremento
            };
        }
        
        return { min: 1.30, max: 2.50 }; // Fallback
    }

    obterFaixaPeso(st) {
        // Para ST dentro da tabela
        if (st >= 6 && st <= 14) {
            return this.pesoPorST[st];
        }
        
        // Para ST acima de 14
        if (st > 14) {
            const stExtra = st - 14;
            const incremento = stExtra * 10; // +10kg por ST acima de 14
            return {
                min: this.pesoPorST[14].min + incremento,
                max: this.pesoPorST[14].max + incremento
            };
        }
        
        // Para ST abaixo de 6
        if (st < 6) {
            const stFaltante = 6 - st;
            const decremento = stFaltante * 5; // -5kg por ST abaixo de 6
            return {
                min: Math.max(20, this.pesoPorST[6].min - decremento),
                max: Math.max(25, this.pesoPorST[6].max - decremento)
            };
        }
        
        return { min: 30, max: 200 }; // Fallback
    }

    // MÉTODO: Aplicar regras do nanismo (ALTURA FIXA, PESO LIVRE)
    aplicarRegrasNanismo() {
        console.log('🔧 Aplicando regras do Nanismo');
        
        let alteracoes = false;

        // REGRA DO NANISMO: Altura máxima de 1.32m (abaixo do mínimo do ST 6)
        if (this.altura > 1.32) {
            console.log('📏 Nanismo: Limitando altura para 1.32m');
            this.altura = 1.32;
            alteracoes = true;
            
            const inputAltura = document.getElementById('altura');
            if (inputAltura) {
                inputAltura.value = '1.32';
            }
        }

        // O PESO FICA LIVRE no nanismo - pode ser qualquer valor dentro dos limites gerais
        // Mas mostramos que está usando a tabela do ST 6 como referência
        
        if (alteracoes) {
            this.mostrarMensagemNanismo();
        }

        return alteracoes;
    }

    // MÉTODO: Mostrar status baseado no ST
    mostrarMensagemNanismo() {
        const existingMessage = document.getElementById('nanismoMessage');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.id = 'nanismoMessage';
        messageDiv.innerHTML = `
            🎯 <strong>Nanismo Ativo</strong><br>
            • Altura limitada: 1.32m (ST 6: 1.30-1.55m)<br>
            • Peso livre na faixa do ST atual<br>
            • MT -1, Deslocamento -1
        `;
        messageDiv.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            padding: 12px 15px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            background: #e74c3c;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border-left: 4px solid #c0392b;
            font-size: 12px;
            line-height: 1.4;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }

    // MÉTODOS AUXILIARES
    temNanismo() {
        if (!window.sistemaCaracteristicasFisicas) return false;
        return window.sistemaCaracteristicasFisicas.temNanismo 
            ? window.sistemaCaracteristicasFisicas.temNanismo()
            : window.sistemaCaracteristicasFisicas.caracteristicasSelecionadas?.some(c => c.tipo === 'nanismo');
    }

    obterSTReal() {
        const inputST = document.getElementById('ST');
        if (inputST && inputST.value) {
            const st = parseInt(inputST.value);
            if (!isNaN(st) && st >= 1 && st <= 40) {
                return st;
            }
        }
        
        if (typeof obterDadosAtributos === 'function') {
            try {
                const dados = obterDadosAtributos();
                if (dados.ST && dados.ST >= 1 && dados.ST <= 40) {
                    return dados.ST;
                }
            } catch (error) {
                console.log('Erro ao obter dados atributos:', error);
            }
        }
        
        return 10; // Default
    }

    inicializar() {
        if (this.inicializado) return;
        
        console.log('🔧 Inicializando Sistema Altura/Peso (GURPS Oficial)...');
        this.carregarDadosSalvos();
        this.configurarEventos();
        this.forcarAtualizacaoST();
        this.atualizarDisplay();
        this.inicializado = true;
    }

    configurarEventos() {
        // Escutar mudanças nos atributos
        document.addEventListener('atributosAlterados', (e) => {
            if (e.detail && e.detail.ST !== undefined) {
                this.atualizarST(e.detail.ST);
            }
        });

        // ESCUTAR CARACTERÍSTICAS FÍSICAS
        document.addEventListener('caracteristicasFisicasAlteradas', (e) => {
            console.log('🎯 Características físicas alteradas:', e.detail);
            this.aplicarRegrasEspeciais();
        });

        // Monitorar input ST
        const inputST = document.getElementById('ST');
        if (inputST) {
            inputST.addEventListener('change', () => {
                this.forcarAtualizacaoST();
            });
        }

        // Eventos dos controles de altura/peso
        this.configurarEventosControles();
    }

    configurarEventosControles() {
        const inputAltura = document.getElementById('altura');
        const inputPeso = document.getElementById('peso');
        
        if (inputAltura) {
            inputAltura.addEventListener('change', () => {
                let novaAltura = parseFloat(inputAltura.value);
                
                // VERIFICAR NANISMO
                if (this.temNanismo() && novaAltura > 1.32) {
                    this.mostrarMensagemNanismo();
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

    aplicarRegrasEspeciais() {
        if (this.temNanismo()) {
            return this.aplicarRegrasNanismo();
        }
        return false;
    }

    atualizarST(novoST) {
        if (novoST === this.stBase) return;
        
        console.log('🔄 Atualizando ST:', this.stBase, '→', novoST);
        this.stBase = novoST;
        
        // APLICAR REGRAS ESPECIAIS (nanismo)
        this.aplicarRegrasEspeciais();
        
        this.atualizarDisplay();
        this.salvarDados();
        this.atualizarInputsFisicos();
    }

    forcarAtualizacaoST() {
        const stReal = this.obterSTReal();
        if (stReal !== this.stBase) {
            this.atualizarST(stReal);
        }
    }

    atualizarInputsFisicos() {
        const inputAltura = document.getElementById('altura');
        const inputPeso = document.getElementById('peso');
        
        if (inputAltura && parseFloat(inputAltura.value) !== this.altura) {
            inputAltura.value = this.altura.toFixed(2);
        }
        
        if (inputPeso && parseInt(inputPeso.value) !== this.peso) {
            inputPeso.value = this.peso;
        }
    }

    ajustarAltura(variacao) {
        let novaAltura = this.altura + variacao;
        
        // VERIFICAR NANISMO
        if (this.temNanismo() && novaAltura > 1.32) {
            this.mostrarMensagemNanismo();
            novaAltura = 1.32;
        }
        
        // LIMITES GERAIS
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
        
        // LIMITES GERAIS
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

    // MÉTODO PRINCIPAL DE DISPLAY - COMPLETAMENTE REFEITO
    atualizarDisplay() {
        const conformidade = this.verificarConformidadeST();
        const temNanismo = this.temNanismo();
        
        this.atualizarStatusAltura(conformidade, temNanismo);
        this.atualizarStatusPeso(conformidade, temNanismo);
        this.atualizarInfoFisica(conformidade);
        this.atualizarStatusGeral(conformidade, temNanismo);
    }

    atualizarStatusAltura(conformidade, temNanismo) {
        const statusAltura = document.getElementById('statusAltura');
        if (!statusAltura) return;

        let status, classe;
        
        if (temNanismo) {
            status = "Nanismo: Altura fixa em 1.32m";
            classe = "abaixo";
        } else if (conformidade.alturaValida) {
            status = `Dentro da faixa para ST ${this.stBase}`;
            classe = "normal";
        } else {
            if (this.altura < conformidade.faixaAltura.min) {
                status = `Abaixo do mínimo (${conformidade.faixaAltura.min}m)`;
                classe = "abaixo";
            } else {
                status = `Acima do máximo (${conformidade.faixaAltura.max}m)`;
                classe = "acima";
            }
        }

        statusAltura.innerHTML = `<span class="status-info ${classe}">${status}</span>`;
    }

    atualizarStatusPeso(conformidade, temNanismo) {
        const statusPeso = document.getElementById('statusPeso');
        if (!statusPeso) return;

        let status, classe;
        
        if (temNanismo) {
            status = "Nanismo: Peso livre na faixa do ST";
            classe = "normal";
        } else if (conformidade.pesoValido) {
            status = `Dentro da faixa para ST ${this.stBase}`;
            classe = "normal";
        } else {
            if (this.peso < conformidade.faixaPeso.min) {
                status = `Abaixo do mínimo (${conformidade.faixaPeso.min}kg)`;
                classe = "abaixo";
            } else {
                status = `Acima do máximo (${conformidade.faixaPeso.max}kg)`;
                classe = "acima";
            }
        }

        statusPeso.innerHTML = `<span class="status-info ${classe}">${status}</span>`;
    }

    atualizarInfoFisica(conformidade) {
        this.atualizarElemento('stBase', this.stBase);
        this.atualizarElemento('alturaMedia', `${conformidade.faixaAltura.min}m - ${conformidade.faixaAltura.max}m`);
        this.atualizarElemento('pesoMedio', `${conformidade.faixaPeso.min}kg - ${conformidade.faixaPeso.max}kg`);
        
        if (this.temNanismo()) {
            this.atualizarElemento('modificadorPeso', 'Nanismo Ativo');
        } else {
            this.atualizarElemento('modificadorPeso', 'Normal');
        }
    }

    atualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
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
        } catch (error) {
            console.log('Erro ao carregar dados salvos:', error);
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
            console.log('Erro ao salvar dados:', error);
        }
    }

    exportarDados() {
        const conformidade = this.verificarConformidadeST();
        return {
            altura: this.altura,
            peso: this.peso,
            stBase: this.stBase,
            faixaAltura: conformidade.faixaAltura,
            faixaPeso: conformidade.faixaPeso,
            dentroDaFaixa: conformidade.alturaValida && conformidade.pesoValido,
            temNanismo: this.temNanismo()
        };
    }

    validarAlturaPeso() {
        const conformidade = this.verificarConformidadeST();
        const temNanismo = this.temNanismo();
        
        // Com nanismo, só a altura é fixa, peso é livre
        const valido = temNanismo ? 
            (this.altura <= 1.32 && this.peso >= 20 && this.peso <= 200) :
            (conformidade.alturaValida && conformidade.pesoValido);
        
        return {
            valido,
            altura: this.altura,
            peso: this.peso,
            stBase: this.stBase,
            temNanismo,
            mensagem: temNanismo ?
                `Nanismo: Altura ${this.altura}m, Peso ${this.peso}kg` :
                `ST ${this.stBase}: Altura ${this.altura}m, Peso ${this.peso}kg` +
                (!valido ? ' (FORA DA FAIXA)' : '')
        };
    }
}

// INICIALIZAÇÃO GLOBAL
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

// EXPORTAÇÃO PARA USO GLOBAL
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

window.validarAlturaPeso = () => {
    return sistemaAlturaPeso ? sistemaAlturaPeso.validarAlturaPeso() : null;
};
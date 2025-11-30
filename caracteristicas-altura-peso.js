// caracteristicas-altura-peso.js - VERSÃO 100% FUNCIONAL
class SistemaAlturaPeso {
    constructor() {
        this.altura = 1.70;
        this.peso = 70;
        this.stBase = 10;
        this.multiplicadorPeso = 1.0;
        this.inicializado = false;

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
    }

    // MÉTODO PRINCIPAL: Aplicar todas as regras especiais
    aplicarRegrasEspeciais() {
        console.log('🎯 Aplicando regras especiais de características físicas...');
        
        const temNanismo = this.temNanismo();
        const temGigantismo = this.temGigantismo();
        
        let regrasAplicadas = false;

        if (temNanismo) {
            console.log('📏 Nanismo detectado - aplicando regras');
            regrasAplicadas = this.aplicarRegrasNanismo() || regrasAplicadas;
        }

        if (temGigantismo) {
            console.log('📏 Gigantismo detectado - aplicando regras');
            regrasAplicadas = this.aplicarRegrasGigantismo() || regrasAplicadas;
        }

        if (regrasAplicadas) {
            this.atualizarDisplay();
            this.salvarDados();
        }

        return regrasAplicadas;
    }

    // MÉTODO: Aplicar regras do nanismo
    aplicarRegrasNanismo() {
        console.log('🔧 Aplicando regras específicas do Nanismo');

        let alteracoes = false;

        // REGRA 1: Altura máxima de 1.32m
        if (this.altura > 1.32) {
            console.log('📏 Nanismo: Limitando altura de', this.altura, 'para 1.32m');
            this.altura = 1.32;
            alteracoes = true;
            
            const inputAltura = document.getElementById('altura');
            if (inputAltura) {
                inputAltura.value = '1.32';
            }
        }

        // REGRA 2: Peso baseado na PRIMEIRA LINHA da tabela (ST 6) com -15%
        const pesoBaseST6 = this.weightRanges[6].media; // 45kg (média ST 6)
        const pesoNanismo = Math.round(pesoBaseST6 * 0.85); // -15% = 38kg
        
        if (this.peso !== pesoNanismo) {
            console.log('⚖️ Nanismo: Ajustando peso de', this.peso, 'para', pesoNanismo + 'kg (ST 6 -15%)');
            this.peso = pesoNanismo;
            alteracoes = true;
            
            const inputPeso = document.getElementById('peso');
            if (inputPeso) {
                inputPeso.value = pesoNanismo.toString();
            }
        }

        if (alteracoes) {
            this.mostrarMensagemNanismo();
        }

        return alteracoes;
    }

    // MÉTODO: Aplicar regras do gigantismo
    aplicarRegrasGigantismo() {
        console.log('🔧 Aplicando regras específicas do Gigantismo');

        let alteracoes = false;

        // Altura mínima para gigantismo
        if (this.altura < 1.90) {
            console.log('📏 Gigantismo: Ajustando altura de', this.altura, 'para 1.90m');
            this.altura = 1.90;
            alteracoes = true;
            
            const inputAltura = document.getElementById('altura');
            if (inputAltura) {
                inputAltura.value = '1.90';
            }
        }

        return alteracoes;
    }

    // MÉTODO: Mostrar mensagem do nanismo
    mostrarMensagemNanismo() {
        const existingMessage = document.getElementById('nanismoMessage');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.id = 'nanismoMessage';
        messageDiv.innerHTML = `
            🎯 <strong>Nanismo Ativo</strong><br>
            • Altura limitada: 1.32m<br>
            • Peso ajustado: 38kg (ST 6 -15%)<br>
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
        if (!window.sistemaCaracteristicasFisicas) {
            console.log('⚠️ sistemaCaracteristicasFisicas não disponível');
            return false;
        }
        
        const temNanismo = window.sistemaCaracteristicasFisicas.temNanismo 
            ? window.sistemaCaracteristicasFisicas.temNanismo()
            : window.sistemaCaracteristicasFisicas.caracteristicasSelecionadas?.some(c => c.tipo === 'nanismo');
        
        console.log('🔍 Verificando nanismo:', temNanismo);
        return temNanismo;
    }

    temGigantismo() {
        if (!window.sistemaCaracteristicasFisicas) return false;
        
        return window.sistemaCaracteristicasFisicas.temGigantismo 
            ? window.sistemaCaracteristicasFisicas.temGigantismo()
            : window.sistemaCaracteristicasFisicas.caracteristicasSelecionadas?.some(c => c.tipo === 'gigantismo');
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
        
        if (typeof personagem !== 'undefined' && personagem.atributos && personagem.atributos.ST) {
            return personagem.atributos.ST;
        }
        
        return 10;
    }

    inicializar() {
        if (this.inicializado) return;
        
        console.log('🔧 Inicializando Sistema Altura/Peso...');
        this.carregarDadosSalvos();
        this.configurarEventos();
        this.forcarAtualizacaoST();
        this.calcularValoresIniciais();
        
        // APLICAR REGRAS AO INICIALIZAR
        this.aplicarRegrasEspeciais();
        
        this.atualizarDisplay();
        this.inicializado = true;
        
        console.log('✅ Sistema Altura/Peso inicializado com ST:', this.stBase);
    }

    configurarEventos() {
        // Escutar mudanças nos atributos
        document.addEventListener('atributosAlterados', (e) => {
            if (e.detail && e.detail.ST !== undefined) {
                this.atualizarST(e.detail.ST);
            }
        });

        // ESCUTAR CARACTERÍSTICAS FÍSICAS - CRÍTICO!
        document.addEventListener('caracteristicasFisicasAlteradas', (e) => {
            console.log('🎯 Evento caracteristicasFisicasAlteradas recebido:', e.detail);
            this.aplicarRegrasEspeciais();
        });

        // Monitorar input ST
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

        // Eventos dos controles de altura/peso
        this.configurarEventosControles();

        // Verificação periódica
        this.iniciarVerificacaoPeriodica();
    }

    configurarEventosControles() {
        const inputAltura = document.getElementById('altura');
        const inputPeso = document.getElementById('peso');
        
        if (inputAltura) {
            inputAltura.addEventListener('change', () => {
                // VERIFICAR LIMITES ANTES DE DEFINIR
                let novaAltura = parseFloat(inputAltura.value);
                
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

    iniciarVerificacaoPeriodica() {
        setInterval(() => {
            const stAtual = this.obterSTReal();
            if (stAtual !== this.stBase) {
                this.atualizarST(stAtual);
            }
        }, 2000);
    }

    atualizarST(novoST) {
        if (novoST === this.stBase) return;
        
        this.stBase = novoST;
        this.calcularValoresBase();
        this.calcularPesoIdeal();
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
        
        // VERIFICAR LIMITES
        if (this.temNanismo() && novaAltura > 1.32) {
            this.mostrarMensagemNanismo();
            novaAltura = 1.32;
        }
        
        if (this.temGigantismo() && novaAltura < 1.90) {
            novaAltura = 1.90;
        }
        
        this.definirAltura(novaAltura);
    }

    definirAltura(novaAltura) {
        // Aplicar limites gerais
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
        let novoPeso = this.peso + variacao;
        
        // VERIFICAR LIMITES DO NANISMO
        if (this.temNanismo()) {
            const pesoNanismo = Math.round(this.weightRanges[6].media * 0.85);
            novoPeso = pesoNanismo;
        }
        
        this.definirPeso(novoPeso);
    }

    definirPeso(novoPeso) {
        // Aplicar limites gerais
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
        // SE TEM NANISMO, usar valores da primeira linha (ST 6)
        if (this.temNanismo()) {
            this.stRange = this.heightRanges[6];
            this.alturaMedia = this.heightRanges[6].media;
            this.pesoMedio = Math.round(this.weightRanges[6].media * 0.85); // -15%
        } else {
            this.stRange = this.encontrarFaixaST(this.stBase);
            this.alturaMedia = this.stRange ? this.stRange.media : 1.70;
            this.pesoMedio = this.stRange ? this.calcularPesoMedio() : 70;
        }
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

        let status, classe;
        
        if (this.temNanismo()) {
            status = "Nanismo: Altura limitada a 1.32m";
            classe = "abaixo";
        } else if (this.temGigantismo()) {
            status = "Gigantismo: Altura mínima 1.90m";
            classe = "acima";
        } else {
            const diferenca = this.altura - this.alturaMedia;
            const percentual = (diferenca / this.alturaMedia) * 100;

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
        }

        statusAltura.innerHTML = `<span class="status-info ${classe}">${status}</span>`;
    }

    atualizarStatusPeso() {
        const statusPeso = document.getElementById('statusPeso');
        if (!statusPeso) return;

        let status, classe;
        
        if (this.temNanismo()) {
            status = "Nanismo: Peso base ST 6 -15% (38kg)";
            classe = "abaixo";
        } else {
            const diferenca = this.peso - this.pesoAjustado;
            const percentual = (diferenca / this.pesoAjustado) * 100;

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
        }

        statusPeso.innerHTML = `<span class="status-info ${classe}">${status}</span>`;
    }

    atualizarInfoFisica() {
        this.atualizarElemento('stBase', this.stBase);
        this.atualizarElemento('alturaMedia', `${this.alturaMedia.toFixed(2)}m`);
        this.atualizarElemento('pesoMedio', `${this.pesoMedio}kg`);
        
        // Mostrar modificador especial para nanismo
        if (this.temNanismo()) {
            this.atualizarElemento('modificadorPeso', 'ST6 -15%');
        } else {
            this.atualizarElemento('modificadorPeso', `${this.multiplicadorPeso.toFixed(1)}x`);
        }
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

        if (this.temNanismo()) {
            statusFisico.textContent = "Nanismo";
            statusFisico.style.background = "#e74c3c";
        } else if (this.temGigantismo()) {
            statusFisico.textContent = "Gigantismo";
            statusFisico.style.background = "#f39c12";
        } else {
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

    notificarSistemaPrincipal() {
        const evento = new CustomEvent('alturaPesoAlterados', {
            detail: {
                altura: this.altura,
                peso: this.peso,
                stBase: this.stBase,
                temNanismo: this.temNanismo(),
                temGigantismo: this.temGigantismo()
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
            multiplicadorPeso: this.multiplicadorPeso,
            temNanismo: this.temNanismo(),
            temGigantismo: this.temGigantismo()
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
            temNanismo: this.temNanismo(),
            temGigantismo: this.temGigantismo(),
            mensagem: `ST: ${this.stBase}, Altura: ${this.altura}m, Peso: ${this.peso}kg` +
                     (this.temNanismo() ? ' (Nanismo)' : '') +
                     (this.temGigantismo() ? ' (Gigantismo)' : '')
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

// Evento para inicialização por outros sistemas
document.addEventListener('caracteristicasCarregadas', function() {
    if (sistemaAlturaPeso && !sistemaAlturaPeso.inicializado) {
        sistemaAlturaPeso.inicializar();
    }
});
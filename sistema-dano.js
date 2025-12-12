// sistema-dano.js - SISTEMA COMPLETO DE CÁLCULO DE DANO
(function() {
    'use strict';

    // Estado do sistema
    const estado = {
        stAtual: 10,
        danoBase: { gdp: '1d-2', geb: '1d' },
        armaEquipada: null,
        fadigaAtiva: false
    };

    // TABELA DE DANO POR ST
    const tabelaDanoST = {
        1: { gdp: "1d-6", geb: "1d-5" },
        2: { gdp: "1d-6", geb: "1d-5" },
        3: { gdp: "1d-5", geb: "1d-4" },
        4: { gdp: "1d-5", geb: "1d-4" },
        5: { gdp: "1d-4", geb: "1d-3" },
        6: { gdp: "1d-4", geb: "1d-3" },
        7: { gdp: "1d-3", geb: "1d-2" },
        8: { gdp: "1d-3", geb: "1d-2" },
        9: { gdp: "1d-2", geb: "1d-1" },
        10: { gdp: "1d-2", geb: "1d" },
        11: { gdp: "1d-1", geb: "1d+1" },
        12: { gdp: "1d", geb: "1d+2" },
        13: { gdp: "1d", geb: "2d-1" },
        14: { gdp: "1d", geb: "2d" },
        15: { gdp: "1d+1", geb: "2d+1" },
        16: { gdp: "1d+1", geb: "2d+2" },
        17: { gdp: "1d+2", geb: "3d-1" },
        18: { gdp: "1d+2", geb: "3d" },
        19: { gdp: "2d-1", geb: "3d+1" },
        20: { gdp: "2d-1", geb: "3d+2" },
        21: { gdp: "2d", geb: "4d-1" },
        22: { gdp: "2d", geb: "4d" },
        23: { gdp: "2d+1", geb: "4d+1" },
        24: { gdp: "2d+1", geb: "4d+2" },
        25: { gdp: "2d+2", geb: "5d-1" },
        26: { gdp: "2d+2", geb: "5d" },
        27: { gdp: "3d-1", geb: "5d+1" },
        28: { gdp: "3d-1", geb: "5d+1" },
        29: { gdp: "3d", geb: "5d+2" },
        30: { gdp: "3d", geb: "5d+2" }
    };

    // ========== FUNÇÕES AUXILIARES ==========

    function calcularSomaDeDados(base, modificador) {
        if (!modificador || modificador.trim() === '') return base.trim();
        
        base = base.trim();
        modificador = modificador.trim();
        
        const sinal = modificador.charAt(0);
        const numero = parseInt(modificador.substring(1)) || 0;
        
        const match = base.match(/(\d+d)([+-]\d+)?/);
        
        if (match) {
            const dados = match[1];
            const baseMod = match[2] ? parseInt(match[2]) : 0;
            
            let novoMod = baseMod;
            if (sinal === '+') {
                novoMod += numero;
            } else if (sinal === '-') {
                novoMod -= numero;
            }
            
            if (novoMod === 0) {
                return dados;
            } else if (novoMod > 0) {
                return dados + '+' + novoMod;
            } else {
                return dados + novoMod;
            }
        }
        
        return base + " " + modificador;
    }

    // ========== MONITORAMENTO DO ST ==========

    function monitorarST() {
        const stInput = document.getElementById('ST');
        if (!stInput) return;
        
        estado.stAtual = parseInt(stInput.value) || 10;
        
        stInput.addEventListener('input', () => {
            setTimeout(() => {
                const novoST = parseInt(stInput.value) || 10;
                if (novoST !== estado.stAtual) {
                    estado.stAtual = novoST;
                    atualizarDanoBasePorST();
                    calcularEAtualizarInterface();
                }
            }, 100);
        });
        
        stInput.addEventListener('change', () => {
            const novoST = parseInt(stInput.value) || 10;
            estado.stAtual = novoST;
            atualizarDanoBasePorST();
            calcularEAtualizarInterface();
        });
        
        document.addEventListener('atributosAlterados', (e) => {
            if (e.detail && e.detail.ST) {
                estado.stAtual = e.detail.ST;
                atualizarDanoBasePorST();
                calcularEAtualizarInterface();
            }
        });
        
        atualizarDanoBasePorST();
    }

    function atualizarDanoBasePorST() {
        const stKey = Math.min(Math.max(estado.stAtual, 1), 30);
        const dadosST = tabelaDanoST[stKey];
        
        if (dadosST) {
            estado.danoBase.gdp = dadosST.gdp;
            estado.danoBase.geb = dadosST.geb;
        } else {
            estado.danoBase.gdp = '1d-2';
            estado.danoBase.geb = '1d';
        }
    }

    // ========== MONITORAMENTO DA FADIGA ==========

    function monitorarFadiga() {
        const observadorPF = new MutationObserver(() => {
            const estadoPF = document.getElementById('pfEstadoDisplay');
            if (estadoPF) {
                const novaFadiga = estadoPF.textContent === 'Fadigado' || 
                                  estadoPF.textContent === 'Exausto';
                if (novaFadiga !== estado.fadigaAtiva) {
                    estado.fadigaAtiva = novaFadiga;
                    calcularEAtualizarInterface();
                }
            }
        });
        
        const elementoPF = document.getElementById('pfEstadoDisplay');
        if (elementoPF) {
            observadorPF.observe(elementoPF, { 
                childList: true, 
                characterData: true, 
                subtree: true 
            });
        }
        
        const estadoPF = document.getElementById('pfEstadoDisplay');
        if (estadoPF) {
            estado.fadigaAtiva = estadoPF.textContent === 'Fadigado' || 
                               estadoPF.textContent === 'Exausto';
        }
    }

    // ========== MONITORAMENTO DE EQUIPAMENTOS ==========

    function monitorarEquipamentos() {
        document.addEventListener('equipamentosAtualizados', () => {
            buscarArmaEquipada();
            calcularEAtualizarInterface();
        });
        
        const observerDOM = new MutationObserver(() => {
            buscarArmaEquipada();
        });
        
        const listaEquipamentos = document.getElementById('lista-equipamentos-adquiridos');
        if (listaEquipamentos) {
            observerDOM.observe(listaEquipamentos, { 
                childList: true, 
                subtree: true 
            });
        }
        
        buscarArmaEquipada();
    }

    function buscarArmaEquipada() {
        estado.armaEquipada = null;
        
        if (window.sistemaEquipamentos) {
            const equipamentos = window.sistemaEquipamentos.equipamentosEquipados;
            
            if (equipamentos.maos && equipamentos.maos.length > 0) {
                for (const item of equipamentos.maos) {
                    if (item.tipo === 'arma-cc' || item.tipo === 'arma-dist') {
                        estado.armaEquipada = item;
                        return;
                    }
                }
            }
            
            if (!estado.armaEquipada && equipamentos.corpo && equipamentos.corpo.length > 0) {
                for (const item of equipamentos.corpo) {
                    if (item.tipo === 'arma-cc' || item.tipo === 'arma-dist') {
                        estado.armaEquipada = item;
                        return;
                    }
                }
            }
        }
    }

    // ========== CÁLCULO DO DANO ==========

    function calcularFormulaDano(formulaArma, tipoDano, baseForcada = null) {
        if (!formulaArma || !tipoDano) return null;
        
        const danoGDPbase = estado.danoBase.gdp;
        const danoGEBbase = estado.danoBase.geb;
        
        let formulaFinal = '';
        let baseTipo = baseForcada;
        
        if (formulaArma.startsWith('GeB')) {
            const modificador = formulaArma.replace('GeB', '').trim();
            formulaFinal = calcularSomaDeDados(danoGEBbase, modificador);
            if (!baseForcada) baseTipo = 'GEB';
        } 
        else if (formulaArma.startsWith('GdP')) {
            const modificador = formulaArma.replace('GdP', '').trim();
            formulaFinal = calcularSomaDeDados(danoGDPbase, modificador);
            if (!baseForcada) baseTipo = 'GDP';
        }
        else {
            formulaFinal = formulaArma;
            if (!baseForcada) baseTipo = 'GEB';
        }
        
        return {
            formula: formulaFinal,
            tipo: tipoDano,
            base: baseTipo,
            nome: `Dano ${baseTipo}`
        };
    }

    function calcularTodosOsDanosDaArma(arma) {
        if (!arma) return [];
        
        const tiposDano = [];
        
        console.log(`🔍 Analisando: ${arma.nome}`);
        console.log(`📊 Dados: dano="${arma.dano}", tipoDano="${arma.tipoDano}", danoGDP="${arma.danoGDP}", tipoDanoGDP="${arma.tipoDanoGDP}"`);
        
        // LÓGICA PRINCIPAL:
        // 1. SEMPRE processa tipoDano (GEB)
        if (arma.dano && arma.tipoDano) {
            const resultado = calcularFormulaDano(arma.dano, arma.tipoDano);
            if (resultado) {
                tiposDano.push(resultado);
                console.log(`✅ Adicionado ${resultado.base}: ${resultado.formula} (${resultado.tipo})`);
            }
        }
        
        // 2. SE TEM tipoDanoGDP, processa como SEGUNDO TIPO (GDP)
        if (arma.danoGDP && arma.tipoDanoGDP) {
            const resultado = calcularFormulaDano(arma.danoGDP, arma.tipoDanoGDP, 'GDP');
            if (resultado) {
                tiposDano.push(resultado);
                console.log(`✅ Adicionado ${resultado.base}: ${resultado.formula} (${resultado.tipo})`);
            }
        }
        
        console.log(`🎯 Total tipos encontrados: ${tiposDano.length}`);
        return tiposDano;
    }

    function calcularDanoCorporal() {
        return {
            gdp: { 
                formula: estado.danoBase.gdp, 
                tipo: 'contusão', 
                base: 'GDP',
                nome: 'Dano GDP'
            },
            geb: { 
                formula: estado.danoBase.geb, 
                tipo: 'contusão', 
                base: 'GEB',
                nome: 'Dano GEB'
            }
        };
    }

    // ========== ATUALIZAÇÃO DA INTERFACE ==========

    function calcularEAtualizarInterface() {
        atualizarDanoBaseDisplay();
        atualizarDanoArmaEquipada();
    }

    function atualizarDanoBaseDisplay() {
        const gdpDisplay = document.getElementById('danoGdp');
        const gebDisplay = document.getElementById('danoGeb');
        
        if (gdpDisplay) gdpDisplay.textContent = estado.danoBase.gdp;
        if (gebDisplay) gebDisplay.textContent = estado.danoBase.geb;
    }

    function atualizarDanoArmaEquipada() {
        const armaNome = document.getElementById('armaNome');
        const armaDano = document.getElementById('armaDano');
        const armaTipo = document.getElementById('armaTipo');
        const semArma = document.getElementById('semArma');
        const comArma = document.getElementById('comArma');
        
        if (!armaDano || !semArma || !comArma) return;
        
        if (estado.armaEquipada) {
            const danosCalculados = calcularTodosOsDanosDaArma(estado.armaEquipada);
            
            semArma.style.display = 'none';
            comArma.style.display = 'block';
            
            if (armaNome) {
                armaNome.textContent = estado.armaEquipada.nome;
                armaNome.style.cssText = `
                    font-size: 1.4em;
                    font-weight: bold;
                    color: #FFD700;
                    margin-bottom: 15px;
                    text-align: center;
                    border-bottom: 3px solid #FFD700;
                    padding-bottom: 8px;
                    text-shadow: 1px 1px 2px #000;
                `;
            }
            
            if (armaDano) armaDano.innerHTML = '';
            if (armaTipo) armaTipo.innerHTML = '';
            
            if (armaDano && armaTipo) {
                // FORÇA ESPAÇO SUFICIENTE
                const containerPai = comArma.closest('.arma-info') || comArma.parentElement;
                if (containerPai) {
                    containerPai.style.minHeight = '150px';
                    containerPai.style.padding = '20px';
                }
                
                // CONTAINER PRINCIPAL
                const containerPrincipal = document.createElement('div');
                containerPrincipal.style.cssText = `
                    width: 100%;
                `;
                
                // ADICIONA CADA TIPO DE DANO
                danosCalculados.forEach(dano => {
                    const linha = document.createElement('div');
                    linha.style.cssText = `
                        font-size: 1.2em;
                        margin: 12px 0;
                        padding: 12px 15px;
                        background: rgba(0, 0, 0, 0.4);
                        border-radius: 10px;
                        border-left: 6px solid ${dano.base === 'GEB' ? '#FF6B6B' : '#4ECDC4'};
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
                    `;
                    
                    const label = document.createElement('span');
                    label.style.cssText = `
                        font-family: 'Courier New', monospace;
                        font-weight: bold;
                        color: #FFD700;
                        font-size: 1.1em;
                        min-width: 100px;
                    `;
                    label.textContent = `Dano ${dano.base}:`;
                    
                    const valor = document.createElement('span');
                    valor.style.cssText = `
                        font-size: 1.4em;
                        font-weight: bold;
                        color: #FFFFFF;
                        font-family: 'Courier New', monospace;
                        margin: 0 20px;
                        flex-grow: 1;
                        text-align: center;
                    `;
                    valor.textContent = dano.formula;
                    
                    const tipo = document.createElement('span');
                    tipo.style.cssText = `
                        color: ${dano.base === 'GEB' ? '#FF6B6B' : '#4ECDC4'};
                        font-style: italic;
                        font-weight: bold;
                        min-width: 100px;
                        text-align: right;
                    `;
                    tipo.textContent = dano.tipo;
                    
                    linha.appendChild(label);
                    linha.appendChild(valor);
                    linha.appendChild(tipo);
                    containerPrincipal.appendChild(linha);
                });
                
                // SE TEM MAIS DE 1 TIPO, ADICIONA SEPARADOR
                if (danosCalculados.length > 1) {
                    const separador = document.createElement('div');
                    separador.style.cssText = `
                        height: 2px;
                        background: linear-gradient(90deg, transparent, #FFD700, transparent);
                        margin: 15px 0;
                    `;
                    containerPrincipal.appendChild(separador);
                }
                
                // ADICIONA ALCANCE SE TIVER
                if (estado.armaEquipada.alcance && estado.armaEquipada.alcance !== '1') {
                    const linhaAlcance = document.createElement('div');
                    linhaAlcance.style.cssText = `
                        font-size: 1em;
                        color: #45B7D1;
                        margin-top: 10px;
                        text-align: center;
                        font-style: italic;
                        padding: 8px;
                        background: rgba(69, 183, 209, 0.1);
                        border-radius: 6px;
                    `;
                    linhaAlcance.textContent = `Alcance: ${estado.armaEquipada.alcance}`;
                    containerPrincipal.appendChild(linhaAlcance);
                }
                
                armaDano.appendChild(containerPrincipal);
            }
            
        } else {
            semArma.style.display = 'flex';
            comArma.style.display = 'none';
        }
    }

    // ========== INICIALIZAÇÃO ==========

    function inicializar() {
        monitorarST();
        monitorarFadiga();
        monitorarEquipamentos();
        
        setTimeout(() => {
            calcularEAtualizarInterface();
        }, 500);
    }

    function observarAbaCombate() {
        const combateTab = document.getElementById('combate');
        if (!combateTab) return;
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && 
                    combateTab.classList.contains('active')) {
                    
                    setTimeout(inicializar, 300);
                }
            });
        });
        
        observer.observe(combateTab, { attributes: true });
        
        if (combateTab.classList.contains('active')) {
            setTimeout(inicializar, 500);
        }
    }

    // ========== INICIALIZAÇÃO GLOBAL ==========

    document.addEventListener('DOMContentLoaded', function() {
        observarAbaCombate();
    });

    console.log('🔧 sistema-dano.js carregado com sucesso!');

})();
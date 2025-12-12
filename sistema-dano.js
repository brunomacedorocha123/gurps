// sistema-dano.js - VERSÃO FINAL DEFINITIVA
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

    function calcularTodosOsDanosDaArma(arma) {
        if (!arma) return [];
        
        const tiposDano = [];
        const danoGDPbase = estado.danoBase.gdp;
        const danoGEBbase = estado.danoBase.geb;
        
        // 1. GDP ESPECÍFICO (GdP+1 contusão)
        if (arma.danoGDP && arma.danoGDP !== "-") {
            const modificadorGDP = arma.danoGDP.replace('GdP', '').trim();
            let formulaGDP = danoGDPbase;
            
            if (modificadorGDP) {
                formulaGDP = calcularSomaDeDados(danoGDPbase, modificadorGDP);
            }
            
            tiposDano.push({
                formula: formulaGDP,
                tipo: arma.tipoDanoGDP || 'contusão',
                base: 'GDP',
                nome: arma.nome
            });
        }
        
        // 2. GEB ESPECÍFICO (GeB+1 corte)
        if (arma.danoGEB && arma.danoGEB !== "-") {
            const modificadorGEB = arma.danoGEB.replace('GeB', '').trim();
            let formulaGEB = danoGEBbase;
            
            if (modificadorGEB) {
                formulaGEB = calcularSomaDeDados(danoGEBbase, modificadorGEB);
            }
            
            tiposDano.push({
                formula: formulaGEB,
                tipo: arma.tipoDanoGEB || 'corte',
                base: 'GEB',
                nome: arma.nome
            });
        }
        
        // 3. DANO PRINCIPAL (para armas que não tem GDP/GEB separados)
        if (tiposDano.length === 0 && arma.dano) {
            let formulaFinal = '';
            let baseTipo = '';
            let tipoDano = arma.tipoDano || 'contusão';
            
            if (arma.dano.startsWith('GeB')) {
                const modificador = arma.dano.replace('GeB', '').trim();
                formulaFinal = calcularSomaDeDados(danoGEBbase, modificador);
                baseTipo = 'GEB';
            } else if (arma.dano.startsWith('GdP')) {
                const modificador = arma.dano.replace('GdP', '').trim();
                formulaFinal = calcularSomaDeDados(danoGDPbase, modificador);
                baseTipo = 'GDP';
            } else {
                formulaFinal = arma.dano;
                baseTipo = 'GEB';
            }
            
            tiposDano.push({
                formula: formulaFinal,
                tipo: tipoDano,
                base: baseTipo,
                nome: arma.nome
            });
        }
        
        return tiposDano;
    }

    function calcularDanoCorporal() {
        return {
            gdp: { formula: estado.danoBase.gdp, tipo: 'contusão', nome: 'Golpe de Punho' },
            geb: { formula: estado.danoBase.geb, tipo: 'contusão', nome: 'Golpe de Braço' }
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
                    font-size: 1.3em;
                    font-weight: bold;
                    color: #FFD700;
                    margin-bottom: 10px;
                    text-align: center;
                    border-bottom: 2px solid #FFD700;
                    padding-bottom: 5px;
                `;
            }
            
            if (armaDano) armaDano.innerHTML = '';
            if (armaTipo) armaTipo.innerHTML = '';
            
            if (armaDano && armaTipo) {
                // EXPANDE O ESPAÇO
                const containerPai = comArma.closest('.arma-info') || comArma.parentElement;
                if (containerPai) {
                    containerPai.style.minHeight = '140px';
                    containerPai.style.padding = '15px 20px';
                }
                
                // CONTAINER PRINCIPAL
                const containerPrincipal = document.createElement('div');
                containerPrincipal.style.cssText = `
                    width: 100%;
                    padding: 10px;
                `;
                
                // ADICIONA CADA TIPO DE DANO
                danosCalculados.forEach(dano => {
                    const linha = document.createElement('div');
                    linha.style.cssText = `
                        font-size: 1.1em;
                        margin: 8px 0;
                        padding: 8px 12px;
                        background: rgba(0,0,0,0.3);
                        border-radius: 8px;
                        border-left: 5px solid ${dano.base === 'GEB' ? '#FF6B6B' : '#4ECDC4'};
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    `;
                    
                    const ladoEsquerdo = document.createElement('div');
                    ladoEsquerdo.style.cssText = `
                        font-family: 'Courier New', monospace;
                        font-weight: bold;
                        color: #FFD700;
                    `;
                    ladoEsquerdo.textContent = `Dano ${dano.base}:`;
                    
                    const ladoDireito = document.createElement('div');
                    ladoDireito.style.cssText = `
                        display: flex;
                        align-items: center;
                        gap: 15px;
                    `;
                    
                    const valorDano = document.createElement('span');
                    valorDano.style.cssText = `
                        font-size: 1.2em;
                        font-weight: bold;
                        color: #FFFFFF;
                        font-family: 'Courier New', monospace;
                    `;
                    valorDano.textContent = dano.formula;
                    
                    const tipoDanoSpan = document.createElement('span');
                    tipoDanoSpan.style.cssText = `
                        color: ${dano.base === 'GEB' ? '#FF6B6B' : '#4ECDC4'};
                        font-style: italic;
                    `;
                    tipoDanoSpan.textContent = dano.tipo;
                    
                    ladoDireito.appendChild(valorDano);
                    ladoDireito.appendChild(tipoDanoSpan);
                    
                    linha.appendChild(ladoEsquerdo);
                    linha.appendChild(ladoDireito);
                    containerPrincipal.appendChild(linha);
                });
                
                // ADICIONA ALCANCE SE TIVER
                if (estado.armaEquipada.alcance && estado.armaEquipada.alcance !== '1') {
                    const linhaAlcance = document.createElement('div');
                    linhaAlcance.style.cssText = `
                        font-size: 0.9em;
                        color: #45B7D1;
                        margin-top: 10px;
                        text-align: center;
                        font-style: italic;
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

})();
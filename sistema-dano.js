// sistema-dano.js - VERSÃO COMPLETA COM SUPORTE A 2 ARMAS
(function() {
    'use strict';

    const estado = {
        stAtual: 10,
        danoBase: { gdp: '1d-2', geb: '1d' },
        fadigaAtiva: false
    };

    const tabelaDanoST = {
        1: { gdp: "1d-6", geb: "1d-5" }, 2: { gdp: "1d-6", geb: "1d-5" },
        3: { gdp: "1d-5", geb: "1d-4" }, 4: { gdp: "1d-5", geb: "1d-4" },
        5: { gdp: "1d-4", geb: "1d-3" }, 6: { gdp: "1d-4", geb: "1d-3" },
        7: { gdp: "1d-3", geb: "1d-2" }, 8: { gdp: "1d-3", geb: "1d-2" },
        9: { gdp: "1d-2", geb: "1d-1" }, 10: { gdp: "1d-2", geb: "1d" },
        11: { gdp: "1d-1", geb: "1d+1" }, 12: { gdp: "1d", geb: "1d+2" },
        13: { gdp: "1d", geb: "2d-1" }, 14: { gdp: "1d", geb: "2d" },
        15: { gdp: "1d+1", geb: "2d+1" }, 16: { gdp: "1d+1", geb: "2d+2" },
        17: { gdp: "1d+2", geb: "3d-1" }, 18: { gdp: "1d+2", geb: "3d" },
        19: { gdp: "2d-1", geb: "3d+1" }, 20: { gdp: "2d-1", geb: "3d+2" },
        21: { gdp: "2d", geb: "4d-1" }, 22: { gdp: "2d", geb: "4d" },
        23: { gdp: "2d+1", geb: "4d+1" }, 24: { gdp: "2d+1", geb: "4d+2" },
        25: { gdp: "2d+2", geb: "5d-1" }, 26: { gdp: "2d+2", geb: "5d" },
        27: { gdp: "3d-1", geb: "5d+1" }, 28: { gdp: "3d-1", geb: "5d+1" },
        29: { gdp: "3d", geb: "5d+2" }, 30: { gdp: "3d", geb: "5d+2" }
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
            if (sinal === '+') novoMod += numero;
            else if (sinal === '-') novoMod -= numero;
            if (novoMod === 0) return dados;
            else if (novoMod > 0) return dados + '+' + novoMod;
            else return dados + novoMod;
        }
        return base + " " + modificador;
    }

    // ========== MONITORAMENTO ==========

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
            estado.stAtual = parseInt(stInput.value) || 10;
            atualizarDanoBasePorST();
            calcularEAtualizarInterface();
        });
        document.addEventListener('atributosAlterados', (e) => {
            if (e.detail?.ST) {
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
        estado.danoBase.gdp = dadosST ? dadosST.gdp : '1d-2';
        estado.danoBase.geb = dadosST ? dadosST.geb : '1d';
    }

    function monitorarFadiga() {
        const elementoPF = document.getElementById('pfEstadoDisplay');
        if (!elementoPF) return;
        const observer = new MutationObserver(() => {
            const texto = elementoPF.textContent;
            estado.fadigaAtiva = texto === 'Fadigado' || texto === 'Exausto';
            calcularEAtualizarInterface();
        });
        observer.observe(elementoPF, { childList: true, characterData: true, subtree: true });
        estado.fadigaAtiva = elementoPF.textContent === 'Fadigado' || 
                            elementoPF.textContent === 'Exausto';
    }

    // ========== CÁLCULO DE DANO ==========

    function calcularFormulaDano(formulaArma, tipoDano, baseForcada = null) {
        if (!formulaArma || !tipoDano) return null;
        let formulaFinal = '';
        let baseTipo = baseForcada;
        
        if (formulaArma.startsWith('GeB')) {
            const modificador = formulaArma.replace('GeB', '').trim();
            formulaFinal = calcularSomaDeDados(estado.danoBase.geb, modificador);
            if (!baseForcada) baseTipo = 'GEB';
        } 
        else if (formulaArma.startsWith('GdP')) {
            const modificador = formulaArma.replace('GdP', '').trim();
            formulaFinal = calcularSomaDeDados(estado.danoBase.gdp, modificador);
            if (!baseForcada) baseTipo = 'GDP';
        }
        else {
            formulaFinal = formulaArma;
            if (!baseForcada) baseTipo = 'GEB';
        }
        
        return { formula: formulaFinal, tipo: tipoDano, base: baseTipo };
    }

    function calcularTodosOsDanosDaArma(arma) {
        if (!arma) return [];
        const tiposDano = [];
        
        // SEMPRE processa tipoDano (GEB)
        if (arma.dano && arma.tipoDano) {
            const resultado = calcularFormulaDano(arma.dano, arma.tipoDano);
            if (resultado) tiposDano.push(resultado);
        }
        
        // SE TEM tipoDanoGDP, processa como SEGUNDO TIPO (GDP)
        if (arma.danoGDP && arma.tipoDanoGDP) {
            const resultado = calcularFormulaDano(arma.danoGDP, arma.tipoDanoGDP, 'GDP');
            if (resultado) tiposDano.push(resultado);
        }
        
        return tiposDano;
    }

    function obterTodasArmasEquipadas() {
        const armas = [];
        if (!window.sistemaEquipamentos) return armas;
        
        const equipamentos = window.sistemaEquipamentos.equipamentosEquipados;
        
        // Armas nas MÃOS
        if (equipamentos.maos?.length > 0) {
            equipamentos.maos.forEach(item => {
                if (item.tipo === 'arma-cc' || item.tipo === 'arma-dist') {
                    armas.push(item);
                }
            });
        }
        
        // Se não tem nas mãos, pega do CORPO
        if (armas.length === 0 && equipamentos.corpo?.length > 0) {
            equipamentos.corpo.forEach(item => {
                if (item.tipo === 'arma-cc' || item.tipo === 'arma-dist') {
                    armas.push(item);
                }
            });
        }
        
        return armas;
    }

    // ========== INTERFACE ==========

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
        const armaDano = document.getElementById('armaDano');
        const semArma = document.getElementById('semArma');
        const comArma = document.getElementById('comArma');
        
        if (!armaDano || !semArma || !comArma) return;
        
        const armasEquipadas = obterTodasArmasEquipadas();
        
        if (armasEquipadas.length > 0) {
            semArma.style.display = 'none';
            comArma.style.display = 'block';
            
            // AJUSTA ALTURA BASEADO NO NÚMERO DE ARMAS
            const containerPai = comArma.closest('.arma-info') || comArma.parentElement;
            if (containerPai) {
                if (armasEquipadas.length === 1) {
                    containerPai.style.minHeight = '150px';
                } else {
                    containerPai.style.minHeight = '220px';
                }
                containerPai.style.padding = '12px';
            }
            
            armaDano.innerHTML = '';
            
            // CONTAINER PRINCIPAL
            const containerPrincipal = document.createElement('div');
            containerPrincipal.style.cssText = `
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 12px;
            `;
            
            // PARA CADA ARMA
            armasEquipadas.forEach((arma, index) => {
                const danosCalculados = calcularTodosOsDanosDaArma(arma);
                
                // CONTAINER DA ARMA (COMPACTO)
                const containerArma = document.createElement('div');
                containerArma.style.cssText = `
                    background: rgba(0, 0, 0, 0.4);
                    border-radius: 10px;
                    border: 2px solid ${index === 0 ? '#FFD700' : '#4ECDC4'};
                    padding: 10px;
                    flex: 1;
                `;
                
                // CABEÇALHO DA ARMA
                const cabecalho = document.createElement('div');
                cabecalho.style.cssText = `
                    font-size: 1.1em;
                    font-weight: bold;
                    color: ${index === 0 ? '#FFD700' : '#4ECDC4'};
                    margin-bottom: 8px;
                    text-align: center;
                    border-bottom: 1px solid rgba(255,255,255,0.2);
                    padding-bottom: 5px;
                `;
                cabecalho.textContent = arma.nome;
                
                containerArma.appendChild(cabecalho);
                
                // CONTAINER DOS DANOS
                const containerDanos = document.createElement('div');
                containerDanos.style.cssText = `
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                `;
                
                // CADA TIPO DE DANO DA ARMA
                danosCalculados.forEach(dano => {
                    const linhaDano = document.createElement('div');
                    linhaDano.style.cssText = `
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-size: 0.95em;
                        padding: 4px 8px;
                        background: rgba(255,255,255,0.05);
                        border-radius: 6px;
                    `;
                    
                    const label = document.createElement('span');
                    label.style.cssText = `
                        color: ${dano.base === 'GEB' ? '#FF6B6B' : '#4ECDC4'};
                        font-weight: bold;
                        font-size: 0.9em;
                        min-width: 50px;
                    `;
                    label.textContent = dano.base;
                    
                    const valor = document.createElement('span');
                    valor.style.cssText = `
                        color: #FFFFFF;
                        font-family: 'Courier New', monospace;
                        font-weight: bold;
                        margin: 0 8px;
                        flex-grow: 1;
                        text-align: center;
                        font-size: 1em;
                    `;
                    valor.textContent = dano.formula;
                    
                    const tipo = document.createElement('span');
                    tipo.style.cssText = `
                        color: #AAAAAA;
                        font-size: 0.85em;
                        font-style: italic;
                        min-width: 70px;
                        text-align: right;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    `;
                    tipo.textContent = dano.tipo;
                    
                    linhaDano.appendChild(label);
                    linhaDano.appendChild(valor);
                    linhaDano.appendChild(tipo);
                    containerDanos.appendChild(linhaDano);
                });
                
                containerArma.appendChild(containerDanos);
                containerPrincipal.appendChild(containerArma);
            });
            
            armaDano.appendChild(containerPrincipal);
            
        } else {
            semArma.style.display = 'flex';
            comArma.style.display = 'none';
        }
    }

    // ========== INICIALIZAÇÃO ==========

    function inicializar() {
        monitorarST();
        monitorarFadiga();
        
        // Monitora equipamentos
        document.addEventListener('equipamentosAtualizados', () => {
            calcularEAtualizarInterface();
        });
        
        // Observa mudanças na lista de equipamentos
        const listaEquipamentos = document.getElementById('lista-equipamentos-adquiridos');
        if (listaEquipamentos) {
            new MutationObserver(() => {
                setTimeout(calcularEAtualizarInterface, 100);
            }).observe(listaEquipamentos, { childList: true, subtree: true });
        }
        
        calcularEAtualizarInterface();
    }

    function observarAbaCombate() {
        const combateTab = document.getElementById('combate');
        if (!combateTab) return;
        
        new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && combateTab.classList.contains('active')) {
                    setTimeout(inicializar, 300);
                }
            });
        }).observe(combateTab, { attributes: true });
        
        if (combateTab.classList.contains('active')) {
            setTimeout(inicializar, 500);
        }
    }

    // ========== INICIALIZAÇÃO GLOBAL ==========

    document.addEventListener('DOMContentLoaded', observarAbaCombate);

    console.log('🔧 sistema-dano.js carregado com sucesso!');

})();
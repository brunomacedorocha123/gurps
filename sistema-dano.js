// sistema-dano.js - SISTEMA COMPLETO DE CÁLCULO DE DANO (VERSÃO FINAL)
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
                nome: arma.nome,
                stRequerido: arma.st,
                maos: arma.maos || 1,
                alcance: arma.alcance || '1'
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
                nome: arma.nome,
                stRequerido: arma.st,
                maos: arma.maos || 1,
                alcance: arma.alcance || '1'
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
                nome: arma.nome,
                stRequerido: arma.st,
                maos: arma.maos || 1,
                alcance: arma.alcance || '1'
            });
        }
        
        return tiposDano;
    }

    function calcularDanoCorporal() {
        const stEfetivo = estado.fadigaAtiva ? 
            Math.ceil(estado.stAtual / 2) : 
            estado.stAtual;
        
        return {
            gdp: {
                formula: estado.danoBase.gdp,
                tipo: 'contusão',
                alcance: 'C',
                maos: 1,
                stAtual: stEfetivo,
                nome: 'Golpe de Punho'
            },
            geb: {
                formula: estado.danoBase.geb,
                tipo: 'contusão',
                alcance: '1',
                maos: 1,
                stAtual: stEfetivo,
                nome: 'Golpe de Braço'
            }
        };
    }

    // ========== ATUALIZAÇÃO DA INTERFACE ==========

    function calcularEAtualizarInterface() {
        atualizarDanoBaseDisplay();
        atualizarDanoArmaEquipada();
        atualizarStatusFadiga();
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
                if (danosCalculados.length > 1) {
                    armaNome.innerHTML = `${estado.armaEquipada.nome} <span style="color:#FFD700; font-size:0.8em; margin-left:5px;">(${danosCalculados.length} tipos)</span>`;
                }
            }
            
            if (armaDano) armaDano.innerHTML = '';
            if (armaTipo) armaTipo.innerHTML = '';
            
            if (armaDano && armaTipo) {
                danosCalculados.forEach((dano, index) => {
                    const containerDano = document.createElement('div');
                    containerDano.className = 'tipo-dano-item';
                    containerDano.style.cssText = `
                        margin-bottom: ${index < danosCalculados.length - 1 ? '12px' : '0'};
                        padding: 12px;
                        border-radius: 10px;
                        background: ${index % 2 === 0 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.4)'};
                        border: 1px solid rgba(255, 215, 0, 0.3);
                        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    `;
                    
                    const linhaFormula = document.createElement('div');
                    linhaFormula.style.cssText = `
                        font-size: 1.6em;
                        font-weight: bold;
                        color: #FFD700;
                        text-shadow: 1px 1px 2px #000, 0 0 10px rgba(255, 215, 0, 0.5);
                        margin-bottom: 8px;
                        font-family: 'Courier New', monospace;
                        text-align: center;
                        letter-spacing: 1px;
                    `;
                    linhaFormula.textContent = dano.formula;
                    
                    const linhaTipo = document.createElement('div');
                    linhaTipo.style.cssText = `
                        font-size: 1em;
                        color: #FFFFFF;
                        text-align: center;
                        line-height: 1.5;
                    `;
                    
                    let tipoTexto = `<span style="color:#FF6B6B; font-weight:bold;">${dano.tipo}</span>`;
                    tipoTexto += ` <span style="color:#4ECDC4;">(${dano.base})</span>`;
                    
                    if (dano.alcance && dano.alcance !== '1') {
                        tipoTexto += `<br><span style="color:#45B7D1;">Alcance: ${dano.alcance}</span>`;
                    }
                    
                    if (dano.maos) {
                        let textoMaos = '';
                        if (dano.maos === 1.5) {
                            textoMaos = '1 ou 2 mãos';
                        } else if (dano.maos === 1) {
                            textoMaos = '1 mão';
                        } else {
                            textoMaos = `${dano.maos} mãos`;
                        }
                        tipoTexto += `<br><span style="color:#FFD166;">${textoMaos}</span>`;
                    }
                    
                    linhaTipo.innerHTML = tipoTexto;
                    
                    containerDano.appendChild(linhaFormula);
                    containerDano.appendChild(linhaTipo);
                    armaDano.appendChild(containerDano);
                });
            }
            
            const stMinimo = estado.armaEquipada.st;
            const stEfetivo = estado.fadigaAtiva ? Math.ceil(estado.stAtual / 2) : estado.stAtual;
            
            if (stMinimo && stEfetivo < stMinimo) {
                const avisoST = document.createElement('div');
                avisoST.style.cssText = `
                    color: #FF6B6B;
                    font-size: 0.9em;
                    margin-top: 12px;
                    padding: 10px;
                    background: rgba(255, 107, 107, 0.15);
                    border-radius: 8px;
                    border-left: 4px solid #FF6B6B;
                    text-align: center;
                    font-weight: bold;
                `;
                avisoST.innerHTML = `<i class="fas fa-exclamation-triangle" style="margin-right:8px;"></i> ST atual (${stEfetivo}) < ST mínimo (${stMinimo})`;
                
                if (armaTipo) {
                    armaTipo.appendChild(avisoST);
                }
            }
            
        } else {
            semArma.style.display = 'flex';
            comArma.style.display = 'none';
            
            const danoCorporal = calcularDanoCorporal();
            const gdpDisplay = document.getElementById('danoGdp');
            const gebDisplay = document.getElementById('danoGeb');
            
            if (gdpDisplay) gdpDisplay.textContent = danoCorporal.gdp.formula;
            if (gebDisplay) gebDisplay.textContent = danoCorporal.geb.formula;
        }
    }

    function atualizarStatusFadiga() {
        const stDisplay = document.getElementById('stEfetivoDisplay');
        if (!stDisplay) return;
        
        if (estado.fadigaAtiva) {
            const stReduzido = Math.ceil(estado.stAtual / 2);
            stDisplay.textContent = `${stReduzido} (reduzido pela fadiga)`;
            stDisplay.style.color = '#FFA500';
            stDisplay.style.fontWeight = 'bold';
        } else {
            stDisplay.textContent = estado.stAtual;
            stDisplay.style.color = '';
            stDisplay.style.fontWeight = '';
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
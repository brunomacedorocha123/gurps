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

    // TABELA DE DANO POR ST (mesma do seu sistema de atributos)
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

    // ========== MONITORAMENTO DO ST EM TEMPO REAL ==========

    function monitorarST() {
        const stInput = document.getElementById('ST');
        if (!stInput) return;
        
        estado.stAtual = parseInt(stInput.value) || 10;
        
        stInput.addEventListener('input', () => {
            setTimeout(() => {
                const novoST = parseInt(stInput.value) || 10;
                if (novoST !== estado.stAtual) {
                    estado.stAtual = novoST;
                    console.log(`🔄 ST alterado para: ${novoST}`);
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
            console.log(`🎯 Dano base atualizado: GDP=${dadosST.gdp}, GEB=${dadosST.geb}`);
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
                    console.log(`🔄 Fadiga alterada: ${novaFadiga ? 'ATIVA' : 'INATIVA'}`);
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
            console.log('🔄 Equipamentos atualizados, recalculando dano...');
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
                        console.log(`⚔️ Arma equipada: ${item.nome}`);
                        return;
                    }
                }
            }
            
            if (!estado.armaEquipada && equipamentos.corpo && equipamentos.corpo.length > 0) {
                for (const item of equipamentos.corpo) {
                    if (item.tipo === 'arma-cc' || item.tipo === 'arma-dist') {
                        estado.armaEquipada = item;
                        console.log(`⚔️ Arma no corpo: ${item.nome}`);
                        return;
                    }
                }
            }
        }
        
        console.log('🎯 Usando dano corporal (nenhuma arma equipada)');
    }

    // ========== CÁLCULO DO DANO (FUNÇÕES PRINCIPAIS) ==========

    function calcularTodosOsDanosDaArma(arma) {
        if (!arma) return [];
        
        const stEfetivo = estado.fadigaAtiva ? Math.ceil(estado.stAtual / 2) : estado.stAtual;
        const tiposDano = [];
        
        // 1. Se arma tem GDP (Golpe de Punho)
        if (arma.danoGDP && arma.danoGDP !== "-") {
            const modificadorGDP = arma.danoGDP.replace('GdP', '').trim();
            const formulaGDP = estado.danoBase.gdp + (modificadorGDP ? ` ${modificadorGDP}` : '');
            
            tiposDano.push({
                formula: formulaGDP,
                tipo: arma.tipoDanoGDP || 'contusão',
                base: 'GDP',
                nome: `${arma.nome} (GdP)`,
                stRequerido: arma.st
            });
        }
        
        // 2. Se arma tem GEB (Golpe de Braço)
        if (arma.danoGEB && arma.danoGEB !== "-") {
            const modificadorGEB = arma.danoGEB.replace('GeB', '').trim();
            const formulaGEB = estado.danoBase.geb + (modificadorGEB ? ` ${modificadorGEB}` : '');
            
            tiposDano.push({
                formula: formulaGEB,
                tipo: arma.tipoDanoGEB || 'corte',
                base: 'GEB',
                nome: `${arma.nome} (GeB)`,
                stRequerido: arma.st
            });
        }
        
        // 3. Se arma tem dano padrão (sem GDP/GEB separados)
        if (!tiposDano.length && arma.dano) {
            let formulaFinal = '';
            let tipoDano = arma.tipoDano || 'contusão';
            
            if (arma.dano.startsWith('GeB')) {
                const modificador = arma.dano.replace('GeB', '').trim();
                formulaFinal = estado.danoBase.geb + (modificador ? ` ${modificador}` : '');
            } else if (arma.dano.startsWith('GdP')) {
                const modificador = arma.dano.replace('GdP', '').trim();
                formulaFinal = estado.danoBase.gdp + (modificador ? ` ${modificador}` : '');
            } else {
                formulaFinal = arma.dano;
            }
            
            tiposDano.push({
                formula: formulaFinal,
                tipo: tipoDano,
                base: arma.dano.startsWith('GdP') ? 'GDP' : 'GEB',
                nome: arma.nome,
                stRequerido: arma.st
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
                stMinimo: null,
                stAtual: stEfetivo,
                stSuficiente: true,
                nome: 'Golpe de Punho',
                fadiga: estado.fadigaAtiva
            },
            geb: {
                formula: estado.danoBase.geb,
                tipo: 'contusão',
                alcance: '1',
                maos: 1,
                stMinimo: null,
                stAtual: stEfetivo,
                stSuficiente: true,
                nome: 'Golpe de Braço',
                fadiga: estado.fadigaAtiva
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
        
        if (gdpDisplay) {
            gdpDisplay.textContent = estado.danoBase.gdp;
            gdpDisplay.title = `Golpe de Punho (ST ${estado.stAtual})`;
        }
        
        if (gebDisplay) {
            gebDisplay.textContent = estado.danoBase.geb;
            gebDisplay.title = `Golpe de Braço (ST ${estado.stAtual})`;
        }
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
                    armaNome.innerHTML = `${estado.armaEquipada.nome} <span style="color:#e74c3c; font-size:0.8em;">(2 tipos)</span>`;
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
                        padding: 10px;
                        border-radius: 8px;
                        background: ${index % 2 === 0 ? 'rgba(52, 152, 219, 0.15)' : 'rgba(155, 89, 182, 0.15)'};
                        border: 1px solid ${index % 2 === 0 ? 'rgba(52, 152, 219, 0.3)' : 'rgba(155, 89, 182, 0.3)'};
                    `;
                    
                    const linhaFormula = document.createElement('div');
                    linhaFormula.style.cssText = `
                        font-size: 1.3em;
                        font-weight: bold;
                        color: #2c3e50;
                        margin-bottom: 4px;
                        font-family: monospace;
                    `;
                    linhaFormula.textContent = dano.formula;
                    
                    const linhaTipo = document.createElement('div');
                    linhaTipo.style.cssText = `
                        font-size: 0.9em;
                        color: #7f8c8d;
                        display: flex;
                        flex-wrap: wrap;
                        gap: 8px;
                    `;
                    
                    let tipoTexto = `<span style="color:#e74c3c; font-weight:bold;">${dano.tipo}</span>`;
                    if (dano.base) tipoTexto += ` <span style="color:#27ae60;">(${dano.base})</span>`;
                    if (estado.armaEquipada.alcance && estado.armaEquipada.alcance !== '1') {
                        tipoTexto += ` <span style="color:#3498db;">Alcance: ${estado.armaEquipada.alcance}</span>`;
                    }
                    if (estado.armaEquipada.maos) {
                        tipoTexto += ` <span style="color:#f39c12;">Mãos: ${estado.armaEquipada.maos}</span>`;
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
                    color: #e74c3c;
                    font-size: 0.85em;
                    margin-top: 12px;
                    padding: 8px 12px;
                    background: rgba(231, 76, 60, 0.1);
                    border-radius: 6px;
                    border-left: 4px solid #e74c3c;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                `;
                avisoST.innerHTML = `
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>
                        <strong>ST Insuficiente!</strong><br>
                        ST atual: ${stEfetivo} | ST mínimo da arma: ${stMinimo}
                    </div>
                `;
                
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
            
            if (gdpDisplay) {
                gdpDisplay.textContent = danoCorporal.gdp.formula;
                gdpDisplay.title = `Golpe de Punho (contusão) | ST: ${danoCorporal.gdp.stAtual}`;
            }
            if (gebDisplay) {
                gebDisplay.textContent = danoCorporal.geb.formula;
                gebDisplay.title = `Golpe de Braço (contusão) | ST: ${danoCorporal.geb.stAtual}`;
            }
        }
    }

    function atualizarStatusFadiga() {
        const stDisplay = document.getElementById('stEfetivoDisplay');
        if (!stDisplay) return;
        
        if (estado.fadigaAtiva) {
            const stReduzido = Math.ceil(estado.stAtual / 2);
            stDisplay.textContent = `${stReduzido} (reduzido pela fadiga)`;
            stDisplay.style.color = '#e67e22';
            stDisplay.style.fontWeight = 'bold';
        } else {
            stDisplay.textContent = estado.stAtual;
            stDisplay.style.color = '';
            stDisplay.style.fontWeight = '';
        }
    }

    // ========== INICIALIZAÇÃO ==========

    function inicializar() {
        console.log('⚔️ Inicializando sistema de dano...');
        
        monitorarST();
        monitorarFadiga();
        monitorarEquipamentos();
        
        setTimeout(() => {
            calcularEAtualizarInterface();
            console.log('✅ Sistema de dano inicializado!');
        }, 500);
    }

    function observarAbaCombate() {
        const combateTab = document.getElementById('combate');
        if (!combateTab) return;
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && 
                    combateTab.classList.contains('active')) {
                    
                    console.log('🎯 Aba Combate ativada, inicializando sistema de dano...');
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

    window.obterDanoPersonagem = function() {
        return {
            st: estado.stAtual,
            danoBase: estado.danoBase,
            armaEquipada: estado.armaEquipada,
            fadigaAtiva: estado.fadigaAtiva
        };
    };

    console.log('🔧 sistema-dano.js carregado com sucesso!');

})();
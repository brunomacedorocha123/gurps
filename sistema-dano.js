// sistema-dano.js - SISTEMA DINÂMICO QUE ATUALIZA COM ST EM TEMPO REAL
(function() {
    'use strict';

    // Estado do sistema
    const estado = {
        stAtual: 10,
        danoBase: { gdp: '1d-2', geb: '1d' }, // Vai ser atualizado dinamicamente
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
        // 1. Pega o ST atual do input
        const stInput = document.getElementById('ST');
        if (!stInput) return;
        
        estado.stAtual = parseInt(stInput.value) || 10;
        
        // 2. Ouve mudanças no ST
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
        
        // 3. Também ouve eventos do sistema de atributos
        document.addEventListener('atributosAlterados', (e) => {
            if (e.detail && e.detail.ST) {
                estado.stAtual = e.detail.ST;
                atualizarDanoBasePorST();
                calcularEAtualizarInterface();
            }
        });
        
        // Inicializa
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
            // Fallback para ST 10
            estado.danoBase.gdp = '1d-2';
            estado.danoBase.geb = '1d';
        }
    }

    // ========== MONITORAMENTO DA FADIGA ==========

    function monitorarFadiga() {
        // Ouve mudanças no estado de PF
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
        
        // Verifica estado inicial
        const estadoPF = document.getElementById('pfEstadoDisplay');
        if (estadoPF) {
            estado.fadigaAtiva = estadoPF.textContent === 'Fadigado' || 
                               estadoPF.textContent === 'Exausto';
        }
    }

    // ========== MONITORAMENTO DE EQUIPAMENTOS ==========

    function monitorarEquipamentos() {
        // Ouve eventos do sistema de equipamentos
        document.addEventListener('equipamentosAtualizados', () => {
            console.log('🔄 Equipamentos atualizados, recalculando dano...');
            buscarArmaEquipada();
            calcularEAtualizarInterface();
        });
        
        // Ouve mudanças no DOM para equipar/desequipar
        const observerDOM = new MutationObserver(() => {
            buscarArmaEquipada();
        });
        
        // Observa a lista de equipamentos adquiridos
        const listaEquipamentos = document.getElementById('lista-equipamentos-adquiridos');
        if (listaEquipamentos) {
            observerDOM.observe(listaEquipamentos, { 
                childList: true, 
                subtree: true 
            });
        }
        
        // Busca inicial
        buscarArmaEquipada();
    }

    function buscarArmaEquipada() {
        estado.armaEquipada = null;
        
        // Tenta pegar do sistema de equipamentos
        if (window.sistemaEquipamentos) {
            const equipamentos = window.sistemaEquipamentos.equipamentosEquipados;
            
            // 1. Procura arma nas mãos
            if (equipamentos.maos && equipamentos.maos.length > 0) {
                for (const item of equipamentos.maos) {
                    if (item.tipo === 'arma-cc' || item.tipo === 'arma-dist') {
                        estado.armaEquipada = item;
                        console.log(`⚔️ Arma equipada: ${item.nome}`);
                        return;
                    }
                }
            }
            
            // 2. Procura arma no corpo (se não tiver nas mãos)
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

    // ========== CÁLCULO DO DANO FINAL ==========

    function calcularDanoComArma(arma) {
        if (!arma) return null;
        
        // Calcula ST efetivo (considerando fadiga)
        const stEfetivo = estado.fadigaAtiva ? 
            Math.ceil(estado.stAtual / 2) : 
            estado.stAtual;
        
        // Verifica se o ST é suficiente para a arma
        const stSuficiente = !arma.st || stEfetivo >= arma.st;
        
        // Converte o dano da arma (que pode ser "GeB+2", "GdP-1", etc)
        let formulaFinal = '';
        let tipoDano = arma.tipoDano || 'contusão';
        
        if (arma.dano) {
            if (arma.dano.startsWith('GeB')) {
                // Dano base é GEB + modificador da arma
                const modificador = arma.dano.replace('GeB', '').trim();
                formulaFinal = estado.danoBase.geb + (modificador ? ` ${modificador}` : '');
            } else if (arma.dano.startsWith('GdP')) {
                // Dano base é GDP + modificador da arma
                const modificador = arma.dano.replace('GdP', '').trim();
                formulaFinal = estado.danoBase.gdp + (modificador ? ` ${modificador}` : '');
            } else {
                // Dano já é direto (ex: "1d+2")
                formulaFinal = arma.dano;
            }
        }
        
        // Para armas que têm GDP e GEB separados (como espada larga)
        if (arma.danoGDP && arma.danoGEB) {
            const usaDuasMaos = arma.maos === 2;
            if (usaDuasMaos) {
                // Usa GEB com duas mãos
                const modificador = arma.danoGEB.replace('GeB', '').trim();
                formulaFinal = estado.danoBase.geb + (modificador ? ` ${modificador}` : '');
                tipoDano = arma.tipoDanoGEB || tipoDano;
            } else {
                // Usa GDP com uma mão
                const modificador = arma.danoGDP.replace('GdP', '').trim();
                formulaFinal = estado.danoBase.gdp + (modificador ? ` ${modificador}` : '');
                tipoDano = arma.tipoDanoGDP || tipoDano;
            }
        }
        
        return {
            formula: formulaFinal,
            tipo: tipoDano,
            alcance: arma.alcance || '1',
            maos: arma.maos || 1,
            stMinimo: arma.st,
            stAtual: stEfetivo,
            stSuficiente: stSuficiente,
            nome: arma.nome,
            fadiga: estado.fadigaAtiva
        };
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
        // Atualiza dano base na interface
        atualizarDanoBaseDisplay();
        
        // Atualiza dano com arma equipada
        atualizarDanoArmaEquipada();
        
        // Atualiza status da fadiga
        atualizarStatusFadiga();
    }

    function atualizarDanoBaseDisplay() {
        // Atualiza os displays de dano GDP/GEB no card
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
            const danoCalculado = calcularDanoComArma(estado.armaEquipada);
            
            // Mostra seção COM arma
            semArma.style.display = 'none';
            comArma.style.display = 'block';
            
            if (armaNome) armaNome.textContent = estado.armaEquipada.nome;
            if (armaDano) {
                armaDano.textContent = danoCalculado.formula;
                
                // Adiciona ícone se ST insuficiente
                if (!danoCalculado.stSuficiente) {
                    armaDano.innerHTML = `${danoCalculado.formula} <span class="st-insuficiente" title="ST insuficiente! ST atual: ${danoCalculado.stAtual}, ST mínimo: ${danoCalculado.stMinimo}">⚠️</span>`;
                }
            }
            if (armaTipo) {
                let tipoTexto = danoCalculado.tipo;
                if (danoCalculado.alcance) tipoTexto += ` | Alcance: ${danoCalculado.alcance}`;
                if (danoCalculado.maos > 0) tipoTexto += ` | Mãos: ${danoCalculado.maos}`;
                armaTipo.textContent = tipoTexto;
            }
            
        } else {
            // Mostra seção SEM arma
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
            stDisplay.style.color = '#e67e22';
        } else {
            stDisplay.textContent = estado.stAtual;
            stDisplay.style.color = '';
        }
    }

    // ========== INICIALIZAÇÃO ==========

    function inicializar() {
        console.log('⚔️ Inicializando sistema de dano...');
        
        // Inicia monitoramentos
        monitorarST();
        monitorarFadiga();
        monitorarEquipamentos();
        
        // Atualiza interface inicial
        setTimeout(() => {
            calcularEAtualizarInterface();
            console.log('✅ Sistema de dano inicializado!');
        }, 500);
    }

    // ========== INTEGRAÇÃO COM A ABA COMBATE ==========

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
        
        // Se já estiver ativa
        if (combateTab.classList.contains('active')) {
            setTimeout(inicializar, 500);
        }
    }

    // ========== INICIALIZAÇÃO GLOBAL ==========

    document.addEventListener('DOMContentLoaded', function() {
        observarAbaCombate();
    });

    // ========== EXPORTAR FUNÇÕES (se necessário) ==========

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
// pv-pf.js - Sistema Completo de Pontos de Vida e Fadiga

// Estado do personagem
let estadoPersonagem = {
    pv: {
        base: 10,      // ST base do personagem
        modificador: 0, // Bônus/malús de itens, magias, etc.
        maximo: 10,    // base + modificador
        atual: 10      // Valor atual
    },
    pf: {
        base: 10,      // HT base do personagem
        modificador: 0, // Bônus/malús
        maximo: 10,    // base + modificador
        atual: 10      // Valor atual
    },
    dano: {
        gdp: "1d-2",   // Dano Golpe de Punho
        geb: "1d",     // Dano Golpe de Braço
        armaEquipada: null // Arma atual do personagem
    }
};

// Cache dos elementos DOM
let elementos = {};

// Estados de PV (cores e condições)
const estadosPV = {
    saudavel: {
        cor: '#27ae60',
        nome: 'Saudável',
        limite: 0.8, // 80% ou mais
        descricao: 'Perfeita saúde'
    },
    machucado: {
        cor: '#f1c40f',
        nome: 'Machucado',
        limite: 0.6, // 60% a 80%
        descricao: '-20%: Penalidade em ações físicas'
    },
    ferido: {
        cor: '#e67e22',
        nome: 'Ferido',
        limite: 0.4, // 40% a 60%
        descricao: '-40%: Penalidade severa'
    },
    critico: {
        cor: '#d35400',
        nome: 'Crítico',
        limite: 0.2, // 20% a 40%
        descricao: '-60%: À beira da morte'
    },
    morrendo: {
        cor: '#c0392b',
        nome: 'Morrendo',
        limite: 0.01, // 1% a 20%
        descricao: '-80%: Testes de HT ou morre'
    },
    inconsciente: {
        cor: '#7f8c8d',
        nome: 'Inconsciente',
        limite: 0, // 0% ou menos
        descricao: 'Inconsciente, morre se não estabilizar'
    }
};

// Estados de PF
const estadosPF = {
    normal: {
        cor: '#2ecc71',
        nome: 'Normal',
        limite: 0.33, // 1/3 ou mais
        descricao: 'Funcionamento normal'
    },
    fadigado: {
        cor: '#f39c12',
        nome: 'Fadigado',
        limite: 0.01, // 1% a 1/3
        descricao: '-1 em todas as ações físicas'
    },
    inconsciente: {
        cor: '#e74c3c',
        nome: 'Inconsciente',
        limite: 0, // 0% ou menos
        descricao: 'Cai inconsciente por fadiga'
    }
};

// Tabela de dano GURPS
const tabelaDano = {
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
    20: { gdp: "2d-1", geb: "3d+2" }
};

// ===== FUNÇÕES UTILITÁRIAS =====

function cacheElementos() {
    elementos = {
        // Elementos PV
        pvBase: document.getElementById('pvBase'),
        pvMaxValue: document.getElementById('pvMaxValue'),
        pvAtualValue: document.getElementById('pvAtualValue'),
        pvText: document.getElementById('pvText'),
        pvFill: document.getElementById('pvFill'),
        pvBar: document.getElementById('pvBar'),
        pvModificador: document.getElementById('pvModificador'),
        pvMaxInput: document.getElementById('pvMaxInput'),
        pvAtualInput: document.getElementById('pvAtualInput'),
        
        // Elementos PF
        pfBase: document.getElementById('pfBase'),
        pfMaxValue: document.getElementById('pfMaxValue'),
        pfAtualValue: document.getElementById('pfAtualValue'),
        pfText: document.getElementById('pfText'),
        pfFill: document.getElementById('pfFill'),
        pfBar: document.getElementById('pfBar'),
        pfModificador: document.getElementById('pfModificador'),
        pfMaxInput: document.getElementById('pfMaxInput'),
        pfAtualInput: document.getElementById('pfAtualInput'),
        
        // Elementos Dano
        danoGdp: document.getElementById('danoGdp'),
        danoGeb: document.getElementById('danoGeb'),
        
        // Arma equipada
        semArma: document.getElementById('semArma'),
        armaInfo: document.getElementById('armaInfo'),
        armaNome: document.getElementById('armaNome'),
        danoValor1: document.getElementById('danoValor1'),
        danoTipo1: document.getElementById('danoTipo1'),
        danoLinha2: document.getElementById('danoLinha2'),
        danoValor2: document.getElementById('danoValor2'),
        danoTipo2: document.getElementById('danoTipo2')
    };
}

// ===== FUNÇÕES PV =====

function atualizarPV() {
    // Recalcula máximo
    estadoPersonagem.pv.maximo = Math.max(estadoPersonagem.pv.base + estadoPersonagem.pv.modificador, 1);
    
    // Garante que atual não ultrapasse máximo
    if (estadoPersonagem.pv.atual > estadoPersonagem.pv.maximo) {
        estadoPersonagem.pv.atual = estadoPersonagem.pv.maximo;
    }
    
    // Atualiza UI
    atualizarDisplayPV();
    atualizarEstadoPV();
    salvarEstado();
}

function alterarPV(quantidade) {
    let novoValor = estadoPersonagem.pv.atual + quantidade;
    
    // Limites
    if (novoValor > estadoPersonagem.pv.maximo) {
        novoValor = estadoPersonagem.pv.maximo;
    } else if (novoValor < -estadoPersonagem.pv.maximo * 2) {
        novoValor = -estadoPersonagem.pv.maximo * 2;
    }
    
    estadoPersonagem.pv.atual = novoValor;
    atualizarPV();
}

function setPVBase(valor) {
    estadoPersonagem.pv.base = Math.max(parseInt(valor), 1);
    atualizarPV();
}

function setPVModificador(valor) {
    estadoPersonagem.pv.modificador = parseInt(valor) || 0;
    atualizarPV();
}

function setPVAtual(valor) {
    estadoPersonagem.pv.atual = Math.max(parseInt(valor), -estadoPersonagem.pv.maximo * 2);
    atualizarPV();
}

function setPVMaximo(valor) {
    const novoMaximo = Math.max(parseInt(valor), 1);
    estadoPersonagem.pv.maximo = novoMaximo;
    
    // Ajusta o modificador para manter consistência
    estadoPersonagem.pv.modificador = novoMaximo - estadoPersonagem.pv.base;
    
    // Ajusta atual se necessário
    if (estadoPersonagem.pv.atual > novoMaximo) {
        estadoPersonagem.pv.atual = novoMaximo;
    }
    
    atualizarPV();
}

function atualizarDisplayPV() {
    if (!elementos.pvBase) return;
    
    const pv = estadoPersonagem.pv;
    const porcentagem = (pv.atual / pv.maximo) * 100;
    
    // Atualiza valores
    elementos.pvBase.textContent = pv.base;
    elementos.pvMaxValue.textContent = pv.maximo;
    elementos.pvAtualValue.textContent = pv.atual;
    elementos.pvText.textContent = `${pv.atual}/${pv.maximo}`;
    
    // Atualiza barra
    elementos.pvFill.style.width = `${porcentagem}%`;
    
    // Atualiza cor da barra baseado no estado
    const estado = determinarEstadoPV();
    elementos.pvFill.style.background = `linear-gradient(90deg, ${estado.cor}, ${estado.cor}80)`;
    
    // Atualiza inputs
    elementos.pvModificador.value = pv.modificador;
    elementos.pvMaxInput.value = pv.maximo;
    elementos.pvAtualInput.value = pv.atual;
}

function determinarEstadoPV() {
    const porcentagem = estadoPersonagem.pv.atual / estadoPersonagem.pv.maximo;
    
    if (porcentagem > 0.8) return estadosPV.saudavel;
    if (porcentagem > 0.6) return estadosPV.machucado;
    if (porcentagem > 0.4) return estadosPV.ferido;
    if (porcentagem > 0.2) return estadosPV.critico;
    if (porcentagem > 0) return estadosPV.morrendo;
    return estadosPV.inconsciente;
}

function atualizarEstadoPV() {
    const estado = determinarEstadoPV();
    
    // Atualiza as cores dos estados na legenda
    const stateItems = document.querySelectorAll('.state-item');
    stateItems.forEach(item => {
        const estadoItem = item.dataset.state;
        if (estadoItem === estado.nome.toLowerCase()) {
            item.style.border = `2px solid ${estado.cor}`;
            item.style.background = `${estado.cor}15`;
        } else {
            item.style.border = 'none';
            item.style.background = 'rgba(255, 255, 255, 0.05)';
        }
    });
}

// ===== FUNÇÕES PF =====

function atualizarPF() {
    // Recalcula máximo
    estadoPersonagem.pf.maximo = Math.max(estadoPersonagem.pf.base + estadoPersonagem.pf.modificador, 1);
    
    // Garante que atual não ultrapasse máximo
    if (estadoPersonagem.pf.atual > estadoPersonagem.pf.maximo) {
        estadoPersonagem.pf.atual = estadoPersonagem.pf.maximo;
    }
    
    // Atualiza UI
    atualizarDisplayPF();
    atualizarEstadoPF();
    salvarEstado();
}

function alterarPF(quantidade) {
    let novoValor = estadoPersonagem.pf.atual + quantidade;
    
    // Limites
    if (novoValor > estadoPersonagem.pf.maximo) {
        novoValor = estadoPersonagem.pf.maximo;
    } else if (novoValor < -estadoPersonagem.pf.maximo) {
        novoValor = -estadoPersonagem.pf.maximo;
    }
    
    estadoPersonagem.pf.atual = novoValor;
    atualizarPF();
}

function setPFBase(valor) {
    estadoPersonagem.pf.base = Math.max(parseInt(valor), 1);
    atualizarPF();
}

function setPFModificador(valor) {
    estadoPersonagem.pf.modificador = parseInt(valor) || 0;
    atualizarPF();
}

function setPFAtual(valor) {
    estadoPersonagem.pf.atual = Math.max(parseInt(valor), -estadoPersonagem.pf.maximo);
    atualizarPF();
}

function setPFMaximo(valor) {
    const novoMaximo = Math.max(parseInt(valor), 1);
    estadoPersonagem.pf.maximo = novoMaximo;
    
    // Ajusta o modificador para manter consistência
    estadoPersonagem.pf.modificador = novoMaximo - estadoPersonagem.pf.base;
    
    // Ajusta atual se necessário
    if (estadoPersonagem.pf.atual > novoMaximo) {
        estadoPersonagem.pf.atual = novoMaximo;
    }
    
    atualizarPF();
}

function atualizarDisplayPF() {
    if (!elementos.pfBase) return;
    
    const pf = estadoPersonagem.pf;
    const porcentagem = (pf.atual / pf.maximo) * 100;
    
    // Atualiza valores
    elementos.pfBase.textContent = pf.base;
    elementos.pfMaxValue.textContent = pf.maximo;
    elementos.pfAtualValue.textContent = pf.atual;
    elementos.pfText.textContent = `${pf.atual}/${pf.maximo}`;
    
    // Atualiza barra
    elementos.pfFill.style.width = `${porcentagem}%`;
    
    // Atualiza cor da barra baseado no estado
    const estado = determinarEstadoPF();
    elementos.pfFill.style.background = `linear-gradient(90deg, ${estado.cor}, ${estado.cor}80)`;
    
    // Atualiza inputs
    elementos.pfModificador.value = pf.modificador;
    elementos.pfMaxInput.value = pf.maximo;
    elementos.pfAtualInput.value = pf.atual;
}

function determinarEstadoPF() {
    const porcentagem = estadoPersonagem.pf.atual / estadoPersonagem.pf.maximo;
    
    if (porcentagem >= 0.33) return estadosPF.normal;
    if (porcentagem > 0) return estadosPF.fadigado;
    return estadosPF.inconsciente;
}

function atualizarEstadoPF() {
    const estado = determinarEstadoPF();
    const estados = document.querySelectorAll('.pf-state');
    
    estados.forEach(pfState => {
        if (pfState.dataset.state === estado.nome.toLowerCase()) {
            pfState.classList.add('active');
            pfState.style.background = `${estado.cor}15`;
            pfState.style.borderColor = estado.cor;
        } else {
            pfState.classList.remove('active');
            pfState.style.background = '';
            pfState.style.borderColor = 'transparent';
        }
    });
}

// ===== FUNÇÕES DE DANO =====

function calcularDanoBase(ST) {
    let stKey = Math.min(Math.max(ST, 1), 20);
    const dano = tabelaDano[stKey];
    
    if (dano) {
        estadoPersonagem.dano.gdp = dano.gdp;
        estadoPersonagem.dano.geb = dano.geb;
        atualizarDisplayDano();
    }
}

function atualizarDisplayDano() {
    if (elementos.danoGdp) {
        elementos.danoGdp.textContent = estadoPersonagem.dano.gdp;
    }
    if (elementos.danoGeb) {
        elementos.danoGeb.textContent = estadoPersonagem.dano.geb;
    }
}

function equiparArma(arma) {
    if (!arma) {
        // Sem arma equipada
        if (elementos.semArma && elementos.armaInfo) {
            elementos.semArma.style.display = 'flex';
            elementos.armaInfo.style.display = 'none';
        }
        estadoPersonagem.dano.armaEquipada = null;
    } else {
        // Com arma equipada
        if (elementos.semArma && elementos.armaInfo) {
            elementos.semArma.style.display = 'none';
            elementos.armaInfo.style.display = 'block';
            
            elementos.armaNome.textContent = arma.nome || "Arma Desconhecida";
            
            // Primeiro tipo de dano (sempre existe)
            if (arma.dano1 && arma.tipo1) {
                elementos.danoValor1.textContent = arma.dano1;
                elementos.danoTipo1.textContent = arma.tipo1;
            }
            
            // Segundo tipo de dano (se existir)
            if (arma.dano2 && arma.tipo2) {
                elementos.danoLinha2.style.display = 'flex';
                elementos.danoValor2.textContent = arma.dano2;
                elementos.danoTipo2.textContent = arma.tipo2;
            } else {
                elementos.danoLinha2.style.display = 'none';
            }
        }
        estadoPersonagem.dano.armaEquipada = arma;
    }
    
    salvarEstado();
}

// ===== INTEGRAÇÃO COM ATRIBUTOS =====

function receberAtributos(atributos) {
    // Recebe ST e HT da aba de atributos
    if (atributos.ST) {
        setPVBase(atributos.ST);
        calcularDanoBase(atributos.ST);
    }
    if (atributos.HT) {
        setPFBase(atributos.HT);
    }
    
    // Recebe PV e PF totais se existirem
    if (atributos.PV) {
        setPVMaximo(atributos.PV);
    }
    if (atributos.PF) {
        setPFMaximo(atributos.PF);
    }
    
    console.log('Atributos recebidos:', atributos);
}

// ===== SISTEMA DE SALVAR/CARREGAR =====

function salvarEstado() {
    try {
        localStorage.setItem('gurps_combate', JSON.stringify(estadoPersonagem));
    } catch (e) {
        console.warn('Não foi possível salvar o estado:', e);
    }
}

function carregarEstado() {
    try {
        const salvo = localStorage.getItem('gurps_combate');
        if (salvo) {
            const dados = JSON.parse(salvo);
            
            // Mescla os dados salvos com o estado atual
            if (dados.pv) estadoPersonagem.pv = { ...estadoPersonagem.pv, ...dados.pv };
            if (dados.pf) estadoPersonagem.pf = { ...estadoPersonagem.pf, ...dados.pf };
            if (dados.dano) estadoPersonagem.dano = { ...estadoPersonagem.dano, ...dados.dano };
            
            atualizarPV();
            atualizarPF();
            atualizarDisplayDano();
            
            if (dados.dano?.armaEquipada) {
                equiparArma(dados.dano.armaEquipada);
            }
            
            console.log('Estado de combate carregado');
        }
    } catch (e) {
        console.warn('Erro ao carregar estado:', e);
    }
}

// ===== SISTEMA DE DEFESAS =====

function atualizarDefesas(atributos) {
    if (!atributos) return;
    
    const { DX = 10, HT = 10 } = atributos;
    
    // Cálculo das defesas
    const esquivaBase = Math.floor(DX + (HT / 4) + 3);
    const bloqueioBase = 3; // Base do escudo
    const apararBase = 3; // Base da arma
    const deslocamentoBase = ((DX + HT) / 4).toFixed(2);
    
    // Atualiza os valores base
    const atualizarDefesa = (id, valor) => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = valor;
    };
    
    atualizarDefesa('esquivaBase', esquivaBase);
    atualizarDefesa('bloqueioBase', bloqueioBase);
    atualizarDefesa('apararBase', apararBase);
    atualizarDefesa('deslocamentoBase', deslocamentoBase);
    
    // Atualiza os totais
    atualizarTotalDefesa('esquiva', esquivaBase);
    atualizarTotalDefesa('bloqueio', bloqueioBase);
    atualizarTotalDefesa('aparar', apararBase);
    atualizarTotalDefesa('deslocamento', parseFloat(deslocamentoBase));
}

function atualizarTotalDefesa(tipo, base) {
    const modElement = document.getElementById(`${tipo}Mod`);
    const totalElement = document.getElementById(`${tipo}Total`);
    
    if (modElement && totalElement) {
        const mod = parseInt(modElement.textContent) || 0;
        const total = tipo === 'deslocamento' 
            ? (parseFloat(base) + mod).toFixed(2)
            : base + mod;
        
        totalElement.textContent = total;
    }
}

// ===== SISTEMA DE CONDIÇÕES =====

function inicializarCondicoes() {
    const condicoesGrid = document.querySelector('.condicoes-grid');
    if (!condicoesGrid) return;
    
    const condicoes = condicoesGrid.querySelectorAll('.condicao-item');
    const contador = document.getElementById('condicoesAtivas');
    
    // Carrega condições salvas
    const condicoesSalvas = localStorage.getItem('gurps_condicoes');
    const condicoesAtivas = condicoesSalvas ? JSON.parse(condicoesSalvas) : {};
    
    condicoes.forEach(condicao => {
        const nomeCondicao = condicao.dataset.condicao;
        const checkbox = condicao.querySelector('.condicao-checkbox');
        
        // Define estado inicial
        if (condicoesAtivas[nomeCondicao]) {
            condicao.classList.add('active');
        }
        
        // Event listener
        condicao.addEventListener('click', () => {
            condicao.classList.toggle('active');
            
            // Atualiza o estado salvo
            condicoesAtivas[nomeCondicao] = condicao.classList.contains('active');
            localStorage.setItem('gurps_condicoes', JSON.stringify(condicoesAtivas));
            
            // Atualiza contador
            const ativas = Object.values(condicoesAtivas).filter(Boolean).length;
            if (contador) contador.textContent = ativas;
        });
    });
    
    // Atualiza contador inicial
    const ativas = Object.values(condicoesAtivas).filter(Boolean).length;
    if (contador) contador.textContent = ativas;
}

// ===== EVENT LISTENERS =====

function configurarEventListeners() {
    // Botões de dano/cura PV
    document.querySelectorAll('.btn-dano').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseInt(btn.dataset.amount);
            alterarPV(amount);
        });
    });
    
    document.querySelectorAll('.btn-cura').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseInt(btn.dataset.amount);
            alterarPV(amount);
        });
    });
    
    // Botões de fadiga/descanso PF
    document.querySelectorAll('.btn-fadiga').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseInt(btn.dataset.amount);
            alterarPF(amount);
        });
    });
    
    document.querySelectorAll('.btn-descanso').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseInt(btn.dataset.amount);
            alterarPF(amount);
        });
    });
    
    // Inputs de modificador PV
    if (elementos.pvModificador) {
        elementos.pvModificador.addEventListener('change', (e) => {
            setPVModificador(e.target.value);
        });
        
        elementos.pvModificador.addEventListener('blur', (e) => {
            setPVModificador(e.target.value);
        });
    }
    
    // Inputs de modificador PF
    if (elementos.pfModificador) {
        elementos.pfModificador.addEventListener('change', (e) => {
            setPFModificador(e.target.value);
        });
        
        elementos.pfModificador.addEventListener('blur', (e) => {
            setPFModificador(e.target.value);
        });
    }
    
    // Inputs de máximo PV
    if (elementos.pvMaxInput) {
        elementos.pvMaxInput.addEventListener('change', (e) => {
            setPVMaximo(parseInt(e.target.value));
        });
        
        elementos.pvMaxInput.addEventListener('blur', (e) => {
            setPVMaximo(parseInt(e.target.value));
        });
    }
    
    // Inputs de máximo PF
    if (elementos.pfMaxInput) {
        elementos.pfMaxInput.addEventListener('change', (e) => {
            setPFMaximo(parseInt(e.target.value));
        });
        
        elementos.pfMaxInput.addEventListener('blur', (e) => {
            setPFMaximo(parseInt(e.target.value));
        });
    }
    
    // Inputs de atual PV
    if (elementos.pvAtualInput) {
        elementos.pvAtualInput.addEventListener('change', (e) => {
            setPVAtual(parseInt(e.target.value));
        });
        
        elementos.pvAtualInput.addEventListener('blur', (e) => {
            setPVAtual(parseInt(e.target.value));
        });
    }
    
    // Inputs de atual PF
    if (elementos.pfAtualInput) {
        elementos.pfAtualInput.addEventListener('change', (e) => {
            setPFAtual(parseInt(e.target.value));
        });
        
        elementos.pfAtualInput.addEventListener('blur', (e) => {
            setPFAtual(parseInt(e.target.value));
        });
    }
    
    // Botões de modificador (+/-)
    document.querySelectorAll('.mod-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const parent = btn.closest('.mod-control');
            if (!parent) return;
            
            const input = parent.querySelector('.mod-input');
            if (!input) return;
            
            const change = parseInt(btn.dataset.change) || 0;
            let valor = parseInt(input.value) + change;
            
            // Aplica limites
            if (input.id === 'pvModificador') {
                valor = Math.max(Math.min(valor, 20), -20);
                input.value = valor;
                setPVModificador(valor);
            } else if (input.id === 'pfModificador') {
                valor = Math.max(Math.min(valor, 10), -10);
                input.value = valor;
                setPFModificador(valor);
            }
        });
    });
    
    // Botões de modificador de defesas
    document.querySelectorAll('.defesa-mod .mod-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const parent = btn.closest('.defesa-mod');
            if (!parent) return;
            
            const modValue = parent.querySelector('.mod-value');
            const tipo = btn.closest('.defesa-item').dataset.tipo;
            
            if (modValue && tipo) {
                let valor = parseInt(modValue.textContent) || 0;
                if (btn.classList.contains('plus')) {
                    valor++;
                } else if (btn.classList.contains('minus')) {
                    valor--;
                }
                
                modValue.textContent = valor;
                atualizarTotalDefesa(tipo, parseFloat(document.getElementById(`${tipo}Base`).textContent));
            }
        });
    });
}

// ===== INICIALIZAÇÃO =====

function inicializarSistemaCombate() {
    console.log('Inicializando sistema de combate...');
    
    // Cache elementos DOM
    cacheElementos();
    
    // Carrega estado salvo
    carregarEstado();
    
    // Configura event listeners
    configurarEventListeners();
    
    // Inicializa sistema de condições
    inicializarCondicoes();
    
    // Tenta obter atributos imediatamente
    if (window.obterDadosAtributos) {
        const atributos = window.obterDadosAtributos();
        if (atributos) {
            receberAtributos(atributos);
            atualizarDefesas(atributos);
        }
    }
    
    // Configura listener para eventos de atributos
    document.addEventListener('atributosAlterados', (e) => {
        if (e.detail) {
            receberAtributos(e.detail);
            atualizarDefesas(e.detail);
        }
    });
    
    console.log('Sistema de combate inicializado com sucesso!');
}

// ===== INTEGRAÇÃO COM EQUIPAMENTOS =====

// Função para receber arma equipada do sistema de equipamentos
function receberArmaEquipada(arma) {
    if (arma && arma.tipo === 'arma') {
        equiparArma({
            nome: arma.nome,
            dano1: arma.dano || arma.dano1,
            tipo1: arma.tipoDano || arma.tipo1,
            dano2: arma.dano2,
            tipo2: arma.tipo2
        });
    } else {
        equiparArma(null);
    }
}

// ===== EXPORTAÇÃO PARA OUTROS MÓDULOS =====

window.obterEstadoCombate = function() {
    return {
        pv: { ...estadoPersonagem.pv },
        pf: { ...estadoPersonagem.pf },
        dano: { ...estadoPersonagem.dano }
    };
};

window.obterPV = function() {
    return estadoPersonagem.pv.atual;
};

window.obterPF = function() {
    return estadoPersonagem.pf.atual;
};

window.aplicarDano = function(quantidade, tipo = 'pv') {
    if (tipo === 'pv') {
        alterarPV(-quantidade);
    } else if (tipo === 'pf') {
        alterarPF(-quantidade);
    }
};

window.curar = function(quantidade, tipo = 'pv') {
    if (tipo === 'pv') {
        alterarPV(quantidade);
    } else if (tipo === 'pf') {
        alterarPF(quantidade);
    }
};

window.atualizarDefesas = atualizarDefesas;
window.receberAtributos = receberAtributos;
window.receberArmaEquipada = receberArmaEquipada;

// Inicialização automática quando a aba estiver pronta
document.addEventListener('DOMContentLoaded', () => {
    // Aguarda um pouco para garantir que o DOM esteja completamente carregado
    setTimeout(() => {
        const combateTab = document.getElementById('combate');
        if (combateTab && combateTab.classList.contains('active')) {
            inicializarSistemaCombate();
        }
        
        // Observa mudanças nas abas
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const tab = mutation.target;
                    if (tab.id === 'combate' && tab.classList.contains('active')) {
                        setTimeout(inicializarSistemaCombate, 100);
                    }
                }
            });
        });
        
        // Observa a aba de combate
        if (combateTab) {
            observer.observe(combateTab, { attributes: true });
        }
    }, 500);
});

// Exporta a função de inicialização para ser chamada manualmente se necessário
window.inicializarSistemaCombate = inicializarSistemaCombate;
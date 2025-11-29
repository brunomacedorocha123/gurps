// ===== SISTEMA DE ATRIBUTOS - GURPS =====
// Versão 1.0 - Sistema Completo

// Tabelas de referência
const danoTable = {
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
    30: { gdp: "3d", geb: "5d+2" },
    31: { gdp: "3d+1", geb: "6d-1" },
    32: { gdp: "3d+1", geb: "6d-1" },
    33: { gdp: "3d+2", geb: "6d" },
    34: { gdp: "3d+2", geb: "6d" },
    35: { gdp: "4d-1", geb: "6d+1" },
    36: { gdp: "4d-1", geb: "6d+1" },
    37: { gdp: "4d", geb: "6d+2" },
    38: { gdp: "4d", geb: "6d+2" },
    39: { gdp: "4d+1", geb: "7d-1" },
    40: { gdp: "4d+1", geb: "7d-1" }
};

const cargasTable = {
    1: { nenhuma: 0.1, leve: 0.2, media: 0.3, pesada: 0.6, muitoPesada: 1.0 },
    2: { nenhuma: 0.4, leve: 0.8, media: 1.2, pesada: 2.4, muitoPesada: 4.0 },
    3: { nenhuma: 0.9, leve: 1.8, media: 2.7, pesada: 5.4, muitoPesada: 9.0 },
    4: { nenhuma: 1.6, leve: 3.2, media: 4.8, pesada: 9.6, muitoPesada: 16.0 },
    5: { nenhuma: 2.5, leve: 5.0, media: 7.5, pesada: 15.0, muitoPesada: 25.5 },
    6: { nenhuma: 3.6, leve: 7.2, media: 10.8, pesada: 21.6, muitoPesada: 36.0 },
    7: { nenhuma: 4.9, leve: 9.8, media: 14.7, pesada: 29.4, muitoPesada: 49.0 },
    8: { nenhuma: 6.5, leve: 13.0, media: 19.5, pesada: 39.0, muitoPesada: 65.0 },
    9: { nenhuma: 8.0, leve: 16.0, media: 24.0, pesada: 48.0, muitoPesada: 80.0 },
    10: { nenhuma: 10.0, leve: 20.0, media: 30.0, pesada: 60.0, muitoPesada: 100.0 },
    11: { nenhuma: 12.0, leve: 24.0, media: 36.0, pesada: 72.0, muitoPesada: 120.0 },
    12: { nenhuma: 14.5, leve: 29.0, media: 43.5, pesada: 87.0, muitoPesada: 145.0 },
    13: { nenhuma: 17.0, leve: 34.0, media: 51.0, pesada: 102.0, muitoPesada: 170.0 },
    14: { nenhuma: 19.5, leve: 39.0, media: 58.5, pesada: 117.0, muitoPesada: 195.0 },
    15: { nenhuma: 22.5, leve: 45.0, media: 67.5, pesada: 135.0, muitoPesada: 225.0 },
    16: { nenhuma: 25.5, leve: 51.0, media: 76.5, pesada: 153.0, muitoPesada: 255.0 },
    17: { nenhuma: 29.0, leve: 58.0, media: 87.0, pesada: 174.0, muitoPesada: 294.0 },
    18: { nenhuma: 32.5, leve: 65.0, media: 97.5, pesada: 195.0, muitoPesada: 325.0 },
    19: { nenhuma: 36.0, leve: 72.0, media: 108.0, pesada: 216.0, muitoPesada: 360.0 },
    20: { nenhuma: 40.0, leve: 80.0, media: 120.0, pesada: 240.0, muitoPesada: 400.0 }
};

// Estado do personagem
let personagem = {
    pontos: { total: 150, gastos: 0, saldo: 150 },
    atributos: { ST: 10, DX: 10, IQ: 10, HT: 10 }
};

// ===== FUNÇÕES PRINCIPAIS =====

function alterarAtributo(atributo, valor) {
    const input = document.getElementById(atributo);
    let novoValor = parseInt(input.value) + valor;
    
    if (novoValor < 1) novoValor = 1;
    if (novoValor > 40) novoValor = 40;
    
    input.value = novoValor;
    atualizarAtributos();
}

function atualizarAtributos() {
    const ST = parseInt(document.getElementById('ST').value) || 10;
    const DX = parseInt(document.getElementById('DX').value) || 10;
    const IQ = parseInt(document.getElementById('IQ').value) || 10;
    const HT = parseInt(document.getElementById('HT').value) || 10;
    
    personagem.atributos.ST = ST;
    personagem.atributos.DX = DX;
    personagem.atributos.IQ = IQ;
    personagem.atributos.HT = HT;
    
    calcularAtributosSecundarios(ST, DX, IQ, HT);
    calcularDanoBase(ST);
    calcularCargas(ST);
    calcularPontos();
    atualizarCustos();
}

function calcularAtributosSecundarios(ST, DX, IQ, HT) {
    document.getElementById('PV').textContent = ST;
    document.getElementById('PF').textContent = HT;
    document.getElementById('Vontade').textContent = IQ;
    document.getElementById('Percepcao').textContent = IQ;
    
    const deslocamentoBase = (HT + DX) / 4;
    document.getElementById('Deslocamento').textContent = deslocamentoBase.toFixed(2);
}

function calcularDanoBase(ST) {
    let stKey = ST;
    if (ST > 40) stKey = 40;
    if (ST < 1) stKey = 1;
    
    const dano = danoTable[stKey];
    if (dano) {
        document.getElementById('danoGDP').textContent = dano.gdp;
        document.getElementById('danoGEB').textContent = dano.geb;
    }
}

function calcularCargas(ST) {
    let stKey = ST;
    if (ST > 20) stKey = 20;
    if (ST < 1) stKey = 1;
    
    const cargas = cargasTable[stKey];
    if (cargas) {
        document.getElementById('cargaNenhuma').textContent = cargas.nenhuma.toFixed(1);
        document.getElementById('cargaLeve').textContent = cargas.leve.toFixed(1);
        document.getElementById('cargaMedia').textContent = cargas.media.toFixed(1);
        document.getElementById('cargaPesada').textContent = cargas.pesada.toFixed(1);
        document.getElementById('cargaMuitoPesada').textContent = cargas.muitoPesada.toFixed(1);
    }
}

function calcularPontos() {
    const ST = personagem.atributos.ST;
    const DX = personagem.atributos.DX;
    const IQ = personagem.atributos.IQ;
    const HT = personagem.atributos.HT;
    
    const custoST = (ST - 10) * 10;
    const custoDX = (DX - 10) * 20;
    const custoIQ = (IQ - 10) * 20;
    const custoHT = (HT - 10) * 10;
    
    const totalGastos = custoST + custoDX + custoIQ + custoHT;
    
    personagem.pontos.gastos = totalGastos;
    personagem.pontos.saldo = personagem.pontos.total - totalGastos;
    
    document.getElementById('pontosGastos').textContent = totalGastos;
    document.getElementById('pontosSaldo').textContent = personagem.pontos.saldo;
}

function atualizarCustos() {
    const ST = personagem.atributos.ST;
    const DX = personagem.atributos.DX;
    const IQ = personagem.atributos.IQ;
    const HT = personagem.atributos.HT;
    
    document.getElementById('custoST').textContent = (ST - 10) * 10;
    document.getElementById('custoDX').textContent = (DX - 10) * 20;
    document.getElementById('custoIQ').textContent = (IQ - 10) * 20;
    document.getElementById('custoHT').textContent = (HT - 10) * 10;
}

// ===== INICIALIZAÇÃO =====

function inicializarAtributos() {
    // Remove o loading e mostra o conteúdo
    const atributosTab = document.getElementById('atributos');
    if (atributosTab) {
        atributosTab.innerHTML = atributosTab.innerHTML.replace('loading', '');
        const loadingElement = atributosTab.querySelector('.loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
    
    configurarEventListeners();
    atualizarAtributos();
}

function configurarEventListeners() {
    const inputs = ['ST', 'DX', 'IQ', 'HT'];
    
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', () => {
                clearTimeout(window.inputTimeout);
                window.inputTimeout = setTimeout(() => {
                    atualizarAtributos();
                }, 300);
            });
            
            input.addEventListener('change', () => {
                atualizarAtributos();
            });
        }
    });
}

// ===== INTEGRAÇÃO COM O SISTEMA PRINCIPAL =====

function obterDadosAtributos() {
    return {
        ST: personagem.atributos.ST,
        DX: personagem.atributos.DX,
        IQ: personagem.atributos.IQ,
        HT: personagem.atributos.HT,
        PV: personagem.atributos.ST,
        PF: personagem.atributos.HT,
        Vontade: personagem.atributos.IQ,
        Percepcao: personagem.atributos.IQ,
        Deslocamento: parseFloat(document.getElementById('Deslocamento').textContent),
        DanoGDP: document.getElementById('danoGDP').textContent,
        DanoGEB: document.getElementById('danoGEB').textContent,
        PontosGastos: personagem.pontos.gastos
    };
}

function carregarDadosAtributos(dados) {
    if (dados.ST) {
        document.getElementById('ST').value = dados.ST;
        personagem.atributos.ST = dados.ST;
    }
    if (dados.DX) {
        document.getElementById('DX').value = dados.DX;
        personagem.atributos.DX = dados.DX;
    }
    if (dados.IQ) {
        document.getElementById('IQ').value = dados.IQ;
        personagem.atributos.IQ = dados.IQ;
    }
    if (dados.HT) {
        document.getElementById('HT').value = dados.HT;
        personagem.atributos.HT = dados.HT;
    }
    
    atualizarAtributos();
}

// ===== EXPORTAÇÃO DE FUNÇÕES =====

window.alterarAtributo = alterarAtributo;
window.atualizarAtributos = atualizarAtributos;
window.obterDadosAtributos = obterDadosAtributos;
window.carregarDadosAtributos = carregarDadosAtributos;

// Inicialização quando a aba for carregada
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa imediatamente se a aba já estiver ativa
    const atributosTab = document.getElementById('atributos');
    if (atributosTab && atributosTab.classList.contains('active')) {
        inicializarAtributos();
    }
    
    // Observa mudanças nas abas
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'atributos' && tab.classList.contains('active')) {
                    setTimeout(() => {
                        inicializarAtributos();
                    }, 100);
                }
            }
        });
    });
    
    // Observa todas as abas
    document.querySelectorAll('.tab-content').forEach(tab => {
        observer.observe(tab, { attributes: true });
    });
});
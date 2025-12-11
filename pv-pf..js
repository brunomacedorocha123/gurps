// pv-pf.js - Sistema de Pontos de Vida e Fadiga

// Estado do personagem
let estadoPersonagem = {
    pv: {
        base: 10,      // Base é o ST
        modificador: 0, // Bônus/malús
        maximo: 10,    // base + modificador
        atual: 10      // Valor atual
    },
    pf: {
        base: 10,      // Base é o HT
        modificador: 0, // Bônus/malús
        maximo: 10,    // base + modificador
        atual: 10      // Valor atual
    }
};

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

// ===== FUNÇÕES PV =====

function atualizarPV() {
    // Atualiza máximo
    const base = estadoPersonagem.pv.base;
    const mod = estadoPersonagem.pv.modificador;
    estadoPersonagem.pv.maximo = Math.max(base + mod, 1);
    
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
        novoValor = -estadoPersonagem.pv.maximo * 2; // Limite inferior
    }
    
    estadoPersonagem.pv.atual = novoValor;
    atualizarPV();
}

function setPVBase(valor) {
    estadoPersonagem.pv.base = Math.max(valor, 1);
    atualizarPV();
}

function setPVModificador(valor) {
    estadoPersonagem.pv.modificador = parseInt(valor) || 0;
    atualizarPV();
}

function setPVAtual(valor) {
    estadoPersonagem.pv.atual = Math.max(valor, -estadoPersonagem.pv.maximo * 2);
    atualizarPV();
}

function setPVMaximo(valor) {
    estadoPersonagem.pv.maximo = Math.max(valor, 1);
    
    // Ajusta atual se necessário
    if (estadoPersonagem.pv.atual > estadoPersonagem.pv.maximo) {
        estadoPersonagem.pv.atual = estadoPersonagem.pv.maximo;
    }
    
    atualizarPV();
}

function atualizarDisplayPV() {
    const pv = estadoPersonagem.pv;
    const porcentagem = (pv.atual / pv.maximo) * 100;
    
    // Atualiza valores
    document.getElementById('pvBase').textContent = pv.base;
    document.getElementById('pvMaxValue').textContent = pv.maximo;
    document.getElementById('pvAtualValue').textContent = pv.atual;
    document.getElementById('pvText').textContent = `${pv.atual}/${pv.maximo}`;
    
    // Atualiza barra
    const pvFill = document.getElementById('pvFill');
    const pvBar = document.getElementById('pvBar');
    
    pvFill.style.width = `${porcentagem}%`;
    
    // Atualiza cor da barra baseado no estado
    const estado = determinarEstadoPV();
    pvFill.style.background = `linear-gradient(90deg, ${estado.cor}, ${estado.cor}80)`;
    
    // Atualiza inputs
    document.getElementById('pvModificador').value = pv.modificador;
    document.getElementById('pvMaxInput').value = pv.maximo;
    document.getElementById('pvAtualInput').value = pv.atual;
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
    
    // Atualiza cor do estado
    const stateItems = document.querySelectorAll('.state-item');
    stateItems.forEach(item => {
        if (item.dataset.state === estado.nome.toLowerCase()) {
            item.style.border = `2px solid ${estado.cor}`;
        } else {
            item.style.border = 'none';
        }
    });
}

// ===== FUNÇÕES PF =====

function atualizarPF() {
    // Atualiza máximo
    const base = estadoPersonagem.pf.base;
    const mod = estadoPersonagem.pf.modificador;
    estadoPersonagem.pf.maximo = Math.max(base + mod, 1);
    
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
    estadoPersonagem.pf.base = Math.max(valor, 1);
    atualizarPF();
}

function setPFModificador(valor) {
    estadoPersonagem.pf.modificador = parseInt(valor) || 0;
    atualizarPF();
}

function setPFAtual(valor) {
    estadoPersonagem.pf.atual = Math.max(valor, -estadoPersonagem.pf.maximo);
    atualizarPF();
}

function setPFMaximo(valor) {
    estadoPersonagem.pf.maximo = Math.max(valor, 1);
    
    // Ajusta atual se necessário
    if (estadoPersonagem.pf.atual > estadoPersonagem.pf.maximo) {
        estadoPersonagem.pf.atual = estadoPersonagem.pf.maximo;
    }
    
    atualizarPF();
}

function atualizarDisplayPF() {
    const pf = estadoPersonagem.pf;
    const porcentagem = (pf.atual / pf.maximo) * 100;
    
    // Atualiza valores
    document.getElementById('pfBase').textContent = pf.base;
    document.getElementById('pfMaxValue').textContent = pf.maximo;
    document.getElementById('pfAtualValue').textContent = pf.atual;
    document.getElementById('pfText').textContent = `${pf.atual}/${pf.maximo}`;
    
    // Atualiza barra
    const pfFill = document.getElementById('pfFill');
    pfFill.style.width = `${porcentagem}%`;
    
    // Atualiza inputs
    document.getElementById('pfModificador').value = pf.modificador;
    document.getElementById('pfMaxInput').value = pf.maximo;
    document.getElementById('pfAtualInput').value = pf.atual;
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
        } else {
            pfState.classList.remove('active');
        }
    });
}

// ===== INTEGRAÇÃO COM ATRIBUTOS =====

function receberAtributos(atributos) {
    // Recebe ST e HT da aba de atributos
    if (atributos.ST) {
        setPVBase(atributos.ST);
    }
    if (atributos.HT) {
        setPFBase(atributos.HT);
    }
}

// ===== SISTEMA DE SALVAR/CARREGAR =====

function salvarEstado() {
    localStorage.setItem('gurps_pv_pf', JSON.stringify(estadoPersonagem));
}

function carregarEstado() {
    const salvo = localStorage.getItem('gurps_pv_pf');
    if (salvo) {
        estadoPersonagem = JSON.parse(salvo);
        atualizarPV();
        atualizarPF();
    }
}

// ===== EVENT LISTENERS =====

function inicializarPVPF() {
    // Carrega estado salvo
    carregarEstado();
    
    // Event Listeners para PV
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
    
    document.getElementById('pvModificador').addEventListener('change', (e) => {
        setPVModificador(e.target.value);
    });
    
    document.getElementById('pvMaxInput').addEventListener('change', (e) => {
        setPVMaximo(parseInt(e.target.value));
    });
    
    document.getElementById('pvAtualInput').addEventListener('change', (e) => {
        setPVAtual(parseInt(e.target.value));
    });
    
    // Event Listeners para PF
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
    
    document.getElementById('pfModificador').addEventListener('change', (e) => {
        setPFModificador(e.target.value);
    });
    
    document.getElementById('pfMaxInput').addEventListener('change', (e) => {
        setPFMaximo(parseInt(e.target.value));
    });
    
    document.getElementById('pfAtualInput').addEventListener('change', (e) => {
        setPFAtual(parseInt(e.target.value));
    });
    
    // Botões de modificador
    document.querySelectorAll('.mod-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const input = btn.parentElement.querySelector('.mod-input');
            const change = parseInt(btn.dataset.change);
            let valor = parseInt(input.value) + change;
            
            // Limites
            if (input.id === 'pvModificador') {
                valor = Math.max(Math.min(valor, 20), -20);
                setPVModificador(valor);
            } else if (input.id === 'pfModificador') {
                valor = Math.max(Math.min(valor, 10), -10);
                setPFModificador(valor);
            }
            
            input.value = valor;
        });
    });
    
    // Ouvinte para eventos de atributos
    document.addEventListener('atributosAlterados', (e) => {
        receberAtributos(e.detail);
    });
    
    console.log('Sistema PV/PF inicializado');
}

// ===== INICIALIZAÇÃO =====

document.addEventListener('DOMContentLoaded', () => {
    // Verifica se a aba de combate está ativa
    const combateTab = document.getElementById('combate');
    if (combateTab && combateTab.classList.contains('active')) {
        inicializarPVPF();
    }
    
    // Observa mudanças nas abas
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'combate' && tab.classList.contains('active')) {
                    setTimeout(inicializarPVPF, 100);
                }
            }
        });
    });
    
    // Observa a aba de combate
    if (combateTab) {
        observer.observe(combateTab, { attributes: true });
    }
});

// ===== EXPORTAÇÃO =====

window.atualizarPV = atualizarPV;
window.alterarPV = alterarPV;
window.setPVBase = setPVBase;
window.setPVModificador = setPVModificador;

window.atualizarPF = atualizarPF;
window.alterarPF = alterarPF;
window.setPFBase = setPFBase;
window.setPFModificador = setPFModificador;

window.receberAtributos = receberAtributos;
window.inicializarPVPF = inicializarPVPF;
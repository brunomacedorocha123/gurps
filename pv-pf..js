// pv-pf.js — VERSION FINAL E FUNCIONAL
// Garante sincronização com ST/HT e todos os botões funcionando

let estadoCombate = {
    st: 10,
    ht: 10,
    pv: { atual: 10, maximo: 10, modificador: 0 },
    pf: { atual: 10, maximo: 10, modificador: 0 }
};

// ============================================
// FUNÇÕES PRINCIPAIS — EXPOR NO GLOBAL
// ============================================

function alterarPV(delta) {
    estadoCombate.pv.atual += delta;
    const limite = -5 * estadoCombate.st;
    estadoCombate.pv.atual = Math.max(limite, Math.min(estadoCombate.pv.maximo, estadoCombate.pv.atual));
    atualizarTudo();
}

function alterarPF(delta) {
    estadoCombate.pf.atual += delta;
    const limite = -1 * estadoCombate.ht;
    estadoCombate.pf.atual = Math.max(limite, Math.min(estadoCombate.pf.maximo, estadoCombate.pf.atual));
    atualizarTudo();
}

function modificarPV(tipo, valor) {
    if (tipo === 'mod') {
        estadoCombate.pv.modificador = Math.max(-10, Math.min(10, estadoCombate.pv.modificador + valor));
        estadoCombate.pv.maximo = estadoCombate.st + estadoCombate.pv.modificador;
        if (estadoCombate.pv.atual > estadoCombate.pv.maximo) estadoCombate.pv.atual = estadoCombate.pv.maximo;
        atualizarTudo();
    }
}

function modificarPF(tipo, valor) {
    if (tipo === 'mod') {
        estadoCombate.pf.modificador = Math.max(-10, Math.min(10, estadoCombate.pf.modificador + valor));
        estadoCombate.pf.maximo = estadoCombate.ht + estadoCombate.pf.modificador;
        if (estadoCombate.pf.atual > estadoCombate.pf.maximo) estadoCombate.pf.atual = estadoCombate.pf.maximo;
        atualizarTudo();
    }
}

function resetarPV() {
    estadoCombate.pv.atual = estadoCombate.pv.maximo;
    atualizarTudo();
}

function resetarPF() {
    estadoCombate.pf.atual = estadoCombate.pf.maximo;
    atualizarTudo();
}

function atualizarPVManual() {
    const el = document.getElementById('pvAtualDisplay');
    let v = parseInt(el.value) || 0;
    estadoCombate.pv.atual = Math.max(-5 * estadoCombate.st, Math.min(estadoCombate.pv.maximo, v));
    atualizarTudo();
}

function atualizarPFManual() {
    const el = document.getElementById('pfAtualDisplay');
    let v = parseInt(el.value) || 0;
    estadoCombate.pf.atual = Math.max(-1 * estadoCombate.ht, Math.min(estadoCombate.pf.maximo, v));
    atualizarTudo();
}

// ============================================
// ATUALIZAÇÃO DA INTERFACE
// ============================================

function atualizarTudo() {
    const pv = estadoCombate.pv;
    const pf = estadoCombate.pf;

    // PV
    document.getElementById('pvBaseDisplay').textContent = estadoCombate.st;
    document.getElementById('pvMaxDisplay').textContent = pv.maximo;
    document.getElementById('pvAtualDisplay').value = pv.atual;
    document.getElementById('pvModificador').value = pv.modificador;
    document.getElementById('pvTexto').textContent = `${pv.atual}/${pv.maximo}`;
    
    // PF
    document.getElementById('pfBaseDisplay').textContent = estadoCombate.ht;
    document.getElementById('pfMaxDisplay').textContent = pf.maximo;
    document.getElementById('pfAtualDisplay').value = pf.atual;
    document.getElementById('pfModificador').value = pf.modificador;
    document.getElementById('pfTexto').textContent = `${pf.atual}/${pf.maximo}`;

    // Atualiza barras
    atualizarBarraPV();
    atualizarBarraPF();

    // (Opcional) Atualiza Dano Base — se quiser, pode integrar com atributos.js
    document.getElementById('danoGdp').textContent = document.getElementById('danoGDP')?.textContent || '1d-2';
    document.getElementById('danoGeb').textContent = document.getElementById('danoGEB')?.textContent || '1d';
}

function atualizarBarraPV() {
    const pv = estadoCombate.pv;
    const st = estadoCombate.st;
    const limite = -5 * st;
    const range = st - limite;
    const pos = pv.atual - limite;
    const porcentagem = Math.max(0, Math.min(100, (pos / range) * 100));
    const fill = document.getElementById('pvFill');
    if (fill) {
        fill.style.width = `${porcentagem}%`;
        fill.style.background = corPV(pv.atual, st);
        // Atualiza estado
        document.getElementById('pvEstadoDisplay').textContent = estadoPV(pv.atual, st).nome;
    }
}

function atualizarBarraPF() {
    const pf = estadoCombate.pf;
    const porcentagem = Math.max(0, Math.min(100, (pf.atual / pf.maximo) * 100));
    const fill = document.getElementById('pfFill');
    if (fill) {
        fill.style.width = `${porcentagem}%`;
        fill.style.background = corPF(pf.atual, pf.maximo);
        document.getElementById('pfEstadoDisplay').textContent = estadoPF(pf.atual, pf.maximo).nome;
    }
}

// Cores e estados
function corPV(pv, st) {
    if (pv > 0) return '#27ae60';
    if (pv >= -st) return '#f1c40f';
    if (pv >= -2*st) return '#e67e22';
    if (pv >= -3*st) return '#e74c3c';
    if (pv >= -4*st) return '#8e44ad';
    if (pv >= -5*st) return '#95a5a6';
    return '#7f8c8d';
}

function estadoPV(pv, st) {
    if (pv > 0) return { nome: 'Saudável' };
    if (pv >= -st) return { nome: 'Machucado' };
    if (pv >= -2*st) return { nome: 'Ferido' };
    if (pv >= -3*st) return { nome: 'Crítico' };
    if (pv >= -4*st) return { nome: 'Morrendo' };
    if (pv >= -5*st) return { nome: 'Inconsciente' };
    return { nome: 'Morto' };
}

function corPF(pf, max) {
    if (pf >= max * 0.66) return '#3498db';
    if (pf >= max * 0.33) return '#f39c12';
    if (pf > 0) return '#e67e22';
    if (pf === 0) return '#e74c3c';
    return '#8e44ad';
}

function estadoPF(pf, max) {
    if (pf >= max * 0.66) return { nome: 'Normal' };
    if (pf >= max * 0.33) return { nome: 'Cansado' };
    if (pf > 0) return { nome: 'Fadigado' };
    if (pf === 0) return { nome: 'Exausto' };
    return { nome: 'Colapso' };
}

// ============================================
// INICIALIZAÇÃO DA ABA COMBATE
// ============================================

function inicializarCombate() {
    // Pega ST e HT diretamente dos inputs (que existem no DOM)
    const stInput = document.getElementById('ST');
    const htInput = document.getElementById('HT');
    
    if (!stInput || !htInput) {
        setTimeout(inicializarCombate, 300);
        return;
    }

    estadoCombate.st = parseInt(stInput.value) || 10;
    estadoCombate.ht = parseInt(htInput.value) || 10;
    estadoCombate.pv.maximo = estadoCombate.st + estadoCombate.pv.modificador;
    estadoCombate.pf.maximo = estadoCombate.ht + estadoCombate.pf.modificador;
    estadoCombate.pv.atual = estadoCombate.pv.maximo;
    estadoCombate.pf.atual = estadoCombate.pf.maximo;

    // Atualiza interface
    atualizarTudo();

    // Garante que os inputs manuais funcionem
    document.getElementById('pvAtualDisplay').onchange = atualizarPVManual;
    document.getElementById('pfAtualDisplay').onchange = atualizarPFManual;

    console.log('✅ Aba Combate inicializada com sucesso!');
}

// ============================================
// OBSERVA ABERTURA DA ABA
// ============================================

(function() {
    const combateTab = document.getElementById('combate');
    if (!combateTab) return;

    const observer = new MutationObserver(() => {
        if (combateTab.classList.contains('active')) {
            setTimeout(inicializarCombate, 200);
            observer.disconnect(); // evita múltiplas execuções
        }
    });

    observer.observe(combateTab, { attributes: true, attributeFilter: ['class'] });

    // Caso já esteja ativa no carregamento
    if (combateTab.classList.contains('active')) {
        setTimeout(inicializarCombate, 500);
    }
})();
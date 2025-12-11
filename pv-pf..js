// ============================================
// PV-PF - SISTEMA COMPLETAMENTE INTEGRADO
// SINCRONIZADO COM atributos.js VIA EVENTO
// ============================================

// Estado do sistema PV/PF
let estadoPVPF = {
    pv: { atual: 10, maximo: 10, modificador: 0 },
    pf: { atual: 10, maximo: 10, modificador: 0 },
    st: 10,
    ht: 10
};

// ============================================
// 1. ESCUTA ALTERAÇÕES DE ATRIBUTOS EM TEMPO REAL
// ============================================

document.addEventListener('atributosAlterados', function(e) {
    if (e.detail && (e.detail.ST !== undefined || e.detail.HT !== undefined)) {
        estadoPVPF.st = e.detail.ST || estadoPVPF.st;
        estadoPVPF.ht = e.detail.HT || estadoPVPF.ht;
        
        // Atualiza bases e máximos
        estadoPVPF.pv.maximo = estadoPVPF.st + estadoPVPF.pv.modificador;
        estadoPVPF.pf.maximo = estadoPVPF.ht + estadoPVPF.pf.modificador;
        
        // Atualiza displays de base/máximo na aba Combate (se visível)
        if (document.getElementById('combate').classList.contains('active')) {
            document.getElementById('pvBaseDisplay').textContent = estadoPVPF.st;
            document.getElementById('pfBaseDisplay').textContent = estadoPVPF.ht;
            document.getElementById('pvMaxDisplay').textContent = estadoPVPF.pv.maximo;
            document.getElementById('pfMaxDisplay').textContent = estadoPVPF.pf.maximo;
            // Recalcula valores atuais se excederem o novo máximo
            if (estadoPVPF.pv.atual > estadoPVPF.pv.maximo) {
                estadoPVPF.pv.atual = estadoPVPF.pv.maximo;
            }
            if (estadoPVPF.pf.atual > estadoPVPF.pf.maximo) {
                estadoPVPF.pf.atual = estadoPVPF.pf.maximo;
            }
            atualizarDisplayPV();
            atualizarDisplayPF();
        }
    }
});

// ============================================
// 2. FUNÇÕES PRINCIPAIS (MESMAS QUE VOCÊ FEZ, MAS OTIMIZADAS)
// ============================================

function alterarPV(valor) {
    estadoPVPF.pv.atual += valor;
    const limiteMorte = -5 * estadoPVPF.st;
    estadoPVPF.pv.atual = Math.max(limiteMorte, Math.min(estadoPVPF.pv.maximo, estadoPVPF.pv.atual));
    atualizarDisplayPV();
    aplicarEfeitoVisual('pv', valor > 0 ? 'cura' : 'dano');
}

function alterarPF(valor) {
    estadoPVPF.pf.atual += valor;
    const limiteColapso = -1 * estadoPVPF.ht;
    estadoPVPF.pf.atual = Math.max(limiteColapso, Math.min(estadoPVPF.pf.maximo, estadoPVPF.pf.atual));
    atualizarDisplayPF();
    aplicarEfeitoVisual('pf', valor > 0 ? 'cura' : 'dano');
}

function modificarPV(tipo, valor) {
    if (tipo === 'mod') {
        estadoPVPF.pv.modificador = Math.max(-10, Math.min(10, estadoPVPF.pv.modificador + valor));
        estadoPVPF.pv.maximo = estadoPVPF.st + estadoPVPF.pv.modificador;
        if (estadoPVPF.pv.atual > estadoPVPF.pv.maximo) estadoPVPF.pv.atual = estadoPVPF.pv.maximo;
        document.getElementById('pvModificador').value = estadoPVPF.pv.modificador;
        document.getElementById('pvMaxDisplay').textContent = estadoPVPF.pv.maximo;
        atualizarDisplayPV();
    }
}

function modificarPF(tipo, valor) {
    if (tipo === 'mod') {
        estadoPVPF.pf.modificador = Math.max(-10, Math.min(10, estadoPVPF.pf.modificador + valor));
        estadoPVPF.pf.maximo = estadoPVPF.ht + estadoPVPF.pf.modificador;
        if (estadoPVPF.pf.atual > estadoPVPF.pf.maximo) estadoPVPF.pf.atual = estadoPVPF.pf.maximo;
        document.getElementById('pfModificador').value = estadoPVPF.pf.modificador;
        document.getElementById('pfMaxDisplay').textContent = estadoPVPF.pf.maximo;
        atualizarDisplayPF();
    }
}

function resetarPV() {
    estadoPVPF.pv.atual = estadoPVPF.pv.maximo;
    atualizarDisplayPV();
}

function resetarPF() {
    estadoPVPF.pf.atual = estadoPVPF.pf.maximo;
    atualizarDisplayPF();
}

function atualizarPVManual() {
    const input = document.getElementById('pvAtualDisplay');
    const valor = parseInt(input.value) || 0;
    estadoPVPF.pv.atual = Math.max(-5 * estadoPVPF.st, Math.min(estadoPVPF.pv.maximo, valor));
    atualizarDisplayPV();
}

function atualizarPFManual() {
    const input = document.getElementById('pfAtualDisplay');
    const valor = parseInt(input.value) || 0;
    estadoPVPF.pf.atual = Math.max(-1 * estadoPVPF.ht, Math.min(estadoPVPF.pf.maximo, valor));
    atualizarDisplayPF();
}

// ============================================
// 3. EXIBIÇÃO E CÁLCULOS GURPS
// ============================================

function atualizarDisplayPV() {
    const pv = estadoPVPF.pv;
    document.getElementById('pvAtualDisplay').value = pv.atual;
    document.getElementById('pvTexto').textContent = `${pv.atual}/${pv.maximo}`;
    
    const barra = document.getElementById('pvFill');
    const limiteMorte = -5 * estadoPVPF.st;
    const rangeTotal = estadoPVPF.st - limiteMorte;
    const posicao = pv.atual - limiteMorte;
    const porcentagem = Math.max(0, Math.min(100, (posicao / rangeTotal) * 100));
    barra.style.width = `${porcentagem}%`;
    barra.style.background = calcularCorPV(pv.atual, estadoPVPF.st);
    
    document.getElementById('pvEstadoDisplay').textContent = calcularEstadoPV(pv.atual, estadoPVPF.st).nome;
}

function atualizarDisplayPF() {
    const pf = estadoPVPF.pf;
    document.getElementById('pfAtualDisplay').value = pf.atual;
    document.getElementById('pfTexto').textContent = `${pf.atual}/${pf.maximo}`;
    
    const barra = document.getElementById('pfFill');
    const porcentagem = pf.atual >= 0 ? (pf.atual / pf.maximo) * 100 : 0;
    barra.style.width = `${Math.max(0, Math.min(100, porcentagem))}%`;
    barra.style.background = calcularCorPF(pf.atual, pf.maximo);
    
    document.getElementById('pfEstadoDisplay').textContent = calcularEstadoPF(pf.atual, pf.maximo).nome;
}

function calcularCorPV(pv, st) {
    if (pv > 0) return '#27ae60';
    if (pv >= -st) return '#f1c40f';
    if (pv >= -2*st) return '#e67e22';
    if (pv >= -3*st) return '#e74c3c';
    if (pv >= -4*st) return '#8e44ad';
    if (pv >= -5*st) return '#95a5a6';
    return '#7f8c8d';
}

function calcularEstadoPV(pv, st) {
    if (pv > 0) return { nome: 'Saudável' };
    if (pv >= -st) return { nome: 'Machucado' };
    if (pv >= -2*st) return { nome: 'Ferido' };
    if (pv >= -3*st) return { nome: 'Crítico' };
    if (pv >= -4*st) return { nome: 'Morrendo' };
    if (pv >= -5*st) return { nome: 'Inconsciente' };
    return { nome: 'Morto' };
}

function calcularCorPF(pf, max) {
    if (pf >= max * 0.66) return '#3498db';
    if (pf >= max * 0.33) return '#f39c12';
    if (pf > 0) return '#e67e22';
    if (pf === 0) return '#e74c3c';
    return '#8e44ad';
}

function calcularEstadoPF(pf, max) {
    if (pf >= max * 0.66) return { nome: 'Normal' };
    if (pf >= max * 0.33) return { nome: 'Cansado' };
    if (pf > 0) return { nome: 'Fadigado' };
    if (pf === 0) return { nome: 'Exausto' };
    return { nome: 'Colapso' };
}

function aplicarEfeitoVisual(tipo, efeito) {
    const el = document.getElementById(tipo === 'pv' ? 'pvFill' : 'pfFill');
    if (!el) return;
    el.classList.remove('cura-recebida', 'dano-recebido');
    void el.offsetWidth;
    el.classList.add(efeito === 'cura' ? 'cura-recebida' : 'dano-recebido');
    setTimeout(() => el.classList.remove(efeito === 'cura' ? 'cura-recebida' : 'dano-recebido'), 800);
}

// ============================================
// 4. INICIALIZAÇÃO AUTOMÁTICA NA ABA COMBATE
// ============================================

function inicializarPVPF() {
    // Pega valores iniciais do DOM (atributos.js já carregou)
    const st = parseInt(document.getElementById('ST')?.value) || 10;
    const ht = parseInt(document.getElementById('HT')?.value) || 10;
    estadoPVPF.st = st;
    estadoPVPF.ht = ht;
    estadoPVPF.pv.maximo = st + estadoPVPF.pv.modificador;
    estadoPVPF.pf.maximo = ht + estadoPVPF.pf.modificador;
    
    // Atualiza exibição inicial
    document.getElementById('pvBaseDisplay').textContent = st;
    document.getElementById('pfBaseDisplay').textContent = ht;
    document.getElementById('pvMaxDisplay').textContent = estadoPVPF.pv.maximo;
    document.getElementById('pfMaxDisplay').textContent = estadoPVPF.pf.maximo;
    atualizarDisplayPV();
    atualizarDisplayPF();
    
    // Configura eventos de input
    ['pvAtualDisplay', 'pfAtualDisplay'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', id === 'pvAtualDisplay' ? atualizarPVManual : atualizarPFManual);
    });
    
    console.log('✅ Sistema de Combate PV/PF inicializado e sincronizado com ST/HT.');
}

// Inicializa ao mudar para a aba Combate
const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
        if (m.target.id === 'combate' && m.target.classList.contains('active')) {
            setTimeout(inicializarPVPF, 300);
        }
    });
});
observer.observe(document.getElementById('combate'), { attributes: true });

// Exporta funções globais para compatibilidade
window.alterarPV = alterarPV;
window.alterarPF = alterarPF;
window.modificarPV = modificarPV;
window.modificarPF = modificarPF;
window.resetarPV = resetarPV;
window.resetarPF = resetarPF;
window.atualizarPVManual = atualizarPVManual;
window.atualizarPFManual = atualizarPFManual;
window.inicializarPVPF = inicializarPVPF;
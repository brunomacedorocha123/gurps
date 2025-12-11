// ============================================
// PV-PF - SISTEMA QUE FUNCIONA AGORA!
// PEGA ST/HT DO ATRIBUTOS.JS SEM MEXER EM NADA
// ============================================

// Estado do caralho do sistema
let estadoPVPF = {
    pv: { atual: 10, maximo: 10, modificador: 0 },
    pf: { atual: 10, maximo: 10, modificador: 0 },
    st: 10, // Vai pegar do atributos.js
    ht: 10  // Vai pegar do atributos.js
};

// ============================================
// 1. PEGA ST E HT DO FODENDO ATRIBUTOS.JS
// ============================================

function pegarValoresAtributos() {
    console.log('🔍 Buscando ST e HT do atributos.js...');
    
    // TENTA PEGAR DO INPUT DIRETO
    const stInput = document.getElementById('ST');
    const htInput = document.getElementById('HT');
    
    if (stInput && htInput) {
        estadoPVPF.st = parseInt(stInput.value) || 10;
        estadoPVPF.ht = parseInt(htInput.value) || 10;
        console.log(`✅ Valores encontrados: ST=${estadoPVPF.st}, HT=${estadoPVPF.ht}`);
    } else {
        // Se não achar, tenta pegar do estado global
        if (window.personagem && window.personagem.atributos) {
            estadoPVPF.st = window.personagem.atributos.ST || 10;
            estadoPVPF.ht = window.personagem.atributos.HT || 10;
            console.log(`✅ Valores do window: ST=${estadoPVPF.st}, HT=${estadoPVPF.ht}`);
        } else {
            console.log('⚠️ Usando valores padrão: ST=10, HT=10');
        }
    }
    
    // Atualiza bases
    estadoPVPF.pv.maximo = estadoPVPF.st + estadoPVPF.pv.modificador;
    estadoPVPF.pf.maximo = estadoPVPF.ht + estadoPVPF.pf.modificador;
    
    // Atualiza displays de base
    document.getElementById('pvBaseDisplay').textContent = estadoPVPF.st;
    document.getElementById('pfBaseDisplay').textContent = estadoPVPF.ht;
    document.getElementById('pvMaxDisplay').textContent = estadoPVPF.pv.maximo;
    document.getElementById('pfMaxDisplay').textContent = estadoPVPF.pf.maximo;
}

// ============================================
// 2. FUNÇÕES DOS BOTÕES QUE FUNCIONAM
// ============================================

// DANO/CURA PV
function alterarPV(valor) {
    console.log(`⚡ Alterando PV: ${valor > 0 ? '+' : ''}${valor}`);
    
    estadoPVPF.pv.atual += valor;
    
    // Limites GURPS: até -5×ST
    const limiteMorte = -5 * estadoPVPF.st;
    estadoPVPF.pv.atual = Math.max(limiteMorte, Math.min(estadoPVPF.pv.maximo, estadoPVPF.pv.atual));
    
    atualizarDisplayPV();
    aplicarEfeitoVisual('pv', valor > 0 ? 'cura' : 'dano');
}

// FADIGA/DESCANSO PF
function alterarPF(valor) {
    console.log(`⚡ Alterando PF: ${valor > 0 ? '+' : ''}${valor}`);
    
    estadoPVPF.pf.atual += valor;
    
    // Limites: até -1×HT
    const limiteColapso = -1 * estadoPVPF.ht;
    estadoPVPF.pf.atual = Math.max(limiteColapso, Math.min(estadoPVPF.pf.maximo, estadoPVPF.pf.atual));
    
    atualizarDisplayPF();
    aplicarEfeitoVisual('pf', valor > 0 ? 'cura' : 'dano');
}

// MODIFICADORES (+/-)
function modificarPV(tipo, valor) {
    console.log(`🔧 Mod PV ${tipo}: ${valor > 0 ? '+' : ''}${valor}`);
    
    if (tipo === 'mod') {
        estadoPVPF.pv.modificador += valor;
        estadoPVPF.pv.modificador = Math.max(-10, Math.min(10, estadoPVPF.pv.modificador));
        
        // Atualiza máximo
        estadoPVPF.pv.maximo = estadoPVPF.st + estadoPVPF.pv.modificador;
        
        // Atualiza displays
        document.getElementById('pvModificador').value = estadoPVPF.pv.modificador;
        document.getElementById('pvMaxDisplay').textContent = estadoPVPF.pv.maximo;
        
        atualizarDisplayPV();
    }
}

function modificarPF(tipo, valor) {
    console.log(`🔧 Mod PF ${tipo}: ${valor > 0 ? '+' : ''}${valor}`);
    
    if (tipo === 'mod') {
        estadoPVPF.pf.modificador += valor;
        estadoPVPF.pf.modificador = Math.max(-10, Math.min(10, estadoPVPF.pf.modificador));
        
        // Atualiza máximo
        estadoPVPF.pf.maximo = estadoPVPF.ht + estadoPVPF.pf.modificador;
        
        // Atualiza displays
        document.getElementById('pfModificador').value = estadoPVPF.pf.modificador;
        document.getElementById('pfMaxDisplay').textContent = estadoPVPF.pf.maximo;
        
        atualizarDisplayPF();
    }
}

// RESET
function resetarPV() {
    console.log('🔄 Resetando PV');
    estadoPVPF.pv.atual = estadoPVPF.pv.maximo;
    atualizarDisplayPV();
}

function resetarPF() {
    console.log('🔄 Resetando PF');
    estadoPVPF.pf.atual = estadoPVPF.pf.maximo;
    atualizarDisplayPF();
}

// INPUTS MANUAIS
function atualizarPVManual() {
    const input = document.getElementById('pvAtualDisplay');
    const valor = parseInt(input.value) || estadoPVPF.pv.maximo;
    estadoPVPF.pv.atual = Math.max(-5 * estadoPVPF.st, Math.min(estadoPVPF.pv.maximo, valor));
    atualizarDisplayPV();
}

function atualizarPFManual() {
    const input = document.getElementById('pfAtualDisplay');
    const valor = parseInt(input.value) || estadoPVPF.pf.maximo;
    estadoPVPF.pf.atual = Math.max(-1 * estadoPVPF.ht, Math.min(estadoPVPF.pf.maximo, valor));
    atualizarDisplayPF();
}

// ============================================
// 3. ATUALIZA OS DISPLAYS NA TELA
// ============================================

function atualizarDisplayPV() {
    const pv = estadoPVPF.pv;
    const st = estadoPVPF.st;
    
    // Atualiza valores
    document.getElementById('pvAtualDisplay').value = pv.atual;
    document.getElementById('pvTexto').textContent = `${pv.atual}/${pv.maximo}`;
    
    // Atualiza barra
    const barra = document.getElementById('pvFill');
    if (barra) {
        // Calcula porcentagem GURPS
        const limiteMorte = -5 * st;
        const rangeTotal = st - limiteMorte;
        const posicao = pv.atual - limiteMorte;
        const porcentagem = Math.max(0, Math.min(100, (posicao / rangeTotal) * 100));
        
        barra.style.width = `${porcentagem}%`;
        
        // Cor baseada no estado
        const cor = calcularCorPV(pv.atual, st);
        barra.style.background = cor;
        
        // Atualiza estado
        const estado = calcularEstadoPV(pv.atual, st);
        const estadoElement = document.getElementById('pvEstadoDisplay');
        if (estadoElement) {
            estadoElement.textContent = estado.nome;
            estadoElement.style.color = cor;
            estadoElement.style.backgroundColor = cor + '20';
        }
    }
}

function atualizarDisplayPF() {
    const pf = estadoPVPF.pf;
    const ht = estadoPVPF.ht;
    
    // Atualiza valores
    document.getElementById('pfAtualDisplay').value = pf.atual;
    document.getElementById('pfTexto').textContent = `${pf.atual}/${pf.maximo}`;
    
    // Atualiza barra
    const barra = document.getElementById('pfFill');
    if (barra) {
        // Calcula porcentagem
        const porcentagem = pf.atual >= 0 ? 
            (pf.atual / pf.maximo) * 100 : 
            100 * (1 - (Math.abs(pf.atual) / pf.maximo));
        
        barra.style.width = `${Math.max(0, Math.min(100, porcentagem))}%`;
        
        // Cor baseada no estado
        const cor = calcularCorPF(pf.atual, pf.maximo);
        barra.style.background = cor;
        
        // Atualiza estado
        const estado = calcularEstadoPF(pf.atual, pf.maximo);
        const estadoElement = document.getElementById('pfEstadoDisplay');
        if (estadoElement) {
            estadoElement.textContent = estado.nome;
            estadoElement.style.color = cor;
            estadoElement.style.backgroundColor = cor + '20';
        }
    }
}

// ============================================
// 4. CÁLCULOS GURPS (CORES E ESTADOS)
// ============================================

function calcularCorPV(pvAtual, st) {
    if (pvAtual > 0) return '#27ae60';           // Verde (> 0)
    if (pvAtual >= -st) return '#f1c40f';        // Amarelo (-1×ST até 0)
    if (pvAtual >= -2 * st) return '#e67e22';    // Laranja (-2×ST até -1×ST)
    if (pvAtual >= -3 * st) return '#e74c3c';    // Vermelho (-3×ST até -2×ST)
    if (pvAtual >= -4 * st) return '#8e44ad';    // Roxo (-4×ST até -3×ST)
    if (pvAtual >= -5 * st) return '#95a5a6';    // Cinza (-5×ST até -4×ST)
    return '#7f8c8d';                            // Morto
}

function calcularEstadoPV(pvAtual, st) {
    if (pvAtual > 0) return { nome: 'Saudável', cor: '#27ae60' };
    if (pvAtual >= -st) return { nome: 'Machucado', cor: '#f1c40f' };
    if (pvAtual >= -2 * st) return { nome: 'Ferido', cor: '#e67e22' };
    if (pvAtual >= -3 * st) return { nome: 'Crítico', cor: '#e74c3c' };
    if (pvAtual >= -4 * st) return { nome: 'Morrendo', cor: '#8e44ad' };
    if (pvAtual >= -5 * st) return { nome: 'Inconsciente', cor: '#95a5a6' };
    return { nome: 'Morto', cor: '#7f8c8d' };
}

function calcularCorPF(pfAtual, pfMax) {
    if (pfAtual >= pfMax * 0.66) return '#3498db';    // Normal
    if (pfAtual >= pfMax * 0.33) return '#f39c12';    // Cansado
    if (pfAtual > 0) return '#e67e22';                // Fadigado
    if (pfAtual === 0) return '#e74c3c';              // Exausto
    return '#8e44ad';                                 // Colapso
}

function calcularEstadoPF(pfAtual, pfMax) {
    if (pfAtual >= pfMax * 0.66) return { nome: 'Normal', cor: '#3498db' };
    if (pfAtual >= pfMax * 0.33) return { nome: 'Cansado', cor: '#f39c12' };
    if (pfAtual > 0) return { nome: 'Fadigado', cor: '#e67e22' };
    if (pfAtual === 0) return { nome: 'Exausto', cor: '#e74c3c' };
    return { nome: 'Colapso', cor: '#8e44ad' };
}

// ============================================
// 5. EFEITOS VISUAIS
// ============================================

function aplicarEfeitoVisual(tipo, efeito) {
    const elementoId = tipo === 'pv' ? 'pvFill' : 'pfFill';
    const elemento = document.getElementById(elementoId);
    
    if (!elemento) return;
    
    const classe = efeito === 'cura' ? 'cura-recebida' : 'dano-recebido';
    
    elemento.classList.remove('cura-recebida', 'dano-recebido');
    void elemento.offsetWidth;
    elemento.classList.add(classe);
    
    setTimeout(() => elemento.classList.remove(classe), 800);
}

// ============================================
// 6. CONFIGURA OS BOTÕES DIRETAMENTE
// ============================================

function configurarBotoes() {
    console.log('🔧 Configurando botões da aba Combate...');
    
    // ---------- BOTÕES PV ----------
    // -5, -2, -1
    document.querySelectorAll('.card-pv .btn-dano').forEach(btn => {
        btn.onclick = function() {
            const valor = parseInt(this.textContent.replace('-', '').trim()) || 1;
            alterarPV(-valor);
        };
    });
    
    // +1, +2, +5
    document.querySelectorAll('.card-pv .btn-cura').forEach(btn => {
        btn.onclick = function() {
            const valor = parseInt(this.textContent.replace('+', '').trim()) || 1;
            alterarPV(valor);
        };
    });
    
    // Modificador +
    const pvModPlus = document.querySelector('.card-pv .btn-mod.plus');
    if (pvModPlus) {
        pvModPlus.onclick = function() {
            modificarPV('mod', 1);
        };
    }
    
    // Modificador -
    const pvModMinus = document.querySelector('.card-pv .btn-mod.minus');
    if (pvModMinus) {
        pvModMinus.onclick = function() {
            modificarPV('mod', -1);
        };
    }
    
    // Reset PV
    const pvReset = document.querySelector('.card-pv .btn-reset');
    if (pvReset) {
        pvReset.onclick = resetarPV;
    }
    
    // ---------- BOTÕES PF ----------
    // -3, -1
    document.querySelectorAll('.card-pf .btn-fadiga').forEach(btn => {
        btn.onclick = function() {
            const valor = parseInt(this.textContent.replace('-', '').trim()) || 1;
            alterarPF(-valor);
        };
    });
    
    // +1, +3
    document.querySelectorAll('.card-pf .btn-descanso').forEach(btn => {
        btn.onclick = function() {
            const valor = parseInt(this.textContent.replace('+', '').trim()) || 1;
            alterarPF(valor);
        };
    });
    
    // Modificador +
    const pfModPlus = document.querySelector('.card-pf .btn-mod.plus');
    if (pfModPlus) {
        pfModPlus.onclick = function() {
            modificarPF('mod', 1);
        };
    }
    
    // Modificador -
    const pfModMinus = document.querySelector('.card-pf .btn-mod.minus');
    if (pfModMinus) {
        pfModMinus.onclick = function() {
            modificarPF('mod', -1);
        };
    }
    
    // Reset PF
    const pfReset = document.querySelector('.card-pf .btn-reset');
    if (pfReset) {
        pfReset.onclick = resetarPF;
    }
    
    // ---------- INPUTS MANUAIS ----------
    const pvInput = document.getElementById('pvAtualDisplay');
    const pfInput = document.getElementById('pfAtualDisplay');
    
    if (pvInput) {
        pvInput.onchange = atualizarPVManual;
        pvInput.onblur = atualizarPVManual;
    }
    
    if (pfInput) {
        pfInput.onchange = atualizarPFManual;
        pfInput.onblur = atualizarPFManual;
    }
    
    console.log('✅ Botões configurados!');
}

// ============================================
// 7. INICIALIZAÇÃO QUANDO ABA COMBATE ABRIR
// ============================================

function inicializarPVPF() {
    console.log('🚀 INICIANDO SISTEMA PV-PF NA ABA COMBATE');
    
    // Verifica se estamos na aba combate
    const combateAba = document.getElementById('combate');
    if (!combateAba) {
        console.error('❌ Aba Combate não encontrada!');
        return;
    }
    
    // Verifica se os elementos existem
    const elementosNecessarios = [
        'pvAtualDisplay', 'pvTexto', 'pvFill', 'pvEstadoDisplay',
        'pfAtualDisplay', 'pfTexto', 'pfFill', 'pfEstadoDisplay'
    ];
    
    let tudoOk = true;
    elementosNecessarios.forEach(id => {
        if (!document.getElementById(id)) {
            console.error(`❌ Elemento ${id} não encontrado!`);
            tudoOk = false;
        }
    });
    
    if (!tudoOk) {
        console.error('❌ Elementos faltando, tentando novamente em 500ms...');
        setTimeout(inicializarPVPF, 500);
        return;
    }
    
    // 1. Pega valores do ST/HT
    pegarValoresAtributos();
    
    // 2. Configura todos os botões
    configurarBotoes();
    
    // 3. Atualiza displays iniciais
    atualizarDisplayPV();
    atualizarDisplayPF();
    
    console.log('✅✅✅ SISTEMA PV-PF INICIADO COM SUCESSO!');
    console.log('👉 TESTE: Clique nos botões -5, -2, -1, +1, +2, +5 do PV');
    console.log('👉 TESTE: Clique nos botões -3, -1, +1, +3 do PF');
}

// ============================================
// 8. OBSERVA QUANDO ABA COMBATE É ATIVADA
// ============================================

// Espera o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado - Pronto para iniciar PV-PF');
    
    // OBSERVA A MUDANÇA DE ABA
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'class' && 
                mutation.target.id === 'combate') {
                
                // Se a aba combate foi ativada (tem classe 'active')
                if (mutation.target.classList.contains('active')) {
                    console.log('🎯 ABA COMBATE ATIVADA!');
                    
                    // Pequeno delay para garantir que tudo carregou
                    setTimeout(() => {
                        inicializarPVPF();
                    }, 300);
                }
            }
        });
    });
    
    // Começa a observar a aba combate
    const combateTab = document.getElementById('combate');
    if (combateTab) {
        observer.observe(combateTab, { attributes: true });
        console.log('👀 Observando aba Combate...');
    }
    
    // Se já estiver na aba combate ao carregar, inicializa logo
    if (combateTab && combateTab.classList.contains('active')) {
        console.log('⚡ Já está na aba Combate - Inicializando...');
        setTimeout(() => {
            inicializarPVPF();
        }, 500);
    }
});

// ============================================
// 9. EXPORTA FUNÇÕES PARA WINDOW
// ============================================

window.alterarPV = alterarPV;
window.alterarPF = alterarPF;
window.modificarPV = modificarPV;
window.modificarPF = modificarPF;
window.resetarPV = resetarPV;
window.resetarPF = resetarPF;
window.atualizarPVManual = atualizarPVManual;
window.atualizarPFManual = atualizarPFManual;
window.inicializarPVPF = inicializarPVPF; // Para testar manualmente

console.log('✅ pv-pf.js CARREGADO - AGUARDANDO ABA COMBATE');
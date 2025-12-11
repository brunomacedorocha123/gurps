// ============================================
// PV-PF.js - SISTEMA COMPLETO FUNCIONAL
// ============================================

console.log("⚡ PV-PF.js INICIADO - Sistema de combate carregado");

// ============================================
// 1. ESTADO GLOBAL DO SISTEMA
// ============================================
const estadoCombate = {
    // PV - Pontos de Vida
    pv: {
        atual: 10,
        maximo: 10,
        base: 10,
        modificador: 0
    },
    
    // PF - Pontos de Fadiga
    pf: {
        atual: 10,
        maximo: 10,
        base: 10,
        modificador: 0
    },
    
    // Outros estados
    condicoesAtivas: new Set(),
    armasEquipadas: [],
    defesas: {
        esquiva: 10,
        bloqueio: 3,
        aparar: 3,
        deslocamento: 5.00
    }
};

// ============================================
// 2. VERIFICAÇÃO DE AMBIENTE
// ============================================
function verificarAmbiente() {
    console.log("🔍 Verificando ambiente...");
    
    const elementosEssenciais = [
        'pvAtualDisplay', 'pvModificador', 'pvFill',
        'pfAtualDisplay', 'pfModificador', 'pfFill'
    ];
    
    let todosExistem = true;
    
    elementosEssenciais.forEach(id => {
        const elemento = document.getElementById(id);
        if (!elemento) {
            console.error(`❌ Elemento essencial não encontrado: ${id}`);
            todosExistem = false;
        } else {
            console.log(`✅ ${id}: OK`);
        }
    });
    
    if (!todosExistem) {
        console.warn("⚠️ Alguns elementos não foram encontrados. O sistema pode ter problemas.");
        return false;
    }
    
    console.log("✅ Ambiente verificado com sucesso!");
    return true;
}

// ============================================
// 3. ATUALIZAÇÃO DO DISPLAY PV
// ============================================
function atualizarDisplayPV() {
    console.log(`📊 Atualizando PV: ${estadoCombate.pv.atual}/${estadoCombate.pv.maximo}`);
    
    // 3.1 Atualiza valores numéricos
    const elementosPV = {
        atual: document.getElementById('pvAtualDisplay'),
        max: document.getElementById('pvMaxDisplay'),
        base: document.getElementById('pvBaseDisplay'),
        texto: document.getElementById('pvTexto'),
        fill: document.getElementById('pvFill'),
        estado: document.getElementById('pvEstadoDisplay'),
        mod: document.getElementById('pvModificador')
    };
    
    // Atualiza valores
    if (elementosPV.atual) elementosPV.atual.value = estadoCombate.pv.atual;
    if (elementosPV.max) elementosPV.max.textContent = estadoCombate.pv.maximo;
    if (elementosPV.base) elementosPV.base.textContent = estadoCombate.pv.base;
    if (elementosPV.texto) elementosPV.texto.textContent = `${estadoCombate.pv.atual}/${estadoCombate.pv.maximo}`;
    if (elementosPV.mod) elementosPV.mod.value = estadoCombate.pv.modificador;
    
    // 3.2 Calcula porcentagem
    const porcentagemPV = estadoCombate.pv.maximo > 0 
        ? (estadoCombate.pv.atual / estadoCombate.pv.maximo) * 100 
        : 0;
    
    // 3.3 Determina estado e cor
    let corPV = '#27ae60'; // Verde padrão
    let estadoPV = 'Saudável';
    
    if (estadoCombate.pv.atual <= 0) {
        corPV = '#7f8c8d';
        estadoPV = 'Morto';
    } else if (porcentagemPV <= 20) {
        corPV = '#8e44ad';
        estadoPV = 'Morrendo';
    } else if (porcentagemPV <= 40) {
        corPV = '#e74c3c';
        estadoPV = 'Crítico';
    } else if (porcentagemPV <= 60) {
        corPV = '#e67e22';
        estadoPV = 'Ferido';
    } else if (porcentagemPV <= 80) {
        corPV = '#f1c40f';
        estadoPV = 'Machucado';
    }
    
    // 3.4 Atualiza barra e estado
    if (elementosPV.fill) {
        elementosPV.fill.style.width = `${Math.max(0, Math.min(100, porcentagemPV))}%`;
        elementosPV.fill.style.background = corPV;
        elementosPV.fill.style.transition = 'all 0.3s ease';
    }
    
    if (elementosPV.estado) {
        elementosPV.estado.textContent = estadoPV;
        elementosPV.estado.style.color = corPV;
        elementosPV.estado.style.background = `${corPV}20`;
        elementosPV.estado.style.padding = '4px 8px';
        elementosPV.estado.style.borderRadius = '4px';
        elementosPV.estado.style.fontWeight = 'bold';
    }
    
    console.log(`🎨 PV: ${estadoPV} (${porcentagemPV.toFixed(1)}%) - Cor: ${corPV}`);
}

// ============================================
// 4. ATUALIZAÇÃO DO DISPLAY PF
// ============================================
function atualizarDisplayPF() {
    console.log(`📊 Atualizando PF: ${estadoCombate.pf.atual}/${estadoCombate.pf.maximo}`);
    
    // 4.1 Atualiza valores numéricos
    const elementosPF = {
        atual: document.getElementById('pfAtualDisplay'),
        max: document.getElementById('pfMaxDisplay'),
        base: document.getElementById('pfBaseDisplay'),
        texto: document.getElementById('pfTexto'),
        fill: document.getElementById('pfFill'),
        estado: document.getElementById('pfEstadoDisplay'),
        mod: document.getElementById('pfModificador')
    };
    
    // Atualiza valores
    if (elementosPF.atual) elementosPF.atual.value = estadoCombate.pf.atual;
    if (elementosPF.max) elementosPF.max.textContent = estadoCombate.pf.maximo;
    if (elementosPF.base) elementosPF.base.textContent = estadoCombate.pf.base;
    if (elementosPF.texto) elementosPF.texto.textContent = `${estadoCombate.pf.atual}/${estadoCombate.pf.maximo}`;
    if (elementosPF.mod) elementosPF.mod.value = estadoCombate.pf.modificador;
    
    // 4.2 Calcula porcentagem
    const porcentagemPF = estadoCombate.pf.maximo > 0 
        ? (estadoCombate.pf.atual / estadoCombate.pf.maximo) * 100 
        : 0;
    
    // 4.3 Determina estado e cor
    let corPF = '#3498db'; // Azul padrão
    let estadoPF = 'Normal';
    
    if (estadoCombate.pf.atual <= 0) {
        corPF = '#e74c3c';
        estadoPF = 'Exausto';
    } else if (porcentagemPF <= 33) {
        corPF = '#f39c12';
        estadoPF = 'Fadigado';
    }
    
    // 4.4 Atualiza barra e estado
    if (elementosPF.fill) {
        elementosPF.fill.style.width = `${Math.max(0, Math.min(100, porcentagemPF))}%`;
        elementosPF.fill.style.background = corPF;
        elementosPF.fill.style.transition = 'all 0.3s ease';
    }
    
    if (elementosPF.estado) {
        elementosPF.estado.textContent = estadoPF;
        elementosPF.estado.style.color = corPF;
        elementosPF.estado.style.background = `${corPF}20`;
        elementosPF.estado.style.padding = '4px 8px';
        elementosPF.estado.style.borderRadius = '4px';
        elementosPF.estado.style.fontWeight = 'bold';
    }
    
    // 4.5 Atualiza estados visuais (Normal/Fadigado/Exausto)
    document.querySelectorAll('.pf-estado').forEach(estadoEl => {
        estadoEl.classList.remove('ativo');
        
        if (estadoEl.dataset.estado === 'normal' && estadoPF === 'Normal') {
            estadoEl.classList.add('ativo');
        } else if (estadoEl.dataset.estado === 'fadigado' && estadoPF === 'Fadigado') {
            estadoEl.classList.add('ativo');
        } else if (estadoEl.dataset.estado === 'exausto' && estadoPF === 'Exausto') {
            estadoEl.classList.add('ativo');
        }
    });
    
    console.log(`🎨 PF: ${estadoPF} (${porcentagemPF.toFixed(1)}%) - Cor: ${corPF}`);
}

// ============================================
// 5. FUNÇÕES DE CONTROLE DE PV
// ============================================
function alterarPV(valor) {
    console.log(`⚔️ Alterando PV: ${valor > 0 ? '+' : ''}${valor}`);
    
    const pvAntigo = estadoCombate.pv.atual;
    estadoCombate.pv.atual += valor;
    
    // Limites
    if (estadoCombate.pv.atual > estadoCombate.pv.maximo) {
        estadoCombate.pv.atual = estadoCombate.pv.maximo;
    }
    
    if (estadoCombate.pv.atual < -5 * estadoCombate.pv.maximo) {
        estadoCombate.pv.atual = -5 * estadoCombate.pv.maximo;
    }
    
    console.log(`PV: ${pvAntigo} → ${estadoCombate.pv.atual}`);
    
    // Efeito visual
    aplicarEfeito('pv', valor > 0 ? 'cura' : 'dano');
    
    // Atualiza display
    atualizarDisplayPV();
    
    // Salva estado
    salvarEstado();
}

function modificarPVModificador(valor) {
    console.log(`🎚️ Modificando PV Mod: ${valor > 0 ? '+' : ''}${valor}`);
    
    estadoCombate.pv.modificador += valor;
    
    // Limites -10 a +10
    if (estadoCombate.pv.modificador > 10) estadoCombate.pv.modificador = 10;
    if (estadoCombate.pv.modificador < -10) estadoCombate.pv.modificador = -10;
    
    // Recalcula máximo
    estadoCombate.pv.maximo = Math.max(1, estadoCombate.pv.base + estadoCombate.pv.modificador);
    
    // Ajusta atual se necessário
    if (estadoCombate.pv.atual > estadoCombate.pv.maximo) {
        estadoCombate.pv.atual = estadoCombate.pv.maximo;
    }
    
    console.log(`PV Mod: ${estadoCombate.pv.modificador}, Max: ${estadoCombate.pv.maximo}`);
    
    atualizarDisplayPV();
    salvarEstado();
}

function resetarPV() {
    console.log("🔄 Resetando PV para máximo");
    estadoCombate.pv.atual = estadoCombate.pv.maximo;
    aplicarEfeito('pv', 'cura');
    atualizarDisplayPV();
    salvarEstado();
}

// ============================================
// 6. FUNÇÕES DE CONTROLE DE PF
// ============================================
function alterarPF(valor) {
    console.log(`⚔️ Alterando PF: ${valor > 0 ? '+' : ''}${valor}`);
    
    const pfAntigo = estadoCombate.pf.atual;
    estadoCombate.pf.atual += valor;
    
    // Limites
    if (estadoCombate.pf.atual > estadoCombate.pf.maximo) {
        estadoCombate.pf.atual = estadoCombate.pf.maximo;
    }
    
    if (estadoCombate.pf.atual < -estadoCombate.pf.maximo) {
        estadoCombate.pf.atual = -estadoCombate.pf.maximo;
    }
    
    console.log(`PF: ${pfAntigo} → ${estadoCombate.pf.atual}`);
    
    // Efeito visual
    aplicarEfeito('pf', valor > 0 ? 'cura' : 'dano');
    
    // Atualiza display
    atualizarDisplayPF();
    
    // Salva estado
    salvarEstado();
}

function modificarPFModificador(valor) {
    console.log(`🎚️ Modificando PF Mod: ${valor > 0 ? '+' : ''}${valor}`);
    
    estadoCombate.pf.modificador += valor;
    
    // Limites -10 a +10
    if (estadoCombate.pf.modificador > 10) estadoCombate.pf.modificador = 10;
    if (estadoCombate.pf.modificador < -10) estadoCombate.pf.modificador = -10;
    
    // Recalcula máximo
    estadoCombate.pf.maximo = Math.max(1, estadoCombate.pf.base + estadoCombate.pf.modificador);
    
    // Ajusta atual se necessário
    if (estadoCombate.pf.atual > estadoCombate.pf.maximo) {
        estadoCombate.pf.atual = estadoCombate.pf.maximo;
    }
    
    console.log(`PF Mod: ${estadoCombate.pf.modificador}, Max: ${estadoCombate.pf.maximo}`);
    
    atualizarDisplayPF();
    salvarEstado();
}

function resetarPF() {
    console.log("🔄 Resetando PF para máximo");
    estadoCombate.pf.atual = estadoCombate.pf.maximo;
    aplicarEfeito('pf', 'cura');
    atualizarDisplayPF();
    salvarEstado();
}

// ============================================
// 7. EFEITOS VISUAIS
// ============================================
function aplicarEfeito(tipo, efeito) {
    const elementoId = tipo === 'pv' ? 'pvFill' : 'pfFill';
    const elemento = document.getElementById(elementoId);
    
    if (!elemento) return;
    
    // Remove classes anteriores
    elemento.classList.remove('dano-recebido', 'cura-recebida');
    
    // Força reflow
    void elemento.offsetWidth;
    
    // Adiciona nova classe
    elemento.classList.add(efeito === 'cura' ? 'cura-recebida' : 'dano-recebido');
    
    console.log(`✨ Efeito aplicado: ${tipo} - ${efeito}`);
    
    // Remove depois da animação
    setTimeout(() => {
        elemento.classList.remove('dano-recebido', 'cura-recebida');
    }, 800);
}

// ============================================
// 8. SISTEMA DE SALVAMENTO
// ============================================
function salvarEstado() {
    try {
        const dadosSalvar = {
            pv: estadoCombate.pv,
            pf: estadoCombate.pf,
            condicoes: Array.from(estadoCombate.condicoesAtivas)
        };
        
        localStorage.setItem('combateEstado', JSON.stringify(dadosSalvar));
        console.log("💾 Estado salvo com sucesso!");
    } catch (e) {
        console.error("❌ Erro ao salvar estado:", e);
    }
}

function carregarEstado() {
    try {
        const dadosSalvos = localStorage.getItem('combateEstado');
        
        if (dadosSalvos) {
            const dados = JSON.parse(dadosSalvos);
            
            // Carrega PV
            if (dados.pv) {
                estadoCombate.pv = { ...estadoCombate.pv, ...dados.pv };
            }
            
            // Carrega PF
            if (dados.pf) {
                estadoCombate.pf = { ...estadoCombate.pf, ...dados.pf };
            }
            
            // Carrega condições
            if (dados.condicoes) {
                estadoCombate.condicoesAtivas = new Set(dados.condicoes);
            }
            
            console.log("📂 Estado carregado com sucesso!");
            return true;
        }
    } catch (e) {
        console.error("❌ Erro ao carregar estado:", e);
    }
    
    return false;
}

// ============================================
// 9. INTEGRAÇÃO COM ATRIBUTOS
// ============================================
function integrarComAtributos() {
    console.log("🔄 Configurando integração com atributos...");
    
    // Escuta eventos do sistema de atributos
    document.addEventListener('atributosAlterados', (evento) => {
        console.log("📡 Evento de atributos recebido:", evento.detail);
        
        if (evento.detail) {
            // Atualiza bases
            if (evento.detail.ST !== undefined) {
                estadoCombate.pv.base = evento.detail.ST;
            }
            
            if (evento.detail.HT !== undefined) {
                estadoCombate.pf.base = evento.detail.HT;
            }
            
            // Recalcula máximos
            estadoCombate.pv.maximo = Math.max(1, estadoCombate.pv.base + estadoCombate.pv.modificador);
            estadoCombate.pf.maximo = Math.max(1, estadoCombate.pf.base + estadoCombate.pf.modificador);
            
            // Ajusta atuais se necessário
            if (estadoCombate.pv.atual > estadoCombate.pv.maximo) {
                estadoCombate.pv.atual = estadoCombate.pv.maximo;
            }
            
            if (estadoCombate.pf.atual > estadoCombate.pf.maximo) {
                estadoCombate.pf.atual = estadoCombate.pf.maximo;
            }
            
            console.log(`🎯 Bases atualizadas: PV=${estadoCombate.pv.base}, PF=${estadoCombate.pf.base}`);
            
            // Atualiza displays
            atualizarDisplayPV();
            atualizarDisplayPF();
        }
    });
    
    // Também tenta pegar valores iniciais
    setTimeout(() => {
        const stInput = document.getElementById('ST');
        const htInput = document.getElementById('HT');
        
        if (stInput && htInput) {
            estadoCombate.pv.base = parseInt(stInput.value) || 10;
            estadoCombate.pf.base = parseInt(htInput.value) || 10;
            
            estadoCombate.pv.maximo = Math.max(1, estadoCombate.pv.base + estadoCombate.pv.modificador);
            estadoCombate.pf.maximo = Math.max(1, estadoCombate.pf.base + estadoCombate.pf.modificador);
            
            atualizarDisplayPV();
            atualizarDisplayPF();
            
            console.log(`🎯 Valores iniciais: ST=${estadoCombate.pv.base}, HT=${estadoCombate.pf.base}`);
        }
    }, 1000);
}

// ============================================
// 10. SISTEMA DE CONDIÇÕES
// ============================================
function alternarCondicao(nomeCondicao) {
    console.log(`⚡ Alternando condição: ${nomeCondicao}`);
    
    if (estadoCombate.condicoesAtivas.has(nomeCondicao)) {
        estadoCombate.condicoesAtivas.delete(nomeCondicao);
    } else {
        estadoCombate.condicoesAtivas.add(nomeCondicao);
    }
    
    // Atualiza contador
    const contador = document.getElementById('condicoesAtivas');
    if (contador) {
        contador.textContent = estadoCombate.condicoesAtivas.size;
    }
    
    // Atualiza visual das condições
    document.querySelectorAll('.condicao-item').forEach(item => {
        if (estadoCombate.condicoesAtivas.has(item.dataset.condicao)) {
            item.classList.add('ativa');
        } else {
            item.classList.remove('ativa');
        }
    });
    
    salvarEstado();
}

// ============================================
// 11. FUNÇÕES GLOBAIS PARA HTML
// ============================================
// PV
window.alterarPV = alterarPV;
window.modificarPV = function(tipo, valor) {
    if (tipo === 'mod') modificarPVModificador(valor);
};
window.resetarPV = resetarPV;
window.atualizarPVManual = function() {
    const input = document.getElementById('pvAtualDisplay');
    if (input) {
        estadoCombate.pv.atual = parseInt(input.value) || 0;
        atualizarDisplayPV();
        salvarEstado();
    }
};

// PF
window.alterarPF = alterarPF;
window.modificarPF = function(tipo, valor) {
    if (tipo === 'mod') modificarPFModificador(valor);
};
window.resetarPF = resetarPF;
window.atualizarPFManual = function() {
    const input = document.getElementById('pfAtualDisplay');
    if (input) {
        estadoCombate.pf.atual = parseInt(input.value) || 0;
        atualizarDisplayPF();
        salvarEstado();
    }
};

// Condições
window.alternarCondicao = function(elemento) {
    alternarCondicao(elemento.dataset.condicao);
};

// RD (Resistência a Dano)
window.calcularRDTotal = function() {
    let total = 0;
    document.querySelectorAll('.rd-input').forEach(input => {
        total += parseInt(input.value) || 0;
    });
    
    const rdTotalEl = document.getElementById('rdTotal');
    if (rdTotalEl) {
        rdTotalEl.textContent = total;
    }
};

// ============================================
// 12. INICIALIZAÇÃO DO SISTEMA
// ============================================
function inicializarSistema() {
    console.log("🚀 Inicializando sistema PV-PF...");
    
    // Passo 1: Verifica ambiente
    if (!verificarAmbiente()) {
        console.warn("⚠️ Sistema iniciado com problemas no ambiente");
    }
    
    // Passo 2: Carrega estado salvo
    carregarEstado();
    
    // Passo 3: Configura integração com atributos
    integrarComAtributos();
    
    // Passo 4: Atualiza displays iniciais
    atualizarDisplayPV();
    atualizarDisplayPF();
    
    // Passo 5: Configura RD inicial
    setTimeout(() => {
        if (typeof calcularRDTotal === 'function') {
            calcularRDTotal();
        }
    }, 500);
    
    // Passo 6: Configura eventos de input
    document.getElementById('pvAtualDisplay')?.addEventListener('change', window.atualizarPVManual);
    document.getElementById('pfAtualDisplay')?.addEventListener('change', window.atualizarPFManual);
    
    console.log("✅ Sistema PV-PF inicializado com sucesso!");
    console.log("🎮 Pronto para uso! Todos os botões devem funcionar.");
}

// ============================================
// 13. INICIALIZAÇÃO AUTOMÁTICA
// ============================================
// Verifica se estamos na aba correta
function verificarAbaAtiva() {
    const abaCombate = document.getElementById('combate');
    
    if (!abaCombate) {
        console.log("⏳ Aguardando aba de combate...");
        setTimeout(verificarAbaAtiva, 500);
        return;
    }
    
    // Verifica se a aba está visível
    const estaVisivel = 
        abaCombate.classList.contains('active') || 
        abaCombate.style.display !== 'none' ||
        abaCombate.offsetParent !== null;
    
    if (estaVisivel) {
        console.log("🎯 Aba de combate está ativa! Inicializando...");
        inicializarSistema();
    } else {
        console.log("⏳ Aba de combate ainda não está ativa...");
        
        // Observa mudanças na aba
        const observer = new MutationObserver(() => {
            if (abaCombate.classList.contains('active')) {
                observer.disconnect();
                console.log("🎯 Aba de combate ativada! Inicializando...");
                inicializarSistema();
            }
        });
        
        observer.observe(abaCombate, { attributes: true, attributeFilter: ['class'] });
    }
}

// Inicia a verificação
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', verificarAbaAtiva);
} else {
    verificarAbaAtiva();
}

// Função global para debug
window.debugPVPF = function() {
    console.log("=== DEBUG PV-PF ===");
    console.log("Estado:", estadoCombate);
    console.log("Elementos encontrados:");
    console.log("- pvAtualDisplay:", document.getElementById('pvAtualDisplay')?.value);
    console.log("- pvModificador:", document.getElementById('pvModificador')?.value);
    console.log("- pfAtualDisplay:", document.getElementById('pfAtualDisplay')?.value);
    console.log("- pfModificador:", document.getElementById('pfModificador')?.value);
    
    // Testa função
    alterarPV(-5);
};

console.log("🎮 PV-PF.js carregado - Sistema pronto para inicialização!");
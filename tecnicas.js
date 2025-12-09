// ===== SISTEMA DE TÉCNICAS - CORRIGIDO =====
console.log("🎯 SISTEMA DE TÉCNICAS - CORRIGIDO");

// ===== 1. ESTADO DO SISTEMA =====
const estadoTecnicas = {
    aprendidas: [],
    pontosTotal: 0,
    ultimoNHArco: 0,
    cacheValidoAte: 0,
    intervaloObservacao: null
};

// ===== 2. SISTEMA DE OBSERVAÇÃO SUPERSENSÍVEL =====

// 2.1 Obter NH do Arco de QUALQUER FONTE
function obterNHArcoReal(forcar = false) {
    const agora = Date.now();
    
    // Usar cache se ainda válido (1 segundo)
    if (!forcar && estadoTecnicas.ultimoNHArco > 0 && agora < estadoTecnicas.cacheValidoAte) {
        return estadoTecnicas.ultimoNHArco;
    }
    
    let nhArco = 10;
    let fonte = 'default';
    
    // 1. Tentar do sistema de perícias ATIVO (se existir)
    if (window.estadoPericias?.periciasAprendidas) {
        const todasPericias = window.estadoPericias.periciasAprendidas;
        // Procurar arco de várias formas
        const arco = todasPericias.find(p => 
            p.id === 'arco' || 
            p.id === 'pericia-arco' || 
            p.nome?.toLowerCase().includes('arco')
        );
        if (arco?.nh) {
            nhArco = arco.nh;
            fonte = 'estadoPericias';
        }
    }
    
    // 2. Tentar do localStorage
    if (nhArco === 10) {
        try {
            const salvo = localStorage.getItem('periciasAprendidas');
            if (salvo) {
                const pericias = JSON.parse(salvo);
                const arco = pericias.find(p => 
                    p.id === 'arco' || 
                    p.id === 'pericia-arco' || 
                    p.nome?.toLowerCase().includes('arco')
                );
                if (arco?.nh) {
                    nhArco = arco.nh;
                    fonte = 'localStorage';
                }
            }
        } catch (e) {}
    }
    
    // 3. Tentar do sistema de atributos (ATRIBUTO DX + nível da perícia)
    if (nhArco === 10 && window.estadoAtributos) {
        const dx = window.estadoAtributos.dx || 10;
        // Se tiver a perícia arco em algum lugar...
        nhArco = dx; // Pelo menos o valor do atributo
        fonte = 'atributoDX';
    }
    
    console.log(`📊 NH Arco: ${nhArco} (fonte: ${fonte})`);
    
    // Atualizar cache (válido por 1 segundo)
    estadoTecnicas.ultimoNHArco = nhArco;
    estadoTecnicas.cacheValidoAte = agora + 1000;
    
    return nhArco;
}

// 2.2 Observar MUDANÇAS NO NH (qualquer fonte)
function iniciarObservacaoNH() {
    if (estadoTecnicas.intervaloObservacao) return;
    
    console.log("👀 Iniciando observação supersensível do NH...");
    
    let ultimoNH = obterNHArcoReal(true);
    let ultimoEstadoPericias = '';
    let ultimoEstadoAtributos = '';
    
    estadoTecnicas.intervaloObservacao = setInterval(() => {
        // 1. Verificar mudança no NH
        const nhAtual = obterNHArcoReal(false);
        if (nhAtual !== ultimoNH) {
            console.log(`🔄 NH MUDOU! ${ultimoNH} → ${nhAtual}`);
            ultimoNH = nhAtual;
            estadoTecnicas.ultimoNHArco = 0; // Invalidar cache
            atualizarTodasTecnicas();
        }
        
        // 2. Verificar mudança nas perícias
        try {
            const estadoPericias = localStorage.getItem('periciasAprendidas') || '';
            if (estadoPericias !== ultimoEstadoPericias) {
                console.log("📦 Perícias mudaram!");
                ultimoEstadoPericias = estadoPericias;
                estadoTecnicas.ultimoNHArco = 0;
                atualizarTodasTecnicas();
            }
        } catch (e) {}
        
        // 3. Verificar mudança em atributos
        if (window.estadoAtributos) {
            const estadoAtributos = JSON.stringify(window.estadoAtributos);
            if (estadoAtributos !== ultimoEstadoAtributos) {
                console.log("⚡ Atributos mudaram!");
                ultimoEstadoAtributos = estadoAtributos;
                estadoTecnicas.ultimoNHArco = 0;
                atualizarTodasTecnicas();
            }
        }
        
    }, 300); // Verificar a cada 300ms
    
    console.log("✅ Observação ativa!");
}

// 2.3 Verificar pré-requisitos
function verificarPreRequisitos() {
    const nhArco = obterNHArcoReal();
    const dx = window.estadoAtributos?.dx || 10;
    const nivelArco = nhArco - dx;
    
    const temArco = nivelArco > -5;
    const temCavalgar = verificarCavalgar();
    const pode = temArco && temCavalgar;
    
    return {
        pode: pode,
        motivo: !temArco ? `Arco nível ${nivelArco} (precisa > -5)` : 
                !temCavalgar ? 'Falta Cavalgar' : 'OK',
        nhArco: nhArco,
        nivelArco: nivelArco
    };
}

// 2.4 Verificar Cavalgar
function verificarCavalgar() {
    // No estadoPericias
    if (window.estadoPericias?.periciasAprendidas) {
        const tem = window.estadoPericias.periciasAprendidas.some(p => 
            p.id?.includes('cavalgar') || p.nome?.toLowerCase().includes('cavalgar')
        );
        if (tem) return true;
    }
    
    // No localStorage
    try {
        const salvo = localStorage.getItem('periciasAprendidas');
        if (salvo) {
            const pericias = JSON.parse(salvo);
            return pericias.some(p => 
                p.id?.includes('cavalgar') || p.nome?.toLowerCase().includes('cavalgar')
            );
        }
    } catch (e) {}
    
    return false;
}

// 2.5 Atualizar todas as técnicas
function atualizarTodasTecnicas() {
    console.log("🔄 Atualizando todas as técnicas...");
    atualizarTecnicaNaTela();
    atualizarDisplayAprendidas();
    atualizarEstatisticas();
}

// 2.6 Calcular custo
function calcularCusto(niveis) {
    return niveis > 0 ? niveis + 1 : 0;
}

// ===== 3. TÉCNICA NA TELA (SEM BOTÃO X) =====
function atualizarTecnicaNaTela() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        setTimeout(atualizarTecnicaNaTela, 500);
        return;
    }
    
    const prereq = verificarPreRequisitos();
    const nhBase = prereq.nhArco - 4;
    const tecnicaAprendida = estadoTecnicas.aprendidas.find(t => t.id === 'arquearia-montada');
    const niveis = tecnicaAprendida ? tecnicaAprendida.niveisComprados || 0 : 0;
    const nhAtual = nhBase + niveis;
    
    // Criar ou atualizar card
    let card = document.getElementById('tecnica-arquearia-montada');
    if (!card) {
        card = document.createElement('div');
        card.id = 'tecnica-arquearia-montada';
        container.insertBefore(card, container.firstChild);
    }
    
    // NÃO TEM BOTÃO X AQUI
    card.className = `pericia-item ${!prereq.pode ? 'item-indisponivel' : ''}`;
    card.style.cssText = `
        background: rgba(50, 50, 65, 0.95);
        border: 2px solid ${prereq.pode ? (tecnicaAprendida ? '#9b59b6' : '#27ae60') : '#e74c3c'};
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 15px;
        cursor: ${prereq.pode ? 'pointer' : 'not-allowed'};
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    
    if (prereq.pode) {
        card.onclick = abrirModalTecnica;
    } else {
        card.onclick = null;
    }
    
    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
                <h3 style="color: ${prereq.pode ? '#ffd700' : '#95a5a6'}; margin: 0 0 5px 0; font-size: 18px;">
                    🏹 Arquearia Montada
                    ${tecnicaAprendida ? '✅' : (prereq.pode ? '▶' : '🔒')}
                </h3>
                <div style="font-size: 12px; color: #95a5a6;">
                    ● Difícil ● Técnica Especial
                </div>
            </div>
            <div style="background: ${tecnicaAprendida ? '#9b59b6' : (prereq.pode ? '#27ae60' : '#e74c3c')}; 
                  color: white; padding: 6px 12px; border-radius: 15px; font-size: 14px; font-weight: bold;">
                NH ${nhAtual}
                ${niveis > 0 ? ` (+${niveis})` : ''}
            </div>
        </div>
        
        <p style="color: #ccc; margin: 10px 0; line-height: 1.5; font-size: 14px;">
            Usar arco enquanto cavalga. Penalidades para disparar montado não reduzem abaixo do NH desta técnica.
        </p>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 15px;">
            <div style="background: rgba(52, 152, 219, 0.1); padding: 8px; border-radius: 6px; border-left: 3px solid #3498db;">
                <div style="color: #95a5a6; font-size: 11px;">Base (Arco-4)</div>
                <div style="color: #3498db; font-size: 16px; font-weight: bold;">${nhBase}</div>
            </div>
            <div style="background: rgba(46, 204, 113, 0.1); padding: 8px; border-radius: 6px; border-left: 3px solid #2ecc71;">
                <div style="color: #95a5a6; font-size: 11px;">Máximo</div>
                <div style="color: #2ecc71; font-size: 16px; font-weight: bold;">${prereq.nhArco}</div>
            </div>
        </div>
        
        <div style="margin-top: 15px;">
            ${!prereq.pode ? `
                <div style="background: rgba(231, 76, 60, 0.1); padding: 10px; border-radius: 6px; border-left: 3px solid #e74c3c;">
                    <div style="color: #e74c3c; font-size: 13px;">
                        <i class="fas fa-info-circle"></i> ${prereq.motivo}
                    </div>
                </div>
            ` : tecnicaAprendida ? `
                <div style="background: rgba(155, 89, 182, 0.1); padding: 10px; border-radius: 6px; border-left: 3px solid #9b59b6;">
                    <div style="color: #9b59b6; font-size: 13px;">
                        <i class="fas fa-check-circle"></i> Aprendida (${niveis} níveis)
                    </div>
                </div>
            ` : `
                <div style="background: rgba(39, 174, 96, 0.1); padding: 10px; border-radius: 6px; border-left: 3px solid #27ae60;">
                    <div style="color: #27ae60; font-size: 13px;">
                        <i class="fas fa-shopping-cart"></i> Disponível
                    </div>
                </div>
            `}
        </div>
        
        <div style="color: #95a5a6; font-size: 11px; margin-top: 10px; text-align: right;">
            <i class="fas fa-sync-alt"></i> Atualizado: ${new Date().toLocaleTimeString()}
        </div>
    `;
}

// ===== 4. DISPLAY APRENDIDAS (COM BOTÃO X) =====
function atualizarDisplayAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (estadoTecnicas.aprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia-aprendida">
                <i class="fas fa-tools"></i>
                <div>Nenhuma técnica aprendida</div>
            </div>
        `;
        return;
    }
    
    estadoTecnicas.aprendidas.forEach(tecnica => {
        const nhArco = obterNHArcoReal();
        const nhBase = nhArco - 4;
        const nhAtual = nhBase + (tecnica.niveisComprados || 0);
        
        const item = document.createElement('div');
        item.className = 'pericia-item aprendida';
        item.style.cssText = `
            background: rgba(50, 50, 65, 0.95);
            border: 2px solid #9b59b6;
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        `;
        item.onclick = abrirModalTecnica;
        
        // AGORA TEM BOTÃO X AQUI
        item.innerHTML = `
            <button class="btn-excluir-tecnica" 
                    onclick="event.stopPropagation(); excluirTecnica('${tecnica.id}');"
                    style="position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; border-radius: 50%; background: #e74c3c; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; z-index: 10;">
                ×
            </button>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-right: 30px;">
                <div style="flex: 1;">
                    <h4 style="color: #ffd700; margin: 0 0 5px 0; font-size: 16px;">
                        🏹 ${tecnica.nome}
                        <span style="font-size: 12px; color: ${tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12'};">
                            ● ${tecnica.dificuldade}
                        </span>
                    </h4>
                    <div style="color: #9b59b6; font-size: 12px;">
                        Arco-4
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="background: #9b59b6; color: white; padding: 4px 12px; border-radius: 15px; font-size: 14px; font-weight: bold;">
                        NH ${nhAtual}
                    </div>
                    <div style="color: #27ae60; font-size: 14px; font-weight: bold;">
                        ${tecnica.custoTotal || 0} pts
                    </div>
                </div>
            </div>
            
            <div style="color: #95a5a6; font-size: 12px;">
                <i class="fas fa-chart-line"></i> +${tecnica.niveisComprados || 0} níveis
            </div>
        `;
        
        container.appendChild(item);
    });
}

// ===== 5. EXCLUSÃO (BOTÃO X) =====
function excluirTecnica(id) {
    const index = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
    if (index === -1) return;
    
    const tecnica = estadoTecnicas.aprendidas[index];
    
    if (confirm(`Remover "${tecnica.nome}"?\nRecuperará ${tecnica.custoTotal || 0} pontos.`)) {
        estadoTecnicas.aprendidas.splice(index, 1);
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.aprendidas));
        atualizarTodasTecnicas();
        alert(`✅ "${tecnica.nome}" removida!`);
    }
}

// ===== 6. ATUALIZAR ESTATÍSTICAS =====
function atualizarEstatisticas() {
    const total = estadoTecnicas.aprendidas.reduce((sum, t) => sum + (t.custoTotal || 0), 0);
    estadoTecnicas.pontosTotal = total;
    
    const badge = document.getElementById('pontos-tecnicas-total');
    if (badge) badge.textContent = `[${total} pts]`;
    
    const qtdTotal = document.getElementById('qtd-tecnicas-total');
    const ptsTotal = document.getElementById('pts-tecnicas-total');
    
    if (qtdTotal) qtdTotal.textContent = estadoTecnicas.aprendidas.length;
    if (ptsTotal) ptsTotal.textContent = `(${total} pts)`;
}

// ===== 7. MODAL =====
function abrirModalTecnica() {
    const nhArco = obterNHArcoReal();
    const nhBase = nhArco - 4;
    const max = nhArco - nhBase;
    const tecnica = estadoTecnicas.aprendidas.find(t => t.id === 'arquearia-montada');
    const niveisAtuais = tecnica ? tecnica.niveisComprados || 0 : 0;
    
    let niveis = niveisAtuais;
    
    const modal = document.querySelector('.modal-tecnica-overlay');
    const content = document.querySelector('.modal-tecnica');
    
    if (!modal || !content) {
        alert('Modal não encontrado');
        return;
    }
    
    function atualizarModal() {
        const custo = calcularCusto(niveis);
        const custoAtual = calcularCusto(niveisAtuais);
        
        content.innerHTML = `
            <div class="modal-header">
                <h2>🏹 Arquearia Montada</h2>
                <button onclick="fecharModal()">×</button>
            </div>
            <div class="modal-body">
                <p>Usar arco enquanto cavalga.</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
                    <div style="text-align: center;">
                        <div style="color: #95a5a6;">Seu Arco</div>
                        <div style="color: #3498db; font-size: 24px;">NH ${nhArco}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="color: #95a5a6;">Base (Arco-4)</div>
                        <div style="color: #2ecc71; font-size: 24px;">NH ${nhBase}</div>
                    </div>
                </div>
                
                <div style="text-align: center; margin: 20px 0;">
                    <div style="color: #ffd700; font-size: 18px;">Níveis: ${niveis}</div>
                    <div style="display: flex; justify-content: center; gap: 15px; margin: 10px 0;">
                        <button onclick="mudarNivel(-1)" ${niveis <= 0 ? 'disabled' : ''}
                                style="padding: 8px 16px; background: #e74c3c; color: white; border: none; border-radius: 5px;">
                            -1
                        </button>
                        <button onclick="mudarNivel(1)" ${niveis >= max ? 'disabled' : ''}
                                style="padding: 8px 16px; background: #27ae60; color: white; border: none; border-radius: 5px;">
                            +1
                        </button>
                    </div>
                    <div style="color: #95a5a6;">
                        NH: <strong style="color: #2ecc71;">${nhBase + niveis}</strong>
                    </div>
                </div>
                
                <div style="background: rgba(155, 89, 182, 0.2); padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <div style="color: #9b59b6;">Custo</div>
                    <div style="color: white; font-size: 28px; font-weight: bold;">${custo} pontos</div>
                    ${niveis !== niveisAtuais ? `<div style="color: #95a5a6; font-size: 12px;">Diferença: ${custo > custoAtual ? '+' : ''}${custo - custoAtual}</div>` : ''}
                </div>
            </div>
            <div class="modal-footer">
                <button onclick="fecharModal()" style="flex: 1; padding: 12px; background: #7f8c8d; color: white; border: none; border-radius: 5px;">
                    Cancelar
                </button>
                <button onclick="confirmarCompra(${niveis})" style="flex: 1; padding: 12px; background: ${niveis === niveisAtuais ? '#95a5a6' : '#9b59b6'}; color: white; border: none; border-radius: 5px;">
                    ${niveis === niveisAtuais ? 'Fechar' : niveis > niveisAtuais ? 'Comprar' : 'Reduzir'}
                </button>
            </div>
        `;
    }
    
    window.fecharModal = () => modal.style.display = 'none';
    window.mudarNivel = (mudanca) => {
        const novo = niveis + mudanca;
        if (novo >= 0 && novo <= max) {
            niveis = novo;
            atualizarModal();
        }
    };
    window.confirmarCompra = (n) => {
        if (n === niveisAtuais) {
            fecharModal();
            return;
        }
        
        const custo = calcularCusto(n);
        const index = estadoTecnicas.aprendidas.findIndex(t => t.id === 'arquearia-montada');
        
        if (index >= 0) {
            estadoTecnicas.aprendidas[index].niveisComprados = n;
            estadoTecnicas.aprendidas[index].custoTotal = custo;
        } else {
            estadoTecnicas.aprendidas.push({
                id: 'arquearia-montada',
                nome: 'Arquearia Montada',
                dificuldade: 'Difícil',
                niveisComprados: n,
                custoTotal: custo
            });
        }
        
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.aprendidas));
        atualizarTodasTecnicas();
        fecharModal();
    };
    
    atualizarModal();
    modal.style.display = 'flex';
}

// ===== 8. INICIALIZAÇÃO =====
function inicializarTecnicas() {
    console.log("🚀 Iniciando sistema...");
    
    // Carregar salvo
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) estadoTecnicas.aprendidas = JSON.parse(salvo);
    } catch (e) {}
    
    // Iniciar observação
    iniciarObservacaoNH();
    
    // Atualizar
    setTimeout(() => {
        atualizarTodasTecnicas();
    }, 1000);
}

// ===== 9. CARREGAR =====
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(inicializarTecnicas, 1500);
});

// ===== 10. FUNÇÕES GLOBAIS =====
window.abrirModalTecnica = abrirModalTecnica;
window.excluirTecnica = excluirTecnica;

// Debug
window.mostrarEstado = () => {
    console.log("=== ESTADO ===");
    console.log("NH Arco:", obterNHArcoReal());
    console.log("Técnicas:", estadoTecnicas.aprendidas);
    console.log("Pré-requisitos:", verificarPreRequisitos());
};

console.log("✅ Sistema pronto!");
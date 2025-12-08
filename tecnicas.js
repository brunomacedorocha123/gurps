// ===== SISTEMA DE TÉCNICAS - ARQUEARIA MONTADA (100% FUNCIONAL) =====
console.log("   INICIANDO SISTEMA DE TÉCNICAS - ARQUEARIA MONTADA");

let estadoTecnicas = {
    tecnicasAprendidas: [],
    tecnicaSelecionada: null,
    modalAberto: false
};

// ===== FUNÇÕES AUXILIARES =====

function obterDX() {
    const input = document.getElementById('DX');
    return input ? parseInt(input.value) || 10 : 10;
}

function buscarPericiaArco() {
    if (!window.estadoPericias?.periciasAprendidas) return null;
    return window.estadoPericias.periciasAprendidas.find(p => p.id === 'arco');
}

function temCavalgar() {
    if (!window.estadoPericias?.periciasAprendidas) return false;
    return window.estadoPericias.periciasAprendidas.some(p => 
        p.id?.startsWith('cavalgar-')
    );
}

function calcularCusto(niveisAcima) {
    if (niveisAcima <= 0) return 0;
    const custos = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // Tabela GURPS para técnicas Difíceis
    return custos[niveisAcima - 1] || (niveisAcima + 1);
}

function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
    } catch (e) {
        console.error("Erro ao salvar técnicas", e);
    }
}

function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
        }
    } catch (e) {
        console.error("Erro ao carregar técnicas", e);
    }
}

// ===== RENDERIZAR CATÁLOGO =====
function renderizarCatalogo() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;

    const periciaArco = buscarPericiaArco();
    const arcoNivel = periciaArco ? periciaArco.nivel || 0 : null;
    const temArco = arcoNivel !== null;
    const arcoOK = temArco && arcoNivel >= 4;
    const cavalgarOK = temCavalgar();
    const prereqOK = arcoOK && cavalgarOK;

    const dx = obterDX();
    const nhArco = temArco ? dx + arcoNivel : dx;
    const nhBase = nhArco - 4;

    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === 'arquearia-montada');
    const niveisComprados = jaAprendida ? jaAprendida.niveisComprados || 0 : 0;
    const nhAtual = nhBase + niveisComprados;

    let motivo = '';
    if (!temArco) motivo = '❌ Precisa da perícia Arco';
    else if (!arcoOK) motivo = `❌ Arco precisa ser nível 4+ (atual: ${arcoNivel})`;
    else if (!cavalgarOK) motivo = '❌ Precisa de alguma perícia de Cavalgar';

    const html = `
        <div class="pericia-item ${prereqOK ? '' : 'item-indisponivel'}"
            ${prereqOK ? 'onclick="abrirModalArqueariaMontada()"' : ''}
            style="cursor: ${prereqOK ? 'pointer' : 'not-allowed'};
                   opacity: ${prereqOK ? '1' : '0.6'};
                   background: ${jaAprendida ? 'rgba(39, 174, 96, 0.15)' : 'rgba(50, 50, 65, 0.9)'};
                   border: 1px solid ${jaAprendida ? 'rgba(39, 174, 96, 0.4)' : 'rgba(255, 140, 0, 0.3)'};
                   border-radius: 8px; padding: 15px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <h4 style="margin: 0; color: ${jaAprendida ? '#27ae60' : '#ffd700'}; font-size: 16px;">
                    Arquearia Montada ${jaAprendida ? '<span style="color:#27ae60; margin-left:5px;">✓</span>' : ''}
                </h4>
                <div style="display: flex; gap: 10px;">
                    <span style="background: #e74c3c; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Difícil</span>
                    <span style="background: #3498db; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">NH ${nhAtual}</span>
                </div>
            </div>
            <p style="margin: 10px 0; color: #ccc; font-size: 14px; line-height: 1.4;">
                Permite usar arco enquanto cavalga. NH base = Arco-4. Não pode exceder NH em Arco.
            </p>
            ${!prereqOK ? `
                <div style="background: rgba(231, 76, 60, 0.1); border-left: 3px solid #e74c3c; padding: 8px 12px; margin-top: 10px; border-radius: 4px;">
                    <i class="fas fa-lock" style="color: #e74c3c;"></i> 
                    <span style="color: #e74c3c; margin-left: 5px;">${motivo}</span>
                </div>
            ` : ''}
            ${prereqOK ? `
                <div style="margin-top: 10px; font-size: 12px; color: #95a5a6;">
                    <i class="fas fa-bullseye" style="margin-right: 5px;"></i>
                    Clique para ${jaAprendida ? 'melhorar' : 'aprender'} esta técnica
                    ${niveisComprados > 0 ? `<span style="color: #f39c12; margin-left: 10px;">(+${niveisComprados} níveis)</span>` : ''}
                </div>
            ` : ''}
        </div>
    `;

    container.innerHTML = html;
}

// ===== ABRIR MODAL =====
function abrirModalArqueariaMontada() {
    const periciaArco = buscarPericiaArco();
    const dx = obterDX();
    const arcoNivel = periciaArco ? periciaArco.nivel || 0 : 0;
    const nhArco = dx + arcoNivel;
    const nhBase = nhArco - 4;
    const nhMaximo = nhArco;

    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === 'arquearia-montada');
    const niveisComprados = jaAprendida ? jaAprendida.niveisComprados || 0 : 0;
    const nhAtual = nhBase + niveisComprados;
    const niveisPossiveis = Math.max(0, nhMaximo - nhBase); // = 4

    let opcoes = '';
    for (let i = 0; i <= niveisPossiveis; i++) {
        const nh = nhBase + i;
        const custo = calcularCusto(i);
        const selected = i === niveisComprados ? 'selected' : '';
        opcoes += `<option value="${i}" ${selected}>NH ${nh} - ${i === 0 ? 'Base (Arco-4)' : `+${i} nível`} (${custo} pts)</option>`;
    }

    const modalHTML = `
        <div style="background: linear-gradient(135deg, #2c3e50, #34495e); color: white; padding: 20px; border-radius: 8px 8px 0 0; position: relative; border-bottom: 2px solid #ff8c00;">
            <span onclick="fecharModal()" style="position: absolute; right: 20px; top: 20px; font-size: 24px; cursor: pointer; color: #ffd700; font-weight: bold;">×</span>
            <h3 style="margin: 0; color: #ffd700;">Arquearia Montada</h3>
            <div style="color: #95a5a6; margin-top: 5px; font-size: 14px;">
                <span style="background: #e74c3c; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Difícil</span>
            </div>
        </div>
        <div style="padding: 20px; background: #1e1e28; color: #ccc; max-height: 60vh; overflow-y: auto;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 15px; background: rgba(52, 152, 219, 0.1); border-radius: 8px; border: 1px solid rgba(52, 152, 219, 0.3);">
                    <div style="font-size: 12px; color: #95a5a6; margin-bottom: 5px;">Base (Arco-4)</div>
                    <div style="font-size: 28px; font-weight: bold; color: #3498db;">${nhBase}</div>
                </div>
                <div style="text-align: center; padding: 15px; background: rgba(39, 174, 96, 0.1); border-radius: 8px; border: 1px solid rgba(39, 174, 96, 0.3);">
                    <div style="font-size: 12px; color: #95a5a6; margin-bottom: 5px;">Máximo (NH Arco)</div>
                    <div style="font-size: 28px; font-weight: bold; color: #27ae60;">${nhMaximo}</div>
                </div>
                <div style="text-align: center; padding: 15px; background: rgba(243, 156, 18, 0.1); border-radius: 8px; border: 1px solid rgba(243, 156, 18, 0.3);">
                    <div style="font-size: 12px; color: #95a5a6; margin-bottom: 5px;">Atual</div>
                    <div style="font-size: 28px; font-weight: bold; color: #f39c12;">${nhAtual}</div>
                </div>
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 10px; color: #ffd700; font-weight: bold;">Níveis acima da base:</label>
                <select id="nivel-tecnica" style="width: 100%; padding: 10px; background: #2c3e50; color: #ffd700; border: 1px solid #ff8c00; border-radius: 4px;">
                    ${opcoes}
                </select>
                <div id="custo-info" style="margin-top: 8px; font-size: 13px; color: #95a5a6;">Custo: ${calcularCusto(niveisComprados)} pontos</div>
            </div>
            <p style="font-size: 14px; line-height: 1.5;">Permite usar arco enquanto cavalga sem penalidades máximas. Penalidades de cavalgar não reduzem abaixo do NH nesta técnica.</p>
        </div>
        <div style="padding: 20px; background: #2c3e50; border-radius: 0 0 8px 8px; display: flex; gap: 15px; justify-content: flex-end;">
            <button onclick="fecharModal()" style="padding: 10px 20px; background: #7f8c8d; color: white; border: none; border-radius: 4px;">Cancelar</button>
            <button onclick="confirmarCompraTecnica()" style="padding: 10px 20px; background: #ff8c00; color: #2c3e50; border: none; border-radius: 4px; font-weight: bold;">
                ${jaAprendida ? 'Atualizar' : 'Comprar'}
            </button>
        </div>
    `;

    const overlay = document.querySelector('.modal-tecnica-overlay');
    const modal = document.querySelector('.modal-tecnica');
    if (overlay && modal) {
        modal.innerHTML = modalHTML;
        overlay.style.display = 'flex';
        estadoTecnicas.modalAberto = true;

        const select = document.getElementById('nivel-tecnica');
        const custoInfo = document.getElementById('custo-info');
        if (select && custoInfo) {
            select.addEventListener('change', () => {
                const n = parseInt(select.value);
                custoInfo.textContent = `Custo: ${calcularCusto(n)} pontos`;
            });
        }
    }
}

// ===== COMPRAR/ATUALIZAR =====
function confirmarCompraTecnica() {
    const select = document.getElementById('nivel-tecnica');
    if (!select) return;

    const niveis = parseInt(select.value);
    const custo = calcularCusto(niveis);
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === 'arquearia-montada');

    if (index >= 0) {
        estadoTecnicas.tecnicasAprendidas[index] = {
            ...estadoTecnicas.tecnicasAprendidas[index],
            niveisComprados: niveis,
            custoTotal: custo,
            data: new Date().toISOString()
        };
    } else {
        estadoTecnicas.tecnicasAprendidas.push({
            id: 'arquearia-montada',
            nome: 'Arquearia Montada',
            niveisComprados: niveis,
            custoTotal: custo,
            data: new Date().toISOString()
        });
    }

    salvarTecnicas();
    renderizarCatalogo();
    renderizarAprendidas();
    fecharModal();
    atualizarBadgeTotal();
}

// ===== RENDERIZAR APRENDIDAS =====
function renderizarAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;

    const lista = estadoTecnicas.tecnicasAprendidas;
    if (lista.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:40px; color:#95a5a6;">Nenhuma técnica aprendida</div>`;
        return;
    }

    const t = lista[0];
    const periciaArco = buscarPericiaArco();
    const dx = obterDX();
    const arcoNivel = periciaArco ? periciaArco.nivel || 0 : 0;
    const nhArco = dx + arcoNivel;
    const nhBase = nhArco - 4;
    const nhAtual = nhBase + (t.niveisComprados || 0);

    container.innerHTML = `
        <div style="background: rgba(155, 89, 182, 0.15); border: 1px solid rgba(155, 89, 182, 0.4); border-radius: 8px; padding: 15px; position: relative;">
            <h4 style="margin: 0; color: #e67e22;">Arquearia Montada <span style="color: #f39c12; font-size: 0.9em;">(Arco-4 + ${t.niveisComprados || 0})</span></h4>
            <div style="margin: 10px 0; font-size: 14px; color: #ccc;">
                NH Atual: ${nhAtual} | Base: ${nhBase} | Máximo: ${nhArco}
            </div>
            <div style="font-size: 13px; color: #95a5a6;">
                Custo: ${t.custoTotal || 0} pontos
            </div>
            <button onclick="removerTecnica('arquearia-montada')"
                style="position: absolute; top: 15px; right: 15px; background: rgba(231,76,60,0.2); color: #e74c3c; border: 1px solid rgba(231,76,60,0.4); width: 30px; height: 30px; border-radius: 4px;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
}

function removerTecnica(id) {
    estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
    salvarTecnicas();
    renderizarCatalogo();
    renderizarAprendidas();
    atualizarBadgeTotal();
}

function atualizarBadgeTotal() {
    const total = estadoTecnicas.tecnicasAprendidas.reduce((s, t) => s + (t.custoTotal || 0), 0);
    const badge = document.getElementById('pontos-tecnicas-total');
    if (badge) badge.textContent = `[${total} pts]`;
    
    // Atualizar contadores
    const qtdEl = document.getElementById('qtd-tecnicas-dificil');
    const ptsEl = document.getElementById('pts-tecnicas-dificil');
    const qtdTotal = document.getElementById('qtd-tecnicas-total');
    const ptsTotal = document.getElementById('pts-tecnicas-total');
    
    if (qtdEl) qtdEl.textContent = estadoTecnicas.tecnicasAprendidas.length;
    if (ptsEl) ptsEl.textContent = `(${total} pts)`;
    if (qtdTotal) qtdTotal.textContent = estadoTecnicas.tecnicasAprendidas.length;
    if (ptsTotal) ptsTotal.textContent = `(${total} pts)`;
}

// ===== FECHAR MODAL =====
function fecharModal() {
    const overlay = document.querySelector('.modal-tecnica-overlay');
    if (overlay) overlay.style.display = 'none';
    estadoTecnicas.modalAberto = false;
}

// ===== OBSERVAR MUDANÇAS =====
function observarMudancas() {
    let ultimoEstado = '';
    setInterval(() => {
        const dx = obterDX();
        const arco = buscarPericiaArco();
        const cavalgar = temCavalgar();
        const estado = `${dx}|${arco?.nivel || 'null'}|${cavalgar}`;
        if (estado !== ultimoEstado) {
            ultimoEstado = estado;
            renderizarCatalogo();
        }
    }, 500);
}

// ===== INICIALIZAR =====
function inicializarTecnicas() {
    carregarTecnicas();
    renderizarCatalogo();
    renderizarAprendidas();
    atualizarBadgeTotal();
    observarMudancas();
    console.log("✅ Sistema de Arquearia Montada inicializado!");
}

// Inicializar quando a aba de perícias estiver visível
document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver(() => {
        const pericias = document.getElementById('pericias');
        if (pericias && pericias.style.display !== 'none') {
            if (!window.tecnicaInicializada) {
                setTimeout(inicializarTecnicas, 800);
                window.tecnicaInicializada = true;
            }
        }
    });
    const pericias = document.getElementById('pericias');
    if (pericias) observer.observe(pericias, { attributes: true, attributeFilter: ['style'] });
});

// Exportar funções
window.abrirModalArqueariaMontada = abrirModalArqueariaMontada;
window.confirmarCompraTecnica = confirmarCompraTecnica;
window.fecharModal = fecharModal;
window.removerTecnica = removerTecnica;
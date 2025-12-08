// ===== SISTEMA DE TÉCNICAS - VERSÃO 100% FUNCIONAL PARA ARQUEARIA MONTADA =====
console.log("   INICIANDO SISTEMA DE TÉCNICAS (ARQUEARIA MONTADA)");

let estadoTecnicas = {
    pontosTecnicasTotal: 0,
    pontosMedio: 0,
    pontosDificil: 0,
    qtdMedio: 0,
    qtdDificil: 0,
    qtdTotal: 0,
    tecnicasAprendidas: [],
    filtroAtivo: 'todas-tecnicas',
    buscaAtiva: '',
    tecnicasDisponiveis: [],
    modalAberto: false,
    tecnicaSelecionada: null
};

// ===== TABELA DE CUSTO PARA TÉCNICAS =====
function calcularCustoTecnica(niveisAcima, dificuldade) {
    if (niveisAcima <= 0) return 0;
    if (dificuldade === 'Difícil') {
        const custos = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        return custos[niveisAcima - 1] || (niveisAcima + 1);
    }
    if (dificuldade === 'Média') {
        return niveisAcima;
    }
    return 0;
}

// ===== FUNÇÃO: OBTER DX ATUAL DO HTML (compatível com atributo.js) =====
function obterDXAtual() {
    const dxInput = document.getElementById('DX');
    if (dxInput) {
        const valor = parseInt(dxInput.value);
        return isNaN(valor) ? 10 : valor;
    }
    return 10;
}

// ===== FUNÇÃO: BUSCAR PERÍCIA NO ESTADO ATUAL =====
function buscarPericiaNoEstado(idPericia) {
    if (!window.estadoPericias?.periciasAprendidas) return null;
    return window.estadoPericias.periciasAprendidas.find(p => p.id === idPericia);
}

// ===== FUNÇÃO: DETECTAR QUALQUER CAVALGAR =====
function temQualquerCavalgar() {
    if (!window.estadoPericias?.periciasAprendidas) return false;
    return window.estadoPericias.periciasAprendidas.some(p => 
        p.id?.startsWith('cavalgar-')
    );
}

// ===== FUNÇÃO: OBTER NH EM ARCO (DX + nível comprado) =====
function obterNHArco() {
    const dx = obterDXAtual();
    const periciaArco = buscarPericiaNoEstado('arco');
    const niveisComprados = periciaArco ? (periciaArco.nivel || 0) : 0;
    return dx + niveisComprados;
}

// ===== VERIFICAR PRÉ-REQUISITOS DE ARQUEARIA MONTADA =====
function verificarPreRequisitosArqueariaMontada() {
    const periciaArco = buscarPericiaNoEstado('arco');
    const arcoOK = periciaArco && periciaArco.nivel >= 4;
    const cavalgarOK = temQualquerCavalgar();
    
    if (!arcoOK && !cavalgarOK) {
        return { passou: false, motivo: '❌ Precisa de Arco nível 4+ e alguma perícia de Cavalgar' };
    }
    if (!arcoOK) {
        return { passou: false, motivo: '❌ Precisa da perícia Arco nível 4 ou superior' };
    }
    if (!cavalgarOK) {
        return { passou: false, motivo: '❌ Precisa de alguma perícia de Cavalgar' };
    }
    return { passou: true, motivo: '' };
}

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS (SÓ ARQUEARIA MONTADA) =====
function atualizarTecnicasDisponiveis() {
    if (!window.catalogoTecnicas) {
        console.error("❌ Catálogo de técnicas não carregado!");
        return;
    }

    const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId('arquearia-montada');
    if (!tecnicaCatalogo) {
        console.error("❌ Arquearia Montada não encontrada no catálogo!");
        return;
    }

    // Verificar pré-requisitos
    const verificacao = verificarPreRequisitosArqueariaMontada();
    
    // Calcular NH
    const nhArco = obterNHArco();
    const nhBase = nhArco - 4;
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === 'arquearia-montada');

    let nhAtual = nhBase;
    let niveisComprados = 0;
    if (jaAprendida) {
        niveisComprados = jaAprendida.niveisComprados || 0;
        nhAtual = nhBase + niveisComprados;
    }

    const tecnicaAtualizada = {
        ...tecnicaCatalogo,
        disponivel: verificacao.passou,
        nhAtual: nhAtual,
        nhArco: nhArco,
        nhBase: nhBase,
        motivoIndisponivel: verificacao.motivo,
        jaAprendida: !!jaAprendida,
        niveisComprados: niveisComprados
    };

    estadoTecnicas.tecnicasDisponiveis = [tecnicaAtualizada];
    renderizarCatalogoTecnicas();
}

// ===== RENDERIZAR CATÁLOGO =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;

    const tecnica = estadoTecnicas.tecnicasDisponiveis[0];
    if (!tecnica) {
        container.innerHTML = `<div class="nenhuma-pericia" style="text-align: center; padding: 40px; color: #95a5a6;">Erro no carregamento</div>`;
        return;
    }

    const jaAprendida = tecnica.jaAprendida;
    const disponivel = tecnica.disponivel;

    let html = `
        <div class="pericia-item ${!disponivel ? 'item-indisponivel' : ''}"
            data-id="${tecnica.id}"
            style="cursor: ${disponivel ? 'pointer' : 'not-allowed'};
                   opacity: ${disponivel ? '1' : '0.6'};
                   background: ${jaAprendida ? 'rgba(39, 174, 96, 0.15)' : 'rgba(50, 50, 65, 0.9)'};
                   border: 1px solid ${jaAprendida ? 'rgba(39, 174, 96, 0.4)' : 'rgba(255, 140, 0, 0.3)'};
                   border-radius: 8px;
                   padding: 15px;
                   margin-bottom: 10px;
                   transition: all 0.3s ease;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <h4 style="margin: 0; color: ${jaAprendida ? '#27ae60' : '#ffd700'}; font-size: 16px;">
                    ${tecnica.nome}
                    ${jaAprendida ? '<span style="color: #27ae60; margin-left: 5px;">✓</span>' : ''}
                </h4>
                <div style="display: flex; gap: 10px;">
                    <span style="background: ${tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12'}; 
                          color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                        ${tecnica.dificuldade}
                    </span>
                    <span style="background: #3498db; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                        NH ${tecnica.nhAtual}
                    </span>
                </div>
            </div>
            <p style="margin: 10px 0; color: #ccc; font-size: 14px; line-height: 1.4;">${tecnica.descricao}</p>
            ${!disponivel ? `
                <div style="background: rgba(231, 76, 60, 0.1); border-left: 3px solid #e74c3c; 
                     padding: 8px 12px; margin-top: 10px; border-radius: 4px;">
                    <i class="fas fa-lock" style="color: #e74c3c;"></i> 
                    <span style="color: #e74c3c; margin-left: 5px;">${tecnica.motivoIndisponivel}</span>
                </div>
            ` : ''}
            ${disponivel ? `
                <div style="margin-top: 10px; font-size: 12px; color: #95a5a6; display: flex; align-items: center;">
                    <i class="fas fa-bullseye" style="margin-right: 5px;"></i>
                    Clique para ${jaAprendida ? 'melhorar' : 'aprender'} esta técnica
                    ${tecnica.niveisComprados > 0 ? 
                        `<span style="margin-left: 10px; color: #f39c12;">(+${tecnica.niveisComprados} níveis)</span>` : ''}
                </div>
            ` : ''}
        </div>
    `;

    container.innerHTML = html;

    if (disponivel) {
        container.querySelector('.pericia-item').addEventListener('click', () => {
            abrirModalTecnica(tecnica);
        });
    }
}

// ===== ABRIR MODAL =====
function abrirModalTecnica(tecnica) {
    estadoTecnicas.tecnicaSelecionada = tecnica;
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);

    const nhArco = obterNHArco();
    const nhBase = nhArco - 4;
    const nhMaximo = nhArco;

    let niveisComprados = jaAprendida ? (jaAprendida.niveisComprados || 0) : 0;
    let nhAtual = nhBase + niveisComprados;
    const niveisPossiveis = Math.max(0, nhMaximo - nhBase); // Sempre = 4

    let opcoesHTML = '';
    for (let i = 0; i <= niveisPossiveis; i++) {
        const nhOpcao = nhBase + i;
        const custo = calcularCustoTecnica(i, tecnica.dificuldade);
        const selected = i === niveisComprados ? 'selected' : '';
        opcoesHTML += `
            <option value="${i}" data-custo="${custo}" ${selected}>
                NH ${nhOpcao} - ${i === 0 ? 'Base (Arco-4)' : `+${i} nível acima`} (${custo} pontos)
            </option>
        `;
    }

    const modalHTML = `
        <div style="background: linear-gradient(135deg, #2c3e50, #34495e); color: white; 
             padding: 20px; border-radius: 8px 8px 0 0; position: relative; border-bottom: 2px solid #ff8c00;">
            <span onclick="fecharModalTecnica()" 
                  style="position: absolute; right: 20px; top: 20px; font-size: 24px; 
                         cursor: pointer; color: #ffd700; font-weight: bold;">×</span>
            <h3 style="margin: 0; color: #ffd700; font-size: 20px;">${tecnica.nome}</h3>
            <div style="color: #95a5a6; margin-top: 5px; font-size: 14px;">
                <span class="pericia-dificuldade" style="background: #e74c3c; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                    ${tecnica.dificuldade}
                </span>
                • Técnica Especial • NH Base: Arco-4
            </div>
        </div>
        <div style="padding: 20px; background: #1e1e28; color: #ccc; max-height: 60vh; overflow-y: auto;">
            <div style="background: rgba(155, 89, 182, 0.1); padding: 15px; border-radius: 8px; 
                 border-left: 4px solid #9b59b6; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <i class="fas fa-info-circle" style="color: #9b59b6; font-size: 18px;"></i>
                    <h4 style="margin: 0; color: #9b59b6;">Pré-requisitos atendidos</h4>
                </div>
                <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 14px;">
                    <li>✅ Perícia Arco nível 4 ou superior</li>
                    <li>✅ Alguma perícia de Cavalgar</li>
                </ul>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 15px; background: rgba(52, 152, 219, 0.1); 
                     border-radius: 8px; border: 1px solid rgba(52, 152, 219, 0.3);">
                    <div style="font-size: 12px; color: #95a5a6; margin-bottom: 5px;">Base (Arco-4)</div>
                    <div style="font-size: 28px; font-weight: bold; color: #3498db;">${nhBase}</div>
                </div>
                <div style="text-align: center; padding: 15px; background: rgba(39, 174, 96, 0.1); 
                     border-radius: 8px; border: 1px solid rgba(39, 174, 96, 0.3);">
                    <div style="font-size: 12px; color: #95a5a6; margin-bottom: 5px;">Máximo (NH Arco)</div>
                    <div style="font-size: 28px; font-weight: bold; color: #27ae60;">${nhMaximo}</div>
                </div>
                <div style="text-align: center; padding: 15px; background: rgba(243, 156, 18, 0.1); 
                     border-radius: 8px; border: 1px solid rgba(243, 156, 18, 0.3);">
                    <div style="font-size: 12px; color: #95a5a6; margin-bottom: 5px;">Atual</div>
                    <div style="font-size: 28px; font-weight: bold; color: #f39c12;">${nhAtual}</div>
                </div>
            </div>
            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 10px; color: #ffd700; font-weight: bold; font-size: 16px;">
                    <i class="fas fa-chart-line" style="margin-right: 8px;"></i>
                    Níveis acima da base (Arco-4):
                </label>
                <select id="select-niveis-tecnica"
                    style="width: 100%; padding: 14px; border-radius: 8px; border: 2px solid #ff8c00;
                           background: #2c3e50; color: #ffd700; font-size: 16px;">
                    ${opcoesHTML}
                </select>
                <div style="font-size: 13px; color: #95a5a6; margin-top: 8px;">
                    <i class="fas fa-coins" style="margin-right: 5px;"></i>
                    Custo: 2 pontos para +1 nível, 3 pontos para +2, etc.
                </div>
            </div>
            <div style="background: rgba(39, 174, 96, 0.1); padding: 20px; border-radius: 8px;
                 border-left: 4px solid #27ae60; margin-bottom: 25px; text-align: center;">
                <div style="font-size: 14px; color: #95a5a6; margin-bottom: 8px;">
                    <i class="fas fa-money-bill-wave" style="margin-right: 5px;"></i>
                    Custo Total
                </div>
                <div id="custo-display" style="font-size: 36px; font-weight: bold; color: #27ae60;">
                    ${calcularCustoTecnica(niveisComprados, tecnica.dificuldade)} pontos
                </div>
                <div id="info-custo-detalhe" style="font-size: 13px; color: #7f8c8d; margin-top: 5px;">
                    ${jaAprendida ? `${niveisComprados} níveis já comprados` : 'Nova técnica'}
                </div>
            </div>
            <div style="margin-bottom: 20px;">
                <h4 style="color: #ffd700; margin-bottom: 12px; font-size: 18px; border-bottom: 1px solid #34495e; padding-bottom: 5px;">
                    <i class="fas fa-scroll" style="margin-right: 8px;"></i>
                    Descrição da Técnica
                </h4>
                <p style="line-height: 1.6; font-size: 14px; color: #ccc;">${tecnica.descricao}</p>
            </div>
            <div style="background: rgba(155, 89, 182, 0.1); padding: 18px; border-radius: 8px;
                 border-left: 4px solid #9b59b6;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <i class="fas fa-gavel" style="color: #9b59b6; font-size: 18px;"></i>
                    <h5 style="color: #9b59b6; margin: 0; font-size: 16px;">Regras Importantes</h5>
                </div>
                <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 13px; line-height: 1.5;">
                    <li><strong>NH base</strong> = NH em Arco - 4</li>
                    <li><strong>Níveis adicionais</strong> podem ser comprados acima da base</li>
                    <li><strong>Limite máximo</strong>: O NH nesta técnica NUNCA pode exceder seu NH em Arco</li>
                    <li>Cada nível acima da base tem um custo progressivo</li>
                </ul>
            </div>
        </div>
        <div style="padding: 20px; background: #2c3e50; border-radius: 0 0 8px 8px; 
             display: flex; gap: 15px; justify-content: flex-end; border-top: 2px solid #34495e;">
            <button onclick="fecharModalTecnica()"
                style="padding: 12px 30px; background: #7f8c8d; color: white; border: none; 
                       border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px;">
                <i class="fas fa-times" style="margin-right: 8px;"></i>Cancelar
            </button>
            <button onclick="comprarTecnica()"
                id="btn-comprar-tecnica"
                style="padding: 12px 30px; background: linear-gradient(45deg, #ff8c00, #ffd700);
                       color: #1e1e28; border: none; border-radius: 6px; font-weight: bold; 
                       cursor: pointer; font-size: 14px;">
                <i class="fas fa-shopping-cart" style="margin-right: 8px;"></i>
                ${jaAprendida ? 'Atualizar' : 'Comprar'}
            </button>
        </div>
    `;

    const modal = document.querySelector('.modal-tecnica');
    const overlay = document.querySelector('.modal-tecnica-overlay');
    if (!modal || !overlay) return;

    modal.innerHTML = modalHTML;
    overlay.style.display = 'flex';
    estadoTecnicas.modalAberto = true;

    // Configurar atualização de custo
    const select = document.getElementById('select-niveis-tecnica');
    const custoDisplay = document.getElementById('custo-display');
    const btn = document.getElementById('btn-comprar-tecnica');
    const info = document.getElementById('info-custo-detalhe');

    if (select && custoDisplay && btn && info) {
        select.addEventListener('change', () => {
            const n = parseInt(select.value);
            const c = calcularCustoTecnica(n, tecnica.dificuldade);
            custoDisplay.textContent = `${c} pontos`;
            if (jaAprendida && n === niveisComprados) {
                btn.textContent = 'Manter';
                btn.disabled = true;
            } else {
                btn.textContent = jaAprendida ? `Atualizar (${c} pts)` : `Comprar (${c} pts)`;
                btn.disabled = false;
            }
        });
    }
}

// ===== COMPRAR/ATUALIZAR =====
function comprarTecnica() {
    const tecnica = estadoTecnicas.tecnicaSelecionada;
    if (!tecnica) return;

    const select = document.getElementById('select-niveis-tecnica');
    const niveis = parseInt(select.value);
    const custo = calcularCustoTecnica(niveis, tecnica.dificuldade);

    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === 'arquearia-montada');

    if (index >= 0) {
        estadoTecnicas.tecnicasAprendidas[index] = {
            ...estadoTecnicas.tecnicasAprendidas[index],
            niveisComprados: niveis,
            custoTotal: custo,
            dataAtualizacao: new Date().toISOString()
        };
    } else {
        estadoTecnicas.tecnicasAprendidas.push({
            id: 'arquearia-montada',
            nome: tecnica.nome,
            dificuldade: tecnica.dificuldade,
            niveisComprados: niveis,
            custoTotal: custo,
            dataAquisicao: new Date().toISOString()
        });
    }

    salvarTecnicas();
    atualizarTudo();
    fecharModalTecnica();
    alert(`✅ ${tecnica.nome} ${index >= 0 ? 'atualizada' : 'aprendida'}!\nCusto: ${custo} pontos\nNível: Arco-4 + ${niveis}`);
}

// ===== REMOVER =====
function removerTecnica(id) {
    if (id !== 'arquearia-montada') return;
    if (confirm(`Remover "${estadoTecnicas.tecnicasAprendidas[0].nome}"?`)) {
        estadoTecnicas.tecnicasAprendidas = [];
        salvarTecnicas();
        atualizarTudo();
    }
}

// ===== RENDERIZAR APRENDIDAS =====
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;

    if (estadoTecnicas.tecnicasAprendidas.length === 0) {
        container.innerHTML = `<div class="nenhuma-pericia-aprendida" style="text-align: center; padding: 40px; color: #95a5a6;">
            <i class="fas fa-tools" style="font-size: 48px; margin-bottom: 15px; color: #9b59b6;"></i>
            <div style="font-size: 18px; margin-bottom: 10px;">Nenhuma técnica aprendida</div>
        </div>`;
        return;
    }

    const t = estadoTecnicas.tecnicasAprendidas[0];
    const nhArco = obterNHArco();
    const nhBase = nhArco - 4;
    const nhAtual = nhBase + (t.niveisComprados || 0);

    container.innerHTML = `
        <div class="pericia-aprendida-item" style="background: rgba(155, 89, 182, 0.15); 
             border: 1px solid rgba(155, 89, 182, 0.4); border-radius: 8px; padding: 15px; 
             margin-bottom: 10px; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <h4 style="margin: 0; color: #e67e22; font-size: 16px;">
                    ${t.nome}
                    <span style="color: #f39c12; font-size: 0.9em; font-style: italic; margin-left: 5px;">
                        (Arco-4 + ${t.niveisComprados || 0})
                    </span>
                </h4>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span style="background: #2ecc71; color: white; padding: 3px 10px; border-radius: 4px; font-size: 14px; font-weight: bold;">
                        NH ${nhAtual}
                    </span>
                    <span style="background: #3498db; color: white; padding: 3px 10px; border-radius: 4px; font-size: 14px;">
                        ${t.custoTotal || 0} pts
                    </span>
                </div>
            </div>
            <div style="font-size: 13px; color: #95a5a6; margin-top: 8px; line-height: 1.5;">
                <div><strong>Níveis comprados:</strong> ${t.niveisComprados || 0}</div>
                <div><strong>Base (Arco-4):</strong> ${nhBase}</div>
                <div><strong>Máximo (NH Arco):</strong> ${nhArco}</div>
                <div><strong>Custo total:</strong> ${t.custoTotal || 0} pontos</div>
            </div>
            <button onclick="removerTecnica('arquearia-montada')"
                style="position: absolute; top: 15px; right: 15px; background: rgba(231, 76, 60, 0.2); 
                       color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.4); border-radius: 4px; 
                       width: 30px; height: 30px; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
}

// ===== ATUALIZAR ESTATÍSTICAS =====
function atualizarEstatisticasTecnicas() {
    const t = estadoTecnicas.tecnicasAprendidas[0];
    const custo = t ? t.custoTotal || 0 : 0;

    estadoTecnicas.pontosTecnicasTotal = custo;
    estadoTecnicas.qtdTotal = t ? 1 : 0;
    estadoTecnicas.qtdDificil = t ? 1 : 0;
    estadoTecnicas.pontosDificil = custo;

    // Atualizar HTML
    const badges = {
        'qtd-tecnicas-dificil': 1,
        'pts-tecnicas-dificil': `(${custo} pts)`,
        'qtd-tecnicas-total': 1,
        'pts-tecnicas-total': `(${custo} pts)`
    };
    for (const [id, val] of Object.entries(badges)) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }
    const badgeTotal = document.getElementById('pontos-tecnicas-total');
    if (badgeTotal) badgeTotal.textContent = `[${custo} pts]`;
}

// ===== FUNÇÃO UNIFICADA DE ATUALIZAÇÃO =====
function atualizarTudo() {
    atualizarTecnicasDisponiveis();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
}

// ===== SALVAR/LOAD =====
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

// ===== FECHAR MODAL =====
function fecharModalTecnica() {
    const overlay = document.querySelector('.modal-tecnica-overlay');
    if (overlay) overlay.style.display = 'none';
    estadoTecnicas.modalAberto = false;
    estadoTecnicas.tecnicaSelecionada = null;
}

// ===== OBSERVAR MUDANÇAS EM TEMPO REAL =====
function observarMudancas() {
    let ultimoArco = '';
    let ultimoCavalgar = '';

    setInterval(() => {
        const arco = buscarPericiaNoEstado('arco');
        const cavalgar = temQualquerCavalgar();
        const dx = obterDXAtual();

        const estadoArco = arco ? `${dx}-${arco.nivel}` : `dx-${dx}`;
        const estadoCavalgar = cavalgar ? 'sim' : 'nao';

        if (estadoArco !== ultimoArco || estadoCavalgar !== ultimoCavalgar) {
            ultimoArco = estadoArco;
            ultimoCavalgar = estadoCavalgar;
            atualizarTudo();
        }
    }, 500);
}

// ===== INICIALIZAR =====
function inicializarSistemaTecnicas() {
    console.log("   INICIALIZANDO SISTEMA DE TÉCNICAS");
    carregarTecnicas();
    atualizarTudo();
    observarMudancas();
    console.log("✅ SISTEMA DE ARQUEARIA MONTADA PRONTO!");
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa quando a aba de perícias estiver ativa
    const observer = new MutationObserver(() => {
        const pericias = document.getElementById('pericias');
        if (pericias && pericias.style.display !== 'none') {
            if (!window.sistemaTecnicasIniciado) {
                setTimeout(inicializarSistemaTecnicas, 800);
                window.sistemaTecnicasIniciado = true;
            } else {
                atualizarTudo();
            }
        }
    });

    const pericias = document.getElementById('pericias');
    if (pericias) observer.observe(pericias, { attributes: true, attributeFilter: ['style'] });
});

// ===== EXPORTAR =====
window.fecharModalTecnica = fecharModalTecnica;
window.comprarTecnica = comprarTecnica;
window.removerTecnica = removerTecnica;
window.atualizarTudo = atualizarTudo;
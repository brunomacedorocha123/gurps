// ===== SISTEMA DE TÉCNICAS - 100% FUNCIONAL (SEM CATÁLOGO INTERNO) =====
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
    tecnicasDisponiveis: []
};

// ===== CÁLCULO DE CUSTO =====
function calcularCustoTecnica(niveisAcima, dificuldade) {
    if (niveisAcima <= 0) return 0;
    
    if (dificuldade === 'Média') {
        return niveisAcima;
    }
    
    if (dificuldade === 'Difícil') {
        if (niveisAcima === 1) return 2;
        if (niveisAcima === 2) return 3;
        if (niveisAcima === 3) return 4;
        if (niveisAcima === 4) return 5;
        return 5 + (niveisAcima - 4);
    }
    
    return 0;
}

// ===== OBTER VALOR DO ATRIBUTO =====
function obterValorAtributo(atributo) {
    if (window.obterValorAtributo && typeof window.obterValorAtributo === 'function') {
        return window.obterValorAtributo(atributo);
    }
    return 10;
}

// ===== OBTER NH DA PERÍCIA =====
function obterNHPericiaPorId(idPericia) {
    if (!window.estadoPericias?.periciasAprendidas) {
        return null;
    }
    
    const pericia = window.estadoPericias.periciasAprendidas.find(p => p.id === idPericia);
    if (!pericia) return null;
    
    const valorAtributo = obterValorAtributo(pericia.atributo);
    return valorAtributo + (pericia.nivel || 0);
}

// ===== VERIFICAR PRÉ-REQUISITOS ===== (CORRIGIDA)
function verificarPreRequisitosTecnica(tecnica) {
    if (!window.estadoPericias?.periciasAprendidas) {
        return { passou: false, motivo: 'Sistema de perícias não carregado' };
    }
    
    const periciasAprendidas = window.estadoPericias.periciasAprendidas;
    
    for (const prereq of (tecnica.preRequisitos || [])) {
        // Verifica Cavalgar: aceita qualquer especialização (cavalgar-*) OU o grupo (grupo-cavalgar)
        if (prereq.verificarCavalgar) {
            const temCavalgar = periciasAprendidas.some(p =>
                p.id === 'grupo-cavalgar' ||               // grupo genérico no filtro DX
                p.id.startsWith('cavalgar-')              // especializações: cavalgar-cavalo, etc.
            );
            if (!temCavalgar) {
                return { passou: false, motivo: 'Falta: Cavalgar (qualquer animal)' };
            }
            continue;
        }
        
        // Verifica perícia específica por ID
        if (prereq.idPericia) {
            const temPericia = periciasAprendidas.some(p => p.id === prereq.idPericia);
            if (!temPericia) {
                // Tentativa de fallback por nome (opcional, mas útil para compatibilidade)
                const porNome = periciasAprendidas.some(p =>
                    p.nome.toLowerCase().includes(prereq.idPericia.toLowerCase())
                );
                if (!porNome) {
                    const nomeExibicao = prereq.nomePericia || prereq.idPericia;
                    return { passou: false, motivo: `Falta: ${nomeExibicao}` };
                }
            }
        }
    }
    
    return { passou: true, motivo: '' };
}

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
    if (!window.catalogoTecnicas) {
        console.error("⚠️ Catálogo de técnicas não encontrado!");
        return;
    }
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    const disponiveis = [];
    
    todasTecnicas.forEach(tecnica => {
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        
        let nhAtual = 0;
        if (tecnica.baseCalculo?.idPericia) {
            const nhPericia = obterNHPericiaPorId(tecnica.baseCalculo.idPericia);
            if (nhPericia !== null) {
                nhAtual = nhPericia + (tecnica.baseCalculo.redutor || 0);
                if (jaAprendida?.niveisAcimaBase) {
                    nhAtual += jaAprendida.niveisAcimaBase;
                }
            }
        }
        
        const custoAtual = jaAprendida ? jaAprendida.custoPago || 0 : 0;
        
        disponiveis.push({
            ...tecnica,
            disponivel: verificacao.passou,
            nhAtual: nhAtual,
            custoAtual: custoAtual,
            jaAprendida: !!jaAprendida,
            motivoIndisponivel: verificacao.motivo
        });
    });
    
    estadoTecnicas.tecnicasDisponiveis = disponiveis;
    renderizarCatalogoTecnicas();
}

// ===== RENDERIZAR CATÁLOGO =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
    let tecnicasFiltradas = [...estadoTecnicas.tecnicasDisponiveis];
    
    if (estadoTecnicas.filtroAtivo === 'medio-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Média');
    } else if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Difícil');
    }
    
    if (estadoTecnicas.buscaAtiva.trim()) {
        const termo = estadoTecnicas.buscaAtiva.toLowerCase();
        tecnicasFiltradas = tecnicasFiltradas.filter(t =>
            t.nome.toLowerCase().includes(termo) ||
            (t.descricao && t.descricao.toLowerCase().includes(termo))
        );
    }
    
    if (tecnicasFiltradas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia">
                <i class="fas fa-info-circle"></i>
                <div>Nenhuma técnica encontrada</div>
            </div>
        `;
        return;
    }
    
    let html = '';
    tecnicasFiltradas.forEach(tecnica => {
        const disponivel = tecnica.disponivel;
        const jaAprendida = tecnica.jaAprendida;
        const dificuldadeClass = tecnica.dificuldade === 'Difícil' ? 'dificuldade-dificil-tecnica' : 'dificuldade-medio-tecnica';
        
        html += `
            <div class="pericia-item" data-id="${tecnica.id}" data-tipo="tecnica" 
                 style="cursor: ${disponivel ? 'pointer' : 'not-allowed'}; opacity: ${disponivel ? '1' : '0.7'}">
                <div class="pericia-header">
                    <h4 class="pericia-nome">
                        ${tecnica.nome} 
                        ${jaAprendida ? '<span style="color: #27ae60; margin-left: 5px;">✓</span>' : ''}
                    </h4>
                    <div class="pericia-info">
                        <span class="pericia-dificuldade ${dificuldadeClass}">
                            <i class="fas ${tecnica.dificuldade === 'Difícil' ? 'fa-star' : 'fa-star-half-alt'}"></i>
                            ${tecnica.dificuldade}
                        </span>
                        <span class="pericia-custo">NH ${tecnica.nhAtual}</span>
                        ${tecnica.custoAtual > 0 ? `<span class="pericia-custo">${tecnica.custoAtual} pts</span>` : ''}
                    </div>
                </div>
                <p class="pericia-descricao">${tecnica.descricao || ''}</p>
                
                ${tecnica.baseCalculo ? `
                <div class="tecnica-base-info" style="margin: 5px 0; font-size: 0.85em; color: #3498db;">
                    <small>
                        <i class="fas fa-calculator"></i> 
                        Base: ${tecnica.baseCalculo.idPericia}${tecnica.baseCalculo.redutor < 0 ? ` ${tecnica.baseCalculo.redutor}` : ''}
                    </small>
                </div>
                ` : ''}
                
                ${!disponivel ? `
                <div class="tecnica-indisponivel" style="margin-top: 8px; padding: 8px; background: rgba(231, 76, 60, 0.1); border-radius: 4px; border-left: 3px solid #e74c3c;">
                    <i class="fas fa-lock" style="color: #e74c3c;"></i> 
                    <span style="color: #e74c3c; font-size: 0.9em;">${tecnica.motivoIndisponivel || 'Pré-requisitos não atendidos'}</span>
                </div>
                ` : ''}
                
                ${tecnica.preRequisitos?.length > 0 ? `
                <div class="pericia-requisitos" style="margin-top: 8px;">
                    <small style="color: #95a5a6;">
                        <strong><i class="fas fa-key"></i> Requer:</strong> 
                        ${tecnica.preRequisitos.map(p => 
                            p.verificarCavalgar ? 'Cavalgar' :
                            p.nomePericia || p.idPericia || 'Perícia'
                        ).join(', ')}
                    </small>
                </div>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    document.querySelectorAll('.pericia-item[data-tipo="tecnica"]').forEach(item => {
        const tecnicaId = item.dataset.id;
        const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === tecnicaId);
        if (tecnica && tecnica.disponivel) {
            item.addEventListener('click', () => abrirModalTecnica(tecnica));
        }
    });
}

// ===== RENDERIZAR TÉCNICAS APRENDIDAS =====
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    if (estadoTecnicas.tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia-aprendida">
                <i class="fas fa-tools"></i>
                <div>Nenhuma técnica aprendida</div>
            </div>
        `;
        return;
    }
    
    let html = '';
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(tecnica.id);
        let nhFinal = 0;
        let nhMaximo = Infinity;
        
        if (tecnicaCatalogo?.baseCalculo) {
            const nhPericia = obterNHPericiaPorId(tecnicaCatalogo.baseCalculo.idPericia);
            if (nhPericia !== null) {
                nhFinal = nhPericia + (tecnicaCatalogo.baseCalculo.redutor || 0) + (tecnica.niveisAcimaBase || 0);
            }
        }
        
        if (tecnicaCatalogo?.limiteMaximo) {
            const nhLimite = obterNHPericiaPorId(tecnicaCatalogo.limiteMaximo.idPericia);
            if (nhLimite !== null) nhMaximo = nhLimite;
        }
        
        const dificuldadeClass = tecnica.dificuldade === 'Difícil' ? 'dificuldade-dificil-tecnica' : 'dificuldade-medio-tecnica';
        
        html += `
            <div class="pericia-aprendida-item" data-tipo="tecnica" data-id="${tecnica.id}">
                <div class="pericia-aprendida-header">
                    <h4 class="pericia-aprendida-nome">${tecnica.nome}</h4>
                    <div class="pericia-aprendida-info">
                        <span class="pericia-aprendida-nivel">
                            <i class="fas fa-bullseye"></i> NH ${nhFinal}
                        </span>
                        <span class="pericia-dificuldade ${dificuldadeClass}">
                            <i class="fas ${tecnica.dificuldade === 'Difícil' ? 'fa-star' : 'fa-star-half-alt'}"></i>
                            ${tecnica.dificuldade}
                        </span>
                        <span class="pericia-aprendida-custo">
                            <i class="fas fa-coins"></i> ${tecnica.custoPago || 0} pts
                        </span>
                    </div>
                </div>
                
                ${tecnicaCatalogo?.baseCalculo ? `
                <div class="tecnica-base-info" style="margin: 8px 0; font-size: 0.9em; color: #ccc;">
                    <small>
                        <i class="fas fa-calculator"></i> 
                        Base: ${tecnicaCatalogo.baseCalculo.idPericia} 
                        ${tecnicaCatalogo.baseCalculo.redutor < 0 ? ` ${tecnicaCatalogo.baseCalculo.redutor}` : ''}
                        + ${tecnica.niveisAcimaBase || 0} níveis
                    </small>
                </div>
                ` : ''}
                
                <div class="pericia-requisitos" style="margin-top: 5px;">
                    <small style="color: #3498db;">
                        <i class="fas fa-chart-line"></i> 
                        <strong>Máximo:</strong> NH ${nhMaximo === Infinity ? '∞' : nhMaximo}
                    </small>
                </div>
                
                <button class="btn-remover-pericia" data-id="${tecnica.id}" title="Remover técnica">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Remover técnica
    document.querySelectorAll('.btn-remover-pericia').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.dataset.id;
            const tecnica = estadoTecnicas.tecnicasAprendidas.find(t => t.id === id);
            if (tecnica && confirm(`Remover a técnica "${tecnica.nome}"?\n\nOs ${tecnica.custoPago || 0} pontos gastos serão perdidos.`)) {
                estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
                salvarTecnicas();
                renderizarStatusTecnicas();
                renderizarTecnicasAprendidas();
                atualizarTecnicasDisponiveis();
            }
        });
    });
    
    // Editar técnica
    document.querySelectorAll('.pericia-aprendida-item[data-tipo="tecnica"]').forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.closest('.btn-remover-pericia')) return;
            const id = this.dataset.id;
            const tecnica = estadoTecnicas.tecnicasAprendidas.find(t => t.id === id);
            const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(id);
            if (tecnica && tecnicaCatalogo) {
                abrirModalTecnica({
                    ...tecnicaCatalogo,
                    jaAprendida: true,
                    nhAtual: tecnica.nhAtual,
                    custoAtual: tecnica.custoPago
                });
            }
        });
    });
}

// ===== RENDERIZAR STATUS =====
function renderizarStatusTecnicas() {
    estadoTecnicas.pontosTecnicasTotal = 0;
    estadoTecnicas.pontosMedio = 0;
    estadoTecnicas.pontosDificil = 0;
    estadoTecnicas.qtdMedio = 0;
    estadoTecnicas.qtdDificil = 0;
    
    estadoTecnicas.tecnicasAprendidas.forEach(t => {
        const custo = t.custoPago || 0;
        if (t.dificuldade === 'Média') {
            estadoTecnicas.qtdMedio++;
            estadoTecnicas.pontosMedio += custo;
        } else if (t.dificuldade === 'Difícil') {
            estadoTecnicas.qtdDificil++;
            estadoTecnicas.pontosDificil += custo;
        }
        estadoTecnicas.pontosTecnicasTotal += custo;
    });
    
    estadoTecnicas.qtdTotal = estadoTecnicas.qtdMedio + estadoTecnicas.qtdDificil;
    
    const elementos = {
        'qtd-tecnicas-medio': estadoTecnicas.qtdMedio,
        'pts-tecnicas-medio': `(${estadoTecnicas.pontosMedio} pts)`,
        'qtd-tecnicas-dificil': estadoTecnicas.qtdDificil,
        'pts-tecnicas-dificil': `(${estadoTecnicas.pontosDificil} pts)`,
        'qtd-tecnicas-total': estadoTecnicas.qtdTotal,
        'pts-tecnicas-total': `(${estadoTecnicas.pontosTecnicasTotal} pts)`
    };
    
    for (const [id, valor] of Object.entries(elementos)) {
        const el = document.getElementById(id);
        if (el) el.textContent = valor;
    }
    
    const badge = document.getElementById('pontos-tecnicas-total');
    if (badge) badge.textContent = `[${estadoTecnicas.pontosTecnicasTotal} pts]`;
}

// ===== MODAL =====
function abrirModalTecnica(tecnica) {
    if (!tecnica) return;
    
    const verificacao = verificarPreRequisitosTecnica(tecnica);
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(tecnica.id);
    if (!tecnicaCatalogo) return;
    
    let baseAtual = 0;
    if (tecnicaCatalogo.baseCalculo?.idPericia) {
        const nhPericia = obterNHPericiaPorId(tecnicaCatalogo.baseCalculo.idPericia);
        if (nhPericia !== null) {
            baseAtual = nhPericia + (tecnicaCatalogo.baseCalculo.redutor || 0);
        }
    }
    
    let nhMaximo = Infinity;
    if (tecnicaCatalogo.limiteMaximo?.idPericia) {
        const nhLimite = obterNHPericiaPorId(tecnicaCatalogo.limiteMaximo.idPericia);
        if (nhLimite !== null) nhMaximo = nhLimite;
    }
    
    const niveisAcima = jaAprendida ? jaAprendida.niveisAcimaBase || 0 : 0;
    const nhAtual = baseAtual + niveisAcima;
    
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    const modalContent = document.querySelector('.modal-tecnica');
    if (!modalOverlay || !modalContent) return;
    
    let optionsHtml = '';
    const max = nhMaximo === Infinity ? baseAtual + 10 : nhMaximo;
    for (let nh = baseAtual; nh <= max; nh++) {
        const niveis = nh - baseAtual;
        const custo = calcularCustoTecnica(niveis, tecnica.dificuldade);
        const selected = nh === nhAtual ? 'selected' : '';
        let texto = `NH ${nh}`;
        if (niveis === 0) {
            texto += ' (Base - 0 pts)';
        } else {
            texto += ` (${custo} pontos)`;
        }
        optionsHtml += `<option value="${nh}" data-niveis="${niveis}" data-custo="${custo}" ${selected}>${texto}</option>`;
    }
    
    modalContent.innerHTML = `
        <div class="modal-header-pericia">
            <span class="modal-close" onclick="fecharModalTecnica()">&times;</span>
            <h3>
                <i class="fas ${tecnica.dificuldade === 'Difícil' ? 'fa-star' : 'fa-star-half-alt'}"></i>
                ${tecnica.nome} 
                ${jaAprendida ? '<span style="color: #27ae60; font-size: 0.8em;">(APRENDIDA)</span>' : ''}
            </h3>
            <div class="modal-subtitulo">
                ${tecnica.dificuldade} • Base: ${tecnicaCatalogo.baseCalculo?.idPericia || 'Perícia'} 
                ${tecnicaCatalogo.baseCalculo?.redutor < 0 ? `${tecnicaCatalogo.baseCalculo.redutor}` : ''}
            </div>
        </div>
        
        <div class="modal-body-pericia">
            <div class="nivel-info-tecnica" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div class="info-item-tecnica" style="background: rgba(40, 40, 50, 0.8); padding: 12px; border-radius: 8px; text-align: center;">
                    <label style="display: block; color: #95a5a6; font-size: 0.85em; margin-bottom: 5px;">Nível Base</label>
                    <div style="color: #3498db; font-size: 1.8em; font-weight: 700;">${baseAtual}</div>
                </div>
                <div class="info-item-tecnica" style="background: rgba(40, 40, 50, 0.8); padding: 12px; border-radius: 8px; text-align: center;">
                    <label style="display: block; color: #95a5a6; font-size: 0.85em; margin-bottom: 5px;">Nível Máximo</label>
                    <div style="color: ${nhMaximo === Infinity ? '#e74c3c' : '#2ecc71'}; font-size: 1.8em; font-weight: 700;">
                        ${nhMaximo === Infinity ? '∞' : nhMaximo}
                    </div>
                </div>
                <div class="info-item-tecnica" style="background: rgba(40, 40, 50, 0.8); padding: 12px; border-radius: 8px; text-align: center;">
                    <label style="display: block; color: #95a5a6; font-size: 0.85em; margin-bottom: 5px;">Nível Atual</label>
                    <div style="color: #ffd700; font-size: 1.8em; font-weight: 700;">${nhAtual}</div>
                </div>
            </div>
            
            <div class="seletor-nivel-tecnica" style="margin: 20px 0;">
                <label style="display: block; color: #ffd700; margin-bottom: 10px; font-weight: 600;">
                    <i class="fas fa-sliders-h"></i> Selecione o nível desejado:
                </label>
                <select id="seletor-nh-tecnica" class="select-nivel-tecnica" 
                        style="width: 100%; padding: 12px; border: 2px solid rgba(255, 140, 0, 0.3); 
                               border-radius: 8px; background: rgba(40, 40, 50, 0.9); color: #ffd700;
                               font-size: 1em; cursor: pointer;">
                    ${optionsHtml}
                </select>
            </div>
            
            <div class="custo-tecnica-box" style="background: rgba(39, 174, 96, 0.1); border: 2px solid rgba(39, 174, 96, 0.3); 
                    border-radius: 10px; padding: 20px; text-align: center; margin: 25px 0;">
                <div style="color: #95a5a6; font-size: 0.9em; margin-bottom: 8px;">Custo Total</div>
                <div id="custo-tecnica-valor" style="color: #27ae60; font-size: 2.2em; font-weight: 700;">0 pontos</div>
            </div>
            
            <div class="detalhes-pericia-descricao" style="margin: 20px 0;">
                <h4 style="color: #ffd700; margin-bottom: 10px; border-bottom: 1px solid rgba(255, 140, 0, 0.3); padding-bottom: 5px;">
                    <i class="fas fa-book-open"></i> Descrição
                </h4>
                <p style="color: #ccc; line-height: 1.5;">${tecnica.descricao || ''}</p>
            </div>
            
            ${!verificacao.passou ? `
            <div class="tecnica-indisponivel" style="margin-top: 20px; padding: 15px; background: rgba(231, 76, 60, 0.1); 
                    border-radius: 6px; border-left: 4px solid #e74c3c;">
                <div style="color: #e74c3c; font-weight: 600; margin-bottom: 5px;">
                    <i class="fas fa-exclamation-triangle"></i> Pré-requisitos não atendidos
                </div>
                <div style="color: #e67e22; font-size: 0.95em;">
                    ${verificacao.motivo}
                </div>
            </div>
            ` : ''}
        </div>
        
        <div class="modal-actions-pericia">
            <button class="btn-modal btn-cancelar" onclick="fecharModalTecnica()">
                <i class="fas fa-times"></i> Cancelar
            </button>
            <button class="btn-modal btn-confirmar" id="btn-confirmar-tecnica" onclick="confirmarTecnica()" 
                ${!verificacao.passou ? 'disabled' : ''}>
                ${jaAprendida ? '<i class="fas fa-sync-alt"></i> ' : '<i class="fas fa-plus-circle"></i> '}
                <span id="btn-texto-tecnica">${jaAprendida ? 'Atualizar' : 'Aprender'}</span>
            </button>
        </div>
    `;
    
    const select = document.getElementById('seletor-nh-tecnica');
    const custoDisplay = document.getElementById('custo-tecnica-valor');
    const btnConfirmar = document.getElementById('btn-confirmar-tecnica');
    const btnTexto = document.getElementById('btn-texto-tecnica');
    
    function atualizarCusto() {
        const selectedOption = select.options[select.selectedIndex];
        const custo = parseInt(selectedOption.dataset.custo);
        const niveis = parseInt(selectedOption.dataset.niveis);
        
        custoDisplay.textContent = `${custo} pontos`;
        
        if (jaAprendida) {
            const custoAtual = jaAprendida.custoPago || 0;
            if (niveis === jaAprendida.niveisAcimaBase) {
                btnTexto.textContent = `Manter (0 pontos)`;
                btnConfirmar.disabled = true;
            } else {
                const diferenca = custo - custoAtual;
                if (diferenca > 0) {
                    btnTexto.textContent = `Melhorar (+${diferenca} pontos)`;
                } else {
                    btnTexto.textContent = `Reduzir (${diferenca} pontos)`;
                }
                btnConfirmar.disabled = !verificacao.passou;
            }
        } else {
            btnTexto.textContent = `Aprender (${custo} pontos)`;
            btnConfirmar.disabled = !verificacao.passou || custo === 0;
        }
    }
    
    select.addEventListener('change', atualizarCusto);
    atualizarCusto();
    
    modalOverlay.style.display = 'block';
    window.tecnicaModalData = { tecnica, jaAprendida, tecnicaCatalogo };
}

function confirmarTecnica() {
    if (!window.tecnicaModalData) return;
    
    const { tecnica, jaAprendida } = window.tecnicaModalData;
    const select = document.getElementById('seletor-nh-tecnica');
    if (!select) return;
    
    const nhEscolhido = parseInt(select.value);
    const selectedOption = select.options[select.selectedIndex];
    const niveisAcima = parseInt(selectedOption.dataset.niveis);
    const custo = parseInt(selectedOption.dataset.custo);
    
    if (jaAprendida && niveisAcima === jaAprendida.niveisAcimaBase) {
        fecharModalTecnica();
        return;
    }
    
    if (jaAprendida) {
        const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnica.id);
        if (index >= 0) {
            estadoTecnicas.tecnicasAprendidas[index] = {
                ...estadoTecnicas.tecnicasAprendidas[index],
                niveisAcimaBase: niveisAcima,
                custoPago: custo,
                dataAtualizacao: new Date().toISOString()
            };
        }
    } else {
        estadoTecnicas.tecnicasAprendidas.push({
            id: tecnica.id,
            nome: tecnica.nome,
            descricao: tecnica.descricao,
            dificuldade: tecnica.dificuldade,
            preRequisitos: tecnica.preRequisitos,
            niveisAcimaBase: niveisAcima,
            custoPago: custo,
            dataAprendizado: new Date().toISOString()
        });
    }
    
    fecharModalTecnica();
    salvarTecnicas();
    renderizarStatusTecnicas();
    renderizarTecnicasAprendidas();
    atualizarTecnicasDisponiveis();
}

function fecharModalTecnica() {
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) modalOverlay.style.display = 'none';
    window.tecnicaModalData = null;
}

// ===== PERSISTÊNCIA =====
function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
    } catch (e) {}
}

function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
        }
    } catch (e) {
        estadoTecnicas.tecnicasAprendidas = [];
    }
}

// ===== CONFIGURAÇÃO =====
function configurarEventListeners() {
    document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const novoFiltro = this.dataset.filtro;
            if (novoFiltro !== estadoTecnicas.filtroAtivo) {
                estadoTecnicas.filtroAtivo = novoFiltro;
                renderizarFiltros();
                renderizarCatalogoTecnicas();
            }
        });
    });
    
    const buscaInput = document.getElementById('busca-tecnicas');
    if (buscaInput) {
        let timeout;
        buscaInput.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                estadoTecnicas.buscaAtiva = buscaInput.value;
                renderizarCatalogoTecnicas();
            }, 300);
        });
    }
    
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) fecharModalTecnica();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay.style.display === 'block') {
                fecharModalTecnica();
            }
        });
    }
}

function renderizarFiltros() {
    document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filtro === estadoTecnicas.filtroAtivo);
    });
}

// ===== INICIALIZAÇÃO =====
function inicializarSistemaTecnicas() {
    carregarTecnicas();
    configurarEventListeners();
    atualizarTecnicasDisponiveis();
    renderizarStatusTecnicas();
    renderizarFiltros();
    renderizarTecnicasAprendidas();
}

// ===== INTEGRAÇÃO COM PERÍCIAS =====
window.atualizarTecnicasAoAprenderPericia = function() {
    setTimeout(atualizarTecnicasDisponiveis, 100);
};

window.removerTecnicasAoRemoverPericia = function(idPericiaRemovida) {
    const paraRemover = estadoTecnicas.tecnicasAprendidas.filter(tecnica => {
        const cat = window.catalogoTecnicas.buscarTecnicaPorId(tecnica.id);
        if (!cat) return false;
        
        // Remove se depende da perícia removida
        if (cat.baseCalculo?.idPericia === idPericiaRemovida) return true;
        if (cat.limiteMaximo?.idPericia === idPericiaRemovida) return true;
        if (cat.preRequisitos?.some(p => p.idPericia === idPericiaRemovida)) return true;
        if (cat.preRequisitos?.some(p => p.verificarCavalgar) && 
            (idPericiaRemovida === 'grupo-cavalgar' || idPericiaRemovida.startsWith('cavalgar-'))) {
            return true;
        }
        return false;
    }).map(t => t.id);
    
    if (paraRemover.length > 0) {
        estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => !paraRemover.includes(t.id));
        salvarTecnicas();
        renderizarStatusTecnicas();
        renderizarTecnicasAprendidas();
        atualizarTecnicasDisponiveis();
    }
};

// ===== EXPORT =====
window.fecharModalTecnica = fecharModalTecnica;
window.confirmarTecnica = confirmarTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;
window.atualizarTecnicasDisponiveis = atualizarTecnicasDisponiveis;

// ===== AUTO-INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const abaPericias = document.getElementById('pericias');
        if (abaPericias) {
            const observer = new MutationObserver(() => {
                if (window.getComputedStyle(abaPericias).display !== 'none' && !window.tecnicasIniciadas) {
                    window.tecnicasIniciadas = true;
                    inicializarSistemaTecnicas();
                }
            });
            observer.observe(abaPericias, { attributes: true, attributeFilter: ['style'] });
            
            if (window.getComputedStyle(abaPericias).display !== 'none') {
                window.tecnicasIniciadas = true;
                inicializarSistemaTecnicas();
            }
        }
    }, 1000);
});

// ===== ESTILOS =====
(function() {
    if (document.getElementById('estilos-tecnicas')) return;
    const style = document.createElement('style');
    style.id = 'estilos-tecnicas';
    style.textContent = `
        .dificuldade-dificil-tecnica {
            background: rgba(231, 76, 60, 0.9) !important;
            border-color: rgba(231, 76, 60, 0.3) !important;
        }
        .dificuldade-medio-tecnica {
            background: rgba(241, 196, 15, 0.9) !important;
            border-color: rgba(241, 196, 15, 0.3) !important;
        }
    `;
    document.head.appendChild(style);
})();
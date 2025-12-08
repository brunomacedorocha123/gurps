// ===== SISTEMA DE TÉCNICAS - VERSÃO COMPLETA =====
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
    modalAberto: false
};

// ===== TABELA DE CUSTO =====
function calcularCustoTecnica(niveisAcima, dificuldade) {
    if (niveisAcima <= 0) return 0;
    
    if (dificuldade === 'Difícil') {
        if (niveisAcima === 1) return 2;
        if (niveisAcima === 2) return 3;
        if (niveisAcima === 3) return 4;
        if (niveisAcima === 4) return 5;
        return 5 + (niveisAcima - 4);
    }
    
    if (dificuldade === 'Média') {
        if (niveisAcima <= 4) return niveisAcima;
        return 4 + (niveisAcima - 4);
    }
    
    return 0;
}

// ===== OBTER NH REAL DA PERÍCIA =====
function obterNHPericiaPorId(idPericia) {
    // 1. Buscar a perícia no sistema
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const pericia = window.estadoPericias.periciasAprendidas.find(p => p.id === idPericia);
        
        if (pericia) {
            // 2. Obter valor do atributo
            let valorAtributo = 10;
            
            if (window.obterDadosAtributos) {
                const dadosAtributos = window.obterDadosAtributos();
                if (dadosAtributos) {
                    switch(pericia.atributo) {
                        case 'DX': valorAtributo = dadosAtributos.DX || 10; break;
                        case 'IQ': valorAtributo = dadosAtributos.IQ || 10; break;
                        case 'HT': valorAtributo = dadosAtributos.HT || 10; break;
                        case 'PERC': 
                            const iq = dadosAtributos.IQ || 10;
                            const bonusPercepcao = dadosAtributos.Bonus?.Percepcao || 0;
                            valorAtributo = iq + bonusPercepcao;
                            break;
                        default: valorAtributo = 10;
                    }
                }
            }
            
            // 3. Calcular NH REAL: Atributo + Nível
            const nivelPericia = parseInt(pericia.nivel) || 0;
            const nhReal = valorAtributo + nivelPericia;
            
            return nhReal;
        }
    }
    
    // Fallback se não encontrar
    return 10;
}

// ===== VERIFICAR PRÉ-REQUISITOS =====
function verificarPreRequisitosTecnica(tecnica) {
    if (!tecnica || !tecnica.preRequisitos) {
        return { passou: true, motivo: '' };
    }
    
    for (const prereq of tecnica.preRequisitos) {
        if (prereq.idPericia === "arco") {
            const nhArco = obterNHPericiaPorId("arco");
            if (nhArco < (prereq.nivelMinimo || 0)) {
                return { 
                    passou: false, 
                    motivo: `Arco precisa NH ${prereq.nivelMinimo} (tem ${nhArco})` 
                };
            }
        }
        
        if (prereq.idsCavalgar) {
            let temCavalgar = false;
            for (const idCavalgar of prereq.idsCavalgar) {
                const pericia = window.estadoPericias?.periciasAprendidas?.find(p => p.id === idCavalgar);
                if (pericia) {
                    temCavalgar = true;
                    break;
                }
            }
            
            if (!temCavalgar) {
                return { passou: false, motivo: "Falta perícia de Cavalgar" };
            }
        }
    }
    
    return { passou: true, motivo: '' };
}

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
    if (!window.catalogoTecnicas) return;
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    const disponiveis = [];
    
    todasTecnicas.forEach(tecnica => {
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        
        // CALCULAR NH BASE CORRETO
        let nhBase = 0;
        if (tecnica.baseCalculo && tecnica.baseCalculo.idPericia) {
            const nhPericia = obterNHPericiaPorId(tecnica.baseCalculo.idPericia);
            const redutor = parseInt(tecnica.baseCalculo.redutor) || 0;
            nhBase = nhPericia + redutor;
            
            if (jaAprendida) {
                const niveisAcima = parseInt(jaAprendida.niveisAcimaBase) || 0;
                nhBase += niveisAcima;
            }
        } else {
            nhBase = 10;
        }
        
        // Verificar limite máximo
        let limiteMaximo = Infinity;
        if (tecnica.limiteMaximo && tecnica.limiteMaximo.tipo === "pericia") {
            limiteMaximo = obterNHPericiaPorId(tecnica.limiteMaximo.idPericia);
            if (nhBase > limiteMaximo) nhBase = limiteMaximo;
        }
        
        disponiveis.push({
            ...tecnica,
            disponivel: verificacao.passou,
            nhAtual: nhBase,
            limiteMaximo: limiteMaximo,
            custoAtual: jaAprendida ? (parseInt(jaAprendida.custoPago) || 0) : 0,
            jaAprendida: !!jaAprendida,
            motivoIndisponivel: verificacao.motivo,
            dadosJaAprendida: jaAprendida || null
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
    
    if (estadoTecnicas.buscaAtiva.trim() !== '') {
        const termo = estadoTecnicas.buscaAtiva.toLowerCase();
        tecnicasFiltradas = tecnicasFiltradas.filter(t => 
            t.nome.toLowerCase().includes(termo) ||
            (t.descricao && t.descricao.toLowerCase().includes(termo))
        );
    }
    
    if (tecnicasFiltradas.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #95a5a6;">
                <i class="fas fa-search" style="font-size: 2em; margin-bottom: 15px; color: #ff8c00;"></i>
                <div>Nenhuma técnica encontrada</div>
                <small>${estadoTecnicas.buscaAtiva ? 'Tente com outros termos' : 'Aprenda as perícias necessárias'}</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    tecnicasFiltradas.forEach(tecnica => {
        const disponivel = tecnica.disponivel;
        const jaAprendida = tecnica.jaAprendida;
        const dificuldadeCor = tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12';
        
        html += `
            <div class="pericia-item" 
                 data-id="${tecnica.id}"
                 data-disponivel="${disponivel}"
                 style="cursor: ${disponivel ? 'pointer' : 'not-allowed'};
                        opacity: ${disponivel ? '1' : '0.7'};
                        border-left: 4px solid ${dificuldadeCor};
                        background: ${jaAprendida ? 'rgba(39, 174, 96, 0.1)' : 'rgba(50, 50, 65, 0.9)'};
                        border: 1px solid ${jaAprendida ? 'rgba(39, 174, 96, 0.3)' : 'rgba(255, 140, 0, 0.3)'};
                        border-radius: 8px;
                        padding: 15px;
                        margin-bottom: 12px;
                        transition: all 0.3s ease;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <div>
                        <h4 style="margin: 0; color: #ffd700; font-size: 16px;">
                            ${tecnica.nome}
                            ${jaAprendida ? '<span style="color: #27ae60; margin-left: 8px;">✓</span>' : ''}
                        </h4>
                        <div style="font-size: 12px; color: #95a5a6; margin-top: 3px;">
                            Base: ${tecnica.baseCalculo?.idPericia || 'Perícia'} 
                            ${tecnica.baseCalculo?.redutor >= 0 ? '+' : ''}${tecnica.baseCalculo?.redutor || 0}
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <span style="background: ${dificuldadeCor}; 
                              color: white; padding: 4px 10px; border-radius: 12px; 
                              font-size: 12px; font-weight: 600;">
                            ${tecnica.dificuldade}
                        </span>
                        <span style="background: #3498db; color: white; padding: 4px 10px; 
                              border-radius: 12px; font-size: 12px; font-weight: 600;">
                            NH ${tecnica.nhAtual}
                        </span>
                    </div>
                </div>
                
                <p style="color: #ccc; font-size: 13px; line-height: 1.4; margin: 8px 0;">
                    ${tecnica.descricao}
                </p>
                
                ${!disponivel ? `
                <div style="background: rgba(231, 76, 60, 0.1); padding: 8px; border-radius: 5px;
                          margin-top: 8px; border-left: 3px solid #e74c3c;">
                    <i class="fas fa-lock" style="color: #e74c3c; margin-right: 5px;"></i>
                    <span style="color: #e74c3c; font-size: 12px;">${tecnica.motivoIndisponivel}</span>
                </div>
                ` : `
                <div style="display: flex; justify-content: space-between; align-items: center; 
                          margin-top: 10px; font-size: 12px; color: #95a5a6;">
                    <div>
                        <i class="fas fa-bullseye" style="margin-right: 5px;"></i>
                        ${jaAprendida ? 'Clique para editar' : 'Clique para aprender'}
                    </div>
                    <div>
                        ${tecnica.limiteMaximo !== Infinity ? 
                          `<i class="fas fa-chart-line" style="margin-right: 5px;"></i>
                           Máx: NH ${tecnica.limiteMaximo}` : ''}
                    </div>
                </div>
                `}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    container.querySelectorAll('.pericia-item[data-disponivel="true"]').forEach(item => {
        item.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
            if (tecnica) {
                abrirModalTecnica(tecnica);
            }
        });
    });
}

// ===== RENDERIZAR TÉCNICAS APRENDIDAS =====
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    if (estadoTecnicas.tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #95a5a6; font-style: italic;">
                <i class="fas fa-tools" style="font-size: 2em; margin-bottom: 15px; color: #ff8c00;"></i>
                <div>Nenhuma técnica aprendida</div>
                <small>As técnicas que você aprender aparecerão aqui</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(tecnica.id);
        
        // Calcular NH atual
        let nhAtual = 0;
        if (tecnicaCatalogo && tecnicaCatalogo.baseCalculo && tecnicaCatalogo.baseCalculo.idPericia) {
            const nhPericia = obterNHPericiaPorId(tecnicaCatalogo.baseCalculo.idPericia);
            const redutor = parseInt(tecnicaCatalogo.baseCalculo.redutor) || 0;
            const niveisAcima = parseInt(tecnica.niveisAcimaBase) || 0;
            nhAtual = nhPericia + redutor + niveisAcima;
            
            // Aplicar limite
            if (tecnicaCatalogo.limiteMaximo && tecnicaCatalogo.limiteMaximo.tipo === "pericia") {
                const limite = obterNHPericiaPorId(tecnicaCatalogo.limiteMaximo.idPericia);
                if (nhAtual > limite) nhAtual = limite;
            }
        }
        
        const dificuldadeCor = tecnica.dificuldade === 'Difícil' ? '#e74c3c' : '#f39c12';
        
        html += `
            <div style="background: rgba(155, 89, 182, 0.05); 
                        border-left: 4px solid ${dificuldadeCor};
                        border: 1px solid rgba(155, 89, 182, 0.3);
                        border-radius: 8px;
                        padding: 15px;
                        margin-bottom: 12px;
                        position: relative;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; 
                          margin-bottom: 10px; padding-right: 40px;">
                    <div>
                        <h4 style="margin: 0; color: #ffd700; font-size: 16px;">${tecnica.nome}</h4>
                        <div style="font-size: 12px; color: #95a5a6; margin-top: 3px;">
                            ${tecnicaCatalogo?.baseCalculo?.idPericia || 'Base'} 
                            ${tecnicaCatalogo?.baseCalculo?.redutor >= 0 ? '+' : ''}${tecnicaCatalogo?.baseCalculo?.redutor || 0}
                            + ${tecnica.niveisAcimaBase || 0} níveis
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <span style="background: #3498db; color: white; padding: 4px 10px; 
                              border-radius: 12px; font-size: 12px; font-weight: 600;">
                            NH ${nhAtual}
                        </span>
                        <span style="background: ${dificuldadeCor}; color: white; padding: 4px 10px; 
                              border-radius: 12px; font-size: 12px; font-weight: 600;">
                            ${tecnica.dificuldade}
                        </span>
                        <span style="background: #27ae60; color: white; padding: 4px 10px; 
                              border-radius: 12px; font-size: 12px; font-weight: 600;">
                            ${tecnica.custoPago} pts
                        </span>
                    </div>
                </div>
                
                <div style="font-size: 12px; color: #95a5a6; margin-top: 8px;">
                    ${tecnica.descricao || ''}
                </div>
                
                <button onclick="removerTecnica('${tecnica.id}')" 
                        style="position: absolute; top: 15px; right: 15px; 
                               background: #e74c3c; color: white; border: none;
                               border-radius: 50%; width: 30px; height: 30px;
                               cursor: pointer; display: flex; align-items: center;
                               justify-content: center; font-size: 14px;"
                        title="Remover técnica">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ===== ABRIR MODAL =====
function abrirModalTecnica(tecnica) {
    if (estadoTecnicas.modalAberto) return;
    
    estadoTecnicas.modalAberto = true;
    
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    const modal = document.querySelector('.modal-tecnica');
    
    if (!modalOverlay || !modal) {
        estadoTecnicas.modalAberto = false;
        return;
    }
    
    const jaAprendida = tecnica.dadosJaAprendida || estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    
    // CALCULAR VALORES CORRETOS
    let nhBase = 0;
    if (tecnica.baseCalculo && tecnica.baseCalculo.idPericia) {
        const nhPericia = obterNHPericiaPorId(tecnica.baseCalculo.idPericia);
        const redutor = parseInt(tecnica.baseCalculo.redutor) || 0;
        nhBase = nhPericia + redutor;
    }
    
    const niveisAtuais = jaAprendida ? (parseInt(jaAprendida.niveisAcimaBase) || 0) : 0;
    const nhAtual = nhBase + niveisAtuais;
    
    let nhMaximo = Infinity;
    if (tecnica.limiteMaximo) {
        if (tecnica.limiteMaximo.tipo === "pericia") {
            nhMaximo = obterNHPericiaPorId(tecnica.limiteMaximo.idPericia);
        }
    }
    
    nhMaximo = Math.max(nhMaximo, nhBase);
    
    // Criar opções
    let opcoesNH = '';
    for (let nh = nhBase; nh <= nhMaximo; nh++) {
        const niveisAcima = nh - nhBase;
        const custo = calcularCustoTecnica(niveisAcima, tecnica.dificuldade);
        const selecionado = nh === nhAtual ? 'selected' : '';
        
        opcoesNH += `
            <option value="${nh}" data-niveis="${niveisAcima}" data-custo="${custo}" ${selecionado}>
                NH ${nh} (${custo} pontos)${nh === nhBase ? ' - Base' : ''}
            </option>
        `;
    }
    
    modal.innerHTML = `
        <div style="background: #2c3e50; color: white; padding: 20px; border-radius: 8px 8px 0 0; position: relative;">
            <span onclick="fecharModalTecnica()" 
                  style="position: absolute; right: 20px; top: 20px; font-size: 28px; 
                         cursor: pointer; color: #ffd700; font-weight: bold;">
                &times;
            </span>
            <h3 style="margin: 0; color: #ffd700; padding-right: 30px;">${tecnica.nome}</h3>
            <div style="color: #95a5a6; margin-top: 5px;">
                ${tecnica.dificuldade} • Base: ${tecnica.baseCalculo?.idPericia || 'Perícia'} 
                ${tecnica.baseCalculo?.redutor >= 0 ? '+' : ''}${tecnica.baseCalculo?.redutor || 0}
            </div>
        </div>
        
        <div style="padding: 20px; background: #1e1e28; color: #ccc; max-height: 60vh; overflow-y: auto;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px;">
                <div style="text-align: center; padding: 15px; background: rgba(52, 152, 219, 0.1); 
                          border-radius: 8px;">
                    <div style="font-size: 11px; color: #95a5a6; margin-bottom: 5px;">BASE</div>
                    <div style="font-size: 28px; font-weight: bold; color: #3498db;">${nhBase}</div>
                    <div style="font-size: 11px; color: #95a5a6; margin-top: 5px;">
                        ${tecnica.baseCalculo?.idPericia || ''} 
                        ${tecnica.baseCalculo?.redutor >= 0 ? '+' : ''}${tecnica.baseCalculo?.redutor || 0}
                    </div>
                </div>
                
                <div style="text-align: center; padding: 15px; background: rgba(39, 174, 96, 0.1); 
                          border-radius: 8px;">
                    <div style="font-size: 11px; color: #95a5a6; margin-bottom: 5px;">MÁXIMO</div>
                    <div style="font-size: 28px; font-weight: bold; color: #27ae60;">${nhMaximo}</div>
                    <div style="font-size: 11px; color: #95a5a6; margin-top: 5px;">
                        ${tecnica.limiteMaximo ? `Limite: ${tecnica.limiteMaximo.idPericia || 'fixo'}` : 'Sem limite'}
                    </div>
                </div>
                
                <div style="text-align: center; padding: 15px; background: rgba(243, 156, 18, 0.1); 
                          border-radius: 8px;">
                    <div style="font-size: 11px; color: #95a5a6; margin-bottom: 5px;">ATUAL</div>
                    <div style="font-size: 28px; font-weight: bold; color: #f39c12;">${nhAtual}</div>
                    <div style="font-size: 11px; color: #95a5a6; margin-top: 5px;">
                        Base + ${niveisAtuais} níveis
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 10px; color: #ffd700; font-weight: bold; font-size: 14px;">
                    Selecione o NH desejado:
                </label>
                <select id="select-nh-tecnica-modal" 
                        style="width: 100%; padding: 14px; border-radius: 8px; border: 2px solid #ff8c00;
                               background: #2c3e50; color: #ffd700; font-size: 16px; cursor: pointer;
                               font-weight: 600;">
                    ${opcoesNH}
                </select>
            </div>
            
            <div style="background: rgba(39, 174, 96, 0.1); padding: 20px; border-radius: 8px; 
                      border-left: 4px solid #27ae60; margin-bottom: 25px;">
                <div style="font-size: 12px; color: #95a5a6; margin-bottom: 5px;">CUSTO TOTAL</div>
                <div id="custo-tecnica-modal" style="font-size: 32px; font-weight: bold; color: #27ae60;">
                    ${jaAprendida ? jaAprendida.custoPago || 0 : 0} pontos
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h4 style="color: #ffd700; margin-bottom: 10px; font-size: 16px;">Descrição</h4>
                <p style="line-height: 1.6; color: #ccc; font-size: 14px;">${tecnica.descricao}</p>
            </div>
        </div>
        
        <div style="padding: 20px; background: #2c3e50; border-radius: 0 0 8px 8px; 
                  display: flex; gap: 12px; justify-content: flex-end;">
            <button onclick="fecharModalTecnica()" 
                    style="padding: 12px 24px; background: rgba(255, 255, 255, 0.1); 
                           color: #ffd700; border: 1px solid rgba(255, 140, 0, 0.3);
                           border-radius: 6px; cursor: pointer; font-weight: 600;">
                Cancelar
            </button>
            <button onclick="confirmarTecnica('${tecnica.id}')" 
                    id="btn-confirmar-tecnica-modal"
                    style="padding: 12px 24px; background: linear-gradient(45deg, #ff8c00, #ffd700); 
                           color: #1e1e28; border: none; border-radius: 6px; font-weight: bold; 
                           cursor: pointer;">
                ${jaAprendida ? 'Atualizar' : 'Aprender'}
            </button>
        </div>
    `;
    
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    const selectNH = document.getElementById('select-nh-tecnica-modal');
    const custoDisplay = document.getElementById('custo-tecnica-modal');
    const btnConfirmar = document.getElementById('btn-confirmar-tecnica-modal');
    
    function atualizarDisplayCusto() {
        if (!selectNH || !custoDisplay || !btnConfirmar) return;
        
        const opcao = selectNH.options[selectNH.selectedIndex];
        const custo = parseInt(opcao.getAttribute('data-custo'));
        const niveis = parseInt(opcao.getAttribute('data-niveis'));
        
        custoDisplay.textContent = `${custo} pontos`;
        
        if (jaAprendida && niveis === niveisAtuais) {
            btnConfirmar.textContent = 'Manter (0 pontos)';
            btnConfirmar.style.background = 'rgba(255, 255, 255, 0.1)';
            btnConfirmar.style.color = '#95a5a6';
            btnConfirmar.style.cursor = 'not-allowed';
            btnConfirmar.disabled = true;
        } else {
            const diferenca = custo - (jaAprendida?.custoPago || 0);
            if (jaAprendida) {
                if (diferenca > 0) {
                    btnConfirmar.textContent = `Melhorar (+${diferenca} pts)`;
                } else if (diferenca < 0) {
                    btnConfirmar.textContent = `Reduzir (${diferenca} pts)`;
                } else {
                    btnConfirmar.textContent = 'Atualizar';
                }
            } else {
                btnConfirmar.textContent = `Aprender (${custo} pts)`;
            }
            
            btnConfirmar.style.background = 'linear-gradient(45deg, #ff8c00, #ffd700)';
            btnConfirmar.style.color = '#1e1e28';
            btnConfirmar.style.cursor = 'pointer';
            btnConfirmar.disabled = false;
        }
    }
    
    if (selectNH) {
        selectNH.addEventListener('change', atualizarDisplayCusto);
        atualizarDisplayCusto();
    }
    
    window.tecnicaModalAtual = {
        tecnica: tecnica,
        jaAprendida: jaAprendida,
        nhBase: nhBase,
        nhMaximo: nhMaximo
    };
}

// ===== CONFIRMAR TÉCNICA =====
function confirmarTecnica(id) {
    if (!window.tecnicaModalAtual) return;
    
    const { tecnica, jaAprendida } = window.tecnicaModalAtual;
    const select = document.getElementById('select-nh-tecnica-modal');
    
    if (!select) return;
    
    const opcao = select.options[select.selectedIndex];
    const nhEscolhido = parseInt(select.value);
    const niveisAcima = parseInt(opcao.getAttribute('data-niveis'));
    const custo = parseInt(opcao.getAttribute('data-custo'));
    
    if (jaAprendida && niveisAcima === (parseInt(jaAprendida.niveisAcimaBase) || 0)) {
        fecharModalTecnica();
        return;
    }
    
    const tecnicaAtualizada = {
        id: tecnica.id,
        nome: tecnica.nome,
        descricao: tecnica.descricao,
        dificuldade: tecnica.dificuldade,
        baseCalculo: tecnica.baseCalculo,
        limiteMaximo: tecnica.limiteMaximo,
        preRequisitos: tecnica.preRequisitos,
        niveisAcimaBase: niveisAcima,
        custoPago: custo
    };
    
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === id);
    if (index >= 0) {
        estadoTecnicas.tecnicasAprendidas[index] = tecnicaAtualizada;
    } else {
        estadoTecnicas.tecnicasAprendidas.push(tecnicaAtualizada);
    }
    
    localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
    
    renderizarStatusTecnicas();
    renderizarTecnicasAprendidas();
    atualizarTecnicasDisponiveis();
    
    if (typeof window.atualizarPontosTotais === 'function') {
        window.atualizarPontosTotais();
    }
    
    fecharModalTecnica();
}

// ===== REMOVER TÉCNICA =====
function removerTecnica(id) {
    if (confirm('Remover esta técnica? Os pontos serão perdidos.')) {
        estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
        renderizarStatusTecnicas();
        renderizarTecnicasAprendidas();
        atualizarTecnicasDisponiveis();
    }
}

// ===== FECHAR MODAL =====
function fecharModalTecnica() {
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
    
    document.body.style.overflow = '';
    estadoTecnicas.modalAberto = false;
    delete window.tecnicaModalAtual;
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

// ===== CONFIGURAR EVENTOS =====
function configurarEventListenersTecnicas() {
    document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const filtro = this.getAttribute('data-filtro');
            estadoTecnicas.filtroAtivo = filtro;
            
            document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            renderizarCatalogoTecnicas();
        });
    });
    
    const buscaInput = document.getElementById('busca-tecnicas');
    if (buscaInput) {
        buscaInput.addEventListener('input', function() {
            estadoTecnicas.buscaAtiva = this.value;
            renderizarCatalogoTecnicas();
        });
    }
    
    document.querySelector('.modal-tecnica-overlay')?.addEventListener('click', function(e) {
        if (e.target === this) {
            fecharModalTecnica();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && estadoTecnicas.modalAberto) {
            fecharModalTecnica();
        }
    });
}

// ===== INICIALIZAR SISTEMA =====
function inicializarSistemaTecnicas() {
    const salvo = localStorage.getItem('tecnicasAprendidas');
    if (salvo) {
        try {
            estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
        } catch (e) {}
    }
    
    configurarEventListenersTecnicas();
    
    atualizarTecnicasDisponiveis();
    renderizarStatusTecnicas();
    renderizarTecnicasAprendidas();
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const abaPericias = document.getElementById('pericias');
        if (abaPericias) {
            if (abaPericias.style.display !== 'none') {
                setTimeout(inicializarSistemaTecnicas, 300);
            }
            
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (abaPericias.style.display !== 'none') {
                            setTimeout(inicializarSistemaTecnicas, 300);
                        } else {
                            fecharModalTecnica();
                        }
                    }
                });
            });
            
            observer.observe(abaPericias, { attributes: true, attributeFilter: ['style'] });
        }
    }, 1000);
});

// ===== EXPORTAR FUNÇÕES =====
window.fecharModalTecnica = fecharModalTecnica;
window.confirmarTecnica = confirmarTecnica;
window.removerTecnica = removerTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

console.log("✅ Sistema de técnicas carregado");
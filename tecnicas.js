// ===== SISTEMA DE TÉCNICAS =====

// Estado das técnicas
let estadoTecnicas = {
    tecnicasAprendidas: [],
    pontosTecnicasMedio: 0,
    pontosTecnicasDificil: 0,
    totalTecnicasMedio: 0,
    totalTecnicasDificil: 0,
    modalTecnicaAtiva: null,
    nivelTecnica: 0,
    buscaTecnicasAtiva: '',
    filtroTecnicasAtivo: 'todas-tecnicas'
};

// ===== FUNÇÃO: CALCULAR CUSTO DA TÉCNICA =====
function calcularCustoTecnica(dificuldade, nivel) {
    if (nivel < 0) nivel = 0;
    
    if (dificuldade === "Média") {
        // Média: +1 = 1 ponto, +2 = 2 pontos...
        return nivel; // nível 0 = 0, nível 1 = 1, nível 2 = 2
    } else if (dificuldade === "Difícil") {
        // Difícil: +1 = 2 pontos, +2 = 3 pontos...
        if (nivel === 0) return 0;
        return nivel + 1; // nível 1 = 2, nível 2 = 3, nível 3 = 4
    }
    
    return nivel; // padrão
}

// ===== FUNÇÃO: OBTER NÍVEIS DISPONÍVEIS =====
function getNiveisDisponiveisTecnica(dificuldade, tecnicaEditando = null) {
    const niveisDisponiveis = [];
    const maxNivel = 10; // Máximo de +10 na técnica
    
    if (!tecnicaEditando) {
        // Nova técnica: começa do 0
        for (let i = 0; i <= maxNivel; i++) {
            const custo = calcularCustoTecnica(dificuldade, i);
            niveisDisponiveis.push({
                nivel: i,
                custo: custo,
                texto: `+${i} (${custo} ponto${custo !== 1 ? 's' : ''})`
            });
        }
    } else {
        // Técnica existente: mostra o atual e superiores
        const nivelAtual = tecnicaEditando.nivel;
        
        // Adiciona nível atual
        const custoAtual = calcularCustoTecnica(dificuldade, nivelAtual);
        niveisDisponiveis.push({
            nivel: nivelAtual,
            custo: custoAtual,
            texto: `+${nivelAtual} (Atual)`,
            ehAtual: true
        });
        
        // Adiciona níveis superiores
        for (let i = nivelAtual + 1; i <= maxNivel; i++) {
            const custoDesejado = calcularCustoTecnica(dificuldade, i);
            const diferenca = custoDesejado - custoAtual;
            
            if (diferenca > 0) {
                niveisDisponiveis.push({
                    nivel: i,
                    custo: custoDesejado,
                    diferenca: diferenca,
                    texto: `+${i} (+${diferenca} pontos)`,
                    ehEvolucao: true
                });
            }
        }
    }
    
    return niveisDisponiveis;
}

// ===== FUNÇÃO: OBTER INFO DE EVOLUÇÃO =====
function obterInfoEvolucaoTecnica(tecnicaEditando = null, nivelDesejado, dificuldade) {
    const custoDesejado = calcularCustoTecnica(dificuldade, nivelDesejado);
    
    if (!tecnicaEditando) {
        // Nova técnica
        return {
            nivelDesejado: nivelDesejado,
            custoTotal: custoDesejado,
            custoAPagar: custoDesejado,
            ehNovaTecnica: true,
            ehEvolucao: false
        };
    }
    
    const nivelAtual = tecnicaEditando.nivel;
    const custoAtual = calcularCustoTecnica(dificuldade, nivelAtual);
    
    // Já possui esse nível ou menor
    if (nivelDesejado <= nivelAtual) {
        return {
            nivelDesejado: nivelDesejado,
            custoTotal: custoDesejado,
            custoAPagar: 0,
            investimentoAtual: custoAtual,
            ehNovaTecnica: false,
            ehEvolucao: false,
            jaPossui: true
        };
    }
    
    // Evolução
    const custoAPagar = custoDesejado - custoAtual;
    
    return {
        nivelDesejado: nivelDesejado,
        nivelAtual: nivelAtual,
        custoTotal: custoDesejado,
        custoAPagar: custoAPagar,
        investimentoAtual: custoAtual,
        ehNovaTecnica: false,
        ehEvolucao: custoAPagar > 0,
        jaPossui: false
    };
}

// ===== FUNÇÃO: VERIFICAR SE TEM CAVALGAR =====
function temCavalgar(periciasAprendidas) {
    return periciasAprendidas.some(p => {
        // IDs específicos de Cavalgar do seu catálogo
        if (p.id === "cavalgar-cavalo" || 
            p.id === "cavalgar-mula" || 
            p.id === "cavalgar-camelo" || 
            p.id === "cavalgar-dragao" || 
            p.id === "cavalgar-outro") {
            return true;
        }
        
        // Cavalgar personalizado
        if (p.id && p.id.includes("cavalgar-") && p.id !== "grupo-cavalgar") {
            return true;
        }
        
        // Por nome
        if (p.nome && p.nome.includes("Cavalgar")) {
            return true;
        }
        
        // Por grupo
        if (p.grupo === "Cavalgar") {
            return true;
        }
        
        return false;
    });
}

// ===== FUNÇÃO: RENDERIZAR CATÁLOGO DE TÉCNICAS =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
    // Obter perícias aprendidas para verificar pré-requisitos
    const periciasAprendidas = window.estadoPericias?.periciasAprendidas || [];
    const tecnicasDisponiveis = window.obterTecnicasDisponiveis ? 
        window.obterTecnicasDisponiveis(periciasAprendidas) : [];
    
    // Aplicar filtro
    let tecnicasFiltradas = tecnicasDisponiveis;
    
    if (estadoTecnicas.filtroTecnicasAtivo !== 'todas-tecnicas') {
        if (estadoTecnicas.filtroTecnicasAtivo === 'medio-tecnicas') {
            tecnicasFiltradas = tecnicasDisponiveis.filter(t => t.dificuldade === "Média");
        } else if (estadoTecnicas.filtroTecnicasAtivo === 'dificil-tecnicas') {
            tecnicasFiltradas = tecnicasDisponiveis.filter(t => t.dificuldade === "Difícil");
        }
    }
    
    // Aplicar busca
    if (estadoTecnicas.buscaTecnicasAtiva.trim() !== '') {
        const termo = estadoTecnicas.buscaTecnicasAtiva.toLowerCase();
        tecnicasFiltradas = tecnicasFiltradas.filter(t =>
            t.nome.toLowerCase().includes(termo) ||
            t.descricao.toLowerCase().includes(termo)
        );
    }
    
    // Renderizar
    if (tecnicasFiltradas.length === 0) {
        if (tecnicasDisponiveis.length === 0) {
            container.innerHTML = `
                <div class="nenhuma-pericia">
                    <i class="fas fa-info-circle"></i>
                    <div>Aprenda perícias primeiro</div>
                    <small>As técnicas aparecerão aqui quando você tiver as perícias necessárias</small>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h4>Nenhuma técnica encontrada</h4>
                    <p>Tente outro filtro ou termo de busca</p>
                </div>
            `;
        }
        return;
    }
    
    container.innerHTML = '';
    
    tecnicasFiltradas.forEach(tecnica => {
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.some(t => t.id === tecnica.id);
        
        const tecnicaElement = document.createElement('div');
        tecnicaElement.className = 'pericia-item';
        tecnicaElement.dataset.id = tecnica.id;
        
        let html = `
            <div class="pericia-header">
                <h4 class="pericia-nome">${tecnica.nome}</h4>
                <div class="pericia-info">
                    <span class="pericia-atributo">${tecnica.atributoBase}</span>
                    <span class="pericia-dificuldade dificuldade-${tecnica.dificuldade.toLowerCase()}">
                        ${tecnica.dificuldade}
                    </span>
                    <span class="pericia-custo">Pré-def: ${tecnica.predefinido}</span>
                </div>
            </div>
            <p class="pericia-descricao">${tecnica.descricao}</p>
            <div class="tecnica-prereq">
                <strong>Pré-requisito:</strong> ${tecnica.prereq}
            </div>
        `;
        
        if (jaAprendida) {
            html += `<span class="pericia-aprendida-badge">✓ Já Aprendida</span>`;
        }
        
        tecnicaElement.innerHTML = html;
        
        tecnicaElement.addEventListener('click', () => {
            abrirModalTecnica(tecnica);
        });
        
        container.appendChild(tecnicaElement);
    });
}

// ===== FUNÇÃO: RENDERIZAR TÉCNICAS APRENDIDAS =====
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    if (estadoTecnicas.tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia-aprendida">
                <i class="fas fa-tools"></i>
                <div>Nenhuma técnica aprendida</div>
                <small>As técnicas que você aprender aparecerão aqui</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        const tecnicaElement = document.createElement('div');
        tecnicaElement.className = 'pericia-aprendida-item';
        
        // Calcular NH se não tiver armazenado
        if (!tecnica.nhCalculado && tecnica.periciaBase) {
            const periciasAprendidas = window.estadoPericias?.periciasAprendidas || [];
            const periciaBase = periciasAprendidas.find(p => p.id === tecnica.periciaBase);
            
            if (periciaBase) {
                const atributoBase = window.obterAtributoAtual ? 
                    window.obterAtributoAtual(periciaBase.atributo) : 10;
                tecnica.nhBase = atributoBase + periciaBase.nivel;
                tecnica.nhCalculado = tecnica.nhBase - 4 + tecnica.nivel;
            }
        }
        
        const html = `
            <div class="pericia-aprendida-header">
                <h4 class="pericia-aprendida-nome">${tecnica.nome}</h4>
                <div class="pericia-aprendida-info">
                    <span class="pericia-aprendida-nivel">+${tecnica.nivel}</span>
                    <span class="pericia-aprendida-custo">${tecnica.custo} pts</span>
                </div>
            </div>
            ${tecnica.nhCalculado ? `
            <div class="tecnica-detalhes-aprendida">
                <small>NH: ${tecnica.nhBase} -4 + ${tecnica.nivel} = ${tecnica.nhCalculado}</small>
            </div>
            ` : ''}
            <button class="btn-remover-pericia" data-id="${tecnica.id}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        tecnicaElement.innerHTML = html;
        
        const btnRemover = tecnicaElement.querySelector('.btn-remover-pericia');
        btnRemover.addEventListener('click', (e) => {
            e.stopPropagation();
            removerTecnica(tecnica.id);
        });
        
        tecnicaElement.addEventListener('click', () => {
            const tecnicaOriginal = window.buscarTecnicaPorId ? 
                window.buscarTecnicaPorId(tecnica.id) : null;
            
            if (tecnicaOriginal) {
                abrirModalTecnica(tecnicaOriginal, tecnica);
            }
        });
        
        container.appendChild(tecnicaElement);
    });
}

// ===== FUNÇÃO: ATUALIZAR ESTATÍSTICAS TÉCNICAS =====
function atualizarEstatisticasTecnicas() {
    estadoTecnicas.pontosTecnicasMedio = 0;
    estadoTecnicas.pontosTecnicasDificil = 0;
    estadoTecnicas.totalTecnicasMedio = 0;
    estadoTecnicas.totalTecnicasDificil = 0;
    
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        if (tecnica.dificuldade === "Média") {
            estadoTecnicas.pontosTecnicasMedio += tecnica.custo;
            estadoTecnicas.totalTecnicasMedio++;
        } else if (tecnica.dificuldade === "Difícil") {
            estadoTecnicas.pontosTecnicasDificil += tecnica.custo;
            estadoTecnicas.totalTecnicasDificil++;
        }
    });
    
    // Atualizar cards
    document.getElementById('qtd-tecnicas-medio').textContent = estadoTecnicas.totalTecnicasMedio;
    document.getElementById('pts-tecnicas-medio').textContent = `(${estadoTecnicas.pontosTecnicasMedio} pts)`;
    
    document.getElementById('qtd-tecnicas-dificil').textContent = estadoTecnicas.totalTecnicasDificil;
    document.getElementById('pts-tecnicas-dificil').textContent = `(${estadoTecnicas.pontosTecnicasDificil} pts)`;
    
    const totalQtd = estadoTecnicas.totalTecnicasMedio + estadoTecnicas.totalTecnicasDificil;
    const totalPontos = estadoTecnicas.pontosTecnicasMedio + estadoTecnicas.pontosTecnicasDificil;
    
    document.getElementById('qtd-tecnicas-total').textContent = totalQtd;
    document.getElementById('pts-tecnicas-total').textContent = `(${totalPontos} pts)`;
    
    // Badge lateral
    const badge = document.getElementById('pontos-tecnicas-total');
    if (badge) {
        badge.textContent = `[${totalPontos} pts]`;
    }
}

// ===== FUNÇÃO: ABRIR MODAL TÉCNICA =====
function abrirModalTecnica(tecnica, tecnicaEditando = null) {
    estadoTecnicas.modalTecnicaAtiva = tecnica;
    
    // Encontra a técnica existente se não foi passada
    if (!tecnicaEditando) {
        tecnicaEditando = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    }
    
    // Nível inicial
    let nivelInicial = 0;
    if (tecnicaEditando) {
        nivelInicial = tecnicaEditando.nivel;
    }
    
    estadoTecnicas.nivelTecnica = nivelInicial;
    
    const modalContent = document.querySelector('.modal-tecnica');
    if (!modalContent) return;
    
    // Obter NH da perícia base (Arco)
    let periciaBaseNH = 10; // padrão
    if (tecnica.periciaBase === "arco") {
        const periciasAprendidas = window.estadoPericias?.periciasAprendidas || [];
        const periciaArco = periciasAprendidas.find(p => p.id === "arco");
        if (periciaArco) {
            const atributoBase = window.obterAtributoAtual ? 
                window.obterAtributoAtual(periciaArco.atributo) : 10;
            periciaBaseNH = atributoBase + periciaArco.nivel;
        }
    }
    
    const nhCalculado = periciaBaseNH - 4 + estadoTecnicas.nivelTecnica;
    const niveisDisponiveis = getNiveisDisponiveisTecnica(tecnica.dificuldade, tecnicaEditando);
    
    modalContent.innerHTML = `
        <div class="modal-header-pericia">
            <span class="modal-close" onclick="fecharModalTecnica()">&times;</span>
            <h3>${tecnica.nome}</h3>
            <div class="modal-subtitulo">
                ${tecnica.atributoBase}/${tecnica.dificuldade} - ${tecnica.categoria || 'Técnica Especial'}
            </div>
        </div>
        
        <div class="modal-body-pericia">
            <div class="nivel-controle">
                <div class="nivel-info">
                    <div class="nivel-atual">
                        <label>Nível da Técnica</label>
                        <select class="nivel-select" id="nivel-tecnica-select" onchange="alterarNivelTecnicaDropdown(this.value)">
                            ${niveisDisponiveis.map(nivel => `
                                <option value="${nivel.nivel}" ${nivel.nivel === estadoTecnicas.nivelTecnica ? 'selected' : ''}>
                                    ${nivel.texto}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="custo-info">
                    <div class="custo-total">
                        <label>${tecnicaEditando ? 'Custo para Evoluir' : 'Custo para Adquirir'}</label>
                        <div id="custo-tecnica-atual">Carregando...</div>
                    </div>
                    <div class="custo-detalhes">
                        ${tecnica.dificuldade === "Difícil" ? 
                          "Difícil: +1 = 2 pts, +2 = 3 pts, +3 = 4 pts..." : 
                          "Média: +1 = 1 pt, +2 = 2 pts, +3 = 3 pts..."}
                    </div>
                </div>
                
                <div class="nh-info">
                    <div class="nh-calculado">
                        <label>NH Final (Arco Montado)</label>
                        <span id="nh-tecnica-atual">${nhCalculado}</span>
                    </div>
                    <div class="custo-detalhes" id="nh-tecnica-detalhes">
                        ${periciaBaseNH} (Arco) -4 + ${estadoTecnicas.nivelTecnica >= 0 ? '+' : ''}${estadoTecnicas.nivelTecnica}
                    </div>
                </div>
            </div>
            
            <div class="detalhes-pericia-descricao">
                <h4>Descrição</h4>
                <p>${tecnica.descricao}</p>
            </div>
            
            <div class="detalhes-pericia-default">
                <strong>Pré-definido:</strong> ${tecnica.predefinido}
            </div>
            
            <div class="detalhes-pericia-default">
                <strong>Pré-requisito:</strong> ${tecnica.prereq}
            </div>
            
            ${tecnica.limitacao ? `
            <div class="detalhes-pericia-default">
                <strong>Limitação:</strong> ${tecnica.limitacao}
            </div>
            ` : ''}
        </div>
        
        <div class="modal-actions-pericia">
            <button class="btn-modal btn-cancelar" onclick="fecharModalTecnica()">Cancelar</button>
            <button class="btn-modal btn-confirmar" id="btn-confirmar-tecnica" onclick="confirmarTecnica()" disabled>
                ${tecnicaEditando ? 'Evoluir' : 'Adquirir'}
            </button>
        </div>
    `;
    
    document.querySelector('.modal-tecnica-overlay').style.display = 'block';
    
    // Atualiza custo inicial
    setTimeout(() => {
        atualizarCustoTecnicaNoModal(tecnicaEditando);
    }, 100);
}

// ===== FUNÇÃO: ATUALIZAR CUSTO NO MODAL =====
function atualizarCustoTecnicaNoModal(tecnicaEditando) {
    if (!estadoTecnicas.modalTecnicaAtiva) return;
    
    const tecnica = estadoTecnicas.modalTecnicaAtiva;
    const nivelSelecionado = estadoTecnicas.nivelTecnica;
    
    const infoEvolucao = obterInfoEvolucaoTecnica(tecnicaEditando, nivelSelecionado, tecnica.dificuldade);
    
    if (!infoEvolucao) return;
    
    const custoElement = document.getElementById('custo-tecnica-atual');
    const btnConfirmar = document.getElementById('btn-confirmar-tecnica');
    
    if (infoEvolucao.jaPossui) {
        custoElement.innerHTML = `<span class="custo-ja-pago">Já possui este nível</span>`;
        if (btnConfirmar) {
            btnConfirmar.disabled = true;
            btnConfirmar.textContent = 'Já Possui';
        }
    } else if (infoEvolucao.ehEvolucao) {
        custoElement.innerHTML = `<span class="custo-melhoria">+${infoEvolucao.custoAPagar} pontos</span>`;
        if (btnConfirmar) {
            btnConfirmar.disabled = false;
            btnConfirmar.textContent = `Evoluir (+${infoEvolucao.custoAPagar} pontos)`;
        }
    } else if (infoEvolucao.ehNovaTecnica) {
        custoElement.innerHTML = `<span class="custo-novo">${infoEvolucao.custoAPagar} pontos</span>`;
        if (btnConfirmar) {
            btnConfirmar.disabled = false;
            btnConfirmar.textContent = `Adquirir (${infoEvolucao.custoAPagar} pontos)`;
        }
    } else {
        custoElement.innerHTML = `<span class="custo-ja-pago">Selecione um nível acima</span>`;
        if (btnConfirmar) {
            btnConfirmar.disabled = true;
            btnConfirmar.textContent = tecnicaEditando ? 'Evoluir' : 'Adquirir';
        }
    }
}

// ===== FUNÇÃO: ALTERAR NÍVEL NO DROPDOWN =====
function alterarNivelTecnicaDropdown(valorSelecionado) {
    if (!estadoTecnicas.modalTecnicaAtiva) return;
    
    const novoNivel = parseInt(valorSelecionado);
    estadoTecnicas.nivelTecnica = novoNivel;
    
    const tecnica = estadoTecnicas.modalTecnicaAtiva;
    
    // Atualizar NH calculado
    let periciaBaseNH = 10;
    if (tecnica.periciaBase === "arco") {
        const periciasAprendidas = window.estadoPericias?.periciasAprendidas || [];
        const periciaArco = periciasAprendidas.find(p => p.id === "arco");
        if (periciaArco) {
            const atributoBase = window.obterAtributoAtual ? 
                window.obterAtributoAtual(periciaArco.atributo) : 10;
            periciaBaseNH = atributoBase + periciaArco.nivel;
        }
    }
    
    const nhCalculado = periciaBaseNH - 4 + novoNivel;
    
    const nhElement = document.getElementById('nh-tecnica-atual');
    if (nhElement) {
        nhElement.textContent = nhCalculado;
    }
    
    const nhDetalhes = document.getElementById('nh-tecnica-detalhes');
    if (nhDetalhes) {
        nhDetalhes.innerHTML = `${periciaBaseNH} (Arco) -4 + ${novoNivel >= 0 ? '+' : ''}${novoNivel}`;
    }
    
    // Atualizar custo
    const tecnicaEditando = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    atualizarCustoTecnicaNoModal(tecnicaEditando);
}

// ===== FUNÇÃO: CONFIRMAR TÉCNICA =====
function confirmarTecnica() {
    if (!estadoTecnicas.modalTecnicaAtiva) return;
    
    const tecnica = estadoTecnicas.modalTecnicaAtiva;
    const nivel = estadoTecnicas.nivelTecnica;
    
    // Obtém informações da evolução
    const tecnicaEditando = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    const infoEvolucao = obterInfoEvolucaoTecnica(tecnicaEditando, nivel, tecnica.dificuldade);
    
    if (!infoEvolucao) {
        alert("Erro ao calcular evolução.");
        return;
    }
    
    // Verifica se realmente pode evoluir
    if (infoEvolucao.jaPossui) {
        alert("Você já possui este nível!");
        fecharModalTecnica();
        return;
    }
    
    if (infoEvolucao.custoAPagar <= 0) {
        alert("Não é possível evoluir para este nível.");
        return;
    }
    
    // Calcular NH da perícia base
    let periciaBaseNH = 10;
    if (tecnica.periciaBase === "arco") {
        const periciasAprendidas = window.estadoPericias?.periciasAprendidas || [];
        const periciaArco = periciasAprendidas.find(p => p.id === "arco");
        if (periciaArco) {
            const atributoBase = window.obterAtributoAtual ? 
                window.obterAtributoAtual(periciaArco.atributo) : 10;
            periciaBaseNH = atributoBase + periciaArco.nivel;
        }
    }
    
    const nhCalculado = periciaBaseNH - 4 + nivel;
    
    const indexExistente = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnica.id);
    
    if (indexExistente >= 0) {
        // EVOLUIR TÉCNICA EXISTENTE
        estadoTecnicas.tecnicasAprendidas[indexExistente] = {
            ...estadoTecnicas.tecnicasAprendidas[indexExistente],
            nivel: nivel,
            custo: infoEvolucao.custoTotal, // Custo total acumulado
            periciaBase: tecnica.periciaBase,
            nhBase: periciaBaseNH,
            nhCalculado: nhCalculado,
            dificuldade: tecnica.dificuldade
        };
    } else {
        // NOVA TÉCNICA
        const novaTecnica = {
            id: tecnica.id,
            nome: tecnica.nome,
            dificuldade: tecnica.dificuldade,
            nivel: nivel,
            custo: infoEvolucao.custoTotal,
            periciaBase: tecnica.periciaBase,
            nhBase: periciaBaseNH,
            nhCalculado: nhCalculado,
            descricao: tecnica.descricao,
            prereq: tecnica.prereq,
            predefinido: tecnica.predefinido
        };
        
        estadoTecnicas.tecnicasAprendidas.push(novaTecnica);
    }
    
    fecharModalTecnica();
    salvarTecnicas();
    atualizarEstatisticasTecnicas();
    renderizarTecnicasAprendidas();
    renderizarCatalogoTecnicas();
    
    // Disparar evento para outras partes do sistema
    const evento = new CustomEvent('tecnicasAlteradas', {
        detail: { tecnicas: estadoTecnicas.tecnicasAprendidas }
    });
    document.dispatchEvent(evento);
}

// ===== FUNÇÃO: REMOVER TÉCNICA =====
function removerTecnica(idTecnica) {
    if (confirm('Tem certeza que deseja remover esta técnica?')) {
        estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== idTecnica);
        salvarTecnicas();
        atualizarEstatisticasTecnicas();
        renderizarTecnicasAprendidas();
        renderizarCatalogoTecnicas();
        
        // Disparar evento
        const evento = new CustomEvent('tecnicasAlteradas', {
            detail: { tecnicas: estadoTecnicas.tecnicasAprendidas }
        });
        document.dispatchEvent(evento);
    }
}

// ===== FUNÇÃO: FECHAR MODAL TÉCNICA =====
function fecharModalTecnica() {
    document.querySelector('.modal-tecnica-overlay').style.display = 'none';
    estadoTecnicas.modalTecnicaAtiva = null;
    estadoTecnicas.nivelTecnica = 0;
}

// ===== FUNÇÕES DE PERSISTÊNCIA =====
function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
    } catch (e) {
        console.error('Erro ao salvar técnicas:', e);
    }
}

function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
        }
    } catch (e) {
        console.error('Erro ao carregar técnicas:', e);
    }
}

// ===== FUNÇÃO: CONFIGURAR EVENT LISTENERS =====
function configurarEventListenersTecnicas() {
    // Filtros
    const filtroButtons = document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]');
    filtroButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const filtro = this.dataset.filtro;
            estadoTecnicas.filtroTecnicasAtivo = filtro;
            renderizarFiltrosTecnicas();
            renderizarCatalogoTecnicas();
        });
    });
    
    // Busca
    const buscaInput = document.getElementById('busca-tecnicas');
    if (buscaInput) {
        buscaInput.addEventListener('input', function() {
            estadoTecnicas.buscaTecnicasAtiva = this.value;
            renderizarCatalogoTecnicas();
        });
    }
    
    // Overlay do modal
    const overlay = document.querySelector('.modal-tecnica-overlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModalTecnica();
            }
        });
    }
    
    // Escape para fechar modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && estadoTecnicas.modalTecnicaAtiva) {
            fecharModalTecnica();
        }
    });
}

// ===== FUNÇÃO: RENDERIZAR FILTROS TÉCNICAS =====
function renderizarFiltrosTecnicas() {
    const filtroButtons = document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]');
    filtroButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filtro === estadoTecnicas.filtroTecnicasAtivo) {
            btn.classList.add('active');
        }
    });
}

// ===== FUNÇÃO: INICIALIZAR SISTEMA DE TÉCNICAS =====
function inicializarSistemaTecnicas() {
    carregarTecnicas();
    configurarEventListenersTecnicas();
    atualizarEstatisticasTecnicas();
    renderizarFiltrosTecnicas();
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
}

// ===== INTEGRAÇÃO COM SISTEMA DE PERÍCIAS =====
function configurarOuvintePericias() {
    // Quando perícias mudam, atualizar catálogo de técnicas
    document.addEventListener('periciasAlteradas', function() {
        renderizarCatalogoTecnicas();
    });
}

// ===== EXPORTAR FUNÇÕES =====
window.alterarNivelTecnicaDropdown = alterarNivelTecnicaDropdown;
window.confirmarTecnica = confirmarTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.abrirModalTecnica = abrirModalTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;
window.estadoTecnicas = estadoTecnicas;
window.removerTecnica = removerTecnica;

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    const periciasTab = document.getElementById('pericias');
    if (periciasTab && periciasTab.classList.contains('active')) {
        setTimeout(() => {
            inicializarSistemaTecnicas();
            configurarOuvintePericias();
        }, 300);
    }
});

// Observer para quando a aba é ativada
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const tab = mutation.target;
            if (tab.id === 'pericias' && tab.classList.contains('active')) {
                setTimeout(() => {
                    if (!window.sistemaTecnicasInicializado) {
                        inicializarSistemaTecnicas();
                        configurarOuvintePericias();
                        window.sistemaTecnicasInicializado = true;
                    }
                }, 200);
            }
        }
    });
});

document.querySelectorAll('.tab-content').forEach(tab => {
    observer.observe(tab, { attributes: true });
});
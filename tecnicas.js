// ===== SISTEMA DE TÉCNICAS =====
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

// ===== TABELA DE CUSTO PARA TÉCNICAS =====
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

// ===== FUNÇÃO PARA OBTER NH DA PERÍCIA POR ID =====
function obterNHPericiaPorId(idPericia) {
    if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
        console.log('estadoPericias não disponível');
        return null;
    }
    
    // Encontrar a perícia pelo ID
    const pericia = window.estadoPericias.periciasAprendidas.find(p => {
        console.log(`Comparando: ${p.id} com ${idPericia}`);
        return p.id === idPericia;
    });
    
    if (!pericia) {
        console.log(`Perícia ${idPericia} não encontrada`);
        return null;
    }
    
    // Obter valor do atributo base
    let valorAtributo = 10; // Default
    
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
    
    const nh = valorAtributo + (pericia.nivel || 0);
    console.log(`NH de ${pericia.nome}: ${valorAtributo} (atributo) + ${pericia.nivel || 0} (nível) = ${nh}`);
    return nh;
}

// ===== FUNÇÃO PARA OBTER NH DA PERÍCIA POR NOME =====
function obterNHPericiaPorNome(nomePericia) {
    if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) return null;
    
    const nomeBusca = nomePericia.toLowerCase();
    
    // Primeiro busca exata
    let pericia = window.estadoPericias.periciasAprendidas.find(p => 
        p.nome && p.nome.toLowerCase() === nomeBusca
    );
    
    // Se não encontrar, busca por parte do nome
    if (!pericia) {
        pericia = window.estadoPericias.periciasAprendidas.find(p => 
            p.nome && p.nome.toLowerCase().includes(nomeBusca)
        );
    }
    
    if (!pericia) {
        console.log(`Perícia "${nomePericia}" não encontrada por nome`);
        return null;
    }
    
    return obterNHPericiaPorId(pericia.id);
}

// ===== FUNÇÃO PARA CALCULAR NH ATUAL DA TÉCNICA =====
function calcularNHAtualDaTecnica(tecnicaAprendida) {
    if (!window.catalogoTecnicas) return 0;
    
    const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(tecnicaAprendida.id);
    if (!tecnicaCatalogo || !tecnicaCatalogo.baseCalculo) {
        return 0;
    }

    const baseCalc = tecnicaCatalogo.baseCalculo;
    let baseTecnica = 0;

    if (baseCalc.tipo === "pericia") {
        const nhPericia = obterNHPericiaPorId(baseCalc.idPericia);
        if (nhPericia === null) return 0;
        baseTecnica = nhPericia + (baseCalc.redutor || 0);
    }

    const niveisAcima = tecnicaAprendida.niveisAcimaBase || 0;
    let nhTecnica = baseTecnica + niveisAcima;

    // Aplicar limite máximo (não pode exceder o NH em Arco)
    if (tecnicaCatalogo.limiteMaximo) {
        const limite = tecnicaCatalogo.limiteMaximo;
        let nhMaximo = Infinity;
        
        if (limite.tipo === "pericia") {
            nhMaximo = obterNHPericiaPorId(limite.idPericia) || Infinity;
        }
        
        nhTecnica = Math.min(nhTecnica, nhMaximo);
    }

    return Math.max(0, nhTecnica);
}

// ===== VERIFICAR PRÉ-REQUISITOS =====
function verificarPreRequisitosTecnica(tecnica) {
    if (!tecnica || !tecnica.preRequisitos) {
        return { passou: false, motivo: "Técnica inválida" };
    }
    
    if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
        return { passou: true, motivo: "Verificação manual necessária" };
    }
    
    console.log(`=== VERIFICANDO PRÉ-REQUISITOS PARA: ${tecnica.nome} ===`);
    
    for (const prereq of tecnica.preRequisitos) {
        console.log(`Pré-requisito: ${prereq.nomePericia || prereq.idPericia}`);
        
        let periciaEncontrada = null;
        
        // Busca por ID primeiro
        if (prereq.idPericia) {
            periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => p.id === prereq.idPericia);
        }
        
        // Busca por nome (para Arco e Cavalgar)
        if (!periciaEncontrada && prereq.nomePericia) {
            const nomeBusca = prereq.nomePericia.toLowerCase();
            periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => 
                p.nome && p.nome.toLowerCase().includes(nomeBusca)
            );
        }
        
        // Busca por IDs de cavalgar (para especializações)
        if (!periciaEncontrada && prereq.idsCavalgar) {
            periciaEncontrada = window.estadoPericias.periciasAprendidas.find(p => 
                prereq.idsCavalgar.includes(p.id)
            );
        }
        
        if (!periciaEncontrada) {
            console.log(`  ❌ FALTA: ${prereq.nomePericia || prereq.idPericia}`);
            return { passou: false, motivo: `Falta: ${prereq.nomePericia || prereq.idPericia}` };
        }
        
        console.log(`  ✅ ENCONTRADA: ${periciaEncontrada.nome}`);
        
        // Verificar nível mínimo
        if (prereq.nivelMinimo > 0) {
            const nh = obterNHPericiaPorId(periciaEncontrada.id);
            console.log(`  NH necessário: ${prereq.nivelMinimo}, NH atual: ${nh}`);
            
            if (nh === null || nh < prereq.nivelMinimo) {
                console.log(`  ❌ NÍVEL INSUFICIENTE: ${periciaEncontrada.nome} precisa NH ${prereq.nivelMinimo}`);
                return { 
                    passou: false, 
                    motivo: `${prereq.nomePericia || periciaEncontrada.nome} precisa NH ${prereq.nivelMinimo} (tem ${nh || 0})` 
                };
            }
        }
    }
    
    console.log(`  ✅ TODOS PRÉ-REQUISITOS ATENDIDOS!`);
    return { passou: true, motivo: '' };
}

// ===== ATUALIZAR TÉCNICAS DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
    console.log('=== ATUALIZANDO TÉCNICAS DISPONÍVEIS ===');
    
    if (!window.catalogoTecnicas || !window.catalogoTecnicas.obterTodasTecnicas) {
        console.log('Catálogo de técnicas não disponível');
        return;
    }
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    console.log(`Total de técnicas no catálogo: ${todasTecnicas.length}`);
    
    const disponiveis = [];
    
    todasTecnicas.forEach(tecnica => {
        console.log(`\nProcessando técnica: ${tecnica.nome}`);
        
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        
        let nhAtual = 0;
        let custoMostrar = 0;
        
        if (jaAprendida) {
            nhAtual = calcularNHAtualDaTecnica(jaAprendida);
            custoMostrar = jaAprendida.custoPago || 0;
            console.log(`  Já aprendida - NH: ${nhAtual}, Custo: ${custoMostrar}`);
        } else {
            // Para exibição no catálogo: base atual + 0 níveis
            const tecnicaFake = { id: tecnica.id, niveisAcimaBase: 0 };
            nhAtual = calcularNHAtualDaTecnica(tecnicaFake);
            custoMostrar = 0;
            console.log(`  Não aprendida - NH base: ${nhAtual}`);
        }
        
        disponiveis.push({
            ...tecnica,
            disponivel: verificacao.passou,
            nhAtual: nhAtual,
            custoAtual: custoMostrar,
            jaAprendida: !!jaAprendida,
            motivoIndisponivel: verificacao.motivo
        });
        
        console.log(`  Disponível: ${verificacao.passou}, Motivo: ${verificacao.motivo}`);
    });
    
    estadoTecnicas.tecnicasDisponiveis = disponiveis;
    console.log(`Técnicas disponíveis após processamento: ${disponiveis.length}`);
    
    renderizarCatalogoTecnicas();
}

// ===== MONITORAMENTO EM TEMPO REAL =====
function configurarMonitoramento() {
    console.log('Configurando monitoramento de técnicas...');
    
    // Monitorar atributos
    if (typeof document !== 'undefined') {
        document.addEventListener('atributosAlterados', function() {
            console.log('Atributos alterados - atualizando técnicas');
            atualizarTecnicasDisponiveis();
            renderizarStatusTecnicas();
            renderizarTecnicasAprendidas();
        });
    }
    
    // Monitorar mudanças nas perícias
    if (window.estadoPericias) {
        console.log('Monitorando mudanças em estadoPericias');
        let ultimasPericias = JSON.stringify(window.estadoPericias.periciasAprendidas);
        
        setInterval(() => {
            if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) return;
            
            const periciasAtuais = JSON.stringify(window.estadoPericias.periciasAprendidas);
            if (periciasAtuais !== ultimasPericias) {
                console.log('Perícias alteradas - atualizando técnicas');
                ultimasPericias = periciasAtuais;
                atualizarTecnicasDisponiveis();
                renderizarStatusTecnicas();
                renderizarTecnicasAprendidas();
            }
        }, 1000);
    }
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
    
    // Atualizar elementos HTML
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
    
    console.log(`Status atualizado: ${estadoTecnicas.qtdTotal} técnicas (${estadoTecnicas.pontosTecnicasTotal} pts)`);
}

// ===== RENDERIZAR CATÁLOGO =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.log('Container lista-tecnicas não encontrado');
        return;
    }
    
    console.log(`Renderizando catálogo com ${estadoTecnicas.tecnicasDisponiveis.length} técnicas`);
    
    let tecnicasFiltradas = estadoTecnicas.tecnicasDisponiveis;
    
    // Aplicar filtro
    if (estadoTecnicas.filtroAtivo === 'medio-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Média');
    } else if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Difícil');
    }
    
    // Aplicar busca
    if (estadoTecnicas.buscaAtiva.trim() !== '') {
        const termo = estadoTecnicas.buscaAtiva.toLowerCase();
        tecnicasFiltradas = tecnicasFiltradas.filter(t => 
            t.nome.toLowerCase().includes(termo) ||
            (t.descricao && t.descricao.toLowerCase().includes(termo))
        );
    }
    
    console.log(`Após filtros: ${tecnicasFiltradas.length} técnicas`);
    
    if (tecnicasFiltradas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia">
                <i class="fas fa-info-circle"></i>
                <div>${estadoTecnicas.tecnicasDisponiveis.length === 0 ? 'Carregando técnicas...' : 'Nenhuma técnica encontrada'}</div>
                <small>Aprenda Arco e Cavalgar primeiro para desbloquear Arquearia Montada</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    tecnicasFiltradas.forEach(tecnica => {
        const disponivel = tecnica.disponivel;
        const jaAprendida = tecnica.jaAprendida;
        
        html += `
            <div class="pericia-item" data-id="${tecnica.id}" 
                 style="cursor: ${disponivel ? 'pointer' : 'not-allowed'}; 
                        opacity: ${disponivel ? '1' : '0.7'};
                        border: ${jaAprendida ? '2px solid #4CAF50' : '1px solid #ddd'};">
                <div class="pericia-header">
                    <h4 class="pericia-nome">${tecnica.nome} ${jaAprendida ? '<span style="color: #4CAF50;">✓</span>' : ''}</h4>
                    <div class="pericia-info">
                        <span class="pericia-dificuldade dificuldade-${tecnica.dificuldade.toLowerCase()}">
                            ${tecnica.dificuldade}
                        </span>
                        ${disponivel ? `<span class="pericia-custo">NH ${tecnica.nhAtual}</span>` : ''}
                    </div>
                </div>
                <p class="pericia-descricao">${tecnica.descricao || ''}</p>
                
                ${!disponivel ? `
                <div class="tecnica-indisponivel-badge">
                    <i class="fas fa-lock"></i> ${tecnica.motivoIndisponivel}
                </div>
                ` : `
                <div class="pericia-requisitos">
                    <small>
                        <strong>${jaAprendida ? 'Nível Atual' : 'Base'}:</strong> NH ${tecnica.nhAtual}
                    </small>
                </div>
                `}
                
                ${tecnica.baseCalculo ? `
                <div class="pericia-requisitos">
                    <small>
                        <strong>Base:</strong> ${tecnica.baseCalculo.idPericia} ${tecnica.baseCalculo.redutor >= 0 ? '+' : ''}${tecnica.baseCalculo.redutor}
                    </small>
                </div>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Adicionar eventos de clique
    document.querySelectorAll('.pericia-item[data-id]').forEach(item => {
        if (item.style.cursor === 'pointer') {
            item.addEventListener('click', function() {
                const id = this.dataset.id;
                const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
                if (tecnica && tecnica.disponivel) {
                    console.log(`Abrindo modal para: ${tecnica.nome}`);
                    abrirModalTecnica(tecnica);
                }
            });
        }
    });
}

// ===== RENDERIZAR TÉCNICAS APRENDIDAS =====
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) {
        console.log('Container tecnicas-aprendidas não encontrado');
        return;
    }
    
    console.log(`Renderizando ${estadoTecnicas.tecnicasAprendidas.length} técnicas aprendidas`);
    
    if (estadoTecnicas.tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia-aprendida">
                <i class="fas fa-tools"></i>
                <div>Nenhuma técnica aprendida</div>
                <small>Clique em uma técnica disponível para aprendê-la</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        const nhFinal = calcularNHAtualDaTecnica(tecnica);
        const tecnicaCatalogo = window.catalogoTecnicas.buscarTecnicaPorId(tecnica.id);
        let nhMaximo = nhFinal;
        
        if (tecnicaCatalogo && tecnicaCatalogo.limiteMaximo && tecnicaCatalogo.limiteMaximo.tipo === "pericia") {
            nhMaximo = obterNHPericiaPorId(tecnicaCatalogo.limiteMaximo.idPericia) || nhFinal;
        }
        
        html += `
            <div class="pericia-aprendida-item" style="position: relative; padding-right: 40px;">
                <div class="pericia-aprendida-header">
                    <h4 class="pericia-aprendida-nome">${tecnica.nome}</h4>
                    <div class="pericia-aprendida-info">
                        <span class="pericia-aprendida-nivel" style="font-weight: bold; color: #2196F3;">NH ${nhFinal}</span>
                        <span class="pericia-dificuldade dificuldade-${tecnica.dificuldade.toLowerCase()}">
                            ${tecnica.dificuldade}
                        </span>
                        <span class="pericia-aprendida-custo">${tecnica.custoPago} pts</span>
                    </div>
                </div>
                <div class="pericia-requisitos">
                    <small>
                        <strong>Base:</strong> ${tecnicaCatalogo?.baseCalculo?.idPericia || 'Perícia'} ${tecnicaCatalogo?.baseCalculo?.redutor >= 0 ? '+' : ''}${tecnicaCatalogo?.baseCalculo?.redutor || 0} + ${tecnica.niveisAcimaBase || 0} níveis
                    </small>
                    <br>
                    <small>
                        <strong>Máximo:</strong> NH ${nhMaximo}
                    </small>
                </div>
                <button class="btn-remover-pericia" data-id="${tecnica.id}" 
                        style="position: absolute; top: 10px; right: 10px; background: #f44336; color: white; border: none; border-radius: 3px; padding: 5px 10px; cursor: pointer;">
                    <i class="fas fa-times"></i> Remover
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Adicionar eventos para remover
    document.querySelectorAll('.btn-remover-pericia').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.dataset.id;
            if (confirm('Remover esta técnica? Os pontos serão devolvidos.')) {
                estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
                salvarTecnicas();
                renderizarStatusTecnicas();
                renderizarTecnicasAprendidas();
                atualizarTecnicasDisponiveis();
                
                if (window.atualizarPontosTotais) {
                    window.atualizarPontosTotais();
                }
                
                console.log(`Técnica ${id} removida`);
            }
        });
    });
}

// ===== ABRIR MODAL DA TÉCNICA =====
function abrirModalTecnica(tecnica) {
    if (!tecnica) return;
    
    console.log(`Abrindo modal para: ${tecnica.nome}`);
    
    const verificacao = verificarPreRequisitosTecnica(tecnica);
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    
    // Calcular base atual (NH da perícia Arco - 4)
    let baseAtual = 0;
    if (tecnica.baseCalculo && tecnica.baseCalculo.tipo === "pericia") {
        const nhPericia = obterNHPericiaPorId(tecnica.baseCalculo.idPericia);
        if (nhPericia !== null) {
            baseAtual = nhPericia + (tecnica.baseCalculo.redutor || 0);
            console.log(`Base atual: ${nhPericia} (Arco) ${tecnica.baseCalculo.redutor >= 0 ? '+' : ''}${tecnica.baseCalculo.redutor} = ${baseAtual}`);
        }
    }
    
    const niveisAcima = jaAprendida ? jaAprendida.niveisAcimaBase || 0 : 0;
    const nhAtual = baseAtual + niveisAcima;
    
    // Calcular limite máximo (não pode exceder NH em Arco)
    let nhMaximo = Infinity;
    if (tecnica.limiteMaximo) {
        if (tecnica.limiteMaximo.tipo === "pericia") {
            nhMaximo = obterNHPericiaPorId(tecnica.limiteMaximo.idPericia) || Infinity;
            console.log(`Limite máximo: NH ${nhMaximo} (${tecnica.limiteMaximo.idPericia})`);
        }
    }
    
    // Garantir que nhMaximo seja pelo menos baseAtual
    nhMaximo = Math.max(nhMaximo, baseAtual);
    
    // Remover modal anterior se existir
    const modalAnterior = document.querySelector('.modal-tecnica-overlay');
    if (modalAnterior) modalAnterior.remove();
    
    // Criar novo modal
    const modal = document.createElement('div');
    modal.className = 'modal-tecnica-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div class="modal-tecnica" style="
            background: white;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        ">
            <div class="modal-header-pericia" style="
                background: #2c3e50;
                color: white;
                padding: 15px 20px;
                border-radius: 8px 8px 0 0;
                position: relative;
            ">
                <span class="modal-close" onclick="fecharModalTecnica()" style="
                    position: absolute;
                    right: 15px;
                    top: 15px;
                    font-size: 24px;
                    cursor: pointer;
                ">&times;</span>
                <h3 style="margin: 0 0 5px 0;">${tecnica.nome} ${jaAprendida ? '(Aprendida)' : ''}</h3>
                <div class="modal-subtitulo" style="opacity: 0.8;">
                    ${tecnica.dificuldade} • Base: ${tecnica.baseCalculo?.idPericia} ${tecnica.baseCalculo?.redutor >= 0 ? '+' : ''}${tecnica.baseCalculo?.redutor || 0}
                </div>
            </div>
            
            <div class="modal-body-pericia" style="padding: 20px;">
                <div class="nivel-selecao-container" style="margin-bottom: 20px;">
                    <div class="nivel-info-box" style="
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 10px;
                        margin-bottom: 15px;
                    ">
                        <div class="nivel-info-item" style="text-align: center;">
                            <label style="display: block; font-size: 12px; color: #666; margin-bottom: 5px;">Nível Base</label>
                            <div class="nivel-valor-grande" style="font-size: 24px; font-weight: bold; color: #2196F3;">${baseAtual}</div>
                        </div>
                        <div class="nivel-info-item" style="text-align: center;">
                            <label style="display: block; font-size: 12px; color: #666; margin-bottom: 5px;">Nível Máximo</label>
                            <div class="nivel-valor-grande" style="font-size: 24px; font-weight: bold; color: #4CAF50;">${nhMaximo}</div>
                        </div>
                        <div class="nivel-info-item" style="text-align: center;">
                            <label style="display: block; font-size: 12px; color: #666; margin-bottom: 5px;">Nível Atual</label>
                            <div class="nivel-valor-grande" style="font-size: 24px; font-weight: bold; color: #FF9800;">${nhAtual}</div>
                        </div>
                    </div>
                    
                    <div class="seletor-nivel-tecnica" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                            Selecione o NH desejado (${baseAtual} a ${nhMaximo}):
                        </label>
                        <select id="seletor-nh-tecnica" class="select-nivel" style="
                            width: 100%;
                            padding: 10px;
                            border: 2px solid #ddd;
                            border-radius: 4px;
                            font-size: 16px;
                        ">
                            ${(() => {
                                let options = '';
                                for (let nh = baseAtual; nh <= nhMaximo; nh++) {
                                    const niveisAcimaOpt = nh - baseAtual;
                                    const custo = calcularCustoTecnica(niveisAcimaOpt, tecnica.dificuldade);
                                    const selected = nh === nhAtual ? 'selected' : '';
                                    options += `<option value="${nh}" data-niveis-acima="${niveisAcimaOpt}" data-custo="${custo}" ${selected}>
                                        NH ${nh} (${custo} pontos)
                                    </option>`;
                                }
                                return options;
                            })()}
                        </select>
                    </div>
                    
                    <div class="custo-final-box" style="
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 4px;
                        text-align: center;
                        border-left: 4px solid #2196F3;
                    ">
                        <div class="custo-final-label" style="font-size: 14px; color: #666;">Custo Total:</div>
                        <div class="custo-final-valor" id="custo-final-tecnica" style="
                            font-size: 28px;
                            font-weight: bold;
                            color: #2196F3;
                        ">0 pontos</div>
                    </div>
                </div>
                
                <div class="detalhes-pericia-descricao" style="margin: 20px 0;">
                    <h4 style="margin-bottom: 10px; color: #2c3e50;">Descrição</h4>
                    <p style="line-height: 1.5; color: #555;">${tecnica.descricao || ''}</p>
                </div>
                
                <div class="detalhes-pericia-default" style="
                    background: #f8f9fa;
                    padding: 10px 15px;
                    border-radius: 4px;
                    margin: 15px 0;
                    border-left: 4px solid #FF9800;
                ">
                    <strong>Pré-requisitos:</strong> ${tecnica.preRequisitos.map(p => 
                        `${p.nomePericia || p.idPericia} ${p.nivelMinimo > 0 ? p.nivelMinimo+'+' : ''}`
                    ).join(', ')}
                </div>
                
                ${!verificacao.passou ? `
                <div class="detalhes-pericia-default" style="
                    background: rgba(231, 76, 60, 0.1);
                    padding: 10px 15px;
                    border-radius: 4px;
                    margin: 15px 0;
                    border-left: 4px solid #e74c3c;
                ">
                    <strong><i class="fas fa-exclamation-triangle"></i> Não pode aprender:</strong><br>
                    ${verificacao.motivo}
                </div>
                ` : ''}
            </div>
            
            <div class="modal-actions-pericia" style="
                padding: 15px 20px;
                background: #f8f9fa;
                border-radius: 0 0 8px 8px;
                text-align: right;
                border-top: 1px solid #ddd;
            ">
                <button class="btn-modal btn-cancelar" onclick="fecharModalTecnica()" style="
                    padding: 10px 20px;
                    background: #95a5a6;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-right: 10px;
                ">Cancelar</button>
                <button class="btn-modal btn-confirmar" id="btn-confirmar-tecnica" onclick="confirmarTecnica()" 
                    ${!verificacao.passou ? 'disabled' : ''} style="
                    padding: 10px 20px;
                    background: ${!verificacao.passou ? '#ccc' : '#2ecc71'};
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: ${!verificacao.passou ? 'not-allowed' : 'pointer'};
                ">
                    ${jaAprendida ? 'Atualizar' : 'Aprender'}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Configurar eventos
    const select = document.getElementById('seletor-nh-tecnica');
    const custoDisplay = document.getElementById('custo-final-tecnica');
    const btnConfirmar = document.getElementById('btn-confirmar-tecnica');
    
    function atualizarCustoDisplay() {
        const selectedOption = select.options[select.selectedIndex];
        const custo = parseInt(selectedOption.dataset.custo);
        const niveisAcimaOpt = parseInt(selectedOption.dataset.niveisAcima);
        custoDisplay.textContent = `${custo} pontos`;
        
        if (jaAprendida) {
            const custoAtual = jaAprendida.custoPago || 0;
            if (niveisAcimaOpt === jaAprendida.niveisAcimaBase) {
                btnConfirmar.textContent = `Manter (0 pontos)`;
                btnConfirmar.disabled = true;
                btnConfirmar.style.background = '#ccc';
            } else {
                const diferenca = custo - custoAtual;
                if (diferenca > 0) {
                    btnConfirmar.textContent = `Melhorar (+${diferenca} pontos)`;
                } else {
                    btnConfirmar.textContent = `Reduzir (${diferenca} pontos)`;
                }
                btnConfirmar.disabled = false;
                btnConfirmar.style.background = '#2ecc71';
            }
        } else {
            btnConfirmar.textContent = `Aprender (${custo} pontos)`;
            btnConfirmar.disabled = !verificacao.passou;
            btnConfirmar.style.background = verificacao.passou ? '#2ecc71' : '#ccc';
        }
    }
    
    select.addEventListener('change', atualizarCustoDisplay);
    atualizarCustoDisplay();
    
    // Salvar dados
    window.tecnicaModalData = {
        tecnica: tecnica,
        jaAprendida: jaAprendida,
        baseAtual: baseAtual,
        nhMaximo: nhMaximo
    };
    
    console.log('Modal configurado com sucesso');
}

// ===== CONFIRMAR TÉCNICA =====
function confirmarTecnica() {
    if (!window.tecnicaModalData) {
        console.log('Nenhum dado de modal encontrado');
        return;
    }
    
    const { tecnica, jaAprendida } = window.tecnicaModalData;
    const select = document.getElementById('seletor-nh-tecnica');
    
    if (!select) {
        console.log('Select não encontrado');
        return;
    }
    
    const nhEscolhido = parseInt(select.value);
    const selectedOption = select.options[select.selectedIndex];
    const niveisAcima = parseInt(selectedOption.dataset.niveisAcima);
    const custo = parseInt(selectedOption.dataset.custo);
    
    console.log(`Confirmando técnica: ${tecnica.nome}`);
    console.log(`NH escolhido: ${nhEscolhido}, Níveis acima: ${niveisAcima}, Custo: ${custo}`);
    
    if (jaAprendida && niveisAcima === jaAprendida.niveisAcimaBase) {
        console.log('Nenhuma alteração necessária');
        fecharModalTecnica();
        return;
    }
    
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnica.id);
    
    if (index >= 0) {
        // Atualizar técnica existente
        console.log(`Atualizando técnica existente`);
        estadoTecnicas.tecnicasAprendidas[index] = {
            ...estadoTecnicas.tecnicasAprendidas[index],
            niveisAcimaBase: niveisAcima,
            custoPago: custo
        };
    } else {
        // Adicionar nova técnica
        console.log(`Adicionando nova técnica`);
        estadoTecnicas.tecnicasAprendidas.push({
            id: tecnica.id,
            nome: tecnica.nome,
            descricao: tecnica.descricao,
            dificuldade: tecnica.dificuldade,
            preRequisitos: tecnica.preRequisitos,
            niveisAcimaBase: niveisAcima,
            custoPago: custo
        });
    }
    
    fecharModalTecnica();
    salvarTecnicas();
    renderizarStatusTecnicas();
    renderizarTecnicasAprendidas();
    atualizarTecnicasDisponiveis();
    
    if (window.atualizarPontosTotais) {
        window.atualizarPontosTotais();
    }
    
    console.log(`Técnica ${tecnica.nome} confirmada com sucesso!`);
}

// ===== FUNÇÕES AUXILIARES =====
function fecharModalTecnica() {
    const modal = document.querySelector('.modal-tecnica-overlay');
    if (modal) {
        modal.remove();
        console.log('Modal fechado');
    }
    window.tecnicaModalData = null;
}

function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
        console.log('Técnicas salvas no localStorage');
    } catch (e) {
        console.error('Erro ao salvar técnicas:', e);
    }
}

function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
            console.log(`Carregadas ${estadoTecnicas.tecnicasAprendidas.length} técnicas do localStorage`);
        } else {
            console.log('Nenhuma técnica salva encontrada');
        }
    } catch (e) {
        console.error('Erro ao carregar técnicas:', e);
    }
}

function configurarEventListenersTecnicas() {
    console.log('Configurando event listeners para técnicas');
    
    // Filtros
    const filtroButtons = document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]');
    filtroButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            estadoTecnicas.filtroAtivo = this.dataset.filtro;
            console.log(`Filtro alterado para: ${estadoTecnicas.filtroAtivo}`);
            renderizarFiltrosTecnicas();
            renderizarCatalogoTecnicas();
        });
    });
    
    // Busca
    const buscaInput = document.getElementById('busca-tecnicas');
    if (buscaInput) {
        buscaInput.addEventListener('input', function() {
            estadoTecnicas.buscaAtiva = this.value;
            console.log(`Busca: "${estadoTecnicas.buscaAtiva}"`);
            renderizarCatalogoTecnicas();
        });
    }
    
    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fecharModalTecnica();
        }
    });
}

function renderizarFiltrosTecnicas() {
    const filtroButtons = document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]');
    filtroButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filtro === estadoTecnicas.filtroAtivo);
    });
}

// ===== INICIALIZAR SISTEMA =====
function inicializarSistemaTecnicas() {
    console.log('========== INICIALIZANDO SISTEMA DE TÉCNICAS ==========');
    
    // Verificar dependências
    console.log('Verificando dependências...');
    console.log('catalogoTecnicas:', !!window.catalogoTecnicas);
    console.log('estadoPericias:', !!window.estadoPericias);
    
    if (!window.catalogoTecnicas) {
        console.error('ERROR: catalogoTecnicas não encontrado!');
        return;
    }
    
    // Carregar dados salvos
    carregarTecnicas();
    
    // Configurar eventos
    configurarEventListenersTecnicas();
    
    // Configurar monitoramento
    configurarMonitoramento();
    
    // Renderizar tudo
    atualizarTecnicasDisponiveis();
    renderizarStatusTecnicas();
    renderizarFiltrosTecnicas();
    renderizarTecnicasAprendidas();
    
    console.log('✅ Sistema de técnicas inicializado com sucesso!');
    console.log(`✅ Técnicas aprendidas: ${estadoTecnicas.tecnicasAprendidas.length}`);
    console.log(`✅ Técnicas disponíveis: ${estadoTecnicas.tecnicasDisponiveis.length}`);
    console.log('=======================================================');
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Preparando sistema de técnicas');
    
    // Aguardar carregamento completo
    setTimeout(() => {
        console.log('Iniciando verificação do sistema de técnicas...');
        
        if (window.catalogoTecnicas) {
            console.log('Catálogo de técnicas encontrado, inicializando...');
            inicializarSistemaTecnicas();
        } else {
            console.warn('Catálogo de técnicas não encontrado, tentando novamente em 1 segundo...');
            // Tentar novamente
            setTimeout(() => {
                if (window.catalogoTecnicas) {
                    inicializarSistemaTecnicas();
                } else {
                    console.error('FALHA: Catálogo de técnicas não carregado após 2 segundos');
                }
            }, 1000);
        }
    }, 500);
});

// ===== EXPORTAR FUNÇÕES =====
window.fecharModalTecnica = fecharModalTecnica;
window.confirmarTecnica = confirmarTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

console.log('Módulo de técnicas carregado');
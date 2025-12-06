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

// ===== NOVA FUNÇÃO: ATUALIZAR NH DAS TÉCNICAS APRENDIDAS =====
function atualizarNHsTecnicasAprendidas() {
    console.log("🔧 Técnicas: Atualizando NHs das técnicas aprendidas...");
    
    if (!estadoTecnicas.tecnicasAprendidas.length) return;
    
    estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.map(tecnicaAprendida => {
        // Busca a técnica original no catálogo
        const tecnicaOriginal = window.catalogoTecnicas?.obterTodasTecnicas()?.find(t => t.id === tecnicaAprendida.id);
        if (!tecnicaOriginal) {
            console.warn(`Técnica ${tecnicaAprendida.nome} não encontrada no catálogo`);
            return tecnicaAprendida;
        }
        
        // Calcula NOVOS valores baseados nos atributos atuais
        const novoNHBase = calcularNHBaseTecnica(tecnicaOriginal);
        const novoNHMaximo = calcularNHMaximoTecnica(tecnicaOriginal);
        
        // Verifica o NH anterior para calcular o máximo antigo
        const antigoNHMaximo = calcularNHMaximoTecnica(tecnicaOriginal, true); // true = usa valores antigos
        
        console.log(`📊 ${tecnicaAprendida.nome}: Base=${novoNHBase}, Max=${novoNHMaximo}, AntigoMax=${antigoNHMaximo}, Atual=${tecnicaAprendida.nhAtual}`);
        
        let novoNHAtual = tecnicaAprendida.nhAtual;
        
        // REGRA: Se estava no máximo antigo, vai para o novo máximo
        if (tecnicaAprendida.nhAtual >= antigoNHMaximo) {
            console.log(`  ↪️ Estava no máximo antigo (${antigoNHMaximo}), ajustando para novo máximo (${novoNHMaximo})`);
            novoNHAtual = novoNHMaximo;
        }
        // REGRA: Se ficou abaixo do novo mínimo, ajusta para o mínimo
        else if (novoNHAtual < novoNHBase) {
            console.log(`  ↪️ Abaixo do novo mínimo (${novoNHBase}), ajustando para mínimo`);
            novoNHAtual = novoNHBase;
        }
        // REGRA: Se ficou acima do novo máximo, ajusta para o máximo
        else if (novoNHAtual > novoNHMaximo) {
            console.log(`  ↪️ Acima do novo máximo (${novoNHMaximo}), ajustando para máximo`);
            novoNHAtual = novoNHMaximo;
        }
        // REGRA: Se o mínimo subiu e o NH atual está abaixo, sobe junto
        else if (novoNHBase > antigoNHMaximo && novoNHAtual < novoNHBase) {
            console.log(`  ↪️ Base subiu para ${novoNHBase}, ajustando NH`);
            novoNHAtual = novoNHBase;
        }
        
        // Se o NH mudou, mostra no console
        if (novoNHAtual !== tecnicaAprendida.nhAtual) {
            console.log(`  ✅ ${tecnicaAprendida.nome}: NH ${tecnicaAprendida.nhAtual} → ${novoNHAtual} (atributo alterado)`);
        }
        
        // Mantém o custo pago original (não altera automaticamente)
        return {
            ...tecnicaAprendida,
            nhAtual: novoNHAtual
        };
    });
    
    // Salva as alterações
    salvarTecnicas();
    return true;
}

// ===== FUNÇÃO AUXILIAR: Calcular NH máximo com flag para valores antigos =====
function calcularNHMaximoTecnica(tecnica, usarValoresAntigos = false) {
    if (!tecnica.preRequisitos || tecnica.preRequisitos.length === 0) return 0;
    
    const prereq = tecnica.preRequisitos[0];
    let periciaAprendida = null;
    
    // Procura pelo ID exato primeiro
    if (prereq.idPericia) {
        periciaAprendida = window.estadoPericias.periciasAprendidas.find(p => p.id === prereq.idPericia);
    }
    
    // Se não encontrou, procura na lista de IDs (Cavalgar)
    if (!periciaAprendida && prereq.idsCavalgar) {
        periciaAprendida = window.estadoPericias.periciasAprendidas.find(p => prereq.idsCavalgar.includes(p.id));
    }
    
    if (!periciaAprendida) return 0;
    
    // Se usarValoresAntigos é true, tenta pegar o NH armazenado anteriormente
    if (usarValoresAntigos && periciaAprendida.nhAntigo) {
        return periciaAprendida.nhAntigo;
    }
    
    return obterNHPericiaAtual(periciaAprendida.id);
}

// ===== MODIFICAR: ATUALIZAÇÃO EM TEMPO REAL =====
function configurarMonitoramento() {
    // Escuta o evento dos atributos
    document.addEventListener('atributosAlterados', function() {
        console.log('🎯 Técnicas: Atributos alterados, atualizando...');
        
        // 1. Atualiza os NHs das técnicas já aprendidas
        atualizarNHsTecnicasAprendidas();
        
        // 2. Atualiza a lista de técnicas disponíveis
        atualizarTecnicasDisponiveis();
        
        // 3. Atualiza todas as renderizações
        renderizarStatusTecnicas();
        renderizarTecnicasAprendidas();
        
        // 4. Dispara evento para outras partes do sistema
        document.dispatchEvent(new CustomEvent('tecnicasAtualizadas'));
    });
    
    // Monitora mudanças nas perícias
    if (window.estadoPericias) {
        let ultimasPericias = JSON.stringify(window.estadoPericias.periciasAprendidas);
        
        setInterval(() => {
            if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) return;
            
            const periciasAtuais = JSON.stringify(window.estadoPericias.periciasAprendidas);
            if (periciasAtuais !== ultimasPericias) {
                ultimasPericias = periciasAtuais;
                console.log('🎯 Técnicas: Perícias alteradas, atualizando...');
                
                // 1. Atualiza os NHs das técnicas já aprendidas
                atualizarNHsTecnicasAprendidas();
                
                // 2. Atualiza a lista de técnicas disponíveis
                atualizarTecnicasDisponiveis();
                
                // 3. Atualiza todas as renderizações
                renderizarStatusTecnicas();
                renderizarTecnicasAprendidas();
                
                // 4. Dispara evento para outras partes do sistema
                document.dispatchEvent(new CustomEvent('tecnicasAtualizadas'));
            }
        }, 500);
    }
    
    // Monitora o botão de reset/limpar atributos
    document.addEventListener('resetPontos', function() {
        console.log('🔄 Técnicas: Sistema resetado, recalculando...');
        setTimeout(atualizarNHsTecnicasAprendidas, 100);
    });
}

// ===== MODIFICAR: ATUALIZAR TÉCNICAS DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
    if (!window.catalogoTecnicas || !window.catalogoTecnicas.obterTodasTecnicas) return;
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    const disponiveis = [];
    
    todasTecnicas.forEach(tecnica => {
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        const nhBase = calcularNHBaseTecnica(tecnica);
        const nhMaximo = calcularNHMaximoTecnica(tecnica);
        
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        
        // ATUALIZAÇÃO: Se já aprendida, usa o NH atual dela (que já foi atualizado)
        // Se não aprendida, mostra o NH base
        let nhAtual = jaAprendida ? jaAprendida.nhAtual : nhBase;
        
        // Garante que está dentro dos limites
        nhAtual = Math.min(Math.max(nhAtual, nhBase), nhMaximo);
        
        let custoMostrar = 0;
        if (jaAprendida) {
            custoMostrar = jaAprendida.custoPago || 0;
        } else {
            const niveisAcima = Math.max(0, nhAtual - nhBase);
            custoMostrar = calcularCustoTecnica(niveisAcima, tecnica.dificuldade);
        }
        
        disponiveis.push({
            ...tecnica,
            disponivel: verificacao.passou,
            nhBase: nhBase,
            nhMaximo: nhMaximo,
            nhAtual: nhAtual,
            custoAtual: custoMostrar,
            jaAprendida: !!jaAprendida,
            motivoIndisponivel: verificacao.motivo,
            // Adiciona flag para mostrar se ganhou NH automático
            ganhouAutomatico: jaAprendida && (jaAprendida.nhAtual > (jaAprendida.nhAnterior || 0))
        });
    });
    
    estadoTecnicas.tecnicasDisponiveis = disponiveis;
    renderizarCatalogoTecnicas();
}

// ===== MODIFICAR: ABRIR MODAL (para mostrar NH atualizado) =====
function abrirModalTecnica(tecnica) {
    if (!tecnica) return;
    
    // Garante que os cálculos estão atualizados
    const verificacao = verificarPreRequisitosTecnica(tecnica);
    const nhBase = calcularNHBaseTecnica(tecnica);
    const nhMaximo = calcularNHMaximoTecnica(tecnica);
    
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    const nhAtual = jaAprendida ? jaAprendida.nhAtual : nhBase;
    
    const modal = document.querySelector('.modal-tecnica');
    if (!modal) return;
    
    // Adiciona indicador se ganhou NH automático
    let indicadorBonus = '';
    if (jaAprendida && jaAprendida.nhAnterior && jaAprendida.nhAtual > jaAprendida.nhAnterior) {
        indicadorBonus = `<span class="bonus-atributo-modal" title="NH aumentado pelo atributo!">↑</span>`;
    }
    
    modal.innerHTML = `
        <div class="modal-header-pericia">
            <span class="modal-close" onclick="fecharModalTecnica()">&times;</span>
            <h3>${tecnica.nome} ${jaAprendida ? '(Aprendida)' : ''} ${indicadorBonus}</h3>
            <div class="modal-subtitulo">
                ${tecnica.dificuldade} • Base: -4
            </div>
        </div>
        
        <div class="modal-body-pericia">
            <div class="nivel-selecao-container">
                <div class="nivel-info-box">
                    <div class="nivel-info-item">
                        <label>Nível Base:</label>
                        <div class="nivel-valor-grande">${nhBase}</div>
                    </div>
                    <div class="nivel-info-item">
                        <label>Nível Máximo:</label>
                        <div class="nivel-valor-grande">${nhMaximo}</div>
                    </div>
                    <div class="nivel-info-item">
                        <label>Nível Atual:</label>
                        <div class="nivel-valor-grande">${nhAtual}</div>
                    </div>
                </div>
                
                <div class="seletor-nivel-tecnica">
                    <label>Selecione o NH desejado (${nhBase} a ${nhMaximo}):</label>
                    <select id="seletor-nh-tecnica" class="select-nivel">
                        ${(() => {
                            let options = '';
                            for (let nh = nhBase; nh <= nhMaximo; nh++) {
                                const niveisAcima = nh - nhBase;
                                const custo = calcularCustoTecnica(niveisAcima, tecnica.dificuldade);
                                const selected = nh === nhAtual ? 'selected' : '';
                                options += `<option value="${nh}" data-custo="${custo}" ${selected}>NH ${nh} (${custo} pontos)</option>`;
                            }
                            return options;
                        })()}
                    </select>
                </div>
                
                <div class="custo-final-box">
                    <div class="custo-final-label">Custo Total:</div>
                    <div class="custo-final-valor" id="custo-final-tecnica">0 pontos</div>
                </div>
            </div>
            
            <div class="detalhes-pericia-descricao">
                <h4>Descrição</h4>
                <p>${tecnica.descricao || ''}</p>
            </div>
            
            <div class="detalhes-pericia-default">
                <strong>Pré-requisitos:</strong> ${tecnica.preRequisitos.map(p => `${p.nomePericia} ${p.nivelMinimo}+`).join(', ')}
            </div>
            
            ${!verificacao.passou ? `
            <div class="detalhes-pericia-default" style="background: rgba(231, 76, 60, 0.1); border-left-color: #e74c3c;">
                <strong><i class="fas fa-exclamation-triangle"></i> Não pode aprender:</strong><br>
                ${verificacao.motivo}
            </div>
            ` : ''}
            
            ${jaAprendida && jaAprendida.nhAnterior && jaAprendida.nhAtual > jaAprendida.nhAnterior ? `
            <div class="detalhes-pericia-default" style="background: rgba(46, 204, 113, 0.1); border-left-color: #2ecc71;">
                <strong><i class="fas fa-arrow-up"></i> Bônus de Atributo:</strong><br>
                Seu NH aumentou de ${jaAprendida.nhAnterior} para ${jaAprendida.nhAtual} devido ao aumento do atributo!
            </div>
            ` : ''}
        </div>
        
        <div class="modal-actions-pericia">
            <button class="btn-modal btn-cancelar" onclick="fecharModalTecnica()">Cancelar</button>
            <button class="btn-modal btn-confirmar" id="btn-confirmar-tecnica" onclick="confirmarTecnica()" 
                ${!verificacao.passou ? 'disabled' : ''}>
                ${jaAprendida ? 'Atualizar' : 'Aprender'}
            </button>
        </div>
    `;
    
    const select = document.getElementById('seletor-nh-tecnica');
    const custoDisplay = document.getElementById('custo-final-tecnica');
    const btnConfirmar = document.getElementById('btn-confirmar-tecnica');
    
    function atualizarCustoDisplay() {
        const selectedOption = select.options[select.selectedIndex];
        const custo = parseInt(selectedOption.dataset.custo);
        custoDisplay.textContent = `${custo} pontos`;
        
        const nhEscolhido = parseInt(select.value);
        
        if (jaAprendida) {
            const custoAtual = jaAprendida.custoPago || 0;
            if (nhEscolhido === jaAprendida.nhAtual) {
                btnConfirmar.textContent = `Manter (0 pontos)`;
                btnConfirmar.disabled = true;
            } else {
                const diferenca = custo - custoAtual;
                if (diferenca > 0) {
                    btnConfirmar.textContent = `Melhorar (+${diferenca} pontos)`;
                } else {
                    btnConfirmar.textContent = `Reduzir (${diferenca} pontos)`;
                }
                btnConfirmar.disabled = false;
            }
        } else {
            btnConfirmar.textContent = `Aprender (${custo} pontos)`;
        }
    }
    
    select.addEventListener('change', atualizarCustoDisplay);
    atualizarCustoDisplay();
    
    document.querySelector('.modal-tecnica-overlay').style.display = 'block';
    
    window.tecnicaModalData = {
        tecnica: tecnica,
        nhBase: nhBase,
        nhMaximo: nhMaximo,
        jaAprendida: jaAprendida
    };
}

// ===== MODIFICAR: RENDERIZAR TÉCNICAS APRENDIDAS (com indicador) =====
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
    
    let html = '';
    estadoTecnicas.tecnicasAprendidas.forEach(tecnica => {
        const tecnicaOriginal = window.catalogoTecnicas?.obterTodasTecnicas()?.find(t => t.id === tecnica.id);
        const nhMaximo = tecnicaOriginal ? calcularNHMaximoTecnica(tecnicaOriginal) : 0;
        const nhBase = tecnicaOriginal ? calcularNHBaseTecnica(tecnicaOriginal) : 0;
        
        // Verifica se ganhou NH automático (simplificado)
        const ganhouAutomatico = tecnica.nhAnterior && tecnica.nhAtual > tecnica.nhAnterior;
        
        html += `
            <div class="pericia-aprendida-item ${ganhouAutomatico ? 'tecnica-com-bonus' : ''}">
                <div class="pericia-aprendida-header">
                    <h4 class="pericia-aprendida-nome">${tecnica.nome}</h4>
                    <div class="pericia-aprendida-info">
                        <span class="pericia-aprendida-nivel">
                            NH ${tecnica.nhAtual}
                            ${ganhouAutomatico ? ' <span class="bonus-badge" title="NH aumentado pelo atributo">↑</span>' : ''}
                        </span>
                        <span class="pericia-dificuldade dificuldade-${tecnica.dificuldade.toLowerCase()}">
                            ${tecnica.dificuldade}
                        </span>
                        <span class="pericia-aprendida-custo">${tecnica.custoPago} pts</span>
                    </div>
                </div>
                <div class="pericia-requisitos">
                    <small>
                        <strong>Base:</strong> NH ${nhBase} | 
                        <strong>Máximo:</strong> NH ${nhMaximo}
                        ${ganhouAutomatico ? ` | <span class="bonus-text">+${tecnica.nhAtual - tecnica.nhAnterior} do atributo</span>` : ''}
                    </small>
                </div>
                <button class="btn-remover-pericia" data-id="${tecnica.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    document.querySelectorAll('.btn-remover-pericia').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.dataset.id;
            if (confirm('Remover esta técnica? Os pontos serão perdidos.')) {
                estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
                salvarTecnicas();
                renderizarStatusTecnicas();
                renderizarTecnicasAprendidas();
                atualizarTecnicasDisponiveis();
            }
        });
    });
}

// ===== MODIFICAR: SALVAR TÉCNICAS (guarda NH anterior) =====
function salvarTecnicas() {
    try {
        // Salva o NH atual como "anterior" para próxima comparação
        estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.map(t => ({
            ...t,
            nhAnterior: t.nhAtual // Salva como referência
        }));
        
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.tecnicasAprendidas));
        console.log('💾 Técnicas salvas:', estadoTecnicas.tecnicasAprendidas.length);
    } catch (e) {
        console.error('Erro ao salvar técnicas:', e);
    }
}

// ===== MODIFICAR: CARREGAR TÉCNICAS (prepara para monitoramento) =====
function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.tecnicasAprendidas = JSON.parse(salvo);
            console.log('📂 Técnicas carregadas:', estadoTecnicas.tecnicasAprendidas.length);
            
            // Inicializa nhAnterior se não existir
            estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.map(t => ({
                ...t,
                nhAnterior: t.nhAnterior || t.nhAtual
            }));
        }
    } catch (e) {
        console.error('Erro ao carregar técnicas:', e);
    }
}

// ===== ADICIONAR CSS PARA OS INDICADORES =====
function adicionarEstilosTecnicas() {
    const style = document.createElement('style');
    style.textContent = `
        .bonus-badge {
            display: inline-block;
            background: #2ecc71;
            color: white;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            text-align: center;
            line-height: 16px;
            font-size: 10px;
            margin-left: 4px;
            cursor: help;
        }
        
        .bonus-text {
            color: #2ecc71;
            font-weight: bold;
        }
        
        .tecnica-com-bonus {
            border-left: 3px solid #2ecc71;
        }
        
        .bonus-atributo-modal {
            color: #2ecc71;
            margin-left: 5px;
            cursor: help;
        }
        
        .pericia-aprendida-item {
            position: relative;
        }
        
        .pericia-aprendida-item:hover {
            background: rgba(46, 204, 113, 0.05);
        }
    `;
    document.head.appendChild(style);
}

// ===== INICIALIZAR COM MELHORIAS =====
function inicializarSistemaTecnicas() {
    console.log('🚀 Inicializando sistema de técnicas...');
    carregarTecnicas();
    configurarEventListenersTecnicas();
    configurarMonitoramento();
    adicionarEstilosTecnicas(); // Adiciona estilos
    atualizarTecnicasDisponiveis();
    renderizarStatusTecnicas();
    renderizarFiltrosTecnicas();
    renderizarTecnicasAprendidas();
    
    // Dispara uma atualização inicial
    setTimeout(() => {
        atualizarNHsTecnicasAprendidas();
        atualizarTecnicasDisponiveis();
    }, 500);
}

// ===== MANTER O RESTO DO CÓDIGO ORIGINAL (funções não modificadas) =====
// [Aqui ficam todas as outras funções que NÃO foram modificadas:
// calcularCustoTecnica, obterNHPericiaAtual, verificarPreRequisitosTecnica,
// calcularNHBaseTecnica, renderizarStatusTecnicas, renderizarCatalogoTecnicas,
// confirmarTecnica, fecharModalTecnica, configurarEventListenersTecnicas,
// renderizarFiltrosTecnicas, etc...]

// ===== EXPORTAR FUNÇÕES NOVAS =====
window.atualizarNHsTecnicasAprendidas = atualizarNHsTecnicasAprendidas;
window.fecharModalTecnica = fecharModalTecnica;
window.confirmarTecnica = confirmarTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const abaPericias = document.getElementById('pericias');
        
        if (abaPericias) {
            if (abaPericias.style.display !== 'none') {
                inicializarSistemaTecnicas();
            }
            
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (abaPericias.style.display !== 'none') {
                            setTimeout(inicializarSistemaTecnicas, 300);
                        }
                    }
                });
            });
            
            observer.observe(abaPericias, { attributes: true, attributeFilter: ['style'] });
        }
    }, 1000);
});

console.log('✅ técnica.js carregado com sistema de atualização automática de NH!');
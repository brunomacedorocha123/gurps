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
    tecnicasDisponiveis: [],
    // NOVO: Cache dos NHs anteriores para detectar mudanças
    cacheAtributos: { DX: 10, IQ: 10, HT: 10, PERC: 10 }
};

// ===== NOVA FUNÇÃO: VERIFICAR MUDANÇAS NOS ATRIBUTOS =====
function verificarMudancasAtributos() {
    const dadosAtuais = window.obterDadosAtributos ? window.obterDadosAtributos() : null;
    
    if (!dadosAtuais) return false;
    
    // Calcula PERC atual (IQ + bônus de Percepção)
    const percAtual = dadosAtuais.IQ + (dadosAtuais.Bonus?.Percepcao || 0);
    
    const atributosAtuais = {
        DX: dadosAtuais.DX,
        IQ: dadosAtuais.IQ,
        HT: dadosAtuais.HT,
        PERC: percAtual
    };
    
    // Verifica se houve mudança
    let mudou = false;
    for (const [atributo, valor] of Object.entries(atributosAtuais)) {
        if (estadoTecnicas.cacheAtributos[atributo] !== valor) {
            console.log(`📈 Atributo ${atributo} mudou: ${estadoTecnicas.cacheAtributos[atributo]} → ${valor}`);
            mudou = true;
            estadoTecnicas.cacheAtributos[atributo] = valor;
        }
    }
    
    return mudou;
}

// ===== NOVA FUNÇÃO: ATUALIZAR NH DAS TÉCNICAS APRENDIDAS =====
function atualizarNHsTecnicasAprendidas() {
    console.log("🔄 Técnicas: Verificando atualização de NHs...");
    
    if (!estadoTecnicas.tecnicasAprendidas.length) {
        console.log("ℹ️ Nenhuma técnica aprendida para atualizar");
        return;
    }
    
    // Verifica se os atributos mudaram
    if (!verificarMudancasAtributos()) {
        console.log("✅ Atributos inalterados, sem necessidade de atualização");
        return;
    }
    
    console.log("🎯 Atributos alterados, atualizando técnicas...");
    
    let totalAtualizadas = 0;
    
    estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.map(tecnicaAprendida => {
        // Busca a técnica original no catálogo
        const tecnicaOriginal = window.catalogoTecnicas?.obterTodasTecnicas()?.find(t => t.id === tecnicaAprendida.id);
        if (!tecnicaOriginal) return tecnicaAprendida;
        
        // Calcula NOVOS valores baseados nos atributos atuais
        const novoNHBase = calcularNHBaseTecnica(tecnicaOriginal);
        const novoNHMaximo = calcularNHMaximoTecnica(tecnicaOriginal);
        
        // Valor anterior para comparação
        const nhAnterior = tecnicaAprendida.nhAtual;
        
        // REGRA 1: Se estava no máximo antigo, sobe para o novo máximo
        // Para saber o máximo antigo, precisamos do NH da perícia anterior
        const nhMaximoAnterior = calcularNHMaximoTecnica(tecnicaOriginal, true);
        
        let novoNHAtual = nhAnterior;
        
        if (nhAnterior >= nhMaximoAnterior) {
            // Estava no máximo, sobe junto com o máximo
            console.log(`  ↑ ${tecnicaAprendida.nome}: estava no máximo (${nhAnterior}), sobe para novo máximo (${novoNHMaximo})`);
            novoNHAtual = novoNHMaximo;
            totalAtualizadas++;
        }
        else if (novoNHAtual < novoNHBase) {
            // Ficou abaixo do mínimo, ajusta para mínimo
            console.log(`  ⬆️ ${tecnicaAprendida.nome}: abaixo do novo mínimo (${novoNHBase}), ajustando`);
            novoNHAtual = novoNHBase;
            totalAtualizadas++;
        }
        else if (novoNHAtual > novoNHMaximo) {
            // Ficou acima do novo máximo, ajusta para máximo
            console.log(`  ⬇️ ${tecnicaAprendida.nome}: acima do novo máximo (${novoNHMaximo}), ajustando`);
            novoNHAtual = novoNHMaximo;
            totalAtualizadas++;
        }
        
        // Se o NH mudou, registra o anterior
        if (novoNHAtual !== nhAnterior) {
            return {
                ...tecnicaAprendida,
                nhAtual: novoNHAtual,
                nhAnterior: nhAnterior, // Guarda para mostrar na interface
                custoPago: tecnicaAprendida.custoPago // Mantém o custo pago
            };
        }
        
        return tecnicaAprendida;
    });
    
    if (totalAtualizadas > 0) {
        console.log(`✅ ${totalAtualizadas} técnicas atualizadas automaticamente`);
        salvarTecnicas();
        
        // Força atualização da interface
        setTimeout(() => {
            renderizarStatusTecnicas();
            renderizarTecnicasAprendidas();
            atualizarTecnicasDisponiveis();
        }, 100);
    }
}

// ===== MODIFICAR: calcularNHMaximoTecnica COM SUPORTE PARA VALORES ANTERIORES =====
function calcularNHMaximoTecnica(tecnica, usarCache = false) {
    if (!tecnica.preRequisitos || tecnica.preRequisitos.length === 0) return 0;
    
    const prereq = tecnica.preRequisitos[0];
    let periciaAprendida = null;
    
    // Procura a perícia aprendida
    if (prereq.idPericia && window.estadoPericias?.periciasAprendidas) {
        periciaAprendida = window.estadoPericias.periciasAprendidas.find(p => p.id === prereq.idPericia);
    }
    
    // Se não encontrou pelo ID, procura na lista de IDs (Cavalgar)
    if (!periciaAprendida && prereq.idsCavalgar) {
        periciaAprendida = window.estadoPericias.periciasAprendidas.find(p => prereq.idsCavalgar.includes(p.id));
    }
    
    if (!periciaAprendida) return 0;
    
    // Se usarCache é true, retorna o valor do cache (máximo anterior)
    if (usarCache) {
        const atributo = periciaAprendida.atributo;
        const cacheAtual = estadoTecnicas.cacheAtributos[atributo] || 10;
        
        // Se for PERC, precisamos calcular IQ + bônus antigo
        if (atributo === 'PERC') {
            const dadosAntigos = window.obterDadosAtributos ? window.obterDadosAtributos() : null;
            if (dadosAntigos) {
                return cacheAtual + (periciaAprendida.nivel || 0);
            }
        }
        
        return cacheAtual + (periciaAprendida.nivel || 0);
    }
    
    // Valor atual
    return obterNHPericiaAtual(periciaAprendida.id);
}

// ===== MODIFICAR: ATUALIZAÇÃO EM TEMPO REAL =====
function configurarMonitoramento() {
    console.log('🎯 Técnicas: Configurando monitoramento...');
    
    // 1. Escuta mudanças de ATRIBUTOS
    document.addEventListener('atributosAlterados', function(event) {
        console.log('🎯 Técnicas: Evento atributosAlterados disparado');
        
        // Espera um pouco para garantir que as perícias já atualizaram
        setTimeout(() => {
            atualizarNHsTecnicasAprendidas();
            atualizarTecnicasDisponiveis();
            renderizarStatusTecnicas();
            renderizarTecnicasAprendidas();
        }, 200);
    });
    
    // 2. Escuta mudanças de PERÍCIAS
    if (window.estadoPericias) {
        // Cria um observer para o array de perícias aprendidas
        const observerPericias = {
            atual: JSON.stringify(window.estadoPericias.periciasAprendidas || []),
            
            verificar: function() {
                if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) return false;
                
                const agora = JSON.stringify(window.estadoPericias.periciasAprendidas);
                if (this.atual !== agora) {
                    console.log('🎯 Técnicas: Perícias foram alteradas');
                    this.atual = agora;
                    return true;
                }
                return false;
            }
        };
        
        // Verifica a cada 500ms
        setInterval(() => {
            if (observerPericias.verificar()) {
                setTimeout(() => {
                    atualizarNHsTecnicasAprendidas();
                    atualizarTecnicasDisponiveis();
                    renderizarStatusTecnicas();
                    renderizarTecnicasAprendidas();
                }, 200);
            }
        }, 500);
    }
    
    // 3. Escuta eventos de reset
    document.addEventListener('resetPontos', function() {
        console.log('🔄 Técnicas: Sistema resetado, atualizando...');
        setTimeout(() => {
            // Reseta o cache
            estadoTecnicas.cacheAtributos = { DX: 10, IQ: 10, HT: 10, PERC: 10 };
            atualizarNHsTecnicasAprendidas();
            atualizarTecnicasDisponiveis();
        }, 300);
    });
    
    // 4. Inicializa o cache com os valores atuais
    setTimeout(() => {
        const dados = window.obterDadosAtributos ? window.obterDadosAtributos() : null;
        if (dados) {
            const percAtual = dados.IQ + (dados.Bonus?.Percepcao || 0);
            estadoTecnicas.cacheAtributos = {
                DX: dados.DX,
                IQ: dados.IQ,
                HT: dados.HT,
                PERC: percAtual
            };
            console.log('📊 Técnicas: Cache inicializado:', estadoTecnicas.cacheAtributos);
        }
    }, 1000);
}

// ===== MODIFICAR: ATUALIZAR TÉCNICAS DISPONÍVEIS =====
function atualizarTecnicasDisponiveis() {
    if (!window.catalogoTecnicas || !window.catalogoTecnicas.obterTodasTecnicas) {
        console.warn('⚠️ Catálogo de técnicas não disponível');
        return;
    }
    
    console.log('🔍 Atualizando técnicas disponíveis...');
    
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    const disponiveis = [];
    
    todasTecnicas.forEach(tecnica => {
        const verificacao = verificarPreRequisitosTecnica(tecnica);
        const nhBase = calcularNHBaseTecnica(tecnica);
        const nhMaximo = calcularNHMaximoTecnica(tecnica);
        
        const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
        
        // IMPORTANTE: Se já aprendida, usa o NH ATUAL dela (que pode ter sido atualizado)
        // Se não aprendida, mostra o NH BASE
        let nhAtual = nhBase;
        let custoMostrar = 0;
        let ganhouAutomatico = false;
        
        if (jaAprendida) {
            nhAtual = jaAprendida.nhAtual;
            custoMostrar = jaAprendida.custoPago || 0;
            
            // Verifica se ganhou NH automaticamente
            if (jaAprendida.nhAnterior && jaAprendida.nhAtual > jaAprendida.nhAnterior) {
                ganhouAutomatico = true;
                console.log(`🎁 ${tecnica.nome}: Ganhou NH automático (${jaAprendida.nhAnterior} → ${jaAprendida.nhAtual})`);
            }
        } else {
            const niveisAcima = Math.max(0, nhAtual - nhBase);
            custoMostrar = calcularCustoTecnica(niveisAcima, tecnica.dificuldade);
        }
        
        // Garante limites
        nhAtual = Math.min(Math.max(nhAtual, nhBase), nhMaximo);
        
        disponiveis.push({
            ...tecnica,
            disponivel: verificacao.passou,
            nhBase: nhBase,
            nhMaximo: nhMaximo,
            nhAtual: nhAtual,
            custoAtual: custoMostrar,
            jaAprendida: !!jaAprendida,
            motivoIndisponivel: verificacao.motivo,
            ganhouAutomatico: ganhouAutomatico
        });
    });
    
    estadoTecnicas.tecnicasDisponiveis = disponiveis;
    console.log(`✅ ${disponiveis.length} técnicas processadas`);
    renderizarCatalogoTecnicas();
}

// ===== MODIFICAR: RENDERIZAR TÉCNICAS APRENDIDAS (com indicador visual) =====
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) {
        console.warn('⚠️ Container de técnicas aprendidas não encontrado');
        return;
    }
    
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
        // Busca dados atualizados da técnica original
        const tecnicaOriginal = window.catalogoTecnicas?.obterTodasTecnicas()?.find(t => t.id === tecnica.id);
        const nhMaximo = tecnicaOriginal ? calcularNHMaximoTecnica(tecnicaOriginal) : 0;
        const nhBase = tecnicaOriginal ? calcularNHBaseTecnica(tecnicaOriginal) : 0;
        
        // Verifica se ganhou NH automaticamente
        const ganhouAutomatico = tecnica.nhAnterior && tecnica.nhAtual > tecnica.nhAnterior;
        const diferenca = ganhouAutomatico ? tecnica.nhAtual - tecnica.nhAnterior : 0;
        
        // Estilo diferente para técnicas que ganharam bônus
        const classeExtra = ganhouAutomatico ? 'tecnica-com-bonus' : '';
        
        html += `
            <div class="pericia-aprendida-item ${classeExtra}" data-id="${tecnica.id}">
                <div class="pericia-aprendida-header">
                    <h4 class="pericia-aprendida-nome">
                        ${tecnica.nome}
                        ${ganhouAutomatico ? '<span class="bonus-badge" title="NH aumentado pelo atributo">↑</span>' : ''}
                    </h4>
                    <div class="pericia-aprendida-info">
                        <span class="pericia-aprendida-nivel">
                            NH ${tecnica.nhAtual}
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
                        ${ganhouAutomatico ? 
                          ` | <span class="bonus-text" title="Aumento automático do atributo">+${diferenca} (atributo)</span>` 
                          : ''}
                    </small>
                </div>
                <button class="btn-remover-pericia" data-id="${tecnica.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Adiciona eventos de clique para remover
    document.querySelectorAll('.btn-remover-pericia').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.dataset.id;
            removerTecnica(id);
        });
    });
    
    // Adiciona eventos de clique para editar
    document.querySelectorAll('.pericia-aprendida-item[data-id]').forEach(item => {
        item.addEventListener('click', function(e) {
            if (!e.target.closest('.btn-remover-pericia')) {
                const id = this.dataset.id;
                const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id) ||
                               estadoTecnicas.tecnicasAprendidas.find(t => t.id === id);
                if (tecnica) abrirModalTecnica(tecnica);
            }
        });
    });
    
    console.log(`✅ ${estadoTecnicas.tecnicasAprendidas.length} técnicas aprendidas renderizadas`);
}

// ===== NOVA FUNÇÃO: REMOVER TÉCNICA =====
function removerTecnica(id) {
    const tecnica = estadoTecnicas.tecnicasAprendidas.find(t => t.id === id);
    if (!tecnica) return;
    
    if (confirm(`Remover a técnica "${tecnica.nome}"?\nVocê perderá ${tecnica.custoPago} pontos investidos.`)) {
        estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.filter(t => t.id !== id);
        salvarTecnicas();
        renderizarStatusTecnicas();
        renderizarTecnicasAprendidas();
        atualizarTecnicasDisponiveis();
        
        // Atualiza pontos totais se a função existir
        if (window.atualizarPontosTotais) {
            window.atualizarPontosTotais();
        }
        
        console.log(`🗑️ Técnica "${tecnica.nome}" removida`);
    }
}

// ===== MODIFICAR: ABRIR MODAL TÉCNICA (mostra info de atualização) =====
function abrirModalTecnica(tecnica) {
    if (!tecnica) return;
    
    console.log(`📖 Abrindo modal da técnica: ${tecnica.nome}`);
    
    const verificacao = verificarPreRequisitosTecnica(tecnica);
    const nhBase = calcularNHBaseTecnica(tecnica);
    const nhMaximo = calcularNHMaximoTecnica(tecnica);
    
    const jaAprendida = estadoTecnicas.tecnicasAprendidas.find(t => t.id === tecnica.id);
    const nhAtual = jaAprendida ? jaAprendida.nhAtual : nhBase;
    
    const modal = document.querySelector('.modal-tecnica');
    if (!modal) {
        console.error('❌ Modal de técnica não encontrado');
        return;
    }
    
    // Verifica se ganhou NH automático
    const ganhouAutomatico = jaAprendida && jaAprendida.nhAnterior && jaAprendida.nhAtual > jaAprendida.nhAnterior;
    
    let indicadorBonus = '';
    if (ganhouAutomatico) {
        indicadorBonus = `<span class="bonus-atributo-modal" title="NH aumentado automaticamente pelo atributo">[+${jaAprendida.nhAtual - jaAprendida.nhAnterior}]</span>`;
    }
    
    modal.innerHTML = `
        <div class="modal-header-pericia">
            <span class="modal-close" onclick="fecharModalTecnica()">&times;</span>
            <h3>${tecnica.nome} ${jaAprendida ? '(Aprendida)' : ''} ${indicadorBonus}</h3>
            <div class="modal-subtitulo">
                ${tecnica.dificuldade} • Base: -4 (NH ${nhBase})
            </div>
        </div>
        
        <div class="modal-body-pericia">
            <div class="nivel-selecao-container">
                <div class="nivel-info-box">
                    <div class="nivel-info-item">
                        <label>Nível Base:</label>
                        <div class="nivel-valor-grande">NH ${nhBase}</div>
                        <small>(Atributo - 4)</small>
                    </div>
                    <div class="nivel-info-item">
                        <label>Nível Máximo:</label>
                        <div class="nivel-valor-grande">NH ${nhMaximo}</div>
                        <small>(NH da perícia)</small>
                    </div>
                    <div class="nivel-info-item">
                        <label>Nível Atual:</label>
                        <div class="nivel-valor-grande">NH ${nhAtual}</div>
                        ${ganhouAutomatico ? 
                          `<small title="Aumento automático">(+${jaAprendida.nhAtual - jaAprendida.nhAnterior} do atributo)</small>` : 
                          ''}
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
                                const custoAnterior = jaAprendida ? jaAprendida.custoPago : 0;
                                const diferenca = custo - custoAnterior;
                                
                                let texto = `NH ${nh} (${custo} pontos)`;
                                if (jaAprendida && nh === nhAtual) {
                                    texto = `NH ${nh} (Atual - ${custo} pontos)`;
                                } else if (jaAprendida && diferenca > 0) {
                                    texto = `NH ${nh} (+${diferenca} pontos)`;
                                } else if (jaAprendida && diferenca < 0) {
                                    texto = `NH ${nh} (${diferenca} pontos - devolução)`;
                                }
                                
                                options += `<option value="${nh}" data-custo="${custo}" data-diferenca="${diferenca}" ${selected}>${texto}</option>`;
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
            
            ${ganhouAutomatico ? `
            <div class="info-bonus-atributo">
                <i class="fas fa-arrow-up"></i>
                <div>
                    <strong>Bônus de Atributo Aplicado</strong>
                    <p>O NH desta técnica aumentou automaticamente de ${jaAprendida.nhAnterior} para ${jaAprendida.nhAtual} devido ao aumento do atributo base.</p>
                </div>
            </div>
            ` : ''}
            
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
        const diferenca = parseInt(selectedOption.dataset.diferenca);
        const nhEscolhido = parseInt(select.value);
        
        custoDisplay.textContent = `${custo} pontos`;
        
        if (jaAprendida) {
            const custoAtual = jaAprendida.custoPago || 0;
            
            if (nhEscolhido === jaAprendida.nhAtual) {
                // Mesmo nível atual
                btnConfirmar.textContent = `Manter (${custo} pontos)`;
                btnConfirmar.disabled = true;
                custoDisplay.innerHTML = `<span class="custo-ja-pago">${custo} pontos (já investidos)</span>`;
            } else if (diferenca > 0) {
                // Melhoria - precisa pagar mais
                btnConfirmar.textContent = `Melhorar (+${diferenca} pontos)`;
                btnConfirmar.disabled = false;
                custoDisplay.innerHTML = `<span class="custo-melhoria">${custo} pontos (+${diferenca})</span>`;
            } else if (diferenca < 0) {
                // Redução - recebe pontos de volta
                btnConfirmar.textContent = `Reduzir (${diferenca} pontos)`;
                btnConfirmar.disabled = false;
                custoDisplay.innerHTML = `<span class="custo-reducao">${custo} pontos (${diferenca})</span>`;
            } else {
                // Custo igual (teórico)
                btnConfirmar.textContent = `Atualizar (0 pontos)`;
                btnConfirmar.disabled = false;
            }
        } else {
            // Nova técnica
            btnConfirmar.textContent = `Aprender (${custo} pontos)`;
            btnConfirmar.disabled = false;
        }
    }
    
    select.addEventListener('change', atualizarCustoDisplay);
    atualizarCustoDisplay();
    
    document.querySelector('.modal-tecnica-overlay').style.display = 'block';
    
    window.tecnicaModalData = {
        tecnica: tecnica,
        nhBase: nhBase,
        nhMaximo: nhMaximo,
        jaAprendida: jaAprendida,
        ganhouAutomatico: ganhouAutomatico
    };
    
    console.log(`✅ Modal da técnica "${tecnica.nome}" aberto`);
}

// ===== MODIFICAR: CONFIRMAR TÉCNICA (preserva nhAnterior) =====
function confirmarTecnica() {
    if (!window.tecnicaModalData) {
        console.error('❌ Dados do modal não encontrados');
        return;
    }
    
    const { tecnica, jaAprendida, nhBase } = window.tecnicaModalData;
    const select = document.getElementById('seletor-nh-tecnica');
    const nhEscolhido = parseInt(select.value);
    
    if (isNaN(nhEscolhido)) {
        alert('Erro: Nível inválido selecionado');
        return;
    }
    
    const niveisAcima = nhEscolhido - nhBase;
    const custo = calcularCustoTecnica(niveisAcima, tecnica.dificuldade);
    
    // Verifica se é a mesma coisa que já tem
    if (jaAprendida && nhEscolhido === jaAprendida.nhAtual) {
        console.log('ℹ️ Nenhuma alteração, mantendo técnica como está');
        fecharModalTecnica();
        return;
    }
    
    const index = estadoTecnicas.tecnicasAprendidas.findIndex(t => t.id === tecnica.id);
    
    if (index >= 0) {
        // Atualiza técnica existente
        const tecnicaAtual = estadoTecnicas.tecnicasAprendidas[index];
        estadoTecnicas.tecnicasAprendidas[index] = {
            ...tecnicaAtual,
            nhAtual: nhEscolhido,
            nhAnterior: tecnicaAtual.nhAtual, // Preserva o anterior para referência
            custoPago: custo,
            ultimaAtualizacao: new Date().toISOString()
        };
        console.log(`✏️ Técnica "${tecnica.nome}" atualizada para NH ${nhEscolhido}`);
    } else {
        // Adiciona nova técnica
        estadoTecnicas.tecnicasAprendidas.push({
            id: tecnica.id,
            nome: tecnica.nome,
            descricao: tecnica.descricao,
            dificuldade: tecnica.dificuldade,
            preRequisitos: tecnica.preRequisitos,
            nhAtual: nhEscolhido,
            nhAnterior: nhBase, // Para nova, o anterior é a base
            custoPago: custo,
            dataAprendizado: new Date().toISOString()
        });
        console.log(`🎓 Nova técnica "${tecnica.nome}" aprendida com NH ${nhEscolhido}`);
    }
    
    fecharModalTecnica();
    salvarTecnicas();
    renderizarStatusTecnicas();
    renderizarTecnicasAprendidas();
    atualizarTecnicasDisponiveis();
    
    // Atualiza pontos totais
    if (window.atualizarPontosTotais) {
        window.atualizarPontosTotais();
    }
}

// ===== NOVO: ADICIONAR ESTILOS PARA OS INDICADORES VISUAIS =====
function adicionarEstilosTecnicas() {
    // Verifica se já adicionamos os estilos
    if (document.getElementById('estilos-tecnicas-dinamicas')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'estilos-tecnicas-dinamicas';
    style.textContent = `
        /* Indicador de bônus de atributo */
        .bonus-badge {
            display: inline-block;
            background: linear-gradient(135deg, #2ecc71, #27ae60);
            color: white;
            border-radius: 12px;
            padding: 2px 8px;
            font-size: 10px;
            font-weight: bold;
            margin-left: 6px;
            vertical-align: middle;
            box-shadow: 0 2px 4px rgba(46, 204, 113, 0.3);
            cursor: help;
            animation: pulse-green 2s infinite;
        }
        
        .bonus-text {
            color: #27ae60;
            font-weight: bold;
            background: rgba(46, 204, 113, 0.1);
            padding: 1px 4px;
            border-radius: 3px;
            margin-left: 4px;
        }
        
        .tecnica-com-bonus {
            border-left: 3px solid #2ecc71 !important;
            background: linear-gradient(90deg, rgba(46, 204, 113, 0.05), transparent) !important;
        }
        
        .bonus-atributo-modal {
            color: #2ecc71;
            font-weight: bold;
            background: rgba(46, 204, 113, 0.1);
            padding: 2px 6px;
            border-radius: 4px;
            margin-left: 8px;
            font-size: 0.9em;
        }
        
        .info-bonus-atributo {
            background: linear-gradient(135deg, rgba(46, 204, 113, 0.1), rgba(39, 174, 96, 0.05));
            border: 1px solid #2ecc71;
            border-radius: 8px;
            padding: 12px;
            margin: 15px 0;
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }
        
        .info-bonus-atributo i {
            color: #2ecc71;
            font-size: 1.2em;
            margin-top: 2px;
        }
        
        .info-bonus-atributo strong {
            color: #27ae60;
            display: block;
            margin-bottom: 4px;
        }
        
        .info-bonus-atributo p {
            margin: 0;
            color: #2c3e50;
            font-size: 0.95em;
        }
        
        /* Cores para custos */
        .custo-ja-pago {
            color: #7f8c8d;
            font-weight: bold;
        }
        
        .custo-melhoria {
            color: #e67e22;
            font-weight: bold;
        }
        
        .custo-reducao {
            color: #3498db;
            font-weight: bold;
        }
        
        .custo-novo {
            color: #2ecc71;
            font-weight: bold;
        }
        
        /* Animação para o badge */
        @keyframes pulse-green {
            0% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.7); }
            70% { box-shadow: 0 0 0 6px rgba(46, 204, 113, 0); }
            100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
        }
        
        /* Hover para técnicas com bônus */
        .tecnica-com-bonus:hover {
            background: linear-gradient(90deg, rgba(46, 204, 113, 0.1), rgba(46, 204, 113, 0.05)) !important;
            transform: translateX(2px);
            transition: all 0.2s ease;
        }
    `;
    
    document.head.appendChild(style);
    console.log('🎨 Estilos dinâmicos para técnicas adicionados');
}

// ===== MODIFICAR: INICIALIZAR SISTEMA DE TÉCNICAS =====
function inicializarSistemaTecnicas() {
    console.log('🚀 Inicializando sistema de técnicas...');
    
    carregarTecnicas();
    configurarEventListenersTecnicas();
    configurarMonitoramento();
    adicionarEstilosTecnicas();
    atualizarTecnicasDisponiveis();
    renderizarStatusTecnicas();
    renderizarFiltrosTecnicas();
    renderizarTecnicasAprendidas();
    
    // Força uma verificação inicial após 1 segundo
    setTimeout(() => {
        console.log('🔍 Verificação inicial de atualizações...');
        atualizarNHsTecnicasAprendidas();
        atualizarTecnicasDisponiveis();
    }, 1000);
    
    console.log('✅ Sistema de técnicas inicializado');
}

// [CONTINUAÇÃO NO PRÓXIMO COMENTÁRIO...]
// ===== MODIFICAR: SALVAR TÉCNICAS (guarda histórico) =====
function salvarTecnicas() {
    try {
        // Adiciona timestamp e versão para debug
        const dadosParaSalvar = {
            versao: '2.0',
            timestamp: new Date().toISOString(),
            tecnicas: estadoTecnicas.tecnicasAprendidas.map(t => ({
                ...t,
                _ultimaAtualizacao: new Date().toISOString()
            }))
        };
        
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(dadosParaSalvar));
        console.log('💾 Técnicas salvas:', estadoTecnicas.tecnicasAprendidas.length, 'técnicas');
        
        // Dispara evento para outras partes do sistema
        document.dispatchEvent(new CustomEvent('tecnicasSalvas', {
            detail: { quantidade: estadoTecnicas.tecnicasAprendidas.length }
        }));
    } catch (e) {
        console.error('❌ Erro ao salvar técnicas:', e);
    }
}

// ===== MODIFICAR: CARREGAR TÉCNICAS (compatibilidade) =====
function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (!salvo) {
            console.log('📂 Nenhuma técnica salva encontrada');
            return;
        }
        
        const dados = JSON.parse(salvo);
        
        // Suporte para formato antigo (array direto) e novo (objeto com versão)
        if (Array.isArray(dados)) {
            // Formato antigo
            estadoTecnicas.tecnicasAprendidas = dados.map(tecnica => ({
                ...tecnica,
                nhAnterior: tecnica.nhAnterior || tecnica.nhAtual || 0
            }));
            console.log('📂 Técnicas carregadas (formato antigo):', dados.length);
        } else if (dados.tecnicas && Array.isArray(dados.tecnicas)) {
            // Formato novo
            estadoTecnicas.tecnicasAprendidas = dados.tecnicas;
            console.log('📂 Técnicas carregadas (formato v' + dados.versao + '):', dados.tecnicas.length);
        }
        
        // Garante que todas as técnicas tenham nhAnterior
        estadoTecnicas.tecnicasAprendidas = estadoTecnicas.tecnicasAprendidas.map(t => ({
            ...t,
            nhAnterior: t.nhAnterior || t.nhAtual || 0
        }));
        
    } catch (e) {
        console.error('❌ Erro ao carregar técnicas:', e);
        estadoTecnicas.tecnicasAprendidas = [];
    }
}

// ===== MODIFICAR: OBTER NH DA PERÍCIA (VERSÃO MELHORADA) =====
function obterNHPericiaAtual(idPericia) {
    if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
        console.warn('⚠️ estadoPericias não disponível para obter NH');
        return 0;
    }
    
    const pericia = window.estadoPericias.periciasAprendidas.find(p => p.id === idPericia);
    if (!pericia) {
        console.warn(`⚠️ Perícia com ID ${idPericia} não encontrada`);
        return 0;
    }
    
    let atributoBase = 10;
    
    if (window.obterDadosAtributos) {
        const dadosAtributos = window.obterDadosAtributos();
        if (dadosAtributos) {
            switch(pericia.atributo) {
                case 'DX': 
                    atributoBase = dadosAtributos.DX || 10;
                    break;
                case 'IQ': 
                    atributoBase = dadosAtributos.IQ || 10;
                    break;
                case 'HT': 
                    atributoBase = dadosAtributos.HT || 10;
                    break;
                case 'PERC': 
                    // PERC é IQ + bônus de Percepção
                    const iqBase = dadosAtributos.IQ || 10;
                    const bonusPercepcao = dadosAtributos.Bonus?.Percepcao || 0;
                    atributoBase = iqBase + bonusPercepcao;
                    break;
                default:
                    console.warn(`⚠️ Atributo desconhecido: ${pericia.atributo}`);
            }
        }
    } else {
        console.warn('⚠️ obterDadosAtributos não disponível');
    }
    
    const nh = atributoBase + (pericia.nivel || 0);
    
    // Debug: mostra cálculo detalhado
    console.log(`🔍 Cálculo NH ${pericia.nome}: ${atributoBase} (${pericia.atributo}) + ${pericia.nivel || 0} = NH ${nh}`);
    
    return nh;
}

// ===== MODIFICAR: CALCULAR NH BASE (otimizado) =====
function calcularNHBaseTecnica(tecnica) {
    if (!tecnica.preRequisitos || tecnica.preRequisitos.length === 0) {
        console.warn(`⚠️ Técnica ${tecnica.nome} sem pré-requisitos`);
        return 0;
    }
    
    const prereq = tecnica.preRequisitos[0];
    let periciaAprendida = null;
    
    // Procura a perícia aprendida
    if (prereq.idPericia && window.estadoPericias?.periciasAprendidas) {
        periciaAprendida = window.estadoPericias.periciasAprendidas.find(p => p.id === prereq.idPericia);
    }
    
    // Se não encontrou, procura na lista de IDs (Cavalgar)
    if (!periciaAprendida && prereq.idsCavalgar) {
        periciaAprendida = window.estadoPericias.periciasAprendidas.find(p => prereq.idsCavalgar.includes(p.id));
    }
    
    if (!periciaAprendida) {
        console.log(`⚠️ Perícia base não encontrada para técnica ${tecnica.nome}`);
        return 0;
    }
    
    const nhPericia = obterNHPericiaAtual(periciaAprendida.id);
    const nhBase = Math.max(0, nhPericia - 4);
    
    console.log(`📐 Base técnica ${tecnica.nome}: NH ${nhPericia} - 4 = NH ${nhBase}`);
    
    return nhBase;
}

// ===== MODIFICAR: RENDERIZAR CATÁLOGO (com indicadores) =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.warn('⚠️ Container de catálogo de técnicas não encontrado');
        return;
    }
    
    let tecnicasFiltradas = estadoTecnicas.tecnicasDisponiveis;
    
    // Aplica filtros
    if (estadoTecnicas.filtroAtivo === 'medio-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Média');
    } else if (estadoTecnicas.filtroAtivo === 'dificil-tecnicas') {
        tecnicasFiltradas = tecnicasFiltradas.filter(t => t.dificuldade === 'Difícil');
    }
    
    // Aplica busca
    if (estadoTecnicas.buscaAtiva.trim() !== '') {
        const termo = estadoTecnicas.buscaAtiva.toLowerCase();
        tecnicasFiltradas = tecnicasFiltradas.filter(t => 
            t.nome.toLowerCase().includes(termo) ||
            (t.descricao && t.descricao.toLowerCase().includes(termo)) ||
            (t.preRequisitos && t.preRequisitos.some(p => 
                p.nomePericia.toLowerCase().includes(termo)
            ))
        );
    }
    
    if (tecnicasFiltradas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia">
                <i class="fas fa-info-circle"></i>
                <div>${estadoTecnicas.buscaAtiva ? 'Nenhuma técnica encontrada' : 'Aprenda perícias primeiro'}</div>
                <small>${estadoTecnicas.buscaAtiva ? 'Tente outro termo de busca' : 'As técnicas aparecerão aqui quando você tiver as perícias necessárias'}</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    tecnicasFiltradas.forEach(tecnica => {
        const disponivel = tecnica.disponivel;
        const jaAprendida = tecnica.jaAprendida;
        const ganhouAutomatico = tecnica.ganhouAutomatico;
        
        // Classe CSS baseada no status
        let classeStatus = '';
        if (jaAprendida) {
            classeStatus = 'tecnica-aprendida';
            if (ganhouAutomatico) {
                classeStatus += ' tecnica-com-bonus';
            }
        } else if (!disponivel) {
            classeStatus = 'tecnica-indisponivel';
        }
        
        // Ícone de status
        let iconeStatus = '';
        if (jaAprendida) {
            iconeStatus = '<i class="fas fa-check-circle" style="color: #2ecc71; margin-left: 5px;"></i>';
            if (ganhouAutomatico) {
                iconeStatus = '<i class="fas fa-arrow-up" style="color: #27ae60; margin-left: 5px;" title="NH aumentado pelo atributo"></i>';
            }
        } else if (!disponivel) {
            iconeStatus = '<i class="fas fa-lock" style="color: #e74c3c; margin-left: 5px;"></i>';
        }
        
        html += `
            <div class="pericia-item ${classeStatus}" data-id="${tecnica.id}" 
                 style="cursor: ${disponivel ? 'pointer' : 'not-allowed'}; 
                        opacity: ${disponivel ? '1' : '0.7'}">
                <div class="pericia-header">
                    <h4 class="pericia-nome">
                        ${tecnica.nome}
                        ${iconeStatus}
                    </h4>
                    <div class="pericia-info">
                        <span class="pericia-dificuldade dificuldade-${tecnica.dificuldade.toLowerCase()}">
                            ${tecnica.dificuldade}
                        </span>
                        ${disponivel ? `
                            <span class="pericia-custo">
                                ${jaAprendida ? 'NH ' + tecnica.nhAtual : 'Base NH ' + tecnica.nhBase}
                            </span>
                        ` : ''}
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
                        <strong>${jaAprendida ? 'Nível Atual' : 'Nível Base'}:</strong> 
                        NH ${tecnica.nhAtual} | 
                        <strong>Máximo:</strong> NH ${tecnica.nhMaximo}
                        ${ganhouAutomatico ? ' | <span class="bonus-text">+bônus</span>' : ''}
                    </small>
                    <br>
                    <small>
                        <strong>Pré-requisito:</strong> 
                        ${tecnica.preRequisitos.map(p => `${p.nomePericia} ${p.nivelMinimo}+`).join(', ')}
                    </small>
                </div>
                `}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Adiciona eventos de clique
    document.querySelectorAll('.pericia-item[data-id]').forEach(item => {
        if (item.style.cursor === 'pointer') {
            item.addEventListener('click', function() {
                const id = this.dataset.id;
                const tecnica = estadoTecnicas.tecnicasDisponiveis.find(t => t.id === id);
                if (tecnica) {
                    abrirModalTecnica(tecnica);
                }
            });
        }
    });
    
    console.log(`📚 Catálogo renderizado: ${tecnicasFiltradas.length} técnicas (${estadoTecnicas.filtroAtivo})`);
}

// ===== FUNÇÃO AUXILIAR: FORÇAR ATUALIZAÇÃO COMPLETA =====
function forcarAtualizacaoTecnicas() {
    console.log('🔧 Forçando atualização completa das técnicas...');
    
    // Atualiza cache de atributos
    const dados = window.obterDadosAtributos ? window.obterDadosAtributos() : null;
    if (dados) {
        const percAtual = dados.IQ + (dados.Bonus?.Percepcao || 0);
        estadoTecnicas.cacheAtributos = {
            DX: dados.DX,
            IQ: dados.IQ,
            HT: dados.HT,
            PERC: percAtual
        };
    }
    
    // Recalcula todas as técnicas
    atualizarNHsTecnicasAprendidas();
    atualizarTecnicasDisponiveis();
    renderizarStatusTecnicas();
    renderizarTecnicasAprendidas();
    renderizarCatalogoTecnicas();
    
    console.log('✅ Atualização forçada concluída');
}

// ===== FUNÇÃO DE DEBUG: MOSTRAR ESTADO DAS TÉCNICAS =====
function debugTecnicas() {
    console.group('🔍 DEBUG - Estado das Técnicas');
    console.log('📊 Técnicas Aprendidas:', estadoTecnicas.tecnicasAprendidas.length);
    
    estadoTecnicas.tecnicasAprendidas.forEach((t, i) => {
        console.log(`  ${i+1}. ${t.nome}: NH ${t.nhAtual} (anterior: ${t.nhAnterior}) - ${t.custoPago} pts`);
    });
    
    console.log('📊 Cache de Atributos:', estadoTecnicas.cacheAtributos);
    console.log('📊 Técnicas Disponíveis:', estadoTecnicas.tecnicasDisponiveis.length);
    console.groupEnd();
}

// ===== CONFIGURAR EVENT LISTENERS (melhorado) =====
function configurarEventListenersTecnicas() {
    console.log('🎮 Configurando event listeners das técnicas...');
    
    // Filtros
    const filtroButtons = document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]');
    filtroButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const filtro = this.dataset.filtro;
            if (estadoTecnicas.filtroAtivo !== filtro) {
                estadoTecnicas.filtroAtivo = filtro;
                renderizarFiltrosTecnicas();
                renderizarCatalogoTecnicas();
                console.log(`🎯 Filtro alterado para: ${filtro}`);
            }
        });
    });
    
    // Busca
    const buscaInput = document.getElementById('busca-tecnicas');
    if (buscaInput) {
        let buscaTimeout;
        buscaInput.addEventListener('input', function() {
            clearTimeout(buscaTimeout);
            buscaTimeout = setTimeout(() => {
                estadoTecnicas.buscaAtiva = this.value;
                renderizarCatalogoTecnicas();
                console.log(`🔍 Busca: "${this.value}"`);
            }, 300);
        });
    }
    
    // Overlay do modal
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                fecharModalTecnica();
            }
        });
    }
    
    // Tecla ESC para fechar modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fecharModalTecnica();
        }
    });
    
    // Botão de debug (opcional - adicione um botão no HTML se quiser)
    const debugBtn = document.getElementById('debug-tecnicas-btn');
    if (debugBtn) {
        debugBtn.addEventListener('click', debugTecnicas);
    }
    
    // Botão de forçar atualização (opcional)
    const atualizarBtn = document.getElementById('atualizar-tecnicas-btn');
    if (atualizarBtn) {
        atualizarBtn.addEventListener('click', forcarAtualizacaoTecnicas);
    }
    
    console.log('✅ Event listeners configurados');
}

// ===== RENDERIZAR FILTROS =====
function renderizarFiltrosTecnicas() {
    const filtroButtons = document.querySelectorAll('.filtro-btn[data-filtro*="tecnicas"]');
    filtroButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filtro === estadoTecnicas.filtroAtivo) {
            btn.classList.add('active');
        }
    });
}

// ===== EXPORTAR FUNÇÕES PARA GLOBAL =====
window.fecharModalTecnica = fecharModalTecnica;
window.confirmarTecnica = confirmarTecnica;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;
window.forcarAtualizacaoTecnicas = forcarAtualizacaoTecnicas;
window.debugTecnicas = debugTecnicas;
window.obterDadosTecnicas = function() {
    return {
        tecnicasAprendidas: estadoTecnicas.tecnicasAprendidas,
        pontosTotal: estadoTecnicas.pontosTecnicasTotal,
        quantidadeTotal: estadoTecnicas.qtdTotal,
        cacheAtributos: estadoTecnicas.cacheAtributos
    };
};

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado, preparando inicialização das técnicas...');
    
    const abaPericias = document.getElementById('pericias');
    
    if (abaPericias) {
        if (abaPericias.style.display !== 'none') {
            // Aba já visível
            setTimeout(() => {
                inicializarSistemaTecnicas();
            }, 500);
        }
        
        // Observa mudanças na aba
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    if (abaPericias.style.display !== 'none') {
                        console.log('👁️ Aba de técnicas tornada visível');
                        setTimeout(() => {
                            if (!window.sistemaTecnicasInicializado) {
                                inicializarSistemaTecnicas();
                                window.sistemaTecnicasInicializado = true;
                            } else {
                                // Já inicializado, apenas atualiza
                                forcarAtualizacaoTecnicas();
                            }
                        }, 300);
                    }
                }
            });
        });
        
        observer.observe(abaPericias, { attributes: true, attributeFilter: ['style'] });
    } else {
        console.warn('⚠️ Aba de perícias/tecnicas não encontrada, tentando inicializar diretamente...');
        setTimeout(() => {
            inicializarSistemaTecnicas();
        }, 1000);
    }
    
    // Inicialização tardia para garantir dependências
    setTimeout(() => {
        if (!window.sistemaTecnicasInicializado) {
            console.log('⏰ Inicialização tardia das técnicas...');
            inicializarSistemaTecnicas();
            window.sistemaTecnicasInicializado = true;
        }
    }, 2000);
});

console.log('✅ técnica.js carregado - Sistema de Atualização Automática de NH');

// Adiciona uma função global para testes
window.testeAtualizacaoNH = function() {
    console.log('🧪 Testando atualização de NH...');
    
    // Simula mudança de atributo
    const dadosAntigos = { ...estadoTecnicas.cacheAtributos };
    estadoTecnicas.cacheAtributos.DX += 1;
    estadoTecnicas.cacheAtributos.IQ += 1;
    
    console.log('📈 Atributos alterados simulados:');
    console.log('  DX:', dadosAntigos.DX, '→', estadoTecnicas.cacheAtributos.DX);
    console.log('  IQ:', dadosAntigos.IQ, '→', estadoTecnicas.cacheAtributos.IQ);
    
    forcarAtualizacaoTecnicas();
    
    alert('Teste de atualização executado! Verifique o console e a lista de técnicas.');
};
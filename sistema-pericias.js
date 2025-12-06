// ===== SISTEMA DE PERÍCIAS - VERSÃO COM INVESTIMENTO ACUMULADO =====

// Estado do sistema
let estadoPericias = {
    pontosPericias: 0,
    pontosCombate: 0,
    totalPericias: 0,
    totalCombate: 0,
    totalDX: 0,
    periciasAprendidas: [],
    filtroAtivo: 'todas',
    buscaAtiva: '',
    atributos: {
        DX: 10,
        IQ: 10,
        HT: 10,
        PERC: 10
    },
    modalPericiaAtiva: null,
    modalEspecializacaoAtiva: null,
    especializacaoSelecionada: null,
    nivelPericia: 0
};

// ===== TABELA DE CUSTOS EXATA =====
function obterTabelaCusto(dificuldade) {
    const tabela = {
        'Fácil': [
            { nivel: 0, custo: 1 }, { nivel: 1, custo: 2 }, { nivel: 2, custo: 4 },
            { nivel: 3, custo: 8 }, { nivel: 4, custo: 12 }, { nivel: 5, custo: 16 },
            { nivel: 6, custo: 20 }, { nivel: 7, custo: 24 }, { nivel: 8, custo: 28 },
            { nivel: 9, custo: 32 }, { nivel: 10, custo: 36 }
        ],
        'Média': [
            { nivel: -1, custo: 1 }, { nivel: 0, custo: 2 }, { nivel: 1, custo: 4 },
            { nivel: 2, custo: 8 }, { nivel: 3, custo: 12 }, { nivel: 4, custo: 16 },
            { nivel: 5, custo: 20 }, { nivel: 6, custo: 24 }, { nivel: 7, custo: 28 },
            { nivel: 8, custo: 32 }, { nivel: 9, custo: 36 }, { nivel: 10, custo: 40 }
        ],
        'Difícil': [
            { nivel: -2, custo: 1 }, { nivel: -1, custo: 2 }, { nivel: 0, custo: 4 },
            { nivel: 1, custo: 8 }, { nivel: 2, custo: 12 }, { nivel: 3, custo: 16 },
            { nivel: 4, custo: 20 }, { nivel: 5, custo: 24 }, { nivel: 6, custo: 28 },
            { nivel: 7, custo: 32 }, { nivel: 8, custo: 36 }, { nivel: 9, custo: 40 },
            { nivel: 10, custo: 44 }
        ],
        'Muito Difícil': [
            { nivel: -3, custo: 1 }, { nivel: -2, custo: 2 }, { nivel: -1, custo: 4 },
            { nivel: 0, custo: 8 }, { nivel: 1, custo: 12 }, { nivel: 2, custo: 16 },
            { nivel: 3, custo: 20 }, { nivel: 4, custo: 24 }, { nivel: 5, custo: 28 },
            { nivel: 6, custo: 32 }, { nivel: 7, custo: 36 }, { nivel: 8, custo: 40 },
            { nivel: 9, custo: 44 }, { nivel: 10, custo: 48 }
        ]
    };
    
    return tabela[dificuldade] || tabela['Média'];
}

function calcularCustoPericia(nivel, dificuldade) {
    const tabelaCusto = obterTabelaCusto(dificuldade);
    const entrada = tabelaCusto.find(item => item.nivel === nivel);
    return entrada ? entrada.custo : 0;
}

function getInfoRedutores(dificuldade) {
    const infos = {
        "Fácil": "1 ponto = Atributo+0 | 2 pontos = Atributo+1 | 4 pontos = Atributo+2",
        "Média": "1 ponto = Atributo-1 | 2 pontos = Atributo+0 | 4 pontos = Atributo+1",  
        "Difícil": "1 ponto = Atributo-2 | 2 pontos = Atributo-1 | 4 pontos = Atributo+0",
        "Muito Difícil": "1 ponto = Atributo-3 | 2 pontos = Atributo-2 | 4 pontos = Atributo-1 | 8 pontos = Atributo+0"
    };
    return infos[dificuldade] || infos["Média"];
}

function getNiveisDisponiveis(dificuldade) {
    const tabela = obterTabelaCusto(dificuldade);
    return tabela.map(item => ({
        nivel: item.nivel,
        custo: item.custo,
        texto: `${item.nivel >= 0 ? '+' : ''}${item.nivel} (${item.custo} ponto${item.custo !== 1 ? 's' : ''})`
    }));
}

// ===== FUNÇÃO NOVA: OBTER CUSTO PARA EVOLUIR =====
function obterCustoParaEvoluir(periciaEditando = null, nivelDesejado, dificuldade) {
    const tabelaCusto = obterTabelaCusto(dificuldade);
    const entradaDesejada = tabelaCusto.find(item => item.nivel === nivelDesejado);
    
    if (!entradaDesejada) return 0;
    
    if (!periciaEditando) {
        // Se é uma perícia nova, paga o custo completo
        return entradaDesejada.custo;
    }
    
    // Se já existe, verifica se tem investimento acumulado
    if (periciaEditando.investimentoAcumulado !== undefined) {
        // Se tem investimento acumulado, calcula diferença
        const diferenca = entradaDesejada.custo - periciaEditando.investimentoAcumulado;
        return Math.max(0, diferenca);
    } else {
        // Se não tem investimento acumulado (perícias antigas), calcula baseado no nível
        const entradaAtual = tabelaCusto.find(item => item.nivel === periciaEditando.nivel);
        if (!entradaAtual) return entradaDesejada.custo;
        
        const diferenca = entradaDesejada.custo - entradaAtual.custo;
        return Math.max(0, diferenca);
    }
}

// ===== FUNÇÃO NOVA: OBTER INFO DETALHADA DA PROGRESSÃO =====
function obterInfoProgressaoPericia(periciaEditando = null, nivelDesejado, dificuldade) {
    const tabelaCusto = obterTabelaCusto(dificuldade);
    const entradaDesejada = tabelaCusto.find(item => item.nivel === nivelDesejado);
    
    if (!entradaDesejada) return null;
    
    const custoTotalDesejado = entradaDesejada.custo;
    let investimentoAtual = 0;
    let custoAPagar = custoTotalDesejado;
    
    if (periciaEditando) {
        if (periciaEditando.investimentoAcumulado !== undefined) {
            investimentoAtual = periciaEditando.investimentoAcumulado;
        } else {
            // Para perícias antigas sem investimento acumulado, calcula baseado no nível
            const entradaAtual = tabelaCusto.find(item => item.nivel === periciaEditando.nivel);
            investimentoAtual = entradaAtual ? entradaAtual.custo : 0;
        }
        
        custoAPagar = Math.max(0, custoTotalDesejado - investimentoAtual);
    }
    
    return {
        nivelDesejado: nivelDesejado,
        custoTotalDesejado: custoTotalDesejado,
        investimentoAtual: investimentoAtual,
        custoAPagar: custoAPagar,
        ehMelhoria: custoAPagar > 0 && investimentoAtual > 0,
        ehPrimeiraCompra: investimentoAtual === 0
    };
}

// ===== FUNÇÕES PARA OBTER ATRIBUTOS EM TEMPO REAL =====
function obterAtributoAtual(atributo) {
    const dadosAtributos = window.obterDadosAtributos ? window.obterDadosAtributos() : null;
    
    if (dadosAtributos) {
        switch(atributo) {
            case 'DX': return dadosAtributos.DX || 10;
            case 'IQ': return dadosAtributos.IQ || 10;
            case 'HT': return dadosAtributos.HT || 10;
            case 'PERC': 
                const iq = dadosAtributos.IQ || 10;
                const bonusPercepcao = dadosAtributos.Bonus ? dadosAtributos.Bonus.Percepcao || 0 : 0;
                return iq + bonusPercepcao;
            default: return 10;
        }
    }
    
    return estadoPericias.atributos[atributo] || 10;
}

function atualizarAtributosLocais() {
    estadoPericias.atributos.DX = obterAtributoAtual('DX');
    estadoPericias.atributos.IQ = obterAtributoAtual('IQ');
    estadoPericias.atributos.HT = obterAtributoAtual('HT');
    estadoPericias.atributos.PERC = obterAtributoAtual('PERC');
}

// ===== FUNÇÕES DE RENDERIZAÇÃO =====
function renderizarStatusPericias() {
    atualizarEstatisticas();
    
    document.getElementById('pontos-pericias').textContent = estadoPericias.pontosPericias;
    document.getElementById('pontos-combate').textContent = estadoPericias.pontosCombate;
    document.getElementById('total-pericias').textContent = estadoPericias.totalPericias;
    document.getElementById('total-combate').textContent = estadoPericias.totalCombate;
    document.getElementById('total-dx').textContent = estadoPericias.totalDX;
    document.getElementById('total-gasto-pericias').textContent = estadoPericias.pontosPericias + estadoPericias.pontosCombate;
    document.getElementById('pontos-pericias-total').textContent = `[${estadoPericias.pontosPericias + estadoPericias.pontosCombate} pts]`;
}

function atualizarEstatisticas() {
    estadoPericias.pontosPericias = 0;
    estadoPericias.pontosCombate = 0;
    estadoPericias.totalPericias = 0;
    estadoPericias.totalCombate = 0;
    estadoPericias.totalDX = 0;
    
    estadoPericias.periciasAprendidas.forEach(pericia => {
        if (pericia.categoria === 'Combate') {
            estadoPericias.pontosCombate += pericia.investimentoAcumulado || pericia.custo;
            estadoPericias.totalCombate++;
        } else {
            estadoPericias.pontosPericias += pericia.investimentoAcumulado || pericia.custo;
            if (pericia.categoria === 'DX') estadoPericias.totalDX++;
        }
        estadoPericias.totalPericias++;
    });
}

function renderizarFiltros() {
    const filtroButtons = document.querySelectorAll('.filtro-btn');
    filtroButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filtro === estadoPericias.filtroAtivo) {
            btn.classList.add('active');
        }
    });
}

function filtrarPericias() {
    const todasPericias = window.obterTodasPericiasSimples ? window.obterTodasPericiasSimples() : [];
    let periciasFiltradas = [];
    
    if (estadoPericias.filtroAtivo === 'todas') {
        periciasFiltradas = todasPericias;
    } else {
        periciasFiltradas = todasPericias.filter(pericia => {
            if (estadoPericias.filtroAtivo === 'combate') {
                return pericia.categoria === 'Combate';
            }
            return pericia.categoria === estadoPericias.filtroAtivo.toUpperCase();
        });
    }
    
    if (estadoPericias.buscaAtiva.trim() !== '') {
        const termoBusca = estadoPericias.buscaAtiva.toLowerCase();
        periciasFiltradas = periciasFiltradas.filter(pericia => 
            pericia.nome.toLowerCase().includes(termoBusca) ||
            pericia.descricao.toLowerCase().includes(termoBusca)
        );
    }
    
    return periciasFiltradas;
}

function renderizarCatalogo() {
    const container = document.getElementById('lista-pericias');
    const periciasFiltradas = filtrarPericias();
    
    if (!container) return;
    
    if (periciasFiltradas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h4>Nenhuma perícia encontrada</h4>
                <p>Tente outro filtro ou termo de busca</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    periciasFiltradas.forEach(pericia => {
        const periciaElement = document.createElement('div');
        periciaElement.className = 'pericia-item';
        periciaElement.dataset.id = pericia.id;
        
        const jaAprendida = estadoPericias.periciasAprendidas.some(p => p.id === pericia.id);
        
        let html = `
            <div class="pericia-header">
                <h4 class="pericia-nome">${pericia.nome}</h4>
                <div class="pericia-info">
                    <span class="pericia-atributo">${pericia.atributo}</span>
                    <span class="pericia-dificuldade dificuldade-${pericia.dificuldade.toLowerCase().replace(/ /g, '-')}">
                        ${pericia.dificuldade}
                    </span>
                    <span class="pericia-custo">${pericia.custoBase} pts</span>
                </div>
            </div>
            <p class="pericia-descricao">${pericia.descricao}</p>
        `;
        
        if (jaAprendida) {
            html += `<span class="pericia-aprendida-badge">✓ Já Aprendida</span>`;
        }
        
        periciaElement.innerHTML = html;
        
        periciaElement.addEventListener('click', () => {
            abrirModalPericia(pericia);
        });
        
        container.appendChild(periciaElement);
    });
}

function renderizarPericiasAprendidas() {
    const container = document.getElementById('pericias-aprendidas');
    
    if (!container) return;
    
    if (estadoPericias.periciasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia-aprendida">
                <i class="fas fa-graduation-cap"></i>
                <div>Nenhuma perícia aprendida</div>
                <small>As perícias que você aprender aparecerão aqui</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    estadoPericias.periciasAprendidas.forEach(pericia => {
        const periciaElement = document.createElement('div');
        periciaElement.className = 'pericia-aprendida-item';
        
        const atributoBase = obterAtributoAtual(pericia.atributo);
        const nhAtual = atributoBase + pericia.nivel;
        
        let nomeDisplay = pericia.nome;
        if (pericia.especializacao) {
            nomeDisplay += ` <span class="pericia-especializacao-nome">(${pericia.especializacao})</span>`;
        }
        
        // Mostra investimento acumulado se existir
        const custoDisplay = pericia.investimentoAcumulado ? 
            `${pericia.investimentoAcumulado} pts (nível ${pericia.nivel})` : 
            `${pericia.custo} pts`;
        
        const html = `
            <div class="pericia-aprendida-header">
                <h4 class="pericia-aprendida-nome">${nomeDisplay}</h4>
                <div class="pericia-aprendida-info">
                    <span class="pericia-aprendida-nivel">${pericia.nivel >= 0 ? '+' : ''}${pericia.nivel}</span>
                    <span class="pericia-aprendida-nh">NH ${nhAtual}</span>
                    <span class="pericia-aprendida-custo">${custoDisplay}</span>
                </div>
            </div>
            <button class="btn-remover-pericia" data-id="${pericia.id}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        periciaElement.innerHTML = html;
        
        const btnRemover = periciaElement.querySelector('.btn-remover-pericia');
        btnRemover.addEventListener('click', (e) => {
            e.stopPropagation();
            removerPericia(pericia.id);
        });
        
        periciaElement.addEventListener('click', () => {
            const periciaOriginal = window.buscarPericiaPorId ? window.buscarPericiaPorId(pericia.id) : null;
            if (periciaOriginal) {
                abrirModalPericia(periciaOriginal, pericia);
            }
        });
        
        container.appendChild(periciaElement);
    });
}

// ===== FUNÇÕES DE MODAL =====
function abrirModalPericia(pericia, periciaEditando = null) {
    estadoPericias.modalPericiaAtiva = pericia;
    
    // Verifica se é um grupo de especialização
    if (pericia.tipo === 'grupo-especializacao') {
        abrirModalEspecializacao(pericia.grupo);
        return;
    }
    
    // Configura nível inicial
    let nivelInicial = 0;
    if (periciaEditando) {
        nivelInicial = periciaEditando.nivel;
    } else {
        const tabela = obterTabelaCusto(pericia.dificuldade);
        const entradaDefault = tabela.find(item => item.custo === 1);
        if (entradaDefault) {
            nivelInicial = entradaDefault.nivel;
        }
    }
    
    estadoPericias.nivelPericia = nivelInicial;
    
    const modalContent = document.querySelector('.modal-pericia');
    if (!modalContent) return;
    
    atualizarAtributosLocais();
    
    const atributoBase = obterAtributoAtual(pericia.atributo);
    const nhAtual = atributoBase + estadoPericias.nivelPericia;
    const infoProgressao = obterInfoProgressaoPericia(periciaEditando, estadoPericias.nivelPericia, pericia.dificuldade);
    const custoAPagar = infoProgressao ? infoProgressao.custoAPagar : 0;
    const niveisDisponiveis = getNiveisDisponiveis(pericia.dificuldade);
    
    let textoCusto = '';
    if (infoProgressao) {
        if (infoProgressao.ehPrimeiraCompra) {
            textoCusto = `<span class="custo-novo">${custoAPagar} pontos</span>`;
        } else if (infoProgressao.ehMelhoria) {
            textoCusto = `
                <span class="custo-melhoria">
                    ${custoAPagar} pontos (já investiu ${infoProgressao.investimentoAtual})
                </span>`;
        } else if (custoAPagar === 0) {
            textoCusto = `<span class="custo-ja-pago">Já possui este nível</span>`;
        }
    }
    
    modalContent.innerHTML = `
        <div class="modal-header-pericia">
            <span class="modal-close" onclick="fecharModalPericia()">&times;</span>
            <h3>${pericia.nome}</h3>
            <div class="modal-subtitulo">
                ${pericia.atributo}/${pericia.dificuldade} - ${pericia.categoria}
                ${pericia.especializacaoDe ? `(${pericia.especializacaoDe})` : ''}
            </div>
        </div>
        
        <div class="modal-body-pericia">
            <div class="nivel-controle">
                <div class="nivel-info">
                    <div class="nivel-atual">
                        <label>Nível da Perícia</label>
                        <select class="nivel-select" id="nivel-pericia-select" onchange="alterarNivelPericiaDropdown(this.value)">
                            ${niveisDisponiveis.map(nivel => `
                                <option value="${nivel.nivel}" ${nivel.nivel === estadoPericias.nivelPericia ? 'selected' : ''}>
                                    ${nivel.texto}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="custo-info">
                    <div class="custo-total">
                        <label>Custo para ${periciaEditando ? 'Evoluir' : 'Adquirir'}</label>
                        <div id="custo-atual">${textoCusto}</div>
                    </div>
                    <div class="custo-detalhes">
                        ${getInfoRedutores(pericia.dificuldade)}
                    </div>
                    ${infoProgressao && infoProgressao.ehMelhoria ? `
                    <div class="custo-progressao">
                        <small>Progresso: ${infoProgressao.investimentoAtual} → ${infoProgressao.custoTotalDesejado} pontos</small>
                    </div>
                    ` : ''}
                </div>
                
                <div class="nh-info">
                    <div class="nh-calculado">
                        <label>Número de Habilidade (NH)</label>
                        <span id="nh-atual">${nhAtual}</span>
                    </div>
                    <div class="custo-detalhes" id="nh-detalhes">
                        ${atributoBase} (${pericia.atributo}) + ${estadoPericias.nivelPericia >= 0 ? '+' : ''}${estadoPericias.nivelPericia} (nível)
                    </div>
                </div>
            </div>
            
            <div class="detalhes-pericia-descricao">
                <h4>Descrição</h4>
                <p>${pericia.descricao}</p>
            </div>
            
            <div class="detalhes-pericia-default">
                <strong>Default:</strong> ${pericia.default}
            </div>
            
            ${pericia.prereq ? `
            <div class="detalhes-pericia-default">
                <strong>Pré-requisito:</strong> ${pericia.prereq}
            </div>
            ` : ''}
            
            ${pericia.grupo ? `
            <div class="detalhes-pericia-default">
                <strong>Grupo:</strong> ${pericia.grupo}
            </div>
            ` : ''}
            
            ${pericia.digitadoPeloJogador ? `
            <div class="detalhes-pericia-default">
                <strong><i class="fas fa-edit"></i> Especialização digitada pelo jogador</strong>
            </div>
            ` : ''}
        </div>
        
        <div class="modal-actions-pericia">
            <button class="btn-modal btn-cancelar" onclick="fecharModalPericia()">Cancelar</button>
            <button class="btn-modal btn-confirmar" id="btn-confirmar-pericia" onclick="confirmarPericia()" 
                ${custoAPagar === 0 ? 'disabled' : ''}>
                ${periciaEditando ? (custoAPagar > 0 ? 'Evoluir' : 'Atualizar') : 'Adquirir'}
            </button>
        </div>
    `;
    
    document.querySelector('.modal-pericia-overlay').style.display = 'block';
}

function alterarNivelPericiaDropdown(valorSelecionado) {
    if (!estadoPericias.modalPericiaAtiva) return;
    
    const novoNivel = parseInt(valorSelecionado);
    estadoPericias.nivelPericia = novoNivel;
    
    const pericia = estadoPericias.modalPericiaAtiva;
    const periciaEditando = estadoPericias.periciasAprendidas.find(p => p.id === pericia.id);
    const atributoBase = obterAtributoAtual(pericia.atributo);
    const nhAtual = atributoBase + novoNivel;
    const infoProgressao = obterInfoProgressaoPericia(periciaEditando, novoNivel, pericia.dificuldade);
    const custoAPagar = infoProgressao ? infoProgressao.custoAPagar : 0;
    
    // Atualiza custo
    const custoElement = document.getElementById('custo-atual');
    if (custoElement && infoProgressao) {
        let textoCusto = '';
        if (infoProgressao.ehPrimeiraCompra) {
            textoCusto = `<span class="custo-novo">${custoAPagar} pontos</span>`;
        } else if (infoProgressao.ehMelhoria) {
            textoCusto = `
                <span class="custo-melhoria">
                    ${custoAPagar} pontos (já investiu ${infoProgressao.investimentoAtual})
                </span>`;
        } else if (custoAPagar === 0) {
            textoCusto = `<span class="custo-ja-pago">Já possui este nível</span>`;
        }
        custoElement.innerHTML = textoCusto;
        
        // Atualiza progresso se existir
        const progressoElement = document.querySelector('.custo-progressao');
        if (progressoElement && infoProgressao.ehMelhoria) {
            progressoElement.innerHTML = `<small>Progresso: ${infoProgressao.investimentoAtual} → ${infoProgressao.custoTotalDesejado} pontos</small>`;
        }
    }
    
    // Atualiza NH
    const nhElement = document.getElementById('nh-atual');
    if (nhElement) {
        nhElement.textContent = nhAtual;
    }
    
    const nhDetalhes = document.getElementById('nh-detalhes');
    if (nhDetalhes) {
        nhDetalhes.innerHTML = `${atributoBase} (${pericia.atributo}) + ${novoNivel >= 0 ? '+' : ''}${novoNivel} (nível)`;
    }
    
    // Atualiza botão
    const btnConfirmar = document.getElementById('btn-confirmar-pericia');
    if (btnConfirmar) {
        btnConfirmar.disabled = custoAPagar === 0;
        if (periciaEditando && custoAPagar > 0) {
            btnConfirmar.textContent = 'Evoluir';
        } else if (periciaEditando && custoAPagar === 0) {
            btnConfirmar.textContent = 'Atualizar';
        } else {
            btnConfirmar.textContent = 'Adquirir';
        }
    }
}

function abrirModalEspecializacao(grupo) {
    estadoPericias.modalEspecializacaoAtiva = grupo;
    estadoPericias.especializacaoSelecionada = null;
    
    const especializacoes = window.obterEspecializacoes ? window.obterEspecializacoes(grupo) : [];
    const grupoInfo = window.catalogoPericias?.Especializacao?.[grupo] || 
                      window.catalogoPericias?.Combate?.[grupo];
    
    const modalContent = document.querySelector('.modal-especializacao');
    if (!modalContent) return;
    
    if (especializacoes.length === 0) {
        modalContent.innerHTML = `
            <div class="modal-header-especializacao">
                <span class="modal-close" onclick="fecharModalEspecializacao()">&times;</span>
                <h3>${grupoInfo?.nome || grupo}</h3>
            </div>
            <div class="modal-body-especializacao">
                <p>Nenhuma especialização disponível para este grupo.</p>
            </div>
        `;
    } else {
        modalContent.innerHTML = `
            <div class="modal-header-especializacao">
                <span class="modal-close" onclick="fecharModalEspecializacao()">&times;</span>
                <h3>${grupoInfo?.nome || grupo}</h3>
                <div class="modal-subtitulo">
                    Escolha uma especialização
                </div>
            </div>
            
            <div class="modal-body-especializacao">
                <div class="detalhes-pericia-descricao">
                    <p>${grupoInfo?.descricao || 'Selecione uma especialização abaixo:'}</p>
                </div>
                
                <div class="especializacoes-grid" id="grid-especializacoes">
                    ${especializacoes.map(espec => {
                        const ehDigitavel = espec.tipo === 'personalizado' || espec.id === 'cavalgar-digitar';
                        
                        return `
                        <div class="especializacao-item ${ehDigitavel ? 'especializacao-digitavel' : ''}" 
                             data-id="${espec.id}" 
                             data-grupo="${grupo}"
                             data-digitavel="${ehDigitavel}"
                             onclick="selecionarEspecializacao('${espec.id}', '${grupo}', ${ehDigitavel})">
                            <div class="especializacao-header">
                                <h4 class="especializacao-nome">
                                    ${espec.nome}
                                    ${ehDigitavel ? '<i class="fas fa-edit" style="margin-left: 5px;"></i>' : ''}
                                </h4>
                                <span class="especializacao-custo">${espec.custoBase} pts</span>
                            </div>
                            <p class="especializacao-descricao">${espec.descricao}</p>
                            ${espec.default ? `
                            <div class="detalhes-pericia-default">
                                <strong>Default:</strong> ${espec.default}
                            </div>
                            ` : ''}
                            ${ehDigitavel ? `
                            <div class="especializacao-digitavel-nota">
                                <small><i class="fas fa-info-circle"></i> Você poderá digitar a especialização</small>
                            </div>
                            ` : ''}
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <div class="modal-actions-especializacao">
                <button class="btn-modal btn-cancelar" onclick="fecharModalEspecializacao()">Cancelar</button>
                <button class="btn-modal btn-confirmar" id="btn-continuar-especializacao" onclick="processarEspecializacao()" disabled>
                    Continuar
                </button>
            </div>
        `;
    }
    
    document.querySelector('.modal-especializacao-overlay').style.display = 'block';
}

function selecionarEspecializacao(idEspecializacao, grupo, ehDigitavel = false) {
    document.querySelectorAll('.especializacao-item').forEach(item => {
        item.classList.remove('selecionada');
    });
    
    const itemSelecionado = document.querySelector(`.especializacao-item[data-id="${idEspecializacao}"]`);
    if (itemSelecionado) {
        itemSelecionado.classList.add('selecionada');
        
        estadoPericias.especializacaoSelecionada = {
            id: idEspecializacao,
            grupo: grupo,
            ehDigitavel: ehDigitavel
        };
        
        const btnContinuar = document.getElementById('btn-continuar-especializacao');
        if (btnContinuar) {
            btnContinuar.disabled = false;
        }
    }
}

// ===== SISTEMA GENÉRICO PARA DIGITAÇÃO =====
function processarEspecializacao() {
    if (!estadoPericias.especializacaoSelecionada) {
        alert("Por favor, selecione uma especialização primeiro.");
        return;
    }
    
    const selecao = estadoPericias.especializacaoSelecionada;
    const grupo = estadoPericias.modalEspecializacaoAtiva;
    const grupoInfo = window.catalogoPericias?.Especializacao?.[grupo] || 
                     window.catalogoPericias?.Combate?.[grupo];
    
    let periciaCompleta;
    
    if (selecao.ehDigitavel) {
        const especializacoes = window.obterEspecializacoes(grupo);
        const especializacaoBase = especializacoes.find(e => e.id === selecao.id);
        
        if (!especializacaoBase) {
            alert("Erro: Especialização base não encontrada.");
            return;
        }
        
        let promptMensagem, placeholder;
        
        if (grupo === "Cavalgar") {
            promptMensagem = "Digite o nome do animal:";
            placeholder = "Ex: Elefante, Griffon, Pégaso, Rinoceronte, Urso, etc.";
        } else if (grupo.includes("Idioma") || selecao.id.includes("idioma")) {
            promptMensagem = "Digite o idioma:";
            placeholder = "Ex: Élfico, Dracônico, Anão, Orc, etc.";
        } else if (grupo.includes("Ciência") || selecao.id.includes("ciencia")) {
            promptMensagem = "Digite a área científica:";
            placeholder = "Ex: Astrofísica, Genética, Alquimia, etc.";
        } else {
            promptMensagem = "Digite a especialização:";
            placeholder = "Ex: Especialização personalizada";
        }
        
        const textoDigitado = prompt(`${promptMensagem}\n\n${placeholder}`, "");
        
        if (!textoDigitado || textoDigitado.trim() === '') {
            alert("Você precisa digitar a especialização.");
            return;
        }
        
        const textoLimpo = textoDigitado.trim();
        
        periciaCompleta = {
            id: `${grupo.toLowerCase().replace(/ /g, '-')}-${textoLimpo.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            nome: `${grupoInfo?.nome || grupo} (${textoLimpo})`,
            atributo: especializacaoBase.atributo || grupoInfo?.atributo || "DX",
            dificuldade: especializacaoBase.dificuldade || grupoInfo?.dificuldade || "Média",
            custoBase: especializacaoBase.custoBase || grupoInfo?.custoBase || 2,
            descricao: `${especializacaoBase.descricao || grupoInfo?.descricao || ''} Especialização: ${textoLimpo}.`,
            prereq: especializacaoBase.prereq || grupoInfo?.prereq || "Consultar mestre",
            default: especializacaoBase.default || grupoInfo?.default || "Consultar mestre",
            categoria: especializacaoBase.categoria || grupoInfo?.categoria || "DX",
            tipo: "pericia-simples",
            grupo: grupo,
            especializacaoDe: grupoInfo?.nome || grupo,
            digitadoPeloJogador: true,
            textoDigitado: textoLimpo
        };
    } else {
        const especializacoes = window.obterEspecializacoes(grupo);
        const especializacao = especializacoes.find(e => e.id === selecao.id);
        
        if (!especializacao) {
            alert("Erro: Especialização não encontrada.");
            return;
        }
        
        periciaCompleta = {
            ...especializacao,
            grupo: grupo,
            especializacaoDe: grupoInfo?.nome || grupo
        };
    }
    
    fecharModalEspecializacao();
    
    setTimeout(() => {
        abrirModalPericia(periciaCompleta);
    }, 300);
}

// ===== FUNÇÃO MODIFICADA: confirmarPericia() COM INVESTIMENTO ACUMULADO =====
function confirmarPericia() {
    if (!estadoPericias.modalPericiaAtiva) return;
    
    const pericia = estadoPericias.modalPericiaAtiva;
    const nivel = estadoPericias.nivelPericia;
    
    // Obtém informações da progressão
    const periciaEditando = estadoPericias.periciasAprendidas.find(p => p.id === pericia.id);
    const infoProgressao = obterInfoProgressaoPericia(periciaEditando, nivel, pericia.dificuldade);
    
    if (!infoProgressao) return;
    
    const custoAPagar = infoProgressao.custoAPagar;
    
    // Verifica se realmente precisa pagar
    if (custoAPagar === 0) {
        // Apenas atualiza o nível sem custo adicional
        if (periciaEditando) {
            estadoPericias.periciasAprendidas = estadoPericias.periciasAprendidas.filter(p => p.id !== pericia.id);
        }
        return;
    }
    
    const indexExistente = estadoPericias.periciasAprendidas.findIndex(p => p.id === pericia.id);
    
    if (indexExistente >= 0) {
        // EVOLUIR PERÍCIA EXISTENTE
        const periciaAtual = estadoPericias.periciasAprendidas[indexExistente];
        
        // Calcula novo investimento acumulado
        let novoInvestimentoAcumulado;
        if (periciaAtual.investimentoAcumulado !== undefined) {
            novoInvestimentoAcumulado = periciaAtual.investimentoAcumulado + custoAPagar;
        } else {
            // Para perícias antigas sem investimento acumulado
            const tabela = obterTabelaCusto(pericia.dificuldade);
            const entradaAtual = tabela.find(item => item.nivel === periciaAtual.nivel);
            const custoAtual = entradaAtual ? entradaAtual.custo : 0;
            novoInvestimentoAcumulado = custoAtual + custoAPagar;
        }
        
        estadoPericias.periciasAprendidas[indexExistente] = {
            ...periciaAtual,
            nivel: nivel,
            custo: custoAPagar, // Custo da melhoria
            investimentoAcumulado: novoInvestimentoAcumulado,
            nh: obterAtributoAtual(pericia.atributo) + nivel,
            // Mantém outras propriedades
            nome: pericia.nome,
            atributo: pericia.atributo,
            dificuldade: pericia.dificuldade,
            categoria: pericia.categoria,
            descricao: pericia.descricao,
            default: pericia.default,
            prereq: pericia.prereq,
            grupo: pericia.grupo,
            especializacao: pericia.especializacaoDe || null,
            digitadoPeloJogador: pericia.digitadoPeloJogador || false,
            textoDigitado: pericia.textoDigitado || null
        };
    } else {
        // NOVA PERÍCIA
        const novaPericia = {
            id: pericia.id,
            nome: pericia.nome,
            atributo: pericia.atributo,
            dificuldade: pericia.dificuldade,
            nivel: nivel,
            custo: custoAPagar, // Custo total da aquisição
            investimentoAcumulado: custoAPagar, // Investimento inicial
            categoria: pericia.categoria,
            descricao: pericia.descricao,
            default: pericia.default,
            prereq: pericia.prereq,
            grupo: pericia.grupo,
            especializacao: pericia.especializacaoDe || null,
            digitadoPeloJogador: pericia.digitadoPeloJogador || false,
            textoDigitado: pericia.textoDigitado || null,
            nh: obterAtributoAtual(pericia.atributo) + nivel
        };
        
        estadoPericias.periciasAprendidas.push(novaPericia);
    }
    
    fecharModalPericia();
    salvarPericias();
    renderizarStatusPericias();
    renderizarPericiasAprendidas();
    renderizarCatalogo();
}

function removerPericia(idPericia) {
    if (confirm('Tem certeza que deseja remover esta perícia?')) {
        estadoPericias.periciasAprendidas = estadoPericias.periciasAprendidas.filter(p => p.id !== idPericia);
        salvarPericias();
        renderizarStatusPericias();
        renderizarPericiasAprendidas();
        renderizarCatalogo();
    }
}

function fecharModalPericia() {
    document.querySelector('.modal-pericia-overlay').style.display = 'none';
    estadoPericias.modalPericiaAtiva = null;
    estadoPericias.nivelPericia = 0;
}

function fecharModalEspecializacao() {
    document.querySelector('.modal-especializacao-overlay').style.display = 'none';
    estadoPericias.modalEspecializacaoAtiva = null;
    estadoPericias.especializacaoSelecionada = null;
}

// ===== FUNÇÕES DE PERSISTÊNCIA =====
function salvarPericias() {
    try {
        // Converte perícias antigas para o novo formato
        const periciasParaSalvar = estadoPericias.periciasAprendidas.map(pericia => {
            // Se é uma perícia antiga sem investimento acumulado, calcula
            if (pericia.investimentoAcumulado === undefined) {
                const tabela = obterTabelaCusto(pericia.dificuldade);
                const entrada = tabela.find(item => item.nivel === pericia.nivel);
                return {
                    ...pericia,
                    investimentoAcumulado: entrada ? entrada.custo : pericia.custo
                };
            }
            return pericia;
        });
        
        localStorage.setItem('periciasAprendidas', JSON.stringify(periciasParaSalvar));
    } catch (e) {
        console.error('Erro ao salvar perícias:', e);
    }
}

function carregarPericias() {
    try {
        const salvo = localStorage.getItem('periciasAprendidas');
        if (salvo) {
            estadoPericias.periciasAprendidas = JSON.parse(salvo);
            
            // Garante que todas as perícias tenham investimentoAcumulado
            estadoPericias.periciasAprendidas = estadoPericias.periciasAprendidas.map(pericia => {
                if (pericia.investimentoAcumulado === undefined) {
                    const tabela = obterTabelaCusto(pericia.dificuldade);
                    const entrada = tabela.find(item => item.nivel === pericia.nivel);
                    return {
                        ...pericia,
                        investimentoAcumulado: entrada ? entrada.custo : pericia.custo
                    };
                }
                return pericia;
            });
        }
    } catch (e) {
        console.error('Erro ao carregar perícias:', e);
    }
}

// ===== FUNÇÕES DE INTEGRAÇÃO COM ATRIBUTOS =====
function configurarOuvinteAtributos() {
    document.addEventListener('atributosAlterados', function() {
        atualizarAtributosLocais();
        atualizarTodosNH();
        renderizarPericiasAprendidas();
    });
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                const abaPericias = document.getElementById('pericias');
                if (abaPericias && !abaPericias.classList.contains('active')) {
                    return;
                }
                
                setTimeout(() => {
                    atualizarAtributosLocais();
                    atualizarTodosNH();
                    renderizarPericiasAprendidas();
                }, 100);
            }
        });
    });
    
    const atributosElements = ['ST', 'DX', 'IQ', 'HT'];
    atributosElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            observer.observe(element, { attributes: true, attributeFilter: ['value'] });
        }
    });
    
    const bonusPercepcao = document.getElementById('bonusPercepcao');
    if (bonusPercepcao) {
        observer.observe(bonusPercepcao, { attributes: true, attributeFilter: ['value'] });
    }
}

function atualizarTodosNH() {
    estadoPericias.periciasAprendidas.forEach(pericia => {
        const atributoBase = obterAtributoAtual(pericia.atributo);
        pericia.nh = atributoBase + pericia.nivel;
    });
}

// ===== FUNÇÕES DE INICIALIZAÇÃO =====
function inicializarSistemaPericias() {
    carregarPericias();
    configurarEventListeners();
    configurarOuvinteAtributos();
    atualizarAtributosLocais();
    renderizarStatusPericias();
    renderizarFiltros();
    renderizarCatalogo();
    renderizarPericiasAprendidas();
}

function configurarEventListeners() {
    const filtroButtons = document.querySelectorAll('.filtro-btn');
    filtroButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const filtro = this.dataset.filtro;
            estadoPericias.filtroAtivo = filtro;
            renderizarFiltros();
            renderizarCatalogo();
        });
    });
    
    const buscaInput = document.getElementById('busca-pericias');
    if (buscaInput) {
        buscaInput.addEventListener('input', function() {
            estadoPericias.buscaAtiva = this.value;
            renderizarCatalogo();
        });
    }
    
    document.querySelectorAll('.modal-pericia-overlay, .modal-especializacao-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                if (this.classList.contains('modal-pericia-overlay')) {
                    fecharModalPericia();
                } else {
                    fecharModalEspecializacao();
                }
            }
        });
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fecharModalPericia();
            fecharModalEspecializacao();
        }
    });
}

// ===== FUNÇÕES PÚBLICAS PARA INTEGRAÇÃO =====
function obterDadosPericias() {
    return {
        periciasAprendidas: estadoPericias.periciasAprendidas,
        pontosPericias: estadoPericias.pontosPericias,
        pontosCombate: estadoPericias.pontosCombate,
        totalPericias: estadoPericias.totalPericias,
        totalCombate: estadoPericias.totalCombate
    };
}

function carregarDadosPericias(dados) {
    if (dados && dados.periciasAprendidas) {
        estadoPericias.periciasAprendidas = dados.periciasAprendidas;
        salvarPericias();
        renderizarStatusPericias();
        renderizarPericiasAprendidas();
        renderizarCatalogo();
    }
}

function resetarPericias() {
    if (confirm('Tem certeza que deseja resetar TODAS as perícias? Esta ação não pode ser desfeita.')) {
        estadoPericias.periciasAprendidas = [];
        estadoPericias.pontosPericias = 0;
        estadoPericias.pontosCombate = 0;
        estadoPericias.totalPericias = 0;
        estadoPericias.totalCombate = 0;
        estadoPericias.totalDX = 0;
        
        salvarPericias();
        renderizarStatusPericias();
        renderizarPericiasAprendidas();
        renderizarCatalogo();
        
        alert('Perícias resetadas com sucesso!');
    }
}

// ===== FUNÇÃO ADICIONAL: MIGRAR PERÍCIAS ANTIGAS =====
function migrarPericiasAntigas() {
    if (!confirm('Esta função migrará suas perícias antigas para o novo sistema de investimento acumulado. Continuar?')) {
        return;
    }
    
    estadoPericias.periciasAprendidas.forEach(pericia => {
        if (pericia.investimentoAcumulado === undefined) {
            const tabela = obterTabelaCusto(pericia.dificuldade);
            const entrada = tabela.find(item => item.nivel === pericia.nivel);
            if (entrada) {
                pericia.investimentoAcumulado = entrada.custo;
            }
        }
    });
    
    salvarPericias();
    renderizarPericiasAprendidas();
    alert('Migração concluída! As perícias agora usam o sistema de investimento acumulado.');
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    const periciasTab = document.getElementById('pericias');
    if (periciasTab && periciasTab.classList.contains('active')) {
        setTimeout(() => {
            inicializarSistemaPericias();
        }, 100);
    }
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'pericias' && tab.classList.contains('active')) {
                    setTimeout(() => {
                        if (!window.sistemaPericiasInicializado) {
                            inicializarSistemaPericias();
                            window.sistemaPericiasInicializado = true;
                        } else {
                            renderizarStatusPericias();
                            renderizarFiltros();
                            renderizarCatalogo();
                            renderizarPericiasAprendidas();
                        }
                    }, 100);
                }
            }
        });
    });
    
    document.querySelectorAll('.tab-content').forEach(tab => {
        observer.observe(tab, { attributes: true });
    });
});

// ===== EXPORTAÇÃO DE FUNÇÕES PARA USO GLOBAL =====
window.alterarNivelPericiaDropdown = alterarNivelPericiaDropdown;
window.selecionarEspecializacao = selecionarEspecializacao;
window.processarEspecializacao = processarEspecializacao;
window.confirmarPericia = confirmarPericia;
window.fecharModalPericia = fecharModalPericia;
window.fecharModalEspecializacao = fecharModalEspecializacao;
window.abrirModalPericia = abrirModalPericia;
window.abrirModalEspecializacao = abrirModalEspecializacao;
window.obterDadosPericias = obterDadosPericias;
window.carregarDadosPericias = carregarDadosPericias;
window.resetarPericias = resetarPericias;
window.inicializarSistemaPericias = inicializarSistemaPericias;
window.migrarPericiasAntigas = migrarPericiasAntigas;
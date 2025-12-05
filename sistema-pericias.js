// ===== SISTEMA DE PERÍCIAS - VERSÃO CORRIGIDA =====
// Sistema completo para gerenciamento de perícias GURPS

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

// ===== TABELA DE CUSTOS EXATA (SUA TABELA) =====
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

// ===== FUNÇÕES PARA OBTER ATRIBUTOS EM TEMPO REAL =====
function obterAtributoAtual(atributo) {
    // Tenta obter do sistema de atributos primeiro
    const dadosAtributos = window.obterDadosAtributos ? window.obterDadosAtributos() : null;
    
    if (dadosAtributos) {
        switch(atributo) {
            case 'DX': return dadosAtributos.DX || 10;
            case 'IQ': return dadosAtributos.IQ || 10;
            case 'HT': return dadosAtributos.HT || 10;
            case 'PERC': 
                // PERC = IQ + bônus de Percepção
                const iq = dadosAtributos.IQ || 10;
                const bonusPercepcao = dadosAtributos.Bonus ? dadosAtributos.Bonus.Percepcao || 0 : 0;
                return iq + bonusPercepcao;
            default: return 10;
        }
    }
    
    // Fallback para o estado local
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
            estadoPericias.pontosCombate += pericia.custo;
            estadoPericias.totalCombate++;
        } else {
            estadoPericias.pontosPericias += pericia.custo;
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
    
    // Aplica filtro por categoria
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
    
    // Aplica busca por texto
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
        
        // Verifica se já foi aprendida
        const jaAprendida = estadoPericias.periciasAprendidas.some(p => p.id === pericia.id);
        
        // NÃO ADICIONA BADGE DE ESPECIALIZAÇÃO (removido como solicitado)
        
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
        
        // Adiciona badge apenas se já foi aprendida
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
        
        // Calcula NH atual
        const atributoBase = obterAtributoAtual(pericia.atributo);
        const nhAtual = atributoBase + pericia.nivel;
        
        let nomeDisplay = pericia.nome;
        if (pericia.especializacao) {
            nomeDisplay += ` <span class="pericia-especializacao-nome">(${pericia.especializacao})</span>`;
        }
        
        const html = `
            <div class="pericia-aprendida-header">
                <h4 class="pericia-aprendida-nome">${nomeDisplay}</h4>
                <div class="pericia-aprendida-info">
                    <span class="pericia-aprendida-nivel">${pericia.nivel >= 0 ? '+' : ''}${pericia.nivel}</span>
                    <span class="pericia-aprendida-nh">NH ${nhAtual}</span>
                    <span class="pericia-aprendida-custo">${pericia.custo} pts</span>
                </div>
            </div>
            <button class="btn-remover-pericia" data-id="${pericia.id}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        periciaElement.innerHTML = html;
        
        // Botão de remover
        const btnRemover = periciaElement.querySelector('.btn-remover-pericia');
        btnRemover.addEventListener('click', (e) => {
            e.stopPropagation();
            removerPericia(pericia.id);
        });
        
        // Clicar na perícia para editar
        periciaElement.addEventListener('click', () => {
            const periciaOriginal = window.buscarPericiaPorId ? window.buscarPericiaPorId(pericia.id) : null;
            if (periciaOriginal) {
                abrirModalPericia(periciaOriginal, pericia);
            }
        });
        
        container.appendChild(periciaElement);
    });
}

// ===== FUNÇÕES DE MODAL CORRIGIDAS =====
function abrirModalPericia(pericia, periciaEditando = null) {
    estadoPericias.modalPericiaAtiva = pericia;
    
    console.log("Abrindo modal para perícia:", pericia);
    console.log("Tipo da perícia:", pericia.tipo);
    
    // CORREÇÃO: Verifica se é um grupo de especialização
    if (pericia.tipo === 'grupo-especializacao') {
        console.log("É grupo de especialização, abrindo modal de especializações...");
        abrirModalEspecializacao(pericia.grupo);
        return;
    }
    
    // Configura nível inicial para edição ou novo
    // Para nova perícia: começa no nível 0 (ou -1 para Média, etc)
    let nivelInicial = 0;
    if (periciaEditando) {
        nivelInicial = periciaEditando.nivel;
    } else {
        // Encontra o nível que custa 1 ponto (para ser o default)
        const tabela = obterTabelaCusto(pericia.dificuldade);
        const entradaDefault = tabela.find(item => item.custo === 1);
        if (entradaDefault) {
            nivelInicial = entradaDefault.nivel;
        }
    }
    
    estadoPericias.nivelPericia = nivelInicial;
    
    const modalContent = document.querySelector('.modal-pericia');
    if (!modalContent) return;
    
    // Atualiza atributos locais antes de calcular
    atualizarAtributosLocais();
    
    // Calcula valores iniciais
    const atributoBase = obterAtributoAtual(pericia.atributo);
    const nhAtual = atributoBase + estadoPericias.nivelPericia;
    const custoAtual = calcularCustoPericia(estadoPericias.nivelPericia, pericia.dificuldade);
    
    // Obtém todos os níveis disponíveis para o dropdown
    const niveisDisponiveis = getNiveisDisponiveis(pericia.dificuldade);
    
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
                        <!-- DROPDOWN CORRETO (removidos botões horrorosos) -->
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
                        <label>Custo Total</label>
                        <span id="custo-atual">${custoAtual} pontos</span>
                    </div>
                    <div class="custo-detalhes">
                        ${getInfoRedutores(pericia.dificuldade)}
                    </div>
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
        </div>
        
        <div class="modal-actions-pericia">
            <button class="btn-modal btn-cancelar" onclick="fecharModalPericia()">Cancelar</button>
            <button class="btn-modal btn-confirmar" id="btn-confirmar-pericia" onclick="confirmarPericia()" 
                ${custoAtual === 0 ? 'disabled' : ''}>
                ${periciaEditando ? 'Atualizar' : 'Adquirir'}
            </button>
        </div>
    `;
    
    // Mostra o modal
    document.querySelector('.modal-pericia-overlay').style.display = 'block';
}

// NOVA FUNÇÃO: Alterar nível via dropdown
function alterarNivelPericiaDropdown(valorSelecionado) {
    if (!estadoPericias.modalPericiaAtiva) return;
    
    const novoNivel = parseInt(valorSelecionado);
    estadoPericias.nivelPericia = novoNivel;
    
    // Atualiza valores na interface
    const pericia = estadoPericias.modalPericiaAtiva;
    const atributoBase = obterAtributoAtual(pericia.atributo);
    const nhAtual = atributoBase + novoNivel;
    const custoAtual = calcularCustoPericia(novoNivel, pericia.dificuldade);
    
    // Atualiza custo
    const custoElement = document.getElementById('custo-atual');
    if (custoElement) {
        custoElement.textContent = `${custoAtual} pontos`;
    }
    
    // Atualiza NH
    const nhElement = document.getElementById('nh-atual');
    if (nhElement) {
        nhElement.textContent = nhAtual;
    }
    
    // Atualiza descrição do NH
    const nhDetalhes = document.getElementById('nh-detalhes');
    if (nhDetalhes) {
        nhDetalhes.innerHTML = `${atributoBase} (${pericia.atributo}) + ${novoNivel >= 0 ? '+' : ''}${novoNivel} (nível)`;
    }
    
    // Habilita/desabilita botão de confirmação
    const btnConfirmar = document.getElementById('btn-confirmar-pericia');
    if (btnConfirmar) {
        btnConfirmar.disabled = custoAtual === 0;
    }
}

// CORREÇÃO COMPLETA: Modal de especialização funcionando
function abrirModalEspecializacao(grupo) {
    console.log("Abrindo modal de especialização para grupo:", grupo);
    
    estadoPericias.modalEspecializacaoAtiva = grupo;
    estadoPericias.especializacaoSelecionada = null;
    
    const especializacoes = window.obterEspecializacoes ? window.obterEspecializacoes(grupo) : [];
    const grupoInfo = window.catalogoPericias?.Combate?.[grupo];
    
    console.log("Especializações encontradas:", especializacoes);
    
    const modalContent = document.querySelector('.modal-especializacao');
    if (!modalContent) {
        console.error("Modal de especialização não encontrado!");
        return;
    }
    
    if (especializacoes.length === 0) {
        console.error("Nenhuma especialização encontrada para o grupo:", grupo);
        modalContent.innerHTML = `
            <div class="modal-header-especializacao">
                <span class="modal-close" onclick="fecharModalEspecializacao()">&times;</span>
                <h3>Erro</h3>
            </div>
            <div class="modal-body-especializacao">
                <p>Nenhuma especialização encontrada para ${grupo}.</p>
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
                    ${especializacoes.map(espec => `
                        <div class="especializacao-item" data-id="${espec.id}" onclick="selecionarEspecializacao('${espec.id}')">
                            <div class="especializacao-header">
                                <h4 class="especializacao-nome">${espec.nome}</h4>
                                <span class="especializacao-custo">${espec.custoBase} pts</span>
                            </div>
                            <p class="especializacao-descricao">${espec.descricao}</p>
                            <div class="detalhes-pericia-default">
                                <strong>Default:</strong> ${espec.default}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="modal-actions-especializacao">
                <button class="btn-modal btn-cancelar" onclick="fecharModalEspecializacao()">Cancelar</button>
                <button class="btn-modal btn-confirmar" id="btn-continuar-especializacao" onclick="continuarParaNivel()" disabled>
                    Continuar
                </button>
            </div>
        `;
    }
    
    // Mostra o modal
    document.querySelector('.modal-especializacao-overlay').style.display = 'block';
    console.log("Modal de especialização exibido");
}

function selecionarEspecializacao(idEspecializacao) {
    console.log("Especialização selecionada:", idEspecializacao);
    
    // Remove seleção anterior
    document.querySelectorAll('.especializacao-item').forEach(item => {
        item.classList.remove('selecionada');
    });
    
    // Adiciona seleção nova
    const itemSelecionado = document.querySelector(`.especializacao-item[data-id="${idEspecializacao}"]`);
    if (itemSelecionado) {
        itemSelecionado.classList.add('selecionada');
        estadoPericias.especializacaoSelecionada = idEspecializacao;
        
        // Habilita botão continuar
        const btnContinuar = document.getElementById('btn-continuar-especializacao');
        if (btnContinuar) {
            btnContinuar.disabled = false;
        }
    }
}

// CORREÇÃO COMPLETA: Esta função agora funciona!
function continuarParaNivel() {
    console.log("Continuando para nível...");
    console.log("Grupo ativo:", estadoPericias.modalEspecializacaoAtiva);
    console.log("Especialização selecionada:", estadoPericias.especializacaoSelecionada);
    
    if (!estadoPericias.modalEspecializacaoAtiva || !estadoPericias.especializacaoSelecionada) {
        console.error("Grupo ou especialização não selecionada!");
        return;
    }
    
    // Fecha modal de especialização
    fecharModalEspecializacao();
    
    // Busca a especialização selecionada
    const especializacoes = window.obterEspecializacoes ? 
        window.obterEspecializacoes(estadoPericias.modalEspecializacaoAtiva) : [];
    const especializacao = especializacoes.find(e => e.id === estadoPericias.especializacaoSelecionada);
    
    console.log("Especialização encontrada:", especializacao);
    
    if (especializacao) {
        // Cria um objeto de perícia para o modal de nível
        const periciaCompleta = {
            id: especializacao.id,
            nome: especializacao.nome,
            atributo: especializacao.atributo,
            dificuldade: especializacao.dificuldade,
            custoBase: especializacao.custoBase,
            descricao: especializacao.descricao,
            prereq: especializacao.prereq,
            default: especializacao.default,
            categoria: 'Combate',
            tipo: 'pericia-simples',
            grupo: estadoPericias.modalEspecializacaoAtiva,
            especializacaoDe: estadoPericias.modalEspecializacaoAtiva
        };
        
        console.log("Abrindo modal de nível para:", periciaCompleta.nome);
        
        // Abre modal de nível para essa especialização
        setTimeout(() => {
            abrirModalPericia(periciaCompleta);
        }, 100);
    } else {
        console.error("Especialização não encontrada!");
    }
}

function confirmarPericia() {
    if (!estadoPericias.modalPericiaAtiva) return;
    
    const pericia = estadoPericias.modalPericiaAtiva;
    const nivel = estadoPericias.nivelPericia;
    const custo = calcularCustoPericia(nivel, pericia.dificuldade);
    
    console.log("Confirmando perícia:", pericia.nome, "Nível:", nivel, "Custo:", custo);
    
    // Verifica se já existe (para edição)
    const indexExistente = estadoPericias.periciasAprendidas.findIndex(p => p.id === pericia.id);
    
    if (indexExistente >= 0) {
        // Atualiza perícia existente
        estadoPericias.periciasAprendidas[indexExistente] = {
            ...estadoPericias.periciasAprendidas[indexExistente],
            nivel: nivel,
            custo: custo,
            nh: obterAtributoAtual(pericia.atributo) + nivel
        };
        console.log("Perícia atualizada");
    } else {
        // Adiciona nova perícia
        const novaPericia = {
            id: pericia.id,
            nome: pericia.nome,
            atributo: pericia.atributo,
            dificuldade: pericia.dificuldade,
            nivel: nivel,
            custo: custo,
            categoria: pericia.categoria,
            descricao: pericia.descricao,
            default: pericia.default,
            prereq: pericia.prereq,
            grupo: pericia.grupo,
            especializacao: pericia.especializacaoDe || null,
            nh: obterAtributoAtual(pericia.atributo) + nivel
        };
        
        estadoPericias.periciasAprendidas.push(novaPericia);
        console.log("Nova perícia adicionada:", novaPericia);
    }
    
    // Fecha modal e atualiza interface
    fecharModalPericia();
    salvarPericias();
    renderizarStatusPericias();
    renderizarPericiasAprendidas();
    renderizarCatalogo();
    
    console.log("Total de perícias aprendidas:", estadoPericias.periciasAprendidas.length);
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
        localStorage.setItem('periciasAprendidas', JSON.stringify(estadoPericias.periciasAprendidas));
        console.log("Perícias salvas no localStorage");
    } catch (e) {
        console.error('Erro ao salvar perícias:', e);
    }
}

function carregarPericias() {
    try {
        const salvo = localStorage.getItem('periciasAprendidas');
        if (salvo) {
            estadoPericias.periciasAprendidas = JSON.parse(salvo);
            console.log("Perícias carregadas do localStorage:", estadoPericias.periciasAprendidas.length);
        }
    } catch (e) {
        console.error('Erro ao carregar perícias:', e);
    }
}

// ===== FUNÇÕES DE INTEGRAÇÃO COM ATRIBUTOS =====
function configurarOuvinteAtributos() {
    // Escuta eventos de mudança de atributos
    document.addEventListener('atributosAlterados', function(e) {
        console.log('Atributos alterados detectados, atualizando NH...');
        atualizarAtributosLocais();
        atualizarTodosNH();
        renderizarPericiasAprendidas();
    });
    
    // Também verifica mudanças nos inputs de atributos diretamente
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                // Verifica se a aba de perícias está visível
                const abaPericias = document.getElementById('pericias');
                if (abaPericias && !abaPericias.classList.contains('active')) {
                    return;
                }
                
                // Atualiza atributos periodicamente (fallback)
                setTimeout(() => {
                    atualizarAtributosLocais();
                    atualizarTodosNH();
                    renderizarPericiasAprendidas();
                }, 100);
            }
        });
    });
    
    // Observa mudanças nos atributos principais
    const atributosElements = ['ST', 'DX', 'IQ', 'HT'];
    atributosElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            observer.observe(element, { attributes: true, attributeFilter: ['value'] });
        }
    });
    
    // Observa mudanças nos bônus de percepção
    const bonusPercepcao = document.getElementById('bonusPercepcao');
    if (bonusPercepcao) {
        observer.observe(bonusPercepcao, { attributes: true, attributeFilter: ['value'] });
    }
}

function atualizarTodosNH() {
    // Atualiza o NH de todas as perícias aprendidas
    estadoPericias.periciasAprendidas.forEach(pericia => {
        const atributoBase = obterAtributoAtual(pericia.atributo);
        pericia.nh = atributoBase + pericia.nivel;
    });
}

// ===== FUNÇÕES DE INICIALIZAÇÃO =====
function inicializarSistemaPericias() {
    console.log('=== INICIALIZANDO SISTEMA DE PERÍCIAS ===');
    
    // Carrega dados salvos
    carregarPericias();
    
    // Configura event listeners
    configurarEventListeners();
    
    // Configura integração com atributos
    configurarOuvinteAtributos();
    
    // Atualiza atributos iniciais
    atualizarAtributosLocais();
    
    // Renderiza interface inicial
    renderizarStatusPericias();
    renderizarFiltros();
    renderizarCatalogo();
    renderizarPericiasAprendidas();
    
    console.log('=== SISTEMA DE PERÍCIAS INICIALIZADO ===');
    console.log('Perícias aprendidas:', estadoPericias.periciasAprendidas.length);
    console.log('Pontos gastos:', estadoPericias.pontosPericias + estadoPericias.pontosCombate);
    console.log('Filtro ativo:', estadoPericias.filtroAtivo);
}

function configurarEventListeners() {
    console.log("Configurando event listeners...");
    
    // Filtros
    const filtroButtons = document.querySelectorAll('.filtro-btn');
    console.log("Botões de filtro encontrados:", filtroButtons.length);
    
    filtroButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const filtro = this.dataset.filtro;
            estadoPericias.filtroAtivo = filtro;
            console.log("Filtro alterado para:", filtro);
            renderizarFiltros();
            renderizarCatalogo();
        });
    });
    
    // Busca
    const buscaInput = document.getElementById('busca-pericias');
    if (buscaInput) {
        buscaInput.addEventListener('input', function() {
            estadoPericias.buscaAtiva = this.value;
            console.log("Busca:", this.value);
            renderizarCatalogo();
        });
    } else {
        console.error("Campo de busca não encontrado!");
    }
    
    // Fechar modais ao clicar fora
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
    
    // Fechar modais com ESC
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

// ===== DEPURAÇÃO E TESTES =====
function debugPericias() {
    console.log("=== DEBUG PERÍCIAS ===");
    console.log("Estado:", estadoPericias);
    console.log("Perícias aprendidas:", estadoPericias.periciasAprendidas);
    console.log("Atributos atuais:", estadoPericias.atributos);
    
    // Testa a tabela de custos
    console.log("Teste tabela Fácil:", obterTabelaCusto('Fácil'));
    console.log("Teste tabela Média:", obterTabelaCusto('Média'));
    console.log("Custo nível 0 Fácil:", calcularCustoPericia(0, 'Fácil'));
    console.log("Custo nível -1 Média:", calcularCustoPericia(-1, 'Média'));
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM carregado, verificando aba de perícias...");
    
    // Inicializa imediatamente se a aba já estiver ativa
    const periciasTab = document.getElementById('pericias');
    if (periciasTab && periciasTab.classList.contains('active')) {
        console.log("Aba de perícias já ativa, inicializando...");
        setTimeout(() => {
            inicializarSistemaPericias();
        }, 100);
    }
    
    // Observa mudanças nas abas para inicializar quando necessário
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'pericias' && tab.classList.contains('active')) {
                    console.log("Aba de perícias ativada!");
                    setTimeout(() => {
                        if (!window.sistemaPericiasInicializado) {
                            inicializarSistemaPericias();
                            window.sistemaPericiasInicializado = true;
                        } else {
                            console.log("Sistema já inicializado, apenas renderizando...");
                            // Apenas atualiza a renderização
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
    
    // Observa todas as abas
    document.querySelectorAll('.tab-content').forEach(tab => {
        observer.observe(tab, { attributes: true });
    });
    
    console.log("Observador de abas configurado");
});

// ===== EXPORTAÇÃO DE FUNÇÕES PARA USO GLOBAL =====
window.alterarNivelPericiaDropdown = alterarNivelPericiaDropdown;
window.selecionarEspecializacao = selecionarEspecializacao;
window.continuarParaNivel = continuarParaNivel;
window.confirmarPericia = confirmarPericia;
window.fecharModalPericia = fecharModalPericia;
window.fecharModalEspecializacao = fecharModalEspecializacao;
window.abrirModalPericia = abrirModalPericia;
window.abrirModalEspecializacao = abrirModalEspecializacao;
window.obterDadosPericias = obterDadosPericias;
window.carregarDadosPericias = carregarDadosPericias;
window.resetarPericias = resetarPericias;
window.inicializarSistemaPericias = inicializarSistemaPericias;
window.debugPericias = debugPericias;

console.log('=== SISTEMA DE PERÍCIAS GURPS CARREGADO ===');
console.log('Funções disponíveis:');
console.log('- obterDadosPericias()');
console.log('- carregarDadosPericias(dados)');
console.log('- resetarPericias()');
console.log('- inicializarSistemaPericias()');
console.log('- debugPericias()');
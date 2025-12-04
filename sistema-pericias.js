// ===== SISTEMA DE PERÍCIAS - VERSÃO COMPLETA =====
// Totalmente compatível com o novo catálogo

let estadoPericias = {
    adquiridas: [],  // Lista de perícias adquiridas
    pontosGastos: 0   // Total de pontos gastos
};

// ===== FUNÇÕES PRINCIPAIS - CATÁLOGO =====

// OBTER TODAS AS PERÍCIAS (simples e com especializações)
function obterTodasPericias() {
    const todas = [];
    
    for (const categoria in window.catalogoPericias) {
        if (categoria === "Combate") {
            // Processar estrutura hierárquica do Combate
            for (const grupo in window.catalogoPericias[categoria]) {
                if (grupo === "Armas de Distância") {
                    // Perícias simples
                    const simples = window.catalogoPericias[categoria][grupo]["Simples"];
                    if (simples) {
                        simples.forEach(pericia => {
                            todas.push({
                                ...pericia,
                                categoria: "Combate",
                                tipoArma: grupo,
                                temEspecializacoes: false
                            });
                        });
                    }
                } else if (grupo === "Armas Corpo-a-Corpo" || grupo === "Montaria") {
                    // Perícias com especializações
                    for (const tipo in window.catalogoPericias[categoria][grupo]) {
                        const pericia = window.catalogoPericias[categoria][grupo][tipo];
                        todas.push({
                            ...pericia,
                            categoria: "Combate",
                            tipoArma: grupo,
                            temEspecializacoes: true
                        });
                    }
                }
            }
        } else {
            // Para outras categorias (DX, IQ, HT, PERC - quando adicionar)
            console.log("Outra categoria:", categoria);
        }
    }
    
    return todas;
}

// OBTER PERÍCIA POR ID
function obterPericiaPorId(id) {
    const todas = obterTodasPericias();
    return todas.find(p => p.id === id);
}

// BUSCAR PERÍCIAS
function buscarPericias(termo = "", filtroAtributo = "Todos") {
    let resultados = obterTodasPericias();
    
    if (termo) {
        resultados = resultados.filter(pericia => 
            pericia.nome.toLowerCase().includes(termo.toLowerCase()) ||
            pericia.descricao.toLowerCase().includes(termo.toLowerCase())
        );
    }
    
    if (filtroAtributo !== "Todos") {
        if (filtroAtributo === "Combate") {
            resultados = resultados.filter(p => p.categoria === "Combate");
        } else {
            resultados = resultados.filter(p => p.atributo === filtroAtributo);
        }
    }
    
    return resultados;
}

// ===== FUNÇÕES DE INTERFACE =====

// CARREGAR PERÍCIAS NA LISTA
function carregarPericiasLista() {
    const lista = document.getElementById('lista-pericias');
    if (!lista) return;
    
    // Limpar grupos existentes
    const grupos = lista.querySelectorAll('.grupo-pericias');
    grupos.forEach(grupo => {
        const conteudo = grupo.querySelector('.grupo-conteudo');
        if (conteudo) conteudo.innerHTML = '<div class="lista-vazia">Carregando...</div>';
    });
    
    // Obter todas as perícias
    const todasPericias = obterTodasPericias();
    
    // Agrupar por tipoArma
    const gruposMap = {};
    
    todasPericias.forEach(pericia => {
        const grupoNome = pericia.tipoArma || pericia.categoria;
        if (!gruposMap[grupoNome]) {
            gruposMap[grupoNome] = [];
        }
        gruposMap[grupoNome].push(pericia);
    });
    
    // Limpar lista principal
    lista.innerHTML = '';
    
    // Adicionar grupos
    for (const grupoNome in gruposMap) {
        const grupoDiv = document.createElement('div');
        grupoDiv.className = 'grupo-pericias ativo';
        grupoDiv.dataset.grupo = grupoNome;
        
        let icone = '⚔️';
        if (grupoNome === 'Armas de Distância') icone = '🏹';
        if (grupoNome === 'Montaria') icone = '🐎';
        
        grupoDiv.innerHTML = `
            <div class="grupo-header">
                <h4>${icone} ${grupoNome}</h4>
                <span class="grupo-icone">▼</span>
            </div>
            <div class="grupo-conteudo"></div>
        `;
        
        lista.appendChild(grupoDiv);
        
        // Adicionar perícias ao grupo
        const conteudo = grupoDiv.querySelector('.grupo-conteudo');
        conteudo.innerHTML = '';
        
        gruposMap[grupoNome].forEach(pericia => {
            const item = criarItemPericiaLista(pericia);
            conteudo.appendChild(item);
        });
        
        // Evento para expandir/colapsar
        grupoDiv.querySelector('.grupo-header').addEventListener('click', () => {
            grupoDiv.classList.toggle('ativo');
        });
    }
    
    atualizarContador();
}

// CRIAR ITEM DE PERÍCIA PARA A LISTA
function criarItemPericiaLista(pericia) {
    const item = document.createElement('div');
    item.className = 'item-lista';
    item.dataset.id = pericia.id;
    item.dataset.tipo = pericia.temEspecializacoes ? 'com-especializacoes' : 'simples';
    
    // Verificar pré-requisitos
    const prereqAtendido = true; // Simplificado por agora
    
    if (!prereqAtendido) {
        item.classList.add('prereq-nao-atendido');
    }
    
    const custoTexto = pericia.temEspecializacoes ? 
        `${pericia.custoBase}+ pts` : 
        `${pericia.custoBase} pts`;
    
    item.innerHTML = `
        <div class="item-header">
            <div class="item-nome">${pericia.nome}</div>
            <div class="item-custo">${custoTexto}</div>
        </div>
        <div class="item-descricao">${pericia.descricao}</div>
        <div class="item-info">
            <span class="item-categoria">${pericia.atributo}/${pericia.dificuldade}</span>
            ${pericia.prereq ? `<span class="item-prereq">Pré-req: ${pericia.prereq}</span>` : ''}
            ${pericia.temEspecializacoes ? '<span class="item-especializacao">(Com especializações)</span>' : ''}
        </div>
    `;
    
    if (prereqAtendido) {
        item.addEventListener('click', () => {
            if (pericia.temEspecializacoes) {
                abrirModalEspecializacoes(pericia);
            } else {
                abrirModalNivel(pericia);
            }
        });
    } else {
        item.title = "Pré-requisito não atendido";
    }
    
    return item;
}

// ===== MODAL DE ESPECIALIZAÇÕES =====

function abrirModalEspecializacoes(pericia) {
    const modal = document.getElementById('modal-pericia');
    const titulo = document.getElementById('modal-titulo-pericia');
    const corpo = document.getElementById('modal-corpo-pericia');
    const btnConfirmar = modal.querySelector('.btn-confirmar');
    const btnCancelar = modal.querySelector('.btn-cancelar');
    
    if (!modal || !titulo || !corpo) return;
    
    titulo.textContent = `${pericia.nome} - Escolher Especialização`;
    
    // Criar HTML das especializações
    let especializacoesHTML = '';
    pericia.especializacoes.forEach((espec, index) => {
        const dificuldade = espec.dificuldade || pericia.dificuldade;
        const custo = espec.custoBase || pericia.custoBase;
        
        especializacoesHTML += `
            <div class="especializacao-item" data-index="${index}">
                <input type="radio" id="espec-${pericia.id}-${index}" 
                       name="especializacao-${pericia.id}" 
                       class="especializacao-radio">
                <label for="espec-${pericia.id}-${index}">
                    <div class="especializacao-header">
                        <strong>${espec.nome}</strong>
                        <span class="especializacao-custo">${custo} pts</span>
                    </div>
                    <div class="especializacao-desc">${espec.descricao}</div>
                    <div class="especializacao-info">
                        <span class="especializacao-prereq">Pré-req: ${espec.prereq}</span>
                        <span class="especializacao-diff">${pericia.atributo}/${dificuldade}</span>
                    </div>
                </label>
            </div>
        `;
    });
    
    corpo.innerHTML = `
        <div class="modal-info">
            <p><strong>Perícia:</strong> ${pericia.nome}</p>
            <p><strong>Atributo:</strong> ${pericia.atributo}</p>
            <p><strong>Dificuldade:</strong> ${pericia.dificuldade}</p>
            <p><strong>Descrição Geral:</strong> ${pericia.descricao}</p>
            <p><strong>Custo Base por Especialização:</strong> ${pericia.custoBase} pts</p>
        </div>
        
        <div class="especializacoes-container">
            <h4>Escolha sua especialização:</h4>
            <div class="especializacoes-lista">
                ${especializacoesHTML}
            </div>
        </div>
        
        <input type="hidden" id="especializacao-index" value="">
    `;
    
    // Configurar eventos das especializações
    const radios = corpo.querySelectorAll('.especializacao-radio');
    const especializacaoIndex = corpo.querySelector('#especializacao-index');
    
    radios.forEach((radio, index) => {
        radio.addEventListener('change', () => {
            especializacaoIndex.value = index;
            btnConfirmar.disabled = false;
        });
    });
    
    // Configurar botão confirmar
    btnConfirmar.onclick = () => {
        const index = parseInt(especializacaoIndex.value);
        if (!isNaN(index) && index >= 0) {
            const especializacao = pericia.especializacoes[index];
            
            // Criar perícia completa com especialização
            const periciaCompleta = {
                id: `${pericia.id}-${especializacao.id}`,
                nome: `${pericia.nome} (${especializacao.nome})`,
                atributo: pericia.atributo,
                dificuldade: especializacao.dificuldade || pericia.dificuldade,
                custoBase: especializacao.custoBase || pericia.custoBase,
                descricao: especializacao.descricao,
                prereq: especializacao.prereq,
                default: especializacao.default,
                categoria: pericia.categoria,
                tipoArma: pericia.tipoArma,
                especializacaoId: especializacao.id,
                especializacaoNome: especializacao.nome
            };
            
            // Fechar modal de especializações
            modal.style.display = 'none';
            
            // Abrir modal de nível
            setTimeout(() => {
                abrirModalNivel(periciaCompleta);
            }, 100);
        }
    };
    
    // Configurar botão cancelar
    btnCancelar.onclick = () => {
        modal.style.display = 'none';
    };
    
    // Configurar fechar modal
    modal.querySelector('.modal-close').onclick = () => {
        modal.style.display = 'none';
    };
    
    // Fechar ao clicar fora
    modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };
    
    // Resetar botão confirmar
    btnConfirmar.disabled = true;
    
    // Mostrar modal
    modal.style.display = 'block';
}

// ===== MODAL DE NÍVEL (BOTÕES + E -) =====

function abrirModalNivel(pericia) {
    const modal = document.getElementById('modal-pericia');
    const titulo = document.getElementById('modal-titulo-pericia');
    const corpo = document.getElementById('modal-corpo-pericia');
    const btnConfirmar = modal.querySelector('.btn-confirmar');
    const btnCancelar = modal.querySelector('.btn-cancelar');
    
    if (!modal || !titulo || !corpo) return;
    
    const atributos = obterAtributosAtuais();
    const valorAtributo = atributos[pericia.atributo] || 10;
    
    // Verificar se já existe esta perícia
    const periciaExistente = estadoPericias.adquiridas.find(p => p.id === pericia.id);
    
    // Definir nível inicial
    let nivelInicial = 0;
    if (periciaExistente) {
        nivelInicial = periciaExistente.nivelRelativo;
    } else {
        // Nível inicial baseado na dificuldade
        if (pericia.dificuldade === 'Fácil') nivelInicial = 0;
        else if (pericia.dificuldade === 'Média') nivelInicial = -1;
        else if (pericia.dificuldade === 'Difícil') nivelInicial = -2;
        else if (pericia.dificuldade === 'Muito Difícil') nivelInicial = -3;
        else nivelInicial = -1; // Padrão
    }
    
    const custoAtual = periciaExistente ? periciaExistente.custo : calcularCustoPericia(nivelInicial, pericia.dificuldade);
    
    titulo.textContent = pericia.nome;
    
    // HTML do modal
    corpo.innerHTML = `
        <div class="modal-info">
            <p><strong>Perícia:</strong> ${pericia.nome}</p>
            <p><strong>Atributo:</strong> ${pericia.atributo} (${valorAtributo})</p>
            <p><strong>Dificuldade:</strong> ${pericia.dificuldade}</p>
            <p><strong>Descrição:</strong> ${pericia.descricao}</p>
            ${pericia.prereq ? `<p><strong>Pré-requisito:</strong> ${pericia.prereq}</p>` : ''}
            ${pericia.default ? `<p><strong>Default:</strong> ${pericia.default}</p>` : ''}
            
            ${periciaExistente ? `
                <div class="info-existente">
                    <strong>Já adquirida:</strong> Nível ${pericia.atributo}${periciaExistente.nivelRelativo >= 0 ? '+' : ''}${periciaExistente.nivelRelativo} (${custoAtual} pts)
                </div>
            ` : ''}
        </div>
        
        <div class="modal-nivel">
            <h4>Selecionar Nível</h4>
            
            <div class="pericia-controle">
                <button id="btn-pericia-menos" class="btn-pericia">-</button>
                
                <div class="pericia-valor-container">
                    <div class="pericia-nh" id="nh-final">${valorAtributo + nivelInicial}</div>
                    <div class="pericia-nivel" id="nivel-relativo">
                        ${pericia.atributo}${nivelInicial >= 0 ? '+' : ''}${nivelInicial}
                    </div>
                </div>
                
                <button id="btn-pericia-mais" class="btn-pericia">+</button>
            </div>
            
            <div class="pericia-custo-container">
                <div class="pericia-custo">
                    Custo: <span id="custo-pericia">${custoAtual}</span> pts
                </div>
                ${periciaExistente ? `
                <div class="pericia-custo-adicional">
                    Custo adicional: <span id="custo-adicional">0</span> pts
                </div>
                ` : ''}
            </div>
            
            <div class="info-custos">
                <small>🎯 <strong>${pericia.dificuldade}:</strong> ${getInfoRedutores(pericia.dificuldade)}</small>
            </div>
        </div>
        
        <input type="hidden" id="nivel-pericia" value="${nivelInicial}">
    `;
    
    // Elementos do DOM
    const nivelHidden = corpo.querySelector('#nivel-pericia');
    const btnMenos = corpo.querySelector('#btn-pericia-menos');
    const btnMais = corpo.querySelector('#btn-pericia-mais');
    const nhFinal = corpo.querySelector('#nh-final');
    const nivelRelativo = corpo.querySelector('#nivel-relativo');
    const custoElement = corpo.querySelector('#custo-pericia');
    const custoAdicional = corpo.querySelector('#custo-adicional');
    
    // Função para atualizar display
    function atualizarDisplay() {
        const nivel = parseInt(nivelHidden.value);
        const custoTotal = calcularCustoPericia(nivel, pericia.dificuldade);
        const nhAtual = valorAtributo + nivel;
        
        // Atualizar valores
        nhFinal.textContent = nhAtual;
        nivelRelativo.innerHTML = `${pericia.atributo}${nivel >= 0 ? '+' : ''}${nivel}`;
        custoElement.textContent = custoTotal;
        
        // Limites dos botões
        const min = (pericia.dificuldade === 'Fácil') ? 0 : -3;
        const max = 10;
        
        btnMenos.disabled = nivel <= min;
        btnMais.disabled = nivel >= max;
        
        // Custo adicional se já existir
        if (periciaExistente && custoAdicional) {
            const custoExtra = custoTotal - custoAtual;
            custoAdicional.textContent = custoExtra >= 0 ? `+${custoExtra}` : custoExtra;
            custoAdicional.style.color = custoExtra > 0 ? '#27ae60' : 
                                         custoExtra < 0 ? '#e74c3c' : '#ccc';
        }
        
        btnConfirmar.disabled = false;
    }
    
    // Eventos dos botões
    btnMenos.addEventListener('click', () => {
        let nivel = parseInt(nivelHidden.value);
        const min = (pericia.dificuldade === 'Fácil') ? 0 : -3;
        
        if (nivel > min) {
            nivelHidden.value = nivel - 1;
            atualizarDisplay();
        }
    });
    
    btnMais.addEventListener('click', () => {
        let nivel = parseInt(nivelHidden.value);
        if (nivel < 10) {
            nivelHidden.value = nivel + 1;
            atualizarDisplay();
        }
    });
    
    // Configurar botões do modal
    btnConfirmar.onclick = () => {
        const nivel = parseInt(nivelHidden.value);
        const custoTotal = calcularCustoPericia(nivel, pericia.dificuldade);
        
        if (custoTotal > 0) {
            adicionarPericia(pericia, nivel, custoTotal);
            modal.style.display = 'none';
        }
    };
    
    btnCancelar.onclick = () => {
        modal.style.display = 'none';
    };
    
    modal.querySelector('.modal-close').onclick = () => {
        modal.style.display = 'none';
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };
    
    // Inicializar
    atualizarDisplay();
    modal.style.display = 'block';
}

// ===== FUNÇÕES DE CUSTO =====

function calcularCustoPericia(nivel, dificuldade) {
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
    
    const tabelaCusto = tabela[dificuldade] || tabela['Média'];
    const entrada = tabelaCusto.find(item => item.nivel === nivel);
    return entrada ? entrada.custo : 1;
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

// ===== GERENCIAMENTO DE PERÍCIAS ADQUIRIDAS =====

function adicionarPericia(pericia, nivel, custo) {
    const indexExistente = estadoPericias.adquiridas.findIndex(p => p.id === pericia.id);
    
    if (indexExistente !== -1) {
        // Atualizar perícia existente
        const custoAntigo = estadoPericias.adquiridas[indexExistente].custo;
        estadoPericias.adquiridas[indexExistente] = {
            ...estadoPericias.adquiridas[indexExistente],
            nivelRelativo: nivel,
            custo: custo,
            dataAtualizacao: new Date().toISOString()
        };
        estadoPericias.pontosGastos += (custo - custoAntigo);
    } else {
        // Adicionar nova perícia
        estadoPericias.adquiridas.push({
            id: pericia.id,
            nome: pericia.nome,
            nivelRelativo: nivel,
            custo: custo,
            atributo: pericia.atributo,
            dificuldade: pericia.dificuldade,
            descricao: pericia.descricao,
            prereq: pericia.prereq,
            tipoArma: pericia.tipoArma,
            especializacaoId: pericia.especializacaoId,
            especializacaoNome: pericia.especializacaoNome,
            dataAdquisicao: new Date().toISOString()
        });
        estadoPericias.pontosGastos += custo;
    }
    
    atualizarInterface();
}

function removerPericia(id) {
    const index = estadoPericias.adquiridas.findIndex(p => p.id === id);
    if (index !== -1) {
        const custo = estadoPericias.adquiridas[index].custo;
        estadoPericias.adquiridas.splice(index, 1);
        estadoPericias.pontosGastos -= custo;
        atualizarInterface();
    }
}

function atualizarPericiasAdquiridas() {
    const lista = document.getElementById('pericias-adquiridas');
    const totalElement = document.getElementById('total-pericias-adquiridas');
    
    if (!lista) return;
    
    lista.innerHTML = '';
    
    if (estadoPericias.adquiridas.length === 0) {
        lista.innerHTML = '<div class="lista-vazia">Nenhuma perícia adquirida</div>';
        if (totalElement) totalElement.textContent = '0 pts';
        return;
    }
    
    estadoPericias.adquiridas.forEach(pericia => {
        const atributos = obterAtributosAtuais();
        const valorAtributo = atributos[pericia.atributo] || 10;
        const nhFinal = valorAtributo + pericia.nivelRelativo;
        
        const item = document.createElement('div');
        item.className = 'item-lista item-adquirido';
        item.innerHTML = `
            <div class="item-header">
                <div class="item-nome">${pericia.nome} (NH ${nhFinal})</div>
                <div class="item-custo">${pericia.custo} pts</div>
            </div>
            <div class="item-info">
                <span class="item-categoria">${pericia.atributo}${pericia.nivelRelativo >= 0 ? '+' : ''}${pericia.nivelRelativo} • ${pericia.dificuldade}</span>
                ${pericia.especializacaoNome ? `<span class="item-especializacao">${pericia.especializacaoNome}</span>` : ''}
            </div>
            ${pericia.descricao ? `<div class="item-descricao">${pericia.descricao}</div>` : ''}
            <button class="btn-remover" onclick="removerPericia('${pericia.id}')">×</button>
        `;
        
        // Adicionar evento para editar
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn-remover')) {
                const periciaOriginal = obterPericiaPorId(pericia.id.split('-')[0]) || pericia;
                abrirModalNivel({
                    ...periciaOriginal,
                    id: pericia.id,
                    nome: pericia.nome,
                    descricao: pericia.descricao
                });
            }
        });
        
        lista.appendChild(item);
    });
    
    if (totalElement) totalElement.textContent = `${estadoPericias.pontosGastos} pts`;
}

// ===== FUNÇÕES AUXILIARES =====

function atualizarInterface() {
    carregarPericiasLista();
    atualizarPericiasAdquiridas();
    atualizarPontuacao();
}

function atualizarContador() {
    const contador = document.getElementById('contador-pericias');
    if (!contador) return;
    
    const todas = obterTodasPericias();
    contador.textContent = `${todas.length} perícias`;
}

function atualizarPontuacao() {
    const totalPericias = document.getElementById('total-pericias');
    const saldoTotal = document.getElementById('saldo-total-pericias');
    const totalAdquiridas = document.getElementById('total-pericias-adquiridas');
    
    if (totalPericias) totalPericias.textContent = `+${estadoPericias.pontosGastos}`;
    if (totalAdquiridas) totalAdquiridas.textContent = `${estadoPericias.pontosGastos} pts`;
    if (saldoTotal) {
        const pontosAtributos = obterPontosGastosAtributos();
        const saldo = 150 - pontosAtributos - estadoPericias.pontosGastos;
        saldoTotal.textContent = saldo;
        saldoTotal.style.color = saldo < 0 ? '#e74c3c' : '#27ae60';
    }
}

function obterAtributosAtuais() {
    // Função para obter atributos do sistema principal
    if (window.obterDadosAtributos) {
        const dados = window.obterDadosAtributos();
        return {
            ST: dados.ST || 10,
            DX: dados.DX || 10,
            IQ: dados.IQ || 10,
            HT: dados.HT || 10,
            PERC: dados.Percepcao || 10
        };
    }
    return { ST: 10, DX: 10, IQ: 10, HT: 10, PERC: 10 };
}

function obterPontosGastosAtributos() {
    if (window.obterDadosAtributos) {
        const dados = window.obterDadosAtributos();
        return dados.PontosGastos || 0;
    }
    return 0;
}

// ===== INICIALIZAÇÃO =====

function inicializarSistemaPericias() {
    console.log('Inicializando sistema de perícias...');
    
    // Configurar busca
    const buscaInput = document.getElementById('busca-pericias');
    const filtroSelect = document.getElementById('filtro-atributo');
    
    if (buscaInput) {
        buscaInput.addEventListener('input', () => {
            carregarPericiasLista();
        });
    }
    
    if (filtroSelect) {
        filtroSelect.addEventListener('change', () => {
            carregarPericiasLista();
        });
    }
    
    // Carregar perícias
    setTimeout(() => {
        carregarPericiasLista();
        atualizarPericiasAdquiridas();
        atualizarPontuacao();
    }, 300);
}

// ===== EVENT LISTENERS =====

document.addEventListener('DOMContentLoaded', function() {
    // Observar quando a aba de perícias é ativada
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'pericias' && tab.classList.contains('active')) {
                    setTimeout(() => {
                        inicializarSistemaPericias();
                    }, 100);
                }
            }
        });
    });
    
    // Observar todas as abas
    document.querySelectorAll('.tab-content').forEach(tab => {
        observer.observe(tab, { attributes: true });
    });
    
    // Verificar se já está ativa
    const periciasTab = document.getElementById('pericias');
    if (periciasTab && periciasTab.classList.contains('active')) {
        setTimeout(() => {
            inicializarSistemaPericias();
        }, 100);
    }
});

// ===== EXPORTAÇÃO =====
window.inicializarSistemaPericias = inicializarSistemaPericias;
window.removerPericia = removerPericia;
window.carregarPericiasLista = carregarPericiasLista;
window.obterTodasPericias = obterTodasPericias;
window.buscarPericias = buscarPericias;
window.obterPericiaPorId = obterPericiaPorId;

console.log('✅ Sistema de perícias carregado!');
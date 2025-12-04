// ===== SISTEMA DE PERÍCIAS - VERSÃO REFORMULADA =====
// Sistema simplificado sem subcategorias, com grupos colapsáveis

let estadoPericias = {
    adquiridas: [],
    pontosGastos: 0
};

// ===== FUNÇÕES PRINCIPAIS =====

// CARREGAR PERÍCIAS COM GRUPOS
function carregarPericiasComGrupos() {
    const lista = document.getElementById('lista-pericias');
    if (!lista) return;

    if (!window.catalogoPericias || Object.keys(window.catalogoPericias).length === 0) {
        console.log('Aguardando catálogo de perícias...');
        setTimeout(carregarPericiasComGrupos, 200);
        return;
    }
    
    // Obter filtros atuais
    const termo = document.getElementById('busca-pericias')?.value || '';
    const filtroAtributo = document.getElementById('filtro-atributo')?.value || 'Todos';
    
    // Para cada grupo no HTML
    const grupos = lista.querySelectorAll('.grupo-pericias');
    
    grupos.forEach(grupo => {
        const tipo = grupo.dataset.tipo;
        const conteudo = grupo.querySelector('.grupo-conteudo');
        
        // Filtrar perícias para este grupo
        let periodasFiltradas = [];
        
        if (tipo === 'Combate') {
            // Para combate, pegar todas as perícias de combate
            const todasPericias = obterTodasPericias();
            periodasFiltradas = todasPericias.filter(p => p.categoria === 'Combate');
        } else {
            // Para outros atributos
            const todasPericias = obterTodasPericias();
            periodasFiltradas = todasPericias.filter(p => p.atributo === tipo);
        }
        
        // Aplicar filtro de busca
        if (termo) {
            periodasFiltradas = periodasFiltradas.filter(pericia => 
                pericia.nome.toLowerCase().includes(termo.toLowerCase()) ||
                pericia.descricao.toLowerCase().includes(termo.toLowerCase())
            );
        }
        
        // Aplicar filtro de atributo (se não for "Todos")
        if (filtroAtributo !== 'Todos') {
            if (filtroAtributo === 'Combate') {
                periodasFiltradas = periodasFiltradas.filter(p => p.categoria === 'Combate');
            } else {
                periodasFiltradas = periodasFiltradas.filter(p => p.atributo === filtroAtributo);
            }
        }
        
        // Limpar conteúdo
        conteudo.innerHTML = '';
        
        // Verificar se há perícias para mostrar
        if (periodasFiltradas.length === 0) {
            conteudo.innerHTML = '<div class="lista-vazia">Nenhuma perícia encontrada</div>';
            
            // Esconder grupo se estiver vazio
            if (termo || filtroAtributo !== 'Todos') {
                grupo.style.display = 'none';
            } else {
                grupo.style.display = 'block';
            }
            return;
        }
        
        // Mostrar grupo
        grupo.style.display = 'block';
        
        // Ordenar perícias por nome
        periodasFiltradas.sort((a, b) => a.nome.localeCompare(b.nome));
        
        // Adicionar cada perícia
        periodasFiltradas.forEach(pericia => {
            const item = criarItemPericia(pericia);
            conteudo.appendChild(item);
        });
    });
    
    // Atualizar contador
    atualizarContadorPericias();
}

// CRIAR ITEM DE PERÍCIA
function criarItemPericia(pericia) {
    const item = document.createElement('div');
    item.className = 'item-lista';
    item.dataset.id = pericia.id;
    
    // Verificar pré-requisitos
    const prereqAtendido = verificarPreRequisito(pericia.prereq);
    
    if (!prereqAtendido) {
        item.classList.add('prereq-nao-atendido');
    }
    
    // HTML do item
    item.innerHTML = `
        <div class="item-header">
            <div class="item-nome">${pericia.nome}</div>
            <div class="item-custo">${pericia.custoBase} pts</div>
        </div>
        <div class="item-descricao">${pericia.descricao}</div>
        <div class="item-info">
            <span class="item-categoria">${pericia.atributo}/${pericia.dificuldade}</span>
            ${pericia.prereq ? `<span class="item-prereq">Pré-req: ${pericia.prereq}</span>` : ''}
        </div>
    `;
    
    // Adicionar evento de clique (se pré-requisito atendido)
    if (prereqAtendido) {
        item.addEventListener('click', () => abrirModalPericia(pericia));
    } else {
        item.title = "Pré-requisito não atendido: " + pericia.prereq;
    }
    
    return item;
}

// VERIFICAR PRÉ-REQUISITO
function verificarPreRequisito(prereq) {
    if (!prereq) return true;
    
    // Lógica simplificada - você pode expandir isso
    // Por enquanto, assume que todos os pré-requisitos são atendidos
    // Na implementação real, você verificaria se a perícia está adquirida no nível necessário
    return true;
}

// ATUALIZAR CONTADOR
function atualizarContadorPericias() {
    const contador = document.getElementById('contador-pericias');
    if (!contador) return;
    
    const todasPericias = obterTodasPericias();
    const termo = document.getElementById('busca-pericias')?.value || '';
    const filtroAtributo = document.getElementById('filtro-atributo')?.value || 'Todos';
    
    let periodasFiltradas = todasPericias;
    
    // Aplicar filtros
    if (termo) {
        periodasFiltradas = periodasFiltradas.filter(pericia => 
            pericia.nome.toLowerCase().includes(termo.toLowerCase()) ||
            pericia.descricao.toLowerCase().includes(termo.toLowerCase())
        );
    }
    
    if (filtroAtributo !== 'Todos') {
        if (filtroAtributo === 'Combate') {
            periodasFiltradas = periodasFiltradas.filter(p => p.categoria === 'Combate');
        } else {
            periodasFiltradas = periodasFiltradas.filter(p => p.atributo === filtroAtributo);
        }
    }
    
    contador.textContent = `${periodasFiltradas.length} perícias`;
}

// ===== FUNÇÕES DO MODAL (MANTIDAS) =====

// ABRIR MODAL DA PERÍCIA
function abrirModalPericia(pericia) {
    const modal = document.getElementById('modal-pericia');
    const titulo = document.getElementById('modal-titulo-pericia');
    const corpo = document.getElementById('modal-corpo-pericia');
    const btnConfirmar = modal?.querySelector('.btn-confirmar');
    
    if (!modal || !titulo || !corpo || !btnConfirmar) return;
    
    const atributos = obterAtributosAtuais();
    const valorAtributo = atributos[pericia.atributo] || 10;
    
    // Verificar se já existe esta perícia
    const periciaExistente = estadoPericias.adquiridas.find(p => p.id === pericia.id);
    
    // Definir nível inicial baseado na dificuldade
    let nivelInicial = 0;
    if (periciaExistente) {
        nivelInicial = periciaExistente.nivelRelativo;
    } else {
        // Para perícias novas, definir nível inicial CORRETO
        if (pericia.dificuldade === 'Fácil') {
            nivelInicial = 0;
        } else if (pericia.dificuldade === 'Média') {
            nivelInicial = -1;
        } else if (pericia.dificuldade === 'Difícil') {
            nivelInicial = -2;
        } else if (pericia.dificuldade === 'Muito Difícil') {
            nivelInicial = -3;
        }
    }
    
    const custoAtual = periciaExistente ? periciaExistente.custo : calcularCustoPericia(nivelInicial, pericia.dificuldade);
    
    titulo.textContent = pericia.nome;
    
    // HTML do modal
    corpo.innerHTML = `
        <div class="modal-info">
            <p><strong>Atributo:</strong> ${pericia.atributo} (${valorAtributo})</p>
            <p><strong>Dificuldade:</strong> ${pericia.dificuldade}</p>
            <p><strong>Descrição:</strong> ${pericia.descricao}</p>
            ${pericia.prereq ? `<p><strong>Pré-requisito:</strong> ${pericia.prereq}</p>` : ''}
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
    const custo = corpo.querySelector('#custo-pericia');
    const custoAdicional = corpo.querySelector('#custo-adicional');
    
    // Função para obter limites
    function getLimites(dificuldade) {
        return { 
            min: (dificuldade === 'Fácil') ? 0 : -3, 
            max: 10 
        };
    }
    
    // Função para atualizar a exibição
    function atualizarDisplay() {
        const nivel = parseInt(nivelHidden.value);
        const custoTotal = calcularCustoPericia(nivel, pericia.dificuldade);
        const nhAtual = valorAtributo + nivel;
        const limites = getLimites(pericia.dificuldade);
        
        // Atualizar valores na tela
        nhFinal.textContent = nhAtual;
        nivelRelativo.innerHTML = `${pericia.atributo}${nivel >= 0 ? '+' : ''}${nivel}`;
        custo.textContent = custoTotal;
        
        // Botões
        btnMenos.disabled = nivel <= limites.min;
        btnMais.disabled = nivel >= limites.max;
        
        // Calcular custo adicional se já existir a perícia
        if (periciaExistente && custoAdicional) {
            const custoExtra = custoTotal - custoAtual;
            custoAdicional.textContent = custoExtra >= 0 ? `+${custoExtra}` : custoExtra;
            custoAdicional.style.color = custoExtra > 0 ? '#27ae60' : (custoExtra < 0 ? '#e74c3c' : '#ccc');
        }
        
        // Botão confirmar
        btnConfirmar.disabled = false;
    }
    
    // Eventos dos botões
    btnMenos.addEventListener('click', () => {
        let nivel = parseInt(nivelHidden.value);
        let novoNivel = nivel - 1;
        const limites = getLimites(pericia.dificuldade);
        
        if (novoNivel >= limites.min) {
            nivelHidden.value = novoNivel;
            atualizarDisplay();
        }
    });
    
    btnMais.addEventListener('click', () => {
        let nivel = parseInt(nivelHidden.value);
        let novoNivel = nivel + 1;
        const limites = getLimites(pericia.dificuldade);
        
        if (novoNivel <= limites.max) {
            nivelHidden.value = novoNivel;
            atualizarDisplay();
        }
    });
    
    // Inicializar display
    atualizarDisplay();
    
    // Configurar botão confirmar
    btnConfirmar.onclick = () => {
        const nivel = parseInt(nivelHidden.value);
        const custoTotal = calcularCustoPericia(nivel, pericia.dificuldade);
        
        if (custoTotal > 0) {
            adicionarPericia(pericia, nivel, custoTotal);
            modal.style.display = 'none';
        }
    };
    
    // Configurar botão cancelar e fechar
    modal.querySelector('.btn-cancelar').onclick = () => modal.style.display = 'none';
    modal.querySelector('.modal-close').onclick = () => modal.style.display = 'none';
    
    // Fechar modal ao clicar fora
    modal.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    // Mostrar modal
    modal.style.display = 'block';
}

// ===== FUNÇÕES AUXILIARES (MANTIDAS) =====

// CALCULAR CUSTO DA PERÍCIA
function calcularCustoPericia(nivel, dificuldade) {
    const tabelaCustos = {
        'Fácil': [
            { nivel: 0, custo: 1 },   // 1 ponto = +0
            { nivel: 1, custo: 2 },   // 2 pontos = +1
            { nivel: 2, custo: 4 },   // 4 pontos = +2
            { nivel: 3, custo: 8 }, { nivel: 4, custo: 12 }, { nivel: 5, custo: 16 },
            { nivel: 6, custo: 20 }, { nivel: 7, custo: 24 }, { nivel: 8, custo: 28 },
            { nivel: 9, custo: 32 }, { nivel: 10, custo: 36 }
        ],
        'Média': [
            { nivel: -1, custo: 1 },  // 1 ponto = -1
            { nivel: 0, custo: 2 },   // 2 pontos = +0
            { nivel: 1, custo: 4 },   // 4 pontos = +1
            { nivel: 2, custo: 8 }, { nivel: 3, custo: 12 }, { nivel: 4, custo: 16 },
            { nivel: 5, custo: 20 }, { nivel: 6, custo: 24 }, { nivel: 7, custo: 28 },
            { nivel: 8, custo: 32 }, { nivel: 9, custo: 36 }, { nivel: 10, custo: 40 }
        ],
        'Difícil': [
            { nivel: -2, custo: 1 },  // 1 ponto = -2
            { nivel: -1, custo: 2 },  // 2 pontos = -1
            { nivel: 0, custo: 4 },   // 4 pontos = +0
            { nivel: 1, custo: 8 }, { nivel: 2, custo: 12 }, { nivel: 3, custo: 16 },
            { nivel: 4, custo: 20 }, { nivel: 5, custo: 24 }, { nivel: 6, custo: 28 },
            { nivel: 7, custo: 32 }, { nivel: 8, custo: 36 }, { nivel: 9, custo: 40 },
            { nivel: 10, custo: 44 }
        ],
        'Muito Difícil': [
            { nivel: -3, custo: 1 },  // 1 ponto = -3
            { nivel: -2, custo: 2 },  // 2 pontos = -2
            { nivel: -1, custo: 4 },  // 4 pontos = -1
            { nivel: 0, custo: 8 },   // 8 pontos = +0
            { nivel: 1, custo: 12 }, { nivel: 2, custo: 16 }, { nivel: 3, custo: 20 },
            { nivel: 4, custo: 24 }, { nivel: 5, custo: 28 }, { nivel: 6, custo: 32 },
            { nivel: 7, custo: 36 }, { nivel: 8, custo: 40 }, { nivel: 9, custo: 44 },
            { nivel: 10, custo: 48 }
        ]
    };
    
    const tabela = tabelaCustos[dificuldade] || tabelaCustos['Média'];
    const entrada = tabela.find(item => item.nivel === nivel);
    
    return entrada ? entrada.custo : 1;
}

// OBTER INFORMAÇÕES DE REDUTORES
function getInfoRedutores(dificuldade) {
    const infos = {
        "Fácil": "1 ponto = Atributo+0 | 2 pontos = Atributo+1 | 4 pontos = Atributo+2",
        "Média": "1 ponto = Atributo-1 | 2 pontos = Atributo+0 | 4 pontos = Atributo+1",  
        "Difícil": "1 ponto = Atributo-2 | 2 pontos = Atributo-1 | 4 pontos = Atributo+0",
        "Muito Difícil": "1 ponto = Atributo-3 | 2 pontos = Atributo-2 | 4 pontos = Atributo-1 | 8 pontos = Atributo+0"
    };
    return infos[dificuldade] || infos["Média"];
}

// ADICIONAR PERÍCIA
function adicionarPericia(pericia, nivel, custo) {
    const indexExistente = estadoPericias.adquiridas.findIndex(p => p.id === pericia.id);
    
    if (indexExistente !== -1) {
        const custoAntigo = estadoPericias.adquiridas[indexExistente].custo;
        estadoPericias.adquiridas[indexExistente] = {
            ...estadoPericias.adquiridas[indexExistente],
            nivelRelativo: nivel,
            custo: custo
        };
        estadoPericias.pontosGastos += (custo - custoAntigo);
    } else {
        estadoPericias.adquiridas.push({
            id: pericia.id,
            nome: pericia.nome,
            nivelRelativo: nivel,
            custo: custo,
            atributo: pericia.atributo,
            dificuldade: pericia.dificuldade,
            descricao: pericia.descricao
        });
        estadoPericias.pontosGastos += custo;
    }
    
    atualizarInterface();
}

// ATUALIZAR INTERFACE COMPLETA
function atualizarInterface() {
    carregarPericiasComGrupos();
    atualizarPericiasAdquiridas();
    atualizarPontuacao();
}

// ATUALIZAR PERÍCIAS ADQUIRIDAS
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
                ${pericia.descricao ? `<div class="item-descricao">${pericia.descricao}</div>` : ''}
            </div>
            <button class="btn-remover" onclick="removerPericia('${pericia.id}')">×</button>
        `;
        
        lista.appendChild(item);
    });
    
    if (totalElement) totalElement.textContent = `${estadoPericias.pontosGastos} pts`;
}

// REMOVER PERÍCIA
function removerPericia(id) {
    const index = estadoPericias.adquiridas.findIndex(p => p.id === id);
    if (index !== -1) {
        const custo = estadoPericias.adquiridas[index].custo;
        estadoPericias.adquiridas.splice(index, 1);
        estadoPericias.pontosGastos -= custo;
        atualizarInterface();
    }
}

// ATUALIZAR PONTUAÇÃO
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
        if (saldo < 0) {
            saldoTotal.style.color = '#e74c3c';
        } else {
            saldoTotal.style.color = '#27ae60';
        }
    }
}

// ===== FUNÇÕES DE UTILIDADE =====

// OBTER TODAS AS PERÍCIAS
function obterTodasPericias() {
    if (!window.catalogoPericias || Object.keys(window.catalogoPericias).length === 0) {
        return [];
    }
    
    const todas = [];
    for (const categoria in window.catalogoPericias) {
        // Se for um objeto com subcategorias (como "Combate")
        if (typeof window.catalogoPericias[categoria] === 'object' && 
            !Array.isArray(window.catalogoPericias[categoria])) {
            for (const subcat in window.catalogoPericias[categoria]) {
                todas.push(...window.catalogoPericias[categoria][subcat]);
            }
        } else {
            // Se for um array direto
            todas.push(...window.catalogoPericias[categoria]);
        }
    }
    return todas;
}

// OBTER ATRIBUTOS ATUAIS
function obterAtributosAtuais() {
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

// OBTER PONTOS GASTOS EM ATRIBUTOS
function obterPontosGastosAtributos() {
    if (window.obterDadosAtributos) {
        const dados = window.obterDadosAtributos();
        return dados.PontosGastos || 0;
    }
    return 0;
}

// ===== INICIALIZAÇÃO =====

function inicializarSistemaPericiasReformulado() {
    console.log('Inicializando sistema de perícias reformulado...');
    
    // Configurar eventos de busca
    const buscaInput = document.getElementById('busca-pericias');
    const filtroSelect = document.getElementById('filtro-atributo');
    
    if (buscaInput) {
        buscaInput.addEventListener('input', () => {
            carregarPericiasComGrupos();
        });
    }
    
    if (filtroSelect) {
        filtroSelect.addEventListener('change', () => {
            carregarPericiasComGrupos();
        });
    }
    
    // Configurar grupos colapsáveis
    const grupoHeaders = document.querySelectorAll('.grupo-header');
    grupoHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const grupo = header.parentElement;
            grupo.classList.toggle('ativo');
        });
    });
    
    // Carregar perícias inicialmente
    setTimeout(() => {
        carregarPericiasComGrupos();
        atualizarPericiasAdquiridas();
        atualizarPontuacao();
    }, 300);
}

// ===== CONFIGURAÇÃO DE EVENTOS =====

document.addEventListener('DOMContentLoaded', function() {
    // Observar quando a aba de perícias é ativada
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'pericias' && tab.classList.contains('active')) {
                    setTimeout(() => {
                        inicializarSistemaPericiasReformulado();
                    }, 100);
                }
            }
        });
    });
    
    // Observar todas as abas
    document.querySelectorAll('.tab-content').forEach(tab => {
        observer.observe(tab, { attributes: true });
    });
    
    // Verificar se a aba de perícias já está ativa
    const periciasTab = document.getElementById('pericias');
    if (periciasTab && periciasTab.classList.contains('active')) {
        setTimeout(() => {
            inicializarSistemaPericiasReformulado();
        }, 100);
    }
});

// ===== EXPORTAÇÃO DE FUNÇÕES =====
window.inicializarSistemaPericiasReformulado = inicializarSistemaPericiasReformulado;
window.removerPericia = removerPericia;
window.carregarPericiasComGrupos = carregarPericiasComGrupos;
// ===== SISTEMA DE PERÍCIAS - VERSÃO DEFINITIVA COM BOTÕES + E - =====

let estadoPericias = {
    adquiridas: [],
    pontosGastos: 0
};

// CARREGAR PERÍCIAS NA LISTA
function carregarPericias() {
    const lista = document.getElementById('lista-pericias');
    if (!lista) return;

    if (!window.catalogoPericias || Object.keys(window.catalogoPericias).length === 0) {
        lista.innerHTML = '<div class="lista-vazia">Carregando catálogo de perícias...</div>';
        setTimeout(carregarPericias, 200);
        return;
    }
    
    lista.innerHTML = '';
    
    let todasPericias = [];
    for (const categoria in window.catalogoPericias) {
        todasPericias = todasPericias.concat(window.catalogoPericias[categoria]);
    }
    
    if (todasPericias.length === 0) {
        lista.innerHTML = '<div class="lista-vazia">Nenhuma perícia encontrada</div>';
        return;
    }
    
    todasPericias.forEach(pericia => {
        const item = document.createElement('div');
        item.className = 'item-lista';
        item.innerHTML = `
            <div class="item-header">
                <div class="item-nome">${pericia.nome}</div>
                <div class="item-custo">${pericia.custoBase} pts</div>
            </div>
            <div class="item-descricao">${pericia.descricao}</div>
            <div class="item-categoria">${pericia.atributo}/${pericia.dificuldade}</div>
            ${pericia.subcategoria ? `<div class="item-subcategoria">${pericia.subcategoria}</div>` : ''}
        `;
        
        item.addEventListener('click', () => abrirModalPericia(pericia));
        lista.appendChild(item);
    });
}

// CARREGAR PERÍCIAS FILTRADAS
function carregarPericiasFiltradas(termo = "", categoria = "", subcategoria = "") {
    const lista = document.getElementById('lista-pericias');
    if (!lista || !window.buscarPericias) {
        carregarPericias();
        return;
    }
    
    const resultados = window.buscarPericias(termo, categoria, subcategoria);
    
    lista.innerHTML = '';
    
    if (resultados.length === 0) {
        lista.innerHTML = '<div class="lista-vazia">Nenhuma perícia encontrada</div>';
        return;
    }
    
    resultados.forEach(pericia => {
        const item = document.createElement('div');
        item.className = 'item-lista';
        item.innerHTML = `
            <div class="item-header">
                <div class="item-nome">${pericia.nome}</div>
                <div class="item-custo">${pericia.custoBase} pts</div>
            </div>
            <div class="item-descricao">${pericia.descricao}</div>
            <div class="item-categoria">${pericia.atributo}/${pericia.dificuldade}</div>
            ${pericia.subcategoria ? `<div class="item-subcategoria">${pericia.subcategoria}</div>` : ''}
        `;
        
        item.addEventListener('click', () => abrirModalPericia(pericia));
        lista.appendChild(item);
    });
}

// ATUALIZAR FILTROS
function atualizarFiltrosPericias() {
    const termo = document.getElementById('busca-pericias')?.value || '';
    const categoria = document.getElementById('categoria-pericias')?.value || '';
    const subcategoria = document.getElementById('subcategoria-pericias')?.value || '';
    
    if (window.obterSubcategorias && categoria !== 'Todas') {
        const subcategorias = window.obterSubcategorias(categoria);
        const subcategoriaSelect = document.getElementById('subcategoria-pericias');
        if (subcategoriaSelect) {
            subcategoriaSelect.innerHTML = '<option value="Todas">Todas Subcategorias</option>';
            subcategorias.forEach(sub => {
                subcategoriaSelect.innerHTML += `<option value="${sub}">${sub}</option>`;
            });
        }
    }
    
    carregarPericiasFiltradas(termo, categoria, subcategoria);
}

// CALCULAR CUSTO DA PERÍCIA - TABELA CORRIGIDA
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
            { nivel: -2, custo: 1 },  // 1 ponto = -2
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

// OBTER INFORMAÇÕES DE REDUTORES - ATUALIZADO
function getInfoRedutores(dificuldade) {
    const infos = {
        "Fácil": "1 ponto = Atributo+0 | 2 pontos = Atributo+1 | 4 pontos = Atributo+2",
        "Média": "1 ponto = Atributo-2 ou -1 | 2 pontos = Atributo+0 | 4 pontos = Atributo+1",  
        "Difícil": "1 ponto = Atributo-2 | 2 pontos = Atributo-1 | 4 pontos = Atributo+0",
        "Muito Difícil": "1 ponto = Atributo-3 | 2 pontos = Atributo-2 | 4 pontos = Atributo-1 | 8 pontos = Atributo+0"
    };
    return infos[dificuldade] || infos["Média"];
}

// ABRIR MODAL DA PERÍCIA COM BOTÕES + E -
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
    
    // Para Fácil, começa sempre no 0 (não tem redutores)
    let nivelInicial = 0;
    if (periciaExistente) {
        nivelInicial = periciaExistente.nivelRelativo;
    } else if (pericia.dificuldade !== 'Fácil') {
        // Para outras dificuldades, começa no melhor redutor disponível
        if (pericia.dificuldade === 'Muito Difícil') {
            nivelInicial = -3; // Melhor redutor: -3
        } else if (pericia.dificuldade === 'Difícil') {
            nivelInicial = -2; // Melhor redutor: -2
        } else if (pericia.dificuldade === 'Média') {
            nivelInicial = -2; // Melhor redutor: -2
        }
    }
    
    const custoAtual = periciaExistente ? periciaExistente.custo : calcularCustoPericia(nivelInicial, pericia.dificuldade);
    
    titulo.textContent = pericia.nome;
    
    // HTML atualizado com botões + e -
    corpo.innerHTML = `
        <div class="modal-info">
            <p><strong>Atributo:</strong> ${pericia.atributo} (${valorAtributo})</p>
            <p><strong>Dificuldade:</strong> ${pericia.dificuldade}</p>
            <p><strong>Descrição:</strong> ${pericia.descricao}</p>
            ${pericia.prereq ? `<p><strong>Pré-requisito:</strong> ${pericia.prereq}</p>` : ''}
            ${periciaExistente ? `<p class="info-existente"><strong>Já adquirida:</strong> Nível ${pericia.atributo}${periciaExistente.nivelRelativo >= 0 ? '+' : ''}${periciaExistente.nivelRelativo} (${custoAtual} pts)</p>` : ''}
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
    
    // Função para verificar se pode mudar de nível
    function podeMudarNivel(nivelAtual, novoNivel, direcao) {
        // Limites absolutos
        if (novoNivel < -3 || novoNivel > 10) return false;
        
        // Para Fácil, mínimo é 0 (não tem redutores)
        if (pericia.dificuldade === 'Fácil' && novoNivel < 0) return false;
        
        const custoAtualNivel = calcularCustoPericia(nivelAtual, pericia.dificuldade);
        const custoNovoNivel = calcularCustoPericia(novoNivel, pericia.dificuldade);
        
        // Sempre permite se o custo for diferente
        if (custoAtualNivel !== custoNovoNivel) return true;
        
        // Para Média: -2 e -1 custam o mesmo (1 ponto), não pode alternar entre eles
        if (pericia.dificuldade === 'Média' && 
            ((nivelAtual === -2 && novoNivel === -1) || 
             (nivelAtual === -1 && novoNivel === -2))) {
            return false;
        }
        
        return false;
    }
    
    // Função para atualizar a exibição
    function atualizarDisplay() {
        const nivel = parseInt(nivelHidden.value);
        const custoTotal = calcularCustoPericia(nivel, pericia.dificuldade);
        const nhAtual = valorAtributo + nivel;
        
        // Atualizar valores na tela
        nhFinal.textContent = nhAtual;
        nivelRelativo.textContent = nivel >= 0 ? `+${nivel}` : `${nivel}`;
        nivelRelativo.innerHTML = `${pericia.atributo}${nivel >= 0 ? '+' : ''}${nivel}`;
        custo.textContent = custoTotal;
        
        // Atualizar botões baseado na lógica
        btnMenos.disabled = !podeMudarNivel(nivel, nivel - 1, 'menos');
        btnMais.disabled = !podeMudarNivel(nivel, nivel + 1, 'mais');
        
        // Calcular custo adicional se já existir a perícia
        if (periciaExistente && custoAdicional) {
            const custoExtra = custoTotal - custoAtual;
            custoAdicional.textContent = custoExtra >= 0 ? `+${custoExtra}` : custoExtra;
            custoAdicional.style.color = custoExtra > 0 ? '#27ae60' : (custoExtra < 0 ? '#e74c3c' : '#ccc');
        }
        
        // Habilitar/desabilitar botão confirmar
        btnConfirmar.disabled = custoTotal <= 0;
    }
    
    // Eventos dos botões
    btnMenos.addEventListener('click', () => {
        let nivel = parseInt(nivelHidden.value);
        let novoNivel = nivel - 1;
        
        if (podeMudarNivel(nivel, novoNivel, 'menos')) {
            nivelHidden.value = novoNivel;
            atualizarDisplay();
        }
    });
    
    btnMais.addEventListener('click', () => {
        let nivel = parseInt(nivelHidden.value);
        let novoNivel = nivel + 1;
        
        if (podeMudarNivel(nivel, novoNivel, 'mais')) {
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

// ADICIONAR PERÍCIA - MANTIDO CUMLATIVO
function adicionarPericia(pericia, nivel, custo) {
    const indexExistente = estadoPericias.adquiridas.findIndex(p => p.id === pericia.id);
    
    if (indexExistente !== -1) {
        const custoAntigo = estadoPericias.adquiridas[indexExistente].custo;
        estadoPericias.adquiridas[indexExistente] = {
            id: pericia.id,
            nome: pericia.nome,
            nivelRelativo: nivel,
            custo: custo,
            atributo: pericia.atributo,
            dificuldade: pericia.dificuldade
        };
        estadoPericias.pontosGastos += (custo - custoAntigo);
    } else {
        estadoPericias.adquiridas.push({
            id: pericia.id,
            nome: pericia.nome,
            nivelRelativo: nivel,
            custo: custo,
            atributo: pericia.atributo,
            dificuldade: pericia.dificuldade
        });
        estadoPericias.pontosGastos += custo;
    }
    
    atualizarInterface();
}

// ATUALIZAR INTERFACE COMPLETA
function atualizarInterface() {
    carregarPericias();
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
            <div class="item-categoria">${pericia.atributo}${pericia.nivelRelativo >= 0 ? '+' : ''}${pericia.nivelRelativo} • ${pericia.dificuldade}</div>
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

// OBTER ATRIBUTOS
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

// INICIALIZAR SISTEMA
function inicializarSistemaPericias() {
    const lista = document.getElementById('lista-pericias');
    if (!lista) {
        setTimeout(inicializarSistemaPericias, 100);
        return;
    }
    
    if (!window.catalogoPericias || Object.keys(window.catalogoPericias).length === 0) {
        setTimeout(inicializarSistemaPericias, 100);
        return;
    }
    
    const categoriaSelect = document.getElementById('categoria-pericias');
    const subcategoriaSelect = document.getElementById('subcategoria-pericias');
    const buscaInput = document.getElementById('busca-pericias');
    
    if (categoriaSelect) {
        categoriaSelect.addEventListener('change', atualizarFiltrosPericias);
    }
    if (subcategoriaSelect) {
        subcategoriaSelect.addEventListener('change', atualizarFiltrosPericias);
    }
    if (buscaInput) {
        buscaInput.addEventListener('input', atualizarFiltrosPericias);
    }
    
    carregarPericias();
    atualizarPericiasAdquiridas();
    atualizarPontuacao();
}

// CONFIGURAR EVENT LISTENERS
document.addEventListener('DOMContentLoaded', function() {
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
    
    document.querySelectorAll('.tab-content').forEach(tab => {
        observer.observe(tab, { attributes: true });
    });
    
    const periciasTab = document.getElementById('pericias');
    if (periciasTab && periciasTab.classList.contains('active')) {
        setTimeout(() => {
            inicializarSistemaPericias();
        }, 100);
    }
});

// EXPORTAR FUNÇÕES
window.inicializarSistemaPericias = inicializarSistemaPericias;
window.removerPericia = removerPericia;
window.carregarPericias = carregarPericias;
window.atualizarFiltrosPericias = atualizarFiltrosPericias;
// ===== SISTEMA DE PERÍCIAS - VERSÃO DEFINITIVA =====

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

// CALCULAR CUSTO DA PERÍCIA - TABELA DO SEU PROJETO ANTERIOR
function calcularCustoPericia(nivel, dificuldade) {
    const tabelaBonus = {
        'Fácil': { 1: 0, 2: 1, 4: 2, 8: 3, 12: 4, 16: 5, 20: 6, 24: 7, 28: 8, 32: 9, 36: 10, 40: 11 },
        'Média': { 1: -1, 2: 0, 4: 1, 8: 2, 12: 3, 16: 4, 20: 5, 24: 6, 28: 7, 32: 8, 36: 9, 40: 10 },
        'Difícil': { 1: -2, 2: -1, 4: 0, 8: 1, 12: 2, 16: 3, 20: 4, 24: 5, 28: 6, 32: 7, 36: 8, 40: 9 },
        'Muito Difícil': { 1: -3, 2: -2, 4: -1, 8: 0, 12: 1, 16: 2, 20: 3, 24: 4, 28: 5, 32: 6, 36: 7, 40: 8 }
    };
    
    const bonusTable = tabelaBonus[dificuldade] || tabelaBonus['Média'];
    
    for (const [pontos, bonus] of Object.entries(bonusTable)) {
        if (bonus === nivel) {
            return parseInt(pontos);
        }
    }
    
    return 0;
}

// OBTER INFORMAÇÕES DE REDUTORES
function getInfoRedutores(dificuldade) {
    const infos = {
        "Fácil": "1 ponto = Atributo+0",
        "Média": "1 ponto = Atributo-1 | 2 pontos = Atributo+0",  
        "Difícil": "1 ponto = Atributo-2 | 2 pontos = Atributo-1 | 4 pontos = Atributo+0",
        "Muito Difícil": "1 ponto = Atributo-3 | 2 pontos = Atributo-2 | 4 pontos = Atributo-1 | 8 pontos = Atributo+0"
    };
    return infos[dificuldade] || infos["Média"];
}

// ABRIR MODAL DA PERÍCIA
function abrirModalPericia(pericia) {
    const modal = document.getElementById('modal-pericia');
    const titulo = document.getElementById('modal-titulo-pericia');
    const corpo = document.getElementById('modal-corpo-pericia');
    const btnConfirmar = modal?.querySelector('.btn-confirmar');
    
    if (!modal || !titulo || !corpo || !btnConfirmar) return;
    
    const atributos = obterAtributosAtuais();
    const valorAtributo = atributos[pericia.atributo] || 10;
    
    titulo.textContent = pericia.nome;
    
    corpo.innerHTML = `
        <div class="modal-info">
            <p><strong>Atributo:</strong> ${pericia.atributo} (${valorAtributo})</p>
            <p><strong>Dificuldade:</strong> ${pericia.dificuldade}</p>
            <p><strong>Descrição:</strong> ${pericia.descricao}</p>
            ${pericia.prereq ? `<p><strong>Pré-requisito:</strong> ${pericia.prereq}</p>` : ''}
        </div>
        
        <div class="modal-nivel">
            <h4>Selecionar Nível</h4>
            <input type="range" id="nivel-pericia" class="nivel-slider" min="-3" max="10" value="0" step="1">
            <div class="nivel-labels">
                <span>${pericia.atributo}-3</span>
                <span>${pericia.atributo}+0</span>
                <span>${pericia.atributo}+10</span>
            </div>
            <div class="nivel-info">
                <div class="nivel-valor">
                    NH: <span id="nh-final">${valorAtributo}</span> 
                    (${pericia.atributo}<span id="nivel-relativo">+0</span>)
                </div>
                <div class="custo-total">
                    Custo: <span id="custo-pericia">${pericia.custoBase}</span> pts
                </div>
            </div>
            <div class="info-custos">
                <small>🎯 <strong>${pericia.dificuldade}:</strong> ${getInfoRedutores(pericia.dificuldade)}</small>
            </div>
        </div>
    `;
    
    const slider = corpo.querySelector('#nivel-pericia');
    const nhFinal = corpo.querySelector('#nh-final');
    const nivelRelativo = corpo.querySelector('#nivel-relativo');
    const custo = corpo.querySelector('#custo-pericia');
    
    function atualizarDisplay() {
        const nivel = parseInt(slider.value);
        const custoAtual = calcularCustoPericia(nivel, pericia.dificuldade);
        const nhAtual = valorAtributo + nivel;
        
        nhFinal.textContent = nhAtual;
        nivelRelativo.textContent = nivel >= 0 ? `+${nivel}` : `${nivel}`;
        custo.textContent = custoAtual;
        
        btnConfirmar.disabled = custoAtual <= 0;
    }
    
    slider.addEventListener('input', atualizarDisplay);
    atualizarDisplay();
    
    btnConfirmar.onclick = () => {
        const nivel = parseInt(slider.value);
        const custoAtual = calcularCustoPericia(nivel, pericia.dificuldade);
        
        if (custoAtual > 0) {
            adicionarPericia(pericia, nivel, custoAtual);
            modal.style.display = 'none';
        }
    };
    
    modal.querySelector('.btn-cancelar').onclick = () => modal.style.display = 'none';
    modal.querySelector('.modal-close').onclick = () => modal.style.display = 'none';
    
    modal.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    modal.style.display = 'block';
}

// ADICIONAR PERÍCIA
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
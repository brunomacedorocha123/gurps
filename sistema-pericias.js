// ===== SISTEMA DE PERÍCIAS - VERSÃO DEFINITIVA CORRIGIDA =====

let estadoPericias = {
    adquiridas: [],
    pontosGastos: 0
};

// CARREGAR PERÍCIAS NA LISTA - VERSÃO CORRIGIDA
function carregarPericias() {
    const lista = document.getElementById('lista-pericias');
    if (!lista) {
        console.log('Lista de perícias não encontrada');
        return;
    }

    // VERIFICAÇÃO MELHORADA DO CATÁLOGO
    if (!window.catalogoPericias || Object.keys(window.catalogoPericias).length === 0) {
        lista.innerHTML = '<div class="lista-vazia">Carregando catálogo de perícias...</div>';
        console.log('Aguardando catálogo...');
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
    
    console.log(`Carregando ${todasPericias.length} perícias...`);
    
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

// CARREGAR PERÍCIAS FILTRADAS - NOVA FUNÇÃO
function carregarPericiasFiltradas(termo = "", categoria = "", subcategoria = "") {
    const lista = document.getElementById('lista-pericias');
    if (!lista || !window.buscarPericias) {
        carregarPericias(); // Fallback
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

// ATUALIZAR FILTROS - NOVA FUNÇÃO
function atualizarFiltrosPericias() {
    const termo = document.getElementById('busca-pericias')?.value || '';
    const categoria = document.getElementById('categoria-pericias')?.value || '';
    const subcategoria = document.getElementById('subcategoria-pericias')?.value || '';
    
    // Atualizar opções de subcategoria baseado na categoria selecionada
    if (window.obterSubcategorias && categoria !== 'Todas') {
        const subcategorias = window.obterSubcategorias(categoria);
        const subcategoriaSelect = document.getElementById('subcategoria-pericias');
        if (subcategoriaSelect) {
            subcategoriaSelect.innerHTML = '<option value="Todas">Todas Subcategorias</option>';
            subcategorias.forEach(sub => {
                const selected = sub === subcategoria ? 'selected' : '';
                subcategoriaSelect.innerHTML += `<option value="${sub}" ${selected}>${sub}</option>`;
            });
        }
    }
    
    // Aplicar filtros
    carregarPericiasFiltradas(termo, categoria, subcategoria);
}

// ABRIR MODAL DA PERÍCIA - VERSÃO CORRIGIDA
function abrirModalPericia(pericia) {
    const modal = document.getElementById('modal-pericia');
    const titulo = document.getElementById('modal-titulo-pericia');
    const corpo = document.getElementById('modal-corpo-pericia');
    const btnConfirmar = modal?.querySelector('.btn-confirmar');
    
    if (!modal || !titulo || !corpo || !btnConfirmar) {
        console.error('Elementos do modal não encontrados');
        return;
    }
    
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
                <span>Atributo-3</span>
                <span>Atributo+0</span>
                <span>Atributo+10</span>
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
        nivelRelativo.textContent = nivel >= 0 ? `+${nivel}` : nivel;
        custo.textContent = custoAtual;
        
        // Habilitar/desabilitar botão confirmar
        btnConfirmar.disabled = custoAtual <= 0;
    }
    
    slider.addEventListener('input', atualizarDisplay);
    atualizarDisplay(); // Inicializar display
    
    // Configurar botão confirmar
    btnConfirmar.onclick = () => {
        const nivel = parseInt(slider.value);
        const custoAtual = calcularCustoPericia(nivel, pericia.dificuldade);
        
        if (custoAtual > 0) {
            adicionarPericia(pericia, nivel, custoAtual);
            modal.style.display = 'none';
        }
    };
    
    // Configurar fechamento do modal
    modal.querySelector('.btn-cancelar').onclick = () => modal.style.display = 'none';
    modal.querySelector('.modal-close').onclick = () => modal.style.display = 'none';
    
    // Fechar modal clicando fora
    modal.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    modal.style.display = 'block';
}

// CALCULAR CUSTO DA PERÍCIA - TABELA GURPS CORRETA
function calcularCustoPericia(nivel, dificuldade) {
    // TABELA GURPS OFICIAL - Corrigida conforme sua descrição
    const tabela = {
        "Fácil": [
            0,  // Atributo-3 (não pode ter custo negativo)
            1,  // Atributo-2
            1,  // Atributo-1
            1,  // Atributo+0
            2,  // Atributo+1
            4,  // Atributo+2
            8,  // Atributo+3
            12, // Atributo+4
            16, // Atributo+5
            20, // Atributo+6
            24, // Atributo+7
            28, // Atributo+8
            32, // Atributo+9
            36  // Atributo+10
        ],
        "Média": [
            0,  // Atributo-3
            1,  // Atributo-2
            2,  // Atributo-1
            2,  // Atributo+0
            4,  // Atributo+1
            8,  // Atributo+2
            12, // Atributo+3
            16, // Atributo+4
            20, // Atributo+5
            24, // Atributo+6
            28, // Atributo+7
            32, // Atributo+8
            36, // Atributo+9
            40  // Atributo+10
        ],
        "Difícil": [
            0,  // Atributo-3
            2,  // Atributo-2
            4,  // Atributo-1
            4,  // Atributo+0
            8,  // Atributo+1
            12, // Atributo+2
            16, // Atributo+3
            20, // Atributo+4
            24, // Atributo+5
            28, // Atributo+6
            32, // Atributo+7
            36, // Atributo+8
            40, // Atributo+9
            44  // Atributo+10
        ],
        "Muito Difícil": [
            0,  // Atributo-3
            4,  // Atributo-2
            8,  // Atributo-1
            8,  // Atributo+0
            12, // Atributo+1
            16, // Atributo+2
            20, // Atributo+3
            24, // Atributo+4
            28, // Atributo+5
            32, // Atributo+6
            36, // Atributo+7
            40, // Atributo+8
            44, // Atributo+9
            48  // Atributo+10
        ]
    };
    
    const base = tabela[dificuldade] || tabela["Média"];
    const index = nivel + 3; // Convertendo -3 para índice 0, 0 para índice 3, etc.
    
    if (index < 0) return 0; // Níveis abaixo de -3 não são permitidos
    if (index < base.length) return base[index];
    
    // Para níveis acima da tabela: +4 pontos por nível adicional
    const ultimoNivel = base.length - 4; // +10 é o último nível na tabela
    return base[base.length - 1] + (nivel - ultimoNivel) * 4;
}

// ADICIONAR PERÍCIA - VERSÃO CORRIGIDA
function adicionarPericia(pericia, nivel, custo) {
    // Verificar se já existe
    const indexExistente = estadoPericias.adquiridas.findIndex(p => p.id === pericia.id);
    
    if (indexExistente !== -1) {
        // Atualizar perícia existente
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
        // Adicionar nova perícia
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
        // Mudar cor se saldo negativo
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

// INICIALIZAR SISTEMA - VERSÃO MELHORADA
function inicializarSistemaPericias() {
    const lista = document.getElementById('lista-pericias');
    if (!lista) {
        console.log('Aguardando DOM carregar...');
        setTimeout(inicializarSistemaPericias, 100);
        return;
    }
    
    // VERIFICAÇÃO MELHORADA DO CATÁLOGO
    if (!window.catalogoPericias || Object.keys(window.catalogoPericias).length === 0) {
        console.log('Aguardando catálogo de perícias...');
        setTimeout(inicializarSistemaPericias, 100);
        return;
    }
    
    console.log('✅ Sistema de perícias inicializado!');
    console.log('Catálogo carregado:', Object.keys(window.catalogoPericias));
    
    // CONFIGURAR FILTROS
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

// CONFIGURAR EVENT LISTENERS - VERSÃO CORRIGIDA
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado - Configurando sistema de perícias...');
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'pericias' && tab.classList.contains('active')) {
                    console.log('Aba de perícias ativada');
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

console.log('✅ Sistema de perícias carregado e pronto!');
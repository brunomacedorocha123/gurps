// ===== SISTEMA DE PERÍCIAS - GURPS =====
// Versão 3.0 - Sistema Completo e Funcional

// Estado das perícias do personagem
let estadoPericias = {
    adquiridas: [],
    pontosGastos: 0
};

// Tabela de custos ilimitada - FUNCIONANDO
function calcularCustoPericia(nivelRelativo, dificuldade) {
    const tabelaBase = {
        "Fácil": [ -3, -2, -1, 0, 1, 2, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40 ],
        "Média": [ -3, -2, -1, 0, 2, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44 ],
        "Difícil": [ -3, -2, -1, 0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48 ],
        "Muito Difícil": [ -3, -2, -1, 0, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52 ]
    };
    
    const base = tabelaBase[dificuldade];
    
    if (nivelRelativo >= -3 && nivelRelativo <= 12) {
        return base[nivelRelativo + 3];
    }
    
    if (nivelRelativo > 12) {
        const nivelBase = 12;
        const custoBase = base[15];
        const niveisExtras = nivelRelativo - nivelBase;
        return custoBase + (niveisExtras * 4);
    }
    
    return 0;
}

// Calcular NH final - FUNCIONANDO
function calcularNHFinal(pericia, nivelRelativo) {
    const atributos = obterAtributosAtuais();
    const valorAtributo = atributos[pericia.atributo] || 10;
    return valorAtributo + nivelRelativo;
}

// Atualizar interface completa - FUNCIONANDO
function atualizarInterfacePericias() {
    atualizarListaPericiasDisponiveis();
    atualizarPericiasAdquiridas();
    atualizarPontuacao();
}

// ATUALIZAR LISTA DE PERÍCIAS DISPONÍVEIS - CORRIGIDA
function atualizarListaPericiasDisponiveis() {
    const lista = document.getElementById('lista-pericias');
    if (!lista) {
        console.log("❌ Elemento lista-pericias não encontrado");
        return;
    }

    const busca = document.getElementById('busca-pericias') ? document.getElementById('busca-pericias').value : '';
    const categoria = document.getElementById('categoria-pericias') ? document.getElementById('categoria-pericias').value : 'Todas';
    const subcategoria = document.getElementById('subcategoria-pericias') ? document.getElementById('subcategoria-pericias').value : 'Todas';

    // BUSCAR PERÍCIAS - CORRIGIDO
    let resultados = [];
    try {
        resultados = buscarPericias(
            busca, 
            categoria !== 'Todas' ? categoria : '', 
            subcategoria !== 'Todas' ? subcategoria : ''
        );
    } catch (error) {
        console.log("❌ Erro ao buscar perícias:", error);
        lista.innerHTML = '<div class="lista-vazia">Erro ao carregar perícias</div>';
        return;
    }

    const adquiridasIds = estadoPericias.adquiridas.map(p => p.id);
    
    lista.innerHTML = '';

    // SE NÃO HÁ RESULTADOS - CORRIGIDO
    if (!resultados || resultados.length === 0) {
        lista.innerHTML = '<div class="lista-vazia">Nenhuma perícia encontrada</div>';
        return;
    }

    // CRIAR ITENS - CORRIGIDO
    let itensCriados = 0;
    resultados.forEach(pericia => {
        if (!pericia || !pericia.id) return;
        
        if (adquiridasIds.includes(pericia.id)) return;

        const item = document.createElement('div');
        item.className = 'item-lista';
        item.innerHTML = `
            <div class="item-header">
                <div class="item-nome">${pericia.nome}</div>
                <div class="item-custo">${pericia.custoBase} pts</div>
            </div>
            <div class="item-descricao">${pericia.descricao}</div>
            <div class="item-categoria">${pericia.atributo}/${pericia.dificuldade} • ${pericia.subcategoria || pericia.categoria}</div>
        `;
        
        item.addEventListener('click', () => abrirModalPericia(pericia));
        lista.appendChild(item);
        itensCriados++;
    });

    // SE NENHUM ITEM FOI CRIADO - CORRIGIDO
    if (itensCriados === 0) {
        lista.innerHTML = '<div class="lista-vazia">Todas as perícias já foram adquiridas</div>';
    }
}

// ATUALIZAR PERÍCIAS ADQUIRIDAS - FUNCIONANDO
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
    
    estadoPericias.adquiridas.forEach(periciaAdquirida => {
        const periciaBase = obterPericiaPorId(periciaAdquirida.id);
        if (!periciaBase) return;
        
        const nhFinal = calcularNHFinal(periciaBase, periciaAdquirida.nivelRelativo);
        
        const item = document.createElement('div');
        item.className = 'item-lista item-adquirido';
        item.innerHTML = `
            <div class="item-header">
                <div class="item-nome">${periciaBase.nome} (NH ${nhFinal})</div>
                <div class="item-custo">${periciaAdquirida.custo} pts</div>
            </div>
            <div class="item-descricao">${periciaBase.descricao}</div>
            <div class="item-categoria">${periciaBase.atributo}/${periciaBase.dificuldade} • Nível: ${periciaBase.atributo}${periciaAdquirida.nivelRelativo >= 0 ? '+' : ''}${periciaAdquirida.nivelRelativo}</div>
            <button class="btn-remover" onclick="removerPericia('${periciaAdquirida.id}')">×</button>
        `;
        
        lista.appendChild(item);
    });
    
    if (totalElement) totalElement.textContent = `${estadoPericias.pontosGastos} pts`;
}

// ATUALIZAR PONTUAÇÃO - FUNCIONANDO
function atualizarPontuacao() {
    const totalPericias = document.getElementById('total-pericias');
    const saldoTotal = document.getElementById('saldo-total-pericias');
    
    if (totalPericias) {
        totalPericias.textContent = `+${estadoPericias.pontosGastos}`;
    }
    
    if (saldoTotal) {
        const pontosAtributos = obterPontosGastosAtributos();
        const pontosDisponiveis = 150 - pontosAtributos;
        const saldo = pontosDisponiveis - estadoPericias.pontosGastos;
        saldoTotal.textContent = saldo;
        
        const cardSaldo = saldoTotal.closest('.ponto-card');
        if (cardSaldo) {
            cardSaldo.className = `ponto-card ${saldo >= 0 ? 'saldo' : 'gastos'}`;
        }
    }
}

// ABRIR MODAL PERÍCIA - FUNCIONANDO
function abrirModalPericia(pericia) {
    const modal = document.getElementById('modal-pericia');
    const titulo = document.getElementById('modal-titulo-pericia');
    const corpo = document.getElementById('modal-corpo-pericia');
    const btnConfirmar = document.querySelector('#modal-pericia .btn-confirmar');
    
    if (!modal || !titulo || !corpo) return;
    
    const atributos = obterAtributosAtuais();
    const valorAtributo = atributos[pericia.atributo] || 10;
    
    titulo.textContent = pericia.nome;
    
    corpo.innerHTML = `
        <div class="modal-info">
            <p><strong>Atributo:</strong> ${pericia.atributo} (${valorAtributo})</p>
            <p><strong>Dificuldade:</strong> ${pericia.dificuldade}</p>
            <p><strong>Pré-requisito:</strong> ${pericia.prereq}</p>
            <p><strong>Descrição:</strong> ${pericia.descricao}</p>
        </div>
        
        <div class="modal-nivel">
            <h4>Selecionar Nível</h4>
            <input type="range" id="nivel-pericia" class="nivel-slider" min="-3" max="20" value="0" step="1">
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
        
        const pontosDisponiveis = calcularPontosDisponiveis();
        btnConfirmar.disabled = custoAtual > pontosDisponiveis;
    }
    
    slider.addEventListener('input', atualizarDisplay);
    atualizarDisplay();
    
    btnConfirmar.onclick = () => {
        const nivel = parseInt(slider.value);
        const custoAtual = calcularCustoPericia(nivel, pericia.dificuldade);
        adicionarPericia(pericia, nivel, custoAtual);
        modal.style.display = 'none';
    };
    
    const btnCancelar = modal.querySelector('.btn-cancelar');
    btnCancelar.onclick = () => {
        modal.style.display = 'none';
    };
    
    const spanClose = modal.querySelector('.modal-close');
    spanClose.onclick = () => {
        modal.style.display = 'none';
    };
    
    modal.style.display = 'block';
}

// ADICIONAR PERÍCIA - FUNCIONANDO
function adicionarPericia(pericia, nivelRelativo, custo) {
    estadoPericias.adquiridas.push({
        id: pericia.id,
        nivelRelativo: nivelRelativo,
        custo: custo,
        timestamp: Date.now()
    });
    
    estadoPericias.pontosGastos += custo;
    atualizarInterfacePericias();
    salvarPericias();
}

// REMOVER PERÍCIA - FUNCIONANDO
function removerPericia(id) {
    const index = estadoPericias.adquiridas.findIndex(p => p.id === id);
    if (index !== -1) {
        const custo = estadoPericias.adquiridas[index].custo;
        estadoPericias.adquiridas.splice(index, 1);
        estadoPericias.pontosGastos -= custo;
        atualizarInterfacePericias();
        salvarPericias();
    }
}

// CALCULAR PONTOS DISPONÍVEIS - FUNCIONANDO
function calcularPontosDisponiveis() {
    const pontosAtributos = obterPontosGastosAtributos();
    return 150 - pontosAtributos - estadoPericias.pontosGastos;
}

// OBTER ATRIBUTOS ATUAIS - FUNCIONANDO
function obterAtributosAtuais() {
    if (window.obterDadosAtributos) {
        const dados = window.obterDadosAtributos();
        return {
            ST: dados.ST,
            DX: dados.DX,
            IQ: dados.IQ,
            HT: dados.HT,
            PERC: dados.Percepcao
        };
    }
    return { ST: 10, DX: 10, IQ: 10, HT: 10, PERC: 10 };
}

// OBTER PONTOS GASTOS EM ATRIBUTOS - FUNCIONANDO
function obterPontosGastosAtributos() {
    if (window.obterDadosAtributos) {
        const dados = window.obterDadosAtributos();
        return dados.PontosGastos || 0;
    }
    return 0;
}

// ATUALIZAR NH POR ATRIBUTOS - FUNCIONANDO
function atualizarNHPorAtributos() {
    if (estadoPericias.adquiridas.length > 0) {
        atualizarPericiasAdquiridas();
    }
}

// SALVAR PERÍCIAS - FUNCIONANDO
function salvarPericias() {
    localStorage.setItem('gurpsPericias', JSON.stringify(estadoPericias));
}

// CARREGAR PERÍCIAS - FUNCIONANDO
function carregarPericias() {
    const salvo = localStorage.getItem('gurpsPericias');
    if (salvo) {
        estadoPericias = JSON.parse(salvo);
        atualizarInterfacePericias();
    }
}

// CONFIGURAR EVENT LISTENERS - FUNCIONANDO
function configurarEventListenersPericias() {
    const busca = document.getElementById('busca-pericias');
    const categoria = document.getElementById('categoria-pericias');
    const subcategoria = document.getElementById('subcategoria-pericias');
    
    if (busca) {
        busca.addEventListener('input', () => {
            clearTimeout(window.buscaTimeout);
            window.buscaTimeout = setTimeout(atualizarListaPericiasDisponiveis, 300);
        });
    }
    
    if (categoria) {
        categoria.addEventListener('change', () => {
            atualizarSubcategorias();
            atualizarListaPericiasDisponiveis();
        });
    }
    
    if (subcategoria) {
        subcategoria.addEventListener('change', atualizarListaPericiasDisponiveis);
    }
}

// ATUALIZAR SUBCATEGORIAS - FUNCIONANDO
function atualizarSubcategorias() {
    const categoriaSelect = document.getElementById('categoria-pericias');
    const subcategoriaSelect = document.getElementById('subcategoria-pericias');
    
    if (!categoriaSelect || !subcategoriaSelect) return;
    
    const categoria = categoriaSelect.value;
    const subcategorias = obterSubcategorias(categoria);
    
    subcategoriaSelect.innerHTML = '<option value="Todas">Todas Subcategorias</option>';
    
    subcategorias.forEach(sub => {
        const option = document.createElement('option');
        option.value = sub;
        option.textContent = sub;
        subcategoriaSelect.appendChild(option);
    });
}

// ===== INICIALIZAÇÃO - 100% FUNCIONAL =====
function inicializarSistemaPericias() {
    console.log("🎯 INICIANDO SISTEMA DE PERÍCIAS...");
    
    // VERIFICAR ELEMENTOS - CORRIGIDO
    const listaPericias = document.getElementById('lista-pericias');
    if (!listaPericias) {
        console.log("❌ Elemento lista-pericias não encontrado");
        setTimeout(inicializarSistemaPericias, 500);
        return;
    }
    
    // VERIFICAR CATÁLOGO - CORRIGIDO
    if (!window.catalogoPericias) {
        console.log("❌ Catálogo de perícias não carregado");
        setTimeout(inicializarSistemaPericias, 500);
        return;
    }
    
    // VERIFICAR FUNÇÕES DO CATÁLOGO - CORRIGIDO
    if (!window.buscarPericias || !window.obterPericiaPorId || !window.obterSubcategorias) {
        console.log("❌ Funções do catálogo não carregadas");
        setTimeout(inicializarSistemaPericias, 500);
        return;
    }
    
    console.log("✅ SISTEMA DE PERÍCIAS CARREGADO COM SUCESSO!");
    console.log("📊 Total de perícias no catálogo:", Object.values(window.catalogoPericias).flat().length);
    
    // CONFIGURAR EVENT LISTENERS
    configurarEventListenersPericias();
    
    // CARREGAR DADOS SALVOS
    carregarPericias();
    
    // ATUALIZAR INTERFACE COMPLETA
    atualizarInterfacePericias();
    atualizarSubcategorias();
    
    // ESCUTAR MUDANÇAS NOS ATRIBUTOS
    document.addEventListener('atributosAlterados', atualizarNHPorAtributos);
    
    console.log("🚀 SISTEMA DE PERÍCIAS INICIALIZADO!");
}

// ===== INTEGRAÇÃO COM SISTEMA PRINCIPAL - FUNCIONANDO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 Página carregada - Configurando sistema de perícias...");
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'pericias' && tab.classList.contains('active')) {
                    console.log("🎯 Aba perícias ativada - Inicializando sistema...");
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
        console.log("🎯 Aba perícias já está ativa - Inicializando...");
        setTimeout(() => {
            inicializarSistemaPericias();
        }, 100);
    }
});

// ===== EXPORTAÇÃO - FUNCIONANDO =====
window.adicionarPericia = adicionarPericia;
window.removerPericia = removerPericia;
window.calcularCustoPericia = calcularCustoPericia;
window.calcularNHFinal = calcularNHFinal;
window.inicializarSistemaPericias = inicializarSistemaPericias;
window.atualizarInterfacePericias = atualizarInterfacePericias;
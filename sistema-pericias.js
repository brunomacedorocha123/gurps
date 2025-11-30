// ===== SISTEMA DE PERÍCIAS - GURPS =====
// Versão 2.0 - Sistema Completo Corrigido

// Estado das perícias do personagem
let estadoPericias = {
    adquiridas: [],
    pontosGastos: 0
};

// Tabela de custos ilimitada
function calcularCustoPericia(nivelRelativo, dificuldade) {
    const tabelaBase = {
        "Fácil": [ -3, -2, -1, 0, 1, 2, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40 ],
        "Média": [ -3, -2, -1, 0, 2, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44 ],
        "Difícil": [ -3, -2, -1, 0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48 ],
        "Muito Difícil": [ -3, -2, -1, 0, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52 ]
    };
    
    const base = tabelaBase[dificuldade];
    
    // Para níveis dentro da tabela base
    if (nivelRelativo >= -3 && nivelRelativo <= 12) {
        return base[nivelRelativo + 3];
    }
    
    // Para níveis acima de +12 (custo progressivo +4 por nível)
    if (nivelRelativo > 12) {
        const nivelBase = 12;
        const custoBase = base[15]; // Último valor da tabela base
        const niveisExtras = nivelRelativo - nivelBase;
        return custoBase + (niveisExtras * 4);
    }
    
    return 0; // Nível inválido
}

// Calcular NH final baseado nos atributos atuais
function calcularNHFinal(pericia, nivelRelativo) {
    const atributos = obterAtributosAtuais();
    const atributoBase = pericia.atributo;
    const valorAtributo = atributos[atributoBase] || 10;
    return valorAtributo + nivelRelativo;
}

// Atualizar interface das perícias
function atualizarInterfacePericias() {
    atualizarListaPericiasDisponiveis();
    atualizarPericiasAdquiridas();
    atualizarPontuacao();
}

// Atualizar lista de perícias disponíveis
function atualizarListaPericiasDisponiveis() {
    const lista = document.getElementById('lista-pericias');
    const busca = document.getElementById('busca-pericias')?.value || '';
    const categoria = document.getElementById('categoria-pericias')?.value || 'Todas';
    const subcategoria = document.getElementById('subcategoria-pericias')?.value || 'Todas';
    
    if (!lista) return;
    
    const resultados = buscarPericias(busca, categoria !== 'Todas' ? categoria : '', subcategoria !== 'Todas' ? subcategoria : '');
    const adquiridasIds = estadoPericias.adquiridas.map(p => p.id);
    
    lista.innerHTML = '';
    
    if (resultados.length === 0) {
        lista.innerHTML = '<div class="lista-vazia">Nenhuma perícia encontrada</div>';
        return;
    }
    
    resultados.forEach(pericia => {
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
    });
}

// Atualizar lista de perícias adquiridas
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

// Atualizar pontuação
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
        
        // Atualizar estilo baseado no saldo
        const cardSaldo = saldoTotal.closest('.ponto-card');
        if (cardSaldo) {
            cardSaldo.className = `ponto-card ${saldo >= 0 ? 'saldo' : 'gastos'}`;
        }
    }
}

// Abrir modal para selecionar nível da perícia
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
        
        // Verificar se pode confirmar
        const pontosDisponiveis = calcularPontosDisponiveis();
        btnConfirmar.disabled = custoAtual > pontosDisponiveis;
    }
    
    slider.addEventListener('input', atualizarDisplay);
    atualizarDisplay();
    
    // Configurar botão confirmar
    btnConfirmar.onclick = () => {
        const nivel = parseInt(slider.value);
        const custoAtual = calcularCustoPericia(nivel, pericia.dificuldade);
        adicionarPericia(pericia, nivel, custoAtual);
        modal.style.display = 'none';
    };
    
    // Configurar botão cancelar
    const btnCancelar = modal.querySelector('.btn-cancelar');
    btnCancelar.onclick = () => {
        modal.style.display = 'none';
    };
    
    // Fechar modal
    const spanClose = modal.querySelector('.modal-close');
    spanClose.onclick = () => {
        modal.style.display = 'none';
    };
    
    modal.style.display = 'block';
}

// Adicionar perícia ao personagem
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

// Remover perícia do personagem
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

// Calcular pontos disponíveis para perícias
function calcularPontosDisponiveis() {
    const pontosAtributos = obterPontosGastosAtributos();
    return 150 - pontosAtributos - estadoPericias.pontosGastos;
}

// Obter atributos atuais do sistema principal
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

// Obter pontos gastos em atributos
function obterPontosGastosAtributos() {
    if (window.obterDadosAtributos) {
        const dados = window.obterDadosAtributos();
        return dados.PontosGastos || 0;
    }
    return 0;
}

// Atualizar NH quando atributos mudarem
function atualizarNHPorAtributos() {
    if (estadoPericias.adquiridas.length > 0) {
        atualizarPericiasAdquiridas();
    }
}

// Salvar perícias no localStorage
function salvarPericias() {
    localStorage.setItem('gurpsPericias', JSON.stringify(estadoPericias));
}

// Carregar perícias do localStorage
function carregarPericias() {
    const salvo = localStorage.getItem('gurpsPericias');
    if (salvo) {
        estadoPericias = JSON.parse(salvo);
        atualizarInterfacePericias();
    }
}

// Configurar event listeners
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

// Atualizar opções de subcategorias
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

// ===== INICIALIZAÇÃO CORRIGIDA =====
function inicializarSistemaPericias() {
    console.log("🎯 Inicializando sistema de perícias...");
    
    // Verificar se os elementos existem
    const listaPericias = document.getElementById('lista-pericias');
    if (!listaPericias) {
        console.log("⏳ Aguardando elementos da aba perícias...");
        setTimeout(inicializarSistemaPericias, 500);
        return;
    }
    
    // Verificar se o catálogo carregou
    if (!window.catalogoPericias) {
        console.log("⏳ Aguardando catálogo de perícias...");
        setTimeout(inicializarSistemaPericias, 500);
        return;
    }
    
    console.log("✅ Sistema de perícias carregado!");
    
    // Configurar event listeners
    configurarEventListenersPericias();
    
    // Carregar dados salvos
    carregarPericias();
    
    // Atualizar interface
    atualizarInterfacePericias();
    atualizarSubcategorias();
    
    // Escutar mudanças nos atributos
    document.addEventListener('atributosAlterados', atualizarNHPorAtributos);
}

// ===== INTEGRAÇÃO COM O SISTEMA PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar quando a aba for carregada
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'pericias' && tab.classList.contains('active')) {
                    console.log("📖 Aba perícias ativada!");
                    setTimeout(() => {
                        inicializarSistemaPericias();
                    }, 100);
                }
            }
        });
    });
    
    // Observar abas
    document.querySelectorAll('.tab-content').forEach(tab => {
        observer.observe(tab, { attributes: true });
    });
    
    // Inicializar imediatamente se já estiver na aba
    const periciasTab = document.getElementById('pericias');
    if (periciasTab && periciasTab.classList.contains('active')) {
        console.log("🎯 Aba perícias já está ativa!");
        setTimeout(() => {
            inicializarSistemaPericias();
        }, 100);
    }
});

// ===== EXPORTAÇÃO =====
window.adicionarPericia = adicionarPericia;
window.removerPericia = removerPericia;
window.calcularCustoPericia = calcularCustoPericia;
window.calcularNHFinal = calcularNHFinal;
window.inicializarSistemaPericias = inicializarSistemaPericias;
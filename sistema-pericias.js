// ===== SISTEMA DE PERÍCIAS - VERSÃO DEFINITIVA =====

let estadoPericias = {
    adquiridas: [],
    pontosGastos: 0
};

// CARREGAR PERÍCIAS NA LISTA
function carregarPericias() {
    const lista = document.getElementById('lista-pericias');
    if (!lista) return;

    if (!window.catalogoPericias) return;
    
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
        `;
        
        item.addEventListener('click', () => abrirModalPericia(pericia));
        lista.appendChild(item);
    });
}

// ABRIR MODAL DA PERÍCIA
function abrirModalPericia(pericia) {
    const modal = document.getElementById('modal-pericia');
    const titulo = document.getElementById('modal-titulo-pericia');
    const corpo = document.getElementById('modal-corpo-pericia');
    
    if (!modal || !titulo || !corpo) return;
    
    const atributos = obterAtributosAtuais();
    const valorAtributo = atributos[pericia.atributo] || 10;
    
    titulo.textContent = pericia.nome;
    
    corpo.innerHTML = `
        <div class="modal-info">
            <p><strong>Atributo:</strong> ${pericia.atributo} (${valorAtributo})</p>
            <p><strong>Dificuldade:</strong> ${pericia.dificuldade}</p>
            <p><strong>Descrição:</strong> ${pericia.descricao}</p>
        </div>
        
        <div class="modal-nivel">
            <h4>Selecionar Nível</h4>
            <input type="range" id="nivel-pericia" class="nivel-slider" min="-3" max="10" value="0" step="1">
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
    }
    
    slider.addEventListener('input', atualizarDisplay);
    
    const btnConfirmar = modal.querySelector('.btn-confirmar');
    btnConfirmar.onclick = () => {
        const nivel = parseInt(slider.value);
        const custoAtual = calcularCustoPericia(nivel, pericia.dificuldade);
        adicionarPericia(pericia, nivel, custoAtual);
        modal.style.display = 'none';
    };
    
    modal.querySelector('.btn-cancelar').onclick = () => modal.style.display = 'none';
    modal.querySelector('.modal-close').onclick = () => modal.style.display = 'none';
    
    modal.style.display = 'block';
}

// CALCULAR CUSTO DA PERÍCIA
function calcularCustoPericia(nivel, dificuldade) {
    const tabela = {
        "Fácil": [1, 2, 4, 8, 12, 16, 20],
        "Média": [2, 4, 8, 12, 16, 20, 24],
        "Difícil": [4, 8, 12, 16, 20, 24, 28],
        "Muito Difícil": [8, 12, 16, 20, 24, 28, 32]
    };
    
    const base = tabela[dificuldade];
    const index = nivel + 3;
    return base[index] || base[base.length - 1] + (nivel - 3) * 4;
}

// ADICIONAR PERÍCIA
function adicionarPericia(pericia, nivel, custo) {
    estadoPericias.adquiridas.push({
        id: pericia.id,
        nome: pericia.nome,
        nivelRelativo: nivel,
        custo: custo,
        atributo: pericia.atributo
    });
    
    estadoPericias.pontosGastos += custo;
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
            <div class="item-categoria">${pericia.atributo} • Nível: ${pericia.atributo}${pericia.nivelRelativo >= 0 ? '+' : ''}${pericia.nivelRelativo}</div>
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
    
    if (totalPericias) totalPericias.textContent = `+${estadoPericias.pontosGastos}`;
    if (saldoTotal) {
        const pontosAtributos = obterPontosGastosAtributos();
        const saldo = 150 - pontosAtributos - estadoPericias.pontosGastos;
        saldoTotal.textContent = saldo;
    }
}

// OBTER ATRIBUTOS
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
    
    if (!window.catalogoPericias) {
        setTimeout(inicializarSistemaPericias, 100);
        return;
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
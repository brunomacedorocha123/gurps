// ===== SISTEMA DE PERÍCIAS - VERSÃO COMPLETA 100% =====

let estadoPericias = {
    adquiridas: [],
    pontosGastos: 0,
    pontosDisponiveis: 150
};

function inicializarSistemaPericias() {
    console.log("✅ Inicializando sistema de perícias...");
    configurarBuscaEFiltros();
    carregarPericiasNaLista();
    atualizarInterfacePericias();
    configurarEventosModais();
    console.log("✅ Sistema de perícias inicializado!");
}

function configurarBuscaEFiltros() {
    const buscaInput = document.getElementById('busca-pericias');
    const filtroSelect = document.getElementById('filtro-atributo');
    if (buscaInput) buscaInput.addEventListener('input', function() { filtrarPericias(this.value, filtroSelect?.value || 'Todos'); });
    if (filtroSelect) filtroSelect.addEventListener('change', function() { filtrarPericias(buscaInput?.value || '', this.value); });
}

function filtrarPericias(termoBusca, filtroAtributo) {
    const listaContainer = document.getElementById('lista-pericias');
    if (!listaContainer) return;
    listaContainer.innerHTML = '';
    criarGruposPericias(termoBusca, filtroAtributo);
    adicionarEventosGrupos();
    atualizarContadorPericias();
}

function criarGruposPericias(termoBusca = '', filtroAtributo = 'Todos') {
    const listaContainer = document.getElementById('lista-pericias');
    for (const [categoriaNome, conteudoCategoria] of Object.entries(window.catalogoPericias)) {
        if (filtroAtributo !== 'Todos' && filtroAtributo !== categoriaNome) continue;
        const grupoDiv = document.createElement('div');
        grupoDiv.className = 'grupo-pericias ativo';
        grupoDiv.dataset.categoria = categoriaNome;
        let icone = '🎯';
        switch(categoriaNome) {
            case 'Combate': icone = '⚔️'; break;
            case 'DX': icone = '🏃‍♂️'; break;
            case 'IQ': icone = '🧠'; break;
            case 'HT': icone = '💪'; break;
            case 'PERC': icone = '👁️'; break;
        }
        grupoDiv.innerHTML = `<div class="grupo-header"><h4>${icone} ${categoriaNome}</h4><span class="grupo-icone">▼</span></div><div class="grupo-conteudo"></div>`;
        listaContainer.appendChild(grupoDiv);
        const grupoConteudo = grupoDiv.querySelector('.grupo-conteudo');
        grupoConteudo.innerHTML = '';
        if (Array.isArray(conteudoCategoria)) {
            adicionarPericiasArray(grupoConteudo, conteudoCategoria, termoBusca);
        } else {
            adicionarPericiasCombate(grupoConteudo, conteudoCategoria, termoBusca);
        }
    }
}

function adicionarPericiasArray(container, arrayPericias, termoBusca) {
    let encontrouAlguma = false;
    arrayPericias.forEach(pericia => {
        if (termoBusca && !pericia.nome.toLowerCase().includes(termoBusca.toLowerCase())) return;
        encontrouAlguma = true;
        const item = criarItemPericia(pericia);
        container.appendChild(item);
    });
    if (!encontrouAlguma && termoBusca) {
        container.innerHTML = '<div class="lista-vazia">Nenhuma perícia encontrada</div>';
    }
}

function adicionarPericiasCombate(container, objetoCombate, termoBusca) {
    let encontrouAlguma = false;
    for (const [grupoNome, dadosGrupo] of Object.entries(objetoCombate)) {
        if (termoBusca && !grupoNome.toLowerCase().includes(termoBusca.toLowerCase())) {
            let temPericiaNaBusca = false;
            if (dadosGrupo.tipo === 'modal-escolha') {
                temPericiaNaBusca = dadosGrupo.pericias.some(p => p.nome.toLowerCase().includes(termoBusca.toLowerCase()));
            }
            if (!temPericiaNaBusca) continue;
        }
        encontrouAlguma = true;
        if (dadosGrupo.tipo === 'pericia-simples') {
            const item = criarItemPericia(dadosGrupo);
            container.appendChild(item);
        } else if (dadosGrupo.tipo === 'modal-escolha') {
            const item = criarItemGrupoModal(dadosGrupo);
            container.appendChild(item);
        }
    }
    if (!encontrouAlguma && termoBusca) {
        container.innerHTML = '<div class="lista-vazia">Nenhuma perícia de combate encontrada</div>';
    }
}

function criarItemPericia(pericia) {
    const item = document.createElement('div');
    item.className = 'item-lista';
    item.dataset.id = pericia.id;
    item.dataset.tipo = 'pericia-simples';
    const custoTexto = pericia.dificuldade === 'Fácil' ? '1' : pericia.dificuldade === 'Média' ? '2' : pericia.dificuldade === 'Difícil' ? '4' : '2';
    item.innerHTML = `<div class="item-header"><div class="item-nome">${pericia.nome}</div><div class="item-custo">${custoTexto} pts</div></div><div class="item-descricao">${pericia.descricao || ''}</div><div class="item-info"><span class="item-categoria">${pericia.atributo}/${pericia.dificuldade}</span>${pericia.prereq ? `<span class="item-prereq">Pré-req: ${pericia.prereq}</span>` : ''}</div>`;
    item.addEventListener('click', () => { abrirModalNivelPericia(pericia); });
    return item;
}

function criarItemGrupoModal(grupo) {
    const item = document.createElement('div');
    item.className = 'item-lista item-grupo-modal';
    item.dataset.grupo = grupo.nome;
    item.dataset.tipo = 'modal-escolha';
    item.innerHTML = `<div class="item-header"><div class="item-nome">${grupo.nome}</div><div class="item-custo">Ver opções</div></div><div class="item-descricao">${grupo.descricao || ''}</div><div class="item-info"><span class="item-categoria">Perícias específicas</span><span class="item-especializacao">(Clique para escolher)</span></div>`;
    item.addEventListener('click', () => { abrirModalEscolhaPericia(grupo); });
    return item;
}

function abrirModalEscolhaPericia(grupo) {
    const modal = document.getElementById('modal-pericia');
    const titulo = document.getElementById('modal-titulo-pericia');
    const corpo = document.getElementById('modal-corpo-pericia');
    const btnConfirmar = modal.querySelector('.btn-confirmar');
    const btnCancelar = modal.querySelector('.btn-cancelar');
    if (!modal || !titulo || !corpo) return;
    modal.dataset.grupoAtual = grupo.nome;
    titulo.textContent = grupo.nome;
    let opcoesHTML = '';
    grupo.pericias.forEach((pericia, index) => {
        const dificuldade = pericia.dificuldade || 'Média';
        const custo = pericia.dificuldade === 'Fácil' ? 1 : pericia.dificuldade === 'Média' ? 2 : pericia.dificuldade === 'Difícil' ? 4 : 2;
        opcoesHTML += `<div class="especializacao-item" data-index="${index}"><input type="radio" id="opcao-${grupo.nome}-${index}" name="pericia-escolha" class="especializacao-radio" value="${pericia.id}"><label for="opcao-${grupo.nome}-${index}"><div class="especializacao-header"><strong>${pericia.nome}</strong><span class="especializacao-custo">${custo} pts</span></div><div class="especializacao-desc">${pericia.descricao || ''}</div><div class="especializacao-info">${pericia.prereq ? `<span class="especializacao-prereq">Pré-req: ${pericia.prereq}</span>` : ''}<span class="especializacao-diff">${pericia.atributo || 'DX'}/${dificuldade}</span></div></label></div>`;
    });
    corpo.innerHTML = `<div class="modal-info"><p><strong>Descrição do grupo:</strong> ${grupo.descricao || ''}</p><p><strong>Escolha uma perícia específica:</strong></p></div><div class="especializacoes-container"><div class="especializacoes-lista" style="max-height: 300px; overflow-y: auto;">${opcoesHTML}</div></div><input type="hidden" id="pericia-escolhida-id" value=""><input type="hidden" id="pericia-escolhida-index" value="">`;
    const radios = corpo.querySelectorAll('.especializacao-radio');
    const periciaIdInput = corpo.querySelector('#pericia-escolhida-id');
    const periciaIndexInput = corpo.querySelector('#pericia-escolhida-index');
    radios.forEach((radio, index) => {
        radio.addEventListener('change', () => {
            periciaIdInput.value = radio.value;
            periciaIndexInput.value = index;
            btnConfirmar.disabled = false;
        });
    });
    btnConfirmar.onclick = () => {
        const index = parseInt(periciaIndexInput.value);
        if (!isNaN(index) && index >= 0 && grupo.pericias[index]) {
            const periciaEscolhida = grupo.pericias[index];
            modal.style.display = 'none';
            setTimeout(() => { abrirModalNivelPericia(periciaEscolhida); }, 100);
        }
    };
    btnCancelar.onclick = () => { modal.style.display = 'none'; };
    const modalClose = modal.querySelector('.modal-close');
    if (modalClose) modalClose.onclick = () => { modal.style.display = 'none'; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    btnConfirmar.disabled = true;
    modal.style.display = 'block';
}

function obterTabelaCusto(dificuldade) {
    const tabela = {
        'Fácil': [{ nivel: 0, custo: 1 },{ nivel: 1, custo: 2 },{ nivel: 2, custo: 4 },{ nivel: 3, custo: 8 },{ nivel: 4, custo: 12 },{ nivel: 5, custo: 16 },{ nivel: 6, custo: 20 },{ nivel: 7, custo: 24 },{ nivel: 8, custo: 28 },{ nivel: 9, custo: 32 },{ nivel: 10, custo: 36 }],
        'Média': [{ nivel: -1, custo: 1 },{ nivel: 0, custo: 2 },{ nivel: 1, custo: 4 },{ nivel: 2, custo: 8 },{ nivel: 3, custo: 12 },{ nivel: 4, custo: 16 },{ nivel: 5, custo: 20 },{ nivel: 6, custo: 24 },{ nivel: 7, custo: 28 },{ nivel: 8, custo: 32 },{ nivel: 9, custo: 36 },{ nivel: 10, custo: 40 }],
        'Difícil': [{ nivel: -2, custo: 1 },{ nivel: -1, custo: 2 },{ nivel: 0, custo: 4 },{ nivel: 1, custo: 8 },{ nivel: 2, custo: 12 },{ nivel: 3, custo: 16 },{ nivel: 4, custo: 20 },{ nivel: 5, custo: 24 },{ nivel: 6, custo: 28 },{ nivel: 7, custo: 32 },{ nivel: 8, custo: 36 },{ nivel: 9, custo: 40 },{ nivel: 10, custo: 44 }],
        'Muito Difícil': [{ nivel: -3, custo: 1 },{ nivel: -2, custo: 2 },{ nivel: -1, custo: 4 },{ nivel: 0, custo: 8 },{ nivel: 1, custo: 12 },{ nivel: 2, custo: 16 },{ nivel: 3, custo: 20 },{ nivel: 4, custo: 24 },{ nivel: 5, custo: 28 },{ nivel: 6, custo: 32 },{ nivel: 7, custo: 36 },{ nivel: 8, custo: 40 },{ nivel: 9, custo: 44 },{ nivel: 10, custo: 48 }]
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

function abrirModalNivelPericia(pericia) {
    const modal = document.getElementById('modal-pericia');
    const titulo = document.getElementById('modal-titulo-pericia');
    const corpo = document.getElementById('modal-corpo-pericia');
    const btnConfirmar = modal.querySelector('.btn-confirmar');
    const btnCancelar = modal.querySelector('.btn-cancelar');
    if (!modal || !titulo || !corpo) return;
    const atributos = obterAtributosAtuais();
    const valorAtributo = atributos[pericia.atributo] || 10;
    const periciaExistente = estadoPericias.adquiridas.find(p => p.id === pericia.id);
    let nivelInicial = 0;
    if (periciaExistente) {
        nivelInicial = periciaExistente.nivelRelativo;
    } else {
        switch(pericia.dificuldade) {
            case 'Fácil': nivelInicial = 0; break;
            case 'Média': nivelInicial = -1; break;
            case 'Difícil': nivelInicial = -2; break;
            case 'Muito Difícil': nivelInicial = -3; break;
            default: nivelInicial = -1;
        }
    }
    const custoAtual = periciaExistente ? periciaExistente.custo : calcularCustoPericia(nivelInicial, pericia.dificuldade);
    titulo.textContent = pericia.nome;
    corpo.innerHTML = `<div class="modal-info"><p><strong>Perícia:</strong> ${pericia.nome}</p><p><strong>Atributo:</strong> ${pericia.atributo} (${valorAtributo})</p><p><strong>Dificuldade:</strong> ${pericia.dificuldade}</p><p><strong>Descrição:</strong> ${pericia.descricao || ''}</p>${pericia.prereq ? `<p><strong>Pré-requisito:</strong> ${pericia.prereq}</p>` : ''}${pericia.default ? `<p><strong>Default:</strong> ${pericia.default}</p>` : ''}${periciaExistente ? `<div class="info-existente"><strong>Já adquirida:</strong> Nível ${pericia.atributo}${periciaExistente.nivelRelativo >= 0 ? '+' : ''}${periciaExistente.nivelRelativo} (${custoAtual} pts)</div>` : ''}</div><div class="modal-nivel"><h4>Selecionar Nível</h4><div class="pericia-controle"><button id="btn-pericia-menos" class="btn-pericia">-</button><div class="pericia-valor-container"><div class="pericia-nh" id="nh-final">${valorAtributo + nivelInicial}</div><div class="pericia-nivel" id="nivel-relativo">${pericia.atributo}${nivelInicial >= 0 ? '+' : ''}${nivelInicial}</div></div><button id="btn-pericia-mais" class="btn-pericia">+</button></div><div class="pericia-custo-container"><div class="pericia-custo">Custo: <span id="custo-pericia">${custoAtual}</span> pts</div>${periciaExistente ? `<div class="pericia-custo-adicional">Custo adicional: <span id="custo-adicional">0</span> pts</div>` : ''}</div><div class="info-custos"><small>🎯 <strong>${pericia.dificuldade}:</strong> ${getInfoRedutores(pericia.dificuldade)}</small></div></div><input type="hidden" id="nivel-pericia" value="${nivelInicial}"><input type="hidden" id="pericia-id" value="${pericia.id}">`;
    const nivelHidden = corpo.querySelector('#nivel-pericia');
    const btnMenos = corpo.querySelector('#btn-pericia-menos');
    const btnMais = corpo.querySelector('#btn-pericia-mais');
    const nhFinal = corpo.querySelector('#nh-final');
    const nivelRelativo = corpo.querySelector('#nivel-relativo');
    const custoElement = corpo.querySelector('#custo-pericia');
    const custoAdicional = corpo.querySelector('#custo-adicional');
    const periciaIdHidden = corpo.querySelector('#pericia-id');
    function atualizarDisplay() {
        const nivel = parseInt(nivelHidden.value);
        const custoTotal = calcularCustoPericia(nivel, pericia.dificuldade);
        const nhAtual = valorAtributo + nivel;
        const tabelaCusto = obterTabelaCusto(pericia.dificuldade);
        const niveisValidos = tabelaCusto.map(item => item.nivel);
        const nivelMinimo = Math.min(...niveisValidos);
        const nivelMaximo = Math.max(...niveisValidos);
        nhFinal.textContent = nhAtual;
        nivelRelativo.innerHTML = `${pericia.atributo}${nivel >= 0 ? '+' : ''}${nivel}`;
        custoElement.textContent = custoTotal;
        btnMenos.disabled = nivel <= nivelMinimo;
        btnMais.disabled = nivel >= nivelMaximo;
        if (periciaExistente && custoAdicional) {
            const custoExtra = custoTotal - custoAtual;
            custoAdicional.textContent = custoExtra >= 0 ? `+${custoExtra}` : custoExtra;
            custoAdicional.style.color = custoExtra > 0 ? '#27ae60' : custoExtra < 0 ? '#e74c3c' : '#ccc';
        }
        btnConfirmar.disabled = false;
    }
    btnMenos.addEventListener('click', () => {
        let nivel = parseInt(nivelHidden.value);
        const tabelaCusto = obterTabelaCusto(pericia.dificuldade);
        const niveisValidos = tabelaCusto.map(item => item.nivel);
        const nivelMinimo = Math.min(...niveisValidos);
        if (nivel > nivelMinimo) {
            nivelHidden.value = nivel - 1;
            atualizarDisplay();
        }
    });
    btnMais.addEventListener('click', () => {
        let nivel = parseInt(nivelHidden.value);
        const tabelaCusto = obterTabelaCusto(pericia.dificuldade);
        const niveisValidos = tabelaCusto.map(item => item.nivel);
        const nivelMaximo = Math.max(...niveisValidos);
        if (nivel < nivelMaximo) {
            nivelHidden.value = nivel + 1;
            atualizarDisplay();
        }
    });
    btnConfirmar.onclick = () => {
        const nivel = parseInt(nivelHidden.value);
        const custoTotal = calcularCustoPericia(nivel, pericia.dificuldade);
        if (custoTotal > 0) {
            adicionarOuAtualizarPericia(pericia, nivel, custoTotal);
            modal.style.display = 'none';
        }
    };
    btnCancelar.onclick = () => { modal.style.display = 'none'; };
    const modalClose = modal.querySelector('.modal-close');
    if (modalClose) modalClose.onclick = () => { modal.style.display = 'none'; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    atualizarDisplay();
    modal.style.display = 'block';
}

function adicionarOuAtualizarPericia(pericia, nivel, custo) {
    const indexExistente = estadoPericias.adquiridas.findIndex(p => p.id === pericia.id);
    if (indexExistente !== -1) {
        const custoAntigo = estadoPericias.adquiridas[indexExistente].custo;
        estadoPericias.adquiridas[indexExistente] = {...estadoPericias.adquiridas[indexExistente], nivelRelativo: nivel, custo: custo, dataAtualizacao: new Date().toISOString()};
        estadoPericias.pontosGastos += (custo - custoAntigo);
    } else {
        estadoPericias.adquiridas.push({id: pericia.id, nome: pericia.nome, nivelRelativo: nivel, custo: custo, atributo: pericia.atributo, dificuldade: pericia.dificuldade, descricao: pericia.descricao, prereq: pericia.prereq, default: pericia.default, dataAdquisicao: new Date().toISOString()});
        estadoPericias.pontosGastos += custo;
    }
    atualizarInterfacePericias();
}

function removerPericia(id) {
    const index = estadoPericias.adquiridas.findIndex(p => p.id === id);
    if (index !== -1) {
        const custo = estadoPericias.adquiridas[index].custo;
        estadoPericias.adquiridas.splice(index, 1);
        estadoPericias.pontosGastos -= custo;
        atualizarInterfacePericias();
    }
}

function carregarPericiasAdquiridas() {
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
        item.innerHTML = `<div class="item-header"><div class="item-nome">${pericia.nome} (NH ${nhFinal})</div><div class="item-custo">${pericia.custo} pts</div></div><div class="item-info"><span class="item-categoria">${pericia.atributo}${pericia.nivelRelativo >= 0 ? '+' : ''}${pericia.nivelRelativo} • ${pericia.dificuldade}</span></div>${pericia.descricao ? `<div class="item-descricao">${pericia.descricao}</div>` : ''}<button class="btn-remover" onclick="removerPericia('${pericia.id}')">×</button>`;
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn-remover')) {
                const periciaOriginal = encontrarPericiaNoCatalogo(pericia.id);
                if (periciaOriginal) abrirModalNivelPericia({...periciaOriginal, ...pericia});
            }
        });
        lista.appendChild(item);
    });
    if (totalElement) totalElement.textContent = `${estadoPericias.pontosGastos} pts`;
}

function encontrarPericiaNoCatalogo(id) {
    for (const [categoria, conteudo] of Object.entries(window.catalogoPericias)) {
        if (Array.isArray(conteudo)) {
            const encontrada = conteudo.find(p => p.id === id);
            if (encontrada) return encontrada;
        } else {
            for (const [grupoNome, grupo] of Object.entries(conteudo)) {
                if (grupo.tipo === 'pericia-simples' && grupo.id === id) return grupo;
                else if (grupo.tipo === 'modal-escolha') {
                    const encontrada = grupo.pericias.find(p => p.id === id);
                    if (encontrada) return encontrada;
                }
            }
        }
    }
    return null;
}

function obterAtributosAtuais() {
    return { ST: 10, DX: 10, IQ: 10, HT: 10, PERC: 10 };
}

function obterPontosGastosAtributos() {
    return 0;
}

function adicionarEventosGrupos() {
    const grupos = document.querySelectorAll('.grupo-pericias .grupo-header');
    grupos.forEach(grupo => {
        grupo.addEventListener('click', () => {
            const grupoDiv = grupo.parentElement;
            grupoDiv.classList.toggle('ativo');
        });
    });
}

function atualizarContadorPericias() {
    const contador = document.getElementById('contador-pericias');
    if (!contador) return;
    let total = 0;
    for (const [categoria, conteudo] of Object.entries(window.catalogoPericias)) {
        if (Array.isArray(conteudo)) total += conteudo.length;
        else for (const [grupoNome, grupo] of Object.entries(conteudo)) {
            if (grupo.tipo === 'pericia-simples') total += 1;
            else if (grupo.tipo === 'modal-escolha') total += grupo.pericias.length;
        }
    }
    contador.textContent = `${total} perícias`;
}

function atualizarPontuacaoPericias() {
    const totalPericias = document.getElementById('total-pericias');
    const saldoTotal = document.getElementById('saldo-total-pericias');
    const totalAdquiridas = document.getElementById('total-pericias-adquiridas');
    if (totalPericias) totalPericias.textContent = `+${estadoPericias.pontosGastos}`;
    if (totalAdquiridas) totalAdquiridas.textContent = `${estadoPericias.pontosGastos} pts`;
    if (saldoTotal) {
        const pontosAtributos = obterPontosGastosAtributos();
        const saldo = estadoPericias.pontosDisponiveis - pontosAtributos - estadoPericias.pontosGastos;
        saldoTotal.textContent = saldo;
        saldoTotal.style.color = saldo < 0 ? '#e74c3c' : '#27ae60';
    }
}

function carregarPericiasNaLista() {
    filtrarPericias('', 'Todos');
}

function atualizarInterfacePericias() {
    carregarPericiasAdquiridas();
    atualizarPontuacaoPericias();
    atualizarContadorPericias();
}

function configurarEventosModais() {}

document.addEventListener('DOMContentLoaded', function() {
    const periciasTab = document.getElementById('pericias');
    if (periciasTab && periciasTab.classList.contains('active')) setTimeout(() => { inicializarSistemaPericias(); }, 100);
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'pericias' && tab.classList.contains('active')) setTimeout(() => { inicializarSistemaPericias(); }, 100);
            }
        });
    });
    document.querySelectorAll('.tab-content').forEach(tab => { observer.observe(tab, { attributes: true }); });
});

window.inicializarSistemaPericias = inicializarSistemaPericias;
window.removerPericia = removerPericia;
window.carregarPericiasNaLista = carregarPericiasNaLista;

console.log("✅ Sistema de perícias carregado com sucesso!");
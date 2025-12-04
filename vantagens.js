// SISTEMA DE VANTAGENS E DESVANTAGENS - VERSÃO 100% FUNCIONAL E SEM ERROS
class GerenciadorVantagens {
    constructor() {
        this.vantagensAdquiridas = [];
        this.desvantagensAdquiridas = [];
        this.peculiaridades = [];
        this.itemSelecionado = null;
        this.tipoSelecionado = null;
        this.iniciarQuandoPronto();
    }

    iniciarQuandoPronto() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('🚀 Iniciando sistema de vantagens...');

        // Verifica se o modal existe (seu HTML já tem)
        const modal = document.getElementById('modal-vantagem');
        if (!modal) {
            console.error('❌ Modal de vantagens não encontrado no HTML!');
            return;
        }

        this.carregarVantagens();
        this.carregarDesvantagens();
        this.setupPeculiaridades();
        this.setupEventListeners();
        this.atualizarTotais();

        console.log('✅ Sistema de vantagens inicializado com sucesso!');
    }

    carregarVantagens() {
        const container = document.getElementById('lista-vantagens');
        if (!container) return;

        if (!window.vantagensData?.vantagens) {
            container.innerHTML = '<div class="lista-vazia">Erro: catálogo de vantagens não carregado</div>';
            return;
        }

        container.innerHTML = '';
        vantagensData.vantagens.forEach(vantagem => {
            const item = this.criarItemLista(vantagem, 'vantagem');
            container.appendChild(item);
        });
    }

    carregarDesvantagens() {
        const container = document.getElementById('lista-desvantagens');
        if (!container) return;

        if (!window.vantagensData?.desvantagens) {
            container.innerHTML = '<div class="lista-vazia">Erro: catálogo de desvantagens não carregado</div>';
            return;
        }

        container.innerHTML = '';
        vantagensData.desvantagens.forEach(desvantagem => {
            const item = this.criarItemLista(desvantagem, 'desvantagem');
            container.appendChild(item);
        });
    }

    criarItemLista(item, tipo) {
        const div = document.createElement('div');
        div.className = `item-lista ${tipo}-item`;
        div.style.cursor = 'pointer';
        div.style.padding = '12px';
        div.style.margin = '8px 0';
        div.style.borderRadius = '6px';
        div.style.background = 'rgba(40, 40, 50, 0.5)';
        div.style.transition = 'all 0.2s';
        div.style.border = tipo === 'vantagem' 
            ? '1px solid rgba(46, 204, 113, 0.3)' 
            : '1px solid rgba(231, 76, 60, 0.3)';

        div.onmouseover = () => {
            div.style.backgroundColor = tipo === 'vantagem' 
                ? 'rgba(46, 204, 113, 0.1)' 
                : 'rgba(231, 76, 60, 0.1)';
            div.style.borderColor = tipo === 'vantagem' ? '#2ecc71' : '#e74c3c';
        };
        div.onmouseout = () => {
            div.style.backgroundColor = 'rgba(40, 40, 50, 0.5)';
            div.style.borderColor = tipo === 'vantagem' ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)';
        };

        let custoDisplay = Math.abs(item.custo) || 'var';
        if (item.tipo === 'variavel') {
            custoDisplay = `${Math.abs(item.custoPorNivel || 2)} pts/nível`;
        }

        const nomeCategoria = this.getCategoriaNome(item.categoria);

        div.innerHTML = `
            <div class="item-header">
                <div class="item-nome">${item.nome}</div>
                <div class="item-custo" style="background: ${tipo === 'vantagem' ? 'rgba(46, 204, 113, 0.8)' : 'rgba(231, 76, 60, 0.8)'}">
                    ${custoDisplay}
                </div>
            </div>
            <div class="item-descricao">${item.descricao}</div>
            <div class="item-categoria">${nomeCategoria}</div>
        `;

        div.addEventListener('click', () => this.selecionarItem(item, tipo));
        return div;
    }

    getCategoriaNome(categoria) {
        const map = {
            'mental': '🧠 Mental/Sobrenatural',
            'fisica': '💪 Física',
            'supers': '🦸‍♂️ Supers',
            'social': '🤝 Social'
        };
        return map[categoria] || categoria;
    }

    selecionarItem(item, tipo) {
        this.itemSelecionado = item;
        this.tipoSelecionado = tipo;
        this.abrirModal();
    }

    abrirModal() {
        const modal = document.getElementById('modal-vantagem');
        const titulo = document.getElementById('modal-titulo');
        const corpo = document.getElementById('modal-corpo');
        const btnConfirmar = document.getElementById('btn-confirmar-modal');

        if (!modal || !titulo || !corpo || !btnConfirmar) {
            console.error('Elementos do modal ausentes!');
            return;
        }

        // Define título
        titulo.textContent = this.itemSelecionado.nome;

        // Gera conteúdo do modal
        let conteudo, precisaSelecao = false;
        const tipo = this.itemSelecionado.tipo;
        if (tipo === 'multipla') {
            conteudo = this.criarModalMultipla(this.itemSelecionado);
            precisaSelecao = true;
        } else if (tipo === 'variavel') {
            conteudo = this.criarModalVariavel(this.itemSelecionado);
        } else {
            conteudo = this.criarModalSimples(this.itemSelecionado);
        }

        corpo.innerHTML = conteudo;
        btnConfirmar.disabled = precisaSelecao;
        btnConfirmar.textContent = this.tipoSelecionado === 'vantagem' ? 'Adquirir' : 'Adquirir Desvantagem';

        // Configura eventos específicos
        if (tipo === 'multipla') {
            this.configurarEventosMultipla();
        } else if (tipo === 'variavel') {
            this.configurarCalculadoraVariavel();
        }

        // Exibe modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    criarModalSimples(item) {
        const custo = Math.abs(item.custo) || 0;
        const cor = this.tipoSelecionado === 'vantagem' ? '#2ecc71' : '#e74c3c';
        return `
            <div class="modal-descricao">
                <p>${item.descricao}</p>
            </div>
            <div class="custo-total-display" style="border-color: ${cor}; text-align: center; margin-top: 20px;">
                <div style="font-size: 0.9em; color: #aaa; margin-bottom: 5px;">Custo</div>
                <div style="font-size: 2em; font-weight: bold; color: ${cor};">${custo} pontos</div>
            </div>
        `;
    }

    criarModalMultipla(item) {
        const cor = this.tipoSelecionado === 'vantagem' ? '#2ecc71' : '#e74c3c';
        let html = `<div class="modal-descricao"><p>${item.descricao}</p></div><div style="margin: 20px 0;"><h4 style="color: #ffd700; margin-bottom: 15px;">Selecione uma variação:</h4>`;

        item.variacoes.forEach((variacao, index) => {
            const custo = Math.abs(variacao.custo) || 0;
            html += `
                <div class="modal-variacao">
                    <div style="display: flex; align-items: flex-start; gap: 10px;">
                        <input type="radio" id="variacao-${variacao.id}" name="variacao" value="${variacao.id}" ${index === 0 ? 'checked' : ''}>
                        <div style="flex: 1;">
                            <label for="variacao-${variacao.id}" style="cursor: pointer; display: block;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                                    <strong style="color: #fff; font-size: 1.1em;">${variacao.nome}</strong>
                                    <span style="background: ${cor}; color: white; padding: 4px 12px; border-radius: 12px; font-weight: bold;">${custo} pts</span>
                                </div>
                                <p style="margin: 0; color: #ccc; font-size: 0.9em;">${variacao.descricao}</p>
                            </label>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }

    criarModalVariavel(item) {
        const nivelBase = item.nivelBase || 1;
        const niveisMax = item.niveis || 10;
        const custoPorNivel = Math.abs(item.custoPorNivel || 2);
        const cor = this.tipoSelecionado === 'vantagem' ? '#2ecc71' : '#e74c3c';

        let html = `
            <div class="modal-descricao">
                <p>${item.descricao}</p>
                ${item.limitacoes ? `<div style="margin-top: 10px; padding: 10px; background: rgba(255,140,0,0.1); border-left: 3px solid #ff8c00; font-size: 0.9em;"><strong>⚠️ Limitações:</strong> ${item.limitacoes}</div>` : ''}
            </div>
            <div class="nivel-container">
                <label style="color: #ffd700; font-weight: bold; margin-bottom: 10px; display: block;">Nível:</label>
                <select id="nivel-vantagem" class="nivel-select">
        `;

        for (let i = nivelBase; i <= niveisMax; i++) {
            html += `<option value="${i}">Nível ${i}</option>`;
        }

        html += `</select>`;

        if (item.ampliacoes && item.ampliacoes.length > 0) {
            html += `<div class="ampliacoes-section" style="margin-top: 20px;"><h4 style="color: #ffd700; margin-bottom: 10px;">Ampliações Opcionais:</h4>`;
            item.ampliacoes.forEach(ampliacao => {
                const mult = parseFloat(ampliacao.custoExtra) || 2.5;
                const pct = Math.round((mult - 1) * 100);
                html += `
                    <div class="ampliacao-option">
                        <div style="display: flex; align-items: flex-start; gap: 10px;">
                            <input type="checkbox" id="ampliacao-${ampliacao.id}" class="ampliacao-checkbox" data-multiplicador="${mult}" data-nome="${ampliacao.nome}">
                            <div style="flex: 1;">
                                <label for="ampliacao-${ampliacao.id}" style="cursor: pointer;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                                        <strong style="color: #fff;">${ampliacao.nome}</strong>
                                        <span style="background: #ff8c00; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.85em;">+${pct}% custo</span>
                                    </div>
                                    <p style="margin: 0; color: #aaa; font-size: 0.9em;">${ampliacao.descricao}</p>
                                </label>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        html += `
            <div class="custo-total-display" style="margin-top: 20px; border-color: ${cor}; text-align: center;">
                <div style="font-size: 0.9em; color: #aaa; margin-bottom: 5px;">Custo Total</div>
                <div id="custo-total" style="font-size: 1.5em; font-weight: bold; color: ${cor};">${nivelBase * custoPorNivel} pts</div>
            </div>
        </div>
        `;
        return html;
    }

    configurarEventosMultipla() {
        const radios = document.querySelectorAll('input[name="variacao"]');
        const btn = document.getElementById('btn-confirmar-modal');
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (btn) btn.disabled = false;
            });
        });
    }

    configurarCalculadoraVariavel() {
        const select = document.getElementById('nivel-vantagem');
        const custoTotalEl = document.getElementById('custo-total');
        const checkboxes = document.querySelectorAll('.ampliacao-checkbox');
        if (!select || !custoTotalEl) return;

        const recalcular = () => {
            const nivel = parseInt(select.value) || 1;
            const custoPorNivel = Math.abs(this.itemSelecionado.custoPorNivel || 2);
            let custo = nivel * custoPorNivel;
            let mult = 1.0;
            const ampliacoes = [];

            checkboxes.forEach(cb => {
                if (cb.checked) {
                    mult *= parseFloat(cb.dataset.multiplicador) || 1.0;
                    ampliacoes.push(cb.dataset.nome);
                }
            });

            const total = Math.round(custo * mult);
            custoTotalEl.textContent = `${total} pts`;
            select.dataset.custoFinal = total;
            select.dataset.ampliacoes = JSON.stringify(ampliacoes);
            select.dataset.nivel = nivel;
        };

        select.addEventListener('change', recalcular);
        checkboxes.forEach(cb => cb.addEventListener('change', recalcular));
        recalcular(); // inicial
    }

    confirmarSelecao() {
        if (!this.itemSelecionado || !this.tipoSelecionado) {
            alert('Nenhum item selecionado.');
            return;
        }

        let itemAdquirido = null;

        switch (this.itemSelecionado.tipo) {
            case 'simples':
                itemAdquirido = {
                    id: this.itemSelecionado.id + '-' + Date.now(),
                    baseId: this.itemSelecionado.id,
                    nome: this.itemSelecionado.nome,
                    custo: Math.abs(this.itemSelecionado.custo) || 0,
                    descricao: this.itemSelecionado.descricao,
                    tipo: 'simples'
                };
                break;

            case 'multipla':
                const radio = document.querySelector('input[name="variacao"]:checked');
                if (!radio) {
                    alert('Selecione uma variação.');
                    return;
                }
                const varId = radio.value;
                const variacao = this.itemSelecionado.variacoes.find(v => v.id === varId);
                if (!variacao) {
                    alert('Variação inválida.');
                    return;
                }
                itemAdquirido = {
                    id: this.itemSelecionado.id + '-' + Date.now(),
                    baseId: this.itemSelecionado.id,
                    nome: variacao.nome,
                    custo: Math.abs(variacao.custo) || 0,
                    descricao: variacao.descricao,
                    tipo: 'multipla',
                    variacao: varId
                };
                break;

            case 'variavel':
                const select = document.getElementById('nivel-vantagem');
                if (!select) {
                    alert('Erro ao obter nível.');
                    return;
                }
                const nivel = parseInt(select.dataset.nivel) || parseInt(select.value) || 1;
                const custo = parseInt(select.dataset.custoFinal) || (nivel * Math.abs(this.itemSelecionado.custoPorNivel || 2));
                const ampliacoes = JSON.parse(select.dataset.ampliacoes || '[]');

                itemAdquirido = {
                    id: this.itemSelecionado.id + '-' + Date.now(),
                    baseId: this.itemSelecionado.id,
                    nome: this.itemSelecionado.nome,
                    custo: custo,
                    descricao: this.itemSelecionado.descricao,
                    tipo: 'variavel',
                    nivel: nivel,
                    ampliacoes: ampliacoes
                };
                break;

            default:
                alert('Tipo de item não suportado.');
                return;
        }

        if (!itemAdquirido) return;

        if (this.tipoSelecionado === 'vantagem') {
            this.vantagensAdquiridas.push(itemAdquirido);
        } else {
            itemAdquirido.custo = -Math.abs(itemAdquirido.custo);
            this.desvantagensAdquiridas.push(itemAdquirido);
        }

        this.atualizarListasAdquiridas();
        this.atualizarTotais();
        this.fecharModal();

        const sinal = this.tipoSelecionado === 'vantagem' ? '+' : '-';
        alert(`✅ ${this.tipoSelecionado === 'vantagem' ? 'Vantagem' : 'Desvantagem'} "${itemAdquirido.nome}" adquirida!\nCusto: ${sinal}${Math.abs(itemAdquirido.custo)} pontos`);
    }

    atualizarListasAdquiridas() {
        this.atualizarLista('vantagens-adquiridas', this.vantagensAdquiridas, '#2ecc71', 'vantagem');
        this.atualizarLista('desvantagens-adquiridas', this.desvantagensAdquiridas, '#e74c3c', 'desvantagem');
    }

    atualizarLista(containerId, itens, cor, tipo) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (itens.length === 0) {
            container.innerHTML = '<div class="lista-vazia">Nenhum item adquirido</div>';
            return;
        }

        container.innerHTML = itens.map((item, index) => {
            const sinal = item.custo >= 0 ? '+' : '-';
            const custo = Math.abs(item.custo);

            let detalhes = '';
            if (item.nivel) detalhes += `<div style="font-size: 0.85em; color: #888;">Nível ${item.nivel}</div>`;
            if (item.ampliacoes?.length) {
                detalhes += `<div style="font-size: 0.8em; color: #ff8c00;">Ampliações: ${item.ampliacoes.join(', ')}</div>`;
            }
            if (item.variacao) {
                detalhes += `<div style="font-size: 0.85em; color: #aaa;">Variação</div>`;
            }

            return `
                <div class="item-adquirido" style="border-color: ${cor}; background: ${cor}20; position: relative; padding: 15px 35px 15px 15px;">
                    <div class="item-header">
                        <div class="item-nome">${item.nome}</div>
                        <div class="item-custo" style="background: ${cor};">${sinal}${custo} pts</div>
                    </div>
                    <div class="item-descricao">${item.descricao}</div>
                    ${detalhes}
                    <button onclick="window.vantagensSystem.removerItem(${index}, '${tipo}')" 
                            class="btn-remover" style="background: ${cor}; position: absolute; top: 10px; right: 10px; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: none; cursor: pointer;">
                        ×
                    </button>
                </div>
            `;
        }).join('');
    }

    removerItem(index, tipo) {
        if (!confirm('Remover este item?')) return;

        if (tipo === 'vantagem') {
            this.vantagensAdquiridas.splice(index, 1);
        } else {
            this.desvantagensAdquiridas.splice(index, 1);
        }

        this.atualizarListasAdquiridas();
        this.atualizarTotais();
        alert('Item removido.');
    }

    setupPeculiaridades() {
        const input = document.getElementById('nova-peculiaridade');
        const btn = document.getElementById('btn-adicionar-peculiaridade');
        const contador = document.getElementById('contador-chars');

        if (!input || !btn || !contador) return;

        const atualizarBtn = () => {
            const texto = input.value.trim();
            btn.disabled = !texto || texto.length > 30 || this.peculiaridades.length >= 5;
            contador.textContent = texto.length;
        };

        input.addEventListener('input', atualizarBtn);
        btn.addEventListener('click', () => {
            const texto = input.value.trim();
            if (texto && texto.length <= 30 && this.peculiaridades.length < 5) {
                this.adicionarPeculiaridade(texto);
                input.value = '';
                atualizarBtn();
            }
        });
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !btn.disabled) {
                btn.click();
            }
        });

        this.renderizarPeculiaridades();
    }

    adicionarPeculiaridade(texto) {
        this.peculiaridades.push({
            id: 'peculiaridade-' + Date.now(),
            texto: texto
        });
        this.renderizarPeculiaridades();
        this.atualizarTotais();
    }

    renderizarPeculiaridades() {
        const container = document.getElementById('lista-peculiaridades');
        const contador = document.getElementById('contador-peculiaridades');
        if (!container || !contador) return;

        contador.textContent = `${this.peculiaridades.length}/5`;

        if (this.peculiaridades.length === 0) {
            container.innerHTML = '<div class="lista-vazia">Nenhuma peculiaridade adicionada</div>';
            return;
        }

        container.innerHTML = this.peculiaridades.map((p, i) => `
            <div class="peculiaridade-item">
                <div class="peculiaridade-texto">${p.texto}</div>
                <button onclick="window.vantagensSystem.removerPeculiaridade(${i})" 
                        class="btn-remover" style="background: #f39c12;">
                    ×
                </button>
            </div>
        `).join('');
    }

    removerPeculiaridade(index) {
        this.peculiaridades.splice(index, 1);
        this.renderizarPeculiaridades();
        this.atualizarTotais();
    }

    atualizarTotais() {
        const totalVantagens = this.vantagensAdquiridas.reduce((s, i) => s + Math.abs(i.custo), 0);
        const totalDesvantagens = this.desvantagensAdquiridas.reduce((s, i) => s + Math.abs(i.custo), 0);
        const totalPeculiaridades = this.peculiaridades.length;

        this.atualizarElemento('total-vantagens', `+${totalVantagens}`);
        this.atualizarElemento('total-desvantagens', `-${totalDesvantagens}`);
        this.atualizarElemento('total-peculiaridades', `-${totalPeculiaridades}`);

        const saldo = totalVantagens - totalDesvantagens - totalPeculiaridades;
        this.atualizarElemento('saldo-total', saldo);

        this.atualizarElemento('total-vantagens-adquiridas', `${totalVantagens} pts`);
        this.atualizarElemento('total-desvantagens-adquiridas', `${totalDesvantagens} pts`);
    }

    atualizarElemento(id, valor) {
        const el = document.getElementById(id);
        if (el) el.textContent = valor;
    }

    setupEventListeners() {
        // Filtros
        this.configurarFiltro('vantagens');
        this.configurarFiltro('desvantagens');

        // Fechar modal com ESC ou clique fora
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.fecharModal();
        });

        document.getElementById('modal-vantagem')?.addEventListener('click', (e) => {
            if (e.target.id === 'modal-vantagem') this.fecharModal();
        });
    }

    configurarFiltro(tipo) {
        const busca = document.getElementById(`busca-${tipo}`);
        const categoria = document.getElementById(`categoria-${tipo}`);
        if (busca) busca.addEventListener('input', () => this.filtrarLista(tipo));
        if (categoria) categoria.addEventListener('change', () => this.filtrarLista(tipo));
    }

    filtrarLista(tipo) {
        const termo = (document.getElementById(`busca-${tipo}`)?.value || '').toLowerCase();
        const cat = document.getElementById(`categoria-${tipo}`)?.value || '';
        const container = document.getElementById(`lista-${tipo}`);
        const itens = tipo === 'vantagens' ? vantagensData.vantagens : vantagensData.desvantagens;

        if (!container || !itens) return;

        const filtrados = itens.filter(item => {
            const nomeMatch = item.nome.toLowerCase().includes(termo);
            const descMatch = item.descricao.toLowerCase().includes(termo);
            const catMatch = !cat || item.categoria === cat;
            return (nomeMatch || descMatch) && catMatch;
        });

        container.innerHTML = '';
        if (filtrados.length === 0) {
            container.innerHTML = '<div class="lista-vazia">Nenhum item encontrado</div>';
            return;
        }

        filtrados.forEach(item => {
            const el = this.criarItemLista(item, tipo === 'vantagens' ? 'vantagem' : 'desvantagem');
            container.appendChild(el);
        });
    }

    fecharModal() {
        const modal = document.getElementById('modal-vantagem');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            this.itemSelecionado = null;
            this.tipoSelecionado = null;
            const corpo = document.getElementById('modal-corpo');
            if (corpo) corpo.innerHTML = '';
        }
    }

    // Métodos públicos
    getDadosSalvar() {
        return {
            vantagens: this.vantagensAdquiridas,
            desvantagens: this.desvantagensAdquiridas,
            peculiaridades: this.peculiaridades
        };
    }

    carregarDados(dados) {
        if (dados.vantagens) this.vantagensAdquiridas = dados.vantagens;
        if (dados.desvantagens) this.desvantagensAdquiridas = dados.desvantagens;
        if (dados.peculiaridades) this.peculiaridades = dados.peculiaridades;
        this.atualizarListasAdquiridas();
        this.atualizarTotais();
    }
}

// INICIALIZAÇÃO GLOBAL — APENAS UMA VEZ
let vantagensSystem;

document.addEventListener('DOMContentLoaded', function () {
    if (window._vantagensSystemInitialized) return;
    window._vantagensSystemInitialized = true;

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            if (this.getAttribute('data-tab') === 'vantagens') {
                if (!window.vantagensSystem) {
                    vantagensSystem = new GerenciadorVantagens();
                    window.vantagensSystem = vantagensSystem;
                }
            }
        });
    });
});
// SISTEMA DE VANTAGENS E DESVANTAGENS
class GerenciadorVantagens {
    constructor() {
        this.vantagensAdquiridas = [];
        this.desvantagensAdquiridas = [];
        this.peculiaridades = [];
        this.pontosTotais = 0;
        
        this.init();
    }

    init() {
        this.carregarVantagens();
        this.carregarDesvantagens();
        this.setupEventListeners();
        this.setupPeculiaridades();
        this.atualizarTotais();
    }

    carregarVantagens() {
        const lista = document.getElementById('lista-vantagens');
        lista.innerHTML = '';

        vantagensData.vantagens.forEach(vantagem => {
            const item = this.criarItemLista(vantagem, 'vantagem');
            lista.appendChild(item);
        });
    }

    carregarDesvantagens() {
        const lista = document.getElementById('lista-desvantagens');
        lista.innerHTML = '';

        vantagensData.desvantagens.forEach(desvantagem => {
            const item = this.criarItemLista(desvantagem, 'desvantagem');
            lista.appendChild(item);
        });
    }

    criarItemLista(item, tipo) {
        const div = document.createElement('div');
        div.className = `item-lista ${tipo}-item`;
        div.innerHTML = `
            <div class="item-header">
                <div class="item-nome">${item.nome}</div>
                <div class="item-custo">${Math.abs(item.custo)} pts</div>
            </div>
            <div class="item-descricao">${item.descricao}</div>
            <div class="item-categoria">${this.getCategoriaNome(item.categoria)}</div>
        `;

        div.addEventListener('click', () => {
            this.abrirModalItem(item, tipo);
        });

        return div;
    }

    getCategoriaNome(categoria) {
        const categorias = {
            'mental': 'Mental/Sobrenatural',
            'fisica': 'Física', 
            'supers': 'Supers',
            'social': 'Social'
        };
        return categorias[categoria] || categoria;
    }

    abrirModalItem(item, tipo) {
        const modal = document.getElementById('modal-vantagem');
        const titulo = document.getElementById('modal-titulo');
        const corpo = document.getElementById('modal-corpo');
        const btnConfirmar = document.querySelector('.btn-confirmar');

        titulo.textContent = item.nome;
        
        // Limpar evento anterior
        btnConfirmar.onclick = null;

        switch(item.tipo) {
            case 'simples':
                corpo.innerHTML = this.criarModalSimples(item);
                btnConfirmar.onclick = () => this.adicionarItem(item, tipo);
                btnConfirmar.disabled = false;
                break;

            case 'multipla':
                corpo.innerHTML = this.criarModalMultipla(item);
                btnConfirmar.onclick = () => this.confirmarMultipla(item, tipo);
                btnConfirmar.disabled = true;
                break;

            case 'variavel':
                corpo.innerHTML = this.criarModalVariavel(item);
                btnConfirmar.onclick = () => this.confirmarVariavel(item, tipo);
                btnConfirmar.disabled = false;
                break;
        }

        modal.style.display = 'block';
    }

    criarModalSimples(item) {
        return `
            <div class="modal-descricao">
                <p>${item.descricao}</p>
                <div class="custo-info">
                    <strong>Custo: ${Math.abs(item.custo)} pontos</strong>
                </div>
            </div>
        `;
    }

    criarModalMultipla(item) {
        let html = `
            <div class="modal-descricao">
                <p>${item.descricao}</p>
                <div class="variacoes-lista">
        `;

        item.variacoes.forEach((variacao, index) => {
            html += `
                <div class="modal-variacao" data-variacao-id="${variacao.id}">
                    <input type="radio" id="variacao-${variacao.id}" name="variacao" value="${variacao.id}">
                    <label for="variacao-${variacao.id}">
                        <strong>${variacao.nome} (${Math.abs(variacao.custo)} pts)</strong>
                        <p>${variacao.descricao}</p>
                    </label>
                </div>
            `;
        });

        html += `</div></div>`;

        // Adicionar event listeners para os radios
        setTimeout(() => {
            document.querySelectorAll('input[name="variacao"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    document.querySelector('.btn-confirmar').disabled = false;
                });
            });
        }, 100);

        return html;
    }

    criarModalVariavel(item) {
        const nivelInicial = item.nivelBase || 1;
        const custoInicial = nivelInicial * item.custoPorNivel;

        let html = `
            <div class="modal-descricao">
                <p>${item.descricao}</p>
                ${item.limitacoes ? `<p><small>${item.limitacoes}</small></p>` : ''}
                
                <div class="modal-nivel">
                    <label for="nivel-vantagem">Nível:</label>
                    <select id="nivel-vantagem" class="atributo-input">
        `;

        for(let i = item.nivelBase; i <= item.niveis; i++) {
            html += `<option value="${i}">${i}</option>`;
        }

        html += `
                    </select>
                    <div class="nivel-info">
                        <span>Custo por nível: ${Math.abs(item.custoPorNivel)} pts</span>
                        <span class="custo-total" id="custo-total">${Math.abs(custoInicial)} pts</span>
                    </div>
        `;

        // Ampliações
        if(item.ampliacoes) {
            item.ampliacoes.forEach(ampliacao => {
                html += `
                    <div class="ampliacao-option">
                        <input type="checkbox" id="ampliacao-${ampliacao.id}" data-custo="${ampliacao.custoExtra}">
                        <label for="ampliacao-${ampliacao.id}">
                            <strong>${ampliacao.nome} (+${(ampliacao.custoExtra * 100) - 100}%)</strong>
                            <p>${ampliacao.descricao}</p>
                        </label>
                    </div>
                `;
            });
        }

        html += `</div></div>`;

        // Event listeners para cálculos dinâmicos
        setTimeout(() => {
            const selectNivel = document.getElementById('nivel-vantagem');
            const custoTotal = document.getElementById('custo-total');
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');

            const calcularCusto = () => {
                let nivel = parseInt(selectNivel.value);
                let custo = nivel * item.custoPorNivel;
                
                checkboxes.forEach(checkbox => {
                    if(checkbox.checked) {
                        custo *= parseFloat(checkbox.dataset.custo);
                    }
                });

                custoTotal.textContent = Math.abs(Math.round(custo)) + ' pts';
            };

            selectNivel.addEventListener('change', calcularCusto);
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', calcularCusto);
            });
        }, 100);

        return html;
    }

    confirmarMultipla(item, tipo) {
        const radioSelecionado = document.querySelector('input[name="variacao"]:checked');
        if (!radioSelecionado) return;

        const variacaoId = radioSelecionado.value;
        const variacao = item.variacoes.find(v => v.id === variacaoId);
        
        const itemCompleto = {
            ...item,
            ...variacao,
            variacaoSelecionada: variacaoId
        };

        this.adicionarItem(itemCompleto, tipo);
    }

    confirmarVariavel(item, tipo) {
        const nivel = parseInt(document.getElementById('nivel-vantagem').value);
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        
        let custo = nivel * item.custoPorNivel;
        let ampliacoes = [];

        checkboxes.forEach(checkbox => {
            if(checkbox.checked) {
                custo *= parseFloat(checkbox.dataset.custo);
                ampliacoes.push(checkbox.id.replace('ampliacao-', ''));
            }
        });

        const itemCompleto = {
            ...item,
            nivelSelecionado: nivel,
            custo: Math.round(custo),
            ampliacoesSelecionadas: ampliacoes
        };

        this.adicionarItem(itemCompleto, tipo);
    }

    adicionarItem(item, tipo) {
        const itemAdquirido = {
            id: item.id + '-' + Date.now(),
            baseId: item.id,
            nome: item.nome,
            custo: item.custo,
            descricao: item.descricao,
            tipo: item.tipo,
            variacao: item.variacaoSelecionada,
            nivel: item.nivelSelecionado,
            ampliacoes: item.ampliacoesSelecionadas
        };

        if (tipo === 'vantagem') {
            this.vantagensAdquiridas.push(itemAdquirido);
            this.renderizarListaAdquiridas('vantagens-adquiridas', this.vantagensAdquiridas, 'vantagem');
        } else {
            this.desvantagensAdquiridas.push(itemAdquirido);
            this.renderizarListaAdquiridas('desvantagens-adquiridas', this.desvantagensAdquiridas, 'desvantagem');
        }

        this.fecharModal();
        this.atualizarTotais();
    }

    renderizarListaAdquiridas(containerId, itens, tipo) {
        const container = document.getElementById(containerId);
        
        if (itens.length === 0) {
            container.innerHTML = '<div class="lista-vazia">Nenhum item adquirido</div>';
            return;
        }

        container.innerHTML = itens.map(item => `
            <div class="item-lista item-adquirido">
                <div class="item-header">
                    <div class="item-nome">${item.nome}</div>
                    <div class="item-custo">${Math.abs(item.custo)} pts</div>
                </div>
                <div class="item-descricao">${item.descricao}</div>
                ${item.nivel ? `<div class="item-categoria">Nível ${item.nivel}</div>` : ''}
                ${item.variacao ? `<div class="item-categoria">${this.getNomeVariacao(item.baseId, item.variacao)}</div>` : ''}
                <button class="btn-remover" onclick="vantagensSystem.removerItem('${item.id}', '${tipo}')">×</button>
            </div>
        `).join('');
    }

    getNomeVariacao(baseId, variacaoId) {
        const item = [...vantagensData.vantagens, ...vantagensData.desvantagens].find(i => i.id === baseId);
        if (item && item.variacoes) {
            const variacao = item.variacoes.find(v => v.id === variacaoId);
            return variacao ? variacao.nome : '';
        }
        return '';
    }

    removerItem(itemId, tipo) {
        if (tipo === 'vantagem') {
            this.vantagensAdquiridas = this.vantagensAdquiridas.filter(item => item.id !== itemId);
            this.renderizarListaAdquiridas('vantagens-adquiridas', this.vantagensAdquiridas, 'vantagem');
        } else {
            this.desvantagensAdquiridas = this.desvantagensAdquiridas.filter(item => item.id !== itemId);
            this.renderizarListaAdquiridas('desvantagens-adquiridas', this.desvantagensAdquiridas, 'desvantagem');
        }
        this.atualizarTotais();
    }

    setupPeculiaridades() {
        const input = document.getElementById('nova-peculiaridade');
        const btnAdicionar = document.getElementById('btn-adicionar-peculiaridade');
        const contadorChars = document.getElementById('contador-chars');

        input.addEventListener('input', () => {
            const texto = input.value;
            contadorChars.textContent = texto.length;
            
            btnAdicionar.disabled = texto.length === 0 || texto.length > 30 || this.peculiaridades.length >= 5;
        });

        btnAdicionar.addEventListener('click', () => {
            this.adicionarPeculiaridade(input.value);
            input.value = '';
            contadorChars.textContent = '0';
            btnAdicionar.disabled = true;
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !btnAdicionar.disabled) {
                this.adicionarPeculiaridade(input.value);
                input.value = '';
                contadorChars.textContent = '0';
                btnAdicionar.disabled = true;
            }
        });
    }

    adicionarPeculiaridade(texto) {
        if (this.peculiaridades.length >= 5) return;

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

        contador.textContent = `${this.peculiaridades.length}/5`;

        if (this.peculiaridades.length === 0) {
            container.innerHTML = '<div class="lista-vazia">Nenhuma peculiaridade adicionada</div>';
            return;
        }

        container.innerHTML = this.peculiaridades.map(pec => `
            <div class="peculiaridade-item">
                <p class="peculiaridade-texto">${pec.texto}</p>
                <button class="btn-remover" onclick="vantagensSystem.removerPeculiaridade('${pec.id}')">×</button>
            </div>
        `).join('');
    }

    removerPeculiaridade(id) {
        this.peculiaridades = this.peculiaridades.filter(pec => pec.id !== id);
        this.renderizarPeculiaridades();
        this.atualizarTotais();
    }

    atualizarTotais() {
        const totalVantagens = this.vantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0);
        const totalDesvantagens = this.desvantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0);
        const totalPeculiaridades = this.peculiaridades.length * 1; // 1 ponto cada

        document.getElementById('total-vantagens').textContent = `+${totalVantagens}`;
        document.getElementById('total-desvantagens').textContent = `-${totalDesvantagens}`;
        document.getElementById('total-peculiaridades').textContent = `-${totalPeculiaridades}`;
        document.getElementById('saldo-total').textContent = totalVantagens - totalDesvantagens - totalPeculiaridades;

        document.getElementById('total-vantagens-adquiridas').textContent = `${totalVantagens} pts`;
        document.getElementById('total-desvantagens-adquiridas').textContent = `${totalDesvantagens} pts`;
    }

    setupEventListeners() {
        // Fechar modal
        document.querySelector('.modal-close').addEventListener('click', () => this.fecharModal());
        document.querySelector('.btn-cancelar').addEventListener('click', () => this.fecharModal());
        
        // Fechar modal clicando fora
        document.getElementById('modal-vantagem').addEventListener('click', (e) => {
            if (e.target.id === 'modal-vantagem') this.fecharModal();
        });

        // Buscas e filtros
        document.getElementById('busca-vantagens').addEventListener('input', () => this.filtrarLista('vantagens'));
        document.getElementById('categoria-vantagens').addEventListener('change', () => this.filtrarLista('vantagens'));
        
        document.getElementById('busca-desvantagens').addEventListener('input', () => this.filtrarLista('desvantagens'));
        document.getElementById('categoria-desvantagens').addEventListener('change', () => this.filtrarLista('desvantagens'));
    }

    filtrarLista(tipo) {
        const buscaId = `busca-${tipo}`;
        const categoriaId = `categoria-${tipo}`;
        const listaId = `lista-${tipo}`;

        const termoBusca = document.getElementById(buscaId).value.toLowerCase();
        const categoria = document.getElementById(categoriaId).value;

        const itens = tipo === 'vantagens' ? vantagensData.vantagens : vantagensData.desvantagens;
        const lista = document.getElementById(listaId);

        const itensFiltrados = itens.filter(item => {
            const matchBusca = item.nome.toLowerCase().includes(termoBusca) || 
                             item.descricao.toLowerCase().includes(termoBusca);
            const matchCategoria = !categoria || item.categoria === categoria;
            
            return matchBusca && matchCategoria;
        });

        lista.innerHTML = '';
        itensFiltrados.forEach(item => {
            const itemElement = this.criarItemLista(item, tipo === 'vantagens' ? 'vantagem' : 'desvantagem');
            lista.appendChild(itemElement);
        });
    }

    fecharModal() {
        document.getElementById('modal-vantagem').style.display = 'none';
    }
}

// Inicializar sistema
const vantagensSystem = new GerenciadorVantagens();
// SISTEMA DE VANTAGENS E DESVANTAGENS - VERSÃO CORRIGIDA
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
        
        let custoDisplay = Math.abs(item.custo) || 'var';
        if (item.tipo === 'variavel') {
            custoDisplay = `${Math.abs(item.custoPorNivel || 2)} pts/nível`;
        }
        
        div.innerHTML = `
            <div class="item-header">
                <div class="item-nome">${item.nome}</div>
                <div class="item-custo">${custoDisplay}</div>
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
        const nivelBase = item.nivelBase || 1;
        const niveisMax = item.niveis || 10;
        const custoPorNivel = Math.abs(item.custoPorNivel || 2);

        let html = `
            <div class="modal-descricao">
                <p>${item.descricao}</p>
                ${item.limitacoes ? `<p><small>${item.limitacoes}</small></p>` : ''}
                
                <div class="modal-nivel">
                    <label for="nivel-vantagem">Nível:</label>
                    <select id="nivel-vantagem" class="atributo-input">
        `;

        for(let i = nivelBase; i <= niveisMax; i++) {
            html += `<option value="${i}">Nível ${i}</option>`;
        }

        html += `
                    </select>
                    <div class="nivel-info">
                        <div class="custo-total-container">
                            <span>Custo: </span>
                            <span class="custo-total" id="custo-total">${nivelBase * custoPorNivel} pts</span>
                        </div>
                    </div>
        `;

        if(item.ampliacoes && item.ampliacoes.length > 0) {
            html += `<div class="ampliacoes-section"><h4>Ampliações Opcionais:</h4>`;
            
            item.ampliacoes.forEach((ampliacao, index) => {
                const custoMultiplicador = parseFloat(ampliacao.custoExtra) || 2.5;
                const percentualAumento = (custoMultiplicador - 1) * 100;
                
                html += `
                    <div class="ampliacao-option">
                        <input type="checkbox" id="ampliacao-${ampliacao.id}" 
                               data-multiplicador="${custoMultiplicador}" 
                               data-nome="${ampliacao.nome}"
                               class="ampliacao-checkbox">
                        <label for="ampliacao-${ampliacao.id}">
                            <strong>${ampliacao.nome} (+${percentualAumento}%)</strong>
                            <p>${ampliacao.descricao}</p>
                        </label>
                    </div>
                `;
            });
            
            html += `</div>`;
        }

        html += `</div></div>`;

        setTimeout(() => {
            const selectNivel = document.getElementById('nivel-vantagem');
            const custoTotal = document.getElementById('custo-total');
            const checkboxes = document.querySelectorAll('.ampliacao-checkbox');

            // FUNÇÃO CORRIGIDA - SEM MULTIPLICAÇÃO CUMULATIVA
            const calcularCusto = () => {
                const nivel = parseInt(selectNivel.value) || nivelBase;
                let custoBase = nivel * custoPorNivel;
                let multiplicadorTotal = 1.0;
                let ampliacoesAtivas = [];
                
                // Calcula o multiplicador total corretamente
                checkboxes.forEach(checkbox => {
                    if(checkbox.checked) {
                        const multiplicador = parseFloat(checkbox.dataset.multiplicador) || 1.0;
                        multiplicadorTotal *= multiplicador; // Acumula multiplicadores
                        ampliacoesAtivas.push(checkbox.dataset.nome);
                    }
                });
                
                // Aplica o multiplicador total UMA VEZ
                const custoFinal = Math.round(custoBase * multiplicadorTotal);
                
                custoTotal.textContent = `${custoFinal} pts`;
                selectNivel.dataset.custoFinal = custoFinal;
                selectNivel.dataset.ampliacoes = JSON.stringify(ampliacoesAtivas);
                
                console.log(`DEBUG: Nível ${nivel}, Custo base ${custoBase}, Multiplicador ${multiplicadorTotal}, Custo final ${custoFinal}`);
            };

            calcularCusto(); // Calcula inicial

            // Event listeners
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
        const selectNivel = document.getElementById('nivel-vantagem');
        const nivel = parseInt(selectNivel.value) || (item.nivelBase || 1);
        
        // Obtém o custo final calculado ou recalcula se necessário
        let custoFinal = parseInt(selectNivel.dataset.custoFinal);
        if (isNaN(custoFinal) || custoFinal <= 0) {
            const custoPorNivel = Math.abs(item.custoPorNivel || 2);
            custoFinal = nivel * custoPorNivel;
            
            // Verifica ampliações se houver
            const checkboxes = document.querySelectorAll('.ampliacao-checkbox:checked');
            if (checkboxes.length > 0) {
                let multiplicadorTotal = 1.0;
                checkboxes.forEach(checkbox => {
                    const multiplicador = parseFloat(checkbox.dataset.multiplicador) || 1.0;
                    multiplicadorTotal *= multiplicador;
                });
                custoFinal = Math.round(custoFinal * multiplicadorTotal);
            }
        }
        
        let ampliacoesSelecionadas = [];
        try {
            ampliacoesSelecionadas = JSON.parse(selectNivel.dataset.ampliacoes || '[]');
        } catch (e) {
            ampliacoesSelecionadas = [];
        }

        const itemCompleto = {
            ...item,
            nivelSelecionado: nivel,
            custo: custoFinal,
            ampliacoesSelecionadas: ampliacoesSelecionadas
        };

        this.adicionarItem(itemCompleto, tipo);
    }

    adicionarItem(item, tipo) {
        // Garante que o custo seja um número válido
        let custoCalculado = Math.abs(item.custo) || 0;
        if (isNaN(custoCalculado) || custoCalculado <= 0) {
            if (item.tipo === 'variavel') {
                const nivel = item.nivelSelecionado || (item.nivelBase || 1);
                const custoPorNivel = Math.abs(item.custoPorNivel || 2);
                custoCalculado = nivel * custoPorNivel;
            }
        }

        const itemAdquirido = {
            id: item.id + '-' + Date.now(),
            baseId: item.id,
            nome: item.nome,
            custo: custoCalculado,
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

        container.innerHTML = itens.map(item => {
            let infoExtra = '';
            
            if (item.nivel) {
                infoExtra = `<div class="item-categoria">Nível ${item.nivel}</div>`;
            }
            
            if (item.variacao) {
                infoExtra = `<div class="item-categoria">${this.getNomeVariacao(item.baseId, item.variacao)}</div>`;
            }
            
            if (item.ampliacoes && item.ampliacoes.length > 0) {
                infoExtra += `<div class="item-ampliacoes"><small>Ampliações: ${item.ampliacoes.join(', ')}</small></div>`;
            }

            return `
                <div class="item-lista item-adquirido">
                    <div class="item-header">
                        <div class="item-nome">${item.nome}</div>
                        <div class="item-custo">${Math.abs(item.custo)} pts</div>
                    </div>
                    <div class="item-descricao">${item.descricao}</div>
                    ${infoExtra}
                    <button class="btn-remover" onclick="vantagensSystem.removerItem('${item.id}', '${tipo}')">×</button>
                </div>
            `;
        }).join('');
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
        const totalVantagens = this.vantagensAdquiridas.reduce((sum, item) => {
            const custo = Math.abs(item.custo) || 0;
            return sum + (isNaN(custo) ? 0 : custo);
        }, 0);
        
        const totalDesvantagens = this.desvantagensAdquiridas.reduce((sum, item) => {
            const custo = Math.abs(item.custo) || 0;
            return sum + (isNaN(custo) ? 0 : custo);
        }, 0);
        
        const totalPeculiaridades = this.peculiaridades.length * 1;

        document.getElementById('total-vantagens').textContent = `+${totalVantagens}`;
        document.getElementById('total-desvantagens').textContent = `-${totalDesvantagens}`;
        document.getElementById('total-peculiaridades').textContent = `-${totalPeculiaridades}`;
        
        const saldoTotal = totalVantagens - totalDesvantagens - totalPeculiaridades;
        document.getElementById('saldo-total').textContent = saldoTotal;

        document.getElementById('total-vantagens-adquiridas').textContent = `${totalVantagens} pts`;
        document.getElementById('total-desvantagens-adquiridas').textContent = `${totalDesvantagens} pts`;
    }

    setupEventListeners() {
        document.querySelector('.modal-close').addEventListener('click', () => this.fecharModal());
        document.querySelector('.btn-cancelar').addEventListener('click', () => this.fecharModal());
        
        document.getElementById('modal-vantagem').addEventListener('click', (e) => {
            if (e.target.id === 'modal-vantagem') this.fecharModal();
        });

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
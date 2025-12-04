// SISTEMA DE VANTAGENS E DESVANTAGENS - VERSÃO FUNCIONAL
class GerenciadorVantagens {
    constructor() {
        this.vantagensAdquiridas = [];
        this.desvantagensAdquiridas = [];
        this.peculiaridades = [];
        this.itemSelecionado = null;
        this.tipoSelecionado = null;
        
        setTimeout(() => this.init(), 100);
    }

    init() {
        if (!document.getElementById('modal-vantagem')) {
            setTimeout(() => this.init(), 500);
            return;
        }
        
        if (!window.vantagensData) {
            return;
        }
        
        this.carregarVantagens();
        this.carregarDesvantagens();
        this.setupPeculiaridades();
        this.setupEventListeners();
        this.atualizarTotais();
    }

    carregarVantagens() {
        const lista = document.getElementById('lista-vantagens');
        if (!lista || !window.vantagensData?.vantagens) return;
        
        lista.innerHTML = '';
        window.vantagensData.vantagens.forEach(vantagem => {
            const item = this.criarItemLista(vantagem, 'vantagem');
            lista.appendChild(item);
        });
    }

    carregarDesvantagens() {
        const lista = document.getElementById('lista-desvantagens');
        if (!lista || !window.vantagensData?.desvantagens) return;
        
        lista.innerHTML = '';
        window.vantagensData.desvantagens.forEach(desvantagem => {
            const item = this.criarItemLista(desvantagem, 'desvantagem');
            lista.appendChild(item);
        });
    }

    criarItemLista(item, tipo) {
        const div = document.createElement('div');
        div.className = `item-lista ${tipo}-item`;
        div.style.cssText = `
            cursor: pointer;
            padding: 12px;
            margin: 8px 0;
            border: 1px solid ${tipo === 'vantagem' ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)'};
            border-radius: 6px;
            background: rgba(40, 40, 50, 0.5);
            transition: all 0.2s;
        `;
        
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
        
        div.innerHTML = `
            <div class="item-header">
                <div class="item-nome">${item.nome}</div>
                <div class="item-custo" style="background: ${tipo === 'vantagem' ? 'rgba(46, 204, 113, 0.8)' : 'rgba(231, 76, 60, 0.8)'}">
                    ${custoDisplay}
                </div>
            </div>
            <div class="item-descricao">${item.descricao}</div>
            <div class="item-categoria">${this.getCategoriaNome(item.categoria)}</div>
        `;

        div.addEventListener('click', () => this.selecionarItem(item, tipo));
        return div;
    }

    getCategoriaNome(categoria) {
        const categorias = {
            'mental': '🧠 Mental/Sobrenatural',
            'fisica': '💪 Física', 
            'supers': '🦸‍♂️ Supers',
            'social': '🤝 Social'
        };
        return categorias[categoria] || categoria;
    }

    selecionarItem(item, tipo) {
        this.itemSelecionado = item;
        this.tipoSelecionado = tipo;
        this.abrirModal();
    }

    abrirModal() {
        if (!this.itemSelecionado) return;
        
        const modal = document.getElementById('modal-vantagem');
        const titulo = document.getElementById('modal-titulo');
        const corpo = document.getElementById('modal-corpo');
        const btnConfirmar = document.getElementById('btn-confirmar-modal');
        
        if (!modal || !titulo || !corpo) {
            alert('Erro: Modal não carregado corretamente.');
            return;
        }
        
        titulo.textContent = this.itemSelecionado.nome;
        
        let modalHTML = '';
        let precisaSelecao = false;
        
        switch(this.itemSelecionado.tipo) {
            case 'simples':
                modalHTML = this.criarModalSimples(this.itemSelecionado);
                break;
            case 'multipla':
                modalHTML = this.criarModalMultipla(this.itemSelecionado);
                precisaSelecao = true;
                break;
            case 'variavel':
                modalHTML = this.criarModalVariavel(this.itemSelecionado);
                break;
            default:
                modalHTML = this.criarModalSimples(this.itemSelecionado);
        }
        
        corpo.innerHTML = modalHTML;
        
        if (btnConfirmar) {
            btnConfirmar.disabled = precisaSelecao;
            btnConfirmar.textContent = this.tipoSelecionado === 'vantagem' ? 'Adquirir' : 'Adquirir Desvantagem';
            
            // Atualiza o evento do botão
            const novoBtn = btnConfirmar.cloneNode(true);
            btnConfirmar.parentNode.replaceChild(novoBtn, btnConfirmar);
            novoBtn.addEventListener('click', () => this.confirmarSelecao());
        }
        
        setTimeout(() => {
            if (this.itemSelecionado.tipo === 'multipla') {
                this.configurarEventosMultipla();
            } else if (this.itemSelecionado.tipo === 'variavel') {
                this.configurarCalculadoraVariavel();
            }
        }, 50);
        
        modal.style.display = 'block';
    }

    configurarEventosMultipla() {
        const radios = document.querySelectorAll('input[name="variacao"]');
        const btnConfirmar = document.getElementById('btn-confirmar-modal');
        
        if (radios.length > 0 && btnConfirmar) {
            radios.forEach(radio => {
                radio.addEventListener('change', () => {
                    btnConfirmar.disabled = false;
                });
            });
        }
    }

    configurarCalculadoraVariavel() {
        const select = document.getElementById('nivel-vantagem');
        const custoTotal = document.getElementById('custo-total');
        const checkboxes = document.querySelectorAll('.ampliacao-checkbox');
        
        if (!select || !custoTotal) return;
        
        const calcularCusto = () => {
            const nivel = parseInt(select.value) || 1;
            const custoPorNivel = Math.abs(this.itemSelecionado.custoPorNivel || 2);
            let custoBase = nivel * custoPorNivel;
            let multiplicador = 1.0;
            
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    const mult = parseFloat(checkbox.dataset.multiplicador) || 1.0;
                    multiplicador *= mult;
                }
            });
            
            const custoFinal = Math.round(custoBase * multiplicador);
            custoTotal.textContent = `${custoFinal} pts`;
            select.dataset.custoFinal = custoFinal;
        };
        
        calcularCusto();
        select.addEventListener('change', calcularCusto);
        checkboxes.forEach(cb => cb.addEventListener('change', calcularCusto));
    }

    criarModalSimples(item) {
        const custo = Math.abs(item.custo) || 0;
        const tipo = this.tipoSelecionado === 'vantagem' ? 'vantagem' : 'desvantagem';
        const cor = tipo === 'vantagem' ? '#2ecc71' : '#e74c3c';
        
        return `
            <div class="modal-descricao">
                <p>${item.descricao}</p>
            </div>
            <div class="custo-total-display" style="border-color: ${cor}">
                <div style="text-align: center;">
                    <div style="font-size: 0.9em; color: #aaa; margin-bottom: 5px;">Custo</div>
                    <div style="font-size: 2em; font-weight: bold; color: ${cor}">${custo} pontos</div>
                </div>
            </div>
        `;
    }

    criarModalMultipla(item) {
        let html = `
            <div class="modal-descricao">
                <p>${item.descricao}</p>
            </div>
            <div style="margin: 20px 0;">
                <h4 style="color: #ffd700; margin-bottom: 15px;">Selecione uma variação:</h4>
        `;

        item.variacoes.forEach((variacao, index) => {
            const custo = Math.abs(variacao.custo) || 0;
            const tipo = this.tipoSelecionado === 'vantagem' ? 'vantagem' : 'desvantagem';
            const cor = tipo === 'vantagem' ? '#2ecc71' : '#e74c3c';
            
            html += `
                <div class="modal-variacao">
                    <div style="display: flex; align-items: flex-start; gap: 10px;">
                        <input type="radio" id="variacao-${variacao.id}" 
                               name="variacao" value="${variacao.id}" 
                               ${index === 0 ? 'checked' : ''}
                               style="margin-top: 4px;">
                        <div style="flex: 1;">
                            <label for="variacao-${variacao.id}" style="cursor: pointer; display: block;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                                    <strong style="color: #fff; font-size: 1.1em;">${variacao.nome}</strong>
                                    <span style="background: ${cor}; color: white; padding: 4px 12px; border-radius: 12px; font-weight: bold;">
                                        ${custo} pts
                                    </span>
                                </div>
                                <p style="margin: 0; color: #ccc; font-size: 0.9em;">${variacao.descricao}</p>
                            </label>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        return html;
    }

    criarModalVariavel(item) {
        const nivelBase = item.nivelBase || 1;
        const niveisMax = item.niveis || 10;
        const custoPorNivel = Math.abs(item.custoPorNivel || 2);
        const tipo = this.tipoSelecionado === 'vantagem' ? 'vantagem' : 'desvantagem';
        const cor = tipo === 'vantagem' ? '#2ecc71' : '#e74c3c';

        let html = `
            <div class="modal-descricao">
                <p>${item.descricao}</p>
                ${item.limitacoes ? 
                    `<div class="limitacao-info">
                        <strong>⚠️ Limitações:</strong> ${item.limitacoes}
                    </div>` : ''}
            </div>
            
            <div class="nivel-container">
                <label style="color: #ffd700; font-weight: bold; margin-bottom: 10px; display: block;">
                    Selecione o nível:
                </label>
                <select id="nivel-vantagem" class="nivel-select">
        `;

        for(let i = nivelBase; i <= niveisMax; i++) {
            html += `<option value="${i}">Nível ${i}</option>`;
        }

        html += `</select>`;

        if(item.ampliacoes && item.ampliacoes.length > 0) {
            html += `
                <div class="ampliacoes-section" style="margin-top: 20px;">
                    <h4 style="color: #ffd700; margin-bottom: 10px;">Ampliações Opcionais:</h4>
            `;
            
            item.ampliacoes.forEach((ampliacao) => {
                const custoMultiplicador = parseFloat(ampliacao.custoExtra) || 2.5;
                const percentualAumento = (custoMultiplicador - 1) * 100;
                
                html += `
                    <div class="ampliacao-option">
                        <div style="display: flex; align-items: flex-start; gap: 10px;">
                            <input type="checkbox" 
                                   id="ampliacao-${ampliacao.id}" 
                                   class="ampliacao-checkbox"
                                   data-multiplicador="${custoMultiplicador}" 
                                   data-nome="${ampliacao.nome}">
                            <div style="flex: 1;">
                                <label for="ampliacao-${ampliacao.id}" style="cursor: pointer;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                                        <strong style="color: #fff;">${ampliacao.nome}</strong>
                                        <span style="background: #ff8c00; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.85em;">
                                            +${percentualAumento}% de custo
                                        </span>
                                    </div>
                                    <p style="margin: 0; color: #aaa; font-size: 0.9em;">${ampliacao.descricao}</p>
                                </label>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
        }

        html += `
                <div class="custo-total-display" style="margin-top: 20px; border-color: ${cor}">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: bold;">Custo Total:</span>
                        <span id="custo-total" style="font-size: 1.5em; color: ${cor}; font-weight: bold;">
                            ${nivelBase * custoPorNivel} pts
                        </span>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    confirmarSelecao() {
        if (!this.itemSelecionado || !this.tipoSelecionado) {
            alert('Erro: Nenhum item selecionado!');
            return;
        }
        
        let itemAdquirido = null;
        let custoFinal = 0;
        
        switch(this.itemSelecionado.tipo) {
            case 'simples':
                itemAdquirido = {
                    id: this.itemSelecionado.id + '-' + Date.now(),
                    nome: this.itemSelecionado.nome,
                    custo: Math.abs(this.itemSelecionado.custo) || 0,
                    descricao: this.itemSelecionado.descricao
                };
                custoFinal = Math.abs(this.itemSelecionado.custo) || 0;
                break;
                
            case 'multipla':
                const radioSelecionado = document.querySelector('input[name="variacao"]:checked');
                if (!radioSelecionado) {
                    alert('Por favor, selecione uma variação!');
                    return;
                }
                
                const variacaoId = radioSelecionado.value;
                const variacao = this.itemSelecionado.variacoes.find(v => v.id === variacaoId);
                
                if (!variacao) {
                    alert('Variação não encontrada!');
                    return;
                }
                
                itemAdquirido = {
                    id: this.itemSelecionado.id + '-' + Date.now(),
                    nome: variacao.nome,
                    custo: Math.abs(variacao.custo) || 0,
                    descricao: variacao.descricao
                };
                custoFinal = Math.abs(variacao.custo) || 0;
                break;
                
            case 'variavel':
                const select = document.getElementById('nivel-vantagem');
                if (!select) {
                    alert('Erro ao obter nível selecionado!');
                    return;
                }
                
                const nivel = parseInt(select.value) || 1;
                custoFinal = parseInt(select.dataset.custoFinal) || 
                            (nivel * Math.abs(this.itemSelecionado.custoPorNivel || 2));
                
                itemAdquirido = {
                    id: this.itemSelecionado.id + '-' + Date.now(),
                    nome: this.itemSelecionado.nome,
                    custo: custoFinal,
                    descricao: this.itemSelecionado.descricao,
                    nivel: nivel
                };
                break;
        }
        
        if (!itemAdquirido) {
            alert('Erro ao criar item!');
            return;
        }
        
        // Para desvantagens, o custo é negativo
        if (this.tipoSelecionado === 'desvantagem') {
            itemAdquirido.custo = -Math.abs(itemAdquirido.custo);
            this.desvantagensAdquiridas.push(itemAdquirido);
        } else {
            this.vantagensAdquiridas.push(itemAdquirido);
        }
        
        this.atualizarListasAdquiridas();
        this.atualizarTotais();
        this.fecharModal();
        
        const tipoTexto = this.tipoSelecionado === 'vantagem' ? 'Vantagem' : 'Desvantagem';
        alert(`✅ ${tipoTexto} "${itemAdquirido.nome}" adquirida com sucesso!`);
    }

    atualizarListasAdquiridas() {
        this.atualizarLista('vantagens-adquiridas', this.vantagensAdquiridas, '#2ecc71');
        this.atualizarLista('desvantagens-adquiridas', this.desvantagensAdquiridas, '#e74c3c');
    }

    atualizarLista(elementId, itens, cor) {
        const container = document.getElementById(elementId);
        if (!container) return;

        if (itens.length === 0) {
            container.innerHTML = '<div class="lista-vazia">Nenhum item adquirido</div>';
            return;
        }

        container.innerHTML = itens.map((item, index) => {
            const custo = Math.abs(item.custo);
            const sinal = item.custo >= 0 ? '+' : '-';
            
            return `
                <div class="item-adquirido" style="border-color: ${cor}; background: ${cor}20;">
                    <div class="item-header">
                        <div class="item-nome">${item.nome}</div>
                        <div class="item-custo" style="background: ${cor}">
                            ${sinal}${custo} pts
                        </div>
                    </div>
                    <div class="item-descricao">${item.descricao}</div>
                    <button onclick="vantagensSystem.removerItem(${index}, '${cor === '#2ecc71' ? 'vantagem' : 'desvantagem'}')" 
                            class="btn-remover" style="background: ${cor}">
                        ×
                    </button>
                </div>
            `;
        }).join('');
    }

    removerItem(index, tipo) {
        if (!confirm('Tem certeza que deseja remover este item?')) return;
        
        if (tipo === 'vantagem') {
            this.vantagensAdquiridas.splice(index, 1);
        } else {
            this.desvantagensAdquiridas.splice(index, 1);
        }
        
        this.atualizarListasAdquiridas();
        this.atualizarTotais();
    }

    setupPeculiaridades() {
        const input = document.getElementById('nova-peculiaridade');
        const btnAdicionar = document.getElementById('btn-adicionar-peculiaridade');
        const contadorChars = document.getElementById('contador-chars');

        if (!input || !btnAdicionar || !contadorChars) return;

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

        this.renderizarPeculiaridades();
    }

    adicionarPeculiaridade(texto) {
        if (this.peculiaridades.length >= 5) {
            alert('Limite de 5 peculiaridades atingido!');
            return;
        }

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

        container.innerHTML = this.peculiaridades.map((pec, index) => `
            <div class="peculiaridade-item">
                <div class="peculiaridade-texto">${pec.texto}</div>
                <button onclick="vantagensSystem.removerPeculiaridade(${index})" 
                        class="btn-remover" style="background: #f39c12">
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
        const totalVantagens = this.vantagensAdquiridas.reduce((sum, item) => sum + (Math.abs(item.custo) || 0), 0);
        const totalDesvantagens = this.desvantagensAdquiridas.reduce((sum, item) => sum + (Math.abs(item.custo) || 0), 0);
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
        this.configurarFiltro('vantagens');
        this.configurarFiltro('desvantagens');
        
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('modal-vantagem');
            if (modal && modal.style.display === 'block' && e.target === modal) {
                this.fecharModal();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.fecharModal();
            }
        });
    }

    configurarFiltro(tipo) {
        const busca = document.getElementById(`busca-${tipo}`);
        const categoria = document.getElementById(`categoria-${tipo}`);
        
        if (busca) {
            busca.addEventListener('input', () => this.filtrarLista(tipo));
        }
        
        if (categoria) {
            categoria.addEventListener('change', () => this.filtrarLista(tipo));
        }
    }

    filtrarLista(tipo) {
        const buscaId = `busca-${tipo}`;
        const categoriaId = `categoria-${tipo}`;
        const listaId = `lista-${tipo}`;

        const termoBusca = document.getElementById(buscaId)?.value.toLowerCase() || '';
        const categoria = document.getElementById(categoriaId)?.value || '';
        const lista = document.getElementById(listaId);

        if (!lista) return;

        const itens = tipo === 'vantagens' ? window.vantagensData.vantagens : window.vantagensData.desvantagens;

        const itensFiltrados = itens.filter(item => {
            const matchBusca = item.nome.toLowerCase().includes(termoBusca) || 
                             item.descricao.toLowerCase().includes(termoBusca);
            const matchCategoria = !categoria || item.categoria === categoria;
            return matchBusca && matchCategoria;
        });

        lista.innerHTML = '';
        
        if (itensFiltrados.length === 0) {
            lista.innerHTML = '<div class="lista-vazia">Nenhum item encontrado</div>';
            return;
        }
        
        itensFiltrados.forEach(item => {
            const itemElement = this.criarItemLista(item, tipo === 'vantagens' ? 'vantagem' : 'desvantagem');
            lista.appendChild(itemElement);
        });
    }

    fecharModal() {
        const modal = document.getElementById('modal-vantagem');
        if (modal) {
            modal.style.display = 'none';
            this.itemSelecionado = null;
            this.tipoSelecionado = null;
            
            const corpo = document.getElementById('modal-corpo');
            if (corpo) corpo.innerHTML = '';
        }
    }
}

// INICIALIZAÇÃO AUTOMÁTICA
document.addEventListener('DOMContentLoaded', function() {
    window.vantagensSystem = new GerenciadorVantagens();
});
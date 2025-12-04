// SISTEMA DE VANTAGENS E DESVANTAGENS - VERSÃO SUPER SIMPLES E FUNCIONAL
class GerenciadorVantagens {
    constructor() {
        this.vantagensAdquiridas = [];
        this.desvantagensAdquiridas = [];
        this.peculiaridades = [];
        this.pontosTotais = 0;
        
        // Item sendo selecionado no momento
        this.itemSelecionado = null;
        this.tipoSelecionado = null;
        
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
        if (!lista) return;
        
        lista.innerHTML = '';

        vantagensData.vantagens.forEach(vantagem => {
            const item = this.criarItemLista(vantagem, 'vantagem');
            lista.appendChild(item);
        });
    }

    carregarDesvantagens() {
        const lista = document.getElementById('lista-desvantagens');
        if (!lista) return;
        
        lista.innerHTML = '';

        vantagensData.desvantagens.forEach(desvantagem => {
            const item = this.criarItemLista(desvantagem, 'desvantagem');
            lista.appendChild(item);
        });
    }

    criarItemLista(item, tipo) {
        const div = document.createElement('div');
        div.className = `item-lista ${tipo}-item`;
        div.style.cursor = 'pointer';
        div.style.padding = '10px';
        div.style.margin = '5px 0';
        div.style.border = '1px solid #444';
        div.style.borderRadius = '5px';
        
        let custoDisplay = Math.abs(item.custo) || 'var';
        if (item.tipo === 'variavel') {
            custoDisplay = `${Math.abs(item.custoPorNivel || 2)} pts/nível`;
        }
        
        div.innerHTML = `
            <div class="item-header">
                <div class="item-nome"><strong>${item.nome}</strong></div>
                <div class="item-custo">${custoDisplay}</div>
            </div>
            <div class="item-descricao" style="font-size: 0.9em; color: #ccc;">${item.descricao}</div>
            <div class="item-categoria" style="font-size: 0.8em; color: #888;">${this.getCategoriaNome(item.categoria)}</div>
        `;

        div.addEventListener('click', () => {
            this.itemSelecionado = item;
            this.tipoSelecionado = tipo;
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
        console.log('Abrindo modal para:', item.nome);
        
        const modal = document.getElementById('modal-vantagem');
        const titulo = document.getElementById('modal-titulo');
        const corpo = document.getElementById('modal-corpo');
        const btnConfirmar = document.getElementById('btn-confirmar-modal');

        if (!modal || !titulo || !corpo || !btnConfirmar) {
            console.error('Elementos do modal não encontrados!');
            alert('Erro: Modal não encontrado!');
            return;
        }

        // Armazena os dados para usar depois
        this.itemSelecionado = item;
        this.tipoSelecionado = tipo;

        titulo.textContent = item.nome;
        
        // Configura o conteúdo baseado no tipo
        let html = '';
        switch(item.tipo) {
            case 'simples':
                html = this.criarModalSimples(item);
                btnConfirmar.onclick = () => this.confirmarSimples();
                break;
                
            case 'multipla':
                html = this.criarModalMultipla(item);
                btnConfirmar.onclick = () => this.confirmarMultipla();
                break;
                
            case 'variavel':
                html = this.criarModalVariavel(item);
                btnConfirmar.onclick = () => this.confirmarVariavel();
                break;
        }
        
        corpo.innerHTML = html;
        
        // Configura eventos específicos
        if (item.tipo === 'multipla') {
            this.configurarEventosMultipla();
        } else if (item.tipo === 'variavel') {
            this.configurarEventosVariavel();
        }
        
        // Mostra o modal
        modal.style.display = 'block';
        modal.style.zIndex = '9999';
        
        console.log('Modal aberto com sucesso!');
    }

    configurarEventosMultipla() {
        // Aguarda o DOM atualizar
        setTimeout(() => {
            const radios = document.querySelectorAll('input[name="variacao"]');
            const btnConfirmar = document.getElementById('btn-confirmar-modal');
            
            if (radios.length > 0 && btnConfirmar) {
                radios.forEach(radio => {
                    radio.addEventListener('change', () => {
                        btnConfirmar.disabled = false;
                    });
                });
                
                // Desabilita o botão inicialmente
                btnConfirmar.disabled = true;
            }
        }, 100);
    }

    configurarEventosVariavel() {
        setTimeout(() => {
            const selectNivel = document.getElementById('nivel-vantagem');
            const custoTotal = document.getElementById('custo-total');
            const checkboxes = document.querySelectorAll('.ampliacao-checkbox');

            if (!selectNivel || !custoTotal) return;

            const calcularCusto = () => {
                const nivel = parseInt(selectNivel.value) || 1;
                const custoPorNivel = Math.abs(this.itemSelecionado.custoPorNivel || 2);
                let custoBase = nivel * custoPorNivel;
                let multiplicadorTotal = 1.0;
                let ampliacoesAtivas = [];
                
                checkboxes.forEach(checkbox => {
                    if(checkbox.checked) {
                        const multiplicador = parseFloat(checkbox.dataset.multiplicador) || 1.0;
                        multiplicadorTotal *= multiplicador;
                        ampliacoesAtivas.push(checkbox.dataset.nome);
                    }
                });
                
                const custoFinal = Math.round(custoBase * multiplicadorTotal);
                
                custoTotal.textContent = `${custoFinal} pts`;
                selectNivel.dataset.custoFinal = custoFinal;
                selectNivel.dataset.ampliacoes = JSON.stringify(ampliacoesAtivas);
            };

            calcularCusto();

            selectNivel.addEventListener('change', calcularCusto);
            
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', calcularCusto);
            });
        }, 100);
    }

    // FUNÇÕES DE CONFIRMAÇÃO DIRETAS
    confirmarSimples() {
        if (!this.itemSelecionado || !this.tipoSelecionado) return;
        
        const itemAdquirido = {
            id: this.itemSelecionado.id + '-' + Date.now(),
            baseId: this.itemSelecionado.id,
            nome: this.itemSelecionado.nome,
            custo: Math.abs(this.itemSelecionado.custo) || 0,
            descricao: this.itemSelecionado.descricao,
            tipo: this.itemSelecionado.tipo
        };

        if (this.tipoSelecionado === 'vantagem') {
            this.vantagensAdquiridas.push(itemAdquirido);
        } else {
            this.desvantagensAdquiridas.push(itemAdquirido);
        }

        this.renderizarListas();
        this.atualizarTotais();
        this.fecharModal();
        
        alert(`${this.itemSelecionado.nome} adquirido com sucesso!`);
    }

    confirmarMultipla() {
        if (!this.itemSelecionado || !this.tipoSelecionado) return;
        
        const radioSelecionado = document.querySelector('input[name="variacao"]:checked');
        if (!radioSelecionado) {
            alert('Selecione uma variação!');
            return;
        }

        const variacaoId = radioSelecionado.value;
        const variacao = this.itemSelecionado.variacoes.find(v => v.id === variacaoId);
        
        if (!variacao) return;

        const itemAdquirido = {
            id: this.itemSelecionado.id + '-' + Date.now(),
            baseId: this.itemSelecionado.id,
            nome: variacao.nome,
            custo: Math.abs(variacao.custo) || 0,
            descricao: variacao.descricao,
            tipo: this.itemSelecionado.tipo,
            variacao: variacaoId
        };

        if (this.tipoSelecionado === 'vantagem') {
            this.vantagensAdquiridas.push(itemAdquirido);
        } else {
            this.desvantagensAdquiridas.push(itemAdquirido);
        }

        this.renderizarListas();
        this.atualizarTotais();
        this.fecharModal();
        
        alert(`${variacao.nome} adquirido com sucesso!`);
    }

    confirmarVariavel() {
        if (!this.itemSelecionado || !this.tipoSelecionado) return;
        
        const selectNivel = document.getElementById('nivel-vantagem');
        if (!selectNivel) return;
        
        const nivel = parseInt(selectNivel.value) || (this.itemSelecionado.nivelBase || 1);
        
        let custoFinal = parseInt(selectNivel.dataset.custoFinal);
        if (isNaN(custoFinal) || custoFinal <= 0) {
            const custoPorNivel = Math.abs(this.itemSelecionado.custoPorNivel || 2);
            custoFinal = nivel * custoPorNivel;
            
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

        const itemAdquirido = {
            id: this.itemSelecionado.id + '-' + Date.now(),
            baseId: this.itemSelecionado.id,
            nome: this.itemSelecionado.nome,
            custo: custoFinal,
            descricao: this.itemSelecionado.descricao,
            tipo: this.itemSelecionado.tipo,
            nivel: nivel,
            ampliacoes: this.itemSelecionado.ampliacoesSelecionadas || []
        };

        if (this.tipoSelecionado === 'vantagem') {
            this.vantagensAdquiridas.push(itemAdquirido);
        } else {
            this.desvantagensAdquiridas.push(itemAdquirido);
        }

        this.renderizarListas();
        this.atualizarTotais();
        this.fecharModal();
        
        alert(`${this.itemSelecionado.nome} Nível ${nivel} adquirido com sucesso!`);
    }

    // FUNÇÕES AUXILIARES (mantenha as originais)
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
                <div class="modal-variacao" style="margin: 10px 0; padding: 10px; border: 1px solid #555; border-radius: 5px;">
                    <input type="radio" id="variacao-${variacao.id}" name="variacao" value="${variacao.id}">
                    <label for="variacao-${variacao.id}" style="cursor: pointer;">
                        <strong>${variacao.nome} (${Math.abs(variacao.custo)} pts)</strong>
                        <p style="margin: 5px 0; font-size: 0.9em;">${variacao.descricao}</p>
                    </label>
                </div>
            `;
        });

        html += `</div></div>`;
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
                
                <div class="modal-nivel" style="margin: 15px 0;">
                    <label for="nivel-vantagem" style="display: block; margin-bottom: 5px;"><strong>Nível:</strong></label>
                    <select id="nivel-vantagem" style="width: 100%; padding: 8px; background: #333; color: white; border: 1px solid #555;">
        `;

        for(let i = nivelBase; i <= niveisMax; i++) {
            html += `<option value="${i}">Nível ${i}</option>`;
        }

        html += `
                    </select>
                    <div class="nivel-info" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #555;">
                        <div class="custo-total-container">
                            <strong>Custo Total: <span id="custo-total" style="color: #2ecc71;">${nivelBase * custoPorNivel} pts</span></strong>
                        </div>
                    </div>
                </div>
        `;

        if(item.ampliacoes && item.ampliacoes.length > 0) {
            html += `<div class="ampliacoes-section" style="margin-top: 20px;">
                <h4 style="margin-bottom: 10px;">Ampliações Opcionais:</h4>`;
            
            item.ampliacoes.forEach((ampliacao, index) => {
                const custoMultiplicador = parseFloat(ampliacao.custoExtra) || 2.5;
                const percentualAumento = (custoMultiplicador - 1) * 100;
                
                html += `
                    <div class="ampliacao-option" style="margin: 10px 0; padding: 10px; background: #2a2a3a; border-radius: 5px;">
                        <input type="checkbox" id="ampliacao-${ampliacao.id}" 
                               data-multiplicador="${custoMultiplicador}" 
                               data-nome="${ampliacao.nome}"
                               style="margin-right: 10px;">
                        <label for="ampliacao-${ampliacao.id}" style="cursor: pointer;">
                            <strong>${ampliacao.nome} (+${percentualAumento}%)</strong>
                            <p style="margin: 5px 0; font-size: 0.9em;">${ampliacao.descricao}</p>
                        </label>
                    </div>
                `;
            });
            
            html += `</div>`;
        }

        html += `</div>`;
        return html;
    }

    renderizarListas() {
        // Renderiza vantagens adquiridas
        const vantagensContainer = document.getElementById('vantagens-adquiridas');
        if (vantagensContainer) {
            if (this.vantagensAdquiridas.length === 0) {
                vantagensContainer.innerHTML = '<div class="lista-vazia">Nenhuma vantagem adquirida</div>';
            } else {
                vantagensContainer.innerHTML = this.vantagensAdquiridas.map(item => `
                    <div class="item-lista item-adquirido" style="position: relative; padding: 10px; margin: 5px 0; border: 1px solid #2ecc71; border-radius: 5px;">
                        <div class="item-header" style="display: flex; justify-content: space-between;">
                            <div class="item-nome"><strong>${item.nome}</strong></div>
                            <div class="item-custo" style="color: #2ecc71;">${Math.abs(item.custo)} pts</div>
                        </div>
                        <div class="item-descricao" style="font-size: 0.9em; color: #ccc;">${item.descricao}</div>
                        ${item.nivel ? `<div style="font-size: 0.8em; color: #888;">Nível ${item.nivel}</div>` : ''}
                        ${item.variacao ? `<div style="font-size: 0.8em; color: #888;">${item.variacao}</div>` : ''}
                        <button onclick="vantagensSystem.removerItem('${item.id}', 'vantagem')" 
                                style="position: absolute; top: 5px; right: 5px; background: #e74c3c; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer;">×</button>
                    </div>
                `).join('');
            }
        }

        // Renderiza desvantagens adquiridas
        const desvantagensContainer = document.getElementById('desvantagens-adquiridas');
        if (desvantagensContainer) {
            if (this.desvantagensAdquiridas.length === 0) {
                desvantagensContainer.innerHTML = '<div class="lista-vazia">Nenhuma desvantagem adquirida</div>';
            } else {
                desvantagensContainer.innerHTML = this.desvantagensAdquiridas.map(item => `
                    <div class="item-lista item-adquirido" style="position: relative; padding: 10px; margin: 5px 0; border: 1px solid #e74c3c; border-radius: 5px;">
                        <div class="item-header" style="display: flex; justify-content: space-between;">
                            <div class="item-nome"><strong>${item.nome}</strong></div>
                            <div class="item-custo" style="color: #e74c3c;">${Math.abs(item.custo)} pts</div>
                        </div>
                        <div class="item-descricao" style="font-size: 0.9em; color: #ccc;">${item.descricao}</div>
                        <button onclick="vantagensSystem.removerItem('${item.id}', 'desvantagem')" 
                                style="position: absolute; top: 5px; right: 5px; background: #e74c3c; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer;">×</button>
                    </div>
                `).join('');
            }
        }
    }

    // Restante das funções (setupPeculiaridades, atualizarTotais, etc) mantenha iguais
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
        alert('Peculiaridade adicionada! Custo: -1 ponto');
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

        container.innerHTML = this.peculiaridades.map(pec => `
            <div class="peculiaridade-item" style="position: relative; padding: 10px; margin: 5px 0; border: 1px solid #f39c12; border-radius: 5px;">
                <p class="peculiaridade-texto">${pec.texto}</p>
                <button class="btn-remover" onclick="vantagensSystem.removerPeculiaridade('${pec.id}')" 
                        style="position: absolute; top: 5px; right: 5px; background: #f39c12; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer;">×</button>
            </div>
        `).join('');
    }

    removerPeculiaridade(id) {
        this.peculiaridades = this.peculiaridades.filter(pec => pec.id !== id);
        this.renderizarPeculiaridades();
        this.atualizarTotais();
        alert('Peculiaridade removida!');
    }

    removerItem(itemId, tipo) {
        if (tipo === 'vantagem') {
            this.vantagensAdquiridas = this.vantagensAdquiridas.filter(item => item.id !== itemId);
        } else {
            this.desvantagensAdquiridas = this.desvantagensAdquiridas.filter(item => item.id !== itemId);
        }
        
        this.renderizarListas();
        this.atualizarTotais();
        alert('Item removido com sucesso!');
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

        const totalVantagensEl = document.getElementById('total-vantagens');
        const totalDesvantagensEl = document.getElementById('total-desvantagens');
        const totalPeculiaridadesEl = document.getElementById('total-peculiaridades');
        const saldoTotalEl = document.getElementById('saldo-total');
        const totalVantagensAdquiridasEl = document.getElementById('total-vantagens-adquiridas');
        const totalDesvantagensAdquiridasEl = document.getElementById('total-desvantagens-adquiridas');

        if (totalVantagensEl) totalVantagensEl.textContent = `+${totalVantagens}`;
        if (totalDesvantagensEl) totalDesvantagensEl.textContent = `-${totalDesvantagens}`;
        if (totalPeculiaridadesEl) totalPeculiaridadesEl.textContent = `-${totalPeculiaridades}`;
        
        const saldoTotal = totalVantagens - totalDesvantagens - totalPeculiaridades;
        if (saldoTotalEl) saldoTotalEl.textContent = saldoTotal;

        if (totalVantagensAdquiridasEl) totalVantagensAdquiridasEl.textContent = `${totalVantagens} pts`;
        if (totalDesvantagensAdquiridasEl) totalDesvantagensAdquiridasEl.textContent = `${totalDesvantagens} pts`;
    }

    setupEventListeners() {
        // Filtros
        const buscaVantagens = document.getElementById('busca-vantagens');
        const categoriaVantagens = document.getElementById('categoria-vantagens');
        const buscaDesvantagens = document.getElementById('busca-desvantagens');
        const categoriaDesvantagens = document.getElementById('categoria-desvantagens');
        
        if (buscaVantagens) {
            buscaVantagens.addEventListener('input', () => this.filtrarLista('vantagens'));
        }
        if (categoriaVantagens) {
            categoriaVantagens.addEventListener('change', () => this.filtrarLista('vantagens'));
        }
        
        if (buscaDesvantagens) {
            buscaDesvantagens.addEventListener('input', () => this.filtrarLista('desvantagens'));
        }
        if (categoriaDesvantagens) {
            categoriaDesvantagens.addEventListener('change', () => this.filtrarLista('desvantagens'));
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

        const itens = tipo === 'vantagens' ? vantagensData.vantagens : vantagensData.desvantagens;

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
        const modal = document.getElementById('modal-vantagem');
        if (modal) {
            modal.style.display = 'none';
            this.itemSelecionado = null;
            this.tipoSelecionado = null;
            
            // Limpa o botão confirmar
            const btnConfirmar = document.getElementById('btn-confirmar-modal');
            if (btnConfirmar) btnConfirmar.onclick = null;
        }
    }
}

// Inicialização SIMPLES
const vantagensSystem = new GerenciadorVantagens();
window.vantagensSystem = vantagensSystem;
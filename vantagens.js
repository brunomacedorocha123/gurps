// SISTEMA DE VANTAGENS E DESVANTAGENS - VERSÃO 100% FUNCIONAL
class GerenciadorVantagens {
    constructor() {
        this.vantagensAdquiridas = [];
        this.desvantagensAdquiridas = [];
        this.peculiaridades = [];
        this.pontosTotais = 0;
        
        // Dados temporários
        this.itemSelecionado = null;
        this.tipoSelecionado = null;
        
        // Inicialização garantida
        this.iniciarQuandoPronto();
    }

    iniciarQuandoPronto() {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(() => this.init(), 100);
        } else {
            document.addEventListener('DOMContentLoaded', () => setTimeout(() => this.init(), 100));
        }
    }

    init() {
        console.log('🚀 Iniciando sistema de vantagens...');
        
        // Verificar se o modal existe
        if (!document.getElementById('modal-vantagem')) {
            console.warn('Modal não encontrado, criando emergencial...');
            this.criarModalEmergencial();
        }
        
        this.carregarVantagens();
        this.carregarDesvantagens();
        this.setupPeculiaridades();
        this.setupEventListeners();
        this.atualizarTotais();
        
        console.log('✅ Sistema de vantagens inicializado!');
    }

    // CRIAR MODAL SE NÃO EXISTIR
    criarModalEmergencial() {
        console.log('Criando modal emergencial...');
        
        const modalHTML = `
            <div id="modal-vantagem" style="display: none; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.8);">
                <div style="background-color: #1e1e28; margin: 10% auto; padding: 30px; border: 2px solid #ff8c00; width: 90%; max-width: 600px; border-radius: 10px; position: relative;">
                    <span id="modal-close-btn" style="position: absolute; right: 20px; top: 15px; color: #aaa; font-size: 28px; cursor: pointer; font-weight: bold;">&times;</span>
                    <h2 id="modal-titulo" style="color: #ffd700; margin-bottom: 20px;">Vantagem</h2>
                    <div id="modal-corpo" style="margin-bottom: 30px; max-height: 400px; overflow-y: auto; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 5px;"></div>
                    <div style="display: flex; justify-content: flex-end; gap: 15px; padding-top: 20px; border-top: 1px solid #444;">
                        <button id="modal-cancelar-btn" style="padding: 12px 24px; background: #555; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Cancelar</button>
                        <button id="modal-confirmar-btn" style="padding: 12px 24px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Adquirir</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Configurar eventos
        document.getElementById('modal-close-btn').addEventListener('click', () => this.fecharModal());
        document.getElementById('modal-cancelar-btn').addEventListener('click', () => this.fecharModal());
        document.getElementById('modal-confirmar-btn').addEventListener('click', () => this.confirmarSelecao());
    }

    carregarVantagens() {
        const lista = document.getElementById('lista-vantagens');
        if (!lista) {
            console.error('Lista de vantagens não encontrada!');
            return;
        }
        
        lista.innerHTML = '';

        if (!window.vantagensData || !window.vantagensData.vantagens) {
            lista.innerHTML = '<div class="lista-vazia">Erro: Dados não carregados</div>';
            return;
        }

        vantagensData.vantagens.forEach(vantagem => {
            const item = this.criarItemLista(vantagem, 'vantagem');
            lista.appendChild(item);
        });
    }

    carregarDesvantagens() {
        const lista = document.getElementById('lista-desvantagens');
        if (!lista) {
            console.error('Lista de desvantagens não encontrada!');
            return;
        }
        
        lista.innerHTML = '';

        if (!window.vantagensData || !window.vantagensData.desvantagens) {
            lista.innerHTML = '<div class="lista-vazia">Erro: Dados não carregados</div>';
            return;
        }

        vantagensData.desvantagens.forEach(desvantagem => {
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

        div.addEventListener('click', () => {
            this.selecionarItem(item, tipo);
        });

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
        console.log('Item selecionado:', item.nome, 'Tipo:', tipo);
        
        this.itemSelecionado = item;
        this.tipoSelecionado = tipo;
        
        this.abrirModal();
    }

    abrirModal() {
        if (!this.itemSelecionado) {
            console.error('Nenhum item selecionado!');
            return;
        }
        
        const modal = document.getElementById('modal-vantagem');
        const titulo = document.getElementById('modal-titulo');
        const corpo = document.getElementById('modal-corpo');
        const btnConfirmar = document.getElementById('btn-confirmar-modal') || 
                           document.getElementById('modal-confirmar-btn');
        
        if (!modal) {
            console.error('Modal não encontrado!');
            this.criarModalEmergencial();
            setTimeout(() => this.abrirModal(), 100);
            return;
        }
        
        if (!titulo || !corpo) {
            console.error('Elementos do modal não encontrados!');
            return;
        }
        
        // Configura título
        titulo.textContent = this.itemSelecionado.nome;
        
        // Configura conteúdo baseado no tipo
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
        
        // Configura botão confirmar
        if (btnConfirmar) {
            btnConfirmar.disabled = precisaSelecao;
            btnConfirmar.textContent = this.tipoSelecionado === 'vantagem' ? 'Adquirir' : 'Adquirir Desvantagem';
            
            // Remove event listeners antigos e adiciona novo
            const novaBtn = btnConfirmar.cloneNode(true);
            btnConfirmar.parentNode.replaceChild(novaBtn, btnConfirmar);
            novaBtn.addEventListener('click', () => this.confirmarSelecao());
        }
        
        // Configura eventos específicos
        setTimeout(() => {
            if (this.itemSelecionado.tipo === 'multipla') {
                this.configurarEventosMultipla();
            } else if (this.itemSelecionado.tipo === 'variavel') {
                this.configurarCalculadoraVariavel();
            }
        }, 50);
        
        // Mostra o modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        console.log('✅ Modal aberto com sucesso!');
    }

    configurarEventosMultipla() {
        const radios = document.querySelectorAll('input[name="variacao"]');
        const btnConfirmar = document.getElementById('btn-confirmar-modal') || 
                           document.getElementById('modal-confirmar-btn');
        
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
            let ampliacoes = [];
            
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    const mult = parseFloat(checkbox.dataset.multiplicador) || 1.0;
                    multiplicador *= mult;
                    ampliacoes.push(checkbox.dataset.nome);
                }
            });
            
            const custoFinal = Math.round(custoBase * multiplicador);
            custoTotal.textContent = `${custoFinal} pts`;
            
            // Armazena dados para uso posterior
            select.dataset.custoFinal = custoFinal;
            select.dataset.ampliacoes = JSON.stringify(ampliacoes);
            select.dataset.nivel = nivel;
        };
        
        calcularCusto(); // Cálculo inicial
        
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

        html += `
                </select>
        `;

        if(item.ampliacoes && item.ampliacoes.length > 0) {
            html += `
                <div class="ampliacoes-section" style="margin-top: 20px;">
                    <h4 style="color: #ffd700; margin-bottom: 10px;">Ampliações Opcionais:</h4>
            `;
            
            item.ampliacoes.forEach((ampliacao, index) => {
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
        let detalhes = '';
        
        switch(this.itemSelecionado.tipo) {
            case 'simples':
                itemAdquirido = {
                    id: this.itemSelecionado.id + '-' + Date.now(),
                    baseId: this.itemSelecionado.id,
                    nome: this.itemSelecionado.nome,
                    custo: Math.abs(this.itemSelecionado.custo) || 0,
                    descricao: this.itemSelecionado.descricao,
                    tipo: 'simples'
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
                    baseId: this.itemSelecionado.id,
                    nome: variacao.nome,
                    custo: Math.abs(variacao.custo) || 0,
                    descricao: variacao.descricao,
                    tipo: 'multipla',
                    variacao: variacaoId
                };
                custoFinal = Math.abs(variacao.custo) || 0;
                detalhes = `Variação: ${variacao.nome}`;
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
                
                let ampliacoes = [];
                try {
                    ampliacoes = JSON.parse(select.dataset.ampliacoes || '[]');
                } catch (e) {
                    ampliacoes = [];
                }
                
                itemAdquirido = {
                    id: this.itemSelecionado.id + '-' + Date.now(),
                    baseId: this.itemSelecionado.id,
                    nome: this.itemSelecionado.nome,
                    custo: custoFinal,
                    descricao: this.itemSelecionado.descricao,
                    tipo: 'variavel',
                    nivel: nivel,
                    ampliacoes: ampliacoes
                };
                detalhes = `Nível: ${nivel}`;
                if (ampliacoes.length > 0) {
                    detalhes += ` | Ampliações: ${ampliacoes.join(', ')}`;
                }
                break;
        }
        
        if (!itemAdquirido) {
            alert('Erro ao criar item!');
            return;
        }
        
        // Adiciona à lista correta
        if (this.tipoSelecionado === 'vantagem') {
            this.vantagensAdquiridas.push(itemAdquirido);
        } else {
            // Para desvantagens, o custo é negativo
            itemAdquirido.custo = -Math.abs(itemAdquirido.custo);
            this.desvantagensAdquiridas.push(itemAdquirido);
        }
        
        // Atualiza a interface
        this.atualizarListasAdquiridas();
        this.atualizarTotais();
        this.fecharModal();
        
        // Mensagem de sucesso
        const tipoTexto = this.tipoSelecionado === 'vantagem' ? 'Vantagem' : 'Desvantagem';
        const sinal = this.tipoSelecionado === 'vantagem' ? '+' : '-';
        
        alert(`✅ ${tipoTexto} "${itemAdquirido.nome}" adquirida com sucesso!\nCusto: ${sinal}${Math.abs(custoFinal)} pontos\n${detalhes}`);
    }

    atualizarListasAdquiridas() {
        // Atualiza vantagens adquiridas
        this.atualizarLista('vantagens-adquiridas', this.vantagensAdquiridas, '#2ecc71', 'vantagem');
        
        // Atualiza desvantagens adquiridas
        this.atualizarLista('desvantagens-adquiridas', this.desvantagensAdquiridas, '#e74c3c', 'desvantagem');
    }

    atualizarLista(elementId, itens, cor, tipo) {
        const container = document.getElementById(elementId);
        if (!container) return;

        if (itens.length === 0) {
            container.innerHTML = '<div class="lista-vazia">Nenhum item adquirido</div>';
            return;
        }

        container.innerHTML = itens.map((item, index) => {
            const custo = Math.abs(item.custo);
            const sinal = item.custo >= 0 ? '+' : '-';
            
            let detalhes = '';
            if (item.nivel) detalhes += `<div style="font-size: 0.85em; color: #888;">Nível ${item.nivel}</div>`;
            if (item.ampliacoes && item.ampliacoes.length > 0) {
                detalhes += `<div style="font-size: 0.8em; color: #ff8c00;">Ampliações: ${item.ampliacoes.join(', ')}</div>`;
            }
            if (item.variacao) {
                detalhes += `<div style="font-size: 0.85em; color: #aaa;">Variação específica</div>`;
            }
            
            return `
                <div class="item-adquirido" style="border-color: ${cor}; background: ${cor}20;">
                    <div class="item-header">
                        <div class="item-nome">${item.nome}</div>
                        <div class="item-custo" style="background: ${cor}">
                            ${sinal}${custo} pts
                        </div>
                    </div>
                    <div class="item-descricao">${item.descricao}</div>
                    ${detalhes}
                    <button onclick="window.vantagensSystem.removerItem(${index}, '${tipo}')" 
                            class="btn-remover" style="background: ${cor}">
                        ×
                    </button>
                </div>
            `;
        }).join('');
    }

    removerItem(index, tipo) {
        if (!confirm(`Tem certeza que deseja remover este item?`)) {
            return;
        }
        
        if (tipo === 'vantagem') {
            this.vantagensAdquiridas.splice(index, 1);
        } else {
            this.desvantagensAdquiridas.splice(index, 1);
        }
        
        this.atualizarListasAdquiridas();
        this.atualizarTotais();
        
        alert('Item removido com sucesso!');
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

        container.innerHTML = this.peculiaridades.map((pec, index) => `
            <div class="peculiaridade-item">
                <div class="peculiaridade-texto">${pec.texto}</div>
                <button onclick="window.vantagensSystem.removerPeculiaridade(${index})" 
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
        
        alert('Peculiaridade removida!');
    }

    atualizarTotais() {
        // Calcula totais
        const totalVantagens = this.vantagensAdquiridas.reduce((sum, item) => {
            const custo = Math.abs(item.custo) || 0;
            return sum + (isNaN(custo) ? 0 : custo);
        }, 0);
        
        const totalDesvantagens = this.desvantagensAdquiridas.reduce((sum, item) => {
            const custo = Math.abs(item.custo) || 0;
            return sum + (isNaN(custo) ? 0 : custo);
        }, 0);
        
        const totalPeculiaridades = this.peculiaridades.length * 1;

        // Atualiza os totais na interface
        this.atualizarElemento('total-vantagens', `+${totalVantagens}`);
        this.atualizarElemento('total-desvantagens', `-${totalDesvantagens}`);
        this.atualizarElemento('total-peculiaridades', `-${totalPeculiaridades}`);
        
        const saldoTotal = totalVantagens - totalDesvantagens - totalPeculiaridades;
        this.atualizarElemento('saldo-total', saldoTotal);
        
        this.atualizarElemento('total-vantagens-adquiridas', `${totalVantagens} pts`);
        this.atualizarElemento('total-desvantagens-adquiridas', `${totalDesvantagens} pts`);
    }

    atualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
            
            // Adiciona animação
            elemento.style.transform = 'scale(1.1)';
            setTimeout(() => {
                elemento.style.transform = 'scale(1)';
            }, 300);
        }
    }

    setupEventListeners() {
        // Filtros
        this.configurarFiltro('vantagens');
        this.configurarFiltro('desvantagens');
        
        // Fechar modal ao clicar fora
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('modal-vantagem');
            if (modal && modal.style.display === 'block' && e.target === modal) {
                this.fecharModal();
            }
        });
        
        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.fecharModal();
            }
        });
        
        // Evento para quando a aba é aberta
        document.addEventListener('abaVantagensAberta', () => {
            console.log('Aba de vantagens aberta, atualizando dados...');
            this.atualizarTotais();
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

        const itens = tipo === 'vantagens' ? vantagensData.vantagens : vantagensData.desvantagens;

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
            document.body.style.overflow = 'auto';
            this.itemSelecionado = null;
            this.tipoSelecionado = null;
            
            // Limpa o conteúdo do modal
            const corpo = document.getElementById('modal-corpo');
            if (corpo) corpo.innerHTML = '';
        }
    }

    // Métodos públicos para uso externo
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

    resetar() {
        this.vantagensAdquiridas = [];
        this.desvantagensAdquiridas = [];
        this.peculiaridades = [];
        
        this.atualizarListasAdquiridas();
        this.atualizarTotais();
        
        alert('Sistema de vantagens resetado!');
    }
}

// INICIALIZAÇÃO GLOBAL
let vantagensSystem;

// Inicialização automática quando a aba é ativada
document.addEventListener('DOMContentLoaded', function() {
    // Monitora cliques nas abas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            if (tabId === 'vantagens') {
                // Inicializa ou atualiza o sistema quando a aba é aberta
                if (!window.vantagensSystem) {
                    vantagensSystem = new GerenciadorVantagens();
                    window.vantagensSystem = vantagensSystem;
                } else {
                    // Dispara evento para atualizar
                    const evento = new CustomEvent('abaVantagensAberta');
                    document.dispatchEvent(evento);
                }
            }
        });
    });
});

// Exporta para uso global
window.GerenciadorVantagens = GerenciadorVantagens;
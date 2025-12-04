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
            this.init();
        } else {
            document.addEventListener('DOMContentLoaded', () => this.init());
        }
    }

    init() {
        console.log('Iniciando sistema de vantagens...');
        
        // Verificar se o modal existe
        if (!document.getElementById('modal-vantagem')) {
            console.error('ERRO: Modal não encontrado no DOM!');
            this.criarModalEmergencial();
        }
        
        this.carregarVantagens();
        this.carregarDesvantagens();
        this.setupPeculiaridades();
        this.setupEventListeners();
        this.atualizarTotais();
        
        console.log('Sistema de vantagens inicializado!');
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
        
        // Adiciona o modal ao final do body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Configura eventos do modal
        setTimeout(() => {
            document.getElementById('modal-close-btn').addEventListener('click', () => this.fecharModal());
            document.getElementById('modal-cancelar-btn').addEventListener('click', () => this.fecharModal());
            document.getElementById('modal-confirmar-btn').addEventListener('click', () => this.confirmarSelecao());
        }, 100);
        
        console.log('Modal emergencial criado!');
    }

    carregarVantagens() {
        const lista = document.getElementById('lista-vantagens');
        if (!lista) {
            console.error('Lista de vantagens não encontrada!');
            return;
        }
        
        lista.innerHTML = '';

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
            border: 1px solid #444;
            border-radius: 6px;
            background: rgba(40, 40, 50, 0.5);
            transition: all 0.2s;
        `;
        
        div.onmouseover = () => {
            div.style.backgroundColor = 'rgba(255, 140, 0, 0.1)';
            div.style.borderColor = '#ff8c00';
        };
        
        div.onmouseout = () => {
            div.style.backgroundColor = 'rgba(40, 40, 50, 0.5)';
            div.style.borderColor = '#444';
        };
        
        let custoDisplay = Math.abs(item.custo) || 'var';
        if (item.tipo === 'variavel') {
            custoDisplay = `${Math.abs(item.custoPorNivel || 2)} pts/nível`;
        }
        
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="font-weight: bold; font-size: 1.1em; color: #ffd700;">${item.nome}</div>
                <div style="background: #2ecc71; color: white; padding: 4px 10px; border-radius: 12px; font-weight: bold;">${custoDisplay}</div>
            </div>
            <div style="font-size: 0.9em; color: #ccc; margin-bottom: 6px;">${item.descricao}</div>
            <div style="font-size: 0.8em; color: #888; font-style: italic;">${this.getCategoriaNome(item.categoria)}</div>
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
        const btnConfirmar = document.getElementById('modal-confirmar-btn');
        
        if (!modal || !titulo || !corpo || !btnConfirmar) {
            console.error('Elementos do modal não encontrados!');
            alert('Erro: Modal não carregado corretamente. Recarregue a página.');
            return;
        }
        
        // Configura título
        titulo.textContent = this.itemSelecionado.nome;
        
        // Configura conteúdo baseado no tipo
        switch(this.itemSelecionado.tipo) {
            case 'simples':
                corpo.innerHTML = this.criarModalSimples(this.itemSelecionado);
                btnConfirmar.disabled = false;
                break;
                
            case 'multipla':
                corpo.innerHTML = this.criarModalMultipla(this.itemSelecionado);
                btnConfirmar.disabled = true;
                
                // Configura eventos dos radios
                setTimeout(() => {
                    document.querySelectorAll('input[name="variacao"]').forEach(radio => {
                        radio.addEventListener('change', () => {
                            btnConfirmar.disabled = false;
                        });
                    });
                }, 50);
                break;
                
            case 'variavel':
                corpo.innerHTML = this.criarModalVariavel(this.itemSelecionado);
                btnConfirmar.disabled = false;
                
                // Configura eventos do nível
                setTimeout(() => {
                    this.configurarCalculadoraVariavel();
                }, 50);
                break;
        }
        
        // Mostra o modal
        modal.style.display = 'block';
        
        console.log('Modal aberto com sucesso!');
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
            select.dataset.custoFinal = custoFinal;
            select.dataset.ampliacoes = JSON.stringify(ampliacoes);
        };
        
        calcularCusto(); // Cálculo inicial
        
        select.addEventListener('change', calcularCusto);
        checkboxes.forEach(cb => cb.addEventListener('change', calcularCusto));
    }

    criarModalSimples(item) {
        return `
            <div style="padding: 15px; background: rgba(0,0,0,0.2); border-radius: 5px; margin-bottom: 15px;">
                <p style="margin: 0 0 15px 0;">${item.descricao}</p>
                <div style="background: #2ecc71; color: white; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold; font-size: 1.2em;">
                    Custo: ${Math.abs(item.custo)} pontos
                </div>
            </div>
        `;
    }

    criarModalMultipla(item) {
        let html = `
            <div style="padding: 15px; background: rgba(0,0,0,0.2); border-radius: 5px; margin-bottom: 15px;">
                <p style="margin: 0 0 15px 0;">${item.descricao}</p>
                <div style="margin-top: 20px;">
                    <h4 style="color: #ffd700; margin-bottom: 15px;">Selecione uma variação:</h4>
        `;

        item.variacoes.forEach((variacao, index) => {
            html += `
                <div style="margin: 10px 0; padding: 15px; border: 2px solid #555; border-radius: 5px; background: rgba(50,50,60,0.5);">
                    <div style="display: flex; align-items: flex-start; gap: 10px;">
                        <input type="radio" id="variacao-${variacao.id}" name="variacao" value="${variacao.id}" 
                               style="margin-top: 4px;">
                        <div style="flex: 1;">
                            <label for="variacao-${variacao.id}" style="cursor: pointer; display: block;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                                    <strong style="color: #fff; font-size: 1.1em;">${variacao.nome}</strong>
                                    <span style="background: #2ecc71; color: white; padding: 4px 12px; border-radius: 12px; font-weight: bold;">
                                        ${Math.abs(variacao.custo)} pts
                                    </span>
                                </div>
                                <p style="margin: 0; color: #ccc; font-size: 0.9em;">${variacao.descricao}</p>
                            </label>
                        </div>
                    </div>
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
            <div style="padding: 15px; background: rgba(0,0,0,0.2); border-radius: 5px; margin-bottom: 15px;">
                <p style="margin: 0 0 15px 0;">${item.descricao}</p>
                ${item.limitacoes ? `<p style="margin: 0 0 15px 0; color: #ff8c00; font-size: 0.9em;"><strong>⚠️ Limitações:</strong> ${item.limitacoes}</p>` : ''}
                
                <div style="margin: 20px 0;">
                    <label style="display: block; margin-bottom: 8px; color: #ffd700; font-weight: bold;">Selecione o nível:</label>
                    <select id="nivel-vantagem" style="width: 100%; padding: 10px; background: #333; color: white; border: 1px solid #555; border-radius: 5px; font-size: 1em;">
        `;

        for(let i = nivelBase; i <= niveisMax; i++) {
            html += `<option value="${i}">Nível ${i}</option>`;
        }

        html += `
                    </select>
                    
                    <div style="margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 5px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: bold; color: #fff;">Custo Total:</span>
                            <span id="custo-total" style="font-size: 1.5em; font-weight: bold; color: #2ecc71;">${nivelBase * custoPorNivel} pts</span>
                        </div>
                    </div>
                </div>
        `;

        if(item.ampliacoes && item.ampliacoes.length > 0) {
            html += `
                <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #555;">
                    <h4 style="color: #ffd700; margin-bottom: 15px;">Ampliações Opcionais:</h4>
            `;
            
            item.ampliacoes.forEach((ampliacao, index) => {
                const custoMultiplicador = parseFloat(ampliacao.custoExtra) || 2.5;
                const percentualAumento = (custoMultiplicador - 1) * 100;
                
                html += `
                    <div style="margin: 12px 0; padding: 12px; background: rgba(50,50,60,0.5); border: 1px solid #555; border-radius: 5px;">
                        <div style="display: flex; align-items: flex-start; gap: 10px;">
                            <input type="checkbox" id="ampliacao-${ampliacao.id}" 
                                   data-multiplicador="${custoMultiplicador}" 
                                   data-nome="${ampliacao.nome}"
                                   class="ampliacao-checkbox"
                                   style="margin-top: 4px;">
                            <div style="flex: 1;">
                                <label for="ampliacao-${ampliacao.id}" style="cursor: pointer; display: block;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                                        <strong style="color: #fff;">${ampliacao.nome}</strong>
                                        <span style="background: #ff8c00; color: white; padding: 3px 10px; border-radius: 12px; font-size: 0.9em;">
                                            +${percentualAumento}% de custo
                                        </span>
                                    </div>
                                    <p style="margin: 0; color: #ccc; font-size: 0.9em;">${ampliacao.descricao}</p>
                                </label>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
        }

        html += `</div>`;
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
                break;
                
            case 'variavel':
                const select = document.getElementById('nivel-vantagem');
                if (!select) {
                    alert('Erro ao obter nível selecionado!');
                    return;
                }
                
                const nivel = parseInt(select.value) || 1;
                custoFinal = parseInt(select.dataset.custoFinal) || (nivel * Math.abs(this.itemSelecionado.custoPorNivel || 2));
                
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
            this.desvantagensAdquiridas.push(itemAdquirido);
        }
        
        // Atualiza a interface
        this.atualizarListasAdquiridas();
        this.atualizarTotais();
        this.fecharModal();
        
        // Mensagem de sucesso
        const tipoTexto = this.tipoSelecionado === 'vantagem' ? 'Vantagem' : 'Desvantagem';
        alert(`✅ ${tipoTexto} "${itemAdquirido.nome}" adquirida com sucesso!\nCusto: ${Math.abs(custoFinal)} pontos`);
    }

    atualizarListasAdquiridas() {
        // Atualiza vantagens adquiridas
        const vantagensContainer = document.getElementById('vantagens-adquiridas');
        if (vantagensContainer) {
            if (this.vantagensAdquiridas.length === 0) {
                vantagensContainer.innerHTML = '<div class="lista-vazia">Nenhuma vantagem adquirida</div>';
            } else {
                vantagensContainer.innerHTML = this.vantagensAdquiridas.map(item => `
                    <div style="position: relative; padding: 12px; margin: 8px 0; border: 2px solid #2ecc71; border-radius: 6px; background: rgba(46, 204, 113, 0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <strong style="color: #fff;">${item.nome}</strong>
                            <span style="background: #2ecc71; color: white; padding: 4px 10px; border-radius: 12px; font-weight: bold;">+${Math.abs(item.custo)} pts</span>
                        </div>
                        <div style="font-size: 0.9em; color: #ccc; margin-bottom: 5px;">${item.descricao}</div>
                        ${item.nivel ? `<div style="font-size: 0.8em; color: #888;">Nível ${item.nivel}</div>` : ''}
                        ${item.ampliacoes && item.ampliacoes.length > 0 ? 
                          `<div style="font-size: 0.8em; color: #ff8c00;">Ampliações: ${item.ampliacoes.join(', ')}</div>` : ''}
                        <button onclick="vantagensSystem.removerItem('${item.id}', 'vantagem')" 
                                style="position: absolute; top: 8px; right: 8px; background: #e74c3c; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-weight: bold;">×</button>
                    </div>
                `).join('');
            }
        }
        
        // Atualiza desvantagens adquiridas
        const desvantagensContainer = document.getElementById('desvantagens-adquiridas');
        if (desvantagensContainer) {
            if (this.desvantagensAdquiridas.length === 0) {
                desvantagensContainer.innerHTML = '<div class="lista-vazia">Nenhuma desvantagem adquirida</div>';
            } else {
                desvantagensContainer.innerHTML = this.desvantagensAdquiridas.map(item => `
                    <div style="position: relative; padding: 12px; margin: 8px 0; border: 2px solid #e74c3c; border-radius: 6px; background: rgba(231, 76, 60, 0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <strong style="color: #fff;">${item.nome}</strong>
                            <span style="background: #e74c3c; color: white; padding: 4px 10px; border-radius: 12px; font-weight: bold;">-${Math.abs(item.custo)} pts</span>
                        </div>
                        <div style="font-size: 0.9em; color: #ccc; margin-bottom: 5px;">${item.descricao}</div>
                        <button onclick="vantagensSystem.removerItem('${item.id}', 'desvantagem')" 
                                style="position: absolute; top: 8px; right: 8px; background: #e74c3c; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-weight: bold;">×</button>
                    </div>
                `).join('');
            }
        }
    }

    removerItem(itemId, tipo) {
        if (!confirm(`Tem certeza que deseja remover este item?`)) {
            return;
        }
        
        if (tipo === 'vantagem') {
            this.vantagensAdquiridas = this.vantagensAdquiridas.filter(item => item.id !== itemId);
        } else {
            this.desvantagensAdquiridas = this.desvantagensAdquiridas.filter(item => item.id !== itemId);
        }
        
        this.atualizarListasAdquiridas();
        this.atualizarTotais();
        
        alert('Item removido com sucesso!');
    }

    // ... (mantenha as funções setupPeculiaridades, adicionarPeculiaridade, renderizarPeculiaridades, removerPeculiaridade iguais)

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
            <div style="position: relative; padding: 12px; margin: 8px 0; border: 2px solid #f39c12; border-radius: 6px; background: rgba(243, 156, 18, 0.1);">
                <p style="margin: 0; color: #fff;">${pec.texto}</p>
                <button onclick="vantagensSystem.removerPeculiaridade('${pec.id}')" 
                        style="position: absolute; top: 8px; right: 8px; background: #f39c12; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-weight: bold;">×</button>
            </div>
        `).join('');
    }

    removerPeculiaridade(id) {
        this.peculiaridades = this.peculiaridades.filter(pec => pec.id !== id);
        this.renderizarPeculiaridades();
        this.atualizarTotais();
        alert('Peculiaridade removida!');
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

        // Atualiza os totais na interface
        document.getElementById('total-vantagens').textContent = `+${totalVantagens}`;
        document.getElementById('total-desvantagens').textContent = `-${totalDesvantagens}`;
        document.getElementById('total-peculiaridades').textContent = `-${totalPeculiaridades}`;
        document.getElementById('saldo-total').textContent = totalVantagens - totalDesvantagens - totalPeculiaridades;
        
        document.getElementById('total-vantagens-adquiridas').textContent = `${totalVantagens} pts`;
        document.getElementById('total-desvantagens-adquiridas').textContent = `${totalDesvantagens} pts`;
    }

    setupEventListeners() {
        // Filtros
        document.getElementById('busca-vantagens')?.addEventListener('input', () => this.filtrarLista('vantagens'));
        document.getElementById('categoria-vantagens')?.addEventListener('change', () => this.filtrarLista('vantagens'));
        document.getElementById('busca-desvantagens')?.addEventListener('input', () => this.filtrarLista('desvantagens'));
        document.getElementById('categoria-desvantagens')?.addEventListener('change', () => this.filtrarLista('desvantagens'));
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
        }
    }
}

// INICIALIZAÇÃO GARANTIDA
let vantagensSystem;

// Espera TUDO carregar
window.addEventListener('load', function() {
    console.log('Página completamente carregada, inicializando sistema...');
    vantagensSystem = new GerenciadorVantagens();
    window.vantagensSystem = vantagensSystem;
});
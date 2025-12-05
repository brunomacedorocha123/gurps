// ============================================
// SISTEMA DE VANTAGENS E DESVANTAGENS - VERSÃO CORRIGIDA
// ============================================

class GerenciadorVantagens {
    constructor() {
        console.log('🛠️ Gerenciador de Vantagens criado');
        
        // Dados
        this.vantagensAdquiridas = [];
        this.desvantagensAdquiridas = [];
        this.peculiaridades = [];
        this.itemSelecionado = null;
        this.tipoSelecionado = null;
        
        // Inicializar
        this.inicializar();
    }

    inicializar() {
        console.log('🚀 Iniciando sistema...');
        
        // Esperar um pouco para garantir que o DOM está pronto
        setTimeout(() => {
            this.carregarVantagens();
            this.carregarDesvantagens();
            this.configurarPeculiaridades();
            this.configurarEventos();
            this.atualizarTotais();
            
            console.log('✅ Sistema pronto!');
        }, 100);
    }

    // ========== CARREGAMENTO DOS ITENS ==========
    carregarVantagens() {
        const container = document.getElementById('lista-vantagens');
        if (!container) {
            console.error('❌ Container de vantagens não encontrado');
            return;
        }
        
        console.log('📋 Carregando vantagens...');
        
        // Verificar se temos dados
        if (!window.vantagensData || !window.vantagensData.vantagens) {
            container.innerHTML = '<div class="lista-vazia">Carregando catálogo...</div>';
            setTimeout(() => this.carregarVantagens(), 200);
            return;
        }
        
        const vantagens = window.vantagensData.vantagens;
        
        if (vantagens.length === 0) {
            container.innerHTML = '<div class="lista-vazia">Nenhuma vantagem disponível</div>';
            return;
        }
        
        // Limpar container
        container.innerHTML = '';
        
        // Adicionar cada vantagem
        vantagens.forEach(vantagem => {
            const item = this.criarItem(vantagem, 'vantagem');
            container.appendChild(item);
        });
        
        console.log(`✅ ${vantagens.length} vantagens carregadas`);
    }

    carregarDesvantagens() {
        const container = document.getElementById('lista-desvantagens');
        if (!container) {
            console.error('❌ Container de desvantagens não encontrado');
            return;
        }
        
        console.log('📋 Carregando desvantagens...');
        
        if (!window.vantagensData || !window.vantagensData.desvantagens) {
            container.innerHTML = '<div class="lista-vazia">Carregando catálogo...</div>';
            setTimeout(() => this.carregarDesvantagens(), 200);
            return;
        }
        
        const desvantagens = window.vantagensData.desvantagens;
        
        if (desvantagens.length === 0) {
            container.innerHTML = '<div class="lista-vazia">Nenhuma desvantagem disponível</div>';
            return;
        }
        
        container.innerHTML = '';
        
        desvantagens.forEach(desvantagem => {
            const item = this.criarItem(desvantagem, 'desvantagem');
            container.appendChild(item);
        });
        
        console.log(`✅ ${desvantagens.length} desvantagens carregadas`);
    }

    criarItem(item, tipo) {
        const div = document.createElement('div');
        div.className = `item-lista ${tipo}-item`;
        
        // Calcular custo para exibição
        let custoDisplay = '';
        if (item.tipo === 'variavel') {
            const custoPorNivel = Math.abs(item.custoPorNivel) || 2;
            custoDisplay = `${custoPorNivel} pts/nível`;
        } else if (item.custo !== undefined) {
            custoDisplay = `${Math.abs(item.custo)} pts`;
        } else {
            custoDisplay = 'var';
        }
        
        // Determinar cor baseada no tipo
        const cor = tipo === 'vantagem' ? '#2ecc71' : '#e74c3c';
        
        div.innerHTML = `
            <div class="item-header">
                <div class="item-nome">${item.nome}</div>
                <div class="item-custo" style="background: ${cor}">${custoDisplay}</div>
            </div>
            <div class="item-descricao">${item.descricao}</div>
            <div class="item-categoria">${this.getNomeCategoria(item.categoria)}</div>
        `;
        
        // Evento de clique
        div.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selecionarItem(item, tipo);
        });
        
        return div;
    }

    getNomeCategoria(categoria) {
        const categorias = {
            'mental': '🧠 Mental/Sobrenatural',
            'fisica': '💪 Física',
            'supers': '🦸‍♂️ Supers',
            'social': '🤝 Social'
        };
        return categorias[categoria] || categoria;
    }

    // ========== SELEÇÃO E MODAL ==========
    selecionarItem(item, tipo) {
        console.log(`🎯 Selecionado: ${item.nome} (${tipo})`);
        
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
            console.error('❌ Elementos do modal não encontrados');
            return;
        }
        
        // Configurar título
        titulo.textContent = this.itemSelecionado.nome;
        
        // Gerar conteúdo baseado no tipo
        let conteudoHTML = '';
        
        switch (this.itemSelecionado.tipo) {
            case 'multipla':
                conteudoHTML = this.criarConteudoMultipla();
                break;
            case 'variavel':
                conteudoHTML = this.criarConteudoVariavel();
                break;
            default:
                conteudoHTML = this.criarConteudoSimples();
                break;
        }
        
        corpo.innerHTML = conteudoHTML;
        
        // Configurar botão
        btnConfirmar.textContent = this.tipoSelecionado === 'vantagem' ? 'Adquirir Vantagem' : 'Adquirir Desvantagem';
        btnConfirmar.onclick = () => this.confirmarSelecao();
        
        // Configurar botão cancelar
        const btnCancelar = document.getElementById('btn-cancelar-modal');
        if (btnCancelar) {
            btnCancelar.onclick = () => this.fecharModal();
        }
        
        // Configurar botão de fechar
        const btnFechar = document.querySelector('.modal-close');
        if (btnFechar) {
            btnFechar.onclick = () => this.fecharModal();
        }
        
        // Mostrar modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Configurar eventos específicos
        setTimeout(() => {
            if (this.itemSelecionado.tipo === 'multipla') {
                this.configurarSelecaoMultipla();
            } else if (this.itemSelecionado.tipo === 'variavel') {
                this.configurarCalculadoraVariavel();
            }
        }, 10);
    }

    criarConteudoSimples() {
        const custo = Math.abs(this.itemSelecionado.custo) || 0;
        const cor = this.tipoSelecionado === 'vantagem' ? '#2ecc71' : '#e74c3c';
        
        return `
            <div class="modal-descricao">
                <p>${this.itemSelecionado.descricao}</p>
            </div>
            <div class="custo-total-display" style="border-color: ${cor}">
                <div style="font-size: 0.9em; color: #aaa; margin-bottom: 5px;">Custo</div>
                <div style="font-size: 2em; font-weight: bold; color: ${cor}">${custo} pontos</div>
            </div>
        `;
    }

    criarConteudoMultipla() {
        const cor = this.tipoSelecionado === 'vantagem' ? '#2ecc71' : '#e74c3c';
        let html = `
            <div class="modal-descricao">
                <p>${this.itemSelecionado.descricao}</p>
            </div>
            <div style="margin: 20px 0;">
                <h4 style="color: #ffd700; margin-bottom: 15px;">Selecione uma opção:</h4>
        `;
        
        this.itemSelecionado.variacoes.forEach((variacao, index) => {
            const custo = Math.abs(variacao.custo) || 0;
            html += `
                <div class="modal-variacao" data-id="${variacao.id}">
                    <div style="display: flex; align-items: flex-start; gap: 10px; padding: 10px;">
                        <input type="radio" id="variacao-${variacao.id}" 
                               name="variacao" value="${variacao.id}" 
                               ${index === 0 ? 'checked' : ''}
                               style="margin-top: 3px;">
                        <div style="flex: 1;">
                            <label for="variacao-${variacao.id}" style="cursor: pointer;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                                    <strong style="color: #fff;">${variacao.nome}</strong>
                                    <span style="background: ${cor}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.9em;">
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
        
        html += '</div>';
        return html;
    }

    configurarSelecaoMultipla() {
        const variacoes = document.querySelectorAll('.modal-variacao');
        variacoes.forEach(variacao => {
            variacao.addEventListener('click', (e) => {
                // Encontrar o radio dentro desta variação
                const radio = variacao.querySelector('input[type="radio"]');
                if (radio && !radio.checked) {
                    radio.checked = true;
                    
                    // Remover seleção de outras
                    variacoes.forEach(v => v.classList.remove('selecionada'));
                    // Adicionar seleção a esta
                    variacao.classList.add('selecionada');
                }
            });
        });
        
        // Selecionar a primeira por padrão
        if (variacoes[0]) {
            variacoes[0].classList.add('selecionada');
        }
    }

    criarConteudoVariavel() {
        const nivelBase = this.itemSelecionado.nivelBase || 1;
        const niveisMax = this.itemSelecionado.niveis || 10;
        const custoPorNivel = Math.abs(this.itemSelecionado.custoPorNivel) || 2;
        const cor = this.tipoSelecionado === 'vantagem' ? '#2ecc71' : '#e74c3c';
        
        let html = `
            <div class="modal-descricao">
                <p>${this.itemSelecionado.descricao}</p>
                ${this.itemSelecionado.limitacoes ? 
                    `<div style="margin-top: 10px; padding: 10px; background: rgba(255,140,0,0.1); border-left: 3px solid #ff8c00;">
                        <strong>⚠️ Limitações:</strong> ${this.itemSelecionado.limitacoes}
                    </div>` : ''
                }
            </div>
            <div class="nivel-container">
                <label style="display: block; margin-bottom: 10px; color: #ffd700; font-weight: bold;">
                    Selecione o nível:
                </label>
                <select id="seletor-nivel" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.3); color: #ffd700; border: 1px solid rgba(255,140,0,0.5); border-radius: 6px;">
        `;
        
        for (let i = nivelBase; i <= niveisMax; i++) {
            html += `<option value="${i}">Nível ${i}</option>`;
        }
        
        html += `</select>`;
        
        // Ampliações
        if (this.itemSelecionado.ampliacoes && this.itemSelecionado.ampliacoes.length > 0) {
            html += `
                <div style="margin-top: 20px;">
                    <h4 style="color: #ffd700; margin-bottom: 10px;">Ampliações Opcionais:</h4>
            `;
            
            this.itemSelecionado.ampliacoes.forEach((ampliacao, index) => {
                const multiplicador = parseFloat(ampliacao.custoExtra) || 2.5;
                const percentual = Math.round((multiplicador - 1) * 100);
                
                html += `
                    <div class="ampliacao-option">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 8px; border-radius: 4px; background: rgba(255,255,255,0.05);">
                            <input type="checkbox" id="ampliacao-${index}" 
                                   data-multiplicador="${multiplicador}"
                                   data-nome="${ampliacao.nome}">
                            <div style="flex: 1;">
                                <div style="display: flex; justify-content: space-between;">
                                    <strong>${ampliacao.nome}</strong>
                                    <span style="color: #ff8c00; font-weight: bold;">+${percentual}%</span>
                                </div>
                                <div style="font-size: 0.9em; color: #aaa; margin-top: 2px;">
                                    ${ampliacao.descricao}
                                </div>
                            </div>
                        </label>
                    </div>
                `;
            });
            
            html += `</div>`;
        }
        
        html += `
            <div class="custo-total-display" style="margin-top: 20px; border-color: ${cor}">
                <div style="font-size: 0.9em; color: #aaa; margin-bottom: 5px;">Custo Total</div>
                <div id="custo-total" style="font-size: 1.8em; font-weight: bold; color: ${cor}">
                    ${nivelBase * custoPorNivel} pts
                </div>
            </div>
        </div>`;
        
        return html;
    }

    configurarCalculadoraVariavel() {
        const seletor = document.getElementById('seletor-nivel');
        const checkboxes = document.querySelectorAll('.ampliacao-option input[type="checkbox"]');
        const custoTotalEl = document.getElementById('custo-total');
        
        if (!seletor || !custoTotalEl) return;
        
        const calcularTotal = () => {
            const nivel = parseInt(seletor.value) || 1;
            const custoPorNivel = Math.abs(this.itemSelecionado.custoPorNivel) || 2;
            let custoBase = nivel * custoPorNivel;
            let multiplicadorTotal = 1.0;
            const ampliacoesSelecionadas = [];
            
            checkboxes.forEach(cb => {
                if (cb.checked) {
                    const mult = parseFloat(cb.dataset.multiplicador) || 1.0;
                    multiplicadorTotal *= mult;
                    ampliacoesSelecionadas.push(cb.dataset.nome);
                }
            });
            
            const custoFinal = Math.round(custoBase * multiplicadorTotal);
            custoTotalEl.textContent = `${custoFinal} pts`;
            
            // Armazenar dados para uso posterior
            seletor.dataset.custoFinal = custoFinal;
            seletor.dataset.nivel = nivel;
            seletor.dataset.ampliacoes = JSON.stringify(ampliacoesSelecionadas);
        };
        
        seletor.addEventListener('change', calcularTotal);
        checkboxes.forEach(cb => cb.addEventListener('change', calcularTotal));
        
        // Calcular inicial
        calcularTotal();
    }

    confirmarSelecao() {
        if (!this.itemSelecionado || !this.tipoSelecionado) {
            alert('Erro: Nenhum item selecionado.');
            return;
        }
        
        let itemAdquirido = null;
        
        // Criar item baseado no tipo
        switch (this.itemSelecionado.tipo) {
            case 'simples':
                itemAdquirido = {
                    id: `${this.itemSelecionado.id}-${Date.now()}`,
                    baseId: this.itemSelecionado.id,
                    nome: this.itemSelecionado.nome,
                    custo: Math.abs(this.itemSelecionado.custo) || 0,
                    descricao: this.itemSelecionado.descricao,
                    tipo: 'simples'
                };
                break;
                
            case 'multipla':
                const radioSelecionado = document.querySelector('input[name="variacao"]:checked');
                if (!radioSelecionado) {
                    alert('Por favor, selecione uma opção.');
                    return;
                }
                
                const variacaoId = radioSelecionado.value;
                const variacao = this.itemSelecionado.variacoes.find(v => v.id === variacaoId);
                
                if (!variacao) {
                    alert('Erro: Variação não encontrada.');
                    return;
                }
                
                itemAdquirido = {
                    id: `${this.itemSelecionado.id}-${variacaoId}-${Date.now()}`,
                    baseId: this.itemSelecionado.id,
                    nome: variacao.nome,
                    custo: Math.abs(variacao.custo) || 0,
                    descricao: variacao.descricao,
                    tipo: 'multipla',
                    variacao: variacaoId
                };
                break;
                
            case 'variavel':
                const seletor = document.getElementById('seletor-nivel');
                if (!seletor) {
                    alert('Erro: Seletor de nível não encontrado.');
                    return;
                }
                
                const nivel = parseInt(seletor.dataset.nivel) || parseInt(seletor.value) || 1;
                const custoFinal = parseInt(seletor.dataset.custoFinal) || 
                                  (nivel * Math.abs(this.itemSelecionado.custoPorNivel || 2));
                const ampliacoes = JSON.parse(seletor.dataset.ampliacoes || '[]');
                
                itemAdquirido = {
                    id: `${this.itemSelecionado.id}-${Date.now()}`,
                    baseId: this.itemSelecionado.id,
                    nome: this.itemSelecionado.nome,
                    custo: custoFinal,
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
        
        // Se for desvantagem, o custo é negativo
        if (this.tipoSelecionado === 'desvantagem') {
            itemAdquirido.custo = -Math.abs(itemAdquirido.custo);
        }
        
        // Adicionar à lista correta
        if (this.tipoSelecionado === 'vantagem') {
            this.vantagensAdquiridas.push(itemAdquirido);
            console.log(`✅ Vantagem adquirida: ${itemAdquirido.nome}`);
        } else {
            this.desvantagensAdquiridas.push(itemAdquirido);
            console.log(`✅ Desvantagem adquirida: ${itemAdquirido.nome}`);
        }
        
        // Atualizar interface
        this.atualizarListasAdquiridas();
        this.atualizarTotais();
        this.fecharModal();
        
        // Feedback
        const sinal = itemAdquirido.custo >= 0 ? '+' : '-';
        const tipoNome = this.tipoSelecionado === 'vantagem' ? 'Vantagem' : 'Desvantagem';
        alert(`${tipoNome} "${itemAdquirido.nome}" adquirida!\nCusto: ${sinal}${Math.abs(itemAdquirido.custo)} pontos`);
    }

    fecharModal() {
        const modal = document.getElementById('modal-vantagem');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            this.itemSelecionado = null;
            this.tipoSelecionado = null;
        }
    }

    // ========== LISTAS ADQUIRIDAS ==========
    atualizarListasAdquiridas() {
        this.atualizarListaAdquirida('vantagens-adquiridas', this.vantagensAdquiridas, '#2ecc71');
        this.atualizarListaAdquirida('desvantagens-adquiridas', this.desvantagensAdquiridas, '#e74c3c');
    }

    atualizarListaAdquirida(containerId, itens, cor) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (itens.length === 0) {
            container.innerHTML = '<div class="lista-vazia">Nenhum item adquirido</div>';
            return;
        }
        
        container.innerHTML = itens.map((item, index) => {
            const sinal = item.custo >= 0 ? '+' : '-';
            const custoAbs = Math.abs(item.custo);
            
            let detalhes = '';
            if (item.nivel) detalhes += `<div style="font-size: 0.85em; color: #888;">Nível ${item.nivel}</div>`;
            if (item.ampliacoes && item.ampliacoes.length > 0) {
                detalhes += `<div style="font-size: 0.8em; color: #ff8c00;">Ampliações: ${item.ampliacoes.join(', ')}</div>`;
            }
            if (item.variacao) {
                detalhes += `<div style="font-size: 0.85em; color: #aaa;">Variação específica</div>`;
            }
            
            return `
                <div class="item-adquirido" style="background: ${cor}15; border-color: ${cor}50; position: relative; padding: 12px 40px 12px 12px; margin-bottom: 8px; border-radius: 6px;">
                    <div class="item-header">
                        <div class="item-nome">${item.nome}</div>
                        <div class="item-custo" style="background: ${cor}">${sinal}${custoAbs} pts</div>
                    </div>
                    <div class="item-descricao">${item.descricao}</div>
                    ${detalhes}
                    <button onclick="window.vantagensSystem.removerItem('${containerId === 'vantagens-adquiridas' ? 'vantagem' : 'desvantagem'}', ${index})" 
                            class="btn-remover" style="background: ${cor}; position: absolute; top: 12px; right: 12px;">
                        ×
                    </button>
                </div>
            `;
        }).join('');
    }

    removerItem(tipo, index) {
        if (!confirm('Tem certeza que deseja remover este item?')) return;
        
        if (tipo === 'vantagem') {
            this.vantagensAdquiridas.splice(index, 1);
        } else {
            this.desvantagensAdquiridas.splice(index, 1);
        }
        
        this.atualizarListasAdquiridas();
        this.atualizarTotais();
        console.log(`🗑️ Item removido: ${tipo} no índice ${index}`);
    }

    // ========== PECULIARIDADES ==========
    configurarPeculiaridades() {
        const input = document.getElementById('nova-peculiaridade');
        const btn = document.getElementById('btn-adicionar-peculiaridade');
        const contador = document.getElementById('contador-chars');
        
        if (!input || !btn || !contador) return;
        
        const atualizarEstado = () => {
            const texto = input.value.trim();
            const comprimento = texto.length;
            
            // Atualizar contador
            contador.textContent = comprimento;
            
            // Habilitar/desabilitar botão
            const limiteMaximo = this.peculiaridades.length >= 5;
            const textoValido = texto.length > 0 && texto.length <= 30;
            
            btn.disabled = !textoValido || limiteMaximo;
            
            // Dica visual
            if (comprimento > 30) {
                contador.style.color = '#e74c3c';
            } else if (limiteMaximo) {
                contador.style.color = '#f39c12';
            } else {
                contador.style.color = '#2ecc71';
            }
        };
        
        // Eventos
        input.addEventListener('input', atualizarEstado);
        
        btn.addEventListener('click', () => {
            const texto = input.value.trim();
            if (texto && texto.length <= 30 && this.peculiaridades.length < 5) {
                this.adicionarPeculiaridade(texto);
                input.value = '';
                atualizarEstado();
            }
        });
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !btn.disabled) {
                btn.click();
            }
        });
        
        // Carregar peculiaridades existentes
        this.atualizarPeculiaridades();
    }

    adicionarPeculiaridade(texto) {
        const peculiaridade = {
            id: `pec-${Date.now()}`,
            texto: texto.substring(0, 30)
        };
        
        this.peculiaridades.push(peculiaridade);
        this.atualizarPeculiaridades();
        this.atualizarTotais();
        
        console.log(`✅ Peculiaridade adicionada: "${texto.substring(0, 30)}"`);
    }

    removerPeculiaridade(index) {
        if (!confirm('Remover esta peculiaridade?')) return;
        
        this.peculiaridades.splice(index, 1);
        this.atualizarPeculiaridades();
        this.atualizarTotais();
    }

    atualizarPeculiaridades() {
        const container = document.getElementById('lista-peculiaridades');
        const contador = document.getElementById('contador-peculiaridades');
        
        if (!container || !contador) return;
        
        // Atualizar contador
        contador.textContent = `${this.peculiaridades.length}/5`;
        
        if (this.peculiaridades.length === 0) {
            container.innerHTML = '<div class="lista-vazia">Nenhuma peculiaridade adicionada</div>';
            return;
        }
        
        container.innerHTML = this.peculiaridades.map((pec, index) => `
            <div class="peculiaridade-item">
                <div class="peculiaridade-texto">${pec.texto}</div>
                <button onclick="window.vantagensSystem.removerPeculiaridade(${index})" 
                        class="btn-remover" style="background: #f39c12;">
                    ×
                </button>
            </div>
        `).join('');
    }

    // ========== TOTAIS E ATUALIZAÇÃO ==========
    atualizarTotais() {
        // Calcular totais
        const totalVantagens = this.vantagensAdquiridas.reduce((soma, item) => soma + Math.abs(item.custo), 0);
        const totalDesvantagens = this.desvantagensAdquiridas.reduce((soma, item) => soma + Math.abs(item.custo), 0);
        const totalPeculiaridades = this.peculiaridades.length;
        const saldoTotal = totalVantagens - totalDesvantagens - totalPeculiaridades;
        
        // Atualizar elementos
        this.atualizarElemento('total-vantagens', `+${totalVantagens}`);
        this.atualizarElemento('total-desvantagens', `-${totalDesvantagens}`);
        this.atualizarElemento('total-peculiaridades', `-${totalPeculiaridades}`);
        this.atualizarElemento('saldo-total', saldoTotal);
        this.atualizarElemento('total-vantagens-adquiridas', `${totalVantagens} pts`);
        this.atualizarElemento('total-desvantagens-adquiridas', `${totalDesvantagens} pts`);
        
        console.log(`📊 Totais atualizados: Vantagens=${totalVantagens}, Desvantagens=${totalDesvantagens}, Saldo=${saldoTotal}`);
    }

    atualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    }

    // ========== EVENTOS GERAIS ==========
    configurarEventos() {
        // Filtros de busca
        this.configurarFiltro('vantagens');
        this.configurarFiltro('desvantagens');
        
        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.fecharModal();
            }
        });
        
        // Fechar modal ao clicar fora
        const modal = document.getElementById('modal-vantagem');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.fecharModal();
                }
            });
        }
        
        console.log('🎮 Eventos configurados');
    }

    configurarFiltro(tipo) {
        const inputBusca = document.getElementById(`busca-${tipo}`);
        const selectCategoria = document.getElementById(`categoria-${tipo}`);
        
        if (inputBusca) {
            inputBusca.addEventListener('input', () => this.filtrarLista(tipo));
        }
        
        if (selectCategoria) {
            selectCategoria.addEventListener('change', () => this.filtrarLista(tipo));
        }
    }

    filtrarLista(tipo) {
        const termoBusca = document.getElementById(`busca-${tipo}`)?.value.toLowerCase() || '';
        const categoriaSelecionada = document.getElementById(`categoria-${tipo}`)?.value || '';
        const containerId = `lista-${tipo}`;
        const container = document.getElementById(containerId);
        
        if (!container) return;
        
        // Obter lista completa
        const listaCompleta = tipo === 'vantagens' 
            ? window.vantagensData?.vantagens 
            : window.vantagensData?.desvantagens;
        
        if (!listaCompleta) return;
        
        // Filtrar
        const itensFiltrados = listaCompleta.filter(item => {
            const matchBusca = item.nome.toLowerCase().includes(termoBusca) || 
                              item.descricao.toLowerCase().includes(termoBusca);
            const matchCategoria = !categoriaSelecionada || item.categoria === categoriaSelecionada;
            
            return matchBusca && matchCategoria;
        });
        
        // Renderizar filtrados
        container.innerHTML = '';
        
        if (itensFiltrados.length === 0) {
            container.innerHTML = '<div class="lista-vazia">Nenhum item encontrado</div>';
            return;
        }
        
        itensFiltrados.forEach(item => {
            const elemento = this.criarItem(item, tipo === 'vantagens' ? 'vantagem' : 'desvantagem');
            container.appendChild(elemento);
        });
    }

    // ========== FUNÇÕES PÚBLICAS ==========
    getDados() {
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
        console.log('📂 Dados carregados com sucesso');
    }
}

// ============================================
// INICIALIZAÇÃO GLOBAL
// ============================================

// Criar instância global
window.vantagensSystem = new GerenciadorVantagens();

// Configurar botões do modal (só uma vez)
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM completamente carregado');
    
    // Configurar botões do modal se existirem
    const btnConfirmar = document.getElementById('btn-confirmar-modal');
    const btnCancelar = document.getElementById('btn-cancelar-modal');
    const btnFechar = document.querySelector('.modal-close');
    
    if (btnConfirmar) {
        btnConfirmar.onclick = () => window.vantagensSystem.confirmarSelecao();
    }
    
    if (btnCancelar) {
        btnCancelar.onclick = () => window.vantagensSystem.fecharModal();
    }
    
    if (btnFechar) {
        btnFechar.onclick = () => window.vantagensSystem.fecharModal();
    }
});
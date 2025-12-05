// ============================================
// VANTAGENS.JS - SISTEMA COMPLETO E FUNCIONAL
// ============================================

console.log('🎮 Sistema de Vantagens - Carregado!');

// Sistema principal
const SistemaVantagens = {
    // Estado do sistema
    vantagensAdquiridas: [],
    desvantagensAdquiridas: [],
    peculiaridades: [],
    itemSelecionado: null,
    tipoSelecionado: null,
    
    // ========== INICIALIZAÇÃO ==========
    init() {
        console.log('⚡ Iniciando sistema de vantagens...');
        
        // Verificar se os dados do catálogo existem
        if (!window.vantagensData) {
            console.error('❌ Dados do catálogo não encontrados!');
            console.log('⚠️ Tentando carregar em 1 segundo...');
            setTimeout(() => this.init(), 1000);
            return;
        }
        
        console.log('✅ Catálogo encontrado:', {
            vantagens: window.vantagensData.vantagens?.length || 0,
            desvantagens: window.vantagensData.desvantagens?.length || 0
        });
        
        // Carregar todas as seções
        this.carregarVantagens();
        this.carregarDesvantagens();
        this.configurarPeculiaridades();
        this.configurarModal();
        this.configurarFiltros();
        this.atualizarTotais();
        
        console.log('✅ Sistema de vantagens inicializado com sucesso!');
    },
    
    // ========== CARREGAR VANTAGENS DISPONÍVEIS ==========
    carregarVantagens() {
        const container = document.getElementById('lista-vant-simple');
        if (!container) {
            console.error('❌ Container de vantagens não encontrado: lista-vant-simple');
            return;
        }
        
        const vantagens = window.vantagensData?.vantagens || [];
        console.log(`📋 Carregando ${vantagens.length} vantagens...`);
        
        if (vantagens.length === 0) {
            container.innerHTML = '<div class="lista-vazia">Nenhuma vantagem disponível</div>';
            return;
        }
        
        container.innerHTML = '';
        
        vantagens.forEach(vantagem => {
            const item = this.criarItem(vantagem, 'vantagem');
            container.appendChild(item);
        });
        
        // Atualizar contador
        const contador = document.getElementById('contador-vantagens');
        if (contador) {
            contador.textContent = `${vantagens.length} itens`;
        }
    },
    
    // ========== CARREGAR DESVANTAGENS DISPONÍVEIS ==========
    carregarDesvantagens() {
        const container = document.getElementById('lista-desvant-simple');
        if (!container) {
            console.error('❌ Container de desvantagens não encontrado: lista-desvant-simple');
            return;
        }
        
        const desvantagens = window.vantagensData?.desvantagens || [];
        console.log(`📋 Carregando ${desvantagens.length} desvantagens...`);
        
        if (desvantagens.length === 0) {
            container.innerHTML = '<div class="lista-vazia">Nenhuma desvantagem disponível</div>';
            return;
        }
        
        container.innerHTML = '';
        
        desvantagens.forEach(desvantagem => {
            const item = this.criarItem(desvantagem, 'desvantagem');
            container.appendChild(item);
        });
        
        // Atualizar contador
        const contador = document.getElementById('contador-desvantagens');
        if (contador) {
            contador.textContent = `${desvantagens.length} itens`;
        }
    },
    
    // ========== CRIAR ITEM DA LISTA ==========
    criarItem(item, tipo) {
        const div = document.createElement('div');
        div.className = 'item-simple';
        div.dataset.id = item.id;
        div.dataset.tipo = tipo;
        
        // Calcular custo para exibição
        let custoDisplay = '';
        if (item.tipo === 'variavel') {
            const custoPorNivel = Math.abs(item.custoPorNivel) || 2;
            custoDisplay = `${custoPorNivel} pts/nível`;
        } else if (item.custo !== undefined) {
            custoDisplay = `${Math.abs(item.custo)} pts`;
        } else if (item.variacoes && item.variacoes.length > 0) {
            const custos = item.variacoes.map(v => Math.abs(v.custo));
            const min = Math.min(...custos);
            const max = Math.max(...custos);
            custoDisplay = min === max ? `${min} pts` : `${min}-${max} pts`;
        } else {
            custoDisplay = '— pts';
        }
        
        // Cor baseada no tipo
        const corClasse = tipo === 'vantagem' ? 'item-custo-vantagem' : 'item-custo-desvantagem';
        
        div.innerHTML = `
            <div class="item-header-simple">
                <div class="item-nome-simple">${item.nome}</div>
                <div class="item-custo-simple ${corClasse}">${custoDisplay}</div>
            </div>
            <div class="item-descricao-simple">${item.descricao}</div>
        `;
        
        // Evento de clique
        div.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log(`🎯 Clicou em: ${item.nome} (${tipo})`);
            this.selecionarItem(item, tipo);
        });
        
        return div;
    },
    
    // ========== SELEÇÃO DE ITEM ==========
    selecionarItem(item, tipo) {
        console.log(`🎯 Selecionado: ${item.nome} (${tipo})`);
        
        this.itemSelecionado = item;
        this.tipoSelecionado = tipo;
        
        this.abrirModal();
    },
    
    // ========== MODAL ==========
    configurarModal() {
        const modal = document.getElementById('modal-simple');
        const btnFechar = document.getElementById('fechar-modal-simple');
        const btnCancelar = document.getElementById('cancelar-modal-simple');
        const btnConfirmar = document.getElementById('confirmar-modal-simple');
        
        if (!modal || !btnFechar || !btnCancelar || !btnConfirmar) {
            console.error('❌ Elementos do modal não encontrados');
            return;
        }
        
        console.log('✅ Configurando modal...');
        
        // Fechar modal
        const fecharModal = () => {
            modal.style.display = 'none';
            this.itemSelecionado = null;
            this.tipoSelecionado = null;
        };
        
        btnFechar.addEventListener('click', fecharModal);
        btnCancelar.addEventListener('click', fecharModal);
        
        // Confirmar seleção
        btnConfirmar.addEventListener('click', () => this.confirmarSelecao());
        
        // Fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                fecharModal();
            }
        });
        
        console.log('✅ Modal configurado');
    },
    
    abrirModal() {
        if (!this.itemSelecionado) {
            console.error('❌ Nenhum item selecionado para abrir modal');
            return;
        }
        
        const modal = document.getElementById('modal-simple');
        const titulo = document.getElementById('modal-titulo-simple');
        const corpo = document.getElementById('modal-corpo-simple');
        
        if (!modal || !titulo || !corpo) {
            console.error('❌ Elementos do modal não encontrados');
            return;
        }
        
        // Configurar título
        titulo.textContent = this.itemSelecionado.nome;
        
        // Gerar conteúdo baseado no tipo
        let conteudo = '';
        
        switch (this.itemSelecionado.tipo) {
            case 'multipla':
                conteudo = this.criarConteudoMultipla();
                break;
            case 'variavel':
                conteudo = this.criarConteudoVariavel();
                break;
            default:
                conteudo = this.criarConteudoSimples();
                break;
        }
        
        corpo.innerHTML = conteudo;
        
        // Mostrar modal
        modal.style.display = 'flex';
        console.log(`📋 Modal aberto: ${this.itemSelecionado.nome}`);
        
        // Configurar eventos específicos
        setTimeout(() => {
            if (this.itemSelecionado.tipo === 'multipla') {
                this.configurarVariacoes();
            } else if (this.itemSelecionado.tipo === 'variavel') {
                this.configurarNiveis();
            }
        }, 10);
    },
    
    criarConteudoSimples() {
        const custo = Math.abs(this.itemSelecionado.custo) || 0;
        const cor = this.tipoSelecionado === 'vantagem' ? '#2ecc71' : '#e74c3c';
        
        return `
            <div style="margin-bottom: 20px; color: #ccc; line-height: 1.5;">
                ${this.itemSelecionado.descricao}
            </div>
            <div style="text-align: center; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 8px; border: 2px solid ${cor};">
                <div style="font-size: 0.9em; color: #aaa; margin-bottom: 5px;">Custo</div>
                <div style="font-size: 2em; font-weight: bold; color: ${cor};">${custo} pontos</div>
            </div>
        `;
    },
    
    criarConteudoMultipla() {
        const cor = this.tipoSelecionado === 'vantagem' ? '#2ecc71' : '#e74c3c';
        
        let html = `
            <div style="margin-bottom: 15px; color: #ccc;">
                ${this.itemSelecionado.descricao}
            </div>
            <div style="margin-bottom: 20px;">
                <div style="color: #ffd700; font-weight: bold; margin-bottom: 10px;">Selecione uma variação:</div>
        `;
        
        this.itemSelecionado.variacoes.forEach((variacao, index) => {
            const custo = Math.abs(variacao.custo) || 0;
            html += `
                <div class="variacao-option" data-id="${variacao.id}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
                        <div style="font-weight: bold; color: #fff;">${variacao.nome}</div>
                        <div style="background: ${cor}; color: white; padding: 3px 10px; border-radius: 12px; font-weight: bold;">
                            ${custo} pts
                        </div>
                    </div>
                    <div style="color: #aaa; font-size: 0.9em;">${variacao.descricao}</div>
                    <input type="radio" name="variacao" value="${variacao.id}" 
                           ${index === 0 ? 'checked' : ''} 
                           style="display: none;">
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    },
    
    criarConteudoVariavel() {
        const nivelBase = this.itemSelecionado.nivelBase || 1;
        const niveisMax = this.itemSelecionado.niveis || 10;
        const custoPorNivel = Math.abs(this.itemSelecionado.custoPorNivel) || 2;
        const cor = this.tipoSelecionado === 'vantagem' ? '#2ecc71' : '#e74c3c';
        
        let html = `
            <div style="margin-bottom: 15px; color: #ccc;">
                ${this.itemSelecionado.descricao}
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 10px; color: #ffd700; font-weight: bold;">
                    Selecione o nível:
                </label>
                <select id="seletor-nivel-modal" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.3); color: #ffd700; border: 1px solid rgba(255,140,0,0.5); border-radius: 6px; margin-bottom: 20px;">
        `;
        
        for (let i = nivelBase; i <= niveisMax; i++) {
            html += `<option value="${i}">Nível ${i} (${i * custoPorNivel} pts)</option>`;
        }
        
        html += '</select>';
        
        html += `
            <div style="text-align: center; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 8px; border: 2px solid ${cor};">
                <div style="font-size: 0.9em; color: #aaa; margin-bottom: 5px;">Custo Total</div>
                <div id="custo-total-modal" style="font-size: 1.8em; font-weight: bold; color: ${cor};">
                    ${nivelBase * custoPorNivel} pontos
                </div>
            </div>
        </div>`;
        
        return html;
    },
    
    configurarVariacoes() {
        const opcoes = document.querySelectorAll('.variacao-option');
        console.log(`🎯 Configurando ${opcoes.length} variações`);
        
        opcoes.forEach(opcao => {
            opcao.addEventListener('click', () => {
                // Marcar o radio dentro desta opção
                const radio = opcao.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                }
                
                // Remover seleção de outras
                opcoes.forEach(o => o.classList.remove('selecionada'));
                // Adicionar seleção a esta
                opcao.classList.add('selecionada');
                
                console.log(`✅ Variação selecionada: ${opcao.dataset.id}`);
            });
        });
        
        // Selecionar a primeira por padrão
        if (opcoes[0]) {
            opcoes[0].classList.add('selecionada');
        }
    },
    
    configurarNiveis() {
        const seletor = document.getElementById('seletor-nivel-modal');
        const custoTotal = document.getElementById('custo-total-modal');
        
        if (!seletor || !custoTotal) {
            console.error('❌ Elementos do seletor de níveis não encontrados');
            return;
        }
        
        const atualizarCusto = () => {
            const nivel = parseInt(seletor.value) || 1;
            const custoPorNivel = Math.abs(this.itemSelecionado.custoPorNivel) || 2;
            const total = nivel * custoPorNivel;
            
            custoTotal.textContent = `${total} pontos`;
            seletor.dataset.custoFinal = total;
            seletor.dataset.nivel = nivel;
            
            console.log(`📊 Nível ${nivel}: ${total} pts`);
        };
        
        seletor.addEventListener('change', atualizarCusto);
        atualizarCusto(); // Inicial
    },
    
    confirmarSelecao() {
        if (!this.itemSelecionado || !this.tipoSelecionado) {
            alert('❌ Nenhum item selecionado.');
            return;
        }
        
        // Criar item adquirido
        let itemAdquirido = {
            id: `${this.itemSelecionado.id}-${Date.now()}`,
            baseId: this.itemSelecionado.id,
            nome: this.itemSelecionado.nome,
            descricao: this.itemSelecionado.descricao,
            tipo: this.itemSelecionado.tipo
        };
        
        // Calcular custo baseado no tipo
        if (this.itemSelecionado.tipo === 'multipla') {
            const radioSelecionado = document.querySelector('input[name="variacao"]:checked');
            if (radioSelecionado) {
                const variacao = this.itemSelecionado.variacoes.find(v => v.id === radioSelecionado.value);
                if (variacao) {
                    itemAdquirido.nome = variacao.nome;
                    itemAdquirido.custo = Math.abs(variacao.custo) || 0;
                    itemAdquirido.variacao = variacao.id;
                    itemAdquirido.descricao = variacao.descricao;
                }
            }
        } else if (this.itemSelecionado.tipo === 'variavel') {
            const seletor = document.getElementById('seletor-nivel-modal');
            if (seletor) {
                const nivel = parseInt(seletor.dataset.nivel) || parseInt(seletor.value) || 1;
                const custo = parseInt(seletor.dataset.custoFinal) || 
                             (nivel * Math.abs(this.itemSelecionado.custoPorNivel || 2));
                itemAdquirido.custo = custo;
                itemAdquirido.nivel = nivel;
            }
        } else {
            itemAdquirido.custo = Math.abs(this.itemSelecionado.custo) || 0;
        }
        
        // Se for desvantagem, custo é negativo
        if (this.tipoSelecionado === 'desvantagem') {
            itemAdquirido.custo = -Math.abs(itemAdquirido.custo);
        }
        
        // Adicionar à lista correta
        if (this.tipoSelecionado === 'vantagem') {
            this.vantagensAdquiridas.push(itemAdquirido);
            console.log(`✅ Vantagem adquirida: ${itemAdquirido.nome} (${itemAdquirido.custo} pts)`);
        } else {
            this.desvantagensAdquiridas.push(itemAdquirido);
            console.log(`✅ Desvantagem adquirida: ${itemAdquirido.nome} (${itemAdquirido.custo} pts)`);
        }
        
        // Atualizar interface
        this.atualizarListasAdquiridas();
        this.atualizarTotais();
        
        // Fechar modal
        document.getElementById('modal-simple').style.display = 'none';
        this.itemSelecionado = null;
        this.tipoSelecionado = null;
        
        // Feedback visual
        this.mostrarFeedback(`✅ ${this.tipoSelecionado === 'vantagem' ? 'Vantagem' : 'Desvantagem'} adquirida!`);
    },
    
    mostrarFeedback(mensagem) {
        // Criar elemento de feedback
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #27ae60, #2ecc71);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 99999;
            animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        
        document.head.appendChild(style);
        feedback.textContent = mensagem;
        document.body.appendChild(feedback);
        
        // Remover após 3 segundos
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 3000);
    },
    
    // ========== LISTAS ADQUIRIDAS ==========
    atualizarListasAdquiridas() {
        this.atualizarListaAdquirida('vantagens-adquiridas-simple', this.vantagensAdquiridas, '#2ecc71', 'vantagem');
        this.atualizarListaAdquirida('desvantagens-adquiridas-simple', this.desvantagensAdquiridas, '#e74c3c', 'desvantagem');
    },
    
    atualizarListaAdquirida(containerId, itens, cor, tipo) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Container não encontrado: ${containerId}`);
            return;
        }
        
        if (itens.length === 0) {
            container.innerHTML = '<div class="lista-vazia">Nenhum item adquirido</div>';
            return;
        }
        
        container.innerHTML = itens.map((item, index) => {
            const sinal = item.custo >= 0 ? '+' : '-';
            const custoAbs = Math.abs(item.custo);
            
            let detalhes = '';
            if (item.nivel) {
                detalhes += `<div style="font-size: 0.85em; color: #888; margin-top: 3px;">Nível ${item.nivel}</div>`;
            }
            if (item.variacao) {
                detalhes += `<div style="font-size: 0.85em; color: #aaa; margin-top: 3px;">Variação específica</div>`;
            }
            
            return `
                <div class="item-simple ${tipo}-adquirido" style="position: relative; padding-right: 40px; margin-bottom: 10px;">
                    <div class="item-header-simple">
                        <div class="item-nome-simple">${item.nome}</div>
                        <div class="item-custo-simple" style="background: ${cor}">${sinal}${custoAbs} pts</div>
                    </div>
                    <div class="item-descricao-simple">${item.descricao}</div>
                    ${detalhes}
                    <button onclick="SistemaVantagens.removerItem(${index}, '${tipo}')" 
                            class="btn-remover-simple" style="background: ${cor}">
                        ×
                    </button>
                </div>
            `;
        }).join('');
    },
    
    removerItem(index, tipo) {
        if (!confirm('Tem certeza que deseja remover este item?')) {
            return;
        }
        
        if (tipo === 'vantagem') {
            const removido = this.vantagensAdquiridas.splice(index, 1);
            console.log(`🗑️ Vantagem removida: ${removido[0]?.nome}`);
        } else {
            const removido = this.desvantagensAdquiridas.splice(index, 1);
            console.log(`🗑️ Desvantagem removida: ${removido[0]?.nome}`);
        }
        
        this.atualizarListasAdquiridas();
        this.atualizarTotais();
        this.mostrarFeedback('🗑️ Item removido!');
    },
    
    // ========== PECULIARIDADES ==========
    configurarPeculiaridades() {
        const input = document.getElementById('nova-pec-simple');
        const btn = document.getElementById('btn-adicionar-pec-simple');
        const contador = document.getElementById('contador-pec-chars');
        const contadorPec = document.getElementById('contador-pec-simple');
        
        if (!input || !btn || !contador || !contadorPec) {
            console.error('❌ Elementos das peculiaridades não encontrados');
            return;
        }
        
        console.log('✅ Configurando peculiaridades...');
        
        // Atualizar contador de caracteres
        const atualizarContador = () => {
            const texto = input.value;
            const comprimento = texto.length;
            
            contador.textContent = comprimento;
            
            // Atualizar cor do contador
            if (comprimento > 30) {
                contador.style.color = '#e74c3c';
            } else {
                contador.style.color = '#2ecc71';
            }
            
            // Atualizar estado do botão
            const podeAdicionar = texto.trim().length > 0 && 
                                 comprimento <= 30 && 
                                 this.peculiaridades.length < 5;
            
            btn.disabled = !podeAdicionar;
        };
        
        input.addEventListener('input', atualizarContador);
        
        // Adicionar peculiaridade
        btn.addEventListener('click', () => {
            const texto = input.value.trim();
            
            if (texto && texto.length <= 30 && this.peculiaridades.length < 5) {
                this.adicionarPeculiaridade(texto);
                input.value = '';
                atualizarContador();
            }
        });
        
        // Adicionar com Enter
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !btn.disabled) {
                btn.click();
            }
        });
        
        // Atualizar contador de quantidade
        contadorPec.textContent = `${this.peculiaridades.length}/5`;
    },
    
    adicionarPeculiaridade(texto) {
        const peculiaridade = {
            id: `pec-${Date.now()}`,
            texto: texto.substring(0, 30)
        };
        
        this.peculiaridades.push(peculiaridade);
        this.atualizarPeculiaridades();
        this.atualizarTotais();
        
        console.log(`✅ Peculiaridade adicionada: "${texto.substring(0, 30)}"`);
        this.mostrarFeedback('🏷️ Peculiaridade adicionada!');
    },
    
    atualizarPeculiaridades() {
        const container = document.getElementById('lista-peculiaridades-simple');
        const contador = document.getElementById('contador-pec-simple');
        
        if (!container || !contador) return;
        
        // Atualizar contador
        contador.textContent = `${this.peculiaridades.length}/5`;
        
        if (this.peculiaridades.length === 0) {
            container.innerHTML = '<div class="lista-vazia">Nenhuma peculiaridade adicionada</div>';
            return;
        }
        
        container.innerHTML = this.peculiaridades.map((pec, index) => `
            <div class="peculiaridade-item-simple">
                <div class="peculiaridade-texto-simple">${pec.texto}</div>
                <button onclick="SistemaVantagens.removerPeculiaridade(${index})" 
                        class="btn-remover-simple" style="background: #f39c12;">
                    ×
                </button>
            </div>
        `).join('');
    },
    
    removerPeculiaridade(index) {
        if (!confirm('Remover esta peculiaridade?')) return;
        
        const removida = this.peculiaridades.splice(index, 1);
        this.atualizarPeculiaridades();
        this.atualizarTotais();
        
        console.log(`🗑️ Peculiaridade removida: "${removida[0]?.texto}"`);
        this.mostrarFeedback('🗑️ Peculiaridade removida!');
    },
    
    // ========== ATUALIZAR TOTAIS ==========
    atualizarTotais() {
        // Calcular totais
        const totalVantagens = this.vantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0);
        const totalDesvantagens = this.desvantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0);
        const totalPeculiaridades = this.peculiaridades.length;
        const saldoTotal = totalVantagens - totalDesvantagens - totalPeculiaridades;
        
        // Atualizar elementos
        const elementos = {
            'total-vantagens-simple': `+${totalVantagens}`,
            'total-desvantagens-simple': `-${totalDesvantagens}`,
            'total-peculiaridades-simple': `-${totalPeculiaridades}`,
            'saldo-total-simple': saldoTotal >= 0 ? `+${saldoTotal}` : `${saldoTotal}`,
            'total-vant-adquiridas': `${totalVantagens} pts`,
            'total-desvant-adquiridas': `${totalDesvantagens} pts`
        };
        
        for (const [id, valor] of Object.entries(elementos)) {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = valor;
            } else {
                console.warn(`⚠️ Elemento não encontrado: ${id}`);
            }
        }
        
        console.log(`📊 Totais atualizados: V=${totalVantagens}, D=${totalDesvantagens}, P=${totalPeculiaridades}, Saldo=${saldoTotal}`);
    },
    
    // ========== FILTROS ==========
    configurarFiltros() {
        this.configurarFiltro('vant');
        this.configurarFiltro('desvant');
    },
    
    configurarFiltro(tipo) {
        const input = document.getElementById(`busca-${tipo}-simple`);
        if (!input) return;
        
        input.addEventListener('input', () => {
            this.filtrarLista(tipo);
        });
    },
    
    filtrarLista(tipo) {
        const termo = document.getElementById(`busca-${tipo}-simple`)?.value.toLowerCase() || '';
        const containerId = `lista-${tipo}-simple`;
        const container = document.getElementById(containerId);
        
        if (!container) return;
        
        // Obter lista completa
        const listaCompleta = tipo === 'vant' 
            ? window.vantagensData?.vantagens 
            : window.vantagensData?.desvantagens;
        
        if (!listaCompleta) return;
        
        // Filtrar
        const itensFiltrados = listaCompleta.filter(item => {
            const matchNome = item.nome.toLowerCase().includes(termo);
            const matchDesc = item.descricao.toLowerCase().includes(termo);
            
            return matchNome || matchDesc;
        });
        
        // Renderizar filtrados
        container.innerHTML = '';
        
        if (itensFiltrados.length === 0) {
            container.innerHTML = '<div class="lista-vazia">Nenhum item encontrado</div>';
            return;
        }
        
        itensFiltrados.forEach(item => {
            const elemento = this.criarItem(item, tipo === 'vant' ? 'vantagem' : 'desvantagem');
            container.appendChild(elemento);
        });
    },
    
    // ========== FUNÇÕES PÚBLICAS ==========
    getDados() {
        return {
            vantagens: this.vantagensAdquiridas,
            desvantagens: this.desvantagensAdquiridas,
            peculiaridades: this.peculiaridades
        };
    },
    
    carregarDados(dados) {
        if (dados.vantagens) this.vantagensAdquiridas = dados.vantagens;
        if (dados.desvantagens) this.desvantagensAdquiridas = dados.desvantagens;
        if (dados.peculiaridades) this.peculiaridades = dados.peculiaridades;
        
        this.atualizarListasAdquiridas();
        this.atualizarTotais();
        
        console.log('📂 Dados carregados com sucesso');
    }
};

// ============================================
// INICIALIZAÇÃO AUTOMÁTICA
// ============================================

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM completamente carregado');
    
    // Verificar se estamos na aba de vantagens
    const verificarAba = () => {
        const abaVantagens = document.getElementById('vantagens');
        if (abaVantagens && getComputedStyle(abaVantagens).display !== 'none') {
            // Se a aba já está visível, inicializar
            SistemaVantagens.init();
        }
    };
    
    // Inicializar sistema
    window.SistemaVantagens = SistemaVantagens;
    
    // Tentar inicializar imediatamente
    setTimeout(() => {
        SistemaVantagens.init();
    }, 500);
    
    // Configurar observador para quando a aba for mostrada
    const botoesTabs = document.querySelectorAll('.tab-btn');
    botoesTabs.forEach(botao => {
        botao.addEventListener('click', function() {
            if (this.getAttribute('data-tab') === 'vantagens') {
                console.log('📋 Aba vantagens clicada - Inicializando sistema...');
                setTimeout(() => SistemaVantagens.init(), 100);
            }
        });
    });
    
    // Verificar inicialmente
    verificarAba();
});

// Exportar para uso global
window.vantagensSystem = SistemaVantagens;

console.log('🎮 Sistema de Vantagens pronto para uso!');
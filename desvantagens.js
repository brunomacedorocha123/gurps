// desvantagens.js - SISTEMA INDEPENDENTE E CORRIGIDO
console.log("🚀 desvantagens.js carregando...");

class SistemaDesvantagens {
    constructor() {
        console.log("🔧 SistemaDesvantagens iniciando...");
        this.desvantagensAdquiridas = [];
        this.desvantagensDisponiveis = [];
        this.modalAtivo = null;
        this.opcaoSelecionada = null;
        this.desvantagemSelecionada = null;
        
        this.init();
    }
    
    init() {
        console.log("📦 Carregando catálogo de desvantagens...");
        this.carregarDesvantagens();
        
        console.log("🎯 Configurando eventos...");
        this.configurarEventos();
        
        console.log("🔄 Atualizando interface...");
        this.atualizarTudo();
        
        console.log("✅ SistemaDesvantagens pronto!");
    }
    
    carregarDesvantagens() {
        console.log("📚 Procurando catálogo de desvantagens...");
        if (window.catalogoDesvantagens && Array.isArray(window.catalogoDesvantagens)) {
            this.desvantagensDisponiveis = [...window.catalogoDesvantagens];
            console.log(`✅ ${this.desvantagensDisponiveis.length} desvantagens carregadas`);
        } else {
            console.error("❌ Catálogo de desvantagens não encontrado ou inválido!");
            this.desvantagensDisponiveis = [];
        }
    }
    
    configurarEventos() {
        // Busca desvantagens
        const buscaDesvantagens = document.getElementById('busca-desvantagens');
        if (buscaDesvantagens) {
            buscaDesvantagens.addEventListener('input', (e) => {
                this.filtrarDesvantagens(e.target.value);
            });
        }
        
        // Modais
        this.configurarModais();
        
        // Configurar eventos de clique nos itens da lista (CRÍTICO!)
        setTimeout(() => {
            this.configurarEventosLista();
        }, 100);
    }
    
    configurarEventosLista() {
        // Este é o problema principal! Os itens da lista não têm eventos
        const listaContainer = document.getElementById('lista-desvantagens');
        if (listaContainer) {
            console.log("🎯 Configurando eventos para os itens da lista...");
            
            // Remover event listeners antigos
            const itensAntigos = listaContainer.querySelectorAll('.item-lista[data-initialized="true"]');
            itensAntigos.forEach(item => {
                item.removeEventListener('click', this.itemClickHandler);
            });
            
            // Adicionar eventos aos itens existentes
            this.configurarEventosItensLista();
        }
    }
    
    configurarEventosItensLista() {
        const itens = document.querySelectorAll('#lista-desvantagens .item-lista');
        console.log(`🎯 Encontrados ${itens.length} itens para configurar eventos`);
        
        itens.forEach(item => {
            // Remover eventos antigos
            const novoItem = item.cloneNode(true);
            item.parentNode.replaceChild(novoItem, item);
            
            // Adicionar novo evento
            novoItem.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = novoItem.dataset.id;
                const desvantagem = this.desvantagensDisponiveis.find(d => d.id === id);
                if (desvantagem) {
                    console.log(`🔍 Clicou em: ${desvantagem.nome}`);
                    this.selecionarDesvantagem(desvantagem);
                }
            });
            
            novoItem.style.cursor = 'pointer';
            novoItem.dataset.initialized = "true";
        });
    }
    
    configurarModais() {
        // Modal de desvantagem
        const modalDesvantagem = document.getElementById('modal-desvantagem');
        if (modalDesvantagem) {
            // Fechar modal
            modalDesvantagem.querySelector('.modal-close').addEventListener('click', () => {
                this.fecharModal('desvantagem');
            });
            
            modalDesvantagem.querySelector('.btn-cancelar').addEventListener('click', () => {
                this.fecharModal('desvantagem');
            });
            
            // Confirmar adição
            const btnConfirmar = modalDesvantagem.querySelector('.btn-confirmar');
            if (btnConfirmar) {
                btnConfirmar.addEventListener('click', () => {
                    console.log("✅ Botão Adicionar Desvantagem clicado!");
                    this.adicionarDesvantagem();
                });
            }
        }
        
        // Modal de opções
        const modalOpcoes = document.getElementById('modal-opcoes');
        if (modalOpcoes) {
            modalOpcoes.querySelector('.modal-close').addEventListener('click', () => {
                this.fecharModal('opcoes');
            });
            
            const btnVoltar = modalOpcoes.querySelector('.btn-cancelar');
            if (btnVoltar) {
                btnVoltar.addEventListener('click', () => {
                    this.fecharModal('opcoes');
                    // Voltar para o modal de desvantagem
                    if (this.desvantagemSelecionada) {
                        setTimeout(() => {
                            this.abrirModalDesvantagem(this.desvantagemSelecionada);
                        }, 50);
                    }
                });
            }
            
            const btnConfirmarOpcao = modalOpcoes.querySelector('.btn-confirmar');
            if (btnConfirmarOpcao) {
                btnConfirmarOpcao.addEventListener('click', () => {
                    console.log("✅ Botão Selecionar clicado no modal de opções!");
                    this.selecionarOpcao();
                });
            }
        }
        
        // Fechar modal clicando fora
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.fecharModal(this.modalAtivo);
            }
        });
        
        // Tecla ESC para fechar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalAtivo) {
                this.fecharModal(this.modalAtivo);
            }
        });
    }
    
    filtrarDesvantagens(termo) {
        const listaContainer = document.getElementById('lista-desvantagens');
        if (!listaContainer) {
            console.error("❌ Lista de desvantagens não encontrada!");
            return;
        }
        
        termo = termo.toLowerCase().trim();
        
        // Limpar lista atual
        listaContainer.innerHTML = '';
        
        if (this.desvantagensDisponiveis.length === 0) {
            listaContainer.innerHTML = '<div class="lista-vazia">Nenhuma desvantagem disponível</div>';
            return;
        }
        
        // Filtrar desvantagens
        const desvantagensFiltradas = this.desvantagensDisponiveis.filter(desvantagem => {
            return desvantagem.nome.toLowerCase().includes(termo) ||
                   (desvantagem.descricao && desvantagem.descricao.toLowerCase().includes(termo)) ||
                   (desvantagem.categoria && desvantagem.categoria.toLowerCase().includes(termo));
        });
        
        if (desvantagensFiltradas.length === 0) {
            listaContainer.innerHTML = `<div class="lista-vazia">Nenhuma desvantagem encontrada para "${termo}"</div>`;
            return;
        }
        
        // Renderizar desvantagens filtradas
        desvantagensFiltradas.forEach(desvantagem => {
            const item = this.criarItemDesvantagem(desvantagem);
            listaContainer.appendChild(item);
        });
        
        // Configurar eventos para os novos itens
        this.configurarEventosItensLista();
        
        // Atualizar contador
        const contador = document.getElementById('contador-desvantagens');
        if (contador) {
            contador.textContent = `${desvantagensFiltradas.length} desvantagem${desvantagensFiltradas.length !== 1 ? 'ns' : ''}`;
        }
    }
    
    criarItemDesvantagem(desvantagem) {
        const item = document.createElement('div');
        item.className = 'item-lista';
        item.dataset.id = desvantagem.id;
        
        let custoTexto = '';
        if (desvantagem.temOpcoes) {
            custoTexto = 'Varia';
        } else {
            custoTexto = `${desvantagem.custo} pts`;
        }
        
        const custoClass = desvantagem.custo < 0 ? 'negativo' : '';
        
        item.innerHTML = `
            <div class="item-header">
                <h4 class="item-nome">${desvantagem.nome}</h4>
                <span class="item-custo ${custoClass}">${custoTexto}</span>
            </div>
            <p class="item-descricao">${desvantagem.descricao ? desvantagem.descricao.substring(0, 150) + (desvantagem.descricao.length > 150 ? '...' : '') : ''}</p>
            ${desvantagem.categoria ? `<span class="item-categoria">${desvantagem.categoria}</span>` : ''}
        `;
        
        item.style.cursor = 'pointer';
        item.dataset.initialized = "true";
        
        return item;
    }
    
    selecionarDesvantagem(desvantagem) {
        console.log(`🔍 Selecionando desvantagem: ${desvantagem.nome}`);
        this.desvantagemSelecionada = desvantagem;
        
        // Resetar opção selecionada
        this.opcaoSelecionada = null;
        
        if (desvantagem.temOpcoes && desvantagem.opcoes && desvantagem.opcoes.length > 1) {
            // Abrir modal de opções
            console.log("📋 Abrindo modal de opções...");
            this.abrirModalOpcoes(desvantagem);
        } else {
            // Abrir modal direto
            console.log("📋 Abrindo modal direto...");
            this.abrirModalDesvantagem(desvantagem);
        }
    }
    
    abrirModalOpcoes(desvantagem) {
        const modal = document.getElementById('modal-opcoes');
        const corpo = document.getElementById('modal-corpo-opcoes');
        const titulo = document.getElementById('modal-titulo-opcoes');
        const btnConfirmar = modal.querySelector('.btn-confirmar');
        
        if (!modal || !corpo) {
            console.error('❌ Modal de opções não encontrado!');
            return;
        }
        
        titulo.textContent = `Escolha uma opção: ${desvantagem.nome}`;
        corpo.innerHTML = '';
        
        // Criar lista de opções
        desvantagem.opcoes.forEach((opcao, index) => {
            const opcaoItem = document.createElement('div');
            opcaoItem.className = 'opcao-item';
            opcaoItem.dataset.index = index;
            
            const custoClass = opcao.custo < 0 ? 'negativo' : '';
            
            opcaoItem.innerHTML = `
                <div class="opcao-header">
                    <h4 class="opcao-nome">${opcao.nome}</h4>
                    <span class="opcao-custo ${custoClass}">${opcao.custo} pts</span>
                </div>
                <p class="opcao-descricao">${opcao.descricao || ''}</p>
            `;
            
            opcaoItem.addEventListener('click', () => {
                console.log(`📌 Selecionou opção: ${opcao.nome}`);
                
                // Remover seleção anterior
                document.querySelectorAll('.opcao-item').forEach(item => {
                    item.classList.remove('selecionada');
                });
                
                // Selecionar esta opção
                opcaoItem.classList.add('selecionada');
                this.opcaoSelecionada = opcao;
                btnConfirmar.disabled = false;
                console.log(`✅ Opção selecionada: ${opcao.nome} (${opcao.custo} pts)`);
            });
            
            corpo.appendChild(opcaoItem);
        });
        
        // Resetar seleção
        this.opcaoSelecionada = null;
        btnConfirmar.disabled = true;
        
        this.abrirModal('opcoes');
    }
    
    abrirModalDesvantagem(desvantagem) {
        const modal = document.getElementById('modal-desvantagem');
        if (!modal) {
            console.error('❌ Modal de desvantagem não encontrado!');
            return;
        }
        
        const corpo = document.getElementById('modal-corpo-desvantagem');
        const titulo = document.getElementById('modal-titulo-desvantagem');
        const btnConfirmar = modal.querySelector('.btn-confirmar');
        
        if (!corpo || !titulo || !btnConfirmar) {
            console.error('❌ Elementos do modal não encontrados!');
            return;
        }
        
        console.log(`📋 Abrindo modal para: ${desvantagem.nome}`);
        titulo.textContent = desvantagem.nome;
        
        let custo = desvantagem.custo || 0;
        let nomeExibicao = desvantagem.nome;
        
        // Se tem opções mas só uma, usar a primeira opção
        if (desvantagem.temOpcoes && desvantagem.opcoes && desvantagem.opcoes.length === 1) {
            const opcao = desvantagem.opcoes[0];
            custo = opcao.custo;
            nomeExibicao = opcao.nome;
            this.opcaoSelecionada = opcao;
        } else if (!desvantagem.temOpcoes) {
            this.opcaoSelecionada = null;
        }
        
        corpo.innerHTML = `
            <div class="modal-info">
                <p><strong>Descrição:</strong> ${desvantagem.descricao || ''}</p>
                ${desvantagem.categoria ? `<p><strong>Categoria:</strong> ${desvantagem.categoria}</p>` : ''}
                ${desvantagem.prerequisitos && desvantagem.prerequisitos.length > 0 ? 
                  `<p><strong>Pré-requisitos:</strong> ${desvantagem.prerequisitos.join(', ')}</p>` : ''}
                ${desvantagem.notas ? `<p><strong>Notas:</strong> ${desvantagem.notas}</p>` : ''}
            </div>
            <div class="pericia-custo-container">
                <div class="pericia-custo ${custo < 0 ? 'negativo' : ''}">Valor: ${custo} pontos</div>
                ${desvantagem.temOpcoes && desvantagem.opcoes && desvantagem.opcoes.length > 1 ? 
                  '<div class="pericia-custo-adicional">(Esta desvantagem tem múltiplas opções)</div>' : ''}
            </div>
        `;
        
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = 'Adicionar Desvantagem';
        
        this.abrirModal('desvantagem');
    }
    
    selecionarOpcao() {
        console.log('✅ Confirmando seleção de opção no modal...');
        
        if (!this.opcaoSelecionada || !this.desvantagemSelecionada) {
            console.error('❌ Faltam dados para selecionar opção!');
            console.log('opcaoSelecionada:', this.opcaoSelecionada);
            console.log('desvantagemSelecionada:', this.desvantagemSelecionada);
            alert('Por favor, selecione uma opção primeiro.');
            return;
        }
        
        console.log(`🎯 Adicionando: ${this.opcaoSelecionada.nome} (${this.opcaoSelecionada.custo} pts)`);
        
        // Fechar modal de opções
        this.fecharModal('opcoes');
        
        // ADICIONAR DIRETAMENTE O ITEM COM A OPÇÃO SELECIONADA
        this.adicionarDesvantagemComOpcao();
    }
    
    adicionarDesvantagemComOpcao() {
        if (!this.desvantagemSelecionada || !this.opcaoSelecionada) {
            console.error('❌ Não há desvantagem ou opção selecionada!');
            return;
        }
        
        console.log(`📊 Adicionando desvantagem: ${this.opcaoSelecionada.nome} por ${this.opcaoSelecionada.custo} pontos`);
        
        const desvantagemAdquirida = {
            id: this.desvantagemSelecionada.id + '-' + Date.now(),
            baseId: this.desvantagemSelecionada.id,
            nome: this.opcaoSelecionada.nome,
            nomeBase: this.desvantagemSelecionada.nome,
            custo: this.opcaoSelecionada.custo,
            descricao: this.opcaoSelecionada.descricao || this.desvantagemSelecionada.descricao,
            categoria: this.desvantagemSelecionada.categoria,
            dataAdquisicao: new Date().toISOString(),
            opcaoSelecionada: this.opcaoSelecionada
        };
        
        this.desvantagensAdquiridas.push(desvantagemAdquirida);
        console.log(`✅ Desvantagem adicionada: ${desvantagemAdquirida.nome} (${desvantagemAdquirida.custo} pts)`);
        
        // Atualizar interface
        this.atualizarTudo();
        
        // Resetar seleções
        this.desvantagemSelecionada = null;
        this.opcaoSelecionada = null;
    }
    
    adicionarDesvantagem() {
        console.log("📝 Adicionando desvantagem...");
        
        if (!this.desvantagemSelecionada) {
            console.error("❌ Nenhuma desvantagem selecionada!");
            return;
        }
        
        let custo = 0;
        let nomeExibicao = this.desvantagemSelecionada.nome;
        
        console.log(`📝 Processando: ${nomeExibicao}`);
        
        // Determinar custo e nome baseado nas opções
        if (this.desvantagemSelecionada.temOpcoes) {
            if (this.opcaoSelecionada) {
                // Usar opção selecionada
                custo = this.opcaoSelecionada.custo;
                nomeExibicao = this.opcaoSelecionada.nome;
            } else if (this.desvantagemSelecionada.opcoes && this.desvantagemSelecionada.opcoes.length === 1) {
                // Usar única opção disponível
                const opcao = this.desvantagemSelecionada.opcoes[0];
                custo = opcao.custo;
                nomeExibicao = opcao.nome;
                this.opcaoSelecionada = opcao;
            } else {
                console.error("❌ Nenhuma opção selecionada para desvantagem com opções múltiplas");
                alert('Por favor, selecione uma opção primeiro.');
                return;
            }
        } else {
            // Sem opções
            custo = this.desvantagemSelecionada.custo;
        }
        
        // Adicionar à lista de adquiridas
        const desvantagemAdquirida = {
            id: this.desvantagemSelecionada.id + '-' + Date.now(),
            baseId: this.desvantagemSelecionada.id,
            nome: nomeExibicao,
            nomeBase: this.desvantagemSelecionada.nome,
            custo: custo,
            descricao: this.desvantagemSelecionada.descricao,
            categoria: this.desvantagemSelecionada.categoria,
            dataAdquisicao: new Date().toISOString(),
            opcaoSelecionada: this.opcaoSelecionada || null
        };
        
        this.desvantagensAdquiridas.push(desvantagemAdquirida);
        console.log(`✅ Desvantagem adicionada: ${nomeExibicao} (${custo} pts)`);
        
        // Atualizar interface
        this.atualizarTudo();
        
        // Fechar modal
        this.fecharModal('desvantagem');
        
        // Resetar seleções
        this.desvantagemSelecionada = null;
        this.opcaoSelecionada = null;
    }
    
    removerDesvantagem(id) {
        console.log(`🗑️ Removendo desvantagem com ID: ${id}`);
        
        this.desvantagensAdquiridas = this.desvantagensAdquiridas.filter(d => d.id !== id);
        
        // Atualizar interface
        this.atualizarTudo();
    }
    
    atualizarTudo() {
        this.atualizarListaDisponiveis();
        this.atualizarListaAdquiridas();
        this.atualizarContadores();
        this.atualizarTotais();
        
        // Notificar sistema de vantagens para atualizar saldo
        if (window.sistemaVantagens) {
            window.sistemaVantagens.atualizarTotais();
        }
    }
    
    atualizarListaDisponiveis() {
        const listaContainer = document.getElementById('lista-desvantagens');
        if (!listaContainer) {
            console.error("❌ Lista de desvantagens não encontrada!");
            return;
        }
        
        listaContainer.innerHTML = '';
        
        if (this.desvantagensDisponiveis.length === 0) {
            listaContainer.innerHTML = '<div class="lista-vazia">Nenhuma desvantagem disponível</div>';
            return;
        }
        
        this.desvantagensDisponiveis.forEach(desvantagem => {
            const item = this.criarItemDesvantagem(desvantagem);
            listaContainer.appendChild(item);
        });
        
        // Configurar eventos
        this.configurarEventosItensLista();
    }
    
    atualizarListaAdquiridas() {
        const listaContainer = document.getElementById('desvantagens-adquiridas');
        if (!listaContainer) return;
        
        listaContainer.innerHTML = '';
        
        if (this.desvantagensAdquiridas.length === 0) {
            listaContainer.innerHTML = '<div class="lista-vazia">Nenhuma desvantagem adquirida</div>';
            return;
        }
        
        this.desvantagensAdquiridas.forEach(desvantagem => {
            const item = document.createElement('div');
            item.className = 'item-lista item-adquirido desvantagem-adquirida';
            item.dataset.id = desvantagem.id;
            
            const custoClass = desvantagem.custo < 0 ? 'negativo' : '';
            
            item.innerHTML = `
                <div class="item-header">
                    <h4 class="item-nome">${desvantagem.nome}</h4>
                    <span class="item-custo ${custoClass}">${desvantagem.custo} pts</span>
                    <button class="btn-remover" title="Remover desvantagem" aria-label="Remover desvantagem">×</button>
                </div>
                <p class="item-descricao">${desvantagem.descricao ? desvantagem.descricao.substring(0, 120) + (desvantagem.descricao.length > 120 ? '...' : '') : ''}</p>
                ${desvantagem.categoria ? `<span class="item-categoria">${desvantagem.categoria}</span>` : ''}
                ${desvantagem.nomeBase && desvantagem.nomeBase !== desvantagem.nome ? 
                  `<small style="color:#95a5a6;display:block;margin-top:4px;">(${desvantagem.nomeBase})</small>` : ''}
            `;
            
            // Botão remover
            const btnRemover = item.querySelector('.btn-remover');
            btnRemover.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removerDesvantagem(desvantagem.id);
            });
            
            listaContainer.appendChild(item);
        });
    }
    
    atualizarContadores() {
        // Contador de desvantagens disponíveis
        const contadorDesvantagens = document.getElementById('contador-desvantagens');
        if (contadorDesvantagens) {
            contadorDesvantagens.textContent = `${this.desvantagensDisponiveis.length} desvantagem${this.desvantagensDisponiveis.length !== 1 ? 'ns' : ''}`;
        }
        
        // Total de desvantagens adquiridas
        const totalDesvantagensAdquiridas = document.getElementById('total-desvantagens-adquiridas');
        if (totalDesvantagensAdquiridas) {
            const total = this.desvantagensAdquiridas.reduce((sum, d) => sum + d.custo, 0);
            totalDesvantagensAdquiridas.textContent = `${total} pts`;
        }
    }
    
    atualizarTotais() {
        // Calcular totais
        const totalDesvantagens = this.desvantagensAdquiridas.reduce((sum, d) => sum + d.custo, 0);
        
        // Atualizar elementos
        const elTotalDesvantagens = document.getElementById('total-desvantagens');
        if (elTotalDesvantagens) {
            elTotalDesvantagens.textContent = `${totalDesvantagens} pts`;
        }
        
        console.log(`💰 Total de desvantagens: ${totalDesvantagens} pts`);
    }
    
    // FUNÇÕES DE MODAL
    abrirModal(tipo) {
        console.log(`📂 Abrindo modal: ${tipo}`);
        
        this.modalAtivo = tipo;
        const modal = document.getElementById(`modal-${tipo}`);
        
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            document.body.classList.add('modal-aberto');
        }
    }
    
    fecharModal(tipo) {
        console.log(`📪 Fechando modal: ${tipo}`);
        
        const modal = document.getElementById(`modal-${tipo}`);
        if (modal) {
            modal.style.display = 'none';
        }
        
        if (tipo === this.modalAtivo) {
            this.modalAtivo = null;
            document.body.style.overflow = 'auto';
            document.body.classList.remove('modal-aberto');
        }
        
        // Resetar seleções se for modal de desvantagem
        if (tipo === 'desvantagem') {
            this.desvantagemSelecionada = null;
            this.opcaoSelecionada = null;
        }
    }
    
    // Função para obter todas as desvantagens adquiridas
    obterDesvantagensAdquiridas() {
        return [...this.desvantagensAdquiridas];
    }
    
    // Função para calcular total de desvantagens
    calcularTotalDesvantagens() {
        return this.desvantagensAdquiridas.reduce((sum, d) => sum + d.custo, 0);
    }
}

// Inicializar sistema quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log("🏁 DOM pronto, inicializando SistemaDesvantagens...");
    window.sistemaDesvantagens = new SistemaDesvantagens();
    
    // Garantir que as listas sejam atualizadas após carregar tudo
    setTimeout(() => {
        if (window.sistemaDesvantagens) {
            console.log("🔄 Atualizando listas após carregamento...");
            window.sistemaDesvantagens.atualizarTudo();
            
            // Configurar eventos dos itens da lista
            setTimeout(() => {
                window.sistemaDesvantagens.configurarEventosLista();
            }, 200);
        }
    }, 500);
});

console.log("📄 desvantagens.js carregado (aguardando DOM)...");

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.SistemaDesvantagens = SistemaDesvantagens;
}
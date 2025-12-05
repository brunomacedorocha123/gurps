// SISTEMA DE DESVANTAGENS - LÓGICA PRINCIPAL

class SistemaDesvantagens {
    constructor() {
        this.desvantagensAdquiridas = [];
        this.desvantagensDisponiveis = [];
        this.modalAtivo = null;
        this.opcaoSelecionada = null;
        this.desvantagemSelecionada = null;
        
        this.init();
    }
    
    init() {
        // Carregar catálogo
        this.carregarDesvantagens();
        
        // Configurar eventos
        this.configurarEventos();
        
        // Atualizar interface
        this.atualizarListaDisponiveis();
        this.atualizarContadores();
        this.atualizarTotais();
    }
    
    carregarDesvantagens() {
        // Usar catálogo global
        if (window.catalogoDesvantagens) {
            this.desvantagensDisponiveis = [...window.catalogoDesvantagens];
        } else {
            console.error("Catálogo de desvantagens não encontrado!");
            this.desvantagensDisponiveis = [];
        }
    }
    
    configurarEventos() {
        // Busca
        const buscaInput = document.getElementById('busca-desvantagens');
        if (buscaInput) {
            buscaInput.addEventListener('input', (e) => {
                this.filtrarDesvantagens(e.target.value);
            });
        }
        
        // Modais
        this.configurarModais();
    }
    
    configurarModais() {
        // Modal de desvantagem
        const modalDesvantagem = document.getElementById('modal-desvantagem');
        const modalOpcoes = document.getElementById('modal-opcoes');
        
        if (modalDesvantagem) {
            // Fechar modal
            modalDesvantagem.querySelector('.modal-close').addEventListener('click', () => {
                this.fecharModal('desvantagem');
            });
            
            modalDesvantagem.querySelector('.btn-cancelar').addEventListener('click', () => {
                this.fecharModal('desvantagem');
            });
            
            // Confirmar adição
            modalDesvantagem.querySelector('.btn-confirmar').addEventListener('click', () => {
                this.adicionarDesvantagem();
            });
        }
        
        // Fechar modal clicando fora
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.fecharModal(this.modalAtivo);
            }
        });
    }
    
    filtrarDesvantagens(termo) {
        const listaContainer = document.getElementById('lista-desvantagens');
        if (!listaContainer) return;
        
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
                   desvantagem.descricao.toLowerCase().includes(termo) ||
                   desvantagem.categoria.toLowerCase().includes(termo);
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
        
        // Atualizar contador
        document.getElementById('contador-desvantagens').textContent = 
            `${desvantagensFiltradas.length} desvantagem${desvantagensFiltradas.length !== 1 ? 'ns' : ''}`;
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
            <p class="item-descricao">${desvantagem.descricao.substring(0, 150)}${desvantagem.descricao.length > 150 ? '...' : ''}</p>
            ${desvantagem.categoria ? `<span class="item-categoria">${desvantagem.categoria}</span>` : ''}
        `;
        
        item.addEventListener('click', () => {
            this.selecionarDesvantagem(desvantagem);
        });
        
        return item;
    }
    
    selecionarDesvantagem(desvantagem) {
        this.desvantagemSelecionada = desvantagem;
        
        if (desvantagem.temOpcoes && desvantagem.opcoes && desvantagem.opcoes.length > 1) {
            // Abrir modal de opções
            this.abrirModalOpcoes(desvantagem);
        } else {
            // Abrir modal direto
            this.abrirModalDesvantagem(desvantagem);
        }
    }
    
    abrirModalOpcoes(desvantagem) {
        const modal = document.getElementById('modal-opcoes');
        const corpo = document.getElementById('modal-corpo-opcoes');
        const titulo = document.getElementById('modal-titulo-opcoes');
        const btnConfirmar = modal.querySelector('.btn-confirmar');
        
        if (!modal || !corpo) return;
        
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
                <p class="opcao-descricao">${opcao.descricao}</p>
            `;
            
            opcaoItem.addEventListener('click', () => {
                // Remover seleção anterior
                document.querySelectorAll('.opcao-item').forEach(item => {
                    item.classList.remove('selecionada');
                });
                
                // Selecionar esta opção
                opcaoItem.classList.add('selecionada');
                this.opcaoSelecionada = opcao;
                btnConfirmar.disabled = false;
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
        const corpo = document.getElementById('modal-corpo-desvantagem');
        const titulo = document.getElementById('modal-titulo-desvantagem');
        const btnConfirmar = modal.querySelector('.btn-confirmar');
        
        if (!modal || !corpo) return;
        
        titulo.textContent = desvantagem.nome;
        
        let custo = desvantagem.custo;
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
                <p><strong>Descrição:</strong> ${desvantagem.descricao}</p>
                ${desvantagem.categoria ? `<p><strong>Categoria:</strong> ${desvantagem.categoria}</p>` : ''}
                ${desvantagem.prerequisitos.length > 0 ? `<p><strong>Pré-requisitos:</strong> ${desvantagem.prerequisitos.join(', ')}</p>` : ''}
                ${desvantagem.notas ? `<p><strong>Notas:</strong> ${desvantagem.notas}</p>` : ''}
            </div>
            <div class="pericia-custo-container">
                <div class="pericia-custo">Valor: ${custo} pontos</div>
                ${desvantagem.temOpcoes && desvantagem.opcoes && desvantagem.opcoes.length > 1 ? 
                  '<div class="pericia-custo-adicional">(Esta desvantagem tem múltiplas opções)</div>' : ''}
            </div>
        `;
        
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = 'Adicionar Desvantagem';
        
        this.abrirModal('desvantagem');
    }
    
    adicionarDesvantagem() {
        if (!this.desvantagemSelecionada) return;
        
        let desvantagemParaAdicionar = { ...this.desvantagemSelecionada };
        let custo = 0;
        let nomeExibicao = this.desvantagemSelecionada.nome;
        
        // Determinar custo e nome baseado nas opções
        if (this.desvantagemSelecionada.temOpcoes) {
            if (this.opcaoSelecionada) {
                desvantagemParaAdicionar.opcaoSelecionada = this.opcaoSelecionada;
                custo = this.opcaoSelecionada.custo;
                nomeExibicao = this.opcaoSelecionada.nome;
            } else if (this.desvantagemSelecionada.opcoes && this.desvantagemSelecionada.opcoes.length === 1) {
                desvantagemParaAdicionar.opcaoSelecionada = this.desvantagemSelecionada.opcoes[0];
                custo = this.desvantagemSelecionada.opcoes[0].custo;
                nomeExibicao = this.desvantagemSelecionada.opcoes[0].nome;
            } else {
                console.error("Nenhuma opção selecionada para desvantagem com opções múltiplas");
                return;
            }
        } else {
            custo = this.desvantagemSelecionada.custo;
        }
        
        // Adicionar à lista de adquiridas
        const desvantagemAdquirida = {
            id: desvantagemParaAdicionar.id + '-' + Date.now(),
            baseId: desvantagemParaAdicionar.id,
            nome: nomeExibicao,
            nomeBase: this.desvantagemSelecionada.nome,
            custo: custo,
            descricao: desvantagemParaAdicionar.descricao,
            categoria: desvantagemParaAdicionar.categoria,
            dataAdquisicao: new Date().toISOString(),
            opcaoSelecionada: desvantagemParaAdicionar.opcaoSelecionada || null
        };
        
        this.desvantagensAdquiridas.push(desvantagemAdquirida);
        
        // Atualizar interface
        this.atualizarListaAdquiridas();
        this.atualizarContadores();
        this.atualizarTotais();
        
        // Fechar modal
        this.fecharModal('desvantagem');
        
        // Resetar seleções
        this.desvantagemSelecionada = null;
        this.opcaoSelecionada = null;
    }
    
    removerDesvantagem(id) {
        this.desvantagensAdquiridas = this.desvantagensAdquiridas.filter(d => d.id !== id);
        
        // Atualizar interface
        this.atualizarListaAdquiridas();
        this.atualizarContadores();
        this.atualizarTotais();
    }
    
    atualizarListaDisponiveis() {
        const listaContainer = document.getElementById('lista-desvantagens');
        if (!listaContainer) return;
        
        listaContainer.innerHTML = '';
        
        if (this.desvantagensDisponiveis.length === 0) {
            listaContainer.innerHTML = '<div class="lista-vazia">Nenhuma desvantagem disponível</div>';
            return;
        }
        
        this.desvantagensDisponiveis.forEach(desvantagem => {
            const item = this.criarItemDesvantagem(desvantagem);
            listaContainer.appendChild(item);
        });
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
            
            item.innerHTML = `
                <div class="item-header">
                    <h4 class="item-nome">${desvantagem.nome}</h4>
                    <span class="item-custo negativo">${desvantagem.custo} pts</span>
                    <button class="btn-remover" title="Remover desvantagem">×</button>
                </div>
                <p class="item-descricao">${desvantagem.descricao.substring(0, 120)}${desvantagem.descricao.length > 120 ? '...' : ''}</p>
                ${desvantagem.categoria ? `<span class="item-categoria">${desvantagem.categoria}</span>` : ''}
                ${desvantagem.nomeBase !== desvantagem.nome ? `<small style="color:#95a5a6;display:block;margin-top:4px;">(${desvantagem.nomeBase})</small>` : ''}
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
        
        // Atualizar saldo total (chamar função do sistema de vantagens)
        if (window.sistemaVantagens) {
            window.sistemaVantagens.calcularSaldoTotal();
        }
    }
    
    // FUNÇÕES DE MODAL
    abrirModal(tipo) {
        this.modalAtivo = tipo;
        const modal = document.getElementById(`modal-${tipo}`);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }
    
    fecharModal(tipo) {
        const modal = document.getElementById(`modal-${tipo}`);
        if (modal) {
            modal.style.display = 'none';
        }
        
        if (tipo === this.modalAtivo) {
            this.modalAtivo = null;
            document.body.style.overflow = 'auto';
        }
        
        // Resetar seleções se for modal de desvantagem
        if (tipo === 'desvantagem') {
            this.desvantagemSelecionada = null;
            this.opcaoSelecionada = null;
        }
    }
}

// Inicializar sistema quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.sistemaDesvantagens = new SistemaDesvantagens();
    
    // Carregar peculiaridades do sistema de vantagens
    if (window.sistemaVantagens) {
        window.sistemaVantagens.atualizarListaPeculiaridades();
    }
});
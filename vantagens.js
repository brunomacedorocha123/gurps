// SISTEMA DE VANTAGENS - LÓGICA PRINCIPAL

class SistemaVantagens {
    constructor() {
        this.vantagensAdquiridas = [];
        this.vantagensDisponiveis = [];
        this.modalAtivo = null;
        this.opcaoSelecionada = null;
        this.vantagemSelecionada = null;
        
        this.init();
    }
    
    init() {
        // Carregar catálogo
        this.carregarVantagens();
        
        // Configurar eventos
        this.configurarEventos();
        
        // Atualizar interface
        this.atualizarListaDisponiveis();
        this.atualizarContadores();
        this.atualizarTotais();
    }
    
    carregarVantagens() {
        // Usar catálogo global ou carregar localmente
        if (window.catalogoVantagens) {
            this.vantagensDisponiveis = [...window.catalogoVantagens];
        } else {
            console.error("Catálogo de vantagens não encontrado!");
            this.vantagensDisponiveis = [];
        }
    }
    
    configurarEventos() {
        // Busca
        const buscaInput = document.getElementById('busca-vantagens');
        if (buscaInput) {
            buscaInput.addEventListener('input', (e) => {
                this.filtrarVantagens(e.target.value);
            });
        }
        
        // Botão adicionar peculiaridade
        const btnAddPeculiaridade = document.getElementById('btn-adicionar-peculiaridade');
        if (btnAddPeculiaridade) {
            btnAddPeculiaridade.addEventListener('click', () => {
                this.adicionarPeculiaridade();
            });
            
            // Permitir Enter no input
            const inputPeculiaridade = document.getElementById('nova-peculiaridade');
            if (inputPeculiaridade) {
                inputPeculiaridade.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.adicionarPeculiaridade();
                    }
                });
            }
        }
        
        // Modais
        this.configurarModais();
    }
    
    configurarModais() {
        // Modal de vantagem
        const modalVantagem = document.getElementById('modal-vantagem');
        const modalOpcoes = document.getElementById('modal-opcoes');
        
        if (modalVantagem) {
            // Fechar modal
            modalVantagem.querySelector('.modal-close').addEventListener('click', () => {
                this.fecharModal('vantagem');
            });
            
            modalVantagem.querySelector('.btn-cancelar').addEventListener('click', () => {
                this.fecharModal('vantagem');
            });
            
            // Confirmar adição
            modalVantagem.querySelector('.btn-confirmar').addEventListener('click', () => {
                this.adicionarVantagem();
            });
        }
        
        if (modalOpcoes) {
            // Fechar modal de opções
            modalOpcoes.querySelector('.modal-close').addEventListener('click', () => {
                this.fecharModal('opcoes');
            });
            
            modalOpcoes.querySelector('.btn-cancelar').addEventListener('click', () => {
                this.fecharModal('opcoes');
                this.abrirModal('vantagem', this.vantagemSelecionada);
            });
            
            // Confirmar seleção de opção
            modalOpcoes.querySelector('.btn-confirmar').addEventListener('click', () => {
                this.selecionarOpcao();
            });
        }
        
        // Fechar modal clicando fora
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.fecharModal(this.modalAtivo);
            }
        });
    }
    
    filtrarVantagens(termo) {
        const listaContainer = document.getElementById('lista-vantagens');
        if (!listaContainer) return;
        
        termo = termo.toLowerCase().trim();
        
        // Limpar lista atual
        listaContainer.innerHTML = '';
        
        if (this.vantagensDisponiveis.length === 0) {
            listaContainer.innerHTML = '<div class="lista-vazia">Nenhuma vantagem disponível</div>';
            return;
        }
        
        // Filtrar vantagens
        const vantagensFiltradas = this.vantagensDisponiveis.filter(vantagem => {
            return vantagem.nome.toLowerCase().includes(termo) ||
                   vantagem.descricao.toLowerCase().includes(termo) ||
                   vantagem.categoria.toLowerCase().includes(termo);
        });
        
        if (vantagensFiltradas.length === 0) {
            listaContainer.innerHTML = `<div class="lista-vazia">Nenhuma vantagem encontrada para "${termo}"</div>`;
            return;
        }
        
        // Renderizar vantagens filtradas
        vantagensFiltradas.forEach(vantagem => {
            const item = this.criarItemVantagem(vantagem);
            listaContainer.appendChild(item);
        });
        
        // Atualizar contador
        document.getElementById('contador-vantagens').textContent = 
            `${vantagensFiltradas.length} vantagem${vantagensFiltradas.length !== 1 ? 's' : ''}`;
    }
    
    criarItemVantagem(vantagem) {
        const item = document.createElement('div');
        item.className = 'item-lista';
        item.dataset.id = vantagem.id;
        
        let custoTexto = '';
        if (vantagem.temOpcoes) {
            custoTexto = 'Varia';
        } else {
            custoTexto = `${vantagem.custo} pts`;
        }
        
        item.innerHTML = `
            <div class="item-header">
                <h4 class="item-nome">${vantagem.nome}</h4>
                <span class="item-custo">${custoTexto}</span>
            </div>
            <p class="item-descricao">${vantagem.descricao.substring(0, 150)}${vantagem.descricao.length > 150 ? '...' : ''}</p>
            ${vantagem.categoria ? `<span class="item-categoria">${vantagem.categoria}</span>` : ''}
        `;
        
        item.addEventListener('click', () => {
            this.selecionarVantagem(vantagem);
        });
        
        return item;
    }
    
    selecionarVantagem(vantagem) {
        this.vantagemSelecionada = vantagem;
        
        if (vantagem.temOpcoes && vantagem.opcoes && vantagem.opcoes.length > 1) {
            // Abrir modal de opções
            this.abrirModalOpcoes(vantagem);
        } else {
            // Abrir modal direto
            this.abrirModalVantagem(vantagem);
        }
    }
    
    abrirModalOpcoes(vantagem) {
        const modal = document.getElementById('modal-opcoes');
        const corpo = document.getElementById('modal-corpo-opcoes');
        const titulo = document.getElementById('modal-titulo-opcoes');
        const btnConfirmar = modal.querySelector('.btn-confirmar');
        
        if (!modal || !corpo) return;
        
        titulo.textContent = `Escolha uma opção: ${vantagem.nome}`;
        corpo.innerHTML = '';
        
        // Criar lista de opções
        vantagem.opcoes.forEach((opcao, index) => {
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
    
    abrirModalVantagem(vantagem) {
        const modal = document.getElementById('modal-vantagem');
        const corpo = document.getElementById('modal-corpo-vantagem');
        const titulo = document.getElementById('modal-titulo-vantagem');
        const btnConfirmar = modal.querySelector('.btn-confirmar');
        
        if (!modal || !corpo) return;
        
        titulo.textContent = vantagem.nome;
        
        let custo = vantagem.custo;
        let nomeExibicao = vantagem.nome;
        
        // Se tem opções mas só uma, usar a primeira opção
        if (vantagem.temOpcoes && vantagem.opcoes && vantagem.opcoes.length === 1) {
            const opcao = vantagem.opcoes[0];
            custo = opcao.custo;
            nomeExibicao = opcao.nome;
            this.opcaoSelecionada = opcao;
        } else if (!vantagem.temOpcoes) {
            this.opcaoSelecionada = null;
        }
        
        corpo.innerHTML = `
            <div class="modal-info">
                <p><strong>Descrição:</strong> ${vantagem.descricao}</p>
                ${vantagem.categoria ? `<p><strong>Categoria:</strong> ${vantagem.categoria}</p>` : ''}
                ${vantagem.prerequisitos.length > 0 ? `<p><strong>Pré-requisitos:</strong> ${vantagem.prerequisitos.join(', ')}</p>` : ''}
                ${vantagem.notas ? `<p><strong>Notas:</strong> ${vantagem.notas}</p>` : ''}
            </div>
            <div class="pericia-custo-container">
                <div class="pericia-custo">Custo: ${custo} pontos</div>
                ${vantagem.temOpcoes && vantagem.opcoes && vantagem.opcoes.length > 1 ? 
                  '<div class="pericia-custo-adicional">(Esta vantagem tem múltiplas opções)</div>' : ''}
            </div>
        `;
        
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = 'Adicionar Vantagem';
        
        this.abrirModal('vantagem');
    }
    
    selecionarOpcao() {
        if (!this.opcaoSelecionada || !this.vantagemSelecionada) return;
        
        // Fechar modal de opções
        this.fecharModal('opcoes');
        
        // Abrir modal de vantagem com a opção selecionada
        this.abrirModalVantagem(this.vantagemSelecionada);
    }
    
    adicionarVantagem() {
        if (!this.vantagemSelecionada) return;
        
        let vantagemParaAdicionar = { ...this.vantagemSelecionada };
        let custo = 0;
        let nomeExibicao = this.vantagemSelecionada.nome;
        
        // Determinar custo e nome baseado nas opções
        if (this.vantagemSelecionada.temOpcoes) {
            if (this.opcaoSelecionada) {
                vantagemParaAdicionar.opcaoSelecionada = this.opcaoSelecionada;
                custo = this.opcaoSelecionada.custo;
                nomeExibicao = this.opcaoSelecionada.nome;
            } else if (this.vantagemSelecionada.opcoes && this.vantagemSelecionada.opcoes.length === 1) {
                vantagemParaAdicionar.opcaoSelecionada = this.vantagemSelecionada.opcoes[0];
                custo = this.vantagemSelecionada.opcoes[0].custo;
                nomeExibicao = this.vantagemSelecionada.opcoes[0].nome;
            } else {
                console.error("Nenhuma opção selecionada para vantagem com opções múltiplas");
                return;
            }
        } else {
            custo = this.vantagemSelecionada.custo;
        }
        
        // Adicionar à lista de adquiridas
        const vantagemAdquirida = {
            id: vantagemParaAdicionar.id + '-' + Date.now(),
            baseId: vantagemParaAdicionar.id,
            nome: nomeExibicao,
            nomeBase: this.vantagemSelecionada.nome,
            custo: custo,
            descricao: vantagemParaAdicionar.descricao,
            categoria: vantagemParaAdicionar.categoria,
            dataAdquisicao: new Date().toISOString(),
            opcaoSelecionada: vantagemParaAdicionar.opcaoSelecionada || null
        };
        
        this.vantagensAdquiridas.push(vantagemAdquirida);
        
        // Atualizar interface
        this.atualizarListaAdquiridas();
        this.atualizarContadores();
        this.atualizarTotais();
        
        // Fechar modal
        this.fecharModal('vantagem');
        
        // Resetar seleções
        this.vantagemSelecionada = null;
        this.opcaoSelecionada = null;
    }
    
    removerVantagem(id) {
        this.vantagensAdquiridas = this.vantagensAdquiridas.filter(v => v.id !== id);
        
        // Atualizar interface
        this.atualizarListaAdquiridas();
        this.atualizarContadores();
        this.atualizarTotais();
    }
    
    atualizarListaDisponiveis() {
        const listaContainer = document.getElementById('lista-vantagens');
        if (!listaContainer) return;
        
        listaContainer.innerHTML = '';
        
        if (this.vantagensDisponiveis.length === 0) {
            listaContainer.innerHTML = '<div class="lista-vazia">Nenhuma vantagem disponível</div>';
            return;
        }
        
        this.vantagensDisponiveis.forEach(vantagem => {
            const item = this.criarItemVantagem(vantagem);
            listaContainer.appendChild(item);
        });
    }
    
    atualizarListaAdquiridas() {
        const listaContainer = document.getElementById('vantagens-adquiridas');
        if (!listaContainer) return;
        
        listaContainer.innerHTML = '';
        
        if (this.vantagensAdquiridas.length === 0) {
            listaContainer.innerHTML = '<div class="lista-vazia">Nenhuma vantagem adquirida</div>';
            return;
        }
        
        this.vantagensAdquiridas.forEach(vantagem => {
            const item = document.createElement('div');
            item.className = 'item-lista item-adquirido';
            item.dataset.id = vantagem.id;
            
            item.innerHTML = `
                <div class="item-header">
                    <h4 class="item-nome">${vantagem.nome}</h4>
                    <span class="item-custo">${vantagem.custo} pts</span>
                    <button class="btn-remover" title="Remover vantagem">×</button>
                </div>
                <p class="item-descricao">${vantagem.descricao.substring(0, 120)}${vantagem.descricao.length > 120 ? '...' : ''}</p>
                ${vantagem.categoria ? `<span class="item-categoria">${vantagem.categoria}</span>` : ''}
                ${vantagem.nomeBase !== vantagem.nome ? `<small style="color:#95a5a6;display:block;margin-top:4px;">(${vantagem.nomeBase})</small>` : ''}
            `;
            
            // Botão remover
            const btnRemover = item.querySelector('.btn-remover');
            btnRemover.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removerVantagem(vantagem.id);
            });
            
            listaContainer.appendChild(item);
        });
    }
    
    atualizarContadores() {
        // Contador de vantagens disponíveis
        const contadorVantagens = document.getElementById('contador-vantagens');
        if (contadorVantagens) {
            contadorVantagens.textContent = `${this.vantagensDisponiveis.length} vantagem${this.vantagensDisponiveis.length !== 1 ? 's' : ''}`;
        }
        
        // Total de vantagens adquiridas
        const totalVantagensAdquiridas = document.getElementById('total-vantagens-adquiridas');
        if (totalVantagensAdquiridas) {
            const total = this.vantagensAdquiridas.reduce((sum, v) => sum + v.custo, 0);
            totalVantagensAdquiridas.textContent = `${total} pts`;
        }
    }
    
    atualizarTotais() {
        // Calcular totais
        const totalVantagens = this.vantagensAdquiridas.reduce((sum, v) => sum + v.custo, 0);
        
        // Atualizar elementos
        const elTotalVantagens = document.getElementById('total-vantagens');
        if (elTotalVantagens) {
            elTotalVantagens.textContent = `+${totalVantagens} pts`;
        }
        
        // O total geral será calculado junto com desvantagens e peculiaridades
        this.calcularSaldoTotal();
    }
    
    calcularSaldoTotal() {
        // Esta função será integrada com o sistema de desvantagens
        // Por enquanto só calcula vantagens
        const totalVantagens = this.vantagensAdquiridas.reduce((sum, v) => sum + v.custo, 0);
        
        // Tentar pegar totais de desvantagens (se o sistema estiver carregado)
        let totalDesvantagens = 0;
        if (window.sistemaDesvantagens) {
            totalDesvantagens = window.sistemaDesvantagens.desvantagensAdquiridas.reduce((sum, d) => sum + d.custo, 0);
        }
        
        // Calcular peculiaridades
        let totalPeculiaridades = 0;
        const peculiaridades = this.obterPeculiaridades();
        totalPeculiaridades = -peculiaridades.length; // -1 ponto cada
        
        // Saldo total
        const saldoTotal = totalVantagens + totalDesvantagens + totalPeculiaridades;
        
        // Atualizar elemento
        const elSaldoTotal = document.getElementById('saldo-total-vantagens');
        if (elSaldoTotal) {
            elSaldoTotal.textContent = `${saldoTotal} pts`;
            // Cor baseada no saldo
            if (saldoTotal > 0) {
                elSaldoTotal.style.color = '#27ae60';
            } else if (saldoTotal < 0) {
                elSaldoTotal.style.color = '#e74c3c';
            } else {
                elSaldoTotal.style.color = '#ffd700';
            }
        }
    }
    
    // SISTEMA DE PECULIARIDADES
    adicionarPeculiaridade() {
        const input = document.getElementById('nova-peculiaridade');
        if (!input) return;
        
        const texto = input.value.trim();
        if (!texto) {
            alert('Por favor, digite uma peculiaridade.');
            return;
        }
        
        // Verificar limite
        const peculiaridades = this.obterPeculiaridades();
        if (peculiaridades.length >= 5) {
            alert('Limite máximo de 5 peculiaridades atingido!');
            return;
        }
        
        // Adicionar peculiaridade
        peculiaridades.push({
            id: 'peculiaridade-' + Date.now(),
            texto: texto,
            data: new Date().toISOString()
        });
        
        // Salvar no localStorage
        localStorage.setItem('peculiaridades', JSON.stringify(peculiaridades));
        
        // Limpar input
        input.value = '';
        
        // Atualizar lista
        this.atualizarListaPeculiaridades();
        this.calcularSaldoTotal();
    }
    
    removerPeculiaridade(id) {
        const peculiaridades = this.obterPeculiaridades();
        const novasPeculiaridades = peculiaridades.filter(p => p.id !== id);
        
        localStorage.setItem('peculiaridades', JSON.stringify(novasPeculiaridades));
        this.atualizarListaPeculiaridades();
        this.calcularSaldoTotal();
    }
    
    obterPeculiaridades() {
        try {
            const dados = localStorage.getItem('peculiaridades');
            return dados ? JSON.parse(dados) : [];
        } catch (e) {
            console.error('Erro ao carregar peculiaridades:', e);
            return [];
        }
    }
    
    atualizarListaPeculiaridades() {
        const listaContainer = document.getElementById('lista-peculiaridades');
        const contador = document.getElementById('contador-peculiaridades');
        const totalElement = document.getElementById('total-peculiaridades');
        const custoElement = document.getElementById('custo-peculiaridades');
        
        if (!listaContainer) return;
        
        const peculiaridades = this.obterPeculiaridades();
        
        // Atualizar contadores
        if (contador) contador.textContent = `${peculiaridades.length}/5`;
        if (totalElement) totalElement.textContent = peculiaridades.length;
        if (custoElement) custoElement.textContent = `-${peculiaridades.length} pts`;
        
        // Atualizar lista
        listaContainer.innerHTML = '';
        
        if (peculiaridades.length === 0) {
            listaContainer.innerHTML = '<div class="lista-vazia">Nenhuma peculiaridade adicionada</div>';
            return;
        }
        
        peculiaridades.forEach(peculiaridade => {
            const item = document.createElement('div');
            item.className = 'peculiaridade-item';
            item.dataset.id = peculiaridade.id;
            
            item.innerHTML = `
                <div class="peculiaridade-texto">${peculiaridade.texto}</div>
                <div class="peculiaridade-custo">-1 pt</div>
                <button class="peculiaridade-remover" title="Remover peculiaridade">×</button>
            `;
            
            const btnRemover = item.querySelector('.peculiaridade-remover');
            btnRemover.addEventListener('click', () => {
                this.removerPeculiaridade(peculiaridade.id);
            });
            
            listaContainer.appendChild(item);
        });
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
        
        // Resetar seleções se for modal de vantagem
        if (tipo === 'vantagem') {
            this.vantagemSelecionada = null;
            this.opcaoSelecionada = null;
        }
    }
}

// Inicializar sistema quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.sistemaVantagens = new SistemaVantagens();
});
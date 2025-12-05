// desvantagens.js - VERSÃO QUE FUNCIONA DE VERDADE
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
        this.carregarDesvantagens();
        this.configurarEventos();
        this.atualizarTudo();
    }
    
    carregarDesvantagens() {
        if (window.catalogoDesvantagens && Array.isArray(window.catalogoDesvantagens)) {
            this.desvantagensDisponiveis = [...window.catalogoDesvantagens];
        }
    }
    
    configurarEventos() {
        const buscaDesvantagens = document.getElementById('busca-desvantagens');
        if (buscaDesvantagens) {
            buscaDesvantagens.addEventListener('input', (e) => {
                this.filtrarDesvantagens(e.target.value);
            });
        }
        
        this.configurarModais();
    }
    
    configurarModais() {
        // Modal de opções - CORREÇÃO CRÍTICA AQUI
        const modalOpcoes = document.getElementById('modal-opcoes');
        if (modalOpcoes) {
            const btnConfirmar = modalOpcoes.querySelector('.btn-confirmar');
            
            // REMOVER TODOS OS EVENTOS ANTIGOS
            const novoBtn = btnConfirmar.cloneNode(true);
            btnConfirmar.parentNode.replaceChild(novoBtn, btnConfirmar);
            
            // ADICIONAR NOVO EVENTO
            novoBtn.addEventListener('click', () => {
                console.log("✅ Botão Selecionar clicado");
                this.processarSelecaoOpcao();
            });
            
            // Fechar modal
            modalOpcoes.querySelector('.modal-close').addEventListener('click', () => {
                this.fecharModal('opcoes');
            });
            
            modalOpcoes.querySelector('.btn-cancelar').addEventListener('click', () => {
                this.fecharModal('opcoes');
            });
        }
        
        // Modal de desvantagem
        const modalDesvantagem = document.getElementById('modal-desvantagem');
        if (modalDesvantagem) {
            modalDesvantagem.querySelector('.btn-confirmar').addEventListener('click', () => {
                this.adicionarDesvantagem();
            });
        }
    }
    
    processarSelecaoOpcao() {
        console.log("🔄 Processando seleção...");
        
        // Se não tem opção selecionada, usar a primeira
        if (!this.opcaoSelecionada && this.desvantagemSelecionada?.opcoes?.length > 0) {
            this.opcaoSelecionada = this.desvantagemSelecionada.opcoes[0];
        }
        
        if (this.desvantagemSelecionada && this.opcaoSelecionada) {
            console.log(`🎯 Adicionando: ${this.opcaoSelecionada.nome}`);
            
            const desvantagemAdquirida = {
                id: this.desvantagemSelecionada.id + '-' + Date.now(),
                baseId: this.desvantagemSelecionada.id,
                nome: this.opcaoSelecionada.nome,
                nomeBase: this.desvantagemSelecionada.nome,
                custo: this.opcaoSelecionada.custo,
                descricao: this.opcaoSelecionada.descricao || this.desvantagemSelecionada.descricao,
                categoria: this.desvantagemSelecionada.categoria,
                dataAdquisicao: new Date().toISOString()
            };
            
            this.desvantagensAdquiridas.push(desvantagemAdquirida);
            this.atualizarTudo();
            this.fecharModal('opcoes');
            
            // Resetar
            this.desvantagemSelecionada = null;
            this.opcaoSelecionada = null;
        }
    }
    
    selecionarDesvantagem(desvantagem) {
        this.desvantagemSelecionada = desvantagem;
        this.opcaoSelecionada = null;
        
        if (desvantagem.temOpcoes && desvantagem.opcoes?.length > 1) {
            this.abrirModalOpcoes(desvantagem);
        } else {
            this.abrirModalDesvantagem(desvantagem);
        }
    }
    
    abrirModalOpcoes(desvantagem) {
        const modal = document.getElementById('modal-opcoes');
        const corpo = document.getElementById('modal-corpo-opcoes');
        const titulo = document.getElementById('modal-titulo-opcoes');
        const btnConfirmar = modal.querySelector('.btn-confirmar');
        
        titulo.textContent = `Escolha: ${desvantagem.nome}`;
        corpo.innerHTML = '';
        
        // CORREÇÃO: HABILITAR O BOTÃO
        btnConfirmar.disabled = false;
        
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
                // Remover seleção anterior
                document.querySelectorAll('.opcao-item').forEach(item => {
                    item.classList.remove('selecionada');
                });
                // Selecionar esta
                opcaoItem.classList.add('selecionada');
                this.opcaoSelecionada = opcao;
            });
            
            corpo.appendChild(opcaoItem);
        });
        
        // Selecionar primeira automaticamente
        if (desvantagem.opcoes.length > 0) {
            this.opcaoSelecionada = desvantagem.opcoes[0];
            setTimeout(() => {
                const primeiraOpcao = corpo.querySelector('.opcao-item');
                if (primeiraOpcao) primeiraOpcao.classList.add('selecionada');
            }, 10);
        }
        
        this.abrirModal('opcoes');
    }
    
    abrirModalDesvantagem(desvantagem) {
        const modal = document.getElementById('modal-desvantagem');
        const corpo = document.getElementById('modal-corpo-desvantagem');
        const titulo = document.getElementById('modal-titulo-desvantagem');
        const btnConfirmar = modal.querySelector('.btn-confirmar');
        
        titulo.textContent = desvantagem.nome;
        
        let custo = desvantagem.custo || 0;
        if (desvantagem.temOpcoes && desvantagem.opcoes?.length === 1) {
            custo = desvantagem.opcoes[0].custo;
        }
        
        corpo.innerHTML = `
            <div class="modal-info">
                <p><strong>Descrição:</strong> ${desvantagem.descricao || ''}</p>
                ${desvantagem.categoria ? `<p><strong>Categoria:</strong> ${desvantagem.categoria}</p>` : ''}
            </div>
            <div class="pericia-custo-container">
                <div class="pericia-custo">Valor: ${custo} pontos</div>
            </div>
        `;
        
        btnConfirmar.disabled = false;
        this.abrirModal('desvantagem');
    }
    
    adicionarDesvantagem() {
        if (!this.desvantagemSelecionada) return;
        
        let custo = this.desvantagemSelecionada.custo || 0;
        let nome = this.desvantagemSelecionada.nome;
        
        if (this.desvantagemSelecionada.temOpcoes) {
            if (this.opcaoSelecionada) {
                custo = this.opcaoSelecionada.custo;
                nome = this.opcaoSelecionada.nome;
            } else if (this.desvantagemSelecionada.opcoes?.length === 1) {
                custo = this.desvantagemSelecionada.opcoes[0].custo;
                nome = this.desvantagemSelecionada.opcoes[0].nome;
            }
        }
        
        const desvantagemAdquirida = {
            id: this.desvantagemSelecionada.id + '-' + Date.now(),
            baseId: this.desvantagemSelecionada.id,
            nome: nome,
            nomeBase: this.desvantagemSelecionada.nome,
            custo: custo,
            descricao: this.desvantagemSelecionada.descricao,
            categoria: this.desvantagemSelecionada.categoria,
            dataAdquisicao: new Date().toISOString()
        };
        
        this.desvantagensAdquiridas.push(desvantagemAdquirida);
        this.atualizarTudo();
        this.fecharModal('desvantagem');
        this.desvantagemSelecionada = null;
        this.opcaoSelecionada = null;
    }
    
    atualizarTudo() {
        this.atualizarListaAdquiridas();
        this.atualizarContadores();
        this.atualizarTotais();
        if (window.sistemaVantagens) window.sistemaVantagens.atualizarTotais();
    }
    
    atualizarListaAdquiridas() {
        const listaContainer = document.getElementById('desvantagens-adquiridas');
        if (!listaContainer) return;
        
        listaContainer.innerHTML = '';
        
        this.desvantagensAdquiridas.forEach(desvantagem => {
            const item = document.createElement('div');
            item.className = 'item-lista item-adquirido desvantagem-adquirida';
            
            const custoClass = desvantagem.custo < 0 ? 'negativo' : '';
            
            item.innerHTML = `
                <div class="item-header">
                    <h4 class="item-nome">${desvantagem.nome}</h4>
                    <span class="item-custo ${custoClass}">${desvantagem.custo} pts</span>
                    <button class="btn-remover">×</button>
                </div>
                <p class="item-descricao">${desvantagem.descricao || ''}</p>
            `;
            
            item.querySelector('.btn-remover').addEventListener('click', () => {
                this.desvantagensAdquiridas = this.desvantagensAdquiridas.filter(d => d.id !== desvantagem.id);
                this.atualizarTudo();
            });
            
            listaContainer.appendChild(item);
        });
    }
    
    atualizarContadores() {
        const totalDesvantagensAdquiridas = document.getElementById('total-desvantagens-adquiridas');
        if (totalDesvantagensAdquiridas) {
            const total = this.desvantagensAdquiridas.reduce((sum, d) => sum + d.custo, 0);
            totalDesvantagensAdquiridas.textContent = `${total} pts`;
        }
    }
    
    atualizarTotais() {
        const totalDesvantagens = this.desvantagensAdquiridas.reduce((sum, d) => sum + d.custo, 0);
        const elTotalDesvantagens = document.getElementById('total-desvantagens');
        if (elTotalDesvantagens) {
            elTotalDesvantagens.textContent = `${totalDesvantagens} pts`;
        }
    }
    
    abrirModal(tipo) {
        this.modalAtivo = tipo;
        const modal = document.getElementById(`modal-${tipo}`);
        if (modal) {
            modal.style.display = 'block';
        }
    }
    
    fecharModal(tipo) {
        const modal = document.getElementById(`modal-${tipo}`);
        if (modal) {
            modal.style.display = 'none';
        }
        this.modalAtivo = null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sistemaDesvantagens = new SistemaDesvantagens();
});
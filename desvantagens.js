// desvantagens.js - VERSÃO FINAL SIMPLES E FUNCIONAL
console.log("🚀 desvantagens.js carregando...");

// BLOQUEAR ALERT PROBLEMÁTICO
const originalAlert = window.alert;
window.alert = function(message) {
    if (message && message.includes("selecione uma opção primeiro")) {
        console.warn("⚠️ Alert bloqueado:", message);
        return;
    }
    return originalAlert(message);
};

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
        console.log("✅ SistemaDesvantagens pronto!");
    }
    
    carregarDesvantagens() {
        if (window.catalogoDesvantagens && Array.isArray(window.catalogoDesvantagens)) {
            this.desvantagensDisponiveis = [...window.catalogoDesvantagens];
        } else {
            this.desvantagensDisponiveis = [];
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
        setTimeout(() => this.configurarEventosLista(), 100);
    }
    
    configurarEventosLista() {
        const itens = document.querySelectorAll('#lista-desvantagens .item-lista');
        itens.forEach(item => {
            if (item.dataset.initialized === "true") return;
            
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                const desvantagem = this.desvantagensDisponiveis.find(d => d.id === id);
                if (desvantagem) this.selecionarDesvantagem(desvantagem);
            });
            
            item.dataset.initialized = "true";
        });
    }
    
    configurarModais() {
        // Modal de desvantagem
        const modalDesvantagem = document.getElementById('modal-desvantagem');
        if (modalDesvantagem) {
            modalDesvantagem.querySelector('.modal-close').addEventListener('click', () => {
                this.fecharModal('desvantagem');
            });
            
            modalDesvantagem.querySelector('.btn-cancelar').addEventListener('click', () => {
                this.fecharModal('desvantagem');
            });
            
            const btnConfirmar = modalDesvantagem.querySelector('.btn-confirmar');
            if (btnConfirmar) {
                btnConfirmar.addEventListener('click', () => this.adicionarDesvantagem());
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
                    if (this.desvantagemSelecionada) {
                        setTimeout(() => this.abrirModalDesvantagem(this.desvantagemSelecionada), 50);
                    }
                });
            }
            
            const btnConfirmarOpcao = modalOpcoes.querySelector('.btn-confirmar');
            if (btnConfirmarOpcao) {
                // REMOVER QUALQUER EVENTO ANTIGO
                btnConfirmarOpcao.replaceWith(btnConfirmarOpcao.cloneNode(true));
                const novoBtn = modalOpcoes.querySelector('.btn-confirmar');
                
                novoBtn.addEventListener('click', () => {
                    console.log("✅ Botão Selecionar clicado");
                    this.selecionarOpcao();
                });
            }
        }
        
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.fecharModal(this.modalAtivo);
            }
        });
    }
    
    selecionarOpcao() {
        console.log("🔄 Processando seleção de opção...");
        
        // Se não tem opção selecionada, usar a primeira
        if (!this.opcaoSelecionada && this.desvantagemSelecionada?.opcoes?.length > 0) {
            const opcaoSelecionadaDOM = document.querySelector('.opcao-item.selecionada');
            if (opcaoSelecionadaDOM && opcaoSelecionadaDOM.dataset.index) {
                const index = parseInt(opcaoSelecionadaDOM.dataset.index);
                this.opcaoSelecionada = this.desvantagemSelecionada.opcoes[index];
            } else {
                this.opcaoSelecionada = this.desvantagemSelecionada.opcoes[0];
            }
        }
        
        if (this.desvantagemSelecionada && this.opcaoSelecionada) {
            console.log(`🎯 Adicionando: ${this.opcaoSelecionada.nome}`);
            this.fecharModal('opcoes');
            this.adicionarDesvantagemComOpcao();
        }
    }
    
    filtrarDesvantagens(termo) {
        const listaContainer = document.getElementById('lista-desvantagens');
        if (!listaContainer) return;
        
        termo = termo.toLowerCase().trim();
        listaContainer.innerHTML = '';
        
        if (this.desvantagensDisponiveis.length === 0) {
            listaContainer.innerHTML = '<div class="lista-vazia">Nenhuma desvantagem disponível</div>';
            return;
        }
        
        const desvantagensFiltradas = this.desvantagensDisponiveis.filter(d => 
            d.nome.toLowerCase().includes(termo) ||
            (d.descricao && d.descricao.toLowerCase().includes(termo))
        );
        
        if (desvantagensFiltradas.length === 0) {
            listaContainer.innerHTML = `<div class="lista-vazia">Nenhuma desvantagem encontrada para "${termo}"</div>`;
            return;
        }
        
        desvantagensFiltradas.forEach(desvantagem => {
            const item = this.criarItemDesvantagem(desvantagem);
            listaContainer.appendChild(item);
        });
        
        this.configurarEventosLista();
        
        const contador = document.getElementById('contador-desvantagens');
        if (contador) {
            contador.textContent = `${desvantagensFiltradas.length} desvantagens`;
        }
    }
    
    criarItemDesvantagem(desvantagem) {
        const item = document.createElement('div');
        item.className = 'item-lista';
        item.dataset.id = desvantagem.id;
        
        const custoTexto = desvantagem.temOpcoes ? 'Varia' : `${desvantagem.custo} pts`;
        const custoClass = desvantagem.custo < 0 ? 'negativo' : '';
        
        item.innerHTML = `
            <div class="item-header">
                <h4 class="item-nome">${desvantagem.nome}</h4>
                <span class="item-custo ${custoClass}">${custoTexto}</span>
            </div>
            <p class="item-descricao">${desvantagem.descricao?.substring(0, 150) || ''}${desvantagem.descricao?.length > 150 ? '...' : ''}</p>
            ${desvantagem.categoria ? `<span class="item-categoria">${desvantagem.categoria}</span>` : ''}
        `;
        
        return item;
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
        
        if (!modal || !corpo) return;
        
        titulo.textContent = `Escolha uma opção: ${desvantagem.nome}`;
        corpo.innerHTML = '';
        
        // IMPORTANTE: Habilitar o botão imediatamente
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
                document.querySelectorAll('.opcao-item').forEach(item => {
                    item.classList.remove('selecionada');
                });
                opcaoItem.classList.add('selecionada');
                this.opcaoSelecionada = opcao;
            });
            
            // Selecionar primeira automaticamente
            if (index === 0) {
                opcaoItem.classList.add('selecionada');
                this.opcaoSelecionada = opcao;
            }
            
            corpo.appendChild(opcaoItem);
        });
        
        this.abrirModal('opcoes');
    }
    
    abrirModalDesvantagem(desvantagem) {
        const modal = document.getElementById('modal-desvantagem');
        if (!modal) return;
        
        const corpo = document.getElementById('modal-corpo-desvantagem');
        const titulo = document.getElementById('modal-titulo-desvantagem');
        const btnConfirmar = modal.querySelector('.btn-confirmar');
        
        titulo.textContent = desvantagem.nome;
        
        let custo = desvantagem.custo || 0;
        let nomeExibicao = desvantagem.nome;
        
        if (desvantagem.temOpcoes && desvantagem.opcoes?.length === 1) {
            const opcao = desvantagem.opcoes[0];
            custo = opcao.custo;
            nomeExibicao = opcao.nome;
            this.opcaoSelecionada = opcao;
        }
        
        corpo.innerHTML = `
            <div class="modal-info">
                <p><strong>Descrição:</strong> ${desvantagem.descricao || ''}</p>
                ${desvantagem.categoria ? `<p><strong>Categoria:</strong> ${desvantagem.categoria}</p>` : ''}
            </div>
            <div class="pericia-custo-container">
                <div class="pericia-custo ${custo < 0 ? 'negativo' : ''}">Valor: ${custo} pontos</div>
            </div>
        `;
        
        btnConfirmar.disabled = false;
        this.abrirModal('desvantagem');
    }
    
    adicionarDesvantagemComOpcao() {
        if (!this.desvantagemSelecionada || !this.opcaoSelecionada) return;
        
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
        this.desvantagemSelecionada = null;
        this.opcaoSelecionada = null;
    }
    
    adicionarDesvantagem() {
        if (!this.desvantagemSelecionada) return;
        
        let custo = this.desvantagemSelecionada.custo || 0;
        let nomeExibicao = this.desvantagemSelecionada.nome;
        
        if (this.desvantagemSelecionada.temOpcoes) {
            if (this.opcaoSelecionada) {
                custo = this.opcaoSelecionada.custo;
                nomeExibicao = this.opcaoSelecionada.nome;
            } else if (this.desvantagemSelecionada.opcoes?.length === 1) {
                const opcao = this.desvantagemSelecionada.opcoes[0];
                custo = opcao.custo;
                nomeExibicao = opcao.nome;
            }
        }
        
        const desvantagemAdquirida = {
            id: this.desvantagemSelecionada.id + '-' + Date.now(),
            baseId: this.desvantagemSelecionada.id,
            nome: nomeExibicao,
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
    
    removerDesvantagem(id) {
        this.desvantagensAdquiridas = this.desvantagensAdquiridas.filter(d => d.id !== id);
        this.atualizarTudo();
    }
    
    atualizarTudo() {
        this.atualizarListaDisponiveis();
        this.atualizarListaAdquiridas();
        this.atualizarContadores();
        this.atualizarTotais();
        if (window.sistemaVantagens) window.sistemaVantagens.atualizarTotais();
    }
    
    atualizarListaDisponiveis() {
        const listaContainer = document.getElementById('lista-desvantagens');
        if (!listaContainer) return;
        
        listaContainer.innerHTML = '';
        this.desvantagensDisponiveis.forEach(desvantagem => {
            const item = this.criarItemDesvantagem(desvantagem);
            listaContainer.appendChild(item);
        });
        this.configurarEventosLista();
    }
    
    atualizarListaAdquiridas() {
        const listaContainer = document.getElementById('desvantagens-adquiridas');
        if (!listaContainer) return;
        
        listaContainer.innerHTML = '';
        
        this.desvantagensAdquiridas.forEach(desvantagem => {
            const item = document.createElement('div');
            item.className = 'item-lista item-adquirido desvantagem-adquirida';
            item.dataset.id = desvantagem.id;
            
            const custoClass = desvantagem.custo < 0 ? 'negativo' : '';
            
            item.innerHTML = `
                <div class="item-header">
                    <h4 class="item-nome">${desvantagem.nome}</h4>
                    <span class="item-custo ${custoClass}">${desvantagem.custo} pts</span>
                    <button class="btn-remover" title="Remover desvantagem">×</button>
                </div>
                <p class="item-descricao">${desvantagem.descricao?.substring(0, 120) || ''}${desvantagem.descricao?.length > 120 ? '...' : ''}</p>
                ${desvantagem.categoria ? `<span class="item-categoria">${desvantagem.categoria}</span>` : ''}
                ${desvantagem.nomeBase && desvantagem.nomeBase !== desvantagem.nome ? 
                  `<small style="color:#95a5a6;display:block;margin-top:4px;">(${desvantagem.nomeBase})</small>` : ''}
            `;
            
            const btnRemover = item.querySelector('.btn-remover');
            btnRemover.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removerDesvantagem(desvantagem.id);
            });
            
            listaContainer.appendChild(item);
        });
    }
    
    atualizarContadores() {
        const contadorDesvantagens = document.getElementById('contador-desvantagens');
        if (contadorDesvantagens) {
            contadorDesvantagens.textContent = `${this.desvantagensDisponiveis.length} desvantagens`;
        }
        
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
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sistemaDesvantagens = new SistemaDesvantagens();
});

console.log("📄 desvantagens.js carregado");
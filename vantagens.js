// vantagens.js - VERSÃO DEFINITIVA 100% FUNCIONAL - COM PECULIARIDADES INTEGRADAS
class SistemaVantagens {
    constructor() {
        this.vantagensAdquiridas = [];
        this.vantagensDisponiveis = [];
        this.vantagemSelecionada = null;
        this.opcaoSelecionada = null;
        this.peculiaridades = [];
        this.eventListeners = new Map();
        
        this.init();
    }
    
    init() {
        this.carregarCatalogoVantagens();
        this.carregarPeculiaridades();
        this.configurarEventosPermanentes();
        this.renderizarListaVantagens();
        this.atualizarInterface();
        this.configurarParaDashboard();
    }
    
    carregarCatalogoVantagens() {
        if (window.catalogoVantagens && Array.isArray(window.catalogoVantagens)) {
            this.vantagensDisponiveis = [...window.catalogoVantagens];
        } else {
            this.vantagensDisponiveis = [];
            console.warn('Catálogo de vantagens não encontrado');
        }
    }
    
    carregarPeculiaridades() {
        try {
            const dados = localStorage.getItem('peculiaridades');
            this.peculiaridades = dados ? JSON.parse(dados) : [];
        } catch (e) {
            console.error('Erro ao carregar peculiaridades:', e);
            this.peculiaridades = [];
        }
    }
    
    configurarParaDashboard() {
        // Configurar para enviar eventos ao dashboard
        this.dispararEventoDashboardInicial();
    }
    
    dispararEventoDashboardInicial() {
        // Disparar evento inicial para o dashboard
        setTimeout(() => {
            this.dispararEventoDashboard();
        }, 300);
    }
    
    configurarEventosPermanentes() {
        // Busca vantagens
        const buscaVantagens = document.getElementById('busca-vantagens');
        if (buscaVantagens) {
            buscaVantagens.addEventListener('input', (e) => {
                this.filtrarVantagens(e.target.value);
            });
        }
        
        // Peculiaridades
        const btnAddPeculiaridade = document.getElementById('btn-adicionar-peculiaridade');
        if (btnAddPeculiaridade) {
            btnAddPeculiaridade.addEventListener('click', () => {
                this.adicionarPeculiaridade();
            });
            
            const inputPeculiaridade = document.getElementById('nova-peculiaridade');
            if (inputPeculiaridade) {
                inputPeculiaridade.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.adicionarPeculiaridade();
                    }
                });
            }
        }
        
        // Fechar modal clicando fora
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.fecharModalAtivo();
            }
        });
        
        // Tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.fecharModalAtivo();
            }
        });
        
        // Configurar eventos dos modais UMA VEZ
        this.configurarModalVantagem();
        this.configurarModalOpcoes();
    }
    
    configurarModalVantagem() {
        const modal = document.getElementById('modal-vantagem');
        if (!modal) return;
        
        // Botão fechar (X)
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                this.fecharModal('vantagem');
            };
        }
        
        // Botão cancelar
        const cancelBtn = modal.querySelector('.btn-cancelar');
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                this.fecharModal('vantagem');
            };
        }
        
        // Botão confirmar
        const confirmBtn = modal.querySelector('.btn-confirmar');
        if (confirmBtn) {
            confirmBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.confirmarAdicionarVantagem();
            };
        }
    }
    
    configurarModalOpcoes() {
        const modal = document.getElementById('modal-opcoes');
        if (!modal) return;
        
        // Botão fechar (X)
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                this.fecharModal('opcoes');
            };
        }
        
        // Botão cancelar/voltar
        const cancelBtn = modal.querySelector('.btn-cancelar');
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                this.fecharModal('opcoes');
            };
        }
        
        // Botão selecionar
        const confirmBtn = modal.querySelector('.btn-confirmar');
        if (confirmBtn) {
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
            
            newConfirmBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.confirmarSelecaoOpcao();
            };
            
            newConfirmBtn.ontouchstart = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.confirmarSelecaoOpcao();
            };
        }
    }
    
    // ===== SISTEMA DE PECULIARIDADES =====
    adicionarPeculiaridade() {
        const input = document.getElementById('nova-peculiaridade');
        if (!input) return;
        
        const texto = input.value.trim();
        if (!texto) {
            alert('Por favor, digite uma peculiaridade.');
            return;
        }
        
        if (this.peculiaridades.length >= 5) {
            alert('Limite máximo de 5 peculiaridades atingido!');
            return;
        }
        
        const novaPeculiaridade = {
            id: 'peculiaridade-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            texto: texto,
            data: new Date().toISOString()
        };
        
        this.peculiaridades.push(novaPeculiaridade);
        this.salvarPeculiaridades();
        
        input.value = '';
        input.focus();
        
        this.atualizarListaPeculiaridades();
        this.atualizarTotais();
        
        console.log(`Peculiaridade adicionada: "${texto}"`);
    }
    
    removerPeculiaridade(id) {
        if (confirm('Remover esta peculiaridade?')) {
            this.peculiaridades = this.peculiaridades.filter(p => p.id !== id);
            this.salvarPeculiaridades();
            this.atualizarListaPeculiaridades();
            this.atualizarTotais();
        }
    }
    
    salvarPeculiaridades() {
        localStorage.setItem('peculiaridades', JSON.stringify(this.peculiaridades));
    }
    
    atualizarListaPeculiaridades() {
        const listaContainer = document.getElementById('lista-peculiaridades');
        const contador = document.getElementById('contador-peculiaridades');
        const totalElement = document.getElementById('total-peculiaridades');
        const custoElement = document.getElementById('custo-peculiaridades');
        
        if (!listaContainer) return;
        
        if (contador) contador.textContent = `${this.peculiaridades.length}/5`;
        if (totalElement) totalElement.textContent = this.peculiaridades.length;
        if (custoElement) custoElement.textContent = `-${this.peculiaridades.length} pts`;
        
        listaContainer.innerHTML = '';
        
        if (this.peculiaridades.length === 0) {
            listaContainer.innerHTML = '<div class="lista-vazia">Nenhuma peculiaridade adicionada</div>';
            return;
        }
        
        this.peculiaridades.forEach(peculiaridade => {
            const item = document.createElement('div');
            item.className = 'peculiaridade-item';
            item.dataset.id = peculiaridade.id;
            
            item.innerHTML = `
                <div class="peculiaridade-texto">${peculiaridade.texto}</div>
                <div class="peculiaridade-custo">-1 pt</div>
                <button class="peculiaridade-remover" title="Remover peculiaridade">×</button>
            `;
            
            const btnRemover = item.querySelector('.peculiaridade-remover');
            btnRemover.onclick = (e) => {
                e.stopPropagation();
                this.removerPeculiaridade(peculiaridade.id);
            };
            
            listaContainer.appendChild(item);
        });
        
        this.dispararEventoDashboard();
    }
    
    // ===== COMUNICAÇÃO COM DASHBOARD =====
    dispararEventoDashboard() {
        const totalVantagens = this.calcularTotalVantagens();
        const totalDesvantagens = this.calcularTotalDesvantagens();
        const totalPeculiaridades = this.calcularTotalPeculiaridades();
        const totalGeral = totalVantagens + totalDesvantagens + totalPeculiaridades;
        
        const evento = new CustomEvent('vantagensDesvantagensAtualizadas', {
            detail: {
                vantagens: totalVantagens,
                desvantagens: Math.abs(totalDesvantagens + totalPeculiaridades),
                peculiaridades: Math.abs(totalPeculiaridades),
                totalGeral: totalGeral,
                possuiPeculiaridades: this.peculiaridades.length > 0
            }
        });
        
        document.dispatchEvent(evento);
    }
    
    calcularTotalVantagens() {
        return this.vantagensAdquiridas.reduce((sum, v) => sum + v.custo, 0);
    }
    
    calcularTotalDesvantagens() {
        if (window.sistemaDesvantagens && window.sistemaDesvantagens.desvantagensAdquiridas) {
            return window.sistemaDesvantagens.desvantagensAdquiridas.reduce((sum, d) => sum + d.custo, 0);
        }
        return 0;
    }
    
    calcularTotalPeculiaridades() {
        return -this.peculiaridades.length;
    }
    
    // ===== FUNÇÕES EXISTENTES (COMPLETAS) =====
    filtrarVantagens(termo) {
        const listaContainer = document.getElementById('lista-vantagens');
        if (!listaContainer) return;
        
        termo = termo.toLowerCase().trim();
        listaContainer.innerHTML = '';
        
        if (this.vantagensDisponiveis.length === 0) {
            listaContainer.innerHTML = '<div class="lista-vazia">Nenhuma vantagem disponível</div>';
            return;
        }
        
        const vantagensFiltradas = this.vantagensDisponiveis.filter(vantagem => {
            return vantagem.nome.toLowerCase().includes(termo) ||
                   (vantagem.descricao && vantagem.descricao.toLowerCase().includes(termo)) ||
                   (vantagem.categoria && vantagem.categoria.toLowerCase().includes(termo));
        });
        
        if (vantagensFiltradas.length === 0) {
            listaContainer.innerHTML = `<div class="lista-vazia">Nenhuma vantagem encontrada para "${termo}"</div>`;
            return;
        }
        
        vantagensFiltradas.forEach(vantagem => {
            const item = this.criarItemVantagem(vantagem);
            listaContainer.appendChild(item);
        });
        
        const contador = document.getElementById('contador-vantagens');
        if (contador) {
            contador.textContent = `${vantagensFiltradas.length} vantagem${vantagensFiltradas.length !== 1 ? 's' : ''}`;
        }
    }
    
    criarItemVantagem(vantagem) {
        const item = document.createElement('div');
        item.className = 'item-lista';
        item.dataset.id = vantagem.id;
        
        let custoTexto = vantagem.temOpcoes ? 'Varia' : `${vantagem.custo} pts`;
        
        item.innerHTML = `
            <div class="item-header">
                <h4 class="item-nome">${vantagem.nome}</h4>
                <span class="item-custo">${custoTexto}</span>
            </div>
            <p class="item-descricao">${vantagem.descricao ? vantagem.descricao.substring(0, 150) + (vantagem.descricao.length > 150 ? '...' : '') : ''}</p>
            ${vantagem.categoria ? `<span class="item-categoria">${vantagem.categoria}</span>` : ''}
        `;
        
        item.onclick = (e) => {
            e.preventDefault();
            this.selecionarVantagem(vantagem);
        };
        
        return item;
    }
    
    selecionarVantagem(vantagem) {
        this.vantagemSelecionada = vantagem;
        this.opcaoSelecionada = null;
        
        if (vantagem.temOpcoes && vantagem.opcoes && vantagem.opcoes.length > 1) {
            this.abrirModalOpcoes(vantagem);
        } else {
            this.abrirModalVantagem(vantagem);
        }
    }
    
    abrirModalOpcoes(vantagem) {
        const modal = document.getElementById('modal-opcoes');
        if (!modal) return;
        
        const corpo = document.getElementById('modal-corpo-opcoes');
        const titulo = document.getElementById('modal-titulo-opcoes');
        const btnSelecionar = modal.querySelector('.btn-confirmar');
        
        if (!corpo || !titulo || !btnSelecionar) return;
        
        titulo.textContent = `Escolha uma opção: ${vantagem.nome}`;
        corpo.innerHTML = '';
        this.opcaoSelecionada = null;
        
        vantagem.opcoes.forEach((opcao, index) => {
            const opcaoItem = document.createElement('div');
            opcaoItem.className = 'opcao-item';
            opcaoItem.dataset.index = index;
            
            opcaoItem.innerHTML = `
                <div class="opcao-header">
                    <h4 class="opcao-nome">${opcao.nome}</h4>
                    <span class="opcao-custo">${opcao.custo} pts</span>
                </div>
                <p class="opcao-descricao">${opcao.descricao || ''}</p>
            `;
            
            opcaoItem.onclick = (e) => {
                e.preventDefault();
                
                document.querySelectorAll('.opcao-item').forEach(item => {
                    item.classList.remove('selecionada');
                });
                
                opcaoItem.classList.add('selecionada');
                this.opcaoSelecionada = opcao;
                
                const currentBtn = document.querySelector('#modal-opcoes .btn-confirmar');
                if (currentBtn) {
                    currentBtn.disabled = false;
                }
            };
            
            corpo.appendChild(opcaoItem);
        });
        
        btnSelecionar.disabled = true;
        this.reconfigurarBotaoSelecionar();
        this.abrirModal('opcoes');
    }
    
    reconfigurarBotaoSelecionar() {
        const modal = document.getElementById('modal-opcoes');
        if (!modal) return;
        
        const btnSelecionar = modal.querySelector('.btn-confirmar');
        if (!btnSelecionar) return;
        
        const newBtn = btnSelecionar.cloneNode(true);
        btnSelecionar.parentNode.replaceChild(newBtn, btnSelecionar);
        
        newBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.confirmarSelecaoOpcao();
        };
        
        newBtn.ontouchstart = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.confirmarSelecaoOpcao();
        };
    }
    
    abrirModalVantagem(vantagem) {
        const modal = document.getElementById('modal-vantagem');
        if (!modal) return;
        
        const corpo = document.getElementById('modal-corpo-vantagem');
        const titulo = document.getElementById('modal-titulo-vantagem');
        const btnConfirmar = modal.querySelector('.btn-confirmar');
        
        if (!corpo || !titulo || !btnConfirmar) return;
        
        titulo.textContent = vantagem.nome;
        
        let custo = vantagem.custo || 0;
        
        if (vantagem.temOpcoes && vantagem.opcoes && vantagem.opcoes.length === 1) {
            const opcao = vantagem.opcoes[0];
            custo = opcao.custo;
            this.opcaoSelecionada = opcao;
        } else if (!vantagem.temOpcoes) {
            this.opcaoSelecionada = null;
        }
        
        corpo.innerHTML = `
            <div class="modal-info">
                <p><strong>Descrição:</strong> ${vantagem.descricao || ''}</p>
                ${vantagem.categoria ? `<p><strong>Categoria:</strong> ${vantagem.categoria}</p>` : ''}
                ${vantagem.prerequisitos && vantagem.prerequisitos.length > 0 ? 
                  `<p><strong>Pré-requisitos:</strong> ${vantagem.prerequisitos.join(', ')}</p>` : ''}
                ${vantagem.notas ? `<p><strong>Notas:</strong> ${vantagem.notas}</p>` : ''}
            </div>
            <div class="pericia-custo-container">
                <div class="pericia-custo">Custo: ${custo} pontos</div>
                ${vantagem.temOpcoes && vantagem.opcoes && vantagem.opcoes.length > 1 ? 
                  '<div class="pericia-custo-adicional">(Esta vantagem tem múltiplas opções)</div>' : ''}
            </div>
        `;
        
        btnConfirmar.disabled = false;
        this.abrirModal('vantagem');
    }
    
    confirmarSelecaoOpcao() {
        if (!this.opcaoSelecionada || !this.vantagemSelecionada) {
            alert('Por favor, selecione uma opção primeiro.');
            return;
        }
        
        this.adicionarVantagemComOpcao();
        this.fecharModal('opcoes');
    }
    
    confirmarAdicionarVantagem() {
        if (!this.vantagemSelecionada) return;
        
        if (this.vantagemSelecionada.temOpcoes) {
            if (this.opcaoSelecionada) {
                this.adicionarVantagemComOpcao();
            } else if (this.vantagemSelecionada.opcoes && this.vantagemSelecionada.opcoes.length === 1) {
                this.opcaoSelecionada = this.vantagemSelecionada.opcoes[0];
                this.adicionarVantagemComOpcao();
            } else {
                alert('Por favor, selecione uma opção primeiro.');
                return;
            }
        } else {
            this.adicionarVantagemSemOpcao();
        }
        
        this.fecharModal('vantagem');
    }
    
    adicionarVantagemComOpcao() {
        const vantagemAdquirida = {
            id: `${this.vantagemSelecionada.id}-${Date.now()}`,
            baseId: this.vantagemSelecionada.id,
            nome: this.opcaoSelecionada.nome,
            nomeBase: this.vantagemSelecionada.nome,
            custo: this.opcaoSelecionada.custo,
            descricao: this.opcaoSelecionada.descricao || this.vantagemSelecionada.descricao,
            categoria: this.vantagemSelecionada.categoria,
            dataAdquisicao: new Date().toISOString(),
            opcaoSelecionada: this.opcaoSelecionada
        };
        
        this.vantagensAdquiridas.push(vantagemAdquirida);
        this.atualizarInterface();
        this.vantagemSelecionada = null;
        this.opcaoSelecionada = null;
        
        alert(`✅ Vantagem "${vantagemAdquirida.nome}" adicionada por ${vantagemAdquirida.custo} pontos!`);
    }
    
    adicionarVantagemSemOpcao() {
        const vantagemAdquirida = {
            id: `${this.vantagemSelecionada.id}-${Date.now()}`,
            baseId: this.vantagemSelecionada.id,
            nome: this.vantagemSelecionada.nome,
            nomeBase: this.vantagemSelecionada.nome,
            custo: this.vantagemSelecionada.custo,
            descricao: this.vantagemSelecionada.descricao,
            categoria: this.vantagemSelecionada.categoria,
            dataAdquisicao: new Date().toISOString(),
            opcaoSelecionada: null
        };
        
        this.vantagensAdquiridas.push(vantagemAdquirida);
        this.atualizarInterface();
        this.vantagemSelecionada = null;
        
        alert(`✅ Vantagem "${vantagemAdquirida.nome}" adicionada por ${vantagemAdquirida.custo} pontos!`);
    }
    
    removerVantagem(id) {
        if (confirm('Remover esta vantagem?')) {
            this.vantagensAdquiridas = this.vantagensAdquiridas.filter(v => v.id !== id);
            this.atualizarInterface();
        }
    }
    
    renderizarListaVantagens() {
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
    
    atualizarInterface() {
        this.atualizarListaAdquiridas();
        this.atualizarContadores();
        this.atualizarTotais();
        this.atualizarListaPeculiaridades();
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
                <p class="item-descricao">${vantagem.descricao ? vantagem.descricao.substring(0, 120) + (vantagem.descricao.length > 120 ? '...' : '') : ''}</p>
                ${vantagem.categoria ? `<span class="item-categoria">${vantagem.categoria}</span>` : ''}
                ${vantagem.nomeBase && vantagem.nomeBase !== vantagem.nome ? 
                  `<small style="color:#95a5a6;display:block;margin-top:4px;">(${vantagem.nomeBase})</small>` : ''}
            `;
            
            const btnRemover = item.querySelector('.btn-remover');
            btnRemover.onclick = (e) => {
                e.stopPropagation();
                this.removerVantagem(vantagem.id);
            };
            
            listaContainer.appendChild(item);
        });
    }
    
    atualizarContadores() {
        const contadorVantagens = document.getElementById('contador-vantagens');
        if (contadorVantagens) {
            contadorVantagens.textContent = `${this.vantagensDisponiveis.length} vantagem${this.vantagensDisponiveis.length !== 1 ? 's' : ''}`;
        }
        
        const totalVantagensAdquiridas = document.getElementById('total-vantagens-adquiridas');
        if (totalVantagensAdquiridas) {
            const total = this.vantagensAdquiridas.reduce((sum, v) => sum + v.custo, 0);
            totalVantagensAdquiridas.textContent = `${total} pts`;
        }
    }
    
    atualizarTotais() {
        const totalVantagens = this.calcularTotalVantagens();
        const totalDesvantagens = this.calcularTotalDesvantagens();
        const totalPeculiaridades = this.calcularTotalPeculiaridades();
        const saldoTotal = totalVantagens + totalDesvantagens + totalPeculiaridades;
        
        const elTotalVantagens = document.getElementById('total-vantagens');
        if (elTotalVantagens) {
            elTotalVantagens.textContent = totalVantagens >= 0 ? `+${totalVantagens} pts` : `${totalVantagens} pts`;
        }
        
        const elTotalDesvantagens = document.getElementById('total-desvantagens');
        if (elTotalDesvantagens) {
            const totalDesvantagensComPeculiaridades = Math.abs(totalDesvantagens + totalPeculiaridades);
            elTotalDesvantagens.textContent = `-${totalDesvantagensComPeculiaridades} pts`;
        }
        
        const elSaldoTotal = document.getElementById('saldo-total-vantagens');
        if (elSaldoTotal) {
            elSaldoTotal.textContent = `${saldoTotal} pts`;
            elSaldoTotal.style.color = saldoTotal > 0 ? '#27ae60' : saldoTotal < 0 ? '#e74c3c' : '#ffd700';
        }
        
        this.dispararEventoDashboard();
    }
    
    abrirModal(tipo) {
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
            document.body.style.overflow = '';
        }
        
        if (tipo === 'vantagem') {
            this.vantagemSelecionada = null;
            this.opcaoSelecionada = null;
        }
    }
    
    fecharModalAtivo() {
        const modais = ['vantagem', 'desvantagem', 'opcoes'];
        modais.forEach(tipo => {
            const modal = document.getElementById(`modal-${tipo}`);
            if (modal && modal.style.display === 'block') {
                this.fecharModal(tipo);
            }
        });
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando Sistema de Vantagens...');
    
    if (window.sistemaVantagens) {
        try {
            window.sistemaVantagens.fecharModalAtivo();
        } catch (e) {
            console.warn('Erro ao limpar:', e);
        }
        window.sistemaVantagens = null;
    }
    
    window.sistemaVantagens = new SistemaVantagens();
    
    setTimeout(() => {
        if (window.sistemaVantagens) {
            window.sistemaVantagens.atualizarListaPeculiaridades();
            console.log('✅ Sistema de Vantagens pronto!');
        }
    }, 100);
});

// Exportar
if (typeof window !== 'undefined') {
    window.SistemaVantagens = SistemaVantagens;
}
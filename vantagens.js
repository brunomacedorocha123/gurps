// vantagens.js - VERSÃO 100% FUNCIONAL PARA DESKTOP E MOBILE
class SistemaVantagens {
    constructor() {
        this.vantagensAdquiridas = [];
        this.vantagensDisponiveis = [];
        this.vantagemSelecionada = null;
        this.opcaoSelecionada = null;
        this.touchStartY = 0;
        
        this.init();
    }
    
    init() {
        this.carregarCatalogoVantagens();
        this.configurarEventos();
        this.configurarEventosMobile();
        this.renderizarListaVantagens();
        this.atualizarInterface();
        this.configurarModaisMobile();
    }
    
    carregarCatalogoVantagens() {
        if (window.catalogoVantagens && Array.isArray(window.catalogoVantagens)) {
            this.vantagensDisponiveis = [...window.catalogoVantagens];
        } else {
            this.vantagensDisponiveis = [];
            console.warn('Catálogo de vantagens não encontrado');
        }
    }
    
    configurarEventos() {
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
        
        // Configurar modais
        this.configurarModalVantagem();
        this.configurarModalOpcoes();
        
        // Fechar modal clicando fora (só desktop)
        if (!this.isMobile()) {
            window.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    this.fecharModalAtivo();
                }
            });
        }
        
        // Tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.fecharModalAtivo();
            }
        });
    }
    
    configurarEventosMobile() {
        // Detectar mobile
        if (!this.isMobile()) return;
        
        // Melhorar toque em botões
        document.querySelectorAll('.btn, .btn-remover, .peculiaridade-remover, .modal-close').forEach(btn => {
            btn.addEventListener('touchstart', () => {
                btn.style.transform = 'scale(0.95)';
                btn.style.opacity = '0.8';
            }, { passive: true });
            
            btn.addEventListener('touchend', () => {
                btn.style.transform = '';
                btn.style.opacity = '';
            }, { passive: true });
        });
    }
    
    configurarModaisMobile() {
        const modais = document.querySelectorAll('.modal');
        modais.forEach(modal => {
            // Fechar modal com swipe para baixo
            const modalHeader = modal.querySelector('.modal-header');
            if (modalHeader) {
                modalHeader.addEventListener('touchstart', (e) => {
                    this.touchStartY = e.touches[0].clientY;
                }, { passive: true });
                
                modalHeader.addEventListener('touchend', (e) => {
                    const touchEndY = e.changedTouches[0].clientY;
                    const diff = touchEndY - this.touchStartY;
                    
                    if (diff > 100) { // Swipe para baixo de 100px
                        this.fecharModalAtivo();
                    }
                    this.touchStartY = 0;
                }, { passive: true });
            }
        });
    }
    
    configurarModalVantagem() {
        const modal = document.getElementById('modal-vantagem');
        if (!modal) return;
        
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.btn-cancelar');
        const confirmBtn = modal.querySelector('.btn-confirmar');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.fecharModal('vantagem');
            });
            
            // Mobile
            if (this.isMobile()) {
                closeBtn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.fecharModal('vantagem');
                }, { passive: false });
            }
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.fecharModal('vantagem');
            });
        }
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.confirmarAdicionarVantagem();
            });
            
            // ✅ CORREÇÃO CRÍTICA: Adicionar evento para mobile
            if (this.isMobile()) {
                confirmBtn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.confirmarAdicionarVantagem();
                }, { passive: false });
            }
        }
    }
    
    configurarModalOpcoes() {
        const modal = document.getElementById('modal-opcoes');
        if (!modal) return;
        
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.btn-cancelar');
        const confirmBtn = modal.querySelector('.btn-confirmar');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.fecharModal('opcoes');
            });
            
            // Mobile
            if (this.isMobile()) {
                closeBtn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.fecharModal('opcoes');
                }, { passive: false });
            }
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.fecharModal('opcoes');
            });
            
            // Mobile
            if (this.isMobile()) {
                cancelBtn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.fecharModal('opcoes');
                }, { passive: false });
            }
        }
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.confirmarSelecaoOpcao();
            });
            
            // ✅ CORREÇÃO CRÍTICA: Adicionar evento para mobile
            if (this.isMobile()) {
                confirmBtn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.confirmarSelecaoOpcao();
                }, { passive: false });
            }
        }
    }
    
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768);
    }
    
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
        
        // Evento único para desktop e mobile
        const selecionarHandler = (e) => {
            if (e.type === 'touchstart') {
                e.preventDefault();
            }
            this.selecionarVantagem(vantagem);
        };
        
        item.addEventListener('click', selecionarHandler);
        
        // Mobile: também adicionar touch
        if (this.isMobile()) {
            item.addEventListener('touchstart', selecionarHandler, { passive: false });
        }
        
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
        
        vantagem.opcoes.forEach((opcao) => {
            const opcaoItem = document.createElement('div');
            opcaoItem.className = 'opcao-item';
            
            opcaoItem.innerHTML = `
                <div class="opcao-header">
                    <h4 class="opcao-nome">${opcao.nome}</h4>
                    <span class="opcao-custo">${opcao.custo} pts</span>
                </div>
                <p class="opcao-descricao">${opcao.descricao || ''}</p>
            `;
            
            // Evento para selecionar opção
            const selecionarOpcao = (e) => {
                if (e.type === 'touchstart') {
                    e.preventDefault();
                }
                
                document.querySelectorAll('.opcao-item').forEach(item => {
                    item.classList.remove('selecionada');
                });
                opcaoItem.classList.add('selecionada');
                this.opcaoSelecionada = opcao;
                btnSelecionar.disabled = false;
            };
            
            opcaoItem.addEventListener('click', selecionarOpcao);
            
            // Mobile
            if (this.isMobile()) {
                opcaoItem.addEventListener('touchstart', selecionarOpcao, { passive: false });
            }
            
            corpo.appendChild(opcaoItem);
        });
        
        btnSelecionar.disabled = true;
        
        this.abrirModal('opcoes');
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
            this.mostrarAlertaMobile('Por favor, selecione uma opção primeiro.');
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
                this.mostrarAlertaMobile('Por favor, selecione uma opção primeiro.');
                return;
            }
        } else {
            this.adicionarVantagemSemOpcao();
        }
        
        this.fecharModal('vantagem');
    }
    
    mostrarAlertaMobile(mensagem) {
        if (this.isMobile()) {
            // Usar alert nativo no mobile
            alert(mensagem);
        } else {
            alert(mensagem);
        }
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
        
        // ✅ CORREÇÃO: Feedback que funciona no mobile
        this.mostrarFeedbackSucesso(`✅ Vantagem "${vantagemAdquirida.nome}" adicionada por ${vantagemAdquirida.custo} pontos!`);
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
        
        this.mostrarFeedbackSucesso(`✅ Vantagem "${vantagemAdquirida.nome}" adicionada por ${vantagemAdquirida.custo} pontos!`);
    }
    
    mostrarFeedbackSucesso(mensagem) {
        // Usar alert nativo que funciona em todos os dispositivos
        alert(mensagem);
        
        // Opcional: adicionar feedback visual temporário
        if (!this.isMobile()) {
            const feedback = document.createElement('div');
            feedback.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #27ae60;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                z-index: 10001;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                animation: slideIn 0.3s ease;
            `;
            feedback.textContent = mensagem;
            document.body.appendChild(feedback);
            
            setTimeout(() => {
                feedback.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => feedback.remove(), 300);
            }, 3000);
        }
    }
    
    removerVantagem(id) {
        this.vantagensAdquiridas = this.vantagensAdquiridas.filter(v => v.id !== id);
        this.atualizarInterface();
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
            
            // Evento unificado para desktop e mobile
            const removerHandler = (e) => {
                e.stopPropagation();
                if (e.type === 'touchstart') {
                    e.preventDefault();
                }
                
                if (confirm(`Remover "${vantagem.nome}"?`)) {
                    this.removerVantagem(vantagem.id);
                }
            };
            
            btnRemover.addEventListener('click', removerHandler);
            
            // Mobile
            if (this.isMobile()) {
                btnRemover.addEventListener('touchstart', removerHandler, { passive: false });
            }
            
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
        const totalVantagens = this.vantagensAdquiridas.reduce((sum, v) => sum + v.custo, 0);
        
        let totalDesvantagens = 0;
        if (window.sistemaDesvantagens && window.sistemaDesvantagens.desvantagensAdquiridas) {
            totalDesvantagens = window.sistemaDesvantagens.desvantagensAdquiridas.reduce((sum, d) => sum + d.custo, 0);
        }
        
        const peculiaridades = this.obterPeculiaridades();
        const totalPeculiaridades = -peculiaridades.length;
        
        const saldoTotal = totalVantagens + totalDesvantagens + totalPeculiaridades;
        
        const elTotalVantagens = document.getElementById('total-vantagens');
        if (elTotalVantagens) {
            elTotalVantagens.textContent = totalVantagens >= 0 ? `+${totalVantagens} pts` : `${totalVantagens} pts`;
        }
        
        const elTotalDesvantagens = document.getElementById('total-desvantagens');
        if (elTotalDesvantagens) {
            elTotalDesvantagens.textContent = `${totalDesvantagens} pts`;
        }
        
        const elSaldoTotal = document.getElementById('saldo-total-vantagens');
        if (elSaldoTotal) {
            elSaldoTotal.textContent = `${saldoTotal} pts`;
            if (saldoTotal > 0) {
                elSaldoTotal.style.color = '#27ae60';
            } else if (saldoTotal < 0) {
                elSaldoTotal.style.color = '#e74c3c';
            } else {
                elSaldoTotal.style.color = '#ffd700';
            }
        }
    }
    
    // PECULIARIDADES
    adicionarPeculiaridade() {
        const input = document.getElementById('nova-peculiaridade');
        if (!input) return;
        
        const texto = input.value.trim();
        if (!texto) {
            this.mostrarAlertaMobile('Por favor, digite uma peculiaridade.');
            return;
        }
        
        const peculiaridades = this.obterPeculiaridades();
        if (peculiaridades.length >= 5) {
            this.mostrarAlertaMobile('Limite máximo de 5 peculiaridades atingido!');
            return;
        }
        
        peculiaridades.push({
            id: 'peculiaridade-' + Date.now(),
            texto: texto,
            data: new Date().toISOString()
        });
        
        localStorage.setItem('peculiaridades', JSON.stringify(peculiaridades));
        input.value = '';
        
        this.atualizarListaPeculiaridades();
        this.atualizarTotais();
    }
    
    removerPeculiaridade(id) {
        const peculiaridades = this.obterPeculiaridades();
        const novasPeculiaridades = peculiaridades.filter(p => p.id !== id);
        
        localStorage.setItem('peculiaridades', JSON.stringify(novasPeculiaridades));
        this.atualizarListaPeculiaridades();
        this.atualizarTotais();
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
        
        if (contador) contador.textContent = `${peculiaridades.length}/5`;
        if (totalElement) totalElement.textContent = peculiaridades.length;
        if (custoElement) custoElement.textContent = `-${peculiaridades.length} pts`;
        
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
            
            // Evento unificado
            const removerHandler = (e) => {
                if (e.type === 'touchstart') {
                    e.preventDefault();
                }
                this.removerPeculiaridade(peculiaridade.id);
            };
            
            btnRemover.addEventListener('click', removerHandler);
            
            // Mobile
            if (this.isMobile()) {
                btnRemover.addEventListener('touchstart', removerHandler, { passive: false });
            }
            
            listaContainer.appendChild(item);
        });
    }
    
    // MODAIS
    abrirModal(tipo) {
        const modal = document.getElementById(`modal-${tipo}`);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // No mobile, garantir que o teclado não interfira
            if (this.isMobile()) {
                document.activeElement?.blur();
            }
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

// Inicialização segura
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se já existe uma instância
    if (window.sistemaVantagens) {
        try {
            window.sistemaVantagens.fecharModalAtivo();
        } catch (e) {
            console.warn('Erro ao fechar modais existentes:', e);
        }
    }
    
    // Criar nova instância
    window.sistemaVantagens = new SistemaVantagens();
    
    // Garantir que peculiaridades sejam carregadas
    setTimeout(() => {
        if (window.sistemaVantagens) {
            window.sistemaVantagens.atualizarListaPeculiaridades();
        }
    }, 300);
});

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.SistemaVantagens = SistemaVantagens;
}

console.log('Sistema de Vantagens carregado com sucesso!');
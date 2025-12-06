// vantagens.js - VERSÃO 100% FUNCIONAL PARA DESKTOP E MOBILE
class SistemaVantagens {
    constructor() {
        this.vantagensAdquiridas = [];
        this.vantagensDisponiveis = [];
        this.vantagemSelecionada = null;
        this.opcaoSelecionada = null;
        this.touchStartY = 0; // Para controle de swipe
        
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
            
            // Mobile: limpar foco ao tocar fora
            buscaVantagens.addEventListener('blur', () => {
                setTimeout(() => {
                    if (document.activeElement !== buscaVantagens) {
                        window.scrollTo(0, 0);
                    }
                }, 100);
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
        
        // Prevenir zoom em inputs
        document.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('touchstart', (e) => {
                if (e.target.type === 'number') {
                    e.preventDefault();
                }
            }, { passive: false });
            
            input.addEventListener('focus', () => {
                setTimeout(() => {
                    // Rolar suavemente para o input
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            });
        });
        
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
            
            btn.addEventListener('touchcancel', () => {
                btn.style.transform = '';
                btn.style.opacity = '';
            }, { passive: true });
        });
        
        // Melhorar toque em itens da lista
        document.querySelectorAll('.item-lista, .opcao-item, .peculiaridade-item').forEach(item => {
            item.addEventListener('touchstart', () => {
                item.style.backgroundColor = 'rgba(255, 140, 0, 0.15)';
            }, { passive: true });
            
            item.addEventListener('touchend', () => {
                setTimeout(() => {
                    item.style.backgroundColor = '';
                }, 150);
            }, { passive: true });
            
            item.addEventListener('touchcancel', () => {
                item.style.backgroundColor = '';
            }, { passive: true });
        });
    }
    
    configurarModaisMobile() {
        const modais = document.querySelectorAll('.modal');
        modais.forEach(modal => {
            // Prevenir scroll no modal aberto
            modal.addEventListener('touchmove', (e) => {
                if (modal.style.display === 'block') {
                    const modalContent = modal.querySelector('.modal-content');
                    if (modalContent && !modalContent.contains(e.target)) {
                        e.preventDefault();
                    }
                }
            }, { passive: false });
            
            // Fechar modal com swipe para baixo (apenas no header)
            const modalHeader = modal.querySelector('.modal-header');
            if (modalHeader) {
                modalHeader.addEventListener('touchstart', (e) => {
                    this.touchStartY = e.touches[0].clientY;
                }, { passive: true });
                
                modalHeader.addEventListener('touchmove', (e) => {
                    if (!this.touchStartY) return;
                    
                    const touchY = e.touches[0].clientY;
                    const diff = touchY - this.touchStartY;
                    
                    if (diff > 50) { // Swipe para baixo de 50px
                        this.fecharModalAtivo();
                        this.touchStartY = 0;
                    }
                }, { passive: true });
                
                modalHeader.addEventListener('touchend', () => {
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
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.fecharModal('opcoes');
            });
        }
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.confirmarSelecaoOpcao();
            });
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
        
        // Desktop: click normal
        item.addEventListener('click', (e) => {
            if (!this.isMobile()) {
                e.preventDefault();
                this.selecionarVantagem(vantagem);
            }
        });
        
        // Mobile: touch events
        if (this.isMobile()) {
            let touchStartTime = 0;
            let touchStartX = 0;
            let touchStartY = 0;
            
            item.addEventListener('touchstart', (e) => {
                touchStartTime = Date.now();
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                e.preventDefault();
            }, { passive: false });
            
            item.addEventListener('touchend', (e) => {
                const touchEndTime = Date.now();
                const touchDuration = touchEndTime - touchStartTime;
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const diffX = Math.abs(touchEndX - touchStartX);
                const diffY = Math.abs(touchEndY - touchStartY);
                
                // Apenas se for um toque rápido e sem arrastar muito
                if (touchDuration < 300 && diffX < 10 && diffY < 10) {
                    e.preventDefault();
                    this.selecionarVantagem(vantagem);
                }
            }, { passive: false });
        }
        
        return item;
    }
    
    selecionarVantagem(vantagem) {
        this.vantagemSelecionada = vantagem;
        this.opcaoSelecionada = null;
        
        // Fechar teclado se aberto no mobile
        if (this.isMobile()) {
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                activeElement.blur();
            }
        }
        
        if (vantagem.temOpcoes && vantagem.opcoes && vantagem.opcoes.length > 1) {
            this.abrirModalOpcoes(vantagem);
        } else {
            this.abrirModalVantagem(vantagem);
        }
    }
    
    abrirModalOpcoes(vantagem) {
        const modal = document.getElementById('modal-opcoes');
        if (!modal) return;
        
        // Pequeno delay para garantir que o DOM esteja pronto
        setTimeout(() => {
            const corpo = document.getElementById('modal-corpo-opcoes');
            const titulo = document.getElementById('modal-titulo-opcoes');
            
            if (!corpo || !titulo) return;
            
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
                
                // Eventos para desktop e mobile
                const selecionarOpcao = () => {
                    document.querySelectorAll('.opcao-item').forEach(item => {
                        item.classList.remove('selecionada');
                    });
                    opcaoItem.classList.add('selecionada');
                    this.opcaoSelecionada = opcao;
                    
                    const btn = modal.querySelector('.btn-confirmar');
                    if (btn) btn.disabled = false;
                };
                
                // Desktop
                opcaoItem.addEventListener('click', selecionarOpcao);
                
                // Mobile
                if (this.isMobile()) {
                    opcaoItem.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                    }, { passive: false });
                    
                    opcaoItem.addEventListener('touchend', (e) => {
                        e.preventDefault();
                        selecionarOpcao();
                    }, { passive: false });
                }
                
                corpo.appendChild(opcaoItem);
            });
            
            const btnSelecionar = modal.querySelector('.btn-confirmar');
            if (btnSelecionar) {
                btnSelecionar.onclick = null;
                btnSelecionar.textContent = 'Selecionar';
                btnSelecionar.disabled = true;
                btnSelecionar.onclick = () => {
                    this.confirmarSelecaoOpcao();
                };
            }
            
            this.abrirModal('opcoes');
        }, 10);
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
        
        // Feedback visual
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
            
            // Desktop
            btnRemover.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Remover "${vantagem.nome}"?`)) {
                    this.removerVantagem(vantagem.id);
                }
            });
            
            // Mobile
            if (this.isMobile()) {
                btnRemover.addEventListener('touchstart', (e) => {
                    e.stopPropagation();
                }, { passive: true });
                
                btnRemover.addEventListener('touchend', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (confirm(`Remover "${vantagem.nome}"?`)) {
                        this.removerVantagem(vantagem.id);
                    }
                }, { passive: false });
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
            alert('Por favor, digite uma peculiaridade.');
            return;
        }
        
        const peculiaridades = this.obterPeculiaridades();
        if (peculiaridades.length >= 5) {
            alert('Limite máximo de 5 peculiaridades atingido!');
            return;
        }
        
        peculiaridades.push({
            id: 'peculiaridade-' + Date.now(),
            texto: texto,
            data: new Date().toISOString()
        });
        
        localStorage.setItem('peculiaridades', JSON.stringify(peculiaridades));
        input.value = '';
        
        // Fechar teclado no mobile
        if (this.isMobile()) {
            input.blur();
        }
        
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
            
            // Desktop
            btnRemover.addEventListener('click', () => {
                this.removerPeculiaridade(peculiaridade.id);
            });
            
            // Mobile
            if (this.isMobile()) {
                btnRemover.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.removerPeculiaridade(peculiaridade.id);
                }, { passive: false });
            }
            
            listaContainer.appendChild(item);
        });
    }
    
    // ===== CORREÇÃO DOS MÉTODOS DE MODAL =====
    
    abrirModal(tipo) {
        const modal = document.getElementById(`modal-${tipo}`);
        if (modal) {
            modal.style.display = 'block';
            
            // ✅ CORREÇÃO: Usar classe CSS em vez de inline styles
            document.body.classList.add('modal-aberto');
            
            // ✅ Preservar a posição de scroll antes de abrir o modal
            const scrollY = window.scrollY;
            document.body.style.top = `-${scrollY}px`;
            document.body.dataset.scrollY = scrollY;
            
            // Garantir que o modal esteja no topo
            setTimeout(() => {
                modal.scrollTop = 0;
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.scrollTop = 0;
                }
            }, 10);
        }
    }
    
    fecharModal(tipo) {
        const modal = document.getElementById(`modal-${tipo}`);
        if (modal) {
            modal.style.display = 'none';
            
            // ✅ CORREÇÃO: Restaurar posição de scroll
            document.body.classList.remove('modal-aberto');
            
            if (document.body.dataset.scrollY) {
                const scrollY = parseInt(document.body.dataset.scrollY);
                document.body.style.top = '';
                window.scrollTo(0, scrollY);
                delete document.body.dataset.scrollY;
            }
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

// Para compatibilidade com outros scripts
console.log('Sistema de Vantagens carregado com sucesso!');
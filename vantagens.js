// vantagens.js - SISTEMA COMPLETO DE VANTAGENS E DESVANTAGENS
// Versão corrigida e funcional - Botão "Selecionar" funcionando

class SistemaVantagens {
    constructor() {
        this.vantagensAdquiridas = [];
        this.vantagensDisponiveis = [];
        this.vantagemSelecionada = null;
        this.opcaoSelecionada = null;
        
        this.init();
    }
    
    init() {
        console.log('Inicializando Sistema de Vantagens...');
        this.carregarCatalogoVantagens();
        this.configurarEventos();
        this.renderizarListaVantagens();
        this.atualizarInterface();
    }
    
    carregarCatalogoVantagens() {
        if (window.catalogoVantagens && Array.isArray(window.catalogoVantagens)) {
            this.vantagensDisponiveis = [...window.catalogoVantagens];
            console.log(`Carregadas ${this.vantagensDisponiveis.length} vantagens do catálogo`);
        } else {
            this.vantagensDisponiveis = [];
            console.warn('Catálogo de vantagens não encontrado!');
        }
    }
    
    configurarEventos() {
        console.log('Configurando eventos...');
        
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
        this.configurarModais();
        
        // Fechar modal clicando fora
        window.addEventListener('click', (e) => {
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
        
        // Sincronizar com sistema de desvantagens se existir
        if (window.sistemaDesvantagens) {
            window.sistemaDesvantagens.onAtualizacao(() => {
                this.atualizarTotais();
            });
        }
    }
    
    configurarModais() {
        console.log('Configurando modais...');
        this.configurarModalVantagem();
        this.configurarModalOpcoes();
    }
    
    configurarModalVantagem() {
        const modal = document.getElementById('modal-vantagem');
        if (!modal) {
            console.error('Modal de vantagem não encontrado!');
            return;
        }
        
        // Fechar modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.fecharModal('vantagem');
        });
        
        // Botão Cancelar
        modal.querySelector('.btn-cancelar').addEventListener('click', () => {
            this.fecharModal('vantagem');
        });
        
        // Botão Confirmar
        const btnConfirmar = modal.querySelector('.btn-confirmar');
        btnConfirmar.addEventListener('click', () => {
            this.confirmarAdicionarVantagem();
        });
    }
    
    configurarModalOpcoes() {
        const modal = document.getElementById('modal-opcoes');
        if (!modal) {
            console.error('Modal de opções não encontrado!');
            return;
        }
        
        console.log('Configurando modal de opções...');
        
        // Fechar modal
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.fecharModal('opcoes');
            });
        }
        
        // Botão Voltar
        const btnVoltar = modal.querySelector('.btn-cancelar');
        if (btnVoltar) {
            // Mudar texto do botão
            btnVoltar.textContent = 'Voltar';
            
            btnVoltar.addEventListener('click', (e) => {
                e.stopPropagation();
                this.fecharModal('opcoes');
                
                // Voltar para modal de vantagem
                if (this.vantagemSelecionada) {
                    setTimeout(() => {
                        this.abrirModalVantagem(this.vantagemSelecionada);
                    }, 150);
                }
            });
        }
        
        // BOTÃO SELECIONAR - CORREÇÃO CRÍTICA
        const btnSelecionar = modal.querySelector('.btn-confirmar');
        if (btnSelecionar) {
            // Mudar texto para ficar claro
            btnSelecionar.textContent = 'Selecionar';
            
            // Remover qualquer listener antigo
            const novoBtn = btnSelecionar.cloneNode(true);
            btnSelecionar.parentNode.replaceChild(novoBtn, btnSelecionar);
            
            // Adicionar novo evento
            novoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão Selecionar clicado!');
                this.confirmarSelecaoOpcao();
            });
            
            console.log('Botão Selecionar configurado corretamente');
        }
    }
    
    confirmarSelecaoOpcao() {
        console.log('Confirmando seleção de opção...');
        console.log('Opção selecionada:', this.opcaoSelecionada);
        
        if (!this.opcaoSelecionada) {
            console.warn('Nenhuma opção selecionada!');
            
            // Feedback visual
            const btnSelecionar = document.querySelector('#modal-opcoes .btn-confirmar');
            if (btnSelecionar) {
                btnSelecionar.style.animation = 'shake 0.5s ease';
                setTimeout(() => {
                    btnSelecionar.style.animation = '';
                }, 500);
            }
            
            alert('Por favor, selecione uma opção primeiro.');
            return;
        }
        
        if (!this.vantagemSelecionada) {
            console.error('Nenhuma vantagem selecionada!');
            return;
        }
        
        console.log('Adicionando vantagem com opção:', this.opcaoSelecionada.nome);
        
        // Adicionar a vantagem com a opção selecionada
        this.adicionarVantagemComOpcao();
        
        // Fechar modal
        this.fecharModal('opcoes');
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
        
        // Atualizar contador
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
            ${vantagem.temOpcoes ? '<span class="item-variavel" style="color:#9b59b6;font-size:0.8em;">⚡ Variavel</span>' : ''}
        `;
        
        item.addEventListener('click', () => {
            console.log('Vantagem selecionada:', vantagem.nome);
            this.selecionarVantagem(vantagem);
        });
        
        return item;
    }
    
    selecionarVantagem(vantagem) {
        console.log('Processando vantagem:', vantagem.nome);
        console.log('Tem opções?', vantagem.temOpcoes);
        console.log('Opções:', vantagem.opcoes);
        
        this.vantagemSelecionada = vantagem;
        this.opcaoSelecionada = null;
        
        // Se a vantagem tem múltiplas opções, mostrar modal de opções
        if (vantagem.temOpcoes && vantagem.opcoes && vantagem.opcoes.length > 1) {
            console.log('Abrindo modal de opções...');
            this.abrirModalOpcoes(vantagem);
        } else {
            // Se não tem opções ou só tem uma, ir direto para modal de vantagem
            console.log('Abrindo modal de vantagem...');
            this.abrirModalVantagem(vantagem);
        }
    }
    
    abrirModalOpcoes(vantagem) {
        const modal = document.getElementById('modal-opcoes');
        const corpo = document.getElementById('modal-corpo-opcoes');
        const titulo = document.getElementById('modal-titulo-opcoes');
        const btnSelecionar = modal.querySelector('.btn-confirmar');
        
        if (!modal || !corpo) {
            console.error('Elementos do modal de opções não encontrados!');
            return;
        }
        
        console.log('Exibindo opções para:', vantagem.nome);
        
        titulo.textContent = `Escolha uma opção: ${vantagem.nome}`;
        corpo.innerHTML = '<div class="opcoes-container"></div>';
        
        const opcoesContainer = corpo.querySelector('.opcoes-container');
        
        // Limpar seleção anterior
        this.opcaoSelecionada = null;
        if (btnSelecionar) {
            btnSelecionar.disabled = true;
        }
        
        // Criar opções
        vantagem.opcoes.forEach((opcao, index) => {
            const opcaoItem = document.createElement('div');
            opcaoItem.className = 'opcao-item';
            opcaoItem.dataset.index = index;
            opcaoItem.dataset.opcaoId = opcao.id;
            
            opcaoItem.innerHTML = `
                <div class="opcao-header">
                    <h4 class="opcao-nome">${opcao.nome}</h4>
                    <span class="opcao-custo">${opcao.custo} pts</span>
                </div>
                <p class="opcao-descricao">${opcao.descricao || ''}</p>
            `;
            
            opcaoItem.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Remover seleção anterior
                document.querySelectorAll('.opcao-item').forEach(item => {
                    item.classList.remove('selecionada');
                });
                
                // Selecionar esta opção
                opcaoItem.classList.add('selecionada');
                this.opcaoSelecionada = opcao;
                
                console.log('Opção selecionada:', opcao.nome);
                
                // Habilitar botão Selecionar
                if (btnSelecionar) {
                    btnSelecionar.disabled = false;
                }
            });
            
            opcaoItem.addEventListener('dblclick', () => {
                // Selecionar e confirmar com duplo clique
                opcaoItem.classList.add('selecionada');
                this.opcaoSelecionada = opcao;
                
                if (btnSelecionar) {
                    btnSelecionar.disabled = false;
                }
                
                // Confirmar automaticamente
                setTimeout(() => {
                    this.confirmarSelecaoOpcao();
                }, 300);
            });
            
            opcoesContainer.appendChild(opcaoItem);
        });
        
        // Se só tem uma opção, selecionar automaticamente
        if (vantagem.opcoes.length === 1) {
            setTimeout(() => {
                const primeiraOpcao = opcoesContainer.querySelector('.opcao-item');
                if (primeiraOpcao) {
                    primeiraOpcao.click();
                    if (btnSelecionar) {
                        btnSelecionar.disabled = false;
                    }
                }
            }, 100);
        }
        
        // Abrir modal
        this.abrirModal('opcoes');
    }
    
    abrirModalVantagem(vantagem) {
        const modal = document.getElementById('modal-vantagem');
        if (!modal) {
            console.error('Modal de vantagem não encontrado!');
            return;
        }
        
        const corpo = document.getElementById('modal-corpo-vantagem');
        const titulo = document.getElementById('modal-titulo-vantagem');
        const btnConfirmar = modal.querySelector('.btn-confirmar');
        
        if (!corpo || !titulo || !btnConfirmar) return;
        
        titulo.textContent = vantagem.nome;
        
        let custo = vantagem.custo || 0;
        let descricaoAdicional = '';
        
        // Se tem opções mas só uma, usar ela
        if (vantagem.temOpcoes && vantagem.opcoes && vantagem.opcoes.length === 1) {
            const opcao = vantagem.opcoes[0];
            custo = opcao.custo;
            this.opcaoSelecionada = opcao;
            descricaoAdicional = `<p><strong>Opção selecionada:</strong> ${opcao.nome} (${opcao.custo} pts)</p>`;
        } else if (vantagem.temOpcoes) {
            // Se tem múltiplas opções mas veio direto aqui (erro), voltar para opções
            this.fecharModal('vantagem');
            setTimeout(() => {
                this.abrirModalOpcoes(vantagem);
            }, 100);
            return;
        } else {
            this.opcaoSelecionada = null;
        }
        
        corpo.innerHTML = `
            <div class="modal-info">
                <p><strong>Descrição:</strong> ${vantagem.descricao || ''}</p>
                ${descricaoAdicional}
                ${vantagem.categoria ? `<p><strong>Categoria:</strong> ${vantagem.categoria}</p>` : ''}
                ${vantagem.prerequisitos && vantagem.prerequisitos.length > 0 ? 
                  `<p><strong>Pré-requisitos:</strong> ${vantagem.prerequisitos.join(', ')}</p>` : ''}
                ${vantagem.notas ? `<p><strong>Notas:</strong> ${vantagem.notas}</p>` : ''}
            </div>
            <div class="pericia-custo-container">
                <div class="pericia-custo">Custo: ${custo} pontos</div>
                ${vantagem.temOpcoes ? 
                  '<div class="pericia-custo-adicional">⚠️ Esta vantagem tem múltiplas opções</div>' : ''}
            </div>
        `;
        
        btnConfirmar.disabled = false;
        
        this.abrirModal('vantagem');
    }
    
    confirmarAdicionarVantagem() {
        if (!this.vantagemSelecionada) {
            console.warn('Nenhuma vantagem selecionada para adicionar!');
            return;
        }
        
        console.log('Confirmando adição de vantagem:', this.vantagemSelecionada.nome);
        
        // Verificar se precisa de opção
        if (this.vantagemSelecionada.temOpcoes) {
            if (this.opcaoSelecionada) {
                console.log('Adicionando com opção selecionada:', this.opcaoSelecionada.nome);
                this.adicionarVantagemComOpcao();
            } else if (this.vantagemSelecionada.opcoes && this.vantagemSelecionada.opcoes.length === 1) {
                // Se só tem uma opção, usar ela automaticamente
                this.opcaoSelecionada = this.vantagemSelecionada.opcoes[0];
                console.log('Usando única opção disponível:', this.opcaoSelecionada.nome);
                this.adicionarVantagemComOpcao();
            } else {
                console.warn('Vantagem com opções mas nenhuma selecionada!');
                alert('Por favor, selecione uma opção primeiro.');
                
                // Voltar para modal de opções
                this.fecharModal('vantagem');
                setTimeout(() => {
                    this.abrirModalOpcoes(this.vantagemSelecionada);
                }, 100);
                return;
            }
        } else {
            console.log('Adicionando vantagem sem opções');
            this.adicionarVantagemSemOpcao();
        }
        
        this.fecharModal('vantagem');
    }
    
    adicionarVantagemComOpcao() {
        if (!this.vantagemSelecionada || !this.opcaoSelecionada) {
            console.error('Dados incompletos para adicionar vantagem com opção!');
            return;
        }
        
        console.log('Adicionando vantagem com opção:', {
            vantagem: this.vantagemSelecionada.nome,
            opcao: this.opcaoSelecionada.nome,
            custo: this.opcaoSelecionada.custo
        });
        
        const vantagemAdquirida = {
            id: `${this.vantagemSelecionada.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            baseId: this.vantagemSelecionada.id,
            nome: this.opcaoSelecionada.nome,
            nomeBase: this.vantagemSelecionada.nome,
            custo: this.opcaoSelecionada.custo,
            descricao: this.opcaoSelecionada.descricao || this.vantagemSelecionada.descricao,
            categoria: this.vantagemSelecionada.categoria,
            dataAdquisicao: new Date().toISOString(),
            opcaoSelecionada: this.opcaoSelecionada,
            temOpcoes: true
        };
        
        this.vantagensAdquiridas.push(vantagemAdquirida);
        console.log('Vantagem adicionada. Total:', this.vantagensAdquiridas.length);
        
        // Salvar no localStorage
        this.salvarDados();
        
        // Atualizar tudo
        this.atualizarInterface();
        
        // Feedback visual
        this.mostrarFeedbackAdicao(vantagemAdquirida.nome, vantagemAdquirida.custo);
        
        // Limpar seleções
        this.vantagemSelecionada = null;
        this.opcaoSelecionada = null;
    }
    
    adicionarVantagemSemOpcao() {
        if (!this.vantagemSelecionada) {
            console.error('Nenhuma vantagem selecionada!');
            return;
        }
        
        console.log('Adicionando vantagem simples:', this.vantagemSelecionada.nome);
        
        const vantagemAdquirida = {
            id: `${this.vantagemSelecionada.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            baseId: this.vantagemSelecionada.id,
            nome: this.vantagemSelecionada.nome,
            nomeBase: this.vantagemSelecionada.nome,
            custo: this.vantagemSelecionada.custo,
            descricao: this.vantagemSelecionada.descricao,
            categoria: this.vantagemSelecionada.categoria,
            dataAdquisicao: new Date().toISOString(),
            opcaoSelecionada: null,
            temOpcoes: false
        };
        
        this.vantagensAdquiridas.push(vantagemAdquirida);
        console.log('Vantagem adicionada. Total:', this.vantagensAdquiridas.length);
        
        // Salvar no localStorage
        this.salvarDados();
        
        // Atualizar interface
        this.atualizarInterface();
        
        // Feedback visual
        this.mostrarFeedbackAdicao(vantagemAdquirida.nome, vantagemAdquirida.custo);
        
        // Limpar seleção
        this.vantagemSelecionada = null;
    }
    
    mostrarFeedbackAdicao(nome, custo) {
        // Criar feedback visual
        const feedback = document.createElement('div');
        feedback.className = 'feedback-adicao';
        feedback.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(39, 174, 96, 0.9);
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                animation: slideInRight 0.3s ease;
                max-width: 300px;
            ">
                <strong>✓ Vantagem Adicionada!</strong><br>
                ${nome}<br>
                <small>Custo: ${custo} pontos</small>
            </div>
        `;
        
        document.body.appendChild(feedback);
        
        // Remover após 3 segundos
        setTimeout(() => {
            feedback.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 3000);
    }
    
    removerVantagem(id) {
        console.log('Removendo vantagem ID:', id);
        
        const vantagemIndex = this.vantagensAdquiridas.findIndex(v => v.id === id);
        if (vantagemIndex !== -1) {
            const vantagemRemovida = this.vantagensAdquiridas[vantagemIndex];
            
            // Remover do array
            this.vantagensAdquiridas.splice(vantagemIndex, 1);
            
            // Salvar no localStorage
            this.salvarDados();
            
            // Atualizar interface
            this.atualizarInterface();
            
            // Feedback visual
            this.mostrarFeedbackRemocao(vantagemRemovida.nome, vantagemRemovida.custo);
            
            console.log('Vantagem removida. Total restante:', this.vantagensAdquiridas.length);
        }
    }
    
    mostrarFeedbackRemocao(nome, custo) {
        const feedback = document.createElement('div');
        feedback.className = 'feedback-remocao';
        feedback.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(231, 76, 60, 0.9);
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                animation: slideInRight 0.3s ease;
                max-width: 300px;
            ">
                <strong>✗ Vantagem Removida!</strong><br>
                ${nome}<br>
                <small>Custo: ${custo} pontos recuperados</small>
            </div>
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 3000);
    }
    
    salvarDados() {
        try {
            localStorage.setItem('vantagensAdquiridas', JSON.stringify(this.vantagensAdquiridas));
            console.log('Dados salvos no localStorage');
        } catch (e) {
            console.error('Erro ao salvar dados:', e);
        }
    }
    
    carregarDados() {
        try {
            const dados = localStorage.getItem('vantagensAdquiridas');
            if (dados) {
                this.vantagensAdquiridas = JSON.parse(dados);
                console.log('Dados carregados do localStorage:', this.vantagensAdquiridas.length);
            }
        } catch (e) {
            console.error('Erro ao carregar dados:', e);
        }
    }
    
    renderizarListaVantagens() {
        const listaContainer = document.getElementById('lista-vantagens');
        if (!listaContainer) {
            console.error('Container de lista de vantagens não encontrado!');
            return;
        }
        
        listaContainer.innerHTML = '';
        
        if (this.vantagensDisponiveis.length === 0) {
            listaContainer.innerHTML = '<div class="lista-vazia">Nenhuma vantagem disponível</div>';
            return;
        }
        
        this.vantagensDisponiveis.forEach(vantagem => {
            const item = this.criarItemVantagem(vantagem);
            listaContainer.appendChild(item);
        });
        
        console.log(`Renderizadas ${this.vantagensDisponiveis.length} vantagens`);
    }
    
    atualizarInterface() {
        this.atualizarListaAdquiridas();
        this.atualizarContadores();
        this.atualizarTotais();
    }
    
    atualizarListaAdquiridas() {
        const listaContainer = document.getElementById('vantagens-adquiridas');
        if (!listaContainer) {
            console.error('Container de vantagens adquiridas não encontrado!');
            return;
        }
        
        listaContainer.innerHTML = '';
        
        if (this.vantagensAdquiridas.length === 0) {
            listaContainer.innerHTML = '<div class="lista-vazia">Nenhuma vantagem adquirida</div>';
            return;
        }
        
        console.log(`Atualizando lista de adquiridas: ${this.vantagensAdquiridas.length} itens`);
        
        this.vantagensAdquiridas.forEach(vantagem => {
            const item = document.createElement('div');
            item.className = 'item-lista item-adquirido';
            item.dataset.id = vantagem.id;
            
            // Verificar se é variável (tem opções)
            const isVariavel = vantagem.temOpcoes || vantagem.nomeBase !== vantagem.nome;
            
            item.innerHTML = `
                <div class="item-header">
                    <h4 class="item-nome">${vantagem.nome}</h4>
                    <span class="item-custo">${vantagem.custo} pts</span>
                    <button class="btn-remover" title="Remover vantagem">×</button>
                </div>
                <p class="item-descricao">${vantagem.descricao ? vantagem.descricao.substring(0, 120) + (vantagem.descricao.length > 120 ? '...' : '') : ''}</p>
                ${vantagem.categoria ? `<span class="item-categoria">${vantagem.categoria}</span>` : ''}
                ${isVariavel ? 
                  `<small style="color:#9b59b6;display:block;margin-top:4px;font-size:0.85em;">
                    ⚡ ${vantagem.nomeBase !== vantagem.nome ? `(${vantagem.nomeBase})` : 'Vantagem variável'}
                  </small>` : ''}
            `;
            
            const btnRemover = item.querySelector('.btn-remover');
            if (btnRemover) {
                btnRemover.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`Tem certeza que deseja remover "${vantagem.nome}"?`)) {
                        this.removerVantagem(vantagem.id);
                    }
                });
            }
            
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
            
            // Atualizar cor conforme valor
            if (total > 0) {
                totalVantagensAdquiridas.style.color = '#27ae60';
            } else {
                totalVantagensAdquiridas.style.color = '#ffd700';
            }
        }
    }
    
    atualizarTotais() {
        console.log('Atualizando totais...');
        
        // Total vantagens
        const totalVantagens = this.vantagensAdquiridas.reduce((sum, v) => sum + v.custo, 0);
        console.log('Total vantagens:', totalVantagens);
        
        // Total desvantagens (do outro sistema)
        let totalDesvantagens = 0;
        if (window.sistemaDesvantagens && window.sistemaDesvantagens.desvantagensAdquiridas) {
            totalDesvantagens = window.sistemaDesvantagens.desvantagensAdquiridas.reduce((sum, d) => sum + d.custo, 0);
            console.log('Total desvantagens:', totalDesvantagens);
        }
        
        // Total peculiaridades
        const peculiaridades = this.obterPeculiaridades();
        const totalPeculiaridades = -peculiaridades.length;
        console.log('Total peculiaridades:', totalPeculiaridades);
        
        // Saldo total
        const saldoTotal = totalVantagens + totalDesvantagens + totalPeculiaridades;
        console.log('Saldo total:', saldoTotal);
        
        // Atualizar elementos
        const elTotalVantagens = document.getElementById('total-vantagens');
        if (elTotalVantagens) {
            elTotalVantagens.textContent = totalVantagens > 0 ? `+${totalVantagens} pts` : `${totalVantagens} pts`;
            elTotalVantagens.style.color = totalVantagens > 0 ? '#27ae60' : '#ffd700';
        }
        
        const elTotalDesvantagens = document.getElementById('total-desvantagens');
        if (elTotalDesvantagens) {
            elTotalDesvantagens.textContent = totalDesvantagens > 0 ? `+${totalDesvantagens} pts` : `${totalDesvantagens} pts`;
            elTotalDesvantagens.style.color = totalDesvantagens > 0 ? '#e74c3c' : '#ffd700';
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
        
        // Disparar evento de atualização
        this.dispararEventoAtualizacao();
    }
    
    dispararEventoAtualizacao() {
        // Criar evento customizado
        const evento = new CustomEvent('vantagensAtualizadas', {
            detail: {
                totalVantagens: this.vantagensAdquiridas.reduce((sum, v) => sum + v.custo, 0),
                countVantagens: this.vantagensAdquiridas.length
            }
        });
        document.dispatchEvent(evento);
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
        
        // Verificar duplicatas
        const peculiaridades = this.obterPeculiaridades();
        if (peculiaridades.some(p => p.texto.toLowerCase() === texto.toLowerCase())) {
            alert('Esta peculiaridade já foi adicionada!');
            return;
        }
        
        if (peculiaridades.length >= 5) {
            alert('Limite máximo de 5 peculiaridades atingido!');
            return;
        }
        
        const novaPeculiaridade = {
            id: 'peculiaridade-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            texto: texto,
            data: new Date().toISOString()
        };
        
        peculiaridades.push(novaPeculiaridade);
        
        localStorage.setItem('peculiaridades', JSON.stringify(peculiaridades));
        input.value = '';
        this.atualizarListaPeculiaridades();
        this.atualizarTotais();
        
        console.log('Peculiaridade adicionada:', texto);
    }
    
    removerPeculiaridade(id) {
        if (!confirm('Tem certeza que deseja remover esta peculiaridade?')) {
            return;
        }
        
        const peculiaridades = this.obterPeculiaridades();
        const novasPeculiaridades = peculiaridades.filter(p => p.id !== id);
        
        localStorage.setItem('peculiaridades', JSON.stringify(novasPeculiaridades));
        this.atualizarListaPeculiaridades();
        this.atualizarTotais();
        
        console.log('Peculiaridade removida ID:', id);
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
            if (btnRemover) {
                btnRemover.addEventListener('click', () => {
                    this.removerPeculiaridade(peculiaridade.id);
                });
            }
            
            listaContainer.appendChild(item);
        });
    }
    
    // FUNÇÕES DE MODAL
    abrirModal(tipo) {
        console.log(`Abrindo modal: ${tipo}`);
        const modal = document.getElementById(`modal-${tipo}`);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            document.body.classList.add('modal-aberto');
            
            // Adicionar animação de entrada
            modal.style.opacity = '0';
            modal.style.transform = 'translateY(20px) scale(0.98)';
            
            setTimeout(() => {
                modal.style.transition = 'all 0.3s ease';
                modal.style.opacity = '1';
                modal.style.transform = 'translateY(0) scale(1)';
            }, 10);
        }
    }
    
    fecharModal(tipo) {
        console.log(`Fechando modal: ${tipo}`);
        const modal = document.getElementById(`modal-${tipo}`);
        if (modal) {
            modal.style.transition = 'all 0.3s ease';
            modal.style.opacity = '0';
            modal.style.transform = 'translateY(20px) scale(0.98)';
            
            setTimeout(() => {
                modal.style.display = 'none';
                modal.style.opacity = '';
                modal.style.transform = '';
                
                if (tipo === 'vantagem' || tipo === 'opcoes') {
                    this.vantagemSelecionada = null;
                    this.opcaoSelecionada = null;
                }
            }, 300);
            
            document.body.style.overflow = 'auto';
            document.body.classList.remove('modal-aberto');
        }
    }
    
    fecharModalAtivo() {
        console.log('Fechando modal ativo...');
        const modais = ['vantagem', 'desvantagem', 'opcoes'];
        modais.forEach(tipo => {
            const modal = document.getElementById(`modal-${tipo}`);
            if (modal && modal.style.display === 'block') {
                this.fecharModal(tipo);
            }
        });
    }
    
    // Métodos utilitários
    getTotalVantagens() {
        return this.vantagensAdquiridas.reduce((sum, v) => sum + v.custo, 0);
    }
    
    getCountVantagens() {
        return this.vantagensAdquiridas.length;
    }
    
    limparDados() {
        if (confirm('Tem certeza que deseja limpar TODAS as vantagens adquiridas?')) {
            this.vantagensAdquiridas = [];
            this.salvarDados();
            this.atualizarInterface();
            console.log('Dados limpos!');
        }
    }
}

// Adicionar animações CSS dinamicamente
const styleAnimations = document.createElement('style');
styleAnimations.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(styleAnimations);

// Inicializar quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Carregado - Iniciando Sistema de Vantagens');
    window.sistemaVantagens = new SistemaVantagens();
    
    // Carregar dados salvos
    setTimeout(() => {
        if (window.sistemaVantagens) {
            window.sistemaVantagens.carregarDados();
            window.sistemaVantagens.atualizarListaPeculiaridades();
            window.sistemaVantagens.atualizarInterface();
        }
    }, 100);
    
    // Exportar função para limpar dados (para debugging)
    window.limparVantagens = () => {
        if (window.sistemaVantagens) {
            window.sistemaVantagens.limparDados();
        }
    };
});

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.SistemaVantagens = SistemaVantagens;
}

console.log('Sistema de Vantagens carregado com sucesso!');
// desvantagens.js - VERSÃO COMPLETA COM TODAS AS FUNÇÕES
console.log("🚀 desvantagens.js - VERSÃO COMPLETA INICIANDO...");

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
        this.atualizarListaDisponiveis();
        this.atualizarListaAdquiridas();
        this.atualizarContadores();
        this.atualizarTotais();
        
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
        
        // Eventos de toque para mobile
        this.configurarTouchEvents();
        
        // Configurar eventos dos itens da lista
        setTimeout(() => {
            this.configurarEventosLista();
        }, 200);
    }
    
    configurarEventosLista() {
        const listaContainer = document.getElementById('lista-desvantagens');
        if (!listaContainer) {
            console.error("❌ Lista de desvantagens não encontrada!");
            return;
        }
        
        console.log("🎯 Configurando eventos para os itens da lista...");
        
        // Adicionar eventos aos itens existentes
        const itens = listaContainer.querySelectorAll('.item-lista');
        console.log(`🎯 Encontrados ${itens.length} itens para configurar eventos`);
        
        itens.forEach(item => {
            // Se já tem evento configurado, pular
            if (item.dataset.initialized === "true") return;
            
            // Clonar o item para remover event listeners antigos
            const novoItem = item.cloneNode(true);
            item.parentNode.replaceChild(novoItem, item);
            
            // Adicionar novo evento de clique
            novoItem.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = novoItem.dataset.id;
                const desvantagem = this.desvantagensDisponiveis.find(d => d.id === id);
                if (desvantagem) {
                    console.log(`🔍 Clicou em: ${desvantagem.nome}`);
                    this.selecionarDesvantagem(desvantagem);
                }
            });
            
            // Evento de toque para mobile
            novoItem.addEventListener('touchend', (e) => {
                e.preventDefault();
                const id = novoItem.dataset.id;
                const desvantagem = this.desvantagensDisponiveis.find(d => d.id === id);
                if (desvantagem) {
                    console.log(`📱 Toque em: ${desvantagem.nome}`);
                    this.selecionarDesvantagem(desvantagem);
                }
            });
            
            novoItem.style.cursor = 'pointer';
            novoItem.dataset.initialized = "true";
        });
    }
    
    configurarTouchEvents() {
        // Melhorar experiência touch no mobile
        document.querySelectorAll('.item-lista, .opcao-item').forEach(item => {
            item.addEventListener('touchstart', function(e) {
                this.classList.add('touch-active');
            });
            
            item.addEventListener('touchend', function(e) {
                this.classList.remove('touch-active');
            });
        });
    }
    
    configurarModais() {
        console.log("⚙️ Configurando modais...");
        
        // Modal de opções
        const modalOpcoes = document.getElementById('modal-opcoes');
        if (modalOpcoes) {
            console.log("✅ Modal de opções encontrado");
            
            // Fechar modal
            modalOpcoes.querySelector('.modal-close').addEventListener('click', () => {
                this.fecharModal('opcoes');
            });
            
            // Botão Voltar
            const btnVoltar = modalOpcoes.querySelector('.btn-cancelar');
            if (btnVoltar) {
                btnVoltar.addEventListener('click', () => {
                    console.log("↩️ Botão Voltar clicado");
                    this.fecharModal('opcoes');
                    // Voltar para o modal de desvantagem
                    if (this.desvantagemSelecionada) {
                        setTimeout(() => {
                            this.abrirModalDesvantagem(this.desvantagemSelecionada);
                        }, 100);
                    }
                });
            }
            
            // Botão Selecionar - CONFIGURAÇÃO CRÍTICA
            const btnConfirmar = modalOpcoes.querySelector('.btn-confirmar');
            if (btnConfirmar) {
                console.log("✅ Botão Selecionar encontrado no modal de opções");
                
                // Remover qualquer evento onclick antigo que possa estar causando o alert
                btnConfirmar.removeAttribute('onclick');
                btnConfirmar.removeAttribute('onmousedown');
                btnConfirmar.removeAttribute('onmouseup');
                
                // Remover event listeners antigos clonando o botão
                const novoBtn = btnConfirmar.cloneNode(true);
                btnConfirmar.parentNode.replaceChild(novoBtn, btnConfirmar);
                
                // Adicionar novo event listener
                novoBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log("🎯 Botão 'Selecionar' clicado no modal de opções");
                    this.selecionarOpcaoFinal();
                });
                
                // Adicionar também para touch
                novoBtn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("📱 Botão 'Selecionar' tocado no modal de opções");
                    this.selecionarOpcaoFinal();
                });
            }
        } else {
            console.error("❌ Modal de opções NÃO encontrado!");
        }
        
        // Modal de desvantagem
        const modalDesvantagem = document.getElementById('modal-desvantagem');
        if (modalDesvantagem) {
            console.log("✅ Modal de desvantagem encontrado");
            
            // Fechar modal
            modalDesvantagem.querySelector('.modal-close').addEventListener('click', () => {
                this.fecharModal('desvantagem');
            });
            
            // Botão Cancelar
            modalDesvantagem.querySelector('.btn-cancelar').addEventListener('click', () => {
                this.fecharModal('desvantagem');
            });
            
            // Botão Adicionar Desvantagem
            const btnConfirmarDesvantagem = modalDesvantagem.querySelector('.btn-confirmar');
            if (btnConfirmarDesvantagem) {
                btnConfirmarDesvantagem.addEventListener('click', () => {
                    console.log("✅ Botão 'Adicionar Desvantagem' clicado");
                    this.adicionarDesvantagem();
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
        this.configurarEventosLista();
        
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
        console.log(`📂 Preparando modal de opções para: ${desvantagem.nome}`);
        
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
        
        // IMPORTANTE: Habilitar o botão Selecionar imediatamente
        if (btnConfirmar) {
            btnConfirmar.disabled = false;
            console.log("✅ Botão 'Selecionar' habilitado");
        }
        
        // Criar lista de opções
        desvantagem.opcoes.forEach((opcao, index) => {
            const opcaoItem = document.createElement('div');
            opcaoItem.className = 'opcao-item';
            opcaoItem.dataset.index = index;
            opcaoItem.dataset.opcaoId = opcao.id;
            
            const custoClass = opcao.custo < 0 ? 'negativo' : '';
            
            opcaoItem.innerHTML = `
                <div class="opcao-header">
                    <h4 class="opcao-nome">${opcao.nome}</h4>
                    <span class="opcao-custo ${custoClass}">${opcao.custo} pts</span>
                </div>
                <p class="opcao-descricao">${opcao.descricao || ''}</p>
            `;
            
            // Evento de clique
            opcaoItem.addEventListener('click', () => {
                console.log(`📌 Selecionou opção: ${opcao.nome}`);
                
                // Remover seleção anterior
                document.querySelectorAll('.opcao-item').forEach(item => {
                    item.classList.remove('selecionada');
                });
                
                // Selecionar esta opção
                opcaoItem.classList.add('selecionada');
                this.opcaoSelecionada = opcao;
                
                // Garantir que o botão está habilitado
                if (btnConfirmar) {
                    btnConfirmar.disabled = false;
                }
                
                console.log(`✅ Opção definida: ${opcao.nome} (${opcao.custo} pts)`);
            });
            
            // Evento de toque para mobile
            opcaoItem.addEventListener('touchend', (e) => {
                e.preventDefault();
                console.log(`📱 Toque em opção: ${opcao.nome}`);
                
                document.querySelectorAll('.opcao-item').forEach(item => {
                    item.classList.remove('selecionada');
                });
                
                opcaoItem.classList.add('selecionada');
                this.opcaoSelecionada = opcao;
                
                if (btnConfirmar) {
                    btnConfirmar.disabled = false;
                }
            });
            
            corpo.appendChild(opcaoItem);
        });
        
        // Selecionar primeira opção automaticamente
        if (desvantagem.opcoes.length > 0) {
            this.opcaoSelecionada = desvantagem.opcoes[0];
            setTimeout(() => {
                const primeiraOpcao = corpo.querySelector('.opcao-item');
                if (primeiraOpcao) {
                    primeiraOpcao.classList.add('selecionada');
                    console.log(`✅ Primeira opção selecionada automaticamente: ${desvantagem.opcoes[0].nome}`);
                }
            }, 50);
        }
        
        this.abrirModal('opcoes');
    }
    
    selecionarOpcaoFinal() {
        console.log('🎯 Função selecionarOpcaoFinal() chamada');
        console.log('📊 Estado atual:');
        console.log('- desvantagemSelecionada:', this.desvantagemSelecionada?.nome);
        console.log('- opcaoSelecionada:', this.opcaoSelecionada?.nome);
        
        // Verificar se temos os dados necessários
        if (!this.desvantagemSelecionada) {
            console.error('❌ Nenhuma desvantagem selecionada!');
            return;
        }
        
        // Se não tem opção selecionada, tentar recuperar do DOM
        if (!this.opcaoSelecionada) {
            console.warn('⚠️ Opção não selecionada no estado, tentando recuperar do DOM...');
            
            const opcaoSelecionadaDOM = document.querySelector('.opcao-item.selecionada');
            if (opcaoSelecionadaDOM && this.desvantagemSelecionada.opcoes) {
                const index = opcaoSelecionadaDOM.dataset.index;
                if (index !== undefined) {
                    this.opcaoSelecionada = this.desvantagemSelecionada.opcoes[index];
                    console.log(`✅ Opção recuperada do DOM: ${this.opcaoSelecionada?.nome}`);
                }
            }
            
            // Se ainda não tem, usar a primeira opção
            if (!this.opcaoSelecionada && this.desvantagemSelecionada.opcoes && this.desvantagemSelecionada.opcoes.length > 0) {
                this.opcaoSelecionada = this.desvantagemSelecionada.opcoes[0];
                console.log(`✅ Usando primeira opção: ${this.opcaoSelecionada.nome}`);
            }
        }
        
        // Se temos tudo que precisamos, adicionar
        if (this.desvantagemSelecionada && this.opcaoSelecionada) {
            console.log(`📊 Adicionando: ${this.opcaoSelecionada.nome} (${this.opcaoSelecionada.custo} pts)`);
            
            // Adicionar desvantagem
            this.adicionarDesvantagemComOpcao();
            
            // Fechar modal
            this.fecharModal('opcoes');
        } else {
            console.error('❌ Não foi possível determinar qual opção adicionar!');
        }
    }
    
    adicionarDesvantagemComOpcao() {
        if (!this.desvantagemSelecionada || !this.opcaoSelecionada) {
            console.error('❌ Dados incompletos para adicionar desvantagem!');
            return;
        }
        
        console.log(`🎯 Criando desvantagem adquirida: ${this.opcaoSelecionada.nome}`);
        
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
        console.log(`✅ Desvantagem adicionada com sucesso: ${desvantagemAdquirida.nome}`);
        
        // Atualizar interface
        this.atualizarTudo();
        
        // Resetar seleções
        this.desvantagemSelecionada = null;
        this.opcaoSelecionada = null;
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
    
    adicionarDesvantagem() {
        console.log("📝 Função adicionarDesvantagem() chamada");
        
        if (!this.desvantagemSelecionada) {
            console.error("❌ Nenhuma desvantagem selecionada!");
            return;
        }
        
        let custo = 0;
        let nomeExibicao = this.desvantagemSelecionada.nome;
        
        console.log(`📝 Processando: ${nomeExibicao}`);
        console.log(`📊 temOpcoes: ${this.desvantagemSelecionada.temOpcoes}`);
        console.log(`📊 opcaoSelecionada:`, this.opcaoSelecionada);
        
        // Determinar custo e nome baseado nas opções
        if (this.desvantagemSelecionada.temOpcoes) {
            if (this.opcaoSelecionada) {
                // Usar opção selecionada
                custo = this.opcaoSelecionada.custo;
                nomeExibicao = this.opcaoSelecionada.nome;
                console.log(`📊 Usando opção selecionada: ${nomeExibicao} (${custo} pts)`);
            } else if (this.desvantagemSelecionada.opcoes && this.desvantagemSelecionada.opcoes.length === 1) {
                // Usar única opção disponível
                const opcao = this.desvantagemSelecionada.opcoes[0];
                custo = opcao.custo;
                nomeExibicao = opcao.nome;
                this.opcaoSelecionada = opcao;
                console.log(`📊 Usando única opção: ${nomeExibicao} (${custo} pts)`);
            } else {
                console.error("❌ Nenhuma opção selecionada para desvantagem com opções múltiplas");
                console.log("📊 Número de opções:", this.desvantagemSelecionada.opcoes ? this.desvantagemSelecionada.opcoes.length : 0);
                return;
            }
        } else {
            // Sem opções
            custo = this.desvantagemSelecionada.custo;
            console.log(`📊 Sem opções, usando custo padrão: ${custo} pts`);
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
        this.configurarEventosLista();
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
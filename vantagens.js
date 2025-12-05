// vantagens.js - SISTEMA COMPLETO DE VANTAGENS
console.log("🚀 vantagens.js carregando...");

class SistemaVantagens {
    constructor() {
        console.log("🔧 SistemaVantagens iniciando...");
        this.vantagensAdquiridas = [];
        this.vantagensDisponiveis = [];
        this.modalAtivo = null;
        this.opcaoSelecionada = null;
        this.itemSelecionado = null;
        this.tipoSelecionado = null; // 'vantagem' ou 'desvantagem'
        
        this.init();
    }
    
    init() {
        console.log("📦 Carregando catálogos...");
        this.carregarCatalogoVantagens();
        
        console.log("🎯 Configurando eventos...");
        this.configurarEventos();
        
        console.log("🔄 Atualizando interface...");
        this.atualizarListas();
        this.atualizarContadores();
        this.atualizarTotais();
        
        console.log("✅ SistemaVantagens pronto!");
    }
    
    carregarCatalogoVantagens() {
        console.log("📚 Procurando catálogo de vantagens...");
        if (window.catalogoVantagens && Array.isArray(window.catalogoVantagens)) {
            this.vantagensDisponiveis = [...window.catalogoVantagens];
            console.log(`✅ ${this.vantagensDisponiveis.length} vantagens carregadas`);
        } else {
            console.error("❌ Catálogo de vantagens não encontrado ou inválido!");
            this.vantagensDisponiveis = [];
        }
    }
    
    configurarEventos() {
        // Busca vantagens
        const buscaVantagens = document.getElementById('busca-vantagens');
        if (buscaVantagens) {
            buscaVantagens.addEventListener('input', (e) => {
                this.filtrarItens(e.target.value, 'vantagem');
            });
        }
        
        // Busca desvantagens
        const buscaDesvantagens = document.getElementById('busca-desvantagens');
        if (buscaDesvantagens) {
            buscaDesvantagens.addEventListener('input', (e) => {
                this.filtrarItens(e.target.value, 'desvantagem');
            });
        }
        
        // Botão adicionar peculiaridade
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
        
        // Modais
        this.configurarModais();
        
        // Eventos de touch para mobile
        this.configurarTouchEvents();
    }
    
    configurarModais() {
        // Modal de vantagem
        const modalVantagem = document.getElementById('modal-vantagem');
        if (modalVantagem) {
            modalVantagem.querySelector('.modal-close').addEventListener('click', () => {
                this.fecharModal('vantagem');
            });
            
            modalVantagem.querySelector('.btn-cancelar').addEventListener('click', () => {
                this.fecharModal('vantagem');
            });
            
            modalVantagem.querySelector('.btn-confirmar').addEventListener('click', () => {
                this.adicionarItemSelecionado();
            });
        }
        
        // Modal de opções
        const modalOpcoes = document.getElementById('modal-opcoes');
        if (modalOpcoes) {
            modalOpcoes.querySelector('.modal-close').addEventListener('click', () => {
                this.fecharModal('opcoes');
            });
            
            modalOpcoes.querySelector('.btn-cancelar').addEventListener('click', () => {
                this.fecharModal('opcoes');
                // Voltar para o modal anterior
                if (this.tipoSelecionado) {
                    setTimeout(() => {
                        this.abrirModalItem(this.itemSelecionado, this.tipoSelecionado);
                    }, 100);
                }
            });
            
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
        
        // Tecla ESC para fechar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalAtivo) {
                this.fecharModal(this.modalAtivo);
            }
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
        
        // Prevenir zoom duplo-tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
    
    filtrarItens(termo, tipo) {
        const idLista = tipo === 'vantagem' ? 'lista-vantagens' : 'lista-desvantagens';
        const listaContainer = document.getElementById(idLista);
        if (!listaContainer) return;
        
        termo = termo.toLowerCase().trim();
        
        // Limpar lista atual
        listaContainer.innerHTML = '';
        
        const itensDisponiveis = tipo === 'vantagem' ? this.vantagensDisponiveis : window.catalogoDesvantagens || [];
        
        if (!itensDisponiveis || itensDisponiveis.length === 0) {
            listaContainer.innerHTML = `<div class="lista-vazia">Nenhuma ${tipo} disponível</div>`;
            return;
        }
        
        // Filtrar itens
        const itensFiltrados = itensDisponiveis.filter(item => {
            if (!item) return false;
            return item.nome.toLowerCase().includes(termo) ||
                   (item.descricao && item.descricao.toLowerCase().includes(termo)) ||
                   (item.categoria && item.categoria.toLowerCase().includes(termo));
        });
        
        if (itensFiltrados.length === 0) {
            listaContainer.innerHTML = `<div class="lista-vazia">Nenhuma ${tipo} encontrada para "${termo}"</div>`;
            return;
        }
        
        // Renderizar itens filtrados
        itensFiltrados.forEach(item => {
            const itemElement = this.criarItemLista(item, tipo);
            listaContainer.appendChild(itemElement);
        });
        
        // Atualizar contador
        const idContador = tipo === 'vantagem' ? 'contador-vantagens' : 'contador-desvantagens';
        const contador = document.getElementById(idContador);
        if (contador) {
            const texto = tipo === 'vantagem' ? 'vantagem' : 'desvantagem';
            contador.textContent = `${itensFiltrados.length} ${texto}${itensFiltrados.length !== 1 ? 's' : ''}`;
        }
    }
    
    criarItemLista(item, tipo) {
        const itemElement = document.createElement('div');
        itemElement.className = 'item-lista';
        itemElement.dataset.id = item.id;
        itemElement.dataset.tipo = tipo;
        
        let custoTexto = '';
        if (item.temOpcoes) {
            custoTexto = 'Varia';
        } else {
            custoTexto = `${item.custo} pts`;
        }
        
        const custoClass = tipo === 'desvantagem' && item.custo < 0 ? 'negativo' : '';
        
        itemElement.innerHTML = `
            <div class="item-header">
                <h4 class="item-nome">${item.nome}</h4>
                <span class="item-custo ${custoClass}">${custoTexto}</span>
            </div>
            <p class="item-descricao">${item.descricao ? item.descricao.substring(0, 150) + (item.descricao.length > 150 ? '...' : '') : ''}</p>
            ${item.categoria ? `<span class="item-categoria">${item.categoria}</span>` : ''}
        `;
        
        // Evento de clique
        itemElement.addEventListener('click', () => {
            this.selecionarItem(item, tipo);
        });
        
        // Evento de toque para mobile
        itemElement.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.selecionarItem(item, tipo);
        });
        
        return itemElement;
    }
    
    selecionarItem(item, tipo) {
        console.log(`🔍 Selecionado: ${item.nome} (${tipo})`);
        this.itemSelecionado = item;
        this.tipoSelecionado = tipo;
        
        // Resetar opção selecionada
        this.opcaoSelecionada = null;
        
        if (item.temOpcoes && item.opcoes && item.opcoes.length > 1) {
            // Abrir modal de opções
            this.abrirModalOpcoes(item, tipo);
        } else {
            // Abrir modal direto
            this.abrirModalItem(item, tipo);
        }
    }
    
    abrirModalOpcoes(item, tipo) {
        console.log(`📋 Abrindo modal de opções para: ${item.nome}`);
        
        const modal = document.getElementById('modal-opcoes');
        const corpo = document.getElementById('modal-corpo-opcoes');
        const titulo = document.getElementById('modal-titulo-opcoes');
        const btnConfirmar = modal.querySelector('.btn-confirmar');
        
        if (!modal || !corpo) {
            console.error('Modal de opções não encontrado!');
            return;
        }
        
        titulo.textContent = `Escolha uma opção: ${item.nome}`;
        corpo.innerHTML = '';
        
        // Criar lista de opções
        item.opcoes.forEach((opcao, index) => {
            const opcaoItem = document.createElement('div');
            opcaoItem.className = 'opcao-item';
            opcaoItem.dataset.index = index;
            opcaoItem.dataset.custo = opcao.custo;
            
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
                this.selecionarOpcaoNoModal(opcao, opcaoItem, btnConfirmar);
            });
            
            // Evento de toque para mobile
            opcaoItem.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.selecionarOpcaoNoModal(opcao, opcaoItem, btnConfirmar);
            });
            
            corpo.appendChild(opcaoItem);
        });
        
        // Resetar seleção
        this.opcaoSelecionada = null;
        btnConfirmar.disabled = true;
        
        this.abrirModal('opcoes');
    }
    
    selecionarOpcaoNoModal(opcao, opcaoItem, btnConfirmar) {
        console.log(`📌 Opção selecionada: ${opcao.nome} (${opcao.custo} pts)`);
        
        // Remover seleção anterior
        document.querySelectorAll('.opcao-item').forEach(item => {
            item.classList.remove('selecionada');
        });
        
        // Selecionar esta opção
        opcaoItem.classList.add('selecionada');
        this.opcaoSelecionada = opcao;
        btnConfirmar.disabled = false;
    }
    
    abrirModalItem(item, tipo) {
        const modalId = tipo === 'vantagem' ? 'modal-vantagem' : 'modal-desvantagem';
        const modal = document.getElementById(modalId);
        
        if (!modal) {
            console.error(`Modal ${modalId} não encontrado!`);
            return;
        }
        
        const corpoId = tipo === 'vantagem' ? 'modal-corpo-vantagem' : 'modal-corpo-desvantagem';
        const corpo = document.getElementById(corpoId);
        const tituloId = tipo === 'vantagem' ? 'modal-titulo-vantagem' : 'modal-titulo-desvantagem';
        const titulo = document.getElementById(tituloId);
        const btnConfirmar = modal.querySelector('.btn-confirmar');
        
        if (!corpo || !titulo || !btnConfirmar) {
            console.error('Elementos do modal não encontrados!');
            return;
        }
        
        titulo.textContent = item.nome;
        
        let custo = item.custo || 0;
        let nomeExibicao = item.nome;
        
        // Se tem opções mas só uma, usar a primeira opção
        if (item.temOpcoes && item.opcoes && item.opcoes.length === 1) {
            const opcao = item.opcoes[0];
            custo = opcao.custo;
            nomeExibicao = opcao.nome;
            this.opcaoSelecionada = opcao;
        } else if (!item.temOpcoes) {
            this.opcaoSelecionada = null;
        }
        
        corpo.innerHTML = `
            <div class="modal-info">
                <p><strong>Descrição:</strong> ${item.descricao || ''}</p>
                ${item.categoria ? `<p><strong>Categoria:</strong> ${item.categoria}</p>` : ''}
                ${item.prerequisitos && item.prerequisitos.length > 0 ? `<p><strong>Pré-requisitos:</strong> ${item.prerequisitos.join(', ')}</p>` : ''}
                ${item.notas ? `<p><strong>Notas:</strong> ${item.notas}</p>` : ''}
            </div>
            <div class="pericia-custo-container">
                <div class="pericia-custo ${custo < 0 ? 'negativo' : ''}">${tipo === 'vantagem' ? 'Custo' : 'Valor'}: ${custo} pontos</div>
                ${item.temOpcoes && item.opcoes && item.opcoes.length > 1 ? 
                  `<div class="pericia-custo-adicional">(Esta ${tipo} tem múltiplas opções)</div>` : ''}
            </div>
        `;
        
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = tipo === 'vantagem' ? 'Adicionar Vantagem' : 'Adicionar Desvantagem';
        
        this.abrirModal(tipo);
    }
    
    selecionarOpcao() {
        console.log('✅ Confirmando seleção de opção...');
        
        if (!this.opcaoSelecionada || !this.itemSelecionado || !this.tipoSelecionado) {
            console.error('❌ Faltam dados para selecionar opção!');
            console.log('opcaoSelecionada:', this.opcaoSelecionada);
            console.log('itemSelecionado:', this.itemSelecionado);
            console.log('tipoSelecionado:', this.tipoSelecionado);
            alert('Por favor, selecione uma opção primeiro.');
            return;
        }
        
        console.log(`🎯 Adicionando: ${this.opcaoSelecionada.nome} (${this.opcaoSelecionada.custo} pts)`);
        
        // Fechar modal de opções
        this.fecharModal('opcoes');
        
        // ADICIONAR DIRETAMENTE O ITEM COM A OPÇÃO SELECIONADA
        this.adicionarItemComOpcaoSelecionada();
    }
    
    adicionarItemComOpcaoSelecionada() {
        if (!this.itemSelecionado || !this.tipoSelecionado || !this.opcaoSelecionada) {
            console.error('❌ Não há item ou opção selecionada!');
            return;
        }
        
        let itemParaAdicionar = { ...this.itemSelecionado };
        let custo = this.opcaoSelecionada.custo;
        let nomeExibicao = this.opcaoSelecionada.nome;
        
        console.log(`📊 Adicionando ${this.tipoSelecionado}: ${nomeExibicao} por ${custo} pontos`);
        
        // Adicionar à lista correta
        if (this.tipoSelecionado === 'vantagem') {
            const vantagemAdquirida = {
                id: itemParaAdicionar.id + '-' + Date.now(),
                baseId: itemParaAdicionar.id,
                nome: nomeExibicao,
                nomeBase: this.itemSelecionado.nome,
                custo: custo,
                descricao: this.opcaoSelecionada.descricao || itemParaAdicionar.descricao,
                categoria: itemParaAdicionar.categoria,
                dataAdquisicao: new Date().toISOString(),
                opcaoSelecionada: this.opcaoSelecionada
            };
            
            this.vantagensAdquiridas.push(vantagemAdquirida);
            console.log(`✅ Vantagem adicionada: ${nomeExibicao} (${custo} pts)`);
        } else {
            // Para desvantagens (usando sistema unificado)
            const desvantagemAdquirida = {
                id: itemParaAdicionar.id + '-' + Date.now(),
                baseId: itemParaAdicionar.id,
                nome: nomeExibicao,
                nomeBase: this.itemSelecionado.nome,
                custo: custo,
                descricao: this.opcaoSelecionada.descricao || itemParaAdicionar.descricao,
                categoria: itemParaAdicionar.categoria,
                dataAdquisicao: new Date().toISOString(),
                opcaoSelecionada: this.opcaoSelecionada
            };
            
            // Se tiver sistema de desvantagens separado
            if (window.sistemaDesvantagens) {
                window.sistemaDesvantagens.desvantagensAdquiridas.push(desvantagemAdquirida);
            }
            console.log(`✅ Desvantagem adicionada: ${nomeExibicao} (${custo} pts)`);
        }
        
        // Atualizar interface
        this.atualizarListas();
        this.atualizarContadores();
        this.atualizarTotais();
        
        // Resetar seleções
        this.itemSelecionado = null;
        this.tipoSelecionado = null;
        this.opcaoSelecionada = null;
    }
    
    adicionarItemSelecionado() {
        if (!this.itemSelecionado || !this.tipoSelecionado) {
            console.error('❌ Nenhum item selecionado!');
            return;
        }
        
        let itemParaAdicionar = { ...this.itemSelecionado };
        let custo = 0;
        let nomeExibicao = this.itemSelecionado.nome;
        
        console.log(`📝 Adicionando ${this.tipoSelecionado}: ${nomeExibicao}`);
        
        // Determinar custo e nome baseado nas opções
        if (this.itemSelecionado.temOpcoes) {
            if (this.opcaoSelecionada) {
                // Usar opção selecionada
                itemParaAdicionar.opcaoSelecionada = this.opcaoSelecionada;
                custo = this.opcaoSelecionada.custo;
                nomeExibicao = this.opcaoSelecionada.nome;
            } else if (this.itemSelecionado.opcoes && this.itemSelecionado.opcoes.length === 1) {
                // Usar única opção disponível
                itemParaAdicionar.opcaoSelecionada = this.itemSelecionado.opcoes[0];
                custo = this.itemSelecionado.opcoes[0].custo;
                nomeExibicao = this.itemSelecionado.opcoes[0].nome;
            } else {
                console.error('❌ Nenhuma opção selecionada para item com opções múltiplas');
                alert('Por favor, selecione uma opção primeiro.');
                return;
            }
        } else {
            // Sem opções
            custo = this.itemSelecionado.custo;
        }
        
        // Adicionar à lista correta
        if (this.tipoSelecionado === 'vantagem') {
            const vantagemAdquirida = {
                id: itemParaAdicionar.id + '-' + Date.now(),
                baseId: itemParaAdicionar.id,
                nome: nomeExibicao,
                nomeBase: this.itemSelecionado.nome,
                custo: custo,
                descricao: itemParaAdicionar.descricao,
                categoria: itemParaAdicionar.categoria,
                dataAdquisicao: new Date().toISOString(),
                opcaoSelecionada: itemParaAdicionar.opcaoSelecionada || null
            };
            
            this.vantagensAdquiridas.push(vantagemAdquirida);
            console.log(`✅ Vantagem adicionada: ${nomeExibicao} (${custo} pts)`);
        } else {
            // Para desvantagens
            const desvantagemAdquirida = {
                id: itemParaAdicionar.id + '-' + Date.now(),
                baseId: itemParaAdicionar.id,
                nome: nomeExibicao,
                nomeBase: this.itemSelecionado.nome,
                custo: custo,
                descricao: itemParaAdicionar.descricao,
                categoria: itemParaAdicionar.categoria,
                dataAdquisicao: new Date().toISOString(),
                opcaoSelecionada: itemParaAdicionar.opcaoSelecionada || null
            };
            
            // Se tiver sistema de desvantagens separado
            if (window.sistemaDesvantagens) {
                window.sistemaDesvantagens.desvantagensAdquiridas.push(desvantagemAdquirida);
            }
            console.log(`✅ Desvantagem adicionada: ${nomeExibicao} (${custo} pts)`);
        }
        
        // Atualizar interface
        this.atualizarListas();
        this.atualizarContadores();
        this.atualizarTotais();
        
        // Fechar modal
        this.fecharModal(this.tipoSelecionado);
        
        // Resetar seleções
        this.itemSelecionado = null;
        this.tipoSelecionado = null;
        this.opcaoSelecionada = null;
    }
    
    removerItem(id, tipo) {
        console.log(`🗑️ Removendo ${tipo} com ID: ${id}`);
        
        if (tipo === 'vantagem') {
            this.vantagensAdquiridas = this.vantagensAdquiridas.filter(v => v.id !== id);
        } else {
            if (window.sistemaDesvantagens) {
                window.sistemaDesvantagens.desvantagensAdquiridas = 
                    window.sistemaDesvantagens.desvantagensAdquiridas.filter(d => d.id !== id);
            }
        }
        
        this.atualizarListas();
        this.atualizarContadores();
        this.atualizarTotais();
    }
    
    atualizarListas() {
        this.atualizarListaDisponiveis('vantagem');
        this.atualizarListaDisponiveis('desvantagem');
        this.atualizarListaAdquiridas('vantagem');
        this.atualizarListaAdquiridas('desvantagem');
        this.atualizarListaPeculiaridades();
    }
    
    atualizarListaDisponiveis(tipo) {
        const idLista = tipo === 'vantagem' ? 'lista-vantagens' : 'lista-desvantagens';
        const listaContainer = document.getElementById(idLista);
        if (!listaContainer) return;
        
        listaContainer.innerHTML = '';
        
        const itensDisponiveis = tipo === 'vantagem' ? this.vantagensDisponiveis : window.catalogoDesvantagens || [];
        
        if (!itensDisponiveis || itensDisponiveis.length === 0) {
            listaContainer.innerHTML = `<div class="lista-vazia">Nenhuma ${tipo} disponível</div>`;
            return;
        }
        
        itensDisponiveis.forEach(item => {
            const itemElement = this.criarItemLista(item, tipo);
            listaContainer.appendChild(itemElement);
        });
    }
    
    atualizarListaAdquiridas(tipo) {
        const idLista = tipo === 'vantagem' ? 'vantagens-adquiridas' : 'desvantagens-adquiridas';
        const listaContainer = document.getElementById(idLista);
        if (!listaContainer) return;
        
        listaContainer.innerHTML = '';
        
        const itensAdquiridos = tipo === 'vantagem' ? 
            this.vantagensAdquiridas : 
            (window.sistemaDesvantagens ? window.sistemaDesvantagens.desvantagensAdquiridas : []);
        
        if (!itensAdquiridos || itensAdquiridos.length === 0) {
            listaContainer.innerHTML = `<div class="lista-vazia">Nenhuma ${tipo} adquirida</div>`;
            return;
        }
        
        itensAdquiridos.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = tipo === 'vantagem' ? 
                'item-lista item-adquirido' : 
                'item-lista item-adquirido desvantagem-adquirida';
            itemElement.dataset.id = item.id;
            itemElement.dataset.tipo = tipo;
            
            const custoClass = item.custo < 0 ? 'negativo' : '';
            
            itemElement.innerHTML = `
                <div class="item-header">
                    <h4 class="item-nome">${item.nome}</h4>
                    <span class="item-custo ${custoClass}">${item.custo} pts</span>
                    <button class="btn-remover" title="Remover ${tipo}" aria-label="Remover ${tipo}">×</button>
                </div>
                <p class="item-descricao">${item.descricao ? item.descricao.substring(0, 120) + (item.descricao.length > 120 ? '...' : '') : ''}</p>
                ${item.categoria ? `<span class="item-categoria">${item.categoria}</span>` : ''}
                ${item.nomeBase && item.nomeBase !== item.nome ? 
                  `<small style="color:#95a5a6;display:block;margin-top:4px;">(${item.nomeBase})</small>` : ''}
            `;
            
            // Botão remover
            const btnRemover = itemElement.querySelector('.btn-remover');
            btnRemover.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removerItem(item.id, tipo);
            });
            
            listaContainer.appendChild(itemElement);
        });
    }
    
    atualizarContadores() {
        // Contador de vantagens
        const contadorVantagens = document.getElementById('contador-vantagens');
        if (contadorVantagens) {
            contadorVantagens.textContent = `${this.vantagensDisponiveis.length} vantagem${this.vantagensDisponiveis.length !== 1 ? 's' : ''}`;
        }
        
        // Contador de desvantagens
        const contadorDesvantagens = document.getElementById('contador-desvantagens');
        if (contadorDesvantagens) {
            const totalDesvantagens = window.catalogoDesvantagens ? window.catalogoDesvantagens.length : 0;
            contadorDesvantagens.textContent = `${totalDesvantagens} desvantagem${totalDesvantagens !== 1 ? 'ns' : ''}`;
        }
        
        // Totais adquiridos
        const totalVantagensAdquiridas = document.getElementById('total-vantagens-adquiridas');
        if (totalVantagensAdquiridas) {
            const total = this.vantagensAdquiridas.reduce((sum, v) => sum + v.custo, 0);
            totalVantagensAdquiridas.textContent = `${total} pts`;
        }
        
        const totalDesvantagensAdquiridas = document.getElementById('total-desvantagens-adquiridas');
        if (totalDesvantagensAdquiridas) {
            const desvantagensAdquiridas = window.sistemaDesvantagens ? 
                window.sistemaDesvantagens.desvantagensAdquiridas : [];
            const total = desvantagensAdquiridas.reduce((sum, d) => sum + d.custo, 0);
            totalDesvantagensAdquiridas.textContent = `${total} pts`;
        }
    }
    
    atualizarTotais() {
        console.log('💰 Atualizando totais...');
        
        // Calcular totais
        const totalVantagens = this.vantagensAdquiridas.reduce((sum, v) => sum + v.custo, 0);
        
        const desvantagensAdquiridas = window.sistemaDesvantagens ? 
            window.sistemaDesvantagens.desvantagensAdquiridas : [];
        const totalDesvantagens = desvantagensAdquiridas.reduce((sum, d) => sum + d.custo, 0);
        
        // Calcular peculiaridades
        const peculiaridades = this.obterPeculiaridades();
        const totalPeculiaridades = -peculiaridades.length; // -1 ponto cada
        
        // Saldo total
        const saldoTotal = totalVantagens + totalDesvantagens + totalPeculiaridades;
        
        console.log(`📊 Cálculos: Vantagens=${totalVantagens}, Desvantagens=${totalDesvantagens}, Peculiaridades=${totalPeculiaridades}, Total=${saldoTotal}`);
        
        // Atualizar elementos
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
            // Cor baseada no saldo
            if (saldoTotal > 0) {
                elSaldoTotal.style.color = '#27ae60';
            } else if (saldoTotal < 0) {
                elSaldoTotal.style.color = '#e74c3c';
            } else {
                elSaldoTotal.style.color = '#ffd700';
            }
        }
        
        // Disparar evento de atualização
        window.dispatchEvent(new CustomEvent('vantagensAtualizadas', {
            detail: {
                totalVantagens,
                totalDesvantagens,
                totalPeculiaridades,
                saldoTotal
            }
        }));
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
                <button class="peculiaridade-remover" title="Remover peculiaridade" aria-label="Remover peculiaridade">×</button>
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
        console.log(`📂 Abrindo modal: ${tipo}`);
        
        this.modalAtivo = tipo;
        const modal = document.getElementById(`modal-${tipo}`);
        
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Foco no primeiro elemento interativo
            setTimeout(() => {
                const primeiroBotao = modal.querySelector('button');
                if (primeiroBotao && !primeiroBotao.disabled) {
                    primeiroBotao.focus();
                }
            }, 100);
            
            // Para mobile: adicionar classe de prevenção de scroll
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
        
        // Resetar seleções se for modal de item
        if (tipo === 'vantagem' || tipo === 'desvantagem') {
            this.itemSelecionado = null;
            this.tipoSelecionado = null;
            this.opcaoSelecionada = null;
        }
    }
    
    // Função para obter todas as vantagens adquiridas
    obterVantagensAdquiridas() {
        return [...this.vantagensAdquiridas];
    }
    
    // Função para obter todas as desvantagens adquiridas
    obterDesvantagensAdquiridas() {
        return window.sistemaDesvantagens ? 
            [...window.sistemaDesvantagens.desvantagensAdquiridas] : 
            [];
    }
    
    // Função para calcular saldo total
    calcularSaldoTotal() {
        return this.atualizarTotais();
    }
}

// Inicializar sistema quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log("🏁 DOM pronto, inicializando SistemaVantagens...");
    window.sistemaVantagens = new SistemaVantagens();
    
    // Garantir que as listas sejam atualizadas após carregar tudo
    setTimeout(() => {
        if (window.sistemaVantagens) {
            window.sistemaVantagens.atualizarListas();
            window.sistemaVantagens.atualizarTotais();
        }
    }, 500);
});

console.log("📄 vantagens.js carregado (aguardando DOM)...");

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.SistemaVantagens = SistemaVantagens;
}
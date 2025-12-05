// vantagens.js - SISTEMA COMPLETO DE VANTAGENS E DESVANTAGENS
console.log("🚀 vantagens.js carregando...");

class SistemaVantagens {
    constructor() {
        console.log("🔧 SistemaVantagens iniciando...");
        this.vantagensAdquiridas = [];
        this.vantagensDisponiveis = [];
        this.desvantagensAdquiridas = [];
        this.desvantagensDisponiveis = [];
        this.modalAtivo = null;
        this.opcaoSelecionada = null;
        this.itemSelecionado = null;
        this.tipoSelecionado = null; // 'vantagem' ou 'desvantagem'
        
        this.init();
    }
    
    init() {
        console.log("📦 Carregando catálogos...");
        this.carregarCatalogoVantagens();
        this.carregarCatalogoDesvantagens();
        
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
            console.log("window.catalogoVantagens:", window.catalogoVantagens);
            this.vantagensDisponiveis = [];
        }
    }
    
    carregarCatalogoDesvantagens() {
        console.log("📚 Procurando catálogo de desvantagens...");
        if (window.catalogoDesvantagens && Array.isArray(window.catalogoDesvantagens)) {
            this.desvantagensDisponiveis = [...window.catalogoDesvantagens];
            console.log(`✅ ${this.desvantagensDisponiveis.length} desvantagens carregadas`);
        } else {
            console.error("❌ Catálogo de desvantagens não encontrado ou inválido!");
            console.log("window.catalogoDesvantagens:", window.catalogoDesvantagens);
            this.desvantagensDisponiveis = [];
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
        
        // Modal de desvantagem
        const modalDesvantagem = document.getElementById('modal-desvantagem');
        if (modalDesvantagem) {
            modalDesvantagem.querySelector('.modal-close').addEventListener('click', () => {
                this.fecharModal('desvantagem');
            });
            
            modalDesvantagem.querySelector('.btn-cancelar').addEventListener('click', () => {
                this.fecharModal('desvantagem');
            });
            
            modalDesvantagem.querySelector('.btn-confirmar').addEventListener('click', () => {
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
                    this.abrirModal(this.tipoSelecionado);
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
    }
    
    filtrarItens(termo, tipo) {
        const idLista = tipo === 'vantagem' ? 'lista-vantagens' : 'lista-desvantagens';
        const listaContainer = document.getElementById(idLista);
        if (!listaContainer) return;
        
        termo = termo.toLowerCase().trim();
        
        // Limpar lista atual
        listaContainer.innerHTML = '';
        
        const itensDisponiveis = tipo === 'vantagem' ? this.vantagensDisponiveis : this.desvantagensDisponiveis;
        
        if (itensDisponiveis.length === 0) {
            listaContainer.innerHTML = `<div class="lista-vazia">Nenhuma ${tipo} disponível</div>`;
            return;
        }
        
        // Filtrar itens
        const itensFiltrados = itensDisponiveis.filter(item => {
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
        
        itemElement.addEventListener('click', () => {
            this.selecionarItem(item, tipo);
        });
        
        return itemElement;
    }
    
    selecionarItem(item, tipo) {
        console.log(`🔍 Selecionado: ${item.nome} (${tipo})`);
        this.itemSelecionado = item;
        this.tipoSelecionado = tipo;
        
        if (item.temOpcoes && item.opcoes && item.opcoes.length > 1) {
            // Abrir modal de opções
            this.abrirModalOpcoes(item, tipo);
        } else {
            // Abrir modal direto
            this.abrirModalItem(item, tipo);
        }
    }
    
    abrirModalOpcoes(item, tipo) {
        const modal = document.getElementById('modal-opcoes');
        const corpo = document.getElementById('modal-corpo-opcoes');
        const titulo = document.getElementById('modal-titulo-opcoes');
        const btnConfirmar = modal.querySelector('.btn-confirmar');
        
        if (!modal || !corpo) return;
        
        titulo.textContent = `Escolha uma opção: ${item.nome}`;
        corpo.innerHTML = '';
        
        // Criar lista de opções
        item.opcoes.forEach((opcao, index) => {
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
    
    abrirModalItem(item, tipo) {
        const modalId = tipo === 'vantagem' ? 'modal-vantagem' : 'modal-desvantagem';
        const modal = document.getElementById(modalId);
        const corpoId = tipo === 'vantagem' ? 'modal-corpo-vantagem' : 'modal-corpo-desvantagem';
        const corpo = document.getElementById(corpoId);
        const tituloId = tipo === 'vantagem' ? 'modal-titulo-vantagem' : 'modal-titulo-desvantagem';
        const titulo = document.getElementById(tituloId);
        const btnConfirmar = modal.querySelector('.btn-confirmar');
        
        if (!modal || !corpo) return;
        
        titulo.textContent = item.nome;
        
        let custo = item.custo;
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
        if (!this.opcaoSelecionada || !this.itemSelecionado || !this.tipoSelecionado) return;
        
        // Fechar modal de opções
        this.fecharModal('opcoes');
        
        // Abrir modal do item com a opção selecionada
        this.abrirModalItem(this.itemSelecionado, this.tipoSelecionado);
    }
    
    adicionarItemSelecionado() {
        if (!this.itemSelecionado || !this.tipoSelecionado) return;
        
        let itemParaAdicionar = { ...this.itemSelecionado };
        let custo = 0;
        let nomeExibicao = this.itemSelecionado.nome;
        
        // Determinar custo e nome baseado nas opções
        if (this.itemSelecionado.temOpcoes) {
            if (this.opcaoSelecionada) {
                itemParaAdicionar.opcaoSelecionada = this.opcaoSelecionada;
                custo = this.opcaoSelecionada.custo;
                nomeExibicao = this.opcaoSelecionada.nome;
            } else if (this.itemSelecionado.opcoes && this.itemSelecionado.opcoes.length === 1) {
                itemParaAdicionar.opcaoSelecionada = this.itemSelecionado.opcoes[0];
                custo = this.itemSelecionado.opcoes[0].custo;
                nomeExibicao = this.itemSelecionado.opcoes[0].nome;
            } else {
                console.error("Nenhuma opção selecionada para item com opções múltiplas");
                return;
            }
        } else {
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
        } else {
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
            
            this.desvantagensAdquiridas.push(desvantagemAdquirida);
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
        if (tipo === 'vantagem') {
            this.vantagensAdquiridas = this.vantagensAdquiridas.filter(v => v.id !== id);
        } else {
            this.desvantagensAdquiridas = this.desvantagensAdquiridas.filter(d => d.id !== id);
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
        
        const itensDisponiveis = tipo === 'vantagem' ? this.vantagensDisponiveis : this.desvantagensDisponiveis;
        
        if (itensDisponiveis.length === 0) {
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
        
        const itensAdquiridos = tipo === 'vantagem' ? this.vantagensAdquiridas : this.desvantagensAdquiridas;
        
        if (itensAdquiridos.length === 0) {
            listaContainer.innerHTML = `<div class="lista-vazia">Nenhuma ${tipo} adquirida</div>`;
            return;
        }
        
        itensAdquiridos.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = tipo === 'vantagem' ? 'item-lista item-adquirido' : 'item-lista item-adquirido desvantagem-adquirida';
            itemElement.dataset.id = item.id;
            itemElement.dataset.tipo = tipo;
            
            const custoClass = item.custo < 0 ? 'negativo' : '';
            
            itemElement.innerHTML = `
                <div class="item-header">
                    <h4 class="item-nome">${item.nome}</h4>
                    <span class="item-custo ${custoClass}">${item.custo} pts</span>
                    <button class="btn-remover" title="Remover ${tipo}">×</button>
                </div>
                <p class="item-descricao">${item.descricao ? item.descricao.substring(0, 120) + (item.descricao.length > 120 ? '...' : '') : ''}</p>
                ${item.categoria ? `<span class="item-categoria">${item.categoria}</span>` : ''}
                ${item.nomeBase !== item.nome ? `<small style="color:#95a5a6;display:block;margin-top:4px;">(${item.nomeBase})</small>` : ''}
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
            contadorDesvantagens.textContent = `${this.desvantagensDisponiveis.length} desvantagem${this.desvantagensDisponiveis.length !== 1 ? 'ns' : ''}`;
        }
        
        // Totais adquiridos
        const totalVantagensAdquiridas = document.getElementById('total-vantagens-adquiridas');
        if (totalVantagensAdquiridas) {
            const total = this.vantagensAdquiridas.reduce((sum, v) => sum + v.custo, 0);
            totalVantagensAdquiridas.textContent = `${total} pts`;
        }
        
        const totalDesvantagensAdquiridas = document.getElementById('total-desvantagens-adquiridas');
        if (totalDesvantagensAdquiridas) {
            const total = this.desvantagensAdquiridas.reduce((sum, d) => sum + d.custo, 0);
            totalDesvantagensAdquiridas.textContent = `${total} pts`;
        }
    }
    
    atualizarTotais() {
        // Calcular totais
        const totalVantagens = this.vantagensAdquiridas.reduce((sum, v) => sum + v.custo, 0);
        const totalDesvantagens = this.desvantagensAdquiridas.reduce((sum, d) => sum + d.custo, 0);
        
        // Calcular peculiaridades
        const peculiaridades = this.obterPeculiaridades();
        const totalPeculiaridades = -peculiaridades.length; // -1 ponto cada
        
        // Saldo total
        const saldoTotal = totalVantagens + totalDesvantagens + totalPeculiaridades;
        
        console.log(`💰 Cálculos: Vantagens=${totalVantagens}, Desvantagens=${totalDesvantagens}, Peculiaridades=${totalPeculiaridades}, Total=${saldoTotal}`);
        
        // Atualizar elementos
        const elTotalVantagens = document.getElementById('total-vantagens');
        if (elTotalVantagens) {
            elTotalVantagens.textContent = `+${totalVantagens} pts`;
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
        
        // Resetar seleções se for modal de item
        if (tipo === 'vantagem' || tipo === 'desvantagem') {
            this.itemSelecionado = null;
            this.tipoSelecionado = null;
            this.opcaoSelecionada = null;
        }
    }
}

// Inicializar sistema quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log("🏁 DOM pronto, inicializando SistemaVantagens...");
    window.sistemaVantagens = new SistemaVantagens();
});

console.log("📄 vantagens.js carregado (aguardando DOM)...");
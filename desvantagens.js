// desvantagens.js - SOLUÇÃO DEFINITIVA DO BUG
console.log("🚀 desvantagens.js carregando...");

class SistemaDesvantagens {
    constructor() {
        console.log("🔧 SistemaDesvantagens iniciando...");
        this.desvantagensAdquiridas = [];
        this.desvantagensDisponiveis = [];
        this.modalAtivo = null;
        this.opcaoSelecionada = null;
        this.desvantagemSelecionada = null;
        
        // Cache para armazenar seleções visuais
        this.opcaoVisualmenteSelecionada = null;
        
        this.init();
    }
    
    init() {
        console.log("📦 Carregando catálogo de desvantagens...");
        this.carregarDesvantagens();
        
        console.log("🎯 Configurando eventos...");
        this.configurarEventos();
        
        console.log("🔄 Atualizando interface...");
        this.atualizarTudo();
        
        console.log("✅ SistemaDesvantagens pronto!");
    }
    
    carregarDesvantagens() {
        if (window.catalogoDesvantagens && Array.isArray(window.catalogoDesvantagens)) {
            this.desvantagensDisponiveis = [...window.catalogoDesvantagens];
            console.log(`✅ ${this.desvantagensDisponiveis.length} desvantagens carregadas`);
        } else {
            console.error("❌ Catálogo de desvantagens não encontrado!");
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
        
        setTimeout(() => {
            this.configurarEventosLista();
        }, 100);
    }
    
    configurarEventosLista() {
        this.configurarEventosItensLista();
    }
    
    configurarEventosItensLista() {
        const itens = document.querySelectorAll('#lista-desvantagens .item-lista');
        
        itens.forEach(item => {
            if (item.dataset.initialized === "true") return;
            
            item.addEventListener('click', (e) => {
                const id = item.dataset.id;
                const desvantagem = this.desvantagensDisponiveis.find(d => d.id === id);
                if (desvantagem) {
                    this.selecionarDesvantagem(desvantagem);
                }
            });
            
            item.style.cursor = 'pointer';
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
                btnConfirmar.addEventListener('click', () => {
                    this.adicionarDesvantagem();
                });
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
                        setTimeout(() => {
                            this.abrirModalDesvantagem(this.desvantagemSelecionada);
                        }, 50);
                    }
                });
            }
            
            const btnConfirmarOpcao = modalOpcoes.querySelector('.btn-confirmar');
            if (btnConfirmarOpcao) {
                btnConfirmarOpcao.addEventListener('click', () => {
                    console.log("🔄 Processando seleção de opção...");
                    this.processarSelecaoOpcao();
                });
            }
        }
        
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.fecharModal(this.modalAtivo);
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalAtivo) {
                this.fecharModal(this.modalAtivo);
            }
        });
    }
    
    // NOVA FUNÇÃO: Processar seleção de opção de forma confiável
    processarSelecaoOpcao() {
        console.log("🔍 Buscando opção selecionada...");
        
        // PRIMEIRO: Verificar se temos opcaoSelecionada no estado
        if (this.opcaoSelecionada) {
            console.log(`✅ Opção já selecionada no estado: ${this.opcaoSelecionada.nome}`);
            this.selecionarOpcaoFinal();
            return;
        }
        
        // SEGUNDO: Verificar opção visualmente selecionada
        if (this.opcaoVisualmenteSelecionada) {
            console.log(`✅ Opção visualmente selecionada: ${this.opcaoVisualmenteSelecionada.nome}`);
            this.opcaoSelecionada = this.opcaoVisualmenteSelecionada;
            this.selecionarOpcaoFinal();
            return;
        }
        
        // TERCEIRO: Buscar no DOM por opção selecionada visualmente
        const opcaoSelecionadaDOM = document.querySelector('.opcao-item.selecionada');
        if (opcaoSelecionadaDOM) {
            console.log("✅ Encontrada opção selecionada no DOM");
            
            // Extrair dados da opção do DOM
            const index = opcaoSelecionadaDOM.dataset.index;
            const opcaoId = opcaoSelecionadaDOM.dataset.opcaoId;
            
            if (this.desvantagemSelecionada && this.desvantagemSelecionada.opcoes) {
                // Buscar opção correspondente
                let opcaoEncontrada = null;
                
                if (opcaoId) {
                    opcaoEncontrada = this.desvantagemSelecionada.opcoes.find(op => op.id === opcaoId);
                }
                
                if (!opcaoEncontrada && index !== undefined) {
                    opcaoEncontrada = this.desvantagemSelecionada.opcoes[parseInt(index)];
                }
                
                if (!opcaoEncontrada) {
                    // Última tentativa: pegar a primeira opção
                    opcaoEncontrada = this.desvantagemSelecionada.opcoes[0];
                }
                
                if (opcaoEncontrada) {
                    console.log(`✅ Opção recuperada: ${opcaoEncontrada.nome}`);
                    this.opcaoSelecionada = opcaoEncontrada;
                    this.selecionarOpcaoFinal();
                    return;
                }
            }
        }
        
        // QUARTO: Se chegou aqui, realmente não tem opção selecionada
        console.error("❌ NENHUMA opção foi selecionada!");
        alert('Por favor, selecione uma opção primeiro.');
    }
    
    // Função final para processar a seleção
    selecionarOpcaoFinal() {
        if (!this.desvantagemSelecionada || !this.opcaoSelecionada) {
            console.error("❌ Dados incompletos para adicionar desvantagem");
            return;
        }
        
        console.log(`🎯 Adicionando: ${this.opcaoSelecionada.nome} (${this.opcaoSelecionada.custo} pts)`);
        
        // Fechar modal de opções
        this.fecharModal('opcoes');
        
        // Adicionar desvantagem
        this.adicionarDesvantagemComOpcao();
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
        
        const desvantagensFiltradas = this.desvantagensDisponiveis.filter(desvantagem => {
            return desvantagem.nome.toLowerCase().includes(termo) ||
                   (desvantagem.descricao && desvantagem.descricao.toLowerCase().includes(termo)) ||
                   (desvantagem.categoria && desvantagem.categoria.toLowerCase().includes(termo));
        });
        
        if (desvantagensFiltradas.length === 0) {
            listaContainer.innerHTML = `<div class="lista-vazia">Nenhuma desvantagem encontrada para "${termo}"</div>`;
            return;
        }
        
        desvantagensFiltradas.forEach(desvantagem => {
            const item = this.criarItemDesvantagem(desvantagem);
            listaContainer.appendChild(item);
        });
        
        this.configurarEventosItensLista();
        
        const contador = document.getElementById('contador-desvantagens');
        if (contador) {
            contador.textContent = `${desvantagensFiltradas.length} desvantagem${desvantagensFiltradas.length !== 1 ? 'ns' : ''}`;
        }
    }
    
    criarItemDesvantagem(desvantagem) {
        const item = document.createElement('div');
        item.className = 'item-lista';
        item.dataset.id = desvantagem.id;
        
        let custoTexto = desvantagem.temOpcoes ? 'Varia' : `${desvantagem.custo} pts`;
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
        this.opcaoSelecionada = null;
        this.opcaoVisualmenteSelecionada = null;
        
        if (desvantagem.temOpcoes && desvantagem.opcoes && desvantagem.opcoes.length > 1) {
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
        
        // Resetar estado
        this.opcaoVisualmenteSelecionada = null;
        btnConfirmar.disabled = true;
        
        desvantagem.opcoes.forEach((opcao, index) => {
            const opcaoItem = document.createElement('div');
            opcaoItem.className = 'opcao-item';
            opcaoItem.dataset.index = index;
            opcaoItem.dataset.opcaoId = opcao.id;
            opcaoItem.dataset.opcaoNome = opcao.nome;
            opcaoItem.dataset.opcaoCusto = opcao.custo;
            
            const custoClass = opcao.custo < 0 ? 'negativo' : '';
            
            opcaoItem.innerHTML = `
                <div class="opcao-header">
                    <h4 class="opcao-nome">${opcao.nome}</h4>
                    <span class="opcao-custo ${custoClass}">${opcao.custo} pts</span>
                </div>
                <p class="opcao-descricao">${opcao.descricao || ''}</p>
            `;
            
            // Evento de clique MUITO SIMPLES
            opcaoItem.addEventListener('click', () => {
                console.log(`📌 Clique em opção: ${opcao.nome}`);
                
                // Remover seleção anterior
                document.querySelectorAll('.opcao-item').forEach(item => {
                    item.classList.remove('selecionada');
                });
                
                // Selecionar esta
                opcaoItem.classList.add('selecionada');
                
                // Armazenar a opção selecionada visualmente
                this.opcaoVisualmenteSelecionada = {
                    ...opcao,
                    elemento: opcaoItem
                };
                
                // Também armazenar no estado principal
                this.opcaoSelecionada = opcao;
                
                btnConfirmar.disabled = false;
                console.log(`✅ Opção definida: ${opcao.nome}`);
            });
            
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
        
        if (!corpo || !titulo || !btnConfirmar) return;
        
        titulo.textContent = desvantagem.nome;
        
        let custo = desvantagem.custo || 0;
        let nomeExibicao = desvantagem.nome;
        
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
    
    adicionarDesvantagemComOpcao() {
        if (!this.desvantagemSelecionada || !this.opcaoSelecionada) {
            console.error('❌ Dados incompletos!');
            return;
        }
        
        console.log(`📊 Adicionando: ${this.opcaoSelecionada.nome} (${this.opcaoSelecionada.custo} pts)`);
        
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
        console.log(`✅ Desvantagem adicionada com sucesso!`);
        
        this.atualizarTudo();
        
        // Resetar
        this.desvantagemSelecionada = null;
        this.opcaoSelecionada = null;
        this.opcaoVisualmenteSelecionada = null;
    }
    
    adicionarDesvantagem() {
        if (!this.desvantagemSelecionada) {
            console.error("❌ Nenhuma desvantagem selecionada!");
            return;
        }
        
        let custo = 0;
        let nomeExibicao = this.desvantagemSelecionada.nome;
        
        if (this.desvantagemSelecionada.temOpcoes) {
            if (this.opcaoSelecionada) {
                custo = this.opcaoSelecionada.custo;
                nomeExibicao = this.opcaoSelecionada.nome;
            } else if (this.desvantagemSelecionada.opcoes && this.desvantagemSelecionada.opcoes.length === 1) {
                const opcao = this.desvantagemSelecionada.opcoes[0];
                custo = opcao.custo;
                nomeExibicao = opcao.nome;
                this.opcaoSelecionada = opcao;
            } else {
                alert('Por favor, selecione uma opção primeiro.');
                return;
            }
        } else {
            custo = this.desvantagemSelecionada.custo;
        }
        
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
        
        this.atualizarTudo();
        this.fecharModal('desvantagem');
        
        this.desvantagemSelecionada = null;
        this.opcaoSelecionada = null;
        this.opcaoVisualmenteSelecionada = null;
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
        
        if (window.sistemaVantagens) {
            window.sistemaVantagens.atualizarTotais();
        }
    }
    
    atualizarListaDisponiveis() {
        const listaContainer = document.getElementById('lista-desvantagens');
        if (!listaContainer) return;
        
        listaContainer.innerHTML = '';
        
        if (this.desvantagensDisponiveis.length === 0) {
            listaContainer.innerHTML = '<div class="lista-vazia">Nenhuma desvantagem disponível</div>';
            return;
        }
        
        this.desvantagensDisponiveis.forEach(desvantagem => {
            const item = this.criarItemDesvantagem(desvantagem);
            listaContainer.appendChild(item);
        });
        
        this.configurarEventosItensLista();
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
                    <button class="btn-remover" title="Remover desvantagem">×</button>
                </div>
                <p class="item-descricao">${desvantagem.descricao ? desvantagem.descricao.substring(0, 120) + (desvantagem.descricao.length > 120 ? '...' : '') : ''}</p>
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
            contadorDesvantagens.textContent = `${this.desvantagensDisponiveis.length} desvantagem${this.desvantagensDisponiveis.length !== 1 ? 'ns' : ''}`;
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
            document.body.classList.add('modal-aberto');
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
            document.body.classList.remove('modal-aberto');
        }
        
        if (tipo === 'desvantagem') {
            this.desvantagemSelecionada = null;
            this.opcaoSelecionada = null;
            this.opcaoVisualmenteSelecionada = null;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("🏁 DOM pronto, inicializando SistemaDesvantagens...");
    window.sistemaDesvantagens = new SistemaDesvantagens();
    
    setTimeout(() => {
        if (window.sistemaDesvantagens) {
            window.sistemaDesvantagens.atualizarTudo();
            setTimeout(() => {
                window.sistemaDesvantagens.configurarEventosLista();
            }, 200);
        }
    }, 500);
});

console.log("📄 desvantagens.js carregado (aguardando DOM)...");
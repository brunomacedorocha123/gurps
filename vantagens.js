// vantagens.js - SISTEMA COMPLETO DE VANTAGENS
class SistemaVantagens {
    constructor() {
        this.vantagensAdquiridas = [];
        this.vantagensDisponiveis = [];
        this.modalAtivo = null;
        this.opcaoSelecionada = null;
        this.vantagemSelecionada = null;
        this.tipoSelecionado = 'vantagem';
        
        this.init();
    }
    
    init() {
        this.carregarCatalogoVantagens();
        this.configurarEventos();
        this.atualizarListas();
        this.atualizarContadores();
        this.atualizarTotais();
    }
    
    carregarCatalogoVantagens() {
        if (window.catalogoVantagens && Array.isArray(window.catalogoVantagens)) {
            this.vantagensDisponiveis = [...window.catalogoVantagens];
        } else {
            this.vantagensDisponiveis = [];
        }
    }
    
    configurarEventos() {
        const buscaVantagens = document.getElementById('busca-vantagens');
        if (buscaVantagens) {
            buscaVantagens.addEventListener('input', (e) => {
                this.filtrarVantagens(e.target.value);
            });
        }
        
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
        
        this.configurarModais();
        this.configurarTouchEvents();
    }
    
    configurarModais() {
        const modalVantagem = document.getElementById('modal-vantagem');
        if (modalVantagem) {
            modalVantagem.querySelector('.modal-close').addEventListener('click', () => {
                this.fecharModal('vantagem');
            });
            
            modalVantagem.querySelector('.btn-cancelar').addEventListener('click', () => {
                this.fecharModal('vantagem');
            });
            
            modalVantagem.querySelector('.btn-confirmar').addEventListener('click', () => {
                this.confirmarAdicionarVantagem();
            });
        }
        
        const modalOpcoes = document.getElementById('modal-opcoes');
        if (modalOpcoes) {
            modalOpcoes.querySelector('.modal-close').addEventListener('click', () => {
                this.fecharModal('opcoes');
            });
            
            modalOpcoes.querySelector('.btn-cancelar').addEventListener('click', () => {
                this.fecharModal('opcoes');
                if (this.vantagemSelecionada) {
                    setTimeout(() => {
                        this.abrirModalVantagem(this.vantagemSelecionada);
                    }, 100);
                }
            });
            
            modalOpcoes.querySelector('.btn-confirmar').addEventListener('click', () => {
                this.selecionarOpcaoVantagem();
            });
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
    
    configurarTouchEvents() {
        document.querySelectorAll('.item-lista, .opcao-item').forEach(item => {
            item.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            item.addEventListener('touchend', function() {
                this.classList.remove('touch-active');
            });
        });
        
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
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
            const itemElement = this.criarItemVantagem(vantagem);
            listaContainer.appendChild(itemElement);
        });
        
        const contador = document.getElementById('contador-vantagens');
        if (contador) {
            contador.textContent = `${vantagensFiltradas.length} vantagem${vantagensFiltradas.length !== 1 ? 's' : ''}`;
        }
    }
    
    criarItemVantagem(vantagem) {
        const itemElement = document.createElement('div');
        itemElement.className = 'item-lista';
        itemElement.dataset.id = vantagem.id;
        itemElement.dataset.tipo = 'vantagem';
        
        let custoTexto = '';
        if (vantagem.temOpcoes) {
            custoTexto = 'Varia';
        } else {
            custoTexto = `${vantagem.custo} pts`;
        }
        
        itemElement.innerHTML = `
            <div class="item-header">
                <h4 class="item-nome">${vantagem.nome}</h4>
                <span class="item-custo">${custoTexto}</span>
            </div>
            <p class="item-descricao">${vantagem.descricao ? vantagem.descricao.substring(0, 150) + (vantagem.descricao.length > 150 ? '...' : '') : ''}</p>
            ${vantagem.categoria ? `<span class="item-categoria">${vantagem.categoria}</span>` : ''}
        `;
        
        itemElement.addEventListener('click', () => {
            this.selecionarVantagem(vantagem);
        });
        
        itemElement.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.selecionarVantagem(vantagem);
        });
        
        return itemElement;
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
        const corpo = document.getElementById('modal-corpo-opcoes');
        const titulo = document.getElementById('modal-titulo-opcoes');
        const btnConfirmar = modal.querySelector('.btn-confirmar');
        
        if (!modal || !corpo) return;
        
        titulo.textContent = `Escolha uma opção: ${vantagem.nome}`;
        corpo.innerHTML = '';
        
        vantagem.opcoes.forEach((opcao, index) => {
            const opcaoItem = document.createElement('div');
            opcaoItem.className = 'opcao-item';
            opcaoItem.dataset.index = index;
            opcaoItem.dataset.custo = opcao.custo;
            
            opcaoItem.innerHTML = `
                <div class="opcao-header">
                    <h4 class="opcao-nome">${opcao.nome}</h4>
                    <span class="opcao-custo">${opcao.custo} pts</span>
                </div>
                <p class="opcao-descricao">${opcao.descricao || ''}</p>
            `;
            
            opcaoItem.addEventListener('click', () => {
                this.selecionarOpcaoNoModal(opcao, opcaoItem, btnConfirmar);
            });
            
            opcaoItem.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.selecionarOpcaoNoModal(opcao, opcaoItem, btnConfirmar);
            });
            
            corpo.appendChild(opcaoItem);
        });
        
        this.opcaoSelecionada = null;
        btnConfirmar.disabled = true;
        
        this.abrirModal('opcoes');
    }
    
    selecionarOpcaoNoModal(opcao, opcaoItem, btnConfirmar) {
        document.querySelectorAll('.opcao-item').forEach(item => {
            item.classList.remove('selecionada');
        });
        
        opcaoItem.classList.add('selecionada');
        this.opcaoSelecionada = opcao;
        btnConfirmar.disabled = false;
    }
    
    selecionarOpcaoVantagem() {
        if (!this.opcaoSelecionada || !this.vantagemSelecionada) {
            alert('Por favor, selecione uma opção primeiro.');
            return;
        }
        
        this.fecharModal('opcoes');
        
        const modal = document.getElementById('modal-vantagem');
        const corpo = document.getElementById('modal-corpo-vantagem');
        const titulo = document.getElementById('modal-titulo-vantagem');
        const btnConfirmar = modal.querySelector('.btn-confirmar');
        
        if (!corpo || !titulo || !btnConfirmar) {
            this.adicionarVantagemComOpcao();
            return;
        }
        
        titulo.textContent = this.opcaoSelecionada.nome;
        
        corpo.innerHTML = `
            <div class="modal-info">
                <p><strong>Descrição:</strong> ${this.opcaoSelecionada.descricao || this.vantagemSelecionada.descricao || ''}</p>
                ${this.vantagemSelecionada.categoria ? `<p><strong>Categoria:</strong> ${this.vantagemSelecionada.categoria}</p>` : ''}
                ${this.vantagemSelecionada.prerequisitos && this.vantagemSelecionada.prerequisitos.length > 0 ? 
                  `<p><strong>Pré-requisitos:</strong> ${this.vantagemSelecionada.prerequisitos.join(', ')}</p>` : ''}
                ${this.vantagemSelecionada.notas ? `<p><strong>Notas:</strong> ${this.vantagemSelecionada.notas}</p>` : ''}
            </div>
            <div class="pericia-custo-container">
                <div class="pericia-custo">
                    Custo: ${this.opcaoSelecionada.custo} pontos
                </div>
                <div class="pericia-custo-adicional">
                    (${this.vantagemSelecionada.nome} - Opção selecionada)
                </div>
            </div>
        `;
        
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = 'Adicionar Vantagem';
        
        const btnConfirmarClone = btnConfirmar.cloneNode(true);
        btnConfirmar.parentNode.replaceChild(btnConfirmarClone, btnConfirmar);
        
        btnConfirmarClone.addEventListener('click', () => {
            this.adicionarVantagemComOpcao();
            this.fecharModal('vantagem');
        });
        
        this.abrirModal('vantagem');
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
        let nomeExibicao = vantagem.nome;
        
        if (vantagem.temOpcoes && vantagem.opcoes && vantagem.opcoes.length === 1) {
            const opcao = vantagem.opcoes[0];
            custo = opcao.custo;
            nomeExibicao = opcao.nome;
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
        btnConfirmar.textContent = 'Adicionar Vantagem';
        
        this.abrirModal('vantagem');
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
    }
    
    adicionarVantagemComOpcao() {
        if (!this.vantagemSelecionada || !this.opcaoSelecionada) return;
        
        const vantagemAdquirida = {
            id: this.vantagemSelecionada.id + '-' + Date.now(),
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
        this.fecharModal('vantagem');
        
        this.vantagemSelecionada = null;
        this.opcaoSelecionada = null;
    }
    
    adicionarVantagemSemOpcao() {
        if (!this.vantagemSelecionada) return;
        
        const vantagemAdquirida = {
            id: this.vantagemSelecionada.id + '-' + Date.now(),
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
        this.fecharModal('vantagem');
        
        this.vantagemSelecionada = null;
        this.opcaoSelecionada = null;
    }
    
    removerVantagem(id) {
        this.vantagensAdquiridas = this.vantagensAdquiridas.filter(v => v.id !== id);
        this.atualizarInterface();
    }
    
    atualizarInterface() {
        this.atualizarListaDisponiveis();
        this.atualizarListaAdquiridas();
        this.atualizarContadores();
        this.atualizarTotais();
    }
    
    atualizarListas() {
        this.atualizarListaDisponiveis();
        this.atualizarListaAdquiridas();
        this.atualizarListaPeculiaridades();
    }
    
    atualizarListaDisponiveis() {
        const listaContainer = document.getElementById('lista-vantagens');
        if (!listaContainer) return;
        
        listaContainer.innerHTML = '';
        
        if (this.vantagensDisponiveis.length === 0) {
            listaContainer.innerHTML = '<div class="lista-vazia">Nenhuma vantagem disponível</div>';
            return;
        }
        
        this.vantagensDisponiveis.forEach(vantagem => {
            const itemElement = this.criarItemVantagem(vantagem);
            listaContainer.appendChild(itemElement);
        });
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
            const itemElement = document.createElement('div');
            itemElement.className = 'item-lista item-adquirido';
            itemElement.dataset.id = vantagem.id;
            
            itemElement.innerHTML = `
                <div class="item-header">
                    <h4 class="item-nome">${vantagem.nome}</h4>
                    <span class="item-custo">${vantagem.custo} pts</span>
                    <button class="btn-remover" title="Remover vantagem" aria-label="Remover vantagem">×</button>
                </div>
                <p class="item-descricao">${vantagem.descricao ? vantagem.descricao.substring(0, 120) + (vantagem.descricao.length > 120 ? '...' : '') : ''}</p>
                ${vantagem.categoria ? `<span class="item-categoria">${vantagem.categoria}</span>` : ''}
                ${vantagem.nomeBase && vantagem.nomeBase !== vantagem.nome ? 
                  `<small style="color:#95a5a6;display:block;margin-top:4px;">(${vantagem.nomeBase})</small>` : ''}
            `;
            
            const btnRemover = itemElement.querySelector('.btn-remover');
            btnRemover.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removerVantagem(vantagem.id);
            });
            
            listaContainer.appendChild(itemElement);
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
        
        const desvantagensAdquiridas = window.sistemaDesvantagens ? 
            window.sistemaDesvantagens.desvantagensAdquiridas : [];
        const totalDesvantagens = desvantagensAdquiridas.reduce((sum, d) => sum + d.custo, 0);
        
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
        
        window.dispatchEvent(new CustomEvent('vantagensAtualizadas', {
            detail: {
                totalVantagens,
                totalDesvantagens,
                totalPeculiaridades,
                saldoTotal
            }
        }));
    }
    
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
                <button class="peculiaridade-remover" title="Remover peculiaridade" aria-label="Remover peculiaridade">×</button>
            `;
            
            const btnRemover = item.querySelector('.peculiaridade-remover');
            btnRemover.addEventListener('click', () => {
                this.removerPeculiaridade(peculiaridade.id);
            });
            
            listaContainer.appendChild(item);
        });
    }
    
    abrirModal(tipo) {
        this.modalAtivo = tipo;
        const modal = document.getElementById(`modal-${tipo}`);
        
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            document.body.classList.add('modal-aberto');
            
            setTimeout(() => {
                const primeiroBotao = modal.querySelector('button');
                if (primeiroBotao && !primeiroBotao.disabled) {
                    primeiroBotao.focus();
                }
            }, 100);
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
        
        if (tipo === 'vantagem') {
            this.vantagemSelecionada = null;
            this.opcaoSelecionada = null;
        }
    }
    
    obterVantagensAdquiridas() {
        return [...this.vantagensAdquiridas];
    }
    
    calcularSaldoTotal() {
        return this.atualizarTotais();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sistemaVantagens = new SistemaVantagens();
    
    setTimeout(() => {
        if (window.sistemaVantagens) {
            window.sistemaVantagens.atualizarListas();
            window.sistemaVantagens.atualizarTotais();
        }
    }, 500);
});

if (typeof window !== 'undefined') {
    window.SistemaVantagens = SistemaVantagens;
}
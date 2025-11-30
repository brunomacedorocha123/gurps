// vantagens.js - SISTEMA COMPLETO E FUNCIONAL

class SistemaVantagens {
    constructor() {
        this.vantagensAdquiridas = [];
        this.desvantagensAdquiridas = [];
        this.peculiaridades = [];
        
        // Pega os catálogos (que devem ser carregados ANTES)
        this.catalogoVantagens = window.VANTAGENS_CATALOGO || {};
        this.catalogoDesvantagens = window.DESVANTAGENS_CATALOGO || {};
    }

    // INICIALIZAR SISTEMA
    inicializar() {
        console.log('Iniciando Sistema de Vantagens...');
        this.configurarEventListeners();
        this.carregarDados();
        this.carregarCatalogos();
        this.atualizarTudo();
        console.log('Sistema de Vantagens Inicializado!');
    }

    // CARREGAR CATÁLOGOS INICIAIS
    carregarCatalogos() {
        console.log('Carregando catálogos...');
        this.mostrarVantagens(Object.values(this.catalogoVantagens));
        this.mostrarDesvantagens(Object.values(this.catalogoDesvantagens));
    }

    // CONFIGURAR EVENTOS
    configurarEventListeners() {
        // Busca vantagens
        const buscaVantagens = document.getElementById('busca-vantagens');
        const categoriaVantagens = document.getElementById('categoria-vantagens');
        
        if (buscaVantagens) {
            buscaVantagens.addEventListener('input', () => this.filtrarVantagens());
        }
        if (categoriaVantagens) {
            categoriaVantagens.addEventListener('change', () => this.filtrarVantagens());
        }
        
        // Busca desvantagens
        const buscaDesvantagens = document.getElementById('busca-desvantagens');
        const categoriaDesvantagens = document.getElementById('categoria-desvantagens');
        
        if (buscaDesvantagens) {
            buscaDesvantagens.addEventListener('input', () => this.filtrarDesvantagens());
        }
        if (categoriaDesvantagens) {
            categoriaDesvantagens.addEventListener('change', () => this.filtrarDesvantagens());
        }
        
        // Peculiaridades
        const novaPeculiaridade = document.getElementById('nova-peculiaridade');
        const btnPeculiaridade = document.getElementById('btn-adicionar-peculiaridade');
        
        if (novaPeculiaridade) {
            novaPeculiaridade.addEventListener('input', () => this.atualizarContadorPeculiaridade());
        }
        if (btnPeculiaridade) {
            btnPeculiaridade.addEventListener('click', () => this.adicionarPeculiaridade());
        }
        
        // Cliques dinâmicos
        document.addEventListener('click', (e) => this.manipularClique(e));
    }

    // MANIPULAR CLICKS
    manipularClique(e) {
        if (e.target.classList.contains('btn-adicionar')) {
            const id = e.target.dataset.id;
            const tipo = e.target.dataset.tipo;
            this.adicionarItem(id, tipo);
        }
        
        if (e.target.classList.contains('btn-remover')) {
            const id = e.target.dataset.id;
            const tipo = e.target.dataset.tipo;
            this.removerItem(id, tipo);
        }
    }

    // FILTRAR VANTAGENS
    filtrarVantagens() {
        const termo = document.getElementById('busca-vantagens').value.toLowerCase();
        const categoria = document.getElementById('categoria-vantagens').value;
        
        const vantagensFiltradas = Object.values(this.catalogoVantagens).filter(v => {
            const matchTermo = v.nome.toLowerCase().includes(termo) || 
                              (v.descricao && v.descricao.toLowerCase().includes(termo));
            const matchCategoria = !categoria || v.categoria === categoria;
            return matchTermo && matchCategoria;
        });
        
        this.mostrarVantagens(vantagensFiltradas);
    }

    // FILTRAR DESVANTAGENS
    filtrarDesvantagens() {
        const termo = document.getElementById('busca-desvantagens').value.toLowerCase();
        const categoria = document.getElementById('categoria-desvantagens').value;
        
        const desvantagensFiltradas = Object.values(this.catalogoDesvantagens).filter(d => {
            const matchTermo = d.nome.toLowerCase().includes(termo) || 
                              (d.descricao && d.descricao.toLowerCase().includes(termo));
            const matchCategoria = !categoria || d.categoria === categoria;
            return matchTermo && matchCategoria;
        });
        
        this.mostrarDesvantagens(desvantagensFiltradas);
    }

    // MOSTRAR VANTAGENS NA LISTA
    mostrarVantagens(vantagens) {
        const lista = document.getElementById('lista-vantagens');
        if (!lista) {
            console.error('Elemento lista-vantagens não encontrado!');
            return;
        }
        
        lista.innerHTML = '';
        
        if (vantagens.length === 0) {
            lista.innerHTML = '<div class="lista-vazia">Nenhuma vantagem encontrada</div>';
            return;
        }
        
        vantagens.forEach(vantagem => {
            const item = this.criarItemLista(vantagem, 'vantagem');
            lista.appendChild(item);
        });
    }

    // MOSTRAR DESVANTAGENS NA LISTA
    mostrarDesvantagens(desvantagens) {
        const lista = document.getElementById('lista-desvantagens');
        if (!lista) {
            console.error('Elemento lista-desvantagens não encontrado!');
            return;
        }
        
        lista.innerHTML = '';
        
        if (desvantagens.length === 0) {
            lista.innerHTML = '<div class="lista-vazia">Nenhuma desvantagem encontrada</div>';
            return;
        }
        
        desvantagens.forEach(desvantagem => {
            const item = this.criarItemLista(desvantagem, 'desvantagem');
            lista.appendChild(item);
        });
    }

    // CRIAR ITEM DA LISTA
    criarItemLista(item, tipo) {
        const div = document.createElement('div');
        div.className = 'lista-item';
        
        const custoTexto = typeof item.custo === 'string' ? item.custo : 
                          item.custo > 0 ? `+${item.custo}` : item.custo;
        
        div.innerHTML = `
            <div class="item-info">
                <strong>${item.nome}</strong>
                <div class="item-custo">${custoTexto} pts</div>
                ${item.descricao ? `<div class="item-descricao">${item.descricao}</div>` : ''}
            </div>
            <button class="btn-adicionar" data-id="${item.id}" data-tipo="${tipo}">
                ${tipo === 'vantagem' ? '+' : '-'}
            </button>
        `;
        
        return div;
    }

    // ADICIONAR ITEM (vantagem/desvantagem)
    adicionarItem(id, tipo) {
        const catalogo = tipo === 'vantagem' ? this.catalogoVantagens : this.catalogoDesvantagens;
        const lista = tipo === 'vantagem' ? this.vantagensAdquiridas : this.desvantagensAdquiridas;
        
        const item = catalogo[id];
        if (!item) {
            console.error('Item não encontrado:', id);
            return;
        }
        
        if (lista.find(i => i.id === id)) {
            console.log('Item já adicionado:', id);
            return;
        }
        
        // Se for variável, abrir modal de configuração
        if (item.custo === 'variavel') {
            this.abrirModalConfiguracao(item, tipo);
        } else {
            // Item simples - adicionar direto
            const itemParaAdicionar = {
                ...item,
                idUnico: `${item.id}_${Date.now()}` // ID único para remoção
            };
            lista.push(itemParaAdicionar);
            this.atualizarTudo();
        }
    }

    // REMOVER ITEM
    removerItem(id, tipo) {
        if (tipo === 'vantagem') {
            this.vantagensAdquiridas = this.vantagensAdquiridas.filter(v => v.idUnico !== id);
        } else if (tipo === 'desvantagem') {
            this.desvantagensAdquiridas = this.desvantagensAdquiridas.filter(d => d.idUnico !== id);
        } else if (tipo === 'peculiaridade') {
            this.peculiaridades.splice(parseInt(id), 1);
        }
        
        this.atualizarTudo();
    }

    // PECULIARIDADES
    atualizarContadorPeculiaridade() {
        const input = document.getElementById('nova-peculiaridade');
        const contador = document.getElementById('contador-chars');
        const botao = document.getElementById('btn-adicionar-peculiaridade');
        
        if (!input || !contador || !botao) return;
        
        const texto = input.value;
        const count = texto.length;
        
        contador.textContent = count;
        botao.disabled = !(count > 0 && count <= 30 && this.peculiaridades.length < 5);
    }

    adicionarPeculiaridade() {
        const input = document.getElementById('nova-peculiaridade');
        const texto = input.value.trim();
        
        if (texto.length === 0 || texto.length > 30) {
            alert('Peculiaridade deve ter entre 1 e 30 caracteres!');
            return;
        }
        
        if (this.peculiaridades.length >= 5) {
            alert('Máximo de 5 peculiaridades atingido!');
            return;
        }
        
        this.peculiaridades.push(texto);
        input.value = '';
        this.atualizarContadorPeculiaridade();
        this.atualizarTudo();
    }

    // ATUALIZAR LISTAS ADQUIRIDAS
    atualizarListasAdquiridas() {
        this.atualizarListaVantagensAdquiridas();
        this.atualizarListaDesvantagensAdquiridas();
        this.atualizarListaPeculiaridades();
    }

    atualizarListaVantagensAdquiridas() {
        const lista = document.getElementById('vantagens-adquiridas');
        const totalElement = document.getElementById('total-vantagens-adquiridas');
        
        if (!lista || !totalElement) return;
        
        if (this.vantagensAdquiridas.length === 0) {
            lista.innerHTML = '<div class="lista-vazia">Nenhuma vantagem adquirida</div>';
            totalElement.textContent = '0 pts';
            return;
        }
        
        lista.innerHTML = '';
        let totalPontos = 0;
        
        this.vantagensAdquiridas.forEach(vantagem => {
            const custo = typeof vantagem.custo === 'string' ? 0 : vantagem.custo;
            totalPontos += custo;
            
            const item = document.createElement('div');
            item.className = 'item-adquirido';
            item.innerHTML = `
                <div class="item-info">
                    <strong>${vantagem.nome}</strong>
                    <div class="item-custo">+${custo} pts</div>
                </div>
                <button class="btn-remover" data-id="${vantagem.idUnico}" data-tipo="vantagem">×</button>
            `;
            lista.appendChild(item);
        });
        
        totalElement.textContent = `${totalPontos} pts`;
    }

    atualizarListaDesvantagensAdquiridas() {
        const lista = document.getElementById('desvantagens-adquiridas');
        const totalElement = document.getElementById('total-desvantagens-adquiridas');
        
        if (!lista || !totalElement) return;
        
        if (this.desvantagensAdquiridas.length === 0) {
            lista.innerHTML = '<div class="lista-vazia">Nenhuma desvantagem adquirida</div>';
            totalElement.textContent = '0 pts';
            return;
        }
        
        lista.innerHTML = '';
        let totalPontos = 0;
        
        this.desvantagensAdquiridas.forEach(desvantagem => {
            const custo = typeof desvantagem.custo === 'string' ? 0 : Math.abs(desvantagem.custo);
            totalPontos += custo;
            
            const item = document.createElement('div');
            item.className = 'item-adquirido';
            item.innerHTML = `
                <div class="item-info">
                    <strong>${desvantagem.nome}</strong>
                    <div class="item-custo">-${custo} pts</div>
                </div>
                <button class="btn-remover" data-id="${desvantagem.idUnico}" data-tipo="desvantagem">×</button>
            `;
            lista.appendChild(item);
        });
        
        totalElement.textContent = `${totalPontos} pts`;
    }

    atualizarListaPeculiaridades() {
        const lista = document.getElementById('lista-peculiaridades');
        const contador = document.getElementById('contador-peculiaridades');
        
        if (!lista || !contador) return;
        
        contador.textContent = `${this.peculiaridades.length}/5`;
        
        if (this.peculiaridades.length === 0) {
            lista.innerHTML = '<div class="lista-vazia">Nenhuma peculiaridade adicionada</div>';
            return;
        }
        
        lista.innerHTML = '';
        
        this.peculiaridades.forEach((peculiaridade, index) => {
            const item = document.createElement('div');
            item.className = 'item-adquirido';
            item.innerHTML = `
                <div class="item-info">
                    <strong>${peculiaridade}</strong>
                    <div class="item-custo">-1 pts</div>
                </div>
                <button class="btn-remover" data-id="${index}" data-tipo="peculiaridade">×</button>
            `;
            lista.appendChild(item);
        });
    }

    // CALCULAR PONTOS
    calcularPontosVantagens() {
        return this.vantagensAdquiridas.reduce((total, vantagem) => {
            const custo = typeof vantagem.custo === 'string' ? 0 : vantagem.custo;
            return total + custo;
        }, 0);
    }

    calcularPontosDesvantagens() {
        return this.desvantagensAdquiridas.reduce((total, desvantagem) => {
            const custo = typeof desvantagem.custo === 'string' ? 0 : Math.abs(desvantagem.custo);
            return total + custo;
        }, 0);
    }

    calcularPontosPeculiaridades() {
        return this.peculiaridades.length;
    }

    // ATUALIZAR RESUMO DE PONTOS
    atualizarResumoPontos() {
        const pontosVantagens = this.calcularPontosVantagens();
        const pontosDesvantagens = this.calcularPontosDesvantagens();
        const pontosPeculiaridades = this.calcularPontosPeculiaridades();
        const saldoTotal = pontosVantagens - pontosDesvantagens - pontosPeculiaridades;
        
        // Atualizar displays
        const totalVantagens = document.getElementById('total-vantagens');
        const totalDesvantagens = document.getElementById('total-desvantagens');
        const totalPeculiaridades = document.getElementById('total-peculiaridades');
        const saldoTotalElement = document.getElementById('saldo-total');
        
        if (totalVantagens) totalVantagens.textContent = `+${pontosVantagens}`;
        if (totalDesvantagens) totalDesvantagens.textContent = `-${pontosDesvantagens}`;
        if (totalPeculiaridades) totalPeculiaridades.textContent = `-${pontosPeculiaridades}`;
        if (saldoTotalElement) {
            saldoTotalElement.textContent = saldoTotal;
            saldoTotalElement.style.color = saldoTotal > 0 ? '#27ae60' : saldoTotal < 0 ? '#e74c3c' : '#ffd700';
        }
    }

    // ATUALIZAR TUDO
    atualizarTudo() {
        this.atualizarListasAdquiridas();
        this.atualizarResumoPontos();
        this.salvarDados();
    }

    // MODAL DE CONFIGURAÇÃO (para itens variáveis)
    abrirModalConfiguracao(item, tipo) {
        console.log(`Abrir modal para: ${item.nome} (${tipo})`);
        // TODO: Implementar modais para Abençoado, Barulhento, etc.
        alert(`Configuração para ${item.nome} - Em desenvolvimento`);
    }

    // SALVAR/CARREGAR DADOS
    salvarDados() {
        const dados = {
            vantagens: this.vantagensAdquiridas,
            desvantagens: this.desvantagensAdquiridas,
            peculiaridades: this.peculiaridades,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('gurpsVantagens', JSON.stringify(dados));
    }

    carregarDados() {
        const dadosSalvos = localStorage.getItem('gurpsVantagens');
        
        if (dadosSalvos) {
            try {
                const dados = JSON.parse(dadosSalvos);
                this.vantagensAdquiridas = dados.vantagens || [];
                this.desvantagensAdquiridas = dados.desvantagens || [];
                this.peculiaridades = dados.peculiaridades || [];
            } catch (e) {
                console.error('Erro ao carregar dados:', e);
            }
        }
    }
}

// INICIALIZAR SISTEMA
document.addEventListener('DOMContentLoaded', function() {
    window.sistemaVantagens = new SistemaVantagens();
    window.sistemaVantagens.inicializar();
});
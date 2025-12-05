// ============================================
// SISTEMA DE VANTAGENS - JS COMPLETO
// ============================================

class SistemaVantagens {
    constructor() {
        this.vantagensAdquiridas = [];
        this.desvantagensAdquiridas = [];
        this.peculiaridades = [];
        this.itemSelecionado = null;
        this.tipoSelecionado = null;
        this.variacaoSelecionada = null;
        this.nivelSelecionado = 1;
        this.pontosIniciais = 100;
        this.pontosRestantes = 100;
        
        this.init();
    }
    
    // ========== INICIALIZAÇÃO ==========
    init() {
        console.log('🎮 Sistema de Vantagens inicializando...');
        
        this.carregarDados();
        this.carregarUI();
        this.configurarEventos();
        this.atualizarInterface();
        
        console.log('✅ Sistema pronto para uso');
    }
    
    // ========== CARREGAR DADOS ==========
    carregarDados() {
        // Dados de exemplo (substituir pelo seu catálogo)
        if (!window.vantagensData) {
            window.vantagensData = {
                vantagens: [
                    {
                        id: "abencoado",
                        nome: "Abençoado",
                        categoria: "sobrenatural",
                        tipo: "multipla",
                        descricao: "Sintonizado com uma entidade divina/demoníaca/espiritual.",
                        variacoes: [
                            { id: "abencoado-basico", nome: "Abençoado", custo: 10, descricao: "Recebe visões após 1h de ritual. Teste secreto de IQ." },
                            { id: "muito-abencoado", nome: "Muito Abençoado", custo: 20, descricao: "+5 no teste de IQ para visões. +2 de reação." },
                            { id: "feitos-heroicos", nome: "Feitos Heroicos", custo: 10, descricao: "1x por sessão: +1 dado em ST, DX ou HT por 3d segundos." }
                        ]
                    },
                    {
                        id: "magic-resist",
                        nome: "Resistência à Magia",
                        categoria: "sobrenatural",
                        tipo: "variavel",
                        descricao: "Resistência natural contra efeitos mágicos.",
                        niveis: 5,
                        custoPorNivel: 3,
                        nivelBase: 1
                    },
                    {
                        id: "sentidos-agucados",
                        nome: "Sentidos Aguçados",
                        categoria: "fisica",
                        tipo: "simples",
                        custo: 5,
                        descricao: "Visão, audição ou olfato excepcionais. +2 em testes de percepção."
                    },
                    {
                        id: "carisma",
                        nome: "Carisma",
                        categoria: "social",
                        tipo: "variavel",
                        descricao: "Habilidade natural de influenciar pessoas.",
                        niveis: 4,
                        custoPorNivel: 5,
                        nivelBase: 1
                    },
                    {
                        id: "reflexos-rapidos",
                        nome: "Reflexos Rápidos",
                        categoria: "fisica",
                        tipo: "simples",
                        custo: 15,
                        descricao: "+1 em todos os testes de iniciativa e esquiva."
                    }
                ],
                desvantagens: [
                    {
                        id: "alcoolismo",
                        nome: "Alcoolismo",
                        categoria: "mental",
                        tipo: "multipla",
                        descricao: "Vício em álcool que afeta o julgamento.",
                        variacoes: [
                            { id: "alcoolismo-leve", nome: "Alcoolismo (Leve)", custo: -10, descricao: "Precisa beber regularmente. Penalidades ocasionais." },
                            { id: "alcoolismo-grave", nome: "Alcoolismo (Grave)", custo: -20, descricao: "Dependente. Testes diários para evitar bebida." }
                        ]
                    },
                    {
                        id: "medo-de-altura",
                        nome: "Medo de Altura",
                        categoria: "mental",
                        tipo: "simples",
                        custo: -15,
                        descricao: "Fobia incapacitante de lugares altos. Testes de medo frequentes."
                    },
                    {
                        id: "honra",
                        nome: "Código de Honra",
                        categoria: "social",
                        tipo: "multipla",
                        descricao: "Seguir um código rígido de conduta.",
                        variacoes: [
                            { id: "honra-samurai", nome: "Código do Samurai", custo: -15, descricao: "Bushido - Lealdade, honra, coragem acima de tudo." },
                            { id: "honra-cavaleiro", nome: "Código do Cavaleiro", custo: -10, descricao: "Proteger os fracos, ser cortês, cumprir promessas." }
                        ]
                    },
                    {
                        id: "pobre",
                        nome: "Pobre",
                        categoria: "social",
                        tipo: "variavel",
                        descricao: "Falta de recursos financeiros.",
                        niveis: 3,
                        custoPorNivel: -5,
                        nivelBase: 1
                    },
                    {
                        id: "doenca-cronica",
                        nome: "Doença Crônica",
                        categoria: "fisica",
                        tipo: "simples",
                        custo: -10,
                        descricao: "Doença persistente que requer tratamento regular."
                    }
                ]
            };
        }
    }
    
    // ========== CARREGAR INTERFACE ==========
    carregarUI() {
        this.carregarVantagens();
        this.carregarDesvantagens();
        this.atualizarPeculiaridades();
    }
    
    carregarVantagens() {
        const container = document.getElementById('lista-vantagens');
        if (!container) return;
        
        const vantagens = vantagensData.vantagens;
        if (vantagens.length === 0) {
            container.innerHTML = '<div class="lista-vazia">Nenhuma vantagem disponível</div>';
            return;
        }
        
        container.innerHTML = '';
        vantagens.forEach(vantagem => {
            const item = this.criarItemUI(vantagem, 'vantagem');
            container.appendChild(item);
        });
        
        document.getElementById('num-vant-disponiveis').textContent = vantagens.length;
    }
    
    carregarDesvantagens() {
        const container = document.getElementById('lista-desvantagens');
        if (!container) return;
        
        const desvantagens = vantagensData.desvantagens;
        if (desvantagens.length === 0) {
            container.innerHTML = '<div class="lista-vazia">Nenhuma desvantagem disponível</div>';
            return;
        }
        
        container.innerHTML = '';
        desvantagens.forEach(desvantagem => {
            const item = this.criarItemUI(desvantagem, 'desvantagem');
            container.appendChild(item);
        });
        
        document.getElementById('num-desv-disponiveis').textContent = desvantagens.length;
    }
    
    criarItemUI(item, tipo) {
        const div = document.createElement('div');
        div.className = tipo === 'vantagem' ? 'item-vantagem' : 'item-desvantagem';
        div.dataset.id = item.id;
        div.dataset.tipo = tipo;
        
        let custoDisplay = '';
        let descricaoCurta = item.descricao.length > 100 ? 
            item.descricao.substring(0, 100) + '...' : item.descricao;
        
        if (item.tipo === 'variavel') {
            const custo = Math.abs(item.custoPorNivel) || 3;
            custoDisplay = `${custo} pts/nível`;
        } else if (item.tipo === 'multipla') {
            const custos = item.variacoes.map(v => Math.abs(v.custo));
            const min = Math.min(...custos);
            const max = Math.max(...custos);
            custoDisplay = min === max ? `${min} pts` : `${min}-${max} pts`;
        } else {
            custoDisplay = `${Math.abs(item.custo)} pts`;
        }
        
        const sinal = tipo === 'vantagem' ? '+' : '-';
        custoDisplay = sinal + custoDisplay;
        
        div.innerHTML = `
            <div class="item-header">
                <h4 class="item-nome">${item.nome}</h4>
                <div class="item-custo">${custoDisplay}</div>
            </div>
            <div class="item-info">
                <span class="item-categoria">${this.formatarCategoria(item.categoria)}</span>
                <span class="item-tipo">${this.formatarTipo(item.tipo)}</span>
            </div>
            <div class="item-descricao">${descricaoCurta}</div>
        `;
        
        div.addEventListener('click', (e) => {
            if (e.target.closest('.btn-remover')) return;
            this.selecionarItem(item, tipo);
        });
        
        return div;
    }
    
    // ========== CONFIGURAR EVENTOS ==========
    configurarEventos() {
        // Buscas
        document.getElementById('busca-vantagens')?.addEventListener('input', (e) => {
            this.filtrarLista('vantagem', e.target.value);
        });
        
        document.getElementById('busca-desvantagens')?.addEventListener('input', (e) => {
            this.filtrarLista('desvantagem', e.target.value);
        });
        
        // Filtros de categoria
        document.getElementById('filtro-categoria-vant')?.addEventListener('change', (e) => {
            this.filtrarPorCategoria('vantagem', e.target.value);
        });
        
        document.getElementById('filtro-categoria-desv')?.addEventListener('change', (e) => {
            this.filtrarPorCategoria('desvantagem', e.target.value);
        });
        
        // Botões de limpar
        document.getElementById('limpar-filtros-vant')?.addEventListener('click', () => {
            this.limparFiltros('vantagem');
        });
        
        document.getElementById('limpar-filtros-desv')?.addEventListener('click', () => {
            this.limparFiltros('desvantagem');
        });
        
        // Botões principais
        document.getElementById('limpar-vantagens')?.addEventListener('click', () => {
            this.confirmarLimpar('vantagem');
        });
        
        document.getElementById('limpar-desvantagens')?.addEventListener('click', () => {
            this.confirmarLimpar('desvantagem');
        });
        
        document.getElementById('limpar-peculiaridades')?.addEventListener('click', () => {
            this.confirmarLimpar('peculiaridade');
        });
        
        document.getElementById('btn-reset-tudo')?.addEventListener('click', () => {
            this.confirmarReset();
        });
        
        // Peculiaridades
        const inputPec = document.getElementById('input-peculiaridade');
        const btnAddPec = document.getElementById('btn-adicionar-pec');
        
        if (inputPec && btnAddPec) {
            inputPec.addEventListener('input', () => {
                this.atualizarContadorCaracteres();
                this.atualizarEstadoBotaoPec();
            });
            
            inputPec.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !btnAddPec.disabled) {
                    this.adicionarPeculiaridade();
                }
            });
            
            btnAddPec.addEventListener('click', () => this.adicionarPeculiaridade());
        }
        
        // Modal
        this.configurarModal();
        
        // Exportação
        document.getElementById('exportar-vantagens')?.addEventListener('click', () => {
            this.exportarDados();
        });
        
        // Salvar
        document.getElementById('btn-salvar')?.addEventListener('click', () => {
            this.salvarDados();
        });
        
        // Gerar Ficha
        document.getElementById('btn-gerar-ficha')?.addEventListener('click', () => {
            this.gerarFicha();
        });
    }
    
    // ========== SELEÇÃO DE ITEM ==========
    selecionarItem(item, tipo) {
        this.itemSelecionado = item;
        this.tipoSelecionado = tipo;
        this.variacaoSelecionada = null;
        this.nivelSelecionado = item.nivelBase || 1;
        
        this.abrirModal(item, tipo);
    }
    
    // ========== MODAL ==========
    configurarModal() {
        this.modal = document.getElementById('modal-detalhes');
        this.modalTitulo = document.getElementById('modal-titulo');
        this.modalCorpo = document.getElementById('modal-corpo');
        this.modalInfo = document.getElementById('modal-info');
        
        // Fechar modal
        document.getElementById('fechar-modal')?.addEventListener('click', () => this.fecharModal());
        document.getElementById('btn-cancelar-modal')?.addEventListener('click', () => this.fecharModal());
        
        // Confirmar
        document.getElementById('btn-confirmar-modal')?.addEventListener('click', () => this.confirmarAdicao());
        
        // Fechar ao clicar fora
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.fecharModal();
            }
        });
    }
    
    abrirModal(item, tipo) {
        if (!this.modal) return;
        
        this.modalTitulo.innerHTML = `<i class="fas fa-info-circle"></i> ${item.nome}`;
        this.modalCorpo.innerHTML = this.gerarConteudoModal(item);
        
        // Configurar eventos específicos
        setTimeout(() => {
            if (item.tipo === 'multipla') {
                this.configurarVariacoesModal(item);
            } else if (item.tipo === 'variavel') {
                this.configurarNiveisModal(item);
            }
        }, 10);
        
        this.modal.style.display = 'flex';
    }
    
    gerarConteudoModal(item) {
        let html = `
            <div class="modal-descricao">
                <p>${item.descricao}</p>
                <div class="item-meta">
                    <span class="badge categoria">${this.formatarCategoria(item.categoria)}</span>
                    <span class="badge tipo">${this.formatarTipo(item.tipo)}</span>
                </div>
            </div>
        `;
        
        if (item.tipo === 'multipla') {
            html += `
                <div class="modal-variacoes">
                    <h4><i class="fas fa-list-ul"></i> Escolha uma variação:</h4>
                    ${item.variacoes.map((variacao, index) => `
                        <div class="variacao-option ${index === 0 ? 'selecionada' : ''}" data-id="${variacao.id}">
                            <input type="radio" name="variacao" id="var-${variacao.id}" 
                                   value="${variacao.id}" ${index === 0 ? 'checked' : ''}>
                            <label for="var-${variacao.id}">
                                <div class="variacao-header">
                                    <strong>${variacao.nome}</strong>
                                    <span class="variacao-custo">${variacao.custo > 0 ? '+' : ''}${variacao.custo} pts</span>
                                </div>
                                <div class="variacao-desc">${variacao.descricao}</div>
                            </label>
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (item.tipo === 'variavel') {
            html += `
                <div class="modal-niveis">
                    <h4><i class="fas fa-sliders-h"></i> Selecione o nível:</h4>
                    <select class="nivel-selector" id="seletor-nivel">
                        ${Array.from({length: item.niveis}, (_, i) => {
                            const nivel = i + 1;
                            const custo = nivel * item.custoPorNivel;
                            return `<option value="${nivel}">Nível ${nivel} (${custo > 0 ? '+' : ''}${custo} pts)</option>`;
                        }).join('')}
                    </select>
                </div>
            `;
        }
        
        return html;
    }
    
    configurarVariacoesModal(item) {
        const opcoes = this.modalCorpo.querySelectorAll('.variacao-option');
        
        opcoes.forEach(opcao => {
            opcao.addEventListener('click', () => {
                opcoes.forEach(o => o.classList.remove('selecionada'));
                opcao.classList.add('selecionada');
                const radio = opcao.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
                
                const variacao = item.variacoes.find(v => v.id === radio.value);
                if (variacao) {
                    this.variacaoSelecionada = variacao;
                    this.atualizarInfoModal(variacao.custo);
                }
            });
        });
        
        // Selecionar primeira por padrão
        if (opcoes[0]) {
            const primeira = opcoes[0];
            primeira.classList.add('selecionada');
            const primeiraVariacao = item.variacoes.find(v => v.id === primeira.dataset.id);
            this.variacaoSelecionada = primeiraVariacao;
            this.atualizarInfoModal(primeiraVariacao.custo);
        }
    }
    
    configurarNiveisModal(item) {
        const seletor = this.modalCorpo.querySelector('#seletor-nivel');
        if (!seletor) return;
        
        const atualizarCusto = () => {
            const nivel = parseInt(seletor.value);
            this.nivelSelecionado = nivel;
            const custo = nivel * item.custoPorNivel;
            this.atualizarInfoModal(custo);
        };
        
        seletor.addEventListener('change', atualizarCusto);
        atualizarCusto();
    }
    
    atualizarInfoModal(custo) {
        if (!this.modalInfo) return;
        
        const sinal = this.tipoSelecionado === 'vantagem' ? '+' : '-';
        const custoAbs = Math.abs(custo);
        const cor = this.tipoSelecionado === 'vantagem' ? '#2ecc71' : '#e74c3c';
        
        this.modalInfo.innerHTML = `
            <i class="fas fa-coins" style="color: ${cor};"></i>
            Custo: <span style="color: ${cor}; font-weight: 800;">${sinal}${custoAbs} pontos</span>
        `;
    }
    
    fecharModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
        this.itemSelecionado = null;
        this.tipoSelecionado = null;
        this.variacaoSelecionada = null;
        this.nivelSelecionado = 1;
    }
    
    // ========== CONFIRMAR ADIÇÃO ==========
    confirmarAdicao() {
        if (!this.itemSelecionado || !this.tipoSelecionado) {
            this.mostrarAlerta('Nenhum item selecionado!', 'erro');
            return;
        }
        
        let itemAdquirido = {
            id: `${this.itemSelecionado.id}-${Date.now()}`,
            baseId: this.itemSelecionado.id,
            nome: this.itemSelecionado.nome,
            descricao: this.itemSelecionado.descricao,
            categoria: this.itemSelecionado.categoria,
            tipo: this.itemSelecionado.tipo,
            timestamp: Date.now()
        };
        
        // Calcular custo
        let custo = 0;
        
        if (this.itemSelecionado.tipo === 'multipla' && this.variacaoSelecionada) {
            itemAdquirido.nome = this.variacaoSelecionada.nome;
            itemAdquirido.descricao = this.variacaoSelecionada.descricao;
            custo = this.variacaoSelecionada.custo;
            itemAdquirido.variacao = this.variacaoSelecionada.id;
        } else if (this.itemSelecionado.tipo === 'variavel') {
            custo = this.nivelSelecionado * this.itemSelecionado.custoPorNivel;
            itemAdquirido.nivel = this.nivelSelecionado;
            itemAdquirido.custoPorNivel = this.itemSelecionado.custoPorNivel;
        } else {
            custo = this.itemSelecionado.custo;
        }
        
        // Para desvantagens, custo é negativo
        if (this.tipoSelecionado === 'desvantagem') {
            custo = -Math.abs(custo);
        }
        
        itemAdquirido.custo = custo;
        
        // Verificar pontos disponíveis
        const pontosNecessarios = Math.abs(custo);
        if (custo > 0 && pontosNecessarios > this.pontosRestantes) {
            this.mostrarAlerta('Pontos insuficientes!', 'erro');
            return;
        }
        
        // Adicionar à lista correta
        if (this.tipoSelecionado === 'vantagem') {
            this.vantagensAdquiridas.push(itemAdquirido);
        } else {
            this.desvantagensAdquiridas.push(itemAdquirido);
        }
        
        // Atualizar pontos
        this.pontosRestantes -= Math.abs(custo);
        if (this.tipoSelecionado === 'desvantagem') {
            this.pontosRestantes += Math.abs(custo) * 2; // Desvantagens dão pontos
        }
        
        this.atualizarInterface();
        this.fecharModal();
        
        this.mostrarAlerta(
            `${this.tipoSelecionado === 'vantagem' ? 'Vantagem' : 'Desvantagem'} adicionada!`,
            'sucesso'
        );
        
        console.log(`${this.tipoSelecionado} adicionado:`, itemAdquirido);
    }
    
    // ========== PECULIARIDADES ==========
    atualizarContadorCaracteres() {
        const input = document.getElementById('input-peculiaridade');
        const contador = document.getElementById('contador-chars');
        if (!input || !contador) return;
        
        const comprimento = input.value.length;
        contador.textContent = `${comprimento}/50`;
        
        // Mudar cor conforme limite
        if (comprimento > 50) {
            contador.style.color = '#e74c3c';
        } else if (comprimento > 40) {
            contador.style.color = '#f39c12';
        } else {
            contador.style.color = '#2ecc71';
        }
    }
    
    atualizarEstadoBotaoPec() {
        const input = document.getElementById('input-peculiaridade');
        const btn = document.getElementById('btn-adicionar-pec');
        if (!input || !btn) return;
        
        const texto = input.value.trim();
        const podeAdicionar = texto.length > 0 && 
                            texto.length <= 50 && 
                            this.peculiaridades.length < 5;
        
        btn.disabled = !podeAdicionar;
    }
    
    adicionarPeculiaridade() {
        const input = document.getElementById('input-peculiaridade');
        if (!input) return;
        
        const texto = input.value.trim();
        
        if (texto.length === 0 || texto.length > 50) {
            this.mostrarAlerta('Texto inválido!', 'erro');
            return;
        }
        
        if (this.peculiaridades.length >= 5) {
            this.mostrarAlerta('Limite de 5 peculiaridades atingido!', 'erro');
            return;
        }
        
        const peculiaridade = {
            id: `pec-${Date.now()}`,
            texto: texto,
            custo: -1 // Cada peculiaridade custa 1 ponto
        };
        
        this.peculiaridades.push(peculiaridade);
        this.pontosRestantes -= 1; // Custa 1 ponto
        
        input.value = '';
        this.atualizarContadorCaracteres();
        this.atualizarEstadoBotaoPec();
        this.atualizarPeculiaridades();
        this.atualizarInterface();
        
        this.mostrarAlerta('Peculiaridade adicionada! (-1 ponto)', 'sucesso');
    }
    
    atualizarPeculiaridades() {
        const container = document.getElementById('lista-peculiaridades');
        const contador = document.getElementById('contador-pec-atual');
        const contadorGeral = document.getElementById('contador-pec');
        
        if (!container) return;
        
        if (this.peculiaridades.length === 0) {
            container.innerHTML = `
                <div class="lista-vazia">
                    <i class="fas fa-sticky-note"></i>
                    <p>Nenhuma peculiaridade adicionada</p>
                    <small>Adicione traços específicos do personagem</small>
                </div>
            `;
        } else {
            container.innerHTML = this.peculiaridades.map((pec, index) => `
                <div class="peculiaridade-item">
                    <div class="peculiaridade-texto">${pec.texto}</div>
                    <button class="btn-remover" onclick="sistemaVantagens.removerPeculiaridade(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
        }
        
        if (contador) contador.textContent = `${this.peculiaridades.length}/5`;
        if (contadorGeral) contadorGeral.textContent = `${this.peculiaridades.length}/5`;
    }
    
    removerPeculiaridade(index) {
        if (index < 0 || index >= this.peculiaridades.length) return;
        
        if (!confirm('Remover esta peculiaridade? Você recuperará 1 ponto.')) return;
        
        this.peculiaridades.splice(index, 1);
        this.pontosRestantes += 1; // Recupera 1 ponto
        
        this.atualizarPeculiaridades();
        this.atualizarInterface();
        
        this.mostrarAlerta('Peculiaridade removida! (+1 ponto)', 'info');
    }
    
    // ========== FILTROS ==========
    filtrarLista(tipo, termo) {
        const containerId = tipo === 'vantagem' ? 'lista-vantagens' : 'lista-desvantagens';
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const itens = container.querySelectorAll(`.item-${tipo}`);
        termo = termo.toLowerCase().trim();
        
        itens.forEach(item => {
            const nome = item.querySelector('.item-nome')?.textContent.toLowerCase() || '';
            const desc = item.querySelector('.item-descricao')?.textContent.toLowerCase() || '';
            const categoria = item.querySelector('.item-categoria')?.textContent.toLowerCase() || '';
            
            const match = nome.includes(termo) || desc.includes(termo) || categoria.includes(termo);
            item.style.display = match ? 'block' : 'none';
        });
    }
    
    filtrarPorCategoria(tipo, categoria) {
        const containerId = tipo === 'vantagem' ? 'lista-vantagens' : 'lista-desvantagens';
        const container = document.getElementById(containerId);
        if (!container || !categoria) return;
        
        const itens = container.querySelectorAll(`.item-${tipo}`);
        
        itens.forEach(item => {
            const itemCategoria = item.querySelector('.item-categoria')?.textContent.toLowerCase() || '';
            const match = categoria === '' || itemCategoria.includes(categoria.toLowerCase());
            item.style.display = match ? 'block' : 'none';
        });
    }
    
    limparFiltros(tipo) {
        const buscaId = tipo === 'vantagem' ? 'busca-vantagens' : 'busca-desvantagens';
        const filtroId = tipo === 'vantagem' ? 'filtro-categoria-vant' : 'filtro-categoria-desv';
        
        const busca = document.getElementById(buscaId);
        const filtro = document.getElementById(filtroId);
        
        if (busca) busca.value = '';
        if (filtro) filtro.value = '';
        
        this.filtrarLista(tipo, '');
        this.filtrarPorCategoria(tipo, '');
        
        this.mostrarAlerta('Filtros limpos!', 'info');
    }
    
    // ========== LIMPAR DADOS ==========
    confirmarLimpar(tipo) {
        const confirmacao = confirm(`Tem certeza que deseja limpar todas as ${tipo}s?`);
        if (!confirmacao) return;
        
        switch (tipo) {
            case 'vantagem':
                this.vantagensAdquiridas = [];
                break;
            case 'desvantagem':
                this.desvantagensAdquiridas = [];
                break;
            case 'peculiaridade':
                this.peculiaridades = [];
                break;
        }
        
        this.atualizarInterface();
        this.mostrarAlerta(`${tipo}s limpas!`, 'info');
    }
    
    confirmarReset() {
        const confirmacao = confirm('Tem certeza que deseja resetar TODOS os dados?');
        if (!confirmacao) return;
        
        this.vantagensAdquiridas = [];
        this.desvantagensAdquiridas = [];
        this.peculiaridades = [];
        this.pontosRestantes = this.pontosIniciais;
        
        this.atualizarInterface();
        this.mostrarAlerta('Sistema resetado com sucesso!', 'sucesso');
    }
    
    // ========== ATUALIZAR INTERFACE ==========
    atualizarInterface() {
        // Atualizar contadores
        document.getElementById('num-vant-adquiridas').textContent = this.vantagensAdquiridas.length;
        document.getElementById('num-desv-adquiridas').textContent = this.desvantagensAdquiridas.length;
        
        // Atualizar totais
        const totalVantagens = this.vantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0);
        const totalDesvantagens = this.desvantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0);
        const totalPeculiaridades = this.peculiaridades.length;
        const saldo = totalVantagens - totalDesvantagens - totalPeculiaridades;
        
        document.getElementById('total-vantagens').textContent = `+${totalVantagens}`;
        document.getElementById('total-desvantagens').textContent = `-${totalDesvantagens}`;
        document.getElementById('total-peculiaridades').textContent = `-${totalPeculiaridades}`;
        document.getElementById('saldo-total').textContent = saldo >= 0 ? `+${saldo}` : `${saldo}`;
        
        // Atualizar status do saldo
        const saldoStatus = document.getElementById('saldo-status');
        if (saldoStatus) {
            if (saldo > 0) {
                saldoStatus.textContent = 'Positivo';
                saldoStatus.style.color = '#2ecc71';
            } else if (saldo < 0) {
                saldoStatus.textContent = 'Negativo';
                saldoStatus.style.color = '#e74c3c';
            } else {
                saldoStatus.textContent = 'Neutro';
                saldoStatus.style.color = '#f39c12';
            }
        }
        
        // Atualizar pontos
        document.getElementById('custo-vantagens').textContent = totalVantagens;
        document.getElementById('pontos-desvantagens').textContent = totalDesvantagens;
        document.getElementById('pontos-restantes').textContent = this.pontosRestantes;
        
        // Atualizar listas adquiridas
        this.atualizarListaAdquirida('vantagens-adquiridas', this.vantagensAdquiridas, 'vantagem');
        this.atualizarListaAdquirida('desvantagens-adquiridas', this.desvantagensAdquiridas, 'desvantagem');
        
        // Atualizar status do sistema
        this.atualizarStatusSistema();
    }
    
    atualizarListaAdquirida(containerId, itens, tipo) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (itens.length === 0) {
            container.innerHTML = `
                <div class="lista-vazia">
                    <i class="fas fa-inbox"></i>
                    <p>Nenhuma ${tipo} adquirida</p>
                    ${tipo === 'vantagem' ? '<small>Clique em uma vantagem disponível para adicionar</small>' : ''}
                </div>
            `;
        } else {
            container.innerHTML = itens.map((item, index) => {
                const cor = tipo === 'vantagem' ? '#2ecc71' : '#e74c3c';
                const sinal = item.custo >= 0 ? '+' : '';
                
                let detalhes = '';
                if (item.nivel) detalhes += `<div><small>Nível ${item.nivel}</small></div>`;
                if (item.variacao) detalhes += `<div><small>Variação específica</small></div>`;
                
                return `
                    <div class="item-adquirido ${tipo === 'vantagem' ? 'item-vantagem' : 'item-desvantagem'}">
                        <div class="item-header">
                            <h4 class="item-nome">${item.nome}</h4>
                            <div class="item-custo" style="background: ${cor}">${sinal}${Math.abs(item.custo)} pts</div>
                        </div>
                        ${detalhes}
                        <div class="item-descricao">${item.descricao}</div>
                        <button class="btn-remover" onclick="sistemaVantagens.removerItemAdquirido(${index}, '${tipo}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            }).join('');
        }
    }
    
    removerItemAdquirido(index, tipo) {
        if (index < 0) return;
        
        const lista = tipo === 'vantagem' ? this.vantagensAdquiridas : this.desvantagensAdquiridas;
        if (index >= lista.length) return;
        
        const item = lista[index];
        const confirmacao = confirm(`Remover "${item.nome}"?`);
        
        if (!confirmacao) return;
        
        // Recuperar pontos
        if (tipo === 'vantagem') {
            this.pontosRestantes += Math.abs(item.custo);
        } else {
            this.pontosRestantes -= Math.abs(item.custo);
        }
        
        lista.splice(index, 1);
        this.atualizarInterface();
        
        this.mostrarAlerta('Item removido!', 'info');
    }
    
    atualizarStatusSistema() {
        const statusEl = document.getElementById('status-sistema');
        if (!statusEl) return;
        
        const totalItens = this.vantagensAdquiridas.length + this.desvantagensAdquiridas.length;
        
        if (totalItens === 0) {
            statusEl.innerHTML = '<i class="fas fa-circle" style="color: #95a5a6;"></i> Aguardando seleção';
            statusEl.style.color = '#95a5a6';
        } else if (this.pontosRestantes < 0) {
            statusEl.innerHTML = '<i class="fas fa-circle" style="color: #e74c3c;"></i> Pontos excedidos!';
            statusEl.style.color = '#e74c3c';
        } else if (this.pontosRestantes === 0) {
            statusEl.innerHTML = '<i class="fas fa-circle" style="color: #f39c12;"></i> Pontos esgotados';
            statusEl.style.color = '#f39c12';
        } else {
            statusEl.innerHTML = '<i class="fas fa-circle" style="color: #2ecc71;"></i> Sistema pronto';
            statusEl.style.color = '#2ecc71';
        }
    }
    
    // ========== UTILITÁRIOS ==========
    formatarCategoria(categoria) {
        const categorias = {
            'mental': 'Mental',
            'fisica': 'Física',
            'social': 'Social',
            'sobrenatural': 'Sobrenatural'
        };
        return categorias[categoria] || categoria;
    }
    
    formatarTipo(tipo) {
        const tipos = {
            'simples': 'Simples',
            'multipla': 'Múltipla',
            'variavel': 'Variável'
        };
        return tipos[tipo] || tipo;
    }
    
    mostrarAlerta(mensagem, tipo = 'info') {
        // Remover alertas anteriores
        const alertasAntigos = document.querySelectorAll('.custom-alert');
        alertasAntigos.forEach(alerta => alerta.remove());
        
        const alerta = document.createElement('div');
        alerta.className = `custom-alert alert-${tipo}`;
        alerta.innerHTML = `
            <i class="fas fa-${tipo === 'sucesso' ? 'check-circle' : tipo === 'erro' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${mensagem}</span>
        `;
        
        document.body.appendChild(alerta);
        
        // Estilizar
        Object.assign(alerta.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 25px',
            borderRadius: '10px',
            background: tipo === 'sucesso' ? 'rgba(46, 204, 113, 0.9)' : 
                       tipo === 'erro' ? 'rgba(231, 76, 60, 0.9)' : 'rgba(52, 152, 219, 0.9)',
            color: 'white',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            zIndex: '99999',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            animation: 'slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards'
        });
        
        // Animação
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            if (alerta.parentNode) {
                alerta.parentNode.removeChild(alerta);
            }
        }, 3000);
    }
    
    // ========== EXPORTAÇÃO E SALVAMENTO ==========
    exportarDados() {
        const dados = {
            vantagens: this.vantagensAdquiridas,
            desvantagens: this.desvantagensAdquiridas,
            peculiaridades: this.peculiaridades,
            pontos: {
                inicial: this.pontosIniciais,
                restante: this.pontosRestantes,
                gasto: this.pontosIniciais - this.pontosRestantes
            },
            resumo: {
                totalVantagens: this.vantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0),
                totalDesvantagens: this.desvantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0),
                totalPeculiaridades: this.peculiaridades.length,
                saldo: (this.vantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0) - 
                       this.desvantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0) - 
                       this.peculiaridades.length)
            }
        };
        
        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `personagem-vantagens-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.mostrarAlerta('Dados exportados com sucesso!', 'sucesso');
    }
    
    salvarDados() {
        localStorage.setItem('vantagensSystemData', JSON.stringify({
            vantagens: this.vantagensAdquiridas,
            desvantagens: this.desvantagensAdquiridas,
            peculiaridades: this.peculiaridades,
            pontosRestantes: this.pontosRestantes
        }));
        
        this.mostrarAlerta('Dados salvos localmente!', 'sucesso');
    }
    
    carregarDadosSalvos() {
        const dados = localStorage.getItem('vantagensSystemData');
        if (dados) {
            try {
                const parsed = JSON.parse(dados);
                this.vantagensAdquiridas = parsed.vantagens || [];
                this.desvantagensAdquiridas = parsed.desvantagens || [];
                this.peculiaridades = parsed.peculiaridades || [];
                this.pontosRestantes = parsed.pontosRestantes || this.pontosIniciais;
                
                this.atualizarInterface();
                this.mostrarAlerta('Dados carregados!', 'sucesso');
            } catch (e) {
                console.error('Erro ao carregar dados:', e);
            }
        }
    }
    
    gerarFicha() {
        // Gerar PDF ou imagem da ficha
        this.mostrarAlerta('Funcionalidade de PDF em desenvolvimento!', 'info');
    }
}

// ========== INICIALIZAR SISTEMA ==========
let sistemaVantagens;

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado - Iniciando sistema...');
    
    sistemaVantagens = new SistemaVantagens();
    
    // Carregar dados salvos
    setTimeout(() => sistemaVantagens.carregarDadosSalvos(), 1000);
    
    // Expor para o console
    window.sistemaVantagens = sistemaVantagens;
});

// CSS adicional para alertas
const styleAlert = document.createElement('style');
styleAlert.textContent = `
    .custom-alert {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }
    
    .alert-sucesso i { color: #27ae60; }
    .alert-erro i { color: #c0392b; }
    .alert-info i { color: #2980b9; }
`;
document.head.appendChild(styleAlert);

console.log('🎮 Sistema de Vantagens carregado! Use window.sistemaVantagens para acesso global.');
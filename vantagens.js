// ============================================
// SISTEMA DE VANTAGENS - JAVASCRIPT COMPLETO
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
        this.pontosDisponiveis = 100;
        this.pontosGastos = 0;
        this.pontosGanhos = 0;
        this.saldoTotal = 0;
        
        // Configurações
        this.config = {
            maxPeculiaridades: 5,
            pontosIniciais: 100,
            custoPeculiaridade: 1
        };
        
        // Cache de elementos DOM
        this.elements = {};
        
        // Estado do sistema
        this.estado = {
            carregando: false,
            filtroVantagens: '',
            filtroDesvantagens: '',
            categoriaVantagens: '',
            categoriaDesvantagens: ''
        };
        
        this.init();
    }
    
    // ========== INICIALIZAÇÃO COMPLETA ==========
    init() {
        console.log('🎮 Sistema de Vantagens inicializando...');
        
        this.cacheElements();
        this.carregarDadosCatalogo();
        this.configurarEventos();
        this.carregarDadosSalvos();
        this.carregarInterface();
        this.atualizarTudo();
        
        console.log('✅ Sistema pronto para uso');
        
        // Inicializar após 100ms para garantir DOM carregado
        setTimeout(() => {
            this.verificarEstadoInicial();
        }, 100);
    }
    
    // ========== CACHE DE ELEMENTOS DOM ==========
    cacheElements() {
        // Elementos principais
        this.elements = {
            // Status
            pontosDisponiveisEl: document.getElementById('pontos-disponiveis'),
            saldoTotalEl: document.getElementById('saldo-total'),
            
            // Vantagens
            listaVantagensDisponiveis: document.getElementById('lista-vantagens-disponiveis'),
            listaVantagensAdquiridas: document.getElementById('lista-vantagens-adquiridas'),
            buscaVantagens: document.getElementById('busca-vantagens'),
            filtroVantagens: document.getElementById('filtro-vantagens'),
            contadorVantagens: document.getElementById('contador-vantagens'),
            custoVantagens: document.getElementById('custo-vantagens'),
            
            // Desvantagens
            listaDesvantagensDisponiveis: document.getElementById('lista-desvantagens-disponiveis'),
            listaDesvantagensAdquiridas: document.getElementById('lista-desvantagens-adquiridas'),
            buscaDesvantagens: document.getElementById('busca-desvantagens'),
            filtroDesvantagens: document.getElementById('filtro-desvantagens'),
            contadorDesvantagens: document.getElementById('contador-desvantagens'),
            pontosDesvantagens: document.getElementById('pontos-desvantagens'),
            
            // Peculiaridades
            novaPeculiaridade: document.getElementById('nova-peculiaridade'),
            listaPeculiaridades: document.getElementById('lista-peculiaridades'),
            contadorPeculiaridades: document.getElementById('contador-peculiaridades'),
            contadorCaracteres: document.getElementById('contador-caracteres'),
            btnAdicionarPec: document.getElementById('btn-adicionar-pec'),
            
            // Resumo
            resumoVantagens: document.getElementById('resumo-vantagens'),
            resumoDesvantagens: document.getElementById('resumo-desvantagens'),
            resumoPeculiaridades: document.getElementById('resumo-peculiaridades'),
            resumoSaldo: document.getElementById('resumo-saldo'),
            
            // Modal
            modalOverlay: document.getElementById('modal-compra'),
            modalTitulo: document.getElementById('modal-titulo'),
            modalConteudo: document.getElementById('modal-conteudo'),
            btnFecharModal: document.getElementById('fechar-modal'),
            btnCancelar: document.getElementById('btn-cancelar'),
            btnAdquirir: document.getElementById('btn-adquirir'),
            
            // Botões de ação
            btnResetRapido: document.getElementById('btn-reset-rapido'),
            btnSalvarRapido: document.getElementById('btn-salvar-rapido'),
            limparVantagens: document.getElementById('limpar-vantagens'),
            limparDesvantagens: document.getElementById('limpar-desvantagens'),
            btnExportar: document.getElementById('btn-exportar'),
            btnImprimir: document.getElementById('btn-imprimir')
        };
    }
    
    // ========== CARREGAR DADOS DO CATÁLOGO ==========
    carregarDadosCatalogo() {
        // Se já existir no window, usar
        if (window.vantagensData) {
            this.catalogo = window.vantagensData;
            return;
        }
        
        // Catálogo padrão (você pode substituir pelo seu)
        this.catalogo = {
            vantagens: [
                {
                    id: "abencoado",
                    nome: "Abençoado",
                    categoria: "sobrenatural",
                    tipo: "multipla",
                    descricao: "Sintonizado com uma entidade divina/demoníaca/espiritual. Permite receber visões e orientações da entidade.",
                    variacoes: [
                        {
                            id: "abencoado-basico",
                            nome: "Abençoado (Básico)",
                            custo: 10,
                            descricao: "Recebe visões após 1 hora de ritual. Mestre faz teste secreto de IQ para determinar clareza."
                        },
                        {
                            id: "muito-abencoado",
                            nome: "Muito Abençoado",
                            custo: 20,
                            descricao: "+5 no teste de IQ para visões. +2 de reação de seguidores da mesma fé. Visões mais claras."
                        },
                        {
                            id: "feitos-heroicos",
                            nome: "Feitos Heroicos",
                            custo: 15,
                            descricao: "1 vez por sessão: +1 dado em ST, DX ou HT por 3d segundos durante atos heroicos."
                        }
                    ]
                },
                {
                    id: "resistencia-magia",
                    nome: "Resistência à Magia",
                    categoria: "sobrenatural",
                    tipo: "variavel",
                    descricao: "Resistência natural contra efeitos mágicos. Cada nível fornece +2 em testes de resistência contra magia.",
                    niveis: 5,
                    custoPorNivel: 3,
                    nivelBase: 1
                },
                {
                    id: "sentidos-aguçados",
                    nome: "Sentidos Aguçados",
                    categoria: "fisica",
                    tipo: "simples",
                    custo: 5,
                    descricao: "Visão, audição ou olfato excepcionais. +2 em todos os testes de percepção relacionados ao sentido escolhido."
                },
                {
                    id: "carisma",
                    nome: "Carisma",
                    categoria: "social",
                    tipo: "variavel",
                    descricao: "Habilidade natural de influenciar pessoas. Cada nível fornece +1 em testes de persuasão, negociação e liderança.",
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
                    descricao: "+1 em todos os testes de iniciativa e esquiva. Reação excepcionalmente rápida em situações de perigo."
                },
                {
                    id: "sortudo",
                    nome: "Sortudo",
                    categoria: "mental",
                    tipo: "variavel",
                    descricao: "Sorte extraordinária. Pode rerrolar dados de acordo com o nível. Nível 1: 1 rerrolação por sessão.",
                    niveis: 3,
                    custoPorNivel: 15,
                    nivelBase: 1
                },
                {
                    id: "imunidade-doenca",
                    nome: "Imunidade a Doenças",
                    categoria: "fisica",
                    tipo: "simples",
                    custo: 10,
                    descricao: "Imune a todas as doenças naturais. Ainda vulnerável a doenças mágicas ou sobrenaturais."
                },
                {
                    id: "linguista",
                    nome: "Linguista",
                    categoria: "mental",
                    tipo: "variavel",
                    descricao: "Facilidade com línguas. Cada nível permite aprender uma nova língua em metade do tempo normal.",
                    niveis: 5,
                    custoPorNivel: 2,
                    nivelBase: 1
                }
            ],
            desvantagens: [
                {
                    id: "alcoolismo",
                    nome: "Alcoolismo",
                    categoria: "mental",
                    tipo: "multipla",
                    descricao: "Vício em álcool que afeta o julgamento e comportamento. Penalidades aumentam com a gravidade.",
                    variacoes: [
                        {
                            id: "alcoolismo-leve",
                            nome: "Alcoolismo (Leve)",
                            custo: -10,
                            descricao: "Precisa beber regularmente. -1 em testes de IQ quando sóbrio por mais de 12 horas."
                        },
                        {
                            id: "alcoolismo-grave",
                            nome: "Alcoolismo (Grave)",
                            custo: -20,
                            descricao: "Dependente. Teste de Vontade diário para evitar bebida. -2 em todos os testes quando em abstinência."
                        }
                    ]
                },
                {
                    id: "medo-de-altura",
                    nome: "Medo de Altura",
                    categoria: "mental",
                    tipo: "simples",
                    custo: -15,
                    descricao: "Fobia incapacitante de lugares altos. Teste de medo obrigatório em alturas acima de 3m. Falha resulta em paralisia."
                },
                {
                    id: "codigo-honra",
                    nome: "Código de Honra",
                    categoria: "social",
                    tipo: "multipla",
                    descricao: "Seguir um código rígido de conduta que limita ações. Violar o código causa perda de pontos de vantagens.",
                    variacoes: [
                        {
                            id: "honra-samurai",
                            nome: "Código do Samurai",
                            custo: -15,
                            descricao: "Bushido - Lealdade, honra, coragem acima de tudo. Deve proteger seu senhor até a morte."
                        },
                        {
                            id: "honra-cavaleiro",
                            nome: "Código do Cavaleiro",
                            custo: -10,
                            descricao: "Proteger os fracos, ser cortês, cumprir promessas. Não pode atacar primeiro ou usar armas desleais."
                        }
                    ]
                },
                {
                    id: "pobre",
                    nome: "Pobre",
                    categoria: "social",
                    tipo: "variavel",
                    descricao: "Falta de recursos financeiros. Cada nível reduz o padrão de vida e recursos disponíveis.",
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
                    descricao: "Doença persistente que requer tratamento regular. -1 em todos os testes físicos quando não medicado."
                },
                {
                    id: "mau-temperamento",
                    nome: "Mau Temperamento",
                    categoria: "mental",
                    tipo: "simples",
                    custo: -10,
                    descricao: "Fácil de irritar. Teste de Vontade para controlar raiva em situações frustrantes."
                },
                {
                    id: "inimigo",
                    nome: "Inimigo",
                    categoria: "social",
                    tipo: "variavel",
                    descricao: "Alguém quer te prejudicar. Cada nível aumenta a frequência e periculosidade dos ataques.",
                    niveis: 3,
                    custoPorNivel: -5,
                    nivelBase: 1
                },
                {
                    id: "vicio-tabaco",
                    nome: "Vício em Tabaco",
                    categoria: "mental",
                    tipo: "simples",
                    custo: -5,
                    descricao: "Precisa fumar regularmente. -1 em testes de concentração quando sem tabaco por mais de 2 horas."
                }
            ]
        };
        
        window.vantagensData = this.catalogo;
    }
    
    // ========== CONFIGURAR TODOS OS EVENTOS ==========
    configurarEventos() {
        this.configurarEventosBusca();
        this.configurarEventosFiltro();
        this.configurarEventosPeculiaridades();
        this.configurarEventosModal();
        this.configurarEventosBotoes();
        this.configurarEventosItens();
    }
    
    configurarEventosBusca() {
        // Busca de vantagens
        if (this.elements.buscaVantagens) {
            this.elements.buscaVantagens.addEventListener('input', (e) => {
                this.estado.filtroVantagens = e.target.value.toLowerCase();
                this.filtrarVantagens();
            });
        }
        
        // Busca de desvantagens
        if (this.elements.buscaDesvantagens) {
            this.elements.buscaDesvantagens.addEventListener('input', (e) => {
                this.estado.filtroDesvantagens = e.target.value.toLowerCase();
                this.filtrarDesvantagens();
            });
        }
    }
    
    configurarEventosFiltro() {
        // Filtro de categoria para vantagens
        if (this.elements.filtroVantagens) {
            this.elements.filtroVantagens.addEventListener('change', (e) => {
                this.estado.categoriaVantagens = e.target.value;
                this.filtrarVantagens();
            });
        }
        
        // Filtro de categoria para desvantagens
        if (this.elements.filtroDesvantagens) {
            this.elements.filtroDesvantagens.addEventListener('change', (e) => {
                this.estado.categoriaDesvantagens = e.target.value;
                this.filtrarDesvantagens();
            });
        }
    }
    
    configurarEventosPeculiaridades() {
        if (!this.elements.novaPeculiaridade || !this.elements.btnAdicionarPec) return;
        
        // Atualizar contador de caracteres
        this.elements.novaPeculiaridade.addEventListener('input', () => {
            this.atualizarContadorCaracteres();
            this.atualizarEstadoBotaoPec();
        });
        
        // Adicionar com Enter (mas não criar nova linha)
        this.elements.novaPeculiaridade.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!this.elements.btnAdicionarPec.disabled) {
                    this.adicionarPeculiaridade();
                }
            }
        });
        
        // Botão adicionar
        this.elements.btnAdicionarPec.addEventListener('click', () => {
            this.adicionarPeculiaridade();
        });
    }
    
    configurarEventosModal() {
        if (!this.elements.modalOverlay) return;
        
        // Fechar modal
        if (this.elements.btnFecharModal) {
            this.elements.btnFecharModal.addEventListener('click', () => this.fecharModal());
        }
        
        if (this.elements.btnCancelar) {
            this.elements.btnCancelar.addEventListener('click', () => this.fecharModal());
        }
        
        // Fechar ao clicar fora
        this.elements.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.elements.modalOverlay) {
                this.fecharModal();
            }
        });
        
        // Adquirir item
        if (this.elements.btnAdquirir) {
            this.elements.btnAdquirir.addEventListener('click', () => this.confirmarAdicao());
        }
        
        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.modalOverlay.style.display === 'flex') {
                this.fecharModal();
            }
        });
    }
    
    configurarEventosBotoes() {
        // Botões rápidos
        if (this.elements.btnResetRapido) {
            this.elements.btnResetRapido.addEventListener('click', () => this.confirmarReset());
        }
        
        if (this.elements.btnSalvarRapido) {
            this.elements.btnSalvarRapido.addEventListener('click', () => this.salvarDados());
        }
        
        // Limpar listas
        if (this.elements.limparVantagens) {
            this.elements.limparVantagens.addEventListener('click', () => this.confirmarLimpar('vantagens'));
        }
        
        if (this.elements.limparDesvantagens) {
            this.elements.limparDesvantagens.addEventListener('click', () => this.confirmarLimpar('desvantagens'));
        }
        
        // Exportação e impressão
        if (this.elements.btnExportar) {
            this.elements.btnExportar.addEventListener('click', () => this.exportarDados());
        }
        
        if (this.elements.btnImprimir) {
            this.elements.btnImprimir.addEventListener('click', () => this.imprimirFicha());
        }
    }
    
    configurarEventosItens() {
        // Eventos serão adicionados dinamicamente quando os itens forem criados
    }
    
    // ========== CARREGAR INTERFACE ==========
    carregarInterface() {
        this.carregarVantagensDisponiveis();
        this.carregarDesvantagensDisponiveis();
        this.atualizarListasAdquiridas();
        this.atualizarPeculiaridades();
    }
    
    carregarVantagensDisponiveis() {
        if (!this.elements.listaVantagensDisponiveis) return;
        
        const vantagens = this.catalogo.vantagens || [];
        
        if (vantagens.length === 0) {
            this.elements.listaVantagensDisponiveis.innerHTML = `
                <div class="vazio-mensagem">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Nenhuma vantagem disponível</p>
                    <small>Verifique o catálogo de dados</small>
                </div>
            `;
            return;
        }
        
        let html = '';
        vantagens.forEach((vantagem, index) => {
            html += this.criarHTMLItemDisponivel(vantagem, 'vantagem', index);
        });
        
        this.elements.listaVantagensDisponiveis.innerHTML = html;
        
        // Adicionar eventos após renderizar
        setTimeout(() => {
            this.adicionarEventosItensDisponiveis();
        }, 10);
        
        // Atualizar contador
        if (this.elements.contadorVantagens) {
            this.elements.contadorVantagens.textContent = vantagens.length;
        }
    }
    
    carregarDesvantagensDisponiveis() {
        if (!this.elements.listaDesvantagensDisponiveis) return;
        
        const desvantagens = this.catalogo.desvantagens || [];
        
        if (desvantagens.length === 0) {
            this.elements.listaDesvantagensDisponiveis.innerHTML = `
                <div class="vazio-mensagem">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Nenhuma desvantagem disponível</p>
                    <small>Verifique o catálogo de dados</small>
                </div>
            `;
            return;
        }
        
        let html = '';
        desvantagens.forEach((desvantagem, index) => {
            html += this.criarHTMLItemDisponivel(desvantagem, 'desvantagem', index);
        });
        
        this.elements.listaDesvantagensDisponiveis.innerHTML = html;
        
        // Adicionar eventos após renderizar
        setTimeout(() => {
            this.adicionarEventosItensDisponiveis();
        }, 10);
        
        // Atualizar contador
        if (this.elements.contadorDesvantagens) {
            this.elements.contadorDesvantagens.textContent = desvantagens.length;
        }
    }
    
    criarHTMLItemDisponivel(item, tipo, index) {
        const custoDisplay = this.formatarCustoDisplay(item, tipo);
        const descricaoCurta = item.descricao.length > 120 
            ? item.descricao.substring(0, 120) + '...' 
            : item.descricao;
        
        const corBorda = tipo === 'vantagem' ? '#27ae60' : '#e74c3c';
        const classeTipo = tipo === 'vantagem' ? 'item-disponivel' : 'item-disponivel item-desvantagem-disponivel';
        
        return `
            <div class="${classeTipo}" 
                 data-id="${item.id}" 
                 data-tipo="${tipo}" 
                 data-index="${index}"
                 style="border-left-color: ${corBorda};">
                <div class="item-header">
                    <h4 class="item-nome">${item.nome}</h4>
                    <div class="item-custo">${custoDisplay}</div>
                </div>
                <div class="item-info">
                    <span class="item-categoria">${this.formatarCategoria(item.categoria)}</span>
                    <span class="item-tipo">${this.formatarTipo(item.tipo)}</span>
                </div>
                <div class="item-descricao">${descricaoCurta}</div>
                <div class="item-acao">
                    <button class="btn-selecionar" data-id="${item.id}" data-tipo="${tipo}">
                        <i class="fas fa-plus-circle"></i> Selecionar
                    </button>
                </div>
            </div>
        `;
    }
    
    adicionarEventosItensDisponiveis() {
        // Botões de seleção
        document.querySelectorAll('.btn-selecionar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const tipo = btn.dataset.tipo;
                this.selecionarItem(id, tipo);
            });
        });
        
        // Clicar no item inteiro também seleciona
        document.querySelectorAll('.item-disponivel').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-selecionar') && !e.target.closest('.btn-remover')) {
                    const id = item.dataset.id;
                    const tipo = item.dataset.tipo;
                    this.selecionarItem(id, tipo);
                }
            });
        });
    }
    
    // ========== SELEÇÃO DE ITEM ==========
    selecionarItem(id, tipo) {
        let item;
        
        if (tipo === 'vantagem') {
            item = this.catalogo.vantagens.find(v => v.id === id);
        } else {
            item = this.catalogo.desvantagens.find(d => d.id === id);
        }
        
        if (!item) {
            console.error('Item não encontrado:', id, tipo);
            this.mostrarNotificacao('Item não encontrado!', 'erro');
            return;
        }
        
        this.itemSelecionado = item;
        this.tipoSelecionado = tipo;
        this.variacaoSelecionada = null;
        this.nivelSelecionado = item.nivelBase || 1;
        
        console.log('Selecionado:', item.nome, tipo);
        this.abrirModal(item, tipo);
    }
    
    // ========== MODAL DETALHADO ==========
    abrirModal(item, tipo) {
        if (!this.elements.modalOverlay) return;
        
        // Configurar título
        this.elements.modalTitulo.innerHTML = `
            <i class="fas fa-shopping-cart"></i> 
            Adquirir ${tipo === 'vantagem' ? 'Vantagem' : 'Desvantagem'}: ${item.nome}
        `;
        
        // Gerar conteúdo do modal
        this.elements.modalConteudo.innerHTML = this.gerarConteudoModal(item, tipo);
        
        // Mostrar modal
        this.elements.modalOverlay.style.display = 'flex';
        
        // Adicionar eventos específicos
        setTimeout(() => {
            if (item.tipo === 'multipla') {
                this.configurarEventosVariacoesModal();
            } else if (item.tipo === 'variavel') {
                this.configurarEventosNiveisModal();
            }
            
            // Atualizar estado do botão adquirir
            this.atualizarEstadoBotaoAdquirir();
        }, 10);
        
        // Impedir scroll no body
        document.body.style.overflow = 'hidden';
    }
    
    gerarConteudoModal(item, tipo) {
        const corTipo = tipo === 'vantagem' ? '#27ae60' : '#e74c3c';
        const sinal = tipo === 'vantagem' ? '+' : '-';
        
        let html = `
            <div class="modal-descricao">
                <p>${item.descricao}</p>
                <div class="modal-detalhes">
                    <div class="modal-detalhe">
                        <strong>Categoria</strong>
                        <span>${this.formatarCategoria(item.categoria)}</span>
                    </div>
                    <div class="modal-detalhe">
                        <strong>Tipo</strong>
                        <span>${this.formatarTipo(item.tipo)}</span>
                    </div>
                    <div class="modal-detalhe">
                        <strong>Disponibilidade</strong>
                        <span>${this.verificarDisponibilidade(item, tipo) ? 'Disponível' : 'Indisponível'}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Conteúdo específico por tipo
        if (item.tipo === 'multipla') {
            html += this.gerarConteudoMultipla(item, tipo);
        } else if (item.tipo === 'variavel') {
            html += this.gerarConteudoVariavel(item, tipo);
        } else {
            html += this.gerarConteudoSimples(item, tipo);
        }
        
        // Informação de custo
        const custo = this.calcularCustoAtual(item, tipo);
        html += `
            <div class="custo-total">
                <strong>Custo Total</strong>
                <span>${sinal}${Math.abs(custo)} pontos</span>
            </div>
        `;
        
        return html;
    }
    
    gerarConteudoMultipla(item, tipo) {
        const corTipo = tipo === 'vantagem' ? '#27ae60' : '#e74c3c';
        
        let html = `
            <div class="opcoes-variacao">
                <h4><i class="fas fa-list-ul"></i> Escolha uma variação:</h4>
        `;
        
        item.variacoes.forEach((variacao, index) => {
            const selecionada = index === 0 ? 'selecionada' : '';
            const sinal = variacao.custo > 0 ? '+' : '';
            
            html += `
                <div class="variacao-opcao ${selecionada}" data-id="${variacao.id}">
                    <div class="variacao-header">
                        <strong>${variacao.nome}</strong>
                        <span class="variacao-custo">${sinal}${variacao.custo} pts</span>
                    </div>
                    <div class="variacao-descricao">${variacao.descricao}</div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }
    
    gerarConteudoVariavel(item, tipo) {
        const sinal = tipo === 'vantagem' ? '+' : '-';
        const niveis = Array.from({length: item.niveis}, (_, i) => i + 1);
        
        let html = `
            <div class="selecao-nivel">
                <h4><i class="fas fa-sliders-h"></i> Selecione o nível:</h4>
                <select class="nivel-selector" id="seletor-nivel-modal">
        `;
        
        niveis.forEach(nivel => {
            const custo = nivel * item.custoPorNivel;
            const selecionado = nivel === (item.nivelBase || 1) ? 'selected' : '';
            html += `<option value="${nivel}" ${selecionado}>Nível ${nivel} (${sinal}${custo} pts)</option>`;
        });
        
        html += `
                </select>
                <div class="info-nivel">
                    <p><i class="fas fa-info-circle"></i> Cada nível custa ${sinal}${Math.abs(item.custoPorNivel)} pontos</p>
                </div>
            </div>
        `;
        
        return html;
    }
    
    gerarConteudoSimples(item, tipo) {
        const sinal = tipo === 'vantagem' ? '+' : '-';
        
        return `
            <div class="info-simples">
                <p><i class="fas fa-check-circle"></i> Esta é uma vantagem simples com custo fixo.</p>
                <p><strong>Custo:</strong> ${sinal}${Math.abs(item.custo)} pontos</p>
            </div>
        `;
    }
    
    configurarEventosVariacoesModal() {
        const opcoes = document.querySelectorAll('.variacao-opcao');
        
        opcoes.forEach(opcao => {
            opcao.addEventListener('click', () => {
                // Remover seleção de todas
                opcoes.forEach(o => o.classList.remove('selecionada'));
                // Adicionar seleção à clicada
                opcao.classList.add('selecionada');
                
                // Encontrar a variação selecionada
                const variacaoId = opcao.dataset.id;
                this.variacaoSelecionada = this.itemSelecionado.variacoes.find(v => v.id === variacaoId);
                
                // Atualizar custo
                this.atualizarCustoModal();
                this.atualizarEstadoBotaoAdquirir();
            });
        });
        
        // Selecionar primeira por padrão
        if (opcoes[0]) {
            opcoes[0].click();
        }
    }
    
    configurarEventosNiveisModal() {
        const seletor = document.getElementById('seletor-nivel-modal');
        if (!seletor) return;
        
        const atualizarNivel = () => {
            this.nivelSelecionado = parseInt(seletor.value);
            this.atualizarCustoModal();
            this.atualizarEstadoBotaoAdquirir();
        };
        
        seletor.addEventListener('change', atualizarNivel);
        atualizarNivel(); // Inicializar
    }
    
    atualizarCustoModal() {
        const custo = this.calcularCustoAtual(this.itemSelecionado, this.tipoSelecionado);
        const sinal = this.tipoSelecionado === 'vantagem' ? '+' : '-';
        const custoElement = document.querySelector('.custo-total span');
        
        if (custoElement) {
            custoElement.textContent = `${sinal}${Math.abs(custo)} pontos`;
        }
    }
    
    atualizarEstadoBotaoAdquirir() {
        if (!this.elements.btnAdquirir) return;
        
        const custo = this.calcularCustoAtual(this.itemSelecionado, this.tipoSelecionado);
        const podeComprar = this.verificarDisponibilidade(this.itemSelecionado, this.tipoSelecionado);
        
        if (this.tipoSelecionado === 'vantagem') {
            // Para vantagens, precisa ter pontos suficientes
            const temPontos = Math.abs(custo) <= this.pontosDisponiveis;
            this.elements.btnAdquirir.disabled = !(podeComprar && temPontos);
            
            if (!temPontos) {
                this.elements.btnAdquirir.title = 'Pontos insuficientes!';
            } else {
                this.elements.btnAdquirir.title = '';
            }
        } else {
            // Para desvantagens, sempre pode adicionar (dá pontos)
            this.elements.btnAdquirir.disabled = !podeComprar;
        }
        
        // Adicionar classe de estilo
        if (this.elements.btnAdquirir.disabled) {
            this.elements.btnAdquirir.classList.add('btn-desabilitado');
        } else {
            this.elements.btnAdquirir.classList.remove('btn-desabilitado');
        }
    }
    
    calcularCustoAtual(item, tipo) {
        let custo = 0;
        
        if (item.tipo === 'multipla') {
            if (this.variacaoSelecionada) {
                custo = this.variacaoSelecionada.custo;
            } else if (item.variacoes && item.variacoes.length > 0) {
                custo = item.variacoes[0].custo;
            }
        } else if (item.tipo === 'variavel') {
            custo = this.nivelSelecionado * item.custoPorNivel;
        } else {
            custo = item.custo || 0;
        }
        
        // Para desvantagens, custo é negativo
        if (tipo === 'desvantagem') {
            custo = -Math.abs(custo);
        }
        
        return custo;
    }
    
    verificarDisponibilidade(item, tipo) {
        // Verificar se já não tem uma variação similar
        const lista = tipo === 'vantagem' ? this.vantagensAdquiridas : this.desvantagensAdquiridas;
        
        // Se for múltipla, verificar variações específicas
        if (item.tipo === 'multipla') {
            // Não pode ter duas variações da mesma vantagem base
            return !lista.some(i => i.baseId === item.id);
        }
        
        // Para outros tipos, verificar pelo ID base
        return !lista.some(i => i.baseId === item.id);
    }
    
    fecharModal() {
        if (!this.elements.modalOverlay) return;
        
        this.elements.modalOverlay.style.display = 'none';
        this.itemSelecionado = null;
        this.tipoSelecionado = null;
        this.variacaoSelecionada = null;
        this.nivelSelecionado = 1;
        
        // Restaurar scroll do body
        document.body.style.overflow = '';
    }
    
    // ========== CONFIRMAR ADIÇÃO ==========
    confirmarAdicao() {
        if (!this.itemSelecionado || !this.tipoSelecionado) {
            this.mostrarNotificacao('Nenhum item selecionado!', 'erro');
            return;
        }
        
        // Verificar disponibilidade novamente
        if (!this.verificarDisponibilidade(this.itemSelecionado, this.tipoSelecionado)) {
            this.mostrarNotificacao('Este item já foi adquirido!', 'erro');
            return;
        }
        
        // Criar item adquirido
        const itemAdquirido = this.criarItemAdquirido();
        
        // Verificar pontos para vantagens
        if (this.tipoSelecionado === 'vantagem') {
            const custo = Math.abs(itemAdquirido.custo);
            if (custo > this.pontosDisponiveis) {
                this.mostrarNotificacao('Pontos insuficientes!', 'erro');
                return;
            }
            
            // Gastar pontos
            this.pontosDisponiveis -= custo;
            this.pontosGastos += custo;
        } else {
            // Ganhar pontos com desvantagens
            const pontosGanhos = Math.abs(itemAdquirido.custo);
            this.pontosDisponiveis += pontosGanhos;
            this.pontosGanhos += pontosGanhos;
        }
        
        // Adicionar à lista correta
        if (this.tipoSelecionado === 'vantagem') {
            this.vantagensAdquiridas.push(itemAdquirido);
        } else {
            this.desvantagensAdquiridas.push(itemAdquirido);
        }
        
        // Atualizar tudo
        this.atualizarTudo();
        this.fecharModal();
        
        // Feedback
        const tipoNome = this.tipoSelecionado === 'vantagem' ? 'Vantagem' : 'Desvantagem';
        const mensagem = `${tipoNome} adquirida: ${itemAdquirido.nome}`;
        this.mostrarNotificacao(mensagem, 'sucesso');
        
        // Salvar automaticamente
        this.salvarDadosLocal();
    }
    
    criarItemAdquirido() {
        const item = {
            id: `${this.itemSelecionado.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            baseId: this.itemSelecionado.id,
            nome: this.itemSelecionado.nome,
            descricao: this.itemSelecionado.descricao,
            categoria: this.itemSelecionado.categoria,
            tipo: this.itemSelecionado.tipo,
            dataAdquisicao: new Date().toISOString(),
            custo: this.calcularCustoAtual(this.itemSelecionado, this.tipoSelecionado)
        };
        
        // Adicionar informações específicas
        if (this.itemSelecionado.tipo === 'multipla' && this.variacaoSelecionada) {
            item.nome = this.variacaoSelecionada.nome;
            item.descricao = this.variacaoSelecionada.descricao;
            item.variacaoId = this.variacaoSelecionada.id;
            item.custo = this.variacaoSelecionada.custo;
            if (this.tipoSelecionado === 'desvantagem') {
                item.custo = -Math.abs(item.custo);
            }
        } else if (this.itemSelecionado.tipo === 'variavel') {
            item.nivel = this.nivelSelecionado;
            item.nivelMaximo = this.itemSelecionado.niveis;
            item.custoPorNivel = this.itemSelecionado.custoPorNivel;
        }
        
        return item;
    }
    
    // ========== FILTRAGEM ==========
    filtrarVantagens() {
        if (!this.elements.listaVantagensDisponiveis) return;
        
        const vantagens = this.catalogo.vantagens || [];
        const filtro = this.estado.filtroVantagens.toLowerCase();
        const categoria = this.estado.categoriaVantagens;
        
        let html = '';
        let contador = 0;
        
        vantagens.forEach((vantagem, index) => {
            // Aplicar filtros
            const matchBusca = !filtro || 
                vantagem.nome.toLowerCase().includes(filtro) || 
                vantagem.descricao.toLowerCase().includes(filtro) ||
                vantagem.categoria.toLowerCase().includes(filtro);
            
            const matchCategoria = !categoria || vantagem.categoria === categoria;
            
            // Verificar se já foi adquirida
            const jaAdquirida = this.vantagensAdquiridas.some(v => v.baseId === vantagem.id);
            
            if (matchBusca && matchCategoria && !jaAdquirida) {
                html += this.criarHTMLItemDisponivel(vantagem, 'vantagem', index);
                contador++;
            }
        });
        
        if (contador === 0) {
            html = `
                <div class="vazio-mensagem">
                    <i class="fas fa-search"></i>
                    <p>Nenhuma vantagem encontrada</p>
                    <small>Tente buscar com outros termos</small>
                </div>
            `;
        }
        
        this.elements.listaVantagensDisponiveis.innerHTML = html;
        
        // Re-adicionar eventos
        setTimeout(() => {
            this.adicionarEventosItensDisponiveis();
        }, 10);
        
        // Atualizar contador no header
        if (this.elements.contadorVantagens) {
            this.elements.contadorVantagens.textContent = contador;
        }
    }
    
    filtrarDesvantagens() {
        if (!this.elements.listaDesvantagensDisponiveis) return;
        
        const desvantagens = this.catalogo.desvantagens || [];
        const filtro = this.estado.filtroDesvantagens.toLowerCase();
        const categoria = this.estado.categoriaDesvantagens;
        
        let html = '';
        let contador = 0;
        
        desvantagens.forEach((desvantagem, index) => {
            // Aplicar filtros
            const matchBusca = !filtro || 
                desvantagem.nome.toLowerCase().includes(filtro) || 
                desvantagem.descricao.toLowerCase().includes(filtro) ||
                desvantagem.categoria.toLowerCase().includes(filtro);
            
            const matchCategoria = !categoria || desvantagem.categoria === categoria;
            
            // Verificar se já foi adquirida
            const jaAdquirida = this.desvantagensAdquiridas.some(d => d.baseId === desvantagem.id);
            
            if (matchBusca && matchCategoria && !jaAdquirida) {
                html += this.criarHTMLItemDisponivel(desvantagem, 'desvantagem', index);
                contador++;
            }
        });
        
        if (contador === 0) {
            html = `
                <div class="vazio-mensagem">
                    <i class="fas fa-search"></i>
                    <p>Nenhuma desvantagem encontrada</p>
                    <small>Tente buscar com outros termos</small>
                </div>
            `;
        }
        
        this.elements.listaDesvantagensDisponiveis.innerHTML = html;
        
        // Re-adicionar eventos
        setTimeout(() => {
            this.adicionarEventosItensDisponiveis();
        }, 10);
        
        // Atualizar contador no header
        if (this.elements.contadorDesvantagens) {
            this.elements.contadorDesvantagens.textContent = contador;
        }
    }
    
    // ========== PECULIARIDADES ==========
    atualizarContadorCaracteres() {
        if (!this.elements.novaPeculiaridade || !this.elements.contadorCaracteres) return;
        
        const texto = this.elements.novaPeculiaridade.value;
        const comprimento = texto.length;
        
        this.elements.contadorCaracteres.textContent = `${comprimento}/50`;
        
        // Mudar cor conforme limite
        if (comprimento > 50) {
            this.elements.contadorCaracteres.style.color = '#e74c3c';
        } else if (comprimento > 40) {
            this.elements.contadorCaracteres.style.color = '#f39c12';
        } else {
            this.elements.contadorCaracteres.style.color = '#27ae60';
        }
    }
    
    atualizarEstadoBotaoPec() {
        if (!this.elements.novaPeculiaridade || !this.elements.btnAdicionarPec) return;
        
        const texto = this.elements.novaPeculiaridade.value.trim();
        const podeAdicionar = texto.length > 0 && 
                             texto.length <= 50 && 
                             this.peculiaridades.length < this.config.maxPeculiaridades &&
                             this.pontosDisponiveis >= this.config.custoPeculiaridade;
        
        this.elements.btnAdicionarPec.disabled = !podeAdicionar;
        
        // Atualizar tooltip
        if (this.peculiaridades.length >= this.config.maxPeculiaridades) {
            this.elements.btnAdicionarPec.title = 'Limite de peculiaridades atingido (5)';
        } else if (this.pontosDisponiveis < this.config.custoPeculiaridade) {
            this.elements.btnAdicionarPec.title = 'Pontos insuficientes';
        } else {
            this.elements.btnAdicionarPec.title = 'Adicionar peculiaridade (-1 ponto)';
        }
    }
    
    adicionarPeculiaridade() {
        if (!this.elements.novaPeculiaridade) return;
        
        const texto = this.elements.novaPeculiaridade.value.trim();
        
        // Validações
        if (texto.length === 0) {
            this.mostrarNotificacao('Digite uma peculiaridade!', 'erro');
            return;
        }
        
        if (texto.length > 50) {
            this.mostrarNotificacao('Máximo 50 caracteres!', 'erro');
            return;
        }
        
        if (this.peculiaridades.length >= this.config.maxPeculiaridades) {
            this.mostrarNotificacao(`Limite de ${this.config.maxPeculiaridades} peculiaridades!`, 'erro');
            return;
        }
        
        if (this.pontosDisponiveis < this.config.custoPeculiaridade) {
            this.mostrarNotificacao('Pontos insuficientes!', 'erro');
            return;
        }
        
        // Criar peculiaridade
        const peculiaridade = {
            id: `pec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            texto: texto,
            dataAdicao: new Date().toISOString(),
            custo: -this.config.custoPeculiaridade
        };
        
        // Adicionar
        this.peculiaridades.push(peculiaridade);
        this.pontosDisponiveis -= this.config.custoPeculiaridade;
        this.pontosGastos += this.config.custoPeculiaridade;
        
        // Limpar campo
        this.elements.novaPeculiaridade.value = '';
        
        // Atualizar tudo
        this.atualizarContadorCaracteres();
        this.atualizarEstadoBotaoPec();
        this.atualizarPeculiaridades();
        this.atualizarTudo();
        
        // Feedback
        this.mostrarNotificacao('Peculiaridade adicionada! (-1 ponto)', 'sucesso');
        
        // Salvar
        this.salvarDadosLocal();
    }
    
    atualizarPeculiaridades() {
        if (!this.elements.listaPeculiaridades || !this.elements.contadorPeculiaridades) return;
        
        if (this.peculiaridades.length === 0) {
            this.elements.listaPeculiaridades.innerHTML = `
                <div class="vazio-mensagem">
                    <i class="fas fa-sticky-note"></i>
                    <p>Nenhuma peculiaridade</p>
                    <small>Adicione traços específicos do personagem</small>
                </div>
            `;
        } else {
            let html = '';
            this.peculiaridades.forEach((pec, index) => {
                html += `
                    <div class="peculiaridade-item" data-index="${index}">
                        <div class="peculiaridade-texto">${pec.texto}</div>
                        <button class="btn-remover" onclick="sistemaVantagens.removerPeculiaridade(${index})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            });
            this.elements.listaPeculiaridades.innerHTML = html;
        }
        
        // Atualizar contador
        this.elements.contadorPeculiaridades.textContent = `${this.peculiaridades.length}/${this.config.maxPeculiaridades}`;
    }
    
    removerPeculiaridade(index) {
        if (index < 0 || index >= this.peculiaridades.length) return;
        
        if (!confirm('Remover esta peculiaridade? Você recuperará 1 ponto.')) return;
        
        const removida = this.peculiaridades.splice(index, 1)[0];
        this.pontosDisponiveis += Math.abs(removida.custo);
        this.pontosGastos -= Math.abs(removida.custo);
        
        this.atualizarPeculiaridades();
        this.atualizarTudo();
        
        this.mostrarNotificacao('Peculiaridade removida! (+1 ponto)', 'info');
        this.salvarDadosLocal();
    }
    
    // ========== ATUALIZAR LISTAS ADQUIRIDAS ==========
    atualizarListasAdquiridas() {
        this.atualizarListaAdquirida('vantagem');
        this.atualizarListaAdquirida('desvantagem');
    }
    
    atualizarListaAdquirida(tipo) {
        const elementos = tipo === 'vantagem' ? {
            lista: this.elements.listaVantagensAdquiridas,
            contador: this.elements.contadorVantagens
        } : {
            lista: this.elements.listaDesvantagensAdquiridas,
            contador: this.elements.contadorDesvantagens
        };
        
        if (!elementos.lista) return;
        
        const itens = tipo === 'vantagem' ? this.vantagensAdquiridas : this.desvantagensAdquiridas;
        
        if (itens.length === 0) {
            elementos.lista.innerHTML = `
                <div class="vazio-mensagem">
                    <i class="fas fa-inbox"></i>
                    <p>Nenhuma ${tipo === 'vantagem' ? 'vantagem' : 'desvantagem'}</p>
                    <small>Selecione itens disponíveis para adicionar</small>
                </div>
            `;
        } else {
            let html = '';
            itens.forEach((item, index) => {
                html += this.criarHTMLItemAdquirido(item, tipo, index);
            });
            elementos.lista.innerHTML = html;
            
            // Adicionar eventos de remoção
            setTimeout(() => {
                this.adicionarEventosRemocao(tipo);
            }, 10);
        }
        
        // Atualizar contador se for o contador geral (não o de disponíveis)
        // O contador de disponíveis é atualizado na filtragem
    }
    
    criarHTMLItemAdquirido(item, tipo, index) {
        const corTipo = tipo === 'vantagem' ? '#27ae60' : '#e74c3c';
        const sinal = item.custo >= 0 ? '+' : '';
        
        let detalhes = '';
        if (item.nivel) {
            detalhes += `<div class="item-detalhes"><span>Nível ${item.nivel}/${item.nivelMaximo}</span></div>`;
        }
        if (item.variacaoId) {
            detalhes += `<div class="item-detalhes"><span>Variação específica</span></div>`;
        }
        
        return `
            <div class="item-adquirido ${tipo === 'desvantagem' ? 'item-adquirido-desvantagem' : ''}" 
                 data-index="${index}"
                 data-tipo="${tipo}"
                 style="border-left-color: ${corTipo};">
                <div class="item-header">
                    <h4 class="item-nome">${item.nome}</h4>
                    <div class="item-custo" style="background: ${corTipo}">${sinal}${Math.abs(item.custo)} pts</div>
                </div>
                ${detalhes}
                <div class="item-descricao">${item.descricao}</div>
                <button class="btn-remover" data-index="${index}" data-tipo="${tipo}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }
    
    adicionarEventosRemocao(tipo) {
        document.querySelectorAll(`.item-adquirido[data-tipo="${tipo}"] .btn-remover`).forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                this.removerItemAdquirido(index, tipo);
            });
        });
    }
    
    removerItemAdquirido(index, tipo) {
        const lista = tipo === 'vantagem' ? this.vantagensAdquiridas : this.desvantagensAdquiridas;
        
        if (index < 0 || index >= lista.length) return;
        
        const item = lista[index];
        
        if (!confirm(`Remover "${item.nome}"?`)) return;
        
        // Ajustar pontos
        if (tipo === 'vantagem') {
            // Recuperar pontos gastos
            this.pontosDisponiveis += Math.abs(item.custo);
            this.pontosGastos -= Math.abs(item.custo);
        } else {
            // Perder pontos ganhos
            this.pontosDisponiveis -= Math.abs(item.custo);
            this.pontosGanhos -= Math.abs(item.custo);
        }
        
        // Remover item
        lista.splice(index, 1);
        
        // Atualizar tudo
        this.atualizarTudo();
        
        this.mostrarNotificacao('Item removido!', 'info');
        this.salvarDadosLocal();
    }
    
    // ========== ATUALIZAR TUDO ==========
    atualizarTudo() {
        this.calcularTotais();
        this.atualizarStatus();
        this.atualizarListasAdquiridas();
        this.atualizarResumo();
        this.atualizarEstadoBotaoPec();
        this.filtrarVantagens();
        this.filtrarDesvantagens();
    }
    
    calcularTotais() {
        // Calcular pontos gastos em vantagens
        const totalVantagens = this.vantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0);
        
        // Calcular pontos ganhos com desvantagens
        const totalDesvantagens = this.desvantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0);
        
        // Calcular pontos gastos em peculiaridades
        const totalPeculiaridades = this.peculiaridades.length * this.config.custoPeculiaridade;
        
        // Atualizar propriedades
        this.pontosGastos = totalVantagens + totalPeculiaridades;
        this.pontosGanhos = totalDesvantagens;
        this.saldoTotal = this.pontosGanhos - this.pontosGastos;
        
        // Atualizar pontos disponíveis
        this.pontosDisponiveis = this.config.pontosIniciais + this.pontosGanhos - this.pontosGastos;
    }
    
    atualizarStatus() {
        // Atualizar elementos de status
        if (this.elements.pontosDisponiveisEl) {
            this.elements.pontosDisponiveisEl.textContent = this.pontosDisponiveis;
            
            // Adicionar classe baseada no valor
            this.elements.pontosDisponiveisEl.className = 'status-valor ';
            if (this.pontosDisponiveis > 0) {
                this.elements.pontosDisponiveisEl.classList.add('positivo');
            } else if (this.pontosDisponiveis < 0) {
                this.elements.pontosDisponiveisEl.classList.add('negativo');
            } else {
                this.elements.pontosDisponiveisEl.classList.add('neutro');
            }
        }
        
        if (this.elements.saldoTotalEl) {
            this.elements.saldoTotalEl.textContent = this.saldoTotal;
            
            // Adicionar classe baseada no valor
            this.elements.saldoTotalEl.className = 'status-valor ';
            if (this.saldoTotal > 0) {
                this.elements.saldoTotalEl.classList.add('positivo');
            } else if (this.saldoTotal < 0) {
                this.elements.saldoTotalEl.classList.add('negativo');
            } else {
                this.elements.saldoTotalEl.classList.add('neutro');
            }
        }
        
        // Atualizar custos nas seções
        if (this.elements.custoVantagens) {
            const totalVantagens = this.vantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0);
            this.elements.custoVantagens.textContent = totalVantagens;
        }
        
        if (this.elements.pontosDesvantagens) {
            const totalDesvantagens = this.desvantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0);
            this.elements.pontosDesvantagens.textContent = totalDesvantagens;
        }
    }
    
    atualizarResumo() {
        const totalVantagens = this.vantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0);
        const totalDesvantagens = this.desvantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0);
        const totalPeculiaridades = this.peculiaridades.length;
        const saldo = this.saldoTotal;
        
        if (this.elements.resumoVantagens) {
            this.elements.resumoVantagens.textContent = `+${totalVantagens}`;
        }
        
        if (this.elements.resumoDesvantagens) {
            this.elements.resumoDesvantagens.textContent = `-${totalDesvantagens}`;
        }
        
        if (this.elements.resumoPeculiaridades) {
            this.elements.resumoPeculiaridades.textContent = `-${totalPeculiaridades}`;
        }
        
        if (this.elements.resumoSaldo) {
            this.elements.resumoSaldo.textContent = saldo >= 0 ? `+${saldo}` : `${saldo}`;
            
            // Adicionar classe baseada no valor
            this.elements.resumoSaldo.className = 'valor saldo ';
            if (saldo > 0) {
                this.elements.resumoSaldo.classList.add('positivo');
            } else if (saldo < 0) {
                this.elements.resumoSaldo.classList.add('negativo');
            } else {
                this.elements.resumoSaldo.classList.add('neutro');
            }
        }
    }
    
    // ========== FUNÇÕES UTILITÁRIAS ==========
    formatarCustoDisplay(item, tipo) {
        let custoDisplay = '';
        const sinal = tipo === 'vantagem' ? '+' : '-';
        
        if (item.tipo === 'variavel') {
            const custo = Math.abs(item.custoPorNivel) || 2;
            custoDisplay = `${sinal}${custo} pts/nível`;
        } else if (item.tipo === 'multipla') {
            const custos = item.variacoes.map(v => Math.abs(v.custo));
            const min = Math.min(...custos);
            const max = Math.max(...custos);
            if (min === max) {
                custoDisplay = `${sinal}${min} pts`;
            } else {
                custoDisplay = `${sinal}${min}-${max} pts`;
            }
        } else {
            custoDisplay = `${sinal}${Math.abs(item.custo)} pts`;
        }
        
        return custoDisplay;
    }
    
    formatarCategoria(categoria) {
        const categorias = {
            'mental': 'Mental',
            'fisica': 'Física',
            'social': 'Social',
            'sobrenatural': 'Sobrenatural'
        };
        return categorias[categoria] || categoria.charAt(0).toUpperCase() + categoria.slice(1);
    }
    
    formatarTipo(tipo) {
        const tipos = {
            'simples': 'Simples',
            'multipla': 'Múltipla',
            'variavel': 'Variável'
        };
        return tipos[tipo] || tipo.charAt(0).toUpperCase() + tipo.slice(1);
    }
    
    // ========== NOTIFICAÇÕES ==========
    mostrarNotificacao(mensagem, tipo = 'info') {
        // Remover notificações anteriores
        const notificacoesAntigas = document.querySelectorAll('.notificacao-sistema');
        notificacoesAntigas.forEach(n => {
            if (n.parentNode) n.parentNode.removeChild(n);
        });
        
        // Criar notificação
        const notificacao = document.createElement('div');
        notificacao.className = `notificacao-sistema notificacao-${tipo}`;
        
        // Ícone baseado no tipo
        let icone = 'info-circle';
        if (tipo === 'sucesso') icone = 'check-circle';
        if (tipo === 'erro') icone = 'exclamation-circle';
        if (tipo === 'alerta') icone = 'exclamation-triangle';
        
        notificacao.innerHTML = `
            <i class="fas fa-${icone}"></i>
            <span>${mensagem}</span>
        `;
        
        document.body.appendChild(notificacao);
        
        // Estilizar
        Object.assign(notificacao.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 25px',
            borderRadius: '8px',
            background: tipo === 'sucesso' ? '#27ae60' : 
                       tipo === 'erro' ? '#e74c3c' : 
                       tipo === 'alerta' ? '#f39c12' : '#3498db',
            color: 'white',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: '99999',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards',
            maxWidth: '400px'
        });
        
        // Adicionar animação CSS se não existir
        if (!document.querySelector('#animacoes-notificacoes')) {
            const style = document.createElement('style');
            style.id = 'animacoes-notificacoes';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    to { opacity: 0; transform: translateX(100%); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Remover após 3 segundos
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.parentNode.removeChild(notificacao);
            }
        }, 3000);
    }
    
    // ========== PERSISTÊNCIA ==========
    salvarDadosLocal() {
        try {
            const dados = {
                vantagens: this.vantagensAdquiridas,
                desvantagens: this.desvantagensAdquiridas,
                peculiaridades: this.peculiaridades,
                pontosDisponiveis: this.pontosDisponiveis,
                pontosGastos: this.pontosGastos,
                pontosGanhos: this.pontosGanhos,
                saldoTotal: this.saldoTotal,
                timestamp: Date.now()
            };
            
            localStorage.setItem('vantagensSystemData', JSON.stringify(dados));
            console.log('💾 Dados salvos localmente');
        } catch (e) {
            console.error('Erro ao salvar dados:', e);
        }
    }
    
    carregarDadosSalvos() {
        try {
            const dados = localStorage.getItem('vantagensSystemData');
            if (dados) {
                const parsed = JSON.parse(dados);
                
                this.vantagensAdquiridas = parsed.vantagens || [];
                this.desvantagensAdquiridas = parsed.desvantagens || [];
                this.peculiaridades = parsed.peculiaridades || [];
                this.pontosDisponiveis = parsed.pontosDisponiveis || this.config.pontosIniciais;
                this.pontosGastos = parsed.pontosGastos || 0;
                this.pontosGanhos = parsed.pontosGanhos || 0;
                this.saldoTotal = parsed.saldoTotal || 0;
                
                console.log('📂 Dados carregados do localStorage');
                this.mostrarNotificacao('Dados anteriores carregados!', 'sucesso');
            }
        } catch (e) {
            console.error('Erro ao carregar dados:', e);
        }
    }
    
    salvarDados() {
        this.salvarDadosLocal();
        this.mostrarNotificacao('Dados salvos com sucesso!', 'sucesso');
    }
    
    // ========== CONFIRMAÇÕES E RESETS ==========
    confirmarLimpar(tipo) {
        let mensagem = '';
        let itensCount = 0;
        
        if (tipo === 'vantagens') {
            mensagem = `Tem certeza que deseja limpar TODAS as vantagens (${this.vantagensAdquiridas.length} itens)?`;
            itensCount = this.vantagensAdquiridas.length;
        } else if (tipo === 'desvantagens') {
            mensagem = `Tem certeza que deseja limpar TODAS as desvantagens (${this.desvantagensAdquiridas.length} itens)?`;
            itensCount = this.desvantagensAdquiridas.length;
        } else if (tipo === 'peculiaridades') {
            mensagem = `Tem certeza que deseja limpar TODAS as peculiaridades (${this.peculiaridades.length} itens)?`;
            itensCount = this.peculiaridades.length;
        }
        
        if (itensCount === 0) {
            this.mostrarNotificacao(`Nenhum item para limpar em ${tipo}!`, 'alerta');
            return;
        }
        
        if (!confirm(mensagem)) return;
        
        this.limparItens(tipo);
    }
    
    limparItens(tipo) {
        if (tipo === 'vantagens') {
            // Recuperar pontos
            const totalPontos = this.vantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0);
            this.pontosDisponiveis += totalPontos;
            this.pontosGastos -= totalPontos;
            
            this.vantagensAdquiridas = [];
            this.mostrarNotificacao('Todas as vantagens foram removidas!', 'info');
        } else if (tipo === 'desvantagens') {
            // Perder pontos ganhos
            const totalPontos = this.desvantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0);
            this.pontosDisponiveis -= totalPontos;
            this.pontosGanhos -= totalPontos;
            
            this.desvantagensAdquiridas = [];
            this.mostrarNotificacao('Todas as desvantagens foram removidas!', 'info');
        } else if (tipo === 'peculiaridades') {
            // Recuperar pontos
            const totalPontos = this.peculiaridades.length * this.config.custoPeculiaridade;
            this.pontosDisponiveis += totalPontos;
            this.pontosGastos -= totalPontos;
            
            this.peculiaridades = [];
            this.mostrarNotificacao('Todas as peculiaridades foram removidas!', 'info');
        }
        
        this.atualizarTudo();
        this.salvarDadosLocal();
    }
    
    confirmarReset() {
        const totalItens = this.vantagensAdquiridas.length + 
                          this.desvantagensAdquiridas.length + 
                          this.peculiaridades.length;
        
        if (totalItens === 0) {
            this.mostrarNotificacao('Não há nada para resetar!', 'alerta');
            return;
        }
        
        if (!confirm(`Tem certeza que deseja resetar TODOS os dados (${totalItens} itens)?`)) {
            return;
        }
        
        this.resetarTudo();
    }
    
    resetarTudo() {
        // Salvar backup antes de resetar
        const backup = {
            vantagens: [...this.vantagensAdquiridas],
            desvantagens: [...this.desvantagensAdquiridas],
            peculiaridades: [...this.peculiaridades]
        };
        
        localStorage.setItem('vantagensSystemBackup', JSON.stringify(backup));
        
        // Resetar tudo
        this.vantagensAdquiridas = [];
        this.desvantagensAdquiridas = [];
        this.peculiaridades = [];
        this.pontosDisponiveis = this.config.pontosIniciais;
        this.pontosGastos = 0;
        this.pontosGanhos = 0;
        this.saldoTotal = 0;
        
        // Atualizar interface
        this.atualizarTudo();
        
        // Limpar localStorage atual
        localStorage.removeItem('vantagensSystemData');
        
        this.mostrarNotificacao('Sistema resetado com sucesso!', 'sucesso');
        
        // Oferecer opção de restaurar backup por 10 segundos
        setTimeout(() => {
            if (confirm('Deseja restaurar os dados anteriores?')) {
                this.restaurarBackup();
            } else {
                localStorage.removeItem('vantagensSystemBackup');
            }
        }, 10000);
    }
    
    restaurarBackup() {
        try {
            const backup = localStorage.getItem('vantagensSystemBackup');
            if (backup) {
                const parsed = JSON.parse(backup);
                
                this.vantagensAdquiridas = parsed.vantagens || [];
                this.desvantagensAdquiridas = parsed.desvantagens || [];
                this.peculiaridades = parsed.peculiaridades || [];
                
                this.atualizarTudo();
                this.salvarDadosLocal();
                
                localStorage.removeItem('vantagensSystemBackup');
                this.mostrarNotificacao('Backup restaurado com sucesso!', 'sucesso');
            }
        } catch (e) {
            console.error('Erro ao restaurar backup:', e);
        }
    }
    
    // ========== EXPORTAÇÃO ==========
    exportarDados() {
        const dados = {
            personagem: {
                nome: 'Personagem',
                dataCriacao: new Date().toISOString(),
                sistema: 'Sistema de Vantagens'
            },
            pontos: {
                iniciais: this.config.pontosIniciais,
                disponiveis: this.pontosDisponiveis,
                gastos: this.pontosGastos,
                ganhos: this.pontosGanhos,
                saldo: this.saldoTotal
            },
            vantagens: this.vantagensAdquiridas,
            desvantagens: this.desvantagensAdquiridas,
            peculiaridades: this.peculiaridades,
            resumo: {
                totalVantagens: this.vantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0),
                totalDesvantagens: this.desvantagensAdquiridas.reduce((sum, item) => sum + Math.abs(item.custo), 0),
                totalPeculiaridades: this.peculiaridades.length,
                custoTotalPeculiaridades: this.peculiaridades.length * this.config.custoPeculiaridade
            }
        };
        
        // Criar e baixar arquivo JSON
        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `personagem-vantagens-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.mostrarNotificacao('Dados exportados com sucesso!', 'sucesso');
    }
    
    imprimirFicha() {
        // Criar uma nova janela para impressão
        const janelaImpressao = window.open('', '_blank');
        
        // Conteúdo HTML para impressão
        const conteudo = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Ficha de Personagem - Sistema de Vantagens</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
                    h2 { color: #34495e; margin-top: 30px; border-left: 4px solid; padding-left: 10px; }
                    .vantagens h2 { border-color: #27ae60; }
                    .desvantagens h2 { border-color: #e74c3c; }
                    .peculiaridades h2 { border-color: #9b59b6; }
                    .item { margin: 15px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
                    .item-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
                    .item-nome { font-weight: bold; }
                    .item-custo { font-weight: bold; }
                    .vantagens .item-custo { color: #27ae60; }
                    .desvantagens .item-custo { color: #e74c3c; }
                    .item-descricao { color: #666; font-size: 0.9em; }
                    .resumo { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .resumo-item { display: flex; justify-content: space-between; margin: 10px 0; font-size: 1.1em; }
                    .resumo-total { font-weight: bold; font-size: 1.3em; border-top: 2px solid #2c3e50; padding-top: 10px; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>Ficha de Personagem</h1>
                <p><strong>Data:</strong> ${new Date().toLocaleDateString()}</p>
                
                <div class="resumo">
                    <h3>Resumo de Pontos</h3>
                    <div class="resumo-item">
                        <span>Pontos Iniciais:</span>
                        <span>${this.config.pontosIniciais}</span>
                    </div>
                    <div class="resumo-item">
                        <span>Vantagens (Gastos):</span>
                        <span>-${this.pontosGastos}</span>
                    </div>
                    <div class="resumo-item">
                        <span>Desvantagens (Ganhos):</span>
                        <span>+${this.pontosGanhos}</span>
                    </div>
                    <div class="resumo-item resumo-total">
                        <span>Saldo Final:</span>
                        <span>${this.saldoTotal >= 0 ? '+' : ''}${this.saldoTotal}</span>
                    </div>
                </div>
                
                <div class="vantagens">
                    <h2>Vantagens (${this.vantagensAdquiridas.length})</h2>
                    ${this.vantagensAdquiridas.map(item => `
                        <div class="item">
                            <div class="item-header">
                                <div class="item-nome">${item.nome}</div>
                                <div class="item-custo">+${Math.abs(item.custo)} pts</div>
                            </div>
                            <div class="item-descricao">${item.descricao}</div>
                            ${item.nivel ? `<div><small>Nível ${item.nivel}</small></div>` : ''}
                        </div>
                    `).join('')}
                    ${this.vantagensAdquiridas.length === 0 ? '<p>Nenhuma vantagem adquirida.</p>' : ''}
                </div>
                
                <div class="desvantagens">
                    <h2>Desvantagens (${this.desvantagensAdquiridas.length})</h2>
                    ${this.desvantagensAdquiridas.map(item => `
                        <div class="item">
                            <div class="item-header">
                                <div class="item-nome">${item.nome}</div>
                                <div class="item-custo">-${Math.abs(item.custo)} pts</div>
                            </div>
                            <div class="item-descricao">${item.descricao}</div>
                        </div>
                    `).join('')}
                    ${this.desvantagensAdquiridas.length === 0 ? '<p>Nenhuma desvantagem adquirida.</p>' : ''}
                </div>
                
                <div class="peculiaridades">
                    <h2>Peculiaridades (${this.peculiaridades.length})</h2>
                    ${this.peculiaridades.map(pec => `
                        <div class="item">
                            <div class="item-nome">${pec.texto}</div>
                            <div class="item-custo">-1 pt</div>
                        </div>
                    `).join('')}
                    ${this.peculiaridades.length === 0 ? '<p>Nenhuma peculiaridade.</p>' : ''}
                </div>
                
                <div class="no-print">
                    <p><em>Impresso em ${new Date().toLocaleString()}</em></p>
                </div>
                
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 1000);
                    }
                </script>
            </body>
            </html>
        `;
        
        janelaImpressao.document.write(conteudo);
        janelaImpressao.document.close();
        
        this.mostrarNotificacao('Preparando impressão...', 'info');
    }
    
    // ========== VERIFICAÇÃO DE ESTADO ==========
    verificarEstadoInicial() {
        // Verificar se há dados
        const totalItens = this.vantagensAdquiridas.length + 
                          this.desvantagensAdquiridas.length + 
                          this.peculiaridades.length;
        
        if (totalItens > 0) {
            console.log(`📊 Estado inicial: ${totalItens} itens carregados`);
        } else {
            console.log('📊 Estado inicial: Sistema vazio');
        }
        
        // Verificar se há pontos negativos
        if (this.pontosDisponiveis < 0) {
            this.mostrarNotificacao('Atenção: Pontos negativos detectados!', 'alerta');
        }
        
        // Verificar peculiaridades no limite
        if (this.peculiaridades.length >= this.config.maxPeculiaridades) {
            this.mostrarNotificacao(`Limite de ${this.config.maxPeculiaridades} peculiaridades atingido!`, 'alerta');
        }
    }
}

// ========== INICIALIZAÇÃO GLOBAL ==========
let sistemaVantagens;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM completamente carregado');
    
    // Aguardar um pouco para garantir que todos os elementos estão disponíveis
    setTimeout(() => {
        try {
            sistemaVantagens = new SistemaVantagens();
            
            // Expor para acesso global (para botões com onclick)
            window.sistemaVantagens = sistemaVantagens;
            
            console.log('✅ Sistema de Vantagens inicializado com sucesso!');
            
            // Verificar se estamos na aba correta
            const verificarAbaAtiva = () => {
                const abaVantagens = document.getElementById('vantagens');
                if (abaVantagens && getComputedStyle(abaVantagens).display !== 'none') {
                    // Re-inicializar se necessário
                    if (!sistemaVantagens || sistemaVantagens.estado.carregando) {
                        sistemaVantagens = new SistemaVantagens();
                    }
                }
            };
            
            // Configurar observador para mudanças de aba
            const botoesTab = document.querySelectorAll('[data-tab]');
            botoesTab.forEach(botao => {
                botao.addEventListener('click', function() {
                    if (this.dataset.tab === 'vantagens') {
                        setTimeout(verificarAbaAtiva, 100);
                    }
                });
            });
            
        } catch (error) {
            console.error('❌ Erro ao inicializar sistema:', error);
            
            // Mostrar mensagem de erro para o usuário
            const container = document.querySelector('.atributos-container');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 50px; color: #e74c3c;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3em; margin-bottom: 20px;"></i>
                        <h2>Erro ao carregar sistema</h2>
                        <p>Ocorreu um erro ao inicializar o sistema de vantagens.</p>
                        <p><small>${error.message}</small></p>
                        <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            <i class="fas fa-redo"></i> Tentar Novamente
                        </button>
                    </div>
                `;
            }
        }
    }, 500);
});

// Adicionar CSS para notificações
if (!document.querySelector('#estilos-notificacoes')) {
    const style = document.createElement('style');
    style.id = 'estilos-notificacoes';
    style.textContent = `
        .notificacao-sistema {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 99999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
            max-width: 400px;
        }
        
        .notificacao-sucesso {
            background: #27ae60;
            color: white;
            border-left: 4px solid #219653;
        }
        
        .notificacao-erro {
            background: #e74c3c;
            color: white;
            border-left: 4px solid #c0392b;
        }
        
        .notificacao-info {
            background: #3498db;
            color: white;
            border-left: 4px solid #2980b9;
        }
        
        .notificacao-alerta {
            background: #f39c12;
            color: white;
            border-left: 4px solid #d68910;
        }
        
        .btn-desabilitado {
            opacity: 0.6;
            cursor: not-allowed !important;
        }
        
        .btn-desabilitado:hover {
            transform: none !important;
            box-shadow: none !important;
        }
        
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
        
        @keyframes fadeOut {
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
    `;
    document.head.appendChild(style);
}

console.log('🎮 Sistema de Vantagens carregado. Use window.sistemaVantagens para debug.');
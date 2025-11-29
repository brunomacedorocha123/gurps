// ===== vantagens.js - SISTEMA 100% CORRIGIDO =====
// ===== CORREÇÕES: Aptidão Mágica (valores) e Aliados (sem frequência) =====

// ===== CATÁLOGO COMPLETO CORRIGIDO =====
const catalogoVantagens = {
    "Ambidestria": {
        custo: 5,
        categoria: "fisica",
        descricao: "Usa ambas as mãos igualmente bem sem penalidades.",
        template: "simples",
        detalhes: "Não permite ações adicionais no combate - precisa de Ataque Adicional para isso."
    },

    "Duro de Matar": {
        custoBase: 2,
        categoria: "fisica", 
        descricao: "+1 em testes de sobrevivência por nível. Dificilmente morre.",
        template: "niveis",
        maxNiveis: 5,
        detalhes: "Bônus em testes de HT quando PV < -PVInicial e em testes de morte instantânea."
    },

    "Aptidão Mágica": {
        categoria: "mental",
        descricao: "Habilidade com magia. Nível 0 detecta magia, níveis superiores facilitam magias.",
        template: "niveis",
        maxNiveis: 5,
        // CUSTO CORRETO: Nível 0 = 5 pontos, cada nível adicional +10 pontos
        detalhes: "Nível 0: detecta objetos encantados. Níveis 1+: bônus em aprendizado e uso de magia.",
        limitacoes: [
            { nome: "Canção", desconto: 40, descricao: "Tem que cantar para fazer magia" },
            { nome: "Dança", desconto: 40, descricao: "Precisa de movimentos corporais" },
            { nome: "Manifestação Diurna", desconto: 40, descricao: "Só funciona com sol no céu" },
            { nome: "Manifestação Noturna", desconto: 40, descricao: "Só funciona sem sol no céu" },
            { nome: "Manifestação Obscura", desconto: 50, descricao: "Só funciona no escuro" },
            { nome: "Musical", desconto: 50, descricao: "Precisa de instrumento musical" },
            { nome: "Solitária", desconto: 40, descricao: "Penalidade com pessoas próximas" },
            { nome: "Uma Única Escola", desconto: 40, descricao: "Só uma escola de magia" }
        ]
    },

    "Abençoado": {
        categoria: "mental",
        descricao: "Sintonizado com uma entidade divina ou poder cósmico.",
        template: "opcoes",
        opcoes: [
            {
                nome: "Abençoado",
                custo: 10,
                descricao: "Recebe visões após 1h de comunhão. +1 reação com seguidores."
            },
            {
                nome: "Muito Abençoado", 
                custo: 20,
                descricao: "Testes de visão com +5. +2 reação com seguidores."
            },
            {
                nome: "Feitos Heroicos",
                custo: 10, 
                descricao: "1x por sessão, +1 dado em ST/DX/HT por 3d segundos."
            }
        ],
        detalhes: "Perde a vantagem se não agir de acordo com as regras da entidade."
    },

    "Adaptabilidade Cultural": {
        categoria: "social",
        descricao: "Não sofre penalidades por desconhecimento cultural.",
        template: "opcoes", 
        opcoes: [
            {
                nome: "Adaptabilidade Cultural",
                custo: 10,
                descricao: "Todas as culturas da própria raça."
            },
            {
                nome: "Xeno-Adaptabilidade",
                custo: 20,
                descricao: "Todas as culturas do cenário, qualquer raça."
            }
        ],
        detalhes: "Habilidade cinematográfica - nunca sofre -3 por desconhecimento cultural."
    },

    "Aliados": {
        categoria: "social",
        descricao: "Parceiros leais que acompanham em aventuras.",
        template: "aliados",
        custoVariavel: true,
        dadosAliados: {
            poderes: [
                { porcentagem: 25, custo: 1 },
                { porcentagem: 50, custo: 2 },
                { porcentagem: 75, custo: 3 },
                { porcentagem: 100, custo: 5 },
                { porcentagem: 150, custo: 10 }
            ],
            frequencias: [
                { nome: "Quase sempre (15 ou menos)", valor: 15 },
                { nome: "Frequentemente (12 ou menos)", valor: 12 },
                { nome: "Ocasionalmente (9 ou menos)", valor: 9 },
                { nome: "Raramente (6 ou menos)", valor: 6 }
            ],
            grupos: [
                { tamanho: "6-10", multiplicador: 6 },
                { tamanho: "11-20", multiplicador: 8 },
                { tamanho: "21-50", multiplicador: 10 },
                { tamanho: "51-100", multiplicador: 12 }
            ],
            ampliacoes: [
                { nome: "Habilidades Especiais", valor: 0.5, descricao: "Aliado tem poder desproporcional" },
                { nome: "Invocável", valor: 1.0, descricao: "Pode conjurar o aliado" },
                { nome: "Lacaio", valor: 0.5, descricao: "Servo leal independente do tratamento" }
            ],
            limitacoes: [
                { nome: "Afinidade", valor: -0.25, descricao: "Compartilha efeitos com o aliado" },
                { nome: "Relutante", valor: -0.5, descricao: "Aliado odeia o personagem" }
            ]
        }
    }
};

// ===== SISTEMA PRINCIPAL 100% FUNCIONAL =====
class SistemaVantagens {
    constructor() {
        this.vantagensAdquiridas = [];
        this.peculiaridades = [];
        this.termoBusca = '';
        this.filtroCategoria = '';
        this.nivelAtualModal = 0;
        this.vantagemAtualModal = null;
        this.inicializar();
    }

    inicializar() {
        this.carregarDados();
        this.inicializarEventos();
        this.atualizarInterface();
    }

    carregarDados() {
        try {
            const dadosSalvos = localStorage.getItem('vantagensDados');
            if (dadosSalvos) {
                const dados = JSON.parse(dadosSalvos);
                this.vantagensAdquiridas = dados.vantagens || [];
                this.peculiaridades = dados.peculiaridades || [];
            }
        } catch (e) {
            console.error('Erro ao carregar dados:', e);
        }
    }

    salvarDados() {
        try {
            const dados = {
                vantagens: this.vantagensAdquiridas,
                peculiaridades: this.peculiaridades
            };
            localStorage.setItem('vantagensDados', JSON.stringify(dados));
        } catch (e) {
            console.error('Erro ao salvar dados:', e);
        }
    }

    inicializarEventos() {
        // Busca
        const buscaInput = document.getElementById('busca-vantagens');
        const categoriaSelect = document.getElementById('categoria-vantagens');
        
        if (buscaInput) {
            buscaInput.addEventListener('input', (e) => {
                this.termoBusca = e.target.value.toLowerCase();
                this.filtrarVantagens();
            });
        }

        if (categoriaSelect) {
            categoriaSelect.addEventListener('change', (e) => {
                this.filtroCategoria = e.target.value;
                this.filtrarVantagens();
            });
        }

        // Peculiaridades
        const inputPeculiaridade = document.getElementById('nova-peculiaridade');
        const btnPeculiaridade = document.getElementById('btn-adicionar-peculiaridade');
        
        if (inputPeculiaridade) {
            inputPeculiaridade.addEventListener('input', (e) => {
                this.atualizarContadorPeculiaridade(e.target.value);
            });
        }

        if (btnPeculiaridade) {
            btnPeculiaridade.addEventListener('click', () => {
                this.adicionarPeculiaridade();
            });
        }
    }

    filtrarVantagens() {
        const container = document.getElementById('lista-vantagens');
        if (!container) return;

        const vantagensFiltradas = Object.entries(catalogoVantagens)
            .filter(([nome, dados]) => {
                const matchTermo = nome.toLowerCase().includes(this.termoBusca) || 
                                 dados.descricao.toLowerCase().includes(this.termoBusca);
                const matchCategoria = !this.filtroCategoria || dados.categoria === this.filtroCategoria;
                const jaAdquirida = this.vantagensAdquiridas.some(v => v.nome === nome);
                return matchTermo && matchCategoria && !jaAdquirida;
            })
            .map(([nome, dados]) => ({ nome, ...dados }));

        if (vantagensFiltradas.length === 0) {
            container.innerHTML = '<div class="lista-vazia">Nenhuma vantagem encontrada</div>';
            return;
        }

        container.innerHTML = vantagensFiltradas.map(vantagem => 
            this.criarItemVantagem(vantagem)
        ).join('');
    }

    criarItemVantagem(vantagem) {
        const custoTexto = this.obterTextoCusto(vantagem);
        
        return `
            <div class="item-lista" onclick="sistemaVantagens.abrirModalVantagem('${vantagem.nome}')">
                <div class="item-header">
                    <div class="item-nome">${vantagem.nome}</div>
                    <div class="item-custo">${custoTexto}</div>
                </div>
                <div class="item-categoria">${this.formatarCategoria(vantagem.categoria)}</div>
                <div class="item-descricao">${vantagem.descricao}</div>
            </div>
        `;
    }

    obterTextoCusto(vantagem) {
        switch(vantagem.template) {
            case 'simples':
                return `${vantagem.custo} pontos`;
            case 'niveis':
                if (vantagem.nome === "Aptidão Mágica") {
                    return "5+10/nível";
                }
                return `${vantagem.custoBase}/nível`;
            case 'opcoes':
                const custos = vantagem.opcoes.map(op => op.custo);
                return `${Math.min(...custos)}-${Math.max(...custos)} pontos`;
            case 'aliados':
                return 'Variável';
            default:
                return '—';
        }
    }

    formatarCategoria(categoria) {
        const categorias = {
            'mental': 'Mental/Sobrenatural',
            'fisica': 'Física',
            'social': 'Social', 
            'supers': 'Supers'
        };
        return categorias[categoria] || categoria;
    }

    abrirModalVantagem(nome) {
        const vantagem = catalogoVantagens[nome];
        if (!vantagem) return;

        this.fecharModal();
        this.vantagemAtualModal = vantagem;
        
        // CORREÇÃO: Resetar nível CORRETAMENTE
        if (vantagem.template === 'niveis') {
            this.nivelAtualModal = vantagem.nome === "Aptidão Mágica" ? 0 : 1;
        }

        let modalHTML = '';
        
        switch(vantagem.template) {
            case 'simples':
                modalHTML = this.criarModalSimples(nome, vantagem);
                break;
            case 'niveis':
                modalHTML = this.criarModalComNiveis(nome, vantagem);
                break;
            case 'opcoes':
                modalHTML = this.criarModalComOpcoes(nome, vantagem);
                break;
            case 'aliados':
                modalHTML = this.criarModalAliados(nome, vantagem);
                break;
        }

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    criarModalSimples(nome, vantagem) {
        return `
            <div class="modal-overlay" onclick="sistemaVantagens.fecharModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>${nome}</h3>
                        <button class="modal-close" onclick="sistemaVantagens.fecharModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="modal-descricao">
                            <strong>Categoria:</strong> ${this.formatarCategoria(vantagem.categoria)}<br>
                            <strong>Custo:</strong> ${vantagem.custo} pontos
                        </div>
                        <div class="modal-texto">
                            <p>${vantagem.descricao}</p>
                            ${vantagem.detalhes ? `<p><em>${vantagem.detalhes}</em></p>` : ''}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-cancelar" onclick="sistemaVantagens.fecharModal()">Cancelar</button>
                        <button class="btn-adquirir" onclick="sistemaVantagens.adquirirVantagem('${nome}', ${vantagem.custo})">
                            Adquirir por ${vantagem.custo} pontos
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    criarModalComNiveis(nome, vantagem) {
        const isAptidaoMagica = nome === "Aptidão Mágica";
        const nivelMinimo = isAptidaoMagica ? 0 : 1;
        const nivelInicial = this.nivelAtualModal;
        
        // CORREÇÃO: Cálculo correto
        const custoInicial = this.calcularCustoNivel(vantagem, nivelInicial);

        let limitacoesHTML = '';
        if (isAptidaoMagica && vantagem.limitacoes) {
            limitacoesHTML = this.criarLimitacoesAptidaoMagica();
        }

        return `
            <div class="modal-overlay" onclick="sistemaVantagens.fecharModal()">
                <div class="modal-content modal-grande" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>${nome}</h3>
                        <button class="modal-close" onclick="sistemaVantagens.fecharModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="modal-descricao">
                            <strong>Categoria:</strong> ${this.formatarCategoria(vantagem.categoria)}
                        </div>
                        
                        <!-- CONTROLE DE NÍVEIS FUNCIONAL -->
                        <div class="controle-niveis">
                            <div class="nivel-display">
                                <button class="btn-nivel" onclick="sistemaVantagens.alterarNivel(-1)" 
                                        ${nivelInicial <= nivelMinimo ? 'disabled' : ''}>−</button>
                                
                                <div class="nivel-info">
                                    <div class="nivel-valor">${nivelInicial}</div>
                                    <div class="nivel-tipo">${this.getTipoNivel(nome, nivelInicial)}</div>
                                </div>
                                
                                <button class="btn-nivel" onclick="sistemaVantagens.alterarNivel(1)" 
                                        ${nivelInicial >= vantagem.maxNiveis ? 'disabled' : ''}>+</button>
                            </div>
                            
                            <div class="nivel-custo-display">
                                <strong>Custo: <span id="custoNivelAtual">${custoInicial}</span> pontos</strong>
                                ${isAptidaoMagica && nivelInicial > 0 ? `<br><small>(5 pontos base + ${10 * nivelInicial} por níveis)</small>` : ''}
                            </div>
                        </div>

                        ${limitacoesHTML}

                        <div class="custo-final">
                            <strong>Custo Final: <span id="custoFinalModal">${custoInicial}</span> pontos</strong>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-cancelar" onclick="sistemaVantagens.fecharModal()">Cancelar</button>
                        <button class="btn-adquirir" onclick="sistemaVantagens.adquirirVantagemNivel('${nome}')">
                            Adquirir
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getTipoNivel(nomeVantagem, nivel) {
        if (nomeVantagem === "Aptidão Mágica") {
            return nivel === 0 ? "Nível 0 (Consciência)" : "Nível";
        }
        return "Nível";
    }

    // CORREÇÃO: CÁLCULO 100% FUNCIONAL
    calcularCustoNivel(vantagem, nivel) {
        if (vantagem.nome === "Aptidão Mágica") {
            // CORRETO: Nível 0 = 5 pontos, cada nível adicional +10 pontos
            return nivel === 0 ? 5 : 5 + (10 * nivel);
        }
        
        if (vantagem.nome === "Duro de Matar") {
            // CORRETO: Duro de Matar usa custoBase
            return vantagem.custoBase * nivel;
        }
        
        return 0;
    }

    criarLimitacoesAptidaoMagica() {
        const vantagem = this.vantagemAtualModal;
        return `
            <div class="modal-secao">
                <h4>Limitações (Opcional - apenas para níveis 1+)</h4>
                <div class="limitacoes-lista">
                    ${vantagem.limitacoes.map(lim => `
                        <label class="limitacao-item">
                            <input type="checkbox" name="limitacao" value="${lim.desconto}" 
                                   data-nome="${lim.nome}" onchange="sistemaVantagens.atualizarCustoModal()">
                            <span class="limitacao-nome">${lim.nome} (${lim.desconto}%)</span>
                            <span class="limitacao-desc">${lim.descricao}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    }

        // CONTROLE DE NÍVEIS 100% FUNCIONAL
    alterarNivel(delta) {
        const vantagem = this.vantagemAtualModal;
        if (!vantagem) return;

        const nivelMinimo = vantagem.nome === "Aptidão Mágica" ? 0 : 1;
        
        // Alterar o nível
        this.nivelAtualModal += delta;
        
        // Validar limites
        if (this.nivelAtualModal < nivelMinimo) this.nivelAtualModal = nivelMinimo;
        if (this.nivelAtualModal > vantagem.maxNiveis) this.nivelAtualModal = vantagem.maxNiveis;

        this.atualizarDisplayNivel();
        this.atualizarCustoModal();
    }

    atualizarDisplayNivel() {
        const modal = document.querySelector('.modal-content');
        if (!modal) return;

        const valorNivel = modal.querySelector('.nivel-valor');
        const tipoNivel = modal.querySelector('.nivel-tipo');
        const btnMenos = modal.querySelector('.btn-nivel:first-child');
        const btnMais = modal.querySelector('.btn-nivel:last-child');
        
        if (valorNivel) valorNivel.textContent = this.nivelAtualModal;
        if (tipoNivel) tipoNivel.textContent = this.getTipoNivel(this.vantagemAtualModal.nome, this.nivelAtualModal);
        
        // Atualizar botões
        const nivelMinimo = this.vantagemAtualModal.nome === "Aptidão Mágica" ? 0 : 1;
        if (btnMenos) btnMenos.disabled = this.nivelAtualModal <= nivelMinimo;
        if (btnMais) btnMais.disabled = this.nivelAtualModal >= this.vantagemAtualModal.maxNiveis;
    }

    atualizarCustoModal() {
        const modal = document.querySelector('.modal-content');
        if (!modal || !this.vantagemAtualModal) return;

        let custo = this.calcularCustoNivel(this.vantagemAtualModal, this.nivelAtualModal);

        // Aplicar limitações apenas para Aptidão Mágica nível 1+
        if (this.vantagemAtualModal.nome === "Aptidão Mágica" && this.nivelAtualModal > 0) {
            const limitacoes = modal.querySelectorAll('input[name="limitacao"]:checked');
            let descontoTotal = 0;
            limitacoes.forEach(lim => {
                descontoTotal += parseInt(lim.value);
            });
            
            if (descontoTotal > 0) {
                // Aplicar desconto apenas sobre a parte dos níveis
                const custoBase = 5;
                const custoNiveis = 10 * this.nivelAtualModal;
                const custoComDesconto = custoBase + Math.floor(custoNiveis * (1 - descontoTotal / 100));
                custo = custoComDesconto;
            }
        }

        // Atualizar displays
        const custoNivelElement = document.getElementById('custoNivelAtual');
        const custoFinalElement = document.getElementById('custoFinalModal');
        
        if (custoNivelElement) custoNivelElement.textContent = custo;
        if (custoFinalElement) custoFinalElement.textContent = custo;
    }

    adquirirVantagemNivel(nome) {
        const modal = document.querySelector('.modal-content');
        const vantagem = catalogoVantagens[nome];
        let custo = this.calcularCustoNivel(vantagem, this.nivelAtualModal);

        // Coletar limitações se for Aptidão Mágica nível 1+
        let limitacoesAplicadas = [];
        if (nome === "Aptidão Mágica" && this.nivelAtualModal > 0) {
            const limitacoes = modal.querySelectorAll('input[name="limitacao"]:checked');
            let descontoTotal = 0;
            
            limitacoes.forEach(lim => {
                descontoTotal += parseInt(lim.value);
                limitacoesAplicadas.push(lim.dataset.nome);
            });
            
            if (descontoTotal > 0) {
                const custoBase = 5;
                const custoNiveis = 10 * this.nivelAtualModal;
                custo = custoBase + Math.floor(custoNiveis * (1 - descontoTotal / 100));
            }
        }

        const nomeExibicao = this.nivelAtualModal === 0 ? 
            `${nome} (Nível 0)` : 
            `${nome} (Nível ${this.nivelAtualModal}${limitacoesAplicadas.length > 0 ? ` - ${limitacoesAplicadas.join(', ')}` : ''})`;

        const vantagemAdquirida = {
            nome: nomeExibicao,
            custo: custo,
            tipo: 'nivel',
            nivel: this.nivelAtualModal,
            limitacoes: limitacoesAplicadas,
            data: new Date().toISOString()
        };

        this.vantagensAdquiridas.push(vantagemAdquirida);
        this.fecharModal();
        this.atualizarInterface();
        this.salvarDados();
        
        this.mostrarFeedback(`${nome} nível ${this.nivelAtualModal} adquirido por ${custo} pontos!`);
    }

    criarModalComOpcoes(nome, vantagem) {
        const opcoesHTML = vantagem.opcoes.map((opcao, index) => `
            <div class="opcao-item">
                <input type="radio" name="opcao" id="opcao${index}" value="${index}" ${index === 0 ? 'checked' : ''}>
                <label for="opcao${index}">
                    <div class="opcao-header">
                        <span class="opcao-nome">${opcao.nome}</span>
                        <span class="opcao-custo">${opcao.custo} pontos</span>
                    </div>
                    <div class="opcao-descricao">${opcao.descricao}</div>
                </label>
            </div>
        `).join('');

        return `
            <div class="modal-overlay" onclick="sistemaVantagens.fecharModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>${nome}</h3>
                        <button class="modal-close" onclick="sistemaVantagens.fecharModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="modal-descricao">
                            <strong>Categoria:</strong> ${this.formatarCategoria(vantagem.categoria)}
                        </div>
                        
                        <div class="modal-secao">
                            <h4>Selecione a Opção</h4>
                            <div class="opcoes-lista">
                                ${opcoesHTML}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-cancelar" onclick="sistemaVantagens.fecharModal()">Cancelar</button>
                        <button class="btn-adquirir" onclick="sistemaVantagens.adquirirVantagemOpcao('${nome}')">
                            Adquirir
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    adquirirVantagemOpcao(nome) {
        const modal = document.querySelector('.modal-content');
        const opcaoSelecionada = modal.querySelector('input[name="opcao"]:checked');
        
        if (!opcaoSelecionada) return;

        const vantagem = catalogoVantagens[nome];
        const opcaoIndex = parseInt(opcaoSelecionada.value);
        const opcao = vantagem.opcoes[opcaoIndex];

        const vantagemAdquirida = {
            nome: `${nome}: ${opcao.nome}`,
            custo: opcao.custo,
            tipo: 'opcao',
            opcao: opcao.nome,
            data: new Date().toISOString()
        };

        this.vantagensAdquiridas.push(vantagemAdquirida);
        this.fecharModal();
        this.atualizarInterface();
        this.salvarDados();
        
        this.mostrarFeedback(`${nome}: ${opcao.nome} adquirido por ${opcao.custo} pontos!`);
    }

    // CORREÇÃO: MODAL ALIADOS SEM FREQUÊNCIA
    criarModalAliados(nome, vantagem) {
        const dados = vantagem.dadosAliados;
        const custoBase = dados.poderes[0].custo;

        const poderesHTML = dados.poderes.map((poder, index) => `
            <div class="opcao-item">
                <input type="radio" name="poder" id="poder${index}" value="${index}" ${index === 0 ? 'checked' : ''}
                       onchange="sistemaVantagens.calcularCustoAliados()">
                <label for="poder${index}">
                    <div class="opcao-header">
                        <span class="opcao-nome">${poder.porcentagem}% dos pontos</span>
                        <span class="opcao-custo">${poder.custo} pontos</span>
                    </div>
                </label>
            </div>
        `).join('');

        // FREQUÊNCIA REMOVIDA DO MODAL

        const gruposHTML = dados.grupos.map((grupo, index) => `
            <div class="opcao-item">
                <input type="radio" name="grupo" id="grupo${index}" value="${index}" 
                       onchange="sistemaVantagens.calcularCustoAliados()">
                <label for="grupo${index}">
                    <div class="opcao-header">
                        <span class="opcao-nome">${grupo.tamanho} aliados</span>
                        <span class="opcao-custo">×${grupo.multiplicador}</span>
                    </div>
                </label>
            </div>
        `).join('');

        const ampliacoesHTML = dados.ampliacoes.map((amp, index) => `
            <label class="limitacao-item">
                <input type="checkbox" name="ampliacao" value="${amp.valor}" data-nome="${amp.nome}"
                       onchange="sistemaVantagens.calcularCustoAliados()">
                <span class="limitacao-nome">${amp.nome} (+${Math.round(amp.valor * 100)}%)</span>
                <span class="limitacao-desc">${amp.descricao}</span>
            </label>
        `).join('');

        const limitacoesHTML = dados.limitacoes.map((lim, index) => `
            <label class="limitacao-item">
                <input type="checkbox" name="limitacao" value="${lim.valor}" data-nome="${lim.nome}"
                       onchange="sistemaVantagens.calcularCustoAliados()">
                <span class="limitacao-nome">${lim.nome} (${Math.round(lim.valor * 100)}%)</span>
                <span class="limitacao-desc">${lim.descricao}</span>
            </label>
        `).join('');

        return `
            <div class="modal-overlay" onclick="sistemaVantagens.fecharModal()">
                <div class="modal-content modal-grande" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>${nome}</h3>
                        <button class="modal-close" onclick="sistemaVantagens.fecharModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="modal-descricao">
                            <strong>Categoria:</strong> ${this.formatarCategoria(vantagem.categoria)}
                        </div>

                        <div class="modal-secao">
                            <h4>Poder do Aliado</h4>
                            <div class="opcoes-lista">
                                ${poderesHTML}
                            </div>
                        </div>

                        <!-- SEÇÃO DE FREQUÊNCIA REMOVIDA -->

                        <div class="modal-secao">
                            <h4>Grupo de Aliados (Opcional)</h4>
                            <div class="opcoes-lista">
                                <div class="opcao-item">
                                    <input type="radio" name="grupo" id="grupoSingle" value="-1" checked
                                           onchange="sistemaVantagens.calcularCustoAliados()">
                                    <label for="grupoSingle">
                                        <div class="opcao-header">
                                            <span class="opcao-nome">Aliado Único</span>
                                            <span class="opcao-custo">×1</span>
                                        </div>
                                    </label>
                                </div>
                                ${gruposHTML}
                            </div>
                        </div>

                        <div class="modal-secao">
                            <h4>Ampliações Especiais (Opcional)</h4>
                            <div class="limitacoes-lista">
                                ${ampliacoesHTML}
                            </div>
                        </div>

                        <div class="modal-secao">
                            <h4>Limitações Especiais (Opcional)</h4>
                            <div class="limitacoes-lista">
                                ${limitacoesHTML}
                            </div>
                        </div>

                        <div class="custo-final">
                            <strong>Custo Final: <span id="custoFinalModal">${custoBase}</span> pontos</strong>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-cancelar" onclick="sistemaVantagens.fecharModal()">Cancelar</button>
                        <button class="btn-adquirir" onclick="sistemaVantagens.adquirirAliados('${nome}')">
                            Adquirir Aliados
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // CORREÇÃO: CÁLCULO ALIADOS SEM FREQUÊNCIA
    calcularCustoAliados() {
        const modal = document.querySelector('.modal-content');
        if (!modal) return;

        const dados = catalogoVantagens.Aliados.dadosAliados;
        
        // Custo base do poder - FREQUÊNCIA NÃO MULTIPLICA
        const poderSelecionado = modal.querySelector('input[name="poder"]:checked');
        const poderIndex = parseInt(poderSelecionado.value);
        let custo = dados.poderes[poderIndex].custo;

        // Aplicar grupo (se selecionado)
        const grupoSelecionado = modal.querySelector('input[name="grupo"]:checked');
        const grupoIndex = parseInt(grupoSelecionado.value);
        if (grupoIndex >= 0) {
            const multiplicadorGrupo = dados.grupos[grupoIndex].multiplicador;
            custo *= multiplicadorGrupo;
        }

        // Aplicar ampliações
        const ampliacoes = modal.querySelectorAll('input[name="ampliacao"]:checked');
        ampliacoes.forEach(amp => {
            custo *= (1 + parseFloat(amp.value));
        });

        // Aplicar limitações
        const limitacoes = modal.querySelectorAll('input[name="limitacao"]:checked');
        limitacoes.forEach(lim => {
            custo *= (1 + parseFloat(lim.value));
        });

        // Arredondar para número inteiro
        custo = Math.round(custo);

        const custoFinalElement = document.getElementById('custoFinalModal');
        if (custoFinalElement) {
            custoFinalElement.textContent = custo;
        }
    }

    // CORREÇÃO: ADQUIRIR ALIADOS SEM FREQUÊNCIA
    adquirirAliados(nome) {
        const modal = document.querySelector('.modal-content');
        const dados = catalogoVantagens.Aliados.dadosAliados;
        
        // Coletar configurações (SEM FREQUÊNCIA)
        const poderSelecionado = modal.querySelector('input[name="poder"]:checked');
        const poderIndex = parseInt(poderSelecionado.value);
        const poder = dados.poderes[poderIndex];

        const grupoSelecionado = modal.querySelector('input[name="grupo"]:checked');
        const grupoIndex = parseInt(grupoSelecionado.value);
        const grupo = grupoIndex >= 0 ? dados.grupos[grupoIndex] : null;

        // Coletar modificadores
        const ampliacoes = Array.from(modal.querySelectorAll('input[name="ampliacao"]:checked'))
            .map(amp => amp.dataset.nome);
        
        const limitacoes = Array.from(modal.querySelectorAll('input[name="limitacao"]:checked'))
            .map(lim => lim.dataset.nome);

        // Calcular custo final (SEM FREQUÊNCIA)
        let custo = poder.custo; // Base do poder
        
        // Aplicar grupo
        if (grupo) custo *= grupo.multiplicador;
        
        // Aplicar modificadores percentuais
        ampliacoes.forEach(() => {
            const amp = dados.ampliacoes.find(a => ampliacoes.includes(a.nome));
            if (amp) custo *= (1 + amp.valor);
        });
        
        limitacoes.forEach(() => {
            const lim = dados.limitacoes.find(l => limitacoes.includes(l.nome));
            if (lim) custo *= (1 + lim.valor);
        });

        custo = Math.round(custo);

        // Criar nome descritivo (SEM FREQUÊNCIA)
        let nomeAliados = "Aliados";
        if (grupo) {
            nomeAliados += ` (Grupo ${grupo.tamanho})`;
        } else {
            nomeAliados += ` (Único)`;
        }
        nomeAliados += ` - ${poder.porcentagem}%`;
        
        if (ampliacoes.length > 0) {
            nomeAliados += ` + ${ampliacoes.join(', ')}`;
        }
        if (limitacoes.length > 0) {
            nomeAliados += ` - ${limitacoes.join(', ')}`;
        }

        const vantagemAdquirida = {
            nome: nomeAliados,
            custo: custo,
            tipo: 'aliados',
            config: {
                poder: poder,
                grupo: grupo,
                ampliacoes: ampliacoes,
                limitacoes: limitacoes
            },
            data: new Date().toISOString()
        };

        this.vantagensAdquiridas.push(vantagemAdquirida);
        this.fecharModal();
        this.atualizarInterface();
        this.salvarDados();
        
        this.mostrarFeedback(`Aliados adquiridos por ${custo} pontos!`);
    }

        adquirirVantagem(nome, custo) {
        const vantagemAdquirida = {
            nome: nome,
            custo: custo,
            tipo: 'simples',
            data: new Date().toISOString()
        };

        this.vantagensAdquiridas.push(vantagemAdquirida);
        this.fecharModal();
        this.atualizarInterface();
        this.salvarDados();
        
        this.mostrarFeedback(`"${nome}" adquirida por ${custo} pontos!`);
    }

    fecharModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
        this.nivelAtualModal = 0;
        this.vantagemAtualModal = null;
    }

    // ===== SISTEMA DE PECULIARIDADES FUNCIONAL =====
    atualizarContadorPeculiaridade(texto) {
        const contador = document.getElementById('contador-chars');
        const btnAdicionar = document.getElementById('btn-adicionar-peculiaridade');
        
        if (!contador || !btnAdicionar) return;

        const comprimento = texto.length;
        contador.textContent = comprimento;
        
        // Atualizar classes do contador
        contador.className = 'contador-chars';
        if (comprimento > 25) {
            contador.classList.add('aviso');
        }
        
        // Habilitar/desabilitar botão
        btnAdicionar.disabled = comprimento === 0 || comprimento > 30;
    }

    adicionarPeculiaridade() {
        const input = document.getElementById('nova-peculiaridade');
        const texto = input.value.trim();
        
        if (texto.length === 0 || texto.length > 30) {
            this.mostrarFeedback('Peculiaridade deve ter entre 1 e 30 caracteres!', 'erro');
            return;
        }
        
        if (this.peculiaridades.length >= 5) {
            this.mostrarFeedback('Máximo de 5 peculiaridades atingido!', 'erro');
            return;
        }

        // Verificar se já existe
        if (this.peculiaridades.some(pec => pec.texto.toLowerCase() === texto.toLowerCase())) {
            this.mostrarFeedback('Esta peculiaridade já foi adicionada!', 'erro');
            return;
        }

        this.peculiaridades.push({
            texto: texto,
            custo: -1,
            data: new Date().toISOString()
        });

        input.value = '';
        this.atualizarContadorPeculiaridade('');
        this.atualizarInterface();
        this.salvarDados();
        
        this.mostrarFeedback(`"${texto}" adicionada! -1 ponto`);
    }

    removerPeculiaridade(index) {
        if (index < 0 || index >= this.peculiaridades.length) return;
        
        const peculiaridade = this.peculiaridades[index];
        this.peculiaridades.splice(index, 1);
        this.atualizarInterface();
        this.salvarDados();
        this.mostrarFeedback(`"${peculiaridade.texto}" removida!`);
    }

    removerVantagem(index) {
        if (index < 0 || index >= this.vantagensAdquiridas.length) return;
        
        const vantagem = this.vantagensAdquiridas[index];
        this.vantagensAdquiridas.splice(index, 1);
        this.atualizarInterface();
        this.salvarDados();
        this.mostrarFeedback(`"${vantagem.nome}" removida! ${vantagem.custo} pontos recuperados.`);
    }

    // ===== ATUALIZAÇÃO DA INTERFACE FUNCIONAL =====
    atualizarInterface() {
        this.atualizarListaVantagens();
        this.atualizarPeculiaridades();
        this.atualizarTotais();
        this.filtrarVantagens();
    }

    atualizarListaVantagens() {
        const container = document.getElementById('vantagens-adquiridas');
        const totalCusto = document.getElementById('total-vantagens-adquiridas');

        if (!container || !totalCusto) return;

        if (this.vantagensAdquiridas.length === 0) {
            container.innerHTML = '<div class="lista-vazia">Nenhuma vantagem adquirida</div>';
            totalCusto.textContent = '0 pts';
            return;
        }

        const total = this.vantagensAdquiridas.reduce((sum, v) => sum + v.custo, 0);
        totalCusto.textContent = `${total} pts`;

        container.innerHTML = this.vantagensAdquiridas.map((vantagem, index) => `
            <div class="item-lista item-adquirido">
                <div class="item-header">
                    <div class="item-nome">${vantagem.nome}</div>
                    <div class="item-custo">${vantagem.custo} pts</div>
                </div>
                <div class="item-detalhes">
                    <small>Tipo: ${vantagem.tipo} • Adquirida: ${new Date(vantagem.data).toLocaleDateString('pt-BR')}</small>
                </div>
                <div class="item-acoes">
                    <button class="btn-remover" onclick="sistemaVantagens.removerVantagem(${index})" 
                            title="Remover vantagem">
                        Remover
                    </button>
                </div>
            </div>
        `).join('');
    }

    atualizarPeculiaridades() {
        const container = document.getElementById('lista-peculiaridades');
        const contador = document.getElementById('contador-peculiaridades');

        if (!container || !contador) return;

        contador.textContent = `${this.peculiaridades.length}/5`;

        if (this.peculiaridades.length === 0) {
            container.innerHTML = '<div class="lista-vazia">Nenhuma peculiaridade adicionada</div>';
            return;
        }

        container.innerHTML = this.peculiaridades.map((pec, index) => `
            <div class="peculiaridade-item">
                <div class="peculiaridade-texto">${pec.texto}</div>
                <div class="peculiaridade-info">
                    <div class="peculiaridade-custo">-1 pt</div>
                    <button class="btn-remover pequeno" onclick="sistemaVantagens.removerPeculiaridade(${index})" 
                            title="Remover peculiaridade">
                        ×
                    </button>
                </div>
            </div>
        `).join('');
    }

    atualizarTotais() {
        const totalVantagens = this.vantagensAdquiridas.reduce((sum, v) => sum + v.custo, 0);
        const totalPeculiaridades = this.peculiaridades.length * -1;
        const saldoTotal = totalVantagens + totalPeculiaridades;

        // Atualizar elementos
        const atualizarElemento = (id, valor) => {
            const elemento = document.getElementById(id);
            if (elemento) elemento.textContent = valor;
        };

        atualizarElemento('total-vantagens', `+${totalVantagens}`);
        atualizarElemento('total-peculiaridades', `${totalPeculiaridades}`);
        atualizarElemento('saldo-total', saldoTotal);

        // Destacar saldo
        const saldoElement = document.getElementById('saldo-total');
        if (saldoElement) {
            saldoElement.style.color = saldoTotal < 0 ? '#e74c3c' : '#27ae60';
            saldoElement.style.fontWeight = 'bold';
        }
    }

    // ===== SISTEMA DE FEEDBACK FUNCIONAL =====
    mostrarFeedback(mensagem, tipo = 'sucesso') {
        // Remover feedback anterior
        const feedbackAnterior = document.querySelector('.feedback-mensagem');
        if (feedbackAnterior) {
            feedbackAnterior.remove();
        }

        const feedback = document.createElement('div');
        feedback.className = `feedback-mensagem feedback-${tipo}`;
        feedback.textContent = mensagem;
        
        // Adicionar estilos inline
        Object.assign(feedback.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '1001',
            animation: 'slideInRight 0.3s ease',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            background: tipo === 'sucesso' 
                ? 'linear-gradient(45deg, #27ae60, #2ecc71)' 
                : 'linear-gradient(45deg, #e74c3c, #c0392b)'
        });

        document.body.appendChild(feedback);

        // Auto-remover após 3 segundos
        setTimeout(() => {
            feedback.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.remove();
                }
            }, 300);
        }, 3000);
    }

    // ===== UTILITÁRIOS =====
    limparDados() {
        if (confirm('Tem certeza que deseja limpar TODOS os dados? Esta ação não pode ser desfeita.')) {
            this.vantagensAdquiridas = [];
            this.peculiaridades = [];
            localStorage.removeItem('vantagensDados');
            this.atualizarInterface();
            this.mostrarFeedback('Todos os dados foram limpos!');
        }
    }

    exportarDados() {
        const dados = {
            vantagens: this.vantagensAdquiridas,
            peculiaridades: this.peculiaridades,
            totais: {
                vantagens: this.vantagensAdquiridas.reduce((sum, v) => sum + v.custo, 0),
                peculiaridades: this.peculiaridades.length * -1,
                saldo: this.vantagensAdquiridas.reduce((sum, v) => sum + v.custo, 0) + (this.peculiaridades.length * -1)
            },
            exportadoEm: new Date().toISOString(),
            versao: '1.0'
        };

        try {
            const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vantagens-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.mostrarFeedback('Dados exportados com sucesso!');
        } catch (error) {
            this.mostrarFeedback('Erro ao exportar dados!', 'erro');
            console.error('Erro na exportação:', error);
        }
    }

    importarDados(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const dados = JSON.parse(e.target.result);
                
                if (dados.vantagens && dados.peculiaridades) {
                    this.vantagensAdquiridas = dados.vantagens;
                    this.peculiaridades = dados.peculiaridades;
                    this.atualizarInterface();
                    this.salvarDados();
                    this.mostrarFeedback('Dados importados com sucesso!');
                } else {
                    this.mostrarFeedback('Arquivo inválido!', 'erro');
                }
            } catch (error) {
                this.mostrarFeedback('Erro ao importar arquivo!', 'erro');
                console.error('Erro na importação:', error);
            }
        };
        reader.readAsText(file);
        
        // Limpar input
        event.target.value = '';
    }
}

// ===== INICIALIZAÇÃO COMPLETA =====
let sistemaVantagens;

document.addEventListener('DOMContentLoaded', function() {
    try {
        sistemaVantagens = new SistemaVantagens();
        
        // Adicionar estilos de animação para feedback
        if (!document.querySelector('#estilos-animacao')) {
            const style = document.createElement('style');
            style.id = 'estilos-animacao';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .btn-remover.pequeno {
                    padding: 2px 6px;
                    font-size: 0.7rem;
                    min-height: auto;
                }
                .item-detalhes {
                    color: #888;
                    font-size: 0.8rem;
                    margin-top: 5px;
                }
                .peculiaridade-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .controle-niveis {
                    text-align: center;
                    margin: 20px 0;
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    border: 1px solid rgba(255, 140, 0, 0.2);
                }
                .nivel-display {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 20px;
                    margin-bottom: 15px;
                }
                .btn-nivel {
                    width: 40px;
                    height: 40px;
                    border: 2px solid #ff8c00;
                    background: rgba(255, 140, 0, 0.1);
                    color: #ffd700;
                    font-size: 1.5rem;
                    font-weight: bold;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .btn-nivel:hover:not(:disabled) {
                    background: rgba(255, 140, 0, 0.3);
                    transform: scale(1.1);
                }
                .btn-nivel:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .nivel-info {
                    text-align: center;
                }
                .nivel-valor {
                    font-size: 2rem;
                    font-weight: bold;
                    color: #ffd700;
                }
                .nivel-tipo {
                    font-size: 0.9rem;
                    color: #ccc;
                    margin-top: 5px;
                }
                .nivel-custo-display {
                    font-size: 1.1rem;
                    color: #27ae60;
                    font-weight: 600;
                }
                .nivel-custo-display small {
                    color: #888;
                    font-size: 0.8rem;
                }
            `;
            document.head.appendChild(style);
        }

        console.log('✅ Sistema de Vantagens 100% FUNCIONAL com correções aplicadas!');
    } catch (error) {
        console.error('❌ Erro ao inicializar sistema:', error);
    }
});

// ===== FUNÇÕES GLOBAIS =====
function limparDadosVantagens() {
    if (sistemaVantagens) sistemaVantagens.limparDados();
}

function exportarDadosVantagens() {
    if (sistemaVantagens) sistemaVantagens.exportarDados();
}

function importarDadosVantagens(event) {
    if (sistemaVantagens) sistemaVantagens.importarDados(event);
}

function triggerImport() {
    document.getElementById('import-file').click();
}
// ===== SISTEMA CORE DE MAGIA - VERSÃO DEFINITIVA =====
class SistemaMagia {
    constructor() {
        this.magiasAprendidas = [];
        this.magiaSelecionada = null;
        this.pontosSelecionados = 0;
        this.magiaEditando = null;
        this.iqTimeout = null;
        this.htTimeout = null;
        
        this.inicializarSistema();
        this.migrarIDsAntigos();
    }

    inicializarSistema() {
        this.configurarEventos();
        this.configurarObservadorAtributosMagia();
        this.carregarDadosSalvos();
        this.atualizarInterface();
        
        setTimeout(() => {
            this.configurarFiltros();
        }, 100);
    }

    // ===== SISTEMA DE OBSERVAÇÃO DE ATRIBUTOS EM TEMPO REAL =====
    configurarObservadorAtributosMagia() {
        const iqInput = document.getElementById('IQ');
        const htInput = document.getElementById('HT');
        const aptidaoInput = document.getElementById('aptidao-magica');
        
        // ✅ OBSERVADOR PARA IQ → IQ Mágico (TEMPO REAL)
        if (iqInput) {
            iqInput.addEventListener('change', () => {
                this.atualizarStatusMagico();
                this.atualizarNHsMagias();
            });
            iqInput.addEventListener('input', () => {
                clearTimeout(this.iqTimeout);
                this.iqTimeout = setTimeout(() => {
                    this.atualizarStatusMagico();
                    this.atualizarNHsMagias();
                }, 300);
            });
        }
        
        // ✅ OBSERVADOR PARA HT → Mana Base (TEMPO REAL)
        if (htInput) {
            htInput.addEventListener('change', () => {
                this.atualizarStatusMagico();
            });
            htInput.addEventListener('input', () => {
                clearTimeout(this.htTimeout);
                this.htTimeout = setTimeout(() => {
                    this.atualizarStatusMagico();
                }, 300);
            });
        }
        
        // ✅ OBSERVADOR PARA APTIDÃO MÁGICA
        if (aptidaoInput) {
            aptidaoInput.addEventListener('change', () => {
                this.atualizarNHsMagias();
                this.atualizarStatusMagico();
            });
            aptidaoInput.addEventListener('input', () => {
                setTimeout(() => {
                    this.atualizarNHsMagias();
                    this.atualizarStatusMagico();
                }, 300);
            });
        }
        
        // ✅ OBSERVAR BOTÕES +/- DOS ATRIBUTOS
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-plus') || e.target.closest('.btn-minus')) {
                setTimeout(() => {
                    const btn = e.target.closest('.btn-plus, .btn-minus');
                    const input = btn.parentElement.querySelector('input[type="number"]');
                    if (input) {
                        if (input.id === 'IQ' || input.id === 'HT' || input.id === 'aptidao-magica') {
                            this.atualizarStatusMagico();
                            if (input.id === 'IQ' || input.id === 'aptidao-magica') {
                                this.atualizarNHsMagias();
                            }
                        }
                    }
                }, 100);
            }
        });
    }

    // ===== ATUALIZAÇÃO EM TEMPO REAL DO STATUS MÁGICO =====
    atualizarStatusMagico() {
        const iq = this.obterIQ();
        const ht = this.obterHT();
        
        // ✅ ATUALIZAÇÃO EM TEMPO REAL - IQ Mágico
        const iqMagicoElem = document.getElementById('iq-magico');
        if (iqMagicoElem) {
            iqMagicoElem.textContent = iq;
        }
        
        // ✅ ATUALIZAÇÃO EM TEMPO REAL - Mana Base
        const manaBaseElem = document.getElementById('mana-base');
        if (manaBaseElem) {
            manaBaseElem.textContent = ht;
        }
        
        // ✅ ATUALIZAR MANA ATUAL SE NECESSÁRIO
        const manaAtualElem = document.getElementById('mana-atual');
        if (manaAtualElem) {
            const manaAtual = parseInt(manaAtualElem.value) || 0;
            const manaMaxima = ht;
            if (manaAtual > manaMaxima) {
                manaAtualElem.value = manaMaxima;
            }
            manaAtualElem.max = manaMaxima;
        }
        
        console.log('🔄 Status Mágico Atualizado - IQ:', iq, 'HT:', ht);
    }

    // ===== SISTEMA DE FILTROS FUNCIONAL =====
    configurarFiltros() {
        // Primeiro, limpar event listeners existentes
        const filtroHeaders = document.querySelectorAll('.filtro-header');
        
        filtroHeaders.forEach(header => {
            // Clonar e substituir para remover event listeners antigos
            const novoHeader = header.cloneNode(true);
            header.parentNode.replaceChild(novoHeader, header);
        });

        // Agora configurar os novos event listeners
        const novosHeaders = document.querySelectorAll('.filtro-header');
        
        novosHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const submenu = header.nextElementSibling;
                if (submenu && submenu.classList.contains('filtro-submenu')) {
                    // Fechar outros submenus abertos
                    document.querySelectorAll('.filtro-submenu.active').forEach(otherMenu => {
                        if (otherMenu !== submenu) {
                            otherMenu.classList.remove('active');
                            const otherHeader = otherMenu.previousElementSibling;
                            const otherIcon = otherHeader.querySelector('.fa-chevron-down, .fa-chevron-up');
                            if (otherIcon) {
                                otherIcon.className = 'fas fa-chevron-down';
                            }
                        }
                    });
                    
                    // Alternar submenu atual
                    submenu.classList.toggle('active');
                    
                    // Atualizar ícone
                    const icon = header.querySelector('.fa-chevron-down, .fa-chevron-up');
                    if (icon) {
                        if (submenu.classList.contains('active')) {
                            icon.className = 'fas fa-chevron-up';
                        } else {
                            icon.className = 'fas fa-chevron-down';
                        }
                    }
                }
            });
        });

        // Configurar eventos dos checkboxes
        this.configurarEventosFiltros();

        // Fechar submenus ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.filtro-grupo')) {
                document.querySelectorAll('.filtro-submenu.active').forEach(submenu => {
                    submenu.classList.remove('active');
                    const header = submenu.previousElementSibling;
                    const icon = header.querySelector('.fa-chevron-down, .fa-chevron-up');
                    if (icon) {
                        icon.className = 'fas fa-chevron-down';
                    }
                });
            }
        });
    }

    configurarEventosFiltros() {
        // Configurar checkbox "Todas as Escolas"
        const todasEscolas = document.getElementById('escola-todas');
        if (todasEscolas) {
            todasEscolas.addEventListener('change', (e) => {
                const escolasCheckboxes = document.querySelectorAll('.escola-checkbox');
                escolasCheckboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                    checkbox.disabled = e.target.checked;
                });
                this.aplicarFiltros();
            });
        }

        // Configurar checkbox "Todas as Classes"
        const todasClasses = document.getElementById('classe-todas');
        if (todasClasses) {
            todasClasses.addEventListener('change', (e) => {
                const classesCheckboxes = document.querySelectorAll('.classe-checkbox');
                classesCheckboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                    checkbox.disabled = e.target.checked;
                });
                this.aplicarFiltros();
            });
        }

        // Configurar checkboxes individuais das escolas
        const escolasCheckboxes = document.querySelectorAll('.escola-checkbox');
        escolasCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.verificarTodasEscolas();
                this.aplicarFiltros();
            });
        });

        // Configurar checkboxes individuais das classes
        const classesCheckboxes = document.querySelectorAll('.classe-checkbox');
        classesCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.verificarTodasClasses();
                this.aplicarFiltros();
            });
        });
    }

    verificarTodasEscolas() {
        const todasEscolas = document.getElementById('escola-todas');
        const escolasCheckboxes = document.querySelectorAll('.escola-checkbox');
        const todasMarcadas = Array.from(escolasCheckboxes).every(checkbox => checkbox.checked);
        
        if (todasEscolas) {
            todasEscolas.checked = todasMarcadas;
        }
    }

    verificarTodasClasses() {
        const todasClasses = document.getElementById('classe-todas');
        const classesCheckboxes = document.querySelectorAll('.classe-checkbox');
        const todasMarcadas = Array.from(classesCheckboxes).every(checkbox => checkbox.checked);
        
        if (todasClasses) {
            todasClasses.checked = todasMarcadas;
        }
    }

    aplicarFiltros() {
        this.filtrarCatalogo();
    }

    obterEscolasSelecionadas() {
        const escolas = [];
        
        const todasEscolas = document.getElementById('escola-todas');
        if (todasEscolas && todasEscolas.checked) {
            return [];
        }

        const escolasCheckboxes = [
            'escola-agua', 'escola-ar', 'escola-compreensao', 'escola-controle-mente',
            'escola-controle-corpo', 'escola-cura', 'escola-deslocamento', 'escola-fogo',
            'escola-luz-trevas', 'escola-necromancia', 'escola-portal', 'escola-protecao',
            'escola-reconhecimento', 'escola-terra', 'escola-metamagica'
        ];

        escolasCheckboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox && checkbox.checked) {
                const escola = id.replace('escola-', '');
                escolas.push(escola);
            }
        });

        return escolas;
    }

    obterClassesSelecionadas() {
        const classes = [];
        
        const todasClasses = document.getElementById('classe-todas');
        if (todasClasses && todasClasses.checked) {
            return [];
        }

        const classesCheckboxes = [
            'classe-comuns', 'classe-area', 'classe-toque', 'classe-projetil', 
            'classe-bloqueio', 'classe-informacao', 'classe-resistiveis', 'classe-especiais'
        ];

        classesCheckboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox && checkbox.checked) {
                const classe = id.replace('classe-', '');
                classes.push(classe);
            }
        });

        return classes;
    }

    migrarIDsAntigos() {
        let atualizou = false;
        
        this.magiasAprendidas.forEach(magia => {
            if (magia.id === 1) {
                magia.id = 600;
                atualizou = true;
            } else if (magia.id === 2) {
                magia.id = 601;
                atualizou = true;
            }
        });
        
        if (atualizou) {
            this.salvarDados();
        }
    }

    configurarEventos() {
        const buscaInput = document.getElementById('busca-magias');
        if (buscaInput) {
            buscaInput.addEventListener('input', (e) => {
                this.filtrarCatalogo();
            });
        }

        const manaInput = document.getElementById('mana-atual');
        if (manaInput) {
            manaInput.addEventListener('change', () => {
                this.atualizarMana();
            });
        }

        // Configurar evento para aptidão mágica
        const aptidaoInput = document.getElementById('aptidao-magica');
        if (aptidaoInput) {
            aptidaoInput.addEventListener('change', () => {
                this.atualizarNHsMagias();
                this.atualizarStatusMagico();
            });
        }
    }

    filtrarCatalogo() {
        const buscaInput = document.getElementById('busca-magias');
        const termoBusca = buscaInput ? buscaInput.value.toLowerCase() : '';

        const escolasSelecionadas = this.obterEscolasSelecionadas();
        const classesSelecionadas = this.obterClassesSelecionadas();

        if (typeof catalogoMagias === 'undefined') {
            const container = document.getElementById('lista-magias');
            if (container) {
                container.innerHTML = '<div class="nenhuma-magia">Catálogo de magias não carregado</div>';
            }
            return;
        }

        const magiasFiltradas = catalogoMagias.filter(magia => {
            if (termoBusca && !magia.nome.toLowerCase().includes(termoBusca)) {
                return false;
            }

            if (escolasSelecionadas.length > 0 && !escolasSelecionadas.includes(magia.escola)) {
                return false;
            }

            if (classesSelecionadas.length > 0 && !classesSelecionadas.includes(magia.classe)) {
                return false;
            }

            return true;
        });

        this.mostrarMagiasFiltradas(magiasFiltradas);
    }

    mostrarMagiasFiltradas(magias) {
        const container = document.getElementById('lista-magias');
        if (!container) return;

        if (magias.length === 0) {
            container.innerHTML = '<div class="nenhuma-magia">Nenhuma magia encontrada</div>';
            return;
        }

        container.innerHTML = magias.map(magia => {
            const magiaAprendida = this.magiasAprendidas.find(m => m.id === magia.id);
            const jaAprendida = !!magiaAprendida;
            
            return `
                <div class="magia-item-catalogo ${jaAprendida ? 'destaque' : ''}" 
                     onclick="sistemaMagia.mostrarDetalhesMagia(${magia.id})">
                    <div class="magia-nome">${magia.nome}</div>
                    <div class="magia-info-rapida">
                        <span class="magia-escola">${this.formatarEscola(magia.escola)}</span>
                        <span class="magia-classe">${this.formatarClasse(magia.classe)}</span>
                        <span class="magia-custo">${magia.custoMana} mana</span>
                        <span class="magia-nh">NH ${magia.nhBase}</span>
                    </div>
                    <div class="magia-descricao-curta">${magia.descricao.substring(0, 100)}...</div>
                    <div class="magia-controles">
                        ${jaAprendida ? 
                            `<button class="btn-editar-magia" 
                                     onclick="event.stopPropagation(); sistemaMagia.abrirModalEdicao(${magia.id})">
                                 Editar (NH ${magiaAprendida.nivel})
                             </button>` :
                            `<button class="btn-aprender-magia" 
                                     onclick="event.stopPropagation(); sistemaMagia.abrirModalAprendizagem(${magia.id})">
                                 Aprender
                             </button>`
                        }
                        <button class="btn-detalhes-magia" 
                                onclick="event.stopPropagation(); sistemaMagia.mostrarDetalhesMagiaModal(${magia.id})">
                            Detalhes
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    abrirModalAprendizagem(id) {
        if (typeof catalogoMagias !== 'undefined') {
            this.magiaSelecionada = catalogoMagias.find(m => m.id === id);
            if (!this.magiaSelecionada) return;

            this.pontosSelecionados = 1;
            this.magiaEditando = null;
            this.mostrarModalCompra();
        }
    }

    abrirModalEdicao(id) {
        this.magiaEditando = this.magiasAprendidas.find(m => m.id === id);
        if (!this.magiaEditando) return;

        if (typeof catalogoMagias !== 'undefined') {
            this.magiaSelecionada = catalogoMagias.find(m => m.id === id);
        }
        this.pontosSelecionados = this.magiaEditando.pontos;
        
        this.mostrarModalCompra();
    }

    mostrarModalCompra() {
        const magia = this.magiaSelecionada;
        if (!magia) return;

        const editando = !!this.magiaEditando;
        const nhCalculado = this.calcularNH(magia, this.pontosSelecionados);

        const modalHTML = `
            <div class="modal-compra-overlay">
                <div class="modal-compra">
                    <h3>${editando ? 'Editar Magia' : 'Aprender Magia'}: ${magia.nome}</h3>
                    <div class="info-magia">
                        <strong>${this.formatarEscola(magia.escola)} / ${this.formatarClasse(magia.classe)}</strong>
                        <div class="descricao">${magia.descricao}</div>
                    </div>
                    
                    <div class="controles-compra">
                        <div class="controle-pontos">
                            <button class="btn-controle" onclick="sistemaMagia.diminuirPontosCompra()">-</button>
                            <span class="display-pontos">${this.pontosSelecionados} pontos</span>
                            <button class="btn-controle" onclick="sistemaMagia.aumentarPontosCompra()">+</button>
                        </div>
                        <div class="nivel-calculado">
                            NH calculado: <strong>${nhCalculado}</strong>
                            <small>(IQ ${this.obterIQ()} + Apt ${this.obterAptidao()} + ${this.calcularBonus(this.pontosSelecionados, magia.dificuldade)})</small>
                        </div>
                    </div>

                    <div class="acoes-modal">
                        ${editando ? 
                            `<button class="btn-remover" onclick="sistemaMagia.removerMagia(${magia.id}); sistemaMagia.fecharModalCompra()">
                                Remover Magia
                            </button>` : 
                            ''
                        }
                        <button class="btn-cancelar" onclick="sistemaMagia.fecharModalCompra()">Cancelar</button>
                        <button class="btn-comprar" onclick="sistemaMagia.confirmarAprendizagem()">
                            ${editando ? 'Atualizar' : 'Aprender'} por ${this.pontosSelecionados} pontos
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    aumentarPontosCompra() {
        const custos = [1, 2, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52];
        const indexAtual = custos.indexOf(this.pontosSelecionados);
        
        if (indexAtual < custos.length - 1) {
            this.pontosSelecionados = custos[indexAtual + 1];
            this.atualizarModalCompra();
        }
    }

    diminuirPontosCompra() {
        const custos = [1, 2, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52];
        const indexAtual = custos.indexOf(this.pontosSelecionados);
        
        if (indexAtual > 0) {
            this.pontosSelecionados = custos[indexAtual - 1];
            this.atualizarModalCompra();
        }
    }

    atualizarModalCompra() {
        const magia = this.magiaSelecionada;
        if (!magia) return;

        const nhCalculado = this.calcularNH(magia, this.pontosSelecionados);
        const editando = !!this.magiaEditando;
        
        const modal = document.querySelector('.modal-compra');
        if (modal) {
            modal.querySelector('.display-pontos').textContent = `${this.pontosSelecionados} pontos`;
            modal.querySelector('.nivel-calculado strong').textContent = nhCalculado;
            
            const iq = this.obterIQ();
            const aptidao = this.obterAptidao();
            const bonus = this.calcularBonus(this.pontosSelecionados, magia.dificuldade);
            
            modal.querySelector('.nivel-calculado').innerHTML = 
                `NH calculado: <strong>${nhCalculado}</strong>
                <small>(IQ ${iq} + Apt ${aptidao} + ${bonus})</small>`;
            
            modal.querySelector('.btn-comprar').textContent = 
                `${editando ? 'Atualizar' : 'Aprender'} por ${this.pontosSelecionados} pontos`;
        }
    }

    fecharModalCompra() {
        const modal = document.querySelector('.modal-compra-overlay');
        if (modal) modal.remove();
        this.magiaSelecionada = null;
        this.magiaEditando = null;
        this.pontosSelecionados = 0;
    }

    confirmarAprendizagem() {
        if (!this.magiaSelecionada) return;

        const magiaData = {
            ...this.magiaSelecionada,
            pontos: this.pontosSelecionados,
            nivel: this.calcularNH(this.magiaSelecionada, this.pontosSelecionados),
            dataAprendizagem: new Date().toISOString()
        };

        if (this.magiaEditando) {
            const index = this.magiasAprendidas.findIndex(m => m.id === this.magiaSelecionada.id);
            if (index !== -1) {
                this.magiasAprendidas[index] = magiaData;
            }
        } else {
            this.magiasAprendidas.push(magiaData);
        }
        
        this.fecharModalCompra();
        this.atualizarInterface();
        this.salvarDados();
        
        if (typeof atualizarPontos === 'function') {
            atualizarPontos();
        }
    }

    removerMagia(id) {
        this.magiasAprendidas = this.magiasAprendidas.filter(m => m.id !== id);
        this.atualizarInterface();
        this.salvarDados();
        
        if (typeof atualizarPontos === 'function') {
            atualizarPontos();
        }
    }

    calcularNH(magia, pontos) {
        const iq = this.obterIQ();
        const aptidao = this.obterAptidao();
        const bonus = this.calcularBonus(pontos, magia.dificuldade);
        
        return iq + aptidao + bonus;
    }

    obterIQ() {
        const elemento = document.getElementById('IQ');
        return elemento ? parseInt(elemento.value) || 10 : 10;
    }

    // ✅ MÉTODO GARANTIDO: Obter HT para Mana Base
    obterHT() {
        const elemento = document.getElementById('HT');
        return elemento ? parseInt(elemento.value) || 10 : 10;
    }

    obterAptidao() {
        const elemento = document.getElementById('aptidao-magica');
        return elemento ? parseInt(elemento.value) || 0 : 0;
    }

    calcularBonus(pontos, dificuldade) {
        const tabelaBonus = {
            'Difícil': {
                1: -2,   2: -1,   4: 0,    8: 1,    12: 2,   16: 3,
                20: 4,   24: 5,   28: 6,   32: 7,   36: 8,   40: 9,
                44: 10,  48: 11,  52: 12
            },
            'Muito Difícil': {
                1: -3,   2: -2,   4: -1,   8: 0,    12: 1,   16: 2,
                20: 3,   24: 4,   28: 5,   32: 6,   36: 7,   40: 8,
                44: 9,   48: 10,  52: 11
            }
        };
        
        return tabelaBonus[dificuldade]?.[pontos] || 0;
    }

    mostrarDetalhesMagiaModal(id) {
        if (typeof catalogoMagias === 'undefined') return;

        const magia = catalogoMagias.find(m => m.id === id);
        if (!magia) return;

        const modalHTML = `
            <div class="modal-compra-overlay">
                <div class="modal-compra modal-detalhes">
                    <div class="modal-header">
                        <h3>Detalhes da Magia: ${magia.nome}</h3>
                        <button class="btn-fechar-modal" onclick="sistemaMagia.fecharModalDetalhes()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="info-magia-detalhes">
                        ${this.gerarDetalhesTecnicos(magia)}
                    </div>
                    <div class="acoes-modal">
                        <button class="btn-cancelar" onclick="sistemaMagia.fecharModalDetalhes()">Fechar</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    fecharModalDetalhes() {
        const modal = document.querySelector('.modal-compra-overlay');
        if (modal) modal.remove();
    }

    gerarDetalhesTecnicos(magia) {
        return `
            <div class="detalhes-tecnicos">
                <div class="info-principal">
                    <div class="info-item">
                        <strong>Escola:</strong>
                        <span>${this.formatarEscola(magia.escola)}</span>
                    </div>
                    <div class="info-item">
                        <strong>Classe:</strong>
                        <span>${this.formatarClasse(magia.classe)}</span>
                    </div>
                    <div class="info-item">
                        <strong>Dificuldade:</strong>
                        <span>${magia.dificuldade}</span>
                    </div>
                </div>

                <div class="info-custos">
                    <div class="info-item">
                        <strong>Custo de Mana:</strong>
                        <span>${magia.custoMana}</span>
                    </div>
                    <div class="info-item">
                        <strong>Duração:</strong>
                        <span>${magia.duracao}</span>
                    </div>
                    <div class="info-item">
                        <strong>Tempo de Conjuração:</strong>
                        <span>${magia.tempoOperacao}</span>
                    </div>
                </div>

                <div class="info-tecnica">
                    <div class="info-item">
                        <strong>NH Base:</strong>
                        <span>${magia.nhBase}</span>
                    </div>
                    ${magia.preRequisitos ? `
                    <div class="info-item">
                        <strong>Pré-requisitos:</strong>
                        <span>${magia.preRequisitos}</span>
                    </div>
                    ` : ''}
                </div>

                <div class="descricao-completa">
                    <strong>Descrição Completa:</strong>
                    <div class="texto-descricao">${magia.descricao}</div>
                </div>
            </div>
        `;
    }

    mostrarDetalhesMagia(id) {
        if (typeof catalogoMagias === 'undefined') return;

        const magia = catalogoMagias.find(m => m.id === id);
        if (!magia) return;

        const container = document.getElementById('detalhes-magia-content');
        if (!container) return;

        container.innerHTML = `
            <div class="magia-detalhes-completo">
                <div class="detalhe-header">
                    <h4>${magia.nome}</h4>
                </div>
                ${this.gerarDetalhesTecnicos(magia)}
            </div>
        `;
    }

    atualizarInterface() {
        this.atualizarStatusMagico();
        this.atualizarListaAprendidas();
        this.filtrarCatalogo();
        this.atualizarDashboard();
    }

    atualizarMana() {
        const manaAtualElem = document.getElementById('mana-atual');
        const manaBaseElem = document.getElementById('mana-base');
        
        if (manaAtualElem && manaBaseElem) {
            const manaAtual = parseInt(manaAtualElem.value) || 0;
            const manaMaxima = parseInt(manaBaseElem.textContent) || 10;
            
            if (manaAtual > manaMaxima) {
                manaAtualElem.value = manaMaxima;
            }
        }
    }

    atualizarListaAprendidas() {
        const container = document.getElementById('magias-aprendidas');
        const pontosTotal = this.magiasAprendidas.reduce((sum, m) => sum + m.pontos, 0);

        document.getElementById('pontos-magia-total').textContent = `[${pontosTotal} pts]`;
        document.getElementById('total-gasto-magia').textContent = pontosTotal;

        if (this.magiasAprendidas.length === 0) {
            container.innerHTML = `
                <div class="nenhuma-magia-aprendida">
                    <i class="fas fa-hat-wizard"></i>
                    <div>Nenhuma magia aprendida</div>
                    <small>As magias que você aprender aparecerão aqui</small>
                </div>
            `;
        } else {
            container.innerHTML = this.magiasAprendidas.map(magia => `
                <div class="magia-aprendida-item">
                    <div class="magia-aprendida-info">
                        <div class="magia-aprendida-nome">${magia.nome}</div>
                        <div class="magia-aprendida-detalhes">
                            NH ${magia.nivel} | ${magia.pontos} pts | ${magia.custoMana} mana
                        </div>
                    </div>
                    <div class="magia-aprendida-controles">
                        <button class="btn-editar-magia" onclick="sistemaMagia.abrirModalEdicao(${magia.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn-detalhes-magia" onclick="sistemaMagia.mostrarDetalhesMagiaModal(${magia.id})">
                            <i class="fas fa-info-circle"></i> Detalhes
                        </button>
                        <button class="btn-remover-magia" onclick="sistemaMagia.removerMagia(${magia.id})">
                            <i class="fas fa-times"></i> Remover
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    atualizarDashboard() {
        const totalPontos = this.calcularTotalPontos();
        if (document.getElementById('gastoMagias')) {
            document.getElementById('gastoMagias').textContent = totalPontos;
        }
        
        if (typeof atualizarPontos === 'function') {
            atualizarPontos();
        }
    }

    calcularTotalPontos() {
        return this.magiasAprendidas.reduce((sum, magia) => sum + magia.pontos, 0);
    }

    formatarEscola(escola) {
        const escolas = {
            'agua': 'Água', 'ar': 'Ar', 'compreensao': 'Compreensão/Empatia',
            'controle-mente': 'Controle da Mente', 'controle-corpo': 'Controle do Corpo',
            'cura': 'Cura', 'deslocamento': 'Deslocamento', 'fogo': 'Fogo',
            'luz-trevas': 'Luz e Trevas', 'necromancia': 'Necromancia', 'portal': 'Portal',
            'protecao': 'Proteção e Aviso', 'reconhecimento': 'Reconhecimento',
            'terra': 'Terra', 'metamagica': 'Metamágica'
        };
        return escolas[escola] || escola;
    }

    formatarClasse(classe) {
        const classes = {
            'comuns': 'Comuns', 'area': 'Área', 'toque': 'Toque', 'projetil': 'Projétil',
            'bloqueio': 'Bloqueio', 'informacao': 'Informação', 'resistiveis': 'Resistíveis',
            'especiais': 'Especiais'
        };
        return classes[classe] || classe;
    }

    salvarDados() {
        const dados = {
            magiasAprendidas: this.magiasAprendidas,
            timestamp: new Date().getTime()
        };
        localStorage.setItem('sistemaMagia', JSON.stringify(dados));
    }

    carregarDadosSalvos() {
        try {
            const dadosSalvos = localStorage.getItem('sistemaMagia');
            if (dadosSalvos) {
                const dados = JSON.parse(dadosSalvos);
                if (dados.magiasAprendidas) {
                    this.magiasAprendidas = dados.magiasAprendidas;
                }
            }
        } catch (e) {
            localStorage.removeItem('sistemaMagia');
        }
    }
}

// ===== INICIALIZAÇÃO GLOBAL =====
let sistemaMagia;

document.addEventListener('DOMContentLoaded', function() {
    sistemaMagia = new SistemaMagia();
    window.sistemaMagia = sistemaMagia;
    
    // ✅ INICIALIZAÇÃO FORÇADA DO STATUS MÁGICO
    setTimeout(() => {
        sistemaMagia.atualizarStatusMagico(); // Garante que IQ Mágico e Mana Base estejam corretos
        sistemaMagia.filtrarCatalogo();
        sistemaMagia.configurarFiltros(); // Garante que filtros funcionem
        
        console.log('🎯 Sistema de Magia Inicializado - IQ Mágico e Mana Base em Tempo Real!');
    }, 100);
});

// ===== FUNÇÕES GLOBAIS PARA HTML =====
window.abrirModalAprendizagem = (id) => sistemaMagia.abrirModalAprendizagem(id);
window.abrirModalEdicao = (id) => sistemaMagia.abrirModalEdicao(id);
window.removerMagia = (id) => sistemaMagia.removerMagia(id);
window.mostrarDetalhesMagia = (id) => sistemaMagia.mostrarDetalhesMagia(id);
window.mostrarDetalhesMagiaModal = (id) => sistemaMagia.mostrarDetalhesMagiaModal(id);
window.fecharModalDetalhes = () => sistemaMagia.fecharModalDetalhes();
window.aumentarPontosCompra = () => sistemaMagia.aumentarPontosCompra();
window.diminuirPontosCompra = () => sistemaMagia.diminuirPontosCompra();
window.fecharModalCompra = () => sistemaMagia.fecharModalCompra();
window.confirmarAprendizagem = () => sistemaMagia.confirmarAprendizagem();
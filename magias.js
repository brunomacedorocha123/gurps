// ===== SISTEMA CORE DE MAGIA =====
class SistemaMagia {
    constructor() {
        this.magiasAprendidas = [];
        this.magiaSelecionada = null;
        this.pontosSelecionados = 1;
        this.magiaEditando = null;
        this.iqTimeout = null;
        this.htTimeout = null;
        this.aptidaoTimeout = null;
        
        this.inicializarSistema();
    }

    inicializarSistema() {
        this.carregarDadosSalvos();
        this.configurarObservadorAtributosMagia();
        this.configurarFiltrosManualmente();
        this.configurarEventos();
        this.atualizarInterface();
        
        setTimeout(() => {
            this.atualizarStatusMagico();
            this.filtrarCatalogo();
        }, 100);
    }

    configurarFiltrosManualmente() {
        document.querySelectorAll('.filtro-header').forEach(header => {
            const newHeader = header.cloneNode(true);
            header.parentNode.replaceChild(newHeader, header);
        });

        setTimeout(() => {
            const headerEscolas = document.querySelector('.filtro-header[onclick*="escolas-submenu"]');
            if (headerEscolas) {
                headerEscolas.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleSubmenu('escolas-submenu');
                });
            }

            const headerClasses = document.querySelector('.filtro-header[onclick*="classes-submenu"]');
            if (headerClasses) {
                headerClasses.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleSubmenu('classes-submenu');
                });
            }

            const todasEscolas = document.getElementById('escola-todas');
            if (todasEscolas) {
                todasEscolas.addEventListener('change', (e) => {
                    const escolasCheckboxes = document.querySelectorAll('.escola-checkbox');
                    const isChecked = e.target.checked;
                    
                    escolasCheckboxes.forEach(checkbox => {
                        checkbox.checked = isChecked;
                        checkbox.disabled = isChecked;
                    });
                    
                    this.filtrarCatalogo();
                });
            }

            const todasClasses = document.getElementById('classe-todas');
            if (todasClasses) {
                todasClasses.addEventListener('change', (e) => {
                    const classesCheckboxes = document.querySelectorAll('.classe-checkbox');
                    const isChecked = e.target.checked;
                    
                    classesCheckboxes.forEach(checkbox => {
                        checkbox.checked = isChecked;
                        checkbox.disabled = isChecked;
                    });
                    
                    this.filtrarCatalogo();
                });
            }

            document.querySelectorAll('.escola-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    this.verificarTodasEscolas();
                    this.filtrarCatalogo();
                });
            });

            document.querySelectorAll('.classe-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    this.verificarTodasClasses();
                    this.filtrarCatalogo();
                });
            });

            const buscaInput = document.getElementById('busca-magias');
            if (buscaInput) {
                buscaInput.addEventListener('input', () => {
                    this.filtrarCatalogo();
                });
            }
        }, 150);
    }

    toggleSubmenu(submenuId) {
        const submenu = document.getElementById(submenuId);
        if (!submenu) return;

        document.querySelectorAll('.filtro-submenu').forEach(otherMenu => {
            if (otherMenu.id !== submenuId && otherMenu.classList.contains('active')) {
                otherMenu.classList.remove('active');
                const otherHeader = otherMenu.previousElementSibling;
                if (otherHeader) {
                    const icon = otherHeader.querySelector('.fa-chevron-down, .fa-chevron-up');
                    if (icon) icon.className = 'fas fa-chevron-down';
                }
            }
        });

        submenu.classList.toggle('active');
        const header = submenu.previousElementSibling;
        if (header) {
            const icon = header.querySelector('.fa-chevron-down, .fa-chevron-up');
            if (icon) {
                icon.className = submenu.classList.contains('active') ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
            }
        }
    }

    verificarTodasEscolas() {
        const todasEscolas = document.getElementById('escola-todas');
        const escolasCheckboxes = document.querySelectorAll('.escola-checkbox:not([disabled])');
        const todasMarcadas = Array.from(escolasCheckboxes).every(checkbox => checkbox.checked);
        
        if (todasEscolas) {
            todasEscolas.checked = todasMarcadas;
        }
    }

    verificarTodasClasses() {
        const todasClasses = document.getElementById('classe-todas');
        const classesCheckboxes = document.querySelectorAll('.classe-checkbox:not([disabled])');
        const todasMarcadas = Array.from(classesCheckboxes).every(checkbox => checkbox.checked);
        
        if (todasClasses) {
            todasClasses.checked = todasMarcadas;
        }
    }

    configurarObservadorAtributosMagia() {
        const iqInput = document.getElementById('IQ');
        if (iqInput) {
            iqInput.addEventListener('input', () => {
                clearTimeout(this.iqTimeout);
                this.iqTimeout = setTimeout(() => {
                    this.atualizarStatusMagico();
                    this.atualizarNHsMagias();
                }, 300);
            });
        }

        const htInput = document.getElementById('HT');
        if (htInput) {
            htInput.addEventListener('input', () => {
                clearTimeout(this.htTimeout);
                this.htTimeout = setTimeout(() => {
                    this.atualizarStatusMagico();
                }, 300);
            });
        }

        const aptidaoInput = document.getElementById('aptidao-magica');
        if (aptidaoInput) {
            aptidaoInput.addEventListener('input', () => {
                clearTimeout(this.aptidaoTimeout);
                this.aptidaoTimeout = setTimeout(() => {
                    this.atualizarStatusMagico();
                    this.atualizarNHsMagias();
                }, 300);
            });
        }

        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-plus, .btn-minus');
            if (btn) {
                setTimeout(() => {
                    const container = btn.closest('.atributo-container');
                    if (container) {
                        const input = container.querySelector('input[type="number"]');
                        if (input) {
                            if (input.id === 'IQ') {
                                this.atualizarStatusMagico();
                                this.atualizarNHsMagias();
                            } else if (input.id === 'HT') {
                                this.atualizarStatusMagico();
                            } else if (input.id === 'aptidao-magica') {
                                this.atualizarStatusMagico();
                                this.atualizarNHsMagias();
                            }
                        }
                    }
                }, 100);
            }
        });
    }

    atualizarStatusMagico() {
        const iq = this.obterIQ();
        const ht = this.obterHT();
        
        const iqMagicoElem = document.getElementById('iq-magico');
        if (iqMagicoElem) {
            iqMagicoElem.textContent = iq;
        }
        
        const manaBaseElem = document.getElementById('mana-base');
        if (manaBaseElem) {
            manaBaseElem.textContent = ht;
        }
        
        const manaAtualElem = document.getElementById('mana-atual');
        if (manaAtualElem) {
            const manaAtual = parseInt(manaAtualElem.value) || 0;
            if (manaAtual > ht) {
                manaAtualElem.value = ht;
            }
            manaAtualElem.max = ht;
        }
    }

    atualizarNHsMagias() {
        this.magiasAprendidas.forEach(magia => {
            if (typeof catalogoMagias !== 'undefined') {
                const magiaBase = catalogoMagias.find(m => m.id === magia.id);
                if (magiaBase) {
                    magia.nivel = this.calcularNH(magiaBase, magia.pontos);
                }
            }
        });
        
        this.atualizarListaAprendidas();
        this.salvarDados();
    }

    obterEscolasSelecionadas() {
        const todasEscolas = document.getElementById('escola-todas');
        if (todasEscolas && todasEscolas.checked) {
            return [];
        }

        const escolas = [];
        const escolasCheckboxes = document.querySelectorAll('.escola-checkbox:checked');
        escolasCheckboxes.forEach(checkbox => {
            const escolaId = checkbox.id.replace('escola-', '');
            escolas.push(escolaId);
        });

        return escolas;
    }

    obterClassesSelecionadas() {
        const todasClasses = document.getElementById('classe-todas');
        if (todasClasses && todasClasses.checked) {
            return [];
        }

        const classes = [];
        const classesCheckboxes = document.querySelectorAll('.classe-checkbox:checked');
        classesCheckboxes.forEach(checkbox => {
            const classeId = checkbox.id.replace('classe-', '');
            classes.push(classeId);
        });

        return classes;
    }

    filtrarCatalogo() {
        if (typeof catalogoMagias === 'undefined') {
            return;
        }

        const buscaInput = document.getElementById('busca-magias');
        const termoBusca = buscaInput ? buscaInput.value.toLowerCase().trim() : '';

        const escolasSelecionadas = this.obterEscolasSelecionadas();
        const classesSelecionadas = this.obterClassesSelecionadas();

        const magiasFiltradas = catalogoMagias.filter(magia => {
            if (termoBusca && termoBusca.length > 0) {
                const nomeMatch = magia.nome.toLowerCase().includes(termoBusca);
                const descMatch = magia.descricao.toLowerCase().includes(termoBusca);
                if (!nomeMatch && !descMatch) {
                    return false;
                }
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

    obterIQ() {
        const elemento = document.getElementById('IQ');
        return elemento ? parseInt(elemento.value) || 10 : 10;
    }

    obterHT() {
        const elemento = document.getElementById('HT');
        return elemento ? parseInt(elemento.value) || 10 : 10;
    }

    obterAptidao() {
        const elemento = document.getElementById('aptidao-magica');
        return elemento ? parseInt(elemento.value) || 0 : 0;
    }

    calcularNH(magia, pontos) {
        const iq = this.obterIQ();
        const aptidao = this.obterAptidao();
        const bonus = this.calcularBonus(pontos, magia.dificuldade);
        
        return iq + aptidao + bonus;
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
        this.pontosSelecionados = this.magiaEditando.pontos || 1;
        
        this.mostrarModalCompra();
    }

    mostrarModalCompra() {
        const magia = this.magiaSelecionada;
        if (!magia) return;

        const editando = !!this.magiaEditando;
        const nhCalculado = this.calcularNH(magia, this.pontosSelecionados);

        const modalHTML = `
            <div class="modal-compra-overlay" id="modal-magia-compra">
                <div class="modal-compra">
                    <div class="modal-header">
                        <h3>${editando ? 'Editar Magia' : 'Aprender Magia'}: ${magia.nome}</h3>
                        <button class="btn-fechar-modal" id="btn-fechar-modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="info-magia">
                        <strong>${this.formatarEscola(magia.escola)} / ${this.formatarClasse(magia.classe)}</strong>
                        <div class="descricao">${magia.descricao}</div>
                    </div>
                    
                    <div class="controles-compra">
                        <div class="controle-pontos">
                            <button class="btn-controle" id="btn-diminuir-pontos">-</button>
                            <span class="display-pontos">${this.pontosSelecionados} pontos</span>
                            <button class="btn-controle" id="btn-aumentar-pontos">+</button>
                        </div>
                        <div class="nivel-calculado">
                            NH calculado: <strong id="nh-calculado">${nhCalculado}</strong>
                            <small id="nh-detalhes">(IQ ${this.obterIQ()} + Apt ${this.obterAptidao()} + ${this.calcularBonus(this.pontosSelecionados, magia.dificuldade)})</small>
                        </div>
                    </div>

                    <div class="acoes-modal">
                        ${editando ? 
                            `<button class="btn-remover" id="btn-remover-magia">
                                Remover Magia
                            </button>` : 
                            ''
                        }
                        <button class="btn-cancelar" id="btn-cancelar-compra">Cancelar</button>
                        <button class="btn-comprar" id="btn-confirmar-compra">
                            ${editando ? 'Atualizar' : 'Aprender'} por ${this.pontosSelecionados} pontos
                        </button>
                    </div>
                </div>
            </div>
        `;

        const modalExistente = document.getElementById('modal-magia-compra');
        if (modalExistente) modalExistente.remove();

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Configurar eventos do modal
        this.configurarEventosModal();
    }

    configurarEventosModal() {
        // Fechar modal
        document.getElementById('btn-fechar-modal')?.addEventListener('click', () => {
            this.fecharModalCompra();
        });

        document.getElementById('btn-cancelar-compra')?.addEventListener('click', () => {
            this.fecharModalCompra();
        });

        // Botões de controle de pontos
        document.getElementById('btn-aumentar-pontos')?.addEventListener('click', () => {
            this.aumentarPontosCompra();
            this.atualizarModalCompra();
        });

        document.getElementById('btn-diminuir-pontos')?.addEventListener('click', () => {
            this.diminuirPontosCompra();
            this.atualizarModalCompra();
        });

        // Confirmar compra
        document.getElementById('btn-confirmar-compra')?.addEventListener('click', () => {
            this.confirmarAprendizagem();
        });

        // Remover magia
        const btnRemover = document.getElementById('btn-remover-magia');
        if (btnRemover) {
            btnRemover.addEventListener('click', () => {
                if (this.magiaEditando) {
                    this.removerMagia(this.magiaEditando.id);
                    this.fecharModalCompra();
                }
            });
        }

        // Fechar ao clicar fora
        document.querySelector('#modal-magia-compra .modal-compra-overlay')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-compra-overlay')) {
                this.fecharModalCompra();
            }
        });
    }

    aumentarPontosCompra() {
        const custos = [1, 2, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52];
        const indexAtual = custos.indexOf(this.pontosSelecionados);
        
        if (indexAtual < custos.length - 1) {
            this.pontosSelecionados = custos[indexAtual + 1];
        }
    }

    diminuirPontosCompra() {
        const custos = [1, 2, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52];
        const indexAtual = custos.indexOf(this.pontosSelecionados);
        
        if (indexAtual > 0) {
            this.pontosSelecionados = custos[indexAtual - 1];
        }
    }

    atualizarModalCompra() {
        const magia = this.magiaSelecionada;
        if (!magia) return;

        const nhCalculado = this.calcularNH(magia, this.pontosSelecionados);
        
        const displayPontos = document.querySelector('.display-pontos');
        const nhElement = document.getElementById('nh-calculado');
        const detalhesElement = document.getElementById('nh-detalhes');
        const btnComprar = document.getElementById('btn-confirmar-compra');
        
        if (displayPontos) {
            displayPontos.textContent = `${this.pontosSelecionados} pontos`;
        }
        
        if (nhElement) {
            nhElement.textContent = nhCalculado;
        }
        
        if (detalhesElement) {
            const iq = this.obterIQ();
            const aptidao = this.obterAptidao();
            const bonus = this.calcularBonus(this.pontosSelecionados, magia.dificuldade);
            detalhesElement.textContent = `(IQ ${iq} + Apt ${aptidao} + ${bonus})`;
        }
        
        if (btnComprar) {
            const editando = !!this.magiaEditando;
            btnComprar.textContent = `${editando ? 'Atualizar' : 'Aprender'} por ${this.pontosSelecionados} pontos`;
        }
    }

    fecharModalCompra() {
        const modal = document.getElementById('modal-magia-compra');
        if (modal) modal.remove();
        this.magiaSelecionada = null;
        this.magiaEditando = null;
        this.pontosSelecionados = 1;
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
    }

    removerMagia(id) {
        this.magiasAprendidas = this.magiasAprendidas.filter(m => m.id !== id);
        this.atualizarInterface();
        this.salvarDados();
    }

    mostrarDetalhesMagiaModal(id) {
        if (typeof catalogoMagias === 'undefined') return;

        const magia = catalogoMagias.find(m => m.id === id);
        if (!magia) return;

        const modalHTML = `
            <div class="modal-compra-overlay" id="modal-detalhes-magia">
                <div class="modal-compra modal-detalhes">
                    <div class="modal-header">
                        <h3>Detalhes da Magia: ${magia.nome}</h3>
                        <button class="btn-fechar-modal" id="btn-fechar-detalhes">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="info-magia-detalhes">
                        ${this.gerarDetalhesTecnicos(magia)}
                    </div>
                    <div class="acoes-modal">
                        <button class="btn-cancelar" id="btn-fechar-detalhes2">Fechar</button>
                    </div>
                </div>
            </div>
        `;

        const modalExistente = document.getElementById('modal-detalhes-magia');
        if (modalExistente) modalExistente.remove();

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Configurar eventos do modal de detalhes
        document.getElementById('btn-fechar-detalhes')?.addEventListener('click', () => {
            this.fecharModalDetalhes();
        });
        
        document.getElementById('btn-fechar-detalhes2')?.addEventListener('click', () => {
            this.fecharModalDetalhes();
        });
        
        document.querySelector('#modal-detalhes-magia .modal-compra-overlay')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-compra-overlay')) {
                this.fecharModalDetalhes();
            }
        });
    }

    fecharModalDetalhes() {
        const modal = document.getElementById('modal-detalhes-magia');
        if (modal) modal.remove();
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

    atualizarInterface() {
        this.atualizarStatusMagico();
        this.atualizarListaAprendidas();
        this.filtrarCatalogo();
        this.atualizarDashboard();
    }

    atualizarListaAprendidas() {
        const container = document.getElementById('magias-aprendidas');
        const pontosTotal = this.magiasAprendidas.reduce((sum, m) => sum + (m.pontos || 0), 0);

        const pontosMagiaTotal = document.getElementById('pontos-magia-total');
        const totalGastoMagia = document.getElementById('total-gasto-magia');
        
        if (pontosMagiaTotal) {
            pontosMagiaTotal.textContent = `[${pontosTotal} pts]`;
        }
        if (totalGastoMagia) {
            totalGastoMagia.textContent = pontosTotal;
        }

        if (this.magiasAprendidas.length === 0) {
            if (container) {
                container.innerHTML = `
                    <div class="nenhuma-magia-aprendida">
                        <i class="fas fa-hat-wizard"></i>
                        <div>Nenhuma magia aprendida</div>
                        <small>As magias que você aprender aparecerão aqui</small>
                    </div>
                `;
            }
        } else {
            if (container) {
                container.innerHTML = this.magiasAprendidas.map(magia => `
                    <div class="magia-aprendida-item">
                        <div class="magia-aprendida-info">
                            <div class="magia-aprendida-nome">${magia.nome}</div>
                            <div class="magia-aprendida-detalhes">
                                NH ${magia.nivel || this.calcularNH(magia, magia.pontos)} | ${magia.pontos} pts | ${magia.custoMana} mana
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
    }

    atualizarDashboard() {
        const totalPontos = this.calcularTotalPontos();
        const gastoMagiasElement = document.getElementById('gastoMagias');
        
        if (gastoMagiasElement) {
            gastoMagiasElement.textContent = totalPontos;
        }
        
        if (typeof atualizarPontos === 'function') {
            setTimeout(() => {
                atualizarPontos();
            }, 100);
        }
    }

    calcularTotalPontos() {
        return this.magiasAprendidas.reduce((sum, magia) => sum + (magia.pontos || 0), 0);
    }

    configurarEventos() {
        const manaAtualInput = document.getElementById('mana-atual');
        if (manaAtualInput) {
            manaAtualInput.addEventListener('change', () => {
                this.atualizarMana();
            });
        }

        const bonusManaInput = document.getElementById('bonus-mana');
        if (bonusManaInput) {
            bonusManaInput.addEventListener('change', () => {
                this.atualizarStatusMagico();
            });
        }

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.filtro-grupo')) {
                document.querySelectorAll('.filtro-submenu.active').forEach(submenu => {
                    submenu.classList.remove('active');
                    const header = submenu.previousElementSibling;
                    if (header) {
                        const icon = header.querySelector('.fa-chevron-down, .fa-chevron-up');
                        if (icon) icon.className = 'fas fa-chevron-down';
                    }
                });
            }
        });

        const magiaTab = document.getElementById('magia');
        if (magiaTab) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'class') {
                        if (magiaTab.classList.contains('active')) {
                            setTimeout(() => {
                                this.atualizarStatusMagico();
                                this.filtrarCatalogo();
                            }, 50);
                        }
                    }
                });
            });
            
            observer.observe(magiaTab, { attributes: true });
        }
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

    formatarEscola(escola) {
        const escolas = {
            'agua': 'Água',
            'ar': 'Ar',
            'compreensao': 'Compreensão/Empatia',
            'controle-mente': 'Controle da Mente',
            'controle-corpo': 'Controle do Corpo',
            'cura': 'Cura',
            'deslocamento': 'Deslocamento',
            'fogo': 'Fogo',
            'luz-trevas': 'Luz e Trevas',
            'necromancia': 'Necromancia',
            'portal': 'Portal',
            'protecao': 'Proteção e Aviso',
            'reconhecimento': 'Reconhecimento',
            'terra': 'Terra',
            'metamagica': 'Metamágica'
        };
        return escolas[escola] || escola;
    }

    formatarClasse(classe) {
        const classes = {
            'comuns': 'Comuns',
            'area': 'Área',
            'toque': 'Toque',
            'projetil': 'Projétil',
            'bloqueio': 'Bloqueio',
            'informacao': 'Informação',
            'resistiveis': 'Resistíveis',
            'especiais': 'Especiais'
        };
        return classes[classe] || classe;
    }

    salvarDados() {
        try {
            const dados = {
                magiasAprendidas: this.magiasAprendidas,
                timestamp: new Date().getTime()
            };
            localStorage.setItem('sistemaMagia', JSON.stringify(dados));
        } catch (e) {
            // Silencioso em caso de erro
        }
    }

    carregarDadosSalvos() {
        try {
            const dadosSalvos = localStorage.getItem('sistemaMagia');
            if (dadosSalvos) {
                const dados = JSON.parse(dadosSalvos);
                if (dados.magiasAprendidas && Array.isArray(dados.magiasAprendidas)) {
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
    
    const magiaTab = document.getElementById('magia');
    if (magiaTab) {
        magiaTab.addEventListener('click', () => {
            setTimeout(() => {
                if (sistemaMagia && magiaTab.classList.contains('active')) {
                    sistemaMagia.atualizarStatusMagico();
                    sistemaMagia.filtrarCatalogo();
                }
            }, 100);
        });
    }
});

// ===== FUNÇÕES GLOBAIS PARA HTML =====
window.abrirModalAprendizagem = (id) => {
    if (sistemaMagia) sistemaMagia.abrirModalAprendizagem(id);
};

window.abrirModalEdicao = (id) => {
    if (sistemaMagia) sistemaMagia.abrirModalEdicao(id);
};

window.removerMagia = (id) => {
    if (sistemaMagia) sistemaMagia.removerMagia(id);
};

window.mostrarDetalhesMagia = (id) => {
    if (sistemaMagia) sistemaMagia.mostrarDetalhesMagia(id);
};

window.mostrarDetalhesMagiaModal = (id) => {
    if (sistemaMagia) sistemaMagia.mostrarDetalhesMagiaModal(id);
};

window.fecharModalDetalhes = () => {
    if (sistemaMagia) sistemaMagia.fecharModalDetalhes();
};

window.aumentarPontosCompra = () => {
    if (sistemaMagia) sistemaMagia.aumentarPontosCompra();
};

window.diminuirPontosCompra = () => {
    if (sistemaMagia) sistemaMagia.diminuirPontosCompra();
};

window.fecharModalCompra = () => {
    if (sistemaMagia) sistemaMagia.fecharModalCompra();
};

window.confirmarAprendizagem = () => {
    if (sistemaMagia) sistemaMagia.confirmarAprendizagem();
};

window.toggleSubmenu = (submenuId) => {
    if (sistemaMagia) sistemaMagia.toggleSubmenu(submenuId);
};

document.addEventListener('DOMContentLoaded', function() {
    if (typeof inicializarAtributos === 'function') {
        inicializarAtributos();
    }
    
    sistemaMagia = new SistemaMagia();
    window.sistemaMagia = sistemaMagia;
    
    const tabLinks = document.querySelectorAll('.tab-link');
    tabLinks.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            if (tabId === 'magia') {
                setTimeout(() => {
                    if (sistemaMagia) {
                        sistemaMagia.atualizarStatusMagico();
                        sistemaMagia.filtrarCatalogo();
                    }
                }, 200);
            }
        });
    });
});
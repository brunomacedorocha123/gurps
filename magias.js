// ===== SISTEMA CORE DE MAGIA - VERSÃO 100% FUNCIONAL =====
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
        
        // Forçar atualização inicial
        setTimeout(() => {
            this.atualizarStatusMagico();
            this.filtrarCatalogo();
            console.log('✅ Sistema de Magia Inicializado!');
        }, 100);
    }

    // ===== CONFIGURAÇÃO DOS FILTROS (MÉTODO CORRETO) =====
    configurarFiltrosManualmente() {
        // Remove qualquer evento anterior
        document.querySelectorAll('.filtro-header').forEach(header => {
            const newHeader = header.cloneNode(true);
            header.parentNode.replaceChild(newHeader, header);
        });

        // Adiciona eventos aos filtros
        setTimeout(() => {
            // Configurar "Escolas de Magia"
            const headerEscolas = document.querySelector('.filtro-header[onclick*="escolas-submenu"]');
            if (headerEscolas) {
                headerEscolas.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleSubmenu('escolas-submenu');
                });
            }

            // Configurar "Classes de Magia"
            const headerClasses = document.querySelector('.filtro-header[onclick*="classes-submenu"]');
            if (headerClasses) {
                headerClasses.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleSubmenu('classes-submenu');
                });
            }

            // Configurar checkbox "Todas as Escolas"
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

            // Configurar checkbox "Todas as Classes"
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

            // Configurar checkboxes individuais
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

            // Configurar busca
            const buscaInput = document.getElementById('busca-magias');
            if (buscaInput) {
                buscaInput.addEventListener('input', () => {
                    this.filtrarCatalogo();
                });
            }

            console.log('✅ Filtros configurados!');
        }, 150);
    }

    toggleSubmenu(submenuId) {
        const submenu = document.getElementById(submenuId);
        if (!submenu) return;

        // Fechar outros submenus
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

        // Alternar submenu atual
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

    // ===== OBSERVAÇÃO DE ATRIBUTOS EM TEMPO REAL =====
    configurarObservadorAtributosMagia() {
        // Observar mudanças no IQ
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

        // Observar mudanças no HT
        const htInput = document.getElementById('HT');
        if (htInput) {
            htInput.addEventListener('input', () => {
                clearTimeout(this.htTimeout);
                this.htTimeout = setTimeout(() => {
                    this.atualizarStatusMagico();
                }, 300);
            });
        }

        // Observar mudanças na Aptidão Mágica
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

        // Observar botões +/- dos atributos
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

    // ===== ATUALIZAÇÃO DO STATUS MÁGICO =====
    atualizarStatusMagico() {
        const iq = this.obterIQ();
        const ht = this.obterHT();
        
        // Atualizar IQ Mágico
        const iqMagicoElem = document.getElementById('iq-magico');
        if (iqMagicoElem) {
            iqMagicoElem.textContent = iq;
        }
        
        // Atualizar Mana Base
        const manaBaseElem = document.getElementById('mana-base');
        if (manaBaseElem) {
            manaBaseElem.textContent = ht;
        }
        
        // Ajustar Mana Atual se necessário
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

    // ===== FILTRAGEM DO CATÁLOGO =====
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
            console.error('❌ Catálogo de magias não carregado!');
            return;
        }

        const buscaInput = document.getElementById('busca-magias');
        const termoBusca = buscaInput ? buscaInput.value.toLowerCase().trim() : '';

        const escolasSelecionadas = this.obterEscolasSelecionadas();
        const classesSelecionadas = this.obterClassesSelecionadas();

        const magiasFiltradas = catalogoMagias.filter(magia => {
            // Filtro por busca
            if (termoBusca && termoBusca.length > 0) {
                const nomeMatch = magia.nome.toLowerCase().includes(termoBusca);
                const descMatch = magia.descricao.toLowerCase().includes(termoBusca);
                if (!nomeMatch && !descMatch) {
                    return false;
                }
            }

            // Filtro por escola (se houver seleção)
            if (escolasSelecionadas.length > 0 && !escolasSelecionadas.includes(magia.escola)) {
                return false;
            }

            // Filtro por classe (se houver seleção)
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

    // ===== MÉTODOS DE OBTER VALORES =====
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

    // ===== CÁLCULOS DE NH =====
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

    // ===== MODAIS =====
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

        // Remove modal existente
        const modalExistente = document.getElementById('modal-magia-compra');
        if (modalExistente) modalExistente.remove();

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

    // ===== DETALHES DA MAGIA =====
    mostrarDetalhesMagiaModal(id) {
        if (typeof catalogoMagias === 'undefined') return;

        const magia = catalogoMagias.find(m => m.id === id);
        if (!magia) return;

        const modalHTML = `
            <div class="modal-compra-overlay" id="modal-detalhes-magia">
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

        const modalExistente = document.getElementById('modal-detalhes-magia');
        if (modalExistente) modalExistente.remove();

        document.body.insertAdjacentHTML('beforeend', modalHTML);
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

        // ===== ATUALIZAÇÃO DA INTERFACE =====
    atualizarInterface() {
        this.atualizarStatusMagico();
        this.atualizarListaAprendidas();
        this.filtrarCatalogo();
        this.atualizarDashboard();
    }

    atualizarListaAprendidas() {
        const container = document.getElementById('magias-aprendidas');
        const pontosTotal = this.magiasAprendidas.reduce((sum, m) => sum + (m.pontos || 0), 0);

        // Atualizar pontos totais
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
        
        // Chamar função global de atualização de pontos se existir
        if (typeof atualizarPontos === 'function') {
            setTimeout(() => {
                atualizarPontos();
            }, 100);
        }
    }

    calcularTotalPontos() {
        return this.magiasAprendidas.reduce((sum, magia) => sum + (magia.pontos || 0), 0);
    }

    // ===== CONFIGURAÇÃO DE EVENTOS ADICIONAIS =====
    configurarEventos() {
        // Evento para Mana Atual
        const manaAtualInput = document.getElementById('mana-atual');
        if (manaAtualInput) {
            manaAtualInput.addEventListener('change', () => {
                this.atualizarMana();
            });
        }

        // Evento para Bônus de Mana
        const bonusManaInput = document.getElementById('bonus-mana');
        if (bonusManaInput) {
            bonusManaInput.addEventListener('change', () => {
                this.atualizarStatusMagico();
            });
        }

        // Fechar submenus ao clicar fora
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

        // Observar mudanças de aba
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

    // ===== FORMATAÇÃO =====
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

    // ===== PERSISTÊNCIA =====
    salvarDados() {
        try {
            const dados = {
                magiasAprendidas: this.magiasAprendidas,
                timestamp: new Date().getTime()
            };
            localStorage.setItem('sistemaMagia', JSON.stringify(dados));
        } catch (e) {
            console.error('Erro ao salvar dados:', e);
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
            console.error('Erro ao carregar dados:', e);
            localStorage.removeItem('sistemaMagia');
        }
    }
}

// ===== INICIALIZAÇÃO GLOBAL =====
let sistemaMagia;

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar sistema de magia
    sistemaMagia = new SistemaMagia();
    window.sistemaMagia = sistemaMagia;
    
    // Configurar eventos de aba
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
    
    console.log('🎯 Sistema de Magia Inicializado com Sucesso!');
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

// Função para toggle submenu (usada no HTML)
window.toggleSubmenu = (submenuId) => {
    if (sistemaMagia) sistemaMagia.toggleSubmenu(submenuId);
};

// ... todo o código anterior do SistemaMagia que já te enviei ...

// ===== INICIALIZAÇÃO DE ATRIBUTOS COM OBSERVADOR DE MAGIA =====
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar sistema de atributos se existir
    if (typeof inicializarAtributos === 'function') {
        inicializarAtributos();
    }
    
    // Inicializar sistema de magia
    sistemaMagia = new SistemaMagia();
    window.sistemaMagia = sistemaMagia;
    
    // Adicionar evento de clique nas abas
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
    
    console.log('🚀 Sistema Completo Inicializado!');
    console.log('✅ IQ Mágico: Tempo Real');
    console.log('✅ Mana Base: Tempo Real');
    console.log('✅ Filtros: Funcionando');
    console.log('✅ NHs: Atualizando Automaticamente');
});

// ===== FUNÇÃO DE DEBUG PARA TESTES =====
function debugSistemaMagia() {
    if (!sistemaMagia) {
        console.log('❌ Sistema de magia não inicializado');
        return;
    }
    
    console.log('=== DEBUG SISTEMA MAGIA ===');
    console.log('IQ Atual:', sistemaMagia.obterIQ());
    console.log('HT Atual:', sistemaMagia.obterHT());
    console.log('Aptidão:', sistemaMagia.obterAptidao());
    console.log('Magias Aprendidas:', sistemaMagia.magiasAprendidas.length);
    console.log('Escolas selecionadas:', sistemaMagia.obterEscolasSelecionadas());
    console.log('Classes selecionadas:', sistemaMagia.obterClassesSelecionadas());
    console.log('===========================');
}

// Expor função de debug para console
window.debugMagia = debugSistemaMagia;
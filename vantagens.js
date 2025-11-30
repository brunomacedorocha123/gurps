// vantagens-completo.js - SISTEMA COM MODAIS PARA TODAS AS VANTAGENS
class SistemaVantagensCompleto {
    constructor() {
        this.vantagensAdquiridas = [];
        this.catalogo = window.VANTAGENS_CATALOGO || {};
        this.filtroCategoria = 'todas';
        this.termoBusca = '';
        
        this.inicializar();
    }

    // INICIALIZAR SISTEMA
    inicializar() {
        console.log('🎯 Iniciando Sistema de Vantagens Completo...');
        this.injetarEstilosModais();
        this.configurarEventos();
        this.carregarDados();
        this.mostrarVantagensDisponiveis();
        this.atualizarVantagensAdquiridas();
        this.atualizarResumoPontos();
    }

    // CONFIGURAR EVENTOS
    configurarEventos() {
        // Busca e filtros
        const buscaInput = document.getElementById('busca-vantagens');
        const categoriaSelect = document.getElementById('categoria-vantagens');
        
        if (buscaInput) {
            buscaInput.addEventListener('input', (e) => {
                this.termoBusca = e.target.value.toLowerCase();
                this.mostrarVantagensDisponiveis();
            });
        }
        
        if (categoriaSelect) {
            categoriaSelect.addEventListener('change', (e) => {
                this.filtroCategoria = e.target.value;
                this.mostrarVantagensDisponiveis();
            });
        }

        // Cliques dinâmicos
        document.addEventListener('click', (e) => this.manipularClique(e));
    }

    // MANIPULAR CLICKS
    manipularClique(e) {
        // Botão adicionar vantagem
        if (e.target.classList.contains('btn-adicionar')) {
            const id = e.target.dataset.id;
            this.adicionarVantagem(id);
        }
        
        // Botão remover vantagem
        if (e.target.classList.contains('btn-remover')) {
            const id = e.target.dataset.id;
            this.removerVantagem(id);
        }
        
        // Fechar modal
        if (e.target.classList.contains('btn-fechar-modal') || e.target.classList.contains('btn-cancelar')) {
            this.fecharModal();
        }
        
        // Confirmar compra no modal
        if (e.target.classList.contains('btn-confirmar-compra')) {
            this.confirmarCompraModal(e.target.closest('.modal-vantagem'));
        }
    }

    // ADICIONAR VANTAGEM (com modal quando necessário)
    adicionarVantagem(id) {
        const vantagem = this.catalogo[id];
        if (!vantagem) return;

        // Verificar se já tem
        if (this.vantagensAdquiridas.some(v => v.baseId === id)) {
            this.mostrarFeedback('⚠️ Você já possui esta vantagem');
            return;
        }

        // Abrir modal para vantagens complexas
        if (this.vantagemPrecisaModal(vantagem)) {
            this.abrirModalConfiguracao(vantagem);
        } else {
            // Vantagem simples - adicionar direto
            this.adicionarVantagemSimples(vantagem);
        }
    }

    // VERIFICAR SE PRECISA DE MODAL
    vantagemPrecisaModal(vantagem) {
        return [
            'comOpcoes',
            'niveisProgressivos', 
            'comNiveis',
            'comNiveisAmpliacoes',
            'aliados'
        ].includes(vantagem.template);
    }

    // ABRIR MODAL DE CONFIGURAÇÃO
    abrirModalConfiguracao(vantagem) {
        const modal = this.criarModal(vantagem);
        document.body.appendChild(modal);
        
        // Animação de entrada
        setTimeout(() => modal.classList.add('show'), 10);
        
        // Configurar eventos do modal
        this.configurarEventosModal(modal, vantagem);
    }

    // CRIAR MODAL BASE
    criarModal(vantagem) {
        const modal = document.createElement('div');
        modal.className = 'modal-vantagem';
        modal.innerHTML = this.gerarConteudoModal(vantagem);
        return modal;
    }

    // GERAR CONTEÚDO DO MODAL
    gerarConteudoModal(vantagem) {
        const iconeCategoria = this.obterIconeCategoria(vantagem.categoria);
        
        return `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${iconeCategoria} ${vantagem.nome}</h3>
                    <button class="btn-fechar-modal">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="vantagem-info">
                        <div class="descricao">${vantagem.descricao}</div>
                    </div>
                    
                    ${this.gerarSecoesConfiguracao(vantagem)}
                    
                    <div class="resumo-custo">
                        <div class="custo-final">
                            <strong>Custo Final: <span id="custoCalculado">0</span> pontos</strong>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-cancelar">Cancelar</button>
                    <button class="btn-confirmar-compra">Adquirir</button>
                </div>
            </div>
        `;
    }

    // GERAR SEÇÕES DE CONFIGURAÇÃO
    gerarSecoesConfiguracao(vantagem) {
        let conteudo = '';
        
        switch(vantagem.template) {
            case 'comOpcoes':
                conteudo = this.gerarSecaoOpcoes(vantagem);
                break;
            case 'niveisProgressivos':
                conteudo = this.gerarSecaoNiveisProgressivos(vantagem);
                break;
            case 'comNiveis':
                conteudo = this.gerarSecaoNiveisSimples(vantagem);
                break;
            case 'aliados':
                conteudo = this.gerarSecaoAliados(vantagem);
                break;
        }
        
        return conteudo;
    }

    // SEÇÃO PARA VANTAGENS COM OPÇÕES (Abençoado, etc)
    gerarSecaoOpcoes(vantagem) {
        return `
            <div class="config-secao">
                <h4>📋 Opções Disponíveis</h4>
                <div class="lista-opcoes">
                    ${vantagem.opcoes.map((opcao, index) => `
                        <div class="opcao-item">
                            <label class="radio-container">
                                <input type="radio" name="opcao_vantagem" value="${opcao.custo}" 
                                       data-opcao='${JSON.stringify(opcao).replace(/'/g, "&apos;")}'
                                       ${index === 0 ? 'checked' : ''}>
                                <span class="radiomark"></span>
                                <div class="opcao-info">
                                    <strong>${opcao.nome}</strong>
                                    <div class="opcao-custo">${opcao.custo} pontos</div>
                                    <div class="opcao-descricao">${opcao.descricao}</div>
                                </div>
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // SEÇÃO PARA NÍVEIS PROGRESSIVOS (Aptidão Mágica, Sorte, etc)
    gerarSecaoNiveisProgressivos(vantagem) {
        return `
            <div class="config-secao">
                <h4>📊 Níveis Disponíveis</h4>
                <div class="controle-niveis">
                    <label>Selecione o nível desejado:</label>
                    <select class="controle-config" id="selectNivelProgressivo">
                        ${vantagem.niveis.map((nivel, index) => `
                            <option value="${index}" data-nivel='${JSON.stringify(nivel).replace(/'/g, "&apos;")}'>
                                ${nivel.nome} - ${nivel.custo} pontos
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div id="descricaoNivel" class="descricao-opcao">
                    ${vantagem.niveis[0].descricao}
                </div>
            </div>
        `;
    }

    // CONTINUA NA PARTE 2...
        // SEÇÃO PARA NÍVEIS SIMPLES (Carisma, Destemor, etc)
    gerarSecaoNiveisSimples(vantagem) {
        return `
            <div class="config-secao">
                <h4>📈 Níveis</h4>
                <div class="controle-niveis">
                    <label>Níveis desejados (1-${vantagem.niveisMax}):</label>
                    <select class="controle-config" id="selectNiveisSimples">
                        ${Array.from({length: vantagem.niveisMax}, (_, i) => `
                            <option value="${i + 1}">
                                ${i + 1} nível${i > 0 ? 's' : ''} - ${vantagem.custoBase * (i + 1)} pontos
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>
        `;
    }

    // SEÇÃO PARA ALIADOS (Sistema Complexo)
    gerarSecaoAliados(vantagem) {
        return `
            <div class="config-secao">
                <h4>👤 Poder do Aliado</h4>
                <div class="controle-aliados">
                    <select class="controle-config" id="selectPoderAliado">
                        ${vantagem.niveisPoder.map(nivel => `
                            <option value="${nivel.custo}" data-poder='${JSON.stringify(nivel).replace(/'/g, "&apos;")}'>
                                ${nivel.valor} - ${nivel.custo} ponto${nivel.custo > 1 ? 's' : ''}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>
            
            <div class="config-secao">
                <h4>🕒 Frequência de Aparição</h4>
                <div class="controle-aliados">
                    <select class="controle-config" id="selectFrequenciaAliado">
                        ${vantagem.niveisFrequencia.map(freq => `
                            <option value="${freq.multiplicador}" data-frequencia='${JSON.stringify(freq).replace(/'/g, "&apos;")}'>
                                ${freq.valor} (×${freq.multiplicador})
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>
            
            <div class="config-secao">
                <h4>👥 Grupo de Aliados</h4>
                <div class="controle-aliados">
                    <select class="controle-config" id="selectGrupoAliado">
                        ${vantagem.opcoesGrupo.map(grupo => `
                            <option value="${grupo.multiplicador}" data-grupo='${JSON.stringify(grupo).replace(/'/g, "&apos;")}'>
                                ${grupo.valor === 'unico' ? 'Aliado Único' : `Grupo ${grupo.valor}`} (×${grupo.multiplicador})
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>
        `;
    }

    // CONFIGURAR EVENTOS DO MODAL
    configurarEventosModal(modal, vantagem) {
        // Atualizar custo quando mudar configurações
        const atualizarCusto = () => this.atualizarCustoModal(modal, vantagem);
        
        // Ouvir mudanças nos controles
        modal.querySelectorAll('input, select').forEach(controle => {
            controle.addEventListener('change', atualizarCusto);
        });
        
        // Calcular custo inicial
        atualizarCusto();
    }

    // ATUALIZAR CUSTO NO MODAL
    atualizarCustoModal(modal, vantagem) {
        let custoFinal = 0;
        
        switch(vantagem.template) {
            case 'comOpcoes':
                custoFinal = this.calcularCustoOpcoes(modal);
                break;
            case 'niveisProgressivos':
                custoFinal = this.calcularCustoNiveisProgressivos(modal);
                break;
            case 'comNiveis':
                custoFinal = this.calcularCustoNiveisSimples(modal, vantagem);
                break;
            case 'aliados':
                custoFinal = this.calcularCustoAliados(modal);
                break;
        }
        
        modal.querySelector('#custoCalculado').textContent = custoFinal;
    }

    // CÁLCULOS DE CUSTO
    calcularCustoOpcoes(modal) {
        const opcaoSelecionada = modal.querySelector('input[name="opcao_vantagem"]:checked');
        return opcaoSelecionada ? parseInt(opcaoSelecionada.value) : 0;
    }

    calcularCustoNiveisProgressivos(modal) {
        const select = modal.querySelector('#selectNivelProgressivo');
        const nivelIndex = parseInt(select.value);
        const nivel = JSON.parse(select.options[select.selectedIndex].dataset.nivel);
        return nivel.custo;
    }

    calcularCustoNiveisSimples(modal, vantagem) {
        const select = modal.querySelector('#selectNiveisSimples');
        const niveis = parseInt(select.value);
        return vantagem.custoBase * niveis;
    }

    calcularCustoAliados(modal) {
        const poder = parseFloat(modal.querySelector('#selectPoderAliado').value);
        const frequencia = parseFloat(modal.querySelector('#selectFrequenciaAliado').value);
        const grupo = parseFloat(modal.querySelector('#selectGrupoAliado').value);
        
        return Math.round(poder * frequencia * grupo);
    }

    // CONFIRMAR COMPRA NO MODAL
    confirmarCompraModal(modal) {
        const vantagem = this.obterVantagemDoModal(modal);
        if (!vantagem) return;

        const configuracao = this.obterConfiguracaoDoModal(modal, vantagem);
        const custoFinal = parseInt(modal.querySelector('#custoCalculado').textContent);

        const vantagemAdquirida = {
            id: `${vantagem.id}_${Date.now()}`,
            baseId: vantagem.id,
            nome: configuracao.nome,
            custo: custoFinal,
            categoria: vantagem.categoria,
            descricao: vantagem.descricao,
            configuracoes: configuracao.configs,
            dataAdquisicao: new Date()
        };

        this.vantagensAdquiridas.push(vantagemAdquirida);
        this.fecharModal();
        this.atualizarTudo();
        this.mostrarFeedback(`✅ ${vantagemAdquirida.nome} adquirida por ${custoFinal} pontos!`);
    }

    // OBTER VANTAGEM DO MODAL
    obterVantagemDoModal(modal) {
        const nomeVantagem = modal.querySelector('.modal-header h3').textContent.replace(/[🧠💪👥🦸✅📝]/g, '').trim();
        return Object.values(this.catalogo).find(v => v.nome === nomeVantagem);
    }

    // OBTER CONFIGURAÇÃO DO MODAL
    obterConfiguracaoDoModal(modal, vantagem) {
        let nome = vantagem.nome;
        let configs = {};

        switch(vantagem.template) {
            case 'comOpcoes':
                const opcaoSelecionada = modal.querySelector('input[name="opcao_vantagem"]:checked');
                const opcao = JSON.parse(opcaoSelecionada.dataset.opcao);
                nome = `${vantagem.nome} (${opcao.nome})`;
                configs = { opcao: opcao };
                break;

            case 'niveisProgressivos':
                const selectNivel = modal.querySelector('#selectNivelProgressivo');
                const nivel = JSON.parse(selectNivel.options[selectNivel.selectedIndex].dataset.nivel);
                nome = `${vantagem.nome} ${nivel.nome}`;
                configs = { nivel: nivel };
                break;

            case 'comNiveis':
                const niveis = parseInt(modal.querySelector('#selectNiveisSimples').value);
                nome = `${vantagem.nome} (Nível ${niveis})`;
                configs = { niveis: niveis };
                break;

            case 'aliados':
                const poder = JSON.parse(modal.querySelector('#selectPoderAliado').selectedOptions[0].dataset.poder);
                const frequencia = JSON.parse(modal.querySelector('#selectFrequenciaAliado').selectedOptions[0].dataset.frequencia);
                const grupo = JSON.parse(modal.querySelector('#selectGrupoAliado').selectedOptions[0].dataset.grupo);
                nome = `${vantagem.nome} (${poder.valor}, ${frequencia.valor}${grupo.valor !== 'unico' ? `, ${grupo.valor}` : ''})`;
                configs = { poder, frequencia, grupo };
                break;
        }

        return { nome, configs };
    }

    // FECHAR MODAL
    fecharModal() {
        const modal = document.querySelector('.modal-vantagem');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        }
    }

    // CONTINUA NA PARTE 3...
        // ADICIONAR VANTAGEM SIMPLES (sem modal)
    adicionarVantagemSimples(vantagem) {
        const vantagemAdquirida = {
            id: `${vantagem.id}_${Date.now()}`,
            baseId: vantagem.id,
            nome: vantagem.nome,
            custo: vantagem.custo || vantagem.custoBase || 0,
            categoria: vantagem.categoria,
            descricao: vantagem.descricao,
            dataAdquisicao: new Date()
        };

        this.vantagensAdquiridas.push(vantagemAdquirida);
        this.atualizarTudo();
        this.mostrarFeedback(`✅ ${vantagem.nome} adquirida!`);
    }

    // REMOVER VANTAGEM
    removerVantagem(id) {
        const index = this.vantagensAdquiridas.findIndex(v => v.id === id);
        if (index !== -1) {
            const vantagemRemovida = this.vantagensAdquiridas[index];
            this.vantagensAdquiridas.splice(index, 1);
            this.atualizarTudo();
            this.mostrarFeedback(`🗑️ ${vantagemRemovida.nome} removida`);
        }
    }

    // MÉTODOS DE ATUALIZAÇÃO (iguais ao anterior)
    mostrarVantagensDisponiveis() {
        const lista = document.getElementById('lista-vantagens');
        if (!lista) return;

        const vantagensFiltradas = Object.values(this.catalogo).filter(vantagem => {
            const matchBusca = !this.termoBusca || 
                vantagem.nome.toLowerCase().includes(this.termoBusca) ||
                vantagem.descricao.toLowerCase().includes(this.termoBusca);
            
            const matchCategoria = this.filtroCategoria === 'todas' || 
                vantagem.categoria === this.filtroCategoria;
            
            return matchBusca && matchCategoria;
        });

        if (vantagensFiltradas.length === 0) {
            lista.innerHTML = '<div class="lista-vazia">Nenhuma vantagem encontrada</div>';
            return;
        }

        lista.innerHTML = vantagensFiltradas.map(vantagem => this.criarCardVantagem(vantagem)).join('');
    }

    criarCardVantagem(vantagem) {
        const custoTexto = this.obterTextoCusto(vantagem);
        const jaAdquirida = this.vantagensAdquiridas.some(v => v.baseId === vantagem.id);
        const botaoTexto = jaAdquirida ? '✓ Adquirida' : '+ Adquirir';
        const botaoClasse = jaAdquirida ? 'btn-adquirido' : 'btn-adicionar';
        const disabled = jaAdquirida ? 'disabled' : '';

        return `
            <div class="lista-item">
                <div class="item-info">
                    <strong>${this.obterIconeCategoria(vantagem.categoria)} ${vantagem.nome}</strong>
                    <div class="item-custo">${custoTexto}</div>
                    <div class="item-descricao">${vantagem.descricao}</div>
                    ${this.obterBadgesExtras(vantagem)}
                </div>
                <button class="${botaoClasse}" data-id="${vantagem.id}" ${disabled}>
                    ${botaoTexto}
                </button>
            </div>
        `;
    }

    // MÉTODOS AUXILIARES (iguais ao anterior)
    obterTextoCusto(vantagem) {
        if (vantagem.template === 'niveisProgressivos') {
            const custos = vantagem.niveis.map(n => n.custo).join('/');
            return `${custos} pts`;
        } else if (vantagem.template === 'comNiveis') {
            return `${vantagem.custoBase}/nível pts`;
        } else if (vantagem.template === 'comOpcoes') {
            return 'Varia';
        } else if (vantagem.template === 'aliados') {
            return 'Variável';
        } else {
            return `${vantagem.custo || vantagem.custoBase} pts`;
        }
    }

    obterIconeCategoria(categoria) {
        const icones = {
            'mental_sobrenatural': '🧠',
            'fisica': '💪', 
            'social': '👥',
            'supers': '🦸',
            'mental': '🧠'
        };
        return icones[categoria] || '✅';
    }

    obterBadgesExtras(vantagem) {
        const badges = [];
        
        if (['comOpcoes', 'niveisProgressivos', 'comNiveis', 'aliados'].includes(vantagem.template)) {
            badges.push(`<span class="badge-configuravel">Configurável</span>`);
        }
        
        return badges.length > 0 ? 
            `<div class="badges-container">${badges.join('')}</div>` : '';
    }

    atualizarVantagensAdquiridas() {
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
            totalPontos += vantagem.custo;
            
            const item = document.createElement('div');
            item.className = 'item-adquirido';
            item.innerHTML = `
                <div class="item-info">
                    <strong>${this.obterIconeCategoria(vantagem.categoria)} ${vantagem.nome}</strong>
                    <div class="item-custo">+${vantagem.custo} pts</div>
                    <div class="item-descricao">${vantagem.descricao}</div>
                </div>
                <button class="btn-remover" data-id="${vantagem.id}">×</button>
            `;
            lista.appendChild(item);
        });
        
        totalElement.textContent = `${totalPontos} pts`;
    }

    atualizarResumoPontos() {
        const totalVantagens = document.getElementById('total-vantagens');
        const saldoTotal = document.getElementById('saldo-total');
        
        if (!totalVantagens || !saldoTotal) return;
        
        const pontosVantagens = this.vantagensAdquiridas.reduce((total, v) => total + v.custo, 0);
        
        totalVantagens.textContent = `+${pontosVantagens}`;
        saldoTotal.textContent = pontosVantagens;
        saldoTotal.style.color = pontosVantagens > 0 ? '#27ae60' : '#ffd700';
    }

    atualizarTudo() {
        this.mostrarVantagensDisponiveis();
        this.atualizarVantagensAdquiridas();
        this.atualizarResumoPontos();
        this.salvarDados();
    }

    // MÉTODOS DE PERSISTÊNCIA
    salvarDados() {
        const dados = {
            vantagensAdquiridas: this.vantagensAdquiridas,
            timestamp: new Date().toISOString()
        };
        
        try {
            localStorage.setItem('gurpsVantagens', JSON.stringify(dados));
        } catch (e) {
            console.error('❌ Erro ao salvar dados:', e);
        }
    }

    carregarDados() {
        try {
            const dadosSalvos = localStorage.getItem('gurpsVantagens');
            if (dadosSalvos) {
                const dados = JSON.parse(dadosSalvos);
                this.vantagensAdquiridas = dados.vantagensAdquiridas || [];
                console.log('📂 Dados carregados:', this.vantagensAdquiridas.length, 'vantagens');
            }
        } catch (e) {
            console.error('❌ Erro ao carregar dados:', e);
            this.vantagensAdquiridas = [];
        }
    }

    mostrarFeedback(mensagem) {
        const feedback = document.createElement('div');
        feedback.className = 'feedback-message';
        feedback.textContent = mensagem;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 3000);
    }

    // INJETAR ESTILOS DOS MODAIS
    injetarEstilosModais() {
        const styles = `
            /* MODAIS */
            .modal-vantagem {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s;
            }
            
            .modal-vantagem.show {
                opacity: 1;
            }
            
            .modal-content {
                background: #1e1e28;
                border: 2px solid #ff8c00;
                border-radius: 12px;
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
                transform: translateY(-20px);
                transition: transform 0.3s;
            }
            
            .modal-vantagem.show .modal-content {
                transform: translateY(0);
            }
            
            .modal-header {
                background: linear-gradient(135deg, #2c3e50, #34495e);
                color: #ffd700;
                padding: 20px;
                border-bottom: 1px solid #ff8c00;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h3 {
                margin: 0;
                font-size: 1.3em;
            }
            
            .btn-fechar-modal {
                background: none;
                border: none;
                color: #ffd700;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-body {
                padding: 20px;
                background: #2c3e50;
            }
            
            .config-secao {
                margin-bottom: 20px;
                padding: 15px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                border-left: 4px solid #ff8c00;
            }
            
            .config-secao h4 {
                margin: 0 0 15px 0;
                color: #ffd700;
                font-size: 1.1em;
            }
            
            .controle-config {
                width: 100%;
                padding: 10px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid #ff8c00;
                border-radius: 6px;
                color: #ffd700;
                font-size: 1em;
            }
            
            .lista-opcoes {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .opcao-item {
                padding: 12px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 140, 0, 0.3);
                border-radius: 6px;
                transition: all 0.3s ease;
            }
            
            .opcao-item:hover {
                border-color: #ff8c00;
                background: rgba(255, 140, 0, 0.1);
            }
            
            .radio-container {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                cursor: pointer;
            }
            
            .opcao-info {
                flex: 1;
            }
            
            .opcao-info strong {
                color: #ffd700;
                display: block;
                margin-bottom: 5px;
            }
            
            .opcao-custo {
                color: #27ae60;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .opcao-descricao {
                color: #95a5a6;
                font-size: 0.9em;
                line-height: 1.3;
            }
            
            .descricao-opcao {
                color: #95a5a6;
                font-size: 0.9em;
                margin-top: 10px;
                padding: 10px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 4px;
            }
            
            .resumo-custo {
                background: rgba(39, 174, 96, 0.1);
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                margin-top: 20px;
                border: 1px solid rgba(39, 174, 96, 0.3);
            }
            
            .custo-final {
                font-size: 1.2em;
                color: #ffd700;
            }
            
            .modal-footer {
                padding: 20px;
                background: #34495e;
                border-top: 1px solid #ff8c00;
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }
            
            .btn-cancelar, .btn-confirmar-compra {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            
            .btn-cancelar {
                background: #95a5a6;
                color: white;
            }
            
            .btn-confirmar-compra {
                background: linear-gradient(45deg, #27ae60, #2ecc71);
                color: white;
            }
            
            .btn-cancelar:hover {
                background: #7f8c8d;
            }
            
            .btn-confirmar-compra:hover {
                background: linear-gradient(45deg, #219653, #27ae60);
                transform: translateY(-2px);
            }
            
            /* BADGES */
            .badges-container {
                margin-top: 8px;
                display: flex;
                gap: 5px;
            }
            
            .badge-configuravel {
                background: rgba(155, 89, 182, 0.2);
                color: #9b59b6;
                padding: 3px 8px;
                border-radius: 10px;
                font-size: 0.75em;
                border: 1px solid rgba(155, 89, 182, 0.3);
            }
            
            /* ANIMAÇÕES */
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
}

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', function() {
    if (!window.VANTAGENS_CATALOGO) {
        console.error('❌ Catálogo de vantagens não encontrado!');
        return;
    }
    
    setTimeout(() => {
        window.sistemaVantagens = new SistemaVantagensCompleto();
        console.log('🎉 Sistema de Vantagens Completo inicializado!');
    }, 100);
});
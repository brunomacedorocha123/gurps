// ====== CONFIGURAÇÕES DO SUPABASE ======
const SUPABASE_URL = 'https://pujufdfhaxveuytkneqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1anVmZGZoYXh2ZXV5dGtuZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTkyODksImV4cCI6MjA3OTkzNTI4OX0.mzOwsmf8qIQ4HZqnXLEmq4D7M6fz4VH1YWpWP-BsFvc';

// Inicializar Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ====== ESTADO GLOBAL ======
let dadosPersonagem = null;
let dadosCampanha = null;
let dadosAoVivo = null;
let intervaloAtualizacao = null;
let modoVisualizacao = 'instantaneo';
let autoAtualizar = true;
let intervaloAtualizacaoMs = 30000;

// IDs da URL
let personagemId = null;
let campanhaId = null;
let vinculoId = null;
let gmId = null;

// ====== CLASSE PRINCIPAL ======
class SistemaFichaGM {
    constructor() {
        this.init();
    }

    async init() {
        try {
            // 1. Verificar autenticação
            await this.verificarAutenticacao();
            
            // 2. Pegar parâmetros da URL
            this.extrairParametrosURL();
            
            // 3. Configurar interface
            this.configurarEventListeners();
            
            // 4. Carregar dados iniciais
            await this.carregarDadosIniciais();
            
            // 5. Iniciar atualização automática se habilitado
            if (autoAtualizar) {
                this.iniciarAtualizacaoAutomatica();
            }
            
            // 6. Esconder loading
            this.esconderLoading();
            
        } catch (error) {
            console.error('Erro na inicialização:', error);
            this.mostrarMensagem(`Erro: ${error.message}`, 'erro');
            this.esconderLoading();
        }
    }

    // ====== MÉTODOS DE AUTENTICAÇÃO ======
    async verificarAutenticacao() {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            window.location.href = 'login.html';
            throw new Error('Não autenticado');
        }
        
        gmId = session.user.id;
        console.log('GM autenticado:', gmId);
    }

    extrairParametrosURL() {
        const urlParams = new URLSearchParams(window.location.search);
        
        personagemId = urlParams.get('personagem');
        campanhaId = urlParams.get('campanha');
        vinculoId = urlParams.get('vinculo');
        
        if (!personagemId || !campanhaId) {
            throw new Error('Parâmetros da URL inválidos');
        }
        
        console.log('IDs extraídos:', { personagemId, campanhaId, vinculoId });
    }

    // ====== CONFIGURAÇÃO DE EVENTOS ======
    configurarEventListeners() {
        // Tabs de navegação
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = e.currentTarget.dataset.tab;
                this.mudarAba(tabId);
            });
        });

        // Botões de visualização
        document.querySelectorAll('.botao-visualizacao').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modo = e.currentTarget.dataset.visao;
                this.alterarModoVisualizacao(modo);
            });
        });

        // Controles de PV/PF
        document.querySelectorAll('.btn-controle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const acao = e.target.dataset.acao;
                const valor = parseInt(e.target.dataset.valor);
                this.aplicarModificador(acao, valor);
            });
        });

        // Botão de PV customizado
        document.getElementById('btnAplicarPvCustom').addEventListener('click', () => {
            const input = document.getElementById('inputPvCustom');
            const valor = parseInt(input.value);
            if (valor) {
                this.aplicarModificador('cura', valor);
                input.value = '';
            }
        });

        // Botão voltar
        document.getElementById('btnVoltarCampanha').addEventListener('click', (e) => {
            e.preventDefault();
            this.voltarParaCampanha();
        });

        // Botões do cabeçalho
        document.getElementById('btnSincronizar').addEventListener('click', () => {
            this.sincronizarDados();
        });

        document.getElementById('btnCongelar').addEventListener('click', () => {
            this.congelarPersonagem();
        });

        document.getElementById('btnRemover').addEventListener('click', () => {
            this.removerPersonagem();
        });

        // Anotações
        document.getElementById('btnSalvarAnotacoes').addEventListener('click', () => {
            this.salvarAnotacoes();
        });

        document.getElementById('btnLimparAnotacoes').addEventListener('click', () => {
            this.limparAnotacoes();
        });

        // Filtro de perícias
        document.getElementById('filtroPericias').addEventListener('input', (e) => {
            this.filtrarPericias(e.target.value);
        });

        document.getElementById('filtroAtributo').addEventListener('change', (e) => {
            this.filtrarPericiasPorAtributo(e.target.value);
        });

        // Modais
        document.querySelectorAll('.fechar-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.fecharModal('modal-config');
                this.fecharModal('modal-confirmacao');
            });
        });

        document.getElementById('btnFecharConfig').addEventListener('click', () => {
            this.fecharModal('modal-config');
        });

        document.getElementById('btnSalvarConfig').addEventListener('click', () => {
            this.salvarConfiguracoes();
        });

        document.getElementById('btnCancelarAcao').addEventListener('click', () => {
            this.fecharModal('modal-confirmacao');
        });

        // Fechar modal ao clicar fora
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.fecharModal('modal-config');
                this.fecharModal('modal-confirmacao');
            }
        });
    }

    // ====== CARREGAMENTO DE DADOS ======
    async carregarDadosIniciais() {
        try {
            // Carregar dados da view
            const dadosView = await this.buscarDadosView();
            dadosPersonagem = dadosView;
            
            // Carregar dados ao vivo
            dadosAoVivo = await this.buscarDadosAoVivo();
            
            // Carregar dados da campanha
            dadosCampanha = await this.buscarDadosCampanha();
            
            // Atualizar interface
            this.atualizarInterfaceCompleta();
            
            // Registrar acesso
            await this.registrarAcessoGM();
            
        } catch (error) {
            throw new Error(`Falha ao carregar dados: ${error.message}`);
        }
    }

    async buscarDadosView() {
        console.log('Buscando dados da view para vinculo:', vinculoId);
        
        const { data, error } = await supabase
            .from('gm_characters_view')
            .select('*')
            .eq('vinculo_id', vinculoId)
            .single();

        if (error) {
            console.error('Erro na view:', error);
            throw error;
        }

        console.log('Dados da view:', data);
        return data;
    }

    async buscarDadosAoVivo() {
        const { data, error } = await supabase
            .from('characters')
            .select('*')
            .eq('id', personagemId)
            .single();

        if (error) throw error;
        return data;
    }

    async buscarDadosCampanha() {
        const { data, error } = await supabase
            .from('campaign_characters')
            .select('gm_notes, is_frozen, status')
            .eq('id', vinculoId)
            .single();

        if (error) throw error;
        return data;
    }

    // ====== ATUALIZAÇÃO DA INTERFACE ======
    atualizarInterfaceCompleta() {
        if (!dadosPersonagem) return;

        // Informações básicas
        this.atualizarInformacoesBasicas();
        
        // Atributos e status
        this.atualizarAtributos();
        this.atualizarStatus();
        this.atualizarPontuacao();
        
        // Habilidades
        this.atualizarVantagens();
        this.atualizarDesvantagens();
        this.atualizarPericias();
        this.atualizarMagias();
        
        // Equipamento e inventário
        this.atualizarEquipamento();
        this.atualizarInventario();
        
        // Combate
        this.atualizarCombate();
        
        // Anotações
        this.atualizarAnotacoes();
        
        // Informações da campanha
        this.atualizarInfoCampanha();
    }

    atualizarInformacoesBasicas() {
        document.getElementById('nomePersonagem').textContent = 
            dadosPersonagem.character_name || 'Sem nome';
        
        document.getElementById('racaPersonagem').textContent = 
            dadosPersonagem.race || 'Sem raça';
        
        document.getElementById('classePersonagem').textContent = 
            dadosPersonagem.description?.split(' ')[0] || 'Aventureiro';
        
        document.getElementById('pontosPersonagem').textContent = 
            `${dadosPersonagem.total_points || 0} pontos`;
        
        document.getElementById('descricaoPersonagem').textContent = 
            dadosPersonagem.description || 'Sem descrição.';
        
        // Atualizar foto
        if (dadosPersonagem.avatar_url) {
            const img = document.getElementById('fotoPersonagem');
            img.src = dadosPersonagem.avatar_url;
            img.style.display = 'block';
            document.getElementById('placeholderFoto').style.display = 'none';
        }
        
        // Atualizar nomes da campanha e jogador
        document.getElementById('nomeCampanha').textContent = 
            dadosPersonagem.campaign_name || 'Campanha';
        
        document.getElementById('nomeJogador').textContent = 
            dadosPersonagem.player_username || 'Jogador';
    }

    atualizarAtributos() {
        // Atributos principais
        document.getElementById('gmST').textContent = dadosPersonagem.st || 10;
        document.getElementById('gmDX').textContent = dadosPersonagem.dx || 10;
        document.getElementById('gmIQ').textContent = dadosPersonagem.iq || 10;
        document.getElementById('gmHT').textContent = dadosPersonagem.ht || 10;
        
        // Vontade e Percepção (baseados em IQ)
        const iq = dadosPersonagem.iq || 10;
        document.getElementById('gmVontade').textContent = iq;
        document.getElementById('gmPercepcao').textContent = iq;
        
        // Atributos detalhados
        document.getElementById('detalheST').textContent = dadosPersonagem.st || 10;
        document.getElementById('detalheDX').textContent = dadosPersonagem.dx || 10;
        document.getElementById('detalheIQ').textContent = dadosPersonagem.iq || 10;
        document.getElementById('detalheHT').textContent = dadosPersonagem.ht || 10;
    }

    atualizarStatus() {
        // PV
        const pvAtual = dadosAoVivo?.pv_atual || dadosPersonagem.current_hp || 10;
        const pvMaximo = dadosPersonagem.max_hp || 10;
        
        document.getElementById('pvAtualGM').textContent = pvAtual;
        document.getElementById('pvMaximoGM').textContent = pvMaximo;
        
        // Atualizar indicador de status
        const pvPercent = (pvAtual / pvMaximo) * 100;
        const indicator = document.getElementById('pvStatus');
        
        if (pvPercent > 50) {
            indicator.className = 'status-indicator';
        } else if (pvPercent > 25) {
            indicator.className = 'status-indicator baixo';
        } else {
            indicator.className = 'status-indicator critico';
        }
        
        // PF
        const pfAtual = dadosAoVivo?.pf_atual || dadosPersonagem.current_fp || 10;
        const pfMaximo = dadosPersonagem.max_fp || 10;
        
        document.getElementById('pfAtualGM').textContent = pfAtual;
        document.getElementById('pfMaximoGM').textContent = pfMaximo;
        
        // Dinheiro
        const dinheiro = dadosPersonagem.money || 0;
        document.getElementById('dinheiroGM').textContent = `$${dinheiro}`;
        
        // Movimento e carga
        document.getElementById('gmDeslocamento').textContent = 
            dadosPersonagem.basic_move || 5;
        
        document.getElementById('gmBonusMovimento').textContent = 
            dadosPersonagem.move_bonus || 0;
        
        document.getElementById('gmCargaAtual').textContent = 
            `${dadosPersonagem.current_weight || 0} lb`;
        
        document.getElementById('gmCargaMaxima').textContent = 
            `${dadosPersonagem.max_weight || 0} lb`;
    }

    atualizarPontuacao() {
        document.getElementById('pontosTotais').textContent = 
            dadosPersonagem.total_points || 0;
        
        document.getElementById('pontosGastos').textContent = 
            dadosPersonagem.spent_points || 0;
        
        document.getElementById('pontosDisponiveis').textContent = 
            dadosPersonagem.available_points || 0;
        
        document.getElementById('limiteDesvantagens').textContent = 
            dadosPersonagem.disadvantage_limit || -40;
        
        document.getElementById('desvantagensAtuais').textContent = 
            dadosPersonagem.current_disadvantages || 0;
    }

    atualizarVantagens() {
        const container = document.getElementById('listaVantagensGM');
        const totalElement = document.getElementById('totalVantagensGM');
        
        if (!container) return;
        
        let vantagens = [];
        try {
            if (typeof dadosPersonagem.advantages === 'string') {
                vantagens = JSON.parse(dadosPersonagem.advantages || '[]');
            } else if (Array.isArray(dadosPersonagem.advantages)) {
                vantagens = dadosPersonagem.advantages;
            }
        } catch (e) {
            console.error('Erro ao parsear vantagens:', e);
        }
        
        container.innerHTML = '';
        
        if (vantagens.length === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'vantagem-item';
            emptyItem.innerHTML = `
                <span class="nome-vantagem">Nenhuma vantagem</span>
                <span class="custo-vantagem">0</span>
            `;
            container.appendChild(emptyItem);
        } else {
            vantagens.forEach(vantagem => {
                const item = document.createElement('div');
                item.className = 'vantagem-item';
                item.innerHTML = `
                    <span class="nome-vantagem">${vantagem.nome || vantagem.name || 'Vantagem'}</span>
                    <span class="custo-vantagem">${vantagem.custo || vantagem.cost || 0}</span>
                `;
                container.appendChild(item);
            });
        }
        
        if (totalElement) {
            totalElement.textContent = vantagens.length;
        }
    }

    atualizarDesvantagens() {
        const container = document.getElementById('listaDesvantagensGM');
        const totalElement = document.getElementById('totalDesvantagensGM');
        
        if (!container) return;
        
        let desvantagens = [];
        try {
            if (typeof dadosPersonagem.disadvantages === 'string') {
                desvantagens = JSON.parse(dadosPersonagem.disadvantages || '[]');
            } else if (Array.isArray(dadosPersonagem.disadvantages)) {
                desvantagens = dadosPersonagem.disadvantages;
            }
        } catch (e) {
            console.error('Erro ao parsear desvantagens:', e);
        }
        
        container.innerHTML = '';
        
        if (desvantagens.length === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'desvantagem-item';
            emptyItem.innerHTML = `
                <span class="nome-desvantagem">Nenhuma desvantagem</span>
                <span class="custo-desvantagem">0</span>
            `;
            container.appendChild(emptyItem);
        } else {
            desvantagens.forEach(desvantagem => {
                const item = document.createElement('div');
                item.className = 'desvantagem-item';
                item.innerHTML = `
                    <span class="nome-desvantagem">${desvantagem.nome || desvantagem.name || 'Desvantagem'}</span>
                    <span class="custo-desvantagem">${desvantagem.custo || desvantagem.cost || 0}</span>
                `;
                container.appendChild(item);
            });
        }
        
        if (totalElement) {
            totalElement.textContent = desvantagens.length;
        }
    }

    atualizarPericias() {
        const containerResumo = document.getElementById('listaPericiasGM');
        const containerDetalhado = document.getElementById('tabelaPericiasGM');
        const totalElement = document.getElementById('totalPericias');
        
        if (!containerResumo || !containerDetalhado) return;
        
        let pericias = [];
        try {
            if (typeof dadosPersonagem.skills === 'string') {
                pericias = JSON.parse(dadosPersonagem.skills || '[]');
            } else if (Array.isArray(dadosPersonagem.skills)) {
                pericias = dadosPersonagem.skills;
            }
        } catch (e) {
            console.error('Erro ao parsear perícias:', e);
        }
        
        // Atualizar resumo (top 5 perícias)
        containerResumo.innerHTML = '';
        const periciasOrdenadas = [...pericias]
            .sort((a, b) => (b.nivel || 0) - (a.nivel || 0))
            .slice(0, 5);
        
        periciasOrdenadas.forEach(pericia => {
            const item = document.createElement('div');
            item.className = 'pericia-item';
            item.innerHTML = `
                <span class="nome-pericia">${pericia.nome || pericia.name || 'Perícia'}</span>
                <span class="nivel-pericia">${pericia.nivel || pericia.level || 0}</span>
            `;
            containerResumo.appendChild(item);
        });
        
        if (periciasOrdenadas.length === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'pericia-item';
            emptyItem.innerHTML = `
                <span class="nome-pericia">Nenhuma perícia</span>
                <span class="nivel-pericia">-</span>
            `;
            containerResumo.appendChild(emptyItem);
        }
        
        // Atualizar tabela detalhada
        containerDetalhado.innerHTML = '';
        
        // Cabeçalho da tabela
        const cabecalho = document.createElement('div');
        cabecalho.className = 'linha-tabela cabecalho-tabela';
        cabecalho.innerHTML = `
            <div class="coluna">Perícia</div>
            <div class="coluna">Atributo</div>
            <div class="coluna">Nível</div>
            <div class="coluna">Custo</div>
        `;
        containerDetalhado.appendChild(cabecalho);
        
        // Linhas da tabela
        pericias.forEach(pericia => {
            const linha = document.createElement('div');
            linha.className = 'linha-tabela';
            linha.innerHTML = `
                <div class="coluna">${pericia.nome || pericia.name || 'Perícia'}</div>
                <div class="coluna">${pericia.atributo || 'DX'}</div>
                <div class="coluna">${pericia.nivel || pericia.level || 0}</div>
                <div class="coluna">${pericia.custo || pericia.cost || 0}</div>
            `;
            containerDetalhado.appendChild(linha);
        });
        
        if (pericias.length === 0) {
            const linha = document.createElement('div');
            linha.className = 'linha-tabela';
            linha.innerHTML = `
                <div class="coluna" colspan="4">Nenhuma perícia cadastrada</div>
            `;
            containerDetalhado.appendChild(linha);
        }
        
        if (totalElement) {
            totalElement.textContent = pericias.length;
        }
    }

    atualizarMagias() {
        const containerResumo = document.getElementById('listaMagiasGM');
        const containerDetalhado = document.getElementById('listaMagiasDetalhado');
        const totalResumo = document.getElementById('totalMagias');
        const totalDetalhado = document.getElementById('totalMagiasDetalhado');
        
        if (!containerResumo || !containerDetalhado) return;
        
        let magias = [];
        try {
            if (typeof dadosPersonagem.spells === 'string') {
                magias = JSON.parse(dadosPersonagem.spells || '[]');
            } else if (Array.isArray(dadosPersonagem.spells)) {
                magias = dadosPersonagem.spells;
            }
        } catch (e) {
            console.error('Erro ao parsear magias:', e);
        }
        
        // Atualizar resumo (top 5 magias)
        containerResumo.innerHTML = '';
        const magiasOrdenadas = [...magias]
            .sort((a, b) => (b.nivel || 0) - (a.nivel || 0))
            .slice(0, 5);
        
        magiasOrdenadas.forEach(magia => {
            const item = document.createElement('div');
            item.className = 'magia-item';
            item.innerHTML = `
                <span class="nome-magia">${magia.nome || magia.name || 'Magia'}</span>
                <span class="nivel-magia">${magia.nivel || magia.level || 0}</span>
            `;
            containerResumo.appendChild(item);
        });
        
        if (magiasOrdenadas.length === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'magia-item';
            emptyItem.innerHTML = `
                <span class="nome-magia">Nenhuma magia</span>
                <span class="nivel-magia">-</span>
            `;
            containerResumo.appendChild(emptyItem);
        }
        
        // Atualizar lista detalhada
        containerDetalhado.innerHTML = '';
        
        magias.forEach(magia => {
            const item = document.createElement('div');
            item.className = 'magia-item';
            item.innerHTML = `
                <div class="magia-info">
                    <strong>${magia.nome || magia.name || 'Magia'}</strong>
                    <div class="magia-detalhes">
                        <span>Nível: ${magia.nivel || magia.level || 0}</span>
                        <span>Custo: ${magia.custo || magia.cost || 0}</span>
                        <span>Duração: ${magia.duracao || 'Instantânea'}</span>
                    </div>
                    ${magia.descricao ? `<p class="magia-descricao">${magia.descricao}</p>` : ''}
                </div>
            `;
            containerDetalhado.appendChild(item);
        });
        
        if (magias.length === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'magia-item';
            emptyItem.innerHTML = `
                <div class="magia-info">
                    <strong>Nenhuma magia conhecida</strong>
                </div>
            `;
            containerDetalhado.appendChild(emptyItem);
        }
        
        // Atualizar totais
        if (totalResumo) totalResumo.textContent = magias.length;
        if (totalDetalhado) totalDetalhado.textContent = magias.length;
    }

    atualizarEquipamento() {
        const containerRapido = document.getElementById('listaEquipamentoRapido');
        const containerDetalhado = document.getElementById('tabelaEquipamentoGM');
        const pesoAtual = document.getElementById('pesoAtualGM');
        const pesoMaximo = document.getElementById('pesoMaximoGM');
        
        if (!containerRapido || !containerDetalhado) return;
        
        let equipamentos = [];
        try {
            if (typeof dadosPersonagem.equipment === 'string') {
                equipamentos = JSON.parse(dadosPersonagem.equipment || '[]');
            } else if (Array.isArray(dadosPersonagem.equipment)) {
                equipamentos = dadosPersonagem.equipment;
            }
        } catch (e) {
            console.error('Erro ao parsear equipamentos:', e);
        }
        
        // Atualizar equipamento rápido (top 5 itens)
        containerRapido.innerHTML = '';
        const equipamentosRapidos = equipamentos.slice(0, 5);
        
        equipamentosRapidos.forEach(item => {
            const div = document.createElement('div');
            div.className = 'equipamento-item';
            div.innerHTML = `
                <span class="nome-equipamento">${item.nome || item.name || 'Item'}</span>
                <span class="peso-equipamento">${item.peso || item.weight || 0} lb</span>
            `;
            containerRapido.appendChild(div);
        });
        
        if (equipamentosRapidos.length === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'equipamento-item';
            emptyItem.innerHTML = `
                <span class="nome-equipamento">Inventário vazio</span>
                <span class="peso-equipamento">-</span>
            `;
            containerRapido.appendChild(emptyItem);
        }
        
        // Atualizar tabela detalhada
        containerDetalhado.innerHTML = '';
        
        // Cabeçalho
        const cabecalho = document.createElement('div');
        cabecalho.className = 'linha-tabela cabecalho-tabela';
        cabecalho.innerHTML = `
            <div class="coluna">Item</div>
            <div class="coluna">Quantidade</div>
            <div class="coluna">Peso (lb)</div>
            <div class="coluna">Valor</div>
            <div class="coluna">Local</div>
        `;
        containerDetalhado.appendChild(cabecalho);
        
        // Linhas
        equipamentos.forEach(item => {
            const linha = document.createElement('div');
            linha.className = 'linha-tabela';
            linha.innerHTML = `
                <div class="coluna">${item.nome || item.name || 'Item'}</div>
                <div class="coluna">${item.quantidade || item.quantity || 1}</div>
                <div class="coluna">${item.peso || item.weight || 0}</div>
                <div class="coluna">$${item.valor || item.value || 0}</div>
                <div class="coluna">${item.local || 'Mochila'}</div>
            `;
            containerDetalhado.appendChild(linha);
        });
        
        if (equipamentos.length === 0) {
            const linha = document.createElement('div');
            linha.className = 'linha-tabela';
            linha.innerHTML = `
                <div class="coluna" colspan="5">Nenhum item no inventário</div>
            `;
            containerDetalhado.appendChild(linha);
        }
        
        // Atualizar pesos
        if (pesoAtual) pesoAtual.textContent = dadosPersonagem.current_weight || 0;
        if (pesoMaximo) pesoMaximo.textContent = dadosPersonagem.max_weight || 0;
    }

    atualizarInventario() {
        // Similar ao equipamento, mas focado em itens gerais
        // Implementação similar à atualizarEquipamento()
    }

    atualizarCombate() {
        // Defesas
        document.getElementById('gmEsquiva').textContent = 
            dadosPersonagem.dodge || 10;
        document.getElementById('gmBloqueio').textContent = 
            dadosPersonagem.block || '-';
        document.getElementById('gmAparar').textContent = 
            dadosPersonagem.parry || '-';
        
        document.getElementById('combateEsquiva').textContent = 
            dadosPersonagem.dodge || 10;
        document.getElementById('combateEsquivaMod').textContent = 
            dadosPersonagem.dodge_mod || 0;
        document.getElementById('combateBloqueio').textContent = 
            dadosPersonagem.block || '-';
        document.getElementById('combateBloqueioMod').textContent = 
            dadosPersonagem.block_mod || 0;
        document.getElementById('combateAparar').textContent = 
            dadosPersonagem.parry || '-';
        document.getElementById('combateApararMod').textContent = 
            dadosPersonagem.parry_mod || 0;
        
        // Dano
        document.getElementById('gmDanoGolpe').textContent = 
            dadosPersonagem.thrust_damage || '1d-2';
        document.getElementById('gmDanoArremesso').textContent = 
            dadosPersonagem.swing_damage || '1d';
        
        document.getElementById('combateThrust').textContent = 
            dadosPersonagem.thrust_damage || '1d-2';
        document.getElementById('combateSwing').textContent = 
            dadosPersonagem.swing_damage || '1d';
        
        // DR (Defesa)
        document.getElementById('drCabeca').textContent = 
            dadosPersonagem.dr_head || 0;
        document.getElementById('drTronco').textContent = 
            dadosPersonagem.dr_torso || 0;
        document.getElementById('drBracos').textContent = 
            dadosPersonagem.dr_arms || 0;
        document.getElementById('drPernas').textContent = 
            dadosPersonagem.dr_legs || 0;
        document.getElementById('drTotal').textContent = 
            dadosPersonagem.total_dr || 0;
        
        // Escudo
        const infoEscudo = document.getElementById('infoEscudo');
        if (dadosPersonagem.shield_equipped) {
            infoEscudo.innerHTML = `
                <p><strong>${dadosPersonagem.shield_name || 'Escudo'}</strong></p>
                <p>DR: ${dadosPersonagem.shield_dr || 0}</p>
                <p>PV: ${dadosPersonagem.shield_current_hp || 0}/${dadosPersonagem.shield_max_hp || 0}</p>
            `;
        } else {
            infoEscudo.innerHTML = `<p>Nenhum escudo equipado</p>`;
        }
    }

    atualizarAnotacoes() {
        const textarea = document.getElementById('anotacoesGM');
        if (textarea && dadosCampanha?.gm_notes) {
            textarea.value = dadosCampanha.gm_notes;
        }
    }

    atualizarInfoCampanha() {
        const historico = document.getElementById('historicoCampanha');
        if (historico) {
            historico.innerHTML = `
                <div class="evento-historico">
                    <span class="data-evento">${new Date().toLocaleDateString('pt-BR')}</span>
                    <p>GM visualizou a ficha</p>
                </div>
            `;
        }
    }

    // ====== FUNCIONALIDADES ======
    mudarAba(abaId) {
        // Remover classe ativa de todas as abas
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('ativo'));
        document.querySelectorAll('.conteudo-aba').forEach(aba => aba.classList.remove('ativo'));

        // Adicionar classe ativa na aba selecionada
        const tabAtiva = document.querySelector(`.tab[data-tab="${abaId}"]`);
        const abaAtiva = document.getElementById(`aba-${abaId}`);

        if (tabAtiva && abaAtiva) {
            tabAtiva.classList.add('ativo');
            abaAtiva.classList.add('ativo');
            
            // Salvar a aba ativa no localStorage
            localStorage.setItem('ultimaAbaGM', abaId);
        }
    }

    alterarModoVisualizacao(modo) {
        modoVisualizacao = modo;
        
        // Atualizar botões
        document.querySelectorAll('.botao-visualizacao').forEach(btn => {
            btn.classList.remove('ativo');
            if (btn.dataset.visao === modo) {
                btn.classList.add('ativo');
            }
        });
        
        // Recarregar dados se necessário
        if (modo === 'ao-vivo') {
            this.sincronizarDados();
        }
        
        this.mostrarMensagem(`Modo alterado para: ${modo}`, 'info');
    }

    async aplicarModificador(acao, valor) {
        if (!dadosPersonagem) return;
        
        try {
            let novoValor;
            let campo;
            
            switch(acao) {
                case 'dano':
                case 'cura':
                    const pvAtual = parseInt(document.getElementById('pvAtualGM').textContent);
                    const pvMaximo = parseInt(document.getElementById('pvMaximoGM').textContent);
                    
                    if (acao === 'cura') {
                        novoValor = Math.min(pvMaximo, pvAtual + valor);
                    } else {
                        novoValor = Math.max(0, pvAtual - valor);
                    }
                    
                    campo = 'pv_atual';
                    document.getElementById('pvAtualGM').textContent = novoValor;
                    break;
                    
                case 'fadiga':
                case 'recuperar':
                    const pfAtual = parseInt(document.getElementById('pfAtualGM').textContent);
                    const pfMaximo = parseInt(document.getElementById('pfMaximoGM').textContent);
                    
                    if (acao === 'recuperar') {
                        novoValor = Math.min(pfMaximo, pfAtual + valor);
                    } else {
                        novoValor = Math.max(0, pfAtual - valor);
                    }
                    
                    campo = 'pf_atual';
                    document.getElementById('pfAtualGM').textContent = novoValor;
                    break;
                    
                case 'dinheiro':
                    const dinheiroAtual = parseInt(dadosPersonagem.money) || 0;
                    novoValor = dinheiroAtual + valor;
                    campo = 'money';
                    document.getElementById('dinheiroGM').textContent = `$${novoValor}`;
                    break;
            }
            
            // Atualizar no servidor
            if (campo && novoValor !== undefined) {
                const { error } = await supabase
                    .from('characters')
                    .update({ [campo]: novoValor })
                    .eq('id', personagemId);
                
                if (error) throw error;
                
                // Atualizar dados locais
                dadosPersonagem[campo] = novoValor;
                
                this.mostrarMensagem(`${acao} aplicado com sucesso!`, 'sucesso');
            }
            
        } catch (error) {
            console.error('Erro ao aplicar modificador:', error);
            this.mostrarMensagem('Erro ao atualizar', 'erro');
        }
    }

    async sincronizarDados() {
        this.mostrarLoading();
        
        try {
            await this.carregarDadosIniciais();
            this.mostrarMensagem('Dados sincronizados!', 'sucesso');
        } catch (error) {
            this.mostrarMensagem('Erro ao sincronizar', 'erro');
        } finally {
            this.esconderLoading();
        }
    }

    async congelarPersonagem() {
        this.mostrarConfirmacao(
            'Congelar Personagem',
            'Tem certeza que deseja congelar este personagem? O jogador não poderá fazer alterações até que seja descongelado.',
            async () => {
                try {
                    const { error } = await supabase
                        .from('campaign_characters')
                        .update({ is_frozen: true })
                        .eq('id', vinculoId);
                    
                    if (error) throw error;
                    
                    dadosCampanha.is_frozen = true;
                    this.mostrarMensagem('Personagem congelado!', 'sucesso');
                } catch (error) {
                    this.mostrarMensagem('Erro ao congelar', 'erro');
                }
            }
        );
    }

    async removerPersonagem() {
        this.mostrarConfirmacao(
            'Remover Personagem',
            'ATENÇÃO: Esta ação removerá o personagem da campanha. O jogador perderá acesso a esta campanha com este personagem. Deseja continuar?',
            async () => {
                try {
                    const { error } = await supabase
                        .from('campaign_characters')
                        .update({ status: 'removed' })
                        .eq('id', vinculoId);
                    
                    if (error) throw error;
                    
                    this.mostrarMensagem('Personagem removido da campanha', 'sucesso');
                    
                    // Redirecionar após 2 segundos
                    setTimeout(() => {
                        window.history.back();
                    }, 2000);
                    
                } catch (error) {
                    this.mostrarMensagem('Erro ao remover', 'erro');
                }
            }
        );
    }

    async salvarAnotacoes() {
        try {
            const notas = document.getElementById('anotacoesGM').value;
            
            const { error } = await supabase
                .from('campaign_characters')
                .update({ gm_notes: notas })
                .eq('id', vinculoId);
            
            if (error) throw error;
            
            dadosCampanha.gm_notes = notas;
            this.mostrarMensagem('Anotações salvas!', 'sucesso');
            
        } catch (error) {
            console.error('Erro ao salvar anotações:', error);
            this.mostrarMensagem('Erro ao salvar', 'erro');
        }
    }

    limparAnotacoes() {
        document.getElementById('anotacoesGM').value = '';
    }

    filtrarPericias(termo) {
        const tabela = document.getElementById('tabelaPericiasGM');
        const linhas = tabela.querySelectorAll('.linha-tabela:not(.cabecalho-tabela)');
        
        linhas.forEach(linha => {
            const texto = linha.textContent.toLowerCase();
            linha.style.display = texto.includes(termo.toLowerCase()) ? '' : 'none';
        });
    }

    filtrarPericiasPorAtributo(atributo) {
        const tabela = document.getElementById('tabelaPericiasGM');
        const linhas = tabela.querySelectorAll('.linha-tabela:not(.cabecalho-tabela)');
        
        linhas.forEach(linha => {
            const colunaAtributo = linha.querySelector('.coluna:nth-child(2)');
            if (colunaAtributo) {
                const textoAtributo = colunaAtributo.textContent.toUpperCase();
                linha.style.display = !atributo || textoAtributo.includes(atributo) ? '' : 'none';
            }
        });
    }

    // ====== MODAIS ======
    mostrarModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    fecharModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    mostrarConfirmacao(titulo, mensagem, callback) {
        document.getElementById('tituloConfirmacao').textContent = titulo;
        document.getElementById('mensagemConfirmacao').textContent = mensagem;
        
        const btnConfirmar = document.getElementById('btnConfirmarAcao');
        btnConfirmar.onclick = () => {
            callback();
            this.fecharModal('modal-confirmacao');
        };
        
        this.mostrarModal('modal-confirmacao');
    }

    // ====== CONFIGURAÇÕES ======
    salvarConfiguracoes() {
        autoAtualizar = document.getElementById('autoAtualizar').checked;
        intervaloAtualizacaoMs = parseInt(document.getElementById('intervaloAtualizacao').value);
        
        // Reiniciar atualização automática se necessário
        if (intervaloAtualizacao) {
            clearInterval(intervaloAtualizacao);
            intervaloAtualizacao = null;
        }
        
        if (autoAtualizar && intervaloAtualizacaoMs > 0) {
            this.iniciarAtualizacaoAutomatica();
        }
        
        this.fecharModal('modal-config');
        this.mostrarMensagem('Configurações salvas!', 'sucesso');
    }

    // ====== ATUALIZAÇÃO AUTOMÁTICA ======
    iniciarAtualizacaoAutomatica() {
        if (intervaloAtualizacaoMs > 0) {
            intervaloAtualizacao = setInterval(() => {
                if (modoVisualizacao === 'ao-vivo') {
                    this.sincronizarDados();
                }
            }, intervaloAtualizacaoMs);
            
            console.log(`Atualização automática iniciada: ${intervaloAtualizacaoMs}ms`);
        }
    }

    // ====== NAVEGAÇÃO ======
    voltarParaCampanha() {
        const url = `campanha.html?id=${campanhaId}`;
        window.location.href = url;
    }

    // ====== LOGGING ======
    async registrarAcessoGM() {
        try {
            const { error } = await supabase
                .from('gm_access_log')
                .insert([{
                    gm_id: gmId,
                    character_id: personagemId,
                    campaign_id: campanhaId,
                    accessed_at: new Date().toISOString()
                }]);
            
            if (error) throw error;
            
        } catch (error) {
            console.error('Erro ao registrar acesso:', error);
        }
    }

    // ====== UTILITÁRIOS ======
    mostrarLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = 'flex';
    }

    esconderLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = 'none';
    }

    mostrarMensagem(texto, tipo = 'info') {
        // Remover mensagens anteriores
        const mensagensAntigas = document.querySelectorAll('.mensagem-gm');
        mensagensAntigas.forEach(msg => msg.remove());
        
        // Criar nova mensagem
        const mensagem = document.createElement('div');
        mensagem.className = `mensagem-gm ${tipo}`;
        mensagem.textContent = texto;
        mensagem.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${tipo === 'sucesso' ? '#27ae60' : 
                         tipo === 'erro' ? '#e74c3c' : 
                         tipo === 'aviso' ? '#f39c12' : '#3498db'};
            color: white;
            border-radius: 6px;
            z-index: 9999;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(mensagem);
        
        // Auto-remover após 3 segundos
        setTimeout(() => {
            mensagem.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => mensagem.remove(), 300);
        }, 3000);
    }

    // ====== DESTRUIDOR ======
    destroy() {
        if (intervaloAtualizacao) {
            clearInterval(intervaloAtualizacao);
        }
        
        // Limpar event listeners
        document.querySelectorAll('.tab, .botao-visualizacao, .btn-controle').forEach(el => {
            el.replaceWith(el.cloneNode(true));
        });
    }
}

// ====== INICIALIZAÇÃO ======
let sistemaGM;

document.addEventListener('DOMContentLoaded', () => {
    sistemaGM = new SistemaFichaGM();
});

// Exportar para debugging
window.sistemaGM = sistemaGM;
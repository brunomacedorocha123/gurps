// ====== CONFIGURAÇÕES DO SUPABASE ======
const SUPABASE_URL = 'https://pujufdfhaxveuytkneqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1anVmZGZoYXh2ZXV5dGtuZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTkyODksImV4cCI6MjA3OTkzNTI4OX0.mzOwsmf8qIQ4HZqnXLEmq4D7M6fz4VH1YWpWP-BsFvc';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ====== VARIÁVEIS GLOBAIS ======
let dadosPersonagem = null;
let dadosCampanha = null;
let personagemId = null;
let campanhaId = null;
let vinculoId = null;
let sistemaVD = null;

// ====== CLASSE PRINCIPAL ======
class FichaGM {
    constructor() {
        this.init();
    }

    async init() {
        try {
            this.mostrarLoading();
            
            // 1. Pegar parâmetros da URL
            this.extrairParametrosURLCorretos();
            
            // 2. Carregar dados do personagem
            await this.carregarDadosPersonagem();
            
            // 3. Carregar dados da campanha
            await this.carregarDadosCampanha();
            
            // 4. Atualizar interface COMPLETA
            this.atualizarInterfaceCompleta();
            
            // 5. Configurar eventos
            this.configurarEventListeners();
            
            // 6. Iniciar sincronização
            this.iniciarSincronizacao();
            
            this.esconderLoading();
            this.mostrarMensagem('Ficha carregada!', 'sucesso');
            
        } catch (error) {
            console.error('❌ Erro:', error);
            this.mostrarMensagem('Erro ao carregar ficha', 'erro');
            this.esconderLoading();
        }
    }

    // ====== EXTRAIR PARÂMETROS ======
    extrairParametrosURLCorretos() {
        const params = new URLSearchParams(window.location.search);
        
        // Parâmetros da SUA URL
        personagemId = params.get('character');
        campanhaId = params.get('campaign');
        vinculoId = params.get('link');
        
        console.log('📋 Parâmetros:', { personagemId, campanhaId, vinculoId });
        
        if (!personagemId || !campanhaId) {
            throw new Error('URL inválida. É necessário character e campaign.');
        }
    }

    // ====== CARREGAR DADOS ======
    async carregarDadosPersonagem() {
        console.log('📥 Buscando dados do personagem:', personagemId);
        
        try {
            // PRIMEIRO: Tentar da VIEW
            if (vinculoId) {
                const { data: viewData, error: viewError } = await supabase
                    .from('gm_characters_view')
                    .select('*')
                    .eq('vinculo_id', vinculoId)
                    .single();
                
                if (!viewError && viewData) {
                    dadosPersonagem = viewData;
                    console.log('✅ Dados da VIEW carregados');
                    return;
                }
            }
            
            // SEGUNDO: Buscar direto da tabela characters
            const { data: characterData, error: characterError } = await supabase
                .from('characters')
                .select('*')
                .eq('id', personagemId)
                .single();
            
            if (characterError) throw characterError;
            
            dadosPersonagem = characterData;
            console.log('✅ Dados do personagem carregados:', dadosPersonagem);
            
        } catch (error) {
            console.error('❌ Erro ao carregar personagem:', error);
            throw error;
        }
    }

    async carregarDadosCampanha() {
        try {
            const { data: campanhaData, error } = await supabase
                .from('campaign_characters')
                .select('gm_notes, is_frozen, status')
                .eq('character_id', personagemId)
                .eq('campaign_id', campanhaId)
                .single();
            
            if (!error && campanhaData) {
                dadosCampanha = campanhaData;
            } else {
                dadosCampanha = { gm_notes: '', is_frozen: false };
            }
        } catch (error) {
            dadosCampanha = { gm_notes: '', is_frozen: false };
        }
    }

    // ====== ATUALIZAR INTERFACE COMPLETA ======
    atualizarInterfaceCompleta() {
        if (!dadosPersonagem) {
            throw new Error('Dados do personagem não carregados');
        }
        
        console.log('🎨 Atualizando interface...');
        
        // 1. Informações básicas
        this.atualizarInformacoesBasicas();
        
        // 2. Atributos
        this.atualizarAtributosReais();
        
        // 3. Status
        this.atualizarStatusReais();
        
        // 4. Vantagens e Desvantagens
        this.atualizarVantagensDesvantagens();
        
        // 5. Perícias
        this.atualizarPericiasReais();
        
        // 6. Anotações
        this.atualizarAnotacoes();
        
        // 7. Status de combate
        this.atualizarStatusCombate();
        
        console.log('✅ Interface atualizada!');
    }

    // ====== 1. INFORMAÇÕES BÁSICAS ======
    atualizarInformacoesBasicas() {
        // Nome
        document.getElementById('nomePersonagem').textContent = 
            dadosPersonagem.nome || dadosPersonagem.character_name || 'Sem nome';
        
        // Raça
        document.getElementById('racaPersonagem').textContent = 
            dadosPersonagem.raca || dadosPersonagem.race || 'Sem raça';
        
        // Classe
        document.getElementById('classePersonagem').textContent = 
            dadosPersonagem.classe || 'Aventureiro';
        
        // Nível
        document.getElementById('nivelPersonagem').textContent = 
            dadosPersonagem.nivel || 'Nível 1';
        
        // Pontos
        const pontos = dadosPersonagem.pontos_totais || dadosPersonagem.total_points || 0;
        document.getElementById('pontosPersonagem').textContent = `${pontos} pontos`;
        
        // Descrição
        document.getElementById('descricaoPersonagem').textContent = 
            dadosPersonagem.descricao || dadosPersonagem.description || 'Sem descrição.';
        
        // Campanha e Jogador
        if (dadosPersonagem.campaign_name) {
            document.getElementById('nomeCampanha').textContent = dadosPersonagem.campaign_name;
        }
        
        if (dadosPersonagem.player_username) {
            document.getElementById('nomeJogador').textContent = dadosPersonagem.player_username;
        }
        
        // Foto
        if (dadosPersonagem.avatar_url) {
            const img = document.getElementById('fotoPersonagem');
            img.src = dadosPersonagem.avatar_url;
            img.style.display = 'block';
            document.getElementById('placeholderFoto').style.display = 'none';
        }
    }

    // ====== 2. ATRIBUTOS REAIS ======
    atualizarAtributosReais() {
        console.log('🎯 Atualizando atributos...');
        
        // PEGAR VALORES REAIS DO BANCO
        const ST = dadosPersonagem.forca || dadosPersonagem.st || 10;
        const DX = dadosPersonagem.destreza || dadosPersonagem.dx || 10;
        const IQ = dadosPersonagem.inteligencia || dadosPersonagem.iq || 10;
        const HT = dadosPersonagem.saude || dadosPersonagem.ht || 10;
        
        console.log('📊 Atributos:', { ST, DX, IQ, HT });
        
        // Atualizar valores
        document.getElementById('gmST').textContent = ST;
        document.getElementById('gmDX').textContent = DX;
        document.getElementById('gmIQ').textContent = IQ;
        document.getElementById('gmHT').textContent = HT;
        
        // Calcular e mostrar modificadores
        const STMod = (ST - 10) * 10;
        const DXMod = (DX - 10) * 20;
        const IQMod = (IQ - 10) * 20;
        const HTMod = (HT - 10) * 10;
        
        document.getElementById('gmSTMod').textContent = `[${STMod >= 0 ? '+' : ''}${STMod}]`;
        document.getElementById('gmDXMod').textContent = `[${DXMod >= 0 ? '+' : ''}${DXMod}]`;
        document.getElementById('gmIQMod').textContent = `[${IQMod >= 0 ? '+' : ''}${IQMod}]`;
        document.getElementById('gmHTMod').textContent = `[${HTMod >= 0 ? '+' : ''}${HTMod}]`;
        
        // Vontade e Percepção
        const vontade = dadosPersonagem.vontade || IQ;
        const percepcao = dadosPersonagem.percepcao || IQ;
        
        document.getElementById('gmVontade').textContent = vontade;
        document.getElementById('gmPercepcao').textContent = percepcao;
        
        // Carga (sem "lb")
        const cargaAtual = dadosPersonagem.peso_atual || dadosPersonagem.current_weight || 0;
        const cargaMaxima = dadosPersonagem.peso_maximo || dadosPersonagem.max_weight || 0;
        
        document.getElementById('gmCargaAtual').textContent = cargaAtual;
        document.getElementById('gmCargaMaxima').textContent = cargaMaxima;
        
        // Deslocamento
        const deslocamento = dadosPersonagem.deslocamento || dadosPersonagem.basic_move || 5;
        const bonusMovimento = dadosPersonagem.bonus_deslocamento || dadosPersonagem.move_bonus || 0;
        
        document.getElementById('gmDeslocamento').textContent = deslocamento;
        document.getElementById('gmBonusMovimento').textContent = bonusMovimento;
    }

    // ====== 3. STATUS REAIS ======
    atualizarStatusReais() {
        // PV
        const pvAtual = dadosPersonagem.pv_atual || dadosPersonagem.current_hp || 10;
        const pvMaximo = dadosPersonagem.pv_maximo || dadosPersonagem.max_hp || 
                        dadosPersonagem.pontos_vida || 10;
        
        document.getElementById('pvAtualGM').textContent = pvAtual;
        document.getElementById('pvMaximoGM').textContent = pvMaximo;
        
        // Indicador de status PV
        const pvPercent = (pvAtual / pvMaximo) * 100;
        const indicator = document.getElementById('pvStatus');
        
        if (pvPercent > 50) {
            indicator.style.background = '#27ae60';
        } else if (pvPercent > 25) {
            indicator.style.background = '#f39c12';
        } else {
            indicator.style.background = '#e74c3c';
        }
        
        // PF
        const pfAtual = dadosPersonagem.pf_atual || dadosPersonagem.current_fp || 10;
        const pfMaximo = dadosPersonagem.pf_maximo || dadosPersonagem.max_fp || 
                        dadosPersonagem.pontos_fadiga || 10;
        
        document.getElementById('pfAtualGM').textContent = pfAtual;
        document.getElementById('pfMaximoGM').textContent = pfMaximo;
        
        // Dinheiro
        const dinheiro = dadosPersonagem.dinheiro || dadosPersonagem.money || 0;
        document.getElementById('dinheiroGM').textContent = `$${dinheiro}`;
    }

    // ====== 4. VANTAGENS E DESVANTAGENS ======
    atualizarVantagensDesvantagens() {
        console.log('🎯 Processando vantagens/desvantagens...');
        
        // Processar vantagens
        this.processarEExibirVantagens();
        
        // Processar desvantagens
        this.processarEExibirDesvantagens();
        
        // Atualizar totais
        this.atualizarTotaisVD();
    }

    processarEExibirVantagens() {
        const container = document.getElementById('listaVantagensGM');
        if (!container) return;
        
        let vantagens = [];
        
        try {
            // Tentar diferentes formatos
            if (dadosPersonagem.vantagens) {
                if (typeof dadosPersonagem.vantagens === 'string') {
                    vantagens = JSON.parse(dadosPersonagem.vantagens);
                } else if (Array.isArray(dadosPersonagem.vantagens)) {
                    vantagens = dadosPersonagem.vantagens;
                }
            } else if (dadosPersonagem.advantages) {
                if (typeof dadosPersonagem.advantages === 'string') {
                    vantagens = JSON.parse(dadosPersonagem.advantages);
                } else if (Array.isArray(dadosPersonagem.advantages)) {
                    vantagens = dadosPersonagem.advantages;
                }
            }
        } catch (e) {
            console.error('❌ Erro ao processar vantagens:', e);
        }
        
        // Limpar container
        container.innerHTML = '';
        
        if (!vantagens || vantagens.length === 0) {
            const emptyItem = this.criarItemVazio('Nenhuma vantagem', '0');
            container.appendChild(emptyItem);
            return;
        }
        
        // Ordenar por custo
        vantagens.sort((a, b) => (b.custo || b.cost || 0) - (a.custo || a.cost || 0));
        
        // Adicionar cada vantagem
        vantagens.forEach(vantagem => {
            const nome = vantagem.nome || vantagem.name || 'Vantagem';
            const custo = vantagem.custo || vantagem.cost || 0;
            
            const item = document.createElement('div');
            item.className = 'vantagem-item';
            
            const custoClass = custo >= 0 ? 'positivo' : 'negativo';
            const custoTexto = custo >= 0 ? `+${custo}` : `${custo}`;
            
            item.innerHTML = `
                <span class="nome-vantagem">${this.escapeHtml(nome)}</span>
                <span class="custo-vantagem ${custoClass}">${custoTexto}</span>
            `;
            
            // Tooltip com descrição
            if (vantagem.descricao || vantagem.description) {
                item.title = this.escapeHtml(vantagem.descricao || vantagem.description);
            }
            
            container.appendChild(item);
        });
        
        // Atualizar contador
        const totalElement = document.getElementById('totalVantagensGM');
        if (totalElement) {
            totalElement.textContent = vantagens.length;
        }
        
        console.log(`✅ ${vantagens.length} vantagens exibidas`);
    }

    processarEExibirDesvantagens() {
        const container = document.getElementById('listaDesvantagensGM');
        if (!container) return;
        
        let desvantagens = [];
        
        try {
            // Tentar diferentes formatos
            if (dadosPersonagem.desvantagens) {
                if (typeof dadosPersonagem.desvantagens === 'string') {
                    desvantagens = JSON.parse(dadosPersonagem.desvantagens);
                } else if (Array.isArray(dadosPersonagem.desvantagens)) {
                    desvantagens = dadosPersonagem.desvantagens;
                }
            } else if (dadosPersonagem.disadvantages) {
                if (typeof dadosPersonagem.disadvantages === 'string') {
                    desvantagens = JSON.parse(dadosPersonagem.disadvantages);
                } else if (Array.isArray(dadosPersonagem.disadvantages)) {
                    desvantagens = dadosPersonagem.disadvantages;
                }
            }
        } catch (e) {
            console.error('❌ Erro ao processar desvantagens:', e);
        }
        
        // Limpar container
        container.innerHTML = '';
        
        if (!desvantagens || desvantagens.length === 0) {
            const emptyItem = this.criarItemVazio('Nenhuma desvantagem', '0');
            container.appendChild(emptyItem);
            return;
        }
        
        // Ordenar por custo absoluto
        desvantagens.sort((a, b) => Math.abs(b.custo || b.cost || 0) - Math.abs(a.custo || a.cost || 0));
        
        // Adicionar cada desvantagem
        desvantagens.forEach(desvantagem => {
            const nome = desvantagem.nome || desvantagem.name || 'Desvantagem';
            const custo = desvantagem.custo || desvantagem.cost || 0;
            
            const item = document.createElement('div');
            item.className = 'desvantagem-item';
            
            const custoClass = 'negativo';
            const custoTexto = `${custo}`;
            
            item.innerHTML = `
                <span class="nome-desvantagem">${this.escapeHtml(nome)}</span>
                <span class="custo-desvantagem ${custoClass}">${custoTexto}</span>
            `;
            
            // Tooltip com descrição
            if (desvantagem.descricao || desvantagem.description) {
                item.title = this.escapeHtml(desvantagem.descricao || desvantagem.description);
            }
            
            container.appendChild(item);
        });
        
        // Atualizar contador
        const totalElement = document.getElementById('totalDesvantagensGM');
        if (totalElement) {
            totalElement.textContent = desvantagens.length;
        }
        
        console.log(`✅ ${desvantagens.length} desvantagens exibidas`);
    }

    atualizarTotaisVD() {
        // Calcular totais
        const totalVantagens = this.calcularTotalVD('vantagens');
        const totalDesvantagens = this.calcularTotalVD('desvantagens');
        const saldoTotal = totalVantagens + totalDesvantagens;
        
        // Atualizar na aba de atributos
        document.getElementById('pontosTotais').textContent = dadosPersonagem.pontos_totais || dadosPersonagem.total_points || 0;
        document.getElementById('pontosGastos').textContent = Math.abs(totalDesvantagens) + totalVantagens;
        document.getElementById('pontosDisponiveis').textContent = (dadosPersonagem.pontos_disponiveis || dadosPersonagem.available_points || 0);
        
        // Atualizar saldo se houver elemento
        const elSaldoTotal = document.getElementById('saldo-total-vantagens');
        if (elSaldoTotal) {
            elSaldoTotal.textContent = `${saldoTotal} pts`;
            elSaldoTotal.style.color = saldoTotal > 0 ? '#27ae60' : 
                                      saldoTotal < 0 ? '#e74c3c' : '#ffd700';
        }
    }

    calcularTotalVD(tipo) {
        let dados = [];
        let campo1, campo2;
        
        if (tipo === 'vantagens') {
            campo1 = 'vantagens';
            campo2 = 'advantages';
        } else {
            campo1 = 'desvantagens';
            campo2 = 'disadvantages';
        }
        
        try {
            // Tentar pegar dados
            if (dadosPersonagem[campo1]) {
                if (typeof dadosPersonagem[campo1] === 'string') {
                    dados = JSON.parse(dadosPersonagem[campo1]);
                } else if (Array.isArray(dadosPersonagem[campo1])) {
                    dados = dadosPersonagem[campo1];
                }
            } else if (dadosPersonagem[campo2]) {
                if (typeof dadosPersonagem[campo2] === 'string') {
                    dados = JSON.parse(dadosPersonagem[campo2]);
                } else if (Array.isArray(dadosPersonagem[campo2])) {
                    dados = dadosPersonagem[campo2];
                }
            }
        } catch (e) {
            console.error(`❌ Erro ao calcular total de ${tipo}:`, e);
        }
        
        // Somar custos
        return dados.reduce((total, item) => {
            return total + (item.custo || item.cost || 0);
        }, 0);
    }

    // ====== 5. PERÍCIAS ======
    atualizarPericiasReais() {
        const container = document.getElementById('listaPericiasGM');
        const totalElement = document.getElementById('totalPericias');
        
        if (!container) return;
        
        let pericias = [];
        
        try {
            if (dadosPersonagem.pericias) {
                if (typeof dadosPersonagem.pericias === 'string') {
                    pericias = JSON.parse(dadosPersonagem.pericias);
                } else if (Array.isArray(dadosPersonagem.pericias)) {
                    pericias = dadosPersonagem.pericias;
                }
            } else if (dadosPersonagem.skills) {
                if (typeof dadosPersonagem.skills === 'string') {
                    pericias = JSON.parse(dadosPersonagem.skills);
                } else if (Array.isArray(dadosPersonagem.skills)) {
                    pericias = dadosPersonagem.skills;
                }
            }
        } catch (e) {
            console.error('❌ Erro ao processar perícias:', e);
        }
        
        // Limpar container
        container.innerHTML = '';
        
        if (!pericias || pericias.length === 0) {
            const emptyItem = this.criarItemVazio('Nenhuma perícia', '-');
            container.appendChild(emptyItem);
            if (totalElement) totalElement.textContent = '0';
            return;
        }
        
        // Ordenar por nível e pegar top 10
        const topPericias = [...pericias]
            .sort((a, b) => (b.nivel || b.level || 0) - (a.nivel || a.level || 0))
            .slice(0, 10);
        
        // Adicionar cada perícia
        topPericias.forEach(pericia => {
            const nome = pericia.nome || pericia.name || 'Perícia';
            const nivel = pericia.nivel || pericia.level || 0;
            
            const item = document.createElement('div');
            item.className = 'pericia-item';
            
            item.innerHTML = `
                <span class="nome-pericia">${this.escapeHtml(nome)}</span>
                <span class="nivel-pericia">${nivel}</span>
            `;
            
            // Tooltip com atributo base
            if (pericia.atributo) {
                item.title = `Atributo: ${pericia.atributo}`;
            }
            
            container.appendChild(item);
        });
        
        // Atualizar total
        if (totalElement) {
            totalElement.textContent = pericias.length;
        }
        
        console.log(`✅ ${pericias.length} perícias processadas (mostrando ${topPericias.length})`);
    }

    // ====== 6. ANOTAÇÕES ======
    atualizarAnotacoes() {
        const textarea = document.getElementById('anotacoesGM');
        if (textarea && dadosCampanha?.gm_notes) {
            textarea.value = dadosCampanha.gm_notes;
        }
    }

    // ====== 7. STATUS DE COMBATE ======
    atualizarStatusCombate() {
        // Esquiva
        const esquiva = dadosPersonagem.esquiva || dadosPersonagem.dodge || 
                       Math.floor((dadosPersonagem.destreza || 10) / 2) + 3;
        document.getElementById('gmEsquiva').textContent = esquiva;
        
        // Dano
        document.getElementById('gmDanoGolpe').textContent = 
            dadosPersonagem.dano_gdp || dadosPersonagem.thrust_damage || '1d-2';
        document.getElementById('gmDanoArremesso').textContent = 
            dadosPersonagem.dano_geb || dadosPersonagem.swing_damage || '1d';
    }

    // CONTINUA NO PRÓXIMO COMENTÁRIO...
        // ====== UTILITÁRIOS ======
    criarItemVazio(texto, valor = '0') {
        const div = document.createElement('div');
        div.className = 'item-lista';
        div.style.opacity = '0.7';
        div.style.fontStyle = 'italic';
        div.innerHTML = `
            <span class="nome-vantagem">${texto}</span>
            <span class="custo-vantagem">${valor}</span>
        `;
        return div;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ====== EVENTOS ======
    configurarEventListeners() {
        // Tabs
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

        // Botão voltar
        document.getElementById('btnVoltarCampanha').addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `campanha.html?id=${campanhaId}`;
        });

        // Botão sincronizar
        document.getElementById('btnSincronizar').addEventListener('click', () => {
            this.sincronizarDados();
        });

        // Botão congelar
        document.getElementById('btnCongelar').addEventListener('click', () => {
            this.congelarPersonagem();
        });

        // Botão remover
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

        // Controles de PV/PF
        document.querySelectorAll('.btn-controle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                console.log('Controle clicado:', e.target.dataset);
            });
        });
    }

    mudarAba(abaId) {
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('ativo'));
        document.querySelectorAll('.conteudo-aba').forEach(aba => aba.classList.remove('ativo'));

        const tabAtiva = document.querySelector(`.tab[data-tab="${abaId}"]`);
        const abaAtiva = document.getElementById(`aba-${abaId}`);
        
        if (tabAtiva && abaAtiva) {
            tabAtiva.classList.add('ativo');
            abaAtiva.classList.add('ativo');
        }
    }

    alterarModoVisualizacao(modo) {
        document.querySelectorAll('.botao-visualizacao').forEach(btn => {
            btn.classList.remove('ativo');
            if (btn.dataset.visao === modo) {
                btn.classList.add('ativo');
            }
        });
    }

    // ====== SISTEMA DE SINCRONIZAÇÃO ======
    iniciarSincronizacao() {
        // Sincronizar a cada 30 segundos
        setInterval(() => {
            this.sincronizarDados();
        }, 30000);
    }

    async sincronizarDados() {
        try {
            await this.carregarDadosPersonagem();
            this.atualizarInterfaceCompleta();
            this.mostrarMensagem('Dados atualizados', 'info');
        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
        }
    }

    async congelarPersonagem() {
        if (confirm('Congelar este personagem? O jogador não poderá fazer alterações.')) {
            try {
                const { error } = await supabase
                    .from('campaign_characters')
                    .update({ is_frozen: true })
                    .eq('character_id', personagemId)
                    .eq('campaign_id', campanhaId);
                
                if (error) throw error;
                
                this.mostrarMensagem('Personagem congelado!', 'sucesso');
            } catch (error) {
                this.mostrarMensagem('Erro ao congelar', 'erro');
            }
        }
    }

    async removerPersonagem() {
        if (confirm('ATENÇÃO: Remover este personagem da campanha?')) {
            try {
                const { error } = await supabase
                    .from('campaign_characters')
                    .update({ status: 'removed' })
                    .eq('character_id', personagemId)
                    .eq('campaign_id', campanhaId);
                
                if (error) throw error;
                
                this.mostrarMensagem('Personagem removido', 'sucesso');
                
                // Voltar após 2 segundos
                setTimeout(() => {
                    window.location.href = `campanha.html?id=${campanhaId}`;
                }, 2000);
                
            } catch (error) {
                this.mostrarMensagem('Erro ao remover', 'erro');
            }
        }
    }

    async salvarAnotacoes() {
        try {
            const notas = document.getElementById('anotacoesGM').value;
            
            const { error } = await supabase
                .from('campaign_characters')
                .update({ gm_notes: notas })
                .eq('character_id', personagemId)
                .eq('campaign_id', campanhaId);
            
            if (error) throw error;
            
            this.mostrarMensagem('Anotações salvas!', 'sucesso');
        } catch (error) {
            this.mostrarMensagem('Erro ao salvar anotações', 'erro');
        }
    }

    limparAnotacoes() {
        if (confirm('Limpar todas as anotações?')) {
            document.getElementById('anotacoesGM').value = '';
        }
    }

    // ====== UI UTILITIES ======
    mostrarLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = 'flex';
    }

    esconderLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = 'none';
    }

    mostrarMensagem(texto, tipo = 'info') {
        const cores = {
            sucesso: '#27ae60',
            erro: '#e74c3c',
            aviso: '#f39c12',
            info: '#3498db'
        };
        
        const mensagem = document.createElement('div');
        mensagem.className = 'mensagem-flutuante';
        mensagem.textContent = texto;
        mensagem.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${cores[tipo]};
            color: white;
            border-radius: 6px;
            z-index: 9999;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(mensagem);
        
        setTimeout(() => {
            mensagem.remove();
        }, 3000);
    }
}

// ====== INICIALIZAÇÃO ======
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando Ficha GM...');
    
    // Adicionar estilos CSS para vantagens/desvantagens
    const estilos = document.createElement('style');
    estilos.textContent = `
        .vantagem-item, .desvantagem-item, .pericia-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px;
            margin-bottom: 5px;
            border-radius: 4px;
            transition: all 0.3s ease;
        }
        
        .vantagem-item {
            background: rgba(46, 204, 113, 0.1);
            border-left: 3px solid #27ae60;
        }
        
        .desvantagem-item {
            background: rgba(231, 76, 60, 0.1);
            border-left: 3px solid #e74c3c;
        }
        
        .pericia-item {
            background: rgba(52, 152, 219, 0.1);
            border-left: 3px solid #3498db;
        }
        
        .vantagem-item:hover, .desvantagem-item:hover, .pericia-item:hover {
            transform: translateX(2px);
        }
        
        .positivo {
            background: rgba(46, 204, 113, 0.3);
            color: #27ae60;
            padding: 2px 8px;
            border-radius: 12px;
            font-weight: bold;
        }
        
        .negativo {
            background: rgba(231, 76, 60, 0.3);
            color: #e74c3c;
            padding: 2px 8px;
            border-radius: 12px;
            font-weight: bold;
        }
    `;
    document.head.appendChild(estilos);
    
    // Inicializar sistema
    new FichaGM();
});

// Exportar para debug
window.FichaGM = FichaGM;
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

// ====== CLASSE PRINCIPAL ======
class FichaGM {
    constructor() {
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Inicializando Ficha GM...');
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
            this.mostrarMensagem('Ficha carregada com sucesso!', 'sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar:', error);
            this.mostrarMensagem('Erro ao carregar ficha: ' + error.message, 'erro');
            this.esconderLoading();
        }
    }

    // ====== 1. EXTRAIR PARÂMETROS ======
    extrairParametrosURLCorretos() {
        const params = new URLSearchParams(window.location.search);
        
        personagemId = params.get('character');
        campanhaId = params.get('campaign');
        vinculoId = params.get('link');
        
        console.log('📋 Parâmetros:', { 
            personagemId, 
            campanhaId, 
            vinculoId 
        });
        
        if (!personagemId || !campanhaId) {
            throw new Error('URL inválida. É necessário character e campaign.');
        }
    }

    // ====== 2. CARREGAR DADOS DO PERSONAGEM ======
    async carregarDadosPersonagem() {
        console.log('📥 Buscando dados do personagem...');
        
        try {
            // TENTAR DA VIEW PRIMEIRO
            const { data: viewData, error: viewError } = await supabase
                .from('gm_characters_view')
                .select('*')
                .eq('character_id', personagemId)
                .eq('campaign_id', campanhaId)
                .single();
            
            if (!viewError && viewData) {
                dadosPersonagem = viewData;
                console.log('✅ Dados da VIEW carregados:', dadosPersonagem);
                return;
            }
            
            console.log('🔄 View não encontrada, buscando das tabelas...');
            
            // FALLBACK: Buscar das tabelas separadas
            const { data: characterData, error: characterError } = await supabase
                .from('characters')
                .select(`
                    *,
                    campaign_characters!inner(
                        gm_notes,
                        is_frozen,
                        status
                    )
                `)
                .eq('id', personagemId)
                .eq('campaign_characters.campaign_id', campanhaId)
                .single();
            
            if (characterError) throw characterError;
            
            dadosPersonagem = characterData;
            console.log('✅ Dados do personagem carregados:', dadosPersonagem);
            
        } catch (error) {
            console.error('❌ Erro ao carregar personagem:', error);
            throw error;
        }
    }

    // ====== 3. CARREGAR DADOS DA CAMPANHA ======
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
                console.log('✅ Dados da campanha carregados:', dadosCampanha);
            } else {
                dadosCampanha = { 
                    gm_notes: '', 
                    is_frozen: false,
                    status: 'active'
                };
                console.log('⚠️ Dados da campanha padrão usados');
            }
        } catch (error) {
            dadosCampanha = { 
                gm_notes: '', 
                is_frozen: false,
                status: 'active'
            };
            console.warn('⚠️ Erro ao carregar dados da campanha:', error);
        }
    }

    // ====== 4. ATUALIZAR INTERFACE COMPLETA ======
    atualizarInterfaceCompleta() {
        if (!dadosPersonagem) {
            throw new Error('Dados do personagem não carregados');
        }
        
        console.log('🎨 Atualizando interface completa...');
        
        // 1. CARD DO PERSONAGEM (o que sumiu)
        this.atualizarCardPersonagem();
        
        // 2. Atributos
        this.atualizarAtributos();
        
        // 3. Status (PV/PF/Dinheiro)
        this.atualizarStatus();
        
        // 4. Vantagens
        this.atualizarVantagens();
        
        // 5. Desvantagens
        this.atualizarDesvantagens();
        
        // 6. Perícias
        this.atualizarPericias();
        
        // 7. Magias
        this.atualizarMagias();
        
        // 8. Equipamento
        this.atualizarEquipamento();
        
        // 9. Status de combate
        this.atualizarStatusCombate();
        
        // 10. Movimento e carga
        this.atualizarMovimentoCarga();
        
        // 11. Anotações do GM
        this.atualizarAnotacoes();
        
        console.log('✅ Interface atualizada com sucesso!');
    }

    // ====== 4.1 ATUALIZAR CARD DO PERSONAGEM ======
    atualizarCardPersonagem() {
        console.log('🖼️ Atualizando card do personagem...');
        
        // NOME
        const nome = dadosPersonagem.nome || dadosPersonagem.character_name || 'Sem nome';
        document.getElementById('nomePersonagem').textContent = nome;
        console.log('📝 Nome:', nome);
        
        // RAÇA
        const raca = dadosPersonagem.raca || dadosPersonagem.race || 'Sem raça';
        document.getElementById('racaPersonagem').textContent = raca;
        console.log('🧬 Raça:', raca);
        
        // CLASSE
        const classe = dadosPersonagem.classe || 'Aventureiro';
        document.getElementById('classePersonagem').textContent = classe;
        console.log('⚔️ Classe:', classe);
        
        // NÍVEL
        const nivel = dadosPersonagem.nivel || 'Nível 1';
        document.getElementById('nivelPersonagem').textContent = nivel;
        console.log('📊 Nível:', nivel);
        
        // PONTOS
        const pontos = dadosPersonagem.pontos_totais || dadosPersonagem.total_points || 0;
        document.getElementById('pontosPersonagem').textContent = `${pontos} pontos`;
        console.log('💰 Pontos:', pontos);
        
        // DESCRIÇÃO
        const descricao = dadosPersonagem.descricao || dadosPersonagem.description || 'Sem descrição.';
        document.getElementById('descricaoPersonagem').textContent = descricao;
        console.log('📋 Descrição:', descricao.substring(0, 50) + '...');
        
        // CAMPANHA E JOGADOR
        if (dadosPersonagem.campaign_name) {
            document.getElementById('nomeCampanha').textContent = dadosPersonagem.campaign_name;
        }
        
        if (dadosPersonagem.player_username) {
            document.getElementById('nomeJogador').textContent = dadosPersonagem.player_username;
        }
        
        // FOTO DO PERSONAGEM (CRÍTICO - o que sumiu)
        const img = document.getElementById('fotoPersonagem');
        const placeholder = document.getElementById('placeholderFoto');
        
        if (dadosPersonagem.avatar_url) {
            img.src = dadosPersonagem.avatar_url;
            img.style.display = 'block';
            placeholder.style.display = 'none';
            console.log('🖼️ Foto carregada:', dadosPersonagem.avatar_url);
        } else {
            img.style.display = 'none';
            placeholder.style.display = 'flex';
            console.log('🖼️ Usando placeholder (sem foto)');
        }
    }

    // ====== 4.2 ATUALIZAR ATRIBUTOS ======
    atualizarAtributos() {
        console.log('📊 Atualizando atributos...');
        
        // PEGAR VALORES REAIS
        const ST = dadosPersonagem.forca || dadosPersonagem.st || 10;
        const DX = dadosPersonagem.destreza || dadosPersonagem.dx || 10;
        const IQ = dadosPersonagem.inteligencia || dadosPersonagem.iq || 10;
        const HT = dadosPersonagem.saude || dadosPersonagem.ht || 10;
        
        console.log('🎯 Atributos:', { ST, DX, IQ, HT });
        
        // Atualizar valores
        document.getElementById('gmST').textContent = ST;
        document.getElementById('gmDX').textContent = DX;
        document.getElementById('gmIQ').textContent = IQ;
        document.getElementById('gmHT').textContent = HT;
        
        // Calcular modificadores
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
    }

    // ====== 4.3 ATUALIZAR STATUS ======
    atualizarStatus() {
        console.log('❤️ Atualizando status...');
        
        // PV
        const pvAtual = dadosPersonagem.pv_atual || dadosPersonagem.current_hp || 10;
        const pvMaximo = dadosPersonagem.pv_maximo || dadosPersonagem.max_hp || 
                        dadosPersonagem.pontos_vida || 10;
        
        document.getElementById('pvAtualGM').textContent = pvAtual;
        document.getElementById('pvMaximoGM').textContent = pvMaximo;
        console.log('❤️ PV:', `${pvAtual}/${pvMaximo}`);
        
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
        console.log('⚡ PF:', `${pfAtual}/${pfMaximo}`);
        
        // DINHEIRO
        const dinheiro = dadosPersonagem.dinheiro || dadosPersonagem.money || 0;
        document.getElementById('dinheiroGM').textContent = `$${dinheiro}`;
        console.log('💰 Dinheiro:', dinheiro);
    }

    // ====== 4.4 ATUALIZAR VANTAGENS ======
    atualizarVantagens() {
        console.log('⭐ Atualizando vantagens...');
        const container = document.getElementById('listaVantagensGM');
        if (!container) return;
        
        let vantagens = [];
        
        try {
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
            vantagens = [];
        }
        
        container.innerHTML = '';
        
        if (!vantagens || vantagens.length === 0) {
            container.innerHTML = `
                <div class="vantagem-item">
                    <span class="nome-vantagem">Nenhuma vantagem</span>
                    <span class="custo-vantagem">0</span>
                </div>
            `;
            document.getElementById('totalVantagensGM').textContent = '0';
            console.log('⭐ Nenhuma vantagem encontrada');
            return;
        }
        
        // Ordenar por custo (maior primeiro)
        vantagens.sort((a, b) => (b.custo || b.cost || 0) - (a.custo || a.cost || 0));
        
        // Limitar a 10 para exibição
        const vantagensExibir = vantagens.slice(0, 10);
        
        vantagensExibir.forEach(vantagem => {
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
        
        // Mostrar contador se tiver mais
        if (vantagens.length > 10) {
            const extra = document.createElement('div');
            extra.className = 'vantagem-item extra';
            extra.innerHTML = `
                <span class="nome-vantagem" style="font-style: italic;">
                    +${vantagens.length - 10} vantagens adicionais
                </span>
                <span class="custo-vantagem">...</span>
            `;
            container.appendChild(extra);
        }
        
        document.getElementById('totalVantagensGM').textContent = vantagens.length;
        console.log(`✅ ${vantagens.length} vantagens exibidas`);
    }

    // ====== 4.5 ATUALIZAR DESVANTAGENS ======
    atualizarDesvantagens() {
        console.log('⚠️ Atualizando desvantagens...');
        const container = document.getElementById('listaDesvantagensGM');
        if (!container) return;
        
        let desvantagens = [];
        
        try {
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
            desvantagens = [];
        }
        
        container.innerHTML = '';
        
        if (!desvantagens || desvantagens.length === 0) {
            container.innerHTML = `
                <div class="desvantagem-item">
                    <span class="nome-desvantagem">Nenhuma desvantagem</span>
                    <span class="custo-desvantagem">0</span>
                </div>
            `;
            document.getElementById('totalDesvantagensGM').textContent = '0';
            console.log('⚠️ Nenhuma desvantagem encontrada');
            return;
        }
        
        // Ordenar por custo absoluto (maior primeiro)
        desvantagens.sort((a, b) => Math.abs(b.custo || b.cost || 0) - Math.abs(a.custo || a.cost || 0));
        
        // Limitar a 10 para exibição
        const desvantagensExibir = desvantagens.slice(0, 10);
        
        desvantagensExibir.forEach(desvantagem => {
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
        
        // Mostrar contador se tiver mais
        if (desvantagens.length > 10) {
            const extra = document.createElement('div');
            extra.className = 'desvantagem-item extra';
            extra.innerHTML = `
                <span class="nome-desvantagem" style="font-style: italic;">
                    +${desvantagens.length - 10} desvantagens adicionais
                </span>
                <span class="custo-desvantagem">...</span>
            `;
            container.appendChild(extra);
        }
        
        document.getElementById('totalDesvantagensGM').textContent = desvantagens.length;
        console.log(`✅ ${desvantagens.length} desvantagens exibidas`);
    }

        // ====== 4.6 ATUALIZAR PERÍCIAS ======
    atualizarPericias() {
        console.log('🎓 Atualizando perícias...');
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
            pericias = [];
        }
        
        container.innerHTML = '';
        
        if (!pericias || pericias.length === 0) {
            container.innerHTML = `
                <div class="pericia-item">
                    <span class="nome-pericia">Nenhuma perícia</span>
                    <span class="nivel-pericia">-</span>
                </div>
            `;
            if (totalElement) totalElement.textContent = '0';
            console.log('🎓 Nenhuma perícia encontrada');
            return;
        }
        
        // Ordenar por nível (maior primeiro) e pegar top 8
        const topPericias = [...pericias]
            .sort((a, b) => (b.nivel || b.level || 0) - (a.nivel || a.level || 0))
            .slice(0, 8);
        
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
        
        // Mostrar contador se tiver mais
        if (pericias.length > 8) {
            const extra = document.createElement('div');
            extra.className = 'pericia-item extra';
            extra.innerHTML = `
                <span class="nome-pericia" style="font-style: italic;">
                    +${pericias.length - 8} perícias adicionais
                </span>
                <span class="nivel-pericia">...</span>
            `;
            container.appendChild(extra);
        }
        
        // Atualizar total
        if (totalElement) {
            totalElement.textContent = pericias.length;
        }
        
        console.log(`✅ ${pericias.length} perícias processadas (mostrando ${topPericias.length})`);
    }

    // ====== 4.7 ATUALIZAR MAGIAS ======
    atualizarMagias() {
        console.log('🔮 Atualizando magias...');
        const container = document.getElementById('listaMagiasGM');
        const totalElement = document.getElementById('totalMagias');
        
        if (!container) return;
        
        let magias = [];
        
        try {
            if (dadosPersonagem.magias) {
                if (typeof dadosPersonagem.magias === 'string') {
                    magias = JSON.parse(dadosPersonagem.magias);
                } else if (Array.isArray(dadosPersonagem.magias)) {
                    magias = dadosPersonagem.magias;
                }
            } else if (dadosPersonagem.spells) {
                if (typeof dadosPersonagem.spells === 'string') {
                    magias = JSON.parse(dadosPersonagem.spells);
                } else if (Array.isArray(dadosPersonagem.spells)) {
                    magias = dadosPersonagem.spells;
                }
            }
        } catch (e) {
            console.error('❌ Erro ao processar magias:', e);
            magias = [];
        }
        
        container.innerHTML = '';
        
        if (!magias || magias.length === 0) {
            container.innerHTML = `
                <div class="magia-item">
                    <span class="nome-magia">Nenhuma magia</span>
                    <span class="nivel-magia">-</span>
                </div>
            `;
            if (totalElement) totalElement.textContent = '0';
            console.log('🔮 Nenhuma magia encontrada');
            return;
        }
        
        // Ordenar por nível (maior primeiro) e pegar top 6
        const topMagias = [...magias]
            .sort((a, b) => (b.nivel || b.level || 0) - (a.nivel || a.level || 0))
            .slice(0, 6);
        
        topMagias.forEach(magia => {
            const nome = magia.nome || magia.name || 'Magia';
            const nivel = magia.nivel || magia.level || 0;
            
            const item = document.createElement('div');
            item.className = 'magia-item';
            
            item.innerHTML = `
                <span class="nome-magia">${this.escapeHtml(nome)}</span>
                <span class="nivel-magia">${nivel}</span>
            `;
            
            // Tooltip com descrição
            if (magia.descricao || magia.description) {
                item.title = this.escapeHtml(magia.descricao || magia.description);
            }
            
            container.appendChild(item);
        });
        
        // Mostrar contador se tiver mais
        if (magias.length > 6) {
            const extra = document.createElement('div');
            extra.className = 'magia-item extra';
            extra.innerHTML = `
                <span class="nome-magia" style="font-style: italic;">
                    +${magias.length - 6} magias adicionais
                </span>
                <span class="nivel-magia">...</span>
            `;
            container.appendChild(extra);
        }
        
        if (totalElement) {
            totalElement.textContent = magias.length;
        }
        
        console.log(`✅ ${magias.length} magias processadas (mostrando ${topMagias.length})`);
    }

    // ====== 4.8 ATUALIZAR EQUIPAMENTO ======
    atualizarEquipamento() {
        console.log('🎒 Atualizando equipamento...');
        const container = document.getElementById('listaEquipamentoRapido');
        
        if (!container) return;
        
        let equipamento = [];
        
        try {
            if (dadosPersonagem.equipamento) {
                if (typeof dadosPersonagem.equipamento === 'string') {
                    equipamento = JSON.parse(dadosPersonagem.equipamento);
                } else if (Array.isArray(dadosPersonagem.equipamento)) {
                    equipamento = dadosPersonagem.equipamento;
                }
            } else if (dadosPersonagem.equipment) {
                if (typeof dadosPersonagem.equipment === 'string') {
                    equipamento = JSON.parse(dadosPersonagem.equipment);
                } else if (Array.isArray(dadosPersonagem.equipment)) {
                    equipamento = dadosPersonagem.equipment;
                }
            }
        } catch (e) {
            console.error('❌ Erro ao processar equipamento:', e);
            equipamento = [];
        }
        
        container.innerHTML = '';
        
        if (!equipamento || equipamento.length === 0) {
            container.innerHTML = `
                <div class="equipamento-item">
                    <span class="nome-equipamento">Nenhum equipamento</span>
                    <span class="peso-equipamento">-</span>
                </div>
            `;
            console.log('🎒 Nenhum equipamento encontrado');
            return;
        }
        
        // Pegar os primeiros 5 itens
        const equipamentoExibir = equipamento.slice(0, 5);
        
        equipamentoExibir.forEach(item => {
            const nome = item.nome || item.name || 'Item';
            const peso = item.peso || item.weight || '0';
            
            const div = document.createElement('div');
            div.className = 'equipamento-item';
            
            div.innerHTML = `
                <span class="nome-equipamento">${this.escapeHtml(nome)}</span>
                <span class="peso-equipamento">${peso} lb</span>
            `;
            
            // Tooltip com descrição
            if (item.descricao || item.description) {
                div.title = this.escapeHtml(item.descricao || item.description);
            }
            
            container.appendChild(div);
        });
        
        // Mostrar contador se tiver mais
        if (equipamento.length > 5) {
            const extra = document.createElement('div');
            extra.className = 'equipamento-item extra';
            extra.innerHTML = `
                <span class="nome-equipamento" style="font-style: italic;">
                    +${equipamento.length - 5} itens adicionais
                </span>
                <span class="peso-equipamento">...</span>
            `;
            container.appendChild(extra);
        }
        
        console.log(`✅ ${equipamento.length} itens de equipamento processados`);
    }

    // ====== 4.9 ATUALIZAR STATUS DE COMBATE ======
    atualizarStatusCombate() {
        console.log('⚔️ Atualizando status de combate...');
        
        // Esquiva (DX/2 + 3)
        const destreza = dadosPersonagem.destreza || dadosPersonagem.dx || 10;
        const esquivaCalculada = Math.floor(destreza / 2) + 3;
        const esquiva = dadosPersonagem.esquiva || dadosPersonagem.dodge || esquivaCalculada;
        
        document.getElementById('gmEsquiva').textContent = esquiva;
        console.log('🛡️ Esquiva:', esquiva);
        
        // Dano (se disponível)
        if (dadosPersonagem.dano_gdp || dadosPersonagem.thrust_damage) {
            document.getElementById('gmDanoGolpe').textContent = 
                dadosPersonagem.dano_gdp || dadosPersonagem.thrust_damage;
        }
        
        if (dadosPersonagem.dano_geb || dadosPersonagem.swing_damage) {
            document.getElementById('gmDanoArremesso').textContent = 
                dadosPersonagem.dano_geb || dadosPersonagem.swing_damage;
        }
        
        // Bloqueio e Aparar (se disponível)
        if (dadosPersonagem.bloqueio) {
            document.getElementById('gmBloqueio').textContent = dadosPersonagem.bloqueio;
        }
        
        if (dadosPersonagem.aparar) {
            document.getElementById('gmAparar').textContent = dadosPersonagem.aparar;
        }
    }

    // ====== 4.10 ATUALIZAR MOVIMENTO E CARGA ======
    atualizarMovimentoCarga() {
        console.log('🏃 Atualizando movimento e carga...');
        
        // Deslocamento
        const deslocamento = dadosPersonagem.deslocamento || dadosPersonagem.basic_move || 5;
        const bonusMovimento = dadosPersonagem.bonus_deslocamento || dadosPersonagem.move_bonus || 0;
        
        document.getElementById('gmDeslocamento').textContent = deslocamento;
        document.getElementById('gmBonusMovimento').textContent = bonusMovimento;
        console.log('🏃 Deslocamento:', deslocamento, 'Bônus:', bonusMovimento);
        
        // Carga (sem "lb")
        const cargaAtual = dadosPersonagem.peso_atual || dadosPersonagem.current_weight || 0;
        const cargaMaxima = dadosPersonagem.peso_maximo || dadosPersonagem.max_weight || 0;
        
        document.getElementById('gmCargaAtual').textContent = cargaAtual;
        document.getElementById('gmCargaMaxima').textContent = cargaMaxima;
        console.log('📦 Carga:', `${cargaAtual}/${cargaMaxima}`);
    }

    // ====== 4.11 ATUALIZAR ANOTAÇÕES ======
    atualizarAnotacoes() {
        console.log('📝 Atualizando anotações...');
        const textarea = document.getElementById('anotacoesGM');
        if (textarea && dadosCampanha?.gm_notes) {
            textarea.value = dadosCampanha.gm_notes;
            console.log('📝 Anotações carregadas:', dadosCampanha.gm_notes.length, 'caracteres');
        }
    }

    // ====== 5. CONFIGURAR EVENT LISTENERS ======
    configurarEventListeners() {
        console.log('🎮 Configurando eventos...');
        
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
        const btnVoltar = document.getElementById('btnVoltarCampanha');
        if (btnVoltar) {
            btnVoltar.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = `campanha.html?id=${campanhaId}`;
            });
        }

        // Botão sincronizar
        const btnSincronizar = document.getElementById('btnSincronizar');
        if (btnSincronizar) {
            btnSincronizar.addEventListener('click', () => {
                this.sincronizarDados();
            });
        }

        // Botão congelar
        const btnCongelar = document.getElementById('btnCongelar');
        if (btnCongelar) {
            btnCongelar.addEventListener('click', () => {
                this.congelarPersonagem();
            });
        }

        // Botão remover
        const btnRemover = document.getElementById('btnRemover');
        if (btnRemover) {
            btnRemover.addEventListener('click', () => {
                this.removerPersonagem();
            });
        }

        // Anotações
        const btnSalvarAnotacoes = document.getElementById('btnSalvarAnotacoes');
        if (btnSalvarAnotacoes) {
            btnSalvarAnotacoes.addEventListener('click', () => {
                this.salvarAnotacoes();
            });
        }

        const btnLimparAnotacoes = document.getElementById('btnLimparAnotacoes');
        if (btnLimparAnotacoes) {
            btnLimparAnotacoes.addEventListener('click', () => {
                this.limparAnotacoes();
            });
        }

        // Controles de PV/PF
        document.querySelectorAll('.btn-controle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const acao = e.currentTarget.dataset.acao;
                const valor = parseInt(e.currentTarget.dataset.valor);
                this.aplicarControleRapido(acao, valor);
            });
        });

        // PV customizado
        const btnAplicarPvCustom = document.getElementById('btnAplicarPvCustom');
        const inputPvCustom = document.getElementById('inputPvCustom');
        
        if (btnAplicarPvCustom && inputPvCustom) {
            btnAplicarPvCustom.addEventListener('click', () => {
                const valor = parseInt(inputPvCustom.value);
                if (!isNaN(valor) && valor > 0) {
                    this.aplicarPvCustom(valor);
                    inputPvCustom.value = '';
                }
            });
            
            // Permitir Enter no input
            inputPvCustom.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    btnAplicarPvCustom.click();
                }
            });
        }

        console.log('✅ Eventos configurados!');
    }

    // ====== 6. SISTEMA DE SINCRONIZAÇÃO ======
    iniciarSincronizacao() {
        // Sincronizar a cada 30 segundos
        this.intervaloSincronizacao = setInterval(() => {
            this.sincronizarDados();
        }, 30000);
        
        console.log('🔄 Sincronização automática configurada (30 segundos)');
    }

    async sincronizarDados() {
        console.log('🔄 Sincronizando dados...');
        try {
            await this.carregarDadosPersonagem();
            await this.carregarDadosCampanha();
            this.atualizarInterfaceCompleta();
            this.mostrarMensagem('Dados atualizados em tempo real!', 'info');
        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
            this.mostrarMensagem('Erro ao sincronizar: ' + error.message, 'erro');
        }
    }
    // ====== FUNÇÕES DE CONTROLE RÁPIDO ======
    aplicarControleRapido(acao, valor) {
        console.log(`🎮 Controle rápido: ${acao} ${valor}`);
        
        // Obter valores atuais
        const pvAtualElement = document.getElementById('pvAtualGM');
        const pfAtualElement = document.getElementById('pfAtualGM');
        const dinheiroElement = document.getElementById('dinheiroGM');
        
        let pvAtual = parseInt(pvAtualElement.textContent) || 0;
        let pfAtual = parseInt(pfAtualElement.textContent) || 0;
        let dinheiroTexto = dinheiroElement.textContent || '$0';
        let dinheiro = parseInt(dinheiroTexto.replace('$', '')) || 0;
        
        switch (acao) {
            case 'dano':
                pvAtual = Math.max(0, pvAtual - valor);
                pvAtualElement.textContent = pvAtual;
                this.atualizarIndicadorPV();
                console.log(`💥 Dano: -${valor} PV → ${pvAtual}`);
                break;
                
            case 'cura':
                const pvMaximo = parseInt(document.getElementById('pvMaximoGM').textContent) || 10;
                pvAtual = Math.min(pvMaximo, pvAtual + valor);
                pvAtualElement.textContent = pvAtual;
                this.atualizarIndicadorPV();
                console.log(`❤️ Cura: +${valor} PV → ${pvAtual}`);
                break;
                
            case 'fadiga':
                pfAtual = Math.max(0, pfAtual - valor);
                pfAtualElement.textContent = pfAtual;
                console.log(`😴 Fadiga: -${valor} PF → ${pfAtual}`);
                break;
                
            case 'recuperar':
                const pfMaximo = parseInt(document.getElementById('pfMaximoGM').textContent) || 10;
                pfAtual = Math.min(pfMaximo, pfAtual + valor);
                pfAtualElement.textContent = pfAtual;
                console.log(`⚡ Recuperar: +${valor} PF → ${pfAtual}`);
                break;
                
            case 'dinheiro':
                dinheiro += valor;
                dinheiroElement.textContent = `$${dinheiro}`;
                console.log(`💰 Dinheiro: +${valor} → $${dinheiro}`);
                break;
        }
        
        // Salvar alterações
        this.salvarAlteracoesRapidas({ pvAtual, pfAtual, dinheiro });
    }
    
    aplicarPvCustom(valor) {
        console.log(`🎯 PV personalizado: ${valor}`);
        const pvAtualElement = document.getElementById('pvAtualGM');
        const pvMaximo = parseInt(document.getElementById('pvMaximoGM').textContent) || 10;
        
        let pvAtual = parseInt(pvAtualElement.textContent) || 0;
        
        if (valor > 0) {
            // Cura
            pvAtual = Math.min(pvMaximo, pvAtual + valor);
            console.log(`❤️ Cura personalizada: +${valor} PV → ${pvAtual}`);
        } else {
            // Dano
            pvAtual = Math.max(0, pvAtual - Math.abs(valor));
            console.log(`💥 Dano personalizado: ${valor} PV → ${pvAtual}`);
        }
        
        pvAtualElement.textContent = pvAtual;
        this.atualizarIndicadorPV();
        
        // Salvar alteração
        this.salvarAlteracoesRapidas({ pvAtual });
    }
    
    atualizarIndicadorPV() {
        const pvAtual = parseInt(document.getElementById('pvAtualGM').textContent) || 0;
        const pvMaximo = parseInt(document.getElementById('pvMaximoGM').textContent) || 10;
        const pvPercent = (pvAtual / pvMaximo) * 100;
        const indicator = document.getElementById('pvStatus');
        
        if (pvPercent > 50) {
            indicator.style.background = '#27ae60';
        } else if (pvPercent > 25) {
            indicator.style.background = '#f39c12';
        } else {
            indicator.style.background = '#e74c3c';
        }
    }

    // ====== FUNÇÕES DO GM ======
    async congelarPersonagem() {
        if (!confirm('❄️ Congelar este personagem? O jogador não poderá fazer alterações.')) {
            return;
        }
        
        try {
            const { error } = await supabase
                .from('campaign_characters')
                .update({ 
                    is_frozen: true,
                    updated_at: new Date().toISOString()
                })
                .eq('character_id', personagemId)
                .eq('campaign_id', campanhaId);
            
            if (error) throw error;
            
            this.mostrarMensagem('✅ Personagem congelado com sucesso!', 'sucesso');
            dadosCampanha.is_frozen = true;
        } catch (error) {
            console.error('❌ Erro ao congelar:', error);
            this.mostrarMensagem('❌ Erro ao congelar: ' + error.message, 'erro');
        }
    }
    
    async removerPersonagem() {
        if (!confirm('⚠️ ATENÇÃO: Remover este personagem da campanha?\n\nEsta ação não pode ser desfeita.')) {
            return;
        }
        
        try {
            const { error } = await supabase
                .from('campaign_characters')
                .update({ 
                    status: 'removed',
                    updated_at: new Date().toISOString()
                })
                .eq('character_id', personagemId)
                .eq('campaign_id', campanhaId);
            
            if (error) throw error;
            
            this.mostrarMensagem('✅ Personagem removido da campanha!', 'sucesso');
            
            // Voltar após 2 segundos
            setTimeout(() => {
                window.location.href = `campanha.html?id=${campanhaId}`;
            }, 2000);
            
        } catch (error) {
            console.error('❌ Erro ao remover:', error);
            this.mostrarMensagem('❌ Erro ao remover: ' + error.message, 'erro');
        }
    }
    
    async salvarAnotacoes() {
        const textarea = document.getElementById('anotacoesGM');
        if (!textarea) return;
        
        const notas = textarea.value.trim();
        
        try {
            const { error } = await supabase
                .from('campaign_characters')
                .update({ 
                    gm_notes: notas,
                    updated_at: new Date().toISOString()
                })
                .eq('character_id', personagemId)
                .eq('campaign_id', campanhaId);
            
            if (error) throw error;
            
            this.mostrarMensagem('✅ Anotações salvas com sucesso!', 'sucesso');
            dadosCampanha.gm_notes = notas;
        } catch (error) {
            console.error('❌ Erro ao salvar anotações:', error);
            this.mostrarMensagem('❌ Erro ao salvar: ' + error.message, 'erro');
        }
    }
    
    limparAnotacoes() {
        if (!confirm('🗑️ Limpar todas as anotações?')) return;
        
        const textarea = document.getElementById('anotacoesGM');
        if (textarea) {
            textarea.value = '';
        }
    }
    
    async salvarAlteracoesRapidas(dados) {
        try {
            const atualizacao = {
                updated_at: new Date().toISOString()
            };
            
            // Adicionar apenas os campos que foram alterados
            if (dados.pvAtual !== undefined) {
                atualizacao.pv_atual = dados.pvAtual;
            }
            
            if (dados.pfAtual !== undefined) {
                atualizacao.pf_atual = dados.pfAtual;
            }
            
            if (dados.dinheiro !== undefined) {
                atualizacao.dinheiro = dados.dinheiro;
            }
            
            const { error } = await supabase
                .from('characters')
                .update(atualizacao)
                .eq('id', personagemId);
            
            if (error) {
                console.warn('⚠️ Erro ao salvar alterações rápidas:', error);
            } else {
                console.log('✅ Alterações rápidas salvas:', dados);
            }
        } catch (error) {
            console.warn('⚠️ Erro ao salvar alterações:', error);
        }
    }

    // ====== FUNÇÕES DE UI ======
    mudarAba(abaId) {
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('ativo'));
        document.querySelectorAll('.conteudo-aba').forEach(aba => aba.classList.remove('ativo'));

        const tabAtiva = document.querySelector(`.tab[data-tab="${abaId}"]`);
        const abaAtiva = document.getElementById(`aba-${abaId}`);
        
        if (tabAtiva && abaAtiva) {
            tabAtiva.classList.add('ativo');
            abaAtiva.classList.add('ativo');
            console.log(`📑 Aba alterada para: ${abaId}`);
        }
    }

    alterarModoVisualizacao(modo) {
        document.querySelectorAll('.botao-visualizacao').forEach(btn => {
            btn.classList.remove('ativo');
            if (btn.dataset.visao === modo) {
                btn.classList.add('ativo');
            }
        });
        
        console.log(`👁️ Modo de visualização: ${modo}`);
        
        if (modo === 'campanha') {
            // Lógica para modo "dados da campanha"
            this.mostrarMensagem('📚 Visualizando dados da campanha', 'info');
        } else {
            // Lógica para modo "ao vivo"
            this.mostrarMensagem('🔄 Visualização em tempo real ativada', 'info');
        }
    }

    // ====== UTILITÁRIOS ======
    mostrarLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            console.log('⏳ Mostrando loading...');
        }
    }

    esconderLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
            console.log('✅ Loading escondido');
        }
    }

    mostrarMensagem(texto, tipo = 'info') {
        console.log(`💬 Mensagem [${tipo}]: ${texto}`);
        
        const cores = {
            sucesso: '#27ae60',
            erro: '#e74c3c',
            aviso: '#f39c12',
            info: '#3498db'
        };
        
        const icones = {
            sucesso: 'fas fa-check-circle',
            erro: 'fas fa-exclamation-circle',
            aviso: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        // Remover mensagens antigas
        const mensagensAntigas = document.querySelectorAll('.mensagem-flutuante');
        mensagensAntigas.forEach(msg => msg.remove());
        
        // Criar nova mensagem
        const mensagem = document.createElement('div');
        mensagem.className = 'mensagem-flutuante';
        mensagem.innerHTML = `
            <i class="${icones[tipo]}"></i>
            <span>${texto}</span>
        `;
        
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
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(mensagem);
        
        // Auto-remover após 3 segundos
        setTimeout(() => {
            mensagem.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => mensagem.remove(), 300);
        }, 3000);
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ====== INICIALIZAÇÃO ======
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM pronto, inicializando Ficha GM...');
    
    // Adicionar animações CSS
    const estilos = document.createElement('style');
    estilos.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        /* Estilos para vantagens/desvantagens */
        .vantagem-item, .desvantagem-item, .pericia-item, .magia-item, .equipamento-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px;
            margin-bottom: 5px;
            border-radius: 4px;
            transition: all 0.3s ease;
            cursor: default;
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
        
        .magia-item {
            background: rgba(155, 89, 182, 0.1);
            border-left: 3px solid #9b59b6;
        }
        
        .equipamento-item {
            background: rgba(243, 156, 18, 0.1);
            border-left: 3px solid #f39c12;
        }
        
        .vantagem-item:hover, .desvantagem-item:hover, 
        .pericia-item:hover, .magia-item:hover, 
        .equipamento-item:hover {
            transform: translateX(2px);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .positivo {
            background: rgba(46, 204, 113, 0.3);
            color: #27ae60;
            padding: 2px 8px;
            border-radius: 12px;
            font-weight: bold;
            font-size: 0.9em;
        }
        
        .negativo {
            background: rgba(231, 76, 60, 0.3);
            color: #e74c3c;
            padding: 2px 8px;
            border-radius: 12px;
            font-weight: bold;
            font-size: 0.9em;
        }
        
        .extra {
            opacity: 0.7;
            font-style: italic;
        }
        
        /* Loading */
        .loading-content {
            text-align: center;
        }
        
        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 4px solid #ff8c00;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(estilos);
    
    // Inicializar sistema
    try {
        window.fichaGM = new FichaGM();
        console.log('✅ Ficha GM inicializada com sucesso!');
    } catch (error) {
        console.error('❌ ERRO CRÍTICO ao inicializar Ficha GM:', error);
        
        // Mostrar erro para o usuário
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.innerHTML = `
                <div class="loading-content">
                    <div style="color: #e74c3c; font-size: 3rem; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 style="color: #e74c3c;">Erro ao carregar ficha</h3>
                    <p style="color: #ccc; margin-bottom: 20px;">${error.message}</p>
                    <button onclick="window.location.reload()" style="
                        background: #3498db;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                    ">
                        <i class="fas fa-redo"></i> Tentar novamente
                    </button>
                </div>
            `;
        }
    }
});

// Exportar para debug
window.FichaGM = FichaGM;

console.log('📄 logica-ficha-gm.js carregado e pronto!');
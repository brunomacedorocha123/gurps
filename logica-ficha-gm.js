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
let intervaloAtualizacao = null;

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
            
            // 4. Atualizar interface
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

    // ====== EXTRAIR PARÂMETROS DA URL ======
    extrairParametrosURLCorretos() {
        const params = new URLSearchParams(window.location.search);
        
        // AGORA COM OS NOMES CORRETOS DA SUA URL!
        personagemId = params.get('character');
        campanhaId = params.get('campaign');
        vinculoId = params.get('link');
        
        console.log('📋 Parâmetros da URL:', {
            character: personagemId,
            campaign: campanhaId,
            link: vinculoId
        });
        
        if (!personagemId || !campanhaId) {
            throw new Error('URL inválida. É necessário character e campaign.');
        }
    }

    // ====== CARREGAMENTO DE DADOS ======
    async carregarDadosPersonagem() {
        console.log('📥 Buscando dados do personagem ID:', personagemId);
        
        try {
            // PRIMEIRO: Tentar pegar da VIEW gm_characters_view
            if (vinculoId) {
                const { data: viewData, error: viewError } = await supabase
                    .from('gm_characters_view')
                    .select('*')
                    .eq('vinculo_id', vinculoId)
                    .single();
                
                if (!viewError && viewData) {
                    console.log('✅ Dados da VIEW:', viewData);
                    dadosPersonagem = viewData;
                    return;
                }
            }
            
            // SEGUNDO: Se não tiver view, buscar direto da tabela characters
            console.log('🔄 Buscando diretamente da tabela characters...');
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
            console.warn('⚠️ Erro ao buscar dados da campanha:', error);
            dadosCampanha = { gm_notes: '', is_frozen: false };
        }
    }

    // ====== ATUALIZAR INTERFACE ======
    atualizarInterfaceCompleta() {
        if (!dadosPersonagem) {
            throw new Error('Dados do personagem não carregados');
        }
        
        console.log('🎨 Atualizando interface com dados:', dadosPersonagem);
        
        // 1. Informações básicas
        this.atualizarInformacoesBasicas();
        
        // 2. Atributos
        this.atualizarAtributosReais();
        
        // 3. Status (PV/PF/Dinheiro)
        this.atualizarStatusReais();
        
        // 4. Vantagens
        this.atualizarVantagensReais();
        
        // 5. Perícias
        this.atualizarPericiasReais();
        
        // 6. Anotações
        this.atualizarAnotacoes();
        
        // 7. Status de combate
        this.atualizarStatusCombate();
        
        console.log('✅ Interface atualizada!');
    }

    atualizarInformacoesBasicas() {
        // Nome do personagem
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
            dadosPersonagem.descricao || dadosPersonagem.description || 'Sem descrição disponível.';
        
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

    atualizarAtributosReais() {
        console.log('🎯 Atualizando atributos com dados reais:', {
            forca: dadosPersonagem.forca,
            destreza: dadosPersonagem.destreza,
            inteligencia: dadosPersonagem.inteligencia,
            saude: dadosPersonagem.saude
        });
        
        // ATRIBUTOS PRINCIPAIS - PEGAR OS VALORES REAIS
        const ST = dadosPersonagem.forca || dadosPersonagem.st || 10;
        const DX = dadosPersonagem.destreza || dadosPersonagem.dx || 10;
        const IQ = dadosPersonagem.inteligencia || dadosPersonagem.iq || 10;
        const HT = dadosPersonagem.saude || dadosPersonagem.ht || 10;
        
        console.log('📊 Atributos finais:', { ST, DX, IQ, HT });
        
        // Atualizar na interface
        document.getElementById('gmST').textContent = ST;
        document.getElementById('gmDX').textContent = DX;
        document.getElementById('gmIQ').textContent = IQ;
        document.getElementById('gmHT').textContent = HT;
        
        // Calcular custos
        const STMod = (ST - 10) * 10;
        const DXMod = (DX - 10) * 20;
        const IQMod = (IQ - 10) * 20;
        const HTMod = (HT - 10) * 10;
        
        document.getElementById('gmSTMod').textContent = `[${STMod >= 0 ? '+' : ''}${STMod}]`;
        document.getElementById('gmDXMod').textContent = `[${DXMod >= 0 ? '+' : ''}${DXMod}]`;
        document.getElementById('gmIQMod').textContent = `[${IQMod >= 0 ? '+' : ''}${IQMod}]`;
        document.getElementById('gmHTMod').textContent = `[${HTMod >= 0 ? '+' : ''}${HTMod}]`;
        
        // Vontade e Percepção
        const vontade = dadosPersonagem.vontade || dadosPersonagem.vontade_base || IQ;
        const percepcao = dadosPersonagem.percepcao || dadosPersonagem.percepcao_base || IQ;
        
        document.getElementById('gmVontade').textContent = vontade;
        document.getElementById('gmPercepcao').textContent = percepcao;
        
        // Carga (sem "lb")
        const cargaAtual = dadosPersonagem.peso_atual || dadosPersonagem.current_weight || 0;
        const cargaMaxima = dadosPersonagem.peso_maximo || dadosPersonagem.max_weight || 0;
        
        document.getElementById('gmCargaAtual').textContent = cargaAtual;
        document.getElementById('gmCargaMaxima').textContent = cargaMaxima;
    }

    atualizarStatusReais() {
        // PV - Pontos de Vida
        const pvAtual = dadosPersonagem.pv_atual || dadosPersonagem.current_hp || 10;
        const pvMaximo = dadosPersonagem.pv_maximo || dadosPersonagem.max_hp || 
                        dadosPersonagem.pontos_vida || 10;
        
        document.getElementById('pvAtualGM').textContent = pvAtual;
        document.getElementById('pvMaximoGM').textContent = pvMaximo;
        
        // Indicador de status
        const pvPercent = (pvAtual / pvMaximo) * 100;
        const indicator = document.getElementById('pvStatus');
        
        if (pvPercent > 50) {
            indicator.style.background = '#27ae60';
        } else if (pvPercent > 25) {
            indicator.style.background = '#f39c12';
        } else {
            indicator.style.background = '#e74c3c';
        }
        
        // PF - Pontos de Fadiga
        const pfAtual = dadosPersonagem.pf_atual || dadosPersonagem.current_fp || 10;
        const pfMaximo = dadosPersonagem.pf_maximo || dadosPersonagem.max_fp || 
                        dadosPersonagem.pontos_fadiga || 10;
        
        document.getElementById('pfAtualGM').textContent = pfAtual;
        document.getElementById('pfMaximoGM').textContent = pfMaximo;
        
        // Dinheiro
        const dinheiro = dadosPersonagem.dinheiro || dadosPersonagem.money || 0;
        document.getElementById('dinheiroGM').textContent = `$${dinheiro}`;
        
        // Movimento
        const deslocamento = dadosPersonagem.deslocamento || dadosPersonagem.basic_move || 5;
        const bonusMovimento = dadosPersonagem.bonus_deslocamento || dadosPersonagem.move_bonus || 0;
        
        document.getElementById('gmDeslocamento').textContent = deslocamento;
        document.getElementById('gmBonusMovimento').textContent = bonusMovimento;
    }

    atualizarVantagensReais() {
        const container = document.getElementById('listaVantagensGM');
        const totalElement = document.getElementById('totalVantagensGM');
        
        if (!container) return;
        
        console.log('🔄 Processando vantagens...');
        
        let vantagens = [];
        
        try {
            // Tentar pegar do campo vantagens (JSON)
            if (dadosPersonagem.vantagens) {
                if (typeof dadosPersonagem.vantagens === 'string') {
                    vantagens = JSON.parse(dadosPersonagem.vantagens);
                } else if (Array.isArray(dadosPersonagem.vantagens)) {
                    vantagens = dadosPersonagem.vantagens;
                }
            }
            // Fallback: campo advantages
            else if (dadosPersonagem.advantages) {
                if (typeof dadosPersonagem.advantages === 'string') {
                    vantagens = JSON.parse(dadosPersonagem.advantages);
                } else if (Array.isArray(dadosPersonagem.advantages)) {
                    vantagens = dadosPersonagem.advantages;
                }
            }
            
            console.log(`🎯 ${vantagens.length} vantagens encontradas:`, vantagens);
            
            // Limpar container
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
                vantagens.forEach((vantagem, index) => {
                    const nome = vantagem.nome || vantagem.name || `Vantagem ${index + 1}`;
                    const custo = vantagem.custo || vantagem.cost || 0;
                    
                    const item = document.createElement('div');
                    item.className = 'vantagem-item';
                    
                    item.innerHTML = `
                        <span class="nome-vantagem">${nome}</span>
                        <span class="custo-vantagem">${custo >= 0 ? '+' : ''}${custo}</span>
                    `;
                    
                    // Tooltip com descrição
                    if (vantagem.descricao || vantagem.description) {
                        item.title = vantagem.descricao || vantagem.description;
                    }
                    
                    container.appendChild(item);
                });
            }
            
            // Atualizar total
            if (totalElement) {
                totalElement.textContent = vantagens.length;
            }
            
        } catch (error) {
            console.error('❌ Erro ao processar vantagens:', error);
            container.innerHTML = `
                <div class="vantagem-item">
                    <span class="nome-vantagem">Erro ao carregar vantagens</span>
                    <span class="custo-vantagem">-</span>
                </div>
            `;
        }
    }

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
            }
            // Fallback: campo skills
            else if (dadosPersonagem.skills) {
                if (typeof dadosPersonagem.skills === 'string') {
                    pericias = JSON.parse(dadosPersonagem.skills);
                } else if (Array.isArray(dadosPersonagem.skills)) {
                    pericias = dadosPersonagem.skills;
                }
            }
            
            console.log(`🎯 ${pericias.length} perícias encontradas`);
            
            container.innerHTML = '';
            
            if (pericias.length === 0) {
                const emptyItem = document.createElement('div');
                emptyItem.className = 'pericia-item';
                emptyItem.innerHTML = `
                    <span class="nome-pericia">Nenhuma perícia</span>
                    <span class="nivel-pericia">-</span>
                `;
                container.appendChild(emptyItem);
            } else {
                // Ordenar por nível e pegar top 10
                const topPericias = [...pericias]
                    .sort((a, b) => (b.nivel || 0) - (a.nivel || 0))
                    .slice(0, 10);
                
                topPericias.forEach((pericia) => {
                    const nome = pericia.nome || pericia.name || 'Perícia';
                    const nivel = pericia.nivel || pericia.level || 0;
                    
                    const item = document.createElement('div');
                    item.className = 'pericia-item';
                    
                    item.innerHTML = `
                        <span class="nome-pericia">${nome}</span>
                        <span class="nivel-pericia">${nivel}</span>
                    `;
                    
                    if (pericia.atributo) {
                        item.title = `Atributo: ${pericia.atributo}`;
                    }
                    
                    container.appendChild(item);
                });
            }
            
            if (totalElement) {
                totalElement.textContent = pericias.length;
            }
            
        } catch (error) {
            console.error('❌ Erro ao processar perícias:', error);
            container.innerHTML = `
                <div class="pericia-item">
                    <span class="nome-pericia">Erro ao carregar perícias</span>
                    <span class="nivel-pericia">-</span>
                </div>
            `;
        }
    }

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

    atualizarAnotacoes() {
        const textarea = document.getElementById('anotacoesGM');
        if (textarea && dadosCampanha?.gm_notes) {
            textarea.value = dadosCampanha.gm_notes;
        }
    }

    // CONTINUA NO PRÓXIMO COMENTÁRIO...
        // ====== CONFIGURAÇÃO DE EVENTOS ======
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

    iniciarSincronizacao() {
        // Sincronizar a cada 30 segundos
        intervaloAtualizacao = setInterval(() => {
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
                
                // Voltar para campanha após 2 segundos
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
    new FichaGM();
});

// Adicionar animações CSS
if (!document.querySelector('#animacoes-flutuantes')) {
    const style = document.createElement('style');
    style.id = 'animacoes-flutuantes';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}
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
let modoAtualizacao = 'ao-vivo'; // 'ao-vivo' ou 'campanha'
let isAtualizando = false;

// ====== CLASSE PRINCIPAL ======
class FichaGM {
    constructor() {
        this.init();
    }

    async init() {
        try {
            this.mostrarLoading();
            
            // 1. Pegar parâmetros da URL
            this.extrairParametrosURL();
            
            // 2. Verificar autenticação
            await this.verificarAutenticacao();
            
            // 3. Carregar dados iniciais
            await this.carregarDadosIniciais();
            
            // 4. Configurar eventos
            this.configurarEventListeners();
            
            // 5. Configurar modo visualização
            this.configurarModoVisualizacao();
            
            // 6. Esconder loading
            this.esconderLoading();
            
            console.log('✅ Ficha GM inicializada com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.mostrarMensagem(`Erro: ${error.message}`, 'erro');
            this.esconderLoading();
        }
    }

    // ====== AUTENTICAÇÃO ======
    async verificarAutenticacao() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = 'login.html';
            throw new Error('Usuário não autenticado');
        }
    }

    extrairParametrosURL() {
        const params = new URLSearchParams(window.location.search);
        personagemId = params.get('personagem');
        campanhaId = params.get('campanha');
        vinculoId = params.get('vinculo');
        
        if (!personagemId || !campanhaId) {
            throw new Error('Parâmetros inválidos na URL');
        }
        
        console.log('📋 IDs:', { personagemId, campanhaId, vinculoId });
    }

    // ====== CARREGAMENTO DE DADOS ======
    async carregarDadosIniciais() {
        try {
            console.log('📥 Buscando dados da view...');
            
            // Buscar dados da VIEW (já consolidado)
            const { data: viewData, error: viewError } = await supabase
                .from('gm_characters_view')
                .select('*')
                .eq('vinculo_id', vinculoId)
                .single();
            
            if (viewError) {
                console.error('Erro na view:', viewError);
                throw viewError;
            }
            
            dadosPersonagem = viewData;
            console.log('✅ Dados da view carregados:', dadosPersonagem);
            
            // Buscar anotações do GM
            const { data: campanhaData, error: campanhaError } = await supabase
                .from('campaign_characters')
                .select('gm_notes')
                .eq('id', vinculoId)
                .single();
            
            if (!campanhaError) {
                dadosCampanha = campanhaData;
            }
            
            // Atualizar interface
            this.atualizarInterfaceCompleta();
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            throw error;
        }
    }

    // ====== ATUALIZAR INTERFACE ======
    atualizarInterfaceCompleta() {
        if (!dadosPersonagem) return;
        
        // 1. Informações básicas
        this.atualizarInformacoesBasicas();
        
        // 2. Atributos
        this.atualizarAtributos();
        
        // 3. Status (PV/PF/Dinheiro)
        this.atualizarStatus();
        
        // 4. Vantagens
        this.atualizarVantagens();
        
        // 5. Perícias (simplificado por enquanto)
        this.atualizarPericias();
        
        // 6. Anotações
        this.atualizarAnotacoes();
        
        // 7. Status de combate
        this.atualizarStatusCombate();
    }

    atualizarInformacoesBasicas() {
        document.getElementById('nomePersonagem').textContent = 
            dadosPersonagem.character_name || 'Sem nome';
        
        document.getElementById('racaPersonagem').textContent = 
            dadosPersonagem.race || 'Sem raça';
        
        // Tentar detectar "classe" da descrição
        const descricao = dadosPersonagem.description || '';
        const primeiraPalavra = descricao.split(' ')[0] || 'Aventureiro';
        document.getElementById('classePersonagem').textContent = primeiraPalavra;
        
        document.getElementById('pontosPersonagem').textContent = 
            `${dadosPersonagem.total_points || 0} pontos`;
        
        document.getElementById('descricaoPersonagem').textContent = 
            descricao || 'Sem descrição disponível.';
        
        // Campanha e Jogador
        document.getElementById('nomeCampanha').textContent = 
            dadosPersonagem.campaign_name || 'Campanha';
        
        document.getElementById('nomeJogador').textContent = 
            dadosPersonagem.player_username || 'Jogador';
        
        // Foto do personagem
        if (dadosPersonagem.avatar_url) {
            const img = document.getElementById('fotoPersonagem');
            img.src = dadosPersonagem.avatar_url;
            img.style.display = 'block';
            document.getElementById('placeholderFoto').style.display = 'none';
        }
    }

    atualizarAtributos() {
        // ATRIBUTOS PRINCIPAIS (já calculados pelo jogador)
        const ST = dadosPersonagem.st || 10;
        const DX = dadosPersonagem.dx || 10;
        const IQ = dadosPersonagem.iq || 10;
        const HT = dadosPersonagem.ht || 10;
        
        document.getElementById('gmST').textContent = ST;
        document.getElementById('gmDX').textContent = DX;
        document.getElementById('gmIQ').textContent = IQ;
        document.getElementById('gmHT').textContent = HT;
        
        // Modificadores (calculados conforme sua regra)
        const STMod = (ST - 10) * 10; // 10 pontos por +1 ST
        const DXMod = (DX - 10) * 20; // 20 pontos por +1 DX
        const IQMod = (IQ - 10) * 20; // 20 pontos por +1 IQ
        const HTMod = (HT - 10) * 10; // 10 pontos por +1 HT
        
        document.getElementById('gmSTMod').textContent = `[${STMod >= 0 ? '+' : ''}${STMod}]`;
        document.getElementById('gmDXMod').textContent = `[${DXMod >= 0 ? '+' : ''}${DXMod}]`;
        document.getElementById('gmIQMod').textContent = `[${IQMod >= 0 ? '+' : ''}${IQMod}]`;
        document.getElementById('gmHTMod').textContent = `[${HTMod >= 0 ? '+' : ''}${HTMod}]`;
        
        // Vontade e Percepção (baseado em IQ)
        const vontade = dadosPersonagem.vontade || IQ;
        const percepcao = dadosPersonagem.percepcao || IQ;
        
        document.getElementById('gmVontade').textContent = vontade;
        document.getElementById('gmPercepcao').textContent = percepcao;
        
        // Carga (removendo "lb" conforme solicitado)
        document.getElementById('gmCargaAtual').textContent = 
            dadosPersonagem.current_weight?.toString()?.replace(' lb', '') || '0';
        
        document.getElementById('gmCargaMaxima').textContent = 
            dadosPersonagem.max_weight?.toString()?.replace(' lb', '') || '0';
    }

    atualizarStatus() {
        // PV - Pontos de Vida
        const pvAtual = dadosPersonagem.current_hp || 10;
        const pvMaximo = dadosPersonagem.max_hp || 10;
        
        document.getElementById('pvAtualGM').textContent = pvAtual;
        document.getElementById('pvMaximoGM').textContent = pvMaximo;
        
        // Atualizar indicador de status PV
        const pvPercent = (pvAtual / pvMaximo) * 100;
        const indicator = document.getElementById('pvStatus');
        
        if (pvPercent > 50) {
            indicator.className = 'status-indicator';
            indicator.style.background = '#27ae60';
        } else if (pvPercent > 25) {
            indicator.className = 'status-indicator baixo';
            indicator.style.background = '#f39c12';
        } else {
            indicator.className = 'status-indicator critico';
            indicator.style.background = '#e74c3c';
        }
        
        // PF - Pontos de Fadiga
        const pfAtual = dadosPersonagem.current_fp || 10;
        const pfMaximo = dadosPersonagem.max_fp || 10;
        
        document.getElementById('pfAtualGM').textContent = pfAtual;
        document.getElementById('pfMaximoGM').textContent = pfMaximo;
        
        // Dinheiro
        const dinheiro = dadosPersonagem.money || 0;
        document.getElementById('dinheiroGM').textContent = `$${dinheiro}`;
        
        // Deslocamento
        document.getElementById('gmDeslocamento').textContent = 
            dadosPersonagem.basic_move || 5;
        document.getElementById('gmBonusMovimento').textContent = 
            dadosPersonagem.move_bonus || 0;
    }

    atualizarVantagens() {
        const container = document.getElementById('listaVantagensGM');
        const totalElement = document.getElementById('totalVantagensGM');
        
        if (!container) return;
        
        let vantagens = [];
        let totalPontos = 0;
        
        try {
            // Vantagens podem vir como string JSON ou já como array
            if (typeof dadosPersonagem.advantages === 'string') {
                vantagens = JSON.parse(dadosPersonagem.advantages || '[]');
            } else if (Array.isArray(dadosPersonagem.advantages)) {
                vantagens = dadosPersonagem.advantages;
            }
            
            console.log('🎯 Vantagens carregadas:', vantagens);
            
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
                totalPontos = 0;
            } else {
                // Ordenar por custo (maior primeiro)
                vantagens.sort((a, b) => (b.custo || b.cost || 0) - (a.custo || a.cost || 0));
                
                vantagens.forEach((vantagem, index) => {
                    const nome = vantagem.nome || vantagem.name || `Vantagem ${index + 1}`;
                    const custo = vantagem.custo || vantagem.cost || 0;
                    totalPontos += custo;
                    
                    const item = document.createElement('div');
                    item.className = 'vantagem-item';
                    
                    item.innerHTML = `
                        <span class="nome-vantagem">${nome}</span>
                        <span class="custo-vantagem">${custo >= 0 ? '+' : ''}${custo}</span>
                    `;
                    
                    // Tooltip com descrição se existir
                    if (vantagem.descricao || vantagem.description) {
                        item.title = vantagem.descricao || vantagem.description || '';
                    }
                    
                    container.appendChild(item);
                });
            }
            
            // Atualizar total
            if (totalElement) {
                totalElement.textContent = vantagens.length;
            }
            
            // Atualizar total de pontos em atributos também
            document.getElementById('pontosTotais').textContent = dadosPersonagem.total_points || 0;
            document.getElementById('pontosGastos').textContent = dadosPersonagem.spent_points || 0;
            document.getElementById('pontosDisponiveis').textContent = dadosPersonagem.available_points || 0;
            
        } catch (error) {
            console.error('❌ Erro ao processar vantagens:', error);
            container.innerHTML = '<div class="vantagem-item"><span class="nome-vantagem">Erro ao carregar vantagens</span></div>';
        }
    }

    atualizarPericias() {
        const container = document.getElementById('listaPericiasGM');
        const totalElement = document.getElementById('totalPericias');
        
        if (!container) return;
        
        let pericias = [];
        
        try {
            if (typeof dadosPersonagem.skills === 'string') {
                pericias = JSON.parse(dadosPersonagem.skills || '[]');
            } else if (Array.isArray(dadosPersonagem.skills)) {
                pericias = dadosPersonagem.skills;
            }
            
            console.log('🎯 Perícias carregadas:', pericias.length);
            
            // Limpar container
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
                // Ordenar por nível (maior primeiro) e pegar top 10
                pericias.sort((a, b) => (b.nivel || b.level || 0) - (a.nivel || a.level || 0));
                const topPericias = pericias.slice(0, 10);
                
                topPericias.forEach((pericia, index) => {
                    const nome = pericia.nome || pericia.name || `Perícia ${index + 1}`;
                    const nivel = pericia.nivel || pericia.level || 0;
                    
                    const item = document.createElement('div');
                    item.className = 'pericia-item';
                    
                    item.innerHTML = `
                        <span class="nome-pericia">${nome}</span>
                        <span class="nivel-pericia">${nivel}</span>
                    `;
                    
                    // Tooltip com atributo base
                    if (pericia.atributo) {
                        item.title = `Atributo: ${pericia.atributo}`;
                    }
                    
                    container.appendChild(item);
                });
                
                // Se tiver mais de 10, mostrar indicador
                if (pericias.length > 10) {
                    const maisItem = document.createElement('div');
                    maisItem.className = 'pericia-item mais-itens';
                    maisItem.innerHTML = `
                        <span class="nome-pericia">...mais ${pericias.length - 10} perícias</span>
                        <span class="nivel-pericia">↻</span>
                    `;
                    container.appendChild(maisItem);
                }
            }
            
            // Atualizar total
            if (totalElement) {
                totalElement.textContent = pericias.length;
            }
            
        } catch (error) {
            console.error('❌ Erro ao processar perícias:', error);
            container.innerHTML = '<div class="pericia-item"><span class="nome-pericia">Erro ao carregar perícias</span></div>';
        }
    }

    atualizarStatusCombate() {
        // Esquiva
        document.getElementById('gmEsquiva').textContent = 
            dadosPersonagem.dodge || 10;
        
        // Dano
        document.getElementById('gmDanoGolpe').textContent = 
            dadosPersonagem.thrust_damage || '1d-2';
        document.getElementById('gmDanoArremesso').textContent = 
            dadosPersonagem.swing_damage || '1d';
    }

    atualizarAnotacoes() {
        const textarea = document.getElementById('anotacoesGM');
        if (textarea && dadosCampanha?.gm_notes) {
            textarea.value = dadosCampanha.gm_notes;
        }
    }

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
            this.voltarParaCampanha();
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

        // Controles de PV/PF (APENAS para visualização do GM)
        document.querySelectorAll('.btn-controle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const acao = e.target.dataset.acao;
                const valor = parseInt(e.target.dataset.valor);
                console.log(`Controle clicado: ${acao} ${valor}`);
                // Por enquanto só log - jogador controla
            });
        });

        // Input personalizado de PV
        document.getElementById('btnAplicarPvCustom').addEventListener('click', () => {
            const input = document.getElementById('inputPvCustom');
            const valor = parseInt(input.value);
            if (valor) {
                console.log(`Aplicar PV personalizado: ${valor}`);
                input.value = '';
            }
        });
    }

    configurarModoVisualizacao() {
        // Definir modo "ao-vivo" como padrão
        this.alterarModoVisualizacao('ao-vivo');
    }

    // ====== FUNCIONALIDADES ======
    mudarAba(abaId) {
        console.log(`Mudando para aba: ${abaId}`);
        
        // Remover classe ativa de todas as abas
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('ativo'));
        document.querySelectorAll('.conteudo-aba').forEach(aba => aba.classList.remove('ativo'));

        // Adicionar classe ativa
        const tabAtiva = document.querySelector(`.tab[data-tab="${abaId}"]`);
        const abaAtiva = document.getElementById(`aba-${abaId}`);
        
        if (tabAtiva && abaAtiva) {
            tabAtiva.classList.add('ativo');
            abaAtiva.classList.add('ativo');
        }
    }

    alterarModoVisualizacao(modo) {
        modoAtualizacao = modo;
        console.log(`Modo de visualização alterado para: ${modo}`);
        
        // Atualizar botões
        document.querySelectorAll('.botao-visualizacao').forEach(btn => {
            btn.classList.remove('ativo');
            if (btn.dataset.visao === modo) {
                btn.classList.add('ativo');
            }
        });
        
        // Configurar sincronização baseada no modo
        if (modo === 'ao-vivo') {
            this.iniciarSincronizacaoAutomatica();
        } else {
            this.pararSincronizacao();
        }
    }

    iniciarSincronizacaoAutomatica() {
        console.log('🔄 Iniciando sincronização automática...');
        
        // Parar sincronização anterior se existir
        if (intervaloAtualizacao) {
            clearInterval(intervaloAtualizacao);
        }
        
        // Sincronizar a cada 15 segundos
        intervaloAtualizacao = setInterval(async () => {
            if (isAtualizando) return;
            
            isAtualizando = true;
            try {
                await this.sincronizarDados();
                console.log('✅ Sincronização automática concluída');
            } catch (error) {
                console.error('❌ Erro na sincronização automática:', error);
            } finally {
                isAtualizando = false;
            }
        }, 15000); // 15 segundos
    }

    pararSincronizacao() {
        if (intervaloAtualizacao) {
            clearInterval(intervaloAtualizacao);
            intervaloAtualizacao = null;
            console.log('⏹️ Sincronização automática parada');
        }
    }

    async sincronizarDados() {
        console.log('🔄 Sincronizando dados...');
        this.mostrarMensagem('Sincronizando...', 'info');
        
        try {
            await this.carregarDadosIniciais();
            this.mostrarMensagem('Dados atualizados!', 'sucesso');
        } catch (error) {
            console.error('❌ Erro ao sincronizar:', error);
            this.mostrarMensagem('Erro ao sincronizar', 'erro');
        }
    }

    async congelarPersonagem() {
        if (confirm('Congelar este personagem? O jogador não poderá fazer alterações.')) {
            try {
                const { error } = await supabase
                    .from('campaign_characters')
                    .update({ is_frozen: true })
                    .eq('id', vinculoId);
                
                if (error) throw error;
                
                this.mostrarMensagem('Personagem congelado!', 'sucesso');
            } catch (error) {
                console.error('❌ Erro ao congelar:', error);
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
                    .eq('id', vinculoId);
                
                if (error) throw error;
                
                this.mostrarMensagem('Personagem removido', 'sucesso');
                
                // Voltar para campanha após 2 segundos
                setTimeout(() => {
                    this.voltarParaCampanha();
                }, 2000);
                
            } catch (error) {
                console.error('❌ Erro ao remover:', error);
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
                .eq('id', vinculoId);
            
            if (error) throw error;
            
            if (!dadosCampanha) dadosCampanha = {};
            dadosCampanha.gm_notes = notas;
            
            this.mostrarMensagem('Anotações salvas!', 'sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao salvar anotações:', error);
            this.mostrarMensagem('Erro ao salvar', 'erro');
        }
    }

    limparAnotacoes() {
        if (confirm('Limpar todas as anotações?')) {
            document.getElementById('anotacoesGM').value = '';
        }
    }

    voltarParaCampanha() {
        const url = `campanha.html?id=${campanhaId}`;
        window.location.href = url;
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
        const mensagensAntigas = document.querySelectorAll('.mensagem-flutuante');
        mensagensAntigas.forEach(msg => msg.remove());
        
        // Cores por tipo
        const cores = {
            sucesso: '#27ae60',
            erro: '#e74c3c',
            aviso: '#f39c12',
            info: '#3498db'
        };
        
        // Criar mensagem
        const mensagem = document.createElement('div');
        mensagem.className = 'mensagem-flutuante';
        mensagem.textContent = texto;
        mensagem.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${cores[tipo] || cores.info};
            color: white;
            border-radius: 6px;
            z-index: 9999;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(mensagem);
        
        // Remover após 3 segundos
        setTimeout(() => {
            mensagem.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => mensagem.remove(), 300);
        }, 3000);
    }
}

// ====== INICIALIZAÇÃO ======
let sistemaFichaGM;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando Ficha do GM...');
    sistemaFichaGM = new FichaGM();
});

// Adicionar animações CSS se não existirem
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

// Exportar para debug
window.sistemaFichaGM = sistemaFichaGM;
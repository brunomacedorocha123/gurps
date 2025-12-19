const SUPABASE_URL = 'https://pujufdfhaxveuytkneqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1anVmZGZoYXh2ZXV5dGtuZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTkyODksImV4cCI6MjA3OTkzNTI4OX0.mzOwsmf8qIQ4HZqnXLEmq4D7M6fz4VH1YWpWP-BsFvc';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let dadosPersonagem = null;
let configGM = {
    modoVisualizacao: 'instantaneo', // instantaneo, ao-vivo, campanha
    autoAtualizar: true,
    personagemId: null,
    campanhaId: null,
    vinculoId: null
};

class SistemaFichaGM {
    constructor() {
        this.inicializar();
    }

    async inicializar() {
        try {
            // 1. Verificar autenticação
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                this.redirecionarParaLogin();
                return;
            }

            // 2. Pegar parâmetros da URL
            const urlParams = new URLSearchParams(window.location.search);
            configGM.personagemId = urlParams.get('personagem');
            configGM.campanhaId = urlParams.get('campanha');
            configGM.vinculoId = urlParams.get('vinculo');

            if (!configGM.personagemId || !configGM.campanhaId) {
                this.mostrarErro('Parâmetros inválidos');
                return;
            }

            // 3. Configurar interface
            this.configurarNavegacao();
            this.configurarControles();

            // 4. Carregar dados
            await this.carregarDadosCompletos();

            // 5. Iniciar atualização automática
            if (configGM.autoAtualizar) {
                this.iniciarAtualizacaoAutomatica();
            }

        } catch (error) {
            console.error('Erro ao inicializar:', error);
            this.mostrarErro(error.message);
        }
    }

    async carregarDadosCompletos() {
        try {
            // Mostrar loading
            this.mostrarLoading(true);

            // Buscar dados em 3 camadas
            const [dadosBase, dadosAoVivo, dadosCampanha] = await Promise.all([
                this.buscarDadosInstantaneo(),
                this.buscarDadosAoVivo(),
                this.buscarDadosCampanha()
            ]);

            // Combinar dados
            dadosPersonagem = {
                ...dadosBase,
                aoVivo: dadosAoVivo,
                campanha: dadosCampanha,
                ultimaAtualizacao: new Date().toISOString()
            };

            // Atualizar interface
            this.atualizarInterface();

            // Salvar no localStorage para cache
            localStorage.setItem(`gm_ficha_${configGM.personagemId}`, 
                JSON.stringify(dadosPersonagem));

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            throw error;
        } finally {
            this.mostrarLoading(false);
        }
    }

    async buscarDadosInstantaneo() {
        // Busca snapshot do vínculo
        const { data, error } = await supabase
            .from('campaign_characters')
            .select(`
                snapshot_data,
                character:characters(*)
            `)
            .eq('id', configGM.vinculoId)
            .single();

        if (error) throw error;
        return data.snapshot_data || data.character;
    }

    async buscarDadosAoVivo() {
        // Busca dados atuais do personagem
        const { data, error } = await supabase
            .from('characters')
            .select('*')
            .eq('id', configGM.personagemId)
            .single();

        if (error) throw error;
        return data;
    }

    async buscarDadosCampanha() {
        // Busca anotações e progressão da campanha
        const { data, error } = await supabase
            .from('gm_notes')
            .select('*')
            .eq('character_id', configGM.personagemId)
            .eq('campaign_id', configGM.campanhaId)
            .single();

        return data || { notas: '', historico: [] };
    }

    atualizarInterface() {
        if (!dadosPersonagem) return;

        // Atualizar cabeçalho
        document.getElementById('nomePersonagem').textContent = 
            dadosPersonagem.nome || 'Sem nome';
        
        document.getElementById('racaPersonagem').textContent = 
            dadosPersonagem.raca || 'Sem raça';
        
        document.getElementById('classePersonagem').textContent = 
            dadosPersonagem.classe || 'Sem classe';

        // Atualizar atributos
        document.getElementById('gmST').textContent = dadosPersonagem.forca || 10;
        document.getElementById('gmDX').textContent = dadosPersonagem.destreza || 10;
        // ... outros atributos

        // Atualizar PV/PF
        document.getElementById('pvAtualGM').textContent = 
            dadosPersonagem.aoVivo?.pontos_vida_atual || 10;
        
        document.getElementById('pvMaximoGM').textContent = 
            dadosPersonagem.pontos_vida || 10;

        // Atualizar dinheiro
        document.getElementById('dinheiroGM').textContent = 
            `$${dadosPersonagem.aoVivo?.dinheiro || 0}`;

        // Atualizar foto se existir
        if (dadosPersonagem.avatar_url) {
            const img = document.getElementById('fotoPersonagem');
            img.src = dadosPersonagem.avatar_url;
            img.style.display = 'block';
            document.getElementById('placeholderFoto').style.display = 'none';
        }

        // Atualizar anotações
        const textareaNotas = document.getElementById('anotacoesGM');
        if (textareaNotas && dadosPersonagem.campanha?.notas) {
            textareaNotas.value = dadosPersonagem.campanha.notas;
        }
    }

    configurarNavegacao() {
        // Tabs principais
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
    }

    configurarControles() {
        // Botão voltar
        document.getElementById('btnVoltarCampanha').addEventListener('click', () => {
            window.history.back();
        });

        // Botão sincronizar
        document.getElementById('btnSincronizar').addEventListener('click', () => {
            this.carregarDadosCompletos();
        });

        // Botão salvar anotações
        document.getElementById('btnSalvarAnotacoes').addEventListener('click', () => {
            this.salvarAnotacoesGM();
        });

        // Controles de PV
        document.querySelectorAll('.btn-controle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const acao = e.target.classList.contains('cura') ? 'curar' : 'dano';
                const valor = 1; // ou pegar do data-value
                this.aplicarModificadorPV(valor, acao);
            });
        });
    }

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
        }
    }

    alterarModoVisualizacao(modo) {
        configGM.modoVisualizacao = modo;
        
        // Atualizar botões
        document.querySelectorAll('.botao-visualizacao').forEach(btn => {
            btn.classList.remove('ativo');
            if (btn.dataset.visao === modo) {
                btn.classList.add('ativo');
            }
        });

        // Aplicar modo
        this.aplicarModoVisualizacao();
    }

    aplicarModoVisualizacao() {
        // Lógica para mostrar diferentes conjuntos de dados
        switch(configGM.modoVisualizacao) {
            case 'instantaneo':
                // Mostrar apenas snapshot
                break;
            case 'ao-vivo':
                // Mostrar dados em tempo real
                break;
            case 'campanha':
                // Mostrar dados da campanha + anotações
                break;
        }
    }

    async salvarAnotacoesGM() {
        try {
            const notas = document.getElementById('anotacoesGM').value;
            
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Verificar se já existe
            const { data: existente } = await supabase
                .from('gm_notes')
                .select('id')
                .eq('character_id', configGM.personagemId)
                .eq('campaign_id', configGM.campanhaId)
                .single();

            let resultado;
            
            if (existente) {
                // Atualizar
                const { data, error } = await supabase
                    .from('gm_notes')
                    .update({
                        notas: notas,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existente.id);
                
                if (error) throw error;
                resultado = data;
            } else {
                // Criar
                const { data, error } = await supabase
                    .from('gm_notes')
                    .insert([{
                        campaign_id: configGM.campanhaId,
                        character_id: configGM.personagemId,
                        gm_id: session.user.id,
                        notas: notas,
                        created_at: new Date().toISOString()
                    }]);
                
                if (error) throw error;
                resultado = data;
            }

            this.mostrarMensagem('Anotações salvas com sucesso!', 'sucesso');

        } catch (error) {
            console.error('Erro ao salvar anotações:', error);
            this.mostrarMensagem('Erro ao salvar anotações', 'erro');
        }
    }

    aplicarModificadorPV(valor, tipo) {
        if (!dadosPersonagem) return;

        const elementoPV = document.getElementById('pvAtualGM');
        let pvAtual = parseInt(elementoPV.textContent);
        const pvMaximo = parseInt(document.getElementById('pvMaximoGM').textContent);

        if (tipo === 'curar') {
            pvAtual = Math.min(pvMaximo, pvAtual + valor);
        } else {
            pvAtual = Math.max(0, pvAtual - valor);
        }

        elementoPV.textContent = pvAtual;

        // Atualizar no servidor (opcional)
        this.atualizarPVAoVivo(pvAtual);
    }

    async atualizarPVAoVivo(novoPV) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Atualizar na tabela de status ao vivo
            const { error } = await supabase
                .from('character_status')
                .upsert({
                    character_id: configGM.personagemId,
                    pontos_vida_atual: novoPV,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

        } catch (error) {
            console.error('Erro ao atualizar PV:', error);
        }
    }

    iniciarAtualizacaoAutomatica() {
        // Atualizar a cada 30 segundos
        setInterval(async () => {
            if (configGM.autoAtualizar && configGM.modoVisualizacao === 'ao-vivo') {
                await this.carregarDadosCompletos();
            }
        }, 30000);
    }

    mostrarLoading(mostrar) {
        const loading = document.getElementById('loadingOverlay') || this.criarLoading();
        loading.style.display = mostrar ? 'flex' : 'none';
    }

    criarLoading() {
        const div = document.createElement('div');
        div.id = 'loadingOverlay';
        div.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p>Carregando dados do personagem...</p>
            </div>
        `;
        div.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        document.body.appendChild(div);
        return div;
    }

    mostrarMensagem(texto, tipo = 'info') {
        const mensagem = document.createElement('div');
        mensagem.className = `mensagem-gm ${tipo}`;
        mensagem.textContent = texto;
        mensagem.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${tipo === 'sucesso' ? '#27ae60' : tipo === 'erro' ? '#e74c3c' : '#3498db'};
            color: white;
            border-radius: 6px;
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(mensagem);
        
        setTimeout(() => {
            mensagem.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => mensagem.remove(), 300);
        }, 3000);
    }

    mostrarErro(mensagem) {
        this.mostrarMensagem(`Erro: ${mensagem}`, 'erro');
    }

    redirecionarParaLogin() {
        window.location.href = 'login.html';
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.sistemaGM = new SistemaFichaGM();
});
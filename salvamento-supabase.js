// salvamento-supabase.js - VERSÃO COMPLETA E CORRIGIDA
class SalvamentoSupabase {
    constructor() {
        this.supabase = window.supabase;
        this.limitePersonagens = 10;
        this.usuarioLogado = null;
        this.session = null;
        this.debug = true; // Ativar logs para depuração
    }

    // ======================
    // SISTEMA DE AUTENTICAÇÃO
    // ======================

    async inicializarAutenticacao() {
        try {
            this.log('🔐 Iniciando verificação de autenticação...');
            
            // 1. Verificar se temos uma sessão ativa
            const { data: sessionData, error: sessionError } = await this.supabase.auth.getSession();
            
            if (sessionError) {
                this.log('❌ Erro ao obter sessão:', sessionError);
                return false;
            }
            
            if (!sessionData.session) {
                this.log('⚠️ Nenhuma sessão encontrada. Verificando usuário atual...');
                
                // Tentar obter o usuário atual
                const { data: userData, error: userError } = await this.supabase.auth.getUser();
                
                if (userError || !userData.user) {
                    this.log('❌ Nenhum usuário logado encontrado');
                    return false;
                }
                
                this.usuarioLogado = userData.user;
                this.log(`✅ Usuário encontrado via getUser(): ${this.usuarioLogado.email}`);
                return true;
            }
            
            // 2. Configurar sessão e usuário
            this.session = sessionData.session;
            this.usuarioLogado = sessionData.session.user;
            
            this.log(`✅ Sessão ativa encontrada para: ${this.usuarioLogado.email}`);
            this.log(`📅 Token válido até: ${new Date(this.session.expires_at * 1000).toLocaleString()}`);
            
            return true;
            
        } catch (error) {
            this.log('❌ Erro fatal na autenticação:', error);
            return false;
        }
    }

    async verificarAutenticacao() {
        try {
            // Verificação rápida primeiro
            const usuarioAtual = this.supabase.auth.getUser();
            if (usuarioAtual) {
                return true;
            }
            
            // Se não, fazer verificação completa
            return await this.inicializarAutenticacao();
        } catch {
            return false;
        }
    }

    // ======================
    // VERIFICAÇÃO DE LIMITE
    // ======================

    async verificarLimitePersonagens() {
        this.log('📊 Verificando limite de personagens...');
        
        const autenticado = await this.inicializarAutenticacao();
        
        if (!autenticado) {
            const mensagem = '❌ Você precisa estar logado para criar personagens';
            this.log(mensagem);
            return {
                podeCriar: false,
                quantidade: 0,
                limite: this.limitePersonagens,
                motivo: mensagem
            };
        }
        
        try {
            this.log(`👤 Verificando limite para usuário: ${this.usuarioLogado.id}`);
            
            const { count, error } = await this.supabase
                .from('characters')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', this.usuarioLogado.id);
            
            if (error) {
                this.log('❌ Erro ao contar personagens:', error);
                return {
                    podeCriar: false,
                    quantidade: 0,
                    limite: this.limitePersonagens,
                    motivo: 'Erro ao verificar limite. Tente novamente.'
                };
            }
            
            this.log(`📋 Personagens encontrados: ${count || 0}`);
            
            const podeCriar = (count || 0) < this.limitePersonagens;
            const motivo = podeCriar ? '' : `❌ Limite de ${this.limitePersonagens} personagens atingido`;
            
            return {
                podeCriar,
                quantidade: count || 0,
                limite: this.limitePersonagens,
                motivo
            };
            
        } catch (error) {
            this.log('❌ Erro na verificação de limite:', error);
            return {
                podeCriar: false,
                quantidade: 0,
                limite: this.limitePersonagens,
                motivo: 'Erro ao verificar limite. Tente recarregar a página.'
            };
        }
    }

    // ======================
    // SISTEMA DE FOTOS
    // ======================

    async salvarFotoNoSupabase(file, personagemId) {
        if (!file || !personagemId || !this.usuarioLogado) {
            this.log('⚠️ Dados insuficientes para salvar foto');
            return null;
        }

        try {
            const fileExt = file.name.split('.').pop().toLowerCase();
            const fileName = `avatar_${personagemId}_${Date.now()}.${fileExt}`;
            const filePath = `avatars/${this.usuarioLogado.id}/${fileName}`;

            this.log(`🖼️ Enviando foto: ${fileName} (${(file.size / 1024).toFixed(2)} KB)`);

            // 1. Fazer upload
            const { data: uploadData, error: uploadError } = await this.supabase.storage
                .from('characters')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                this.log('❌ Erro no upload da foto:', uploadError);
                return null;
            }

            this.log('✅ Upload da foto concluído');

            // 2. Obter URL pública
            const { data: { publicUrl } } = this.supabase.storage
                .from('characters')
                .getPublicUrl(filePath);

            this.log(`🔗 URL da foto: ${publicUrl}`);
            return publicUrl;

        } catch (error) {
            this.log('❌ Erro ao salvar foto:', error);
            return null;
        }
    }

    // ======================
    // COLETA DE DADOS
    // ======================

    coletarDadosCompletos() {
        this.log('📦 Coletando dados do personagem...');
        
        let dadosBase = {
            user_id: this.usuarioLogado?.id,
            nome: document.getElementById('charName')?.value || 'Novo Personagem',
            classe: document.getElementById('classePersonagem')?.value || '',
            raca: document.getElementById('racaPersonagem')?.value || '',
            nivel: document.getElementById('nivelPersonagem')?.value || 'Nível 1',
            descricao: document.getElementById('descricaoPersonagem')?.value || '',
            status: 'Ativo',
            updated_at: new Date().toISOString()
        };

        // Tentar usar o coletor de dados, se disponível
        if (window.coletor && typeof window.coletor.coletarTodosDados === 'function') {
            try {
                const dadosColetor = window.coletor.coletarTodosDados();
                this.log('✅ Dados coletados via coletor');
                return { ...dadosBase, ...dadosColetor };
            } catch (error) {
                this.log('⚠️ Erro no coletor, usando dados básicos:', error);
            }
        }

        // Coleta manual de dados importantes
        const dadosManuais = {
            pontos_totais: window.sistemaPontos?.pontos?.totais || 150,
            pontos_gastos: window.sistemaPontos?.pontos?.gastos || 0,
            pontos_disponiveis: window.sistemaPontos?.pontos?.disponiveis || 150,
            limite_desvantagens: window.sistemaPontos?.pontos?.limiteDesvantagens || -50,
            desvantagens_atuais: window.sistemaPontos?.pontos?.desvantagensAtuais || 0,

            forca: parseInt(document.getElementById('ST')?.value) || 10,
            destreza: parseInt(document.getElementById('DX')?.value) || 10,
            inteligencia: parseInt(document.getElementById('IQ')?.value) || 10,
            saude: parseInt(document.getElementById('HT')?.value) || 10,

            // JSON arrays vazios
            idiomas: '[]',
            vantagens: '[]',
            desvantagens: '[]',
            peculiaridades: '[]',
            pericias: '[]',
            tecnicas: '[]',
            magias: '[]',
            equipamentos: '[]',
            inventario: '[]',
            deposito: '[]',
            condicoes: '[]',
            inimigos: '[]',
            aliados: '[]',
            dependentes: '[]',
            caracteristicas_fisicas: '[]',

            // Valores padrão
            avatar_url: null,
            created_at: personagemId ? undefined : new Date().toISOString()
        };

        this.log('✅ Dados coletados manualmente');
        return { ...dadosBase, ...dadosManuais };
    }

    // ======================
    // VALIDAÇÃO
    // ======================

    validarPontos(dados) {
        this.log('🔍 Validando pontos...');
        
        if (dados.pontos_gastos > dados.pontos_totais) {
            const erro = `❌ Erro: Você gastou ${dados.pontos_gastos} pontos, mas tem apenas ${dados.pontos_totais} pontos totais!`;
            this.log(erro);
            alert(erro);
            return false;
        }
        
        if (dados.desvantagens_atuais < dados.limite_desvantagens) {
            const erro = `❌ Erro: Você excedeu o limite de desvantagens!`;
            this.log(erro);
            alert(erro);
            return false;
        }
        
        if (!dados.nome || dados.nome.trim() === '') {
            const erro = '❌ Erro: O personagem precisa ter um nome!';
            this.log(erro);
            alert(erro);
            return false;
        }
        
        this.log('✅ Validação de pontos OK');
        return true;
    }

    // ======================
    // SALVAMENTO PRINCIPAL
    // ======================

    async salvarPersonagem(personagemId = null) {
        try {
            this.log('💾 Iniciando salvamento do personagem...');
            
            // 1. VERIFICAR AUTENTICAÇÃO
            const autenticado = await this.inicializarAutenticacao();
            if (!autenticado) {
                const mensagem = '❌ Você precisa estar logado para salvar personagens!\nRedirecionando para login...';
                this.log(mensagem);
                alert(mensagem);
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
                return false;
            }

            this.log(`👤 Usuário autenticado: ${this.usuarioLogado.email}`);

            // 2. COLETAR DADOS
            this.log('📋 Coletando dados do personagem...');
            const dados = this.coletarDadosCompletos();
            
            // Adicionar user_id se não estiver presente
            if (!dados.user_id) {
                dados.user_id = this.usuarioLogado.id;
            }

            this.log('📊 Dados coletados:', dados.nome, dados.classe, dados.raca);

            // 3. VALIDAR PONTOS
            if (!this.validarPontos(dados)) {
                return false;
            }

            // 4. GERENCIAR FOTO
            let fotoUrl = null;
            let fotoFile = null;

            if (window.dashboard && typeof window.dashboard.getFotoParaSalvar === 'function') {
                try {
                    const fotoData = window.dashboard.getFotoParaSalvar();
                    if (fotoData && fotoData.file) {
                        fotoFile = fotoData.file;
                        this.log('📸 Foto encontrada para upload');
                    }
                } catch (error) {
                    this.log('⚠️ Erro ao obter foto:', error);
                }
            }

            let resultado;
            let personagemSalvoId = personagemId;

            // 5. SALVAR NO SUPABASE
            if (personagemId) {
                // MODO EDIÇÃO
                this.log(`✏️ Modo EDIÇÃO - Personagem ID: ${personagemId}`);
                
                // Remover campos que não devem ser atualizados
                delete dados.id;
                delete dados.created_at;
                delete dados.user_id; // Não alterar user_id

                // Se tiver foto, salvar primeiro
                if (fotoFile) {
                    this.log('🖼️ Salvando foto para personagem existente...');
                    fotoUrl = await this.salvarFotoNoSupabase(fotoFile, personagemId);
                    if (fotoUrl) {
                        dados.avatar_url = fotoUrl;
                        this.log('✅ Foto salva:', fotoUrl);
                    }
                }

                // Atualizar personagem
                this.log('⚡ Atualizando personagem no Supabase...');
                resultado = await this.supabase
                    .from('characters')
                    .update(dados)
                    .eq('id', personagemId)
                    .eq('user_id', this.usuarioLogado.id)
                    .select();

            } else {
                // MODO CRIAÇÃO
                this.log('🆕 Modo CRIAÇÃO - Novo personagem');
                
                // Adicionar created_at para novo personagem
                dados.created_at = new Date().toISOString();
                dados.user_id = this.usuarioLogado.id;

                // Criar personagem primeiro
                this.log('⚡ Criando novo personagem no Supabase...');
                resultado = await this.supabase
                    .from('characters')
                    .insert([dados])
                    .select();

                if (resultado.data && resultado.data[0]) {
                    personagemSalvoId = resultado.data[0].id;
                    this.log(`✅ Personagem criado com ID: ${personagemSalvoId}`);

                    // Se criou com sucesso e tem foto
                    if (fotoFile && personagemSalvoId) {
                        this.log('🖼️ Salvando foto para novo personagem...');
                        fotoUrl = await this.salvarFotoNoSupabase(fotoFile, personagemSalvoId);
                        
                        if (fotoUrl) {
                            // Atualizar personagem com URL da foto
                            await this.supabase
                                .from('characters')
                                .update({ avatar_url: fotoUrl })
                                .eq('id', personagemSalvoId);
                            this.log('✅ Foto adicionada ao personagem');
                        }
                    }
                }
            }

            // 6. VERIFICAR RESULTADO
            if (resultado.error) {
                this.tratarErroSupabase(resultado.error);
                return false;
            }

            // 7. MOSTRAR SUCESSO
            this.mostrarModalSucesso(personagemId ? 'editado' : 'criado');
            return true;

        } catch (error) {
            this.log('❌ ERRO FATAL no salvamento:', error);
            alert('❌ Erro inesperado ao salvar personagem:\n' + error.message);
            return false;
        }
    }

    // ======================
    // TRATAMENTO DE ERROS
    // ======================

    tratarErroSupabase(error) {
        this.log('❌ Erro do Supabase:', error);
        
        let mensagem = 'Erro ao salvar: ';
        let detalhes = '';
        
        switch(error.code) {
            case '23505':
                mensagem = 'Personagem já existe';
                detalhes = 'Um personagem com esses dados já existe.';
                break;
            case '42501':
                mensagem = 'Permissão negada';
                detalhes = 'Verifique as políticas RLS (Row Level Security) no Supabase.';
                break;
            case '42P01':
                mensagem = 'Tabela não existe';
                detalhes = 'Execute o SQL da tabela characters primeiro no Supabase.';
                break;
            case 'PGRST116':
                mensagem = 'Recurso não encontrado';
                detalhes = 'O personagem que você está tentando editar não existe.';
                break;
            default:
                mensagem += error.message;
                detalhes = error.details || '';
        }
        
        alert(`${mensagem}\n${detalhes}`);
    }

    // ======================
    // CARREGAMENTO
    // ======================

    async carregarPersonagem(personagemId) {
        try {
            this.log(`📥 Carregando personagem ID: ${personagemId}`);
            
            const autenticado = await this.inicializarAutenticacao();
            if (!autenticado) {
                alert('❌ Você precisa estar logado para carregar personagens!');
                return null;
            }

            const { data: personagem, error } = await this.supabase
                .from('characters')
                .select('*')
                .eq('id', personagemId)
                .eq('user_id', this.usuarioLogado.id)
                .single();

            if (error) {
                this.log('❌ Erro ao carregar:', error);
                alert('❌ Erro ao carregar personagem:\n' + error.message);
                return null;
            }

            this.log(`✅ Personagem carregado: ${personagem.nome}`);
            return personagem;

        } catch (error) {
            this.log('❌ Erro ao carregar personagem:', error);
            alert('Erro ao carregar personagem');
            return null;
        }
    }

    // ======================
    // EXCLUSÃO
    // ======================

    async excluirPersonagem(personagemId) {
        try {
            this.log(`🗑️  Solicitando exclusão do personagem ID: ${personagemId}`);
            
            const autenticado = await this.inicializarAutenticacao();
            if (!autenticado) {
                alert('❌ Você precisa estar logado para excluir personagens!');
                return false;
            }

            if (!confirm('⚠️ Tem certeza que deseja excluir este personagem?\n\nEsta ação não pode ser desfeita!')) {
                this.log('Exclusão cancelada pelo usuário');
                return false;
            }

            this.log('⚡ Excluindo personagem do Supabase...');
            const { error } = await this.supabase
                .from('characters')
                .delete()
                .eq('id', personagemId)
                .eq('user_id', this.usuarioLogado.id);

            if (error) {
                this.log('❌ Erro ao excluir:', error);
                alert('❌ Erro ao excluir personagem:\n' + error.message);
                return false;
            }

            this.log('✅ Personagem excluído com sucesso');
            return true;

        } catch (error) {
            this.log('❌ Erro ao excluir personagem:', error);
            alert('Erro ao excluir personagem');
            return false;
        }
    }

    // ======================
    // UI E NOTIFICAÇÕES
    // ======================

    mostrarModalSucesso(tipo) {
        const mensagem = tipo === 'criado' 
            ? '🎉 Personagem criado com sucesso!' 
            : '✅ Personagem atualizado com sucesso!';
        
        const icone = tipo === 'criado' ? '🎮' : '✅';
        
        this.log(`✅ ${mensagem}`);

        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.95);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 99999;
            animation: fadeIn 0.3s ease;
        `;

        modal.innerHTML = `
            <div style="
                background: rgba(30,30,40,0.98);
                padding: 40px;
                border-radius: 15px;
                text-align: center;
                border: 3px solid #27ae60;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                animation: scaleIn 0.3s ease;
            ">
                <div style="
                    font-size: 80px;
                    margin-bottom: 20px;
                    animation: bounce 1s infinite alternate;
                ">${icone}</div>
                
                <h2 style="
                    color: #27ae60;
                    margin-bottom: 20px;
                    font-size: 28px;
                ">${mensagem}</h2>
                
                <p style="
                    color: #ccc;
                    margin-bottom: 30px;
                    font-size: 16px;
                ">
                    Redirecionando para seus personagens em 
                    <span id="contador" style="color: #ff8c00; font-weight: bold;">3</span> 
                    segundos...
                </p>
                
                <button id="btnIrPersonagens" style="
                    background: linear-gradient(45deg, #27ae60, #2ecc71);
                    color: white;
                    border: none;
                    padding: 15px 40px;
                    border-radius: 10px;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 18px;
                    transition: all 0.3s ease;
                    margin-top: 10px;
                ">
                    <i class="fas fa-users"></i> Ir para Meus Personagens
                </button>
                
                <br>
                
                <button id="btnContinuarEditando" style="
                    background: transparent;
                    color: #ff8c00;
                    border: 1px solid #ff8c00;
                    padding: 10px 25px;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-top: 15px;
                    transition: all 0.3s ease;
                ">
                    <i class="fas fa-edit"></i> Continuar Editando
                </button>
            </div>
            
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes bounce {
                    from { transform: translateY(0); }
                    to { transform: translateY(-10px); }
                }
            </style>
        `;

        document.body.appendChild(modal);

        let segundos = 3;
        const contador = modal.querySelector('#contador');
        let contadorInterval;

        const iniciarContador = () => {
            contadorInterval = setInterval(() => {
                segundos--;
                contador.textContent = segundos;
                
                if (segundos <= 0) {
                    clearInterval(contadorInterval);
                    window.location.href = 'personagens.html';
                }
            }, 1000);
        };

        iniciarContador();

        // Botão "Ir para Personagens"
        modal.querySelector('#btnIrPersonagens').addEventListener('click', () => {
            clearInterval(contadorInterval);
            window.location.href = 'personagens.html';
        });

        // Botão "Continuar Editando"
        modal.querySelector('#btnContinuarEditando').addEventListener('click', () => {
            clearInterval(contadorInterval);
            document.body.removeChild(modal);
        });

        // Fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                clearInterval(contadorInterval);
                document.body.removeChild(modal);
            }
        });
    }

    // ======================
    // UTILITÁRIOS
    // ======================

    log(...args) {
        if (this.debug) {
            console.log('[SalvamentoSupabase]', ...args);
        }
    }
}

// ======================
// INICIALIZAÇÃO GLOBAL
// ======================

let salvamento;

try {
    salvamento = new SalvamentoSupabase();
    
    // Adicionar função para teste rápido
    window.testarAutenticacao = async () => {
        console.log('🔍 Testando autenticação...');
        const autenticado = await salvamento.inicializarAutenticacao();
        console.log('✅ Autenticado:', autenticado);
        if (autenticado) {
            console.log('👤 Usuário:', salvamento.usuarioLogado?.email);
            console.log('🆔 ID:', salvamento.usuarioLogado?.id);
        }
        return autenticado;
    };
    
    // Adicionar função para verificar sessão atual
    window.verificarSessaoAtual = async () => {
        const { data } = await salvamento.supabase.auth.getSession();
        console.log('🔐 Sessão atual:', data.session);
        return data.session;
    };
    
    console.log('✅ Sistema de salvamento inicializado com sucesso');
    
} catch (error) {
    console.error('❌ Erro ao inicializar sistema de salvamento:', error);
    
    // Fallback seguro
    salvamento = {
        verificarLimitePersonagens: async () => ({
            podeCriar: true,
            quantidade: 0,
            limite: 10,
            motivo: ''
        }),
        salvarPersonagem: async (id) => {
            console.log('⚠️ Salvamento não disponível. Usando fallback.');
            alert('Sistema de salvamento temporariamente indisponível. Seus dados serão salvos localmente.');
            
            // Salvar localmente como fallback
            const dados = {
                id: id || 'local_' + Date.now(),
                nome: document.getElementById('charName')?.value || 'Personagem Local',
                data: new Date().toISOString()
            };
            
            localStorage.setItem('personagem_fallback', JSON.stringify(dados));
            
            // Simular sucesso
            setTimeout(() => {
                alert('Personagem salvo localmente (modo offline).');
                window.location.href = 'personagens.html';
            }, 1000);
            
            return true;
        },
        carregarPersonagem: async () => {
            const dados = localStorage.getItem('personagem_fallback');
            return dados ? JSON.parse(dados) : null;
        },
        excluirPersonagem: async () => {
            localStorage.removeItem('personagem_fallback');
            return true;
        },
        inicializarAutenticacao: async () => true
    };
    
    console.log('⚠️ Sistema de salvamento em modo fallback');
}

// Exportar para uso global
window.salvamento = salvamento;

// Função auxiliar para verificar se está logado
window.verificarLogin = async () => {
    if (!window.salvamento) return false;
    return await window.salvamento.inicializarAutenticacao();
};

// Inicialização automática
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Sistema de salvamento pronto');
    
    // Teste rápido de conexão
    if (window.salvamento && window.salvamento.debug) {
        setTimeout(async () => {
            const autenticado = await window.salvamento.inicializarAutenticacao();
            console.log('🔍 Status de autenticação na inicialização:', autenticado);
        }, 1000);
    }
});
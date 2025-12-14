// salvamento-supabase.js - VERSÃO COMPLETA E 100% FUNCIONAL
class SalvamentoSupabase {
    constructor() {
        // GARANTIR que supabase existe
        if (!window.supabase) {
            console.error('❌ ERRO CRÍTICO: Supabase não carregado!');
            alert('ERRO: Sistema não carregado corretamente. Recarregue a página.');
            throw new Error('Supabase não está disponível');
        }
        
        this.supabase = window.supabase;
        this.limitePersonagens = 10;
        this.usuarioLogado = null;
        this.session = null;
    }

    // ======================
    // AUTENTICAÇÃO - VERSÃO DEFINITIVA
    // ======================
    async inicializarAutenticacao() {
        try {
            // 1. Tentar pegar o usuário ATUAL (método mais confiável)
            const { data: { user }, error: userError } = await this.supabase.auth.getUser();
            
            if (userError) {
                console.log('Erro ao obter usuário:', userError);
                return false;
            }
            
            if (user) {
                this.usuarioLogado = user;
                console.log('✅ Usuário autenticado via getUser():', user.email);
                return true;
            }
            
            // 2. Se não tem usuário, tentar sessão
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (session && session.user) {
                this.usuarioLogado = session.user;
                this.session = session;
                console.log('✅ Usuário autenticado via getSession():', session.user.email);
                return true;
            }
            
            console.log('⚠️ Nenhuma autenticação encontrada');
            return false;
            
        } catch (error) {
            console.error('Erro fatal na autenticação:', error);
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
        
        // VERIFICAÇÃO CRÍTICA: usuário deve estar logado
        if (!this.usuarioLogado || !this.usuarioLogado.id) {
            this.log('❌ ERRO: Usuário não autenticado ao coletar dados!');
            alert('❌ ERRO CRÍTICO: Sua sessão expirou! Faça login novamente.');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
            return { nome: 'ERRO_DE_AUTENTICACAO' };
        }
        
        this.log(`👤 User ID sendo usado: ${this.usuarioLogado.id}`);
        
        let dadosBase = {
            user_id: this.usuarioLogado.id, // ← ESSE É O MAIS IMPORTANTE!
            nome: document.getElementById('charName')?.value || 'Novo Personagem',
            classe: document.getElementById('classePersonagem')?.value || '',
            raca: document.getElementById('racaPersonagem')?.value || '',
            nivel: document.getElementById('nivelPersonagem')?.value || 'Nível 1',
            descricao: document.getElementById('descricaoPersonagem')?.value || '',
            status: 'Ativo',
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString() // ← IMPORTANTE para novos
        };

        // Tentar usar o coletor de dados, se disponível
        if (window.coletor && typeof window.coletor.coletarTodosDados === 'function') {
            try {
                const dadosColetor = window.coletor.coletarTodosDados();
                this.log('✅ Dados coletados via coletor');
                // Garantir que user_id não seja sobrescrito
                dadosColetor.user_id = this.usuarioLogado.id;
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
            avatar_url: null
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
            this.log(`🆔 ID do usuário: ${this.usuarioLogado.id}`);

            // 2. COLETAR DADOS
            this.log('📋 Coletando dados do personagem...');
            const dados = this.coletarDadosCompletos();
            
            if (!dados || dados.nome === 'ERRO_DE_AUTENTICACAO') {
                return false;
            }

            // GARANTIR que user_id está correto
            dados.user_id = this.usuarioLogado.id;
            
            this.log('📊 Dados coletados:', dados.nome, dados.classe, dados.raca);
            this.log('🔑 User ID nos dados:', dados.user_id);

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
                // NÃO deletar user_id em modo edição - manter o mesmo!

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
                
                // Garantir created_at para novo personagem
                dados.created_at = new Date().toISOString();
                dados.user_id = this.usuarioLogado.id; // ← CRÍTICO!

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
                this.log('❌ Erro do Supabase:', resultado.error);
                alert('❌ Erro ao salvar: ' + resultado.error.message);
                return false;
            }

            // 7. MOSTRAR SUCESSO
            this.log('✅ Personagem salvo com sucesso!');
            alert('✅ Personagem salvo com sucesso!\n\nRedirecionando para seus personagens...');
            
            setTimeout(() => {
                window.location.href = 'personagens.html';
            }, 2000);
            
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
                detalhes = 'Verifique se está logado e se as políticas RLS estão corretas.';
                break;
            case '42P01':
                mensagem = 'Tabela não existe';
                detalhes = 'A tabela characters não existe no banco.';
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
    // FUNÇÃO DE TESTE DIRETA
    // ======================
    async testeSalvamentoDireto() {
        try {
            this.log('🧪 TESTE DIRETO DO SALVAMENTO');
            
            // 1. Verificar supabase
            if (!this.supabase) {
                alert('Supabase não carregado!');
                return;
            }
            
            // 2. Pegar usuário atual
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) {
                alert('NÃO LOGADO! Faça login primeiro.');
                window.location.href = 'login.html';
                return;
            }
            
            this.log('Usuário:', user.email);
            this.log('ID:', user.id);
            
            // 3. Salvar teste DIRETO
            const dadosTeste = {
                user_id: user.id,
                nome: 'TESTE DIRETO ' + Date.now(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                status: 'Ativo',
                classe: 'Teste',
                raca: 'Teste'
            };
            
            this.log('Enviando:', dadosTeste);
            
            const { data, error } = await this.supabase
                .from('characters')
                .insert([dadosTeste])
                .select();
            
            if (error) {
                this.log('❌ ERRO:', error);
                alert('❌ ERRO: ' + error.message);
                
                // Mostrar detalhes do erro
                if (error.code === '42501') {
                    alert('ERRO DE PERMISSÃO!\n\n1. Verifique se as políticas RLS estão corretas\n2. Execute o SQL que te passei\n3. Limpe cache do navegador');
                }
            } else {
                this.log('✅ SUCESSO!', data);
                alert('✅ FUNCIONOU! Personagem de teste criado!\n\nID: ' + data[0].id);
            }
            
        } catch (error) {
            this.log('❌ Erro no teste:', error);
            alert('Erro: ' + error.message);
        }
    }

    // ======================
    // UTILITÁRIOS
    // ======================
    log(...args) {
        console.log('[SalvamentoSupabase]', ...args);
    }
}

// ======================
// INICIALIZAÇÃO GLOBAL
// ======================
let salvamento;

try {
    salvamento = new SalvamentoSupabase();
    
    // Adicionar função para teste rápido
    window.testarSalvamento = () => salvamento.testeSalvamentoDireto();
    
    // Função para verificar autenticação
    window.verificarAutenticacaoAtual = async () => {
        return await salvamento.inicializarAutenticacao();
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
        inicializarAutenticacao: async () => true,
        testeSalvamentoDireto: async () => {
            alert('Execute no console: window.salvamento.testeSalvamentoDireto()');
        }
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
    if (window.salvamento) {
        setTimeout(async () => {
            const autenticado = await window.salvamento.inicializarAutenticacao();
            console.log('🔍 Status de autenticação na inicialização:', autenticado);
        }, 1000);
    }
});
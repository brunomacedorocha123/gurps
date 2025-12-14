// salvamento-supabase.js - VERSÃO SIMPLIFICADA E FUNCIONAL
class SalvamentoSupabase {
    constructor() {
        // Verificar se Supabase está disponível
        if (!window.supabase) {
            console.error('❌ ERRO: Supabase não carregado!');
            throw new Error('Supabase não está disponível');
        }
        
        this.supabase = window.supabase;
        this.limitePersonagens = 10;
        this.usuarioLogado = null;
    }

    // ======================
    // AUTENTICAÇÃO SIMPLES
    // ======================
    async inicializarAutenticacao() {
        try {
            // Se já temos usuário, retornar
            if (this.usuarioLogado) {
                return true;
            }
            
            // TENTAR DOIS MÉTODOS:
            
            // 1. Primeiro tenta pegar o usuário atual
            const { data: { user } } = await this.supabase.auth.getUser();
            
            if (user) {
                console.log('✅ Usuário via getUser():', user.email);
                this.usuarioLogado = user;
                return true;
            }
            
            // 2. Se não tem usuário, tenta sessão
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (session && session.user) {
                console.log('✅ Usuário via getSession():', session.user.email);
                this.usuarioLogado = session.user;
                return true;
            }
            
            console.log('⚠️ Nenhuma autenticação encontrada');
            return false;
            
        } catch (error) {
            console.error('Erro na autenticação:', error);
            return false;
        }
    }

    // ======================
    // VERIFICAÇÃO DE LIMITE
    // ======================
    async verificarLimitePersonagens() {
        const autenticado = await this.inicializarAutenticacao();
        
        if (!autenticado) {
            return {
                podeCriar: false,
                quantidade: 0,
                limite: this.limitePersonagens,
                motivo: 'Você precisa estar logado para criar personagens'
            };
        }
        
        try {
            const { count, error } = await this.supabase
                .from('characters')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', this.usuarioLogado.id);
            
            if (error) {
                console.error('Erro ao contar:', error);
                return {
                    podeCriar: false,
                    quantidade: 0,
                    limite: this.limitePersonagens,
                    motivo: 'Erro ao verificar limite'
                };
            }
            
            const podeCriar = (count || 0) < this.limitePersonagens;
            const motivo = podeCriar ? '' : `Limite de ${this.limitePersonagens} personagens atingido`;
            
            return {
                podeCriar,
                quantidade: count || 0,
                limite: this.limitePersonagens,
                motivo
            };
            
        } catch (error) {
            console.error('Erro na verificação:', error);
            return {
                podeCriar: false,
                quantidade: 0,
                limite: this.limitePersonagens,
                motivo: 'Erro ao verificar limite'
            };
        }
    }

    // ======================
    // SISTEMA DE FOTOS
    // ======================
    async salvarFotoNoSupabase(file, personagemId) {
        if (!file || !personagemId || !this.usuarioLogado) {
            return null;
        }

        try {
            const fileExt = file.name.split('.').pop().toLowerCase();
            const fileName = `avatar_${personagemId}_${Date.now()}.${fileExt}`;
            const filePath = `avatars/${this.usuarioLogado.id}/${fileName}`;

            const { data: uploadData, error: uploadError } = await this.supabase.storage
                .from('characters')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                console.error('Erro no upload:', uploadError);
                return null;
            }

            const { data: { publicUrl } } = this.supabase.storage
                .from('characters')
                .getPublicUrl(filePath);

            return publicUrl;

        } catch (error) {
            console.error('Erro ao salvar foto:', error);
            return null;
        }
    }

    // ======================
    // COLETA DE DADOS
    // ======================
    coletarDadosCompletos() {
        // DADOS BÁSICOS
        const dadosBase = {
            user_id: this.usuarioLogado?.id, // CRÍTICO!
            nome: document.getElementById('charName')?.value || 'Novo Personagem',
            classe: document.getElementById('classePersonagem')?.value || '',
            raca: document.getElementById('racaPersonagem')?.value || '',
            nivel: document.getElementById('nivelPersonagem')?.value || 'Nível 1',
            descricao: document.getElementById('descricaoPersonagem')?.value || '',
            status: 'Ativo',
            updated_at: new Date().toISOString()
        };

        // Se tiver coletor de dados, usar
        if (window.coletor && typeof window.coletor.coletarTodosDados === 'function') {
            try {
                const dadosColetor = window.coletor.coletarTodosDados();
                // Garantir que user_id não seja sobrescrito
                dadosColetor.user_id = this.usuarioLogado?.id;
                return { ...dadosBase, ...dadosColetor };
            } catch (error) {
                console.warn('Erro no coletor:', error);
            }
        }

        // DADOS BÁSICOS MANUAIS
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

            avatar_url: null,
            created_at: new Date().toISOString()
        };

        return { ...dadosBase, ...dadosManuais };
    }

    // ======================
    // VALIDAÇÃO
    // ======================
    validarPontos(dados) {
        if (dados.pontos_gastos > dados.pontos_totais) {
            alert(`Erro: Você gastou ${dados.pontos_gastos} pontos, mas tem apenas ${dados.pontos_totais} pontos totais!`);
            return false;
        }
        
        if (dados.desvantagens_atuais < dados.limite_desvantagens) {
            alert('Erro: Você excedeu o limite de desvantagens!');
            return false;
        }
        
        if (!dados.nome || dados.nome.trim() === '') {
            alert('Erro: O personagem precisa ter um nome!');
            return false;
        }
        
        return true;
    }

    // ======================
    // SALVAMENTO PRINCIPAL
    // ======================
    async salvarPersonagem(personagemId = null) {
        try {
            console.log('💾 Iniciando salvamento...');
            
            // 1. VERIFICAR AUTENTICAÇÃO
            const autenticado = await this.inicializarAutenticacao();
            if (!autenticado) {
                alert('Você precisa estar logado para salvar personagens!');
                window.location.href = 'login.html';
                return false;
            }

            console.log('👤 Usuário:', this.usuarioLogado.email);

            // 2. COLETAR DADOS
            const dados = this.coletarDadosCompletos();
            
            // GARANTIR user_id
            dados.user_id = this.usuarioLogado.id;
            
            console.log('📊 Dados coletados:', dados.nome);

            // 3. VALIDAR
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
                    }
                } catch (error) {
                    console.warn('Erro ao obter foto:', error);
                }
            }

            let resultado;
            let personagemSalvoId = personagemId;

            // 5. SALVAR NO BANCO
            if (personagemId) {
                // MODO EDIÇÃO
                console.log('✏️ Editando personagem:', personagemId);
                
                // Remover campos
                delete dados.id;
                delete dados.created_at;
                delete dados.user_id; // Em edição, manter o original

                // Salvar foto se tiver
                if (fotoFile) {
                    fotoUrl = await this.salvarFotoNoSupabase(fotoFile, personagemId);
                    if (fotoUrl) {
                        dados.avatar_url = fotoUrl;
                    }
                }

                // Atualizar
                resultado = await this.supabase
                    .from('characters')
                    .update(dados)
                    .eq('id', personagemId)
                    .eq('user_id', this.usuarioLogado.id)
                    .select();

            } else {
                // MODO CRIAÇÃO
                console.log('🆕 Criando novo personagem');
                
                // Garantir campos de criação
                dados.created_at = new Date().toISOString();
                dados.user_id = this.usuarioLogado.id; // CRÍTICO!

                // Criar
                resultado = await this.supabase
                    .from('characters')
                    .insert([dados])
                    .select();

                if (resultado.data && resultado.data[0]) {
                    personagemSalvoId = resultado.data[0].id;
                    console.log('✅ ID criado:', personagemSalvoId);

                    // Salvar foto depois de criar
                    if (fotoFile && personagemSalvoId) {
                        fotoUrl = await this.salvarFotoNoSupabase(fotoFile, personagemSalvoId);
                        
                        if (fotoUrl) {
                            await this.supabase
                                .from('characters')
                                .update({ avatar_url: fotoUrl })
                                .eq('id', personagemSalvoId);
                        }
                    }
                }
            }

            // 6. VERIFICAR RESULTADO
            if (resultado.error) {
                this.tratarErroSupabase(resultado.error);
                return false;
            }

            // 7. SUCESSO
            console.log('✅ Personagem salvo com sucesso!');
            
            const mensagem = personagemId 
                ? 'Personagem atualizado com sucesso!' 
                : 'Personagem criado com sucesso!';
            
            alert(mensagem + '\n\nRedirecionando para seus personagens...');
            
            setTimeout(() => {
                window.location.href = 'personagens.html';
            }, 1500);
            
            return true;

        } catch (error) {
            console.error('❌ Erro no salvamento:', error);
            alert('Erro inesperado ao salvar:\n' + error.message);
            return false;
        }
    }

    // ======================
    // TRATAMENTO DE ERROS
    // ======================
    tratarErroSupabase(error) {
        console.error('Erro Supabase:', error);
        
        let mensagem = 'Erro ao salvar: ';
        
        if (error.code === '42501') {
            mensagem = 'ERRO DE PERMISSÃO!\n\nVocê não tem permissão para salvar.\nVerifique se está logado corretamente.';
        } else if (error.code === '42P01') {
            mensagem = 'Tabela não existe!\nExecute o SQL da tabela characters primeiro.';
        } else if (error.code === '23505') {
            mensagem = 'Personagem já existe!';
        } else {
            mensagem += error.message;
        }
        
        alert(mensagem);
    }

    // ======================
    // CARREGAMENTO
    // ======================
    async carregarPersonagem(personagemId) {
        try {
            const autenticado = await this.inicializarAutenticacao();
            if (!autenticado) {
                alert('Você precisa estar logado para carregar personagens!');
                return null;
            }

            const { data: personagem, error } = await this.supabase
                .from('characters')
                .select('*')
                .eq('id', personagemId)
                .eq('user_id', this.usuarioLogado.id)
                .single();

            if (error) {
                alert('Erro ao carregar personagem:\n' + error.message);
                return null;
            }

            return personagem;

        } catch (error) {
            alert('Erro ao carregar personagem');
            return null;
        }
    }

    // ======================
    // EXCLUSÃO
    // ======================
    async excluirPersonagem(personagemId) {
        try {
            const autenticado = await this.inicializarAutenticacao();
            if (!autenticado) {
                alert('Você precisa estar logado para excluir personagens!');
                return false;
            }

            if (!confirm('Tem certeza que deseja excluir este personagem?\n\nEsta ação não pode ser desfeita!')) {
                return false;
            }

            const { error } = await this.supabase
                .from('characters')
                .delete()
                .eq('id', personagemId)
                .eq('user_id', this.usuarioLogado.id);

            if (error) {
                alert('Erro ao excluir personagem:\n' + error.message);
                return false;
            }

            alert('✅ Personagem excluído com sucesso!');
            return true;

        } catch (error) {
            alert('Erro ao excluir personagem');
            return false;
        }
    }
}

// ======================
// INICIALIZAÇÃO GLOBAL
// ======================

let salvamento;

try {
    salvamento = new SalvamentoSupabase();
    window.salvamento = salvamento;
    
    console.log('✅ Sistema de salvamento carregado');
    
} catch (error) {
    console.error('❌ Erro ao carregar salvamento:', error);
    
    // Fallback seguro
    salvamento = {
        verificarLimitePersonagens: async () => ({
            podeCriar: true,
            quantidade: 0,
            limite: 10,
            motivo: ''
        }),
        salvarPersonagem: async (id) => {
            alert('Sistema de salvamento não disponível. Tente recarregar a página.');
            return false;
        },
        carregarPersonagem: async () => null,
        excluirPersonagem: async () => false,
        inicializarAutenticacao: async () => false
    };
    
    window.salvamento = salvamento;
}

// Função para teste rápido
window.testeSalvamento = async function() {
    console.log('🧪 Testando salvamento...');
    
    if (!window.salvamento) {
        alert('Sistema de salvamento não carregado!');
        return;
    }
    
    const autenticado = await window.salvamento.inicializarAutenticacao();
    
    if (autenticado) {
        alert('✅ AUTENTICADO!\nUsuário: ' + window.salvamento.usuarioLogado?.email);
    } else {
        alert('❌ NÃO AUTENTICADO!');
    }
};
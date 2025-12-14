// salvamento-supabase.js
class SalvamentoSupabase {
    constructor() {
        this.supabase = supabase; // Já configurado no HTML
        this.limitePersonagens = 5;
    }
    
    // ======================
    // VERIFICAÇÕES
    // ======================
    
    async verificarLimitePersonagens() {
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            if (!session) return { podeCriar: false, motivo: 'Não autenticado' };
            
            const { data: personagens, error } = await this.supabase
                .from('characters')
                .select('id')
                .eq('user_id', session.user.id);
            
            if (error) {
                console.error('Erro ao verificar limite:', error);
                return { podeCriar: false, motivo: 'Erro ao verificar limite' };
            }
            
            const quantidade = personagens ? personagens.length : 0;
            const podeCriar = quantidade < this.limitePersonagens;
            
            return {
                podeCriar,
                quantidade,
                limite: this.limitePersonagens,
                motivo: podeCriar ? '' : `Limite de ${this.limitePersonagens} personagens atingido`
            };
            
        } catch (error) {
            console.error('Erro ao verificar limite:', error);
            return { podeCriar: false, motivo: 'Erro ao verificar limite' };
        }
    }
    
    // ======================
    // SALVAR PERSONAGEM
    // ======================
    
    async salvarPersonagem(personagemId = null) {
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (!session) {
                alert('Você precisa estar logado para salvar!');
                window.location.href = 'login.html';
                return false;
            }
            
            // Verificar limite para novos personagens
            if (!personagemId) {
                const limite = await this.verificarLimitePersonagens();
                if (!limite.podeCriar) {
                    alert(limite.motivo);
                    return false;
                }
            }
            
            // Coletar dados
            const dados = coletor.coletarTodosDados();
            
            // Preparar dados para Supabase
            const dadosSupabase = {
                user_id: session.user.id,
                ...dados,
                status: personagemId ? 'Ativo' : 'Em Criação',
                created_at: personagemId ? undefined : new Date().toISOString()
            };
            
            let resultado;
            
            if (personagemId) {
                // Atualizar personagem existente
                resultado = await this.supabase
                    .from('characters')
                    .update(dadosSupabase)
                    .eq('id', personagemId)
                    .eq('user_id', session.user.id);
            } else {
                // Criar novo personagem
                resultado = await this.supabase
                    .from('characters')
                    .insert([dadosSupabase])
                    .select();
            }
            
            if (resultado.error) {
                console.error('Erro ao salvar:', resultado.error);
                alert('Erro ao salvar personagem. Tente novamente.');
                return false;
            }
            
            // Sucesso
            const mensagem = personagemId ? 'Personagem atualizado com sucesso!' : 'Personagem criado com sucesso!';
            alert(mensagem);
            
            // Se for criação, retorna o ID
            if (!personagemId && resultado.data && resultado.data[0]) {
                return { sucesso: true, id: resultado.data[0].id };
            }
            
            return { sucesso: true };
            
        } catch (error) {
            console.error('Erro ao salvar personagem:', error);
            alert('Erro ao salvar personagem. Verifique sua conexão e tente novamente.');
            return false;
        }
    }
    
    // ======================
    // CARREGAR PERSONAGEM
    // ======================
    
    async carregarPersonagem(personagemId) {
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (!session) {
                window.location.href = 'login.html';
                return null;
            }
            
            const { data: personagem, error } = await this.supabase
                .from('characters')
                .select('*')
                .eq('id', personagemId)
                .eq('user_id', session.user.id)
                .single();
            
            if (error || !personagem) {
                console.error('Erro ao carregar:', error);
                alert('Personagem não encontrado ou você não tem permissão para editá-lo.');
                window.location.href = 'personagens.html';
                return null;
            }
            
            return personagem;
            
        } catch (error) {
            console.error('Erro ao carregar personagem:', error);
            alert('Erro ao carregar personagem.');
            window.location.href = 'personagens.html';
            return null;
        }
    }
    
    // ======================
    // EXCLUIR PERSONAGEM
    // ======================
    
    async excluirPersonagem(personagemId) {
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (!session) {
                alert('Você precisa estar logado para excluir!');
                return false;
            }
            
            const confirmacao = confirm('Tem certeza que deseja excluir este personagem?\nEsta ação não pode ser desfeita!');
            if (!confirmacao) return false;
            
            const { error } = await this.supabase
                .from('characters')
                .delete()
                .eq('id', personagemId)
                .eq('user_id', session.user.id);
            
            if (error) {
                console.error('Erro ao excluir:', error);
                alert('Erro ao excluir personagem.');
                return false;
            }
            
            alert('Personagem excluído com sucesso!');
            return true;
            
        } catch (error) {
            console.error('Erro ao excluir personagem:', error);
            alert('Erro ao excluir personagem.');
            return false;
        }
    }
    
    // ======================
    // UPLOAD DE FOTO
    // ======================
    
    async uploadFotoPersonagem(file, personagemId) {
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (!session || !personagemId) {
                console.error('Sem sessão ou ID para upload');
                return null;
            }
            
            const fileExt = file.name.split('.').pop();
            const fileName = `${personagemId}_${Date.now()}.${fileExt}`;
            const filePath = `avatars/${session.user.id}/${fileName}`;
            
            // Upload para storage
            const { error: uploadError } = await this.supabase.storage
                .from('characters')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });
            
            if (uploadError) {
                console.error('Erro no upload:', uploadError);
                return null;
            }
            
            // Obter URL pública
            const { data: { publicUrl } } = this.supabase.storage
                .from('characters')
                .getPublicUrl(filePath);
            
            // Atualizar personagem com a URL
            await this.supabase
                .from('characters')
                .update({ 
                    avatar_url: publicUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', personagemId)
                .eq('user_id', session.user.id);
            
            return publicUrl;
            
        } catch (error) {
            console.error('Erro no upload da foto:', error);
            return null;
        }
    }
    
    // ======================
    // OBTER LISTA DE PERSONAGENS
    // ======================
    
    async obterPersonagensUsuario() {
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (!session) {
                return [];
            }
            
            const { data: personagens, error } = await this.supabase
                .from('characters')
                .select('id, nome, classe, raca, avatar_url, pontos_gastos, pontos_totais, forca, destreza, inteligencia, saude, created_at, status')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('Erro ao buscar personagens:', error);
                return [];
            }
            
            return personagens || [];
            
        } catch (error) {
            console.error('Erro ao obter personagens:', error);
            return [];
        }
    }
}

// Instância global
const salvamento = new SalvamentoSupabase();
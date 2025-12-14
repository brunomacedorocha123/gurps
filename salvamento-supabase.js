// salvamento-supabase.js - VERSÃO SIMPLIFICADA E FUNCIONAL
class SalvamentoSupabase {
    constructor() {
        this.supabase = supabase;
        this.limitePersonagens = 10; // Aumentei para 10 para facilitar
    }
    
    async verificarLimitePersonagens() {
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (!session) {
                console.log('Sem sessão - redirecionando para login');
                return { podeCriar: false, motivo: 'Não autenticado' };
            }
            
            // Buscar APENAS a contagem, não todos os dados
            const { count, error } = await this.supabase
                .from('characters')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', session.user.id);
            
            console.log('Contagem de personagens:', count, 'Erro:', error);
            
            if (error) {
                console.error('Erro na contagem:', error);
                // Em caso de erro, permite criar (não bloqueia)
                return { podeCriar: true, quantidade: 0, limite: this.limitePersonagens, motivo: '' };
            }
            
            const quantidade = count || 0;
            const podeCriar = quantidade < this.limitePersonagens;
            
            return {
                podeCriar,
                quantidade,
                limite: this.limitePersonagens,
                motivo: podeCriar ? '' : `Você já tem ${quantidade} personagens (limite: ${this.limitePersonagens})`
            };
            
        } catch (error) {
            console.error('Erro geral no verificarLimite:', error);
            // Em caso de erro, permite criar
            return { podeCriar: true, quantidade: 0, limite: this.limitePersonagens, motivo: '' };
        }
    }
    
    async salvarPersonagem(personagemId = null) {
        try {
            console.log('Iniciando salvamento, personagemId:', personagemId);
            
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (!session) {
                alert('Você precisa estar logado para salvar!');
                window.location.href = 'login.html';
                return false;
            }
            
            // Pular verificação de limite por enquanto
            // const limite = await this.verificarLimitePersonagens();
            // if (!limite.podeCriar && !personagemId) {
            //     alert(limite.motivo);
            //     return false;
            // }
            
            // Coletar dados BÁSICOS para teste
            const dadosBasicos = {
                user_id: session.user.id,
                nome: document.getElementById('charName')?.value || 'Novo Personagem',
                classe: document.getElementById('classePersonagem')?.value || '',
                raca: document.getElementById('racaPersonagem')?.value || '',
                nivel: document.getElementById('nivelPersonagem')?.value || '',
                descricao: document.getElementById('descricaoPersonagem')?.value || '',
                
                // Pontos básicos
                pontos_totais: 150,
                pontos_gastos: 0,
                
                // Atributos básicos
                forca: parseInt(document.getElementById('ST')?.value) || 10,
                destreza: parseInt(document.getElementById('DX')?.value) || 10,
                inteligencia: parseInt(document.getElementById('IQ')?.value) || 10,
                saude: parseInt(document.getElementById('HT')?.value) || 10,
                
                status: 'Ativo',
                updated_at: new Date().toISOString()
            };
            
            console.log('Dados a salvar:', dadosBasicos);
            
            let resultado;
            
            if (personagemId) {
                // Atualizar
                resultado = await this.supabase
                    .from('characters')
                    .update(dadosBasicos)
                    .eq('id', personagemId)
                    .eq('user_id', session.user.id);
            } else {
                // Criar novo
                resultado = await this.supabase
                    .from('characters')
                    .insert([dadosBasicos])
                    .select();
            }
            
            console.log('Resultado do Supabase:', resultado);
            
            if (resultado.error) {
                console.error('Erro do Supabase:', resultado.error);
                alert('Erro ao salvar: ' + resultado.error.message);
                return false;
            }
            
            // Sucesso!
            const mensagem = personagemId ? 'Personagem atualizado!' : 'Personagem criado com sucesso!';
            alert(mensagem);
            
            // Se for criação, retorna o ID
            if (!personagemId && resultado.data && resultado.data[0]) {
                return { sucesso: true, id: resultado.data[0].id };
            }
            
            // Redirecionar após 1 segundo
            setTimeout(() => {
                window.location.href = 'personagens.html';
            }, 1000);
            
            return { sucesso: true };
            
        } catch (error) {
            console.error('Erro no salvamento:', error);
            alert('Erro ao salvar. Abra o console (F12) e me mostre o erro.');
            return false;
        }
    }
    
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
                return null;
            }
            
            return personagem;
            
        } catch (error) {
            console.error('Erro ao carregar personagem:', error);
            return null;
        }
    }
    
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
}

// Instância global
const salvamento = new SalvamentoSupabase();
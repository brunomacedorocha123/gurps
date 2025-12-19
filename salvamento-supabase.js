// salvamento-supabase-completo-funcional.js
class SalvamentoSupabase {
    constructor() {
        this.supabase = window.supabase || window.supabaseClient;
        
        if (!this.supabase) {
            throw new Error('Supabase não está disponível. Verifique se o script do Supabase foi carregado antes deste arquivo.');
        }
    }

    // MÉTODO PRINCIPAL DE SALVAMENTO
    async salvarPersonagem(personagemId = null) {
        try {
            // 1. VERIFICAR AUTENTICAÇÃO DO USUÁRIO
            const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
            
            if (sessionError) {
                this._mostrarErro('Erro ao verificar sessão: ' + sessionError.message);
                return false;
            }
            
            if (!session) {
                this._mostrarErro('Você precisa estar logado para salvar personagens!');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return false;
            }

            const userId = session.user.id;

            // 2. INICIAR INDICADOR DE CARREGAMENTO
            this._iniciarLoading();

            // 3. COLETAR TODOS OS DADOS DO PERSONAGEM
            if (!window.coletor || typeof window.coletor.obterDadosParaSupabase !== 'function') {
                this._mostrarErro('Sistema de coleta de dados não está disponível. Recarregue a página.');
                this._pararLoading();
                return false;
            }

            const dadosCompletos = window.coletor.obterDadosParaSupabase();
            
            // 4. VALIDAÇÃO CRÍTICA DOS DADOS
            if (!dadosCompletos.nome || dadosCompletos.nome.trim() === '' || dadosCompletos.nome === 'Novo Personagem') {
                this._mostrarErro('O personagem precisa ter um nome válido!');
                this._pararLoading();
                return false;
            }

            // 5. PREPARAR DADOS PARA O SUPABASE
            const dadosParaSupabase = this._prepararDadosCompletos(dadosCompletos, userId);
            
            // 6. EXECUTAR OPERAÇÃO NO BANCO DE DADOS
            let resultadoOperacao;
            
            if (personagemId) {
                // EDIÇÃO DE PERSONAGEM EXISTENTE
                resultadoOperacao = await this._atualizarPersonagemExistente(personagemId, dadosParaSupabase, userId);
            } else {
                // CRIAÇÃO DE NOVO PERSONAGEM
                resultadoOperacao = await this._criarNovoPersonagem(dadosParaSupabase);
                personagemId = resultadoOperacao?.id;
            }

            // 7. VERIFICAR RESULTADO DA OPERAÇÃO
            if (!resultadoOperacao) {
                this._pararLoading();
                return false;
            }

            // 8. SALVAR ID NO LOCALSTORAGE PARA RECUPERAÇÃO
            if (personagemId) {
                localStorage.setItem('ultimo_personagem_salvo_id', personagemId);
                localStorage.setItem('ultimo_personagem_salvo_nome', dadosCompletos.nome);
            }

            // 9. FINALIZAR COM SUCESSO
            this._pararLoading();
            this._mostrarSucesso(personagemId ? 'Personagem atualizado com sucesso!' : 'Personagem criado com sucesso!');

            // 10. REDIRECIONAR APÓS SUCESSO
            setTimeout(() => {
                window.location.href = 'personagens.html';
            }, 2500);

            return true;

        } catch (error) {
            // TRATAMENTO DE ERRO COMPLETO
            this._pararLoading();
            this._tratarErroSalvamento(error);
            return false;
        }
    }

    // CARREGAR PERSONAGEM EXISTENTE
    async carregarPersonagem(personagemId) {
        try {
            // VERIFICAR AUTENTICAÇÃO
            const { data: { session } } = await this.supabase.auth.getSession();
            if (!session) {
                this._mostrarErro('Você precisa estar logado para carregar personagens!');
                return null;
            }

            // BUSCAR PERSONAGEM NO BANCO
            const { data: personagem, error } = await this.supabase
                .from('characters')
                .select('*')
                .eq('id', personagemId)
                .eq('user_id', session.user.id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    this._mostrarErro('Personagem não encontrado ou você não tem permissão para acessá-lo.');
                } else {
                    throw error;
                }
                return null;
            }

            // VALIDAR DADOS RECEBIDOS
            if (!personagem || typeof personagem !== 'object') {
                this._mostrarErro('Dados do personagem inválidos.');
                return null;
            }

            return personagem;

        } catch (error) {
            this._tratarErroCarregamento(error);
            return null;
        }
    }

    // EXCLUIR PERSONAGEM
    async excluirPersonagem(personagemId) {
        try {
            // CONFIRMAÇÃO DE EXCLUSÃO
            const confirmacao = confirm('Tem certeza que deseja excluir este personagem permanentemente?\n\nEsta ação NÃO pode ser desfeita!');
            if (!confirmacao) {
                return false;
            }

            // VERIFICAR AUTENTICAÇÃO
            const { data: { session } } = await this.supabase.auth.getSession();
            if (!session) {
                this._mostrarErro('Você precisa estar logado para excluir personagens!');
                return false;
            }

            // INICIAR LOADING
            this._iniciarLoading('Excluindo...');

            // EXECUTAR EXCLUSÃO
            const { error } = await this.supabase
                .from('characters')
                .delete()
                .eq('id', personagemId)
                .eq('user_id', session.user.id);

            if (error) {
                throw error;
            }

            // LIMPAR LOCALSTORAGE
            localStorage.removeItem('ultimo_personagem_salvo_id');
            localStorage.removeItem('ultimo_personagem_salvo_nome');

            // SUCESSO
            this._pararLoading();
            this._mostrarSucesso('Personagem excluído com sucesso!');

            // REDIRECIONAR
            setTimeout(() => {
                window.location.href = 'personagens.html';
            }, 2000);

            return true;

        } catch (error) {
            this._pararLoading();
            this._tratarErroExclusao(error);
            return false;
        }
    }

    // ======================
    // MÉTODOS PRIVADOS AUXILIARES
    // ======================

    _prepararDadosCompletos(dadosColetados, userId) {
        const dadosParaSupabase = {
            // DADOS BÁSICOS
            nome: dadosColetados.nome || 'Novo Personagem',
            raca: dadosColetados.raca || '',
            classe: dadosColetados.classe || '',
            nivel: dadosColetados.nivel || '1',
            descricao: dadosColetados.descricao || '',
            
            // ATRIBUTOS PRIMÁRIOS
            forca: dadosColetados.forca || 10,
            destreza: dadosColetados.destreza || 10,
            inteligencia: dadosColetados.inteligencia || 10,
            saude: dadosColetados.saude || 10,
            
            // ATRIBUTOS SECUNDÁRIOS
            pontos_vida: dadosColetados.pontos_vida || 10,
            pontos_fadiga: dadosColetados.pontos_fadiga || 10,
            vontade: dadosColetados.vontade || 10,
            percepcao: dadosColetados.percepcao || 10,
            deslocamento: dadosColetados.deslocamento || 5.0,
            
            // PONTUAÇÃO
            pontos_totais: dadosColetados.pontos_totais || 150,
            pontos_gastos: dadosColetados.pontos_gastos || 0,
            pontos_disponiveis: dadosColetados.pontos_disponiveis || 150,
            
            // DADOS DE COMBATE
            pv_atual: dadosColetados.pv_atual || 10,
            pv_maximo: dadosColetados.pv_maximo || 10,
            pf_atual: dadosColetados.pf_atual || 10,
            pf_maximo: dadosColetados.pf_maximo || 10,
            esquiva: dadosColetados.esquiva || 8,
            bloqueio: dadosColetados.bloqueio || 9,
            aparar: dadosColetados.aparar || 0,
            
            // CARACTERÍSTICAS FÍSICAS
            altura: dadosColetados.altura || 1.70,
            peso: dadosColetados.peso || 70,
            aparencia: dadosColetados.aparencia || 'Comum',
            riqueza: dadosColetados.riqueza || 'Média',
            
            // EQUIPAMENTO E INVENTÁRIO
            dinheiro: dadosColetados.dinheiro || 2000,
            peso_atual: dadosColetados.peso_atual || 0,
            peso_maximo: dadosColetados.peso_maximo || 60,
            
            // DADOS COMPLEXOS (JSON)
            vantagens: dadosColetados.vantagens || '[]',
            desvantagens: dadosColetados.desvantagens || '[]',
            peculiaridades: dadosColetados.peculiaridades || '[]',
            pericias: dadosColetados.pericias || '[]',
            tecnicas: dadosColetados.tecnicas || '[]',
            magias: dadosColetados.magias || '[]',
            equipamentos: dadosColetados.equipamentos || '[]',
            
            // TOTAIS
            total_vantagens: dadosColetados.total_vantagens || 0,
            total_desvantagens: dadosColetados.total_desvantagens || 0,
            total_peculiaridades: dadosColetados.total_peculiaridades || 0,
            total_pericias: dadosColetados.total_pericias || 0,
            total_tecnicas: dadosColetados.total_tecnicas || 0,
            total_magias: dadosColetados.total_magias || 0,
            
            // CAMPOS OBRIGATÓRIOS DO SUPABASE
            user_id: userId,
            status: 'Ativo',
            updated_at: new Date().toISOString()
        };

        return dadosParaSupabase;
    }

    async _atualizarPersonagemExistente(personagemId, dados, userId) {
        try {
            const { data, error } = await this.supabase
                .from('characters')
                .update(dados)
                .eq('id', personagemId)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) {
                throw new Error(`Erro ao atualizar personagem: ${error.message}`);
            }

            if (!data) {
                throw new Error('Nenhum dado retornado após atualização.');
            }

            return data;

        } catch (error) {
            throw error;
        }
    }

    async _criarNovoPersonagem(dados) {
        try {
            dados.created_at = new Date().toISOString();
            dados.id = this._gerarUUID();

            const { data, error } = await this.supabase
                .from('characters')
                .insert([dados])
                .select()
                .single();

            if (error) {
                throw new Error(`Erro ao criar personagem: ${error.message}`);
            }

            if (!data) {
                throw new Error('Nenhum dado retornado após criação.');
            }

            return data;

        } catch (error) {
            throw error;
        }
    }

    _gerarUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    _iniciarLoading(texto = 'Salvando...') {
        // DESABILITAR TODOS OS BOTÕES DE SALVAR
        const botoesSalvar = document.querySelectorAll('#btnSalvar, [id*="salvar"], [class*="salvar"]');
        botoesSalvar.forEach(botao => {
            botao.disabled = true;
            const originalHTML = botao.innerHTML;
            botao.setAttribute('data-original-html', originalHTML);
            botao.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${texto}`;
        });

        // CRIAR OVERLAY DE LOADING SE NÃO EXISTIR
        let overlay = document.getElementById('loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                backdrop-filter: blur(2px);
            `;
            
            const spinner = document.createElement('div');
            spinner.innerHTML = `
                <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
                    <i class="fas fa-spinner fa-spin fa-3x" style="color: #4f46e5; margin-bottom: 15px;"></i>
                    <p style="margin: 0; font-weight: bold; color: #333;">${texto}</p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Não feche esta página</p>
                </div>
            `;
            
            overlay.appendChild(spinner);
            document.body.appendChild(overlay);
        } else {
            overlay.style.display = 'flex';
        }
    }

    _pararLoading() {
        // REABILITAR BOTÕES
        const botoesSalvar = document.querySelectorAll('#btnSalvar, [id*="salvar"], [class*="salvar"]');
        botoesSalvar.forEach(botao => {
            botao.disabled = false;
            const originalHTML = botao.getAttribute('data-original-html');
            if (originalHTML) {
                botao.innerHTML = originalHTML;
            }
        });

        // REMOVER OVERLAY
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    _mostrarSucesso(mensagem) {
        this._mostrarNotificacao(mensagem, 'success');
    }

    _mostrarErro(mensagem) {
        this._mostrarNotificacao(mensagem, 'error');
    }

    _mostrarNotificacao(mensagem, tipo = 'info') {
        // REMOVER NOTIFICAÇÕES ANTIGAS
        const notificacoesAntigas = document.querySelectorAll('.notificacao-sistema');
        notificacoesAntigas.forEach(n => n.remove());

        // CRIAR NOVA NOTIFICAÇÃO
        const notificacao = document.createElement('div');
        notificacao.className = `notificacao-sistema notificacao-${tipo}`;
        
        const icon = tipo === 'success' ? 'fa-check-circle' : 
                    tipo === 'error' ? 'fa-exclamation-circle' : 
                    'fa-info-circle';
        
        notificacao.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas ${icon}" style="font-size: 20px;"></i>
                <div>
                    <strong style="display: block; margin-bottom: 2px;">${tipo === 'success' ? 'Sucesso!' : tipo === 'error' ? 'Erro!' : 'Informação'}</strong>
                    <span>${mensagem}</span>
                </div>
            </div>
            <button class="fechar-notificacao" style="background: none; border: none; color: inherit; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        `;

        // ESTILOS
        notificacao.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${tipo === 'success' ? '#10b981' : tipo === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 6px 16px rgba(0,0,0,0.2);
            z-index: 99999;
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-width: 300px;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
            font-family: Arial, sans-serif;
        `;

        // BOTÃO FECHAR
        const btnFechar = notificacao.querySelector('.fechar-notificacao');
        btnFechar.addEventListener('click', () => {
            notificacao.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notificacao.parentNode) {
                    notificacao.parentNode.removeChild(notificacao);
                }
            }, 300);
        });

        // ADICIONAR AO BODY
        document.body.appendChild(notificacao);

        // REMOVER AUTOMATICAMENTE APÓS 5 SEGUNDOS
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notificacao.parentNode) {
                        notificacao.parentNode.removeChild(notificacao);
                    }
                }, 300);
            }
        }, 5000);
    }

    _tratarErroSalvamento(error) {
        console.error('Erro no salvamento:', error);
        
        let mensagemUsuario = 'Erro ao salvar personagem:\n\n';
        
        if (error.message.includes('permission denied') || error.message.includes('42501')) {
            mensagemUsuario = 'Permissão negada. Verifique se está logado corretamente.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            mensagemUsuario = 'Erro de conexão. Verifique sua internet.';
        } else if (error.message.includes('auth')) {
            mensagemUsuario = 'Sessão expirada. Faça login novamente.';
            setTimeout(() => window.location.href = 'login.html', 2000);
        } else if (error.message.includes('JSON')) {
            mensagemUsuario = 'Erro nos dados do personagem. Verifique os campos preenchidos.';
        } else if (error.message.includes('duplicate')) {
            mensagemUsuario = 'Já existe um personagem com este nome. Use um nome diferente.';
        } else {
            mensagemUsuario = `Erro: ${error.message.substring(0, 100)}...`;
        }
        
        this._mostrarErro(mensagemUsuario);
    }

    _tratarErroCarregamento(error) {
        console.error('Erro no carregamento:', error);
        this._mostrarErro('Erro ao carregar personagem. Tente novamente.');
    }

    _tratarErroExclusao(error) {
        console.error('Erro na exclusão:', error);
        this._mostrarErro('Erro ao excluir personagem. Tente novamente.');
    }

    // ======================
    // MÉTODOS PÚBLICOS ADICIONAIS
    // ======================

    obterIdDaURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    configurarAutoSave(intervalo = 30000) {
        let ultimoSave = null;
        
        setInterval(() => {
            if (document.hasFocus() && window.coletor) {
                const agora = new Date();
                if (!ultimoSave || (agora - ultimoSave) > intervalo) {
                    this.salvarRapido();
                    ultimoSave = agora;
                }
            }
        }, 10000); // Verifica a cada 10 segundos
    }

    async salvarRapido() {
        try {
            const id = this.obterIdDaURL();
            if (!id) return false;

            const { data: { session } } = await this.supabase.auth.getSession();
            if (!session) return false;

            if (!window.coletor) return false;

            const dados = window.coletor.obterDadosParaSupabase();
            dados.user_id = session.user.id;
            dados.updated_at = new Date().toISOString();

            await this.supabase
                .from('characters')
                .update(dados)
                .eq('id', id)
                .eq('user_id', session.user.id);

            console.log('Auto-save realizado:', new Date().toLocaleTimeString());
            return true;

        } catch (error) {
            console.error('Erro no auto-save:', error);
            return false;
        }
    }
}

// ======================
// INICIALIZAÇÃO AUTOMÁTICA
// ======================

// AGUARDAR O DOM ESTAR COMPLETAMENTE PRONTO
document.addEventListener('DOMContentLoaded', function() {
    // AGUARDAR UM POUCO MAIS PARA GARANTIR QUE TUDO CARREGOU
    setTimeout(function() {
        try {
            // CRIAR INSTÂNCIA
            window.salvamentoSupabase = new SalvamentoSupabase();
            
            console.log('✅ Sistema de salvamento Supabase inicializado com sucesso!');
            
            // ADICIONAR CSS PARA ANIMAÇÕES
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
            
            // CONFIGURAR AUTO-SAVE (OPCIONAL)
            setTimeout(function() {
                window.salvamentoSupabase.configurarAutoSave();
            }, 5000);
            
        } catch (error) {
            console.error('❌ Erro ao inicializar sistema de salvamento:', error);
            
            // FALLBACK EM CASO DE ERRO
            window.salvamentoSupabase = {
                salvarPersonagem: function() {
                    alert('Sistema de salvamento indisponível. Recarregue a página.');
                    return false;
                },
                carregarPersonagem: function() {
                    alert('Sistema de carregamento indisponível.');
                    return null;
                },
                excluirPersonagem: function() {
                    alert('Sistema de exclusão indisponível.');
                    return false;
                }
            };
        }
    }, 1000);
});

// DISPONIBILIZAR PARA USO GLOBAL IMEDIATO
if (typeof window !== 'undefined') {
    // Se precisar usar antes do DOM carregar
    window.SalvamentoSupabase = SalvamentoSupabase;
}
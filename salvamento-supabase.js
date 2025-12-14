// salvamento-supabase.js - VERSÃO COMPLETA E FUNCIONAL
class SalvamentoSupabase {
    constructor() {
        // Verificar se Supabase está disponível
        if (!window.supabase) {
            console.error('❌ ERRO: Supabase não carregado!');
            throw new Error('Supabase não está disponível');
        }
        
        this.supabase = window.supabase;
        this.limitePersonagens = 10;
    }

    // ======================
    // VERIFICAÇÃO DE LIMITE
    // ======================
    async verificarLimitePersonagens() {
        try {
            // 1. Obter usuário autenticado
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (!session) {
                return {
                    podeCriar: false,
                    quantidade: 0,
                    limite: this.limitePersonagens,
                    motivo: 'Você precisa estar logado para criar personagens'
                };
            }
            
            // 2. Contar personagens do usuário
            const { count, error } = await this.supabase
                .from('characters')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', session.user.id);
            
            if (error) {
                console.error('Erro ao contar:', error);
                return {
                    podeCriar: true, // Permite mesmo com erro
                    quantidade: 0,
                    limite: this.limitePersonagens,
                    motivo: ''
                };
            }
            
            const quantidade = count || 0;
            const podeCriar = quantidade < this.limitePersonagens;
            const motivo = podeCriar ? '' : `Limite de ${this.limitePersonagens} personagens atingido`;
            
            return {
                podeCriar,
                quantidade,
                limite: this.limitePersonagens,
                motivo
            };
            
        } catch (error) {
            console.error('Erro na verificação:', error);
            return {
                podeCriar: true,
                quantidade: 0,
                limite: this.limitePersonagens,
                motivo: ''
            };
        }
    }

    // ======================
    // SISTEMA DE FOTOS
    // ======================
    async salvarFotoNoSupabase(file, personagemId) {
        if (!file || !personagemId) {
            return null;
        }

        try {
            // 1. Obter usuário
            const { data: { session } } = await this.supabase.auth.getSession();
            if (!session) return null;
            
            const userId = session.user.id;
            
            // 2. Configurar nome do arquivo
            const fileExt = file.name.split('.').pop().toLowerCase();
            const fileName = `avatar_${personagemId}_${Date.now()}.${fileExt}`;
            const filePath = `avatars/${userId}/${fileName}`;

            // 3. Fazer upload
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

            // 4. Obter URL pública
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
    // PEGAR DADOS DO DASHBOARD (DIRETO DOS DISPLAYS)
    // ======================
    pegarDadosDashboard() {
        console.log('📊 Pegando dados do Dashboard...');
        
        const dados = {};
        
        try {
            // 1. DADOS BÁSICOS
            dados.nome = document.getElementById('charName')?.value || 'Novo Personagem';
            dados.raca = document.getElementById('racaPersonagem')?.value || '';
            dados.classe = document.getElementById('classePersonagem')?.value || '';
            dados.nivel = document.getElementById('nivelPersonagem')?.value || 'Nível 1';
            dados.descricao = document.getElementById('descricaoPersonagem')?.value || '';
            
            // 2. PONTOS (DIRETO DOS DISPLAYS VISÍVEIS)
            // Pontos totais do input
            const pontosTotaisInput = document.getElementById('pontosTotaisDashboard');
            if (pontosTotaisInput) {
                dados.pontos_totais = parseInt(pontosTotaisInput.value) || 150;
            } else {
                dados.pontos_totais = 150;
            }
            
            // Pontos gastos do display
            const pontosGastosElement = document.getElementById('pontosGastosDashboard');
            if (pontosGastosElement) {
                dados.pontos_gastos = parseInt(pontosGastosElement.textContent) || 0;
            } else {
                dados.pontos_gastos = 0;
            }
            
            // Saldo disponível do display
            const saldoElement = document.getElementById('saldoDisponivelDashboard');
            if (saldoElement) {
                dados.pontos_disponiveis = parseInt(saldoElement.textContent) || 150;
            } else {
                dados.pontos_disponiveis = 150;
            }
            
            // Limite de desvantagens
            const limiteDesvantagensInput = document.getElementById('limiteDesvantagens');
            if (limiteDesvantagensInput) {
                dados.limite_desvantagens = parseInt(limiteDesvantagensInput.value) || -50;
            } else {
                dados.limite_desvantagens = -50;
            }
            
            // Desvantagens atuais
            const desvantagensElement = document.getElementById('desvantagensAtuais');
            if (desvantagensElement) {
                dados.desvantagens_atuais = parseInt(desvantagensElement.textContent) || 0;
            } else {
                dados.desvantagens_atuais = 0;
            }
            
            console.log('✅ Pontos coletados do Dashboard:', {
                totais: dados.pontos_totais,
                gastos: dados.pontos_gastos,
                disponiveis: dados.pontos_disponiveis,
                desvantagens: dados.desvantagens_atuais
            });
            
        } catch (error) {
            console.error('Erro ao pegar dados do Dashboard:', error);
            // Valores padrão
            dados.pontos_totais = 150;
            dados.pontos_gastos = 0;
            dados.pontos_disponiveis = 150;
            dados.limite_desvantagens = -50;
            dados.desvantagens_atuais = 0;
        }
        
        return dados;
    }

    // ======================
    // PEGAR DADOS DOS ATRIBUTOS
    // ======================
    pegarDadosAtributos() {
        const dados = {};
        
        try {
            // Atributos principais
            dados.forca = parseInt(document.getElementById('ST')?.value) || 10;
            dados.destreza = parseInt(document.getElementById('DX')?.value) || 10;
            dados.inteligencia = parseInt(document.getElementById('IQ')?.value) || 10;
            dados.saude = parseInt(document.getElementById('HT')?.value) || 10;
            
            // Atributos secundários (se disponíveis)
            const pvTotal = document.getElementById('PVTotal');
            if (pvTotal) dados.pontos_vida = parseInt(pvTotal.textContent) || 10;
            
            const pfTotal = document.getElementById('PFTotal');
            if (pfTotal) dados.pontos_fadiga = parseInt(pfTotal.textContent) || 10;
            
            const vontadeTotal = document.getElementById('VontadeTotal');
            if (vontadeTotal) dados.vontade = parseInt(vontadeTotal.textContent) || 10;
            
            const percepcaoTotal = document.getElementById('PercepcaoTotal');
            if (percepcaoTotal) dados.percepcao = parseInt(percepcaoTotal.textContent) || 10;
            
            const deslocamentoTotal = document.getElementById('DeslocamentoTotal');
            if (deslocamentoTotal) dados.deslocamento = parseFloat(deslocamentoTotal.textContent) || 5.00;
            
        } catch (error) {
            console.error('Erro ao pegar atributos:', error);
            // Valores padrão
            dados.forca = 10;
            dados.destreza = 10;
            dados.inteligencia = 10;
            dados.saude = 10;
            dados.pontos_vida = 10;
            dados.pontos_fadiga = 10;
            dados.vontade = 10;
            dados.percepcao = 10;
            dados.deslocamento = 5.00;
        }
        
        return dados;
    }

    // ======================
    // PEGAR DADOS DAS CARACTERÍSTICAS
    // ======================
    pegarDadosCaracteristicas() {
        const dados = {};
        
        try {
            // Aparência
            const selectAparencia = document.getElementById('nivelAparencia');
            if (selectAparencia) {
                const texto = selectAparencia.options[selectAparencia.selectedIndex]?.text;
                dados.aparencia = texto?.split('[')[0]?.trim() || 'Comum';
                dados.custo_aparencia = parseInt(selectAparencia.value) || 0;
            }
            
            // Riqueza
            const selectRiqueza = document.getElementById('nivelRiqueza');
            if (selectRiqueza) {
                const texto = selectRiqueza.options[selectRiqueza.selectedIndex]?.text;
                dados.riqueza = texto?.split('[')[0]?.trim() || 'Média';
                dados.custo_riqueza = parseInt(selectRiqueza.value) || 0;
            }
            
            // Altura e peso
            dados.altura = parseFloat(document.getElementById('altura')?.value) || 1.70;
            dados.peso = parseFloat(document.getElementById('peso')?.value) || 70.00;
            
        } catch (error) {
            console.error('Erro ao pegar características:', error);
            // Valores padrão
            dados.aparencia = 'Comum';
            dados.custo_aparencia = 0;
            dados.riqueza = 'Média';
            dados.custo_riqueza = 0;
            dados.altura = 1.70;
            dados.peso = 70.00;
        }
        
        return dados;
    }

    // ======================
    // PEGAR DADOS DAS VANTAGENS/DESVANTAGENS
    // ======================
    pegarDadosVantagensDesvantagens() {
        const dados = {
            vantagens: '[]',
            desvantagens: '[]',
            peculiaridades: '[]',
            total_vantagens: 0,
            total_desvantagens: 0,
            total_peculiaridades: 0
        };
        
        try {
            // Verificar se existe algum display com pontos
            const totalVantagensElement = document.getElementById('total-vantagens');
            if (totalVantagensElement) {
                const texto = totalVantagensElement.textContent;
                const match = texto.match(/[+-]?\d+/);
                if (match) {
                    const valor = parseInt(match[0]);
                    if (valor > 0) dados.total_vantagens = valor;
                    if (valor < 0) dados.total_desvantagens = Math.abs(valor);
                }
            }
            
            // Peculiaridades
            const listaPeculiaridades = document.getElementById('lista-peculiaridades');
            if (listaPeculiaridades) {
                const itens = listaPeculiaridades.querySelectorAll('.peculiaridade-item');
                const peculiaridades = [];
                itens.forEach(item => {
                    const texto = item.querySelector('.peculiaridade-texto')?.textContent;
                    if (texto) peculiaridades.push(texto);
                });
                dados.total_peculiaridades = peculiaridades.length;
                dados.peculiaridades = JSON.stringify(peculiaridades);
            }
            
        } catch (error) {
            console.error('Erro ao pegar vantagens:', error);
        }
        
        return dados;
    }

    // ======================
    // PEGAR DADOS DAS PERÍCIAS
    // ======================
    pegarDadosPericias() {
        const dados = {
            pericias: '[]',
            tecnicas: '[]',
            total_pericias: 0,
            total_tecnicas: 0,
            pontos_pericias: 0,
            pontos_tecnicas: 0
        };
        
        try {
            // Pontos de perícias
            const pontosPericiasElement = document.getElementById('pontos-pericias-total');
            if (pontosPericiasElement) {
                const texto = pontosPericiasElement.textContent;
                const match = texto.match(/\d+/);
                if (match) dados.pontos_pericias = parseInt(match[0]) || 0;
            }
            
        } catch (error) {
            console.error('Erro ao pegar perícias:', error);
        }
        
        return dados;
    }

    // ======================
    // PEGAR DADOS DAS MAGIAS
    // ======================
    pegarDadosMagias() {
        const dados = {
            aptidao_magica: 0,
            mana_atual: 10,
            mana_base: 10,
            bonus_mana: 0,
            magias: '[]',
            total_magias: 0,
            pontos_magias: 0
        };
        
        try {
            // Status mágico
            const aptidaoInput = document.getElementById('aptidao-magica');
            if (aptidaoInput) dados.aptidao_magica = parseInt(aptidaoInput.value) || 0;
            
            const manaAtualInput = document.getElementById('mana-atual');
            if (manaAtualInput) dados.mana_atual = parseInt(manaAtualInput.value) || 10;
            
            const manaBaseElement = document.getElementById('mana-base');
            if (manaBaseElement) dados.mana_base = parseInt(manaBaseElement.textContent) || 10;
            
            const bonusManaInput = document.getElementById('bonus-mana');
            if (bonusManaInput) dados.bonus_mana = parseInt(bonusManaInput.value) || 0;
            
        } catch (error) {
            console.error('Erro ao pegar magias:', error);
        }
        
        return dados;
    }

    // ======================
    // COLETAR TODOS OS DADOS
    // ======================
    coletarTodosDados() {
        console.log('📦 Coletando todos os dados...');
        
        const dados = {
            // Dados serão combinados abaixo
        };
        
        // 1. Dashboard (INCLUINDO PONTOS)
        const dadosDashboard = this.pegarDadosDashboard();
        Object.assign(dados, dadosDashboard);
        
        // 2. Atributos
        const dadosAtributos = this.pegarDadosAtributos();
        Object.assign(dados, dadosAtributos);
        
        // 3. Características
        const dadosCaracteristicas = this.pegarDadosCaracteristicas();
        Object.assign(dados, dadosCaracteristicas);
        
        // 4. Vantagens/Desvantagens
        const dadosVantagens = this.pegarDadosVantagensDesvantagens();
        Object.assign(dados, dadosVantagens);
        
        // 5. Perícias
        const dadosPericias = this.pegarDadosPericias();
        Object.assign(dados, dadosPericias);
        
        // 6. Magias
        const dadosMagias = this.pegarDadosMagias();
        Object.assign(dados, dadosMagias);
        
        // 7. Campos obrigatórios
        dados.status = 'Ativo';
        dados.updated_at = new Date().toISOString();
        
        // 8. Log para debug
        console.log('✅ Dados coletados para salvar:', {
            nome: dados.nome,
            pontos: {
                totais: dados.pontos_totais,
                gastos: dados.pontos_gastos,
                disponiveis: dados.pontos_disponiveis
            },
            atributos: {
                forca: dados.forca,
                destreza: dados.destreza
            }
        });
        
        return dados;
    }

    // ======================
    // VALIDAÇÃO SIMPLES
    // ======================
    validarDados(dados) {
        // Nome é obrigatório
        if (!dados.nome || dados.nome.trim() === '') {
            alert('❌ Erro: O personagem precisa ter um nome!');
            return false;
        }
        
        // Verificar pontos (opcional, pode remover se quiser)
        if (dados.pontos_gastos > dados.pontos_totais) {
            if (!confirm(`⚠️ Atenção: Você gastou ${dados.pontos_gastos} pontos, mas tem apenas ${dados.pontos_totais} pontos totais.\n\nDeseja salvar mesmo assim?`)) {
                return false;
            }
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
            const { data: { session } } = await this.supabase.auth.getSession();
            if (!session) {
                alert('❌ Sua sessão expirou. Faça login novamente para salvar.');
                window.location.href = 'login.html';
                return false;
            }

            const userId = session.user.id;
            console.log('👤 Usuário autenticado:', session.user.email);

            // 2. MOSTRAR CARREGANDO
            const btnSalvar = document.getElementById('btnSalvar');
            const btnSalvarOriginal = btnSalvar?.innerHTML || '';
            if (btnSalvar) {
                btnSalvar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
                btnSalvar.disabled = true;
            }

            // 3. COLETAR TODOS OS DADOS
            const dados = this.coletarTodosDados();
            
            // 4. ADICIONAR user_id (CRÍTICO!)
            dados.user_id = userId;
            
            // 5. VALIDAR
            if (!this.validarDados(dados)) {
                if (btnSalvar) {
                    btnSalvar.innerHTML = btnSalvarOriginal;
                    btnSalvar.disabled = false;
                }
                return false;
            }

            let resultado;
            let personagemSalvoId = personagemId;

            // 6. GERENCIAR FOTO
            let fotoUrl = null;
            try {
                if (window.dashboard && typeof window.dashboard.getFotoParaSalvar === 'function') {
                    const fotoData = window.dashboard.getFotoParaSalvar();
                    if (fotoData && fotoData.file) {
                        console.log('🖼️ Foto encontrada para salvar');
                        // A foto será processada depois de salvar o personagem
                    }
                }
            } catch (error) {
                console.warn('⚠️ Erro ao verificar foto:', error);
            }

            // 7. SALVAR NO BANCO
            if (personagemId) {
                // MODO EDIÇÃO
                console.log('✏️ Editando personagem:', personagemId);
                
                // Remover campos que não devem ser atualizados
                delete dados.created_at;
                delete dados.user_id; // Manter o original
                
                const { data, error } = await this.supabase
                    .from('characters')
                    .update(dados)
                    .eq('id', personagemId)
                    .eq('user_id', userId)
                    .select();

                if (error) throw error;
                resultado = data;
                
            } else {
                // MODO CRIAÇÃO
                console.log('🆕 Criando novo personagem');
                
                // Adicionar campos de criação
                dados.created_at = new Date().toISOString();
                dados.status = 'Ativo';
                
                const { data, error } = await this.supabase
                    .from('characters')
                    .insert([dados])
                    .select();

                if (error) throw error;
                
                if (data && data[0]) {
                    personagemSalvoId = data[0].id;
                    console.log('✅ ID criado:', personagemSalvoId);
                    resultado = data;
                }
            }

            // 8. SALVAR FOTO (se houver e após salvar o personagem)
            if (personagemSalvoId) {
                try {
                    if (window.dashboard && typeof window.dashboard.getFotoParaSalvar === 'function') {
                        const fotoData = window.dashboard.getFotoParaSalvar();
                        if (fotoData && fotoData.file) {
                            console.log('📸 Salvando foto no Supabase...');
                            fotoUrl = await this.salvarFotoNoSupabase(fotoData.file, personagemSalvoId);
                            
                            if (fotoUrl) {
                                await this.supabase
                                    .from('characters')
                                    .update({ avatar_url: fotoUrl })
                                    .eq('id', personagemSalvoId);
                                console.log('✅ Foto salva:', fotoUrl);
                            }
                        }
                    }
                } catch (error) {
                    console.warn('⚠️ Erro ao salvar foto:', error);
                    // Não falha o salvamento se a foto der erro
                }
            }

            // 9. VERIFICAR RESULTADO
            if (!resultado) {
                throw new Error('Nenhum resultado retornado');
            }

            // 10. SUCESSO
            console.log('✅ Personagem salvo com sucesso!');
            
            // Restaurar botão
            if (btnSalvar) {
                btnSalvar.innerHTML = btnSalvarOriginal;
                btnSalvar.disabled = false;
            }
            
            const mensagem = personagemId 
                ? '✅ Personagem atualizado com sucesso!' 
                : '✅ Personagem criado com sucesso!';
            
            // Mostrar os pontos salvos na mensagem
            const pontosMsg = `\n\nPontos: ${dados.pontos_gastos}/${dados.pontos_totais} (Saldo: ${dados.pontos_disponiveis})`;
            
            alert(mensagem + pontosMsg + '\n\nRedirecionando para seus personagens...');
            
            setTimeout(() => {
                window.location.href = 'personagens.html';
            }, 2000);
            
            return true;

        } catch (error) {
            console.error('❌ Erro ao salvar:', error);
            
            // Restaurar botão
            const btnSalvar = document.getElementById('btnSalvar');
            if (btnSalvar) {
                btnSalvar.innerHTML = '<i class="fas fa-save"></i> Salvar';
                btnSalvar.disabled = false;
            }
            
            // Mostrar erro
            let mensagemErro = 'Erro ao salvar: ';
            
            if (error.message.includes('permission denied') || error.code === '42501') {
                mensagemErro = 'ERRO DE PERMISSÃO!\n\nVerifique se você está logado corretamente.';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                mensagemErro = '❌ Problema de conexão. Verifique sua internet.';
            } else if (error.message.includes('auth')) {
                mensagemErro = '🔐 Problema de autenticação. Faça login novamente.';
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else if (error.message.includes('duplicate key')) {
                mensagemErro = '⚠️ Este personagem já existe!';
            } else {
                mensagemErro += error.message;
            }
            
            alert(mensagemErro);
            return false;
        }
    }

    // ======================
    // CARREGAMENTO
    // ======================
    async carregarPersonagem(personagemId) {
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            if (!session) {
                alert('Você precisa estar logado para carregar personagens!');
                return null;
            }

            const { data: personagem, error } = await this.supabase
                .from('characters')
                .select('*')
                .eq('id', personagemId)
                .eq('user_id', session.user.id)
                .single();

            if (error) {
                console.error('Erro ao carregar:', error);
                return null;
            }

            console.log('✅ Personagem carregado:', personagem.nome);
            return personagem;

        } catch (error) {
            console.error('Erro ao carregar:', error);
            return null;
        }
    }

    // ======================
    // EXCLUSÃO
    // ======================
    async excluirPersonagem(personagemId) {
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            if (!session) {
                alert('Você precisa estar logado para excluir personagens!');
                return false;
            }

            if (!confirm('⚠️ Tem certeza que deseja excluir este personagem?\n\nEsta ação não pode ser desfeita!')) {
                return false;
            }

            const { error } = await this.supabase
                .from('characters')
                .delete()
                .eq('id', personagemId)
                .eq('user_id', session.user.id);

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

    // ======================
    // FUNÇÃO DE TESTE
    // ======================
    async testarConexao() {
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (!session) {
                return {
                    sucesso: false,
                    mensagem: '❌ Não autenticado'
                };
            }
            
            // Testar contagem
            const { count, error } = await this.supabase
                .from('characters')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', session.user.id);
            
            if (error) {
                return {
                    sucesso: false,
                    mensagem: '❌ Erro na consulta: ' + error.message
                };
            }
            
            return {
                sucesso: true,
                mensagem: `✅ Conexão OK! Personagens: ${count || 0}`
            };
            
        } catch (error) {
            return {
                sucesso: false,
                mensagem: '❌ Erro: ' + error.message
            };
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
    
    console.log('✅ Sistema de salvamento carregado com sucesso!');
    
} catch (error) {
    console.error('❌ Erro ao carregar salvamento:', error);
    
    // Fallback simples
    salvamento = {
        verificarLimitePersonagens: async () => ({ 
            podeCriar: true, 
            quantidade: 0, 
            limite: 10, 
            motivo: '' 
        }),
        salvarPersonagem: async () => {
            alert('Sistema de salvamento não disponível. Tente recarregar a página.');
            return false;
        },
        carregarPersonagem: async () => null,
        excluirPersonagem: async () => false
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
    
    const teste = await window.salvamento.testarConexao();
    
    if (teste.sucesso) {
        alert(teste.mensagem);
    } else {
        alert(teste.mensagem);
    }
};
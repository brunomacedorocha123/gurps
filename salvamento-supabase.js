// salvamento-supabase.js - VERSÃO COMPLETA E FUNCIONAL
class SalvamentoSupabase {
    constructor() {
        // Verificar Supabase
        if (!window.supabase) {
            console.error('❌ Supabase não carregado!');
            throw new Error('Supabase não está disponível');
        }
        
        this.supabase = window.supabase;
        this.limitePersonagens = 10;
        
        console.log('✅ Sistema de salvamento inicializado');
    }

    // ======================
    // VERIFICAÇÃO DE LIMITE
    // ======================
    async verificarLimitePersonagens() {
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (!session) {
                return {
                    podeCriar: false,
                    quantidade: 0,
                    limite: this.limitePersonagens,
                    motivo: 'Você precisa estar logado para criar personagens'
                };
            }
            
            const { count, error } = await this.supabase
                .from('characters')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', session.user.id);
            
            if (error) {
                console.error('Erro ao contar:', error);
                return {
                    podeCriar: true,
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
    // COLETAR DADOS DAS ABAS
    // ======================
    coletarDadosDasAbas() {
        const dados = {};
        
        console.log('🔍 Coletando dados de todas as abas...');
        
        try {
            // 1. DADOS DO DASHBOARD
            dados.nome = document.getElementById('charName')?.value || 'Novo Personagem';
            dados.raca = document.getElementById('racaPersonagem')?.value || '';
            dados.classe = document.getElementById('classePersonagem')?.value || '';
            dados.nivel = document.getElementById('nivelPersonagem')?.value || '';
            dados.descricao = document.getElementById('descricaoPersonagem')?.value || '';
            
            // 2. PONTOS DO SISTEMA
            const pontosTotais = document.getElementById('pontosTotaisDashboard');
            const pontosGastos = document.getElementById('pontosGastosDashboard');
            const saldoDisponivel = document.getElementById('saldoDisponivelDashboard');
            
            dados.pontos_totais = pontosTotais ? parseInt(pontosTotais.value) : 150;
            dados.pontos_gastos = pontosGastos ? parseInt(pontosGastos.textContent) : 0;
            dados.pontos_disponiveis = saldoDisponivel ? parseInt(saldoDisponivel.textContent) : 150;
            
            // 3. ATRIBUTOS
            dados.forca = parseInt(document.getElementById('ST')?.value) || 10;
            dados.destreza = parseInt(document.getElementById('DX')?.value) || 10;
            dados.inteligencia = parseInt(document.getElementById('IQ')?.value) || 10;
            dados.saude = parseInt(document.getElementById('HT')?.value) || 10;
            
            // 4. CARACTERÍSTICAS
            const selectAparencia = document.getElementById('nivelAparencia');
            if (selectAparencia) {
                dados.aparencia = selectAparencia.options[selectAparencia.selectedIndex]?.text.split('[')[0]?.trim() || 'Comum';
                dados.custo_aparencia = parseInt(selectAparencia.value) || 0;
            }
            
            const selectRiqueza = document.getElementById('nivelRiqueza');
            if (selectRiqueza) {
                dados.riqueza = selectRiqueza.options[selectRiqueza.selectedIndex]?.text.split('[')[0]?.trim() || 'Média';
                dados.custo_riqueza = parseInt(selectRiqueza.value) || 0;
            }
            
            dados.altura = parseFloat(document.getElementById('altura')?.value) || 1.70;
            dados.peso = parseFloat(document.getElementById('peso')?.value) || 70.00;
            
            // 5. VANTAGENS/DESVANTAGENS (usando o coletor se disponível)
            if (window.coletor && typeof window.coletor._coletarVantagens === 'function') {
                console.log('📌 Usando coletor de dados...');
                dados.vantagens = JSON.stringify(window.coletor._coletarVantagens());
                dados.desvantagens = JSON.stringify(window.coletor._coletarDesvantagens());
                dados.peculiaridades = JSON.stringify(window.coletor._coletarPeculiaridades());
                dados.total_vantagens = window.coletor._coletarVantagens().length;
                dados.total_desvantagens = window.coletor._coletarDesvantagens().length;
                dados.total_peculiaridades = window.coletor._coletarPeculiaridades().length;
            } else {
                // Fallback manual
                dados.vantagens = this._coletarVantagensManual();
                dados.desvantagens = this._coletarDesvantagensManual();
                dados.peculiaridades = this._coletarPeculiaridadesManual();
                dados.total_vantagens = JSON.parse(dados.vantagens).length;
                dados.total_desvantagens = JSON.parse(dados.desvantagens).length;
                dados.total_peculiaridades = JSON.parse(dados.peculiaridades).length;
            }
            
            // 6. PERÍCIAS
            if (window.coletor && typeof window.coletor._coletarPericias === 'function') {
                dados.pericias = JSON.stringify(window.coletor._coletarPericias());
                dados.total_pericias = window.coletor._coletarPericias().length;
                
                // Calcular pontos de perícias
                const periciasArray = window.coletor._coletarPericias();
                dados.pontos_pericias = periciasArray.reduce((total, p) => total + (p.pontos || 0), 0);
            } else {
                dados.pericias = '[]';
                dados.total_pericias = 0;
                dados.pontos_pericias = 0;
            }
            
            // 7. MAGIAS
            if (window.coletor && typeof window.coletor._coletarMagias === 'function') {
                dados.magias = JSON.stringify(window.coletor._coletarMagias());
                dados.total_magias = window.coletor._coletarMagias().length;
                
                const magiasArray = window.coletor._coletarMagias();
                dados.pontos_magias = magiasArray.reduce((total, m) => total + (m.pontos || 0), 0);
            } else {
                dados.magias = '[]';
                dados.total_magias = 0;
                dados.pontos_magias = 0;
            }
            
            // Status mágico
            dados.aptidao_magica = parseInt(document.getElementById('aptidao-magica')?.value) || 0;
            dados.mana_atual = parseInt(document.getElementById('mana-atual')?.value) || 10;
            dados.mana_base = parseInt(document.getElementById('mana-base')?.textContent) || 10;
            dados.bonus_mana = parseInt(document.getElementById('bonus-mana')?.value) || 0;
            
            // 8. EQUIPAMENTOS
            if (window.coletor && typeof window.coletor._coletarEquipamentos === 'function') {
                dados.equipamentos = JSON.stringify(window.coletor._coletarEquipamentos());
            } else {
                dados.equipamentos = '[]';
            }
            
            dados.dinheiro = this._obterDinheiro();
            
            // 9. COMBATE
            dados.pv_atual = parseInt(document.getElementById('pvAtualDisplay')?.value) || 10;
            dados.pv_maximo = parseInt(document.getElementById('pvMaxDisplay')?.textContent) || 10;
            dados.pf_atual = parseInt(document.getElementById('pfAtualDisplay')?.value) || 10;
            dados.pf_maximo = parseInt(document.getElementById('pfMaxDisplay')?.textContent) || 10;
            
            // 10. STATUS E DATAS
            dados.status = 'Ativo';
            dados.updated_at = new Date().toISOString();
            
            console.log('✅ Dados coletados:', {
                nome: dados.nome,
                vantagens: dados.total_vantagens,
                desvantagens: dados.total_desvantagens,
                pericias: dados.total_pericias,
                magias: dados.total_magias
            });
            
            return dados;
            
        } catch (error) {
            console.error('❌ Erro ao coletar dados:', error);
            
            // Retornar dados mínimos em caso de erro
            return {
                nome: document.getElementById('charName')?.value || 'Novo Personagem',
                forca: 10,
                destreza: 10,
                inteligencia: 10,
                saude: 10,
                pontos_totais: 150,
                pontos_gastos: 0,
                status: 'Ativo',
                updated_at: new Date().toISOString()
            };
        }
    }

    // ======================
    // MÉTODOS MANUAIS (FALLBACK)
    // ======================
    _coletarVantagensManual() {
        try {
            const lista = document.getElementById('vantagens-adquiridas');
            if (!lista) return '[]';
            
            const itens = lista.querySelectorAll('.item-adquirido, [data-vantagem-id]');
            const vantagens = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.nome-vantagem, .nome-item')?.textContent?.trim();
                if (nome && nome !== 'Nenhuma vantagem adquirida') {
                    vantagens.push({
                        nome: nome,
                        pontos: parseInt(item.getAttribute('data-pontos')) || 0
                    });
                }
            });
            
            return JSON.stringify(vantagens);
        } catch (error) {
            return '[]';
        }
    }

    _coletarDesvantagensManual() {
        try {
            const lista = document.getElementById('desvantagens-adquiridas');
            if (!lista) return '[]';
            
            const itens = lista.querySelectorAll('.item-adquirido, [data-desvantagem-id]');
            const desvantagens = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.nome-desvantagem, .nome-item')?.textContent?.trim();
                if (nome && nome !== 'Nenhuma desvantagem adquirida') {
                    desvantagens.push({
                        nome: nome,
                        pontos: parseInt(item.getAttribute('data-pontos')) || 0
                    });
                }
            });
            
            return JSON.stringify(desvantagens);
        } catch (error) {
            return '[]';
        }
    }

    _coletarPeculiaridadesManual() {
        try {
            const lista = document.getElementById('lista-peculiaridades');
            if (!lista) return '[]';
            
            const itens = lista.querySelectorAll('.peculiaridade-item');
            const peculiaridades = [];
            
            itens.forEach(item => {
                const texto = item.querySelector('.peculiaridade-texto')?.textContent?.trim();
                if (texto && texto !== 'Nenhuma peculiaridade adicionada') {
                    peculiaridades.push(texto);
                }
            });
            
            return JSON.stringify(peculiaridades);
        } catch (error) {
            return '[]';
        }
    }

    _obterDinheiro() {
        try {
            const elemento = document.getElementById('dinheiroEquipamento') || 
                            document.getElementById('dinheiro-disponivel');
            if (!elemento) return 2000;
            
            const texto = elemento.textContent || elemento.value || '$2000';
            const numero = texto.replace(/[^0-9]/g, '');
            return parseInt(numero) || 2000;
        } catch (error) {
            return 2000;
        }
    }

    // ======================
    // VALIDAÇÃO
    // ======================
    validarDados(dados) {
        if (!dados.nome || dados.nome.trim() === '') {
            alert('❌ O personagem precisa ter um nome!');
            return false;
        }
        
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
            console.log('💾💾💾 INICIANDO SALVAMENTO COMPLETO 💾💾💾');
            
            // 1. VERIFICAR AUTENTICAÇÃO
            const { data: { session } } = await this.supabase.auth.getSession();
            if (!session) {
                alert('❌ Sua sessão expirou. Faça login novamente para salvar.');
                window.location.href = 'login.html';
                return false;
            }

            const userId = session.user.id;
            console.log('👤 Usuário:', session.user.email);

            // 2. MOSTRAR CARREGANDO
            const btnSalvar = document.getElementById('btnSalvar');
            const btnSalvarOriginal = btnSalvar?.innerHTML || '';
            if (btnSalvar) {
                btnSalvar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
                btnSalvar.disabled = true;
            }

            // 3. COLETAR TODOS OS DADOS
            console.log('🔍 Coletando dados...');
            const dados = this.coletarDadosDasAbas();
            
            // 4. ADICIONAR user_id
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

            // 6. SALVAR NO BANCO
            if (personagemId) {
                // MODO EDIÇÃO
                console.log('✏️ Editando personagem:', personagemId);
                
                // Remover campos que não devem ser atualizados
                delete dados.created_at;
                delete dados.user_id;
                
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
                
                dados.created_at = new Date().toISOString();
                dados.status = 'Ativo';
                
                const { data, error } = await this.supabase
                    .from('characters')
                    .insert([dados])
                    .select();

                if (error) throw error;
                
                if (data && data[0]) {
                    personagemSalvoId = data[0].id;
                    resultado = data;
                    console.log('✅ ID criado:', personagemSalvoId);
                }
            }

            // 7. SALVAR FOTO (se houver)
            if (personagemSalvoId) {
                try {
                    if (window.dashboard && typeof window.dashboard.getFotoParaSalvar === 'function') {
                        const fotoData = window.dashboard.getFotoParaSalvar();
                        if (fotoData && fotoData.file) {
                            console.log('📸 Salvando foto...');
                            const fotoUrl = await this.salvarFotoNoSupabase(fotoData.file, personagemSalvoId);
                            
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
                    console.warn('⚠️ Foto não salva (continuando):', error);
                }
            }

            // 8. SUCESSO
            console.log('✅✅✅ SALVAMENTO CONCLUÍDO COM SUCESSO! ✅✅✅');
            
            // Restaurar botão
            if (btnSalvar) {
                btnSalvar.innerHTML = btnSalvarOriginal;
                btnSalvar.disabled = false;
            }
            
            // Mensagem de sucesso
            const mensagem = personagemId 
                ? '✅ Personagem ATUALIZADO com sucesso!\n\n' 
                : '✅ Personagem CRIADO com sucesso!\n\n';
            
            const resumo = `📊 RESUMO SALVO:
• Nome: ${dados.nome}
• Pontos: ${dados.pontos_gastos || 0}/${dados.pontos_totais || 150}
• Vantagens: ${dados.total_vantagens || 0}
• Desvantagens: ${dados.total_desvantagens || 0}
• Perícias: ${dados.total_pericias || 0}
• Magias: ${dados.total_magias || 0}

✅ Todos os dados foram salvos!`;
            
            alert(mensagem + resumo + '\n\nRedirecionando para seus personagens...');
            
            setTimeout(() => {
                window.location.href = 'personagens.html';
            }, 3000);
            
            return true;

        } catch (error) {
            console.error('❌❌❌ ERRO NO SALVAMENTO:', error);
            
            // Restaurar botão
            const btnSalvar = document.getElementById('btnSalvar');
            if (btnSalvar) {
                btnSalvar.innerHTML = '<i class="fas fa-save"></i> Salvar';
                btnSalvar.disabled = false;
            }
            
            // Mostrar erro
            let mensagemErro = '❌ Erro ao salvar:\n\n';
            
            if (error.message.includes('permission denied')) {
                mensagemErro += 'ERRO DE PERMISSÃO!\nVerifique se está logado.';
            } else if (error.message.includes('network')) {
                mensagemErro += 'SEM CONEXÃO!\nVerifique sua internet.';
            } else if (error.message.includes('auth')) {
                mensagemErro += 'SESSÃO EXPIRADA!\nFaça login novamente.';
                setTimeout(() => window.location.href = 'login.html', 2000);
            } else {
                mensagemErro += error.message;
            }
            
            alert(mensagemErro);
            return false;
        }
    }

    // ======================
    // FOTO NO SUPABASE
    // ======================
    async salvarFotoNoSupabase(file, personagemId) {
        if (!file || !personagemId) return null;

        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            if (!session) return null;
            
            const userId = session.user.id;
            const fileExt = file.name.split('.').pop().toLowerCase();
            const fileName = `avatar_${personagemId}_${Date.now()}.${fileExt}`;
            const filePath = `avatars/${userId}/${fileName}`;

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
    // CARREGAR PERSONAGEM
    // ======================
    async carregarPersonagem(personagemId) {
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            if (!session) {
                alert('Você precisa estar logado!');
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
    // EXCLUIR PERSONAGEM
    // ======================
    async excluirPersonagem(personagemId) {
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            if (!session) {
                alert('Você precisa estar logado!');
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
                alert('Erro ao excluir: ' + error.message);
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
    // TESTE DE CONEXÃO
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
    
    console.log('✅ Sistema de salvamento COMPLETO carregado!');
    
    // Adicionar função de teste
    window.testeSalvamentoCompleto = async function() {
        console.log('🧪 TESTANDO SALVAMENTO COMPLETO');
        
        if (!window.salvamento) {
            alert('Sistema não carregado!');
            return;
        }
        
        const teste = await window.salvamento.testarConexao();
        
        if (teste.sucesso) {
            alert(teste.mensagem + '\n\nSistema pronto para salvar!');
        } else {
            alert(teste.mensagem);
        }
    };
    
} catch (error) {
    console.error('❌ Erro ao carregar salvamento:', error);
    
    // Fallback
    salvamento = {
        salvarPersonagem: async () => {
            alert('Sistema de salvamento não disponível. Recarregue a página.');
            return false;
        }
    };
    
    window.salvamento = salvamento;
}
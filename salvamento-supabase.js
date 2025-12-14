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
    // COLETA DE DADOS COMPLETA
    // ======================
    coletarTodosDados() {
        // OBJETO PRINCIPAL PARA SALVAR
        const dados = {
            // Dados serão coletados abaixo
        };

        // ========== DASHBOARD ==========
        this.coletarDadosDashboard(dados);
        
        // ========== ATRIBUTOS ==========
        this.coletarDadosAtributos(dados);
        
        // ========== CARACTERÍSTICAS ==========
        this.coletarDadosCaracteristicas(dados);
        
        // ========== VANTAGENS ==========
        this.coletarDadosVantagens(dados);
        
        // ========== PERÍCIAS ==========
        this.coletarDadosPericias(dados);
        
        // ========== MAGIAS ==========
        this.coletarDadosMagias(dados);
        
        // ========== EQUIPAMENTO ==========
        this.coletarDadosEquipamento(dados);
        
        // ========== COMBATE ==========
        this.coletarDadosCombate(dados);

        // Timestamp
        dados.updated_at = new Date().toISOString();
        
        return dados;
    }

    // ========== DASHBOARD ==========
    coletarDadosDashboard(dados) {
        // Dados básicos
        dados.nome = document.getElementById('charName')?.value || 'Novo Personagem';
        dados.raca = document.getElementById('racaPersonagem')?.value || '';
        dados.classe = document.getElementById('classePersonagem')?.value || '';
        dados.nivel = document.getElementById('nivelPersonagem')?.value || 'Nível 1';
        dados.descricao = document.getElementById('descricaoPersonagem')?.value || '';
        dados.status = 'Ativo';
        
        // Pontos do dashboard
        dados.pontos_totais = parseInt(document.getElementById('pontosTotaisDashboard')?.value) || 150;
        dados.limite_desvantagens = parseInt(document.getElementById('limiteDesvantagens')?.value) || -50;
        dados.desvantagens_atuais = parseInt(document.getElementById('desvantagensAtuais')?.textContent) || 0;
    }

    // ========== ATRIBUTOS ==========
    coletarDadosAtributos(dados) {
        // Atributos principais
        dados.forca = parseInt(document.getElementById('ST')?.value) || 10;
        dados.destreza = parseInt(document.getElementById('DX')?.value) || 10;
        dados.inteligencia = parseInt(document.getElementById('IQ')?.value) || 10;
        dados.saude = parseInt(document.getElementById('HT')?.value) || 10;
        
        // Atributos secundários
        dados.pontos_vida = parseInt(document.getElementById('PVTotal')?.textContent) || 10;
        dados.bonus_pv = parseInt(document.getElementById('bonusPV')?.value) || 0;
        dados.pontos_fadiga = parseInt(document.getElementById('PFTotal')?.textContent) || 10;
        dados.bonus_pf = parseInt(document.getElementById('bonusPF')?.value) || 0;
        dados.vontade = parseInt(document.getElementById('VontadeTotal')?.textContent) || 10;
        dados.bonus_vontade = parseInt(document.getElementById('bonusVontade')?.value) || 0;
        dados.percepcao = parseInt(document.getElementById('PercepcaoTotal')?.textContent) || 10;
        dados.bonus_percepcao = parseInt(document.getElementById('bonusPercepcao')?.value) || 0;
        dados.deslocamento = parseFloat(document.getElementById('DeslocamentoTotal')?.textContent) || 5.00;
        dados.bonus_deslocamento = parseFloat(document.getElementById('bonusDeslocamento')?.value) || 0;
        
        // Dano
        dados.dano_gdp = document.getElementById('danoGDP')?.textContent || '1d-2';
        dados.dano_geb = document.getElementById('danoGEB')?.textContent || '1d';
        
        // Carga
        dados.carga_nenhuma = parseFloat(document.getElementById('cargaNenhuma')?.textContent) || 10.00;
        dados.carga_leve = parseFloat(document.getElementById('cargaLeve')?.textContent) || 20.00;
        dados.carga_media = parseFloat(document.getElementById('cargaMedia')?.textContent) || 30.00;
        dados.carga_pesada = parseFloat(document.getElementById('cargaPesada')?.textContent) || 60.00;
        dados.carga_muito_pesada = parseFloat(document.getElementById('cargaMuitoPesada')?.textContent) || 100.00;
    }

    // ========== CARACTERÍSTICAS ==========
    coletarDadosCaracteristicas(dados) {
        // Aparência
        const selectAparencia = document.getElementById('nivelAparencia');
        if (selectAparencia) {
            dados.aparencia = selectAparencia.options[selectAparencia.selectedIndex]?.text.split('[')[0]?.trim() || 'Comum';
            dados.custo_aparencia = parseInt(selectAparencia.value) || 0;
        }
        
        // Riqueza
        const selectRiqueza = document.getElementById('nivelRiqueza');
        if (selectRiqueza) {
            dados.riqueza = selectRiqueza.options[selectRiqueza.selectedIndex]?.text.split('[')[0]?.trim() || 'Média';
            dados.custo_riqueza = parseInt(selectRiqueza.value) || 0;
            dados.renda_mensal = document.getElementById('rendaMensal')?.textContent || '$1.000';
        }
        
        // Altura e peso
        dados.altura = parseFloat(document.getElementById('altura')?.value) || 1.70;
        dados.peso = parseFloat(document.getElementById('peso')?.value) || 70.00;
        
        // Idiomas (em JSON)
        try {
            const idiomas = [];
            // Idioma materno
            const idiomaMaterno = document.getElementById('idiomaMaternoNome')?.value;
            if (idiomaMaterno) {
                idiomas.push({
                    nome: idiomaMaterno,
                    fala: 'Nativo',
                    escrita: 'Nativo',
                    custo: 0
                });
            }
            
            // Idiomas adicionais
            const listaIdiomas = document.getElementById('listaIdiomasAdicionais');
            if (listaIdiomas) {
                const itens = listaIdiomas.querySelectorAll('.idioma-item');
                itens.forEach(item => {
                    const nome = item.querySelector('.idioma-nome')?.textContent;
                    const fala = item.querySelector('.idioma-fala')?.textContent;
                    const escrita = item.querySelector('.idioma-escrita')?.textContent;
                    const custo = parseInt(item.querySelector('.idioma-custo')?.textContent) || 0;
                    
                    if (nome) {
                        idiomas.push({
                            nome,
                            fala: fala || '',
                            escrita: escrita || '',
                            custo
                        });
                    }
                });
            }
            
            dados.idiomas = JSON.stringify(idiomas);
        } catch (error) {
            console.warn('Erro ao coletar idiomas:', error);
            dados.idiomas = '[]';
        }
        
        // Características físicas (em JSON)
        try {
            const caracteristicas = [];
            const selecionadas = document.getElementById('caracteristicasSelecionadas');
            if (selecionadas) {
                const itens = selecionadas.querySelectorAll('.caracteristica-selecionada');
                itens.forEach(item => {
                    const nome = item.querySelector('.caracteristica-nome')?.textContent;
                    const custo = parseInt(item.querySelector('.caracteristica-custo')?.textContent) || 0;
                    
                    if (nome) {
                        caracteristicas.push({
                            nome,
                            custo
                        });
                    }
                });
            }
            
            dados.caracteristicas_fisicas = JSON.stringify(caracteristicas);
        } catch (error) {
            console.warn('Erro ao coletar características físicas:', error);
            dados.caracteristicas_fisicas = '[]';
        }
    }

    // ========== VANTAGENS ==========
    coletarDadosVantagens(dados) {
        try {
            // Vantagens adquiridas
            const vantagens = [];
            const listaVantagens = document.getElementById('vantagens-adquiridas');
            if (listaVantagens) {
                const itens = listaVantagens.querySelectorAll('.vantagem-adquirida');
                itens.forEach(item => {
                    const nome = item.querySelector('.vantagem-nome')?.textContent;
                    const custo = parseInt(item.querySelector('.vantagem-custo')?.textContent) || 0;
                    
                    if (nome) {
                        vantagens.push({
                            nome,
                            custo
                        });
                    }
                });
            }
            
            dados.vantagens = JSON.stringify(vantagens);
            dados.total_vantagens = vantagens.reduce((sum, v) => sum + (v.custo > 0 ? v.custo : 0), 0);
            
            // Desvantagens adquiridas
            const desvantagens = [];
            const listaDesvantagens = document.getElementById('desvantagens-adquiridas');
            if (listaDesvantagens) {
                const itens = listaDesvantagens.querySelectorAll('.desvantagem-adquirida');
                itens.forEach(item => {
                    const nome = item.querySelector('.desvantagem-nome')?.textContent;
                    const custo = parseInt(item.querySelector('.desvantagem-custo')?.textContent) || 0;
                    
                    if (nome) {
                        desvantagens.push({
                            nome,
                            custo: Math.abs(custo) // Armazenar como positivo
                        });
                    }
                });
            }
            
            dados.desvantagens = JSON.stringify(desvantagens);
            dados.total_desvantagens = desvantagens.reduce((sum, d) => sum + d.custo, 0);
            
            // Peculiaridades
            const peculiaridades = [];
            const listaPeculiaridades = document.getElementById('lista-peculiaridades');
            if (listaPeculiaridades) {
                const itens = listaPeculiaridades.querySelectorAll('.peculiaridade-item');
                itens.forEach(item => {
                    const texto = item.querySelector('.peculiaridade-texto')?.textContent;
                    if (texto) {
                        peculiaridades.push(texto);
                    }
                });
            }
            
            dados.peculiaridades = JSON.stringify(peculiaridades);
            dados.total_peculiaridades = peculiaridades.length;
            
        } catch (error) {
            console.warn('Erro ao coletar vantagens:', error);
            dados.vantagens = '[]';
            dados.desvantagens = '[]';
            dados.peculiaridades = '[]';
            dados.total_vantagens = 0;
            dados.total_desvantagens = 0;
            dados.total_peculiaridades = 0;
        }
    }

    // ========== PERÍCIAS ==========
    coletarDadosPericias(dados) {
        try {
            // Perícias aprendidas
            const pericias = [];
            const listaPericias = document.getElementById('pericias-aprendidas');
            if (listaPericias) {
                const itens = listaPericias.querySelectorAll('.pericia-adquirida');
                itens.forEach(item => {
                    const nome = item.querySelector('.pericia-nome')?.textContent;
                    const nivel = parseInt(item.querySelector('.pericia-nivel')?.textContent) || 0;
                    const custo = parseInt(item.querySelector('.pericia-custo')?.textContent) || 0;
                    
                    if (nome) {
                        pericias.push({
                            nome,
                            nivel,
                            custo
                        });
                    }
                });
            }
            
            dados.pericias = JSON.stringify(pericias);
            dados.total_pericias = pericias.length;
            dados.pontos_pericias = pericias.reduce((sum, p) => sum + p.custo, 0);
            
            // Técnicas aprendidas
            const tecnicas = [];
            const listaTecnicas = document.getElementById('tecnicas-aprendidas');
            if (listaTecnicas) {
                const itens = listaTecnicas.querySelectorAll('.tecnica-adquirida');
                itens.forEach(item => {
                    const nome = item.querySelector('.tecnica-nome')?.textContent;
                    const nivel = parseInt(item.querySelector('.tecnica-nivel')?.textContent) || 0;
                    const custo = parseInt(item.querySelector('.tecnica-custo')?.textContent) || 0;
                    
                    if (nome) {
                        tecnicas.push({
                            nome,
                            nivel,
                            custo
                        });
                    }
                });
            }
            
            dados.tecnicas = JSON.stringify(tecnicas);
            dados.total_tecnicas = tecnicas.length;
            dados.pontos_tecnicas = tecnicas.reduce((sum, t) => sum + t.custo, 0);
            
        } catch (error) {
            console.warn('Erro ao coletar perícias:', error);
            dados.pericias = '[]';
            dados.tecnicas = '[]';
            dados.total_pericias = 0;
            dados.total_tecnicas = 0;
            dados.pontos_pericias = 0;
            dados.pontos_tecnicas = 0;
        }
    }

    // ========== MAGIAS ==========
    coletarDadosMagias(dados) {
        try {
            // Status mágico
            dados.aptidao_magica = parseInt(document.getElementById('aptidao-magica')?.value) || 0;
            dados.mana_atual = parseInt(document.getElementById('mana-atual')?.value) || 10;
            dados.mana_base = parseInt(document.getElementById('mana-base')?.textContent) || 10;
            dados.bonus_mana = parseInt(document.getElementById('bonus-mana')?.value) || 0;
            
            // Magias aprendidas
            const magias = [];
            const listaMagias = document.getElementById('magias-aprendidas');
            if (listaMagias) {
                const itens = listaMagias.querySelectorAll('.magia-adquirida');
                itens.forEach(item => {
                    const nome = item.querySelector('.magia-nome')?.textContent;
                    const nivel = parseInt(item.querySelector('.magia-nivel')?.textContent) || 0;
                    const custo = parseInt(item.querySelector('.magia-custo')?.textContent) || 0;
                    
                    if (nome) {
                        magias.push({
                            nome,
                            nivel,
                            custo
                        });
                    }
                });
            }
            
            dados.magias = JSON.stringify(magias);
            dados.total_magias = magias.length;
            dados.pontos_magias = magias.reduce((sum, m) => sum + m.custo, 0);
            
        } catch (error) {
            console.warn('Erro ao coletar magias:', error);
            dados.aptidao_magica = 0;
            dados.mana_atual = 10;
            dados.mana_base = 10;
            dados.bonus_mana = 0;
            dados.magias = '[]';
            dados.total_magias = 0;
            dados.pontos_magias = 0;
        }
    }

    // ========== EQUIPAMENTO ==========
    coletarDadosEquipamento(dados) {
        try {
            // Status de equipamento
            dados.dinheiro = parseFloat(document.getElementById('dinheiroEquipamento')?.textContent.replace('$', '').replace('.', '')) || 2000.00;
            dados.peso_atual = parseFloat(document.getElementById('pesoAtual')?.textContent) || 0.00;
            dados.peso_maximo = parseFloat(document.getElementById('pesoMaximo')?.textContent) || 60.00;
            dados.nivel_carga = document.getElementById('nivelCarga')?.textContent || 'LEVE';
            dados.penalidades_carga = document.getElementById('penalidadesCarga')?.textContent || 'MOV +0 / DODGE +0';
            
            // Equipamentos adquiridos (inventário)
            const inventario = [];
            const listaInventario = document.getElementById('lista-equipamentos-adquiridos');
            if (listaInventario) {
                const itens = listaInventario.querySelectorAll('.equipamento-item');
                itens.forEach(item => {
                    const nome = item.querySelector('.equipamento-nome')?.textContent;
                    const quantidade = parseInt(item.querySelector('.equipamento-quantidade')?.textContent) || 1;
                    const peso = parseFloat(item.querySelector('.equipamento-peso')?.textContent) || 0;
                    const custo = parseFloat(item.querySelector('.equipamento-custo')?.textContent.replace('$', '')) || 0;
                    const equipado = item.classList.contains('equipado') || false;
                    
                    if (nome) {
                        inventario.push({
                            nome,
                            quantidade,
                            peso,
                            custo,
                            equipado
                        });
                    }
                });
            }
            
            dados.inventario = JSON.stringify(inventario);
            
        } catch (error) {
            console.warn('Erro ao coletar equipamento:', error);
            dados.dinheiro = 2000.00;
            dados.peso_atual = 0.00;
            dados.peso_maximo = 60.00;
            dados.nivel_carga = 'LEVE';
            dados.penalidades_carga = 'MOV +0 / DODGE +0';
            dados.inventario = '[]';
        }
    }

    // ========== COMBATE ==========
    coletarDadosCombate(dados) {
        try {
            // PV e PF
            dados.pv_atual = parseInt(document.getElementById('pvAtualDisplay')?.value) || 10;
            dados.pv_maximo = parseInt(document.getElementById('pvMaxDisplay')?.textContent) || 10;
            dados.pv_modificador = parseInt(document.getElementById('pvModificador')?.value) || 0;
            dados.pv_estado = document.getElementById('pvEstadoDisplay')?.textContent || 'Saudável';
            
            dados.pf_atual = parseInt(document.getElementById('pfAtualDisplay')?.value) || 10;
            dados.pf_maximo = parseInt(document.getElementById('pfMaxDisplay')?.textContent) || 10;
            dados.pf_modificador = parseInt(document.getElementById('pfModificador')?.value) || 0;
            dados.pf_estado = document.getElementById('pfEstadoDisplay')?.textContent || 'Normal';
            
            // Defesas
            dados.esquiva = parseInt(document.getElementById('esquivaTotal')?.textContent) || 10;
            dados.esquiva_mod = parseInt(document.getElementById('esquivaMod')?.value) || 0;
            dados.bloqueio = parseInt(document.getElementById('bloqueioTotal')?.textContent) || 11;
            dados.bloqueio_mod = parseInt(document.getElementById('bloqueioMod')?.value) || 0;
            dados.aparar = parseInt(document.getElementById('apararTotal')?.textContent) || 3;
            dados.aparar_mod = parseInt(document.getElementById('apararMod')?.value) || 0;
            
            // Bônus de defesa
            dados.bonus_reflexos = parseInt(document.getElementById('bonusReflexos')?.value) || 0;
            dados.bonus_escudo = parseInt(document.getElementById('bonusEscudo')?.value) || 0;
            dados.bonus_capa = parseInt(document.getElementById('bonusCapa')?.value) || 0;
            dados.bonus_outros = parseInt(document.getElementById('bonusOutros')?.value) || 0;
            
            // RD (Resistência a Dano)
            const rdCampos = ['cabeca', 'tronco', 'rosto', 'cranio', 'pescoco', 'virilha', 'bracos', 'pernas', 'maos', 'pes'];
            rdCampos.forEach(campo => {
                dados[`rd_${campo}`] = parseInt(document.querySelector(`.rd-parte[data-parte="${campo}"] input`)?.value) || 0;
            });
            dados.rd_total = parseInt(document.getElementById('rdTotal')?.textContent) || 0;
            
            // Escudo
            dados.escudo_equipado = document.getElementById('escudoStatus')?.textContent === 'Ativo' || false;
            dados.escudo_nome = document.getElementById('escudoNome')?.textContent || '';
            dados.escudo_dr = parseInt(document.getElementById('escudoDR')?.textContent) || 0;
            dados.escudo_pv_atual = parseInt(document.getElementById('escudoPVTexto')?.textContent.split('/')[0]) || 0;
            dados.escudo_pv_maximo = parseInt(document.getElementById('escudoPVTexto')?.textContent.split('/')[1]) || 0;
            
            // Condições ativas
            const condicoesAtivas = [];
            const condicoesItems = document.querySelectorAll('.condicao-item.ativa');
            condicoesItems.forEach(item => {
                const condicao = item.getAttribute('data-condicao');
                if (condicao) {
                    condicoesAtivas.push(condicao);
                }
            });
            
            dados.condicoes = JSON.stringify(condicoesAtivas);
            dados.condicoes_ativas = condicoesAtivas.length;
            
        } catch (error) {
            console.warn('Erro ao coletar dados de combate:', error);
            // Valores padrão
            dados.pv_atual = 10;
            dados.pv_maximo = 10;
            dados.pv_modificador = 0;
            dados.pv_estado = 'Saudável';
            
            dados.pf_atual = 10;
            dados.pf_maximo = 10;
            dados.pf_modificador = 0;
            dados.pf_estado = 'Normal';
            
            dados.esquiva = 10;
            dados.esquiva_mod = 0;
            dados.bloqueio = 11;
            dados.bloqueio_mod = 0;
            dados.aparar = 3;
            dados.aparar_mod = 0;
            
            dados.bonus_reflexos = 0;
            dados.bonus_escudo = 0;
            dados.bonus_capa = 0;
            dados.bonus_outros = 0;
            
            // RD
            const rdCampos = ['cabeca', 'tronco', 'rosto', 'cranio', 'pescoco', 'virilha', 'bracos', 'pernas', 'maos', 'pes'];
            rdCampos.forEach(campo => {
                dados[`rd_${campo}`] = 0;
            });
            dados.rd_total = 0;
            
            dados.escudo_equipado = false;
            dados.escudo_nome = '';
            dados.escudo_dr = 0;
            dados.escudo_pv_atual = 0;
            dados.escudo_pv_maximo = 0;
            
            dados.condicoes = '[]';
            dados.condicoes_ativas = 0;
        }
    }

    // ======================
    // VALIDAÇÃO
    // ======================
    validarPontos(dados) {
        // Validação básica de pontos
        if (window.sistemaPontos) {
            const pontos = window.sistemaPontos.pontos;
            
            if (pontos.gastos > pontos.totais) {
                alert(`Erro: Você gastou ${pontos.gastos} pontos, mas tem apenas ${pontos.totais} pontos totais!`);
                return false;
            }
            
            if (pontos.desvantagensAtuais < pontos.limiteDesvantagens) {
                alert('Erro: Você excedeu o limite de desvantagens!');
                return false;
            }
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
            console.log('💾 Iniciando salvamento COMPLETO...');
            
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
            console.log('📊 Coletando dados de todas as abas...');
            const dados = this.coletarTodosDados();
            
            // 4. ADICIONAR user_id (CRÍTICO!)
            dados.user_id = userId;
            
            // 5. ATUALIZAR PONTOS DO SISTEMA
            if (window.sistemaPontos) {
                dados.pontos_totais = window.sistemaPontos.pontos.totais || 150;
                dados.pontos_gastos = window.sistemaPontos.pontos.gastos || 0;
                dados.pontos_disponiveis = window.sistemaPontos.pontos.disponiveis || 150;
                dados.limite_desvantagens = window.sistemaPontos.pontos.limiteDesvantagens || -50;
                dados.desvantagens_atuais = window.sistemaPontos.pontos.desvantagensAtuais || 0;
            }

            // 6. VALIDAR
            if (!this.validarPontos(dados)) {
                if (btnSalvar) {
                    btnSalvar.innerHTML = btnSalvarOriginal;
                    btnSalvar.disabled = false;
                }
                return false;
            }

            let resultado;
            let personagemSalvoId = personagemId;
            let fotoUrl = null;

            // 7. GERENCIAR FOTO
            try {
                if (window.dashboard && typeof window.dashboard.getFotoParaSalvar === 'function') {
                    const fotoData = window.dashboard.getFotoParaSalvar();
                    if (fotoData && fotoData.file && personagemSalvoId) {
                        console.log('🖼️ Salvando foto...');
                        fotoUrl = await this.salvarFotoNoSupabase(fotoData.file, personagemSalvoId);
                        if (fotoUrl) {
                            dados.avatar_url = fotoUrl;
                        }
                    }
                }
            } catch (error) {
                console.warn('⚠️ Erro ao processar foto:', error);
            }

            // 8. SALVAR NO BANCO
            if (personagemId) {
                // MODO EDIÇÃO
                console.log('✏️ Editando personagem:', personagemId);
                
                // Remover campos que não devem ser atualizados
                delete dados.created_at;
                delete dados.user_id; // Manter o original
                
                // Atualizar foto se for upload novo
                if (fotoUrl) {
                    dados.avatar_url = fotoUrl;
                }
                
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
                
                // Criar
                const { data, error } = await this.supabase
                    .from('characters')
                    .insert([dados])
                    .select();

                if (error) throw error;
                
                if (data && data[0]) {
                    personagemSalvoId = data[0].id;
                    console.log('✅ ID criado:', personagemSalvoId);
                    resultado = data;
                    
                    // Salvar foto após criar
                    if (!fotoUrl) {
                        try {
                            if (window.dashboard && typeof window.dashboard.getFotoParaSalvar === 'function') {
                                const fotoData = window.dashboard.getFotoParaSalvar();
                                if (fotoData && fotoData.file) {
                                    fotoUrl = await this.salvarFotoNoSupabase(fotoData.file, personagemSalvoId);
                                    
                                    if (fotoUrl) {
                                        await this.supabase
                                            .from('characters')
                                            .update({ avatar_url: fotoUrl })
                                            .eq('id', personagemSalvoId);
                                    }
                                }
                            }
                        } catch (error) {
                            console.warn('⚠️ Erro ao salvar foto após criação:', error);
                        }
                    }
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
                ? 'Personagem atualizado com sucesso!' 
                : 'Personagem criado com sucesso!';
            
            alert(mensagem + '\n\nRedirecionando para seus personagens...');
            
            setTimeout(() => {
                window.location.href = 'personagens.html';
            }, 1500);
            
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
                mensagemErro = 'Problema de conexão. Verifique sua internet.';
            } else if (error.message.includes('auth')) {
                mensagemErro = 'Problema de autenticação. Faça login novamente.';
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
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

            if (!confirm('Tem certeza que deseja excluir este personagem?\n\nEsta ação não pode ser desfeita!')) {
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
                    mensagem: 'Não autenticado'
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
                    mensagem: 'Erro na consulta: ' + error.message
                };
            }
            
            return {
                sucesso: true,
                mensagem: `Conexão OK! Personagens: ${count || 0}`
            };
            
        } catch (error) {
            return {
                sucesso: false,
                mensagem: 'Erro: ' + error.message
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
    
    console.log('✅ Sistema de salvamento COMPLETO carregado');
    
} catch (error) {
    console.error('❌ Erro ao carregar salvamento:', error);
    
    // Fallback
    salvamento = {
        verificarLimitePersonagens: async () => ({ podeCriar: true, quantidade: 0, limite: 10, motivo: '' }),
        salvarPersonagem: async () => {
            alert('Sistema de salvamento não disponível.');
            return false;
        },
        carregarPersonagem: async () => null,
        excluirPersonagem: async () => false
    };
    
    window.salvamento = salvamento;
}

// Função para teste rápido
window.testeSalvamentoCompleto = async function() {
    console.log('🧪 Testando salvamento COMPLETO...');
    
    if (!window.salvamento) {
        alert('Sistema de salvamento não carregado!');
        return;
    }
    
    const teste = await window.salvamento.testarConexao();
    
    if (teste.sucesso) {
        alert('✅ CONEXÃO OK!\n' + teste.mensagem);
    } else {
        alert('❌ PROBLEMA!\n' + teste.mensagem);
    }
};
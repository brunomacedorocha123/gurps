// salvamento-supabase.js - VERSÃO COMPLETA COM INTEGRAÇÃO TOTAL
class SalvamentoSupabase {
    constructor() {
        // Verificar Supabase
        if (!window.supabase) {
            console.error('❌ Supabase não carregado!');
            throw new Error('Supabase não está disponível');
        }
        
        this.supabase = window.supabase;
        this.limitePersonagens = 10;
        
        console.log('✅✅✅ Sistema de salvamento SUPER inicializado ✅✅✅');
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
    // COLETAR DADOS COMPLETOS DAS ABAS
    // ======================
    coletarDadosCompletosDasAbas() {
        console.log('🔍🔍🔍 COLETANDO DADOS COMPLETOS DE TODAS AS ABAS 🔍🔍🔍');
        
        try {
            // Usar o coletor de dados SUPER se disponível
            if (window.coletor && typeof window.coletor.obterDadosParaSupabase === 'function') {
                console.log('📊 Usando coletor SUPER de dados...');
                const dadosColetor = window.coletor.obterDadosParaSupabase();
                
                // Adicionar campos específicos que podem não estar no coletor
                dadosColetor.avatar_url = this._obterAvatarUrl();
                dadosColetor.dinheiro = this._obterDinheiroCompleto();
                dadosColetor.condicoes = this._coletarCondicoesJson();
                
                console.log('✅ Dados coletados via coletor SUPER:', {
                    nome: dadosColetor.nome,
                    vantagens: dadosColetor.total_vantagens || 0,
                    pericias: dadosColetor.total_pericias || 0,
                    magias: dadosColetor.total_magias || 0,
                    equipamentos: JSON.parse(dadosColetor.equipamentos || '[]').length
                });
                
                return dadosColetor;
            }
            
            // Fallback: coletar manualmente
            console.log('⚠️ Usando coleta manual (fallback)...');
            return this.coletarDadosManualmente();
            
        } catch (error) {
            console.error('❌❌❌ ERRO NA COLETA COMPLETA:', error);
            return this.coletarDadosMinimos();
        }
    }

    // ======================
    // COLETA MANUAL (FALLBACK)
    // ======================
    coletarDadosManualmente() {
        const dados = {};
        
        try {
            // 1. DADOS BÁSICOS
            dados.nome = document.getElementById('charName')?.value || 'Novo Personagem';
            dados.raca = document.getElementById('racaPersonagem')?.value || '';
            dados.classe = document.getElementById('classePersonagem')?.value || '';
            dados.nivel = document.getElementById('nivelPersonagem')?.value || '';
            dados.descricao = document.getElementById('descricaoPersonagem')?.value || '';
            dados.avatar_url = this._obterAvatarUrl();
            
            // 2. PONTOS
            dados.pontos_totais = this._obterPontosTotaisManual();
            dados.pontos_gastos = this._obterPontosGastosManual();
            dados.pontos_disponiveis = this._obterPontosDisponiveisManual();
            dados.limite_desvantagens = this._obterLimiteDesvantagensManual();
            dados.desvantagens_atuais = this._obterDesvantagensAtuaisManual();
            
            // 3. ATRIBUTOS
            dados.forca = parseInt(document.getElementById('ST')?.value) || 10;
            dados.destreza = parseInt(document.getElementById('DX')?.value) || 10;
            dados.inteligencia = parseInt(document.getElementById('IQ')?.value) || 10;
            dados.saude = parseInt(document.getElementById('HT')?.value) || 10;
            
            // 4. ATRIBUTOS SECUNDÁRIOS
            dados.pontos_vida = this._obterNumeroTexto('PVTotal', 10);
            dados.bonus_pv = this._obterNumero('bonusPV', 0);
            dados.pontos_fadiga = this._obterNumeroTexto('PFTotal', 10);
            dados.bonus_pf = this._obterNumero('bonusPF', 0);
            dados.vontade = this._obterNumeroTexto('VontadeTotal', 10);
            dados.bonus_vontade = this._obterNumero('bonusVontade', 0);
            dados.percepcao = this._obterNumeroTexto('PercepcaoTotal', 10);
            dados.bonus_percepcao = this._obterNumero('bonusPercepcao', 0);
            dados.deslocamento = this._obterNumeroTexto('DeslocamentoTotal', 5.00, true);
            dados.bonus_deslocamento = this._obterNumero('bonusDeslocamento', 0, true);
            
            // 5. DANO
            dados.dano_gdp = this._obterTexto('danoGDP', '1d-2');
            dados.dano_geb = this._obterTexto('danoGEB', '1d');
            
            // 6. CARGA
            dados.carga_nenhuma = this._obterNumeroTexto('cargaNenhuma', 10.0, true);
            dados.carga_leve = this._obterNumeroTexto('cargaLeve', 20.0, true);
            dados.carga_media = this._obterNumeroTexto('cargaMedia', 30.0, true);
            dados.carga_pesada = this._obterNumeroTexto('cargaPesada', 60.0, true);
            dados.carga_muito_pesada = this._obterNumeroTexto('cargaMuitoPesada', 100.0, true);
            
            // 7. CARACTERÍSTICAS
            const selectAparencia = document.getElementById('nivelAparencia');
            if (selectAparencia) {
                dados.aparencia = selectAparencia.options[selectAparencia.selectedIndex]?.text.split('[')[0]?.trim() || 'Comum';
                dados.custo_aparencia = parseInt(selectAparencia.value) || 0;
            } else {
                dados.aparencia = 'Comum';
                dados.custo_aparencia = 0;
            }
            
            const selectRiqueza = document.getElementById('nivelRiqueza');
            if (selectRiqueza) {
                dados.riqueza = selectRiqueza.options[selectRiqueza.selectedIndex]?.text.split('[')[0]?.trim() || 'Média';
                dados.custo_riqueza = parseInt(selectRiqueza.value) || 0;
            } else {
                dados.riqueza = 'Média';
                dados.custo_riqueza = 0;
            }
            
            dados.renda_mensal = this._obterTexto('rendaMensal', '$1.000');
            dados.idiomas = this._coletarIdiomasJson();
            dados.altura = parseFloat(document.getElementById('altura')?.value) || 1.70;
            dados.peso = parseFloat(document.getElementById('peso')?.value) || 70.00;
            dados.caracteristicas_fisicas = this._coletarCaracteristicasFisicasJson();
            
            // 8. VANTAGENS/DESVANTAGENS
            dados.vantagens = this._coletarVantagensJson();
            dados.total_vantagens = JSON.parse(dados.vantagens || '[]').length;
            dados.desvantagens = this._coletarDesvantagensJson();
            dados.total_desvantagens = JSON.parse(dados.desvantagens || '[]').length;
            dados.peculiaridades = this._coletarPeculiaridadesJson();
            dados.total_peculiaridades = JSON.parse(dados.peculiaridades || '[]').length;
            
            // 9. PERÍCIAS
            dados.pericias = this._coletarPericiasJson();
            dados.total_pericias = JSON.parse(dados.pericias || '[]').length;
            dados.pontos_pericias = this._calcularPontosPericiasManual();
            
            // 10. TÉCNICAS
            dados.tecnicas = this._coletarTecnicasJson();
            dados.total_tecnicas = JSON.parse(dados.tecnicas || '[]').length;
            dados.pontos_tecnicas = this._calcularPontosTecnicasManual();
            
            // 11. MAGIAS
            dados.magias = this._coletarMagiasJson();
            dados.total_magias = JSON.parse(dados.magias || '[]').length;
            dados.pontos_magias = this._calcularPontosMagiasManual();
            dados.aptidao_magica = parseInt(document.getElementById('aptidao-magica')?.value) || 0;
            dados.mana_atual = parseInt(document.getElementById('mana-atual')?.value) || 10;
            dados.mana_base = parseInt(document.getElementById('mana-base')?.textContent) || 10;
            dados.bonus_mana = parseInt(document.getElementById('bonus-mana')?.value) || 0;
            
            // 12. EQUIPAMENTOS
            dados.equipamentos = this._coletarEquipamentosJson();
            dados.dinheiro = this._obterDinheiroCompleto();
            dados.peso_atual = this._obterNumeroTexto('pesoAtual', 0, true);
            dados.peso_maximo = this._obterNumeroTexto('pesoMaximo', 60, true);
            dados.nivel_carga = this._obterTexto('nivelCarga', 'LEVE');
            dados.penalidades_carga = this._obterTexto('penalidadesCarga', 'MOV +0 / DODGE +0');
            dados.inventario = dados.equipamentos; // Para compatibilidade
            dados.deposito = this._coletarDepositoJson();
            
            // 13. COMBATE
            dados.pv_atual = parseInt(document.getElementById('pvAtualDisplay')?.value) || 10;
            dados.pv_maximo = parseInt(document.getElementById('pvMaxDisplay')?.textContent) || 10;
            dados.pv_modificador = this._obterNumero('pvModificador', 0);
            dados.pv_estado = this._obterTexto('pvEstadoDisplay', 'Saudável');
            
            dados.pf_atual = parseInt(document.getElementById('pfAtualDisplay')?.value) || 10;
            dados.pf_maximo = parseInt(document.getElementById('pfMaxDisplay')?.textContent) || 10;
            dados.pf_modificador = this._obterNumero('pfModificador', 0);
            dados.pf_estado = this._obterTexto('pfEstadoDisplay', 'Normal');
            
            dados.esquiva = this._obterNumeroTexto('esquivaTotal', 10);
            dados.esquiva_mod = this._obterNumero('esquivaMod', 0);
            dados.bloqueio = this._obterNumeroTexto('bloqueioTotal', 11);
            dados.bloqueio_mod = this._obterNumero('bloqueioMod', 0);
            dados.aparar = this._obterNumeroTexto('apararTotal', 3);
            dados.aparar_mod = this._obterNumero('apararMod', 0);
            
            dados.bonus_reflexos = this._obterNumero('bonusReflexos', 0);
            dados.bonus_escudo = this._obterNumero('bonusEscudo', 0);
            dados.bonus_capa = this._obterNumero('bonusCapa', 0);
            dados.bonus_outros = this._obterNumero('bonusOutros', 0);
            
            // Resistência a Dano
            dados.rd_cabeca = this._obterRD('cabeca');
            dados.rd_tronco = this._obterRD('tronco');
            dados.rd_rosto = this._obterRD('rosto');
            dados.rd_cranio = this._obterRD('crânio') || this._obterRD('cranio');
            dados.rd_pescoco = this._obterRD('pescoco');
            dados.rd_virilha = this._obterRD('virilha');
            dados.rd_bracos = this._obterRD('bracos');
            dados.rd_pernas = this._obterRD('pernas');
            dados.rd_maos = this._obterRD('maos');
            dados.rd_pes = this._obterRD('pes');
            dados.rd_total = this._obterNumeroTexto('rdTotal', 0);
            
            // Escudo
            dados.escudo_equipado = document.querySelector('.escudo-status .status-badge')?.textContent?.includes('Ativo') || false;
            dados.escudo_nome = this._obterTexto('escudoNome', 'Nenhum escudo equipado');
            dados.escudo_dr = this._obterNumeroTexto('escudoDR', 0);
            dados.escudo_pv_atual = this._obterNumeroTexto('escudo_pv_atual', 0);
            dados.escudo_pv_maximo = this._obterNumeroTexto('escudo_pv_maximo', 0);
            
            // Condições
            dados.condicoes = this._coletarCondicoesJson();
            dados.condicoes_ativas = JSON.parse(dados.condicoes || '[]').length;
            
            // Relacionamentos
            dados.inimigos = this._coletarInimigosJson();
            dados.aliados = this._coletarAliadosJson();
            dados.dependentes = this._coletarDependentesJson();
            
            // 14. STATUS E DATAS
            dados.status = 'Ativo';
            dados.created_at = new Date().toISOString();
            dados.updated_at = new Date().toISOString();
            
            console.log('✅ Dados coletados manualmente:', {
                nome: dados.nome,
                atributos: `ST${dados.forca}/DX${dados.destreza}/IQ${dados.inteligencia}/HT${dados.saude}`,
                vantagens: dados.total_vantagens,
                desvantagens: dados.total_desvantagens,
                pericias: dados.total_pericias,
                magias: dados.total_magias
            });
            
            return dados;
            
        } catch (error) {
            console.error('❌ Erro na coleta manual:', error);
            return this.coletarDadosMinimos();
        }
    }

    // ======================
    // MÉTODOS AUXILIARES DE COLETA
    // ======================
    
    _obterValor(id, padrao = '') {
        const el = document.getElementById(id);
        return el ? (el.value || el.textContent || padrao) : padrao;
    }
    
    _obterNumero(id, padrao = 0, decimal = false) {
        const el = document.getElementById(id);
        if (!el) return padrao;
        const valor = el.value || el.textContent || padrao;
        const num = decimal ? parseFloat(valor) : parseInt(valor);
        return isNaN(num) ? padrao : num;
    }
    
    _obterNumeroTexto(id, padrao = 0, decimal = false) {
        const el = document.getElementById(id);
        if (!el) return padrao;
        const texto = el.textContent || el.value || padrao.toString();
        const num = decimal ? parseFloat(texto) : parseInt(texto);
        return isNaN(num) ? padrao : num;
    }
    
    _obterTexto(id, padrao = '') {
        const el = document.getElementById(id);
        if (!el) return padrao;
        return el.textContent || el.value || padrao;
    }
    
    _obterPontosTotaisManual() {
        const input = document.getElementById('pontosTotaisDashboard');
        if (input) return parseInt(input.value) || 150;
        
        const display = document.getElementById('pontosTotais');
        if (display) return this._obterNumeroTexto('pontosTotais', 150);
        
        return 150;
    }
    
    _obterPontosGastosManual() {
        const display = document.getElementById('pontosGastosDashboard');
        if (display) return this._obterNumeroTexto('pontosGastosDashboard', 0);
        
        const display2 = document.getElementById('pontosGastos');
        if (display2) return this._obterNumeroTexto('pontosGastos', 0);
        
        return 0;
    }
    
    _obterPontosDisponiveisManual() {
        const display = document.getElementById('saldoDisponivelDashboard');
        if (display) return this._obterNumeroTexto('saldoDisponivelDashboard', 150);
        
        const display2 = document.getElementById('pontosSaldo');
        if (display2) return this._obterNumeroTexto('pontosSaldo', 150);
        
        return 150;
    }
    
    _obterLimiteDesvantagensManual() {
        const input = document.getElementById('limiteDesvantagens');
        if (input) return parseInt(input.value) || -50;
        return -50;
    }
    
    _obterDesvantagensAtuaisManual() {
        const display = document.getElementById('desvantagensAtuais');
        if (display) return this._obterNumeroTexto('desvantagensAtuais', 0);
        return 0;
    }
    
    _obterAvatarUrl() {
        const img = document.getElementById('fotoPreview');
        if (img && img.style.display !== 'none') {
            return img.src;
        }
        return '';
    }
    
    _obterDinheiroCompleto() {
        try {
            const elemento = document.getElementById('dinheiroEquipamento') || 
                            document.getElementById('dinheiro-disponivel');
            if (!elemento) return 2000.00;
            
            const texto = elemento.textContent || elemento.value || '$2000';
            const valor = texto.replace('$', '').replace(/\./g, '').replace(',', '.');
            const num = parseFloat(valor);
            return isNaN(num) ? 2000.00 : num;
        } catch (error) {
            return 2000.00;
        }
    }
    
    _obterRD(parte) {
        try {
            const input = document.querySelector(`.rd-parte[data-parte="${parte}"] input`);
            return input ? parseInt(input.value) || 0 : 0;
        } catch (error) {
            return 0;
        }
    }
    
    _coletarIdiomasJson() {
        try {
            const container = document.getElementById('listaIdiomasAdicionais');
            if (!container) return JSON.stringify([]);
            
            const itens = container.querySelectorAll('.idioma-adicional-item');
            if (itens.length === 0) return JSON.stringify([]);
            
            const idiomas = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.idioma-nome')?.textContent?.trim();
                const fala = item.querySelector('.idioma-fala')?.textContent?.trim();
                const escrita = item.querySelector('.idioma-escrita')?.textContent?.trim();
                
                if (nome && nome !== '') {
                    idiomas.push({
                        nome: nome,
                        fala: fala || 'Rudimentar',
                        escrita: escrita || 'Nenhum'
                    });
                }
            });
            
            return JSON.stringify(idiomas);
        } catch (error) {
            return JSON.stringify([]);
        }
    }
    
    _coletarCaracteristicasFisicasJson() {
        try {
            const container = document.getElementById('caracteristicasSelecionadas');
            if (!container) return JSON.stringify([]);
            
            const itens = container.querySelectorAll('.caracteristica-selecionada-item');
            if (itens.length === 0) return JSON.stringify([]);
            
            const caracteristicas = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.caracteristica-nome')?.textContent?.trim();
                const pontosTexto = item.querySelector('.caracteristica-pontos')?.textContent?.trim();
                const pontos = parseInt(pontosTexto?.match(/-?\d+/)?.[0]) || 0;
                
                if (nome && nome !== '') {
                    caracteristicas.push({
                        nome: nome,
                        pontos: pontos,
                        tipo: item.getAttribute('data-tipo') || ''
                    });
                }
            });
            
            return JSON.stringify(caracteristicas);
        } catch (error) {
            return JSON.stringify([]);
        }
    }
    
    _coletarVantagensJson() {
        try {
            const lista = document.getElementById('vantagens-adquiridas');
            if (!lista) return JSON.stringify([]);
            
            const itens = lista.querySelectorAll('.item-adquirido, [data-vantagem-id]');
            if (itens.length === 0) return JSON.stringify([]);
            
            const vantagens = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.nome-vantagem, .nome-item')?.textContent?.trim();
                const pontosTexto = item.querySelector('.custo-vantagem, .pontos-item')?.textContent?.trim();
                const pontos = parseInt(pontosTexto?.match(/-?\d+/)?.[0]) || 0;
                
                if (nome && nome !== '' && nome !== 'Nenhuma vantagem adquirida') {
                    vantagens.push({
                        nome: nome,
                        pontos: pontos
                    });
                }
            });
            
            return JSON.stringify(vantagens);
        } catch (error) {
            return JSON.stringify([]);
        }
    }
    
    _coletarDesvantagensJson() {
        try {
            const lista = document.getElementById('desvantagens-adquiridas');
            if (!lista) return JSON.stringify([]);
            
            const itens = lista.querySelectorAll('.item-adquirido, [data-desvantagem-id]');
            if (itens.length === 0) return JSON.stringify([]);
            
            const desvantagens = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.nome-desvantagem, .nome-item')?.textContent?.trim();
                const pontosTexto = item.querySelector('.custo-desvantagem, .pontos-item')?.textContent?.trim();
                const pontos = parseInt(pontosTexto?.match(/-?\d+/)?.[0]) || 0;
                
                if (nome && nome !== '' && nome !== 'Nenhuma desvantagem adquirida') {
                    desvantagens.push({
                        nome: nome,
                        pontos: pontos
                    });
                }
            });
            
            return JSON.stringify(desvantagens);
        } catch (error) {
            return JSON.stringify([]);
        }
    }
    
    _coletarPeculiaridadesJson() {
        try {
            const lista = document.getElementById('lista-peculiaridades');
            if (!lista) return JSON.stringify([]);
            
            const itens = lista.querySelectorAll('.peculiaridade-item');
            if (itens.length === 0) return JSON.stringify([]);
            
            const peculiaridades = [];
            
            itens.forEach(item => {
                const texto = item.querySelector('.peculiaridade-texto')?.textContent?.trim();
                
                if (texto && texto !== '' && texto !== 'Nenhuma peculiaridade adicionada') {
                    peculiaridades.push(texto);
                }
            });
            
            return JSON.stringify(peculiaridades);
        } catch (error) {
            return JSON.stringify([]);
        }
    }
    
    _coletarPericiasJson() {
        try {
            const lista = document.getElementById('pericias-aprendidas');
            if (!lista) return JSON.stringify([]);
            
            const itens = lista.querySelectorAll('.pericia-adquirida, [data-pericia-id]');
            if (itens.length === 0) return JSON.stringify([]);
            
            const pericias = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.pericia-nome, .nome-pericia')?.textContent?.trim();
                const nivel = parseInt(item.querySelector('.pericia-nivel, .nivel-pericia')?.textContent) || 0;
                const pontos = parseInt(item.getAttribute('data-pontos')) || 0;
                const atributo = item.getAttribute('data-atributo') || 'DX';
                
                if (nome && nome !== '' && nome !== 'Nenhuma perícia aprendida') {
                    pericias.push({
                        nome: nome,
                        nivel: nivel,
                        pontos: pontos,
                        atributo: atributo,
                        especializacao: item.getAttribute('data-especializacao') || ''
                    });
                }
            });
            
            return JSON.stringify(pericias);
        } catch (error) {
            return JSON.stringify([]);
        }
    }
    
    _calcularPontosPericiasManual() {
        try {
            const pericias = JSON.parse(this._coletarPericiasJson());
            return pericias.reduce((total, p) => total + (p.pontos || 0), 0);
        } catch (error) {
            return 0;
        }
    }
    
    _coletarTecnicasJson() {
        try {
            const lista = document.getElementById('tecnicas-aprendidas');
            if (!lista) return JSON.stringify([]);
            
            const itens = lista.querySelectorAll('.tecnica-adquirida, [data-tecnica-id]');
            if (itens.length === 0) return JSON.stringify([]);
            
            const tecnicas = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.tecnica-nome, .nome-tecnica')?.textContent?.trim();
                const pontos = parseInt(item.getAttribute('data-pontos')) || 0;
                const periciaBase = item.getAttribute('data-pericia') || '';
                const dificuldade = item.getAttribute('data-dificuldade') || 'Média';
                
                if (nome && nome !== '' && nome !== 'Nenhuma técnica aprendida') {
                    tecnicas.push({
                        nome: nome,
                        pontos: pontos,
                        periciaBase: periciaBase,
                        dificuldade: dificuldade
                    });
                }
            });
            
            return JSON.stringify(tecnicas);
        } catch (error) {
            return JSON.stringify([]);
        }
    }
    
    _calcularPontosTecnicasManual() {
        try {
            const tecnicas = JSON.parse(this._coletarTecnicasJson());
            return tecnicas.reduce((total, t) => total + (t.pontos || 0), 0);
        } catch (error) {
            return 0;
        }
    }
    
    _coletarMagiasJson() {
        try {
            const lista = document.getElementById('magias-aprendidas');
            if (!lista) return JSON.stringify([]);
            
            const itens = lista.querySelectorAll('.magia-adquirida, [data-magia-id]');
            if (itens.length === 0) return JSON.stringify([]);
            
            const magias = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.magia-nome, .nome-magia')?.textContent?.trim();
                const nivel = parseInt(item.querySelector('.magia-nivel, .nivel-magia')?.textContent) || 0;
                const pontos = parseInt(item.getAttribute('data-pontos')) || 0;
                const escola = item.getAttribute('data-escola') || '';
                const classe = item.getAttribute('data-classe') || 'Comum';
                
                if (nome && nome !== '' && nome !== 'Nenhuma magia aprendida') {
                    magias.push({
                        nome: nome,
                        nivel: nivel,
                        pontos: pontos,
                        escola: escola,
                        classe: classe
                    });
                }
            });
            
            return JSON.stringify(magias);
        } catch (error) {
            return JSON.stringify([]);
        }
    }
    
    _calcularPontosMagiasManual() {
        try {
            const magias = JSON.parse(this._coletarMagiasJson());
            return magias.reduce((total, m) => total + (m.pontos || 0), 0);
        } catch (error) {
            return 0;
        }
    }
    
    _coletarEquipamentosJson() {
        try {
            const lista = document.getElementById('lista-equipamentos-adquiridos');
            if (!lista) return JSON.stringify([]);
            
            const itens = lista.querySelectorAll('.equipamento-adquirido, .item-inventario, [data-item-id]');
            if (itens.length === 0) return JSON.stringify([]);
            
            const equipamentos = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.equipamento-nome, .item-nome')?.textContent?.trim();
                const tipo = item.getAttribute('data-tipo') || item.querySelector('.item-tipo')?.textContent?.trim() || 'Equipamento';
                const peso = parseFloat(item.getAttribute('data-peso')) || parseFloat(item.querySelector('.item-peso')?.textContent) || 0;
                const custo = parseFloat(item.getAttribute('data-custo')) || parseFloat(item.querySelector('.item-valor')?.textContent) || 0;
                const equipado = item.classList.contains('equipado') || false;
                
                if (nome && nome !== '' && nome !== 'Inventário Vazio') {
                    equipamentos.push({
                        nome: nome,
                        tipo: tipo,
                        peso: peso,
                        custo: custo,
                        quantidade: parseInt(item.getAttribute('data-quantidade')) || 1,
                        equipado: equipado,
                        local: item.getAttribute('data-local') || 'mochila'
                    });
                }
            });
            
            return JSON.stringify(equipamentos);
        } catch (error) {
            return JSON.stringify([]);
        }
    }
    
    _coletarDepositoJson() {
        try {
            const lista = document.getElementById('lista-deposito');
            if (!lista) return JSON.stringify([]);
            
            const itens = lista.querySelectorAll('.item-deposito, [data-item-deposito-id]');
            if (itens.length === 0) return JSON.stringify([]);
            
            const deposito = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.item-nome')?.textContent?.trim();
                const tipo = item.getAttribute('data-tipo') || 'Depósito';
                const peso = parseFloat(item.getAttribute('data-peso')) || 0;
                const custo = parseFloat(item.getAttribute('data-custo')) || 0;
                
                if (nome && nome !== '') {
                    deposito.push({
                        nome: nome,
                        tipo: tipo,
                        peso: peso,
                        custo: custo,
                        quantidade: parseInt(item.getAttribute('data-quantidade')) || 1
                    });
                }
            });
            
            return JSON.stringify(deposito);
        } catch (error) {
            return JSON.stringify([]);
        }
    }
    
    _coletarCondicoesJson() {
        try {
            const condicoes = document.querySelectorAll('.condicao-item');
            const ativas = [];
            
            condicoes.forEach(condicao => {
                if (condicao.classList.contains('ativa') || condicao.querySelector('.condicao-checkbox').classList.contains('ativa')) {
                    ativas.push(condicao.getAttribute('data-condicao'));
                }
            });
            
            return JSON.stringify(ativas);
        } catch (error) {
            return JSON.stringify([]);
        }
    }
    
    _coletarInimigosJson() {
        try {
            const lista = document.getElementById('listaInimigos');
            if (!lista) return JSON.stringify([]);
            
            const itens = lista.querySelectorAll('.relacionamento-item');
            const inimigos = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.relacionamento-nome')?.textContent?.trim();
                if (nome && nome !== 'Nenhum inimigo adicionado') {
                    inimigos.push(nome);
                }
            });
            
            return JSON.stringify(inimigos);
        } catch (error) {
            return JSON.stringify([]);
        }
    }
    
    _coletarAliadosJson() {
        try {
            const lista = document.getElementById('listaAliados');
            if (!lista) return JSON.stringify([]);
            
            const itens = lista.querySelectorAll('.relacionamento-item');
            const aliados = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.relacionamento-nome')?.textContent?.trim();
                if (nome && nome !== 'Nenhum aliado adicionado') {
                    aliados.push(nome);
                }
            });
            
            return JSON.stringify(aliados);
        } catch (error) {
            return JSON.stringify([]);
        }
    }
    
    _coletarDependentesJson() {
        try {
            const lista = document.getElementById('listaDependentes');
            if (!lista) return JSON.stringify([]);
            
            const itens = lista.querySelectorAll('.relacionamento-item');
            const dependentes = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.relacionamento-nome')?.textContent?.trim();
                if (nome && nome !== 'Nenhum dependente adicionado') {
                    dependentes.push(nome);
                }
            });
            
            return JSON.stringify(dependentes);
        } catch (error) {
            return JSON.stringify([]);
        }
    }
    
    // ======================
    // DADOS MÍNIMOS (FALLBACK)
    // ======================
    coletarDadosMinimos() {
        console.warn('⚠️ Retornando dados mínimos (fallback)');
        
        return {
            nome: document.getElementById('charName')?.value || 'Novo Personagem',
            raca: document.getElementById('racaPersonagem')?.value || 'Humano',
            classe: document.getElementById('classePersonagem')?.value || 'Guerreiro',
            nivel: document.getElementById('nivelPersonagem')?.value || 'Novato',
            
            forca: 10,
            destreza: 10,
            inteligencia: 10,
            saude: 10,
            
            pontos_totais: 150,
            pontos_gastos: 0,
            pontos_disponiveis: 150,
            
            status: 'Ativo',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
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
    // SALVAMENTO PRINCIPAL - SUPER COMPLETO
    // ======================
    async salvarPersonagem(personagemId = null) {
        try {
            console.log('💾💾💾 INICIANDO SALVAMENTO SUPER COMPLETO 💾💾💾');
            
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
                btnSalvar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando TUDO...';
                btnSalvar.disabled = true;
            }

            // 3. COLETAR TODOS OS DADOS
            console.log('🔍 Coletando dados completos...');
            const dados = this.coletarDadosCompletosDasAbas();
            
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
                console.log('✏️ Editando personagem existente:', personagemId);
                
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
                console.log('✅ Personagem atualizado:', data);
                
            } else {
                // MODO CRIAÇÃO
                console.log('🆕 Criando novo personagem...');
                
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
                    await this.salvarFotoPersonagem(personagemSalvoId);
                } catch (error) {
                    console.warn('⚠️ Foto não salva (continuando):', error);
                }
            }

            // 8. SUCESSO
            console.log('✅✅✅✅✅ SALVAMENTO SUPER COMPLETO CONCLUÍDO! ✅✅✅✅✅');
            
            // Restaurar botão
            if (btnSalvar) {
                btnSalvar.innerHTML = btnSalvarOriginal;
                btnSalvar.disabled = false;
            }
            
            // Mensagem de sucesso detalhada
            this.mostrarMensagemSucesso(dados, personagemId);
            
            // Redirecionar após 3 segundos
            setTimeout(() => {
                window.location.href = 'personagens.html';
            }, 3000);
            
            return true;

        } catch (error) {
            console.error('❌❌❌ ERRO NO SALVAMENTO SUPER COMPLETO:', error);
            
            // Restaurar botão
            const btnSalvar = document.getElementById('btnSalvar');
            if (btnSalvar) {
                btnSalvar.innerHTML = '<i class="fas fa-save"></i> Salvar';
                btnSalvar.disabled = false;
            }
            
            // Mostrar erro detalhado
            this.mostrarErroDetalhado(error);
            return false;
        }
    }
    
    // ======================
    // SALVAR FOTO DO PERSONAGEM
    // ======================
    async salvarFotoPersonagem(personagemId) {
        try {
            // Verificar se há foto no dashboard
            if (window.dashboard && typeof window.dashboard.getFotoParaSalvar === 'function') {
                const fotoData = window.dashboard.getFotoParaSalvar();
                if (fotoData && fotoData.file) {
                    console.log('📸 Salvando foto do personagem...');
                    const fotoUrl = await this.salvarFotoNoSupabase(fotoData.file, personagemId);
                    
                    if (fotoUrl) {
                        await this.supabase
                            .from('characters')
                            .update({ avatar_url: fotoUrl })
                            .eq('id', personagemId);
                        console.log('✅ Foto salva:', fotoUrl);
                        return fotoUrl;
                    }
                }
            }
            
            // Verificar se há foto no preview
            const fotoPreview = document.getElementById('fotoPreview');
            if (fotoPreview && fotoPreview.src && !fotoPreview.src.includes('data:')) {
                console.log('📸 Usando foto do preview...');
                await this.supabase
                    .from('characters')
                    .update({ avatar_url: fotoPreview.src })
                    .eq('id', personagemId);
                return fotoPreview.src;
            }
            
            return null;
            
        } catch (error) {
            console.error('❌ Erro ao salvar foto:', error);
            return null;
        }
    }
    
    // ======================
    // SALVAR FOTO NO SUPABASE STORAGE
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

            // Upload do arquivo
            const { data: uploadData, error: uploadError } = await this.supabase.storage
                .from('characters')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true,
                    contentType: file.type
                });

            if (uploadError) {
                console.error('Erro no upload da foto:', uploadError);
                return null;
            }

            // Obter URL pública
            const { data: { publicUrl } } = this.supabase.storage
                .from('characters')
                .getPublicUrl(filePath);

            return publicUrl;

        } catch (error) {
            console.error('Erro completo ao salvar foto:', error);
            return null;
        }
    }
    
    // ======================
    // MENSAGENS DE SUCESSO E ERRO
    // ======================
    mostrarMensagemSucesso(dados, personagemId) {
        const mensagem = personagemId 
            ? '✅✅✅ PERSONAGEM ATUALIZADO COM SUCESSO! ✅✅✅\n\n' 
            : '✅✅✅ PERSONAGEM CRIADO COM SUCESSO! ✅✅✅\n\n';
        
        const resumo = `📊📊📊 RESUMO COMPLETO SALVO 📊📊📊

🎮 DADOS BÁSICOS:
• Nome: ${dados.nome}
• Raça: ${dados.raca || 'Humano'}
• Classe: ${dados.classe || 'Guerreiro'}
• Nível: ${dados.nivel || 'Novato'}

⚔️ ATRIBUTOS:
• FOR: ${dados.forca || 10}
• DES: ${dados.destreza || 10}
• INT: ${dados.inteligencia || 10}
• VIG: ${dados.saude || 10}

💰 PONTOS:
• Totais: ${dados.pontos_totais || 150}
• Gastos: ${dados.pontos_gastos || 0}
• Saldo: ${dados.pontos_disponiveis || 150}

📦 SISTEMAS SALVOS:
• Vantagens: ${dados.total_vantagens || 0}
• Desvantagens: ${dados.total_desvantagens || 0}
• Peculiaridades: ${dados.total_peculiaridades || 0}
• Perícias: ${dados.total_pericias || 0}
• Técnicas: ${dados.total_tecnicas || 0}
• Magias: ${dados.total_magias || 0}
• Equipamentos: ${JSON.parse(dados.equipamentos || '[]').length}

✅✅✅ TODOS OS DADOS DAS ABAS FORAM SALVOS! ✅✅✅`;
        
        alert(mensagem + resumo + '\n\nRedirecionando para seus personagens...');
    }
    
    mostrarErroDetalhado(error) {
        let mensagemErro = '❌❌❌ ERRO NO SALVAMENTO ❌❌❌\n\n';
        
        if (error.message.includes('permission denied') || error.code === '42501') {
            mensagemErro += '🚫 ERRO DE PERMISSÃO!\n\n';
            mensagemErro += 'Você não tem permissão para salvar.\n';
            mensagemErro += 'Verifique:\n';
            mensagemErro += '1. Se está logado corretamente\n';
            mensagemErro += '2. Suas credenciais do Supabase\n';
            mensagemErro += '3. As políticas RLS do banco de dados\n\n';
            mensagemErro += 'Tente recarregar a página e fazer login novamente.';
            
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            mensagemErro += '🌐 ERRO DE CONEXÃO!\n\n';
            mensagemErro += 'Verifique sua conexão com a internet.\n';
            mensagemErro += 'O servidor pode estar indisponível.\n\n';
            mensagemErro += 'Tente novamente em alguns instantes.';
            
        } else if (error.message.includes('auth') || error.code === 'auth.session-missing') {
            mensagemErro += '🔐 SESSÃO EXPIRADA!\n\n';
            mensagemErro += 'Sua sessão expirou ou você não está autenticado.\n';
            mensagemErro += 'Faça login novamente para continuar.\n\n';
            setTimeout(() => window.location.href = 'login.html', 2000);
            
        } else if (error.message.includes('JSON')) {
            mensagemErro += '📄 ERRO DE FORMATAÇÃO!\n\n';
            mensagemErro += 'Erro ao processar os dados do personagem.\n';
            mensagemErro += 'Verifique os campos preenchidos.\n\n';
            mensagemErro += 'Detalhes: ' + error.message;
            
        } else {
            mensagemErro += '💥 ERRO DESCONHECIDO!\n\n';
            mensagemErro += 'Detalhes técnicos:\n';
            mensagemErro += error.message + '\n\n';
            mensagemErro += 'Código: ' + (error.code || 'N/A') + '\n';
            mensagemErro += 'Consulte o console para mais informações (F12).';
        }
        
        alert(mensagemErro);
    }

    // ======================
    // CARREGAR PERSONAGEM
    // ======================
    async carregarPersonagem(personagemId) {
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            if (!session) {
                alert('❌ Você precisa estar logado para carregar personagens!');
                return null;
            }

            console.log('📥 Carregando personagem:', personagemId);
            
            const { data: personagem, error } = await this.supabase
                .from('characters')
                .select('*')
                .eq('id', personagemId)
                .eq('user_id', session.user.id)
                .single();

            if (error) {
                console.error('❌ Erro ao carregar:', error);
                if (error.code === 'PGRST116') {
                    alert('❌ Personagem não encontrado ou você não tem permissão para acessá-lo.');
                } else {
                    alert('❌ Erro ao carregar personagem: ' + error.message);
                }
                return null;
            }

            console.log('✅ Personagem carregado com sucesso:', personagem.nome);
            return personagem;

        } catch (error) {
            console.error('❌ Erro completo ao carregar:', error);
            alert('❌ Erro ao carregar personagem: ' + error.message);
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
                alert('❌ Você precisa estar logado para excluir personagens!');
                return false;
            }

            if (!confirm('⚠️⚠️⚠️ ATENÇÃO: EXCLUSÃO PERMANENTE! ⚠️⚠️⚠️\n\nTem certeza ABSOLUTA que deseja excluir este personagem?\n\n✅ Esta ação NÃO PODE ser desfeita!\n✅ Todos os dados serão perdidos!\n✅ A foto também será removida!\n\nDigite "EXCLUIR" para confirmar:')) {
                return false;
            }

            // Verificar confirmação por texto
            const confirmacao = prompt('Digite "EXCLUIR" para confirmar a exclusão permanente:');
            if (confirmacao !== 'EXCLUIR') {
                alert('❌ Exclusão cancelada.');
                return false;
            }

            const { error } = await this.supabase
                .from('characters')
                .delete()
                .eq('id', personagemId)
                .eq('user_id', session.user.id);

            if (error) {
                alert('❌ Erro ao excluir: ' + error.message);
                return false;
            }

            alert('✅✅✅ PERSONAGEM EXCLUÍDO COM SUCESSO! ✅✅✅\n\nO personagem foi removido permanentemente.');
            
            // Redirecionar
            setTimeout(() => {
                window.location.href = 'personagens.html';
            }, 2000);
            
            return true;

        } catch (error) {
            console.error('❌ Erro ao excluir:', error);
            alert('❌ Erro ao excluir personagem: ' + error.message);
            return false;
        }
    }

    // ======================
    // TESTE DE CONEXÃO
    // ======================
    async testarConexao() {
        try {
            console.log('🔗 Testando conexão com Supabase...');
            
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (!session) {
                return {
                    sucesso: false,
                    mensagem: '❌ Não autenticado - Faça login primeiro',
                    detalhes: 'Sessão não encontrada'
                };
            }
            
            // Testar conexão com contagem de personagens
            const { count, error } = await this.supabase
                .from('characters')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', session.user.id);
            
            if (error) {
                return {
                    sucesso: false,
                    mensagem: '❌ Erro na conexão com o banco',
                    detalhes: error.message,
                    codigo: error.code
                };
            }
            
            return {
                sucesso: true,
                mensagem: `✅✅✅ CONEXÃO ESTÁVEL! ✅✅✅\n\nUsuário: ${session.user.email}\nPersonagens: ${count || 0}/${this.limitePersonagens}`,
                detalhes: {
                    usuario: session.user.email,
                    personagens: count || 0,
                    limite: this.limitePersonagens,
                    pode_criar: (count || 0) < this.limitePersonagens
                }
            };
            
        } catch (error) {
            return {
                sucesso: false,
                mensagem: '❌❌❌ FALHA NA CONEXÃO ❌❌❌',
                detalhes: error.message,
                codigo: error.code
            };
        }
    }
    
    // ======================
    // TESTE DE COLETA
    // ======================
    async testarColeta() {
        try {
            console.log('🧪🧪🧪 TESTANDO SISTEMA DE COLETA 🧪🧪🧪');
            
            const dados = this.coletarDadosCompletosDasAbas();
            
            const resumo = `
✅✅✅ TESTE DE COLETA REALIZADO! ✅✅✅

📊 RESUMO DOS DADOS COLETADOS:
• Nome: ${dados.nome}
• Atributos: ST${dados.forca || 10}/DX${dados.destreza || 10}/IQ${dados.inteligencia || 10}/HT${dados.saude || 10}
• Pontos: ${dados.pontos_gastos || 0}/${dados.pontos_totais || 150}
• Vantagens: ${dados.total_vantagens || 0}
• Desvantagens: ${dados.total_desvantagens || 0}
• Perícias: ${dados.total_pericias || 0}
• Magias: ${dados.total_magias || 0}
• Equipamentos: ${JSON.parse(dados.equipamentos || '[]').length}

✅ O sistema de coleta está funcionando corretamente!
✅ Pronto para salvar no Supabase.`;
            
            alert(resumo);
            console.log('📦 DADOS COLETADOS NO TESTE:', dados);
            
            return {
                sucesso: true,
                dados: dados,
                mensagem: 'Teste de coleta realizado com sucesso!'
            };
            
        } catch (error) {
            console.error('❌ Erro no teste de coleta:', error);
            
            alert('❌❌❌ FALHA NO TESTE DE COLETA ❌❌❌\n\nErro: ' + error.message + '\n\nVerifique o console para detalhes.');
            
            return {
                sucesso: false,
                erro: error.message,
                mensagem: 'Falha no teste de coleta'
            };
        }
    }
}

// ======================
// INICIALIZAÇÃO GLOBAL SUPER
// ======================
let salvamento;

try {
    salvamento = new SalvamentoSupabase();
    window.salvamento = salvamento;
    
    console.log('✅✅✅✅✅ SISTEMA DE SALVAMENTO SUPER CARREGADO! ✅✅✅✅✅');
    console.log('🚀 Pronto para salvar TODOS os dados das abas no Supabase!');
    
    // Adicionar funções de teste global
    window.testeSalvamentoSuper = async function() {
        console.log('🧪🧪🧪 TESTANDO SALVAMENTO SUPER 🧪🧪🧪');
        
        if (!window.salvamento) {
            alert('❌ Sistema de salvamento não carregado!');
            return;
        }
        
        const teste = await window.salvamento.testarConexao();
        
        if (teste.sucesso) {
            alert(teste.mensagem + '\n\n✅ Sistema pronto para salvar!\n\nClique em "Salvar" para salvar todos os dados.');
        } else {
            alert(teste.mensagem + '\n\n❌ Corrija os problemas antes de salvar.');
        }
    };
    
    window.testeColetaSuper = function() {
        if (window.salvamento && typeof window.salvamento.testarColeta === 'function') {
            window.salvamento.testarColeta();
        } else {
            alert('❌ Sistema de coleta não disponível!');
        }
    };
    
} catch (error) {
    console.error('❌❌❌ ERRO AO CARREGAR SALVAMENTO SUPER:', error);
    
    // Fallback mínimo
    salvamento = {
        salvarPersonagem: async () => {
            alert('❌❌❌ SISTEMA DE SALVAMENTO NÃO DISPONÍVEL ❌❌❌\n\nRecarregue a página ou contate o suporte.\n\nErro: ' + error.message);
            return false;
        },
        testarConexao: async () => ({
            sucesso: false,
            mensagem: 'Sistema não carregado: ' + error.message
        })
    };
    
    window.salvamento = salvamento;
}
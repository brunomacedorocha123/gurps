// coletor-dados.js - VERSÃO COMPLETA PARA TODOS OS SISTEMAS
class ColetorDados {
    constructor() {
        console.log('✅ Coletor de Dados SUPER inicializado');
        this.sistemas = {};
        this.verificarEConfigurarSistemas();
    }

    // ======================
    // CONFIGURAÇÃO INICIAL
    // ======================
    verificarEConfigurarSistemas() {
        console.log('🔍 Verificando sistemas disponíveis...');
        
        // Mapear todos os sistemas possíveis
        this.sistemas = {
            // Dashboard/Atributos básicos
            atributos: {
                disponivel: typeof window.atributos !== 'undefined',
                coletar: () => this._coletarAtributos()
            },
            
            // Dashboard
            dashboard: {
                disponivel: typeof window.dashboard !== 'undefined',
                coletar: () => this._coletarDashboard()
            },
            
            // Vantagens/Desvantagens
            vantagens: {
                disponivel: typeof window.vantagens !== 'undefined',
                coletar: () => this._coletarVantagensSistema()
            },
            
            // Perícias
            pericias: {
                disponivel: typeof window.pericias !== 'undefined',
                coletar: () => this._coletarPericiasSistema()
            },
            
            // Magias
            magias: {
                disponivel: typeof window.magias !== 'undefined',
                coletar: () => this._coletarMagiasSistema()
            },
            
            // Equipamentos
            equipamentos: {
                disponivel: typeof window.equipamentos !== 'undefined',
                coletar: () => this._coletarEquipamentosSistema()
            },
            
            // Combate
            combate: {
                disponivel: typeof window.combate !== 'undefined',
                coletar: () => this._coletarCombateSistema()
            },
            
            // Características
            caracteristicas: {
                disponivel: document.getElementById('nivelAparencia') !== null,
                coletar: () => this._coletarCaracteristicasSistema()
            }
        };
        
        console.log('📊 Sistemas disponíveis:', 
            Object.keys(this.sistemas).filter(s => this.sistemas[s].disponivel)
        );
    }

    // ======================
    // MÉTODO PRINCIPAL - COLETA TUDO
    // ======================
    coletarTodosDados() {
        console.log('🚀 COLETANDO TODOS OS DADOS DO PERSONAGEM...');
        
        try {
            const dados = {};
            
            // 1. DADOS BÁSICOS (SEMPRE DISPONÍVEIS)
            dados.basicos = this._coletarDadosBasicos();
            
            // 2. ATRIBUTOS PRINCIPAIS
            dados.atributos = this._coletarAtributosCompletos();
            
            // 3. SISTEMA DE PONTOS
            dados.pontos = this._coletarSistemaPontos();
            
            // 4. DASHBOARD/CARACTERÍSTICAS
            dados.caracteristicas = this._coletarCaracteristicasCompletas();
            
            // 5. VANTAGENS/DESVANTAGENS/PECULIARIDADES
            dados.vantagensDesvantagens = this._coletarVantagensDesvantagensCompleto();
            
            // 6. PERÍCIAS E TÉCNICAS
            dados.periciasTecnicas = this._coletarPericiasTecnicasCompleto();
            
            // 7. MAGIAS
            dados.magias = this._coletarMagiasCompleto();
            
            // 8. EQUIPAMENTOS
            dados.equipamentos = this._coletarEquipamentosCompleto();
            
            // 9. COMBATE
            dados.combate = this._coletarCombateCompleto();
            
            // 10. STATUS E METADADOS
            dados.metadata = {
                coletado_em: new Date().toISOString(),
                versao_sistema: '1.0.0',
                sistemas_coletados: Object.keys(this.sistemas)
                    .filter(s => this.sistemas[s].disponivel)
                    .length
            };
            
            console.log('✅✅✅ COLETA COMPLETA REALIZADA!');
            console.log('📊 Resumo:', {
                nome: dados.basicos.nome,
                atributos: dados.atributos.principais,
                vantagens: dados.vantagensDesvantagens.total_vantagens,
                pericias: dados.periciasTecnicas.total_pericias,
                magias: dados.magias.total_magias,
                equipamentos: dados.equipamentos.total_itens
            });
            
            return dados;
            
        } catch (error) {
            console.error('❌❌❌ ERRO NA COLETA COMPLETA:', error);
            return this._coletarDadosMinimos();
        }
    }

    // ======================
    // MÉTODOS DE COLETA ESPECÍFICOS
    // ======================

    // 1. DADOS BÁSICOS
    _coletarDadosBasicos() {
        return {
            nome: this._obterValor('charName', 'Novo Personagem'),
            raca: this._obterValor('racaPersonagem', 'Humano'),
            classe: this._obterValor('classePersonagem', 'Guerreiro'),
            nivel: this._obterValor('nivelPersonagem', 'Novato'),
            descricao: this._obterValor('descricaoPersonagem', ''),
            status: 'Ativo',
            avatar_url: this._obterAvatarUrl()
        };
    }

    // 2. ATRIBUTOS COMPLETOS
    _coletarAtributosCompletos() {
        return {
            principais: {
                forca: this._obterNumero('ST', 10),
                destreza: this._obterNumero('DX', 10),
                inteligencia: this._obterNumero('IQ', 10),
                saude: this._obterNumero('HT', 10)
            },
            secundarios: {
                pontos_vida: this._obterNumeroTexto('PVTotal', 10),
                pontos_fadiga: this._obterNumeroTexto('PFTotal', 10),
                vontade: this._obterNumeroTexto('VontadeTotal', 10),
                percepcao: this._obterNumeroTexto('PercepcaoTotal', 10),
                deslocamento: this._obterNumeroTexto('DeslocamentoTotal', 5.00, true)
            },
            dano: {
                gdp: this._obterTexto('danoGDP', '1d-2'),
                geb: this._obterTexto('danoGEB', '1d')
            }
        };
    }

    // 3. SISTEMA DE PONTOS
    _coletarSistemaPontos() {
        return {
            totais: this._obterPontosTotais(),
            gastos: this._obterPontosGastos(),
            disponiveis: this._obterPontosDisponiveis(),
            limite_desvantagens: this._obterLimiteDesvantagens(),
            desvantagens_atuais: this._obterDesvantagensAtuais()
        };
    }

    // 4. CARACTERÍSTICAS COMPLETAS
    _coletarCaracteristicasCompletas() {
        const dados = {
            aparencia: {
                nivel: this._obterTextoSelect('nivelAparencia'),
                custo: this._obterValorSelect('nivelAparencia', 0, true)
            },
            riqueza: {
                nivel: this._obterTextoSelect('nivelRiqueza'),
                custo: this._obterValorSelect('nivelRiqueza', 0, true),
                renda_mensal: this._obterTexto('rendaMensal', '$1.000')
            },
            fisicas: {
                altura: this._obterNumero('altura', 1.70, true),
                peso: this._obterNumero('peso', 70),
                caracteristicas: this._coletarCaracteristicasFisicasArray()
            },
            idiomas: {
                materno: this._obterValor('idiomaMaternoNome', 'Comum'),
                adicionais: this._coletarIdiomasArray()
            }
        };
        
        return dados;
    }

    // 5. VANTAGENS/DESVANTAGENS COMPLETO
    _coletarVantagensDesvantagensCompleto() {
        return {
            vantagens: this._coletarVantagensArray(),
            total_vantagens: this._contarVantagens(),
            pontos_vantagens: this._calcularPontosVantagens(),
            
            desvantagens: this._coletarDesvantagensArray(),
            total_desvantagens: this._contarDesvantagens(),
            pontos_desvantagens: this._calcularPontosDesvantagens(),
            
            peculiaridades: this._coletarPeculiaridadesArray(),
            total_peculiaridades: this._contarPeculiaridades(),
            pontos_peculiaridades: this._calcularPontosPeculiaridades()
        };
    }

    // 6. PERÍCIAS E TÉCNICAS COMPLETO
    _coletarPericiasTecnicasCompleto() {
        return {
            pericias: this._coletarPericiasArray(),
            total_pericias: this._contarPericias(),
            pontos_pericias: this._calcularPontosPericias(),
            
            tecnicas: this._coletarTecnicasArray(),
            total_tecnicas: this._contarTecnicas(),
            pontos_tecnicas: this._calcularPontosTecnicas(),
            
            resumo: this._coletarResumoPericias()
        };
    }

    // 7. MAGIAS COMPLETO
    _coletarMagiasCompleto() {
        return {
            status: {
                aptidao_magica: this._obterNumero('aptidao-magica', 0),
                mana_atual: this._obterNumero('mana-atual', 10),
                mana_base: this._obterNumeroTexto('mana-base', 10),
                bonus_mana: this._obterNumero('bonus-mana', 0),
                iq_magico: this._obterNumeroTexto('iq-magico', 10)
            },
            magias: this._coletarMagiasArray(),
            total_magias: this._contarMagias(),
            pontos_magias: this._calcularPontosMagias(),
            escolas: this._coletarEscolasMagia()
        };
    }

    // 8. EQUIPAMENTOS COMPLETO
    _coletarEquipamentosCompleto() {
        return {
            financeiro: {
                dinheiro: this._obterDinheiro('dinheiroEquipamento', 2000),
                renda_mensal: this._obterTexto('rendaMensal', '$1.000')
            },
            carga: {
                peso_atual: this._obterNumeroTexto('pesoAtual', 0, true),
                peso_maximo: this._obterNumeroTexto('pesoMaximo', 60, true),
                nivel_carga: this._obterTexto('nivelCarga', 'LEVE'),
                penalidades: this._obterTexto('penalidadesCarga', 'MOV +0 / DODGE +0')
            },
            itens: this._coletarEquipamentosArray(),
            total_itens: this._contarEquipamentos(),
            peso_total: this._calcularPesoTotalEquipamentos()
        };
    }

    // 9. COMBATE COMPLETO
    _coletarCombateCompleto() {
        return {
            vitalidade: {
                pv_atual: this._obterNumero('pvAtualDisplay', 10),
                pv_maximo: this._obterNumeroTexto('pvMaxDisplay', 10),
                pv_modificador: this._obterNumero('pvModificador', 0),
                pv_estado: this._obterTexto('pvEstadoDisplay', 'Saudável'),
                
                pf_atual: this._obterNumero('pfAtualDisplay', 10),
                pf_maximo: this._obterNumeroTexto('pfMaxDisplay', 10),
                pf_modificador: this._obterNumero('pfModificador', 0),
                pf_estado: this._obterTexto('pfEstadoDisplay', 'Normal')
            },
            defesas: {
                esquiva: this._obterNumeroTexto('esquivaTotal', 10),
                esquiva_mod: this._obterNumero('esquivaMod', 0),
                bloqueio: this._obterNumeroTexto('bloqueioTotal', 11),
                bloqueio_mod: this._obterNumero('bloqueioMod', 0),
                aparar: this._obterNumeroTexto('apararTotal', 3),
                aparar_mod: this._obterNumero('apararMod', 0)
            },
            bonus: {
                reflexos: this._obterNumero('bonusReflexos', 0),
                escudo: this._obterNumero('bonusEscudo', 0),
                capa: this._obterNumero('bonusCapa', 0),
                outros: this._obterNumero('bonusOutros', 0)
            },
            resistencia_dano: this._coletarResistenciaDano(),
            escudo: this._coletarDadosEscudo(),
            condicoes: this._coletarCondicoesCombate()
        };
    }

    // ======================
    // MÉTODOS AUXILIARES - MESMOS DO SEU CÓDIGO ORIGINAL
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
    
    _obterTextoSelect(id) {
        const select = document.getElementById(id);
        if (!select || !select.selectedOptions[0]) return '';
        const texto = select.selectedOptions[0].text;
        return texto.split('[')[0].trim();
    }
    
    _obterValorSelect(id, padrao = 0, numero = false) {
        const select = document.getElementById(id);
        if (!select) return padrao;
        const valor = select.value;
        return numero ? parseInt(valor) : valor;
    }
    
    _obterAvatarUrl() {
        const img = document.getElementById('fotoPreview');
        if (img && img.style.display !== 'none') {
            return img.src;
        }
        return '';
    }

    _obterPontosTotais() {
        const input = document.getElementById('pontosTotaisDashboard');
        if (input) return parseInt(input.value) || 150;
        
        const display = document.getElementById('pontosTotais');
        if (display) return this._obterNumeroTexto('pontosTotais', 150);
        
        return 150;
    }
    
    _obterPontosGastos() {
        const display = document.getElementById('pontosGastosDashboard');
        if (display) return this._obterNumeroTexto('pontosGastosDashboard', 0);
        
        const display2 = document.getElementById('pontosGastos');
        if (display2) return this._obterNumeroTexto('pontosGastos', 0);
        
        return 0;
    }
    
    _obterPontosDisponiveis() {
        const display = document.getElementById('saldoDisponivelDashboard');
        if (display) return this._obterNumeroTexto('saldoDisponivelDashboard', 150);
        
        const display2 = document.getElementById('pontosSaldo');
        if (display2) return this._obterNumeroTexto('pontosSaldo', 150);
        
        return 150;
    }
    
    _obterLimiteDesvantagens() {
        const input = document.getElementById('limiteDesvantagens');
        if (input) return parseInt(input.value) || -50;
        return -50;
    }
    
    _obterDesvantagensAtuais() {
        const display = document.getElementById('desvantagensAtuais');
        if (display) return this._obterNumeroTexto('desvantagensAtuais', 0);
        return 0;
    }
    
    _obterDinheiro(id, padrao = 0) {
        const el = document.getElementById(id);
        if (!el) return padrao;
        const texto = el.textContent || el.value || '$0';
        const valor = texto.replace('$', '').replace(/\./g, '').replace(',', '.');
        const num = parseFloat(valor);
        return isNaN(num) ? padrao : num;
    }

    // ======================
    // MÉTODOS DE COLETA DE LISTAS (MESMO DO SEU CÓDIGO)
    // ======================
    _coletarIdiomasArray() {
        try {
            const container = document.getElementById('listaIdiomasAdicionais');
            if (!container) return [];
            
            const itens = container.querySelectorAll('.idioma-adicional-item');
            if (itens.length === 0) return [];
            
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
            
            return idiomas;
        } catch (error) {
            console.error('Erro ao coletar idiomas:', error);
            return [];
        }
    }
    
    _coletarCaracteristicasFisicasArray() {
        try {
            const container = document.getElementById('caracteristicasSelecionadas');
            if (!container) return [];
            
            const itens = container.querySelectorAll('.caracteristica-selecionada-item');
            if (itens.length === 0) return [];
            
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
            
            return caracteristicas;
        } catch (error) {
            console.error('Erro ao coletar características:', error);
            return [];
        }
    }
    
    _coletarVantagensArray() {
        try {
            const lista = document.getElementById('vantagens-adquiridas');
            if (!lista) return [];
            
            const itens = lista.querySelectorAll('.item-adquirido, [data-vantagem-id]');
            if (itens.length === 0) return [];
            
            const vantagens = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.nome-vantagem, .nome-item')?.textContent?.trim();
                const pontosTexto = item.querySelector('.custo-vantagem, .pontos-item')?.textContent?.trim();
                const pontos = parseInt(pontosTexto?.match(/-?\d+/)?.[0]) || 0;
                const id = item.getAttribute('data-vantagem-id') || item.getAttribute('data-id') || nome;
                
                if (nome && nome !== '' && nome !== 'Nenhuma vantagem adquirida') {
                    vantagens.push({
                        id: id,
                        nome: nome,
                        pontos: pontos
                    });
                }
            });
            
            return vantagens;
        } catch (error) {
            console.error('Erro ao coletar vantagens:', error);
            return [];
        }
    }
    
    _contarVantagens() {
        return this._coletarVantagensArray().length;
    }
    
    _calcularPontosVantagens() {
        return this._coletarVantagensArray().reduce((total, v) => total + (v.pontos || 0), 0);
    }
    
    _coletarDesvantagensArray() {
        try {
            const lista = document.getElementById('desvantagens-adquiridas');
            if (!lista) return [];
            
            const itens = lista.querySelectorAll('.item-adquirido, [data-desvantagem-id]');
            if (itens.length === 0) return [];
            
            const desvantagens = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.nome-desvantagem, .nome-item')?.textContent?.trim();
                const pontosTexto = item.querySelector('.custo-desvantagem, .pontos-item')?.textContent?.trim();
                const pontos = parseInt(pontosTexto?.match(/-?\d+/)?.[0]) || 0;
                const id = item.getAttribute('data-desvantagem-id') || item.getAttribute('data-id') || nome;
                
                if (nome && nome !== '' && nome !== 'Nenhuma desvantagem adquirida') {
                    desvantagens.push({
                        id: id,
                        nome: nome,
                        pontos: pontos
                    });
                }
            });
            
            return desvantagens;
        } catch (error) {
            console.error('Erro ao coletar desvantagens:', error);
            return [];
        }
    }
    
    _contarDesvantagens() {
        return this._coletarDesvantagensArray().length;
    }
    
    _calcularPontosDesvantagens() {
        return this._coletarDesvantagensArray().reduce((total, d) => total + (Math.abs(d.pontos) || 0), 0);
    }
    
    _coletarPeculiaridadesArray() {
        try {
            const lista = document.getElementById('lista-peculiaridades');
            if (!lista) return [];
            
            const itens = lista.querySelectorAll('.peculiaridade-item');
            if (itens.length === 0) return [];
            
            const peculiaridades = [];
            
            itens.forEach(item => {
                const texto = item.querySelector('.peculiaridade-texto')?.textContent?.trim();
                
                if (texto && texto !== '' && texto !== 'Nenhuma peculiaridade adicionada') {
                    peculiaridades.push({
                        texto: texto
                    });
                }
            });
            
            return peculiaridades;
        } catch (error) {
            console.error('Erro ao coletar peculiaridades:', error);
            return [];
        }
    }
    
    _contarPeculiaridades() {
        return this._coletarPeculiaridadesArray().length;
    }
    
    _calcularPontosPeculiaridades() {
        return this._coletarPeculiaridadesArray().length * -1;
    }
    
    _coletarPericiasArray() {
        try {
            const lista = document.getElementById('pericias-aprendidas');
            if (!lista) return [];
            
            const itens = lista.querySelectorAll('.pericia-adquirida, [data-pericia-id]');
            if (itens.length === 0) return [];
            
            const pericias = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.pericia-nome, .nome-pericia')?.textContent?.trim();
                const nivel = parseInt(item.querySelector('.pericia-nivel, .nivel-pericia')?.textContent) || 0;
                const pontos = parseInt(item.getAttribute('data-pontos')) || 0;
                const atributo = item.getAttribute('data-atributo') || 'DX';
                const id = item.getAttribute('data-pericia-id') || nome;
                
                if (nome && nome !== '' && nome !== 'Nenhuma perícia aprendida') {
                    pericias.push({
                        id: id,
                        nome: nome,
                        nivel: nivel,
                        pontos: pontos,
                        atributo: atributo,
                        especializacao: item.getAttribute('data-especializacao') || ''
                    });
                }
            });
            
            return pericias;
        } catch (error) {
            console.error('Erro ao coletar perícias:', error);
            return [];
        }
    }
    
    _contarPericias() {
        return this._coletarPericiasArray().length;
    }
    
    _calcularPontosPericias() {
        return this._coletarPericiasArray().reduce((total, p) => total + (p.pontos || 0), 0);
    }
    
    _coletarResumoPericias() {
        try {
            const resumo = {
                dx: this._obterNumeroTexto('qtd-dx', 0),
                iq: this._obterNumeroTexto('qtd-iq', 0),
                ht: this._obterNumeroTexto('qtd-ht', 0),
                perc: this._obterNumeroTexto('qtd-perc', 0),
                total: this._obterNumeroTexto('qtd-total', 0)
            };
            return resumo;
        } catch (error) {
            return {};
        }
    }
    
    _coletarTecnicasArray() {
        try {
            const lista = document.getElementById('tecnicas-aprendidas');
            if (!lista) return [];
            
            const itens = lista.querySelectorAll('.tecnica-adquirida, [data-tecnica-id]');
            if (itens.length === 0) return [];
            
            const tecnicas = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.tecnica-nome, .nome-tecnica')?.textContent?.trim();
                const pontos = parseInt(item.getAttribute('data-pontos')) || 0;
                const periciaBase = item.getAttribute('data-pericia') || '';
                const dificuldade = item.getAttribute('data-dificuldade') || 'Média';
                const id = item.getAttribute('data-tecnica-id') || nome;
                
                if (nome && nome !== '' && nome !== 'Nenhuma técnica aprendida') {
                    tecnicas.push({
                        id: id,
                        nome: nome,
                        pontos: pontos,
                        periciaBase: periciaBase,
                        dificuldade: dificuldade
                    });
                }
            });
            
            return tecnicas;
        } catch (error) {
            console.error('Erro ao coletar técnicas:', error);
            return [];
        }
    }
    
    _contarTecnicas() {
        return this._coletarTecnicasArray().length;
    }
    
    _calcularPontosTecnicas() {
        return this._coletarTecnicasArray().reduce((total, t) => total + (t.pontos || 0), 0);
    }
    
    _coletarMagiasArray() {
        try {
            const lista = document.getElementById('magias-aprendidas');
            if (!lista) return [];
            
            const itens = lista.querySelectorAll('.magia-adquirida, [data-magia-id]');
            if (itens.length === 0) return [];
            
            const magias = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.magia-nome, .nome-magia')?.textContent?.trim();
                const nivel = parseInt(item.querySelector('.magia-nivel, .nivel-magia')?.textContent) || 0;
                const pontos = parseInt(item.getAttribute('data-pontos')) || 0;
                const escola = item.getAttribute('data-escola') || '';
                const classe = item.getAttribute('data-classe') || 'Comum';
                const id = item.getAttribute('data-magia-id') || nome;
                
                if (nome && nome !== '' && nome !== 'Nenhuma magia aprendida') {
                    magias.push({
                        id: id,
                        nome: nome,
                        nivel: nivel,
                        pontos: pontos,
                        escola: escola,
                        classe: classe
                    });
                }
            });
            
            return magias;
        } catch (error) {
            console.error('Erro ao coletar magias:', error);
            return [];
        }
    }
    
    _contarMagias() {
        return this._coletarMagiasArray().length;
    }
    
    _calcularPontosMagias() {
        return this._coletarMagiasArray().reduce((total, m) => total + (m.pontos || 0), 0);
    }
    
    _coletarEscolasMagia() {
        try {
            const checkboxes = document.querySelectorAll('.escola-checkbox:checked');
            const escolas = Array.from(checkboxes).map(cb => cb.id.replace('escola-', ''));
            return escolas;
        } catch (error) {
            return [];
        }
    }
    
    _coletarEquipamentosArray() {
        try {
            const lista = document.getElementById('lista-equipamentos-adquiridos');
            if (!lista) return [];
            
            const itens = lista.querySelectorAll('.equipamento-adquirido, .item-inventario, [data-item-id]');
            if (itens.length === 0) return [];
            
            const equipamentos = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.equipamento-nome, .item-nome')?.textContent?.trim();
                const tipo = item.getAttribute('data-tipo') || item.querySelector('.item-tipo')?.textContent?.trim() || 'Equipamento';
                const peso = parseFloat(item.getAttribute('data-peso')) || parseFloat(item.querySelector('.item-peso')?.textContent) || 0;
                const custo = parseFloat(item.getAttribute('data-custo')) || parseFloat(item.querySelector('.item-valor')?.textContent) || 0;
                const equipado = item.classList.contains('equipado') || false;
                const id = item.getAttribute('data-item-id') || nome;
                
                if (nome && nome !== '' && nome !== 'Inventário Vazio') {
                    equipamentos.push({
                        id: id,
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
            
            return equipamentos;
        } catch (error) {
            console.error('Erro ao coletar equipamentos:', error);
            return [];
        }
    }
    
    _contarEquipamentos() {
        return this._coletarEquipamentosArray().length;
    }
    
    _calcularPesoTotalEquipamentos() {
        const equipamentos = this._coletarEquipamentosArray();
        return equipamentos.reduce((total, e) => total + (e.peso || 0) * (e.quantidade || 1), 0);
    }
    
    _coletarResistenciaDano() {
        try {
            const partes = ['cabeca', 'tronco', 'rosto', 'cranio', 'pescoco', 'virilha', 'bracos', 'pernas', 'maos', 'pes'];
            const rd = {};
            
            partes.forEach(parte => {
                const input = document.querySelector(`.rd-parte[data-parte="${parte}"] input`);
                if (input) {
                    rd[parte] = parseInt(input.value) || 0;
                }
            });
            
            rd.total = this._obterNumeroTexto('rdTotal', 0);
            
            return rd;
        } catch (error) {
            return {};
        }
    }
    
    _coletarDadosEscudo() {
        try {
            return {
                equipado: document.getElementById('escudoEquipado')?.checked || false,
                nome: this._obterTexto('escudoNome', 'Nenhum escudo equipado'),
                dr: this._obterNumeroTexto('escudoDR', 0),
                pv_atual: this._obterNumeroTexto('escudo_pv_atual', 0),
                pv_maximo: this._obterNumeroTexto('escudo_pv_maximo', 0),
                status: this._obterTexto('escudoStatus', 'Inativo')
            };
        } catch (error) {
            return {
                equipado: false,
                nome: 'Nenhum escudo equipado',
                dr: 0,
                status: 'Inativo'
            };
        }
    }
    
    _coletarCondicoesCombate() {
        try {
            const condicoes = document.querySelectorAll('.condicao-item');
            const ativas = [];
            
            condicoes.forEach(condicao => {
                if (condicao.classList.contains('ativa')) {
                    ativas.push(condicao.getAttribute('data-condicao'));
                }
            });
            
            return {
                ativas: ativas,
                total: ativas.length
            };
        } catch (error) {
            return {
                ativas: [],
                total: 0
            };
        }
    }

    // ======================
    // MÉTODOS DE FALLBACK
    // ======================
    _coletarDadosMinimos() {
        console.warn('⚠️ Usando fallback de dados mínimos');
        
        return {
            basicos: {
                nome: document.getElementById('charName')?.value || 'Novo Personagem',
                raca: document.getElementById('racaPersonagem')?.value || 'Humano',
                classe: document.getElementById('classePersonagem')?.value || 'Guerreiro',
                status: 'Ativo'
            },
            atributos: {
                principais: {
                    forca: 10,
                    destreza: 10,
                    inteligencia: 10,
                    saude: 10
                }
            },
            pontos: {
                totais: 150,
                gastos: 0,
                disponiveis: 150
            },
            metadata: {
                coletado_em: new Date().toISOString(),
                erro: true,
                mensagem: 'Falha na coleta completa'
            }
        };
    }

    // ======================
    // MÉTODOS PÚBLICOS
    // ======================
    obterDadosBasicos() {
        return this._coletarDadosBasicos();
    }
    
    obterDadosParaSupabase() {
        const dadosCompletos = this.coletarTodosDados();
        
        // Converter para formato do Supabase
        return {
            nome: dadosCompletos.basicos.nome,
            raca: dadosCompletos.basicos.raca,
            classe: dadosCompletos.basicos.classe,
            nivel: dadosCompletos.basicos.nivel,
            descricao: dadosCompletos.basicos.descricao,
            
            // Atributos
            forca: dadosCompletos.atributos.principais.forca,
            destreza: dadosCompletos.atributos.principais.destreza,
            inteligencia: dadosCompletos.atributos.principais.inteligencia,
            saude: dadosCompletos.atributos.principais.saude,
            
            // Pontos
            pontos_totais: dadosCompletos.pontos.totais,
            pontos_gastos: dadosCompletos.pontos.gastos,
            pontos_disponiveis: dadosCompletos.pontos.disponiveis,
            
            // JSON fields
            caracteristicas: JSON.stringify(dadosCompletos.caracteristicas),
            vantagens: JSON.stringify(dadosCompletos.vantagensDesvantagens.vantagens),
            desvantagens: JSON.stringify(dadosCompletos.vantagensDesvantagens.desvantagens),
            peculiaridades: JSON.stringify(dadosCompletos.vantagensDesvantagens.peculiaridades),
            pericias: JSON.stringify(dadosCompletos.periciasTecnicas.pericias),
            tecnicas: JSON.stringify(dadosCompletos.periciasTecnicas.tecnicas),
            magias: JSON.stringify(dadosCompletos.magias.magias),
            equipamentos: JSON.stringify(dadosCompletos.equipamentos.itens),
            combate: JSON.stringify(dadosCompletos.combate),
            
            // Totais
            total_vantagens: dadosCompletos.vantagensDesvantagens.total_vantagens,
            total_desvantagens: dadosCompletos.vantagensDesvantagens.total_desvantagens,
            total_peculiaridades: dadosCompletos.vantagensDesvantagens.total_peculiaridades,
            total_pericias: dadosCompletos.periciasTecnicas.total_pericias,
            total_tecnicas: dadosCompletos.periciasTecnicas.total_tecnicas,
            total_magias: dadosCompletos.magias.total_magias,
            
            // Status
            status: 'Ativo',
            updated_at: new Date().toISOString()
        };
    }
    
    testarColeta() {
        console.log('🧪 TESTANDO COLETA COMPLETA...');
        
        try {
            const dados = this.coletarTodosDados();
            
            const resumo = `
✅ TESTE DE COLETA REALIZADO!

📊 RESUMO:
• Nome: ${dados.basicos.nome}
• Atributos: ST${dados.atributos.principais.forca}/DX${dados.atributos.principais.destreza}/IQ${dados.atributos.principais.inteligencia}/HT${dados.atributos.principais.saude}
• Pontos: ${dados.pontos.gastos}/${dados.pontos.totais} (saldo: ${dados.pontos.disponiveis})
• Vantagens: ${dados.vantagensDesvantagens.total_vantagens}
• Desvantagens: ${dados.vantagensDesvantagens.total_desvantagens}
• Perícias: ${dados.periciasTecnicas.total_pericias}
• Magias: ${dados.magias.total_magias}
• Equipamentos: ${dados.equipamentos.total_itens}

📋 Verifique o console para detalhes completos.`;
            
            alert(resumo);
            console.log('📦 DADOS COMPLETOS COLETADOS:', dados);
            
            return dados;
            
        } catch (error) {
            console.error('❌ Teste falhou:', error);
            alert('❌ Erro no teste de coleta:\n' + error.message);
            return null;
        }
    }
}

// ======================
// INICIALIZAÇÃO GLOBAL
// ======================
let coletor;

try {
    coletor = new ColetorDados();
    window.coletor = coletor;
    
    console.log('✅✅✅ COLETOR DE DADOS SUPER CARREGADO! ✅✅✅');
    
    // Adicionar função de teste global
    window.testeColetorCompleto = function() {
        if (window.coletor && typeof window.coletor.testarColeta === 'function') {
            return window.coletor.testarColeta();
        } else {
            alert('❌ Coletor não disponível!');
            return null;
        }
    };
    
} catch (error) {
    console.error('❌ Erro ao carregar coletor:', error);
    
    // Fallback básico
    coletor = {
        coletarTodosDados: () => {
            console.warn('Coletor não disponível - retornando dados básicos');
            return {
                nome: document.getElementById('charName')?.value || 'Novo Personagem',
                pontos_totais: 150,
                pontos_gastos: 0,
                forca: 10,
                destreza: 10,
                inteligencia: 10,
                saude: 10
            };
        },
        obterDadosBasicos: () => ({
            nome: document.getElementById('charName')?.value || 'Novo Personagem',
            classe: document.getElementById('classePersonagem')?.value || '',
            raca: document.getElementById('racaPersonagem')?.value || ''
        })
    };
    
    window.coletor = coletor;
}
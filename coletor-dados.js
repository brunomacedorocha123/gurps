// coletor-dados-completo.js
class ColetorDados {
    constructor() {
        this.sistemas = {};
        this._configurarSistemas();
    }

    // ======================
    // CONFIGURAÇÃO INICIAL
    // ======================
    _configurarSistemas() {
        this.sistemas = {
            atributos: { disponivel: typeof window.atributos !== 'undefined' },
            dashboard: { disponivel: typeof window.dashboard !== 'undefined' },
            vantagens: { disponivel: typeof window.vantagens !== 'undefined' },
            pericias: { disponivel: typeof window.pericias !== 'undefined' },
            magias: { disponivel: typeof window.magias !== 'undefined' },
            equipamentos: { disponivel: typeof window.equipamentos !== 'undefined' },
            combate: { disponivel: typeof window.combate !== 'undefined' },
            caracteristicas: { disponivel: document.getElementById('nivelAparencia') !== null }
        };
    }

    // ======================
    // MÉTODO PRINCIPAL - COLETA TUDO
    // ======================
    coletarTodosDados() {
        try {
            const dados = {};
            
            dados.basicos = this._coletarDadosBasicos();
            dados.atributos = this._coletarAtributosCompletos();
            dados.pontos = this._coletarSistemaPontos();
            dados.caracteristicas = this._coletarCaracteristicasCompletas();
            dados.vantagensDesvantagens = this._coletarVantagensDesvantagensCompleto();
            dados.periciasTecnicas = this._coletarPericiasTecnicasCompleto();
            dados.magias = this._coletarMagiasCompleto();
            dados.equipamentos = this._coletarEquipamentosCompleto();
            dados.combate = this._coletarCombateCompleto();
            dados.relacionamentos = this._coletarRelacionamentos();
            
            dados.metadata = {
                coletado_em: new Date().toISOString(),
                versao: '1.0.0'
            };
            
            return dados;
            
        } catch (error) {
            console.error('Erro na coleta completa:', error);
            return this._coletarDadosMinimos();
        }
    }

    // ======================
    // COLETA DE DADOS BÁSICOS
    // ======================
    _coletarDadosBasicos() {
        return {
            nome: this._obterValor('charName', 'Novo Personagem'),
            raca: this._obterValor('racaPersonagem', 'Humano'),
            classe: this._obterValor('classePersonagem', 'Guerreiro'),
            nivel: this._obterValor('nivelPersonagem', 'Novato'),
            descricao: this._obterValor('descricaoPersonagem', ''),
            avatar_url: this._obterAvatarUrl(),
            status: 'Ativo'
        };
    }

    // ======================
    // ATRIBUTOS
    // ======================
    _coletarAtributosCompletos() {
        return {
            principais: {
                forca: this._obterNumero('ST', 10),
                destreza: this._obterNumero('DX', 10),
                inteligencia: this._obterNumero('IQ', 10),
                saude: this._obterNumero('HT', 10)
            },
            secundarios: {
                pontos_vida: this._obterNumero('PVTotal', 10),
                pontos_fadiga: this._obterNumero('PFTotal', 10),
                vontade: this._obterNumero('VontadeTotal', 10),
                percepcao: this._obterNumero('PercepcaoTotal', 10),
                deslocamento: this._obterNumero('DeslocamentoTotal', 5.00, true)
            },
            dano: {
                gdp: this._obterTexto('danoGDP', '1d-2'),
                geb: this._obterTexto('danoGEB', '1d')
            },
            custos: {
                forca: this._obterCustoAtributo('ST'),
                destreza: this._obterCustoAtributo('DX'),
                inteligencia: this._obterCustoAtributo('IQ'),
                saude: this._obterCustoAtributo('HT')
            }
        };
    }

    // ======================
    // SISTEMA DE PONTOS
    // ======================
    _coletarSistemaPontos() {
        return {
            totais: this._obterPontosTotais(),
            gastos: this._obterPontosGastos(),
            disponiveis: this._obterPontosDisponiveis(),
            limite_desvantagens: this._obterLimiteDesvantagens(),
            desvantagens_atuais: this._obterDesvantagensAtuais(),
            resumo: this._coletarResumoGastos()
        };
    }

    // ======================
    // CARACTERÍSTICAS
    // ======================
    _coletarCaracteristicasCompletas() {
        return {
            aparencia: {
                nivel: this._obterTextoSelect('nivelAparencia'),
                custo: this._obterValorSelect('nivelAparencia', 0, true)
            },
            riqueza: {
                nivel: this._obterTextoSelect('nivelRiqueza'),
                custo: this._obterValorSelect('nivelRiqueza', 0, true),
                renda: this._obterTexto('rendaMensal', '$1.000')
            },
            fisicas: {
                altura: this._obterNumero('altura', 1.70, true),
                peso: this._obterNumero('peso', 70),
                caracteristicas: this._coletarCaracteristicasFisicasArray(),
                idiomas: this._coletarIdiomasArray()
            }
        };
    }

    // ======================
    // VANTAGENS, DESVANTAGENS E PECULIARIDADES
    // ======================
    _coletarVantagensDesvantagensCompleto() {
        return {
            vantagens: this._coletarListaVantagens(),
            desvantagens: this._coletarListaDesvantagens(),
            peculiaridades: this._coletarListaPeculiaridades(),
            
            totais: {
                vantagens: this._contarItens('vantagens-adquiridas'),
                desvantagens: this._contarItens('desvantagens-adquiridas'),
                peculiaridades: this._contarItens('lista-peculiaridades')
            },
            
            pontos: {
                vantagens: this._calcularPontosVantagens(),
                desvantagens: this._calcularPontosDesvantagens(),
                peculiaridades: this._calcularPontosPeculiaridades()
            }
        };
    }

    // ======================
    // PERÍCIAS E TÉCNICAS
    // ======================
    _coletarPericiasTecnicasCompleto() {
        return {
            pericias: this._coletarListaPericias(),
            tecnicas: this._coletarListaTecnicas(),
            
            totais: {
                pericias: this._contarItens('pericias-aprendidas'),
                tecnicas: this._contarItens('tecnicas-aprendidas')
            },
            
            pontos: {
                pericias: this._calcularPontosPericias(),
                tecnicas: this._calcularPontosTecnicas()
            },
            
            resumo: this._coletarResumoPericias()
        };
    }

    // ======================
    // MAGIAS
    // ======================
    _coletarMagiasCompleto() {
        return {
            status: {
                aptidao_magica: this._obterNumero('aptidao-magica', 0),
                mana_atual: this._obterNumero('mana-atual', 10),
                mana_base: this._obterNumero('mana-base', 10),
                bonus_mana: this._obterNumero('bonus-mana', 0)
            },
            magias: this._coletarListaMagias(),
            total_magias: this._contarItens('magias-aprendidas'),
            pontos_magias: this._calcularPontosMagias(),
            escolas: this._coletarEscolasMagia()
        };
    }

    // ======================
    // EQUIPAMENTOS
    // ======================
    _coletarEquipamentosCompleto() {
        return {
            financeiro: {
                dinheiro: this._obterDinheiro(),
                renda: this._obterTexto('rendaMensal', '$1.000')
            },
            carga: {
                peso_atual: this._obterNumero('pesoAtual', 0, true),
                peso_maximo: this._obterNumero('pesoMaximo', 60, true),
                nivel: this._obterTexto('nivelCarga', 'LEVE')
            },
            itens: this._coletarListaEquipamentos(),
            total_itens: this._contarItens('lista-equipamentos-adquiridos'),
            peso_total: this._calcularPesoTotalEquipamentos()
        };
    }

    // ======================
    // COMBATE
    // ======================
    _coletarCombateCompleto() {
        return {
            vitalidade: {
                pv_atual: this._obterNumero('pvAtualDisplay', 10),
                pv_maximo: this._obterNumero('pvMaxDisplay', 10),
                pf_atual: this._obterNumero('pfAtualDisplay', 10),
                pf_maximo: this._obterNumero('pfMaxDisplay', 10)
            },
            defesas: {
                esquiva: this._obterNumero('esquivaTotal', 10),
                bloqueio: this._obterNumero('bloqueioTotal', 11),
                aparar: this._obterNumero('apararTotal', 3)
            },
            resistencia_dano: this._coletarResistenciaDano(),
            escudo: this._coletarDadosEscudo(),
            condicoes: this._coletarCondicoesCombate()
        };
    }

    // ======================
    // RELACIONAMENTOS
    // ======================
    _coletarRelacionamentos() {
        return {
            inimigos: this._coletarListaRelacionamentos('listaInimigos'),
            aliados: this._coletarListaRelacionamentos('listaAliados'),
            dependentes: this._coletarListaRelacionamentos('listaDependentes')
        };
    }

    // ======================
    // MÉTODOS AUXILIARES PRINCIPAIS
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
    
    _obterTexto(id, padrao = '') {
        return this._obterValor(id, padrao);
    }
    
    _obterTextoSelect(id) {
        const select = document.getElementById(id);
        if (!select || !select.selectedOptions[0]) return '';
        return select.selectedOptions[0].text.split('[')[0].trim();
    }
    
    _obterValorSelect(id, padrao = 0, numero = false) {
        const select = document.getElementById(id);
        if (!select) return padrao;
        return numero ? parseInt(select.value) : select.value;
    }

    _obterAvatarUrl() {
        const img = document.getElementById('fotoPreview');
        return img && img.style.display !== 'none' ? img.src : '';
    }

    _obterPontosTotais() {
        return this._obterNumero('pontosTotaisDashboard', 150) ||
               this._obterNumero('pontosTotais', 150);
    }
    
    _obterPontosGastos() {
        return this._obterNumero('pontosGastosDashboard', 0) ||
               this._obterNumero('pontosGastos', 0);
    }
    
    _obterPontosDisponiveis() {
        return this._obterNumero('saldoDisponivelDashboard', 150) ||
               this._obterNumero('pontosSaldo', 150);
    }
    
    _obterLimiteDesvantagens() {
        return this._obterNumero('limiteDesvantagens', -50);
    }
    
    _obterDesvantagensAtuais() {
        return this._obterNumero('desvantagensAtuais', 0);
    }
    
    _obterDinheiro() {
        try {
            const el = document.getElementById('dinheiroEquipamento') || 
                      document.getElementById('dinheiro-disponivel');
            if (!el) return 2000.00;
            
            const texto = el.textContent || el.value || '$2000';
            const valor = texto.replace('$', '').replace(/\./g, '').replace(',', '.');
            const num = parseFloat(valor);
            return isNaN(num) ? 2000.00 : num;
        } catch (error) {
            return 2000.00;
        }
    }

    _obterCustoAtributo(atributo) {
        const custoEl = document.getElementById(`custo${atributo}`);
        return custoEl ? parseInt(custoEl.textContent) || 0 : 0;
    }

    // ======================
    // COLETORES DE LISTAS
    // ======================
    _coletarListaVantagens() {
        return this._coletarListaGenerica(
            'vantagens-adquiridas',
            '.item-adquirido, [data-vantagem-id], .item-lista',
            '.item-nome, .nome-vantagem, .nome-item, h4',
            '.item-custo, .custo-vantagem, .pontos-item, span'
        );
    }

    _coletarListaDesvantagens() {
        return this._coletarListaGenerica(
            'desvantagens-adquiridas',
            '.item-adquirido, [data-desvantagem-id], .item-lista',
            '.item-nome, .nome-desvantagem, .nome-item, h4',
            '.item-custo, .custo-desvantagem, .pontos-item, span'
        );
    }

    _coletarListaPericias() {
        const lista = document.getElementById('pericias-aprendidas');
        if (!lista) return [];
        
        const itens = lista.querySelectorAll('.pericia-adquirida, [data-pericia-id], .item-lista');
        const pericias = [];
        
        itens.forEach(item => {
            const nome = item.querySelector('.pericia-nome, .nome-pericia, .item-nome, h4')?.textContent?.trim();
            const nivel = parseInt(item.querySelector('.pericia-nivel, .nivel-pericia')?.textContent) || 0;
            
            if (nome && nome !== 'Nenhuma perícia aprendida') {
                pericias.push({
                    nome: nome,
                    nivel: nivel,
                    pontos: parseInt(item.getAttribute('data-pontos')) || 0,
                    atributo: item.getAttribute('data-atributo') || 'DX',
                    especializacao: item.getAttribute('data-especializacao') || ''
                });
            }
        });
        
        return pericias;
    }

    _coletarListaMagias() {
        const lista = document.getElementById('magias-aprendidas');
        if (!lista) return [];
        
        const itens = lista.querySelectorAll('.magia-adquirida, [data-magia-id], .item-lista');
        const magias = [];
        
        itens.forEach(item => {
            const nome = item.querySelector('.magia-nome, .nome-magia, .item-nome, h4')?.textContent?.trim();
            const nivel = parseInt(item.querySelector('.magia-nivel, .nivel-magia')?.textContent) || 0;
            
            if (nome && nome !== 'Nenhuma magia aprendida') {
                magias.push({
                    nome: nome,
                    nivel: nivel,
                    pontos: parseInt(item.getAttribute('data-pontos')) || 0,
                    escola: item.getAttribute('data-escola') || '',
                    classe: item.getAttribute('data-classe') || 'Comum'
                });
            }
        });
        
        return magias;
    }

    _coletarListaTecnicas() {
        const lista = document.getElementById('tecnicas-aprendidas');
        if (!lista) return [];
        
        const itens = lista.querySelectorAll('.tecnica-adquirida, [data-tecnica-id], .item-lista');
        const tecnicas = [];
        
        itens.forEach(item => {
            const nome = item.querySelector('.tecnica-nome, .nome-tecnica, .item-nome, h4')?.textContent?.trim();
            
            if (nome && nome !== 'Nenhuma técnica aprendida') {
                tecnicas.push({
                    nome: nome,
                    pontos: parseInt(item.getAttribute('data-pontos')) || 0,
                    periciaBase: item.getAttribute('data-pericia') || '',
                    dificuldade: item.getAttribute('data-dificuldade') || 'Média'
                });
            }
        });
        
        return tecnicas;
    }

    _coletarListaEquipamentos() {
        const lista = document.getElementById('lista-equipamentos-adquiridos');
        if (!lista) return [];
        
        const itens = lista.querySelectorAll('.equipamento-adquirido, .item-inventario, [data-item-id], .item-lista');
        const equipamentos = [];
        
        itens.forEach(item => {
            const nome = item.querySelector('.equipamento-nome, .item-nome, h4')?.textContent?.trim();
            
            if (nome && nome !== 'Inventário Vazio') {
                equipamentos.push({
                    nome: nome,
                    tipo: item.getAttribute('data-tipo') || 'Equipamento',
                    peso: parseFloat(item.getAttribute('data-peso')) || 0,
                    custo: parseFloat(item.getAttribute('data-custo')) || 0,
                    quantidade: parseInt(item.getAttribute('data-quantidade')) || 1,
                    equipado: item.classList.contains('equipado') || false
                });
            }
        });
        
        return equipamentos;
    }

    _coletarListaPeculiaridades() {
        const lista = document.getElementById('lista-peculiaridades');
        if (!lista) return [];
        
        const itens = lista.querySelectorAll('.peculiaridade-item, .item-lista');
        const peculiaridades = [];
        
        itens.forEach(item => {
            const texto = item.querySelector('.peculiaridade-texto')?.textContent?.trim();
            
            if (texto && texto !== '' && texto !== 'Nenhuma peculiaridade adicionada') {
                peculiaridades.push({ texto: texto });
            }
        });
        
        return peculiaridades;
    }

    _coletarListaRelacionamentos(idLista) {
        const lista = document.getElementById(idLista);
        if (!lista) return [];
        
        const itens = lista.querySelectorAll('.relacionamento-item, .item-lista');
        const relacionamentos = [];
        
        itens.forEach(item => {
            const nome = item.querySelector('.relacionamento-nome, .item-nome, h4')?.textContent?.trim();
            const tipo = item.querySelector('.relacionamento-tipo, .item-tipo')?.textContent?.trim();
            
            if (nome && nome !== 'Nenhum' && nome !== '') {
                relacionamentos.push({
                    nome: nome,
                    tipo: tipo || idLista.replace('lista', '').slice(0, -1),
                    descricao: item.querySelector('.relacionamento-descricao, .item-descricao')?.textContent?.trim() || ''
                });
            }
        });
        
        return relacionamentos;
    }

    _coletarCaracteristicasFisicasArray() {
        const container = document.getElementById('caracteristicasSelecionadas');
        if (!container) return [];
        
        const itens = container.querySelectorAll('.caracteristica-selecionada-item, .item-lista');
        const caracteristicas = [];
        
        itens.forEach(item => {
            const nome = item.querySelector('.caracteristica-nome, .item-nome')?.textContent?.trim();
            const pontosTexto = item.querySelector('.caracteristica-pontos, .item-custo')?.textContent?.trim();
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
    }

    _coletarIdiomasArray() {
        const container = document.getElementById('listaIdiomasAdicionais');
        if (!container) return [];
        
        const itens = container.querySelectorAll('.idioma-adicional-item, .item-lista');
        const idiomas = [];
        
        itens.forEach(item => {
            const nome = item.querySelector('.idioma-nome, .item-nome')?.textContent?.trim();
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
    }

    // ======================
    // MÉTODOS DE CÁLCULO
    // ======================
    _coletarListaGenerica(idLista, seletorItens, seletorNome, seletorPontos) {
        const lista = document.getElementById(idLista);
        if (!lista) return [];
        
        const itens = lista.querySelectorAll(seletorItens);
        const resultados = [];
        
        itens.forEach(item => {
            const nome = item.querySelector(seletorNome)?.textContent?.trim();
            const pontosTexto = item.querySelector(seletorPontos)?.textContent?.trim();
            const pontos = parseInt(pontosTexto?.match(/-?\d+/)?.[0]) || 0;
            
            if (nome && nome !== '' && !nome.includes('Nenhum')) {
                resultados.push({
                    nome: nome,
                    pontos: pontos,
                    id: item.getAttribute('data-id') || nome,
                    descricao: item.querySelector('.item-descricao')?.textContent?.trim() || ''
                });
            }
        });
        
        return resultados;
    }

    _contarItens(idLista) {
        const lista = document.getElementById(idLista);
        if (!lista) return 0;
        
        const itens = lista.querySelectorAll('.item-adquirido, .item-lista, [data-id]');
        let count = 0;
        
        itens.forEach(item => {
            const nome = item.querySelector('.item-nome, h4')?.textContent?.trim();
            if (nome && nome !== '' && !nome.includes('Nenhum')) {
                count++;
            }
        });
        
        return count;
    }

    _calcularPontosVantagens() {
        const vantagens = this._coletarListaVantagens();
        return vantagens.reduce((total, v) => total + (v.pontos || 0), 0);
    }

    _calcularPontosDesvantagens() {
        const desvantagens = this._coletarListaDesvantagens();
        return desvantagens.reduce((total, d) => total + Math.abs(d.pontos || 0), 0);
    }

    _calcularPontosPeculiaridades() {
        return this._coletarListaPeculiaridades().length * -1;
    }

    _calcularPontosPericias() {
        const pericias = this._coletarListaPericias();
        return pericias.reduce((total, p) => total + (p.pontos || 0), 0);
    }

    _calcularPontosTecnicas() {
        const tecnicas = this._coletarListaTecnicas();
        return tecnicas.reduce((total, t) => total + (t.pontos || 0), 0);
    }

    _calcularPontosMagias() {
        const magias = this._coletarListaMagias();
        return magias.reduce((total, m) => total + (m.pontos || 0), 0);
    }

    _calcularPesoTotalEquipamentos() {
        const equipamentos = this._coletarListaEquipamentos();
        return equipamentos.reduce((total, e) => total + (e.peso || 0) * (e.quantidade || 1), 0);
    }

    _coletarResumoGastos() {
        return {
            atributos: this._obterNumero('gastosAtributos', 0),
            vantagens: this._obterNumero('gastosVantagens', 0),
            pericias: this._obterNumero('gastosPericias', 0),
            magias: this._obterNumero('gastosMagias', 0),
            desvantagens: this._obterNumero('gastosDesvantagens', 0),
            total: this._obterNumero('gastosTotal', 0)
        };
    }

    _coletarResumoPericias() {
        return {
            dx: this._obterNumero('qtd-dx', 0),
            iq: this._obterNumero('qtd-iq', 0),
            ht: this._obterNumero('qtd-ht', 0),
            perc: this._obterNumero('qtd-perc', 0),
            total: this._obterNumero('qtd-total', 0)
        };
    }

    _coletarEscolasMagia() {
        const checkboxes = document.querySelectorAll('.escola-checkbox:checked');
        return Array.from(checkboxes).map(cb => cb.id.replace('escola-', ''));
    }

    _coletarResistenciaDano() {
        const partes = ['cabeca', 'tronco', 'rosto', 'cranio', 'pescoco', 'virilha', 'bracos', 'pernas', 'maos', 'pes'];
        const rd = {};
        
        partes.forEach(parte => {
            const input = document.querySelector(`.rd-parte[data-parte="${parte}"] input`);
            rd[parte] = input ? parseInt(input.value) || 0 : 0;
        });
        
        rd.total = this._obterNumero('rdTotal', 0);
        return rd;
    }

    _coletarDadosEscudo() {
        return {
            equipado: document.getElementById('escudoEquipado')?.checked || false,
            nome: this._obterTexto('escudoNome', 'Nenhum escudo equipado'),
            dr: this._obterNumero('escudoDR', 0),
            pv_atual: this._obterNumero('escudo_pv_atual', 0),
            pv_maximo: this._obterNumero('escudo_pv_maximo', 0),
            status: this._obterTexto('escudoStatus', 'Inativo')
        };
    }

    _coletarCondicoesCombate() {
        const condicoes = document.querySelectorAll('.condicao-item');
        const ativas = [];
        
        condicoes.forEach(condicao => {
            if (condicao.classList.contains('ativa')) {
                ativas.push(condicao.getAttribute('data-condicao'));
            }
        });
        
        return { ativas: ativas, total: ativas.length };
    }

    // ======================
    // MÉTODOS DE FALLBACK
    // ======================
    _coletarDadosMinimos() {
        return {
            basicos: this._coletarDadosBasicos(),
            atributos: { principais: { forca: 10, destreza: 10, inteligencia: 10, saude: 10 } },
            pontos: { totais: 150, gastos: 0, disponiveis: 150 },
            metadata: { coletado_em: new Date().toISOString(), erro: true }
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
        
        return {
            // Básicos
            nome: dadosCompletos.basicos.nome,
            raca: dadosCompletos.basicos.raca,
            classe: dadosCompletos.basicos.classe,
            nivel: dadosCompletos.basicos.nivel,
            descricao: dadosCompletos.basicos.descricao,
            avatar_url: dadosCompletos.basicos.avatar_url,
            
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
            relacionamentos: JSON.stringify(dadosCompletos.relacionamentos),
            
            // Totais
            total_vantagens: dadosCompletos.vantagensDesvantagens.totais.vantagens,
            total_desvantagens: dadosCompletos.vantagensDesvantagens.totais.desvantagens,
            total_pericias: dadosCompletos.periciasTecnicas.totais.pericias,
            total_magias: dadosCompletos.magias.total_magias,
            total_equipamentos: dadosCompletos.equipamentos.total_itens,
            
            // Status
            status: 'Ativo',
            updated_at: new Date().toISOString(),
            created_at: dadosCompletos.metadata.coletado_em
        };
    }
    
    testarColeta() {
        try {
            const dados = this.coletarTodosDados();
            return {
                sucesso: true,
                dados: dados,
                resumo: {
                    nome: dados.basicos.nome,
                    atributos: dados.atributos.principais,
                    pontos: dados.pontos,
                    vantagens: dados.vantagensDesvantagens.totais.vantagens,
                    desvantagens: dados.vantagensDesvantagens.totais.desvantagens,
                    pericias: dados.periciasTecnicas.totais.pericias,
                    magias: dados.magias.total_magias,
                    equipamentos: dados.equipamentos.total_itens
                }
            };
        } catch (error) {
            return { sucesso: false, erro: error.message };
        }
    }
}

// ======================
// INICIALIZAÇÃO GLOBAL
// ======================
window.coletor = new ColetorDados();

// Função de teste global (opcional)
window.testeColetorCompleto = function() {
    return window.coletor.testarColeta();
};
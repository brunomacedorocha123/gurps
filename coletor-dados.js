class ColetorDados {
    constructor() {
        this.sistemas = {};
        this._configurarSistemas();
    }

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
            dados.metadata = { coletado_em: new Date().toISOString() };
            return dados;
        } catch (error) {
            return this._coletarDadosMinimos();
        }
    }

    _coletarDadosBasicos() {
        return {
            nome: this._obterValor('charName', 'Novo Personagem'),
            raca: this._obterValor('racaPersonagem', 'Humano'),
            classe: this._obterValor('classePersonagem', 'Guerreiro'),
            nivel: this._obterValor('nivelPersonagem', 'Novato'),
            descricao: this._obterValor('descricaoPersonagem', ''),
            avatar_url: this._obterAvatarUrl()
        };
    }

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
            }
        };
    }

    _coletarSistemaPontos() {
        return {
            totais: this._obterPontosTotais(),
            gastos: this._obterPontosGastos(),
            disponiveis: this._obterPontosDisponiveis()
        };
    }

    _coletarCaracteristicasCompletas() {
        return {
            aparencia: {
                nivel: this._obterTextoSelect('nivelAparencia'),
                custo: this._obterValorSelect('nivelAparencia', 0, true)
            },
            riqueza: {
                nivel: this._obterTextoSelect('nivelRiqueza'),
                custo: this._obterValorSelect('nivelRiqueza', 0, true)
            },
            fisicas: {
                altura: this._obterNumero('altura', 1.70, true),
                peso: this._obterNumero('peso', 70)
            }
        };
    }

    _coletarVantagensDesvantagensCompleto() {
        return {
            vantagens: this._coletarVantagens(),
            desvantagens: this._coletarDesvantagens(),
            peculiaridades: this._coletarPeculiaridades()
        };
    }

    _coletarPericiasTecnicasCompleto() {
        return {
            pericias: this._coletarPericias(),
            tecnicas: this._coletarTecnicas()
        };
    }

    _coletarMagiasCompleto() {
        return {
            status: {
                mana_atual: this._obterNumero('mana-atual', 10),
                mana_base: this._obterNumero('mana-base', 10)
            },
            magias: this._coletarMagias()
        };
    }

    _coletarEquipamentosCompleto() {
        return {
            financeiro: { dinheiro: this._obterDinheiro() },
            carga: {
                peso_atual: this._obterNumero('pesoAtual', 0, true),
                peso_maximo: this._obterNumero('pesoMaximo', 60, true)
            },
            itens: this._coletarEquipamentos()
        };
    }

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
            }
        };
    }

    // ======================
    // MÉTODOS DE COLETA ESPECÍFICOS
    // ======================

    _coletarVantagens() {
        try {
            // FONTE 1: Do SistemaVantagens (se existir)
            if (window.sistemaVantagens && window.sistemaVantagens.vantagensAdquiridas) {
                return window.sistemaVantagens.vantagensAdquiridas.map(v => ({
                    nome: v.nome || '',
                    pontos: v.custo || 0,
                    id: v.id || v.baseId || v.nome
                }));
            }
            
            // FONTE 2: Do HTML
            const lista = document.getElementById('vantagens-adquiridas');
            if (!lista) return [];
            
            const itens = lista.querySelectorAll('.item-adquirido, .item-lista, [data-id]');
            const vantagens = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.item-nome, h4')?.textContent?.trim();
                if (nome && nome !== 'Nenhuma vantagem adquirida') {
                    const pontosTexto = item.querySelector('.item-custo, span')?.textContent?.trim();
                    const pontos = parseInt(pontosTexto?.match(/-?\d+/)?.[0]) || 0;
                    
                    vantagens.push({
                        nome: nome,
                        pontos: pontos,
                        id: item.getAttribute('data-id') || nome
                    });
                }
            });
            
            return vantagens;
        } catch (error) {
            return [];
        }
    }

    _coletarDesvantagens() {
        try {
            // FONTE 1: Do SistemaDesvantagens (se existir)
            if (window.sistemaDesvantagens && window.sistemaDesvantagens.desvantagensAdquiridas) {
                return window.sistemaDesvantagens.desvantagensAdquiridas.map(d => ({
                    nome: d.nome || '',
                    pontos: d.custo || 0,
                    id: d.id || d.baseId || d.nome
                }));
            }
            
            // FONTE 2: Do HTML
            const lista = document.getElementById('desvantagens-adquiridas');
            if (!lista) return [];
            
            const itens = lista.querySelectorAll('.item-adquirido, .item-lista, [data-id]');
            const desvantagens = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.item-nome, h4')?.textContent?.trim();
                if (nome && nome !== 'Nenhuma desvantagem adquirida') {
                    const pontosTexto = item.querySelector('.item-custo, span')?.textContent?.trim();
                    const pontos = parseInt(pontosTexto?.match(/-?\d+/)?.[0]) || 0;
                    
                    desvantagens.push({
                        nome: nome,
                        pontos: pontos,
                        id: item.getAttribute('data-id') || nome
                    });
                }
            });
            
            return desvantagens;
        } catch (error) {
            return [];
        }
    }

    _coletarPeculiaridades() {
        try {
            const lista = document.getElementById('lista-peculiaridades');
            if (!lista) return [];
            
            const itens = lista.querySelectorAll('.peculiaridade-item');
            const peculiaridades = [];
            
            itens.forEach(item => {
                const texto = item.querySelector('.peculiaridade-texto')?.textContent?.trim();
                if (texto && texto !== 'Nenhuma peculiaridade adicionada') {
                    peculiaridades.push({ texto: texto });
                }
            });
            
            return peculiaridades;
        } catch (error) {
            return [];
        }
    }

    _coletarPericias() {
        try {
            const lista = document.getElementById('pericias-aprendidas');
            if (!lista) return [];
            
            const itens = lista.querySelectorAll('.pericia-adquirida, .item-lista');
            const pericias = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.pericia-nome, .item-nome, h4')?.textContent?.trim();
                if (nome && nome !== 'Nenhuma perícia aprendida') {
                    const nivel = parseInt(item.querySelector('.pericia-nivel')?.textContent) || 0;
                    pericias.push({
                        nome: nome,
                        nivel: nivel,
                        pontos: parseInt(item.getAttribute('data-pontos')) || 0
                    });
                }
            });
            
            return pericias;
        } catch (error) {
            return [];
        }
    }

    _coletarTecnicas() {
        try {
            const lista = document.getElementById('tecnicas-aprendidas');
            if (!lista) return [];
            
            const itens = lista.querySelectorAll('.tecnica-adquirida, .item-lista');
            const tecnicas = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.tecnica-nome, .item-nome, h4')?.textContent?.trim();
                if (nome && nome !== 'Nenhuma técnica aprendida') {
                    tecnicas.push({
                        nome: nome,
                        pontos: parseInt(item.getAttribute('data-pontos')) || 0
                    });
                }
            });
            
            return tecnicas;
        } catch (error) {
            return [];
        }
    }

    _coletarMagias() {
        try {
            const lista = document.getElementById('magias-aprendidas');
            if (!lista) return [];
            
            const itens = lista.querySelectorAll('.magia-adquirida, .item-lista');
            const magias = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.magia-nome, .item-nome, h4')?.textContent?.trim();
                if (nome && nome !== 'Nenhuma magia aprendida') {
                    const nivel = parseInt(item.querySelector('.magia-nivel')?.textContent) || 0;
                    magias.push({
                        nome: nome,
                        nivel: nivel,
                        pontos: parseInt(item.getAttribute('data-pontos')) || 0
                    });
                }
            });
            
            return magias;
        } catch (error) {
            return [];
        }
    }

    _coletarEquipamentos() {
        try {
            const lista = document.getElementById('lista-equipamentos-adquiridos');
            if (!lista) return [];
            
            const itens = lista.querySelectorAll('.equipamento-adquirido, .item-inventario, .item-lista');
            const equipamentos = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.equipamento-nome, .item-nome, h4')?.textContent?.trim();
                if (nome && nome !== 'Inventário Vazio') {
                    equipamentos.push({
                        nome: nome,
                        tipo: item.getAttribute('data-tipo') || 'Equipamento',
                        peso: parseFloat(item.getAttribute('data-peso')) || 0,
                        equipado: item.classList.contains('equipado') || false
                    });
                }
            });
            
            return equipamentos;
        } catch (error) {
            return [];
        }
    }

    // ======================
    // MÉTODOS AUXILIARES
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

    // ======================
    // MÉTODOS DE FALLBACK
    // ======================

    _coletarDadosMinimos() {
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
                erro: true
            }
        };
    }

    // ======================
    // MÉTODOS PÚBLICOS
    // ======================

    obterDadosParaSupabase() {
        const dadosCompletos = this.coletarTodosDados();
        
        return {
            nome: dadosCompletos.basicos.nome,
            raca: dadosCompletos.basicos.raca,
            classe: dadosCompletos.basicos.classe,
            nivel: dadosCompletos.basicos.nivel,
            descricao: dadosCompletos.basicos.descricao,
            avatar_url: dadosCompletos.basicos.avatar_url,
            
            forca: dadosCompletos.atributos.principais.forca,
            destreza: dadosCompletos.atributos.principais.destreza,
            inteligencia: dadosCompletos.atributos.principais.inteligencia,
            saude: dadosCompletos.atributos.principais.saude,
            
            pontos_totais: dadosCompletos.pontos.totais,
            pontos_gastos: dadosCompletos.pontos.gastos,
            pontos_disponiveis: dadosCompletos.pontos.disponiveis,
            
            vantagens: JSON.stringify(dadosCompletos.vantagensDesvantagens.vantagens),
            desvantagens: JSON.stringify(dadosCompletos.vantagensDesvantagens.desvantagens),
            peculiaridades: JSON.stringify(dadosCompletos.vantagensDesvantagens.peculiaridades),
            pericias: JSON.stringify(dadosCompletos.periciasTecnicas.pericias),
            tecnicas: JSON.stringify(dadosCompletos.periciasTecnicas.tecnicas),
            magias: JSON.stringify(dadosCompletos.magias.magias),
            equipamentos: JSON.stringify(dadosCompletos.equipamentos.itens),
            combate: JSON.stringify(dadosCompletos.combate),
            
            status: 'Ativo',
            updated_at: new Date().toISOString()
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
                    vantagens: dados.vantagensDesvantagens.vantagens.length,
                    desvantagens: dados.vantagensDesvantagens.desvantagens.length,
                    pericias: dados.periciasTecnicas.pericias.length,
                    magias: dados.magias.magias.length,
                    equipamentos: dados.equipamentos.itens.length
                }
            };
        } catch (error) {
            return { sucesso: false, erro: error.message };
        }
    }
}

// INICIALIZAÇÃO
window.coletor = new ColetorDados();
window.testeColetorCompleto = () => window.coletor.testarColeta();
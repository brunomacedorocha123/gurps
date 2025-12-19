// coletor-dados-completo.js
class ColetorDados {
    constructor() {}

    coletarTodosDados() {
        const dados = {};
        
        dados.basicos = this._coletarDadosBasicos();
        dados.atributos = this._coletarAtributos();
        dados.pontos = this._coletarPontos();
        dados.vantagensDesvantagens = this._coletarVantagensDesvantagens();
        dados.periciasTecnicas = this._coletarPericiasTecnicas();
        dados.magias = this._coletarMagias();
        dados.equipamentos = this._coletarEquipamentos();
        dados.combate = this._coletarCombate();
        dados.caracteristicas = this._coletarCaracteristicas();
        
        return dados;
    }

    _coletarDadosBasicos() {
        return {
            nome: this._obterValor('charName', 'Novo Personagem'),
            raca: this._obterValor('racaPersonagem', ''),
            classe: this._obterValor('classePersonagem', ''),
            nivel: this._obterValor('nivelPersonagem', ''),
            descricao: this._obterValor('descricaoPersonagem', '')
        };
    }

    _coletarAtributos() {
        return {
            forca: this._obterNumero('ST', 10),
            destreza: this._obterNumero('DX', 10),
            inteligencia: this._obterNumero('IQ', 10),
            saude: this._obterNumero('HT', 10),
            pontos_vida: this._obterNumero('PVTotal', 10),
            pontos_fadiga: this._obterNumero('PFTotal', 10),
            vontade: this._obterNumero('VontadeTotal', 10),
            percepcao: this._obterNumero('PercepcaoTotal', 10),
            deslocamento: this._obterNumero('DeslocamentoTotal', 5.00, true)
        };
    }

    _coletarPontos() {
        return {
            totais: this._obterPontosTotais(),
            gastos: this._obterPontosGastos(),
            disponiveis: this._obterPontosDisponiveis()
        };
    }

    _coletarVantagensDesvantagens() {
        const vantagens = this._coletarListaVantagensDesvantagens('vantagens-adquiridas');
        const desvantagens = this._coletarListaVantagensDesvantagens('desvantagens-adquiridas');
        const peculiaridades = this._coletarPeculiaridades();

        return {
            vantagens: vantagens,
            total_vantagens: vantagens.reduce((sum, v) => sum + (v.pontos || 0), 0),
            desvantagens: desvantagens,
            total_desvantagens: desvantagens.reduce((sum, d) => sum + (d.pontos || 0), 0),
            peculiaridades: peculiaridades,
            total_peculiaridades: peculiaridades.reduce((sum, p) => sum + (p.pontos || 0), 0)
        };
    }

    _coletarListaVantagensDesvantagens(idLista) {
        const lista = document.getElementById(idLista);
        const itens = [];
        
        if (lista) {
            const elementos = lista.querySelectorAll('.vantagem-adquirida, .desvantagem-adquirida, .item-adquirido');
            
            elementos.forEach(elemento => {
                const nome = elemento.querySelector('.nome-vantagem, .nome-desvantagem, .item-nome')?.textContent?.trim();
                if (nome && nome !== '' && !nome.includes('Nenhuma')) {
                    const pontosTexto = elemento.querySelector('.custo-vantagem, .custo-desvantagem, .item-pontos')?.textContent?.trim();
                    const pontos = parseInt(pontosTexto?.replace(/[^\d-]/g, '')) || 0;
                    
                    itens.push({
                        nome: nome,
                        pontos: pontos,
                        tipo: elemento.getAttribute('data-tipo') || '',
                        descricao: elemento.querySelector('.descricao-vantagem, .descricao-desvantagem')?.textContent?.trim() || ''
                    });
                }
            });
        }
        
        return itens;
    }

    _coletarPeculiaridades() {
        const lista = document.getElementById('lista-peculiaridades');
        const peculiaridades = [];
        
        if (lista) {
            const itens = lista.querySelectorAll('.peculiaridade-item');
            
            itens.forEach(item => {
                const texto = item.querySelector('.peculiaridade-texto')?.textContent?.trim();
                if (texto && texto !== '') {
                    peculiaridades.push({
                        texto: texto,
                        pontos: parseInt(item.getAttribute('data-custo')) || 0
                    });
                }
            });
        }
        
        return peculiaridades;
    }

    _coletarPericiasTecnicas() {
        const pericias = this._coletarListaGenerica(
            'pericias-aprendidas',
            '.pericia-adquirida, .pericia-item',
            '.pericia-nome, .item-nome',
            'data-pontos'
        );
        
        const tecnicas = this._coletarListaGenerica(
            'tecnicas-aprendidas',
            '.tecnica-adquirida, .tecnica-item',
            '.tecnica-nome, .item-nome',
            'data-pontos'
        );
        
        return {
            pericias: pericias,
            tecnicas: tecnicas,
            total_pericias: pericias.length,
            total_tecnicas: tecnicas.length
        };
    }

    _coletarMagias() {
        const magias = this._coletarListaGenerica(
            'magias-aprendidas',
            '.magia-adquirida, .magia-item',
            '.magia-nome, .item-nome',
            'data-pontos'
        );
        
        return {
            magias: magias,
            total_magias: magias.length,
            mana_atual: this._obterNumero('mana-atual', 10),
            mana_base: this._obterNumero('mana-base', 10)
        };
    }

    _coletarEquipamentos() {
        const lista = document.getElementById('lista-equipamentos-adquiridos');
        const equipamentos = [];
        
        if (lista) {
            const itens = lista.querySelectorAll('.equipamento-adquirido, .item-inventario');
            
            itens.forEach(item => {
                const nome = item.querySelector('.equipamento-nome, .item-nome')?.textContent?.trim();
                if (nome && nome !== 'Inventário Vazio') {
                    equipamentos.push({
                        nome: nome,
                        tipo: item.getAttribute('data-tipo') || 'Equipamento',
                        peso: parseFloat(item.getAttribute('data-peso')) || 0,
                        equipado: item.classList.contains('equipado') || false,
                        quantidade: parseInt(item.getAttribute('data-quantidade')) || 1
                    });
                }
            });
        }
        
        return {
            itens: equipamentos,
            total_itens: equipamentos.length,
            dinheiro: this._obterDinheiro(),
            peso_atual: this._obterNumero('pesoAtual', 0, true),
            peso_maximo: this._obterNumero('pesoMaximo', 60, true)
        };
    }

    _coletarCombate() {
        return {
            pv_atual: this._obterNumero('pvAtualDisplay', 10),
            pv_maximo: this._obterNumero('pvMaxDisplay', 10),
            pf_atual: this._obterNumero('pfAtualDisplay', 10),
            pf_maximo: this._obterNumero('pfMaxDisplay', 10),
            esquiva: this._obterNumero('esquivaTotal', 10),
            bloqueio: this._obterNumero('bloqueioTotal', 11),
            aparar: this._obterNumero('apararTotal', 3)
        };
    }

    _coletarCaracteristicas() {
        return {
            aparencia: this._obterTextoSelect('nivelAparencia'),
            riqueza: this._obterTextoSelect('nivelRiqueza'),
            altura: this._obterNumero('altura', 1.70, true),
            peso: this._obterNumero('peso', 70)
        };
    }

    // ======================
    // MÉTODOS AUXILIARES
    // ======================

    _coletarListaGenerica(idLista, seletorItens, seletorNome, atributoPontos) {
        const lista = document.getElementById(idLista);
        const resultados = [];
        
        if (lista) {
            const itens = lista.querySelectorAll(seletorItens);
            
            itens.forEach(item => {
                const nome = item.querySelector(seletorNome)?.textContent?.trim();
                if (nome && !nome.includes('Nenhuma') && !nome.includes('Nenhum')) {
                    resultados.push({
                        nome: nome,
                        pontos: parseInt(item.getAttribute(atributoPontos)) || 0,
                        nivel: parseInt(item.querySelector('.nivel')?.textContent) || 0
                    });
                }
            });
        }
        
        return resultados;
    }

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
    // MÉTODO PARA SALVAR NO SUPABASE
    // ======================

    obterDadosParaSupabase() {
        const dados = this.coletarTodosDados();
        
        return {
            nome: dados.basicos.nome,
            raca: dados.basicos.raca,
            classe: dados.basicos.classe,
            nivel: dados.basicos.nivel,
            descricao: dados.basicos.descricao,
            
            forca: dados.atributos.forca,
            destreza: dados.atributos.destreza,
            inteligencia: dados.atributos.inteligencia,
            saude: dados.atributos.saude,
            pontos_vida: dados.atributos.pontos_vida,
            pontos_fadiga: dados.atributos.pontos_fadiga,
            vontade: dados.atributos.vontade,
            percepcao: dados.atributos.percepcao,
            deslocamento: dados.atributos.deslocamento,
            
            pontos_totais: dados.pontos.totais,
            pontos_gastos: dados.pontos.gastos,
            pontos_disponiveis: dados.pontos.disponiveis,
            
            vantagens: JSON.stringify(dados.vantagensDesvantagens.vantagens),
            desvantagens: JSON.stringify(dados.vantagensDesvantagens.desvantagens),
            peculiaridades: JSON.stringify(dados.vantagensDesvantagens.peculiaridades),
            pericias: JSON.stringify(dados.periciasTecnicas.pericias),
            tecnicas: JSON.stringify(dados.periciasTecnicas.tecnicas),
            magias: JSON.stringify(dados.magias.magias),
            equipamentos: JSON.stringify(dados.equipamentos.itens),
            
            total_vantagens: dados.vantagensDesvantagens.total_vantagens,
            total_desvantagens: dados.vantagensDesvantagens.total_desvantagens,
            total_peculiaridades: dados.vantagensDesvantagens.total_peculiaridades,
            total_pericias: dados.periciasTecnicas.total_pericias,
            total_tecnicas: dados.periciasTecnicas.total_tecnicas,
            total_magias: dados.magias.total_magias,
            
            dinheiro: dados.equipamentos.dinheiro,
            peso_atual: dados.equipamentos.peso_atual,
            peso_maximo: dados.equipamentos.peso_maximo,
            
            pv_atual: dados.combate.pv_atual,
            pv_maximo: dados.combate.pv_maximo,
            pf_atual: dados.combate.pf_atual,
            pf_maximo: dados.combate.pf_maximo,
            esquiva: dados.combate.esquiva,
            bloqueio: dados.combate.bloqueio,
            aparar: dados.combate.aparar,
            
            aparencia: dados.caracteristicas.aparencia,
            riqueza: dados.caracteristicas.riqueza,
            altura: dados.caracteristicas.altura,
            peso: dados.caracteristicas.peso,
            
            status: 'Ativo',
            updated_at: new Date().toISOString()
        };
    }
}

// INICIALIZAÇÃO
window.coletor = new ColetorDados();
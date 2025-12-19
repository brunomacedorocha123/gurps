// salvamento-final-completo.js
class SalvamentoFinal {
    constructor() {
        this.supabase = window.supabase;
    }

    async salvarPersonagem() {
        const btnSalvar = document.getElementById('btnSalvar');
        const originalHTML = btnSalvar.innerHTML;
        
        try {
            btnSalvar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
            btnSalvar.disabled = true;

            if (!this.supabase) {
                throw new Error('Sistema não configurado');
            }

            const { data: { session } } = await this.supabase.auth.getSession();
            if (!session) {
                window.location.href = 'login.html';
                return;
            }

            const dados = this._coletarDadosCompletos();
            dados.user_id = session.user.id;
            dados.created_at = new Date().toISOString();
            dados.updated_at = new Date().toISOString();
            dados.status = 'Ativo';

            const personagemId = this._obterIdDaURL();
            
            let resultado;
            if (personagemId) {
                const { data, error } = await this.supabase
                    .from('characters')
                    .update(dados)
                    .eq('id', personagemId)
                    .eq('user_id', session.user.id)
                    .select();
                
                if (error) throw error;
                resultado = data;
            } else {
                const { data, error } = await this.supabase
                    .from('characters')
                    .insert([dados])
                    .select();
                
                if (error) throw error;
                resultado = data;
            }

            alert('Personagem salvo com sucesso!');
            setTimeout(() => {
                window.location.href = 'personagens.html';
            }, 1500);

            return resultado;

        } catch (error) {
            if (error.message.includes('permission denied')) {
                alert('Permissão negada. Faça login novamente.');
            } else if (error.message.includes('network')) {
                alert('Erro de conexão. Verifique sua internet.');
            } else {
                alert('Erro ao salvar: ' + error.message);
            }
            return null;
        } finally {
            btnSalvar.innerHTML = originalHTML;
            btnSalvar.disabled = false;
        }
    }

    _coletarDadosCompletos() {
        return {
            nome: this._getValue('charName', 'Novo Personagem'),
            raca: this._getSelectValue('racaPersonagem'),
            classe: this._getSelectValue('classePersonagem'),
            nivel: this._getValue('nivelPersonagem', '1'),
            descricao: this._getTextarea('descricaoPersonagem'),
            
            forca: this._getNumber('ST', 10),
            destreza: this._getNumber('DX', 10),
            inteligencia: this._getNumber('IQ', 10),
            saude: this._getNumber('HT', 10),
            
            pontos_vida: this._getNumber('PVTotal', 10),
            pontos_fadiga: this._getNumber('PFTotal', 10),
            vontade: this._getNumber('VontadeTotal', 10),
            percepcao: this._getNumber('PercepcaoTotal', 10),
            deslocamento: this._getFloat('DeslocamentoTotal', 5.0),
            
            pontos_totais: this._getPontos('pontosTotais', 150),
            pontos_gastos: this._getPontos('pontosGastos', 0),
            pontos_disponiveis: this._getPontos('pontosSaldo', 150),
            
            vantagens: this._getVantagens(),
            desvantagens: this._getDesvantagens(),
            peculiaridades: this._getPeculiaridades(),
            pericias: this._getPericias(),
            tecnicas: this._getTecnicas(),
            magias: this._getMagias(),
            equipamentos: this._getEquipamentos(),
            
            total_vantagens: this._getTotalVantagens(),
            total_desvantagens: this._getTotalDesvantagens(),
            total_peculiaridades: this._getTotalPeculiaridades(),
            total_pericias: this._getTotalPericias(),
            total_tecnicas: this._getTotalTecnicas(),
            total_magias: this._getTotalMagias(),
            
            pv_atual: this._getNumber('pvAtualDisplay', 10),
            pv_maximo: this._getNumber('pvMaxDisplay', 10),
            pf_atual: this._getNumber('pfAtualDisplay', 10),
            pf_maximo: this._getNumber('pfMaxDisplay', 10),
            
            esquiva: this._getNumber('esquivaTotal', 8),
            bloqueio: this._getNumber('bloqueioTotal', 9),
            aparar: this._getNumber('apararTotal', 0),
            
            aparencia: this._getAparencia(),
            riqueza: this._getRiqueza(),
            altura: this._getFloat('altura', 1.70),
            peso: this._getFloat('peso', 70),
            
            dinheiro: this._getDinheiro(),
            peso_atual: this._getFloat('pesoAtual', 0),
            peso_maximo: this._getFloat('pesoMaximo', 60),
            
            limite_desvantagens: -50,
            desvantagens_atuais: 0,
            
            idiomas: '[]',
            caracteristicas_fisicas: '[]',
            inventario: '[]',
            deposito: '[]',
            condicoes: '[]',
            inimigos: '[]',
            aliados: '[]',
            dependentes: '[]'
        };
    }

    _getValue(id, padrao) {
        const el = document.getElementById(id);
        return el ? (el.value || padrao) : padrao;
    }

    _getSelectValue(id) {
        const select = document.getElementById(id);
        return select ? select.value : '';
    }

    _getTextarea(id) {
        return this._getValue(id, '');
    }

    _getNumber(id, padrao) {
        const el = document.getElementById(id);
        if (!el) return padrao;
        const valor = el.value || el.textContent || padrao;
        const num = parseInt(valor);
        return isNaN(num) ? padrao : num;
    }

    _getFloat(id, padrao) {
        const el = document.getElementById(id);
        if (!el) return padrao;
        const valor = el.value || el.textContent || padrao;
        const num = parseFloat(valor);
        return isNaN(num) ? padrao : num;
    }

    _getPontos(id, padrao) {
        const el = document.getElementById(id) || 
                   document.getElementById(id + 'Dashboard') ||
                   document.querySelector('[data-' + id.toLowerCase() + ']');
        if (!el) return padrao;
        const valor = el.textContent || el.value || el.innerText || padrao;
        const num = parseInt(valor);
        return isNaN(num) ? padrao : num;
    }

    _getAparencia() {
        const select = document.getElementById('nivelAparencia');
        if (!select) return 'Comum';
        const texto = select.options[select.selectedIndex].text;
        return texto.split('[')[0].trim();
    }

    _getRiqueza() {
        const select = document.getElementById('nivelRiqueza');
        if (!select) return 'Média';
        const texto = select.options[select.selectedIndex].text;
        return texto.split('[')[0].trim();
    }

    _getDinheiro() {
        const el = document.getElementById('dinheiroEquipamento') || 
                   document.getElementById('dinheiro-disponivel');
        if (!el) return 2000.00;
        const texto = el.textContent || el.value || '$2000';
        const limpo = texto.replace('$', '').replace(/\./g, '').replace(',', '.');
        const num = parseFloat(limpo);
        return isNaN(num) ? 2000.00 : num;
    }

    _getVantagens() {
        const lista = document.getElementById('vantagens-adquiridas');
        const vantagens = [];
        
        if (lista) {
            const itens = lista.querySelectorAll('.vantagem-adquirida, .item-adquirido');
            itens.forEach(item => {
                const nome = item.querySelector('.nome-vantagem, .item-nome')?.textContent?.trim();
                if (nome && !nome.includes('Nenhuma')) {
                    const custo = item.querySelector('.custo-vantagem, .item-pontos')?.textContent?.trim();
                    const pontos = parseInt(custo?.replace(/[^\d-]/g, '')) || 0;
                    vantagens.push({ nome, pontos });
                }
            });
        }
        
        return JSON.stringify(vantagens);
    }

    _getDesvantagens() {
        const lista = document.getElementById('desvantagens-adquiridas');
        const desvantagens = [];
        
        if (lista) {
            const itens = lista.querySelectorAll('.desvantagem-adquirida, .item-adquirido');
            itens.forEach(item => {
                const nome = item.querySelector('.nome-desvantagem, .item-nome')?.textContent?.trim();
                if (nome && !nome.includes('Nenhuma')) {
                    const custo = item.querySelector('.custo-desvantagem, .item-pontos')?.textContent?.trim();
                    const pontos = parseInt(custo?.replace(/[^\d-]/g, '')) || 0;
                    desvantagens.push({ nome, pontos });
                }
            });
        }
        
        return JSON.stringify(desvantagens);
    }

    _getPeculiaridades() {
        const lista = document.getElementById('lista-peculiaridades');
        const peculiaridades = [];
        
        if (lista) {
            const itens = lista.querySelectorAll('.peculiaridade-item');
            itens.forEach(item => {
                const texto = item.querySelector('.peculiaridade-texto')?.textContent?.trim();
                if (texto) {
                    peculiaridades.push({ texto });
                }
            });
        }
        
        return JSON.stringify(peculiaridades);
    }

    _getPericias() {
        const lista = document.getElementById('pericias-aprendidas');
        const pericias = [];
        
        if (lista) {
            const itens = lista.querySelectorAll('.pericia-adquirida');
            itens.forEach(item => {
                const nome = item.querySelector('.pericia-nome')?.textContent?.trim();
                if (nome && !nome.includes('Nenhuma')) {
                    const nivel = item.querySelector('.pericia-nivel')?.textContent?.trim();
                    pericias.push({ 
                        nome, 
                        nivel: parseInt(nivel) || 0 
                    });
                }
            });
        }
        
        return JSON.stringify(pericias);
    }

    _getTecnicas() {
        const lista = document.getElementById('tecnicas-aprendidas');
        const tecnicas = [];
        
        if (lista) {
            const itens = lista.querySelectorAll('.tecnica-adquirida');
            itens.forEach(item => {
                const nome = item.querySelector('.tecnica-nome')?.textContent?.trim();
                if (nome && !nome.includes('Nenhuma')) {
                    tecnicas.push({ nome });
                }
            });
        }
        
        return JSON.stringify(tecnicas);
    }

    _getMagias() {
        const lista = document.getElementById('magias-aprendidas');
        const magias = [];
        
        if (lista) {
            const itens = lista.querySelectorAll('.magia-adquirida');
            itens.forEach(item => {
                const nome = item.querySelector('.magia-nome')?.textContent?.trim();
                if (nome && !nome.includes('Nenhuma')) {
                    const nivel = item.querySelector('.magia-nivel')?.textContent?.trim();
                    magias.push({ 
                        nome, 
                        nivel: parseInt(nivel) || 0 
                    });
                }
            });
        }
        
        return JSON.stringify(magias);
    }

    _getEquipamentos() {
        const lista = document.getElementById('lista-equipamentos-adquiridos');
        const equipamentos = [];
        
        if (lista) {
            const itens = lista.querySelectorAll('.equipamento-adquirido');
            itens.forEach(item => {
                const nome = item.querySelector('.equipamento-nome')?.textContent?.trim();
                if (nome && !nome.includes('Inventário Vazio')) {
                    const peso = item.getAttribute('data-peso') || '0';
                    equipamentos.push({ 
                        nome, 
                        peso: parseFloat(peso) || 0,
                        equipado: item.classList.contains('equipado') 
                    });
                }
            });
        }
        
        return JSON.stringify(equipamentos);
    }

    _getTotalVantagens() {
        try {
            const vantagens = JSON.parse(this._getVantagens());
            return vantagens.reduce((total, v) => total + (v.pontos || 0), 0);
        } catch {
            return 0;
        }
    }

    _getTotalDesvantagens() {
        try {
            const desvantagens = JSON.parse(this._getDesvantagens());
            return Math.abs(desvantagens.reduce((total, d) => total + (d.pontos || 0), 0));
        } catch {
            return 0;
        }
    }

    _getTotalPeculiaridades() {
        try {
            const peculiaridades = JSON.parse(this._getPeculiaridades());
            return peculiaridades.length;
        } catch {
            return 0;
        }
    }

    _getTotalPericias() {
        try {
            const pericias = JSON.parse(this._getPericias());
            return pericias.length;
        } catch {
            return 0;
        }
    }

    _getTotalTecnicas() {
        try {
            const tecnicas = JSON.parse(this._getTecnicas());
            return tecnicas.length;
        } catch {
            return 0;
        }
    }

    _getTotalMagias() {
        try {
            const magias = JSON.parse(this._getMagias());
            return magias.length;
        } catch {
            return 0;
        }
    }

    _obterIdDaURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    async excluirPersonagem() {
        if (!confirm('Tem certeza que deseja excluir este personagem permanentemente?')) {
            return;
        }

        const personagemId = this._obterIdDaURL();
        if (!personagemId) {
            alert('Personagem não encontrado para exclusão.');
            return;
        }

        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            if (!session) {
                window.location.href = 'login.html';
                return;
            }

            const { error } = await this.supabase
                .from('characters')
                .delete()
                .eq('id', personagemId)
                .eq('user_id', session.user.id);

            if (error) throw error;

            alert('Personagem excluído com sucesso!');
            setTimeout(() => {
                window.location.href = 'personagens.html';
            }, 1500);

        } catch (error) {
            alert('Erro ao excluir: ' + error.message);
        }
    }
}

// INICIALIZAÇÃO E CONFIGURAÇÃO DOS BOTÕES
document.addEventListener('DOMContentLoaded', function() {
    const salvamento = new SalvamentoFinal();
    
    // Configurar botão Salvar
    const btnSalvar = document.getElementById('btnSalvar');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', function() {
            salvamento.salvarPersonagem();
        });
    }
    
    // Configurar botão Excluir
    const btnExcluir = document.getElementById('btnExcluir');
    if (btnExcluir) {
        btnExcluir.addEventListener('click', function() {
            salvamento.excluirPersonagem();
        });
    }
    
    // Configurar botão Sair
    const btnSair = document.getElementById('btnSair');
    if (btnSair) {
        btnSair.addEventListener('click', function() {
            window.location.href = 'personagens.html';
        });
    }
});
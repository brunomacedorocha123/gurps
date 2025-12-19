// salvamento-supabase.js - VERSÃO COMPLETA E FUNCIONAL
class SalvamentoSupabase {
    constructor() {
        // Usar o supabase que já existe no window (criado no script principal)
        this.supabase = window.supabase || window.supabaseClient;
        
        if (!this.supabase) {
            throw new Error('Supabase não está disponível');
        }
        
        console.log('✅ Sistema de salvamento inicializado');
    }

    // MÉTODO PRINCIPAL DE SALVAMENTO
    async salvarPersonagem(personagemId = null) {
        try {
            // 1. Verificar autenticação
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (!session) {
                alert('Você precisa estar logado para salvar!');
                window.location.href = 'login.html';
                return false;
            }

            const userId = session.user.id;

            // 2. Mostrar carregando
            const btnSalvar = document.getElementById('btnSalvar');
            const btnSalvarOriginal = btnSalvar?.innerHTML || '';
            if (btnSalvar) {
                btnSalvar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
                btnSalvar.disabled = true;
            }

            // 3. Coletar dados COMPLETOS
            const dadosCompletos = this.coletarTodosOsDados();

            // 4. Adicionar campos obrigatórios
            dadosCompletos.user_id = userId;
            dadosCompletos.updated_at = new Date().toISOString();

            // 5. Validar dados básicos
            if (!dadosCompletos.nome || dadosCompletos.nome.trim() === '') {
                alert('O personagem precisa ter um nome!');
                if (btnSalvar) {
                    btnSalvar.innerHTML = btnSalvarOriginal;
                    btnSalvar.disabled = false;
                }
                return false;
            }

            let resultado;

            // 6. Salvar no Supabase
            if (personagemId) {
                // EDITAR personagem existente
                const { data, error } = await this.supabase
                    .from('characters')
                    .update(dadosCompletos)
                    .eq('id', personagemId)
                    .eq('user_id', userId)
                    .select();

                if (error) throw error;
                resultado = data;
                
            } else {
                // CRIAR novo personagem
                dadosCompletos.created_at = new Date().toISOString();
                dadosCompletos.status = 'Ativo';
                
                const { data, error } = await this.supabase
                    .from('characters')
                    .insert([dadosCompletos])
                    .select();

                if (error) throw error;
                
                if (data && data[0]) {
                    personagemId = data[0].id;
                    resultado = data;
                }
            }

            // 7. Sucesso - restaurar botão
            if (btnSalvar) {
                btnSalvar.innerHTML = btnSalvarOriginal;
                btnSalvar.disabled = false;
            }

            // 8. Mostrar mensagem de sucesso
            const mensagem = personagemId 
                ? 'Personagem atualizado com sucesso!' 
                : 'Personagem criado com sucesso!';
            
            alert(mensagem + '\n\nRedirecionando para seus personagens...');

            // 9. Redirecionar
            setTimeout(() => {
                window.location.href = 'personagens.html';
            }, 2000);

            return true;

        } catch (error) {
            // Restaurar botão em caso de erro
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

    // COLETAR TODOS OS DADOS DAS ABAS
    coletarTodosOsDados() {
        const dados = {};
        
        try {
            // A. DADOS BÁSICOS
            dados.nome = document.getElementById('charName')?.value || 'Novo Personagem';
            dados.raca = document.getElementById('racaPersonagem')?.value || '';
            dados.classe = document.getElementById('classePersonagem')?.value || '';
            dados.nivel = document.getElementById('nivelPersonagem')?.value || '';
            dados.descricao = document.getElementById('descricaoPersonagem')?.value || '';
            
            // B. ATRIBUTOS PRINCIPAIS
            dados.forca = parseInt(document.getElementById('ST')?.value) || 10;
            dados.destreza = parseInt(document.getElementById('DX')?.value) || 10;
            dados.inteligencia = parseInt(document.getElementById('IQ')?.value) || 10;
            dados.saude = parseInt(document.getElementById('HT')?.value) || 10;
            
            // C. PONTOS
            dados.pontos_totais = this.obterPontosTotais();
            dados.pontos_gastos = this.obterPontosGastos();
            dados.pontos_disponiveis = this.obterPontosDisponiveis();
            
            // D. ATRIBUTOS SECUNDÁRIOS
            dados.pontos_vida = this.obterValorNumerico('PVTotal', 10);
            dados.pontos_fadiga = this.obterValorNumerico('PFTotal', 10);
            dados.vontade = this.obterValorNumerico('VontadeTotal', 10);
            dados.percepcao = this.obterValorNumerico('PercepcaoTotal', 10);
            dados.deslocamento = this.obterValorNumerico('DeslocamentoTotal', 5.0, true);
            
            // E. DANO
            dados.dano_gdp = this.obterTexto('danoGDP', '1d-2');
            dados.dano_geb = this.obterTexto('danoGEB', '1d');
            
            // F. CARACTERÍSTICAS
            dados.aparencia = this.obterValorSelect('nivelAparencia', 'Comum');
            dados.custo_aparencia = this.obterValorNumericoSelect('nivelAparencia', 0);
            dados.riqueza = this.obterValorSelect('nivelRiqueza', 'Média');
            dados.custo_riqueza = this.obterValorNumericoSelect('nivelRiqueza', 0);
            dados.altura = parseFloat(document.getElementById('altura')?.value) || 1.70;
            dados.peso = parseFloat(document.getElementById('peso')?.value) || 70;
            
            // G. DADOS COMPLEXOS (JSON)
            dados.vantagens = this.coletarVantagensJSON();
            dados.desvantagens = this.coletarDesvantagensJSON();
            dados.peculiaridades = this.coletarPeculiaridadesJSON();
            dados.pericias = this.coletarPericiasJSON();
            dados.magias = this.coletarMagiasJSON();
            dados.equipamentos = this.coletarEquipamentosJSON();
            dados.tecnicas = this.coletarTecnicasJSON();
            
            // H. COMBATE
            dados.pv_atual = this.obterValorNumerico('pvAtualDisplay', 10);
            dados.pv_maximo = this.obterValorNumerico('pvMaxDisplay', 10);
            dados.pf_atual = this.obterValorNumerico('pfAtualDisplay', 10);
            dados.pf_maximo = this.obterValorNumerico('pfMaxDisplay', 10);
            dados.esquiva = this.obterValorNumerico('esquivaTotal', 10);
            dados.bloqueio = this.obterValorNumerico('bloqueioTotal', 11);
            dados.aparar = this.obterValorNumerico('apararTotal', 3);
            
            // I. DINHEIRO E CARGA
            dados.dinheiro = this.obterDinheiro();
            dados.peso_atual = this.obterValorNumerico('pesoAtual', 0, true);
            dados.peso_maximo = this.obterValorNumerico('pesoMaximo', 60, true);
            
            // J. STATUS
            dados.status = 'Ativo';
            
            return dados;
            
        } catch (error) {
            console.error('Erro ao coletar dados:', error);
            // Retornar dados mínimos em caso de erro
            return {
                nome: document.getElementById('charName')?.value || 'Novo Personagem',
                forca: 10,
                destreza: 10,
                inteligencia: 10,
                saude: 10,
                pontos_totais: 150,
                pontos_gastos: 0,
                pontos_disponiveis: 150,
                status: 'Ativo'
            };
        }
    }

    // MÉTODOS AUXILIARES
    obterValor(id, padrao = '') {
        const el = document.getElementById(id);
        return el ? (el.value || el.textContent || padrao) : padrao;
    }

    obterTexto(id, padrao = '') {
        return this.obterValor(id, padrao);
    }

    obterValorNumerico(id, padrao = 0, decimal = false) {
        const valor = this.obterValor(id, padrao);
        const num = decimal ? parseFloat(valor) : parseInt(valor);
        return isNaN(num) ? padrao : num;
    }

    obterValorSelect(id, padrao = '') {
        const select = document.getElementById(id);
        if (!select || !select.selectedOptions[0]) return padrao;
        return select.selectedOptions[0].text.split('[')[0].trim();
    }

    obterValorNumericoSelect(id, padrao = 0) {
        const select = document.getElementById(id);
        return select ? parseInt(select.value) || padrao : padrao;
    }

    obterPontosTotais() {
        const input = document.getElementById('pontosTotaisDashboard');
        if (input) return parseInt(input.value) || 150;
        
        const display = document.getElementById('pontosTotais');
        if (display) return this.obterValorNumerico('pontosTotais', 150);
        
        return 150;
    }

    obterPontosGastos() {
        const display1 = document.getElementById('pontosGastosDashboard');
        const display2 = document.getElementById('pontosGastos');
        
        if (display1) return this.obterValorNumerico('pontosGastosDashboard', 0);
        if (display2) return this.obterValorNumerico('pontosGastos', 0);
        
        return 0;
    }

    obterPontosDisponiveis() {
        const display1 = document.getElementById('saldoDisponivelDashboard');
        const display2 = document.getElementById('pontosSaldo');
        
        if (display1) return this.obterValorNumerico('saldoDisponivelDashboard', 150);
        if (display2) return this.obterValorNumerico('pontosSaldo', 150);
        
        return 150;
    }

    obterDinheiro() {
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

    // COLETORES DE DADOS COMPLEXOS (JSON)
    coletarVantagensJSON() {
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
                    vantagens.push({ nome, pontos });
                }
            });
            
            return JSON.stringify(vantagens);
        } catch (error) {
            return JSON.stringify([]);
        }
    }

    coletarDesvantagensJSON() {
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
                    desvantagens.push({ nome, pontos });
                }
            });
            
            return JSON.stringify(desvantagens);
        } catch (error) {
            return JSON.stringify([]);
        }
    }

    coletarPeculiaridadesJSON() {
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

    coletarPericiasJSON() {
        try {
            const lista = document.getElementById('pericias-aprendidas');
            if (!lista) return JSON.stringify([]);
            
            const itens = lista.querySelectorAll('.pericia-adquirida, [data-pericia-id]');
            if (itens.length === 0) return JSON.stringify([]);
            
            const pericias = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.pericia-nome, .nome-pericia')?.textContent?.trim();
                const nivel = parseInt(item.querySelector('.pericia-nivel, .nivel-pericia')?.textContent) || 0;
                
                if (nome && nome !== '' && nome !== 'Nenhuma perícia aprendida') {
                    pericias.push({
                        nome,
                        nivel,
                        pontos: parseInt(item.getAttribute('data-pontos')) || 0,
                        atributo: item.getAttribute('data-atributo') || 'DX'
                    });
                }
            });
            
            return JSON.stringify(pericias);
        } catch (error) {
            return JSON.stringify([]);
        }
    }

    coletarMagiasJSON() {
        try {
            const lista = document.getElementById('magias-aprendidas');
            if (!lista) return JSON.stringify([]);
            
            const itens = lista.querySelectorAll('.magia-adquirida, [data-magia-id]');
            if (itens.length === 0) return JSON.stringify([]);
            
            const magias = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.magia-nome, .nome-magia')?.textContent?.trim();
                const nivel = parseInt(item.querySelector('.magia-nivel, .nivel-magia')?.textContent) || 0;
                
                if (nome && nome !== '' && nome !== 'Nenhuma magia aprendida') {
                    magias.push({
                        nome,
                        nivel,
                        pontos: parseInt(item.getAttribute('data-pontos')) || 0,
                        escola: item.getAttribute('data-escola') || '',
                        classe: item.getAttribute('data-classe') || 'Comum'
                    });
                }
            });
            
            return JSON.stringify(magias);
        } catch (error) {
            return JSON.stringify([]);
        }
    }

    coletarEquipamentosJSON() {
        try {
            const lista = document.getElementById('lista-equipamentos-adquiridos');
            if (!lista) return JSON.stringify([]);
            
            const itens = lista.querySelectorAll('.equipamento-adquirido, .item-inventario, [data-item-id]');
            if (itens.length === 0) return JSON.stringify([]);
            
            const equipamentos = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.equipamento-nome, .item-nome')?.textContent?.trim();
                
                if (nome && nome !== '' && nome !== 'Inventário Vazio') {
                    equipamentos.push({
                        nome,
                        tipo: item.getAttribute('data-tipo') || 'Equipamento',
                        peso: parseFloat(item.getAttribute('data-peso')) || 0,
                        custo: parseFloat(item.getAttribute('data-custo')) || 0,
                        quantidade: parseInt(item.getAttribute('data-quantidade')) || 1,
                        equipado: item.classList.contains('equipado') || false
                    });
                }
            });
            
            return JSON.stringify(equipamentos);
        } catch (error) {
            return JSON.stringify([]);
        }
    }

    coletarTecnicasJSON() {
        try {
            const lista = document.getElementById('tecnicas-aprendidas');
            if (!lista) return JSON.stringify([]);
            
            const itens = lista.querySelectorAll('.tecnica-adquirida, [data-tecnica-id]');
            if (itens.length === 0) return JSON.stringify([]);
            
            const tecnicas = [];
            
            itens.forEach(item => {
                const nome = item.querySelector('.tecnica-nome, .nome-tecnica')?.textContent?.trim();
                
                if (nome && nome !== '' && nome !== 'Nenhuma técnica aprendida') {
                    tecnicas.push({
                        nome,
                        pontos: parseInt(item.getAttribute('data-pontos')) || 0,
                        periciaBase: item.getAttribute('data-pericia') || '',
                        dificuldade: item.getAttribute('data-dificuldade') || 'Média'
                    });
                }
            });
            
            return JSON.stringify(tecnicas);
        } catch (error) {
            return JSON.stringify([]);
        }
    }

    // MÉTODOS DE ERRO
    mostrarErroDetalhado(error) {
        let mensagem = 'Erro ao salvar personagem:\n\n';
        
        if (error.message.includes('permission denied') || error.code === '42501') {
            mensagem += 'Você não tem permissão para salvar.\n';
            mensagem += 'Verifique se está logado corretamente.';
            
        } else if (error.message.includes('auth')) {
            mensagem += 'Sua sessão expirou.\n';
            mensagem += 'Faça login novamente.';
            setTimeout(() => window.location.href = 'login.html', 2000);
            
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            mensagem += 'Erro de conexão com o servidor.\n';
            mensagem += 'Verifique sua internet.';
            
        } else if (error.message.includes('JSON')) {
            mensagem += 'Erro ao processar os dados.\n';
            mensagem += 'Verifique os campos preenchidos.';
            
        } else {
            mensagem += 'Erro: ' + error.message;
        }
        
        alert(mensagem);
    }

    // MÉTODOS ADICIONAIS
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
                if (error.code === 'PGRST116') {
                    alert('Personagem não encontrado.');
                } else {
                    alert('Erro: ' + error.message);
                }
                return null;
            }

            return personagem;

        } catch (error) {
            alert('Erro ao carregar personagem.');
            return null;
        }
    }

    async excluirPersonagem(personagemId) {
        if (!confirm('Tem certeza que deseja excluir este personagem?\nEsta ação não pode ser desfeita!')) {
            return false;
        }

        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            if (!session) {
                alert('Você precisa estar logado!');
                return false;
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

            return true;

        } catch (error) {
            alert('Erro ao excluir: ' + error.message);
            return false;
        }
    }
}

// INICIALIZAÇÃO GLOBAL
let salvamento;

try {
    salvamento = new SalvamentoSupabase();
    window.salvamento = salvamento;
    console.log('✅ Sistema de salvamento carregado com sucesso!');
} catch (error) {
    console.error('❌ Erro ao carregar salvamento:', error);
    salvamento = {
        salvarPersonagem: async () => {
            alert('Sistema de salvamento não disponível. Recarregue a página.');
            return false;
        }
    };
    window.salvamento = salvamento;
}
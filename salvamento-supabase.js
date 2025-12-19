// salvamento-supabase.js - VERSÃO CORRIGIDA E SIMPLIFICADA
class SalvamentoSupabase {
    constructor() {
        // Aguardar o Supabase estar disponível
        this.supabase = null;
        this.inicializarSupabase();
    }

    inicializarSupabase() {
        // Tentar diferentes formas de acessar o Supabase
        if (window.supabase) {
            this.supabase = window.supabase;
        } else if (window.supabaseClient) {
            this.supabase = window.supabaseClient;
        } else {
            // Tentar criar se as constantes existirem
            try {
                if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
                    this.supabase = window.supabase.createClient(
                        window.SUPABASE_URL, 
                        window.SUPABASE_ANON_KEY
                    );
                }
            } catch (error) {
                console.error('Não foi possível inicializar o Supabase:', error);
            }
        }
    }

    async verificarAutenticacao() {
        if (!this.supabase) {
            return { sucesso: false, erro: 'Supabase não inicializado' };
        }

        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) {
                return { sucesso: false, erro: error.message };
            }
            
            if (!session) {
                return { 
                    sucesso: false, 
                    erro: 'Não autenticado',
                    redirecionar: 'login.html'
                };
            }
            
            return { 
                sucesso: true, 
                session,
                userId: session.user.id,
                userEmail: session.user.email
            };
        } catch (error) {
            return { sucesso: false, erro: error.message };
        }
    }

    // COLETAR DADOS SIMPLIFICADO
    coletarDadosParaSalvar() {
        try {
            // Dados básicos obrigatórios
            const dados = {
                nome: document.getElementById('charName')?.value || 'Novo Personagem',
                raca: document.getElementById('racaPersonagem')?.value || '',
                classe: document.getElementById('classePersonagem')?.value || '',
                nivel: document.getElementById('nivelPersonagem')?.value || '',
                descricao: document.getElementById('descricaoPersonagem')?.value || '',
                
                // Atributos principais
                forca: parseInt(document.getElementById('ST')?.value) || 10,
                destreza: parseInt(document.getElementById('DX')?.value) || 10,
                inteligencia: parseInt(document.getElementById('IQ')?.value) || 10,
                saude: parseInt(document.getElementById('HT')?.value) || 10,
                
                // Pontos
                pontos_totais: this.obterPontosTotais(),
                pontos_gastos: this.obterPontosGastos(),
                pontos_disponiveis: this.obterPontosDisponiveis(),
                
                // Atributos secundários
                pontos_vida: this.obterValorNumerico('PVTotal', 10),
                pontos_fadiga: this.obterValorNumerico('PFTotal', 10),
                vontade: this.obterValorNumerico('VontadeTotal', 10),
                percepcao: this.obterValorNumerico('PercepcaoTotal', 10),
                deslocamento: this.obterValorNumerico('DeslocamentoTotal', 5.0, true),
                
                // Características
                aparencia: this.obterValorSelect('nivelAparencia', 'Comum'),
                custo_aparencia: this.obterValorNumericoSelect('nivelAparencia', 0),
                riqueza: this.obterValorSelect('nivelRiqueza', 'Média'),
                custo_riqueza: this.obterValorNumericoSelect('nivelRiqueza', 0),
                
                // Dados físicos
                altura: parseFloat(document.getElementById('altura')?.value) || 1.70,
                peso: parseFloat(document.getElementById('peso')?.value) || 70,
                
                // JSON para dados complexos
                vantagens: this.coletarVantagens(),
                desvantagens: this.coletarDesvantagens(),
                peculiaridades: this.coletarPeculiaridades(),
                pericias: this.coletarPericias(),
                equipamentos: this.coletarEquipamentos(),
                magias: this.coletarMagias(),
                
                // Status e datas
                status: 'Ativo',
                updated_at: new Date().toISOString()
            };

            // Se for novo personagem, adicionar created_at
            if (!window.location.search.includes('id=')) {
                dados.created_at = new Date().toISOString();
            }

            return { sucesso: true, dados };

        } catch (error) {
            console.error('Erro ao coletar dados:', error);
            return { 
                sucesso: false, 
                erro: 'Erro ao coletar dados: ' + error.message,
                dados: this.coletarDadosMinimos()
            };
        }
    }

    // MÉTODOS AUXILIARES SIMPLIFICADOS
    obterValor(id, padrao = '') {
        const el = document.getElementById(id);
        return el ? (el.value || el.textContent || padrao) : padrao;
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
        const display = document.getElementById('pontosTotais');
        
        if (input) return parseInt(input.value) || 150;
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

    // COLETORES DE DADOS COMPLEXOS
    coletarVantagens() {
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

    coletarDesvantagens() {
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

    coletarPeculiaridades() {
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

    coletarPericias() {
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
                
                if (nome && nome !== '' && nome !== 'Nenhuma perícia aprendida') {
                    pericias.push({ 
                        nome, 
                        nivel, 
                        pontos,
                        atributo: item.getAttribute('data-atributo') || 'DX'
                    });
                }
            });
            
            return JSON.stringify(pericias);
        } catch (error) {
            return JSON.stringify([]);
        }
    }

    coletarEquipamentos() {
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

    coletarMagias() {
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

    coletarDadosMinimos() {
        return {
            nome: document.getElementById('charName')?.value || 'Novo Personagem',
            raca: document.getElementById('racaPersonagem')?.value || 'Humano',
            classe: document.getElementById('classePersonagem')?.value || 'Guerreiro',
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

    // MÉTODO PRINCIPAL DE SALVAMENTO
    async salvarPersonagem(personagemId = null) {
        try {
            // 1. Verificar autenticação
            const auth = await this.verificarAutenticacao();
            if (!auth.sucesso) {
                if (auth.redirecionar) {
                    window.location.href = auth.redirecionar;
                }
                alert('Erro: ' + auth.erro);
                return false;
            }

            // 2. Mostrar carregando
            const btnSalvar = document.getElementById('btnSalvar');
            const originalHTML = btnSalvar?.innerHTML;
            if (btnSalvar) {
                btnSalvar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
                btnSalvar.disabled = true;
            }

            // 3. Coletar dados
            const coleta = this.coletarDadosParaSalvar();
            if (!coleta.sucesso) {
                alert(coleta.erro);
                return false;
            }

            const dados = coleta.dados;
            dados.user_id = auth.userId;

            // 4. Validar nome
            if (!dados.nome || dados.nome.trim() === '') {
                alert('O personagem precisa ter um nome!');
                return false;
            }

            let resultado;

            // 5. Salvar no banco
            if (personagemId) {
                // EDITAR
                delete dados.created_at;
                
                const { data, error } = await this.supabase
                    .from('characters')
                    .update(dados)
                    .eq('id', personagemId)
                    .eq('user_id', auth.userId)
                    .select();

                if (error) throw error;
                resultado = data;
                
            } else {
                // CRIAR NOVO
                const { data, error } = await this.supabase
                    .from('characters')
                    .insert([dados])
                    .select();

                if (error) throw error;
                
                if (data && data[0]) {
                    personagemId = data[0].id;
                    resultado = data;
                }
            }

            // 6. Sucesso
            if (btnSalvar) {
                btnSalvar.innerHTML = originalHTML;
                btnSalvar.disabled = false;
            }

            const mensagem = personagemId ? 
                'Personagem atualizado com sucesso!' : 
                'Personagem criado com sucesso!';
            
            alert(mensagem + '\n\nRedirecionando para seus personagens...');

            // 7. Redirecionar
            setTimeout(() => {
                window.location.href = 'personagens.html';
            }, 2000);

            return true;

        } catch (error) {
            console.error('Erro no salvamento:', error);
            
            // Restaurar botão
            const btnSalvar = document.getElementById('btnSalvar');
            if (btnSalvar) {
                btnSalvar.innerHTML = '<i class="fas fa-save"></i> Salvar';
                btnSalvar.disabled = false;
            }

            // Mostrar erro
            this.mostrarErro(error);
            return false;
        }
    }

    mostrarErro(error) {
        let mensagem = 'Erro ao salvar personagem:\n\n';
        
        if (error.message.includes('permission denied') || error.code === '42501') {
            mensagem += 'Você não tem permissão para salvar.\n';
            mensagem += 'Verifique se está logado corretamente.';
            
        } else if (error.message.includes('auth')) {
            mensagem += 'Sua sessão expirou.\n';
            mensagem += 'Faça login novamente.';
            setTimeout(() => window.location.href = 'login.html', 2000);
            
        } else if (error.message.includes('network')) {
            mensagem += 'Erro de conexão.\n';
            mensagem += 'Verifique sua internet.';
            
        } else {
            mensagem += error.message;
        }
        
        alert(mensagem);
    }

    // MÉTODOS ADICIONAIS
    async carregarPersonagem(personagemId) {
        try {
            const auth = await this.verificarAutenticacao();
            if (!auth.sucesso) return null;

            const { data: personagem, error } = await this.supabase
                .from('characters')
                .select('*')
                .eq('id', personagemId)
                .eq('user_id', auth.userId)
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
            console.error('Erro ao carregar:', error);
            alert('Erro ao carregar personagem.');
            return null;
        }
    }

    async excluirPersonagem(personagemId) {
        if (!confirm('Tem certeza que deseja excluir este personagem?\nEsta ação não pode ser desfeita!')) {
            return false;
        }

        try {
            const auth = await this.verificarAutenticacao();
            if (!auth.sucesso) return false;

            const { error } = await this.supabase
                .from('characters')
                .delete()
                .eq('id', personagemId)
                .eq('user_id', auth.userId);

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
} catch (error) {
    console.error('Erro ao inicializar salvamento:', error);
    salvamento = {
        salvarPersonagem: async () => {
            alert('Sistema de salvamento não disponível.');
            return false;
        }
    };
    window.salvamento = salvamento;
}
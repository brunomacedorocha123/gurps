// salvamento-supabase.js - VERSÃO CORRIGIDA
class SalvamentoSupabase {
    constructor() {
        if (!window.supabase) {
            throw new Error('Supabase não está disponível');
        }
        
        this.supabase = window.supabase;
        this.limitePersonagens = 10;
        this.usuarioLogado = null;
        this.session = null;
    }

    // ======================
    // SISTEMA DE AUTENTICAÇÃO
    // ======================

    async inicializarAutenticacao() {
        try {
            // PRIMEIRO: Tentar obter o usuário diretamente
            const { data: userData, error: userError } = await this.supabase.auth.getUser();
            
            if (userError) {
                return false;
            }
            
            if (userData.user) {
                this.usuarioLogado = userData.user;
                return true;
            }
            
            // SEGUNDO: Se não encontrou usuário, tentar sessão
            const { data: sessionData } = await this.supabase.auth.getSession();
            
            if (sessionData.session) {
                this.usuarioLogado = sessionData.session.user;
                this.session = sessionData.session;
                return true;
            }
            
            return false;
            
        } catch (error) {
            return false;
        }
    }

    // ======================
    // VERIFICAÇÃO DE LIMITE
    // ======================

    async verificarLimitePersonagens() {
        const autenticado = await this.inicializarAutenticacao();
        
        if (!autenticado) {
            return {
                podeCriar: false,
                quantidade: 0,
                limite: this.limitePersonagens,
                motivo: 'Você precisa estar logado para criar personagens'
            };
        }
        
        try {
            const { count, error } = await this.supabase
                .from('characters')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', this.usuarioLogado.id);
            
            if (error) {
                return {
                    podeCriar: false,
                    quantidade: 0,
                    limite: this.limitePersonagens,
                    motivo: 'Erro ao verificar limite. Tente novamente.'
                };
            }
            
            const podeCriar = (count || 0) < this.limitePersonagens;
            const motivo = podeCriar ? '' : `Limite de ${this.limitePersonagens} personagens atingido`;
            
            return {
                podeCriar,
                quantidade: count || 0,
                limite: this.limitePersonagens,
                motivo
            };
            
        } catch (error) {
            return {
                podeCriar: false,
                quantidade: 0,
                limite: this.limitePersonagens,
                motivo: 'Erro ao verificar limite.'
            };
        }
    }

    // ======================
    // SISTEMA DE FOTOS
    // ======================

    async salvarFotoNoSupabase(file, personagemId) {
        if (!file || !personagemId || !this.usuarioLogado) {
            return null;
        }

        try {
            const fileExt = file.name.split('.').pop().toLowerCase();
            const fileName = `avatar_${personagemId}_${Date.now()}.${fileExt}`;
            const filePath = `avatars/${this.usuarioLogado.id}/${fileName}`;

            const { data: uploadData, error: uploadError } = await this.supabase.storage
                .from('characters')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                return null;
            }

            const { data: { publicUrl } } = this.supabase.storage
                .from('characters')
                .getPublicUrl(filePath);

            return publicUrl;

        } catch (error) {
            return null;
        }
    }

    // ======================
    // COLETA DE DADOS
    // ======================

    coletarDadosCompletos() {
        let dadosBase = {
            user_id: this.usuarioLogado?.id,
            nome: document.getElementById('charName')?.value || 'Novo Personagem',
            classe: document.getElementById('classePersonagem')?.value || '',
            raca: document.getElementById('racaPersonagem')?.value || '',
            nivel: document.getElementById('nivelPersonagem')?.value || 'Nível 1',
            descricao: document.getElementById('descricaoPersonagem')?.value || '',
            status: 'Ativo',
            updated_at: new Date().toISOString()
        };

        if (window.coletor && typeof window.coletor.coletarTodosDados === 'function') {
            try {
                const dadosColetor = window.coletor.coletarTodosDados();
                return { ...dadosBase, ...dadosColetor };
            } catch (error) {
                // Continuar com dados básicos
            }
        }

        const dadosManuais = {
            pontos_totais: window.sistemaPontos?.pontos?.totais || 150,
            pontos_gastos: window.sistemaPontos?.pontos?.gastos || 0,
            pontos_disponiveis: window.sistemaPontos?.pontos?.disponiveis || 150,
            limite_desvantagens: window.sistemaPontos?.pontos?.limiteDesvantagens || -50,
            desvantagens_atuais: window.sistemaPontos?.pontos?.desvantagensAtuais || 0,

            forca: parseInt(document.getElementById('ST')?.value) || 10,
            destreza: parseInt(document.getElementById('DX')?.value) || 10,
            inteligencia: parseInt(document.getElementById('IQ')?.value) || 10,
            saude: parseInt(document.getElementById('HT')?.value) || 10,

            idiomas: '[]',
            vantagens: '[]',
            desvantagens: '[]',
            peculiaridades: '[]',
            pericias: '[]',
            tecnicas: '[]',
            magias: '[]',
            equipamentos: '[]',
            inventario: '[]',
            deposito: '[]',
            condicoes: '[]',
            inimigos: '[]',
            aliados: '[]',
            dependentes: '[]',
            caracteristicas_fisicas: '[]',

            avatar_url: null,
            created_at: new Date().toISOString()
        };

        return { ...dadosBase, ...dadosManuais };
    }

    // ======================
    // VALIDAÇÃO
    // ======================

    validarPontos(dados) {
        if (dados.pontos_gastos > dados.pontos_totais) {
            alert(`Erro: Você gastou ${dados.pontos_gastos} pontos, mas tem apenas ${dados.pontos_totais} pontos totais!`);
            return false;
        }
        
        if (dados.desvantagens_atuais < dados.limite_desvantagens) {
            alert('Erro: Você excedeu o limite de desvantagens!');
            return false;
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
            const autenticado = await this.inicializarAutenticacao();
            if (!autenticado) {
                alert('Você precisa estar logado para salvar personagens!');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
                return false;
            }

            const dados = this.coletarDadosCompletos();
            
            if (!dados.user_id) {
                dados.user_id = this.usuarioLogado.id;
            }

            if (!this.validarPontos(dados)) {
                return false;
            }

            let fotoUrl = null;
            let fotoFile = null;

            if (window.dashboard && typeof window.dashboard.getFotoParaSalvar === 'function') {
                try {
                    const fotoData = window.dashboard.getFotoParaSalvar();
                    if (fotoData && fotoData.file) {
                        fotoFile = fotoData.file;
                    }
                } catch (error) {
                    // Ignorar erro
                }
            }

            let resultado;
            let personagemSalvoId = personagemId;

            if (personagemId) {
                delete dados.id;
                delete dados.created_at;
                delete dados.user_id;

                if (fotoFile) {
                    fotoUrl = await this.salvarFotoNoSupabase(fotoFile, personagemId);
                    if (fotoUrl) {
                        dados.avatar_url = fotoUrl;
                    }
                }

                resultado = await this.supabase
                    .from('characters')
                    .update(dados)
                    .eq('id', personagemId)
                    .eq('user_id', this.usuarioLogado.id)
                    .select();

            } else {
                dados.created_at = new Date().toISOString();
                dados.user_id = this.usuarioLogado.id;

                resultado = await this.supabase
                    .from('characters')
                    .insert([dados])
                    .select();

                if (resultado.data && resultado.data[0]) {
                    personagemSalvoId = resultado.data[0].id;

                    if (fotoFile && personagemSalvoId) {
                        fotoUrl = await this.salvarFotoNoSupabase(fotoFile, personagemSalvoId);
                        
                        if (fotoUrl) {
                            await this.supabase
                                .from('characters')
                                .update({ avatar_url: fotoUrl })
                                .eq('id', personagemSalvoId);
                        }
                    }
                }
            }

            if (resultado.error) {
                this.tratarErroSupabase(resultado.error);
                return false;
            }

            this.mostrarModalSucesso(personagemId ? 'editado' : 'criado');
            return true;

        } catch (error) {
            alert('Erro inesperado ao salvar personagem:\n' + error.message);
            return false;
        }
    }

    // ======================
    // TRATAMENTO DE ERROS
    // ======================

    tratarErroSupabase(error) {
        let mensagem = 'Erro ao salvar: ';
        let detalhes = '';
        
        switch(error.code) {
            case '23505':
                mensagem = 'Personagem já existe';
                detalhes = 'Um personagem com esses dados já existe.';
                break;
            case '42501':
                mensagem = 'Permissão negada';
                detalhes = 'Verifique as políticas RLS no Supabase.';
                break;
            case '42P01':
                mensagem = 'Tabela não existe';
                detalhes = 'Execute o SQL da tabela characters primeiro no Supabase.';
                break;
            case 'PGRST116':
                mensagem = 'Recurso não encontrado';
                detalhes = 'O personagem que você está tentando editar não existe.';
                break;
            default:
                mensagem += error.message;
                detalhes = error.details || '';
        }
        
        alert(`${mensagem}\n${detalhes}`);
    }

    // ======================
    // CARREGAMENTO
    // ======================

    async carregarPersonagem(personagemId) {
        try {
            const autenticado = await this.inicializarAutenticacao();
            if (!autenticado) {
                alert('Você precisa estar logado para carregar personagens!');
                return null;
            }

            const { data: personagem, error } = await this.supabase
                .from('characters')
                .select('*')
                .eq('id', personagemId)
                .eq('user_id', this.usuarioLogado.id)
                .single();

            if (error) {
                alert('Erro ao carregar personagem:\n' + error.message);
                return null;
            }

            return personagem;

        } catch (error) {
            alert('Erro ao carregar personagem');
            return null;
        }
    }

    // ======================
    // EXCLUSÃO
    // ======================

    async excluirPersonagem(personagemId) {
        try {
            const autenticado = await this.inicializarAutenticacao();
            if (!autenticado) {
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
                .eq('user_id', this.usuarioLogado.id);

            if (error) {
                alert('Erro ao excluir personagem:\n' + error.message);
                return false;
            }

            return true;

        } catch (error) {
            alert('Erro ao excluir personagem');
            return false;
        }
    }

    // ======================
    // UI E NOTIFICAÇÕES
    // ======================

    mostrarModalSucesso(tipo) {
        const mensagem = tipo === 'criado' 
            ? 'Personagem criado com sucesso!' 
            : 'Personagem atualizado com sucesso!';
        
        const icone = tipo === 'criado' ? '🎮' : '✅';

        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.95);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 99999;
        `;

        modal.innerHTML = `
            <div style="
                background: rgba(30,30,40,0.98);
                padding: 40px;
                border-radius: 15px;
                text-align: center;
                border: 3px solid #27ae60;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            ">
                <div style="
                    font-size: 80px;
                    margin-bottom: 20px;
                ">${icone}</div>
                
                <h2 style="
                    color: #27ae60;
                    margin-bottom: 20px;
                    font-size: 28px;
                ">${mensagem}</h2>
                
                <p style="
                    color: #ccc;
                    margin-bottom: 30px;
                    font-size: 16px;
                ">
                    Redirecionando para seus personagens em 
                    <span id="contador" style="color: #ff8c00; font-weight: bold;">3</span> 
                    segundos...
                </p>
                
                <button id="btnIrPersonagens" style="
                    background: linear-gradient(45deg, #27ae60, #2ecc71);
                    color: white;
                    border: none;
                    padding: 15px 40px;
                    border-radius: 10px;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 18px;
                    margin-top: 10px;
                ">
                    <i class="fas fa-users"></i> Ir para Meus Personagens
                </button>
                
                <br>
                
                <button id="btnContinuarEditando" style="
                    background: transparent;
                    color: #ff8c00;
                    border: 1px solid #ff8c00;
                    padding: 10px 25px;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-top: 15px;
                ">
                    <i class="fas fa-edit"></i> Continuar Editando
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        let segundos = 3;
        const contador = modal.querySelector('#contador');
        let contadorInterval;

        const iniciarContador = () => {
            contadorInterval = setInterval(() => {
                segundos--;
                contador.textContent = segundos;
                
                if (segundos <= 0) {
                    clearInterval(contadorInterval);
                    window.location.href = 'personagens.html';
                }
            }, 1000);
        };

        iniciarContador();

        modal.querySelector('#btnIrPersonagens').addEventListener('click', () => {
            clearInterval(contadorInterval);
            window.location.href = 'personagens.html';
        });

        modal.querySelector('#btnContinuarEditando').addEventListener('click', () => {
            clearInterval(contadorInterval);
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                clearInterval(contadorInterval);
                document.body.removeChild(modal);
            }
        });
    }
}

// ======================
// INICIALIZAÇÃO GLOBAL
// ======================

let salvamento;

try {
    salvamento = new SalvamentoSupabase();
    window.salvamento = salvamento;
    
} catch (error) {
    salvamento = {
        verificarLimitePersonagens: async () => ({
            podeCriar: true,
            quantidade: 0,
            limite: 10,
            motivo: ''
        }),
        salvarPersonagem: async (id) => {
            alert('Sistema de salvamento temporariamente indisponível.');
            
            const dados = {
                id: id || 'local_' + Date.now(),
                nome: document.getElementById('charName')?.value || 'Personagem Local',
                data: new Date().toISOString()
            };
            
            localStorage.setItem('personagem_fallback', JSON.stringify(dados));
            
            setTimeout(() => {
                alert('Personagem salvo localmente (modo offline).');
                window.location.href = 'personagens.html';
            }, 1000);
            
            return true;
        },
        carregarPersonagem: async () => {
            const dados = localStorage.getItem('personagem_fallback');
            return dados ? JSON.parse(dados) : null;
        },
        excluirPersonagem: async () => {
            localStorage.removeItem('personagem_fallback');
            return true;
        },
        inicializarAutenticacao: async () => true
    };
    
    window.salvamento = salvamento;
}
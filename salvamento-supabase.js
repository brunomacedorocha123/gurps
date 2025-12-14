// salvamento-supabase.js - VERSÃO DEFINITIVA FUNCIONAL
class SalvamentoSupabase {
    constructor() {
        this.supabase = window.supabase;
        this.limitePersonagens = 10;
        this.usuarioLogado = null;
    }
    
    async verificarAutenticacao() {
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            if (!session) return false;
            
            this.usuarioLogado = session.user;
            return true;
        } catch {
            return false;
        }
    }
    
    async verificarLimitePersonagens() {
        const autenticado = await this.verificarAutenticacao();
        
        if (!autenticado) {
            return {
                podeCriar: true,
                quantidade: 0,
                limite: this.limitePersonagens,
                motivo: ''
            };
        }
        
        try {
            const { count, error } = await this.supabase
                .from('characters')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', this.usuarioLogado.id);
            
            if (error) {
                return {
                    podeCriar: true,
                    quantidade: 0,
                    limite: this.limitePersonagens,
                    motivo: 'Erro na verificação'
                };
            }
            
            const podeCriar = count < this.limitePersonagens;
            const motivo = podeCriar ? '' : `Limite de ${this.limitePersonagens} personagens atingido`;
            
            return {
                podeCriar,
                quantidade: count,
                limite: this.limitePersonagens,
                motivo
            };
        } catch {
            return {
                podeCriar: true,
                quantidade: 0,
                limite: this.limitePersonagens,
                motivo: 'Erro na verificação'
            };
        }
    }
    
    async salvarFotoNoSupabase(file, personagemId) {
        if (!file || !personagemId || !this.usuarioLogado) return null;

        try {
            const fileExt = file.name.split('.').pop().toLowerCase();
            const fileName = `avatar_${personagemId}.${fileExt}`;
            const filePath = `avatars/${this.usuarioLogado.id}/${fileName}`;

            const { data, error } = await this.supabase.storage
                .from('characters')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) {
                return null;
            }

            const { data: { publicUrl } } = this.supabase.storage
                .from('characters')
                .getPublicUrl(filePath);

            return publicUrl;

        } catch {
            return null;
        }
    }
    
    coletarDadosCompletos() {
        if (window.coletor && typeof window.coletor.coletarTodosDados === 'function') {
            const dados = window.coletor.coletarTodosDados();
            dados.user_id = this.usuarioLogado?.id;
            dados.updated_at = new Date().toISOString();
            dados.status = 'Ativo';
            return dados;
        }

        return {
            user_id: this.usuarioLogado?.id,
            nome: document.getElementById('charName')?.value || 'Novo Personagem',
            classe: document.getElementById('classePersonagem')?.value || '',
            raca: document.getElementById('racaPersonagem')?.value || '',
            nivel: document.getElementById('nivelPersonagem')?.value || 'Nível 1',
            descricao: document.getElementById('descricaoPersonagem')?.value || '',
            status: 'Ativo',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),

            pontos_totais: window.sistemaPontos?.pontos?.totais || 150,
            pontos_gastos: window.sistemaPontos?.pontos?.gastos || 0,
            pontos_disponiveis: window.sistemaPontos?.pontos?.disponiveis || 150,
            limite_desvantagens: window.sistemaPontos?.pontos?.limiteDesvantagens || -50,
            desvantagens_atuais: window.sistemaPontos?.pontos?.desvantagensAtuais || 0,

            forca: parseInt(document.getElementById('ST')?.value) || 10,
            destreza: parseInt(document.getElementById('DX')?.value) || 10,
            inteligencia: parseInt(document.getElementById('IQ')?.value) || 10,
            saude: parseInt(document.getElementById('HT')?.value) || 10,

            pontos_vida: 10,
            bonus_pv: 0,
            pontos_fadiga: 10,
            bonus_pf: 0,
            vontade: 10,
            bonus_vontade: 0,
            percepcao: 10,
            bonus_percepcao: 0,
            deslocamento: 5.00,
            bonus_deslocamento: 0,
            
            dano_gdp: '1d-2',
            dano_geb: '1d',
            
            carga_nenhuma: 10.00,
            carga_leve: 20.00,
            carga_media: 30.00,
            carga_pesada: 60.00,
            carga_muito_pesada: 100.00,
            
            aparencia: 'Comum',
            custo_aparencia: 0,
            riqueza: 'Média',
            custo_riqueza: 0,
            renda_mensal: '$1.000',
            
            altura: 1.70,
            peso: 70.00,
            
            total_vantagens: 0,
            total_desvantagens: 0,
            total_peculiaridades: 0,
            total_pericias: 0,
            total_tecnicas: 0,
            total_magias: 0,
            
            aptidao_magica: 0,
            mana_atual: 10,
            mana_base: 10,
            bonus_mana: 0,
            
            dinheiro: 2000.00,
            peso_atual: 0.00,
            peso_maximo: 60.00,
            nivel_carga: 'LEVE',
            penalidades_carga: 'MOV +0 / DODGE +0',
            
            pv_atual: 10,
            pv_maximo: 10,
            pv_modificador: 0,
            pv_estado: 'Saudável',
            
            pf_atual: 10,
            pf_maximo: 10,
            pf_modificador: 0,
            pf_estado: 'Normal',
            
            esquiva: 10,
            esquiva_mod: 0,
            bloqueio: 11,
            bloqueio_mod: 0,
            aparar: 3,
            aparar_mod: 0,
            
            bonus_reflexos: 0,
            bonus_escudo: 0,
            bonus_capa: 0,
            bonus_outros: 0,
            
            rd_cabeca: 0,
            rd_tronco: 0,
            rd_rosto: 0,
            rd_cranio: 0,
            rd_pescoco: 0,
            rd_virilha: 0,
            rd_bracos: 0,
            rd_pernas: 0,
            rd_maos: 0,
            rd_pes: 0,
            rd_total: 0,
            
            escudo_equipado: false,
            escudo_dr: 0,
            escudo_pv_atual: 0,
            escudo_pv_maximo: 0,
            
            condicoes_ativas: 0,
            
            avatar_url: null,
            
            idiomas: '[]',
            caracteristicas_fisicas: '[]',
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
            dependentes: '[]'
        };
    }
    
    validarPontos(dados) {
        if (dados.pontos_gastos > dados.pontos_totais) {
            alert(`Erro: Você gastou ${dados.pontos_gastos} pontos, mas tem apenas ${dados.pontos_totais} pontos totais!`);
            return false;
        }
        
        if (dados.desvantagens_atuais < dados.limite_desvantagens) {
            alert(`Erro: Você excedeu o limite de desvantagens!`);
            return false;
        }
        
        return true;
    }
    
    async salvarPersonagem(personagemId = null) {
        try {
            const autenticado = await this.verificarAutenticacao();
            if (!autenticado) {
                alert('Você precisa estar logado para salvar personagens!');
                window.location.href = 'login.html';
                return false;
            }
            
            const dados = this.coletarDadosCompletos();
            
            if (!this.validarPontos(dados)) {
                return false;
            }
            
            let fotoUrl = null;
            let fotoFile = null;
            
            if (window.dashboard && window.dashboard.getFotoParaSalvar) {
                const fotoData = window.dashboard.getFotoParaSalvar();
                if (fotoData && fotoData.file) {
                    fotoFile = fotoData.file;
                }
            }
            
            let resultado;
            
            if (personagemId) {
                // Se tiver foto, salvar
                if (fotoFile) {
                    fotoUrl = await this.salvarFotoNoSupabase(fotoFile, personagemId);
                }
                
                // Se obteve URL da foto, adicionar aos dados
                if (fotoUrl) {
                    dados.avatar_url = fotoUrl;
                }
                
                // Remover campo created_at para update
                delete dados.created_at;
                
                // Atualizar personagem
                resultado = await this.supabase
                    .from('characters')
                    .update(dados)
                    .eq('id', personagemId)
                    .eq('user_id', this.usuarioLogado.id)
                    .select();
                    
            } else {
                // Criar novo personagem
                resultado = await this.supabase
                    .from('characters')
                    .insert([dados])
                    .select();
                
                // Se criou com sucesso e tem foto
                if (resultado.data && resultado.data[0] && fotoFile) {
                    const novoId = resultado.data[0].id;
                    
                    // Salvar foto
                    fotoUrl = await this.salvarFotoNoSupabase(fotoFile, novoId);
                    
                    // Atualizar personagem com URL da foto
                    if (fotoUrl) {
                        await this.supabase
                            .from('characters')
                            .update({ avatar_url: fotoUrl })
                            .eq('id', novoId);
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
            alert('Erro inesperado: ' + error.message);
            return false;
        }
    }
    
    tratarErroSupabase(error) {
        let mensagem = 'Erro ao salvar: ';
        
        switch(error.code) {
            case '23505':
                mensagem += 'Personagem já existe';
                break;
            case '42501':
                mensagem += 'Permissão negada. Verifique as políticas RLS.';
                break;
            case '42P01':
                mensagem += 'Tabela não existe. Execute o SQL da tabela primeiro.';
                break;
            default:
                mensagem += error.message;
        }
        
        alert(mensagem);
    }
    
    async carregarPersonagem(personagemId) {
        try {
            const autenticado = await this.verificarAutenticacao();
            if (!autenticado) {
                alert('Você precisa estar logado!');
                return null;
            }
            
            const { data: personagem, error } = await this.supabase
                .from('characters')
                .select('*')
                .eq('id', personagemId)
                .eq('user_id', this.usuarioLogado.id)
                .single();
            
            if (error) {
                alert('Erro ao carregar: ' + error.message);
                return null;
            }
            
            return personagem;
            
        } catch {
            return null;
        }
    }
    
    async excluirPersonagem(personagemId) {
        try {
            const autenticado = await this.verificarAutenticacao();
            if (!autenticado) {
                alert('Você precisa estar logado!');
                return false;
            }
            
            if (!confirm('Tem certeza que deseja excluir este personagem?\nEsta ação não pode ser desfeita!')) {
                return false;
            }
            
            const { error } = await this.supabase
                .from('characters')
                .delete()
                .eq('id', personagemId)
                .eq('user_id', this.usuarioLogado.id);
            
            if (error) {
                alert('Erro ao excluir: ' + error.message);
                return false;
            }
            
            return true;
            
        } catch {
            alert('Erro ao excluir');
            return false;
        }
    }
    
    mostrarModalSucesso(tipo) {
        const mensagem = tipo === 'criado' 
            ? '🎉 Personagem criado com sucesso!' 
            : '✅ Personagem atualizado com sucesso!';
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 99999;
        `;
        
        modal.innerHTML = `
            <div style="
                background: rgba(30,30,40,0.95);
                padding: 40px;
                border-radius: 15px;
                text-align: center;
                border: 2px solid #ff8c00;
                max-width: 500px;
                width: 90%;
            ">
                <div style="font-size: 60px; margin-bottom: 20px;">${tipo === 'criado' ? '🎮' : '✅'}</div>
                <h2 style="color: #ffd700; margin-bottom: 20px;">${mensagem}</h2>
                <p style="color: #ccc; margin-bottom: 30px;">
                    Redirecionando para seus personagens em <span id="contador">3</span> segundos...
                </p>
                <button id="btnIrPersonagens" style="
                    background: #ff8c00;
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 16px;
                ">
                    Ir para Meus Personagens
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        let segundos = 3;
        const contador = modal.querySelector('#contador');
        const contadorInterval = setInterval(() => {
            segundos--;
            contador.textContent = segundos;
            
            if (segundos <= 0) {
                clearInterval(contadorInterval);
                window.location.href = 'personagens.html';
            }
        }, 1000);
        
        modal.querySelector('#btnIrPersonagens').addEventListener('click', () => {
            clearInterval(contadorInterval);
            window.location.href = 'personagens.html';
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                clearInterval(contadorInterval);
                document.body.removeChild(modal);
            }
        });
    }
}

let salvamento;

try {
    salvamento = new SalvamentoSupabase();
} catch {
    salvamento = {
        verificarLimitePersonagens: async () => ({
            podeCriar: true,
            quantidade: 0,
            limite: 10,
            motivo: ''
        }),
        salvarPersonagem: async () => {
            alert('Sistema de salvamento não disponível');
            return false;
        },
        carregarPersonagem: async () => null,
        excluirPersonagem: async () => false
    };
}

window.salvamento = salvamento;
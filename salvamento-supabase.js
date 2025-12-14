// salvamento-supabase.js - VERSÃO LIMPA E FUNCIONAL
class SalvamentoSupabase {
    constructor() {
        // Configuração do Supabase
        this.supabaseUrl = 'https://pujufdfhaxveuytkneqw.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1anVmZGZoYXh2ZXV5dGtuZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTkyODksImV4cCI6MjA3OTkzNTI4OX0.mzOwsmf8qIQ4HZqnXLEmq4D7M6fz4VH1YWpWP-BsFvc';
        
        this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
        this.limitePersonagens = 10;
        this.usuarioLogado = null;
    }
    
    // ======================
    // VERIFICAR AUTENTICAÇÃO
    // ======================
    async verificarAutenticacao() {
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error || !session) {
                return false;
            }
            
            this.usuarioLogado = session.user;
            return true;
            
        } catch {
            return false;
        }
    }
    
    // ======================
    // VERIFICAR LIMITE DE PERSONAGENS
    // ======================
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
    
    // ======================
    // SALVAR FOTO NO SUPABASE
    // ======================
    async salvarFotoNoSupabase(file, personagemId) {
        if (!file || !personagemId || !this.usuarioLogado) return null;

        try {
            // Nome único para o arquivo
            const fileExt = file.name.split('.').pop();
            const fileName = `avatar_${personagemId}_${Date.now()}.${fileExt}`;
            const filePath = `${this.usuarioLogado.id}/${fileName}`;

            // Fazer upload
            const { data, error } = await this.supabase.storage
                .from('characters')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) {
                return null;
            }

            // Obter URL pública
            const { data: { publicUrl } } = this.supabase.storage
                .from('characters')
                .getPublicUrl(filePath);

            return publicUrl;

        } catch {
            return null;
        }
    }
    
    // ======================
    // COLETAR DADOS COMPLETOS
    // ======================
    coletarDadosCompletos() {
        // Usar o coletor existente se disponível
        if (window.coletor && typeof window.coletor.coletarTodosDados === 'function') {
            const dados = window.coletor.coletarTodosDados();
            dados.user_id = this.usuarioLogado?.id;
            dados.updated_at = new Date().toISOString();
            dados.status = 'Ativo';
            return dados;
        }

        // Coletar dados básicos
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

            // Sistema de pontos
            pontos_totais: window.sistemaPontos?.pontos?.totais || 150,
            pontos_gastos: window.sistemaPontos?.pontos?.gastos || 0,
            pontos_disponiveis: window.sistemaPontos?.pontos?.disponiveis || 150,
            limite_desvantagens: window.sistemaPontos?.pontos?.limiteDesvantagens || -50,
            desvantagens_atuais: window.sistemaPontos?.pontos?.desvantagensAtuais || 0,

            // Atributos
            forca: parseInt(document.getElementById('ST')?.value) || 10,
            destreza: parseInt(document.getElementById('DX')?.value) || 10,
            inteligencia: parseInt(document.getElementById('IQ')?.value) || 10,
            saude: parseInt(document.getElementById('HT')?.value) || 10,

            // Dados padrão
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
            
            // Campos JSON vazios
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
    
    // ======================
    // VALIDAR PONTOS
    // ======================
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
    
    // ======================
    // SALVAR PERSONAGEM
    // ======================
    async salvarPersonagem(personagemId = null) {
        try {
            // 1. Verificar autenticação
            const autenticado = await this.verificarAutenticacao();
            if (!autenticado) {
                alert('Você precisa estar logado para salvar personagens!');
                window.location.href = 'login.html';
                return false;
            }
            
            // 2. Coletar dados
            const dados = this.coletarDadosCompletos();
            
            // 3. Validar pontos
            if (!this.validarPontos(dados)) {
                return false;
            }
            
            let resultado;
            let fotoUrl = null;
            
            // 4. Obter foto da dashboard (se houver)
            if (window.dashboard && window.dashboard.getFotoParaSalvar) {
                const fotoData = window.dashboard.getFotoParaSalvar();
                if (fotoData && fotoData.file) {
                    // Usar personagemId existente ou criar novo depois
                    const idParaFoto = personagemId || 'temp';
                    fotoUrl = await this.salvarFotoNoSupabase(fotoData.file, idParaFoto);
                }
            }
            
            if (personagemId) {
                // ===== MODO EDIÇÃO =====
                if (fotoUrl) {
                    dados.avatar_url = fotoUrl;
                }
                
                // Remover created_at para não sobrescrever
                delete dados.created_at;
                
                resultado = await this.supabase
                    .from('characters')
                    .update(dados)
                    .eq('id', personagemId)
                    .eq('user_id', this.usuarioLogado.id)
                    .select();
                    
            } else {
                // ===== MODO CRIAÇÃO =====
                // Criar personagem primeiro
                resultado = await this.supabase
                    .from('characters')
                    .insert([dados])
                    .select();
                
                if (resultado.data && resultado.data[0]) {
                    const novoId = resultado.data[0].id;
                    
                    // Se tiver foto e ainda não salvou, salvar agora com o ID correto
                    if (fotoUrl && fotoUrl.includes('temp')) {
                        // Refazer upload com ID correto
                        const fotoData = window.dashboard.getFotoParaSalvar();
                        if (fotoData && fotoData.file) {
                            fotoUrl = await this.salvarFotoNoSupabase(fotoData.file, novoId);
                        }
                    }
                    
                    // Atualizar com a foto se existir
                    if (fotoUrl) {
                        await this.supabase
                            .from('characters')
                            .update({ avatar_url: fotoUrl })
                            .eq('id', novoId);
                    }
                }
            }
            
            // 5. Verificar erros
            if (resultado.error) {
                this.tratarErroSupabase(resultado.error);
                return false;
            }
            
            // 6. Sucesso
            this.mostrarModalSucesso(personagemId ? 'editado' : 'criado');
            return true;
            
        } catch (error) {
            alert('Erro inesperado: ' + error.message);
            return false;
        }
    }
    
    // ======================
    // TRATAR ERROS
    // ======================
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
    
    // ======================
    // CARREGAR PERSONAGEM
    // ======================
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
    
    // ======================
    // EXCLUIR PERSONAGEM
    // ======================
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
    
    // ======================
    // MODAL DE SUCESSO
    // ======================
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
        
        // Contador
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
        
        // Botão para ir para personagens
        modal.querySelector('#btnIrPersonagens').addEventListener('click', () => {
            clearInterval(contadorInterval);
            window.location.href = 'personagens.html';
        });
        
        // Fechar modal ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                clearInterval(contadorInterval);
                document.body.removeChild(modal);
            }
        });
    }
}

// ======================
// INICIALIZAÇÃO
// ======================
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

// Exportar para uso global
window.salvamento = salvamento;
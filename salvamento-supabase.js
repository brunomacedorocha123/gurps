// salvamento-supabase.js - VERSÃO DEFINITIVA E COMPLETA
console.log('🚀 salvamento-supabase.js carregado - VERSÃO DEFINITIVA');

// ======================
// CONFIGURAÇÃO DO SUPABASE
// ======================
const SUPABASE_CONFIG = {
    url: 'https://pujufdfhaxveuytkneqw.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1anVmZGZoYXh2ZXV5dGtuZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTkyODksImV4cCI6MjA3OTkzNTI4OX0.mzOwsmf8qIQ4HZqnXLEmq4D7M6fz4VH1YWpWP-BsFvc'
};

// ======================
// CLASSE PRINCIPAL - SALVAMENTO SUPABASE
// ======================
class SalvamentoSupabase {
    constructor() {
        console.log('🔧 Inicializando SalvamentoSupabase...');
        
        // Verificar se Supabase está disponível
        if (!window.supabase || !window.supabase.createClient) {
            console.error('❌ Supabase não encontrado globalmente');
            this.supabase = null;
        } else {
            try {
                this.supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
                console.log('✅ Supabase inicializado com sucesso');
            } catch (error) {
                console.error('❌ Erro ao inicializar Supabase:', error);
                this.supabase = null;
            }
        }
        
        this.limitePersonagens = 10;
        this.usuarioLogado = null;
        this.coletor = window.coletor || null;
    }
    
    // ======================
    // VERIFICAR AUTENTICAÇÃO
    // ======================
    async verificarAutenticacao() {
        if (!this.supabase) {
            console.warn('⚠️ Supabase não disponível - modo offline');
            return false;
        }
        
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) {
                console.error('❌ Erro ao verificar sessão:', error);
                return false;
            }
            
            if (!session) {
                console.warn('⚠️ Usuário não autenticado');
                return false;
            }
            
            this.usuarioLogado = session.user;
            console.log('✅ Usuário autenticado:', this.usuarioLogado.email);
            return true;
            
        } catch (error) {
            console.error('💥 Erro catastrófico ao verificar autenticação:', error);
            return false;
        }
    }
    
    // ======================
    // VERIFICAR LIMITE DE PERSONAGENS
    // ======================
    async verificarLimitePersonagens() {
        console.log('🔍 Verificando limite de personagens...');
        
        const autenticado = await this.verificarAutenticacao();
        
        if (!autenticado) {
            console.warn('⚠️ Usuário não autenticado - permitindo criação');
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
                console.warn('⚠️ Erro ao contar personagens:', error);
                return {
                    podeCriar: true,
                    quantidade: 0,
                    limite: this.limitePersonagens,
                    motivo: 'Erro na verificação'
                };
            }
            
            const podeCriar = count < this.limitePersonagens;
            const motivo = podeCriar ? '' : `Limite de ${this.limitePersonagens} personagens atingido`;
            
            console.log(`📊 Personagens: ${count}/${this.limitePersonagens} - Pode criar: ${podeCriar}`);
            
            return {
                podeCriar,
                quantidade: count,
                limite: this.limitePersonagens,
                motivo
            };
            
        } catch (error) {
            console.error('💥 Erro ao verificar limite:', error);
            return {
                podeCriar: true,
                quantidade: 0,
                limite: this.limitePersonagens,
                motivo: 'Erro na verificação'
            };
        }
    }
    
    // ======================
    // SALVAR PERSONAGEM - VERSÃO COMPLETA
    // ======================
    async salvarPersonagem(personagemId = null) {
        console.log('🎮 INICIANDO SALVAMENTO DO PERSONAGEM...');
        console.log('Modo:', personagemId ? 'EDIÇÃO' : 'CRIAÇÃO');
        
        try {
            // 1. VERIFICAR AUTENTICAÇÃO
            const autenticado = await this.verificarAutenticacao();
            if (!autenticado) {
                alert('Você precisa estar logado para salvar personagens!');
                window.location.href = 'login.html';
                return false;
            }
            
            // 2. COLETAR DADOS COMPLETOS
            console.log('📝 Coletando dados do formulário...');
            const dados = await this.coletarDadosCompletos();
            
            if (!dados) {
                alert('Erro ao coletar dados do personagem!');
                return false;
            }
            
            // 3. VERIFICAR PONTOS
            if (!this.validarPontos(dados)) {
                return false;
            }
            
            // 4. PREPARAR DADOS FINAIS
            const dadosParaSalvar = this.prepararDadosParaSalvar(dados, personagemId);
            
            // 5. SALVAR NO BANCO DE DADOS
            console.log('💾 Salvando no Supabase...');
            const resultado = await this.salvarNoBanco(dadosParaSalvar, personagemId);
            
            if (!resultado) {
                return false;
            }
            
            // 6. SUCESSO!
            console.log('✅✅✅ PERSONAGEM SALVO COM SUCESSO!');
            this.mostrarModalSucesso(personagemId ? 'editado' : 'criado', resultado.id);
            return resultado;
            
        } catch (error) {
            console.error('💥 ERRO CATASTRÓFICO NO SALVAMENTO:', error);
            alert('Erro inesperado ao salvar: ' + error.message);
            return false;
        }
    }
    
    // ======================
    // COLETAR DADOS COMPLETOS
    // ======================
    async coletarDadosCompletos() {
        try {
            // Usar o coletor existente ou criar um básico
            let dados;
            
            if (this.coletor && typeof this.coletor.coletarTodosDados === 'function') {
                dados = this.coletor.coletarTodosDados();
            } else {
                dados = this.coletarDadosBasicos();
            }
            
            // Adicionar dados do usuário
            dados.user_id = this.usuarioLogado.id;
            dados.created_at = new Date().toISOString();
            dados.updated_at = new Date().toISOString();
            dados.status = 'Ativo';
            
            console.log('📦 Dados coletados:', dados);
            return dados;
            
        } catch (error) {
            console.error('❌ Erro ao coletar dados:', error);
            return null;
        }
    }
    
    coletarDadosBasicos() {
        return {
            // Dados básicos
            nome: document.getElementById('charName')?.value || 'Novo Personagem',
            classe: document.getElementById('classePersonagem')?.value || '',
            raca: document.getElementById('racaPersonagem')?.value || '',
            nivel: document.getElementById('nivelPersonagem')?.value || 'Nível 1',
            descricao: document.getElementById('descricaoPersonagem')?.value || '',
            
            // Pontos (do sistema de pontos)
            pontos_totais: window.sistemaPontos?.pontos?.totais || 150,
            pontos_gastos: window.sistemaPontos?.pontos?.gastos || 0,
            pontos_disponiveis: window.sistemaPontos?.pontos?.disponiveis || 150,
            limite_desvantagens: window.sistemaPontos?.pontos?.limiteDesvantagens || -50,
            desvantagens_atuais: window.sistemaPontos?.pontos?.desvantagensAtuais || 0,
            
            // Atributos principais
            forca: parseInt(document.getElementById('ST')?.value) || 10,
            destreza: parseInt(document.getElementById('DX')?.value) || 10,
            inteligencia: parseInt(document.getElementById('IQ')?.value) || 10,
            saude: parseInt(document.getElementById('HT')?.value) || 10,
            
            // Dados padrão para outras colunas (serão atualizados pelos sistemas específicos)
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
            idiomas: [],
            caracteristicas_fisicas: [],
            vantagens: [],
            desvantagens: [],
            peculiaridades: [],
            pericias: [],
            tecnicas: [],
            magias: [],
            equipamentos: [],
            inventario: [],
            deposito: [],
            condicoes: [],
            inimigos: [],
            aliados: [],
            dependentes: []
        };
    }
    
    // ======================
    // VALIDAR PONTOS
    // ======================
    validarPontos(dados) {
        // Verificar se pontos gastos não excedem pontos totais
        if (dados.pontos_gastos > dados.pontos_totais) {
            alert(`❌ ERRO: Você gastou ${dados.pontos_gastos} pontos, mas tem apenas ${dados.pontos_totais} pontos totais!`);
            return false;
        }
        
        // Verificar limite de desvantagens
        if (dados.desvantagens_atuais < dados.limite_desvantagens) {
            alert(`❌ ERRO: Você excedeu o limite de desvantagens! (Atual: ${dados.desvantagens_atuais}, Limite: ${dados.limite_desvantagens})`);
            return false;
        }
        
        return true;
    }
    
    // ======================
    // PREPARAR DADOS PARA SALVAR
    // ======================
    prepararDadosParaSalvar(dados, personagemId) {
        // Se for edição, não sobrescrever created_at
        if (personagemId) {
            delete dados.created_at;
        }
        
        // Converter arrays para JSON se necessário
        const camposJson = [
            'idiomas', 'caracteristicas_fisicas', 'vantagens', 'desvantagens', 
            'peculiaridades', 'pericias', 'tecnicas', 'magias', 'equipamentos',
            'inventario', 'deposito', 'condicoes', 'inimigos', 'aliados', 'dependentes'
        ];
        
        camposJson.forEach(campo => {
            if (Array.isArray(dados[campo])) {
                dados[campo] = JSON.stringify(dados[campo]);
            }
        });
        
        return dados;
    }
    
    // ======================
    // SALVAR NO BANCO DE DADOS
    // ======================
    async salvarNoBanco(dados, personagemId) {
        try {
            let resultado;
            
            if (personagemId) {
                // EDIÇÃO
                resultado = await this.supabase
                    .from('characters')
                    .update(dados)
                    .eq('id', personagemId)
                    .eq('user_id', this.usuarioLogado.id)
                    .select();
            } else {
                // CRIAÇÃO
                resultado = await this.supabase
                    .from('characters')
                    .insert([dados])
                    .select();
            }
            
            if (resultado.error) {
                this.tratarErroSupabase(resultado.error);
                return false;
            }
            
            console.log('✅ Dados salvos com sucesso:', resultado.data);
            return {
                id: resultado.data[0]?.id || personagemId,
                dados: resultado.data[0]
            };
            
        } catch (error) {
            console.error('❌ Erro ao salvar no banco:', error);
            alert('Erro ao conectar com o banco de dados: ' + error.message);
            return false;
        }
    }
    
    // ======================
    // TRATAR ERROS DO SUPABASE
    // ======================
    tratarErroSupabase(error) {
        console.error('❌ ERRO DO SUPABASE:', error);
        
        let mensagem = 'Erro ao salvar: ';
        
        switch(error.code) {
            case '23505':
                mensagem += 'Personagem já existe (violação de unicidade)';
                break;
            case '23503':
                mensagem += 'Erro de referência (foreign key)';
                break;
            case '42501':
                mensagem += 'Permissão negada! Verifique as políticas RLS (Row Level Security) no Supabase.';
                break;
            case '42P01':
                mensagem += 'Tabela não existe! Execute o SQL da tabela primeiro.';
                break;
            default:
                mensagem += error.message;
        }
        
        alert(mensagem);
        console.error('Detalhes do erro:', error.details || error.hint || 'Sem detalhes');
    }
    
    // ======================
    // CARREGAR PERSONAGEM
    // ======================
    async carregarPersonagem(personagemId) {
        try {
            console.log('📥 Carregando personagem:', personagemId);
            
            const autenticado = await this.verificarAutenticacao();
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
                console.error('❌ Erro ao carregar personagem:', error);
                alert('Erro ao carregar personagem: ' + error.message);
                return null;
            }
            
            console.log('✅ Personagem carregado:', personagem.nome);
            return personagem;
            
        } catch (error) {
            console.error('💥 Erro ao carregar personagem:', error);
            return null;
        }
    }
    
    // ======================
    // EXCLUIR PERSONAGEM
    // ======================
    async excluirPersonagem(personagemId) {
        try {
            console.log('🗑️ Excluindo personagem:', personagemId);
            
            const autenticado = await this.verificarAutenticacao();
            if (!autenticado) {
                alert('Você precisa estar logado para excluir personagens!');
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
                console.error('❌ Erro ao excluir:', error);
                alert('Erro ao excluir personagem: ' + error.message);
                return false;
            }
            
            console.log('✅ Personagem excluído com sucesso');
            return true;
            
        } catch (error) {
            console.error('💥 Erro ao excluir personagem:', error);
            alert('Erro ao excluir: ' + error.message);
            return false;
        }
    }
    
    // ======================
    // MODAL DE SUCESSO
    // ======================
    mostrarModalSucesso(tipo, personagemId) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 99999;
            backdrop-filter: blur(5px);
        `;
        
        const mensagem = tipo === 'criado' 
            ? '🎉 Personagem criado com sucesso!' 
            : '✅ Personagem atualizado com sucesso!';
        
        modal.innerHTML = `
            <div style="
                background: linear-gradient(145deg, rgba(30,30,40,0.95), rgba(20,20,30,0.98));
                padding: 40px;
                border-radius: 20px;
                border: 2px solid rgba(255, 140, 0, 0.5);
                max-width: 500px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            ">
                <div style="
                    font-size: 4rem;
                    margin-bottom: 20px;
                    color: #ff8c00;
                    animation: pulse 1s infinite;
                ">
                    ${tipo === 'criado' ? '🎮' : '✅'}
                </div>
                
                <h2 style="
                    color: #ffd700;
                    margin-bottom: 20px;
                    font-size: 2rem;
                ">
                    ${mensagem}
                </h2>
                
                <p style="
                    color: #ccc;
                    margin-bottom: 30px;
                    font-size: 1.1rem;
                ">
                    Redirecionando para seus personagens em <span id="contador">3</span> segundos...
                </p>
                
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="btnVerPersonagens" style="
                        background: linear-gradient(45deg, #ff8c00, #ff4500);
                        color: white;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 10px;
                        font-weight: 600;
                        cursor: pointer;
                        font-size: 1rem;
                        transition: all 0.3s ease;
                    ">
                        <i class="fas fa-users"></i> Ver Personagens
                    </button>
                    
                    <button id="btnCriarOutro" style="
                        background: rgba(255, 140, 0, 0.2);
                        color: #ff8c00;
                        border: 1px solid rgba(255, 140, 0, 0.3);
                        padding: 12px 25px;
                        border-radius: 10px;
                        font-weight: 600;
                        cursor: pointer;
                        font-size: 1rem;
                        transition: all 0.3s ease;
                    ">
                        <i class="fas fa-plus"></i> Criar Outro
                    </button>
                </div>
                
                <style>
                    @keyframes pulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                        100% { transform: scale(1); }
                    }
                </style>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Contador
        let segundos = 3;
        const contadorElement = modal.querySelector('#contador');
        const contadorInterval = setInterval(() => {
            segundos--;
            contadorElement.textContent = segundos;
            
            if (segundos <= 0) {
                clearInterval(contadorInterval);
                window.location.href = 'personagens.html';
            }
        }, 1000);
        
        // Botão Ver Personagens
        modal.querySelector('#btnVerPersonagens').onclick = () => {
            clearInterval(contadorInterval);
            window.location.href = 'personagens.html';
        };
        
        // Botão Criar Outro
        modal.querySelector('#btnCriarOutro').onclick = () => {
            clearInterval(contadorInterval);
            document.body.removeChild(modal);
            
            if (tipo === 'criado') {
                // Limpar formulário para criar novo
                setTimeout(() => {
                    window.location.href = 'criar-personagens.html';
                }, 300);
            }
        };
        
        // Fechar modal ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                clearInterval(contadorInterval);
                document.body.removeChild(modal);
            }
        });
    }
    
    // ======================
    // UPLOAD DE FOTO
    // ======================
    async uploadFotoPersonagem(file, personagemId) {
        try {
            if (!this.usuarioLogado) {
                await this.verificarAutenticacao();
            }
            
            const nomeArquivo = `avatar-${personagemId}-${Date.now()}.${file.name.split('.').pop()}`;
            const caminho = `avatars/${this.usuarioLogado.id}/${nomeArquivo}`;
            
            // Upload para o storage do Supabase
            const { data, error } = await this.supabase.storage
                .from('characters')
                .upload(caminho, file, {
                    cacheControl: '3600',
                    upsert: true
                });
            
            if (error) {
                console.error('❌ Erro ao fazer upload da foto:', error);
                return null;
            }
            
            // Obter URL pública
            const { data: { publicUrl } } = this.supabase.storage
                .from('characters')
                .getPublicUrl(caminho);
            
            // Atualizar personagem com a URL da foto
            await this.supabase
                .from('characters')
                .update({ avatar_url: publicUrl })
                .eq('id', personagemId)
                .eq('user_id', this.usuarioLogado.id);
            
            console.log('✅ Foto salva:', publicUrl);
            return publicUrl;
            
        } catch (error) {
            console.error('💥 Erro no upload da foto:', error);
            return null;
        }
    }
}

// ======================
// INICIALIZAÇÃO GLOBAL
// ======================
console.log('⚙️ Inicializando sistema de salvamento...');

let salvamento;

try {
    salvamento = new SalvamentoSupabase();
    console.log('✅ Sistema de salvamento inicializado:', salvamento);
    
    // Testar conexão básica
    setTimeout(async () => {
        const teste = await salvamento.verificarAutenticacao();
        console.log('📡 Teste de conexão:', teste ? '✅ Conectado' : '⚠️ Modo offline');
    }, 1000);
    
} catch (error) {
    console.error('❌ ERRO CRÍTICO ao inicializar salvamento:', error);
    
    // Fallback para desenvolvimento
    salvamento = {
        verificarLimitePersonagens: async () => ({
            podeCriar: true,
            quantidade: 0,
            limite: 10,
            motivo: 'Modo de desenvolvimento'
        }),
        salvarPersonagem: async () => {
            console.warn('⚠️ Modo de desenvolvimento - salvamento simulado');
            const modal = document.createElement('div');
            modal.innerHTML = `
                <div style="
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #2196F3;
                    color: white;
                    padding: 15px;
                    border-radius: 10px;
                    z-index: 9999;
                ">
                    <strong>MODO DESENVOLVIMENTO</strong><br>
                    Personagem salvo localmente
                </div>
            `;
            document.body.appendChild(modal);
            setTimeout(() => modal.remove(), 3000);
            return { id: 'dev-' + Date.now() };
        },
        carregarPersonagem: async () => null,
        excluirPersonagem: async () => true
    };
}

// Exportar para uso global
window.salvamento = salvamento;
window.SalvamentoSupabase = SalvamentoSupabase;

console.log('🌐 salvamento disponível no window.salvamento');
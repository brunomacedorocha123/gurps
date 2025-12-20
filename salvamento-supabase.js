// salvamento-supabase.js - VERSÃO SIMPLIFICADA E FUNCIONAL
console.log('✅ salvamento-supabase.js carregado');

// Configuração global
const SUPABASE_URL = 'https://pujufdfhaxveuytkneqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1anVmZGZoYXh2ZXV5dGtuZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTkyODksImV4cCI6MjA3OTkzNTI4OX0.mzOwsmf8qIQ4HZqnXLEmq4D7M6fz4VH1YWpWP-BsFvc';

// Cliente Supabase global
let supabaseClient = null;
let usuarioAtualId = null;

// ============================================
// INICIALIZAÇÃO SIMPLIFICADA
// ============================================
async function inicializarSalvamento() {
    console.log('🔄 Inicializando salvamento...');
    
    try {
        // Criar cliente Supabase
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Cliente Supabase criado');
        
        // Verificar sessão
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) {
            console.error('❌ Erro na sessão:', error);
            throw error;
        }
        
        if (!data.session) {
            console.error('❌ Nenhuma sessão encontrada');
            alert('⚠️ Faça login primeiro!');
            window.location.href = 'login.html';
            return false;
        }
        
        usuarioAtualId = data.session.user.id;
        console.log('✅ Usuário ID:', usuarioAtualId);
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        return false;
    }
}

// ============================================
// FUNÇÃO PRINCIPAL DE SALVAMENTO
// ============================================
async function salvarPersonagemCompleto() {
    console.log('💾 Iniciando salvamento completo...');
    
    const botaoSalvar = document.getElementById('btnSalvar');
    if (!botaoSalvar) {
        console.error('❌ Botão salvar não encontrado');
        return;
    }
    
    // Salvar texto original do botão
    const textoOriginal = botaoSalvar.innerHTML;
    
    try {
        // 1. Mostrar loading
        botaoSalvar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        botaoSalvar.disabled = true;
        
        // 2. Inicializar se necessário
        if (!supabaseClient || !usuarioAtualId) {
            const inicializado = await inicializarSalvamento();
            if (!inicializado) {
                throw new Error('Falha na inicialização');
            }
        }
        
        // 3. Verificar se é edição ou novo
        const urlParams = new URLSearchParams(window.location.search);
        const personagemId = urlParams.get('id');
        console.log('📋 Modo:', personagemId ? 'EDIÇÃO' : 'CRIAÇÃO', 'ID:', personagemId);
        
        // 4. Coletar dados de TODAS as abas
        const dadosCompletos = coletarDadosDeTodasAbas();
        console.log('📦 Dados coletados:', dadosCompletos);
        
        // 5. Preparar dados para salvar
        const dadosParaSalvar = {
            ...dadosCompletos,
            user_id: usuarioAtualId,
            updated_at: new Date().toISOString()
        };
        
        // 6. Adicionar created_at se for novo
        if (!personagemId) {
            dadosParaSalvar.created_at = new Date().toISOString();
        }
        
        // 7. SALVAR NO BANCO
        let resultado;
        if (personagemId) {
            // Atualizar existente
            const { data, error } = await supabaseClient
                .from('characters')
                .update(dadosParaSalvar)
                .eq('id', personagemId)
                .eq('user_id', usuarioAtualId)
                .select();
            
            if (error) throw error;
            resultado = data;
            console.log('✅ Personagem ATUALIZADO:', resultado);
            
        } else {
            // Criar novo
            const { data, error } = await supabaseClient
                .from('characters')
                .insert([dadosParaSalvar])
                .select();
            
            if (error) throw error;
            resultado = data;
            console.log('✅ Personagem CRIADO:', resultado);
        }
        
        // 8. Mostrar mensagem de sucesso
        mostrarNotificacao('✅ Personagem salvo com sucesso!', 'success');
        
        // 9. Se for novo, atualizar URL com o ID
        if (!personagemId && resultado && resultado[0]) {
            setTimeout(() => {
                window.history.replaceState({}, '', `criar-personagens.html?id=${resultado[0].id}`);
                mostrarNotificacao('✅ ID atualizado na URL!', 'success');
            }, 500);
        }
        
        return resultado;
        
    } catch (error) {
        console.error('❌ ERRO NO SALVAMENTO:', error);
        
        // Mensagem amigável
        let mensagem = 'Erro ao salvar: ';
        
        if (error.message.includes('permission denied')) {
            mensagem = '🔒 Permissão negada! Verifique login.';
        } else if (error.message.includes('network')) {
            mensagem = '🌐 Problema de conexão. Verifique internet.';
        } else if (error.message.includes('JSON')) {
            mensagem = '📄 Erro nos dados. Verifique campos.';
        } else {
            mensagem += error.message;
        }
        
        mostrarNotificacao(mensagem, 'error');
        return null;
        
    } finally {
        // Restaurar botão
        botaoSalvar.innerHTML = textoOriginal;
        botaoSalvar.disabled = false;
    }
}

// ============================================
// COLETOR DE DADOS DE TODAS AS ABAS
// ============================================
function coletarDadosDeTodasAbas() {
    console.log('📋 Coletando dados de todas as abas...');
    
    const dados = {
        // DADOS BÁSICOS (Dashboard)
        nome: document.getElementById('charName')?.value || 'Novo Personagem',
        raca: document.getElementById('racaPersonagem')?.value || '',
        classe: document.getElementById('classePersonagem')?.value || '',
        nivel: document.getElementById('nivelPersonagem')?.value || '',
        descricao: document.getElementById('descricaoPersonagem')?.value || '',
        
        // ATRIBUTOS
        forca: parseInt(document.getElementById('ST')?.value) || 10,
        destreza: parseInt(document.getElementById('DX')?.value) || 10,
        inteligencia: parseInt(document.getElementById('IQ')?.value) || 10,
        saude: parseInt(document.getElementById('HT')?.value) || 10,
        
        // PONTOS DE VIDA/FADIGA
        pontos_vida: parseInt(document.getElementById('PVTotal')?.textContent) || 10,
        pontos_fadiga: parseInt(document.getElementById('PFTotal')?.textContent) || 10,
        pv_atual: parseInt(document.getElementById('pvAtualDisplay')?.value) || 10,
        pv_maximo: parseInt(document.getElementById('pvMaxDisplay')?.textContent) || 10,
        pf_atual: parseInt(document.getElementById('pfAtualDisplay')?.value) || 10,
        pf_maximo: parseInt(document.getElementById('pfMaxDisplay')?.textContent) || 10,
        
        // PONTOS DO SISTEMA
        pontos_totais: parseInt(document.getElementById('pontosTotaisDashboard')?.value) || 150,
        pontos_gastos: parseInt(document.getElementById('pontosGastosDashboard')?.textContent) || 0,
        pontos_disponiveis: parseInt(document.getElementById('saldoDisponivelDashboard')?.textContent) || 150,
        
        // CARACTERÍSTICAS
        aparencia: document.getElementById('nivelAparencia')?.options[document.getElementById('nivelAparencia')?.selectedIndex]?.text || 'Comum',
        riqueza: document.getElementById('nivelRiqueza')?.options[document.getElementById('nivelRiqueza')?.selectedIndex]?.text || 'Média',
        altura: parseFloat(document.getElementById('altura')?.value) || 1.70,
        peso: parseFloat(document.getElementById('peso')?.value) || 70,
        idioma_materno: document.getElementById('idiomaMaternoNome')?.value || 'Comum',
        
        // DEFESAS (Combate)
        esquiva: parseInt(document.getElementById('esquivaTotal')?.textContent) || 8,
        bloqueio: parseInt(document.getElementById('bloqueioTotal')?.textContent) || 9,
        aparar: parseInt(document.getElementById('apararTotal')?.textContent) || 0,
        deslocamento: parseFloat(document.getElementById('deslocamentoTotal')?.textContent) || 5.00,
        
        // DANO
        dano_gdp: document.getElementById('danoGDP')?.textContent || '1d-2',
        dano_geb: document.getElementById('danoGEB')?.textContent || '1d',
        
        // FINANCEIRO (Equipamentos)
        dinheiro: extrairValorNumerico('dinheiroEquipamento') || 2000,
        peso_atual: extrairValorNumerico('pesoAtual') || 0,
        peso_maximo: extrairValorNumerico('pesoMaximo') || 60,
        
        // LISTAS (como JSON)
        vantagens: coletarListaComoJSON('vantagens-adquiridas', '.vantagem-adquirida'),
        desvantagens: coletarListaComoJSON('desvantagens-adquiridas', '.desvantagem-adquirida'),
        pericias: coletarListaComoJSON('pericias-aprendidas', '.pericia-adquirida'),
        magias: coletarListaComoJSON('magias-aprendidas', '.magia-adquirida'),
        peculiaridades: coletarPeculiaridadesComoJSON(),
        equipamentos: coletarEquipamentosComoJSON(),
        
        // TOTAIS
        total_vantagens: contarItens('vantagens-adquiridas', '.vantagem-adquirida'),
        total_desvantagens: contarItens('desvantagens-adquiridas', '.desvantagem-adquirida'),
        total_pericias: contarItens('pericias-aprendidas', '.pericia-adquirida'),
        total_magias: contarItens('magias-aprendidas', '.magia-adquirida'),
        
        // STATUS
        status: 'Ativo',
        updated_at: new Date().toISOString()
    };
    
    return dados;
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================
function extrairValorNumerico(elementId) {
    const elemento = document.getElementById(elementId);
    if (!elemento) return 0;
    
    const texto = elemento.textContent || elemento.value || '';
    const numeros = texto.replace(/[^0-9.-]+/g, '');
    return parseFloat(numeros) || 0;
}

function coletarListaComoJSON(containerId, seletorItem) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    
    const itens = [];
    const elementos = container.querySelectorAll(seletorItem);
    
    elementos.forEach(elemento => {
        const nome = elemento.querySelector('.nome-vantagem, .nome-desvantagem, .pericia-nome, .magia-nome')?.textContent?.trim();
        if (nome && !nome.includes('Nenhum')) {
            itens.push(nome);
        }
    });
    
    return JSON.stringify(itens);
}

function coletarPeculiaridadesComoJSON() {
    const container = document.getElementById('lista-peculiaridades');
    if (!container) return '[]';
    
    const peculiaridades = [];
    const elementos = container.querySelectorAll('.peculiaridade-item');
    
    elementos.forEach(elemento => {
        const texto = elemento.querySelector('.peculiaridade-texto')?.textContent?.trim();
        if (texto) {
            peculiaridades.push(texto);
        }
    });
    
    return JSON.stringify(peculiaridades);
}

function coletarEquipamentosComoJSON() {
    const container = document.getElementById('lista-equipamentos-adquiridos');
    if (!container) return '[]';
    
    const equipamentos = [];
    const elementos = container.querySelectorAll('.equipamento-adquirido');
    
    elementos.forEach(elemento => {
        const nome = elemento.querySelector('.equipamento-nome')?.textContent?.trim();
        if (nome && nome !== 'Inventário Vazio') {
            equipamentos.push(nome);
        }
    });
    
    return JSON.stringify(equipamentos);
}

function contarItens(containerId, seletorItem) {
    const container = document.getElementById(containerId);
    if (!container) return 0;
    
    const elementos = container.querySelectorAll(seletorItem);
    return elementos.length;
}

function mostrarNotificacao(mensagem, tipo = 'info') {
    // Remover notificação anterior
    const notificacaoAnterior = document.querySelector('.notificacao-flutuante');
    if (notificacaoAnterior) notificacaoAnterior.remove();
    
    // Criar nova notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao-flutuante ${tipo}`;
    notificacao.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
        <span>${mensagem}</span>
    `;
    
    // Estilos
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${tipo === 'success' ? 'rgba(46, 204, 113, 0.9)' : 'rgba(231, 76, 60, 0.9)'};
        color: white;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(notificacao);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notificacao.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notificacao.remove(), 300);
    }, 3000);
}

// ============================================
// CONFIGURAR EVENTO NO BOTÃO SALVAR
// ============================================
function configurarBotaoSalvar() {
    const botaoSalvar = document.getElementById('btnSalvar');
    if (!botaoSalvar) {
        console.error('❌ Botão salvar não encontrado no DOM');
        setTimeout(configurarBotaoSalvar, 1000); // Tentar novamente
        return;
    }
    
    console.log('✅ Configurando botão salvar...');
    
    // Remover event listener antigo se existir
    const novoBotao = botaoSalvar.cloneNode(true);
    botaoSalvar.parentNode.replaceChild(novoBotao, botaoSalvar);
    
    // Adicionar novo event listener
    novoBotao.addEventListener('click', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🎯 Botão salvar clicado!');
        await salvarPersonagemCompleto();
    });
    
    console.log('✅ Botão salvar configurado!');
}

// ============================================
// INICIALIZAR QUANDO A PÁGINA CARREGAR
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado, configurando salvamento...');
    
    // Configurar botão salvar
    configurarBotaoSalvar();
    
    // Inicializar salvamento
    setTimeout(async () => {
        const inicializado = await inicializarSalvamento();
        if (inicializado) {
            console.log('✅ Sistema de salvamento pronto!');
        } else {
            console.error('❌ Falha na inicialização do salvamento');
        }
    }, 1000);
});

// ============================================
// EXPORTAR FUNÇÕES PARA USO GLOBAL
// ============================================
window.salvarPersonagemCompleto = salvarPersonagemCompleto;
window.inicializarSalvamento = inicializarSalvamento;
window.coletarDadosDeTodasAbas = coletarDadosDeTodasAbas;

console.log('🎯 Módulo de salvamento carregado e pronto!');
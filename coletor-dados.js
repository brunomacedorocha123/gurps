// coletor-dados.js - VERSÃO SIMPLIFICADA
console.log('✅ coletor-dados.js carregado');

// Função para coletar dados de forma segura
function coletarDadosSeguro() {
    console.log('📊 Coletando dados de forma segura...');
    
    try {
        return coletarDadosDeTodasAbas();
    } catch (error) {
        console.error('❌ Erro ao coletar dados:', error);
        return {
            nome: document.getElementById('charName')?.value || 'Novo Personagem',
            forca: 10,
            destreza: 10,
            inteligencia: 10,
            saude: 10,
            user_id: window.usuarioAtualId || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }
}

// Exportar para uso global
window.coletarDadosSeguro = coletarDadosSeguro;
console.log('✅ Coletor de dados pronto!');
// ===== CONEXÃO CRÍTICA COM PERÍCIAS =====
console.log("🔗 Conectando sistema de técnicas com perícias...");

// 1. VERIFICAR SE O SISTEMA DE PERÍCIAS ESTÁ CARREGADO
function verificarSistemaPericias() {
    console.log("📋 Verificando estado das perícias:");
    
    // Verificar perícias aprendidas
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        console.log("✅ Sistema de perícias encontrado!");
        console.log("Perícias aprendidas atuais:", 
            window.estadoPericias.periciasAprendidas.map(p => 
                `${p.nome} (${p.id}): nível ${p.nivel}`
            ));
        return true;
    } else {
        console.warn("⚠️ Sistema de perícias NÃO encontrado!");
        console.log("Estado disponível:", window.estadoPericias);
        return false;
    }
}

// 2. OBTER PERÍCIA ESPECÍFICA (CRÍTICA!)
function obterPericiaEspecifica(id) {
    console.log(`🔍 Buscando perícia: "${id}"`);
    
    // Primeiro, verificar no estado atual das perícias aprendidas
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        // Busca por ID exato
        const encontrada = window.estadoPericias.periciasAprendidas.find(p => 
            p.id === id || 
            p.id.includes(id) ||
            (p.nome && p.nome.toLowerCase().includes(id.toLowerCase()))
        );
        
        if (encontrada) {
            console.log(`✅ Perícia encontrada: ${encontrada.nome} (nível ${encontrada.nivel})`);
            return encontrada;
        }
    }
    
    // Se não encontrou, tentar no catálogo
    if (window.buscarPericiaPorId) {
        const doCatalogo = window.buscarPericiaPorId(id);
        if (doCatalogo) {
            console.log(`ℹ️ Perícia "${id}" existe no catálogo (mas não aprendida)`);
            return null; // Não aprendida ainda
        }
    }
    
    console.warn(`❌ Perícia "${id}" não encontrada em lugar nenhum`);
    return null;
}

// 3. OBTER NH DA PERÍCIA ARCO (FUNÇÃO ESSENCIAL)
function obterNHArcoAtual() {
    console.log("🎯 Calculando NH atual do Arco...");
    
    // Obter valor base do atributo DX
    const dxAtual = window.obterAtributoAtual ? 
        window.obterAtributoAtual('DX') : 10;
    console.log(`   DX base: ${dxAtual}`);
    
    // Buscar a perícia Arco
    const periciaArco = obterPericiaEspecifica('arco');
    
    if (periciaArco && periciaArco.nivel) {
        const nhArco = dxAtual + periciaArco.nivel;
        console.log(`✅ NH Arco calculado: ${nhArco} (DX ${dxAtual} + nível ${periciaArco.nivel})`);
        return nhArco;
    }
    
    // Se não tem a perícia, usar só o atributo
    console.log(`⚠️ Arco não aprendido, usando DX base: ${dxAtual}`);
    return dxAtual;
}

// 4. VERIFICAR PRÉ-REQUISITOS DA TÉCNICA
function verificarPreRequisitosTecnica(tecnica) {
    console.log(`🔧 Verificando pré-requisitos para: ${tecnica.nome}`);
    
    const requisitos = {
        arco: { passou: false, nivel: 0, necessario: 4 },
        cavalgar: { passou: false }
    };
    
    // VERIFICAR ARCO
    const arco = obterPericiaEspecifica('arco');
    if (arco && arco.nivel >= 4) {
        requisitos.arco.passou = true;
        requisitos.arco.nivel = arco.nivel;
        console.log(`✅ Arco: nível ${arco.nivel} >= 4`);
    } else {
        console.log(`❌ Arco: ${arco ? `nível ${arco.nivel} < 4` : 'não aprendido'}`);
    }
    
    // VERIFICAR CAVALGAR
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const temCavalgar = window.estadoPericias.periciasAprendidas.some(p => 
            p.id.includes('cavalgar') || 
            p.grupo === 'Cavalgar' ||
            p.nome.includes('Cavalgar')
        );
        
        if (temCavalgar) {
            requisitos.cavalgar.passou = true;
            console.log("✅ Cavalgar: possui alguma especialização");
        } else {
            console.log("❌ Cavalgar: não possui nenhuma especialização");
        }
    }
    
    // RESULTADO
    const passou = requisitos.arco.passou && requisitos.cavalgar.passou;
    let motivo = '';
    
    if (!passou) {
        if (!requisitos.arco.passou) {
            motivo = `Precisa de Arco nível 4 (atual: ${requisitos.arco.nivel || 0})`;
        } else if (!requisitos.cavalgar.passou) {
            motivo = 'Precisa de alguma perícia de Cavalgar';
        }
    }
    
    console.log(`📋 Resultado: ${passou ? 'APROVADO' : 'REPROVADO'} - ${motivo}`);
    return { passou, motivo };
}

// 5. ATUALIZAR LISTA DE TÉCNICAS DISPONÍVEIS
function atualizarListaTecnicasDisponiveis() {
    console.log("🔄 Atualizando lista de técnicas disponíveis...");
    
    // Verificar se tem o catálogo
    if (!window.catalogoTecnicas) {
        console.error("❌ Catálogo de técnicas não encontrado!");
        return;
    }
    
    // Verificar sistema de perícias
    if (!verificarSistemaPericias()) {
        console.warn("⚠️ Aguardando sistema de perícias carregar...");
        setTimeout(atualizarListaTecnicasDisponiveis, 1000);
        return;
    }
    
    // Obter todas técnicas do catálogo
    const todasTecnicas = window.catalogoTecnicas.obterTodasTecnicas();
    console.log(`   Técnicas no catálogo: ${todasTecnicas.length}`);
    
    const tecnicasAtualizadas = todasTecnicas.map(tecnica => {
        // Verificar pré-requisitos
        const requisitos = verificarPreRequisitosTecnica(tecnica);
        
        // Calcular NH atual
        let nhAtual = 0;
        let nhArco = 0;
        
        if (tecnica.basePericia === 'arco') {
            nhArco = obterNHArcoAtual();
            nhAtual = nhArco - (tecnica.modificadorBase || 0);
            
            console.log(`   ${tecnica.nome}: NH Arco = ${nhArco}, Base = ${nhAtual} (${tecnica.basePericia}${tecnica.modificadorBase || 0})`);
        }
        
        return {
            ...tecnica,
            disponivel: requisitos.passou,
            motivoIndisponivel: requisitos.motivo,
            nhAtual: nhAtual,
            nhArco: nhArco
        };
    });
    
    // Atualizar estado
    estadoTecnicas.tecnicasDisponiveis = tecnicasAtualizadas;
    
    // Renderizar
    renderizarCatalogoTecnicas();
    
    console.log(`✅ Lista atualizada: ${tecnicasAtualizadas.filter(t => t.disponivel).length} técnicas disponíveis`);
}

// 6. INICIALIZAR O SISTEMA COMPLETO
function inicializarSistemaTecnicasCompleto() {
    console.log("🚀 INICIALIZANDO SISTEMA DE TÉCNICAS COMPLETO");
    
    // Aguardar um pouco para garantir que as perícias carregaram
    setTimeout(() => {
        console.log("⏳ Verificando dependências...");
        
        // Carregar técnicas salvas
        carregarTecnicas();
        
        // Configurar eventos
        configurarEventListenersTecnicas();
        
        // Atualizar lista inicial
        atualizarListaTecnicasDisponiveis();
        
        // Renderizar técnicas aprendidas
        renderizarTecnicasAprendidas();
        
        // Atualizar estatísticas
        atualizarEstatisticasTecnicas();
        
        // Observar mudanças nas perícias
        observarMudancasPericias();
        
        console.log("✅ SISTEMA DE TÉCNICAS INICIALIZADO COM SUCESSO!");
        
        // Debug: mostrar estado atual
        console.log("📊 ESTADO ATUAL:");
        console.log("- Perícias aprendidas:", window.estadoPericias?.periciasAprendidas?.length || 0);
        console.log("- Técnicas aprendidas:", estadoTecnicas.tecnicasAprendidas.length);
        console.log("- Técnicas disponíveis:", estadoTecnicas.tecnicasDisponiveis.filter(t => t.disponivel).length);
        
    }, 1500);
}

// ===== SUBSTITUIR AS FUNÇÕES ANTERIORES =====
// Remova as funções antigas e use estas:

// Substitua a função buscarPericiaEspecificaNoSistema por:
window.buscarPericiaEspecificaNoSistema = obterPericiaEspecifica;

// Substitua a função obterNHPericiaPorId por:
window.obterNHPericiaPorId = function(id) {
    if (id === 'arco') {
        return obterNHArcoAtual();
    }
    return obterNHArcoAtual(); // Fallback
};

// Substitua a função verificarPreRequisitosTecnica pela nova versão

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM carregado, preparando sistema de técnicas...");
    
    // Aguardar a aba de perícias aparecer
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const abaPericias = document.getElementById('pericias');
                if (abaPericias && abaPericias.style.display !== 'none') {
                    console.log("🎯 Aba de perícias visível, inicializando técnicas...");
                    
                    if (!window.sistemaTecnicasInicializado) {
                        inicializarSistemaTecnicasCompleto();
                        window.sistemaTecnicasInicializado = true;
                        observer.disconnect(); // Parar de observar
                    }
                }
            }
        });
    });
    
    // Observar a aba de perícias
    const abaPericias = document.getElementById('pericias');
    if (abaPericias) {
        observer.observe(abaPericias, { 
            attributes: true, 
            attributeFilter: ['style'] 
        });
    }
    
    // Fallback: inicializar após 3 segundos
    setTimeout(() => {
        if (!window.sistemaTecnicasInicializado) {
            console.log("⏰ Timeout - Inicializando técnicas...");
            inicializarSistemaTecnicasCompleto();
            window.sistemaTecnicasInicializado = true;
        }
    }, 3000);
});

// ===== DEBUG: TESTAR CONEXÃO =====
window.testarConexaoTecnicas = function() {
    console.log("🧪 TESTE DE CONEXÃO TÉCNICAS-PERÍCIAS");
    console.log("=====================================");
    
    // 1. Verificar sistema de perícias
    console.log("1. Sistema de perícias:", 
        window.estadoPericias ? "✅ ENCONTRADO" : "❌ NÃO ENCONTRADO");
    
    // 2. Verificar perícias aprendidas
    if (window.estadoPericias) {
        console.log("2. Perícias aprendidas:", 
            window.estadoPericias.periciasAprendidas?.length || 0);
        
        window.estadoPericias.periciasAprendidas?.forEach(p => {
            console.log(`   - ${p.nome} (${p.id}): nível ${p.nivel}`);
        });
    }
    
    // 3. Testar busca de Arco
    console.log("3. Buscando Arco...");
    const arco = obterPericiaEspecifica('arco');
    console.log(`   Resultado: ${arco ? `Encontrado (nível ${arco.nivel})` : 'Não encontrado'}`);
    
    // 4. Testar NH do Arco
    console.log("4. Calculando NH Arco...");
    const nhArco = obterNHArcoAtual();
    console.log(`   NH Arco atual: ${nhArco}`);
    
    // 5. Testar pré-requisitos
    console.log("5. Testando pré-requisitos...");
    const tecnicaTeste = window.catalogoTecnicas?.buscarTecnicaPorId('arquearia-montada');
    if (tecnicaTeste) {
        const req = verificarPreRequisitosTecnica(tecnicaTeste);
        console.log(`   ${tecnicaTeste.nome}: ${req.passou ? '✅ APROVADO' : '❌ REPROVADO'}`);
        if (!req.passou) console.log(`   Motivo: ${req.motivo}`);
    }
    
    console.log("=====================================");
    console.log("🧪 FIM DO TESTE");
};

// Exportar funções
window.inicializarSistemaTecnicasCompleto = inicializarSistemaTecnicasCompleto;
window.atualizarListaTecnicasDisponiveis = atualizarListaTecnicasDisponiveis;
window.testarConexaoTecnicas = window.testarConexaoTecnicas;
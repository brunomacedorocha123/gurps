// resumo-tecnicas.js - SISTEMA DIRETO E COMPLETO
console.log("🎯 RESUMO-TÉCNICAS.JS - VERSÃO DIRETA");

// ============================================
// 1. SISTEMA PRINCIPAL
// ============================================

// Estado global
let tecnicasResumoEstado = {
    tecnicas: [],
    totalPontos: 0,
    monitorAtivo: false,
    intervaloId: null
};

// ============================================
// 2. FUNÇÃO PRINCIPAL: CAPTURAR TÉCNICAS
// ============================================

function capturarTecnicasParaResumo() {
    console.log("🔍 Capturando técnicas para o resumo...");
    
    // Resetar
    tecnicasResumoEstado.tecnicas = [];
    tecnicasResumoEstado.totalPontos = 0;
    
    // ESTRATÉGIA 1: Estado global (do tecnicas.js)
    if (window.estadoTecnicas && window.estadoTecnicas.aprendidas) {
        console.log("✅ Usando estado global das técnicas");
        
        window.estadoTecnicas.aprendidas.forEach(t => {
            const pontos = t.custoTotal || t.custo || 0;
            
            tecnicasResumoEstado.tecnicas.push({
                nome: t.nome || 'Técnica',
                pontos: pontos,
                dificuldade: t.dificuldade || 'Média',
                id: t.id || ''
            });
            
            tecnicasResumoEstado.totalPontos += pontos;
        });
        
        console.log(`📊 Do estado global: ${tecnicasResumoEstado.tecnicas.length} técnicas`);
    }
    
    // ESTRATÉGIA 2: Se não encontrou, buscar no HTML
    if (tecnicasResumoEstado.tecnicas.length === 0) {
        console.log("⚠️ Buscando técnicas no HTML...");
        buscarTecnicasNoHTML();
    }
    
    // ESTRATÉGIA 3: Buscar técnica específica Arquearia Montada
    if (tecnicasResumoEstado.tecnicas.length === 0) {
        buscarArqueariaMontada();
    }
    
    console.log(`🎯 Total: ${tecnicasResumoEstado.tecnicas.length} técnicas, ${tecnicasResumoEstado.totalPontos} pontos`);
    
    return {
        tecnicas: tecnicasResumoEstado.tecnicas,
        totalPontos: tecnicasResumoEstado.totalPontos
    };
}

// ============================================
// 3. BUSCAR NO HTML
// ============================================

function buscarTecnicasNoHTML() {
    try {
        // Container onde ficam as técnicas aprendidas
        const container = document.getElementById('tecnicas-aprendidas');
        if (!container) {
            console.log("❌ Container 'tecnicas-aprendidas' não encontrado");
            return;
        }
        
        // Se tiver mensagem de vazio, parar aqui
        if (container.textContent.includes('Nenhuma técnica') || 
            container.textContent.includes('nenhuma-pericia-aprendida')) {
            console.log("ℹ️ HTML mostra que não tem técnicas");
            return;
        }
        
        // Procurar todos os elementos que parecem ser técnicas
        const elementos = container.querySelectorAll('div');
        
        elementos.forEach(elemento => {
            // Ignorar elementos muito pequenos
            if (elemento.textContent.length < 10) return;
            
            const texto = elemento.textContent;
            
            // Verificar se parece uma técnica
            const ehTecnica = texto.includes('Técnica') || 
                             texto.includes('Arquearia') ||
                             texto.includes('Difícil') ||
                             texto.includes('Média') ||
                             texto.match(/NH\s*\d+/) ||
                             texto.match(/\d+\s*pts?/i);
            
            if (ehTecnica) {
                // Extrair nome
                let nome = 'Técnica';
                const nomesPossiveis = ['Arquearia Montada', 'Técnica Especial'];
                
                for (const n of nomesPossiveis) {
                    if (texto.includes(n)) {
                        nome = n;
                        break;
                    }
                }
                
                // Extrair pontos
                let pontos = 0;
                const matchPontos = texto.match(/(\d+)\s*pts?/i);
                if (matchPontos) pontos = parseInt(matchPontos[1]);
                
                // Extrair nível NH
                let nivel = 0;
                const matchNivel = texto.match(/NH\s*(\d+)/i);
                if (matchNivel) nivel = parseInt(matchNivel[1]);
                
                // Determinar dificuldade
                let dificuldade = 'Média';
                if (texto.includes('Difícil')) dificuldade = 'Difícil';
                if (texto.includes('Fácil')) dificuldade = 'Fácil';
                
                if (pontos > 0) {
                    tecnicasResumoEstado.tecnicas.push({
                        nome: nome,
                        pontos: pontos,
                        nivel: nivel,
                        dificuldade: dificuldade
                    });
                    
                    tecnicasResumoEstado.totalPontos += pontos;
                    
                    console.log(`✅ Capturada: ${nome} (${pontos} pts)`);
                }
            }
        });
        
    } catch (erro) {
        console.error("❌ Erro ao buscar no HTML:", erro);
    }
}

// ============================================
// 4. BUSCAR ARQUEARIA MONTADA ESPECÍFICA
// ============================================

function buscarArqueariaMontada() {
    // Card específico da Arquearia Montada
    const card = document.getElementById('tecnica-arquearia-montada');
    if (!card) return;
    
    const texto = card.textContent || '';
    
    // Extrair pontos
    let pontos = 0;
    const matchPontos = texto.match(/(\d+)\s*pontos?/i);
    if (matchPontos) pontos = parseInt(matchPontos[1]);
    
    // Extrair nível
    let nivel = 0;
    const matchNivel = texto.match(/NH\s*(\d+)/i);
    if (matchNivel) nivel = parseInt(matchNivel[1]);
    
    if (pontos > 0) {
        tecnicasResumoEstado.tecnicas.push({
            nome: 'Arquearia Montada',
            pontos: pontos,
            nivel: nivel,
            dificuldade: 'Difícil'
        });
        
        tecnicasResumoEstado.totalPontos = pontos;
        
        console.log(`✅ Arquearia Montada: ${pontos} pts, NH ${nivel}`);
    }
}

// ============================================
// 5. ATUALIZAR A TELA DO RESUMO
// ============================================

function atualizarTelaTecnicasResumo() {
    console.log("🔄 Atualizando tela do resumo...");
    
    try {
        // 1. Atualizar pontos totais
        const elementoPontos = document.getElementById('pontosTecnicas');
        if (elementoPontos) {
            elementoPontos.textContent = tecnicasResumoEstado.totalPontos;
            console.log(`💰 Pontos atualizados: ${tecnicasResumoEstado.totalPontos}`);
        }
        
        // 2. Atualizar lista
        atualizarListaTecnicasResumo();
        
        console.log("✅ Tela do resumo atualizada");
        
    } catch (erro) {
        console.error("❌ Erro ao atualizar tela:", erro);
    }
}

function atualizarListaTecnicasResumo() {
    const container = document.getElementById('listaTecnicasResumo');
    if (!container) {
        console.log("❌ Container 'listaTecnicasResumo' não encontrado");
        return;
    }
    
    // Limpar container
    container.innerHTML = '';
    
    // Se não tem técnicas
    if (tecnicasResumoEstado.tecnicas.length === 0) {
        container.innerHTML = '<div class="vazio">Nenhuma técnica</div>';
        return;
    }
    
    // Ordenar por pontos (maiores primeiro)
    const tecnicasOrdenadas = [...tecnicasResumoEstado.tecnicas].sort((a, b) => b.pontos - a.pontos);
    
    // Adicionar cada técnica
    tecnicasOrdenadas.forEach((tecnica, index) => {
        // Limitar a 8 itens
        if (index >= 8) return;
        
        const item = document.createElement('div');
        item.className = 'item-lista-micro';
        
        // Formatar nome
        let nomeDisplay = tecnica.nome;
        if (nomeDisplay.length > 22) {
            nomeDisplay = nomeDisplay.substring(0, 19) + '...';
        }
        
        // Escolher ícone
        let icon = '🔧';
        if (tecnica.dificuldade === 'Difícil') icon = '⚔️';
        if (tecnica.dificuldade === 'Fácil') icon = '🎯';
        
        item.innerHTML = `
            <div class="item-micro-conteudo">
                <span class="item-micro-icon">${icon}</span>
                <span class="item-micro-texto">
                    ${nomeDisplay}
                    ${tecnica.nivel ? `<small>NH${tecnica.nivel}</small>` : ''}
                </span>
                <span class="item-micro-pontos">${tecnica.pontos}</span>
            </div>
        `;
        
        container.appendChild(item);
    });
    
    // Mostrar se tem mais itens
    if (tecnicasResumoEstado.tecnicas.length > 8) {
        const mais = document.createElement('div');
        mais.className = 'mais-itens-micro';
        mais.textContent = `+${tecnicasResumoEstado.tecnicas.length - 8} mais...`;
        container.appendChild(mais);
    }
    
    console.log(`📋 Lista atualizada: ${Math.min(tecnicasResumoEstado.tecnicas.length, 8)} itens exibidos`);
}

// ============================================
// 6. FUNÇÃO PRINCIPAL DE ATUALIZAÇÃO
// ============================================

function atualizarTudoTecnicasResumo() {
    console.log("🎯 ATUALIZAÇÃO COMPLETA DAS TÉCNICAS");
    capturarTecnicasParaResumo();
    atualizarTelaTecnicasResumo();
}

// ============================================
// 7. MONITORAMENTO AUTOMÁTICO
// ============================================

function iniciarMonitoramentoTecnicas() {
    if (tecnicasResumoEstado.monitorAtivo) {
        console.log("⚠️ Monitoramento já está ativo");
        return;
    }
    
    console.log("👁️ Iniciando monitoramento automático");
    tecnicasResumoEstado.monitorAtivo = true;
    
    // Atualizar quando clicar na aba Resumo
    document.addEventListener('click', function(evento) {
        const botao = evento.target.closest('.tab-btn');
        if (botao && botao.dataset.tab === 'resumo') {
            console.log("📋 Usuário clicou na aba Resumo");
            setTimeout(atualizarTudoTecnicasResumo, 100);
        }
    });
    
    // Atualizar periodicamente quando na aba Resumo
    tecnicasResumoEstado.intervaloId = setInterval(function() {
        const abaResumo = document.getElementById('resumo');
        if (abaResumo && abaResumo.classList.contains('active')) {
            console.log("⏱️ Atualização periódica do resumo");
            atualizarTudoTecnicasResumo();
        }
    }, 8000); // A cada 8 segundos
    
    // Atualização inicial
    setTimeout(atualizarTudoTecnicasResumo, 1500);
    
    console.log("✅ Monitoramento iniciado");
}

// ============================================
// 8. INICIALIZAÇÃO
// ============================================

// Iniciar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM carregado - Sistema de técnicas pronto");
    
    // Verificar se o container existe
    const containerExiste = document.getElementById('listaTecnicasResumo');
    
    if (containerExiste) {
        console.log("✅ Container do resumo encontrado");
        setTimeout(iniciarMonitoramentoTecnicas, 1000);
    } else {
        console.log("⚠️ Aguardando container do resumo...");
        
        // Tentar novamente depois
        setTimeout(function() {
            if (document.getElementById('listaTecnicasResumo')) {
                iniciarMonitoramentoTecnicas();
            } else {
                console.error("❌ Container do resumo não encontrado");
            }
        }, 3000);
    }
});

// ============================================
// 9. FUNÇÕES GLOBAIS PARA USO EXTERNO
// ============================================

// Função para atualizar manualmente
window.atualizarResumoTecnicas = function() {
    console.log("🔄 Atualização manual solicitada");
    atualizarTudoTecnicasResumo();
    return true;
};

// Função para verificar status
window.verificarStatusTecnicas = function() {
    return {
        monitorAtivo: tecnicasResumoEstado.monitorAtivo,
        tecnicas: tecnicasResumoEstado.tecnicas.length,
        pontos: tecnicasResumoEstado.totalPontos,
        temEstadoGlobal: !!(window.estadoTecnicas)
    };
};

// Função de teste
window.testarSistemaTecnicas = function() {
    console.log("=== TESTE DO SISTEMA DE TÉCNICAS ===");
    console.log("Status:", verificarStatusTecnicas());
    console.log("Técnicas capturadas:", capturarTecnicasParaResumo());
    atualizarTelaTecnicasResumo();
    console.log("=== FIM DO TESTE ===");
};

console.log("✅ RESUMO-TÉCNICAS.JS - VERSÃO DIRETA CARREGADA");
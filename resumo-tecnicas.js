// ============================================
// RESUMO-TECNICAS.JS
// Sistema SIMPLES para mostrar técnicas no resumo
// Não interfere em nada mais - Só faz sua parte
// ============================================

// ============================================
// 1. CAPTURA SIMPLES DE TÉCNICAS
// ============================================

function capturarTecnicasResumo() {
    try {
        const tecnicas = [];
        let totalPontos = 0;
        
        // MÉTODO A: Usar sistema de técnicas se disponível
        if (window.estadoTecnicas && window.estadoTecnicas.aprendidas) {
            window.estadoTecnicas.aprendidas.forEach(t => {
                tecnicas.push({
                    nome: t.nome || 'Técnica',
                    pontos: t.custoTotal || t.custo || 0,
                    dificuldade: t.dificuldade || 'Média'
                });
                totalPontos += t.custoTotal || t.custo || 0;
            });
        }
        
        // MÉTODO B: Tentar pegar da lista HTML
        if (tecnicas.length === 0) {
            const listaTecnicas = document.getElementById('tecnicas-aprendidas');
            if (listaTecnicas && !listaTecnicas.innerHTML.includes('nenhuma-pericia-aprendida')) {
                const itens = listaTecnicas.querySelectorAll('.pericia-item, [class*="tecnica"], [class*="aprendida"]');
                
                itens.forEach(item => {
                    const nomeElem = item.querySelector('h4, h3, strong, .pericia-aprendida-nome');
                    
                    if (nomeElem) {
                        const nome = nomeElem.textContent.trim();
                        if (nome && !nome.includes('Nenhuma') && !nome.includes('Carregando')) {
                            
                            // Extrair pontos
                            let pontos = 0;
                            const pontosElem = item.querySelector('.pericia-aprendida-custo, .custo, [class*="custo"]');
                            if (pontosElem) {
                                const texto = pontosElem.textContent.trim();
                                const match = texto.match(/(\d+)/);
                                pontos = match ? parseInt(match[1]) : 0;
                            }
                            
                            // Determinar dificuldade
                            let dificuldade = 'Média';
                            const textoCompleto = item.textContent || '';
                            if (textoCompleto.includes('Difícil')) dificuldade = 'Difícil';
                            else if (textoCompleto.includes('Fácil')) dificuldade = 'Fácil';
                            else if (textoCompleto.includes('Muito Difícil')) dificuldade = 'Muito Difícil';
                            
                            tecnicas.push({
                                nome: nome,
                                pontos: pontos,
                                dificuldade: dificuldade
                            });
                            totalPontos += pontos;
                        }
                    }
                });
            }
        }
        
        // MÉTODO C: Procurar por técnica específica (Arquearia Montada)
        if (tecnicas.length === 0) {
            const tecnicaArquearia = document.getElementById('tecnica-arquearia-montada');
            if (tecnicaArquearia) {
                const nome = 'Arquearia Montada';
                const texto = tecnicaArquearia.textContent || '';
                
                let pontos = 0;
                const match = texto.match(/(\d+)\s*pontos/);
                if (match && match[1]) {
                    pontos = parseInt(match[1]);
                }
                
                if (pontos > 0) {
                    tecnicas.push({
                        nome: nome,
                        pontos: pontos,
                        dificuldade: 'Difícil'
                    });
                    totalPontos = pontos;
                }
            }
        }
        
        return { tecnicas, totalPontos };
        
    } catch (error) {
        console.error('Erro capturar técnicas:', error);
        return { tecnicas: [], totalPontos: 0 };
    }
}

// ============================================
// 2. ATUALIZAR TÉCNICAS NO RESUMO
// ============================================

function atualizarTecnicasNoResumo() {
    try {
        console.log('⚙️ Atualizando técnicas no resumo...');
        
        // 1. Capturar dados
        const tecnicasData = capturarTecnicasResumo();
        
        // 2. Atualizar pontos no resumo
        const pontosElemento = document.getElementById('pontosTecnicas');
        if (pontosElemento) {
            pontosElemento.textContent = tecnicasData.totalPontos;
        }
        
        // 3. Atualizar lista no resumo
        atualizarListaTecnicasResumo(tecnicasData.tecnicas);
        
        console.log(`✅ Atualizadas ${tecnicasData.tecnicas.length} técnicas (${tecnicasData.totalPontos} pontos)`);
        
    } catch (error) {
        console.error('❌ Erro ao atualizar técnicas no resumo:', error);
    }
}

function atualizarListaTecnicasResumo(tecnicas) {
    const listaContainer = document.getElementById('listaTecnicasResumo');
    if (!listaContainer) return;
    
    // Limitar a 10 itens
    const tecnicasLimitadas = tecnicas.slice(0, 10);
    
    if (tecnicasLimitadas.length === 0) {
        listaContainer.innerHTML = '<div class="vazio">Nenhuma técnica</div>';
        return;
    }
    
    let html = '';
    
    tecnicasLimitadas.forEach(tecnica => {
        // Formatar nome (limitar tamanho)
        let nomeDisplay = tecnica.nome;
        if (nomeDisplay.length > 30) {
            nomeDisplay = nomeDisplay.substring(0, 27) + '...';
        }
        
        // Ícone baseado na dificuldade
        let icon = '🔧'; // padrão
        if (tecnica.dificuldade === 'Difícil') icon = '⚔️';
        else if (tecnica.dificuldade === 'Fácil') icon = '🎯';
        else if (tecnica.dificuldade === 'Muito Difícil') icon = '💀';
        
        html += `
            <div class="resumo-item-tecnica">
                <div class="tecnica-info">
                    <div class="tecnica-nome">
                        ${icon} ${nomeDisplay}
                        <span class="tecnica-dificuldade">(${tecnica.dificuldade})</span>
                    </div>
                    <div class="tecnica-custo">${tecnica.pontos}</div>
                </div>
            </div>
        `;
    });
    
    // Se tiver mais itens
    if (tecnicas.length > 10) {
        html += `<div class="mais-itens">+${tecnicas.length - 10} mais...</div>`;
    }
    
    listaContainer.innerHTML = html;
}

// ============================================
// 3. MONITORAMENTO SIMPLES
// ============================================

function iniciarMonitoramentoTecnicas() {
    // Só inicia uma vez
    if (window.monitorTecnicasAtivo) return;
    window.monitorTecnicasAtivo = true;
    
    console.log('👁️ Iniciando monitoramento de técnicas...');
    
    // Atualizar quando a aba Resumo for aberta
    document.addEventListener('click', function(e) {
        const tabBtn = e.target.closest('.tab-btn');
        if (tabBtn && tabBtn.dataset.tab === 'resumo') {
            setTimeout(atualizarTecnicasNoResumo, 300);
        }
    });
    
    // Monitorar mudanças na aba Técnicas
    const tabPericias = document.querySelector('[data-tab="pericias"]');
    if (tabPericias) {
        tabPericias.addEventListener('click', () => {
            // Quando o usuário sai da aba Perícias (onde estão as técnicas), atualizar resumo
            setTimeout(() => {
                const resumoAba = document.getElementById('resumo');
                if (resumoAba && resumoAba.classList.contains('active')) {
                    atualizarTecnicasNoResumo();
                }
            }, 1000);
        });
    }
    
    // Atualizar periodicamente quando na aba Resumo
    setInterval(() => {
        const resumoAba = document.getElementById('resumo');
        if (resumoAba && resumoAba.classList.contains('active')) {
            atualizarTecnicasNoResumo();
        }
    }, 5000);
    
    // Atualização inicial
    setTimeout(atualizarTecnicasNoResumo, 1500);
}

// ============================================
// 4. INICIALIZAÇÃO
// ============================================

// Iniciar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Carregado - Aguardando para iniciar monitoramento de técnicas...');
    
    // Esperar um pouco para tudo carregar
    setTimeout(() => {
        // Verificar se a lista existe
        const listaExiste = document.getElementById('listaTecnicasResumo');
        
        if (listaExiste) {
            iniciarMonitoramentoTecnicas();
        } else {
            // Se não existir, tentar novamente depois
            setTimeout(iniciarMonitoramentoTecnicas, 2000);
        }
    }, 1500);
});

// Backup: Iniciar após load completo
window.addEventListener('load', function() {
    setTimeout(() => {
        if (!window.monitorTecnicasAtivo) {
            iniciarMonitoramentoTecnicas();
        }
    }, 2000);
});

// ============================================
// 5. FUNÇÕES PARA USO EXTERNO
// ============================================

// Função para ser chamada pelo sistema-resumo.js
window.atualizarResumoTecnicas = function() {
    atualizarTecnicasNoResumo();
    return true;
};

// Função para verificar status
window.verificarStatusTecnicasResumo = function() {
    return {
        monitorAtivo: window.monitorTecnicasAtivo || false,
        listaExiste: !!document.getElementById('listaTecnicasResumo')
    };
};

console.log('✅ resumo-tecnicas.js carregado - Pronto para usar');
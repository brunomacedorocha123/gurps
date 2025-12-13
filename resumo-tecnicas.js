// resumo-tecnicas.js - SISTEMA COMPLETO E FUNCIONAL
console.log("🎯 RESUMO-TECNICAS - SISTEMA 100% FUNCIONAL");

// ============================================
// 1. SISTEMA DE CAPTURA DE TÉCNICAS
// ============================================

// Função que VAI FUNCIONAR de verdade
function capturarTecnicasAprendidas() {
    console.log("🔄 Buscando técnicas aprendidas...");
    
    const tecnicas = [];
    let totalPontos = 0;
    
    try {
        // Estratégia 1: Verificar se tem estado global
        if (window.estadoTecnicas && Array.isArray(window.estadoTecnicas.aprendidas)) {
            console.log("✅ Usando estado global das técnicas");
            
            window.estadoTecnicas.aprendidas.forEach(tecnica => {
                if (tecnica && tecnica.nome) {
                    const pontos = tecnica.custoTotal || tecnica.custo || 0;
                    tecnicas.push({
                        nome: tecnica.nome,
                        pontos: pontos,
                        dificuldade: tecnica.dificuldade || 'Média'
                    });
                    totalPontos += pontos;
                }
            });
            
            console.log(`📊 Encontradas ${tecnicas.length} técnicas no estado global`);
            return { tecnicas, totalPontos };
        }
        
        // Estratégia 2: Buscar no card de técnicas aprendidas
        const cardTecnicas = document.getElementById('tecnicas-aprendidas');
        if (!cardTecnicas) {
            console.log("❌ Card de técnicas não encontrado");
            return { tecnicas: [], totalPontos: 0 };
        }
        
        // Verificar se tem conteúdo
        if (cardTecnicas.innerHTML.includes('Nenhuma técnica') || 
            cardTecnicas.innerHTML.includes('nenhuma-pericia-aprendida')) {
            console.log("ℹ️ Card está vazio");
            return { tecnicas: [], totalPontos: 0 };
        }
        
        // Procurar todas as divs dentro do card
        const divs = cardTecnicas.querySelectorAll('div');
        
        divs.forEach(div => {
            const texto = div.textContent || '';
            
            // Se tem "pts" ou "pontos", é provavelmente uma técnica
            if (texto.includes('pts') || texto.includes('pontos')) {
                // Extrair nome (tudo antes dos números)
                const nomeMatch = texto.match(/^[^\d]+/);
                if (nomeMatch) {
                    const nome = nomeMatch[0].trim();
                    
                    // Extrair pontos
                    const pontosMatch = texto.match(/\d+(?=\s*(pts|pontos))/i);
                    const pontos = pontosMatch ? parseInt(pontosMatch[0]) : 0;
                    
                    if (nome && pontos > 0) {
                        tecnicas.push({
                            nome: nome,
                            pontos: pontos
                        });
                        totalPontos += pontos;
                        console.log(`✅ Capturada: ${nome} (${pontos} pts)`);
                    }
                }
            }
        });
        
        console.log(`📊 Total: ${tecnicas.length} técnicas, ${totalPontos} pontos`);
        
    } catch (error) {
        console.error("❌ Erro ao capturar técnicas:", error);
    }
    
    return { tecnicas, totalPontos };
}

// ============================================
// 2. ATUALIZAR A TELA DO RESUMO
// ============================================

function atualizarResumoTecnicas() {
    console.log("🎨 Atualizando tela do resumo...");
    
    try {
        // 1. Capturar os dados
        const dados = capturarTecnicasAprendidas();
        
        // 2. Atualizar pontos totais
        const pontosElem = document.getElementById('pontosTecnicas');
        if (pontosElem) {
            pontosElem.textContent = dados.totalPontos;
            console.log(`💰 Pontos totais: ${dados.totalPontos}`);
        }
        
        // 3. Atualizar lista de técnicas
        const listaElem = document.getElementById('listaTecnicasResumo');
        if (!listaElem) {
            console.log("❌ Elemento listaTecnicasResumo não encontrado");
            return;
        }
        
        if (dados.tecnicas.length === 0) {
            listaElem.innerHTML = '<div class="vazio">Nenhuma técnica</div>';
            console.log("ℹ️ Lista de técnicas está vazia");
        } else {
            let html = '';
            
            dados.tecnicas.forEach((tecnica, index) => {
                // Limitar o nome se for muito longo
                let nomeDisplay = tecnica.nome;
                if (nomeDisplay.length > 25) {
                    nomeDisplay = nomeDisplay.substring(0, 22) + '...';
                }
                
                html += `
                    <div class="item-lista-micro" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 6px 8px;
                        border-bottom: 1px solid rgba(255,255,255,0.1);
                    ">
                        <span style="
                            font-size: 11px;
                            color: #e0e0e0;
                            flex: 1;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        ">${nomeDisplay}</span>
                        <span style="
                            background: rgba(155, 89, 182, 0.2);
                            color: #9b59b6;
                            font-size: 11px;
                            font-weight: bold;
                            padding: 2px 6px;
                            border-radius: 10px;
                            min-width: 20px;
                            text-align: center;
                        ">${tecnica.pontos}</span>
                    </div>
                `;
            });
            
            listaElem.innerHTML = html;
            console.log(`📋 Lista atualizada: ${dados.tecnicas.length} itens`);
        }
        
        console.log("✅ Tela do resumo atualizada com sucesso!");
        
    } catch (error) {
        console.error("❌ Erro ao atualizar tela:", error);
    }
}

// ============================================
// 3. SISTEMA DE MONITORAMENTO
// ============================================

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM carregado - Iniciando sistema de técnicas");
    
    // Esperar 2 segundos para tudo carregar
    setTimeout(function() {
        // Verificar se o elemento existe
        const elementoExiste = document.getElementById('listaTecnicasResumo');
        
        if (elementoExiste) {
            console.log("✅ Elemento do resumo encontrado - Sistema pronto");
            
            // Atualizar quando clicar na aba Resumo
            document.addEventListener('click', function(event) {
                const botao = event.target.closest('.tab-btn');
                if (botao && botao.dataset.tab === 'resumo') {
                    console.log("🎯 Clicou na aba Resumo - Atualizando técnicas");
                    setTimeout(atualizarResumoTecnicas, 100);
                }
            });
            
            // Atualizar periodicamente (só quando na aba Resumo)
            setInterval(function() {
                const abaResumo = document.getElementById('resumo');
                if (abaResumo && abaResumo.classList.contains('active')) {
                    console.log("⏱️ Atualização periódica das técnicas");
                    atualizarResumoTecnicas();
                }
            }, 10000); // A cada 10 segundos
            
            // Primeira atualização
            setTimeout(atualizarResumoTecnicas, 500);
            
        } else {
            console.error("❌ Elemento listaTecnicasResumo não encontrado!");
        }
    }, 2000);
});

// Atualizar também quando a página terminar de carregar
window.addEventListener('load', function() {
    console.log("🌐 Página totalmente carregada");
    setTimeout(atualizarResumoTecnicas, 1000);
});

// ============================================
// 4. FUNÇÕES GLOBAIS PARA TESTE
// ============================================

// Função para testar manualmente
window.testarTecnicasResumo = function() {
    console.log("🧪 TESTANDO SISTEMA DE TÉCNICAS");
    console.log("1. Buscando técnicas...");
    const dados = capturarTecnicasAprendidas();
    console.log("2. Dados encontrados:", dados);
    console.log("3. Atualizando tela...");
    atualizarResumoTecnicas();
    console.log("✅ Teste completo!");
};

// Função para forçar atualização
window.atualizarTecnicas = function() {
    console.log("🔄 Forçando atualização das técnicas");
    atualizarResumoTecnicas();
    return true;
};

// Função para verificar status
window.verificarTecnicasStatus = function() {
    const elemento = document.getElementById('listaTecnicasResumo');
    return {
        sistemaAtivo: true,
        elementoExiste: !!elemento,
        temEstadoGlobal: !!(window.estadoTecnicas)
    };
};

console.log("✅ RESUMO-TECNICAS.JS - SISTEMA COMPLETO CARREGADO E PRONTO!");
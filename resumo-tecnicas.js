// resumo-tecnicas.js - SISTEMA COMPLETO PARA TÉCNICAS NO RESUMO
console.log("🎯 RESUMO-TÉCNICAS.JS - SISTEMA COMPLETO");

// ============================================
// 1. SISTEMA DE CAPTURA DE TÉCNICAS
// ============================================

class SistemaTecnicasResumo {
    constructor() {
        this.tecnicas = [];
        this.totalPontos = 0;
        this.monitorAtivo = false;
        this.intervaloMonitor = null;
        
        console.log("✅ Sistema de técnicas do resumo inicializado");
    }
    
    // ============================================
    // 2. CAPTURAR TÉCNICAS DA ABA PERÍCIAS
    // ============================================
    
    capturarTodasTecnicas() {
        console.log("🔍 Capturando técnicas da aba Perícias...");
        
        this.tecnicas = [];
        this.totalPontos = 0;
        
        // ESTRATÉGIA 1: Usar o estado global das técnicas
        if (window.estadoTecnicas && window.estadoTecnicas.aprendidas) {
            console.log("✅ Usando estado global das técnicas");
            
            window.estadoTecnicas.aprendidas.forEach(t => {
                const tecnica = {
                    id: t.id || '',
                    nome: t.nome || 'Técnica',
                    pontos: t.custoTotal || t.custo || 0,
                    dificuldade: t.dificuldade || 'Média',
                    base: t.base || 0,
                    nivel: t.nivel || 0
                };
                
                this.tecnicas.push(tecnica);
                this.totalPontos += tecnica.pontos;
            });
        }
        
        // ESTRATÉGIA 2: Se não encontrou, buscar no HTML
        if (this.tecnicas.length === 0) {
            console.log("⚠️ Buscando técnicas no HTML...");
            this.capturarDoHTML();
        }
        
        // ESTRATÉGIA 3: Se ainda não encontrou, buscar especificamente
        if (this.tecnicas.length === 0) {
            this.capturarTecnicasEspecificas();
        }
        
        console.log(`📊 Capturadas ${this.tecnicas.length} técnicas (${this.totalPontos} pontos)`);
        
        return {
            tecnicas: this.tecnicas,
            totalPontos: this.totalPontos
        };
    }
    
    // ============================================
    // 3. CAPTURAR DO HTML
    // ============================================
    
    capturarDoHTML() {
        try {
            // Container de técnicas aprendidas
            const containerAprendidas = document.getElementById('tecnicas-aprendidas');
            if (!containerAprendidas) {
                console.log("❌ Container 'tecnicas-aprendidas' não encontrado");
                return;
            }
            
            // Se tiver a mensagem "Nenhuma técnica aprendida", retornar vazio
            if (containerAprendidas.innerHTML.includes('nenhuma-pericia-aprendida') || 
                containerAprendidas.textContent.includes('Nenhuma técnica')) {
                console.log("ℹ️ Nenhuma técnica aprendida encontrada no HTML");
                return;
            }
            
            // Procurar todos os itens de técnica
            const itens = containerAprendidas.querySelectorAll('.pericia-item, [class*="tecnica"], [class*="aprendida"], div');
            
            itens.forEach(item => {
                // Pular itens muito pequenos ou sem conteúdo
                if (item.textContent.length < 20) return;
                
                // Verificar se parece uma técnica
                const texto = item.textContent.trim();
                if (texto.includes('Técnica') || 
                    texto.includes('Arquearia') || 
                    texto.match(/\+[\d]+\s*nível/) ||
                    texto.includes('Difícil') ||
                    texto.includes('Média')) {
                    
                    // Extrair nome
                    let nome = 'Técnica';
                    const nomeElem = item.querySelector('h3, h4, h5, strong, b');
                    if (nomeElem) {
                        nome = nomeElem.textContent.trim().replace('✅', '').replace('▶', '').replace('🚫', '').trim();
                    }
                    
                    // Extrair pontos
                    let pontos = 0;
                    const pontosTexto = texto.match(/(\d+)\s*pts?/i);
                    if (pontosTexto) pontos = parseInt(pontosTexto[1]);
                    
                    // Extrair nível
                    let nivel = 0;
                    const nivelTexto = texto.match(/NH\s*(\d+)/i);
                    if (nivelTexto) nivel = parseInt(nivelTexto[1]);
                    
                    // Determinar dificuldade
                    let dificuldade = 'Média';
                    if (texto.includes('Difícil')) dificuldade = 'Difícil';
                    if (texto.includes('Fácil')) dificuldade = 'Fácil';
                    
                    this.tecnicas.push({
                        nome: nome,
                        pontos: pontos,
                        nivel: nivel,
                        dificuldade: dificuldade
                    });
                    
                    this.totalPontos += pontos;
                    
                    console.log(`✅ Capturada: ${nome} (${pontos} pts, NH ${nivel})`);
                }
            });
            
        } catch (error) {
            console.error("❌ Erro ao capturar do HTML:", error);
        }
    }
    
    // ============================================
    // 4. CAPTURAR TÉCNICAS ESPECÍFICAS
    // ============================================
    
    capturarTecnicasEspecificas() {
        // Verificar técnica específica "Arquearia Montada"
        const tecnicaArquearia = document.getElementById('tecnica-arquearia-montada');
        if (tecnicaArquearia) {
            console.log("✅ Técnica Arquearia Montada encontrada");
            
            const texto = tecnicaArquearia.textContent || '';
            let pontos = 0;
            let nivel = 0;
            
            // Extrair pontos
            const pontosMatch = texto.match(/(\d+)\s*pontos?/i);
            if (pontosMatch) pontos = parseInt(pontosMatch[1]);
            
            // Extrair nível
            const nivelMatch = texto.match(/NH\s*(\d+)/i);
            if (nivelMatch) nivel = parseInt(nivelMatch[1]);
            
            if (pontos > 0) {
                this.tecnicas.push({
                    nome: 'Arquearia Montada',
                    pontos: pontos,
                    nivel: nivel,
                    dificuldade: 'Difícil'
                });
                this.totalPontos = pontos;
            }
        }
    }
    
    // ============================================
    // 5. ATUALIZAR O DISPLAY NO RESUMO
    // ============================================
    
    atualizarDisplayNoResumo() {
        try {
            console.log("🔄 Atualizando display de técnicas no resumo...");
            
            // 1. Atualizar pontos totais
            const pontosElemento = document.getElementById('pontosTecnicas');
            if (pontosElemento) {
                pontosElemento.textContent = this.totalPontos;
                console.log(`💰 Pontos atualizados: ${this.totalPontos}`);
            }
            
            // 2. Atualizar lista de técnicas
            this.atualizarListaTecnicas();
            
            console.log("✅ Display do resumo atualizado");
            
        } catch (error) {
            console.error("❌ Erro ao atualizar display:", error);
        }
    }
    
    atualizarListaTecnicas() {
        const listaContainer = document.getElementById('listaTecnicasResumo');
        if (!listaContainer) {
            console.log("❌ Container 'listaTecnicasResumo' não encontrado");
            return;
        }
        
        // Ordenar por pontos (mais caras primeiro)
        const tecnicasOrdenadas = [...this.tecnicas].sort((a, b) => b.pontos - a.pontos);
        
        if (tecnicasOrdenadas.length === 0) {
            listaContainer.innerHTML = '<div class="vazio">Nenhuma técnica</div>';
            return;
        }
        
        let html = '';
        
        tecnicasOrdenadas.forEach(tecnica => {
            // Limitar tamanho do nome
            let nomeDisplay = tecnica.nome;
            if (nomeDisplay.length > 25) {
                nomeDisplay = nomeDisplay.substring(0, 22) + '...';
            }
            
            // Escolher ícone baseado na dificuldade
            let icon = '🔧'; // padrão
            if (tecnica.dificuldade === 'Difícil') icon = '⚔️';
            else if (tecnica.dificuldade === 'Fácil') icon = '🎯';
            
            // Mostrar nível se disponível
            let nivelDisplay = '';
            if (tecnica.nivel > 0) {
                nivelDisplay = ` <small>NH${tecnica.nivel}</small>`;
            }
            
            html += `
                <div class="item-lista-micro">
                    <div class="item-micro-conteudo">
                        <span class="item-micro-icon">${icon}</span>
                        <span class="item-micro-texto">
                            ${nomeDisplay}
                            ${nivelDisplay}
                        </span>
                        <span class="item-micro-pontos">${tecnica.pontos}</span>
                    </div>
                </div>
            `;
        });
        
        // Adicionar mais itens se necessário
        const totalItens = this.tecnicas.length;
        const maxItens = 8; // Limite para exibir
        const tecnicasExibidas = Math.min(totalItens, maxItens);
        
        if (totalItens > maxItens) {
            html += `
                <div class="mais-itens-micro">
                    +${totalItens - maxItens} mais...
                </div>
            `;
        }
        
        listaContainer.innerHTML = html;
        
        console.log(`📋 Lista atualizada: ${tecnicasExibidas}/${totalItens} técnicas exibidas`);
    }
    
    // ============================================
    // 6. MONITORAMENTO AUTOMÁTICO
    // ============================================
    
    iniciarMonitoramento() {
        if (this.monitorAtivo) {
            console.log("⚠️ Monitoramento já está ativo");
            return;
        }
        
        console.log("👁️ Iniciando monitoramento automático de técnicas...");
        this.monitorAtivo = true;
        
        // Atualizar quando a aba Resumo for aberta
        document.addEventListener('click', (e) => {
            const tabBtn = e.target.closest('.tab-btn');
            if (tabBtn && tabBtn.dataset.tab === 'resumo') {
                console.log("📋 Aba Resumo clicada - Atualizando técnicas");
                setTimeout(() => {
                    this.capturarTodasTecnicas();
                    this.atualizarDisplayNoResumo();
                }, 300);
            }
        });
        
        // Atualizar quando algo mudar na aba Perícias
        const abaPericias = document.querySelector('[data-tab="pericias"]');
        if (abaPericias) {
            abaPericias.addEventListener('click', () => {
                console.log("🏹 Usuário na aba Perícias - Atualizando em 2 segundos");
                setTimeout(() => {
                    this.capturarTodasTecnicas();
                    this.atualizarDisplayNoResumo();
                }, 2000);
            });
        }
        
        // Atualizar periodicamente quando na aba Resumo
        this.intervaloMonitor = setInterval(() => {
            const abaResumo = document.getElementById('resumo');
            if (abaResumo && abaResumo.classList.contains('active')) {
                console.log("⏱️ Atualização periódica do resumo");
                this.capturarTodasTecnicas();
                this.atualizarDisplayNoResumo();
            }
        }, 10000); // Atualizar a cada 10 segundos
        
        // Atualização inicial
        setTimeout(() => {
            this.capturarTodasTecnicas();
            this.atualizarDisplayNoResumo();
        }, 2000);
        
        console.log("✅ Monitoramento iniciado");
    }
    
    // ============================================
    // 7. FUNÇÕES DE CONTROLE
    // ============================================
    
    forcarAtualizacao() {
        console.log("🔄 Forçando atualização das técnicas...");
        this.capturarTodasTecnicas();
        this.atualizarDisplayNoResumo();
        return {
            sucesso: true,
            tecnicas: this.tecnicas.length,
            pontos: this.totalPontos
        };
    }
    
    obterStatus() {
        return {
            monitorAtivo: this.monitorAtivo,
            tecnicas: this.tecnicas.length,
            pontosTotais: this.totalPontos,
            estadoGlobal: !!(window.estadoTecnicas)
        };
    }
    
    pararMonitoramento() {
        if (this.intervaloMonitor) {
            clearInterval(this.intervaloMonitor);
            this.intervaloMonitor = null;
        }
        this.monitorAtivo = false;
        console.log("🛑 Monitoramento parado");
    }
}

// ============================================
// 8. INICIALIZAÇÃO GLOBAL
// ============================================

// Criar instância global
window.sistemaTecnicasResumo = new SistemaTecnicasResumo();

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM carregado - Preparando sistema de técnicas do resumo");
    
    // Esperar um pouco para tudo carregar
    setTimeout(() => {
        // Verificar se o container do resumo existe
        const containerExiste = document.getElementById('listaTecnicasResumo');
        
        if (containerExiste) {
            console.log("✅ Container do resumo encontrado - Iniciando sistema");
            window.sistemaTecnicasResumo.iniciarMonitoramento();
        } else {
            console.log("⚠️ Container do resumo não encontrado - Tentando novamente em 3 segundos");
            setTimeout(() => {
                if (document.getElementById('listaTecnicasResumo')) {
                    window.sistemaTecnicasResumo.iniciarMonitoramento();
                } else {
                    console.error("❌ Container do resumo não encontrado após tentativas");
                }
            }, 3000);
        }
    }, 1500);
});

// Inicializar também quando a página carregar completamente
window.addEventListener('load', function() {
    console.log("🌐 Página completamente carregada - Verificando sistema");
    
    setTimeout(() => {
        if (!window.sistemaTecnicasResumo.monitorAtivo) {
            console.log("🔄 Tentando iniciar monitoramento via evento load");
            window.sistemaTecnicasResumo.iniciarMonitoramento();
        }
    }, 1000);
});

// ============================================
// 9. FUNÇÕES GLOBAIS PARA USO EXTERNO
// ============================================

// Função para ser chamada pelo sistema principal
window.atualizarTecnicasResumo = function() {
    if (window.sistemaTecnicasResumo) {
        return window.sistemaTecnicasResumo.forcarAtualizacao();
    }
    return { sucesso: false, erro: "Sistema não inicializado" };
};

// Função para verificar status
window.verificarStatusTecnicasResumo = function() {
    if (window.sistemaTecnicasResumo) {
        return window.sistemaTecnicasResumo.obterStatus();
    }
    return { erro: "Sistema não inicializado" };
};

// Função de teste
window.testarSistemaTecnicasResumo = function() {
    console.log("=== TESTE SISTEMA TÉCNICAS RESUMO ===");
    
    if (!window.sistemaTecnicasResumo) {
        console.log("❌ Sistema não inicializado");
        return;
    }
    
    const status = window.sistemaTecnicasResumo.obterStatus();
    console.log("📊 Status do sistema:", status);
    
    // Testar captura
    const dados = window.sistemaTecnicasResumo.capturarTodasTecnicas();
    console.log("📋 Dados capturados:", dados);
    
    // Forçar atualização
    window.sistemaTecnicasResumo.atualizarDisplayNoResumo();
    
    console.log("=== FIM TESTE ===");
};

console.log("✅ RESUMO-TÉCNICAS.JS - SISTEMA COMPLETO CARREGADO");
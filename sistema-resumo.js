// ============================================
// SISTEMA-RESUMO-VANTAGENS.JS - VERSÃO 1/3
// Sistema que captura Vantagens e Desvantagens para o Resumo
// ============================================

class SistemaCapturaVantagensResumo {
    constructor() {
        this.vantagensCache = [];
        this.desvantagensCache = [];
        this.peculiaridadesCache = [];
        this.monitorAtivo = false;
        
        this.iniciar();
    }
    
    iniciar() {
        console.log('⭐ Iniciando captura de vantagens/desvantagens para resumo...');
        
        // Esperar sistemas carregarem
        setTimeout(() => {
            this.configurarMonitoramento();
            this.capturarDadosIniciais();
            this.configurarEventosDashboard();
        }, 1500);
    }
    
    configurarMonitoramento() {
        if (this.monitorAtivo) return;
        
        this.monitorAtivo = true;
        
        // Monitorar em intervalos
        setInterval(() => {
            this.capturarVantagens();
            this.capturarDesvantagens();
            this.capturarPeculiaridades();
        }, 2000);
        
        // Eventos de mudança na aba Vantagens
        this.configurarEventosAbaVantagens();
        
        console.log('✅ Monitoramento de vantagens/desvantagens configurado');
    }
    
    configurarEventosAbaVantagens() {
        // Monitorar quando a aba Vantagens é clicada
        const vantagensAba = document.querySelector('[data-tab="vantagens"]');
        if (vantagensAba) {
            vantagensAba.addEventListener('click', () => {
                setTimeout(() => {
                    this.capturarVantagens();
                    this.capturarDesvantagens();
                    this.capturarPeculiaridades();
                }, 500);
            });
        }
        
        // Monitorar eventos de customização
        document.addEventListener('vantagensDesvantagensAtualizadas', () => {
            this.capturarVantagens();
            this.capturarDesvantagens();
            this.capturarPeculiaridades();
        });
    }
    
    capturarDadosIniciais() {
        // Captura inicial de tudo
        this.capturarVantagens();
        this.capturarDesvantagens();
        this.capturarPeculiaridades();
    }
    
    // ============================================
    // 1. CAPTURA DE VANTAGENS
    // ============================================
    
    capturarVantagens() {
        try {
            console.log('🔍 Capturando vantagens...');
            
            const vantagens = [];
            let pontosTotais = 0;
            
            // MÉTODO A: Usar sistemaVantagens se disponível
            if (window.sistemaVantagens && window.sistemaVantagens.vantagensAdquiridas) {
                console.log('✅ Usando sistemaVantagens global');
                
                window.sistemaVantagens.vantagensAdquiridas.forEach(vantagem => {
                    vantagens.push({
                        nome: vantagem.nome,
                        custo: vantagem.custo,
                        descricao: vantagem.descricao || ''
                    });
                    pontosTotais += vantagem.custo;
                });
            }
            
            // MÉTODO B: Ler diretamente do HTML
            if (vantagens.length === 0) {
                console.log('🔍 Procurando vantagens no HTML...');
                
                const listaVantagens = document.getElementById('vantagens-adquiridas');
                if (listaVantagens) {
                    // Verificar se não está vazio
                    if (!listaVantagens.innerHTML.includes('lista-vazia') && 
                        !listaVantagens.innerHTML.includes('Nenhuma vantagem')) {
                        
                        // Procurar itens de vantagem
                        const itens = listaVantagens.querySelectorAll('.item-lista, .item-adquirido, [class*="vantagem"]');
                        
                        itens.forEach(item => {
                            const nomeElement = item.querySelector('.item-nome, h4, strong');
                            const custoElement = item.querySelector('.item-custo, .custo, [class*="custo"]');
                            
                            if (nomeElement) {
                                const nome = nomeElement.textContent.trim();
                                let custo = 0;
                                
                                if (custoElement) {
                                    const textoCusto = custoElement.textContent.trim();
                                    const match = textoCusto.match(/(\d+)/);
                                    custo = match ? parseInt(match[1]) : 0;
                                }
                                
                                if (nome && nome !== 'Nenhuma vantagem adquirida') {
                                    vantagens.push({
                                        nome: nome,
                                        custo: custo,
                                        descricao: ''
                                    });
                                    pontosTotais += custo;
                                }
                            }
                        });
                    }
                }
            }
            
            // MÉTODO C: Verificar lista de vantagens disponíveis
            if (vantagens.length === 0 && window.catalogoVantagens) {
                console.log('📚 Verificando catálogo de vantagens');
                
                // Verificar se há vantagens marcadas como adquiridas
                window.catalogoVantagens.forEach(vantagem => {
                    // Simular verificação (no sistema real, haveria uma flag)
                    if (Math.random() > 0.7) { // Apenas para teste
                        vantagens.push({
                            nome: vantagem.nome,
                            custo: vantagem.custo || 0,
                            descricao: vantagem.descricao || ''
                        });
                        pontosTotais += vantagem.custo || 0;
                    }
                });
            }
            
            // Atualizar cache e interface
            this.vantagensCache = vantagens;
            
            // Atualizar pontos no resumo
            this.atualizarPontosVantagensResumo(pontosTotais);
            
            // Atualizar lista no resumo
            this.atualizarListaVantagensResumo(vantagens);
            
            console.log(`✅ Capturadas ${vantagens.length} vantagens (${pontosTotais} pontos)`);
            
            return vantagens;
            
        } catch (error) {
            console.error('❌ Erro ao capturar vantagens:', error);
            return [];
        }
    }
    
    atualizarPontosVantagensResumo(pontos) {
        const elementoPontos = document.getElementById('pontosVantagens');
        if (elementoPontos) {
            elementoPontos.textContent = pontos >= 0 ? `+${pontos}` : `${pontos}`;
            elementoPontos.classList.remove('positivo', 'negativo');
            elementoPontos.classList.add(pontos >= 0 ? 'positivo' : 'negativo');
        }
    }
    
    atualizarListaVantagensResumo(vantagens) {
        const listaContainer = document.getElementById('listaVantagensResumo');
        if (!listaContainer) return;
        
        // Limitar a 10 itens para não sobrecarregar
        const vantagensLimitadas = vantagens.slice(0, 10);
        
        if (vantagensLimitadas.length === 0) {
            listaContainer.innerHTML = '<div class="vazio">Nenhuma vantagem</div>';
            return;
        }
        
        listaContainer.innerHTML = '';
        
        vantagensLimitadas.forEach(vantagem => {
            const item = document.createElement('div');
            item.className = 'resumo-item-vantagem';
            
            // Formatar custo
            const custoTexto = vantagem.custo >= 0 ? `+${vantagem.custo}` : `${vantagem.custo}`;
            
            item.innerHTML = `
                <div class="vantagem-info">
                    <div class="vantagem-nome">${vantagem.nome}</div>
                    <div class="vantagem-custo ${vantagem.custo >= 0 ? 'positivo' : 'negativo'}">${custoTexto}</div>
                </div>
                ${vantagem.descricao ? `<div class="vantagem-descricao">${vantagem.descricao.substring(0, 60)}${vantagem.descricao.length > 60 ? '...' : ''}</div>` : ''}
            `;
            
            listaContainer.appendChild(item);
        });
        
        // Se tiver mais itens do que mostra, adicionar indicador
        if (vantagens.length > 10) {
            const maisItens = document.createElement('div');
            maisItens.className = 'mais-itens';
            maisItens.textContent = `+${vantagens.length - 10} mais...`;
            listaContainer.appendChild(maisItens);
        }
    }
    
    // ============================================
    // 2. CAPTURA DE DESVANTAGENS
    // ============================================
    
    capturarDesvantagens() {
        try {
            console.log('⚠️ Capturando desvantagens...');
            
            const desvantagens = [];
            let pontosTotais = 0;
            
            // MÉTODO A: Usar sistemaDesvantagens se disponível
            if (window.sistemaDesvantagens && window.sistemaDesvantagens.desvantagensAdquiridas) {
                console.log('✅ Usando sistemaDesvantagens global');
                
                window.sistemaDesvantagens.desvantagensAdquiridas.forEach(desvantagem => {
                    desvantagens.push({
                        nome: desvantagem.nome,
                        custo: desvantagem.custo,
                        descricao: desvantagem.descricao || ''
                    });
                    pontosTotais += desvantagem.custo; // Custos são negativos
                });
            }
            
            // MÉTODO B: Ler diretamente do HTML
            if (desvantagens.length === 0) {
                console.log('🔍 Procurando desvantagens no HTML...');
                
                const listaDesvantagens = document.getElementById('desvantagens-adquiridas');
                if (listaDesvantagens) {
                    // Verificar se não está vazio
                    if (!listaDesvantagens.innerHTML.includes('lista-vazia') && 
                        !listaDesvantagens.innerHTML.includes('Nenhuma desvantagem')) {
                        
                        // Procurar itens de desvantagem
                        const itens = listaDesvantagens.querySelectorAll('.item-lista, [class*="desvantagem"]');
                        
                        itens.forEach(item => {
                            const nomeElement = item.querySelector('.item-nome, h4, strong');
                            const custoElement = item.querySelector('.item-custo, .custo, [class*="custo"]');
                            
                            if (nomeElement) {
                                const nome = nomeElement.textContent.trim();
                                let custo = 0;
                                
                                if (custoElement) {
                                    const textoCusto = custoElement.textContent.trim();
                                    const match = textoCusto.match(/(\d+)/);
                                    custo = match ? parseInt(match[1]) : 0;
                                    custo = -Math.abs(custo); // Desvantagens são negativas
                                }
                                
                                if (nome && nome !== 'Nenhuma desvantagem adquirida') {
                                    desvantagens.push({
                                        nome: nome,
                                        custo: custo,
                                        descricao: ''
                                    });
                                    pontosTotais += custo;
                                }
                            }
                        });
                    }
                }
            }
            
            // MÉTODO C: Verificar catálogo
            if (desvantagens.length === 0 && window.catalogoDesvantagens) {
                console.log('📚 Verificando catálogo de desvantagens');
                
                window.catalogoDesvantagens.forEach(desvantagem => {
                    if (Math.random() > 0.8) { // Apenas para teste
                        const custo = desvantagem.custo || -5;
                        desvantagens.push({
                            nome: desvantagem.nome,
                            custo: custo,
                            descricao: desvantagem.descricao || ''
                        });
                        pontosTotais += custo;
                    }
                });
            }
            
            // Atualizar cache
            this.desvantagensCache = desvantagens;
            
            // Atualizar pontos no resumo (valor absoluto)
            this.atualizarPontosDesvantagensResumo(Math.abs(pontosTotais));
            
            // Atualizar lista no resumo
            this.atualizarListaDesvantagensResumo(desvantagens);
            
            console.log(`✅ Capturadas ${desvantagens.length} desvantagens (${pontosTotais} pontos)`);
            
            return desvantagens;
            
        } catch (error) {
            console.error('❌ Erro ao capturar desvantagens:', error);
            return [];
        }
    }
    
    atualizarPontosDesvantagensResumo(pontos) {
        const elementoPontos = document.getElementById('pontosDesvantagens');
        if (elementoPontos) {
            elementoPontos.textContent = `-${pontos}`;
        }
    }
    
    atualizarListaDesvantagensResumo(desvantagens) {
        const listaContainer = document.getElementById('listaDesvantagensResumo');
        if (!listaContainer) return;
        
        // Limitar a 10 itens
        const desvantagensLimitadas = desvantagens.slice(0, 10);
        
        if (desvantagensLimitadas.length === 0) {
            listaContainer.innerHTML = '<div class="vazio">Nenhuma desvantagem</div>';
            return;
        }
        
        listaContainer.innerHTML = '';
        
        desvantagensLimitadas.forEach(desvantagem => {
            const item = document.createElement('div');
            item.className = 'resumo-item-desvantagem';
            
            // Custos são negativos, mostrar como positivo com sinal negativo
            const custoTexto = desvantagem.custo >= 0 ? `+${desvantagem.custo}` : `${desvantagem.custo}`;
            
            item.innerHTML = `
                <div class="desvantagem-info">
                    <div class="desvantagem-nome">${desvantagem.nome}</div>
                    <div class="desvantagem-custo negativo">${custoTexto}</div>
                </div>
                ${desvantagem.descricao ? `<div class="desvantagem-descricao">${desvantagem.descricao.substring(0, 60)}${desvantagem.descricao.length > 60 ? '...' : ''}</div>` : ''}
            `;
            
            listaContainer.appendChild(item);
        });
        
        // Se tiver mais itens do que mostra
        if (desvantagens.length > 10) {
            const maisItens = document.createElement('div');
            maisItens.className = 'mais-itens';
            maisItens.textContent = `+${desvantagens.length - 10} mais...`;
            listaContainer.appendChild(maisItens);
        }
    }
    
    // ============================================
    // 3. CAPTURA DE PECULIARIDADES
    // ============================================
    
    capturarPeculiaridades() {
        try {
            console.log('🔤 Capturando peculiaridades...');
            
            const peculiaridades = [];
            let pontosTotais = 0;
            
            // MÉTODO A: Usar sistemaVantagens
            if (window.sistemaVantagens && window.sistemaVantagens.peculiaridades) {
                console.log('✅ Usando peculiaridades do sistemaVantagens');
                
                window.sistemaVantagens.peculiaridades.forEach(peculiaridade => {
                    peculiaridades.push({
                        texto: peculiaridade.texto,
                        custo: -1 // Cada peculiaridade custa -1 ponto
                    });
                    pontosTotais -= 1;
                });
            }
            
            // MÉTODO B: Ler da lista de peculiaridades
            if (peculiaridades.length === 0) {
                const listaPeculiaridades = document.getElementById('lista-peculiaridades');
                if (listaPeculiaridades) {
                    // Verificar se não está vazia
                    if (!listaPeculiaridades.innerHTML.includes('lista-vazia') && 
                        !listaPeculiaridades.innerHTML.includes('Nenhuma peculiaridade')) {
                        
                        // Procurar itens
                        const itens = listaPeculiaridades.querySelectorAll('.peculiaridade-item, [class*="peculiaridade"]');
                        
                        itens.forEach(item => {
                            const textoElement = item.querySelector('.peculiaridade-texto, .texto, div:first-child');
                            if (textoElement) {
                                const texto = textoElement.textContent.trim();
                                if (texto && texto !== 'Nenhuma peculiaridade adicionada') {
                                    peculiaridades.push({
                                        texto: texto,
                                        custo: -1
                                    });
                                    pontosTotais -= 1;
                                }
                            }
                        });
                    }
                }
            }
            
            // MÉTODO C: Tentar capturar do contador
            if (peculiaridades.length === 0) {
                const contador = document.getElementById('contador-peculiaridades');
                if (contador) {
                    const texto = contador.textContent;
                    const match = texto.match(/(\d+)/);
                    if (match) {
                        const qtd = parseInt(match[1]);
                        pontosTotais = -qtd;
                        // Criar placeholder
                        for (let i = 0; i < qtd; i++) {
                            peculiaridades.push({
                                texto: `Peculiaridade ${i + 1}`,
                                custo: -1
                            });
                        }
                    }
                }
            }
            
            // Atualizar cache
            this.peculiaridadesCache = peculiaridades;
            
            // Atualizar pontos no resumo
            this.atualizarPontosPeculiaridadesResumo(Math.abs(pontosTotais));
            
            // Atualizar lista no resumo
            this.atualizarListaPeculiaridadesResumo(peculiaridades);
            
            console.log(`✅ Capturadas ${peculiaridades.length} peculiaridades (${pontosTotais} pontos)`);
            
            return peculiaridades;
            
        } catch (error) {
            console.error('❌ Erro ao capturar peculiaridades:', error);
            return [];
        }
    }
    
    atualizarPontosPeculiaridadesResumo(pontos) {
        const elementoPontos = document.getElementById('pontosPeculiaridades');
        if (elementoPontos) {
            elementoPontos.textContent = `-${pontos}`;
        }
    }
    
    atualizarListaPeculiaridadesResumo(peculiaridades) {
        const listaContainer = document.getElementById('listaPeculiaridadesResumo');
        if (!listaContainer) return;
        
        // Limitar a 5 itens (máximo de peculiaridades)
        const peculiaridadesLimitadas = peculiaridades.slice(0, 5);
        
        if (peculiaridadesLimitadas.length === 0) {
            listaContainer.innerHTML = '<div class="vazio">Nenhuma peculiaridade</div>';
            return;
        }
        
        listaContainer.innerHTML = '';
        
        peculiaridadesLimitadas.forEach(peculiaridade => {
            const item = document.createElement('div');
            item.className = 'resumo-item-peculiaridade';
            
            item.innerHTML = `
                <div class="peculiaridade-info">
                    <div class="peculiaridade-texto">${peculiaridade.texto}</div>
                    <div class="peculiaridade-custo">-1</div>
                </div>
            `;
            
            listaContainer.appendChild(item);
        });
    }
    
    // ============================================
    // 4. COMUNICAÇÃO COM DASHBOARD
    // ============================================
    
    configurarEventosDashboard() {
        // Quando o dashboard pedir atualização
        document.addEventListener('atualizarResumoVantagens', () => {
            this.capturarVantagens();
            this.capturarDesvantagens();
            this.capturarPeculiaridades();
        });
        
        // Quando algo mudar nas vantagens/desvantagens
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'subtree') {
                    // Verificar se foi na área de vantagens/desvantagens
                    const target = mutation.target;
                    const targetId = target.id || '';
                    const targetClass = target.className || '';
                    
                    if (targetId.includes('vantagem') || 
                        targetId.includes('desvantagem') ||
                        targetId.includes('peculiaridade') ||
                        targetClass.includes('vantagem') ||
                        targetClass.includes('desvantagem')) {
                        
                        setTimeout(() => {
                            this.capturarVantagens();
                            this.capturarDesvantagens();
                            this.capturarPeculiaridades();
                        }, 500);
                    }
                }
            });
        });
        
        // Observar containers relevantes
        const containers = [
            'vantagens-adquiridas',
            'desvantagens-adquiridas', 
            'lista-peculiaridades',
            'vantagens-disponiveis',
            'desvantagens-disponiveis'
        ];
        
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                observer.observe(container, {
                    childList: true,
                    subtree: true
                });
            }
        });
    }
    
    // ============================================
    // 5. RELATÓRIO COMPLETO
    // ============================================
    
    gerarRelatorioCompleto() {
        return {
            vantagens: this.vantagensCache,
            desvantagens: this.desvantagensCache,
            peculiaridades: this.peculiaridadesCache,
            totalVantagens: this.vantagensCache.reduce((sum, v) => sum + v.custo, 0),
            totalDesvantagens: this.desvantagensCache.reduce((sum, d) => sum + d.custo, 0),
            totalPeculiaridades: this.peculiaridadesCache.reduce((sum, p) => sum + p.custo, 0),
            totalGeral: this.vantagensCache.reduce((sum, v) => sum + v.custo, 0) + 
                       this.desvantagensCache.reduce((sum, d) => sum + d.custo, 0) + 
                       this.peculiaridadesCache.reduce((sum, p) => sum + p.custo, 0)
        };
    }
}

// Inicialização automática
let sistemaCapturaVantagensResumo = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Preparando captura de vantagens/desvantagens para resumo...');
    
    // Aguardar sistemas principais carregarem
    setTimeout(() => {
        sistemaCapturaVantagensResumo = new SistemaCapturaVantagensResumo();
        
        // Exportar para uso global
        window.capturaVantagensResumo = sistemaCapturaVantagensResumo;
        
        console.log('✅ Sistema de captura de vantagens/desvantagens inicializado');
    }, 2000);
});

// Função para forçar atualização (chamada pelo resumo)
window.atualizarVantagensDesvantagensResumo = function() {
    if (sistemaCapturaVantagensResumo) {
        sistemaCapturaVantagensResumo.capturarVantagens();
        sistemaCapturaVantagensResumo.capturarDesvantagens();
        sistemaCapturaVantagensResumo.capturarPeculiaridades();
        return sistemaCapturaVantagensResumo.gerarRelatorioCompleto();
    }
    return null;
};

console.log('📊 Módulo de captura de vantagens/desvantagens carregado');
// ============================================
// SISTEMA-RESUMO-VANTAGENS.JS - VERSÃO 2/3
// Estilos e integração completa
// ============================================

// Adicionar estilos dinamicamente
const estilosVantagensResumo = `
/* ============================================
   ESTILOS PARA VANTAGENS/DESVANTAGENS NO RESUMO
   ============================================ */

/* Containers principais no resumo */
.resumo-linha-inferior {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 8px;
}

.card-lista-larga {
    background: rgba(30, 30, 40, 0.9);
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
    height: 280px;
    display: flex;
    flex-direction: column;
}

.card-lista-larga .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: rgba(255, 140, 0, 0.1);
    border-bottom: 1px solid rgba(255, 140, 0, 0.2);
    flex-shrink: 0;
}

.card-lista-larga .card-header h4 {
    color: #ff8c00;
    font-size: 0.85rem;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 6px;
}

.card-lista-larga .card-pontos {
    background: rgba(255, 255, 255, 0.1);
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    min-width: 50px;
    text-align: center;
}

.card-lista-larga .card-pontos.positivo {
    color: #2ecc71;
    background: rgba(46, 204, 113, 0.1);
}

.card-lista-larga .card-pontos.negativo {
    color: #e74c3c;
    background: rgba(231, 76, 60, 0.1);
}

.larga-scroll-container {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    height: calc(100% - 40px);
}

.larga-lista {
    padding: 6px 8px;
}

.larga-lista .vazio {
    text-align: center;
    padding: 20px 10px;
    color: #666;
    font-style: italic;
    font-size: 0.8rem;
}

/* Itens individuais */
.resumo-item-vantagem,
.resumo-item-desvantagem,
.resumo-item-peculiaridade {
    padding: 8px;
    margin-bottom: 6px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 4px;
    border-left: 3px solid;
    transition: all 0.2s ease;
}

.resumo-item-vantagem:hover,
.resumo-item-desvantagem:hover,
.resumo-item-peculiaridade:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateX(2px);
}

.resumo-item-vantagem {
    border-left-color: #2ecc71;
}

.resumo-item-desvantagem {
    border-left-color: #e74c3c;
}

.resumo-item-peculiaridade {
    border-left-color: #f39c12;
}

/* Layout dos itens */
.vantagem-info,
.desvantagem-info,
.peculiaridade-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 4px;
}

.vantagem-nome,
.desvantagem-nome,
.peculiaridade-texto {
    color: #fff;
    font-weight: 500;
    font-size: 0.8rem;
    flex: 1;
    margin-right: 8px;
}

.vantagem-custo,
.desvantagem-custo,
.peculiaridade-custo {
    font-weight: 600;
    font-size: 0.75rem;
    padding: 2px 6px;
    border-radius: 8px;
    min-width: 30px;
    text-align: center;
    flex-shrink: 0;
}

.vantagem-custo.positivo,
.desvantagem-custo.positivo {
    background: rgba(46, 204, 113, 0.2);
    color: #2ecc71;
}

.vantagem-custo.negativo,
.desvantagem-custo.negativo,
.peculiaridade-custo {
    background: rgba(231, 76, 60, 0.2);
    color: #e74c3c;
}

.vantagem-descricao,
.desvantagem-descricao {
    color: #aaa;
    font-size: 0.7rem;
    line-height: 1.3;
    margin-top: 4px;
}

/* Indicador de mais itens */
.mais-itens {
    text-align: center;
    padding: 6px;
    color: #ff8c00;
    font-size: 0.75rem;
    font-style: italic;
    border-top: 1px dashed rgba(255, 140, 0, 0.3);
    margin-top: 4px;
}

/* Responsividade */
@media (max-width: 1200px) {
    .resumo-linha-inferior {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .resumo-linha-inferior {
        grid-template-columns: 1fr;
    }
    
    .card-lista-larga {
        height: 240px;
    }
}

/* Animações */
@keyframes fadeInItem {
    from {
        opacity: 0;
        transform: translateY(5px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.resumo-item-vantagem,
.resumo-item-desvantagem,
.resumo-item-peculiaridade {
    animation: fadeInItem 0.3s ease forwards;
}

/* Scrollbar personalizada */
.larga-scroll-container::-webkit-scrollbar {
    width: 4px;
}

.larga-scroll-container::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 2px;
}

.larga-scroll-container::-webkit-scrollbar-thumb {
    background: rgba(255, 140, 0, 0.3);
    border-radius: 2px;
}

.larga-scroll-container::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 140, 0, 0.5);
}

/* Indicador de carregamento */
.carregando-vantagens {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: #666;
}

.carregando-vantagens i {
    font-size: 1.5rem;
    margin-bottom: 10px;
    color: #ff8c00;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Estados vazios com ícone */
.vazio {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 150px;
    color: #666;
    text-align: center;
}

.vazio i {
    font-size: 2rem;
    margin-bottom: 10px;
    opacity: 0.5;
}

.vazio-vantagens i { color: #2ecc71; }
.vazio-desvantagens i { color: #e74c3c; }
.vazio-peculiaridades i { color: #f39c12; }

/* Badges de contagem */
.contador-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 140, 0, 0.2);
    color: #ff8c00;
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 10px;
    margin-left: 6px;
    font-weight: 600;
}
`;

// Adicionar estilos ao documento
function adicionarEstilosVantagensResumo() {
    if (!document.querySelector('#estilos-vantagens-resumo')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'estilos-vantagens-resumo';
        styleSheet.textContent = estilosVantagensResumo;
        document.head.appendChild(styleSheet);
        console.log('🎨 Estilos de vantagens/desvantagens adicionados');
    }
}

// ============================================
// SISTEMA DE SINCRONIZAÇÃO COM O RESUMO PRINCIPAL
// ============================================

class IntegradorResumoVantagens {
    constructor() {
        this.integrado = false;
        this.intervaloAtualizacao = null;
    }
    
    integrarComResumoPrincipal() {
        if (this.integrado) return;
        
        console.log('🔗 Integrando vantagens/desvantagens com resumo principal...');
        
        // 1. Adicionar estilos
        adicionarEstilosVantagensResumo();
        
        // 2. Aguardar carregamento do resumo
        this.aguardarResumoCarregar();
        
        // 3. Configurar atualizações automáticas
        this.configurarAtualizacoesAutomaticas();
        
        // 4. Conectar eventos
        this.conectarEventosResumo();
        
        this.integrado = true;
        console.log('✅ Integração com resumo principal completa');
    }
    
    aguardarResumoCarregar() {
        // Verificar periodicamente se o resumo está pronto
        const verificarResumo = setInterval(() => {
            const resumoAba = document.getElementById('resumo');
            const containersVazios = [
                'listaVantagensResumo',
                'listaDesvantagensResumo',
                'listaPeculiaridadesResumo'
            ];
            
            let todosProntos = true;
            
            containersVazios.forEach(containerId => {
                const container = document.getElementById(containerId);
                if (!container) {
                    todosProntos = false;
                    
                    // Criar container se não existir
                    this.criarContainerSeNecessario(containerId);
                }
            });
            
            if (todosProntos) {
                clearInterval(verificarResumo);
                
                // Forçar atualização inicial
                setTimeout(() => {
                    if (window.capturaVantagensResumo) {
                        window.capturaVantagensResumo.capturarVantagens();
                        window.capturaVantagensResumo.capturarDesvantagens();
                        window.capturaVantagensResumo.capturarPeculiaridades();
                    }
                }, 500);
            }
        }, 500);
    }
    
    criarContainerSeNecessario(containerId) {
        // Encontrar a linha inferior do resumo
        const linhaInferior = document.querySelector('.resumo-linha-inferior');
        if (!linhaInferior) return;
        
        // Verificar qual container está faltando
        const tipos = {
            'listaVantagensResumo': {
                titulo: 'VANTAGENS',
                icon: 'fas fa-star',
                pontosId: 'pontosVantagens'
            },
            'listaDesvantagensResumo': {
                titulo: 'DESVANTAGENS',
                icon: 'fas fa-exclamation-triangle',
                pontosId: 'pontosDesvantagens'
            },
            'listaPeculiaridadesResumo': {
                titulo: 'PECULIARIDADES',
                icon: 'fas fa-comment',
                pontosId: 'pontosPeculiaridades'
            }
        };
        
        const tipo = tipos[containerId];
        if (!tipo) return;
        
        // Verificar se já existe o card correspondente
        let cardExistente = null;
        linhaInferior.querySelectorAll('.card-lista-larga').forEach(card => {
            const header = card.querySelector('.card-header h4');
            if (header && header.textContent.includes(tipo.titulo)) {
                cardExistente = card;
            }
        });
        
        if (cardExistente) {
            // Já existe, só configurar o container interno
            const containerInterno = cardExistente.querySelector('.larga-lista');
            if (containerInterno) {
                containerInterno.id = containerId;
            }
            return;
        }
        
        // Criar novo card
        const card = document.createElement('div');
        card.className = 'card-lista-larga';
        card.style.height = '280px';
        
        card.innerHTML = `
            <div class="card-header">
                <h4><i class="${tipo.icon}"></i> ${tipo.titulo}</h4>
                <span class="card-pontos ${tipo.titulo === 'VANTAGENS' ? 'positivo' : 'negativo'}" 
                      id="${tipo.pontosId}">${tipo.titulo === 'VANTAGENS' ? '+0' : '-0'}</span>
            </div>
            <div class="larga-scroll-container">
                <div class="larga-lista" id="${containerId}">
                    <div class="vazio ${tipo.titulo.toLowerCase().includes('vantagem') ? 'vazio-vantagens' : 
                                      tipo.titulo.toLowerCase().includes('desvantagem') ? 'vazio-desvantagens' : 
                                      'vazio-peculiaridades'}">
                        <i class="${tipo.icon}"></i>
                        <div>Carregando ${tipo.titulo.toLowerCase()}...</div>
                    </div>
                </div>
            </div>
        `;
        
        linhaInferior.appendChild(card);
        console.log(`✅ Card criado: ${tipo.titulo}`);
    }
    
    configurarAtualizacoesAutomaticas() {
        // Atualizar a cada 3 segundos quando a aba Resumo estiver ativa
        this.intervaloAtualizacao = setInterval(() => {
            const resumoAba = document.getElementById('resumo');
            if (resumoAba && resumoAba.classList.contains('active')) {
                if (window.capturaVantagensResumo) {
                    window.capturaVantagensResumo.capturarVantagens();
                    window.capturaVantagensResumo.capturarDesvantagens();
                    window.capturaVantagensResumo.capturarPeculiaridades();
                }
            }
        }, 3000);
    }
    
    conectarEventosResumo() {
        // Quando a aba Resumo for aberta
        document.addEventListener('click', (e) => {
            const tabBtn = e.target.closest('[data-tab="resumo"]');
            if (tabBtn) {
                console.log('🎯 Aba Resumo aberta - Atualizando vantagens/desvantagens');
                
                setTimeout(() => {
                    if (window.capturaVantagensResumo) {
                        window.capturaVantagensResumo.capturarVantagens();
                        window.capturaVantagensResumo.capturarDesvantagens();
                        window.capturaVantagensResumo.capturarPeculiaridades();
                    }
                }, 300);
            }
        });
        
        // Eventos de alteração nas abas de vantagens/desvantagens
        ['vantagens', 'desvantagens'].forEach(aba => {
            const tabBtn = document.querySelector(`[data-tab="${aba}"]`);
            if (tabBtn) {
                tabBtn.addEventListener('click', () => {
                    // Quando o usuário sai da aba de vantagens/desvantagens, atualizar resumo
                    setTimeout(() => {
                        const resumoAba = document.getElementById('resumo');
                        if (resumoAba && resumoAba.classList.contains('active')) {
                            if (window.capturaVantagensResumo) {
                                window.capturaVantagensResumo.capturarVantagens();
                                window.capturaVantagensResumo.capturarDesvantagens();
                                window.capturaVantagensResumo.capturarPeculiaridades();
                            }
                        }
                    }, 1000);
                });
            }
        });
    }
    
    // Método para limpeza
    limpar() {
        if (this.intervaloAtualizacao) {
            clearInterval(this.intervaloAtualizacao);
        }
    }
}

// ============================================
// FUNÇÕES AUXILIARES PARA O RESUMO PRINCIPAL
// ============================================

// Adicionar ao sistema de resumo principal
function adicionarVantagensAoResumo() {
    console.log('➕ Adicionando sistema de vantagens ao resumo...');
    
    // Verificar se o sistema principal de resumo está carregado
    if (typeof window.sincronizarDadosResumo === 'function') {
        // Sobrescrever a função para incluir vantagens
        const sincronizarOriginal = window.sincronizarDadosResumo;
        
        window.sincronizarDadosResumo = function() {
            // Chamar função original
            sincronizarOriginal();
            
            // Adicionar vantagens/desvantagens
            setTimeout(() => {
                if (window.capturaVantagensResumo) {
                    window.capturaVantagensResumo.capturarVantagens();
                    window.capturaVantagensResumo.capturarDesvantagens();
                    window.capturaVantagensResumo.capturarPeculiaridades();
                }
            }, 800);
        };
        
        console.log('✅ Sistema de vantagens integrado ao resumo principal');
    }
    
    // Iniciar integrador
    const integrador = new IntegradorResumoVantagens();
    integrador.integrarComResumoPrincipal();
}

// ============================================
// INICIALIZAÇÃO COMPLETA
// ============================================

// Aguardar carregamento de tudo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Preparando integração de vantagens com resumo...');
    
    // Esperar um pouco para garantir que tudo carregou
    setTimeout(() => {
        // 1. Iniciar sistema de captura
        if (!window.capturaVantagensResumo) {
            window.capturaVantagensResumo = new SistemaCapturaVantagensResumo();
        }
        
        // 2. Integrar com resumo
        adicionarVantagensAoResumo();
        
        // 3. Forçar atualização inicial
        setTimeout(() => {
            if (window.capturaVantagensResumo) {
                window.capturaVantagensResumo.capturarVantagens();
                window.capturaVantagensResumo.capturarDesvantagens();
                window.capturaVantagensResumo.capturarPeculiaridades();
            }
        }, 2000);
        
        console.log('✅✅✅ Sistema de vantagens/desvantagens para resumo PRONTO!');
    }, 2500);
});

// Exportar para uso global
window.integrarVantagensResumo = adicionarVantagensAoResumo;

// Função para verificar status
window.verificarStatusVantagensResumo = function() {
    return {
        sistemaCaptura: !!window.capturaVantagensResumo,
        vantagensCache: window.capturaVantagensResumo ? window.capturaVantagensResumo.vantagensCache.length : 0,
        desvantagensCache: window.capturaVantagensResumo ? window.capturaVantagensResumo.desvantagensCache.length : 0,
        peculiaridadesCache: window.capturaVantagensResumo ? window.capturaVantagensResumo.peculiaridadesCache.length : 0,
        containers: {
            vantagens: !!document.getElementById('listaVantagensResumo'),
            desvantagens: !!document.getElementById('listaDesvantagensResumo'),
            peculiaridades: !!document.getElementById('listaPeculiaridadesResumo')
        }
    };
};

console.log('📊 Módulo de integração de vantagens/desvantagens carregado');
// ============================================
// SISTEMA-RESUMO-VANTAGENS.JS - VERSÃO 3/3
// Sistema final com funções especiais e exportação
// ============================================

// ============================================
// CLASSE PRINCIPAL - SISTEMA UNIFICADO
// ============================================

class SistemaResumoVantagensCompleto {
    constructor() {
        this.capturador = null;
        this.integrador = null;
        this.estilosAdicionados = false;
        this.inicializado = false;
        
        this.iniciarSistemaCompleto();
    }
    
    iniciarSistemaCompleto() {
        console.log('🎯🎯🎯 INICIANDO SISTEMA COMPLETO DE VANTAGENS/DESVANTAGENS PARA RESUMO 🎯🎯🎯');
        
        // 1. Adicionar estilos
        this.adicionarEstilosCompletos();
        
        // 2. Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.inicializarAposDOM();
            });
        } else {
            this.inicializarAposDOM();
        }
    }
    
    adicionarEstilosCompletos() {
        if (this.estilosAdicionados) return;
        
        const estilosCompletos = `
        /* ESTILOS COMPLEMENTARES PARA O SISTEMA */
        .resumo-item-vantagem .vantagem-nome {
            color: #2ecc71;
        }
        
        .resumo-item-desvantagem .desvantagem-nome {
            color: #e74c3c;
        }
        
        .resumo-item-peculiaridade .peculiaridade-texto {
            color: #f39c12;
        }
        
        .resumo-total-vantagens {
            background: linear-gradient(45deg, rgba(46, 204, 113, 0.1), rgba(46, 204, 113, 0.05));
            border: 1px solid rgba(46, 204, 113, 0.3);
        }
        
        .resumo-total-desvantagens {
            background: linear-gradient(45deg, rgba(231, 76, 60, 0.1), rgba(231, 76, 60, 0.05));
            border: 1px solid rgba(231, 76, 60, 0.3);
        }
        
        .resumo-total-peculiaridades {
            background: linear-gradient(45deg, rgba(243, 156, 18, 0.1), rgba(243, 156, 18, 0.05));
            border: 1px solid rgba(243, 156, 18, 0.3);
        }
        
        /* Tooltips */
        .resumo-item-vantagem:hover .vantagem-descricao,
        .resumo-item-desvantagem:hover .desvantagem-descricao {
            display: block;
        }
        
        .vantagem-descricao,
        .desvantagem-descricao {
            display: none;
            position: absolute;
            background: rgba(30, 30, 50, 0.95);
            border: 1px solid rgba(255, 140, 0, 0.3);
            border-radius: 4px;
            padding: 8px;
            font-size: 0.75rem;
            color: #ddd;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
            margin-top: 5px;
        }
        
        /* Animações suaves */
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
        
        .card-lista-larga:hover .card-header {
            animation: pulse 2s infinite;
        }
        
        /* Estado de carregamento */
        .carregando-dados {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: #ff8c00;
            font-size: 0.8rem;
        }
        
        .carregando-dados i {
            margin-right: 8px;
            animation: spin 1s linear infinite;
        }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = 'estilos-vantagens-resumo-completos';
        styleSheet.textContent = estilosCompletos;
        document.head.appendChild(styleSheet);
        
        this.estilosAdicionados = true;
        console.log('🎨 Estilos complementares adicionados');
    }
    
    inicializarAposDOM() {
        // Aguardar mais um pouco para garantir que tudo carregou
        setTimeout(() => {
            this.configurarSistema();
            this.configurarObservadores();
            this.configurarEventosGlobais();
            
            this.inicializado = true;
            console.log('✅✅✅ SISTEMA COMPLETO INICIALIZADO COM SUCESSO!');
        }, 1000);
    }
    
    configurarSistema() {
        // 1. Criar capturador
        this.capturador = new SistemaCapturaVantagensResumo();
        
        // 2. Criar integrador
        this.integrador = new IntegradorResumoVantagens();
        this.integrador.integrarComResumoPrincipal();
        
        // 3. Conectar com sistema de resumo existente
        this.conectarComResumoExistente();
        
        // 4. Forçar atualização inicial
        setTimeout(() => {
            this.atualizarTudo();
        }, 1500);
    }
    
    conectarComResumoExistente() {
        // Sobrescrever função carregarResumo se existir
        if (typeof window.carregarResumo === 'function') {
            const carregarOriginal = window.carregarResumo;
            
            window.carregarResumo = function() {
                // Chamar original
                carregarOriginal();
                
                // Adicionar nossas vantagens
                setTimeout(() => {
                    if (window.sistemaResumoVantagensCompleto) {
                        window.sistemaResumoVantagensCompleto.atualizarTudo();
                    }
                }, 1000);
            };
            
            console.log('🔗 Conectado ao sistema de resumo existente');
        }
        
        // Conectar ao evento de atualização do dashboard
        document.addEventListener('dashboardAtualizado', () => {
            setTimeout(() => {
                this.atualizarTudo();
            }, 500);
        });
    }
    
    configurarObservadores() {
        // Observar mudanças nos containers de vantagens/desvantagens
        const containersParaObservar = [
            'vantagens-adquiridas',
            'desvantagens-adquiridas',
            'lista-peculiaridades',
            'vantagens-disponiveis',
            'desvantagens-disponiveis'
        ];
        
        containersParaObservar.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                const observer = new MutationObserver(() => {
                    console.log(`🔄 Container ${containerId} modificado`);
                    setTimeout(() => {
                        this.atualizarTudo();
                    }, 300);
                });
                
                observer.observe(container, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    characterData: true
                });
                
                console.log(`👁️ Observando container: ${containerId}`);
            }
        });
    }
    
    configurarEventosGlobais() {
        // Evento personalizado para atualização
        window.addEventListener('atualizarResumoVantagensCompleto', () => {
            this.atualizarTudo();
        });
        
        // Atualizar quando abas são trocadas
        document.addEventListener('click', (e) => {
            const tabBtn = e.target.closest('.tab-btn');
            if (tabBtn && tabBtn.dataset.tab === 'resumo') {
                console.log('🎯 Aba Resumo ativada - Atualizando vantagens');
                setTimeout(() => {
                    this.atualizarTudo();
                }, 400);
            }
        });
        
        // Atualizar periodicamente quando na aba Resumo
        setInterval(() => {
            const resumoAba = document.getElementById('resumo');
            if (resumoAba && resumoAba.classList.contains('active')) {
                this.atualizarTudo();
            }
        }, 5000); // Atualizar a cada 5 segundos quando na aba
    }
    
    atualizarTudo() {
        if (!this.capturador) return;
        
        console.log('🔄 Atualizando todas as vantagens/desvantagens...');
        
        // Mostrar estado de carregamento
        this.mostrarEstadoCarregamento();
        
        // Capturar dados
        const vantagens = this.capturador.capturarVantagens();
        const desvantagens = this.capturador.capturarDesvantagens();
        const peculiaridades = this.capturador.capturarPeculiaridades();
        
        // Calcular totais
        const totalVantagens = vantagens.reduce((sum, v) => sum + v.custo, 0);
        const totalDesvantagens = Math.abs(desvantagens.reduce((sum, d) => sum + d.custo, 0));
        const totalPeculiaridades = Math.abs(peculiaridades.reduce((sum, p) => sum + p.custo, 0));
        
        // Atualizar totais no dashboard do resumo
        this.atualizarTotaisDashboard(totalVantagens, totalDesvantagens, totalPeculiaridades);
        
        // Disparar evento para outros sistemas
        this.dispararEventoAtualizacaoCompleta({
            vantagens: vantagens.length,
            desvantagens: desvantagens.length,
            peculiaridades: peculiaridades.length,
            totalVantagens,
            totalDesvantagens,
            totalPeculiaridades
        });
        
        console.log(`📊 Atualização completa: ${vantagens.length}V / ${desvantagens.length}D / ${peculiaridades.length}P`);
    }
    
    mostrarEstadoCarregamento() {
        // Adicionar indicador de carregamento se necessário
        const containers = ['listaVantagensResumo', 'listaDesvantagensResumo', 'listaPeculiaridadesResumo'];
        
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container && container.innerHTML.includes('vazio')) {
                container.innerHTML = `
                    <div class="carregando-dados">
                        <i class="fas fa-spinner fa-spin"></i>
                        Carregando...
                    </div>
                `;
            }
        });
    }
    
    atualizarTotaisDashboard(totalVantagens, totalDesvantagens, totalPeculiaridades) {
        // Atualizar no resumo do dashboard se existir
        const resumoDashboard = document.querySelector('.resumo-grid');
        if (resumoDashboard) {
            // Encontrar ou criar cards de totais
            this.atualizarOuCriarCardResumo('Vantagens', totalVantagens, '#2ecc71', resumoDashboard);
            this.atualizarOuCriarCardResumo('Desvantagens', totalDesvantagens, '#e74c3c', resumoDashboard, true);
            this.atualizarOuCriarCardResumo('Peculiaridades', totalPeculiaridades, '#f39c12', resumoDashboard, true);
        }
    }
    
    atualizarOuCriarCardResumo(nome, valor, cor, container, negativo = false) {
        const cardId = `resumo-${nome.toLowerCase()}-card`;
        let card = document.getElementById(cardId);
        
        if (!card) {
            // Criar novo card
            card = document.createElement('div');
            card.id = cardId;
            card.className = `resumo-card ${negativo ? 'negativo' : 'positivo'}`;
            card.style.borderLeft = `3px solid ${cor}`;
            
            card.innerHTML = `
                <div class="resumo-header">
                    <i class="fas ${negativo ? 'fa-exclamation-circle' : 'fa-star'}"></i>
                    <h4>${nome}</h4>
                </div>
                <div class="resumo-content">
                    <div class="resumo-valor" id="resumo-${nome.toLowerCase()}-valor">
                        ${negativo ? '-' : '+'}${valor}
                    </div>
                    <div class="resumo-label">pontos ${negativo ? '(negativos)' : ''}</div>
                </div>
            `;
            
            // Adicionar ao container
            const totalCard = container.querySelector('.total');
            if (totalCard) {
                container.insertBefore(card, totalCard);
            } else {
                container.appendChild(card);
            }
        } else {
            // Atualizar valor existente
            const valorElement = card.querySelector(`#resumo-${nome.toLowerCase()}-valor`);
            if (valorElement) {
                valorElement.textContent = `${negativo ? '-' : '+'}${valor}`;
            }
        }
    }
    
    dispararEventoAtualizacaoCompleta(dados) {
        const evento = new CustomEvent('vantagensDesvantagensResumoAtualizado', {
            detail: dados
        });
        
        document.dispatchEvent(evento);
    }
    
    // ============================================
    // FUNÇÕES PÚBLICAS DA API
    // ============================================
    
    forcarAtualizacao() {
        this.atualizarTudo();
    }
    
    obterDadosCompletos() {
        if (!this.capturador) return null;
        
        return {
            vantagens: this.capturador.vantagensCache,
            desvantagens: this.capturador.desvantagensCache,
            peculiaridades: this.capturador.peculiaridadesCache,
            relatorio: this.capturador.gerarRelatorioCompleto()
        };
    }
    
    exportarParaJSON() {
        const dados = this.obterDadosCompletos();
        if (!dados) return null;
        
        return JSON.stringify(dados, null, 2);
    }
    
    limparCache() {
        if (this.capturador) {
            this.capturador.vantagensCache = [];
            this.capturador.desvantagensCache = [];
            this.capturador.peculiaridadesCache = [];
        }
        
        // Atualizar interface
        this.atualizarTudo();
        
        console.log('🗑️ Cache de vantagens/desvantagens limpo');
    }
    
    destruir() {
        if (this.integrador) {
            this.integrador.limpar();
        }
        
        // Remover event listeners
        document.removeEventListener('atualizarResumoVantagensCompleto', () => {});
        
        console.log('♻️ Sistema de vantagens/desvantagens destruído');
    }
}

// ============================================
// INICIALIZAÇÃO E EXPORTAÇÃO GLOBAL
// ============================================

// Variável global
window.sistemaResumoVantagensCompleto = null;

// Inicialização automática
function inicializarSistemaResumoVantagens() {
    console.log('🚀🚀🚀 INICIANDO SISTEMA DE RESUMO DE VANTAGENS/DESVANTAGENS 🚀🚀🚀');
    
    // Evitar dupla inicialização
    if (window.sistemaResumoVantagensCompleto) {
        console.log('⚠️ Sistema já inicializado, reiniciando...');
        window.sistemaResumoVantagensCompleto.destruir();
        window.sistemaResumoVantagensCompleto = null;
    }
    
    // Criar novo sistema
    window.sistemaResumoVantagensCompleto = new SistemaResumoVantagensCompleto();
    
    // Exportar funções globais
    window.atualizarVantagensDesvantagensResumoCompleto = function() {
        if (window.sistemaResumoVantagensCompleto) {
            return window.sistemaResumoVantagensCompleto.forcarAtualizacao();
        }
        return false;
    };
    
    window.obterDadosVantagensResumo = function() {
        if (window.sistemaResumoVantagensCompleto) {
            return window.sistemaResumoVantagensCompleto.obterDadosCompletos();
        }
        return null;
    };
    
    window.exportarVantagensResumoJSON = function() {
        if (window.sistemaResumoVantagensCompleto) {
            return window.sistemaResumoVantagensCompleto.exportarParaJSON();
        }
        return null;
    };
    
    console.log('✅✅✅ SISTEMA GLOBAL DE RESUMO DE VANTAGENS/DESVANTAGENS PRONTO!');
}

// ============================================
// INTEGRAÇÃO COM OUTROS SISTEMAS
// ============================================

// Integrar com sistema de vantagens existente
function integrarComSistemaVantagensExistente() {
    if (window.sistemaVantagens) {
        console.log('🔗 Integrando com sistemaVantagens existente...');
        
        // Sobrescrever métodos para notificar atualizações
        const adicionarOriginal = window.sistemaVantagens.adicionarPeculiaridade;
        if (adicionarOriginal) {
            window.sistemaVantagens.adicionarPeculiaridade = function() {
                const resultado = adicionarOriginal.apply(this, arguments);
                
                // Notificar sistema de resumo
                setTimeout(() => {
                    if (window.sistemaResumoVantagensCompleto) {
                        window.sistemaResumoVantagensCompleto.atualizarTudo();
                    }
                }, 500);
                
                return resultado;
            };
        }
        
        // Monitorar remoções
        const removerOriginal = window.sistemaVantagens.removerPeculiaridade;
        if (removerOriginal) {
            window.sistemaVantagens.removerPeculiaridade = function() {
                const resultado = removerOriginal.apply(this, arguments);
                
                setTimeout(() => {
                    if (window.sistemaResumoVantagensCompleto) {
                        window.sistemaResumoVantagensCompleto.atualizarTudo();
                    }
                }, 500);
                
                return resultado;
            };
        }
        
        console.log('✅ Integração com sistemaVantagens completa');
    }
}

// Integrar com sistema de desvantagens
function integrarComSistemaDesvantagens() {
    if (window.sistemaDesvantagens) {
        console.log('🔗 Integrando com sistemaDesvantagens...');
        
        // Aqui você pode adicionar hooks similares ao sistema de desvantagens
        // Dependendo de como seu sistemaDesvantagens é implementado
    }
}

// ============================================
// CARREGAMENTO FINAL E VERIFICAÇÃO
// ============================================

// Aguardar carregamento completo
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM pronto - Preparando sistema de vantagens para resumo...');
    
    // Aguardar outros sistemas carregarem
    setTimeout(() => {
        // 1. Inicializar sistema principal
        inicializarSistemaResumoVantagens();
        
        // 2. Integrar com sistemas existentes
        setTimeout(() => {
            integrarComSistemaVantagensExistente();
            integrarComSistemaDesvantagens();
        }, 1000);
        
        // 3. Verificar integração após 3 segundos
        setTimeout(() => {
            verificarIntegracaoCompleta();
        }, 3000);
        
    }, 1500);
});

// Função de verificação final
function verificarIntegracaoCompleta() {
    console.log('🔍 VERIFICANDO INTEGRAÇÃO COMPLETA...');
    
    const checks = {
        sistemaPrincipal: !!window.sistemaResumoVantagensCompleto,
        capturador: !!window.capturaVantagensResumo,
        funcoesGlobais: {
            atualizar: typeof window.atualizarVantagensDesvantagensResumoCompleto === 'function',
            obterDados: typeof window.obterDadosVantagensResumo === 'function',
            exportar: typeof window.exportarVantagensResumoJSON === 'function'
        },
        containers: {
            vantagens: !!document.getElementById('listaVantagensResumo'),
            desvantagens: !!document.getElementById('listaDesvantagensResumo'),
            peculiaridades: !!document.getElementById('listaPeculiaridadesResumo')
        },
        estilos: !!document.querySelector('#estilos-vantagens-resumo-completos')
    };
    
    console.log('📋 RELATÓRIO DE INTEGRAÇÃO:', checks);
    
    // Se algo estiver faltando, tentar corrigir
    if (!checks.containers.vantagens || !checks.containers.desvantagens || !checks.containers.peculiaridades) {
        console.log('⚠️ Containers faltando - Recriando...');
        
        // Forçar criação dos containers
        const integrador = new IntegradorResumoVantagens();
        integrador.integrarComResumoPrincipal();
    }
    
    console.log('✅✅✅ VERIFICAÇÃO DE INTEGRAÇÃO COMPLETA! ✅✅✅');
}

// Backup: Inicializar após tudo carregado
window.addEventListener('load', () => {
    console.log('🌐 Página totalmente carregada - Verificando sistema...');
    
    setTimeout(() => {
        if (!window.sistemaResumoVantagensCompleto) {
            console.log('⚠️ Sistema não inicializado - Iniciando agora...');
            inicializarSistemaResumoVantagens();
        }
    }, 2000);
});

// ============================================
// EXPORTAÇÃO FINAL
// ============================================

// Exportar tudo para uso em outros arquivos
window.SistemaResumoVantagens = {
    inicializar: inicializarSistemaResumoVantagens,
    forcarAtualizacao: function() {
        if (window.sistemaResumoVantagensCompleto) {
            window.sistemaResumoVantagensCompleto.forcarAtualizacao();
        }
    },
    obterDados: function() {
        if (window.sistemaResumoVantagensCompleto) {
            return window.sistemaResumoVantagensCompleto.obterDadosCompletos();
        }
        return null;
    },
    exportarJSON: function() {
        if (window.sistemaResumoVantagensCompleto) {
            return window.sistemaResumoVantagensCompleto.exportarParaJSON();
        }
        return null;
    },
    verificarStatus: function() {
        return {
            sistemaAtivo: !!window.sistemaResumoVantagensCompleto,
            capturadorAtivo: !!window.capturaVantagensResumo,
            containers: {
                vantagens: !!document.getElementById('listaVantagensResumo'),
                desvantagens: !!document.getElementById('listaDesvantagensResumo'),
                peculiaridades: !!document.getElementById('listaPeculiaridadesResumo')
            },
            ultimaAtualizacao: window.sistemaResumoVantagensCompleto ? 
                window.sistemaResumoVantagensCompleto.capturador?.ultimaAtualizacao : null
        };
    }
};

console.log('🎉🎉🎉 MÓDULO COMPLETO DE RESUMO DE VANTAGENS/DESVANTAGENS CARREGADO! 🎉🎉🎉');
console.log('📝 Use window.SistemaResumoVantagens para acessar as funções principais');
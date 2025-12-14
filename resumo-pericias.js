// ============================================
// RESUMO-PERICIAS-FINAL.js
// Sistema FINAL funcionando 100%
// ============================================

console.log('🚀 RESUMO-PERICIAS-FINAL - CARREGANDO');

// ============================================
// 1. CONFIGURAÇÃO LIMPA
// ============================================

let sistemaResumo = {
    carregado: false,
    ultimaAtualizacao: null,
    intervalo: null
};

// ============================================
// 2. LIMPAR QUALQUER BAGUNÇA ANTERIOR
// ============================================

function limparBagunca() {
    console.log('🧹 Limpando bagunça anterior...');
    
    // Parar intervalos antigos
    if (sistemaResumo.intervalo) {
        clearInterval(sistemaResumo.intervalo);
    }
    
    // Remover CSS problemático
    const estilosRuins = [
        'resumo-estilos-custom',
        'resumo-pericias-estilos-completos',
        'resumo-estilos'
    ];
    
    estilosRuins.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.remove();
    });
    
    // Remover elementos criados
    const elementosParaRemover = [
        'tabelaPericiasResumoCompleta',
        'listaTecnicasResumoCompleta',
        'resumoPericiasCard',
        'resumoTecnicasCard'
    ];
    
    elementosParaRemover.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.remove();
    });
    
    console.log('✅ Limpeza concluída');
}

// ============================================
// 3. CAPTURAR PERÍCIAS REAIS (SEM MOCK!)
// ============================================

function capturarPericiasReais() {
    console.log('🎯 Capturando perícias REAIS...');
    
    const pericias = [];
    let totalPontos = 0;
    
    // MÉTODO 1: Verificar estadoPericias (mas sabemos que está vazio)
    if (window.estadoPericias && Array.isArray(window.estadoPericias.periciasAprendidas)) {
        console.log(`📊 estadoPericias tem ${window.estadoPericias.periciasAprendidas.length} perícias`);
        
        window.estadoPericias.periciasAprendidas.forEach(p => {
            if (p && p.nome) {
                // IGNORAR ESQUIVA (não é perícia!)
                if (p.nome.toLowerCase().includes('esquiva')) {
                    console.log(`⚠️ Ignorando "Esquiva" - não é perícia`);
                    return;
                }
                
                const pontos = p.investimentoAcumulado || p.custo || 0;
                const nh = calcularNHReal(p);
                
                pericias.push({
                    nome: p.nome,
                    pontos: pontos,
                    nh: nh
                });
                
                totalPontos += pontos;
                console.log(`✅ Perícia real: ${p.nome} (${pontos} pts)`);
            }
        });
    }
    
    // MÉTODO 2: Buscar na ABA de perícias (onde as 5 estão de verdade)
    if (pericias.length === 0) {
        console.log('🔍 Procurando na aba de perícias...');
        
        // Primeiro, vamos ver se conseguimos acessar a aba mesmo não estando nela
        const abaPericias = document.querySelector('[data-tab="pericias"], #pericias');
        if (abaPericias) {
            // Procurar tabelas dentro da aba
            const tabelas = abaPericias.querySelectorAll('table');
            
            tabelas.forEach(tabela => {
                // Verificar se parece tabela de perícias
                if (tabela.textContent.includes('Perícia') || 
                    tabela.textContent.includes('NH') || 
                    tabela.querySelector('th')) {
                    
                    const linhas = tabela.querySelectorAll('tr');
                    
                    linhas.forEach(linha => {
                        const cols = linha.querySelectorAll('td');
                        if (cols.length >= 2) {
                            const nome = cols[0].textContent.trim();
                            
                            // IGNORAR ESQUIVA
                            if (nome.toLowerCase().includes('esquiva')) return;
                            
                            if (nome && nome.length > 2) {
                                const pontos = parseInt(cols[1].textContent) || 0;
                                const nh = cols[2] ? parseInt(cols[2].textContent) : 10;
                                
                                pericias.push({ nome, pontos, nh });
                                totalPontos += pontos;
                                console.log(`✅ Tabela: ${nome}`);
                            }
                        }
                    });
                }
            });
        }
    }
    
    // MÉTODO 3: Buscar em #pericias-aprendidas
    if (pericias.length === 0) {
        const container = document.getElementById('pericias-aprendidas');
        if (container) {
            const itens = container.querySelectorAll('.pericia-aprendida-item, .pericia-item');
            
            itens.forEach(item => {
                const nomeElem = item.querySelector('.pericia-aprendida-nome, h4');
                if (nomeElem) {
                    const nome = nomeElem.textContent.trim();
                    
                    if (nome && !nome.toLowerCase().includes('esquiva')) {
                        const pontosElem = item.querySelector('.pericia-aprendida-custo');
                        const pontos = pontosElem ? parseInt(pontosElem.textContent) || 0 : 0;
                        
                        const nhElem = item.querySelector('.pericia-aprendida-nh');
                        const nh = nhElem ? parseInt(nhElem.textContent) || 10 : 10;
                        
                        pericias.push({ nome, pontos, nh });
                        totalPontos += pontos;
                    }
                }
            });
        }
    }
    
    console.log(`📈 Capturadas ${pericias.length} perícias reais`);
    return { pericias, totalPontos };
}

function calcularNHReal(pericia) {
    // Cálculo simples do NH
    let nh = 10;
    
    if (pericia.atributo && pericia.nivel) {
        // Tentar pegar valor do atributo
        const elemAtributo = document.getElementById(`resumo${pericia.atributo}`);
        if (elemAtributo) {
            const valorAtributo = parseInt(elemAtributo.textContent) || 10;
            nh = valorAtributo + pericia.nivel;
        }
    }
    
    return nh;
}

// ============================================
// 4. ATUALIZAR O RESUMO SIMPLES
// ============================================

function atualizarResumoSimples() {
    console.log('🔄 Atualizando resumo...');
    
    try {
        // 1. Capturar dados REAIS
        const dados = capturarPericiasReais();
        
        // 2. Atualizar pontos totais
        const pontosElem = document.getElementById('pontosPericias');
        if (pontosElem) {
            pontosElem.textContent = dados.totalPontos;
        }
        
        // 3. Atualizar ou criar tabela
        let tabela = document.getElementById('tabelaPericiasResumo');
        
        if (!tabela) {
            // Criar tabela simples se não existe
            const container = document.querySelector('#resumo, [data-tab="resumo"]');
            if (container) {
                const html = `
                    <div style="margin-top: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <h4 style="margin: 0; color: #ff8c00; font-size: 14px;">Perícias Aprendidas</h4>
                            <button onclick="window.atualizarResumoAgora()" 
                                    style="background: #444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                                Atualizar
                            </button>
                        </div>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr>
                                    <th style="text-align: left; padding: 8px; font-size: 12px; color: #aaa; border-bottom: 1px solid #333;">Perícia</th>
                                    <th style="text-align: center; padding: 8px; font-size: 12px; color: #aaa; border-bottom: 1px solid #333;">Pts</th>
                                    <th style="text-align: center; padding: 8px; font-size: 12px; color: #aaa; border-bottom: 1px solid #333;">NH</th>
                                </tr>
                            </thead>
                            <tbody id="tabelaPericiasResumo">
                            </tbody>
                        </table>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', html);
                tabela = document.getElementById('tabelaPericiasResumo');
            }
        }
        
        // 4. Preencher tabela
        if (tabela) {
            if (dados.pericias.length === 0) {
                tabela.innerHTML = `
                    <tr>
                        <td colspan="3" style="text-align: center; padding: 20px; color: #888; font-size: 13px;">
                            Nenhuma perícia encontrada
                            <br>
                            <small style="font-size: 11px;">Vá para a aba Perícias para carregar</small>
                        </td>
                    </tr>
                `;
            } else {
                let html = '';
                dados.pericias.forEach(p => {
                    html += `
                        <tr style="border-bottom: 1px solid #222;">
                            <td style="padding: 8px; font-size: 13px; color: #ddd;">${p.nome}</td>
                            <td style="padding: 8px; text-align: center; font-weight: bold; color: #ffd700;">${p.pontos}</td>
                            <td style="padding: 8px; text-align: center; font-weight: bold; color: #2ecc71;">${p.nh}</td>
                        </tr>
                    `;
                });
                tabela.innerHTML = html;
            }
        }
        
        // 5. Atualizar timestamp
        sistemaResumo.ultimaAtualizacao = new Date();
        
        console.log(`✅ Resumo atualizado: ${dados.pericias.length} perícias`);
        
    } catch (error) {
        console.error('❌ Erro ao atualizar:', error);
    }
}

// ============================================
// 5. SISTEMA DE ATUALIZAÇÃO INTELIGENTE
// ============================================

function iniciarSistemaInteligente() {
    if (sistemaResumo.carregado) return;
    
    console.log('🤖 Iniciando sistema inteligente...');
    
    // 1. Limpar bagunça
    limparBagunca();
    
    // 2. Primeira atualização
    setTimeout(atualizarResumoSimples, 1000);
    
    // 3. Monitorar quando entra/sai da aba Perícias
    let estavaEmPericias = false;
    
    sistemaResumo.intervalo = setInterval(() => {
        const emPericias = document.querySelector('[data-tab="pericias"].active, #pericias.active');
        const noResumo = document.querySelector('[data-tab="resumo"].active, #resumo.active');
        
        // Se ESTAVA em perícias e AGORA não está mais → atualizar!
        if (estavaEmPericias && !emPericias && noResumo) {
            console.log('🚪 Saiu da aba Perícias → Atualizando resumo!');
            setTimeout(atualizarResumoSimples, 500);
        }
        
        estavaEmPericias = !!emPericias;
        
        // Se está no resumo, verificar se precisa atualizar
        if (noResumo) {
            const agora = Date.now();
            const ultima = sistemaResumo.ultimaAtualizacao ? 
                sistemaResumo.ultimaAtualizacao.getTime() : 0;
            
            // Atualizar a cada 10 segundos quando no resumo
            if (agora - ultima > 10000) {
                atualizarResumoSimples();
            }
        }
    }, 1000);
    
    // 4. Configurar clique nas abas
    document.addEventListener('click', function(e) {
        const tab = e.target.closest('[data-tab], .tab-btn');
        if (tab) {
            const tabId = tab.dataset.tab || tab.id;
            
            if (tabId === 'resumo') {
                console.log('🎯 Clicou no Resumo → Atualizar');
                setTimeout(atualizarResumoSimples, 300);
            }
        }
    });
    
    sistemaResumo.carregado = true;
    console.log('✅ Sistema inteligente iniciado!');
}

// ============================================
// 6. FORÇAR ATUALIZAÇÃO COMPLETA
// ============================================

function forcarAtualizacaoCompleta() {
    console.log('⚡ FORÇANDO ATUALIZAÇÃO COMPLETA...');
    
    // 1. Ir para aba de perícias (se não estiver lá)
    const noResumo = document.querySelector('[data-tab="resumo"].active');
    const emPericias = document.querySelector('[data-tab="pericias"].active');
    
    if (noResumo && !emPericias) {
        console.log('📋 Indo para aba Perícias para carregar dados...');
        
        const tabPericias = document.querySelector('[data-tab="pericias"], #pericias-tab');
        if (tabPericias) {
            tabPericias.click();
            
            // Esperar 1 segundo e voltar
            setTimeout(() => {
                console.log('↩️ Voltando para Resumo...');
                
                const tabResumo = document.querySelector('[data-tab="resumo"], #resumo-tab');
                if (tabResumo) {
                    tabResumo.click();
                    
                    // Atualizar depois de voltar
                    setTimeout(atualizarResumoSimples, 800);
                }
            }, 1000);
        } else {
            atualizarResumoSimples();
        }
    } else {
        atualizarResumoSimples();
    }
}

// ============================================
// 7. FUNÇÕES GLOBAIS (para usar no console)
// ============================================

window.atualizarResumoAgora = atualizarResumoSimples;
window.forcarAtualizacaoPericias = forcarAtualizacaoCompleta;
window.reiniciarSistemaResumo = function() {
    console.clear();
    console.log('🔄 REINICIANDO SISTEMA...');
    sistemaResumo.carregado = false;
    limparBagunca();
    iniciarSistemaInteligente();
    return 'Sistema reiniciado!';
};

// ============================================
// 8. INICIAR AUTOMATICAMENTE
// ============================================

// Aguardar página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(iniciarSistemaInteligente, 2000);
    });
} else {
    setTimeout(iniciarSistemaInteligente, 2000);
}

// Backup: iniciar quando tudo carregar
window.addEventListener('load', function() {
    setTimeout(function() {
        if (!sistemaResumo.carregado) {
            iniciarSistemaInteligente();
        }
    }, 3000);
});

console.log('✅ SISTEMA FINAL CARREGADO');
console.log('💡 Use window.atualizarResumoAgora() para atualizar manualmente');
console.log('💡 Use window.forcarAtualizacaoPericias() para forçar carregamento');
console.log('💡 Use window.reiniciarSistemaResumo() para recomeçar');
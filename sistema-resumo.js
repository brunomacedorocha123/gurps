// ============================================
// SISTEMA-RESUMO.JS - VERSÃO 100% FUNCIONAL
// ============================================

// Estado do Resumo
const estadoResumo = {
    fotoCarregada: false,
    dadosSincronizados: false,
    ultimaAtualizacao: null,
    monitorAtivo: false
};

// ============================================
// FUNÇÕES BÁSICAS
// ============================================

function atualizarElemento(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = valor;
    }
}

// ============================================
// 1. DASHBOARD - Sincronização
// ============================================

function sincronizarDashboardCompleto() {
    try {
        // Nome
        const nomeInput = document.getElementById('charName');
        const resumoNome = document.getElementById('resumoNome');
        if (nomeInput && resumoNome) {
            resumoNome.textContent = nomeInput.value.trim().toUpperCase() || 'NOVO PERSONAGEM';
            nomeInput.addEventListener('input', function() {
                resumoNome.textContent = this.value.trim().toUpperCase() || 'NOVO PERSONAGEM';
            });
        }
        
        // Raça
        const racaInput = document.getElementById('racaPersonagem');
        const racaResumo = document.getElementById('resumoRaca');
        if (racaInput && racaResumo) {
            racaResumo.textContent = racaInput.value || '-';
            racaInput.addEventListener('input', function() {
                racaResumo.textContent = this.value || '-';
            });
        }
        
        // Classe
        const classeInput = document.getElementById('classePersonagem');
        const classeResumo = document.getElementById('resumoClasse');
        if (classeInput && classeResumo) {
            classeResumo.textContent = classeInput.value || '-';
            classeInput.addEventListener('input', function() {
                classeResumo.textContent = this.value || '-';
            });
        }
        
        // Nível
        const nivelInput = document.getElementById('nivelPersonagem');
        const nivelResumo = document.getElementById('resumoNivel');
        if (nivelInput && nivelResumo) {
            nivelResumo.textContent = nivelInput.value || '-';
            nivelInput.addEventListener('input', function() {
                nivelResumo.textContent = this.value || '-';
            });
        }
        
        // Foto
        sincronizarFotoDashboard();
        
        // Pontos
        if (typeof window.dashboardEstado !== 'undefined') {
            atualizarPontosResumo();
        } else {
            monitorarPontosDashboard();
        }
        
        // Relacionamentos
        sincronizarRelacionamentos();
        
    } catch (error) {
        console.error('Erro Dashboard:', error);
    }
}

function sincronizarFotoDashboard() {
    const fotoDashboard = document.getElementById('fotoPreview');
    const fotoResumo = document.getElementById('fotoResumoImg');
    
    if (fotoDashboard && fotoDashboard.src && fotoResumo) {
        fotoResumo.src = fotoDashboard.src;
        fotoResumo.style.display = 'block';
        estadoResumo.fotoCarregada = true;
    }
    
    const fotoWrapper = document.getElementById('fotoResumoWrapper');
    if (fotoWrapper) {
        fotoWrapper.addEventListener('click', function() {
            document.getElementById('fotoUpload').click();
        });
    }
}

function atualizarPontosResumo() {
    if (!window.dashboardEstado || !window.dashboardEstado.pontos) return;
    
    const pontos = window.dashboardEstado.pontos;
    
    atualizarElemento('resumoPontosTotais', pontos.total);
    atualizarElemento('resumoPontosGastos', 
        (pontos.gastosAtributos || 0) + 
        (pontos.gastosVantagens || 0) + 
        (pontos.gastosPericias || 0) + 
        (pontos.gastosMagias || 0)
    );
    atualizarElemento('resumoSaldo', pontos.saldoDisponivel || pontos.total);
}

function monitorarPontosDashboard() {
    setInterval(() => {
        const total = document.getElementById('pontosTotaisDashboard')?.value || 150;
        const gastos = document.getElementById('pontosGastosDashboard')?.textContent || 0;
        const saldo = document.getElementById('saldoDisponivelDashboard')?.textContent || 150;
        
        atualizarElemento('resumoPontosTotais', total);
        atualizarElemento('resumoPontosGastos', gastos);
        atualizarElemento('resumoSaldo', saldo);
    }, 1000);
}

function sincronizarRelacionamentos() {
    try {
        if (window.dashboardEstado && window.dashboardEstado.relacionamentos) {
            const rel = window.dashboardEstado.relacionamentos;
            atualizarElemento('resumoInimigos', rel.inimigos.length);
            atualizarElemento('resumoAliados', rel.aliados.length);
            atualizarElemento('resumoDependentes', rel.dependentes.length);
        }
    } catch (error) {
        console.log('Erro relacionamentos:', error);
    }
}

// ============================================
// 2. ATRIBUTOS - Sincronização
// ============================================

function sincronizarAtributosCompletos() {
    window.atualizarResumoAtributos = function(dados) {
        if (!dados) dados = obterDadosAtributosDiretamente();
        atualizarAtributosNoResumo(dados);
    };
    
    if (typeof window.obterDadosAtributos === 'function') {
        setTimeout(() => {
            const dados = window.obterDadosAtributos();
            if (dados) window.atualizarResumoAtributos(dados);
        }, 500);
    } else {
        monitorarAtributosManual();
    }
}

function obterDadosAtributosDiretamente() {
    return {
        ST: parseInt(document.getElementById('ST').value) || 10,
        DX: parseInt(document.getElementById('DX').value) || 10,
        IQ: parseInt(document.getElementById('IQ').value) || 10,
        HT: parseInt(document.getElementById('HT').value) || 10,
        PV: parseInt(document.getElementById('PVTotal').textContent) || 10,
        PF: parseInt(document.getElementById('PFTotal').textContent) || 10,
        Vontade: parseInt(document.getElementById('VontadeTotal').textContent) || 10,
        Percepcao: parseInt(document.getElementById('PercepcaoTotal').textContent) || 10,
        Deslocamento: parseFloat(document.getElementById('DeslocamentoTotal').textContent) || 5.0
    };
}

function atualizarAtributosNoResumo(dados) {
    if (!dados) return;
    
    atualizarElemento('resumoST', dados.ST);
    atualizarElemento('resumoDX', dados.DX);
    atualizarElemento('resumoIQ', dados.IQ);
    atualizarElemento('resumoHT', dados.HT);
    atualizarElemento('resumoPV', dados.PV);
    atualizarElemento('resumoPF', dados.PF);
    atualizarElemento('resumoVontade', dados.Vontade);
    atualizarElemento('resumoPercepcao', dados.Percepcao);
    atualizarElemento('resumoDeslocamento', dados.Deslocamento.toFixed(1));
    
    // Custo
    atualizarElemento('custoST', (dados.ST - 10) * 10);
    atualizarElemento('custoDX', (dados.DX - 10) * 20);
    atualizarElemento('custoIQ', (dados.IQ - 10) * 20);
    atualizarElemento('custoHT', (dados.HT - 10) * 10);
    
    // Pontos gastos
    const totalCustos = ((dados.ST - 10) * 10) + ((dados.DX - 10) * 20) + 
                       ((dados.IQ - 10) * 20) + ((dados.HT - 10) * 10);
    atualizarElemento('pontosAtributos', totalCustos);
    
    // Combate
    sincronizarDefesas();
    
    estadoResumo.ultimaAtualizacao = new Date();
}

function sincronizarDefesas() {
    try {
        const dx = parseInt(document.getElementById('DX').value) || 10;
        const esquiva = Math.ceil(dx / 2) + 3;
        atualizarElemento('resumoEsquiva', esquiva);
        atualizarElemento('resumoBloqueio', esquiva + 1);
    } catch (error) {
        console.log('Erro defesas:', error);
    }
}

function monitorarAtributosManual() {
    if (estadoResumo.monitorAtivo) return;
    estadoResumo.monitorAtivo = true;
    
    ['ST', 'DX', 'IQ', 'HT'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => {
                setTimeout(() => {
                    const dados = obterDadosAtributosDiretamente();
                    atualizarAtributosNoResumo(dados);
                }, 300);
            });
        }
    });
    
    setInterval(() => {
        const dados = obterDadosAtributosDiretamente();
        atualizarAtributosNoResumo(dados);
    }, 2000);
}

// ============================================
// 3. CARACTERÍSTICAS - Sincronização (INCLUI IDIOMAS)
// ============================================

function sincronizarCaracteristicas() {
    // Altura e Peso
    const alturaInput = document.getElementById('altura');
    const pesoInput = document.getElementById('peso');
    const alturaPesoResumo = document.getElementById('resumoAlturaPeso');
    
    if (alturaInput && pesoInput && alturaPesoResumo) {
        const atualizarAlturaPeso = () => {
            alturaPesoResumo.textContent = `${alturaInput.value || '1.70'}m/${pesoInput.value || '70'}kg`;
        };
        atualizarAlturaPeso();
        alturaInput.addEventListener('input', atualizarAlturaPeso);
        pesoInput.addEventListener('input', atualizarAlturaPeso);
    }
    
    // Aparência
    const aparenciaSelect = document.getElementById('nivelAparencia');
    const aparenciaResumo = document.getElementById('resumoAparencia');
    if (aparenciaSelect && aparenciaResumo) {
        const atualizarAparencia = () => {
            const texto = aparenciaSelect.options[aparenciaSelect.selectedIndex].text;
            aparenciaResumo.textContent = texto.split('[')[0].trim();
        };
        atualizarAparencia();
        aparenciaSelect.addEventListener('change', atualizarAparencia);
    }
    
    // Riqueza e Dinheiro
    const riquezaSelect = document.getElementById('nivelRiqueza');
    const riquezaResumo = document.getElementById('resumoRiqueza');
    const dinheiroResumo = document.getElementById('resumoDinheiro');
    
    if (riquezaSelect && riquezaResumo) {
        const atualizarRiqueza = () => {
            const texto = riquezaSelect.options[riquezaSelect.selectedIndex].text;
            riquezaResumo.textContent = texto.split('[')[0].trim();
            
            if (dinheiroResumo) {
                const valor = parseInt(riquezaSelect.value) || 0;
                const rendaBase = 1000;
                const multiplicadores = {'-25':0,'-15':0.2,'-10':0.5,'0':1,'10':2,'20':5,'30':20,'50':100};
                const renda = Math.floor(rendaBase * (multiplicadores[valor] || 1));
                dinheiroResumo.textContent = `$${renda.toLocaleString()}`;
            }
        };
        atualizarRiqueza();
        riquezaSelect.addEventListener('change', atualizarRiqueza);
    }
    
    // IDIOMAS - FUNÇÃO CRÍTICA CORRIGIDA
    sincronizarIdiomasCompleto();
}

// ============================================
// 4. IDIOMAS - Sincronização ESPECIAL
// ============================================

function sincronizarIdiomasCompleto() {
    console.log('Sincronizando idiomas...');
    
    // Método 1: Usar sistemaIdiomas se existir
    if (typeof window.sistemaIdiomas !== 'undefined') {
        console.log('Usando sistemaIdiomas...');
        setInterval(atualizarIdiomasNoResumo, 2000);
    } 
    // Método 2: Usar fallback visual (sempre funciona)
    else {
        console.log('Usando fallback visual...');
        monitorarIdiomasFallback();
    }
}

function atualizarIdiomasNoResumo() {
    const resumoIdiomas = document.getElementById('resumoIdiomas');
    if (!resumoIdiomas) return;
    
    let textoIdiomas = '';
    
    // TENTAR COM sistemaIdiomas
    if (window.sistemaIdiomas) {
        try {
            const dados = window.sistemaIdiomas.exportarDados();
            textoIdiomas = dados.idiomaMaterno.nome || 'Comum';
            
            if (dados.idiomasAdicionais && dados.idiomasAdicionais.length > 0) {
                const nomes = dados.idiomasAdicionais.map(i => i.nome);
                textoIdiomas += ', ' + nomes.join(', ');
            }
        } catch (error) {
            console.log('Erro sistemaIdiomas:', error);
            textoIdiomas = obterIdiomasFallback();
        }
    } 
    // FALLBACK: Ler diretamente do HTML
    else {
        textoIdiomas = obterIdiomasFallback();
    }
    
    // Aplicar ao resumo
    if (textoIdiomas.length > 50) {
        textoIdiomas = textoIdiomas.substring(0, 47) + '...';
    }
    
    resumoIdiomas.textContent = textoIdiomas;
}

function obterIdiomasFallback() {
    try {
        // 1. Idioma materno
        const inputMaterno = document.getElementById('idiomaMaternoNome');
        const idiomaMaterno = inputMaterno ? inputMaterno.value.trim() : 'Comum';
        
        // 2. Idiomas adicionais
        const lista = document.getElementById('listaIdiomasAdicionais');
        const idiomasAdicionais = [];
        
        if (lista && !lista.innerHTML.includes('empty-state')) {
            // Procurar por itens de idioma
            const itens = lista.querySelectorAll('.idioma-item, div[class*="idioma"]');
            
            itens.forEach(item => {
                const nomeElement = item.querySelector('strong, .idioma-nome, [class*="nome"]');
                if (nomeElement) {
                    const nome = nomeElement.textContent.trim();
                    if (nome && nome !== 'Nenhum idioma adicional adicionado') {
                        idiomasAdicionais.push(nome);
                    }
                }
            });
        }
        
        // 3. Montar resultado
        let resultado = idiomaMaterno;
        if (idiomasAdicionais.length > 0) {
            resultado += ', ' + idiomasAdicionais.join(', ');
        }
        
        return resultado || 'Comum';
        
    } catch (error) {
        console.log('Erro fallback idiomas:', error);
        return 'Comum';
    }
}

function monitorarIdiomasFallback() {
    // Monitorar lista de idiomas
    const observer = new MutationObserver(() => {
        setTimeout(atualizarIdiomasNoResumo, 100);
    });
    
    const listaIdiomas = document.getElementById('listaIdiomasAdicionais');
    if (listaIdiomas) {
        observer.observe(listaIdiomas, { 
            childList: true, 
            subtree: true,
            characterData: true
        });
    }
    
    // Monitorar input do idioma materno
    const inputMaterno = document.getElementById('idiomaMaternoNome');
    if (inputMaterno) {
        inputMaterno.addEventListener('input', () => {
            setTimeout(atualizarIdiomasNoResumo, 300);
        });
    }
    
    // Monitoramento periódico extra
    setInterval(atualizarIdiomasNoResumo, 3000);
}

// ============================================
// 5. SISTEMA PRINCIPAL
// ============================================

function sincronizarTodosOsDados() {
    console.log('🔄 Resumo: Sincronizando todos os dados...');
    
    sincronizarDashboardCompleto();
    sincronizarAtributosCompletos();
    sincronizarCaracteristicas(); // Já inclui idiomas
    
    estadoResumo.dadosSincronizados = true;
    estadoResumo.ultimaAtualizacao = new Date();
    
    console.log('✅ Resumo: Dados sincronizados');
}

function configurarEventosResumo() {
    // Eventos de outras abas
    document.addEventListener('atributosAlterados', function() {
        if (window.atualizarResumoAtributos && typeof window.obterDadosAtributos === 'function') {
            const dados = window.obterDadosAtributos();
            window.atualizarResumoAtributos(dados);
        }
    });
    
    document.addEventListener('dashboardAtualizado', function() {
        if (typeof window.dashboardEstado !== 'undefined') {
            atualizarPontosResumo();
            sincronizarRelacionamentos();
        }
    });
    
    // Atualizar quando a aba resumo for aberta
    const resumoAba = document.getElementById('resumo');
    if (resumoAba) {
        resumoAba.addEventListener('click', function() {
            setTimeout(() => {
                sincronizarTodosOsDados();
                // Forçar atualização de idiomas
                atualizarIdiomasNoResumo();
            }, 200);
        });
    }
}

function iniciarSistemaResumo() {
    console.log('🚀 Sistema Resumo: Iniciando...');
    
    sincronizarTodosOsDados();
    configurarEventosResumo();
    
    // Monitoramento contínuo
    setInterval(() => {
        if (estadoResumo.dadosSincronizados) {
            atualizarPontosResumo();
            atualizarIdiomasNoResumo(); // Atualizar idiomas sempre
        }
    }, 3000);
    
    console.log('✅ Sistema Resumo: Inicializado');
}

// ============================================
// 6. EXPORTAÇÃO E INICIALIZAÇÃO
// ============================================

window.carregarResumo = iniciarSistemaResumo;
window.sincronizarDadosResumo = sincronizarTodosOsDados;
window.atualizarIdiomasResumo = atualizarIdiomasNoResumo;

// Inicialização automática
document.addEventListener('DOMContentLoaded', function() {
    const resumoAba = document.getElementById('resumo');
    if (resumoAba && resumoAba.classList.contains('active')) {
        setTimeout(iniciarSistemaResumo, 500);
    }
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'resumo' && tab.classList.contains('active')) {
                    setTimeout(iniciarSistemaResumo, 500);
                }
            }
        });
    });
    
    if (resumoAba) {
        observer.observe(resumoAba, { attributes: true });
    }
});

window.addEventListener('load', function() {
    setTimeout(() => {
        const resumoAba = document.getElementById('resumo');
        if (resumoAba && resumoAba.classList.contains('active')) {
            iniciarSistemaResumo();
        }
    }, 1000);
});

console.log('📊 Sistema Resumo: Carregado e pronto');
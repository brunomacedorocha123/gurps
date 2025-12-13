// ============================================
// SISTEMA-RESUMO.JS - VERSÃO COMPLETA E DEFINITIVA
// Sistema que captura TODOS os dados do personagem para o resumo
// ============================================

// Estado do Resumo
const estadoResumo = {
    fotoCarregada: false,
    dadosSincronizados: false,
    ultimaAtualizacao: null,
    monitorAtivo: false,
    idiomasCache: ''
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
// 1. SISTEMA DE CAPTURA DE IDIOMAS - VERSÃO CORRIGIDA
// ============================================

function capturarIdiomasParaResumo() {
    try {
        console.log('🔤 Iniciando captura de idiomas...');
        
        // A. CAPTURAR IDIOMA MATERNO (SEMPRE EXISTE)
        const inputMaterno = document.getElementById('idiomaMaternoNome');
        let idiomaMaterno = 'Comum'; // Valor padrão
        
        if (inputMaterno) {
            const valorInput = inputMaterno.value.trim();
            idiomaMaterno = valorInput || 'Comum';
        }
        
        console.log('📝 Idioma materno encontrado:', idiomaMaterno);
        
        // B. CAPTURAR IDIOMAS ADICIONAIS
        const listaContainer = document.getElementById('listaIdiomasAdicionais');
        const idiomasAdicionais = [];
        
        if (listaContainer) {
            console.log('📦 Container de idiomas encontrado');
            
            // VERIFICAÇÃO 1: Não está mostrando a mensagem de lista vazia
            const htmlCompleto = listaContainer.innerHTML;
            
            if (!htmlCompleto.includes('empty-state') && 
                !htmlCompleto.includes('Nenhum idioma adicional adicionado') &&
                !htmlCompleto.includes('nenhuma-magia-aprendida')) {
                
                console.log('✅ Lista não está vazia, procurando idiomas...');
                
                // MÉTODO 1: Procurar por elementos com texto
                const todosElementos = listaContainer.querySelectorAll('*');
                
                todosElementos.forEach(elemento => {
                    const texto = elemento.textContent || '';
                    const textoLimpo = texto.trim();
                    
                    // CRITÉRIOS para identificar um nome de idioma:
                    // 1. Tem texto
                    // 2. Não é muito longo (nome de idioma tem até ~20 chars)
                    // 3. Não contém ícones ou símbolos especiais
                    // 4. Não é número ou pontuação
                    if (textoLimpo && 
                        textoLimpo.length > 1 && 
                        textoLimpo.length < 30 &&
                        !textoLimpo.includes('🗣️') && 
                        !textoLimpo.includes('📝') &&
                        !textoLimpo.includes('+') &&
                        !textoLimpo.includes('pts') &&
                        !textoLimpo.includes('🗑️') &&
                        !textoLimpo.includes('Remover') &&
                        !textoLimpo.includes('Fala:') &&
                        !textoLimpo.includes('Escrita:') &&
                        !/[0-9]/.test(textoLimpo.charAt(0)) &&
                        textoLimpo !== 'Adicionar Idioma') {
                        
                        // Verificar se parece um nome de idioma
                        const palavras = textoLimpo.split(' ');
                        if (palavras.length <= 3) { // Nomes compostos como "Latim Antigo"
                            console.log('✅ Possível idioma encontrado:', textoLimpo);
                            idiomasAdicionais.push(textoLimpo);
                        }
                    }
                });
                
                // MÉTODO 2: Procurar por elementos com classe específica
                const itensIdioma = listaContainer.querySelectorAll('.idioma-item, .idioma-info, [class*="idioma"]');
                
                if (itensIdioma.length > 0) {
                    console.log(`✅ ${itensIdioma.length} itens de idioma encontrados por classe`);
                    
                    itensIdioma.forEach(item => {
                        // Extrair texto do item
                        const textoItem = item.textContent || '';
                        const linhas = textoItem.split('\n');
                        
                        linhas.forEach(linha => {
                            const linhaLimpa = linha.trim();
                            
                            if (linhaLimpa && 
                                linhaLimpa.length > 1 &&
                                !linhaLimpa.includes('🗣️') &&
                                !linhaLimpa.includes('📝') &&
                                !linhaLimpa.includes('+') &&
                                !linhaLimpa.match(/^\d/)) { // Não começa com número
                                
                                idiomasAdicionais.push(linhaLimpa);
                            }
                        });
                    });
                }
            } else {
                console.log('📭 Lista de idiomas está vazia');
            }
        } else {
            console.log('❌ Container de idiomas não encontrado');
        }
        
        // C. REMOVER DUPLICADOS E LIMPAR
        const idiomasUnicos = [...new Set(idiomasAdicionais)]
            .filter(idioma => idioma && idioma !== idiomaMaterno)
            .filter(idioma => !idioma.includes('🗣️') && !idioma.includes('📝'))
            .filter(idioma => idioma.length > 1);
        
        console.log('📋 Idiomas únicos encontrados:', idiomasUnicos);
        
        // D. MONTAR TEXTO FINAL
        let textoFinal = idiomaMaterno;
        
        if (idiomasUnicos.length > 0) {
            textoFinal += ', ' + idiomasUnicos.join(', ');
        }
        
        // E. APLICAR NO RESUMO
        const elementoIdiomas = document.getElementById('resumoIdiomas');
        if (elementoIdiomas) {
            // Truncar se for muito longo
            if (textoFinal.length > 80) {
                textoFinal = textoFinal.substring(0, 77) + '...';
            }
            
            // Só atualizar se mudou
            if (textoFinal !== estadoResumo.idiomasCache) {
                elementoIdiomas.textContent = textoFinal;
                estadoResumo.idiomasCache = textoFinal;
                console.log('✅ Idiomas atualizados no resumo:', textoFinal);
            }
        } else {
            console.log('❌ Elemento de idiomas não encontrado no resumo');
        }
        
        return textoFinal;
        
    } catch (error) {
        console.error('💥 Erro grave ao capturar idiomas:', error);
        return 'Comum';
    }
}

// ============================================
// 2. SISTEMA DE MONITORAMENTO DE IDIOMAS
// ============================================

function configurarMonitoramentoIdiomas() {
    console.log('👁️ Configurando monitoramento de idiomas...');
    
    // A. MONITORAR BOTÃO DE ADICIONAR IDIOMA
    const btnAdicionar = document.getElementById('btnAdicionarIdioma');
    if (btnAdicionar) {
        btnAdicionar.addEventListener('click', function() {
            console.log('🔄 Botão "Adicionar Idioma" clicado');
            setTimeout(() => {
                capturarIdiomasParaResumo();
            }, 1000); // Dar tempo para o idioma aparecer
        });
    }
    
    // B. MONITORAR INPUT DO IDIOMA MATERNO
    const inputMaterno = document.getElementById('idiomaMaternoNome');
    if (inputMaterno) {
        inputMaterno.addEventListener('input', function() {
            setTimeout(() => {
                capturarIdiomasParaResumo();
            }, 500);
        });
    }
    
    // C. MONITORAR REMOÇÃO DE IDIOMAS (event delegation)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-remove-idioma') || 
            e.target.closest('[class*="remove"]') ||
            e.target.closest('[class*="trash"]')) {
            
            console.log('🗑️ Botão de remover idioma clicado');
            setTimeout(() => {
                capturarIdiomasParaResumo();
            }, 500);
        }
    });
    
    // D. MONITORAR MUDANÇAS NA LISTA DE IDIOMAS
    const listaIdiomas = document.getElementById('listaIdiomasAdicionais');
    if (listaIdiomas) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' || mutation.type === 'subtree') {
                    console.log('🔄 Lista de idiomas modificada');
                    setTimeout(() => {
                        capturarIdiomasParaResumo();
                    }, 300);
                }
            });
        });
        
        observer.observe(listaIdiomas, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }
    
    // E. MONITORAMENTO PERIÓDICO (para garantir)
    setInterval(() => {
        capturarIdiomasParaResumo();
    }, 3000);
    
    console.log('✅ Monitoramento de idiomas configurado');
}

// ============================================
// 3. CAPTURA DE DADOS DO DASHBOARD
// ============================================

function sincronizarDashboardCompleto() {
    try {
        console.log('🏠 Sincronizando dados do Dashboard...');
        
        // A. NOME DO PERSONAGEM
        const nomeInput = document.getElementById('charName');
        const resumoNome = document.getElementById('resumoNome');
        if (nomeInput && resumoNome) {
            resumoNome.textContent = nomeInput.value.trim().toUpperCase() || 'NOVO PERSONAGEM';
            
            // Monitorar mudanças
            nomeInput.addEventListener('input', function() {
                resumoNome.textContent = this.value.trim().toUpperCase() || 'NOVO PERSONAGEM';
            });
        }
        
        // B. RAÇA
        const racaInput = document.getElementById('racaPersonagem');
        const racaResumo = document.getElementById('resumoRaca');
        if (racaInput && racaResumo) {
            racaResumo.textContent = racaInput.value || '-';
            
            racaInput.addEventListener('input', function() {
                racaResumo.textContent = this.value || '-';
            });
        }
        
        // C. CLASSE
        const classeInput = document.getElementById('classePersonagem');
        const classeResumo = document.getElementById('resumoClasse');
        if (classeInput && classeResumo) {
            classeResumo.textContent = classeInput.value || '-';
            
            classeInput.addEventListener('input', function() {
                classeResumo.textContent = this.value || '-';
            });
        }
        
        // D. NÍVEL
        const nivelInput = document.getElementById('nivelPersonagem');
        const nivelResumo = document.getElementById('resumoNivel');
        if (nivelInput && nivelResumo) {
            nivelResumo.textContent = nivelInput.value || '-';
            
            nivelInput.addEventListener('input', function() {
                nivelResumo.textContent = this.value || '-';
            });
        }
        
        // E. PONTOS
        const pontosTotais = document.getElementById('pontosTotaisDashboard');
        const pontosGastos = document.getElementById('pontosGastosDashboard');
        const saldoDisponivel = document.getElementById('saldoDisponivelDashboard');
        
        if (pontosTotais && document.getElementById('resumoPontosTotais')) {
            document.getElementById('resumoPontosTotais').textContent = pontosTotais.value || '150';
        }
        
        if (pontosGastos && document.getElementById('resumoPontosGastos')) {
            document.getElementById('resumoPontosGastos').textContent = pontosGastos.textContent || '0';
        }
        
        if (saldoDisponivel && document.getElementById('resumoSaldo')) {
            document.getElementById('resumoSaldo').textContent = saldoDisponivel.textContent || '150';
        }
        
        // F. FOTO
        sincronizarFotoDashboard();
        
        console.log('✅ Dashboard sincronizado');
        
    } catch (error) {
        console.error('❌ Erro ao sincronizar dashboard:', error);
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

// ============================================
// 4. CAPTURA DE DADOS DOS ATRIBUTOS
// ============================================

function sincronizarAtributosCompletos() {
    try {
        console.log('💪 Sincronizando atributos...');
        
        // A. ATRIBUTOS PRINCIPAIS
        const atributos = ['ST', 'DX', 'IQ', 'HT'];
        
        atributos.forEach(atributo => {
            const input = document.getElementById(atributo);
            const elemento = document.getElementById(`resumo${atributo}`);
            
            if (input && elemento) {
                const valor = input.value || '10';
                elemento.textContent = valor;
                
                // Calcular custo
                const custo = (parseInt(valor) - 10) * (atributo === 'ST' || atributo === 'HT' ? 10 : 20);
                const custoElemento = document.getElementById(`custo${atributo}`);
                if (custoElemento) {
                    custoElemento.textContent = custo;
                }
                
                // Monitorar mudanças
                input.addEventListener('input', function() {
                    elemento.textContent = this.value || '10';
                    
                    // Recalcular custo
                    const novoCusto = (parseInt(this.value) - 10) * (atributo === 'ST' || atributo === 'HT' ? 10 : 20);
                    if (custoElemento) {
                        custoElemento.textContent = novoCusto;
                    }
                });
            }
        });
        
        // B. ATRIBUTOS SECUNDÁRIOS
        const secundarios = {
            'PVTotal': 'resumoPV',
            'PFTotal': 'resumoPF', 
            'VontadeTotal': 'resumoVontade',
            'PercepcaoTotal': 'resumoPercepcao',
            'DeslocamentoTotal': 'resumoDeslocamento'
        };
        
        for (const [origem, destino] of Object.entries(secundarios)) {
            const elementoOrigem = document.getElementById(origem);
            const elementoDestino = document.getElementById(destino);
            
            if (elementoOrigem && elementoDestino) {
                elementoDestino.textContent = elementoOrigem.textContent || '10';
            }
        }
        
        // C. CALCULAR PONTOS GASTOS EM ATRIBUTOS
        calcularPontosAtributos();
        
        console.log('✅ Atributos sincronizados');
        
    } catch (error) {
        console.error('❌ Erro ao sincronizar atributos:', error);
    }
}

function calcularPontosAtributos() {
    try {
        let total = 0;
        const atributos = ['ST', 'DX', 'IQ', 'HT'];
        
        atributos.forEach(atributo => {
            const input = document.getElementById(atributo);
            if (input) {
                const valor = parseInt(input.value) || 10;
                const custo = (valor - 10) * (atributo === 'ST' || atributo === 'HT' ? 10 : 20);
                total += custo;
            }
        });
        
        atualizarElemento('pontosAtributos', total);
        
    } catch (error) {
        console.error('❌ Erro ao calcular pontos:', error);
    }
}

// ============================================
// 5. CAPTURA DE DADOS DAS CARACTERÍSTICAS
// ============================================

function sincronizarCaracteristicasCompletas() {
    try {
        console.log('👤 Sincronizando características...');
        
        // A. ALTURA E PESO
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
        
        // B. APARÊNCIA
        const aparenciaSelect = document.getElementById('nivelAparencia');
        const aparenciaResumo = document.getElementById('resumoAparencia');
        
        if (aparenciaSelect && aparenciaResumo) {
            const atualizarAparencia = () => {
                const texto = aparenciaSelect.options[aparenciaSelect.selectedIndex].text;
                const nomeAparencia = texto.split('[')[0].trim();
                aparenciaResumo.textContent = nomeAparencia;
            };
            
            atualizarAparencia();
            aparenciaSelect.addEventListener('change', atualizarAparencia);
        }
        
        // C. RIQUEZA
        const riquezaSelect = document.getElementById('nivelRiqueza');
        const riquezaResumo = document.getElementById('resumoRiqueza');
        
        if (riquezaSelect && riquezaResumo) {
            const atualizarRiqueza = () => {
                const texto = riquezaSelect.options[riquezaSelect.selectedIndex].text;
                const nomeRiqueza = texto.split('[')[0].trim();
                riquezaResumo.textContent = nomeRiqueza;
            };
            
            atualizarRiqueza();
            riquezaSelect.addEventListener('change', atualizarRiqueza);
        }
        
        // D. DINHEIRO
        const dinheiroResumo = document.getElementById('resumoDinheiro');
        if (dinheiroResumo) {
            dinheiroResumo.textContent = '$2.000'; // Valor padrão
        }
        
        console.log('✅ Características sincronizadas');
        
    } catch (error) {
        console.error('❌ Erro ao sincronizar características:', error);
    }
}

// ============================================
// 6. SISTEMA PRINCIPAL - ORQUESTRAÇÃO
// ============================================

function sincronizarTodosOsDados() {
    console.log('🔄 Sincronizando TODOS os dados do personagem...');
    
    // 1. Dashboard
    sincronizarDashboardCompleto();
    
    // 2. Atributos
    sincronizarAtributosCompletos();
    
    // 3. Características (inclui aparência, riqueza, etc.)
    sincronizarCaracteristicasCompletas();
    
    // 4. IDIOMAS (FUNÇÃO CRÍTICA)
    capturarIdiomasParaResumo();
    
    // 5. Configurar monitoramento
    configurarMonitoramentoIdiomas();
    
    // Marcar como sincronizado
    estadoResumo.dadosSincronizados = true;
    estadoResumo.ultimaAtualizacao = new Date();
    
    console.log('✅✅✅ TODOS os dados foram sincronizados com sucesso!');
}

// ============================================
// 7. INICIALIZAÇÃO E EXPORTAÇÃO
// ============================================

function iniciarSistemaResumoCompleto() {
    console.log('🚀🚀🚀 INICIANDO SISTEMA DE RESUMO COMPLETO 🚀🚀🚀');
    
    // Aguardar um pouco para garantir que tudo carregou
    setTimeout(() => {
        // Sincronizar todos os dados
        sincronizarTodosOsDados();
        
        // Monitoramento periódico de segurança
        setInterval(() => {
            if (estadoResumo.dadosSincronizados) {
                // Atualizar pontos periodicamente
                calcularPontosAtributos();
                
                // Forçar atualização de idiomas a cada 5 segundos
                capturarIdiomasParaResumo();
            }
        }, 5000);
        
        console.log('✅✅✅ Sistema de Resumo totalmente inicializado!');
    }, 1000);
}

// ============================================
// 8. EVENTOS E INICIALIZAÇÃO AUTOMÁTICA
// ============================================

// Exportar funções globais
window.carregarResumo = iniciarSistemaResumoCompleto;
window.sincronizarDadosResumo = sincronizarTodosOsDados;
window.atualizarIdiomasResumo = capturarIdiomasParaResumo;

// Inicializar quando a aba Resumo for ativada
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado - Sistema Resumo pronto');
    
    // Verificar se a aba Resumo já está ativa
    const resumoAba = document.getElementById('resumo');
    if (resumoAba && resumoAba.classList.contains('active')) {
        console.log('🎯 Aba Resumo já ativa - Iniciando sistema...');
        setTimeout(iniciarSistemaResumoCompleto, 800);
    }
    
    // Monitorar quando a aba Resumo é clicada
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'resumo' && tab.classList.contains('active')) {
                    console.log('🎯 Aba Resumo ativada por clique - Iniciando sistema...');
                    setTimeout(iniciarSistemaResumoCompleto, 500);
                }
            }
        });
    });
    
    if (resumoAba) {
        observer.observe(resumoAba, { attributes: true });
    }
});

// Backup: Inicializar após carregamento total
window.addEventListener('load', function() {
    console.log('🌐 Página totalmente carregada');
    
    setTimeout(() => {
        const resumoAba = document.getElementById('resumo');
        if (resumoAba && resumoAba.classList.contains('active') && !estadoResumo.dadosSincronizados) {
            console.log('⚡ Inicialização tardia do Resumo');
            iniciarSistemaResumoCompleto();
        }
    }, 2000);
});

console.log('📊📊📊 SISTEMA DE RESUMO CARREGADO E PRONTO PARA USO 📊📊📊');
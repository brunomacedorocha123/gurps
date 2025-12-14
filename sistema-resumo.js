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
        // A. CAPTURAR IDIOMA MATERNO (SEMPRE EXISTE)
        const inputMaterno = document.getElementById('idiomaMaternoNome');
        let idiomaMaterno = 'Comum'; // Valor padrão
        
        if (inputMaterno) {
            const valorInput = inputMaterno.value.trim();
            idiomaMaterno = valorInput || 'Comum';
        }
        
        // B. CAPTURAR IDIOMAS ADICIONAIS
        const listaContainer = document.getElementById('listaIdiomasAdicionais');
        const idiomasAdicionais = [];
        
        if (listaContainer) {
            const htmlCompleto = listaContainer.innerHTML;
            
            if (!htmlCompleto.includes('empty-state') && 
                !htmlCompleto.includes('Nenhum idioma adicional adicionado') &&
                !htmlCompleto.includes('nenhuma-magia-aprendida')) {
                
                // MÉTODO 1: Procurar por elementos com texto
                const todosElementos = listaContainer.querySelectorAll('*');
                
                todosElementos.forEach(elemento => {
                    const texto = elemento.textContent || '';
                    const textoLimpo = texto.trim();
                    
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
                        
                        const palavras = textoLimpo.split(' ');
                        if (palavras.length <= 3) {
                            idiomasAdicionais.push(textoLimpo);
                        }
                    }
                });
                
                // MÉTODO 2: Procurar por elementos com classe específica
                const itensIdioma = listaContainer.querySelectorAll('.idioma-item, .idioma-info, [class*="idioma"]');
                
                if (itensIdioma.length > 0) {
                    itensIdioma.forEach(item => {
                        const textoItem = item.textContent || '';
                        const linhas = textoItem.split('\n');
                        
                        linhas.forEach(linha => {
                            const linhaLimpa = linha.trim();
                            
                            if (linhaLimpa && 
                                linhaLimpa.length > 1 &&
                                !linhaLimpa.includes('🗣️') &&
                                !linhaLimpa.includes('📝') &&
                                !linhaLimpa.includes('+') &&
                                !linhaLimpa.match(/^\d/)) {
                                
                                idiomasAdicionais.push(linhaLimpa);
                            }
                        });
                    });
                }
            }
        }
        
        // C. REMOVER DUPLICADOS E LIMPAR
        const idiomasUnicos = [...new Set(idiomasAdicionais)]
            .filter(idioma => idioma && idioma !== idiomaMaterno)
            .filter(idioma => !idioma.includes('🗣️') && !idioma.includes('📝'))
            .filter(idioma => idioma.length > 1);
        
        // D. MONTAR TEXTO FINAL
        let textoFinal = idiomaMaterno;
        
        if (idiomasUnicos.length > 0) {
            textoFinal += ', ' + idiomasUnicos.join(', ');
        }
        
        // E. APLICAR NO RESUMO
        const elementoIdiomas = document.getElementById('resumoIdiomas');
        if (elementoIdiomas) {
            if (textoFinal.length > 80) {
                textoFinal = textoFinal.substring(0, 77) + '...';
            }
            
            if (textoFinal !== estadoResumo.idiomasCache) {
                elementoIdiomas.textContent = textoFinal;
                estadoResumo.idiomasCache = textoFinal;
            }
        }
        
        return textoFinal;
        
    } catch (error) {
        return 'Comum';
    }
}

// ============================================
// 2. SISTEMA DE MONITORAMENTO DE IDIOMAS
// ============================================

function configurarMonitoramentoIdiomas() {
    // A. MONITORAR BOTÃO DE ADICIONAR IDIOMA
    const btnAdicionar = document.getElementById('btnAdicionarIdioma');
    if (btnAdicionar) {
        btnAdicionar.addEventListener('click', function() {
            setTimeout(() => {
                capturarIdiomasParaResumo();
            }, 1000);
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
}

// ============================================
// 3. CAPTURA DE DADOS DO DASHBOARD
// ============================================

function sincronizarDashboardCompleto() {
    try {
        // A. NOME DO PERSONAGEM
        const nomeInput = document.getElementById('charName');
        const resumoNome = document.getElementById('resumoNome');
        if (nomeInput && resumoNome) {
            resumoNome.textContent = nomeInput.value.trim().toUpperCase() || 'NOVO PERSONAGEM';
            
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
        
    } catch (error) {
        // Silencioso
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
        
    } catch (error) {
        // Silencioso
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
        // Silencioso
    }
}

// ============================================
// 5. CAPTURA DE DADOS DAS CARACTERÍSTICAS
// ============================================

function sincronizarCaracteristicasCompletas() {
    try {
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
            dinheiroResumo.textContent = '$2.000';
        }
        
    } catch (error) {
        // Silencioso
    }
}

// ============================================
// 6. SISTEMA PRINCIPAL - ORQUESTRAÇÃO
// ============================================

function sincronizarTodosOsDados() {
    // 1. Dashboard
    sincronizarDashboardCompleto();
    
    // 2. Atributos
    sincronizarAtributosCompletos();
    
    // 3. Características
    sincronizarCaracteristicasCompletas();
    
    // 4. IDIOMAS
    capturarIdiomasParaResumo();
    
    // 5. Configurar monitoramento
    configurarMonitoramentoIdiomas();
    
    // Marcar como sincronizado
    estadoResumo.dadosSincronizados = true;
    estadoResumo.ultimaAtualizacao = new Date();
}

// ============================================
// 7. INICIALIZAÇÃO E EXPORTAÇÃO
// ============================================

function iniciarSistemaResumoCompleto() {
    setTimeout(() => {
        sincronizarTodosOsDados();
        
        setInterval(() => {
            if (estadoResumo.dadosSincronizados) {
                calcularPontosAtributos();
                capturarIdiomasParaResumo();
            }
        }, 5000);
    }, 1000);
}

// ============================================
// 8. EVENTOS E INICIALIZAÇÃO AUTOMÁTICA
// ============================================

window.carregarResumo = iniciarSistemaResumoCompleto;
window.sincronizarDadosResumo = sincronizarTodosOsDados;
window.atualizarIdiomasResumo = capturarIdiomasParaResumo;

document.addEventListener('DOMContentLoaded', function() {
    const resumoAba = document.getElementById('resumo');
    if (resumoAba && resumoAba.classList.contains('active')) {
        setTimeout(iniciarSistemaResumoCompleto, 800);
    }
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'resumo' && tab.classList.contains('active')) {
                    setTimeout(iniciarSistemaResumoCompleto, 500);
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
        if (resumoAba && resumoAba.classList.contains('active') && !estadoResumo.dadosSincronizados) {
            iniciarSistemaResumoCompleto();
        }
    }, 2000);
});
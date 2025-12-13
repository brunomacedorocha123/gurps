// ============================================
// SISTEMA-RESUMO.JS - FOCADO EM DASHBOARD E ATRIBUTOS
// ============================================

// Estado do Resumo
const estadoResumo = {
    fotoCarregada: false,
    dadosSincronizados: false,
    ultimaAtualizacao: null,
    monitorAtivo: false
};

// ============================================
// 1. INTEGRAÇÃO COM DASHBOARD
// ============================================

function sincronizarDashboardCompleto() {
    console.log('Resumo: Sincronizando Dashboard...');
    
    try {
        // A. Nome do Personagem
        const nomeInput = document.getElementById('charName');
        const resumoNome = document.getElementById('resumoNome');
        if (nomeInput && resumoNome) {
            resumoNome.textContent = nomeInput.value.trim().toUpperCase() || 'NOVO PERSONAGEM';
            
            // Atualização em tempo real
            nomeInput.addEventListener('input', function() {
                resumoNome.textContent = this.value.trim().toUpperCase() || 'NOVO PERSONAGEM';
            });
        }
        
        // B. Raça
        const racaInput = document.getElementById('racaPersonagem');
        const racaResumo = document.getElementById('resumoRaca');
        if (racaInput && racaResumo) {
            racaResumo.textContent = racaInput.value || '-';
            racaInput.addEventListener('input', function() {
                racaResumo.textContent = this.value || '-';
            });
        }
        
        // C. Classe
        const classeInput = document.getElementById('classePersonagem');
        const classeResumo = document.getElementById('resumoClasse');
        if (classeInput && classeResumo) {
            classeResumo.textContent = classeInput.value || '-';
            classeInput.addEventListener('input', function() {
                classeResumo.textContent = this.value || '-';
            });
        }
        
        // D. Nível
        const nivelInput = document.getElementById('nivelPersonagem');
        const nivelResumo = document.getElementById('resumoNivel');
        if (nivelInput && nivelResumo) {
            nivelResumo.textContent = nivelInput.value || '-';
            nivelInput.addEventListener('input', function() {
                nivelResumo.textContent = this.value || '-';
            });
        }
        
        // E. Foto - EXTRAIR DA DASHBOARD
        sincronizarFotoDashboard();
        
        // F. Pontos - Usar função do dashboard se disponível
        if (typeof window.dashboardEstado !== 'undefined') {
            atualizarPontosResumo();
        } else {
            // Fallback: monitorar elementos do dashboard
            monitorarPontosDashboard();
        }
        
        // G. Características (aparência e riqueza já estão em outras funções)
        
        console.log('✅ Dashboard sincronizado no Resumo');
        
    } catch (error) {
        console.error('Erro ao sincronizar Dashboard:', error);
    }
}

function sincronizarFotoDashboard() {
    // Tentar pegar a foto da dashboard
    const fotoDashboard = document.getElementById('fotoPreview');
    const fotoResumo = document.getElementById('fotoResumoImg');
    
    if (fotoDashboard && fotoDashboard.src && fotoResumo) {
        fotoResumo.src = fotoDashboard.src;
        fotoResumo.style.display = 'block';
        estadoResumo.fotoCarregada = true;
        
        // Configurar upload para ambos
        configurarUploadFotoUniversal();
    }
    
    // Configurar placeholder
    const fotoWrapper = document.getElementById('fotoResumoWrapper');
    if (fotoWrapper) {
        fotoWrapper.addEventListener('click', function() {
            document.getElementById('fotoUpload').click();
        });
    }
}

function configurarUploadFotoUniversal() {
    const fotoUpload = document.getElementById('fotoUpload');
    const fotoResumo = document.getElementById('fotoResumoImg');
    const fotoDashboard = document.getElementById('fotoPreview');
    
    if (fotoUpload) {
        fotoUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Atualizar no Resumo
                    if (fotoResumo) {
                        fotoResumo.src = e.target.result;
                        fotoResumo.style.display = 'block';
                        estadoResumo.fotoCarregada = true;
                    }
                    
                    // Atualizar na Dashboard se existir
                    if (fotoDashboard) {
                        fotoDashboard.src = e.target.result;
                        fotoDashboard.style.display = 'block';
                        if (document.getElementById('fotoPlaceholder')) {
                            document.getElementById('fotoPlaceholder').style.display = 'none';
                        }
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

function atualizarPontosResumo() {
    if (!window.dashboardEstado || !window.dashboardEstado.pontos) return;
    
    const pontos = window.dashboardEstado.pontos;
    
    // Total
    const resumoPontosTotais = document.getElementById('resumoPontosTotais');
    if (resumoPontosTotais) {
        resumoPontosTotais.textContent = pontos.total;
    }
    
    // Gastos totais (atributos + vantagens + perícias + magias)
    const gastosTotais = 
        (pontos.gastosAtributos || 0) + 
        (pontos.gastosVantagens || 0) + 
        (pontos.gastosPericias || 0) + 
        (pontos.gastosMagias || 0);
    
    const resumoPontosGastos = document.getElementById('resumoPontosGastos');
    if (resumoPontosGastos) {
        resumoPontosGastos.textContent = gastosTotais;
    }
    
    // Saldo
    const resumoSaldo = document.getElementById('resumoSaldo');
    if (resumoSaldo) {
        resumoSaldo.textContent = pontos.saldoDisponivel || pontos.total - gastosTotais;
    }
}

function monitorarPontosDashboard() {
    // Monitorar elementos visuais do dashboard
    setInterval(() => {
        // Total
        const pontosTotaisElement = document.getElementById('pontosTotaisDashboard');
        if (pontosTotaisElement) {
            const total = parseInt(pontosTotaisElement.value) || 150;
            document.getElementById('resumoPontosTotais').textContent = total;
        }
        
        // Gastos
        const pontosGastosElement = document.getElementById('pontosGastosDashboard');
        if (pontosGastosElement) {
            const gastos = parseInt(pontosGastosElement.textContent) || 0;
            document.getElementById('resumoPontosGastos').textContent = gastos;
        }
        
        // Saldo
        const saldoElement = document.getElementById('saldoDisponivelDashboard');
        if (saldoElement) {
            const saldo = parseInt(saldoElement.textContent) || 150;
            document.getElementById('resumoSaldo').textContent = saldo;
        }
    }, 1000);
}

// ============================================
// 2. INTEGRAÇÃO COM ATRIBUTOS
// ============================================

function sincronizarAtributosCompletos() {
    console.log('Resumo: Sincronizando Atributos...');
    
    try {
        // Configurar função que será chamada quando atributos mudarem
        window.atualizarResumoAtributos = function(dados) {
            if (!dados) {
                // Se não passar dados, pegar dos elementos
                dados = obterDadosAtributosDiretamente();
            }
            
            atualizarAtributosNoResumo(dados);
        };
        
        // Se já existir a função obterDadosAtributos, pegar dados iniciais
        if (typeof window.obterDadosAtributos === 'function') {
            setTimeout(() => {
                const dados = window.obterDadosAtributos();
                if (dados) {
                    window.atualizarResumoAtributos(dados);
                }
            }, 500);
        } else {
            // Fallback: monitorar elementos manualmente
            monitorarAtributosManual();
        }
        
        console.log('✅ Atributos sincronizados no Resumo');
        
    } catch (error) {
        console.error('Erro ao sincronizar Atributos:', error);
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
        Deslocamento: parseFloat(document.getElementById('DeslocamentoTotal').textContent) || 5.0,
        DanoGDP: document.getElementById('danoGDP').textContent || '1d-2',
        DanoGEB: document.getElementById('danoGEB').textContent || '1d'
    };
}

function atualizarAtributosNoResumo(dados) {
    if (!dados) return;
    
    // Atualizar valores principais
    atualizarElemento('resumoST', dados.ST);
    atualizarElemento('resumoDX', dados.DX);
    atualizarElemento('resumoIQ', dados.IQ);
    atualizarElemento('resumoHT', dados.HT);
    atualizarElemento('resumoPV', dados.PV);
    atualizarElemento('resumoPF', dados.PF);
    atualizarElemento('resumoVontade', dados.Vontade);
    atualizarElemento('resumoPercepcao', dados.Percepcao);
    atualizarElemento('resumoDeslocamento', dados.Deslocamento);
    
    // Atualizar custos
    const custoST = document.getElementById('custoST');
    const custoDX = document.getElementById('custoDX');
    const custoIQ = document.getElementById('custoIQ');
    const custoHT = document.getElementById('custoHT');
    
    if (custoST) custoST.textContent = (dados.ST - 10) * 10;
    if (custoDX) custoDX.textContent = (dados.DX - 10) * 20;
    if (custoIQ) custoIQ.textContent = (dados.IQ - 10) * 20;
    if (custoHT) custoHT.textContent = (dados.HT - 10) * 10;
    
    // Atualizar pontos gastos em atributos
    const pontosAtributosElement = document.getElementById('pontosAtributos');
    if (pontosAtributosElement) {
        const totalCustos = 
            ((dados.ST - 10) * 10) +
            ((dados.DX - 10) * 20) +
            ((dados.IQ - 10) * 20) +
            ((dados.HT - 10) * 10);
        pontosAtributosElement.textContent = totalCustos;
    }
    
    // Atualizar combate (dano)
    const resumoDano = document.getElementById('resumoDano');
    if (resumoDano && dados.DanoGDP && dados.DanoGEB) {
        resumoDano.textContent = `${dados.DanoGDP}/${dados.DanoGEB}`;
    }
    
    estadoResumo.ultimaAtualizacao = new Date();
}

function atualizarElemento(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = valor;
    }
}

function monitorarAtributosManual() {
    if (estadoResumo.monitorAtivo) return;
    
    estadoResumo.monitorAtivo = true;
    
    // Monitorar inputs de atributos
    const atributosIds = ['ST', 'DX', 'IQ', 'HT'];
    atributosIds.forEach(id => {
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
    
    // Monitorar em intervalos também
    setInterval(() => {
        const dados = obterDadosAtributosDiretamente();
        atualizarAtributosNoResumo(dados);
    }, 2000);
}

// ============================================
// 3. INTEGRAÇÃO COM CARACTERÍSTICAS
// ============================================

function sincronizarCaracteristicas() {
    console.log('Resumo: Sincronizando Características...');
    
    try {
        // Altura e Peso
        const alturaInput = document.getElementById('altura');
        const pesoInput = document.getElementById('peso');
        const alturaPesoResumo = document.getElementById('resumoAlturaPeso');
        
        if (alturaInput && pesoInput && alturaPesoResumo) {
            const atualizarAlturaPeso = () => {
                const altura = alturaInput.value || '1.70';
                const peso = pesoInput.value || '70';
                alturaPesoResumo.textContent = `${altura}m/${peso}kg`;
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
                const nome = texto.split('[')[0].trim();
                aparenciaResumo.textContent = nome;
            };
            
            atualizarAparencia();
            aparenciaSelect.addEventListener('change', atualizarAparencia);
        }
        
        // Riqueza
        const riquezaSelect = document.getElementById('nivelRiqueza');
        const riquezaResumo = document.getElementById('resumoRiqueza');
        const dinheiroResumo = document.getElementById('resumoDinheiro');
        
        if (riquezaSelect && riquezaResumo) {
            const atualizarRiqueza = () => {
                const texto = riquezaSelect.options[riquezaSelect.selectedIndex].text;
                const nome = texto.split('[')[0].trim();
                riquezaResumo.textContent = nome;
                
                // Atualizar dinheiro também
                if (dinheiroResumo) {
                    const valor = parseInt(riquezaSelect.value) || 0;
                    const rendaBase = 1000;
                    const multiplicadores = {
                        '-25': 0, '-15': 0.2, '-10': 0.5, '0': 1,
                        '10': 2, '20': 5, '30': 20, '50': 100
                    };
                    const multiplicador = multiplicadores[valor.toString()] || 1;
                    const renda = Math.floor(rendaBase * multiplicador);
                    dinheiroResumo.textContent = `$${renda.toLocaleString('en-US')}`;
                }
            };
            
            atualizarRiqueza();
            riquezaSelect.addEventListener('change', atualizarRiqueza);
        }
        
        console.log('✅ Características sincronizadas no Resumo');
        
    } catch (error) {
        console.error('Erro ao sincronizar Características:', error);
    }
}

// ============================================
// 4. INTEGRAÇÃO COM OUTRAS ABAS (ESQUELETO)
// ============================================

function sincronizarVantagensDesvantagens() {
    // Esta função será expandida quando você integrar vantagens.js
    console.log('⚠️ Vantagens/Desvantagens - Implementar quando a aba estiver pronta');
}

function sincronizarPericias() {
    // Esta função será expandida quando você integrar pericias.js
    console.log('⚠️ Perícias - Implementar quando a aba estiver pronta');
}

function sincronizarMagias() {
    // Esta função será expandida quando você integrar magias.js
    console.log('⚠️ Magias - Implementar quando a aba estiver pronta');
}

// ============================================
// 5. FUNÇÃO PRINCIPAL DE SINCRONIZAÇÃO
// ============================================

function sincronizarTodosOsDados() {
    console.log('🔄 Resumo: Sincronizando todos os dados...');
    
    sincronizarDashboardCompleto();
    sincronizarAtributosCompletos();
    sincronizarCaracteristicas();
    
    // Estas serão ativadas conforme você for criando as outras abas
    sincronizarVantagensDesvantagens();
    sincronizarPericias();
    sincronizarMagias();
    
    estadoResumo.dadosSincronizados = true;
    estadoResumo.ultimaAtualizacao = new Date();
    
    console.log('✅ Resumo: Todos os dados sincronizados');
}

// ============================================
// 6. CONFIGURAÇÃO DE EVENTOS
// ============================================

function configurarEventosResumo() {
    // Escutar eventos de outras abas
    document.addEventListener('atributosAlterados', function(e) {
        console.log('📡 Resumo: Evento de atributos alterados recebido');
        
        if (window.atualizarResumoAtributos) {
            if (e.detail) {
                window.atualizarResumoAtributos(e.detail);
            } else if (typeof window.obterDadosAtributos === 'function') {
                const dados = window.obterDadosAtributos();
                window.atualizarResumoAtributos(dados);
            }
        }
    });
    
    // Escutar quando o dashboard atualizar
    document.addEventListener('dashboardAtualizado', function() {
        console.log('📡 Resumo: Dashboard atualizado');
        atualizarPontosResumo();
    });
    
    // Forçar atualização quando a aba resumo for aberta
    const resumoAba = document.getElementById('resumo');
    if (resumoAba) {
        resumoAba.addEventListener('click', function() {
            setTimeout(() => {
                sincronizarTodosOsDados();
            }, 200);
        });
    }
}

// ============================================
// 7. FUNÇÕES DE UTILIDADE PARA OUTROS SISTEMAS
// ============================================

// Funções que outros sistemas podem chamar para atualizar o resumo
function atualizarPericiasResumo(pericias) {
    const tabela = document.getElementById('tabelaPericiasResumo');
    if (!tabela) return;
    
    if (!pericias || pericias.length === 0) {
        tabela.innerHTML = `
            <tr class="vazio">
                <td colspan="3">Nenhuma perícia</td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    let totalPontos = 0;
    
    // Ordenar por nome
    pericias.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
    
    // Limitar a 20 itens para não sobrecarregar
    const periciasLimitadas = pericias.slice(0, 20);
    
    periciasLimitadas.forEach(pericia => {
        html += `
            <tr>
                <td>${pericia.nome || 'Perícia'}</td>
                <td class="nivel">${pericia.nivel || 0}</td>
                <td class="pontos">${pericia.pontos || 0}</td>
            </tr>
        `;
        totalPontos += pericia.pontos || 0;
    });
    
    tabela.innerHTML = html;
    
    // Atualizar contador de pontos
    const pontosElement = document.getElementById('pontosPericias');
    if (pontosElement) {
        pontosElement.textContent = totalPontos;
    }
}

function atualizarVantagensResumo(vantagens) {
    const lista = document.getElementById('listaVantagensResumo');
    if (!lista) return;
    
    if (!vantagens || vantagens.length === 0) {
        lista.innerHTML = `<div class="vazio">Nenhuma vantagem</div>`;
        return;
    }
    
    let html = '';
    let totalPontos = 0;
    
    // Ordenar por nome
    vantagens.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
    
    // Limitar a 10 itens
    const vantagensLimitadas = vantagens.slice(0, 10);
    
    vantagensLimitadas.forEach(vantagem => {
        html += `
            <div class="item-vantagem">
                <span class="nome">${vantagem.nome}</span>
                <span class="pontos positivo">+${vantagem.pontos || 0}</span>
            </div>
        `;
        totalPontos += vantagem.pontos || 0;
    });
    
    lista.innerHTML = html;
    
    // Atualizar contador de pontos
    const pontosElement = document.getElementById('pontosVantagens');
    if (pontosElement) {
        pontosElement.textContent = `+${totalPontos}`;
    }
}

function atualizarDesvantagensResumo(desvantagens) {
    const lista = document.getElementById('listaDesvantagensResumo');
    if (!lista) return;
    
    if (!desvantagens || desvantagens.length === 0) {
        lista.innerHTML = `<div class="vazio">Nenhuma desvantagem</div>`;
        return;
    }
    
    let html = '';
    let totalPontos = 0;
    
    // Ordenar por pontos (mais negativos primeiro)
    desvantagens.sort((a, b) => (a.pontos || 0) - (b.pontos || 0));
    
    // Limitar a 10 itens
    const desvantagensLimitadas = desvantagens.slice(0, 10);
    
    desvantagensLimitadas.forEach(desvantagem => {
        html += `
            <div class="item-desvantagem">
                <span class="nome">${desvantagem.nome}</span>
                <span class="pontos negativo">${desvantagem.pontos || 0}</span>
            </div>
        `;
        totalPontos += desvantagem.pontos || 0;
    });
    
    lista.innerHTML = html;
    
    // Atualizar contador de pontos
    const pontosElement = document.getElementById('pontosDesvantagens');
    if (pontosElement) {
        pontosElement.textContent = totalPontos;
    }
}

// ============================================
// 8. INICIALIZAÇÃO
// ============================================

function iniciarSistemaResumo() {
    console.log('🚀 Sistema Resumo: Iniciando...');
    
    // Sincronizar dados imediatamente
    sincronizarTodosOsDados();
    
    // Configurar eventos
    configurarEventosResumo();
    
    // Monitorar atualizações periódicas
    setInterval(() => {
        if (estadoResumo.dadosSincronizados) {
            // Atualizar dados que podem mudar sem eventos
            atualizarPontosResumo();
            
            // Atualizar atributos se necessário
            const dados = obterDadosAtributosDiretamente();
            atualizarAtributosNoResumo(dados);
        }
    }, 5000);
    
    console.log('✅ Sistema Resumo: Inicializado com sucesso');
}

// ============================================
// 9. EXPORTAÇÃO DE FUNÇÕES
// ============================================

window.carregarResumo = iniciarSistemaResumo;
window.sincronizarDadosResumo = sincronizarTodosOsDados;
window.atualizarPericiasResumo = atualizarPericiasResumo;
window.atualizarVantagensResumo = atualizarVantagensResumo;
window.atualizarDesvantagensResumo = atualizarDesvantagensResumo;
window.atualizarResumoAtributos = atualizarAtributosNoResumo;

// ============================================
// 10. INICIALIZAÇÃO AUTOMÁTICA
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const resumoAba = document.getElementById('resumo');
    
    // Se a aba já estiver ativa, inicializa
    if (resumoAba && resumoAba.classList.contains('active')) {
        setTimeout(() => {
            iniciarSistemaResumo();
        }, 500);
    }
    
    // Observa mudança para a aba Resumo
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'resumo' && tab.classList.contains('active')) {
                    setTimeout(() => {
                        iniciarSistemaResumo();
                    }, 500);
                }
            }
        });
    });
    
    if (resumoAba) {
        observer.observe(resumoAba, { attributes: true });
    }
});

// Inicialização tardia para garantir que tudo está carregado
window.addEventListener('load', function() {
    setTimeout(() => {
        const resumoAba = document.getElementById('resumo');
        if (resumoAba && resumoAba.classList.contains('active')) {
            iniciarSistemaResumo();
        }
    }, 1000);
});

console.log('📊 Sistema Resumo: Script carregado e pronto');
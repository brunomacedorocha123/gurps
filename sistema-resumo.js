// ============================================
// SISTEMA-RESUMO.JS - VERSÃO 100% COMPLETA
// Integração com TODAS as abas do sistema GURPS
// ============================================

// Estado do Resumo
const estadoResumo = {
    fotoCarregada: false,
    dadosSincronizados: false,
    ultimaAtualizacao: null,
    monitorAtivo: false,
    cache: {
        idiomas: { materno: 'Comum', adicionais: [], pontos: 0 },
        pericias: [],
        vantagens: [],
        desvantagens: [],
        magias: [],
        equipamentos: [],
        tecnicas: []
    }
};

// ============================================
// 1. INTEGRAÇÃO COM DASHBOARD (COMPLETA)
// ============================================

function sincronizarDashboardCompleto() {
    console.log('Resumo: Sincronizando Dashboard...');
    
    try {
        // A. Nome do Personagem
        const nomeInput = document.getElementById('charName');
        const resumoNome = document.getElementById('resumoNome');
        if (nomeInput && resumoNome) {
            resumoNome.textContent = nomeInput.value.trim().toUpperCase() || 'NOVO PERSONAGEM';
            
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
        
        // E. Foto
        sincronizarFotoDashboard();
        
        // F. Pontos
        if (typeof window.dashboardEstado !== 'undefined') {
            atualizarPontosResumo();
        } else {
            monitorarPontosDashboard();
        }
        
        // G. Relacionamentos (Dashboard)
        sincronizarRelacionamentos();
        
        console.log('✅ Dashboard sincronizado no Resumo');
        
    } catch (error) {
        console.error('Erro ao sincronizar Dashboard:', error);
    }
}

function sincronizarFotoDashboard() {
    const fotoDashboard = document.getElementById('fotoPreview');
    const fotoResumo = document.getElementById('fotoResumoImg');
    
    if (fotoDashboard && fotoDashboard.src && fotoResumo) {
        fotoResumo.src = fotoDashboard.src;
        fotoResumo.style.display = 'block';
        estadoResumo.fotoCarregada = true;
        
        configurarUploadFotoUniversal();
    }
    
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
                    if (fotoResumo) {
                        fotoResumo.src = e.target.result;
                        fotoResumo.style.display = 'block';
                        estadoResumo.fotoCarregada = true;
                    }
                    
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
    
    const resumoPontosTotais = document.getElementById('resumoPontosTotais');
    if (resumoPontosTotais) resumoPontosTotais.textContent = pontos.total;
    
    const gastosTotais = 
        (pontos.gastosAtributos || 0) + 
        (pontos.gastosVantagens || 0) + 
        (pontos.gastosPericias || 0) + 
        (pontos.gastosMagias || 0) +
        (pontos.gastosIdiomas || 0) +
        (pontos.gastosTecnicas || 0);
    
    const resumoPontosGastos = document.getElementById('resumoPontosGastos');
    if (resumoPontosGastos) resumoPontosGastos.textContent = gastosTotais;
    
    const resumoSaldo = document.getElementById('resumoSaldo');
    if (resumoSaldo) resumoSaldo.textContent = pontos.saldoDisponivel || pontos.total - gastosTotais;
}

function monitorarPontosDashboard() {
    setInterval(() => {
        const pontosTotaisElement = document.getElementById('pontosTotaisDashboard');
        if (pontosTotaisElement) {
            document.getElementById('resumoPontosTotais').textContent = parseInt(pontosTotaisElement.value) || 150;
        }
        
        const pontosGastosElement = document.getElementById('pontosGastosDashboard');
        if (pontosGastosElement) {
            document.getElementById('resumoPontosGastos').textContent = parseInt(pontosGastosElement.textContent) || 0;
        }
        
        const saldoElement = document.getElementById('saldoDisponivelDashboard');
        if (saldoElement) {
            document.getElementById('resumoSaldo').textContent = parseInt(saldoElement.textContent) || 150;
        }
    }, 1000);
}

function sincronizarRelacionamentos() {
    try {
        if (window.dashboardEstado && window.dashboardEstado.relacionamentos) {
            const rel = window.dashboardEstado.relacionamentos;
            
            const resumoInimigos = document.getElementById('resumoInimigos');
            const resumoAliados = document.getElementById('resumoAliados');
            const resumoDependentes = document.getElementById('resumoDependentes');
            
            if (resumoInimigos) resumoInimigos.textContent = rel.inimigos.length;
            if (resumoAliados) resumoAliados.textContent = rel.aliados.length;
            if (resumoDependentes) resumoDependentes.textContent = rel.dependentes.length;
        }
    } catch (error) {
        console.log('Erro ao sincronizar relacionamentos:', error);
    }
}

// ============================================
// 2. INTEGRAÇÃO COM ATRIBUTOS (COMPLETA)
// ============================================

function sincronizarAtributosCompletos() {
    console.log('Resumo: Sincronizando Atributos...');
    
    try {
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
    
    // Valores principais
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
    document.getElementById('custoST').textContent = (dados.ST - 10) * 10;
    document.getElementById('custoDX').textContent = (dados.DX - 10) * 20;
    document.getElementById('custoIQ').textContent = (dados.IQ - 10) * 20;
    document.getElementById('custoHT').textContent = (dados.HT - 10) * 10;
    
    // Pontos gastos em atributos
    const pontosAtributosElement = document.getElementById('pontosAtributos');
    if (pontosAtributosElement) {
        const totalCustos = 
            ((dados.ST - 10) * 10) +
            ((dados.DX - 10) * 20) +
            ((dados.IQ - 10) * 20) +
            ((dados.HT - 10) * 10);
        pontosAtributosElement.textContent = totalCustos;
    }
    
    // Combate (dano)
    const resumoDano = document.getElementById('resumoDano');
    if (resumoDano && dados.DanoGDP && dados.DanoGEB) {
        resumoDano.textContent = `${dados.DanoGDP}/${dados.DanoGEB}`;
    }
    
    // Defesas (se disponível)
    sincronizarDefesas();
    
    estadoResumo.ultimaAtualizacao = new Date();
}

function sincronizarDefesas() {
    try {
        // Esquiva (DX/2 + 3, arredondado para cima)
        const dx = parseInt(document.getElementById('DX').value) || 10;
        const esquiva = Math.ceil(dx / 2) + 3;
        document.getElementById('resumoEsquiva').textContent = esquiva;
        
        // Bloqueio (se houver escudo)
        const bloqueio = esquiva + 1; // Base: esquiva + 1
        document.getElementById('resumoBloqueio').textContent = bloqueio;
        
    } catch (error) {
        console.log('Erro ao calcular defesas:', error);
    }
}

function monitorarAtributosManual() {
    if (estadoResumo.monitorAtivo) return;
    estadoResumo.monitorAtivo = true;
    
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
    
    setInterval(() => {
        const dados = obterDadosAtributosDiretamente();
        atualizarAtributosNoResumo(dados);
    }, 2000);
}

// ============================================
// 3. INTEGRAÇÃO COM CARACTERÍSTICAS (COMPLETA)
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
        
        // Idiomas (IMPORTANTE!)
        sincronizarIdiomasCompleto();
        
        console.log('✅ Características sincronizadas no Resumo');
        
    } catch (error) {
        console.error('Erro ao sincronizar Características:', error);
    }
}

// ============================================
// 4. INTEGRAÇÃO COM IDIOMAS (COMPLETA)
// ============================================

function sincronizarIdiomasCompleto() {
    console.log('Resumo: Sincronizando Idiomas...');
    
    try {
        const resumoIdiomas = document.getElementById('resumoIdiomas');
        if (!resumoIdiomas) return;
        
        if (typeof window.sistemaIdiomas !== 'undefined') {
            // Usar sistemaIdiomas se disponível
            setInterval(() => {
                atualizarIdiomasNoResumo();
            }, 2000);
        } else {
            // Fallback: monitorar visualmente
            monitorarIdiomasManual();
        }
        
        console.log('✅ Idiomas sincronizados no Resumo');
        
    } catch (error) {
        console.error('Erro ao sincronizar Idiomas:', error);
    }
}

function atualizarIdiomasNoResumo() {
    const resumoIdiomas = document.getElementById('resumoIdiomas');
    if (!resumoIdiomas) return;
    
    let textoIdiomas = '';
    
    if (window.sistemaIdiomas) {
        try {
            const dadosIdiomas = window.sistemaIdiomas.exportarDados();
            
            // Idioma materno
            textoIdiomas = dadosIdiomas.idiomaMaterno.nome || 'Comum';
            
            // Idiomas adicionais
            if (dadosIdiomas.idiomasAdicionais && dadosIdiomas.idiomasAdicionais.length > 0) {
                const nomesIdiomas = dadosIdiomas.idiomasAdicionais.map(i => i.nome);
                textoIdiomas += ', ' + nomesIdiomas.join(', ');
            }
            
            estadoResumo.cache.idiomas = {
                materno: dadosIdiomas.idiomaMaterno.nome,
                adicionais: dadosIdiomas.idiomasAdicionais,
                pontos: dadosIdiomas.pontosTotais
            };
            
        } catch (error) {
            console.log('Erro ao obter dados de idiomas:', error);
            textoIdiomas = 'Comum';
        }
    } else {
        textoIdiomas = obterIdiomasVisualmente();
    }
    
    // Limitar comprimento
    if (textoIdiomas.length > 50) {
        textoIdiomas = textoIdiomas.substring(0, 47) + '...';
    }
    
    resumoIdiomas.textContent = textoIdiomas;
}

function obterIdiomasVisualmente() {
    try {
        const listaIdiomas = document.getElementById('listaIdiomasAdicionais');
        if (!listaIdiomas) return 'Comum';
        
        const inputIdiomaMaterno = document.getElementById('idiomaMaternoNome');
        const idiomaMaterno = inputIdiomaMaterno ? inputIdiomaMaterno.value : 'Comum';
        
        const itensIdiomas = listaIdiomas.querySelectorAll('.idioma-item');
        const idiomasAdicionais = [];
        
        itensIdiomas.forEach(item => {
            const nomeElement = item.querySelector('strong');
            if (nomeElement) {
                idiomasAdicionais.push(nomeElement.textContent);
            }
        });
        
        let resultado = idiomaMaterno;
        if (idiomasAdicionais.length > 0) {
            resultado += ', ' + idiomasAdicionais.join(', ');
        }
        
        return resultado || 'Comum';
        
    } catch (error) {
        console.log('Erro ao obter idiomas visualmente:', error);
        return 'Comum';
    }
}

function monitorarIdiomasManual() {
    const observer = new MutationObserver(() => {
        atualizarIdiomasNoResumo();
    });
    
    const listaIdiomas = document.getElementById('listaIdiomasAdicionais');
    if (listaIdiomas) {
        observer.observe(listaIdiomas, { 
            childList: true, 
            subtree: true 
        });
    }
    
    const inputIdiomaMaterno = document.getElementById('idiomaMaternoNome');
    if (inputIdiomaMaterno) {
        inputIdiomaMaterno.addEventListener('input', () => {
            setTimeout(() => atualizarIdiomasNoResumo(), 300);
        });
    }
}

// ============================================
// 5. INTEGRAÇÃO COM VANTAGENS/DESVANTAGENS
// ============================================

function sincronizarVantagensDesvantagens() {
    console.log('Resumo: Sincronizando Vantagens/Desvantagens...');
    
    try {
        // Verificar se os sistemas estão disponíveis
        if (typeof window.vantagensSistema !== 'undefined') {
            // Usar sistema de vantagens
            setInterval(() => {
                atualizarVantagensResumoDireto();
                atualizarDesvantagensResumoDireto();
            }, 2000);
        } else {
            // Monitorar elementos visuais
            monitorarVantagensDesvantagensManual();
        }
        
        console.log('✅ Vantagens/Desvantagens sincronizadas no Resumo');
        
    } catch (error) {
        console.error('Erro ao sincronizar Vantagens/Desvantagens:', error);
    }
}

function atualizarVantagensResumoDireto() {
    try {
        // Tentar pegar da lista de vantagens
        const listaVantagens = document.getElementById('lista-vantagens');
        if (!listaVantagens) return;
        
        const itens = listaVantagens.querySelectorAll('.vantagem-item');
        const vantagens = [];
        
        itens.forEach(item => {
            const nomeElement = item.querySelector('.vantagem-nome');
            const pontosElement = item.querySelector('.vantagem-pontos');
            
            if (nomeElement && pontosElement) {
                const pontosTexto = pontosElement.textContent;
                const match = pontosTexto.match(/([+-]?\d+)/);
                const pontos = match ? parseInt(match[1]) : 0;
                
                vantagens.push({
                    nome: nomeElement.textContent.trim(),
                    pontos: pontos
                });
            }
        });
        
        // Atualizar no resumo
        atualizarVantagensResumo(vantagens);
        
    } catch (error) {
        console.log('Erro ao pegar vantagens:', error);
    }
}

function atualizarDesvantagensResumoDireto() {
    try {
        const listaDesvantagens = document.getElementById('lista-desvantagens');
        if (!listaDesvantagens) return;
        
        const itens = listaDesvantagens.querySelectorAll('.desvantagem-item');
        const desvantagens = [];
        
        itens.forEach(item => {
            const nomeElement = item.querySelector('.desvantagem-nome');
            const pontosElement = item.querySelector('.desvantagem-pontos');
            
            if (nomeElement && pontosElement) {
                const pontosTexto = pontosElement.textContent;
                const match = pontosTexto.match(/([+-]?\d+)/);
                const pontos = match ? parseInt(match[1]) : 0;
                
                desvantagens.push({
                    nome: nomeElement.textContent.trim(),
                    pontos: pontos
                });
            }
        });
        
        atualizarDesvantagensResumo(desvantagens);
        
    } catch (error) {
        console.log('Erro ao pegar desvantagens:', error);
    }
}

function monitorarVantagensDesvantagensManual() {
    // Monitorar mudanças nas listas
    const observerVantagens = new MutationObserver(() => {
        atualizarVantagensResumoDireto();
    });
    
    const observerDesvantagens = new MutationObserver(() => {
        atualizarDesvantagensResumoDireto();
    });
    
    const listaVantagens = document.getElementById('lista-vantagens');
    const listaDesvantagens = document.getElementById('lista-desvantagens');
    
    if (listaVantagens) observerVantagens.observe(listaVantagens, { childList: true, subtree: true });
    if (listaDesvantagens) observerDesvantagens.observe(listaDesvantagens, { childList: true, subtree: true });
}

// ============================================
// 6. INTEGRAÇÃO COM PERÍCIAS
// ============================================

function sincronizarPericias() {
    console.log('Resumo: Sincronizando Perícias...');
    
    try {
        if (typeof window.sistemaPericias !== 'undefined') {
            setInterval(() => {
                atualizarPericiasResumoDireto();
            }, 2000);
        } else {
            monitorarPericiasManual();
        }
        
        console.log('✅ Perícias sincronizadas no Resumo');
        
    } catch (error) {
        console.error('Erro ao sincronizar Perícias:', error);
    }
}

function atualizarPericiasResumoDireto() {
    try {
        const tabelaPericias = document.getElementById('tabela-pericias');
        if (!tabelaPericias) return;
        
        const rows = tabelaPericias.querySelectorAll('tbody tr');
        const pericias = [];
        
        rows.forEach(row => {
            const nomeElement = row.querySelector('.pericia-nome');
            const nivelElement = row.querySelector('.pericia-nivel');
            const pontosElement = row.querySelector('.pericia-pontos');
            
            if (nomeElement && nivelElement && pontosElement) {
                pericias.push({
                    nome: nomeElement.textContent.trim(),
                    nivel: parseInt(nivelElement.textContent) || 0,
                    pontos: parseInt(pontosElement.textContent) || 0
                });
            }
        });
        
        atualizarPericiasResumo(pericias);
        
    } catch (error) {
        console.log('Erro ao pegar perícias:', error);
    }
}

function monitorarPericiasManual() {
    const observer = new MutationObserver(() => {
        atualizarPericiasResumoDireto();
    });
    
    const tabelaPericias = document.getElementById('tabela-pericias');
    if (tabelaPericias) {
        observer.observe(tabelaPericias, { childList: true, subtree: true });
    }
}

// ============================================
// 7. INTEGRAÇÃO COM TÉCNICAS
// ============================================

function sincronizarTecnicas() {
    console.log('Resumo: Sincronizando Técnicas...');
    
    try {
        const listaTecnicasResumo = document.getElementById('listaTecnicasResumo');
        if (!listaTecnicasResumo) return;
        
        setInterval(() => {
            atualizarTecnicasResumoDireto();
        }, 2000);
        
        console.log('✅ Técnicas sincronizadas no Resumo');
        
    } catch (error) {
        console.error('Erro ao sincronizar Técnicas:', error);
    }
}

function atualizarTecnicasResumoDireto() {
    try {
        const listaTecnicas = document.getElementById('tecnicas-lista');
        const listaTecnicasResumo = document.getElementById('listaTecnicasResumo');
        const pontosTecnicas = document.getElementById('pontosTecnicas');
        
        if (!listaTecnicas || !listaTecnicasResumo) return;
        
        const itens = listaTecnicas.querySelectorAll('.tecnica-item');
        
        if (itens.length === 0) {
            listaTecnicasResumo.innerHTML = '<div class="vazio">Nenhuma técnica</div>';
            if (pontosTecnicas) pontosTecnicas.textContent = '0';
            return;
        }
        
        let html = '';
        let totalPontos = 0;
        
        // Limitar a 10 técnicas
        const limite = Math.min(itens.length, 10);
        
        for (let i = 0; i < limite; i++) {
            const item = itens[i];
            const nomeElement = item.querySelector('.tecnica-nome');
            const nivelElement = item.querySelector('.tecnica-nivel');
            const custoElement = item.querySelector('.tecnica-custo');
            
            if (nomeElement && nivelElement) {
                const nome = nomeElement.textContent.trim();
                const nivel = nivelElement.textContent.trim();
                const custo = custoElement ? parseInt(custoElement.textContent) || 0 : 0;
                
                html += `<div class="tecnica-micro-item">${nome} (${nivel})</div>`;
                totalPontos += custo;
            }
        }
        
        listaTecnicasResumo.innerHTML = html;
        if (pontosTecnicas) pontosTecnicas.textContent = totalPontos;
        
    } catch (error) {
        console.log('Erro ao atualizar técnicas:', error);
    }
}

// ============================================
// 8. INTEGRAÇÃO COM MAGIAS
// ============================================

function sincronizarMagias() {
    console.log('Resumo: Sincronizando Magias...');
    
    try {
        if (typeof window.sistemaMagias !== 'undefined') {
            setInterval(() => {
                atualizarMagiasResumoDireto();
            }, 2000);
        } else {
            monitorarMagiasManual();
        }
        
        console.log('✅ Magias sincronizadas no Resumo');
        
    } catch (error) {
        console.error('Erro ao sincronizar Magias:', error);
    }
}

function atualizarMagiasResumoDireto() {
    try {
        const listaMagias = document.getElementById('lista-magias-aprendidas');
        const listaMagiasResumo = document.getElementById('listaMagiasResumo');
        const pontosMagias = document.getElementById('pontosMagias');
        
        if (!listaMagias || !listaMagiasResumo) return;
        
        const itens = listaMagias.querySelectorAll('.magia-item');
        
        if (itens.length === 0) {
            listaMagiasResumo.innerHTML = '<div class="vazio">Nenhuma magia</div>';
            if (pontosMagias) pontosMagias.textContent = '0';
            return;
        }
        
        let html = '';
        let totalPontos = 0;
        
        // Limitar a 20 magias
        const limite = Math.min(itens.length, 20);
        
        for (let i = 0; i < limite; i++) {
            const item = itens[i];
            const nomeElement = item.querySelector('.magia-nome');
            const nivelElement = item.querySelector('.magia-nivel');
            const custoElement = item.querySelector('.magia-custo');
            
            if (nomeElement && nivelElement) {
                const nome = nomeElement.textContent.trim();
                const nivel = nivelElement.textContent.trim();
                const custo = custoElement ? parseInt(custoElement.textContent) || 0 : 0;
                
                html += `<div class="magia-micro-item">${nome} (${nivel})</div>`;
                totalPontos += custo;
            }
        }
        
        listaMagiasResumo.innerHTML = html;
        if (pontosMagias) pontosMagias.textContent = totalPontos;
        
        // Aptidão Mágica e Mana
        const aptidaoElement = document.getElementById('aptidaoMagica');
        const manaElement = document.getElementById('manaAtual');
        
        if (aptidaoElement && document.getElementById('resumoAptidao')) {
            document.getElementById('resumoAptidao').textContent = aptidaoElement.textContent || '0';
        }
        
        if (manaElement && document.getElementById('resumoMana')) {
            document.getElementById('resumoMana').textContent = manaElement.textContent || '0/0';
        }
        
    } catch (error) {
        console.log('Erro ao atualizar magias:', error);
    }
}

function monitorarMagiasManual() {
    const observer = new MutationObserver(() => {
        atualizarMagiasResumoDireto();
    });
    
    const listaMagias = document.getElementById('lista-magias-aprendidas');
    if (listaMagias) {
        observer.observe(listaMagias, { childList: true, subtree: true });
    }
}

// ============================================
// 9. INTEGRAÇÃO COM EQUIPAMENTOS
// ============================================

function sincronizarEquipamentos() {
    console.log('Resumo: Sincronizando Equipamentos...');
    
    try {
        setInterval(() => {
            atualizarEquipamentoResumoDireto();
        }, 2000);
        
        console.log('✅ Equipamentos sincronizados no Resumo');
        
    } catch (error) {
        console.error('Erro ao sincronizar Equipamentos:', error);
    }
}

function atualizarEquipamentoResumoDireto() {
    try {
        const inventario = document.getElementById('inventario-lista');
        const listaEquipamentoResumo = document.getElementById('listaEquipamentoResumo');
        const cargaResumo = document.getElementById('resumoCarga');
        
        if (!inventario || !listaEquipamentoResumo) return;
        
        const itens = inventario.querySelectorAll('.item-inventario');
        
        if (itens.length === 0) {
            listaEquipamentoResumo.innerHTML = '<span class="vazio">Inventário vazio</span>';
            if (cargaResumo) cargaResumo.textContent = '0/0 kg';
            return;
        }
        
        // Mostrar apenas os primeiros 5 itens
        let html = '';
        let totalPeso = 0;
        let contador = 0;
        
        itens.forEach(item => {
            if (contador < 5) {
                const nomeElement = item.querySelector('.item-nome');
                const quantidadeElement = item.querySelector('.item-quantidade');
                
                if (nomeElement && quantidadeElement) {
                    const nome = nomeElement.textContent.trim();
                    const quantidade = parseInt(quantidadeElement.textContent) || 1;
                    
                    html += `<div class="equipamento-item-micro">${quantidade}x ${nome}</div>`;
                    contador++;
                }
            }
            
            // Calcular peso total
            const pesoElement = item.querySelector('.item-peso');
            if (pesoElement) {
                const pesoTexto = pesoElement.textContent;
                const pesoMatch = pesoTexto.match(/(\d+\.?\d*)/);
                if (pesoMatch) {
                    totalPeso += parseFloat(pesoMatch[1]);
                }
            }
        });
        
        listaEquipamentoResumo.innerHTML = html;
        
        // Calcular carga máxima baseada em ST
        const ST = parseInt(document.getElementById('ST').value) || 10;
        const cargaMaxima = ST * 6; // Base: ST * 6 kg
        
        if (cargaResumo) {
            cargaResumo.textContent = `${totalPeso.toFixed(1)}/${cargaMaxima} kg`;
        }
        
    } catch (error) {
        console.log('Erro ao atualizar equipamentos:', error);
    }
}

// ============================================
// 10. FUNÇÕES DE UTILIDADE
// ============================================

function atualizarElemento(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = valor;
    }
}

// ============================================
// 11. FUNÇÃO PRINCIPAL DE SINCRONIZAÇÃO TOTAL
// ============================================

function sincronizarTodosOsDados() {
    console.log('🔄 Resumo: Sincronizando TODOS os dados...');
    
    // Todas as integrações
    sincronizarDashboardCompleto();
    sincronizarAtributosCompletos();
    sincronizarCaracteristicas(); // Inclui idiomas
    sincronizarVantagensDesvantagens();
    sincronizarPericias();
    sincronizarTecnicas();
    sincronizarMagias();
    sincronizarEquipamentos();
    
    estadoResumo.dadosSincronizados = true;
    estadoResumo.ultimaAtualizacao = new Date();
    
    console.log('✅ Resumo: TODOS os dados sincronizados');
}

// ============================================
// 12. CONFIGURAÇÃO DE EVENTOS
// ============================================

function configurarEventosResumo() {
    // Eventos de outras abas
    document.addEventListener('atributosAlterados', function(e) {
        if (window.atualizarResumoAtributos) {
            if (e.detail) {
                window.atualizarResumoAtributos(e.detail);
            } else if (typeof window.obterDadosAtributos === 'function') {
                const dados = window.obterDadosAtributos();
                window.atualizarResumoAtributos(dados);
            }
        }
    });
    
    document.addEventListener('dashboardAtualizado', function() {
        if (typeof window.dashboardEstado !== 'undefined') {
            atualizarPontosResumo();
            sincronizarRelacionamentos();
        }
    });
    
    document.addEventListener('idiomasAtualizados', function(e) {
        atualizarIdiomasNoResumo();
    });
    
    // Atualizar quando a aba resumo for aberta
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
// 13. FUNÇÕES PARA OUTROS SISTEMAS USAREM
// ============================================

function atualizarPericiasResumo(pericias) {
    const tabela = document.getElementById('tabelaPericiasResumo');
    if (!tabela) return;
    
    if (!pericias || pericias.length === 0) {
        tabela.innerHTML = '<tr class="vazio"><td colspan="3">Nenhuma perícia</td></tr>';
        return;
    }
    
    let html = '';
    let totalPontos = 0;
    
    pericias.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
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
    
    const pontosElement = document.getElementById('pontosPericias');
    if (pontosElement) pontosElement.textContent = totalPontos;
}

function atualizarVantagensResumo(vantagens) {
    const lista = document.getElementById('listaVantagensResumo');
    if (!lista) return;
    
    if (!vantagens || vantagens.length === 0) {
        lista.innerHTML = '<div class="vazio">Nenhuma vantagem</div>';
        return;
    }
    
    let html = '';
    let totalPontos = 0;
    
    vantagens.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
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
    
    const pontosElement = document.getElementById('pontosVantagens');
    if (pontosElement) pontosElement.textContent = `+${totalPontos}`;
}

function atualizarDesvantagensResumo(desvantagens) {
    const lista = document.getElementById('listaDesvantagensResumo');
    if (!lista) return;
    
    if (!desvantagens || desvantagens.length === 0) {
        lista.innerHTML = '<div class="vazio">Nenhuma desvantagem</div>';
        return;
    }
    
    let html = '';
    let totalPontos = 0;
    
    desvantagens.sort((a, b) => (a.pontos || 0) - (b.pontos || 0));
    const desvantagensLimitadas = desvantagens.slice(0, 10);
    
    desvantagensLimitadas.forEach(desvantagem => {
        html += `
            <div class="item-desvantagem">
                <span class="nome">${desvantagem.nome}</span>
                <span class="pontos negativo">${desvantagem.pontos || 0}</span>
            </div>
        `;
        totalPontos += Math.abs(desvantagem.pontos || 0);
    });
    
    lista.innerHTML = html;
    
    const pontosElement = document.getElementById('pontosDesvantagens');
    if (pontosElement) pontosElement.textContent = `-${totalPontos}`;
}

// ============================================
// 14. INICIALIZAÇÃO COMPLETA
// ============================================

function iniciarSistemaResumo() {
    console.log('🚀 Sistema Resumo COMPLETO: Iniciando...');
    
    sincronizarTodosOsDados();
    configurarEventosResumo();
    
    // Monitoramento contínuo
    setInterval(() => {
        if (estadoResumo.dadosSincronizados) {
            atualizarPontosResumo();
            
            const dados = obterDadosAtributosDiretamente();
            atualizarAtributosNoResumo(dados);
            
            atualizarIdiomasNoResumo();
            atualizarEquipamentoResumoDireto();
        }
    }, 3000);
    
    console.log('✅ Sistema Resumo COMPLETO: Inicializado com sucesso');
}

// ============================================
// 15. EXPORTAÇÃO DE FUNÇÕES GLOBAIS
// ============================================

window.carregarResumo = iniciarSistemaResumo;
window.sincronizarDadosResumo = sincronizarTodosOsDados;
window.atualizarPericiasResumo = atualizarPericiasResumo;
window.atualizarVantagensResumo = atualizarVantagensResumo;
window.atualizarDesvantagensResumo = atualizarDesvantagensResumo;
window.atualizarResumoAtributos = atualizarAtributosNoResumo;
window.atualizarIdiomasResumo = atualizarIdiomasNoResumo;

// ============================================
// 16. INICIALIZAÇÃO AUTOMÁTICA
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const resumoAba = document.getElementById('resumo');
    
    if (resumoAba && resumoAba.classList.contains('active')) {
        setTimeout(() => {
            iniciarSistemaResumo();
        }, 500);
    }
    
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

window.addEventListener('load', function() {
    setTimeout(() => {
        const resumoAba = document.getElementById('resumo');
        if (resumoAba && resumoAba.classList.contains('active')) {
            iniciarSistemaResumo();
        }
    }, 1000);
});

console.log('📊 Sistema Resumo COMPLETO: Script carregado e pronto para TODAS as abas');
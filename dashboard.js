// ===== DASHBOARD.JS - VERSÃO 3.0 COM RIQUEZA POSITIVA =====

// Estado do dashboard - ATUALIZADO
let dashboardEstado = {
    pontos: {
        total: 150,
        gastosAtributos: 0,
        gastosVantagens: 0,
        gastosPericias: 0,
        gastosMagias: 0,
        desvantagensVantagens: 0,
        aparenciaDesvantagens: 0,
        riquezaDesvantagens: 0,
        riquezaVantagens: 0,           // NOVO: Riqueza positiva (Confortável, Rico, etc)
        totalDesvantagens: 0,
        limiteDesvantagens: -50,
        saldoDisponivel: 150
    },
    atributos: {
        ST: 10,
        DX: 10,
        IQ: 10,
        HT: 10,
        PV: { atual: 10, max: 10 },
        PF: { atual: 10, max: 10 }
    },
    identificacao: {
        raca: '',
        classe: '',
        nivel: '',
        descricao: ''
    },
    relacionamentos: {
        inimigos: [],
        aliados: [],
        dependentes: []
    },
    caracteristicas: {
        aparencia: 'Comum',
        riqueza: 'Média',
        saldo: '$2.000'
    },
    status: {
        ultimaAtualizacao: new Date().toISOString(),
        integridade: 'OK',
        versao: '3.0'
    }
};

// ===== 1. SISTEMA DE FOTO (MANTIDO IGUAL) =====
function configurarSistemaFoto() {
    const fotoUpload = document.getElementById('fotoUpload');
    const fotoPreview = document.getElementById('fotoPreview');
    const fotoPlaceholder = document.getElementById('fotoPlaceholder');
    const btnRemoverFoto = document.getElementById('btnRemoverFoto');

    if (!fotoUpload || !fotoPreview || !fotoPlaceholder || !btnRemoverFoto) return;

    fotoUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                fotoPreview.src = e.target.result;
                fotoPreview.style.display = 'block';
                fotoPlaceholder.style.display = 'none';
                btnRemoverFoto.style.display = 'inline-block';
                localStorage.setItem('personagem_foto', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    btnRemoverFoto.addEventListener('click', function() {
        fotoPreview.src = '';
        fotoPreview.style.display = 'none';
        fotoPlaceholder.style.display = 'flex';
        btnRemoverFoto.style.display = 'none';
        fotoUpload.value = '';
        localStorage.removeItem('personagem_foto');
    });

    const fotoSalva = localStorage.getItem('personagem_foto');
    if (fotoSalva) {
        fotoPreview.src = fotoSalva;
        fotoPreview.style.display = 'block';
        fotoPlaceholder.style.display = 'none';
        btnRemoverFoto.style.display = 'inline-block';
    }
}

// ===== 2. SISTEMA DE IDENTIFICAÇÃO (MANTIDO IGUAL) =====
function configurarCamposIdentificacao() {
    const campos = ['racaPersonagem', 'classePersonagem', 'nivelPersonagem', 'descricaoPersonagem'];
    
    campos.forEach(campoId => {
        const campo = document.getElementById(campoId);
        if (campo) {
            const valorSalvo = localStorage.getItem(`personagem_${campoId}`);
            if (valorSalvo) {
                campo.value = valorSalvo;
                if (campoId === 'descricaoPersonagem') {
                    atualizarContadorDescricao();
                }
            }
            
            campo.addEventListener('input', function() {
                localStorage.setItem(`personagem_${campoId}`, campo.value);
                if (campoId === 'descricaoPersonagem') {
                    atualizarContadorDescricao();
                }
            });
        }
    });
}

function atualizarContadorDescricao() {
    const textarea = document.getElementById('descricaoPersonagem');
    const contador = document.getElementById('contadorDescricao');
    if (textarea && contador) {
        contador.textContent = textarea.value.length;
    }
}

// ===== 3. SISTEMA DE PONTOS (MANTIDO IGUAL) =====
function configurarControlePontos() {
    const pontosTotaisInput = document.getElementById('pontosTotaisDashboard');
    const limiteDesvantagensInput = document.getElementById('limiteDesvantagens');
    
    const pontosSalvos = localStorage.getItem('dashboard_pontosTotais');
    const limiteSalvo = localStorage.getItem('dashboard_limiteDesvantagens');
    
    if (pontosSalvos && pontosTotaisInput) {
        pontosTotaisInput.value = pontosSalvos;
        dashboardEstado.pontos.total = parseInt(pontosSalvos);
    }
    
    if (limiteSalvo && limiteDesvantagensInput) {
        limiteDesvantagensInput.value = limiteSalvo;
        dashboardEstado.pontos.limiteDesvantagens = parseInt(limiteSalvo);
    }
    
    if (pontosTotaisInput) {
        pontosTotaisInput.addEventListener('change', function() {
            const valor = parseInt(this.value) || 150;
            dashboardEstado.pontos.total = valor;
            calcularSaldoDisponivel();
            localStorage.setItem('dashboard_pontosTotais', valor);
            atualizarDisplayPontos();
        });
    }
    
    if (limiteDesvantagensInput) {
        limiteDesvantagensInput.addEventListener('change', function() {
            const valor = parseInt(this.value) || -50;
            dashboardEstado.pontos.limiteDesvantagens = valor;
            localStorage.setItem('dashboard_limiteDesvantagens', valor);
            atualizarDisplayPontos();
        });
    }
}

// ===== 4. MONITORAMENTO DE ATRIBUTOS (MANTIDO IGUAL) =====
function monitorarAtributos() {
    setInterval(() => {
        puxarValoresAtributos();
    }, 1000);
}

function puxarValoresAtributos() {
    try {
        const stInput = document.getElementById('ST');
        const dxInput = document.getElementById('DX');
        const iqInput = document.getElementById('IQ');
        const htInput = document.getElementById('HT');
        
        if (stInput && dxInput && iqInput && htInput) {
            const ST = parseInt(stInput.value) || 10;
            const DX = parseInt(dxInput.value) || 10;
            const IQ = parseInt(iqInput.value) || 10;
            const HT = parseInt(htInput.value) || 10;
            
            dashboardEstado.atributos.ST = ST;
            dashboardEstado.atributos.DX = DX;
            dashboardEstado.atributos.IQ = IQ;
            dashboardEstado.atributos.HT = HT;
            
            calcularCustoAtributos(ST, DX, IQ, HT);
        }
        
        const pvTotalElement = document.getElementById('PVTotal');
        const pfTotalElement = document.getElementById('PFTotal');
        
        if (pvTotalElement && pfTotalElement) {
            const pvText = pvTotalElement.textContent;
            const pfText = pfTotalElement.textContent;
            
            const pvValor = parseInt(pvText.split('/')[0]) || 10;
            const pfValor = parseInt(pfText.split('/')[0]) || 10;
            
            dashboardEstado.atributos.PV = { atual: pvValor, max: pvValor };
            dashboardEstado.atributos.PF = { atual: pfValor, max: pfValor };
        }
        
        atualizarDisplayAtributos();
        atualizarDisplayVitalidade();
        
    } catch (error) {
        console.log('Erro ao puxar atributos:', error);
    }
}

function calcularCustoAtributos(ST, DX, IQ, HT) {
    const custoST = (ST - 10) * 10;
    const custoDX = (DX - 10) * 20;
    const custoIQ = (IQ - 10) * 20;
    const custoHT = (HT - 10) * 10;
    
    const totalAtributos = custoST + custoDX + custoIQ + custoHT;
    dashboardEstado.pontos.gastosAtributos = totalAtributos;
    
    calcularSaldoDisponivel();
}

// ===== 5. MONITORAMENTO DE OUTRAS ABAS =====
function monitorarOutrasAbas() {
    setInterval(() => {
        puxarDadosVantagensDesvantagens();
        puxarDadosPericias();
        puxarDadosMagias();
        puxarDadosCaracteristicas();
        puxarDadosAparencia();
        puxarDadosRiqueza();
        
        calcularTotalDesvantagens();
        atualizarDisplayResumoGastos();
        atualizarDisplayPontos();
    }, 1500);
    
    configurarMonitoramentoCaracteristicas();
    configurarMonitoramentoRiqueza(); // NOVO
}

// ===== 5.1 MONITORAMENTO VANTAGENS/DESVANTAGENS (MANTIDO IGUAL) =====
function puxarDadosVantagensDesvantagens() {
    try {
        dashboardEstado.pontos.gastosVantagens = 0;
        dashboardEstado.pontos.desvantagensVantagens = 0;
        
        const totalVantagensElement = document.getElementById('total-vantagens');
        if (totalVantagensElement) {
            const texto = totalVantagensElement.textContent;
            const match = texto.match(/([+-]?\d+)/);
            if (match) {
                const valor = parseInt(match[1]) || 0;
                if (valor > 0) {
                    dashboardEstado.pontos.gastosVantagens = valor;
                }
            }
        }
        
        const totalDesvantagensElement = document.getElementById('total-desvantagens');
        if (totalDesvantagensElement) {
            const texto = totalDesvantagensElement.textContent;
            const match = texto.match(/([+-]?\d+)/);
            if (match) {
                const valor = parseInt(match[1]) || 0;
                if (valor < 0) {
                    dashboardEstado.pontos.desvantagensVantagens = Math.abs(valor);
                }
            }
        }
        
        calcularSaldoDisponivel();
        
    } catch (error) {
        console.log('Erro ao puxar vantagens/desvantagens:', error);
    }
}

// ===== 5.2 MONITORAMENTO DE APARÊNCIA =====
function puxarDadosAparencia() {
    try {
        dashboardEstado.pontos.aparenciaDesvantagens = 0;
        
        const selectAparencia = document.getElementById('nivelAparencia');
        if (selectAparencia) {
            const valor = parseInt(selectAparencia.value) || 0;
            
            if (valor < 0) {
                dashboardEstado.pontos.aparenciaDesvantagens = Math.abs(valor);
            }
        }
        
        calcularSaldoDisponivel();
        
    } catch (error) {
        console.log('Erro ao puxar aparência:', error);
    }
}

// ===== 5.3 MONITORAMENTO DE RIQUEZA - ATUALIZADO =====
function puxarDadosRiqueza() {
    try {
        const selectRiqueza = document.getElementById('nivelRiqueza');
        if (selectRiqueza) {
            const valor = parseInt(selectRiqueza.value) || 0;
            
            // Se for negativo, é desvantagem (ganha pontos)
            if (valor < 0) {
                dashboardEstado.pontos.riquezaDesvantagens = Math.abs(valor);
                dashboardEstado.pontos.riquezaVantagens = 0;
            } 
            // Se for positivo, é vantagem (gasta pontos)
            else if (valor > 0) {
                dashboardEstado.pontos.riquezaDesvantagens = 0;
                dashboardEstado.pontos.riquezaVantagens = valor;
            }
            // Se for 0, é neutro
            else {
                dashboardEstado.pontos.riquezaDesvantagens = 0;
                dashboardEstado.pontos.riquezaVantagens = 0;
            }
        }
        
        calcularSaldoDisponivel();
        
    } catch (error) {
        console.log('Erro ao puxar riqueza:', error);
    }
}

// ===== 5.4 MONITORAMENTO DE PERÍCIAS (MANTIDO) =====
function puxarDadosPericias() {
    try {
        const pontosPericiasTotalElement = document.getElementById('pontos-pericias-total');
        if (pontosPericiasTotalElement) {
            const texto = pontosPericiasTotalElement.textContent;
            const match = texto.match(/(\d+)/);
            if (match) {
                dashboardEstado.pontos.gastosPericias = parseInt(match[1]) || 0;
                calcularSaldoDisponivel();
            }
        }
    } catch (error) {
        console.log('Erro ao puxar perícias:', error);
    }
}

// ===== 5.5 MONITORAMENTO DE MAGIAS (MANTIDO) =====
function puxarDadosMagias() {
    try {
        const totalGastoMagiaElement = document.getElementById('total-gasto-magia');
        if (totalGastoMagiaElement) {
            const texto = totalGastoMagiaElement.textContent;
            const match = texto.match(/(\d+)/);
            if (match) {
                dashboardEstado.pontos.gastosMagias = parseInt(match[1]) || 0;
                calcularSaldoDisponivel();
            }
        }
    } catch (error) {
        console.log('Erro ao puxar magias:', error);
    }
}

// ===== 5.6 MONITORAMENTO DE CARACTERÍSTICAS (ATUALIZADO) =====
function puxarDadosCaracteristicas() {
    try {
        // APARÊNCIA
        const nivelAparenciaSelect = document.getElementById('nivelAparencia');
        if (nivelAparenciaSelect) {
            const texto = nivelAparenciaSelect.options[nivelAparenciaSelect.selectedIndex].text;
            const nome = texto.split('[')[0].trim();
            dashboardEstado.caracteristicas.aparencia = nome;
        }
        
        // RIQUEZA (ATUALIZADO)
        const nivelRiquezaSelect = document.getElementById('nivelRiqueza');
        if (nivelRiquezaSelect) {
            const texto = nivelRiquezaSelect.options[nivelRiquezaSelect.selectedIndex].text;
            const nome = texto.split('[')[0].trim();
            dashboardEstado.caracteristicas.riqueza = nome;
            
            // Calcular renda real
            const valor = parseInt(nivelRiquezaSelect.value) || 0;
            const renda = calcularRendaReal(valor);
            dashboardEstado.caracteristicas.saldo = formatarMoedaDashboard(renda);
        }
        
        atualizarDisplayCaracteristicas();
        
    } catch (error) {
        console.log('Erro ao puxar características:', error);
    }
}

// ===== 5.7 CALCULAR RENDA REAL =====
function calcularRendaReal(pontosRiqueza) {
    // Base: R$ 1.000 para nível Médio (0 pontos)
    const rendaBase = 1000;
    
    // Multiplicadores baseados nos pontos
    const multiplicadores = {
        '-25': 0,      // Falido
        '-15': 0.2,    // Pobre
        '-10': 0.5,    // Batalhador
        '0': 1,        // Médio
        '10': 2,       // Confortável
        '20': 5,       // Rico
        '30': 20,      // Muito Rico
        '50': 100      // Podre de Rico
    };
    
    const multiplicador = multiplicadores[pontosRiqueza.toString()] || 1;
    return Math.floor(rendaBase * multiplicador);
}

function formatarMoedaDashboard(valor) {
    return `$${valor.toLocaleString('en-US')}`;
}

// ===== 5.8 CONFIGURAR MONITORAMENTO DE CARACTERÍSTICAS =====
function configurarMonitoramentoCaracteristicas() {
    document.addEventListener('aparenciaPontosAtualizados', function(e) {
        if (e.detail && e.detail.pontos < 0) {
            dashboardEstado.pontos.aparenciaDesvantagens = Math.abs(e.detail.pontos);
            calcularTotalDesvantagens();
            calcularSaldoDisponivel();
            atualizarDisplayPontos();
            atualizarDisplayResumoGastos();
        }
    });
    
    document.addEventListener('riquezaPontosAtualizados', function(e) {
        if (e.detail) {
            const pontos = e.detail.pontos;
            
            if (pontos > 0) {
                dashboardEstado.pontos.riquezaVantagens = pontos;
                dashboardEstado.pontos.riquezaDesvantagens = 0;
            } else if (pontos < 0) {
                dashboardEstado.pontos.riquezaVantagens = 0;
                dashboardEstado.pontos.riquezaDesvantagens = Math.abs(pontos);
            } else {
                dashboardEstado.pontos.riquezaVantagens = 0;
                dashboardEstado.pontos.riquezaDesvantagens = 0;
            }
            
            // Atualizar características
            if (e.detail.nivel) {
                dashboardEstado.caracteristicas.riqueza = e.detail.nivel;
            }
            if (e.detail.rendaMensal) {
                dashboardEstado.caracteristicas.saldo = formatarMoedaDashboard(e.detail.rendaMensal);
            }
            
            atualizarDisplayCaracteristicas();
            calcularTotalDesvantagens();
            calcularSaldoDisponivel();
            atualizarDisplayPontos();
            atualizarDisplayResumoGastos();
        }
    });
}

// ===== 5.9 CONFIGURAR MONITORAMENTO DE RIQUEZA (NOVO) =====
function configurarMonitoramentoRiqueza() {
    console.log('💰 Configurando monitoramento de riqueza...');
    
    // Monitorar mudanças no select de riqueza
    const selectRiqueza = document.getElementById('nivelRiqueza');
    if (selectRiqueza) {
        selectRiqueza.addEventListener('change', function() {
            setTimeout(() => {
                puxarDadosRiqueza();
                puxarDadosCaracteristicas();
            }, 100);
        });
    }
}

// ===== 6. CÁLCULO DO TOTAL DE DESVANTAGENS (ATUALIZADO) =====
function calcularTotalDesvantagens() {
    const total = 
        dashboardEstado.pontos.desvantagensVantagens +
        dashboardEstado.pontos.aparenciaDesvantagens +
        dashboardEstado.pontos.riquezaDesvantagens;
    
    dashboardEstado.pontos.totalDesvantagens = total;
    
    console.log('📊 TOTAL Desvantagens:', total, 
        ' (Desv.Vantagens:', dashboardEstado.pontos.desvantagensVantagens,
        ' + Aparência:', dashboardEstado.pontos.aparenciaDesvantagens,
        ' + Riqueza:', dashboardEstado.pontos.riquezaDesvantagens, ')');
    
    return total;
}

// ===== 7. CÁLCULO CORRETO DO SALDO (ATUALIZADO) =====
function calcularSaldoDisponivel() {
    calcularTotalDesvantagens();
    
    const { 
        total, 
        gastosAtributos, 
        gastosVantagens, 
        gastosPericias, 
        gastosMagias,
        riquezaVantagens,
        totalDesvantagens 
    } = dashboardEstado.pontos;
    
    // Vantagens totais (inclui riqueza positiva)
    const vantagensTotais = gastosVantagens + riquezaVantagens;
    
    // Gastos totais (tudo que DEBITA pontos)
    const gastosTotais = gastosAtributos + vantagensTotais + gastosPericias + gastosMagias;
    
    // Desvantagens ADICIONAM pontos (são pontos GANHOS)
    dashboardEstado.pontos.saldoDisponivel = total - gastosTotais + totalDesvantagens;
    
    console.log('🧮 Cálculo do saldo v3:', 
        total, '-', gastosTotais, '+', totalDesvantagens, '=', dashboardEstado.pontos.saldoDisponivel);
    console.log('   - Vantagens totais:', vantagensTotais, 
                '(Vantagens:', gastosVantagens, '+ Riqueza:', riquezaVantagens, ')');
    
    atualizarDisplayPontos();
    atualizarDisplayResumoGastos();
}

// ===== 8. FUNÇÕES DE ATUALIZAÇÃO DE DISPLAY =====
function atualizarDisplayAtributos() {
    const { ST, DX, IQ, HT } = dashboardEstado.atributos;
    
    const elementos = {
        statusST: document.getElementById('statusST'),
        statusDX: document.getElementById('statusDX'),
        statusIQ: document.getElementById('statusIQ'),
        statusHT: document.getElementById('statusHT')
    };
    
    if (elementos.statusST) elementos.statusST.textContent = ST;
    if (elementos.statusDX) elementos.statusDX.textContent = DX;
    if (elementos.statusIQ) elementos.statusIQ.textContent = IQ;
    if (elementos.statusHT) elementos.statusHT.textContent = HT;
}

function atualizarDisplayVitalidade() {
    const { PV, PF } = dashboardEstado.atributos;
    
    const statusPV = document.getElementById('statusPV');
    const statusPF = document.getElementById('statusPF');
    
    if (statusPV) statusPV.textContent = `${PV.atual}/${PV.max}`;
    if (statusPF) statusPF.textContent = `${PF.atual}/${PF.max}`;
    
    const barPV = document.querySelector('.bar-pv');
    const barPF = document.querySelector('.bar-pf');
    
    if (barPV) {
        const percentPV = (PV.atual / PV.max) * 100;
        barPV.style.width = `${Math.min(percentPV, 100)}%`;
    }
    
    if (barPF) {
        const percentPF = (PF.atual / PF.max) * 100;
        barPF.style.width = `${Math.min(percentPF, 100)}%`;
    }
}

function atualizarDisplayCaracteristicas() {
    const { aparencia, riqueza, saldo } = dashboardEstado.caracteristicas;
    
    const aparenciaElement = document.getElementById('statusAparencia');
    const riquezaElement = document.getElementById('statusRiqueza');
    const saldoElement = document.getElementById('statusSaldo');
    
    if (aparenciaElement) {
        aparenciaElement.textContent = aparencia;
        // Colorir baseado no valor
        if (aparencia.includes('Feio') || aparencia.includes('Hediondo')) {
            aparenciaElement.style.color = '#e74c3c';
        } else if (aparencia.includes('Atraente') || aparencia.includes('Muito')) {
            aparenciaElement.style.color = '#27ae60';
        } else {
            aparenciaElement.style.color = '#3498db';
        }
    }
    
    if (riquezaElement) {
        riquezaElement.textContent = riqueza;
        // Colorir baseado no valor
        if (riqueza.includes('Pobre') || riqueza.includes('Falido') || riqueza.includes('Batalhador')) {
            riquezaElement.style.color = '#e74c3c';
        } else if (riqueza.includes('Confortável') || riqueza.includes('Rico')) {
            riquezaElement.style.color = '#27ae60';
        } else {
            riquezaElement.style.color = '#3498db';
        }
    }
    
    if (saldoElement) {
        saldoElement.textContent = saldo;
        // Colorir baseado no valor
        if (saldo === '$0' || saldo.includes('$0')) {
            saldoElement.style.color = '#e74c3c';
        } else if (parseInt(saldo.replace(/[^0-9]/g, '')) > 2000) {
            saldoElement.style.color = '#27ae60';
            saldoElement.style.fontWeight = 'bold';
        } else {
            saldoElement.style.color = '#3498db';
        }
    }
}

function atualizarDisplayPontos() {
    const { 
        total, 
        gastosAtributos, 
        gastosVantagens, 
        gastosPericias, 
        gastosMagias,
        riquezaVantagens,
        totalDesvantagens,
        saldoDisponivel, 
        limiteDesvantagens 
    } = dashboardEstado.pontos;
    
    // Pontos Gastos Dashboard (INCLUI RIQUEZA POSITIVA)
    const vantagensTotais = gastosVantagens + riquezaVantagens;
    const pontosGastosDashboard = gastosAtributos + vantagensTotais + gastosPericias + gastosMagias;
    
    const pontosGastosElement = document.getElementById('pontosGastosDashboard');
    if (pontosGastosElement) {
        pontosGastosElement.textContent = pontosGastosDashboard;
    }
    
    // Saldo Disponível
    const saldoElement = document.getElementById('saldoDisponivelDashboard');
    if (saldoElement) {
        saldoElement.textContent = saldoDisponivel;
        
        if (saldoDisponivel < 0) {
            saldoElement.style.color = '#e74c3c';
            saldoElement.title = 'Saldo negativo! Adicione desvantagens ou reduza gastos.';
        } else if (saldoDisponivel < 50) {
            saldoElement.style.color = '#f39c12';
            saldoElement.title = 'Saldo baixo. Cuidado com os gastos.';
        } else {
            saldoElement.style.color = '#27ae60';
            saldoElement.title = 'Saldo saudável';
        }
    }
    
    // DESVANTAGENS ATUAIS (CARD SUPERIOR)
    const desvantagensElement = document.getElementById('desvantagensAtuais');
    if (desvantagensElement) {
        desvantagensElement.textContent = totalDesvantagens;
        
        if (totalDesvantagens > Math.abs(limiteDesvantagens)) {
            desvantagensElement.style.color = '#e74c3c';
            desvantagensElement.title = `Limite excedido! ${totalDesvantagens}/${Math.abs(limiteDesvantagens)}`;
        } else if (totalDesvantagens > Math.abs(limiteDesvantagens) * 0.8) {
            desvantagensElement.style.color = '#f39c12';
            desvantagensElement.title = `Próximo do limite: ${totalDesvantagens}/${Math.abs(limiteDesvantagens)}`;
        } else {
            desvantagensElement.style.color = '#9b59b6';
            desvantagensElement.title = `Desvantagens: ${totalDesvantagens} pontos ganhos`;
        }
    }
}

// ===== 9. ATUALIZAR DISPLAY RESUMO DE GASTOS (ATUALIZADO) =====
function atualizarDisplayResumoGastos() {
    const { 
        gastosAtributos, 
        gastosVantagens, 
        gastosPericias, 
        gastosMagias,
        riquezaVantagens,
        totalDesvantagens 
    } = dashboardEstado.pontos;
    
    // Vantagens totais (inclui riqueza positiva)
    const vantagensTotais = gastosVantagens + riquezaVantagens;
    
    const elementos = {
        gastosAtributos: document.getElementById('gastosAtributos'),
        gastosVantagens: document.getElementById('gastosVantagens'),
        gastosPericias: document.getElementById('gastosPericias'),
        gastosMagias: document.getElementById('gastosMagias'),
        gastosDesvantagens: document.getElementById('gastosDesvantagens'),
        gastosTotal: document.getElementById('gastosTotal')
    };
    
    // Atualizar valores nos cards
    if (elementos.gastosAtributos) {
        elementos.gastosAtributos.textContent = gastosAtributos;
    }
    
    if (elementos.gastosVantagens) {
    elementos.gastosVantagens.textContent = vantagensTotais;
    // ⬆️⬆️⬆️ APENAS ESTA LINHA! ⬆️⬆️⬆️
}
    
    if (elementos.gastosPericias) {
        elementos.gastosPericias.textContent = gastosPericias;
    }
    
    if (elementos.gastosMagias) {
        elementos.gastosMagias.textContent = gastosMagias;
    }
    
    // CARD DE DESVANTAGENS & PECULIARIDADES
    if (elementos.gastosDesvantagens) {
        elementos.gastosDesvantagens.textContent = totalDesvantagens;
        elementos.gastosDesvantagens.style.color = '#9b59b6';
        
        if (totalDesvantagens > 0) {
            elementos.gastosDesvantagens.innerHTML = `
                <span style="display: flex; align-items: center; gap: 5px;">
                    <i class="fas fa-exclamation-circle"></i>
                    ${totalDesvantagens}
                    <small style="font-size: 0.7em; color: #95a5a6;">
                        (ganhos)
                    </small>
                </span>
            `;
        }
    }
    
   // CARD TOTAL GASTOS LÍQUIDOS
const gastosTotais = gastosAtributos + vantagensTotais + gastosPericias + gastosMagias;
const gastosLiquidos = gastosTotais - totalDesvantagens;

if (elementos.gastosTotal) {
    elementos.gastosTotal.textContent = gastosLiquidos;
    
    if (gastosLiquidos < 0) {
        elementos.gastosTotal.style.color = '#9b59b6';
    } else if (gastosLiquidos > dashboardEstado.pontos.total) {
        elementos.gastosTotal.style.color = '#e74c3c';
    } else if (gastosLiquidos > dashboardEstado.pontos.total * 0.8) {
        elementos.gastosTotal.style.color = '#f39c12';
    } else {
        elementos.gastosTotal.style.color = '#27ae60';
    }
}
// ===== 10. SISTEMA DE RELACIONAMENTOS (MANTIDO IGUAL) =====
function configurarSistemaRelacionamentos() {
    carregarRelacionamentos();
    
    document.querySelectorAll('.btn-adicionar').forEach(btn => {
        btn.addEventListener('click', function() {
            const tipo = this.getAttribute('data-tipo');
            adicionarRelacionamento(tipo);
        });
    });
}

function carregarRelacionamentos() {
    const tipos = ['inimigos', 'aliados', 'dependentes'];
    
    tipos.forEach(tipo => {
        const salvo = localStorage.getItem(`dashboard_relacionamentos_${tipo}`);
        if (salvo) {
            try {
                dashboardEstado.relacionamentos[tipo] = JSON.parse(salvo);
                atualizarListaRelacionamentos(tipo);
            } catch (e) {
                console.error('Erro ao carregar relacionamentos:', e);
            }
        }
    });
}

function adicionarRelacionamento(tipo) {
    const nome = prompt(`Nome do ${tipo}:`);
    if (!nome) return;
    
    const descricao = prompt(`Descrição/relacionamento (opcional):`);
    const pontos = prompt(`Pontos (opcional, padrão 0):`) || "0";
    
    const relacionamento = {
        id: Date.now(),
        nome: nome,
        descricao: descricao || '',
        pontos: parseInt(pontos) || 0,
        data: new Date().toLocaleDateString('pt-BR')
    };
    
    dashboardEstado.relacionamentos[tipo].push(relacionamento);
    salvarRelacionamentos(tipo);
    atualizarListaRelacionamentos(tipo);
}

function removerRelacionamento(tipo, id) {
    if (confirm('Tem certeza que deseja remover?')) {
        dashboardEstado.relacionamentos[tipo] = 
            dashboardEstado.relacionamentos[tipo].filter(r => r.id !== id);
        salvarRelacionamentos(tipo);
        atualizarListaRelacionamentos(tipo);
    }
}

function salvarRelacionamentos(tipo) {
    localStorage.setItem(
        `dashboard_relacionamentos_${tipo}`,
        JSON.stringify(dashboardEstado.relacionamentos[tipo])
    );
}

function atualizarListaRelacionamentos(tipo) {
    const listaElement = document.getElementById(`lista${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
    if (!listaElement) return;
    
    const relacionamentos = dashboardEstado.relacionamentos[tipo];
    
    if (relacionamentos.length === 0) {
        listaElement.innerHTML = '<div class="relacionamento-vazio">Nenhum ' + tipo + ' adicionado</div>';
        return;
    }
    
    let html = '';
    relacionamentos.forEach(rel => {
        html += `
            <div class="relacionamento-item" data-id="${rel.id}">
                <div class="relacionamento-info">
                    <strong>${rel.nome}</strong>
                    ${rel.pontos !== 0 ? `<span class="relacionamento-pontos">${rel.pontos > 0 ? '+' : ''}${rel.pontos} pts</span>` : ''}
                    ${rel.descricao ? `<div class="relacionamento-descricao">${rel.descricao}</div>` : ''}
                    <small class="relacionamento-data">${rel.data}</small>
                </div>
                <button class="btn-remover-relacionamento" onclick="removerRelacionamento('${tipo}', ${rel.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    listaElement.innerHTML = html;
}

// ===== 11. UTILITÁRIOS (MANTIDO IGUAL) =====
function configurarBotoesUtilitarios() {
    const btnExportar = document.getElementById('btnExportarDashboard');
    const btnImportar = document.getElementById('btnImportarDashboard');
    const btnResetar = document.getElementById('btnResetarDashboard');
    
    if (btnExportar) btnExportar.addEventListener('click', exportarDadosDashboard);
    if (btnImportar) btnImportar.addEventListener('click', importarDadosDashboard);
    if (btnResetar) btnResetar.addEventListener('click', resetarDashboardCompleto);
}

function exportarDadosDashboard() {
    try {
        const dadosExportar = {
            dashboard: {
                estado: dashboardEstado,
                timestamp: new Date().toISOString(),
                versao: '3.0'
            }
        };
        
        const blob = new Blob([JSON.stringify(dadosExportar, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('✅ Dashboard exportado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao exportar:', error);
        alert('Erro ao exportar: ' + error.message);
    }
}

function importarDadosDashboard() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const dados = JSON.parse(e.target.result);
                if (dados.dashboard && dados.dashboard.estado) {
                    dashboardEstado = dados.dashboard.estado;
                    
                    // Garantir que riquezaVantagens existe (para versões antigas)
                    if (!dashboardEstado.pontos.riquezaVantagens) {
                        dashboardEstado.pontos.riquezaVantagens = 0;
                    }
                    
                    atualizarDisplayPontos();
                    atualizarDisplayResumoGastos();
                    atualizarDisplayCaracteristicas();
                    alert('✅ Dashboard importado com sucesso!');
                }
            } catch (error) {
                alert('Erro ao importar: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function resetarDashboardCompleto() {
    if (confirm('Resetar todos os dados do dashboard?')) {
        dashboardEstado = {
            pontos: {
                total: 150,
                gastosAtributos: 0,
                gastosVantagens: 0,
                gastosPericias: 0,
                gastosMagias: 0,
                desvantagensVantagens: 0,
                aparenciaDesvantagens: 0,
                riquezaDesvantagens: 0,
                riquezaVantagens: 0,
                totalDesvantagens: 0,
                limiteDesvantagens: -50,
                saldoDisponivel: 150
            },
            atributos: {
                ST: 10,
                DX: 10,
                IQ: 10,
                HT: 10,
                PV: { atual: 10, max: 10 },
                PF: { atual: 10, max: 10 }
            },
            identificacao: {
                raca: '',
                classe: '',
                nivel: '',
                descricao: ''
            },
            relacionamentos: {
                inimigos: [],
                aliados: [],
                dependentes: []
            },
            caracteristicas: {
                aparencia: 'Comum',
                riqueza: 'Média',
                saldo: '$2.000'
            },
            status: {
                ultimaAtualizacao: new Date().toISOString(),
                integridade: 'OK',
                versao: '3.0'
            }
        };
        
        localStorage.removeItem('dashboard_pontosTotais');
        localStorage.removeItem('dashboard_limiteDesvantagens');
        
        atualizarDisplayPontos();
        atualizarDisplayResumoGastos();
        atualizarDisplayCaracteristicas();
        alert('✅ Dashboard resetado com sucesso!');
    }
}

// ===== 12. INICIALIZAÇÃO COMPLETA (ATUALIZADA) =====
function inicializarDashboard() {
    console.log('🚀 Inicializando Dashboard v3.0 - COM RIQUEZA POSITIVA');
    
    // Configurar sistemas
    configurarSistemaFoto();
    configurarCamposIdentificacao();
    configurarControlePontos();
    configurarSistemaRelacionamentos();
    configurarBotoesUtilitarios();
    
    // Iniciar monitoramento
    monitorarAtributos();
    monitorarOutrasAbas();
    
    // Atualizar displays inicialmente
    setTimeout(() => {
        atualizarDisplayAtributos();
        atualizarDisplayVitalidade();
        atualizarDisplayCaracteristicas();
        atualizarDisplayPontos();
        atualizarDisplayResumoGastos();
        atualizarContadorDescricao();
        
        console.log('✅ Dashboard inicializado - COM sistema de riqueza positiva');
        console.log('🎯 Sistema completo:');
        console.log('   • Riqueza positiva (Confortável, Rico) = Vantagem (custa pontos)');
        console.log('   • Riqueza negativa (Pobre, Batalhador) = Desvantagem (ganha pontos)');
        console.log('   • Card de características atualiza com valor real');
        
        debugDashboardDetalhado();
    }, 500);
}

// ===== 13. INICIALIZAÇÃO AUTOMÁTICA (MANTIDO) =====
document.addEventListener('DOMContentLoaded', function() {
    const dashboardTab = document.getElementById('dashboard');
    if (dashboardTab && dashboardTab.classList.contains('active')) {
        setTimeout(inicializarDashboard, 300);
    }
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'dashboard' && tab.classList.contains('active')) {
                    setTimeout(inicializarDashboard, 300);
                }
            }
        });
    });
    
    document.querySelectorAll('.tab-content').forEach(tab => {
        observer.observe(tab, { attributes: true });
    });
});

// ===== 14. FUNÇÕES DE DEBUG DETALHADO (ATUALIZADO) =====
function debugDashboardDetalhado() {
    console.log('=== 🔍 DEBUG DASHBOARD V3.0 ===');
    console.log('1. Pontos Totais:', dashboardEstado.pontos.total);
    console.log('2. Gastos Atributos:', dashboardEstado.pontos.gastosAtributos);
    console.log('3. Gastos Vantagens:', dashboardEstado.pontos.gastosVantagens);
    console.log('4. Riqueza Vantagens:', dashboardEstado.pontos.riquezaVantagens, '(NOVO)');
    console.log('5. Gastos Perícias:', dashboardEstado.pontos.gastosPericias);
    console.log('6. Gastos Magias:', dashboardEstado.pontos.gastosMagias);
    console.log('7. Desvantagens Vantagens:', dashboardEstado.pontos.desvantagensVantagens);
    console.log('8. Aparência Desvantagens:', dashboardEstado.pontos.aparenciaDesvantagens);
    console.log('9. Riqueza Desvantagens:', dashboardEstado.pontos.riquezaDesvantagens);
    console.log('10. TOTAL Desvantagens:', dashboardEstado.pontos.totalDesvantagens);
    console.log('11. Saldo Disponível:', dashboardEstado.pontos.saldoDisponivel);
    console.log('12. Características:', dashboardEstado.caracteristicas);
    console.log('====================================');
}

function testarSistemaRiqueza() {
    console.log('🧪 TESTE: Sistema de Riqueza...');
    
    const selectRiqueza = document.getElementById('nivelRiqueza');
    if (selectRiqueza) {
        const valor = parseInt(selectRiqueza.value);
        console.log('   Valor atual:', valor);
        console.log('   Tipo:', valor > 0 ? 'VANTAGEM (custa pontos)' : 
                            valor < 0 ? 'DESVANTAGEM (ganha pontos)' : 'NEUTRO');
        console.log('   Renda calculada:', dashboardEstado.caracteristicas.saldo);
    }
}

// ===== 15. EXPORTAÇÃO DE FUNÇÕES GLOBAIS (ATUALIZADO) =====
window.inicializarDashboard = inicializarDashboard;
window.dashboardEstado = dashboardEstado;
window.removerRelacionamento = removerRelacionamento;
window.exportarDadosDashboard = exportarDadosDashboard;
window.importarDadosDashboard = importarDadosDashboard;
window.resetarDashboardCompleto = resetarDashboardCompleto;
window.debugDashboardDetalhado = debugDashboardDetalhado;
window.testarSistemaRiqueza = testarSistemaRiqueza;

window.forcarAtualizacao = function() {
    console.log('🔄 Forçando atualização completa...');
    puxarValoresAtributos();
    puxarDadosVantagensDesvantagens();
    puxarDadosAparencia();
    puxarDadosRiqueza();
    puxarDadosPericias();
    puxarDadosMagias();
    puxarDadosCaracteristicas();
    calcularTotalDesvantagens();
    calcularSaldoDisponivel();
    atualizarDisplayPontos();
    atualizarDisplayResumoGastos();
    atualizarDisplayCaracteristicas();
    debugDashboardDetalhado();
};

// ===== 16. FUNÇÃO PARA TESTAR RIQUEZA =====
window.testarRiqueza = function(nivel) {
    const selectRiqueza = document.getElementById('nivelRiqueza');
    if (selectRiqueza) {
        selectRiqueza.value = nivel;
        selectRiqueza.dispatchEvent(new Event('change'));
        console.log('🧪 Teste de riqueza aplicado:', nivel);
    }
};

// ===== 17. INICIALIZAÇÃO FINAL =====
console.log('📊 Dashboard JS v3.0 - Sistema de riqueza completo carregado');
console.log('✅ Sistema completo funcionando:');
console.log('   • Riqueza positiva = Vantagem (Confortável: +10 pts, Rico: +20 pts)');
console.log('   • Riqueza negativa = Desvantagem (Pobre: -15 pts, Falido: -25 pts)');
console.log('   • Card de características mostra valor real dinâmico');
console.log('   • Sistema integrado com dashboard');

// Auto-inicialização se já carregado
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        const dashboardTab = document.getElementById('dashboard');
        if (dashboardTab && dashboardTab.classList.contains('active')) {
            inicializarDashboard();
        }
    }, 100);
}
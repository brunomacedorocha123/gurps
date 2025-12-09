// ===== DASHBOARD.JS - VERSÃO COMPLETA 100% =====
// Sistema completo com cálculo CORRETO de vantagens/desvantagens

// Estado do dashboard
let dashboardEstado = {
    pontos: {
        total: 150,
        gastosAtributos: 0,
        gastosVantagens: 0,
        gastosPericias: 0,
        gastosMagias: 0,
        pontosDesvantagens: 0, // Pontos POSITIVOS ganhos com desvantagens
        pontosCaracteristicas: 0, // Pontos líquidos de características (+ ou -)
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
        versao: '2.0'
    }
};

// ===== 1. SISTEMA DE FOTO =====
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

// ===== 2. SISTEMA DE IDENTIFICAÇÃO =====
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

// ===== 3. SISTEMA DE PONTOS =====
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

// ===== 4. MONITORAMENTO DE ATRIBUTOS =====
function monitorarAtributos() {
    setInterval(() => {
        puxarValoresAtributos();
    }, 1000);
}

function puxarValoresAtributos() {
    try {
        // Puxar valores dos atributos
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
        
        // Puxar PV e PF
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
        puxarDadosCaracteristicasPontos();
        
        atualizarDisplayResumoGastos();
        atualizarDisplayPontos();
    }, 1500);
    
    configurarMonitoramentoCaracteristicas();
}

// ===== 5.1 MONITORAMENTO DE VANTAGENS/DESVANTAGENS =====
function puxarDadosVantagensDesvantagens() {
    try {
        dashboardEstado.pontos.gastosVantagens = 0;
        dashboardEstado.pontos.pontosDesvantagens = 0;
        
        // VANTAGENS (positivas = GASTA pontos)
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
        
        // DESVANTAGENS (negativas = GANHA pontos)
        const totalDesvantagensElement = document.getElementById('total-desvantagens');
        if (totalDesvantagensElement) {
            const texto = totalDesvantagensElement.textContent;
            const match = texto.match(/([+-]?\d+)/);
            if (match) {
                const valor = parseInt(match[1]) || 0;
                if (valor < 0) {
                    dashboardEstado.pontos.pontosDesvantagens = Math.abs(valor);
                }
            }
        }
        
        calcularSaldoDisponivel();
        
    } catch (error) {
        console.log('Erro ao puxar vantagens/desvantagens:', error);
    }
}

// ===== 5.2 MONITORAMENTO DE PERÍCIAS =====
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

// ===== 5.3 MONITORAMENTO DE MAGIAS =====
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

// ===== 5.4 MONITORAMENTO DE CARACTERÍSTICAS (Nomes) =====
function puxarDadosCaracteristicas() {
    try {
        const nivelAparenciaSelect = document.getElementById('nivelAparencia');
        if (nivelAparenciaSelect) {
            const texto = nivelAparenciaSelect.options[nivelAparenciaSelect.selectedIndex].text;
            const nome = texto.split('[')[0].trim();
            dashboardEstado.caracteristicas.aparencia = nome;
        }
        
        const nivelRiquezaSelect = document.getElementById('nivelRiqueza');
        if (nivelRiquezaSelect) {
            const texto = nivelRiquezaSelect.options[nivelRiquezaSelect.selectedIndex].text;
            const nome = texto.split('[')[0].trim();
            dashboardEstado.caracteristicas.riqueza = nome;
        }
        
        atualizarDisplayCaracteristicas();
        
    } catch (error) {
        console.log('Erro ao puxar características:', error);
    }
}

// ===== 5.5 MONITORAMENTO DE PONTOS DAS CARACTERÍSTICAS =====
function configurarMonitoramentoCaracteristicas() {
    // Monitorar aparência
    document.addEventListener('aparenciaPontosAtualizados', function(e) {
        atualizarPontosCaracteristicas(e.detail);
    });
    
    // Monitorar riqueza
    document.addEventListener('riquezaPontosAtualizados', function(e) {
        atualizarPontosCaracteristicas(e.detail);
    });
    
    // Monitorar outras características
    document.addEventListener('caracteristicaPontosAtualizados', function(e) {
        atualizarPontosCaracteristicas(e.detail);
    });
}

function puxarDadosCaracteristicasPontos() {
    try {
        let pontosCaracteristicas = 0;
        
        // 1. Aparência
        const selectAparencia = document.getElementById('nivelAparencia');
        const badgeAparencia = document.getElementById('pontosAparencia');
        
        if (selectAparencia) {
            const valor = parseInt(selectAparencia.value) || 0;
            pontosCaracteristicas += valor;
        } else if (badgeAparencia) {
            const texto = badgeAparencia.textContent;
            const match = texto.match(/([+-]?\d+)/);
            if (match) {
                pontosCaracteristicas += parseInt(match[1]) || 0;
            }
        }
        
        // 2. Riqueza
        const selectRiqueza = document.getElementById('nivelRiqueza');
        const badgeRiqueza = document.getElementById('pontosRiqueza');
        
        if (selectRiqueza) {
            const valor = parseInt(selectRiqueza.value) || 0;
            pontosCaracteristicas += valor;
        } else if (badgeRiqueza) {
            const texto = badgeRiqueza.textContent;
            const match = texto.match(/([+-]?\d+)/);
            if (match) {
                pontosCaracteristicas += parseInt(match[1]) || 0;
            }
        }
        
        // 3. Outras características podem ser adicionadas aqui
        
        // Atualizar estado
        dashboardEstado.pontos.pontosCaracteristicas = pontosCaracteristicas;
        
        // Aplicar lógica correta: positivos gastam, negativos ganham
        if (pontosCaracteristicas > 0) {
            dashboardEstado.pontos.gastosVantagens += pontosCaracteristicas;
        } else if (pontosCaracteristicas < 0) {
            dashboardEstado.pontos.pontosDesvantagens += Math.abs(pontosCaracteristicas);
        }
        
        calcularSaldoDisponivel();
        
    } catch (error) {
        console.log('Erro ao puxar pontos das características:', error);
    }
}

function atualizarPontosCaracteristicas(detalhes) {
    const pontos = detalhes.pontos || 0;
    const tipo = detalhes.tipo || 'neutro';
    
    if (tipo === 'vantagem' || pontos > 0) {
        dashboardEstado.pontos.gastosVantagens += pontos;
    } else if (tipo === 'desvantagem' || pontos < 0) {
        dashboardEstado.pontos.pontosDesvantagens += Math.abs(pontos);
    }
    
    calcularSaldoDisponivel();
    atualizarDisplayPontos();
    atualizarDisplayResumoGastos();
}

// ===== 6. CÁLCULO CORRETO DO SALDO =====
function calcularSaldoDisponivel() {
    const { 
        total, 
        gastosAtributos, 
        gastosVantagens, 
        gastosPericias, 
        gastosMagias, 
        pontosDesvantagens 
    } = dashboardEstado.pontos;
    
    // Gastos totais (tudo que DEBITA do saldo)
    const gastosTotais = gastosAtributos + gastosVantagens + gastosPericias + gastosMagias;
    
    // Desvantagens ADICIONAM pontos ao saldo
    dashboardEstado.pontos.saldoDisponivel = total - gastosTotais + pontosDesvantagens;
    
    atualizarDisplayPontos();
    atualizarDisplayResumoGastos();
}

// ===== 7. FUNÇÕES DE ATUALIZAÇÃO DE DISPLAY =====
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
    
    if (aparenciaElement) aparenciaElement.textContent = aparencia;
    if (riquezaElement) riquezaElement.textContent = riqueza;
    if (saldoElement) saldoElement.textContent = saldo;
}

function atualizarDisplayPontos() {
    const { 
        total, 
        gastosAtributos, 
        gastosVantagens, 
        gastosPericias, 
        gastosMagias, 
        pontosDesvantagens,
        saldoDisponivel, 
        limiteDesvantagens 
    } = dashboardEstado.pontos;
    
    // Pontos Gastos Dashboard
    const pontosGastosDashboard = gastosAtributos + gastosVantagens + gastosPericias + gastosMagias;
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
            saldoElement.title = 'Você está gastando mais pontos do que tem!';
        } else if (saldoDisponivel < 50) {
            saldoElement.style.color = '#f39c12';
            saldoElement.title = 'Poucos pontos restantes';
        } else {
            saldoElement.style.color = '#3498db';
            saldoElement.title = 'Pontos disponíveis';
        }
    }
    
    // Desvantagens Atuais
    const desvantagensElement = document.getElementById('desvantagensAtuais');
    if (desvantagensElement) {
        desvantagensElement.textContent = pontosDesvantagens;
        
        if (pontosDesvantagens > Math.abs(limiteDesvantagens)) {
            desvantagensElement.style.color = '#e74c3c';
            desvantagensElement.title = 'Limite de desvantagens excedido!';
        } else if (pontosDesvantagens > Math.abs(limiteDesvantagens) * 0.8) {
            desvantagensElement.style.color = '#f39c12';
            desvantagensElement.title = 'Próximo do limite de desvantagens';
        } else {
            desvantagensElement.style.color = '#9b59b6';
            desvantagensElement.title = 'Pontos de desvantagens';
        }
    }
    
    // Atualizar limite exibido
    const limiteElement = document.getElementById('limiteDesvantagens');
    if (limiteElement) {
        limiteElement.title = `Máximo: ${limiteDesvantagens} pontos`;
    }
}

function atualizarDisplayResumoGastos() {
    const { 
        gastosAtributos, 
        gastosVantagens, 
        gastosPericias, 
        gastosMagias, 
        pontosDesvantagens 
    } = dashboardEstado.pontos;
    
    // Cards individuais
    const elementos = {
        gastosAtributos: document.getElementById('gastosAtributos'),
        gastosVantagens: document.getElementById('gastosVantagens'),
        gastosPericias: document.getElementById('gastosPericias'),
        gastosMagias: document.getElementById('gastosMagias'),
        gastosDesvantagens: document.getElementById('gastosDesvantagens'),
        gastosTotal: document.getElementById('gastosTotal')
    };
    
    // Atualizar valores
    if (elementos.gastosAtributos) {
        elementos.gastosAtributos.textContent = gastosAtributos;
        elementos.gastosAtributos.title = `${gastosAtributos} pontos em atributos`;
    }
    
    if (elementos.gastosVantagens) {
        elementos.gastosVantagens.textContent = gastosVantagens;
        elementos.gastosVantagens.title = `${gastosVantagens} pontos em vantagens`;
    }
    
    if (elementos.gastosPericias) {
        elementos.gastosPericias.textContent = gastosPericias;
        elementos.gastosPericias.title = `${gastosPericias} pontos em perícias`;
    }
    
    if (elementos.gastosMagias) {
        elementos.gastosMagias.textContent = gastosMagias;
        elementos.gastosMagias.title = `${gastosMagias} pontos em magias`;
    }
    
    if (elementos.gastosDesvantagens) {
        elementos.gastosDesvantagens.textContent = pontosDesvantagens;
        elementos.gastosDesvantagens.title = `${pontosDesvantagens} pontos ganhos com desvantagens`;
        elementos.gastosDesvantagens.style.color = '#9b59b6';
    }
    
    // Total Gastos Líquidos
    const gastosTotais = gastosAtributos + gastosVantagens + gastosPericias + gastosMagias;
    const gastosLiquidos = gastosTotais - pontosDesvantagens; // Desvantagens reduzem o total
    
    if (elementos.gastosTotal) {
        elementos.gastosTotal.textContent = gastosLiquidos;
        
        if (gastosLiquidos < 0) {
            elementos.gastosTotal.style.color = '#9b59b6';
            elementos.gastosTotal.title = 'Mais desvantagens que gastos';
        } else if (gastosLiquidos > dashboardEstado.pontos.total) {
            elementos.gastosTotal.style.color = '#e74c3c';
            elementos.gastosTotal.title = 'Gastou mais pontos do que tem disponível!';
        } else if (gastosLiquidos > dashboardEstado.pontos.total * 0.8) {
            elementos.gastosTotal.style.color = '#f39c12';
            elementos.gastosTotal.title = 'Utilizando mais de 80% dos pontos';
        } else if (gastosLiquidos > dashboardEstado.pontos.total * 0.5) {
            elementos.gastosTotal.style.color = '#ffd700';
            elementos.gastosTotal.title = 'Utilizando mais de 50% dos pontos';
        } else {
            elementos.gastosTotal.style.color = '#27ae60';
            elementos.gastosTotal.title = 'Pontos gastos dentro do limite';
        }
    }
}

// ===== 8. SISTEMA DE RELACIONAMENTOS =====
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
    
    // Se tiver pontos, atualizar dashboard
    if (relacionamento.pontos !== 0) {
        if (tipo === 'inimigos' && relacionamento.pontos < 0) {
            // Inimigos podem dar pontos (desvantagens)
            dashboardEstado.pontos.pontosDesvantagens += Math.abs(relacionamento.pontos);
        } else if (tipo === 'aliados' && relacionamento.pontos > 0) {
            // Aliados podem custar pontos (vantagens)
            dashboardEstado.pontos.gastosVantagens += relacionamento.pontos;
        }
        calcularSaldoDisponivel();
    }
}

function removerRelacionamento(tipo, id) {
    if (confirm('Tem certeza que deseja remover este relacionamento?')) {
        // Encontrar o relacionamento para ver se tem pontos
        const relacionamento = dashboardEstado.relacionamentos[tipo].find(r => r.id === id);
        
        // Remover pontos se houver
        if (relacionamento && relacionamento.pontos !== 0) {
            if (tipo === 'inimigos' && relacionamento.pontos < 0) {
                dashboardEstado.pontos.pontosDesvantagens -= Math.abs(relacionamento.pontos);
            } else if (tipo === 'aliados' && relacionamento.pontos > 0) {
                dashboardEstado.pontos.gastosVantagens -= relacionamento.pontos;
            }
        }
        
        // Remover da lista
        dashboardEstado.relacionamentos[tipo] = 
            dashboardEstado.relacionamentos[tipo].filter(r => r.id !== id);
        
        salvarRelacionamentos(tipo);
        atualizarListaRelacionamentos(tipo);
        calcularSaldoDisponivel();
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
        const iconePontos = rel.pontos > 0 ? 'fa-plus-circle' : rel.pontos < 0 ? 'fa-minus-circle' : 'fa-circle';
        const corPontos = rel.pontos > 0 ? '#27ae60' : rel.pontos < 0 ? '#e74c3c' : '#95a5a6';
        
        html += `
            <div class="relacionamento-item" data-id="${rel.id}">
                <div class="relacionamento-info">
                    <strong>${rel.nome}</strong>
                    ${rel.pontos !== 0 ? `
                        <span class="relacionamento-pontos" style="color: ${corPontos}">
                            <i class="fas ${iconePontos}"></i>
                            ${rel.pontos > 0 ? '+' : ''}${rel.pontos} pts
                        </span>
                    ` : ''}
                    ${rel.descricao ? `<div class="relacionamento-descricao">${rel.descricao}</div>` : ''}
                    <small class="relacionamento-data">
                        <i class="far fa-calendar-alt"></i> ${rel.data}
                    </small>
                </div>
                <button class="btn-remover-relacionamento" 
                        onclick="removerRelacionamento('${tipo}', ${rel.id})"
                        title="Remover ${tipo}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    listaElement.innerHTML = html;
}

// ===== 9. SISTEMA DE EXPORTAÇÃO E IMPORTACÃO =====
function configurarBotoesUtilitarios() {
    const btnExportar = document.getElementById('btnExportarDashboard');
    const btnImportar = document.getElementById('btnImportarDashboard');
    const btnResetar = document.getElementById('btnResetarDashboard');
    
    if (btnExportar) {
        btnExportar.addEventListener('click', exportarDadosDashboard);
    }
    
    if (btnImportar) {
        btnImportar.addEventListener('click', importarDadosDashboard);
    }
    
    if (btnResetar) {
        btnResetar.addEventListener('click', resetarDashboardCompleto);
    }
}

function exportarDadosDashboard() {
    try {
        // Preparar dados para exportação
        const dadosExportar = {
            dashboard: {
                estado: dashboardEstado,
                timestamp: new Date().toISOString(),
                versao: '2.0',
                exportadoEm: new Date().toLocaleString('pt-BR')
            },
            personagem: {
                identificacao: {
                    raca: document.getElementById('racaPersonagem')?.value || '',
                    classe: document.getElementById('classePersonagem')?.value || '',
                    nivel: document.getElementById('nivelPersonagem')?.value || '',
                    descricao: document.getElementById('descricaoPersonagem')?.value || ''
                }
            }
        };
        
        // Criar blob e link para download
        const blob = new Blob([JSON.stringify(dadosExportar, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `personagem-dashboard-${new Date().toISOString().split('T')[0]}.json`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Feedback visual
        const originalText = btnExportar.innerHTML;
        btnExportar.innerHTML = '<i class="fas fa-check"></i> Exportado!';
        btnExportar.style.background = '#27ae60';
        
        setTimeout(() => {
            btnExportar.innerHTML = originalText;
            btnExportar.style.background = '';
        }, 2000);
        
        console.log('✅ Dados exportados com sucesso!', dadosExportar);
        
    } catch (error) {
        console.error('❌ Erro ao exportar dados:', error);
        alert('Erro ao exportar dados: ' + error.message);
    }
}

function importarDadosDashboard() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const dados = JSON.parse(e.target.result);
                
                if (!dados.dashboard || !dados.dashboard.estado) {
                    throw new Error('Arquivo inválido: estrutura de dados não encontrada');
                }
                
                // Confirmar importação
                if (!confirm(`Importar dados do personagem?\nExportado em: ${dados.dashboard.exportadoEm || 'Data desconhecida'}`)) {
                    return;
                }
                
                // Restaurar estado do dashboard
                dashboardEstado = dados.dashboard.estado;
                
                // Restaurar identificação
                if (dados.personagem && dados.personagem.identificacao) {
                    const id = dados.personagem.identificacao;
                    const racaInput = document.getElementById('racaPersonagem');
                    const classeInput = document.getElementById('classePersonagem');
                    const nivelInput = document.getElementById('nivelPersonagem');
                    const descricaoInput = document.getElementById('descricaoPersonagem');
                    
                    if (racaInput) racaInput.value = id.raca || '';
                    if (classeInput) classeInput.value = id.classe || '';
                    if (nivelInput) nivelInput.value = id.nivel || '';
                    if (descricaoInput) descricaoInput.value = id.descricao || '';
                    
                    // Salvar no localStorage
                    localStorage.setItem('personagem_racaPersonagem', id.raca || '');
                    localStorage.setItem('personagem_classePersonagem', id.classe || '');
                    localStorage.setItem('personagem_nivelPersonagem', id.nivel || '');
                    localStorage.setItem('personagem_descricaoPersonagem', id.descricao || '');
                }
                
                // Atualizar localStorage
                localStorage.setItem('dashboard_pontosTotais', dashboardEstado.pontos.total);
                localStorage.setItem('dashboard_limiteDesvantagens', dashboardEstado.pontos.limiteDesvantagens);
                
                // Atualizar relacionamentos no localStorage
                ['inimigos', 'aliados', 'dependentes'].forEach(tipo => {
                    if (dashboardEstado.relacionamentos[tipo].length > 0) {
                        localStorage.setItem(
                            `dashboard_relacionamentos_${tipo}`,
                            JSON.stringify(dashboardEstado.relacionamentos[tipo])
                        );
                    }
                });
                
                // Atualizar todos os displays
                atualizarDisplayAtributos();
                atualizarDisplayVitalidade();
                atualizarDisplayCaracteristicas();
                atualizarDisplayPontos();
                atualizarDisplayResumoGastos();
                atualizarContadorDescricao();
                
                // Atualizar inputs
                const pontosTotaisInput = document.getElementById('pontosTotaisDashboard');
                const limiteDesvantagensInput = document.getElementById('limiteDesvantagens');
                
                if (pontosTotaisInput) pontosTotaisInput.value = dashboardEstado.pontos.total;
                if (limiteDesvantagensInput) limiteDesvantagensInput.value = dashboardEstado.pontos.limiteDesvantagens;
                
                // Atualizar relacionamentos visualmente
                ['inimigos', 'aliados', 'dependentes'].forEach(tipo => {
                    atualizarListaRelacionamentos(tipo);
                });
                
                // Feedback
                alert(`✅ Dados importados com sucesso!\n\nPersonagem: ${dados.personagem?.identificacao?.raca || 'Desconhecido'}\nPontos totais: ${dashboardEstado.pontos.total}\nSaldo: ${dashboardEstado.pontos.saldoDisponivel}`);
                
                console.log('✅ Dados importados com sucesso!', dashboardEstado);
                
            } catch (error) {
                console.error('❌ Erro ao importar dados:', error);
                alert('Erro ao importar dados: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
}

function resetarDashboardCompleto() {
    if (!confirm('⚠️ ATENÇÃO!\n\nIsso irá resetar TODOS os dados do dashboard:\n- Pontos e gastos\n- Relacionamentos\n- Identificação\n\nEsta ação NÃO pode ser desfeita.\n\nContinuar?')) {
        return;
    }
    
    // Resetar estado
    dashboardEstado = {
        pontos: {
            total: 150,
            gastosAtributos: 0,
            gastosVantagens: 0,
            gastosPericias: 0,
            gastosMagias: 0,
            pontosDesvantagens: 0,
            pontosCaracteristicas: 0,
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
            versao: '2.0'
        }
    };
    
    // Limpar campos de identificação
    const campos = ['racaPersonagem', 'classePersonagem', 'nivelPersonagem', 'descricaoPersonagem'];
    campos.forEach(campoId => {
        const campo = document.getElementById(campoId);
        if (campo) {
            campo.value = '';
            localStorage.removeItem(`personagem_${campoId}`);
        }
    });
    
    // Limpar inputs de pontos
    const pontosTotaisInput = document.getElementById('pontosTotaisDashboard');
    const limiteDesvantagensInput = document.getElementById('limiteDesvantagens');
    
    if (pontosTotaisInput) {
        pontosTotaisInput.value = 150;
        localStorage.setItem('dashboard_pontosTotais', '150');
    }
    
    if (limiteDesvantagensInput) {
        limiteDesvantagensInput.value = -50;
        localStorage.setItem('dashboard_limiteDesvantagens', '-50');
    }
    
    // Limpar relacionamentos do localStorage
    ['inimigos', 'aliados', 'dependentes'].forEach(tipo => {
        localStorage.removeItem(`dashboard_relacionamentos_${tipo}`);
    });
    
    // Atualizar todos os displays
    atualizarDisplayAtributos();
    atualizarDisplayVitalidade();
    atualizarDisplayCaracteristicas();
    atualizarDisplayPontos();
    atualizarDisplayResumoGastos();
    atualizarContadorDescricao();
    
    // Atualizar listas de relacionamentos
    ['inimigos', 'aliados', 'dependentes'].forEach(tipo => {
        atualizarListaRelacionamentos(tipo);
    });
    
    // Feedback
    alert('✅ Dashboard resetado com sucesso!\n\nTodos os dados foram reinicializados.');
    
    console.log('🔄 Dashboard resetado completamente');
}

// ===== 10. FUNÇÕES DE UTILIDADE =====
function salvarEstadoDashboard() {
    try {
        const estadoParaSalvar = {
            dashboard: dashboardEstado,
            salvadoEm: new Date().toISOString()
        };
        localStorage.setItem('dashboard_estado_completo', JSON.stringify(estadoParaSalvar));
        console.log('💾 Estado do dashboard salvo');
    } catch (error) {
        console.error('Erro ao salvar estado:', error);
    }
}

function carregarEstadoDashboard() {
    try {
        const estadoSalvo = localStorage.getItem('dashboard_estado_completo');
        if (estadoSalvo) {
            const dados = JSON.parse(estadoSalvo);
            if (dados.dashboard) {
                dashboardEstado = dados.dashboard;
                console.log('📂 Estado do dashboard carregado');
                return true;
            }
        }
    } catch (error) {
        console.error('Erro ao carregar estado:', error);
    }
    return false;
}

function criarBackupAutomatico() {
    // Salvar backup a cada 5 minutos
    setInterval(() => {
        if (dashboardEstado.status.integridade === 'OK') {
            salvarEstadoDashboard();
        }
    }, 5 * 60 * 1000); // 5 minutos
}

// ===== 11. INICIALIZAÇÃO COMPLETA =====
function inicializarDashboard() {
    console.log('🚀 Inicializando Dashboard Completo v2.0');
    
    // Configurar sistemas
    configurarSistemaFoto();
    configurarCamposIdentificacao();
    configurarControlePontos();
    configurarSistemaRelacionamentos();
    configurarBotoesUtilitarios();
    
    // Tentar carregar estado salvo
    if (carregarEstadoDashboard()) {
        console.log('✅ Estado anterior carregado');
    }
    
    // Iniciar monitoramento
    monitorarAtributos();
    monitorarOutrasAbas();
    
    // Iniciar backup automático
    criarBackupAutomatico();
    
    // Atualizar displays inicialmente
    setTimeout(() => {
        atualizarDisplayAtributos();
        atualizarDisplayVitalidade();
        atualizarDisplayCaracteristicas();
        atualizarDisplayPontos();
        atualizarDisplayResumoGastos();
        atualizarContadorDescricao();
        
        // Atualizar status
        dashboardEstado.status.ultimaAtualizacao = new Date().toISOString();
        dashboardEstado.status.integridade = 'OK';
        
        console.log('✅ Dashboard 100% inicializado e funcional');
        console.log('📊 Sistema de pontos corrigido:');
        console.log('   • Vantagens DEBITAM do saldo');
        console.log('   • Desvantagens ADICIONAM ao saldo');
        console.log('   • Características seguem a mesma lógica');
        
        // Log inicial para debug
        debugPontos();
    }, 500);
}

// ===== 12. INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar quando a aba dashboard ficar ativa
    const dashboardTab = document.getElementById('dashboard');
    
    if (dashboardTab && dashboardTab.classList.contains('active')) {
        setTimeout(inicializarDashboard, 300);
    }
    
    // Observar mudanças nas abas
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
    
    // Observar todas as abas
    document.querySelectorAll('.tab-content').forEach(tab => {
        observer.observe(tab, { attributes: true });
    });
});

// ===== 13. FUNÇÕES GLOBAIS PARA DEBUG =====
function debugPontos() {
    console.log('=== 🧮 DEBUG PONTOS ===');
    console.log(`Total: ${dashboardEstado.pontos.total} pts`);
    console.log(`Gastos Atributos: ${dashboardEstado.pontos.gastosAtributos} pts`);
    console.log(`Gastos Vantagens: ${dashboardEstado.pontos.gastosVantagens} pts`);
    console.log(`Gastos Perícias: ${dashboardEstado.pontos.gastosPericias} pts`);
    console.log(`Gastos Magias: ${dashboardEstado.pontos.gastosMagias} pts`);
    console.log(`Pontos Desvantagens: ${dashboardEstado.pontos.pontosDesvantagens} pts (GANHOS)`);
    console.log(`Características: ${dashboardEstado.pontos.pontosCaracteristicas} pts`);
    console.log(`Cálculo: ${dashboardEstado.pontos.total} - (${dashboardEstado.pontos.gastosAtributos} + ${dashboardEstado.pontos.gastosVantagens} + ${dashboardEstado.pontos.gastosPericias} + ${dashboardEstado.pontos.gastosMagias}) + ${dashboardEstado.pontos.pontosDesvantagens}`);
    console.log(`Saldo: ${dashboardEstado.pontos.saldoDisponivel} pts`);
    console.log('========================');
}

function verificarIntegridade() {
    const problemas = [];
    
    // Verificar se saldo faz sentido
    const saldoCalculado = dashboardEstado.pontos.total - 
                          (dashboardEstado.pontos.gastosAtributos + 
                           dashboardEstado.pontos.gastosVantagens + 
                           dashboardEstado.pontos.gastosPericias + 
                           dashboardEstado.pontos.gastosMagias) + 
                           dashboardEstado.pontos.pontosDesvantagens;
    
    if (Math.abs(saldoCalculado - dashboardEstado.pontos.saldoDisponivel) > 1) {
        problemas.push(`Saldo inconsistente: ${dashboardEstado.pontos.saldoDisponivel} (deveria ser ${saldoCalculado})`);
    }
    
    // Verificar limite de desvantagens
    if (dashboardEstado.pontos.pontosDesvantagens > Math.abs(dashboardEstado.pontos.limiteDesvantagens)) {
        problemas.push(`Limite de desvantagens excedido: ${dashboardEstado.pontos.pontosDesvantagens}/${Math.abs(dashboardEstado.pontos.limiteDesvantagens)}`);
    }
    
    // Verificar saldo negativo
    if (dashboardEstado.pontos.saldoDisponivel < 0) {
        problemas.push(`Saldo negativo: ${dashboardEstado.pontos.saldoDisponivel}`);
    }
    
    if (problemas.length === 0) {
        console.log('✅ Integridade OK');
        dashboardEstado.status.integridade = 'OK';
        return true;
    } else {
        console.warn('⚠️ Problemas encontrados:', problemas);
        dashboardEstado.status.integridade = 'COM PROBLEMAS';
        return false;
    }
}

// ===== 14. EXPORTAÇÃO DE FUNÇÕES GLOBAIS =====
window.inicializarDashboard = inicializarDashboard;
window.dashboardEstado = dashboardEstado;
window.removerRelacionamento = removerRelacionamento;
window.exportarDadosDashboard = exportarDadosDashboard;
window.importarDadosDashboard = importarDadosDashboard;
window.resetarDashboardCompleto = resetarDashboardCompleto;
window.debugPontos = debugPontos;
window.verificarIntegridade = verificarIntegridade;
window.atualizarDashboard = function() {
    calcularSaldoDisponivel();
    atualizarDisplayPontos();
    atualizarDisplayResumoGastos();
    verificarIntegridade();
};

// ===== 15. EVENTOS PERSONALIZADOS =====
// Criar eventos para comunicação entre sistemas
function dispararEventoDashboardAtualizado() {
    const evento = new CustomEvent('dashboardAtualizado', {
        detail: {
            estado: dashboardEstado,
            timestamp: new Date().toISOString()
        }
    });
    document.dispatchEvent(evento);
}

// Ouvir eventos de outras abas
document.addEventListener('vantagensDesvantagensAtualizadas', function(e) {
    if (e.detail && e.detail.vantagens !== undefined) {
        dashboardEstado.pontos.gastosVantagens = e.detail.vantagens;
    }
    if (e.detail && e.detail.desvantagens !== undefined) {
        dashboardEstado.pontos.pontosDesvantagens = e.detail.desvantagens;
    }
    calcularSaldoDisponivel();
});

document.addEventListener('periciasAtualizadas', function(e) {
    if (e.detail && e.detail.pontos !== undefined) {
        dashboardEstado.pontos.gastosPericias = e.detail.pontos;
        calcularSaldoDisponivel();
    }
});

document.addEventListener('magiasAtualizadas', function(e) {
    if (e.detail && e.detail.pontos !== undefined) {
        dashboardEstado.pontos.gastosMagias = e.detail.pontos;
        calcularSaldoDisponivel();
    }
});

// ===== 16. INICIALIZAÇÃO FINAL =====
console.log('📊 Dashboard JS v2.0 - Sistema completo carregado');
console.log('🔧 Recursos incluídos:');
console.log('   • Sistema de foto do personagem');
console.log('   • Identificação completa');
console.log('   • Controle de pontos com lógica corrigida');
console.log('   • Monitoramento de todas as abas');
console.log('   • Sistema de relacionamentos');
console.log('   • Exportação/Importação JSON');
console.log('   • Backup automático');
console.log('   • Debug e verificação de integridade');
console.log('   • Eventos personalizados para integração');

// Inicialização automática se a página já carregou
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        const dashboardTab = document.getElementById('dashboard');
        if (dashboardTab && dashboardTab.classList.contains('active')) {
            inicializarDashboard();
        }
    }, 100);
}
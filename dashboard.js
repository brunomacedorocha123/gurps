// ===== DASHBOARD.JS - VERSÃO COMPLETA 100% =====
// Sistema completo com monitoramento de todas as características

// Estado do dashboard
let dashboardEstado = {
    pontos: {
        total: 150,
        gastosAtributos: 0,
        gastosVantagens: 0,
        gastosPericias: 0,
        gastosMagias: 0,
        desvantagens: 0, // Pontos de desvantagens (valor absoluto)
        caracteristicas: 0, // Pontos de características (pode ser + ou -)
        limiteDesvantagens: -50,
        saldoDisponivel: 150 // Calculado: total - (gastosAtributos + vantagens + pericias + magias) + desvantagens + caracteristicas
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
        integridade: 'OK'
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
    // Verificar periodicamente
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
            
            // Calcular custo dos atributos
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
    // Custo padrão GURPS
    const custoST = (ST - 10) * 10;
    const custoDX = (DX - 10) * 20;
    const custoIQ = (IQ - 10) * 20;
    const custoHT = (HT - 10) * 10;
    
    const totalAtributos = custoST + custoDX + custoIQ + custoHT;
    dashboardEstado.pontos.gastosAtributos = totalAtributos;
    
    // Recalcular saldo
    calcularSaldoDisponivel();
}

// ===== 5. MONITORAMENTO DE OUTRAS ABAS =====
function monitorarOutrasAbas() {
    // Iniciar monitoramento de todas as abas
    setInterval(() => {
        puxarDadosVantagens();
        puxarDadosPericias();
        puxarDadosMagias();
        puxarDadosCaracteristicas();
        puxarDadosCaracteristicasPontos(); // Novo: monitorar pontos das características
        
        atualizarDisplayResumoGastos();
        atualizarDisplayPontos();
    }, 1500);
    
    // Configurar eventos para características
    configurarMonitoramentoCaracteristicas();
}

// ===== 5.1 MONITORAMENTO DE VANTAGENS/DESVANTAGENS =====
function puxarDadosVantagens() {
    try {
        // Zerar valores para recalcular
        dashboardEstado.pontos.gastosVantagens = 0;
        dashboardEstado.pontos.desvantagens = 0;
        
        // Buscar vantagens (valores positivos)
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
        
        // Buscar desvantagens (valores negativos que viram pontos POSITIVOS)
        const totalDesvantagensElement = document.getElementById('total-desvantagens');
        if (totalDesvantagensElement) {
            const texto = totalDesvantagensElement.textContent;
            const match = texto.match(/([+-]?\d+)/);
            if (match) {
                const valorDesvantagens = parseInt(match[1]) || 0;
                // Convertemos para positivo (ex: -20 vira 20)
                dashboardEstado.pontos.desvantagens = Math.abs(valorDesvantagens);
            }
        }
        
        calcularSaldoDisponivel();
        
    } catch (error) {
        console.log('Erro ao puxar vantagens:', error);
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
    
    // Monitorar riqueza (se tiver evento similar)
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
        let totalCaracteristicas = 0;
        
        // 1. Aparência
        const selectAparencia = document.getElementById('nivelAparencia');
        const badgeAparencia = document.getElementById('pontosAparencia');
        
        if (selectAparencia) {
            const valor = parseInt(selectAparencia.value) || 0;
            totalCaracteristicas += valor;
        } else if (badgeAparencia) {
            const texto = badgeAparencia.textContent;
            const match = texto.match(/([+-]?\d+)/);
            if (match) {
                totalCaracteristicas += parseInt(match[1]) || 0;
            }
        }
        
        // 2. Riqueza
        const selectRiqueza = document.getElementById('nivelRiqueza');
        const badgeRiqueza = document.getElementById('pontosRiqueza');
        
        if (selectRiqueza) {
            const valor = parseInt(selectRiqueza.value) || 0;
            totalCaracteristicas += valor;
        } else if (badgeRiqueza) {
            const texto = badgeRiqueza.textContent;
            const match = texto.match(/([+-]?\d+)/);
            if (match) {
                totalCaracteristicas += parseInt(match[1]) || 0;
            }
        }
        
        // Atualizar estado
        dashboardEstado.pontos.caracteristicas = totalCaracteristicas;
        calcularSaldoDisponivel();
        
    } catch (error) {
        console.log('Erro ao puxar pontos das características:', error);
    }
}

function atualizarPontosCaracteristicas(detalhes) {
    // Lógica para atualizar pontos baseada no tipo
    if (detalhes.tipo === 'vantagem' && detalhes.pontos > 0) {
        dashboardEstado.pontos.gastosVantagens += detalhes.pontos;
    } else if (detalhes.tipo === 'desvantagem' && detalhes.pontos < 0) {
        dashboardEstado.pontos.desvantagens += Math.abs(detalhes.pontos);
    }
    
    // Também atualizar o total de características
    dashboardEstado.pontos.caracteristicas += detalhes.pontos;
    
    calcularSaldoDisponivel();
    atualizarDisplayPontos();
    atualizarDisplayResumoGastos();
}

// ===== 6. CÁLCULO COMPLETO DO SALDO =====
function calcularSaldoDisponivel() {
    // Fórmula: Saldo = Total - (Gastos em Atributos, Vantagens, Perícias, Magias) + Desvantagens + Características
    
    const { 
        total, 
        gastosAtributos, 
        gastosVantagens, 
        gastosPericias, 
        gastosMagias, 
        desvantagens, 
        caracteristicas 
    } = dashboardEstado.pontos;
    
    // Gastos totais (positivos)
    const gastosTotais = gastosAtributos + gastosVantagens + gastosPericias + gastosMagias;
    
    // Desvantagens ADICIONAM ao saldo (são pontos ganhos)
    // Características podem ser positivas ou negativas
    const ajustes = desvantagens + caracteristicas;
    
    dashboardEstado.pontos.saldoDisponivel = total - gastosTotais + ajustes;
    
    // Atualizar displays
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
    
    document.getElementById('statusPV').textContent = `${PV.atual}/${PV.max}`;
    document.getElementById('statusPF').textContent = `${PF.atual}/${PF.max}`;
    
    const barPV = document.querySelector('.bar-pv');
    const barPF = document.querySelector('.bar-pf');
    
    if (barPV) {
        const percentPV = (PV.atual / PV.max) * 100;
        barPV.style.width = `${percentPV}%`;
    }
    
    if (barPF) {
        const percentPF = (PF.atual / PF.max) * 100;
        barPF.style.width = `${percentPF}%`;
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
        desvantagens, 
        caracteristicas,
        saldoDisponivel, 
        limiteDesvantagens 
    } = dashboardEstado.pontos;
    
    // Pontos Gastos Dashboard (total de gastos POSITIVOS)
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
        } else if (saldoDisponivel < 50) {
            saldoElement.style.color = '#f39c12';
        } else {
            saldoElement.style.color = '#3498db';
        }
    }
    
    // Desvantagens Atuais (valor absoluto para display)
    const desvantagensElement = document.getElementById('desvantagensAtuais');
    if (desvantagensElement) {
        desvantagensElement.textContent = desvantagens;
        
        if (desvantagens > Math.abs(limiteDesvantagens)) {
            desvantagensElement.style.color = '#e74c3c';
        } else {
            desvantagensElement.style.color = '#9b59b6';
        }
    }
    
    // Características
    const caracteristicasElement = document.getElementById('caracteristicasDashboard');
    if (caracteristicasElement) {
        caracteristicasElement.textContent = caracteristicas >= 0 ? `+${caracteristicas}` : caracteristicas;
        
        if (caracteristicas > 0) {
            caracteristicasElement.style.color = '#27ae60';
        } else if (caracteristicas < 0) {
            caracteristicasElement.style.color = '#e74c3c';
        } else {
            caracteristicasElement.style.color = '#95a5a6';
        }
    }
}

function atualizarDisplayResumoGastos() {
    const { 
        gastosAtributos, 
        gastosVantagens, 
        gastosPericias, 
        gastosMagias, 
        desvantagens, 
        caracteristicas,
        saldoDisponivel,
        total 
    } = dashboardEstado.pontos;
    
    // Cards individuais
    const elementos = {
        gastosAtributos: document.getElementById('gastosAtributos'),
        gastosVantagens: document.getElementById('gastosVantagens'),
        gastosPericias: document.getElementById('gastosPericias'),
        gastosMagias: document.getElementById('gastosMagias'),
        gastosDesvantagens: document.getElementById('gastosDesvantagens'),
        gastosCaracteristicas: document.getElementById('gastosCaracteristicas'),
        gastosTotal: document.getElementById('gastosTotal')
    };
    
    if (elementos.gastosAtributos) elementos.gastosAtributos.textContent = gastosAtributos;
    if (elementos.gastosVantagens) elementos.gastosVantagens.textContent = gastosVantagens;
    if (elementos.gastosPericias) elementos.gastosPericias.textContent = gastosPericias;
    if (elementos.gastosMagias) elementos.gastosMagias.textContent = gastosMagias;
    if (elementos.gastosDesvantagens) elementos.gastosDesvantagens.textContent = desvantagens;
    if (elementos.gastosCaracteristicas) {
        elementos.gastosCaracteristicas.textContent = caracteristicas;
        if (caracteristicas > 0) {
            elementos.gastosCaracteristicas.style.color = '#27ae60';
        } else if (caracteristicas < 0) {
            elementos.gastosCaracteristicas.style.color = '#e74c3c';
        }
    }
    
    // Total Gastos
    const gastosPositivos = gastosAtributos + gastosVantagens + gastosPericias + gastosMagias;
    const ajustesNegativos = desvantagens + (caracteristicas < 0 ? Math.abs(caracteristicas) : 0);
    const gastosLiquidos = gastosPositivos - ajustesNegativos + (caracteristicas > 0 ? caracteristicas : 0);
    
    if (elementos.gastosTotal) {
        elementos.gastosTotal.textContent = gastosLiquidos;
        
        if (gastosLiquidos > total) {
            elementos.gastosTotal.style.color = '#e74c3c';
        } else if (gastosLiquidos > total * 0.8) {
            elementos.gastosTotal.style.color = '#f39c12';
        } else {
            elementos.gastosTotal.style.color = '#ffd700';
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
    
    const descricao = prompt(`Descrição/relacionamento:`);
    const pontos = prompt(`Pontos (opcional, padrão 0):`) || "0";
    
    const relacionamento = {
        id: Date.now(),
        nome: nome,
        descricao: descricao || '',
        pontos: parseInt(pontos) || 0,
        data: new Date().toLocaleDateString()
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

// ===== 9. EXPORTAÇÃO E SALVAMENTO =====
function exportarDadosDashboard() {
    const dadosExportar = {
        dashboard: {
            estado: dashboardEstado,
            timestamp: new Date().toISOString(),
            versao: '1.0'
        }
    };
    
    const blob = new Blob([JSON.stringify(dadosExportar, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-personagem-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
                    
                    // Atualizar localStorage
                    localStorage.setItem('dashboard_pontosTotais', dashboardEstado.pontos.total);
                    localStorage.setItem('dashboard_limiteDesvantagens', dashboardEstado.pontos.limiteDesvantagens);
                    
                    // Atualizar displays
                    atualizarDisplayAtributos();
                    atualizarDisplayVitalidade();
                    atualizarDisplayCaracteristicas();
                    atualizarDisplayPontos();
                    atualizarDisplayResumoGastos();
                    
                    alert('Dados do dashboard importados com sucesso!');
                }
            } catch (error) {
                alert('Erro ao importar dados: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// ===== 10. RESET E LIMPEZA =====
function resetarDashboard() {
    if (confirm('Tem certeza que deseja resetar todos os dados do dashboard? Esta ação não pode ser desfeita.')) {
        dashboardEstado = {
            pontos: {
                total: 150,
                gastosAtributos: 0,
                gastosVantagens: 0,
                gastosPericias: 0,
                gastosMagias: 0,
                desvantagens: 0,
                caracteristicas: 0,
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
                integridade: 'OK'
            }
        };
        
        // Limpar localStorage relacionado ao dashboard
        localStorage.removeItem('dashboard_pontosTotais');
        localStorage.removeItem('dashboard_limiteDesvantagens');
        localStorage.removeItem('dashboard_relacionamentos_inimigos');
        localStorage.removeItem('dashboard_relacionamentos_aliados');
        localStorage.removeItem('dashboard_relacionamentos_dependentes');
        
        // Atualizar displays
        atualizarDisplayAtributos();
        atualizarDisplayVitalidade();
        atualizarDisplayCaracteristicas();
        atualizarDisplayPontos();
        atualizarDisplayResumoGastos();
        
        // Atualizar inputs
        const pontosTotaisInput = document.getElementById('pontosTotaisDashboard');
        const limiteDesvantagensInput = document.getElementById('limiteDesvantagens');
        
        if (pontosTotaisInput) pontosTotaisInput.value = 150;
        if (limiteDesvantagensInput) limiteDesvantagensInput.value = -50;
        
        alert('Dashboard resetado com sucesso!');
    }
}

// ===== 11. INICIALIZAÇÃO COMPLETA =====
function inicializarDashboard() {
    console.log('🚀 Inicializando Dashboard Completo 100%');
    
    // Configurar sistemas
    configurarSistemaFoto();
    configurarCamposIdentificacao();
    configurarControlePontos();
    configurarSistemaRelacionamentos();
    
    // Configurar botões de exportação/importação
    const btnExportar = document.getElementById('btnExportarDashboard');
    const btnImportar = document.getElementById('btnImportarDashboard');
    const btnResetar = document.getElementById('btnResetarDashboard');
    
    if (btnExportar) btnExportar.addEventListener('click', exportarDadosDashboard);
    if (btnImportar) btnImportar.addEventListener('click', importarDadosDashboard);
    if (btnResetar) btnResetar.addEventListener('click', resetarDashboard);
    
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
        
        // Atualizar status
        dashboardEstado.status.ultimaAtualizacao = new Date().toISOString();
        dashboardEstado.status.integridade = 'OK';
        
        console.log('✅ Dashboard 100% inicializado e funcional');
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

// ===== 13. EXPORTAÇÃO DE FUNÇÕES GLOBAIS =====
window.inicializarDashboard = inicializarDashboard;
window.dashboardEstado = dashboardEstado;
window.removerRelacionamento = removerRelacionamento;
window.exportarDadosDashboard = exportarDadosDashboard;
window.importarDadosDashboard = importarDadosDashboard;
window.resetarDashboard = resetarDashboard;
window.atualizarDashboard = function() {
    calcularSaldoDisponivel();
    atualizarDisplayPontos();
    atualizarDisplayResumoGastos();
};

// ===== 14. DEBUG E LOGS =====
function debugDashboard() {
    console.log('=== DEBUG DASHBOARD ===');
    console.log('Estado atual:', dashboardEstado);
    console.log('Pontos total:', dashboardEstado.pontos.total);
    console.log('Gastos Atributos:', dashboardEstado.pontos.gastosAtributos);
    console.log('Gastos Vantagens:', dashboardEstado.pontos.gastosVantagens);
    console.log('Gastos Perícias:', dashboardEstado.pontos.gastosPericias);
    console.log('Gastos Magias:', dashboardEstado.pontos.gastosMagias);
    console.log('Desvantagens:', dashboardEstado.pontos.desvantagens);
    console.log('Características:', dashboardEstado.pontos.caracteristicas);
    console.log('Saldo disponível:', dashboardEstado.pontos.saldoDisponivel);
    console.log('=======================');
}

window.debugDashboard = debugDashboard;

console.log('📊 Dashboard JS 100% Completo - Carregado e pronto!');
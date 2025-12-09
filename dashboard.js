// ===== DASHBOARD.JS - VERSÃO CORRIGIDA E ESTÁVEL =====

// Estado do dashboard
let dashboardEstado = {
    pontos: {
        total: 150,
        gastosAtributos: 0,
        gastosVantagens: 0,
        gastosPericias: 0,
        gastosMagias: 0,
        desvantagens: 0, // Pontos NEGATIVOS de desvantagens
        limiteDesvantagens: -50,
        saldoDisponivel: 150 // Calculado: total - (gastosAtributos + vantagens + pericias + magias) + desvantagens
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
    }
};

// ===== 1. SISTEMA DE FOTO =====
function configurarSistemaFoto() {
    const fotoUpload = document.getElementById('fotoUpload');
    const fotoPreview = document.getElementById('fotoPreview');
    const fotoPlaceholder = document.getElementById('fotoPlaceholder');
    const btnRemoverFoto = document.getElementById('btnRemoverFoto');

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
    setInterval(() => {
        puxarDadosVantagens();
        puxarDadosPericias();
        puxarDadosMagias();
        puxarDadosCaracteristicas();
        
        atualizarDisplayResumoGastos();
        atualizarDisplayPontos();
    }, 1500);
}

function puxarDadosVantagens() {
    try {
        // Buscar vantagens (valores positivos)
        const totalVantagensElement = document.getElementById('total-vantagens');
        if (totalVantagensElement) {
            const texto = totalVantagensElement.textContent;
            const match = texto.match(/([+-]?\d+)/);
            if (match) {
                dashboardEstado.pontos.gastosVantagens = parseInt(match[1]) || 0;
            }
        }
        
        // Buscar desvantagens (valores negativos que viram pontos POSITIVOS)
        const totalDesvantagensElement = document.getElementById('total-desvantagens');
        if (totalDesvantagensElement) {
            const texto = totalDesvantagensElement.textContent;
            const match = texto.match(/([+-]?\d+)/);
            if (match) {
                // Desvantagens são valores negativos (ex: -20)
                // Mas para o cálculo, são pontos POSITIVOS que ADICIONAM ao saldo
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

// ===== 6. CÁLCULO CORRETO DO SALDO =====
function calcularSaldoDisponivel() {
    // Fórmula: Saldo = Total - (Gastos em Atributos, Vantagens, Perícias, Magias) + Desvantagens
    // Desvantagens são pontos NEGATIVOS que ADICIONAM ao saldo
    
    const { total, gastosAtributos, gastosVantagens, gastosPericias, gastosMagias, desvantagens } = dashboardEstado.pontos;
    
    // Gastos totais (positivos)
    const gastosTotais = gastosAtributos + gastosVantagens + gastosPericias + gastosMagias;
    
    // Desvantagens ADICIONAM ao saldo (são pontos ganhos)
    dashboardEstado.pontos.saldoDisponivel = total - gastosTotais + desvantagens;
    
    // Atualizar displays
    atualizarDisplayPontos();
    atualizarDisplayResumoGastos();
}

// ===== 7. FUNÇÕES DE ATUALIZAÇÃO DE DISPLAY =====
function atualizarDisplayAtributos() {
    const { ST, DX, IQ, HT } = dashboardEstado.atributos;
    
    document.getElementById('statusST').textContent = ST;
    document.getElementById('statusDX').textContent = DX;
    document.getElementById('statusIQ').textContent = IQ;
    document.getElementById('statusHT').textContent = HT;
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
    
    document.getElementById('statusAparencia').textContent = aparencia;
    document.getElementById('statusRiqueza').textContent = riqueza;
    document.getElementById('statusSaldo').textContent = saldo;
}

function atualizarDisplayPontos() {
    const { total, gastosAtributos, gastosVantagens, gastosPericias, gastosMagias, desvantagens, saldoDisponivel, limiteDesvantagens } = dashboardEstado.pontos;
    
    // Pontos Gastos Dashboard (total de gastos POSITIVOS)
    const pontosGastosDashboard = gastosAtributos + gastosVantagens + gastosPericias + gastosMagias;
    document.getElementById('pontosGastosDashboard').textContent = pontosGastosDashboard;
    
    // Saldo Disponível (com desvantagens ADICIONANDO pontos)
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
}

function atualizarDisplayResumoGastos() {
    const { gastosAtributos, gastosVantagens, gastosPericias, gastosMagias, desvantagens, saldoDisponivel } = dashboardEstado.pontos;
    
    // Cards individuais
    document.getElementById('gastosAtributos').textContent = gastosAtributos;
    document.getElementById('gastosVantagens').textContent = gastosVantagens;
    document.getElementById('gastosPericias').textContent = gastosPericias;
    document.getElementById('gastosMagias').textContent = gastosMagias;
    document.getElementById('gastosDesvantagens').textContent = desvantagens;
    
    // Total Gastos (gastos positivos menos desvantagens que são pontos ganhos)
    const gastosPositivos = gastosAtributos + gastosVantagens + gastosPericias + gastosMagias;
    const gastosLiquidos = gastosPositivos - desvantagens; // Desvantagens SUBTRAEM do total gasto
    document.getElementById('gastosTotal').textContent = gastosLiquidos;
    
    const totalElement = document.getElementById('gastosTotal');
    if (totalElement) {
        if (gastosLiquidos > dashboardEstado.pontos.total) {
            totalElement.style.color = '#e74c3c';
        } else if (gastosLiquidos > dashboardEstado.pontos.total * 0.8) {
            totalElement.style.color = '#f39c12';
        } else {
            totalElement.style.color = '#ffd700';
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

// ===== 9. INICIALIZAÇÃO COMPLETA =====
function inicializarDashboard() {
    console.log('🚀 Inicializando Dashboard Estável');
    
    // Configurar sistemas
    configurarSistemaFoto();
    configurarCamposIdentificacao();
    configurarControlePontos();
    configurarSistemaRelacionamentos();
    
    // Iniciar monitoramento
    monitorarAtributos();
    monitorarOutrasAbas();
    
    // Atualizar displays
    setTimeout(() => {
        atualizarDisplayAtributos();
        atualizarDisplayVitalidade();
        atualizarDisplayCaracteristicas();
        atualizarDisplayPontos();
        atualizarDisplayResumoGastos();
        atualizarContadorDescricao();
    }, 500);
    
    console.log('✅ Dashboard inicializado');
}

// ===== 10. INICIALIZAÇÃO AUTOMÁTICA =====
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

// ===== 11. EXPORTAÇÃO DE FUNÇÕES =====
window.inicializarDashboard = inicializarDashboard;
window.dashboardEstado = dashboardEstado;
window.removerRelacionamento = removerRelacionamento;

console.log('📊 Dashboard JS carregado');
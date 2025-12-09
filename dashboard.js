// ===== DASHBOARD.JS =====
// Sistema completo da aba Dashboard - Versão 2.0
// Puxa informações ativamente das outras abas

// Estado do dashboard
let dashboardEstado = {
    pontos: {
        total: 150,
        gastos: 0,
        saldo: 150,
        limiteDesvantagens: -50,
        desvantagensAtuais: 0
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
    gastos: {
        atributos: 0,
        vantagens: 0,
        pericias: 0,
        magias: 0,
        desvantagens: 0,
        total: 0
    },
    caracteristicas: {
        aparencia: 'Comum',
        riqueza: 'Média',
        saldo: '$2.000'
    }
};

// Custo dos atributos para o dashboard calcular
const CUSTOS_ATRIBUTOS = {
    ST: 10,
    DX: 20,
    IQ: 20,
    HT: 10
};

// ===== 1. SISTEMA DE MONITORAMENTO DE ATRIBUTOS =====
function monitorarAtributos() {
    console.log('Iniciando monitoramento de atributos...');
    
    // Lista de IDs dos inputs de atributos na aba Atributos
    const idsAtributos = ['ST', 'DX', 'IQ', 'HT'];
    const idsBonus = ['bonusPV', 'bonusPF', 'bonusVontade', 'bonusPercepcao', 'bonusDeslocamento'];
    
    // Configurar observador de mutação na aba atributos
    const atributosTab = document.getElementById('atributos');
    
    if (atributosTab) {
        // Observar quando a aba atributos é carregada/visível
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const tab = mutation.target;
                    if (tab.id === 'atributos' && tab.classList.contains('active')) {
                        // Aba atributos ficou ativa, iniciar monitoramento
                        setTimeout(iniciarMonitoramentoAtivo, 300);
                    }
                }
            });
        });
        
        observer.observe(atributosTab, { attributes: true });
        
        // Se a aba já estiver ativa, iniciar monitoramento
        if (atributosTab.classList.contains('active')) {
            setTimeout(iniciarMonitoramentoAtivo, 300);
        }
    }
    
    // Função para iniciar monitoramento ativo
    function iniciarMonitoramentoAtivo() {
        console.log('Monitoramento ativo iniciado na aba Atributos');
        
        // Configurar intervalos para puxar valores
        setInterval(puxarValoresAtributos, 1000);
        
        // Configurar event listeners para mudanças imediatas
        configurarListenersAtributos();
    }
}

function puxarValoresAtributos() {
    // Puxar valores dos inputs de atributos
    const stInput = document.getElementById('ST');
    const dxInput = document.getElementById('DX');
    const iqInput = document.getElementById('IQ');
    const htInput = document.getElementById('HT');
    
    // Puxar valores dos bônus
    const bonusPV = document.getElementById('bonusPV');
    const bonusPF = document.getElementById('bonusPF');
    const bonusVontade = document.getElementById('bonusVontade');
    const bonusPercepcao = document.getElementById('bonusPercepcao');
    const bonusDeslocamento = document.getElementById('bonusDeslocamento');
    
    // Puxar valores totais
    const pvTotalElement = document.getElementById('PVTotal');
    const pfTotalElement = document.getElementById('PFTotal');
    const vontadeTotalElement = document.getElementById('VontadeTotal');
    const percepcaoTotalElement = document.getElementById('PercepcaoTotal');
    const deslocamentoTotalElement = document.getElementById('DeslocamentoTotal');
    
    if (stInput && dxInput && iqInput && htInput) {
        // Atualizar valores dos atributos
        dashboardEstado.atributos.ST = parseInt(stInput.value) || 10;
        dashboardEstado.atributos.DX = parseInt(dxInput.value) || 10;
        dashboardEstado.atributos.IQ = parseInt(iqInput.value) || 10;
        dashboardEstado.atributos.HT = parseInt(htInput.value) || 10;
        
        // Atualizar display no dashboard
        atualizarDisplayAtributos();
        
        // Calcular custos dos atributos
        calcularCustosAtributos();
    }
    
    if (pvTotalElement && pfTotalElement) {
        // Puxar valores de PV e PF
        const pvText = pvTotalElement.textContent;
        const pfText = pfTotalElement.textContent;
        
        // Extrair valores (formato: "10" ou "12/12")
        const pvValor = parseInt(pvText.split('/')[0]) || 10;
        const pfValor = parseInt(pfText.split('/')[0]) || 10;
        
        dashboardEstado.atributos.PV = { atual: pvValor, max: pvValor };
        dashboardEstado.atributos.PF = { atual: pfValor, max: pfValor };
        
        // Atualizar display de vitalidade
        atualizarDisplayVitalidade();
    }
    
    if (bonusPV && bonusPF) {
        // Podemos puxar os bônus também se necessário
        const bonusPVValor = parseInt(bonusPV.value) || 0;
        const bonusPFValor = parseInt(bonusPF.value) || 0;
        
        // Salvar se necessário para outros cálculos
        dashboardEstado.bonus = dashboardEstado.bonus || {};
        dashboardEstado.bonus.PV = bonusPVValor;
        dashboardEstado.bonus.PF = bonusPFValor;
    }
    
    // Puxar pontos gastos na aba atributos
    puxarPontosGastos();
}

function configurarListenersAtributos() {
    // Adicionar event listeners para detecção imediata
    const ids = ['ST', 'DX', 'IQ', 'HT', 'bonusPV', 'bonusPF'];
    
    ids.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            // Remover listener antigo se existir
            element.removeEventListener('input', handleAtributoChange);
            element.removeEventListener('change', handleAtributoChange);
            
            // Adicionar novo listener
            element.addEventListener('input', handleAtributoChange);
            element.addEventListener('change', handleAtributoChange);
        }
    });
}

function handleAtributoChange() {
    // Puxar valores imediatamente quando houver mudança
    setTimeout(puxarValoresAtributos, 100);
}

function puxarPontosGastos() {
    // Puxar pontos gastos da aba Atributos
    const pontosGastosElement = document.getElementById('pontosGastos');
    
    if (pontosGastosElement) {
        const texto = pontosGastosElement.textContent;
        const pontosGastos = parseInt(texto) || 0;
        
        // Atualizar estado
        dashboardEstado.pontos.gastos = pontosGastos;
        dashboardEstado.pontos.saldo = dashboardEstado.pontos.total - pontosGastos;
        
        // Atualizar gastos de atributos
        dashboardEstado.gastos.atributos = pontosGastos;
        
        // Atualizar displays
        atualizarDisplayPontos();
        atualizarDisplayGastos();
    }
}

function calcularCustosAtributos() {
    const { ST, DX, IQ, HT } = dashboardEstado.atributos;
    
    // Calcular custo de cada atributo
    const custoST = (ST - 10) * CUSTOS_ATRIBUTOS.ST;
    const custoDX = (DX - 10) * CUSTOS_ATRIBUTOS.DX;
    const custoIQ = (IQ - 10) * CUSTOS_ATRIBUTOS.IQ;
    const custoHT = (HT - 10) * CUSTOS_ATRIBUTOS.HT;
    
    // Atualizar gastos (pode ser usado no futuro)
    dashboardEstado.custosIndividuais = {
        ST: custoST,
        DX: custoDX,
        IQ: custoIQ,
        HT: custoHT
    };
}

// ===== 2. SISTEMA DE MONITORAMENTO DE OUTRAS ABAS =====
function monitorarOutrasAbas() {
    console.log('Iniciando monitoramento de outras abas...');
    
    // Monitorar aba Vantagens
    monitorarAbaVantagens();
    
    // Monitorar aba Perícias
    monitorarAbaPericias();
    
    // Monitorar aba Magias
    monitorarAbaMagias();
    
    // Monitorar aba Características
    monitorarAbaCaracteristicas();
}

function monitorarAbaVantagens() {
    const vantagensTab = document.getElementById('vantagens');
    
    if (vantagensTab) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const tab = mutation.target;
                    if (tab.id === 'vantagens' && tab.classList.contains('active')) {
                        setTimeout(() => {
                            // Quando a aba vantagens ficar ativa, puxar dados
                            puxarDadosVantagens();
                            // Configurar monitoramento contínuo
                            setInterval(puxarDadosVantagens, 1500);
                        }, 500);
                    }
                }
            });
        });
        
        observer.observe(vantagensTab, { attributes: true });
    }
}

function puxarDadosVantagens() {
    // Puxar total de vantagens
    const totalVantagensElement = document.getElementById('total-vantagens');
    const totalDesvantagensElement = document.getElementById('total-desvantagens');
    const custoPeculiaridadesElement = document.getElementById('custo-peculiaridades');
    
    if (totalVantagensElement) {
        const texto = totalVantagensElement.textContent;
        // Extrair número (formato: "+10 pts" ou "0 pts")
        const match = texto.match(/([+-]?\d+)/);
        if (match) {
            dashboardEstado.gastos.vantagens = parseInt(match[1]) || 0;
        }
    }
    
    if (totalDesvantagensElement) {
        const texto = totalDesvantagensElement.textContent;
        const match = texto.match(/([+-]?\d+)/);
        if (match) {
            const desvantagens = Math.abs(parseInt(match[1])) || 0;
            dashboardEstado.pontos.desvantagensAtuais = desvantagens;
            dashboardEstado.gastos.desvantagens = desvantagens;
        }
    }
    
    if (custoPeculiaridadesElement) {
        const texto = custoPeculiaridadesElement.textContent;
        const match = texto.match(/([+-]?\d+)/);
        if (match) {
            const peculiaridades = Math.abs(parseInt(match[1])) || 0;
            // Adicionar ao total de desvantagens
            dashboardEstado.pontos.desvantagensAtuais += peculiaridades;
            dashboardEstado.gastos.desvantagens += peculiaridades;
        }
    }
    
    // Atualizar displays
    atualizarDisplayPontos();
    atualizarDisplayGastos();
}

function monitorarAbaPericias() {
    const periciasTab = document.getElementById('pericias');
    
    if (periciasTab) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const tab = mutation.target;
                    if (tab.id === 'pericias' && tab.classList.contains('active')) {
                        setTimeout(() => {
                            // Quando a aba perícias ficar ativa, puxar dados
                            puxarDadosPericias();
                            // Configurar monitoramento contínuo
                            setInterval(puxarDadosPericias, 1500);
                        }, 500);
                    }
                }
            });
        });
        
        observer.observe(periciasTab, { attributes: true });
    }
}

function puxarDadosPericias() {
    // Puxar total de perícias
    const pontosPericiasTotalElement = document.getElementById('pontos-pericias-total');
    const ptsTotalElement = document.getElementById('pts-total');
    
    if (pontosPericiasTotalElement) {
        const texto = pontosPericiasTotalElement.textContent;
        // Extrair número (formato: "[10 pts]")
        const match = texto.match(/\[(\d+)\s*pts\]/);
        if (match) {
            dashboardEstado.gastos.pericias = parseInt(match[1]) || 0;
        }
    }
    
    if (ptsTotalElement) {
        const texto = ptsTotalElement.textContent;
        // Extrair número (formato: "(10 pts)")
        const match = texto.match(/\((\d+)\s*pts\)/);
        if (match) {
            dashboardEstado.gastos.pericias = parseInt(match[1]) || 0;
        }
    }
    
    atualizarDisplayGastos();
}

function monitorarAbaMagias() {
    const magiaTab = document.getElementById('magia');
    
    if (magiaTab) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const tab = mutation.target;
                    if (tab.id === 'magia' && tab.classList.contains('active')) {
                        setTimeout(() => {
                            // Quando a aba magia ficar ativa, puxar dados
                            puxarDadosMagias();
                            // Configurar monitoramento contínuo
                            setInterval(puxarDadosMagias, 1500);
                        }, 500);
                    }
                }
            });
        });
        
        observer.observe(magiaTab, { attributes: true });
    }
}

function puxarDadosMagias() {
    // Puxar total de magias
    const totalGastoMagiaElement = document.getElementById('total-gasto-magia');
    const pontosMagiaTotalElement = document.getElementById('pontos-magia-total');
    
    if (totalGastoMagiaElement) {
        const texto = totalGastoMagiaElement.textContent;
        const match = texto.match(/(\d+)/);
        if (match) {
            dashboardEstado.gastos.magias = parseInt(match[1]) || 0;
        }
    }
    
    if (pontosMagiaTotalElement) {
        const texto = pontosMagiaTotalElement.textContent;
        const match = texto.match(/\[(\d+)\s*pts\]/);
        if (match) {
            dashboardEstado.gastos.magias = parseInt(match[1]) || 0;
        }
    }
    
    atualizarDisplayGastos();
}

function monitorarAbaCaracteristicas() {
    const caracteristicasTab = document.getElementById('caracteristicas');
    
    if (caracteristicasTab) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const tab = mutation.target;
                    if (tab.id === 'caracteristicas' && tab.classList.contains('active')) {
                        setTimeout(() => {
                            // Quando a aba características ficar ativa, puxar dados
                            puxarDadosCaracteristicas();
                            // Configurar monitoramento contínuo
                            setInterval(puxarDadosCaracteristicas, 1500);
                        }, 500);
                    }
                }
            });
        });
        
        observer.observe(caracteristicasTab, { attributes: true });
    }
}

function puxarDadosCaracteristicas() {
    // Puxar aparência
    const nivelAparenciaSelect = document.getElementById('nivelAparencia');
    const displayAparenciaElement = document.getElementById('displayAparencia');
    
    if (nivelAparenciaSelect) {
        const selectedOption = nivelAparenciaSelect.options[nivelAparenciaSelect.selectedIndex];
        const texto = selectedOption.textContent;
        // Extrair nome (formato: "Comum [0 pts]")
        const nome = texto.split('[')[0].trim();
        dashboardEstado.caracteristicas.aparencia = nome;
    } else if (displayAparenciaElement) {
        const strongElement = displayAparenciaElement.querySelector('strong');
        if (strongElement) {
            dashboardEstado.caracteristicas.aparencia = strongElement.textContent.trim();
        }
    }
    
    // Puxar riqueza
    const nivelRiquezaSelect = document.getElementById('nivelRiqueza');
    const displayRiquezaElement = document.getElementById('displayRiqueza');
    
    if (nivelRiquezaSelect) {
        const selectedOption = nivelRiquezaSelect.options[nivelRiquezaSelect.selectedIndex];
        const texto = selectedOption.textContent;
        // Extrair nome (formato: "Médio [0 pts]")
        const nome = texto.split('[')[0].trim();
        dashboardEstado.caracteristicas.riqueza = nome;
    } else if (displayRiquezaElement) {
        const strongElement = displayRiquezaElement.querySelector('strong');
        if (strongElement) {
            dashboardEstado.caracteristicas.riqueza = strongElement.textContent.trim();
        }
    }
    
    // Puxar saldo (do equipamento se disponível)
    const dinheiroEquipamentoElement = document.getElementById('dinheiroEquipamento');
    if (dinheiroEquipamentoElement) {
        dashboardEstado.caracteristicas.saldo = dinheiroEquipamentoElement.textContent;
    }
    
    // Atualizar display
    atualizarDisplayCaracteristicas();
}

// ===== 3. FUNÇÕES DE ATUALIZAÇÃO DE DISPLAY =====
function atualizarDisplayAtributos() {
    const { ST, DX, IQ, HT } = dashboardEstado.atributos;
    
    document.getElementById('statusST').textContent = ST;
    document.getElementById('statusDX').textContent = DX;
    document.getElementById('statusIQ').textContent = IQ;
    document.getElementById('statusHT').textContent = HT;
    
    // Efeito visual de atualização
    highlightElement('statusST');
    highlightElement('statusDX');
    highlightElement('statusIQ');
    highlightElement('statusHT');
}

function atualizarDisplayVitalidade() {
    const { PV, PF } = dashboardEstado.atributos;
    
    document.getElementById('statusPV').textContent = `${PV.atual}/${PV.max}`;
    document.getElementById('statusPF').textContent = `${PF.atual}/${PF.max}`;
    
    // Atualizar barras
    const barPV = document.querySelector('.bar-pv');
    const barPF = document.querySelector('.bar-pf');
    
    if (barPV) {
        const percentPV = (PV.atual / PV.max) * 100;
        barPV.style.width = `${percentPV}%`;
        
        // Cor baseada na porcentagem
        if (percentPV < 25) {
            barPV.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
        } else if (percentPV < 50) {
            barPV.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
        } else {
            barPV.style.background = 'linear-gradient(90deg, #27ae60, #2ecc71)';
        }
    }
    
    if (barPF) {
        const percentPF = (PF.atual / PF.max) * 100;
        barPF.style.width = `${percentPF}%`;
    }
    
    highlightElement('statusPV');
    highlightElement('statusPF');
}

function atualizarDisplayCaracteristicas() {
    const { aparencia, riqueza, saldo } = dashboardEstado.caracteristicas;
    
    document.getElementById('statusAparencia').textContent = aparencia;
    document.getElementById('statusRiqueza').textContent = riqueza;
    document.getElementById('statusSaldo').textContent = saldo;
}

function atualizarDisplayPontos() {
    // Pontos Gastos
    const pontosGastosElement = document.getElementById('pontosGastosDashboard');
    if (pontosGastosElement) {
        pontosGastosElement.textContent = dashboardEstado.pontos.gastos;
        highlightElement('pontosGastosDashboard');
    }
    
    // Saldo Disponível
    const saldoElement = document.getElementById('saldoDisponivelDashboard');
    if (saldoElement) {
        const saldo = dashboardEstado.pontos.saldo;
        saldoElement.textContent = saldo;
        
        // Cor baseada no saldo
        if (saldo < 0) {
            saldoElement.style.color = '#e74c3c';
            saldoElement.title = 'Saldo negativo!';
        } else if (saldo < 50) {
            saldoElement.style.color = '#f39c12';
            saldoElement.title = 'Saldo baixo';
        } else {
            saldoElement.style.color = '#3498db';
            saldoElement.title = 'Saldo suficiente';
        }
        
        highlightElement('saldoDisponivelDashboard');
    }
    
    // Desvantagens Atuais
    const desvantagensElement = document.getElementById('desvantagensAtuais');
    if (desvantagensElement) {
        desvantagensElement.textContent = dashboardEstado.pontos.desvantagensAtuais;
        
        // Verificar limite
        if (dashboardEstado.pontos.desvantagensAtuais < dashboardEstado.pontos.limiteDesvantagens) {
            desvantagensElement.style.color = '#e74c3c';
            desvantagensElement.title = 'Acima do limite de desvantagens!';
        } else {
            desvantagensElement.style.color = '#9b59b6';
            desvantagensElement.title = 'Dentro do limite';
        }
        
        highlightElement('desvantagensAtuais');
    }
}

function atualizarDisplayGastos() {
    // Atualizar todos os cards de gastos
    const ids = {
        atributos: 'gastosAtributos',
        vantagens: 'gastosVantagens',
        pericias: 'gastosPericias',
        magias: 'gastosMagias',
        desvantagens: 'gastosDesvantagens',
        total: 'gastosTotal'
    };
    
    // Calcular total
    let total = 0;
    
    Object.keys(ids).forEach(chave => {
        if (chave !== 'total') {
            const valor = dashboardEstado.gastos[chave] || 0;
            total += Math.abs(valor); // Desvantagens são negativas, mas somamos como positivo
            
            const elemento = document.getElementById(ids[chave]);
            if (elemento) {
                elemento.textContent = valor;
                highlightElement(ids[chave]);
            }
        }
    });
    
    // Atualizar total
    dashboardEstado.gastos.total = total;
    const totalElement = document.getElementById('gastosTotal');
    if (totalElement) {
        totalElement.textContent = total;
        
        // Cor do total
        if (total > dashboardEstado.pontos.total) {
            totalElement.style.color = '#e74c3c';
            totalElement.title = 'Gastos excedem pontos totais!';
        } else if (total > dashboardEstado.pontos.total * 0.8) {
            totalElement.style.color = '#f39c12';
            totalElement.title = 'Gastos próximos do limite';
        } else {
            totalElement.style.color = '#ffd700';
            totalElement.title = 'Gastos dentro do orçamento';
        }
        
        highlightElement('gastosTotal');
    }
}

function highlightElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.add('updated');
        setTimeout(() => {
            element.classList.remove('updated');
        }, 1000);
    }
}

// ===== 4. INICIALIZAÇÃO COMPLETA =====
function inicializarDashboard() {
    console.log('🚀 Inicializando Dashboard - Monitoramento Ativo');
    
    // Carregar estado salvo
    carregarEstadoLocalStorage();
    
    // Configurar sistemas do dashboard
    configurarSistemaFoto();
    configurarCamposIdentificacao();
    configurarControlePontos();
    configurarSistemaRelacionamentos();
    
    // Iniciar monitoramento de outras abas
    monitorarAtributos();
    monitorarOutrasAbas();
    
    // Configurar monitoramento geral
    configurarMonitoramentoGeral();
    
    // Atualizar todos os displays inicialmente
    atualizarTodosDisplays();
    
    console.log('✅ Dashboard inicializado com monitoramento ativo');
}

function configurarMonitoramentoGeral() {
    // Monitorar mudanças em qualquer aba periodicamente
    setInterval(() => {
        // Forçar atualização periódica
        puxarValoresAtributos();
        puxarPontosGastos();
        
        // Recalcular saldo
        dashboardEstado.pontos.saldo = dashboardEstado.pontos.total - dashboardEstado.pontos.gastos;
        
        // Atualizar displays
        atualizarDisplayPontos();
        atualizarDisplayGastos();
    }, 2000);
}

// ===== 5. FUNÇÕES RESTANTES (MANTIDAS DO CÓDIGO ANTERIOR) =====
// (Aqui viriam as funções de foto, identificação, relacionamentos, etc.
// que são as mesmas do código anterior, então não repito para economizar espaço)

// ===== 6. INICIALIZAÇÃO AUTOMÁTICA =====
// Inicializar imediatamente se a aba já estiver ativa
document.addEventListener('DOMContentLoaded', function() {
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
    
    document.querySelectorAll('.tab-content').forEach(tab => {
        observer.observe(tab, { attributes: true });
    });
});

// ===== CSS PARA ANIMAÇÕES =====
// Adicionar este CSS ao seu style-dashboard.css
const dashboardCSS = `
/* Animações para atualizações em tempo real */
@keyframes highlightPulse {
    0% { 
        background-color: rgba(255, 140, 0, 0.3);
        transform: scale(1);
    }
    50% { 
        background-color: rgba(255, 140, 0, 0.6);
        transform: scale(1.05);
    }
    100% { 
        background-color: transparent;
        transform: scale(1);
    }
}

.updated {
    animation: highlightPulse 0.5s ease;
    border-radius: 4px;
    padding: 2px 4px;
}

/* Indicador de monitoramento ativo */
.dashboard-monitoring {
    position: fixed;
    bottom: 10px;
    right: 10px;
    background: rgba(46, 204, 113, 0.9);
    color: white;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 5px;
}

.dashboard-monitoring::before {
    content: '';
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
}
`;

// Injetar CSS se não estiver presente
function injetarCSSDashboard() {
    if (!document.getElementById('dashboard-css-dynamic')) {
        const style = document.createElement('style');
        style.id = 'dashboard-css-dynamic';
        style.textContent = dashboardCSS;
        document.head.appendChild(style);
    }
}

// Injetar CSS quando inicializar
injetarCSSDashboard();

// ===== EXPORTAÇÃO =====
window.inicializarDashboard = inicializarDashboard;
window.dashboardEstado = dashboardEstado;
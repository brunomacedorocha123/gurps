// ===== DASHBOARD.JS - VERSÃO CORRIGIDA =====
// Sistema completo da aba Dashboard - Versão 3.1
// Corrige monitoramento sem CSS conflitante

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

// ===== 1. SISTEMA DE FOTO (JÁ FUNCIONA) =====
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
                
                // Salvar no localStorage
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

    // Carregar foto salva
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
            // Carregar valor salvo
            const valorSalvo = localStorage.getItem(`personagem_${campoId}`);
            if (valorSalvo) {
                campo.value = valorSalvo;
                if (campoId === 'descricaoPersonagem') {
                    atualizarContadorDescricao();
                }
            }
            
            // Salvar ao digitar
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
    
    // Carregar valores salvos
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
    
    // Salvar ao alterar
    if (pontosTotaisInput) {
        pontosTotaisInput.addEventListener('change', function() {
            const valor = parseInt(this.value) || 150;
            dashboardEstado.pontos.total = valor;
            dashboardEstado.pontos.saldo = valor - dashboardEstado.pontos.gastos;
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

// ===== 4. SISTEMA DE MONITORAMENTO DE ATRIBUTOS =====
function monitorarAtributos() {
    console.log('🔍 Iniciando monitoramento de atributos...');
    
    // Verificar se estamos na aba dashboard
    const verificarEAtaulizar = () => {
        const dashboardTab = document.getElementById('dashboard');
        if (dashboardTab && dashboardTab.classList.contains('active')) {
            puxarValoresAtributosAtivos();
        }
    };
    
    // Verificar a cada segundo
    setInterval(verificarEAtaulizar, 1000);
    
    // Verificar imediatamente
    setTimeout(verificarEAtaulizar, 500);
}

function puxarValoresAtributosAtivos() {
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
            
            // Atualizar estado
            dashboardEstado.atributos.ST = ST;
            dashboardEstado.atributos.DX = DX;
            dashboardEstado.atributos.IQ = IQ;
            dashboardEstado.atributos.HT = HT;
            
            // Calcular custos dos atributos
            calcularCustosAtributos();
            
            // Atualizar display
            atualizarDisplayAtributos();
        }
        
        // Puxar PV e PF
        const pvTotalElement = document.getElementById('PVTotal');
        const pfTotalElement = document.getElementById('PFTotal');
        
        if (pvTotalElement && pfTotalElement) {
            const pvText = pvTotalElement.textContent;
            const pfText = pfTotalElement.textContent;
            
            // Extrair valores
            const pvValor = parseInt(pvText.split('/')[0]) || 10;
            const pfValor = parseInt(pfText.split('/')[0]) || 10;
            
            dashboardEstado.atributos.PV = { atual: pvValor, max: pvValor };
            dashboardEstado.atributos.PF = { atual: pfValor, max: pfValor };
            
            atualizarDisplayVitalidade();
        }
        
        // Puxar pontos gastos em atributos
        const pontosGastosElement = document.getElementById('pontosGastos');
        if (pontosGastosElement) {
            const texto = pontosGastosElement.textContent;
            const pontosGastosAtributos = parseInt(texto) || 0;
            
            // Atualizar apenas atributos, não o total
            dashboardEstado.gastos.atributos = pontosGastosAtributos;
            
            // Recalcular total
            recalcualarTotalGastos();
        }
        
    } catch (error) {
        console.log('Erro ao puxar atributos:', error);
    }
}

function calcularCustosAtributos() {
    const { ST, DX, IQ, HT } = dashboardEstado.atributos;
    
    // Custo padrão GURPS
    const custoST = (ST - 10) * 10;
    const custoDX = (DX - 10) * 20;
    const custoIQ = (IQ - 10) * 20;
    const custoHT = (HT - 10) * 10;
    
    const totalAtributos = custoST + custoDX + custoIQ + custoHT;
    dashboardEstado.gastos.atributos = totalAtributos;
}

// ===== 5. SISTEMA DE MONITORAMENTO DE OUTRAS ABAS =====
function monitorarOutrasAbas() {
    // Monitorar periodicamente
    setInterval(() => {
        puxarDadosVantagens();
        puxarDadosPericias();
        puxarDadosMagias();
        puxarDadosCaracteristicas();
        
        // Recalcular total
        recalcualarTotalGastos();
        
        // Atualizar displays
        atualizarDisplayPontos();
        atualizarDisplayGastos();
    }, 1500);
}

function puxarDadosVantagens() {
    try {
        // Buscar elementos de vantagens
        const totalVantagensElement = document.getElementById('total-vantagens');
        if (totalVantagensElement) {
            const texto = totalVantagensElement.textContent;
            const match = texto.match(/([+-]?\d+)/);
            if (match) {
                dashboardEstado.gastos.vantagens = parseInt(match[1]) || 0;
            }
        }
        
        // Buscar elementos de desvantagens
        const totalDesvantagensElement = document.getElementById('total-desvantagens');
        if (totalDesvantagensElement) {
            const texto = totalDesvantagensElement.textContent;
            const match = texto.match(/([+-]?\d+)/);
            if (match) {
                const valor = parseInt(match[1]) || 0;
                dashboardEstado.pontos.desvantagensAtuais = Math.abs(valor);
                dashboardEstado.gastos.desvantagens = Math.abs(valor);
            }
        }
        
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
                dashboardEstado.gastos.pericias = parseInt(match[1]) || 0;
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
                dashboardEstado.gastos.magias = parseInt(match[1]) || 0;
            }
        }
    } catch (error) {
        console.log('Erro ao puxar magias:', error);
    }
}

function puxarDadosCaracteristicas() {
    try {
        // Puxar aparência
        const nivelAparenciaSelect = document.getElementById('nivelAparencia');
        if (nivelAparenciaSelect) {
            const texto = nivelAparenciaSelect.options[nivelAparenciaSelect.selectedIndex].text;
            const nome = texto.split('[')[0].trim();
            dashboardEstado.caracteristicas.aparencia = nome;
        }
        
        // Puxar riqueza
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

function recalcualarTotalGastos() {
    // Somar todos os gastos positivos (atributos, vantagens, perícias, magias)
    const gastosPositivos = 
        dashboardEstado.gastos.atributos + 
        dashboardEstado.gastos.vantagens + 
        dashboardEstado.gastos.pericias + 
        dashboardEstado.gastos.magias;
    
    // Subtrair desvantagens (que são pontos negativos)
    const totalGastos = gastosPositivos - dashboardEstado.gastos.desvantagens;
    
    dashboardEstado.pontos.gastos = Math.max(totalGastos, 0);
    dashboardEstado.pontos.saldo = dashboardEstado.pontos.total - dashboardEstado.pontos.gastos;
    dashboardEstado.gastos.total = totalGastos;
}

// ===== 6. SISTEMA DE RELACIONAMENTOS =====
function configurarSistemaRelacionamentos() {
    // Carregar relacionamentos salvos
    carregarRelacionamentos();
    
    // Configurar botões de adicionar
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

// ===== 7. FUNÇÕES DE ATUALIZAÇÃO DE DISPLAY =====
function atualizarDisplayAtributos() {
    const { ST, DX, IQ, HT } = dashboardEstado.atributos;
    
    document.getElementById('statusST').textContent = ST;
    document.getElementById('statusDX').textContent = DX;
    document.getElementById('statusIQ').textContent = IQ;
    document.getElementById('statusHT').textContent = HT;
    
    // Efeito visual sutil
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
    // Pontos Gastos
    const pontosGastosElement = document.getElementById('pontosGastosDashboard');
    if (pontosGastosElement) {
        pontosGastosElement.textContent = dashboardEstado.pontos.gastos;
    }
    
    // Saldo Disponível
    const saldoElement = document.getElementById('saldoDisponivelDashboard');
    if (saldoElement) {
        const saldo = dashboardEstado.pontos.saldo;
        saldoElement.textContent = saldo;
        
        // Cor baseada no saldo
        if (saldo < 0) {
            saldoElement.style.color = '#e74c3c';
        } else if (saldo < 50) {
            saldoElement.style.color = '#f39c12';
        } else {
            saldoElement.style.color = '#3498db';
        }
    }
    
    // Desvantagens Atuais
    const desvantagensElement = document.getElementById('desvantagensAtuais');
    if (desvantagensElement) {
        desvantagensElement.textContent = dashboardEstado.pontos.desvantagensAtuais;
        
        // Verificar limite
        if (dashboardEstado.pontos.desvantagensAtuais > Math.abs(dashboardEstado.pontos.limiteDesvantagens)) {
            desvantagensElement.style.color = '#e74c3c';
        } else {
            desvantagensElement.style.color = '#9b59b6';
        }
    }
}

function atualizarDisplayGastos() {
    // Atualizar cada card individualmente
    const { atributos, vantagens, pericias, magias, desvantagens, total } = dashboardEstado.gastos;
    
    document.getElementById('gastosAtributos').textContent = atributos;
    document.getElementById('gastosVantagens').textContent = vantagens;
    document.getElementById('gastosPericias').textContent = pericias;
    document.getElementById('gastosMagias').textContent = magias;
    document.getElementById('gastosDesvantagens').textContent = desvantagens;
    document.getElementById('gastosTotal').textContent = total;
    
    // Destacar elementos atualizados
    ['gastosAtributos', 'gastosVantagens', 'gastosPericias', 'gastosMagias', 'gastosDesvantagens', 'gastosTotal']
        .forEach(id => highlightElement(id));
}

function highlightElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.add('updated');
        setTimeout(() => {
            element.classList.remove('updated');
        }, 800);
    }
}

function atualizarTodosDisplays() {
    atualizarDisplayAtributos();
    atualizarDisplayVitalidade();
    atualizarDisplayCaracteristicas();
    atualizarDisplayPontos();
    atualizarDisplayGastos();
    atualizarContadorDescricao();
    
    // Atualizar relacionamentos
    ['inimigos', 'aliados', 'dependentes'].forEach(tipo => {
        atualizarListaRelacionamentos(tipo);
    });
}

// ===== 8. CARREGAR E SALVAR ESTADO =====
function carregarEstadoLocalStorage() {
    try {
        const salvo = localStorage.getItem('dashboard_estado');
        if (salvo) {
            const dados = JSON.parse(salvo);
            
            // Carregar apenas dados não sensíveis
            if (dados.pontos) dashboardEstado.pontos = { ...dashboardEstado.pontos, ...dados.pontos };
            if (dados.identificacao) dashboardEstado.identificacao = { ...dashboardEstado.identificacao, ...dados.identificacao };
            if (dados.caracteristicas) dashboardEstado.caracteristicas = { ...dashboardEstado.caracteristicas, ...dados.caracteristicas };
            
            // Atualizar inputs
            if (dashboardEstado.pontos.total) {
                const pontosInput = document.getElementById('pontosTotaisDashboard');
                if (pontosInput) pontosInput.value = dashboardEstado.pontos.total;
            }
            
            if (dashboardEstado.pontos.limiteDesvantagens) {
                const limiteInput = document.getElementById('limiteDesvantagens');
                if (limiteInput) limiteInput.value = dashboardEstado.pontos.limiteDesvantagens;
            }
        }
    } catch (error) {
        console.error('Erro ao carregar estado:', error);
    }
}

// ===== 9. INICIALIZAÇÃO COMPLETA =====
function inicializarDashboard() {
    console.log('🚀 Inicializando Dashboard');
    
    // Configurar sistemas do dashboard
    configurarSistemaFoto();
    configurarCamposIdentificacao();
    configurarControlePontos();
    configurarSistemaRelacionamentos();
    
    // Carregar estado salvo
    carregarEstadoLocalStorage();
    
    // Iniciar monitoramento
    monitorarAtributos();
    monitorarOutrasAbas();
    
    // Atualizar todos os displays inicialmente
    setTimeout(atualizarTodosDisplays, 500);
    
    console.log('✅ Dashboard inicializado');
}

// ===== 10. INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar CSS minimalista apenas para animações
    const estiloAnimacao = `
    @keyframes highlightPulse {
        0% { background-color: rgba(255, 140, 0, 0.1); }
        50% { background-color: rgba(255, 140, 0, 0.3); }
        100% { background-color: transparent; }
    }
    
    .updated {
        animation: highlightPulse 0.8s ease;
        border-radius: 4px;
        padding: 2px 4px;
    }
    
    /* Estilos para relacionamentos */
    .relacionamento-item {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 10px;
        margin-bottom: 8px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        border-left: 4px solid;
    }
    
    .card-inimigo .relacionamento-item {
        border-left-color: #e74c3c;
    }
    
    .card-aliado .relacionamento-item {
        border-left-color: #2ecc71;
    }
    
    .card-dependente .relacionamento-item {
        border-left-color: #3498db;
    }
    
    .relacionamento-info {
        flex: 1;
    }
    
    .relacionamento-pontos {
        display: inline-block;
        margin-left: 10px;
        padding: 2px 6px;
        background: rgba(255,255,255,0.1);
        border-radius: 3px;
        font-size: 0.85em;
    }
    
    .relacionamento-descricao {
        font-size: 0.9em;
        color: rgba(255,255,255,0.8);
        margin-top: 5px;
        margin-bottom: 5px;
    }
    
    .relacionamento-data {
        font-size: 0.8em;
        color: rgba(255,255,255,0.5);
        display: block;
    }
    
    .btn-remover-relacionamento {
        background: none;
        border: none;
        color: rgba(255,255,255,0.5);
        cursor: pointer;
        padding: 5px;
        margin-left: 10px;
    }
    
    .btn-remover-relacionamento:hover {
        color: #e74c3c;
    }
    `;
    
    const style = document.createElement('style');
    style.textContent = estiloAnimacao;
    document.head.appendChild(style);
    
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
window.obterEstadoDashboard = function() {
    return dashboardEstado;
};

console.log('📊 Dashboard JS carregado');
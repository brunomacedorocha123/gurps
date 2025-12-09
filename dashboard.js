// ===== DASHBOARD.JS - VERSÃO CORRIGIDA =====
// Sistema completo da aba Dashboard - Versão 3.0
// Corrige o monitoramento de atributos em tempo real

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

// ===== 4. SISTEMA DE MONITORAMENTO DE ATRIBUTOS (CORRIGIDO) =====
function monitorarAtributos() {
    console.log('🔍 Iniciando monitoramento de atributos...');
    
    // Configurar um intervalo para verificar mudanças nos atributos
    setInterval(() => {
        puxarValoresAtributosAtivos();
    }, 1000); // Verifica a cada segundo
    
    // Também monitorar quando a aba atributos ficar ativa
    const atributosTab = document.getElementById('atributos');
    if (atributosTab) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const tab = mutation.target;
                    if (tab.id === 'atributos' && tab.classList.contains('active')) {
                        console.log('📊 Aba Atributos ativada - monitorando...');
                        // Quando a aba atributos fica ativa, puxamos os valores imediatamente
                        setTimeout(puxarValoresAtributosAtivos, 500);
                    }
                }
            });
        });
        
        observer.observe(atributosTab, { attributes: true });
        
        // Se já estiver ativa, puxar agora
        if (atributosTab.classList.contains('active')) {
            setTimeout(puxarValoresAtributosAtivos, 500);
        }
    }
}

function puxarValoresAtributosAtivos() {
    // Tenta puxar dos inputs diretamente
    const stInput = document.getElementById('ST');
    const dxInput = document.getElementById('DX');
    const iqInput = document.getElementById('IQ');
    const htInput = document.getElementById('HT');
    
    // Tenta puxar dos totais se os inputs não existirem
    const pvTotalElement = document.getElementById('PVTotal');
    const pfTotalElement = document.getElementById('PFTotal');
    
    // Puxar pontos gastos
    const pontosGastosElement = document.getElementById('pontosGastos');
    
    if (stInput && dxInput && iqInput && htInput) {
        // Puxar dos inputs diretos
        const ST = parseInt(stInput.value) || 10;
        const DX = parseInt(dxInput.value) || 10;
        const IQ = parseInt(iqInput.value) || 10;
        const HT = parseInt(htInput.value) || 10;
        
        // Atualizar estado
        dashboardEstado.atributos.ST = ST;
        dashboardEstado.atributos.DX = DX;
        dashboardEstado.atributos.IQ = IQ;
        dashboardEstado.atributos.HT = HT;
        
        // Calcular custo dos atributos
        calcularCustosAtributos();
    }
    
    if (pvTotalElement && pfTotalElement) {
        // Puxar PV e PF
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
    
    if (pontosGastosElement) {
        // Puxar pontos gastos na aba atributos
        const texto = pontosGastosElement.textContent;
        const pontosGastos = parseInt(texto) || 0;
        
        // Atualizar gastos de atributos
        dashboardEstado.gastos.atributos = pontosGastos;
        
        // Recalcular total de gastos
        recalcualarTotalGastos();
        
        // Atualizar displays
        atualizarDisplayPontos();
        atualizarDisplayGastos();
    }
    
    // Atualizar display de atributos
    atualizarDisplayAtributos();
}

function calcularCustosAtributos() {
    const { ST, DX, IQ, HT } = dashboardEstado.atributos;
    
    // Calcular custo de cada atributo
    const custoST = (ST - 10) * CUSTOS_ATRIBUTOS.ST;
    const custoDX = (DX - 10) * CUSTOS_ATRIBUTOS.DX;
    const custoIQ = (IQ - 10) * CUSTOS_ATRIBUTOS.IQ;
    const custoHT = (HT - 10) * CUSTOS_ATRIBUTOS.HT;
    
    // Total gasto em atributos
    const totalAtributos = custoST + custoDX + custoIQ + custoHT;
    dashboardEstado.gastos.atributos = totalAtributos;
    
    // Atualizar gastos individuais
    dashboardEstado.custosIndividuais = {
        ST: custoST,
        DX: custoDX,
        IQ: custoIQ,
        HT: custoHT
    };
}

// ===== 5. SISTEMA DE MONITORAMENTO DE OUTRAS ABAS =====
function monitorarOutrasAbas() {
    // Monitorar todas as abas periodicamente
    setInterval(() => {
        puxarDadosVantagens();
        puxarDadosPericias();
        puxarDadosMagias();
        puxarDadosCaracteristicas();
    }, 2000);
}

function puxarDadosVantagens() {
    try {
        // Tentar vários seletores possíveis
        const seletores = [
            '#total-vantagens',
            '.total-vantagens',
            '[data-total="vantagens"]',
            '.vantagens-total'
        ];
        
        let vantagensValor = 0;
        let desvantagensValor = 0;
        
        // Procurar elemento de vantagens
        for (const seletor of seletores) {
            const elemento = document.querySelector(seletor);
            if (elemento) {
                const texto = elemento.textContent;
                const match = texto.match(/([+-]?\d+)/);
                if (match) {
                    vantagensValor = parseInt(match[1]) || 0;
                    break;
                }
            }
        }
        
        // Procurar elemento de desvantagens
        const desvantagensSelectors = [
            '#total-desvantagens',
            '.total-desvantagens',
            '[data-total="desvantagens"]'
        ];
        
        for (const seletor of desvantagensSelectors) {
            const elemento = document.querySelector(seletor);
            if (elemento) {
                const texto = elemento.textContent;
                const match = texto.match(/([+-]?\d+)/);
                if (match) {
                    const valor = parseInt(match[1]) || 0;
                    // Desvantagens são negativas
                    desvantagensValor = Math.abs(valor);
                    break;
                }
            }
        }
        
        // Atualizar estado
        dashboardEstado.gastos.vantagens = vantagensValor;
        dashboardEstado.pontos.desvantagensAtuais = desvantagensValor;
        dashboardEstado.gastos.desvantagens = desvantagensValor;
        
        recalcualarTotalGastos();
        atualizarDisplayPontos();
        atualizarDisplayGastos();
        
    } catch (error) {
        console.log('Erro ao puxar vantagens:', error);
    }
}

function puxarDadosPericias() {
    try {
        const seletores = [
            '#pontos-pericias-total',
            '#pts-total',
            '.pericias-total',
            '[data-total="pericias"]'
        ];
        
        let periciasValor = 0;
        
        for (const seletor of seletores) {
            const elemento = document.querySelector(seletor);
            if (elemento) {
                const texto = elemento.textContent;
                // Tentar diferentes formatos: "[10 pts]", "(10 pts)", "10 pts"
                const match = texto.match(/(\d+)\s*pts/);
                if (match) {
                    periciasValor = parseInt(match[1]) || 0;
                    break;
                }
            }
        }
        
        dashboardEstado.gastos.pericias = periciasValor;
        recalcualarTotalGastos();
        atualizarDisplayGastos();
        
    } catch (error) {
        console.log('Erro ao puxar perícias:', error);
    }
}

function puxarDadosMagias() {
    try {
        const seletores = [
            '#total-gasto-magia',
            '#pontos-magia-total',
            '.magia-total',
            '[data-total="magia"]'
        ];
        
        let magiasValor = 0;
        
        for (const seletor of seletores) {
            const elemento = document.querySelector(seletor);
            if (elemento) {
                const texto = elemento.textContent;
                const match = texto.match(/(\d+)/);
                if (match) {
                    magiasValor = parseInt(match[1]) || 0;
                    break;
                }
            }
        }
        
        dashboardEstado.gastos.magias = magiasValor;
        recalcualarTotalGastos();
        atualizarDisplayGastos();
        
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
    // Recalcular total de pontos gastos
    const { atributos, vantagens, pericias, magias, desvantagens } = dashboardEstado.gastos;
    
    // Desvantagens são negativas, então subtraímos
    const total = atributos + vantagens + pericias + magias - desvantagens;
    dashboardEstado.pontos.gastos = Math.max(total, 0);
    dashboardEstado.pontos.saldo = dashboardEstado.pontos.total - dashboardEstado.pontos.gastos;
    
    // Atualizar total de gastos
    dashboardEstado.gastos.total = total;
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
    
    highlightElement('statusAparencia');
    highlightElement('statusRiqueza');
    highlightElement('statusSaldo');
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
        if (Math.abs(dashboardEstado.pontos.desvantagensAtuais) > Math.abs(dashboardEstado.pontos.limiteDesvantagens)) {
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
    
    // Atualizar cada card individualmente
    const { atributos, vantagens, pericias, magias, desvantagens } = dashboardEstado.gastos;
    
    document.getElementById('gastosAtributos').textContent = atributos;
    document.getElementById('gastosVantagens').textContent = vantagens;
    document.getElementById('gastosPericias').textContent = pericias;
    document.getElementById('gastosMagias').textContent = magias;
    document.getElementById('gastosDesvantagens').textContent = desvantagens;
    
    // Calcular total (desvantagens são negativas)
    const total = atributos + vantagens + pericias + magias - desvantagens;
    dashboardEstado.gastos.total = total;
    
    // Atualizar total
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
    
    // Destacar elementos atualizados
    Object.values(ids).forEach(id => {
        highlightElement(id);
    });
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

function atualizarTodosDisplays() {
    atualizarDisplayAtributos();
    atualizarDisplayVitalidade();
    atualizarDisplayCaracteristicas();
    atualizarDisplayPontos();
    atualizarDisplayGastos();
    
    // Atualizar contador de descrição
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
            
            console.log('Estado do dashboard carregado');
        }
    } catch (error) {
        console.error('Erro ao carregar estado:', error);
    }
}

function salvarEstadoLocalStorage() {
    try {
        // Não salvar tudo, apenas dados persistentes
        const dadosParaSalvar = {
            pontos: {
                total: dashboardEstado.pontos.total,
                limiteDesvantagens: dashboardEstado.pontos.limiteDesvantagens
            },
            identificacao: dashboardEstado.identificacao,
            caracteristicas: dashboardEstado.caracteristicas
        };
        
        localStorage.setItem('dashboard_estado', JSON.stringify(dadosParaSalvar));
    } catch (error) {
        console.error('Erro ao salvar estado:', error);
    }
}

// ===== 9. INICIALIZAÇÃO COMPLETA =====
function inicializarDashboard() {
    console.log('🚀 Inicializando Dashboard - Monitoramento Ativo');
    
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
    
    // Configurar salvamento automático
    setInterval(salvarEstadoLocalStorage, 10000); // Salvar a cada 10 segundos
    
    // Adicionar indicador de monitoramento ativo
    adicionarIndicadorMonitoramento();
    
    console.log('✅ Dashboard inicializado com monitoramento ativo');
}

function adicionarIndicadorMonitoramento() {
    const indicador = document.createElement('div');
    indicador.className = 'dashboard-monitoring';
    indicador.innerHTML = '<i class="fas fa-sync-alt"></i> Monitoramento Ativo';
    indicador.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: rgba(46, 204, 113, 0.9);
        color: white;
        padding: 8px 15px;
        border-radius: 20px;
        font-size: 0.9rem;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(indicador);
}

// ===== 10. INJEÇÃO DE CSS =====
function injetarCSSDashboard() {
    const css = `
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
        display: inline-block;
    }
    
    /* Estilos para relacionamentos */
    .relacionamento-item {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 10px;
        margin-bottom: 8px;
        background: rgba(255, 255, 255, 0.1);
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
        background: rgba(255,255,255,0.2);
        border-radius: 3px;
        font-size: 0.85em;
    }
    
    .relacionamento-descricao {
        font-size: 0.9em;
        color: rgba(255,255,255,0.8);
        margin-top: 5px;
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
    
    /* Estilos para inputs de bônus */
    .positivo {
        color: #27ae60 !important;
        font-weight: bold;
    }
    
    .negativo {
        color: #e74c3c !important;
        font-weight: bold;
    }
    
    /* Foto do personagem */
    .foto-container {
        position: relative;
        width: 200px;
        height: 250px;
        border-radius: 10px;
        overflow: hidden;
        border: 3px solid #2c3e50;
        cursor: pointer;
        background: #1a252f;
    }
    
    .foto-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: rgba(255,255,255,0.5);
    }
    
    .foto-preview {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .foto-upload-input {
        display: none;
    }
    
    .foto-acoes {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }
    
    .btn-foto {
        flex: 1;
        padding: 8px;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
    }
    
    .btn-foto.btn-remover {
        background: #e74c3c;
    }
    
    .btn-foto:hover {
        opacity: 0.9;
    }
    `;
    
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}

// ===== 11. INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    // Injetar CSS
    injetarCSSDashboard();
    
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

// ===== 12. EXPORTAÇÃO DE FUNÇÕES =====
window.inicializarDashboard = inicializarDashboard;
window.dashboardEstado = dashboardEstado;
window.removerRelacionamento = removerRelacionamento;

// Exportar funções para outros sistemas
window.obterEstadoDashboard = function() {
    return dashboardEstado;
};

console.log('📊 Dashboard JS carregado com sucesso!');
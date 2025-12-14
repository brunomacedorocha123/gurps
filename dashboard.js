// dashboard.js - VERSÃO LIMPA COM SUPABASE
class DashboardSupabase {
    constructor() {
        this.estado = this.criarEstadoInicial();
        this.supabase = window.supabase;
        this.fotoTemporaria = null;
    }

    criarEstadoInicial() {
        return {
            pontos: {
                total: 150,
                gastosAtributos: 0,
                gastosVantagens: 0,
                gastosPericias: 0,
                gastosMagias: 0,
                gastosIdiomas: 0,
                gastosTecnicas: 0,
                desvantagensVantagens: 0,
                aparenciaDesvantagens: 0,
                riquezaDesvantagens: 0,
                riquezaVantagens: 0,
                caracteristicasFisicasDesvantagens: 0,
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
                nome: '',
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
    }

    // ===== SISTEMA DE FOTO =====
    configurarSistemaFoto() {
        const fotoUpload = document.getElementById('fotoUpload');
        const fotoPreview = document.getElementById('fotoPreview');
        const fotoPlaceholder = document.getElementById('fotoPlaceholder');
        const btnRemoverFoto = document.getElementById('btnRemoverFoto');

        if (!fotoUpload || !fotoPreview) return;

        // Armazenar a foto em memória
        this.fotoTemporaria = null;

        fotoUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    fotoPreview.src = e.target.result;
                    fotoPreview.style.display = 'block';
                    if (fotoPlaceholder) fotoPlaceholder.style.display = 'none';
                    if (btnRemoverFoto) btnRemoverFoto.style.display = 'inline-block';
                    
                    // Armazenar a foto para salvar depois
                    this.fotoTemporaria = {
                        file: file,
                        dataUrl: e.target.result
                    };
                };
                reader.readAsDataURL(file);
            }
        });

        if (btnRemoverFoto) {
            btnRemoverFoto.addEventListener('click', () => {
                fotoPreview.src = '';
                fotoPreview.style.display = 'none';
                if (fotoPlaceholder) fotoPlaceholder.style.display = 'flex';
                btnRemoverFoto.style.display = 'none';
                fotoUpload.value = '';
                this.fotoTemporaria = null;
            });
        }
    }

    // Obter a foto para salvar
    getFotoParaSalvar() {
        return this.fotoTemporaria;
    }

    // ===== SISTEMA DE IDENTIFICAÇÃO =====
    configurarCamposIdentificacao() {
        const campos = ['charName', 'racaPersonagem', 'classePersonagem', 'nivelPersonagem', 'descricaoPersonagem'];
        
        campos.forEach(campoId => {
            const campo = document.getElementById(campoId);
            if (campo) {
                campo.addEventListener('input', () => {
                    // Atualizar estado local
                    if (campoId === 'charName') {
                        this.estado.identificacao.nome = campo.value;
                    } else if (campoId === 'racaPersonagem') {
                        this.estado.identificacao.raca = campo.value;
                    } else if (campoId === 'classePersonagem') {
                        this.estado.identificacao.classe = campo.value;
                    } else if (campoId === 'nivelPersonagem') {
                        this.estado.identificacao.nivel = campo.value;
                    } else if (campoId === 'descricaoPersonagem') {
                        this.estado.identificacao.descricao = campo.value;
                    }
                    
                    if (campoId === 'descricaoPersonagem') {
                        this.atualizarContadorDescricao();
                    }
                });
            }
        });
    }

    atualizarContadorDescricao() {
        const textarea = document.getElementById('descricaoPersonagem');
        const contador = document.getElementById('contadorDescricao');
        if (textarea && contador) {
            contador.textContent = textarea.value.length;
        }
    }

    // ===== SISTEMA DE PONTOS =====
    configurarControlePontos() {
        const pontosTotaisInput = document.getElementById('pontosTotaisDashboard');
        const limiteDesvantagensInput = document.getElementById('limiteDesvantagens');
        
        if (pontosTotaisInput) {
            pontosTotaisInput.addEventListener('change', () => {
                const valor = parseInt(pontosTotaisInput.value) || 150;
                this.estado.pontos.total = valor;
                this.calcularSaldoDisponivel();
                this.atualizarDisplayPontos();
            });
        }
        
        if (limiteDesvantagensInput) {
            limiteDesvantagensInput.addEventListener('change', () => {
                const valor = parseInt(limiteDesvantagensInput.value) || -50;
                this.estado.pontos.limiteDesvantagens = valor;
                this.atualizarDisplayPontos();
            });
        }
    }

    // ===== MONITORAMENTO DE ATRIBUTOS =====
    monitorarAtributos() {
        this.puxarValoresAtributos();
        
        // Monitorar a cada segundo
        setInterval(() => {
            this.puxarValoresAtributos();
        }, 1000);
    }

    puxarValoresAtributos() {
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
                
                this.estado.atributos.ST = ST;
                this.estado.atributos.DX = DX;
                this.estado.atributos.IQ = IQ;
                this.estado.atributos.HT = HT;
                
                this.calcularCustoAtributos(ST, DX, IQ, HT);
            }
            
            this.atualizarDisplayAtributos();
            this.atualizarDisplayVitalidade();
            
        } catch (error) {
            // Silencioso
        }
    }

    calcularCustoAtributos(ST, DX, IQ, HT) {
        const custoST = (ST - 10) * 10;
        const custoDX = (DX - 10) * 20;
        const custoIQ = (IQ - 10) * 20;
        const custoHT = (HT - 10) * 10;
        
        this.estado.pontos.gastosAtributos = custoST + custoDX + custoIQ + custoHT;
        this.calcularSaldoDisponivel();
    }

    // ===== MONITORAMENTO DE OUTRAS ABAS =====
    monitorarOutrasAbas() {
        this.puxarTodosDados();
        
        setInterval(() => {
            this.puxarTodosDados();
        }, 1500);
    }

    puxarTodosDados() {
        this.puxarDadosVantagensDesvantagens();
        this.puxarDadosPericias();
        this.puxarDadosMagias();
        this.puxarDadosIdiomas();
        this.puxarDadosCaracteristicasFisicas();
        this.puxarDadosCaracteristicas();
        this.puxarDadosAparencia();
        this.puxarDadosRiqueza();
        this.puxarDadosTecnicas();
        
        this.calcularTotalDesvantagens();
        this.atualizarDisplayResumoGastos();
        this.atualizarDisplayPontos();
    }

    puxarDadosVantagensDesvantagens() {
        try {
            const totalVantagensElement = document.getElementById('total-vantagens');
            if (totalVantagensElement) {
                const texto = totalVantagensElement.textContent;
                const match = texto.match(/([+-]?\d+)/);
                if (match) {
                    const valor = parseInt(match[1]) || 0;
                    this.estado.pontos.gastosVantagens = valor > 0 ? valor : 0;
                    this.estado.pontos.desvantagensVantagens = valor < 0 ? Math.abs(valor) : 0;
                }
            }
        } catch (error) {
            // Silencioso
        }
    }

    puxarDadosPericias() {
        try {
            const pontosPericiasTotalElement = document.getElementById('pontos-pericias-total');
            if (pontosPericiasTotalElement) {
                const texto = pontosPericiasTotalElement.textContent;
                const match = texto.match(/(\d+)/);
                if (match) {
                    this.estado.pontos.gastosPericias = parseInt(match[1]) || 0;
                }
            }
        } catch (error) {
            // Silencioso
        }
    }

    puxarDadosMagias() {
        try {
            const totalGastoMagiaElement = document.getElementById('total-gasto-magia');
            if (totalGastoMagiaElement) {
                const texto = totalGastoMagiaElement.textContent;
                const match = texto.match(/(\d+)/);
                if (match) {
                    this.estado.pontos.gastosMagias = parseInt(match[1]) || 0;
                }
            }
        } catch (error) {
            // Silencioso
        }
    }

    puxarDadosIdiomas() {
        try {
            const badgeIdiomas = document.getElementById('pontosIdiomas');
            if (badgeIdiomas) {
                const texto = badgeIdiomas.textContent;
                const match = texto.match(/([+-]?\d+)/);
                if (match) {
                    const pontos = parseInt(match[1]) || 0;
                    this.estado.pontos.gastosIdiomas = pontos > 0 ? pontos : 0;
                }
            }
        } catch (error) {
            // Silencioso
        }
    }

    puxarDadosCaracteristicasFisicas() {
        try {
            const badgeCaracteristicas = document.getElementById('pontosCaracteristicas');
            if (badgeCaracteristicas) {
                const texto = badgeCaracteristicas.textContent;
                const match = texto.match(/([+-]?\d+)/);
                if (match) {
                    const pontos = parseInt(match[1]) || 0;
                    this.estado.pontos.caracteristicasFisicasDesvantagens = pontos < 0 ? Math.abs(pontos) : 0;
                }
            }
        } catch (error) {
            // Silencioso
        }
    }

    puxarDadosAparencia() {
        try {
            const selectAparencia = document.getElementById('nivelAparencia');
            if (selectAparencia) {
                const valor = parseInt(selectAparencia.value) || 0;
                this.estado.pontos.aparenciaDesvantagens = valor < 0 ? Math.abs(valor) : 0;
            }
        } catch (error) {
            // Silencioso
        }
    }

    puxarDadosRiqueza() {
        try {
            const selectRiqueza = document.getElementById('nivelRiqueza');
            if (selectRiqueza) {
                const valor = parseInt(selectRiqueza.value) || 0;
                
                if (valor < 0) {
                    this.estado.pontos.riquezaDesvantagens = Math.abs(valor);
                    this.estado.pontos.riquezaVantagens = 0;
                } else if (valor > 0) {
                    this.estado.pontos.riquezaDesvantagens = 0;
                    this.estado.pontos.riquezaVantagens = valor;
                } else {
                    this.estado.pontos.riquezaDesvantagens = 0;
                    this.estado.pontos.riquezaVantagens = 0;
                }
            }
        } catch (error) {
            // Silencioso
        }
    }

    puxarDadosCaracteristicas() {
        try {
            const nivelAparenciaSelect = document.getElementById('nivelAparencia');
            if (nivelAparenciaSelect) {
                const texto = nivelAparenciaSelect.options[nivelAparenciaSelect.selectedIndex].text;
                const nome = texto.split('[')[0].trim();
                this.estado.caracteristicas.aparencia = nome;
            }
            
            const nivelRiquezaSelect = document.getElementById('nivelRiqueza');
            if (nivelRiquezaSelect) {
                const texto = nivelRiquezaSelect.options[nivelRiquezaSelect.selectedIndex].text;
                const nome = texto.split('[')[0].trim();
                this.estado.caracteristicas.riqueza = nome;
                
                const valor = parseInt(nivelRiquezaSelect.value) || 0;
                const rendaBase = 1000;
                const multiplicadores = {
                    '-25': 0, '-15': 0.2, '-10': 0.5, '0': 1,
                    '10': 2, '20': 5, '30': 20, '50': 100
                };
                const multiplicador = multiplicadores[valor.toString()] || 1;
                const renda = Math.floor(rendaBase * multiplicador);
                
                this.estado.caracteristicas.saldo = `$${renda.toLocaleString('en-US')}`;
            }
            
            this.atualizarDisplayCaracteristicas();
            
        } catch (error) {
            // Silencioso
        }
    }

    puxarDadosTecnicas() {
        try {
            // Técnicas agora serão monitoradas de outra forma
            // Pode ser implementado posteriormente
            this.estado.pontos.gastosTecnicas = 0;
        } catch (error) {
            // Silencioso
        }
    }

    // ===== CÁLCULOS =====
    calcularTotalDesvantagens() {
        const total = 
            this.estado.pontos.desvantagensVantagens +
            this.estado.pontos.aparenciaDesvantagens +
            this.estado.pontos.riquezaDesvantagens +
            this.estado.pontos.caracteristicasFisicasDesvantagens;
        
        this.estado.pontos.totalDesvantagens = total;
        return total;
    }

    calcularSaldoDisponivel() {
        this.calcularTotalDesvantagens();
        
        const { 
            total, 
            gastosAtributos, 
            gastosVantagens, 
            gastosPericias, 
            gastosMagias,
            gastosIdiomas,
            gastosTecnicas,
            riquezaVantagens,
            totalDesvantagens 
        } = this.estado.pontos;
        
        // Incluir aparência positiva
        const selectAparencia = document.getElementById('nivelAparencia');
        let aparenciaVantagens = 0;
        if (selectAparencia) {
            const valorAparencia = parseInt(selectAparencia.value) || 0;
            if (valorAparencia > 0) {
                aparenciaVantagens = valorAparencia;
            }
        }
        
        const vantagensTotais = gastosVantagens + riquezaVantagens + gastosIdiomas + aparenciaVantagens;
        const gastosTotais = gastosAtributos + vantagensTotais + 
                            (gastosPericias + gastosTecnicas) + gastosMagias;
        
        this.estado.pontos.saldoDisponivel = total - gastosTotais + totalDesvantagens;
        return this.estado.pontos.saldoDisponivel;
    }

    // ===== ATUALIZAÇÃO DE DISPLAY =====
    atualizarDisplayAtributos() {
        const { ST, DX, IQ, HT } = this.estado.atributos;
        
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

    atualizarDisplayVitalidade() {
        const { PV, PF } = this.estado.atributos;
        
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

    atualizarDisplayCaracteristicas() {
        const { aparencia, riqueza, saldo } = this.estado.caracteristicas;
        
        const aparenciaElement = document.getElementById('statusAparencia');
        const riquezaElement = document.getElementById('statusRiqueza');
        const saldoElement = document.getElementById('statusSaldo');
        
        if (aparenciaElement) aparenciaElement.textContent = aparencia;
        if (riquezaElement) riquezaElement.textContent = riqueza;
        if (saldoElement) saldoElement.textContent = saldo;
    }

    atualizarDisplayPontos() {
        const { 
            total, 
            gastosAtributos, 
            gastosVantagens, 
            gastosPericias, 
            gastosMagias,
            gastosIdiomas,
            gastosTecnicas,
            riquezaVantagens,
            totalDesvantagens,
            saldoDisponivel, 
            limiteDesvantagens 
        } = this.estado.pontos;
        
        // Incluir aparência positiva
        const selectAparencia = document.getElementById('nivelAparencia');
        let aparenciaVantagens = 0;
        if (selectAparencia) {
            const valorAparencia = parseInt(selectAparencia.value) || 0;
            if (valorAparencia > 0) {
                aparenciaVantagens = valorAparencia;
            }
        }
        
        const vantagensTotais = gastosVantagens + riquezaVantagens + gastosIdiomas + aparenciaVantagens;
        const pontosGastosDashboard = gastosAtributos + vantagensTotais + 
                                     (gastosPericias + gastosTecnicas) + gastosMagias;
        
        // Pontos Gastos
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
        
        // Desvantagens Atuais
        const desvantagensElement = document.getElementById('desvantagensAtuais');
        if (desvantagensElement) {
            desvantagensElement.textContent = totalDesvantagens;
            
            if (totalDesvantagens > Math.abs(limiteDesvantagens)) {
                desvantagensElement.style.color = '#e74c3c';
            } else if (totalDesvantagens > Math.abs(limiteDesvantagens) * 0.8) {
                desvantagensElement.style.color = '#f39c12';
            } else {
                desvantagensElement.style.color = '#9b59b6';
            }
        }
    }

    atualizarDisplayResumoGastos() {
        const { 
            gastosAtributos, 
            gastosVantagens, 
            gastosPericias, 
            gastosMagias,
            gastosIdiomas,
            gastosTecnicas,
            riquezaVantagens,
            totalDesvantagens 
        } = this.estado.pontos;
        
        // Incluir aparência positiva
        const selectAparencia = document.getElementById('nivelAparencia');
        let aparenciaVantagens = 0;
        if (selectAparencia) {
            const valorAparencia = parseInt(selectAparencia.value) || 0;
            if (valorAparencia > 0) {
                aparenciaVantagens = valorAparencia;
            }
        }
        
        const vantagensTotais = gastosVantagens + riquezaVantagens + gastosIdiomas + aparenciaVantagens;
        const totalPericiasETecnicas = gastosPericias + gastosTecnicas;
        
        const elementos = {
            gastosAtributos: document.getElementById('gastosAtributos'),
            gastosVantagens: document.getElementById('gastosVantagens'),
            gastosPericias: document.getElementById('gastosPericias'),
            gastosMagias: document.getElementById('gastosMagias'),
            gastosDesvantagens: document.getElementById('gastosDesvantagens'),
            gastosTotal: document.getElementById('gastosTotal')
        };
        
        if (elementos.gastosAtributos) {
            elementos.gastosAtributos.textContent = gastosAtributos;
        }
        
        if (elementos.gastosVantagens) {
            elementos.gastosVantagens.textContent = vantagensTotais;
        }
        
        if (elementos.gastosPericias) {
            elementos.gastosPericias.textContent = totalPericiasETecnicas;
        }
        
        if (elementos.gastosMagias) {
            elementos.gastosMagias.textContent = gastosMagias;
        }
        
        if (elementos.gastosDesvantagens) {
            elementos.gastosDesvantagens.textContent = totalDesvantagens;
            elementos.gastosDesvantagens.style.color = '#9b59b6';
        }
        
        // Total Gastos
        const gastosTotais = gastosAtributos + vantagensTotais + totalPericiasETecnicas + gastosMagias;
        const gastosLiquidos = gastosTotais - totalDesvantagens;
        
        if (elementos.gastosTotal) {
            elementos.gastosTotal.textContent = gastosLiquidos;
            
            if (gastosLiquidos < 0) {
                elementos.gastosTotal.style.color = '#9b59b6';
            } else if (gastosLiquidos > this.estado.pontos.total) {
                elementos.gastosTotal.style.color = '#e74c3c';
            } else if (gastosLiquidos > this.estado.pontos.total * 0.8) {
                elementos.gastosTotal.style.color = '#f39c12';
            } else {
                elementos.gastosTotal.style.color = '#27ae60';
            }
        }
    }

    // ===== COLETAR DADOS PARA SALVAR =====
    coletarDadosParaSalvar() {
        // Coletar dados básicos do formulário
        const nome = document.getElementById('charName')?.value || 'Novo Personagem';
        const raca = document.getElementById('racaPersonagem')?.value || '';
        const classe = document.getElementById('classePersonagem')?.value || '';
        const nivel = document.getElementById('nivelPersonagem')?.value || '';
        const descricao = document.getElementById('descricaoPersonagem')?.value || '';
        
        // Atualizar estado com dados atuais
        this.estado.identificacao.nome = nome;
        this.estado.identificacao.raca = raca;
        this.estado.identificacao.classe = classe;
        this.estado.identificacao.nivel = nivel;
        this.estado.identificacao.descricao = descricao;
        
        // Retornar dados estruturados
        return {
            identificacao: this.estado.identificacao,
            pontos: this.estado.pontos,
            atributos: this.estado.atributos,
            caracteristicas: this.estado.caracteristicas,
            relacionamentos: this.estado.relacionamentos,
            foto: this.fotoTemporaria
        };
    }

    // ===== INICIALIZAÇÃO =====
    inicializar() {
        this.configurarSistemaFoto();
        this.configurarCamposIdentificacao();
        this.configurarControlePontos();
        
        this.monitorarAtributos();
        this.monitorarOutrasAbas();
        
        // Inicializar displays
        setTimeout(() => {
            this.atualizarDisplayAtributos();
            this.atualizarDisplayVitalidade();
            this.atualizarDisplayCaracteristicas();
            this.atualizarDisplayPontos();
            this.atualizarDisplayResumoGastos();
            this.atualizarContadorDescricao();
        }, 500);
    }
}

// Criar instância global
window.dashboard = new DashboardSupabase();

// Inicialização automática quando a aba dashboard estiver ativa
document.addEventListener('DOMContentLoaded', function() {
    const dashboardTab = document.getElementById('dashboard');
    if (dashboardTab && dashboardTab.classList.contains('active')) {
        setTimeout(() => window.dashboard.inicializar(), 300);
    }
    
    // Observar mudanças de aba
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'dashboard' && tab.classList.contains('active')) {
                    setTimeout(() => window.dashboard.inicializar(), 300);
                }
            }
        });
    });
    
    document.querySelectorAll('.tab-content').forEach(tab => {
        observer.observe(tab, { attributes: true });
    });
});
// catalogo-equipamentos.js
// Sistema de catálogo de equipamentos com eras (medieval e moderna)

class CatalogoEquipamentos {
    constructor() {
        this.catalogo = {
            // ERA MEDIEVAL/FANTASIA
            "medieval": {
                // ARMAS CORPO-A-CORPO MEDIEVAIS (IDs 800-849)
                "armasCorpoACorpo": [
                    {
                        id: "M800",
                        nome: "Machado GEB+2",
                        tipo: "arma-cc",
                        era: "medieval",
                        nt: 0,
                        dano: "GEB+2",
                        tipoDano: "corte",
                        alcance: "1",
                        peso: 2.0,
                        st: 11,
                        custo: 50,
                        maos: 1,
                        quantificavel: false,
                        descricao: "Machado de batalha simples"
                    },
                    {
                        id: "M801",
                        nome: "Espada Longa",
                        tipo: "arma-cc",
                        era: "medieval",
                        nt: 0,
                        dano: "2d+2",
                        tipoDano: "corte",
                        alcance: "1,2",
                        peso: 3.0,
                        st: 10,
                        custo: 600,
                        maos: 1.5,
                        quantificavel: false,
                        descricao: "Espada longa versátil"
                    },
                    {
                        id: "M802",
                        nome: "Lança",
                        tipo: "arma-cc",
                        era: "medieval",
                        nt: 0,
                        dano: "1d+2",
                        tipoDano: "perfuração",
                        alcance: "1,2",
                        peso: 4.0,
                        st: 10,
                        custo: 400,
                        maos: 2,
                        quantificavel: false,
                        descricao: "Lança de combate"
                    },
                    {
                        id: "M803",
                        nome: "Martelo de Guerra",
                        tipo: "arma-cc",
                        era: "medieval",
                        nt: 0,
                        dano: "2d+1",
                        tipoDano: "contusão",
                        alcance: "1",
                        peso: 5.0,
                        st: 12,
                        custo: 300,
                        maos: 2,
                        quantificavel: false,
                        descricao: "Martelo pesado de guerra"
                    },
                    {
                        id: "M804",
                        nome: "Adaga",
                        tipo: "arma-cc",
                        era: "medieval",
                        nt: 0,
                        dano: "1d-2",
                        tipoDano: "perfuração",
                        alcance: "C,1",
                        peso: 0.5,
                        st: 5,
                        custo: 20,
                        maos: 1,
                        quantificavel: false,
                        descricao: "Adaga pequena e afiada"
                    },
                    {
                        id: "M805",
                        nome: "Maça",
                        tipo: "arma-cc",
                        era: "medieval",
                        nt: 0,
                        dano: "1d+3",
                        tipoDano: "contusão",
                        alcance: "1",
                        peso: 3.0,
                        st: 11,
                        custo: 40,
                        maos: 1,
                        quantificavel: false,
                        descricao: "Maça de guerra"
                    }
                ],

                // ARMAS À DISTÂNCIA MEDIEVAIS (IDs 850-899)
                "armasDistancia": [
                    {
                        id: "M850",
                        nome: "Arco Curto",
                        tipo: "arma-dist",
                        era: "medieval",
                        nt: 0,
                        dano: "1d+1",
                        tipoDano: "perfuração",
                        prec: 0,
                        alcance: "150/200",
                        peso: 2.0,
                        st: 9,
                        custo: 150,
                        magnit: "Flechas",
                        maos: 2,
                        quantificavel: false,
                        descricao: "Arco curto para combate"
                    },
                    {
                        id: "M851",
                        nome: "Besta",
                        tipo: "arma-dist",
                        era: "medieval",
                        nt: 0,
                        dano: "1d+2",
                        tipoDano: "perfuração",
                        prec: 0,
                        alcance: "180/240",
                        peso: 3.0,
                        st: 10,
                        custo: 300,
                        magnit: "Virote",
                        maos: 2,
                        quantificavel: false,
                        descricao: "Besta de repetição"
                    },
                    {
                        id: "M852",
                        nome: "Funda",
                        tipo: "arma-dist",
                        era: "medieval",
                        nt: 0,
                        dano: "1d-1",
                        tipoDano: "contusão",
                        prec: 0,
                        alcance: "100/150",
                        peso: 0.5,
                        st: 7,
                        custo: 20,
                        magnit: "Pedras",
                        maos: 1,
                        quantificavel: true,
                        descricao: "Funda simples"
                    },
                    {
                        id: "M853",
                        nome: "Arco Longo",
                        tipo: "arma-dist",
                        era: "medieval",
                        nt: 0,
                        dano: "1d+2",
                        tipoDano: "perfuração",
                        prec: 0,
                        alcance: "200/280",
                        peso: 3.0,
                        st: 11,
                        custo: 200,
                        magnit: "Flechas",
                        maos: 2,
                        quantificavel: false,
                        descricao: "Arco longo de precisão"
                    }
                ],

                // ARMADURAS MEDIEVAIS (IDs 900-949)
                "armaduras": [
                    {
                        id: "M900",
                        nome: "Couro Batido",
                        tipo: "armadura",
                        era: "medieval",
                        nt: 0,
                        local: "Torso",
                        rd: 2,
                        peso: 5.0,
                        custo: 200,
                        cl: 4,
                        maos: 0,
                        quantificavel: false,
                        descricao: "Armadura de couro endurecido"
                    },
                    {
                        id: "M901",
                        nome: "Cota de Malha",
                        tipo: "armadura",
                        era: "medieval",
                        nt: 0,
                        local: "Torso",
                        rd: 4,
                        peso: 12.0,
                        custo: 800,
                        cl: 4,
                        maos: 0,
                        quantificavel: false,
                        descricao: "Cota de anéis entrelaçados"
                    },
                    {
                        id: "M902",
                        nome: "Elmo de Aço",
                        tipo: "armadura",
                        era: "medieval",
                        nt: 0,
                        local: "Cabeça",
                        rd: 4,
                        peso: 3.0,
                        custo: 400,
                        cl: 4,
                        maos: 0,
                        quantificavel: false,
                        descricao: "Elmo de proteção completa"
                    },
                    {
                        id: "M903",
                        nome: "Braçadeiras de Couro",
                        tipo: "armadura",
                        era: "medieval",
                        nt: 0,
                        local: "Braços",
                        rd: 1,
                        peso: 1.0,
                        custo: 30,
                        cl: 4,
                        maos: 0,
                        quantificavel: false,
                        descricao: "Proteção para braços"
                    },
                    {
                        id: "M904",
                        nome: "Armadura de Placas",
                        tipo: "armadura",
                        era: "medieval",
                        nt: 0,
                        local: "Corpo Inteiro",
                        rd: 6,
                        peso: 25.0,
                        custo: 5000,
                        cl: 4,
                        maos: 0,
                        quantificavel: false,
                        descricao: "Armadura completa de placas de aço"
                    }
                ],

                // ESCUDOS MEDIEVAIS (IDs 950-999)
                "escudos": [
                    {
                        id: "M950",
                        nome: "Escudo Pequeno",
                        tipo: "escudo",
                        era: "medieval",
                        nt: 0,
                        bd: "+1",
                        custo: 50,
                        rdpv: "RD 7",
                        cl: 4,
                        peso: 2.0,
                        maos: 1,
                        quantificavel: false,
                        descricao: "Escudo leve para defesa"
                    },
                    {
                        id: "M951",
                        nome: "Escudo Médio",
                        tipo: "escudo",
                        era: "medieval",
                        nt: 0,
                        bd: "+2",
                        custo: 150,
                        rdpv: "PV 30",
                        cl: 4,
                        peso: 5.0,
                        maos: 1,
                        quantificavel: false,
                        descricao: "Escudo versátil"
                    },
                    {
                        id: "M952",
                        nome: "Escudo Grande",
                        tipo: "escudo",
                        era: "medieval",
                        nt: 0,
                        bd: "+3",
                        custo: 300,
                        rdpv: "PV 45",
                        cl: 4,
                        peso: 8.0,
                        maos: 1,
                        quantificavel: false,
                        descricao: "Escudo de proteção máxima"
                    },
                    {
                        id: "M953",
                        nome: "Broquel",
                        tipo: "escudo",
                        era: "medieval",
                        nt: 0,
                        bd: "+1",
                        custo: 25,
                        rdpv: "RD 5",
                        cl: 4,
                        peso: 1.0,
                        maos: 1,
                        quantificavel: false,
                        descricao: "Escudo pequeno e ágil"
                    }
                ],

                // EQUIPAMENTOS GERAIS MEDIEVAIS (IDs 1000-1049)
                "equipamentosGerais": [
                    {
                        id: "M1000",
                        nome: "Mochila (40kg)",
                        tipo: "geral",
                        era: "medieval",
                        categoria: "Transporte",
                        custo: 60,
                        peso: 2.0,
                        cl: 4,
                        maos: 0,
                        quantificavel: false,
                        descricao: "Mochila de couro"
                    },
                    {
                        id: "M1001",
                        nome: "Corda (10m)",
                        tipo: "geral",
                        era: "medieval",
                        categoria: "Sobrevivência",
                        custo: 25,
                        peso: 1.5,
                        cl: 4,
                        maos: 0,
                        quantificavel: true,
                        descricao: "Corda de cânhamo"
                    },
                    {
                        id: "M1002",
                        nome: "Tochas (x3)",
                        tipo: "geral",
                        era: "medieval",
                        categoria: "Iluminação",
                        custo: 9,
                        peso: 1.0,
                        cl: 4,
                        maos: 1,
                        quantificavel: true,
                        descricao: "Tochas de madeira resinosa"
                    },
                    {
                        id: "M1003",
                        nome: "Kit de Primeiros Socorros",
                        tipo: "geral",
                        era: "medieval",
                        categoria: "Saúde",
                        custo: 50,
                        peso: 2.0,
                        cl: 4,
                        maos: 0,
                        quantificavel: true,
                        descricao: "Bandagens e ervas medicinais"
                    },
                    {
                        id: "M1004",
                        nome: "Água (1L)",
                        tipo: "geral",
                        era: "medieval",
                        categoria: "Sobrevivência",
                        custo: 1,
                        peso: 1.0,
                        cl: 4,
                        maos: 0,
                        quantificavel: true,
                        descricao: "Odre com água"
                    },
                    {
                        id: "M1005",
                        nome: "Rações (1 dia)",
                        tipo: "geral",
                        era: "medieval",
                        categoria: "Sobrevivência",
                        custo: 5,
                        peso: 0.5,
                        cl: 4,
                        maos: 0,
                        quantificavel: true,
                        descricao: "Rações de viagem"
                    }
                ]
            },

            // ERA MODERNA/CYBERPUNK
            "moderna": {
                // ARMAS CORPO-A-CORPO MODERNAS (IDs 2000-2049)
                "armasCorpoACorpo": [
                    {
                        id: "C2000",
                        nome: "Faca Tática",
                        tipo: "arma-cc",
                        era: "moderna",
                        nt: 0,
                        dano: "1d-1",
                        tipoDano: "corte",
                        alcance: "C,1",
                        peso: 0.3,
                        st: 5,
                        custo: 80,
                        maos: 1,
                        quantificavel: false,
                        descricao: "Faca de combate tático"
                    },
                    {
                        id: "C2001",
                        nome: "Tonfa",
                        tipo: "arma-cc",
                        era: "moderna",
                        nt: 0,
                        dano: "1d+1",
                        tipoDano: "contusão",
                        alcance: "1",
                        peso: 1.0,
                        st: 8,
                        custo: 120,
                        maos: 1,
                        quantificavel: false,
                        descricao: "Tonfa policial"
                    },
                    {
                        id: "C2002",
                        nome: "Katana",
                        tipo: "arma-cc",
                        era: "moderna",
                        nt: 0,
                        dano: "2d+3",
                        tipoDano: "corte",
                        alcance: "1,2",
                        peso: 2.5,
                        st: 10,
                        custo: 1200,
                        maos: 1.5,
                        quantificavel: false,
                        descricao: "Katana de alta qualidade"
                    },
                    {
                        id: "C2003",
                        nome: "Bastão Retrátil",
                        tipo: "arma-cc",
                        era: "moderna",
                        nt: 0,
                        dano: "1d+2",
                        tipoDano: "contusão",
                        alcance: "1",
                        peso: 1.2,
                        st: 9,
                        custo: 200,
                        maos: 1,
                        quantificavel: false,
                        descricao: "Bastão retrátil tático"
                    }
                ],

                // ARMAS À DISTÂNCIA MODERNAS (IDs 2050-2099)
                "armasDistancia": [
                    {
                        id: "C2050",
                        nome: "Pistola 9mm",
                        tipo: "arma-dist",
                        era: "moderna",
                        nt: 0,
                        dano: "2d+2",
                        tipoDano: "perfuração",
                        prec: 0,
                        alcance: "150/200",
                        peso: 1.0,
                        st: 9,
                        custo: 800,
                        magnit: "Munição 9mm",
                        maos: 1,
                        quantificavel: false,
                        descricao: "Pistola semiautomática"
                    },
                    {
                        id: "C2051",
                        nome: "Rifle de Assalto",
                        tipo: "arma-dist",
                        era: "moderna",
                        nt: 0,
                        dano: "5d",
                        tipoDano: "perfuração",
                        prec: 0,
                        alcance: "500/750",
                        peso: 3.5,
                        st: 10,
                        custo: 2500,
                        magnit: "Carregador 30 munições",
                        maos: 2,
                        quantificavel: false,
                        descricao: "Rifle de assalto automático"
                    },
                    {
                        id: "C2052",
                        nome: "Shotgun",
                        tipo: "arma-dist",
                        era: "moderna",
                        nt: 0,
                        dano: "4d",
                        tipoDano: "perfuração",
                        prec: 0,
                        alcance: "50/100",
                        peso: 3.0,
                        st: 10,
                        custo: 1200,
                        magnit: "Cartuchos",
                        maos: 2,
                        quantificavel: false,
                        descricao: "Espingarda de cano duplo"
                    },
                    {
                        id: "C2053",
                        nome: "Pistola Laser",
                        tipo: "arma-dist",
                        era: "moderna",
                        nt: 0,
                        dano: "3d",
                        tipoDano: "queimadura",
                        prec: 0,
                        alcance: "300/450",
                        peso: 1.5,
                        st: 8,
                        custo: 5000,
                        magnit: "Célula de Energia",
                        maos: 1,
                        quantificavel: false,
                        descricao: "Pistola de energia laser"
                    }
                ],

                // ARMADURAS MODERNAS (IDs 2100-2149)
                "armaduras": [
                    {
                        id: "C2100",
                        nome: "Colete Balístico",
                        tipo: "armadura",
                        era: "moderna",
                        nt: 0,
                        local: "Torso",
                        rd: 6,
                        peso: 4.0,
                        custo: 1200,
                        cl: 2,
                        maos: 0,
                        quantificavel: false,
                        descricao: "Colete à prova de balas"
                    },
                    {
                        id: "C2101",
                        nome: "Capacete Militar",
                        tipo: "armadura",
                        era: "moderna",
                        nt: 0,
                        local: "Cabeça",
                        rd: 4,
                        peso: 1.5,
                        custo: 500,
                        cl: 2,
                        maos: 0,
                        quantificavel: false,
                        descricao: "Capacete balístico"
                    },
                    {
                        id: "C2102",
                        nome: "Armadura Corporal Completa",
                        tipo: "armadura",
                        era: "moderna",
                        nt: 0,
                        local: "Corpo Inteiro",
                        rd: 8,
                        peso: 12.0,
                        custo: 8000,
                        cl: 3,
                        maos: 0,
                        quantificavel: false,
                        descricao: "Armadura militar completa"
                    },
                    {
                        id: "C2103",
                        nome: "Joelheiras e Cotoveleiras",
                        tipo: "armadura",
                        era: "moderna",
                        nt: 0,
                        local: "Braços, Pernas",
                        rd: 2,
                        peso: 1.0,
                        custo: 300,
                        cl: 2,
                        maos: 0,
                        quantificavel: false,
                        descricao: "Proteção para articulações"
                    }
                ],

                // ESCUDOS MODERNOS (IDs 2150-2199)
                "escudos": [
                    {
                        id: "C2150",
                        nome: "Escudo Anti-Motim",
                        tipo: "escudo",
                        era: "moderna",
                        nt: 0,
                        bd: "+3",
                        custo: 800,
                        rdpv: "PV 50",
                        cl: 3,
                        peso: 6.0,
                        maos: 1,
                        quantificavel: false,
                        descricao: "Escudo transparente anti-projéteis"
                    },
                    {
                        id: "C2151",
                        nome: "Escudo Balístico Portátil",
                        tipo: "escudo",
                        era: "moderna",
                        nt: 0,
                        bd: "+2",
                        custo: 1500,
                        rdpv: "PV 40",
                        cl: 3,
                        peso: 3.5,
                        maos: 1,
                        quantificavel: false,
                        descricao: "Escudo dobrável anti-balas"
                    }
                ],

                // EQUIPAMENTOS GERAIS MODERNOS (IDs 2200-2249)
                "equipamentosGerais": [
                    {
                        id: "C2200",
                        nome: "Mochila Tática (50kg)",
                        tipo: "geral",
                        era: "moderna",
                        categoria: "Transporte",
                        custo: 150,
                        peso: 1.5,
                        cl: 3,
                        maos: 0,
                        quantificavel: false,
                        descricao: "Mochila militar tática"
                    },
                    {
                        id: "C2201",
                        nome: "Lanterna LED",
                        tipo: "geral",
                        era: "moderna",
                        categoria: "Iluminação",
                        custo: 40,
                        peso: 0.3,
                        cl: 3,
                        maos: 1,
                        quantificavel: false,
                        descricao: "Lanterna de alta potência"
                    },
                    {
                        id: "C2202",
                        nome: "Kit Médico Avançado",
                        tipo: "geral",
                        era: "moderna",
                        categoria: "Saúde",
                        custo: 300,
                        peso: 2.0,
                        cl: 3,
                        maos: 0,
                        quantificavel: true,
                        descricao: "Kit médico completo"
                    },
                    {
                        id: "C2203",
                        nome: "Tablet",
                        tipo: "geral",
                        era: "moderna",
                        categoria: "Tecnologia",
                        custo: 800,
                        peso: 0.5,
                        cl: 4,
                        maos: 1,
                        quantificavel: false,
                        descricao: "Tablet com acesso à rede"
                    },
                    {
                        id: "C2204",
                        nome: "Ração de Combate (1 dia)",
                        tipo: "geral",
                        era: "moderna",
                        categoria: "Sobrevivência",
                        custo: 15,
                        peso: 0.4,
                        cl: 3,
                        maos: 0,
                        quantificavel: true,
                        descricao: "Ração militar nutritiva"
                    },
                    {
                        id: "C2205",
                        nome: "Garrafa Térmica",
                        tipo: "geral",
                        era: "moderna",
                        categoria: "Sobrevivência",
                        custo: 30,
                        peso: 0.6,
                        cl: 3,
                        maos: 0,
                        quantificavel: false,
                        descricao: "Garrafa que mantém temperatura"
                    }
                ]
            }
        };
        
        this.inicializado = false;
        this.tabelasInicializadas = false;
        
        console.log('✅ Catálogo construído com', this.obterTodosEquipamentos().length, 'equipamentos');
        
        // Inicializar quando o DOM estiver pronto
        this.inicializarQuandoPronto();
    }

    // INICIALIZAÇÃO
    inicializarQuandoPronto() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.inicializar();
            });
        } else {
            this.inicializar();
        }
    }

    inicializar() {
        console.log('🚀 Inicializando Catálogo de Equipamentos...');
        
        try {
            this.configurarFiltros();
            this.configurarBusca();
            this.inicializarTabelas();
            this.inicializado = true;
            
            console.log('✅ Catálogo inicializado com sucesso!');
            
            // Disparar evento para o sistema principal
            const evento = new CustomEvent('catalogoPronto', {
                detail: { catalogo: this }
            });
            document.dispatchEvent(evento);
            
        } catch (error) {
            console.error('❌ Erro ao inicializar catálogo:', error);
        }
    }

    // CONFIGURAÇÃO DE FILTROS E BUSCA
    configurarFiltros() {
        const filtroEra = document.getElementById('filtro-era');
        const filtroTipo = document.getElementById('filtro-tipo');
        
        if (filtroEra) {
            filtroEra.addEventListener('change', () => {
                this.aplicarFiltros();
            });
        }
        
        if (filtroTipo) {
            filtroTipo.addEventListener('change', () => {
                this.aplicarFiltros();
            });
        }
    }

    configurarBusca() {
        const buscaInput = document.getElementById('busca-catalogo');
        
        if (buscaInput) {
            // Busca em tempo real
            buscaInput.addEventListener('input', () => {
                this.aplicarFiltros();
            });
            
            // Limpar busca
            buscaInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    buscaInput.value = '';
                    this.aplicarFiltros();
                }
            });
        }
    }

    aplicarFiltros() {
        const eraSelecionada = document.getElementById('filtro-era')?.value || 'todas';
        const tipoSelecionado = document.getElementById('filtro-tipo')?.value || 'todas';
        const termoBusca = document.getElementById('busca-catalogo')?.value.toLowerCase() || '';
        
        // Esconder todas as categorias primeiro
        document.querySelectorAll('.categoria-section').forEach(section => {
            section.style.display = 'none';
        });
        
        let totalEquipamentos = 0;
        
        // Processar cada categoria
        const categorias = ['armasCorpoACorpo', 'armasDistancia', 'armaduras', 'escudos', 'equipamentosGerais'];
        const mapeamentoCategorias = {
            'armasCorpoACorpo': 'armas-cc',
            'armasDistancia': 'armas-dist',
            'armaduras': 'armaduras',
            'escudos': 'escudos',
            'equipamentosGerais': 'geral'
        };
        
        categorias.forEach(categoriaCatalogo => {
            const categoriaHTML = mapeamentoCategorias[categoriaCatalogo];
            const section = document.querySelector(`[data-category="${categoriaHTML}"]`);
            
            if (!section) return;
            
            // Filtrar equipamentos
            let equipamentosFiltrados = [];
            
            // Filtrar por era
            if (eraSelecionada === 'todas') {
                // Combinar equipamentos de ambas as eras
                equipamentosFiltrados = [
                    ...(this.catalogo.medieval[categoriaCatalogo] || []),
                    ...(this.catalogo.moderna[categoriaCatalogo] || [])
                ];
            } else {
                equipamentosFiltrados = this.catalogo[eraSelecionada][categoriaCatalogo] || [];
            }
            
            // Filtrar por tipo (se não for "todas")
            if (tipoSelecionado !== 'todas') {
                if (tipoSelecionado !== categoriaHTML) {
                    // Se a categoria não corresponder ao tipo selecionado, ocultar
                    return;
                }
            }
            
            // Filtrar por busca
            if (termoBusca) {
                equipamentosFiltrados = equipamentosFiltrados.filter(equipamento => 
                    equipamento.nome.toLowerCase().includes(termoBusca) ||
                    equipamento.descricao.toLowerCase().includes(termoBusca)
                );
            }
            
            // Atualizar contador
            const countElement = document.getElementById(`count-${categoriaHTML}`);
            if (countElement) {
                countElement.textContent = equipamentosFiltrados.length;
            }
            
            // Mostrar/ocultar seção
            if (equipamentosFiltrados.length > 0) {
                section.style.display = 'block';
                totalEquipamentos += equipamentosFiltrados.length;
                
                // Atualizar tabela
                this.atualizarTabelaCategoria(categoriaHTML, equipamentosFiltrados);
            } else {
                section.style.display = 'none';
            }
        });
        
        // Mostrar mensagem se não houver resultados
        this.mostrarMensagemSemResultados(totalEquipamentos === 0);
    }

    mostrarMensagemSemResultados(semResultados) {
        let mensagemContainer = document.getElementById('mensagem-sem-resultados');
        
        if (semResultados) {
            if (!mensagemContainer) {
                mensagemContainer = document.createElement('div');
                mensagemContainer.id = 'mensagem-sem-resultados';
                mensagemContainer.className = 'mensagem-sem-resultados';
                mensagemContainer.innerHTML = `
                    <i class="fas fa-search fa-2x"></i>
                    <h4>Nenhum equipamento encontrado</h4>
                    <p>Tente ajustar os filtros ou a busca</p>
                `;
                
                const container = document.querySelector('.categorias-container');
                if (container) {
                    container.prepend(mensagemContainer);
                }
            }
        } else if (mensagemContainer) {
            mensagemContainer.remove();
        }
    }

    // TABELAS
    inicializarTabelas() {
        if (this.tabelasInicializadas) return;
        
        console.log('📊 Inicializando tabelas do catálogo...');
        
        // Preencher contadores iniciais
        this.atualizarContadores();
        
        // Aplicar filtros iniciais
        this.aplicarFiltros();
        
        this.tabelasInicializadas = true;
    }

    atualizarContadores() {
        const categorias = {
            'armas-cc': ['armasCorpoACorpo'],
            'armas-dist': ['armasDistancia'],
            'armaduras': ['armaduras'],
            'escudos': ['escudos'],
            'geral': ['equipamentosGerais']
        };
        
        Object.entries(categorias).forEach(([categoriaHTML, categoriasCatalogo]) => {
            let total = 0;
            
            categoriasCatalogo.forEach(categoriaCatalogo => {
                total += (this.catalogo.medieval[categoriaCatalogo] || []).length;
                total += (this.catalogo.moderna[categoriaCatalogo] || []).length;
            });
            
            const countElement = document.getElementById(`count-${categoriaHTML}`);
            if (countElement) {
                countElement.textContent = total;
            }
        });
    }

    atualizarTabelaCategoria(categoria, equipamentos) {
        const container = document.querySelector(`[data-category="${categoria}"] .table-container`);
        if (!container) return;
        
        if (equipamentos.length === 0) {
            container.innerHTML = `
                <div class="nenhum-equipamento-catalogo">
                    <i class="fas fa-inbox fa-2x"></i>
                    <div>Nenhum equipamento encontrado</div>
                </div>
            `;
            return;
        }
        
        // Gerar HTML baseado na categoria
        let html = '';
        
        switch(categoria) {
            case 'armas-cc':
                html = this.gerarHTMLArmasCorpoACorpo(equipamentos);
                break;
            case 'armas-dist':
                html = this.gerarHTMLArmasDistancia(equipamentos);
                break;
            case 'armaduras':
                html = this.gerarHTMLArmaduras(equipamentos);
                break;
            case 'escudos':
                html = this.gerarHTMLEscudos(equipamentos);
                break;
            case 'geral':
                html = this.gerarHTMLEquipamentosGerais(equipamentos);
                break;
        }
        
        container.innerHTML = html;
        
        // Adicionar evento aos botões de compra
        setTimeout(() => {
            container.querySelectorAll('.btn-comprar').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const itemId = btn.getAttribute('data-item');
                    if (itemId && window.sistemaEquipamentos) {
                        window.sistemaEquipamentos.comprarEquipamento(itemId, btn);
                    }
                });
            });
        }, 100);
    }

    // GERADORES DE HTML PARA TABELAS
    gerarHTMLArmasCorpoACorpo(equipamentos) {
        return `
            <table class="catalog-table">
                <thead>
                    <tr>
                        <th class="col-nt">NT</th>
                        <th class="col-nome">ARMA</th>
                        <th class="col-dano">DANO</th>
                        <th class="col-tipo">TIPO DANO</th>
                        <th class="col-alcance">ALCANCE</th>
                        <th class="col-peso">PESO</th>
                        <th class="col-st">ST</th>
                        <th class="col-maos">MÃOS</th>
                        <th class="col-custo">CUSTO</th>
                        <th class="col-acao">AÇÃO</th>
                    </tr>
                </thead>
                <tbody>
                    ${equipamentos.map(equipamento => `
                        <tr class="era-${equipamento.era}">
                            <td class="col-nt">${equipamento.nt}</td>
                            <td class="col-nome">
                                <strong>${equipamento.nome}</strong>
                                <div class="maos-info">${this.obterTextoMaos(equipamento.maos)}</div>
                                <small class="era-badge era-${equipamento.era}">${equipamento.era === 'medieval' ? '🏰 Medieval' : '🔫 Moderna'}</small>
                            </td>
                            <td class="col-dano">${equipamento.dano}</td>
                            <td class="col-tipo">${equipamento.tipoDano}</td>
                            <td class="col-alcance">${equipamento.alcance}</td>
                            <td class="col-peso">${equipamento.peso} kg</td>
                            <td class="col-st">${equipamento.st}</td>
                            <td class="col-maos">
                                <span class="badge-maos maos-${equipamento.maos}">
                                    ${this.obterIconeMaos(equipamento.maos)}
                                </span>
                            </td>
                            <td class="col-custo">$${equipamento.custo}</td>
                            <td class="col-acao">
                                <button class="btn-comprar" data-item="${equipamento.id}">
                                    <i class="fas fa-shopping-cart"></i> COMPRAR
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    gerarHTMLArmasDistancia(equipamentos) {
        return `
            <table class="catalog-table">
                <thead>
                    <tr>
                        <th class="col-nt">NT</th>
                        <th class="col-nome">ARMA</th>
                        <th class="col-dano">DANO</th>
                        <th class="col-tipo">TIPO DANO</th>
                        <th class="col-prec">PREC</th>
                        <th class="col-alcance">ALCANCE</th>
                        <th class="col-peso">PESO</th>
                        <th class="col-maos">MÃOS</th>
                        <th class="col-custo">CUSTO</th>
                        <th class="col-mag">MAGNIT</th>
                        <th class="col-acao">AÇÃO</th>
                    </tr>
                </thead>
                <tbody>
                    ${equipamentos.map(equipamento => `
                        <tr class="era-${equipamento.era}">
                            <td class="col-nt">${equipamento.nt}</td>
                            <td class="col-nome">
                                <strong>${equipamento.nome}</strong>
                                <div class="maos-info">${this.obterTextoMaos(equipamento.maos)}</div>
                                <small class="era-badge era-${equipamento.era}">${equipamento.era === 'medieval' ? '🏰 Medieval' : '🔫 Moderna'}</small>
                            </td>
                            <td class="col-dano">${equipamento.dano}</td>
                            <td class="col-tipo">${equipamento.tipoDano}</td>
                            <td class="col-prec">${equipamento.prec || '-'}</td>
                            <td class="col-alcance">${equipamento.alcance}</td>
                            <td class="col-peso">${equipamento.peso} kg</td>
                            <td class="col-maos">
                                <span class="badge-maos maos-${equipamento.maos}">
                                    ${this.obterIconeMaos(equipamento.maos)}
                                </span>
                            </td>
                            <td class="col-custo">$${equipamento.custo}</td>
                            <td class="col-mag">${equipamento.magnit || '-'}</td>
                            <td class="col-acao">
                                <button class="btn-comprar" data-item="${equipamento.id}">
                                    <i class="fas fa-shopping-cart"></i> COMPRAR
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    gerarHTMLArmaduras(equipamentos) {
        return `
            <table class="catalog-table">
                <thead>
                    <tr>
                        <th class="col-nt">NT</th>
                        <th class="col-nome">ARMADURA</th>
                        <th class="col-local">LOCAL</th>
                        <th class="col-rd">RD</th>
                        <th class="col-peso">PESO</th>
                        <th class="col-custo">CUSTO</th>
                        <th class="col-cl">CL</th>
                        <th class="col-acao">AÇÃO</th>
                    </tr>
                </thead>
                <tbody>
                    ${equipamentos.map(equipamento => `
                        <tr class="era-${equipamento.era}">
                            <td class="col-nt">${equipamento.nt}</td>
                            <td class="col-nome">
                                <strong>${equipamento.nome}</strong>
                                <small class="era-badge era-${equipamento.era}">${equipamento.era === 'medieval' ? '🏰 Medieval' : '🔫 Moderna'}</small>
                            </td>
                            <td class="col-local">${equipamento.local}</td>
                            <td class="col-rd">${equipamento.rd}</td>
                            <td class="col-peso">${equipamento.peso} kg</td>
                            <td class="col-custo">$${equipamento.custo}</td>
                            <td class="col-cl">${equipamento.cl || '-'}</td>
                            <td class="col-acao">
                                <button class="btn-comprar" data-item="${equipamento.id}">
                                    <i class="fas fa-shopping-cart"></i> COMPRAR
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    gerarHTMLEscudos(equipamentos) {
        return `
            <table class="catalog-table">
                <thead>
                    <tr>
                        <th class="col-nt">NT</th>
                        <th class="col-nome">ESCUDO</th>
                        <th class="col-bd">BD</th>
                        <th class="col-custo">CUSTO</th>
                        <th class="col-rdpv">RD/PV</th>
                        <th class="col-cl">CL</th>
                        <th class="col-peso">PESO</th>
                        <th class="col-maos">MÃOS</th>
                        <th class="col-acao">AÇÃO</th>
                    </tr>
                </thead>
                <tbody>
                    ${equipamentos.map(equipamento => `
                        <tr class="era-${equipamento.era}">
                            <td class="col-nt">${equipamento.nt}</td>
                            <td class="col-nome">
                                <strong>${equipamento.nome}</strong>
                                <div class="maos-info">${this.obterTextoMaos(equipamento.maos)}</div>
                                <small class="era-badge era-${equipamento.era}">${equipamento.era === 'medieval' ? '🏰 Medieval' : '🔫 Moderna'}</small>
                            </td>
                            <td class="col-bd">${equipamento.bd}</td>
                            <td class="col-custo">$${equipamento.custo}</td>
                            <td class="col-rdpv">${equipamento.rdpv}</td>
                            <td class="col-cl">${equipamento.cl || '-'}</td>
                            <td class="col-peso">${equipamento.peso} kg</td>
                            <td class="col-maos">
                                <span class="badge-maos maos-${equipamento.maos}">
                                    ${this.obterIconeMaos(equipamento.maos)}
                                </span>
                            </td>
                            <td class="col-acao">
                                <button class="btn-comprar" data-item="${equipamento.id}">
                                    <i class="fas fa-shopping-cart"></i> COMPRAR
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    gerarHTMLEquipamentosGerais(equipamentos) {
        return `
            <table class="catalog-table">
                <thead>
                    <tr>
                        <th class="col-categoria">CATEGORIA</th>
                        <th class="col-nome">NOME</th>
                        <th class="col-custo">CUSTO</th>
                        <th class="col-peso">PESO</th>
                        <th class="col-maos">MÃOS</th>
                        <th class="col-cl">CL</th>
                        <th class="col-acao">AÇÃO</th>
                    </tr>
                </thead>
                <tbody>
                    ${equipamentos.map(equipamento => `
                        <tr class="era-${equipamento.era}">
                            <td class="col-categoria">${equipamento.categoria}</td>
                            <td class="col-nome">
                                <strong>${equipamento.nome}</strong>
                                ${equipamento.maos > 0 ? `<div class="maos-info">${this.obterTextoMaos(equipamento.maos)}</div>` : ''}
                                <small class="era-badge era-${equipamento.era}">${equipamento.era === 'medieval' ? '🏰 Medieval' : '🔫 Moderna'}</small>
                            </td>
                            <td class="col-custo">$${equipamento.custo}</td>
                            <td class="col-peso">${equipamento.peso} kg</td>
                            <td class="col-maos">
                                ${equipamento.maos > 0 ? `
                                    <span class="badge-maos maos-${equipamento.maos}">
                                        ${this.obterIconeMaos(equipamento.maos)}
                                    </span>
                                ` : '-'}
                            </td>
                            <td class="col-cl">${equipamento.cl || '-'}</td>
                            <td class="col-acao">
                                <button class="btn-comprar" data-item="${equipamento.id}">
                                    <i class="fas fa-shopping-cart"></i> COMPRAR
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // MÉTODOS AUXILIARES
    obterTextoMaos(maos) {
        switch(maos) {
            case 1: return '1 mão';
            case 1.5: return '1 ou 2 mãos';
            case 2: return '2 mãos';
            case 0: return 'Não usa mãos';
            default: return `${maos} mãos`;
        }
    }

    obterIconeMaos(maos) {
        switch(maos) {
            case 1: return '👊';
            case 1.5: return '👊👊';
            case 2: return '👊👊';
            case 0: return '─';
            default: return '👊'.repeat(maos);
        }
    }

    // MÉTODOS DE BUSCA E FILTRO
    obterEquipamentoPorId(id) {
        // Buscar em todas as eras e categorias
        for (const era in this.catalogo) {
            for (const categoria in this.catalogo[era]) {
                const equipamento = this.catalogo[era][categoria].find(item => item.id === id);
                if (equipamento) {
                    return equipamento;
                }
            }
        }
        return null;
    }

    obterTodosEquipamentos() {
        const todos = [];
        for (const era in this.catalogo) {
            for (const categoria in this.catalogo[era]) {
                todos.push(...this.catalogo[era][categoria]);
            }
        }
        return todos;
    }

    isQuantificavel(id) {
        const equipamento = this.obterEquipamentoPorId(id);
        return equipamento ? equipamento.quantificavel === true : false;
    }

    // BUSCAR EQUIPAMENTOS
    buscarEquipamentos(termo) {
        termo = termo.toLowerCase();
        const resultados = [];
        
        for (const era in this.catalogo) {
            for (const categoria in this.catalogo[era]) {
                const encontrados = this.catalogo[era][categoria].filter(item =>
                    item.nome.toLowerCase().includes(termo) ||
                    item.descricao.toLowerCase().includes(termo) ||
                    item.tipo.toLowerCase().includes(termo)
                );
                resultados.push(...encontrados);
            }
        }
        
        return resultados;
    }

    // ADICIONAR NOVO EQUIPAMENTO DINAMICAMENTE
    adicionarEquipamento(era, categoria, equipamento) {
        if (this.catalogo[era] && this.catalogo[era][categoria]) {
            // Verificar se já existe
            const existe = this.catalogo[era][categoria].find(item => item.id === equipamento.id);
            if (!existe) {
                this.catalogo[era][categoria].push(equipamento);
                
                // Atualizar interface se necessário
                if (this.tabelasInicializadas) {
                    this.aplicarFiltros();
                }
                
                return true;
            }
        }
        return false;
    }

    // REMOVER EQUIPAMENTO
    removerEquipamento(id) {
        for (const era in this.catalogo) {
            for (const categoria in this.catalogo[era]) {
                const index = this.catalogo[era][categoria].findIndex(item => item.id === id);
                if (index !== -1) {
                    this.catalogo[era][categoria].splice(index, 1);
                    
                    // Atualizar interface se necessário
                    if (this.tabelasInicializadas) {
                        this.aplicarFiltros();
                    }
                    
                    return true;
                }
            }
        }
        return false;
    }

    // EXPORTAR/IMPORTAR CATÁLOGO
    exportarCatalogo() {
        return JSON.parse(JSON.stringify(this.catalogo));
    }

    importarCatalogo(dados) {
        this.catalogo = { ...this.catalogo, ...dados };
        this.inicializado = false;
        this.tabelasInicializadas = false;
        
        // Reinicializar
        setTimeout(() => this.inicializar(), 100);
    }

    // DEBUG
    debugInfo() {
        return {
            totalEquipamentos: this.obterTodosEquipamentos().length,
            eras: Object.keys(this.catalogo),
            categorias: Object.keys(this.catalogo.medieval),
            inicializado: this.inicializado,
            tabelasInicializadas: this.tabelasInicializadas
        };
    }
}

// INICIALIZAÇÃO GLOBAL
let catalogoEquipamentos;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🛒 Iniciando sistema de catálogo...');
    
    // Verificar se estamos na aba de equipamentos
    const abaEquipamento = document.getElementById('equipamento');
    if (!abaEquipamento) {
        console.log('📌 Não está na aba de equipamentos, aguardando...');
        return;
    }
    
    // Inicializar catálogo
    catalogoEquipamentos = new CatalogoEquipamentos();
    window.catalogoEquipamentos = catalogoEquipamentos;
    
    // Adicionar CSS para badges de era
    const style = document.createElement('style');
    style.textContent = `
        .era-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.7rem;
            font-weight: bold;
            margin-top: 5px;
        }
        .era-badge.era-medieval {
            background: rgba(139, 69, 19, 0.2);
            color: #8b4513;
            border: 1px solid rgba(139, 69, 19, 0.3);
        }
        .era-badge.era-moderna {
            background: rgba(44, 62, 80, 0.2);
            color: #2c3e50;
            border: 1px solid rgba(44, 62, 80, 0.3);
        }
        .era-medieval td {
            border-left: 3px solid rgba(139, 69, 19, 0.3);
        }
        .era-moderna td {
            border-left: 3px solid rgba(44, 62, 80, 0.3);
        }
        .mensagem-sem-resultados {
            text-align: center;
            padding: 40px 20px;
            color: #aaa;
            grid-column: 1 / -1;
        }
        .mensagem-sem-resultados i {
            font-size: 3rem;
            color: #ff8c00;
            margin-bottom: 15px;
            opacity: 0.5;
        }
        .mensagem-sem-resultados h4 {
            margin: 10px 0;
            color: #fff;
        }
        .nenhum-equipamento-catalogo {
            text-align: center;
            padding: 40px 20px;
            color: #666;
        }
        .nenhum-equipamento-catalogo i {
            font-size: 2rem;
            color: #ff8c00;
            margin-bottom: 10px;
            opacity: 0.5;
        }
    `;
    document.head.appendChild(style);
});

// TORNAR DISPONÍVEL GLOBALMENTE
window.CatalogoEquipamentos = CatalogoEquipamentos;
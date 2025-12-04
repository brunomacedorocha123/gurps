// ===== CATÁLOGO DE PERÍCIAS - GURPS BÁSICO COMPLETO =====
// Versão 4.0 - Totalmente atualizado para o novo sistema

window.catalogoPericias = {
    // ===== PERÍCIAS DE COMBATE (Organizadas hierarquicamente) =====
    "Combate": {
        // === ARCO (PERÍCIA INDIVIDUAL QUE APARECE PRIMEIRO) ===
        "Arco": [
            {
                id: "arco",
                nome: "Arco",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Uso de arcos longos, arcos curtos e todos os arcos similares. Cobre também arcos compostos. Penalidade de -2 por falta de familiaridade com arcos compostos para quem nunca os viu.",
                prereq: "DX-5",
                categoria: "Combate",
                tipoArma: "Armas de Distância",
                default: "DX-5"
            }
        ],

        // === MONTARIA ===
        "Montaria": [
            {
                id: "cavalgar-cavalo",
                nome: "Cavalgar (Cavalo)",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Montar e controlar cavalos. +5 se o animal conhece e gosta do personagem. -10 se o animal não for treinado como montaria.",
                prereq: "DX-5 ou Adestramento de Animais (mesma)-3",
                categoria: "Combate",
                tipoArma: "Montaria",
                default: "DX-5 ou Adestramento de Animais (mesma)-3"
            },
            {
                id: "cavalgar-camelo",
                nome: "Cavalgar (Camelo)",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Montar e controlar camelos. Default: Cavalgar (Cavalo)-3",
                prereq: "Cavalgar (Cavalo)-3",
                categoria: "Combate",
                tipoArma: "Montaria",
                default: "Cavalgar (Cavalo)-3"
            },
            {
                id: "cavalgar-elefante",
                nome: "Cavalgar (Elefante)",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Montar e controlar elefantes. Default: Cavalgar (Cavalo)-5",
                prereq: "Cavalgar (Cavalo)-5",
                categoria: "Combate",
                tipoArma: "Montaria",
                default: "Cavalgar (Cavalo)-5"
            },
            {
                id: "cavalgar-dragao",
                nome: "Cavalgar (Dragão)",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Montar e controlar dragões. Default: Cavalgar (Cavalo)-10",
                prereq: "Cavalgar (Cavalo)-10",
                categoria: "Combate",
                tipoArma: "Montaria",
                default: "Cavalgar (Cavalo)-10"
            }
        ],

        // === ESGRIMA (Armas leves de uma mão otimizadas para defesa) ===
        "Esgrima": [
            {
                id: "esgrima-rapieira",
                nome: "Rapieira",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Armas longas e leves de estocar (mais de 1m). Penalidade por carga.",
                prereq: "Espadas de Lâmina Larga-4",
                categoria: "Combate",
                tipoArma: "Esgrima",
                default: "Espadas de Lâmina Larga-4"
            },
            {
                id: "esgrima-sabre",
                nome: "Sabre",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Armas leves de cortar e estocar. Sabres leves da esgrima.",
                prereq: "Espadas de Lâmina Larga-4",
                categoria: "Combate",
                tipoArma: "Esgrima",
                default: "Espadas de Lâmina Larga-4"
            },
            {
                id: "esgrima-adaga",
                nome: "Adaga de Esgrima",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Usada com mão inábil. Evita penalidade de defesa da mão inábil.",
                prereq: "Jitte/Sai-4 ou Faca-4",
                categoria: "Combate",
                tipoArma: "Esgrima",
                default: "Jitte/Sai-4 ou Faca-4"
            },
            {
                id: "esgrima-tercado",
                nome: "Terçado",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Armas curtas e leves de estocar (até 1m). Bastões de artes marciais.",
                prereq: "Espadas Curtas-4",
                categoria: "Combate",
                tipoArma: "Esgrima",
                default: "Espadas Curtas-4"
            }
        ],

        // === ARMAS DE HASTE (Bastões longos com ou sem cabeça pesada) ===
        "Armas de Haste": [
            {
                id: "haste-lanca",
                nome: "Lança",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Armas de haste longas e equilibradas com ponta. Dardos, tridentes, baionetas.",
                prereq: "Armas de Haste-4 ou Bastão-4",
                categoria: "Combate",
                tipoArma: "Armas de Haste",
                default: "Armas de Haste-4 ou Bastão-4"
            },
            {
                id: "haste-bastao",
                nome: "Bastão",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Hastes longas equilibradas sem cabeça pesada. +2 em Aparar.",
                prereq: "Armas de Haste-4 ou Lança-4",
                categoria: "Combate",
                tipoArma: "Armas de Haste",
                default: "Armas de Haste-4 ou Lança-4"
            },
            {
                id: "haste-armas-haste",
                nome: "Armas de Haste",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Hastes muito longas (2m+) com cabeça pesada. Glaive, alabarda, machado de haste.",
                prereq: "Lança-4 ou Bastão-4 ou Maça/Machado de Duas Mãos-4",
                categoria: "Combate",
                tipoArma: "Armas de Haste",
                default: "Lança-4 ou Bastão-4 ou Maça/Machado de Duas Mãos-4"
            }
        ],

        // === ESPADAS (Lâminas rígidas com cabo) ===
        "Espadas": [
            {
                id: "espadas-faca",
                nome: "Faca",
                atributo: "DX",
                dificuldade: "Fácil",
                custoBase: 1,
                descricao: "Lâminas rígidas com menos de 30cm. Canivete, faca Bowie. Penalidade -1 em Aparar.",
                prereq: "Adaga de Esgrima-3, Espadas Curtas-3 ou Espada de Energia-3",
                categoria: "Combate",
                tipoArma: "Espadas",
                default: "Adaga de Esgrima-3, Espadas Curtas-3 ou Espada de Energia-3"
            },
            {
                id: "espadas-curtas",
                nome: "Espadas Curtas",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Armas equilibradas de 30-60cm empunhadas com uma mão. Inclui clavas similares.",
                prereq: "Espada de Energia-4, Espadas de Lâmina Larga-2, Faca-4, Jitte/Sai-3, Sabre-4, Terçado-4 ou Tonfa-3",
                categoria: "Combate",
                tipoArma: "Espadas",
                default: "Várias perícias-3 (ver descrição)"
            },
            {
                id: "espadas-lamina-larga",
                nome: "Espadas de Lâmina Larga",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Lâminas equilibradas de 60-120cm para uma mão. Espada larga, cimitarra. Inclui espadas bastardas usadas com uma mão.",
                prereq: "Espadas Curtas-2, Espada de Duas Mãos-4, Espada de Energia-4, Rapieira-4 ou Sabre-4",
                categoria: "Combate",
                tipoArma: "Espadas",
                default: "Espadas Curtas-2"
            },
            {
                id: "espadas-duas-maos",
                nome: "Espada de Duas Mãos",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Lâminas equilibradas com 120cm+ para duas mãos. Espada grande, zweihander. Inclui espadas bastardas usadas com duas mãos.",
                prereq: "Espada de Energia-4 ou Espadas de Lâmina Larga-4",
                categoria: "Combate",
                tipoArma: "Espadas",
                default: "Espada de Energia-4 ou Espadas de Lâmina Larga-4"
            },
            {
                id: "espadas-jitte-sai",
                nome: "Jitte/Sai",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Espadas pontiagudas projetadas para apanhar armas. +2 para desarmar.",
                prereq: "Adaga de Esgrima-4, Espadas Curtas-3 ou Espada de Energia-4",
                categoria: "Combate",
                tipoArma: "Espadas",
                default: "Adaga de Esgrima-4, Espadas Curtas-3 ou Espada de Energia-4"
            },
            {
                id: "espadas-energia",
                nome: "Espada de Energia",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Espadas com lâmina de energia pura. Tecnologia avançada ou magia.",
                prereq: "Qualquer perícia de espada-3",
                categoria: "Combate",
                tipoArma: "Espadas",
                default: "NH em qualquer espada-3"
            }
        ],

        // === ARMADAS DE IMPACTO (Massas concentradas na cabeça) ===
        "Armas de Impacto": [
            {
                id: "impacto-maca-machado",
                nome: "Maça/Machado",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Armas de impacto curtas/médias de uma mão. Machado, maça, picareta, martelo de guerra leve.",
                prereq: "Mangual-4",
                categoria: "Combate",
                tipoArma: "Armas de Impacto",
                default: "Mangual-4"
            },
            {
                id: "impacto-maca-machado-2maos",
                nome: "Maça/Machado de Duas Mãos",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Armas de impacto longas para duas mãos. Machado grande, marreta, martelo pesado.",
                prereq: "Armas de Haste-4 ou Mangual de Duas Mãos-4",
                categoria: "Combate",
                tipoArma: "Armas de Impacto",
                default: "Armas de Haste-4 ou Mangual de Duas Mãos-4"
            }
        ],

        // === MANGUAIS (Armas flexíveis desbalanceadas) ===
        "Manguais": [
            {
                id: "mangual-normal",
                nome: "Mangual",
                atributo: "DX",
                dificuldade: "Difícil",
                custoBase: 4,
                descricao: "Armas flexíveis desbalanceadas de uma mão. Nunchaku, maça-estrela. Inimigo tem -2 para bloquear, -4 para aparar.",
                prereq: "Maça/Machado-4",
                categoria: "Combate",
                tipoArma: "Manguais",
                default: "Maça/Machado-4"
            },
            {
                id: "mangual-2maos",
                nome: "Mangual de Duas Mãos",
                atributo: "DX",
                dificuldade: "Difícil",
                custoBase: 4,
                descricao: "Manguais longos para duas mãos. Requer mais força para manuseio eficiente.",
                prereq: "Kusari-4 ou Maça/Machado de Duas Mãos-4",
                categoria: "Combate",
                tipoArma: "Manguais",
                default: "Kusari-4 ou Maça/Machado de Duas Mãos-4"
            }
        ],

        // === CHICOTES (Armas flexíveis para enlaçar) ===
        "Chicotes": [
            {
                id: "chicote-normal",
                nome: "Chicote",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Armas flexíveis de couro, corda ou corrente. Excelentes para desarmar e prender.",
                prereq: "Nenhum",
                categoria: "Combate",
                tipoArma: "Chicotes",
                default: "Nenhum"
            },
            {
                id: "chicote-energia",
                nome: "Chicote de Energia",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Chicotes feitos de energia pura. Projeções de alta tecnologia.",
                prereq: "Nenhum",
                categoria: "Combate",
                tipoArma: "Chicotes",
                default: "Nenhum"
            },
            {
                id: "chicote-monofio",
                nome: "Chicote Monofio",
                atributo: "DX",
                dificuldade: "Difícil",
                custoBase: 4,
                descricao: "Chicote com fio monomolecular. Corte extremamente afiado.",
                prereq: "Nenhum",
                categoria: "Combate",
                tipoArma: "Chicotes",
                default: "Nenhum"
            },
            {
                id: "chicote-kusari",
                nome: "Kusari",
                atributo: "DX",
                dificuldade: "Difícil",
                custoBase: 4,
                descricao: "Corrente pesada para duas mãos. Técnicas especiais de combate.",
                prereq: "Mangual de Duas Mãos-4",
                categoria: "Combate",
                tipoArma: "Chicotes",
                default: "Mangual de Duas Mãos-4"
            }
        ],

        // === OUTRAS ARMADAS DE COMBATE ===
        "Outras Armas": [
            {
                id: "outras-tonfa",
                nome: "Tonfa",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Bastão com cabo lateral. Pode ser usado junto ao antebraço para defesa aprimorada.",
                prereq: "Espadas Curtas-3",
                categoria: "Combate",
                tipoArma: "Outras Armas",
                default: "Espadas Curtas-3"
            },
            {
                id: "combate-desarmado",
                nome: "Combate Desarmado",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Lutar sem armas usando socos, chutes, agarramentos e imobilizações.",
                prereq: "Nenhum",
                categoria: "Combate",
                tipoArma: "Desarmado",
                default: "Nenhum"
            },
            {
                id: "escudo",
                nome: "Escudo",
                atributo: "DX",
                dificuldade: "Fácil",
                custoBase: 1,
                descricao: "Usar escudos para bloquear ataques. Diferentes tipos de escudos.",
                prereq: "Nenhum",
                categoria: "Combate",
                tipoArma: "Defesa",
                default: "Nenhum"
            }
        ],

        // === ARMADAS DE DISTÂNCIA (RESTANTE) ===
        "Armas de Distância": [
            {
                id: "besta",
                nome: "Besta",
                atributo: "DX",
                dificuldade: "Fácil",
                custoBase: 1,
                descricao: "Usar bestas de todos os tipos. Carregamento mais lento, mas mais fácil de usar.",
                prereq: "DX-4",
                categoria: "Combate",
                tipoArma: "Armas de Distância",
                default: "DX-4"
            },
            {
                id: "arremesso",
                nome: "Arremesso",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Arremessar armas como facas, machados, dardos e pedras.",
                prereq: "DX-5",
                categoria: "Combate",
                tipoArma: "Armas de Distância",
                default: "DX-5"
            },
            {
                id: "armas-de-fogo",
                nome: "Armas de Fogo",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Usar pistolas, rifles e outras armas de fogo. Especializações por tipo.",
                prereq: "DX-5",
                categoria: "Combate",
                tipoArma: "Armas de Distância",
                default: "DX-5"
            }
        ]
    },

    // ===== PERÍCIAS DE DESTREZA (DX) =====
    "DX": [
        {
            id: "acrobacia",
            nome: "Acrobacia",
            atributo: "DX",
            dificuldade: "Difícil",
            custoBase: 4,
            descricao: "Realizar proezas de ginástica, cambalhotas, rolamentos e equilíbrio.",
            prereq: "DX-6",
            categoria: "DX",
            tipo: "Movimento"
        },
        {
            id: "atletismo",
            nome: "Atletismo",
            atributo: "DX",
            dificuldade: "Fácil",
            custoBase: 1,
            descricao: "Correr, saltar, escalar, nadar e outras atividades físicas básicas.",
            prereq: "DX-4",
            categoria: "DX",
            tipo: "Movimento"
        },
        {
            id: "furtividade",
            nome: "Furtividade",
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Mover-se silenciosamente, esconder-se e passar despercebido.",
            prereq: "DX-5",
            categoria: "DX",
            tipo: "Esconder"
        },
        {
            id: "piloto",
            nome: "Piloto",
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Operar veículos terrestres, aquáticos ou aéreos.",
            prereq: "DX-5",
            categoria: "DX",
            tipo: "Veículos"
        },
        {
            id: "armadilhas",
            nome: "Armadilhas",
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Encontrar, desarmar e criar armadilhas mecânicas.",
            prereq: "DX-5",
            categoria: "DX",
            tipo: "Técnica"
        },
        {
            id: "roubo",
            nome: "Roubo",
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Abrir fechaduras, pegar bolsos e outras habilidades de ladrão.",
            prereq: "DX-5",
            categoria: "DX",
            tipo: "Técnica"
        },
        {
            id: "malabarismo",
            nome: "Malabarismo",
            atributo: "DX",
            dificuldade: "Difícil",
            custoBase: 4,
            descricao: "Fazer malabarismos com objetos, equilibrar itens e truques de destreza.",
            prereq: "DX-6",
            categoria: "DX",
            tipo: "Entretenimento"
        }
    ],

    // ===== PERÍCIAS DE VIGOR (HT) =====
    "HT": [
        {
            id: "natacao",
            nome: "Natação",
            atributo: "HT",
            dificuldade: "Fácil",
            custoBase: 1,
            descricao: "Nadar eficientemente em diferentes condições aquáticas.",
            prereq: "HT-4",
            categoria: "HT",
            tipo: "Atividade"
        },
        {
            id: "sobrevivencia",
            nome: "Sobrevivência",
            atributo: "HT",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Sobreviver em ambientes selvagens: encontrar água, comida, abrigo.",
            prereq: "HT-5",
            categoria: "HT",
            tipo: "Ambiente"
        },
        {
            id: "boemia",
            nome: "Boémia",
            atributo: "HT",
            dificuldade: "Fácil",
            custoBase: 1,
            descricao: "Socializar em festas, beber e resistir aos efeitos do álcool.",
            prereq: "HT-4",
            categoria: "HT",
            tipo: "Social"
        },
        {
            id: "corrida",
            nome: "Corrida",
            atributo: "HT",
            dificuldade: "Fácil",
            custoBase: 1,
            descricao: "Correr longas distâncias, maratonas e resistência física.",
            prereq: "HT-4",
            categoria: "HT",
            tipo: "Atividade"
        },
        {
            id: "escalada",
            nome: "Escalada",
            atributo: "HT",
            dificuldade: "Fácil",
            custoBase: 1,
            descricao: "Escalar superfícies verticais, rochas e paredes.",
            prereq: "HT-4",
            categoria: "HT",
            tipo: "Atividade"
        },
        {
            id: "mergulho",
            nome: "Mergulho",
            atributo: "HT",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Mergulhar em águas profundas, lidar com pressão e equipamento.",
            prereq: "HT-5",
            categoria: "HT",
            tipo: "Atividade"
        }
    ],

    // ===== PERÍCIAS DE PERCEPÇÃO (PERC) =====
    "PERC": [
        {
            id: "observacao",
            nome: "Observação",
            atributo: "PERC",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Perceber detalhes importantes, mudanças no ambiente e perigos.",
            prereq: "PERC-5",
            categoria: "PERC",
            tipo: "Percepção"
        },
        {
            id: "rastreamento",
            nome: "Rastreamento",
            atributo: "PERC",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Seguir trilhas, rastros e identificar sinais de passagem.",
            prereq: "PERC-5",
            categoria: "PERC",
            tipo: "Percepção"
        },
        {
            id: "captacao",
            nome: "Captação",
            atributo: "PERC",
            dificuldade: "Fácil",
            custoBase: 1,
            descricao: "Encontrar objetos úteis, tesouros escondidos e recursos.",
            prereq: "PERC-4",
            categoria: "PERC",
            tipo: "Percepção"
        },
        {
            id: "ouvir",
            nome: "Ouvir",
            atributo: "PERC",
            dificuldade: "Fácil",
            custoBase: 1,
            descricao: "Ouvir sons sutis, conversas distantes e ruídos importantes.",
            prereq: "PERC-4",
            categoria: "PERC",
            tipo: "Percepção"
        },
        {
            id: "procurar",
            nome: "Procurar",
            atributo: "PERC",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Buscar ativamente por objetos, pessoas ou informações específicas.",
            prereq: "PERC-5",
            categoria: "PERC",
            tipo: "Percepção"
        },
        {
            id: "tato",
            nome: "Tato",
            atributo: "PERC",
            dificuldade: "Fácil",
            custoBase: 1,
            descricao: "Sentir vibrações, texturas e mudanças sutis através do tato.",
            prereq: "PERC-4",
            categoria: "PERC",
            tipo: "Percepção"
        }
    ],

    // ===== PERÍCIAS DE INTELIGÊNCIA (IQ) =====
    "IQ": [
        {
            id: "diplomacia",
            nome: "Diplomacia",
            atributo: "IQ",
            dificuldade: "Difícil",
            custoBase: 4,
            descricao: "Negociar, resolver conflitos e lidar diplomaticamente com outras pessoas.",
            prereq: "IQ-6",
            categoria: "IQ",
            tipo: "Social"
        },
        {
            id: "estrategia",
            nome: "Estratégia",
            atributo: "IQ",
            dificuldade: "Difícil",
            custoBase: 4,
            descricao: "Planejar e executar estratégias militares, táticas de batalha.",
            prereq: "IQ-6",
            categoria: "IQ",
            tipo: "Conhecimento"
        },
        {
            id: "tatica",
            nome: "Tática",
            atributo: "IQ",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Comandar em combate, posicionar tropas e tomar decisões táticas.",
            prereq: "IQ-5",
            categoria: "IQ",
            tipo: "Conhecimento"
        },
        {
            id: "comercio",
            nome: "Comércio",
            atributo: "IQ",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Comprar, vender e avaliar o valor de mercadorias e serviços.",
            prereq: "IQ-5",
            categoria: "IQ",
            tipo: "Profissional"
        },
        {
            id: "primeiros-socorros",
            nome: "Primeiros Socorros",
            atributo: "IQ",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Tratar ferimentos, estabilizar pacientes e cuidados médicos básicos.",
            prereq: "IQ-5",
            categoria: "IQ",
            tipo: "Médico"
        },
        {
            id: "detectar-mentira",
            nome: "Detectar Mentira",
            atributo: "IQ",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Identificar quando alguém está mentindo ou sendo desonesto.",
            prereq: "IQ-5",
            categoria: "IQ",
            tipo: "Social"
        },
        {
            id: "linguistica",
            nome: "Linguística",
            atributo: "IQ",
            dificuldade: "Difícil",
            custoBase: 4,
            descricao: "Estudo de línguas, decifrar códigos e entender estruturas linguísticas.",
            prereq: "IQ-6",
            categoria: "IQ",
            tipo: "Conhecimento"
        },
        {
            id: "ocultismo",
            nome: "Ocultismo",
            atributo: "IQ",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Conhecimento de magia, rituais, criaturas sobrenaturais e fenômenos ocultos.",
            prereq: "IQ-5",
            categoria: "IQ",
            tipo: "Conhecimento"
        },
        {
            id: "ciencias",
            nome: "Ciências",
            atributo: "IQ",
            dificuldade: "Var.",
            custoBase: 2,
            descricao: "Conhecimento científico especializado (Astronomia, Biologia, Química, etc.).",
            prereq: "IQ-5",
            categoria: "IQ",
            tipo: "Conhecimento"
        },
        {
            id: "historia",
            nome: "História",
            atributo: "IQ",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Conhecimento de eventos históricos, culturas antigas e civilizações.",
            prereq: "IQ-5",
            categoria: "IQ",
            tipo: "Conhecimento"
        },
        {
            id: "geografia",
            nome: "Geografia",
            atributo: "IQ",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Conhecimento de terras, rotas, climas e características geográficas.",
            prereq: "IQ-5",
            categoria: "IQ",
            tipo: "Conhecimento"
        }
    ]
};

// ===== FUNÇÕES DE ACESSO AO CATÁLOGO - ATUALIZADAS =====

// OBTER TODAS AS PERÍCIAS (achatando a estrutura)
function obterTodasPericias() {
    const todas = [];
    
    for (const categoria in window.catalogoPericias) {
        if (categoria === "Combate") {
            // Para combate, precisa descer mais um nível
            for (const tipoArma in window.catalogoPericias[categoria]) {
                todas.push(...window.catalogoPericias[categoria][tipoArma]);
            }
        } else {
            // Para outras categorias, é direto
            todas.push(...window.catalogoPericias[categoria]);
        }
    }
    
    return todas;
}

// BUSCAR PERÍCIAS (sem subcategoria)
function buscarPericias(termo = "", filtroAtributo = "Todos") {
    let resultados = obterTodasPericias();
    
    // Filtro por termo de busca
    if (termo) {
        resultados = resultados.filter(pericia => 
            pericia.nome.toLowerCase().includes(termo.toLowerCase()) ||
            pericia.descricao.toLowerCase().includes(termo.toLowerCase()) ||
            (pericia.tipoArma && pericia.tipoArma.toLowerCase().includes(termo.toLowerCase()))
        );
    }
    
    // Filtro por atributo/categoria
    if (filtroAtributo !== "Todos") {
        if (filtroAtributo === "Combate") {
            resultados = resultados.filter(pericia => pericia.categoria === "Combate");
        } else {
            resultados = resultados.filter(pericia => pericia.atributo === filtroAtributo);
        }
    }
    
    return resultados;
}

// OBTER PERÍCIA POR ID
function obterPericiaPorId(id) {
    const todas = obterTodasPericias();
    return todas.find(pericia => pericia.id === id);
}

// OBTER CATEGORIAS DISPONÍVEIS
function obterCategorias() {
    return Object.keys(window.catalogoPericias);
}

// OBTER TIPOS DE ARMA PARA COMBATE
function obterTiposArma() {
    if (!window.catalogoPericias["Combate"]) return [];
    return Object.keys(window.catalogoPericias["Combate"]);
}

// OBTER PERÍCIAS POR TIPO DE ARMA
function obterPericiasPorTipoArma(tipoArma) {
    if (!window.catalogoPericias["Combate"] || !window.catalogoPericias["Combate"][tipoArma]) {
        return [];
    }
    return window.catalogoPericias["Combate"][tipoArma];
}

// ===== EXPORTAÇÃO PARA USO NO SISTEMA PRINCIPAL =====
window.buscarPericias = buscarPericias;
window.obterPericiaPorId = obterPericiaPorId;
window.obterCategorias = obterCategorias;
window.obterTodasPericias = obterTodasPericias;
window.obterTiposArma = obterTiposArma;
window.obterPericiasPorTipoArma = obterPericiasPorTipoArma;

console.log('✅ Catálogo de perícias atualizado carregado com', obterTodasPericias().length, 'perícias disponíveis');
console.log('📊 Tipos de arma disponíveis:', obterTiposArma());
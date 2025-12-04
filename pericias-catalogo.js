// ===== CATÁLOGO COMPLETO DE PERÍCIAS - ESTRUTURA FINAL CORRETA =====
// Baseado no texto do manual GURPS

window.catalogoPericias = {
    // ===== PERÍCIAS DE COMBATE =====
    "Combate": {
        // === ARMAS DE ESGRIMA (CLICÁVEL - ABRE MODAL) ===
        "Armas de Esgrima": {
            tipo: "modal-escolha",
            nome: "Armas de Esgrima",
            descricao: "Armas leves, empunhadas com uma mão (lâminas com cabos) e otimizadas para aparar. Bônus de recuar ampliado. Penalidade igual ao nível de carga. Default = NH em qualquer outra -3.",
            pericias: [
                {
                    id: "adaga-esgrima",
                    nome: "Adaga de Esgrima",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma normalmente empunhada como Faca ou Jitte/Sai utilizada com a mão 'inábil'. Evita penalidade ao usar mão inábil para defesa.",
                    prereq: "Jitte/Sai-4 ou Faca-4",
                    default: "Jitte/Sai-4 ou Faca-4"
                },
                {
                    id: "rapieira",
                    nome: "Rapieira",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma longa (mais de um metro) e leve de estocar.",
                    prereq: "Espadas de Lâmina Larga-4",
                    default: "Espadas de Lâmina Larga-4"
                },
                {
                    id: "sabre",
                    nome: "Sabre",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma leve, de cortar e de estocar. Sabres da cavalaria usam Espadas de Lâmina Larga.",
                    prereq: "Espadas de Lâmina Larga-4 ou Espadas Curtas-4",
                    default: "Espadas de Lâmina Larga-4 ou Espadas Curtas-4"
                },
                {
                    id: "tercado",
                    nome: "Terçado",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma curta (até 1 metro) e leve de estocar ou bastão curto de uma mão (escrima/kali).",
                    prereq: "Espadas Curtas-4",
                    default: "Espadas Curtas-4"
                }
            ]
        },

        // === ARMAS DE HASTE (CLICÁVEL - ABRE MODAL) ===
        "Armas de Haste": {
            tipo: "modal-escolha",
            nome: "Armas de Haste",
            descricao: "Bastões longos (geralmente de madeira) com cabeças pesadas. Todas devem ser empunhadas com as duas mãos.",
            pericias: [
                {
                    id: "armas-haste",
                    nome: "Armas de Haste",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma muito longa (pelo menos 2m) e desbalanceada com cabeça pesada: glaive, alabarda, machado de haste, etc. Fica despreparada após ataque.",
                    prereq: "Lança-4, Bastão-4 ou Maça/Machado de Duas Mãos-4",
                    default: "Lança-4, Bastão-4 ou Maça/Machado de Duas Mãos-4"
                },
                {
                    id: "bastao",
                    nome: "Bastão",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer haste longa e equilibrada sem cabeça pesada. +2 em Aparar.",
                    prereq: "Armas de Haste-4 ou Lança-4",
                    default: "Armas de Haste-4 ou Lança-4"
                },
                {
                    id: "lanca",
                    nome: "Lança",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma de haste longa e equilibrada com ponta: lanças, dardos, tridentes, baionetas.",
                    prereq: "Armas de Haste-4 ou Bastão-4",
                    default: "Armas de Haste-4 ou Bastão-4"
                }
            ]
        },

        // === ARMAS DE IMPACTO (CLICÁVEL - ABRE MODAL) ===
        "Armas de Impacto": {
            tipo: "modal-escolha",
            nome: "Armas de Impacto",
            descricao: "Armas rígidas, desbalanceadas com massa concentrada na cabeça. Não podem aparar se já atacou no turno. Default = NH em qualquer outra -3.",
            pericias: [
                {
                    id: "maca-machado",
                    nome: "Maça/Machado",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma de impacto curta ou média empunhada com uma só mão: machado, machadinha, maça, picareta, etc.",
                    prereq: "Mangual-4",
                    default: "Mangual-4"
                },
                {
                    id: "maca-machado-2m",
                    nome: "Maça/Machado de Duas Mãos",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma de impacto longa empunhada com duas mãos: bastão de beisebol, marreta, martelo de guerra, etc.",
                    prereq: "Armas de Haste-4 ou Mangual de Duas Mãos-4",
                    default: "Armas de Haste-4 ou Mangual de Duas Mãos-4"
                }
            ]
        },

        // === CHICOTES (CLICÁVEL - ABRE MODAL) ===
        "Chicotes": {
            tipo: "modal-escolha",
            nome: "Chicotes",
            descricao: "Armas flexíveis feitas de corrente, couro, arame, etc. Ótimas para desarmar e prender. Ruins para aparar. Default = NH em qualquer outra -3.",
            pericias: [
                {
                    id: "chicote",
                    nome: "Chicote",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer tipo de chicote. Até 7m de comprimento. Não pode golpear a menos de 1m se tiver 2m+.",
                    prereq: "DX-5",
                    default: "DX-5"
                },
                {
                    id: "chicote-energia",
                    nome: "Chicote de Energia",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Chicote feito de energia pura (alta tecnologia, mágico ou psíquico). Geralmente não prende alvo.",
                    prereq: "Chicote-4",
                    default: "Chicote-4"
                },
                {
                    id: "chicote-monofio",
                    nome: "Chicote Monofio",
                    atributo: "DX",
                    dificuldade: "Difícil",
                    custoBase: 4,
                    descricao: "Chicote feito com fio monomolecular pesado e preso a um cabo.",
                    prereq: "Chicote-6",
                    default: "Chicote-6"
                },
                {
                    id: "kusari",
                    nome: "Kusari",
                    atributo: "DX",
                    dificuldade: "Difícil",
                    custoBase: 4,
                    descricao: "Corrente pesada empunhada com as duas mãos.",
                    prereq: "Mangual de Duas Mãos-4",
                    default: "Mangual de Duas Mãos-4"
                }
            ]
        },

        // === ESPADAS (CLICÁVEL - ABRE MODAL) ===
        "Espadas": {
            tipo: "modal-escolha",
            nome: "Espadas",
            descricao: "Lâminas rígidas com cabo, com ponta perfurante e/ou fio cortante. Equilibradas, podem atacar ou aparar sem ficar despreparadas.",
            pericias: [
                {
                    id: "faca",
                    nome: "Faca",
                    atributo: "DX",
                    dificuldade: "Fácil",
                    custoBase: 1,
                    descricao: "Qualquer lâmina rígida com menos de 30cm (canivete a faca Bowie). Penalidade -1 em Aparar.",
                    prereq: "Adaga de Esgrima-3, Espadas Curtas-3 ou Espada de Energia-3",
                    default: "Adaga de Esgrima-3, Espadas Curtas-3 ou Espada de Energia-3"
                },
                {
                    id: "jitte-sai",
                    nome: "Jitte/Sai",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Espada pontiaguda para apanhar armas rígidas. +2 em Disputa Rápida para desarmar. Permite desarmar após aparar sem teste prévio.",
                    prereq: "Adaga de Esgrima-4, Espadas Curtas-3 ou Espada de Energia-4",
                    default: "Adaga de Esgrima-4, Espadas Curtas-3 ou Espada de Energia-4"
                },
                {
                    id: "espadas-curtas",
                    nome: "Espadas Curtas",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma equilibrada com 30 a 60cm empunhada com uma só mão, incluindo terçado e clavas similares.",
                    prereq: "Espada de Energia-4, Espadas de Lâmina Larga-2, Faca-4, Jitte/Sai-3, Sabre-4, Terçado-4 ou Tonfa-3",
                    default: "Espada de Energia-4, Espadas de Lâmina Larga-2, Faca-4, Jitte/Sai-3, Sabre-4, Terçado-4 ou Tonfa-3"
                },
                {
                    id: "espadas-lamina-larga",
                    nome: "Espadas de Lâmina Larga",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer lâmina equilibrada de 60 a 120cm para uma mão: espada larga, cimitarra, espada bastarda/katana/grande com uma mão.",
                    prereq: "Espadas Curtas-2, Espada de Duas Mãos-4, Espada de Energia-4, Rapieira-4 ou Sabre-4",
                    default: "Espadas Curtas-2, Espada de Duas Mãos-4, Espada de Energia-4, Rapieira-4 ou Sabre-4"
                },
                {
                    id: "espada-duas-maos",
                    nome: "Espada de Duas Mãos",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer lâmina equilibrada com 120cm+ empunhada com duas mãos: espada grande, zweihander, espada bastarda/katana/grande com duas mãos.",
                    prereq: "Espada de Energia-4 ou Espadas de Lâmina Larga-4",
                    default: "Espada de Energia-4 ou Espadas de Lâmina Larga-4"
                },
                {
                    id: "espada-energia",
                    nome: "Espada de Energia",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer espada com 'lâmina' de energia (alta tecnologia, mágica ou psíquica).",
                    prereq: "NH em qualquer espada -3",
                    default: "NH em qualquer espada -3"
                }
            ]
        },

        // === MANGUAIIS (CLICÁVEL - ABRE MODAL) ===
        "Manguais": {
            tipo: "modal-escolha",
            nome: "Manguais",
            descricao: "Armas flexíveis desbalanceadas com massa concentrada no pírtigo. Não pode aparar se já atacou. Bloqueio: -2, Aparar: -4. Facas e Esgrima não podem aparar mangual. Default = NH em qualquer outra -3.",
            pericias: [
                {
                    id: "mangual",
                    nome: "Mangual",
                    atributo: "DX",
                    dificuldade: "Difícil",
                    custoBase: 4,
                    descricao: "Qualquer mangual de uma mão: maça-estrela, nunchaku, etc.",
                    prereq: "Maça/Machado-4",
                    default: "Maça/Machado-4"
                },
                {
                    id: "mangual-2m",
                    nome: "Mangual de Duas Mãos",
                    atributo: "DX",
                    dificuldade: "Difícil",
                    custoBase: 4,
                    descricao: "Qualquer mangual de duas mãos.",
                    prereq: "Kusari-4 ou Maça/Machado de Duas Mãos-4",
                    default: "Kusari-4 ou Maça/Machado de Duas Mãos-4"
                }
            ]
        },

        // === OUTRAS ARMAS (CLICÁVEL - ABRE MODAL) ===
        "Outras Armas": {
            tipo: "modal-escolha",
            nome: "Outras Armas",
            descricao: "Armas de combate corpo a corpo não fáceis de classificar.",
            pericias: [
                {
                    id: "tonfa",
                    nome: "Tonfa",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Bastão com cabo protuberante. Usada junto ao antebraço permite jab (GdP+1) e aparar com (NH/2)+3. Teste para mudar modo de empunhar.",
                    prereq: "Espadas Curtas-3",
                    default: "Espadas Curtas-3"
                }
            ]
        },

        // === ARMAS DE DISTÂNCIA (PERÍCIAS DIRETAS - NÃO ABRE MODAL) ===
        "Arco": {
            tipo: "pericia-simples",
            id: "arco",
            nome: "Arco",
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Uso de arcos longos, arcos curtos e todos os arcos similares. Cobre também arcos compostos. Penalidade de -2 por falta de familiaridade com arcos compostos para quem nunca os viu.",
            prereq: "DX-5",
            default: "DX-5"
        }

        // ADICIONAR MAIS PERÍCIAS DE DISTÂNCIA AQUI...
    },

    // ===== PERÍCIAS DE DESTREZA (DX) =====
    "DX": [
        {
            id: "acrobacia",
            nome: "Acrobacia",
            atributo: "DX",
            dificuldade: "Difícil",
            custoBase: 4,
            descricao: "Realizar acrobacias, cambalhotas, saltos mortais, equilibrar-se em cordas, etc.",
            prereq: "DX-6",
            default: "DX-6"
        },
        {
            id: "atletismo",
            nome: "Atletismo",
            atributo: "DX",
            dificuldade: "Fácil",
            custoBase: 1,
            descricao: "Habilidade geral para atividades atléticas: saltar, escalar, nadar, etc.",
            prereq: "DX-4",
            default: "DX-4"
        }
        // ADICIONAR MAIS PERÍCIAS DE DX...
    ],

    // ===== PERÍCIAS DE INTELIGÊNCIA (IQ) =====
    "IQ": [
        {
            id: "atualidades",
            nome: "Atualidades",
            atributo: "IQ",
            dificuldade: "Fácil",
            custoBase: 1,
            descricao: "Conhecimento sobre eventos atuais, celebridades, notícias, tendências, etc.",
            prereq: "IQ-4",
            default: "IQ-4"
        }
        // ADICIONAR MAIS PERÍCIAS DE IQ...
    ],

    // ===== PERÍCIAS DE VIGOR (HT) =====
    "HT": [
        {
            id: "correr",
            nome: "Correr",
            atributo: "HT",
            dificuldade: "Fácil",
            custoBase: 1,
            descricao: "Habilidade em correr de forma eficiente. Afeta velocidade de movimento.",
            prereq: "HT-4",
            default: "HT-4"
        }
        // ADICIONAR MAIS PERÍCIAS DE HT...
    ],

    // ===== PERÍCIAS DE PERCEPÇÃO (PERC) =====
    "PERC": [
        {
            id: "observacao",
            nome: "Observação",
            atributo: "PERC",
            dificuldade: "Fácil",
            custoBase: 1,
            descricao: "Perceber detalhes visuais, encontrar objetos escondidos, notar coisas incomuns.",
            prereq: "PERC-4",
            default: "PERC-4"
        }
        // ADICIONAR MAIS PERÍCIAS DE PERCEPÇÃO...
    ]
};
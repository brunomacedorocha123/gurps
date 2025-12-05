// ===== CATÁLOGO CORRIGIDO =====
window.catalogoPericias = {
    "Combate": {
        "Armas de Esgrima": {
            tipo: "modal-escolha",
            nome: "Armas de Esgrima",
            descricao: "Armas leves...",
            pericias: [
                {
                    id: "adaga-esgrima",
                    nome: "Adaga de Esgrima",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma...",
                    prereq: "Jitte/Sai-4 ou Faca-4",
                    default: "Jitte/Sai-4 ou Faca-4"
                },
                {
                    id: "rapieira",
                    nome: "Rapieira",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma longa...",
                    prereq: "Espadas de Lâmina Larga-4",
                    default: "Espadas de Lâmina Larga-4"
                },
                {
                    id: "sabre",
                    nome: "Sabre",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma leve...",
                    prereq: "Espadas de Lâmina Larga-4 ou Espadas Curtas-4",
                    default: "Espadas de Lâmina Larga-4 ou Espadas Curtas-4"
                },
                {
                    id: "tercado",
                    nome: "Terçado",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma curta...",
                    prereq: "Espadas Curtas-4",
                    default: "Espadas Curtas-4"
                }
            ]
        },
        "Armas de Haste": {
            tipo: "modal-escolha",
            nome: "Armas de Haste",
            descricao: "Bastões longos...",
            pericias: [
                {
                    id: "armas-haste",
                    nome: "Armas de Haste",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma muito longa...",
                    prereq: "Lança-4, Bastão-4 ou Maça/Machado de Duas Mãos-4",
                    default: "Lança-4, Bastão-4 ou Maça/Machado de Duas Mãos-4"
                },
                {
                    id: "bastao",
                    nome: "Bastão",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer haste longa...",
                    prereq: "Armas de Haste-4 ou Lança-4",
                    default: "Armas de Haste-4 ou Lança-4"
                },
                {
                    id: "lanca",
                    nome: "Lança",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma de haste...",
                    prereq: "Armas de Haste-4 ou Bastão-4",
                    default: "Armas de Haste-4 ou Bastão-4"
                }
            ]
        },
        "Armas de Impacto": {
            tipo: "modal-escolha",
            nome: "Armas de Impacto",
            descricao: "Armas rígidas...",
            pericias: [
                {
                    id: "maca-machado",
                    nome: "Maça/Machado",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma de impacto...",
                    prereq: "Mangual-4",
                    default: "Mangual-4"
                },
                {
                    id: "maca-machado-2m",
                    nome: "Maça/Machado de Duas Mãos",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma de impacto longa...",
                    prereq: "Armas de Haste-4 ou Mangual de Duas Mãos-4",
                    default: "Armas de Haste-4 ou Mangual de Duas Mãos-4"
                }
            ]
        },
        "Chicotes": {
            tipo: "modal-escolha",
            nome: "Chicotes",
            descricao: "Armas flexíveis...",
            pericias: [
                {
                    id: "chicote",
                    nome: "Chicote",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer tipo de chicote...",
                    prereq: "DX-5",
                    default: "DX-5"
                },
                {
                    id: "chicote-energia",
                    nome: "Chicote de Energia",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Chicote feito de energia...",
                    prereq: "Chicote-4",
                    default: "Chicote-4"
                },
                {
                    id: "chicote-monofio",
                    nome: "Chicote Monofio",
                    atributo: "DX",
                    dificuldade: "Difícil",
                    custoBase: 4,
                    descricao: "Chicote feito com fio monomolecular...",
                    prereq: "Chicote-6",
                    default: "Chicote-6"
                },
                {
                    id: "kusari",
                    nome: "Kusari",
                    atributo: "DX",
                    dificuldade: "Difícil",
                    custoBase: 4,
                    descricao: "Corrente pesada...",
                    prereq: "Mangual de Duas Mãos-4",
                    default: "Mangual de Duas Mãos-4"
                }
            ]
        },
        "Espadas": {
            tipo: "modal-escolha",
            nome: "Espadas",
            descricao: "Lâminas rígidas...",
            pericias: [
                {
                    id: "faca",
                    nome: "Faca",
                    atributo: "DX",
                    dificuldade: "Fácil",
                    custoBase: 1,
                    descricao: "Qualquer lâmina rígida...",
                    prereq: "Adaga de Esgrima-3, Espadas Curtas-3 ou Espada de Energia-3",
                    default: "Adaga de Esgrima-3, Espadas Curtas-3 ou Espada de Energia-3"
                },
                {
                    id: "jitte-sai",
                    nome: "Jitte/Sai",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Espada pontiaguda...",
                    prereq: "Adaga de Esgrima-4, Espadas Curtas-3 ou Espada de Energia-4",
                    default: "Adaga de Esgrima-4, Espadas Curtas-3 ou Espada de Energia-4"
                },
                {
                    id: "espadas-curtas",
                    nome: "Espadas Curtas",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma equilibrada...",
                    prereq: "Espada de Energia-4, Espadas de Lâmina Larga-2, Faca-4, Jitte/Sai-3, Sabre-4, Terçado-4 ou Tonfa-3",
                    default: "Espada de Energia-4, Espadas de Lâmina Larga-2, Faca-4, Jitte/Sai-3, Sabre-4, Terçado-4 ou Tonfa-3"
                },
                {
                    id: "espadas-lamina-larga",
                    nome: "Espadas de Lâmina Larga",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer lâmina equilibrada...",
                    prereq: "Espadas Curtas-2, Espada de Duas Mãos-4, Espada de Energia-4, Rapieira-4 ou Sabre-4",
                    default: "Espadas Curtas-2, Espada de Duas Mãos-4, Espada de Energia-4, Rapieira-4 ou Sabre-4"
                },
                {
                    id: "espada-duas-maos",
                    nome: "Espada de Duas Mãos",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer lâmina equilibrada...",
                    prereq: "Espada de Energia-4 ou Espadas de Lâmina Larga-4",
                    default: "Espada de Energia-4 ou Espadas de Lâmina Larga-4"
                },
                {
                    id: "espada-energia",
                    nome: "Espada de Energia",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer espada com 'lâmina' de energia...",
                    prereq: "NH em qualquer espada -3",
                    default: "NH em qualquer espada -3"
                }
            ]
        },
        "Manguais": {
            tipo: "modal-escolha",
            nome: "Manguais",
            descricao: "Armas flexíveis...",
            pericias: [
                {
                    id: "mangual",
                    nome: "Mangual",
                    atributo: "DX",
                    dificuldade: "Difícil",
                    custoBase: 4,
                    descricao: "Qualquer mangual de uma mão...",
                    prereq: "Maça/Machado-4",
                    default: "Maça/Machado-4"
                },
                {
                    id: "mangual-2m",
                    nome: "Mangual de Duas Mãos",
                    atributo: "DX",
                    dificuldade: "Difícil",
                    custoBase: 4,
                    descricao: "Qualquer mangual de duas mãos...",
                    prereq: "Kusari-4 ou Maça/Machado de Duas Mãos-4",
                    default: "Kusari-4 ou Maça/Machado de Duas Mãos-4"
                }
            ]
        },
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
                    descricao: "Bastão com cabo protuberante...",
                    prereq: "Espadas Curtas-3",
                    default: "Espadas Curtas-3"
                }
            ]
        },
        "Arco": {
            tipo: "pericia-simples",
            id: "arco",
            nome: "Arco",
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Uso de arcos longos, arcos curtos e todos os arcos similares...",
            prereq: "DX-5",
            default: "DX-5"
        }
    },
    "DX": [
        {
            id: "acrobacia",
            nome: "Acrobacia",
            atributo: "DX",
            dificuldade: "Difícil",
            custoBase: 4,
            descricao: "Realizar acrobacias...",
            prereq: "DX-6",
            default: "DX-6"
        },
        {
            id: "atletismo",
            nome: "Atletismo",
            atributo: "DX",
            dificuldade: "Fácil",
            custoBase: 1,
            descricao: "Habilidade geral...",
            prereq: "DX-4",
            default: "DX-4"
        }
    ],
    "IQ": [
        {
            id: "atualidades",
            nome: "Atualidades",
            atributo: "IQ",
            dificuldade: "Fácil",
            custoBase: 1,
            descricao: "Conhecimento sobre eventos atuais...",
            prereq: "IQ-4",
            default: "IQ-4"
        }
    ],
    "HT": [
        {
            id: "corrida",
            nome: "Corrida",
            atributo: "HT",
            dificuldade: "Fácil",
            custoBase: 1,
            descricao: "Habilidade em correr...",
            prereq: "HT-4",
            default: "HT-4"
        }
    ],
    "PERC": [
        {
            id: "observacao",
            nome: "Observação",
            atributo: "PERC",
            dificuldade: "Fácil",
            custoBase: 1,
            descricao: "Perceber detalhes visuais...",
            prereq: "PERC-4",
            default: "PERC-4"
        }
    ]
};
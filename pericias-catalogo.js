// ===== CATÁLOGO DE PERÍCIAS - ESTRUTURA FINAL =====
// Organizado para fácil adição de novas perícias

window.catalogoPericias = {
    // ===== PERÍCIAS DE COMBATE =====
    "Combate": {
        // === ARMAS DE DISTÂNCIA ===
        "Armas de Distância": {
            // PERÍCIAS QUE NÃO PRECISAM DE ESPECIALIZAÇÃO
            "Simples": [
                {
                    id: "arco",
                    nome: "Arco",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Uso de arcos longos, arcos curtos e todos os arcos similares. Cobre também arcos compostos. Penalidade de -2 por falta de familiaridade com arcos compostos para quem nunca os viu.",
                    prereq: "DX-5",
                    default: "DX-5"
                }
                // ADICIONAR OUTRAS ARMADAS DE DISTÂNCIA AQUI
                // Exemplo: Besta, Arremesso, Armas de Fogo
            ]
        },

        // === ARMAS CORPO-A-CORPO COM ESPECIALIZAÇÕES ===
        "Armas Corpo-a-Corpo": {
            // ESGRIMA (abre modal de especialização)
            "Esgrima": {
                id: "esgrima",
                nome: "Esgrima",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Armas leves de uma mão otimizadas para defesa. Penalidade por carga. Bônus de recuar ampliado ao aparar.",
                categoria: "Combate",
                tipo: "com-especializacoes",
                especializacoes: [
                    {
                        id: "rapieira",
                        nome: "Rapieira",
                        prereq: "Espadas de Lâmina Larga-4",
                        default: "Espadas de Lâmina Larga-4",
                        descricao: "Armas longas e leves de estocar (mais de 1m)."
                    },
                    {
                        id: "sabre",
                        nome: "Sabre",
                        prereq: "Espadas de Lâmina Larga-4",
                        default: "Espadas de Lâmina Larga-4",
                        descricao: "Armas leves de cortar e estocar. Sabres leves."
                    },
                    {
                        id: "adaga-esgrima",
                        nome: "Adaga de Esgrima",
                        prereq: "Jitte/Sai-4 ou Faca-4",
                        default: "Jitte/Sai-4 ou Faca-4",
                        descricao: "Usada com mão inábil. Evita penalidade de defesa."
                    },
                    {
                        id: "tercado",
                        nome: "Terçado",
                        prereq: "Espadas Curtas-4",
                        default: "Espadas Curtas-4",
                        descricao: "Armas curtas e leves de estocar (até 1m). Bastões de artes marciais."
                    }
                ]
            },

            // ARMADAS DE HASTE (abre modal de especialização)
            "Armas de Haste": {
                id: "armas-haste",
                nome: "Armas de Haste",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Bastões longos com ou sem cabeça pesada. Todas requerem duas mãos.",
                categoria: "Combate",
                tipo: "com-especializacoes",
                especializacoes: [
                    {
                        id: "lanca",
                        nome: "Lança",
                        prereq: "Armas de Haste-4 ou Bastão-4",
                        default: "Armas de Haste-4 ou Bastão-4",
                        descricao: "Armas de haste longas e equilibradas com ponta."
                    },
                    {
                        id: "bastao",
                        nome: "Bastão",
                        prereq: "Armas de Haste-4 ou Lança-4",
                        default: "Armas de Haste-4 ou Lança-4",
                        descricao: "Hastes longas equilibradas sem cabeça pesada. +2 em Aparar."
                    },
                    {
                        id: "haste-pesada",
                        nome: "Armas de Haste (pesadas)",
                        prereq: "Lança-4 ou Bastão-4 ou Maça/Machado 2M-4",
                        default: "Lança-4 ou Bastão-4 ou Maça/Machado 2M-4",
                        descricao: "Hastes muito longas (2m+) com cabeça pesada."
                    }
                ]
            },

            // ESPADAS (abre modal de especialização)
            "Espadas": {
                id: "espadas",
                nome: "Espadas",
                atributo: "DX",
                dificuldade: "Var.",
                custoBase: 2,
                descricao: "Lâminas rígidas com cabo, para estocar e/ou cortar.",
                categoria: "Combate",
                tipo: "com-especializacoes",
                especializacoes: [
                    {
                        id: "faca",
                        nome: "Faca",
                        dificuldade: "Fácil",
                        custoBase: 1,
                        prereq: "Adaga de Esgrima-3, Espadas Curtas-3 ou Espada de Energia-3",
                        default: "Adaga de Esgrima-3, Espadas Curtas-3 ou Espada de Energia-3",
                        descricao: "Lâminas rígidas com menos de 30cm. Penalidade -1 em Aparar."
                    },
                    {
                        id: "espadas-curtas",
                        nome: "Espadas Curtas",
                        dificuldade: "Média",
                        custoBase: 2,
                        prereq: "Várias armas-3",
                        default: "Várias armas-3",
                        descricao: "Armas equilibradas de 30-60cm empunhadas com uma mão."
                    }
                ]
            }
        },

        // === MONTARIA COM ESPECIALIZAÇÕES ===
        "Montaria": {
            "Cavalgar": {
                id: "cavalgar",
                nome: "Cavalgar",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Montar e controlar animais. Teste quando montar pela primeira vez ou quando animal se assustar.",
                categoria: "Combate",
                tipo: "com-especializacoes",
                especializacoes: [
                    {
                        id: "cavalo",
                        nome: "Cavalo",
                        prereq: "DX-5 ou Adestramento de Animais (mesma)-3",
                        default: "DX-5 ou Adestramento de Animais (mesma)-3",
                        descricao: "Montar e controlar cavalos. +5 se animal conhece e gosta, -10 se não treinado."
                    },
                    {
                        id: "camelo",
                        nome: "Camelo",
                        prereq: "Cavalgar (Cavalo)-3",
                        default: "Cavalgar (Cavalo)-3",
                        descricao: "Montar e controlar camelos."
                    },
                    {
                        id: "elefante",
                        nome: "Elefante",
                        prereq: "Cavalgar (Cavalo)-5",
                        default: "Cavalgar (Cavalo)-5",
                        descricao: "Montar e controlar elefantes."
                    },
                    {
                        id: "dragao",
                        nome: "Dragão",
                        prereq: "Cavalgar (Cavalo)-10",
                        default: "Cavalgar (Cavalo)-10",
                        descricao: "Montar e controlar dragões."
                    }
                ]
            }
        }

        // ADICIONAR NOVOS GRUPOS AQUI:
        // "Novo Grupo": { ... }
    }

    // ADICIONAR NOVAS CATEGORIAS AQUI:
    // "DX": [ ... ],
    // "IQ": [ ... ],
    // "HT": [ ... ],
    // "PERC": [ ... ]
};
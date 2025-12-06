// ===== CATÁLOGO COMPLETO DE PERÍCIAS =====
const catalogoPericias = {
    // CATEGORIA COMBATE - Todas as perícias de combate vão aqui
    "Combate": {
        // Sub-categoria: Armas de Esgrima (com especializações)
        "Armas de Esgrima": {
            tipo: "modal-escolha",
            nome: "Armas de Esgrima",
            descricao: "Armas leves e balanceadas para combate de esgrima.",
            atributo: "DX",
            categoria: "Combate",
            pericias: [
                {
                    id: "adaga-esgrima",
                    nome: "Adaga de Esgrima",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma pontiaguda leve usada para esgrima.",
                    prereq: "Jitte/Sai-4 ou Faca-4",
                    default: "Jitte/Sai-4 ou Faca-4"
                },
                {
                    id: "rapieira",
                    nome: "Rapieira",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma longa e leve para esgrima.",
                    prereq: "Espadas de Lâmina Larga-4",
                    default: "Espadas de Lâmina Larga-4"
                },
                {
                    id: "sabre",
                    nome: "Sabre",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma leve curva para esgrima.",
                    prereq: "Espadas de Lâmina Larga-4 ou Espadas Curtas-4",
                    default: "Espadas de Lâmina Larga-4 ou Espadas Curtas-4"
                },
                {
                    id: "tercado",
                    nome: "Terçado",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma curta e pesada para esgrima.",
                    prereq: "Espadas Curtas-4",
                    default: "Espadas Curtas-4"
                }
            ]
        },
        
        // Sub-categoria: Armas de Haste (com especializações)
        "Armas de Haste": {
            tipo: "modal-escolha",
            nome: "Armas de Haste",
            descricao: "Bastões longos, lanças e armas de haste.",
            atributo: "DX",
            categoria: "Combate",
            pericias: [
                {
                    id: "armas-haste",
                    nome: "Armas de Haste",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma muito longa como alabarda ou foice de guerra.",
                    prereq: "Lança-4, Bastão-4 ou Maça/Machado de Duas Mãos-4",
                    default: "Lança-4, Bastão-4 ou Maça/Machado de Duas Mãos-4"
                },
                {
                    id: "bastao",
                    nome: "Bastão",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer haste longa usada como arma.",
                    prereq: "Armas de Haste-4 ou Lança-4",
                    default: "Armas de Haste-4 ou Lança-4"
                },
                {
                    id: "lanca",
                    nome: "Lança",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma de haste com ponta.",
                    prereq: "Armas de Haste-4 ou Bastão-4",
                    default: "Armas de Haste-4 ou Bastão-4"
                }
            ]
        },
        
        // Sub-categoria: Armas de Impacto (com especializações)
        "Armas de Impacto": {
            tipo: "modal-escolha",
            nome: "Armas de Impacto",
            descricao: "Armas rígidas para golpear e esmagar.",
            atributo: "DX",
            categoria: "Combate",
            pericias: [
                {
                    id: "maca-machado",
                    nome: "Maça/Machado",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma de impacto de uma mão.",
                    prereq: "Mangual-4",
                    default: "Mangual-4"
                },
                {
                    id: "maca-machado-2m",
                    nome: "Maça/Machado de Duas Mãos",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma de impacto longa para duas mãos.",
                    prereq: "Armas de Haste-4 ou Mangual de Duas Mãos-4",
                    default: "Armas de Haste-4 ou Mangual de Duas Mãos-4"
                }
            ]
        },
        
        // Sub-categoria: Chicotes (com especializações)
        "Chicotes": {
            tipo: "modal-escolha",
            nome: "Chicotes",
            descricao: "Armas flexíveis para ataque à distância.",
            atributo: "DX",
            categoria: "Combate",
            pericias: [
                {
                    id: "chicote",
                    nome: "Chicote",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer tipo de chicote convencional.",
                    prereq: "DX-5",
                    default: "DX-5"
                },
                {
                    id: "chicote-energia",
                    nome: "Chicote de Energia",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Chicote feito de energia pura.",
                    prereq: "Chicote-4",
                    default: "Chicote-4"
                },
                {
                    id: "chicote-monofio",
                    nome: "Chicote Monofio",
                    atributo: "DX",
                    dificuldade: "Difícil",
                    custoBase: 4,
                    descricao: "Chicote feito com fio monomolecular.",
                    prereq: "Chicote-6",
                    default: "Chicote-6"
                },
                {
                    id: "kusari",
                    nome: "Kusari",
                    atributo: "DX",
                    dificuldade: "Difícil",
                    custoBase: 4,
                    descricao: "Corrente pesada com pesos nas extremidades.",
                    prereq: "Mangual de Duas Mãos-4",
                    default: "Mangual de Duas Mãos-4"
                }
            ]
        },
        
        // Sub-categoria: Espadas (com especializações)
        "Espadas": {
            tipo: "modal-escolha",
            nome: "Espadas",
            descricao: "Lâminas rígidas para combate corpo a corpo.",
            atributo: "DX",
            categoria: "Combate",
            pericias: [
                {
                    id: "faca",
                    nome: "Faca",
                    atributo: "DX",
                    dificuldade: "Fácil",
                    custoBase: 1,
                    descricao: "Qualquer lâmina rígida curta.",
                    prereq: "Adaga de Esgrima-3, Espadas Curtas-3 ou Espada de Energia-3",
                    default: "Adaga de Esgrima-3, Espadas Curtas-3 ou Espada de Energia-3"
                },
                {
                    id: "jitte-sai",
                    nome: "Jitte/Sai",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Espada pontiaguda para defesa e desarme.",
                    prereq: "Adaga de Esgrima-4, Espadas Curtas-3 ou Espada de Energia-4",
                    default: "Adaga de Esgrima-4, Espadas Curtas-3 ou Espada de Energia-4"
                },
                {
                    id: "espadas-curtas",
                    nome: "Espadas Curtas",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer arma equilibrada de tamanho médio.",
                    prereq: "Espada de Energia-4, Espadas de Lâmina Larga-2, Faca-4, Jitte/Sai-3, Sabre-4, Terçado-4 ou Tonfa-3",
                    default: "Espada de Energia-4, Espadas de Lâmina Larga-2, Faca-4, Jitte/Sai-3, Sabre-4, Terçado-4 ou Tonfa-3"
                },
                {
                    id: "espadas-lamina-larga",
                    nome: "Espadas de Lâmina Larga",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer lâmina equilibrada de uma mão.",
                    prereq: "Espadas Curtas-2, Espada de Duas Mãos-4, Espada de Energia-4, Rapieira-4 ou Sabre-4",
                    default: "Espadas Curtas-2, Espada de Duas Mãos-4, Espada de Energia-4, Rapieira-4 ou Sabre-4"
                },
                {
                    id: "espada-duas-maos",
                    nome: "Espada de Duas Mãos",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer lâmina equilibrada para duas mãos.",
                    prereq: "Espada de Energia-4 ou Espadas de Lâmina Larga-4",
                    default: "Espada de Energia-4 ou Espadas de Lâmina Larga-4"
                },
                {
                    id: "espada-energia",
                    nome: "Espada de Energia",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Qualquer espada com 'lâmina' de energia.",
                    prereq: "NH em qualquer espada -3",
                    default: "NH em qualquer espada -3"
                }
            ]
        },
        
        // Sub-categoria: Manguais (com especializações)
        "Manguais": {
            tipo: "modal-escolha",
            nome: "Manguais",
            descricao: "Armas flexíveis com cabeças de impacto.",
            atributo: "DX",
            categoria: "Combate",
            pericias: [
                {
                    id: "mangual",
                    nome: "Mangual",
                    atributo: "DX",
                    dificuldade: "Difícil",
                    custoBase: 4,
                    descricao: "Qualquer mangual de uma mão.",
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
        
        // Sub-categoria: Outras Armas (com especializações)
        "Outras Armas": {
            tipo: "modal-escolha",
            nome: "Outras Armas",
            descricao: "Armas de combate corpo a corpo não fáceis de classificar.",
            atributo: "DX",
            categoria: "Combate",
            pericias: [
                {
                    id: "tonfa",
                    nome: "Tonfa",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Bastão com cabo protuberante para combate.",
                    prereq: "Espadas Curtas-3",
                    default: "Espadas Curtas-3"
                }
            ]
        },
        
        // Perícias de Combate Simples (sem especialização)
        "Simples": [
            {
                id: "arco",
                nome: "Arco",
                atributo: "DX",
                dificuldade: "Média",
                custoBase: 2,
                descricao: "Uso de arcos longos, arcos curtos e todos os arcos similares.",
                prereq: "DX-5",
                default: "DX-5",
                categoria: "Combate",
                tipo: "pericia-simples"
            }
        ]
    },
    
    // NOVA CATEGORIA: ESPECIALIZAÇÃO (adiciona DEPOIS de Combate)
    "Especializacao": {
        "Cavalgar": {
            tipo: "modal-escolha",
            nome: "Cavalgar",
            descricao: "Habilidade em montar e controlar animais. Cada animal é uma especialização diferente.",
            atributo: "DX",
            categoria: "DX",
            pericias: [
                {
                    id: "cavalgar-cavalo",
                    nome: "Cavalgar (Cavalo)",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Montar e controlar cavalos. Default para Mula: 0, Camelo: -3, Golfinho: -6, Dragão: -10.",
                    prereq: "DX-5 ou Adestramento de Animais (Cavalo)-3",
                    default: "DX-5 ou Adestramento de Animais (Cavalo)-3"
                },
                {
                    id: "cavalgar-mula",
                    nome: "Cavalgar (Mula)", 
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Montar e controlar mulas. Default de Cavalgar (Cavalo): 0.",
                    prereq: "DX-5 ou Adestramento de Animais (Mula)-3",
                    default: "DX-5 ou Adestramento de Animais (Mula)-3"
                },
                {
                    id: "cavalgar-camelo",
                    nome: "Cavalgar (Camelo)",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Montar e controlar camelos. Default de Cavalgar (Cavalo): -3.",
                    prereq: "DX-5 ou Adestramento de Animais (Camelo)-3", 
                    default: "DX-5 ou Adestramento de Animais (Camelo)-3"
                },
                {
                    id: "cavalgar-dragao",
                    nome: "Cavalgar (Dragão)",
                    atributo: "DX",
                    dificuldade: "Média",
                    custoBase: 2,
                    descricao: "Montar e controlar dragões. Default de Cavalgar (Cavalo): -10.",
                    prereq: "DX-5 ou Adestramento de Animais (Dragão)-3",
                    default: "DX-5 ou Adestramento de Animais (Dragão)-3"
                },
               {
    id: "cavalgar-outro", // Pode manter este ID
    nome: "🖊️ Cavalgar (Digitar Animal)", // Adiciona ícone
    atributo: "DX",
    dificuldade: "Média",
    custoBase: 2,
    descricao: "CLIQUE AQUI para digitar qualquer animal não listado (Elefante, Griffon, Pégaso, etc.).",
    prereq: "DX-5 ou Adestramento de Animais-3",
    default: "DX-5 ou Adestramento de Animais-3 (consultar mestre)",
    tipo: "personalizado" 
}

            ]
        }
    },
    
    // CATEGORIA DX (não combate)
    "DX": [
        {
            id: "acrobacia",
            nome: "Acrobacia",
            atributo: "DX",
            dificuldade: "Difícil",
            custoBase: 4,
            descricao: "Realizar acrobacias, saltos, equilíbrios e manobras acrobáticas complexas.",
            prereq: "DX-6",
            default: "DX-6",
            categoria: "DX",
            tipo: "pericia-simples"
        },
        {
            id: "atletismo",
            nome: "Atletismo",
            atributo: "DX",
            dificuldade: "Fácil",
            custoBase: 1,
            descricao: "Habilidade geral em atividades atléticas como escalada, natação, salto e arremesso.",
            prereq: "DX-4",
            default: "DX-4",
            categoria: "DX",
            tipo: "pericia-simples"
        },
        // PERÍCIA CAVALGAR (APARECE NO FILTRO DX)
        {
            id: "grupo-cavalgar",
            nome: "Cavalgar",
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Habilidade em montar e controlar animais. Cada animal é uma especialização diferente.",
            prereq: "DX-5 ou Adestramento de Animais (mesma)-3",
            default: "DX-5 ou Adestramento de Animais (mesma)-3. Defaults: Cavalo→Mula (0), Cavalo→Camelo (-3), Cavalo→Golfinho (-6), Cavalo→Dragão (-10)",
            categoria: "DX",
            tipo: "grupo-especializacao",
            grupo: "Cavalgar",
            origem: "Especializacao - Cavalgar"
        }
    ],
    
    // CATEGORIA IQ
    "IQ": [
        {
            id: "labia",
            nome: "Lábia",
            atributo: "IQ",
            dificuldade: "Média",
            custoBase: 1,
            descricao: "Conhecimento sobre eventos atuais, fofocas e notícias locais.",
            prereq: "IQ-5",
            default: "IQ-5",
            categoria: "IQ",
            tipo: "pericia-simples"
        }
    ],
    
    // CATEGORIA HT
    "HT": [
        {
            id: "corrida",
            nome: "Corrida",
            atributo: "HT",
            dificuldade: "Fácil",
            custoBase: 1,
            descricao: "Habilidade em correr eficientemente, manter ritmo e recuperar fôlego.",
            prereq: "HT-4",
            default: "HT-4",
            categoria: "HT",
            tipo: "pericia-simples"
        }
    ],
    
    // CATEGORIA PERC (Percepção)
    "PERC": [
        {
            id: "observacao",
            nome: "Observação",
            atributo: "PERC",
            dificuldade: "Fácil",
            custoBase: 1,
            descricao: "Perceber detalhes visuais, encontrar objetos escondidos e notar anomalias.",
            prereq: "PERC-4",
            default: "PERC-4",
            categoria: "PERC",
            tipo: "pericia-simples"
        }
    ]
};

// Funções auxiliares para o catálogo
function obterTodasPericiasSimples() {
    const todas = [];
    
    // Percorre todas as categorias
    for (const categoria in catalogoPericias) {
        if (categoria === "Combate" || categoria === "Especializacao") {
            // Ambas têm estrutura de grupos
            for (const grupo in catalogoPericias[categoria]) {
                if (catalogoPericias[categoria][grupo].tipo === "modal-escolha") {
                    todas.push({
                        id: `grupo-${grupo.toLowerCase().replace(/ /g, '-')}`,
                        nome: catalogoPericias[categoria][grupo].nome,
                        atributo: catalogoPericias[categoria][grupo].atributo,
                        dificuldade: "Média",
                        custoBase: 2,
                        descricao: catalogoPericias[categoria][grupo].descricao,
                        prereq: "Varia por especialização",
                        default: "Varia por especialização",
                        categoria: catalogoPericias[categoria][grupo].categoria,
                        tipo: "grupo-especializacao",
                        grupo: grupo,
                        origem: `${categoria} - ${grupo}`
                    });
                }
            }
        } else {
            // Categorias normais (DX, IQ, HT, PERC)
            catalogoPericias[categoria].forEach(pericia => {
                todas.push({
                    ...pericia,
                    origem: categoria
                });
            });
        }
    }
    
    return todas;
}

function obterEspecializacoes(grupo) {
    // Procura em Combate E em Especializacao
    const categorias = ["Combate", "Especializacao"];
    
    for (const categoria of categorias) {
        if (catalogoPericias[categoria] && catalogoPericias[categoria][grupo]) {
            const dadosGrupo = catalogoPericias[categoria][grupo];
            if (dadosGrupo.pericias && Array.isArray(dadosGrupo.pericias)) {
                return dadosGrupo.pericias;
            }
        }
    }
    
    return [];
}

function buscarPericiaPorId(id) {
    const todas = obterTodasPericiasSimples();
    return todas.find(p => p.id === id);
}

function buscarPericiaPorNome(nome) {
    const todas = obterTodasPericiasSimples();
    return todas.find(p => p.nome.toLowerCase() === nome.toLowerCase());
}

// Exportar funções úteis
window.catalogoPericias = catalogoPericias;
window.obterTodasPericiasSimples = obterTodasPericiasSimples;
window.obterEspecializacoes = obterEspecializacoes;
window.buscarPericiaPorId = buscarPericiaPorId;
window.buscarPericiaPorNome = buscarPericiaPorNome;
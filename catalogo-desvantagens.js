// catalogo-desvantagens.js - CATÁLOGO DE DESVANTAGENS

const DESVANTAGENS_CATALOGO = {
    // ===== DESVANTAGENS SIMPLES (custo fixo) =====
    "altruísmo": {
        id: "altruísmo",
        nome: "Altruísmo", 
        custo: -5,
        categoria: "mental",
        descricao: "Coloca outros na frente de si mesmo. Teste de Autocontrole para priorizar próprias necessidades."
    },

    // ===== DESVANTAGENS COM OPÇÕES (escolhe UMA) =====
    "alcoolismo": {
        id: "alcoolismo",
        nome: "Alcoolismo",
        custo: "variavel", 
        categoria: "mental",
        descricao: "Viciado em álcool. Teste de Vontade para resistir quando vê álcool.",
        tipoConfiguracao: "opcoes",
        opcoes: [
            {
                id: "alcoolismo_legal",
                nome: "Alcoolismo (Legal)",
                custo: -15,
                descricao: "Vício em álcool legal. Bebedeira de 2d horas se falhar no teste."
            },
            {
                id: "alcoolismo_ilegal",
                nome: "Alcoolismo (Ilegal)", 
                custo: -20,
                descricao: "Vício em álcool ilegal. Bebedeira de 2d horas se falhar no teste."
            }
        ]
    },

    // ===== DESVANTAGENS COM NÍVEIS =====
    "barulhento": {
        id: "barulhento",
        nome: "Barulhento",
        custo: "variavel",
        categoria: "fisica", 
        descricao: "Faz barulho constante! Penalidades em Furtividade e bônus para outros ouvirem.",
        tipoConfiguracao: "niveis",
        config: {
            custoBase: -2,
            maxNivel: 5,
            descricaoNiveis: "Cada nível: +2 para outros ouvirem, -2 em Furtividade"
        }
    },

    // ===== DESVANTAGENS COMPLEXAS =====
    "dependentes": {
        id: "dependentes",
        nome: "Dependentes",
        custo: "variavel", 
        categoria: "social",
        descricao: "Personagens que dependem do PJ para proteção e sustento.",
        tipoConfiguracao: "dependentes",
        config: {
            opcoes: [
                {
                    id: "dependente_ocasional",
                    nome: "Dependente Ocasional",
                    custo: -5,
                    descricao: "Aparece com frequência 9 ou menos"
                },
                {
                    id: "dependente_frequente",
                    nome: "Dependente Frequente",
                    custo: -10,
                    descricao: "Aparece com frequência 12 ou menos"
                },
                {
                    id: "dependente_constante",
                    nome: "Dependente Constante", 
                    custo: -15,
                    descricao: "Aparece com frequência 15 ou menos"
                }
            ]
        }
    },

    "inimigo": {
        id: "inimigo",
        nome: "Inimigo", 
        custo: "variavel",
        categoria: "social",
        descricao: "Alguém ou algum grupo que quer prejudicar o personagem.",
        tipoConfiguracao: "inimigo",
        config: {
            opcoes: [
                {
                    id: "inimigo_fracasso",
                    nome: "Inimigo (Incompetente)",
                    custo: -5,
                    descricao: "Inimigo fraco, aparece raramente"
                },
                {
                    id: "inimigo_normal", 
                    nome: "Inimigo (Normal)",
                    custo: -10,
                    descricao: "Inimigo de poder similar, aparece ocasionalmente"
                },
                {
                    id: "inimigo_poderoso",
                    nome: "Inimigo (Poderoso)",
                    custo: -20,
                    descricao: "Inimigo mais poderoso, aparece frequentemente"
                }
            ]
        }
    },

    "mau_carater": {
        id: "mau_carater",
        nome: "Mau Caráter",
        custo: -15,
        categoria: "mental",
        descricao: "Personagem tende a ser desonesto, traiçoeiro ou cruel. Teste de Autocontrole para agir honestamente."
    },

    "vício": {
        id: "vício",
        nome: "Vício",
        custo: "variavel",
        categoria: "mental",
        descricao: "Dependência de substância ou atividade. Teste de Vontade para resistir.",
        tipoConfiguracao: "vicio", 
        config: {
            opcoes: [
                {
                    id: "vicio_leve",
                    nome: "Vício Leve",
                    custo: -5,
                    descricao: "Substância barata, fácil de obter"
                },
                {
                    id: "vicio_moderado",
                    nome: "Vício Moderado",
                    custo: -10,
                    descricao: "Substância de custo moderado, disponibilidade normal"
                },
                {
                    id: "vicio_grave",
                    nome: "Vício Grave", 
                    custo: -15,
                    descricao: "Substância cara, difícil de obter"
                },
                {
                    id: "vicio_ilegal",
                    nome: "Vício Ilegal",
                    custo: -20,
                    descricao: "Substância ilegal, muito perigosa"
                }
            ]
        }
    },

    "medo": {
        id: "medo",
        nome: "Medo",
        custo: "variavel",
        categoria: "mental", 
        descricao: "Fobia irracional de algo específico. Teste de Vontade quando confrontado.",
        tipoConfiguracao: "medo",
        config: {
            opcoes: [
                {
                    id: "medo_leve",
                    nome: "Medo (Leve)",
                    custo: -5,
                    descricao: "Ocorre raramente no cenário"
                },
                {
                    id: "medo_moderado",
                    nome: "Medo (Moderado)", 
                    custo: -10,
                    descricao: "Ocorre ocasionalmente no cenário"
                },
                {
                    id: "medo_grave",
                    nome: "Medo (Grave)",
                    custo: -15,
                    descricao: "Ocorre frequentemente no cenário"
                },
                {
                    id: "medo_paralisante",
                    nome: "Medo (Paralisante)",
                    custo: -20,
                    descricao: "Ocorre muito frequentemente, efeitos severos"
                }
            ]
        }
    },

    "mau_olhado": {
        id: "mau_olhado",
        nome: "Mau Olhado",
        custo: -10,
        categoria: "sobrenatural",
        descricao: "Personagem tem má sorte constante. -1 em todos os testes de sorte."
    },

    "miserável": {
        id: "miserável", 
        nome: "Miserável",
        custo: -25,
        categoria: "social",
        descricao: "Extremamente pobre. Renda 10% do normal, começa sem equipamento."
    },

    "fraqueza": {
        id: "fraqueza",
        nome: "Fraqueza",
        custo: "variavel",
        categoria: "fisica",
        descricao: "Vulnerabilidade a um tipo específico de ataque.",
        tipoConfiguracao: "fraqueza",
        config: {
            opcoes: [
                {
                    id: "fraqueza_menor",
                    nome: "Fraqueza Menor",
                    custo: -5,
                    descricao: "Dano moderado do tipo específico"
                },
                {
                    id: "fraqueza_maior",
                    nome: "Fraqueza Maior",
                    custo: -10,
                    descricao: "Dano severo do tipo específico" 
                },
                {
                    id: "fraqueza_mortal",
                    nome: "Fraqueza Mortal",
                    custo: -15,
                    descricao: "Dano catastrófico do tipo específico"
                }
            ]
        }
    }
};

// ===== INICIALIZAÇÃO DO CATÁLOGO =====
if (typeof window !== 'undefined') {
    window.DESVANTAGENS_CATALOGO = DESVANTAGENS_CATALOGO;
    console.log('Catálogo de Desvantagens carregado!', Object.keys(DESVANTAGENS_CATALOGO).length + ' desvantagens disponíveis');
}
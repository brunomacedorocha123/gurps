// CATÁLOGO DE VANTAGENS E DESVANTAGENS - VERSÃO CORRIGIDA
const vantagensData = {
    // VANTAGENS
    vantagens: [
        {
            id: "abencoado",
            nome: "Abençoado",
            categoria: "mental",
            custo: 10,
            tipo: "multipla",
            descricao: "O personagem está sintonizado com uma entidade divina/demoníaca/espiritual. Deve seguir as regras da entidade sob risco de perder a vantagem.",
            variacoes: [
                {
                    id: "abencoado-basico",
                    nome: "Abençoado",
                    custo: 10,
                    descricao: "Recebe visões após 1h de ritual. Teste secreto de IQ. Custa 10 PF. +1 de reação com seguidores."
                },
                {
                    id: "muito-abencoado", 
                    nome: "Muito Abençoado",
                    custo: 20,
                    descricao: "+5 no teste de IQ para visões. +2 de reação com seguidores. Mesmos requisitos do básico."
                },
                {
                    id: "feitos-heroicos",
                    nome: "Feitos Heroicos", 
                    custo: 10,
                    descricao: "1x por sessão: +1 dado em ST, DX ou HT por 3d segundos. Escolhe atributo ao comprar."
                }
            ]
        },
        {
            id: "abascanto",
            nome: "Abascanto (Resistência à Magia)",
            categoria: "mental", 
            custo: 2,
            tipo: "variavel",
            descricao: "Resistência natural à magia. Nível subtraído da habilidade mágica de oponentes. Não pode ser desligada.",
            niveis: 10,
            custoPorNivel: 2,
            nivelBase: 1,
            limitacoes: "Não funciona contra projéteis mágicos, armas mágicas ou adivinhação. Não afeta poderes não-mágicos.",
            ampliacoes: [
                {
                    id: "ampliada",
                    nome: "Ampliada",
                    custoExtra: 2.5, // CORRIGIDO: +150% (1 + 1.5 = 2.5)
                    descricao: "Permite combinar com Aptidão Mágica. Custo aumentado em 150% (2,5× o custo normal)"
                }
            ]
        }
    ],

    // DESVANTAGENS  
    desvantagens: [
        {
            id: "alcoolismo",
            nome: "Alcoolismo",
            categoria: "mental",
            custo: -15,
            tipo: "multipla", 
            descricao: "Vício em álcool. Teste de Vontade quando exposto ao álcool. Bebedeira dura 2d horas com oscilações de humor.",
            variacoes: [
                {
                    id: "alcoolismo-normal",
                    nome: "Alcoolismo",
                    custo: -15,
                    descricao: "Vício legal e incapacitante. Teste de Vontade quando vê álcool."
                },
                {
                    id: "alcoolismo-ilegal",
                    nome: "Alcoolismo (Ilegal)", 
                    custo: -20,
                    descricao: "Vício ilegal na sociedade. Mesmos efeitos, custo maior."
                }
            ],
            efeitosLongoPrazo: "Teste anual de HT+2. Falha: perde 1 ponto em atributo aleatório."
        },
        {
            id: "altruismo",
            nome: "Altruísmo",
            categoria: "mental",
            custo: -5,
            tipo: "simples",
            descricao: "Coloca os outros sempre em primeiro lugar. Teste de autocontrole para priorizar próprias necessidades.",
            restricoes: "Até mesmo sobrevivência própria pode ser negligenciada."
        }
    ]
};
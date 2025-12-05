// CATÁLOGO DE VANTAGENS E DESVANTAGENS - VERSÃO FUNCIONAL
const vantagensData = {
    vantagens: [
        {
            id: "abencoado",
            nome: "Abençoado",
            categoria: "mental",
            tipo: "multipla",
            descricao: "Sintonizado com uma entidade divina/demoníaca/espiritual.",
            variacoes: [
                {
                    id: "abencoado-basico",
                    nome: "Abençoado",
                    custo: 10,
                    descricao: "Recebe visões após 1h de ritual. Teste secreto de IQ."
                },
                {
                    id: "muito-abencoado", 
                    nome: "Muito Abençoado",
                    custo: 20,
                    descricao: "+5 no teste de IQ para visões. +2 de reação."
                },
                {
                    id: "feitos-heroicos",
                    nome: "Feitos Heroicos", 
                    custo: 10,
                    descricao: "1x por sessão: +1 dado em ST, DX ou HT por 3d segundos."
                }
            ]
        },
        {
            id: "abascanto",
            nome: "Abascanto (Resistência à Magia)",
            categoria: "mental", 
            tipo: "variavel",
            descricao: "Resistência natural à magia.",
            niveis: 10,
            custoPorNivel: 2,
            nivelBase: 1
        },
        {
            id: "sentidos-aprimorados",
            nome: "Sentidos Aprimorados",
            categoria: "fisica",
            custo: 5,
            tipo: "simples",
            descricao: "Visão, audição ou olfato aguçados. +2 em percepção."
        }
    ],
    
    desvantagens: [
        {
            id: "alcoolismo",
            nome: "Alcoolismo",
            categoria: "mental",
            tipo: "multipla",
            descricao: "Vício em álcool.",
            variacoes: [
                {
                    id: "alcoolismo-normal",
                    nome: "Alcoolismo",
                    custo: -15,
                    descricao: "Vício legal e incapacitante."
                },
                {
                    id: "alcoolismo-ilegal",
                    nome: "Alcoolismo (Ilegal)", 
                    custo: -20,
                    descricao: "Vício ilegal na sociedade."
                }
            ]
        },
        {
            id: "altruismo",
            nome: "Altruísmo",
            categoria: "mental",
            custo: -5,
            tipo: "simples",
            descricao: "Coloca os outros sempre em primeiro lugar."
        },
        {
            id: "medo-de-altura",
            nome: "Medo de Altura",
            categoria: "mental",
            custo: -10,
            tipo: "simples",
            descricao: "Fobia de alturas. Teste de medo em lugares altos."
        }
    ]
};
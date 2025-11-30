// catalogo-vantagens.js - CATÁLOGO DE VANTAGENS

const VANTAGENS_CATALOGO = {
    // ===== VANTAGENS SIMPLES (custo fixo) =====
    "ambidestria": {
        id: "ambidestria",
        nome: "Ambidestria",
        custo: 5,
        categoria: "fisica",
        descricao: "Capaz de lutar e manusear igualmente bem com qualquer uma das mãos. Não sofre penalidade de -4 por usar a mão inábil."
    },

    // ===== VANTAGENS COM OPÇÕES (escolhe UMA) =====
    "abençoado": {
        id: "abençoado",
        nome: "Abençoado",
        custo: "variavel",
        categoria: "mental",
        descricao: "Sintonizado com um deus, senhor demoníaco, grande espírito, poder cósmico, etc.",
        tipoConfiguracao: "opcoes",
        opcoes: [
            {
                id: "abençoado_base",
                nome: "Abençoado",
                custo: 10,
                descricao: "Recebe visões após 1h de comunhão. Perde 10 PF. +1 reação de seguidores."
            },
            {
                id: "muito_abençoado", 
                nome: "Muito Abençoado",
                custo: 20,
                descricao: "Bônus +5 no teste de IQ para interpretar visões. +2 reação de seguidores."
            },
            {
                id: "feitos_heroicos",
                nome: "Feitos Heroicos",
                custo: 10, 
                descricao: "1x por sessão adiciona 1 dado à ST, DX ou HT por 3d segundos."
            }
        ]
    },

    "adaptabilidade_cultural": {
        id: "adaptabilidade_cultural",
        nome: "Adaptabilidade Cultural", 
        custo: "variavel",
        categoria: "social",
        descricao: "Familiarizado com uma grande variedade de culturas.",
        tipoConfiguracao: "opcoes",
        opcoes: [
            {
                id: "adaptabilidade_base",
                nome: "Adaptabilidade Cultural",
                custo: 10,
                descricao: "Familiarizado com todas as culturas de sua própria raça."
            },
            {
                id: "xeno_adaptabilidade",
                nome: "Xeno-Adaptabilidade", 
                custo: 20,
                descricao: "Familiarizado com todas as culturas do cenário, independente da raça."
            }
        ]
    },

    // ===== VANTAGENS COMPLEXAS =====
    "aptidão_mágica": {
        id: "aptidão_mágica", 
        nome: "Aptidão Mágica",
        custo: "variavel",
        categoria: "mental",
        descricao: "Adepto da magia. Capacidade de detectar e utilizar magia com bônus.",
        tipoConfiguracao: "aptidao_magica",
        config: {
            niveis: [
                {
                    nivel: 0,
                    nome: "Aptidão Mágica 0",
                    custoBase: 5,
                    descricao: "Consciência mágica básica - detecta objetos encantados. Pré-requisito para magia."
                },
                {
                    nivel: 1,
                    nome: "Aptidão Mágica 1", 
                    custoBase: 15,
                    descricao: "+1 em IQ para aprender magias, +1 Percepção para detectar magia, -10% tempo aprendizado"
                },
                {
                    nivel: 2,
                    nome: "Aptidão Mágica 2",
                    custoBase: 25,
                    descricao: "+2 em IQ para aprender magias, +2 Percepção para detectar magia, -20% tempo aprendizado"
                },
                {
                    nivel: 3,
                    nome: "Aptidão Mágica 3",
                    custoBase: 35, 
                    descricao: "+3 em IQ para aprender magias, +3 Percepção para detectar magia, -30% tempo aprendizado"
                },
                {
                    nivel: 4,
                    nome: "Aptidão Mágica 4",
                    custoBase: 45,
                    descricao: "+4 em IQ para aprender magias, +4 Percepção para detectar magia, -40% tempo aprendizado"
                }
            ],
            limitacoes: [
                {
                    id: "canção",
                    nome: "Canção",
                    valor: -0.4,
                    descricao: "Tem que cantar para fazer mágicas. Nunca fica isento de falar durante rituais."
                },
                {
                    id: "dança",
                    nome: "Dança", 
                    valor: -0.4,
                    descricao: "Tem que estar livre para realizar movimentos. Nunca fica isento de movimentos durante rituais."
                },
                {
                    id: "manifestação_diurna",
                    nome: "Manifestação Diurna",
                    valor: -0.4, 
                    descricao: "Só usa poderes quando o sol está no céu (6h-18h)."
                },
                {
                    id: "manifestação_noturna",
                    nome: "Manifestação Noturna",
                    valor: -0.4,
                    descricao: "Só usa poderes quando o sol não está no céu (18h-6h)." 
                },
                {
                    id: "manifestação_obscura",
                    nome: "Manifestação Obscura",
                    valor: -0.5,
                    descricao: "Só usa poderes na escuridão total."
                },
                {
                    id: "musical",
                    nome: "Musical",
                    valor: -0.5,
                    descricao: "Tem que utilizar instrumento musical para fazer mágicas."
                },
                {
                    id: "solitária",
                    nome: "Solitária", 
                    valor: -0.4,
                    descricao: "Penalidade de -3 para cada ser inteligente próximo."
                },
                {
                    id: "uma_única_escola", 
                    nome: "Uma Única Escola",
                    valor: -0.4,
                    descricao: "Aptidão favorece apenas mágicas de uma escola específica."
                }
            ]
        }
    },

    // ===== VANTAGENS COM NÍVEIS =====
    "aliados": {
        id: "aliados",
        nome: "Aliados", 
        custo: "variavel",
        categoria: "social",
        descricao: "Parceiros confiáveis que acompanham o personagem em aventuras.",
        tipoConfiguracao: "niveis",
        config: {
            custoBase: 1,
            maxNivel: 10,
            descricaoNiveis: "Custo varia conforme poder do aliado (25% a 150% dos pontos do personagem)"
        }
    }
};

// ===== INICIALIZAÇÃO DO CATÁLOGO =====
if (typeof window !== 'undefined') {
    window.VANTAGENS_CATALOGO = VANTAGENS_CATALOGO;
    console.log('Catálogo de Vantagens carregado!', Object.keys(VANTAGENS_CATALOGO).length + ' vantagens disponíveis');
}
// catalogo-vantagens.js - Catálogo de vantagens (DADOS PUROS)

const CATEGORIAS_VANTAGENS = {
    FISICAS: 'fisicas',
    MENTAIS: 'mentais',
    SOBRENATURAIS: 'sobrenaturais',
    SOCIAIS: 'sociais',
    SUPERS: 'supers'
};

// Catálogo completo
const CATALOGO_VANTAGENS = {
    
    // ===== 1. AMBIDESTRIA (SIMPLES) =====
    ambidestria: {
        id: "ambidestria",
        nome: "Ambidestria",
        custo: 5,
        categoria: CATEGORIAS_VANTAGENS.FISICAS,
        tipo: "simples",
        descricao: "Capacidade de lutar e manusear igualmente bem com qualquer uma das mãos. Nunca sofre penalidade de -4 na DX por usar a mão inábil. Se um acidente ocorrer com qualquer um dos braços, assume-se que foi com o esquerdo.",
        detalhes: "Não permite ações adicionais no combate. Para isso precisa de Ataque Adicional.",
        prerequisitos: "Nenhum",
        tags: ["combate", "físico", "habilidade"]
    },

    // ===== 2. ABENÇOADO (COM OPÇÕES) =====
    abençoado: {
        id: "abençoado",
        nome: "Abençoado",
        categoria: CATEGORIAS_VANTAGENS.SOBRENATURAIS,
        tipo: "opcoes",
        descricao: "O personagem está sintonizado com um deus, senhor demoníaco, grande espírito, poder cósmico, etc. Perde a vantagem se não agir de acordo com as regras da entidade.",
        prerequisitos: "Devoção à entidade",
        tags: ["divino", "sobrenatural", "religião"],
        
        opcoes: [
            {
                id: "abençoado_basico",
                nome: "Abençoado",
                custo: 10,
                descricao: "Após comungar por pelo menos uma hora, recebe visões ou presságios sobre eventos futuros. Teste de IQ do Mestre para informação útil.",
                efeitos: [
                    "Recebe visões após 1 hora de comunhão",
                    "Perde 10 PF após o ritual",
                    "+1 de reação de seguidores da entidade"
                ]
            },
            {
                id: "abençoado_avancado",
                nome: "Muito Abençoado",
                custo: 20,
                descricao: "Como Abençoado, mas com bônus de +5 no teste de IQ para interpretar visões.",
                efeitos: [
                    "Bônus +5 em teste de IQ para interpretar visões",
                    "+2 de reação de seguidores",
                    "Demais efeitos como Abençoado"
                ]
            },
            {
                id: "abençoado_feitos",
                nome: "Feitos Heroicos",
                custo: 10,
                descricao: "Uma vez por sessão, pode adicionar 1 dado à ST, DX ou HT por 3d segundos.",
                efeitos: [
                    "1 vez por sessão: +1 dado em ST, DX ou HT",
                    "Duração: 3d segundos",
                    "Ao terminar: sofre todas penalidades acumuladas",
                    "Escolher característica ao comprar"
                ]
            }
        ]
    },

    // ===== 3. APTIDÃO MÁGICA (COM NÍVEIS) =====
    aptidaoMagica: {
        id: "aptidaoMagica",
        nome: "Aptidão Mágica",
        categoria: CATEGORIAS_VANTAGENS.SOBRENATURAIS,
        tipo: "niveis",
        nivelMin: 0,
        nivelMax: 5,
        custoBase: 5,      // Nível 0
        custoPorNivel: 10, // Cada nível adicional
        descricao: "Capacidade mágica dividida em níveis. Aptidão Mágica 0 é pré-requisito para magia. Níveis mais altos facilitam aprendizado e uso de magias.",
        prerequisitos: "Nenhum para nível 0",
        tags: ["magia", "sobrenatural", "poder"],
        
        detalhesNiveis: {
            0: "Consciência mágica básica. Detecta objetos encantados ao ver/tocar.",
            1: "+1 IQ para aprender magias, +1 Percepção detectar magia, -10% tempo aprendizado",
            2: "+2 IQ para aprender magias, +2 Percepção detectar magia, -20% tempo aprendizado",
            3: "+3 IQ para aprender magias, +3 Percepção detectar magia, -30% tempo aprendizado",
            4: "+4 IQ para aprender magias, +4 Percepção detectar magia, -40% tempo aprendizado",
            5: "+5 IQ para aprender magias, +5 Percepção detectar magia, -50% tempo aprendizado"
        },
        
        limitacoes: [
            { id: "canção", nome: "Canção", descricao: "Tem que cantar para fazer mágicas", desconto: 40 },
            { id: "dança", nome: "Dança", descricao: "Tem que dançar para fazer mágicas", desconto: 40 },
            { id: "diurna", nome: "Manifestação Diurna", descricao: "Só funciona durante o dia", desconto: 40 },
            { id: "noturna", nome: "Manifestação Noturna", descricao: "Só funciona durante a noite", desconto: 40 },
            { id: "obscura", nome: "Manifestação Obscura", descricao: "Só funciona no escuro", desconto: 50 },
            { id: "musical", nome: "Musical", descricao: "Precisa de instrumento musical", desconto: 50 },
            { id: "solitária", nome: "Solitária", descricao: "Penalidade com pessoas próximas", desconto: 40 },
            { id: "escolaUnica", nome: "Uma Única Escola", descricao: "Só funciona com uma escola", desconto: 40 }
        ],
        
        efeitosPorNivel: [
            "Adiciona nível à IQ para aprender magias",
            "Adiciona nível à Percepção para detectar magia",
            "Reduz tempo de aprendizado em 10% por nível (mínimo 60%)",
            "Permite magias mais poderosas (nível mínimo de aptidão)"
        ]
    },

    // ===== EXEMPLOS ADICIONAIS PARA TESTE =====
    
    visaoNoturna: {
        id: "visaoNoturna",
        nome: "Visão Noturna",
        custo: 2,
        categoria: CATEGORIAS_VANTAGENS.FISICAS,
        tipo: "simples",
        descricao: "Capacidade de enxergar no escuro como se estivesse em penumbra.",
        detalhes: "Ignora penalidades por falta de iluminação até escuridão total.",
        tags: ["sentidos", "percepção", "noite"]
    },

    sentidosAguçados: {
        id: "sentidosAguçados",
        nome: "Sentidos Aguçados",
        categoria: CATEGORIAS_VANTAGENS.MENTAIS,
        tipo: "niveis",
        nivelMin: 1,
        nivelMax: 5,
        custoBase: 2,
        custoPorNivel: 2,
        descricao: "Sentidos excepcionalmente desenvolvidos. Cada nível fornece bônus em testes de Percepção.",
        tags: ["sentidos", "percepção", "mental"],
        opcoesPorNivel: [
            { id: "audicao", nome: "Audição", descricao: "Ouvido aguçado" },
            { id: "visao", nome: "Visão", descricao: "Visão aguçada" },
            { id: "olfato", nome: "Olfato", descricao: "Faro aguçado" },
            { id: "tato", nome: "Tato", descricao: "Sensibilidade tátil" }
        ]
    }
};

// Funções auxiliares do catálogo
const CatalogoVantagens = {
    
    /**
     * Obtém todas as vantagens
     * @returns {Array} - Lista de vantagens
     */
    getTodas: function() {
        return Object.values(CATALOGO_VANTAGENS);
    },

    /**
     * Obtém vantagens por categoria
     * @param {string} categoria - Categoria desejada
     * @returns {Array} - Vantagens da categoria
     */
    getPorCategoria: function(categoria) {
        if (categoria === 'todas') {
            return this.getTodas();
        }
        return this.getTodas().filter(v => v.categoria === categoria);
    },

    /**
     * Busca vantagens por termo
     * @param {string} termo - Termo de busca
     * @returns {Array} - Vantagens encontradas
     */
    buscar: function(termo) {
        if (!termo) return this.getTodas();
        
        const termoLower = termo.toLowerCase();
        return this.getTodas().filter(vantagem => {
            return vantagem.nome.toLowerCase().includes(termoLower) ||
                   vantagem.descricao.toLowerCase().includes(termoLower) ||
                   vantagem.tags?.some(tag => tag.toLowerCase().includes(termoLower));
        });
    },

    /**
     * Obtém vantagem por ID
     * @param {string} id - ID da vantagem
     * @returns {Object|null} - Vantagem encontrada ou null
     */
    getPorId: function(id) {
        return CATALOGO_VANTAGENS[id] || null;
    },

    /**
     * Obtém informações de uma categoria
     * @param {string} categoria - Categoria
     * @returns {Object} - Informações da categoria
     */
    getInfoCategoria: function(categoria) {
        const infos = {
            [CATEGORIAS_VANTAGENS.FISICAS]: { 
                nome: "Físicas", 
                icone: "fas fa-dumbbell", 
                cor: "#4cd964",
                descricao: "Habilidades e capacidades físicas"
            },
            [CATEGORIAS_VANTAGENS.MENTAIS]: { 
                nome: "Mentais", 
                icone: "fas fa-brain", 
                cor: "#6c8ef5",
                descricao: "Habilidades mentais e psíquicas"
            },
            [CATEGORIAS_VANTAGENS.SOBRENATURAIS]: { 
                nome: "Sobrenaturais", 
                icone: "fas fa-magic", 
                cor: "#9b87f5",
                descricao: "Poderes mágicos e sobrenaturais"
            },
            [CATEGORIAS_VANTAGENS.SOCIAIS]: { 
                nome: "Sociais", 
                icone: "fas fa-handshake", 
                cor: "#f5a742",
                descricao: "Habilidades sociais e de influência"
            },
            [CATEGORIAS_VANTAGENS.SUPERS]: { 
                nome: "Supers", 
                icone: "fas fa-bolt", 
                cor: "#ff6b6b",
                descricao: "Poderes super-humanos"
            }
        };
        
        return infos[categoria] || { 
            nome: categoria, 
            icone: "fas fa-question", 
            cor: "#cccccc",
            descricao: "Categoria não especificada"
        };
    },

    /**
     * Obtém todas as categorias disponíveis
     * @returns {Array} - Lista de categorias
     */
    getCategoriasDisponiveis: function() {
        const categorias = new Set();
        this.getTodas().forEach(v => categorias.add(v.categoria));
        return Array.from(categorias).map(cat => ({
            id: cat,
            ...this.getInfoCategoria(cat)
        }));
    },

    /**
     * Retorna estatísticas do catálogo
     * @returns {Object} - Estatísticas
     */
    getEstatisticas: function() {
        const todas = this.getTodas();
        return {
            totalVantagens: todas.length,
            porCategoria: this.getCategoriasDisponiveis().map(cat => ({
                categoria: cat.nome,
                quantidade: this.getPorCategoria(cat.id).length
            })),
            porTipo: {
                simples: todas.filter(v => v.tipo === 'simples').length,
                opcoes: todas.filter(v => v.tipo === 'opcoes').length,
                niveis: todas.filter(v => v.tipo === 'niveis').length
            }
        };
    }
};

// Tornar disponível globalmente (para site)
window.CatalogoVantagens = CatalogoVantagens;
window.CATEGORIAS_VANTAGENS = CATEGORIAS_VANTAGENS;
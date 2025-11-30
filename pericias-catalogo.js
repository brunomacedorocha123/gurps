// ===== CATÁLOGO DE PERÍCIAS - GURPS =====
// Versão 3.0 - Catálogo Completo com Todas as Armas

// CORREÇÃO PRINCIPAL: Exportar diretamente para window
window.catalogoPericias = {
    // PERÍCIAS DE COMBATE (Base DX) - CATÁLOGO COMPLETO
    "Combate": [
        // ===== ESGRIMA =====
        {
            id: "esgrima-rapieira",
            nome: "Rapieira",
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Armas longas e leves de estocar. Penalidade por carga.",
            prereq: "Espadas de Lâmina Larga-4",
            categoria: "Combate",
            subcategoria: "Esgrima"
        },
        {
            id: "esgrima-sabre", 
            nome: "Sabre",
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Armas leves de cortar e estocar. Sabres leves.",
            prereq: "Espadas de Lâmina Larga-4",
            categoria: "Combate",
            subcategoria: "Esgrima"
        },
        {
            id: "esgrima-adaga",
            nome: "Adaga de Esgrima",
            atributo: "DX",
            dificuldade: "Média", 
            custoBase: 2,
            descricao: "Armas usadas com mão inábil. Evita penalidade de defesa.",
            prereq: "Jitte/Sai-4 ou Faca-4",
            categoria: "Combate",
            subcategoria: "Esgrima"
        },
        {
            id: "esgrima-tercado",
            nome: "Terçado",
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Armas curtas e leves de estocar. Bastões de artes marciais.",
            prereq: "Espadas Curtas-4",
            categoria: "Combate",
            subcategoria: "Esgrima"
        },

        // ===== ARMAS DE HASTE =====
        {
            id: "haste-lanca",
            nome: "Lança", 
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Armas de haste longas com ponta. Dardos, tridentes.",
            prereq: "Armas de Haste-4",
            categoria: "Combate",
            subcategoria: "Armas de Haste"
        },
        {
            id: "haste-bastao",
            nome: "Bastão",
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Hastes longas equilibradas. Bônus +2 em Aparar.",
            prereq: "Armas de Haste-4",
            categoria: "Combate",
            subcategoria: "Armas de Haste"
        },
        {
            id: "haste-armas-haste",
            nome: "Armas de Haste",
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Hastes muito longas com cabeça pesada. Glaive, alabarda.",
            prereq: "Lança-4 ou Bastão-4",
            categoria: "Combate",
            subcategoria: "Armas de Haste"
        },

        // ===== ARMAS DE IMPACTO =====
        {
            id: "impacto-maca-machado",
            nome: "Maça/Machado",
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Armas de impacto de uma mão. Machado, maça, picareta.",
            prereq: "Mangual-4",
            categoria: "Combate",
            subcategoria: "Armas de Impacto"
        },
        {
            id: "impacto-maca-machado-2maos",
            nome: "Maça/Machado de Duas Mãos",
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Armas de impacto longas. Bastão de beisebol, marreta.",
            prereq: "Armas de Haste-4",
            categoria: "Combate",
            subcategoria: "Armas de Impacto"
        },

        // ===== CHICOTES =====
        {
            id: "chicote-normal",
            nome: "Chicote",
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Armas flexíveis de couro/corrente. Ótimas para desarmar.",
            prereq: "Nenhum",
            categoria: "Combate",
            subcategoria: "Chicotes"
        },
        {
            id: "chicote-energia",
            nome: "Chicote de Energia",
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Chicotes de energia pura. Projeções de alta tecnologia.",
            prereq: "Nenhum",
            categoria: "Combate",
            subcategoria: "Chicotes"
        },
        {
            id: "chicote-monofio",
            nome: "Chicote Monofio",
            atributo: "DX",
            dificuldade: "Difícil",
            custoBase: 4,
            descricao: "Chicote com fio monomolecular. Corte extremo.",
            prereq: "Nenhum",
            categoria: "Combate",
            subcategoria: "Chicotes"
        },
        {
            id: "chicote-kusari",
            nome: "Kusari",
            atributo: "DX",
            dificuldade: "Difícil",
            custoBase: 4,
            descricao: "Corrente pesada de duas mãos. Técnicas especiais.",
            prereq: "Mangual de Duas Mãos-4",
            categoria: "Combate",
            subcategoria: "Chicotes"
        },

        // ===== ESPADAS =====
        {
            id: "espadas-curtas",
            nome: "Espadas Curtas",
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Armas de 30-60cm. Terçado, clavas similares.",
            prereq: "Várias perícias-4",
            categoria: "Combate",
            subcategoria: "Espadas"
        },
        {
            id: "espadas-lamina-larga",
            nome: "Espadas de Lâmina Larga",
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Lâminas de 60-120cm. Espada larga, cimitarra.",
            prereq: "Espadas Curtas-2",
            categoria: "Combate",
            subcategoria: "Espadas"
        },
        {
            id: "espadas-duas-maos",
            nome: "Espada de Duas Mãos",
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Lâminas de 120cm+. Espada grande, zweihander.",
            prereq: "Espadas de Lâmina Larga-4",
            categoria: "Combate",
            subcategoria: "Espadas"
        },
        {
            id: "espadas-energia",
            nome: "Espada de Energia",
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Espadas com lâmina de energia. Tecnologia/magia.",
            prereq: "Qualquer espada-3",
            categoria: "Combate",
            subcategoria: "Espadas"
        },
        {
            id: "espadas-faca",
            nome: "Faca",
            atributo: "DX",
            dificuldade: "Fácil",
            custoBase: 1,
            descricao: "Lâminas rígidas <30cm. Canivete, faca Bowie.",
            prereq: "Várias perícias-3",
            categoria: "Combate",
            subcategoria: "Espadas"
        },
        {
            id: "espadas-jitte-sai",
            nome: "Jitte/Sai",
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Espadas para apanhar armas. +2 em desarmar.",
            prereq: "Várias perícias-3",
            categoria: "Combate",
            subcategoria: "Espadas"
        },

        // ===== MANGUAIS =====
        {
            id: "mangual-normal",
            nome: "Mangual", 
            atributo: "DX",
            dificuldade: "Difícil",
            custoBase: 4,
            descricao: "Armas flexíveis desbalanceadas. Nunchaku, maça-estrela.",
            prereq: "Machado/Maça-4",
            categoria: "Combate",
            subcategoria: "Manguais"
        },
        {
            id: "mangual-2maos",
            nome: "Mangual de Duas Mãos",
            atributo: "DX",
            dificuldade: "Difícil",
            custoBase: 4,
            descricao: "Manguais longos de duas mãos. Requer mais força.",
            prereq: "Kusari-4",
            categoria: "Combate",
            subcategoria: "Manguais"
        },

        // ===== OUTRAS ARMAS =====
        {
            id: "outras-tonfa",
            nome: "Tonfa",
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Bastão com cabo. Usável junto ao antebraço.",
            prereq: "Espadas Curtas-3",
            categoria: "Combate",
            subcategoria: "Outras Armas"
        },

        // ===== ARMAS DE DISTÂNCIA =====
        {
            id: "arco",
            nome: "Arco",
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Uso de arcos longos, curtos e compostos.",
            prereq: "DX-5",
            categoria: "Combate",
            subcategoria: "Armas de Distância"
        }
    ],

    // PERÍCIAS DE DESTREZA (DX)
    "DX": [
        {
            id: "acrobacia",
            nome: "Acrobacia",
            atributo: "DX",
            dificuldade: "Difícil", 
            custoBase: 4,
            descricao: "Proezas de ginástica, cambalhotas, rolamentos.",
            prereq: "DX-6",
            categoria: "DX"
        },
        {
            id: "atletismo",
            nome: "Atletismo",
            atributo: "DX",
            dificuldade: "Fácil",
            custoBase: 1,
            descricao: "Correr, saltar, escalar e outras atividades físicas.",
            prereq: "DX-4",
            categoria: "DX"
        },
        {
            id: "furtividade",
            nome: "Furtividade",
            atributo: "DX",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Mover-se silenciosamente e passar despercebido.",
            prereq: "DX-5",
            categoria: "DX"
        }
    ],

    // PERÍCIAS DE VIGOR (HT) 
    "HT": [
        {
            id: "boemia",
            nome: "Boémia",
            atributo: "HT",
            dificuldade: "Fácil",
            custoBase: 1,
            descricao: "Socializar e festejar. Sucesso concede +2 em reação.",
            prereq: "HT-4", 
            categoria: "HT"
        },
        {
            id: "natacao",
            nome: "Natação",
            atributo: "HT",
            dificuldade: "Fácil",
            custoBase: 1,
            descricao: "Nadar em diferentes condições aquáticas.",
            prereq: "HT-4",
            categoria: "HT"
        },
        {
            id: "sobrevivencia",
            nome: "Sobrevivência",
            atributo: "HT",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Sobreviver em ambientes selvagens e hostis.",
            prereq: "HT-5",
            categoria: "HT"
        }
    ],

    // PERÍCIAS DE PERCEPÇÃO (PERC)
    "PERC": [
        {
            id: "captacao",
            nome: "Captação",
            atributo: "PERC", 
            dificuldade: "Fácil",
            custoBase: 1,
            descricao: "Encontrar objetos úteis que outros não localizam.",
            prereq: "PERC-4",
            categoria: "PERC"
        },
        {
            id: "observacao",
            nome: "Observação",
            atributo: "PERC",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Perceber detalhes importantes no ambiente.",
            prereq: "PERC-5",
            categoria: "PERC"
        },
        {
            id: "rastreamento",
            nome: "Rastreamento",
            atributo: "PERC",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Seguir trilhas e rastros de criaturas/pessoas.",
            prereq: "PERC-5",
            categoria: "PERC"
        }
    ],

    // PERÍCIAS DE INTELIGÊNCIA (IQ)
    "IQ": [
        {
            id: "comercio", 
            nome: "Comércio",
            atributo: "IQ",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Comprar e vender. Bônus em testes de reação comerciais.",
            prereq: "IQ-5",
            categoria: "IQ"
        },
        {
            id: "diplomacia",
            nome: "Diplomacia",
            atributo: "IQ",
            dificuldade: "Difícil",
            custoBase: 4,
            descricao: "Negociar e resolver conflitos diplomaticamente.",
            prereq: "IQ-6",
            categoria: "IQ"
        },
        {
            id: "primeiros-socorros",
            nome: "Primeiros Socorros",
            atributo: "IQ",
            dificuldade: "Média",
            custoBase: 2,
            descricao: "Tratar ferimentos e estabilizar pacientes.",
            prereq: "IQ-5",
            categoria: "IQ"
        },
        {
            id: "estrategia",
            nome: "Estratégia",
            atributo: "IQ",
            dificuldade: "Difícil",
            custoBase: 4,
            descricao: "Planejar e executar estratégias militares.",
            prereq: "IQ-6",
            categoria: "IQ"
        }
    ]
};

// ===== FUNÇÕES DE ACESSO AO CATÁLOGO =====

function obterTodasPericias() {
    const todas = [];
    for (const categoria in window.catalogoPericias) {
        todas.push(...window.catalogoPericias[categoria]);
    }
    return todas;
}

function buscarPericias(termo = "", categoria = "", subcategoria = "") {
    let resultados = obterTodasPericias();
    
    // Filtro por termo de busca
    if (termo) {
        resultados = resultados.filter(pericia => 
            pericia.nome.toLowerCase().includes(termo.toLowerCase()) ||
            pericia.descricao.toLowerCase().includes(termo.toLowerCase())
        );
    }
    
    // Filtro por categoria
    if (categoria && categoria !== "Todas") {
        resultados = resultados.filter(pericia => 
            pericia.categoria === categoria
        );
    }
    
    // Filtro por subcategoria
    if (subcategoria && subcategoria !== "Todas") {
        resultados = resultados.filter(pericia => 
            pericia.subcategoria === subcategoria
        );
    }
    
    return resultados;
}

function obterPericiaPorId(id) {
    const todas = obterTodasPericias();
    return todas.find(pericia => pericia.id === id);
}

function obterCategorias() {
    return Object.keys(window.catalogoPericias);
}

function obterSubcategorias(categoria = "") {
    const todas = obterTodasPericias();
    const subcategorias = new Set();
    
    todas.forEach(pericia => {
        if (!categoria || pericia.categoria === categoria) {
            if (pericia.subcategoria) {
                subcategorias.add(pericia.subcategoria);
            }
        }
    });
    
    return Array.from(subcategorias);
}

// ===== EXPORTAÇÃO PARA USO NO SISTEMA PRINCIPAL =====
window.buscarPericias = buscarPericias;
window.obterPericiaPorId = obterPericiaPorId;
window.obterCategorias = obterCategorias;
window.obterSubcategorias = obterSubcategorias;
window.obterTodasPericias = obterTodasPericias;

console.log('✅ Catálogo de perícias carregado com', obterTodasPericias().length, 'perícias disponíveis');
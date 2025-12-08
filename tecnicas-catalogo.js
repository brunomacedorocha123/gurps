// CATÁLOGO COMPLETO DE TÉCNICAS (COM SUPORTE A REGRAS PERSONALIZADAS)
const catalogoTecnicas = {
    "arquearia-montada": {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        descricao: "Permite utilizar arco com eficiência enquanto cavalga.",
        dificuldade: "Difícil",
        // ✅ REGRA PERSONALIZADA: base = NH da perícia "arco" − 4
        baseCalculo: {
            tipo: "pericia",
            idPericia: "arco",
            redutor: -4  // pode ser -2, 0, +1, etc.
        },
        // ✅ LIMITE: não pode exceder o NH da perícia principal (arco)
        limiteMaximo: {
            tipo: "pericia",
            idPericia: "arco"
        },
        preRequisitos: [
            {
                idPericia: "arco",
                nomePericia: "Arco",
                nivelMinimo: 4
            },
            {
                idsCavalgar: ["cavalgar-cavalo", "cavalgar-mula", "cavalgar-camelo", "cavalgar-dragao", "cavalgar-outro"],
                nomePericia: "Cavalgar",
                nivelMinimo: 0
            }
        ]
    },

    // Exemplo adicional: Técnica igual à perícia
    "golpe-rápido": {
        id: "golpe-rápido",
        nome: "Golpe Rápido",
        descricao: "Ataque rápido que não penaliza a Defesa.",
        dificuldade: "Difícil",
        baseCalculo: {
            tipo: "pericia",
            idPericia: "punhos", // ou "espada", "faca", etc.
            redutor: 0  // NH da técnica = NH da perícia
        },
        limiteMaximo: {
            tipo: "pericia",
            idPericia: "punhos"
        },
        preRequisitos: [
            {
                idPericia: "punhos",
                nomePericia: "Punhos",
                nivelMinimo: 12
            }
        ]
    },

    // Exemplo: técnica baseada em atributo
    "equilíbrio-perfeito": {
        id: "equilibrio-perfeito",
        nome: "Equilíbrio Perfeito",
        descricao: "Manter o equilíbrio em superfícies instáveis.",
        dificuldade: "Média",
        baseCalculo: {
            tipo: "atributo",
            atributo: "DX",
            bonus: 0  // igual a DX
        },
        // Sem limite máximo (ou pode definir um fixo)
        preRequisitos: []
    }
};

// FUNÇÕES BÁSICAS
function obterTodasTecnicas() {
    return Object.values(catalogoTecnicas);
}

function buscarTecnicaPorId(id) {
    return catalogoTecnicas[id];
}

// EXPORT
window.catalogoTecnicas = {
    dados: catalogoTecnicas,
    obterTodasTecnicas: obterTodasTecnicas,
    buscarTecnicaPorId: buscarTecnicaPorId
};
// CATÁLOGO DE TÉCNICAS — APENAS ARQUEARIA MONTADA
const catalogoTecnicas = {
    "arquearia-montada": {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        descricao: "Permite utilizar arco com eficiência enquanto cavalga.",
        dificuldade: "Difícil",
        // ✅ REGRa ESPECÍFICA: base = NH da perícia "arco" - 4
        baseCalculo: {
            tipo: "pericia",
            idPericia: "arco",
            redutor: -4
        },
        // ✅ LIMITE: não pode exceder o NH da perícia "arco"
        limiteMaximo: {
            tipo: "pericia",
            idPericia: "arco"
        },
        preRequisitos: [
            {
                idPericia: "arco",      // ID exato da perícia Arco
                nomePericia: "Arco",
                nivelMinimo: 4
            },
            {
                // PARA CAVALGAR - aceita QUALQUER um destes IDs
                idsCavalgar: ["cavalgar-cavalo", "cavalgar-mula", "cavalgar-camelo", "cavalgar-dragao", "cavalgar-outro"],
                nomePericia: "Cavalgar",
                nivelMinimo: 0
            }
        ]
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
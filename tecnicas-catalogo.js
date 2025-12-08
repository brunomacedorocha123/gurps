// ===== CATÁLOGO DE TÉCNICAS =====
const catalogoTecnicas = {
    "arquearia-montada": {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        descricao: "Permite usar arco enquanto cavalga. NH base = Arco-4. Não pode exceder NH em Arco.",
        dificuldade: "Difícil",
        baseCalculo: {
            tipo: "pericia",
            idPericia: "arco",
            redutor: -4
        },
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
    }
};

function obterTodasTecnicas() {
    return Object.values(catalogoTecnicas);
}

function buscarTecnicaPorId(id) {
    return catalogoTecnicas[id] || null;
}

window.catalogoTecnicas = {
    obterTodasTecnicas: obterTodasTecnicas,
    buscarTecnicaPorId: buscarTecnicaPorId
};
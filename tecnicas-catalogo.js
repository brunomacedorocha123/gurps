// CATÁLOGO DE TÉCNICAS — APENAS ARQUEARIA MONTADA
const catalogoTecnicasDados = {
    "arquearia-montada": {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        descricao: "Permite utilizar arco com eficiência enquanto cavalga.",
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
    return Object.values(catalogoTecnicasDados);
}

function buscarTecnicaPorId(id) {
    return catalogoTecnicasDados[id] || null;
}

window.catalogoTecnicas = {
    obterTodasTecnicas: obterTodasTecnicas,
    buscarTecnicaPorId: buscarTecnicaPorId
};
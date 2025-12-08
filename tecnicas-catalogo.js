// CATÁLOGO DE TÉCNICAS — APENAS ARQUEARIA MONTADA
const catalogoTecnicas = {
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
                nomePericia: "Arco",  // Mudei para buscar por nome
                nivelMinimo: 4
            },
            {
                nomePericia: "Cavalgar",  // Mudei para buscar por nome
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

// EXPORT - maneira mais segura
window.catalogoTecnicas = window.catalogoTecnicas || {};
window.catalogoTecnicas.dados = catalogoTecnicas;
window.catalogoTecnicas.obterTodasTecnicas = obterTodasTecnicas;
window.catalogoTecnicas.buscarTecnicaPorId = buscarTecnicaPorId;

console.log('Catálogo de Técnicas carregado com', obterTodasTecnicas().length, 'técnicas');
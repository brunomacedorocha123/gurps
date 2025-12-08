// CATÁLOGO DE TÉCNICAS — ARQUEARIA MONTADA
const catalogoTecnicas = {
    "arquearia-montada": {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        descricao: "Permite utilizar arco com eficiência enquanto cavalga. Os modificadores para disparar sobre um cavalo nunca podem reduzir o NH em Arco abaixo do NH do personagem em Arquearia Montada.",
        dificuldade: "Difícil",
        // Base: NH da perícia "Arco" - 4
        baseCalculo: {
            tipo: "pericia",
            idPericia: "arco",  // ID da perícia Arco
            redutor: -4         // Base é Arco - 4
        },
        // Limite: não pode exceder o NH da perícia "Arco"
        limiteMaximo: {
            tipo: "pericia",
            idPericia: "arco"   // Não pode exceder NH em Arco
        },
        preRequisitos: [
            {
                idPericia: "arco",      // ID da perícia Arco
                nomePericia: "Arco",    // Nome para exibição
                nivelMinimo: 4          // Precisa ter Arco 4+
            },
            {
                // Precisa ter qualquer especialização de Cavalgar
                nomePericia: "Cavalgar", // Nome genérico
                nivelMinimo: 0           // Precisa ter pelo menos 0 (qualquer nível)
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
window.catalogoTecnicas = window.catalogoTecnicas || {
    dados: catalogoTecnicas,
    obterTodasTecnicas: obterTodasTecnicas,
    buscarTecnicaPorId: buscarTecnicaPorId
};

console.log('✅ Catálogo de Técnicas carregado com', obterTodasTecnicas().length, 'técnica(s)');
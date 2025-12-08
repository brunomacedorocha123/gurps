// ===== CATÁLOGO DE TÉCNICAS - VERSÃO 1.1 =====
console.log("📚 CARREGANDO CATÁLOGO DE TÉCNICAS OTIMIZADO");

const catalogoTecnicas = {
    "arquearia-montada": {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        descricao: "Usar arco enquanto cavalga sem penalidades máximas. Penalidades de cavalgar não reduzem abaixo do nível desta técnica. Por exemplo, se o personagem tiver Arco 13 e Arquearia Montada 11, as penalidades para disparar contra o alvo a cavalo nunca reduzirem o NH do personagem abaixo de 11 antes de se aplicar outros modificadores.",
        dificuldade: "Difícil",
        basePericia: "arco", // Perícia base
        modificadorBase: -4, // Pré-definido: Arco-4
        limiteMaximo: "arco", // Não pode exceder NH em Arco
        preRequisitos: [
            { tipo: "pericia", id: "arco", nivelMinimo: 4 },
            { tipo: "cavalgar", qualquer: true }
        ]
    }
};

// Funções do catálogo
function obterTodasTecnicas() {
    return Object.values(catalogoTecnicas);
}

function buscarTecnicaPorId(id) {
    return catalogoTecnicas[id] || null;
}

function buscarTecnicasPorPericia(periciaId) {
    return Object.values(catalogoTecnicas).filter(t => 
        t.basePericia === periciaId
    );
}

function buscarTecnicasPorDificuldade(dificuldade) {
    return Object.values(catalogoTecnicas).filter(t => 
        t.dificuldade === dificuldade
    );
}

// Exportar para uso global
window.catalogoTecnicas = {
    obterTodasTecnicas: obterTodasTecnicas,
    buscarTecnicaPorId: buscarTecnicaPorId,
    buscarTecnicasPorPericia: buscarTecnicasPorPericia,
    buscarTecnicasPorDificuldade: buscarTecnicasPorDificuldade,
    catalogo: catalogoTecnicas
};

console.log("✅ CATÁLOGO DE TÉCNICAS OTIMIZADO CARREGADO");
console.log(`📋 Técnicas disponíveis: ${Object.keys(catalogoTecnicas).length}`);
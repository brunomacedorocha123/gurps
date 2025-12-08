// ===== CATÁLOGO DE TÉCNICAS =====
console.log("📚 Carregando catálogo de técnicas...");

const catalogoTecnicas = {
    "arquearia-montada": {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        descricao: "Usar arco enquanto cavalga sem penalidades máximas. Penalidades de cavalgar não reduzem abaixo do nível desta técnica. Por exemplo, se o personagem tiver Arco 13 e Arquearia Montada 11, as penalidades para disparar contra o alvo a cavalo nunca reduzirem o NH do personagem abaixo de 11 antes de se aplicar outros modificadores.",
        dificuldade: "Difícil",
        basePericia: "arco",
        modificadorBase: -4,
        limiteMaximo: "arco"
    }
};

// Funções auxiliares
function obterTodasTecnicas() {
    return Object.values(catalogoTecnicas);
}

function buscarTecnicaPorId(id) {
    return catalogoTecnicas[id] || null;
}

// Exportar para window
window.catalogoTecnicas = {
    obterTodasTecnicas: obterTodasTecnicas,
    buscarTecnicaPorId: buscarTecnicaPorId,
    catalogo: catalogoTecnicas
};

console.log("✅ Catálogo de técnicas carregado!");
// ===== CATÁLOGO DE TÉCNICAS =====
// APENAS ARQUEARIA MONTADA POR ENQUANTO

const catalogoTecnicas = {
    "Arco": [
        {
            id: "arquearia-montada",
            nome: "Arquearia Montada",
            descricao: "Permite usar arco com eficiência enquanto cavalga. <strong>Pré-definido: Arco-4</strong>. Os modificadores para disparar sobre um cavalo <strong>nunca podem reduzir o NH em Arco abaixo do NH do personagem em Arquearia Montada</strong>.",
            prereq: "Arco e Cavalgar",
            predefinido: "Arco-4",
            dificuldade: "Difícil",
            atributoBase: "DX",
            limitacao: "Não pode exceder o NH em Arco",
            tipo: "tecnica-pericia",
            periciaBase: "arco", 
            origem: "Arco"
        }
    ]
};

// ===== FUNÇÕES AUXILIARES =====

function obterTodasTecnicas() {
    const todas = [];
    
    for (const categoria in catalogoTecnicas) {
        catalogoTecnicas[categoria].forEach(tecnica => {
            todas.push({
                ...tecnica,
                categoria: categoria
            });
        });
    }
    
    return todas;
}

function obterTecnicasDisponiveis(periciasAprendidas) {
    const todasTecnicas = obterTodasTecnicas();
    const disponiveis = [];
    
    // Verifica quais técnicas o personagem pode aprender
    todasTecnicas.forEach(tecnica => {
        // Verifica pré-requisitos
        let temPrereq = false;
        
        // Para Arquearia Montada: precisa ter Arco e Cavalgar
        if (tecnica.id === "arquearia-montada") {
            const temArco = periciasAprendidas.some(p => p.id === "arco");
            const temCavalgar = periciasAprendidas.some(p => 
                p.id.includes("cavalgar") || p.grupo === "Cavalgar"
            );
            
            temPrereq = temArco && temCavalgar;
        }
        
        if (temPrereq) {
            disponiveis.push(tecnica);
        }
    });
    
    return disponiveis;
}

function buscarTecnicaPorId(id) {
    const todas = obterTodasTecnicas();
    return todas.find(t => t.id === id);
}

function buscarTecnicasPorCategoria(categoria) {
    return catalogoTecnicas[categoria] || [];
}

// ===== EXPORTAR FUNÇÕES =====
window.catalogoTecnicas = catalogoTecnicas;
window.obterTodasTecnicas = obterTodasTecnicas;
window.obterTecnicasDisponiveis = obterTecnicasDisponiveis;
window.buscarTecnicaPorId = buscarTecnicaPorId;
window.buscarTecnicasPorCategoria = buscarTecnicasPorCategoria;
// ===== CATÁLOGO DE TÉCNICAS - APENAS ARQUEARIA MONTADA =====

const catalogoTecnicas = {
    "Técnicas de Arco": [
        {
            id: "arquearia-montada",
            nome: "Arquearia Montada",
            descricao: "Permite usar arco com eficiência enquanto cavalga. <strong>Pré-definido: Arco-4</strong>. Os modificadores para disparar sobre um cavalo <strong>nunca podem reduzir o NH em Arco abaixo do NH do personagem em Arquearia Montada</strong>.",
            
            // SISTEMA GENÉRICO: array de IDs de perícias necessárias
            prereq: ["arco", "cavalgar"], // IDs das perícias requeridas
            
            predefinido: "Arco-4",
            dificuldade: "Difícil", // Difícil: +1=2pts, +2=3pts, +3=4pts...
            atributoBase: "DX",
            limitacao: "Não pode exceder o NH em Arco",
            tipo: "tecnica-pericia",
            periciaBase: "arco", // Perícia à qual se aplica
            origem: "Técnicas de Arco"
        }
    ]
    // PARA ADICIONAR NOVA TÉCNICA FUTURA:
    // "Técnicas de Espada": [
    //     {
    //         id: "ataque-retirada",
    //         nome: "Ataque em Retirada",
    //         prereq: ["espadas-lamina-larga"], // Só precisa de uma perícia
    //         predefinido: "Espada-2",
    //         dificuldade: "Média",
    //         periciaBase: "espadas-lamina-larga"
    //     }
    // ]
};

// ===== FUNÇÕES GENÉRICAS =====

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
    
    // IDs de todas as perícias aprendidas (para verificação rápida)
    const idsPericiasAprendidas = periciasAprendidas.map(p => p.id);
    
    todasTecnicas.forEach(tecnica => {
        // VERIFICAÇÃO GENÉRICA: precisa ter TODAS as perícias no array prereq
        const temTodosPrereqs = tecnica.prereq.every(idPericiaNecessaria => {
            // Verifica se tem a perícia pelo ID exato
            if (idsPericiasAprendidas.includes(idPericiaNecessaria)) {
                return true;
            }
            
            // Para Cavalgar: verifica especializações (cavalgar-*)
            if (idPericiaNecessaria === "cavalgar") {
                return periciasAprendidas.some(p => 
                    p.id.startsWith("cavalgar-") || 
                    (p.grupo && p.grupo === "Cavalgar") ||
                    (p.nome && p.nome.includes("Cavalgar"))
                );
            }
            
            return false;
        });
        
        if (temTodosPrereqs) {
            disponiveis.push(tecnica);
        }
    });
    
    return disponiveis;
}

function buscarTecnicaPorId(id) {
    const todas = obterTodasTecnicas();
    return todas.find(t => t.id === id);
}

// ===== EXPORTAR =====
window.catalogoTecnicas = catalogoTecnicas;
window.obterTodasTecnicas = obterTodasTecnicas;
window.obterTecnicasDisponiveis = obterTecnicasDisponiveis;
window.buscarTecnicaPorId = buscarTecnicaPorId;
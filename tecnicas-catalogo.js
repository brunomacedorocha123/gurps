// ===== CATÁLOGO COMPLETO DE TÉCNICAS =====
const catalogoTecnicas = {
    "arquearia-montada": {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        descricao: "Permite utilizar arco com eficiência enquanto cavalga. Os modificadores para disparar sobre um cavalo nunca podem reduzir o NH em Arco abaixo do NH do personagem em Arquearia Montada. Por exemplo, se o personagem tiver Arco 13 e Arquearia Montada 11, as penalidades para disparar contra o alvo a cavalo nunca reduzirem o NH do personagem abaixo de 11 antes de se aplicar outros modificadores.",
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

// ===== FUNÇÕES DO CATÁLOGO =====
function obterTodasTecnicas() {
    return Object.values(catalogoTecnicas).map(tecnica => ({
        ...tecnica,
        preRequisitos: tecnica.preRequisitos || [],
        baseCalculo: tecnica.baseCalculo || { tipo: "pericia", idPericia: "", redutor: 0 },
        limiteMaximo: tecnica.limiteMaximo || null
    }));
}

function buscarTecnicaPorId(id) {
    const tecnica = catalogoTecnicas[id];
    if (!tecnica) return null;
    
    return {
        ...tecnica,
        preRequisitos: tecnica.preRequisitos || [],
        baseCalculo: tecnica.baseCalculo || { tipo: "pericia", idPericia: "", redutor: 0 },
        limiteMaximo: tecnica.limiteMaximo || null
    };
}

function buscarTecnicasPorPericia(idPericia) {
    return obterTodasTecnicas().filter(tecnica => 
        (tecnica.baseCalculo && tecnica.baseCalculo.idPericia === idPericia) ||
        (tecnica.limiteMaximo && tecnica.limiteMaximo.idPericia === idPericia) ||
        (tecnica.preRequisitos && tecnica.preRequisitos.some(p => p.idPericia === idPericia))
    );
}

function adicionarTecnica(tecnica) {
    if (!tecnica || !tecnica.id) {
        throw new Error("Técnica inválida: deve ter um ID");
    }
    
    catalogoTecnicas[tecnica.id] = {
        id: tecnica.id,
        nome: tecnica.nome || "Técnica sem nome",
        descricao: tecnica.descricao || "",
        dificuldade: tecnica.dificuldade || "Média",
        baseCalculo: tecnica.baseCalculo || { tipo: "pericia", idPericia: "", redutor: 0 },
        limiteMaximo: tecnica.limiteMaximo || null,
        preRequisitos: tecnica.preRequisitos || []
    };
    
    return true;
}

function removerTecnica(id) {
    if (catalogoTecnicas[id]) {
        delete catalogoTecnicas[id];
        return true;
    }
    return false;
}

// ===== EXPORTAR PARA ESCOPO GLOBAL =====
window.catalogoTecnicas = {
    dados: catalogoTecnicas,
    obterTodasTecnicas: obterTodasTecnicas,
    buscarTecnicaPorId: buscarTecnicaPorId,
    buscarTecnicasPorPericia: buscarTecnicasPorPericia,
    adicionarTecnica: adicionarTecnica,
    removerTecnica: removerTecnica
};

console.log('📚 Catálogo de técnicas carregado com', obterTodasTecnicas().length, 'técnica(s)');
// ===== CATÁLOGO COMPLETO DE TÉCNICAS =====
console.log('📚 Carregando catálogo completo de técnicas...');

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
    const tecnicas = Object.values(catalogoTecnicas).map(tecnica => ({
        id: tecnica.id,
        nome: tecnica.nome || "Técnica sem nome",
        descricao: tecnica.descricao || "",
        dificuldade: tecnica.dificuldade || "Média",
        baseCalculo: tecnica.baseCalculo || { tipo: "pericia", idPericia: "", redutor: 0 },
        limiteMaximo: tecnica.limiteMaximo || null,
        preRequisitos: tecnica.preRequisitos || []
    }));
    
    console.log(`📋 Retornando ${tecnicas.length} técnica(s) do catálogo`);
    return tecnicas;
}

function buscarTecnicaPorId(id) {
    const tecnica = catalogoTecnicas[id];
    if (!tecnica) {
        console.warn(`Técnica com ID "${id}" não encontrada`);
        return null;
    }
    
    return {
        id: tecnica.id,
        nome: tecnica.nome,
        descricao: tecnica.descricao,
        dificuldade: tecnica.dificuldade,
        baseCalculo: tecnica.baseCalculo,
        limiteMaximo: tecnica.limiteMaximo,
        preRequisitos: tecnica.preRequisitos
    };
}

function buscarTecnicasPorPericia(idPericia) {
    const tecnicas = obterTodasTecnicas();
    return tecnicas.filter(tecnica => 
        (tecnica.baseCalculo && tecnica.baseCalculo.idPericia === idPericia) ||
        (tecnica.limiteMaximo && tecnica.limiteMaximo.idPericia === idPericia) ||
        (tecnica.preRequisitos && tecnica.preRequisitos.some(p => p.idPericia === idPericia))
    );
}

function adicionarTecnica(tecnica) {
    if (!tecnica || !tecnica.id) {
        throw new Error("Técnica deve ter um ID válido");
    }
    
    catalogoTecnicas[tecnica.id] = {
        id: tecnica.id,
        nome: tecnica.nome || "Nova Técnica",
        descricao: tecnica.descricao || "",
        dificuldade: tecnica.dificuldade || "Média",
        baseCalculo: tecnica.baseCalculo || { tipo: "pericia", idPericia: "", redutor: 0 },
        limiteMaximo: tecnica.limiteMaximo || null,
        preRequisitos: tecnica.preRequisitos || []
    };
    
    console.log(`✅ Técnica "${tecnica.nome}" adicionada ao catálogo`);
    return true;
}

function removerTecnica(id) {
    if (catalogoTecnicas[id]) {
        delete catalogoTecnicas[id];
        console.log(`🗑️ Técnica "${id}" removida do catálogo`);
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

console.log('✅ CATÁLOGO DE TÉCNICAS CARREGADO COM SUCESSO');
console.log(`📊 ${obterTodasTecnicas().length} técnica(s) disponível(is)`);

// Adicionar algumas técnicas de exemplo
try {
    adicionarTecnica({
        id: "tecnica-teste-media",
        nome: "Técnica de Teste (Média)",
        descricao: "Uma técnica de exemplo com dificuldade média para testes.",
        dificuldade: "Média",
        baseCalculo: {
            tipo: "pericia",
            idPericia: "atletismo",
            redutor: -2
        },
        limiteMaximo: {
            tipo: "fixo",
            valor: 15
        },
        preRequisitos: [
            {
                idPericia: "atletismo",
                nomePericia: "Atletismo",
                nivelMinimo: 2
            }
        ]
    });
    
    console.log('➕ Técnica de teste adicionada');
} catch (e) {
    console.warn('Não foi possível adicionar técnica de teste:', e);
}
// ===== CATÁLOGO DE TÉCNICAS =====
const catalogoTecnicas = {
    "Arquearia Montada": {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        descricao: "Permite utilizar arco com eficiência enquanto cavalga. Os modificadores para disparar sobre um cavalo nunca podem reduzir o NH em Arco abaixo do NH do personagem em Arquearia Montada (as outras penalidades são aplicadas normalmente).",
        dificuldade: "Difícil",
        preRequisitos: [
            {
                idPericia: "arco",
                nomePericia: "Arco",
                nivelMinimo: 4
            },
            {
                idPrefix: "cavalgar-",
                nomePericia: "Cavalgar",
                nivelMinimo: 0,
                tipoVerificacao: "prefixo"
            }
        ],
        regrasEspeciais: [
            "Não pode exceder o NH em Arco",
            "Exemplo: Se personagem tem Arco 13 e Arquearia Montada 11, as penalidades para disparar a cavalo nunca reduzem o NH abaixo de 11 antes de outros modificadores"
        ],
        referencia: "pág. 397",
        tipo: "tecnica-combate"
    }
};

// ===== FUNÇÕES BÁSICAS DO CATÁLOGO =====
function obterTodasTecnicas() {
    const todas = [];
    
    for (const chave in catalogoTecnicas) {
        const tecnica = catalogoTecnicas[chave];
        todas.push({
            id: tecnica.id,
            nome: tecnica.nome,
            descricao: tecnica.descricao,
            dificuldade: tecnica.dificuldade,
            preRequisitos: tecnica.preRequisitos,
            regrasEspeciais: tecnica.regrasEspeciais,
            referencia: tecnica.referencia,
            tipo: tecnica.tipo
        });
    }
    
    return todas;
}

function buscarTecnicaPorId(id) {
    for (const chave in catalogoTecnicas) {
        if (catalogoTecnicas[chave].id === id) {
            return catalogoTecnicas[chave];
        }
    }
    return null;
}

function buscarTecnicaPorNome(nome) {
    for (const chave in catalogoTecnicas) {
        if (catalogoTecnicas[chave].nome.toLowerCase() === nome.toLowerCase()) {
            return catalogoTecnicas[chave];
        }
    }
    return null;
}

function obterTecnicasPorDificuldade(dificuldade) {
    const todas = obterTodasTecnicas();
    return todas.filter(tecnica => tecnica.dificuldade === dificuldade);
}

function obterTecnicasPorPericia(idPericia) {
    const todas = obterTodasTecnicas();
    return todas.filter(tecnica => 
        tecnica.preRequisitos.some(prereq => 
            prereq.idPericia === idPericia || 
            (prereq.idPrefix && idPericia.startsWith(prereq.idPrefix))
        )
    );
}

// ===== EXPORTAÇÃO PARA USO GLOBAL =====
window.catalogoTecnicas = {
    dados: catalogoTecnicas,
    obterTodasTecnicas: obterTodasTecnicas,
    buscarTecnicaPorId: buscarTecnicaPorId,
    buscarTecnicaPorNome: buscarTecnicaPorNome,
    obterTecnicasPorDificuldade: obterTecnicasPorDificuldade,
    obterTecnicasPorPericia: obterTecnicasPorPericia
};

console.log('Catálogo de técnicas carregado: 1 técnica disponível (Arquearia Montada)');
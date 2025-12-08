// ===== VERIFICAR PRÉ-REQUISITOS ===== (VERSÃO CORRIGIDA)
function verificarPreRequisitosTecnica(tecnica) {
    if (!window.estadoPericias || !window.estadoPericias.periciasAprendidas) {
        return { passou: false, motivo: 'Sistema de perícias não carregado' };
    }
    
    const periciasAprendidas = window.estadoPericias.periciasAprendidas;
    
    for (const prereq of tecnica.preRequisitos) {
        // Verificar Cavalgar (qualquer especialização)
        if (prereq.verificarCavalgar === true) {
            const temCavalgar = periciasAprendidas.some(p => 
                p.id.startsWith('cavalgar-') ||          // Ex: cavalgar-cavalo, cavalgar-dragao
                p.id === 'grupo-cavalgar'                // O grupo genérico no filtro DX
            );
            
            if (!temCavalgar) {
                return { passou: false, motivo: 'Falta: Cavalgar (qualquer animal)' };
            }
            continue;
        }
        
        // Verificar perícia específica (ex: arco)
        const idProcurado = prereq.idPericia;
        if (idProcurado) {
            const temPericia = periciasAprendidas.some(p => p.id === idProcurado);
            if (!temPericia) {
                // Tenta buscar por nome como fallback (opcional)
                const porNome = periciasAprendidas.some(p => 
                    p.nome.toLowerCase().includes(idProcurado.toLowerCase())
                );
                if (!porNome) {
                    return { passou: false, motivo: `Falta: ${prereq.nomePericia || idProcurado}` };
                }
            }
        }
    }
    
    return { passou: true, motivo: '' };
}
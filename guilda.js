// Configuração do Supabase
const SUPABASE_URL = 'https://pujufdfhaxveuytkneqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1anVmZGZoYXh2ZXV5dGtuZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTkyODksImV4cCI6MjA3OTkzNTI4OX0.mzOwsmf8qIQ4HZqnXLEmq4D7M6fz4VH1YWpWP-BsFvc';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentUser = null;
let userGuild = null;
let guildMembers = [];
let guildInvites = [];

// Funções principais
async function initGuild() {
    await checkAuth();
    await loadUserData();
    await loadUserGuild();
    setupEventListeners();
}

async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }
    currentUser = session.user;
}

async function loadUserData() {
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

    if (profile) {
        const initials = profile.username?.charAt(0).toUpperCase() || 'U';
        document.getElementById('userAvatar').innerHTML = initials;
    }
}

async function loadUserGuild() {
    try {
        // Primeiro, verificar se é dono de alguma guilda
        const { data: ownedGuild, error: ownerError } = await supabase
            .from('guilds')
            .select('*')
            .eq('owner_id', currentUser.id)
            .single();

        if (ownerError && ownerError.code !== 'PGRST116') { // PGRST116 = no rows
            console.error('Erro ao buscar guilda do dono:', ownerError);
        }

        if (ownedGuild) {
            userGuild = ownedGuild;
            renderGuildPage();
            return;
        }

        // Se não for dono, verificar se é membro
        const { data: memberships, error: memberError } = await supabase
            .from('guild_members')
            .select(`
                guild_id,
                role,
                status,
                guilds(*)
            `)
            .eq('user_id', currentUser.id)
            .eq('status', 'accepted');

        if (memberError) {
            console.error('Erro ao buscar membros:', memberError);
            renderNoGuildPage();
            return;
        }

        if (memberships && memberships.length > 0) {
            userGuild = memberships[0].guilds;
            renderGuildPage();
        } else {
            renderNoGuildPage();
        }
    } catch (error) {
        console.error('Erro ao carregar guilda:', error);
        renderNoGuildPage();
    }
}

function renderNoGuildPage() {
    const content = `
        <div class="no-guild-container">
            <div class="no-guild-icon">
                <i class="fas fa-users"></i>
            </div>
            <h2 class="no-guild-title">Você não possui uma guilda</h2>
            <p class="no-guild-text">
                Crie sua própria guilda para reunir seus amigos e jogadores.<br>
                Como dono da guilda, você poderá convidar outros jogadores, 
                gerenciar membros e organizar campanhas.
            </p>
            <button class="btn btn-primary" id="createGuildBtn">
                <i class="fas fa-plus"></i> Criar Guilda
            </button>
        </div>
    `;
    
    document.getElementById('guild-content').innerHTML = content;
    
    // Adicionar evento ao botão
    document.getElementById('createGuildBtn')?.addEventListener('click', () => {
        document.getElementById('createGuildModal').classList.add('active');
    });
}

function renderGuildPage() {
    const content = `
        <div class="guild-header">
            <div class="guild-avatar">
                <i class="fas fa-users"></i>
            </div>
            <div class="guild-info">
                <h2 class="guild-name">${escapeHtml(userGuild.name)}</h2>
                <div class="guild-id">ID: ${escapeHtml(userGuild.custom_id)}</div>
                <p class="guild-description">${escapeHtml(userGuild.description || 'Sem descrição')}</p>
                <div class="guild-stats">
                    <div class="guild-stat">
                        <i class="fas fa-users"></i>
                        <span>Membros: <span id="memberCount">0</span>/${userGuild.max_members}</span>
                    </div>
                    <div class="guild-stat">
                        <i class="fas fa-crown"></i>
                        <span>Dono: ${userGuild.owner_id === currentUser.id ? 'Você' : 'Outro'}</span>
                    </div>
                    <div class="guild-stat">
                        <i class="fas fa-calendar"></i>
                        <span>Criada: ${formatDate(userGuild.created_at)}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="guild-tabs">
            <button class="guild-tab active" data-tab="members">
                <i class="fas fa-users"></i> Membros
            </button>
            <button class="guild-tab" data-tab="invites">
                <i class="fas fa-user-plus"></i> Convites
            </button>
            <button class="guild-tab" data-tab="settings">
                <i class="fas fa-cog"></i> Configurações
            </button>
        </div>

        <div id="tab-contents">
            <!-- Aba de Membros -->
            <div class="tab-content active" id="tab-members">
                <div class="members-container">
                    <div class="members-header">
                        <h3 style="color: #ffd700;">Membros da Guilda</h3>
                        ${userGuild.owner_id === currentUser.id ? 
                            `<button class="btn" id="inviteMemberBtn">
                                <i class="fas fa-user-plus"></i> Convidar
                            </button>` : ''
                        }
                    </div>
                    <div class="members-grid" id="membersGrid">
                        <p style="color: #888; text-align: center;">Carregando membros...</p>
                    </div>
                </div>
            </div>

            <!-- Aba de Convites -->
            <div class="tab-content" id="tab-invites">
                <div class="invites-container">
                    <h3 style="color: #ffd700; margin-bottom: 20px;">Convites Enviados</h3>
                    <div id="invitesList">
                        <p style="color: #888; text-align: center;">Carregando convites...</p>
                    </div>
                </div>
            </div>

            <!-- Aba de Configurações -->
            <div class="tab-content" id="tab-settings">
                <div class="members-container">
                    <h3 style="color: #ffd700; margin-bottom: 20px;">Configurações da Guilda</h3>
                    ${userGuild.owner_id === currentUser.id ? renderOwnerSettings() : renderMemberSettings()}
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('guild-content').innerHTML = content;
    
    // Configurar abas
    setupTabs();
    
    // Carregar dados
    loadMembers();
    loadInvites();
}

function renderOwnerSettings() {
    return `
        <div style="display: grid; gap: 20px;">
            <div>
                <button class="btn" id="editGuildBtn" style="width: 100%; margin-bottom: 10px;">
                    <i class="fas fa-edit"></i> Editar Guilda
                </button>
                <button class="btn" id="transferGuildBtn" style="width: 100%; margin-bottom: 10px;">
                    <i class="fas fa-exchange-alt"></i> Transferir Guilda
                </button>
                <button class="btn btn-danger" id="deleteGuildBtn" style="width: 100%;">
                    <i class="fas fa-trash"></i> Excluir Guilda
                </button>
            </div>
            
            <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 20px;">
                <h4 style="color: #ff8c00; margin-bottom: 15px;">Informações da Guilda</h4>
                <p style="color: #aaa; font-size: 0.9rem; margin-bottom: 5px;">
                    <strong>ID:</strong> ${userGuild.custom_id}
                </p>
                <p style="color: #aaa; font-size: 0.9rem; margin-bottom: 5px;">
                    <strong>Código de Convite:</strong> ${userGuild.invite_code || 'Gerando...'}
                </p>
                <p style="color: #aaa; font-size: 0.9rem;">
                    <strong>Criada em:</strong> ${formatDate(userGuild.created_at)}
                </p>
            </div>
        </div>
    `;
}

function renderMemberSettings() {
    return `
        <div style="text-align: center; padding: 40px 20px;">
            <p style="color: #aaa; margin-bottom: 20px;">
                Apenas o dono da guilda pode alterar as configurações.
            </p>
            <button class="btn btn-danger" id="leaveGuildBtn">
                <i class="fas fa-sign-out-alt"></i> Sair da Guilda
            </button>
        </div>
    `;
}

function setupTabs() {
    const tabs = document.querySelectorAll('.guild-tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Remover active de todas as tabs
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Adicionar active na tab clicada
            tab.classList.add('active');
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });
}

async function loadMembers() {
    try {
        const membersGrid = document.getElementById('membersGrid');
        
        // Carregar membros da guilda
        const { data: members, error } = await supabase
            .from('guild_members_with_profiles')
            .select('*')
            .eq('guild_id', userGuild.id)
            .eq('status', 'accepted');

        if (error) {
            console.error('Erro ao carregar membros:', error);
            membersGrid.innerHTML = '<p style="color: #e74c3c;">Erro ao carregar membros</p>';
            return;
        }

        guildMembers = members || [];

        if (membersGrid) {
            if (guildMembers.length === 0) {
                membersGrid.innerHTML = '<p style="color: #888; text-align: center;">Nenhum membro na guilda</p>';
            } else {
                membersGrid.innerHTML = guildMembers.map(member => `
                    <div class="member-card">
                        <div class="member-header">
                            <div class="member-avatar">${member.username?.charAt(0).toUpperCase() || '?'}</div>
                            <div>
                                <div class="member-name">${escapeHtml(member.username || 'Usuário')}</div>
                                <div class="member-player-id">#${escapeHtml(member.player_id || '')}</div>
                                <div class="member-role ${'role-' + member.role}">
                                    ${member.role === 'owner' ? 'Dono' : member.role === 'admin' ? 'Administrador' : 'Membro'}
                                </div>
                            </div>
                        </div>
                        ${userGuild.owner_id === currentUser.id && member.role !== 'owner' ? `
                            <div class="member-actions">
                                ${member.role === 'member' ? `
                                    <button class="btn" onclick="promoteToAdmin('${member.id}')">
                                        <i class="fas fa-star"></i> Promover a Admin
                                    </button>
                                ` : member.role === 'admin' ? `
                                    <button class="btn" onclick="demoteToMember('${member.id}')">
                                        <i class="fas fa-arrow-down"></i> Rebaixar a Membro
                                    </button>
                                ` : ''}
                                <button class="btn btn-danger" onclick="kickMember('${member.id}', '${escapeHtml(member.username)}')">
                                    <i class="fas fa-user-slash"></i> Expulsar
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `).join('');
            }
            
            document.getElementById('memberCount').textContent = guildMembers.length;
        }
    } catch (error) {
        console.error('Erro ao carregar membros:', error);
    }
}

async function loadInvites() {
    try {
        const invitesList = document.getElementById('invitesList');
        
        // Carregar convites pendentes
        const { data: invites, error } = await supabase
            .from('guild_invitations_with_details')
            .select('*')
            .eq('guild_id', userGuild.id)
            .eq('status', 'pending');

        if (error) {
            console.error('Erro ao carregar convites:', error);
            invitesList.innerHTML = '<p style="color: #e74c3c;">Erro ao carregar convites</p>';
            return;
        }

        guildInvites = invites || [];

        if (invitesList) {
            if (guildInvites.length === 0) {
                invitesList.innerHTML = '<p style="color: #888; text-align: center;">Nenhum convite pendente</p>';
            } else {
                invitesList.innerHTML = guildInvites.map(invite => `
                    <div class="invite-card">
                        <div class="invite-info">
                            <h4>Para: ${escapeHtml(invite.receiver_username || 'Usuário')}</h4>
                            <p>ID: #${escapeHtml(invite.receiver_player_id || '')}</p>
                            <p>Enviado em: ${formatDate(invite.sent_at)}</p>
                        </div>
                        <div class="invite-actions">
                            <button class="btn btn-danger" onclick="cancelInvite('${invite.id}', '${escapeHtml(invite.receiver_username)}')">
                                <i class="fas fa-times"></i> Cancelar
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Erro ao carregar convites:', error);
    }
}

function setupEventListeners() {
    // Voltar para Home
    document.getElementById('backBtn')?.addEventListener('click', () => {
        window.location.href = 'home.html';
    });
    
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        try {
            await supabase.auth.signOut();
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Erro ao sair:', error);
            alert('Erro ao sair. Tente novamente.');
        }
    });
    
    // Modal Criar Guilda
    document.getElementById('createGuildForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await createGuild();
    });
    
    document.getElementById('cancelCreate')?.addEventListener('click', () => {
        document.getElementById('createGuildModal').classList.remove('active');
        clearCreateForm();
    });
    
    // Modal Convidar Membro
    document.addEventListener('click', (e) => {
        if (e.target.id === 'inviteMemberBtn' || e.target.closest('#inviteMemberBtn')) {
            document.getElementById('inviteModal').classList.add('active');
        }
    });
    
    document.getElementById('inviteForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await sendInvite();
    });
    
    document.getElementById('cancelInvite')?.addEventListener('click', () => {
        document.getElementById('inviteModal').classList.remove('active');
        document.getElementById('invitePlayerId').value = '';
    });
    
    // Botões de Configurações
    document.addEventListener('click', (e) => {
        if (e.target.id === 'editGuildBtn' || e.target.closest('#editGuildBtn')) {
            editGuild();
        }
        if (e.target.id === 'transferGuildBtn' || e.target.closest('#transferGuildBtn')) {
            transferGuild();
        }
        if (e.target.id === 'deleteGuildBtn' || e.target.closest('#deleteGuildBtn')) {
            deleteGuild();
        }
        if (e.target.id === 'leaveGuildBtn' || e.target.closest('#leaveGuildBtn')) {
            leaveGuild();
        }
    });
    
    // Fechar modais ao clicar fora
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                if (modal.id === 'createGuildModal') {
                    clearCreateForm();
                }
            }
        });
    });
}

async function createGuild() {
    const name = document.getElementById('guildName').value.trim();
    const customId = document.getElementById('guildId').value.trim().toLowerCase();
    const description = document.getElementById('guildDescription').value.trim();
    const maxMembers = parseInt(document.getElementById('maxMembers').value) || 10;
    
    try {
        // Validações básicas
        if (!name || !customId) {
            alert('Nome e ID da guilda são obrigatórios');
            return;
        }
        
        if (customId.length < 3) {
            alert('ID da guilda deve ter pelo menos 3 caracteres');
            return;
        }
        
        if (!/^[a-z0-9][a-z0-9_-]*$/.test(customId)) {
            alert('ID da guilda só pode conter letras, números, hífen (-) e underscore (_)');
            return;
        }
        
        // Chama a função do Supabase para criar guilda
        const { data, error } = await supabase.rpc('create_guild_with_owner', {
            p_custom_id: customId,
            p_name: name,
            p_description: description || null,
            p_max_members: maxMembers,
            p_image_url: null
        });
        
        if (error) {
            console.error('Erro ao criar guilda:', error);
            alert('Erro ao criar guilda: ' + error.message);
            return;
        }
        
        // Fechar modal e limpar formulário
        document.getElementById('createGuildModal').classList.remove('active');
        clearCreateForm();
        
        // Recarregar página para mostrar a nova guilda
        setTimeout(() => location.reload(), 1000);
        
    } catch (error) {
        console.error('Erro ao criar guilda:', error);
        alert('Erro: ' + error.message);
    }
}

async function sendInvite() {
    const playerId = document.getElementById('invitePlayerId').value.trim();
    
    try {
        if (!playerId) {
            alert('Digite o ID do jogador');
            return;
        }
        
        // Chama a função do Supabase para convidar
        const { data, error } = await supabase.rpc('invite_to_guild', {
            p_guild_id: userGuild.id,
            p_receiver_player_id: playerId
        });
        
        if (error) {
            console.error('Erro ao enviar convite:', error);
            alert('Erro: ' + error.message);
            return;
        }
        
        // Fechar modal e limpar formulário
        document.getElementById('inviteModal').classList.remove('active');
        document.getElementById('invitePlayerId').value = '';
        
        // Recarregar lista de convites
        await loadInvites();
        
        alert('Convite enviado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao enviar convite:', error);
        alert('Erro: ' + error.message);
    }
}

async function cancelInvite(invitationId, receiverName) {
    if (!confirm(`Cancelar convite para ${receiverName}?`)) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('guild_invitations')
            .update({ status: 'cancelled' })
            .eq('id', invitationId);
        
        if (error) {
            console.error('Erro ao cancelar convite:', error);
            alert('Erro ao cancelar convite');
            return;
        }
        
        // Recarregar lista de convites
        await loadInvites();
        alert('Convite cancelado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao cancelar convite:', error);
        alert('Erro: ' + error.message);
    }
}

async function promoteToAdmin(memberId) {
    if (!confirm('Promover este membro a Administrador?')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('guild_members')
            .update({ role: 'admin' })
            .eq('id', memberId)
            .eq('guild_id', userGuild.id);
        
        if (error) {
            console.error('Erro ao promover membro:', error);
            alert('Erro ao promover membro');
            return;
        }
        
        // Recarregar lista de membros
        await loadMembers();
        alert('Membro promovido a Administrador!');
        
    } catch (error) {
        console.error('Erro ao promover membro:', error);
        alert('Erro: ' + error.message);
    }
}

async function demoteToMember(memberId) {
    if (!confirm('Rebaixar este administrador a Membro?')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('guild_members')
            .update({ role: 'member' })
            .eq('id', memberId)
            .eq('guild_id', userGuild.id);
        
        if (error) {
            console.error('Erro ao rebaixar membro:', error);
            alert('Erro ao rebaixar membro');
            return;
        }
        
        // Recarregar lista de membros
        await loadMembers();
        alert('Administrador rebaixado a Membro!');
        
    } catch (error) {
        console.error('Erro ao rebaixar membro:', error);
        alert('Erro: ' + error.message);
    }
}

async function kickMember(memberId, memberName) {
    if (!confirm(`Expulsar ${memberName} da guilda?`)) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('guild_members')
            .update({ status: 'banned' })
            .eq('id', memberId)
            .eq('guild_id', userGuild.id);
        
        if (error) {
            console.error('Erro ao expulsar membro:', error);
            alert('Erro ao expulsar membro');
            return;
        }
        
        // Recarregar lista de membros
        await loadMembers();
        alert('Membro expulso da guilda!');
        
    } catch (error) {
        console.error('Erro ao expulsar membro:', error);
        alert('Erro: ' + error.message);
    }
}

async function editGuild() {
    alert('Funcionalidade de edição da guilda será implementada em breve!');
}

async function transferGuild() {
    alert('Funcionalidade de transferência da guilda será implementada em breve!');
}

async function deleteGuild() {
    if (!confirm('Tem certeza que deseja EXCLUIR esta guilda?\n\nEsta ação é PERMANENTE e não pode ser desfeita!\n\nTodos os membros serão removidos e a guilda será apagada.')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('guilds')
            .delete()
            .eq('id', userGuild.id)
            .eq('owner_id', currentUser.id);
        
        if (error) {
            console.error('Erro ao excluir guilda:', error);
            alert('Erro ao excluir guilda');
            return;
        }
        
        alert('Guilda excluída com sucesso!');
        setTimeout(() => location.reload(), 1000);
        
    } catch (error) {
        console.error('Erro ao excluir guilda:', error);
        alert('Erro: ' + error.message);
    }
}

async function leaveGuild() {
    if (!confirm('Tem certeza que deseja sair desta guilda?')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('guild_members')
            .delete()
            .eq('guild_id', userGuild.id)
            .eq('user_id', currentUser.id);
        
        if (error) {
            console.error('Erro ao sair da guilda:', error);
            alert('Erro ao sair da guilda');
            return;
        }
        
        alert('Você saiu da guilda!');
        setTimeout(() => location.reload(), 1000);
        
    } catch (error) {
        console.error('Erro ao sair da guilda:', error);
        alert('Erro: ' + error.message);
    }
}

// Funções auxiliares
function clearCreateForm() {
    document.getElementById('guildName').value = '';
    document.getElementById('guildId').value = '';
    document.getElementById('guildDescription').value = '';
    document.getElementById('maxMembers').value = '10';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return 'Data desconhecida';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    } catch (error) {
        return 'Data inválida';
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', initGuild);
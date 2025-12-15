// Configuração do Supabase
const SUPABASE_URL = 'https://pujufdfhaxveuytkneqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1anVmZGZoYXh2ZXV5dGtuZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTkyODksImV4cCI6MjA3OTkzNTI4OX0.mzOwsmf8qIQ4HZqnXLEmq4D7M6fz4VH1YWpWP-BsFvc';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentUser = null;
let userGuild = null;

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
        document.getElementById('playerId').textContent = '#' + profile.player_id;
        const initials = profile.username?.charAt(0).toUpperCase() || 'U';
        document.getElementById('userAvatar').innerHTML = initials;
    }
}

async function loadUserGuild() {
    // Primeiro, verificar se é dono de alguma guilda
    const { data: ownedGuild } = await supabase
        .from('guilds')
        .select('*')
        .eq('owner_id', currentUser.id)
        .single();

    if (ownedGuild) {
        userGuild = ownedGuild;
        renderGuildPage();
        return;
    }

    // Se não for dono, verificar se é membro
    const { data: memberships } = await supabase
        .from('guild_members')
        .select('guild_id, role, status, guilds(*)')
        .eq('user_id', currentUser.id)
        .eq('status', 'accepted');

    if (memberships && memberships.length > 0) {
        userGuild = memberships[0].guilds;
        renderGuildPage();
    } else {
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
                <h2 class="guild-name">${userGuild.name}</h2>
                <div class="guild-id">ID: ${userGuild.id}</div>
                <p class="guild-description">${userGuild.description || 'Sem descrição'}</p>
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
                        <span>Criada: ${new Date(userGuild.created_at).toLocaleDateString('pt-BR')}</span>
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
                    <h3 style="color: #ffd700; margin-bottom: 20px;">Convites Pendentes</h3>
                    <div id="invitesList">
                        <p style="color: #888; text-align: center;">Nenhum convite pendente</p>
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
                <h4 style="color: #ff8c00; margin-bottom: 15px;">Danger Zone</h4>
                <p style="color: #aaa; font-size: 0.9rem; margin-bottom: 15px;">
                    Ações aqui são permanentes e não podem ser desfeitas.
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
    // TODO: Carregar membros da guilda do Supabase
    const membersGrid = document.getElementById('membersGrid');
    
    // Exemplo de dados
    const exampleMembers = [
        { id: '1', name: 'Bruno', role: 'owner', status: 'active' },
        { id: '2', name: 'Crash', role: 'member', status: 'active' },
        { id: '3', name: 'Ana', role: 'member', status: 'active' }
    ];
    
    if (membersGrid) {
        membersGrid.innerHTML = exampleMembers.map(member => `
            <div class="member-card">
                <div class="member-header">
                    <div class="member-avatar">${member.name.charAt(0)}</div>
                    <div>
                        <div class="member-name">${member.name}</div>
                        <div class="member-role ${'role-' + member.role}">
                            ${member.role === 'owner' ? 'Dono' : 'Membro'}
                        </div>
                    </div>
                </div>
                ${userGuild.owner_id === currentUser.id && member.role !== 'owner' ? `
                    <div class="member-actions">
                        <button class="btn" onclick="promoteMember('${member.id}')">
                            <i class="fas fa-star"></i> Promover
                        </button>
                        <button class="btn btn-danger" onclick="kickMember('${member.id}')">
                            <i class="fas fa-user-slash"></i> Expulsar
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');
        
        document.getElementById('memberCount').textContent = exampleMembers.length;
    }
}

async function loadInvites() {
    // TODO: Carregar convites pendentes do Supabase
}

function setupEventListeners() {
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });
    
    // Modal Criar Guilda
    document.getElementById('createGuildForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await createGuild();
    });
    
    document.getElementById('cancelCreate')?.addEventListener('click', () => {
        document.getElementById('createGuildModal').classList.remove('active');
    });
    
    // Modal Convidar Membro
    document.addEventListener('click', (e) => {
        if (e.target.id === 'inviteMemberBtn') {
            document.getElementById('inviteModal').classList.add('active');
        }
    });
    
    document.getElementById('inviteForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await sendInvite();
    });
    
    document.getElementById('cancelInvite')?.addEventListener('click', () => {
        document.getElementById('inviteModal').classList.remove('active');
    });
    
    // Fechar modais ao clicar fora
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

async function createGuild() {
    const name = document.getElementById('guildName').value;
    const guildId = document.getElementById('guildId').value;
    const description = document.getElementById('guildDescription').value;
    const maxMembers = document.getElementById('maxMembers').value;
    
    try {
        // TODO: Implementar criação no Supabase
        console.log('Criando guilda:', { name, guildId, description, maxMembers });
        
        // Fechar modal
        document.getElementById('createGuildModal').classList.remove('active');
        
        // Recarregar página
        location.reload();
        
    } catch (error) {
        console.error('Erro ao criar guilda:', error);
        alert('Erro: ' + error.message);
    }
}

async function sendInvite() {
    const playerId = document.getElementById('invitePlayerId').value;
    
    try {
        // TODO: Implementar envio de convite
        console.log('Enviando convite para:', playerId);
        
        // Fechar modal
        document.getElementById('inviteModal').classList.remove('active');
        document.getElementById('invitePlayerId').value = '';
        
        alert('Convite enviado para ' + playerId);
        
    } catch (error) {
        console.error('Erro ao enviar convite:', error);
        alert('Erro: ' + error.message);
    }
}

// Funções de exemplo
function promoteMember(memberId) {
    alert('Promover membro: ' + memberId);
}

function kickMember(memberId) {
    if (confirm('Tem certeza que deseja expulsar este membro?')) {
        alert('Membro expulso: ' + memberId);
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', initGuild);
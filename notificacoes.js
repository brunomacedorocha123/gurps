// Configuração do Supabase
const SUPABASE_URL = 'https://pujufdfhaxveuytkneqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1anVmZGZoYXh2ZXV5dGtuZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTkyODksImV4cCI6MjA3OTkzNTI4OX0.mzOwsmf8qIQ4HZqnXLEmq4D7M6fz4VH1YWpWP-BsFvc';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentUser = null;
let currentFilter = 'all';
let userInvitations = [];

// Funções principais
async function initNotifications() {
    await checkAuth();
    await loadUserData();
    setupEventListeners();
    await loadNotifications();
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

async function loadNotifications() {
    try {
        console.log('Carregando notificações do banco real...');
        
        // BUSCAR CONVITES DE GUILDA RECEBIDOS
        const { data: guildInvites, error: guildError } = await supabase
            .from('guild_invitations_with_details')
            .select('*')
            .eq('receiver_id', currentUser.id)
            .in('status', ['pending'])
            .order('sent_at', { ascending: false });

        if (guildError) {
            console.error('Erro ao buscar convites:', guildError);
            renderError('Erro ao carregar convites');
            return;
        }

        // TRANSFORMAR CONVITES EM NOTIFICAÇÕES
        userInvitations = guildInvites || [];
        
        const notifications = userInvitations.map(invite => ({
            id: invite.id,
            type: 'guild_invite',
            title: 'Convite para Guilda',
            message: `${invite.sender_username} convidou você para a guilda "${invite.guild_name}"`,
            guild_id: invite.guild_id,
            sender_id: invite.sender_id,
            receiver_id: invite.receiver_id,
            guild_name: invite.guild_name,
            sender_username: invite.sender_username,
            status: invite.status,
            sent_at: invite.sent_at,
            guild_custom_id: invite.guild_custom_id,
            read: false // Sempre não lido quando é pendente
        }));

        console.log(`Encontrados ${notifications.length} convites reais`);
        renderNotifications(notifications);

    } catch (error) {
        console.error('Erro crítico ao carregar notificações:', error);
        renderError('Erro inesperado ao carregar notificações');
    }
}

function renderNotifications(notifications) {
    const notificationsList = document.getElementById('notificationsList');
    const totalNotifications = document.getElementById('totalNotifications');
    const notificationBadge = document.getElementById('notificationBadge');
    
    if (!notifications || notifications.length === 0) {
        notificationsList.innerHTML = `
            <div class="empty-notifications">
                <div class="empty-icon">
                    <i class="fas fa-bell-slash"></i>
                </div>
                <h3 class="empty-title">Nenhuma notificação</h3>
                <p class="empty-text">Você não tem convites pendentes no momento</p>
            </div>
        `;
        totalNotifications.textContent = '0';
        notificationBadge.style.display = 'none';
        return;
    }

    // Filtrar por tipo
    let filteredNotifications = notifications;
    if (currentFilter !== 'all') {
        filteredNotifications = notifications.filter(notif => {
            if (currentFilter === 'guild') return notif.type.includes('guild');
            return false; // Por enquanto só temos convites de guilda
        });
    }

    // Contar não lidas
    const unreadCount = filteredNotifications.length; // Todos são não lidos por padrão
    totalNotifications.textContent = filteredNotifications.length;
    
    if (unreadCount > 0) {
        notificationBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        notificationBadge.style.display = 'inline';
    } else {
        notificationBadge.style.display = 'none';
    }

    // Renderizar notificações
    notificationsList.innerHTML = filteredNotifications.map(notification => {
        const timeAgo = getTimeAgo(notification.sent_at);
        const iconClass = getNotificationIcon(notification.type);
        const iconText = getNotificationIconText(notification.type);
        
        return `
            <div class="notification-item unread" 
                 data-id="${notification.id}" 
                 data-type="${notification.type}"
                 data-guild-id="${notification.guild_id}">
                <div class="notification-icon ${iconClass}">
                    <i class="${iconText}"></i>
                </div>
                <div class="notification-details">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">
                        <i class="far fa-clock"></i> ${timeAgo}
                    </div>
                </div>
                <div class="notification-actions">
                    ${renderNotificationActions(notification)}
                </div>
            </div>
        `;
    }).join('');

    setupNotificationEvents();
}

function getNotificationIcon(type) {
    if (type.includes('guild')) return 'icon-guild';
    return 'icon-system';
}

function getNotificationIconText(type) {
    if (type.includes('guild')) return 'fas fa-users';
    return 'fas fa-cog';
}

function renderNotificationActions(notification) {
    if (notification.type === 'guild_invite' && notification.status === 'pending') {
        return `
            <button class="notification-btn btn-accept" data-action="accept">
                <i class="fas fa-check"></i> Aceitar
            </button>
            <button class="notification-btn btn-decline" data-action="decline">
                <i class="fas fa-times"></i> Recusar
            </button>
            <button class="notification-btn btn-view" data-action="view">
                <i class="fas fa-eye"></i> Detalhes
            </button>
        `;
    }
    
    return `
        <span style="color: #888; font-size: 0.9rem; padding: 8px;">
            ${notification.status === 'accepted' ? '✅ Aceito' : 
              notification.status === 'rejected' ? '❌ Recusado' : 
              notification.status === 'cancelled' ? '❌ Cancelado' : 'Status desconhecido'}
        </span>
    `;
}

function getTimeAgo(timestamp) {
    if (!timestamp) return 'Data desconhecida';
    
    const now = new Date();
    const date = new Date(timestamp);
    
    if (isNaN(date.getTime())) return 'Data inválida';
    
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'agora há pouco';
    if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 604800) return `há ${Math.floor(diffInSeconds / 86400)} dias`;
    
    return date.toLocaleDateString('pt-BR');
}

function setupNotificationEvents() {
    // Clique nos botões de ação
    document.querySelectorAll('.notification-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const action = btn.getAttribute('data-action');
            const notificationItem = btn.closest('.notification-item');
            const notificationId = notificationItem.getAttribute('data-id');
            const guildId = notificationItem.getAttribute('data-guild-id');
            
            await handleNotificationAction(notificationId, action, guildId);
        });
    });
    
    // Clique na notificação para ver detalhes
    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-actions')) {
                const notificationId = item.getAttribute('data-id');
                viewNotificationDetails(notificationId);
            }
        });
    });
}

async function handleNotificationAction(notificationId, action, guildId) {
    console.log(`Ação: ${action}, Convite ID: ${notificationId}`);
    
    try {
        if (action === 'accept') {
            await acceptNotification(notificationId, guildId);
        } else if (action === 'decline') {
            await declineNotification(notificationId);
        } else if (action === 'view') {
            viewNotificationDetails(notificationId);
        }
    } catch (error) {
        console.error('Erro ao processar ação:', error);
        alert('Erro ao processar sua ação. Tente novamente.');
    }
}

async function acceptNotification(invitationId, guildId) {
    if (!confirm('Deseja aceitar este convite e entrar na guilda?')) {
        return;
    }
    
    try {
        // USAR A FUNÇÃO DO BANCO QUE VOCÊ JÁ TEM
        const { data, error } = await supabase.rpc('respond_to_invitation', {
            p_invitation_id: invitationId,
            p_accept: true
        });
        
        if (error) {
            console.error('Erro ao aceitar convite:', error);
            alert('Erro ao aceitar convite: ' + error.message);
            return;
        }
        
        console.log('Convite aceito com sucesso! ID da guilda:', data);
        
        // Atualizar interface
        const notificationItem = document.querySelector(`[data-id="${invitationId}"]`);
        if (notificationItem) {
            notificationItem.classList.remove('unread');
            const actionsDiv = notificationItem.querySelector('.notification-actions');
            if (actionsDiv) {
                actionsDiv.innerHTML = '<span style="color: #2ecc71; font-weight: bold;">✅ Convite aceito</span>';
            }
        }
        
        // Atualizar badge
        updateNotificationBadge();
        
        alert('Convite aceito! Você agora é membro da guilda.');
        
        // Recarregar lista após 2 segundos
        setTimeout(() => {
            loadNotifications();
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao aceitar convite:', error);
        alert('Erro ao aceitar convite: ' + error.message);
    }
}

async function declineNotification(invitationId) {
    if (!confirm('Deseja recusar este convite?')) {
        return;
    }
    
    try {
        // USAR A FUNÇÃO DO BANCO QUE VOCÊ JÁ TEM
        const { data, error } = await supabase.rpc('respond_to_invitation', {
            p_invitation_id: invitationId,
            p_accept: false
        });
        
        if (error) {
            console.error('Erro ao recusar convite:', error);
            alert('Erro ao recusar convite: ' + error.message);
            return;
        }
        
        console.log('Convite recusado com sucesso!');
        
        // Atualizar interface
        const notificationItem = document.querySelector(`[data-id="${invitationId}"]`);
        if (notificationItem) {
            notificationItem.classList.remove('unread');
            const actionsDiv = notificationItem.querySelector('.notification-actions');
            if (actionsDiv) {
                actionsDiv.innerHTML = '<span style="color: #e74c3c; font-weight: bold;">❌ Convite recusado</span>';
            }
        }
        
        // Atualizar badge
        updateNotificationBadge();
        
        alert('Convite recusado.');
        
        // Recarregar lista após 2 segundos
        setTimeout(() => {
            loadNotifications();
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao recusar convite:', error);
        alert('Erro ao recusar convite: ' + error.message);
    }
}

function viewNotificationDetails(notificationId) {
    // Buscar detalhes do convite
    const invitation = userInvitations.find(inv => inv.id === notificationId);
    
    if (!invitation) {
        alert('Convite não encontrado');
        return;
    }
    
    const modal = document.getElementById('notificationModal');
    const modalTitle = document.getElementById('modalNotificationTitle');
    const modalBody = document.getElementById('modalNotificationBody');
    const modalActions = document.getElementById('modalNotificationActions');
    
    modalTitle.textContent = 'Detalhes do Convite';
    modalBody.innerHTML = `
        <div style="margin-bottom: 15px;">
            <p><strong>Guilda:</strong> ${invitation.guild_name}</p>
            <p><strong>ID da Guilda:</strong> ${invitation.guild_custom_id}</p>
        </div>
        <div style="margin-bottom: 15px;">
            <p><strong>Convidado por:</strong> ${invitation.sender_username}</p>
            <p><strong>Enviado em:</strong> ${new Date(invitation.sent_at).toLocaleDateString('pt-BR')}</p>
        </div>
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
            <p><strong>Status:</strong> ${invitation.status === 'pending' ? '🟡 Pendente' : 
                                         invitation.status === 'accepted' ? '✅ Aceito' : 
                                         invitation.status === 'rejected' ? '❌ Recusado' : 
                                         invitation.status === 'cancelled' ? '❌ Cancelado' : 'Desconhecido'}</p>
        </div>
    `;
    
    // Mostrar botões apenas se pendente
    if (invitation.status === 'pending') {
        modalActions.innerHTML = `
            <button class="notification-btn btn-decline" id="modalDeclineBtn">
                <i class="fas fa-times"></i> Recusar
            </button>
            <button class="notification-btn btn-accept" id="modalAcceptBtn">
                <i class="fas fa-check"></i> Aceitar
            </button>
            <button class="notification-btn btn-view" id="modalCloseBtn">
                <i class="fas fa-times"></i> Fechar
            </button>
        `;
        
        // Configurar eventos dos botões do modal
        document.getElementById('modalAcceptBtn').addEventListener('click', () => {
            modal.classList.remove('active');
            acceptNotification(invitation.id, invitation.guild_id);
        });
        
        document.getElementById('modalDeclineBtn').addEventListener('click', () => {
            modal.classList.remove('active');
            declineNotification(invitation.id);
        });
        
    } else {
        modalActions.innerHTML = `
            <button class="notification-btn btn-view" id="modalCloseBtn" style="flex: 1;">
                <i class="fas fa-times"></i> Fechar
            </button>
        `;
    }
    
    document.getElementById('modalCloseBtn').addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    modal.classList.add('active');
}

function updateNotificationBadge() {
    const unreadCount = document.querySelectorAll('.notification-item.unread').length;
    const notificationBadge = document.getElementById('notificationBadge');
    
    if (unreadCount > 0) {
        notificationBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        notificationBadge.style.display = 'inline';
    } else {
        notificationBadge.style.display = 'none';
    }
}

function renderError(message) {
    const notificationsList = document.getElementById('notificationsList');
    notificationsList.innerHTML = `
        <div class="empty-notifications">
            <div class="empty-icon" style="color: #e74c3c;">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3 class="empty-title">Erro ao carregar</h3>
            <p class="empty-text">${message}</p>
            <button class="btn" onclick="loadNotifications()" style="margin-top: 20px;">
                <i class="fas fa-redo"></i> Tentar novamente
            </button>
        </div>
    `;
}

function setupEventListeners() {
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });
    
    // Tabs
    document.querySelectorAll('.notification-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.notification-tab').forEach(t => {
                t.classList.remove('active');
            });
            tab.classList.add('active');
            currentFilter = tab.getAttribute('data-tab');
            loadNotifications();
        });
    });
    
    // Marcar todas como lidas
    document.getElementById('markAllReadBtn')?.addEventListener('click', () => {
        document.querySelectorAll('.notification-item.unread').forEach(item => {
            item.classList.remove('unread');
        });
        updateNotificationBadge();
        alert('Todas as notificações foram marcadas como visualizadas.');
    });
    
    // Fechar modal
    document.getElementById('closeModalBtn')?.addEventListener('click', () => {
        document.getElementById('notificationModal').classList.remove('active');
    });
    
    // Fechar modal ao clicar fora
    document.getElementById('notificationModal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('notificationModal')) {
            document.getElementById('notificationModal').classList.remove('active');
        }
    });
    
    // Atualizar notificações a cada 30 segundos
    setInterval(() => {
        loadNotifications();
    }, 30000);
}

// Inicializar
document.addEventListener('DOMContentLoaded', initNotifications);
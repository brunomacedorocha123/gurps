// ============================================
// SISTEMA DE NOTIFICAÇÕES - JAVASCRIPT COMPLETO
// ============================================

// Configuração do Supabase
const SUPABASE_URL = 'https://pujufdfhaxveuytkneqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1anVmZGZoYXh2ZXV5dGtuZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTkyODksImV4cCI6MjA3OTkzNTI4OX0.mzOwsmf8qIQ4HZqnXLEmq4D7M6fz4VH1YWpWP-BsFvc';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentUser = null;
let currentFilter = 'all';
let userInvitations = [];

// ============================================
// FUNÇÕES PRINCIPAIS
// ============================================

async function initNotifications() {
    try {
        await checkAuth();
        await loadUserData();
        setupEventListeners();
        await loadNotifications();
        startAutoRefresh();
    } catch (error) {
        console.error('Erro na inicialização:', error);
        renderError('Erro ao iniciar sistema de notificações');
    }
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
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('player_id, username')
            .eq('id', currentUser.id)
            .single();

        if (error) throw error;

        if (profile) {
            document.getElementById('playerId').textContent = '#' + (profile.player_id || '---');
            const initials = profile.username?.charAt(0).toUpperCase() || 'U';
            document.getElementById('userAvatar').innerHTML = initials;
        }
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
    }
}

async function loadNotifications() {
    try {
        showLoading(true);
        
        // Usar a função PostgreSQL para buscar notificações
        const { data, error } = await supabase.rpc('get_user_notifications');
        
        if (error) {
            console.error('Erro na função get_user_notifications:', error);
            // Fallback: buscar diretamente da view
            await loadNotificationsFallback();
            return;
        }
        
        if (data && data.success) {
            userInvitations = data.notifications || [];
            updateNotificationCount(data.total || 0);
            renderNotifications(userInvitations);
        } else {
            renderError(data?.message || 'Erro ao carregar notificações');
        }
        
    } catch (error) {
        console.error('Erro ao carregar notificações:', error);
        renderError('Erro de conexão com o servidor');
    } finally {
        showLoading(false);
    }
}

async function loadNotificationsFallback() {
    try {
        // Buscar convites de campanha diretamente
        const { data: campaignInvites, error: campaignError } = await supabase
            .from('campaign_invitations_with_details')
            .select('*')
            .eq('receiver_id', currentUser.id)
            .eq('status', 'pending')
            .order('sent_at', { ascending: false });
        
        if (campaignError) {
            throw campaignError;
        }
        
        const notifications = [];
        
        // Processar convites de campanha
        if (campaignInvites && campaignInvites.length > 0) {
            campaignInvites.forEach(invite => {
                notifications.push({
                    id: invite.id,
                    type: 'campaign_invite',
                    title: 'Convite para Campanha',
                    message: invite.message || `${invite.sender_username} convidou você para a campanha "${invite.campaign_name}"`,
                    campaign_id: invite.campaign_id,
                    campaign_name: invite.campaign_name,
                    campaign_code: invite.campaign_code,
                    sender_username: invite.sender_username,
                    status: invite.status,
                    sent_at: invite.sent_at,
                    is_read: false
                });
            });
        }
        
        // Tentar buscar convites de guilda
        try {
            const { data: guildInvites } = await supabase
                .from('guild_invitations_with_details')
                .select('*')
                .eq('receiver_id', currentUser.id)
                .eq('status', 'pending')
                .order('sent_at', { ascending: false });
            
            if (guildInvites && guildInvites.length > 0) {
                guildInvites.forEach(invite => {
                    notifications.push({
                        id: invite.id,
                        type: 'guild_invite',
                        title: 'Convite para Guilda',
                        message: `${invite.sender_username} convidou você para a guilda "${invite.guild_name}"`,
                        guild_id: invite.guild_id,
                        guild_name: invite.guild_name,
                        sender_username: invite.sender_username,
                        status: invite.status,
                        sent_at: invite.sent_at,
                        is_read: false
                    });
                });
            }
        } catch (guildError) {
            // Ignorar erro de guildas - pode não existir
            console.log('Sistema de guildas não disponível');
        }
        
        userInvitations = notifications;
        updateNotificationCount(notifications.length);
        renderNotifications(notifications);
        
    } catch (error) {
        console.error('Erro no fallback:', error);
        renderError('Não foi possível carregar as notificações');
    }
}

function renderNotifications(notifications) {
    const notificationsList = document.getElementById('notificationsList');
    
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
        return;
    }

    // Filtrar notificações conforme aba selecionada
    let filteredNotifications = notifications;
    if (currentFilter !== 'all') {
        filteredNotifications = notifications.filter(notif => {
            if (currentFilter === 'guild') return notif.type === 'guild_invite';
            if (currentFilter === 'campaign') return notif.type === 'campaign_invite';
            if (currentFilter === 'system') return notif.type === 'system';
            return false;
        });
    }

    // Renderizar notificações
    notificationsList.innerHTML = filteredNotifications.map(notification => {
        const timeAgo = getTimeAgo(notification.sent_at);
        const iconClass = getIconClass(notification.type);
        const iconText = getIconText(notification.type);
        
        return `
            <div class="notification-item ${notification.is_read ? '' : 'unread'}" 
                 data-id="${notification.id}" 
                 data-type="${notification.type}"
                 data-campaign-id="${notification.campaign_id || ''}"
                 data-guild-id="${notification.guild_id || ''}">
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
                    ${notification.status === 'pending' ? `
                        <button class="notification-btn btn-decline" data-action="decline" title="Recusar">
                            <i class="fas fa-times"></i>
                        </button>
                        <button class="notification-btn btn-accept" data-action="accept" title="Aceitar">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : `
                        <span class="notification-status ${notification.status === 'accepted' ? 'accepted' : 'rejected'}">
                            ${notification.status === 'accepted' ? '✅ Aceito' : '❌ Recusado'}
                        </span>
                    `}
                    <button class="notification-btn btn-view" data-action="view" title="Detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Adicionar eventos aos botões
    setupNotificationEvents();
}

// ============================================
// FUNÇÕES DE AÇÃO
// ============================================

async function acceptCampaignInvitation(invitationId) {
    try {
        showLoading(true);
        
        const { data, error } = await supabase.rpc('respond_to_campaign_invitation', {
            p_invitation_id: invitationId,
            p_accept: true
        });
        
        if (error) {
            throw new Error(error.message);
        }
        
        if (!data.success) {
            throw new Error(data.message);
        }
        
        // Atualizar interface
        const notificationItem = document.querySelector(`[data-id="${invitationId}"]`);
        if (notificationItem) {
            notificationItem.querySelector('.notification-actions').innerHTML = 
                '<span class="notification-status accepted">✅ Aceito</span>';
            notificationItem.classList.remove('unread');
        }
        
        // Mostrar mensagem de sucesso
        showToast(data.message, 'success');
        
        // Recarregar notificações após 2 segundos
        setTimeout(() => loadNotifications(), 2000);
        
    } catch (error) {
        console.error('Erro ao aceitar convite:', error);
        showToast(error.message || 'Erro ao aceitar convite', 'error');
    } finally {
        showLoading(false);
    }
}

async function declineCampaignInvitation(invitationId) {
    try {
        showLoading(true);
        
        const { data, error } = await supabase.rpc('respond_to_campaign_invitation', {
            p_invitation_id: invitationId,
            p_accept: false
        });
        
        if (error) {
            throw new Error(error.message);
        }
        
        if (!data.success) {
            throw new Error(data.message);
        }
        
        // Atualizar interface
        const notificationItem = document.querySelector(`[data-id="${invitationId}"]`);
        if (notificationItem) {
            notificationItem.querySelector('.notification-actions').innerHTML = 
                '<span class="notification-status rejected">❌ Recusado</span>';
            notificationItem.classList.remove('unread');
        }
        
        // Mostrar mensagem
        showToast('Convite recusado', 'info');
        
        // Recarregar notificações após 2 segundos
        setTimeout(() => loadNotifications(), 2000);
        
    } catch (error) {
        console.error('Erro ao recusar convite:', error);
        showToast(error.message || 'Erro ao recusar convite', 'error');
    } finally {
        showLoading(false);
    }
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function getTimeAgo(timestamp) {
    if (!timestamp) return 'Data desconhecida';
    
    const now = new Date();
    const date = new Date(timestamp);
    
    if (isNaN(date.getTime())) return 'Data inválida';
    
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInSeconds < 60) return 'agora há pouco';
    if (diffInMinutes < 60) return `há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    if (diffInHours < 24) return `há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    if (diffInDays < 7) return `há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function getIconClass(type) {
    switch(type) {
        case 'guild_invite': return 'icon-guild';
        case 'campaign_invite': return 'icon-campaign';
        case 'system': return 'icon-system';
        default: return 'icon-system';
    }
}

function getIconText(type) {
    switch(type) {
        case 'guild_invite': return 'fas fa-users';
        case 'campaign_invite': return 'fas fa-map';
        case 'system': return 'fas fa-cog';
        default: return 'fas fa-bell';
    }
}

function updateNotificationCount(count) {
    const totalElement = document.getElementById('totalNotifications');
    const badgeElement = document.getElementById('notificationBadge');
    
    if (totalElement) {
        totalElement.textContent = count;
    }
    
    if (badgeElement) {
        if (count > 0) {
            badgeElement.textContent = count > 99 ? '99+' : count;
            badgeElement.style.display = 'inline';
        } else {
            badgeElement.style.display = 'none';
        }
    }
}

function showLoading(show) {
    const notificationsList = document.getElementById('notificationsList');
    if (show) {
        notificationsList.innerHTML = `
            <div class="empty-notifications">
                <div class="empty-icon">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <h3 class="empty-title">Carregando...</h3>
                <p class="empty-text">Buscando suas notificações</p>
            </div>
        `;
    }
}

function showToast(message, type = 'info') {
    // Criar toast se não existir
    let toast = document.getElementById('notificationToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'notificationToast';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        document.body.appendChild(toast);
    }
    
    // Definir cor conforme tipo
    switch(type) {
        case 'success':
            toast.style.backgroundColor = '#27ae60';
            break;
        case 'error':
            toast.style.backgroundColor = '#e74c3c';
            break;
        case 'info':
            toast.style.backgroundColor = '#3498db';
            break;
        default:
            toast.style.backgroundColor = '#34495e';
    }
    
    // Mostrar mensagem
    toast.textContent = message;
    toast.style.transform = 'translateX(0)';
    
    // Esconder após 3 segundos
    setTimeout(() => {
        toast.style.transform = 'translateX(400px)';
    }, 3000);
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
            <button class="btn" onclick="loadNotifications()" style="margin-top: 20px; padding: 10px 20px; background: #ff8c00; border: none; border-radius: 6px; color: white; cursor: pointer;">
                <i class="fas fa-redo"></i> Tentar novamente
            </button>
        </div>
    `;
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupNotificationEvents() {
    // Botões de ação nas notificações
    document.querySelectorAll('.notification-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const action = btn.getAttribute('data-action');
            const notificationItem = btn.closest('.notification-item');
            const notificationId = notificationItem.getAttribute('data-id');
            const notificationType = notificationItem.getAttribute('data-type');
            
            switch(action) {
                case 'accept':
                    if (notificationType === 'campaign_invite') {
                        if (confirm('Deseja aceitar este convite e entrar na campanha?')) {
                            await acceptCampaignInvitation(notificationId);
                        }
                    } else if (notificationType === 'guild_invite') {
                        // Aqui você pode adicionar lógica para guildas
                        showToast('Sistema de guildas em desenvolvimento', 'info');
                    }
                    break;
                    
                case 'decline':
                    if (notificationType === 'campaign_invite') {
                        if (confirm('Deseja recusar este convite?')) {
                            await declineCampaignInvitation(notificationId);
                        }
                    } else if (notificationType === 'guild_invite') {
                        // Aqui você pode adicionar lógica para guildas
                        showToast('Sistema de guildas em desenvolvimento', 'info');
                    }
                    break;
                    
                case 'view':
                    viewNotificationDetails(notificationId);
                    break;
            }
        });
    });
}

function setupEventListeners() {
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });
    
    // Abas de filtro
    document.querySelectorAll('.notification-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.notification-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.getAttribute('data-tab');
            renderNotifications(userInvitations);
        });
    });
    
    // Marcar todas como lidas
    document.getElementById('markAllReadBtn')?.addEventListener('click', () => {
        document.querySelectorAll('.notification-item.unread').forEach(item => {
            item.classList.remove('unread');
        });
        showToast('Todas as notificações marcadas como lidas', 'info');
    });
    
    // Modal
    document.getElementById('closeModalBtn')?.addEventListener('click', () => {
        document.getElementById('notificationModal').classList.remove('active');
    });
    
    document.getElementById('notificationModal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('notificationModal')) {
            document.getElementById('notificationModal').classList.remove('active');
        }
    });
}

function viewNotificationDetails(notificationId) {
    const invitation = userInvitations.find(inv => inv.id === notificationId);
    if (!invitation) return;
    
    const modal = document.getElementById('notificationModal');
    const modalTitle = document.getElementById('modalNotificationTitle');
    const modalBody = document.getElementById('modalNotificationBody');
    const modalActions = document.getElementById('modalNotificationActions');
    
    modalTitle.textContent = invitation.title;
    
    let detailsHTML = '';
    if (invitation.type === 'campaign_invite') {
        detailsHTML = `
            <p><strong>Campanha:</strong> ${invitation.campaign_name}</p>
            <p><strong>Código:</strong> ${invitation.campaign_code || 'N/A'}</p>
            <p><strong>Convidado por:</strong> ${invitation.sender_username}</p>
            <p><strong>Enviado em:</strong> ${new Date(invitation.sent_at).toLocaleString('pt-BR')}</p>
        `;
    } else if (invitation.type === 'guild_invite') {
        detailsHTML = `
            <p><strong>Guilda:</strong> ${invitation.guild_name}</p>
            <p><strong>Convidado por:</strong> ${invitation.sender_username}</p>
            <p><strong>Enviado em:</strong> ${new Date(invitation.sent_at).toLocaleString('pt-BR')}</p>
        `;
    }
    
    modalBody.innerHTML = detailsHTML;
    
    // Botões de ação no modal
    if (invitation.status === 'pending') {
        modalActions.innerHTML = `
            <button class="notification-btn btn-decline" id="modalDeclineBtn">
                <i class="fas fa-times"></i> Recusar
            </button>
            <button class="notification-btn btn-accept" id="modalAcceptBtn">
                <i class="fas fa-check"></i> Aceitar
            </button>
        `;
        
        document.getElementById('modalAcceptBtn').addEventListener('click', () => {
            modal.classList.remove('active');
            if (invitation.type === 'campaign_invite') {
                acceptCampaignInvitation(invitation.id);
            } else {
                showToast('Sistema de guildas em desenvolvimento', 'info');
            }
        });
        
        document.getElementById('modalDeclineBtn').addEventListener('click', () => {
            modal.classList.remove('active');
            if (invitation.type === 'campaign_invite') {
                declineCampaignInvitation(invitation.id);
            } else {
                showToast('Sistema de guildas em desenvolvimento', 'info');
            }
        });
    } else {
        modalActions.innerHTML = `
            <button class="notification-btn btn-view" onclick="document.getElementById('notificationModal').classList.remove('active')">
                <i class="fas fa-times"></i> Fechar
            </button>
        `;
    }
    
    modal.classList.add('active');
}

function startAutoRefresh() {
    // Atualizar notificações a cada 30 segundos
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            loadNotifications();
        }
    }, 30000);
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', initNotifications);

// Adicionar estilos CSS para os novos elementos
const style = document.createElement('style');
style.textContent = `
    .notification-status {
        padding: 5px 10px;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: bold;
    }
    
    .notification-status.accepted {
        background: rgba(46, 204, 113, 0.2);
        color: #2ecc71;
    }
    
    .notification-status.rejected {
        background: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
    }
    
    .notification-btn {
        padding: 8px 12px !important;
    }
    
    .btn {
        padding: 10px 20px;
        background: #ff8c00;
        border: none;
        border-radius: 6px;
        color: white;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    
    .btn:hover {
        background: #ff9c20;
        transform: translateY(-2px);
    }
`;
document.head.appendChild(style);
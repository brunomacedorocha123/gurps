// Configuração do Supabase
const SUPABASE_URL = 'https://pujufdfhaxveuytkneqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1anVmZGZoYXh2ZXV5dGtuZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTkyODksImV4cCI6MjA3OTkzNTI4OX0.mzOwsmf8qIQ4HZqnXLEmq4D7M6fz4VH1YWpWP-BsFvc';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentUser = null;
let currentFilter = 'all';

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
    // TODO: Carregar notificações do Supabase quando tiver a tabela
    // Por enquanto, vamos usar dados de exemplo
    const exampleNotifications = [
        {
            id: '1',
            type: 'guild_invite',
            title: 'Convite para Guilda',
            message: 'Bruno convidou você para a guilda "Aventureiros do Reino"',
            sender: 'Bruno',
            sender_id: '123',
            guild_id: 'guild123',
            timestamp: '2024-12-15T10:30:00Z',
            read: false,
            status: 'pending'
        },
        {
            id: '2',
            type: 'guild_invite',
            title: 'Convite para Guilda',
            message: 'Ana convidou você para a guilda "Mestres de GURPS"',
            sender: 'Ana',
            sender_id: '456',
            guild_id: 'guild456',
            timestamp: '2024-12-14T15:45:00Z',
            read: true,
            status: 'pending'
        },
        {
            id: '3',
            type: 'campaign_invite',
            title: 'Convite para Campanha',
            message: 'Crash convidou você para a campanha "Reinos Perdidos"',
            sender: 'Crash',
            sender_id: '789',
            campaign_id: 'camp123',
            timestamp: '2024-12-13T09:20:00Z',
            read: false,
            status: 'pending'
        },
        {
            id: '4',
            type: 'system',
            title: 'Atualização do Sistema',
            message: 'Nova atualização disponível! Confira as novidades.',
            timestamp: '2024-12-12T14:00:00Z',
            read: true
        }
    ];

    renderNotifications(exampleNotifications);
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
                <p class="empty-text">Suas notificações aparecerão aqui</p>
            </div>
        `;
        totalNotifications.textContent = '0';
        notificationBadge.style.display = 'none';
        return;
    }

    // Filtrar notificações
    let filteredNotifications = notifications;
    if (currentFilter !== 'all') {
        filteredNotifications = notifications.filter(notif => {
            if (currentFilter === 'guild') return notif.type.includes('guild');
            if (currentFilter === 'campaign') return notif.type.includes('campaign');
            if (currentFilter === 'system') return notif.type === 'system';
            return true;
        });
    }

    // Contar não lidas
    const unreadCount = notifications.filter(n => !n.read).length;
    totalNotifications.textContent = filteredNotifications.length;
    
    if (unreadCount > 0) {
        notificationBadge.textContent = unreadCount;
        notificationBadge.style.display = 'inline';
    } else {
        notificationBadge.style.display = 'none';
    }

    // Renderizar notificações
    notificationsList.innerHTML = filteredNotifications.map(notification => {
        const timeAgo = getTimeAgo(notification.timestamp);
        const iconClass = getNotificationIcon(notification.type);
        const iconText = getNotificationIconText(notification.type);
        
        return `
            <div class="notification-item ${notification.read ? '' : 'unread'}" 
                 data-id="${notification.id}" 
                 data-type="${notification.type}">
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

    // Adicionar eventos às notificações
    setupNotificationEvents();
}

function getNotificationIcon(type) {
    if (type.includes('guild')) return 'icon-guild';
    if (type.includes('campaign')) return 'icon-campaign';
    if (type === 'system') return 'icon-system';
    return 'icon-friend';
}

function getNotificationIconText(type) {
    if (type.includes('guild')) return 'fas fa-users';
    if (type.includes('campaign')) return 'fas fa-map';
    if (type === 'system') return 'fas fa-cog';
    return 'fas fa-user-friends';
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
                <i class="fas fa-eye"></i> Ver
            </button>
        `;
    }
    
    if (notification.type === 'campaign_invite' && notification.status === 'pending') {
        return `
            <button class="notification-btn btn-accept" data-action="accept">
                <i class="fas fa-check"></i> Aceitar
            </button>
            <button class="notification-btn btn-view" data-action="view">
                <i class="fas fa-eye"></i> Ver
            </button>
        `;
    }
    
    return `
        <button class="notification-btn btn-view" data-action="view">
            <i class="fas fa-eye"></i> Ver
        </button>
    `;
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'agora há pouco';
    if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 604800) return `há ${Math.floor(diffInSeconds / 86400)} dias`;
    
    return date.toLocaleDateString('pt-BR');
}

function setupNotificationEvents() {
    // Clique na notificação
    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-actions')) {
                const notificationId = item.getAttribute('data-id');
                viewNotificationDetails(notificationId);
            }
        });
    });
    
    // Clique nos botões de ação
    document.querySelectorAll('.notification-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.getAttribute('data-action');
            const notificationItem = btn.closest('.notification-item');
            const notificationId = notificationItem.getAttribute('data-id');
            
            handleNotificationAction(notificationId, action);
        });
    });
}

function viewNotificationDetails(notificationId) {
    // TODO: Buscar detalhes da notificação
    // Por enquanto, vamos mostrar um modal com informações
    const modal = document.getElementById('notificationModal');
    const modalTitle = document.getElementById('modalNotificationTitle');
    const modalBody = document.getElementById('modalNotificationBody');
    const modalActions = document.getElementById('modalNotificationActions');
    
    modalTitle.textContent = 'Detalhes da Notificação';
    modalBody.textContent = 'Aqui você verá os detalhes completos da notificação.';
    
    modalActions.innerHTML = `
        <button class="btn-secondary" id="closeModal">Fechar</button>
        <button class="btn-primary" id="markAsReadBtn">Marcar como lida</button>
    `;
    
    modal.classList.add('active');
    
    // Marcar como lida
    document.getElementById('markAsReadBtn')?.addEventListener('click', () => {
        markAsRead(notificationId);
        modal.classList.remove('active');
    });
    
    // Fechar modal
    document.getElementById('closeModal')?.addEventListener('click', () => {
        modal.classList.remove('active');
    });
}

function handleNotificationAction(notificationId, action) {
    switch(action) {
        case 'accept':
            acceptNotification(notificationId);
            break;
        case 'decline':
            declineNotification(notificationId);
            break;
        case 'view':
            viewNotificationDetails(notificationId);
            break;
    }
}

async function acceptNotification(notificationId) {
    // TODO: Implementar aceitação no Supabase
    console.log('Aceitar notificação:', notificationId);
    
    // Atualizar interface
    const notificationItem = document.querySelector(`[data-id="${notificationId}"]`);
    if (notificationItem) {
        notificationItem.classList.remove('unread');
        const actionsDiv = notificationItem.querySelector('.notification-actions');
        if (actionsDiv) {
            actionsDiv.innerHTML = '<span style="color: #2ecc71;">Convite aceito</span>';
        }
    }
    
    alert('Convite aceito com sucesso!');
}

async function declineNotification(notificationId) {
    // TODO: Implementar recusa no Supabase
    console.log('Recusar notificação:', notificationId);
    
    // Atualizar interface
    const notificationItem = document.querySelector(`[data-id="${notificationId}"]`);
    if (notificationItem) {
        notificationItem.classList.remove('unread');
        const actionsDiv = notificationItem.querySelector('.notification-actions');
        if (actionsDiv) {
            actionsDiv.innerHTML = '<span style="color: #e74c3c;">Convite recusado</span>';
        }
    }
    
    alert('Convite recusado.');
}

async function markAsRead(notificationId) {
    // TODO: Implementar marcação como lida no Supabase
    console.log('Marcar como lida:', notificationId);
    
    const notificationItem = document.querySelector(`[data-id="${notificationId}"]`);
    if (notificationItem) {
        notificationItem.classList.remove('unread');
    }
}

async function markAllAsRead() {
    // TODO: Implementar marcação de todas como lidas no Supabase
    console.log('Marcar todas como lidas');
    
    document.querySelectorAll('.notification-item.unread').forEach(item => {
        item.classList.remove('unread');
    });
    
    // Atualizar badge
    const notificationBadge = document.getElementById('notificationBadge');
    notificationBadge.style.display = 'none';
    
    alert('Todas as notificações foram marcadas como lidas.');
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
            // Remover active de todas
            document.querySelectorAll('.notification-tab').forEach(t => {
                t.classList.remove('active');
            });
            
            // Adicionar active na clicada
            tab.classList.add('active');
            currentFilter = tab.getAttribute('data-tab');
            
            // Recarregar notificações com filtro
            loadNotifications();
        });
    });
    
    // Marcar todas como lidas
    document.getElementById('markAllReadBtn')?.addEventListener('click', markAllAsRead);
    
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
}

// Inicializar
document.addEventListener('DOMContentLoaded', initNotifications);
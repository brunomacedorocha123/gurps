// Configuração do Supabase
const SUPABASE_URL = 'https://pujufdfhaxveuytkneqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1anVmZGZoYXh2ZXV5dGtuZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTkyODksImV4cCI6MjA3OTkzNTI4OX0.mzOwsmf8qIQ4HZqnXLEmq4D7M6fz4VH1YWpWP-BsFvc';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let currentUser = null;
let currentFilter = 'all';
let userInvitations = [];

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
        const notifications = [];

        // 1. Buscar convites de GUILDA (se a tabela existir)
        try {
            const { data: guildInvites, error: guildError } = await supabase
                .from('guild_invitations_with_details')
                .select('*')
                .eq('receiver_id', currentUser.id)
                .eq('status', 'pending')
                .order('sent_at', { ascending: false });

            if (!guildError && guildInvites) {
                guildInvites.forEach(invite => {
                    notifications.push({
                        id: invite.id,
                        type: 'guild_invite',
                        title: 'Convite para Guilda',
                        message: `${invite.sender_username || 'Alguém'} convidou você para a guilda "${invite.guild_name || 'Guilda'}"`,
                        guild_id: invite.guild_id,
                        guild_name: invite.guild_name,
                        sender_username: invite.sender_username,
                        status: invite.status,
                        sent_at: invite.sent_at,
                        read: false
                    });
                });
            }
        } catch (guildErr) {
            console.log('Tabela de guildas não disponível:', guildErr.message);
        }

        // 2. Buscar convites de CAMPANHA usando a view
        try {
            const { data: campaignInvites, error: campaignError } = await supabase
                .from('campaign_invitations_with_details')
                .select('*')
                .eq('receiver_id', currentUser.id)
                .eq('status', 'pending')
                .order('sent_at', { ascending: false });

            if (!campaignError && campaignInvites) {
                campaignInvites.forEach(invite => {
                    notifications.push({
                        id: invite.id,
                        type: 'campaign_invite',
                        title: 'Convite para Campanha',
                        message: `${invite.sender_username || 'Alguém'} convidou você para a campanha "${invite.campaign_name || 'Campanha'}"`,
                        campaign_id: invite.campaign_id,
                        campaign_name: invite.campaign_name,
                        campaign_code: invite.campaign_code,
                        sender_username: invite.sender_username,
                        status: invite.status,
                        sent_at: invite.sent_at,
                        message_text: invite.message,
                        read: false
                    });
                });
            } else if (campaignError) {
                console.log('Erro na view de campanha, tentando direto:', campaignError);
                // Fallback: buscar direto da tabela
                const { data: directCampaignInvites } = await supabase
                    .from('campaign_invitations')
                    .select(`
                        *,
                        campaigns (
                            name,
                            campaign_id
                        ),
                        sender:profiles!campaign_invitations_sender_id_fkey (
                            username
                        )
                    `)
                    .eq('receiver_id', currentUser.id)
                    .eq('status', 'pending')
                    .order('sent_at', { ascending: false });

                if (directCampaignInvites) {
                    directCampaignInvites.forEach(invite => {
                        notifications.push({
                            id: invite.id,
                            type: 'campaign_invite',
                            title: 'Convite para Campanha',
                            message: `${invite.sender?.username || 'Alguém'} convidou você para a campanha "${invite.campaigns?.name || 'Campanha'}"`,
                            campaign_id: invite.campaign_id,
                            campaign_name: invite.campaigns?.name,
                            campaign_code: invite.campaigns?.campaign_id,
                            sender_username: invite.sender?.username,
                            status: invite.status,
                            sent_at: invite.sent_at,
                            message_text: invite.message,
                            read: false
                        });
                    });
                }
            }
        } catch (campaignErr) {
            console.log('Erro ao buscar convites de campanha:', campaignErr);
        }

        userInvitations = notifications;
        renderNotifications(notifications);

    } catch (error) {
        console.error('Erro geral:', error);
        renderError('Erro ao carregar notificações');
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
            if (currentFilter === 'guild') return notif.type === 'guild_invite';
            if (currentFilter === 'campaign') return notif.type === 'campaign_invite';
            return false;
        });
    }

    // Atualizar contadores
    totalNotifications.textContent = filteredNotifications.length;
    
    if (filteredNotifications.length > 0) {
        notificationBadge.textContent = filteredNotifications.length > 99 ? '99+' : filteredNotifications.length;
        notificationBadge.style.display = 'inline';
    } else {
        notificationBadge.style.display = 'none';
    }

    // Renderizar notificações
    notificationsList.innerHTML = filteredNotifications.map(notification => {
        const timeAgo = getTimeAgo(notification.sent_at);
        const iconClass = notification.type === 'guild_invite' ? 'icon-guild' : 'icon-campaign';
        const iconText = notification.type === 'guild_invite' ? 'fas fa-users' : 'fas fa-map';
        
        return `
            <div class="notification-item unread" 
                 data-id="${notification.id}" 
                 data-type="${notification.type}"
                 data-guild-id="${notification.guild_id || ''}"
                 data-campaign-id="${notification.campaign_id || ''}">
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
                        <button class="notification-btn btn-accept" data-action="accept">
                            <i class="fas fa-check"></i> Aceitar
                        </button>
                        <button class="notification-btn btn-decline" data-action="decline">
                            <i class="fas fa-times"></i> Recusar
                        </button>
                    ` : ''}
                    <button class="notification-btn btn-view" data-action="view">
                        <i class="fas fa-eye"></i> Detalhes
                    </button>
                </div>
            </div>
        `;
    }).join('');

    setupNotificationEvents();
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
    document.querySelectorAll('.notification-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const action = btn.getAttribute('data-action');
            const notificationItem = btn.closest('.notification-item');
            const notificationId = notificationItem.getAttribute('data-id');
            const notificationType = notificationItem.getAttribute('data-type');
            
            if (action === 'accept') {
                if (notificationType === 'guild_invite') {
                    const guildId = notificationItem.getAttribute('data-guild-id');
                    await acceptGuildInvitation(notificationId, guildId);
                } else if (notificationType === 'campaign_invite') {
                    const campaignId = notificationItem.getAttribute('data-campaign-id');
                    await acceptCampaignInvitation(notificationId, campaignId);
                }
            } else if (action === 'decline') {
                if (notificationType === 'guild_invite') {
                    await declineGuildInvitation(notificationId);
                } else if (notificationType === 'campaign_invite') {
                    await declineCampaignInvitation(notificationId);
                }
            } else if (action === 'view') {
                viewNotificationDetails(notificationId);
            }
        });
    });
    
    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-actions')) {
                const notificationId = item.getAttribute('data-id');
                viewNotificationDetails(notificationId);
            }
        });
    });
}

// FUNÇÕES PARA GUILDA (JÁ EXISTENTES E FUNCIONANDO)
async function acceptGuildInvitation(invitationId, guildId) {
    if (!confirm('Deseja aceitar este convite e entrar na guilda?')) return;
    
    const { data, error } = await supabase.rpc('respond_to_invitation', {
        p_invitation_id: invitationId,
        p_accept: true
    });
    
    if (error) {
        alert('Erro: ' + error.message);
        return;
    }
    
    const notificationItem = document.querySelector(`[data-id="${invitationId}"]`);
    if (notificationItem) {
        notificationItem.querySelector('.notification-actions').innerHTML = 
            '<span style="color: #2ecc71; font-weight: bold;">✅ Aceito</span>';
    }
    
    alert('Convite aceito!');
    setTimeout(() => loadNotifications(), 2000);
}

async function declineGuildInvitation(invitationId) {
    if (!confirm('Deseja recusar este convite?')) return;
    
    const { data, error } = await supabase.rpc('respond_to_invitation', {
        p_invitation_id: invitationId,
        p_accept: false
    });
    
    if (error) {
        alert('Erro: ' + error.message);
        return;
    }
    
    const notificationItem = document.querySelector(`[data-id="${invitationId}"]`);
    if (notificationItem) {
        notificationItem.querySelector('.notification-actions').innerHTML = 
            '<span style="color: #e74c3c; font-weight: bold;">❌ Recusado</span>';
    }
    
    alert('Convite recusado.');
    setTimeout(() => loadNotifications(), 2000);
}

// FUNÇÕES PARA CAMPANHA (USANDO A FUNÇÃO QUE VOCÊ CRIOU)
async function acceptCampaignInvitation(invitationId, campaignId) {
    if (!confirm('Deseja aceitar este convite e entrar na campanha?')) return;
    
    try {
        // USAR A SUA FUNÇÃO respond_to_campaign_invitation
        const { data, error } = await supabase.rpc('respond_to_campaign_invitation', {
            p_invitation_id: invitationId,
            p_accept: true
        });
        
        if (error) {
            console.error('Erro ao chamar função:', error);
            // Fallback: fazer manualmente
            await acceptCampaignManual(invitationId, campaignId);
            return;
        }
        
        if (data && data.success) {
            const notificationItem = document.querySelector(`[data-id="${invitationId}"]`);
            if (notificationItem) {
                notificationItem.querySelector('.notification-actions').innerHTML = 
                    '<span style="color: #2ecc71; font-weight: bold;">✅ Aceito</span>';
            }
            alert(data.message || 'Convite aceito!');
            
            // ⭐⭐ ADICIONAR ESTA LINHA - Notificar campanhas.html ⭐⭐
            window.parent.postMessage({ type: 'campaign_accepted' }, '*');
            
            setTimeout(() => loadNotifications(), 2000);
        } else {
            alert(data?.message || 'Erro ao aceitar convite');
        }
    } catch (err) {
        console.error('Erro:', err);
        await acceptCampaignManual(invitationId, campaignId);
    }
}

// Fallback manual se a função não funcionar
async function acceptCampaignManual(invitationId, campaignId) {
    try {
        // 1. Atualizar convite
        const { error: updateError } = await supabase
            .from('campaign_invitations')
            .update({ 
                status: 'accepted',
                responded_at: new Date().toISOString()
            })
            .eq('id', invitationId);
        
        if (updateError) throw updateError;
        
        // 2. Buscar dados do convite
        const { data: inviteData } = await supabase
            .from('campaign_invitations')
            .select('campaign_id')
            .eq('id', invitationId)
            .single();
        
        if (!inviteData) throw new Error('Convite não encontrado');
        
        // 3. Adicionar à campanha
        const { error: playerError } = await supabase
            .from('campaign_players')
            .upsert({
                campaign_id: inviteData.campaign_id,
                user_id: currentUser.id,
                role: 'player',
                status: 'active',
                joined_at: new Date().toISOString()
            }, {
                onConflict: 'campaign_id,user_id'
            });
        
        if (playerError) throw playerError;
        
        // 4. Atualizar interface
        const notificationItem = document.querySelector(`[data-id="${invitationId}"]`);
        if (notificationItem) {
            notificationItem.querySelector('.notification-actions').innerHTML = 
                '<span style="color: #2ecc71; font-weight: bold;">✅ Aceito</span>';
        }
        
        alert('Convite aceito! Você entrou na campanha.');
        
        // ⭐⭐ ADICIONAR TAMBÉM AQUI ⭐⭐
        window.parent.postMessage({ type: 'campaign_accepted' }, '*');
        
        setTimeout(() => loadNotifications(), 2000);
        
    } catch (error) {
        console.error('Erro manual:', error);
        alert('Erro: ' + error.message);
    }
}

async function declineCampaignInvitation(invitationId) {
    if (!confirm('Deseja recusar este convite?')) return;
    
    try {
        // USAR A SUA FUNÇÃO
        const { data, error } = await supabase.rpc('respond_to_campaign_invitation', {
            p_invitation_id: invitationId,
            p_accept: false
        });
        
        if (error) {
            console.error('Erro ao chamar função:', error);
            // Fallback manual
            const { error: updateError } = await supabase
                .from('campaign_invitations')
                .update({ 
                    status: 'rejected',
                    responded_at: new Date().toISOString()
                })
                .eq('id', invitationId);
            
            if (updateError) throw updateError;
        } else if (data && !data.success) {
            alert(data.message);
            return;
        }
        
        const notificationItem = document.querySelector(`[data-id="${invitationId}"]`);
        if (notificationItem) {
            notificationItem.querySelector('.notification-actions').innerHTML = 
                '<span style="color: #e74c3c; font-weight: bold;">❌ Recusado</span>';
        }
        
        alert('Convite recusado.');
        setTimeout(() => loadNotifications(), 2000);
        
    } catch (err) {
        console.error('Erro:', err);
        alert('Erro ao recusar convite: ' + err.message);
    }
}

function viewNotificationDetails(notificationId) {
    const invitation = userInvitations.find(inv => inv.id === notificationId);
    if (!invitation) return;
    
    const modal = document.getElementById('notificationModal');
    const modalTitle = document.getElementById('modalNotificationTitle');
    const modalBody = document.getElementById('modalNotificationBody');
    const modalActions = document.getElementById('modalNotificationActions');
    
    if (invitation.type === 'guild_invite') {
        modalTitle.textContent = 'Detalhes do Convite para Guilda';
        modalBody.innerHTML = `
            <div style="margin-bottom: 15px;">
                <p><strong>Guilda:</strong> ${invitation.guild_name}</p>
                <p><strong>Convidado por:</strong> ${invitation.sender_username}</p>
                <p><strong>Enviado em:</strong> ${new Date(invitation.sent_at).toLocaleDateString('pt-BR')}</p>
            </div>
        `;
    } else {
        modalTitle.textContent = 'Detalhes do Convite para Campanha';
        modalBody.innerHTML = `
            <div style="margin-bottom: 15px;">
                <p><strong>Campanha:</strong> ${invitation.campaign_name}</p>
                <p><strong>Código:</strong> ${invitation.campaign_code}</p>
                <p><strong>Convidado por:</strong> ${invitation.sender_username}</p>
                <p><strong>Enviado em:</strong> ${new Date(invitation.sent_at).toLocaleDateString('pt-BR')}</p>
            </div>
        `;
    }
    
    modalBody.innerHTML += `
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
            <p><strong>Status:</strong> ${invitation.status === 'pending' ? '🟡 Pendente' : '✅ Processado'}</p>
        </div>
    `;
    
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
        
        document.getElementById('modalAcceptBtn').addEventListener('click', () => {
            modal.classList.remove('active');
            if (invitation.type === 'guild_invite') {
                acceptGuildInvitation(invitation.id, invitation.guild_id);
            } else {
                acceptCampaignInvitation(invitation.id, invitation.campaign_id);
            }
        });
        
        document.getElementById('modalDeclineBtn').addEventListener('click', () => {
            modal.classList.remove('active');
            if (invitation.type === 'guild_invite') {
                declineGuildInvitation(invitation.id);
            } else {
                declineCampaignInvitation(invitation.id);
            }
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
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });
    
    document.querySelectorAll('.notification-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.notification-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.getAttribute('data-tab');
            loadNotifications();
        });
    });
    
    document.getElementById('markAllReadBtn')?.addEventListener('click', () => {
        document.querySelectorAll('.notification-item.unread').forEach(item => {
            item.classList.remove('unread');
        });
        alert('Todas marcadas como lidas');
    });
    
    document.getElementById('closeModalBtn')?.addEventListener('click', () => {
        document.getElementById('notificationModal').classList.remove('active');
    });
    
    document.getElementById('notificationModal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('notificationModal')) {
            document.getElementById('notificationModal').classList.remove('active');
        }
    });
    
    setInterval(() => loadNotifications(), 30000);
}

// Inicializar
document.addEventListener('DOMContentLoaded', initNotifications);
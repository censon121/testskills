// 加载仪表板数据
async function loadDashboard() {
    try {
        // 获取所有数据
        const [customers, appointments] = await Promise.all([
            API.Customer.getAll(),
            API.Appointment.getAll(),
        ]);

        // 更新统计
        document.getElementById('totalCustomers').textContent = customers.length;
        document.getElementById('totalAppointments').textContent = appointments.length;

        // 计算今日预约
        const today = new Date().toISOString().split('T')[0];
        const todayAppts = appointments.filter(a => a.date === today);
        document.getElementById('todayAppointments').textContent = todayAppts.length;

        // 计算待处理预约
        const pendingAppts = appointments.filter(a => a.status === 'pending');
        document.getElementById('pendingAppointments').textContent = pendingAppts.length;

        // 显示今日预约列表
        displayTodayAppointments(todayAppts, customers);

        // 显示最近预约
        displayRecentAppointments(appointments.slice(0, 5), customers);

    } catch (error) {
        console.error('加载仪表板失败:', error);
        showError('加载数据失败，请确保后端服务正在运行');
    }
}

// 显示今日预约
function displayTodayAppointments(appointments, customers) {
    const container = document.getElementById('todayAppointmentsList');

    if (appointments.length === 0) {
        container.innerHTML = '<p>今日暂无预约</p>';
        return;
    }

    // 按时间排序
    appointments.sort((a, b) => a.time.localeCompare(b.time));

    let html = '<table><thead><tr><th>时间</th><th>客户</th><th>备注</th><th>状态</th></tr></thead><tbody>';

    appointments.forEach(appt => {
        const customer = customers.find(c => c.id === appt.customer_id);
        html += `
            <tr>
                <td>${appt.time}</td>
                <td>${customer ? customer.name : '未知'}</td>
                <td>${appt.notes || '-'}</td>
                <td><span class="status-badge status-${appt.status}">${getStatusText(appt.status)}</span></td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// 显示最近预约
function displayRecentAppointments(appointments, customers) {
    const container = document.getElementById('recentAppointmentsList');

    if (appointments.length === 0) {
        container.innerHTML = '<p>暂无预约</p>';
        return;
    }

    let html = '<table><thead><tr><th>日期</th><th>时间</th><th>客户</th><th>状态</th></tr></thead><tbody>';

    appointments.forEach(appt => {
        const customer = customers.find(c => c.id === appt.customer_id);
        html += `
            <tr>
                <td>${appt.date}</td>
                <td>${appt.time}</td>
                <td>${customer ? customer.name : '未知'}</td>
                <td><span class="status-badge status-${appt.status}">${getStatusText(appt.status)}</span></td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// 状态文本转换
function getStatusText(status) {
    const statusMap = {
        'pending': '待处理',
        'confirmed': '已确认',
        'completed': '已完成',
        'cancelled': '已取消',
    };
    return statusMap[status] || status;
}

// 显示错误
function showError(message) {
    document.querySelectorAll('.stat-card h3').forEach(el => el.textContent = '-');
    document.getElementById('todayAppointmentsList').innerHTML = `<p style="color: var(--danger-color)">${message}</p>`;
    document.getElementById('recentAppointmentsList').innerHTML = '';
}

// 页面加载时执行
document.addEventListener('DOMContentLoaded', loadDashboard);

let appointments = [];
let customers = [];

// 加载预约列表
async function loadAppointments() {
    try {
        [appointments, customers] = await Promise.all([
            API.Appointment.getAll(),
            API.Customer.getAll(),
        ]);
        // 按日期和时间排序
        appointments.sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.time.localeCompare(b.time);
        });
        displayAppointments(appointments);
    } catch (error) {
        console.error('加载预约失败:', error);
        document.getElementById('appointmentsTable').innerHTML = '<p style="color: var(--danger-color)">加载失败，请刷新页面重试</p>';
    }
}

// 显示预约列表
function displayAppointments(appointments) {
    const container = document.getElementById('appointmentsTable');

    if (appointments.length === 0) {
        container.innerHTML = '<p>暂无预约</p>';
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>日期</th>
                    <th>时间</th>
                    <th>客户</th>
                    <th>备注</th>
                    <th>状态</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
    `;

    appointments.forEach(appt => {
        const customer = customers.find(c => c.id === appt.customer_id);
        const customerName = customer ? customer.name : '未知客户';
        const statusText = getStatusText(appt.status);

        html += `
            <tr>
                <td>${appt.date}</td>
                <td>${appt.time}</td>
                <td>${customerName}</td>
                <td>${appt.notes || '-'}</td>
                <td><span class="status-badge status-${appt.status}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-warning btn-sm" onclick="editAppointment(${appt.id})">编辑</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteAppointment(${appt.id})">删除</button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// 打开预约模态框
async function openAppointmentModal(appointment = null) {
    const modal = document.getElementById('appointmentModal');
    const title = document.getElementById('appointmentModalTitle');
    const form = document.getElementById('appointmentForm');
    const customerSelect = document.getElementById('appointmentCustomer');

    // 加载客户列表
    try {
        customers = await API.Customer.getAll();
        customerSelect.innerHTML = '<option value="">请选择客户</option>';
        customers.forEach(customer => {
            customerSelect.innerHTML += `<option value="${customer.id}">${customer.name} (${customer.phone})</option>`;
        });
    } catch (error) {
        alert('加载客户列表失败');
        return;
    }

    if (appointment) {
        title.textContent = '编辑预约';
        document.getElementById('appointmentId').value = appointment.id;
        document.getElementById('appointmentCustomer').value = appointment.customer_id;
        document.getElementById('appointmentDate').value = appointment.date;
        document.getElementById('appointmentTime').value = appointment.time;
        document.getElementById('appointmentNotes').value = appointment.notes || '';
        document.getElementById('appointmentStatus').value = appointment.status;
    } else {
        title.textContent = '创建预约';
        form.reset();
        document.getElementById('appointmentId').value = '';
        // 默认选择今天
        document.getElementById('appointmentDate').value = new Date().toISOString().split('T')[0];
    }

    modal.classList.add('active');
}

// 关闭预约模态框
function closeAppointmentModal() {
    document.getElementById('appointmentModal').classList.remove('active');
}

// 保存预约
async function saveAppointment(event) {
    event.preventDefault();

    const id = document.getElementById('appointmentId').value;
    const data = {
        customer_id: parseInt(document.getElementById('appointmentCustomer').value),
        date: document.getElementById('appointmentDate').value,
        time: document.getElementById('appointmentTime').value,
        notes: document.getElementById('appointmentNotes').value.trim(),
        status: document.getElementById('appointmentStatus').value,
    };

    try {
        if (id) {
            await API.Appointment.update(id, data);
            alert('预约更新成功！');
        } else {
            await API.Appointment.create(data);
            alert('预约创建成功！');
        }

        closeAppointmentModal();
        loadAppointments();
    } catch (error) {
        alert('保存失败: ' + error.message);
    }
}

// 编辑预约
function editAppointment(id) {
    const appointment = appointments.find(a => a.id === id);
    if (appointment) {
        openAppointmentModal(appointment);
    }
}

// 删除预约
async function deleteAppointment(id) {
    if (!confirm('确定要删除这个预约吗？')) {
        return;
    }

    try {
        await API.Appointment.delete(id);
        alert('预约删除成功！');
        loadAppointments();
    } catch (error) {
        alert('删除失败: ' + error.message);
    }
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

// 页面加载时执行
document.addEventListener('DOMContentLoaded', loadAppointments);

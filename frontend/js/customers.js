let customers = [];

// 加载客户列表
async function loadCustomers() {
    try {
        customers = await API.Customer.getAll();
        displayCustomers(customers);
    } catch (error) {
        console.error('加载客户失败:', error);
        document.getElementById('customersTable').innerHTML = '<p style="color: var(--danger-color)">加载失败，请刷新页面重试</p>';
    }
}

// 显示客户列表
function displayCustomers(customers) {
    const container = document.getElementById('customersTable');

    if (customers.length === 0) {
        container.innerHTML = '<p>暂无客户</p>';
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>姓名</th>
                    <th>电话</th>
                    <th>注册时间</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
    `;

    customers.forEach(customer => {
        const createdAt = new Date(customer.created_at).toLocaleString('zh-CN');
        html += `
            <tr>
                <td>${customer.id}</td>
                <td>${customer.name}</td>
                <td>${customer.phone}</td>
                <td>${createdAt}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-warning btn-sm" onclick="editCustomer(${customer.id})">编辑</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteCustomer(${customer.id})">删除</button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// 打开客户模态框
function openCustomerModal(customer = null) {
    const modal = document.getElementById('customerModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('customerForm');

    if (customer) {
        title.textContent = '编辑客户';
        document.getElementById('customerId').value = customer.id;
        document.getElementById('customerName').value = customer.name;
        document.getElementById('customerPhone').value = customer.phone;
    } else {
        title.textContent = '添加客户';
        form.reset();
        document.getElementById('customerId').value = '';
    }

    modal.classList.add('active');
}

// 关闭客户模态框
function closeCustomerModal() {
    document.getElementById('customerModal').classList.remove('active');
}

// 保存客户
async function saveCustomer(event) {
    event.preventDefault();

    const id = document.getElementById('customerId').value;
    const data = {
        name: document.getElementById('customerName').value.trim(),
        phone: document.getElementById('customerPhone').value.trim(),
    };

    try {
        if (id) {
            // 更新客户
            await API.Customer.update(id, data);
            alert('客户更新成功！');
        } else {
            // 创建客户
            await API.Customer.create(data);
            alert('客户添加成功！');
        }

        closeCustomerModal();
        loadCustomers();
    } catch (error) {
        alert('保存失败: ' + error.message);
    }
}

// 编辑客户
function editCustomer(id) {
    const customer = customers.find(c => c.id === id);
    if (customer) {
        openCustomerModal(customer);
    }
}

// 删除客户
async function deleteCustomer(id) {
    if (!confirm('确定要删除这个客户吗？')) {
        return;
    }

    try {
        await API.Customer.delete(id);
        alert('客户删除成功！');
        loadCustomers();
    } catch (error) {
        alert('删除失败: ' + error.message);
    }
}

// 页面加载时执行
document.addEventListener('DOMContentLoaded', loadCustomers);

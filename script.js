// Utility Functions 
const getDataFromLS = (key) => JSON.parse(localStorage.getItem(key)) || [];

const getEl = (selector) => document.querySelector(selector);

const getAllEl = (selector) => document.querySelectorAll(selector);
const updateDataInLS = (key, value) => localStorage.setItem(key, JSON.stringify(value));

// Fetching Data From LS 
let expense = getDataFromLS('t_expense');
let income = getDataFromLS('t_income');
console.log(income);
console.log(expense);

// Rendering the items 
const renderItems = () => {
    // Rendering Total Inputs 
    const totalIncome = income.reduce((sum, val) => sum + Number(val.amount), 0);
    const totalExpense = expense.reduce((sum, val) => sum + Number(val.amount), 0);
    const totalBalance = totalIncome - totalExpense;
    getEl('#total-income').textContent = totalIncome;
    getEl('#total-expense').textContent = totalExpense;
    getEl('#total-balance').textContent = totalBalance;

    // rendering List 
    const tbody = getEl('tbody');
    tbody.innerHTML = ''
    const allEntries = [
        ...income.map((val, index) => { return { ...val, type: "income", "index": index } }),
        ...expense.map((val, index) => { return { ...val, type: 'expense', "index": index } })
    ].sort((a, b) => new Date(b.date) - new Date(a.date));


    allEntries.forEach((val, index) => {
        let tr = document.createElement('tr');
        tr.dataset.type = val.type;
        tr.dataset.index = val.index;
        if (val.type === 'income') {
            let data = `<td colspan="2">${val.date}</td>
            <td style="color:yellow; font-weight: bold;">${val.amount}</td>
            <td style="color:red">0</td>
            <td><button class='del-btn' style='color:black;' data-id='${val.index}' data-type='${val.type}'><i class='bx bxs-trash'></i></button></td>`;
            tr.innerHTML = data;
        }
        if (val.type === 'expense') {
            let data = `<td colspan="2">${val.date}</td>
             <td style="color:yellow; font-weight: bold;">0</td>
             <td style="color:red; font-weight: bold;">-${val.amount}</td>
             <td><button class='del-btn' data-id='${val.index}' style='color:black;' data-type='${val.type}'><i class='bx bxs-trash'></i></button></td>`;
            tr.innerHTML = data;
        }
        tbody.appendChild(tr);
    })
    attachEventListeners();
}


//Add-Data In LS

getEl('#add-btn').addEventListener('click', () => {
    const userValue = getEl('#add-input').value.trim();
    if (!userValue) {
        return;
    }
    const type = getEl('.dialogue').getAttribute('data-id');
    const currentDate = Date().toString().replace('GMT+0530 (India Standard Time)', '').slice(4, -4);
    if (type === 'income-btn') {
        const entry = {
            amount: Number(userValue),
            date: currentDate
        }
        income.unshift(entry);

        localStorage.setItem('t_income', JSON.stringify(income))

    } else if (type === 'expense-btn') {
        const entry = {
            amount: Number(userValue),
            date: currentDate
        }
        expense.unshift(entry);

        localStorage.setItem('t_expense', JSON.stringify(expense))
    } else {
        return;
    }
    renderItems();
    getEl('#add-input').value = '';
    getEl('.model').style.display = 'none';

});

// Opening the model
getAllEl('.add-btns').forEach(el => {
    el.addEventListener('click', (e) => {
        getEl('.model').style.display = 'flex';
        getEl('.dialogue').setAttribute('data-id', e.target.id);
        getEl('#add-input').focus();
    });
});

// 

// Closing The Model 
getAllEl('.close-btn').forEach(el => {
    el.addEventListener('click', () => {
        getEl('#edit-model').style.display = 'none'
        getEl('#add-model').style.display = 'none'
    });
})

// Delete button 

const attachEventListeners = () => {

    // delete system
    getAllEl('.del-btn').forEach(el => {
        el.addEventListener('click', handleDelete)
    });


    // Edit system
    getAllEl('tr').forEach(el => {
        el.addEventListener('click', handleEdit);
    })
}

// handleEdit

const handleEdit = (e) => {
    getEl('#edit-model').style.display = 'flex';
    let tr = e.target.closest('tr')
    let type = tr.dataset.type;
    let index = tr.dataset.index;
    const input = getEl('#edit-input');
    input.focus();
    if (type === 'income') input.value = income[index].amount;
    if (type === 'expense') input.value = expense[index].amount;

    // adding eventlistener
    getEl('#edit-btn').addEventListener('click', () => {
        const userValue = getEl('#edit-input').value.trim();
        if (!userValue) {
            alert("Empty Value")
            return false;
        };
        if (!confirm('Are You Sure?')) return false;
        if (type === 'income') income[index].amount = userValue;
        if (type === 'expense') expense[index].amount = userValue;
        updateDataInLS('t_income', income);
        updateDataInLS('t_expense', expense);
        getEl("#edit-model").style.display = 'none';
        renderItems();
    })
}

// handleDelete
const handleDelete = (e) => {
    e.stopPropagation();
    const index = e.target.closest("button").dataset.id;
    const type = e.target.closest('button').dataset.type;
    if (!confirm('Are You Sure')) return;
    if (type === 'income') {
        income.splice(index, 1);
        updateDataInLS('t_income', income);
    } else if (type === 'expense') {
        expense.splice(index, 1);
        updateDataInLS('t_expense', expense);
    } else {
        return;
    }
    renderItems();
}

// Initial Rendering 

renderItems();


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  }
  
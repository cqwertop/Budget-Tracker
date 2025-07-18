// Global variables
let totalIncome = 0;
let totalExpenses = 0;
let expenseList = [];

// Function to add income
function addIncome() {
    const income = document.getElementById("income").value;
    if (income && !isNaN(income)) {
        totalIncome = parseFloat(income);
        document.getElementById("total-income").textContent = totalIncome.toFixed(2);
        updateRemainingBalance();
        saveData();
    } else {
        alert("Please enter a valid income.");
    }
}

// Function to add expenses
function addExpense() {
    const expenseName = document.getElementById("expense-name").value;
    const expenseCategory = document.getElementById("expense-category").value;
    const expenseAmount = document.getElementById("expense-amount").value;

    // Ensure expenseList is initialized
    if (!expenseList) {
        expenseList = [];
    }

    if (expenseName && expenseCategory && expenseAmount && !isNaN(expenseAmount)) {
        totalExpenses += parseFloat(expenseAmount);
        expenseList.push({ name: expenseName, category: expenseCategory, amount: parseFloat(expenseAmount) });

        // Create a new list item
        const li = document.createElement("li");
        li.innerHTML = `${expenseName} (${expenseCategory}): $<span>${expenseAmount}</span>`;

        // Add the new item to the expense list
        document.getElementById("expense-list").appendChild(li);

        // Update the total expenses and remaining balance
        document.getElementById("total-expenses").textContent = totalExpenses.toFixed(2);
        updateRemainingBalance();
        updateChart();
        saveData();
    } else {
        alert("Please enter valid expense details.");
    }

    // Reset expense input fields
    document.getElementById("expense-name").value = "";
    document.getElementById("expense-category").value = "";
    document.getElementById("expense-amount").value = "";
}

// Function to update the remaining balance
function updateRemainingBalance() {
    const remainingBalance = totalIncome - totalExpenses;
    document.getElementById("remaining-balance").textContent = remainingBalance.toFixed(2);
}

// Function to update the expense chart
function updateChart() {
    // Aggregate expenses by category
    const categories = expenseList.reduce((acc, expense) => {
        if (!acc[expense.category]) {
            acc[expense.category] = 0;
        }
        acc[expense.category] += expense.amount;
        return acc;
    }, {});

    // Create arrays for chart labels and data
    const labels = Object.keys(categories);
    const values = Object.values(categories);

    // Check if we have any data to display
    if (labels.length === 0) {
        labels.push("No Expenses");
        values.push(1);  // Small value to show the chart
    }

    // Get the canvas context
    const ctx = document.getElementById('expense-chart').getContext('2d');

    // Destroy the existing chart if it exists
    const chart = Chart.getChart(ctx); 
    if (chart) {
        chart.destroy();
    }

    // Create a new chart with the updated data
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33A8', '#FFC300'],
                borderColor: ['#fff', '#fff', '#fff', '#fff', '#fff'],
                borderWidth: 2
            }]
        }
    });
}

// Function to export data to CSV
function exportData() {
    const data = [['Expense Name', 'Category', 'Amount']];
    expenseList.forEach(expense => {
        data.push([expense.name, expense.category, expense.amount]);
    });

    let csvContent = "data:text/csv;charset=utf-8," + data.map(e => e.join(",")).join("\n");

    // Create a download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'expenses.csv');
    link.click();
}

// Function to reset data for next month
function resetData() {
    totalIncome = 0;
    totalExpenses = 0;
    expenseList = [];
    document.getElementById("total-income").textContent = "0.00";
    document.getElementById("total-expenses").textContent = "0.00";
    document.getElementById("remaining-balance").textContent = "0.00";
    document.getElementById("expense-list").innerHTML = "";
    updateChart();
    localStorage.removeItem("budgetData");
    alert("Data has been reset for the new month!");
}

// Function to save data to localStorage
function saveData() {
    const data = {
        income: totalIncome,
        expenses: expenseList
    };
    localStorage.setItem("budgetData", JSON.stringify(data));
}

// Function to load saved data from localStorage
function loadData() {
    const savedData = JSON.parse(localStorage.getItem("budgetData"));
    if (savedData) {
        totalIncome = savedData.income || 0;
        expenseList = savedData.expenses || [];
        totalExpenses = expenseList.reduce((sum, expense) => sum + expense.amount, 0);
        document.getElementById("total-income").textContent = totalIncome.toFixed(2);
        document.getElementById("total-expenses").textContent = totalExpenses.toFixed(2);
        updateRemainingBalance();

        // Add expense items to the UI
        expenseList.forEach(expense => {
            const li = document.createElement("li");
            li.innerHTML = `${expense.name} (${expense.category}): $<span>${expense.amount}</span>`;
            document.getElementById("expense-list").appendChild(li);
        });

        updateChart();
    }
}

// Load saved data on page load
window.onload = loadData;

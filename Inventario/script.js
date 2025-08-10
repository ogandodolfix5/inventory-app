document.addEventListener('DOMContentLoaded', () => {
  const formMovement = document.getElementById('movementForm');
  const formProduct = document.getElementById('productForm');
  const productTable = document.getElementById('productTable').getElementsByTagName('tbody')[0];

  // 📌 Cargar datos guardados
  const savedData = localStorage.getItem('inventoryData');
  if (savedData) {
    productTable.innerHTML = savedData;
  }

  // 📌 Guardar tabla
  function saveInventory() {
    localStorage.setItem('inventoryData', productTable.innerHTML);
  }

  // 📌 Colorear según stock
  function updateRowColor(row) {
    const currentStock = parseInt(row.cells[4].textContent, 10);
    const minStock = parseInt(row.cells[5].textContent, 10);
    if (currentStock <= minStock) {
      row.cells[4].style.backgroundColor = '#ff4d4d';
      row.cells[4].style.color = '#fff';
    } else {
      row.cells[4].style.backgroundColor = '';
      row.cells[4].style.color = '';
    }
  }

  // 📌 Colorear todas las filas al inicio
  for (let row of productTable.rows) {
    updateRowColor(row);
  }

  // 📌 Agregar movimiento
  formMovement.addEventListener('submit', (e) => {
    e.preventDefault();

    const productId = document.getElementById('productId').value.trim();
    const type = document.getElementById('type').value;
    const quantity = parseInt(document.getElementById('quantity').value, 10);

    let found = false;

    for (let row of productTable.rows) {
      if (row.cells[0].textContent.trim() === productId) {
        found = true;

        let currentStock = parseInt(row.cells[4].textContent, 10);
        if (type === 'entry') {
          currentStock += quantity;
        } else {
          currentStock -= quantity;
          if (currentStock < 0) currentStock = 0;
        }

        row.cells[4].textContent = currentStock;
        updateRowColor(row);
        saveInventory();
        break;
      }
    }

    if (!found) {
      alert('Product not found!');
    }

    formMovement.reset();
  });

  // 📌 Agregar nuevo producto
  formProduct.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('newId').value.trim();
    const name = document.getElementById('newName').value.trim();
    const category = document.getElementById('newCategory').value.trim();
    const initial = parseInt(document.getElementById('newInitial').value, 10);
    const minStock = parseInt(document.getElementById('newMin').value, 10);

    // Evitar duplicados
    for (let row of productTable.rows) {
      if (row.cells[0].textContent.trim() === id) {
        alert('Product ID already exists!');
        return;
      }
    }

    const newRow = productTable.insertRow();
    newRow.insertCell(0).textContent = id;
    newRow.insertCell(1).textContent = name;
    newRow.insertCell(2).textContent = category;
    newRow.insertCell(3).textContent = initial;
    newRow.insertCell(4).textContent = initial;
    newRow.insertCell(5).textContent = minStock;

    updateRowColor(newRow);
    saveInventory();
    formProduct.reset();
  });

  // 📌 Exportar tabla a Excel real (.xlsx)
  document.getElementById('exportBtn').addEventListener('click', () => {
    let table = document.getElementById('productTable');
    let workbook = XLSX.utils.table_to_book(table, { sheet: "Inventory" });
    XLSX.writeFile(workbook, "inventory.xlsx");
  });

  // 📌 Importar datos desde Excel
  document.getElementById('importFile').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Limpiar tabla
      productTable.innerHTML = '';

      // Saltar la fila de encabezados y agregar productos
      json.slice(1).forEach(row => {
        if (row.length >= 6) {
          const newRow = productTable.insertRow();
          for (let i = 0; i < 6; i++) {
            newRow.insertCell(i).textContent = row[i] || '';
          }
          updateRowColor(newRow);
        }
      });

      saveInventory();
      alert('Inventory imported successfully!');
    };

    reader.readAsArrayBuffer(file);
  });
});

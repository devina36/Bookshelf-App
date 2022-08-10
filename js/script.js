const todos = [];
const RENDER_EVENT = 'render-todo';
const SAVED_EVENT = 'saved-todo';
const STORAGE_KEY = 'TODO_APPS';

function generateId() {
  return +new Date();
}

function generateTodoObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted
  }
}

function findTodo(todoId) {
  for (const todoItem of todos) {
    if (todoItem.id === todoId) {
      return todoItem;
    }
  }
  return null;
}

function findTodoIndex(todoId) {
  for (const index in todos) {
    if (todos[index].id === todoId) {
      return index;
    }
  }
  return -1;
}

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(todos);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}


function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const todo of data) {
      todos.push(todo);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}


function makeTodo(todoObject) {
  const {id, title, author, year, isCompleted} = todoObject;

  const textTitle = document.createElement('h2');
  textTitle.innerText = title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = "Authors : " + author;

  const textYear = document.createElement('p');
  textYear.innerText = "Published : " + year;

  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement('div');
  container.classList.add('item', 'shadow')
  container.append(textContainer);
  container.setAttribute('id', `todo-${id}`);

  if (isCompleted) {
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');
    undoButton.innerHTML = `<i class="fa fa-undo" aria-hidden="true"></i> Unfinished`;
    undoButton.addEventListener('click', function () {
      undoTaskFromCompleted(id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    trashButton.innerHTML = `<i class="fa fa-trash" aria-hidden="true"></i> Delete`;
    trashButton.onclick = function() {mydelete(id)};

    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');
    checkButton.innerHTML = `<i class="fa fa-check-circle-o" aria-hidden="true"></i> Finished`;
    checkButton.addEventListener('click', function () {
      addTaskToCompleted(id);
    });
    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    trashButton.innerHTML = `<i class="fa fa-trash" aria-hidden="true"></i> Delete`;
    trashButton.onclick = function() {mydelete(id)};

    container.append(checkButton, trashButton);
  }

  return container;
}

function addTodo() {
  const textTodo = document.getElementById('title').value;
  const textAuthor = document.getElementById('author').value;
  const textYear = document.getElementById('year').value;
  const iscompleted = document.getElementById('iscompleted').checked;

  const generatedID = generateId();
  const todoObject = generateTodoObject(generatedID, textTodo, textAuthor, textYear, iscompleted);
  todos.push(todoObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addTaskToCompleted(todoId) {
  const todoTarget = findTodo(todoId);

  if (todoTarget == null) return;

  todoTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeTaskFromCompleted(todoId) {
  const todoTarget = findTodoIndex(todoId);

  if (todoTarget === -1) return;

  todos.splice(todoTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoTaskFromCompleted(todoId) {

  const todoTarget = findTodo(todoId);
  if (todoTarget == null) return;

  todoTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.addEventListener('DOMContentLoaded', function () {

  const submitForm = document.getElementById('form');
  const inputs = document.querySelectorAll('#title, #author, #year');

  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addTodo();

    inputs.forEach(input => {
      input.value = '';
    });

    document.getElementById("iscompleted").checked = false;

    Swal.fire({
      title: 'Success!',
      background: '#73DAE8',
      color: "#fff",
      timer: 1750,
      timerProgressBar: true,
    })
  
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(SAVED_EVENT, function() {
  console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedTODOList = document.getElementById('todos');
  const listCompleted = document.getElementById('completed-todos');

  uncompletedTODOList.innerHTML = '';
  listCompleted.innerHTML = '';

  for (const todoItem of todos) {
    const todoElement = makeTodo(todoItem);
    if (todoItem.isCompleted) {
      listCompleted.append(todoElement);
    } else {
      uncompletedTODOList.append(todoElement);
    }
  }
})

function search() {
  var input = document.getElementById("search");
  var filter = input.value.toUpperCase();
  var item = document.getElementsByClassName("item");
  var i;
  for (i = 0; i < item.length; i++) {
    var a = item[i].getElementsByTagName("h2")[0];
    if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
      item[i].style.display = "";
    } else {
      item[i].style.display = "none";
    }
  }
}

function mydelete(todoId) {
  var id = todoId;
    Swal.fire({
      title: 'Are you sure you want to delete this item?',
      color: "#fff",
      icon: 'warning',
      background: '#202342',
      showCancelButton: true,
      confirmButtonColor: '#FF5A82',
      cancelButtonColor: '#73DAE8',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        removeTaskFromCompleted(id)
        Swal.fire({
          background: '#202342',
          color: "#fff",
          title: 'Your item has been deleted',
        })
      }else{
        return 0;
      }
    })
}
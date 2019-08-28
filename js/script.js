let store = [];
const ulGroups = document.getElementById('listOfGroups');
const blockAddGroup = document.getElementById('blockAddGroup');
const btnAddGroup = document.getElementById('btnAddGroup');
const btnDeleteGroup = document.getElementById('btnDeleteGroup');
const btnBackToListOfGroups = document.getElementById('btnBackToListOfGroups');
const btnSaveGroup = document.getElementById('btnSaveGroup');
const btnSaveChangesGroup = document.getElementById('btnSaveChangesGroup');
const ulTasks = document.getElementById('taskList');
const searchTask = document.getElementById('searchTask');
const sortPanel = document.getElementById('sortPanel');
const sortTypesPanel = document.getElementById('sortTypesPanel');

if (localStorage.getItem('todo') !== null) {
	// render from localStorage
	store = JSON.parse(localStorage.getItem('todo'));
	renderAllGroups(store);
}

ulTasks.addEventListener(
	'click',
	function(event) {
		if (event.target.tagName === 'P') {
			const targetTaskText = event.target.innerText;
			const arrTasksInCheckGroup = store[findIndexSelectedGroupInArr()].tasks;
			const indexTask = findTaskByTitle(targetTaskText);
			const taskObj = arrTasksInCheckGroup[indexTask];

			event.target.classList.toggle('checked-list-item');
			event.target.parentNode.classList.toggle('checked-green-background');

			if (event.target.classList.contains('checked-list-item')) {
				// add state "check" in obj
				taskObj.check = true;
				event.target.nextSibling.style.display = 'none';
				localStorage.setItem('todo', JSON.stringify(store));
			} else {
				taskObj.check = false;
				event.target.nextSibling.style.display = 'inline';
				localStorage.setItem('todo', JSON.stringify(store));
			}
		}

		if (event.target.className === 'task-list-item__btn-delete-task') {
			const targetTaskText = event.target.parentNode.firstChild.innerText;

			deleteTask(targetTaskText);
		}

		if (event.target.className === 'task-list-item__btn-edit-task') {
			const targetTaskText = event.target.parentNode.firstChild.innerText;
			const arrTasksInCheckGroup = store[findIndexSelectedGroupInArr()].tasks;
			const indexTask = findTaskByTitle(targetTaskText);
			const taskObj = arrTasksInCheckGroup[indexTask];

			editTask(taskObj);
		}
	},
	false,
);

ulGroups.addEventListener(
	'click',
	function(event) {
		for (let li of this.getElementsByClassName('list-of-groups__item')) {
			//delete the class when you click on another group
			if (li.classList.contains('checked-group-item')) {
				li.classList.remove('checked-group-item');
			}
		}

		if (event.target.className === 'list-of-groups__edit-group') {
			const targetTitle = event.target.parentNode.innerText.split('\n', 2)[1] + '';
			const indexTargetObjInArr = findIndexGroupInArr(targetTitle);

			editGroup(store[indexTargetObjInArr]);
		}

		if (event.target.tagName === 'SPAN') {
			//if you clicked on the span, it will still highlight the list
			event.target.parentNode.classList.toggle('checked-group-item');
		}

		if (event.target.tagName === 'LI') {
			event.target.classList.toggle('checked-group-item');
		}

		if (event.target.className !== 'list-of-groups__edit-group') {
			const IndexSelectedGroupInArr = findIndexSelectedGroupInArr();

			if (typeof IndexSelectedGroupInArr !== undefined) {
				btnDeleteGroup.style.display = 'inline';
				showPanelOfTasks();
				renderTasksOfActiveGroup();
			} else {
				ulTasks.style.display = 'none';
			}
		}

		searchTask.value = '';
	},
	false,
);

searchTask.addEventListener('keyup', function() {
	const valueSearch = this.value.toLowerCase();
	const arrOfTasksInChekedGroup = ulTasks.getElementsByTagName('li');

	for (let taskItem of arrOfTasksInChekedGroup) {
		const descriptionOfTask = taskItem.firstChild.innerText;
		const substringIndex = descriptionOfTask.toLowerCase().indexOf(valueSearch);

		if (substringIndex > -1) {
			//create a new line, where what is entered in the search is highlighted with the tag <mark>
			const redrawnString = redrawingStringThanSearching(
				descriptionOfTask,
				substringIndex,
				substringIndex + valueSearch.length,
			);

			taskItem.firstChild.innerHTML = redrawnString;
		} else {
			taskItem.firstChild.innerText = descriptionOfTask;
		}
	}
});

sortPanel.addEventListener('click', () => sortTypesPanel.classList.toggle('show-sort-types'));

document.addEventListener('click', event => {
	//if we click not on the sorting block, then we remove it
	if (!sortPanel.contains(event.target)) sortTypesPanel.classList.remove('show-sort-types');
});

function redrawingStringThanSearching(initString, startSubstringIndex, endSubstringIndex) {
	const redrawnString =
		initString.slice(0, startSubstringIndex) +
		'<mark>' +
		initString.slice(startSubstringIndex, endSubstringIndex) +
		'</mark>' +
		initString.slice(endSubstringIndex);

	return redrawnString;
}

function sortByNew() {
	const indexSelectedGroup = findIndexSelectedGroupInArr();
	const arrOfTasks = store[indexSelectedGroup].tasks;

	arrOfTasks.sort((a, b) => (a.dateTime > b.dateTime ? -1 : 1));
	ulTasks.innerHTML = '';
	renderTasksOfActiveGroup();
	localStorage.setItem('todo', JSON.stringify(store));
}

function sortByOld() {
	const indexSelectedGroup = findIndexSelectedGroupInArr();
	const arrOfTasks = store[indexSelectedGroup].tasks;

	arrOfTasks.sort((a, b) => (a.dateTime < b.dateTime ? -1 : 1));
	ulTasks.innerHTML = '';
	renderTasksOfActiveGroup();
	localStorage.setItem('todo', JSON.stringify(store));
}

function sortByСompleted() {
	const indexSelectedGroup = findIndexSelectedGroupInArr();
	const arrOfTasks = store[indexSelectedGroup].tasks;

	arrOfTasks.sort((a, b) => (a.check > b.check ? -1 : 1));
	ulTasks.innerHTML = '';
	renderTasksOfActiveGroup();
	localStorage.setItem('todo', JSON.stringify(store));
}

function sortByUnfulfilled() {
	const indexSelectedGroup = findIndexSelectedGroupInArr();
	const arrOfTasks = store[indexSelectedGroup].tasks;

	arrOfTasks.sort((a, b) => (a.check < b.check ? -1 : 1));
	ulTasks.innerHTML = '';
	renderTasksOfActiveGroup();
	localStorage.setItem('todo', JSON.stringify(store));
}

function saveChangesTask() {
	const text = document.getElementById('desrciption').value;
	const dateTime = document.getElementById('dateTime').value;
	const indexSelectedGroup = findIndexSelectedGroupInArr();
	const arrOfTasks = store[indexSelectedGroup].tasks;
	// "strInnerTextTaskFromObj" - global variable. Function "edit task" writes a value to it.
	const indexTaskInObj = findTaskByTitle(strInnerTextTaskFromObj);
	const targetTask = arrOfTasks[indexTaskInObj];

	if (text === '') {
		alert('Please, fill description!');
	} else {
		targetTask.description = text;
		targetTask.dateTime = dateTime;
		targetTask.check = false;
		ulTasks.innerHTML = '';
		renderTasksOfActiveGroup();
		localStorage.setItem('todo', JSON.stringify(store));
		backToTaskList();
	}
	document.getElementById('desrciption').value = '';
	document.getElementById('dateTime').value = '';
	ulGroups.style.pointerEvents = 'auto';
	btnAddGroup.style.pointerEvents = 'auto';
	btnDeleteGroup.style.pointerEvents = 'auto';
	searchTask.value = '';
}

let strInnerTextTaskFromObj;

function editTask(obj) {
	const { description, dateTime } = obj;

	strInnerTextTaskFromObj = description;
	document.getElementById('panelOfTasks').style.display = 'none';
	document.getElementById('taskList').style.display = 'none';
	document.getElementById('panelAddTask').style.display = 'flex';
	document.getElementById('btnSaveTask').style.display = 'none';
	document.getElementById('btnSaveChangesTask').style.display = 'flex';
	document.getElementById('btnBackToTaskPanel').style.display = 'flex';
	document.getElementById('sortPanel').style.display = 'none';
	document.getElementById('desrciption').value = description;
	document.getElementById('dateTime').value = dateTime;
	ulGroups.style.pointerEvents = 'none';
	btnAddGroup.style.pointerEvents = 'none';
	btnDeleteGroup.style.pointerEvents = 'none';

	searchTask.value = '';
}

function deleteTask(targetTitle) {
	const arrTasksInCheckGroup = store[findIndexSelectedGroupInArr()].tasks;
	const indexTask = findTaskByTitle(targetTitle);
	const indexSelectedGroup = findIndexSelectedGroupInArr();

	if (confirm('Do you really want to delete this task?')) {
		arrTasksInCheckGroup.splice(indexTask, 1);
		ulTasks.innerHTML = '';
		renderTasksOfActiveGroup();
		store[indexSelectedGroup].numberOfTasks -= 1;
		ulGroups.children[indexSelectedGroup].lastChild.innerText = store[indexSelectedGroup].numberOfTasks;
		localStorage.setItem('todo', JSON.stringify(store));
	}

	searchTask.value = '';
}

function findTaskByTitle(title) {
	const checkedGroup = store[findIndexSelectedGroupInArr()];
	const arrOfTasks = checkedGroup.tasks;

	for (let index = 0; index < arrOfTasks.length; index++) {
		let taskObj = arrOfTasks[index];

		if (taskObj.description === title) return index;
	}
}

function renderAllTasks(arr) {
	arr.forEach(item => renderTask(item));
}

function renderTasksOfActiveGroup() {
	ulTasks.innerHTML = '';
	const activeGroupIndex = findIndexSelectedGroupInArr();

	renderAllTasks(store[activeGroupIndex].tasks);
}

function renderTask(obj) {
	const { check, description, dateTime } = obj;
	const li = document.createElement('li');

	li.className = 'task-list-item';
	ulTasks.appendChild(li);

	const taskText = document.createElement('p');

	taskText.innerText = description;
	taskText.className = 'task-list-item__text';
	li.appendChild(taskText);

	const btnEdit = document.createElement('span');

	btnEdit.innerText = 'Edit';
	btnEdit.className = 'task-list-item__btn-edit-task';
	btnEdit.setAttribute('id', 'editTask');
	li.appendChild(btnEdit);

	const btnDelete = document.createElement('span');

	btnDelete.innerText = 'Delete';
	btnDelete.className = 'task-list-item__btn-delete-task';
	li.appendChild(btnDelete);

	const dateTimeSpan = document.createElement('span');

	dateTimeSpan.innerText = dateTime;
	dateTimeSpan.className = 'task-list-item__date-time';
	li.appendChild(dateTimeSpan);

	if (check === true) {
		taskText.classList.add('checked-list-item');
		li.classList.add('checked-green-background');
		btnEdit.style.display = 'none';
	}
}

function backToTaskList() {
	document.getElementById('panelOfTasks').style.display = 'flex';
	document.getElementById('taskList').style.display = 'flex';
	document.getElementById('panelAddTask').style.display = 'none';
	document.getElementById('btnBackToTaskPanel').style.display = 'none';
	document.getElementById('sortPanel').style.display = 'block';
	document.getElementById('desrciption').value = '';
	document.getElementById('dateTime').value = '';
	ulGroups.style.pointerEvents = 'auto';
	ulGroups.style.opacity = 1;
	document.getElementById('panelOfGroupsButtons').style.opacity = 1;
	btnAddGroup.style.pointerEvents = 'auto';
	btnDeleteGroup.style.pointerEvents = 'auto';
}

function saveTask() {
	const indexToSave = findIndexSelectedGroupInArr();
	const text = document.getElementById('desrciption').value;
	const dateTime = document.getElementById('dateTime').value;
	const obj = {};

	if (text === '' || dateTime === '') {
		alert('Please, fill all fields!');
	} else {
		obj.description = text;
		obj.dateTime = dateTime;
		obj.check = false;
		store[indexToSave].tasks.push(obj);
		store[indexToSave].numberOfTasks += 1;
		ulGroups.children[indexToSave].lastChild.innerText = store[indexToSave].numberOfTasks;
		renderTasksOfActiveGroup();
		localStorage.setItem('todo', JSON.stringify(store));
		backToTaskList();
	}
	document.getElementById('desrciption').value = '';
	document.getElementById('dateTime').value = '';
	ulGroups.style.pointerEvents = 'auto';
	ulGroups.style.opacity = 1;
	document.getElementById('panelOfGroupsButtons').style.opacity = 1;
	btnAddGroup.style.pointerEvents = 'auto';
	btnDeleteGroup.style.pointerEvents = 'auto';
}

function addTask() {
	document.getElementById('panelOfTasks').style.display = 'none';
	document.getElementById('taskList').style.display = 'none';
	document.getElementById('panelAddTask').style.display = 'flex';
	document.getElementById('btnSaveTask').style.display = 'flex';
	document.getElementById('btnSaveChangesTask').style.display = 'none';
	document.getElementById('btnBackToTaskPanel').style.display = 'flex';
	document.getElementById('sortPanel').style.display = 'none';
	ulGroups.style.pointerEvents = 'none';
	ulGroups.style.opacity = 0.15;
	document.getElementById('panelOfGroupsButtons').style.opacity = 0.15;
	btnAddGroup.style.pointerEvents = 'none';
	btnDeleteGroup.style.pointerEvents = 'none';
}

function showPanelOfTasks() {
	const panelOfTasksTitle = document.getElementById('panelOfTasksTitle');

	document.getElementById('panelOfTasks').style.display = 'flex';
	document.getElementById('taskList').style.display = 'flex';
	document.getElementById('notice').style.display = 'none';
	document.getElementById('sortPanel').style.display = 'block';
	panelOfTasksTitle.innerText = store[findIndexSelectedGroupInArr()].titleGroup;
}

function deleteGroup() {
	if (confirm('Do you really want to delete this group?')) {
		const indexFromDelete = findIndexSelectedGroupInArr();

		store.splice(indexFromDelete, 1);
		ulGroups.innerHTML = '';
		renderAllGroups(store);
		localStorage.setItem('todo', JSON.stringify(store));
		document.getElementById('panelOfTasks').style.display = 'none';
		document.getElementById('taskList').style.display = 'none';
		document.getElementById('sortPanel').style.display = 'none';
		document.getElementById('notice').style.display = 'block';
	}
}

function findIndexSelectedGroupInArr() {
	const arrLiOfGroups = ulGroups.getElementsByClassName('list-of-groups__item');
	let liTitleOfGroup;

	for (let index = 0; index < arrLiOfGroups.length; index++) {
		const li = arrLiOfGroups[index];

		if (li.classList.contains('checked-group-item')) {
			// check Selected Group
			liTitleOfGroup = li.innerText.split('\n', 2)[1] + '';
		}
	}
	for (let index = 0; index < store.length; index++) {
		if (store[index].titleGroup === liTitleOfGroup) {
			return index;
		}
	}
}

function findIndexGroupInArr(title) {
	for (let index = 0; index < store.length; index++) {
		if (store[index].titleGroup === title) {
			return index;
		}
	}
}

function addGroup() {
	ulGroups.style.display = 'none';
	blockAddGroup.style.display = 'flex';
	btnAddGroup.style.display = 'none';
	btnDeleteGroup.style.display = 'none';
	btnBackToListOfGroups.style.display = 'inline';
	btnSaveGroup.style.display = 'inline';
	document.getElementById('panelOfTasksSection').style.opacity = 0.2;
	document.getElementById('panelOfTasksSection').style.pointerEvents = 'none';
}

let strValueTitleGroupFromObj;

function editGroup(obj) {
	strValueTitleGroupFromObj = obj.titleGroup;
	ulGroups.style.display = 'none';
	blockAddGroup.style.display = 'flex';
	btnAddGroup.style.display = 'none';
	btnDeleteGroup.style.display = 'none';
	btnBackToListOfGroups.style.display = 'inline';
	btnSaveChangesGroup.style.display = 'inline';
	document.getElementById('titleGroup').value = obj.titleGroup;
	document.getElementById('panelOfTasksSection').style.opacity = 0.2;
	document.getElementById('panelOfTasksSection').style.pointerEvents = 'none';
}

function backToListOfGroups() {
	ulGroups.style.display = 'block';
	blockAddGroup.style.display = 'none';
	btnAddGroup.style.display = 'inline';
	btnBackToListOfGroups.style.display = 'none';
	btnSaveGroup.style.display = 'none';
	btnSaveChangesGroup.style.display = 'none';
	document.getElementById('titleGroup').value = '';
	document.getElementById('panelOfTasksSection').style.opacity = 1;
	document.getElementById('panelOfTasksSection').style.pointerEvents = 'auto';
}

function saveGroup() {
	const titleGroupValue = document.getElementById('titleGroup').value;
	const obj = {};

	if (titleGroupValue === '') {
		alert('Please, fill in the field!');
	} else if (titleGroupValue.length > 23) {
		alert('The group name must not exceed 23 characters!');
	} else {
		obj.titleGroup = titleGroupValue;
		obj.tasks = [];
		obj.numberOfTasks = obj.tasks.length;
		store.push(obj);
		renderGroup(obj);
		localStorage.setItem('todo', JSON.stringify(store));
		backToListOfGroups();
	}
	document.getElementById('titleGroup').value = '';
	document.getElementById('panelOfTasksSection').style.opacity = 1;
	document.getElementById('panelOfTasksSection').style.pointerEvents = 'auto';
}

function saveChangesGroup() {
	const valueTitle = document.getElementById('titleGroup').value; // entered value
	// found the index of the object in the array by the old value of the title
	const indexObjInArr = findIndexGroupInArr(strValueTitleGroupFromObj);

	if (valueTitle === '') {
		alert('Please, fill in the field!');
	} else if (valueTitle.length > 23) {
		alert('The group name must not exceed 23 characters!');
	} else {
		store[indexObjInArr].titleGroup = valueTitle;
		ulGroups.innerHTML = '';
		renderAllGroups(store);
		localStorage.setItem('todo', JSON.stringify(store));
		backToListOfGroups();
	}
	document.getElementById('titleGroup').value = '';
	document.getElementById('panelOfTasks').style.display = 'none';
	document.getElementById('taskList').style.display = 'none';
	document.getElementById('notice').style.display = 'block';
	document.getElementById('panelOfTasksSection').style.opacity = 1;
	document.getElementById('panelOfTasksSection').style.pointerEvents = 'auto';
}

function renderGroup(obj) {
	const li = document.createElement('li');

	li.className = 'list-of-groups__item';
	ulGroups.appendChild(li);

	const spanEditGroup = document.createElement('span');

	spanEditGroup.innerText = 'Edit';
	spanEditGroup.className = 'list-of-groups__edit-group';
	li.appendChild(spanEditGroup);

	const spanTitleGroup = document.createElement('span');

	spanTitleGroup.innerText = obj.titleGroup;
	spanTitleGroup.className = 'list-of-groups__title-group';
	li.appendChild(spanTitleGroup);

	const spanNumberOfTasksInGroup = document.createElement('span');

	spanNumberOfTasksInGroup.innerText = obj.numberOfTasks;
	spanNumberOfTasksInGroup.className = 'list-of-groups__number-of-tasks';
	spanNumberOfTasksInGroup.setAttribute('id', 'numOfTasks');
	li.appendChild(spanNumberOfTasksInGroup);
}

function renderAllGroups(arr) {
	arr.forEach(item => renderGroup(item));
}

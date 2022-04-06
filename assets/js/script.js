var tasks = {}; //is a object

var createTask = function (taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");

  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);

  var taskP = $("<p>").addClass("m-1").text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // check due date
  auditTask(taskLi); //function call to change the color. this type of functionality in the functions for both creating tasks and editing task due dates

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function () {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: [],
    };
  }

  // loop over object properties
  $.each(tasks, function (list, arr) {
    // then loop over sub-array
    arr.forEach(function (task) {
      createTask(task.text, task.date, list);
    });
  });
};


var saveTasks = function () {
  localStorage.setItem("tasks", JSON.stringify(tasks)); // //The saveTasks() function simply saves the tasks object in localStorage
};


$(".list-group").on("click", "p", function () {
  // this var referes to doing stuff with in the p tag area
  //group list call back function with this reffering to current value

  var text = $(this).text().trim();

  var textInput = $("<textarea>")
    .addClass("form-control") // adding a class to the dynamic textarea creation with the class="form-control"
    .val(text);

  $(this).replaceWith(textInput); //"with click" it swaps out the already written text in the p element too show a blank textarea
  textInput.trigger("focus");
});

$(".list-group").on("blur", "textarea", function () {
  // listens for the removal of the cursor from textarea than does the function
  // get the textarea's current value/text
  var text = $(this).val().trim();

  // get the parent ul's id attribute
  var status = $(this).closest(".list-group").attr("id").replace("list-", "");
  console.log(status); 
  // get the task's position in the list of other li elements
  var index = $(this).closest(".list-group-item").index(); //the object at the given index in the array

  tasks[status][index].text = text; //update the overarching tasks object with the new data.
  //Because we don't know the values, we'll have to use the variable names as placeholders
  saveTasks();
  // tasks is an object.
  // tasks[status] returns an array (e.g., toDo).
  // tasks[status][index] returns the object at the given index in the array.
  // tasks[status][index].text returns the text property of the object at the given index.

  // recreate p element
  var taskP = $("<p>") //create a var = queryselector <p>
    .addClass("m-1") //add the class back to it
    .text(text);

  // replace textarea with p element
  $(this).replaceWith(taskP); // replace what ever this is with taskP
});



var auditTask = function(taskEl) { //this type of functionality in the functions for both creating tasks and editing task due dates. (changing the color)
  // get date from task element
  var date = $(taskEl).find("span").text().trim(); //We use jQuery to select the taskEl element and find the <span> element inside it, then retrieve the text value using .text(). We chained on a JavaScript (not jQuery) .trim() method to cut off any possible leading or trailing empty spaces.
  
  // convert to moment object at 5:00pm
  var time = moment(date, "L").set("hour", 17); //use the moment() function to convert that date value into a Moment object.
                                                // this should print out an object for the value of the date variable, but at 5:00pm of that date
                                                // remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger"); // remove these classes IF they were already in place incase we update the due date, the red background will be removed

  // apply new class if task is near/over due date
  if (moment().isAfter(time)) { //Check if a moment is after another moment. The first argument will be parsed as a moment, if not already so.

    moment('2010-10-20').isAfter('2010-10-19'); // Check if a moment is after another moment. The first argument will be parsed as a moment, if not already so. boolen
    $(taskEl).addClass("list-group-item-danger");


  } else if (Math.abs(moment().diff(time, "days")) <= 2) { //abs gives us the absolute value of that number. 
    $(taskEl).addClass("list-group-item-warning");
  }
 
};



// due date was clicked
$(".list-group").on("click", "span", function () {   //<input> elements we use are dynamically created and aren't present in the HTML on page load. so the shit goes on onclick
  // get current text
  var date = $(this).text().trim();

  // create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  // enable (jquery ui) datepicker({})
  dateInput.datepicker({  //this is for modals on the date in out input field.
    minDate: 1,
    onClose: function(){  //when calender is closed- force change on dateInput
      $(this).trigger("change");
    }
  });

  // automatically focus on new element
  dateInput.trigger("focus");
});



// value of due date was changed
$(".list-group").on("change", "input[type='text']", function () {
  // get current text
  var date = $(this).val().trim();

  // get the parent ul's id attribute
  var status = $(this).closest(".list-group").attr("id").replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this).closest(".list-group-item").index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;

  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // Pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
});

$(".card .list-group").sortable({
  //Tasks can now be dragged within the same column and across other columns.
  connectWith: $(".card .list-group"), //sortable() turned the .class into sortable// connectWith() linked them.
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function (event) {
    //console.log("activate", this);
  },
  deactivate: function (event) {
    //console.log("deactivate", this);
  },
  over: function (event) {
    //console.log("over", event.target);
  },
  out: function (event) {
    // console.log("out", event.target);
  },

  update: function (event) {
    // array to store the task data in
    var tempArr = [];
    // loop over current set of children in sortable list
    $(this)
      .children()
      .each(function () {
        // resaves the tasks into loacl storage and can happen to 2 lists at one if the tasks are dragged from one coloum to another
        var text = $(this).find("p").text().trim();

        var date = $(this).find("span").text().trim();

        // add task data to the temp array as an object
        tempArr.push(
          {
            text: text,
            date: date,
          }
        );
      });
      console.log(tempArr);

      // trim down list's ID to match object property
      var arrName = $(this)
        .attr("id")
        .replace("list-", "");

       // update array on tasks object and save 
      tasks[arrName] = tempArr;

      saveTasks();
  },
});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    console.log("drop");
    ui.draggable.remove();   // draggable is "a jQuery object representing the draggable element."
  },
  over: function(event, ui) {
   // console.log("over");
  },
  out: function(event, ui) {
    //console.log("out");
  }

 
});


//////////////////////////////////////////////////////////////////////////////////////////////////////////
// modal was triggered
$("#task-form-modal").on("show.bs.modal", function () {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function () {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function () {
  //Click function adds New Task form in the modal, they can click the Save Changes button to add the task to the list.
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo"); //with createTask()--these three data points create a <li> element (with child <span> and <p> elements) that's appended to a <ul> element:

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate,
    });

    saveTasks(); //The saveTasks() function simply saves the tasks object in localStorage
  }
});


$("#modalDueDate").datepicker({
  minDate:1
}); // select the form <input> element with an id of modalDueDate using jQuery, then we'll chain the special .datepicker() method to it



//////////////////////////////////////////////////////////////////////////////////////////



// remove all tasks
$("#remove-tasks").on("click", function () {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();

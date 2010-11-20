Project.data.provider = new FixtureProvider(projectFixture);
/*Task.data.provider = new FixtureProvider();*/

module('Project');
test('create project', function() {
    var p = new Project({ name: 'Test'});
    equal(p.name, 'Test', "name");
    ok(p.createdOn, "created");
    ok(p.modifiedOn, "modified");
});

test('modify project', function() {
    var p = new Project({ name: 'test'});
	var modified = p.modifiedOn;
	p.name = 'test2';
	//delay 1 sec, should fail
	same(modified, p.modifiedOn, "modified")
});
test('save project', function() {
    var p = new Project({ name: 'test' });
	var self = this;
	Project.data.find(function(projects) {
		var c1 = projects.length;
		Project.data.save(p, function() {
			Project.data.find(function(projects) {
				equal(c1+1, projects.length);
			});
		});
	});
});

asyncTest('find all projects', function() {
	Project.data.find(function(projects) {
		notEqual(projects.length, 0, "project count");
		start();
	});
});

asyncTest('get tasks', function() {
	Project.data.find(function(projects) {
		var project = projects[0];
		project.getTasks(function(tasks) {
			equal(tasks.length, project.taskIds.length);
			console.log(tasks);
			for (var i = 0; i < project.taskIds.length; i++) {
				var id = project.taskIds[i];
				equal(tasks[i].key, id);
			}
			start();
		});
	});
});

asyncTest("add task to project", function() {
	Project.data.find(function(projects) {
		var project = projects[0];
		var oTask = new Task({ name: 'new task' });
		project.getTasks(function(tasks) {
			var taskCount = tasks.length;	
			project.addTask(oTask, function(project, task) {
				project.getTasks(function(tasks) {
					equal(oTask.key, task.key);
					equal(project.taskIds.length, taskCount+1);
					equal(tasks.length, taskCount+1);
					start();
				});
			});
		});
	});
});

asyncTest("remove task from project", function() {
	Project.data.find(function(projects) {
		var project = projects[0];
		var task = new Task({ name: 'new task' });
		project.getTasks(function(tasks) {
			var taskCount = tasks.length;	
			project.addTask(task, function(project, task) {
				equal(project.taskIds.length, taskCount+1);
				project.removeTask(task, function(project) {
					equal(project.taskIds.length, taskCount);						
					start();
				});
			});
		});
	});
});

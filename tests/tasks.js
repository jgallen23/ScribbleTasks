Task.data.provider = new FixtureProvider(taskFixture);
/*new LawnchairData('tasks').removeAll();*/
module('Task');
test('create task', function() {
    var t = new Task({ name: 'test' });
    equal("test", t.name, "name");
    ok(t.createdOn, "created");
    ok(t.modifiedOn, "modified");
});

asyncTest('save task', 1, function() {
	var self = this;
	var t = new Task({ name: 'testing' });
	Task.data.find(function(tasks) {
		var t1 = tasks.length;
		Task.data.save(t, function() {
			Task.data.find(function(tasks) {
				equal(t1+1, tasks.length);
				start();
			});
		});
	});
});

/*
test('add tag', function() {
	var t = new Task({ name: 'test' });
	t.addTag('ehow');
	ok(t.hasTag('ehow'))
	notEqual(t.hasTag('no'), false);
});

asyncTest('find by tag', function() {
	var self = this;
	var t = new Task({ name: 'test' });
	t.addTag('ehow');
	Task.data.save(new Task({ name: 'test 2'}), function() {
		Task.data.save(t, function() {
			Task.data.findByTag("ehow", function(tasks) {
				equal(tasks.length, 1);
				start();
			});
		});
	});
});

asyncTest('get tags', function() {
	Task.data.findTags(function(tags) {
		ok(tags);
		start();
	});
});
*/
module('modify task', {
	setup: function() {
		this.t = new Task({ name: 'test task'});
	},
	teardown: function() {
	}
});

asyncTest('save task', function() {
	var self = this;
	Task.data.find(function(tasks) {
		var taskCount = tasks.length;
		self.t.save(function(task) {
			ok(self.t.key, "key exists");
			ok(task.key, 'key exists');
			Task.data.find(function(tasks) {
				equal(tasks.length, taskCount+1);
				start();
			});
		});
	});
});

asyncTest('update task', function() {
	var self = this;
	Task.data.find(function(tasks) {
		var taskCount = tasks.length;
		tasks[0].complete();
		tasks[0].save(function() {
			Task.data.find(function(tasks) {
				equal(tasks.length, taskCount, 'update doesnt add to task count');
				start();
			});
		});
	});
});

asyncTest('complete task', function() {
	var self = this;
	Task.data.find(function(tasks) {
		var taskCount = tasks.length;
		self.t.complete();
		ok(self.t.isComplete, "task set to completed");
		ok(self.t._data.completedOn, "task set to completed");
		start();
		/*
		self.t.save(function(task) {
			Task.data.findBy(Task.data.filters.incomplete, function(tasks) {
				equal(tasks.length, taskCount-1);
				start();
			});
		});
		*/
	});

});

test('star task', function() {
	this.t.star = true;
	equal(this.t._data.star, true, "star added");
	equal(this.t.star, true, "star added");
	equal(new Task({ star: true }).star, true, "star added with init");
});
/*
test('task due', function() {
	this.t.due = Date.today();
});

test('parse task', function() {
	var t1 = new Task({ name: 'basic task', parse: true });
	equal(t1.name, "basic task", "basic task");

	var t2 = new Task({ name: 'tag #tag', parse: true });
	equal(t2.name, "tag", "task with 1 tag");
	equal(t2.tags.length, 1, 'has 1 tag');

	var t3 = new Task({ name: 'task *', parse: true });
	equal(t3.name, 'task', 'starred task');
	ok(t3.star, 'task has star');

	var t4 = new Task({ name: 'task #tag1 #tag2', parse: true });
	equal(t4.tags.length, 2, 'has two tags');

	var t5 = new Task({ name: 'task #tag1 tag2', parse: true });
	equal(t5.tags[0], 'tag1 tag2', 'multiword tag');

	var t6 = new Task({ name: 'task * #tag', parse: true });
	equal(t6.tags[0], 'tag', 'has tag');
	ok(t6.star, 'has star');
});

asyncTest('find by filter and tags', function() {
	var t2 = new Task({ name: 'test task #tag2 *', parse: true })
	t2.save();
	var t = new Task({ name: 'test task #tag', parse: true })
	t.save();
	Task.data.findByFilterAndTags(Task.data.filters.incomplete, ['tag'], function(tasks) {
		notEqual(tasks.length, 0, "search not 0");
		Task.data.findByFilterAndTags(Task.data.filters.starred, ['tag'], function(tasks) {
			equal(tasks.length, 0, "star 0");
			t.star = true;
			t.save();
			Task.data.findByFilterAndTags(Task.data.filters.starred, ['tag'], function(tasks) {
				equal(tasks.length, 1, "star 1");
				start();
			});
		});
	});
});

*/
	/*test('add task to project', function() {*/
	/*var count = this.p.children.length;*/

	/*this.p.addChild(this.t, 0);*/
	/*equal(this.p.children.length, count + 1, "children count");*/
	/*ok(this.t.parent, "task's parent is project");*/
	/*});*/


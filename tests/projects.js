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



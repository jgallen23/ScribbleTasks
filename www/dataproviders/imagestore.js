var imageStore = function() {
    var prefix = "img";
    return {
        get: function(taskKey) {
            return localStorage.getItem(String.format("{0}.{1}", prefix, taskKey));
        },
        set: function(taskKey, imageData) {
            localStorage.setItem(String.format("{0}.{1}", prefix, taskKey), imageData);
        }
    }
}();

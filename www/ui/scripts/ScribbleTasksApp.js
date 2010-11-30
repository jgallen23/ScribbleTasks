var ScribbleTasksApp = Application.extend({
    updateBadge: function() {
		console.log("Badge: "+this.data.badgeCount);
        if (this.browser.isPhoneGap) {
            window.plugins.badge.set(this.data.badgeCount);
        }
    }
});

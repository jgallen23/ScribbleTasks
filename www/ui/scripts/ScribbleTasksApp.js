var ScribbleTasksApp = Application.extend({
    updateBadge: function() {
        if (this.browser.isPhoneGap) {
            console.log("Badge: "+this.data.badgeCount);
            window.plugins.badge.set(this.data.badgeCount);
        }
    }
});

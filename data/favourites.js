
export default {
    ids:   [],
    count: 0,
    toggle: function(id) {
        const ids = this.ids;
        const i   = this.ids.indexOf(id);

        if (i !== -1) {
            ids.splice(i, 1);
            this.count = this.ids.length;
            return false;
        }

        ids.push(id);
        this.count = this.ids.length;
        return true;
    }
};


export default {
    title: "Default module export"
};

export const named = {
    title: "Named module export"
};

export function fn() {
    this.title = "Constructed named module export";
    this.params = Array.prototype.slice.apply(arguments);
}

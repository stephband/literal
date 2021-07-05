import { register } from '../modules/library.js';
import Observer from '../modules/observer.js';
import routes from '../../dom/modules/routes.js';
import location from '../../dom/modules/location.js';

register('routes', routes);


// Router scope

const scope = Observer({
    location: window.location
});

export default scope;

location.on((location) => {
    Observer.notify('location', scope)
});


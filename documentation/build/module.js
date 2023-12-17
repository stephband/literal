/* Literal 
   0.8.2
   By Stephen Band
   Built 2023-12-17 23:09 */

function C(t){var e=new Map;return function(r){if(e.has(r))return e.get(r);var i=t(r);return e.set(r,i),i}}var oe=Array.prototype;function re(t,e){return typeof t=="function"?t.apply(null,e):t}function xt(t,e,o){o=o||t.length;var r=o===1?e?t:C(t):C(function(i){return xt(function(){var u=[i];return u.push.apply(u,arguments),t.apply(null,u)},e,o-1)});return function i(u){return arguments.length===0?i:arguments.length===1?r(u):arguments.length>=o?t.apply(null,arguments):re(r(u),oe.slice.call(arguments,1))}}var p=xt;function ie(t,e){return e[t]}var Et=p(ie,!0);var q=Et("classList"),St=q;function se(t,e){q(e).add(t)}function ae(t,e){q(e).remove(t)}function ue(t,e){(function o(r){return t--?requestAnimationFrame(o):e(r)})()}function ce(t,e){var o=q(e);o.add(t),ue(2,()=>o.remove(t))}var gn=p(se,!0),yn=p(ae,!0),vn=p(ce,!0);var M={simulatedEventDelay:.08,keyClass:"key-device",mouseClass:"mouse-device",touchClass:"touch-device",keyType:"key",mouseType:"mouse",touchType:"touch"},st={type:"mouse"},Tt=St(document.documentElement),it,W;function at(t){it!==t&&(Tt.remove(it),Tt.add(t),it=t)}function pe(t){t.timeStamp<W+M.simulatedEventDelay*1e3||(W=void 0,at(M.mouseClass),st.type=M.mouseType)}function le(t){["ArrowDown","ArrowUp","ArrowRight","ArrowLeft","Space","Escape","Tab"].indexOf(t.code)!==-1&&(at(M.keyClass),st.type=M.keyType,W=t.timeStamp)}function fe(t){W=t.timeStamp,at(M.touchClass),st.type=M.touchType}document.addEventListener("mousedown",pe);document.addEventListener("keydown",le);document.addEventListener("touchend",fe);function ut(t,e,o){let r;typeof o!="string"&&o.input!==void 0&&o.index!==void 0&&(r=o,o=r.input.slice(o.index+o[0].length+(o.consumed||0)));let i=t.exec(o);if(!i)return;let u=e(i);return r&&(r.consumed=(r.consumed||0)+i.index+i[0].length+(i.consumed||0)),u}var Tn=p(ut,!0);function he(t,e,o){throw o.input!==void 0&&o.index!==void 0&&(o=o.input),new Error('Cannot parse string "'+(o.length>128?o.length.slice(0,128)+"…":o)+'"')}function me(t,e,o){let r=-1;for(;++r<o.length;)e=o[r]!==void 0&&t[r]?t[r](e,o):e;return t.done?t.done(e,o):t.close?t.close(e,o):e}function de(t,e,o,r){let i=ut(t,u=>me(e,o,u),r);return i===void 0?e.catch?e.catch(o,r):he(t,e,r):i}var Lt=p(de,!0);function E(t){return t}function v(t,e){return function(){let r=t.apply(this,arguments),i=e[r]||e.default;if(!i)throw new Error('overload() no function defined for key "'+r+'"');return i.apply(this,arguments)}}function b(){}var we=v(E,{is:b,tag:b,data:function(t,e,o){Object.assign(e.dataset,o)},html:function(t,e,o){e.innerHTML=o},text:function(t,e,o){e.textContent=o},children:function(t,e,o){e.innerHTML="",e.append.apply(e,o)},points:x,cx:x,cy:x,r:x,x,y:x,dx:x,dy:x,transform:x,preserveAspectRatio:x,viewBox:x,default:function(t,e,o){t in e?e[t]=o:e.setAttribute(t,o)}});function x(t,e,o){e.setAttribute(t,o)}function ge(t,e){for(var o=Object.keys(e),r=o.length;r--;)we(o[r],t,e[o[r]]);return t}var $=p(ge,!0);var ct="http://www.w3.org/2000/svg",Ot=document.createElement("template"),pt=(t,e)=>e&&typeof e;function Ct(t,e=""){let o=document.createRange();return o.selectNode(t),o.createContextualFragment(e)}var w=v(pt,{string:function(t,e){let o=document.createElementNS(ct,t);return o.innerHTML=e,o},object:function(t,e){let o=document.createElementNS(ct,t);return typeof e.length=="number"?o.append.apply(o,e):$(o,e),o},default:t=>document.createElementNS(ct,t)}),ye=v(pt,{string:function(t,e){let o=document.createElement(t);return o.innerHTML=e,o},object:function(t,e){let o=document.createElement(t);return typeof e.length=="number"?o.append.apply(o,e):$(o,e),o},default:t=>document.createElement(t)}),ve=v(E,{comment:function(t,e){return document.createComment(e||"")},fragment:v(pt,{string:function(t,e,o){return o?Ct(o,e):(Ot.innerHTML=e,Ot.content.cloneNode(!0))},object:function(t,e,o){let r=o?Ct(o):document.createDocumentFragment();return typeof e.length=="number"?r.append.apply(r,e):$(r,e),r},default:()=>document.createDocumentFragment()}),text:function(t,e){return document.createTextNode(e||"")},circle:w,ellipse:w,g:w,glyph:w,image:w,line:w,rect:w,use:w,path:w,pattern:w,polygon:w,polyline:w,svg:w,tspan:w,default:ye}),g=ve;var Ht={once:!0};function I(t){return new Promise((e,o)=>{t.addEventListener("load",e,Ht),t.addEventListener("error",o,Ht)})}var kt=C(t=>{if(!t||t.includes("undefined"))throw new Error("ERRR?");let e=g("link",{rel:"preload",as:"style",href:t}),o=I(e);return document.head.append(e),o});var Mt=Symbol("internals");function be(t){var e;if(t.attachInternals){if(e=t.attachInternals(),e.setFormValue)return e}else e={shadowRoot:elem.shadowRoot};return e.polyfillInput=g("input",{type:"hidden",name:elem.name}),elem.appendChild(e.polyfillInput),e.setFormValue=function(o){this.input.value=o},e}function lt(t,e,o){return e[Mt]=t.formAssociated?be(e):{shadowRoot:o}}function l(t){return t[Mt]}var Ft=Object.defineProperties,xe={},Ee={a:HTMLAnchorElement,article:HTMLElement,dl:HTMLDListElement,p:HTMLParagraphElement,br:HTMLBRElement,fieldset:HTMLFieldSetElement,hr:HTMLHRElement,img:HTMLImageElement,li:HTMLLIElement,ol:HTMLOListElement,optgroup:HTMLOptGroupElement,q:HTMLQuoteElement,section:HTMLElement,textarea:HTMLTextAreaElement,td:HTMLTableCellElement,th:HTMLTableCellElement,tr:HTMLTableRowElement,tbody:HTMLTableSectionElement,thead:HTMLTableSectionElement,tfoot:HTMLTableSectionElement,ul:HTMLUListElement},Se={name:{set:function(t){return this.setAttribute("name",t)},get:function(){return this.getAttribute("name")||""}},form:{get:function(){return l(this).form}},labels:{get:function(){return l(this).labels}},validity:{get:function(){return l(this).validity}},validationMessage:{get:function(){return l(this).validationMessage}},willValidate:{get:function(){return l(this).willValidate}},checkValidity:{value:function(){return l(this).checkValidity()}},reportValidity:{value:function(){return l(this).reportValidity()}}},jt=0,Pt=!1;function Te(t){return Ee[t]||window["HTML"+t[0].toUpperCase()+t.slice(1)+"Element"]||(()=>{throw new Error('Constructor not found for tag "'+t+'"')})()}var Le=Lt(/^\s*<?([a-z][\w]*-[\w-]+)>?\s*$|^\s*<?([a-z][\w]*)\s+is[=\s]*["']?([a-z][\w]*-[\w-]+)["']?>?\s*$/,{1:(t,e)=>({name:e[1]}),2:(t,e)=>({name:e[3],tag:e[2]}),catch:function(t,e){throw new SyntaxError(`dom element() – name must be of the form 'element-name' or 'tag is="element-name"' (`+e+")")}},null);function Oe(t,e){if(t.hasOwnProperty(e)){let o=t[e];delete t[e],t[e]=o}return t}function At(t,e,o){let r=t.attachShadow({mode:e.mode||"closed",delegatesFocus:e.focusable||!1});if(o){let i=g("link",{rel:"stylesheet",href:o});r.append(i)}return r}function Ce(t){return!!t.attribute}function He(t){return t.set||t.get||t.hasOwnProperty("value")}function ke(t,e){return Ce(e[1])&&(t.attributes[e[0]]=e[1].attribute),He(e[1])&&(t.properties[e[0]]=e[1]),t}function ft(t,e,o,r,i=""){let{name:u,tag:m}=Le(t),D=typeof m=="string"?Te(m):HTMLElement,{attributes:T,properties:k}=o?Object.entries(o).reduce(ke,{attributes:{},properties:{}}):xe;function d(){let s=Reflect.construct(D,arguments,d),c=e.construct&&e.construct.length>jt?At(s,e,r||e.stylesheet):void 0,L=lt(d,s,c);if(L.unconnected=!0,e.template&&(c.innerHTML=e.template),m&&(Pt=!0),e.construct&&e.construct.call(s,c,L),k&&Object.keys(k).reduce(Oe,s),c){let F=c.querySelectorAll('link[rel="stylesheet"]');if(F.length){let R=g("style","*:not(:has(slot:not([name]))) { display: none !important; }");c.append(R),L.stylesheetsLoadPromise=Promise.all(Array.from(F,I)).finally(()=>R.remove())}}return s}return r&&(kt(r),i=i),d.prototype=Object.create(D.prototype,k),k&&k.value&&(d.formAssociated=!0,Ft(d.prototype,Se),(e.enable||e.disable)&&(d.prototype.formDisabledCallback=function(s){let c=l(this),L=c.shadowRoot;return s?e.disable&&e.disable.call(this,L,c):e.enable&&e.enable.call(this,L,c)}),e.reset&&(d.prototype.formResetCallback=function(){let s=l(this),c=s.shadowRoot;return e.reset.call(this,c,s)}),e.restore&&(d.prototype.formStateRestoreCallback=function(){let s=l(this),c=s.shadowRoot;return e.restore.call(this,c,s)})),T&&(d.observedAttributes=Object.keys(T),d.prototype.attributeChangedCallback=function(s,c,L){return T[s].call(this,L)}),d.prototype.connectedCallback=function(){let s=l(this),c=s.shadowRoot;s.polyfillInput&&elem.appendChild(s.polyfillInput),s.unconnected&&(e.load&&s.stylesheetsLoadPromise?s.stylesheetsLoadPromise.then(()=>e.load.call(this,c,s)):e.load&&Promise.resolve().then(()=>e.load.call(this,c,s)),delete s.unconnected),e.connect&&e.connect.call(this,c,s)},e.disconnect&&(d.prototype.disconnectedCallback=function(){let s=l(this),c=s.shadowRoot;return e.disconnect.call(this,c,s)}),window.console&&window.console.log("%c<"+(m?m+" is="+u:u)+">%c "+i,"color:#3a8ab0;font-weight:600;","color:#888888;font-weight:400;"),window.customElements.define(u,d,m&&{extends:m}),m&&!Pt&&document.querySelectorAll('[is="'+u+'"]').forEach(s=>{k&&Ft(s,k);let c=e.construct&&e.construct.length>jt?At(s,e,r||e.stylesheet):void 0,L=lt(d,s,c);e.construct&&e.construct.call(s,c);let F;for(F in T){let R=s.attributes[F];R&&T[F].call(s,R.value)}e.connect&&e.connect.apply(s)}),d}function ht(t){return function(){return arguments[t]}}function y(){return this}var Bt=Object.create,Me=Object.freeze,j=Me(Bt(Bt(Object.prototype,{at:{value:b},shift:{value:b},push:{value:b},forEach:{value:b},join:{value:function(){return""}},every:{value:function(){return!0}},filter:{value:y},find:{value:b},findIndex:{value:function(){return-1}},flat:{value:y},flatMap:{value:y},includes:{value:function(){return!1}},indexOf:{value:function(){return-1}},map:{value:y},reduce:{value:ht(1)},sort:{value:y},each:{value:y},pipe:{value:E},start:{value:y},stop:{value:y},done:{value:y},valueOf:{value:function(){return null}}}),{length:{value:0}}));function mt(t){return t&&t[Symbol.iterator]}var _=t=>typeof t;var S=Object.assign,O=Object.create,J=Symbol("done"),Dt=v(_,{function:t=>t(),object:t=>t.stop()});function f(t,e){return e.stop&&(e.input=t),t[0]=e,e}function dt(t,e){let o=-1,r;for(;t[++o]&&t[o]!==e;);for(e.input=void 0;t[o++];)t[o-1]=t[o];return e}function h(t){if(t.status==="done"||(t.status="done",t.pipe&&!t[0]))return t;let e=t[J];for(t[J]=void 0,e&&e.forEach(Dt);t[0];)Array.isArray(t[0])?dt(t,t[0]):h(dt(t,t[0]));return t}function a(t){this.input=t}S(a.prototype,{push:function(t){return this[0]&&this[0].push(t)},each:function(t){return this.pipe(new Rt(this,t))},pipe:function(t){if(this[0])throw new Error("Stream: cannot .pipe() a unicast stream more than once");return f(this,t),this.input.pipe(this),t},broadcast:function(t){return new Q(this,t)},filter:function(t){return new It(this,t)},flatMap:function(t){return new Ut(this,t)},map:function(t){return new zt(this,t)},reduce:function(t,e){return this.pipe(new Gt(t,e)).value},scan:function(t,e){return new Vt(this,t,e)},slice:function(t,e){return new Nt(this,t,e)},split:function(t){return new qt(this,t)},start:function(){return this.status==="done"?this:(this.input.start.apply(this.input,arguments),this)},stop:function(){return this.status==="done"?this:this.input[1]?(dt(this.input,this),h(this)):(this.input.stop.apply(this.input,arguments),this)},done:function(t){return this.status==="done"?(Dt(t),this):((this[J]||(this[J]=[])).push(t),this)},[Symbol.asyncIterator]:async function*(){let t=[],e=r=>t.push(r);function o(r,i){e=r}for(this.each(r=>e(r)).done(()=>e=noop);e!==noop;)yield t.length?t.shift():await new Promise(o)}});function Q(t,e){this.input=t,this.memory=!!(e&&e.memory),e&&e.hot&&this.pipe(j)}Q.prototype=S(O(a.prototype),{push:function(t){if(t===void 0)return;this.memory&&(this.value=t);let e=-1;for(;this[++e];)this[e].push(t)},pipe:function(t){let e=-1;for(;this[++e];);return this.memory&&e===0&&this.input.pipe(this),this[e]=t,this.value!==void 0&&t.push(this.value),!this.memory&&e===0&&this.input.pipe(this),t}});function Rt(t,e){this.input=t,this.push=e}Rt.prototype=S(O(a.prototype),{pipe:null});function It(t,e){this.input=t,this.fn=e}It.prototype=S(O(a.prototype),{push:function(e){let o=this.fn;o(e)&&this[0].push(e)}});function Ut(t,e){this.input=t,this.fn=e}Ut.prototype=S(O(a.prototype),{push:function(e){let o=this.fn,r=o(e);if(r!==void 0)if(mt(r))for(let i of r)this[0].push(i);else r.pipe?(console.warn("FlatMapping pipeables is dodgy. Map to arrays for the moment please."),this.done(r.each(i=>this[0].push(i)))):r.then&&r.then(i=>this[0].push(i))}});function zt(t,e){this.input=t,this.fn=e}zt.prototype=S(O(a.prototype),{push:function(e){let o=this.fn,r=o(e);return r===void 0||!this[0]?!1:this[0].push(r)}});function Gt(t,e){this.fn=t,this.value=e,this.i=0}Gt.prototype=S(O(a.prototype),{push:function(t){let e=this.fn;this.value=e(this.value,t,this.i++,this)}});function Vt(t,e,o){this.input=t,this.fn=e,this.value=o}Vt.prototype=S(O(a.prototype),{push:function(t){let e=this.fn;this.value=e(this.value,t),this[0].push(this.value)}});function Nt(t,e,o=1/0){this.input=t,this.index=-e,this.indexEnd=e+o}Nt.prototype=S(O(a.prototype),{push:function(e){++this.index>0&&this[0].push(e),this.index===this.indexEnd&&this.stop()}});function qt(t,e){this.input=t,this.chunk=[],typeof n=="number"?this.n=e:this.fn=e}qt.prototype=S(O(a.prototype),{fn:function(){return this.chunk.length===this.n},push:function(e){let o=this.chunk;this.fn(e)?(this[0].push(o),this.chunk=[]):o.push(e)}});var Fe=Array.prototype,je=Object.assign,Pe=Object.create;function U(t){this.buffer=t||[]}U.prototype=je(Pe(a.prototype),{pipe:function(t){for(f(this,t);this.buffer.length&&this[0];){let e=Fe.shift.apply(this.buffer);e!==void 0&&this[0].push(e)}return this.buffer=t,t},push:function(t){if(t!==void 0)return this.buffer.push(t)},stop:function(){return this.input?a.prototype.stop.apply(this,arguments):(this.buffer=j,h(this))}});var Ae=Object.assign,Be=Object.create;function P(t){this.promise=t}P.prototype=Ae(Be(a.prototype),{push:null,pipe:function(t){let e=this.promise;return f(this,t),e.then(o=>{this.status!=="done"&&this[0].push(o)}),e.finally(()=>h(this)),t}});var wt=Object.assign,De=Object.create;function Re(t){return!!t.active}function Ie(t){return!!t.stopped}function Wt(t,e,o,r,i){this.input=t.then?new P(t):t,this.stream=o,this.values=r,this.pipes=i,this.name=e,this.active=!1,this.stopped=!1}wt(Wt.prototype,{push:function(t){let{stream:e,values:o,name:r}=this;if(o[r]=t,this.active=!0,e.active||(e.active=this.pipes.every(Re)))if(e.mutable)e[0].push(o);else{let i=new this.values.constructor;e[0].push(wt(i,o))}},stop:function(){this.stopped=!0,this.pipes.every(Ie)&&h(this.stream)}});function z(t,e){this.inputs=t,this.mutable=e&&(e===!0||e.mutable),this.active=!1}z.prototype=wt(De(a.prototype),{push:null,pipe:function(t){let e=this.inputs,o=this.pipes=[],r;f(this,t);let i;for(i in e){let u=e[i];typeof u=="object"&&(u.pipe||u.then)&&o.push(new Wt(u,i,this,e,o))}for(r of o)r.input.done(r).pipe(r);return t},stop:function(){return this.status==="done"?this:(this.pipes.forEach(t=>{let e=t.input;e[1]?unpipe(e,t):e.stop()}),h(this.stream))}});var Ue=Object.assign,ze=Object.create;function X(t){this.fn=t}X.prototype=Ue(ze(a.prototype),{pipe:function(t){return f(this,t),this.fn(e=>this.push(e),e=>this.stop(e)),t}});var $t=Object.assign,Ge=Object.create;function _t(t){this.stream=t}$t(_t.prototype,{push:function(t){this.stream[0].push(t)},stop:function(){--this.stream.count===0&&h(this.stream)},done:function(t){console.log("HELLO"),this.stream.done(t)}});function Y(t){this.inputs=t}Y.prototype=$t(Ge(a.prototype),{push:null,pipe:function(t){let e=this.inputs;this.count=e.length,f(this,t);let o=new _t(this),r=-1,i;for(;i=e[++r];)if(i.pipe)i.pipe(o);else if(i.then)i.then(u=>o.push(u)),i.finally(()=>o.stop());else{let u=-1;for(;++u<i.length;)o.push(i[u]);o.stop()}return t}});var Ve=Object.assign,Ne=Object.create;function A(t){this.duration=t,this.timer=void 0,this.status="idle"}A.prototype=Ve(Ne(a.prototype),{push:null,pipe:function(t){return f(this,t)},start:function(t){if(this.status!=="idle")return this;if(this.status="waiting",this.duration==="frame"){let e=o=>{this.timer=requestAnimationFrame(e),this[0].push(o/1e3)};this.timer=requestAnimationFrame(e)}else{let e=performance.now()/1e3;this.timer=setTimeout(()=>{let o=performance.now()/1e3,r=()=>this[0].push(performance.now()/1e3);this.status="playing",this[0].push(o),this.timer=setInterval(r,this.duration*1e3)},e>t?t-e:0)}return this},stop:function(t){return this.status==="done"?this:(this.duration==="frame"?cancelAnimationFrame(this.timer):this.status==="waiting"?clearTimeout(this.timer):clearInterval(this.timer),this.timer=void 0,h(this))}});var qe=Object.assign,We=Object.create;function K(t,e){a.call(this,t),this.duration=e}K.prototype=qe(We(a.prototype),{push:function(t){if(t===void 0)return;if(this.clock){this.value=t;return}let e=new A(this.duration);this.value=t,this.clock=e.each(o=>{if(this.value===void 0){e.stop(),this.clock=void 0;return}this[0].push(this.value),this.value=void 0}).start()},stop:function(t){return this.clock&&(this.clock.stop(),this.clock=void 0),t&&(this[0].push(value),this.value=void 0),a.prototype.stop.apply(this,arguments),this}});var $e=Array.prototype,Qt=Object.assign;function Jt(t){throw new TypeError("Stream cannot be created .from() "+typeof t)}Qt(a,{isStream:function(t){return a.prototype.isPrototypeOf(t)},of:function(){return new U($e.slice.apply(arguments))},from:function(t){return t?typeof t=="object"?typeof t.pipe=="function"?new a(t):typeof t.then=="function"?new P(t):typeof t.length=="number"?new U(t):new z(t):typeof t=="function"?new X(t):Jt(t):Jt(t)},broadcast:t=>new Q(j,t),combine:(t,e)=>new z(t,e),clock:t=>new A(t),merge:function(){return new Y(arguments)}});Qt(a.prototype,{throttle:function(t){return new K(this,t)},log:y});var qo=a.frames;var _e=Object.assign,Je=/\s+/,Z={fullscreenchange:C(()=>"fullscreenElement"in document?"fullscreenchange":"webkitFullscreenElement"in document?"webkitfullscreenchange":"mozFullScreenElement"in document?"mozfullscreenchange":"msFullscreenElement"in document?"MSFullscreenChange":"fullscreenchange")},Xt=0;window.addEventListener("click",t=>Xt=t.timeStamp);function Qe(t,e){return t.node.addEventListener(Z[e]?Z[e]():e,t,t.options),t}function Xe(t,e){return t.node.removeEventListener(Z[e]?Z[e]():e,t),t}function Yt(t,e,o,r){this.types=t.split(Je),this.options=e,this.node=o,this.select=e&&e.select,this.initialEvent=r}_e(Yt.prototype,{pipe:function(t){f(this,t),this.types.reduce(Qe,this),this.initialEvent&&(this.handleEvent(this.initialEvent),delete this.initialEvent)},handleEvent:function(t){if(!(t.type==="click"&&t.timeStamp<=Xt)){if(this.select){let e=t.target.closest(this.select);if(!e)return;t.selectedTarget=e}this[0].push(t)}},stop:function(){this.types.reduce(Xe,this),h(this[0])}});function H(t,e,o){let r;return typeof t=="object"&&(r=t,t=r.type),new a(new Yt(t,r,e,o))}function gt(t,e){let o=t.split(/\s*,\s*/),r=o.join(" {} ")+" {}",i=g("style",r);return e.appendChild(i),o.map((u,m)=>i.sheet.cssRules[m].style)}function Ye(t,e){let o;for(o in t)if(t[o]!==e[o])return!1;return!0}var yt=p(Ye,!0);var Ke=Object.assign;function tt(t){if(!tt.prototype.isPrototypeOf(this))return new tt(t);this.handlers=[],t&&(this.handleEvent=function(e){let o=t(e);return o===void 0?void 0:this.push(o)})}Ke(tt.prototype,{on:function(t){if(!arguments.length)throw new Error("Cannot pass `"+t+"` to distributor.on()");if(this.handlers.find(yt(arguments)))throw new Error(arguments.length===1?"Distributor: function "+arguments[0].name+"() already bound":"Distributor: object."+arguments[0]+"() already bound");return this.handlers.push(arguments),this},off:function(t){let e=this.handlers.findIndex(yt(arguments));return e===-1?this:(this.handlers.splice(e,1),this)},push:function(t){for(var e=-1,o,r,i;r=this.handlers[++e];)i=r.length===1?r[0].apply(this,arguments):r[1][r[0]].apply(r[1],arguments),o=o===void 0?i:i===void 0?o:o+i;return o},handleEvent:function(t){return this.push(t)}});var Ze=/^\s*([+-]?\d*\.?\d+)([^\s]*)\s*$/;function vt(t){return function(o){if(typeof o=="number")return o;var r=Ze.exec(o);if(!r||!t[r[2]||""]){if(!t.catch)throw new Error('Cannot parse value "'+o+'" (accepted units '+Object.keys(t).join(", ")+")");return r?t.catch(parseFloat(r[1]),r[2]):t.catch(parseFloat(o))}return t[r[2]||""](parseFloat(r[1]))}}var tn=/px$/,Kt={"transform:translateX":function(t){var e=G("transform",t);if(!e||e==="none")return 0;var o=et(e);return parseFloat(o[4])},"transform:translateY":function(t){var e=G("transform",t);if(!e||e==="none")return 0;var o=et(e);return parseFloat(o[5])},"transform:scale":function(t){var e=G("transform",t);if(!e||e==="none")return 0;var o=et(e),r=parseFloat(o[0]),i=parseFloat(o[1]);return Math.sqrt(r*r+i*i)},"transform:rotate":function(t){var e=G("transform",t);if(!e||e==="none")return 0;var o=et(e),r=parseFloat(o[0]),i=parseFloat(o[1]);return Math.atan2(i,r)}};function et(t){return t.split("(")[1].split(")")[0].split(/\s*,\s*/)}function G(t,e){return window.getComputedStyle?window.getComputedStyle(e,null).getPropertyValue(t):0}function nt(t,e){if(Kt[t])return Kt[t](e);var o=G(t,e);return typeof o=="string"&&tn.test(o)?parseFloat(o):o}var ot,rt;function en(){if(!ot){let t=document.documentElement.style.fontSize;document.documentElement.style.fontSize="100%",ot=nt("font-size",document.documentElement),document.documentElement.style.fontSize=t||""}return ot}function nn(){return rt||(rt=nt("font-size",document.documentElement)),rt}window.addEventListener("resize",()=>{ot=void 0,rt=void 0});var V=v(_,{number:E,string:vt({px:E,em:t=>en()*t,rem:t=>nn()*t,vw:t=>window.innerWidth*t/100,vh:t=>window.innerHeight*t/100,vmin:t=>window.innerWidth<window.innerHeight?window.innerWidth*t/100:window.innerHeight*t/100,vmax:t=>window.innerWidth<window.innerHeight?window.innerHeight*t/100:window.innerWidth*t/100})});var on=Object.assign;var Zt={mode:"closed",focusable:!0,construct:function(t){let e=gt(":host",t)[0],o=g("slot",{part:"content"}),r=g("slot",{name:"summary"}),i=g("button",{type:"button",html:"Open"});r.append(i),t.append(r,o);let u=H("slotchange",o);H("click",r).each(m=>this.open=!this.open),on(l(this),{button:i,changes:u,element:this,slot:o,style:e})}};var rn=Object.assign,N={bubbles:!0,cancelable:!0};function B(t,e){let o=N,r,i,u,m,D,T;return typeof t=="object"?({type:t,detail:i,bubbles:u,cancelable:m,composed:D,...r}=t,T=rn(new CustomEvent(t,{detail:i,bubbles:u||N.bubbles,cancelable:m||N.cancelable,composed:D||N.composed}),r)):T=new CustomEvent(t,N),e.dispatchEvent(T)}var xr=p(B,!0);function sn(t,e){let o=e.scrollHeight,r=getComputedStyle(e),i=V(r.getPropertyValue("padding-top")||0),u=V(r.getPropertyValue("padding-bottom")||0);H("transitionend",e).slice(0,1).each(m=>e.style.maxHeight=""),e.style.maxHeight=i+o+u+"px",t.setAttribute("open","")}function an(t,e){let o=e.scrollHeight,r=getComputedStyle(e),i=V(r.getPropertyValue("padding-bottom")||0),u=V(r.getPropertyValue("margin-bottom")||0);e.style.transition="none",e.style.maxHeight=o+"px",e.style.paddingBottom=i+"px",e.style.marginBottom=u+"px",t.removeAttribute("open"),requestAnimationFrame(()=>{e.style.transition="",e.style.maxHeight="",e.style.paddingBottom="",e.style.marginBottom=""})}var te={open:{attribute:function(t){this.open=t!==null},get:function(){return l(this).open},set:function(t){let e=l(this),{button:o,slot:r,style:i}=e;!!t!==e.open&&(t?(e.open=!0,sn(this,r),B("overflow-activate",this)):(e.open=!1,an(this,r),B("overflow-deactivate",this)))}}};var un=window.detailsToggleStylesheet||import.meta.url.replace(/\/[^\/]*([?#].*)?$/,"/")+"shadow.css",Fr=ft("<details-toggle>",Zt,te,un);var ee=window.location;function ne(){return B("dom-navigate",window)}function cn(t){return t.replace(/^#/,"")}window.addEventListener("popstate",ne);window.addEventListener("DOMContentLoaded",ne);window.addEventListener("hashchange",function(t){cn(ee.hash)===""&&history.replaceState(history.state,document.title,ee.href.replace(/#$/,""))});function bt(t,e,o){return o>e?e:o<t?t:o}var zr=p(bt);H({type:"scroll",capture:!0},window).reduce((t,e)=>{let o=document.scrollingElement,i=bt(0,200,o.scrollTop)/200;return i===t?t:(document.body.style.setProperty("--nav-scroll-ratio",i),i)});

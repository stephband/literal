/* Literal 
   0.6.4
   By Stephen
   Built 2023-03-26 03:56 */

var ct=Object.getOwnPropertySymbols;var Gt=Object.prototype.hasOwnProperty,It=Object.prototype.propertyIsEnumerable;var lt=(t,e)=>{var o={};for(var r in t)Gt.call(t,r)&&e.indexOf(r)<0&&(o[r]=t[r]);if(t!=null&&ct)for(var r of ct(t))e.indexOf(r)<0&&It.call(t,r)&&(o[r]=t[r]);return o};function M(t){var e=new Map;return function(r){if(e.has(r))return e.get(r);var i=t(r);return e.set(r,i),i}}var Rt=Array.prototype;function Wt(t,e){return typeof t=="function"?t.apply(null,e):t}function pt(t,e,o){o=o||t.length;var r=o===1?e?t:M(t):M(function(i){return pt(function(){var s=[i];return s.push.apply(s,arguments),t.apply(null,s)},e,o-1)});return function i(s){return arguments.length===0?i:arguments.length===1?r(s):arguments.length>=o?t.apply(null,arguments):Wt(r(s),Rt.slice.call(arguments,1))}}var u=pt;function qt(t,e){return e[t]}var ft=u(qt,!0);var z=ft("classList"),dt=z;function Nt(t,e){z(e).add(t)}function _t(t,e){z(e).remove(t)}function $t(t,e){(function o(r){return t--?requestAnimationFrame(o):e(r)})()}function Qt(t,e){var o=z(e);o.add(t),$t(2,()=>o.remove(t))}var Ie=u(Nt,!0),Re=u(_t,!0),We=u(Qt,!0);var L={simulatedEventDelay:.08,keyClass:"key-device",mouseClass:"mouse-device",touchClass:"touch-device",keyType:"key",mouseType:"mouse",touchType:"touch"},X={type:"mouse"},mt=dt(document.documentElement),Q,j;function Y(t){Q!==t&&(mt.remove(Q),mt.add(t),Q=t)}function Xt(t){t.timeStamp<j+L.simulatedEventDelay*1e3||(j=void 0,Y(L.mouseClass),X.type=L.mouseType)}function Yt(t){["ArrowDown","ArrowUp","ArrowRight","ArrowLeft","Space","Escape","Tab"].indexOf(t.code)!==-1&&(Y(L.keyClass),X.type=L.keyType,j=t.timeStamp)}function Jt(t){j=t.timeStamp,Y(L.touchClass),X.type=L.touchType}document.addEventListener("mousedown",Xt);document.addEventListener("keydown",Yt);document.addEventListener("touchend",Jt);function E(t){return t}function w(t,e){return function(){let r=t.apply(this,arguments),i=e[r]||e.default;if(!i)throw new Error('overload() no handler for "'+r+'"');return i.apply(this,arguments)}}function V(){}var Kt=w(E,{is:V,tag:V,data:function(t,e,o){Object.assign(e.dataset,o)},html:function(t,e,o){e.innerHTML=o},text:function(t,e,o){e.textContent=o},children:function(t,e,o){e.innerHTML="",e.append.apply(e,o)},points:H,cx:H,cy:H,r:H,transform:H,preserveAspectRatio:H,viewBox:H,default:function(t,e,o){t in e?e[t]=o:e.setAttribute(t,o)}});function H(t,e,o){e.setAttribute(t,o)}function Zt(t,e){for(var o=Object.keys(e),r=o.length;r--;)Kt(o[r],t,e[o[r]]);return t}var U=u(Zt,!0);var J="http://www.w3.org/2000/svg",ht=document.createElement("template"),K=(t,e)=>e&&typeof e;function wt(t,e){let o=document.createRange();return o.selectNode(t),o.createContextualFragment(e)}var f=w(K,{string:function(t,e){let o=document.createElementNS(J,t);return o.innerHTML=e,o},object:function(t,e){let o=document.createElementNS(J,t);return typeof e.length=="number"?o.append.apply(o,e):U(o,e),o},default:t=>document.createElementNS(J,t)}),te=w(K,{string:function(t,e){let o=document.createElement(t);return o.innerHTML=e,o},object:function(t,e){let o=document.createElement(t);return typeof e.length=="number"?o.append.apply(o,e):U(o,e),o},default:t=>document.createElement(t)}),ee=w(E,{comment:function(t,e){return document.createComment(e||"")},fragment:w(K,{string:function(t,e,o){return o?wt(o,e):(ht.innerHTML=e,ht.content.cloneNode(!0))},object:function(t,e,o){let r=o?wt(o):document.createDocumentFragment();return typeof e.length=="number"?r.append.apply(r,e):U(r,e),r},default:()=>document.createDocumentFragment()}),text:function(t,e){return document.createTextNode(e||"")},circle:f,ellipse:f,g:f,glyph:f,image:f,line:f,rect:f,use:f,path:f,pattern:f,polygon:f,polyline:f,svg:f,default:te}),b=ee;function Z(t,e,o){let r;typeof o!="string"&&o.input!==void 0&&o.index!==void 0&&(r=o,o=r.input.slice(o.index+o[0].length+(o.consumed||0)));let i=t.exec(o);if(!i)return;let s=e(i);return r&&(r.consumed=(r.consumed||0)+i.index+i[0].length+(i.consumed||0)),s}var an=u(Z,!0);function ne(t,e,o){throw o.input!==void 0&&o.index!==void 0&&(o=o.input),new Error('Cannot parse string "'+(o.length>128?o.length.slice(0,128)+"…":o)+'"')}function oe(t,e,o){let r=-1;for(;++r<o.length;)e=o[r]!==void 0&&t[r]?t[r](e,o):e;return t.done?t.done(e,o):t.close?t.close(e,o):e}function re(t,e,o,r){let i=Z(t,s=>oe(e,o,s),r);return i===void 0?e.catch?e.catch(o,r):ne(t,e,r):i}var gt=u(re,!0);var l=Symbol("internals"),C=Symbol("shadow"),yt=Object.defineProperties,ie={a:HTMLAnchorElement,article:HTMLElement,dl:HTMLDListElement,p:HTMLParagraphElement,br:HTMLBRElement,fieldset:HTMLFieldSetElement,hr:HTMLHRElement,img:HTMLImageElement,li:HTMLLIElement,ol:HTMLOListElement,optgroup:HTMLOptGroupElement,q:HTMLQuoteElement,section:HTMLElement,textarea:HTMLTextAreaElement,td:HTMLTableCellElement,th:HTMLTableCellElement,tr:HTMLTableRowElement,tbody:HTMLTableSectionElement,thead:HTMLTableSectionElement,tfoot:HTMLTableSectionElement,ul:HTMLUListElement},se={name:{set:function(t){return this.setAttribute("name",t)},get:function(){return this.getAttribute("name")||""}},form:{get:function(){return this[l].form}},labels:{get:function(){return this[l].labels}},validity:{get:function(){return this[l].validity}},validationMessage:{get:function(){return this[l].validationMessage}},willValidate:{get:function(){return this[l].willValidate}},checkValidity:{value:function(){return this[l].checkValidity()}},reportValidity:{value:function(){return this[l].reportValidity()}}},ae={},bt={once:!0},vt=0,xt=!1;function ue(t){return ie[t]||window["HTML"+t[0].toUpperCase()+t.slice(1)+"Element"]||(()=>{throw new Error('Constructor not found for tag "'+t+'"')})()}var ce=gt(/^\s*<?([a-z][\w]*-[\w-]+)>?\s*$|^\s*<?([a-z][\w]*)\s+is[=\s]*["']?([a-z][\w]*-[\w]+)["']?>?\s*$/,{1:(t,e)=>({name:e[1]}),2:(t,e)=>({name:e[3],tag:e[2]}),catch:function(t,e){throw new SyntaxError(`dom element() – name must be of the form 'element-name' or 'tag is="element-name"' (`+e+")")}},null);function le(t,e){if(t.hasOwnProperty(e)){let o=t[e];delete t[e],t[e]=o}return t}function Et(t,e,o){t._initialLoad=!0;let r=t.attachShadow({mode:e.mode||"closed",delegatesFocus:e.focusable||!1});if(o){let i=b("link",{rel:"stylesheet",href:o});r.append(i)}return t[C]=r,r}function pe(t){var e;if(t.attachInternals){if(e=t.attachInternals(),e.setFormValue)return e}else e={shadowRoot:t.shadowRoot};return e.input=b("input",{type:"hidden",name:t.name}),t.appendChild(e.input),e.setFormValue=function(o){this.input.value=o},e}function fe(t){return!!t.attribute}function de(t){return t.set||t.get||t.hasOwnProperty("value")}function me(t,e){return fe(e[1])&&(t.attributes[e[0]]=e[1].attribute),de(e[1])&&(t.properties[e[0]]=e[1]),t}function O(t){return t[l]=t[l]||{}}function tt(t,e,o,r,i=""){let{name:s,tag:c}=ce(t),k=typeof c=="string"?ue(c):HTMLElement,{attributes:g,properties:m}=o?Object.entries(o).reduce(me,{attributes:{},properties:{}}):ae;function p(){let a=Reflect.construct(k,arguments,p),y=e.construct&&e.construct.length>vt?Et(a,e,r||e.stylesheet):void 0,h=p.formAssociated?pe(a):{};return c&&(xt=!0),e.construct&&e.construct.call(a,y,h),m&&Object.keys(m).reduce(le,a),a}return p.prototype=Object.create(k.prototype,m),m.value&&(p.formAssociated=!0,yt(p.prototype,se),(e.enable||e.disable)&&(p.prototype.formDisabledCallback=function(a){return a?e.disable&&e.disable.call(this,this[C],this[l]):e.enable&&e.enable.call(this,this[C],this[l])}),e.reset&&(p.prototype.formResetCallback=function(){return e.reset.call(this,this[C],this[l])}),e.restore&&(p.prototype.formStateRestoreCallback=function(){return e.restore.call(this,this[C],this[l])})),g&&(p.observedAttributes=Object.keys(g),p.prototype.attributeChangedCallback=function(a,y,h){return g[a].call(this,h)}),p.prototype.connectedCallback=function(){let a=this,y=a[C],h=a[l];if(a._initialLoad){let x=y.querySelectorAll('link[rel="stylesheet"]');if(x.length){let jt=0,$=x.length,ut=function(De){++jt>=x.length&&(delete a._initialLoad,e.load&&e.load.call(a,y))},Vt=ut;for(;$--;)x[$].addEventListener("load",ut,bt),x[$].addEventListener("error",Vt,bt)}else e.load&&Promise.resolve(1).then(()=>e.load.call(this,y,h))}e.connect&&e.connect.call(this,y,h)},e.disconnect&&(p.prototype.disconnectedCallback=function(){return e.disconnect.call(this,this[C],this[l])}),window.console&&window.console.log("%c<"+(c?c+" is="+s:s)+">%c "+i,"color: #3a8ab0; font-weight: 600;","color: #888888; font-weight: 400;"),window.customElements.define(s,p,c&&{extends:c}),c&&!xt&&document.querySelectorAll('[is="'+s+'"]').forEach(a=>{m&&yt(a,m);let y=e.construct&&e.construct.length>vt?Et(a,e,r||e.stylesheet):void 0;e.construct&&e.construct.call(a,y);let h;for(h in g){let x=a.attributes[h];x&&g[h].call(a,x.value)}e.connect&&e.connect.apply(a)}),p}function St(t,e){t.remove&&t.remove(e);let o;for(;(o=t.indexOf(e))!==-1;)t.splice(o,1);return t}var wn=u(St,!0);function et(t){return t&&t[Symbol.iterator]}var he=Object.assign;function we(t){return t.stop?t.stop():t()}function D(){}he(D.prototype,{stop:function(){let t=this.stopables;return this.stopables=void 0,t&&t.forEach(we),this},done:function(t){return(this.stopables||(this.stopables=[])).push(t),this}});var v=Object.assign,T=Object.create;function Tt(t,e){t[0]=e,e.done(t)}function S(t,e){t&&t.push(e)}function ot(t){D.prototype.stop.apply(t);let e=-1,o;for(;o=t[++e];)t[e]=void 0,o.stop()}function d(t){this.input=t}v(d.prototype,D.prototype,{push:function(t){S(this[0],t)},pipe:function(t){if(this[0])throw new Error("Stream: Attempt to .pipe() a unicast stream multiple times. Create a multicast stream with .broadcast().");return this[0]=t,t.done(this),this.input.pipe(this),t},map:function(t){return new Lt(this,t)},filter:function(t){return new Ht(this,t)},split:function(t){return new Mt(this,t)},flatMap:function(t){return new Ct(this,t)},slice:function(t,e){return new nt(this,t,e)},take:function(t){return console.warn(".take(a) superseded by .slice(0, a)"),new nt(this,0,t)},each:function(t){return this.pipe(new Ot(t))},reduce:function(t,e){return this.pipe(new Ft(t,e)).value},scan:function(t,e){return new kt(this,t,e)},stop:function(){return ot(this),this}});function Lt(t,e){this.input=t,this.fn=e}Lt.prototype=v(T(d.prototype),{push:function(e){let r=this.fn(e);r!==void 0&&S(this[0],r)}});function Ht(t,e){this.input=t,this.fn=e}Ht.prototype=v(T(d.prototype),{push:function(e){this.fn(e)&&S(this[0],e)}});function Ct(t,e){this.input=t,this.fn=e}Ct.prototype=v(T(d.prototype),{push:function(e){let r=this.fn(e);if(r!==void 0)if(et(r))for(let i of r)S(this[0],i);else r.pipe&&this.done(r.each(i=>S(this[0],i)))}});function Mt(t,e){this.input=t,this.chunk=[],typeof n=="number"?this.n=e:this.fn=e}Mt.prototype=v(T(d.prototype),{fn:function(){return this.chunk.length===this.n},push:function(e){let o=this.chunk;this.fn(e)?(S(this[0],o),this.chunk=[]):o.push(e)}});function nt(t,e,o=1/0){this.input=t,this.index=-e,this.indexEnd=e+o}nt.prototype=v(T(d.prototype),{push:function(e){++this.index>0&&this[0].push(e),this.index===this.indexEnd&&this.stop()}});function Ft(t,e){this.fn=t,this.value=e,this.i=0}Ft.prototype=v(T(d.prototype),{push:function(t){let e=this.fn;this.value=e(this.value,t,this.i++,this)}});function kt(t,e,o){this.input=t,this.fn=e,this.value=o}kt.prototype=v(T(d.prototype),{push:function(t){let e=this.fn;this.value=e(this.value,t),this[0].push(this.value)}});function Ot(t){this.push=t}Ot.prototype=v(T(d.prototype),{each:null,reduce:null,pipe:null});var ge=Object.assign,ye=/\s+/,G={fullscreenchange:M(()=>"fullscreenElement"in document?"fullscreenchange":"webkitFullscreenElement"in document?"webkitfullscreenchange":"mozFullScreenElement"in document?"mozfullscreenchange":"msFullscreenElement"in document?"MSFullscreenChange":"fullscreenchange")},Dt=0;window.addEventListener("click",t=>Dt=t.timeStamp);function be(t,e){return t.node.addEventListener(G[e]?G[e]():e,t,t.options),t}function ve(t,e){return t.node.removeEventListener(G[e]?G[e]():e,t),t}function At(t,e,o){this.types=t.split(ye),this.options=e,this.node=o,this.select=e&&e.select}ge(At.prototype,{pipe:function(t){Tt(this,t),this.types.reduce(be,this)},handleEvent:function(t){if(!(t.type==="click"&&t.timeStamp<=Dt)){if(this.select){let e=t.target.closest(this.select);if(!e)return;t.selectedTarget=e}S(this[0],t)}},stop:function(){this.types.reduce(ve,this),ot(this[0])}});function F(t,e){let o;return typeof t=="object"&&(o=t,t=o.type),new d(new At(t,o,e))}function rt(t,e){let o=t.split(/\s*,\s*/),r=o.join(" {} ")+" {}",i=b("style",r);return e.appendChild(i),o.map((s,c)=>i.sheet.cssRules[c].style)}function xe(t,e){let o;for(o in t)if(t[o]!==e[o])return!1;return!0}var it=u(xe,!0);var Ee=Object.assign;function I(t){if(!I.prototype.isPrototypeOf(this))return new I(t);this.handlers=[],t&&(this.handleEvent=function(e){let o=t(e);return o===void 0?void 0:this.push(o)})}Ee(I.prototype,{on:function(t){if(!arguments.length)throw new Error("Cannot pass `"+t+"` to distributor.on()");if(this.handlers.find(it(arguments)))throw new Error(arguments.length===1?"Distributor: function "+arguments[0].name+"() already bound":"Distributor: object."+arguments[0]+"() already bound");return this.handlers.push(arguments),this},off:function(t){let e=this.handlers.findIndex(it(arguments));return e===-1?this:(this.handlers.splice(e,1),this)},push:function(t){for(var e=-1,o,r,i;r=this.handlers[++e];)i=r.length===1?r[0].apply(this,arguments):r[1][r[0]].apply(r[1],arguments),o=o===void 0?i:i===void 0?o:o+i;return o},handleEvent:function(t){return this.push(t)}});function st(t){return typeof t}var Se=/^\s*([+-]?\d*\.?\d+)([^\s\d]*)\s*$/;function at(t){return function(o){if(typeof o=="number")return o;var r=Se.exec(o);if(!r||!t[r[2]||""]){if(!t.catch)throw new Error('Cannot parse value "'+o+'" (accepted units '+Object.keys(t).join(", ")+")");return r?t.catch(parseFloat(r[1]),r[2]):t.catch(parseFloat(o))}return t[r[2]||""](parseFloat(r[1]))}}var Te=/px$/,Pt={"transform:translateX":function(t){var e=A("transform",t);if(!e||e==="none")return 0;var o=R(e);return parseFloat(o[4])},"transform:translateY":function(t){var e=A("transform",t);if(!e||e==="none")return 0;var o=R(e);return parseFloat(o[5])},"transform:scale":function(t){var e=A("transform",t);if(!e||e==="none")return 0;var o=R(e),r=parseFloat(o[0]),i=parseFloat(o[1]);return Math.sqrt(r*r+i*i)},"transform:rotate":function(t){var e=A("transform",t);if(!e||e==="none")return 0;var o=R(e),r=parseFloat(o[0]),i=parseFloat(o[1]);return Math.atan2(i,r)}};function R(t){return t.split("(")[1].split(")")[0].split(/\s*,\s*/)}function A(t,e){return window.getComputedStyle?window.getComputedStyle(e,null).getPropertyValue(t):0}function W(t,e){if(Pt[t])return Pt[t](e);var o=A(t,e);return typeof o=="string"&&Te.test(o)?parseFloat(o):o}var q,N;function Le(){if(!q){let t=document.documentElement.style.fontSize;document.documentElement.style.fontSize="100%",q=W("font-size",document.documentElement),document.documentElement.style.fontSize=t||""}return q}function He(){return N||(N=W("font-size",document.documentElement)),N}window.addEventListener("resize",()=>{q=void 0,N=void 0});var P=w(st,{number:E,string:at({px:E,em:t=>Le()*t,rem:t=>He()*t,vw:t=>window.innerWidth*t/100,vh:t=>window.innerHeight*t/100,vmin:t=>window.innerWidth<window.innerHeight?window.innerWidth*t/100:window.innerHeight*t/100,vmax:t=>window.innerWidth<window.innerHeight?window.innerHeight*t/100:window.innerWidth*t/100})});var Ce=Object.assign;var Bt={mode:"closed",focusable:!0,construct:function(t){let e=rt(":host",t)[0],o=b("slot",{part:"content"}),r=b("slot",{name:"summary"}),i=b("button",{type:"button",html:"Open"});r.append(i),t.append(r,o);let s=F("slotchange",o);F("click",r).each(c=>this.open=!this.open),Ce(O(this),{button:i,changes:s,element:this,slot:o,style:e})}};var Me=Object.assign,B={bubbles:!0,cancelable:!0};function _(t,e){var m;let o=B,r,i,s,c,k,g;return typeof t=="object"?(m=t,{type:t,detail:i,bubbles:s,cancelable:c,composed:k}=m,r=lt(m,["type","detail","bubbles","cancelable","composed"]),g=Me(new CustomEvent(t,{detail:i,bubbles:s||B.bubbles,cancelable:c||B.cancelable,composed:k||B.composed}),r)):g=new CustomEvent(t,B),e.dispatchEvent(g)}var to=u(_,!0);function Fe(t,e){let o=e.scrollHeight,r=getComputedStyle(e),i=P(r.getPropertyValue("padding-top")||0),s=P(r.getPropertyValue("padding-bottom")||0);F("transitionend",e).slice(0,1).each(c=>e.style.maxHeight=""),e.style.maxHeight=i+o+s+"px",t.setAttribute("open","")}function ke(t,e){let o=e.scrollHeight,r=getComputedStyle(e),i=P(r.getPropertyValue("padding-bottom")||0),s=P(r.getPropertyValue("margin-bottom")||0);e.style.transition="none",e.style.maxHeight=o+"px",e.style.paddingBottom=i+"px",e.style.marginBottom=s+"px",t.removeAttribute("open"),requestAnimationFrame(()=>{e.style.transition="",e.style.maxHeight="",e.style.paddingBottom="",e.style.marginBottom=""})}var zt={open:{attribute:function(t){this.open=t!==null},get:function(){return O(this).open},set:function(t){let e=O(this),{button:o,slot:r,style:i}=e;!!t!==e.open&&(t?(e.open=!0,Fe(this,r),_("overflow-activate",this)):(e.open=!1,ke(this,r),_("overflow-deactivate",this)))}}};var Oe=window.detailsToggleStylesheet||import.meta.url.replace(/\/[^\/]*([?#].*)?$/,"/")+"shadow.css",lo=tt("<details-toggle>",Bt,zt,Oe);

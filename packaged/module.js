// Literal 0.2.1 (Built 2021-07-30 01:22)


function y(t){return t}function l(t,e){return function(){let n=t.apply(this,arguments),o=e[n]||e.default;if(!o)throw new Error('overload() no handler for "'+n+'"');return o.apply(this,arguments)}}function E(t){return typeof t}var kt=!1;function B(t){var e=new Map;return function(n){if(kt&&n===void 0)throw new Error("Fn: cache() called with undefined.");if(kt&&arguments.length>1)throw new Error("Fn: cache() called with "+arguments.length+" arguments. Accepts exactly 1.");if(e.has(n))return e.get(n);var o=t(n);return e.set(n,o),o}}var Re=!1,Pe=Array.prototype;function Ge(t,e){return typeof t=="function"?t.apply(null,e):t}function Q(t,e,r){r=r||t.length;var n=r===1?e?t:B(t):B(function(o){return Q(function(){var i=[o];return i.push.apply(i,arguments),t.apply(null,i)},e,r-1)});return function o(i){return arguments.length===0?o:arguments.length===1?n(i):arguments.length>=r?t.apply(null,arguments):Ge(n(i),Pe.slice.call(arguments,1))}}if(Re){let t=Q,e=function(){var n=function(){};try{Object.defineProperty(n,"length",{value:2})}catch(o){return!1}return n.length===2}(),r=function(o,i,s,c){return c.toString=function(){return/function\s*[\w\d]*\s*\([,\w\d\s]*\)/.exec(s.toString())+" { ["+o+"] }"},e&&Object.defineProperty(c,"length",{value:i}),c};Q=function(o,i,s){return s=s||o.length,r("curried",s,o,t(o,i,s))}}var a=Q;function d(){}var Me=l(y,{is:d,tag:d,html:function(t,e,r){e.innerHTML=r},text:function(t,e,r){e.textContent=r},children:function(t,e,r){e.innerHTML="",r.forEach(n=>{e.appendChild(n)})},points:S,cx:S,cy:S,r:S,preserveAspectRatio:S,viewBox:S,default:function(t,e,r){t in e?e[t]=r:e.setAttribute(t,r)}});function S(t,e,r){e.setAttribute(t,r)}function Ue(t,e){for(var r=Object.keys(e),n=r.length;n--;)Me(r[n],t,e[r[n]]);return t}var F=a(Ue,!0);var ke="http://www.w3.org/2000/svg",_t=document.createElement("div");function _e(t,e){var r=document.createElement(t);return e&&(r.innerHTML=e),r}function b(t,e){var r=document.createElementNS(ke,t);return e&&(r.innerHTML=e),r}var R=l(y,{comment:function(t,e){return document.createComment(e||"")},fragment:function(t,e){var r=document.createDocumentFragment();if(e){_t.innerHTML=e;let n=_t.childNodes;for(;n[0];)r.appendChild(n[0])}return r},text:function(t,e){return document.createTextNode(e||"")},circle:b,ellipse:b,g:b,glyph:b,image:b,line:b,rect:b,use:b,path:b,pattern:b,polygon:b,polyline:b,svg:b,default:_e});function qe(){return Array.prototype.map.call(arguments,E).join(" ")}function qt(t){if(typeof t!="string")throw new Error("create(object, content) object must have string property .tag or .tagName")}var Ht=l(qe,{string:R,"string undefined":R,"string string":R,"string object":function(t,e){return F(R(t,""),e)},"object string":function(t,e){let r=t.tag||t.tagName;return qt(r),F(R(r,e),t)},"object object":function(t,e){let r=t.tag||t.tagName;return qt(r),F(F(R(r,""),t),e)},default:function(){throw new Error('create(tag, content) does not accept argument types "'+Array.prototype.map.call(arguments,E).join(" ")+'"')}});function gt(t,e,r){let n;typeof r!="string"&&r.input!==void 0&&r.index!==void 0&&(n=r,r=n.input.slice(r.index+r[0].length+(r.consumed||0)));let o=t.exec(r);if(!o)return;let i=e(o);return n&&(n.consumed=(n.consumed||0)+o.index+o[0].length+(o.consumed||0)),i}var lo=a(gt,!0);function He(t,e,r){throw r.input!==void 0&&r.index!==void 0&&(r=r.input),new Error('Cannot parse string "'+r+'"')}function Ve(t,e,r){let n=-1;for(;++n<r.length;)e=r[n]!==void 0&&t[n]?t[n](e,r):e;return t.done?t.done(e,r):t.close?t.close(e,r):e}function Fe(t,e,r,n){let o=gt(t,i=>Ve(e,r,i),n);return o===void 0?e.catch?e.catch(r,n):He(t,e,n):o}var Vt=a(Fe,!0);var Ie=window.DEBUG&&(window.DEBUG===!0||window.DEBUG.includes("element")),p=Symbol("internals"),A=Symbol("shadow"),Ft=Object.defineProperties,$e={a:HTMLAnchorElement,dl:HTMLDListElement,p:HTMLParagraphElement,br:HTMLBRElement,fieldset:HTMLFieldSetElement,hr:HTMLHRElement,img:HTMLImageElement,li:HTMLLIElement,ol:HTMLOListElement,optgroup:HTMLOptGroupElement,q:HTMLQuoteElement,textarea:HTMLTextAreaElement,td:HTMLTableCellElement,th:HTMLTableCellElement,tr:HTMLTableRowElement,tbody:HTMLTableSectionElement,thead:HTMLTableSectionElement,tfoot:HTMLTableSectionElement,ul:HTMLUListElement},We={type:{value:"text"},name:{set:function(t){return this.setAttribute("name",t)},get:function(){return this.getAttribute("name")||""}},form:{get:function(){return this[p].form}},labels:{get:function(){return this[p].labels}},validity:{get:function(){return this[p].validity}},validationMessage:{get:function(){return this[p].validationMessage}},willValidate:{get:function(){return this[p].willValidate}},checkValidity:{value:function(){return this[p].checkValidity()}},reportValidity:{value:function(){return this[p].reportValidity()}}},Xe={},It={once:!0},Je=0,$t=!1;function ze(t){return $e[t]||window["HTML"+t[0].toUpperCase()+t.slice(1)+"Element"]||(()=>{throw new Error('Constructor not found for tag "'+t+'"')})()}var Qe=Vt(/^\s*<?([a-z][\w]*-[\w]+)>?\s*$|^\s*<?([a-z][\w]*)\s+is=["']?([a-z][\w]*-[\w]+)["']?>?\s*$/,{1:(t,e)=>({name:e[1]}),2:(t,e)=>({name:e[3],tag:e[2]}),catch:function(t,e){throw new Error(`Element name must be of the form 'element-name' or 'tag is="element-name"' (`+e+")")}},null);function Ye(t,e){if(t.hasOwnProperty(e)){let r=t[e];delete t[e],t[e]=r}return t}function Ze(t,e){t._initialLoad=!0;let r=t.attachShadow({mode:e.mode||"closed",delegatesFocus:e.focusable||!1});return t[A]=r,r}function Ke(t){if(t.attachInternals)return t.attachInternals();let e=Ht("input",{type:"hidden",name:t.name});return e.setFormValue=function(r){this.value=r},e}function tr(t){t._initialAttributes={},t._n=0}function er(t,e,r){let n=t._initialAttributes;for(;t._n<e.length&&n[e[t._n]]!==void 0;)r[e[t._n]].call(t,n[e[t._n]]),++t._n}function Wt(t,e,r){if(!t._initialAttributes)return;let n=t._initialAttributes;for(;t._n<e.length;)n[e[t._n]]!==void 0&&r[e[t._n]]&&r[e[t._n]].call(t,n[e[t._n]]),++t._n;delete t._initialAttributes,delete t._n}function rr(t){return!!t.attribute}function nr(t){return t.set||t.get||t.hasOwnProperty("value")}function Xt(t,e){return rr(e[1])&&(t.attributes[e[0]]=e[1].attribute),nr(e[1])&&(t.properties[e[0]]=e[1]),t}function I(t,e,r){let{name:n,tag:o}=Qe(t),i=typeof o=="string"?ze(o):HTMLElement,{attributes:s,properties:c}=r?Object.entries(r).reduce(Xt,{attributes:{},properties:{}}):e.properties?Object.entries(e.properties).reduce(Xt,{attributes:{},properties:{}}):Xe;function h(){let u=Reflect.construct(i,arguments,h),g=e.construct&&e.construct.length>Je?Ze(u,e):void 0;return h.formAssociated&&(u[p]=Ke(u)),o&&($t=!0),e.construct&&e.construct.call(u,g,u[p]),s&&(tr(u),Promise.resolve(1).then(function(){Wt(u,h.observedAttributes,s)})),c&&Object.keys(c).reduce(Ye,u),u}let x=h.prototype=Object.create(i.prototype,c);return c&&c.value&&(h.formAssociated=!0,Ft(x,We),(e.enable||e.disable)&&(x.formDisabledCallback=function(u){return u?e.disable&&e.disable.call(this,this[A],this[p]):e.enable&&e.enable.call(this,this[A],this[p])}),e.reset&&(x.formResetCallback=function(){return e.reset.call(this,this[A],this[p])}),e.restore&&(x.formStateRestoreCallback=function(){return e.restore.call(this,this[A],this[p])})),s&&(h.observedAttributes=Object.keys(s),x.attributeChangedCallback=function(u,g,j){if(!this._initialAttributes)return s[u].call(this,j);this._initialAttributes[u]=j,er(this,h.observedAttributes,s)}),x.connectedCallback=function(){let u=this,g=u[A],j=u[p];if(u._initialAttributes&&Wt(u,h.observedAttributes,s),u[p]&&!u.attachInternals&&u.appendChild(u[p]),u._initialLoad){let V=g.querySelectorAll('link[rel="stylesheet"]');if(V.length){let Se=0,mt=V.length,Ut=function(In){++Se>=V.length&&(delete u._initialLoad,e.load&&e.load.call(u,g))};for(;mt--;)V[mt].addEventListener("load",Ut,It),V[mt].addEventListener("error",function(ht){console.log("Failed to load stylesheet",ht.target.href),Ut(ht)},It);e.connect&&e.connect.call(this,g,j)}else e.connect&&e.connect.call(this,g,j),e.load&&e.load.call(this,g,j)}else e.connect&&e.connect.call(this,g,j)},e.disconnect&&(x.disconnectedCallback=function(){return e.disconnect.call(this,this[A],this[p])}),console.log("%cElement","color: #3a8ab0; font-weight: 600;","<"+(o?o+" is="+n+"":n)+">"),window.customElements.define(n,h,o&&{extends:o}),o&&!$t&&(Ie&&console.warn(`Browser does not support customised built-in elements.
Attempting to partially polyfill instances of <`+o+' is="'+n+'"> found in the DOM.'),document.querySelectorAll('[is="'+n+'"]').forEach(u=>{Ft(u,c),e.construct&&e.construct.apply(u);let g;for(g in s){let j=u.attributes[g];j&&s[g].call(u,j.value)}e.connect&&e.connect.apply(u)})),h}var Jt=/\.?([\w-]+)/g;function or(t,e,r){var n=t.exec(e);if(!n)throw new Error('getPath(path, object): invalid path "'+e+'" at index '+t.lastIndex);return zt(t,e,r[n[1]])}function zt(t,e,r){return t.lastIndex===e.length?r:r?or(t,e,r):void 0}function ir(t,e){return Jt.lastIndex=0,zt(Jt,t,e)}var Y=a(ir,!0);var sr={done:!0},ur={next:()=>sr},D=Object.freeze({shift:d,push:d,join:function(){return""},forEach:d,map:function(){return this},filter:function(){return this},indexOf:function(){return-1},start:d,stop:d,length:0,[Symbol.iterator]:()=>ur});function bt(t){var e=t.id;if(!e){do e=Math.ceil(Math.random()*1e5);while(document.getElementById(e));t.id=e}return e}function L(t){return t.nodeType===3}var cr={1:"element",3:"text",8:"comment",9:"document",10:"doctype",11:"fragment"};function Qt(t){return cr[t.nodeType]}function ar(t,e,r){let n=t(e),o=t(r);return o===n?0:n>o?1:-1}var Yt=a(ar,!0);function Zt(t,e){if(t===e)return!0;if(t===null||e===null||typeof t!="object"||typeof e!="object")return!1;let r=Object.keys(t),n=Object.keys(e),o=r.length;for(;o--;){if(t[r[o]]===void 0){if(e[r[o]]!==void 0)return!1}else if(!e.hasOwnProperty(r[o])||!Zt(t[r[o]],e[r[o]]))return!1;let i=n.indexOf(r[o]);i>-1&&n.splice(i,1)}for(o=n.length;o--;)if(e[n[o]]===void 0){if(t[n[o]]!==void 0)return!1}else return!1;return!0}var Kt=a(Zt,!0);function lr(t,e){let r;for(r in t)if(t[r]!==e[r])return!1;return!0}var te=a(lr,!0);function wt(t){if(t=typeof t=="number"?t+"":t.trim(),typeof t=="string")return t.toLowerCase().replace(/^[\W_]+/,"").replace(/[\W_]+$/,"").replace(/[\W_]+/g,"-")}function yt(t){if(typeof t.length=="number")return t[t.length-1]}var T=Symbol("handlers"),Z=Symbol("oberver"),K=Symbol("target");var Mo=window.DEBUG===!0,fr=Object.assign,dr=Object.defineProperties,pr=Object.isExtensible,$={observables:0,observes:0};function tt(t,e){let r=t.indexOf(e);return r>-1&&t.splice(r,1),t}function v(t){return t&&t[K]||t}function xt(t,e){let r=e[T],n=r.observables||(r.observables={});return n[t]||(n[t]=[])}function et(t,e,r){if(!!t){t=t.slice(0);for(var n=-1;t[++n];)t[n].fn?t[n].fn(e,r):t[n](e,r)}}function mr(t){return t&&pr(t)&&!Node.prototype.isPrototypeOf(t)&&(typeof BaseAudioContext=="undefined"||!BaseAudioContext.prototype.isPrototypeOf(t))&&!(t instanceof Date)&&!(t instanceof RegExp)&&!(t instanceof Map)&&!(t instanceof WeakMap)&&!(t instanceof Set)&&!(window.WeakSet&&t instanceof WeakSet)&&!ArrayBuffer.isView(t)}var rt={[T]:{},[Z]:{},[K]:{}};function ee(){this.observables={},this.gets=[],this.sets=[]}fr(ee.prototype,{get:function(e,r,n){if(typeof r=="symbol"||r==="__proto__")return e[r];let o=Object.getOwnPropertyDescriptor(e,r);o&&(o.writable||o.set)&&et(this.gets,r);let s=P(e[r]);if(!s)return e[r];for(var c=-1;this.gets[++c];)this.gets[c].listen(r);return s},set:function(e,r,n,o){if(typeof r=="symbol"||r==="__proto__")return e[r]=n,!0;if(e[r]===n)return!0;for(var i=-1;this.gets[++i];)this.gets[i].unlisten(r);e[r]=v(n),n=e[r];let s=this.observables[r];return s&&et(s,n),et(this.sets,r,n),!0},deleteProperty:function(t,e){if(typeof e=="symbol"||e==="__proto__")return delete t[e],!0;if(!t.hasOwnProperty(e))return!0;delete t[e];let r=this.observables[e];return r&&et(r,t[e]),!0}});function hr(t){let e=new ee,r=new Proxy(t,e);return rt[Z].value=r,rt[K].value=t,rt[T].value={gets:e.gets,sets:e.sets,observables:e.observables},dr(t,rt),r}function P(t){return t?t[Z]||(mr(t)?hr(t):void 0):void 0}var nt=window.DEBUG===!0,re=Object.assign,jt=/(^\.?|\.)\s*([\w-]*)\s*/g;function vt(t,e,r,n){if(!t.length)throw new Error("Path is empty!");jt.lastIndex=e;let o=jt.exec(t);if(!o)throw new Error("Cant parse path "+this.path+" at index "+this.index);if(!o[2]){console.log('r[1] must be "." (',o[1],t,") Todo: observe all mutations");return}this.target=r,this.path=t,this.index=jt.lastIndex,this.key=o[2],this.output=n,this.index>=this.path.length&&(this.fn=this.output),this.listen(),this.fn(this.target[this.key]),nt&&++$.observes}re(vt.prototype,{fn:function(t){let e=typeof t;if(!t||e!=="object"&&e!=="function"){this.child&&(this.child.stop(),this.child=void 0),this.output(void 0);return}this.child?(this.child.unlisten(),this.child.target=t,this.child.listen()):this.child=new vt(this.path,this.index,t,this.output),this.child.fn(t[this.child.key])},listen:function(){if(!P(this.target)){console.log("CANNOT LISTEN TO UNOBSERVABLE",this.target);return}let e=xt(this.key,this.target);if(e.includes(this))throw new Error("observe.listen this is already bound");e.push(this)},unlisten:function(){let t=xt(this.key,this.target);tt(t,this)},stop:function(){this.unlisten(),this.child&&this.child.stop(),this.child=void 0,nt&&--$.observes}});function ne(t,e,r){return new vt(t.path,0,t.target,typeof e=="function"?n=>{n!==r&&(r=n,e(n))}:n=>{n!==r&&(r=n,e.push(n))})}function G(t,e,r){this.path=t,this.target=e,this.initial=r,nt&&++$.observables}re(G.prototype,{each:function(t){return this.child=ne(this,t,this.initial),this},pipe:function(t){return ne(this,t,this.initial),t},stop:function(){return this.child.stop(),nt&&--$.observables,this}});function M(t,e,r){return new G(t,v(e),r)}var gr=Object.assign;function br(t,e,r,n){t.length||r.then(n),t.includes(e)||t.push(e)}function wr(t,e,r){let n=Promise.resolve(t);function o(){r(t),t.length=0}let i=t.map(s=>new G(s,e));return t.length=0,i.forEach(s=>s.each(c=>br(t,s.path,n,o))),i}function yr(t){t.stop()}function xr(t,e){this.paths=t,this.target=e}gr(xr.prototype,{each:function(t){return this.children=wr(this.paths,this.target,t),this},stop:function(){return this.children.forEach(yr),this}});var jr=/^\s*([+-]?\d*\.?\d+)([^\s\d]*)\s*$/;function vr(t,e){if(typeof e=="number")return e;var r=jr.exec(e);if(!r||!t[r[2]||""]){if(!t.catch)throw new Error('Cannot parse value "'+e+'" with provided units '+Object.keys(t).join(", "));return r?t.catch(parseFloat(r[1]),r[2]):t.catch(parseFloat(e))}return t[r[2]||""](parseFloat(r[1]))}var oe=a(vr);var Et=l(E,{number:y,string:oe({px:t=>t,em:t=>16*t,rem:t=>16*t,catch:(t,e)=>{if(Number.isNaN(t))throw new Error("Invalid CSS length NaN");if(e)throw new Error("Invalid CSS length value: "+t+" unit: "+e);return t}})}),ie=Et;function se(t){return Et(t)/16}function ue(t){return Et(t)/16}var Tt={assign:Object.assign,by:Yt,define:Object.defineProperties,entries:Object.entries,em:se,equals:Kt,get:Y,keys:Object.keys,last:yt,matches:te,observe:M,overload:l,px:ie,rem:ue,slugify:wt,values:Object.values,render:function(){return Promise.all(arguments)}},w=Tt;function Er(t,e){if(Tt[t])throw new Error('Literal: function "'+t+'" already registered');return Tt[t]=e,e}function Tr(t,e){return e[t]}var Ot=a(Tr,!0);function Or(t){let e=t[0];return/^\w/.test(e)}function ot(t={},e,r,n){let o=Object.entries(t).filter(Or),i=o.map(Ot(0)),s=o.map(Ot(1));return n?new Function(...i,"return async ("+e+") => {"+(r||"")+"}").apply(n,s):new Function(...i,"return async function("+e+"){"+(r||"")+"}").apply(null,s)}var Nr=window.DEBUG===!0||window.DEBUG&&window.DEBUG.includes("literal");var W="  ",X={};function Ar(t){let e=t[0];return/^\w/.test(e)}function Dr(t){return t.split(/\s*[,\s]\s*/).filter(Ar).sort().join(", ")}function m(t,e,r,n,o="data",i,s){if(typeof r!="string")throw new Error("Template is not a string");let c=n||r;if(X[c])return X[c];let h=e&&Dr(e),x=`
`+(n?W+"// Template #"+n+`
`:"")+(h?W+"const { "+h+" } = "+o+`;
`:"")+W+"return render`"+r+"`;\n";if(Nr)try{let u=ot(t,"data = {}","try {"+x+"} catch(e) {"+W+'e.message += " in template #" + this.template + (this.element && this.element.tagName ? ", <" + this.element.tagName.toLowerCase() + (this.name ? " " + this.name + "=\\"...\\">" : ">") : "");'+W+"throw e;}");return X[c]=u}catch(u){throw u.message+=" in template #"+i.template+(s&&s.tagName?", <"+s.tagName.toLowerCase()+(i.name?" "+i.name+'="'+r+'">':">"):""),u}return X[c]=ot(t,"data = {}",x)}var Lr=/\s*(\([\w,\s]*\))/,Cr=/function(?:\s+\w+)?\s*(\([\w,\s]*\))/,U=l(E,{boolean:t=>t+"",function:t=>t.prototype?(t.name||"function")+(Cr.exec(t.toString())||[])[1]:(Lr.exec(t.toString())||[])[1]+" ⇒ ()",number:t=>Number.isNaN(t)?"":Number.isFinite(t)?t+"":t<0?"-∞":"∞",string:y,symbol:t=>t.toString(),undefined:t=>"",object:l(t=>t&&t.constructor.name,{RegExp:t=>t.source,null:()=>"",default:t=>JSON.stringify(t,null,2)}),default:JSON.stringify});var Br=Object.assign,Sr=t=>t&&typeof t=="object"&&t.then,J=t=>t.reduce((e,r)=>r===""||r===void 0?e:e+r);function Rr(t,e,r){return t&&typeof t=="object"?t.then?t.then(n=>e===""?n:e+n):t.find?t.find(Sr)?Promise.all(t).then(n=>e===""?J(n.map(r)):e+J(n.map(r))):e===""?J(t.map(r)):e+J(t.map(r)):e===""?r(t):e+r(t):e===""?r(t):e+r(t)}function Pr(t){let e=t[0];return J(e.map((r,n)=>n<=t.length?Rr(t[n+1],r,U):r===""?void 0:r))}var Gr=0;function f(t,e,r){this.element=r||t,this.node=t,this.path=e.path,this.id=++Gr,this.count=0,this.template=e.template}Br(f.prototype,{render:function(){return++this.count,this.literal.apply(this,arguments).then(this.resolve).then(this.update)},resolve:Pr});var Mr=Object.assign;function Ur(t,e,r){return r===t.getAttribute(e)?0:(t.setAttribute(e,r),1)}function it(t,e){f.apply(this,arguments),this.literal=e.literal||m(w,e.consts,e.source,null,"arguments[1]",e,this.element),this.name=e.name,this.update=r=>Ur(t,this.name,r)}Mr(it.prototype,f.prototype);var kr=Object.assign;function _r(t,e,r){if(e in t){if(!!r===t[e])return 0;t[e]=r}else r?t.setAttribute(e,e):t.removeAttribute(e);return 1}function st(t,e){f.apply(this,arguments),this.literal=e.literal||m(w,e.consts,e.source,null,"arguments[1]",e,this.element),this.name=e.name,this.update=r=>_r(t,this.name,r)}kr(st.prototype,f.prototype);function Nt(t){return!!t||t!=null&&!Number.isNaN(t)}var At=Object.assign,qr=window.CustomEvent,Dt={bubbles:!0,cancelable:!0};function Lt(t,e){let r;typeof t=="object"&&(r=At({},Dt,t),t=r.type,delete r.type),e&&e.detail&&(r?r.detail=e.detail:r=At({detail:e.detail},Dt));var n=new qr(t,r||Dt);return e&&(delete e.detail,At(n,e)),n}function Hr(t,e){let r;typeof t=="object"&&(r=t,t=r.type,delete r.type);var n=Lt(t,r);return e.dispatchEvent(n),e}var ut=a(Hr,!0);var k={changeEvent:"dom-update"};var Vr=Object.assign,Fr=/^\s*$/;function Ir(t){return!Fr.test(t)}function $r(t,e,r){let n=typeof e=="boolean"?e:r?e+""===t.value:!!e;return n===t.checked?0:(t.checked=n,k.changeEvent&&ut(k.changeEvent,t),1)}function ct(t,e){f.apply(this,arguments),this.name="checked",this.literal=e.literal||m(w,e.consts,e.source,null,"arguments[1]",e,this.element);let r=Nt(t.getAttribute("value"));this.update=n=>$r(t,n,r)}Vr(ct.prototype,f.prototype,{resolve:function(e){if(e.length!==2||e[0].find(Ir))throw new Error("A checked attribute may contain only one ${ tag }, optionally surrounded by white space");return e[1]}});function Wr(t,e){if(e.slice)return e.slice(t);if(e.rest)return e.rest(t);for(var r=[],n=e.length-t;n--;)r[n]=e[n+t];return r}var ce=a(Wr,!0);function at(t){return function(r){var n=t[r]||t.default;return n&&n.apply(this,ce(1,arguments))}}var _=Object.assign,q={headers:function(t){return{}},body:y,onresponse:function(t){if(t.redirected){window.location=t.url;return}return t}},Xr=at({"application/x-www-form-urlencoded":function(t){return _(t,{"Content-Type":"application/x-www-form-urlencoded","X-Requested-With":"XMLHttpRequest"})},"application/json":function(t){return _(t,{"Content-Type":"application/json; charset=utf-8","X-Requested-With":"XMLHttpRequest"})},"multipart/form-data":function(t){return _(t,{"Content-Type":"multipart/form-data","X-Requested-With":"XMLHttpRequest"})},"audio/wav":function(t){return _(t,{"Content-Type":"audio/wav","X-Requested-With":"XMLHttpRequest"})},default:function(t){return _(t,{"Content-Type":"application/x-www-form-urlencoded","X-Requested-With":"XMLHttpRequest"})}}),Qr=at({"application/json":function(t){return t.get?Jr(t):JSON.stringify(t)},"application/x-www-form-urlencoded":function(t){return t.get?ae(t):le(t)},"multipart/form-data":function(t){return t.get?t:zr(t)}});function Jr(t){return JSON.stringify(Array.from(t.entries()).reduce(function(e,r){return e[r[0]]=r[1],e},{}))}function ae(t){return new URLSearchParams(t).toString()}function le(t){return Object.keys(t).reduce((e,r)=>(e.append(r,t[r]),e),new URLSearchParams)}function zr(t){throw new Error("TODO: dataToFormData(data)")}function Yr(t,e){return e instanceof FormData?t+"?"+ae(e):t+"?"+le(e)}function Zr(t,e,r,n){let o=typeof r=="string"?r:r&&r["Content-Type"]||"application/json",i=Xr(o,_(q.headers&&e?q.headers(e):{},typeof r=="string"?D:r)),s={method:t,headers:i,credentials:"same-origin",signal:n&&n.signal};return t!=="GET"&&(s.body=Qr(o,q.body?q.body(e):e)),s}var en={"text/html":tn,"application/json":Kr,"multipart/form-data":fe,"application/x-www-form-urlencoded":fe,audio:Ct,"audio/wav":Ct,"audio/m4a":Ct};function Ct(t){return t.blob()}function Kr(t){return t.json().catch(e=>{throw new Error("Cannot parse JSON "+t.url+". "+e.message+"")})}function fe(t){return t.formData()}function tn(t){return t.text()}function rn(t){if(q.onresponse&&(t=q.onresponse(t)),!t.ok)throw new Error(t.statusText+"");let e=t.headers.get("Content-Type").replace(/\;.*$/,"");return en[e](t)}function de(t="GET",e,r,n="application/json"){(e.startsWith("application/")||e.startsWith("multipart/")||e.startsWith("text/")||e.startsWith("audio/"))&&(console.trace("request(method, url, data, contenttype) parameter order has changed. You passed (method, contenttype, url, data)."),e=arguments[1],r=arguments[2],n=arguments[3]),t=t.toUpperCase(),t==="GET"&&r&&(e=Yr(e,r));let o=Zr(t,r,n,arguments[4]);return fetch(e,o).then(rn)}function pe(t){return de("GET",t)}var is=window.DEBUG===!0||window.DEBUG&&window.DEBUG.includes("literal"),nn=/\.([\w-]+)(?:#|\?|$)/,on=/#(\w+)(?:\(([^\)]*)\))?$/,sn=["","default",""],C=l(t=>nn.exec(t)[1],{js:t=>{let[e,r,n]=on.exec(t)||sn,o=t[0]==="."?new URL(t,window.location):t;return n?import(o).then(i=>{if(typeof i[r]!="function")throw new Error("Export "+o+" is not a function");return new i[r](...JSON.parse("["+n.replace(/'/g,'"')+"]"))}):import(o).then(i=>i[r])},json:B(t=>pe(t))});function un(t,e){if(!/^#/.test(t))throw new Error('Template: Only #fragment identifiers currently supported as include() urls ("'+t+'")');let r=new O(t.slice(1));return typeof e=="string"?C(e).then(n=>r.render(n)):e.then?e.then(n=>r.render(n)):r.render(e||{}),r}var me=a(un);var ys=window.DEBUG===!0||window.DEBUG&&window.DEBUG.includes("literal"),he=Object.assign,cn=he({},w,{include:me,request:C});function an(t,e,r){let n=r.length,o=-1;for(;++o<n;)t=ge(t,e,r[o]);return t}function ge(t,e,r){if(r&&typeof r=="object"){if(typeof r.length=="number")return an(t,e,r);if(r instanceof Node||r instanceof O)return t&&e.push(t),e.push(r),""}return t+U(r)}function be(t,e){return t.after?t.after(e):t.last.after(e),1}function we(t,e){return e.stop&&e.stop(),t+=e.remove()||1,t}function Bt(t,e){return t.nodeValue!==e?(t.nodeValue=e,1):0}function ln(t,e,r){let n=0,o;typeof r[0]=="string"?(n+=Bt(t,r[0]),o=0):(n+=Bt(t,""),o=-1);let i=0,s;for(;s=r[++o];){if(typeof s=="string"){for(;i<e.length&&!L(e[i]);)n=e.splice(i,1).reduce(we,n);if(e[i])n+=Bt(e[i],s);else{let c=document.createTextNode(s);n+=be(e[i-1],c),e.push(c)}}else n+=be(e[i-1]||t,s.fragment),e.splice(i,0,s);++i}return n=e.splice(i).reduce(we,n),n}function z(t,e,r){f.apply(this,arguments);let n=this.children=[];this.literal=e.literal||m(cn,e.consts,e.source,null,"arguments[1]",e,r),this.update=o=>ln(t,n,o)}he(z.prototype,f.prototype,{resolve:function(t){let e=t[0],r=[],n=-1,o="";for(;e[++n]!==void 0;)o=ge(o+e[n],r,t[n+1]);return o&&r.push(o),r}});var fn=Object.assign,dn=[],pn=l((t,e)=>e,{class:t=>t.classList});function mn(t){return t&&typeof t=="object"&&t.length!==void 0?t.join(" "):U(t)}function hn(t){let[e]=t;for(var r="",n=-1,o;e[++n]!==void 0;)e[n]&&(r+=" "+e[n]),o=t[n+1],o!==void 0&&o!==""&&(r+=" "+mn(o));return r}function gn(t,e,r,n){let o=e.length;for(;o--;)t.indexOf(e[o])!==-1&&e.splice(o,1);return e.length&&(t.remove.apply(t,e),++n),t.add.apply(t,r),++n}function lt(t,e){f.apply(this,arguments);let r=pn(t,e.name),n=dn;this.literal=e.literal||m(w,e.consts,e.source,null,"arguments[1]",e,t),this.name=e.name,this.update=o=>{let i=o.trim().split(/\s+/),s=gn(r,n,i,0);return n=i,s},t.setAttribute(this.name,"")}fn(lt.prototype,f.prototype,{resolve:hn});var ye=Object.assign,xe=/^\s*$/,bn={number:"number",range:"number"};function je(t,e){return t===void 0?e:t+e}function wn(t){let e=t[0],r=xe.test(e[0])?void 0:e[0],n=0;for(;e[++n]!==void 0;)r=je(r,t[n]),xe.test(e[n])||(r=je(r,e[n]));return r}function yn(t,e,r){if(r===null)throw new Error("VALUE");return e in t?t[e]=r:t.setAttribute(e,r),1}function ve(t,e){if(document.activeElement===t)return 0;let r=bn[t.type];if(e=r===void 0||typeof e===r?e:null,e===t.value||e+""===t.value)return 0;let n=yn(t,"value",e);return k.changeEvent&&ut(k.changeEvent,t),n}function ft(t,e){f.apply(this,arguments),this.name="value",this.literal=e.literal||m(w,e.consts,e.source,null,"arguments[1]",e,t),this.update=r=>ve(t,r)}ye(ft.prototype,f.prototype,{resolve:wn});function St(t,e){f.apply(this,arguments),this.name="value",this.literal=e.literal||m(w,e.consts,e.source,null,"arguments[1]",e,t),this.update=r=>ve(t,r)}ye(St.prototype,f.prototype);var Ee=document.createElement("textarea");function dt(t){return Ee.innerHTML=t,Ee.value}var Is=window.DEBUG===!0||window.DEBUG&&window.DEBUG.includes("literal"),xn=Array.prototype,N=/\$\{/;function Te(t,e,r,n){let o=n.value;if(!o||!N.test(o))return;let i=n.localName;e.source=o,e.name=i,t.push(new it(r,e))}function Rt(t,e,r,n){let o=n.value;if(!o||!N.test(o))return;let i=n.localName;e.source=o,e.name=i,t.push(new st(r,e))}function jn(t,e,r,n){let o=n.value;if(!o||!N.test(o))return;let i=n.localName;e.source=o,e.name=i,t.push(new lt(r,e))}function vn(t,e,r,n){let o=n.value;!o||!N.test(o)||(e.source=o,e.name="value",t.push(new ft(r,e)))}function Pt(t,e,r,n){let o=n.value;!o||!N.test(o)||(e.source=o,e.name="value",t.push(new St(r,e)))}function En(t,e,r,n){let o=n.value;!o||!N.test(o)||(e.source=o,e.name="checked",t.push(new ct(r,e)))}var Tn=l((t,e,r,n)=>n.localName,{checked:En,class:jn,datetime:function(e,r,n,o){console.log("Todo: compile datetime")},disabled:Rt,hidden:Rt,"inner-content":function(t,e,r,n){let o=n.value;!o||!N.test(o)||(r.removeAttribute(n.localName),e.source=dt(o),e.name="innerHTML",t.push(new z(r,e)))},required:Rt,value:l((t,e,r,n)=>""+r.type,{text:Pt,search:Pt,"select-one":Pt,default:vn,undefined:Te}),default:Te});function On(t,e,r){let n=xn.slice.apply(r.attributes);for(var o=-1,i;i=n[++o];)Tn(t,e,r,i)}function Gt(t,e,r){let n=r.childNodes;if(n){let o=e.path,i=-1;for(;n[++i];)e.path=o?o+"."+i:""+i,Oe(t,e,n[i],r);e.path=o}return t}var Nn=l((t,e,r)=>r.tagName.toLowerCase(),{defs:d,default:(t,e,r)=>(Gt(t,e,r),On(t,e,r),t)}),Oe=l((t,e,r)=>Qt(r),{comment:d,element:Nn,fragment:Gt,text:(t,e,r,n)=>{let o=r.nodeValue;return o&&N.test(o)&&(e.source=dt(o),e.name=null,t.push(new z(r,e,n))),t},doctype:d,document:(t,e,r)=>(Gt(t,e,r),t),default:()=>{throw new Error("Node not compileable")}}),Ne=Oe;var zs=window.DEBUG===!0,Ae=Object.assign,An=Object.values;function Dn(t){t.stop()}function pt(t,e,r,n){this.children={},this.target=v(t),this.parent=r,this.path=e,this.output=n,t[T].gets.push(this)}Ae(pt.prototype,{listen:function(t){if(this.children[t])return;let e=this.path?this.path+".":"";this.children[t]=new pt(this.target[t],e+t,this,this.output)},unlisten:function(t){!this.children[t]||(this.children[t].stop(),delete this.children[t])},fn:function(t){let e=this.path?this.path+".":"";this.output(e+t)},stop:function(){tt(this.target[T].gets,this),An(this.children).forEach(Dn)}});function De(t,e){this.children={},this.target=t,this.done=e,this.path="",this.output=r=>{this.fnEach&&this.fnEach(r)},t[T].gets.push(this)}Ae(De.prototype,pt.prototype,{each:function(t){return this.fnEach=t,this},stop:function(){pt.prototype.stop.apply(this),this.fnDone&&this.fnDone()}});function Mt(t){return new De(v(t))}var Ln=window.DEBUG===!0||window.DEBUG&&window.DEBUG.includes("literal"),Cn={aqua:"#00a8a9",green:"#d8cd17",yellow:"#eac60c",orange:"#ffa000",red:"#ff003a"},Le=Ln?function(e,r,n="#d8cd17"){console.log("%cLiteral %c"+e+" %c"+r,"color: #81868f; font-weight: 600;","color: "+(Cn[n]||n)+"; font-weight: 300;","color: #81868f; font-weight: 300;")}:d;var Bn=window.DEBUG===!0||window.DEBUG&&window.DEBUG.includes("literal"),Sn=Object.assign,H={};function Rn(t,e){return e+t}function Pn(t){t.reduce(Rn,0)!==0}function Gn(t,e){return/^[a-zA-Z]/.test(e)?t:t.childNodes[e]}function Mn(t,e){return t.split(/\./).reduce(Gn,e)}function Un(t){t.paths?t.paths.length=0:t.paths=[]}function Ce(t,e,r){Un(t);let n=t.paths,o=Mt(e).each(s=>{if(!n.includes(s)){for(var c;(c=n[n.length-1])&&c.length<s.length&&s.startsWith(c);)--n.length;n.push(s)}}),i=t.render(e,r);return o.stop(),i}function kn(t){let e=t.childNodes[0],r=t.childNodes[t.childNodes.length-1];if(L(e)||t.prependChild(document.createTextNode("")),L(r)){let n=/\s*$/.exec(r.nodeValue);r.nodeValue=n.input.slice(0,n.index),t.appendChild(document.createTextNode(n[0]))}else t.appendChild(document.createTextNode(""))}function _n(t){let e=Mn(t.path,this),r=L(e)?e.parentNode:e;return new t.constructor(e,t,r)}function O(t){let e=typeof t=="string"?t:bt(t);if(H[e]){this.consts=H[e].consts,this.content=H[e].content,this.fragment=H[e].content.cloneNode(!0),this.first=this.fragment.childNodes[0],this.last=this.fragment.childNodes[this.fragment.childNodes.length-1],this.renderers=H[e].renderers.map(_n,this.fragment),this.observables=D;return}if(t=typeof t=="string"?document.getElementById(t):t,Bn){if(!t)throw new Error('Template id="'+e+'" not found in document');if(!t.content)throw new Error('Element id="'+e+'" is not a <template> (no content fragment)');t.dataset.data!==void 0&&Le("render","data-data attribute will be ignored","red")}kn(t.content),this.consts=t.dataset?Object.keys(t.dataset):D,this.content=t.content,this.fragment=t.content.cloneNode(!0),this.first=this.fragment.childNodes[0],this.last=this.fragment.childNodes[this.fragment.childNodes.length-1];let r={template:e,consts:this.consts.join(", "),path:""};this.renderers=Ne([],r,this.fragment,t),this.observables=D,H[e]=this}function Be(t){t.stop()}Sn(O.prototype,{render:function(t={}){let e=v(t);if(e===this.data)return this.fragment;this.data=e;let r=P(e),n=this.renderers,o=n.map(i=>Ce(i,r,e));return this.observables.forEach(Be),this.observables=r?n.flatMap(i=>i.paths.map(s=>M(s,e,Y(s,e)).each(c=>Ce(i,r,e)))):D,Promise.all(o).then(i=>(Pn(i),this.fragment))},stop:function(){this.observables.forEach(Be),this.render=d},remove:function(){let t=0,e=this.last;for(;e!==this.first;){let r=e.previousSibling;e.remove(),++t,e=r}return this.first.remove(),++t}});var fu=I('<template is="literal-template">',{construct:function(){this.instanceCount=0}},{render:{value:function(t){let e=new O(this);return++this.instanceCount,e.render(t),e.fragment}}});var qn=/^\.|^https?:\/\//;function Hn(t){try{return JSON.parse(t)}catch(e){return t}}function Vn(t){return qn.test(t)?C(t):Hn(t)}function Fn(t,e){let r={},n=t.length;for(;n--;)r[t[n]]=e[n];return r}I("<literal-include>",{construct:function(){this.hasAttribute("src")||console.error("<literal-include> a src attribute is required",this);let t=Object.keys(this.dataset),e=Object.values(this.dataset),r=t.length?Promise.all(e.map(Vn)).then(n=>Fn(t,n)):new Promise((n,o)=>{this.resolveData=n,this.rejectData=o});new Promise((n,o)=>{this.resolveSrc=n,this.rejectSrc=o}).then(n=>{if(n.render)return r.then(o=>{this.after(n.render(o)),this.remove()});this.after(n.content.cloneNode(!0)),this.remove()}).catch(n=>console.error(n,this))},connect:function(){this.resolveData&&this.resolveData({})}},{data:{attribute:function(t){if(!this.resolveData)throw console.log("BOO dont know why this is triggered multiple times",t),new Error("<literal-include> may possess either data-* attributes or a single data attribute, not both");this.resolveData(C(t))}},src:{attribute:function(t){if(!t)return this.rejectSrc('<literal-include> source src="'+t+'" is empty');let e=t.replace(/^#/,""),r=document.getElementById(e);if(!r)return this.rejectSrc("<literal-include> src template not found");this.resolveSrc(r)}}});export{X as compiled,Er as register};

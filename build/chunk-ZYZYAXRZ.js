/* Literal 
   0.9.0
   By Stephen Band */

import{e as g,f as c,i as T}from"./chunk-7JOO4XMD.js";var M=Symbol("internals");function I(e){var t;if(e.attachInternals){if(t=e.attachInternals(),t.setFormValue)return t}else t={shadowRoot:elem.shadowRoot};return t.polyfillInput=c("input",{type:"hidden",name:elem.name}),elem.appendChild(t.polyfillInput),t.setFormValue=function(r){this.input.value=r},t}function E(e,t,r){return t[M]=e.formAssociated?I(t):{shadowRoot:r}}function a(e){return e[M]}var H={once:!0};function w(e){return new Promise((t,r)=>{e.addEventListener("load",t,H),e.addEventListener("error",r,H)})}var P=g(e=>{if(!e||e.includes("undefined"))throw new Error("ERRR?");let t=c("link",{rel:"preload",as:"style",href:e}),r=w(t);return document.head.append(t),r});var v=Object.defineProperties,k={},A={a:HTMLAnchorElement,article:HTMLElement,dl:HTMLDListElement,p:HTMLParagraphElement,br:HTMLBRElement,fieldset:HTMLFieldSetElement,hr:HTMLHRElement,img:HTMLImageElement,li:HTMLLIElement,ol:HTMLOListElement,optgroup:HTMLOptGroupElement,q:HTMLQuoteElement,section:HTMLElement,textarea:HTMLTextAreaElement,td:HTMLTableCellElement,th:HTMLTableCellElement,tr:HTMLTableRowElement,tbody:HTMLTableSectionElement,thead:HTMLTableSectionElement,tfoot:HTMLTableSectionElement,ul:HTMLUListElement},S={name:{set:function(e){return this.setAttribute("name",e)},get:function(){return this.getAttribute("name")||""}},form:{get:function(){return a(this).form}},labels:{get:function(){return a(this).labels}},validity:{get:function(){return a(this).validity}},validationMessage:{get:function(){return a(this).validationMessage}},willValidate:{get:function(){return a(this).willValidate}},checkValidity:{value:function(){return a(this).checkValidity()}},reportValidity:{value:function(){return a(this).reportValidity()}}},x=0,C=!1;function O(e){return A[e]||window["HTML"+e[0].toUpperCase()+e.slice(1)+"Element"]||(()=>{throw new Error('Constructor not found for tag "'+e+'"')})()}var V=T(/^\s*<?([a-z][\w]*-[\w-]+)>?\s*$|^\s*<?([a-z][\w]*)\s+is[=\s]*["']?([a-z][\w]*-[\w-]+)["']?>?\s*$/,{1:(e,t)=>({name:t[1]}),2:(e,t)=>({name:t[3],tag:t[2]}),catch:function(e,t){throw new SyntaxError(`dom element() – name must be of the form 'element-name' or 'tag is="element-name"' (`+t+")")}},null);function y(e,t){if(e.hasOwnProperty(t)){let r=e[t];delete e[t],e[t]=r}return e}function R(e,t,r){let u=e.attachShadow({mode:t.mode||"closed",delegatesFocus:t.focusable||!1});if(r){let p=c("link",{rel:"stylesheet",href:r});u.append(p)}return u}function B(e,t){return typeof t=="string"?t[0]==="#"?e.appendChild(document.getElementById(t.slice(1)).content.clone(!0)):e.innerHTML=t:e.appendChild(t.content.clone(!0)),e}function j(e){return!!e.attribute}function D(e){return e.set||e.get||e.hasOwnProperty("value")}function F(e,t){return j(t[1])&&(e.attributes[t[0]]=t[1].attribute),D(t[1])&&(e.properties[t[0]]=t[1]),e}function U(e,t,r,u,p=""){let{name:b,tag:l}=V(e),L=typeof l=="string"?O(l):HTMLElement,{attributes:h,properties:d}=r?Object.entries(r).reduce(F,{attributes:{},properties:{}}):k;function s(){let n=Reflect.construct(L,arguments,s),o=t.mode||t.shadow?R(n,t,u||t.stylesheet):void 0;t.shadow&&B(o,t.shadow);let i=E(s,n,o);if(i.unconnected=!0,l&&(C=!0),t.construct&&t.construct.call(n,o,i),d&&Object.keys(d).reduce(y,n),o){let m=o.querySelectorAll('link[rel="stylesheet"]');if(m.length){let f=c("style","*:not(:has(slot:not([name]))) { display: none !important; }");o.append(f),i.stylesheetsLoadPromise=Promise.all(Array.from(m,w)).finally(()=>f.remove())}}return n}return u&&(P(u),p=p),s.prototype=Object.create(L.prototype,d),d&&d.value&&(s.formAssociated=!0,v(s.prototype,S),(t.enable||t.disable)&&(s.prototype.formDisabledCallback=function(n){let o=a(this),i=o.shadowRoot;return n?t.disable&&t.disable.call(this,i,o):t.enable&&t.enable.call(this,i,o)}),t.reset&&(s.prototype.formResetCallback=function(){let n=a(this),o=n.shadowRoot;return t.reset.call(this,o,n)}),t.restore&&(s.prototype.formStateRestoreCallback=function(){let n=a(this),o=n.shadowRoot;return t.restore.call(this,o,n)})),h&&(s.observedAttributes=Object.keys(h),s.prototype.attributeChangedCallback=function(n,o,i){return h[n].call(this,i)}),s.prototype.connectedCallback=function(){let n=a(this),o=n.shadowRoot;n.polyfillInput&&elem.appendChild(n.polyfillInput),n.unconnected&&(t.load&&n.stylesheetsLoadPromise?n.stylesheetsLoadPromise.then(()=>t.load.call(this,o,n)):t.load&&Promise.resolve().then(()=>t.load.call(this,o,n)),delete n.unconnected),t.connect&&t.connect.call(this,o,n)},t.disconnect&&(s.prototype.disconnectedCallback=function(){let n=a(this),o=n.shadowRoot;return t.disconnect.call(this,o,n)}),window.console&&window.console.log("%c<"+(l?l+" is="+b:b)+">%c "+p,"color:#3a8ab0;font-weight:600;","color:#888888;font-weight:400;"),window.customElements.define(b,s,l&&{extends:l}),l&&!C&&document.querySelectorAll('[is="'+b+'"]').forEach(n=>{d&&v(n,d);let o=t.construct&&t.construct.length>x?R(n,t,u||t.stylesheet):void 0,i=E(s,n,o);t.construct&&t.construct.call(n,o);let m;for(m in h){let f=n.attributes[m];f&&h[m].call(n,f.value)}t.connect&&t.connect.apply(n)}),s}export{a,U as b};
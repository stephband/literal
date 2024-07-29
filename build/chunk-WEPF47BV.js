/* Literal 
   0.9.2
   By Stephen Band */

var ye=Object.defineProperty;var Er=(t,e,r)=>e in t?ye(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r;var ve=(t,e)=>{for(var r in e)ye(t,r,{get:e[r],enumerable:!0})};var x=(t,e,r)=>(Er(t,typeof e!="symbol"?e+"":e,r),r),Vt=(t,e,r)=>{if(!e.has(t))throw TypeError("Cannot "+r)};var l=(t,e,r)=>(Vt(t,e,"read from private field"),r?r.call(t):e.get(t)),h=(t,e,r)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,r)},w=(t,e,r,n)=>(Vt(t,e,"write to private field"),n?n.call(t,r):e.set(t,r),r);var V=(t,e,r)=>(Vt(t,e,"access private method"),r);var C;function Ee(t,e){let r=0;for(;e[--r]&&e[r]!==t;);for(e[r]=t,r=-1;t[++r]&&t[r]!==e;);t[r]=e}function be(t){let e=-1,r;for(;r=t[++e];)t[e]=void 0,r.invalidate(t)}function De(t,e){let r=0;for(;t[--r];)if(t[r]===e)return!0;return!1}var u=class t{static isSignal(e){return e instanceof t}static of(e){return new $t(e)}static from(e,r){if(e.then){let n=t.of();return e.then(o=>n.value=o),n}if(e.pipe){let n=t.of();return e.pipe({push:o=>n.value=o}),n}return new Ht(e,r)}static observe(e,r,n){return new nt(e,r,n)}static evaluate(e,r,n=e){let o=C;C=e;let i=r.apply(n);return C=o,i}static get evaluating(){return C}constructor(){}valueOf(){return this.value}toString(){return this.value+""}toJSON(){return this.value}},k,$t=class extends u{constructor(r){super();h(this,k,void 0);w(this,k,r)}get value(){return C&&Ee(this,C),l(this,k)}set value(r){l(this,k)!==r&&(w(this,k,r),be(this))}};k=new WeakMap;var ot,it,P,$,Ht=class extends u{constructor(r,n){super();h(this,ot,void 0);h(this,it,void 0);h(this,P,void 0);h(this,$,void 0);w(this,ot,r),w(this,it,n)}get value(){return C&&Ee(this,C),l(this,P)?l(this,$):(w(this,$,u.evaluate(this,l(this,ot),l(this,it))),w(this,P,!0),l(this,$))}invalidate(r){if(!l(this,P)||r&&!De(this,r))return;w(this,P,!1);let n=0;for(;this[--n];)this[n]=void 0;be(this)}};ot=new WeakMap,it=new WeakMap,P=new WeakMap,$=new WeakMap;var br=Promise.resolve(),st,H,at,Xt,nt=class{constructor(e,r,n){h(this,at);h(this,st,void 0);h(this,H,void 0);w(this,st,e),w(this,H,r);let o=u.evaluate(this,V(this,at,Xt));e.value!==n&&l(this,H).call(this,o)}invalidate(e){if(this.status==="done"||e&&!De(this,e))return;let r=0;for(;this[--r];)this[r]=void 0;br.then(()=>l(this,H).call(this,u.evaluate(this,V(this,at,Xt))))}stop(){return this.status==="done"?this:(this.status="done",this)}};st=new WeakMap,H=new WeakMap,at=new WeakSet,Xt=function(){return l(this,st).value};var Dr=Object.assign,Tr=Object.defineProperties,Nr=Object.isExtensible,Br=Object.prototype,L=Symbol("data"),Te={[L]:{}};function Or(t){return t&&Nr(t)&&!Node.prototype.isPrototypeOf(t)&&(window.BaseAudioContext===void 0||!BaseAudioContext.prototype.isPrototypeOf(t))&&!(t instanceof Date)&&!(t instanceof RegExp)&&!(t instanceof Map)&&!(t instanceof WeakMap)&&!(t instanceof Set)&&!(window.WeakSet&&t instanceof WeakSet)&&!ArrayBuffer.isView(t)}function Wt(t,e,r){return t[e]||(t[e]=u.of(r))}function Sr(t,e,r){let n=Object.getOwnPropertyDescriptor(r,e);return!(n?n.writable||n.set:r[e]===void 0)||!u.evaluating?r[e]:Wt(t,e,r[e]).value}function Ne(t){this.signals={},this.object=t,this.data=new Proxy(t,this),Te[L].value=this,Tr(t,Te)}Dr(Ne.prototype,{get:function(e,r,n){if(typeof r=="symbol"||r==="__proto__")return e[r];let o=Sr(this.signals,r,e);return Br.hasOwnProperty.call(e,r)&&f(o)||o},set:function(e,r,n,o){if(typeof r=="symbol"||r==="__proto__")return e[r]=n,!0;let i=f.objectOf(n);if(e[r]===n||e[r]===i)return!0;let s=e.length;return e[r]=i,this.signals[r]&&(this.signals[r].value=e[r]),r!=="length"&&e.length!==s&&this.signals.length&&(this.signals.length.value=e.length),!0},deleteProperty:function(t,e){return delete t[e],typeof e!="symbol"&&e!=="__proto__"&&this.signals[e]&&(this.signals[e].value=t[e]),!0}});function f(t,e){return t?t[L]?t[L].data:e||Or(t)?new Ne(t).data:void 0:void 0}f.of=t=>f(t);f.objectOf=function(t){return t&&t[L]?t[L].object:t};f.observe=function(t,e,r,n){let o=f(e)&&e[L];if(!o)return;let i=Wt(o.signals,t,o.object[t]);return u.observe(i,r,n)};f.signal=function(t,e){let r=f.of(e)&&e[L];return r?Wt(r.signals,t,r.object[t]):nothing};function R(t){var e=new Map;return function(n){if(e.has(n))return e.get(n);var o=t(n);return e.set(n,o),o}}function y(){}function p(t){return t}function d(t,e){return function(){let n=t.apply(this,arguments),o=e[n]||e.default;if(!o)throw new Error('overload() no function defined for key "'+n+'"');return o.apply(this,arguments)}}var Ur=Array.prototype;function Gr(t,e){return typeof t=="function"?t.apply(null,e):t}function Be(t,e,r){r=r||t.length;var n=r===1?e?t:R(t):R(function(o){return Be(function(){var i=[o];return i.push.apply(i,arguments),t.apply(null,i)},e,r-1)});return function o(i){return arguments.length===0?o:arguments.length===1?n(i):arguments.length>=r?t.apply(null,arguments):Gr(n(i),Ur.slice.call(arguments,1))}}var g=Be;var Ar=d(p,{is:y,tag:y,data:function(t,e,r){for(t in r)r[t]===void 0&&delete r[t];Object.assign(e.dataset,r)},dataset:function(t,e,r){Object.assign(e.dataset,r)},html:function(t,e,r){e.innerHTML=r},text:function(t,e,r){e.textContent=r},children:function(t,e,r){e.innerHTML="",e.append.apply(e,r)},points:T,cx:T,cy:T,r:T,x:T,y:T,dx:T,dy:T,transform:T,preserveAspectRatio:T,viewBox:T,default:function(t,e,r){t in e?e[t]=r:e.setAttribute(t,r)}});function T(t,e,r){e.setAttribute(t,r)}function Cr(t,e){for(var r=Object.keys(e),n=r.length;n--;)Ar(r[n],t,e[r[n]]);return t}var bt=g(Cr,!0);var It="http://www.w3.org/2000/svg",Oe=document.createElement("template"),Jt=(t,e)=>e&&typeof e;function Se(t,e=""){let r=document.createRange();return r.selectNode(t),r.createContextualFragment(e)}var E=d(Jt,{string:function(t,e){let r=document.createElementNS(It,t);return r.innerHTML=e,r},object:function(t,e){let r=document.createElementNS(It,t);return typeof e.length=="number"?r.append.apply(r,e):bt(r,e),r},default:t=>document.createElementNS(It,t)}),Lr=d(Jt,{string:function(t,e){let r=document.createElement(t);return r.innerHTML=e,r},object:function(t,e){let r=document.createElement(t);return typeof e.length=="number"?r.append.apply(r,e):bt(r,e),r},default:t=>document.createElement(t)}),Rr=d(p,{comment:function(t,e){return document.createComment(e||"")},fragment:d(Jt,{string:function(t,e,r){return r?Se(r,e):(Oe.innerHTML=e,Oe.content.cloneNode(!0))},object:function(t,e,r){let n=r?Se(r):document.createDocumentFragment();return typeof e.length=="number"?n.append.apply(n,e):bt(n,e),n},default:()=>document.createDocumentFragment()}),text:function(t,e){return document.createTextNode(e||"")},circle:E,ellipse:E,g:E,glyph:E,image:E,line:E,rect:E,use:E,path:E,pattern:E,polygon:E,polyline:E,svg:E,tspan:E,default:Lr}),O=Rr;var jt={};ve(jt,{Data:()=>f,Signal:()=>u,arg:()=>ut,args:()=>zt,assign:()=>Hr,cache:()=>R,capture:()=>Ge,ceil:()=>Jr,choose:()=>X,entries:()=>Xr,exec:()=>Ue,floor:()=>zr,id:()=>p,isDefined:()=>W,keys:()=>Wr,last:()=>Kt,location:()=>$e,matches:()=>Ae,noop:()=>y,nothing:()=>ct,overload:()=>d,remove:()=>Le,round:()=>_r,set:()=>Yt,sum:()=>Zt,values:()=>Ir});function ut(t){return function(){return arguments[t]}}function zt(){return arguments}function _t(t,e,r){let n;typeof r!="string"&&r.input!==void 0&&r.index!==void 0&&(n=r,r=n.input.slice(r.index+r[0].length+(r.consumed||0)));let o=t.exec(r);if(!o)return;let i=e(o);return n&&(n.consumed=(n.consumed||0)+o.index+o[0].length+(o.consumed||0)),i}var Ue=g(_t,!0);function qr(t,e,r){throw r.input!==void 0&&r.index!==void 0&&(r=r.input),new Error('Cannot parse string "'+(r.length>128?r.length.slice(0,128)+"…":r)+'"')}function kr(t,e,r){let n=-1;for(;++n<r.length;)e=r[n]!==void 0&&t[n]?t[n](e,r):e;return t.done?t.done(e,r):t.close?t.close(e,r):e}function Pr(t,e,r,n){let o=_t(t,i=>kr(e,r,i),n);return o===void 0?e.catch?e.catch(r,n):qr(t,e,n):o}var Ge=g(Pr,!0);function X(t){return function(r,...n){var o=t[r]||t.default;return o&&o.apply(this,n)}}function W(t){return!!t||t!=null&&!Number.isNaN(t)}function Kt(t){if(typeof t.length=="number")return t[t.length-1]}function Mr(t,e){let r;for(r in t)if(t[r]!==e[r])return!1;return!0}var Ae=g(Mr,!0);function N(){return this}var Ce=Object.create,Fr=Object.freeze,ct=Fr(Ce(Ce(Object.prototype,{at:{value:y},shift:{value:y},push:{value:y},forEach:{value:y},join:{value:function(){return""}},every:{value:function(){return!0}},filter:{value:N},find:{value:y},findIndex:{value:function(){return-1}},flat:{value:N},flatMap:{value:N},includes:{value:function(){return!1}},indexOf:{value:function(){return-1}},map:{value:N},reduce:{value:ut(1)},sort:{value:N},each:{value:N},pipe:{value:p},start:{value:N},stop:{value:N},done:{value:N},valueOf:{value:function(){return null}}}),{length:{value:0}}));function Qt(t,e){t.remove&&t.remove(e);let r;for(;(r=t.indexOf(e))!==-1;)t.splice(r,1);return t}var Le=g(Qt,!0);function Vr(t,e,r){let n=t.replace(/([^.]+)\./g,(o,i)=>(e=e[i],""));return e[n]=r}var Yt=g(Vr,!0);function Zt(t,e){return e+t}function qe(t){return t.replace(/^#/,"")}var Re={search:"",params:{},hash:"",identifier:"",state:null},ke=u.of(window.location.pathname),$r=u.of(window.location.search),Pe=u.of(window.location.has),Me=u.of(window.location.href),Fe=u.of(JSON.stringify(window.history.state)),Ve={base:"/",path:"",get hash(){return Pe.value},get identifier(){return qe(this.hash)||Re.identifier},get params(){return this.search?Object.fromEntries(new URLSearchParams(this.search)):Re.params},get pathname(){return ke.value},get name(){return this.pathname.slice(this.base.length)},get search(){return Object.fromEntries(new URLSearchParams(Ve.search))},get href(){return Me.value},get state(){return Fe.value}},$e=Ve;function He(){ke.value=window.location.pathname,$r.value=window.location.search,Pe.value=window.location.hash,Me.value=window.location.href,Fe.value=JSON.stringify(window.history.state)}window.addEventListener("popstate",He);window.addEventListener("DOMContentLoaded",He);window.addEventListener("hashchange",function(t){let e=window.location,r=window.history;qe(e.hash)===""&&r.replaceState(r.state,document.title,e.href.replace(/#$/,""))});var Hr=Object.assign,Xr=Object.entries,Wr=Object.keys,Ir=Object.values,Jr=Math.ceil,zr=Math.floor,_r=(t,e=1)=>Math.round(t/e)*e;var ee={};ve(ee,{body:()=>dn,create:()=>O,decode:()=>lt,frame:()=>mn,identify:()=>ft,isTextNode:()=>te,parse:()=>pt,request:()=>Tt,root:()=>pn,toNodeType:()=>dt,translate:()=>hn,trigger:()=>J});var Xe=document.createElement("textarea");function lt(t){return Xe.innerHTML=t,Xe.value}function ft(t,e="id-"){var r=t.id;if(!r){do r=e+Math.ceil(Math.random()*1e6);while(document.getElementById(r));t.id=r}return r}function te(t){return t.nodeType===3}var Kr={xml:"application/xml",html:"text/html",svg:"image/svg+xml"};function pt(t,e){if(e){var r=Kr[t.toLowerCase()]||t,n;try{n=new window.DOMParser().parseFromString(e,r)}catch{return}if(!n||n.getElementsByTagName("parsererror").length)throw new Error("Invalid "+t.toUpperCase()+": "+e);return n}}function We(t){return pt("html",t)}function Ie(t){return pt("svg",t)}var G=Object.assign,I={headers:function(t){return{}},body:p},Qr=X({"application/x-www-form-urlencoded":function(t){return G(t,{"Content-Type":"application/x-www-form-urlencoded","X-Requested-With":"XMLHttpRequest"})},"application/json":function(t){return G(t,{"Content-Type":"application/json; charset=utf-8","X-Requested-With":"XMLHttpRequest"})},"multipart/form-data":function(t){return G(t,{"Content-Type":"multipart/form-data","X-Requested-With":"XMLHttpRequest"})},"audio/wav":function(t){return G(t,{"Content-Type":"audio/wav","X-Requested-With":"XMLHttpRequest"})},"image/png":function(t){return G(t,{"Content-Type":"image/png","X-Requested-With":"XMLHttpRequest"})},"image/jpg":function(t){return G(t,{"Content-Type":"image/jpg","X-Requested-With":"XMLHttpRequest"})},"image/jpeg":function(t){return G(t,{"Content-Type":"image/jpeg","X-Requested-With":"XMLHttpRequest"})},default:function(t){return G(t,{"Content-Type":"application/x-www-form-urlencoded","X-Requested-With":"XMLHttpRequest"})}}),Yr=X({"application/json":function(t){return t.get?Zr(t):JSON.stringify(t)},"application/x-www-form-urlencoded":function(t){return t.get?ze(t):_e(t)},"multipart/form-data":function(t){return t.get?t:jr(t)},default:p});function Zr(t){return JSON.stringify(Array.from(t.entries()).reduce(function(e,r){return e[r[0]]=r[1],e},{}))}function ze(t){return new URLSearchParams(t).toString()}function _e(t){return Object.keys(t).reduce((e,r)=>(e.append(r,t[r]),e),new URLSearchParams)}function jr(t){throw new Error("TODO: dataToFormData(data)")}function tn(t,e){return e instanceof FormData?t+"?"+ze(e):t+"?"+_e(e)}function en(t,e,r,n){let o=typeof r=="string"?r:r&&r["Content-Type"]||"application/json",i=Qr(o,G(I.headers&&e?I.headers(e):{},typeof r=="string"?{}:r)),s={method:t,mode:"cors",headers:i,credentials:"same-origin",signal:n&&n.signal};return t!=="GET"&&(s.body=Yr(o,I.body?I.body(e):e)),s}function Dt(t){return t.blob()}function rn(t){return t.json().catch(e=>{throw new Error("Cannot parse JSON "+t.url+". "+e.message)})}function Je(t){return t.formData()}function nn(t){return t.text()}function on(t){return t.text().then(e=>/^\s*<!DOCTYPE html>/.test(e)?We(e):O("fragment",e))}function sn(t){return t.text().then(e=>/^\s*<\?xml/.test(e)?Ie(e):(console.warn("Untested SVG fragment parsing in request.js!"),O("fragment",e)))}var an={"text/plain":nn,"text/html":on,"image/svg+xml":sn,"application/json":rn,"multipart/form-data":Je,"application/x-www-form-urlencoded":Je,audio:Dt,"audio/wav":Dt,"audio/m4a":Dt,"application/zip":Dt};function un(t){if(I.onresponse&&(t=I.onresponse(t)),!t.ok)throw new Error(t.statusText+"");let e=t.headers.get("Content-Type");if(!e)return;let r=e.replace(/\;.*$/,"");return an[r](t)}function Tt(t="GET",e,r={},n="application/json"){t=t.toUpperCase(),t==="GET"&&r&&(e=tn(e,r));let o=en(t,r,n,arguments[4]);return fetch(e,o).then(un)}function Nt(t){return Tt("GET",t)}var cn={1:"element",3:"text",8:"comment",9:"document",10:"doctype",11:"fragment"};function dt(t){return cn[t.nodeType]}var ln=Object.assign,mt={bubbles:!0,cancelable:!0};function fn(t,e){let r=mt,n,o,i,s,a,c;return typeof t=="object"?({type:t,detail:o,bubbles:i,cancelable:s,composed:a,...n}=t,c=ln(new CustomEvent(t,{detail:o,bubbles:i||mt.bubbles,cancelable:s||mt.cancelable,composed:a||mt.composed}),n)):c=new CustomEvent(t,mt),e.dispatchEvent(c)}var J=g(fn,!0);var pn=document.documentElement,dn=document.body,mn=window.requestAnimationFrame;function hn(t){return window.translations&&window.translations[t]||t}var Bt=Object.assign({},jt,ee);function re(t){let e=t.slice(1),r=document.getElementById(e);if(!r)throw new Error("Template "+t+" not found");return r}var gn=Object.entries,Ot={};function wn(t,[e,r]){let n=new URL(e,window.location);return Ot[n]=new URL(r,window.location),Ot}function Pi(t){gn(t).reduce(wn,Ot)}function Ke(t){let e=new URL(t,window.location);return Ot[e]||e}function xn(t,e){return e[t]}var S=g(xn,!0);function St(t){var e={};return function(n){return n in e?e[n]:e[n]=t(n)}}var yn=/\.([\w-]+)(?:#|\?|$)/,vn=[],En=d(t=>(yn.exec(t.pathname)||vn)[1],{js:St(t=>{let e=t.origin+t.pathname+t.search,r=t.hash.slice(1)||"default";return import(e).then(S(r))}),default:St(Nt)});function ne(t){let e=Ke(t);return En(e)}var Qe=y;var Ye='<a class="literal-link" href="https://stephen.band/literal/literal-html/">literal</literal>';function bn(t){if(typeof t=="object"&&t.template)return"<strong>"+t.id+"</strong> "+t.template+" <small>&gt; "+t.path+'</small> <!--strong class="literal-count">'+t.count+"</strong-->";if(typeof t=="object"&&t.message)return'<code class="white-fg">'+t.message+"</code>";if(typeof t=="object")return"<code><strong>"+t.constructor.name+"</strong> "+JSON.stringify(t)+"</code>"}function Dn(t,e){return Qe("error",t.template+" – "+t.code,"","","red"),console.log(e),O("pre",{class:"literal-error",html:t.template+' <small class="literal-message">'+t.code.replace(/</g,"&lt;").replace(/>/g,"&gt;")+"</small><code><strong>"+e.constructor.name+"</strong> "+e.message.replace(/</g,"&lt;").replace(/>/g,"&gt;")+"</code>"+Ye})}function Tn(t,e){let r=t.path+(typeof t.name=="string"?">"+t.name:""),n=0,o="";for(;arguments[++n]!==void 0;)o+=bn(arguments[n]);return O("pre",{class:"literal-print",html:t.template+" <small>"+(r?"&gt; "+r.replace(/>/g," &gt "):"")+'</small><span class="literal-count">'+t.renderCount+"</span>"+o+Ye})}function oe(t,e){return e instanceof Error?Dn(t,e):Tn(t,e)}function Nn(t){let e=t[0];return/^\w/.test(e)}function ie(t={},e,r,n){let o=Object.entries(t).filter(Nn),i=o.map(S(0)),s=o.map(S(1));return n?new Function(...i,"return ("+e+") => {"+(r||"")+"}").apply(n,s):new Function(...i,"return function("+e+"){"+(r||"")+"}").apply(null,s)}var se="",ae={};function ht(t,e,r,n={},o){let i=se+(n.nostrict?"":'"use strict";')+se+"const {"+r.join(",")+"} = arguments[0];"+se+(n.nostrict?"with(data) ":"")+"return args`"+t+"`;\n";return ae[i]?ae[i]:ae[i]=ie(e,"",i)}var z={updateEvent:!1};var Ut=">";var _=[],Gt;function Bn(t){let e,r,n=-1;for(;_[++n];)_[n].update();Gt=void 0,_.length=0}function Ze(t){return Gt===void 0&&(Gt=requestAnimationFrame(Bn)),_.push(t),Gt}function je(t){let e=_.indexOf(t);return e>0&&_.splice(e,1),t}var tr=t=>typeof t;var On=/\s*(\([\w,\s]*\))/,Sn=/function(?:\s+\w+)?\s*(\([\w,\s]*\))/,er=d(tr,{boolean:p,function:t=>t.prototype?(t.name||"function")+(Sn.exec(t.toString())||[])[1]:(On.exec(t.toString())||[])[1]+" ⇒ {…}",number:t=>Number.isNaN(t)?"":Number.isFinite(t)?t+"":t<0?"-∞":"∞",string:p,symbol:t=>t.toString(),undefined:t=>"",object:d(t=>t&&t.constructor.name,{Array:t=>t.map(er).join(""),RegExp:t=>"/"+t.source+"/",Stream:()=>"",null:()=>"",default:t=>JSON.stringify(t,null,2)}),default:JSON.stringify}),q=er;var At=Symbol("stopables"),ue={attribute:0,property:0,token:0,text:0,remove:0,add:0},Un={renderCount:{writable:!0},status:{writable:!0}};function rr(t){t.stop()}function Gn(t){t.cancelled=!0}function nr(t){t&&(t.forEach(Gn),t.length=0)}function Ct(t,e,r,n,o,i=!1){if(o&&typeof o=="object"){let s=f.objectOf(o);if(typeof s.then=="function"){let a=t.promises||(t.promises=[]);r[n]="",s.then(c=>{if(!s.cancelled)return Qt(a,s),Ct(t,e,r,n,c,!0)}),a.push(s);return}if(typeof s.pipe=="function"){let a=t.streams||(t.streams=[]);r[n]="";let c=!1;s.pipe({push:U=>Ct(t,e,r,n,U,c)}),c=!0,a.push(s);return}if(typeof s.length=="number"){let a=s.length;for(;a--;)Ct(t,e,s,a,s[a])}}r[n]=o,i&&t.render.apply(t,e)}function An(t,e){let r=e[0];t.singleExpression===void 0&&(t.singleExpression=r.length===2&&!/\S/.test(r[0])&&!/\S/.test(r[1]));let n=0;for(;r[++n]!==void 0;)Ct(t,e,e,n,e[n]);t.render.apply(t,e)}var gt,wt,b=class{constructor(e,r,n,o,i,s){h(this,gt,void 0);h(this,wt,void 0);Object.defineProperties(this,Un),w(this,gt,e),w(this,wt,r),this.consts=n,this.element=o,this.renderCount=0,this.status="idle"}evaluate(){let e=l(this,gt).value;if(e)return this.consts.data=f.of(e),this.consts.DATA=f.objectOf(e),this.consts.element=this.element,++this.renderCount,An(this,l(this,wt).call(this,this.consts))}invalidate(){if(this.status!=="done"){if(this.status==="cued"){console.warn(this.constructor.name+" "+this.template+" "+this.path+" already cued");return}Ze(this),this.status="cued"}}update(){return nr(this.promises),u.evaluate(this,this.evaluate),this.status="idle",this}stop(){if(this.status==="done")return this;this.status==="cued"&&je(this),nt.prototype.stop.apply(this),nr(this.promises),this.streams&&this.streams.forEach(rr);let e=this[At];return e&&(this[At]=void 0,e.forEach(rr)),this}done(e){return this.status==="done"?(e.stop(),this):((this[At]||(this[At]=[])).push(e),this)}};gt=new WeakMap,wt=new WeakMap,x(b,"consts",["DATA","data","element","shadow","host"]);var Cn=Array.prototype;function Lt(t){return Cn.indexOf.apply(t.parentNode.childNodes,arguments)}function or(t){return t.nodeType===1}function ce(t){return t.nodeType===3}function ir(t){return t.nodeType===8}function sr(t){return t.nodeType===11}var ar=R(function(e){return Nt(e).then(r=>{let n=new URL(e,window.location),o=n.hash?r.querySelector(n.hash):r;return{id:e,content:o.content||o}})});function ur(t,e,r,n){let o=D.fromTemplate(t,r,n,e);return e.each(i=>o.push(i)),o.done(e),o}function Rt(t,e,r,n){let o=f.objectOf(e);if(/^#/.test(t)){let a=re(t),c=typeof o=="string"?ne(o):o&&o.then?o:null;return c?c.then(U=>D.fromTemplate(a,r,n,U)):o&&o.pipe?ur(a,o,r,n,options):D.fromTemplate(a,r,n,e)}let i=ar(t),s=typeof o=="string"?ne(o):(o&&o.then,o);return o&&o.pipe?i.then(a=>ur(a,e,r,n,options)):Promise.all([i,s]).then(([a,c])=>D.fromTemplate(a,r,n,c))}function le(t,e){if(t===e){e.remove();return}let r=new Range;r.setStartBefore(t),r.setEndBefore(e),r.deleteContents()}var Ln=Object.assign;function cr(t){t&&typeof t=="object"&&t.stop&&t.stop()}function lr(t,e){let r=t.nodeValue;r?r!==e&&(t.nodeValue=e):e&&(t.nodeValue=e)}function fr(t){return t.content?fr(t.content):t}function pr(t,e,r){let{string:n,contents:o}=t;if(!(e instanceof D)&&!(e instanceof Node)&&!Array.isArray(e))return t.string+=q(e),r;if(n){if(++r<o.length-1&&ce(o[r]))lr(o[r],n);else{let i=document.createTextNode(n);o[r].before(i),o.splice(r,0,i)}t.string=""}if(e===o[++r])return r;if(--r,Array.isArray(e)){let i=-1;for(;++i<e.length;)r=pr(t,e[i],r);return r}return e instanceof D?(o[++r].before(fr(e)),o.splice(r,0,e),r):sr(e)?(console.log("TODO"),r):((ce(e)||or(e)||ir(e))&&(o[++r].before(e),o.splice(r,0,e)),r)}var M=class extends b{constructor(e,r,n,o,i,s){let a=Ln({},n,{include:(c,U)=>U===void 0?B=>Rt(c,B,this.element,this.consts):Rt(c,U,this.element,this.consts),print:(...c)=>oe(this,...c)});super(e,r,a,o,i,s),this.contents=[i],this.string="",u.evaluate(this,this.evaluate)}get firstNode(){return this.contents[0].firstNode?this.contents[0].firstNode:this.contents[0]}get lastNode(){return this.contents[this.contents.length-1]}evaluate(){if(!1)try{}catch(e){}return super.evaluate()}render(e){let r=this.contents,n=r[r.length-1];this.string="";let o=-1,i=-1;for(;++o<e.length-1;)this.string+=e[o],i=pr(this,arguments[o+1],i);if(lr(n,this.string+e[o]),r[++i]!==n){let s=r[i].firstNode||r[i];le(s,n),r.splice(i,r.length-i-1).forEach(cr)}}stop(){return this.contents.forEach(cr),this.contents.length=0,super.stop.apply(this)}};x(M,"consts",["DATA","data","element","shadow","host","include","print"]);var Rn=/\$\{/;function xt(t){return t&&Rn.test(t)}var K={"accept-charset":"acceptCharset",accesskey:"accessKey",cellpadding:"cellPadding",cellspacing:"cellSpacing",class:"classList",codebase:"codeBase",colspan:"colSpan",datetime:"dateTime",for:"htmlFor",form:null,formaction:"formAction",formenctype:"formEnctype",formmethod:"formMethod",formnovalidate:"formNoValidate",formtarget:"formTarget",frameborder:"frameBorder",httpequiv:"httpEquiv",longdesc:"longDesc",maxlength:"maxLength",minlength:"minLength",nohref:"noHref",noresize:"noResize",noshade:"noShade",nowrap:"noWrap",novalidate:"noValidate",readonly:"readOnly",rowspan:"rowSpan",tabindex:"tabIndex",tfoot:"tFoot",thead:"tHead",usemap:"useMap",valign:"vAlign",valuetype:"valueType"};var qn=Object.getOwnPropertyDescriptor,kn=Object.getPrototypeOf;function dr(t,e){let r=qn(e,t);return r?r.set||r.writable:dr(t,kn(e))}function Pn(t,e,r){if(t[e]===r)return 0;t[e]=r}function Mn(t,e,r){if(r===t.getAttribute(e))return 0;t.setAttribute(e,r)}function yt(t){let e=t[0],r=0,n=e[r];for(;e[++r]!==void 0;)n+=q(t[r]),n+=e[r]}var qt=class qt extends b{constructor(e,r,n,o,i,s){super(e,r,n,o,i,s),this.name=i;let a=i in K?K[i]:i;a&&a in o&&dr(a,o)&&(this.property=a),this.constructor===qt&&u.evaluate(this,this.evaluate)}evaluate(){if(!1)try{}catch(e){}return super.evaluate()}render(e){let r=this.singleExpression?arguments[1]:yt(arguments);return this.property?Pn(this.element,this.property,r):Mn(this.element,this.name,r)}};x(qt,"consts",b.consts);var m=qt;function Fn(t,e,r){t[e]!==!!r&&(t[e]=!!r,window.DEUBG&&++ue.property)}function Vn(t,e,r){if(t.getAttribute(e)!==null){if(r)return;t.removeAttribute(e),window.DEUBG&&++ue.attribute;return}r&&t.setAttribute(e,e)}function fe(t){let e=t[0],r=0;if(/\S/.test(e[r]))return!0;for(;e[++r]!==void 0;)if(t[r]||/\S/.test(e[r]))return!0;return!1}var Q=class extends m{constructor(e,r,n,o,i,s){super(e,r,n,o,i,s),u.evaluate(this,this.evaluate)}render(e){let r=this.singleExpression?arguments[1]:fe(arguments);return this.property?Fn(this.element,this.property,r):Vn(this.element,this.name,r)}};x(Q,"consts",m.consts);function $n(t,e,r){return typeof e.set=="function"?e.set(t,r):e[t]=r}var Hn=g($n,!0);var hr=Array.prototype,Y=Symbol("value"),Xn={"select-one":!0,"select-multiple":!0,checkbox:!0,radio:!0,undefined:!0};function vt(t){return Y in t?t[Y]:"value"in t?t.value:t.getAttribute("value")||void 0}var pe=d(S("type"),{"select-one":t=>t.selectedIndex>-1?vt(t.options[t.selectedIndex]):void 0,"select-multiple":t=>hr.filter.call(t.options,S("selected")).map(vt),checkbox:vt,radio:vt,number:t=>Number(t.value),range:t=>Number(t.value),default:t=>t.value}),Wn={number:"number",range:"number"};function mr(t,e){if(document.activeElement===t)return 0;let r=Xn[t.type];if(r&&Y in t&&t[Y]===e)return;let n=Wn[t.type];if(n&&typeof e!==n)return;r&&(t[Y]=e);let o=q(e);o!==t.value&&("value"in t?t.value=o:t.setAttribute("value",o),z.updateEvent&&J(z.updateEvent,t))}var In=d(S("type"),{"select-one":(t,e)=>{if(typeof e=="string"||typeof e=="number")return mr(t,e);let r=hr.find.call(t.options,n=>e===vt(n));r&&!r.selected&&(r.selected=!0)},default:mr});function Jn(t){delete t[Y]}var zn=d(S("type"),{number:Number,range:Number,default:p}),Z=class extends m{constructor(e,r,n,o,i,s){super(e,r,n,o,"value",s),u.evaluate(this,this.evaluate)}render(e){let r=zn(this.element.type,this.singleExpression?arguments[1]:yt(arguments));return In(this.element,r)}stop(){return Jn(this.element),super.stop()}};x(Z,"consts",["data","DATA","element","host","shadow","bind"]);function _n(t){return""+t}function Kn(t,e,r){let n=typeof e=="boolean"?e:r?t.type==="checkbox"&&e&&e.map?e.map(_n).includes(pe(t)):e+""===t.value:!!e;n!==t.checked&&(t.checked=n,z.updateEvent&&J(z.updateEvent,node))}var j=class extends m{constructor(e,r,n,o,i,s){super(e,r,n,o,"checked",s),this.hasValue=W(o.getAttribute("value")),u.evaluate(this,this.evaluate)}render(e){let r=this.singleExpression?!!arguments[1]:fe(arguments);return Kn(this.element,r,this.hasValue)}};x(j,"consts",["data","DATA","element","host","shadow","bind"]);function de(t){return t.replace(/-+(\w)/g,function(e,r){return r.toUpperCase()})}var tt=class extends m{constructor(e,r,n,o,i,s){super(e,r,n,o,i,s),this.property=de(i.replace(/^data-/,"")),u.evaluate(this,this.evaluate)}render(e){return this.element.dataset[this.property]=this.singleExpression?arguments[1]:yt(arguments)}};x(tt,"consts",m.consts);var Gu=Array.prototype;function Qn(t,e,r,n=0){let o=e.length;for(;o--;)r.includes(e[o])&&e.splice(o,1);e.length&&t.remove.apply(t,e),r.length&&t.add.apply(t,r)}var et=class extends m{constructor(e,r,n,o,i,s){super(e,r,n,o,i,s),this.list=o[this.property],this.tokens=ct,u.evaluate(this,this.evaluate)}render(e){if(this.renderCount===1){let i=e.join(" ").trim();if(i){let s=i.split(/\s+/);this.list.add.apply(this.list,s)}}let r=0,n="";for(;e[++r]!==void 0;){let i=q(arguments[r]);i&&(n+=" "+i)}let o=n?n.trim().split(/\s+/):ct;Qn(this.list,this.tokens,o),this.tokens=o}};x(et,"consts",m.consts);function kt(t,e,r,n,o,i){let s=r.value;if(!xt(s))return;let a=r.localName,c=e.tagName.toLowerCase(),U=/-/.test(c)||e.getAttribute("is"),B=a in K?K[a]:a,Ft=/^data-/.test(a)?tt:B in e?B==="value"?Z:B==="checked"?j:typeof e[B]=="boolean"?Q:typeof e[B]=="object"&&e[B].add&&e[B].remove?et:m:m,xe={path:n,name:a,source:s,Renderer:Ft,upgradeable:U,template:i};if(!1)try{}catch(no){}else xe.literal=ht(s,Bt,Ft.consts,o);return t.push(xe),e.removeAttribute(a),t}function he(t,e,r,n,o){let i=Array.from(e.childNodes);if(i){let s=-1;for(;i[++s];){if(i[s].content){let a=i[s],c=a.content;c.childNodes.length&&(i.splice(s,1,...c.childNodes),a.before(c),a.remove())}gr(t,i[s],r,n,o)}}return t}function me(t,e,r,n,o){let i=Array.from(e.attributes),s=-1,a;for(;a=i[++s];)kt(t,e,a,r,n,o);return t}var Yn=d((t,e)=>e.tagName.toLowerCase(),{defs:p,template:p,script:me,textarea:(t,e,r,n,o)=>(me(t,e,r,n,o),kt(t,e,{localName:"value",value:e.textContent},r,n,o),e.textContent="",t),default:(t,e,r,n,o)=>(he(t,e,r,n,o),me(t,e,r,n,o),t)}),gr=d((t,e)=>dt(e),{comment:p,doctype:p,document:he,fragment:he,element:(t,e,r,n,o)=>(Yn(t,e,(r?r+Ut:"")+Lt(e),n,o),t),text:(t,e,r,n,o)=>{let i=e.nodeValue;if(!xt(i))return t;let s=lt(i),a={template:o,path:r,name:Lt(e),source:s,Renderer:M};if(!1)try{}catch(Ft){}else a.literal=ht(s,Bt,M.consts,n);return e.nodeValue="",t.push(a),t}}),wr=gr;function ge(t,e,r){return wr([],t,"",e,r)}var Zn=Object.assign;var we={};var jn={};function to(t,e){return t.childNodes[e]}function eo(t,e){return t.split(Ut).reduce(to,e)}function xr(t,e,r){if(t===e){r.prepend(e);return}let n=new Range;n.setStartBefore(t),n.setEndAfter(e);let o=n.extractContents();r.appendChild(o)}var rt,Et,A,Pt,yr,Mt,vr,F=class F{constructor(e,r,n=template.parentElement,o={},i,s=jn){h(this,Pt);h(this,Mt);h(this,rt,void 0);h(this,Et,void 0);h(this,A,void 0);let a=e.childNodes;w(this,A,u.of(f.objectOf(i))),w(this,rt,a[0]),w(this,Et,a[a.length-1]),this.content=e,this.element=n,this.consts=o,this.contents=r.map(V(this,Pt,yr),this).map(V(this,Mt,vr),this)}static compile(e,r,n){return we[e]?we[e]:we[e]=ge(r,n)}static isTemplate(e){return e instanceof F}static fromHTML(e){return F.fromTemplate(O("template",e))}static fromFragment(e,r,n,o={},i,s){let a=F.compile(e,r,s);return new F(r.cloneNode(!0),a,n,o,i,s)}static fromTemplate(e,r,n={},o){let i=ft(e,"literal-"),s=e.content,a={nostrict:e.hasAttribute&&e.hasAttribute("nostrict")};return F.fromFragment("#"+i,s,r,n,o,a)}get firstNode(){let e=this.contents&&this.contents[0];return e&&l(this,rt)===e.lastNode?e.firstNode:l(this,rt)}get lastNode(){return l(this,Et)}get data(){let e=l(this,A).value;return f.of(e)||e}push(e){if(this.status==="done")throw new Error("Renderer is done, cannot .push() data");if(e=f.objectOf(e),l(this,A).value!==e)return l(this,A).value===null&&e!==null&&this.lastNode.before(this.content),l(this,A).value=e,e===null&&(this.firstNode!==this.lastNode&&xr(this.firstNode,this.lastNode.previousSibling,this.content),this.lastNode.textContent=""),this.content}before(){let e=this.firstNode,r=this.lastNode;if(this.content.lastChild===r)throw new Error("Illegal Literal.before() – template is not in the DOM");return this.content.firstChild===e?r.before.apply(r,arguments):e.before.apply(e,arguments)}remove(){let e=this.firstNode,r=this.lastNode;if(this.content.lastChild!==r){if(this.content.firstChild===e){this.content.appendChild(r);return}xr(e,r,this.content)}}};rt=new WeakMap,Et=new WeakMap,A=new WeakMap,Pt=new WeakSet,yr=function(e){let{path:r,name:n}=e,o=r?eo(r,this.content):this.element,i=typeof n=="number"?r?o.childNodes[n]:this.content.childNodes[n]:n;return{element:o,node:i,compiled:e}},Mt=new WeakSet,vr=function({element:e,node:r,compiled:n}){let{Renderer:o,literal:i}=n,s=new o(l(this,A),i,this.consts,e,r,n);return this.done(s),s};var D=F;Zn(D.prototype,{stop:b.prototype.stop,done:b.prototype.done});export{d as a,u as b,f as c,R as d,O as e,Qt as f,ut as g,Ge as h,Bt as i,Pi as j,ne as k,Dn as l,ae as m,z as n,de as o,D as p};

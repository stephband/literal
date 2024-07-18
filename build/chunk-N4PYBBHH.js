/* Literal 
   0.9.0
   By Stephen Band */

var ce=Object.defineProperty;var ir=(t,e,r)=>e in t?ce(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r;var le=(t,e)=>{for(var r in e)ce(t,r,{get:e[r],enumerable:!0})};var g=(t,e,r)=>(ir(t,typeof e!="symbol"?e+"":e,r),r),Ft=(t,e,r)=>{if(!e.has(t))throw TypeError("Cannot "+r)};var x=(t,e,r)=>(Ft(t,e,"read from private field"),r?r.call(t):e.get(t)),y=(t,e,r)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,r)},E=(t,e,r,o)=>(Ft(t,e,"write to private field"),o?o.call(t,r):e.set(t,r),r);var W=(t,e,r)=>(Ft(t,e,"access private method"),r);function N(){}var $t=!1;var B,pe=0;function fe(t,e){let r=0;for(;e[--r]&&e[r]!==t;);for(e[r]=t,r=-1;t[++r]&&t[r]!==e;);t[r]=e,$t&&console.log("%cSignal%c connect%c "+t.constructor.name+"["+t.id+"] - "+e.constructor.name+"["+e.id+"]","color: #718893; font-weight: 300;","color: #3896BF; font-weight: 300;","color: #718893; font-weight: 300;")}function me(t){let e=-1,r;for(;r=t[++e];)t[e]=void 0,r.invalidate(t)}function de(t,e){let r=0;for(;t[--r];)if(t[r]===e)return!0;return!1}var c=class{static of(e){return new rt(e)}static from(e){if(e.then){let r=new rt;return e.then(o=>r.value=o),r}else if(e.pipe){let r=new rt;return e.pipe({push:o=>r.value=o}),r}else return new Ht(e)}static observe(e,r,o){return new ot(e,r,o)}static evaluate(e,r){let o=B;B=e,$t&&console.group("%cSignal%c evaluate%c "+B.constructor.name+"["+B.id+"]","color: #718893; font-weight: 300;","color: #3896BF; font-weight: 300;","color: #718893; font-weight: 300;");let n=r.apply(e);return B=o,n}static get evaluating(){return B}constructor(){$t&&(this.id=++pe)}valueOf(){return this.value}toString(){return this.value+""}toJSON(){return this.value}},F,rt=class extends c{constructor(r){super();y(this,F,void 0);E(this,F,r)}get value(){return B&&fe(this,B),x(this,F)}set value(r){x(this,F)!==r&&(E(this,F,r),me(this))}};F=new WeakMap;var $,X,nt,Ht=class extends c{constructor(r){super();y(this,$,void 0);y(this,X,void 0);y(this,nt,void 0);r&&E(this,nt,r)}get value(){return B&&fe(this,B),x(this,$)?x(this,X):(E(this,X,c.evaluate(this,x(this,nt))),E(this,$,!0),x(this,X))}invalidate(r){if(!x(this,$)||r&&!de(this,r))return;E(this,$,!1);let o=0;for(;this[--o];)this[o]=void 0;me(this)}};$=new WeakMap,X=new WeakMap,nt=new WeakMap;var sr=Promise.resolve(),it,_,st,Wt,ot=class{constructor(e,r,o){y(this,st);y(this,it,void 0);y(this,_,void 0);this.id=++pe,E(this,it,e),E(this,_,r);let n=c.evaluate(this,W(this,st,Wt));e.value!==o&&x(this,_).call(this,n)}invalidate(e){if(this.status==="done"||e&&!de(this,e))return;let r=0;for(;this[--r];)this[r]=void 0;sr.then(()=>x(this,_).call(this,c.evaluate(this,W(this,st,Wt))))}stop(){return this.status==="done"?this:(this.status="done",this)}};it=new WeakMap,_=new WeakMap,st=new WeakSet,Wt=function(){return x(this,it).value};var ar=Object.assign,ur=Object.defineProperties,cr=Object.isExtensible,lr=Object.prototype,H=Symbol("signals"),he={[H]:{}};function pr(t){return t&&cr(t)&&!Node.prototype.isPrototypeOf(t)&&(window.BaseAudioContext===void 0||!BaseAudioContext.prototype.isPrototypeOf(t))&&!(t instanceof Date)&&!(t instanceof RegExp)&&!(t instanceof Map)&&!(t instanceof WeakMap)&&!(t instanceof Set)&&!(window.WeakSet&&t instanceof WeakSet)&&!ArrayBuffer.isView(t)}function ge(t,e,r){return t[e]||(t[e]=c.of(r))}function fr(t,e,r){let o=Object.getOwnPropertyDescriptor(r,e);return!(o?o.writable||o.set:r[e]===void 0)||!c.evaluating?r[e]:ge(t,e,r[e]).value}function mr(t){return m(t)&&t[H]}function we(t){this.signals={},this.object=t,this.data=new Proxy(t,this),he[H].value=this,ur(t,he)}ar(we.prototype,{get:function(e,r,o){if(typeof r=="symbol"||r==="__proto__")return e[r];let n=fr(this.signals,r,e);return lr.hasOwnProperty.call(e,r)&&m(n)||n},set:function(e,r,o,n){if(typeof r=="symbol"||r==="__proto__")return e[r]=o,!0;let i=m.objectOf(o);if(e[r]===o||e[r]===i)return!0;let s=e.length;return e[r]=i,this.signals[r]&&(this.signals[r].value=e[r]),r!=="length"&&e.length!==s&&this.signals.length&&(this.signals.length.value=e.length),!0},deleteProperty:function(t,e){return delete t[e],typeof e!="symbol"&&e!=="__proto__"&&this.signals[e]&&(this.signals[e].value=t[e]),!0}});function m(t,e){return t?t[H]?t[H].data:e||pr(t)?new we(t).data:void 0:void 0}m.of=m;m.signal=function(t,e){let r=mr(e);return r&&ge(r.signals,t,r.object[t])};m.objectOf=function(t){return t&&t[H]?t[H].object:t};var I={updateEvent:!1};var jt={};le(jt,{Data:()=>m,Signal:()=>c,arg:()=>at,assign:()=>Er,cache:()=>U,capture:()=>ve,ceil:()=>Or,choose:()=>J,entries:()=>Nr,exec:()=>ye,floor:()=>Sr,id:()=>f,isDefined:()=>j,keys:()=>Dr,last:()=>_t,matches:()=>be,noop:()=>N,nothing:()=>Ne,overload:()=>l,remove:()=>De,round:()=>Rr,set:()=>Jt,sum:()=>z,values:()=>Tr});function at(t){return function(){return arguments[t]}}function U(t){var e=new Map;return function(o){if(e.has(o))return e.get(o);var n=t(o);return e.set(o,n),n}}var dr=Array.prototype;function hr(t,e){return typeof t=="function"?t.apply(null,e):t}function xe(t,e,r){r=r||t.length;var o=r===1?e?t:U(t):U(function(n){return xe(function(){var i=[n];return i.push.apply(i,arguments),t.apply(null,i)},e,r-1)});return function n(i){return arguments.length===0?n:arguments.length===1?o(i):arguments.length>=r?t.apply(null,arguments):hr(o(i),dr.slice.call(arguments,1))}}var d=xe;function Xt(t,e,r){let o;typeof r!="string"&&r.input!==void 0&&r.index!==void 0&&(o=r,r=o.input.slice(r.index+r[0].length+(r.consumed||0)));let n=t.exec(r);if(!n)return;let i=e(n);return o&&(o.consumed=(o.consumed||0)+n.index+n[0].length+(n.consumed||0)),i}var ye=d(Xt,!0);function gr(t,e,r){throw r.input!==void 0&&r.index!==void 0&&(r=r.input),new Error('Cannot parse string "'+(r.length>128?r.length.slice(0,128)+"…":r)+'"')}function wr(t,e,r){let o=-1;for(;++o<r.length;)e=r[o]!==void 0&&t[o]?t[o](e,r):e;return t.done?t.done(e,r):t.close?t.close(e,r):e}function xr(t,e,r,o){let n=Xt(t,i=>wr(e,r,i),o);return n===void 0?e.catch?e.catch(r,o):gr(t,e,o):n}var ve=d(xr,!0);function J(t){return function(r,...o){var n=t[r]||t.default;return n&&n.apply(this,o)}}function f(t){return t}function j(t){return!!t||t!=null&&!Number.isNaN(t)}function _t(t){if(typeof t.length=="number")return t[t.length-1]}function yr(t,e){let r;for(r in t)if(t[r]!==e[r])return!1;return!0}var be=d(yr,!0);function T(){return this}var Ee=Object.create,vr=Object.freeze,Ne=vr(Ee(Ee(Object.prototype,{at:{value:N},shift:{value:N},push:{value:N},forEach:{value:N},join:{value:function(){return""}},every:{value:function(){return!0}},filter:{value:T},find:{value:N},findIndex:{value:function(){return-1}},flat:{value:T},flatMap:{value:T},includes:{value:function(){return!1}},indexOf:{value:function(){return-1}},map:{value:T},reduce:{value:at(1)},sort:{value:T},each:{value:T},pipe:{value:f},start:{value:T},stop:{value:T},done:{value:T},valueOf:{value:function(){return null}}}),{length:{value:0}}));function l(t,e){return function(){let o=t.apply(this,arguments),n=e[o]||e.default;if(!n)throw new Error('overload() no function defined for key "'+o+'"');return n.apply(this,arguments)}}function It(t,e){t.remove&&t.remove(e);let r;for(;(r=t.indexOf(e))!==-1;)t.splice(r,1);return t}var De=d(It,!0);function br(t,e,r){let o=t.replace(/([^.]+)\./g,(n,i)=>(e=e[i],""));return e[o]=r}var Jt=d(br,!0);function z(t,e){return e+t}var Er=Object.assign,Nr=Object.entries,Dr=Object.keys,Tr=Object.values,Or=Math.ceil,Sr=Math.floor,Rr=(t,e=1)=>Math.round(t/e)*e;var Qt={};le(Qt,{body:()=>eo,create:()=>A,decode:()=>ut,frame:()=>ro,getValue:()=>dt,identify:()=>ct,isTextNode:()=>K,parse:()=>lt,request:()=>Nt,root:()=>to,toNodeType:()=>pt,translate:()=>oo,trigger:()=>Y});var Br=l(f,{is:N,tag:N,data:function(t,e,r){for(t in r)r[t]===void 0&&delete r[t];Object.assign(e.dataset,r)},dataset:function(t,e,r){Object.assign(e.dataset,r)},html:function(t,e,r){e.innerHTML=r},text:function(t,e,r){e.textContent=r},children:function(t,e,r){e.innerHTML="",e.append.apply(e,r)},points:O,cx:O,cy:O,r:O,x:O,y:O,dx:O,dy:O,transform:O,preserveAspectRatio:O,viewBox:O,default:function(t,e,r){t in e?e[t]=r:e.setAttribute(t,r)}});function O(t,e,r){e.setAttribute(t,r)}function Ar(t,e){for(var r=Object.keys(e),o=r.length;o--;)Br(r[o],t,e[r[o]]);return t}var bt=d(Ar,!0);var zt="http://www.w3.org/2000/svg",Te=document.createElement("template"),Kt=(t,e)=>e&&typeof e;function Oe(t,e=""){let r=document.createRange();return r.selectNode(t),r.createContextualFragment(e)}var b=l(Kt,{string:function(t,e){let r=document.createElementNS(zt,t);return r.innerHTML=e,r},object:function(t,e){let r=document.createElementNS(zt,t);return typeof e.length=="number"?r.append.apply(r,e):bt(r,e),r},default:t=>document.createElementNS(zt,t)}),Lr=l(Kt,{string:function(t,e){let r=document.createElement(t);return r.innerHTML=e,r},object:function(t,e){let r=document.createElement(t);return typeof e.length=="number"?r.append.apply(r,e):bt(r,e),r},default:t=>document.createElement(t)}),Cr=l(f,{comment:function(t,e){return document.createComment(e||"")},fragment:l(Kt,{string:function(t,e,r){return r?Oe(r,e):(Te.innerHTML=e,Te.content.cloneNode(!0))},object:function(t,e,r){let o=r?Oe(r):document.createDocumentFragment();return typeof e.length=="number"?o.append.apply(o,e):bt(o,e),o},default:()=>document.createDocumentFragment()}),text:function(t,e){return document.createTextNode(e||"")},circle:b,ellipse:b,g:b,glyph:b,image:b,line:b,rect:b,use:b,path:b,pattern:b,polygon:b,polyline:b,svg:b,tspan:b,default:Lr}),A=Cr;var Se=document.createElement("textarea");function ut(t){return Se.innerHTML=t,Se.value}function ct(t,e="id-"){var r=t.id;if(!r){do r=e+Math.ceil(Math.random()*1e6);while(document.getElementById(r));t.id=r}return r}function K(t){return t.nodeType===3}var Gr={xml:"application/xml",html:"text/html",svg:"image/svg+xml"};function lt(t,e){if(e){var r=Gr[t.toLowerCase()]||t,o;try{o=new window.DOMParser().parseFromString(e,r)}catch{return}if(!o||o.getElementsByTagName("parsererror").length)throw new Error("Invalid "+t.toUpperCase()+": "+e);return o}}function Re(t){return lt("html",t)}function Be(t){return lt("svg",t)}var L=Object.assign,Q={headers:function(t){return{}},body:f},Ur=J({"application/x-www-form-urlencoded":function(t){return L(t,{"Content-Type":"application/x-www-form-urlencoded","X-Requested-With":"XMLHttpRequest"})},"application/json":function(t){return L(t,{"Content-Type":"application/json; charset=utf-8","X-Requested-With":"XMLHttpRequest"})},"multipart/form-data":function(t){return L(t,{"Content-Type":"multipart/form-data","X-Requested-With":"XMLHttpRequest"})},"audio/wav":function(t){return L(t,{"Content-Type":"audio/wav","X-Requested-With":"XMLHttpRequest"})},"image/png":function(t){return L(t,{"Content-Type":"image/png","X-Requested-With":"XMLHttpRequest"})},"image/jpg":function(t){return L(t,{"Content-Type":"image/jpg","X-Requested-With":"XMLHttpRequest"})},"image/jpeg":function(t){return L(t,{"Content-Type":"image/jpeg","X-Requested-With":"XMLHttpRequest"})},default:function(t){return L(t,{"Content-Type":"application/x-www-form-urlencoded","X-Requested-With":"XMLHttpRequest"})}}),qr=J({"application/json":function(t){return t.get?kr(t):JSON.stringify(t)},"application/x-www-form-urlencoded":function(t){return t.get?Le(t):Ce(t)},"multipart/form-data":function(t){return t.get?t:Mr(t)},default:f});function kr(t){return JSON.stringify(Array.from(t.entries()).reduce(function(e,r){return e[r[0]]=r[1],e},{}))}function Le(t){return new URLSearchParams(t).toString()}function Ce(t){return Object.keys(t).reduce((e,r)=>(e.append(r,t[r]),e),new URLSearchParams)}function Mr(t){throw new Error("TODO: dataToFormData(data)")}function Vr(t,e){return e instanceof FormData?t+"?"+Le(e):t+"?"+Ce(e)}function Pr(t,e,r,o){let n=typeof r=="string"?r:r&&r["Content-Type"]||"application/json",i=Ur(n,L(Q.headers&&e?Q.headers(e):{},typeof r=="string"?{}:r)),s={method:t,mode:"cors",headers:i,credentials:"same-origin",signal:o&&o.signal};return t!=="GET"&&(s.body=qr(n,Q.body?Q.body(e):e)),s}function Et(t){return t.blob()}function Fr(t){return t.json().catch(e=>{throw new Error("Cannot parse JSON "+t.url+". "+e.message)})}function Ae(t){return t.formData()}function $r(t){return t.text()}function Hr(t){return t.text().then(e=>/^\s*<!DOCTYPE html>/.test(e)?Re(e):A("fragment",e))}function Wr(t){return t.text().then(e=>/^\s*<\?xml/.test(e)?Be(e):(console.warn("Untested SVG fragment parsing in request.js!"),A("fragment",e)))}var Xr={"text/plain":$r,"text/html":Hr,"image/svg+xml":Wr,"application/json":Fr,"multipart/form-data":Ae,"application/x-www-form-urlencoded":Ae,audio:Et,"audio/wav":Et,"audio/m4a":Et,"application/zip":Et};function _r(t){if(Q.onresponse&&(t=Q.onresponse(t)),!t.ok)throw new Error(t.statusText+"");let e=t.headers.get("Content-Type");if(!e)return;let r=e.replace(/\;.*$/,"");return Xr[r](t)}function Nt(t="GET",e,r={},o="application/json"){t=t.toUpperCase(),t==="GET"&&r&&(e=Vr(e,r));let n=Pr(t,r,o,arguments[4]);return fetch(e,n).then(_r)}function Dt(t){return Nt("GET",t)}var Ir={1:"element",3:"text",8:"comment",9:"document",10:"doctype",11:"fragment"};function pt(t){return Ir[t.nodeType]}var Jr=Object.assign,ft={bubbles:!0,cancelable:!0};function jr(t,e){let r=ft,o,n,i,s,a,u;return typeof t=="object"?({type:t,detail:n,bubbles:i,cancelable:s,composed:a,...o}=t,u=Jr(new CustomEvent(t,{detail:n,bubbles:i||ft.bubbles,cancelable:s||ft.cancelable,composed:a||ft.composed}),o)):u=new CustomEvent(t,ft),e.dispatchEvent(u)}var Y=d(jr,!0);function zr(t,e){return e[t]}var C=d(zr,!0);var Ge=t=>typeof t;var Kr=/\s*(\([\w,\s]*\))/,Qr=/function(?:\s+\w+)?\s*(\([\w,\s]*\))/,Ue=l(Ge,{boolean:f,function:t=>t.prototype?(t.name||"function")+(Qr.exec(t.toString())||[])[1]:(Kr.exec(t.toString())||[])[1]+" ⇒ {…}",number:t=>Number.isNaN(t)?"":Number.isFinite(t)?t+"":t<0?"-∞":"∞",string:f,symbol:t=>t.toString(),undefined:t=>"",object:l(t=>t&&t.constructor.name,{Array:t=>t.map(Ue).join(""),RegExp:t=>"/"+t.source+"/",Stream:()=>"",null:()=>"",default:t=>JSON.stringify(t,null,2)}),default:JSON.stringify}),S=Ue;var ke=Array.prototype,Z=Symbol("literal-value"),Yr={"select-one":!0,"select-multiple":!0,checkbox:!0,radio:!0,undefined:!0};function mt(t){return Z in t?t[Z]:"value"in t?t.value:t.getAttribute("value")||void 0}var dt=l(C("type"),{"select-one":t=>t.selectedIndex>-1?mt(t.options[t.selectedIndex]):void 0,"select-multiple":t=>ke.filter.call(t.options,C("selected")).map(mt),checkbox:mt,radio:mt,number:t=>Number(t.value),range:t=>Number(t.value),default:t=>t.value}),Zr={number:"number",range:"number"};function qe(t,e){if(document.activeElement===t)return 0;let r=Yr[t.type];if(r&&Z in t&&t[Z]===e)return 0;let o=Zr[t.type];if(o&&typeof e!==o)return 0;r&&(t[Z]=e);let n=S(e);return n===t.value?0:("value"in t?t.value=n:t.setAttribute("value",n),I.updateEvent&&Y(I.updateEvent,t),1)}var Me=l(C("type"),{"select-one":(t,e)=>{if(typeof e=="string"||typeof e=="number")return qe(t,e);let r=ke.find.call(t.options,o=>e===mt(o));return r&&!r.selected?(r.selected=!0,1):0},default:qe});function Ve(t){delete t[Z]}var to=document.documentElement,eo=document.body,ro=window.requestAnimationFrame;function oo(t){return window.translations&&window.translations[t]||t}var Tt=Object.assign({},jt,Qt);var no='<a class="literal-link" href="https://stephen.band/literal/literal-html/">literal</literal>';function io(t){if(typeof t=="object"&&t.template)return"<strong>"+t.id+"</strong> "+t.template+" <small>&gt; "+t.path+'</small> <!--strong class="literal-count">'+t.count+"</strong-->";if(typeof t=="object"&&t.message)return'<code class="white-fg">'+t.message+"</code>";if(typeof t=="object")return"<code><strong>"+t.constructor.name+"</strong> "+JSON.stringify(t)+"</code>"}function so(t,e){let r=document.createElement("pre"),o="";return r.setAttribute("class","literal-error"),r.innerHTML="<strong>"+e.constructor.name+"</strong><code>"+e.message+"</code>",console.error(e),r}function ao(t,e){let r=t.path+(typeof t.name=="string"?">"+t.name:""),o=0,n="";for(;arguments[++o]!==void 0;)n+=io(arguments[o]);return A("pre",{class:"literal-print",html:"#"+t.template.id+" <small>"+(r?"&gt; "+r.replace(/>/g," &gt "):"")+'</small><span class="literal-count">'+t.renderCount+"</span>"+n+no})}function Yt(t,e){return e instanceof Error?so(t,e):ao(t,e)}var uo=Object.entries,Ot={};function co(t,[e,r]){let o=new URL(e,window.location);return Ot[o]=new URL(r,window.location),Ot}function _i(t){uo(t).reduce(co,Ot)}function Pe(t){let e=new URL(t,window.location);return Ot[e]||e}function St(t){var e={};return function(o){return o in e?e[o]:e[o]=t(o)}}var lo=/\.([\w-]+)(?:#|\?|$)/,po=[],fo=l(t=>(lo.exec(t.pathname)||po)[1],{js:St(t=>{let e=t.origin+t.pathname+t.search,r=t.hash.slice(1)||"default";return import(e).then(C(r))}),default:St(Dt)});function Zt(t){let e=Pe(t);return fo(e)}function mo(t){let e=t[0];return/^\w/.test(e)}function te(t={},e,r,o){let n=Object.entries(t).filter(mo),i=n.map(C(0)),s=n.map(C(1));return o?new Function(...i,"return ("+e+") => {"+(r||"")+"}").apply(o,s):new Function(...i,"return function("+e+"){"+(r||"")+"}").apply(null,s)}var Rt=">";var Fe="";var ee={};function ht(t,e,r,o={},n){let i=`
`+Fe+(o.nostrict?"with(data) ":'"use strict";')+"return this.compose`"+t+"`;\n";return ee[i]?ee[i]:ee[i]=te(e,r,i)}var G={"accept-charset":"acceptCharset",accesskey:"accessKey",cellpadding:"cellPadding",cellspacing:"cellSpacing",class:"classList",codebase:"codeBase",colspan:"colSpan",datetime:"dateTime",for:"htmlFor",form:null,formaction:"formAction",formenctype:"formEnctype",formmethod:"formMethod",formnovalidate:"formNoValidate",formtarget:"formTarget",frameborder:"frameBorder",httpequiv:"httpEquiv",longdesc:"longDesc",maxlength:"maxLength",minlength:"minLength",nohref:"noHref",noresize:"noResize",noshade:"noShade",nowrap:"noWrap",novalidate:"noValidate",readonly:"readOnly",rowspan:"rowSpan",tabindex:"tabIndex",tfoot:"tFoot",thead:"tHead",usemap:"useMap",valign:"vAlign",valuetype:"valueType"};var tt=[],Bt;function ho(t){let e,r,o=-1;for(;tt[++o];)tt[o].update();Bt=void 0,tt.length=0}function $e(t){return Bt===void 0&&(Bt=requestAnimationFrame(ho)),tt.push(t),Bt}function He(t){let e=tt.indexOf(t);return e>0&&tt.splice(e,1),t}var At=Symbol("stopables"),p={attribute:0,property:0,token:0,text:0,remove:0,add:0},go=0;function We(t){t.stop()}function wo(t){t.cancelled=!0}function Xe(t){t&&(t.forEach(wo),t.length=0)}function Lt(t,e,r,o,n,i=!1){if(n&&typeof n=="object"){let s=m.objectOf(n);if(s.then){let a=t.promises||(t.promises=[]);r[o]="",s.then(u=>{if(!s.cancelled)return It(a,s),Lt(t,e,r,o,u,!0)}),a.push(s);return}if(s.pipe){let a=t.streams||(t.streams=[]);r[o]="";let u=!1;s.pipe({push:w=>Lt(t,e,r,o,w,u)}),u=!0,a.push(s);return}if(typeof s.length=="number"){let a=s.length;for(;a--;)Lt(t,e,s,a,s[a])}}r[o]=n,i&&t.render.apply(t,e)}var gt,D=class{constructor(e,r,o,n,i,s){y(this,gt,void 0);let a=this.constructor.parameterNames;this.id=++go,this.literal=r,this.element=n,this.status="idle",this.parameters=a.map(u=>o[u]),this.renderCount=0,E(this,gt,e)}evaluate(){let e=x(this,gt).value;if(!e)return;let r=this.parameters;return r[0]=m.of(e),r[1]=m.objectOf(e),r[2]=this.element,++this.renderCount,this.literal.apply(this,r)}invalidate(){if(this.status!=="done"){if(this.status==="cued"){console.trace("Renderer already cued.");return}$e(this),this.status="cued"}}update(){return Xe(this.promises),c.evaluate(this,this.evaluate),this.status="idle",this}compose(e){this.singleExpression===void 0&&(this.singleExpression=e.length===2&&!/\S/.test(e[0])&&!/\S/.test(e[1]));let r=0;for(;e[++r]!==void 0;)Lt(this,arguments,arguments,r,arguments[r]);return this.render.apply(this,arguments)}stop(){if(this.status==="done")return this;this.status==="cued"&&He(this),ot.prototype.stop.apply(this),Xe(this.promises),this.streams&&this.streams.forEach(We);let e=this[At];return e&&(this[At]=void 0,e.forEach(We)),this}done(e){return this.status==="done"?(e.stop(),this):((this[At]||(this[At]=[])).push(e),this)}};gt=new WeakMap,g(D,"parameterNames",["data","DATA","element","host","shadow"]);function _e(t,e){return e===""||e===void 0?t:t+e}function xo(t,e,r){return t&&typeof t=="object"?t.find?e+t.map(S).reduce(_e):e+S(t):e+S(t)}function wt(t){return t[0].map((r,o)=>o<=t.length?xo(t[o+1],r,S):r===""?void 0:r).reduce(_e)}var yo=Object.getOwnPropertyDescriptor,vo=Object.getPrototypeOf;function Ie(t,e){let r=yo(e,t);return r?r.set||r.writable:Ie(t,vo(e))}function bo(t,e,r){return t[e]===r?0:(t[e]=r,1)}function Eo(t,e,r){return r===t.getAttribute(e)?0:(t.setAttribute(e,r),1)}var h=class extends D{constructor(e,r,o,n,i,s){super(e,r,o,n,i,s),this.name=i,this.property=i in G?G[i]:i,this.writable=i in G?!!G[i]:i in n&&Ie(i,n)}evaluate(){if(!1)try{}catch(e){}return super.evaluate()}render(){this.value=this.singleExpression?arguments[1]:wt(arguments),this.writable?p.property+=bo(this.element,this.property,this.value):p.attribute+=Eo(this.element,this.name,this.value)}};g(h,"parameterNames",D.parameterNames);function xt(t){return t=Array.from(t),t[0]=!!t[0].join(" ").trim().split(/\s+/).map(Boolean).reduce(z),!!t.map(Boolean).reduce(z)}function No(t,e,r){return t[e]===!!r?0:(t[e]=!!r,1)}function Do(t,e,r){return t.getAttribute(e)!==null?r?0:(t.removeAttribute(e),1):r?(t.setAttribute(e,e),1):0}var q=class extends h{constructor(e,r,o,n,i,s){super(e,r,o,n,i,s),c.evaluate(this,this.evaluate)}render(e){let r=xt(arguments);this.writable?p.property+=No(this.element,this.property,r):p.attribute+=Do(this.element,this.name,r)}};g(q,"parameterNames",h.parameterNames);function To(t,e,r){return typeof e.set=="function"?e.set(t,r):e[t]=r}var Oo=d(To,!0);function So(t){return""+t}function Ro(t,e,r){let o=typeof e=="boolean"?e:r?t.type==="checkbox"&&e&&e.map?e.map(So).includes(dt(t)):e+""===t.value:!!e;return o===t.checked?0:(t.checked=o,I.updateEvent&&Y(I.updateEvent,node),1)}var k=class extends h{constructor(e,r,o,n,i,s){super(e,r,o,n,"checked",s),this.hasValue=j(n.getAttribute("value")),c.evaluate(this,this.evaluate)}render(e){this.singleExpression?this.value=arguments[1]:this.value=xt(arguments),p.property+=Ro(this.element,this.value,this.hasValue)}};g(k,"parameterNames",["data","DATA","element","host","shadow","bind"]);var Bo=Array.prototype,Ao=[];function Lo(t,e,r,o=0){let n=e.length;for(;n--;)r.includes(e[n])&&e.splice(n,1);return e.length&&(t.remove.apply(t,e),++o),r.length&&(t.add.apply(t,r),++o),o}var M=class extends h{constructor(e,r,o,n,i,s){super(e,r,o,n,i,s),this.list=n[this.property],this.tokens=Ao,c.evaluate(this,this.evaluate)}render(e){let r=0;if(this.renderCount===1){let n=e.join(" ").trim();if(n){let i=n.split(/\s+/);this.list.add.apply(this.list,i),p.token+=i.length}}let o=Bo.slice.call(arguments,1).map(S).join(" ").trim().split(/\s+/).filter(n=>!!n);p.token+=Lo(this.list,this.tokens,o),this.tokens=o}};g(M,"parameterNames",h.parameterNames);function Ct(t){let e=t[0],r=0,o=e[r];for(;e[++r]!==void 0;)o+=t[r]+e[r];return Number(o)}var Co=l((t,e)=>e,{number:Ct,range:Ct,default:wt}),V=class extends h{constructor(e,r,o,n,i,s){super(e,r,o,n,"value",s),c.evaluate(this,this.evaluate)}render(e){this.value=this.singleExpression?arguments[1]:Co(arguments,this.element.type),p.property+=Me(this.element,this.value)}stop(){return Ve(this.element),super.stop()}};g(V,"parameterNames",["data","DATA","element","host","shadow","bind"]);function re(t){let e=t.slice(1),r=document.getElementById(e);if(!r)throw new Error("Template "+t+" not found");return r}var Je=U(function(e){return Dt(e).then(r=>{let o=new URL(e,window.location),n=o.hash?r.querySelector(o.hash):r;return{id:e,content:n.content||n}})});function je(t,e,r,o,n){let i=new R(t,r,o,n);return e.each(s=>i.push(s)),i.done(e),i}function oe(t,e,r,o,n){let i=m.objectOf(e);if(/^#/.test(t)){let u=re(t),w=typeof i=="string"?Zt(i):i&&i.then?i:null;return w?w.then(vt=>new R(u,r,o,vt,n)):i&&i.pipe?je(u,i,r,o,n):new R(u,r,o,i,n)}let s=Je(t),a=typeof i=="string"?Zt(i):(i&&i.then,i);return i&&i.pipe?s.then(u=>je(u,e,r,o,n)):Promise.all([s,a]).then(([u,w])=>new R(u,r,o,w,n))}var Go=Array.prototype;function Gt(t){return Go.indexOf.apply(t.parentNode.childNodes,arguments)}var Uo=Object.assign;function ze(t){t&&typeof t=="object"&&t.stop&&t.stop()}function qo(t){return t instanceof R||t instanceof Node?t:S(t)}function Ke(t,e){return typeof e=="object"?t.push(e):typeof t[t.length-1]=="string"?t[t.length-1]+=e:t.push(e+""),t}function Qe(t,e){return Array.isArray(e)?e.reduce(Qe,t):Ke(t,qo(e))}function ne(t,e){let r=t.nodeValue;if(r){if(r!==e)return t.nodeValue=e,1}else if(e)return t.nodeValue=e,1;return 0}function Ye(t){return t.content?Ye(t.content):t}function ko(t,e,r,o){let n=o.length-1;t.text+=ne(e,o[0]);let i=e.nextSibling,s=0;for(;++s<n;){let a=o[s];if(typeof a!="object"){i!==r&&K(i)?(t.text+=ne(i,a),i=i.nextSibling):(i.before(a),++t.add);continue}if(a instanceof R&&(i===a.first||i===a.last)){i=a.last.nextSibling;continue}if(i===a){i=i.nextSibling;continue}a.remove&&(t.remove+=a.remove()||0);let u=Ye(a);i.before(u),++t.add}for(;i!==r;){let a=i;i=i.nextSibling,a.remove(),++t.remove}return t.text+=ne(r,n<1?null:o[n]),t}var P=class extends D{constructor(e,r,o,n,i,s){let a=Uo({},o,{include:(u,w)=>this.include(u,w),print:(...u)=>Yt(this,...u)});super(e,r,a,n,i,s),this.contents=[],this.first=i,this.last=i.nextSibling,c.evaluate(this,this.evaluate)}include(e,r){return arguments.length===1?o=>this.include(e,o):oe(e,r,this.element,this.parameters)}evaluate(){if(!1)try{}catch(e){}return super.evaluate()}render(e){let r=0;for(this.contents.forEach(ze),this.contents.length=0,this.contents.push(e[r]);e[++r]!==void 0;)Qe(this.contents,arguments[r]),Ke(this.contents,e[r]);ko(p,this.first,this.last,this.contents)}stop(){return this.contents.forEach(ze),this.contents.length=0,super.stop.apply(this)}};g(P,"parameterNames",["data","DATA","element","host","shadow","include","print"]);D.create=function(e,r,o,n,i,s){let a=typeof i=="string"&&(G[i]||i);return a?a==="value"?new V(e,r,o,n,i,s):a==="checked"?new k(e,r,o,n,i,s):typeof n[a]=="boolean"?new q(e,r,o,n,i,s):typeof n[a]=="object"&&n[a].add&&n[a].remove?new M(e,r,o,n,i,s):new h(e,r,o,n,i,s):new P(e,r,o,n,i,s)};var Ut=D;var qt=[];function ie(t,e){qt.length=0;let r=t;for(;r!==e;){if(!r)throw new Error("getNodes(first, last) last not found after first");qt.push(r),r=r.nextSibling}return qt.push(e),qt}var Mo=/\$\{/;function yt(t){return t&&Mo.test(t)}function kt(t,e,r,o,n,i){let s=r.localName,a=r.value;if(!yt(a))return;let u={source:a,path:o,name:s},w=G[s]||s,vt=w==="value"?V:w==="checked"?k:typeof e[w]=="boolean"?q:typeof e[w]=="object"&&e[w].add&&e[w].remove?M:h;if(!1)try{}catch(Xo){}else u.literal=ht(a,Tt,vt.parameterNames.join(", "),n);return t.push(u),e.removeAttribute(s),t}function ae(t,e,r,o,n){let i=Array.from(e.childNodes);if(i){let s=-1;for(;i[++s];){if(i[s].content){let a=i[s],u=a.content;u.childNodes.length&&(i.splice(s,1,...u.childNodes),a.before(u),a.remove())}Ze(t,i[s],r,o,n)}}return t}function se(t,e,r,o,n){let i=Array.from(e.attributes),s=-1,a;for(;a=i[++s];)kt(t,e,a,r,o,n);return t}var Vo=l((t,e)=>e.tagName.toLowerCase(),{defs:f,template:f,script:se,textarea:(t,e,r,o,n)=>(se(t,e,r,o,n),kt(t,e,{localName:"value",value:e.textContent},r,o,n),e.textContent="",t),default:(t,e,r,o,n)=>(ae(t,e,r,o,n),se(t,e,r,o,n),t)}),Ze=l((t,e)=>pt(e),{comment:f,doctype:f,document:ae,fragment:ae,element:(t,e,r,o,n)=>(Vo(t,e,(r?r+Rt:"")+Gt(e),o,n),t),text:(t,e,r,o,n)=>{let i=e.nodeValue;if(!yt(i))return t;let s=ut(i),a={source:s,path:r,name:Gt(e)};if(!1)try{}catch(nr){}else a.literal=ht(s,Tt,P.parameterNames.join(", "),o);return t.push(a),e.after(document.createTextNode("")),t}}),tr=Ze;function ue(t,e,r){return tr([],t,"",e,r)}var er={},Mt=[],Po={};function Fo(t,e){return t.childNodes[e]}function $o(t,e){return t.split(Rt).reduce(Fo,e)}function Ho(t,e,r){let o=t.content||A("fragment",t.childNodes,t),n;return n=ue(o,r),{content:o,targets:n}}var et,Vt,rr,Pt,or,R=class{constructor(e,r=e.parentElement,o={},n,i=Po){y(this,Vt);y(this,Pt);y(this,et,void 0);g(this,"stop",Ut.prototype.stop);g(this,"done",Ut.prototype.done);let s=ct(e,"literal-"),a=er[s]||(er[s]=Ho(e,s,{nostrict:i.nostrict||e.hasAttribute&&e.hasAttribute("nostrict")})),u=a.content.cloneNode(!0);this.content=u,this.element=r,this.parameters=o,this.first=u.childNodes[0],this.last=u.childNodes[u.childNodes.length-1],E(this,et,c.of(m.of(n))),this.contents=a.targets.map(W(this,Vt,rr),this).map(W(this,Pt,or),this)}push(e){if(this.status==="done")throw new Error("Renderer is done, cannot .push() data");if(x(this,et).value=m.of(e),e===null){Mt.length=0;let r=this.first;for(;r!==this.last;)Mt.push(r),r=r.nextSibling;return this.content.prepend.apply(this.content,Mt),p.remove+=Mt.length,this}return this.content.lastChild&&this.last!==this.content.lastChild&&(this.last.before(this.content),p.add+=1),this}remove(){if(this.content.lastChild===this.last)return 0;let e=ie(this.first,this.last);return this.content.prepend.apply(this.content,e),p.remove+=e.length,e.length}replaceWith(){return this.content.lastChild===this.last?0:(this.last.after.apply(this.last,arguments),p.add+=arguments.length,this.remove())}};et=new WeakMap,Vt=new WeakSet,rr=function(e){let{path:r,name:o,literal:n,message:i,template:s}=e,a=r?$o(r,this.content):this.element,u=typeof o=="number"?r?a.childNodes[o]:this.content.childNodes[o]:o;return[x(this,et),n,this.parameters,a,u,e]},Pt=new WeakSet,or=function(e){let r=Ut.create(...e);return this.done(r),r};export{l as a,N as b,c,m as d,U as e,A as f,It as g,at as h,ve as i,_t as j,Ne as k,I as l,Tt as m,re as n,_i as o,Pe as p,Zt as q,ee as r,R as s};

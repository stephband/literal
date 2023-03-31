/* Literal 
   0.6.4
   By Stephen Band
   Built 2023-03-31 03:28 */

var ge=Object.getOwnPropertySymbols;var Cn=Object.prototype.hasOwnProperty,Un=Object.prototype.propertyIsEnumerable;var we=(t,e)=>{var o={};for(var r in t)Cn.call(t,r)&&e.indexOf(r)<0&&(o[r]=t[r]);if(t!=null&&ge)for(var r of ge(t))e.indexOf(r)<0&&Un.call(t,r)&&(o[r]=t[r]);return o};var Gn=Object.assign,Fn=Object.defineProperties,qn=Object.isExtensible,Hn=Object.prototype,k=Symbol("observe");function $n(t,e){let o=t.indexOf(e);return o>-1&&t.splice(o,1),t}var ye={[k]:{}};function rt(t,e){if(!t||!t.length)return 0;t=t.slice(0);for(var o=-1;t[++o];)t[o].status!=="stopped"&&t[o].push(e);return o}function be(t){this.observables={},this.gets=[],this.sets=void 0,this.target=t,this.observer=new Proxy(t,this),ye[k].value=this,Fn(t,ye)}Gn(be.prototype,{notify:function(t){rt(this.observables[t],this.target[t]),rt(this.sets,this.target)},listen:function(t,e){(t===null?this.sets||(this.sets=[]):this.observables[t]||(this.observables[t]=[])).push(e)},unlisten:function(t,e){let o=t===null?this.sets:this.observables[t];o&&$n(o,e)},get:function(e,o,r){let i=e[o];if(typeof o=="symbol"||o==="__proto__")return i;let s=Object.getOwnPropertyDescriptor(e,o);if((s?s.writable||s.set:i===void 0)&&rt(this.gets,o),!Hn.hasOwnProperty.call(e,o))return i;let c=D(i);if(!c)return i;for(var l=-1;this.gets[++l];)this.gets[l].listen(o);return c},set:function(e,o,r,i){if(typeof o=="symbol"||o==="__proto__")return e[o]=r,!0;let s=O(r);if(e[o]===r||e[o]===s)return!0;let u=e.length;for(var c=-1;this.gets[++c];)this.gets[c].unlisten(o);return e[o]=s,o!=="length"&&e.length!==u&&rt(this.observables.length,e.length),this.notify(o),!0},deleteProperty:function(t,e){return typeof e=="symbol"||e==="__proto__"?(delete t[e],!0):(t.hasOwnProperty(e)&&(delete t[e],this.notify(e)),!0)}});function it(t){return t&&qn(t)&&!Node.prototype.isPrototypeOf(t)&&(typeof BaseAudioContext>"u"||!BaseAudioContext.prototype.isPrototypeOf(t))&&!(t instanceof Date)&&!(t instanceof RegExp)&&!(t instanceof Map)&&!(t instanceof WeakMap)&&!(t instanceof Set)&&!(window.WeakSet&&t instanceof WeakSet)&&!ArrayBuffer.isView(t)}function D(t,e){return t?t[k]?t[k].observer:e||it(t)?new be(t).observer:void 0:void 0}function O(t){return t&&t[k]&&t[k].target||t}function P(t){return D(t)&&t[k]}function Lt(t){return function(){return arguments[t]}}function w(t){return t}function m(){}function b(){return this}var Vn=Object.create,Wn=Object.freeze;function zn(){return!0}function xe(){return-1}var v=Wn(Vn({shift:m,push:m,forEach:m,join:function(){return""},every:zn,filter:b,find:m,findIndex:xe,flat:b,flatMap:b,includes:function(){return!1},indexOf:xe,map:b,reduce:Lt(1),sort:b,each:b,pipe:w,start:b,stop:b,done:b,valueOf:function(){return null}},{length:{value:0}}));function T(t){var e=new Map;return function(r){if(e.has(r))return e.get(r);var i=t(r);return e.set(r,i),i}}var _n=Array.prototype;function In(t,e){return typeof t=="function"?t.apply(null,e):t}function ve(t,e,o){o=o||t.length;var r=o===1?e?t:T(t):T(function(i){return ve(function(){var s=[i];return s.push.apply(s,arguments),t.apply(null,s)},e,o-1)});return function i(s){return arguments.length===0?i:arguments.length===1?r(s):arguments.length>=o?t.apply(null,arguments):In(r(s),_n.slice.call(arguments,1))}}var g=ve;function L(t,e){t.remove&&t.remove(e);let o;for(;(o=t.indexOf(e))!==-1;)t.splice(o,1);return t}var ri=g(L,!0);function Ct(t){return t&&t[Symbol.iterator]}var Xn=Object.assign;function Jn(t){return t.stop?t.stop():t()}function V(){}Xn(V.prototype,{stop:function(){let t=this.stopables;return this.stopables=void 0,t&&t.forEach(Jn),this},done:function(t){return(this.stopables||(this.stopables=[])).push(t),this}});var B=Object.assign,N=Object.create;function Gt(t,e){t[0]=e,e.done(t)}function h(t,e){t&&t.push(e)}function y(t){V.prototype.stop.apply(t);let e=-1,o;for(;o=t[++e];)t[e]=void 0,o.stop()}function st(t){return p.prototype.isPrototypeOf(t)}function p(t){this.input=t}B(p.prototype,V.prototype,{push:function(t){h(this[0],t)},pipe:function(t){if(this[0])throw new Error("Stream: Attempt to .pipe() a unicast stream multiple times. Create a multicast stream with .broadcast().");return this[0]=t,t.done(this),this.input.pipe(this),t},map:function(t){return new Ee(this,t)},filter:function(t){return new Se(this,t)},split:function(t){return new Te(this,t)},flatMap:function(t){return new Oe(this,t)},slice:function(t,e){return new Ut(this,t,e)},take:function(t){return console.warn(".take(a) superseded by .slice(0, a)"),new Ut(this,0,t)},each:function(t){return this.pipe(new Ne(t))},reduce:function(t,e){return this.pipe(new De(t,e)).value},scan:function(t,e){return new Be(this,t,e)},stop:function(){return y(this),this}});function Ee(t,e){this.input=t,this.fn=e}Ee.prototype=B(N(p.prototype),{push:function(e){let r=this.fn(e);r!==void 0&&h(this[0],r)}});function Se(t,e){this.input=t,this.fn=e}Se.prototype=B(N(p.prototype),{push:function(e){this.fn(e)&&h(this[0],e)}});function Oe(t,e){this.input=t,this.fn=e}Oe.prototype=B(N(p.prototype),{push:function(e){let r=this.fn(e);if(r!==void 0)if(Ct(r))for(let i of r)h(this[0],i);else r.pipe&&this.done(r.each(i=>h(this[0],i)))}});function Te(t,e){this.input=t,this.chunk=[],typeof n=="number"?this.n=e:this.fn=e}Te.prototype=B(N(p.prototype),{fn:function(){return this.chunk.length===this.n},push:function(e){let o=this.chunk;this.fn(e)?(h(this[0],o),this.chunk=[]):o.push(e)}});function Ut(t,e,o=1/0){this.input=t,this.index=-e,this.indexEnd=e+o}Ut.prototype=B(N(p.prototype),{push:function(e){++this.index>0&&this[0].push(e),this.index===this.indexEnd&&this.stop()}});function De(t,e){this.fn=t,this.value=e,this.i=0}De.prototype=B(N(p.prototype),{push:function(t){let e=this.fn;this.value=e(this.value,t,this.i++,this)}});function Be(t,e,o){this.input=t,this.fn=e,this.value=o}Be.prototype=B(N(p.prototype),{push:function(t){let e=this.fn;this.value=e(this.value,t),this[0].push(this.value)}});function Ne(t){this.push=t}Ne.prototype=B(N(p.prototype),{each:null,reduce:null,pipe:null});var Qn=Object.assign,Yn=Object.create;function Kn(t,e){if(t[1]){let o=-1;for(;t[++o]&&t[o]!==e;);for(;t[o++];)t[o-1]=t[o]}else t.stop()}function W(t,e){p.apply(this,arguments),this.memory=!!(e&&e.memory),e&&e.hot&&this.pipe(v)}W.prototype=Qn(Yn(p.prototype),{push:function(t){if(t===void 0)return;this.memory&&(this.value=t);let e=-1;for(;this[++e];)this[e].push(t)},pipe:function(t){let e=-1;for(;this[++e];);return this.memory&&e===0&&this.input.pipe(this),this[e]=t,t.done(()=>Kn(this,t)),this.value!==void 0&&t.push(this.value),!this.memory&&e===0&&this.input.pipe(this),t}});var Zn=Array.prototype,to=Object.assign,eo=Object.create;function no(t){return t!==void 0}function z(t){this.buffer=t?t.filter?t.filter(no):t:[]}z.prototype=to(eo(p.prototype),{push:function(t){t!==void 0&&h(this.buffer,t)},pipe:function(t){for(t.done(this),this[0]=t;this.buffer.length;)h(this[0],Zn.shift.apply(this.buffer));return this.buffer=t,t},stop:function(){return this.buffer=void 0,y(this),this}});var ke=Object.assign,oo=Object.create,ro=Promise.resolve(),io={schedule:function(){ro.then(this.fire)},unschedule:m},so={schedule:function(){this.timer=requestAnimationFrame(this.fire)},unschedule:function(){cancelAnimationFrame(this.timer),this.timer=void 0}},uo={schedule:function(){this.timer=setTimeout(this.fire,this.duration*1e3)},unschedule:function(){clearTimeout(this.timer),this.timer=void 0}};function _(t,e){p.apply(this,arguments),this.duration=e,this.timer=void 0,this.fire=()=>{this.timer=void 0,this.output.stop()},ke(this,e==="tick"?io:e==="frame"?so:uo)}_.prototype=ke(oo(p.prototype),{push:function(t){this.timer?(this.unschedule(),this.schedule(),this.output.push(t)):(this.output=p.of(t),this[0].push(this.output),this.schedule())},stop:function(){return this.timer&&this.fire(),p.prototype.stop.apply(this,arguments)}});var Ft=Object.assign,co=Object.create;function po(t){return!!t.active}function ao(t){return!!t.stopped}function qt(t,e,o,r,i,s){this.stream=t,this.values=e,this.pipes=o,this.name=r,this.input=i,this.mutable=s,this.active=!1,this.stopped=!1}Ft(qt.prototype,{push:function(t){let e=this.stream,o=this.values,r=this.name;if(o[r]=t,this.active=!0,e.active||(e.active=this.pipes.every(po)))if(this.mutable)h(e[0],o);else{let i=new this.values.constructor;h(e[0],Ft(i,o))}},stop:function(){this.stopped=!0,this.pipes.every(ao)&&y(this.stream)},done:function(t){this.stream.done(t)}});function ut(t,e){this.inputs=t,this.mutable=e&&(e===!0||e.mutable),this.active=!1}ut.prototype=Ft(co(p.prototype),{push:null,pipe:function(t){let e=this.inputs,o=[];this[0]=t,t.done(this);let r;for(r in e){let i=e[r];if(i.pipe){let s=new qt(this,e,o,r,i,this.mutable);o.push(s),i.pipe(s)}else if(i.then){let s=new qt(this,e,o,r,i,this.mutable);o.push(s),i.then(u=>s.push(u)),i.finally(()=>s.stop())}}return t}});var fo=Object.assign,lo=Object.create;function ct(t){this.fn=t}ct.prototype=fo(lo(p.prototype),{pipe:function(t){return t.done(this),this[0]=t,this.fn(e=>this.push(e),e=>this.stop(e)),t}});var je=Object.assign,ho=Object.create;function Re(t){this.stream=t}je(Re.prototype,{push:function(t){h(this.stream[0],t)},stop:function(){--this.stream.count===0&&y(this.stream)},done:function(t){this.stream.done(t)}});function pt(t){this.inputs=t}pt.prototype=je(ho(p.prototype),{push:null,pipe:function(t){let e=this.inputs;this.count=e.length,this[0]=t,t.done(this);let o=new Re(this),r=-1,i;for(;i=e[++r];)if(i.pipe)i.pipe(o);else if(i.then)i.then(s=>o.push(s)),i.finally(()=>o.stop());else{let s=-1;for(;++s<i.length;)o.push(i[s]);o.stop()}return t}});var mo=Object.assign,go=Object.create;function at(t){this.promise=t}at.prototype=mo(go(p.prototype),{push:null,pipe:function(t){let e=this.promise;return this[0]=t,t.done(this),e.then(o=>h(this,o)),e.finally(()=>y(this)),t}});var wo=Array.prototype,Ae=Object.assign;function yo(t){throw new TypeError("Stream cannot be created from "+typeof object)}Ae(p,{isStream:st,of:function(){return new z(wo.slice.apply(arguments))},from:function(t){return t.pipe?new p(t):t.then?new at(t):typeof t.length=="number"?typeof t=="function"?new ct(t):new z(t):yo(t)},batch:t=>new _(v,t),broadcast:t=>new W(v,t),combine:(t,e)=>new ut(t,e),merge:function(){return new pt(arguments)},writeable:function(t){let e=new p(v);return t(e),e}});Ae(p.prototype,{log:b,batch:function(t){return new _(this,t)},broadcast:function(t){return new W(this,t)}});var Me=Object.assign,bo=Object.create,Ht=/(^\.?|\.)\s*([\w-]*)\s*/g;function xo(t){this.producer.push(t)}function $t(t,e,o,r){Ht.lastIndex=e;let i=Ht.exec(t);this.path=t,this.object=o,this.producer=r,this.key=i[2]||i[1],this.index=Ht.lastIndex,this.isMuteableObserver=this.path.slice(this.index)===".",this.index>=this.path.length&&(this.push=xo),this.listen(),this.push(this.key==="."?this.object:O(this.object)[this.key])}Me($t.prototype,{push:function(t){it(t)?this.child?this.child.relisten(t):this.child=new $t(this.path,this.index,t,this.producer):(this.child&&(this.child.stop(),this.child=void 0),this.producer.push(this.isMuteableObserver?t:void 0))},listen:function(){let t=P(this.object);t&&t.listen(this.key==="."?null:this.key,this)},unlisten:function(){P(this.object).unlisten(this.key==="."?null:this.key,this)},relisten:function(t){this.unlisten(),this.object=t,this.listen(),this.push(O(this.object)[this.key])},stop:function(){this.unlisten(),this.child&&this.child.stop(),this.child=void 0,this.status="stopped"}});function Pe(t,e,o){this.path=t,this.object=e,this.value=o}Pe.prototype=Me(bo(p.prototype),{push:function(t){this.value===t&&(!this.isMutationProducer||!it(t))||(this.value=t,this[0].push(t))},pipe:function(t){return this[0]=t,t.done(this),this.pathObserver=new $t(this.path,0,this.object,this),this.isMutationProducer=this.path[this.path.length-1]===".",t},stop:function(){return this.pathObserver.stop(),p.prototype.stop.apply(this,arguments)}});function I(t,e,o){return new p(new Pe(t,e,o))}function vo(t,e,o){let r=t(e),i=t(o);return i===r?0:r>i?1:-1}var Le=g(vo,!0);function Vt(t,e,o){return o>e?e:o<t?t:o}var Ji=g(Vt);function Ce(t,e){if(t===e)return!0;if(t===null||e===null||typeof t!="object"||typeof e!="object")return!1;let o=Object.keys(t),r=Object.keys(e),i=o.length;for(;i--;){if(t[o[i]]===void 0){if(e[o[i]]!==void 0)return!1}else if(!e.hasOwnProperty(o[i])||!Ce(t[o[i]],e[o[i]]))return!1;let s=r.indexOf(o[i]);s>-1&&r.splice(s,1)}for(i=r.length;i--;)if(e[r[i]]===void 0){if(t[r[i]]!==void 0)return!1}else return!1;return!0}var Ue=g(Ce,!0);function Eo(t,e){let o;for(o in t)if(t[o]!==e[o])return!1;return!0}var Ge=g(Eo,!0);var Fe=/\.?([\w-]+)/g;function So(t,e,o){var r=t.exec(e);if(!r)throw new Error('getPath(path, object): invalid path "'+e+'" at "'+e.slice(t.lastIndex)+'"');return qe(t,e,o[r[1]])}function qe(t,e,o){return t.lastIndex===e.length?o:o?So(t,e,o):void 0}function Oo(t,e){return Fe.lastIndex=0,qe(Fe,""+t,e)}var He=g(Oo,!0);function Wt(t){if(t=typeof t=="number"?t+"":t.trim(),typeof t=="string")return t.toLowerCase().replace(/^[\W_]+/,"").replace(/[\W_]+$/,"").replace(/[\W_]+/g,"-")}function C(t,e){return e+t}function zt(t){if(typeof t.length=="number")return t[t.length-1]}function a(t,e){return function(){let r=t.apply(this,arguments),i=e[r]||e.default;if(!i)throw new Error('overload() no handler for "'+r+'"');return i.apply(this,arguments)}}var To=Object.assign,Do=Object.create;function ft(t){this.duration=t}ft.prototype=To(Do(p.prototype),{push:null,pipe:function(t){this[0]=t;let e=this.duration==="frame"?o=>{this.frame=requestAnimationFrame(e),h(this[0],o/1e3)}:o=>{this.frame=setInterval(()=>h(this[0],performance.now()/1e3),this.duration*1e3),h(this[0],o/1e3)};return e(performance.now()),t},stop:function(){return this.duration==="frame"?cancelAnimationFrame(this.frame):clearInterval(this.frame),this.frame=void 0,y(this[0]),this}});function _t(t){let e=typeof t=="object"&&typeof t.length!="number"?Object.entries(t).flatMap(o=>o[1]===void 0?v:o[1]&&typeof o[1]=="object"&&o[1].map?o[1].map(r=>[o[0],r]):[o]):t;return new URLSearchParams(e)}var Bo={assign:Object.assign,by:Le,ceil:Math.ceil,clamp:Vt,entries:Object.entries,equals:Ue,floor:Math.floor,get:He,id:w,clock:t=>new ft(t),keys:Object.keys,last:zt,matches:Ge,noop:m,nothing:v,observe:I,Data:D,overload:a,round:(t,e)=>Math.round(e/t)*t,paramify:_t,slugify:Wt,Stream:p,sum:C,translate:function(t){return window.translations&&window.translations[t]||t},values:Object.values},$e=Bo;function No(t,e){return e[t]}var j=g(No,!0);function ko(t){let e=t[0];return/^\w/.test(e)}function It(t={},e,o,r){let i=Object.entries(t).filter(ko),s=i.map(j(0)),u=i.map(j(1));return r?new Function(...s,"return ("+e+") => {"+(o||"")+"}").apply(r,u):new Function(...s,"return function("+e+"){"+(o||"")+"}").apply(null,u)}var U=">";var Xt="";var Jt={};function Qt(t,e,o,r,i=""){let s=`
`+(r?Xt+"const { "+r+` } = data;
`:"")+Xt+"return this.compose`"+t+"`;\n",u=s;if(Jt[u])return Jt[u];if(!1)try{}catch(c){}return Jt[u]=It(e,o,s)}function Yt(t){let e=t.slice(1),o=document.getElementById(e);if(!o)throw new Error('Template "'+t+'" not found');return o}var jo=a(w,{is:m,tag:m,data:function(t,e,o){Object.assign(e.dataset,o)},html:function(t,e,o){e.innerHTML=o},text:function(t,e,o){e.textContent=o},children:function(t,e,o){e.innerHTML="",e.append.apply(e,o)},points:R,cx:R,cy:R,r:R,transform:R,preserveAspectRatio:R,viewBox:R,default:function(t,e,o){t in e?e[t]=o:e.setAttribute(t,o)}});function R(t,e,o){e.setAttribute(t,o)}function Ro(t,e){for(var o=Object.keys(e),r=o.length;r--;)jo(o[r],t,e[o[r]]);return t}var lt=g(Ro,!0);var Kt="http://www.w3.org/2000/svg",Ve=document.createElement("template"),Zt=(t,e)=>e&&typeof e;function We(t,e){let o=document.createRange();return o.selectNode(t),o.createContextualFragment(e)}var x=a(Zt,{string:function(t,e){let o=document.createElementNS(Kt,t);return o.innerHTML=e,o},object:function(t,e){let o=document.createElementNS(Kt,t);return typeof e.length=="number"?o.append.apply(o,e):lt(o,e),o},default:t=>document.createElementNS(Kt,t)}),Ao=a(Zt,{string:function(t,e){let o=document.createElement(t);return o.innerHTML=e,o},object:function(t,e){let o=document.createElement(t);return typeof e.length=="number"?o.append.apply(o,e):lt(o,e),o},default:t=>document.createElement(t)}),Mo=a(w,{comment:function(t,e){return document.createComment(e||"")},fragment:a(Zt,{string:function(t,e,o){return o?We(o,e):(Ve.innerHTML=e,Ve.content.cloneNode(!0))},object:function(t,e,o){let r=o?We(o):document.createDocumentFragment();return typeof e.length=="number"?r.append.apply(r,e):lt(r,e),r},default:()=>document.createDocumentFragment()}),text:function(t,e){return document.createTextNode(e||"")},circle:x,ellipse:x,g:x,glyph:x,image:x,line:x,rect:x,use:x,path:x,pattern:x,polygon:x,polyline:x,svg:x,default:Ao}),ht=Mo;function mt(t){return function(o,...r){var i=t[o]||t.default;return i&&i.apply(this,r)}}var Po={xml:"application/xml",html:"text/html",svg:"image/svg+xml"};function Lo(t,e){if(!!e){var o=Po[t.toLowerCase()],r;try{r=new window.DOMParser().parseFromString(e,o)}catch{return}if(!r||r.getElementsByTagName("parsererror").length)throw new Error("Invalid "+t.toUpperCase()+": "+e);return r}}function ze(t){return Lo("html",t)}var G=Object.assign,F={headers:function(t){return{}},body:w,onresponse:function(t){if(t.redirected){window.location=t.url;return}return t}},Co=mt({"application/x-www-form-urlencoded":function(t){return G(t,{"Content-Type":"application/x-www-form-urlencoded","X-Requested-With":"XMLHttpRequest"})},"application/json":function(t){return G(t,{"Content-Type":"application/json; charset=utf-8","X-Requested-With":"XMLHttpRequest"})},"multipart/form-data":function(t){return G(t,{"Content-Type":"multipart/form-data","X-Requested-With":"XMLHttpRequest"})},"audio/wav":function(t){return G(t,{"Content-Type":"audio/wav","X-Requested-With":"XMLHttpRequest"})},default:function(t){return G(t,{"Content-Type":"application/x-www-form-urlencoded","X-Requested-With":"XMLHttpRequest"})}}),Uo=mt({"application/json":function(t){return t.get?Go(t):JSON.stringify(t)},"application/x-www-form-urlencoded":function(t){return t.get?Ie(t):Xe(t)},"multipart/form-data":function(t){return t.get?t:Fo(t)}});function Go(t){return JSON.stringify(Array.from(t.entries()).reduce(function(e,o){return e[o[0]]=o[1],e},{}))}function Ie(t){return new URLSearchParams(t).toString()}function Xe(t){return Object.keys(t).reduce((e,o)=>(e.append(o,t[o]),e),new URLSearchParams)}function Fo(t){throw new Error("TODO: dataToFormData(data)")}function qo(t,e){return e instanceof FormData?t+"?"+Ie(e):t+"?"+Xe(e)}function Ho(t,e,o,r){let i=typeof o=="string"?o:o&&o["Content-Type"]||"application/json",s=Co(i,G(F.headers&&e?F.headers(e):{},typeof o=="string"?{}:o)),u={method:t,headers:s,credentials:"same-origin",signal:r&&r.signal};return t!=="GET"&&(u.body=Uo(i,F.body?F.body(e):e)),u}var $o={"text/plain":Wo,"text/html":zo,"application/json":Vo,"multipart/form-data":_e,"application/x-www-form-urlencoded":_e,audio:te,"audio/wav":te,"audio/m4a":te};function te(t){return t.blob()}function Vo(t){return t.json().catch(e=>{throw new Error("Cannot parse JSON "+t.url+". "+e.message)})}function _e(t){return t.formData()}function Wo(t){return t.text()}function zo(t){return t.text().then(e=>/^\s*<!DOCTYPE html>/.test(e)?ze(e):ht("fragment",e))}function _o(t){if(F.onresponse&&(t=F.onresponse(t)),!t.ok)throw new Error(t.statusText+"");let e=t.headers.get("Content-Type").replace(/\;.*$/,"");return $o[e](t)}function dt(t="GET",e,o,r="application/json"){t=t.toUpperCase(),t==="GET"&&o&&(e=qo(e,o));let i=Ho(t,o,r,arguments[4]);return fetch(e,i).then(_o)}function gt(t){return dt("GET",t)}var Je=T(function(e){return gt(e).then(o=>({id:e,content:ht("fragment",o)}))});var Io=Object.entries,wt={};function Xo(t,[e,o]){let r=new URL(e,window.location);return wt[r]=new URL(o,window.location),wt}function pu(t){Io(t).reduce(Xo,wt)}function Qe(t){let e=new URL(t,window.location);return wt[e]||e}function ee(t){var e=t.id;if(!e){do e=Math.ceil(Math.random()*1e5);while(document.getElementById(e));t.id=e}return e}function ne(t){return t.nodeType===3}var Jo={1:"element",3:"text",8:"comment",9:"document",10:"doctype",11:"fragment"};function oe(t){return Jo[t.nodeType]}function re(t){if(typeof t!="object"||arguments.length>1)throw new Error("delegate() now takes an object of selector:fn pairs.");return function(o){let r=o.target,i;for(i in t){let s=r.closest(i);if(s)return t[i](s,...arguments)}}}var Qo=Object.assign,Yo=/\s+/,yt={fullscreenchange:T(()=>"fullscreenElement"in document?"fullscreenchange":"webkitFullscreenElement"in document?"webkitfullscreenchange":"mozFullScreenElement"in document?"mozfullscreenchange":"msFullscreenElement"in document?"MSFullscreenChange":"fullscreenchange")},Ye=0;window.addEventListener("click",t=>Ye=t.timeStamp);function Ko(t,e){return t.node.addEventListener(yt[e]?yt[e]():e,t,t.options),t}function Zo(t,e){return t.node.removeEventListener(yt[e]?yt[e]():e,t),t}function Ke(t,e,o){this.types=t.split(Yo),this.options=e,this.node=o,this.select=e&&e.select}Qo(Ke.prototype,{pipe:function(t){Gt(this,t),this.types.reduce(Ko,this)},handleEvent:function(t){if(!(t.type==="click"&&t.timeStamp<=Ye)){if(this.select){let e=t.target.closest(this.select);if(!e)return;t.selectedTarget=e}h(this[0],t)}},stop:function(){this.types.reduce(Zo,this),y(this[0])}});function ie(t,e){let o;return typeof t=="object"&&(o=t,t=o.type),new p(new Ke(t,o,e))}var tr=Object.assign,X={bubbles:!0,cancelable:!0};function se(t,e){var M;let o=X,r,i,s,u,c,l;return typeof t=="object"?(M=t,{type:t,detail:i,bubbles:s,cancelable:u,composed:c}=M,r=we(M,["type","detail","bubbles","cancelable","composed"]),l=tr(new CustomEvent(t,{detail:i,bubbles:s||X.bubbles,cancelable:u||X.cancelable,composed:c||X.composed}),r)):l=new CustomEvent(t,X),e.dispatchEvent(l)}var bt=g(se,!0);function J(t){return typeof t}var er=/^\s*([+-]?\d*\.?\d+)([^\s\d]*)\s*$/;function ue(t){return function(o){if(typeof o=="number")return o;var r=er.exec(o);if(!r||!t[r[2]||""]){if(!t.catch)throw new Error('Cannot parse value "'+o+'" (accepted units '+Object.keys(t).join(", ")+")");return r?t.catch(parseFloat(r[1]),r[2]):t.catch(parseFloat(o))}return t[r[2]||""](parseFloat(r[1]))}}var nr=/px$/,Ze={"transform:translateX":function(t){var e=Q("transform",t);if(!e||e==="none")return 0;var o=xt(e);return parseFloat(o[4])},"transform:translateY":function(t){var e=Q("transform",t);if(!e||e==="none")return 0;var o=xt(e);return parseFloat(o[5])},"transform:scale":function(t){var e=Q("transform",t);if(!e||e==="none")return 0;var o=xt(e),r=parseFloat(o[0]),i=parseFloat(o[1]);return Math.sqrt(r*r+i*i)},"transform:rotate":function(t){var e=Q("transform",t);if(!e||e==="none")return 0;var o=xt(e),r=parseFloat(o[0]),i=parseFloat(o[1]);return Math.atan2(i,r)}};function xt(t){return t.split("(")[1].split(")")[0].split(/\s*,\s*/)}function Q(t,e){return window.getComputedStyle?window.getComputedStyle(e,null).getPropertyValue(t):0}function vt(t,e){if(Ze[t])return Ze[t](e);var o=Q(t,e);return typeof o=="string"&&nr.test(o)?parseFloat(o):o}var Et,St;function tn(){if(!Et){let t=document.documentElement.style.fontSize;document.documentElement.style.fontSize="100%",Et=vt("font-size",document.documentElement),document.documentElement.style.fontSize=t||""}return Et}function en(){return St||(St=vt("font-size",document.documentElement)),St}window.addEventListener("resize",()=>{Et=void 0,St=void 0});var q=a(J,{number:w,string:ue({px:w,em:t=>tn()*t,rem:t=>en()*t,vw:t=>window.innerWidth*t/100,vh:t=>window.innerHeight*t/100,vmin:t=>window.innerWidth<window.innerHeight?window.innerWidth*t/100:window.innerHeight*t/100,vmax:t=>window.innerWidth<window.innerHeight?window.innerHeight*t/100:window.innerWidth*t/100})});function nn(t){return q(t)/tn()}function on(t){return q(t)/en()}function rn(t){return 100*q(t)/window.innerWidth}function sn(t){return 100*q(t)/window.innerHeight}var E=Object.assign({delegate:re,events:ie,request:dt,trigger:se,px:q,em:nn,rem:on,vw:rn,vh:sn},$e);var or=Object.assign,rr=Object.values,ce={};function ir(t){t.stop()}function pe(t,e){this.children={},this.target=O(t),this.path=e}or(pe.prototype,{pipe:function(t){this[0]=this.root=t,P(this.target).gets.push(this),this.path===""&&this[0].done(this)},listen:function(t){if(this.children[t])return;let e=(this.path?this.path+".":"")+t;(this.children[t]=new pe(this.target[t],e)).pipe(this.root)},unlisten:function(t){!this.children[t]||(this.children[t].stop(),delete this.children[t])},push:function(t){ce.path=(this.path?this.path+".":"")+t,ce.value=this.target[t],this.root[0].push(ce)},stop:function(){L(P(this.target).gets,this),rr(this.children).forEach(ir),this.path===""&&y(this[0]),this.status="stopped"}});function ae(t){let e=D(t);return e?new p(new pe(e,"")):v}var sr=/\s*(\([\w,\s]*\))/,ur=/function(?:\s+\w+)?\s*(\([\w,\s]*\))/,un=a(J,{boolean:w,function:t=>t.prototype?(t.name||"function")+(ur.exec(t.toString())||[])[1]:(sr.exec(t.toString())||[])[1]+" ⇒ {…}",number:t=>Number.isNaN(t)?"":Number.isFinite(t)?t:t<0?"-∞":"∞",string:w,symbol:t=>t.toString(),undefined:t=>"",object:a(t=>t&&t.constructor.name,{Array:t=>t.map(un).join(""),RegExp:t=>"/"+t.source+"/",Stream:()=>"",null:()=>"",default:t=>JSON.stringify(t,null,2)}),default:JSON.stringify}),S=un;var Y=[],cr=Promise.resolve(Y),Ot;function pr(t){var e,o;let r,i=-1;for(;t[++i]!==void 0;)r=t[i].update();Ot=void 0,t.length=0}function cn(t){return Ot||(Ot=cr.then(pr)),Y.push(t),t.status="cued",Ot}function Tt(t){if(t.status!=="cued"||!Y.length)return;let e=Y.indexOf(t);e>0&&Y.splice(e,1),t.status="idle"}var fn=Object.assign,ar=Object.keys,ln=Object.values;function fr(t){t.stop()}function lr(t){t.stopped=!0}function hn(t){let e;for(e in t)t[e].stop(),delete t[e]}function pn(t){!t||(t.forEach(lr),t.length=0)}function an(t){!t||(t.forEach(fr),t.length=0)}function hr(t,e){return t[t.length]=e,t.length+=1,t}var Bt={};function mr(t,e){if(t&&t.length<e.path.length&&e.path.startsWith(t)&&delete Bt[t],!(e.path in ln))return Bt[e.path]=e.value,e.path}function Dt(t,e,o,r,i,s=!1){if(i&&typeof i=="object"){let u=O(i);if(u.then){let c=t.promises||(t.promises=[]);o[r]="",u.then(l=>{if(!u.stopped)return L(c,u),Dt(t,e,o,r,l,!0)}),c.push(u);return}if(u.each){let c=t.streams||(t.streams=[]);o[r]="",u.each(l=>Dt(t,e,o,r,l,!0)),c.push(u);return}if(st(u)){let c=t.streams||(t.streams=[]);o[r]="",c.push(u);return}if(typeof u.length=="number"){let c=u.length;for(;c--;)Dt(t,e,u,c,u[c])}}o[r]=i,s&&t.render.apply(t,e)}function dr(t,e,o,r){let i;for(i in t)i in e?delete e[i]:(t[i].stop(),delete t[i]);for(i in e)t[i]=I(i,o,e[i]).each(r)}function f(t,e,o,r,i,s){this.literal=typeof t=="string"?Qt(t,e,"data, DATA"+(o?", "+ar(o).join(", "):""),r,i):t,this.id=++f.count,this.parameters=o,this.message=i,this.params=o?ln(o).reduce(hr,{length:2}):{length:2},this.observers={},this.status="idle",this.cue=u=>{hn(this.observers),cn(this)},this.consume=s}fn(f.prototype,{push:function(t){if(this.status==="rendering")throw new Error("Renderer is rendering, cannot .push() data");if(this.status==="stopped")throw new Error("Renderer is stopped, cannot .push() data");t=D(t),this.data!==t&&(this.data=t,this.cue())},getParameters:function(){let t=this.params;return t[0]=this.data,t[1]=O(this.data),t},update:function(){let t=this.data,e=this.observers;pn(this.promises),an(this.streams),this.status="rendering",Bt={};let o=ae(t);o.reduce(mr);let r;if(!1)try{}catch(i){}else r=this.literal.apply(this,this.getParameters());return o.stop(),r.values=Bt,dr(e,r.values,t,this.cue),this.status=this.status==="rendering"?"idle":this.status,this},compose:function(t){let e=0;for(;t[++e]!==void 0;)Dt(this,arguments,arguments,e,arguments[e]);return this.render.apply(this,arguments),this},render:function(t){let e=0,o=t[e];for(;t[++e]!==void 0;)o+=S(arguments[e])+t[e];return this.consume(o),this},stop:function(){return Tt(this),hn(this.observers),pn(this.promises),an(this.streams),this.status="stopped",p.prototype.stop.apply(this),--f.count,this},done:p.prototype.done});fn(f,{count:0});var mn=t=>t.reduce((e,o)=>o===""||o===void 0?e:e+o);function gr(t,e,o){return t&&typeof t=="object"?t.find?e+mn(t.map(S)):e+S(t):e+S(t)}function K(t){let e=t[0];return mn(e.map((o,r)=>r<=t.length?gr(t[r+1],o,S):o===""?void 0:o))}var Z={"accept-charset":"acceptCharset",accesskey:"accessKey",cellpadding:"cellPadding",cellspacing:"cellSpacing",codebase:"codeBase",colspan:"colSpan",datetime:"dateTime",for:"htmlFor",form:null,formaction:"formAction",formenctype:"formEnctype",formmethod:"formMethod",formnovalidate:"formNoValidate",formtarget:"formTarget",frameborder:"frameBorder",href:null,httpequiv:"httpEquiv",longdesc:"longDesc",maxlength:"maxLength",minlength:"minLength",nohref:"noHref",noresize:"noResize",noshade:"noShade",nowrap:"noWrap",novalidate:"noValidate",readonly:"readOnly",rowspan:"rowSpan",tabindex:"tabIndex",tfoot:"tFoot",thead:"tHead",usemap:"useMap",valign:"vAlign",valuetype:"valueType",viewbox:null,viewBox:null,cx:null,cy:null,r:null};var dn=Object.assign;function wr(t,e,o){let r=e in Z?Z[e]:e;return r&&r in t&&t[r]!==o?(t[r]=o,1):o===t.getAttribute(e)?0:(t.setAttribute(e,o),1)}function Nt(t,e,o,r,i,s,u,c){f.call(this,t,E,dn({},c,{element:i}),e,u),this.template=o,this.path=r,this.node=i,this.name=s}dn(Nt.prototype,f.prototype,{render:function(){let t=K(arguments);return this.mutations=wr(this.node,this.name,t),this}});function tt(t){return t=Array.from(t),t[0]=!!t[0].join(" ").trim().split(/\s+/).map(Boolean).reduce(C),!!t.map(Boolean).reduce(C)}var gn=Object.assign;function yr(t,e,o){let r=Z[e]||e;if(r in t){if(!!o===t[r])return 0;t[r]=!!o}else o?t.setAttribute(e,e):t.removeAttribute(e);return 1}function kt(t,e,o,r,i,s,u,c){f.call(this,t,E,gn({},c,{element:i}),e,u),this.template=o,this.path=r,this.node=i,this.name=s,i.removeAttribute(s)}gn(kt.prototype,f.prototype,{render:function(t){let e=tt(arguments);return this.mutations=yr(this.node,this.name,e),this}});function fe(t){return!!t||t!=null&&!Number.isNaN(t)}var H={changeEvent:"dom-update"};var wn=Object.assign;function br(t){return""+t}function xr(t,e,o){let r=typeof e=="boolean"?e:o?t.type==="checkbox"&&e&&e.map?e.map(br).includes(t.value):e+""===t.value:!!e;return r===t.checked?0:(t.checked=r,H.changeEvent&&bt(H.changeEvent,t),1)}function jt(t,e,o,r,i,s,u,c){f.call(this,t,E,wn({},c,{element:i}),e,u),this.template=o,this.path=r,this.node=i,this.name="checked",this.hasValue=fe(i.getAttribute("value")),i.removeAttribute("checked")}wn(jt.prototype,f.prototype,{render:function(t){let e=tt(arguments);return this.mutations=xr(this.node,e,this.hasValue),this}});var vr=Array.prototype,yn=Object.assign,Er=[],Sr=a((t,e)=>e,{class:t=>t.classList});function Or(t,e,o,r){let i=e.length;for(;i--;)o.includes(e[i])&&e.splice(i,1);return e.length&&(t.remove.apply(t,e),++r),o.length&&(t.add.apply(t,o),++r),r}function Rt(t,e,o,r,i,s,u,c){f.call(this,t,E,yn({},c,{element:i}),e,u),this.template=o,this.path=r,this.node=i,this.name=s,this.list=Sr(i,s),this.tokens=Er,this.renders=0,i.setAttribute(s,"")}yn(Rt.prototype,f.prototype,{render:function(t){let e=0;if(++this.renders===1){let r=t.join(" ").trim();r&&(this.list.add.apply(this.list,r.split(/\s+/)),++e)}let o=vr.slice.call(arguments,1).map(S).join(" ").trim().split(/\s+/).filter(r=>!!r);return this.mutations=Or(this.list,this.tokens,o,e),this.tokens=o,this}});function At(t){let e=t[0],o=0,r=e[o];for(;e[++o]!==void 0;)r+=t[o]+e[o];return Number(r)}var bn=Object.assign,Tr={number:"number",range:"number"};function Dr(t,e){if(e===null)throw new Error("VALUE");return t.value=e,1}function Br(t,e){if(document.activeElement===t)return 0;let o=Tr[t.type];if(e=o===void 0||typeof e===o?e:null,e===t.value||e+""===t.value)return 0;let r=Dr(t,e);return H.changeEvent&&bt(H.changeEvent,t),r}var Nr=a((t,e)=>e,{number:At,range:At,default:K});function Mt(t,e,o,r,i,s,u,c){f.call(this,t,E,bn({},c,{element:i}),e,u),this.template=o,this.path=r,this.node=i,this.name="value"}bn(Mt.prototype,f.prototype,{render:function(){let t=Nr(arguments,this.node.type);return this.mutations=Br(this.node,t),this}});var kr=/\.([\w-]+)(?:#|\?|$)/,jr=[],Rr=a(t=>(kr.exec(t.pathname)||jr)[1],{js:T(t=>{let e=t.hash.slice(1)||"default";return import(t).then(j(e))}),default:T(gt)});function le(t){let e=Qe(t);return Rr(e)}function he(t,e,o){let r=new A(t,o);return r.push(e),r}function xn(t,e,o){let r=new A(t,o);return e.each(i=>r.push(i)),r.done(e),r}function Pt(t,e,o){let r=O(e);if(/^#/.test(t)){let u=Yt(t),c=typeof r=="string"?le(r):r&&r.then?r:null;return c?c.then(l=>he(u,l,o)):r&&r.each?xn(u,r,o):he(u,r||{},o)}let i=Je(t),s=typeof r=="string"?le(r):(r&&r.then,r);return r&&r.each?i.then(u=>xn(u,e,o)):Promise.all([i,s]).then(([u,c])=>he(u,c,o))}function et(t,e){let o=e,r=0;for(;o&&o!==t;){let i=o.previousSibling;o.remove(),o=i,++r}return t.remove(),++r,r}var vn=m;var Sn=Object.assign;function me(t){t&&typeof t=="object"&&t.stop&&t.stop()}function Ar(t){return t&&typeof t=="object"?t instanceof Node||t instanceof A?t:S(t):S(t)}function On(t,e){let o=t[t.length];return typeof e=="string"&&typeof o=="string"?t[t.length]=o+e:t.push(e),t}function Tn(t,e){return Array.isArray(e)?e.reduce(Tn,t):On(t,Ar(e))}function En(t,e){return t.nodeValue!==e?(t.nodeValue=e,1):0}function Dn(t){return typeof t=="string"?t:t.content?Dn(t.content):t}function Mr(t,e,o,r){let i=0;t.nextSibling&&e.previousSibling!==t&&(i+=et(t.nextSibling,e.previousSibling)),i+=En(t,o[0]),i+=En(e,o[o.length-1]);let s=o.map(Dn).slice(1,o.length-1);return s.length&&(t.after.apply(t,s),i+=o.length),i}function $(t,e,o,r,i,s,u,c){f.call(this,t,E,Sn({},c,{element:r.includes(U)?i.parentNode:c.element,include:(l,M)=>M===void 0?Ln=>Pt(l,Ln,c):Pt(l,M,c),print:(...l)=>vn(this,...l)}),e,u),this.template=o,this.path=r,this.node=i,this.first=i,this.last=document.createTextNode(""),this.first.after(this.last),this.contents=[]}Sn($.prototype,f.prototype,{push:function(){return this.contents.forEach(me),this.contents.length=0,f.prototype.push.apply(this,arguments)},update:function(){return this.contents.forEach(me),this.contents.length=0,f.prototype.update.call(this)},render:function(t){let e=0;for(this.contents.length=0,this.contents.push(t[e]);t[++e]!==void 0;)Tn(this.contents,arguments[e]),On(this.contents,t[e]);return this.mutations=Mr(this.first,this.last,this.contents,this.status),this},stop:function(){return this.contents.forEach(me),this.contents.length=0,f.prototype.stop.apply(this)}});var Pr=/\$\{/;function nt(t){return t&&Pr.test(t)}var Bn=document.createElement("textarea");function ot(t){return Bn.innerHTML=t,Bn.value}var d=(t,e,o,r,i,s,u)=>new kt(r,s,e,o,t.ownerElement,t.localName,u,i),Lr=a(j("localName"),{async:d,autofocus:d,autoplay:d,controls:d,defer:d,disabled:d,formnovalidate:d,hidden:d,ismap:d,itemscope:d,loop:d,multiple:d,muted:d,nomodule:d,novalidate:d,open:d,readonly:d,required:d,reversed:d,selected:d,checked:(t,e,o,r,i,s,u)=>new jt(r,s,e,o,t.ownerElement,null,u,i),class:(t,e,o,r,i,s,u)=>new Rt(r,s,e,o,t.ownerElement,"class",u,i),datetime:function(e,o,r,i,s,u,c){},"inner-content":(t,e,o,r,i,s,u)=>{let c=t.ownerElement;return c.removeAttribute(t.localName),new $(ot(r),s,e,o,c,"innerHTML",u,i)},value:(t,e,o,r,i,s,u)=>new Mt(r,s,e,o,t.ownerElement,null,u,i),default:(t,e,o,r,i,s,u)=>new Nt(r,s,e,o,t.ownerElement,t.localName,u,i)});function de(t,e,o,r,i,s){let u=e.value;if(!nt(u))return;let c=!1;t.push(Lr(e,o,r,u,i,s,c))}var Cr=Object.assign;function jn(t,e,o,r,i,s){let u=e.childNodes;if(u){let c=-1;for(;u[++c];)Rn(t,u[c],o,r?r+U+c:""+c,i,s)}return t}function Nn(t,e,o,r,i,s){let u=Array.from(e.attributes);for(var c=-1,l;l=u[++c];)de(t,l,o,r,i,s)}var kn=a((t,e)=>e.tagName.toLowerCase(),{defs:m,script:(t,e,o,r,i,s)=>(Nn(t,e,o,r,i,s),t),template:m,default:(t,e,o,r,i,s)=>(Nn(t,e,o,r,i,s),jn(t,e,o,r,Cr({},i,{element:e}),s),t)}),Rn=a((t,e)=>oe(e),{comment:m,element:kn,fragment:jn,text:(t,e,o,r,i,s)=>{let u=e.nodeValue;if(nt(u)){let c=ot(u),l=!1;t.push(new $(c,s,o,r,e,null,l,i))}return t},doctype:m,document:(t,e,o,r,i,s)=>(kn(t,e.documentElement,o,r,i,s),t),default:()=>{throw new Error("Node not compileable")}}),An=Rn;var Ur=Object.assign,Gr=Object.keys,Mn={};function Fr(t,e){return/^[a-zA-Z]/.test(e)?t:t.childNodes[e]}function qr(t,e){let o=t&&t.split(U);return t?o.reduce(Fr,e):e}function Pn(t){if(!ne(t))return!1;let e=t.nodeValue;return/^\s*/.exec(e)[0].length===e.length}function Hr(t){let e=t.childNodes[0],o=t.childNodes[t.childNodes.length-1];Pn(e)||t.prepend(document.createTextNode("")),Pn(o)||t.append(document.createTextNode(""))}function $r(t){let e=qr(t.path,this.content),o=new t.constructor(t.literal,"",t.template,t.path,e,t.name,"",this.parameters);return this.done(o),o}function A(t,e){let o=ee(t);this.template=t,this.parameters=e;let r=Mn[o];if(r){this.content=r.template.content?r.template.content.cloneNode(!0):r.template.cloneNode(!0),this.first=this.content.childNodes[0],this.last=this.content.childNodes[this.content.childNodes.length-1],this.contents=r.contents.map($r,this);return}Mn[o]=this,this.template.content?(Hr(this.template.content),this.content=this.template.content.cloneNode(!0)):this.content=this.template.cloneNode(!0),this.first=this.content.childNodes[0],this.last=this.content.childNodes[this.content.childNodes.length-1];let i=Gr(t.dataset).join(", ");this.contents=An([],this.content,"#"+t.id,"",e,i),this.contents.forEach(s=>this.done(s))}Ur(A.prototype,{push:function(t){if(this.status==="stopped")throw new Error("Renderer is stopped, cannot .push() data");let e=D(t)||t;this.data!==e&&(this.data=e,this.update())},update:function(){let t=this.data;if(!t){let e=[],o=this.first;for(;o!==this.last;)o=o.nextSibling,e.push(o);return this.content.append.apply(this.content,e),e.length}return this.mutations=0,this.contents.forEach(e=>{e.data=t,this.mutations+=e.update().mutations}),this.content.firstChild&&this.first!==this.content.firstChild&&(this.first.after(this.content),++this.mutations),this},remove:function(){return et(this.first,this.last)},replaceWith:function(){return this.first.before.apply(this.first,arguments),this.remove()},stop:function(){return Tt(this),this.status="stopped",p.prototype.stop.apply(this),this},done:p.prototype.done});export{Lt as a,v as b,T as c,g as d,L as e,p as f,D as g,I as h,a as i,ht as j,zt as k,$e as l,Jt as m,Yt as n,Je as o,pu as p,Qe as q,le as r,A as s};
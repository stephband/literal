/* Literal 
   0.6.0
   By Stephen
   Built 2022-10-12 19:50 */

var ie=Object.getOwnPropertySymbols;var vn=Object.prototype.hasOwnProperty,En=Object.prototype.propertyIsEnumerable;var se=(t,e)=>{var o={};for(var r in t)vn.call(t,r)&&e.indexOf(r)<0&&(o[r]=t[r]);if(t!=null&&ie)for(var r of ie(t))e.indexOf(r)<0&&En.call(t,r)&&(o[r]=t[r]);return o};function D(t){var e=new Map;return function(r){if(e.has(r))return e.get(r);var i=t(r);return e.set(r,i),i}}var Sn=Array.prototype;function On(t,e){return typeof t=="function"?t.apply(null,e):t}function ue(t,e,o){o=o||t.length;var r=o===1?e?t:D(t):D(function(i){return ue(function(){var s=[i];return s.push.apply(s,arguments),t.apply(null,s)},e,o-1)});return function i(s){return arguments.length===0?i:arguments.length===1?r(s):arguments.length>=o?t.apply(null,arguments):On(r(s),Sn.slice.call(arguments,1))}}var d=ue;function P(t,e){t.remove&&t.remove(e);let o;for(;(o=t.indexOf(e))!==-1;)t.splice(o,1);return t}var yr=d(P,!0);function kt(t){return t&&t[Symbol.iterator]}var Tn=Object.assign;function Dn(t){return t.stop?t.stop():t()}function H(){}Tn(H.prototype,{stop:function(){let t=this.stopables;return this.stopables=void 0,t&&t.forEach(Dn),this},done:function(t){return(this.stopables||(this.stopables=[])).push(t),this}});var O=Object.assign,N=Object.create;function g(t,e){t&&t.push(e)}function x(t){H.prototype.stop.apply(t);let e=-1,o;for(;o=t[++e];)t[e]=void 0,o.stop()}function et(t){return p.prototype.isPrototypeOf(t)}function p(t){this.input=t}O(p.prototype,H.prototype,{push:function(t){g(this[0],t)},pipe:function(t){if(this[0])throw new Error("Stream: Attempt to .pipe() a unicast stream multiple times. Create a multicast stream with stream.broadcast().");return this[0]=t,t.done(this),this.input.pipe(this),t},map:function(t){return new ce(this,t)},filter:function(t){return new pe(this,t)},split:function(t){return new fe(this,t)},flatMap:function(t){return new ae(this,t)},take:function(t){return new le(this,t)},each:function(t){return this.pipe(new de(t))},reduce:function(t,e){return this.pipe(new he(t,e)).value},scan:function(t,e){return new me(this,t,e)},stop:function(){return x(this),this}});function ce(t,e){this.input=t,this.fn=e}ce.prototype=O(N(p.prototype),{push:function(e){let r=this.fn(e);r!==void 0&&g(this[0],r)}});function pe(t,e){this.input=t,this.fn=e}pe.prototype=O(N(p.prototype),{push:function(e){this.fn(e)&&g(this[0],e)}});function ae(t,e){this.input=t,this.fn=e}ae.prototype=O(N(p.prototype),{push:function(e){let r=this.fn(e);if(r!==void 0)if(kt(r))for(let i of r)g(this[0],i);else r.pipe&&this.done(r.each(i=>g(this[0],i)))}});function fe(t,e){this.input=t,this.chunk=[],typeof n=="number"?this.n=e:this.fn=e}fe.prototype=O(N(p.prototype),{fn:function(){return this.chunk.length===this.n},push:function(e){let o=this.chunk;this.fn(e)?(g(this[0],o),this.chunk=[]):o.push(e)}});function le(t,e){this.input=t,this.count=e}le.prototype=O(N(p.prototype),{push:function(e){this[0].push(e),--this.count||this.stop()}});function he(t,e){this.fn=t,this.value=e,this.i=0}he.prototype=O(N(p.prototype),{push:function(t){let e=this.fn;this.value=e(this.value,t,this.i++,this)}});function me(t,e,o){this.input=t,this.fn=e,this.value=o}me.prototype=O(N(p.prototype),{push:function(t){let e=this.fn;this.value=e(this.value,t),this[0].push(this.value)}});function de(t){this.push=t}de.prototype=O(N(p.prototype),{each:null,reduce:null,pipe:null});var Nn=Object.assign,Bn=Object.defineProperties,Rn=Object.isExtensible,kn=Object.prototype,B=Symbol("observe");function An(t,e){let o=t.indexOf(e);return o>-1&&t.splice(o,1),t}var ge={[B]:{}};function nt(t,e){if(!t||!t.length)return 0;t=t.slice(0);for(var o=-1;t[++o];)t[o].status!=="stopped"&&t[o].push(e);return o}function we(t){this.observables={},this.gets=[],this.sets=void 0,this.target=t,this.observer=new Proxy(t,this),ge[B].value=this,Bn(t,ge)}Nn(we.prototype,{notify:function(t){nt(this.observables[t],this.target[t]),nt(this.sets,this.target)},listen:function(t,e){(t===null?this.sets||(this.sets=[]):this.observables[t]||(this.observables[t]=[])).push(e)},unlisten:function(t,e){let o=t===null?this.sets:this.observables[t];o&&An(o,e)},get:function(e,o,r){let i=e[o];if(typeof o=="symbol"||o==="__proto__")return i;let s=Object.getOwnPropertyDescriptor(e,o);if((s?s.writable||s.set:i===void 0)&&nt(this.gets,o),!kn.hasOwnProperty.call(e,o))return i;let c=E(i);if(!c)return i;for(var h=-1;this.gets[++h];)this.gets[h].listen(o);return c},set:function(e,o,r,i){if(typeof o=="symbol"||o==="__proto__")return e[o]=r,!0;let s=S(r);if(e[o]===r||e[o]===s)return!0;let u=e.length;for(var c=-1;this.gets[++c];)this.gets[c].unlisten(o);return e[o]=s,o!=="length"&&e.length!==u&&nt(this.observables.length,e.length),this.notify(o),!0},deleteProperty:function(t,e){return typeof e=="symbol"||e==="__proto__"?(delete t[e],!0):(t.hasOwnProperty(e)&&(delete t[e],this.notify(e)),!0)}});function ot(t){return t&&Rn(t)&&!Node.prototype.isPrototypeOf(t)&&(typeof BaseAudioContext>"u"||!BaseAudioContext.prototype.isPrototypeOf(t))&&!(t instanceof Date)&&!(t instanceof RegExp)&&!(t instanceof Map)&&!(t instanceof WeakMap)&&!(t instanceof Set)&&!(window.WeakSet&&t instanceof WeakSet)&&!ArrayBuffer.isView(t)}function E(t,e){return t?t[B]?t[B].observer:e||ot(t)?new we(t).observer:void 0:void 0}function S(t){return t&&t[B]&&t[B].target||t}function C(t){return E(t)&&t[B]}function At(t){var e=t.id;if(!e){do e=Math.ceil(Math.random()*1e5);while(document.getElementById(e));t.id=e}return e}function Pt(t){return t.nodeType===3}function l(){}function a(t,e){return function(){let r=t.apply(this,arguments),i=e[r]||e.default;if(!i)throw new Error('overload() no handler for "'+r+'"');return i.apply(this,arguments)}}var Pn={1:"element",3:"text",8:"comment",9:"document",10:"doctype",11:"fragment"};function Ct(t){return Pn[t.nodeType]}function Cn(t,e){return e[t]}var W=d(Cn,!0);function m(t){return t}function Mn(t,e,o){let r=t(e),i=t(o);return i===r?0:r>i?1:-1}var ye=d(Mn,!0);function be(t,e){if(t===e)return!0;if(t===null||e===null||typeof t!="object"||typeof e!="object")return!1;let o=Object.keys(t),r=Object.keys(e),i=o.length;for(;i--;){if(t[o[i]]===void 0){if(e[o[i]]!==void 0)return!1}else if(!e.hasOwnProperty(o[i])||!be(t[o[i]],e[o[i]]))return!1;let s=r.indexOf(o[i]);s>-1&&r.splice(s,1)}for(i=r.length;i--;)if(e[r[i]]===void 0){if(t[r[i]]!==void 0)return!1}else return!1;return!0}var xe=d(be,!0);function Gn(t,e){let o;for(o in t)if(t[o]!==e[o])return!1;return!0}var ve=d(Gn,!0);var Un=Object.freeze;function Ee(){return this}var w=Un({shift:l,push:l,forEach:l,join:function(){return""},map:Ee,filter:Ee,includes:function(){return!1},reduce:function(t,e){return e},length:0,each:l,pipe:m,start:l,stop:l,done:l,valueOf:function(){return null}});var Se=/\.?([\w-]+)/g;function Ln(t,e,o){var r=t.exec(e);if(!r)throw new Error('getPath(path, object): invalid path "'+e+'" at "'+e.slice(t.lastIndex)+'"');return Oe(t,e,o[r[1]])}function Oe(t,e,o){return t.lastIndex===e.length?o:o?Ln(t,e,o):void 0}function Fn(t,e){return Se.lastIndex=0,Oe(Se,""+t,e)}var Te=d(Fn,!0);function Mt(t){if(t=typeof t=="number"?t+"":t.trim(),typeof t=="string")return t.toLowerCase().replace(/^[\W_]+/,"").replace(/[\W_]+$/,"").replace(/[\W_]+/g,"-")}function Gt(t){if(typeof t.length=="number")return t[t.length-1]}function $(t){return typeof t}var jn=/^\s*([+-]?\d*\.?\d+)([^\s\d]*)\s*$/;function Ut(t){return function(o){if(typeof o=="number")return o;var r=jn.exec(o);if(!r||!t[r[2]||""]){if(!t.catch)throw new Error('Cannot parse value "'+o+'" (accepted units '+Object.keys(t).join(", ")+")");return r?t.catch(parseFloat(r[1]),r[2]):t.catch(parseFloat(o))}return t[r[2]||""](parseFloat(r[1]))}}var qn=/px$/,De={"transform:translateX":function(t){var e=V("transform",t);if(!e||e==="none")return 0;var o=rt(e);return parseFloat(o[4])},"transform:translateY":function(t){var e=V("transform",t);if(!e||e==="none")return 0;var o=rt(e);return parseFloat(o[5])},"transform:scale":function(t){var e=V("transform",t);if(!e||e==="none")return 0;var o=rt(e),r=parseFloat(o[0]),i=parseFloat(o[1]);return Math.sqrt(r*r+i*i)},"transform:rotate":function(t){var e=V("transform",t);if(!e||e==="none")return 0;var o=rt(e),r=parseFloat(o[0]),i=parseFloat(o[1]);return Math.atan2(i,r)}};function rt(t){return t.split("(")[1].split(")")[0].split(/\s*,\s*/)}function V(t,e){return window.getComputedStyle?window.getComputedStyle(e,null).getPropertyValue(t):0}function it(t,e){if(De[t])return De[t](e);var o=V(t,e);return typeof o=="string"&&qn.test(o)?parseFloat(o):o}var st,ut;function Ne(){if(!st){let t=document.documentElement.style.fontSize;document.documentElement.style.fontSize="100%",st=it("font-size",document.documentElement),document.documentElement.style.fontSize=t||""}return st}function Be(){return ut||(ut=it("font-size",document.documentElement)),ut}window.addEventListener("resize",()=>{st=void 0,ut=void 0});var M=a($,{number:m,string:Ut({px:m,em:t=>Ne()*t,rem:t=>Be()*t,vw:t=>window.innerWidth*t/100,vh:t=>window.innerHeight*t/100,vmin:t=>window.innerWidth<window.innerHeight?window.innerWidth*t/100:window.innerHeight*t/100,vmax:t=>window.innerWidth<window.innerHeight?window.innerHeight*t/100:window.innerWidth*t/100})});function Re(t){return M(t)/Ne()}function ke(t){return M(t)/Be()}function Ae(t){return 100*M(t)/window.innerWidth}function Pe(t){return 100*M(t)/window.innerHeight}function Lt(){return this}var Hn=Object.assign,Wn=Object.create;function $n(t,e){if(t[1]){let o=-1;for(;t[++o]&&t[o]!==e;);for(;t[o++];)t[o-1]=t[o]}else t.stop()}function z(t,e){p.apply(this,arguments),this.memory=!!(e&&e.memory),e&&e.hot&&this.pipe(w)}z.prototype=Hn(Wn(p.prototype),{push:function(t){if(t===void 0)return;this.memory&&(this.value=t);let e=-1;for(;this[++e];)this[e].push(t)},pipe:function(t){let e=-1;for(;this[++e];);return this.memory&&e===0&&this.input.pipe(this),this[e]=t,t.done(()=>$n(this,t)),this.value!==void 0&&t.push(this.value),!this.memory&&e===0&&this.input.pipe(this),t}});var Vn=Array.prototype,zn=Object.assign,_n=Object.create;function In(t){return t!==void 0}function _(t){this.buffer=t?t.filter?t.filter(In):t:[]}_.prototype=zn(_n(p.prototype),{push:function(t){t!==void 0&&g(this.buffer,t)},pipe:function(t){for(t.done(this),this[0]=t;this.buffer.length;)g(this[0],Vn.shift.apply(this.buffer));return this.buffer=t,t},stop:function(){return this.buffer=void 0,x(this),this}});var Ce=Object.assign,Xn=Object.create,Jn=Promise.resolve(),Yn={schedule:function(){Jn.then(this.fire)},unschedule:l},Qn={schedule:function(){this.timer=requestAnimationFrame(this.fire)},unschedule:function(){cancelAnimationFrame(this.timer),this.timer=void 0}},Kn={schedule:function(){this.timer=setTimeout(this.fire,this.duration*1e3)},unschedule:function(){clearTimeout(this.timer),this.timer=void 0}};function R(t,e){p.apply(this,arguments),this.duration=e,this.timer=void 0,this.fire=()=>{this.timer=void 0,this.output.stop()},Ce(this,e==="tick"?Yn:e==="frame"?Qn:Kn)}R.prototype=Ce(Xn(p.prototype),{push:function(t){this.timer?(this.unschedule(),this.schedule(),this.output.push(t)):(this.output=p.of(t),this[0].push(this.output),this.schedule())},stop:function(){return this.timer&&this.fire(),p.prototype.stop.apply(this,arguments)}});var Ft=Object.assign,Zn=Object.create,Me=Object.keys;function jt(t,e,o,r,i){this.stream=t,this.names=e,this.values=o,this.name=r,this.input=i}Ft(jt.prototype,{push:function(t){let e=this.stream,o=this.values,r=this.name;o[r]=t,(e.active||(e.active=Me(o).length===this.names.length))&&g(e[0],Ft({},o))},stop:function(){--this.stream.count===0&&x(this.stream)},done:function(t){this.stream.done(t)}});function ct(t){this.inputs=t,this.active=!1}ct.prototype=Ft(Zn(p.prototype),{push:null,pipe:function(t){let e=this.inputs,o=Me(e),r={};this.count=o.length,this[0]=t,t.done(this);let i;for(i in e){let s=e[i];if(s.pipe){let u=new jt(this,o,r,i,s);s.pipe(u)}else if(s.then){let u=new jt(this,o,r,i,s);s.then(c=>u.push(c)),s.finally(()=>u.stop())}else r[i]=s,--this.count}return t}});var Ge=Object.assign,to=Object.create;function Ue(t){this.stream=t}Ge(Ue.prototype,{push:function(t){g(this.stream[0],t)},stop:function(){--this.stream.count===0&&x(this.stream)},done:function(t){this.stream.done(t)}});function pt(t){this.inputs=t}pt.prototype=Ge(to(p.prototype),{push:null,pipe:function(t){let e=this.inputs;this.count=e.length,this[0]=t,t.done(this);let o=new Ue(this),r=-1,i;for(;i=e[++r];)if(i.pipe)i.pipe(o);else if(i.then)i.then(s=>o.push(s)),i.finally(()=>o.stop());else{let s=-1;for(;++s<i.length;)o.push(i[s]);o.stop()}return t}});var eo=Object.assign,no=Object.create;function at(t){this.promise=t}at.prototype=eo(no(p.prototype),{push:null,pipe:function(t){let e=this.promise;return this[0]=t,t.done(this),e.then(o=>g(this,o)),e.finally(()=>x(this)),t}});var oo=Array.prototype,Le=Object.assign;function ro(t){throw new TypeError("Stream cannot be created from "+typeof object)}Le(p,{isStream:et,of:function(){return new _(oo.slice.apply(arguments))},from:function(t){return t.pipe?new p(t):t.then?new at(t):typeof t.length=="number"?new _(t):ro(t)},batch:t=>new R(w,t),burst:t=>(console.warn("Stream.burst() is now Stream.batch()"),new R(w,t)),broadcast:t=>new z(w,t),combine:t=>new ct(t),merge:function(){return new pt(arguments)},writeable:function(t){let e=new p(w);return t(e),e}});Le(p.prototype,{log:Lt,batch:function(t){return new R(this,t)},burst:function(t){return console.warn("stream.burst() is now stream.batch()"),new R(this,t)},broadcast:function(t){return new z(this,t)}});var Fe=Object.assign,io=Object.create,qt=/(^\.?|\.)\s*([\w-]*)\s*/g;function so(t){this.producer.push(t)}function Ht(t,e,o,r){qt.lastIndex=e;let i=qt.exec(t);this.path=t,this.object=o,this.producer=r,this.key=i[2]||i[1],this.index=qt.lastIndex,this.isMuteableObserver=this.path.slice(this.index)===".",this.index>=this.path.length&&(this.push=so),this.listen(),this.push(this.key==="."?this.object:S(this.object)[this.key])}Fe(Ht.prototype,{push:function(t){ot(t)?this.child?this.child.relisten(t):this.child=new Ht(this.path,this.index,t,this.producer):(this.child&&(this.child.stop(),this.child=void 0),this.producer.push(this.isMuteableObserver?t:void 0))},listen:function(){let t=C(this.object);t&&t.listen(this.key==="."?null:this.key,this)},unlisten:function(){C(this.object).unlisten(this.key==="."?null:this.key,this)},relisten:function(t){this.unlisten(),this.object=t,this.listen(),this.push(S(this.object)[this.key])},stop:function(){this.unlisten(),this.child&&this.child.stop(),this.child=void 0,this.status="stopped"}});function je(t,e,o){this.path=t,this.object=e,this.value=o}je.prototype=Fe(io(p.prototype),{push:function(t){this.value===t&&(!this.isMutationProducer||!ot(t))||(this.value=t,this[0].push(t))},pipe:function(t){return this[0]=t,t.done(this),this.pathObserver=new Ht(this.path,0,this.object,this),this.isMutationProducer=this.path[this.path.length-1]===".",t},stop:function(){return this.pathObserver.stop(),p.prototype.stop.apply(this,arguments)}});function I(t,e,o){return new p(new je(t,e,o))}function Wt(t){let e=typeof t=="object"&&typeof t.length!="number"?Object.entries(t).flatMap(o=>o[1]===void 0?w:o[1]&&typeof o[1]=="object"&&o[1].map?o[1].map(r=>[o[0],r]):[o]):t;return new URLSearchParams(e)}var uo={assign:Object.assign,by:ye,ceil:Math.ceil,define:Object.defineProperties,entries:Object.entries,equals:xe,floor:Math.floor,get:Te,id:m,keys:Object.keys,last:Gt,matches:ve,noop:l,nothing:w,observe:I,Data:E,overload:a,round:Math.round,paramify:Wt,slugify:Mt,Stream:p,translate:function(t){return window.translations&&window.translations[t]||t},values:Object.values,px:M,em:Re,rem:ke,vw:Ae,vh:Pe},y=uo;var co=Object.assign,po=Object.values,$t={};function ao(t){t.stop()}function Vt(t,e){this.children={},this.target=S(t),this.path=e}co(Vt.prototype,{pipe:function(t){this[0]=this.root=t,C(this.target).gets.push(this),this.path===""&&this[0].done(this)},listen:function(t){if(this.children[t])return;let e=(this.path?this.path+".":"")+t;(this.children[t]=new Vt(this.target[t],e)).pipe(this.root)},unlisten:function(t){!this.children[t]||(this.children[t].stop(),delete this.children[t])},push:function(t){$t.path=(this.path?this.path+".":"")+t,$t.value=this.target[t],this.root[0].push($t)},stop:function(){P(C(this.target).gets,this),po(this.children).forEach(ao),this.path===""&&x(this[0]),this.status="stopped"}});function zt(t){return new p(new Vt(t,""))}function fo(t){let e=t[0];return/^\w/.test(e)}function _t(t={},e,o,r){let i=Object.entries(t).filter(fo),s=i.map(W(0)),u=i.map(W(1));return r?new Function(...s,"return ("+e+") => {"+(o||"")+"}").apply(r,u):new Function(...s,"return function("+e+"){"+(o||"")+"}").apply(null,u)}var G=">";var It="";var ft={};function Xt(t,e,o,r,i=""){let s=`
`+(r?It+"const { "+r+` } = data;
`:"")+It+"return this.compose`"+t+"`;\n",u=s;if(ft[u])return ft[u];if(!1)try{}catch(c){}return ft[u]=_t(e,o,s)}var lo=/\s*(\([\w,\s]*\))/,ho=/function(?:\s+\w+)?\s*(\([\w,\s]*\))/,qe=a($,{boolean:m,function:t=>t.prototype?(t.name||"function")+(ho.exec(t.toString())||[])[1]:(lo.exec(t.toString())||[])[1]+" ⇒ {…}",number:t=>Number.isNaN(t)?"":Number.isFinite(t)?t:t<0?"-∞":"∞",string:m,symbol:t=>t.toString(),undefined:t=>"",object:a(t=>t&&t.constructor.name,{Array:t=>t.map(qe).join(""),RegExp:t=>"/"+t.source+"/",Stream:()=>"",null:()=>"",default:t=>JSON.stringify(E(t),null,2)}),default:JSON.stringify}),v=qe;var U=[],mo=Promise.resolve(U),lt;function go(t){var e,o;let r,i=-1;for(;t[++i]!==void 0;)r=t[i].update();lt=void 0,t.length=0}function ht(t){return lt||(lt=mo.then(go)),U.indexOf(t)!==-1&&console.trace("RENDERER ALREADY IN CUE","This is probably not good"),U.push(t),t.status="cued",lt}function mt(t){if(t.status!=="cued"||!U.length)return;let e=U.indexOf(t);e>0&&U.splice(e,1),t.status="idle"}var $e=Object.assign,wo=Object.keys,Ve=Object.values;function yo(t){t.stop()}function bo(t){t.stopped=!0}function ze(t){let e;for(e in t)t[e].stop(),delete t[e]}function He(t){!t||(t.forEach(bo),t.length=0)}function We(t){!t||(t.forEach(yo),t.length=0)}function xo(t,e){return t[t.length]=e,t.length+=1,t}var gt={};function vo(t,e){if(t&&t.length<e.path.length&&e.path.startsWith(t)&&delete gt[t],!(e.path in Ve))return gt[e.path]=e.value,e.path}function dt(t,e,o,r){if(r&&typeof r=="object"){if(r=S(r),r.then){let i=t.promises||(t.promises=[]);e[o]="",r.then(s=>{if(!r.stopped)return P(i,r),dt(t,e,o,s)}),i.push(r);return}if(r.each){let i=t.streams||(t.streams=[]);e[o]="",r.each(s=>dt(t,e,o,s)),i.push(r);return}if(et(r)){let i=t.streams||(t.streams=[]);e[o]="",i.push(r);return}if(typeof r.length=="number"){let i=r.length;for(;i--;)dt(t,r,i,r[i])}}e[o]=r,t.status!=="rendering"&&t.render.apply(t,e)}function Eo(t,e,o,r){let i;for(i in t)i in e?delete e[i]:(t[i].stop(),delete t[i]);for(i in e)t[i]=I(i,o,e[i]).each(r)}function f(t,e,o,r,i,s){this.literal=typeof t=="string"?Xt(t,e,"data, DATA"+(o?", "+wo(o).join(", "):""),r,i):t,this.parameters=o,this.params=o?Ve(o).reduce(xo,{length:2}):{length:2},this.observers={},this.status="idle",this.cue=u=>{ze(this.observers),ht(this)},this.consume=s,++f.count}$e(f.prototype,{push:function(t){if(this.status==="rendering")throw new Error("Renderer is rendering, cannot .push() data");if(this.status==="stopped")throw new Error("Renderer is stopped, cannot .push() data");t=E(t),this.data!==t&&(this.data=t,this.cue())},getParameters:function(){let t=this.params;return t[0]=this.data,t[1]=S(this.data),t},update:function(){let t=this.data,e=this.observers;He(this.promises),We(this.streams),this.status="rendering",gt={};let o=t?zt(t):w;o.reduce(vo);let r=this.literal.apply(this,this.getParameters());return o.stop(),r.values=gt,Eo(e,r.values,t,this.cue),this.status=this.status==="rendering"?"idle":this.status,this},compose:function(t){let e=0;for(;t[++e]!==void 0;)dt(this,arguments,e,arguments[e]);return this.render.apply(this,arguments),this},render:function(t){let e=0,o=t[e];for(;t[++e]!==void 0;)o+=v(arguments[e])+t[e];return this.consume(o),this},stop:function(){return mt(this),ze(this.observers),He(this.promises),We(this.streams),this.status="stopped",p.prototype.stop.apply(this),--f.count,this},done:p.prototype.done});$e(f,{count:0});var _e=t=>t.reduce((e,o)=>o===""||o===void 0?e:e+o);function So(t,e,o){return t&&typeof t=="object"?t.find?e+_e(t.map(v)):e+v(t):e+v(t)}function X(t){let e=t[0];return _e(e.map((o,r)=>r<=t.length?So(t[r+1],o,v):o===""?void 0:o))}var J={"accept-charset":"acceptCharset",accesskey:"accessKey",cellpadding:"cellPadding",cellspacing:"cellSpacing",codebase:"codeBase",colspan:"colSpan",datetime:"dateTime",for:"htmlFor",form:null,formaction:"formAction",formenctype:"formEnctype",formmethod:"formMethod",formnovalidate:"formNoValidate",formtarget:"formTarget",frameborder:"frameBorder",href:null,httpequiv:"httpEquiv",longdesc:"longDesc",maxlength:"maxLength",minlength:"minLength",nohref:"noHref",noresize:"noResize",noshade:"noShade",nowrap:"noWrap",novalidate:"noValidate",readonly:"readOnly",rowspan:"rowSpan",tabindex:"tabIndex",tfoot:"tFoot",thead:"tHead",usemap:"useMap",valign:"vAlign",valuetype:"valueType",viewbox:null,viewBox:null,cx:null,cy:null,r:null};var Ie=Object.assign;function Oo(t,e,o){let r=e in J?J[e]:e;return r&&r in t&&t[r]!==o?(t[r]=o,1):o===t.getAttribute(e)?0:(t.setAttribute(e,o),1)}function wt(t,e,o,r,i,s,u,c){f.call(this,t,y,Ie({},c,{element:i}),e,u),this.template=o,this.path=r,this.node=i,this.name=s}Ie(wt.prototype,f.prototype,{render:function(){let t=X(arguments);return this.mutations=Oo(this.node,this.name,t),this}});function yt(t,e){return e+t}function Y(t){return t=Array.from(t),t[0]=!!t[0].join(" ").trim().split(/\s+/).map(Boolean).reduce(yt),!!t.map(Boolean).reduce(yt)}var Xe=Object.assign;function To(t,e,o){let r=J[e]||e;if(r in t){if(!!o===t[r])return 0;t[r]=!!o}else o?t.setAttribute(e,e):t.removeAttribute(e);return 1}function bt(t,e,o,r,i,s,u,c){f.call(this,t,y,Xe({},c,{element:i}),e,u),this.template=o,this.path=r,this.node=i,this.name=s,i.removeAttribute(s)}Xe(bt.prototype,f.prototype,{render:function(t){let e=Y(arguments);return this.mutations=To(this.node,this.name,e),this}});function Jt(t){return!!t||t!=null&&!Number.isNaN(t)}var Do=Object.assign,Q={bubbles:!0,cancelable:!0};function No(t,e){var A;let o=Q,r,i,s,u,c,h;return typeof t=="object"?(A=t,{type:t,detail:i,bubbles:s,cancelable:u,composed:c}=A,r=se(A,["type","detail","bubbles","cancelable","composed"]),h=Do(new CustomEvent(t,{detail:i,bubbles:s||Q.bubbles,cancelable:u||Q.cancelable,composed:c||Q.composed}),r)):h=new CustomEvent(t,Q),e.dispatchEvent(h)}var xt=d(No,!0);var L={changeEvent:"dom-update"};var Je=Object.assign;function Bo(t){return""+t}function Ro(t,e,o){let r=typeof e=="boolean"?e:o?t.type==="checkbox"&&e&&e.map?e.map(Bo).includes(t.value):e+""===t.value:!!e;return r===t.checked?0:(t.checked=r,L.changeEvent&&xt(L.changeEvent,t),1)}function vt(t,e,o,r,i,s,u,c){f.call(this,t,y,Je({},c,{element:i}),e,u),this.template=o,this.path=r,this.node=i,this.name="checked",this.hasValue=Jt(i.getAttribute("value")),i.removeAttribute("checked")}Je(vt.prototype,f.prototype,{render:function(t){let e=Y(arguments);return this.mutations=Ro(this.node,e,this.hasValue),this}});var ko=Array.prototype,Ye=Object.assign,Ao=[],Po=a((t,e)=>e,{class:t=>t.classList});function Co(t,e,o,r){let i=e.length;for(;i--;)o.includes(e[i])&&e.splice(i,1);return e.length&&(t.remove.apply(t,e),++r),o.length&&(t.add.apply(t,o),++r),r}function Et(t,e,o,r,i,s,u,c){f.call(this,t,y,Ye({},c,{element:i}),e,u),this.template=o,this.path=r,this.node=i,this.name=s,this.list=Po(i,s),this.tokens=Ao,this.renders=0,i.setAttribute(s,"")}Ye(Et.prototype,f.prototype,{render:function(t){let e=0;if(++this.renders===1){let r=t.join(" ").trim();r&&(this.list.add.apply(this.list,r.split(/\s+/)),++e)}let o=ko.slice.call(arguments,1).map(v).join(" ").trim().split(/\s+/);return this.mutations=Co(this.list,this.tokens,o,e),this.tokens=o,this}});function St(t){let e=t[0],o=0,r=e[o];for(;e[++o]!==void 0;)r+=t[o]+e[o];return Number(r)}var Qe=Object.assign,Mo={number:"number",range:"number"};function Go(t,e){if(e===null)throw new Error("VALUE");return t.value=e,1}function Uo(t,e){if(document.activeElement===t)return 0;let o=Mo[t.type];if(e=o===void 0||typeof e===o?e:null,e===t.value||e+""===t.value)return 0;let r=Go(t,e);return L.changeEvent&&xt(L.changeEvent,t),r}var Lo=a((t,e)=>e,{number:St,range:St,default:X});function Ot(t,e,o,r,i,s,u,c){f.call(this,t,y,Qe({},c,{element:i}),e,u),this.template=o,this.path=r,this.node=i,this.name="value"}Qe(Ot.prototype,f.prototype,{render:function(){let t=Lo(arguments,this.node.type);return this.mutations=Uo(this.node,t),this}});function Yt(t){let e=t.slice(1),o=document.getElementById(e);if(!o)throw new Error('Template "'+t+'" not found');return o}var Fo=a(m,{is:l,tag:l,data:function(t,e,o){Object.assign(e.dataset,o)},html:function(t,e,o){e.innerHTML=o},text:function(t,e,o){e.textContent=o},children:function(t,e,o){e.innerHTML="",e.append.apply(e,o)},points:k,cx:k,cy:k,r:k,transform:k,preserveAspectRatio:k,viewBox:k,default:function(t,e,o){t in e?e[t]=o:e.setAttribute(t,o)}});function k(t,e,o){e.setAttribute(t,o)}function jo(t,e){for(var o=Object.keys(e),r=o.length;r--;)Fo(o[r],t,e[o[r]]);return t}var Tt=d(jo,!0);var Qt="http://www.w3.org/2000/svg",Ke=document.createElement("div"),Kt=(t,e)=>e&&typeof e;function Ze(t,e){let o=document.createRange();return o.selectNode(t),o.createContextualFragment(e)}var b=a(Kt,{string:function(t,e){let o=document.createElementNS(Qt,t);return o.innerHTML=e,o},object:function(t,e){let o=document.createElementNS(Qt,t);return typeof e.length=="number"?o.append.apply(o,e):Tt(o,e),o},default:t=>document.createElementNS(Qt,t)}),qo=a(Kt,{string:function(t,e){let o=document.createElement(t);return o.innerHTML=e,o},object:function(t,e){let o=document.createElement(t);return typeof e.length=="number"?o.append.apply(o,e):Tt(o,e),o},default:t=>document.createElement(t)}),Ho=a(m,{comment:function(t,e){return document.createComment(e||"")},fragment:a(Kt,{string:function(t,e,o){if(o)return Ze(o,e);let r=document.createDocumentFragment();Ke.innerHTML=e;let i=Ke.childNodes;for(;i[0];)r.appendChild(i[0]);return r},object:function(t,e,o){let r=o?Ze(o):document.createDocumentFragment();return typeof e.length=="number"?r.append.apply(r,e):Tt(r,e),r},default:()=>document.createDocumentFragment()}),text:function(t,e){return document.createTextNode(e||"")},circle:b,ellipse:b,g:b,glyph:b,image:b,line:b,rect:b,use:b,path:b,pattern:b,polygon:b,polyline:b,svg:b,default:qo}),tn=Ho;function Dt(t){return function(o,...r){var i=t[o]||t.default;return i&&i.apply(this,r)}}var F=Object.assign,j={headers:function(t){return{}},body:m,onresponse:function(t){if(t.redirected){window.location=t.url;return}return t}},Wo=Dt({"application/x-www-form-urlencoded":function(t){return F(t,{"Content-Type":"application/x-www-form-urlencoded","X-Requested-With":"XMLHttpRequest"})},"application/json":function(t){return F(t,{"Content-Type":"application/json; charset=utf-8","X-Requested-With":"XMLHttpRequest"})},"multipart/form-data":function(t){return F(t,{"Content-Type":"multipart/form-data","X-Requested-With":"XMLHttpRequest"})},"audio/wav":function(t){return F(t,{"Content-Type":"audio/wav","X-Requested-With":"XMLHttpRequest"})},default:function(t){return F(t,{"Content-Type":"application/x-www-form-urlencoded","X-Requested-With":"XMLHttpRequest"})}}),$o=Dt({"application/json":function(t){return t.get?Vo(t):JSON.stringify(t)},"application/x-www-form-urlencoded":function(t){return t.get?nn(t):on(t)},"multipart/form-data":function(t){return t.get?t:zo(t)}});function Vo(t){return JSON.stringify(Array.from(t.entries()).reduce(function(e,o){return e[o[0]]=o[1],e},{}))}function nn(t){return new URLSearchParams(t).toString()}function on(t){return Object.keys(t).reduce((e,o)=>(e.append(o,t[o]),e),new URLSearchParams)}function zo(t){throw new Error("TODO: dataToFormData(data)")}function _o(t,e){return e instanceof FormData?t+"?"+nn(e):t+"?"+on(e)}function Io(t,e,o,r){let i=typeof o=="string"?o:o&&o["Content-Type"]||"application/json",s=Wo(i,F(j.headers&&e?j.headers(e):{},typeof o=="string"?{}:o)),u={method:t,headers:s,credentials:"same-origin",signal:r&&r.signal};return t!=="GET"&&(u.body=$o(i,j.body?j.body(e):e)),u}var Xo={"text/html":Yo,"application/json":Jo,"multipart/form-data":en,"application/x-www-form-urlencoded":en,audio:Zt,"audio/wav":Zt,"audio/m4a":Zt};function Zt(t){return t.blob()}function Jo(t){return t.json().catch(e=>{throw new Error("Cannot parse JSON "+t.url+". "+e.message)})}function en(t){return t.formData()}function Yo(t){return t.text()}function Qo(t){if(j.onresponse&&(t=j.onresponse(t)),!t.ok)throw new Error(t.statusText+"");let e=t.headers.get("Content-Type").replace(/\;.*$/,"");return Xo[e](t)}function rn(t="GET",e,o,r="application/json"){if(e.startsWith("application/")||e.startsWith("multipart/")||e.startsWith("text/")||e.startsWith("audio/"))throw new Error("request(method, url, data, contenttype) parameter order has changed. You passed (method, contenttype, url, data).");t=t.toUpperCase(),t==="GET"&&o&&(e=_o(e,o));let i=Io(t,o,r,arguments[4]);return fetch(e,i).then(Qo)}function Nt(t){return rn("GET",t)}var sn=D(function(e){return Nt(e).then(o=>({id:e,content:tn("fragment",o)}))});var Ko=/\.([\w-]+)(?:#|\?|$)/;var Zo=[],te=a(t=>(Ko.exec(t)||Zo)[1],{js:t=>import(t[0]==="."?new URL(t,window.location):t).then(o=>o.default),default:D(t=>Nt(t))});function ee(t,e,o){let r=new T(t,o);return r.push(e),r}function un(t,e,o){let r=new T(t,o);return e.each(i=>r.push(i)),r.done(e),r}function Bt(t,e,o){let r=S(e);if(/^#/.test(t)){let u=Yt(t),c=typeof r=="string"?te(r):r&&r.then?r:null;return c?c.then(h=>ee(u,h,o)):r&&r.each?un(u,r,o):ee(u,r||{},o)}let i=sn(t),s=typeof r=="string"?te(r):(r&&r.then,r);return r&&r.each?i.then(u=>un(u,e,o)):Promise.all([i,s]).then(([u,c])=>ee(u,c,o))}function K(t,e){let o=e,r=0;for(;o&&o!==t;){let i=o.previousSibling;o.remove(),o=i,++r}return t.remove(),++r,r}var cn=l;var pn=Object.assign;function ne(t){t&&typeof t=="object"&&t.stop&&t.stop()}function tr(t){return t&&typeof t=="object"?t instanceof Node||t instanceof T?t:v(t):v(t)}function an(t,e){return typeof e=="string"&&typeof t[t.length]=="string"?t[t.length]+=e:t.push(e),t}function fn(t,e){return Array.isArray(e)?e.reduce(fn,t):an(t,tr(e))}function Rt(t,e){return t.nodeValue!==e?(t.nodeValue=e,1):0}function ln(t){return typeof t=="string"?t:t.content?ln(t.content):t}function er(t,e,o,r){let i=0,s=o.map(ln);return t.nextSibling&&e.previousSibling!==t&&(i+=K(t.nextSibling,e.previousSibling)),typeof o[0]=="string"?i+=Rt(t,s.shift()):i+=Rt(t,""),typeof s[s.length-1]=="string"?i+=Rt(e,s.pop()):i+=Rt(e,""),s.length&&(t.after.apply(t,s),i+=o.length),i}function q(t,e,o,r,i,s,u,c){f.call(this,t,y,pn({},c,{element:r.includes(G)?i.parentNode:c.element,include:(h,A)=>A?Bt(h,A,c):xn=>Bt(h,xn,c),print:cn}),e,u),this.template=o,this.path=r,this.node=i,this.first=i,this.last=document.createTextNode(""),this.first.after(this.last),this.contents=[]}pn(q.prototype,f.prototype,{push:function(){return this.contents.forEach(ne),this.contents.length=0,f.prototype.push.apply(this,arguments)},update:function(){return this.contents.forEach(ne),this.contents.length=0,f.prototype.update.call(this)},render:function(t){let e=0;for(this.contents.push(t[0]);t[++e]!==void 0;)fn(this.contents,arguments[e]),an(this.contents,t[e]);return this.mutations=er(this.first,this.last,this.contents,this.status),this},stop:function(){return this.contents.forEach(ne),this.contents.length=0,f.prototype.stop.apply(this)}});var nr=/\$\{/;function Z(t){return t&&nr.test(t)}var hn=document.createElement("textarea");function tt(t){return hn.innerHTML=t,hn.value}var oe=(t,e,o,r,i,s,u)=>new bt(r,s,e,o,t.ownerElement,t.localName,u),or=a(W("localName"),{disabled:oe,hidden:oe,required:oe,checked:(t,e,o,r,i,s,u)=>new vt(r,s,e,o,t.ownerElement,null,u),class:(t,e,o,r,i,s,u)=>new Et(r,s,e,o,t.ownerElement,"class",u),datetime:function(e,o,r,i,s,u,c){},"inner-content":(t,e,o,r,i,s,u)=>{let c=t.ownerElement;return c.removeAttribute(t.localName),new q(tt(r),s,e,o,c,"innerHTML",u,c)},value:(t,e,o,r,i,s,u)=>new Ot(r,s,e,o,t.ownerElement,null,u),default:(t,e,o,r,i,s,u)=>new wt(r,s,e,o,t.ownerElement,t.localName,u)});function re(t,e,o,r,i,s){let u=e.value;if(!Z(u))return;let c=!1;t.push(or(e,o,r,u,i,s,c))}var rr=Object.assign;function dn(t,e,o,r,i,s){let u=e.childNodes;if(u){let c=-1;for(;u[++c];)gn(t,u[c],o,r?r+G+c:""+c,i,s)}return t}function ir(t,e,o,r,i,s){let u=Array.from(e.attributes);for(var c=-1,h;h=u[++c];)re(t,h,o,r,i,s)}var mn=a((t,e)=>e.tagName.toLowerCase(),{defs:l,default:(t,e,o,r,i,s)=>(dn(t,e,o,r,rr({},i,{element:e}),s),ir(t,e,o,r,i,s),t)}),gn=a((t,e)=>Ct(e),{comment:l,element:mn,fragment:dn,text:(t,e,o,r,i,s)=>{let u=e.nodeValue;if(Z(u)){let c=tt(u),h=!1;t.push(new q(c,s,o,r,e,null,h,i))}return t},doctype:l,document:(t,e,o,r,i,s)=>(mn(t,e.documentElement,o,r,i,s),t),default:()=>{throw new Error("Node not compileable")}}),wn=gn;var sr=Object.assign,ur=Object.keys,yn={};function cr(t,e){return/^[a-zA-Z]/.test(e)?t:t.childNodes[e]}function pr(t,e){let o=t&&t.split(G);return t?o.reduce(cr,e):e}function bn(t){if(!Pt(t))return!1;let e=t.nodeValue;return/^\s*/.exec(e)[0].length===e.length}function ar(t){let e=t.childNodes[0],o=t.childNodes[t.childNodes.length-1];bn(e)||t.prepend(document.createTextNode("")),bn(o)||t.append(document.createTextNode(""))}function fr(t){let e=pr(t.path,this.content),o=new t.constructor(t.literal,"",t.template,t.path,e,t.name,"",t.parameters);return this.done(o),o}function T(t,e){let o=At(t);this.template=t,this.parameters=e;let r=yn[o];if(r){this.content=r.template.content?r.template.content.cloneNode(!0):r.template.cloneNode(!0),this.first=this.content.childNodes[0],this.last=this.content.childNodes[this.content.childNodes.length-1],this.contents=r.contents.map(fr,this);return}yn[o]=this,this.template.content?(ar(this.template.content),this.content=this.template.content.cloneNode(!0)):this.content=this.template.cloneNode(!0),this.first=this.content.childNodes[0],this.last=this.content.childNodes[this.content.childNodes.length-1];let i=ur(this.template.dataset).join(", ");this.contents=wn([],this.content,"#"+this.template.id,"",e,i),this.contents.forEach(s=>this.done(s))}sr(T.prototype,{push:function(t){if(this.status==="stopped")throw new Error("Renderer is stopped, cannot .push() data");t=E(t),this.data!==t&&(this.data=t,ht(this))},update:function(){let t=this.data;if(!t){let e=[],o=this.first;for(;o!==this.last;)o=o.nextSibling,e.push(o);return this.content.append.apply(this.content,e),e.length}return this.mutations=0,this.contents.forEach(e=>{e.data=t,this.mutations+=e.update().mutations}),this.content.firstChild&&this.first!==this.content.firstChild&&(this.first.after(this.content),++this.mutations),this},remove:function(){return K(this.first,this.last)},replaceWith:function(){return this.first.before.apply(this.first,arguments),this.remove()},stop:function(){return mt(this),this.status="stopped",p.prototype.stop.apply(this),this},done:p.prototype.done});function lr(t,e){return new T(t,e)}export{E as Data,lr as default,y as library,ft as literals};

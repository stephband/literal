/* Literal 
   0.6.5
   By Stephen Band
   Built 2023-08-29 15:31 */

import{a as T,b as r,c as m}from"../chunk-TZB6NPTD.js";import{a as O,c as d,f as j,h as u,j as p,l as x,o as D,r as N,s as E,t as L}from"../chunk-6GRMEALX.js";var U=Object.assign;function h(t,e){this.element=t,this.definitions=e,this.tokens=[]}U(h.prototype,{contains:function(t){return this.tokens.includes(t)},add:function(){let t=arguments.length;for(;t--;){let e=arguments[t];this.tokens.includes(e)||(this.tokens.push(e),this.supports(e)&&this.definitions[e].enable(this.element))}},remove:function(){let t=arguments.length;for(;t--;){let e=arguments[t];this.tokens.includes(e)&&(j(this.tokens,e),this.supports(e)&&this.definitions[e].disable(this.element))}},supports:function(t){return!!this.definitions&&!!this.definitions[t]}});var B=Array.prototype;function w(t,e){let n=t.tokens.slice(),o=B.slice.apply(e),i=n.length;for(;i--;)o.includes(n[i])&&n.splice(i,1);t.remove.apply(t,n),t.add.apply(t,o)}var G=/^\.*\/|^https?:\/\//,y=p((t,e,n)=>typeof n,{string:function(t,e,n){let o=r(e);return G.test(n)?E(n).then(i=>o.data[t]=i).catch(i=>console.error(i)):o.data[t]=JSON.parse(n),o.data},default:function(t,e,n){r(e)[t]=n}}),P=p((t,e)=>typeof e,{string:p((t,e)=>e,{attribute:t=>({attribute:function(e){r(this).data[t]=e}}),string:t=>({attribute:function(e){this[t]=e},get:function(){return r(this).data[t]},set:function(e){r(this).data[t]=e},default:""}),boolean:t=>({attribute:function(e){this[t]=e!==null},get:function(){return!!r(this).data[t]||!1},set:function(e){r(this).data[t]=!!e},default:!1}),number:t=>({attribute:function(e){this[t]=e},get:function(){return r(this).data[t]||0},set:function(e){r(this).data[t]=Number(e)},default:0}),tokens:t=>({attribute:function(e){this[t]=e||""},get:function(){let e=r(this);if(e[t])return e[t];let n=e[t]=new h;return e.data[t]=n.tokens=u(n.tokens),n},set:function(e){let n=this[t];w(n,(e+"").trim().split(/\s+/))},default:d}),src:t=>({attribute:function(e){this[t]=e},get:function(){return r(this).renderer.data[t]},set:function(e){y(t,this,e)},default:null}),module:t=>({attribute:function(e){this[t]=e},get:function(){return r(this).renderer.data[t]},set:function(e){y(t,this,e)},default:null}),json:t=>({attribute:function(e){this[t]=e},get:function(){return r(this).renderer.data[t]},set:function(e){y(t,this,e)},default:null}),default:(t,e)=>{throw e==="url"||e==="import"?new SyntaxError('Literal type deprecated in attribute definition "'+t+":"+e+'", should be "'+t+':src", "'+t+':module" or "'+t+':json"'):new SyntaxError('Literal type not supported in attribute definition "'+t+":"+e+'"')}}),object:O(1),undefined:t=>({attribute:function(e){r(this).data[t]=e}})});var J=Object.assign,R=Object.entries;function V(t,e){return t[e[0]]=P(e[0],e[1]),t}function q(t){return robject.test(t)?JSON.parse(t):Number.isNaN(Number(t))?t==="true"?!0:t==="false"?!1:t:Number(t)}function F(t,e){let n=Object.keys(t);Object.values(t).map(q).reduce((i,f,b)=>(i[n[b]]=f,i),{})}function g(t,e,n={},o,i={}){let f=o?R(o).reduce(V,{}):{},b=typeof e=="string"?D(e):e;return m(t,{construct:function(c){let a=r(this),k=a.renderer=new L(b,J({},i,{body:document.body,element:this,host:this,root:document.documentElement,shadow:c})),s=a.data={};c.append(k.content),n.construct&&n.construct.call(this,c,u(s),a)},connect:function(c){let a=r(this),{renderer:k,data:s}=a,l;for(l in o)l in s||(s[l]=f[l].default);F(this.dataset,s),a.data=u(s),n.connect&&n.connect.call(this,c,u(s),a),k.push(s)}},f,null,"")}var $=Object.assign,z={is:!0,loading:!0};var wt=Promise.resolve();function C(t){return!z[t.name]}function H(t,e){return C(e)&&(t[e.name]=e.value),t}var S={connect:function(){let t=r(this);if(!t.tag)throw new SyntaxError('<template is="literal-element"> must have an attribute tag="name-of-element"');let e=t.attributes?t.attributes.reduce(H,{}):d;t.src?t.src.then(n=>{let o=$({},n);delete o.default,g(t.tag,this,n.default||{},e,o)}):g(t.tag,this,{},e,{})}};var v=T(/^([\w-]+)(?:\s*:\s*(\w+))?\s*;?\s*/,{1:(t,e)=>(t.push({name:e[1]}),t),2:(t,e)=>{let n=x(t);return n.value=e[2],t},done:(t,e)=>e[0].length<e.input.length?v(t,e):t}),A=v;var I={tag:{attribute:function(t){let e=r(this);e.tag=t}},attributes:{attribute:function(t){let e=r(this);e.attributes=A([],t)}},src:{attribute:function(t){let e=r(this);e.src=import(N(t)).catch(n=>{throw new Error("<"+e.tag+'> not defined, failed to fetch src "'+t+'" '+n.message)})}}};var vt=m('<template is="literal-element">',S,I,null,"stephen.band/literal/");export{vt as default};

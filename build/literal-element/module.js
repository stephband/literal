/* Literal 
   0.8.0
   By Stephen Band
   Built 2023-12-16 23:49 */

import{a as I,b as r,c as m}from"../chunk-OUM6Y4HQ.js";import{f as O,g as p,h as d,k as u,o as x,p as j,r as D,t as v,u as E,v as L}from"../chunk-BWM56W5B.js";var B=Object.assign;function h(t,e){this.element=t,this.definitions=e,this.tokens=[]}B(h.prototype,{contains:function(t){return this.tokens.includes(t)},add:function(){let t=arguments.length;for(;t--;){let e=arguments[t];this.tokens.includes(e)||(this.tokens.push(e),this.supports(e)&&this.definitions[e].enable(this.element))}},remove:function(){let t=arguments.length;for(;t--;){let e=arguments[t];this.tokens.includes(e)&&(x(this.tokens,e),this.supports(e)&&this.definitions[e].disable(this.element))}},supports:function(t){return!!this.definitions&&!!this.definitions[t]}});var U=Array.prototype;function k(t,e){let n=t.tokens.slice(),i=U.slice.apply(e),o=n.length;for(;o--;)i.includes(n[o])&&n.splice(o,1);t.remove.apply(t,n),t.add.apply(t,i)}var G=/^\.*\/|^https?:\/\//,w=d((t,e,n)=>typeof n,{string:function(t,e,n){let i=r(e);return G.test(n)?E(n).then(o=>i.data[t]=o).catch(o=>console.error(o)):i.data[t]=JSON.parse(n),i.data},default:function(t,e,n){r(e)[t]=n}}),P=d((t,e)=>typeof e,{string:d((t,e)=>e,{attribute:t=>({attribute:function(e){r(this).data[t]=e}}),string:t=>({attribute:function(e){this[t]=e},get:function(){return r(this).data[t]},set:function(e){r(this).data[t]=e},default:""}),boolean:t=>({attribute:function(e){this[t]=e!==null},get:function(){return!!r(this).data[t]||!1},set:function(e){r(this).data[t]=!!e},default:!1}),number:t=>({attribute:function(e){this[t]=e},get:function(){return r(this).data[t]||0},set:function(e){r(this).data[t]=Number(e)},default:0}),tokens:t=>({attribute:function(e){this[t]=e||""},get:function(){let e=r(this);if(e[t])return e[t];let n=e[t]=new h;return e.data[t]=n.tokens=u(n.tokens),n},set:function(e){let n=this[t];k(n,(e+"").trim().split(/\s+/))},default:p}),src:t=>({attribute:function(e){this[t]=e},get:function(){return r(this).renderer.data[t]},set:function(e){w(t,this,e)},default:null}),module:t=>({attribute:function(e){this[t]=e},get:function(){return r(this).renderer.data[t]},set:function(e){w(t,this,e)},default:null}),json:t=>({attribute:function(e){this[t]=e},get:function(){return r(this).renderer.data[t]},set:function(e){w(t,this,e)},default:null}),default:(t,e)=>{throw new SyntaxError('Literal type not supported in attribute definition "'+t+":"+e+'"')}}),object:O(1),undefined:t=>({attribute:function(e){r(this).data[t]=e}})});var J=Object.assign,R=Object.entries;function V(t,e){return t[e[0]]=P(e[0],e[1]),t}function q(t){try{return JSON.parse(t)}catch{return t}}function F(t,e){let n=Object.keys(t);Object.values(t).map(q).reduce((o,f,b)=>(o[n[b]]=f,o),{})}function g(t,e,n={},i,o={}){let f=i?R(i).reduce(V,{}):{},b=typeof e=="string"?D(e):e;return m(t,{construct:function(c){let a=r(this),y=a.renderer=new L(b,this,J({},o,{host:this,shadow:c})),s=a.data={};c.append(y.content),n.construct&&n.construct.call(this,c,u(s),a)},connect:function(c){let a=r(this),{renderer:y,data:s}=a,l;for(l in i)l in s||(s[l]=f[l].default);F(this.dataset,s),a.data=u(s),n.connect&&n.connect.call(this,c,u(s),a),y.push(s)}},f,null,"")}var $=Object.assign,z={is:!0,loading:!0};var kt=Promise.resolve();function C(t){return!z[t.name]}function H(t,e){return C(e)&&(t[e.name]=e.value),t}var S={connect:function(){let t=r(this);if(!t.tag)throw new SyntaxError('<template is="literal-element"> must have an attribute tag="name-of-element"');let e=t.attributes?t.attributes.reduce(H,{}):p;t.src?t.src.then(n=>{let i=$({},n);delete i.default,g(t.tag,this,n.default||{},e,i)}):g(t.tag,this,{},e,{})}};var T=I(/^([\w-]+)(?:\s*:\s*(\w+))?\s*;?\s*/,{1:(t,e)=>(t.push({name:e[1]}),t),2:(t,e)=>{let n=j(t);return n.value=e[2],t},done:(t,e)=>e[0].length<e.input.length?T(t,e):t}),A=T;var N={tag:{attribute:function(t){let e=r(this);e.tag=t}},attributes:{attribute:function(t){let e=r(this);e.attributes=A([],t)}},src:{attribute:function(t){let e=r(this);e.src=import(v(t)).catch(n=>{throw new Error("<"+e.tag+'> not defined, failed to fetch src "'+t+'" '+n.message)})}}};var Tt=m('<template is="literal-element">',S,N,null,"stephen.band/literal/");export{Tt as default};

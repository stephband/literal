/* Literal 
   0.8.0
   By Stephen Band
   Built 2023-12-17 14:30 */

import{b as r,c as l}from"../chunk-XZJUXBZJ.js";import{c as o,j as c,k as p,u,v as h}from"../chunk-UP3ZNJNM.js";var d=Object.assign,b=Object.create;function g(t){t!==void 0&&(this.value=t)}function a(){this.push=g}a.prototype=d(b(p.prototype),{pipe:function(t){return c(this,t),this.value!==void 0&&t.push(this.value),delete this.push,t}});var N=/^(\{|\[)/,O=o;function w(t){return N.test(t)?JSON.parse(t):Number.isNaN(Number(t))?t==="true"?!0:t==="false"?!1:t:Number(t)}function S(t,e){let s=Object.keys(e),n=Object.values(e);t.push(n.map(w).reduce((i,f,m)=>(i[s[m]]=f,i),{}))}var W=l('<template is="literal-html">',{construct:function(){let t=r(this);t.initialised=!1,t.pushed=!1,t.datas=new a,t.renderer=new h(this,this.parentElement)},connect:function(t){let e=r(this);if(e.initialised)return;e.initialised=!0;let{datas:s,renderer:n}=e;s.each(i=>{n.push(i),e.pushed||(e.pushed=!0,this.replaceWith(n.content))}),!e.promise&&!e.pushed&&S(s,this.dataset)}},{src:{attribute:function(t){this.src=t},get:function(){return r(this).src},set:function(t){let e=r(this);e.src=t,e.promise&&(e.promise.cancelled=!0,e.promise=void 0);let s=e.promise=u(t).then(n=>{s.cancelled||(this.data=n)}).catch(n=>O(n,this))}},data:{attribute:function(t){try{this.data=JSON.parse(t)}catch{throw new Error('Invalid JSON in <template is="literal-template"> data attribute: "'+t+'"')}},get:function(){let t=r(this);return t.renderer?t.renderer.data:null},set:function(t){r(this).datas.push(t||null)}}},null,"stephen.band/literal/");export{W as default};
